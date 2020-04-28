
/* auto */ import { CanvasWrapper } from './utilsCanvasDraw';
/* auto */ import { getRoot } from './util512Higher';
/* auto */ import { tostring } from './util512Base';
/* auto */ import { MapKeyToObjectCanSet, Util512, cast } from './util512';
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
 * 
 * We could just draw the cursor on the canvas like everything else
 *      Pros: enables better emulation (original product has cursors that invert)
 *      Cons: would have to maintain a graphics buffer or it would be slow 
 * We can fake a cursor with a <img> moved around by javascript
 *      Pros: simpler code (if we use an offset, see below)
 *      Cons: doesn't look right when page scrolls
 * 
 * Fortunately our page never scrolls, and we can enforce that with body {position:fixed}
 * 
 * Where it gets tricky: the mousemove events might get eaten by the <img>
 * to get around this we can set an OFFSET
 * where the true mouse position isn't where it looks like
 * ok since we have a black perimeter, although we should test that all corners 
 * of the screen are clickable. the OFFSET means that we'll 
 * 
 * problem: will all corners of the screen be clickable?
 * problem: on touch devices the offset will mess with where you tap!!
 * 
 * see also:
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
    hand,
    arrow,
    busy,
    __AlternateForm__none = arrow /* cursor = none would be frustrating */,
    /* order no longer matters */
    unknown,
    paintbrush,
    painterase,
    paintlasso,
    paintpencil,
    paintrectsel,
    paintspray,
    paintbucket,
    busy2,
    busy3,
    busy4,
    hosttext,
    hosthand,
    hostarrow
}


/**
 * cache the current cursor so that repeated calls to setCursor
 * won't have any effect on performance
 */
export class UI512CursorAccess {
    protected static currentCursor = UI512Cursors.arrow;
    protected static currentMx = 0;
    protected static currentMy = 0;
    protected static lastDrawnMx = -1;
    protected static lastDrawnMy = -1;
    protected static lastDrawnCur = UI512Cursors.unknown;
    protected static currentMultCursorSize = 1;
    protected static currentHotX = 0;
    protected static currentHotY = 0;
    protected static wasCursorLoaded = false;
    protected static curInfo = new IconInfo('0cursors1', UI512Cursors.arrow)
    static getCursor(): UI512Cursors {
        return UI512CursorAccess.currentCursor;
    }

    static setCursor(nextCursor: UI512Cursors, always = false) {
        let el = window.document.getElementById('mainDomCanvas');
        if (el) {
            el.style.cursor = 'none';
        }

        let group = '0cursors1'
        if (UI512CursorAccess.currentMultCursorSize === 2) {
            group ='0cursors2'
        } else if (UI512CursorAccess.currentMultCursorSize === 3) {
            group ='0cursors3'
        }

        UI512CursorAccess.curInfo.adjustX = 1
        UI512CursorAccess.curInfo.adjustY = 1
        UI512CursorAccess.curInfo.iconGroup = group
        UI512CursorAccess.curInfo.iconNumber = nextCursor
        UI512CursorAccess.curInfo.centered = false

        //~ if (nextCursor !== UI512CursorAccess.currentCursor || always) {
            //~ let el = window.document.getElementById('mainDomCanvas');
            //~ if (el) {
                //~ let map: MapKeyToObjectCanSet<string>;
                //~ if (UI512CursorAccess.currentMult === 2) {
                    //~ map = map2x;
                //~ } else if (UI512CursorAccess.currentMult === 3) {
                    //~ map = map3x;
                //~ } else {
                    //~ map = map1x;
                //~ }

                //~ let mapped = map.get(nextCursor.toString());
                //~ let spec = UI512CursorAccess.defaultCursor;
                //~ if (mapped) {
                    //~ let [x, y] = UI512CursorAccess.parseCursorName(mapped);
                    //~ spec = `url('/resources03a/cursors/${mapped}') ${x} ${y}, default`;
                //~ }

                //~ el.style.cursor = spec;
            //~ }

            //~ UI512CursorAccess.currentCursor = nextCursor;
        //~ }
    }

    static parseCursorName(s: string): [number, number] {
        let pts = s.split(/[0-9]x/);
        if (pts.length <= 1) {
            return [0, 0];
        } else {
            let xy = pts[1].split('.')[0];
            let x = xy.split(',')[0];
            let y = xy.split(',')[1];
            let nx = Util512.parseInt(x) ?? 0;
            let ny = Util512.parseInt(y) ?? 0;
            return [nx, ny];
        }
    }

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

    static notifyScreenMult(mult: number) {
        if (mult > 2.5) {
            UI512CursorAccess.currentMultCursorSize = 3;
        } else if (mult > 1.5) {
            UI512CursorAccess.currentMultCursorSize = 2;
        } else {
            UI512CursorAccess.currentMultCursorSize = 1;
        }

        UI512CursorAccess.setCursor(UI512CursorAccess.getCursor(), true);
    }

    static onmousemove(unscaledx: number, unscaledy:number) {
        UI512CursorAccess.currentMx = unscaledx
        UI512CursorAccess.currentMy = unscaledy
    }

    static drawFinalWithCursor(buffer:CanvasWrapper, final:CanvasWrapper, drewAnything:boolean) {
        if (!drewAnything && UI512CursorAccess.currentMx === UI512CursorAccess.lastDrawnMx && UI512CursorAccess.currentMy === UI512CursorAccess.lastDrawnMy && 
            UI512CursorAccess.lastDrawnCur === UI512CursorAccess.currentCursor && UI512CursorAccess.wasCursorLoaded) {
            /* we're up to date, don't need to draw anything */
            return
        }

        final.context.drawImage(
            buffer.canvas,
            0,
            0,
        );


        let iconManager = cast(UI512IconManager, getRoot().getDrawIcon());
        let found = iconManager.findIcon(UI512CursorAccess.curInfo.iconGroup, UI512CursorAccess.curInfo.iconNumber)
        if (!found) {
            /* hand-draw a little cursor */
            UI512CursorAccess.wasCursorLoaded = false
            final.fillRectUnchecked(UI512CursorAccess.currentMx, UI512CursorAccess.currentMy, 3, 3, 'black')
        } else {
            UI512CursorAccess.wasCursorLoaded = true
            UI512CursorAccess.curInfo.adjustX = UI512CursorAccess.currentMx
            UI512CursorAccess.curInfo.adjustY = UI512CursorAccess.currentMy
            found.drawIntoBox(final, UI512CursorAccess.curInfo, 0, 0, final.canvas.width, final.canvas.height)
        }
        
        UI512CursorAccess.lastDrawnMx = UI512CursorAccess.currentMx
        UI512CursorAccess.lastDrawnMy = UI512CursorAccess.currentMy
        UI512CursorAccess.lastDrawnCur = UI512CursorAccess.currentCursor
    }
}
