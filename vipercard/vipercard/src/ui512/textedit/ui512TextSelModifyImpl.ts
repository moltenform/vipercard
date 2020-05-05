
/* auto */ import { ScrollConsts } from './../utils/utilsDrawConstants';
/* auto */ import { GetCharClass } from './../utils/util512Higher';
/* auto */ import { assertTrue } from './../utils/util512Assert';
/* auto */ import { Util512, fitIntoInclusive } from './../utils/util512';
/* auto */ import { UI512Lines } from './ui512TextLines';
/* auto */ import { FormattedText } from './../drawtext/ui512FormattedText';
/* auto */ import { specialCharNumNewline } from './../drawtext/ui512DrawTextClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * modifications of selection and content within a text field
 *
 * "caret" is the start of selection. 0-based. ok if one past the length of content.
 * "end" is the end of selection. 0-based. ok if past the length of content.
 * end can be before caret if, say, you drag from right to left to select text, or hit Shift-left.
 * if caret === end, the selection is zero-width, and we'll show a blinking caret marker
 * if caret !== end, there is selected text you can copy, and we'll highlight the selection
 *
 * functions in this class return a tuple [newSelCaret, newSelEnd]
 *
 * this class works on an abstract caret and end, as used by the _SelAndEntry_ class
 * isExtend means to extend the selection, e.g. when the Shift key is held.
 * isUntilWord means to extend until next word, e.g. when the Cmd key is held.
 */
export class TextSelModifyImpl {
    /**
     * select all
     * returns the tuple [newSelCaret, newSelEnd]
     */
    static changeSelSelectAll(
        t: FormattedText,
        nCaret: number,
        nEnd: number
    ): [number, number] {
        return [0, t.len()];
    }

    /**
     * when you press Cmd+Home, go to first char in the field
     * when you press Cmd+End, go to the last char in the field
     * returns the tuple [newSelCaret, newSelEnd]
     */
    static changeSelGoDocHomeEnd(
        t: FormattedText,
        nCaret: number,
        nEnd: number,
        isLeft: boolean,
        isExtend: boolean
    ): [number, number] {
        let nextCaret = isLeft ? 0 : t.len();
        let nextEnd = isExtend ? nEnd : nextCaret;
        return [nextCaret, nextEnd];
    }

    /**
     * when you press Home, go to first char in the line
     * when you press End, go to the last char in the line
     */
    static changeSelGoLineHomeEnd(
        t: FormattedText,
        nCaret: number,
        nEnd: number,
        isLeft: boolean,
        isExtend: boolean
    ): [number, number] {
        let lines = new UI512Lines(t);
        let lineNumber = lines.indexToLineNumber(nCaret);
        if (isLeft) {
            /* if you press Home on an indented line, go to first non-whitepace */
            let startOfLine = lines.lineNumberToIndex(lineNumber);
            let startOfLineNonSpace =
                startOfLine +
                UI512Lines.getNonSpaceStartOfLine(lines.lns[lineNumber], true);
            let nextCaret =
                nCaret <= startOfLineNonSpace ? startOfLine : startOfLineNonSpace;
            let nextEnd = isExtend ? nEnd : nextCaret;
            return [nextCaret, nextEnd];
        } else {
            let nextCaret = lines.lineNumberToLineEndIndex(lineNumber);
            let nextEnd = isExtend ? nEnd : nextCaret;
            return [nextCaret, nextEnd];
        }
    }

    /**
     * when you press left or right, change selection
     */
    static changeSelLeftRight(
        t: FormattedText,
        nCaret: number,
        nEnd: number,
        isLeft: boolean,
        isExtend: boolean,
        isUntilWord: boolean
    ): [number, number] {
        let nextCaret = TextSelModifyImpl.getLeftRight(
            t,
            nCaret,
            isLeft,
            isUntilWord,
            true
        );
        let nextEnd = isExtend ? nEnd : nextCaret;
        return [nextCaret, nextEnd];
    }

    /**
     * when you, say, double click on a word, select the word
     */
    static changeSelCurrentWord(
        t: FormattedText,
        nCaret: number,
        nEnd: number
    ): [number, number] {
        /* essentially emulate hitting Ctrl-Right then Ctrl-Shift-Left */
        /* except that the intitial Ctrl-Right does not include trailing space */
        let endword = TextSelModifyImpl.getLeftRight(t, nCaret, false, true, false);
        let nextCaret = TextSelModifyImpl.getLeftRight(t, endword, true, true, false);
        return [nextCaret, endword];
    }

