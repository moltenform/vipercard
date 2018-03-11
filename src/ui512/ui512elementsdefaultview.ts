
/* autoimport:start */
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { IconInfo, RenderIcon, RenderIconSet, RenderIconManager, UI512ImageCollectionCollection, UI512ImageCollection, UI512ImageCollectionImage } from "../ui512/ui512rendericon.js";
import { UI512ViewDrawBorders } from "../ui512/ui512renderborders.js";
import { clrBlack, clrWhite, clrTransp, makePainterCvDataDraw, makePainterCvDataWithPatternSupport, simplifyPattern, needsPatternSupport, makePainterCvCanvas, UI512Painter, DissolveImages, UI512ImageSerialization, PaintOntoCanvasShapes, PaintOntoCanvas } from "../ui512/ui512paint.js";
import { UI512MenuItem, UI512MenuRoot, UI512MenuDropdown } from "../ui512/ui512elementsmenu.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

import { isRelease, projectBuildStamp1, projectBuildStamp2, projectBuildStamp3 } from "../appsettings.js";

export class UI512ViewDraw {
    allowMultipleFocus = false;
    
    getSubRect(b: UI512ViewDrawBorders, padx: number, pady: number) {
        return RectUtils.getSubRectRaw(b.bx, b.by, b.w, b.h, padx, pady);
    }

    drawFillIfDefined(b: UI512ViewDrawBorders, rect: number[], fillstyle: string) {
        if (rect) {
            b.canvas.fillRect(rect[0], rect[1], rect[2], rect[3], b.bx, b.by, b.w, b.h, fillstyle);
        }
    }

    drawInvertIfDefined(b: UI512ViewDrawBorders, rect: number[]) {
        if (rect) {
            b.canvas.invertColorsRect(rect[0], rect[1], rect[2], rect[3], b.bx, b.by, b.w, b.h);
        }
    }

    drawTextIfDefined(
        b: UI512ViewDrawBorders,
        rect: O<number[]>,
        text: string,
        wrap: boolean,
        halign: boolean,
        valign: boolean,
        styleEnabled:boolean
    ) {
        if (rect) {
            let opts = new RenderTextArgs(rect[0], rect[1], rect[2], rect[3], halign, valign, wrap);
            return this.drawTextIfDefinedOpts(b, text, opts, styleEnabled);
        } else {
            return undefined;
        }
    }

    drawTextIfDefinedOpts(b: UI512ViewDrawBorders, text: string, opts: RenderTextArgs, styleEnabled: boolean) {
        let fontManager = cast(b.root.getFontManager(), TextRendererFontManager);
        if (!styleEnabled) {
            text = TextRendererFontManager.makeInitialTextDisabled(text)
        }

        let drawn = fontManager.drawStringIntoBox(text, b.canvas, opts);
        if (drawn) {
            return drawn;
        } else {
            b.complete.complete = false;
            return undefined;
        }
    }

    drawIconIfDefined(b: UI512ViewDrawBorders, rect: O<number[]>, iconinfo: IconInfo, overrideCentered?: boolean) {
        if (rect) {
            const iconcentered = overrideCentered === undefined ? iconinfo.iconcentered : overrideCentered;
            let iconManager = cast(b.root.getIconManager(), RenderIconManager);
            let icon = iconManager.findIcon(iconinfo.iconsetid, iconinfo.iconnumber);
            if (icon) {
                icon.drawIntoBox(b.canvas, iconinfo, rect[0], rect[1], rect[2], rect[3]);
            } else {
                b.complete.complete = false;
            }
        }
    }

