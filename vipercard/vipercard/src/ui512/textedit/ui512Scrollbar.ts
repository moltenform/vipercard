
/* auto */ import { ScrollConsts } from './../utils/utilsDrawConstants';
/* auto */ import { CanvasWrapper, RectUtils } from './../utils/utilsCanvasDraw';
/* auto */ import { RenderComplete, getRoot } from './../utils/util512Higher';
/* auto */ import { O, assertTrue, bool } from './../utils/util512Assert';
/* auto */ import { Util512, assertEqWarn, cast, fitIntoInclusive } from './../utils/util512';
/* auto */ import { UI512PresenterWithMenuInterface } from './../menu/ui512PresenterWithMenu';
/* auto */ import { GenericTextField, UI512ElTextFieldAsGeneric } from './ui512GenericField';
/* auto */ import { FormattedText } from './../draw/ui512FormattedText';
/* auto */ import { UI512ViewDraw } from './../elements/ui512ElementView';
/* auto */ import { UI512ElTextField } from './../elements/ui512ElementTextField';
/* auto */ import { UI512ElGroup } from './../elements/ui512ElementGroup';
/* auto */ import { UI512ElButton } from './../elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../elements/ui512Element';
/* auto */ import { CharRectType, FoundCharByLocation, largeArea } from './../draw/ui512DrawTextClasses';
/* auto */ import { DrawTextArgs, drawTextArgsFromEl } from './../draw/ui512DrawTextArgs';
/* auto */ import { UI512DrawText } from './../draw/ui512DrawText';
/* auto */ import { UI512ViewDrawBorders } from './../draw/ui512DrawBorders';

/**
 * creation and positioning of scrollbar elements
 */
export class ScrollbarImpl {
    /**
     * if calling set(), you should always use a GenericTextField and not the UI512Element
     */
    protected gelFromEl(el: O<UI512Element>): O<GenericTextField> {
        return el && el instanceof UI512ElTextField
            ? new UI512ElTextFieldAsGeneric(el)
            : undefined;
    }

    /**
     * construct elements for scrollbar
     */
    buildScrollbar(app: UI512Application, grp: UI512ElGroup, el: UI512ElTextField) {
        let arrowUp = new UI512ElButton(
            fldIdToScrollbarPartId(el.id, 'arrowUp'),
            el.observer
        );
        arrowUp.set('visible', false);
        arrowUp.set('icongroupid', '001');
        arrowUp.set('iconnumber', 23);

        let arrowDn = new UI512ElButton(
            fldIdToScrollbarPartId(el.id, 'arrowDn'),
            el.observer
        );
        arrowDn.set('visible', false);
        arrowDn.set('icongroupid', '001');
        arrowDn.set('iconnumber', 24);

        let scrollBgUp = new UI512ElButton(
            fldIdToScrollbarPartId(el.id, 'scrollBgUp'),
            el.observer
        );
        scrollBgUp.set('visible', false);
        scrollBgUp.set('autohighlight', false);

        let scrollBgDn = new UI512ElButton(
            fldIdToScrollbarPartId(el.id, 'scrollBgDn'),
            el.observer
        );
        scrollBgDn.set('visible', false);
        scrollBgDn.set('autohighlight', false);

        let scrollThm = new UI512ElButton(
            fldIdToScrollbarPartId(el.id, 'scrollThm'),
            el.observer
        );
        scrollThm.set('visible', false);
        scrollThm.set('autohighlight', false);

        let elParts = [scrollBgUp, scrollBgDn, arrowUp, arrowDn, scrollThm];
        for (let elPart of elParts) {
            if (!grp.findEl(elPart.id)) {
                grp.addElementAfter(app, elPart, el.id);
            }
        }
    }

    /**
     * remove elements for scrollbar
     */
    removeScrollbar(app: UI512Application, grp: UI512ElGroup, el: UI512ElTextField) {
        grp.removeElement(fldIdToScrollbarPartId(el.id, 'arrowUp'));
        grp.removeElement(fldIdToScrollbarPartId(el.id, 'arrowDn'));
        grp.removeElement(fldIdToScrollbarPartId(el.id, 'scrollBgUp'));
        grp.removeElement(fldIdToScrollbarPartId(el.id, 'scrollBgDn'));
        grp.removeElement(fldIdToScrollbarPartId(el.id, 'scrollThm'));
    }

