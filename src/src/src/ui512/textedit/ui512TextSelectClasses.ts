
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { GetCharClass, Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ScrollConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { specialCharNumNewline } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText, Lines } from '../../ui512/draw/ui512FormattedText.js';

export class SelAndEntryImpl {
    static changeSelSelectAll(t: FormattedText, ncaret: number, nend: number): [number, number] {
        return [0, t.len()];
    }

    static changeSelGoDocHomeEnd(
        t: FormattedText,
        ncaret: number,
        nend: number,
        isLeft: boolean,
        isExtend: boolean
    ): [number, number] {
        let nextcaret = isLeft ? 0 : t.len();
        let nextend = isExtend ? nend : nextcaret;
        return [nextcaret, nextend];
    }

    static changeSelGoLineHomeEnd(
        t: FormattedText,
        ncaret: number,
        nend: number,
        isLeft: boolean,
        isExtend: boolean
    ): [number, number] {
        let lines = new Lines(t);
        let linenumber = lines.indexToLineNumber(ncaret);
        if (isLeft) {
            let startofline = lines.lineNumberToIndex(linenumber);
            let startoflinenonspace = startofline + Lines.getNonSpaceStartOfLine(lines.lns[linenumber], true);

            let nextcaret = ncaret <= startoflinenonspace ? startofline : startoflinenonspace;
            let nextend = isExtend ? nend : nextcaret;
            return [nextcaret, nextend];
        } else {
            let nextcaret = lines.lineNumberToLineEndIndex(linenumber);
            let nextend = isExtend ? nend : nextcaret;
            return [nextcaret, nextend];
        }
    }

    static changeSelLeftRight(
        t: FormattedText,
        ncaret: number,
        nend: number,
        isLeft: boolean,
        isExtend: boolean,
        isUntilWord: boolean
    ): [number, number] {
        let nextcaret = SelAndEntryImpl.getLeftRight(t, ncaret, isLeft, isUntilWord, true);
        let nextend = isExtend ? nend : nextcaret;
        return [nextcaret, nextend];
    }

    static changeSelCurrentWord(t: FormattedText, ncaret: number, nend: number): [number, number] {
        // essentially emulate hitting Ctrl-Right then Ctrl-Shift-Left
        // except that the intitial Ctrl-Right does not include trailing space
        let endword = SelAndEntryImpl.getLeftRight(t, ncaret, false, true, false);
        let nextcaret = SelAndEntryImpl.getLeftRight(t, endword, true, true, false);
        return [nextcaret, endword];
    }

    static changeTextInsert(
        t: FormattedText,
        ncaret: number,
        nend: number,
        news: string,
        defaultFont: string
    ): [FormattedText, number, number] {
        let font: string;
        let getFontFrom = Math.max(0, ncaret - 1);
        if (t.len() === 0) {
            font = defaultFont;
        } else if (getFontFrom >= 0 && getFontFrom < t.len()) {
            font = t.fontAt(getFontFrom);
        } else {
            font = t.fontAt(t.len() - 1);
        }

        let higher = Math.max(ncaret, nend);
        let lower = Math.min(ncaret, nend);
        let tnew = FormattedText.byInsertion(t, lower, higher - lower, news, font);
        return [tnew, lower + news.length, lower + news.length];
    }

    static changeTextDeleteSelection(t: FormattedText, ncaret: number, nend: number): [FormattedText, number, number] {
        let higher = Math.max(ncaret, nend);
        let lower = Math.min(ncaret, nend);
        t.splice(lower, higher - lower);
        return [t, lower, lower];
    }

    static changeTextBackspace(
        t: FormattedText,
        ncaret: number,
        nend: number,
        isLeft: boolean,
        isUntilWord: boolean
    ): [FormattedText, number, number] {
        if (t.len() === 0) {
            return [t, ncaret, nend];
        }

        if (ncaret === nend) {
            // e.g. hitting backspace is equal to hitting shift-left and deleting the selection
            [ncaret, nend] = SelAndEntryImpl.changeSelLeftRight(t, ncaret, nend, isLeft, true, isUntilWord);
        }

        return SelAndEntryImpl.changeTextDeleteSelection(t, ncaret, nend);
    }

