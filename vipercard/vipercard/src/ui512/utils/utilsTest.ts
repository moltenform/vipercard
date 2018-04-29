
/* auto */ import { O, UI512ErrorHandling, assertTrue, makeVpcScriptErr, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';

/**
 * base class for tests
 */
export class UI512TestBase {
    tests: (string | Function)[] = [];
    inited = false;

    /**
     * tests can put initialization logic in this method
     */
    init() {
        this.inited = true;
    }

    /**
     * walk through list of tests
     * the list alternates between string and function.
     */
    getAllTests(listNames: string[], listTests: Function[], listInstances: UI512TestBase[]) {
        let checkDuplicateNames: { [name: string]: boolean } = {};
        assertTrue(this.tests.length % 2 === 0, '3~|list must alternate between str and function');
        for (let i = 0; i < this.tests.length; i += 2) {
            let name = this.tests[i];
            let test = this.tests[i + 1];
            if (typeof name === 'string' && typeof test === 'function') {
                assertTrue(checkDuplicateNames[name] === undefined, name, '3}|');
                checkDuplicateNames[name] = true;
                listNames.push(name);
                listTests.push(test);
                listInstances.push(this);
            } else {
                assertTrue(false, name + ' ' + test, '3||list must alternate between str and function');
            }
        }
    }

    /**
     * certain tests are labeled as slow and are skipped by default,
     * press cmd-shift-alt-t to include these tests, see 'all' parameter.
     */
    static slowTests: { [key: string]: boolean } = {
        'async/Text Core Fonts': true,
        'async/Text All Fonts': true
    };

    /**
     * run fnCb after fnAsync has completed
     */
    protected static async runAsyncThenCallback(fnAsync: () => Promise<void>, fnCb: () => void) {
        await fnAsync();
        fnCb();
    }

    /**
     * tests are run in a chain of functions,
     * the end of each test ends up calling runNextTest(),
     * this makes it simple to test async calls.
     */
    protected static runNextTestImpl(
        listNames: string[],
        listTests: Function[],
        listInstances: UI512TestBase[],
        runAllTests: boolean,
        index: number
    ) {
        if (index >= listTests.length) {
            console.log(`${listTests.length + 1}/${listTests.length + 1} all tests complete!`);
        } else if (!runAllTests && UI512TestBase.slowTests[listNames[index]]) {
            console.log(`skipping a test suite ${listNames[index]} because it is 'slow'`);

            /* use setTimeout instead of directly recursing, just so we avoid hitting any type of stack size limit. */
            setTimeout(() => {
                UI512TestBase.runNextTest(listNames, listTests, listInstances, runAllTests, index + 1);
            }, 1);
        } else {
            console.log(`${index + 1}/${listTests.length + 1} starting ${listNames[index]}`);
            let nextTest = index + 1;
            listInstances[index].init();
            if (listNames[index].startsWith('async/')) {
                /* it's an async test */
                let runNextTest = () => {
                    UI512TestBase.runNextTest(listNames, listTests, listInstances, runAllTests, nextTest);
                };

                let beginTest = () => UI512TestBase.runAsyncThenCallback(listTests[index] as any, runNextTest);
                UI512BeginAsync(beginTest, undefined, true);
            } else {
                listTests[index]();

                /* use setTimeout instead of directly recursing, just so we avoid hitting any type of stack size limit. */
                setTimeout(() => {
                    UI512TestBase.runNextTest(listNames, listTests, listInstances, runAllTests, nextTest);
                }, 1);
            }
        }
    }

    /**
     * ensure that runningTests isn't left on.
     */
    static runNextTest(
        listNames: string[],
        listTests: Function[],
        listInstances: UI512TestBase[],
        runAllTests: boolean,
        index: number
    ) {
        try {
            UI512ErrorHandling.runningTests = true;
            UI512TestBase.runNextTestImpl(listNames, listTests, listInstances, runAllTests, index);
        } finally {
            UI512ErrorHandling.runningTests = false;
        }
    }

    /**
     * run all registered tests.
     */
    static runTestsArray(registeredTests: (() => UI512TestBase)[], runAllTests = true) {
        console.log('gathering tests...');
        UI512TestBase.notifyUserIfDebuggerIsSetToAllExceptions();
        let listNames: string[] = [];
        let listTests: Function[] = [];
        let listInstances: UI512TestBase[] = [];
        for (let fn of registeredTests) {
            let testInstance = fn();
            if (testInstance && testInstance instanceof UI512TestBase) {
                testInstance.getAllTests(listNames, listTests, listInstances);
            }
        }

        console.log('starting tests...');
        UI512TestBase.runNextTest(listNames, listTests, listInstances, runAllTests, 0);
    }

    /**
     * if the debugger is set to All Exceptions,
     * you will see a lot of false positives
     */
    static notifyUserIfDebuggerIsSetToAllExceptions() {
        assertThrows('', 'intentionally throw', () => {
            throw makeVpcScriptErr(`1!|It looks like the debugger is set to break on 'All Exceptions'...
                you probably want to turn this off because many tests intentionally throw exceptions.`);
        });
    }
}

/**
 * assert that an exception is thrown, with a certain message
 */
export async function assertThrowsAsync<T>(tagMsg: string, expectedErr: string, fn: () => Promise<T>) {
    let msg: O<string>;
    try {
        UI512ErrorHandling.breakOnThrow = false;
        await fn();
    } catch (e) {
        msg = e.message ? e.message : '';
    } finally {
        UI512ErrorHandling.breakOnThrow = true;
    }

    assertTrue(msg !== undefined, `did not throw ${tagMsg}`);
    assertTrue(
        msg !== undefined && scontains(msg, expectedErr),
        `message "${msg}" did not contain "${expectedErr}" ${tagMsg}`
    );
}

/**
 * assert that an exception is thrown, with a certain message
 */
export function assertThrows(tagMsg: string, expectedErr: string, fn: Function) {
    let msg: O<string>;
    try {
        UI512ErrorHandling.breakOnThrow = false;
        fn();
    } catch (e) {
        msg = e.message ? e.message : '';
    } finally {
        UI512ErrorHandling.breakOnThrow = true;
    }

    assertTrue(msg !== undefined, `3{|did not throw ${tagMsg}`);
    assertTrue(
        msg !== undefined && scontains(msg, expectedErr),
        `9d|message "${msg}" did not contain "${expectedErr}" ${tagMsg}`
    );
}
