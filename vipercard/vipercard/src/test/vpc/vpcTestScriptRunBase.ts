
/* auto */ import { O, assertTrue, assertTrueWarn, makeVpcInternalErr, scontains, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, assertEqWarn, base10, getRoot } from '../../ui512/utils/utils512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcElType, VpcOpCtg, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcScriptSyntaxError } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VpcEvalHelpers } from '../../vpc/vpcutils/vpcValEval.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { ExpLRUMap } from '../../vpc/codeexec/bridgeJSLru.js';
/* auto */ import { VpcState } from '../../vpcui/state/vpcState.js';
/* auto */ import { VpcPresenterEvents } from '../../vpcui/presentation/vpcPresenterEvents.js';
/* auto */ import { VpcPresenter } from '../../vpcui/presentation/vpcPresenter.js';
/* auto */ import { VpcDocumentLocation, VpcIntroProvider } from '../../vpcui/intro/vpcIntroProvider.js';

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
export class TestVpcScriptRunBase extends UI512TestBase {
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

    async initEnvironment() {
        if (!this.initedAppl) {
            [this.pr, this.vcstate] = await this.startEnvironment();
            this.vcstate.vci.doWithoutAbilityToUndo(() => this.populateModel());
            this.vcstate.vci.doWithoutAbilityToUndo(() => this.pr.setTool(VpcTool.Browse));

            /* make showError a no-op instead of opening the script. */
            this.pr.showError = a => {};
        }

        this.initedAppl = true;
    }

    async startEnvironment(): Promise<[VpcPresenter, VpcState]> {
        let loader = new VpcIntroProvider('', '', VpcDocumentLocation.NewDoc);
        return loader.loadDocumentTop();
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
        bgfld_b_1.set('name', 'p1')
        bgfld_b_2.set('name', 'p2')
        bgfld_c_1.set('name', 'p1')
        bgbtn_b_1.set('name', 'p1')
        bgbtn_b_2.set('name', 'p2')
        bgbtn_c_1.set('name', 'p1')
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
            btn_go: btn_go.id,
        };

        let b = btn_go as VpcElButton;
        assertTrue((b instanceof VpcElButton), '2c|not a button');
        let userBounds = this.pr.userBounds;

