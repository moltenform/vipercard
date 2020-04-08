
/* auto */ import { VarCollection } from './../vpcutils/vpcVarCollection';
/* auto */ import { VpcVal } from './../vpcutils/vpcVal';
/* auto */ import { CodeLimits, VpcScriptMessage } from './../vpcutils/vpcUtils';
/* auto */ import { VpcParsedCodeCollection } from './../codepreparse/vpcTopPreparse';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { LoopLimit, VpcLineCategory } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { OrdinalOrPosition, VpcElType } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './../vel/velStack';
/* auto */ import { VpcElProductOpts } from './../vel/velProductOpts';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { O, assertTrue, bool, checkThrow, throwIfUndefined } from './../../ui512/utils/util512Assert';

/**
 * an "execution frame"
 * holding local variables and the offset to the current line of code
 */
export class VpcExecFrame {
    locals = new VarCollection(CodeLimits.MaxLocalVars, 'local');
    codeSection: VpcParsedCodeCollection;
    declaredGlobals: { [varName: string]: boolean } = {};
    args: VpcVal[] = [];
    currentHandler: O<number>;
    messageChain: string[];
    protected offset: number;
    constructor(
        public handlerName: string,
        public message: VpcScriptMessage,
        public meId: string,
        public statedParentId: O<string>,
        tmpOutside: OutsideWorldReadWrite
    ) {
        /* why require a value for "me" and "parent"?
        when executing code dynamically with 'send',
        "me" and "parent" might be the same.
        */
        /* make special locals */
        this.locals.set('$result', VpcVal.Empty);
        this.locals.set('it', VpcVal.Empty);
        assertTrue(bool(this.message), '5N|message is null');
        this.messageChain = VpcExecFrame.getMessageChain(
            meId,
            statedParentId,
            tmpOutside
        );
    }

    /* use to mark when a branch has been taken */
    offsetsMarked: { [offset: number]: boolean } = {};

    /**
     * get offset (index within codeSection of the current line of code)
     */
    getOffset() {
        return this.offset;
    }

    /**
     * advance to the next line of code
     */
    next() {
        this.offset += 1;
        checkThrow(
            this.offset < this.codeSection.lines.length,
            '7n|went past end of code'
        );
        checkThrow(
            this.codeSection.lines[this.offset].ctg !== VpcLineCategory.HandlerStart,
            '7m|we should never walk onto a handler start'
        );
    }

    /**
     * set the instruction pointer, jumping to another line of code
     */
    jumpToOffset(newOffset: number, okToStartHandler?: boolean) {
        this.offset = newOffset;
        checkThrow(
            this.offset < this.codeSection.lines.length,
            '7l|went past end of code'
        );
        checkThrow(
            bool(okToStartHandler) ||
                this.codeSection.lines[this.offset].ctg !== VpcLineCategory.HandlerStart,
            '7k|we should never walk onto a handler start'
        );

        /* make sure we did not jump into a different handler */
        let next = this.codeSection.determineHandlerFromOffset(this.offset);
        checkThrow(next !== -1, '7j|could not determine handler', next);
        if (this.currentHandler === undefined) {
            this.currentHandler = next;
        } else {
            checkThrow(
                next === this.currentHandler,
                '7i|jumping into a different handler is not allowed',
                next
            );
            this.currentHandler = next;
        }
    }

    /**
    get the message chain.
    edge case. send "foo" to btn 2
    btn 2 then deletes itself.
    btn 2 then calls doCardThing
    doCardThing fails because the message chain is broken.
    so should i evaluate the message chain as part of the frame?
    maybe so!
     */
    /**
    get message chain
    the stated parent let's us have snippets of code that run in the context of an element's script,
    but aren't actually in that script.
     */
    static getMessageChain(
        velId: string,
        statedParent: O<string>,
        outside: OutsideWorldReadWrite
    ): string[] {
        let ret: string[] = [];
        let vel = outside.FindVelById(velId);
        let haveUsedStatedParent = false;
        let hasSeenStack = false;
        let hasSeenProduct = false;
        if (!vel && statedParent) {
            vel = outside.FindVelById(statedParent);
            haveUsedStatedParent = true;
        }
        /*
        running code on a deleted object can happen: such as in an ondelete message.
        in such cases this is a break in the chain--another good reason why we have a
        statedParent. let's also, though, make sure the stack and product are in the chain
        for the case where we're running code in and the background that has just been deleted.
        */

        let loop = new LoopLimit(CodeLimits.MaxObjectsInMsgChain, 'maxObjectsInMsgChain');
        while (loop.next()) {
            if (!vel) {
                if (!hasSeenStack) {
                    let r = new RequestedVelRef(VpcElType.Stack);
                    r.lookByRelative = OrdinalOrPosition.This;
                    ret.push(throwIfUndefined(outside.ResolveVelRef(r)[0], '').id);
                }
                if (!hasSeenProduct) {
                    let r = new RequestedVelRef(VpcElType.Product);
                    r.lookByRelative = OrdinalOrPosition.This;
                    ret.push(throwIfUndefined(outside.ResolveVelRef(r)[0], '').id);
                }
                return ret;
            }

            if ((vel as VpcElStack).isVpcElStack) {
                hasSeenStack = true;
            } else if ((vel as VpcElProductOpts).isVpcElProductOpts) {
                hasSeenProduct = true;
            }

            ret.push(vel.id);
            if (
                !haveUsedStatedParent &&
                statedParent &&
                outside.FindVelById(statedParent)
            ) {
                vel = outside.FindVelById(statedParent);
                haveUsedStatedParent = true;
            } else {
                vel = outside.FindVelById(vel.parentId);
            }
        }
        checkThrow(false, 'not reached.');
    }
}
