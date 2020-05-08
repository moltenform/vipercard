
/* auto */ import { getParsingObjects } from './../../vpc/codeparse/vpcVisitor';
/* auto */ import { VpcEvalHelpers } from './../../vpc/vpcutils/vpcValEval';
/* auto */ import { VpcVal, VpcValN, VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { VpcState } from './../../vpcui/state/vpcState';
/* auto */ import { VpcPresenterEvents } from './../../vpcui/presentation/vpcPresenterEvents';
/* auto */ import { VpcPresenter } from './../../vpcui/presentation/vpcPresenter';
/* auto */ import { VpcDocumentLocation, VpcIntroProvider } from './../../vpcui/intro/vpcIntroProvider';
/* auto */ import { VpcElType, VpcErr, VpcErrStage, VpcOpCtg, VpcTool, checkThrow, checkThrowInternal } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcElButton } from './../../vpc/vel/velButton';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { BrowserInfo } from './../../ui512/utils/util512Higher';
/* auto */ import { O, bool, checkIsProductionBuild } from './../../ui512/utils/util512Base';
/* auto */ import { UI512ErrorHandling, assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, Util512, assertEq, assertWarnEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * run a set of script tests.
 *
 * features: use ERR:details or PARSEERR:details
 * to indicate an expected exception
 * use ERR:5:details to indicate line failure
 * use MARK: to point to a line, is ignored
 * specify BatchType.floatingPoint to allow small differences
 * specify BatchType.testBatchEvalCommutative to test both orders
 * use "onlyTestsWithPrefix" to enable only certain tests, for debugging
 */
export class ScriptTestBatch {
    protected static keepTrackOfPending = new MapKeyToObjectCanSet<string>();
    id: string;
    locked = false;
    tests: [string, string][] = [];
    constructor() {
        let getTraceback = checkIsProductionBuild()
            ? '(traceback not supported)'
            : new Error().stack?.toString();
        getTraceback = getTraceback ?? '(traceback not supported)';
        this.id = Math.random().toString();
        ScriptTestBatch.keepTrackOfPending.add(this.id, getTraceback);
    }

    t(s1: string, s2: string) {
        assertTrue(!this.locked, 'forgot to create a new batch after evaluating?');
        this.tests.push([s1, s2]);
    }

    batchEvaluate(
        runner: TestVpcScriptRunBase,
        typ = BatchType.default,
        onlyTestsWithPrefix = ''
    ) {
        if (!onlyTestsWithPrefix) {
            ScriptTestBatch.keepTrackOfPending.set(this.id, '');
        }

        let isFloatingPt = false;
        if (typ === BatchType.floatingPoint) {
            typ = BatchType.default;
            isFloatingPt = true;
        } else if (typ === BatchType.floatingPointCommutative) {
            typ = BatchType.testBatchEvalCommutative;
            isFloatingPt = true;
        }

        let whichTests = this.tests.filter(t => t[1].startsWith(onlyTestsWithPrefix));
        if (typ === BatchType.default) {
            runner.testBatchEvaluate(whichTests, isFloatingPt);
        } else if (typ === BatchType.testBatchEvalCommutative) {
            runner.testBatchEvalCommutative(whichTests, isFloatingPt);
        } else if (typ === BatchType.testBatchEvalInvert) {
            runner.testBatchEvalInvert(whichTests);
        } else if (typ === BatchType.testBatchEvalInvertAndCommute) {
            runner.testBatchEvalInvertAndCommute(whichTests);
        } else {
            checkThrow(false, 'unknown batchtype ' + typ);
        }

        /* prevent you from re-using the object */
        this.locked = true;
    }

    static checkPending() {
        let vals = ScriptTestBatch.keepTrackOfPending.getVals();
        let foundSome = false;
        for (let val of vals) {
            if (val) {
                foundSome = true;
                console.error('Still pending from:');
                console.error(val);
            }
        }

        assertTrue(!foundSome, 'Test batch(es) left pending');
    }
}

/**
 * infrastructure to set up a mock ViperCard environment
 * for compiling+running tests
 *
 * create cards, buttons, and fields in populateModel()
 * use testBatchEvaluate to evaluate an array of expressions and expected values.
 * use testBatchEvalInvertAndCommute to comfirm all four permutations,
 * since if a == b, we also confirm that
 * b == a, a != b, and b != a
 *
 */
export class TestVpcScriptRunBase {
    pr: VpcPresenter;
    vcstate: VpcState;
    ids: { [key: string]: string } = {};
    evalHelpers = new VpcEvalHelpers();
    initedAppl = false;
    simMouseX: number;
    simMouseY: number;
    simClickX: number;
    simClickY: number;
    /* are bg vels supported yet */
    useBg = false;
    readonly customFunc = 'function';
    constructor(protected t: SimpleUtil512TestCollection) {}

    async initEnvironment() {
        if (!this.initedAppl) {
            [this.pr, this.vcstate] = await this.startEnvironment();
            this.vcstate.vci.doWithoutAbilityToUndo(() => this.populateModel());
            this.vcstate.vci.doWithoutAbilityToUndo(() =>
                this.pr.setTool(VpcTool.Browse)
            );

            /* ensure that it won't try to open the script in ui. */
            this.pr.defaultShowScriptErr = () => {};
        }

        this.initedAppl = true;
    }

    async startEnvironment(): Promise<[VpcPresenter, VpcState]> {
        let loader = new VpcIntroProvider('', '', VpcDocumentLocation.NewDoc);
        return loader.loadDocumentTop();
    }

    setScript(id: string, s: string) {
        let v = this.vcstate.model.getByIdUntyped(id);
        this.vcstate.vci.doWithoutAbilityToUndo(() =>
            v.setOnVel('script', s, this.vcstate.model)
        );
    }

    populateModel() {
        /*
         1st bg "a" has 1 card named "a", btn "go"
         2nd bg "b" has 3 cards named "b", "c", "d"
               card "c" has 3 flds "p1", "p2", "p3"
                       and 2 btns "p1", "p2"
               card "d" has 2 flds "p1", "p2"
                       and 1 btn "p1"
         3rd bg "c" has 1 card named "d"
               card "d" has 1 fld "p1"
                       and 1 btn "p1"
        */

        let model = this.vcstate.model;
        assertEq(1, model.stack.bgs.length, '2f|');
        assertEq(1, model.stack.bgs[0].cards.length, '2e|');

        let bgA = model.stack.bgs[0];
        let bgB = this.vcstate.createVel(model.stack.idInternal, VpcElType.Bg, -1);
        let bgC = this.vcstate.createVel(model.stack.idInternal, VpcElType.Bg, -1);
        let cdA = bgA.cards[0];
        this.vcstate.vci.setCurCardNoOpenCardEvt(cdA.idInternal);
        let cdBB = this.vcstate.createVel(bgB.idInternal, VpcElType.Card, -1);
        this.vcstate.vci.setCurCardNoOpenCardEvt(cdBB.idInternal);
        let cdBC = this.vcstate.createVel(bgB.idInternal, VpcElType.Card, -1);
        this.vcstate.vci.setCurCardNoOpenCardEvt(cdBC.idInternal);
        let cdBD = this.vcstate.createVel(bgB.idInternal, VpcElType.Card, -1);
        this.vcstate.vci.setCurCardNoOpenCardEvt(cdBD.idInternal);
        let cdCD = this.vcstate.createVel(bgC.idInternal, VpcElType.Card, -1);
        this.vcstate.vci.setCurCardNoOpenCardEvt(cdCD.idInternal);

        let fBC1 = this.vcstate.createVel(cdBC.idInternal, VpcElType.Fld, -1);
        let fBC2 = this.vcstate.createVel(cdBC.idInternal, VpcElType.Fld, -1);
        let fBC3 = this.vcstate.createVel(cdBC.idInternal, VpcElType.Fld, -1);
        let bBC1 = this.vcstate.createVel(cdBC.idInternal, VpcElType.Btn, -1);
        let bBC2 = this.vcstate.createVel(cdBC.idInternal, VpcElType.Btn, -1);
        let fBD1 = this.vcstate.createVel(cdBD.idInternal, VpcElType.Fld, -1);
        let fBD2 = this.vcstate.createVel(cdBD.idInternal, VpcElType.Fld, -1);
        let bBD1 = this.vcstate.createVel(cdBD.idInternal, VpcElType.Btn, -1);
        let fCD1 = this.vcstate.createVel(cdCD.idInternal, VpcElType.Fld, -1);
        let bCD1 = this.vcstate.createVel(cdCD.idInternal, VpcElType.Btn, -1);

        //~ let bgfB1 = this.vcstate.createVel(bgB.idInternal, VpcElType.Fld, -1);
        //~ let bgfB2 = this.vcstate.createVel(bgB.idInternal, VpcElType.Fld, -1);
        //~ let bgfC1 = this.vcstate.createVel(bgC.idInternal, VpcElType.Fld, -1);
        //~ let bgbB1 = this.vcstate.createVel(bgB.idInternal, VpcElType.Btn, -1);
        //~ let bgbB2 = this.vcstate.createVel(bgB.idInternal, VpcElType.Btn, -1);
        //~ let bgbC1 = this.vcstate.createVel(bgC.idInternal, VpcElType.Btn, -1);
        let go = this.vcstate.createVel(cdA.idInternal, VpcElType.Btn, -1);

        model.stack.setOnVel('name', 'teststack', model);
        bgA.setOnVel('name', 'a', model);
        bgB.setOnVel('name', 'b', model);
        bgC.setOnVel('name', 'c', model);
        cdA.setOnVel('name', 'a', model);
        cdBB.setOnVel('name', 'b', model);
        cdBC.setOnVel('name', 'c', model);
        cdBD.setOnVel('name', 'd', model);
        cdCD.setOnVel('name', 'd', model);
        fBC1.setOnVel('name', 'p1', model);
        fBC2.setOnVel('name', 'p2', model);
        fBC3.setOnVel('name', 'p3', model);
        bBC1.setOnVel('name', 'p1', model);
        bBC2.setOnVel('name', 'p2', model);
        fBD1.setOnVel('name', 'p1', model);
        fBD2.setOnVel('name', 'p2', model);
        bBD1.setOnVel('name', 'p1', model);
        fCD1.setOnVel('name', 'p1', model);
        bCD1.setOnVel('name', 'p1', model);
        //~ bgfB1.setOnVel('name', 'p1', model);
        //~ bgfB2.setOnVel('name', 'p2', model);
        //~ bgfC1.setOnVel('name', 'p1', model);
        //~ bgbB1.setOnVel('name', 'p1', model);
        //~ bgbB2.setOnVel('name', 'p2', model);
        //~ bgbC1.setOnVel('name', 'p1', model);
        go.setOnVel('name', 'go', model);

        this.ids = {
            stack: model.stack.idInternal,
            bgA: bgA.idInternal,
            bgB: bgB.idInternal,
            bgC: bgC.idInternal,
            cdA: cdA.idInternal,
            cdBB: cdBB.idInternal,
            cdBC: cdBC.idInternal,
            cdBD: cdBD.idInternal,
            cdCD: cdCD.idInternal,
            fBC1: fBC1.idInternal,
            fBC2: fBC2.idInternal,
            fBC3: fBC3.idInternal,
            bBC1: bBC1.idInternal,
            bBC2: bBC2.idInternal,
            fBD1: fBD1.idInternal,
            fBD2: fBD2.idInternal,
            bBD1: bBD1.idInternal,
            fCD1: fCD1.idInternal,
            bCD1: bCD1.idInternal,
            //~ bgfB1: bgfB1.idInternal,
            //~ bgfB2: bgfB2.idInternal,
            //~ bgfC1: bgfC1.idInternal,
            //~ bgbB1: bgbB1.idInternal,
            //~ bgbB2: bgbB2.idInternal,
            //~ bgbC1: bgbC1.idInternal,
            go: go.idInternal
        };

        let b = go as VpcElButton;
        assertTrue(b instanceof VpcElButton, '2c|not a button');
        let userBounds = this.pr.userBounds;

        /* make the button location more realistic, it should be within userBounds */
        b.setDimensions(userBounds[0] + 1, userBounds[1] + 1, 30, 30, this.vcstate.model);
        this.simMouseX = b.getN('x') + 5;
        this.simMouseY = b.getN('y') + 6;
        this.simClickX = b.getN('x') + 7;
        this.simClickY = b.getN('y') + 8;
    }

    protected onScriptErr(
        scriptErr: VpcErr,
        built: string,
        expectErrMsg?: string,
        expectErrLine?: number,
        expectPreparseErr?: boolean
    ) {
        let msg = scriptErr.message;
        let velId = scriptErr.scriptErrVelid ?? 'unknown';
        let line = scriptErr.scriptErrLine ?? -1;
        this.vcstate.vci.undoableAction(() => {
            this.vcstate.vci.setTool(VpcTool.Browse);
        });

        let makeWarningUseful = '';
        let lns = built.split('\n');
        if (line) {
            line -= 1; /* from 1-based index */
        }
        if (expectErrLine) {
            expectErrLine -= 1; /* from 1-based index */
        }
        if (line >= 0 && line < lns.length) {
            makeWarningUseful += `culprit line: <${lns[line]
                .replace(/\s+/, ' ')
                .trim()}>`;
            if (bool(expectPreparseErr) || expectErrMsg) {
                makeWarningUseful += ` lines: <${lns
                    .join('; ')
                    .replace(/\s+/, ' ')
                    .trim()}>`;
            }
        } else {
            makeWarningUseful += `culprit lines: <${lns
                .join('; ')
                .replace(/\s+/, ' ')
                .trim()}>`;
        }

        makeWarningUseful = makeWarningUseful.replace(/global testresult; /g, '');
        makeWarningUseful += ` v=${velId} msg=\n${msg}`;

        if (expectErrMsg !== undefined) {
            if (expectErrMsg.startsWith('ERR:')) {
                expectErrMsg = expectErrMsg.slice('ERR:'.length);
            }

            if (msg.includes('parse error:')) {
                /* add the exception name for compatibility */
                if (getParsingObjects()[1].errors?.length) {
                    msg = getParsingObjects()[1].errors[0].name + ': ' + msg;
                }
            }
            assertWarn(
                msg.includes(expectErrMsg),
                `wrong err message, expected <${expectErrMsg}>`,
                makeWarningUseful
            );
        }

        if (expectErrLine !== undefined) {
            assertWarnEq(expectErrLine + 1, line + 1, 'wrong line', makeWarningUseful);
        }

        if (expectPreparseErr) {
            assertWarn(
                scriptErr.stage !== VpcErrStage.Execute &&
                    scriptErr.stage !== VpcErrStage.Visit &&
                    scriptErr.stage !== VpcErrStage.SyntaxStep,
                makeWarningUseful
            );
        }

        assertWarn(expectErrMsg !== undefined, 'unexpected failure', makeWarningUseful);
        return scriptErr;
    }

    runGeneralCode(
        codeBefore: string,
        codeIn: string,
        expectErrMsg?: string,
        expectErrLine?: number,
        expectPreparseErr?: boolean,
        addNoHandler?: boolean
    ) {
        let caughtErr: O<VpcErr>;
        this.vcstate.runtime.codeExec.cbOnScriptError = scriptErr => {
            caughtErr = this.onScriptErr(
                scriptErr,
                built,
                expectErrMsg,
                expectErrLine,
                expectPreparseErr
            );
        };

        let built = addNoHandler
            ? codeBefore + '\n' + codeIn
            : `${codeBefore}
            on mouseup
            ${codeIn}
            end mouseup`;
        built = built.replace(/{BSLASH}/g, '\\');
        built = FormattedText.fromExternalCharset(built, BrowserInfo.get().os);

        let btnGo = this.vcstate.model.getById(VpcElButton, this.ids.go);
        this.vcstate.vci.doWithoutAbilityToUndo(() =>
            btnGo.setOnVel('script', built, this.vcstate.model)
        );

        /* fake a click inside btnGo */
        assertEq(VpcTool.Browse, this.pr.getTool(), 'HY|');
        this.pr.trackMouse = [this.simMouseX, this.simMouseY];
        let fakeEvent = new MouseUpEventDetails(
            1,
            this.simClickX,
            this.simClickY,
            0,
            ModifierKeys.None
        );

        VpcPresenterEvents.scheduleScriptMsgImpl(
            this.pr,
            fakeEvent,
            btnGo.idInternal,
            false
        );

        assertTrue(
            !expectPreparseErr || expectErrMsg !== undefined,
            "R9|please pass an expectErrMsg, even if it's an empty string"
        );
        if (expectPreparseErr && expectErrMsg !== undefined && !caughtErr) {
            assertWarn(
                false,
                'R8|preparse error expected but not seen',
                codeBefore,
                codeIn
            );
        }

        /* if it built, message should now be in the queue */
        assertTrue(
            this.vcstate.runtime.codeExec.workQueue.length > 0 === !expectPreparseErr,
            `2V|you prob got a preparse err, not a runtime err, or vice versa.
${codeBefore}\n${codeIn}\n`,
            caughtErr?.message
        );
        if (expectPreparseErr) {
            return;
        }

        this.vcstate.vci.doWithoutAbilityToUndo(() =>
            this.vcstate.runtime.codeExec.runTimeslice(Infinity)
        );

        if (expectErrMsg !== undefined && !caughtErr) {
            assertWarn(false, '2U|error not seen\n', codeBefore, codeIn);
        }

        assertTrue(
            this.vcstate.runtime.codeExec.workQueue.length === 0,
            '2T|script took too long to execute'
        );
    }

    assertPreparseErr(s: string, expectErrMsg?: string, expectErrLine?: number) {
        return this.runGeneralCode(s, '', expectErrMsg, expectErrLine, true);
    }

    assertPreparseErrLn(s: string, expectErrMsg?: string, expectErrLine?: number) {
        return this.runGeneralCode('', s, expectErrMsg, expectErrLine, true);
    }

    assertLineErr(s: string, expectErrMsg: string, expectErrLine?: number) {
        return this.runGeneralCode('', s, expectErrMsg, expectErrLine, false);
    }

    testOneEvaluate(
        beforeLine: string,
        s: string,
        expectErrMsg?: string,
        expectErrLine?: number,
        codeBefore = ''
    ) {
        assertWarn(
            !s.startsWith('put ') && !s.startsWith('set '),
            'R7|this is supposed to be an expression but it looks like a command'
        );
        this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS('(placeholder)'));
        let codeIn = `global testresult
${beforeLine}
put ${s} into testresult`;
        this.runGeneralCode(codeBefore, codeIn, expectErrMsg, expectErrLine);
        return this.vcstate.runtime.codeExec.globals.get('testresult');
    }

    testBatchEvaluate(testsRaw: [string, string][], floatingPoint = false) {
        assertWarn(testsRaw.length > 0, 'R6|');
        let getBeforeLine = (s: string): [string, string] => {
            let ptsWithRes = s.split('{RESULT}');
            if (ptsWithRes.length > 1) {
                assertTrue(ptsWithRes.length === 2, 'R5|too many {RESULT}');
                return [ptsWithRes[0], ptsWithRes[1]];
            } else {
                let pts = s.split('\\');
                assertTrue(pts.length === 1 || pts.length === 2, '2S|too many \\');
                return pts.length === 2 ? [pts[0], pts[1]] : ['', pts[0]];
            }
        };

        let tests: [string, string][] = testsRaw.map(item => [
            item[0],
            item[1].replace(/MARK:/, '')
        ]);
        let testsErr = tests.filter(item => item[1].startsWith('ERR:'));
        let testsPreparseErr = tests.filter(item => item[1].startsWith('PREPARSEERR:'));
        let testsNoErr = tests.filter(
            item => !item[1].startsWith('ERR:') && !item[1].startsWith('PREPARSEERR:')
        );
        this.vcstate.runtime.codeExec.globals.set('donewithbatch', VpcValS('0'));
        let codeIn = `global donewithbatch\nput 0 into donewithbatch\n`;
        for (let i = 0; i < testsNoErr.length; i++) {
            this.vcstate.runtime.codeExec.globals.set(
                `testresult${i}`,
                VpcValS('(placeholder)')
            );
            let [beforeLine, expr] = getBeforeLine(testsNoErr[i][0]);
            codeIn += `global testresult${i}\n`;
            codeIn += `${beforeLine}\n`;
            codeIn += `put ${expr} into testresult${i}\n`;
        }

        codeIn += `put 1 into donewithbatch\n`;
        this.runGeneralCode('', codeIn);
        for (let i = 0; i < testsNoErr.length; i++) {
            let isDone = this.vcstate.runtime.codeExec.globals.get(`donewithbatch`);
            if ('1' !== isDone.readAsString()) {
                assertWarn(false, '2R|did not complete every test?');
                break;
            }

            let got = this.vcstate.runtime.codeExec.globals.get(`testresult${i}`);
            this.confirmCorrectResult(floatingPoint, got, testsNoErr, i);
        }

        for (let i = 0; i < testsErr.length; i++) {
            let [beforeLine, expr] = getBeforeLine(testsErr[i][0]);
            let errOnLine = beforeLine.length ? 4 : 5;
            let expectErr = testsErr[i][1].replace(/ERR:/g, '');
            let tryLine = Util512.parseInt(expectErr.split(':')[0]);
            if (expectErr.includes(':') && tryLine !== undefined) {
                errOnLine = tryLine;
                expectErr = expectErr.split(':')[1];
            }

            let got = this.testOneEvaluate(beforeLine, expr, expectErr, errOnLine);
            assertWarnEq(
                '(placeholder)',
                got.readAsString(),
                '2K|expected to get an error and not actually assign anything'
            );
        }

        for (let i = 0; i < testsPreparseErr.length; i++) {
            let line: string;
            let pts = getBeforeLine(testsPreparseErr[i][0]);
            if (pts[0] && pts[1]) {
                /* if it's like "doSomeCode\\0" then it is a line of code */
                assertTrue(
                    pts[1] === 'x' || pts[1] === '0',
                     longstr(`It looks like this test expects a preparseerr.
                     So, it can't have a \\\\expression, the first part needs
                     to end with \\\\0, since it is ignored`)
                );
                line = pts[0];
            } else {
                /* if it's like "doSomeCode" then it is a statement */
                assertTrue(pts[1], 'blank?');
                line = `put ${pts[1]} into testpreparseerr`;
            }

            let expectErr = testsPreparseErr[i][1].replace(/PREPARSEERR:/g, '');
            let errOnLine = 3;
            let tryLine = Util512.parseInt(expectErr.split(':')[0]);
            if (expectErr.includes(':') && tryLine !== undefined) {
                errOnLine = tryLine;
                expectErr = expectErr.split(':')[1];
            }

            this.assertPreparseErrLn(line, expectErr, errOnLine);
        }
    }

    protected confirmCorrectResult(
        floatingPoint: boolean,
        got: VpcVal,
        testsNoErr: [string, string][],
        i: number
    ) {
        if (floatingPoint) {
            assertWarn(got.isItNumeric(), '2Q|not numeric', got.readAsString());
            assertWarnEq(
                got.readAsString().trim(),
                got.readAsString(),
                '2P|why does it have whitespace'
            );
            let expectString = testsNoErr[i][1];
            assertWarn(isFinite(parseFloat(expectString)), '2O|not numeric');
            if (
                this.evalHelpers
                    .evalOp(
                        VpcValN(parseFloat(expectString)),
                        got,
                        VpcOpCtg.OpEqualityGreaterLessOrContains,
                        '=='
                    )
                    .readAsString() !== 'true'
            ) {
                if (!UI512ErrorHandling.silenceAssertMsgs) {
                    console.error(
                        ` input=${testsNoErr[i][0].replace(/\n/g, '; ')} expected=`
                    );
                    console.error(`${expectString} output=`);
                    console.error(`${got.readAsString()}`);
                }
                assertWarn(false, 'R4|DIFF RESULT');
            }
        } else {
            let gt = got.readAsString();
            let expt = testsNoErr[i][1];
            if (gt !== expt) {
                if (!UI512ErrorHandling.silenceAssertMsgs) {
                    console.error(
                        `DIFF RESULT input=${testsNoErr[i][0].replace(
                            /\n/g,
                            '; '
                        )} expected=`
                    );
                    console.error(`${expt.replace(/\n/g, '; ')} output=`);
                    console.error(`${gt.replace(/\n/g, '; ')}`);
                }
                assertWarn(false, 'R3|DIFF RESULT');
            }
        }
    }

    protected flipBool(s: string) {
        if (s === 'true') {
            return 'false';
        } else if (s === 'false') {
            return 'true';
        } else if (s.startsWith('ERR:')) {
            return s;
        } else {
            checkThrowInternal(false, '2J|could not flip ' + s);
        }
    }

    testBatchEvalCommutative(tests: [string, string][], floatingPoint = false) {
        tests = tests.map(item => [item[0], item[1].replace(/MARK:/, '')]);
        let testsSameorder = tests.map((item): [string, string] => {
            return [item[0].replace(/_/g, ''), item[1]];
        });

        let testsDifferentOrder = tests.map((item): [string, string] => {
            let pts = item[0].split('_');
            assertEq(3, pts.length, '2I|');
            return [pts[2] + ' ' + pts[1] + ' ' + pts[0], item[1]];
        });

        this.testBatchEvaluate(testsSameorder, floatingPoint);
        this.testBatchEvaluate(testsDifferentOrder, floatingPoint);
    }

    testBatchEvalInvert(tests: [string, string][]) {
        tests = tests.map(item => [item[0], item[1].replace(/MARK:/, '')]);
        let flipOperation = (op: string): [string, boolean] => {
            if (op === 'is') {
                return ['is not', false];
            } else {
                checkThrowInternal(false, '2H|unknown op ' + op);
            }
        };

        let same = tests.map((item): [string, string] => {
            return [item[0].replace(/_/g, ''), item[1]];
        });

        let invert = tests.map((item): [string, string] => {
            let expected = item[1];
            let pts = item[0].split('_');
            assertEq(3, pts.length, '2G|');
            let op = flipOperation(pts[1])[0];
            return [pts[0] + ' ' + op + ' ' + pts[2], this.flipBool(expected)];
        });

        this.testBatchEvaluate(same);
        this.testBatchEvaluate(invert);
    }

    testBatchEvalInvertAndCommute(tests: [string, string][]) {
        tests = tests.map(item => [item[0], item[1].replace(/MARK:/, '')]);
        let flipOperation = (op: string): [string, string] => {
            /* first is the op when order is reversed */
            /* second is the op that is logical inverse */
            if (op === '==') {
                return ['==', '!='];
            } else if (op === '=') {
                return ['=', '<>'];
            } else if (op === 'is') {
                return ['is', 'is not'];
            } else if (op === '!=') {
                return ['!=', '=='];
            } else if (op === '<>') {
                return ['<>', '='];
            } else if (op === 'is not') {
                return ['is not', 'is'];
            } else if (op === '<') {
                return ['>', '>='];
            } else if (op === '<=') {
                return ['>=', '>'];
            } else if (op === '>') {
                return ['<', '<='];
            } else if (op === '>=') {
                return ['<=', '<'];
            } else {
                checkThrowInternal(false, '2F|unknown op ' + op);
            }
        };

        let sameOrder = tests.map((item): [string, string] => {
            return [item[0].replace(/_/g, ''), item[1]];
        });

        let testsDifferentOrder = tests.map((item): [string, string] => {
            let expected = item[1];
            let pts = item[0].split('_');
            assertEq(3, pts.length, '2E|');
            return [pts[2] + ' ' + flipOperation(pts[1])[0] + ' ' + pts[0], expected];
        });

        let testsInvert = tests.map((item): [string, string] => {
            let expected = item[1];
            let pts = item[0].split('_');
            assertEq(3, pts.length, '2D|');
            return [
                pts[0] + ' ' + flipOperation(pts[1])[1] + ' ' + pts[2],
                this.flipBool(expected)
            ];
        });

        let testsInvertAndOrder = tests.map((item): [string, string] => {
            let expected = item[1];
            let pts = item[0].split('_');
            assertEq(3, pts.length, '2C|');
            let invertedOp = flipOperation(pts[1])[1];
            let reversedOp = flipOperation(invertedOp)[0];
            return [pts[2] + ' ' + reversedOp + ' ' + pts[0], this.flipBool(expected)];
        });

        this.testBatchEvaluate(sameOrder);
        this.testBatchEvaluate(testsDifferentOrder);
        this.testBatchEvaluate(testsInvert);
        this.testBatchEvaluate(testsInvertAndOrder);
    }
}

export enum BatchType {
    default = 1,
    testBatchEvalInvertAndCommute,
    testBatchEvalInvert,
    testBatchEvalCommutative,
    floatingPoint,
    floatingPointCommutative
}
