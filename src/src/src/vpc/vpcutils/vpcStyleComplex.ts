
/* auto */ import { makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { base10, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { TextFontSpec, TextFontStyling, stringToTextFontStyling, textFontStylingToString } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';

export class FormattedSubstringUtil {
    static vpcstyleToInt(list: string[]): TextFontStyling {
        let ret = TextFontStyling.Default;
        for (let s of list) {
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
                    ret |= TextFontStyling.Condensed;
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

    static vpcstyleFromInt(style: TextFontStyling) {
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
        if ((style & TextFontStyling.Condensed) !== 0) {
            ret.push('condense');
        }
        if ((style & TextFontStyling.Extend) !== 0) {
            ret.push('extend');
        }

        return ret.join(',');
    }

    static ui512styleFromvpcStyleList(vpcstyles: string[]) {
        let n = FormattedSubstringUtil.vpcstyleToInt(vpcstyles);
        return textFontStylingToString(n);
    }

    static ui512styleTovpcStyleList(sstyle: string) {
        let style = stringToTextFontStyling(sstyle);
        return FormattedSubstringUtil.vpcstyleFromInt(style).split(',');
    }

    static fitBounds(txtlen: number, instart: number, inlen: number, isGet: boolean) {
        if (isGet && inlen === 0) {
            inlen = 1;
        }

        let end = instart + inlen;
        let start = fitIntoInclusive(instart, 0, txtlen - 1);
        end = fitIntoInclusive(end, start, txtlen);
        return [start, end];
    }

    protected static getChunkTextAttribute(
        txt: FormattedText,
        defaultFont: string,
        instart: number,
        inlen: number,
        fn: Function
    ) {
        if (txt.len() === 0 || instart >= txt.len()) {
            return fn(defaultFont);
        }

        let seenAttr = '';
        let [start, end] = FormattedSubstringUtil.fitBounds(txt.len(), instart, inlen, true);
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

    protected static setChunkTextAttribute(
        txt: FormattedText,
        defaultFont: string,
        instart: number,
        inlen: number,
        fn: Function
    ) {
        if (txt.len() === 0 || instart >= txt.len()) {
            return;
        }

        let [start, end] = FormattedSubstringUtil.fitBounds(txt.len(), instart, inlen, false);
        for (let i = start; i < end; i++) {
            txt.setFontAt(i, fn(txt.fontAt(i)));
        }
    }

    static getChunkTextFace(txt: FormattedText, defaultFont: string, instart: number, inlen: number): string {
        let fn = (s: string) => TextFontSpec.getFacePart(s);
        return FormattedSubstringUtil.getChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
    }

    static setChunkTextFace(txt: FormattedText, defaultFont: string, instart: number, inlen: number, snext: string) {
        let fn = (scurrent: string) => TextFontSpec.setFacePart(scurrent, snext);
        return FormattedSubstringUtil.setChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
    }

    static getChunkTextSize(txt: FormattedText, defaultFont: string, instart: number, inlen: number): number | string {
        let fn = (s: string) => TextFontSpec.getSizePart(s);
        let ret = FormattedSubstringUtil.getChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
        let n = parseInt(ret, base10);
        return ret === 'mixed' ? ret : isFinite(n) ? n : 0;
    }

    static setChunkTextSize(txt: FormattedText, defaultFont: string, instart: number, inlen: number, next: number) {
        let ssize = next.toString();
        let fn = (scurrent: string) => TextFontSpec.setSizePart(scurrent, ssize);
        return FormattedSubstringUtil.setChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
    }

    static getChunkTextStyle(txt: FormattedText, defaultFont: string, instart: number, inlen: number): string[] {
        let fn = (s: string) => TextFontSpec.getStylePart(s);
        let ret = FormattedSubstringUtil.getChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
        return ret === 'mixed' ? ['mixed'] : FormattedSubstringUtil.ui512styleTovpcStyleList(ret);
    }

    static setChunkTextStyle(txt: FormattedText, defaultFont: string, instart: number, inlen: number, list: string[]) {
        let snext = FormattedSubstringUtil.ui512styleFromvpcStyleList(list);
        let fn = (scurrent: string) => TextFontSpec.setStylePart(scurrent, snext);
        return FormattedSubstringUtil.setChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
    }
}
