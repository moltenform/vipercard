
/* auto */ import { O, assertTrue, assertTrueWarn, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { BrowserOSInfo, Util512, assertEq, assertEqWarn } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ScrollConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CharsetTranslation, specialCharFontChange, specialCharNumNewline } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { TextRendererFontCache } from '../../ui512/draw/ui512DrawTextRequestData.js';

const space = ' '.charCodeAt(0);
const dash = '-'.charCodeAt(0);

export class FormattedText {
    isFormattedText = true;
    protected charArray: number[] = [];
    protected fontArray: string[] = [];
    protected locked = false;

    charAt(i: number) {
        return this.charArray[i];
    }

    fontAt(i: number) {
        return this.fontArray[i];
    }

    indexOf(c: number) {
        return this.charArray.indexOf(c);
    }

    setFontAt(i: number, s: string) {
        assertTrueWarn(s.length > 0, '');
        assertTrue(!this.locked, '3q|locked');
        assertTrue(
            !scontains(s, specialCharFontChange),
            `3p|invalid character ${specialCharFontChange.charCodeAt(0)} in font description`
        );
        this.fontArray[i] = s;
    }

    setCharAt(i: number, n: number) {
        assertTrue(!this.locked, '3o|locked');
        this.charArray[i] = n;
    }

    setFontEverywhere(s: string) {
        assertTrueWarn(s.length > 0, '');
        assertTrue(!this.locked, '3n|locked');
        assertTrue(
            !scontains(s, specialCharFontChange),
            `3m|invalid character ${specialCharFontChange.charCodeAt(0)} in font description`
        );
        for (let i = 0; i < this.fontArray.length; i++) {
            this.fontArray[i] = s;
        }
    }

    push(char: number, font: string) {
        assertTrueWarn(font.length > 0, '');
        assertTrue(!this.locked, '3l|locked');
        assertTrue(
            !scontains(font, specialCharFontChange),
            `3k|invalid character ${specialCharFontChange.charCodeAt(0)} in font description`
        );
        this.charArray.push(char);
        this.fontArray.push(font);
    }

    append(other: FormattedText) {
        assertTrue(!this.locked, '3j|locked');
        this.charArray = this.charArray.concat(other.charArray);
        this.fontArray = this.fontArray.concat(other.fontArray);
    }

    lock() {
        this.locked = true;
    }

    isLocked() {
        return this.locked;
    }

    getUnlockedCopy() {
        let other = this.clone();
        other.locked = false;
        return other;
    }

    clone() {
        let other = new FormattedText();
        other.charArray = this.charArray.slice(0);
        other.fontArray = this.fontArray.slice(0);
        return other;
    }

    splice(n: number, nDelete: number) {
        assertTrue(!this.locked, '3i|locked');
        this.charArray.splice(n, nDelete);
        this.fontArray.splice(n, nDelete);
    }

    deleteAll() {
        assertTrue(!this.locked, '3h|locked');
        this.charArray = [];
        this.fontArray = [];
    }

    static byInsertion(t: FormattedText, n: number, nDelete: number, insert: string, font: string) {
        // could use splice() and fn.apply(), but that might hit javascript arg count limit
        let tnew = new FormattedText();
        tnew.charArray = t.charArray.slice(0, n);
        for (let i = 0; i < insert.length; i++) {
            tnew.charArray.push(insert.charCodeAt(i));
        }

        assertTrue(
            !scontains(font, specialCharFontChange),
            `3g|invalid character ${specialCharFontChange.charCodeAt(0)} in font description`
        );
        tnew.charArray = tnew.charArray.concat(t.charArray.slice(n + nDelete));

        tnew.fontArray = t.fontArray.slice(0, n);
        for (let i = 0; i < insert.length; i++) {
            tnew.fontArray.push(font);
        }

        tnew.fontArray = tnew.fontArray.concat(t.fontArray.slice(n + nDelete));
        return tnew;
    }

    static newFromPersisted(s: string) {
        let tnew = new FormattedText();
        tnew.fromPersisted(s);
        return tnew;
    }

