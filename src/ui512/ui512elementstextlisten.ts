
/* autoimport:start */
import { MouseDragStatus, UI512Controller } from "../ui512/ui512controller.js";
import { UI512ControllerBase, BasicHandlers, MenuOpenState, TemporaryIgnoreEvents } from "../ui512/ui512controllerbase.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512ViewDraw } from "../ui512/ui512elementsdefaultview.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { MenuBehavior } from "../ui512/ui512menulisteners.js";
import { SelAndEntryImpl, IGenericTextField, UI512ElTextFieldAsGeneric, SelAndEntry, ClipManager } from "../ui512/ui512elementstextselect.js";
import { ScrollbarImpl, scrollbarIdToscrollbarPartId, scrollbarPartIdToscrollbarId, getIsScrollArrowClicked } from "../ui512/ui512elementsscrollbar.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class EditTextBehavior {
    static readonly amtScrollArrowClicked = 12;
    static readonly amtScrollAreaClicked = 36;

    protected gelFromEl(el:O<UI512ElTextField>):O<IGenericTextField> {
        return el ? new UI512ElTextFieldAsGeneric(el) : undefined
    }

    onMouseDownScroll(c: UI512Controller, root: Root, d: MouseDownEventDetails) {
        if (d.button === 0 && d.el instanceof UI512ElButton) {
            let moveAmt = getIsScrollArrowClicked(d.el.id);
            if (moveAmt !== undefined) {
                ScrollbarImpl.onScrollArrowClicked(c, d.el.id, moveAmt);
                c.mouseDragStatus = MouseDragStatus.ScrollArrow;
            }
        }
    }

    onMouseDownSelect(c: UI512Controller, root: Root, d: MouseDownEventDetails) {
        if (d.button === 0 && d.el instanceof UI512ElTextField && d.el.get_b("canselecttext") && c.canSelectTextInField(d.el)) {
            let gel = this.gelFromEl(d.el)
            if (!gel) {
                return
            }

            if ((d.mods & ModifierKeys.Cmd) !== 0 || (d.mods & ModifierKeys.Opt) !== 0) {
                return;
            }

            c.setCurrentFocus(root, d.el.id);
            if (d.el.get_b("selectbylines")) {
                SelAndEntry.mouseClickSelectByLines(root, gel, d.mouseX, d.mouseY);
            } else {
                let isShift = (d.mods & ModifierKeys.Shift) !== 0;
                SelAndEntry.mouseClickPositionToSetCaret(root, gel, d.mouseX, d.mouseY, isShift);
                if (!isShift) {
                    c.mouseDragStatus = MouseDragStatus.SelectingText;
                }
            }
        }
    }

    onMouseMoveSelect(c: UI512Controller, root: Root, d: MouseMoveEventDetails) {
        if (c.mouseDragStatus === MouseDragStatus.SelectingText && c.trackPressedBtns[0]) {
            let el = c.app.findElemById(c.trackClickedIds[0]);
            if (
                el &&
                el instanceof UI512ElTextField &&
                el.get_b("canselecttext") &&
                c.canSelectTextInField(el) &&
                !el.get_b("selectbylines")
            ) {
                let gel = this.gelFromEl(el)
                if (gel) {
                    if (RectUtils.hasPoint(d.mouseX, d.mouseY, el.x, el.y, el.w, el.h)) {
                        SelAndEntry.mouseClickPositionAdjustSelection(root, gel, d.mouseX, d.mouseY);
                    }
                }
            }
        }
    }

    onMouseDoubleDown(c: UI512Controller, root: Root, d: MouseDownDoubleEventDetails) {
        if (d.button === 0) {
            if (
                d.el &&
                d.el instanceof UI512ElTextField &&
                d.el.get_b("canselecttext") &&
                c.canSelectTextInField(d.el) &&
                !d.el.get_b("selectbylines")
            ) {
                let gel = this.gelFromEl(d.el)
                if (gel) {
                    // disable the drag-to-select
                    c.mouseDragStatus = MouseDragStatus.None;
                    SelAndEntry.changeSelCurrentWord(root, gel);
                }
            }
        }
    }

    onMouseUp(c: UI512Controller, root: Root, d: MouseUpEventDetails) {
        c.mouseDragStatus = MouseDragStatus.None;
    }

    onKeyDown(c: UI512Controller, root: Root, d: KeyDownEventDetails) {
        let el = SelAndEntry.getSelectedField(c);
        if (el && el.get_b("selectbylines")) {
            return;
        } else if (!el || d.handled()) {
            return;
        }

        let gel = this.gelFromEl(el)
        if (!gel) {
            return
        }

        let wasShortcut = true;
        switch (d.readableShortcut) {
            case "Cmd+A":
                SelAndEntry.changeSelSelectAll(root, gel);
                break;
            case "Backspace":
                SelAndEntry.changeTextBackspace(root, gel, true, false);
                break;
            case "Cmd+Backspace":
                SelAndEntry.changeTextBackspace(root, gel, true, true);
                break;
            case "Delete":
                SelAndEntry.changeTextBackspace(root, gel, false, false);
                break;
            case "Cmd+Delete":
                SelAndEntry.changeTextBackspace(root, gel, false, true);
                break;
            case "PageUp":
                SelAndEntry.changeSelPageUpDown(root, gel, true, false);
                break;
            case "Shift+PageUp":
                SelAndEntry.changeSelPageUpDown(root, gel, true, true);
                break;
            case "PageDown":
                SelAndEntry.changeSelPageUpDown(root, gel, false, false);
                break;
            case "Shift+PageDown":
                SelAndEntry.changeSelPageUpDown(root, gel, false, true);
                break;
            case "Home":
                SelAndEntry.changeSelGoLineHomeEnd(root, gel, true, false);
                break;
            case "Shift+Home":
                SelAndEntry.changeSelGoLineHomeEnd(root, gel, true, true);
                break;
            case "Cmd+Home":
                SelAndEntry.changeSelGoDocHomeEnd(root, gel, true, false);
                break;
            case "Cmd+Shift+Home":
                SelAndEntry.changeSelGoDocHomeEnd(root, gel, true, true);
                break;
            case "End":
                SelAndEntry.changeSelGoLineHomeEnd(root, gel, false, false);
                break;
            case "Shift+End":
                SelAndEntry.changeSelGoLineHomeEnd(root, gel, false, true);
                break;
            case "Cmd+End":
                SelAndEntry.changeSelGoDocHomeEnd(root, gel, false, false);
                break;
            case "Cmd+Shift+End":
                SelAndEntry.changeSelGoDocHomeEnd(root, gel, false, true);
                break;
            case "ArrowLeft":
                SelAndEntry.changeSelLeftRight(root, gel, true, false, false);
                break;
            case "Shift+ArrowLeft":
                SelAndEntry.changeSelLeftRight(root, gel, true, true, false);
                break;
            case "Cmd+ArrowLeft":
                SelAndEntry.changeSelLeftRight(root, gel, true, false, true);
                break;
            case "Cmd+Shift+ArrowLeft":
                SelAndEntry.changeSelLeftRight(root, gel, true, true, true);
                break;
            case "ArrowRight":
                SelAndEntry.changeSelLeftRight(root, gel, false, false, false);
                break;
            case "Shift+ArrowRight":
                SelAndEntry.changeSelLeftRight(root, gel, false, true, false);
                break;
            case "Cmd+ArrowRight":
                SelAndEntry.changeSelLeftRight(root, gel, false, false, true);
                break;
            case "Cmd+Shift+ArrowRight":
                SelAndEntry.changeSelLeftRight(root, gel, false, true, true);
                break;
            case "ArrowUp":
                SelAndEntry.changeSelArrowKeyUpDownVisual(root, gel, true, false);
                break;
            case "Shift+ArrowUp":
                SelAndEntry.changeSelArrowKeyUpDownVisual(root, gel, true, true);
                break;
            case "Cmd+ArrowUp":
                let arrowbtnup = scrollbarIdToscrollbarPartId(el.id, "arrowup");
                ScrollbarImpl.onScrollArrowClicked(c, arrowbtnup, -1 * EditTextBehavior.amtScrollArrowClicked);
                break;
            case "ArrowDown":
                SelAndEntry.changeSelArrowKeyUpDownVisual(root, gel, false, false);
                break;
            case "Shift+ArrowDown":
                SelAndEntry.changeSelArrowKeyUpDownVisual(root, gel, false, true);
                break;
            case "Cmd+ArrowDown":
                let arrowbtndn = scrollbarIdToscrollbarPartId(el.id, "arrowdn");
                ScrollbarImpl.onScrollArrowClicked(c, arrowbtndn, EditTextBehavior.amtScrollArrowClicked);
                break;
            case "Enter":
                SelAndEntry.changeTextInsert(root, gel, "\n");
                break;
            case "NumpadEnter":
                SelAndEntry.changeTextInsert(root, gel, "\n");
                break;
            case "Cmd+C":
                // note: at least for now, I am defaulting to a private clipboard that doesn't interact with OS clipboard,
                // for no reason other than to make it "feel" lke a separate emulator that is somehow detached from the normal world
                // user can attach to OS clipboard by setting c.useOSClipboard
                this.sendCutOrCopy(c, root, el, false);
                break;
            case "Cmd+X":
                this.sendCutOrCopy(c, root, el, true);
                break;
            default:
                wasShortcut = false;
                break;
        }

        if (d.readableShortcut === "Cmd+V" && !c.useOSClipboard) {
            c.clipManager.paste(c.useOSClipboard);
            wasShortcut = true;
        }

        if (wasShortcut) {
            d.setHandled();
        } else if ((d.mods === 0 || d.mods === ModifierKeys.Shift) && d.keyChar.length === 1) {
            let char = d.keyChar,
                charcode = d.keyChar.charCodeAt(0);
            let toRoman = FormattedText.fromHostCharsetStrict(char, root.getBrowserInfo());
            if (toRoman && toRoman.length === 1 && toRoman.charCodeAt(0) >= 32 && charcode >= 32) {
                let gel = this.gelFromEl(el)
                if (gel) {
                    // insert the char into the field
                    SelAndEntry.changeTextInsert(root, gel, toRoman);
                    d.setHandled();
                }
            }
        }
    }

    onPasteText(c: UI512Controller, root: Root, d: PasteTextEventDetails) {
        let el = SelAndEntry.getSelectedField(c);
        if (el && !(d.fromOS && !c.useOSClipboard)) {
            let text = d.fromOS ? FormattedText.fromExternalCharset(d.text, root.getBrowserInfo()) : d.text;
            let gel = this.gelFromEl(el)
            if (gel) {
                SelAndEntry.changeTextInsert(root, gel, text);
            }
        }
    }

    sendCutOrCopy(c: UI512Controller, root: Root, el: UI512ElTextField, isCut: boolean) {
        if (el) {
            let gel = this.gelFromEl(el)
            if (!gel) {
                return
            }

            if (el.get_b('asteriskonly')) {
                // this is a password "asteriskonly" field so don't allow cut/copy
                return
            }

            let sel = SelAndEntry.getSelectedText(root, gel);
            if (sel && sel.length > 0) {
                let text = c.useOSClipboard ? FormattedText.toExternalCharset(sel, root.getBrowserInfo()) : sel;
                let succeeded = c.clipManager.copy(text, c.useOSClipboard);
                if (succeeded && isCut && sel.length > 0) {
                    SelAndEntry.changeTextBackspace(root, gel, false, false);
                }
            }
        }
    }

    onBlinkCaret(c: UI512Controller, d: IdleEventDetails) {
        c.timerSlowIdle.update(d.milliseconds);
        if (c.timerSlowIdle.isDue()) {
            c.timerSlowIdle.reset();

            // blink the caret for this field
            if (c.currentFocus) {
                let el = c.app.findElemById(c.currentFocus);
                if (el && el instanceof UI512ElTextField && el.get_b("canselecttext")) {
                    el.set("showcaret", !el.get_b("showcaret"));
                }
            }
        }
    }

    onIdle(c: UI512Controller, root: Root, d: IdleEventDetails) {
        // scroll down more if user is still clicked on the down arrow
        let clickedid = c.trackClickedIds[0];
        if (c.mouseDragStatus === MouseDragStatus.ScrollArrow && clickedid) {
            let moveAmt = getIsScrollArrowClicked(clickedid);
            if (moveAmt) {
                let el = c.app.findElemById(clickedid);
                if (el && RectUtils.hasPoint(c.trackMouse[0], c.trackMouse[1], el.x, el.y, el.w, el.h)) {
                    ScrollbarImpl.onScrollArrowClicked(c, clickedid, moveAmt);
                }
            }
        }

        this.onBlinkCaret(c, d);
        c.clipManager.ensureReadyForPaste(d.milliseconds);
    }
}

