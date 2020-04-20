
/* auto */ import { AsyncFn, VoidFn } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { UI512ErrorHandling, assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, util512Sort } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * assert that an exception is thrown, with a certain message
 */
export async function assertThrowsAsync<T>(
    msgWithMark: string,
    expectedErr: string,
    fn: () => Promise<T>
) {
    let msg: O<string>;
    try {
        await fn();
    } catch (e) {
        msg = e.message ? e.message : '';
    }

    assertTrue(msg !== undefined, `JC|did not throw ${msgWithMark}`);
    assertTrue(
        msg !== undefined && msg.includes(expectedErr),
        `JB|message "${msg}" did not contain "${expectedErr}" ${msgWithMark}`
    );
}

/**
 * assert that an exception is thrown, with a certain message
 */
export function assertThrows(msgWithMark: string, expectedErr: string, fn: VoidFn) {
    let msg: O<string>;

    try {
        fn();
    } catch (e) {
        msg = e.message ?? '';
    }

    assertTrue(msg !== undefined, `3{|did not throw`, msgWithMark);
    assertTrue(
        msg !== undefined && msg.includes(expectedErr),
        `9d|message "${msg}" did not contain "${expectedErr}"`,
        msgWithMark
    );
}

/**
 * assert that an assertion is thrown
 */
export function assertAsserts(msgWithMark: string, expectedErr: string, fn: VoidFn) {
    let msg: O<string>;
    let svd = UI512ErrorHandling.silenceAssertMsgs;
    UI512ErrorHandling.silenceAssertMsgs = true;
    try {
        fn();
    } catch (e) {
        msg = e.message ?? '';
    } finally {
        UI512ErrorHandling.silenceAssertMsgs = svd;
    }

    assertTrue(msg !== undefined, `3{|did not throw`, msgWithMark);
    assertTrue(
        msg.toLowerCase().includes('assert:'),
        `not an assertion exception`,
        msgWithMark
    );
    assertTrue(
        msg !== undefined && msg.includes(expectedErr),
        `9d|message "${msg}" did not contain "${expectedErr}"`,
        msgWithMark
    );
}

/**
 * test-only code, since this is inefficient
 */
export function sorted(ar: any[]) {
    let arCopy = ar.slice();
    arCopy.sort(util512Sort);
    return arCopy;
}

/**
 * test-only code, to avoid type casts
 */
export function YetToBeDefinedTestHelper<T>(): T {
    return (undefined as any) as T;
}

/**
 * if the debugger is set to All Exceptions,
 * you will see a lot of false positives
 */
export function notifyUserIfDebuggerIsSetToAllExceptions() {
    assertThrows('L||', 'intentionally throw', () => {
        throw new Error(
            `1!|It looks like the debugger is set to break
            on 'All Exceptions'... you probably want to turn this off because
            many tests intentionally throw exceptions.`
        );
    });
}

/**
 * a collection of tests
 */
export class SimpleUtil512TestCollection {
    constructor(public name: string, public slow = false) {}
    tests: [string, VoidFn][] = [];
    atests: [string, AsyncFn][] = [];
    _context = '';

    /**
     * add a non-async test to the collection
     */
    public test(s: string, fn: VoidFn) {
        this.tests.push([s, fn]);
        return this;
    }

    /**
     * add an async test to the collection
     */
    public atest(s: string, fn: AsyncFn) {
        this.atests.push([s, fn]);
        return this;
    }

    /**
     * writes a string to the console,
     * often used to indicate that a test is divided into subtests.
     */
    public say(context: string) {
        this._context = context;
        console.log(Util512.repeat(25, ' ').join('') + this._context);
    }
}
