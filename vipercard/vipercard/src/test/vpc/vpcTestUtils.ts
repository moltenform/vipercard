
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { TextFontStyling, stringToTextFontStyling, textFontStylingToString } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { VpcOpCtg } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VpcEvalHelpers } from '../../vpc/vpcutils/vpcValEval.js';
/* auto */ import { SubstringStyleComplex } from '../../vpc/vpcutils/vpcStyleComplex.js';

/**
 * tests on vpcutils
 */
let mTests: (string | Function)[] = [
    'testVpcStyleToInt',
    () => {
        assertEq(TextFontStyling.Default, SubstringStyleComplex.vpcStyleToInt([]), 'I#|');
        assertEq(TextFontStyling.Default, SubstringStyleComplex.vpcStyleToInt(['plain']), 'I!|');
        assertEq(TextFontStyling.Bold, SubstringStyleComplex.vpcStyleToInt(['bold']), 'I |');
        assertEq(
            TextFontStyling.Bold | TextFontStyling.Italic,
            SubstringStyleComplex.vpcStyleToInt(['bold', 'italic']),
            'Iz|'
        );
        assertEq(
            TextFontStyling.Bold | TextFontStyling.Italic | TextFontStyling.Underline,
            SubstringStyleComplex.vpcStyleToInt(['bold', 'italic', 'underline']),
            'Iy|'
        );
        assertEq(TextFontStyling.Shadow, SubstringStyleComplex.vpcStyleToInt(['shadow']), 'Ix|');
        assertEq(
            TextFontStyling.Shadow | TextFontStyling.Condense,
            SubstringStyleComplex.vpcStyleToInt(['shadow', 'condense']),
            'Iw|'
        );
        assertEq(
            TextFontStyling.Shadow | TextFontStyling.Condense | TextFontStyling.Outline,
            SubstringStyleComplex.vpcStyleToInt(['shadow', 'condense', 'outline']),
            'Iv|'
        );
    },
    'testStringToTextFontStyling',
    () => {
        assertEq(TextFontStyling.Default, stringToTextFontStyling('biuosdce'), 'Iu|');
        assertEq(TextFontStyling.Bold, stringToTextFontStyling('+biuosdce'), 'It|');
        assertEq(TextFontStyling.Bold | TextFontStyling.Italic, stringToTextFontStyling('+b+iuosdce'), 'Is|');
        assertEq(
            TextFontStyling.Bold | TextFontStyling.Italic | TextFontStyling.Underline,
            stringToTextFontStyling('+b+i+uosdce'),
            'Ir|'
        );
        assertEq(TextFontStyling.Shadow, stringToTextFontStyling('biuo+sdce'), 'Iq|');
        assertEq(TextFontStyling.Shadow | TextFontStyling.Condense, stringToTextFontStyling('biuo+sd+ce'), 'Ip|');
        assertEq(
            TextFontStyling.Shadow | TextFontStyling.Condense | TextFontStyling.Outline,
            stringToTextFontStyling('biu+o+sd+ce'),
            'Io|'
        );
    },
    'vpcStyleFromInt',
    () => {
        assertEq('plain', SubstringStyleComplex.vpcStyleFromInt(TextFontStyling.Default), 'In|');
        assertEq('bold', SubstringStyleComplex.vpcStyleFromInt(TextFontStyling.Bold), 'Im|');
        assertEq(
            'bold,italic',
            SubstringStyleComplex.vpcStyleFromInt(TextFontStyling.Bold | TextFontStyling.Italic),
            'Il|'
        );
        assertEq(
            'bold,italic,underline',
            SubstringStyleComplex.vpcStyleFromInt(
                TextFontStyling.Bold | TextFontStyling.Italic | TextFontStyling.Underline
            ),
            'Ik|'
        );
        assertEq('shadow', SubstringStyleComplex.vpcStyleFromInt(TextFontStyling.Shadow), 'Ij|');
        assertEq(
            'shadow,condense',
            SubstringStyleComplex.vpcStyleFromInt(TextFontStyling.Shadow | TextFontStyling.Condense),
            'Ii|'
        );
        assertEq(
            'outline,shadow,condense',
            SubstringStyleComplex.vpcStyleFromInt(
                TextFontStyling.Shadow | TextFontStyling.Condense | TextFontStyling.Outline
            ),
            'Ih|'
        );
    },
    'testTextFontStylingToString',
    () => {
        assertEq('biuosdce', textFontStylingToString(TextFontStyling.Default), 'Ig|');
        assertEq('+biuosdce', textFontStylingToString(TextFontStyling.Bold), 'If|');
        assertEq('+b+iuosdce', textFontStylingToString(TextFontStyling.Bold | TextFontStyling.Italic), 'Ie|');
        assertEq(
            '+b+i+uosdce',
            textFontStylingToString(TextFontStyling.Bold | TextFontStyling.Italic | TextFontStyling.Underline),
            'Id|'
        );
        assertEq('biuo+sdce', textFontStylingToString(TextFontStyling.Shadow), 'Ic|');
        assertEq('biuo+sd+ce', textFontStylingToString(TextFontStyling.Shadow | TextFontStyling.Condense), 'Ib|');
        assertEq(
            'biu+o+sd+ce',
            textFontStylingToString(TextFontStyling.Shadow | TextFontStyling.Condense | TextFontStyling.Outline),
            'Ia|'
        );
    },
    'testEvalHelpers.String Comparisons Must Be A Strict Match',
    () => {
        testEquality(true, '', '');
        testEquality(false, '', ' ');
        testEquality(true, ' ', ' ');
        testEquality(false, ' ', '\t');
        testEquality(false, ' ', '\n');
        testEquality(false, ' ', ' \t');
        testEquality(false, ' ', ' \n');
        testEquality(false, ' ', '  ');
        testEquality(false, '\n', '\n\n');
        testEquality(false, '\t', '\t\t');
        testEquality(true, 'abc', 'abc');
        testEquality(true, '123', '123');
        testEquality(true, '   ', '   ');
        testEquality(true, '\t', '\t');
        testEquality(true, '\r', '\r');
        testEquality(true, '\n', '\n');
        testEquality(false, 'abc', 'abc ');
        testEquality(true, 'abc ', 'abc ');
        testEquality(false, 'abc', ' abc');
        testEquality(true, ' abc', ' abc');
        testEquality(false, 'abc', 'abc\t');
        testEquality(true, 'abc\t', 'abc\t');
        testEquality(false, 'abc', '\tabc');
        testEquality(true, '\tabc', '\tabc');
        testEquality(false, 'abc', 'abc\n');
        testEquality(true, 'abc\n', 'abc\n');
        testEquality(false, 'abc', '\nabc');
        testEquality(true, '\nabc', '\nabc');
        testEquality(false, '12a', '12a ');
        testEquality(true, '12a ', '12a ');
        testEquality(false, '12a', ' 12a');
        testEquality(true, ' 12a', ' 12a');
        testEquality(false, '12a', '12a\t');
        testEquality(true, '12a\t', '12a\t');
        testEquality(false, '12a', '\t12a');
        testEquality(true, '\t12a', '\t12a');
        testEquality(false, '12a', '12a\n');
        testEquality(true, '12a\n', '12a\n');
        testEquality(false, '12a', '\n12a');
        testEquality(true, '\n12a', '\n12a');
    },
    'testEvalHelpers.Number comparisons allow trailing - and even preceding - whitespace',
    () => {
        testEquality(true, '12', '12 ');
        testEquality(true, '12 ', '12 ');
        testEquality(true, '12', ' 12');
        testEquality(true, '12', ' 12 ');
        testEquality(true, ' 12 ', ' 12 ');
        testEquality(true, '12', '12\t');
        testEquality(true, '12\t', '12\t');
        testEquality(true, '12', '\t12');
        testEquality(true, '12', ' 12\t');
        testEquality(true, '\t12\t', '\t12\t');
        testEquality(true, '12', '12\n');
        testEquality(true, '12\n', '12\n');
        testEquality(true, '12', '\n12');
        testEquality(true, '12', ' 12\n');
        testEquality(true, '\n12\n', '\n12\n');
        testEquality(true, '12.0', '12 ');
        testEquality(true, '12.0 ', '12 ');
        testEquality(true, '12.0', ' 12');
        testEquality(true, '12.0', ' 12 ');
        testEquality(true, ' 12.0 ', ' 12 ');
        testEquality(true, '12.0', '12\t');
        testEquality(true, '12.0\t', '12\t');
        testEquality(true, '12.0', '\t12');
        testEquality(true, '12.0', ' 12\t');
        testEquality(true, '\t12.0\t', '\t12\t');
        testEquality(true, '12.0', '12\n');
        testEquality(true, '12.0\n', '12\n');
        testEquality(true, '12.0', '\n12');
        testEquality(true, '12.0', ' 12\n');
        testEquality(true, '\n12.0\n', '\n12\n');
    },
    'testEvalHelpers.Number special numeric cases',
    () => {
        testEquality(true, '\n12', '\t12\t');
        testEquality(true, '   12', '\n\n12\n\n');
        testEquality(true, '12', '12.');
        testEquality(true, '12.', '12.');
        testEquality(true, '12', '12.0');
        testEquality(true, '12', '12.0000000');
        testEquality(true, '12', '012');
        testEquality(true, '12', '0000012');
        testEquality(true, '12', '0000012.0000');
        testEquality(true, '-12', '-0000012.0000');
        testEquality(true, '-012', '-12');
        testEquality(true, '-12 ', '-12');
        testEquality(true, '12.000', '00012');
        testEquality(false, '12', '12,0');
        testEquality(false, '12,000', '00012,0');
    },
    'testEvalHelpers.Number, very close numbers compare equal',
    () => {
        /* confirmed in an emulator that very close numbers compare equal */
        testEquality(true, '4', '4 ');
        testEquality(true, '4', '4.0 ');
        testEquality(true, '4', '4.0000000000 ');
        testEquality(true, '4', '4.0000000001 ');
        testEquality(false, '4', '4.0001 ');
        testEquality(true, '4', '3.99999999999 ');
        testEquality(false, '4', '3.9999 ');
        testEquality(true, '-4', '-4 ');
        testEquality(true, '-4', ' -4. ');
        testEquality(true, '-4', '-4.0 ');
        testEquality(true, '-4', '-4.0000000000 ');
        testEquality(true, '-4', '-4.0000000001 ');
        testEquality(false, '-4', '-4.0001 ');
        testEquality(true, '-4', '-3.99999999999 ');
        testEquality(false, '-4', '-3.9999 ');
        testEquality(true, '0', '0 ');
        testEquality(true, '0', '0.0 ');
        testEquality(true, '0', '0.0000000000 ');
        testEquality(true, '0', '0.0000000001 ');
        testEquality(false, '0', '0.0001 ');
        testEquality(true, '0', '-0.0000000000 ');
        testEquality(true, '0', '-0.0000000001 ');
        testEquality(false, '0', '-0.0001 ');
        testEquality(true, '0', '-0 ');
        testEquality(true, '0', '-0');
        testEquality(false, '4', '-4 ');
        testEquality(false, '4', '-4');
    }
];

/**
 * exported test class for mTests
 */
export class TestVpcUtils extends UI512TestBase {
    static evalHelper = new VpcEvalHelpers();
    tests = mTests;
}

/**
 * assert that (inp1 == inp2) is exp,
 * and that (inp2 == inp1) is exp
 */
function testEquality(exp: boolean, inp1: string, inp2: string) {
    let h = TestVpcUtils.evalHelper;
    let got = h.evalOp(VpcValS(inp1), VpcValS(inp2), VpcOpCtg.OpEqualityGreaterLessOrContains, '==');
    assertEq(exp.toString(), got.readAsString(), '2i|');

    /* equality should be commutative */
    got = h.evalOp(VpcValS(inp2), VpcValS(inp1), VpcOpCtg.OpEqualityGreaterLessOrContains, '==');
    assertEq(exp.toString(), got.readAsString(), '2h|');
}