    drawBothTextAndIcon(b: UI512ViewDrawBorders, rect: O<number[]>, iconinfo: IconInfo, s: string, styleEnabled:boolean) {
        const lineheight = 12;
        const marginbetween = 0;
        let srcrect = RenderIconSet.lookupRectangle(iconinfo.iconsetid, iconinfo.iconnumber);
        if (rect && srcrect) {
            let iconheight = srcrect[3] + iconinfo.iconadjustheight;
            let boxIconAndTextWidth = rect[2];
            let boxIconAndTextHeight = iconheight + marginbetween + lineheight;
            let boxIconAndTextX = rect[0];
            let boxIconAndTextY = rect[1] + Math.trunc((rect[3] - boxIconAndTextHeight) / 2);

            if (boxIconAndTextWidth <= rect[2] && boxIconAndTextHeight <= rect[3]) {
                let boxIconOnly = [boxIconAndTextX, boxIconAndTextY, boxIconAndTextWidth, iconheight];
                this.drawIconIfDefined(b, boxIconOnly, iconinfo);
                let boxTextOnlyX = boxIconAndTextX;
                let boxTextOnlyY = boxIconAndTextY + iconheight + marginbetween;
                let boxTextOnlyWidth = boxIconAndTextWidth;
                let boxTextOnlyHeight = Math.max(1, rect[3] - (boxTextOnlyY - rect[1]));

                // Follow what HC does and set the font to 9pt Geneva. in fact, in HC no other font is supported.
                let style = styleEnabled ? "biuosdce" : "biuos+dce";
                let labelsmall = TextRendererFontManager.setInitialFont(s, `geneva_9_${style}`);

                // Follow what HC does and strip out any newlines
                labelsmall = labelsmall.replace(/\r|\n/g, "");
                let boxText = [boxTextOnlyX, boxTextOnlyY, boxTextOnlyWidth, boxTextOnlyWidth];

                // Follow what HC does and do not wrap the label text, even if asked to
                this.drawTextIfDefined(b, boxText, labelsmall, false /*wrap*/, true /*halign*/, false /*valign*/, styleEnabled);
            }
        }
    }

    renderButtonCheckbox(b: UI512ViewDrawBorders, el: UI512ElementButtonGeneral) {
        const spacebetweencheckandtext = 4,
            padleft = 2,
            iconwidth = 12;
        let iconinfo = new IconInfo("001", -1);
        iconinfo.iconcentered = true;

        if (el.get_n("style") === UI512BtnStyle.radio && el.get_b("checkmark")) {
            iconinfo.iconnumber = el.get_b("highlightactive") ? 34 : 32;
        } else if (el.get_n("style") === UI512BtnStyle.radio && !el.get_b("checkmark")) {
            iconinfo.iconnumber = el.get_b("highlightactive") ? 35 : 33;
        } else if (el.get_b("checkmark")) {
            iconinfo.iconnumber = el.get_b("highlightactive") ? 30 : 28;
        } else {
            iconinfo.iconnumber = el.get_b("highlightactive") ? 31 : 29;
        }

        let boxIcon = [b.bx + padleft, b.by, padleft + iconwidth, b.h];
        let boxTextX = b.bx + padleft + iconwidth + spacebetweencheckandtext;
        let boxTextY = b.by;
        let boxText = [boxTextX, boxTextY, b.w - (boxTextX - b.bx), b.h];
        if (boxIcon[2] > 0 && boxText[2] > 0) {
            iconinfo.iconcentered = true;

            this.drawIconIfDefined(b, boxIcon, iconinfo);
            this.drawTextIfDefined(
                b,
                boxText,
                el.get_s("labeltext"),
                el.get_b("labelwrap"),
                el.get_b("labelhalign"),
                el.get_b("labelvalign"),
                el.get_b('enabledstyle')
            );
        }
    }

    iconInfoFromEl(el: UI512ElementWithHighlight): O<IconInfo> {
        if (el.get_s("iconsetid").length > 0 && el.get_n("iconnumber") >= 0) {
            let ret = new IconInfo(el.get_s("iconsetid"), el.get_n("iconnumber"));
            ret.iconadjustx = el.get_n("iconadjustx");
            ret.iconadjusty = el.get_n("iconadjusty");
            ret.iconadjustwidth = el.get_n("iconadjustwidth");
            ret.iconadjustheight = el.get_n("iconadjustheight");
            ret.iconadjustsrcx = el.get_n("iconadjustsrcx");
            ret.iconadjustsrcy = el.get_n("iconadjustsrcy");
            ret.iconcentered = el.get_b("iconcentered");
            if (el.get_b("highlightactive") && el.get_n("iconnumberwhenhighlight") >= 0) {
                ret.iconnumber = el.get_n("iconnumberwhenhighlight");
            }

            return ret;
        } else {
            return undefined;
        }
    }