export function addDefaultListeners(listeners: { [t: number]: Function[] }) {
    let editTextBehavior = new EditTextBehavior()
    listeners[UI512EventType.MouseDown.valueOf()] = [
        BasicHandlers.trackMouseStatusMouseDown,
        BasicHandlers.trackCurrentElMouseDown,
        BasicHandlers.trackHighlightedButtonMouseDown,
        MenuBehavior.onMouseDown,
        editTextBehavior.onMouseDownScroll.bind(editTextBehavior),
        editTextBehavior.onMouseDownSelect.bind(editTextBehavior),
    ];

    listeners[UI512EventType.MouseUp.valueOf()] = [
        BasicHandlers.trackMouseStatusMouseUp,
        BasicHandlers.trackCurrentElMouseUp,
        BasicHandlers.trackHighlightedButtonMouseUp,
        MenuBehavior.onMouseUp,
        editTextBehavior.onMouseUp.bind(editTextBehavior),
    ];

    listeners[UI512EventType.Idle.valueOf()] = [editTextBehavior.onIdle.bind(editTextBehavior),
        BasicHandlers.onIdleRunCallbackQueueFromAsyncs];
    listeners[UI512EventType.MouseMove.valueOf()] = [BasicHandlers.trackCurrentElMouseMove, editTextBehavior.onMouseMoveSelect.bind(editTextBehavior)];
    listeners[UI512EventType.MouseEnter.valueOf()] = [BasicHandlers.trackHighlightedButtonMouseEnter, MenuBehavior.onMouseEnter];
    listeners[UI512EventType.MouseLeave.valueOf()] = [BasicHandlers.trackHighlightedButtonMouseLeave, MenuBehavior.onMouseLeave];
    listeners[UI512EventType.KeyDown.valueOf()] = [
        BasicHandlers.trackKeyDown, 
        BasicHandlers.basicKeyShortcuts, 
        editTextBehavior.onKeyDown.bind(editTextBehavior)
    ];
    
    listeners[UI512EventType.KeyUp.valueOf()] = [BasicHandlers.trackKeyUp];
    listeners[UI512EventType.MouseDownDouble.valueOf()] = [BasicHandlers.trackMouseDoubleDown, editTextBehavior.onMouseDoubleDown.bind(editTextBehavior)];
    listeners[UI512EventType.PasteText.valueOf()] = [editTextBehavior.onPasteText.bind(editTextBehavior)];
}
