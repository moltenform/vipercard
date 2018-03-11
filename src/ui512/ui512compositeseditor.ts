
/* autoimport:start */
import { EditTextBehavior, addDefaultListeners } from "../ui512/ui512elementstextlisten.js";
import { MouseDragStatus, UI512Controller } from "../ui512/ui512controller.js";
import { UI512ControllerBase, BasicHandlers, MenuOpenState, TemporaryIgnoreEvents } from "../ui512/ui512controllerbase.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512ViewDraw } from "../ui512/ui512elementsdefaultview.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { BorderDecorationConsts, PalBorderDecorationConsts, WndBorderDecorationConsts, UI512CompBase, UI512CompRadioButtonGroup, UI512CompToolbox } from "../ui512/ui512composites.js";
import { SelAndEntryImpl, IGenericTextField, UI512ElTextFieldAsGeneric, SelAndEntry, ClipManager } from "../ui512/ui512elementstextselect.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

class AutoIndentMatch {
    startPattern:RegExp
    desiredEndPattern:RegExp
    desiredEndText:string
}

export class UI512AutoIndent {
    lineContinuation = ["\\"];
    linesCauseIndent:[RegExp, RegExp, string][] = [
        [/^start1\b/, /^end1\b/, 'end1'],
        [/^start\s+b2\b/, /^end\s+b2\b/, 'end'], 
        [/^start\s+b2\b/, /^end\s+b2\b/, 'end'],
        [/^on\s+(\w+)\b/, /^end\s+%MATCH%\b/, 'end %MATCH%']];
    caseSensitive = true;
    useTabs = true;
    useAutoIndent = true;
    useAutoCreateBlock = true;
    readonly reNull = new RegExp("");
    constructor() {
    }

    protected lineIsContinuation(s: string) {
        for (let cont of this.lineContinuation) {
            if (s.endsWith(cont) || s.endsWith(cont + "\n")) {
                return true;
            }
        }

        return false;
    }

    getLevelChangeIsStartNewBlock(s: string, stack: AutoIndentMatch[], st: RegExp, end: RegExp, endText: string) {
        let matched = s.match(st);
        if (matched) {
            let nextword = ''
            if (scontains(endText, "%MATCH%")) {
                assertTrue(matched.length > 1, "2s|the regex should have a 2nd group to capture next word");
                if (matched[1].match(/^\w+$/)) {
                    nextword = matched[1];
                }
            }
            
            
            let store = new AutoIndentMatch()
            store.startPattern = st
            store.desiredEndPattern = new RegExp(end.source.replace(/%MATCH%/g, nextword));
            store.desiredEndText = endText.replace(/%MATCH%/g, nextword);
            stack.push(store);
            return 1;
        }

        return 0;
    }

    getLevelChangeIsEndOfBlock(s: string, stack: AutoIndentMatch[]) {
        let desiredMatch = stack[stack.length - 1]
        let matched = s.match(desiredMatch.desiredEndPattern);
        if (matched) {
            stack.pop();
            return -1;
        } else {
            return 0;
        }
    }

    protected getLevelChange(sTrimmed: string, stack: AutoIndentMatch[]):[boolean, boolean] {
        let isBlockStart = false, isBlockEnd = false
        sTrimmed = sTrimmed.trim();
        if (!this.caseSensitive) {
            sTrimmed = sTrimmed.toLowerCase();
        }

        // are we starting a new block?
        for (let [st, end, endInsert] of this.linesCauseIndent) {
            let rt = this.getLevelChangeIsStartNewBlock(sTrimmed, stack, st, end, endInsert);
            if (rt !== 0) {
                isBlockStart = true
                break
            }
        }

        // are we finishing a block?
        if (stack.length > 0) {
            let rt = this.getLevelChangeIsEndOfBlock(sTrimmed, stack);
            if (rt !== 0) {
                isBlockEnd = true
            }
        }

        return [isBlockStart, isBlockEnd]
    }