    renderButtonTextOrIcon(b: UI512ViewDrawBorders, el: UI512ElementButtonGeneral, padx: number, pady: number) {
        assertTrue(b.w > 2 * padx, "4h|too small");
        assertTrue(b.h > 2 * pady, "4g|too small");

        let iconinfo = this.iconInfoFromEl(el);
        let subrect = this.getSubRect(b, padx, pady);
        if (!slength(el.get_s("labeltext")) && !iconinfo) {
            // nothing to do
        } else if (slength(el.get_s("labeltext")) && !iconinfo) {
            this.drawTextIfDefined(
                b,
                subrect,
                el.get_s("labeltext"),
                el.get_b("labelwrap"),
                el.get_b("labelhalign"),
                el.get_b("labelvalign"),
                el.get_b('enabledstyle')
            );
        } else if (!slength(el.get_s("labeltext")) && iconinfo) {
            this.drawIconIfDefined(b, subrect, iconinfo);
        } else if (slength(el.get_s("labeltext")) && iconinfo) {
            this.drawBothTextAndIcon(b, subrect, iconinfo, el.get_s("labeltext"), el.get_b('enabledstyle'));
        }
    }

    renderButtonStandard(
        b: UI512ViewDrawBorders,
        el: UI512ElementButtonGeneral,
        fnNotHighlight: Function,
        fnHighlight: Function,
        decorationSize: number
    ) {
        if (el.get_b("highlightactive") && el.get_n("iconnumberwhenhighlight") === -1) {
            // draw the border
            fnHighlight.apply(b);
            let subrect = this.getSubRect(b, decorationSize, decorationSize);
            if (subrect && !b.didFallbackToSimpleRect) {
                // clear the insides
                this.drawFillIfDefined(b, subrect, "white");
                // draw the label
                this.renderButtonTextOrIcon(b, el, decorationSize, decorationSize);
                // invert colors on the insides
                this.drawInvertIfDefined(b, subrect);
            }
        } else {
            // draw the border
            fnNotHighlight.apply(b);
            if (!b.didFallbackToSimpleRect && b.w > decorationSize * 2 && b.h > decorationSize * 2) {
                // draw the label
                this.renderButtonTextOrIcon(b, el, decorationSize, decorationSize);
            }
        }
    }

    renderButtonTransparent(b: UI512ViewDrawBorders, el: UI512ElementButtonGeneral) {
        if (el.get_b("highlightactive") && el.get_n("iconnumberwhenhighlight") === -1) {
            b.drawboxnoborder();
            this.renderButtonTextOrIcon(b, el, 0, 0);
            this.drawInvertIfDefined(b, [b.bx, b.by, el.w, el.h]);
        } else {
            this.renderButtonTextOrIcon(b, el, 0, 0);
        }
    }

    drawUI512ElementButtonGeneralMethod(b: UI512ViewDrawBorders, el: UI512ElementButtonGeneral) {
        switch (el.get_n("style")) {
            case UI512BtnStyle.transparent:
                this.renderButtonTransparent(b, el);
                break;
            case UI512BtnStyle.opaque:
                this.renderButtonStandard(b, el, b.drawboxnoborder, b.drawboxnoborderclicked, 1);
                break;
            case UI512BtnStyle.roundrect:
                this.renderButtonStandard(b, el, b.drawvpcbtn, b.drawvpcbtnclicked, 7);
                break;
            case UI512BtnStyle.plain:
                this.renderButtonStandard(b, el, b.drawvpcroundrect, b.drawvpcroundrectclicked, 7);
                break;
            case UI512BtnStyle.shadow:
                this.renderButtonStandard(b, el, b.drawosboxshadow, b.drawosboxshadowclicked, 4);
                break;
            case UI512BtnStyle.osstandard:
                this.renderButtonStandard(b, el, b.drawosbtn, b.drawosbtnclicked, 5);
                break;
            case UI512BtnStyle.osdefault:
                this.renderButtonStandard(b, el, b.drawosdefaultbtn, b.drawosdefaultbtnclicked, 9);
                break;
            case UI512BtnStyle.osboxmodal:
                this.renderButtonStandard(b, el, b.drawosboxmodal, b.drawosboxmodal, 7);
                break;
            case UI512BtnStyle.checkbox:
                this.renderButtonCheckbox(b, el);
                break;
            case UI512BtnStyle.radio:
                this.renderButtonCheckbox(b, el);
                break;
            case UI512BtnStyle.rectangle:
                this.renderButtonStandard(b, el, b.drawboxthinborder, b.drawboxthinborderclicked, 1);
                break;
            default:
                assertTrueWarn(false, `4f|unknown button style ${el.get_n("style")}`);
                this.renderButtonStandard(b, el, b.drawboxthinborder, b.drawboxthinborderclicked, 2);
                break;
        }
    }

