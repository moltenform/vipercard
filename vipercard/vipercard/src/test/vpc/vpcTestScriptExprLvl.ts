
/* auto */ import { vpcversion } from '../../config.js';
/* auto */ import { assertTrue, cProductName } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { assertThrows } from '../../ui512/utils/utilsTest.js';
/* auto */ import { specialCharFontChange } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { OrdinalOrPosition, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcValN } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VpcEvalHelpers } from '../../vpc/vpcutils/vpcValEval.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';
/* auto */ import { VpcStateSerialize } from '../../vpcui/state/vpcStateSerialize.js';
/* auto */ import { VpcState } from '../../vpcui/state/vpcState.js';
/* auto */ import { VpcDocumentLocation, VpcIntroProvider } from '../../vpcui/intro/vpcIntroProvider.js';
/* auto */ import { TestVpcScriptRunBase } from '../../test/vpc/vpcTestScriptRunBase.js';

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
export class TestVpcScriptExprLvl extends TestVpcScriptRunBase {
    tests = [
        'async/vpctestscriptevalinit',
        async () => {
            await this.initEnvironment();
        },
        'test_evalRuleExpr,RuleLvl1',
        () => {
            let batch: [string, string][];
            batch = [
                /* basic tests */
                ['123', '123'],
                ['1 + 2', '3'],
                ['"abc"', 'abc'],
                ['1 + xyz', 'ERR:no variable found with this name']
            ];

            this.testBatchEvaluate(batch);

            batch = [
                /* RuleExpr and/or with data types */
                ['true _and_ "true"', 'true'],
                ['true _and_ "true "', 'true'],
                ['true _and_ "true    "', 'true'],
                ['true _and_ " true"', 'ERR:expected true or false'],
                ['true _and_ 1', 'ERR:expected true or false'],
                ['1 _and_ true', 'ERR:expected true or false'],
                ['1 _and_ 1', 'ERR:expected true or false'],

                /* RuleExpr and /or */
                ['true _and_ true', 'true'],
                ['true _and_ false', 'false'],
                ['false _and_ false', 'false'],
                ['true _or_ true', 'true'],
                ['true _or_ false', 'true'],
                ['false _or_ false', 'false']
            ];
            this.testBatchEvalCommutative(batch);

            batch = [
                /* Lvl1Expression greater less, strings */
                ['"abc" _>=_ "abc"', 'true'],
                ['"abc" _>=_ "abb"', 'true'],
                ['"abc" _>=_ "abd"', 'false'],
                ['"abc" _>=_ "ab"', 'true'],
                ['"abc" _>=_ "ab "', 'true'],
                ['"abc" _>=_ "abcd"', 'false'],
                ['"abc" _>=_ "abc "', 'false'],
                ['"abc" _>=_ " abc"', 'true'],
                ['"abc" _>_ "abc"', 'false'],
                ['"abc" _>_ "abb"', 'true'],
                ['"abc" _>_ "abd"', 'false'],
                ['"abc" _>_ "ab"', 'true'],
                ['"abc" _>_ "ab "', 'true'],
                ['"abc" _>_ "abcd"', 'false'],
                ['"abc" _>_ "abc "', 'false'],
                ['"abc" _>_ " abc"', 'true'],

                /* Lvl1Expression eq, strings */
                ['"abc" _=_ "abc"', 'true'],
                ['"abc" _=_ "abb"', 'false'],
                ['"abc" _=_ "abc "', 'false'],
                ['"abc" _==_ "abc"', 'true'],
                ['"abc" _==_ "abb"', 'false'],
                ['"abc" _==_ "abc "', 'false'],
                ['"abc" _is_ "abc"', 'true'],
                ['"abc" _is_ "abb"', 'false'],
                ['"abc" _is_ "abc "', 'false']
            ];
            this.testBatchEvalInvertAndCommute(batch);

            batch = [
                /* Lvl1Expression string/number differences */
                ['"z11" _>_ "z2"', 'false'],
                ['"z11" _>_ "z2 "', 'false'],
                ['"z 11" _>_ "z 2"', 'false'],
                ['"11 a" _>_ "2 a"', 'false'],
                ['"11e" _>_ "2e"', 'false'],
                ['"11:" _>_ "2:"', 'false'],
                ['11 _>_ 2', 'true'],
                ['"11" _>_ "2"', 'true'],
                ['"11" _>_ "2 "', 'true'],
                ['"11 " _>_ "2 "', 'true'],
                ['" 11 " _>_ " 2 "', 'true'],
                ['"z11" _>=_ "z2"', 'false'],
                ['"z11" _>=_ "z2 "', 'false'],
                ['"z 11" _>=_ "z 2"', 'false'],
                ['"11 a" _>=_ "2 a"', 'false'],
                ['"11e" _>=_ "2e"', 'false'],
                ['"11:" _>=_ "2:"', 'false'],
                ['11 _>=_ 2', 'true'],
                ['"11" _>=_ "2"', 'true'],
                ['"11" _>=_ "2 "', 'true'],
                ['"11 " _>=_ "2 "', 'true'],
                ['" 11 " _>=_ " 2 "', 'true'],

                /* Lvl1Expression greater less, numbers */
                ['4 _>=_ 4', 'true'],
                ['4.1 _>=_ 4', 'true'],
                ['3.9 _>=_ 4', 'false'],
                ['"4.000" _>=_ 4', 'true'],
                ['"00004" _>=_ 4', 'true'],
                ['4 _>=_ -4', 'true'],
                ['-4 _>=_ -4', 'true'],
                ['-4 _>=_ "-4"', 'true'],
                ['-4 _>=_ " -0004.000 "', 'true'],
                ['4 _>_ 4', 'false'],
                ['4.1 _>_ 4', 'true'],
                ['3.9 _>_ 4', 'false'],
                ['"4.000" _>_ 4', 'false'],
                ['"00004" _>_ 4', 'false'],
                ['4 _>_ -4', 'true'],
                ['-4 _>_ -4', 'false'],
                ['-4 _>_ "-4"', 'false'],
                ['-4 _>_ " -0004.000 "', 'false'],

                /* Lvl1Expression equality and inequality, see also vpcutils test of VpcEvalHelpers */
                ['456 _=_ 456', 'true'],
                ['456 _=_ " 456 "', 'true'],
                ['456 _=_ " 456"', 'true'],
                ['456 _=_ "456 "', 'true'],
                ['456 _=_ 457', 'false'],
                ['456 _=_ " 457 "', 'false'],
                ['456 _=_ 00456.000', 'true'],
                ['456 _=_ "00456.000"', 'true'],
                ['456 _=_ " 00456.000 "', 'true'],
                ['456 _=_ " 00456..000 "', 'false'],
                ['456 _=_ " 00456.0.00 "', 'false'],
                ['456 _=_ " 00456.000. "', 'false'],
                ['456 _=_ "  456.0000000001 "', 'true'],
                ['456 _=_ "  455.9999999999 "', 'true'],

                /* prefix, suffix */
                ['123 _=_ 123', 'true'],
                ['123 _=_ 1234', 'false'],
                ['123 _=_ 12', 'false'],
                ['123 _=_ -123', 'false'],

                /* different tokens with same meaning */
                ['123 _=_ 123', 'true'],
                ['123 _=_ 124', 'false'],
                ['123 _=_ " 123 "', 'true'],
                ['123 _=_ 0', 'false'],
                ['123 _==_ 123', 'true'],
                ['123 _==_ 124', 'false'],
                ['123 _==_ " 123 "', 'true'],
                ['123 _==_ 0', 'false'],
                ['123 _is_ 123', 'true'],
                ['123 _is_ 124', 'false'],
                ['123 _is_ " 123 "', 'true'],
                ['123 _is_ 0', 'false']
            ];
            this.testBatchEvalInvertAndCommute(batch);

            /* test chaining or any other that can't easily be unverted */
            batch = [
                ['true and true and true', 'true'],
                ['true and true and true and true', 'true'],
                ['true and true and false', 'false'],

                /* Lvl1Expression contains, strings */
                ['"abc" contains "abc"', 'true'],
                ['"abc" contains "abd"', 'false'],
                ['"abc" contains "ab"', 'true'],
                ['"abc" contains "c"', 'true'],
                ['"abc" contains "d"', 'false'],
                ['"abc" contains ""', 'true'],
                ['"ab" contains "abc"', 'false'],
                ['"c" contains "abc"', 'false'],
                ['"d" contains "abc"', 'false'],
                ['"" contains "abc"', 'false'],

                /* can be chained, visitor code is more elegant if this is allowed */
                ['12 == 13 == 14', 'false'],
                ['12 == 12 == true', 'true'],
                ['12 == 12 == "true"', 'true'],
                ['12 == 13 == true', 'false'],
                ['12 == 12 == false', 'false']
            ];
            this.testBatchEvaluate(batch);
        },
        'test_evalRuleLvl2',
        () => {
            let batch: [string, string][];
            batch = [
                /* Lvl2Expression, type check, invalid keywords */
                ['1 is a number1', 'ERR:needs one of {number|'],
                ['1 is a numbe', 'ERR:needs one of {number|'],
                ['1 is a abcdef', 'ERR:needs one of {number|'],
                ['1 is a n', 'ERR:needs one of {number|']
            ];
            this.testBatchEvaluate(batch);

            batch = [
                /* Lvl2Expression, type check */
                ['12 _is_ a number', 'true'],
                ['12.0 _is_ a number', 'true'],
                ['12.01 _is_ a number', 'true'],
                ['" 12 " _is_ a number', 'true'],
                ['" 0012.00 " _is_ a number', 'true'],
                ['" 0012.01 " _is_ a number', 'true'],
                ['" 12a " _is_ a number', 'false'],
                ['" 12 a " _is_ a number', 'false'],
                ['" a12 " _is_ a number', 'false'],
                ['" a 12 " _is_ a number', 'false'],
                ['12 _is_ a integer', 'true'],
                ['12.0 _is_ a integer', 'true'],
                ['12.01 _is_ a integer', 'false'],
                ['" 12 " _is_ a integer', 'true'],
                ['" 0012.00 " _is_ a integer', 'true'],
                ['" 0012.01 " _is_ a integer', 'false'],
                ['" 12a " _is_ a integer', 'false'],
                ['" 12 a " _is_ a integer', 'false'],
                ['" a12 " _is_ a integer', 'false'],
                ['" a 12 " _is_ a integer', 'false'],
                ['true _is_ a logical', 'true'],
                ['false _is_ a logical', 'true'],
                ['"true" _is_ a logical', 'true'],
                ['"false" _is_ a logical', 'true'],
                ['" true" _is_ a logical', 'false'],

                /* a bit weird, but confirmed in original product */
                ['"true " _is_ a logical', 'true'],
                ['("true" & cr) _is_ a logical', 'true'],
                ['("true" & tab) _is_ a logical', 'true'],
                ['("true   " & cr & cr & cr & tab & tab & tab) _is_ a logical', 'true'],
                ['"truea" _is_ a logical', 'false'],
                ['"true a" _is_ a logical', 'false'],
                ['"true true" _is_ a logical', 'false'],
                ['"atrue" _is_ a logical', 'false'],
                ['"a true" _is_ a logical', 'false'],
                ['"trub" _is_ a logical', 'false'],
                ['"tru" _is_ a logical', 'false'],
                ['" false" _is_ a logical', 'false'],
                ['"false " _is_ a logical', 'true'],
                ['"" _is_ a point', 'false'],
                ['"12" _is_ a point', 'false'],
                ['"12,12" _is_ a point', 'true'],
                ['"12,a12" _is_ a point', 'false'],
                ['"12,12a" _is_ a point', 'false'],
                ['"a12,12" _is_ a point', 'false'],
                ['"12a,12" _is_ a point', 'false'],
                ['"12.0, 12.0" _is_ a point', 'true'],
                ['"12.01, 12" _is_ a point', 'false'],
                ['" 12 , 12 " _is_ a point', 'true'],
                ['" 12 , 0012.00 " _is_ a point', 'true'],
                ['" 12 , 0012.01 " _is_ a point', 'false'],
                ['" 0012.00, 12  " _is_ a point', 'true'],
                ['" 0012.01, 12  " _is_ a point', 'false'],
                ['" 12,12,12 " _is_ a point', 'false'],
                ['" 12,12,12,12 " _is_ a point', 'false'],
                ['" 12,12 a " _is_ a point', 'false'],
                ['" a 12,12 " _is_ a point', 'false'],
                ['" , 12,12 " _is_ a point', 'false'],
                ['" 12,12 , " _is_ a point', 'false'],
                ['"" _is_ a rect', 'false'],
                ['"12" _is_ a rect', 'false'],
                ['"12,12" _is_ a rect', 'false'],
                ['"12,12,12" _is_ a rect', 'false'],
                ['"12,12,12,12" _is_ a rect', 'true'],
                ['"12,12,12,12,12" _is_ a rect', 'false'],
                ['"12a,12,12,12" _is_ a rect', 'false'],
                ['"12,12a,12,12" _is_ a rect', 'false'],
                ['"12,12,12a,12" _is_ a rect', 'false'],
                ['"12,12,12,12a" _is_ a rect', 'false'],
                ['"12.0, 13.0, 14.0, 15.0" _is_ a rect', 'true'],
                ['"12.0, 13., 14, 15" _is_ a rect', 'true'],
                ['"12.01, 13, 14, 15" _is_ a rect', 'false'],
                ['" 12 , 13 , 14 , 15 " _is_ a rect', 'true'],
                ['" 12 , 0013.00 , 14, 15" _is_ a rect', 'true'],
                ['" 12 , 0013.01 , 14, 15" _is_ a rect', 'false'],
                ['" 0012.00, 13 , 14, 15" _is_ a rect', 'true'],
                ['" 0012.01, 13 , 14, 15" _is_ a rect', 'false'],
                ['(cr & "12,13,14,15" & cr) _is_ a rect', 'true'],
                ['" 12,13,14,15 a " _is_ a rect', 'false'],
                ['" a 12,13,14,15 " _is_ a rect', 'false'],
                ['" , 12,13,14,15 " _is_ a rect', 'false'],
                ['" 12,13,14,15 , " _is_ a rect', 'false']
            ];

            this.testBatchEvalInvert(batch);
            batch = [
                /* Lvl2Expression, is within */
                ['"" _is_ in "abc"', 'true'],
                ['"a" _is_ in "abc"', 'true'],
                ['"c" _is_ in "abc"', 'true'],
                ['"bc" _is_ in "abc"', 'true'],
                ['"bc " _is_ in "abc"', 'false'],
                ['" bc" _is_ in "abc"', 'false'],
                ['"x" _is_ in "abc"', 'false'],
                ['"abc" _is_ in "abc"', 'true'],
                ['"abd" _is_ in "abc"', 'false'],
                ['"abcd" _is_ in "abc"', 'false'],
                ['"abdd" _is_ in "abc"', 'false'],
                ['"" _is_ within "abc"', 'true'],
                ['"a" _is_ within "abc"', 'true'],
                ['"c" _is_ within "abc"', 'true'],
                ['"bc" _is_ within "abc"', 'true'],
                ['"bc " _is_ within "abc"', 'false'],
                ['" bc" _is_ within "abc"', 'false'],
                ['"x" _is_ within "abc"', 'false'],
                ['"abc" _is_ within "abc"', 'true'],
                ['"abd" _is_ within "abc"', 'false'],
                ['"abcd" _is_ within "abc"', 'false'],
                ['"abdd" _is_ within "abc"', 'false']
            ];
            this.testBatchEvalInvert(batch);
        },
        'test_evalRuleLvl3',
        () => {
            let batch: [string, string][];
            batch = [
                ['"" & ""', ''],
                ['"" & "abc"', 'abc'],
                ['"abc" & ""', 'abc'],
                ['"abc" & "def"', 'abcdef'],
                ['1 & 2', '12'],
                ['1 & "abc"', '1abc'],
                ['"abc" & 1', 'abc1'],
                ['1 & true', '1true'],
                ['true & 1', 'true1'],
                ['"" && ""', ' '],
                ['"" && "abc"', ' abc'],
                ['"abc" && ""', 'abc '],
                ['"abc" && "def"', 'abc def'],
                ['1 && 2', '1 2'],
                ['1 && "abc"', '1 abc'],
                ['"abc" && 1', 'abc 1'],
                ['1 && true', '1 true'],
                ['true && 1', 'true 1'],

                /* chained */
                ['"a" & "b" & "c" & "d"', 'abcd'],
                ['"a" & "b" && "c" & "d"', 'ab cd'],
                ['"a" && "b" && "c" && "d"', 'a b c d'],
                ['"a" && "b" && "c"', 'a b c']
            ];
            this.testBatchEvaluate(batch);
        },
        'test_evalArithmetic',
        () => {
            /* the communitative ones, integer */
            let batch: [string, string][];
            batch = [
                ['12 _+_ 34', '46'],
                ['12 _+_ " 34 "', '46'],
                ['12 _+_ " 0034.00 "', '46'],
                ['1 _+_ 200000', '200001'],
                ['1 _+_ 2', '3'],
                ['1 _+_ -1', '0'],
                ['123 _+_ 0', '123'],
                ['123 _+_ -0', '123'],
                ['12 _*_ 34', '408'],
                ['12 _*_ " 34 "', '408'],
                ['12 _*_ " 0034.00 "', '408'],
                ['2 _*_ 200000', '400000'],
                ['2 _*_ 2', '4'],
                ['1 _*_ -1', '-1'],
                ['123 _*_ 0', '0'],
                ['123 _*_ -0', '0']
            ];
            this.testBatchEvalCommutative(batch, false);

            /* the communitative ones, floating point */
            batch = [
                ['12 _+_ 34.1', '46.1'],
                ['12 _+_ " 34.1 "', '46.1'],
                ['12.7 _+_ " 0034.00 "', '46.7'],
                ['1.7 _+_ 200000', '200001.7'],
                ['1.1 _+_ 2.2', '3.3'],
                ['1.1 _+_ -1.1', '0'],
                ['123.9 _+_ 0', '123.9'],
                ['123.9 _+_ -0', '123.9'],
                ['12 _*_ 34.1', '409.2'],
                ['12 _*_ " 34.1 "', '409.2'],
                ['12 _*_ " 0034.01 "', '408.12'],
                ['2 _*_ 200000.1', '400000.2'],
                ['2.2 _*_ 2.4', '5.28'],
                ['1.1 _*_ -1', '-1.1'],
                ['123.9 _*_ 0', '0'],
                ['123.9 _*_ -0', '0']
            ];
            this.testBatchEvalCommutative(batch, true);

            /* the non-communitative ones integer */
            batch = [
                ['12 - 34', '-22'],
                ['12 - " 34 "', '-22'],
                ['12 - " 0034.00 "', '-22'],
                ['1 - 200000', '-199999'],
                ['1 - 2', '-1'],
                ['1 - -1', '2'],
                ['123 - 0', '123'],
                ['123 - -0', '123'],
                ['12 ^ 3', '1728'],
                ['12 ^ " 3 "', '1728'],
                ['12 ^ " 003.00 "', '1728'],
                ['2 ^ 5', '32'],
                ['2 ^ 2', '4'],
                ['1 ^ -1', '1'],
                ['123 ^ 0', '1'],
                ['123 ^ -0', '1'],
                ['34 div 5', '6'],
                ['34 div 12', '2'],
                ['34 div " 12 "', '2'],
                ['34 div " 0012.00 "', '2'],
                ['2 div 200000', '0'],
                ['2 div 2', '1'],
                ['1 div -1', '-1'],
                ['123 div 0', 'ERR:> 1e18'],
                ['123 div -0', 'ERR:> 1e18'],
                ['34 mod 5', '4'],
                ['34 mod 12', '10'],
                ['34 mod " 12 "', '10'],
                ['34 mod " 0012.00 "', '10'],
                ['2 mod 200000', '2'],
                ['2 mod 2', '0'],
                ['1 mod -1', '0'],
                ['123 mod 0', 'ERR:> 1e18'],
                ['123 mod -0', 'ERR:> 1e18']
            ];
            this.testBatchEvaluate(batch, false);

            /* the non-communitative ones floating point */
            batch = [
                ['12.1 - 3.4', '8.7'],
                ['12.1 - 34', '-21.9'],
                ['12.1 - " 34 "', '-21.9'],
                ['12.1 - " 0034.00 "', '-21.9'],
                ['1.9 - 200000', '-199998.1'],
                ['1.9 - 2', '-0.100000'],
                ['1.9 - -1', '2.9'],
                ['123.4 - 0', '123.4'],
                ['123.4 - -0', '123.4'],

                ['12 ^ 13', '106993205379072'],
                ['12 ^ " 13 "', '106993205379072'],
                ['12 ^ " 0013.00 "', '106993205379072'],
                ['12 ^ 34', 'ERR:> 1e18'],

                ['12.1 ^ 3.4', '4802.531908907492'],
                ['12.1 ^ " 3.4 "', '4802.531908907492'],
                ['12.1 ^ " 003.400 "', '4802.531908907492'],
                ['2.1 ^ 7', '180.10885410000003'],
                ['2.1 ^ 2', '4.41'],
                ['1.9 ^ -1', '0.5263157894736842'],
                ['123.4 ^ 0', '1'],
                ['123.4 ^ -0', '1'],
                ['34.5 / 5', '6.9'],
                ['34.5 / 12', '2.875'],
                ['34.5 / " 12 "', '2.875'],
                ['34.5 / " 0012.00 "', '2.875'],
                ['2.1 / 200000', '0.000010500'],
                ['2.1 / 2', '1.05'],
                ['1.9 / -1', '-1.9'],
                ['123.4 / 0', 'ERR:> 1e18'],
                ['123.4 / -0', 'ERR:> 1e18'],
                ['12 div 2.3', '5'],
                ['12 mod 2.3', '0.5']
            ];
            this.testBatchEvaluate(batch, true);

            /* test chained */
            batch = [
                ['12 + 34 + 56 + 78', '180'],
                ['12 + 34 + 56', '102'],
                ['12 + 34 - 56 + 78', '68'],
                ['12 - 34 - 56 - 78', '-156'],
                ['12 * 34 * 56 * 78', '1782144'],
                ['12 * 34 * 56', '22848'],
                ['12 * 34 / 56 * 78', '568.285714285714285'],
                ['12 / 34 / 56 / 78', '0.00008080155']
            ];
            this.testBatchEvaluate(batch, true);

            /* test wrong types given (communitative works) */
            batch = [
                ['12 _+_ "12a"', 'ERR:expected a number'],
                ['12 _+_ "12 a"', 'ERR:expected a number'],
                ['12 _+_ "12.3."', 'ERR:expected a number'],
                ['12 _-_ "12a"', 'ERR:expected a number'],
                ['12 _-_ "12 a"', 'ERR:expected a number'],
                ['12 _-_ "12.3."', 'ERR:expected a number'],
                ['12 _*_ "12a"', 'ERR:expected a number'],
                ['12 _*_ "12 a"', 'ERR:expected a number'],
                ['12 _*_ "12.3."', 'ERR:expected a number'],
                ['12 _/_ "12a"', 'ERR:expected a number'],
                ['12 _/_ "12 a"', 'ERR:expected a number'],
                ['12 _/_ "12.3."', 'ERR:expected a number'],
                ['12 _^_ "12a"', 'ERR:expected a number'],
                ['12 _^_ "12 a"', 'ERR:expected a number'],
                ['12 _^_ "12.3."', 'ERR:expected a number'],
                ['12 _div_ "12a"', 'ERR:expected a number'],
                ['12 _div_ "12 a"', 'ERR:expected a number'],
                ['12 _div_ "12.3."', 'ERR:expected a number'],
                ['12 _mod_ "12a"', 'ERR:expected a number'],
                ['12 _mod_ "12 a"', 'ERR:expected a number'],
                ['12 _mod_ "12.3."', 'ERR:expected a number']
            ];
            this.testBatchEvalCommutative(batch);
        },
        'test_evalRuleLvl6',
        () => {
            let batch: [string, string][];
            batch = [
                /* parens */
                ['12', '12'],
                ['(12)', '12'],
                ['((12))', '12'],
                ['((12.123))', '12.123'],

                /* negative */
                ['-12', '-12'],
                ['-(-12)', '12'],
                ['-(-(-12))', '-12'],
                ['-0', '0'],
                ['-0.0', '0'],
                ['- "12"', '-12'],
                ['- " 12 "', '-12'],
                ['- " 12a "', 'ERR:expected a number'],
                ['- " a12 "', 'ERR:expected a number'],

                /* positive (intentionally disabled) */
                ['+12', 'ERR:"+" in the wrong place'],
                ['+(+12)', 'ERR:"+" in the wrong place'],
                ['+(+(+12))', 'ERR:"+" in the wrong place'],
                ['+0', 'ERR:"+" in the wrong place'],
                ['+0.0', 'ERR:"+" in the wrong place'],
                ['+ "12"', 'ERR:"+" in the wrong place'],
                ['+ " 12 "', 'ERR:"+" in the wrong place'],
                ['+ " 12a "', 'ERR:"+" in the wrong place'],
                ['+ " a12 "', 'ERR:"+" in the wrong place'],

                /* logical not */
                ['not true', 'false'],
                ['not (not true)', 'true'],
                ['not (not (not true))', 'false'],
                ['not false', 'true'],
                ['not (1 is 2)', 'true'],
                ['not "true"', 'false'],
                ['not "true "', 'false'],
                ['not "tru"', 'ERR:expected true or false'],
                ['not " true"', 'ERR:expected true or false'],
                ['not "truea"', 'ERR:expected true or false'],
                ['not "atrue"', 'ERR:expected true or false']
            ];
            this.testBatchEvaluate(batch);
            batch = [
                /* chunk */
                ['set the itemdelimiter to "," \\ "abc"', 'abc'],
                ['char 1 of "abc"', 'a'],
                ['char 3 of "abc"', 'c'],
                ['char 1 to 3 of "abcd"', 'abc'],
                ['char 2 to 4 of "abcd"', 'bcd'],
                ['item 1 of "a,b,c"', 'a'],
                ['item 3 of "a,b,c"', 'c'],
                ['item 1 to 3 of "a,b,c,d"', 'a,b,c'],
                ['item 2 to 4 of "a,b,c,d"', 'b,c,d'],
                ['line 1 of "a" & cr & "b" & cr & "c"', 'a\nb\nc'],
                ['line 1 of ("a" & cr & "b" & cr & "c")', 'a'],
                ['line 3 of ("a" & cr & "b" & cr & "c")', 'c'],
                ['line 1 to 3 of ("a" & cr & "b" & cr & "c")', 'a\nb\nc'],
                ['line 2 to 4 of ("a" & cr & "b" & cr & "c")', 'b\nc'],
                ['word 1 of "a b c"', 'a'],
                ['word 3 of "a b c"', 'c'],
                ['word 1 to 3 of "a b c d"', 'a b c'],
                ['word 2 to 4 of "a b c d"', 'b c d'],

                /* chunk on non strings */
                ['char 1 of true', 't'],
                ['char 3 of true', 'u'],
                ['char 1 of 1234', '1'],
                ['char 3 of 1234', '3'],

                /* everything */
                ['not word 2 of "a true b"', 'false'],
                ['not word 2 of ("a true b")', 'false'],
                ['not (word 2 of ("a true b"))', 'false'],
                ['- word 2 of "a 3 b"', '-3'],
                ['- word 2 of ("a 3 b")', '-3'],
                ['- (word 2 of ("a 3 b"))', '-3'],
                ['- char 2 to 3 of "1234"', '-23'],
                ['- char 2 to 3 of ("1234")', '-23'],
                ['- (char 2 to 3 of ("1234"))', '-23'],

                /* composite chunks, currently needs parens */
                ['char 2 of (item 2 of "abc,def,ghi")', 'e'],
                ['char 2 of (word 2 of (item 2 of "abc,d1 e2 f3,ghi"))', '2'],
                ['char 2 of (word 2 of (item 2 of (line 2 of ("abc def" & newline & "abc,d1 e2 f3,ghi"))))', '2']
            ];
            this.testBatchEvaluate(batch);
            batch = [
                /* different chunk types */
                ['char 1 to 3 of "abcd"', 'abc'],
                ['first char of "abcd"', 'a'],
                ['the first char of "abcd"', 'a'],
                ['second char of "abcd"', 'b'],
                ['the second char of "abcd"', 'b'],
                ['("|" & any char of "abcd" & "|") is in "|a|b|c|d|"', 'true'],

                /* all OrdinalOrPosition on short */
                ['first char of "abcd"', 'a'],
                ['second char of "abcd"', 'b'],
                ['third char of "abcd"', 'c'],
                ['fourth char of "abcd"', 'd'],
                ['fifth char of "abcd"', 'd'],
                ['sixth char of "abcd"', 'd'],
                ['seventh char of "abcd"', 'd'],
                ['eighth char of "abcd"', 'd'],
                ['ninth char of "abcd"', 'd'],
                ['tenth char of "abcd"', 'd'],
                ['middle char of "abcd"', 'c'],
                ['last char of "abcd"', 'd'],

                /* all OrdinalOrPosition on long */
                ['first char of "abcdefghijk"', 'a'],
                ['second char of "abcdefghijk"', 'b'],
                ['third char of "abcdefghijk"', 'c'],
                ['fourth char of "abcdefghijk"', 'd'],
                ['fifth char of "abcdefghijk"', 'e'],
                ['sixth char of "abcdefghijk"', 'f'],
                ['seventh char of "abcdefghijk"', 'g'],
                ['eighth char of "abcdefghijk"', 'h'],
                ['ninth char of "abcdefghijk"', 'i'],
                ['tenth char of "abcdefghijk"', 'j'],
                ['middle char of "abcdefghijk"', 'f'],
                ['last char of "abcdefghijk"', 'k'],

                /* item and word OrdinalOrPosition */
                ['first item of "ab,cd,ef,gh"', 'ab'],
                ['second item of "ab,cd,ef,gh"', 'cd'],
                ['middle item of "ab,cd,ef,gh"', 'ef'],
                ['last item of "ab,cd,ef,gh"', 'gh'],
                ['first word of "ab cd ef gh"', 'ab'],
                ['second word of "ab cd ef gh"', 'cd'],
                ['middle word of "ab cd ef gh"', 'ef'],
                ['last word of "ab cd ef gh"', 'gh']
            ];
            this.testBatchEvaluate(batch);

            batch = [
                /* chunk expressions */
                ['put 2 into x\\char x of "abcd"', 'b'],
                ['put 2 into x\nput 3 into y\\char x to y of "abcd"', 'bc'],
                ['put 2 into x\\char (x) of "abcd"', 'b'],
                ['put 2 into x\nput 3 into y\\char (x) to (y) of "abcd"', 'bc'],
                ['put 2 into x\\char (x+1) of "abcd"', 'c'],
                ['put 2 into x\nput 3 into y\\char (x+1) to (y+1) of "abcd"', 'cd'],
                ['put 2 into x\\char 2 of "abcd"', 'b'],
                ['put 2 into x\nput 3 into y\\char 2 to y of "abcd"', 'bc'],
                ['put 2 into x\\char (x+(1*2)) of "abcd"', 'd'],
                ['put 2 into x\\char x + 1 of "abcd"', 'ERR:5:NoViableAlt'],
                ['put 2 into x\nput 3 into y\\char x to y + 1 of "abcd"', 'ERR:6:NoViableAlt'],
                ['put 2 into x\\char -x of "abcd"', 'ERR:5:NoViableAlt'],
                ['put 2 into x\nput 3 into y\\char x to -y of "abcd"', 'ERR:6:NoViableAlt']
            ];
            this.testBatchEvaluate(batch);

            this.pr.setCurrentCardId(this.elIds.card_b_c, false);
            batch = [
                /* order of operations */
                ['2 * 3 + 4', '10'],
                ['2 + 3 * 4', '14'],
                ['2 * (3 + 4)', '14'],
                ['(2 + 3) * 4', '20'],
                ['2 * 3 & 4', '64'],
                ['2 & 3 * 4', '212'],
                ['2 * (3 & 4)', '68'],
                ['(2 & 3) * 4', '92'],
                ['2 == 3 is a logical', 'false'],
                ['(2 == 3) is a logical', 'true'],
                ['2 == (3 is a logical)', 'false'],
                ['false and true is within "false"', 'false'],
                ['(false and true) is within "false"', 'true'],
                ['false and (true is within "false")', 'false'],

                /* cycling through all expression levels */
                ['false and false and false', 'false'],
                ['false and false and (false)', 'false'],
                ['false and (false and (false and (false)))', 'false'],
                ['false or (false or (false or (true)))', 'true'],

                /* no short-circuit evaluation */
                ['the autohilite of cd btn "p1"', 'true'],
                ['the autohilite of cd btn "notexist"', 'ERR:find the specified element'],
                [
                    '(the autohilite of cd btn "p1") or (the autohilite of cd btn "notexist")',
                    'ERR:find the specified element'
                ],
                ['the locktext of cd fld "p1"', 'false'],
                ['the locktext of cd fld "notexist"', 'ERR:find the specified element'],
                [
                    '(the locktext of cd fld "p1") and (the locktext of cd fld "notexist")',
                    'ERR:find the specified element'
                ],

                [
                    `put counting() into cfirst
get true or char 1 of counting() is "z"\\counting() - cfirst`,
                    '2'
                ],
                [
                    `put counting() into cfirst
get false and char 1 of counting() is "z"\\counting() - cfirst`,
                    '2'
                ]
            ];
            this.testBatchEvaluate(batch);
        },
        'test_vpcvalnumbers',
        () => {
            assertThrows('L`|', '> 1e18', () => VpcValN(Infinity));
            assertThrows('L_|', '> 1e18', () => VpcValN(Number.POSITIVE_INFINITY));
            assertThrows('L^|', '> 1e18', () => VpcValN(-Infinity));
            assertThrows('L]|', '> 1e18', () => VpcValN(Number.NEGATIVE_INFINITY));
            assertThrows('L[|', '> 1e18', () => VpcValN(NaN));
            assertThrows('L@|', '> 1e18', () => VpcValN(1 / 0));
            assertThrows('L?|', '> 1e18', () => VpcValN(0 / 0));
            assertThrows('L>|', '> 1e18', () => VpcValN(3 % 0));
            let batch: [string, string][];
            batch = [
                /* scientific notation applied for num literals */
                ['12', '12'],
                ['12.', '12'],
                ['12.e0', '12'],
                ['12.0e0', '12'],
                ['12.0e+0', '12'],
                ['12.0e-0', '12'],
                ['12.0e+1', '120'],
                ['12.0e1', '120'],
                ['12.0e-1', '1.2'],
                ['12.0e+2', '1200'],
                ['12.0e2', '1200'],
                ['12.0e-2', '0.12'],

                /* arithmetic can't be done with large numbers */
                /* because most JS engines kick out to scientific notation */
                /* for large numbers and I don't really want to support those as valid numbers. */
                ['2e10', '20000000000'],
                ['2e17', '200000000000000000'],
                ['2e18', 'ERR:> 1e18'],
                ['2e20', 'ERR:> 1e18'],
                ['2^80', 'ERR:> 1e18'],
                ['2e15 * 2e15', 'ERR:> 1e18'],
                ['-2e10', '-20000000000'],
                ['-2e17', '-200000000000000000'],
                ['-2e18', 'ERR:> 1e18'],
                ['-2e20', 'ERR:> 1e18'],
                ['-(2^80)', 'ERR:> 1e18'],
                ['2e15 * -2e15', 'ERR:> 1e18'],
                ['(2e20 + 3e10)/(4e17)', 'ERR:> 1e18'],
                ['(2^80 - 5^35)/(2e22)', 'ERR:> 1e18']
            ];
            this.testBatchEvaluate(batch, true);

            batch = [
                /* scientific notation not applied for strings */
                ['"12.e0"', '12.e0'],
                ['"12.0e0"', '12.0e0'],
                ['"12.0e+1"', '12.0e+1'],
                ['"12.0e-1"', '12.0e-1'],

                /* number way too large */
                ['"3e99" is a number', 'false'],
                ['3e99 is a number', 'ERR:> 1e18'],
                ['"3e99" is a integer', 'false'],
                ['3e99 is a integer', 'ERR:> 1e18'],
                ['3e99', 'ERR:> 1e18'],
                ['1 + "3e99"', 'ERR:expected a number'],
                ['1 + 3e99', 'ERR:expected a number'],
                ['strToNumber("3e99")', 'false'],
                ['set the left of cd btn "p1" to 3e99\\0', 'ERR:> 1e18'],

                /* number possible w most js engines, but we disallow to be conservative */
                ['"2e19" is a number', 'false'],
                ['2e19 is a number', 'ERR:> 1e18'],
                ['"2e19" is a integer', 'false'],
                ['2e19 is a integer', 'ERR:> 1e18'],
                ['2e19', 'ERR:> 1e18'],
                ['1 + "2e19"', 'ERR:expected a number'],
                ['1 + 2e19', 'ERR:expected a number'],
                ['strToNumber("2e19")', 'false'],
                ['set the left of cd btn "p1" to 2e19\\0', 'ERR:> 1e18'],

                /* number possible w most js engines, but we disallow to be conservative */
                ['"20000000000000000000" is a number', 'false'],
                ['20000000000000000000 is a number', 'ERR:> 1e18'],
                ['"20000000000000000000" is a integer', 'false'],
                ['20000000000000000000 is a integer', 'ERR:> 1e18'],
                ['20000000000000000000', 'ERR:> 1e18'],
                ['1 + "20000000000000000000"', 'ERR:expected a number'],
                ['1 + 20000000000000000000', 'ERR:expected a number'],
                ['strToNumber("20000000000000000000")', 'false'],
                ['set the left of cd btn "p1" to 20000000000000000000\\0', 'ERR:> 1e18'],

                /* number that we support as numeric, but not as an integer */
                ['"200000000000000000" is a number', 'true'],
                ['200000000000000000 is a number', 'true'],
                ['"200000000000000000" is a integer', 'false'],
                ['200000000000000000 is a integer', 'false'],
                ['200000000000000000', '200000000000000000'],
                ['1 + "200000000000000000"', '200000000000000000'] /* that's why it's not an int lol */,
                ['1 + 200000000000000000', '200000000000000000'] /* that's why it's not an int lol */,
                ['strToNumber("200000000000000000")', '200000000000000000'],
                ['set the left of cd btn "p1" to 200000000000000000\\0', 'ERR:expected an integer'],

                /* number that we support as numeric, but not as an integer */
                ['"2e17" is a number', 'false'],
                ['2e17 is a number', 'true'],
                ['"2e17" is a integer', 'false'],
                ['2e17 is a integer', 'false'],
                ['2e17', '200000000000000000'],
                ['1 + "2e17"', 'ERR:expected a number'],
                ['1 + 2e17', '200000000000000000'] /* that's why it's not an int lol */,
                ['strToNumber("2e17")', '200000000000000000'],
                ['set the left of cd btn "p1" to 2e17\\0', 'ERR:expected an integer'],

                /* number that we support as numeric, but not as an integer */
                ['"2147483649" is a number', 'true'],
                ['2147483649 is a number', 'true'],
                ['"2147483649" is a integer', 'false'],
                ['2147483649 is a integer', 'false'],
                ['2147483649', '2147483649'],
                ['1 + "2147483649"', '2147483650'],
                ['1 + 2147483649', '2147483650'],
                ['strToNumber("2147483649")', '2147483649'],
                ['set the left of cd btn "p1" to 2147483649\\0', 'ERR:expected an integer'],

                /* number that we support as an integer */
                ['"2147483640" is a number', 'true'],
                ['2147483640 is a number', 'true'],
                ['"2147483640" is a integer', 'true'],
                ['2147483640 is a integer', 'true'],
                ['1 + "2147483640"', '2147483641'],
                ['1 + 2147483640', '2147483641'],
                ['strToNumber("2147483640")', '2147483640'],
                ['set the left of cd btn "p1" to 2147483640\\0', '0'],

                /* number that we support as an integer */
                ['"3.3e2" is a number', 'false'],
                ['3.3e2 is a number', 'true'],
                ['"3.3e2" is a integer', 'false'],
                ['3.3e2 is a integer', 'true'],
                ['1 + "3.3e2"', 'ERR:expected a number'],
                ['1 + 3.3e2', '331'],
                ['strToNumber("3.3e2")', '330'],
                ['set the left of cd btn "p1" to 3.3e2\\0', '0'],

                /* small scientitific notation */
                ['"3.3e2" = "330"', 'false'],
                ['3.3e2 = "330"', 'true'],
                ['"334.56" = "3.3456e2"', 'false'],
                ['"334.56" = 3.3456e2', 'true'],
                ['3.3456e2 is a integer', 'false'],
                ['3.3456e2 is a number', 'true'],
                ['strToNumber("3.3456e2") = "334.56"', 'true'],
                ['strToNumber("3.3456e2") = 334.56', 'true'],
                ['strToNumber(3.3456e2) = "334.56"', 'true'],
                ['strToNumber(3.3456e2) = 334.56', 'true']
            ];

            this.testBatchEvaluate(batch, false);
        },
        'testModelGetById.should throw if not found',
        () => {
            assertEq(undefined, this.vcstate.model.findByIdUntyped('111'), 'HM|');
            assertEq(this.elIds.card_a_a, this.vcstate.model.findByIdUntyped(this.elIds.card_a_a)!.id, 'HL|');
            assertEq(this.elIds.stack, this.vcstate.model.findByIdUntyped(this.elIds.stack)!.id, 'HK|');
            assertThrows('L=|', 'not found', () => this.vcstate.model.getByIdUntyped('111'));
            assertEq(this.elIds.card_a_a, this.vcstate.model.getByIdUntyped(this.elIds.card_a_a).id, 'HJ|');
            assertEq(this.elIds.stack, this.vcstate.model.getByIdUntyped(this.elIds.stack).id, 'HI|');
        },
        'testModelFindById.when exists and given correct type',
        () => {
            assertEq(VpcElType.Stack, this.vcstate.model.findById(this.elIds.stack, VpcElStack)!.getType(), 'HH|');
            assertEq(VpcElType.Card, this.vcstate.model.findById(this.elIds.card_a_a, VpcElCard)!.getType(), 'HG|');
            assertEq(VpcElType.Btn, this.vcstate.model.findById(this.elIds.btn_b_c_1, VpcElButton)!.getType(), 'HF|');
            assertEq(VpcElType.Stack, this.vcstate.model.getById(this.elIds.stack, VpcElStack).getType(), 'HE|');
            assertEq(VpcElType.Card, this.vcstate.model.getById(this.elIds.card_a_a, VpcElCard).getType(), 'HD|');
            assertEq(VpcElType.Btn, this.vcstate.model.getById(this.elIds.btn_b_c_1, VpcElButton).getType(), 'HC|');
        },
        'testModelFindById.when exists and given incorrect type',
        () => {
            assertThrows('L<|', 'cast exception', () => this.vcstate.model.findById(this.elIds.stack, VpcElCard));
            assertThrows('L;|', 'cast exception', () => this.vcstate.model.findById(this.elIds.card_a_a, VpcElButton));
            assertThrows('L:|', 'cast exception', () => this.vcstate.model.findById(this.elIds.btn_b_c_1, VpcElStack));
            assertThrows('L/|', 'cast exception', () => this.vcstate.model.getById(this.elIds.stack, VpcElCard));
            assertThrows('L.|', 'cast exception', () => this.vcstate.model.getById(this.elIds.card_a_a, VpcElButton));
            assertThrows('L-|', 'cast exception', () => this.vcstate.model.getById(this.elIds.btn_b_c_1, VpcElStack));
        },
        'testModelFindById.when not exists',
        () => {
            assertEq(undefined, this.vcstate.model.findById('111', VpcElCard), 'HB|');
            assertEq(undefined, this.vcstate.model.findById('111', VpcElStack), 'HA|');
            assertEq(undefined, this.vcstate.model.findById('', VpcElCard), 'H9|');
            assertEq(undefined, this.vcstate.model.findById('', VpcElStack), 'H8|');
            assertThrows('L,|', 'not found', () => this.vcstate.model.getById('111', VpcElCard));
            assertThrows('L+|', 'not found', () => this.vcstate.model.getById('111', VpcElStack));
            assertThrows('L*|', 'not found', () => this.vcstate.model.getById('', VpcElCard));
            assertThrows('L)|', 'not found', () => this.vcstate.model.getById('', VpcElStack));
        },
        'async/testVpcStateSerialize',
        async () => {
            let txt = FormattedText.newFromUnformatted('');
            this.vcstate.undoManager.doWithoutAbilityToUndo(() => {
                txt = this.modifyVcState();
            });

            /* serialize */
            let obj = new VpcStateSerialize();
            let serializedJson = obj.serializeAll(this.vcstate.vci);
            let s = JSON.stringify(serializedJson);
            let restoredJson = JSON.parse(s);

            /* test raw json */
            assertEq('vpc', restoredJson.product, 'H7|');
            assertEq(3, restoredJson.fileformatmajor, 'H6|');
            assertEq(0, restoredJson.fileformatminor, 'H5|');
            assertEq(vpcversion, restoredJson.buildnumber, 'H4|');
            assertEq(this.vcstate.vci.getModel().uuid, restoredJson.uuid, 'H3|');

            /* do the full restore, as if opening from disk */
            let newProv = new VpcIntroProvider(s, 'docName', VpcDocumentLocation.FromJsonFile);
            let [newPr, newState] = await newProv.loadDocumentTop();

            /* test that it has everything */
            this.testModelHasItAll(newState);

            /* check productOpts (should not be persisted) */
            assertTrue(newState.model.productOpts.getN('optPaintLineColor') !== 1234, 'H2|');
            assertEq('', newState.model.productOpts.getS('script'), 'H1|');
            assertEq(cProductName, newState.model.productOpts.getS('name'), 'H0|');
            assertEq(this.elIds.card_a_a, newState.model.productOpts.getS('currentCardId'), 'G~|');

            /* check stack */
            assertEq(`on t1\nend t1`, newState.model.stack.getS('script'), 'G}|');
            assertEq(`stackname`, newState.model.stack.getS('name'), 'G||');

            /* check bg */
            let newBg = newState.model.getById(this.elIds.bg_b, VpcElBg);
            assertEq(`on t2\nend t2`, newBg.getS('script'), 'G{|');
            assertEq(`paint2`, newBg.getS('paint'), 'G`|');

            /* check card */
            let newCard = newState.model.getById(this.elIds.card_b_c, VpcElCard);
            assertEq(`on t3\nend t3`, newCard.getS('script'), 'G_|');
            assertEq(`paint3`, newCard.getS('paint'), 'G^|');

            /* check button */
            let newBtn = newState.model.getById(this.elIds.btn_b_c_1, VpcElButton);
            assertEq(true, newBtn.getB('checkmark'), 'G]|');
            assertEq(false, newBtn.getB('enabled'), 'G[|');
            assertEq(123, newBtn.getN('icon'), 'G@|');
            assertEq('symbol', newBtn.getS('textfont'), 'G?|');
            assertEq('on t4\nend t4', newBtn.getS('script'), 'G>|');

            /* check field */
            let newFld = newState.model.getById(this.elIds.fld_b_d_1, VpcElField);
            assertEq(true, newFld.getB('dontwrap'), 'G=|');
            assertEq(false, newFld.getB('enabled'), 'G<|');
            assertEq(123, newFld.getN('scroll'), 'G;|');
            assertEq('center', newFld.getS('textalign'), 'G:|');
            assertEq('on t5\nend t5', newFld.getS('script'), 'G/|');

            /* check FormattedText */
            let newTxt = newFld.getFmTxt();
            assertTrue(newTxt.len() > 0, 'G.|');
            assertEq(txt.toSerialized(), newTxt.toSerialized(), 'G-|');
        }
    ];

