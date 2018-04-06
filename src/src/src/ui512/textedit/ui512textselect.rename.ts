
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root, assertEq, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { specialCharNumNewline } from '../../ui512/draw/ui512drawtextclasses.js';
/* auto */ import { FormattedText, Lines } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512elementstextfield.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512presenterwithmenu.js';
/* auto */ import { IGenericTextField } from '../../ui512/textedit/ui512genericfield.js';
/* auto */ import { ScrollbarImpl } from '../../ui512/textedit/ui512scrollbar.js';
/* auto */ import { SelAndEntryImpl } from '../../ui512/textedit/ui512textselectclasses.js';

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
        root: Root,
        el: IGenericTextField,
        fn: (t: FormattedText, ncaret: number, nend: number) => [FormattedText, number, number]
    ) {
        if (!el.canEdit() || !el.canSelectText()) {
            return;
        }

        let tRead = el.getftxt();
        let tWritable = tRead.getUnlockedCopy();
        SelAndEntry.validatestartstop(el);
        let [selcaretBefore, selendBefore] = el.getSel();
        let [tResult, nCaret, nEnd] = fn(tWritable, selcaretBefore, selendBefore);
        el.setftxt(tResult, ChangeContext.Default);
        el.setSel(nCaret, nEnd);
        SelAndEntry.validatestartstop(el);

        if (!el.isMultiline()) {
            assertEq(
                -1,
                tResult.indexOf(specialCharNumNewline),
                `2/|fld ${el.identifier()} is not multiline but has newline ${tResult.toPersisted()}`
            );
        }

        let amt = SelAndEntry.readOnlyScrollbarImpl.getScrollPosThatWouldMakeStartCaretVisible(
            root,
            el.getReadonlyUi512()
        );
        el.setScrollAmt(amt);
    }

    protected static changeSelInField(
        root: Root,
        el: IGenericTextField,
        fn: (t: FormattedText, ncaret: number, nend: number) => [number, number]
    ) {
        // pass a copy of the formatted text so that if it is accidentally modified, changes are just ignored
        SelAndEntry.validatestartstop(el);
        let t = el.getftxt();
        if (t.len() && el.canSelectText()) {
            let [ncaretBefore, nendBefore] = el.getSel();
            let [nextCaret, nextEnd] = fn(t, ncaretBefore, nendBefore);
            el.setSel(nextCaret, nextEnd);
            SelAndEntry.validatestartstop(el);
            let amt = SelAndEntry.readOnlyScrollbarImpl.getScrollPosThatWouldMakeStartCaretVisible(
                root,
                el.getReadonlyUi512()
            );
            el.setScrollAmt(amt);
        }
    }

    static validatestartstop(el: IGenericTextField) {
        let [ncaret, nend] = el.getSel();
        ncaret = fitIntoInclusive(ncaret, 0, el.getftxt().len());
        nend = fitIntoInclusive(nend, 0, el.getftxt().len());
        el.setSel(ncaret, nend);
    }

    static changeSelSelectAll(root: Root, el: IGenericTextField) {
        SelAndEntry.changeSelInField(root, el, SelAndEntryImpl.changeSelSelectAll);
    }

    static changeTextBackspace(root: Root, el: IGenericTextField, isLeft: boolean, isUntilWord: boolean) {
        SelAndEntry.changeTextInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextBackspace(t, ncaret, nend, isLeft, isUntilWord)
        );
    }

    static changeTextDuplicate(root: Root, el: IGenericTextField) {
        if (el.isMultiline()) {
            SelAndEntry.changeTextInField(root, el, (t, ncaret, nend) =>
                SelAndEntryImpl.changeTextDuplicate(t, ncaret, nend)
            );
        }
    }

    static changeTextDeleteLine(root: Root, el: IGenericTextField) {
        SelAndEntry.changeTextInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextDeleteLine(t, ncaret, nend)
        );
    }

    static changeTextIndentation(root: Root, el: IGenericTextField, isLeft: boolean) {
        SelAndEntry.changeTextInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextIndentation(t, ncaret, nend, isLeft, el.getDefaultFont())
        );
    }

    static changeTextToggleLinePrefix(root: Root, el: IGenericTextField, prefix: string) {
        SelAndEntry.changeTextInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextToggleLinePrefix(t, ncaret, nend, prefix, el.getDefaultFont())
        );
    }

    static changeTextInsert(root: Root, el: IGenericTextField, s: string) {
        if (!el.isMultiline()) {
            s = s.split('\n')[0];
        }

        SelAndEntry.changeTextInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextInsert(t, ncaret, nend, s, el.getDefaultFont())
        );
    }

    static changeSelLeftRight(
        root: Root,
        el: IGenericTextField,
        isLeft: boolean,
        isExtend: boolean,
        isUntilWord: boolean
    ) {
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeSelLeftRight(t, ncaret, nend, isLeft, isExtend, isUntilWord)
        );
    }

    static changeSelCurrentWord(root: Root, el: IGenericTextField) {
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeSelCurrentWord(t, ncaret, nend)
        );
    }

    static changeSelGoLineHomeEnd(root: Root, el: IGenericTextField, isLeft: boolean, isExtend: boolean) {
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeSelGoLineHomeEnd(t, ncaret, nend, isLeft, isExtend)
        );
    }

    static changeSelGoDocHomeEnd(root: Root, el: IGenericTextField, isLeft: boolean, isExtend: boolean) {
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeSelGoDocHomeEnd(t, ncaret, nend, isLeft, isExtend)
        );
    }

    static changeSelPageUpDown(root: Root, el: IGenericTextField, isUp: boolean, isExtend: boolean) {
        let [ncaret, nend] = el.getSel();
        let approxLineHeight = SelAndEntry.readOnlyScrollbarImpl.getApproxLineHeight(
            root,
            el.getReadonlyUi512(),
            ncaret
        );
        if (approxLineHeight) {
            // go about one line less than the amount of lines per page, and minimum of one line
            let linesPerPage = Math.floor(el.getHeight() / approxLineHeight);
            linesPerPage = Math.max(1, linesPerPage - 1);
            for (let i = 0; i < linesPerPage; i++) {
                SelAndEntry.changeSelArrowKeyUpDownVisual(root, el, isUp, isExtend);
            }
        }
    }

    static mouseClickPositionToSetCaret(root: Root, el: IGenericTextField, x: number, y: number, isExtend: boolean) {
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) => {
            let index = SelAndEntry.readOnlyScrollbarImpl.getMouseCoordToSetCaret(root, el.getReadonlyUi512(), x, y);
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

    static mouseClickPositionAdjustSelection(root: Root, el: IGenericTextField, x: number, y: number) {
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) => {
            let index = SelAndEntry.readOnlyScrollbarImpl.getMouseCoordToSetCaret(root, el.getReadonlyUi512(), x, y);
            if (index !== undefined) {
                return [index, nend];
            } else {
                return [ncaret, nend];
            }
        });
    }

    static mouseClickSelectByLines(root: Root, el: IGenericTextField, x: number, y: number) {
        let [selcaretBefore, selendBefore] = el.getSel();
        this.mouseClickPositionToSetCaret(root, el, x, y, false);
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) => {
            if (el.getftxt().len() > 0 && (ncaret !== selcaretBefore || nend !== selendBefore)) {
                let lines = new Lines(el.getftxt());
                let linenumber = lines.indexToLineNumber(ncaret);
                let [newncaret, newnend] = [
                    lines.lineNumberToIndex(linenumber),
                    lines.lineNumberToLineEndIndex(linenumber) + 1,
                ];
                if (newnend - newncaret > 1) {
                    // only allow a line to be selected if it's not empty.
                    return [newncaret, newnend];
                }
            }

            return [selcaretBefore, selendBefore];
        });
    }

    static selectLineInField(root: Root, el: IGenericTextField, n: number) {
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) => {
            let txt = el.getftxt();
            if (txt.len() > 0) {
                let [linestart, lineend] = Lines.fastLineNumberAndEndToIndex(txt, n);
                return [linestart, lineend];
            } else {
                return [ncaret, nend];
            }
        });
    }

    static selectByLinesWhichLine(el: IGenericTextField) {
        let [selcaret, selend] = el.getSel();
        if (selcaret === selend || el.getftxt().len() === 0) {
            return undefined;
        } else {
            let lines = new Lines(el.getftxt());
            return lines.indexToLineNumber(selcaret);
        }
    }

    static changeSelArrowKeyUpDownVisual(root: Root, gel: IGenericTextField, isUp: boolean, isExtend: boolean) {
        // if the field is wrapped and you hit the "up" arrow key, what should happen?
        // it looks like most text editors do this purely visually --
        // it's not the number of chars from the newline,
        // or the number of chars from the left side of the field,
        // but the letter that happens to be rendered above the current letter.
        const pixelUpwardsToLook = 4;
        SelAndEntry.changeSelInField(root, gel, (t, ncaret, nend) => {
            let bounds = SelAndEntry.readOnlyScrollbarImpl.getCharacterInFieldToPosition(
                root,
                gel.getReadonlyUi512(),
                ncaret
            );
            if (bounds && bounds.length > 0) {
                // find a location above the middle of the letter
                let middle = bounds[0] + Math.floor(bounds[2] / 2);
                let above = isUp ? bounds[1] - pixelUpwardsToLook : bounds[1] + bounds[3] + pixelUpwardsToLook;
                let [found, lowest] = SelAndEntry.readOnlyScrollbarImpl.getCoordToCharInField(
                    root,
                    gel.getReadonlyUi512(),
                    middle,
                    above,
                    true
                );
                if (found && found.length > 0) {
                    let nextcaret = found[4];
                    let nextend = isExtend ? nend : nextcaret;
                    return [nextcaret, nextend];
                }
            }
            return [ncaret, nend];
        });
    }

    static getSelectedText(root: Root, el: IGenericTextField) {
        if (el.canSelectText()) {
            SelAndEntry.validatestartstop(el);
            let t = el.getftxt();
            let [p1, p2] = el.getSel();
            let pp1 = Math.min(p1, p2);
            let pp2 = Math.max(p1, p2);
            return t.toUnformattedSubstr(pp1, pp2 - pp1);
        } else {
            return '';
        }
    }
}
