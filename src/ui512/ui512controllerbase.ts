
/* autoimport:start */
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512ViewDraw } from "../ui512/ui512elementsdefaultview.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export abstract class UI512ControllerBase extends UI512ControllerAbstract {
    readonly defaultPriority = 10;
    readonly maxMouseButtons = 5;
    private _currentFocus: O<string>;
    trackMouse = [-1, -1];
    trackPressedBtns: boolean[] = Util512.repeat(this.maxMouseButtons, false);
    trackClickedIds: O<string>[] = Util512.repeat(this.maxMouseButtons, undefined);
    trackKeyCmd = false;
    trackKeyOption = false;
    trackKeyShift = false;
    listeners: { [t: number]: Function[] } = {};
    callbackQueueFromAsyncs: (O<()=>void>)[] = []
    continueEventAfterError = true
    needRedraw = true;
    view = new UI512ViewDraw();
    inited = false;
    openState = MenuOpenState.MenusClosed;
    tmpIgnore: O<TemporaryIgnoreEvents>;

    importMouseTracking(other:UI512ControllerBase) {
        // but don't copy over trackClickedIds
        if (other.trackMouse !== undefined) {
            this.trackMouse = other.trackMouse 
            this.trackPressedBtns = other.trackPressedBtns
            this.trackKeyCmd = other.trackKeyCmd 
            this.trackKeyOption = other.trackKeyOption 
            this.trackKeyShift = other.trackKeyShift 
        }
    }

    get currentFocus() {
        return this._currentFocus
    }

    setCurrentFocus(root: Root, next:O<string>) {
        if (next !== this._currentFocus) {
            let evt = new FocusChangedEventDetails(this._currentFocus, next)
            
            try {
                this.rawEvent(root, evt)
            } catch (e) {
                ui512RespondError(e, "FocusChangedEvent response")
            }
            
            if (!evt.preventChange) {
                this._currentFocus = next
            }
        }
    }

    listenEvent(type: UI512EventType, fn: Function) {
        let ar = this.listeners[type.valueOf()];
        if (ar !== undefined) {
            ar.push(fn);
        } else {
            this.listeners[type.valueOf()] = [fn];
        }
    }

    rawEvent(root: Root, d: EventDetails) {
        let evtNumber = d.type().valueOf();
        let ar = this.listeners[evtNumber];
        if (ar) {
            // don't use a for/of loop here because it eats exceptions
            for (let i = 0; i < ar.length; i++) {
                let cb = ar[i];
                if (!d.handled()) {
                    try {
                        cb(this, root, d);
                    } catch (e) {
                        ui512RespondError(e, "event " + d.type());
                        if (!this.continueEventAfterError) {
                            break
                        }
                    }
                }
            }
        }

        if (d instanceof MouseMoveEventDetails) {
            if (d.elNext !== d.elPrev) {
                if (d.elPrev) {
                    this.rawEvent(root, new MouseLeaveDetails(d.elPrev));
                }
                if (d.elNext && this.canInteract(d.elNext)) {
                    this.rawEvent(root, new MouseEnterDetails(d.elNext));
                }
            }
        }
    }

    canInteract(el: O<UI512Element>) {
        if (el) {
            return el.enabled && el.visible;
        } else {
            return false;
        }
    }

    changeSeen(context: ChangeContext): void {
        this.needRedraw = true;
    }

    render(root: Root, canvas: CanvasWrapper, ms: number, cmptotal: RenderComplete) {
        if (!this.inited) {
            cmptotal.complete = false;
            return;
        }

        if (this.needRedraw) {
            this.setPositionsForRender(root, cmptotal);
        }

        let ret = this.view.renderApp(root, canvas, cmptotal, this.app, this._currentFocus, this.needRedraw);
        if (cmptotal.complete) {
            this.needRedraw = false;
        }

        if (this.tmpIgnore) {
            this.tmpIgnore.pulse(this, ms);
        }

        return ret;
    }

    invalidateAll() {
        this.needRedraw = true;
    }

    placeCallbackInQueue(cb:()=>void) {
        this.callbackQueueFromAsyncs.push(cb)
    }

    abstract removeEl(gpid: string, elid: string, context: ChangeContext): void;
    protected abstract setPositionsForRender(root: Root, cmptotal: RenderComplete): void;
    abstract rebuildFieldScrollbars():void;
}

export class BasicHandlers {
    static trackMouseStatusMouseDown(c: UI512ControllerBase, root: Root, d: MouseDownEventDetails) {
        if (d.button >= 0 && d.button < c.trackPressedBtns.length) {
            c.trackPressedBtns[d.button] = true;
        } else {
            d.setHandled();
        }
    }

    static trackMouseStatusMouseUp(c: UI512ControllerBase, root: Root, d: MouseUpEventDetails) {
        if (d.button >= 0 && d.button < c.trackPressedBtns.length) {
            c.trackPressedBtns[d.button] = false;
        } else {
            d.setHandled();
        }
    }

    static trackCurrentElMouseDown(c: UI512ControllerBase, root: Root, d: MouseDownEventDetails) {
        d.el = c.app.coordsToElement(d.mouseX, d.mouseY);
        if (!c.canInteract(d.el)) {
            d.el = undefined;
        }

        if (d.el) {
            c.trackClickedIds[d.button] = d.el.id;
        } else {
            c.trackClickedIds[d.button] = undefined;
        }
    }

