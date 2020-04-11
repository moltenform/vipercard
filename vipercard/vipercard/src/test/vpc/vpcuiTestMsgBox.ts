
/* auto */ import { RememberHistory } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { VpcNonModalReplBox } from './../../vpcui/nonmodaldialogs/vpcReplMessageBox';
/* auto */ import { assertEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * tests on FormattedText
 */
let t = new SimpleUtil512TestCollection('testCollectionvpcuiMsgBox');
export let testCollectionvpcuiMsgBox = t;

t.test('VpcNonModalReplBox.makeAllVarsGlobals with no input', () => {
    let s = '';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq([], got, 'Gi|');
});
t.test('VpcNonModalReplBox.makeAllVarsGlobals with typical input', () => {
    let s = 'put 4 into myVar';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq(['global myVar'], got, 'Gh|');
});
t.test('with underscore', () => {
    t.say(
        longstr(`VpcNonModalReplBox.makeAllVarsGlobals
        with typical input with underscore`)
    );
    let s = 'put 4 into my_var';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq(['global my_var'], got, 'Gg|');
});
t.test('VpcNonModalReplBox1', () => {
    t.say(
        longstr(`VpcNonModalReplBox.makeAllVarsGlobals
        with typical input with leading underscore`)
    );
    let s = 'put 4 into _my_var';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq(['global _my_var'], got, 'Gf|');
});
t.test('VpcNonModalReplBox.makeAllVarsGlobals with customHandler', () => {
    let s = 'myCustomFn 4, myVar';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq(['global myVar'], got, 'Ge|');
});
t.test('VpcNonModalReplBox.makeAllVarsGlobals with no symbols', () => {
    let s = 'exit repeat';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq([], got, 'Gd|');
});
t.test('VpcNonModalReplBox.makeAllVarsGlobals with only numbers and strings', () => {
    let s = 'return 123 & "notvars x y z"';
    let got: string[] = [];
    s = VpcNonModalReplBox.removeStringLiterals(s);
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq([], got, 'Gc|');
});
t.test('VpcNonModalReplBox.makeAllVarsGlobals, propnames can be vars', () => {
    let s = 'put result + card background sin italic autohilite into on mouseUp';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq(['global autohilite'], got, 'Gb|');
});
t.test('VpcNonModalReplBox.makeAllVarsGlobals with only reserved keywords', () => {
    let s = 'put result + card background sin italic into on mouseUp';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq([], got, 'Gb|');
});
t.test('VpcNonModalReplBox.makeAllVarsGlobals should skip fn calls', () => {
    let s = 'put 4 + myFunction() into myVar';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq(['global myVar'], got, 'Ga|');
});
t.test('VpcNonModalReplBox.makeAllVarsGlobals should skip fn calls at end', () => {
    let s = 'put 4 + myFunction(x) into myFunction()';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq(['global x'], got, 'GZ|');
});
t.test('VpcNonModalReplBox.makeAllVarsGlobals should skip fn calls with args', () => {
    let s = 'put 4 + myFunction(1,2) into myVar';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq(['global myVar'], got, 'GY|');
});
t.test('VpcNonModalReplBox.makeAllVarsGlobals with input referencing many', () => {
    let s = 'aCustomHandler x + (y * var1/var2)+x+y into myVar';
    let got: string[] = [];
    VpcNonModalReplBox.makeAllVarsGlobals(got, s);
    assertEq(
        [
            'global x',
            'global y',
            'global var1',
            'global var2',
            'global x',
            'global y',
            'global myVar'
        ],
        got,
        'GX|'
    );
});
let fallbackReturnsEmpty = () => '';
t.test('VpcNonModalReplBox.RememberHistory walk previous with no history', () => {
    let h = new RememberHistory();
    assertEq('', h.walkPrevious(fallbackReturnsEmpty), 'GW|');
    assertEq('', h.walkPrevious(fallbackReturnsEmpty), 'GV|');
    assertEq('', h.walkPrevious(fallbackReturnsEmpty), 'GU|');
});
t.test('VpcNonModalReplBox.RememberHistory walk next with no history', () => {
    let h = new RememberHistory();
    assertEq('', h.walkNext(fallbackReturnsEmpty), 'GT|');
    assertEq('', h.walkNext(fallbackReturnsEmpty), 'GS|');
    assertEq('', h.walkNext(fallbackReturnsEmpty), 'GR|');
});
t.test('VpcNonModalReplBox.RememberHistory walk through history', () => {
    let h = new RememberHistory();
    h.append('aa');
    h.append('bb');
    h.append('cc');
    h.append('dd');
    assertEq('', h.walkNext(fallbackReturnsEmpty), 'GQ|');
    assertEq('', h.walkNext(fallbackReturnsEmpty), 'GP|');
    assertEq('', h.walkNext(fallbackReturnsEmpty), 'GO|');
    assertEq('dd', h.walkPrevious(fallbackReturnsEmpty), 'GN|');
    assertEq('cc', h.walkPrevious(fallbackReturnsEmpty), 'GM|');
    assertEq('bb', h.walkPrevious(fallbackReturnsEmpty), 'GL|');
    assertEq('aa', h.walkPrevious(fallbackReturnsEmpty), 'GK|');
    assertEq('aa', h.walkPrevious(fallbackReturnsEmpty), 'GJ|');
    assertEq('aa', h.walkPrevious(fallbackReturnsEmpty), 'GI|');
    assertEq('bb', h.walkNext(fallbackReturnsEmpty), 'GH|');
    assertEq('cc', h.walkNext(fallbackReturnsEmpty), 'GG|');
    assertEq('dd', h.walkNext(fallbackReturnsEmpty), 'GF|');
    assertEq('', h.walkNext(fallbackReturnsEmpty), 'GE|');
    assertEq('', h.walkNext(fallbackReturnsEmpty), 'GD|');
});
t.test('VpcNonModalReplBox.RememberHistory add during going back', () => {
    let h = new RememberHistory();
    h.append('aa');
    h.append('bb');
    h.append('cc');
    assertEq('cc', h.walkPrevious(fallbackReturnsEmpty), 'GC|');
    assertEq('bb', h.walkPrevious(fallbackReturnsEmpty), 'GB|');
    h.append('dd');
    assertEq('dd', h.walkPrevious(fallbackReturnsEmpty), 'GA|');
    assertEq('cc', h.walkPrevious(fallbackReturnsEmpty), 'G9|');
});
