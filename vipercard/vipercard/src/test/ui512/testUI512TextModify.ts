
/* auto */ import { TextFontStyling, specialCharFontChange, textFontStylingToString } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { TextSelModifyImpl } from '../../ui512/textedit/ui512TextSelModifyImpl.js';
/* auto */ import { TestUI512TextSelectEvents } from '../../test/ui512/testUI512TextSelectEvents.js';

export class TestUI512SelAndEntry extends TestUI512TextSelectEvents {
    constructor() {
        super();
    }

    tests = [
        'testchangeTextDuplicate',
        () => {
            this.testChangeText('^#', '^#', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('^#a|a', '^#a', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('a^#|a', 'a^#', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('abcd^#|abcd', 'abcd^#', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('a^#bcd|abcd', 'a^#bcd', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('^#abcd|abcd', '^#abcd', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('a^#bcd|abcd', 'a^bc#d', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('12|abcd^#|abcd', '12|abcd^#', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('12|a^#bcd|abcd', '12|a^#bcd', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('12|^#abcd|abcd', '12|^#abcd', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('12|a^#bcd|abcd', '12|a^bc#d', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('12|abcd^#|abcd|34', '12|abcd^#|34', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('12|a^#bcd|abcd|34', '12|a^#bcd|34', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('12|^#abcd|abcd|34', '12|^#abcd|34', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('12|a^#bcd|abcd|34', '12|a^bc#d|34', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('abcd^#|abcd|34', 'abcd^#|34', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('a^#bcd|abcd|34', 'a^#bcd|34', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('^#abcd|abcd|34', '^#abcd|34', TextSelModifyImpl.changeTextDuplicate);
            this.testChangeText('a^#bcd|abcd|34', 'a^bc#d|34', TextSelModifyImpl.changeTextDuplicate);
        },
        'testchangeTextIndentation',
        () => {
            let defFont = 'geneva_18_' + textFontStylingToString(TextFontStyling.Default);

            /* decrease indentation, one line */
            this.testChangeText('^#', '^#', TextSelModifyImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^abc#', 'abc^#', TextSelModifyImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^a\tbc#', 'a\tbc^#', TextSelModifyImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^abc#', '\ta^b#c', TextSelModifyImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^abc#', '\tabc^#', TextSelModifyImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^\tabc#', '\t\tabc^#', TextSelModifyImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^\t\tabc#', '\t\t\tabc^#', TextSelModifyImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^abc\tdef#', '\tabc\tdef^#', TextSelModifyImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^abc#', '    abc^#', TextSelModifyImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^\tabc#', '        abc^#', TextSelModifyImpl.changeTextIndentation, true, defFont);
            this.testChangeText('^\tabc#', '    \tabc^#', TextSelModifyImpl.changeTextIndentation, true, defFont);

            /* decrease indentation, many lines */
            this.testChangeText(
                '^\tabc|ABC|def#|\tDEF',
                '^\t\tabc|\tABC|def#|\tDEF',
                TextSelModifyImpl.changeTextIndentation,
                true,
                defFont
            );
            this.testChangeText(
                '^\tabc|ABC|def#|\tDEF',
                '\t\tab^c|\tABC|d#ef|\tDEF',
                TextSelModifyImpl.changeTextIndentation,
                true,
                defFont
            );
            this.testChangeText(
                '\t\tabc|^ABC|def#|\tDEF',
                '\t\tabc|^\tABC|def#|\tDEF',
                TextSelModifyImpl.changeTextIndentation,
                true,
                defFont
            );
            this.testChangeText(
                '\t\tabc|^ABC|def#|\tDEF',
                '\t\tabc|\tABC^|#def|\tDEF',
                TextSelModifyImpl.changeTextIndentation,
                true,
                defFont
            );

            /* increase indentation, one line */
            this.testChangeText('^#', '^#', TextSelModifyImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\tabc#', 'abc^#', TextSelModifyImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\ta\tbc#', 'a\tbc^#', TextSelModifyImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\tabc#', '\ta^b#c', TextSelModifyImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\tabc#', '\tabc^#', TextSelModifyImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\t\tabc#', '\t\tabc^#', TextSelModifyImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\t\t\tabc#', '\t\t\tabc^#', TextSelModifyImpl.changeTextIndentation, false, defFont);
            this.testChangeText(
                '^\t\tabc\tdef#',
                '\tabc\tdef^#',
                TextSelModifyImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText('^\t\tabc#', '    abc^#', TextSelModifyImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\t\tabc#', '        abc^#', TextSelModifyImpl.changeTextIndentation, false, defFont);
            this.testChangeText('^\t\t\tabc#', '    \tabc^#', TextSelModifyImpl.changeTextIndentation, false, defFont);

            /* increase indentation, many lines */
            this.testChangeText(
                '^\t\t\tabc|\t\tABC|\tdef#|\tDEF',
                '^\t\tabc|\tABC|def#|\tDEF',
                TextSelModifyImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText(
                '^\t\t\tabc|\t\tABC|\tdef#|\tDEF',
                '\t\tab^c|\tABC|d#ef|\tDEF',
                TextSelModifyImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText(
                '\t\tabc|^\t\tABC|\tdef#|\tDEF',
                '\t\tabc|^\tABC|def#|\tDEF',
                TextSelModifyImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText(
                '\t\tabc|^\t\tABC|\tdef#|\tDEF',
                '\t\tabc|\tABC^|#def|\tDEF',
                TextSelModifyImpl.changeTextIndentation,
                false,
                defFont
            );
        },
        'testchangeTextToggleLinePrefix',
        () => {
            let defFont = 'geneva_18_' + textFontStylingToString(TextFontStyling.Default);
            let c = specialCharFontChange;
            /* add prefix, one line */
            this.testChangeText('^#', '^#', TextSelModifyImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PREabc#', 'abc^#', TextSelModifyImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PREabc#', '^#abc', TextSelModifyImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PREPRabc#', 'PRabc^#', TextSelModifyImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PREaPREbc#', '^#aPREbc', TextSelModifyImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText(
                '^\tPREaPREbc#',
                '^#\taPREbc',
                TextSelModifyImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            /* remove prefix, one line */
            this.testChangeText('^abc#', 'PREabc^#', TextSelModifyImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^abc#', '^#PREabc', TextSelModifyImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PRabc#', 'PREPRabc^#', TextSelModifyImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^aPREbc#', '^#PREaPREbc', TextSelModifyImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText('^PREabc#', '^#PREPREabc', TextSelModifyImpl.changeTextToggleLinePrefix, 'PRE', defFont);
            this.testChangeText(
                '^\tPREabc#',
                '^#\tPREPREabc',
                TextSelModifyImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            /* add prefix, many lines */
            this.testChangeText(
                '^PREab|PREcd#|ef',
                '^ab|cd#|ef',
                TextSelModifyImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                '^PREab|PREcd#|ef',
                'ab^|#cd|ef',
                TextSelModifyImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                `ab|^PREcd|${c}${defFont}${c}PRE#`,
                'ab|cd#|^',
                TextSelModifyImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                `ab|cd|${c}${defFont}${c}^PRE#`,
                'ab|cd|^#',
                TextSelModifyImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            /* remove prefix, many lines */
            this.testChangeText(
                '^ab|cd#|PREef',
                '^PREab|PREcd#|PREef',
                TextSelModifyImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                '^ab|cd#|PREef',
                'PREab^|#PREcd|PREef',
                TextSelModifyImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                `PREab|^cd|${c}${defFont}${c}PRE#`,
                'PREab|PREcd#|^',
                TextSelModifyImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
            this.testChangeText(
                `PREab|PREcd|^${c}${defFont}${c}PRE#`,
                'PREab|PREcd|^#',
                TextSelModifyImpl.changeTextToggleLinePrefix,
                'PRE',
                defFont
            );
        },
        'testchangeTextDeleteLine',
        () => {
            this.testChangeText('^#', '^#', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('^#', 'abc^#', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('^#', 'a^b#c', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('^#cd|ef', 'ab^#|cd|ef', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('^#cd|ef', '^ab#|cd|ef', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('^#cd|ef', 'ab^|cd#|ef', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('ab|^#ef', 'ab|cd^#|ef', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('ab|^#ef', 'ab|^cd#|ef', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('ab|^#ef', 'ab|cd^|ef#', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('ab|cd|^#', 'ab|cd|ef^#', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('ab|cd|^#', 'ab|cd|^ef#', TextSelModifyImpl.changeTextDeleteLine);
            this.testChangeText('ab|cd|^#', 'ab|cd#|ef^', TextSelModifyImpl.changeTextDeleteLine);
        },
        'testchangeTextBackspace',
        () => {
            /* delete left */
            this.testChangeText('^#abc', '^#abc', TextSelModifyImpl.changeTextBackspace, true, false);
            this.testChangeText('^#bc', 'a^#bc', TextSelModifyImpl.changeTextBackspace, true, false);
            this.testChangeText('a^#c', 'ab^#c', TextSelModifyImpl.changeTextBackspace, true, false);
            this.testChangeText('ab^#', 'abc^#', TextSelModifyImpl.changeTextBackspace, true, false);
            /* delete right */
            this.testChangeText('^#bc', '^#abc', TextSelModifyImpl.changeTextBackspace, false, false);
            this.testChangeText('a^#c', 'a^#bc', TextSelModifyImpl.changeTextBackspace, false, false);
            this.testChangeText('ab^#', 'ab^#c', TextSelModifyImpl.changeTextBackspace, false, false);
            this.testChangeText('abc^#', 'abc^#', TextSelModifyImpl.changeTextBackspace, false, false);

            /* delete selection */
            for (let isLeft of [true, false]) {
                this.testChangeText('a^#d', 'a^bc#d', TextSelModifyImpl.changeTextBackspace, isLeft, false);
                this.testChangeText('a^#d', 'a#bc^d', TextSelModifyImpl.changeTextBackspace, isLeft, false);
                this.testChangeText('^#d', '^abc#d', TextSelModifyImpl.changeTextBackspace, isLeft, false);
                this.testChangeText('a^#', 'a^bcd#', TextSelModifyImpl.changeTextBackspace, isLeft, false);
                this.testChangeText('^#', '^abcd#', TextSelModifyImpl.changeTextBackspace, isLeft, false);
                this.testChangeText('^#', '^#', TextSelModifyImpl.changeTextBackspace, isLeft, false);
            }
        },
        'testchangeTextInsert',
        () => {
            let style = textFontStylingToString(TextFontStyling.Default);
            let defFont = 'geneva_18_' + style;
            let c = specialCharFontChange;

            /* basic usage */
            this.testChangeText('1^#abc', '^#abc', TextSelModifyImpl.changeTextInsert, '1', defFont);
            this.testChangeText('123^#abc', '^#abc', TextSelModifyImpl.changeTextInsert, '123', defFont);
            this.testChangeText('a123^#bc', 'a^#bc', TextSelModifyImpl.changeTextInsert, '123', defFont);
            this.testChangeText('ab123^#c', 'ab^#c', TextSelModifyImpl.changeTextInsert, '123', defFont);
            this.testChangeText('abc123^#', 'abc^#', TextSelModifyImpl.changeTextInsert, '123', defFont);
            /* replace selection */
            this.testChangeText('a123^#d', 'a^bc#d', TextSelModifyImpl.changeTextInsert, '123', defFont);
            this.testChangeText('a123^#d', 'a#bc^d', TextSelModifyImpl.changeTextInsert, '123', defFont);
            this.testChangeText('123^#d', '^abc#d', TextSelModifyImpl.changeTextInsert, '123', defFont);
            this.testChangeText('a123^#', 'a^bcd#', TextSelModifyImpl.changeTextInsert, '123', defFont);
            this.testChangeText('123^#', '^abcd#', TextSelModifyImpl.changeTextInsert, '123', defFont);
            /* if input is empty, use the default font */
            this.testChangeText(`${c}${defFont}${c}123^#`, '^#', TextSelModifyImpl.changeTextInsert, '123', defFont);
            /* input string changes fonts for each character */
            this.testChangeText(
                `${c}courier_1_${style}${c}ABC^#a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
                `^#${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
                TextSelModifyImpl.changeTextInsert,
                'ABC',
                defFont
            );
            this.testChangeText(
                `${c}courier_1_${style}${c}aABC^#${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}^#b${c}courier_3_${style}${c}c`,
                TextSelModifyImpl.changeTextInsert,
                'ABC',
                defFont
            );
            this.testChangeText(
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}bABC^#${c}courier_3_${style}${c}c`,
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}^#c`,
                TextSelModifyImpl.changeTextInsert,
                'ABC',
                defFont
            );
            this.testChangeText(
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}cABC^#`,
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c^#`,
                TextSelModifyImpl.changeTextInsert,
                'ABC',
                defFont
            );
        }
    ];
}
