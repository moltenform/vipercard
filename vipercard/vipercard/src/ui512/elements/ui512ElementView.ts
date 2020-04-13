
/* auto */ import { MenuConsts, ScreenConsts, ScrollConsts } from './../utils/utilsDrawConstants';
/* auto */ import { CanvasWrapper, RectUtils } from './../utils/utilsCanvasDraw';
/* auto */ import { RenderComplete, VoidFn, getRoot } from './../utils/util512Higher';
/* auto */ import { O, bool } from './../utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../utils/util512AssertCustom';
/* auto */ import { Util512, cast, slength } from './../utils/util512';
/* auto */ import { UI512ElTextField, UI512FldStyle } from './ui512ElementTextField';
/* auto */ import { UI512MenuItem, UI512MenuRoot } from './ui512ElementMenu';
/* auto */ import { UI512ElLabel } from './ui512ElementLabel';
/* auto */ import { UI512ElCanvasPiece } from './ui512ElementCanvasPiece';
/* auto */ import { UI512BtnStyle, UI512ElementButtonBase } from './ui512ElementButton';
/* auto */ import { UI512Application } from './ui512ElementApp';
/* auto */ import { UI512Element, UI512ElementWithHighlight } from './ui512Element';
/* auto */ import { DrawTextArgs, drawTextArgsFromEl } from './../draw/ui512DrawTextArgs';
/* auto */ import { UI512DrawText } from './../draw/ui512DrawText';
/* auto */ import { UI512IconManager } from './../draw/ui512DrawIconManager';
/* auto */ import { IconInfo, RenderIconGroup } from './../draw/ui512DrawIconClasses';
/* auto */ import { UI512ViewDrawBorders } from './../draw/ui512DrawBorders';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * draw UI elements onto a canvas
 */
export class UI512ViewDraw {
    allowMultipleFocus = false;

    /**
     * shrink a rectangle by a defined amount of padding, and keep it centered.
     */
    getSubRect(b: UI512ViewDrawBorders, padX: number, padY: number) {
        return RectUtils.getSubRectRaw(b.bx, b.by, b.w, b.h, padX, padY);
    }

    /**
     * fill a rectangle, no-op if rect isn't set
     */
    drawFillIfDefined(b: UI512ViewDrawBorders, rect: number[], fillStyle: string) {
        if (rect) {
            b.canvas.fillRect(
                rect[0],
                rect[1],
                rect[2],
                rect[3],
                b.bx,
                b.by,
                b.w,
                b.h,
                fillStyle
            );
        }
    }

    /**
     * invert colors for a rectangle, no-op if rect isn't set
     */
    drawInvertIfDefined(b: UI512ViewDrawBorders, rect: number[]) {
        if (rect) {
            b.canvas.invertColorsRect(
                rect[0],
                rect[1],
                rect[2],
                rect[3],
                b.bx,
                b.by,
                b.w,
                b.h
            );
        }
    }

    /**
     * draw text in a rectangle, no-op if rect isn't set
     */
    drawTextIfDefined(
        b: UI512ViewDrawBorders,
        rect: O<number[]>,
        text: string,
        wrap: boolean,
        hAlign: boolean,
        vAlign: boolean,
        styleEnabled: boolean
    ) {
        if (rect) {
            let opts = new DrawTextArgs(
                rect[0],
                rect[1],
                rect[2],
                rect[3],
                hAlign,
                vAlign,
                wrap
            );
            return this.drawText(b, text, opts, styleEnabled);
        } else {
            return undefined;
        }
    }

    /**
     * draw text in a rectangle from element, no-op if rect isn't set
     */
    drawTextIfDefinedFromEl(
        b: UI512ViewDrawBorders,
        rect: O<number[]>,
        el: UI512Element
    ) {
        return this.drawTextIfDefined(
            b,
            rect,
            el.getS('labeltext'),
            el.getB('labelwrap'),
            el.getB('labelhalign'),
            el.getB('labelvalign'),
            el.getB('enabledstyle')
        );
    }

    /**
     * draw text in a rectangle
     */
    drawText(
        b: UI512ViewDrawBorders,
        text: string,
        opts: DrawTextArgs,
        styleEnabled: boolean
    ) {
        let drawText = cast(UI512DrawText, getRoot().getDrawText());
        if (!styleEnabled) {
            text = UI512DrawText.makeInitialTextDisabled(text);
        }

        let drawn = drawText.drawStringIntoBox(text, b.canvas, opts);
        if (drawn) {
            return drawn;
        } else {
            b.complete.complete = false;
            return undefined;
        }
    }

