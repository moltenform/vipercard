
/* autoimport:start */
import { UI512ControllerBase, BasicHandlers, MenuOpenState, TemporaryIgnoreEvents } from "../ui512/ui512controllerbase.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512ViewDraw } from "../ui512/ui512elementsdefaultview.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512ViewDrawBorders } from "../ui512/ui512renderborders.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class ScrollbarImpl {
    static rebuildFieldScrollbar(app: UI512Application, grp: UI512ElGroup, el: UI512ElTextField) {
        if (!el.get_b("scrollbar")) {
            grp.removeElement(scrollbarIdToscrollbarPartId(el.id, "arrowup"));
            grp.removeElement(scrollbarIdToscrollbarPartId(el.id, "arrowdn"));
            grp.removeElement(scrollbarIdToscrollbarPartId(el.id, "scrollbgup"));
            grp.removeElement(scrollbarIdToscrollbarPartId(el.id, "scrollbgdn"));
            grp.removeElement(scrollbarIdToscrollbarPartId(el.id, "scrollthm"));
        } else {
            let arrowup = new UI512ElButton(scrollbarIdToscrollbarPartId(el.id, "arrowup"), el.observer);
            arrowup.set("visible", false);
            arrowup.set("iconsetid", "001");
            arrowup.set("iconnumber", 23);
            let arrowdn = new UI512ElButton(scrollbarIdToscrollbarPartId(el.id, "arrowdn"), el.observer);
            arrowdn.set("visible", false);
            arrowdn.set("iconsetid", "001");
            arrowdn.set("iconnumber", 24);
            let scrollbgup = new UI512ElButton(scrollbarIdToscrollbarPartId(el.id, "scrollbgup"), el.observer);
            scrollbgup.set("visible", false);
            scrollbgup.set("autohighlight", false);
            let scrollbgdn = new UI512ElButton(scrollbarIdToscrollbarPartId(el.id, "scrollbgdn"), el.observer);
            scrollbgdn.set("visible", false);
            scrollbgdn.set("autohighlight", false);
            let scrollthm = new UI512ElButton(scrollbarIdToscrollbarPartId(el.id, "scrollthm"), el.observer);
            scrollthm.set("visible", false);
            scrollthm.set("autohighlight", false);
            let elparts = [scrollbgup, scrollbgdn, arrowup, arrowdn, scrollthm];
            for (let elpart of elparts) {
                if (!grp.findEl(elpart.id)) {
                    grp.addElementAfter(app, elpart, el.id);
                }
            }
        }
    }

    static setScrollbarPositionsForRender(
        root: Root,
        app: UI512Application,
        grp: UI512ElGroup,
        el: UI512ElTextField,
        complete: RenderComplete
    ) {
        if (!el) {
            return;
        }

        assertEqWarn(
            el.get_b("scrollbar"),
            !!grp.findEl(scrollbarIdToscrollbarPartId(el.id, "arrowup")),
            "forgot to call rebuildFieldScrollbars? " + el.id
        );

        if (!el || !el.visible || !el.getdirty() || !el.get_b("scrollbar")) {
            return;
        }

        let pieces = ScrollbarImpl.getScrollbarPieces(app, el);
        if (ScrollbarImpl.repositionScrollbarFieldShowScrollbar(el, pieces)) {
            for (let key in pieces) {
                if (pieces.hasOwnProperty(key)) {
                    pieces[key].set("visible", true);
                }
            }

            ScrollbarImpl.setScrollbarPositionsForRenderGo(root, el, pieces, complete);
        } else {
            for (let key in pieces) {
                if (pieces.hasOwnProperty(key)) {
                    pieces[key].set("visible", false);
                }
            }
        }
    }

    static setScrollbarPositionsForRenderGo(
        root: Root,
        el: UI512ElTextField,
        pieces: { [key: string]: UI512Element },
        complete: RenderComplete
    ) {
        let scrollratio = ScrollbarImpl.repositionScrollbarGetThumbPos(root, el);
        if (scrollratio === undefined) {
            // font is not yet loaded
            complete.complete = false;
        }

        let sbx = el.right - ScrollConsts.barwidth;
        pieces.arrowup.setDimensions(sbx, el.y, ScrollConsts.boxheight, ScrollConsts.boxheight);
        pieces.arrowdn.setDimensions(sbx, el.bottom - ScrollConsts.boxheight, ScrollConsts.boxheight, ScrollConsts.boxheight);

        if (scrollratio === -1 || scrollratio === undefined) {
            // content is short
            // show blank rectangle with no thumb
            pieces.scrollthm.setDimensions(0, 0, 0, 0);
            pieces.scrollbgdn.setDimensions(0, 0, 0, 0);
            pieces.scrollbgup.setDimensions(pieces.arrowup.x, pieces.arrowup.y, ScrollConsts.barwidth, el.h);

            pieces.scrollbgup.set("iconsetid", "");
            pieces.scrollbgup.set("iconnumber", 0);
            pieces.scrollbgdn.set("iconsetid", "");
            pieces.scrollbgdn.set("iconnumber", 0);
            pieces.arrowup.set("autohighlight", false);
            pieces.arrowup.set("iconnumberwhenhighlight", -1);
            pieces.arrowdn.set("autohighlight", false);
            pieces.arrowdn.set("iconnumberwhenhighlight", -1);

            // important: reset the scroll position
            el.set("scrollamt", 0);
        } else {
            // content is long
            // show thumbnail
            let spaceinbetween = pieces.arrowdn.y - pieces.arrowup.bottom - ScrollConsts.boxheight;
            let thumbPos = Math.floor(scrollratio * spaceinbetween) + pieces.arrowup.bottom;
            let midpoint = thumbPos + Math.floor(ScrollConsts.boxheight / 2);
            midpoint = midpoint + midpoint % 2; // should always be an even number
            pieces.scrollbgup.setDimensions(sbx, el.y, ScrollConsts.barwidth, midpoint - el.y);
            pieces.scrollbgdn.setDimensions(sbx, midpoint, ScrollConsts.barwidth, el.bottom - midpoint);
            pieces.scrollthm.setDimensions(sbx + 1, thumbPos, ScrollConsts.boxheight - 2, ScrollConsts.boxheight);

            pieces.scrollbgup.set("iconsetid", "001");
            pieces.scrollbgup.set("iconnumber", 144);
            pieces.scrollbgup.set("iconadjustsrcx", 2);
            pieces.scrollbgup.set("iconcentered", false);
            pieces.scrollbgdn.set("iconsetid", "001");
            pieces.scrollbgdn.set("iconnumber", 144);
            pieces.scrollbgdn.set("iconadjustsrcx", 2);
            pieces.scrollbgdn.set("iconcentered", false);
            pieces.arrowup.set("autohighlight", true);
            pieces.arrowup.set("iconnumberwhenhighlight", 25);
            pieces.arrowdn.set("autohighlight", true);
            pieces.arrowdn.set("iconnumberwhenhighlight", 26);
        }
    }

    static getScrollbarPieces(app: UI512Application, el: UI512Element): { [key: string]: UI512Element } {
        return {
            arrowup: app.getElemById(scrollbarIdToscrollbarPartId(el.id, "arrowup")),
            arrowdn: app.getElemById(scrollbarIdToscrollbarPartId(el.id, "arrowdn")),
            scrollbgup: app.getElemById(scrollbarIdToscrollbarPartId(el.id, "scrollbgup")),
            scrollbgdn: app.getElemById(scrollbarIdToscrollbarPartId(el.id, "scrollbgdn")),
            scrollthm: app.getElemById(scrollbarIdToscrollbarPartId(el.id, "scrollthm")),
        };
    }

    static removeScrollbarField(app: UI512Application, grp: UI512ElGroup, el: UI512Element) {
        if (el instanceof UI512ElTextField) {
            el.set("scrollbar", false);
            ScrollbarImpl.rebuildFieldScrollbar(app, grp, el);
            grp.removeElement(el.id);
        }
    }

    static repositionScrollbarFieldShowScrollbar(el: UI512Element, pieces: any) {
        for (let key in pieces) {
            if (!pieces[key]) {
                assertTrueWarn(false, `2_|not found ${el.id} ${key}`);
                return false;
            }
        }

        return el.w > ScrollConsts.barwidth + 1 && el.h > 3 * ScrollConsts.boxheight + 1;
    }

    protected static simulateDrawField(
        root: Root,
        el: UI512ElTextField,
        measureHeight: boolean,
        drawBeyondVisible: boolean,
        callbackPerChar: O<(charindex: number, type: CharRectType, bounds: number[]) => boolean>
    ) {
        let b = new UI512ViewDrawBorders(new CanvasWrapper(undefined), el.x, el.y, el.w, el.h, root, new RenderComplete());
        let view = new UI512ViewDraw();
        let [sborder, subrect] = view.getSubRectForField(b, el);
        if (!subrect) {
            subrect = [0, 0, 0, 0];
        }

        let fontmanager = root.getFontManager() as TextRendererFontManager;
        let [rtextargs, rtext] = renderTextArgsFromEl(el, subrect, false);
        rtextargs.callbackPerChar = callbackPerChar;
        rtextargs.drawBeyondVisible = drawBeyondVisible;
        if (measureHeight) {
            rtextargs.boxy = 0;
            rtextargs.boxh = largearea;
            rtextargs.vscrollamt = 0;
        }

        let drawn = fontmanager.drawFormattedStringIntoBox(rtext, undefined, rtextargs);
        return drawn ? drawn : undefined;
    }

    static getMouseCoordToSetCaret(root: Root, el: UI512ElTextField, x: number, y: number) {
        let [found, lowest] = ScrollbarImpl.getCoordToCharInField(root, el, x, y, false /* draw beyond visible */);
        if (found && found.length > 0) {
            let charindex = found[4];
            if (found[5] === CharRectType.Char) {
                // split each letter in half. if you clicked on the left side of the letter, go left
                // if you clicked on the right side of the letter, go right.
                let midpoint = found[0] + Math.floor(found[2] / 2);
                let ret = x > midpoint ? charindex + 1 : charindex;
                ret = fitIntoInclusive(ret, 0, el.get_ftxt().len());
                return ret;
            } else {
                // padding area always belongs to its adjacent character
                return found[4];
            }
        } else if (RectUtils.hasPoint(x, y, el.x, el.y, el.w, el.h) && lowest !== undefined && y >= lowest) {
            // user clicked below all of the text
            return el.get_ftxt().len();
        } else {
            return undefined;
        }
    }

    static getCoordToCharInField(
        root: Root,
        el: UI512ElTextField,
        x: number,
        y: number,
        drawBeyondVisible: boolean
    ): [O<number[]>, O<number>] {
        // if font loaded but pos not seen: return []
        // if font not yet loaded: return undefined
        let lowest = -1;
        let found: number[] = [];
        let cb = (charindex: number, type: CharRectType, bounds: number[]) => {
            lowest = Math.max(lowest, bounds[1] + bounds[3]);
            if (RectUtils.hasPoint(x, y, bounds[0], bounds[1], bounds[2], bounds[3])) {
                found = [bounds[0], bounds[1], bounds[2], bounds[3], charindex, type, 0];
                return false; // we can stop iterating now
            } else {
                return true;
            }
        };

        let drawn = ScrollbarImpl.simulateDrawField(root, el, false /*measure height*/, drawBeyondVisible, cb);
        return drawn ? [found, lowest] : [undefined, undefined];
    }

    static getCharacterInFieldToPosition(root: Root, el: UI512ElTextField, index: number) {
        // if font loaded but char not seen: return []
        // if font not yet loaded: return undefined
        let found: number[] = [];
        let cb = (charindex: number, type: CharRectType, bounds: number[]) => {
            if (type === CharRectType.Char && charindex === index) {
                found = [bounds[0], bounds[1], bounds[2], bounds[3], charindex, type];
                return false; // we can stop iterating now
            } else {
                return true;
            }
        };

        let drawn = ScrollbarImpl.simulateDrawField(root, el, false /*measure height*/, true /*beyond visible*/, cb);
        return drawn ? found : undefined;
    }

    static getScrollPosThatWouldMakeStartCaretVisible(root: Root, el: UI512ElTextField): O<number> {
        el.set("showcaret", true);
        if (!el.get_n("scrollamt") && !el.get_b("scrollbar")) {
            // perf optimization; we don't care about scrolling for non-scrollbar fields.
            return;
        }

        let index = el.get_n("selcaret");
        let contentHeightInPixels = ScrollbarImpl.getCachedHeightOfField(root, el);
        if (!contentHeightInPixels) {
            // font not yet loaded
            return;
        }

        let maxscroll = contentHeightInPixels - el.h;
        if (maxscroll <= 0) {
            // we can see everything in the field, no need to set the scroll
            return;
        }

        let found = ScrollbarImpl.getCharacterInFieldToPosition(root, el, index);
        if (found && found.length > 0) {
            let drawnY = found[1];
            let drawnBottom = found[1] + found[3];
            let chgScroll = 0;
            if (drawnY > el.y && drawnBottom < el.bottom) {
                // it's already visible, we are ok
            } else if (drawnY <= el.y) {
                chgScroll = drawnY - el.y;
            } else if (drawnBottom >= el.bottom) {
                chgScroll = drawnBottom - el.bottom;
            }

            if (chgScroll !== 0) {
                let scroll = el.get_n("scrollamt") + chgScroll;
                scroll = fitIntoInclusive(scroll, 0, maxscroll);
                return scroll;
            }
        }
    }

    static getCachedHeightOfField(root: Root, el: UI512ElTextField) {
        let cachedHeight = el.get_n("contentHeightInPixels");
        if (cachedHeight && cachedHeight !== -1) {
            return cachedHeight;
        } else {
            let drawn = ScrollbarImpl.simulateDrawField(root, el, true /*measure height*/, true /*beyond visible*/, undefined);
            if (drawn) {
                let ret = drawn.lowestpixeldrawn + ScrollConsts.padBottomOfField;
                el.set("contentHeightInPixels", ret);
                return ret;
            } else {
                return undefined;
            }
        }
    }

    static repositionScrollbarGetThumbPos(root: Root, el: UI512ElTextField) {
        let contentHeightInPixels = ScrollbarImpl.getCachedHeightOfField(root, el);
        if (contentHeightInPixels === undefined) {
            return undefined;
        }

        let maxscroll = contentHeightInPixels - el.h;
        if (maxscroll <= 0) {
            return -1;
        }

        let scrollratio = el.get_n("scrollamt") / (maxscroll + 0.0);
        scrollratio = fitIntoInclusive(scrollratio, 0.0, 1.0);
        return scrollratio;
    }

    static onScrollArrowClicked(c: UI512ControllerBase, arrowid: string, amt: number) {
        let fldid = scrollbarPartIdToscrollbarId(arrowid);
        let el = c.app.findElemById(fldid);
        if (el) {
            let contentHeightInPixels = el.get_n("contentHeightInPixels");
            if (!contentHeightInPixels || contentHeightInPixels === -1) {
                // looks like the font hasn't loaded yet.
                // for simplicity, let's just ignore this click
                return;
            }

            let maxscroll = contentHeightInPixels - el.h;
            if (maxscroll <= 0) {
                // the content is too short for a scrollbar to even be needed
                return;
            }

            let curscroll = el.get_n("scrollamt");
            curscroll += amt;
            curscroll = fitIntoInclusive(curscroll, 0, maxscroll);
            el.set("scrollamt", curscroll);
        }
    }

    static getApproxLineHeight(root: Root, el: UI512ElTextField, index: number) {
        if (el.get_ftxt().len() === 0) {
            return;
        }

        index = fitIntoInclusive(index, 0, el.get_ftxt().len() - 1);
        let font = el.get_ftxt().fontAt(index);
        let textGetHeight = new FormattedText();
        textGetHeight.push("|".charCodeAt(0), font);

        let fontmanager = root.getFontManager() as TextRendererFontManager;
        let args = new RenderTextArgs(0, 0, largearea, largearea, false, false, false);
        args.addvspacing = el.get_n("addvspacing");
        let drawn = fontmanager.drawFormattedStringIntoBox(textGetHeight, undefined, args);
        if (drawn) {
            return drawn.lowestpixeldrawn;
        } else {
            // font not yet loaded
            return undefined;
        }
    }
}

export function scrollbarIdToscrollbarPartId(s: string, partname: string) {
    return s + "##sb##" + partname;
}

export function scrollbarPartIdToscrollbarId(s: string) {
    let pts = s.split("##sb##");
    assertTrue(pts.length > 1, "2^|unexpected element id");
    return pts[0];
}

export function getIsScrollArrowClicked(elid: string) {
    if (elid.endsWith("##sb##arrowdn")) {
        return 15;
    } else if (elid.endsWith("##sb##arrowup")) {
        return -15;
    } else if (elid.endsWith("##sb##scrollbgdn")) {
        return 100;
    } else if (elid.endsWith("##sb##scrollbgup")) {
        return -100;
    } else {
        return undefined;
    }
}