    /**
     * position scrollbar elements.
     * if the font has not yet loaded, returns early and doesn't set the RenderComplete flag.
     */
    setPositions(
        app: UI512Application,
        grp: UI512ElGroup,
        el: UI512ElTextField,
        complete: RenderComplete
    ) {
        if (!el) {
            return;
        }

        assertEqWarn(
            el.getB('scrollbar'),
            bool(grp.findEl(fldIdToScrollbarPartId(el.id, 'arrowUp'))),
            'J3|forgot to call rebuildFieldScrollbars? ' + el.id
        );

        if (!el || !el.visible || !el.getDirty() || !el.getB('scrollbar')) {
            return;
        }

        let pieces = this.getScrollbarPieces(app, el);
        if (this.isThereSpaceToShowScrollbar(el)) {
            let pieceEls = Util512.getMapVals(pieces);
            for (let i = 0, len = pieceEls.length; i < len; i++) {
                pieceEls[i].set('visible', true);
            }

            /* set positions */
            this.setPositionsImpl(el, pieces, complete);
        } else {
            /* hide everything if field dimensions are too small to show a scrollbar */
            let pieceEls = Util512.getMapVals(pieces);
            for (let i = 0, len = pieceEls.length; i < len; i++) {
                pieceEls[i].set('visible', false);
            }
        }
    }

    /**
     * set positions
     */
    protected setPositionsImpl(
        el: UI512ElTextField,
        pieces: { [key: string]: UI512Element },
        complete: RenderComplete
    ) {
        let scrollRatio = this.repositionScrollbarGetThumbPos(el);
        if (scrollRatio === undefined) {
            /* font is not yet loaded */
            complete.complete = false;
        }

        /* set position of arrow up and down */
        let sbX = el.right - ScrollConsts.BarWidth;
        pieces.arrowUp.setDimensions(
            sbX,
            el.y,
            ScrollConsts.BoxHeight,
            ScrollConsts.BoxHeight
        );
        pieces.arrowDn.setDimensions(
            sbX,
            el.bottom - ScrollConsts.BoxHeight,
            ScrollConsts.BoxHeight,
            ScrollConsts.BoxHeight
        );

        if (scrollRatio === -1 || scrollRatio === undefined) {
            /* content is short, so */
            /* make the scrollbar look "disabled" and hide the thumb */
            pieces.scrollThm.setDimensions(0, 0, 0, 0);
            pieces.scrollBgDn.setDimensions(0, 0, 0, 0);
            pieces.scrollBgUp.setDimensions(
                pieces.arrowUp.x,
                pieces.arrowUp.y,
                ScrollConsts.BarWidth,
                el.h
            );
            pieces.scrollBgUp.set('icongroupid', '');
            pieces.scrollBgUp.set('iconnumber', 0);
            pieces.scrollBgDn.set('icongroupid', '');
            pieces.scrollBgDn.set('iconnumber', 0);
            pieces.arrowUp.set('autohighlight', false);
            pieces.arrowUp.set('iconnumberwhenhighlight', -1);
            pieces.arrowDn.set('autohighlight', false);
            pieces.arrowDn.set('iconnumberwhenhighlight', -1);
        } else {
            /* content is long enough, so enable the scrollbar */
            let spaceBetween =
                pieces.arrowDn.y - pieces.arrowUp.bottom - ScrollConsts.BoxHeight;
            let thumbPos = Math.floor(scrollRatio * spaceBetween) + pieces.arrowUp.bottom;
            let midpoint = thumbPos + Math.floor(ScrollConsts.BoxHeight / 2);

            /* make it an even number */
            midpoint = midpoint + (midpoint % 2);
            pieces.scrollBgUp.setDimensions(
                sbX,
                el.y,
                ScrollConsts.BarWidth,
                midpoint - el.y
            );
            pieces.scrollBgDn.setDimensions(
                sbX,
                midpoint,
                ScrollConsts.BarWidth,
                el.bottom - midpoint
            );
            pieces.scrollThm.setDimensions(
                sbX + 1,
                thumbPos,
                ScrollConsts.BoxHeight - 2,
                ScrollConsts.BoxHeight
            );

            /* set icons and properties */
            pieces.scrollBgUp.set('icongroupid', '001');
            pieces.scrollBgUp.set('iconnumber', 144);
            pieces.scrollBgUp.set('iconadjustsrcx', 2);
            pieces.scrollBgUp.set('iconcentered', false);
            pieces.scrollBgDn.set('icongroupid', '001');
            pieces.scrollBgDn.set('iconnumber', 144);
            pieces.scrollBgDn.set('iconadjustsrcx', 2);
            pieces.scrollBgDn.set('iconcentered', false);
            pieces.arrowUp.set('autohighlight', true);
            pieces.arrowUp.set('iconnumberwhenhighlight', 25);
            pieces.arrowDn.set('autohighlight', true);
            pieces.arrowDn.set('iconnumberwhenhighlight', 26);
        }
    }