    /**
     * draw icon in a rectangle, no-op if rect isn't set
     */
    drawIconIfDefined(
        b: UI512ViewDrawBorders,
        rect: O<number[]>,
        iconInfo: IconInfo,
        overrideCentered?: boolean
    ) {
        if (rect) {
            //~ const iconCentered =
                //~ overrideCentered === undefined ? iconInfo.centered : overrideCentered;
            let iconManager = cast(UI512IconManager, getRoot().getDrawIcon());
            let icon = iconManager.findIcon(iconInfo.iconGroup, iconInfo.iconNumber);
            if (icon) {
                icon.drawIntoBox(b.canvas, iconInfo, rect[0], rect[1], rect[2], rect[3]);
            } else {
                b.complete.complete = false;
            }
        }
    }

    /**
     * render a button
     */
    renderButtonImpl(
        b: UI512ViewDrawBorders,
        el: UI512ElementButtonBase,
        padX: number,
        padY: number
    ) {
        assertTrue(b.w >= 2 * padX, '4h|too small');
        assertTrue(b.h >= 2 * padY, '4g|too small');

        let iconInfo = this.getIconInfo(el);
        let subRect = this.getSubRect(b, padX, padY);
        if (!slength(el.getS('labeltext')) && !iconInfo) {
            /* case 1) no icon and no label */
        } else if (slength(el.getS('labeltext')) && !iconInfo) {
            /* case 2) no icon and a label */
            this.drawTextIfDefinedFromEl(b, subRect, el);
        } else if (!slength(el.getS('labeltext')) && iconInfo) {
            /* case 3) icon and no label */
            this.drawIconIfDefined(b, subRect, iconInfo);
        } else if (slength(el.getS('labeltext')) && iconInfo) {
            /* case 4) both icon and label */
            this.drawBothTextAndIcon(
                b,
                subRect,
                iconInfo,
                el.getS('labeltext'),
                el.getB('enabledstyle')
            );
        }
    }

    /**
     * draw both text and icon in a rectangle, no-op if rect isn't set
     */
    drawBothTextAndIcon(
        b: UI512ViewDrawBorders,
        rect: O<number[]>,
        iconInfo: IconInfo,
        s: string,
        styleEnabled: boolean
    ) {
        const lineHeight = 12;
        const marginBetween = 0;
        let srcRect = RenderIconGroup.lookupRectangle(
            iconInfo.iconGroup,
            iconInfo.iconNumber
        );
        if (rect && srcRect) {
            let iconH = srcRect[3] + iconInfo.adjustHeight;
            let boxIconAndTextWidth = rect[2];
            let boxIconAndTextHeight = iconH + marginBetween + lineHeight;
            let boxIconAndTextX = rect[0];
            let boxIconAndTextY =
                rect[1] + Math.trunc((rect[3] - boxIconAndTextHeight) / 2);

            if (boxIconAndTextWidth <= rect[2] && boxIconAndTextHeight <= rect[3]) {
                let boxIconOnly = [
                    boxIconAndTextX,
                    boxIconAndTextY,
                    boxIconAndTextWidth,
                    iconH
                ];
                this.drawIconIfDefined(b, boxIconOnly, iconInfo);
                let boxTextOnlyX = boxIconAndTextX;
                let boxTextOnlyY = boxIconAndTextY + iconH + marginBetween;
                let boxTextOnlyWidth = boxIconAndTextWidth;
                /*
                let boxTextOnlyHeight = Math.max(1, rect[3] - (boxTextOnlyY - rect[1]));
                */

                /* Follow what HC does and set the font to 9pt Geneva.
                in fact, in HC no other font is supported. */
                let style = styleEnabled ? 'biuosdce' : 'biuos+dce';
                let labelSmall = UI512DrawText.setFont(s, `geneva_9_${style}`);

                /* Follow what HC does and strip out any newlines */
                labelSmall = labelSmall.replace(/\r|\n/g, '');
                let boxText = [
                    boxTextOnlyX,
                    boxTextOnlyY,
                    boxTextOnlyWidth,
                    boxTextOnlyWidth
                ];

                /* Follow what HC does and do not wrap the label text, even if asked to */
                this.drawTextIfDefined(
                    b,
                    boxText,
                    labelSmall,
                    false /* wrap */,
                    true /* hAlign */,
                    false /* vAlign */,
                    styleEnabled
                );
            }
        }
    }