    protected modifyVcState() {
        /* modify productOpts (should not be persisted) */
        this.vcstate.model.productOpts.set('optPaintLineColor', 1234);
        this.vcstate.model.productOpts.set('script', `on t0\nend t0`);
        this.vcstate.model.productOpts.set('name', `productname`);
        this.pr.setCurrentCardId(this.elIds.card_b_c, false)

        /* modify stack */
        this.vcstate.model.stack.set('script', `on t1\nend t1`);
        this.vcstate.model.stack.set('name', `stackname`);

        /* modify bg */
        let bg = this.vcstate.model.getById(this.elIds.bg_b, VpcElBg);
        bg.set('script', `on t2\nend t2`);
        bg.set('paint', `paint2`);

        /* modify card */
        let card = this.vcstate.model.getById(this.elIds.card_b_c, VpcElCard);
        card.set('script', `on t3\nend t3`);
        card.set('paint', `paint3`);

        /* modify button */
        let btn = this.vcstate.model.getById(this.elIds.btn_b_c_1, VpcElButton);
        btn.set('checkmark', true);
        btn.set('enabled', false);
        btn.set('icon', 123);
        btn.set('textfont', 'symbol');
        btn.set('script', 'on t4\nend t4');

        /* modify field */
        let fld = this.vcstate.model.getById(this.elIds.fld_b_d_1, VpcElField);
        fld.set('dontwrap', true);
        fld.set('enabled', false);
        fld.set('scroll', 123);
        fld.set('textalign', 'center');
        fld.set('script', 'on t5\nend t5');

        /* set a nontrivial FormattedText */
        let c = specialCharFontChange;
        let txt = FormattedText.newFromSerialized(`${c}f1${c}abc\n${c}f2${c}de`);
        fld.setFmTxt(txt);
        return txt;
    }

