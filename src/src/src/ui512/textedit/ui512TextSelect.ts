
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { specialCharNumNewline } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512PresenterWithMenu.js';
/* auto */ import { UI512Lines } from '../../ui512/textedit/ui512TextLines.js';
/* auto */ import { GenericTextField } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { ScrollbarImpl } from '../../ui512/textedit/ui512Scrollbar.js';
/* auto */ import { SelAndEntryImpl } from '../../ui512/textedit/ui512TextSelectClasses.js';

export class SelAndEntry {
    protected static readOnlyScrollbarImpl = new ScrollbarImpl();
    static getSelectedField(c: UI512PresenterWithMenuInterface): O<UI512ElTextField> {
        if (!c.getCurrentFocus()) {
            return undefined;
        }

        let el = c.app.findElemById(c.getCurrentFocus());
        if (!(el && el instanceof UI512ElTextField && el.get_b('canselecttext'))) {
            return undefined;
        }

        return el;
    }

    protected static changeTextInField(
        el: GenericTextField,
        fn: (t: FormattedText, ncaret: number, nend: number) => [FormattedText, number, number]
    ) {
        if (!el.canEdit() || !el.canSelectText()) {
            return;
        }

        let tRead = el.getFmtTxt();
        let tWritable = tRead.getUnlockedCopy();
        SelAndEntry.validatestartstop(el);
        let [selcaretBefore, selendBefore] = el.getSel();
        let [tResult, nCaret, nEnd] = fn(tWritable, selcaretBefore, selendBefore);
        el.setFmtTxt(tResult, ChangeContext.Default);
        el.setSel(nCaret, nEnd);
        SelAndEntry.validatestartstop(el);

        if (!el.isMultiline()) {
            assertEq(
                -1,
                tResult.indexOf(specialCharNumNewline),
                `2/|fld ${el.getID()} is not multiline but has newline ${tResult.toSerialized()}`
            );
        }

        let amt = SelAndEntry.readOnlyScrollbarImpl.getScrollPosThatWouldMakeStartCaretVisible(
            el.getReadOnlyUI512()
        );
        el.setScrollAmt(amt);
    }

    protected static changeSelInField(
        el: GenericTextField,
        fn: (t: FormattedText, ncaret: number, nend: number) => [number, number]
    ) {
        /* pass a copy of the formatted text so that if it is accidentally modified, changes are just ignored */
        SelAndEntry.validatestartstop(el);
        let t = el.getFmtTxt();
        if (t.len() && el.canSelectText()) {
            let [ncaretBefore, nendBefore] = el.getSel();
            let [nextCaret, nextEnd] = fn(t, ncaretBefore, nendBefore);
            el.setSel(nextCaret, nextEnd);
            SelAndEntry.validatestartstop(el);
            let amt = SelAndEntry.readOnlyScrollbarImpl.getScrollPosThatWouldMakeStartCaretVisible(
                el.getReadOnlyUI512()
            );
            el.setScrollAmt(amt);
        }
    }

    static validatestartstop(el: GenericTextField) {
        let [ncaret, nend] = el.getSel();
        ncaret = fitIntoInclusive(ncaret, 0, el.getFmtTxt().len());
        nend = fitIntoInclusive(nend, 0, el.getFmtTxt().len());
        el.setSel(ncaret, nend);
    }

    static changeSelSelectAll(el: GenericTextField) {
        SelAndEntry.changeSelInField(el, SelAndEntryImpl.changeSelSelectAll);
    }

    static changeTextBackspace(el: GenericTextField, isLeft: boolean, isUntilWord: boolean) {
        SelAndEntry.changeTextInField(el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextBackspace(t, ncaret, nend, isLeft, isUntilWord)
        );
    }

    static changeTextDuplicate(el: GenericTextField) {
        if (el.isMultiline()) {
            SelAndEntry.changeTextInField(el, (t, ncaret, nend) =>
                SelAndEntryImpl.changeTextDuplicate(t, ncaret, nend)
            );
        }
    }

    static changeTextDeleteLine(el: GenericTextField) {
        SelAndEntry.changeTextInField(el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextDeleteLine(t, ncaret, nend)
        );
    }

    static changeTextIndentation(el: GenericTextField, isLeft: boolean) {
        SelAndEntry.changeTextInField(el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextIndentation(t, ncaret, nend, isLeft, el.getDefaultFont())
        );
    }

    static changeTextToggleLinePrefix(el: GenericTextField, prefix: string) {
        SelAndEntry.changeTextInField(el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextToggleLinePrefix(t, ncaret, nend, prefix, el.getDefaultFont())
        );
    }

    static changeTextInsert(el: GenericTextField, s: string) {
        if (!el.isMultiline()) {
            s = s.split('\n')[0];
        }

        SelAndEntry.changeTextInField(el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextInsert(t, ncaret, nend, s, el.getDefaultFont())
        );
    }

    static changeSelLeftRight(
        el: GenericTextField,
        isLeft: boolean,
        isExtend: boolean,
        isUntilWord: boolean
    ) {
        SelAndEntry.changeSelInField(el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeSelLeftRight(t, ncaret, nend, isLeft, isExtend, isUntilWord)
        );
    }

    static changeSelCurrentWord(el: GenericTextField) {
        SelAndEntry.changeSelInField(el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeSelCurrentWord(t, ncaret, nend)
        );
    }