    /**
     * just a convenient way to call getElemById on all the pieces
     */
    protected getScrollbarPieces(
        app: UI512Application,
        el: UI512Element
    ): { [key: string]: UI512Element } {
        return {
            arrowUp: app.getEl(fldIdToScrollbarPartId(el.id, 'arrowUp')),
            arrowDn: app.getEl(fldIdToScrollbarPartId(el.id, 'arrowDn')),
            scrollBgUp: app.getEl(fldIdToScrollbarPartId(el.id, 'scrollBgUp')),
            scrollBgDn: app.getEl(fldIdToScrollbarPartId(el.id, 'scrollBgDn')),
            scrollThm: app.getEl(fldIdToScrollbarPartId(el.id, 'scrollThm'))
        };
    }

    /**
     * remove both the text field and its scrollbar parts
     */
    removeScrollbarField(app: UI512Application, grp: UI512ElGroup, el: UI512Element) {
        if (el instanceof UI512ElTextField) {
            el.set('scrollbar', false);
            this.removeScrollbar(app, grp, el);
            grp.removeElement(el.id);
        }
    }

    /**
     * if there isn't enough space to show the full scrollbar
     * we currently just hide everything. doesn't match original, but simpler.
     */
    isThereSpaceToShowScrollbar(el: UI512Element) {
        return el.w > ScrollConsts.BarWidth + 1 && el.h > 3 * ScrollConsts.BoxHeight + 1;
    }

    /**
     * draw characters in a field -- either to really draw the text,
     * or to find the eventual position-on-screen of a character.
     */
    protected simulateDrawField(
        el: UI512ElTextField,
        measureHeight: boolean,
        drawBeyondVisible: boolean,
        callbackPerChar: O<
            (charindex: number, type: CharRectType, bounds: number[]) => boolean
        >
    ) {
        /* mimic the logic in elementView */
        let b = new UI512ViewDrawBorders(
            new CanvasWrapper(undefined),
            el.x,
            el.y,
            el.w,
            el.h,
            new RenderComplete()
        );
        let view = new UI512ViewDraw();
        let [_, subRect] = view.getSubRectForField(b, el);
        if (!subRect) {
            subRect = [0, 0, 0, 0];
        }

        /* drawBeyondVisible is a perf optimization, telling text render to stop looping
        once it leaves visible area. */
        let drawText = cast(getRoot().getDrawText(), UI512DrawText);
        let [args, fmtText] = drawTextArgsFromEl(el, subRect, false);
        args.callbackPerChar = callbackPerChar;
        args.drawBeyondVisible = drawBeyondVisible;

        if (measureHeight) {
            /* manually specify a very large height for the field, so we can see where
            the last character will be drawn, effectively measuring height of content */
            args.boxY = 0;
            args.boxH = largeArea;
            args.vScrollAmt = 0;
        }

        let drawn = drawText.drawFormattedStringIntoBox(fmtText, undefined, args);
        return drawn ? drawn : undefined;
    }

