
/* auto */ import { VpcValBool, VpcValN } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { BatchType, ScriptTestBatch, TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { VpcStateSerialize } from './../../vpcui/state/vpcStateSerialize';
/* auto */ import { VpcState } from './../../vpcui/state/vpcState';
/* auto */ import { VpcDocumentLocation, VpcIntroProvider } from './../../vpcui/intro/vpcIntroProvider';
/* auto */ import { VpcElType } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './../../vpc/vel/velStack';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { VpcElCard } from './../../vpc/vel/velCard';
/* auto */ import { VpcElButton } from './../../vpc/vel/velButton';
/* auto */ import { VpcElBg } from './../../vpc/vel/velBg';
/* auto */ import { cProductName, vpcVersion } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { assertEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { specialCharFontChange } from './../../ui512/drawtext/ui512DrawTextClasses';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper, assertAsserts, assertThrows } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * test running ViperCard scripts that evaluate simple computation expressions.
 *
 * the syntax for a "test batch" is a tuple
 * [{script expression}, {expected result}]
 * for example, the following test passes:
 * ['1 + 1', '2']
 *
 * if you are testing a more complex expression or
 * command, you can write multiple lines, and use \\
 * at the end of the string to indicate what should be compared,
 * for example,
 *  ['put 1 + 1 into x\\x', '2']
 *
 *  or even
 *  ['put 1 into a \n put a + 1 into x\\x', '2']
 * the \\x means to evaluate x and compare it with 2.
 *
 *
 * use testBatchEvalInvertAndCommute to comfirm all four permutations,
 * since if a == b, we also confirm that
 * b == a, a != b, and b != a
 */

let t = new SimpleUtil512TestCollection('testCollectionScriptExprLvl');
export let testCollectionScriptExprLvl = t;

let h = YetToBeDefinedTestHelper<TestVpcScriptRunBaseForScriptExpr>();

t.atest('--init--testScriptExprLvl', async () => {
    h = new TestVpcScriptRunBaseForScriptExpr(t);
    return h.initEnvironment();
});

t.test('evalRuleExpr,RuleLvl1', () => {
    let b = new ScriptTestBatch();

    /* basic tests */
    b.t('123', '123');
    b.t('1 + 2', '3');
    b.t('"abc"', 'abc');
    b.t('1 + xyz', 'ERR:no variable found with this name');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* RuleExpr and/or with data types */
    b.t('true _and_ "true"', 'true');
    b.t('true _and_ "true "', 'true');
    b.t('true _and_ "true    "', 'true');
    b.t('true _and_ " true"', 'ERR:expected true or false');
    b.t('true _and_ 1', 'ERR:expected true or false');
    b.t('1 _and_ true', 'ERR:expected true or false');
    b.t('1 _and_ 1', 'ERR:expected true or false');

    /* RuleExpr and /or */
    b.t('true _and_ true', 'true');
    b.t('true _and_ false', 'false');
    b.t('false _and_ false', 'false');
    b.t('true _or_ true', 'true');
    b.t('true _or_ false', 'true');
    b.t('false _or_ false', 'false');

    b.batchEvaluate(h, BatchType.testBatchEvalCommutative);
    b = new ScriptTestBatch()

    /* Lvl1Expression greater less, strings */
    b.t('"abc" _>=_ "abc"', 'true');
    b.t('"abc" _>=_ "abb"', 'true');
    b.t('"abc" _>=_ "abd"', 'false');
    b.t('"abc" _>=_ "ab"', 'true');
    b.t('"abc" _>=_ "ab "', 'true');
    b.t('"abc" _>=_ "abcd"', 'false');
    b.t('"abc" _>=_ "abc "', 'false');
    b.t('"abc" _>=_ " abc"', 'true');
    b.t('"abc" _>_ "abc"', 'false');
    b.t('"abc" _>_ "abb"', 'true');
    b.t('"abc" _>_ "abd"', 'false');
    b.t('"abc" _>_ "ab"', 'true');
    b.t('"abc" _>_ "ab "', 'true');
    b.t('"abc" _>_ "abcd"', 'false');
    b.t('"abc" _>_ "abc "', 'false');
    b.t('"abc" _>_ " abc"', 'true');

    /* Lvl1Expression eq, strings */
    b.t('"abc" _=_ "abc"', 'true');
    b.t('"abc" _=_ "abb"', 'false');
    b.t('"abc" _=_ "abc "', 'false');
    b.t('"abc" _==_ "abc"', 'true');
    b.t('"abc" _==_ "abb"', 'false');
    b.t('"abc" _==_ "abc "', 'false');
    b.t('"abc" _is_ "abc"', 'true');
    b.t('"abc" _is_ "abb"', 'false');
    b.t('"abc" _is_ "abc "', 'false');

    b.batchEvaluate(h, BatchType.testBatchEvalInvertAndCommute);
    b = new ScriptTestBatch()

    /* Lvl1Expression string/number differences */
    b.t('"z11" _>_ "z2"', 'false');
    b.t('"z11" _>_ "z2 "', 'false');
    b.t('"z 11" _>_ "z 2"', 'false');
    b.t('"11 a" _>_ "2 a"', 'false');
    b.t('"11e" _>_ "2e"', 'false');
    b.t('"11:" _>_ "2:"', 'false');
    b.t('11 _>_ 2', 'true');
    b.t('"11" _>_ "2"', 'true');
    b.t('"11" _>_ "2 "', 'true');
    b.t('"11 " _>_ "2 "', 'true');
    b.t('" 11 " _>_ " 2 "', 'true');
    b.t('"z11" _>=_ "z2"', 'false');
    b.t('"z11" _>=_ "z2 "', 'false');
    b.t('"z 11" _>=_ "z 2"', 'false');
    b.t('"11 a" _>=_ "2 a"', 'false');
    b.t('"11e" _>=_ "2e"', 'false');
    b.t('"11:" _>=_ "2:"', 'false');
    b.t('11 _>=_ 2', 'true');
    b.t('"11" _>=_ "2"', 'true');
    b.t('"11" _>=_ "2 "', 'true');
    b.t('"11 " _>=_ "2 "', 'true');
    b.t('" 11 " _>=_ " 2 "', 'true');

    /* Lvl1Expression greater less, numbers */
    b.t('4 _>=_ 4', 'true');
    b.t('4.1 _>=_ 4', 'true');
    b.t('3.9 _>=_ 4', 'false');
    b.t('"4.000" _>=_ 4', 'true');
    b.t('"00004" _>=_ 4', 'true');
    b.t('4 _>=_ -4', 'true');
    b.t('-4 _>=_ -4', 'true');
    b.t('-4 _>=_ "-4"', 'true');
    b.t('-4 _>=_ " -0004.000 "', 'true');
    b.t('4 _>_ 4', 'false');
    b.t('4.1 _>_ 4', 'true');
    b.t('3.9 _>_ 4', 'false');
    b.t('"4.000" _>_ 4', 'false');
    b.t('"00004" _>_ 4', 'false');
    b.t('4 _>_ -4', 'true');
    b.t('-4 _>_ -4', 'false');
    b.t('-4 _>_ "-4"', 'false');
    b.t('-4 _>_ " -0004.000 "', 'false');

    /* Lvl1Expression equality and inequality, see also vpcutils test of VpcEvalHelpers */
    b.t('456 _=_ 456', 'true');
    b.t('456 _=_ " 456 "', 'true');
    b.t('456 _=_ " 456"', 'true');
    b.t('456 _=_ "456 "', 'true');
    b.t('456 _=_ 457', 'false');
    b.t('456 _=_ " 457 "', 'false');
    b.t('456 _=_ 00456.000', 'true');
    b.t('456 _=_ "00456.000"', 'true');
    b.t('456 _=_ " 00456.000 "', 'true');
    b.t('456 _=_ " 00456..000 "', 'false');
    b.t('456 _=_ " 00456.0.00 "', 'false');
    b.t('456 _=_ " 00456.000. "', 'false');
    b.t('456 _=_ "  456.0000000001 "', 'true');
    b.t('456 _=_ "  455.9999999999 "', 'true');

    /* prefix, suffix */
    b.t('123 _=_ 123', 'true');
    b.t('123 _=_ 1234', 'false');
    b.t('123 _=_ 12', 'false');
    b.t('123 _=_ -123', 'false');

    /* different tokens with same meaning */
    b.t('123 _=_ 123', 'true');
    b.t('123 _=_ 124', 'false');
    b.t('123 _=_ " 123 "', 'true');
    b.t('123 _=_ 0', 'false');
    b.t('123 _==_ 123', 'true');
    b.t('123 _==_ 124', 'false');
    b.t('123 _==_ " 123 "', 'true');
    b.t('123 _==_ 0', 'false');
    b.t('123 _is_ 123', 'true');
    b.t('123 _is_ 124', 'false');
    b.t('123 _is_ " 123 "', 'true');
    b.t('123 _is_ 0', 'false');

    b.batchEvaluate(h, BatchType.testBatchEvalInvertAndCommute);
    b = new ScriptTestBatch()

    /* test chaining or any other that can't easily be unverted */
    b.t('true and true and true', 'true');
    b.t('true and true and true and true', 'true');
    b.t('true and true and false', 'false');

    /* Lvl1Expression contains, strings */
    b.t('"abc" contains "abc"', 'true');
    b.t('"abc" contains "abd"', 'false');
    b.t('"abc" contains "ab"', 'true');
    b.t('"abc" contains "c"', 'true');
    b.t('"abc" contains "d"', 'false');
    b.t('"abc" contains ""', 'true');
    b.t('"ab" contains "abc"', 'false');
    b.t('"c" contains "abc"', 'false');
    b.t('"d" contains "abc"', 'false');
    b.t('"" contains "abc"', 'false');

    /* can be chained, visitor code is more elegant if this is allowed */
    b.t('12 == 13 == 14', 'false');
    b.t('12 == 12 == true', 'true');
    b.t('12 == 12 == "true"', 'true');
    b.t('12 == 13 == true', 'false');
    b.t('12 == 12 == false', 'false');

    b.batchEvaluate(h);
});
t.test('evalExprConfirmFailure', () => {
    /* succeeds */
    let b = new ScriptTestBatch();
    b.t('true and true', 'true');
    b.t('true and false', 'false');
    b.t('1 is a integer', 'true');
    b.t('1 is a integer1', 'ERR:needs one of');
    b.batchEvaluate(h);

    /* fails, wrong result */
    assertAsserts('Q)|', 'DIFF RESULT', () => {
        b = new ScriptTestBatch();
        b.t('true and false', 'true');
        b.batchEvaluate(h);
    });
    /* fails, runtime err */
    assertAsserts('Q(|', 'needs one of', () => {
        b = new ScriptTestBatch();
        b.t('1 is a integer1', 'true');
        b.batchEvaluate(h);
    });
    /* fails, runtime err with wrong message */
    assertAsserts('Q&|', 'wrong err message', () => {
        b = new ScriptTestBatch();
        b.t('1 is a integer1', 'ERR:(incorrectmessage)');
        b.batchEvaluate(h);
    });
    /* runtime err expected but not got */
    assertAsserts('Q%|', 'error not seen', () => {
        b = new ScriptTestBatch();
        b.t('true and false', 'ERR:(incorrectmessage)');
        b.batchEvaluate(h);
    });
    /* fails, wrong result, lower */
    assertAsserts('Q)|', 'DIFF RESULT', () => {
        b = new ScriptTestBatch();
        b.t('true and true', 'true');
        b.t('true and false', 'true');
        b.batchEvaluate(h);
    });
    /* fails, runtime err, lower */
    assertAsserts('Q(|', 'needs one of', () => {
        b = new ScriptTestBatch();
        b.t('true and true', 'true');
        b.t('1 is a integer1', 'true');
        b.batchEvaluate(h);
    });
    /* fails, runtime err with wrong message, lower */
    assertAsserts('Q&|', 'wrong err message', () => {
        b = new ScriptTestBatch();
        b.t('true and true', 'true');
        b.t('1 is a integer1', 'ERR:(incorrectmessage)');
        b.batchEvaluate(h);
    });
    /* runtime err expected but not got, lower */
    assertAsserts('Q%|', 'error not seen', () => {
        b = new ScriptTestBatch();
        b.t('true and true', 'true');
        b.t('true and false', 'ERR:(incorrectmessage)');
        b.batchEvaluate(h);
    });
});
t.test('evalRuleLvl2', () => {
    let b = new ScriptTestBatch();

    /* Lvl2Expression, type check, invalid keywords */
    b.t('1 is a number1', 'ERR:needs one of {number|');
    b.t('1 is a numbe', 'ERR:needs one of {number|');
    b.t('1 is a abcdef', 'ERR:needs one of {number|');
    b.t('1 is a n', 'ERR:needs one of {number|');
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* Lvl2Expression, type check */
    b.t('12 _is_ a number', 'true');
    b.t('12.0 _is_ a number', 'true');
    b.t('12.01 _is_ a number', 'true');
    b.t('" 12 " _is_ a number', 'true');
    b.t('" 0012.00 " _is_ a number', 'true');
    b.t('" 0012.01 " _is_ a number', 'true');
    b.t('" 12a " _is_ a number', 'false');
    b.t('" 12 a " _is_ a number', 'false');
    b.t('" a12 " _is_ a number', 'false');
    b.t('" a 12 " _is_ a number', 'false');
    b.t('12 _is_ a integer', 'true');
    b.t('12.0 _is_ a integer', 'true');
    b.t('12.01 _is_ a integer', 'false');
    b.t('" 12 " _is_ a integer', 'true');
    b.t('" 0012.00 " _is_ a integer', 'true');
    b.t('" 0012.01 " _is_ a integer', 'false');
    b.t('" 12a " _is_ a integer', 'false');
    b.t('" 12 a " _is_ a integer', 'false');
    b.t('" a12 " _is_ a integer', 'false');
    b.t('" a 12 " _is_ a integer', 'false');
    b.t('true _is_ a logical', 'true');
    b.t('false _is_ a logical', 'true');
    b.t('"true" _is_ a logical', 'true');
    b.t('"false" _is_ a logical', 'true');
    b.t('" true" _is_ a logical', 'false');

    /* a bit weird, but confirmed in original product */
    b.t('"true " _is_ a logical', 'true');
    b.t('("true" & cr) _is_ a logical', 'true');
    b.t('("true" & tab) _is_ a logical', 'true');
    b.t('("true   " & cr & cr & cr & tab & tab & tab) _is_ a logical', 'true');
    b.t('"truea" _is_ a logical', 'false');
    b.t('"true a" _is_ a logical', 'false');
    b.t('"true true" _is_ a logical', 'false');
    b.t('"atrue" _is_ a logical', 'false');
    b.t('"a true" _is_ a logical', 'false');
    b.t('"trub" _is_ a logical', 'false');
    b.t('"tru" _is_ a logical', 'false');
    b.t('" false" _is_ a logical', 'false');
    b.t('"false " _is_ a logical', 'true');
    b.t('"" _is_ a point', 'false');
    b.t('"12" _is_ a point', 'false');
    b.t('"12,12" _is_ a point', 'true');
    b.t('"12,a12" _is_ a point', 'false');
    b.t('"12,12a" _is_ a point', 'false');
    b.t('"a12,12" _is_ a point', 'false');
    b.t('"12a,12" _is_ a point', 'false');
    b.t('"12.0, 12.0" _is_ a point', 'true');
    b.t('"12.01, 12" _is_ a point', 'false');
    b.t('" 12 , 12 " _is_ a point', 'true');
    b.t('" 12 , 0012.00 " _is_ a point', 'true');
    b.t('" 12 , 0012.01 " _is_ a point', 'false');
    b.t('" 0012.00, 12  " _is_ a point', 'true');
    b.t('" 0012.01, 12  " _is_ a point', 'false');
    b.t('" 12,12,12 " _is_ a point', 'false');
    b.t('" 12,12,12,12 " _is_ a point', 'false');
    b.t('" 12,12 a " _is_ a point', 'false');
    b.t('" a 12,12 " _is_ a point', 'false');
    b.t('" , 12,12 " _is_ a point', 'false');
    b.t('" 12,12 , " _is_ a point', 'false');
    b.t('"" _is_ a rect', 'false');
    b.t('"12" _is_ a rect', 'false');
    b.t('"12,12" _is_ a rect', 'false');
    b.t('"12,12,12" _is_ a rect', 'false');
    b.t('"12,12,12,12" _is_ a rect', 'true');
    b.t('"12,12,12,12,12" _is_ a rect', 'false');
    b.t('"12a,12,12,12" _is_ a rect', 'false');
    b.t('"12,12a,12,12" _is_ a rect', 'false');
    b.t('"12,12,12a,12" _is_ a rect', 'false');
    b.t('"12,12,12,12a" _is_ a rect', 'false');
    b.t('"12.0, 13.0, 14.0, 15.0" _is_ a rect', 'true');
    b.t('"12.0, 13., 14, 15" _is_ a rect', 'true');
    b.t('"12.01, 13, 14, 15" _is_ a rect', 'false');
    b.t('" 12 , 13 , 14 , 15 " _is_ a rect', 'true');
    b.t('" 12 , 0013.00 , 14, 15" _is_ a rect', 'true');
    b.t('" 12 , 0013.01 , 14, 15" _is_ a rect', 'false');
    b.t('" 0012.00, 13 , 14, 15" _is_ a rect', 'true');
    b.t('" 0012.01, 13 , 14, 15" _is_ a rect', 'false');
    b.t('(cr & "12,13,14,15" & cr) _is_ a rect', 'true');
    b.t('" 12,13,14,15 a " _is_ a rect', 'false');
    b.t('" a 12,13,14,15 " _is_ a rect', 'false');
    b.t('" , 12,13,14,15 " _is_ a rect', 'false');
    b.t('" 12,13,14,15 , " _is_ a rect', 'false');

    b.batchEvaluate(h, BatchType.testBatchEvalInvert);
    b = new ScriptTestBatch()

    /* Lvl2Expression, is within */
    b.t('"" _is_ in "abc"', 'true');
    b.t('"a" _is_ in "abc"', 'true');
    b.t('"c" _is_ in "abc"', 'true');
    b.t('"bc" _is_ in "abc"', 'true');
    b.t('"bc " _is_ in "abc"', 'false');
    b.t('" bc" _is_ in "abc"', 'false');
    b.t('"x" _is_ in "abc"', 'false');
    b.t('"abc" _is_ in "abc"', 'true');
    b.t('"abd" _is_ in "abc"', 'false');
    b.t('"abcd" _is_ in "abc"', 'false');
    b.t('"abdd" _is_ in "abc"', 'false');
    b.t('"" _is_ within "abc"', 'true');
    b.t('"a" _is_ within "abc"', 'true');
    b.t('"c" _is_ within "abc"', 'true');
    b.t('"bc" _is_ within "abc"', 'true');
    b.t('"bc " _is_ within "abc"', 'false');
    b.t('" bc" _is_ within "abc"', 'false');
    b.t('"x" _is_ within "abc"', 'false');
    b.t('"abc" _is_ within "abc"', 'true');
    b.t('"abd" _is_ within "abc"', 'false');
    b.t('"abcd" _is_ within "abc"', 'false');
    b.t('"abdd" _is_ within "abc"', 'false');

    b.batchEvaluate(h, BatchType.testBatchEvalInvert);
});
t.test('evalRuleLvl3', () => {
    /* lvl3 expressions */
    let b = new ScriptTestBatch();
    b.t('"" & ""', '');
    b.t('"" & "abc"', 'abc');
    b.t('"abc" & ""', 'abc');
    b.t('"abc" & "def"', 'abcdef');
    b.t('1 & 2', '12');
    b.t('1 & "abc"', '1abc');
    b.t('"abc" & 1', 'abc1');
    b.t('1 & true', '1true');
    b.t('true & 1', 'true1');
    b.t('"" && ""', ' ');
    b.t('"" && "abc"', ' abc');
    b.t('"abc" && ""', 'abc ');
    b.t('"abc" && "def"', 'abc def');
    b.t('1 && 2', '1 2');
    b.t('1 && "abc"', '1 abc');
    b.t('"abc" && 1', 'abc 1');
    b.t('1 && true', '1 true');
    b.t('true && 1', 'true 1');

    /* chained */
    b.t('"a" & "b" & "c" & "d"', 'abcd');
    b.t('"a" & "b" && "c" & "d"', 'ab cd');
    b.t('"a" && "b" && "c" && "d"', 'a b c d');
    b.t('"a" && "b" && "c"', 'a b c');

    b.batchEvaluate(h);
});
t.test('evalArithmetic', () => {
    /* the communitative ones, integer */
    let b = new ScriptTestBatch();
    b.t('12 _+_ 34', '46');
    b.t('12 _+_ " 34 "', '46');
    b.t('12 _+_ " 0034.00 "', '46');
    b.t('1 _+_ 200000', '200001');
    b.t('1 _+_ 2', '3');
    b.t('1 _+_ -1', '0');
    b.t('123 _+_ 0', '123');
    b.t('123 _+_ -0', '123');
    b.t('12 _*_ 34', '408');
    b.t('12 _*_ " 34 "', '408');
    b.t('12 _*_ " 0034.00 "', '408');
    b.t('2 _*_ 200000', '400000');
    b.t('2 _*_ 2', '4');
    b.t('1 _*_ -1', '-1');
    b.t('123 _*_ 0', '0');
    b.t('123 _*_ -0', '0');

    b.batchEvaluate(h, BatchType.testBatchEvalCommutative);
    b = new ScriptTestBatch()

    /* the communitative ones, floating point */
    b.t('12 _+_ 34.1', '46.1');
    b.t('12 _+_ " 34.1 "', '46.1');
    b.t('12.7 _+_ " 0034.00 "', '46.7');
    b.t('1.7 _+_ 200000', '200001.7');
    b.t('1.1 _+_ 2.2', '3.3');
    b.t('1.1 _+_ -1.1', '0');
    b.t('123.9 _+_ 0', '123.9');
    b.t('123.9 _+_ -0', '123.9');
    b.t('12 _*_ 34.1', '409.2');
    b.t('12 _*_ " 34.1 "', '409.2');
    b.t('12 _*_ " 0034.01 "', '408.12');
    b.t('2 _*_ 200000.1', '400000.2');
    b.t('2.2 _*_ 2.4', '5.28');
    b.t('1.1 _*_ -1', '-1.1');
    b.t('123.9 _*_ 0', '0');
    b.t('123.9 _*_ -0', '0');
    b.batchEvaluate(h, BatchType.floatingPointCommutative);
    b = new ScriptTestBatch()

    /* the non-commutive ones integer */
    b.t('12 - 34', '-22');
    b.t('12 - " 34 "', '-22');
    b.t('12 - " 0034.00 "', '-22');
    b.t('1 - 200000', '-199999');
    b.t('1 - 2', '-1');
    b.t('1 - -1', '2');
    b.t('123 - 0', '123');
    b.t('123 - -0', '123');
    b.t('12 ^ 3', '1728');
    b.t('12 ^ " 3 "', '1728');
    b.t('12 ^ " 003.00 "', '1728');
    b.t('2 ^ 5', '32');
    b.t('2 ^ 2', '4');
    b.t('1 ^ -1', '1');
    b.t('123 ^ 0', '1');
    b.t('123 ^ -0', '1');
    b.t('34 div 5', '6');
    b.t('34 div 12', '2');
    b.t('34 div " 12 "', '2');
    b.t('34 div " 0012.00 "', '2');
    b.t('2 div 200000', '0');
    b.t('2 div 2', '1');
    b.t('1 div -1', '-1');
    b.t('123 div 0', 'ERR:> 1e18');
    b.t('123 div -0', 'ERR:> 1e18');
    b.t('34 mod 5', '4');
    b.t('34 mod 12', '10');
    b.t('34 mod " 12 "', '10');
    b.t('34 mod " 0012.00 "', '10');
    b.t('2 mod 200000', '2');
    b.t('2 mod 2', '0');
    b.t('1 mod -1', '0');
    b.t('123 mod 0', 'ERR:> 1e18');
    b.t('123 mod -0', 'ERR:> 1e18');

    /* negative numbers */
    b.t('34 div 5', '6');
    b.t('34 div -5', '-6');
    b.t('-34 div 5', '-6');
    b.t('-34 div -5', '6');
    b.t('34 mod 5', '4');
    b.t('34 mod -5', '4');
    b.t('-34 mod 5', '-4');
    b.t('-34 mod -5', '-4');

    b.batchEvaluate(h);
    b = new ScriptTestBatch()

    /* the non-commutive ones floating point */
    b.t('12.1 - 3.4', '8.7');
    b.t('12.1 - 34', '-21.9');
    b.t('12.1 - " 34 "', '-21.9');
    b.t('12.1 - " 0034.00 "', '-21.9');
    b.t('1.9 - 200000', '-199998.1');
    b.t('1.9 - 2', '-0.100000');
    b.t('1.9 - -1', '2.9');
    b.t('123.4 - 0', '123.4');
    b.t('123.4 - -0', '123.4');

    /* the non-commutive ones exponent */
    b.t('12 ^ 13', '106993205379072');
    b.t('12 ^ " 13 "', '106993205379072');
    b.t('12 ^ " 0013.00 "', '106993205379072');
    b.t('12 ^ 34', 'ERR:> 1e18');
    b.t('12.1 ^ 3.4', '4802.531908907492');
    b.t('12.1 ^ " 3.4 "', '4802.531908907492');
    b.t('12.1 ^ " 003.400 "', '4802.531908907492');
    b.t('2.1 ^ 7', '180.10885410000003');
    b.t('2.1 ^ 2', '4.41');
    b.t('1.9 ^ -1', '0.5263157894736842');
    b.t('123.4 ^ 0', '1');
    b.t('123.4 ^ -0', '1');
    b.t('34.5 / 5', '6.9');
    b.t('34.5 / 12', '2.875');
    b.t('34.5 / " 12 "', '2.875');
    b.t('34.5 / " 0012.00 "', '2.875');
    b.t('2.1 / 200000', '0.000010500');
    b.t('2.1 / 2', '1.05');
    b.t('1.9 / -1', '-1.9');
    b.t('123.4 / 0', 'ERR:> 1e18');
    b.t('123.4 / -0', 'ERR:> 1e18');
    b.t('12 div 2.3', '5');
    b.t('12 mod 2.3', '0.5');

    b.batchEvaluate(h, BatchType.floatingPoint);
    b = new ScriptTestBatch()

    /* old-style functions should not eat too much.
    confirmed these in the emulator */
    b.t('length ("abc") > 1', 'true');
    b.t('the length of "abc" > 1', 'true');
    b.t('the length of "a" is a number', 'true');
    b.t('the length of 10 + 1', '3');
    b.t('the length of "ab" / 2', '1');
    b.t('the length of - 12', '3');
    b.t('the length of not true', '5');
    b.t('the length of (10 + 1)', '2');
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* test chained */
    b.t('12 + 34 + 56 + 78', '180');
    b.t('12 + 34 + 56', '102');
    b.t('12 + 34 - 56 + 78', '68');
    b.t('12 - 34 - 56 - 78', '-156');
    b.t('12 * 34 * 56 * 78', '1782144');
    b.t('12 * 34 * 56', '22848');
    b.t('12 * 34 / 56 * 78', '568.285714285714285');
    b.t('12 / 34 / 56 / 78', '0.00008080155');
    
    b.batchEvaluate(h, BatchType.floatingPoint);
    b = new ScriptTestBatch();

    /* test wrong types given (commutative works) */
    b.t('12 _+_ "12a"', 'ERR:expected a number');
    b.t('12 _+_ "12 a"', 'ERR:expected a number');
    b.t('12 _+_ "12.3."', 'ERR:expected a number');
    b.t('12 _-_ "12a"', 'ERR:expected a number');
    b.t('12 _-_ "12 a"', 'ERR:expected a number');
    b.t('12 _-_ "12.3."', 'ERR:expected a number');
    b.t('12 _*_ "12a"', 'ERR:expected a number');
    b.t('12 _*_ "12 a"', 'ERR:expected a number');
    b.t('12 _*_ "12.3."', 'ERR:expected a number');
    b.t('12 _/_ "12a"', 'ERR:expected a number');
    b.t('12 _/_ "12 a"', 'ERR:expected a number');
    b.t('12 _/_ "12.3."', 'ERR:expected a number');
    b.t('12 _^_ "12a"', 'ERR:expected a number');
    b.t('12 _^_ "12 a"', 'ERR:expected a number');
    b.t('12 _^_ "12.3."', 'ERR:expected a number');
    b.t('12 _div_ "12a"', 'ERR:expected a number');
    b.t('12 _div_ "12 a"', 'ERR:expected a number');
    b.t('12 _div_ "12.3."', 'ERR:expected a number');
    b.t('12 _mod_ "12a"', 'ERR:expected a number');
    b.t('12 _mod_ "12 a"', 'ERR:expected a number');
    b.t('12 _mod_ "12.3."', 'ERR:expected a number');

    b.batchEvaluate(h, BatchType.testBatchEvalCommutative);
});
t.test('evalRuleLvl6', () => {
    let b = new ScriptTestBatch();

    /* parens */
    b.t('12', '12');
    b.t('(12)', '12');
    b.t('((12))', '12');
    b.t('((12.123))', '12.123');

    /* negative */
    b.t('-12', '-12');
    b.t('-(-12)', '12');
    b.t('-(-(-12))', '-12');
    b.t('-0', '0');
    b.t('-0.0', '0');
    b.t('- "12"', '-12');
    b.t('- " 12 "', '-12');
    b.t('- " 12a "', 'ERR:expected a number');
    b.t('- " a12 "', 'ERR:expected a number');

    /* positive (intentionally disabled) */
    b.t('+12', 'ERR:"+" in the wrong place');
    b.t('+(+12)', 'ERR:"+" in the wrong place');
    b.t('+(+(+12))', 'ERR:"+" in the wrong place');
    b.t('+0', 'ERR:"+" in the wrong place');
    b.t('+0.0', 'ERR:"+" in the wrong place');
    b.t('+ "12"', 'ERR:"+" in the wrong place');
    b.t('+ " 12 "', 'ERR:"+" in the wrong place');
    b.t('+ " 12a "', 'ERR:"+" in the wrong place');
    b.t('+ " a12 "', 'ERR:"+" in the wrong place');

    /* logical not */
    b.t('not true', 'false');
    b.t('not (not true)', 'true');
    b.t('not (not (not true))', 'false');
    b.t('not false', 'true');
    b.t('not (1 is 2)', 'true');
    b.t('not "true"', 'false');
    b.t('not "true "', 'false');
    b.t('not "tru"', 'ERR:expected true or false');
    b.t('not " true"', 'ERR:expected true or false');
    b.t('not "truea"', 'ERR:expected true or false');
    b.t('not "atrue"', 'ERR:expected true or false');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* chunk */
    b.t('set the itemdelimiter to "," \\ "abc"', 'abc');
    b.t('char 1 of "abc"', 'a');
    b.t('char 3 of "abc"', 'c');
    b.t('char 1 to 3 of "abcd"', 'abc');
    b.t('char 2 to 4 of "abcd"', 'bcd');
    b.t('item 1 of "a,b,c"', 'a');
    b.t('item 3 of "a,b,c"', 'c');
    b.t('item 1 to 3 of "a,b,c,d"', 'a,b,c');
    b.t('item 2 to 4 of "a,b,c,d"', 'b,c,d');
    b.t('line 1 of "a" & cr & "b" & cr & "c"', 'a\nb\nc');
    b.t('line 1 of ("a" & cr & "b" & cr & "c")', 'a');
    b.t('line 3 of ("a" & cr & "b" & cr & "c")', 'c');
    b.t('line 1 to 3 of ("a" & cr & "b" & cr & "c")', 'a\nb\nc');
    b.t('line 2 to 4 of ("a" & cr & "b" & cr & "c")', 'b\nc');
    b.t('word 1 of "a b c"', 'a');
    b.t('word 3 of "a b c"', 'c');
    b.t('word 1 to 3 of "a b c d"', 'a b c');
    b.t('word 2 to 4 of "a b c d"', 'b c d');

    /* chunk on non strings */
    b.t('char 1 of true', 't');
    b.t('char 3 of true', 'u');
    b.t('char 1 of 1234', '1');
    b.t('char 3 of 1234', '3');

    /* everything */
    b.t('not word 2 of "a true b"', 'false');
    b.t('not word 2 of ("a true b")', 'false');
    b.t('not (word 2 of ("a true b"))', 'false');
    b.t('- word 2 of "a 3 b"', '-3');
    b.t('- word 2 of ("a 3 b")', '-3');
    b.t('- (word 2 of ("a 3 b"))', '-3');
    b.t('- char 2 to 3 of "1234"', '-23');
    b.t('- char 2 to 3 of ("1234")', '-23');
    b.t('- (char 2 to 3 of ("1234"))', '-23');

    /* composite chunks, currently needs parens */
    b.t('char 2 of (item 2 of "abc,def,ghi")', 'e');
    b.t('char 2 of (word 2 of (item 2 of "abc,d1 e2 f3,ghi"))', '2');
    b.t(
        longstr(
            `char 2 of (word 2 of (item 2 of (line 2
                    of ("abc def" & newline & "abc,d1 e2 f3,ghi"))))`
        ),
        '2'
    );

    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* different chunk types */
    b.t('char 1 to 3 of "abcd"', 'abc');
    b.t('first char of "abcd"', 'a');
    b.t('the first char of "abcd"', 'a');
    b.t('second char of "abcd"', 'b');
    b.t('the second char of "abcd"', 'b');
    b.t('("|" & any char of "abcd" & "|") is in "|a|b|c|d|"', 'true');

    /* all OrdinalOrPosition on short */
    b.t('first char of "abcd"', 'a');
    b.t('second char of "abcd"', 'b');
    b.t('third char of "abcd"', 'c');
    b.t('fourth char of "abcd"', 'd');
    b.t('fifth char of "abcd"', '');
    b.t('sixth char of "abcd"', '');
    b.t('seventh char of "abcd"', '');
    b.t('eighth char of "abcd"', '');
    b.t('ninth char of "abcd"', '');
    b.t('tenth char of "abcd"', '');
    b.t('middle char of "abcd"', 'c');
    b.t('last char of "abcd"', 'd');

    /* all OrdinalOrPosition on long */
    b.t('first char of "abcdefghijk"', 'a');
    b.t('second char of "abcdefghijk"', 'b');
    b.t('third char of "abcdefghijk"', 'c');
    b.t('fourth char of "abcdefghijk"', 'd');
    b.t('fifth char of "abcdefghijk"', 'e');
    b.t('sixth char of "abcdefghijk"', 'f');
    b.t('seventh char of "abcdefghijk"', 'g');
    b.t('eighth char of "abcdefghijk"', 'h');
    b.t('ninth char of "abcdefghijk"', 'i');
    b.t('tenth char of "abcdefghijk"', 'j');
    b.t('middle char of "abcdefghijk"', 'f');
    b.t('last char of "abcdefghijk"', 'k');

    /* item and word OrdinalOrPosition */
    b.t('first item of "ab,cd,ef,gh"', 'ab');
    b.t('second item of "ab,cd,ef,gh"', 'cd');
    b.t('middle item of "ab,cd,ef,gh"', 'ef');
    b.t('last item of "ab,cd,ef,gh"', 'gh');
    b.t('first word of "ab cd ef gh"', 'ab');
    b.t('second word of "ab cd ef gh"', 'cd');
    b.t('middle word of "ab cd ef gh"', 'ef');
    b.t('last word of "ab cd ef gh"', 'gh');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* chunk expressions */
    b.t('put 2 into x\\char x of "abcd"', 'b');
    b.t('put 2 into x\nput 3 into y\\char x to y of "abcd"', 'bc');
    b.t('put 2 into x\\char (x) of "abcd"', 'b');
    b.t('put 2 into x\nput 3 into y\\char (x) to (y) of "abcd"', 'bc');
    b.t('put 2 into x\\char (x+1) of "abcd"', 'c');
    b.t('put 2 into x\nput 3 into y\\char (x+1) to (y+1) of "abcd"', 'cd');
    b.t('put 2 into x\\char 2 of "abcd"', 'b');
    b.t('put 2 into x\nput 3 into y\\char 2 to y of "abcd"', 'bc');
    b.t('put 2 into x\\char (x+(1*2)) of "abcd"', 'd');
    b.t('put 2 into x\\char x + 1 of "abcd"', 'ERR:5:NoViableAlt');
    b.t('put 2 into x\nput 3 into y\\char x to y + 1 of "abcd"', 'ERR:6:NoViableAlt');
    b.t('put 2 into x\\char -x of "abcd"', 'ERR:5:NoViableAlt');
    b.t('put 2 into x\nput 3 into y\\char x to -y of "abcd"', 'ERR:6:NoViableAlt');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);

    /* order of operations */
    b.t('2 * 3 + 4', '10');
    b.t('2 + 3 * 4', '14');
    b.t('2 * (3 + 4)', '14');
    b.t('(2 + 3) * 4', '20');
    b.t('2 * 3 & 4', '64');
    b.t('2 & 3 * 4', '212');
    b.t('2 * (3 & 4)', '68');
    b.t('(2 & 3) * 4', '92');
    b.t('2 == 3 is a logical', 'false');
    b.t('(2 == 3) is a logical', 'true');
    b.t('2 == (3 is a logical)', 'false');
    b.t('false and true is within "false"', 'false');
    b.t('(false and true) is within "false"', 'true');
    b.t('false and (true is within "false")', 'false');

    /* cycling through all expression levels */
    b.t('false and false and false', 'false');
    b.t('false and false and (false)', 'false');
    b.t('false and (false and (false and (false)))', 'false');
    b.t('false or (false or (false or (true)))', 'true');

    /* no short-circuit evaluation */
    b.t('the autohilite of cd btn "p1"', 'true');
    b.t('the autohilite of cd btn "notexist"', 'ERR:could not find');
    b.t(
        '(the autohilite of cd btn "p1") or (the autohilite of cd btn "notexist")',
        'ERR:could not find'
    );
    b.t('the locktext of cd fld "p1"', 'false');
    b.t('the locktext of cd fld "notexist"', 'ERR:could not find');
    b.t(
        '(the locktext of cd fld "p1") and (the locktext of cd fld "notexist")',
        'ERR:could not find'
    );

    b.t(
        `put counting() into cfirst
get true or char 1 of counting() is "z"\\counting() - cfirst`,
        '2'
    );
    b.t(
        `put counting() into cfirst
get false and char 1 of counting() is "z"\\counting() - cfirst`,
        '2'
    );

    b.batchEvaluate(h);
});
t.test('vpcvalnumbers', () => {
    assertThrows('L`|', '> 1e18', () => VpcValN(Infinity));
    assertThrows('L_|', '> 1e18', () => VpcValN(Number.POSITIVE_INFINITY));
    assertThrows('L^|', '> 1e18', () => VpcValN(-Infinity));
    assertThrows('L]|', '> 1e18', () => VpcValN(Number.NEGATIVE_INFINITY));
    assertThrows('L[|', '> 1e18', () => VpcValN(NaN));
    assertThrows('L@|', '> 1e18', () => VpcValN(1 / 0));
    assertThrows('L?|', '> 1e18', () => VpcValN(0 / 0));
    assertThrows('L>|', '> 1e18', () => VpcValN(3 % 0));
    let b = new ScriptTestBatch();

    /* scientific notation applied for num literals */
    b.t('12', '12');
    b.t('12.', '12');
    b.t('12.e0', '12');
    b.t('12.0e0', '12');
    b.t('12.0e+0', '12');
    b.t('12.0e-0', '12');
    b.t('12.0e+1', '120');
    b.t('12.0e1', '120');
    b.t('12.0e-1', '1.2');
    b.t('12.0e+2', '1200');
    b.t('12.0e2', '1200');
    b.t('12.0e-2', '0.12');

    /* arithmetic can't be done with large numbers */
    /* because most JS engines kick out to scientific notation */
    /* for large numbers and I don't really want to support those as valid numbers. */
    b.t('2e10', '20000000000');
    b.t('2e17', '200000000000000000');
    b.t('2e18', 'ERR:> 1e18');
    b.t('2e20', 'ERR:> 1e18');
    b.t('2^80', 'ERR:> 1e18');
    b.t('2e15 * 2e15', 'ERR:> 1e18');
    b.t('-2e10', '-20000000000');
    b.t('-2e17', '-200000000000000000');
    b.t('-2e18', 'ERR:> 1e18');
    b.t('-2e20', 'ERR:> 1e18');
    b.t('-(2^80)', 'ERR:> 1e18');
    b.t('2e15 * -2e15', 'ERR:> 1e18');
    b.t('(2e20 + 3e10)/(4e17)', 'ERR:> 1e18');
    b.t('(2^80 - 5^35)/(2e22)', 'ERR:> 1e18');

    b.batchEvaluate(h, BatchType.floatingPoint);
    b = new ScriptTestBatch()

    /* scientific notation not applied for strings */
    b.t('"12.e0"', '12.e0');
    b.t('"12.0e0"', '12.0e0');
    b.t('"12.0e+1"', '12.0e+1');
    b.t('"12.0e-1"', '12.0e-1');

    /* number way too large */
    b.t('"3e99" is a number', 'false');
    b.t('3e99 is a number', 'ERR:> 1e18');
    b.t('"3e99" is a integer', 'false');
    b.t('3e99 is a integer', 'ERR:> 1e18');
    b.t('3e99', 'ERR:> 1e18');
    b.t('1 + "3e99"', 'ERR:expected a number');
    b.t('1 + 3e99', 'ERR:expected a number');
    b.t('strToNumber("3e99")', 'false');
    b.t('set the left of cd btn "p1" to 3e99\\0', 'ERR:> 1e18');

    /* number possible w most js engines, but we disallow to be conservative */
    b.t('"2e19" is a number', 'false');
    b.t('2e19 is a number', 'ERR:> 1e18');
    b.t('"2e19" is a integer', 'false');
    b.t('2e19 is a integer', 'ERR:> 1e18');
    b.t('2e19', 'ERR:> 1e18');
    b.t('1 + "2e19"', 'ERR:expected a number');
    b.t('1 + 2e19', 'ERR:expected a number');
    b.t('strToNumber("2e19")', 'false');
    b.t('set the left of cd btn "p1" to 2e19\\0', 'ERR:> 1e18');

    /* number possible w most js engines, but we disallow to be conservative */
    b.t('"20000000000000000000" is a number', 'false');
    b.t('20000000000000000000 is a number', 'ERR:> 1e18');
    b.t('"20000000000000000000" is a integer', 'false');
    b.t('20000000000000000000 is a integer', 'ERR:> 1e18');
    b.t('20000000000000000000', 'ERR:> 1e18');
    b.t('1 + "20000000000000000000"', 'ERR:expected a number');
    b.t('1 + 20000000000000000000', 'ERR:expected a number');
    b.t('strToNumber("20000000000000000000")', 'false');
    b.t('set the left of cd btn "p1" to 20000000000000000000\\0', 'ERR:> 1e18');

    /* number that we support as numeric, but not as an integer */
    b.t('"200000000000000000" is a number', 'true');
    b.t('200000000000000000 is a number', 'true');
    b.t('"200000000000000000" is a integer', 'false');
    b.t('200000000000000000 is a integer', 'false');
    b.t('200000000000000000', '200000000000000000');
    b.t(
        '1 + "200000000000000000"',
        '200000000000000000'
    ); /* that's why it's not an int lol */
    b.t(
        '1 + 200000000000000000',
        '200000000000000000'
    ); /* that's why it's not an int lol */
    b.t('strToNumber("200000000000000000")', '200000000000000000');
    b.t(
        'set the left of cd btn "p1" to 200000000000000000\\0',
        'ERR:expected an integer'
    );

    /* number that we support as numeric, but not as an integer */
    b.t('"2e17" is a number', 'false');
    b.t('2e17 is a number', 'true');
    b.t('"2e17" is a integer', 'false');
    b.t('2e17 is a integer', 'false');
    b.t('2e17', '200000000000000000');
    b.t('1 + "2e17"', 'ERR:expected a number');
    b.t('1 + 2e17', '200000000000000000'); /* that's why it's not an int lol */
    b.t('strToNumber("2e17")', '200000000000000000');
    b.t('set the left of cd btn "p1" to 2e17\\0', 'ERR:expected an integer');

    /* number that we support as numeric, but not as an integer */
    b.t('"2147483649" is a number', 'true');
    b.t('2147483649 is a number', 'true');
    b.t('"2147483649" is a integer', 'false');
    b.t('2147483649 is a integer', 'false');
    b.t('2147483649', '2147483649');
    b.t('1 + "2147483649"', '2147483650');
    b.t('1 + 2147483649', '2147483650');
    b.t('strToNumber("2147483649")', '2147483649');
    b.t('set the left of cd btn "p1" to 2147483649\\0', 'ERR:expected an integer');

    /* number that we support as an integer */
    b.t('"2147483640" is a number', 'true');
    b.t('2147483640 is a number', 'true');
    b.t('"2147483640" is a integer', 'true');
    b.t('2147483640 is a integer', 'true');
    b.t('1 + "2147483640"', '2147483641');
    b.t('1 + 2147483640', '2147483641');
    b.t('strToNumber("2147483640")', '2147483640');
    b.t('set the left of cd btn "p1" to 2147483640\\0', '0');

    /* number that we support as an integer */
    b.t('"3.3e2" is a number', 'false');
    b.t('3.3e2 is a number', 'true');
    b.t('"3.3e2" is a integer', 'false');
    b.t('3.3e2 is a integer', 'true');
    b.t('1 + "3.3e2"', 'ERR:expected a number');
    b.t('1 + 3.3e2', '331');
    b.t('strToNumber("3.3e2")', '330');
    b.t('set the left of cd btn "p1" to 3.3e2\\0', '0');

    /* small scientitific notation */
    b.t('"3.3e2" = "330"', 'false');
    b.t('3.3e2 = "330"', 'true');
    b.t('"334.56" = "3.3456e2"', 'false');
    b.t('"334.56" = 3.3456e2', 'true');
    b.t('3.3456e2 is a integer', 'false');
    b.t('3.3456e2 is a number', 'true');
    b.t('strToNumber("3.3456e2") = "334.56"', 'true');
    b.t('strToNumber("3.3456e2") = 334.56', 'true');
    b.t('strToNumber(3.3456e2) = "334.56"', 'true');
    b.t('strToNumber(3.3456e2) = 334.56', 'true');

    b.batchEvaluate(h, BatchType.default);
});
t.test('ModelGetById.should throw if not found', () => {
    assertEq(undefined, h.vcstate.model.findByIdUntyped('111'), 'HM|');
    assertEq(
        h.ids.cdA,
        h.vcstate.model.findByIdUntyped(h.ids.cdA)?.idInternal,
        'HL|'
    );
    assertEq(h.ids.stack, h.vcstate.model.findByIdUntyped(h.ids.stack)?.idInternal, 'HK|');
    assertThrows('L=|', 'not found', () => h.vcstate.model.getByIdUntyped('111'));
    assertEq(
        h.ids.cdA,
        h.vcstate.model.getByIdUntyped(h.ids.cdA).idInternal,
        'HJ|'
    );
    assertEq(h.ids.stack, h.vcstate.model.getByIdUntyped(h.ids.stack).idInternal, 'HI|');
});
t.test('ModelFindById.when exists and given correct type', () => {
    assertEq(
        VpcElType.Stack,
        h.vcstate.model.findById(VpcElStack, h.ids.stack)?.getType(),
        'HH|'
    );
    assertEq(
        VpcElType.Card,
        h.vcstate.model.findById(VpcElCard, h.ids.cdA)?.getType(),
        'HG|'
    );
    assertEq(
        VpcElType.Btn,
        h.vcstate.model.findById(VpcElButton, h.ids.bBC1)?.getType(),
        'HF|'
    );
    assertEq(
        VpcElType.Stack,
        h.vcstate.model.getById(VpcElStack, h.ids.stack).getType(),
        'HE|'
    );
    assertEq(
        VpcElType.Card,
        h.vcstate.model.getCardById(h.ids.cdA).getType(),
        'HD|'
    );
    assertEq(
        VpcElType.Btn,
        h.vcstate.model.getById(VpcElButton, h.ids.bBC1).getType(),
        'HC|'
    );
});
t.test('ModelFindById.when exists and given incorrect type', () => {
    assertThrows('L<|', 'cast exception', () =>
        h.vcstate.model.findById(VpcElCard, h.ids.stack)
    );
    assertThrows('L;|', 'cast exception', () =>
        h.vcstate.model.findById(VpcElButton, h.ids.cdA)
    );
    assertThrows('L:|', 'cast exception', () =>
        h.vcstate.model.findById(VpcElStack, h.ids.bBC1)
    );
    assertThrows('L/|', 'cast exception', () =>
        h.vcstate.model.getCardById(h.ids.stack)
    );
    assertThrows('L.|', 'cast exception', () =>
        h.vcstate.model.getById(VpcElButton, h.ids.cdA)
    );
    assertThrows('L-|', 'cast exception', () =>
        h.vcstate.model.getById(VpcElStack, h.ids.bBC1)
    );
});
t.test('ModelFindById.when not exists', () => {
    assertEq(undefined, h.vcstate.model.findById(VpcElCard, '111'), 'HB|');
    assertEq(undefined, h.vcstate.model.findById(VpcElStack, '111'), 'HA|');
    assertEq(undefined, h.vcstate.model.findById(VpcElCard, ''), 'H9|');
    assertEq(undefined, h.vcstate.model.findById(VpcElStack, ''), 'H8|');
    assertThrows('L,|', 'not found', () => h.vcstate.model.getCardById('111'));
    assertThrows('L+|', 'not found', () => h.vcstate.model.getById(VpcElStack, '111'));
    assertThrows('L*|', 'not found', () => h.vcstate.model.getCardById(''));
    assertThrows('L)|', 'not found', () => h.vcstate.model.getById(VpcElStack, ''));
});
t.atest('testVpcStateSerialize', async () => {
    let txt = FormattedText.newFromUnformatted('');
    h.vcstate.undoManager.doWithoutAbilityToUndo(() => {
        txt = h.modifyVcState();
    });

    /* serialize */
    let serializedJson = VpcStateSerialize.serializeAll(h.vcstate.vci);
    let s = JSON.stringify(serializedJson);
    let restoredJson = JSON.parse(s);

    /* test raw json */
    assertEq('vpc', restoredJson.product, 'H7|');
    assertEq(3, restoredJson.fileformatmajor, 'H6|');
    assertEq(0, restoredJson.fileformatminor, 'H5|');
    assertEq(vpcVersion, restoredJson.buildnumber, 'H4|');
    assertEq(h.vcstate.vci.getModel().uuid, restoredJson.uuid, 'H3|');

    /* do the full restore, as if opening from disk */
    let newProv = new VpcIntroProvider(s, 'docName', VpcDocumentLocation.FromJsonFile);
    let newStateBoth = await newProv.loadDocumentTop();
    assertTrue(newStateBoth[0], 'Q#|');
    assertTrue(newStateBoth[1], 'Q!|');
    let newState = newStateBoth[1];

    /* test that it has everything */
    h.testModelHasItAll(newState);
    h.testModelBgPartProps(newState);

    /* check productOpts (should not be persisted) */
    assertTrue(newState.model.productOpts.getN('optPaintLineColor') !== 1234, 'H2|');
    assertEq(true, newState.model.productOpts.getB('optUseHostClipboard'), 'Q |');
    assertEq(cProductName, newState.model.productOpts.getS('name'), 'H0|');
    assertEq(h.ids.cdA, newState.model.productOpts.getS('currentCardId'), 'G~|');

    /* check stack */
    assertEq(`on t1\nend t1`, newState.model.stack.getS('script'), 'G}|');
    assertEq(`stackname`, newState.model.stack.getS('name'), 'G||');

    /* check bg */
    let newBg = newState.model.getById(VpcElBg, h.ids.bgB);
    assertEq(`on t2\nend t2`, newBg.getS('script'), 'G{|');
    assertEq(`paint2`, newBg.getS('paint'), 'G`|');

    /* check card */
    let newCard = newState.model.getCardById(h.ids.cdBC);
    assertEq(`on t3\nend t3`, newCard.getS('script'), 'G_|');
    assertEq(`paint3`, newCard.getS('paint'), 'G^|');

    /* check button */
    let newBtn = newState.model.getById(VpcElButton, h.ids.bBC1);
    assertEq(true, newBtn.getB('checkmark'), 'G]|');
    assertEq(false, newBtn.getB('enabled'), 'G[|');
    assertEq(123, newBtn.getN('icon'), 'G@|');
    assertEq('symbol', newBtn.getS('textfont'), 'G?|');
    assertEq('on t4\nend t4', newBtn.getS('script'), 'G>|');

    /* check field */
    let newFld = newState.model.getById(VpcElField, h.ids.fBD1);
    assertEq(true, newFld.getB('dontwrap'), 'G=|');
    assertEq(false, newFld.getB('enabled'), 'G<|');
    assertEq(123, newFld.getN('scroll'), 'G;|');
    assertEq('center', newFld.getS('textalign'), 'G:|');
    assertEq('on t5\nend t5', newFld.getS('script'), 'G/|');

    /* check FormattedText */
    let newTxt = newFld.getCardFmTxt();
    assertTrue(newTxt.len() > 0, 'G.|');
    assertEq(txt.toSerialized(), newTxt.toSerialized(), 'G-|');
});

