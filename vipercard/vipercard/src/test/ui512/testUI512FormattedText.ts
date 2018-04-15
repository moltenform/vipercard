
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { BrowserOSInfo, assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { TextFontSpec, TextFontStyling, largeArea, specialCharFontChange } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { UI512FontCache } from '../../ui512/draw/ui512DrawTextRequestData.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { RenderTextArgs } from '../../ui512/draw/ui512DrawTextParams.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';

export class TestFormattedText extends UI512TestBase {
    tests = [
        'test_FormattedTextBasic',
        () => {
            let txt = FormattedText.newFromUnformatted('abc');
            assertEq('abc'.charCodeAt(0), txt.charAt(0), '');
            assertEq('abc'.charCodeAt(1), txt.charAt(1), '');
            assertEq('abc'.charCodeAt(2), txt.charAt(2), '');
            assertEq(undefined, txt.charAt(3), '');
            assertEq(UI512FontCache.defaultFont, txt.fontAt(0), '');
            assertEq(UI512FontCache.defaultFont, txt.fontAt(1), '');
            assertEq(UI512FontCache.defaultFont, txt.fontAt(2), '');
            assertEq(undefined, txt.fontAt(3), '');

            txt.setCharAt(1, 'y'.charCodeAt(0));
            txt.setCharAt(2, 'z'.charCodeAt(0));
            assertEq('ayz'.charCodeAt(0), txt.charAt(0), '');
            assertEq('ayz'.charCodeAt(1), txt.charAt(1), '');
            assertEq('ayz'.charCodeAt(2), txt.charAt(2), '');

            txt.setFontAt(1, 'otherfont1');
            txt.setFontAt(2, 'otherfont2');
            assertEq(UI512FontCache.defaultFont, txt.fontAt(0), '');
            assertEq('otherfont1', txt.fontAt(1), '');
            assertEq('otherfont2', txt.fontAt(2), '');

            assertEq(3, txt.len(), '');
            assertEq(0, FormattedText.newFromUnformatted('').len(), '');
        },
        'test_FormattedTextHelpers',
        () => {
            /* test indexOf */
            let txt = FormattedText.newFromUnformatted('abc');
            assertEq(1, txt.indexOf('b'.charCodeAt(0)), '');
            assertEq(2, txt.indexOf('c'.charCodeAt(0)), '');
            assertEq(-1, txt.indexOf('?'.charCodeAt(0)), '');

            /* toUnformatted should strip formatting */
            txt.setFontEverywhere('changedfont');
            assertEq('changedfont', txt.fontAt(0), '');
            assertEq('changedfont', txt.fontAt(1), '');
            assertEq('changedfont', txt.fontAt(2), '');
            assertEq('abc', txt.toUnformatted(), '');
            assertEq('a', txt.toUnformattedSubstr(0, 1), '');
            assertEq('ab', txt.toUnformattedSubstr(0, 2), '');
            assertEq('b', txt.toUnformattedSubstr(1, 1), '');
            assertEq('bc', txt.toUnformattedSubstr(1, 2), '');

            /* newFromUnformatted with empty string is ok */
            txt = FormattedText.newFromUnformatted('');
            assertEq('', txt.toUnformatted(), '');
            assertEq(0, txt.len(), '');
            assertEq(undefined, txt.charAt(0), '');
            assertEq(undefined, txt.fontAt(0), '');

            /* fromUnformatted should strip specialCharFontChange */
            txt = FormattedText.newFromUnformatted(`${specialCharFontChange}a${specialCharFontChange}`);
            assertEq('a', txt.toUnformatted(), '');
            assertEq(1, txt.len(), '');
            assertEq('a'.charCodeAt(0), txt.charAt(0), '');
            assertEq(UI512FontCache.defaultFont, txt.fontAt(0), '');
        },
        'test_FormattedTextSerialization',
        () => {
            /* normal string */
            let ser = `${specialCharFontChange}font1${specialCharFontChange}a${specialCharFontChange}font2${specialCharFontChange}bc${specialCharFontChange}font3${specialCharFontChange}d`;
            let txt = FormattedText.newFromSerialized(ser);
            assertEq(4, txt.len(), '');
            assertEq('font1', txt.fontAt(0), '');
            assertEq('font2', txt.fontAt(1), '');
            assertEq('font2', txt.fontAt(2), '');
            assertEq('font3', txt.fontAt(3), '');
            assertEq('abcd'.charCodeAt(0), txt.charAt(0), '');
            assertEq('abcd'.charCodeAt(1), txt.charAt(1), '');
            assertEq('abcd'.charCodeAt(2), txt.charAt(2), '');
            assertEq('abcd'.charCodeAt(3), txt.charAt(3), '');

            /* test serialization */
            assertEq(ser, txt.toSerialized(), '');

            /* starts with default font if none given, */
            /* neighboring font changes should coalesce, */
            /* and ok if ends with fontchange */
            ser = `a${specialCharFontChange}font1${specialCharFontChange}${specialCharFontChange}font2${specialCharFontChange}bcd${specialCharFontChange}font3${specialCharFontChange}`;
            txt = FormattedText.newFromSerialized(ser);
            assertEq(4, txt.len(), '');
            assertEq(UI512FontCache.defaultFont, txt.fontAt(0), '');
            assertEq('font2', txt.fontAt(1), '');
            assertEq('font2', txt.fontAt(2), '');
            assertEq('font2', txt.fontAt(3), '');
            assertEq('abcd'.charCodeAt(0), txt.charAt(0), '');
            assertEq('abcd'.charCodeAt(1), txt.charAt(1), '');
            assertEq('abcd'.charCodeAt(2), txt.charAt(2), '');
            assertEq('abcd'.charCodeAt(3), txt.charAt(3), '');

            let expected = `${specialCharFontChange}${
                UI512FontCache.defaultFont
            }${specialCharFontChange}a${specialCharFontChange}font2${specialCharFontChange}bcd`;
            assertEq(expected, txt.toSerialized(), '');
        },
        'test_appendAndModify',
        () => {
            /* push */
            let txt = FormattedText.newFromUnformatted('abc');
            txt.push('d'.charCodeAt(0), 'font2');
            assertEq(4, txt.len(), '');
            assertEq('abcd'.charCodeAt(2), txt.charAt(2), '');
            assertEq('abcd'.charCodeAt(3), txt.charAt(3), '');
            assertEq(UI512FontCache.defaultFont, txt.fontAt(2), '');
            assertEq('font2', txt.fontAt(3), '');

            /* append */
            let txt1 = FormattedText.newFromUnformatted('ab');
            txt1.setFontEverywhere('font1');
            let txt2 = FormattedText.newFromUnformatted('cd');
            txt2.setFontEverywhere('font2');
            txt1.append(txt2);
            assertEq(4, txt1.len(), '');
            assertEq('abcd'.charCodeAt(0), txt1.charAt(0), '');
            assertEq('abcd'.charCodeAt(1), txt1.charAt(1), '');
            assertEq('abcd'.charCodeAt(2), txt1.charAt(2), '');
            assertEq('abcd'.charCodeAt(3), txt1.charAt(3), '');
            assertEq('font1', txt1.fontAt(0), '');
            assertEq('font1', txt1.fontAt(1), '');
            assertEq('font2', txt1.fontAt(2), '');
            assertEq('font2', txt1.fontAt(3), '');

            /* append empty string */
            txt1 = FormattedText.newFromUnformatted('ab');
            txt2 = FormattedText.newFromUnformatted('');
            txt1.append(txt2);
            assertEq(2, txt1.len(), '');
            assertEq('ab'.charCodeAt(0), txt1.charAt(0), '');
            assertEq('ab'.charCodeAt(1), txt1.charAt(1), '');

            /* append substring */
            txt1 = FormattedText.newFromUnformatted('ab');
            txt2 = FormattedText.newFromUnformatted('cdefg');
            txt1.appendSubstring(txt2, 1, 3);
            assertEq('abde', txt1.toUnformatted(), '');

            /* use splice to delete */
            let ser = `a${specialCharFontChange}font2${specialCharFontChange}bc${specialCharFontChange}font3${specialCharFontChange}d`;
            txt = FormattedText.newFromSerialized(ser);
            assertEq(4, txt.len(), '');
            txt.splice(1, 2);
            assertEq(2, txt.len(), '');
            assertEq('ad'.charCodeAt(0), txt.charAt(0), '');
            assertEq('ad'.charCodeAt(1), txt.charAt(1), '');
            assertEq(UI512FontCache.defaultFont, txt.fontAt(0), '');
            assertEq('font3', txt.fontAt(1), '');

            /* splice to delete no characters */
            txt = FormattedText.newFromUnformatted('abc');
            assertEq(3, txt.len(), '');
            txt.splice(1, 0);
            assertEq(3, txt.len(), '');
        },
        'test_byInsertion',
        () => {
            /* by insertion, 2->0 characters */
            let txt1 = FormattedText.newFromUnformatted('abcde');
            txt1.setFontEverywhere('f1');
            let txt2 = FormattedText.byInsertion(txt1, 2, 2, '', 'f2');
            let expected = `${specialCharFontChange}f1${specialCharFontChange}abe`;
            assertEq(3, txt2.len(), '');
            assertEq(expected, txt2.toSerialized(), '');

            /* by insertion, 2->1 characters */
            txt2 = FormattedText.byInsertion(txt1, 2, 2, 'x', 'f2');
            expected = `${specialCharFontChange}f1${specialCharFontChange}ab${specialCharFontChange}f2${specialCharFontChange}x${specialCharFontChange}f1${specialCharFontChange}e`;
            assertEq(4, txt2.len(), '');
            assertEq(expected, txt2.toSerialized(), '');

            /* by insertion, 2->2 characters */
            txt2 = FormattedText.byInsertion(txt1, 2, 2, 'xy', 'f2');
            expected = `${specialCharFontChange}f1${specialCharFontChange}ab${specialCharFontChange}f2${specialCharFontChange}xy${specialCharFontChange}f1${specialCharFontChange}e`;
            assertEq(5, txt2.len(), '');
            assertEq(expected, txt2.toSerialized(), '');

            /* by insertion, 2->3 characters */
            txt2 = FormattedText.byInsertion(txt1, 2, 2, 'xyz', 'f2');
            expected = `${specialCharFontChange}f1${specialCharFontChange}ab${specialCharFontChange}f2${specialCharFontChange}xyz${specialCharFontChange}f1${specialCharFontChange}e`;
            assertEq(6, txt2.len(), '');
            assertEq(expected, txt2.toSerialized(), '');
        },
        'test_newlineProcessing',
        () => {
            let cleanCharsTests: [string, string][] = [
                /* empty string */
                ['', ''],
                /* normal string */
                ['abc def', 'abc def'],
                /* should remove null bytes */
                ['abc def', '\x00abc\x00 def\x00'],
                /* should remove null bytes even if entire string is null bytes */
                ['', '\x00\x00'],
                /* should remove special formatting bytes */
                ['abc def', `${specialCharFontChange}abc${specialCharFontChange} def${specialCharFontChange}`],
                /* should remove special formatting bytes even if entire string */
                ['', `${specialCharFontChange}${specialCharFontChange}`],
                /* should keep unix newlines */
                ['\nabc\n123\n', '\nabc\n123\n'],
                /* should convert win newlines */
                ['\nabc\n123\n', '\r\nabc\r\n123\r\n'],
                /* should convert classic-mac newlines */
                ['\nabc\n123\n', '\rabc\r123\r'],
                /* every newline combination */
                [
                    '\n\n\n1\n\n\n2\n\n3\n\n\n4\n\n5\n\n6\n\n7\n\n\n8',
                    '\n\n\n1\n\n\r2\n\r\n3\n\r\r4\r\n\n5\r\n\r6\r\r\n7\r\r\r8'
                ]
            ];

            for (let [expected, input] of cleanCharsTests) {
                let newtxt = FormattedText.newFromUnformatted(input);
                let got = newtxt.toUnformatted();
                assertEq(expected, got, '1k|');
            }

            for (let [expected, input] of cleanCharsTests) {
                let got = FormattedText.fromExternalCharset(input, BrowserOSInfo.Unknown);
                assertEq(expected, got, '1j|');
            }
        },
        'test_fromHostCharset',
        () => {
            let fromHost = (s: string) => FormattedText.fromExternalCharset(s, BrowserOSInfo.Unknown);

            /* control chars are not accepted */
            assertEq('ab?cd?', fromHost('ab\x03cd\x03'), '1i|');
            /* more control chars are not accepted */
            assertEq('ab?cd????', fromHost('ab\x01cd\x06\x0f\x15\x1a'), '1h|');
            /* tabs are accepted */
            assertEq('ab\tcd?', fromHost('ab\tcd\x03'), '1g|');
            /* accented letters are translated */
            assertEq(
                'ab' + String.fromCharCode(135, 32, 136, 32, 146, 32, 147, 32, 148, 32, 153, 32, 155),
                fromHost('ab\u00e1 \u00e0 \u00ed \u00ec \u00ee \u00f4 \u00f5'),
                '1f|'
            );
            /* greek letters are translated */
            assertEq(
                'ab' + String.fromCharCode(185, 32, 184, 32, 183, 32, 181, 32, 190, 32, 174, 32, 207),
                fromHost('ab\u03C0 \u220F \u2211 \u00B5 \u00E6 \u00C6 \u0153'),
                '1e|'
            );
            /* symbols are translated */
            assertEq('ab' + String.fromCharCode(166, 32, 165, 32, 161), fromHost('ab\u00B6 \u2022 \u00B0'), '1d|');
            /* unknown lower letters are not accepted (1/4, superscript 1, capital thorn) */
            assertEq('ab???cd', fromHost('ab\u00BC\u00B9\u00DEcd'), '1c|');
            /* unknown higher letters are not accepted */
            assertEq('12???34', fromHost('12\u05E7\u3042\uB9D034'), '1b|');
            /* different fallback */
            assertEq('ab!cd!', FormattedText.fromExternalCharset('ab\x03cd\x03', BrowserOSInfo.Unknown, '!'), '1a|');
            /* into charset, control chars are not accepted */
            assertEq('ab?cd?', FormattedText.toExternalCharset('ab\x05cd\x05', BrowserOSInfo.Unknown), '1Z|');
            /* into charset, different fallback */
            assertEq('ab!cd!', FormattedText.toExternalCharset('ab\x05cd\x05', BrowserOSInfo.Unknown, '!'), '1Y|');
            /* into charset, tabs are accepted */
            assertEq('AB\nCD\tEF', FormattedText.toExternalCharset('AB\nCD\tEF', BrowserOSInfo.Unknown), '1X|');
            /* into charset, greek letters are translated */
            assertEq(
                'ab\u03C0 \u220F \u2211 \u00B5 \u00E6 \u00C6 \u0153',
                FormattedText.toExternalCharset(
                    'ab' + String.fromCharCode(185, 32, 184, 32, 183, 32, 181, 32, 190, 32, 174, 32, 207),
                    BrowserOSInfo.Unknown
                ),
                '1W|'
            );
            /* into charset, unknown letters are not accepted */
            assertEq(
                '12???34',
                FormattedText.toExternalCharset('12\u001f\u0100\u221134', BrowserOSInfo.Unknown),
                '1V|'
            );
        },
        'test_asteriskOnly',
        () => {
            let args = new RenderTextArgs(0, 0, largeArea, largeArea);
            args.asteriskOnly = true;

            /* zero-length string */
            let textin = FormattedText.newFromUnformatted('');
            let modded = UI512DrawText.makeAsteriskOnlyIfApplicable(textin, args);
            assertEq(0, modded.len(), '');
            assertTrue(modded.isLocked(), '');

            /* no formatting */
            textin = FormattedText.newFromUnformatted('abcd');
            modded = UI512DrawText.makeAsteriskOnlyIfApplicable(textin, args);
            assertEq('abcd', textin.toUnformatted(), '');
            assertEq('\xA5\xA5\xA5\xA5', modded.toUnformatted(), '');
            assertEq(4, modded.len(), '');

            /* formatting is preserved */
            let font1 = new TextFontSpec('geneva', TextFontStyling.Default, 12).toSpecString();
            let font2 = new TextFontSpec('times', TextFontStyling.Bold, 14).toSpecString();
            let s = UI512DrawText.setFont('abc', font1) + UI512DrawText.setFont('def', font2);
            let expected = UI512DrawText.setFont('\xA5\xA5\xA5', font1) + UI512DrawText.setFont('\xA5\xA5\xA5', font2);
            textin = FormattedText.newFromSerialized(s);
            modded = UI512DrawText.makeAsteriskOnlyIfApplicable(textin, args);
            assertEq('abcdef', textin.toUnformatted(), '');
            assertEq('\xA5\xA5\xA5\xA5\xA5\xA5', modded.toUnformatted(), '');
            assertEq(6, modded.len(), '');
            assertEq(expected, modded.toSerialized(), '');
        }
    ];
}
