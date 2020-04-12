
/* auto */ import { Util512, fitIntoInclusive } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/draw/ui512FormattedText';
/* auto */ import { TextFontSpec, TextFontStyling, stringToTextFontStyling, textFontStylingToString } from './../../ui512/draw/ui512DrawTextClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * tools for dealing with formatted substrings, e.g.
 * set the textstyle of char 2 to 4 of cd fld "fld1" to bold
 */
export class SubstringStyleComplex {
    /**
     * parse a list ["bold", "italic"] into bitfield bold|italic
     */
    static vpcStyleToInt(list: string[]): TextFontStyling {
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
                default:
                    throw makeVpcScriptErr(`67|warning: unrecognized text style ${s}`);
            }
        }

        return ret;
    }

    /**
     * from bitfield bold|italic to ["bold", "italic"]
     */
    static vpcStyleFromInt(style: TextFontStyling) {
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

        return ret.join(',');
    }

    /**
     * ['italic', 'outline'] to "b+iu+osdce"
     */
    static ui512styleFromVpcStyleList(vpcStyles: string[]) {
        let n = SubstringStyleComplex.vpcStyleToInt(vpcStyles);
        return textFontStylingToString(n);
    }

    /**
     * "b+iu+osdce" to ['italic', 'outline']
     */
    static ui512styleToVpcStyleList(style: string) {
        let enumStyle = stringToTextFontStyling(style);
        return SubstringStyleComplex.vpcStyleFromInt(enumStyle).split(',');
    }

    /**
     * when you say set the textstyle of char 999 of cd fld "fld1",
     * adjust to fit into what's actually there
     */
    static fitBounds(txtlen: number, inStart: number, inLen: number, isGet: boolean) {
        if (isGet && inLen === 0) {
            inLen = 1;
        }

        let end = inStart + inLen;
        let start = fitIntoInclusive(inStart, 0, txtlen - 1);
        end = fitIntoInclusive(end, start, txtlen);
        return [start, end];
    }

    /**
     * get attribute of a chunk of text
     * note that if it varies, we'll return "mixed".
     */
    protected static getChunkTextAttribute(
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
    }

    /**
     * set attribute of a chunk of text
     */
    protected static setChunkTextAttribute(
        txt: FormattedText,
        defaultFont: string,
        inStart: number,
        inLen: number,
        fn: (s: string) => string
    ) {
        if (txt.len() === 0 || inStart >= txt.len()) {
            return;
        }

        let [start, end] = SubstringStyleComplex.fitBounds(txt.len(), inStart, inLen, false);
        for (let i = start; i < end; i++) {
            txt.setFontAt(i, fn(txt.fontAt(i)));
        }
    }

    /**
     * get typeface of chunk, or "mixed" if there's more than one typeface
     */
    static getChunkTextFace(txt: FormattedText, defaultFont: string, inStart: number, inLen: number): string {
        let fn = (s: string) => TextFontSpec.getTypeface(s);
        return SubstringStyleComplex.getChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    }

    /**
     * set typeface of chunk
     */
    static setChunkTextFace(txt: FormattedText, defaultFont: string, inStart: number, inLen: number, snext: string) {
        let fn = (scurrent: string) => TextFontSpec.setTypeface(scurrent, snext);
        return SubstringStyleComplex.setChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    }

    /**
     * get point size of chunk, or "mixed" if it varies
     */
    static getChunkTextSize(txt: FormattedText, defaultFont: string, inStart: number, inLen: number): number | string {
        let fn = (s: string) => TextFontSpec.getFontSize(s);
        let ret = SubstringStyleComplex.getChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
        let n = Util512.parseInt(ret);
        return ret === 'mixed' ? ret : n ?? 0;
    }

    /**
     * set point size of chunk
     */
    static setChunkTextSize(txt: FormattedText, defaultFont: string, inStart: number, inLen: number, next: number) {
        let ssize = next.toString();
        let fn = (scurrent: string) => TextFontSpec.setFontSize(scurrent, ssize);
        return SubstringStyleComplex.setChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    }

    /**
     * get font style of chunk, or "mixed" if it varies
     */
    static getChunkTextStyle(txt: FormattedText, defaultFont: string, inStart: number, inLen: number): string[] {
        let fn = (s: string) => TextFontSpec.getFontStyle(s);
        let ret = SubstringStyleComplex.getChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
        return ret === 'mixed' ? ['mixed'] : SubstringStyleComplex.ui512styleToVpcStyleList(ret);
    }

    /**
     * set font style of chunk
     */
    static setChunkTextStyle(txt: FormattedText, defaultFont: string, inStart: number, inLen: number, list: string[]) {
        let snext = SubstringStyleComplex.ui512styleFromVpcStyleList(list);
        let fn = (scurrent: string) => TextFontSpec.setFontStyle(scurrent, snext);
        return SubstringStyleComplex.setChunkTextAttribute(txt, defaultFont, inStart, inLen, fn);
    }
}
