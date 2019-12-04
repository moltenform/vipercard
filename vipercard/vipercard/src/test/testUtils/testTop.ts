
/* auto */ import { AsyncVoidFn } from './../../ui512/utils/util512Higher';
/* auto */ import { UI512ErrorHandling, assertTrue, makeUI512Error } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, ValHolder } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, notifyUserIfDebuggerIsSetToAllExceptions } from './testUtils';
/* auto */ import { testCollectionExampleAsyncTests, testCollectionUtil512Higher } from './../ui512/testUtil512Higher';
/* auto */ import { testCollectionUtil512Class } from './../ui512/testUtil512Class';
/* auto */ import { testCollectionUtil512Assert } from './../ui512/testUtil512Assert';
/* auto */ import { testCollectionUtil512 } from './../ui512/testUtil512';
/* auto */ import { testCollectionExternalLibs, testCollectionUtil512LessUsefulLibs } from './../ui512/testExternalLibs';

export class SimpleUtil512Tests {
    static async runTests(includeSlow: boolean) {
        console.log('Running tests...');
        UI512ErrorHandling.runningTests = true;
        let colls = [
            testCollectionExternalLibs,
            testCollectionExampleAsyncTests,
            testCollectionUtil512Assert,
            testCollectionUtil512,
            testCollectionUtil512Class,
            testCollectionUtil512LessUsefulLibs,
            testCollectionUtil512Higher
        ];

        let mapSeen = new Map<string, boolean>();
        let countTotal = colls.map(item => item.tests.length).reduce(Util512.add);
        countTotal += colls.map(item => item.atests.length).reduce(Util512.add);
        let counter = new ValHolder(1);
        for (let coll of colls) {
            console.log(`Collection: ${coll.name}`);
            if (includeSlow || !coll.slow) {
                await SimpleUtil512Tests.runCollection(
                    coll,
                    countTotal,
                    counter,
                    mapSeen
                );
            }
        }

        UI512ErrorHandling.runningTests = false;
        console.log(`All tests complete.`);
    }

    static async runCollection(
        coll: SimpleUtil512TestCollection,
        countTotal: number,
        counter: ValHolder<number>,
        mapSeen: Map<string, boolean>
    ) {
        notifyUserIfDebuggerIsSetToAllExceptions();
        let tests = coll.async ? coll.atests : coll.tests;
        assertTrue(tests.length > 0, 'no tests in collection');
        for (let i = 0; i < tests.length; i++) {
            let [tstname, tstfn] = tests[i];
            if (mapSeen.has(tstname.toLowerCase())) {
                assertTrue(false, 'Or|duplicate test name', tstname);
            }

            mapSeen.set(tstname, true);
            console.log(`Test ${counter.val}/${countTotal}: ${tstname}`);
            counter.val += 1;
            if (coll.async) {
                await (tstfn as AsyncVoidFn)();
            } else {
                tstfn();
            }
        }
    }

    /**
     * the first time hit, show a dialog asking if we should continue
     * subsequent hits, allow through without stopping
     */
    static haveHitWarnAndAllowToContinue = false;
    static warnAndAllowToContinue(...message: any[]) {
        console.error(...message);

        if (!SimpleUtil512Tests.haveHitWarnAndAllowToContinue) {
            if (
                !window.confirm(
                    'test failed. see details in console. continue running tests?'
                )
            ) {
                throw makeUI512Error('user chose to stop after failed test.');
            }

            SimpleUtil512Tests.haveHitWarnAndAllowToContinue = true;
        }
    }
}
