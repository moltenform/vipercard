
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, fitIntoInclusive } from '../../ui512/utils/utils512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { specialCharNumNewline } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512PresenterWithMenu.js';
/* auto */ import { UI512Lines } from '../../ui512/textedit/ui512TextLines.js';
/* auto */ import { GenericTextField } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { ScrollbarImpl } from '../../ui512/textedit/ui512Scrollbar.js';
/* auto */ import { TextSelModifyImpl } from '../../ui512/textedit/ui512TextSelModifyImpl.js';

/**
 * modifications of selection and content within a text field
 *
 * uses TextSelModifyImpl to respond to events that change selection and content
 */
export class TextSelModify {
    protected static readOnlyScrollbarImpl = new ScrollbarImpl();

    /**
     * get field that has focus
     */
    static getSelectedField(pr: UI512PresenterWithMenuInterface): O<UI512ElTextField> {
        if (!pr.getCurrentFocus()) {
            return undefined;
        }

        let el = pr.app.findEl(pr.getCurrentFocus());
        if (!(el && el instanceof UI512ElTextField && el.getB('canselecttext'))) {
            return undefined;
        }

        return el;
    }

    /**
     * helper function for changing text in a field,
     * makes sure that the field can be edited,
     * makes sure that the caret positions are valid after calling the function,
     * and makes sure that a single-line field doesn't have newlines.
     * also sets the scroll to make the caret visible, which feels important to user
     */
    protected static changeTextInField(
        el: GenericTextField,
        fn: (t: FormattedText, nCaret: number, nEnd: number) => [FormattedText, number, number]
    ) {
        if (!el.canEdit() || !el.canSelectText()) {
            return;
        }

        let tRead = el.getFmtTxt();
        let tWritable = tRead.getUnlockedCopy();
        TextSelModify.fixSelection(el);
        let [selCaretBefore, selEndBefore] = el.getSel();
        let [tResult, nCaret, nEnd] = fn(tWritable, selCaretBefore, selEndBefore);
        el.setFmtTxt(tResult, ChangeContext.Default);
        el.setSel(nCaret, nEnd);
        TextSelModify.fixSelection(el);

        if (!el.isMultiline()) {
            assertEq(
                -1,
                tResult.indexOf(specialCharNumNewline),
                `2/|fld ${el.getID()} is not multiline but has newline ${tResult.toSerialized()}`
            );
        }

        let amt = TextSelModify.readOnlyScrollbarImpl.getScrollPosThatWouldMakeStartCaretVisible(el.getReadOnlyUI512());
        el.setScrollAmt(amt);
    }

    /**
     * helper function for changing selection in a field,
     * makes sure field can have selection changed,
     * makes sure that the caret positions are valid after calling the function,
     * also sets the scroll to make the caret visible, which feels important to user
     */
    protected static changeSelInField(
        el: GenericTextField,
        fn: (t: FormattedText, nCaret: number, nEnd: number) => [number, number]
    ) {
        TextSelModify.fixSelection(el);
        let t = el.getFmtTxt();

        /* lock the text, so it can't be accidentally modified */
        t.lock();
        if (t.len() && el.canSelectText()) {
            let [ncaretBefore, nEndBefore] = el.getSel();
            let [nextCaret, nextEnd] = fn(t, ncaretBefore, nEndBefore);
            el.setSel(nextCaret, nextEnd);
            TextSelModify.fixSelection(el);
            let amt = TextSelModify.readOnlyScrollbarImpl.getScrollPosThatWouldMakeStartCaretVisible(
                el.getReadOnlyUI512()
            );
            el.setScrollAmt(amt);
        }
    }

    /**
     * fixes the selection in case it extended beyond content
     * note that going one character beyond the content is fine, though
     */
    static fixSelection(el: GenericTextField) {
        let [nCaret, nEnd] = el.getSel();
        nCaret = fitIntoInclusive(nCaret, 0, el.getFmtTxt().len());
        nEnd = fitIntoInclusive(nEnd, 0, el.getFmtTxt().len());
        el.setSel(nCaret, nEnd);
    }

    /**
     * select all
     */
    static changeSelSelectAll(el: GenericTextField) {
        TextSelModify.changeSelInField(el, TextSelModifyImpl.changeSelSelectAll);
    }

    /**
     * delete leftwards if you hit backspace
     */
    static changeTextBackspace(el: GenericTextField, isLeft: boolean, isUntilWord: boolean) {
        TextSelModify.changeTextInField(el, (t, nCaret, nEnd) =>
            TextSelModifyImpl.changeTextBackspace(t, nCaret, nEnd, isLeft, isUntilWord)
        );
    }