    renderStaticLabelTransparentExceptChars(b: UI512ViewDrawBorders, el: UI512ElLabel) {
        // measure the string so that we can white out the space before drawing letters
        let fontmanager = cast(b.root.getFontManager(), TextRendererFontManager);
        let subrectAlmostAll = this.getSubRect(b, 1, 1);
        let measured = fontmanager.measureString(el.get_s("labeltext"));
        if (measured && subrectAlmostAll) {
            // get the smaller rectangle that will contain the text
            let shrinkx = Math.floor((el.w - (measured.rightmostpixeldrawn + ScrollConsts.windowCaptionSpacing)) / 2);

            // the white rectangle should cover the horizontal lines but not the outer border
            let subrect = this.getSubRect(b, Math.max(0, shrinkx), 1);
            if (subrect) {
                b.canvas.fillRect(subrect[0], subrect[1], subrect[2], subrect[3], b.bx, b.by, b.w, b.h, "white");
                subrectAlmostAll[1] += ScrollConsts.windowCaptionAdjustTextY;
                this.drawTextIfDefined(
                    b,
                    subrectAlmostAll,
                    el.get_s("labeltext"),
                    el.get_b("labelwrap"),
                    el.get_b("labelhalign"),
                    el.get_b("labelvalign"),
                    el.get_b('enabledstyle')
                );
            }
        } else {
            b.complete.complete = false;
        }
    }

    drawUI512ElLabelMethod(b: UI512ViewDrawBorders, el: UI512ElLabel) {
        if (el.get_b("transparentExceptChars")) {
            this.renderStaticLabelTransparentExceptChars(b, el);
        } else {
            b.drawboxnoborder();
            let subrect = this.getSubRect(b, 1, 1);
            this.drawTextIfDefined(
                b,
                subrect,
                el.get_s("labeltext"),
                el.get_b("labelwrap"),
                el.get_b("labelhalign"),
                el.get_b("labelvalign"),
                el.get_b('enabledstyle')
            );
        }
    }

    drawUI512MenuRootMethod(b: UI512ViewDrawBorders, el: UI512MenuRoot) {
        if (el.get_s("childids")) {
            b.drawboxnoborder();
            b.canvas.fillRect(el.x, el.bottom - 1, el.w, 1, el.x, el.y, el.w, el.h, "black");
        }
    }

    drawUI512MenuItemMethod(b: UI512ViewDrawBorders, el: UI512MenuItem) {
        if (el.get_s("labeltext") === "---") {
            this.renderMenuItemDivider(b, el);
        } else {
            this.renderMenuItemText(b, el);
        }
    }

    renderMenuItemDivider(b: UI512ViewDrawBorders, el: UI512MenuItem) {
        // instead of drawing lots of dots, use a slice of this black/white image as an "icon"
        let iconinfo = new IconInfo("001", 145);
        let srcrect = RenderIconSet.lookupRectangle(iconinfo.iconsetid, iconinfo.iconnumber);
        assertTrueWarn(srcrect, "4e|expected to get srcrect");
        if (srcrect) {
            let resultingwidth = Math.min(el.w, srcrect[2]);
            let resultingheight = 1;
            const shiftleft = 1;
            iconinfo.iconadjustwidth = shiftleft + resultingwidth - srcrect[2];
            iconinfo.iconadjustheight = resultingheight - srcrect[3];
            iconinfo.iconadjustsrcx = shiftleft;
            iconinfo.iconcentered = true;
            let subrect = [b.bx + MenuConsts.shadowsizeleft, b.by, el.w - (MenuConsts.shadowsizeleft + MenuConsts.shadowsizeright), el.h];

            this.drawIconIfDefined(b, [b.bx, b.by, el.w, el.h], iconinfo);
        }
    }

