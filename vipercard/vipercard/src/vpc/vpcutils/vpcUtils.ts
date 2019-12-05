
/* auto */ import { VpcBuiltinMsg } from './vpcEnums';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { O, UI512AttachableErr, assertTrue, assertTrueWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { assertEq, fitIntoInclusive, getEnumToStrOrUnknown, slength } from './../../ui512/utils/util512';

/**
 * container that can be read from.
 * for example, a field is a readable container because you can say
 * put cd fld "fld1" into x
 */
export interface ReadableContainer {
    isDefined(): boolean;
    getRawString(): string;
    len(): number;
}

/**
 * container that you can write to.
 * for example, a field is a writable container because you can say
 * put "abc" into cd fld "fld1"
 */
export interface WritableContainer extends ReadableContainer {
    setAll(newText: string): void;
    splice(insertion: number, lenToDelete: number, newText: string): void;
    replaceAll(search: string, replaceWith: string): void;
}

/**
 * base class for script error
 */
export class VpcScriptErrorBase implements UI512AttachableErr {
    isVpcScriptErrorBase = true;
    velId = '';
    lineNumber = -1;
    details = '';
    lineData: any;
    e: any;
    isScriptException = true;
    isExternalException = false;
}

/**
 * a script "runtime" error, meaning error happened during execution
 */
export class VpcScriptRuntimeError extends VpcScriptErrorBase {
    isVpcScriptRuntimeError = true;
}

/**
 * script "syntax" error, meaning error happened prior to execution
 */
export class VpcScriptSyntaxError extends VpcScriptErrorBase {
    isVpcScriptSyntaxError = true;
}

/**
 * a message sent to a script
 * includes both built-in messages "mouseUp" and custom messages "myHandler"
 */
export class VpcScriptMessage {
    clickLoc: O<number[]>;
    keyMods: O<ModifierKeys>;
    keyChar: O<string>;
    keyRepeated: O<boolean>;
    cmdKey: O<boolean>;
    optionKey: O<boolean>;
    shiftKey: O<boolean>;
    mouseLoc: number[] = [-1, -1];
    mouseIsDown = false;
    msg: VpcBuiltinMsg;
    msgName: string;
    cardWhenFired: O<string>;
    causedByUserAction = false;
    constructor(public targetId: string, handler: VpcBuiltinMsg, msgName?: string) {
        /* parse the message name to see if it is a built-in like mouseUp */
        if (msgName) {
            assertEq(VpcBuiltinMsg.__Custom, handler, '4j|');
            this.msg = handler;
            this.msgName = msgName;
        } else {
            this.msg = handler;
            this.msgName = getEnumToStrOrUnknown(VpcBuiltinMsg, handler, '');
            assertTrue(slength(this.msgName), '4i|got', this.msgName);
        }
    }
}

/**
 * a provider of unique numeric ids
 */
export interface CountNumericId {
    next(): number;
    nextAsStr(): string;
}

/**
 * a provider of unique numeric ids, counts upwards 1 at a time
 */
export class CountNumericIdNormal implements CountNumericId {
    constructor(protected counter = 1000) {}
    next() {
        let ret = this.counter;
        this.counter += 1;
        return ret;
    }

    nextAsStr() {
        return this.next().toString();
    }

    setCounter(n: number) {
        if (n >= this.counter) {
            this.counter = n;
        } else {
            assertTrueWarn(false, 'KC|tried to set counter lower', n);
        }
    }
}

/**
 * code limits
 * you shouldn't be able to create a stack that causes a
 * huge amount of memory to be allocated.
 */
export enum CodeLimits {
    MaxCustomFnCallsAllowedInLine = 100,
    MaxTokensInLine = 512,
    MaxLinesInScript = 32 * 1024,
    MaxCodeFrames = 1000,
    CacheThisManyParsedLines = 10 * 1000,
    MaxLocalVars = 256,
    MaxGlobalVars = 256,
    MaxStringLength = 64 * 1024,
    MaxVelChildren = 256,
    MaxObjectsInMsgChain = 128,
    LimitChevErr = 128,
    MaxStackNameLen = 256
}

/**
 * the user can log to the message box
 */
export class LogToReplMsgBox {
    static redirectThisVariableToMsgBox = 'vpc__internal__msgbox';

    static processScript(script: string) {
        /* warning: also replaces within string literals */
        script = script.replace(
            /\b(the )?(message|msg) (box|window)\b/g,
            LogToReplMsgBox.redirectThisVariableToMsgBox
        );
        return script;
    }
}

/**
 * record what you submit to the repl, for history
 */
export class RememberHistory {
    pointer = 0;
    keepBeforeEnd = false;
    list: string[] = [];

    /**
     * get the history at the current point
     */
    protected getAt() {
        this.pointer = fitIntoInclusive(this.pointer, 0, this.list.length);
        if (this.pointer >= this.list.length) {
            return '';
        } else {
            return this.list[this.pointer];
        }
    }

    /**
     * user pressed up, like pressing arrow key up in bash
     */
    walkPrevious() {
        this.pointer -= 1;
        return this.getAt();
    }

    /**
     * user pressed down, like pressing arrow key up in bash
     */
    walkNext() {
        this.pointer += 1;
        return this.getAt();
    }

    /**
     * add to the list
     */
    append(s: string) {
        this.list.push(s);
        if (this.keepBeforeEnd) {
            this.pointer = this.list.length - 1;
        } else {
            this.pointer = this.list.length;
        }
    }
}
