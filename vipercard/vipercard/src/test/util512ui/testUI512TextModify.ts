
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { assertEq } from './../../ui512/utils/util512';
/* auto */ import { TextSelModifyImpl } from './../../ui512/textedit/ui512TextSelModifyImpl';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { TextFontStyling, specialCharFontChange, textFontStylingToString } from './../../ui512/drawtext/ui512DrawTextClasses';
/* auto */ import { SimpleUtil512TestCollection, assertAsserts } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * tests on TextSelModifyImpl that modify the text
 *
 * To make the tests easier to read, we use the symbol
 * ^ to mean the selcaret (start of selection)
 * # to mean the selend (end of selection)
 * and
 * | to mean a newline character
 *
 *
 * For example, to say that the second word should be selected, we can write
 * "abc ^def# ghi"
 */
let t = new SimpleUtil512TestCollection('testCollectionUI512TextModify');
export let testCollectionUI512TextModify = t;

const dup = TextSelModifyImpl.changeTextDuplicate;
const ind = TextSelModifyImpl.changeTextIndentation;
const prfx = TextSelModifyImpl.changeTextToggleLinePrefix;

t.test('changeTextDuplicate', () => {
    runT('^#', '^#', dup);
    runT('^#a|a', '^#a', dup);
    runT('a^#|a', 'a^#', dup);
    runT('abcd^#|abcd', 'abcd^#', dup);
    runT('a^#bcd|abcd', 'a^#bcd', dup);
    runT('^#abcd|abcd', '^#abcd', dup);
    runT('a^#bcd|abcd', 'a^bc#d', dup);
    runT('12|abcd^#|abcd', '12|abcd^#', dup);
    runT('12|a^#bcd|abcd', '12|a^#bcd', dup);
    runT('12|^#abcd|abcd', '12|^#abcd', dup);
    runT('12|a^#bcd|abcd', '12|a^bc#d', dup);
    runT('12|abcd^#|abcd|34', '12|abcd^#|34', dup);
    runT('12|a^#bcd|abcd|34', '12|a^#bcd|34', dup);
    runT('12|^#abcd|abcd|34', '12|^#abcd|34', dup);
    runT('12|a^#bcd|abcd|34', '12|a^bc#d|34', dup);
    runT('abcd^#|abcd|34', 'abcd^#|34', dup);
    runT('a^#bcd|abcd|34', 'a^#bcd|34', dup);
    runT('^#abcd|abcd|34', '^#abcd|34', dup);
    runT('a^#bcd|abcd|34', 'a^bc#d|34', dup);
});
t.test('modifyConfirmThatFailureAsserts', () => {
    runT('abcd^#|abcd', 'abcd^#', dup);
    /* getting the wrong text should assert */
    assertAsserts('QG|', 'wrong text', () => {
        runT('abcd^#|Abcd', 'abcd^#', dup);
    });
    /* missing caret should assert */
    assertAsserts('QF|', 'assert:', () => {
        runT('abcd#|abcd', 'abcd^#', dup);
    });
    /* missing end should assert */
    assertAsserts('QE|', 'assert:', () => {
        runT('abcd^|abcd', 'abcd^#', dup);
    });
    /* getting the wrong caret should assert */
    assertAsserts('QD|', 'incorrect caret', () => {
        runT('abc^d#|abcd', 'abcd^#', dup);
    });
    /* getting the wrong end should assert */
    assertAsserts('QC|', 'incorrect select-end', () => {
        runT('abcd^|#abcd', 'abcd^#', dup);
    });
});
t.test('changeTextIndentation.Decrease,OneLine', () => {
    runT('^#', '^#', ind, true, defFont);
    runT('^abc#', 'abc^#', ind, true, defFont);
    runT('^a\tbc#', 'a\tbc^#', ind, true, defFont);
    runT('^abc#', '\ta^b#c', ind, true, defFont);
    runT('^abc#', '\tabc^#', ind, true, defFont);
    runT('^\tabc#', '\t\tabc^#', ind, true, defFont);
    runT('^\t\tabc#', '\t\t\tabc^#', ind, true, defFont);
    runT('^abc\tdef#', '\tabc\tdef^#', ind, true, defFont);
    runT('^abc#', '    abc^#', ind, true, defFont);
    runT('^\tabc#', '        abc^#', ind, true, defFont);
    runT('^\tabc#', '    \tabc^#', ind, true, defFont);
});
t.test('changeTextIndentation.Increase,OneLine', () => {
    runT('^#', '^#', ind, false, defFont);
    runT('^\tabc#', 'abc^#', ind, false, defFont);
    runT('^\ta\tbc#', 'a\tbc^#', ind, false, defFont);
    runT('^\t\tabc#', '\ta^b#c', ind, false, defFont);
    runT('^\t\tabc#', '\tabc^#', ind, false, defFont);
    runT('^\t\t\tabc#', '\t\tabc^#', ind, false, defFont);
    runT('^\t\t\t\tabc#', '\t\t\tabc^#', ind, false, defFont);
    runT('^\t\ta\tdef#', '\ta\tdef^#', ind, false, defFont);
    runT('^\t\tabc#', '    abc^#', ind, false, defFont);
    runT('^\t\t\tabc#', '        abc^#', ind, false, defFont);
    runT('^\t\t\tabc#', '    \tabc^#', ind, false, defFont);
});
t.test('changeTextIndentation.Decrease,ManyLines', () => {
    runT('^\tabc|ABC|def#|\tDEF', '^\t\tabc|\tABC|def#|\tDEF', ind, true, defFont);
    runT('^\tabc|ABC|def#|\tDEF', '\t\tab^c|\tABC|d#ef|\tDEF', ind, true, defFont);
    runT('\t\tabc|^ABC|def#|\tDEF', '\t\tabc|^\tABC|def#|\tDEF', ind, true, defFont);
    runT('\t\tabc|^ABC|def#|\tDEF', '\t\tabc|\tABC^|#def|\tDEF', ind, true, defFont);
});
t.test('changeTextIndentation.Increase,ManyLines', () => {
    runT(
        '^\t\t\tabc|\t\tABC|\tdef#|\tDEF',
        '^\t\tabc|\tABC|def#|\tDEF',
        ind,
        false,
        defFont
    );
    runT(
        '^\t\t\tabc|\t\tABC|\tdef#|\tDEF',
        '\t\tab^c|\tABC|d#ef|\tDEF',
        ind,
        false,
        defFont
    );
    runT(
        '\t\tabc|^\t\tABC|\tdef#|\tDEF',
        '\t\tabc|^\tABC|def#|\tDEF',
        ind,
        false,
        defFont
    );
    runT(
        '\t\tabc|^\t\tABC|\tdef#|\tDEF',
        '\t\tabc|\tABC^|#def|\tDEF',
        ind,
        false,
        defFont
    );
});
t.test('changeTextToggleLinePrefix.AddPrefixOnOneLine', () => {
    runT('^#', '^#', prfx, 'PRE', defFont);
    runT('^PREabc#', 'abc^#', prfx, 'PRE', defFont);
    runT('^PREabc#', '^#abc', prfx, 'PRE', defFont);
    runT('^PREPRabc#', 'PRabc^#', prfx, 'PRE', defFont);
    runT('^PREaPREbc#', '^#aPREbc', prfx, 'PRE', defFont);
    runT('^\tPREaPREbc#', '^#\taPREbc', prfx, 'PRE', defFont);
});
t.test('changeTextToggleLinePrefix.RemovePrefixOnOneLine', () => {
    runT('^abc#', 'PREabc^#', prfx, 'PRE', defFont);
    runT('^abc#', '^#PREabc', prfx, 'PRE', defFont);
    runT('^PRabc#', 'PREPRabc^#', prfx, 'PRE', defFont);
    runT('^aPREbc#', '^#PREaPREbc', prfx, 'PRE', defFont);
    runT('^PREabc#', '^#PREPREabc', prfx, 'PRE', defFont);
    runT('^\tPREabc#', '^#\tPREPREabc', prfx, 'PRE', defFont);
});
t.test('changeTextToggleLinePrefix.AddPrefixOnManyLines', () => {
    let c = specialCharFontChange;
    runT('^PREab|PREcd#|ef', '^ab|cd#|ef', prfx, 'PRE', defFont);
    runT('^PREab|PREcd#|ef', 'ab^|#cd|ef', prfx, 'PRE', defFont);
    runT(`ab|^PREcd|${c}${defFont}${c}PRE#`, 'ab|cd#|^', prfx, 'PRE', defFont);
    runT(`ab|cd|${c}${defFont}${c}^PRE#`, 'ab|cd|^#', prfx, 'PRE', defFont);
});
t.test('changeTextToggleLinePrefix.RemovePrefixOnManyLines', () => {
    let c = specialCharFontChange;
    runT('^ab|cd#|PREef', '^PREab|PREcd#|PREef', prfx, 'PRE', defFont);
    runT('^ab|cd#|PREef', 'PREab^|#PREcd|PREef', prfx, 'PRE', defFont);
    runT(`PREab|^cd|${c}${defFont}${c}PRE#`, 'PREab|PREcd#|^', prfx, 'PRE', defFont);
    runT(`PREab|PREcd|^${c}${defFont}${c}PRE#`, 'PREab|PREcd|^#', prfx, 'PRE', defFont);
});
t.test('changeTextDeleteLine', () => {
    runT('^#', '^#', TextSelModifyImpl.changeTextDeleteLine);
    runT('^#', 'abc^#', TextSelModifyImpl.changeTextDeleteLine);
    runT('^#', 'a^b#c', TextSelModifyImpl.changeTextDeleteLine);
    runT('^#cd|ef', 'ab^#|cd|ef', TextSelModifyImpl.changeTextDeleteLine);
    runT('^#cd|ef', '^ab#|cd|ef', TextSelModifyImpl.changeTextDeleteLine);
    runT('^#cd|ef', 'ab^|cd#|ef', TextSelModifyImpl.changeTextDeleteLine);
    runT('ab|^#ef', 'ab|cd^#|ef', TextSelModifyImpl.changeTextDeleteLine);
    runT('ab|^#ef', 'ab|^cd#|ef', TextSelModifyImpl.changeTextDeleteLine);
    runT('ab|^#ef', 'ab|cd^|ef#', TextSelModifyImpl.changeTextDeleteLine);
    runT('ab|cd|^#', 'ab|cd|ef^#', TextSelModifyImpl.changeTextDeleteLine);
    runT('ab|cd|^#', 'ab|cd|^ef#', TextSelModifyImpl.changeTextDeleteLine);
    runT('ab|cd|^#', 'ab|cd#|ef^', TextSelModifyImpl.changeTextDeleteLine);
});
t.test('changeTextBackspace.DeleteToTheLeft', () => {
    runT('^#abc', '^#abc', TextSelModifyImpl.changeTextBackspace, true, false);
    runT('^#bc', 'a^#bc', TextSelModifyImpl.changeTextBackspace, true, false);
    runT('a^#c', 'ab^#c', TextSelModifyImpl.changeTextBackspace, true, false);
    runT('ab^#', 'abc^#', TextSelModifyImpl.changeTextBackspace, true, false);
});
t.test('changeTextBackspace.DeleteToTheRight', () => {
    runT('^#bc', '^#abc', TextSelModifyImpl.changeTextBackspace, false, false);
    runT('a^#c', 'a^#bc', TextSelModifyImpl.changeTextBackspace, false, false);
    runT('ab^#', 'ab^#c', TextSelModifyImpl.changeTextBackspace, false, false);
    runT('abc^#', 'abc^#', TextSelModifyImpl.changeTextBackspace, false, false);
});
t.test('changeTextBackspace.DeleteSelectionWithBackspaceKey', () => {
    runT('a^#d', 'a^bc#d', TextSelModifyImpl.changeTextBackspace, true, false);
    runT('a^#d', 'a#bc^d', TextSelModifyImpl.changeTextBackspace, true, false);
    runT('^#d', '^abc#d', TextSelModifyImpl.changeTextBackspace, true, false);
    runT('a^#', 'a^bcd#', TextSelModifyImpl.changeTextBackspace, true, false);
    runT('^#', '^abcd#', TextSelModifyImpl.changeTextBackspace, true, false);
    runT('^#', '^#', TextSelModifyImpl.changeTextBackspace, true, false);
});
t.test('changeTextBackspace.DeleteSelectionWithDeleteKey', () => {
    runT('a^#d', 'a^bc#d', TextSelModifyImpl.changeTextBackspace, false, false);
    runT('a^#d', 'a#bc^d', TextSelModifyImpl.changeTextBackspace, false, false);
    runT('^#d', '^abc#d', TextSelModifyImpl.changeTextBackspace, false, false);
    runT('a^#', 'a^bcd#', TextSelModifyImpl.changeTextBackspace, false, false);
    runT('^#', '^abcd#', TextSelModifyImpl.changeTextBackspace, false, false);
    runT('^#', '^#', TextSelModifyImpl.changeTextBackspace, false, false);
});
t.test('changeTextInsert.TypeCharacters', () => {
    runT('1^#abc', '^#abc', TextSelModifyImpl.changeTextInsert, '1', defFont);
    runT('123^#abc', '^#abc', TextSelModifyImpl.changeTextInsert, '123', defFont);
    runT('a123^#bc', 'a^#bc', TextSelModifyImpl.changeTextInsert, '123', defFont);
    runT('ab123^#c', 'ab^#c', TextSelModifyImpl.changeTextInsert, '123', defFont);
    runT('abc123^#', 'abc^#', TextSelModifyImpl.changeTextInsert, '123', defFont);
});
t.test('changeTextInsert.TypeCharactersAndReplaceExisting', () => {
    runT('a123^#d', 'a^bc#d', TextSelModifyImpl.changeTextInsert, '123', defFont);
    runT('a123^#d', 'a#bc^d', TextSelModifyImpl.changeTextInsert, '123', defFont);
    runT('123^#d', '^abc#d', TextSelModifyImpl.changeTextInsert, '123', defFont);
    runT('a123^#', 'a^bcd#', TextSelModifyImpl.changeTextInsert, '123', defFont);
    runT('123^#', '^abcd#', TextSelModifyImpl.changeTextInsert, '123', defFont);
});
t.test('changeTextInsert.TypeCharactersShouldUseDefaultFontIfAnEmptyField', () => {
    let c = specialCharFontChange;
    runT(
        `${c}${defFont}${c}123^#`,
        '^#',
        TextSelModifyImpl.changeTextInsert,
        '123',
        defFont
    );
});
t.test('changeTextInsert.TypedCharactersShouldMatchAdjacentFont', () => {
    let style = textFontStylingToString(TextFontStyling.Default);
    let c = specialCharFontChange;
    runT(
        `${c}courier_1_${style}${c}ABC^#a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
        `^#${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
        TextSelModifyImpl.changeTextInsert,
        'ABC',
        defFont
    );
    runT(
        `${c}courier_1_${style}${c}aABC^#${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
        `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}^#b${c}courier_3_${style}${c}c`,
        TextSelModifyImpl.changeTextInsert,
        'ABC',
        defFont
    );
    runT(
        `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}bABC^#${c}courier_3_${style}${c}c`,
        `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}^#c`,
        TextSelModifyImpl.changeTextInsert,
        'ABC',
        defFont
    );
    runT(
        `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}cABC^#`,
        `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c^#`,
        TextSelModifyImpl.changeTextInsert,
        'ABC',
        defFont
    );
});

