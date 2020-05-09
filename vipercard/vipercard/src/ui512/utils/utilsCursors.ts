
/* auto */ import { CanvasWrapper } from './utilsCanvasDraw';
/* auto */ import { getRoot } from './util512Higher';
/* auto */ import { cast } from './util512';
/* auto */ import { UI512IconManager } from './../draw/ui512DrawIconManager';
/* auto */ import { IconInfo } from './../draw/ui512DrawIconClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * NEW CURSOR IMPLEMENTATION
 * We used to use css to specify a cursor, e.g.
 * el.style.cursor = "url('browse.png') 3 3, auto"
 * the problem is that if window.devicePixelRatio != 1,
 * chrome showed the cursor as BLURRY+GLITCHED.
 *
 * The border between white and transparent gains a small
 * gray line for some reason -- it makes no sense. and even
 * if that were solved, it would look blurry.
 * cursors are blurry. due to windows @ 1.25 scaling.
 *    tried adjusting browser zoom
 *    tried setting browser bg to white
 *    tried making it only 95% transparent
 *    tried not pnggauntlet
 *    tried using a .cur not a .png file
 *    tried on a simple page with no canvas
 * I then tried faking a cursor with a <img> moved around by javascript
 *      Pros: simpler code
 *      Pros: can still show the arrow cursor in the black margins, looks nicer
 *      Cons: doesn't look right when page scrolls
 *          (our page never scrolls, enforce with body {position:fixed})
 *      Cons: slightly blurry since it shows at 125% and css-scales to 80%
 *          might get even more blurry as screenmult increases
 *      complication:
 *          the <img> will eat the mousemove events and the cursor gets stuck.
 *          a simple workaround is to OFFSET the <img> and real cursor position
 *          you don't notice, the real cursor is hidden and we can compensate in all clicks
 *      problem: will all corners of the screen be clickable?
 *      problem: on touch devices the offset will mess with where you tap!
 * It would be possible to work around these problems, but let's do this instead:
 * Just draw the cursor on the canvas like everything else
 *      Pros: enables better emulation (original product has cursors that invert)
 *      Pros: never blurry, and we get arbitrary screenmult for free
 *      Cons: has to maintain a graphics buffer or it would be slow
 *
 * Other ppl hitting the same issue:
 * https://stackoverflow.com/questions/35561547/svg-mouse-cursor-blurry-on-retina-display
 * https://jsfiddle.net/jhhbrook/ucuLefut/
 */

/**
 * assign a number to cursor
 * must correlate with canvas.classCursor in style.css
 */
export enum UI512Cursors {
    __isUI512Enum = -1,
    /* the following are set to these numbers to be
    compatible with the original product  */
    lbeam = 1,
    cross = 2,
    plus = 3,
    watch = 4,
    hand = 5,
    arrow = 6,
    busy = 7,
    __AlternateForm__none = arrow /* cursor = none would be frustrating */,
    /* order no longer matters */
    unknown = 8,
    paintbrush = 9,
    painterase,
    paintlasso,
    paintpencil,
    paintrectsel,
    paintspray,
    paintbucket,
    busy2,
    busy3,
    busy4
}

/**
 * x, y offset indicating the active pixel of the cursor
 */
const hotCoords = [
    [0, 0] /* placeholder */,
    [3, 7],
    [7, 7],
    [7, 7],
    [7, 7],
    [6, 0],
    [3, 1],
    [7, 7],
    [3, 1],
    [5, 14],
    [7, 7],
    [2, 13],
    [1, 15],
    [7, 7],
    [2, 2],
    [14, 14],
    [7, 7],
    [7, 7],
    [7, 7]
];

/**
 * certain cursors are neither black nor white,
 * they are the opposite of the underlying content.
 * in the original product, the paintbucket cursor
 * has pixels of both normal and inverted type,
 * but it's barely noticeable and not worth
 * the effort to implement.
 */
const isInvert: { [key: number]: boolean } = {};
isInvert[UI512Cursors.lbeam] = true;
isInvert[UI512Cursors.paintrectsel] = true;
isInvert[UI512Cursors.paintlasso] = true;
isInvert[UI512Cursors.cross] = true;

/**
 * hide cursor when it leaves our canvas, otherwise it looks stuck.
 */
const enum Constants {
    HideCursorWhenThisCloseToLeft = 40,
    HideCursorWhenThisCloseToTop = 40,
    HideCursorWhenThisCloseToRight = 5,
    HideCursorWhenThisCloseToBottom = 5
}

/**
 * cache the current cursor so that repeated calls to setCursor
 * won't have any effect on performance
 */
export class UI512CursorAccess {
    protected static currentCursor = UI512Cursors.unknown;
    protected static currentMx = 0;
    protected static currentMy = 0;
    protected static lastDrawnMx = -1;
    protected static lastDrawnMy = -1;
    protected static lastDrawnCur = -1;
    protected static currentHotX = 0;
    protected static currentHotY = 0;
    protected static wasCursorLoaded = false;
    protected static curInfo = new IconInfo('0cursors1', UI512Cursors.arrow);

    /**
     * get the current cursor
     */
    static getCursor(): UI512Cursors {
        return UI512CursorAccess.currentCursor;
    }

