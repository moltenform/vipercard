
/* auto */ import { VpcBuiltinMsg, checkThrowInternal } from './vpcEnums';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { assertEq, fitIntoInclusive, getEnumToStrOrFallback, slength } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { UI512FontRequest } from './../../ui512/drawtext/ui512DrawTextFontRequest';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
 * dead-simple WritableContainer
 * we don't even care about formatted text, we're just using it
 * for the splice() implementation
 */
export class WritableContainerSimpleFmtText implements WritableContainer {
    txt = new FormattedText()
    isDefined(): boolean {
        return true
    }
    getRawString(): string {
        return this.txt.toUnformatted()
    }
    len(): number {
        return this.txt.len()
    }
    setAll(newText: string): void {
        this.txt = FormattedText.newFromUnformatted(newText)
    }
    splice(insertion: number, lenToDelete: number, newText: string): void {
        this.txt = FormattedText.byInsertion(this.txt, insertion, lenToDelete, newText, UI512FontRequest.defaultFont)
    }
    replaceAll(search: string, replaceWith: string): void {
        checkThrowInternal(false, "not yet implemented")
    }
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
            this.msgName = getEnumToStrOrFallback(VpcBuiltinMsg, handler, '');
            assertTrue(slength(this.msgName), '4i|got', this.msgName);
        }
    }
}

/**
 * for running code in the messagebox
 */
export class VpcScriptMessageMsgBoxCode extends VpcScriptMessage {
    returnToMsgBox = false;
    msgBoxCodeBody = '';
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
            assertWarn(false, 'KC|tried to set counter lower', n);
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
    CacheThisManyScripts = 20,
    MaxLocalVars = 256,
    MaxGlobalVars = 256,
    MaxStringLength = 64 * 1024,
    MaxVelChildren = 256,
    MaxObjectsInMsgChain = 128,
    LimitChevErrStringLen = 128
}

/**
 * the user can log to the message box
 */
export class LogToReplMsgBox {
    static redirectThisVariableToMsgBox = 'vpc__internal__msgbox';
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
            return undefined;
        } else {
            return this.list[this.pointer];
        }
    }

    /**
     * user pressed up, like pressing arrow key up in bash
     */
    walkPrevious(fallback: () => string) {
        this.pointer -= 1;
        let ret = this.getAt();
        return ret ?? fallback();
    }

    /**
     * user pressed down, like pressing arrow key up in bash
     */
    walkNext(fallback: () => string) {
        this.pointer += 1;
        let ret = this.getAt();
        return ret ?? fallback();
    }

    /**
     * you can reject candidates
     */
    walkPreviousWhileAcceptible(fallback: () => string, isAccepted: (s: string) => boolean) {
        while (true) {
            let cand = this.walkPrevious(fallback);
            if (isAccepted(cand)) {
                return cand;
            } else if (this.pointer <= 0) {
                return fallback();
            }
        }
    }

    /**
     * you can reject candidates
     */
    walkNextWhileAcceptible(fallback: () => string, isAccepted: (s: string) => boolean) {
        while (true) {
            let cand = this.walkNext(fallback);
            if (isAccepted(cand)) {
                return cand;
            } else if (this.pointer >= this.list.length - 1) {
                return fallback();
            }
        }
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

    /**
     * pop from the list
     */
    pop(fallback: () => string): string {
        if (!this.list.length) {
            return fallback();
        } else {
            return this.list.pop() ?? fallback();
        }
    }
}