    /**
     * when you click on a letter in a field, or the margin to left or right, which letter does it correspond with?
     */
    fromMouseCoordsToCaretPosition(el: UI512ElTextField, x: number, y: number) {
        let [found, lowest] = this.getCoordToCharInField(
            el,
            x,
            y,
            false /* draw beyond visible */
        );
        if (found) {
            if (found.type === CharRectType.Char) {
                /* split each letter in half. if you clicked on the left side of the letter, go left */
                /* if you clicked on the right side of the letter, go right. */
                let midpoint = found.x + Math.floor(found.w / 2);
                let ret = x > midpoint ? found.charIndex + 1 : found.charIndex;
                ret = fitIntoInclusive(ret, 0, el.getFmTxt().len());
                return ret;
            } else {
                /* padding area always belongs to its adjacent character */
                return found.charIndex;
            }
        } else if (
            RectUtils.hasPoint(x, y, el.x, el.y, el.w, el.h) &&
            lowest !== undefined &&
            y >= lowest
        ) {
            /* user clicked below all of the text */
            return el.getFmTxt().len();
        } else {
            return undefined;
        }
    }

    /**
     * when you click on a letter in a field, which letter did you click on?
     */
    getCoordToCharInField(
        el: UI512ElTextField,
        x: number,
        y: number,
        drawBeyondVisible: boolean
    ): [O<FoundCharByLocation>, O<number>] {
        /* if font loaded but pos not seen: return [] */
        /* if font not yet loaded: return undefined */
        let lowest = -1;
        let found: O<FoundCharByLocation>;
        let cb = (charindex: number, type: CharRectType, bounds: number[]) => {
            lowest = Math.max(lowest, bounds[1] + bounds[3]);
            if (RectUtils.hasPoint(x, y, bounds[0], bounds[1], bounds[2], bounds[3])) {
                found = new FoundCharByLocation(
                    bounds[0],
                    bounds[1],
                    bounds[2],
                    bounds[3],
                    charindex,
                    type,
                    0
                );

                /* signal that we can stop iterating */
                return false;
            } else {
                return true;
            }
        };

        let drawn = this.simulateDrawField(
            el,
            false /* measure height */,
            drawBeyondVisible,
            cb
        );
        return drawn ? [found, lowest] : [undefined, undefined];
    }

    /**
     * where was the letter drawn on the screen in x, y coordinates?
     */
    getCharacterInFieldToCoords(el: UI512ElTextField, index: number) {
        /* if font loaded but char not seen: return [] */
        /* if font not yet loaded: return undefined */
        let found: number[] = [];
        let cb = (charindex: number, type: CharRectType, bounds: number[]) => {
            if (type === CharRectType.Char && charindex === index) {
                found = [bounds[0], bounds[1], bounds[2], bounds[3], charindex, type];
                return false; /* we can stop iterating now */
            } else {
                return true;
            }
        };

        let drawn = this.simulateDrawField(
            el,
            false /* measure height */,
            true /* beyond visible */,
            cb
        );
        return drawn ? found : undefined;
    }

    /**
     * if there is a lot of content in the field, where should we scroll to so that you can
     * see the caret?
     */
    getScrollPosThatWouldMakeStartCaretVisible(el: UI512ElTextField): O<number> {
        el.set('showcaret', true);
        if (!el.getN('scrollamt') && !el.getB('scrollbar')) {
            /* perf optimization; we don't care about scrolling for non-scrollbar fields. */
            return undefined;
        }

        let index = el.getN('selcaret');
        let contentHeightInPixels = this.getCachedHeightOfField(el);
        if (!contentHeightInPixels) {
            /* font not yet loaded */
            return undefined;
        }

        let maxScroll = contentHeightInPixels - el.h;
        if (maxScroll <= 0) {
            /* we can see everything in the field, no need to set the scroll */
            /* set scroll to 0 */
            return 0;
        }

        let found = this.getCharacterInFieldToCoords(el, index);
        if (found && found.length > 0) {
            let drawnY = found[1];
            let drawnBottom = found[1] + found[3];
            let chgScroll = 0;
            if (drawnY > el.y && drawnBottom < el.bottom) {
                /* it's already visible, we are ok */
            } else if (drawnY <= el.y) {
                chgScroll = drawnY - el.y;
            } else if (drawnBottom >= el.bottom) {
                chgScroll = drawnBottom - el.bottom;
            }

            if (chgScroll !== 0) {
                let scroll = el.getN('scrollamt') + chgScroll;
                scroll = fitIntoInclusive(scroll, 0, maxScroll);
                return scroll;
            }
        }

        return undefined;
    }

