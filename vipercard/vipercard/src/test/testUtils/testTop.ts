
/* auto */ import { UI512ErrorHandling, assertTrue, } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, ValHolder } from './../../ui512/utils/util512';
/* auto */ import { AVoidFn, SimpleUtil512TestCategory, notifyUserIfDebuggerIsSetToAllExceptions, } from './testUtils';
/* auto */ import { testBenBaseUtilsHigher, testExampleAsyncTests, } from './../ui512/testUtil512Higher';
/* auto */ import { testBenBaseUtilsClass } from './../ui512/testUtil512Class';
/* auto */ import { testBenBaseUtilsAssert } from './../ui512/testUtil512Assert';
/* auto */ import { testBenBaseUtils } from './../ui512/testUtil512';
/* auto */ import { testBenBaseLessUsefulLibs, testExternalLibs, } from './../ui512/testExternalLibs';

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
