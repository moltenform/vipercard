
/* auto */ import { ScrollConsts } from './../utils/utilsDrawConstants';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../utils/util512AssertCustom';
/* auto */ import { Util512, last, lastIfThere, slength } from './../utils/util512';
/* auto */ import { UI512Lines } from './../textedit/ui512TextLines';
/* auto */ import { FormattedText } from './../draw/ui512FormattedText';
/* auto */ import { UI512ElTextField } from './../elements/ui512ElementTextField';
/* auto */ import { TextFontStyling, specialCharNumNewline, textFontStylingToString } from './../draw/ui512DrawTextClasses';
/* auto */ import { UI512DrawText } from './../draw/ui512DrawText';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * automatically indent code,
 * to make editing code more convenient
 * can helpfully indicate source of syntax errors if code isn't lining up as expected.
 * also auto-closes clauses, e.g. automatically adds "end if" to match an "if"
 */
export class UI512AutoIndent {
    /* ending a line with one of these characters will continue statement onto next line */
    lineContinuation = ['\\'];

    /* pattern matching. start pattern, end pattern, and end-to-automatically-insert */
    linesCauseIndent: [RegExp, RegExp, string][] = [
        [/^start1\b/, /^end1\b/, 'end1'],
        [/^start\s+b2\b/, /^end\s+b2\b/, 'end'],
        [/^start\s+b2\b/, /^end\s+b2\b/, 'end'],
        [/^on\s+(\w+)\b/, /^end\s+%MATCH%\b/, 'end %MATCH%']
    ];

    caseSensitive = true;
    useTabs = true;
    useAutoIndent = true;
    useAutoCreateBlock = true;

    /**
     * in many languages you can continue a long statement to the next line with a backslash
     */
    protected lineIsContinuation(s: string) {
        for (let i = 0, len = this.lineContinuation.length; i < len; i++) {
            let cont = this.lineContinuation[i];
            if (s.endsWith(cont) || s.endsWith(cont + '\n')) {
                return true;
            }
        }

        return false;
    }

    /**
     * does this line open a new block, for this specific prefix?
     */
    getLevelChangeIsStartNewBlock(
        s: string,
        stack: AutoIndentMatch[],
        st: RegExp,
        end: RegExp,
        endText: string
    ) {
        let matched = s.match(st);
        if (matched) {
            let nextWord = '';
            if (endText.includes('%MATCH%')) {
                assertTrue(
                    matched.length > 1,
                    '2s|the regex should have a 2nd group to capture next word'
                );
                if (matched[1].match(/^\w+$/)) {
                    nextWord = matched[1];
                }
            }

            let store = new AutoIndentMatch();
            store.startPattern = st;
            store.desiredEndPattern = new RegExp(
                end.source.replace(/%MATCH%/g, nextWord)
            );
            store.desiredEndText = endText.replace(/%MATCH%/g, nextWord);
            stack.push(store);
            return 1;
        }

        return 0;
    }

    /**
     * does this line end a block, for this specific prefix?
     */
    getLevelChangeIsEndOfBlock(s: string, stack: AutoIndentMatch[]) {
        let desiredMatch = last(stack);
        let matched = s.match(desiredMatch.desiredEndPattern);
        if (matched) {
            stack.pop();
            return -1;
        } else {
            return 0;
        }
    }

    /**
     * does this line start a new block, or end a block?
     */
    protected getLevelChange(
        sTrimmed: string,
        stack: AutoIndentMatch[]
    ): [boolean, boolean] {
        let isBlockStart = false;
        let isBlockEnd = false;
        sTrimmed = sTrimmed.trim();
        if (!this.caseSensitive) {
            sTrimmed = sTrimmed.toLowerCase();
        }

        /* are we starting a new block? */
        for (let [st, end, endInsert] of this.linesCauseIndent) {
            let rt = this.getLevelChangeIsStartNewBlock(
                sTrimmed,
                stack,
                st,
                end,
                endInsert
            );
            if (rt !== 0) {
                isBlockStart = true;
                break;
            }
        }

        /* are we finishing a block? */
        if (stack.length > 0) {
            let rt = this.getLevelChangeIsEndOfBlock(sTrimmed, stack);
            if (rt !== 0) {
                isBlockEnd = true;
            }
        }

        /* the same line can be both a block-start and block-end: an 'else' line */
        return [isBlockStart, isBlockEnd];
    }

    /**
     * main runAutoIndent method
     */
    runAutoIndentAll(el: UI512ElTextField) {
        if (!this.useAutoIndent) {
            return;
        }

        let lns = new UI512Lines(el.getFmTxt());
        let lnsAfterIndent = this.runAutoIndent(lns, el);
        let next = lnsAfterIndent.flatten();
        let flattxtcurrent = el.getFmTxt().toUnformatted();
        if (flattxtcurrent !== next.toUnformatted()) {
            el.setFmTxt(next);
        }
    }