    static newFromUnformatted(s: string) {
        s = s.replace(new RegExp(specialCharFontChange, 'g'), '');
        s = s.replace(new RegExp('\x00', 'g'), '');
        s = s.replace(new RegExp('\r\n', 'g'), '\n');
        s = s.replace(new RegExp('\r', 'g'), '\n');
        return FormattedText.newFromPersisted(s);
    }

    static fromExternalCharset(s: string, info: BrowserOSInfo, fallback = '?') {
        s = s.replace(new RegExp(specialCharFontChange, 'g'), '');
        s = s.replace(new RegExp('\x00', 'g'), '');
        s = s.replace(new RegExp('\r\n', 'g'), '\n');
        s = s.replace(new RegExp('\r', 'g'), '\n');
        s = CharsetTranslation.translateUnToRoman(s, fallback);
        return s;
    }

    static toExternalCharset(s: string, info: BrowserOSInfo, fallback = '?') {
        s = s.replace(new RegExp(specialCharFontChange, 'g'), '');
        s = s.replace(new RegExp('\x00', 'g'), '');
        s = s.replace(new RegExp('\r\n', 'g'), '\n');
        s = s.replace(new RegExp('\r', 'g'), '\n');
        s = CharsetTranslation.translateRomanToUn(s, fallback);
        if (info === BrowserOSInfo.Windows) {
            s = s.replace(new RegExp('\n', 'g'), '\r\n');
        }

        return s;
    }

    static fromHostCharsetStrict(s: string, brinfo: BrowserOSInfo) {
        let try1 = FormattedText.fromExternalCharset(s, brinfo, '?');
        let try2 = FormattedText.fromExternalCharset(s, brinfo, '!');
        return try1 !== try2 ? undefined : try1;
    }

    appendSubstring(other: FormattedText, b1: number, b2: number) {
        this.charArray = this.charArray.concat(other.charArray.slice(b1, b2));
        this.fontArray = this.fontArray.concat(other.fontArray.slice(b1, b2));
    }

    len() {
        assertEqWarn(this.charArray.length, this.fontArray.length, '3f|');
        return this.charArray.length;
    }

    fromPersisted(s: string) {
        assertTrue(!this.locked, '3e|locked');
        this.charArray = [];
        this.fontArray = [];
        assertEq(-1, s.indexOf('\r'), '3d|');
        assertEq(-1, s.indexOf('\x00'), '3c|');

        if (!s.startsWith(specialCharFontChange)) {
            s = specialCharFontChange + TextRendererFontCache.defaultFont + specialCharFontChange + s;
        }

        let parts = s.split(new RegExp(specialCharFontChange, 'g'));
        assertTrue(parts.length % 2 === 1, '3b|parts length must be odd');
        let currentFont = TextRendererFontCache.defaultFont;
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                let content = parts[i];
                for (let j = 0; j < content.length; j++) {
                    this.charArray.push(content.charCodeAt(j));
                    this.fontArray.push(currentFont);
                }
            } else {
                currentFont = parts[i];
                assertTrue(currentFont.length > 0, '');
                assertTrue(
                    !scontains(currentFont, specialCharFontChange),
                    `3a|invalid character ${specialCharFontChange.charCodeAt(0)} in font description`
                );
            }
        }
    }

    toPersisted() {
        let s = '';
        let currentFont: O<string> = undefined;
        assertEq(this.charArray.length, this.fontArray.length, '3Z|');
        for (let i = 0; i < this.charArray.length; i++) {
            if (currentFont !== this.fontArray[i]) {
                s += specialCharFontChange + this.fontArray[i] + specialCharFontChange;
                currentFont = this.fontArray[i];
            }
            s += String.fromCharCode(this.charAt(i));
        }

        return s;
    }

    toUnformatted() {
        let ret = this.charArray.map(c => String.fromCharCode(c)).join('');
        assertEq(this.len(), ret.length, '3Y|');
        return ret;
    }

    toUnformattedSubstr(from: number, len: number) {
        return this.charArray
            .slice(from, from + len)
            .map(c => String.fromCharCode(c))
            .join('');
    }
}