    /**
     * populate an IconInfo object by getting properties from the element
     */
    getIconInfo(el: UI512ElementWithHighlight): O<IconInfo> {
        if (el.getS('icongroupid').length > 0 && el.getN('iconnumber') >= 0) {
            let ret = new IconInfo(el.getS('icongroupid'), el.getN('iconnumber'));
            ret.adjustX = el.getN('iconadjustx');
            ret.adjustY = el.getN('iconadjusty');
            ret.adjustWidth = el.getN('iconadjustwidth');
            ret.adjustHeight = el.getN('iconadjustheight');
            ret.adjustSrcX = el.getN('iconadjustsrcx');
            ret.adjustSrcY = el.getN('iconadjustsrcy');
            ret.centered = el.getB('iconcentered');
            if (el.getB('highlightactive') && el.getN('iconnumberwhenhighlight') >= 0) {
                ret.iconNumber = el.getN('iconnumberwhenhighlight');
            }

            return ret;
        } else {
            return undefined;
        }
    }

    /**
     * render a checkbox and label
     */
    renderButtonCheckbox(b: UI512ViewDrawBorders, el: UI512ElementButtonBase) {
        let iconInfo = new IconInfo('001', -1);
        iconInfo.centered = true;
        const spaceBetweenCheckAndText = 4;
        const padLeft = 2;
        const iconWidth = 12;

        if (el.getN('style') === UI512BtnStyle.Radio && el.getB('checkmark')) {
            iconInfo.iconNumber = el.getB('highlightactive') ? 34 : 32;
        } else if (el.getN('style') === UI512BtnStyle.Radio && !el.getB('checkmark')) {
            iconInfo.iconNumber = el.getB('highlightactive') ? 35 : 33;
        } else if (el.getB('checkmark')) {
            iconInfo.iconNumber = el.getB('highlightactive') ? 30 : 28;
        } else {
            iconInfo.iconNumber = el.getB('highlightactive') ? 31 : 29;
        }

        let boxIcon = [b.bx + padLeft, b.by, padLeft + iconWidth, b.h];
        let boxTextX = b.bx + padLeft + iconWidth + spaceBetweenCheckAndText;
        let boxTextY = b.by;
        let boxText = [boxTextX, boxTextY, b.w - (boxTextX - b.bx), b.h];
        if (boxIcon[2] > 0 && boxText[2] > 0) {
            iconInfo.centered = true;

            this.drawIconIfDefined(b, boxIcon, iconInfo);
            this.drawTextIfDefinedFromEl(b, boxText, el);
        }
    }

    /**
     * render an opaque button (clears out insides before drawing)
     */
    renderOpaqueButton(
        b: UI512ViewDrawBorders,
        el: UI512ElementButtonBase,
        fnNotHighlight: VoidFn,
        fnHighlight: VoidFn,
        decorationSize: number
    ) {
        if (el.getB('highlightactive') && el.getN('iconnumberwhenhighlight') === -1) {
            /* draw the border */
            fnHighlight.apply(b);
            let subRect = this.getSubRect(b, decorationSize, decorationSize);
            if (subRect && !b.didFallbackToSimpleRect) {
                /* clear the insides */
                this.drawFillIfDefined(b, subRect, 'white');
                /* draw the label */
                this.renderButtonImpl(b, el, decorationSize, decorationSize);
                /* invert colors on the insides */
                this.drawInvertIfDefined(b, subRect);
            }
        } else {
            /* draw the border */
            fnNotHighlight.apply(b);
            if (
                !b.didFallbackToSimpleRect &&
                b.w > decorationSize * 2 &&
                b.h > decorationSize * 2
            ) {
                /* draw the label */
                this.renderButtonImpl(b, el, decorationSize, decorationSize);
            }
        }
    }

    /**
     * draw transparent button
     */
    renderButtonTransparent(b: UI512ViewDrawBorders, el: UI512ElementButtonBase) {
        if (el.getB('highlightactive') && el.getN('iconnumberwhenhighlight') === -1) {
            b.drawboxnoborder();
            this.renderButtonImpl(b, el, 0, 0);
            this.drawInvertIfDefined(b, [b.bx, b.by, el.w, el.h]);
        } else {
            this.renderButtonImpl(b, el, 0, 0);
        }
    }

