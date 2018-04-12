
/* auto */ import { UI512AttachableErr, assertTrueWarn } from '../../ui512/utils/utilsAssert.js';

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
    setAll(newtext: string): void;
    splice(insertion: number, lenToDelete: number, newtext: string): void;
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
    callstack = [];
}

/**
 * script "syntax" error, meaning error happened prior to execution
 */
export class VpcScriptSyntaxError extends VpcScriptErrorBase {
    isVpcScriptSyntaxError = true;
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
            assertTrueWarn(false, 'tried to set counter lower', n);
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
    LimitChevErr = 128,
    MaxStackNameLen = 256
}
