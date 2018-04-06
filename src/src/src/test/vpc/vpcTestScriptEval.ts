
/* auto */ import { vpcversion } from '../../config.js';
/* auto */ import { cProductName } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, assertEqWarn } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { TextFontSpec, TextFontStyling, specialCharFontChange } from '../../ui512/draw/ui512drawtextclasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512drawtext.js';
/* auto */ import { UI512FldStyle } from '../../ui512/elements/ui512elementstextfield.js';
/* auto */ import { OrdinalOrPosition } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcValN } from '../../vpc/vpcutils/vpcval.js';
/* auto */ import { VpcEvalHelpers } from '../../vpc/vpcutils/vpcvaleval.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velfield.js';
/* auto */ import { TestVpcScriptRun } from '../../test/vpc/vpctestscriptrun.js';

export class Test_ScriptEval extends TestVpcScriptRun {
    constructor() {
        super();
    }

    tests = [
        'callback/vpctestscriptevalinit',
        (callback: Function) => {
            UI512BeginAsync(() => this.initEnvironment(callback), undefined, true);
        },
        'test_evalRuleExpr,RuleLvl1',
        () => {
            // does the test infrastructure work
            let batch: [string, string][];
            batch = [['123', '123'], ['1+2', '3'], ['"abc"', 'abc'], ['1+xyz', 'ERR:no variable found with this name']];
            this.testBatchEvaluate(batch);

            batch = [
                // RuleExpr and/or with data types
                ['true _and_ "true"', 'true'],
                ['true _and_ "true "', 'true'],
                ['true _and_ "true    "', 'true'],
                ['true _and_ " true"', 'ERR:expected true or false'],
                ['true _and_ 1', 'ERR:expected true or false'],
                ['1 _and_ true', 'ERR:expected true or false'],
                ['1 _and_ 1', 'ERR:expected true or false'],
                // RuleExpr and /or
                ['true _and_ true', 'true'],
                ['true _and_ false', 'false'],
                ['false _and_ false', 'false'],
                ['true _or_ true', 'true'],
                ['true _or_ false', 'true'],
                ['false _or_ false', 'false'],
            ];
            this.testBatchEvalCommutative(batch);

            batch = [
                // Lvl1Expression greater less, strings
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
                // Lvl1Expression eq, strings
                ['"abc" _=_ "abc"', 'true'],
                ['"abc" _=_ "abb"', 'false'],
                ['"abc" _=_ "abc "', 'false'],
                ['"abc" _==_ "abc"', 'true'],
                ['"abc" _==_ "abb"', 'false'],
                ['"abc" _==_ "abc "', 'false'],
                ['"abc" _is_ "abc"', 'true'],
                ['"abc" _is_ "abb"', 'false'],
                ['"abc" _is_ "abc "', 'false'],
            ];
            this.testBatchEvalInvertAndCommute(batch);

            batch = [
                // Lvl1Expression string/number differences
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
                // Lvl1Expression greater less, numbers
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
                // Lvl1Expression equality and inequality, see also vpcutils test of VpcEvalHelpers
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
                // prefix, suffix
                ['123 _=_ 123', 'true'],
                ['123 _=_ 1234', 'false'],
                ['123 _=_ 12', 'false'],
                ['123 _=_ -123', 'false'],
                // different tokens with same meaning
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
                ['123 _is_ 0', 'false'],
            ];
            this.testBatchEvalInvertAndCommute(batch);

            // test chaining or any other that can't easily be unverted
            batch = [
                ['true and true and true', 'true'],
                ['true and true and true and true', 'true'],
                ['true and true and false', 'false'],
                // Lvl1Expression contains, strings
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
                // can be chained, although this is weird
                ['12 == 13 == 14', 'false'],
                ['12 == 12 == true', 'true'],
                ['12 == 12 == "true"', 'true'],
                ['12 == 13 == true', 'false'],
                ['12 == 12 == false', 'false'],
            ];
            this.testBatchEvaluate(batch);
        },
        'test_evalRuleLvl2',
        () => {
            let batch: [string, string][];
            batch = [
                // Lvl2Expression, type check, invalid keywords
                ['1 is a number1', 'ERR:needs one of {number|'],
                ['1 is a numbe', 'ERR:needs one of {number|'],
                ['1 is a abcdef', 'ERR:needs one of {number|'],
                ['1 is a n', 'ERR:needs one of {number|'],
            ];
            this.testBatchEvaluate(batch);

            batch = [
                // Lvl2Expression, type check
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
                ['"true " _is_ a logical', 'true'], // weird, but confirmed in emulator
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
                ['" 12,13,14,15 , " _is_ a rect', 'false'],
            ];

            this.testBatchEvalInvert(batch);
            batch = [
                // Lvl2Expression, is within
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
                ['"abdd" _is_ within "abc"', 'false'],
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
                // chained
                ['"a" & "b" & "c" & "d"', 'abcd'],
                ['"a" & "b" && "c" & "d"', 'ab cd'],
                ['"a" && "b" && "c" && "d"', 'a b c d'],
                ['"a" && "b" && "c"', 'a b c'],
            ];
            this.testBatchEvaluate(batch);
        },
        'test_evalArithmetic',
        () => {
            // the communitative ones, integer
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
                ['123 _*_ -0', '0'],
            ];
            this.testBatchEvalCommutative(batch, false);

            // the communitative ones, floating point
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
                ['123.9 _*_ -0', '0'],
            ];
            this.testBatchEvalCommutative(batch, true);