    /**
     * draw a button
     */
    goUI512ElementButtonBase(b: UI512ViewDrawBorders, el: UI512ElementButtonBase) {
        switch (el.getN('style')) {
            case UI512BtnStyle.Transparent:
                this.renderButtonTransparent(b, el);
                break;
            case UI512BtnStyle.Opaque:
                this.renderOpaqueButton(
                    b,
                    el,
                    b.drawboxnoborder,
                    b.drawboxnoborderclicked,
                    1
                );
                break;
            case UI512BtnStyle.RoundRect:
                this.renderOpaqueButton(b, el, b.drawvpcbtn, b.drawvpcbtnclicked, 7);
                break;
            case UI512BtnStyle.Plain:
                this.renderOpaqueButton(
                    b,
                    el,
                    b.drawvpcroundrect,
                    b.drawvpcroundrectclicked,
                    7
                );
                break;
            case UI512BtnStyle.Shadow:
                this.renderOpaqueButton(
                    b,
                    el,
                    b.drawosboxshadow,
                    b.drawosboxshadowclicked,
                    4
                );
                break;
            case UI512BtnStyle.OSStandard:
                this.renderOpaqueButton(b, el, b.drawosbtn, b.drawosbtnclicked, 5);
                break;
            case UI512BtnStyle.OSDefault:
                this.renderOpaqueButton(
                    b,
                    el,
                    b.drawosdefaultbtn,
                    b.drawosdefaultbtnclicked,
                    9
                );
                break;
            case UI512BtnStyle.OSBoxModal:
                this.renderOpaqueButton(b, el, b.drawosboxmodal, b.drawosboxmodal, 7);
                break;
            case UI512BtnStyle.Checkbox:
                this.renderButtonCheckbox(b, el);
                break;
            case UI512BtnStyle.Radio:
                this.renderButtonCheckbox(b, el);
                break;
            case UI512BtnStyle.Rectangle:
                this.renderOpaqueButton(
                    b,
                    el,
                    b.drawboxthinborder,
                    b.drawboxthinborderclicked,
                    1
                );
                break;
            default:
                assertWarn(false, `4f|unknown button style ${el.getN('style')}`);
                this.renderOpaqueButton(
                    b,
                    el,
                    b.drawboxthinborder,
                    b.drawboxthinborderclicked,
                    2
                );
                break;
        }
    }

    /**
     * draw a mostly-transparent label, used for dialog captions
     */
    renderStaticLabelTransparentExceptChars(b: UI512ViewDrawBorders, el: UI512ElLabel) {
        /* measure the string so that we can white out the space before drawing letters */
        let drawText = cast(UI512DrawText, getRoot().getDrawText());
        let subrectAlmostAll = this.getSubRect(b, 1, 1);
        let measured = drawText.measureString(el.getS('labeltext'));
        if (measured && subrectAlmostAll) {
            /* get the smaller rectangle that will contain the text */
            let shrinkx = Math.floor(
                (el.w -
                    (measured.rightmostPixelDrawn + ScrollConsts.WindowCaptionSpacing)) /
                    2
            );

            /* the white rectangle should cover the horizontal lines
            but not the outer border */
            let subRect = this.getSubRect(b, Math.max(0, shrinkx), 1);
            if (subRect) {
                b.canvas.fillRect(
                    subRect[0],
                    subRect[1],
                    subRect[2],
                    subRect[3],
                    b.bx,
                    b.by,
                    b.w,
                    b.h,
                    'white'
                );
                subrectAlmostAll[1] += ScrollConsts.WindowCaptionAdjustTextY;
                this.drawTextIfDefinedFromEl(b, subrectAlmostAll, el);
            }
        } else {
            b.complete.complete = false;
        }
    }

    /**
     * draw a label
     */
    goUI512ElLabel(b: UI512ViewDrawBorders, el: UI512ElLabel) {
        if (el.getB('transparentExceptChars')) {
            this.renderStaticLabelTransparentExceptChars(b, el);
        } else {
            b.drawboxnoborder();
            let subRect = this.getSubRect(b, 1, 1);
            this.drawTextIfDefinedFromEl(b, subRect, el);
        }
    }

    /**
     * draw a white rectangle for menu root
     */
    goUI512MenuRoot(b: UI512ViewDrawBorders, el: UI512MenuRoot) {
        if (el.getS('childids').length > 0) {
            b.drawboxnoborder();
            b.canvas.fillRect(
                el.x,
                el.bottom - 1,
                el.w,
                1,
                el.x,
                el.y,
                el.w,
                el.h,
                'black'
            );
        }
    }

