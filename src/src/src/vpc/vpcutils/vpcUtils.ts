
/* auto */ import { UI512AttachableErr, assertTrueWarn } from '../../ui512/utils/utilsAssert.js';

export interface ReadableContainer {
    isDefined(): boolean;
    getRawString(): string;
    len(): number;
}

export interface WritableContainer extends ReadableContainer {
    setAll(newtext: string): void;
    splice(insertion: number, lenToDelete: number, newtext: string): void;
}

export class VpcScriptErrorBase implements UI512AttachableErr {
    isVpcScriptErrorBase = true;
    velid = '';
    lineNumber = -1;
    details = '';
    lineData: any;
    e: any;
    isScriptException = true;
    isExternalException = false;
}

export class VpcScriptRuntimeError extends VpcScriptErrorBase {
    isVpcScriptRuntimeError = true;
    callstack = [];
}

export class VpcScriptSyntaxError extends VpcScriptErrorBase {
    isVpcScriptSyntaxError = true;
}

export interface CountNumericId {
    next(): number;
    nextAsStr(): string;
}

export class CountNumericIdLinked implements CountNumericId {
    constructor(protected fn: () => number) {}
    next() {
        return this.fn();
    }
    nextAsStr() {
        return this.fn().toString();
    }
}

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
            assertTrueWarn(false, 'tried to set counter lower', n);
        }
    }
}

export enum CodeLimits {
    MaxCustomFnCallsAllowedInLine = 100,
    MaxTokensInLine = 512,
    MaxLinesInScript = 32 * 1024,
    MaxCodeFrames = 1000,
    CacheThisManyParsedLines = 10 * 1000,
    MaxLocalVars = 128,
    MaxGlobalVars = 128,
    MaxStringLength = 64 * 1024,
    MaxVelChildren = 256,
    LimitChevErr = 128,
    MaxStackNameLen = 256
}
