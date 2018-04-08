
/* auto */ import { O, assertTrue, assertTrueWarn } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, Util512, cast, getRoot, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { MenuConsts, ScreenConsts, ScrollConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper, RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { RenderTextArgs, renderTextArgsFromEl } from '../../ui512/draw/ui512DrawTextParams.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { IconInfo, RenderIconGroup } from '../../ui512/draw/ui512DrawIconClasses.js';
/* auto */ import { UI512IconManager } from '../../ui512/draw/ui512DrawIcon.js';
/* auto */ import { UI512ViewDrawBorders } from '../../ui512/draw/ui512DrawBorders.js';
/* auto */ import { UI512Element, UI512ElementWithHighlight } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512ElementsLabel.js';
/* auto */ import { UI512BtnStyle, UI512ElementButtonGeneral } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { UI512ElCanvasPiece } from '../../ui512/elements/ui512ElementsCanvasPiece.js';
/* auto */ import { UI512MenuItem, UI512MenuRoot } from '../../ui512/elements/ui512ElementsMenu.js';

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
        styleEnabled: boolean
    ) {
        if (rect) {
            let opts = new RenderTextArgs(rect[0], rect[1], rect[2], rect[3], halign, valign, wrap);
            return this.drawTextIfDefinedOpts(b, text, opts, styleEnabled);
        } else {
            return undefined;
        }
    }

    drawTextIfDefinedOpts(b: UI512ViewDrawBorders, text: string, opts: RenderTextArgs, styleEnabled: boolean) {
        let fontManager = cast(getRoot().getDrawText(), UI512DrawText);
        if (!styleEnabled) {
            text = UI512DrawText.makeInitialTextDisabled(text);
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
            const iconcentered = overrideCentered === undefined ? iconinfo.centered : overrideCentered;
            let iconManager = cast(getRoot().getDrawIcon(), UI512IconManager);
            let icon = iconManager.findIcon(iconinfo.iconGroup, iconinfo.iconNumber);
            if (icon) {
                icon.drawIntoBox(b.canvas, iconinfo, rect[0], rect[1], rect[2], rect[3]);
            } else {
                b.complete.complete = false;
            }
        }
    }

    drawBothTextAndIcon(
        b: UI512ViewDrawBorders,
        rect: O<number[]>,
        iconinfo: IconInfo,
        s: string,
        styleEnabled: boolean
    ) {
        const lineheight = 12;
        const marginbetween = 0;
        let srcrect = RenderIconGroup.lookupRectangle(iconinfo.iconGroup, iconinfo.iconNumber);
        if (rect && srcrect) {
            let iconheight = srcrect[3] + iconinfo.adjustHeight;
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

                /* Follow what HC does and set the font to 9pt Geneva. in fact, in HC no other font is supported. */
                let style = styleEnabled ? 'biuosdce' : 'biuos+dce';
                let labelsmall = UI512DrawText.setFont(s, `geneva_9_${style}`);

                /* Follow what HC does and strip out any newlines */
                labelsmall = labelsmall.replace(/\r|\n/g, '');
                let boxText = [boxTextOnlyX, boxTextOnlyY, boxTextOnlyWidth, boxTextOnlyWidth];

                /* Follow what HC does and do not wrap the label text, even if asked to */
                this.drawTextIfDefined(
                    b,
                    boxText,
                    labelsmall,
                    false /*wrap*/,
                    true /*halign*/,
                    false /*valign*/,
                    styleEnabled
                );
            }
        }
    }

    renderButtonCheckbox(b: UI512ViewDrawBorders, el: UI512ElementButtonGeneral) {
        const spacebetweencheckandtext = 4;
        const padleft = 2;
        const iconwidth = 12;
        let iconinfo = new IconInfo('001', -1);
        iconinfo.centered = true;

        if (el.get_n('style') === UI512BtnStyle.Radio && el.get_b('checkmark')) {
            iconinfo.iconNumber = el.get_b('highlightactive') ? 34 : 32;
        } else if (el.get_n('style') === UI512BtnStyle.Radio && !el.get_b('checkmark')) {
            iconinfo.iconNumber = el.get_b('highlightactive') ? 35 : 33;
        } else if (el.get_b('checkmark')) {
            iconinfo.iconNumber = el.get_b('highlightactive') ? 30 : 28;
        } else {
            iconinfo.iconNumber = el.get_b('highlightactive') ? 31 : 29;
        }

        let boxIcon = [b.bx + padleft, b.by, padleft + iconwidth, b.h];
        let boxTextX = b.bx + padleft + iconwidth + spacebetweencheckandtext;
        let boxTextY = b.by;
        let boxText = [boxTextX, boxTextY, b.w - (boxTextX - b.bx), b.h];
        if (boxIcon[2] > 0 && boxText[2] > 0) {
            iconinfo.centered = true;

            this.drawIconIfDefined(b, boxIcon, iconinfo);
            this.drawTextIfDefined(
                b,
                boxText,
                el.get_s('labeltext'),
                el.get_b('labelwrap'),
                el.get_b('labelhalign'),
                el.get_b('labelvalign'),
                el.get_b('enabledstyle')
            );
        }
    }

    iconInfoFromEl(el: UI512ElementWithHighlight): O<IconInfo> {
        if (el.get_s('icongroupid').length > 0 && el.get_n('iconnumber') >= 0) {
            let ret = new IconInfo(el.get_s('icongroupid'), el.get_n('iconnumber'));
            ret.adjustX = el.get_n('iconadjustx');
            ret.adjustY = el.get_n('iconadjusty');
            ret.adjustWidth = el.get_n('iconadjustwidth');
            ret.adjustHeight = el.get_n('iconadjustheight');
            ret.adjustSrcX = el.get_n('iconadjustsrcx');
            ret.adjustSrcY = el.get_n('iconadjustsrcy');
            ret.centered = el.get_b('iconcentered');
            if (el.get_b('highlightactive') && el.get_n('iconnumberwhenhighlight') >= 0) {
                ret.iconNumber = el.get_n('iconnumberwhenhighlight');
            }

            return ret;
        } else {
            return undefined;
        }
    }

    renderButtonTextOrIcon(b: UI512ViewDrawBorders, el: UI512ElementButtonGeneral, padx: number, pady: number) {
        assertTrue(b.w > 2 * padx, '4h|too small');
        assertTrue(b.h > 2 * pady, '4g|too small');

        let iconinfo = this.iconInfoFromEl(el);
        let subrect = this.getSubRect(b, padx, pady);
        if (!slength(el.get_s('labeltext')) && !iconinfo) {
            /* nothing to do */
        } else if (slength(el.get_s('labeltext')) && !iconinfo) {
            this.drawTextIfDefined(
                b,
                subrect,
                el.get_s('labeltext'),
                el.get_b('labelwrap'),
                el.get_b('labelhalign'),
                el.get_b('labelvalign'),
                el.get_b('enabledstyle')
            );
        } else if (!slength(el.get_s('labeltext')) && iconinfo) {
            this.drawIconIfDefined(b, subrect, iconinfo);
        } else if (slength(el.get_s('labeltext')) && iconinfo) {
            this.drawBothTextAndIcon(b, subrect, iconinfo, el.get_s('labeltext'), el.get_b('enabledstyle'));
        }
    }

    renderButtonStandard(
        b: UI512ViewDrawBorders,
        el: UI512ElementButtonGeneral,
        fnNotHighlight: Function,
        fnHighlight: Function,
        decorationSize: number
    ) {
        if (el.get_b('highlightactive') && el.get_n('iconnumberwhenhighlight') === -1) {
            /* draw the border */
            fnHighlight.apply(b);
            let subrect = this.getSubRect(b, decorationSize, decorationSize);
            if (subrect && !b.didFallbackToSimpleRect) {
                /* clear the insides */
                this.drawFillIfDefined(b, subrect, 'white');
                /* draw the label */
                this.renderButtonTextOrIcon(b, el, decorationSize, decorationSize);
                /* invert colors on the insides */
                this.drawInvertIfDefined(b, subrect);
            }
        } else {
            /* draw the border */
            fnNotHighlight.apply(b);
            if (!b.didFallbackToSimpleRect && b.w > decorationSize * 2 && b.h > decorationSize * 2) {
                /* draw the label */
                this.renderButtonTextOrIcon(b, el, decorationSize, decorationSize);
            }
        }
    }

    renderButtonTransparent(b: UI512ViewDrawBorders, el: UI512ElementButtonGeneral) {
        if (el.get_b('highlightactive') && el.get_n('iconnumberwhenhighlight') === -1) {
            b.drawboxnoborder();
            this.renderButtonTextOrIcon(b, el, 0, 0);
            this.drawInvertIfDefined(b, [b.bx, b.by, el.w, el.h]);
        } else {
            this.renderButtonTextOrIcon(b, el, 0, 0);
        }
    }

    /* tslint:disable:no-unbound-method */
    drawUI512ElementButtonGeneralMethod(b: UI512ViewDrawBorders, el: UI512ElementButtonGeneral) {
        switch (el.get_n('style')) {
            case UI512BtnStyle.Transparent:
                this.renderButtonTransparent(b, el);
                break;
            case UI512BtnStyle.Opaque:
                this.renderButtonStandard(b, el, b.drawboxnoborder, b.drawboxnoborderclicked, 1);
                break;
            case UI512BtnStyle.RoundRect:
                this.renderButtonStandard(b, el, b.drawvpcbtn, b.drawvpcbtnclicked, 7);
                break;
            case UI512BtnStyle.Plain:
                this.renderButtonStandard(b, el, b.drawvpcroundrect, b.drawvpcroundrectclicked, 7);
                break;
            case UI512BtnStyle.Shadow:
                this.renderButtonStandard(b, el, b.drawosboxshadow, b.drawosboxshadowclicked, 4);
                break;
            case UI512BtnStyle.OSStandard:
                this.renderButtonStandard(b, el, b.drawosbtn, b.drawosbtnclicked, 5);
                break;
            case UI512BtnStyle.OSDefault:
                this.renderButtonStandard(b, el, b.drawosdefaultbtn, b.drawosdefaultbtnclicked, 9);
                break;
            case UI512BtnStyle.OSBoxModal:
                this.renderButtonStandard(b, el, b.drawosboxmodal, b.drawosboxmodal, 7);
                break;
            case UI512BtnStyle.Checkbox:
                this.renderButtonCheckbox(b, el);
                break;
            case UI512BtnStyle.Radio:
                this.renderButtonCheckbox(b, el);
                break;
            case UI512BtnStyle.Rectangle:
                this.renderButtonStandard(b, el, b.drawboxthinborder, b.drawboxthinborderclicked, 1);
                break;
            default:
                assertTrueWarn(false, `4f|unknown button style ${el.get_n('style')}`);
                this.renderButtonStandard(b, el, b.drawboxthinborder, b.drawboxthinborderclicked, 2);
                break;
        }
    }

    renderStaticLabelTransparentExceptChars(b: UI512ViewDrawBorders, el: UI512ElLabel) {
        /* measure the string so that we can white out the space before drawing letters */
        let fontmanager = cast(getRoot().getDrawText(), UI512DrawText);
        let subrectAlmostAll = this.getSubRect(b, 1, 1);
        let measured = fontmanager.measureString(el.get_s('labeltext'));
        if (measured && subrectAlmostAll) {
            /* get the smaller rectangle that will contain the text */
            let shrinkx = Math.floor((el.w - (measured.rightmostPixelDrawn + ScrollConsts.WindowCaptionSpacing)) / 2);

            /* the white rectangle should cover the horizontal lines but not the outer border */
            let subrect = this.getSubRect(b, Math.max(0, shrinkx), 1);
            if (subrect) {
                b.canvas.fillRect(subrect[0], subrect[1], subrect[2], subrect[3], b.bx, b.by, b.w, b.h, 'white');
                subrectAlmostAll[1] += ScrollConsts.WindowCaptionAdjustTextY;
                this.drawTextIfDefined(
                    b,
                    subrectAlmostAll,
                    el.get_s('labeltext'),
                    el.get_b('labelwrap'),
                    el.get_b('labelhalign'),
                    el.get_b('labelvalign'),
                    el.get_b('enabledstyle')
                );
            }
        } else {
            b.complete.complete = false;
        }
    }

    drawUI512ElLabelMethod(b: UI512ViewDrawBorders, el: UI512ElLabel) {
        if (el.get_b('transparentExceptChars')) {
            this.renderStaticLabelTransparentExceptChars(b, el);
        } else {
            b.drawboxnoborder();
            let subrect = this.getSubRect(b, 1, 1);
            this.drawTextIfDefined(
                b,
                subrect,
                el.get_s('labeltext'),
                el.get_b('labelwrap'),
                el.get_b('labelhalign'),
                el.get_b('labelvalign'),
                el.get_b('enabledstyle')
            );
        }
    }

    drawUI512MenuRootMethod(b: UI512ViewDrawBorders, el: UI512MenuRoot) {
        if (el.get_s('childids')) {
            b.drawboxnoborder();
            b.canvas.fillRect(el.x, el.bottom - 1, el.w, 1, el.x, el.y, el.w, el.h, 'black');
        }
    }

    drawUI512MenuItemMethod(b: UI512ViewDrawBorders, el: UI512MenuItem) {
        if (el.get_s('labeltext') === '---') {
            this.renderMenuItemDivider(b, el);
        } else {
            this.renderMenuItemText(b, el);
        }
    }

    renderMenuItemDivider(b: UI512ViewDrawBorders, el: UI512MenuItem) {
        /* instead of drawing lots of dots, use a slice of this black/white image as an "icon" */
        let iconinfo = new IconInfo('001', 145);
        let srcrect = RenderIconGroup.lookupRectangle(iconinfo.iconGroup, iconinfo.iconNumber);
        assertTrueWarn(srcrect, '4e|expected to get srcrect');
        if (srcrect) {
            let resultingwidth = Math.min(el.w, srcrect[2]);
            let resultingheight = 1;
            const shiftleft = 1;
            iconinfo.adjustWidth = shiftleft + resultingwidth - srcrect[2];
            iconinfo.adjustHeight = resultingheight - srcrect[3];
            iconinfo.adjustSrcX = shiftleft;
            iconinfo.centered = true;
            let subrect = [
                b.bx + MenuConsts.ShadowSizeLeft,
                b.by,
                el.w - (MenuConsts.ShadowSizeLeft + MenuConsts.ShadowSizeRight),
                el.h,
            ];

            this.drawIconIfDefined(b, [b.bx, b.by, el.w, el.h], iconinfo);
        }
    }

    renderMenuItemText(b: UI512ViewDrawBorders, el: UI512MenuItem) {
        /* draw the checkmark, if applicable */
        let boxLeft = [b.bx, b.by, MenuConsts.FirstLabelPadding, el.h];
        if (el.get_b('checkmark')) {
            let iconinfo = new IconInfo('001', 19);
            iconinfo.centered = true;
            this.drawIconIfDefined(b, boxLeft, iconinfo);
        }

        /* draw the label */
        if (el.w > MenuConsts.FirstLabelPadding) {
            let boxMain = [b.bx + MenuConsts.FirstLabelPadding, b.by, el.w - MenuConsts.FirstLabelPadding, el.h];
            this.drawTextIfDefined(b, boxMain, el.get_s('labeltext'), false, false, true, el.get_b('enabledstyle'));
        }

        /* draw the second label (cmd shortcut) */
        if (el.w > MenuConsts.SecondLabelDistance) {
            let boxRight = [b.bx + el.w - MenuConsts.SecondLabelDistance, b.by, MenuConsts.SecondLabelDistance, el.h];
            this.drawTextIfDefined(b, boxRight, el.get_s('labelhotkey'), false, false, true, el.get_b('enabledstyle'));
        }

        /* highlight it */
        if (el.get_b('highlightactive') && el.get_b('enabledstyle')) {
            this.drawInvertIfDefined(b, [b.bx, b.by, el.w, el.h]);
        }
    }

    drawUI512ElCanvasPieceMethod(b: UI512ViewDrawBorders, el: UI512ElCanvasPiece) {
        if (el.getCanvasForRead()) {
            b.canvas.drawFromImage(
                el.getCanvasForRead().canvas,
                el.get_n('srcx'),
                el.get_n('srcy'),
                el.w,
                el.h,
                el.x,
                el.y,
                el.x,
                el.y,
                el.w,
                el.h
            );
        }
    }

    protected getBorderAndMarginForField(b: UI512ViewDrawBorders, style: number): [O<Function>, number, number] {
        switch (style) {
            case UI512FldStyle.Transparent:
                return [undefined, 3, 1];
            case UI512FldStyle.Opaque:
                return [b.drawboxnoborder, 3, 1];
            case UI512FldStyle.Shadow:
                return [b.drawosboxshadow, 4, 4];
            case UI512FldStyle.Rectangle:
                return [b.drawboxthinborder, 3, 1];
            default:
                assertTrueWarn(false, `4c|unknown field style ${style}`);
                return [b.drawboxthinborder, 3, 1];
        }
    }

    getSubRectForField(b: UI512ViewDrawBorders, el: UI512ElTextField): [O<Function>, O<number[]>] {
        let [fnborder, padx, pady] = this.getBorderAndMarginForField(b, el.get_n('style'));
        if (el.get_b('scrollbar')) {
            /* make it smaller to make room for the scrollbar */
            b.w = b.w - ScrollConsts.BarWidth + 1;
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

            let fontManager = cast(getRoot().getDrawText(), UI512DrawText);
            if (!fontManager.drawFormattedStringIntoBox(rtext, b.canvas, args)) {
                b.complete.complete = false;
            }
        }
    }

    renderAllElements(

        canvas: CanvasWrapper,
        app: UI512Application,
        bounds: number[],
        complete: RenderComplete,
        currentFocus: O<string>,
        clearBefore = true
    ) {
        if (clearBefore) {
            canvas.fillRect(
                bounds[0],
                bounds[1],
                bounds[2],
                bounds[3],
                bounds[0],
                bounds[1],
                bounds[2],
                bounds[3],
                'white'
            );
        }

        for (let grp of app.iterGrps()) {
            if (grp.getVisible()) {
                for (let el of grp.iterEls()) {
                    this.renderElement(canvas, el, el.id === currentFocus, complete);
                }
            }
        }
    }

    renderElement(canvas: CanvasWrapper, el: UI512Element, hasFocus: boolean, complete: RenderComplete) {
        assertTrueWarn(el.w >= 0, '4b|too small');
        assertTrueWarn(el.h >= 0, '4a|too small');
        if (el.w === 0 && el.h === 0) {
            return;
        }

        if (!el.visible) {
            return;
        }

        let b = new UI512ViewDrawBorders(canvas, el.x, el.y, el.w, el.h, complete);
        hasFocus = hasFocus || this.allowMultipleFocus;
        let methodname = 'draw' + el.typeName + 'Method';
        Util512.callAsMethodOnClass('UI512ViewDraw', this, methodname, [b, el, hasFocus], false);
    }

    renderApp(

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
            this.renderAllElements(canvas, app, app.bounds, cmptotal, currentFocus, clearBefore);
        }

        if (needDrawBorders && clearBefore) {
            this.renderBorders(canvas, cmptotal);
        }
    }

    getColorFromBuildStamp() {
        return 'black';
    }

    renderBorders(canvas: CanvasWrapper, complete: RenderComplete) {
        /* draw the thick borders */
        /* in debug mode, change the color for each build to easily visualize when changes are applied. */
        const color = this.getColorFromBuildStamp();
        const screen = [0, 0, ScreenConsts.ScreenWidth, ScreenConsts.ScreenHeight];

        /* left margin */
        canvas.fillRect(
            0,
            0,
            ScreenConsts.xLeftMargin,
            ScreenConsts.ScreenHeight,
            screen[0],
            screen[1],
            screen[2],
            screen[3],
            'black'
        );

        /* right margin */
        canvas.fillRect(
            ScreenConsts.ScreenWidth - ScreenConsts.xRightMargin,
            0,
            ScreenConsts.ScreenHeight,
            ScreenConsts.xRightMargin,
            screen[0],
            screen[1],
            screen[2],
            screen[3],
            'black'
        );

        /* top margin */
        canvas.fillRect(
            0,
            0,
            ScreenConsts.ScreenWidth,
            ScreenConsts.yTopMargin,
            screen[0],
            screen[1],
            screen[2],
            screen[3],
            'black'
        );

        /* bottom margin */
        canvas.fillRect(
            0,
            ScreenConsts.ScreenHeight - ScreenConsts.yLowerMargin,
            ScreenConsts.ScreenWidth,
            ScreenConsts.yLowerMargin,
            screen[0],
            screen[1],
            screen[2],
            screen[3],
            color
        );

        /* draw the rounded corners */
        for (let corner of ['nw', 'ne', 'sw', 'se']) {
            this.renderCurvedCorner(
                canvas,
                corner,
                ScreenConsts.xLeftMargin,
                ScreenConsts.yTopMargin,
                0,
                ScreenConsts.yLowerMargin,
                screen[2],
                screen[3],
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

        complete: RenderComplete
    ) {
        let rect = [0, 0, 5, 5];
        if (corner === 'nw') {
            rect[0] = marginl;
            rect[1] = margint;
        } else if (corner === 'sw') {
            rect[0] = marginl;
            rect[1] = screenheight - rect[3] - marginb;
        } else if (corner === 'ne') {
            rect[0] = screenwidth - rect[2] - marginr;
            rect[1] = margint;
        } else if (corner === 'se') {
            rect[0] = screenwidth - rect[2] - marginr;
            rect[1] = screenheight - rect[3] - marginb;
        }

        let b = new UI512ViewDrawBorders(canvas, rect[0], rect[1], rect[2], rect[3], complete);
        b.drawCorners(corner);
    }
}
