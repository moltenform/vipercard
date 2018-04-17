
/* auto */ import { O, assertTrue, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { CodeLimits, VpcScriptMessage } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcVal } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VarCollection } from '../../vpc/vpcutils/vpcVarCollection.js';
/* auto */ import { VpcLineCategory } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { VpcCodeOfOneVel } from '../../vpc/codepreparse/vpcAllCode.js';

/**
 * an "execution frame"
 * holding local variables and the offset to the current line of code
 */
export class VpcExecFrame {
    locals = new VarCollection(CodeLimits.MaxLocalVars, 'local');
    codeSection: VpcCodeOfOneVel;
    declaredGlobals: { [varName: string]: boolean } = {};
    args: VpcVal[] = [];
    currentHandler: O<number>;
    protected offset: number;
    constructor(public handlerName: string, public message: VpcScriptMessage) {
        /* make special locals */
        this.locals.set('$result', VpcVal.Empty);
        this.locals.set('it', VpcVal.Empty);
        assertTrue(!!this.message, '5N|message is null');
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
            okToStartHandler || this.codeSection.lines[this.offset].ctg !== VpcLineCategory.HandlerStart,
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
}
