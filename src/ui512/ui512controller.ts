
/* autoimport:start */
import { UI512ControllerBase, BasicHandlers, MenuOpenState, TemporaryIgnoreEvents } from "../ui512/ui512controllerbase.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512ViewDraw } from "../ui512/ui512elementsdefaultview.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { SelAndEntryImpl, IGenericTextField, UI512ElTextFieldAsGeneric, SelAndEntry, ClipManager } from "../ui512/ui512elementstextselect.js";
import { ScrollbarImpl, scrollbarIdToscrollbarPartId, scrollbarPartIdToscrollbarId, getIsScrollArrowClicked } from "../ui512/ui512elementsscrollbar.js";
import { MenuBehavior } from "../ui512/ui512menulisteners.js";
import { MenuPositioning } from "../ui512/ui512menurender.js";
import { UI512MenuItem, UI512MenuRoot, UI512MenuDropdown } from "../ui512/ui512elementsmenu.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export enum MouseDragStatus {
    __isUI512Enum = 1,
    None,
    ScrollArrow,
    SelectingText,
    DragAndDrop,
}

export abstract class UI512Controller extends UI512ControllerBase {
    readonly timerblinkperiod = 500;
    clipManager = new ClipManager();
    timerSlowIdle = new RepeatingTimer(this.timerblinkperiod);
    useOSClipboard = false;
    mouseDragStatus: number = MouseDragStatus.None;    
    lang: UI512Lang = new UI512LangNull();

    init(root: Root) {
        this.clipManager.root = root;
    }

    removeEl(gpid: string, elid: string, context = ChangeContext.Default) {
        let grp = this.app.getGroup(gpid);
        let el = grp.findEl(elid);

        if (el && el instanceof UI512ElTextField) {
            ScrollbarImpl.removeScrollbarField(this.app, grp, el);
        } else if (el && el instanceof UI512MenuRoot) {
            MenuPositioning.removeMenuRoot(this.app, grp, el);
        } else if (el) {
            grp.removeElement(elid, context);
        }
    }

    canSelectTextInField(el: UI512ElTextField): boolean {
        // subclasses can provide other logic here
        return true;
    }

    getStandardWindowBounds() {
        return getStandardWindowBounds()
    }

    rebuildFieldScrollbars() {
        for (let grp of this.app.iterGrps()) {
            // don't modify while iterating
            let els: UI512Element[] = [];
            for (let el of grp.iterEls()) {
                els.push(el);
            }

            // now we can modify safely
            let stilldirty: { [key: string]: boolean } = {};
            for (let el of els) {
                if (el instanceof UI512ElTextField) {
                    ScrollbarImpl.rebuildFieldScrollbar(this.app, grp, el);
                }
            }
        }        
    }

    protected setPositionsForRender(root: Root, cmptotal: RenderComplete) {
        for (let grp of this.app.iterGrps()) {
            // don't modify while iterating!
            let els: UI512Element[] = [];
            for (let el of grp.iterEls()) {
                els.push(el);
            }

            // now we can modify safely
            let stilldirty: { [key: string]: boolean } = {};
            for (let el of els) {
                let cmpthis = new RenderComplete();
                if (el instanceof UI512ElTextField) {
                    ScrollbarImpl.setScrollbarPositionsForRender(root, this.app, grp, el, cmpthis);
                } else if (el instanceof UI512MenuRoot) {
                    MenuPositioning.setMenubarPositionsForRender(root, this.app, el, cmpthis);
                }

                if (!cmpthis.complete) {
                    stilldirty[el.id] = true;
                    cmptotal.complete = false;
                }
            }

            for (let el of grp.iterEls()) {
                el.setdirty(stilldirty[el.id] === true);
            }
        }
    }
}
