
/* auto */ import { AsyncVoidFn } from './../../ui512/utils/util512Higher';
/* auto */ import { UI512ErrorHandling, assertTrue, makeUI512Error } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, ValHolder } from './../../ui512/utils/util512';
/* auto */ import { testCollectionUtilsDraw } from './../util512/testUtilsDraw';
/* auto */ import { testCollectionUtilsCanvasWrapper } from './../util512/testUtilsCanvasWrapper';
/* auto */ import { SimpleUtil512TestCollection, notifyUserIfDebuggerIsSetToAllExceptions } from './testUtils';
/* auto */ import { testCollectionExampleAsyncTests, testCollectionUtil512Higher } from './../util512/testUtil512Higher';
/* auto */ import { testCollectionUtil512Class } from './../util512/testUtil512Class';
/* auto */ import { testCollectionUtil512Assert } from './../util512/testUtil512Assert';
/* auto */ import { testCollectionUtil512 } from './../util512/testUtil512';
/* auto */ import { testCollectionExternalLibs, testCollectionUtil512LessUsefulLibs } from './../util512/testExternalLibs';

export class SimpleUtil512Tests {
    static async runTests(includeSlow: boolean) {
        console.log('Running tests...');
        console.log('Running tests...O');
        UI512ErrorHandling.runningTests = true;
        let colls = [
            testCollectionExternalLibs,
            testCollectionUtilsCanvasWrapper,
            testCollectionUtilsDraw,
            testCollectionExampleAsyncTests,
            testCollectionUtil512Assert,
            testCollectionUtil512,
            testCollectionUtil512Class,
            testCollectionUtil512LessUsefulLibs,
            testCollectionUtil512Higher
        ];

        let colNamesSeen = new Map<string, boolean>();
        let mapSeen = new Map<string, boolean>();
        let countTotal = colls.map(item => item.tests.length).reduce(Util512.add);
        countTotal += colls.map(item => item.atests.length).reduce(Util512.add);
        let counter = new ValHolder(1);
        for (let coll of colls) {
            if (colNamesSeen.has(coll.name.toLowerCase())) {
                assertTrue(false, 'O.|duplicate collection name', coll.name);
            }

            colNamesSeen.set(coll.name.toLowerCase(), true);
            console.log(`Collection: ${coll.name}`);
            if (includeSlow || !coll.slow) {
                await SimpleUtil512Tests.runCollection(
                    coll,
                    countTotal,
                    counter,
                    mapSeen
                );
            } else {
                console.log('(Skipped)');
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
        assertTrue(tests.length > 0, 'O-|no tests in collection');
        for (let i = 0; i < tests.length; i++) {
            let [tstname, tstfn] = tests[i];
            if (mapSeen.has(tstname.toLowerCase())) {
                assertTrue(false, 'Or|duplicate test name', tstname);
            }

            mapSeen.set(tstname.toLowerCase(), true);
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
                throw makeUI512Error('O,|user chose to stop after failed test.');
            }

            SimpleUtil512Tests.haveHitWarnAndAllowToContinue = true;
        }
    }
}
