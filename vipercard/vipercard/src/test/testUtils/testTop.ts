
/* auto */ import { testCollectionvpcuiServer } from './../vpc/vpcuiTestServer';
/* auto */ import { testCollectionvpcuiMsgBox } from './../vpc/vpcuiTestMsgBox';
/* auto */ import { testCollectionvpcuiIntroProvider } from './../vpc/vpcuiTestIntroProvider';
/* auto */ import { testCollectionvpcVpcVal } from './../vpc/vpcTestVpcVal';
/* auto */ import { testCollectionvpcScriptRunSyntax } from './../vpc/vpcTestScriptRunSyntax';
/* auto */ import { vpcTestCollectionScriptRunCustomFns } from './../vpc/vpcTestScriptRunCustomFns';
/* auto */ import { vpcTestCollectionScriptRunCmd } from './../vpc/vpcTestScriptRunCmd';
/* auto */ import { testCollectionvpcScriptParseExpr } from './../vpc/vpcTestScriptParseExpr';
/* auto */ import { testCollectionvpcScriptParseCmd } from './../vpc/vpcTestScriptParseCmd';
/* auto */ import { vpcTestCollectionScriptExprLvl } from './../vpc/vpcTestScriptExprLvl';
/* auto */ import { testCollectionvpcScriptEval } from './../vpc/vpcTestScriptEval';
/* auto */ import { testCollectionvpcElements } from './../vpc/vpcTestElements';
/* auto */ import { testCollectionvpcChunkResolution } from './../vpc/vpcTestChunkResolution';
/* auto */ import { AsyncFn, VoidFn } from './../../ui512/utils/util512Higher';
/* auto */ import { UI512ErrorHandling, assertTrue, assertWarn } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { Util512, ValHolder } from './../../ui512/utils/util512';
/* auto */ import { testCollectionUtilsDraw } from './../util512/testUtilsDraw';
/* auto */ import { testCollectionUtilsCanvasWrapper } from './../util512/testUtilsCanvasWrapper';
/* auto */ import { SimpleUtil512TestCollection, notifyUserIfDebuggerIsSetToAllExceptions } from './testUtils';
/* auto */ import { testCollectionUtil512Higher } from './../util512/testUtil512Higher';
/* auto */ import { testCollectionUtil512Class } from './../util512/testUtil512Class';
/* auto */ import { testCollectionUtil512Assert } from './../util512/testUtil512Assert';
/* auto */ import { testCollectionUtil512 } from './../util512/testUtil512';
/* auto */ import { testCollectionUI512TextSelectEvents } from './../util512ui/testUI512TextSelectEvents';
/* auto */ import { testCollectionUI512TextModify } from './../util512ui/testUI512TextModify';
/* auto */ import { testCollectionUI512TextEdit } from './../util512ui/testUI512TextEdit';
/* auto */ import { testCollectionUI512Paint } from './../util512ui/testUI512Paint';
/* auto */ import { testCollectionUI512MenuRender } from './../util512ui/testUI512MenuRender';
/* auto */ import { testCollectionUI512FormattedText } from './../util512ui/testUI512FormattedText';
/* auto */ import { testCollectionUI512ElementsViewButtons } from './../util512ui/testUI512ElementsViewButtons';
/* auto */ import { testCollectionUI512Elements } from './../util512ui/testUI512Elements';
/* auto */ import { testCollectionUI512DrawText } from './../util512ui/testUI512DrawText';
/* auto */ import { testCollectionUI512Composites } from './../util512ui/testUI512Composites';
/* auto */ import { testCollectionUI512CodeEditor } from './../util512ui/testUI512CodeEditor';
/* auto */ import { testCollectionExternalLibs } from './../util512/testExternalLibs';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the MIT license */

export class SimpleUtil512Tests {
    static async runTests(includeSlow: boolean) {
        if (UI512ErrorHandling.runningTests) {
            console.log('Apparently already running tests...');
            return;
        }

        UI512ErrorHandling.runningTests = true;
        console.log('Running tests...');

        // order tests from high to low
        let colls = [
            //~ testCollectionvpcuiServer,
            vpcTestCollectionScriptRunCustomFns,
            vpcTestCollectionScriptRunCmd,

            testCollectionvpcScriptEval,
            testCollectionvpcScriptRunSyntax,
            //~ vpcTestCollectionScriptExprLvl,
            //~ testCollectionvpcScriptParseCmd,
            //~ testCollectionvpcScriptParseExpr,
            //~ testCollectionvpcChunkResolution,
            //~ testCollectionvpcElements,
            //~ testCollectionvpcuiMsgBox,
            //~ testCollectionvpcuiIntroProvider,
            //~ testCollectionvpcVpcVal,

            //~ testCollectionUI512CodeEditor,
            //~ testCollectionUI512Composites,
            //~ testCollectionUI512DrawText,
            //~ testCollectionUI512Elements,
            //~ testCollectionUI512ElementsViewButtons,
            //~ testCollectionUI512FormattedText,
            //~ testCollectionUI512MenuRender,
            //~ testCollectionUI512Paint,
            //~ testCollectionUI512TextEdit,
            //~ testCollectionUI512TextModify,
            //~ testCollectionUI512TextSelectEvents,

            //~ testCollectionUtilsCanvasWrapper,
            //~ testCollectionUtilsDraw,
            //~ testCollectionUtil512Higher,
            //~ testCollectionUtil512Class,
            //~ testCollectionUtil512,
            //~ testCollectionUtil512Assert,
            //~ testCollectionExternalLibs
        ];

        /* run tests from low level to high level */
        colls.reverse();
        let colNamesSeen = new Map<string, boolean>();
        let mapSeen = new Map<string, boolean>();
        let countTotal = colls
            .filter(item => includeSlow || !item.slow)
            .map(item => item.tests.length)
            .reduce(Util512.add);
        countTotal += colls
            .filter(item => includeSlow || !item.slow)
            .map(item => item.atests.length)
            .reduce(Util512.add);
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
        if (UI512ErrorHandling.silenceWarnings) {
            console.log(`A test may have failed, warning occurred.`);
        } else {
            console.log(`All tests complete.`);
        }
    }

    static async runCollection(
        coll: SimpleUtil512TestCollection,
        countTotal: number,
        counter: ValHolder<number>,
        mapSeen: Map<string, boolean>
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
            if (mapSeen.has(tstname.toLowerCase())) {
                assertWarn(false, 'Or|duplicate test name', tstname);
            }

            mapSeen.set(tstname.toLowerCase(), true);
            console.log(`Test ${counter.val}/${countTotal}: ${tstname}`);
            await tstfn();
            counter.val += 1;
        }
    }
}
