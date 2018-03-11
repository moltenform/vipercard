
/* autoimport:start */
import { UI512ControllerBase, BasicHandlers, MenuOpenState, TemporaryIgnoreEvents } from "../ui512/ui512controllerbase.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512ViewDraw } from "../ui512/ui512elementsdefaultview.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { MenuPositioning } from "../ui512/ui512menurender.js";
import { UI512MenuItem, UI512MenuRoot, UI512MenuDropdown } from "../ui512/ui512elementsmenu.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class MenuBehavior {
    static setwhichIsExpanded(c: UI512ControllerBase, menubar: UI512MenuRoot, which: number, context = ChangeContext.Default) {
        if (menubar.get_n("whichIsExpanded") !== which) {
            menubar.set("whichIsExpanded", which);

            // make all the items unhighlighted
            for (let dropdn of menubar.getchildren(c.app)) {
                dropdn.set("highlightactive", false);
                for (let item of dropdn.getchildren(c.app)) {
                    item.set("highlightactive", false);
                }
            }
        }
    }

    static setActiveMenuByHeaderId(c: UI512ControllerBase, chosenid: string) {
        let menubar = MenuPositioning.getMenuRoot(c.app);
        let dropdns = menubar.getchildren(c.app);
        for (let i = 0; i < dropdns.length; i++) {
            let menu = dropdns[i];
            if (chosenid === menu.id) {
                MenuBehavior.closeAllActiveMenus(c);
                MenuBehavior.setwhichIsExpanded(c, menubar, i);
                return true;
            }
        }

        return false;
    }

    static canHighlightMenuItem(el: UI512Element) {
        if (el instanceof UI512MenuItem) {
            return el.enabled && el.get_s("labeltext") !== "---";
        }

        return false;
    }

    static closeAllActiveMenus(c: UI512ControllerBase) {
        // close all the menus.
        let menubar = MenuPositioning.getMenuRoot(c.app);
        menubar.set("whichIsExpanded", -1);
    }

    static isAnyMenuActive(c: UI512ControllerBase) {
        let menubar = MenuPositioning.getMenuRoot(c.app);
        return menubar.get_n("whichIsExpanded") >= 0;
    }

    static respondToMenuItemClick(c: UI512ControllerBase, root: Root, item: UI512MenuItem, d: MouseUpEventDetails) {
        let sendEvent = () => {
            MenuBehavior.closeAllActiveMenus(c);
            c.openState = MenuOpenState.MenusClosed;
            
            try {
                c.rawEvent(root, new MenuItemClickedDetails(item.id, d.mods));
                if ((c as any).cursorRefreshPending !== undefined) {
                    (c as any).cursorRefreshPending = true
                }
            } catch (e) {
                ui512RespondError(e, "MenuItemClicked response")
            }
        };

        // don't add any listeners; we'll ignore all events during the anim
        let ignore = new IgnoreDuringAnimation(item, sendEvent);
        c.tmpIgnore = ignore;
        ignore.capture(c);

        // don't send the normal mouse-up event
        d.setHandled();
    }

    static onMouseDown(c: UI512ControllerBase, root: Root, d: MouseDownEventDetails) {
        if (d.button !== 0) {
            return;
        }

        if (d.el && d.el instanceof UI512MenuDropdown) {
            if (c.openState === MenuOpenState.MenusClosed) {
                if (d.el.id !== "topClock") {
                    MenuBehavior.setActiveMenuByHeaderId(c, d.el.id);
                    c.openState = MenuOpenState.MenusOpenInitialMouseDown;
                }
            }
        }
    }

    static onMouseUp(c: UI512ControllerBase, root: Root, d: MouseUpEventDetails) {
        if (d.button !== 0) {
            return;
        }

        // for normal buttons, a full click needs mousedown and mouseup on the same element
        // for menu items, it only matters where the mouseup is, ignore elFullClick and use elRaw
        if (d.elRaw && MenuBehavior.canHighlightMenuItem(d.elRaw)) {
            MenuBehavior.respondToMenuItemClick(c, root, cast(d.elRaw, UI512MenuItem), d);
        } else if (d.elRaw && d.elRaw instanceof UI512MenuDropdown) {
            if (c.openState === MenuOpenState.MenusClosed) {
                // pass
            } else if (c.openState === MenuOpenState.MenusOpenInitialMouseDown) {
                c.openState = MenuOpenState.MenusOpen;
            } else if (c.openState === MenuOpenState.MenusOpen) {
                MenuBehavior.closeAllActiveMenus(c);
                c.openState = MenuOpenState.MenusClosed;
            }
        } else {
            MenuBehavior.closeAllActiveMenus(c);
            c.openState = MenuOpenState.MenusClosed;
        }
    }

    static onMouseEnter(c: UI512ControllerBase, root: Root, d: MouseEnterDetails) {
        if (d.el && d.el instanceof UI512MenuItem) {
            d.el.set("highlightactive", true);
        }

        if (d.el && d.el instanceof UI512MenuDropdown && c.openState !== MenuOpenState.MenusClosed) {
            if (d.el.id === "topClock") {
                MenuBehavior.closeAllActiveMenus(c);
            } else {
                MenuBehavior.setActiveMenuByHeaderId(c, d.el.id);
            }
        }

        if (d.el && d.el instanceof UI512MenuRoot) {
            MenuBehavior.closeAllActiveMenus(c);
        }

        if (!d.el) {
            MenuBehavior.closeAllActiveMenus(c);
        }
    }

    static onMouseLeave(c: UI512ControllerBase, root: Root, d: MouseLeaveDetails) {
        if (d.el && d.el instanceof UI512MenuItem) {
            d.el.set("highlightactive", false);
        }
    }
}

class IgnoreDuringAnimation extends TemporaryIgnoreEvents {
    readonly msPerStage = 60;
    firstMs = 0;
    stage = -1;
    completed = false;
    constructor(public item: UI512MenuItem, public callback: () => void) {
        super();
    }
    
    shouldRestore(ms: number) {
        if (this.firstMs === 0) {
            this.firstMs = ms;
        }

        let stage = Math.trunc((ms - this.firstMs) / this.msPerStage);
        if (stage !== this.stage) {
            this.stage = stage;
            this.goStage();
        }

        return this.completed;
    }

    whenComplete() {
        this.callback();
    }

    goStage() {
        this.item.set("highlightactive", this.stage % 2 === 0);
        if (this.stage >= 6) {
            this.completed = true;
        }
    }
}