/**
 * a TestVpcScriptRunBase with new features for testing expression levels.
 */
class TestVpcScriptRunBaseForScriptExpr extends TestVpcScriptRunBase {
    testModelBgPartProps(newState: VpcState) {
        /**
         * some properties on background elements can have values stored per-card,
         * which has its own logic and needs to be tested
         */

        /* we'll be setting sharedtext and sharedhilite a few times, so for convenience
        allow setting data throughout */
        newState.undoManager.doWithoutAbilityToUndo(() => {
            
        });
    }

    /**
     * make changes to elements, that we'll read later
     */
    modifyVcState() {
        /* modify productOpts (should not be persisted) */
        h.vcstate.model.productOpts.setProductOpt('optPaintLineColor', 1234);
        h.vcstate.model.productOpts.setProductOpt('optUseHostClipboard', false);
        h.vcstate.model.productOpts.setProductOpt('name', `productname`);
        h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);
        let higher = h.vcstate.model

        /* modify stack */
        h.vcstate.model.stack.setOnVel('script', `on t1\nend t1`, higher);
        h.vcstate.model.stack.setOnVel('name', `stackname`, higher);

        /* modify bg */
        let bg = h.vcstate.model.getById(VpcElBg, h.ids.bgB);
        bg.setOnVel('script', `on t2\nend t2`, higher);
        bg.setOnVel('paint', `paint2`, higher);