    /**
     * set the cursor
     */
    static setCursor(nextCursor: UI512Cursors, always = false) {
        if (!always && UI512CursorAccess.currentCursor === nextCursor) {
            /* for efficiency, exit early */
            return;
        }

        /* hide the real cursor */
        let el = window.document.getElementById('mainDomCanvas');
        if (el) {
            el.style.cursor = 'none';
        }

        let hots = hotCoords[nextCursor] ?? [0, 0];
        UI512CursorAccess.currentHotX = hots[0];
        UI512CursorAccess.currentHotY = hots[1];
        UI512CursorAccess.curInfo.iconGroup = '0cursors1';
        UI512CursorAccess.curInfo.iconNumber = nextCursor - 1;
        UI512CursorAccess.curInfo.centered = false;
        UI512CursorAccess.currentCursor = nextCursor;
    }

    /**
     * repeatedly calling set cursor to busy makes it spin
     */
    static setCursorSupportRotate(nextCursor: UI512Cursors) {
        if (nextCursor === UI512Cursors.busy) {
            let cycle = [
                UI512Cursors.busy,
                UI512Cursors.busy2,
                UI512Cursors.busy3,
                UI512Cursors.busy4
            ];
            let index = cycle.findIndex(item => item === UI512CursorAccess.currentCursor);
            if (index !== -1) {
                index = (index + 1) % cycle.length;
                return UI512CursorAccess.setCursor(cycle[index]);
            }
        }

        return UI512CursorAccess.setCursor(nextCursor);
    }

    /**
     * called after resizing the window changes the current mult,
     * also called on init()
     */
    static notifyScreenMult(mult: number) {
        /* we don't need to care about mult anymore,
        but we should still refresh the cursor */
        UI512CursorAccess.setCursor(UI512CursorAccess.getCursor(), true);
    }

    /**
     * keep track of the current mouse position!
     * mouse events might be faster or slower than drawFrame events,
     * so it makes sense to handle them separately.
     */
    static onmousemove(x: number, y: number) {
        UI512CursorAccess.currentMx = x;
        UI512CursorAccess.currentMy = y;
    }

    /**
     * draw our virtual cursor onto the screen
     */
    static drawFinalWithCursor(
        buffer: CanvasWrapper,
        final: CanvasWrapper,
        drewAnything: boolean
    ) {
        if (
            !drewAnything &&
            UI512CursorAccess.currentMx === UI512CursorAccess.lastDrawnMx &&
            UI512CursorAccess.currentMy === UI512CursorAccess.lastDrawnMy &&
            UI512CursorAccess.lastDrawnCur === UI512CursorAccess.currentCursor &&
            UI512CursorAccess.wasCursorLoaded
        ) {
            /* we're up to date, don't need to draw anything */
            return;
        }

        /* draw the buffer */
        final.context.drawImage(buffer.canvas, 0, 0);

        /* trick: by hiding the cursor if it's by the edge,
        we are less likely to leave our fake cursor on the screen */
        if (
            !(
                UI512CursorAccess.currentMx < Constants.HideCursorWhenThisCloseToLeft ||
                UI512CursorAccess.currentMx >
                    final.canvas.width - Constants.HideCursorWhenThisCloseToRight ||
                UI512CursorAccess.currentMy < Constants.HideCursorWhenThisCloseToTop ||
                UI512CursorAccess.currentMy >
                    final.canvas.height - Constants.HideCursorWhenThisCloseToBottom
            )
        ) {
            let iconManager = cast(UI512IconManager, getRoot().getDrawIcon());
            let found = iconManager.findIcon(
                UI512CursorAccess.curInfo.iconGroup,
                UI512CursorAccess.curInfo.iconNumber
            );
            if (!found) {
                /* we haven't loaded the cursor image yet!
                    in the meantime, hand-draw a little square cursor */
                UI512CursorAccess.wasCursorLoaded = false;
                final.fillRectUnchecked(
                    UI512CursorAccess.currentMx,
                    UI512CursorAccess.currentMy,
                    8,
                    8,
                    'black'
                );
            } else {
                UI512CursorAccess.wasCursorLoaded = true;
                UI512CursorAccess.curInfo.adjustX =
                    UI512CursorAccess.currentMx - UI512CursorAccess.currentHotX;
                UI512CursorAccess.curInfo.adjustY =
                    UI512CursorAccess.currentMy - UI512CursorAccess.currentHotY;
                if (isInvert[UI512CursorAccess.currentCursor]) {
                    /* be 100% sure that the composite won't get stuck in the wrong mode */
                    try {
                        final.context.globalCompositeOperation = 'difference';
                        found.drawIntoBox(
                            final,
                            UI512CursorAccess.curInfo,
                            0,
                            0,
                            final.canvas.width,
                            final.canvas.height
                        );
                    } finally {
                        final.context.globalCompositeOperation = 'source-over';
                    }
                } else {
                    found.drawIntoBox(
                        final,
                        UI512CursorAccess.curInfo,
                        0,
                        0,
                        final.canvas.width,
                        final.canvas.height
                    );
                }
            }
        }

        UI512CursorAccess.lastDrawnMx = UI512CursorAccess.currentMx;
        UI512CursorAccess.lastDrawnMy = UI512CursorAccess.currentMy;
        UI512CursorAccess.lastDrawnCur = UI512CursorAccess.currentCursor;
    }
}