        /* make the button location more realistic, it should be within userBounds */
        b.setDimensions(userBounds[0] + 1, userBounds[1] + 1, 30, 30);
        this.simMouseX = b.getN('x') + 5;
        this.simMouseY = b.getN('y') + 6;
        this.simClickX = b.getN('x') + 7;
        this.simClickY = b.getN('y') + 8;
    }

    protected updateChangedCodeAndCheckForSyntaxError(owner: VpcElBase, code: string) {
        this.vcstate.runtime.codeExec.updateChangedCode(owner, code);
        let fnd = this.vcstate.runtime.codeExec.getCompiledScript(owner.id, owner.getS('script'));
        if (fnd && fnd instanceof VpcScriptSyntaxError) {
            throwIfUndefined(this.vcstate.runtime.codeExec.cbOnScriptError, 'HZ|')(fnd);
        }
    }

    protected updateObjectScript(id: string, code: string) {
        this.vcstate.runtime.codeExec.cbOnScriptError = errFromScript => {
            let idScriptErr = errFromScript.velId;
            let n = errFromScript.lineNumber;
            let isUs = !errFromScript.isExternalException;
            let msg = errFromScript.details;
            let lns = built.split('\n');
            let culpritLine = n ? lns[n - 1] + '; ' + lns[n] : '';
            assertTrue(false, `2b|script error, looks like <${culpritLine}> ${n}`, msg);
        };

        let built = FormattedText.fromExternalCharset(code, getRoot().getBrowserInfo());
        let obj = this.vcstate.model.getByIdUntyped(id);
        this.vcstate.vci.doWithoutAbilityToUndo(() => obj.set('script', built));
        this.updateChangedCodeAndCheckForSyntaxError(obj, obj.getS('script'));
    }

    protected runGeneralCode(
        codeBefore: string,
        codeIn: string,
        expectErrMsg?: string,
        expectErrLine?: number,
        expectCompErr?: boolean,
        addNoHandler?: boolean
    ) {
        let caughtErr = false;
        let isCompilationStage = true;
        this.vcstate.runtime.codeExec.cbOnScriptError = scriptErr => {
            let msg = scriptErr.details;
            let velId = ''
            let line = -1
            this.vcstate.vci.undoableAction(() => {
                let [origVelId, origLine, reVelId, reLine] = VpcPresenter.commonRespondToError(this.vcstate.vci, scriptErr)
                velId = reVelId
                line = reLine
                this.vcstate.vci.setTool(VpcTool.Browse);
            })

            if (expectCompErr !== undefined && isCompilationStage !== expectCompErr) {
                let lns = built.split('\n');
                let culpritLine = line ? lns[line - 1] + '; ' + lns[line] : '';
                assertTrueWarn(false, '2a|got error at the wrong stage', culpritLine, msg);
            } else if (expectErrMsg) {
                assertEqWarn(expectErrLine, line, codeBefore, codeIn, '2Z|');
                if (!msg.includes( expectErrMsg)) {
                    UI512TestBase.warnAndAllowToContinue(
                        'DIFFERENT ERR MSG for input ' +
                            codeBefore.replace(/\n/g, '; ').replace(/global testresult; ;/g, '') +
                            codeIn.replace(/\n/g, '; ').replace(/global testresult; ;/g, '') +
                            ` expected ${expectErrMsg} and got`
                    );

                    console.error(msg.replace(/\n/g, '; '));
                    caughtErr = true;
                    return;
                }
            } else {
                let lns = built.split('\n');
                let culpritLine = line ? lns[line - 1] + '; ' + lns[line] : '';
                assertTrue(false, `2X|script error, looks like <${culpritLine}> ${line}`, msg);
            }

            caughtErr = true;
        };

        let built = addNoHandler
            ? codeBefore + '\n' + codeIn
            : `${codeBefore}
            on mouseup
            ${codeIn}
            end mouseup`;
        built = built.replace(/{BSLASH}/g, '\\');
        built = FormattedText.fromExternalCharset(built, getRoot().getBrowserInfo());

        let btnGo = this.vcstate.model.getById(VpcElButton, this.elIds.btn_go);
        this.vcstate.vci.doWithoutAbilityToUndo(() => btnGo.set('script', built));
        this.updateChangedCodeAndCheckForSyntaxError(btnGo, btnGo.getS('script'));
        if (caughtErr) {
            return;
        } else if (expectErrMsg && expectCompErr) {
            assertTrueWarn(false, "2W|we expected it to throw error but it didn't", codeBefore, codeIn);
        }

        /* fake a click inside btnGo */
        assertEq(VpcTool.Browse, this.pr.getTool(), 'HY|');
        this.pr.trackMouse = [this.simMouseX, this.simMouseY];
        let fakeEvent = new MouseUpEventDetails(1, this.simClickX, this.simClickY, 0, ModifierKeys.None);
        VpcPresenterEvents.scheduleScriptMsgImpl(this.pr, fakeEvent, btnGo.id, false);

        /* message should now be in the queue */
        assertTrue(this.vcstate.runtime.codeExec.workQueue.length > 0, '2V|should be in queue');
        isCompilationStage = false;
        this.vcstate.vci.doWithoutAbilityToUndo(() => this.vcstate.runtime.codeExec.runTimeslice(Infinity));

        if (caughtErr) {
            return;
        } else if (expectErrMsg) {
            assertTrueWarn(false, '2U|error not seen', codeBefore, codeIn);
        }

        assertTrue(this.vcstate.runtime.codeExec.workQueue.length === 0, '2T|script took too long to execute');
    }

    assertCompileError(s: string, expectErrMsg?: string, expectErrLine?: number) {
        return this.runGeneralCode(s, '', expectErrMsg, expectErrLine, true);
    }

    assertCompileErrorIn(s: string, expectErrMsg?: string, expectErrLine?: number) {
        return this.runGeneralCode('', s, expectErrMsg, expectErrLine, true);
    }

    assertLineError(s: string, expectErrMsg: string, expectErrLine: number) {
        return this.runGeneralCode('', s, expectErrMsg, expectErrLine, false);
    }

    testOneEvaluate(beforeLine: string, s: string, expectErrMsg?: string, expectErrLine?: number) {
        this.vcstate.runtime.codeExec.globals.set('testresult', VpcValS('(placeholder)'));
        let codeIn = `global testresult
${beforeLine}
put ${s} into testresult`;
        this.runGeneralCode('', codeIn, expectErrMsg, expectErrLine);
        return this.vcstate.runtime.codeExec.globals.get('testresult');
    }

    testBatchEvaluate(tests: [string, string][], floatingPoint = false) {
        let getBeforeLine = (s: string): [string, string] => {
            let ptsWithRes = s.split('{RESULT}')
            if (ptsWithRes.length > 1) {
                assertTrue(ptsWithRes.length === 2, 'too many {RESULT}');
                return [ptsWithRes[0], ptsWithRes[1]]
            } else {
                let pts = s.split('\\');
                assertTrue(pts.length === 1 || pts.length === 2, '2S|too many \\');
                return pts.length === 2 ? [pts[0], pts[1]] : ['', pts[0]];
            }
        };

        let testsErr = tests.filter(item => item[1].startsWith('ERR:'));
        let testsNoErr = tests.filter(item => !item[1].startsWith('ERR:'));
        this.vcstate.runtime.codeExec.globals.set('donewithbatch', VpcValS('0'));
        let codeIn = `global donewithbatch\nput 0 into donewithbatch\n`;
        for (let i = 0; i < testsNoErr.length; i++) {
            this.vcstate.runtime.codeExec.globals.set(`testresult${i}`, VpcValS('(placeholder)'));
            let [beforeLine, expr] = getBeforeLine(testsNoErr[i][0]);
            codeIn += `global testresult${i}\n`;
            codeIn += `${beforeLine}\n`;
            codeIn += `put ${expr} into testresult${i}\n`;
        }

        codeIn += `put 1 into donewithbatch\n`;
        this.runGeneralCode('', codeIn);
        for (let i = 0; i < testsNoErr.length; i++) {
            let isDone = this.vcstate.runtime.codeExec.globals.get(`donewithbatch`);
            assertEq('1', isDone.readAsString(), '2R|did not complete every test?');

            let got = this.vcstate.runtime.codeExec.globals.get(`testresult${i}`);
            if (floatingPoint) {
                assertTrue(got.isItNumeric(), '2Q|not numeric', got.readAsString());
                assertEq(got.readAsString().trim(), got.readAsString(), '2P|why does it have whitespace');
                let expectString = testsNoErr[i][1];
                assertTrue(isFinite(parseFloat(expectString)), '2O|not numeric');
                if (
                    this.evalHelpers
                        .evalOp(VpcValN(parseFloat(expectString)), got, VpcOpCtg.OpEqualityGreaterLessOrContains, '==')
                        .readAsString() !== 'true'
                ) {
                    UI512TestBase.warnAndAllowToContinue(`DIFF RESULT input=${testsNoErr[i][0].replace(/\n/g, '; ')} expected=`);
                    console.error(`${expectString} output=`);
                    console.error(`${got.readAsString()}`);
                }
            } else {
                let gt = got.readAsString();
                let expt = testsNoErr[i][1];
                if (gt !== expt) {
                    UI512TestBase.warnAndAllowToContinue(`DIFF RESULT input=${testsNoErr[i][0].replace(/\n/g, '; ')} expected=`);
                    console.error(`${expt.replace(/\n/g, '; ')} output=`);
                    console.error(`${gt.replace(/\n/g, '; ')}`);
                }
            }
        }

        for (let i = 0; i < testsErr.length; i++) {
            let [beforeLine, expr] = getBeforeLine(testsErr[i][0]);
            let errOnLine = beforeLine.length ? 4 : 5;
            let expectErr = testsErr[i][1].replace(/ERR:/g, '');
            if (expectErr.includes( ':') && isFinite(Util512.parseInt(expectErr.split(':')[0], base10))) {
                errOnLine = Util512.parseInt(expectErr.split(':')[0]);
                expectErr = expectErr.split(':')[1];
            }

            let got = this.testOneEvaluate(beforeLine, expr, expectErr, errOnLine);

            assertEq(
                '(placeholder)',
                got.readAsString(),
                '2K|expected to get an error and not actually assign anything'
            );
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
            throw makeVpcInternalErr('2J|could not flip ' + s);
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
                throw makeVpcInternalErr('2H|unknown op ' + op);
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
                throw makeVpcInternalErr('2F|unknown op ' + op);
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
            return [pts[0] + ' ' + flipOperation(pts[1])[1] + ' ' + pts[2], this.flipBool(expected)];
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

    tests = [
        'test_jslru',
        () => {
            let testmap = new ExpLRUMap<string, number>(3);
            testmap.set('a', 1);
            testmap.set('b', 2);
            testmap.set('c', 3);
            assertTrue(testmap.has('a'), '2B|');
            assertTrue(testmap.has('b'), '2A|');
            assertTrue(testmap.has('c'), '29|');
            testmap.set('d', 4);
            assertTrue(!testmap.has('a'), '28|');
            assertTrue(testmap.has('b'), '27|');
            assertTrue(testmap.has('c'), '26|');
            assertTrue(testmap.has('d'), '25|');
        }
    ];
}