    /**
     * what happens when you type a letter in a field?
     * we have to erase any content that was selected
     * we'll use font of adjacent character, but if field is empty, fall back to defaultFont
     */
    static changeTextInsert(
        t: FormattedText,
        nCaret: number,
        nEnd: number,
        sToInsert: string,
        defaultFont: string
    ): [FormattedText, number, number] {
        let font: string;
        let getFontFrom = Math.max(0, nCaret - 1);
        if (t.len() === 0) {
            font = defaultFont;
        } else if (getFontFrom >= 0 && getFontFrom < t.len()) {
            font = t.fontAt(getFontFrom);
        } else {
            font = t.fontAt(t.len() - 1);
        }

        let higher = Math.max(nCaret, nEnd);
        let lower = Math.min(nCaret, nEnd);
        let newTxt = FormattedText.byInsertion(t, lower, higher - lower, sToInsert, font);
        return [newTxt, lower + sToInsert.length, lower + sToInsert.length];
    }

    /**
     * what happens when there's selected text and you hit delete?
     */
    static changeTextDeleteSelection(
        t: FormattedText,
        nCaret: number,
        nEnd: number
    ): [FormattedText, number, number] {
        let higher = Math.max(nCaret, nEnd);
        let lower = Math.min(nCaret, nEnd);
        t.splice(lower, higher - lower);
        return [t, lower, lower];
    }

    /**
     * delete leftwards if you hit backspace
     */
    static changeTextBackspace(
        t: FormattedText,
        nCaret: number,
        nEnd: number,
        isLeft: boolean,
        isUntilWord: boolean
    ): [FormattedText, number, number] {
        if (t.len() === 0) {
            return [t, nCaret, nEnd];
        }

        if (nCaret === nEnd) {
            /* hitting backspace is equal to hitting shift-left and deleting the selection */
            [nCaret, nEnd] = TextSelModifyImpl.changeSelLeftRight(
                t,
                nCaret,
                nEnd,
                isLeft,
                true,
                isUntilWord
            );
        }

        return TextSelModifyImpl.changeTextDeleteSelection(t, nCaret, nEnd);
    }

    /**
     * duplicate the current line
     */
    static changeTextDuplicate(
        t: FormattedText,
        nCaret: number,
        nEnd: number
    ): [FormattedText, number, number] {
        if (t.len() === 0) {
            return [t, nCaret, nEnd];
        }

        /* let's just duplicate the line where the caret is at */
        let index = nCaret;
        let lines = new UI512Lines(t);
        let linenumbertoDupe = lines.indexToLineNumber(index);
        let ln = lines.lns[linenumbertoDupe];
        let lncopy = ln.clone();
        if (ln.len() === 0) {
            /* it's the last line and empty, just exit for simplicity */
            return [t, nCaret, nEnd];
        } else if (ln.charAt(ln.len() - 1) !== specialCharNumNewline) {
            /* it's the last line, so add a \n */
            ln.push(specialCharNumNewline, ln.fontAt(ln.len() - 1));
            ln.append(lncopy);
        } else {
            ln.append(lncopy);
        }

        return [lines.flatten(), index, index];
    }

    /**
     * delete the current line
     */
    static changeTextDeleteLine(
        t: FormattedText,
        nCaret: number,
        nEnd: number
    ): [FormattedText, number, number] {
        if (t.len() === 0) {
            return [t, nCaret, nEnd];
        }

        let lines = new UI512Lines(t);
        let lineNumber = lines.indexToLineNumber(nCaret);
        assertTrue(lines.lns.length > 0, '2<|lines.lns is empty');
        if (lineNumber >= lines.lns.length - 1) {
            /* be careful, it's the last line */
            lines.lns.splice(lineNumber, 1);
            let tNew = lines.flatten();
            return [tNew, tNew.len(), tNew.len()];
        } else {
            lines.lns.splice(lineNumber, 1);
            let nextCaret = lines.lineNumberToIndex(lineNumber);
            return [lines.flatten(), nextCaret, nextCaret];
        }
    }

    /**
     * for a single line, add or remove whitespace
     */
    static setIndentLevel(
        t: FormattedText,
        level: number,
        preferTab: boolean,
        defaultFont: string
    ) {
        let space = preferTab ? '\t' : Util512.repeat(ScrollConsts.TabSize, ' ').join('');
        /* 1) erase all current whitespace */
        let countCharsToDelete = UI512Lines.getNonSpaceStartOfLine(t, true);
        t.splice(0, countCharsToDelete);

        /* 2) add spaces */
        assertTrue(level >= 0, '2;|negative level');
        let added = Util512.repeat(level, space).join('');
        let tNew = TextSelModifyImpl.changeTextInsert(t, 0, 0, added, defaultFont)[0];
        return tNew;
    }