    static changeTextDuplicate(t: FormattedText, ncaret: number, nend: number): [FormattedText, number, number] {
        if (t.len() === 0) {
            return [t, ncaret, nend];
        }

        // let's just duplicate the line where the caret is at
        let index = ncaret;
        let lines = new Lines(t);
        let linenumbertoDupe = lines.indexToLineNumber(index);
        let ln = lines.lns[linenumbertoDupe];
        let lncopy = ln.clone();
        if (ln.len() === 0) {
            // it's the last line and empty, just exit for simplicity
            return [t, ncaret, nend];
        } else if (ln.charAt(ln.len() - 1) !== specialCharNumNewline) {
            // it's the last line, so add a \n
            ln.push(specialCharNumNewline, ln.fontAt(ln.len() - 1));
            ln.append(lncopy);
        } else {
            ln.append(lncopy);
        }

        return [lines.flatten(), index, index];
    }

    static changeTextDeleteLine(t: FormattedText, ncaret: number, nend: number): [FormattedText, number, number] {
        if (t.len() === 0) {
            return [t, ncaret, nend];
        }

        let lines = new Lines(t);
        let linenumber = lines.indexToLineNumber(ncaret);
        assertTrue(lines.lns.length > 0, '2<|lines.lns is empty');
        if (linenumber >= lines.lns.length - 1) {
            lines.lns.splice(linenumber, 1);
            let tnew = lines.flatten();
            return [tnew, tnew.len(), tnew.len()];
        } else {
            lines.lns.splice(linenumber, 1);
            let nextcaret = lines.lineNumberToIndex(linenumber);
            return [lines.flatten(), nextcaret, nextcaret];
        }
    }

    static setIndentLevel(t: FormattedText, level: number, preferTab: boolean, defaultFont: string) {
        let space = preferTab ? '\t' : Util512.repeat(ScrollConsts.TabSize, ' ').join('');
        // 1) erase all current whitespace
        let countCharsToDelete = Lines.getNonSpaceStartOfLine(t, true);
        t.splice(0, countCharsToDelete);

        // 2) add spaces
        assertTrue(level >= 0, '2;|negative level');
        let added = Util512.repeat(level, space).join('');
        let [tnew, p1, p2] = SelAndEntryImpl.changeTextInsert(t, 0, 0, added, defaultFont);
        return tnew;
    }

    static changeTextIndentation(
        t: FormattedText,
        ncaret: number,
        nend: number,
        isLeft: boolean,
        defaultFont: string
    ): [FormattedText, number, number] {
        if (t.len() === 0) {
            return [t, ncaret, nend];
        }

        // otherwise, lets do a batch indent/dedent
        let cb = (thisline: FormattedText) => {
            let level = Lines.getIndentLevel(thisline);
            level += isLeft ? -1 : 1;
            level = Math.max(0, level);
            let newline = SelAndEntryImpl.setIndentLevel(thisline, level, true, defaultFont);
            thisline.deleteAll();
            thisline.append(newline);
        };

        return Lines.alterSelectedLines(t, ncaret, nend, cb);
    }

    static changeTextToggleLinePrefix(
        t: FormattedText,
        ncaret: number,
        nend: number,
        prefix: string,
        defaultFont: string
    ): [FormattedText, number, number] {
        assertTrue(
            !prefix.startsWith(' ') && !prefix.startsWith('\t') && !prefix.startsWith('\n'),
            `2:|we don't support prefix that starts with whitespace but got ${prefix}`
        );

        if (t.len() === 0) {
            return [t, ncaret, nend];
        }

        let cb = (thisline: FormattedText) => {
            let linestart = Lines.getNonSpaceStartOfLine(thisline, false);
            let existingPrefix = thisline.toUnformattedSubstr(linestart, prefix.length);
            if (existingPrefix === prefix) {
                SelAndEntryImpl.changeTextDeleteSelection(thisline, linestart, linestart + prefix.length);
            } else {
                let [tnew, p1, p2] = SelAndEntryImpl.changeTextInsert(
                    thisline,
                    linestart,
                    linestart,
                    prefix,
                    defaultFont
                );
                thisline.deleteAll();
                thisline.append(tnew);
            }
        };

        return Lines.alterSelectedLines(t, ncaret, nend, cb);
    }

    static getLeftRight(
        t: FormattedText,
        n: number,
        isLeft: boolean,
        isUntilWord: boolean,
        includeTrailingSpace: boolean
    ) {
        return GetCharClass.getLeftRight(
            (i: number) => t.charAt(i),
            t.len(),
            n,
            isLeft,
            isUntilWord,
            includeTrailingSpace
        );
    }
}
