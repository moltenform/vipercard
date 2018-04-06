
/* auto */ import { assertTrueWarn } from '../../ui512/utils/utilsAssert.js';

export interface ReadableContainer {
    isDefined(): boolean;
    getRawString(): string;
    len(): number;
}

export interface WritableContainer extends ReadableContainer {
    setAll(newtext: string): void;
    splice(insertion: number, lenToDelete: number, newtext: string): void;
}

export class VpcScriptErrorBase {
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
    maxCustomFnCallsAllowedInLine = 100,
    maxTokensInLine = 512,
    maxLinesInScript = 32 * 1024,
    maxCodeFrames = 1000,
    cacheThisManyParsedLines = 10 * 1000,
    maxLocalVars = 128,
    maxGlobalVars = 128,
    maxStringLength = 64 * 1024,
    maxVelChildren = 256,
    limitChevErr = 128,
    maxStackNameLen = 256,
}