    /**
     * duplicate the current line
     */
    static changeTextDuplicate(el: GenericTextField) {
        if (el.isMultiline()) {
            TextSelModify.changeTextInField(el, (t, nCaret, nEnd) =>
                TextSelModifyImpl.changeTextDuplicate(t, nCaret, nEnd)
            );
        }
    }

    /**
     * delete the current line
     */
    static changeTextDeleteLine(el: GenericTextField) {
        TextSelModify.changeTextInField(el, (t, nCaret, nEnd) =>
            TextSelModifyImpl.changeTextDeleteLine(t, nCaret, nEnd)
        );
    }

    /**
     * for one or more lines, add or remove whitespace
     */
    static changeTextIndentation(el: GenericTextField, isLeft: boolean) {
        TextSelModify.changeTextInField(el, (t, nCaret, nEnd) =>
            TextSelModifyImpl.changeTextIndentation(t, nCaret, nEnd, isLeft, el.getDefaultFont())
        );
    }

    /**
     * add or remove a prefix from any number of selected lines, e.g. hitting Cmd+Q to comment out lines
     */
    static changeTextToggleLinePrefix(el: GenericTextField, prefix: string) {
        TextSelModify.changeTextInField(el, (t, nCaret, nEnd) =>
            TextSelModifyImpl.changeTextToggleLinePrefix(t, nCaret, nEnd, prefix, el.getDefaultFont())
        );
    }

    /**
     * what happens when you type a letter in a field
     */
    static changeTextInsert(el: GenericTextField, s: string) {
        if (!el.isMultiline()) {
            s = s.split('\n')[0];
        }

        TextSelModify.changeTextInField(el, (t, nCaret, nEnd) =>
            TextSelModifyImpl.changeTextInsert(t, nCaret, nEnd, s, el.getDefaultFont())
        );
    }

    /**
     * when you press left or right, change selection
     */
    static changeSelLeftRight(el: GenericTextField, isLeft: boolean, isExtend: boolean, isUntilWord: boolean) {
        TextSelModify.changeSelInField(el, (t, nCaret, nEnd) =>
            TextSelModifyImpl.changeSelLeftRight(t, nCaret, nEnd, isLeft, isExtend, isUntilWord)
        );
    }

    /**
     * when you press cmd+left or cmd+right, change selection
     */
    static changeSelCurrentWord(el: GenericTextField) {
        TextSelModify.changeSelInField(el, (t, nCaret, nEnd) =>
            TextSelModifyImpl.changeSelCurrentWord(t, nCaret, nEnd)
        );
    }

    /**
     * when you press Home, go to first char in the line
     */
    static changeSelGoLineHomeEnd(el: GenericTextField, isLeft: boolean, isExtend: boolean) {
        TextSelModify.changeSelInField(el, (t, nCaret, nEnd) =>
            TextSelModifyImpl.changeSelGoLineHomeEnd(t, nCaret, nEnd, isLeft, isExtend)
        );
    }

    /**
     * when you press Cmd+Home, go to first char in the field
     */
    static changeSelGoDocHomeEnd(el: GenericTextField, isLeft: boolean, isExtend: boolean) {
        TextSelModify.changeSelInField(el, (t, nCaret, nEnd) =>
            TextSelModifyImpl.changeSelGoDocHomeEnd(t, nCaret, nEnd, isLeft, isExtend)
        );
    }

    /**
     * move by one page
     */
    static changeSelPageUpDown(el: GenericTextField, isUp: boolean, isExtend: boolean) {
        let [nCaret, nEnd] = el.getSel();
        let approxLineHeight = TextSelModify.readOnlyScrollbarImpl.getApproxLineHeight(el.getReadOnlyUI512(), nCaret);
        if (approxLineHeight) {
            /* go about one line less than the amount of lines per page, and minimum of one line */
            let linesPerPage = Math.floor(el.getHeight() / approxLineHeight);
            linesPerPage = Math.max(1, linesPerPage - 1);
            for (let i = 0; i < linesPerPage; i++) {
                TextSelModify.changeSelArrowKeyUpDownVisual(el, isUp, isExtend);
            }
        }
    }

    /**
     * clicking in a text field, where to set the caret
     */
    static mouseClickCoordsToSetCaret(el: GenericTextField, x: number, y: number, isExtend: boolean) {
        TextSelModify.changeSelInField(el, (t, nCaret, nEnd) => {
            let index = TextSelModify.readOnlyScrollbarImpl.fromMouseCoordsToCaretPosition(el.getReadOnlyUI512(), x, y);
            if (index !== undefined) {
                if (isExtend) {
                    return [index, nEnd];
                } else {
                    return [index, index];
                }
            } else {
                return [nCaret, nEnd];
            }
        });
    }