        /* modify card */
        let card = h.vcstate.model.getCardById(h.ids.cdBC);
        card.setOnVel('script', `on t3\nend t3`, higher);
        card.setOnVel('paint', `paint3`, higher);

        /* modify button */
        let btn = h.vcstate.model.getById(VpcElButton, h.ids.bBC1);
        btn.setOnVel('checkmark', true,  higher);
        btn.setOnVel('enabled', false,  higher);
        btn.setOnVel('icon', 123,  higher);
        btn.setOnVel('textfont', 'symbol',  higher);
        btn.setOnVel('script', 'on t4\nend t4',  higher);

        /* modify field */
        let fld = h.vcstate.model.getById(VpcElField, h.ids.fBD1);
        fld.setOnVel('dontwrap', true,  higher);
        fld.setOnVel('enabled', false,  higher);
        fld.setOnVel('scroll', 123,  higher);
        fld.setOnVel('textalign', 'center',  higher);
        fld.setOnVel('script', 'on t5\nend t5',  higher);

        /* set a nontrivial FormattedText */
        let c = specialCharFontChange;
        let txt = FormattedText.newFromSerialized(`${c}f1${c}abc\n${c}f2${c}de`);
        fld.setCardFmTxt(txt, higher );

        //~ /* modify bg field - for card bb */
        //~ let bgfld = h.vcstate.model.getById(VpcElField, h.ids.bgfB1);
        //~ bgfld.set('sharedtext', false);
        //~ bgfld.setCardFmTxt(h.ids.cdBB, FormattedText.newFromSerialized(`forbb`));
        //~ bgfld.setProp('scroll', VpcValN(123), h.ids.cdBB);

