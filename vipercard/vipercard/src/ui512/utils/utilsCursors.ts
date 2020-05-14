
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
 *
 * Another big downside of drawing the cursor manually:
 *      When javascript is busy, the cursor is stuck.
 *      For example, commiting a drawn spraypaint to the card takes a few hundred milliseconds,
 *      and that delay is noticeable when it causes the cursor to stick.
 *      even worse, if you're running a script that takes a long time,
 *      the cursor is really laggy.
 *      so I've decided to
 *          1) use drawn cursors as often as possible
 *          2) use css cursors for potentially long operations (painting)
 *          3) for the css cursors, try not to have any white-to-transparent borders,
 *              which is one of the main reasons it looked bad (caused a gray line)
 *
 *      If I know the scale is 125%, should I use an 80% cursor to compensate?
 *      Prob not because a) still stretched, fewer pixels
 *          b) devicePixelRatio could be one of 3 things:
 *              os scaling to 125%, browser scaling, or Retina setting it to 2
 *             since I don't know which, hard to know the right approach.
 */

/**
 * assign a number to cursor
 * must correlate with canvas.classCursor in style.css
 */
export enum UI512Cursors {
    __isUI512Enum = -1,
    /* manually drawn cursors
    advantage: looks better */
    /* order here should match order in 0cursors1.png */
    drawn_lbeam = 1,
    drawn_cross,
    drawn_plus,
    drawn_watch,
    drawn_hand,
    drawn_arrow,
    drawn_busy,
    drawn_unknown,
    drawn_paintbrush,
    drawn_painterase,
    drawn_paintlasso,
    drawn_paintpencil,
    drawn_paintrectsel,
    drawn_paintspray,
    drawn_paintbucket,
    drawn_busy2,
    drawn_busy3,
    drawn_busy4,

    /* css cursors
    advantage: still move even when JS is running heavy */
    css_hand,
    css_paintbrush,
    css_paintpencil,
    css_cross,
    css_painterase,
    css_paintspray,
    css_watch,
    css_busy,
    css_busy2,
    css_busy3,
    css_busy4,

    /* what is currently chosen */
    lbeam = drawn_lbeam,
    cross = css_cross,
    plus = drawn_plus,
    watch = css_watch,
    hand = css_hand,
    arrow = drawn_arrow,
    busy = css_busy,
    busy2 = css_busy2,
    busy3 = css_busy3,
    busy4 = css_busy4,
    unknown = drawn_unknown,
    paintbrush = css_paintbrush,
    painterase = drawn_painterase /* use drawn, otherwise size might not match */,
    paintlasso = drawn_paintlasso,
    paintpencil = css_paintpencil,
    paintrectsel = drawn_paintrectsel,
    paintspray = css_paintspray,
    paintbucket = drawn_paintbucket,
    __AlternateForm__none = arrow
}

/**
 * x, y offset indicating the active pixel of the cursor
 */
const hotCoords = [[0, 0] /* placeholder */];
hotCoords[UI512Cursors.drawn_lbeam] = [3, 7];
hotCoords[UI512Cursors.drawn_cross] = [7, 7];
hotCoords[UI512Cursors.drawn_plus] = [7, 7];
hotCoords[UI512Cursors.drawn_watch] = [7, 7];
hotCoords[UI512Cursors.drawn_hand] = [6, 0];
hotCoords[UI512Cursors.drawn_arrow] = [3, 1];
hotCoords[UI512Cursors.drawn_busy] = [7, 7];
hotCoords[UI512Cursors.drawn_unknown] = [3, 1];
hotCoords[UI512Cursors.drawn_paintbrush] = [5, 14];
hotCoords[UI512Cursors.drawn_painterase] = [7, 7];
hotCoords[UI512Cursors.drawn_paintlasso] = [2, 13];
hotCoords[UI512Cursors.drawn_paintpencil] = [1, 15];
hotCoords[UI512Cursors.drawn_paintrectsel] = [7, 7];
hotCoords[UI512Cursors.drawn_paintspray] = [2, 2];
hotCoords[UI512Cursors.drawn_paintbucket] = [14, 14];
hotCoords[UI512Cursors.drawn_busy2] = [7, 7];
hotCoords[UI512Cursors.drawn_busy3] = [7, 7];
hotCoords[UI512Cursors.drawn_busy4] = [7, 7];
hotCoords[UI512Cursors.css_cross] = [7, 7];
hotCoords[UI512Cursors.css_watch] = [7, 7];
hotCoords[UI512Cursors.css_hand] = [6, 0];
hotCoords[UI512Cursors.css_busy] = [7, 7];
hotCoords[UI512Cursors.css_paintbrush] = [5, 14];
hotCoords[UI512Cursors.css_painterase] = [7, 7];
hotCoords[UI512Cursors.css_paintpencil] = [1, 15];
hotCoords[UI512Cursors.css_paintspray] = [2, 2];
hotCoords[UI512Cursors.css_busy2] = [7, 7];
hotCoords[UI512Cursors.css_busy3] = [7, 7];
hotCoords[UI512Cursors.css_busy4] = [7, 7];