    static trackCurrentElMouseUp(c: UI512ControllerBase, root: Root, d: MouseUpEventDetails) {
        d.elRaw = c.app.coordsToElement(d.mouseX, d.mouseY);
        d.elClick = d.elRaw && c.trackClickedIds[d.button] === d.elRaw.id ? d.elRaw : undefined;
        if (!c.canInteract(d.elRaw)) {
            d.elRaw = undefined;
            d.elClick = undefined;
        }

        c.trackClickedIds[d.button] = undefined;
    }

    static trackCurrentElMouseMove(c: UI512ControllerBase, root: Root, d: MouseMoveEventDetails) {
        c.trackMouse = [d.mouseX, d.mouseY];
        d.elNext = c.app.coordsToElement(d.mouseX, d.mouseY);
        d.elPrev = c.app.coordsToElement(d.prevMouseX, d.prevMouseY);
    }

    static trackMouseDoubleDown(c: UI512ControllerBase, root: Root, d: MouseDownDoubleEventDetails) {
        d.el = c.app.coordsToElement(d.mouseX, d.mouseY);
    }

    static trackHighlightedButtonMouseDown(c: UI512ControllerBase, root: Root, d: MouseDownEventDetails) {
        if (d.button === 0 && c.canInteract(d.el) && d.el instanceof UI512ElementWithHighlight) {
            if (d.el.get_b("autohighlight")) {
                d.el.set("highlightactive", true);
            }
        }
    }

    static trackHighlightedButtonMouseUp(c: UI512ControllerBase, root: Root, d: MouseUpEventDetails) {
        if (d.button === 0 && d.elClick && d.elClick instanceof UI512ElementWithHighlight) {
            if (d.elClick.get_b("autohighlight")) {
                d.elClick.set("highlightactive", false);
            }
        }
    }

    static trackHighlightedButtonMouseEnter(c: UI512ControllerBase, root: Root, d: MouseEnterDetails) {
        if (c.trackClickedIds[0] === d.el.id && c.canInteract(d.el) && d.el instanceof UI512ElementWithHighlight) {
            if (d.el.get_b("autohighlight")) {
                d.el.set("highlightactive", true);
            }
        }
    }

    static trackHighlightedButtonMouseLeave(c: UI512ControllerBase, root: Root, d: MouseLeaveDetails) {
        if (d.el && d.el instanceof UI512ElementWithHighlight) {
            if (d.el.get_b("autohighlight")) {
                d.el.set("highlightactive", false);
            }
        }
    }

    static trackKeyDown(c: UI512ControllerBase, root: Root, d: KeyDownEventDetails) {
        if ((d.mods & ModifierKeys.Cmd) !== 0) {
            c.trackKeyCmd = true;
        }
        if ((d.mods & ModifierKeys.Opt) !== 0) {
            c.trackKeyOption = true;
        }
        if ((d.mods & ModifierKeys.Shift) !== 0) {
            c.trackKeyShift = true;
        }
    }

    static trackKeyUp(c: UI512ControllerBase, root: Root, d: KeyUpEventDetails) {
        if ((d.mods & ModifierKeys.Cmd) !== 0) {
            c.trackKeyCmd = false;
        }
        if ((d.mods & ModifierKeys.Opt) !== 0) {
            c.trackKeyOption = false;
        }
        if ((d.mods & ModifierKeys.Shift) !== 0) {
            c.trackKeyShift = false;
        }
    }

    static basicKeyShortcuts(c: UI512ControllerBase, root: Root, d: KeyDownEventDetails) {
        // define a few global hotkeys
        if (!d.repeated) {
            let wasShortcut = true;
            switch (d.readableShortcut) {
                case "Cmd+Opt+Shift+R":
                        c.invalidateAll();
                    break;
                case "Cmd+Opt+Shift+Q":
                        CanvasWrapper.setDebugRenderingWithChangingColors(!CanvasWrapper.debugRenderingWithChangingColors);
                        c.invalidateAll();
                    break;
                case "Opt+T":
                        root.runTests(false);
                        c.invalidateAll();
                    break;
                case "Opt+Shift+T":
                        root.runTests(true);
                        c.invalidateAll();
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

    static onIdleRunCallbackQueueFromAsyncs(c: UI512ControllerBase, root: Root, d: KeyDownEventDetails) {
        for (let i=0; i<c.callbackQueueFromAsyncs.length; i++) {
            // assign it to undefined, so that if it throws, we won't be stuck in a loop calling it over again.
            let cb = c.callbackQueueFromAsyncs[i]
            c.callbackQueueFromAsyncs[i] = undefined
            if (cb) {
                cb()
            }
        }

        c.callbackQueueFromAsyncs = []
    }
}

export enum MenuOpenState {
    __isUI512Enum = 1,
    MenusClosed,
    MenusOpenInitialMouseDown,
    MenusOpen,
}

export abstract class TemporaryIgnoreEvents {
    savedListeners: { [t: number]: Function[] } = {};
    isCaptured = false;
    capture(ctrl: UI512ControllerBase) {
        assertTrue(!this.isCaptured, "2.|can't call capture twice");
        this.savedListeners = ctrl.listeners;
        ctrl.listeners = {};
        this.isCaptured = true;
    }

    abstract whenComplete(): void;
    abstract shouldRestore(ms: number): boolean;
    pulse(ctrl: UI512ControllerBase, ms: number) {
        assertTrue(this.isCaptured, "2-|please call capture first");
        if (this.shouldRestore(ms)) {
            ctrl.listeners = this.savedListeners;
            this.savedListeners = {};
            this.isCaptured = false;
            ctrl.tmpIgnore = undefined;
            this.whenComplete();
        }
    }
}

