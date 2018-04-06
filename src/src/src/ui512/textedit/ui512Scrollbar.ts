
/* auto */ import { O, assertTrue, assertTrueWarn } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, assertEqWarn, fitIntoInclusive, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ScrollConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper, RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CharRectType, largearea } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { RenderTextArgs, renderTextArgsFromEl } from '../../ui512/draw/ui512DrawTextParams.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512ViewDrawBorders } from '../../ui512/draw/ui512DrawBorders.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { UI512ViewDraw } from '../../ui512/elements/ui512ElementsView.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512PresenterWithMenu.js';
/* auto */ import { IGenericTextField, UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';

export class ScrollbarImpl {
    // any property set should use a IGenericTextField, not directly setting the UI512Element
    protected gelFromEl(el: O<UI512Element>): O<IGenericTextField> {
        return el && el instanceof UI512ElTextField ? new UI512ElTextFieldAsGeneric(el) : undefined;
    }

    rebuildFieldScrollbar(app: UI512Application, grp: UI512ElGroup, el: UI512ElTextField) {
        if (!el.get_b('scrollbar')) {
            grp.removeElement(scrollbarIdToscrollbarPartId(el.id, 'arrowup'));
            grp.removeElement(scrollbarIdToscrollbarPartId(el.id, 'arrowdn'));
            grp.removeElement(scrollbarIdToscrollbarPartId(el.id, 'scrollbgup'));
            grp.removeElement(scrollbarIdToscrollbarPartId(el.id, 'scrollbgdn'));
            grp.removeElement(scrollbarIdToscrollbarPartId(el.id, 'scrollthm'));
        } else {
            let arrowup = new UI512ElButton(scrollbarIdToscrollbarPartId(el.id, 'arrowup'), el.observer);
            arrowup.set('visible', false);
            arrowup.set('iconsetid', '001');
            arrowup.set('iconnumber', 23);
            let arrowdn = new UI512ElButton(scrollbarIdToscrollbarPartId(el.id, 'arrowdn'), el.observer);
            arrowdn.set('visible', false);
            arrowdn.set('iconsetid', '001');
            arrowdn.set('iconnumber', 24);
            let scrollbgup = new UI512ElButton(scrollbarIdToscrollbarPartId(el.id, 'scrollbgup'), el.observer);
            scrollbgup.set('visible', false);
            scrollbgup.set('autohighlight', false);
            let scrollbgdn = new UI512ElButton(scrollbarIdToscrollbarPartId(el.id, 'scrollbgdn'), el.observer);
            scrollbgdn.set('visible', false);
            scrollbgdn.set('autohighlight', false);
            let scrollthm = new UI512ElButton(scrollbarIdToscrollbarPartId(el.id, 'scrollthm'), el.observer);
            scrollthm.set('visible', false);
            scrollthm.set('autohighlight', false);
            let elparts = [scrollbgup, scrollbgdn, arrowup, arrowdn, scrollthm];
            for (let elpart of elparts) {
                if (!grp.findEl(elpart.id)) {
                    grp.addElementAfter(app, elpart, el.id);
                }
            }
        }
    }

    setScrollbarPositionsForRender(

        app: UI512Application,
        grp: UI512ElGroup,
        el: UI512ElTextField,
        complete: RenderComplete
    ) {
        if (!el) {
            return;
        }

        assertEqWarn(
            el.get_b('scrollbar'),
            !!grp.findEl(scrollbarIdToscrollbarPartId(el.id, 'arrowup')),
            'forgot to call rebuildFieldScrollbars? ' + el.id
        );

        if (!el || !el.visible || !el.getdirty() || !el.get_b('scrollbar')) {
            return;
        }

        let pieces = this.getScrollbarPieces(app, el);
        if (this.repositionScrollbarFieldShowScrollbar(el, pieces)) {
            for (let key in pieces) {
                if (pieces.hasOwnProperty(key)) {
                    pieces[key].set('visible', true);
                }
            }

            this.setScrollbarPositionsForRenderGo(el, pieces, complete);
        } else {
            for (let key in pieces) {
                if (pieces.hasOwnProperty(key)) {
                    pieces[key].set('visible', false);
                }
            }
        }
    }

    setScrollbarPositionsForRenderGo(

        el: UI512ElTextField,
        pieces: { [key: string]: UI512Element },
        complete: RenderComplete
    ) {
        let scrollratio = this.repositionScrollbarGetThumbPos(el);
        if (scrollratio === undefined) {
            // font is not yet loaded
            complete.complete = false;
        }

        let sbx = el.right - ScrollConsts.barwidth;
        pieces.arrowup.setDimensions(sbx, el.y, ScrollConsts.boxheight, ScrollConsts.boxheight);
        pieces.arrowdn.setDimensions(
            sbx,
            el.bottom - ScrollConsts.boxheight,
            ScrollConsts.boxheight,
            ScrollConsts.boxheight
        );

        if (scrollratio === -1 || scrollratio === undefined) {
            // content is short
            // show blank rectangle with no thumb
            pieces.scrollthm.setDimensions(0, 0, 0, 0);
            pieces.scrollbgdn.setDimensions(0, 0, 0, 0);
            pieces.scrollbgup.setDimensions(pieces.arrowup.x, pieces.arrowup.y, ScrollConsts.barwidth, el.h);

            pieces.scrollbgup.set('iconsetid', '');
            pieces.scrollbgup.set('iconnumber', 0);
            pieces.scrollbgdn.set('iconsetid', '');
            pieces.scrollbgdn.set('iconnumber', 0);
            pieces.arrowup.set('autohighlight', false);
            pieces.arrowup.set('iconnumberwhenhighlight', -1);
            pieces.arrowdn.set('autohighlight', false);
            pieces.arrowdn.set('iconnumberwhenhighlight', -1);

            // we used to reset scroll position here,
            // but now we reset it in vpcelements/setProp/'style'
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

            pieces.scrollbgup.set('iconsetid', '001');
            pieces.scrollbgup.set('iconnumber', 144);
            pieces.scrollbgup.set('iconadjustsrcx', 2);
            pieces.scrollbgup.set('iconcentered', false);
            pieces.scrollbgdn.set('iconsetid', '001');
            pieces.scrollbgdn.set('iconnumber', 144);
            pieces.scrollbgdn.set('iconadjustsrcx', 2);
            pieces.scrollbgdn.set('iconcentered', false);
            pieces.arrowup.set('autohighlight', true);
            pieces.arrowup.set('iconnumberwhenhighlight', 25);
            pieces.arrowdn.set('autohighlight', true);
            pieces.arrowdn.set('iconnumberwhenhighlight', 26);
        }
    }

    getScrollbarPieces(app: UI512Application, el: UI512Element): { [key: string]: UI512Element } {
        return {
            arrowup: app.getElemById(scrollbarIdToscrollbarPartId(el.id, 'arrowup')),
            arrowdn: app.getElemById(scrollbarIdToscrollbarPartId(el.id, 'arrowdn')),
            scrollbgup: app.getElemById(scrollbarIdToscrollbarPartId(el.id, 'scrollbgup')),
            scrollbgdn: app.getElemById(scrollbarIdToscrollbarPartId(el.id, 'scrollbgdn')),
            scrollthm: app.getElemById(scrollbarIdToscrollbarPartId(el.id, 'scrollthm')),
        };
    }

    removeScrollbarField(app: UI512Application, grp: UI512ElGroup, el: UI512Element) {
        if (el instanceof UI512ElTextField) {
            el.set('scrollbar', false);
            this.rebuildFieldScrollbar(app, grp, el);
            grp.removeElement(el.id);
        }
    }

    repositionScrollbarFieldShowScrollbar(el: UI512Element, pieces: any) {
        for (let key in pieces) {
            if (!pieces[key]) {
                assertTrueWarn(false, `2_|not found ${el.id} ${key}`);
                return false;
            }
        }

        return el.w > ScrollConsts.barwidth + 1 && el.h > 3 * ScrollConsts.boxheight + 1;
    }

    protected simulateDrawField(

        el: UI512ElTextField,
        measureHeight: boolean,
        drawBeyondVisible: boolean,
        callbackPerChar: O<(charindex: number, type: CharRectType, bounds: number[]) => boolean>
    ) {
        let b = new UI512ViewDrawBorders(
            new CanvasWrapper(undefined),
            el.x,
            el.y,
            el.w,
            el.h,
            new RenderComplete()
        );
        let view = new UI512ViewDraw();
        let [sborder, subrect] = view.getSubRectForField(b, el);
        if (!subrect) {
            subrect = [0, 0, 0, 0];
        }

        let fontmanager = getRoot().getFontManager() as TextRendererFontManager;
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

    getMouseCoordToSetCaret(el: UI512ElTextField, x: number, y: number) {
        let [found, lowest] = this.getCoordToCharInField(el, x, y, false /* draw beyond visible */);
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

    getCoordToCharInField(

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

        let drawn = this.simulateDrawField(el, false /*measure height*/, drawBeyondVisible, cb);
        return drawn ? [found, lowest] : [undefined, undefined];
    }

    getCharacterInFieldToPosition(el: UI512ElTextField, index: number) {
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

        let drawn = this.simulateDrawField(el, false /*measure height*/, true /*beyond visible*/, cb);
        return drawn ? found : undefined;
    }

    getScrollPosThatWouldMakeStartCaretVisible(el: UI512ElTextField): O<number> {
        el.set('showcaret', true);
        if (!el.get_n('scrollamt') && !el.get_b('scrollbar')) {
            // perf optimization; we don't care about scrolling for non-scrollbar fields.
            return undefined;
        }

        let index = el.get_n('selcaret');
        let contentHeightInPixels = this.getCachedHeightOfField(el);
        if (!contentHeightInPixels) {
            // font not yet loaded
            return undefined;
        }

        let maxscroll = contentHeightInPixels - el.h;
        if (maxscroll <= 0) {
            // we can see everything in the field, no need to set the scroll
            // set scroll to 0
            return 0;
        }

        let found = this.getCharacterInFieldToPosition(el, index);
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
                let scroll = el.get_n('scrollamt') + chgScroll;
                scroll = fitIntoInclusive(scroll, 0, maxscroll);
                return scroll;
            }
        }
    }

    getCachedHeightOfField(el: UI512ElTextField) {
        let cachedHeight = el.get_n('contentHeightInPixels');
        if (cachedHeight && cachedHeight !== -1) {
            return cachedHeight;
        } else {
            let drawn = this.simulateDrawField(el, true /*measure height*/, true /*beyond visible*/, undefined);
            if (drawn) {
                let ret = drawn.lowestpixeldrawn + ScrollConsts.padBottomOfField;
                el.set('contentHeightInPixels', ret);
                return ret;
            } else {
                return undefined;
            }
        }
    }

    repositionScrollbarGetThumbPos(el: UI512ElTextField) {
        let contentHeightInPixels = this.getCachedHeightOfField(el);
        if (contentHeightInPixels === undefined) {
            return undefined;
        }

        let maxscroll = contentHeightInPixels - el.h;
        if (maxscroll <= 0) {
            return -1;
        }

        let scrollratio = el.get_n('scrollamt') / (maxscroll + 0.0);
        scrollratio = fitIntoInclusive(scrollratio, 0.0, 1.0);
        return scrollratio;
    }

    onScrollArrowClicked(c: UI512PresenterWithMenuInterface, arrowid: string, amt: number) {
        let fldid = scrollbarPartIdToscrollbarId(arrowid);
        let el = c.app.findElemById(fldid);
        let gel = this.gelFromEl(el);
        if (el && gel) {
            let contentHeightInPixels = el.get_n('contentHeightInPixels');
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

            let curscroll = gel.getScrollAmt();
            curscroll += amt;
            curscroll = fitIntoInclusive(curscroll, 0, maxscroll);
            gel.setScrollAmt(curscroll);
        }
    }

    getApproxLineHeight(el: UI512ElTextField, index: number) {
        if (el.get_ftxt().len() === 0) {
            return undefined;
        }

        index = fitIntoInclusive(index, 0, el.get_ftxt().len() - 1);
        let font = el.get_ftxt().fontAt(index);
        let textGetHeight = new FormattedText();
        textGetHeight.push('|'.charCodeAt(0), font);

        let fontmanager = getRoot().getFontManager() as TextRendererFontManager;
        let args = new RenderTextArgs(0, 0, largearea, largearea, false, false, false);
        args.addvspacing = el.get_n('addvspacing');
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
    return s + '##sb##' + partname;
}

export function scrollbarPartIdToscrollbarId(s: string) {
    let pts = s.split('##sb##');
    assertTrue(pts.length > 1, '2^|unexpected element id');
    return pts[0];
}

export function getIsScrollArrowClicked(elid: string) {
    if (elid.endsWith('##sb##arrowdn')) {
        return 15;
    } else if (elid.endsWith('##sb##arrowup')) {
        return -15;
    } else if (elid.endsWith('##sb##scrollbgdn')) {
        return 100;
    } else if (elid.endsWith('##sb##scrollbgup')) {
        return -100;
    } else {
        return undefined;
    }
}
