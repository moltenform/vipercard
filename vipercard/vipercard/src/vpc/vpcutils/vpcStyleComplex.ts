
/* auto */ import { checkThrow } from './vpcEnums';
/* auto */ import { Util512, fitIntoInclusive } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { TextFontSpec, TextFontStyling, stringToTextFontStyling, textFontStylingToString } from './../../ui512/drawtext/ui512DrawTextClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * tools for dealing with formatted substrings, e.g.
 * set the textstyle of char 2 to 4 of cd fld "fld1" to bold
 */
export const SubstringStyleComplex = /* static class */ {
    /**
     * parse a list ["bold", "italic"] into bitfield bold|italic
     */
    vpcStyleToInt(list: string[]): TextFontStyling {
        let ret = TextFontStyling.Default;
        for (let i = 0, len = list.length; i < len; i++) {
            let s = list[i];
            s = s.toLowerCase().trim();
            switch (s) {
                case 'plain':
                    break;
                case 'bold':
                    ret |= TextFontStyling.Bold;
                    break;
                case 'italic':
                    ret |= TextFontStyling.Italic;
                    break;
                case 'underline':
                    ret |= TextFontStyling.Underline;
                    break;
                case 'outline':
                    ret |= TextFontStyling.Outline;
                    break;
                case 'shadow':
                    ret |= TextFontStyling.Shadow;
                    break;
                case 'condense':
                    ret |= TextFontStyling.Condense;
                    break;
                case 'extend':
                    ret |= TextFontStyling.Extend;
                    break;
                case 'grayed':
                    ret |= TextFontStyling.Grayed;
                    break;
                default:
                    checkThrow(false, `67|warning: unrecognized text style ${s}`);
            }
        }

        return ret;
    },

    /**
     * from bitfield bold|italic to ["bold", "italic"]
     */
    vpcStyleFromInt(style: TextFontStyling) {
        let ret: string[] = [];
        if (style === 0) {
            ret.push('plain');
        }

        if ((style & TextFontStyling.Bold) !== 0) {
            ret.push('bold');
        }

        if ((style & TextFontStyling.Italic) !== 0) {
            ret.push('italic');
        }

        if ((style & TextFontStyling.Underline) !== 0) {
            ret.push('underline');
        }

        if ((style & TextFontStyling.Outline) !== 0) {
            ret.push('outline');
        }

        if ((style & TextFontStyling.Shadow) !== 0) {
            ret.push('shadow');
        }

        if ((style & TextFontStyling.Condense) !== 0) {
            ret.push('condense');
        }

        if ((style & TextFontStyling.Extend) !== 0) {
            ret.push('extend');
        }

        if ((style & TextFontStyling.Grayed) !== 0) {
            ret.push('grayed');
        }

        return ret.join(',');
    },

    /**
     * ['italic', 'outline'] to "b+iu+osdce"
     */
    ui512styleFromVpcStyleList(vpcStyles: string[]) {
        let n = SubstringStyleComplex.vpcStyleToInt(vpcStyles);
        return textFontStylingToString(n);
    },

    /**
     * "b+iu+osdce" to ['italic', 'outline']
     */
    ui512styleToVpcStyleList(style: string) {
        let enumStyle = stringToTextFontStyling(style);
        return SubstringStyleComplex.vpcStyleFromInt(enumStyle).split(',');
    },

    /**
     * when you say set the textstyle of char 999 of cd fld "fld1",
     * adjust to fit into what's actually there
     */
    fitBounds(txtlen: number, inStart: number, inLen: number, isGet: boolean) {
        if (isGet && inLen === 0) {
            inLen = 1;
        }

        let end = inStart + inLen;
        let start = fitIntoInclusive(inStart, 0, txtlen - 1);
        end = fitIntoInclusive(end, start, txtlen);
        return [start, end];
    },

    /**
     * get attribute of a chunk of text
     * note that if it varies, we'll return "mixed".
     */
    _getChunkTextAttribute(txt: FormattedText, defaultFont: string, inStart: number, inLen: number, fn: (s: string) => string) {
        if (txt.len() === 0 || inStart >= txt.len()) {
            return fn(defaultFont);
        }

        let seenAttr = '';
        let [start, end] = SubstringStyleComplex.fitBounds(txt.len(), inStart, inLen, true);
        for (let i = start; i < end; i++) {
            let attr = fn(txt.fontAt(i));
            if (seenAttr !== '' && seenAttr !== attr) {
                return 'mixed';
            } else {
                seenAttr = attr;
            }
        }

        return seenAttr ? seenAttr : fn(defaultFont);
    },

    /**
     * set attribute of a chunk of text
     */
    _setChunkTextAttribute(txt: FormattedText, defaultFont: string, inStart: number, inLen: number, fn: (s: string) => string) {
        if (txt.len() === 0 || inStart >= txt.len()) {
            return;
        }

        let [start, end] = SubstringStyleComplex.fitBounds(txt.len(), inStart, inLen, false);
        for (let i = start; i < end; i++) {
            txt.setFontAt(i, fn(txt.fontAt(i)));
        }
    },

    /**
     * get typeface of chunk, or "mixed" if there's more than one typeface
     */
    getChunkTextFace(txt: FormattedText, defaultFont: string, inStart: number, inLen: number): string {
        let fn = (s: string) => TextFontSpec.getTypeface(s);
        return SubstringStyleComplex._getChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    },

    /**
     * set typeface of chunk
     */
    setChunkTextFace(txt: FormattedText, defaultFont: string, inStart: number, inLen: number, snext: string) {
        let fn = (scurrent: string) => TextFontSpec.setTypeface(scurrent, snext);
        return SubstringStyleComplex._setChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    },

    /**
     * get point size of chunk, or "mixed" if it varies
     */
    getChunkTextSize(txt: FormattedText, defaultFont: string, inStart: number, inLen: number): number | string {
        let fn = (s: string) => TextFontSpec.getFontSize(s);
        let ret = SubstringStyleComplex._getChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
        let n = Util512.parseInt(ret);
        return ret === 'mixed' ? ret : n ?? 0;
    },

    /**
     * set point size of chunk
     */
    setChunkTextSize(txt: FormattedText, defaultFont: string, inStart: number, inLen: number, next: number) {
        let ssize = next.toString();
        let fn = (scurrent: string) => TextFontSpec.setFontSize(scurrent, ssize);
        return SubstringStyleComplex._setChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    },

    /**
     * get font style of chunk, or "mixed" if it varies
     */
    getChunkTextStyle(txt: FormattedText, defaultFont: string, inStart: number, inLen: number): string[] {
        let fn = (s: string) => TextFontSpec.getFontStyle(s);
        let ret = SubstringStyleComplex._getChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
        return ret === 'mixed' ? ['mixed'] : SubstringStyleComplex.ui512styleToVpcStyleList(ret);
    },

    /**
     * set font style of chunk
     */
    setChunkTextStyle(txt: FormattedText, defaultFont: string, inStart: number, inLen: number, list: string[]) {
        if (list.length === 1 && list[0].startsWith('toggle-')) {
            return this.toggleFontStyle(txt, defaultFont, inStart, inLen, list[0].substr('toggle-'.length));
        }

        let snext = SubstringStyleComplex.ui512styleFromVpcStyleList(list);
        let fn = (scurrent: string) => TextFontSpec.setFontStyle(scurrent, snext);
        return SubstringStyleComplex._setChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    },

    /**
     * if all bold, goes plain
     * else bold each
     */
    toggleFontStyle(txt: FormattedText, defaultFont: string, inStart: number, inLen: number, whichStyle: string) {
        let current = this.getChunkTextStyle(txt, defaultFont, inStart, inLen);
        checkThrow(whichStyle !== 'plain', "doesn't make sense to toggle plain");
        let makeBold = true;
        if (current.find(item => item === whichStyle)) {
            /* it's already all bold. so take away the bold */
            makeBold = false;
        }

        let styleInt = this.vpcStyleToInt([whichStyle]);
        for (let i = 0; i < txt.len(); i++) {
            let style = TextFontSpec.getFontStyle(txt.fontAt(i));
            let number = Number(stringToTextFontStyling(style));
            if (makeBold) {
                number |= styleInt;
            } else {
                number &= ~styleInt;
            }

            let newStyle = textFontStylingToString(number);
            let newFont = TextFontSpec.setFontStyle(txt.fontAt(i), newStyle);
            txt.setFontAt(i, newFont);
        }
    }
};
