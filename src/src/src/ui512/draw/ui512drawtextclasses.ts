
/* auto */ import { O, assertTrue, makeUI512Error, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { base10 } from '../../ui512/utils/utilsUI512.js';

export const specialCharOnePixelSpace = '\x01';
export const specialCharFontChange = '\x02';
export const specialCharZeroPixelChar = '\x03';
export const specialCharCmdSymbol = '\xBD';
export const specialCharNumNewline = '\n'.charCodeAt(0);
export const specialCharNumZeroPixelChar = specialCharZeroPixelChar.charCodeAt(0);
export const largearea = 1024 * 1024 * 1024;
export const specialCharNonBreakingSpace = '\xCA'; // following the mac-os roman char set.
export const specialCharNumOnePixelSpace = specialCharOnePixelSpace.charCodeAt(0);
export const specialCharNumFontChange = specialCharFontChange.charCodeAt(0);
export const specialCharNumCmdSymbol = specialCharCmdSymbol.charCodeAt(0);
export const specialCharNumNonBreakingSpace = specialCharNonBreakingSpace.charCodeAt(0);
export const specialCharNumTab = '\t'.charCodeAt(0);
const space = ' '.charCodeAt(0);
const dash = '-'.charCodeAt(0);

export class DrawCharResult {
    constructor(public newlogicalx: number, public rightmostpixeldrawn: number, public lowestpixeldrawn: number) {}
    update(drawn: DrawCharResult) {
        this.lowestpixeldrawn = Math.max(this.lowestpixeldrawn, drawn.lowestpixeldrawn);
        this.rightmostpixeldrawn = Math.max(this.rightmostpixeldrawn, drawn.rightmostpixeldrawn);
        this.newlogicalx = drawn.newlogicalx;
    }
}

export class TextRendererFont {
    underline = false;
    condense = false;
    extend = false;
    constructor(public readonly grid: TextRendererGrid) {}
}

export class TextRendererGrid {
    metrics: any;
    image: HTMLImageElement;
    loadedMetrics = false;
    loadedImage = false;
    spec: TextFontSpec;
    adjustSpacing = 0;

    freezeWhenComplete() {
        if (this.loadedImage && this.loadedMetrics) {
            Object.freeze(this.metrics);
            Object.freeze(this.spec);
            Object.freeze(this);
        }
    }

    getLineHeight() {
        if (!this.metrics || !this.metrics.lineheight) {
            throw makeUI512Error(
                `3U|invalid metrics for font ${this.spec.typefacename} ${this.spec.size} ${this.spec.style}`
            );
        }

        return this.metrics.lineheight as number;
    }

    getCapHeight() {
        if (!this.metrics || !this.metrics['cap-height']) {
            throw makeUI512Error(
                `3T|invalid metrics for font ${this.spec.typefacename} ${this.spec.size} ${this.spec.style}`
            );
        }

        return this.metrics['cap-height'] as number;
    }
}

export enum TextFontStyling {
    Default = 0,
    Bold = 1 << 0,
    Italic = 1 << 1,
    Underline = 1 << 2,
    Outline = 1 << 3,
    Shadow = 1 << 4,
    Disabled = 1 << 5,
    Condensed = 1 << 6,
    Extend = 1 << 7,
}

export function textFontStylingToString(e: TextFontStyling): string {
    let ret = '';
    ret += e & TextFontStyling.Bold ? '+b' : 'b';
    ret += e & TextFontStyling.Italic ? '+i' : 'i';
    ret += e & TextFontStyling.Underline ? '+u' : 'u';
    ret += e & TextFontStyling.Outline ? '+o' : 'o';
    ret += e & TextFontStyling.Shadow ? '+s' : 's';
    ret += e & TextFontStyling.Disabled ? '+d' : 'd';
    ret += e & TextFontStyling.Condensed ? '+c' : 'c';
    ret += e & TextFontStyling.Extend ? '+e' : 'e';
    return ret;
}

export enum CharRectType {
    __isUI512Enum = 1,
    Char,
    SpaceToLeft,
    SpaceToRight,
}

export function stringToTextFontStyling(s: string): TextFontStyling {
    let ret = TextFontStyling.Default;
    for (let i = 0; i < s.length - 1; i++) {
        if (s.charAt(i) === '+') {
            switch (s.charAt(i + 1)) {
                case 'b':
                    ret |= TextFontStyling.Bold;
                    break;
                case 'i':
                    ret |= TextFontStyling.Italic;
                    break;
                case 'u':
                    ret |= TextFontStyling.Underline;
                    break;
                case 'o':
                    ret |= TextFontStyling.Outline;
                    break;
                case 's':
                    ret |= TextFontStyling.Shadow;
                    break;
                case 'd':
                    ret |= TextFontStyling.Disabled;
                    break;
                case 'c':
                    ret |= TextFontStyling.Condensed;
                    break;
                case 'e':
                    ret |= TextFontStyling.Extend;
                    break;
                default:
                    console.log(`warning: unrecognized text style ${s}`);
                    break;
            }
        }
    }
    return ret;
}

function typefacenameToTypefaceId(s: string): string {
    switch (s.toLowerCase().replace(/%20/g, ' ')) {
        case 'chicago':
            return '00';
        case 'courier':
            return '01';
        case 'geneva':
            return '02';
        case 'new york':
            return '03';
        case 'times':
            return '04';
        case 'helvetica':
            return '05';
        case 'monaco':
            return '06';
        case 'symbol':
            return '07';
        default:
            return '00';
    }
}

export function typefacenameToTypefaceIdFull(s: string): string {
    let face = TextFontSpec.getFacePart(s);
    return TextFontSpec.setFacePart(s, typefacenameToTypefaceId(face));
}

export class TextFontSpec {
    constructor(public typefacename: string, public style: TextFontStyling, public size: number) {}
    static fromString(s: string) {
        let parts = s.split('_');
        let typefacename = parts[0];
        let size = parseInt(parts[1], base10);
        let style = stringToTextFontStyling(parts[2]);
        return new TextFontSpec(typefacename, style, size);
    }

    toSpecString() {
        let ret = this.typefacename + '_';
        ret += this.size.toString() + '_';
        ret += textFontStylingToString(this.style);
        return ret;
    }

    static getFacePart(s: string) {
        return s.split('_')[0];
    }

    static setFacePart(s: string, snext: string) {
        let parts = s.split('_');
        assertTrue(!scontains(snext, '_'), '3X|parts of a font cannot contain the "_" character');
        return [snext, parts[1], parts[2]].join('_');
    }

    static getSizePart(s: string) {
        return s.split('_')[1];
    }

    static setSizePart(s: string, snext: string) {
        let parts = s.split('_');
        assertTrue(!scontains(snext, '_'), '3W|parts of a font cannot contain the "_" character');
        return [parts[0], snext, parts[2]].join('_');
    }

    static getStylePart(s: string) {
        return s.split('_')[2];
    }

    static setStylePart(s: string, snext: string) {
        let parts = s.split('_');
        assertTrue(!scontains(snext, '_'), '3V|parts of a font cannot contain the "_" character');
        return [parts[0], parts[1], snext].join('_');
    }
}

export class CharsetTranslation {
    static romanToUn: O<{ [key: number]: string }>;
    static unToRoman: O<{ [key: number]: string }>;
    protected static getRomanToUn() {
        if (CharsetTranslation.romanToUn === undefined) {
            CharsetTranslation.romanToUn = {
                9: '\u0009',
                10: '\u000A',
                32: '\u0020',
                33: '\u0021',
                34: '\u0022',
                35: '\u0023',
                36: '\u0024',
                37: '\u0025',
                38: '\u0026',
                39: '\u0027',
                40: '\u0028',
                41: '\u0029',
                42: '\u002A',
                43: '\u002B',
                44: '\u002C',
                45: '\u002D',
                46: '\u002E',
                47: '\u002F',
                48: '\u0030',
                49: '\u0031',
                50: '\u0032',
                51: '\u0033',
                52: '\u0034',
                53: '\u0035',
                54: '\u0036',
                55: '\u0037',
                56: '\u0038',
                57: '\u0039',
                58: '\u003A',
                59: '\u003B',
                60: '\u003C',
                61: '\u003D',
                62: '\u003E',
                63: '\u003F',
                64: '\u0040',
                65: '\u0041',
                66: '\u0042',
                67: '\u0043',
                68: '\u0044',
                69: '\u0045',
                70: '\u0046',
                71: '\u0047',
                72: '\u0048',
                73: '\u0049',
                74: '\u004A',
                75: '\u004B',
                76: '\u004C',
                77: '\u004D',
                78: '\u004E',
                79: '\u004F',
                80: '\u0050',
                81: '\u0051',
                82: '\u0052',
                83: '\u0053',
                84: '\u0054',
                85: '\u0055',
                86: '\u0056',
                87: '\u0057',
                88: '\u0058',
                89: '\u0059',
                90: '\u005A',
                91: '\u005B',
                92: '\u005C',
                93: '\u005D',
                94: '\u005E',
                95: '\u005F',
                96: '\u0060',
                97: '\u0061',
                98: '\u0062',
                99: '\u0063',
                100: '\u0064',
                101: '\u0065',
                102: '\u0066',
                103: '\u0067',
                104: '\u0068',
                105: '\u0069',
                106: '\u006A',
                107: '\u006B',
                108: '\u006C',
                109: '\u006D',
                110: '\u006E',
                111: '\u006F',
                112: '\u0070',
                113: '\u0071',
                114: '\u0072',
                115: '\u0073',
                116: '\u0074',
                117: '\u0075',
                118: '\u0076',
                119: '\u0077',
                120: '\u0078',
                121: '\u0079',
                122: '\u007A',
                123: '\u007B',
                124: '\u007C',
                125: '\u007D',
                126: '\u007E',
                127: '\u007F',
                128: '\u00C4',
                129: '\u00C5',
                130: '\u00C7',
                131: '\u00C9',
                132: '\u00D1',
                133: '\u00D6',
                134: '\u00DC',
                135: '\u00E1',
                136: '\u00E0',
                137: '\u00E2',
                138: '\u00E4',
                139: '\u00E3',
                140: '\u00E5',
                141: '\u00E7',
                142: '\u00E9',
                143: '\u00E8',
                144: '\u00EA',
                145: '\u00EB',
                146: '\u00ED',
                147: '\u00EC',
                148: '\u00EE',
                149: '\u00EF',
                150: '\u00F1',
                151: '\u00F3',
                152: '\u00F2',
                153: '\u00F4',
                154: '\u00F6',
                155: '\u00F5',
                156: '\u00FA',
                157: '\u00F9',
                158: '\u00FB',
                159: '\u00FC',
                160: '\u2020',
                161: '\u00B0',
                162: '\u00A2',
                163: '\u00A3',
                164: '\u00A7',
                165: '\u2022',
                166: '\u00B6',
                167: '\u00DF',
                168: '\u00AE',
                169: '\u00A9',
                170: '\u2122',
                171: '\u00B4',
                172: '\u00A8',
                173: '\u2260',
                174: '\u00C6',
                175: '\u00D8',
                176: '\u221E',
                177: '\u00B1',
                178: '\u2264',
                179: '\u2265',
                180: '\u00A5',
                181: '\u00B5',
                182: '\u2202',
                183: '\u2211',
                184: '\u220F',
                185: '\u03C0',
                186: '\u222B',
                187: '\u00AA',
                188: '\u00BA',
                189: '\u03A9',
                190: '\u00E6',
                191: '\u00F8',
                192: '\u00BF',
                193: '\u00A1',
                194: '\u00AC',
                195: '\u221A',
                196: '\u0192',
                197: '\u2248',
                198: '\u2206',
                199: '\u00AB',
                200: '\u00BB',
                201: '\u2026',
                202: '\u00A0',
                203: '\u00C0',
                204: '\u00C3',
                205: '\u00D5',
                206: '\u0152',
                207: '\u0153',
                208: '\u2013',
                209: '\u2014',
                210: '\u201C',
                211: '\u201D',
                212: '\u2018',
                213: '\u2019',
                214: '\u00F7',
                215: '\u25CA',
                216: '\u00FF',
                217: '\u0178',
                218: '\u2044',
                219: '\u20AC',
                220: '\u2039',
                221: '\u203A',
                222: '\uFB01',
                223: '\uFB02',
                224: '\u2021',
                225: '\u00B7',
                226: '\u201A',
                227: '\u201E',
                228: '\u2030',
                229: '\u00C2',
                230: '\u00CA',
                231: '\u00C1',
                232: '\u00CB',
                233: '\u00C8',
                234: '\u00CD',
                235: '\u00CE',
                236: '\u00CF',
                237: '\u00CC',
                238: '\u00D3',
                239: '\u00D4',
                240: '\uF8FF',
                241: '\u00D2',
                242: '\u00DA',
                243: '\u00DB',
                244: '\u00D9',
            };

            Object.freeze(CharsetTranslation.romanToUn);
        }

        return CharsetTranslation.romanToUn;
    }

    protected static getUnToRoman() {
        if (CharsetTranslation.unToRoman === undefined) {
            CharsetTranslation.unToRoman = {
                9: '\u0009',
                10: '\u000a',
                32: '\u0020',
                33: '\u0021',
                34: '\u0022',
                35: '\u0023',
                36: '\u0024',
                37: '\u0025',
                38: '\u0026',
                39: '\u0027',
                40: '\u0028',
                41: '\u0029',
                42: '\u002a',
                43: '\u002b',
                44: '\u002c',
                45: '\u002d',
                46: '\u002e',
                47: '\u002f',
                48: '\u0030',
                49: '\u0031',
                50: '\u0032',
                51: '\u0033',
                52: '\u0034',
                53: '\u0035',
                54: '\u0036',
                55: '\u0037',
                56: '\u0038',
                57: '\u0039',
                58: '\u003a',
                59: '\u003b',
                60: '\u003c',
                61: '\u003d',
                62: '\u003e',
                63: '\u003f',
                64: '\u0040',
                65: '\u0041',
                66: '\u0042',
                67: '\u0043',
                68: '\u0044',
                69: '\u0045',
                70: '\u0046',
                71: '\u0047',
                72: '\u0048',
                73: '\u0049',
                74: '\u004a',
                75: '\u004b',
                76: '\u004c',
                77: '\u004d',
                78: '\u004e',
                79: '\u004f',
                80: '\u0050',
                81: '\u0051',
                82: '\u0052',
                83: '\u0053',
                84: '\u0054',
                85: '\u0055',
                86: '\u0056',
                87: '\u0057',
                88: '\u0058',
                89: '\u0059',
                90: '\u005a',
                91: '\u005b',
                92: '\u005c',
                93: '\u005d',
                94: '\u005e',
                95: '\u005f',
                96: '\u0060',
                97: '\u0061',
                98: '\u0062',
                99: '\u0063',
                100: '\u0064',
                101: '\u0065',
                102: '\u0066',
                103: '\u0067',
                104: '\u0068',
                105: '\u0069',
                106: '\u006a',
                107: '\u006b',
                108: '\u006c',
                109: '\u006d',
                110: '\u006e',
                111: '\u006f',
                112: '\u0070',
                113: '\u0071',
                114: '\u0072',
                115: '\u0073',
                116: '\u0074',
                117: '\u0075',
                118: '\u0076',
                119: '\u0077',
                120: '\u0078',
                121: '\u0079',
                122: '\u007a',
                123: '\u007b',
                124: '\u007c',
                125: '\u007d',
                126: '\u007e',
                127: '\u007f',
                196: '\u0080',
                197: '\u0081',
                199: '\u0082',
                201: '\u0083',
                209: '\u0084',
                214: '\u0085',
                220: '\u0086',
                225: '\u0087',
                224: '\u0088',
                226: '\u0089',
                228: '\u008a',
                227: '\u008b',
                229: '\u008c',
                231: '\u008d',
                233: '\u008e',
                232: '\u008f',
                234: '\u0090',
                235: '\u0091',
                237: '\u0092',
                236: '\u0093',
                238: '\u0094',
                239: '\u0095',
                241: '\u0096',
                243: '\u0097',
                242: '\u0098',
                244: '\u0099',
                246: '\u009a',
                245: '\u009b',
                250: '\u009c',
                249: '\u009d',
                251: '\u009e',
                252: '\u009f',
                8224: '\u00a0',
                176: '\u00a1',
                162: '\u00a2',
                163: '\u00a3',
                167: '\u00a4',
                8226: '\u00a5',
                182: '\u00a6',
                223: '\u00a7',
                174: '\u00a8',
                169: '\u00a9',
                8482: '\u00aa',
                180: '\u00ab',
                168: '\u00ac',
                8800: '\u00ad',
                198: '\u00ae',
                216: '\u00af',
                8734: '\u00b0',
                177: '\u00b1',
                8804: '\u00b2',
                8805: '\u00b3',
                165: '\u00b4',
                181: '\u00b5',
                8706: '\u00b6',
                8721: '\u00b7',
                8719: '\u00b8',
                960: '\u00b9',
                8747: '\u00ba',
                170: '\u00bb',
                186: '\u00bc',
                937: '\u00bd',
                230: '\u00be',
                248: '\u00bf',
                191: '\u00c0',
                161: '\u00c1',
                172: '\u00c2',
                8730: '\u00c3',
                402: '\u00c4',
                8776: '\u00c5',
                8710: '\u00c6',
                171: '\u00c7',
                187: '\u00c8',
                8230: '\u00c9',
                160: '\u00ca',
                192: '\u00cb',
                195: '\u00cc',
                213: '\u00cd',
                338: '\u00ce',
                339: '\u00cf',
                8211: '\u00d0',
                8212: '\u00d1',
                8220: '\u00d2',
                8221: '\u00d3',
                8216: '\u00d4',
                8217: '\u00d5',
                247: '\u00d6',
                9674: '\u00d7',
                255: '\u00d8',
                376: '\u00d9',
                8260: '\u00da',
                8364: '\u00db',
                8249: '\u00dc',
                8250: '\u00dd',
                64257: '\u00de',
                64258: '\u00df',
                8225: '\u00e0',
                183: '\u00e1',
                8218: '\u00e2',
                8222: '\u00e3',
                8240: '\u00e4',
                194: '\u00e5',
                202: '\u00e6',
                193: '\u00e7',
                203: '\u00e8',
                200: '\u00e9',
                205: '\u00ea',
                206: '\u00eb',
                207: '\u00ec',
                204: '\u00ed',
                211: '\u00ee',
                212: '\u00ef',
                63743: '\u00f0',
                210: '\u00f1',
                218: '\u00f2',
                219: '\u00f3',
                217: '\u00f4',
            };

            Object.freeze(CharsetTranslation.unToRoman);
        }

        return CharsetTranslation.unToRoman;
    }

    static translateRomanToUn(s: string, fallback = '?') {
        return CharsetTranslation.translate(s, CharsetTranslation.getRomanToUn(), fallback);
    }
    static translateUnToRoman(s: string, fallback = '?') {
        return CharsetTranslation.translate(s, CharsetTranslation.getUnToRoman(), fallback);
    }

    protected static translate(s: string, map: { [key: number]: string }, fallback: string) {
        let ret = '';
        for (let i = 0; i < s.length; i++) {
            let found = map[s.charCodeAt(i)];
            ret += found ? found : fallback;
        }

        return ret;
    }
}
