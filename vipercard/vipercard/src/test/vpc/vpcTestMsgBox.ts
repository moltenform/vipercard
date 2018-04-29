
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { RememberHistory, VpcNonModalReplBox } from '../../vpcui/nonmodaldialogs/vpcReplMessageBox.js';

/**
 * tests on FormattedText
 */
let mTests: (string | Function)[] = [
    'VpcNonModalReplBox.makeAllVarsGlobals with no input',
    () => {
        let s = '';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq([], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals with typical input',
    () => {
        let s = 'put 4 into myVar';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq(['global myVar'], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals with typical input with underscore',
    () => {
        let s = 'put 4 into my_var';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq(['global my_var'], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals with typical input with leading underscore',
    () => {
        let s = 'put 4 into _my_var';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq(['global _my_var'], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals with customHandler',
    () => {
        let s = 'myCustomFn 4, myVar';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq(['global myVar'], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals with no symbols',
    () => {
        let s = 'exit repeat';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq([], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals with only numbers and strings',
    () => {
        let s = 'return 123 & "notvars x y z"';
        let got: string[] = [];
        s = VpcNonModalReplBox.removeStringLiterals(s);
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq([], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals with only reserved keywords',
    () => {
        let s = 'put result + card background sin italic autohilite into on mouseUp';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq([], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals should skip fn calls',
    () => {
        let s = 'put 4 + myFunction() into myVar';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq(['global myVar'], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals should skip fn calls at end',
    () => {
        let s = 'put 4 + myFunction(x) into myFunction()';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq(['global x'], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals should skip fn calls with args',
    () => {
        let s = 'put 4 + myFunction(1,2) into myVar';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq(['global myVar'], got, '');
    },
    'VpcNonModalReplBox.makeAllVarsGlobals with input referencing many',
    () => {
        let s = 'aCustomHandler x + (y * var1/var2)+x+y into myVar';
        let got: string[] = [];
        VpcNonModalReplBox.makeAllVarsGlobals(got, s);
        assertEq(
            ['global x', 'global y', 'global var1', 'global var2', 'global x', 'global y', 'global myVar'],
            got,
            ''
        );
    },
    'VpcNonModalReplBox.RememberHistory walk previous with no history',
    () => {
        let h = new RememberHistory();
        assertEq('', h.walkPrevious(), '');
        assertEq('', h.walkPrevious(), '');
        assertEq('', h.walkPrevious(), '');
    },
    'VpcNonModalReplBox.RememberHistory walk next with no history',
    () => {
        let h = new RememberHistory();
        assertEq('', h.walkNext(), '');
        assertEq('', h.walkNext(), '');
        assertEq('', h.walkNext(), '');
    },
    'VpcNonModalReplBox.RememberHistory walk through history',
    () => {
        let h = new RememberHistory();
        h.append('aa');
        h.append('bb');
        h.append('cc');
        h.append('dd');
        assertEq('', h.walkNext(), '');
        assertEq('', h.walkNext(), '');
        assertEq('', h.walkNext(), '');
        assertEq('dd', h.walkPrevious(), '');
        assertEq('cc', h.walkPrevious(), '');
        assertEq('bb', h.walkPrevious(), '');
        assertEq('aa', h.walkPrevious(), '');
        assertEq('aa', h.walkPrevious(), '');
        assertEq('aa', h.walkPrevious(), '');
        assertEq('bb', h.walkNext(), '');
        assertEq('cc', h.walkNext(), '');
        assertEq('dd', h.walkNext(), '');
        assertEq('', h.walkNext(), '');
        assertEq('', h.walkNext(), '');
    },
    'VpcNonModalReplBox.RememberHistory add during going back',
    () => {
        let h = new RememberHistory();
        h.append('aa');
        h.append('bb');
        h.append('cc');
        assertEq('cc', h.walkPrevious(), '');
        assertEq('bb', h.walkPrevious(), '');
        h.append('dd');
        assertEq('dd', h.walkPrevious(), '');
        assertEq('cc', h.walkPrevious(), '');
    }
];

/**
 * exported test class for mTests
 */
export class TestVpcMsgBox extends UI512TestBase {
    tests = mTests;
}