    /**
     * get the height of content in the field, for better perf use cached height if available
     */
    getCachedHeightOfField(el: UI512ElTextField) {
        let cachedHeight = el.getN('contentHeightInPixels');
        if (cachedHeight && cachedHeight !== -1) {
            return cachedHeight;
        } else {
            let drawn = this.simulateDrawField(
                el,
                true /* measure height */,
                true /* beyond visible */,
                undefined
            );
            if (drawn) {
                let ret = drawn.lowestPixelDrawn + ScrollConsts.PadBottomOfField;
                el.set('contentHeightInPixels', ret);
                return ret;
            } else {
                return undefined;
            }
        }
    }

    /**
     * the value 'scrollamt' is in pixels, but we want to get the ratio from 0.0 (top) to 1.0 (bottom)
     */
    repositionScrollbarGetThumbPos(el: UI512ElTextField) {
        let contentHeightInPixels = this.getCachedHeightOfField(el);
        if (contentHeightInPixels === undefined) {
            return undefined;
        }

        let maxScroll = contentHeightInPixels - el.h;
        if (maxScroll <= 0) {
            return -1;
        }

        let scrollRatio = el.getN('scrollamt') / (maxScroll + 0.0);
        scrollRatio = fitIntoInclusive(scrollRatio, 0.0, 1.0);
        return scrollRatio;
    }

    /**
     * set scroll amount when clicking scroll bar
     */
    onScrollArrowClicked(
        pr: UI512PresenterWithMenuInterface,
        arrowId: string,
        amt: number
    ) {
        let fldid = scrollbarPartIdToFldId(arrowId);
        let el = pr.app.findEl(fldid);
        let gel = this.gelFromEl(el);
        if (el && gel) {
            let contentHeightInPixels = el.getN('contentHeightInPixels');
            if (!contentHeightInPixels || contentHeightInPixels === -1) {
                /* looks like the font hasn't loaded yet. */
                /* for simplicity, let's just ignore this click */
                return;
            }

            let maxScroll = contentHeightInPixels - el.h;
            if (maxScroll <= 0) {
                /* the content is too short for a scrollbar to even be needed */
                return;
            }

            let curScroll = gel.getScrollAmt();
            curScroll += amt;
            curScroll = fitIntoInclusive(curScroll, 0, maxScroll);
            gel.setScrollAmt(curScroll);
        }
    }

    /**
     * how tall in pixels is a line of text in this field?
     */
    getApproxLineHeight(el: UI512ElTextField, index: number) {
        if (el.getFmTxt().len() === 0) {
            /* field has no content */
            return undefined;
        }

        index = fitIntoInclusive(index, 0, el.getFmTxt().len() - 1);
        let font = el.getFmTxt().fontAt(index);
        let textGetHeight = new FormattedText();
        textGetHeight.push('|'.charCodeAt(0), font);

        let drawText = getRoot().getDrawText() as UI512DrawText;
        let args = new DrawTextArgs(0, 0, largeArea, largeArea, false, false, false);
        args.addVSpacing = el.getN('addvspacing');
        let drawn = drawText.drawFormattedStringIntoBox(textGetHeight, undefined, args);
        if (drawn) {
            return drawn.lowestPixelDrawn;
        } else {
            /* font not yet loaded */
            return undefined;
        }
    }
}

/**
 * scrollbar parts have an id based on the parent element
 */
export function fldIdToScrollbarPartId(elId: string, partName: string) {
    return elId + '##sb##' + partName;
}

/**
 * scrollbar parts have an id based on the parent element
 */
export function scrollbarPartIdToFldId(s: string) {
    let pts = s.split('##sb##');
    assertTrue(pts.length > 1, '2^|unexpected element id');
    return pts[0];
}

/**
 * how far to scroll if clicked
 * if you click on the inside of the scrollbar, not on the arrow, move a greater distance
 */
export function getAmountIfScrollArrowClicked(elId: string) {
    if (elId.endsWith('##sb##arrowDn')) {
        return 15;
    } else if (elId.endsWith('##sb##arrowUp')) {
        return -15;
    } else if (elId.endsWith('##sb##scrollBgDn')) {
        return 100;
    } else if (elId.endsWith('##sb##scrollBgUp')) {
        return -100;
    } else {
        return undefined;
    }
}
