
/* autoimport:start */
import { UI512ControllerBase, BasicHandlers, MenuOpenState, TemporaryIgnoreEvents } from "../ui512/ui512controllerbase.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512ViewDraw } from "../ui512/ui512elementsdefaultview.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { ScrollbarImpl, scrollbarIdToscrollbarPartId, scrollbarPartIdToscrollbarId, getIsScrollArrowClicked } from "../ui512/ui512elementsscrollbar.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class SelAndEntryImpl {
    static changeSelSelectAll(t: FormattedText, ncaret: number, nend: number): [number, number] {
        return [0, t.len()];
    }

    static changeSelGoDocHomeEnd(t: FormattedText, ncaret: number, nend: number, isLeft: boolean, isExtend: boolean): [number, number] {
        let nextcaret = isLeft ? 0 : t.len();
        let nextend = isExtend ? nend : nextcaret;
        return [nextcaret, nextend];
    }

    static changeSelGoLineHomeEnd(t: FormattedText, ncaret: number, nend: number, isLeft: boolean, isExtend: boolean): [number, number] {
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
        assertTrue(lines.lns.length > 0, "2<|lines.lns is empty");
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
        let space = preferTab ? "\t" : Util512.repeat(ScrollConsts.tabSize, " ").join("");
        // 1) erase all current whitespace
        let countCharsToDelete = Lines.getNonSpaceStartOfLine(t, true);
        t.splice(0, countCharsToDelete);

        // 2) add spaces
        assertTrue(level >= 0, "2;|negative level");
        let added = Util512.repeat(level, space).join("");
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
            !prefix.startsWith(" ") && !prefix.startsWith("\t") && !prefix.startsWith("\n"),
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
                let [tnew, p1, p2] = SelAndEntryImpl.changeTextInsert(thisline, linestart, linestart, prefix, defaultFont);
                thisline.deleteAll();
                thisline.append(tnew);
            }
        };

        return Lines.alterSelectedLines(t, ncaret, nend, cb);
    }

    static getLeftRight(t: FormattedText, n: number, isLeft: boolean, isUntilWord: boolean, includeTrailingSpace: boolean) {
        return GetCharClass.getLeftRight((i: number) => t.charAt(i), t.len(), n, isLeft, isUntilWord, includeTrailingSpace);
    }
}

export interface IGenericTextField {
    setftxt(newtxt: FormattedText, context: ChangeContext): void;
    getftxt(): FormattedText;
    canEdit(): boolean;
    canSelectText(): boolean;
    isMultiline(): boolean;
    setSel(a: number, b: number): void;
    getSel(): [number, number];
    identifier(): string;
    getHeight(): number;
    getDefaultFont(): string;
    getReadonlyUi512(): UI512ElTextField;
    getScrollAmt(): number;
    setScrollAmt(n: O<number>): void;
}

export class UI512ElTextFieldAsGeneric implements IGenericTextField {
    constructor(protected impl: UI512ElTextField) {}
    setftxt(newtxt: FormattedText, context: ChangeContext) {
        this.impl.setftxt(newtxt, context);
    }
    getftxt(): FormattedText {
        return this.impl.get_ftxt();
    }
    canEdit() {
        return this.impl.get_b("canedit");
    }
    canSelectText(): boolean {
        return this.impl.get_b("canselecttext");
    }
    isMultiline(): boolean {
        return this.impl.get_b("multiline");
    }
    setSel(a: number, b: number): void {
        this.impl.set("selcaret", a);
        this.impl.set("selend", b);
    }
    getSel(): [number, number] {
        return [this.impl.get_n("selcaret"), this.impl.get_n("selend")];
    }
    identifier(): string {
        return this.impl.id;
    }
    getHeight(): number {
        return this.impl.h;
    }
    getDefaultFont(): string {
        return this.impl.get_s("defaultFont");
    }
    getReadonlyUi512(): UI512ElTextField {
        return this.impl;
    }
    getScrollAmt(): number {
        return this.impl.get_n("scrollamt");
    }
    setScrollAmt(n: O<number>): void {
        if (n !== undefined && n !== null) {
            return this.impl.set("scrollamt", n);
        }
    }
}

export class SelAndEntry {
    static getSelectedField(c: UI512ControllerBase): O<UI512ElTextField> {
        if (!c.currentFocus) {
            return undefined;
        }

        let el = c.app.findElemById(c.currentFocus);
        if (!(el && el instanceof UI512ElTextField && el.get_b("canselecttext"))) {
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

        let amt = ScrollbarImpl.getScrollPosThatWouldMakeStartCaretVisible(root, el.getReadonlyUi512());
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
            let amt = ScrollbarImpl.getScrollPosThatWouldMakeStartCaretVisible(root, el.getReadonlyUi512());
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
            SelAndEntry.changeTextInField(root, el, (t, ncaret, nend) => SelAndEntryImpl.changeTextDuplicate(t, ncaret, nend));
        }
    }

    static changeTextDeleteLine(root: Root, el: IGenericTextField) {
        SelAndEntry.changeTextInField(root, el, (t, ncaret, nend) => SelAndEntryImpl.changeTextDeleteLine(t, ncaret, nend));
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
            s = s.split("\n")[0];
        }