    /**
     * for one or more lines, add or remove whitespace
     */
    static changeTextIndentation(
        t: FormattedText,
        nCaret: number,
        nEnd: number,
        isLeft: boolean,
        defaultFont: string
    ): [FormattedText, number, number] {
        if (t.len() === 0) {
            return [t, nCaret, nEnd];
        }

        /* let's do a batch indent/dedent */
        let cb = (line: FormattedText) => {
            let level = UI512Lines.getIndentLevel(line);
            level += isLeft ? -1 : 1;
            level = Math.max(0, level);
            let newline = TextSelModifyImpl.setIndentLevel(
                line,
                level,
                true,
                defaultFont
            );
            line.deleteAll();
            line.append(newline);
        };

        return UI512Lines.alterSelectedLines(t, nCaret, nEnd, cb);
    }

    /**
     * add or remove a prefix from any number of selected lines,
     * e.g. hitting Cmd+Q to comment out lines
     */
    static changeTextToggleLinePrefix(
        t: FormattedText,
        nCaret: number,
        nEnd: number,
        prefix: string,
        defaultFont: string
    ): [FormattedText, number, number] {
        assertTrue(
            !prefix.startsWith(' ') &&
                !prefix.startsWith('\t') &&
                !prefix.startsWith('\n'),
            `2:|we don't support prefix that starts with whitespace but got ${prefix}`
        );

        if (t.len() === 0) {
            return [t, nCaret, nEnd];
        }

        let cb = (line: FormattedText) => {
            let lineStart = UI512Lines.getNonSpaceStartOfLine(line, false);
            let existingPrefix = line.toUnformattedSubstr(lineStart, prefix.length);
            if (existingPrefix === prefix) {
                /* prefix is there, remove it */
                TextSelModifyImpl.changeTextDeleteSelection(
                    line,
                    lineStart,
                    lineStart + prefix.length
                );
            } else {
                /* no prefix, add it */
                let tNew = TextSelModifyImpl.changeTextInsert(
                    line,
                    lineStart,
                    lineStart,
                    prefix,
                    defaultFont
                )[0];
                line.deleteAll();
                line.append(tNew);
            }
        };

        return UI512Lines.alterSelectedLines(t, nCaret, nEnd, cb);
    }

    /**
     * toggle block comment
     */
    static changeTextToggleBlockComment(
        t: FormattedText,
        nCaretRaw: number,
        nEndRaw: number,
        startChars: string,
        endChars: string,
        defaultFont: string
    ): [FormattedText, number, number] {
        if (t.len() === 0) {
            return [t, nCaretRaw, nEndRaw];
        }

        let nCaret = Math.min(nCaretRaw, nEndRaw)
        let nEnd = Math.max(nCaretRaw, nEndRaw)
        nCaret = fitIntoInclusive(nCaret, 0, t.len()-1)
        nEnd = fitIntoInclusive(nEnd, 0, t.len()-1)
        let unformatted = t.toUnformattedSubstr(nCaret, nEnd-nCaret)
        if (unformatted.startsWith(startChars) && unformatted.endsWith(endChars)) {
            /* already commented. remove the comment */
            t.splice(nEnd - endChars.length, endChars.length)
            t.splice(nCaret, startChars.length)
            return [t, nCaret, nEnd - (startChars.length + endChars.length)]
        } else {
            /* add the comment */
            t = FormattedText.byInsertion(t, nEnd, 0, endChars, t.fontAt(nEnd))
            t = FormattedText.byInsertion(t, nCaret, 0, startChars, t.fontAt(nCaret))
            if (nCaret === nEnd) {
                /* conveniently position the caret */
                return [t, nCaret + startChars.length, nCaret + startChars.length]
            } else {
                /* leave it selected */
                return [t, nCaret, nEnd + startChars.length + endChars.length]
            }
        }
    }

    /**
     * move left or right in a text editor, with support for moving until next word boundary.
     * returns the next caret position.
     */
    static getLeftRight(
        t: FormattedText,
        nCaret: number,
        isLeft: boolean,
        isUntilWord: boolean,
        includeTrailingSpace: boolean
    ) {
        return GetCharClass.getLeftRight(
            (i: number) => t.charAt(i),
            t.len(),
            nCaret,
            isLeft,
            isUntilWord,
            includeTrailingSpace
        );
    }
}
