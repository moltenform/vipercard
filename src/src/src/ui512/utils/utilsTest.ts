
/* auto */ import { O, UI512ErrorHandling, assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';

export class Tests_BaseClass {
    inited = false;
    init() {
        this.inited = true;
    }

    tests: (string | Function)[] = [];

    getAllTests(listNames: string[], listTests: Function[], listInstances: Tests_BaseClass[]) {
        let testNamesUsed: { [name: string]: boolean } = {};
        assertTrue(this.tests.length % 2 === 0, '3~|invalid test structure');
        for (let i = 0; i < this.tests.length; i += 2) {
            let name = this.tests[i];
            let test = this.tests[i + 1];
            if (typeof name === 'string' && typeof test === 'function') {
                assertTrue(testNamesUsed[name] === undefined, name, '3}|');
                testNamesUsed[name] = true;
                listNames.push(name);
                listTests.push(test);
                listInstances.push(this);
            } else {
                assertTrue(false, name + ' ' + test, '3||');
            }
        }
    }

    assertThrows(tagmsg: string, expectederr: string, fn: Function) {
        return Tests_BaseClass.assertThrows(tagmsg, expectederr, fn);
    }

    static assertThrows(tagmsg: string, expectederr: string, fn: Function) {
        let msg: O<string>;
        try {
            UI512ErrorHandling.breakOnThrow = false;
            fn();
        } catch (e) {
            msg = e.message ? e.message : '';
        } finally {
            UI512ErrorHandling.breakOnThrow = true;
        }

        assertTrue(msg !== undefined, `3{|did not throw ${tagmsg}`);
        assertTrue(
            msg !== undefined && scontains(msg, expectederr),
            `9d|message "${msg}" did not contain "${expectederr}" ${tagmsg}`
        );
    }

    static slowTests: { [key: string]: boolean } = {
        'callback/Text Core Fonts': true,
        'callback/Text All Fonts': true,
    };

    static runNextTest(
        root: Root,
        listNames: string[],
        listTests: Function[],
        listInstances: Tests_BaseClass[],
        all: boolean,
        index: number
    ) {
        try {
            UI512ErrorHandling.runningTests = true;
            Tests_BaseClass.runNextTestImpl(root, listNames, listTests, listInstances, all, index);
        } finally {
            UI512ErrorHandling.runningTests = false;
        }
    }

    protected static runNextTestImpl(
        root: Root,
        listNames: string[],
        listTests: Function[],
        listInstances: Tests_BaseClass[],
        all: boolean,
        index: number
    ) {
        if (index >= listTests.length) {
            console.log(`${listTests.length + 1}/${listTests.length + 1} all tests complete!`);
        } else if (!all && Tests_BaseClass.slowTests[listNames[index]]) {
            console.log(`skipping a test suite ${listNames[index]} because it is 'slow'`);
            let nextTest = index + 1;
            setTimeout(() => {
                Tests_BaseClass.runNextTest(root, listNames, listTests, listInstances, all, nextTest);
            }, 1);
        } else {
            console.log(`${index + 1}/${listTests.length + 1} starting ${listNames[index]}`);
            let nextTest = index + 1;
            listInstances[index].init();
            if (listNames[index].startsWith('callback/')) {
                listTests[index](root, () => {
                    Tests_BaseClass.runNextTest(root, listNames, listTests, listInstances, all, nextTest);
                });
            } else {
                listTests[index](root);
                setTimeout(() => {
                    Tests_BaseClass.runNextTest(root, listNames, listTests, listInstances, all, nextTest);
                }, 1);
            }
        }
    }

    static runTestsArray(root: Root, registeredTests: any[], all = true) {
        console.log('gathering tests...');
        let listNames: string[] = [];
        let listTests: Function[] = [];
        let listInstances: Tests_BaseClass[] = [];
        for (let [fn] of registeredTests) {
            let testInstance = fn();
            if (testInstance && testInstance instanceof Tests_BaseClass) {
                testInstance.getAllTests(listNames, listTests, listInstances);
            }
        }

        console.log('starting tests...');
        Tests_BaseClass.runNextTest(root, listNames, listTests, listInstances, all, 0);
    }
}
