
/* auto */ import { AVoidFn, SimpleUtil512TestCategory, notifyUserIfDebuggerIsSetToAllExceptions, } from './testUtils';
/* auto */ import { testBenBaseLessUsefulLibs, testExternalLibs, } from './testExternalLibs';
/* auto */ import { testBenBaseUtilsHigher, testExampleAsyncTests, } from './testBenBaseUtilsHigher';
/* auto */ import { testBenBaseUtilsClass } from './testBenBaseUtilsClass';
/* auto */ import { testBenBaseUtilsAssert } from './testBenBaseUtilsAssert';
/* auto */ import { testBenBaseUtils } from './testBenBaseUtils';
/* auto */ import { UI512ErrorHandling, assertTrue } from './../util/benBaseUtilsAssert';
/* auto */ import { Util512, ValHolder } from './../util/benBaseUtils';

export class SimpleUtil512Tests {
    static async runTests(includeSlow: boolean) {
        console.log('Running tests...');
        UI512ErrorHandling.runningTests = true;
        let categories = [
            testExternalLibs,
            testExampleAsyncTests,
            testBenBaseUtilsAssert,
            testBenBaseUtils,
            testBenBaseUtilsClass,
            testBenBaseLessUsefulLibs,
            testBenBaseUtilsHigher,
        ];

        let mapSeen = new Map<string, boolean>();
        let countTotal = categories.map(item => item.tests.length).reduce(Util512.add);
        countTotal += categories.map(item => item.atests.length).reduce(Util512.add);
        let counter = new ValHolder(1);
        for (let category of categories) {
            console.log(`Category: ${category.name}`);
            if (includeSlow || !category.slow) {
                await SimpleUtil512Tests.runCategory(
                    category,
                    countTotal,
                    counter,
                    mapSeen,
                );
            }
        }

        UI512ErrorHandling.runningTests = false;
        console.log(`All tests complete.`);
    }

    static async runCategory(
        category: SimpleUtil512TestCategory,
        countTotal: number,
        counter: ValHolder<number>,
        mapSeen: Map<string, boolean>,
    ) {
        notifyUserIfDebuggerIsSetToAllExceptions();
        let tests = category.async ? category.atests : category.tests;
        assertTrue(tests.length > 0, 'no tests in category');
        for (let i = 0; i < tests.length; i++) {
            let [tstname, tstfn] = tests[i];
            if (mapSeen.has(tstname.toLowerCase())) {
                assertTrue(false, 'Or|duplicate test name', tstname);
            }

            mapSeen.set(tstname, true);
            console.log(`Test ${counter.val}/${countTotal}: ${tstname}`);
            counter.val += 1;
            if (category.async) {
                await (tstfn as AVoidFn)();
            } else {
                tstfn();
            }
        }
    }
}
