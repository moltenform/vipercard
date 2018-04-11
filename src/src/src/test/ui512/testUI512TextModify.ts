
/* auto */ import { TextFontStyling, specialCharFontChange, textFontStylingToString } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { SelAndEntryImpl } from '../../ui512/textedit/ui512TextModifyClasses.js';
/* auto */ import { TestUI512TextSelectEvents } from '../../test/ui512/testUI512TextSelectEvents.js';

export class TestUI512SelAndEntry extends TestUI512TextSelectEvents {
    constructor() {
        super();
    }

    tests = [
        'testchangeTextDuplicate',
        () => {
            this.testChangeText('^#', '^#', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('^#a|a', '^#a', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('a^#|a', 'a^#', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('abcd^#|abcd', 'abcd^#', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('a^#bcd|abcd', 'a^#bcd', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('^#abcd|abcd', '^#abcd', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('a^#bcd|abcd', 'a^bc#d', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('12|abcd^#|abcd', '12|abcd^#', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('12|a^#bcd|abcd', '12|a^#bcd', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('12|^#abcd|abcd', '12|^#abcd', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('12|a^#bcd|abcd', '12|a^bc#d', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('12|abcd^#|abcd|34', '12|abcd^#|34', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('12|a^#bcd|abcd|34', '12|a^#bcd|34', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('12|^#abcd|abcd|34', '12|^#abcd|34', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('12|a^#bcd|abcd|34', '12|a^bc#d|34', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('abcd^#|abcd|34', 'abcd^#|34', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('a^#bcd|abcd|34', 'a^#bcd|34', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('^#abcd|abcd|34', '^#abcd|34', SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText('a^#bcd|abcd|34', 'a^bc#d|34', SelAndEntryImpl.changeTextDuplicate);
        },
        'testchangeTextIndentation',
        () => {
            let defFont = 'geneva_18_' + textFontStylingToString(TextFontStyling.Default);

            /* decrease indentation, one line */
            this.testChangeText('^#', '^#', SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^abc#', 'abc^#', SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^a\tbc#', 'a\tbc^#', SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^abc#', '\ta^b#c', SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^abc#', '\tabc^#', SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^\tabc#', '\t\tabc^#', SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^\t\tabc#', '\t\t\tabc^#', SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^abc\tdef#', '\tabc\tdef^#', SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^abc#', '    abc^#', SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^\tabc#', '        abc^#', SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^\tabc#', '    \tabc^#', SelAndEntryImpl.changeTextIndentation, true, defFont);

            /* decrease indentation, many lines */
            this.testChangeText(
                '^\tabc|ABC|def#|\tDEF',
                '^\t\tabc|\tABC|def#|\tDEF',
                SelAndEntryImpl.changeTextIndentation,
                true,
                defFont
            );
            this.testChangeText(
                '^\tabc|ABC|def#|\tDEF',
                '\t\tab^c|\tABC|d#ef|\tDEF',
                SelAndEntryImpl.changeTextIndentation,
                true,
                defFont
            );
            this.testChangeText(
                '\t\tabc|^ABC|def#|\tDEF',
                '\t\tabc|^\tABC|def#|\tDEF',
                SelAndEntryImpl.changeTextIndentation,
                true,
                defFont
            );
            this.testChangeText(
                '\t\tabc|^ABC|def#|\tDEF',
                '\t\tabc|\tABC^|#def|\tDEF',
                SelAndEntryImpl.changeTextIndentation,
                true,
                defFont
            );

            /* increase indentation, one line */
            this.testChangeText('^#', '^#', SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\tabc#', 'abc^#', SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\ta\tbc#', 'a\tbc^#', SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\tabc#', '\ta^b#c', SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\tabc#', '\tabc^#', SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\t\tabc#', '\t\tabc^#', SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\t\t\tabc#', '\t\t\tabc^#', SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText(
                '^\t\tabc\tdef#',
                '\tabc\tdef^#',
                SelAndEntryImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText('^\t\tabc#', '    abc^#', SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\t\tabc#', '        abc^#', SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\t\tabc#', '    \tabc^#', SelAndEntryImpl.changeTextIndentation, false, defFont);

            /* increase indentation, many lines */
            this.testChangeText(
                '^\t\t\tabc|\t\tABC|\tdef#|\tDEF',
                '^\t\tabc|\tABC|def#|\tDEF',
                SelAndEntryImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText(
                '^\t\t\tabc|\t\tABC|\tdef#|\tDEF',
                '\t\tab^c|\tABC|d#ef|\tDEF',
                SelAndEntryImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText(
                '\t\tabc|^\t\tABC|\tdef#|\tDEF',
                '\t\tabc|^\tABC|def#|\tDEF',
                SelAndEntryImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText(
                '\t\tabc|^\t\tABC|\tdef#|\tDEF',
                '\t\tabc|\tABC^|#def|\tDEF',
                SelAndEntryImpl.changeTextIndentation,
                false,
                defFont
            );
        },
        'testchangeTextToggleLinePrefix',
        () => {
            let defFont = 'geneva_18_' + textFontStylingToString(TextFontStyling.Default);
            let c = specialCharFontChange;
            /* add prefix, one line */
            this.testChangeText('^#', '^#', SelAndEntryImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PREabc#', 'abc^#', SelAndEntryImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PREabc#', '^#abc', SelAndEntryImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PREPRabc#', 'PRabc^#', SelAndEntryImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PREaPREbc#', '^#aPREbc', SelAndEntryImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText(
                '^\tPREaPREbc#',
                '^#\taPREbc',
                SelAndEntryImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            /* remove prefix, one line */
            this.testChangeText('^abc#', 'PREabc^#', SelAndEntryImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^abc#', '^#PREabc', SelAndEntryImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PRabc#', 'PREPRabc^#', SelAndEntryImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^aPREbc#', '^#PREaPREbc', SelAndEntryImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PREabc#', '^#PREPREabc', SelAndEntryImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText(
                '^\tPREabc#',
                '^#\tPREPREabc',
                SelAndEntryImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            /* add prefix, many lines */
            this.testChangeText(
                '^PREab|PREcd#|ef',
                '^ab|cd#|ef',
                SelAndEntryImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                '^PREab|PREcd#|ef',
                'ab^|#cd|ef',
                SelAndEntryImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                `ab|^PREcd|${c}${defFont}${c}PRE#`,
                'ab|cd#|^',
                SelAndEntryImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                `ab|cd|${c}${defFont}${c}^PRE#`,
                'ab|cd|^#',
                SelAndEntryImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            /* remove prefix, many lines */
            this.testChangeText(
                '^ab|cd#|PREef',
                '^PREab|PREcd#|PREef',
                SelAndEntryImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                '^ab|cd#|PREef',
                'PREab^|#PREcd|PREef',
                SelAndEntryImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                `PREab|^cd|${c}${defFont}${c}PRE#`,
                'PREab|PREcd#|^',
                SelAndEntryImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                `PREab|PREcd|^${c}${defFont}${c}PRE#`,
                'PREab|PREcd|^#',
                SelAndEntryImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
        },
        'testchangeTextDeleteLine',
        () => {
            this.testChangeText('^#', '^#', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('^#', 'abc^#', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('^#', 'a^b#c', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('^#cd|ef', 'ab^#|cd|ef', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('^#cd|ef', '^ab#|cd|ef', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('^#cd|ef', 'ab^|cd#|ef', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('ab|^#ef', 'ab|cd^#|ef', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('ab|^#ef', 'ab|^cd#|ef', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('ab|^#ef', 'ab|cd^|ef#', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('ab|cd|^#', 'ab|cd|ef^#', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('ab|cd|^#', 'ab|cd|^ef#', SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText('ab|cd|^#', 'ab|cd#|ef^', SelAndEntryImpl.changeTextDeleteLine);
        },
        'testchangeTextBackspace',
        () => {
            /* delete left */
            this.testChangeText('^#abc', '^#abc', SelAndEntryImpl.changeTextBackspace, true, false);
            this.testChangeText('^#bc', 'a^#bc', SelAndEntryImpl.changeTextBackspace, true, false);
            this.testChangeText('a^#c', 'ab^#c', SelAndEntryImpl.changeTextBackspace, true, false);
            this.testChangeText('ab^#', 'abc^#', SelAndEntryImpl.changeTextBackspace, true, false);
            /* delete right */
            this.testChangeText('^#bc', '^#abc', SelAndEntryImpl.changeTextBackspace, false, false);
            this.testChangeText('a^#c', 'a^#bc', SelAndEntryImpl.changeTextBackspace, false, false);
            this.testChangeText('ab^#', 'ab^#c', SelAndEntryImpl.changeTextBackspace, false, false);
            this.testChangeText('abc^#', 'abc^#', SelAndEntryImpl.changeTextBackspace, false, false);

            /* delete selection */
            for (let isLeft of [true, false]) {
                this.testChangeText('a^#d', 'a^bc#d', SelAndEntryImpl.changeTextBackspace, isLeft, false);
                this.testChangeText('a^#d', 'a#bc^d', SelAndEntryImpl.changeTextBackspace, isLeft, false);
                this.testChangeText('^#d', '^abc#d', SelAndEntryImpl.changeTextBackspace, isLeft, false);
                this.testChangeText('a^#', 'a^bcd#', SelAndEntryImpl.changeTextBackspace, isLeft, false);
                this.testChangeText('^#', '^abcd#', SelAndEntryImpl.changeTextBackspace, isLeft, false);
                this.testChangeText('^#', '^#', SelAndEntryImpl.changeTextBackspace, isLeft, false);
            }
        },
        'testchangeTextInsert',
        () => {
            let style = textFontStylingToString(TextFontStyling.Default);
            let defFont = 'geneva_18_' + style;
            let c = specialCharFontChange;

            /* basic usage */
            this.testChangeText('1^#abc', '^#abc', SelAndEntryImpl.changeTextInsert, '1', defFont);
            this.testChangeText('123^#abc', '^#abc', SelAndEntryImpl.changeTextInsert, '123', defFont);
            this.testChangeText('a123^#bc', 'a^#bc', SelAndEntryImpl.changeTextInsert, '123', defFont);
            this.testChangeText('ab123^#c', 'ab^#c', SelAndEntryImpl.changeTextInsert, '123', defFont);
            this.testChangeText('abc123^#', 'abc^#', SelAndEntryImpl.changeTextInsert, '123', defFont);
            /* replace selection */
            this.testChangeText('a123^#d', 'a^bc#d', SelAndEntryImpl.changeTextInsert, '123', defFont);
            this.testChangeText('a123^#d', 'a#bc^d', SelAndEntryImpl.changeTextInsert, '123', defFont);
            this.testChangeText('123^#d', '^abc#d', SelAndEntryImpl.changeTextInsert, '123', defFont);
            this.testChangeText('a123^#', 'a^bcd#', SelAndEntryImpl.changeTextInsert, '123', defFont);
            this.testChangeText('123^#', '^abcd#', SelAndEntryImpl.changeTextInsert, '123', defFont);
            /* if input is empty, use the default font */
            this.testChangeText(`${c}${defFont}${c}123^#`, '^#', SelAndEntryImpl.changeTextInsert, '123', defFont);
            /* input string changes fonts for each character */
            this.testChangeText(
                `${c}courier_1_${style}${c}ABC^#a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
                `^#${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
                SelAndEntryImpl.changeTextInsert,
                'ABC',
                defFont
            );
            this.testChangeText(
                `${c}courier_1_${style}${c}aABC^#${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}^#b${c}courier_3_${style}${c}c`,
                SelAndEntryImpl.changeTextInsert,
                'ABC',
                defFont
            );
            this.testChangeText(
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}bABC^#${c}courier_3_${style}${c}c`,
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}^#c`,
                SelAndEntryImpl.changeTextInsert,
                'ABC',
                defFont
            );
            this.testChangeText(
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}cABC^#`,
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c^#`,
                SelAndEntryImpl.changeTextInsert,
                'ABC',
                defFont
            );
        },
    ];
}