    renderMenuItemText(b: UI512ViewDrawBorders, el: UI512MenuItem) {
        // draw the checkmark, if applicable
        let boxLeft = [b.bx, b.by, MenuConsts.firstLabelPadding, el.h];
        if (el.get_b("checkmark")) {
            let iconinfo = new IconInfo("001", 19);
            iconinfo.iconcentered = true;
            this.drawIconIfDefined(b, boxLeft, iconinfo);
        }

        // draw the label
        if (el.w > MenuConsts.firstLabelPadding) {
            let boxMain = [b.bx + MenuConsts.firstLabelPadding, b.by, el.w - MenuConsts.firstLabelPadding, el.h];
            this.drawTextIfDefined(b, boxMain, el.get_s("labeltext"), false, false, true, el.get_b('enabledstyle'));
        }

        // draw the second label (cmd shortcut)
        if (el.w > MenuConsts.secondLabelDistance) {
            let boxRight = [b.bx + el.w - MenuConsts.secondLabelDistance, b.by, MenuConsts.secondLabelDistance, el.h];
            this.drawTextIfDefined(b, boxRight, el.get_s("labelhotkey"), false, false, true, el.get_b('enabledstyle'));
        }

        // highlight it
        if (el.get_b("highlightactive") && el.get_b('enabledstyle')) {
            this.drawInvertIfDefined(b, [b.bx, b.by, el.w, el.h]);
        }
    }

    drawUI512ElCanvasPieceMethod(b: UI512ViewDrawBorders, el: UI512ElCanvasPiece) {
        if (el.getCanvasForRead()) {
            b.canvas.drawFromImage(el.getCanvasForRead().canvas, el.get_n("srcx"), el.get_n("srcy"), el.w, el.h, el.x, el.y, el.x, el.y, el.w, el.h);
        }
    }

    protected getBorderAndMarginForField(b: UI512ViewDrawBorders, style: number): [O<Function>, number, number] {
        switch (style) {
            case UI512FldStyle.transparent:
                return [undefined, 3, 1];
            case UI512FldStyle.opaque:
                return [b.drawboxnoborder, 3, 1];
            case UI512FldStyle.shadow:
                return [b.drawosboxshadow, 4, 4];
            case UI512FldStyle.rectangle:
                return [b.drawboxthinborder, 3, 1];
            default:
                assertTrueWarn(false, `4c|unknown field style ${style}`);
                return [b.drawboxthinborder, 3, 1];
        }
    }

    getSubRectForField(b: UI512ViewDrawBorders, el: UI512ElTextField): [O<Function>, O<number[]>] {
        let [fnborder, padx, pady] = this.getBorderAndMarginForField(b, el.get_n("style"));
        if (el.get_b("scrollbar")) {
            // make it smaller to make room for the scrollbar
            b.w = b.w - ScrollConsts.barwidth + 1;
            b.w = Math.max(1, b.w);
        }

        let subrect = this.getSubRect(b, padx, pady);
        return [fnborder, subrect];
    }

    protected drawUI512ElTextFieldMethod(b: UI512ViewDrawBorders, el: UI512ElTextField, hasFocus: boolean) {
        let [fnborder, subrect] = this.getSubRectForField(b, el);
        if (fnborder) {
            fnborder.apply(b);
        }

        if (subrect) {
            let [args, rtext] = renderTextArgsFromEl(el, subrect, hasFocus);
            args.drawBeyondVisible = false;

            let fontManager = cast(b.root.getFontManager(), TextRendererFontManager);
            if (!fontManager.drawFormattedStringIntoBox(rtext, b.canvas, args)) {
                b.complete.complete = false;
            }
        }
    }

    renderAllElements(
        root: Root,
        canvas: CanvasWrapper,
        app: UI512Application,
        bounds: number[],
        complete: RenderComplete,
        currentFocus: O<string>,
        clearBefore = true
    ) {
        if (clearBefore) {
            canvas.fillRect(bounds[0], bounds[1], bounds[2], bounds[3], bounds[0], bounds[1], bounds[2], bounds[3], "white");
        }

        for (let grp of app.iterGrps()) {
            if (grp.getVisible()) {
                for (let el of grp.iterEls()) {
                    this.renderElement(root, canvas, el, el.id === currentFocus, complete);
                }
            }
        }
    }

