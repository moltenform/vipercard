
/* auto */ import { ScriptTestBatch } from './../../vpc/vpcTestScriptRunBase';
/* auto */ import { PropAdjective } from './../../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcBuiltinFunctionsDateUtils } from './../../../vpc/codepreparse/vpcBuiltinFunctionsUtils';
/* auto */ import { cProductName, vpcVersion } from './../../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../../ui512/utils/util512Assert';
/* auto */ import { Util512, assertWarnEq, longstr } from './../../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../../testUtils/testUtils';
/* auto */ import { h3 } from './../test03lexer';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollection03propsComputed');
export let testCollection03propsComputed = t;

t.atest('--init--testCollection03propsComputed', async () => {
    assertTrue(
        h3,
        longstr(`V1|forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`)
    );
});
t.test('03internalid property', () => {
    let b = new ScriptTestBatch();
    b.t(`the internalid of cd btn id ${h3.ids.bBC1}`, `${h3.ids.bBC1}`);
    b.t(`the long internalid of cd btn id ${h3.ids.bBC1}`, `${h3.ids.bBC1}`);
    b.t(`the short internalid of cd btn id ${h3.ids.bBC1}`, `${h3.ids.bBC1}`);
    b.t(`the internalid of cd fld id ${h3.ids.fBC1}`, `${h3.ids.fBC1}`);
    b.t(`the internalid of cd id ${h3.ids.cdBC}`, `${h3.ids.cdBC}`);
    b.t(`the internalid of bg id ${h3.ids.bgC}`, `${h3.ids.bgC}`);
    b.t(`the internalid of stack id ${h3.ids.stack}`, `${h3.ids.stack}`);
    b.batchEvaluate(h3);
});
t.test('03number computed property', () => {
    let b = new ScriptTestBatch();
    b.t(`the number of ${cProductName}`, `ERR:does not have`);
    b.t(`the number of stack id ${h3.ids.stack}`, `1`);
    b.t(`the number of this stack`, `1`);
    b.t(`the number of stack id -9`, `ERR: could not find`);
    b.t(`the number of bg id ${h3.ids.bgA}`, `1`);
    b.t(`the short number of bg id ${h3.ids.bgA}`, `1`);
    b.t(`the long number of bg id ${h3.ids.bgA}`, `1`);
    b.t(`the abbr number of bg id ${h3.ids.bgA}`, `1`);
    b.t(`the number of bg id ${h3.ids.bgB}`, `2`);
    b.t(`the number of bg id ${h3.ids.bgC}`, `3`);
    b.t(`the number of bg id ${h3.ids.bgD}`, `4`);
    b.t(`the number of cd id ${h3.ids.cdA}`, `1`);
    b.t(`the number of cd id ${h3.ids.cdBB}`, `2`);
    b.t(`the number of cd id ${h3.ids.cdBC}`, `3`);
    b.t(`the number of cd id ${h3.ids.cdBD}`, `4`);
    b.t(`the number of cd id ${h3.ids.cdCD}`, `5`);
    b.t(`the number of cd id ${h3.ids.cdDD}`, `6`);
    b.t(`the number of cd id ${h3.ids.cdDE}`, `7`);
    b.t(`the number of cd id ${h3.ids.cdDF}`, `8`);
    b.t(`the number of cd id ${h3.ids.cdDG}`, `9`);
    b.t(`the number of cd id ${h3.ids.cdDH}`, `10`);
    b.t(`the number of cd id ${h3.ids.cdDH}`, `10`);
    b.t(`the number of cd btn id ${h3.ids.bDE1}`, `1`);
    b.t(`the number of cd btn id ${h3.ids.bDE2}`, `2`);
    b.t(`the number of cd btn id ${h3.ids.bDE3}`, `3`);
    b.t(`the number of cd fld id ${h3.ids.fDE1}`, `1`);
    b.t(`the number of cd fld id ${h3.ids.fDE2}`, `2`);
    b.t(`the number of cd fld id ${h3.ids.fDE3}`, `3`);
    /* current card should not matter */
    let tests = b.tests;
    h3.pr.setCurCardNoOpenCardEvt(h3.ids.cdA);
    b.batchEvaluate(h3);
    b = new ScriptTestBatch();
    b.tests = tests;
    h3.pr.setCurCardNoOpenCardEvt(h3.ids.cdDD);
    b.batchEvaluate(h3);
});
t.test('03owner computed property', () => {
    for (let compatmode of [true, false]) {
        let b = new ScriptTestBatch();
        b.t(`set the compatibilitymode of this stack to ${compatmode}\\1`, `1`);
        b.t(`set the name of this stack to ""\\1`, `1`);
        b.t(`the owner of ${cProductName}`, `ERR:Cannot get owner`);
        b.t(`the owner of this stack`, `ERR:Cannot get owner`);
        b.t(`the owner of bg 1`, `stack id ${h3.ids.stack}`);
        b.t(`the long owner of bg 1`, `stack id ${h3.ids.stack}`);
        b.t(`the short owner of bg 1`, `${h3.ids.stack}`);
        if (compatmode) {
            b.t(`the owner of cd 1`, `bkgnd "a"`);
            b.t(`the long owner of cd 1`, `bkgnd "a" of stack ""`);
            b.t(`the short owner of cd 1`, `a`);
            b.t(`the owner of cd 9`, `bkgnd "d"`);
            b.t(`the long owner of cd 9`, `bkgnd "d" of stack ""`);
            b.t(`the short owner of cd 9`, `d`);
        } else {
            b.t(`the owner of cd 1`, `bkgnd id ${h3.ids.bgA}`);
            b.t(`the long owner of cd 1`, `bkgnd id ${h3.ids.bgA}`);
            b.t(`the short owner of cd 1`, `${h3.ids.bgA}`);
            b.t(`the owner of cd 9`, `bkgnd id ${h3.ids.bgD}`);
            b.t(`the long owner of cd 9`, `bkgnd id ${h3.ids.bgD}`);
            b.t(`the short owner of cd 9`, `${h3.ids.bgD}`);
        }

        b.t(`the owner of cd btn id ${h3.ids.bDE2}`, `card id ${h3.ids.cdDE}`);
        b.t(`the long owner of cd btn id ${h3.ids.bDE2}`, `card id ${h3.ids.cdDE}`);
        b.t(`the short owner of cd btn id ${h3.ids.bDE2}`, `${h3.ids.cdDE}`);
        b.t(`the owner of cd btn id ${h3.ids.bBC1}`, `card id ${h3.ids.cdBC}`);
        b.t(`the long owner of cd btn id ${h3.ids.bBC1}`, `card id ${h3.ids.cdBC}`);
        b.t(`the short owner of cd btn id ${h3.ids.bBC1}`, `${h3.ids.cdBC}`);
        b.t(`the owner of cd fld id ${h3.ids.fDE2}`, `card id ${h3.ids.cdDE}`);
        b.t(`the long owner of cd fld id ${h3.ids.fDE2}`, `card id ${h3.ids.cdDE}`);
        b.t(`the short owner of cd fld id ${h3.ids.fDE2}`, `${h3.ids.cdDE}`);
        b.t(`the owner of cd fld id ${h3.ids.fBC1}`, `card id ${h3.ids.cdBC}`);
        b.t(`the long owner of cd fld id ${h3.ids.fBC1}`, `card id ${h3.ids.cdBC}`);
        b.t(`the short owner of cd fld id ${h3.ids.fBC1}`, `${h3.ids.cdBC}`);
        b.batchEvaluate(h3);
    }
});
t.test('03target computed property', () => {
    h3.pr.setCurCardNoOpenCardEvt(h3.ids.cdA);
    let b = new ScriptTestBatch();
    b.t(`set the compatibilitymode of this stack to true\\1`, `1`);
    b.t(`the target`, `card button "go"`);
    b.t(`the long target`, `card button "go" of card "a" of stack ""`);
    b.t(`the short target`, `go`);
    b.t(`set the compatibilitymode of this stack to false\\1`, `1`);
    b.t(`the target`, `card button id ${h3.ids.go}`);
    b.t(`the long target`, `card button id ${h3.ids.go}`);
    b.t(`the short target`, `${h3.ids.go}`);
    b.batchEvaluate(h3);
});
t.test('03date computed property', () => {
    let b = new ScriptTestBatch();
    b.t(`global d1\\1`, `1`);
    b.t(`put "" into d1\\1`, `1`);
    b.t(`put "~" & the date after d1\\1`, `1`);
    b.t(`put "~" & the short date after d1\\1`, `1`);
    b.t(`put "~" & the abbrev date after d1\\1`, `1`);
    b.t(`put "~" & the long date after d1\\1`, `1`);
    b.t(`put "~" & the English date after d1\\1`, `1`);
    b.batchEvaluate(h3);
    let d1 = h3.vcstate.vci.getCodeExec().globals.get('d1');
    let pts = d1.readAsString().split('~');
    assertWarn('' === pts[0], 'V0|');
    assertWarn(/[0-9]+\/[0-9]+\/[0-9]+/.test(pts[1]), 'U~|');
    assertWarn(/[0-9]+\/[0-9]+\/[0-9]+/.test(pts[2]), 'U}|');
    assertWarn(/[a-zA-Z]{3}, [a-zA-Z]{3} [0-9]+, [0-9]+/.test(pts[3]), 'U||');
    assertWarn(/[a-zA-Z]+, [a-zA-Z]+ [0-9]+, [0-9]+/.test(pts[4]), 'U{|');
    assertWarn(/[a-zA-Z]+, [a-zA-Z]+ [0-9]+, [0-9]+/.test(pts[5]), 'U_|');
    let testDateUtils: any = Util512.shallowClone(VpcBuiltinFunctionsDateUtils);
    testDateUtils._getDateCurrent = () => {
        return [0, 1, 0, 1900];
    };
    assertWarnEq(
        'Sun, Jan 1, 1900',
        testDateUtils.go(PropAdjective.Abbrev).readAsString(),
        'U^|'
    );
    assertWarnEq('1/1/1900', testDateUtils.go(PropAdjective.Empty).readAsString(), 'U]|');
    assertWarnEq(
        'Sunday, January 1, 1900',
        testDateUtils.go(PropAdjective.Long).readAsString(),
        'U[|'
    );
    assertWarnEq('1/1/1900', testDateUtils.go(PropAdjective.Short).readAsString(), 'U@|');
    testDateUtils._getDateCurrent = () => {
        return [6, 31, 11, 2025];
    };
    assertWarnEq(
        'Sat, Dec 31, 2025',
        testDateUtils.go(PropAdjective.Abbrev).readAsString(),
        'U?|'
    );
    assertWarnEq(
        '12/31/2025',
        testDateUtils.go(PropAdjective.Empty).readAsString(),
        'U>|'
    );
    assertWarnEq(
        'Saturday, December 31, 2025',
        testDateUtils.go(PropAdjective.Long).readAsString(),
        'U=|'
    );
    assertWarnEq(
        '12/31/2025',
        testDateUtils.go(PropAdjective.Short).readAsString(),
        'U<|'
    );
});
t.test('03version computed property', () => {
    let b = new ScriptTestBatch();
    b.t(`the version`, vpcVersion[4] + '.' + vpcVersion[6]);
    b.t(`the short version`, vpcVersion[4] + '.' + vpcVersion[6]);
    b.t(`the long version`, `${vpcVersion}`);
    b.batchEvaluate(h3);
});