    /**
     * draw a menu item
     */
    goUI512MenuItem(b: UI512ViewDrawBorders, el: UI512MenuItem) {
        if (el.getS('labeltext') === '---') {
            this.renderMenuItemDivider(b, el);
        } else {
            this.renderMenuItemText(b, el);
        }
    }

    /**
     * draw a grayed-out menu separator item
     */
    renderMenuItemDivider(b: UI512ViewDrawBorders, el: UI512MenuItem) {
        /* faster than drawing lots of dots, draw a carefully sized slice of an image */
        let iconInfo = new IconInfo('001', 145);
        let srcRect = RenderIconGroup.lookupRectangle(
            iconInfo.iconGroup,
            iconInfo.iconNumber
        );
        assertWarn(srcRect, '4e|expected to get srcRect');
        if (srcRect) {
            /* adjust so that the icon width is exactly the width we want */
            let resultingwidth = Math.min(el.w, srcRect[2]);
            let resultingheight = 1;

            /* adjust by 1px so the pattern of dots and dashes looks correct
            against the black border */
            const shiftleft = 1;
            iconInfo.adjustWidth = shiftleft + resultingwidth - srcRect[2];
            iconInfo.adjustHeight = resultingheight - srcRect[3];
            iconInfo.adjustSrcX = shiftleft;
            iconInfo.centered = true;
            this.drawIconIfDefined(b, [b.bx, b.by, el.w, el.h], iconInfo);
        }
    }

    /**
     * render a menu item
     */
    renderMenuItemText(b: UI512ViewDrawBorders, el: UI512MenuItem) {
        /* draw the checkmark, if applicable */
        let boxLeft = [b.bx, b.by, MenuConsts.FirstLabelPadding, el.h];
        if (el.getB('checkmark')) {
            let iconInfo = new IconInfo('001', 19);
            iconInfo.centered = true;
            this.drawIconIfDefined(b, boxLeft, iconInfo);
        }

        /* draw the first text */
        if (el.w > MenuConsts.FirstLabelPadding) {
            let boxMain = [
                b.bx + MenuConsts.FirstLabelPadding,
                b.by,
                el.w - MenuConsts.FirstLabelPadding,
                el.h
            ];
            this.drawTextIfDefined(
                b,
                boxMain,
                el.getS('labeltext'),
                false,
                false,
                true,
                el.getB('enabledstyle')
            );
        }

        /* draw the second text (cmd shortcut) */
        if (el.w > MenuConsts.SecondLabelDistance) {
            let boxRight = [
                b.bx + el.w - MenuConsts.SecondLabelDistance,
                b.by,
                MenuConsts.SecondLabelDistance,
                el.h
            ];
            this.drawTextIfDefined(
                b,
                boxRight,
                el.getS('labelhotkey'),
                false,
                false,
                true,
                el.getB('enabledstyle')
            );
        }

        /* highlight it */
        if (el.getB('highlightactive') && el.getB('enabledstyle')) {
            this.drawInvertIfDefined(b, [b.bx, b.by, el.w, el.h]);
        }
    }

