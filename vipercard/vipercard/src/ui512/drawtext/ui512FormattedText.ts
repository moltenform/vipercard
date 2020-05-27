
/* auto */ import { BrowserOSInfo } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertTrue, assertWarn, checkThrow512 } from './../utils/util512Assert';
/* auto */ import { assertEq, assertWarnEq } from './../utils/util512';
/* auto */ import { TranslateCharset } from './ui512TranslateCharset';
/* auto */ import { UI512FontRequest } from './ui512DrawTextFontRequest';
/* auto */ import { specialCharFontChange } from './ui512DrawTextClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * the formatted text class for UI512.
 * can be losslessly serialized to/from a plain string.
 */
export class FormattedText {
    /* every character has an associated font. */
    protected charArray: number[] = [];
    protected fontArray: string[] = [];

    /* you can safely pass a FormattedText to a function and ensure that
    it won't be modified, by calling lock(). */
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
        assertWarn(s.length > 0, 'I||');
        assertTrue(!this.locked, '3q|locked');
        assertTrue(
            !s.includes(specialCharFontChange),
            `3p|invalid character ${specialCharFontChange.charCodeAt(
                0
            )} in font description`
        );

        this.fontArray[i] = s;
    }

    setCharAt(i: number, n: number) {
        assertTrue(!this.locked, '3o|locked');
        FormattedText.throwIfContainsControlCharacters(String.fromCharCode(n));
        this.charArray[i] = n;
    }

    setFontEverywhere(s: string) {
        assertWarn(s.length > 0, 'I{|');
        assertTrue(!this.locked, '3n|locked');
        assertTrue(
            !s.includes(specialCharFontChange),
            `3m|invalid character ${specialCharFontChange.charCodeAt(
                0
            )} in font description`
        );

        for (let i = 0; i < this.fontArray.length; i++) {
            this.fontArray[i] = s;
        }
    }

    push(char: number, font: string) {
        assertWarn(font.length > 0, 'I`|');
        assertTrue(!this.locked, '3l|locked');
        assertTrue(
            !font.includes(specialCharFontChange),
            `3k|invalid character ${specialCharFontChange.charCodeAt(
                0
            )} in font description`
        );
        FormattedText.throwIfContainsControlCharacters(String.fromCharCode(char));
        this.charArray.push(char);
        this.fontArray.push(font);
    }

    slice(start: number, end: number) {
        assertTrue(
            end >= start && start >= 0 && end >= 0,
            'invalid slice bounds',
            start,
            end
        );
        let newOne = new FormattedText();
        for (let i = 0; i < this.len(); i++) {
            if (i >= start && i < end) {
                newOne.push(this.charAt(i), this.fontAt(i));
            }
        }

        return newOne;
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

    /**
     * adds a string (of constant font) to the string
     * works like array.splice.
     */
    static byInsertion(
        t: FormattedText,
        n: number,
        nDelete: number,
        insert: string,
        font: string
    ) {
        /* previously used splice and fn.apply to do this in a few lines,
        but if done with long strings might hit the javascript engine's argument
        count limit */
        let tNew = new FormattedText();
        assertTrue(
            !font.includes(specialCharFontChange),
            `3g|invalid character ${specialCharFontChange.charCodeAt(
                0
            )} in font description`
        );
        assertTrue(n >= 0, 'I_|invalid n', n);
        assertTrue(nDelete >= 0, 'I^|invalid nDelete', nDelete);

        tNew.charArray = t.charArray.slice(0, n);
        for (let i = 0; i < insert.length; i++) {
            tNew.charArray.push(insert.charCodeAt(i));
        }

        tNew.fontArray = t.fontArray.slice(0, n);
        for (let i = 0; i < insert.length; i++) {
            tNew.fontArray.push(font);
        }

        tNew.charArray = tNew.charArray.concat(t.charArray.slice(n + nDelete));
        tNew.fontArray = tNew.fontArray.concat(t.fontArray.slice(n + nDelete));
        return tNew;
    }

    /**
     * deserialize from string
     */
    static newFromSerialized(s: string) {
        let tNew = new FormattedText();
        tNew.fromSerialized(s);
        return tNew;
    }

    /**
     * erase special characters and always use unix newlines
     */
    static filterAndConvertNewlines(s: string) {
        s = s.replace(new RegExp(specialCharFontChange, 'g'), '');
        /* eslint-disable-next-line no-control-regex */
        s = s.replace(new RegExp('\x00', 'g'), '');
        /* eslint-disable-next-line no-control-regex */
        s = s.replace(new RegExp('\r\n', 'g'), '\n');
        /* eslint-disable-next-line no-control-regex */
        s = s.replace(new RegExp('\r', 'g'), '\n');
        return s;
    }

    /**
     * from a plain-text string to formattedtext.
     */
    static newFromUnformatted(s: string) {
        FormattedText.throwIfContainsControlCharacters(s);
        s = FormattedText.filterAndConvertNewlines(s);
        return FormattedText.newFromSerialized(s);
    }

    /**
     * when reading text input by user, translate from utf16 to os-roman
     */
    static fromExternalCharset(s: string, info: BrowserOSInfo, fallback = '?') {
        s = FormattedText.filterAndConvertNewlines(s);
        s = TranslateCharset.translateUnToRoman(s, fallback);
        return s;
    }

    /**
     * when outputting our text to external os (Edit->Paste),
     * translate from os-roman to utf16
     */
    static toExternalCharset(s: string, info: BrowserOSInfo, fallback = '?') {
        s = FormattedText.filterAndConvertNewlines(s);
        s = TranslateCharset.translateRomanToUn(s, fallback);
        if (info === BrowserOSInfo.Windows) {
            /* eslint-disable-next-line no-control-regex */
            s = s.replace(new RegExp('\n', 'g'), '\r\n');
        }

        return s;
    }

    /**
     * translated charsets, returns undefined if any of the characters cannot be mapped
     */
    static fromHostCharsetStrict(s: string, brinfo: BrowserOSInfo) {
        let try1 = FormattedText.fromExternalCharset(s, brinfo, '?');
        let try2 = FormattedText.fromExternalCharset(s, brinfo, '!');
        return try1 !== try2 ? undefined : try1;
    }

    /**
     * append slice of another FormattedText, the interval [b1, b2)
     */
    appendSubstring(other: FormattedText, b1: number, b2: number) {
        this.charArray = this.charArray.concat(other.charArray.slice(b1, b2));
        this.fontArray = this.fontArray.concat(other.fontArray.slice(b1, b2));
    }

    /**
     * length of our string
     */
    len() {
        assertWarnEq(this.charArray.length, this.fontArray.length, '3f|');
        return this.charArray.length;
    }

    /**
     * serialize formatted text to a string
     * the serialized format is alternating sections between font-spec and text.
     * for example,
     * $geneva_10_biuosdce$some text$geneva_12_biuosdce$other text
     * where $ represents the specialCharFontChange character.
     */
    toSerialized() {
        let s = '';
        let currentFont: O<string> = undefined;
        assertEq(this.charArray.length, this.fontArray.length, '3Z|');
        for (let i = 0; i < this.charArray.length; i++) {
            if (currentFont !== this.fontArray[i]) {
                s += specialCharFontChange + this.fontArray[i] + specialCharFontChange;
                currentFont = this.fontArray[i];
            }

            let c = String.fromCharCode(this.charAt(i));
            FormattedText.throwIfContainsControlCharacters(c);
            s += c;
        }

        return s;
    }

    /**
     * deserialize formatted text from string
     */
    fromSerialized(s: string) {
        assertTrue(!this.locked, '3e|locked');
        this.charArray = [];
        this.fontArray = [];
        assertEq(-1, s.indexOf('\r'), '3d|');

        /* add a default font if no font was specified. */
        if (!s.startsWith(specialCharFontChange)) {
            s =
                specialCharFontChange +
                UI512FontRequest.defaultFont +
                specialCharFontChange +
                s;
        }

        let parts = s.split(new RegExp(specialCharFontChange, 'g'));
        assertTrue(parts.length % 2 === 1, '3b|parts length must be odd');
        let currentFont = UI512FontRequest.defaultFont;
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                let content = parts[i];
                for (let j = 0; j < content.length; j++) {
                    this.charArray.push(content.charCodeAt(j));
                    this.fontArray.push(currentFont);
                }
            } else {
                currentFont = parts[i];
                assertTrue(currentFont.length > 0, 'I]|');
            }
        }
    }

    /**
     * to plain text, stripping all formatting
     */
    toUnformatted() {
        let ret = this.charArray.map(c => String.fromCharCode(c)).join('');
        assertEq(this.len(), ret.length, '3Y|');
        FormattedText.throwIfContainsControlCharacters(ret);
        return ret;
    }

    /**
     * a substring as plain text, stripping all formatting
     */
    toUnformattedSubstr(from: number, len: number) {
        let ret = this.charArray
            .slice(from, from + len)
            .map(c => String.fromCharCode(c))
            .join('');
        FormattedText.throwIfContainsControlCharacters(ret);
        return ret;
    }

    /**
     * we shouldn't allow special characters most places
     */
    static throwIfContainsControlCharacters(s: string) {
        checkThrow512(
            !s.includes(specialCharFontChange),
            'Text cannot include this character.'
        );
    }
}