/* returns the tuple  expectedTxt, expectedCaret, expectedEnd */
type FnChangesSelection = (...args: unknown[]) => [FormattedText, number, number];

/**
 * run fromPlainText to get the selcaret and selend markers,
 * then run the callback with the provided args,
 * then compare expected and received results
 */
function runT(
    expected: string,
    input: string,
    fn: FnChangesSelection,
    ...moreargs: unknown[]
) {
    expected = expected.replace(/\|/g, '\n');
    input = input.replace(/\|/g, '\n');
    let [t, selcaret, selend] = FormattedTextFromPlainText.fromPlainText(input);
    let args = [t, selcaret, selend, ...moreargs];
    assertTrue(args.length < 100, 'QB|too many args passed to testChangeText');
    let [gotTxt, gotSelCaret, gotSelEnd] = fn(...args);
    let [
        expectedTxt,
        expectedCaret,
        expectedEnd
    ] = FormattedTextFromPlainText.fromPlainText(expected);
    assertEq(expectedTxt.toSerialized(), gotTxt.toSerialized(), '1p|wrong text');
    assertEq(expectedCaret, gotSelCaret, '1o|incorrect caret position');
    assertEq(expectedEnd, gotSelEnd, '1n|incorrect select-end position');
}

/**
 * make the test code easier to read by putting markers like ^
 * to indicate the selection
 */