const cssCursorFilenames: { [key: number]: string } = {};
cssCursorFilenames[UI512Cursors.css_paintbrush] = 'brush5,14.png';
cssCursorFilenames[UI512Cursors.css_cross] = 'cross7,7.png';
cssCursorFilenames[UI512Cursors.css_painterase] = 'erase7,7.png';
cssCursorFilenames[UI512Cursors.css_hand] = 'hand6,0.png';
cssCursorFilenames[UI512Cursors.css_paintpencil] = 'pencil1,15.png';
cssCursorFilenames[UI512Cursors.css_paintspray] = 'spray2,2.png';
cssCursorFilenames[UI512Cursors.css_busy] = 'xtrabusya7,7.png';
cssCursorFilenames[UI512Cursors.css_busy2] = 'xtrabusyb7,7.png';
cssCursorFilenames[UI512Cursors.css_busy3] = 'xtrabusyc7,7.png';
cssCursorFilenames[UI512Cursors.css_busy4] = 'xtrabusyd7,7.png';
cssCursorFilenames[UI512Cursors.css_watch] = 'xtrawatch7,7.png';

const cssCursorFallbacks: { [key: number]: string } = {};
cssCursorFallbacks[UI512Cursors.css_hand] = 'pointer';
cssCursorFallbacks[UI512Cursors.css_watch] = 'progress';
cssCursorFallbacks[UI512Cursors.css_busy] = 'wait';
cssCursorFallbacks[UI512Cursors.css_busy2] = 'wait';
cssCursorFallbacks[UI512Cursors.css_busy3] = 'wait';
cssCursorFallbacks[UI512Cursors.css_busy4] = 'wait';
cssCursorFallbacks[UI512Cursors.css_cross] = 'crosshair';

/* cross is slightly different in
the css version,
part of what makes the css cursors look terrible
is that the white-to-transparent transition becomes
a faint gray line. so add no white pixels
in the css version */
const filenames: { [key: number]: boolean } = {};

/**
 * certain cursors are neither black nor white,
 * they are the opposite of the underlying content.
 * in the original product, the paintbucket cursor
 * has pixels of both normal and inverted type,
 * but it's barely noticeable and not worth
 * the effort to implement.
 */
const isInvert: { [key: number]: boolean } = {};
isInvert[UI512Cursors.drawn_lbeam] = true;
isInvert[UI512Cursors.drawn_paintrectsel] = true;
isInvert[UI512Cursors.drawn_paintlasso] = true;
isInvert[UI512Cursors.drawn_cross] = true;

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
    protected static multForCssCursor = 1;

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

        let el = window.document.getElementById('mainDomCanvas');
        if (el) {
            let fname = cssCursorFilenames[nextCursor];
            if (fname) {
                /* show a real cursor */
                let fullname =
                    '/resources03a/images/cursors/x' +
                    `${UI512CursorAccess.multForCssCursor}${fname}`;
                let [hotsx, hotsy] = hotCoords[nextCursor] ?? [0, 0];
                hotsx *= UI512CursorAccess.multForCssCursor;
                hotsy *= UI512CursorAccess.multForCssCursor;
                let fallback = cssCursorFallbacks[nextCursor] ?? 'default';
                el.style.cursor = `url(${fullname}) ${hotsx} ${hotsy}, ${fallback}`;
            } else {
                /* hide the real cursor */
                let hots = hotCoords[nextCursor] ?? [0, 0];
                UI512CursorAccess.currentHotX = hots[0];
                UI512CursorAccess.currentHotY = hots[1];
                UI512CursorAccess.curInfo.iconGroup = '0cursors1';
                UI512CursorAccess.curInfo.iconNumber = nextCursor - 1;
                UI512CursorAccess.curInfo.centered = false;
                el.style.cursor = 'none';
            }
        }

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
        UI512CursorAccess.multForCssCursor = mult;
        /* don't actually call setcursor here to
        force the refresh because it might flash for a second */
        UI512CursorAccess.lastDrawnCur = UI512Cursors.busy4;
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
     * begin preloading common cursors
     */
    static suggestPreloadCursors() {
        /* preload some cursors we'll probably want */
        for (let cursor of [
            UI512Cursors.css_hand,
            UI512Cursors.css_paintpencil,
            UI512Cursors.css_cross
        ]) {
            let preloadLink = window.document.createElement('link');
            let fname = cssCursorFilenames[cursor];
            preloadLink.href =
                '/resources03a/images/cursors/x' +
                `${UI512CursorAccess.multForCssCursor}${fname}`;
            preloadLink.rel = 'preload';
            preloadLink.as = 'image';
            document.head.appendChild(preloadLink);
        }
    }

    /**
     * draw our virtual cursor onto the screen
     */
    static drawFinalWithCursor(
        buffer: CanvasWrapper,
        final: CanvasWrapper,
        drewAnything: boolean
    ) {
        if (cssCursorFilenames[UI512CursorAccess.currentCursor]) {
            /* hope to erase a previously drawn one */
            if (
                UI512CursorAccess.lastDrawnCur !== UI512CursorAccess.currentCursor ||
                drewAnything
            ) {
                final.context.drawImage(buffer.canvas, 0, 0);
            }

            UI512CursorAccess.lastDrawnMx = UI512CursorAccess.currentMx;
            UI512CursorAccess.lastDrawnMy = UI512CursorAccess.currentMy;
            UI512CursorAccess.lastDrawnCur = UI512CursorAccess.currentCursor;
            return;
        }

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
