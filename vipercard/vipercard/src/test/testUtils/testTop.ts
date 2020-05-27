
/* auto */ import { ScriptTestBatch } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { VpcIntroProvider } from './../../vpcui/intro/vpcIntroProvider';
/* auto */ import { AsyncFn, VoidFn } from './../../ui512/utils/util512Higher';
/* auto */ import { UI512ErrorHandling, assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, Util512, ValHolder } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, notifyUserIfDebuggerIsSetToAllExceptions } from './testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * a very simple testing framework.
 */
export const SimpleUtil512Tests = /* static class */ {
    async runTests(includeSlow: boolean) {
        if (UI512ErrorHandling.runningTests) {
            console.log('Apparently already running tests...');
            return;
        }

        UI512ErrorHandling.runningTests = true;
        console.log('Running tests...');

        /* order tests from high to low */
        let colls: SimpleUtil512TestCollection[] = [
            /* testCollectionvpcuiServer, */
            /* testCollectionScriptExtensiveIf */

            /*testCollection03exprPseudoObjects,
            testCollection03objectRenderName,
            testCollection03exprObjectRef,
            testCollection03fnsStandalone,
            testCollection03propsChunk,
            testCollection03propsComputed,
            testCollection03chunkAdditional,
            testCollection03chunkBasic,
            testCollection03lexer,
            testCollectionScriptExtensiveChunk,
            testCollectionScriptRewrites,
            testCollectionScriptRunCustomFns,
            testCollectionScriptRunCmd,
            testCollectionvpcScriptEval,
            testCollectionvpcScriptRunSyntax,
            testCollectionScriptExprLvl,
            testCollectionvpcScriptParseCmd,
            testCollectionvpcScriptParseExpr,
            testCollectionvpcChunkResolution,
            testCollectionvpcElements,
            testCollectionvpcuiMsgBox,
            testCollectionvpcuiIntroProvider,
            testCollectionvpcVpcVal,
            testCollectionUI512CodeEditor,
            testCollectionUI512Composites,
            testCollectionUI512DrawText,
            testCollectionUI512Elements,
            testCollectionUI512ElementsViewButtons,
            testCollectionUI512FormattedText,
            testCollectionUI512MenuRender,
            testCollectionUI512Paint,
            testCollectionUI512TextEdit,
            testCollectionUI512TextModify,
            testCollectionUI512TextSelectEvents,
            testCollectionUtilsCanvasWrapper,
            testCollectionUtilsDraw,
            testCollectionUtil512Higher,
            testCollectionUtil512Class,
            testCollectionUtil512,
            testCollectionUtil512Assert,
            testCollectionExternalLibs*/
        ];

        if (!colls || !colls.length) {
            console.log('no tests have been included.');
            return;
        }

        /* run tests from low level to high level */
        colls.reverse();
        let colNamesSeen = new MapKeyToObjectCanSet<boolean>();
        let mapSeen = new MapKeyToObjectCanSet<boolean>();

        /* put slow tests after fast tests */
        let slowTests = colls.filter(item => item.slow);
        let fastTests = colls.filter(item => !item.slow);
        colls = fastTests.concat(slowTests);
        let countTotal = colls
            .filter(item => includeSlow || !item.slow)
            .map(item => item.tests.length)
            .reduce(Util512.add);
        countTotal += colls
            .filter(item => includeSlow || !item.slow)
            .map(item => item.atests.length)
            .reduce(Util512.add);
        let counter = new ValHolder(1);
        await VpcIntroProvider.waitForDelayLoadedJs(undefined);
        for (let coll of colls) {
            if (colNamesSeen.exists(coll.name.toLowerCase())) {
                assertTrue(false, 'O.|duplicate collection name', coll.name);
            }

            colNamesSeen.set(coll.name.toLowerCase(), true);
            console.log(`Collection: ${coll.name}`);
            if (includeSlow || !coll.slow) {
                await this.runCollection(coll, countTotal, counter, mapSeen);
            } else {
                console.log('(Skipped)');
            }
        }

        ScriptTestBatch.checkPending();
        UI512ErrorHandling.runningTests = false;
        if (UI512ErrorHandling.silenceWarnings) {
            console.log(`A test may have failed, warning occurred.`);
        } else {
            console.log(`All tests complete.`);
        }
    },

    /**
     * run a collection of tests
     */
    async runCollection(
        coll: SimpleUtil512TestCollection,
        countTotal: number,
        counter: ValHolder<number>,
        mapSeen: MapKeyToObjectCanSet<boolean>
    ) {
        notifyUserIfDebuggerIsSetToAllExceptions();
        assertWarn(
            coll.tests.length > 0 || coll.atests.length > 0,
            'O-|no tests in collection'
        );

        /* note that some tests require async tests to be done first. */
        let tests: [string, VoidFn | AsyncFn][] = coll.atests;
        tests = tests.concat(coll.tests);
        for (let i = 0; i < tests.length; i++) {
            let [tstname, tstfn] = tests[i];
            if (mapSeen.exists(tstname.toLowerCase())) {
                assertWarn(false, 'Or|duplicate test name', tstname);
            }

            /* it's totally fine to await on a synchronous fn. */
            mapSeen.set(tstname.toLowerCase(), true);
            console.log(`Test ${counter.val}/${countTotal}: ${tstname}`);
            await tstfn();
            counter.val += 1;
        }
    }
};