export class Lines {
    lns: FormattedText[];
    constructor(txt: FormattedText) {
        this.lns = [new FormattedText()];
        // include the '\n' characters at the end of the line like we do when rendering
        // if we strip the \n characters we would lose the formatting of the \n characters
        for (let i = 0; i < txt.len(); i++) {
            this.lns[this.lns.length - 1].push(txt.charAt(i), txt.fontAt(i));

            if (txt.charAt(i) === specialCharNumNewline) {
                this.lns.push(new FormattedText());
            }
        }
    }

    flatten() {
        let newtext = new FormattedText();
        for (let line of this.lns) {
            newtext.append(line);
        }

        return newtext;
    }

    indexToLineNumber(n: number) {
        let runningtotal = 0;
        for (let i = 0; i < this.lns.length; i++) {
            let nexttotal = runningtotal + this.lns[i].len();
            if (n >= runningtotal && n < nexttotal) {
                return i;
            }

            runningtotal = nexttotal;
        }

        return this.lns.length - 1;
    }

    static fastLineNumberToIndex(txt: FormattedText, linenumber: number) {
        let count = 0;
        for (let i = 0; i < txt.len(); i++) {
            if (count === linenumber) {
                return i;
            } else if (txt.charAt(i) === specialCharNumNewline) {
                count += 1;
            }
        }

        return txt.len();
    }

    static fastLineNumberAndEndToIndex(txt: FormattedText, linenumber: number) {
        let startindex = Lines.fastLineNumberToIndex(txt, linenumber);
        let i = startindex;
        for (i = startindex; i < txt.len(); i++) {
            if (txt.charAt(i) === specialCharNumNewline) {
                break;
            }
        }

        return [startindex, i + 1];
    }

    length() {
        let runningtotal = 0;
        for (let i = 0; i < this.lns.length; i++) {
            runningtotal += this.lns[i].len();
        }

        return runningtotal;
    }

    lineNumberToIndex(linenum: number) {
        let runningtotal = 0;
        linenum = Math.min(linenum, this.lns.length - 1);
        for (let i = 0; i < linenum; i++) {
            runningtotal += this.lns[i].len();
        }

        return runningtotal;
    }

    lineNumberToLineEndIndex(linenum: number) {
        let ln = this.lns[linenum];
        let startline = this.lineNumberToIndex(linenum);
        if (ln.len() === 0) {
            return startline;
        } else if (ln.charAt(ln.len() - 1) === specialCharNumNewline) {
            return startline + ln.len() - 1;
        } else {
            return startline + ln.len();
        }
    }

    getLineUnformatted(linenum: number) {
        let r = this.lns[linenum].toUnformatted();
        return r;
    }

    static alterSelectedLines(
        t: FormattedText,
        ncaret: number,
        nend: number,
        fnAlterLine: (t: FormattedText) => void
    ): [FormattedText, number, number] {
        let lines = new Lines(t);
        let firstline = lines.indexToLineNumber(Math.min(ncaret, nend));
        let lastline = lines.indexToLineNumber(Math.max(ncaret, nend));
        for (let i = firstline; i <= lastline; i++) {
            fnAlterLine(lines.lns[i]);
        }

        // let's select both entire lines we altered
        let nextcaret = lines.lineNumberToIndex(firstline);
        let nextend = lines.lineNumberToLineEndIndex(lastline);
        return [lines.flatten(), nextcaret, nextend];
    }

    static getNonSpaceStartOfLine(t: FormattedText, okToExceedLength: boolean) {
        let i = 0;
        let tab = '\t'.charCodeAt(0);
        if (!t.len()) {
            return 0;
        }

        for (i = 0; i < t.len(); i++) {
            if (t.charAt(i) !== space && t.charAt(i) !== tab) {
                return i;
            }
        }

        return okToExceedLength ? t.len() : t.len() - 1;
    }

    static getIndentLevel(t: FormattedText) {
        let spaces = Util512.repeat(ScrollConsts.tabSize, ' ').join('');
        let s = t.toUnformatted();
        const maxIndents = 1024;
        let count = 0;
        for (let i = 0; i < maxIndents; i++) {
            if (s.startsWith('\t')) {
                count += 1;
                s = s.substr(1);
            } else if (s.startsWith(spaces)) {
                count += 1;
                s = s.substr(spaces.length);
            } else {
                break;
            }
        }

        return count;
    }
}