    runAutoIndentImpl(lns: Lines, selcaret:number, selend:number, len: number, attemptInsertText:boolean): [Lines, number, number] {
        let wasEnd = selcaret >= len;
        let currentline = lns.indexToLineNumber(selcaret);

        let lnsout = new Lines(FormattedText.newFromPersisted(""));
        lnsout.lns = [];

        let overrideLevel:O<number> = undefined;
        let level = 0;
        let lastUnclosedDelta = 0;
        let lastUnclosedMatch : O<AutoIndentMatch>
        let stack: AutoIndentMatch[] = [];
        for (let i = 0; i < lns.lns.length; i++) {
            let s = lns.getLineUnformatted(i);
            let isContinuation = this.lineIsContinuation(s);
            let [isBlockStart, isBlockEnd] = this.getLevelChange(s, stack)
            
            if (i === currentline - 1 && !isContinuation && isBlockStart) {
                lastUnclosedDelta = 1;
                lastUnclosedMatch = stack[stack.length - 1];
            }

            if (isBlockEnd) {
                level -= 1;
            }

            s = this.lineSetIndent(s, overrideLevel !== undefined ? overrideLevel : level);
            s = TextRendererFontManager.setInitialFont(s, UI512CompCodeEditor.currentFont);
            lnsout.lns[i] = FormattedText.newFromPersisted(s);
            overrideLevel = isContinuation ? level + 1 : undefined;
            
            if (isBlockStart) {
                level += 1;
            }
        }

        if (level !== 0 && attemptInsertText) {
            // something didn't parse right, let's see if we can auto insert closing text
            if (this.createAutoBlock(lnsout, currentline, lastUnclosedMatch, lastUnclosedDelta)) {
                // do a second pass on indentation
                let newselcaret = lnsout.lineNumberToLineEndIndex(currentline);
                return this.runAutoIndentImpl(lnsout, newselcaret, newselcaret, lnsout.length(), false);
            }
        }

        assertEqWarn(lns.lns.length, lnsout.lns.length, '2r|');
        assertTrueWarn(currentline < lnsout.lns.length, "2q|invalid currentline");
        let index = lnsout.lineNumberToLineEndIndex(currentline);
        return [lnsout, index, index]
    }

    runAutoIndent(lns: Lines, el: UI512ElTextField): Lines {
        let len = el.get_ftxt().len()
        let [lnsout, newselcaret, newselend] = this.runAutoIndentImpl(
            lns, el.get_n("selcaret"), el.get_n("selend"),
            len, true)
        el.set("selcaret", newselcaret);
        el.set("selend", newselend);
        return lnsout;
    }

    lineSetIndent(s: string, n: number) {
        s = s.replace(/^[ \t]+/, "");
        let space = this.useTabs ? "\t" : Util512.repeat(ScrollConsts.tabSize, " ").join("");
        for (let i = 0; i < n; i++) {
            s = space + s;
        }

        return s;
    }

    createAutoBlock(lnsout: Lines, currentline: number, lastEncounteredDesiredMatch: O<AutoIndentMatch>, delta: number) {
        if (delta !== 1 || !lastEncounteredDesiredMatch || !this.useAutoCreateBlock) {
            return false;
        } else if (!slength(lastEncounteredDesiredMatch.desiredEndText)) {
            return false;
        }

        // we'll do a second pass later to correct the indentation
        let s = TextRendererFontManager.setInitialFont(lastEncounteredDesiredMatch.desiredEndText, UI512CompCodeEditor.currentFont);

        // are we on the very last line? then don't add a newline character
        if (currentline >= lnsout.lns.length - 1) {
            lnsout.lns[currentline].push(specialCharNumNewline, UI512CompCodeEditor.currentFont);
        } else {
            s += "\n";
        }

        let txt = FormattedText.newFromPersisted(s);
        lnsout.lns.splice(currentline + 1, 0, txt);
        return true;
    }