        SelAndEntry.changeTextInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeTextInsert(t, ncaret, nend, s, el.getDefaultFont())
        );
    }

    static changeSelLeftRight(root: Root, el: IGenericTextField, isLeft: boolean, isExtend: boolean, isUntilWord: boolean) {
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) =>
            SelAndEntryImpl.changeSelLeftRight(t, ncaret, nend, isLeft, isExtend, isUntilWord)
        );
    }

    static changeSelCurrentWord(root: Root, el: IGenericTextField) {
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) => SelAndEntryImpl.changeSelCurrentWord(t, ncaret, nend));
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
        let approxLineHeight = ScrollbarImpl.getApproxLineHeight(root, el.getReadonlyUi512(), ncaret);
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
            let index = ScrollbarImpl.getMouseCoordToSetCaret(root, el.getReadonlyUi512(), x, y);
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
            let index = ScrollbarImpl.getMouseCoordToSetCaret(root, el.getReadonlyUi512(), x, y);
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
                let [newncaret, newnend] = [lines.lineNumberToIndex(linenumber), lines.lineNumberToLineEndIndex(linenumber) + 1];
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

    static changeSelArrowKeyUpDownVisual(root: Root, el: IGenericTextField, isUp: boolean, isExtend: boolean) {
        // if the field is wrapped and you hit the "up" arrow key, what should happen?
        // it looks like most text editors do this purely visually --
        // it's not the number of chars from the newline,
        // or the number of chars from the left side of the field,
        // but the letter that happens to be rendered above the current letter.
        const pixelUpwardsToLook = 4;
        SelAndEntry.changeSelInField(root, el, (t, ncaret, nend) => {
            let bounds = ScrollbarImpl.getCharacterInFieldToPosition(root, el.getReadonlyUi512(), ncaret);
            if (bounds && bounds.length > 0) {
                // find a location above the middle of the letter
                let middle = bounds[0] + Math.floor(bounds[2] / 2);
                let above = isUp ? bounds[1] - pixelUpwardsToLook : bounds[1] + bounds[3] + pixelUpwardsToLook;
                let [found, lowest] = ScrollbarImpl.getCoordToCharInField(root, el.getReadonlyUi512(), middle, above, true);
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
            let pp1 = Math.min(p1, p2),
                pp2 = Math.max(p1, p2);
            return t.toUnformattedSubstr(pp1, pp2 - pp1);
        } else {
            return "";
        }
    }
}

export class ClipManager {
    root: any;
    simClipboard = "";
    readonly clipboardreadyperiod = 2000;
    timerClipboardReady = new RepeatingTimer(this.clipboardreadyperiod);
    ensureReadyForPaste(milliseconds: number) {
        if (this.root) {
            this.timerClipboardReady.update(milliseconds);
            if (this.timerClipboardReady.isDue()) {
                this.timerClipboardReady.reset();
                ClipManager.ensureReadyForPasteImpl(this.getOrCreateHidden());
            }
        }
    }

    paste(useOSClipboard: boolean) {
        if (useOSClipboard) {
            // cannot do anything here, the PasteTextEventDetails event will be sent from root
        } else {
            let d = new PasteTextEventDetails(0, this.simClipboard, useOSClipboard);
            this.root.event(d);
        }
    }

    copy(s: string, useOSClipboard: boolean) {
        if (useOSClipboard) {
            let hiddenInput = this.getOrCreateHidden();
            assertTrue(hiddenInput, "2>|could not create hiddenInput");
            hiddenInput.value = s;
            hiddenInput.select();
            let succeeded = false;
            try {
                succeeded = document.execCommand("copy");
            } catch (e) {
                succeeded = false;
            }

            return succeeded;
        } else {
            this.simClipboard = s;
            return true;
        }
    }

    protected static ensureReadyForPasteImpl(hiddenInput: HTMLTextAreaElement) {
        hiddenInput.value = " ";
        hiddenInput.focus();
        hiddenInput.select();
    }

    protected getOrCreateHidden() {
        let hiddenInput = document.getElementById("hidden-dom-input") as HTMLTextAreaElement;
        if (!hiddenInput) {
            let root = this.root;
            assertTrue(root, "2=|root must be defined");
            const isRTL = document.documentElement.getAttribute("dir") === "rtl";
            hiddenInput = document.createElement("textarea");
            hiddenInput.id = "hidden-dom-input";
            // Prevent zooming on iOS
            hiddenInput.style.fontSize = "12pt";
            // Reset box model
            hiddenInput.style.border = "0";
            hiddenInput.style.padding = "0";
            hiddenInput.style.margin = "0";
            // Move element out of screen horizontally
            hiddenInput.style.position = "absolute";
            hiddenInput.style[isRTL ? "right" : "left"] = "-99999px";
            // Move element to the same position vertically
            let yPosition = window.pageYOffset || document.documentElement.scrollTop;
            hiddenInput.style.top = `${yPosition}px`;
            hiddenInput.setAttribute("readonly", "");
            document.body.appendChild(hiddenInput);

            // register events
            let setFocusToHiddenInput = () => {
                ClipManager.ensureReadyForPasteImpl(hiddenInput);
            };

            // keep the hidden text area focused, no matter what...
            document.addEventListener("mouseup", setFocusToHiddenInput);
            document.addEventListener("keyup", setFocusToHiddenInput);
            hiddenInput.addEventListener("input", e => {
                setTimeout(setFocusToHiddenInput, 0);
            });

            // register for paste event
            document.addEventListener("paste", (e: ClipboardEvent) => {
                setFocusToHiddenInput();
                e.preventDefault();
                if (e.clipboardData.types.indexOf("text/plain") !== -1) {
                    let plaintext = e.clipboardData.getData("text/plain");
                    if (plaintext) {
                        let details = new PasteTextEventDetails(0, plaintext, true);
                        root.event(details);
                    }
                }
            });
        }

        return hiddenInput;
    }
}