    /**
     * run autoIndent for a set of lines of code
     */
    protected runAutoIndent(lns: UI512Lines, el: UI512ElTextField): UI512Lines {
        let len = el.getFmTxt().len();
        let [outLns, outSelCaret, outSelEnd] = this.runAutoIndentImpl(
            lns,
            el.getN('selcaret'),
            el.getN('selend'),
            len,
            true
        );

        el.set('selcaret', outSelCaret);
        el.set('selend', outSelEnd);
        return outLns;
    }

    /**
     * set the indentation of a line
     */
    protected lineSetIndent(s: string, n: number) {
        s = s.replace(/^[ \t]+/g, '');
        let space = this.useTabs
            ? '\t'
            : Util512.repeat(ScrollConsts.TabSize, ' ').join('');
        for (let i = 0; i < n; i++) {
            s = space + s;
        }

        return s;
    }

    /**
     * auto indent implemetation
     */
    protected runAutoIndentImpl(
        lns: UI512Lines,
        selCaret: number,
        selEnd: number,
        len: number,
        attemptInsertText: boolean
    ): [UI512Lines, number, number] {
        let wasEnd = selCaret >= len;
        let currentline = lns.indexToLineNumber(selCaret);
        let lnsOut = new UI512Lines(FormattedText.newFromSerialized(''));
        lnsOut.lns = [];

        let level = 0;
        let overrideLevel: O<number> = undefined;
        let lastUnclosedDelta = 0;
        let lastUnclosedMatch: O<AutoIndentMatch>;

        /* store levels in a stack, an open pushes onto the stack, a close pops from the stack */
        let stack: AutoIndentMatch[] = [];
        for (let i = 0; i < lns.lns.length; i++) {
            let s = lns.getLineUnformatted(i);
            let isContinuation = this.lineIsContinuation(s);
            let [isBlockStart, isBlockEnd] = this.getLevelChange(s, stack);

            /* make a record of the indentation state of the 'current' line where the caret it */
            if (i === currentline - 1 && !isContinuation && isBlockStart) {
                lastUnclosedDelta = 1;
                lastUnclosedMatch = lastIfThere(stack);
            }

            /* decrease the indentation if we ended a block */
            if (isBlockEnd) {
                level -= 1;
            }

            s = this.lineSetIndent(
                s,
                overrideLevel !== undefined ? overrideLevel : level
            );
            s = UI512DrawText.setFont(s, UI512CompCodeEditorFont.font);
            lnsOut.lns[i] = FormattedText.newFromSerialized(s);
            overrideLevel = isContinuation ? level + 1 : undefined;

            /* increase the indentation if we started a block */
            if (isBlockStart) {
                level += 1;
            }
        }

        /* if phrases are unbalanced, let's see if we can auto-fix the problem! */
        if (level !== 0 && attemptInsertText) {
            if (
                this.createAutoBlock(
                    lnsOut,
                    currentline,
                    lastUnclosedMatch,
                    lastUnclosedDelta
                )
            ) {
                /* do a second pass on indentation */
                let newselcaret = lnsOut.lineNumberToLineEndIndex(currentline);
                return this.runAutoIndentImpl(
                    lnsOut,
                    newselcaret,
                    newselcaret,
                    lnsOut.length(),
                    false
                );
            }
        }

        assertEqWarn(lns.lns.length, lnsOut.lns.length, '2r|');
        assertWarn(currentline < lnsOut.lns.length, '2q|invalid currentline');
        let index = lnsOut.lineNumberToLineEndIndex(currentline);
        return [lnsOut, index, index];
    }

    /**
     * automatically add code to close the block!
     * if you type 'if', automatically adds the 'end if'
     */
    createAutoBlock(
        lnsOut: UI512Lines,
        currentLine: number,
        lastEncounteredDesiredMatch: O<AutoIndentMatch>,
        delta: number
    ) {
        if (delta !== 1 || !lastEncounteredDesiredMatch || !this.useAutoCreateBlock) {
            return false;
        } else if (!slength(lastEncounteredDesiredMatch.desiredEndText)) {
            return false;
        }

        /* we'll do a second pass later to correct the indentation */
        let s = UI512DrawText.setFont(
            lastEncounteredDesiredMatch.desiredEndText,
            UI512CompCodeEditorFont.font
        );

        /* are we on the very last line? then don't add a newline character */
        if (currentLine >= lnsOut.lns.length - 1) {
            lnsOut.lns[currentLine].push(
                specialCharNumNewline,
                UI512CompCodeEditorFont.font
            );
        } else {
            s += '\n';
        }

        let txt = FormattedText.newFromSerialized(s);
        lnsOut.lns.splice(currentLine + 1, 0, txt);
        return true;
    }
}

/**
 * defaults for the code editor font
 */
export class UI512CompCodeEditorFont {
    static face = 'monaco';
    static style = TextFontStyling.Default;
    static size = 9;
    static font = `${UI512CompCodeEditorFont.face}_${
        UI512CompCodeEditorFont.size
    }_${textFontStylingToString(UI512CompCodeEditorFont.style)}`;
}

/**
 * struct holding regex match information
 */
class AutoIndentMatch {
    startPattern: RegExp;
    desiredEndPattern: RegExp;
    desiredEndText: string;
}