        //~ /* modify bg field - for card bc */
        //~ bgfld.setCardFmTxt(h.ids.cdBC, FormattedText.newFromSerialized(`forbc`));
        //~ bgfld.setProp('scroll', VpcValN(456), h.ids.cdBC);

        //~ /* modify bg field - shared contents */
        //~ bgfld.set('sharedtext', true);
        //~ bgfld.setCardFmTxt(
            //~ h.ids.cdBC,
            //~ FormattedText.newFromSerialized(`forshared`)
        //~ );
        //~ bgfld.setProp('scroll', VpcValN(789), h.ids.cdBC);
        //~ bgfld.set('sharedtext', false);

        //~ /* modify bg btn - for card bb */
        //~ let bgbtn = h.vcstate.model.getById(VpcElButton, h.ids.bgbB1);
        //~ bgbtn.set('sharedhilite', false);
        //~ bgbtn.setProp('hilite', VpcValBool(true), h.ids.cdBB);
        //~ bgbtn.setProp('checkmark', VpcValBool(false), h.ids.cdBB);

        //~ /* modify bg btn - for card bc */
        //~ bgbtn.setProp('hilite', VpcValBool(false), h.ids.cdBC);
        //~ bgbtn.setProp('checkmark', VpcValBool(true), h.ids.cdBC);

