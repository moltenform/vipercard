
/* auto */ import { O, UI512ErrorHandling, assertTrue, makeUI512Error, scontains, } from './../util/benBaseUtilsAssert';

/**
 * assert that an exception is thrown, with a certain message
 */
export async function assertThrowsAsync<T>(
    msgWithMark: string,
    expectedErr: string,
    fn: () => Promise<T>,
) {
    let msg: O<string>;
    let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow;
    UI512ErrorHandling.breakOnThrow = false;
    try {
        await fn();
    } catch (e) {
        msg = e.message ? e.message : '';
    } finally {
        UI512ErrorHandling.breakOnThrow = storedBreakOnThrow;
    }

    assertTrue(msg !== undefined, `JC|did not throw ${msgWithMark}`);
    assertTrue(
        msg !== undefined && scontains(msg, expectedErr),
        `JB|message "${msg}" did not contain "${expectedErr}" ${msgWithMark}`,
    );
}

/**
 * assert that an exception is thrown, with a certain message
 */
export function assertThrows(msgWithMark: string, expectedErr: string, fn: Function) {
    let msg: O<string>;
    let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow;
    try {
        UI512ErrorHandling.breakOnThrow = false;
        fn();
    } catch (e) {
        msg = e.message ? e.message : '';
    } finally {
        UI512ErrorHandling.breakOnThrow = storedBreakOnThrow;
    }

    assertTrue(msg !== undefined, `3{|did not throw ${msgWithMark}`);
    assertTrue(
        msg !== undefined && scontains(msg, expectedErr),
        `9d|message "${msg}" did not contain "${expectedErr}" ${msgWithMark}`,
    );
}

/**
 * test-only code, since this is inefficient
 */
export function sorted(ar: any[]) {
    let arCopy = ar.slice();
    arCopy.sort();
    return arCopy;
}

/**
 * if the debugger is set to All Exceptions,
 * you will see a lot of false positives
 */
export function notifyUserIfDebuggerIsSetToAllExceptions() {
    assertThrows('L||', 'intentionally throw', () => {
        throw makeUI512Error(`1!|It looks like the debugger is set to break
            on 'All Exceptions'... you probably want to turn this off because
            many tests intentionally throw exceptions.`);
    });
}

type VoidFn = () => void;
type AVoidFn = () => Promise<void>;

export class SimpleSensibleTestCategory {
    constructor(public name: string, public type: '' | 'async' | 'slow+async' = '') {}
    tests: [string, VoidFn | AVoidFn][] = [];
    _context = '';
    public test(s: string, fn: VoidFn) {
        assertTrue(!scontains(this.type, 'async'), 'Ot|');
        this.tests.push([s, fn]);
        return this;
    }
    public atest(s: string, fn: AVoidFn) {
        assertTrue(scontains(this.type, 'async'), 'Os|');
        this.tests.push([s, fn]);
        return this;
    }
    public say(context: string) {
        this._context = context;
        console.log('                      ' + this._context);
    }
}
