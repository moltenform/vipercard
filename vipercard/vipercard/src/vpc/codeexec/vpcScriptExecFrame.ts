
/* auto */ import { VarCollection } from './../vpcutils/vpcVarCollection';
/* auto */ import { VpcVal } from './../vpcutils/vpcVal';
/* auto */ import { CodeLimits, VpcScriptMessage } from './../vpcutils/vpcUtils';
/* auto */ import { VpcParsedCodeCollection } from './../codepreparse/vpcTopPreparse';
/* auto */ import { LoopLimit, VpcLineCategory } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './../vel/velStack';
/* auto */ import { VpcElProductOpts } from './../vel/velProductOpts';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { O, bool } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/* see the section in internaldocs.md to read how we execute code. */

/**
 * why do frames require a value for both "me" and "parent"?
 * when executing code dynamically with 'send',
 * we set the "parent" to be the same as "me" so that it can
 * access the methods there.
 *
 * the dynamicCodeOrigin is used to show better error messages
 * when code is sent from "do", "send", or the message box.
 * in those cases if an error occurs it's not correct
 * to say the error occurred in the temporary location,
 * we should instead point to the offending send statement.
 */

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
        public dynamicCodeOrigin: O<[string, number]>,
        tmpOutside: OutsideWorldReadWrite
    ) {
        /* make special locals */
        this.locals.set('$result', VpcVal.Empty);
        this.locals.set('it', VpcVal.Empty);
        assertTrue(this.message, '5N|message is null');
        this.messageChain = VpcExecFrame.getMessageChain(meId, statedParentId, tmpOutside);
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
        checkThrow(this.offset < this.codeSection.lines.length, '7n|went past end of code');
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
        checkThrow(this.offset < this.codeSection.lines.length, '7l|went past end of code');
        checkThrow(
            bool(okToStartHandler) || this.codeSection.lines[this.offset].ctg !== VpcLineCategory.HandlerStart,
            '7k|we should never walk onto a handler start'
        );

        /* make sure we did not jump into a different handler */
        let next = this.codeSection.determineHandlerFromOffset(this.offset);
        checkThrow(next !== -1, '7j|could not determine handler', next);
        if (this.currentHandler === undefined) {
            this.currentHandler = next;
        } else {
            checkThrow(next === this.currentHandler, '7i|jumping into a different handler is not allowed', next);
            this.currentHandler = next;
        }
    }

    /**
    get the message chain.
    we need to precompute the message chain in advance,
    consider this case:
        cd 4 has a doCardThing handler
        you are on cd 1 and click a button that does this:
        send "myMessage" to btn 1 of cd 4
        btn 1's myMessage handler says
            delete btn 1 of cd 4
            doCardThing

        if we hadn't precomputed the message chain, it would
        be hard to know how doCardThing would reach the right target.

    i confirmed in the product that the message chain is about
    the parent card, not the current card.

    Note the "stated parent", it let's us have snippets of code that run
    in the context of an element's script,
    but aren't actually in that script.
     */
    static getMessageChain(velId: string, statedParent: O<string>, outside: OutsideWorldReadWrite): string[] {
        let ret: string[] = [];
        let vel = outside.Model().findByIdUntyped(velId);
        let haveUsedStatedParent = false;
        let hasSeenStack = false;
        let hasSeenProduct = false;
        if (!vel && statedParent) {
            vel = outside.Model().findByIdUntyped(statedParent);
            haveUsedStatedParent = true;
        }

        let loop = new LoopLimit(CodeLimits.MaxObjectsInMsgChain, 'maxObjectsInMsgChain');
        while (loop.next()) {
            if (!vel) {
                break;
            }

            if (vel instanceof VpcElStack) {
                hasSeenStack = true;
            } else if (vel instanceof VpcElProductOpts) {
                hasSeenProduct = true;
            }

            ret.push(vel.idInternal);
            if (!haveUsedStatedParent && statedParent && outside.Model().findByIdUntyped(statedParent)) {
                vel = outside.Model().findByIdUntyped(statedParent);
                haveUsedStatedParent = true;
            } else {
                vel = outside.Model().findByIdUntyped(vel.parentIdInternal);
            }
        }

        if (!hasSeenStack) {
            ret.push(outside.Model().stack.idInternal);
        }
        if (!hasSeenProduct) {
            ret.push(outside.Model().productOpts.idInternal);
        }

        return ret;
    }
}