    /**
     * render piece of an image
     */
    goUI512ElCanvasPiece(b: UI512ViewDrawBorders, el: UI512ElCanvasPiece) {
        if (el.getCanvasForRead()) {
            b.canvas.drawFromImage(
                el.getCanvasForRead().canvas,
                el.getN('srcX'),
                el.getN('srcY'),
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

    /**
     * different styles have different borders and margins
     */
    protected getBorderAndMarginForField(
        b: UI512ViewDrawBorders,
        style: number
    ): [O<VoidFn>, number, number] {
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
                assertWarn(false, `4c|unknown field style ${style}`);
                return [b.drawboxthinborder, 3, 1];
        }
    }

    /**
     * shrink a rectangle by a defined amount of padding, and keep it centered.
     */
    getSubRectForField(
        b: UI512ViewDrawBorders,
        el: UI512ElTextField
    ): [O<VoidFn>, O<number[]>] {
        let [fnborder, padX, padY] = this.getBorderAndMarginForField(b, el.getN('style'));
        if (el.getB('scrollbar')) {
            /* make it smaller to make room for the scrollbar */
            b.w = b.w - ScrollConsts.BarWidth + 1;
            b.w = Math.max(1, b.w);
        }

        let subRect = this.getSubRect(b, padX, padY);
        return [fnborder, subRect];
    }

    /**
     * render a text field
     */
    protected goUI512ElTextField(
        b: UI512ViewDrawBorders,
        el: UI512ElTextField,
        hasFocus: boolean
    ) {
        let [fnborder, subRect] = this.getSubRectForField(b, el);
        if (fnborder) {
            fnborder.apply(b);
        }

        if (subRect) {
            let [args, rtext] = drawTextArgsFromEl(el, subRect, hasFocus);
            args.drawBeyondVisible = false;

            let drawText = cast(UI512DrawText, getRoot().getDrawText());
            if (!drawText.drawFormattedStringIntoBox(rtext, b.canvas, args)) {
                b.complete.complete = false;
            }
        }
    }

    /**
     * loop and render everything visible
     * if something can't be rendered, e.g. font isn't loaded yet,
     * the RenderComplete flag will be set to false
     */
    renderAllElements(
        canvas: CanvasWrapper,
        app: UI512Application,
        bounds: number[],
        complete: RenderComplete,
        currentFocus: O<string>,
        clearBefore = true
    ) {
        if (clearBefore) {
            canvas.fillRectUnchecked(bounds[0], bounds[1], bounds[2], bounds[3], 'white');
        }

        for (let grp of app.iterGrps()) {
            if (grp.getVisible()) {
                for (let el of grp.iterEls()) {
                    this.renderElement(canvas, el, el.id === currentFocus, complete);
                }
            }
        }
    }

    /**
     * render an element
     * if something can't be rendered, e.g. font isn't loaded yet,
     * the RenderComplete flag will be set to false
     */
    renderElement(
        canvas: CanvasWrapper,
        el: UI512Element,
        hasFocus: boolean,
        complete: RenderComplete
    ) {
        assertWarn(el.w >= 0, '4b|too small');
        assertWarn(el.h >= 0, '4a|too small');
        if (el.w === 0 && el.h === 0) {
            return;
        } else if (!el.visible) {
            return;
        }

        /* use the 'borders' argument to also store canvas and bounds */
        let b = new UI512ViewDrawBorders(canvas, el.x, el.y, el.w, el.h, complete);
        hasFocus = bool(hasFocus) || bool(this.allowMultipleFocus);
        let methodName = 'go' + el.typename;
        Util512.callAsMethodOnClass(
            'UI512ViewDraw',
            this,
            methodName,
            [b, el, hasFocus],
            false
        );
    }

    /**
     * render everything, including the rounded black corners of the screen
     */
    renderApp(
        canvas: CanvasWrapper,
        cmpTotal: RenderComplete,
        app: UI512Application,
        currentFocus: O<string>,
        needRedraw: boolean,
        clearBefore = true
    ) {
        let needDrawBorders = false;
        if (needRedraw) {
            needDrawBorders = true;
            this.renderAllElements(
                canvas,
                app,
                app.bounds,
                cmpTotal,
                currentFocus,
                clearBefore
            );
        }

        if (needDrawBorders && clearBefore) {
            this.renderBorders(canvas, cmpTotal);
        }
    }

    /**
     * render the rounded black corners of the screen
     */
    renderBorders(canvas: CanvasWrapper, complete: RenderComplete) {
        /* draw the thick borders */
        const color = 'black';
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
            color
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
            color
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
            color
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
        let corners = ['nw', 'ne', 'sw', 'se'];
        for (let i = 0, len = corners.length; i < len; i++) {
            this.renderCurvedCorner(
                canvas,
                corners[i],
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

    /**
     * draw one corner
     */
    renderCurvedCorner(
        canvas: CanvasWrapper,
        corner: string,
        marginL: number,
        marginT: number,
        marginR: number,
        marginB: number,
        screenW: number,
        screenH: number,
        complete: RenderComplete
    ) {
        let rect = [0, 0, 5, 5];
        if (corner === 'nw') {
            rect[0] = marginL;
            rect[1] = marginT;
        } else if (corner === 'sw') {
            rect[0] = marginL;
            rect[1] = screenH - rect[3] - marginB;
        } else if (corner === 'ne') {
            rect[0] = screenW - rect[2] - marginR;
            rect[1] = marginT;
        } else if (corner === 'se') {
            rect[0] = screenW - rect[2] - marginR;
            rect[1] = screenH - rect[3] - marginB;
        }

        let b = new UI512ViewDrawBorders(
            canvas,
            rect[0],
            rect[1],
            rect[2],
            rect[3],
            complete
        );
        b.drawCorners(corner);
    }
}