    /**
     * clicking+dragging in a text field, where to set the caret
     */
    static mouseClickCoordsAdjustSelection(el: GenericTextField, x: number, y: number) {
        TextSelModify.changeSelInField(el, (t, nCaret, nEnd) => {
            let index = TextSelModify.readOnlyScrollbarImpl.fromMouseCoordsToCaretPosition(el.getReadOnlyUI512(), x, y);
            if (index !== undefined) {
                return [index, nEnd];
            } else {
                return [nCaret, nEnd];
            }
        });
    }

    /**
     * clicking in a lines choice field, we should select the entire line
     */
    static mouseClickSelectByLines(el: GenericTextField, x: number, y: number) {
        let [selcaretBefore, selendBefore] = el.getSel();
        this.mouseClickCoordsToSetCaret(el, x, y, false);
        TextSelModify.changeSelInField(el, (t, nCaret, nEnd) => {
            if (el.getFmtTxt().len() > 0 && (nCaret !== selcaretBefore || nEnd !== selendBefore)) {
                let lines = new UI512Lines(el.getFmtTxt());
                let lineNumber = lines.indexToLineNumber(nCaret);
                let [newncaret, newnend] = [
                    lines.lineNumberToIndex(lineNumber),
                    lines.lineNumberToLineEndIndex(lineNumber) + 1
                ];
                if (newnend - newncaret > 1) {
                    /* only allow a line to be selected if it's not empty. */
                    return [newncaret, newnend];
                }
            }

            return [selcaretBefore, selendBefore];
        });
    }

    /**
     * select the Nth line in a field, 0-based
     */
    static selectLineInField(el: GenericTextField, n: number) {
        TextSelModify.changeSelInField(el, (t, nCaret, nEnd) => {
            let txt = el.getFmtTxt();
            if (txt.len() > 0) {
                let [linestart, lineend] = UI512Lines.fastLineNumberAndEndToIndex(txt, n);
                return [linestart, lineend];
            } else {
                return [nCaret, nEnd];
            }
        });
    }

    /**
     * which line is selected?
     */
    static selectByLinesWhichLine(el: GenericTextField) {
        let [selcaret, selend] = el.getSel();
        if (selcaret === selend || el.getFmtTxt().len() === 0) {
            return undefined;
        } else {
            let lines = new UI512Lines(el.getFmtTxt());
            return lines.indexToLineNumber(selcaret);
        }
    }

    /**
     * respond to user hitting up or down.
     *
     * if the field is full of wrapped text, and the caret is in the middle,
     * with many line of text above it and below it,
     * and you hit the "up" arrow key, what should happen?
     *
     * a) "logical" the caret is 24 characters from the left, so we should go up
     * a line and move the caret to be 24 characters from the left
     *
     * b) "visual" the caret is 130 pixels from the left, so we should go up
     * a line and move the caret to be whatever happens to be 130 pixels from the left
     *
     * it looks like most text editors use method b)
     * so use that here.
     */
    static changeSelArrowKeyUpDownVisual(gel: GenericTextField, isUp: boolean, isExtend: boolean) {
        TextSelModify.changeSelInField(gel, (t, nCaret, nEnd) => {
            let bounds = TextSelModify.readOnlyScrollbarImpl.getCharacterInFieldToCoords(
                gel.getReadOnlyUI512(),
                nCaret
            );

            if (bounds && bounds.length > 0) {
                /* find a location above the middle of the letter */
                const pixelsExtendedPast = 4;
                let middle = bounds[0] + Math.floor(bounds[2] / 2);
                let above = isUp ? bounds[1] - pixelsExtendedPast : bounds[1] + bounds[3] + pixelsExtendedPast;
                let [found, lowest] = TextSelModify.readOnlyScrollbarImpl.getCoordToCharInField(
                    gel.getReadOnlyUI512(),
                    middle,
                    above,
                    true
                );

                if (found) {
                    let nextcaret = found.charIndex;
                    let nextend = isExtend ? nEnd : nextcaret;
                    return [nextcaret, nextend];
                }
            }
            return [nCaret, nEnd];
        });
    }

    /**
     * what text is selected, unformatted
     */
    static getSelectedText(el: GenericTextField) {
        if (el.canSelectText()) {
            TextSelModify.fixSelection(el);
            let t = el.getFmtTxt();
            let [p1, p2] = el.getSel();
            let pp1 = Math.min(p1, p2);
            let pp2 = Math.max(p1, p2);
            return t.toUnformattedSubstr(pp1, pp2 - pp1);
        } else {
            return '';
        }
    }
}