        //~ /* modify bg btn - shared contents */
        //~ bgbtn.set('sharedhilite', true);
        //~ bgbtn.setProp('hilite', VpcValBool(true), h.ids.cdBC);
        //~ bgbtn.setProp('checkmark', VpcValBool(true), h.ids.cdBC);
        //~ bgbtn.setProp('hilite', VpcValBool(true), h.ids.cdBD);
        //~ bgbtn.setProp('checkmark', VpcValBool(true), h.ids.cdBD);
        //~ bgbtn.set('sharedhilite', false);

        return txt;
    }

    /**
     * ensure that the new model has all expected vels,
     * with correct parents and children in the right order
     */
    testModelHasItAll(newState: VpcState) {
        assertEq(h.ids.stack, newState.model.stack.idInternal, 'G,|');
        let bgParents = newState.model.stack.bgs.map(bg => bg.parentIdInternal).join(',');
        assertEq(`${h.ids.stack},${h.ids.stack},${h.ids.stack}`, bgParents, 'G+|');
        let bgIds = newState.model.stack.bgs.map(bg => bg.idInternal).join(',');
        assertEq(`${h.ids.bgA},${h.ids.bgB},${h.ids.bgC}`, bgIds, 'G*|');
        let bgNames = newState.model.stack.bgs.map(bg => bg.getS('name')).join(',');
        assertEq(`a,b,c`, bgNames, 'G)|');

        let bgA = newState.model.getById(VpcElBg, h.ids.bgA);
        let cdParents = bgA.cards.map(cd => cd.parentIdInternal).join(',');
        assertEq(`${h.ids.bgA}`, cdParents, 'G(|');
        let cdIds = bgA.cards.map(cd => cd.idInternal).join(',');
        assertEq(`${h.ids.cdA}`, cdIds, 'G&|');
        let cdNames = bgA.cards.map(cd => cd.getS('name')).join(',');
        assertEq(`a`, cdNames, 'G%|');

        let bgB = newState.model.getById(VpcElBg, h.ids.bgB);
        cdParents = bgB.cards.map(cd => cd.parentIdInternal).join(',');
        assertEq(`${h.ids.bgB},${h.ids.bgB},${h.ids.bgB}`, cdParents, 'G$|');
        cdIds = bgB.cards.map(cd => cd.idInternal).join(',');
        assertEq(
            `${h.ids.cdBB},${h.ids.cdBC},${h.ids.cdBD}`,
            cdIds,
            'G#|'
        );
        cdNames = bgB.cards.map(cd => cd.getS('name')).join(',');
        assertEq(`b,c,d`, cdNames, 'G!|');

        let bgC = newState.model.getById(VpcElBg, h.ids.bgC);
        cdParents = bgC.cards.map(cd => cd.parentIdInternal).join(',');
        assertEq(`${h.ids.bgC}`, cdParents, 'G |');
        cdIds = bgC.cards.map(cd => cd.idInternal).join(',');
        assertEq(`${h.ids.cdCD}`, cdIds, 'Gz|');
        cdNames = bgC.cards.map(cd => cd.getS('name')).join(',');
        assertEq(`d`, cdNames, 'Gy|');

        let cd_a_a = newState.model.getCardById(h.ids.cdA);
        let ptParents = cd_a_a.parts.map(pt => pt.parentIdInternal).join(',');
        assertEq(`${h.ids.cdA}`, ptParents, 'Gx|');
        let ptIds = cd_a_a.parts.map(pt => pt.idInternal).join(',');
        assertEq(`${h.ids.go}`, ptIds, 'Gw|');
        let ptNames = cd_a_a.parts.map(pt => pt.getS('name')).join(',');
        assertEq(`go`, ptNames, 'Gv|');

        let cd_b_b = newState.model.getCardById(h.ids.cdBB);
        ptParents = cd_b_b.parts.map(pt => pt.parentIdInternal).join(',');
        assertEq(``, ptParents, 'Gu|');
        ptIds = cd_b_b.parts.map(pt => pt.idInternal).join(',');
        assertEq(``, ptIds, 'Gt|');
        ptNames = cd_b_b.parts.map(pt => pt.getS('name')).join(',');
        assertEq(``, ptNames, 'Gs|');

        let cd_b_c = newState.model.getCardById(h.ids.cdBC);
        ptParents = cd_b_c.parts.map(pt => pt.parentIdInternal).join(',');
        assertEq(
            longstr(
                `${h.ids.cdBC},${h.ids.cdBC},
            ${h.ids.cdBC},${h.ids.cdBC},${h.ids.cdBC}`,
                ''
            ),
            ptParents,
            'Gr|'
        );
        ptIds = cd_b_c.parts.map(pt => pt.idInternal).join(',');
        assertEq(
            longstr(
                `${h.ids.fBC1},${h.ids.fBC2},
            ${h.ids.fBC3},${h.ids.bBC1},${h.ids.bBC2}`,
                ''
            ),
            ptIds,
            'Gq|'
        );
        ptNames = cd_b_c.parts.map(pt => pt.getS('name')).join(',');
        assertEq(`p1,p2,p3,p1,p2`, ptNames, 'Gp|');

        let cd_b_d = newState.model.getCardById(h.ids.cdBD);
        ptParents = cd_b_d.parts.map(pt => pt.parentIdInternal).join(',');
        assertEq(
            `${h.ids.cdBD},${h.ids.cdBD},${h.ids.cdBD}`,
            ptParents,
            'Go|'
        );
        ptIds = cd_b_d.parts.map(pt => pt.idInternal).join(',');
        assertEq(
            `${h.ids.fBD1},${h.ids.fBD2},${h.ids.bBD1}`,
            ptIds,
            'Gn|'
        );
        ptNames = cd_b_d.parts.map(pt => pt.getS('name')).join(',');
        assertEq(`p1,p2,p1`, ptNames, 'Gm|');

        let cd_c_d = newState.model.getCardById(h.ids.cdCD);
        ptParents = cd_c_d.parts.map(pt => pt.parentIdInternal).join(',');
        assertEq(`${h.ids.cdCD},${h.ids.cdCD}`, ptParents, 'Gl|');
        ptIds = cd_c_d.parts.map(pt => pt.idInternal).join(',');
        assertEq(`${h.ids.fCD1},${h.ids.bCD1}`, ptIds, 'Gk|');
        ptNames = cd_c_d.parts.map(pt => pt.getS('name')).join(',');
        assertEq(`p1,p1`, ptNames, 'Gj|');
    }
}
