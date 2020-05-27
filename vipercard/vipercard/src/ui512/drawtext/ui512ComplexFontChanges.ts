
/* auto */ import { checkThrow512 } from './../utils/util512Assert';
/* auto */ import { Util512, fitIntoInclusive } from './../utils/util512';
/* auto */ import { FormattedText } from './ui512FormattedText';
/* auto */ import { UI512FontRequest } from './ui512DrawTextFontRequest';
/* auto */ import { TextFontSpec, TextFontStyling, stringToTextFontStyling, textFontStylingToString } from './ui512DrawTextClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * tools for dealing with formatted substrings, e.g.
 * set the textstyle of char 2 to 4 of cd fld "fld1" to bold
 */
export const UI512ComplexFontChanges = /* static class */ {
    /**
     * parse a list ["bold", "italic"] into bitfield bold|italic
     */
    styleListToInt(list: string[]): TextFontStyling {
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
                case 'grayed':
                    ret |= TextFontStyling.Grayed;
                    break;
                case 'condense':
                    ret |= TextFontStyling.Condense;
                    break;
                case 'extend':
                    ret |= TextFontStyling.Extend;
                    break;
                default:
                    checkThrow512(false, `67|warning: unrecognized text style ${s}`);
            }
        }

        return ret;
    },

    /**
     * from bitfield bold|italic to ["bold", "italic"]
     */
    intToStyleList(style: TextFontStyling) {
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

        if ((style & TextFontStyling.Grayed) !== 0) {
            ret.push('grayed');
        }

        if ((style & TextFontStyling.Condense) !== 0) {
            ret.push('condense');
        }

        if ((style & TextFontStyling.Extend) !== 0) {
            ret.push('extend');
        }

        return ret.join(',');
    },

    /**
     * ['italic', 'outline'] to "b+iu+osdce"
     */
    styleListToLowString(vpcStyles: string[]) {
        let n = this.styleListToInt(vpcStyles);
        return textFontStylingToString(n);
    },

    /**
     * "b+iu+osdce" to ['italic', 'outline']
     */
    lowStringToStyleList(style: string) {
        let enumStyle = stringToTextFontStyling(style);
        return this.intToStyleList(enumStyle).split(',');
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
     * if it varies, we'll return "mixed".
     */
    _getChunkTextAttribute(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number,
        fn: (s: string) => string
    ) {
        if (txt.len() === 0 || inStart >= txt.len()) {
            return fn(defaultFont);
        }

        let seenAttr = '';
        let [start, end] = this.fitBounds(txt.len(), inStart, inLen, true);
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
    _setChunkTextAttribute(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number,
        fn: (s: string) => string
    ) {
        if (txt.len() === 0 || inStart >= txt.len()) {
            return;
        }

        let [start, end] = this.fitBounds(txt.len(), inStart, inLen, false);
        for (let i = start; i < end; i++) {
            txt.setFontAt(i, fn(txt.fontAt(i)));
        }
    },

    /**
     * get typeface of chunk, "courier" or "mixed" if there's more than one typeface
     */
    getChunkTextFaceOrMixed(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number
    ): string {
        let fn = (s: string) => TextFontSpec.getTypeface(s);
        return this._getChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    },

    /**
     * set typeface of chunk
     */
    setChunkTextFace(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number,
        sNext: string
    ) {
        let fn = (scurrent: string) => TextFontSpec.setTypeface(scurrent, sNext);
        return this._setChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    },

    /**
     * get point size of chunk, "12" or "mixed" if it varies
     */
    getChunkTextSizeOrMixed(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number
    ): number | string {
        let fn = (s: string) => TextFontSpec.getFontSize(s);
        let ret = this._getChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
        let n = Util512.parseInt(ret);
        return ret === 'mixed' ? ret : n ?? 0;
    },

    /**
     * set point size of chunk
     */
    setChunkTextSize(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number,
        next: number
    ) {
        let ssize = next.toString();
        let fn = (scurrent: string) => TextFontSpec.setFontSize(scurrent, ssize);
        return this._setChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    },

    /**
     * get font style of chunk, ["bold", "italic"] or ["mixed"] if it varies
     */
    getChunkTextStyleOrMixed(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number
    ): string[] {
        let fn = (s: string) => TextFontSpec.getFontStyle(s);
        let ret = this._getChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
        return ret === 'mixed' ? ['mixed'] : this.lowStringToStyleList(ret);
    },

    /**
     * set font style of chunk
     */
    setChunkTextStyleSimple(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number,
        list: string[]
    ) {
        let sNext = this.styleListToLowString(list);
        let fn = (scurrent: string) => TextFontSpec.setFontStyle(scurrent, sNext);
        return this._setChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    },

    /**
     * set font style of chunk. "add-bold" "subtract-italic"
     */
    _setChunkTextStyleAddOrSub(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number,
        spec: string
    ) {
        let isAdd: boolean;
        if (spec.startsWith('add-')) {
            isAdd = true;
            spec = spec.substr('add-'.length);
        } else if (spec.startsWith('subtract-')) {
            isAdd = false;
            spec = spec.substr('subtract-'.length);
        }

        if (spec === 'plain') {
            return;
        }
        let bitToModify = this.styleListToInt([spec]);
        let f = (full: string) => {
            let low = TextFontSpec.getFontStyle(full);
            let n = stringToTextFontStyling(low);
            if (isAdd) {
                n |= bitToModify;
            } else {
                n &= ~bitToModify;
            }

            return TextFontSpec.setFontStyle(full, textFontStylingToString(n));
        };

        this._setChunkTextAttribute(txt, defaultFont, inStart, inLen, f);
    },

    /**
     * return true if any characters have a style
     */
    doAnyCharactersNotHaveThisStyle(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number,
        styleToCheck: string
    ) {
        checkThrow512(styleToCheck !== 'plain', 'V5|cannot ask if it contains plain');
        let bitToCheck = this.styleListToInt([styleToCheck]);
        let sawOneWithoutIt = false;
        let f = (full: string) => {
            let low = TextFontSpec.getFontStyle(full);
            let n = stringToTextFontStyling(low);
            if ((n & bitToCheck) === 0) {
                sawOneWithoutIt = true;
            }

            return '_';
        };

        this._getChunkTextAttribute(txt, defaultFont, inStart, inLen, f);
        return sawOneWithoutIt;
    },

    /**
     * set font style of chunk. "toggle-outline"
     */
    _setChunkTextStyleToggle(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number,
        spec: string
    ) {
        checkThrow512(spec.startsWith('toggle-'), 'V4|');
        spec = spec.substr('toggle-'.length);
        checkThrow512(spec !== 'plain', 'V3|cannot say toggle-plain');
        if (spec === 'condense') {
            this._setChunkTextStyleAddOrSub(
                txt,
                defaultFont,
                inStart,
                inLen,
                'subtract-extend'
            );
        } else if (spec === 'extend') {
            this._setChunkTextStyleAddOrSub(
                txt,
                defaultFont,
                inStart,
                inLen,
                'subtract-condense'
            );
        }

        let onesWithout = this.doAnyCharactersNotHaveThisStyle(
            txt,
            defaultFont,
            inStart,
            inLen,
            spec
        );
        if (onesWithout) {
            this._setChunkTextStyleAddOrSub(
                txt,
                defaultFont,
                inStart,
                inLen,
                'add-' + spec
            );
        } else {
            this._setChunkTextStyleAddOrSub(
                txt,
                defaultFont,
                inStart,
                inLen,
                'subtract-' + spec
            );
        }
    },

    /**
     * set font style of chunk, supports "add-bold" "subtract-italic" "toggle-outline"
     */
    setChunkTextStyleAdvanced(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number,
        list: string[]
    ) {
        if (list.length === 1 && list[0].startsWith('add-')) {
            return this._setChunkTextStyleAddOrSub(
                txt,
                defaultFont,
                inStart,
                inLen,
                list[0]
            );
        } else if (list.length === 1 && list[0].startsWith('subtract-')) {
            return this._setChunkTextStyleAddOrSub(
                txt,
                defaultFont,
                inStart,
                inLen,
                list[0]
            );
        } else if (list.length === 1 && list[0].startsWith('toggle-')) {
            return this._setChunkTextStyleToggle(
                txt,
                defaultFont,
                inStart,
                inLen,
                list[0]
            );
        }

        checkThrow512(
            !list.some(
                item =>
                    item.startsWith('add-') ||
                    item.startsWith('subtract-') ||
                    item.startsWith('toggle-')
            ),
            'V2|you can only say add- subtract- or toggle- if one style is given'
        );
        return this.setChunkTextStyleSimple(txt, defaultFont, inStart, inLen, list);
    },

    /**
     * go from ("add-bold", "biuosdce") to "+biuosdce"
     * do this by creating a temp string and calling setChunkTextStyleAdvanced
     */
    setGeneralTextStyleAdvanced(low: string, spec: string) {
        let txt = new FormattedText();
        /* it doesn't matter what character is used */
        txt.fromSerialized(' ');
        let full = TextFontSpec.setFontStyle(UI512FontRequest.defaultFont, low);
        txt.setFontAt(0, full);
        this.setChunkTextStyleAdvanced(
            txt,
            UI512FontRequest.defaultFont,
            0,
            1,
            spec.split(',')
        );
        return TextFontSpec.getFontStyle(txt.fontAt(0));
    },

    /**
     * go from ("add-bold", TextFontStyling.Italic) to TextFontStyling.Italic|Bold
     */
    setGeneralTextStyleAdvancedInt(n: number, spec: string) {
        return stringToTextFontStyling(
            this.setGeneralTextStyleAdvanced(textFontStylingToString(n), spec)
        );
    }
};