    /**
     * ensure that the new model has all expected vels,
     * with correct parents and children in the right order
     */
    protected testModelHasItAll(newState: VpcState) {
        assertEq(this.elIds.stack, newState.model.stack.id, 'G,|');
        let bgParents = newState.model.stack.bgs.map(bg => bg.parentId).join(',');
        assertEq(`${this.elIds.stack},${this.elIds.stack},${this.elIds.stack}`, bgParents, 'G+|');
        let bgIds = newState.model.stack.bgs.map(bg => bg.id).join(',');
        assertEq(`${this.elIds.bg_a},${this.elIds.bg_b},${this.elIds.bg_c}`, bgIds, 'G*|');
        let bgNames = newState.model.stack.bgs.map(bg => bg.getS('name')).join(',');
        assertEq(`a,b,c`, bgNames, 'G)|');

        let bgA = newState.model.getById(this.elIds.bg_a, VpcElBg);
        let cdParents = bgA.cards.map(cd => cd.parentId).join(',');
        assertEq(`${this.elIds.bg_a}`, cdParents, 'G(|');
        let cdIds = bgA.cards.map(cd => cd.id).join(',');
        assertEq(`${this.elIds.card_a_a}`, cdIds, 'G&|');
        let cdNames = bgA.cards.map(cd => cd.getS('name')).join(',');
        assertEq(`a`, cdNames, 'G%|');

        let bgB = newState.model.getById(this.elIds.bg_b, VpcElBg);
        cdParents = bgB.cards.map(cd => cd.parentId).join(',');
        assertEq(`${this.elIds.bg_b},${this.elIds.bg_b},${this.elIds.bg_b}`, cdParents, 'G$|');
        cdIds = bgB.cards.map(cd => cd.id).join(',');
        assertEq(`${this.elIds.card_b_b},${this.elIds.card_b_c},${this.elIds.card_b_d}`, cdIds, 'G#|');
        cdNames = bgB.cards.map(cd => cd.getS('name')).join(',');
        assertEq(`b,c,d`, cdNames, 'G!|');

        let bgC = newState.model.getById(this.elIds.bg_c, VpcElBg);
        cdParents = bgC.cards.map(cd => cd.parentId).join(',');
        assertEq(`${this.elIds.bg_c}`, cdParents, 'G |');
        cdIds = bgC.cards.map(cd => cd.id).join(',');
        assertEq(`${this.elIds.card_c_d}`, cdIds, 'Gz|');
        cdNames = bgC.cards.map(cd => cd.getS('name')).join(',');
        assertEq(`d`, cdNames, 'Gy|');

        let cd_a_a = newState.model.getById(this.elIds.card_a_a, VpcElCard);
        let ptParents = cd_a_a.parts.map(pt => pt.parentId).join(',');
        assertEq(`${this.elIds.card_a_a}`, ptParents, 'Gx|');
        let ptIds = cd_a_a.parts.map(pt => pt.id).join(',');
        assertEq(`${this.elIds.btn_go}`, ptIds, 'Gw|');
        let ptNames = cd_a_a.parts.map(pt => pt.getS('name')).join(',');
        assertEq(`go`, ptNames, 'Gv|');

        let cd_b_b = newState.model.getById(this.elIds.card_b_b, VpcElCard);
        ptParents = cd_b_b.parts.map(pt => pt.parentId).join(',');
        assertEq(``, ptParents, 'Gu|');
        ptIds = cd_b_b.parts.map(pt => pt.id).join(',');
        assertEq(``, ptIds, 'Gt|');
        ptNames = cd_b_b.parts.map(pt => pt.getS('name')).join(',');
        assertEq(``, ptNames, 'Gs|');

        let cd_b_c = newState.model.getById(this.elIds.card_b_c, VpcElCard);
        ptParents = cd_b_c.parts.map(pt => pt.parentId).join(',');
        assertEq(
            `${this.elIds.card_b_c},${this.elIds.card_b_c},${this.elIds.card_b_c},${this.elIds.card_b_c},${
                this.elIds.card_b_c
            }`,
            ptParents,
            'Gr|'
        );
        ptIds = cd_b_c.parts.map(pt => pt.id).join(',');
        assertEq(
            `${this.elIds.fld_b_c_1},${this.elIds.fld_b_c_2},${this.elIds.fld_b_c_3},${this.elIds.btn_b_c_1},${
                this.elIds.btn_b_c_2
            }`,
            ptIds,
            'Gq|'
        );
        ptNames = cd_b_c.parts.map(pt => pt.getS('name')).join(',');
        assertEq(`p1,p2,p3,p1,p2`, ptNames, 'Gp|');

        let cd_b_d = newState.model.getById(this.elIds.card_b_d, VpcElCard);
        ptParents = cd_b_d.parts.map(pt => pt.parentId).join(',');
        assertEq(`${this.elIds.card_b_d},${this.elIds.card_b_d},${this.elIds.card_b_d}`, ptParents, 'Go|');
        ptIds = cd_b_d.parts.map(pt => pt.id).join(',');
        assertEq(`${this.elIds.fld_b_d_1},${this.elIds.fld_b_d_2},${this.elIds.btn_b_d_1}`, ptIds, 'Gn|');
        ptNames = cd_b_d.parts.map(pt => pt.getS('name')).join(',');
        assertEq(`p1,p2,p1`, ptNames, 'Gm|');

        let cd_c_d = newState.model.getById(this.elIds.card_c_d, VpcElCard);
        ptParents = cd_c_d.parts.map(pt => pt.parentId).join(',');
        assertEq(`${this.elIds.card_c_d},${this.elIds.card_c_d}`, ptParents, 'Gl|');
        ptIds = cd_c_d.parts.map(pt => pt.id).join(',');
        assertEq(`${this.elIds.fld_c_d_1},${this.elIds.btn_c_d_1}`, ptIds, 'Gk|');
        ptNames = cd_c_d.parts.map(pt => pt.getS('name')).join(',');
        assertEq(`p1,p1`, ptNames, 'Gj|');
    }
}