export class FormattedTextFromPlainText {
    /**
     * From one string with ^ and # markers,
     * to [FormattedText, selcaret, selend]
     *
     * To make the tests easier to read, we use the symbol
     * ^ to mean the selcaret (start of selection)
     * # to mean the selend (end of selection)
     */
    static fromPlainText(s: string): [FormattedText, number, number] {
        /* step 1) get a string without the font changes */
        let tToGetUnformatted = FormattedText.newFromSerialized(s);
        let sUnformatted = tToGetUnformatted.toUnformatted();
        assertTrue(
            sUnformatted.includes('^') && sUnformatted.includes('#'),
            `1m|string "${sUnformatted}" needs ^ and #`
        );

        /* step 2) get caret positions */
        let selCaret;
        let selEnd;
        if (sUnformatted.indexOf('^') < sUnformatted.indexOf('#')) {
            selCaret = sUnformatted.indexOf('^');
            sUnformatted = sUnformatted.replace(/\^/g, '');
            selEnd = sUnformatted.indexOf('#');
            sUnformatted = sUnformatted.replace(/#/g, '');
        } else {
            selEnd = sUnformatted.indexOf('#');
            sUnformatted = sUnformatted.replace(/#/g, '');
            selCaret = sUnformatted.indexOf('^');
            sUnformatted = sUnformatted.replace(/\^/g, '');
        }

        /* step 3) create formatted text */
        let t = FormattedText.newFromSerialized(s.replace(/#/g, '').replace(/\^/g, ''));
        return [t, selCaret, selEnd];
    }
}

/**
 * used in tests only, not visible from product code
 */
let defFont = 'geneva_18_' + textFontStylingToString(TextFontStyling.Default);