    static changeSelGoLineHomeEnd(el: GenericTextField, isLeft: boolean, isExtend: boolean) {
        SelAndEntry.changeSelInField(el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeSelGoLineHomeEnd(t, ncaret, nend, isLeft, isExtend)
        );
    }

    static changeSelGoDocHomeEnd(el: GenericTextField, isLeft: boolean, isExtend: boolean) {
        SelAndEntry.changeSelInField(el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeSelGoDocHomeEnd(t, ncaret, nend, isLeft, isExtend)
        );
    }

    static changeSelPageUpDown(el: GenericTextField, isUp: boolean, isExtend: boolean) {
        let [ncaret, nend] = el.getSel();
        let approxLineHeight = SelAndEntry.readOnlyScrollbarImpl.getApproxLineHeight(
            el.getReadOnlyUI512(),
            ncaret
        );
        if (approxLineHeight) {
            /* go about one line less than the amount of lines per page, and minimum of one line */
            let linesPerPage = Math.floor(el.getHeight() / approxLineHeight);
            linesPerPage = Math.max(1, linesPerPage - 1);
            for (let i = 0; i < linesPerPage; i++) {
                SelAndEntry.changeSelArrowKeyUpDownVisual(el, isUp, isExtend);
            }
        }
    }

    static mouseClickPositionToSetCaret(el: GenericTextField, x: number, y: number, isExtend: boolean) {
        SelAndEntry.changeSelInField(el, (t, ncaret, nend) => {
            let index = SelAndEntry.readOnlyScrollbarImpl.fromMouseCoordsToCaretPosition(el.getReadOnlyUI512(), x, y);
            if (index !== undefined) {
                if (isExtend) {
                    return [index, nend];
                } else {
                    return [index, index];
                }
            } else {
                return [ncaret, nend];
            }
        });
    }

    static mouseClickPositionAdjustSelection(el: GenericTextField, x: number, y: number) {
        SelAndEntry.changeSelInField(el, (t, ncaret, nend) => {
            let index = SelAndEntry.readOnlyScrollbarImpl.fromMouseCoordsToCaretPosition(el.getReadOnlyUI512(), x, y);
            if (index !== undefined) {
                return [index, nend];
            } else {
                return [ncaret, nend];
            }
        });
    }

    static mouseClickSelectByLines(el: GenericTextField, x: number, y: number) {
        let [selcaretBefore, selendBefore] = el.getSel();
        this.mouseClickPositionToSetCaret(el, x, y, false);
        SelAndEntry.changeSelInField(el, (t, ncaret, nend) => {
            if (el.getFmtTxt().len() > 0 && (ncaret !== selcaretBefore || nend !== selendBefore)) {
                let lines = new UI512Lines(el.getFmtTxt());
                let linenumber = lines.indexToLineNumber(ncaret);
                let [newncaret, newnend] = [
                    lines.lineNumberToIndex(linenumber),
                    lines.lineNumberToLineEndIndex(linenumber) + 1,
                ];
                if (newnend - newncaret > 1) {
                    /* only allow a line to be selected if it's not empty. */
                    return [newncaret, newnend];
                }
            }

            return [selcaretBefore, selendBefore];
        });
    }

    static selectLineInField(el: GenericTextField, n: number) {
        SelAndEntry.changeSelInField(el, (t, ncaret, nend) => {
            let txt = el.getFmtTxt();
            if (txt.len() > 0) {
                let [linestart, lineend] = UI512Lines.fastLineNumberAndEndToIndex(txt, n);
                return [linestart, lineend];
            } else {
                return [ncaret, nend];
            }
        });
    }

    static selectByLinesWhichLine(el: GenericTextField) {
        let [selcaret, selend] = el.getSel();
        if (selcaret === selend || el.getFmtTxt().len() === 0) {
            return undefined;
        } else {
            let lines = new UI512Lines(el.getFmtTxt());
            return lines.indexToLineNumber(selcaret);
        }
    }

    static changeSelArrowKeyUpDownVisual(gel: GenericTextField, isUp: boolean, isExtend: boolean) {
        /* if the field is wrapped and you hit the "up" arrow key, what should happen?
        it looks like most text editors do this purely visually --
        it's not the number of chars from the newline,
        or the number of chars from the left side of the field,
        but the letter that happens to be rendered above the current letter. */
        const pixelUpwardsToLook = 4;
        SelAndEntry.changeSelInField(gel, (t, ncaret, nend) => {
            let bounds = SelAndEntry.readOnlyScrollbarImpl.getCharacterInFieldToPosition(
                gel.getReadOnlyUI512(),
                ncaret
            );
            if (bounds && bounds.length > 0) {
                /* find a location above the middle of the letter */
                let middle = bounds[0] + Math.floor(bounds[2] / 2);
                let above = isUp ? bounds[1] - pixelUpwardsToLook : bounds[1] + bounds[3] + pixelUpwardsToLook;
                let [found, lowest] = SelAndEntry.readOnlyScrollbarImpl.getCoordToCharInField(
                    gel.getReadOnlyUI512(),
                    middle,
                    above,
                    true
                );

                if (found) {
                    let nextcaret = found.charIndex;
                    let nextend = isExtend ? nend : nextcaret;
                    return [nextcaret, nextend];
                }
            }
            return [ncaret, nend];
        });
    }

    static getSelectedText(el: GenericTextField) {
        if (el.canSelectText()) {
            SelAndEntry.validatestartstop(el);
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