    runAutoIndentAll(el: UI512ElTextField) {
        if (!this.useAutoIndent) {
            return;
        }

        let lns = new Lines(el.get_ftxt());
        let lnsAfterIndent = this.runAutoIndent(lns, el);
        let next = lnsAfterIndent.flatten();
        let flattxtcurrent = el.get_ftxt().toUnformatted();
        if (flattxtcurrent !== next.toUnformatted()) {
            el.setftxt(next);
        }
    }
}

export class UI512CompCodeEditor extends UI512CompBase {
    hasCloseBtn = false;
    autoCreateBlock = true;
    compositeType = "editor";
    lineCommentPrefix = "//~ ";
    el: O<UI512ElTextField>;
    static fontface = "monaco";
    static fontstyle = TextFontStyling.Default;
    static fontsize = 9;
    static currentFont = `${UI512CompCodeEditor.fontface}_${UI512CompCodeEditor.fontsize}_${textFontStylingToString(UI512CompCodeEditor.fontstyle)}`;
    autoIndent:UI512AutoIndent

    constructor(compositeId: string) {
        super(compositeId)
        this.autoIndent = new UI512AutoIndent();
    }

    setFont(fontface: string, size: number, style: TextFontStyling) {
        assertTrueWarn(false, "nyi")
    }

    getEl() {
        return throwIfUndefined(this.el, "2p|elem not created");
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawWindowDecoration(app, new WndBorderDecorationConsts(), this.hasCloseBtn);

        let cury = this.y + headerheight - 1;
        const spacerheight = headerheight;
        let spacer = this.genBtn(app, grp, "spacer");
        spacer.set("autohighlight", false);
        spacer.setDimensions(this.x, cury, this.logicalWidth, spacerheight);
        cury += spacerheight - 1;

        this.el = this.genChild(app, grp, "editor", UI512ElTextField);
        this.el.set("style", UI512FldStyle.rectangle);
        this.el.set("labelwrap", false);
        this.el.set("scrollbar", true);
        this.el.set("defaultFont", UI512CompCodeEditor.currentFont);
        this.el.setDimensionsX1Y1(this.x, cury, this.x + this.logicalWidth, this.y + this.logicalHeight);
    }

    setContent(s: string) {
        s = TextRendererFontManager.setInitialFont(s, UI512CompCodeEditor.currentFont);
        let txt = FormattedText.newFromPersisted(s);
        this.getEl().setftxt(txt);
    }

    setCaption(app: UI512Application, s: string) {
        let grp = app.getGroup(this.grpid);
        let el = grp.findEl(this.getElId("caption"));
        if (el) {
            el.set("labeltext", s);
        }
    }

    respondKeydown(root:Root, d: KeyDownEventDetails) {
        if (!this.getEl().get_b("canselecttext") || !this.getEl().get_b("canedit")) {
            return;
        }

        let gel = new UI512ElTextFieldAsGeneric(this.getEl())
        let wasShortcut = true;
        switch (d.readableShortcut) {
            case "Cmd+D":
                SelAndEntry.changeTextDuplicate(root, gel);
                break;
            case "Cmd+L":
                SelAndEntry.changeTextDeleteLine(root, gel);
                break;
            case "Cmd+Q":
                // would use Ctrl Q to add comment, Ctrl Shift Q to uncomment
                // or Ctrl - to add comment, Ctrl Shift - to uncomment
                // but Ctrl Shift Q always exits chrome event if preventDefault==true
                // and Ctrl - is about setting zoom level, so don't use it
                // so I guess I'll just follow SciTE's model where
                // Ctrl Q adds or removes based on what is there
                SelAndEntry.changeTextToggleLinePrefix(root, gel, this.lineCommentPrefix);
                break;
            case 'Enter':
                SelAndEntry.changeTextInsert(root, gel, "\n");
                this.autoIndent.runAutoIndentAll(this.getEl());
                break;
            default:
                wasShortcut = false;
                break;
        }

        if (wasShortcut) {
            d.setHandled();
        }
    }
}

