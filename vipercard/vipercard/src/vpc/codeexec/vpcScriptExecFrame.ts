
/* auto */ import { O, assertTrue, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { CodeLimits, VpcScriptMessage } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcVal } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VarCollection } from '../../vpc/vpcutils/vpcVarCollection.js';
/* auto */ import { VpcLineCategory } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { VpcCodeOfOneVel } from '../../vpc/codepreparse/vpcAllCode.js';

export class CodeExecFrame {
    locals = new VarCollection(CodeLimits.MaxLocalVars, 'local');
    codeSection: VpcCodeOfOneVel;
    protected _offset: number;
    offsetsMarked: { [offset: number]: boolean } = {};
    declaredGlobals: { [varName: string]: boolean } = {};
    args: VpcVal[] = [];
    currentHandler: O<number>;
    constructor(public handlerName: string, public message: VpcScriptMessage) {
        /* make special locals */
        this.locals.set('$result', VpcVal.Empty);
        this.locals.set('it', VpcVal.Empty);
        assertTrue(!!this.message, '5N|message is null');
    }

    get offset() {
        return this._offset;
    }

    next() {
        this._offset += 1;
        checkThrow(this._offset < this.codeSection.lines.length, '7n|went past end of code');
        checkThrow(
            this.codeSection.lines[this.offset].ctg !== VpcLineCategory.HandlerStart,
            '7m|we should never walk onto a handler start'
        );
    }

    /* in the past, I checked if we were jumping backwards, */
    /* and if so, reset all of the offsetsMarkedAsComplete. */
    /* I think it is safe to instead reset during the first if statement, though. */
    jumpToOffset(newOffset: number, okToStartHandler?: boolean) {
        this._offset = newOffset;
        checkThrow(this._offset < this.codeSection.lines.length, '7l|went past end of code');
        checkThrow(
            okToStartHandler || this.codeSection.lines[this.offset].ctg !== VpcLineCategory.HandlerStart,
            '7k|we should never walk onto a handler start'
        );

        /* make sure we did not jump into a different handler */
        let next = this.codeSection.determineHandlerFromOffset(this._offset);
        checkThrow(next !== -1, '7j|could not determine handler', next);
        if (this.currentHandler === undefined) {
            this.currentHandler = next;
        } else {
            checkThrow(next === this.currentHandler, '7i|we somehow jumped into an entirely different handler', next);
            this.currentHandler = next;
        }
    }
}
