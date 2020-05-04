
/* auto */ import { getParsingObjects } from './../../vpc/codeparse/vpcVisitor';
/* auto */ import { VpcEvalHelpers } from './../../vpc/vpcutils/vpcValEval';
/* auto */ import { VpcVal, VpcValN, VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { VpcState } from './../../vpcui/state/vpcState';
/* auto */ import { VpcPresenterEvents } from './../../vpcui/presentation/vpcPresenterEvents';
/* auto */ import { VpcPresenter } from './../../vpcui/presentation/vpcPresenter';
/* auto */ import { VpcDocumentLocation, VpcIntroProvider } from './../../vpcui/intro/vpcIntroProvider';
/* auto */ import { VpcElType, VpcErr, VpcErrStage, VpcOpCtg, VpcTool, checkThrowInternal } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcElButton } from './../../vpc/vel/velButton';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { BrowserInfo } from './../../ui512/utils/util512Higher';
/* auto */ import { O, bool, coalesceIfFalseLike } from './../../ui512/utils/util512Base';
/* auto */ import { UI512ErrorHandling, assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, assertEq, assertWarnEq } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
    elIds: { [key: string]: string } = {};
    evalHelpers = new VpcEvalHelpers();
    initedAppl = false;
    simMouseX: number;
    simMouseY: number;
    simClickX: number;
    simClickY: number;
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
        this.vcstate.vci.doWithoutAbilityToUndo(() => v.set('script', s));
    }

    populateModel() {
        /*
         1st bg "a" has 1 card named "a"
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

        let bg_a = model.stack.bgs[0];
        let bg_b = this.vcstate.createVel(model.stack.id, VpcElType.Bg, -1);
        let bg_c = this.vcstate.createVel(model.stack.id, VpcElType.Bg, -1);
        let card_a_a = bg_a.cards[0];
        let card_b_b = this.vcstate.createVel(bg_b.id, VpcElType.Card, -1);
        let card_b_c = this.vcstate.createVel(bg_b.id, VpcElType.Card, -1);
        let card_b_d = this.vcstate.createVel(bg_b.id, VpcElType.Card, -1);
        let card_c_d = this.vcstate.createVel(bg_c.id, VpcElType.Card, -1);
        let fld_b_c_1 = this.vcstate.createVel(card_b_c.id, VpcElType.Fld, -1);
        let fld_b_c_2 = this.vcstate.createVel(card_b_c.id, VpcElType.Fld, -1);
        let fld_b_c_3 = this.vcstate.createVel(card_b_c.id, VpcElType.Fld, -1);
        let btn_b_c_1 = this.vcstate.createVel(card_b_c.id, VpcElType.Btn, -1);
        let btn_b_c_2 = this.vcstate.createVel(card_b_c.id, VpcElType.Btn, -1);
        let fld_b_d_1 = this.vcstate.createVel(card_b_d.id, VpcElType.Fld, -1);
        let fld_b_d_2 = this.vcstate.createVel(card_b_d.id, VpcElType.Fld, -1);
        let btn_b_d_1 = this.vcstate.createVel(card_b_d.id, VpcElType.Btn, -1);
        let fld_c_d_1 = this.vcstate.createVel(card_c_d.id, VpcElType.Fld, -1);
        let btn_c_d_1 = this.vcstate.createVel(card_c_d.id, VpcElType.Btn, -1);

        let bgfld_b_1 = this.vcstate.createVel(bg_b.id, VpcElType.Fld, -1);
        let bgfld_b_2 = this.vcstate.createVel(bg_b.id, VpcElType.Fld, -1);
        let bgfld_c_1 = this.vcstate.createVel(bg_c.id, VpcElType.Fld, -1);
        let bgbtn_b_1 = this.vcstate.createVel(bg_b.id, VpcElType.Btn, -1);
        let bgbtn_b_2 = this.vcstate.createVel(bg_b.id, VpcElType.Btn, -1);
        let bgbtn_c_1 = this.vcstate.createVel(bg_c.id, VpcElType.Btn, -1);
        let btn_go = this.vcstate.createVel(card_a_a.id, VpcElType.Btn, -1);

        model.stack.set('name', 'teststack');
        bg_a.set('name', 'a');
        bg_b.set('name', 'b');
        bg_c.set('name', 'c');
        card_a_a.set('name', 'a');
        card_b_b.set('name', 'b');
        card_b_c.set('name', 'c');
        card_b_d.set('name', 'd');
        card_c_d.set('name', 'd');
        fld_b_c_1.set('name', 'p1');
        fld_b_c_2.set('name', 'p2');
        fld_b_c_3.set('name', 'p3');
        btn_b_c_1.set('name', 'p1');
        btn_b_c_2.set('name', 'p2');
        fld_b_d_1.set('name', 'p1');
        fld_b_d_2.set('name', 'p2');
        btn_b_d_1.set('name', 'p1');
        fld_c_d_1.set('name', 'p1');
        btn_c_d_1.set('name', 'p1');
        bgfld_b_1.set('name', 'p1');
        bgfld_b_2.set('name', 'p2');
        bgfld_c_1.set('name', 'p1');
        bgbtn_b_1.set('name', 'p1');
        bgbtn_b_2.set('name', 'p2');
        bgbtn_c_1.set('name', 'p1');
        btn_go.set('name', 'go');

        this.elIds = {
            stack: model.stack.id,
            bg_a: bg_a.id,
            bg_b: bg_b.id,
            bg_c: bg_c.id,
            card_a_a: card_a_a.id,
            card_b_b: card_b_b.id,
            card_b_c: card_b_c.id,
            card_b_d: card_b_d.id,
            card_c_d: card_c_d.id,
            fld_b_c_1: fld_b_c_1.id,
            fld_b_c_2: fld_b_c_2.id,
            fld_b_c_3: fld_b_c_3.id,
            btn_b_c_1: btn_b_c_1.id,
            btn_b_c_2: btn_b_c_2.id,
            fld_b_d_1: fld_b_d_1.id,
            fld_b_d_2: fld_b_d_2.id,
            btn_b_d_1: btn_b_d_1.id,
            fld_c_d_1: fld_c_d_1.id,
            btn_c_d_1: btn_c_d_1.id,
            bgfld_b_1: bgfld_b_1.id,
            bgfld_b_2: bgfld_b_2.id,
            bgfld_c_1: bgfld_c_1.id,
            bgbtn_b_1: bgbtn_b_1.id,
            bgbtn_b_2: bgbtn_b_2.id,
            bgbtn_c_1: bgbtn_c_1.id,
            btn_go: btn_go.id
        };

        let b = btn_go as VpcElButton;
        assertTrue(b instanceof VpcElButton, '2c|not a button');
        let userBounds = this.pr.userBounds;

        /* make the button location more realistic, it should be within userBounds */
        b.setDimensions(userBounds[0] + 1, userBounds[1] + 1, 30, 30);
        this.simMouseX = b.getN('x') + 5;
        this.simMouseY = b.getN('y') + 6;
        this.simClickX = b.getN('x') + 7;
        this.simClickY = b.getN('y') + 8;
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
            caughtErr = scriptErr;
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
                assertWarnEq(
                    expectErrLine + 1,
                    line + 1,
                    'wrong line',
                    makeWarningUseful
                );
            }

            if (expectPreparseErr) {
                assertWarn(
                    scriptErr.stage !== VpcErrStage.Execute &&
                        scriptErr.stage !== VpcErrStage.Visit &&
                        scriptErr.stage !== VpcErrStage.SyntaxStep,
                    makeWarningUseful
                );
            }

            assertWarn(
                expectErrMsg !== undefined,
                'unexpected failure',
                makeWarningUseful
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

        let btnGo = this.vcstate.model.getById(VpcElButton, this.elIds.btn_go);
        this.vcstate.vci.doWithoutAbilityToUndo(() => btnGo.set('script', built));

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

        VpcPresenterEvents.scheduleScriptMsgImpl(this.pr, fakeEvent, btnGo.id, false);

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

    testBatchEvaluate(tests: [string, string][], floatingPoint = false) {
        assertWarn(tests.length > 0, 'R6|');
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
            /* for convenience allow "foo()\\0" but we'll ignore the 0. */
            let pts = getBeforeLine(testsPreparseErr[i][0]);
            let line = coalesceIfFalseLike(pts[0], pts[1]);
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