            // the non-communitative ones integer
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
                ['123 mod -0', 'ERR:> 1e18'],
            ];
            this.testBatchEvaluate(batch, false);

            // the non-communitative ones floating point
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
                ['12 mod 2.3', '0.5'],
            ];
            this.testBatchEvaluate(batch, true);

            // test chained
            batch = [
                ['12 + 34 + 56 + 78', '180'],
                ['12 + 34 + 56', '102'],
                ['12 + 34 - 56 + 78', '68'],
                ['12 - 34 - 56 - 78', '-156'],
                ['12 * 34 * 56 * 78', '1782144'],
                ['12 * 34 * 56', '22848'],
                ['12 * 34 / 56 * 78', '568.285714285714285'],
                ['12 / 34 / 56 / 78', '0.00008080155'],
            ];
            this.testBatchEvaluate(batch, true);

            // test wrong types given (communitative works)
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
                ['12 _mod_ "12.3."', 'ERR:expected a number'],
            ];
            this.testBatchEvalCommutative(batch);
        },
        'test_evalRuleLvl6',
        () => {
            let batch: [string, string][];
            batch = [
                // parens
                ['12', '12'],
                ['(12)', '12'],
                ['((12))', '12'],
                ['((12.123))', '12.123'],
                // negative
                ['-12', '-12'],
                ['-(-12)', '12'],
                ['-(-(-12))', '-12'],
                ['-0', '0'],
                ['-0.0', '0'],
                ['- "12"', '-12'],
                ['- " 12 "', '-12'],
                ['- " 12a "', 'ERR:expected a number'],
                ['- " a12 "', 'ERR:expected a number'],
                // positive (intentionally disabled)
                ['+12', 'ERR:"+" in the wrong place'],
                ['+(+12)', 'ERR:"+" in the wrong place'],
                ['+(+(+12))', 'ERR:"+" in the wrong place'],
                ['+0', 'ERR:"+" in the wrong place'],
                ['+0.0', 'ERR:"+" in the wrong place'],
                ['+ "12"', 'ERR:"+" in the wrong place'],
                ['+ " 12 "', 'ERR:"+" in the wrong place'],
                ['+ " 12a "', 'ERR:"+" in the wrong place'],
                ['+ " a12 "', 'ERR:"+" in the wrong place'],
                // logical not
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
                ['not "atrue"', 'ERR:expected true or false'],
            ];
            this.testBatchEvaluate(batch);
            batch = [
                // chunk
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
                // chunk on non strings
                ['char 1 of true', 't'],
                ['char 3 of true', 'u'],
                ['char 1 of 1234', '1'],
                ['char 3 of 1234', '3'],
                // everything
                ['not word 2 of "a true b"', 'false'],
                ['not word 2 of ("a true b")', 'false'],
                ['not (word 2 of ("a true b"))', 'false'],
                ['- word 2 of "a 3 b"', '-3'],
                ['- word 2 of ("a 3 b")', '-3'],
                ['- (word 2 of ("a 3 b"))', '-3'],
                ['- char 2 to 3 of "1234"', '-23'],
                ['- char 2 to 3 of ("1234")', '-23'],
                ['- (char 2 to 3 of ("1234"))', '-23'],
                // composite chunks, currently needs parens
                ['char 2 of (item 2 of "abc,def,ghi")', 'e'],
                ['char 2 of (word 2 of (item 2 of "abc,d1 e2 f3,ghi"))', '2'],
                ['char 2 of (word 2 of (item 2 of (line 2 of ("abc def" & newline & "abc,d1 e2 f3,ghi"))))', '2'],
            ];
            this.testBatchEvaluate(batch);
            batch = [
                // different chunk types
                ['char 1 to 3 of "abcd"', 'abc'],
                ['first char of "abcd"', 'a'],
                ['the first char of "abcd"', 'a'],
                ['second char of "abcd"', 'b'],
                ['the second char of "abcd"', 'b'],
                ['("|" & any char of "abcd" & "|") is in "|a|b|c|d|"', 'true'],

                // all OrdinalOrPosition on short
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

                // all OrdinalOrPosition on long
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

                // item and word OrdinalOrPosition
                ['first item of "ab,cd,ef,gh"', 'ab'],
                ['second item of "ab,cd,ef,gh"', 'cd'],
                ['middle item of "ab,cd,ef,gh"', 'ef'],
                ['last item of "ab,cd,ef,gh"', 'gh'],
                ['first word of "ab cd ef gh"', 'ab'],
                ['second word of "ab cd ef gh"', 'cd'],
                ['middle word of "ab cd ef gh"', 'ef'],
                ['last word of "ab cd ef gh"', 'gh'],
            ];
            this.testBatchEvaluate(batch);

            batch = [
                // chunk expressions
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
                ['put 2 into x\nput 3 into y\\char x to -y of "abcd"', 'ERR:6:NoViableAlt'],
            ];
            this.testBatchEvaluate(batch);

            this.setCurrentCard(this.elIds.card_b_c);
            batch = [
                // order of operations
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

                // cycling through all expression levels
                ['false and false and false', 'false'],
                ['false and false and (false)', 'false'],
                ['false and (false and (false and (false)))', 'false'],
                ['false or (false or (false or (true)))', 'true'],

                // no short-circuit evaluation
                ['the autohilite of cd btn "p1"', 'true'],
                ['the autohilite of cd btn "notexist"', 'ERR:find the specified element'],
                [
                    '(the autohilite of cd btn "p1") or (the autohilite of cd btn "notexist")',
                    'ERR:find the specified element',
                ],
                ['the locktext of cd fld "p1"', 'false'],
                ['the locktext of cd fld "notexist"', 'ERR:find the specified element'],
                [
                    '(the locktext of cd fld "p1") and (the locktext of cd fld "notexist")',
                    'ERR:find the specified element',
                ],

                [
                    `put counting() into cfirst
get true or char 1 of counting() is "z"\\counting() - cfirst`,
                    '2',
                ],
                [
                    `put counting() into cfirst
get false and char 1 of counting() is "z"\\counting() - cfirst`,
                    '2',
                ],
            ];
            this.testBatchEvaluate(batch);
        },
        'test_getProp',
        () => {
            let batch: [string, string][];

            // object resolution
            this.setCurrentCard(this.elIds.card_b_c);
            batch = [
                // invalid
                [`the short id of xyz`, `ERR:We did not recognize`],
                [`the short id of the xyz`, `ERR:We did not recognize`],
                // target, me, productOpts
                [`the short id of target`, `${this.elIds.btn_go}`],
                [`the short id of the target`, `${this.elIds.btn_go}`],
                [`the short id of me`, `${this.elIds.btn_go}`],
                [`the short id of the me`, `${this.elIds.btn_go}`],
                [`the short id of ${cProductName}`, `WILD`],
                [`the short id of the ${cProductName}`, `WILD`],
                // stack
                [`the short id of this stack`, `this stack`],
                [`the short id of next stack`, 'ERR:only accept referring to a stack'],
                [`the short id of xyz stack`, 'ERR:only accept referring to a stack'],
                // bg absolute
                [`the short id of bg id ${this.elIds.bg_a}`, `${this.elIds.bg_a}`],
                [`the short id of bg id ${this.elIds.bg_c}`, `${this.elIds.bg_c}`],
                [`the short id of bg id (${this.elIds.bg_c})`, `${this.elIds.bg_c}`],
                [`the short id of bg id 99`, `ERR: could not find the specified`],
                [`the short id of bg "a"`, `${this.elIds.bg_a}`],
                [`the short id of bg "c"`, `${this.elIds.bg_c}`],
                [`the short id of bg ("c")`, `${this.elIds.bg_c}`],
                [`the short id of bg ""`, `ERR: could not find the specified`],
                [`the short id of bg "notfound"`, `ERR: could not find the specified`],
                [`the short id of bg 1`, `${this.elIds.bg_a}`],
                [`the short id of bg 3`, `${this.elIds.bg_c}`],
                [`the short id of bg (3)`, `${this.elIds.bg_c}`],
                [`the short id of bg -1`, `ERR:could not find the specified`],
                [`the short id of bg 5`, `ERR:could not find the specified`],
                // bg relative
                [`the short id of this bg`, `${this.elIds.bg_b}`],
                [`the short id of next bg`, `${this.elIds.bg_c}`],
                [`the short id of first bg`, `${this.elIds.bg_a}`],
                [`the short id of last bg`, `${this.elIds.bg_c}`],
                [`the short id of the first bg`, `${this.elIds.bg_a}`],
                [`the short id of the second bg`, `${this.elIds.bg_b}`],
                [`the short id of the next bg`, `${this.elIds.bg_c}`],
                [`the short id of xyz bg`, `ERR:Not a valid choice of OrdinalOrPosition`],
                [`the short id of the xyz bg`, `ERR:Not a valid choice of OrdinalOrPosition`],
                // bg with parent
                [`the short id of bg id ${this.elIds.bg_a} of this stack`, `${this.elIds.bg_a}`],
                [`the short id of bg 1 of this stack`, `${this.elIds.bg_a}`],
                [`the short id of bg "a" of this stack`, `${this.elIds.bg_a}`],
                [`the short id of this bg of this stack`, `${this.elIds.bg_b}`],
                // card absolute
                [`the short id of card id ${this.elIds.card_a_a}`, `${this.elIds.card_a_a}`],
                [`the short id of card id ${this.elIds.card_c_d}`, `${this.elIds.card_c_d}`],
                [`the short id of card id (${this.elIds.card_c_d})`, `${this.elIds.card_c_d}`],
                [`the short id of card id 99`, `ERR: could not find the specified`],
                [`the short id of card "a"`, `${this.elIds.card_a_a}`],
                [`the short id of card "d"`, `${this.elIds.card_b_d}`],
                [`the short id of card ("d")`, `${this.elIds.card_b_d}`],
                [`the short id of card ""`, `ERR: could not find the specified`],
                [`the short id of card "notfound"`, `ERR: could not find the specified`],
                [`the short id of card 1`, `${this.elIds.card_a_a}`],
                [`the short id of card 3`, `${this.elIds.card_b_c}`],
                [`the short id of card (3)`, `${this.elIds.card_b_c}`],
                [`the short id of card -1`, `ERR:could not find`],
                [`the short id of card 99`, `ERR:could not find`],
                // card relative
                [`the short id of this card`, `${this.elIds.card_b_c}`],
                [`the short id of next card`, `${this.elIds.card_b_d}`],
                [`the short id of first card`, `${this.elIds.card_a_a}`],
                [`the short id of last card`, `${this.elIds.card_c_d}`],
                [`the short id of the first card`, `${this.elIds.card_a_a}`],
                [`the short id of the second card`, `${this.elIds.card_b_b}`],
                [`the short id of the next card`, `${this.elIds.card_b_d}`],
                [`the short id of xyz card`, `ERR:Not a valid choice of OrdinalOrPosition`],
                [`the short id of the xyz card`, `ERR:Not a valid choice of OrdinalOrPosition`],
                // card with parent
                [`the short id of card "d" of this bg`, `${this.elIds.card_b_d}`],
                [`the short id of card "d" of bg "c"`, `${this.elIds.card_c_d}`],
                [`the short id of card "d" of bg 3`, `${this.elIds.card_c_d}`],
                [`the short id of card 1 of this bg`, `${this.elIds.card_b_b}`],
                [`the short id of card 1 of bg 2`, `${this.elIds.card_b_b}`],
                [`the short id of card 1 of bg 3`, `${this.elIds.card_c_d}`],
                [`the short id of card 2 of bg 2`, `${this.elIds.card_b_c}`],
                [`the short id of card 2 of bg 1`, `ERR: could not find the specified`],
                [`the short id of card "d" of this bg of this stack`, `${this.elIds.card_b_d}`],
                // field
                [`the short id of cd fld id ${this.elIds.fld_b_c_1}`, `${this.elIds.fld_b_c_1}`],
                [`the short id of cd fld id ${this.elIds.fld_c_d_1}`, `${this.elIds.fld_c_d_1}`],
                [`the short id of cd fld id (${this.elIds.fld_c_d_1})`, `${this.elIds.fld_c_d_1}`],
                [`the short id of cd fld id 99`, `ERR:could not find the specified`],
                [`the short id of cd fld "p1"`, `${this.elIds.fld_b_c_1}`],
                [`the short id of cd fld "p2"`, `${this.elIds.fld_b_c_2}`],
                [`the short id of cd fld ("p2")`, `${this.elIds.fld_b_c_2}`],
                [`the short id of cd fld "notfound"`, `ERR:could not find the specified`],
                [`the short id of cd fld 1`, `ERR:we no longer support referring`],
                // field with parent
                [`the short id of cd fld id ${this.elIds.fld_b_c_1} of this cd`, `${this.elIds.fld_b_c_1}`],
                [`the short id of cd fld id ${this.elIds.fld_c_d_1} of this cd`, `${this.elIds.fld_c_d_1}`],
                [`the short id of cd fld "p1" of cd 1`, `ERR:could not find the specified`],
                [`the short id of cd fld "p1" of this cd`, `${this.elIds.fld_b_c_1}`],
                [`the short id of cd fld "p1" of fifth cd`, `${this.elIds.fld_c_d_1}`],
                [`the short id of cd fld "p1" of cd 4`, `${this.elIds.fld_b_d_1}`],
                [`the short id of cd fld "p1" of cd "d"`, `${this.elIds.fld_b_d_1}`],
                [`the short id of cd fld "p1" of cd "d" of bg 3`, `${this.elIds.fld_c_d_1}`],
                [`the short id of cd fld "p1" of cd "d" of bg 3 of this stack`, `${this.elIds.fld_c_d_1}`],
                // button
                [`the short id of cd btn id ${this.elIds.btn_b_c_1}`, `${this.elIds.btn_b_c_1}`],
                [`the short id of cd btn id ${this.elIds.btn_c_d_1}`, `${this.elIds.btn_c_d_1}`],
                [`the short id of cd btn id (${this.elIds.btn_c_d_1})`, `${this.elIds.btn_c_d_1}`],
                [`the short id of cd btn id 99`, `ERR:could not find the specified`],
                [`the short id of cd btn "p1"`, `${this.elIds.btn_b_c_1}`],
                [`the short id of cd btn "p2"`, `${this.elIds.btn_b_c_2}`],
                [`the short id of cd btn ("p2")`, `${this.elIds.btn_b_c_2}`],
                [`the short id of cd btn "notfound"`, `ERR:could not find the specified`],
                [`the short id of cd btn 1`, `ERR:we no longer support referring`],
                // button with parent
                [`the short id of cd btn id ${this.elIds.btn_b_c_1} of this cd`, `${this.elIds.btn_b_c_1}`],
                [`the short id of cd btn id ${this.elIds.btn_c_d_1} of this cd`, `${this.elIds.btn_c_d_1}`],
                [`the short id of cd btn "p1" of cd 1`, `ERR:could not find the specified`],
                [`the short id of cd btn "p1" of this cd`, `${this.elIds.btn_b_c_1}`],
                [`the short id of cd btn "p1" of fifth cd`, `${this.elIds.btn_c_d_1}`],
                [`the short id of cd btn "p1" of cd 4`, `${this.elIds.btn_b_d_1}`],
                [`the short id of cd btn "p1" of cd "d"`, `${this.elIds.btn_b_d_1}`],
                [`the short id of cd btn "p1" of cd "d" of bg 3`, `${this.elIds.btn_c_d_1}`],
                [`the short id of cd btn "p1" of cd "d" of bg 3 of this stack`, `${this.elIds.btn_c_d_1}`],
            ];
            this.testBatchEvaluate(batch);
        },
        'test_vpcProperties',
        () => {
            let batch: [string, string][];

            batch = [
                // basic type checking
                ['set the scroll of cd fld "p1" to ""\\0', 'ERR:expected an integer'],
                ['set the scroll of cd fld "p1" to "10a"\\0', 'ERR:expected an integer'],
                ['set the scroll of cd fld "p1" to "a10"\\0', 'ERR:expected an integer'],
                ['set the scroll of cd fld "p1" to "10.1"\\0', 'ERR:expected an integer'],
                ['set the dontwrap of cd fld "p1" to ""\\0', 'ERR:expected true or false'],
                ['set the dontwrap of cd fld "p1" to "true a"\\0', 'ERR:expected true or false'],
                ['set the dontwrap of cd fld "p1" to "truea"\\0', 'ERR:expected true or false'],
                ['set the dontwrap of cd fld "p1" to "tru"\\0', 'ERR:expected true or false'],

                // get nonexistent props
                ['the notexist of cd fld "p1"', 'ERR:unknown property'],
                ['the scrolla of cd fld "p1"', 'ERR:unknown property'],
                ['the scrol of cd fld "p1"', 'ERR:unknown property'],
                ['the style of cd 1', 'ERR:unknown property'],
                ['the selcaret of cd btn "p1"', 'ERR:unknown property'],
                ['the autohilite of cd fld "p1"', 'ERR:unknown property'],
                ['the autohilite of cd btn "p1"', 'true'],
                ['the abbr autohilite of cd btn "p1"', 'ERR:does not take an adjective'],
                ['the short autohilite of cd btn "p1"', 'ERR:does not take an adjective'],
                ['the long autohilite of cd btn "p1"', 'ERR:does not take an adjective'],
                ['the abbr textsize of cd fld "p1"', 'ERR:does not take an adjective'],
                ['the short textsize of cd fld "p1"', 'ERR:does not take an adjective'],
                ['the long textsize of cd fld "p1"', 'ERR:does not take an adjective'],
                ['the abbr cursor', 'ERR:does not take an adjective'],
                ['the short cursor', 'ERR:does not take an adjective'],
                ['the long cursor', 'ERR:does not take an adjective'],

                // set nonexistent props
                ['set the notexist of cd fld "p1" to "abc"\\0', 'ERR:unknown property'],
                ['set the scrolla of cd fld "p1" to 10\\0', 'ERR:unknown property'],
                ['set the scrol of cd fld "p1" to 10\\0', 'ERR:unknown property'],
                ['set the style of cd 1 to "opaque"\\0', 'ERR:unknown property'],
                ['set the selcaret of cd btn "p1" to 100\\0', 'ERR:unknown property'],
                ['set the autohilite of cd fld "p1" to true\\0', 'ERR:unknown property'],

                // nonsettable props
                ['set the id of cd fld "p1" to 100\\0', 'ERR:unknown property'],
                ['set the script of cd fld "p1" to "abc"\\0', 'ERR:unknown property'],
            ];
            this.testBatchEvaluate(batch);

            batch = [
                // product opts get
                ['the xyz', "ERR:use 'sin(4)' instead"],
                ['the long xyz', "ERR:use 'sin(4)' instead"],
                ['the short xyz', "ERR:use 'sin(4)' instead"],
                ['the environment', 'development'],
                ['the freesize', '0'],
                ['the size', '0'],
                ['the stacksinuse', ''],
                ['the suspended', 'false'],
                ['the long version', `${vpcversion}`],
                ['the version', `${vpcversion[0]}.${vpcversion[1]}`],

                // product opts set
                ['set the itemdelimiter to "|" \\ the itemdelimiter', '|'],
                ['item 2 of "a|b|c"', 'b'],
                ['set the itemdelimiter to "," \\ the itemdelimiter', ','],
                ['set the itemdelimiter to "" \\ 0', 'ERR:length of itemdel must be 1'],
                ['set the itemdelimiter to ",," \\ 0', 'ERR:length of itemdel must be 1'],
                ['set the cursor to "plus" \\ the cursor', 'plus'],
                ['set the cursor to "arrow" \\ the cursor', 'arrow'],
            ];
            this.testBatchEvaluate(batch);

            this.updateObjectScript(this.appl.model.stack.id, 'on stackscript\nend stackscript');
            this.updateObjectScript(this.appl.model.stack.bgs[1].id, 'on bgscript\nend bgscript');
            this.updateObjectScript(this.appl.model.stack.bgs[1].cards[1].id, 'on cdscript\nend cdscript');
            batch = [
                // stack get and set
                ['length(the script of this stack) > 1', `true`],
                ['the script of this stack', `${this.appl.model.stack.get_s('script')}`],
                ['set the name of this stack to "newname" \\ the short name of this stack', 'newname'],
                ['set the name of this stack to "teststack" \\ the short name of this stack', 'teststack'],
                // bg get and set
                ['length(the script of bg 1) == 0', `true`],
                ['the script of bg 1', ``],
                ['length(the script of bg 2) > 1', `true`],
                ['the script of bg 2', `${this.appl.model.stack.bgs[1].get_s('script')}`],
                ['the short name of bg 2', 'b'],
                ['set the name of bg 2 to "newname" \\ the short name of bg 2', 'newname'],
                ['set the name of bg 2 to "b" \\ the short name of bg 2', 'b'],
                // card get and set
                ['length(the script of cd 1) == 0', `true`],
                ['the script of cd 1', ``],
                ['length(the script of cd 3) > 1', `true`],
                ['the script of cd 3', `${this.appl.model.stack.bgs[1].cards[1].get_s('script')}`],
                ['the short name of cd 3', 'c'],
                ['set the name of cd 3 to "newname" \\ the short name of cd 3', 'newname'],
                ['set the name of cd 3 to "c" \\ the short name of cd 3', 'c'],
            ];
            this.testBatchEvaluate(batch);

            this.setCurrentCard(this.elIds.card_b_c);
            batch = [
                // size properties
                ['the left of cd btn "p1"', '0'],
                ['the top of cd btn "p1"', '0'],
                ['the width of cd btn "p1"', '0'],
                ['the height of cd btn "p1"', '0'],
                ['set the rect of cd btn "p1" to 10,20,40,60\\0', '0'],
                ['the rect of cd btn "p1"', '10,20,40,60'],
                ['the left of cd btn "p1"', '10'],
                ['the top of cd btn "p1"', '20'],
                ['the width of cd btn "p1"', '30'],
                ['the height of cd btn "p1"', '40'],
                ['the right of cd btn "p1"', '40'],
                ['the bottom of cd btn "p1"', '60'],
                ['the topleft of cd btn "p1"', '10,20'],
                ['the botright of cd btn "p1"', '40,60'],
                ['the loc of cd btn "p1"', '25,40'],

                ['set the left of cd btn "p1" to 100\\0', '0'],
                ['set the top of cd btn "p1" to 200\\0', '0'],
                ['set the width of cd btn "p1" to 300\\0', '0'],
                ['set the height of cd btn "p1" to 400\\0', '0'],
                ['the rect of cd btn "p1"', '100,200,400,600'],
                ['the loc of cd btn "p1"', '250,400'],

                ['set the right of cd btn "p1" to 401\\0', '0'],
                ['set the bottom of cd btn "p1" to 601\\0', '0'],
                ['the rect of cd btn "p1"', '101,201,401,601'],

                ['set the topleft of cd btn "p1" to 10,20\\0', '0'],
                ['set the botright of cd btn "p1" to 40,60\\0', '0'],
                ['the rect of cd btn "p1"', '10,20,40,60'],

                // test loc with even widths
                ['set the rect of cd btn "p1" to 10,20,40,60\\0', '0'],
                ['the loc of cd btn "p1"', '25,40'],
                ['set the loc of cd btn "p1" to 26,41\\0', '0'],
                ['the rect of cd btn "p1"', '11,21,41,61'],

                // test loc with odd widths
                ['set the rect of cd btn "p1" to 10,20,41,61\\0', '0'],
                ['the loc of cd btn "p1"', '25,40'],
                ['set the loc of cd btn "p1" to 26,41\\0', '0'],
                ['the rect of cd btn "p1"', '11,21,42,62'],

                // test loc with even widths
                ['set the rect of cd btn "p1" to 10,20,42,62\\0', '0'],
                ['the loc of cd btn "p1"', '26,41'],
                ['set the loc of cd btn "p1" to 26,41\\0', '0'],
                ['the rect of cd btn "p1"', '10,20,42,62'],

                // set name
                [`the short name of cd btn id ${this.elIds.btn_b_c_1}`, 'p1'],
                [
                    `set the name of cd btn id ${this.elIds.btn_b_c_1} to "newname" \\ the short name of cd btn id ${
                        this.elIds.btn_b_c_1
                    }`,
                    'newname',
                ],
                [
                    `set the name of cd btn id ${this.elIds.btn_b_c_1} to "p1" \\ the short name of cd btn id ${
                        this.elIds.btn_b_c_1
                    }`,
                    'p1',
                ],

                // type checking, coords
                ['set the rect of cd btn "p1" to "10,20,30,40"\\0', '0'],
                ['the rect of cd btn "p1"', '10,20,30,40'],
                ['set the rect of cd btn "p1" to " 10 , 20 , 30 , 40 "\\0', '0'],
                ['the rect of cd btn "p1"', '10,20,30,40'],
                ['set the rect of cd btn "p1" to 10\\0', 'ERR:could not get coord'],
                ['set the rect of cd btn "p1" to 10,20\\0', 'ERR:could not get coord'],
                ['set the rect of cd btn "p1" to 10,20,30\\0', 'ERR:could not get coord'],
                ['set the rect of cd btn "p1" to "10"\\0', 'ERR:could not get coord'],
                ['set the rect of cd btn "p1" to "10,20"\\0', 'ERR:could not get coord'],
                ['set the rect of cd btn "p1" to "10,20,30"\\0', 'ERR:could not get coord'],
                ['set the rect of cd btn "p1" to "10,20,30,40a"\\0', 'ERR:not an integer'],
                ['set the rect of cd btn "p1" to "10,20,30a,40"\\0', 'ERR:not an integer'],
                ['set the rect of cd btn "p1" to "10,20a,30,40"\\0', 'ERR:not an integer'],
                ['set the rect of cd btn "p1" to "10a,20,30,40"\\0', 'ERR:not an integer'],
                ['set the rect of cd btn "p1" to "10,20,30,40.1"\\0', 'ERR:not an integer'],
                ['set the rect of cd btn "p1" to "10,20,30.1,40"\\0', 'ERR:not an integer'],
                ['set the rect of cd btn "p1" to "10,20.1,30,40"\\0', 'ERR:not an integer'],
                ['set the rect of cd btn "p1" to "10.1,20,30,40"\\0', 'ERR:not an integer'],
                ['set the topleft of cd btn "p1" to "10"\\0', 'ERR:could not get coord'],
                ['set the topleft of cd btn "p1" to "10,20a"\\0', 'ERR:not an integer'],
                ['set the topleft of cd btn "p1" to "10a,20"\\0', 'ERR:not an integer'],

                // type checking, single values
                ['set the left of cd btn "p1" to "-30"\\0', '0'],
                ['the left of cd btn "p1"', '-30'],
                ['set the left of cd btn "p1" to " 10 "\\0', '0'],
                ['the left of cd btn "p1"', '10'],
                ['set the left of cd btn "p1" to ""\\0', 'ERR:expected an integer'],
                ['set the left of cd btn "p1" to "10a"\\0', 'ERR:expected an integer'],
                ['set the left of cd btn "p1" to "a10"\\0', 'ERR:expected an integer'],
                ['set the left of cd btn "p1" to "10.1"\\0', 'ERR:expected an integer'],
            ];
            this.testBatchEvaluate(batch);
            let batchWithFld = batch.map((item): [string, string] => [
                item[0]
                    .replace(/ cd btn /g, ' cd fld ')
                    .replace(new RegExp(`${this.elIds.btn_b_c_1}`, 'g'), `${this.elIds.fld_b_c_1}`),
                item[1],
            ]);
            this.testBatchEvaluate(batchWithFld);

            batch = [
                // btn simple get/set
                ['the autohilite of cd btn "p1"', 'true'],
                ['set the autohilite of cd btn "p1" to false\\the autohilite of cd btn "p1"', 'false'],
                ['the enabled of cd btn "p1"', 'true'],
                ['set the enabled of cd btn "p1" to false\\the enabled of cd btn "p1"', 'false'],
                ['the hilite of cd btn "p1"', 'false'],
                ['set the hilite of cd btn "p1" to true\\the hilite of cd btn "p1"', 'true'],
                ['the icon of cd btn "p1"', '0'],
                ['set the icon of cd btn "p1" to 1\\the icon of cd btn "p1"', '1'],
                ['the label of cd btn "p1"', ''],
                ['set the label of cd btn "p1" to "newlabel"\\the label of cd btn "p1"', 'newlabel'],
                ['the showlabel of cd btn "p1"', 'true'],
                ['set the showlabel of cd btn "p1" to false\\the showlabel of cd btn "p1"', 'false'],
                ['the visible of cd btn "p1"', 'true'],
                ['set the visible of cd btn "p1" to false\\the visible of cd btn "p1"', 'false'],
                ['the textfont of cd btn "p1"', 'chicago'],
                ['set the textfont of cd btn "p1" to "helvetica"\\the textfont of cd btn "p1"', 'helvetica'],
                ['the textsize of cd btn "p1"', '12'],
                ['set the textsize of cd btn "p1" to 16\\the textsize of cd btn "p1"', '16'],

                // btn validated get/set
                ['the style of cd btn "p1"', 'rectangle'],
                ['set the style of cd btn "p1" to "xyz"\\0', 'ERR:Button style'],
                ['set the style of cd btn "p1" to "radio"\\the style of cd btn "p1"', 'radio'],
                ['set the style of cd btn "p1" to shadow\\the style of cd btn "p1"', 'shadow'],
                ['the textstyle of cd btn "p1"', 'plain'],
                ['set the textstyle of cd btn "p1" to "xyz"\\0', 'ERR:unrecognized text style'],
                ['set the textstyle of cd btn "p1" to "bold,xyz"\\0', 'ERR:unrecognized text style'],
                [
                    'set the textstyle of cd btn "p1" to "bold,italic,underline,outline,shadow,condense,extend"\\the textstyle of cd btn "p1"',
                    'bold,italic,underline,outline,shadow,condense,extend',
                ],
                [
                    'set the textstyle of cd btn "p1" to bold,italic,underline,outline,shadow,condense,extend\\the textstyle of cd btn "p1"',
                    'bold,italic,underline,outline,shadow,condense,extend',
                ],
                [
                    'set the textstyle of cd btn "p1" to " Underline , Italic , Bold "\\the textstyle of cd btn "p1"',
                    'bold,italic,underline',
                ],
                ['the textalign of cd btn "p1"', 'center'],
                ['set the textalign of cd btn "p1" to "xyz"\\0', 'ERR:support setting text align to'],
                ['set the textalign of cd btn "p1" to "left"\\the textalign of cd btn "p1"', 'left'],
                ['set the textalign of cd btn "p1" to center\\the textalign of cd btn "p1"', 'center'],
            ];

            this.testBatchEvaluate(batch);

            batch = [
                // field simple get/set
                ['the dontwrap of cd fld "p1"', 'false'],
                ['set the dontwrap of cd fld "p1" to true\\the dontwrap of cd fld "p1"', 'true'],
                ['the enabled of cd fld "p1"', 'true'],
                ['set the enabled of cd fld "p1" to false\\the enabled of cd fld "p1"', 'false'],
                ['the locktext of cd fld "p1"', 'false'],
                ['set the locktext of cd fld "p1" to true\\the locktext of cd fld "p1"', 'true'],
                ['the singleline of cd fld "p1"', 'false'],
                ['set the singleline of cd fld "p1" to true\\the singleline of cd fld "p1"', 'true'],
                ['the scroll of cd fld "p1"', '0'],
                ['set the scroll of cd fld "p1" to 1\\the scroll of cd fld "p1"', '1'],
                ['set the scroll of cd fld "p1" to 0\\the scroll of cd fld "p1"', '0'],
                ['the defaulttextsize of cd fld "p1"', '12'],
                ['set the defaulttextsize of cd fld "p1" to 14\\the defaulttextsize of cd fld "p1"', '14'],
                ['the defaulttextfont of cd fld "p1"', 'geneva'],
                ['set the defaulttextfont of cd fld "p1" to helvetica\\0', 'ERR:no variable found'],
                [
                    'set the defaulttextfont of cd fld "p1" to "helvetica"\\the defaulttextfont of cd fld "p1"',
                    'helvetica',
                ],

                // validated get/set
                ['the defaulttextstyle of cd fld "p1"', 'plain'],
                [
                    'set the defaulttextstyle of cd fld "p1" to "outline"\\the defaulttextstyle of cd fld "p1"',
                    'outline',
                ],
                [
                    'set the defaulttextstyle of cd fld "p1" to " bold , shadow , italic "\\the defaulttextstyle of cd fld "p1"',
                    'bold,italic,shadow',
                ],
                [
                    'set the defaulttextstyle of cd fld "p1" to " italic , outline, extend, bold "\\the defaulttextstyle of cd fld "p1"',
                    'bold,italic,outline,extend',
                ],

                [
                    'set the defaulttextstyle of cd fld "p1" to bold, shadow, italic \\the defaulttextstyle of cd fld "p1"',
                    'bold,italic,shadow',
                ],
                [
                    'set the defaulttextstyle of cd fld "p1" to italic , outline, extend, bold \\the defaulttextstyle of cd fld "p1"',
                    'bold,italic,outline,extend',
                ],
                ['set the defaulttextstyle of cd fld "p1" to "plain"\\the defaulttextstyle of cd fld "p1"', 'plain'],
                ['set the defaulttextstyle of cd fld "p1" to ""\\0', 'ERR:unrecognized text style'],
                ['set the defaulttextstyle of cd fld "p1" to "bold,"\\0', 'ERR:unrecognized text style'],
                ['set the defaulttextstyle of cd fld "p1" to "xyz"\\0', 'ERR:unrecognized text style'],
                ['set the defaulttextstyle of cd fld "p1" to xyz\\0', 'ERR:no variable found'],
                ['set the defaulttextstyle of cd fld "p1" to "bold, xyz"\\0', 'ERR:unrecognized text style'],
                ['set the defaulttextstyle of cd fld "p1" to bold, xyz\\0', 'ERR:no variable found'],
                ['the textalign of cd fld "p1"', 'left'],
                ['set the textalign of cd fld "p1" to "center"\\the textalign of cd fld "p1"', 'center'],
                ['set the textalign of cd fld "p1" to left\\the textalign of cd fld "p1"', 'left'],
                ['set the textalign of cd fld "p1" to "right"\\0', 'ERR:currently support setting text align'],
                ['set the textalign of cd fld "p1" to "xyz"\\0', 'ERR:currently support setting text align'],
                ['set the textalign of cd fld "p1" to xyz\\0', 'ERR:no variable found'],
            ];
            this.testBatchEvaluate(batch);

            // setting style
            const fld = this.appl.model.getById(this.elIds.fld_b_c_1, VpcElField);
            assertEq(UI512FldStyle.rectangle, fld.get_n('style'), '1 |');
            batch = [
                ['the style of cd fld "p1"', 'rectangle'],
                ['set the style of cd fld "p1" to "xyz"\\0', 'ERR:Field style or'],
                ['set the style of cd fld "p1" to "opaque"\\the style of cd fld "p1"', 'opaque'],
                ['set the style of cd fld "p1" to "scrolling"\\the style of cd fld "p1"', 'scrolling'],
                ['set the style of cd fld "p1" to "transparent"\\the style of cd fld "p1"', 'transparent'],
            ];
            this.testBatchEvaluate(batch);
            assertEq(UI512FldStyle.transparent, fld.get_n('style'), '1z|');

            // reading per-character formatting
            // here's what we'll set it to: Courier/Bold/24"ab"Courier/ItalicShadow/18"cd"Times/Plain/18ef
            const fldPerChar = this.appl.model.getById(this.elIds.fld_b_c_2, VpcElField);
            let sfmt = '';
            sfmt += TextRendererFontManager.setInitialFont(
                'ab',
                new TextFontSpec('Courier', TextFontStyling.Bold, 24).toSpecString()
            );
            sfmt += TextRendererFontManager.setInitialFont(
                'cd',
                new TextFontSpec('Courier', TextFontStyling.Italic | TextFontStyling.Shadow, 18).toSpecString()
            );
            sfmt += TextRendererFontManager.setInitialFont(
                'ef',
                new TextFontSpec('Times', TextFontStyling.Default, 18).toSpecString()
            );
            this.appl.appli.undoableAction(() => fldPerChar.setftxt(FormattedText.newFromPersisted(sfmt)));
            batch = [
                // non per-character properties
                ['the defaulttextfont of cd fld "p2"', 'geneva'],
                ['the defaulttextstyle of cd fld "p2"', 'plain'],
                ['the defaulttextsize of cd fld "p2"', '12'],
                ['the textfont of cd fld "p2"', 'geneva'],
                ['the textstyle of cd fld "p2"', 'plain'],
                ['the textsize of cd fld "p2"', '12'],
                ['the alltext of cd fld "p2"', 'abcdef'],
                ['cd fld "p2"', 'abcdef'],

                // read per-character!
                ['the textfont of char 1 to 4 of cd fld "p2"', 'Courier'],
                ['the textfont of char 3 to 4 of cd fld "p2"', 'Courier'],
                ['the textfont of char 3 to 5 of cd fld "p2"', 'mixed'],
                ['the textstyle of char 1 to 2 of cd fld "p2"', 'bold'],
                ['the textstyle of char 1 to 3 of cd fld "p2"', 'mixed'],
                ['the textstyle of char 3 to 4 of cd fld "p2"', 'italic,shadow'],
                ['the textsize of char 3 to 4 of cd fld "p2"', '18'],
                ['the textsize of char 3 to 6 of cd fld "p2"', '18'],
                ['the textsize of char 2 to 6 of cd fld "p2"', 'mixed'],

                // getting most properties aren't supported for per-character
                ['the textfont of char 1 to 2 of cd btn "p2"', 'ERR:NoViableAltException'],
                ['the textfont of char 1 to 2 of cd 1', 'ERR:NoViableAltException'],
                ['the textfont of char 1 to 2 of bg 1', 'ERR:NoViableAltException'],
                ['the dontwrap of char 1 to 2 of cd fld "p2"', 'ERR:can only say'],
                ['the style of char 1 to 2 of cd fld "p2"', 'ERR:can only say'],
                ['the xyz of char 1 to 2 of cd fld "p2"', 'ERR:can only say'],
            ];
            this.testBatchEvaluate(batch);

            // formatting should have been preserved
            let contents = fldPerChar.get_ftxt().toPersisted();
            assertEqWarn(sfmt, contents, '1y|');

            batch = [
                // setting per-character formatting
                [
                    'set the textfont of char 2 to 3 of cd fld "p2" to "geneva"\\the textfont of char 2 to 3 of cd fld "p2"',
                    'geneva',
                ],
                [
                    'set the textstyle of char 4 to 5 of cd fld "p2" to "underline"\\the textstyle of char 4 to 5 of cd fld "p2"',
                    'underline',
                ],
                [
                    'set the textsize of char 6 to 6 of cd fld "p2" to "14"\\the textsize of char 6 to 6 of cd fld "p2"',
                    '14',
                ],

                // confirm what was set
                ['the textfont of char 1 to 1 of cd fld "p2"', 'Courier'],
                ['the textfont of char 2 to 2 of cd fld "p2"', 'geneva'],
                ['the textfont of char 3 to 3 of cd fld "p2"', 'geneva'],
                ['the textfont of char 4 to 4 of cd fld "p2"', 'Courier'],
                ['the textfont of char 5 to 5 of cd fld "p2"', 'Times'],
                ['the textfont of char 6 to 6 of cd fld "p2"', 'Times'],
                ['the textstyle of char 1 to 1 of cd fld "p2"', 'bold'],
                ['the textstyle of char 2 to 2 of cd fld "p2"', 'bold'],
                ['the textstyle of char 3 to 3 of cd fld "p2"', 'italic,shadow'],
                ['the textstyle of char 4 to 4 of cd fld "p2"', 'underline'],
                ['the textstyle of char 5 to 5 of cd fld "p2"', 'underline'],
                ['the textstyle of char 6 to 6 of cd fld "p2"', 'plain'],
                ['the textsize of char 1 to 1 of cd fld "p2"', '24'],
                ['the textsize of char 2 to 2 of cd fld "p2"', '24'],
                ['the textsize of char 3 to 3 of cd fld "p2"', '18'],
                ['the textsize of char 4 to 4 of cd fld "p2"', '18'],
                ['the textsize of char 5 to 5 of cd fld "p2"', '18'],
                ['the textsize of char 6 to 6 of cd fld "p2"', '14'],

                // setting most properties aren't supported for per-character
                ['set the textfont of char 1 to 2 of cd btn "p2" to "Geneva"\\0', 'ERR:NoViableAltException'],
                ['set the textfont of char 1 to 2 of cd 1 to "Geneva"\\0', 'ERR:NoViableAltException'],
                ['set the textfont of char 1 to 2 of bg 1 to "Geneva"\\0', 'ERR:NoViableAltException'],
                ['set the dontwrap of char 1 to 2 of cd fld "p2" to "false"\\0', 'ERR:can only say'],
                ['set the style of char 1 to 2 of cd fld "p2" to "opaque"\\0', 'ERR:can only say'],
                ['set the xyz of char 1 to 2 of cd fld "p2" to "Geneva"\\0', 'ERR:can only say'],
            ];
            this.testBatchEvaluate(batch);

            // confirm formatting
            contents = fldPerChar.get_ftxt().toPersisted();
            assertEqWarn(
                '|Courier_24_+biuosdce|a|geneva_24_+biuosdce|b|geneva_18_b+iuo+sdce|c|Courier_18_bi+uosdce|d|Times_18_bi+uosdce|e|Times_14_biuosdce|f',
                contents.replace(new RegExp(specialCharFontChange, 'g'), '|'),
                '1x|'
            );

            // all of these actions nuke formatting
            let actions: [string, TextFontSpec][] = [
                ['put "abcdef" into cd fld "p2"', new TextFontSpec('geneva', 0, 12)],
                ['set the alltext of cd fld "p2" to "abcdef"', new TextFontSpec('geneva', 0, 12)],
                ['set the textstyle of cd fld "p2" to "bold"', new TextFontSpec('geneva', TextFontStyling.Bold, 12)],
                ['set the textfont of cd fld "p2" to "helvetica"', new TextFontSpec('helvetica', 0, 12)],
                ['set the textsize of cd fld "p2" to "9"', new TextFontSpec('geneva', 0, 9)],
                [
                    'set the textfont of char 1 to 400 of cd fld "p2" to "times"\nset the textstyle of char 1 to 400 of cd fld "p2" to "underline,outline"\nset the textsize of char 1 to 400 of cd fld "p2" to "28"\n',
                    new TextFontSpec('times', TextFontStyling.Outline | TextFontStyling.Underline, 28),
                ],
            ];

            for (let [action, expectedFont] of actions) {
                this.appl.appli.undoableAction(() => fldPerChar.setftxt(FormattedText.newFromPersisted(sfmt)));
                assertEq(sfmt, fldPerChar.get_ftxt().toPersisted(), '1w|');
                batch = [
                    ['set the defaulttextfont of cd fld "p2" to "geneva"\\0', '0'],
                    ['set the defaulttextstyle of cd fld "p2" to "plain"\\0', '0'],
                    ['set the defaulttextsize of cd fld "p2" to "12"\\0', '0'],
                    [`${action}\\0`, '0'],
                ];
                this.testBatchEvaluate(batch);

                // formatting should have been lost
                contents = fldPerChar.get_ftxt().toPersisted();
                let expected = TextRendererFontManager.setInitialFont('abcdef', expectedFont.toSpecString());
                assertEq(expected, contents, '1v|');
            }

            this.setCurrentCard(this.elIds.card_b_c);
            batch = [
                // productopts
                [`the name of the ${cProductName}`, `${cProductName}`],
                [`the abbr name of ${cProductName}`, `${cProductName}`],
                [`the short name of ${cProductName}`, `${cProductName}`],
                [`the long name of ${cProductName}`, `Applications:${cProductName} Folder:${cProductName}`],
                [`the id of the ${cProductName}`, `WILD`],
                [`the abbr id of ${cProductName}`, `WILD`],
                [`the short id of ${cProductName}`, `WILD`],
                [`the long id of ${cProductName}`, `WILD`],

                // stack
                ['the name of this stack', 'this stack'],
                ['the abbr name of this stack', 'this stack'],
                ['the short name of this stack', 'teststack'],
                ['the long name of this stack', 'this stack'],
                ['the id of this stack', 'this stack'],
                ['the abbr id of this stack', 'this stack'],
                ['the short id of this stack', 'this stack'],
                ['the long id of this stack', 'this stack'],

                // bkgnd
                ['the name of bg 2', 'bkgnd "b"'],
                ['the abbr name of bg 2', 'bkgnd "b"'],
                ['the short name of bg 2', 'b'],
                ['the long name of bg 2', 'bkgnd "b" of this stack'],
                ['the id of bg 2', `bkgnd id ${this.elIds.bg_b}`],
                ['the abbr id of bg 2', `bkgnd id ${this.elIds.bg_b}`],
                ['the short id of bg 2', `${this.elIds.bg_b}`],
                ['the long id of bg 2', `bkgnd id ${this.elIds.bg_b} of this stack`],

                // card
                ['the name of cd 4', 'card "d"'],
                ['the abbr name of cd 4', 'card "d"'],
                ['the short name of cd 4', 'd'],
                ['the long name of cd 4', 'card "d" of this stack'],
                ['the id of cd 4', `card id ${this.elIds.card_b_d}`],
                ['the abbr id of cd 4', `card id ${this.elIds.card_b_d}`],
                ['the short id of cd 4', `${this.elIds.card_b_d}`],
                ['the long id of cd 4', `card id ${this.elIds.card_b_d} of this stack`],

                // button
                ['the name of cd btn "p1"', 'card button "p1"'],
                ['the abbr name of cd btn "p1"', 'card button "p1"'],
                ['the short name of cd btn "p1"', 'p1'],
                ['the long name of cd btn "p1"', 'card button "p1" of card "c" of this stack'],
                ['the id of cd btn "p1"', `${this.elIds.btn_b_c_1}`], // confirmed in emulator, short/long has no effect
                ['the abbr id of cd btn "p1"', `${this.elIds.btn_b_c_1}`],
                ['the short id of cd btn "p1"', `${this.elIds.btn_b_c_1}`],
                ['the long id of cd btn "p1"', `${this.elIds.btn_b_c_1}`],

                // field
                ['the name of cd fld "p1"', 'card field "p1"'],
                ['the abbr name of cd fld "p1"', 'card field "p1"'],
                ['the short name of cd fld "p1"', 'p1'],
                ['the long name of cd fld "p1"', 'card field "p1" of card "c" of this stack'],
                ['the id of cd fld "p1"', `${this.elIds.fld_b_c_1}`],
                ['the abbr id of cd fld "p1"', `${this.elIds.fld_b_c_1}`],
                ['the short id of cd fld "p1"', `${this.elIds.fld_b_c_1}`],
                ['the long id of cd fld "p1"', `${this.elIds.fld_b_c_1}`],

                // when nothing has names, we get different output
                ['set the name of this stack to ""\\0', '0'],
                ['set the name of this bg to ""\\0', '0'],
                ['set the name of this card to ""\\0', '0'],
                [`set the name of cd btn id ${this.elIds.btn_b_c_1} to ""\\0`, '0'],
                [`set the name of cd fld id ${this.elIds.fld_b_c_1} to ""\\0`, '0'],
                ['the name of this stack', 'this stack'],
                ['the abbr name of this stack', 'this stack'],
                ['the short name of this stack', 'this stack'],
                ['the long name of this stack', 'this stack'],
                ['the name of this bg', `bkgnd id ${this.elIds.bg_b}`],
                ['the abbr name of this bg', `bkgnd id ${this.elIds.bg_b}`],
                ['the short name of this bg', `bkgnd id ${this.elIds.bg_b}`],
                ['the long name of this bg', `bkgnd id ${this.elIds.bg_b} of this stack`],
                ['the name of this cd', `card id ${this.elIds.card_b_c}`],
                ['the abbr name of this cd', `card id ${this.elIds.card_b_c}`],
                ['the short name of this cd', `card id ${this.elIds.card_b_c}`],
                ['the long name of this cd', `card id ${this.elIds.card_b_c} of this stack`],
                [`the name of cd btn id ${this.elIds.btn_b_c_1}`, `card button id ${this.elIds.btn_b_c_1}`],
                [`the abbr name of cd btn id ${this.elIds.btn_b_c_1}`, `card button id ${this.elIds.btn_b_c_1}`],
                [`the short name of cd btn id ${this.elIds.btn_b_c_1}`, `card button id ${this.elIds.btn_b_c_1}`],
                [
                    `the long name of cd btn id ${this.elIds.btn_b_c_1}`,
                    `card button id ${this.elIds.btn_b_c_1} of card id ${this.elIds.card_b_c} of this stack`,
                ],
                [`the name of cd fld id ${this.elIds.fld_b_c_1}`, `card field id ${this.elIds.fld_b_c_1}`],
                [`the abbr name of cd fld id ${this.elIds.fld_b_c_1}`, `card field id ${this.elIds.fld_b_c_1}`],
                [`the short name of cd fld id ${this.elIds.fld_b_c_1}`, `card field id ${this.elIds.fld_b_c_1}`],
                [
                    `the long name of cd fld id ${this.elIds.fld_b_c_1}`,
                    `card field id ${this.elIds.fld_b_c_1} of card id ${this.elIds.card_b_c} of this stack`,
                ],

                // restore names
                ['set the name of this stack to "teststack"\\0', '0'],
                ['set the name of this bg to "b"\\0', '0'],
                ['set the name of this card to "c"\\0', '0'],
                [`set the name of cd btn id ${this.elIds.btn_b_c_1} to "p1"\\0`, '0'],
                [`set the name of cd fld id ${this.elIds.fld_b_c_1} to "p1"\\0`, '0'],

                // the target (this.objids.btn_go)
                ['the target', 'card button "go"'],
                ['the abbr target', 'card button "go"'],
                ['the short target', 'go'],
                ['the long target', 'card button "go" of card "a" of this stack'],

                // owner
                ['the owner of this stack', 'ERR:only get the owner'],
                ['the owner of bg 1', 'ERR:only get the owner'],
                ['the owner of cd fld "p1"', 'ERR:only get the owner'],
                ['the owner of cd btn "p1"', 'ERR:only get the owner'],
                ['the owner of cd btn "xyz"', 'ERR:could not find'],
                ['the owner of cd fld "xyz"', 'ERR:could not find'],
                ['the owner of cd 1', 'bkgnd "a"'],
                ['the owner of second cd', 'bkgnd "b"'],
                ['the owner of fifth cd', 'bkgnd "c"'],
                ['the owner of cd "d" of bg 3', 'bkgnd "c"'],
            ];
            this.testBatchEvaluate(batch);
        },
        'test_vpcvalnumbers',
        () => {
            this.assertThrows('', '> 1e18', () => VpcValN(Infinity));
            this.assertThrows('', '> 1e18', () => VpcValN(Number.POSITIVE_INFINITY));
            this.assertThrows('', '> 1e18', () => VpcValN(-Infinity));
            this.assertThrows('', '> 1e18', () => VpcValN(Number.NEGATIVE_INFINITY));
            this.assertThrows('', '> 1e18', () => VpcValN(NaN));
            this.assertThrows('', '> 1e18', () => VpcValN(1 / 0));
            this.assertThrows('', '> 1e18', () => VpcValN(0 / 0));
            this.assertThrows('', '> 1e18', () => VpcValN(3 % 0));
            let batch: [string, string][];
            batch = [
                // scientific notation applied for num literals
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

                // arithmetic can't be done with large numbers
                // because most JS engines kick out to scientific notation
                // for large numbers and I don't really want to support those as valid numbers.
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
                ['(2^80 - 5^35)/(2e22)', 'ERR:> 1e18'],
            ];
            this.testBatchEvaluate(batch, true);

            batch = [
                // scientific notation not applied for strings
                ['"12.e0"', '12.e0'],
                ['"12.0e0"', '12.0e0'],
                ['"12.0e+1"', '12.0e+1'],
                ['"12.0e-1"', '12.0e-1'],

                // number way too large
                ['"3e99" is a number', 'false'],
                ['3e99 is a number', 'ERR:> 1e18'],
                ['"3e99" is a integer', 'false'],
                ['3e99 is a integer', 'ERR:> 1e18'],
                ['3e99', 'ERR:> 1e18'],
                ['1 + "3e99"', 'ERR:expected a number'],
                ['1 + 3e99', 'ERR:expected a number'],
                ['strToNumber("3e99")', 'false'],
                ['set the left of cd btn "p1" to 3e99\\0', 'ERR:> 1e18'],
                // number possible w most js engines, but we disallow to be conservative
                ['"2e19" is a number', 'false'],
                ['2e19 is a number', 'ERR:> 1e18'],
                ['"2e19" is a integer', 'false'],
                ['2e19 is a integer', 'ERR:> 1e18'],
                ['2e19', 'ERR:> 1e18'],
                ['1 + "2e19"', 'ERR:expected a number'],
                ['1 + 2e19', 'ERR:expected a number'],
                ['strToNumber("2e19")', 'false'],
                ['set the left of cd btn "p1" to 2e19\\0', 'ERR:> 1e18'],
                // number possible w most js engines, but we disallow to be conservative
                ['"20000000000000000000" is a number', 'false'],
                ['20000000000000000000 is a number', 'ERR:> 1e18'],
                ['"20000000000000000000" is a integer', 'false'],
                ['20000000000000000000 is a integer', 'ERR:> 1e18'],
                ['20000000000000000000', 'ERR:> 1e18'],
                ['1 + "20000000000000000000"', 'ERR:expected a number'],
                ['1 + 20000000000000000000', 'ERR:expected a number'],
                ['strToNumber("20000000000000000000")', 'false'],
                ['set the left of cd btn "p1" to 20000000000000000000\\0', 'ERR:> 1e18'],
                // number that we support as numeric, but not as an integer
                ['"200000000000000000" is a number', 'true'],
                ['200000000000000000 is a number', 'true'],
                ['"200000000000000000" is a integer', 'false'],
                ['200000000000000000 is a integer', 'false'],
                ['200000000000000000', '200000000000000000'],
                ['1 + "200000000000000000"', '200000000000000000'], // that's why it's not an int lol
                ['1 + 200000000000000000', '200000000000000000'], // that's why it's not an int lol
                ['strToNumber("200000000000000000")', '200000000000000000'],
                ['set the left of cd btn "p1" to 200000000000000000\\0', 'ERR:expected an integer'],
                // number that we support as numeric, but not as an integer
                ['"2e17" is a number', 'false'],
                ['2e17 is a number', 'true'],
                ['"2e17" is a integer', 'false'],
                ['2e17 is a integer', 'false'],
                ['2e17', '200000000000000000'],
                ['1 + "2e17"', 'ERR:expected a number'],
                ['1 + 2e17', '200000000000000000'], // that's why it's not an int lol
                ['strToNumber("2e17")', '200000000000000000'],
                ['set the left of cd btn "p1" to 2e17\\0', 'ERR:expected an integer'],
                // number that we support as numeric, but not as an integer
                ['"2147483649" is a number', 'true'],
                ['2147483649 is a number', 'true'],
                ['"2147483649" is a integer', 'false'],
                ['2147483649 is a integer', 'false'],
                ['2147483649', '2147483649'],
                ['1 + "2147483649"', '2147483650'],
                ['1 + 2147483649', '2147483650'],
                ['strToNumber("2147483649")', '2147483649'],
                ['set the left of cd btn "p1" to 2147483649\\0', 'ERR:expected an integer'],
                // number that we support as an integer
                ['"2147483640" is a number', 'true'],
                ['2147483640 is a number', 'true'],
                ['"2147483640" is a integer', 'true'],
                ['2147483640 is a integer', 'true'],
                ['1 + "2147483640"', '2147483641'],
                ['1 + 2147483640', '2147483641'],
                ['strToNumber("2147483640")', '2147483640'],
                ['set the left of cd btn "p1" to 2147483640\\0', '0'],
                // number that we support as an integer
                ['"3.3e2" is a number', 'false'],
                ['3.3e2 is a number', 'true'],
                ['"3.3e2" is a integer', 'false'],
                ['3.3e2 is a integer', 'true'],
                ['1 + "3.3e2"', 'ERR:expected a number'],
                ['1 + 3.3e2', '331'],
                ['strToNumber("3.3e2")', '330'],
                ['set the left of cd btn "p1" to 3.3e2\\0', '0'],

                // small scientitific notation
                ['"3.3e2" = "330"', 'false'],
                ['3.3e2 = "330"', 'true'],
                ['"334.56" = "3.3456e2"', 'false'],
                ['"334.56" = 3.3456e2', 'true'],
                ['3.3456e2 is a integer', 'false'],
                ['3.3456e2 is a number', 'true'],
                ['strToNumber("3.3456e2") = "334.56"', 'true'],
                ['strToNumber("3.3456e2") = 334.56', 'true'],
                ['strToNumber(3.3456e2) = "334.56"', 'true'],
                ['strToNumber(3.3456e2) = 334.56', 'true'],
            ];
            this.testBatchEvaluate(batch, false);
        },
        'test_builtinFunctions',
        () => {
            this.setCurrentCard(this.elIds.card_b_c);
            let batch: [string, string][];
            batch = [
                // RuleExprSource and RuleHSimpleContainer
                ['12', '12'],
                ['"abc"', 'abc'],
                ['put "qwerty" into cd fld "p3"\\cd fld "p3"', 'qwerty'],
                ['put "" into cd fld "p3"\\cd fld "p3"', ''],
                ['cd fld "p4"', 'ERR:element not found'],
                ['cd btn "p1"', 'ERR:we do not currently allow placing text'],
                ['cd btn "p4"', 'ERR:we do not currently allow placing text'],

                // casing
                ['PUT 5 Into myVar\\myVar', '5'],
                ['3 * MYVAR', '15'],
                ['SUM(MYVAR, Myvar, myvar)', '15'],

                // constants
                ['one', '1'],
                ['up', 'up'],
                ['cr', '\n'],
                ['return', '\n'],
            ];
            this.testBatchEvaluate(batch);

            this.setCurrentCard(this.elIds.card_b_c);
            batch = [
                // length
                ['the length of ""', '0'],
                ['the length of "abc"', '3'],
                ['the length of ("abc" & cr & cr & cr)', '6'],
                ['the length of 12', '2'],
                ['the length of true', '4'],
                ['length("")', '0'],
                ['length("abc")', '3'],
                ['length("abc" & cr & cr & cr)', '6'],
                ['length(12)', '2'],
                ['length(true)', '4'],

                // counting chunks
                ['the number of chars in ""', '0'],
                ['the number of chars in "  "', '2'],
                ['the number of chars in "abc"', '3'],
                ['the number of chars in 12', '2'],
                ['the number of chars in true', '4'],
                ['the number of items in ""', '0'],
                ['the number of items in "  "', '1'],
                ['the number of items in "a"', '1'],
                ['the number of items in "a,b,c"', '3'],
                ['the number of lines in ""', '0'],
                ['the number of lines in "  "', '1'],
                ['the number of lines in "a"', '1'],
                ['the number of lines in ("a" & cr & "b" & cr & "c")', '3'],
                ['the number of words in ""', '0'],
                ['the number of words in "  "', '0'],
                ['the number of words in "a"', '1'],
                ['the number of words in "a b c"', '3'],

                // counting objects
                ['the number of bgs', '3'],
                ['the number of bgs of this stack', '3'],
                ['the number of bgs of next stack', 'ERR:only accept referring to a stack'],
                ['the number of bgs of second stack', 'ERR:MismatchedTokenException'],
                ['the number of cds', '5'],
                ['the number of cds of this stack', '5'],
                ['the number of cds of this bg', '3'],
                ['the number of cds of bg 1', '1'],
                ['the number of cd btns', '2'],
                ['the number of cd flds', '3'],
                ['the number of cards', '5'],
                ['the number of cards of this stack', '5'],
                ['the number of cards of bg 1 of this stack', '1'],
                ['the number of cards of bg 1', '1'],
                ['the number of cards of bg 2', '3'],
                ['the number of cards of bg 3', '1'],
                ['the number of cards of bg 4', 'ERR:Cannot find this element'], // confirmed in emulator that it should throw
                ['the number of bgs', '3'],
                ['the number of bgs of this stack', '3'],
                ['selectedtext()', ''] /* use as breakpoint */,
            ];
            this.testBatchEvaluate(batch);

            batch = [
                // existence of objects
                [`there _is_ a ${cProductName}`, 'true'],
                [`there _is_ a target`, 'true'],
                [`there _is_ a the target`, 'true'],
                [`there _is_ a me`, 'true'],
                [`there _is_ a xyz`, 'ERR:We did not recognize'],
                [`there _is_ a this stack`, 'true'],
                [`there _is_ a next stack`, 'ERR:we only accept referring to a stack'],
                [`there _is_ a second stack`, 'ERR:NoViableAltException'],
                [`there _is_ a xyz stack`, 'ERR:we only accept referring to a stack'],

                // bg
                [`there _is_ a bg 1`, 'true'],
                [`there _is_ a bg 2`, 'true'],
                [`there _is_ a bg 4`, 'false'],
                [`there _is_ a bg id ${this.elIds.bg_b}`, 'true'],
                [`there _is_ a bg id 99`, 'false'],
                [`there _is_ a bg "a"`, 'true'],
                [`there _is_ a bg "notexist"`, 'false'],
                [`there _is_ a this bg`, 'true'],
                [`there _is_ a next bg`, 'true'],
                [`there _is_ a first bg`, 'true'],
                [`there _is_ a tenth bg`, 'true'], // todo: not really right?

                // card
                [`there _is_ a card 1`, 'true'],
                [`there _is_ a card 4`, 'true'],

                [`there _is_ a card 8`, 'false'],
                [`there _is_ a card id ${this.elIds.card_b_d}`, 'true'],
                [`there _is_ a card id 99`, 'false'],
                [`there _is_ a card "a"`, 'true'],
                [`there _is_ a card "notexist"`, 'false'],
                [`there _is_ a this card`, 'true'],
                [`there _is_ a next card`, 'true'],
                [`there _is_ a first card`, 'true'],
                [`there _is_ a tenth card`, 'true'], // todo: not really right?
                [`there _is_ a card 2 of this bg`, 'true'],
                [`there _is_ a card 2 of bg 2`, 'true'],
                [`there _is_ a card 2 of bg 1`, 'false'],
                [`there _is_ a card "d" of bg 1`, 'false'],
                [`there _is_ a card "d" of bg 2`, 'true'],
                [`there _is_ a card "d" of bg 3`, 'true'],

                // btn
                [`there _is_ a cd btn 1`, 'ERR:we no longer support'], // because we turned this off
                [`there _is_ a cd btn 70`, 'ERR:we no longer support'],
                [`there _is_ a cd btn "p1"`, 'true'],
                [`there _is_ a cd btn "p"`, 'false'],
                [`there _is_ a cd btn id ${this.elIds.btn_b_c_1}`, 'true'],
                [`there _is_ a cd btn id ${this.elIds.btn_b_d_1}`, 'true'],
                [`there _is_ a cd btn id 99`, 'false'],
                [`there _is_ a cd btn "p1" of this cd`, 'true'],
                [`there _is_ a cd btn "p1" of cd 2`, 'false'],
                [`there _is_ a cd btn "p1" of next cd`, 'true'],
                [`there _is_ a cd btn "p1" of cd "d" of bg 1`, 'false'],
                [`there _is_ a cd btn "p1" of cd "d" of bg 2`, 'true'],
                [`there _is_ a cd btn "p1" of cd "d" of bg 3`, 'true'],

                // fld
                [`there _is_ a cd fld 1`, 'ERR:we no longer support'], // because we turned this off
                [`there _is_ a cd fld 70`, 'ERR:we no longer support'],
                [`there _is_ a cd fld "p1"`, 'true'],
                [`there _is_ a cd fld "p"`, 'false'],
                [`there _is_ a cd fld id ${this.elIds.fld_b_c_1}`, 'true'],
                [`there _is_ a cd fld id ${this.elIds.fld_b_d_2}`, 'true'],
                [`there _is_ a cd fld id 99`, 'false'],
                [`there _is_ a cd fld "p1" of this cd`, 'true'],
                [`there _is_ a cd fld "p1" of cd 2`, 'false'],
                [`there _is_ a cd fld "p1" of next cd`, 'true'],
                [`there _is_ a cd fld "p2" of cd "d" of bg 1`, 'false'],
                [`there _is_ a cd fld "p2" of cd "d" of bg 2`, 'true'],
                [`there _is_ a cd fld "p2" of cd "d" of bg 3`, 'false'],
            ];
            this.testBatchEvalInvert(batch);

            batch = [
                // fn calls without parens
                ['the paramcount', '0'],
                ['the ParamCount', '0'],
                ['the params', ''],
                ['the result', ''],

                // we require parens for basically everything else though.
                ['the ticks', "ERR:you can't say something"],
                ['the screenrect', "ERR:you can't say something"],
                ['the sin', "ERR:you can't say something"],
                ['the offset', "ERR:you can't say something"],
                ['the rand', "ERR:you can't say something"],
                ['the sin of 2', 'ERR:NoViableAltException'],
                ['the xyz', "ERR:you can't say something"],
                ['sin of 2', 'ERR:NoViableAltException'],
            ];
            this.testBatchEvaluate(batch);

            batch = [
                // isolated
                ['diskspace()', `${100 * 1024 * 1024}`],
                ['heapspace()', `${100 * 1024 * 1024}`],
                ['stackspace()', `${100 * 1024 * 1024}`],
                ['round(systemversion() * 100)', `755`],
                ['random(1)', `1`],
                ['random(2) is in "12"', `true`],
                ['random(3) is in "123"', `true`],
                ['random(0)', `ERR:value must be >= 1`],
                ['random(-1)', `ERR:value must be >= 1`],
                ['screenrect()', `0,0,${ScreenConsts.screenwidth},${ScreenConsts.screenheight}`],
                ['chartonum("")', `0`],
                ['chartonum("a")', `97`],
                ['chartonum("abc")', `97`],
                ['chartonum(numtochar(4567))', `4567`],
                ['numtochar(0)', `ERR:numToChar must be`],
                ['numtochar(3)', `\x03`],
                ['numtochar(97)', `a`],
                ['numtochar(98)', `b`],
                ['numtochar(4567)', `\u11d7`],
                ['offset("a", "abc")', `1`],
                ['offset("c", "abc")', `3`],
                ['offset("", "abc")', `1`],
                ['offset("x", "abc")', `0`],
                ['offset("abcd", "abc")', `0`],
                ['offset("abd", "abc")', `0`],
                ['offset("bcd", "abc")', `0`],

                // math variadic
                ['max()', 'ERR:requires at least one'],
                ['min()', 'ERR:requires at least one'],
                ['sum()', 'ERR:requires at least one'],
                ['max(4,5,6)', '6'],
                ['max(6,5,4)', '6'],
                ['min(4,5,6)', '4'],
                ['min(6,5,4)', '4'],
                ['sum(4,5,6)', '15'],
                ['sum(1,2,3)', '6'],
                ['min("1,2,3")', '1'],
                ['min("1,2,3,")', '1'], // a bit odd, but confirmed in emulator
                ['min(",1,2,3")', '0'],
                ['min(",1,2,3,")', '0'],
                ['min("1,2,3,,")', '0'],
                ['sum("")', '0'],
                ['sum(1)', '1'],
                ['sum("1")', '1'],
                ['sum(" 1 ")', '1'],
                ['sum(1,2)', '3'],
                ['sum("1,2")', '3'],
                ['sum(1," 2 ")', '3'],
                ['sum(" 1 ",2)', '3'],
                ['sum(" 1 "," 2 ")', '3'],
                ['sum(" 1 , 2 ")', '3'],
                ['sum("1a")', 'ERR:expected a number'],
                ['sum("1 a")', 'ERR:expected a number'],
                ['sum("1 , 2a")', 'ERR:expected a number'],
                ['sum("1 , 2 a")', 'ERR:expected a number'],
                ['sum("1,2")', '3'],
                ['sum("1,2,")', '3'],
                ['sum("1,2, ")', '3'],
                ['sum(",1,2")', '3'],
                ['sum("1,2,,")', '3'],
                ['sum(" ,1,2,,")', '3'],
                ['sum(" , 1 , 2 , , ")', '3'],

                // with "the"
                ['the diskspace', `ERR:you can't say something`],
                ['the diskspace()', `${100 * 1024 * 1024}`],
                ['the abs(123)', '123'],
                ['the offset("c", "abc")', '3'],

                // reading the time
                ['the ticks() - the ticks() >= 0', 'true'],
                [
                    `put the seconds() into x
                put 31557600 into sInYear
                put 2017.75 into curYear
                put (curYear - 1904) * sInYear into lowBound
                put lowBound + sInYear into upperBound
                \\x > lowBound and x < upperBound`,
                    'true',
                ],
            ];
            this.testBatchEvaluate(batch);

            batch = [
                // isolated, math
                // abs
                ['abs(0)', '0'],
                ['abs(-123)', '123'],
                ['abs(123)', '123'],

                // round
                ['round(3.9)', '4'],
                ['round(4)', '4'],
                ['round(4.4)', '4'],
                ['round(4.49)', '4'],
                ['round(4.51)', '5'],
                ['round(4.6)', '5'],
                ['round(4.5)', '4'],
                ['round(5.5)', '6'],
                ['round(6.5)', '6'],
                ['round(7.5)', '8'],
                ['round(-0.5)', '0'],
                ['round(-1.5)', '-2'],
                ['round(-2.5)', '-2'],
                ['round(-3.5)', '-4'],

                // trunc
                ['trunc(4.5)', '4'],
                ['trunc(4.6)', '4'],
                ['trunc(4.4)', '4'],
                ['trunc(4)', '4'],
                ['trunc(3.9)', '3'],
                ['trunc(-0)', '0'],
                ['trunc(-0.3)', '0'],
                ['trunc(-1.7)', '-1'],

                // unlike the emulator, we throw errors
                ['4/0', 'ERR:> 1e18'],
                ['0/0', 'ERR:> 1e18'],
                ['"1.0"/"0.0"', 'ERR:> 1e18'],
                ['sqrt(-3)', 'ERR:> 1e18'],
                ['ln(-400)', 'ERR:> 1e18'],
                ['ln1(-400)', 'ERR:> 1e18'],
                ['log2(-400)', 'ERR:> 1e18'],

                // isolated, needs floating point compare
                ['atan(5)', '1.373400766945016'],
                ['atan(6)', '1.4056476493802699'],
                ['sin(5)', '-0.9589242746631385'],
                ['sin(6)', '-0.27941549819892586'],
                ['cos(5)', '0.28366218546322625'],
                ['cos(6)', '0.9601702866503661'],
                ['tan(5)', '-3.380515006246586'],
                ['tan(6)', '-0.29100619138474915'],
                ['ln(5)', '1.6094379124341003'],
                ['ln(6)', '1.791759469228055'],
                ['ln1(5)', '1.791759469228055'],
                ['ln1(6)', '1.9459101490553132'],
                ['log2(5)', '2.321928094887362'],
                ['log2(6)', '2.584962500721156'],
                ['exp(5)', '148.4131591025766'],
                ['exp(6)', '403.4287934927351'],
                ['exp1(5)', '147.4131591025766'],
                ['exp1(6)', '402.4287934927351'],
                ['exp2(5)', '32'],
                ['exp2(6)', '64'],
                ['sqrt(5)', '2.23606797749979'],
                ['sqrt(6)', '2.449489742783178'],

                // round trip
                ['ln(6)', '1.791759469228055'],
                ['exp(1.791759469228055)', '6'],
                ['ln1(6)', '1.9459101490553132'],
                ['exp1(1.9459101490553132)', '6'],
                ['log2(5)', '2.321928094887362'],
                ['exp2(2.321928094887362)', '5'],
            ];
            this.testBatchEvaluate(batch, true);

            let userBounds = this.ctrller.userBounds;
            batch = [
                // unknown
                ['xyz()', 'ERR:no handler'],
                ['xyz(1)', 'ERR:no handler'],
                ['xyz(1,2)', 'ERR:no handler'],

                // uses outside world
                ['cmdkey()', 'ERR:not a key event'],
                ['commandkey()', 'ERR:not a key event'],
                ['optionkey()', 'ERR:not a key event'],
                ['shiftkey()', 'ERR:not a key event'],
                ['clickh()', `${this.simClickX - userBounds[0]}`],
                ['clickv()', `${this.simClickY - userBounds[1]}`],
                ['clickloc()', `${this.simClickX - userBounds[0]},${this.simClickY - userBounds[1]}`],
                ['mouse()', `up`],
                ['mouseclick()', `true`],
                ['mouseh()', `${this.simMouseX - userBounds[0]}`],
                ['mousev()', `${this.simMouseY - userBounds[1]}`],
                ['mouseloc()', `${this.simMouseX - userBounds[0]},${this.simMouseY - userBounds[1]}`],
                ['param(0)', ``],
                ['param(1)', ``],
                ['param(2)', ``],
                ['paramcount()', `0`],
                ['params()', ``],
                ['result()', ``],
                ['tool()', `browse`],

                // casing
                ['CLICKLOC()', `${this.simClickX - userBounds[0]},${this.simClickY - userBounds[1]}`],
                ['clIcKloC()', `${this.simClickX - userBounds[0]},${this.simClickY - userBounds[1]}`],
                ['ClickLoc()', `${this.simClickX - userBounds[0]},${this.simClickY - userBounds[1]}`],
            ];
            this.testBatchEvaluate(batch);
        },
    ];
}