    renderElement(root: Root, canvas: CanvasWrapper, el: UI512Element, hasFocus: boolean, complete: RenderComplete) {
        assertTrueWarn(el.w >= 0, "4b|too small");
        assertTrueWarn(el.h >= 0, "4a|too small");
        if (el.w === 0 && el.h === 0) {
            return;
        }

        if (!el.visible) {
            return;
        }

        let b = new UI512ViewDrawBorders(canvas, el.x, el.y, el.w, el.h, root, complete);
        hasFocus = hasFocus || this.allowMultipleFocus;
        let methodname = "draw" + el.typeName + "Method";
        Util512.callAsMethodOnClass("UI512ViewDraw", this, methodname, [b, el, hasFocus], false);
    }

    renderApp(
        root: Root,
        canvas: CanvasWrapper,
        cmptotal: RenderComplete,
        app: UI512Application,
        currentFocus: O<string>,
        needRedraw: boolean,
        clearBefore = true
    ) {
        let needDrawBorders = false;
        if (needRedraw) {
            needDrawBorders = true;
            this.renderAllElements(root, canvas, app, app.bounds, cmptotal, currentFocus, clearBefore);
        }

        if (needDrawBorders && clearBefore) {
            this.renderBorders(root, canvas, cmptotal);
        }
    }

    getColorFromBuildStamp() {
        return "black";
    }

    renderBorders(root: Root, canvas: CanvasWrapper, complete: RenderComplete) {
        // draw the thick borders
        // in debug mode, change the color for each build to easily visualize when changes are applied.
        const color = this.getColorFromBuildStamp();
        const screen = [0, 0, ScreenConsts.screenwidth, ScreenConsts.screenheight];

        // left margin
        canvas.fillRect(0, 0, ScreenConsts.xleftmargin, ScreenConsts.screenheight, screen[0], screen[1], screen[2], screen[3], "black");

        // right margin
        canvas.fillRect(
            ScreenConsts.screenwidth - ScreenConsts.xrightmargin,
            0,
            ScreenConsts.screenheight,
            ScreenConsts.xrightmargin,
            screen[0],
            screen[1],
            screen[2],
            screen[3],
            "black"
        );

        // top margin
        canvas.fillRect(0, 0, ScreenConsts.screenwidth, ScreenConsts.ytopmargin, screen[0], screen[1], screen[2], screen[3], "black");

        // bottom margin
        canvas.fillRect(
            0,
            ScreenConsts.screenheight - ScreenConsts.ylowermargin,
            ScreenConsts.screenwidth,
            ScreenConsts.ylowermargin,
            screen[0],
            screen[1],
            screen[2],
            screen[3],
            color
        );

        // draw the rounded corners
        for (let corner of ["nw", "ne", "sw", "se"]) {
            this.renderCurvedCorner(
                canvas,
                corner,
                ScreenConsts.xleftmargin,
                ScreenConsts.ytopmargin,
                0,
                ScreenConsts.ylowermargin,
                screen[2],
                screen[3],
                root,
                complete
            );
        }
    }

    renderCurvedCorner(
        canvas: CanvasWrapper,
        corner: string,
        marginl: number,
        margint: number,
        marginr: number,
        marginb: number,
        screenwidth: number,
        screenheight: number,
        root: Root,
        complete: RenderComplete
    ) {
        let rect = [0, 0, 5, 5];
        if (corner === "nw") {
            rect[0] = marginl;
            rect[1] = margint;
        } else if (corner === "sw") {
            rect[0] = marginl;
            rect[1] = screenheight - rect[3] - marginb;
        } else if (corner === "ne") {
            rect[0] = screenwidth - rect[2] - marginr;
            rect[1] = margint;
        } else if (corner === "se") {
            rect[0] = screenwidth - rect[2] - marginr;
            rect[1] = screenheight - rect[3] - marginb;
        }

        let b = new UI512ViewDrawBorders(canvas, rect[0], rect[1], rect[2], rect[3], root, complete);
        b.drawCorners(corner);
    }
}
