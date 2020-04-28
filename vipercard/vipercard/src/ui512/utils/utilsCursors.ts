
/* auto */ import { tostring } from './util512Base';
/* auto */ import { MapKeyToObjectCanSet, Util512 } from './util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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

const map1x = new MapKeyToObjectCanSet<string>();
map1x.set(tostring(UI512Cursors.lbeam), 'caret1x3,7.png');
map1x.set(tostring(UI512Cursors.cross), 'cross1x7,7.png');
map1x.set(tostring(UI512Cursors.plus), 'xtraplus1x7,7.png');
map1x.set(tostring(UI512Cursors.watch), 'xtrawatch1x7,7.png');
map1x.set(tostring(UI512Cursors.hand), 'hand1x6,0.png');
map1x.set(tostring(UI512Cursors.arrow), 'arrow1x3,1.png');
map1x.set(tostring(UI512Cursors.busy), 'xtrabusya1x7,7.png');
map1x.set(tostring(UI512Cursors.unknown), 'LIT:default');
map1x.set(tostring(UI512Cursors.paintbrush), 'brush1x5,14.png');
map1x.set(tostring(UI512Cursors.painterase), 'erase1x7,7.png');
map1x.set(tostring(UI512Cursors.paintlasso), 'lasso1x2,13.png');
map1x.set(tostring(UI512Cursors.paintpencil), 'pencil1x1,15.png');
map1x.set(tostring(UI512Cursors.paintrectsel), 'rectsel1x7,7.png');
map1x.set(tostring(UI512Cursors.paintspray), 'spray1x2,2.png');
map1x.set(tostring(UI512Cursors.paintbucket), 'bucket1x14,14.png');
map1x.set(tostring(UI512Cursors.busy2), 'xtrabusyb1x7,7.png');
map1x.set(tostring(UI512Cursors.busy3), 'xtrabusyc1x7,7.png');
map1x.set(tostring(UI512Cursors.busy4), 'xtrabusyd1x7,7.png');
map1x.set(tostring(UI512Cursors.hosttext), 'LIT:text');
map1x.set(tostring(UI512Cursors.hosthand), 'LIT:pointer');
map1x.set(tostring(UI512Cursors.hostarrow), 'LIT:default');
const map2x = new MapKeyToObjectCanSet<string>();
map2x.set(tostring(UI512Cursors.lbeam), 'caret2x6,14.png');
map2x.set(tostring(UI512Cursors.cross), 'cross2x14,14.png');
map2x.set(tostring(UI512Cursors.plus), 'xtraplus2x14,14.png');
map2x.set(tostring(UI512Cursors.watch), 'xtrawatch2x14,14.png');
map2x.set(tostring(UI512Cursors.hand), 'hand2x12,0.png');
map2x.set(tostring(UI512Cursors.arrow), 'arrow2x6,2.png');
map2x.set(tostring(UI512Cursors.busy), 'xtrabusya2x14,14.png');
map2x.set(tostring(UI512Cursors.unknown), 'LIT:default');
map2x.set(tostring(UI512Cursors.paintbrush), 'brush2x10,28.png');
map2x.set(tostring(UI512Cursors.painterase), 'erase2x14,14.png');
map2x.set(tostring(UI512Cursors.paintlasso), 'lasso2x4,26.png');
map2x.set(tostring(UI512Cursors.paintpencil), 'pencil2x2,30.png');
//~ map2x.set(tostring(UI512Cursors.paintrectsel), 'rectsel2x14,14.png');
map2x.set(tostring(UI512Cursors.paintrectsel), 'rectsel.cur');
map2x.set(tostring(UI512Cursors.paintspray), 'spray2x4,4.png');
map2x.set(tostring(UI512Cursors.paintbucket), 'bucket2x28,28.png');
map2x.set(tostring(UI512Cursors.busy2), 'xtrabusyb2x14,14.png');
map2x.set(tostring(UI512Cursors.busy3), 'xtrabusyc2x14,14.png');
map2x.set(tostring(UI512Cursors.busy4), 'xtrabusyd2x14,14.png');
map2x.set(tostring(UI512Cursors.hosttext), 'LIT:text');
map2x.set(tostring(UI512Cursors.hosthand), 'LIT:pointer');
map2x.set(tostring(UI512Cursors.hostarrow), 'LIT:default');

const map3x = new MapKeyToObjectCanSet<string>();
map3x.set(tostring(UI512Cursors.lbeam),  "caret3x9,21.png")
map3x.set(tostring(UI512Cursors.cross),  "cross3x21,21.png")
map3x.set(tostring(UI512Cursors.plus),  "xtraplus3x21,21.png")
map3x.set(tostring(UI512Cursors.watch),  "xtrawatch3x21,21.png")
map3x.set(tostring(UI512Cursors.hand),  "hand3x18,0.png")
map3x.set(tostring(UI512Cursors.arrow),  "arrow3x9,3.png")
map3x.set(tostring(UI512Cursors.busy),  "xtrabusya3x21,21.png")
map3x.set(tostring(UI512Cursors.unknown), 'LIT:default');
/* dropping back to 2x since coords >= 32 */
map3x.set(tostring(UI512Cursors.paintbrush),  "brush2x10,28.png")
map3x.set(tostring(UI512Cursors.painterase),  "erase3x21,21.png")
/* dropping back to 2x since coords >= 32 */
map3x.set(tostring(UI512Cursors.paintlasso),  "lasso2x4,26.png")
/* dropping back to 2x since coords >= 32 */
map3x.set(tostring(UI512Cursors.paintpencil),  "pencil2x2,30.png")
map3x.set(tostring(UI512Cursors.paintrectsel),  "rectsel3x21,21.png")
map3x.set(tostring(UI512Cursors.paintspray),  "spray3x6,6.png")
/* dropping back to 2x since coords >= 32 */
map3x.set(tostring(UI512Cursors.paintbucket),  "bucket2x28,28.png")
map3x.set(tostring(UI512Cursors.busy2),  "xtrabusyb3x21,21.png")
map3x.set(tostring(UI512Cursors.busy3),  "xtrabusyc3x21,21.png")
map3x.set(tostring(UI512Cursors.busy4),  "xtrabusyd3x21,21.png")
map3x.set(tostring(UI512Cursors.hosttext), 'LIT:text')
map3x.set(tostring(UI512Cursors.hosthand),'LIT:pointer')
map3x.set(tostring(UI512Cursors.hostarrow),'LIT:default')

/**
 * cache the current cursor so that repeated calls to setCursor
 * won't have any effect on performance
 */
export class UI512CursorAccess {
    protected static currentCursor = UI512Cursors.arrow;
    protected static currentMult = 1;
    static defaultCursor = "url('/resources03a/cursors/arrow1x3,1.png') 3 1, default";
    static getCursor(): UI512Cursors {
        return UI512CursorAccess.currentCursor;
    }

    static setCursor(nextCursor: UI512Cursors, always = false) {
        let el = window.document.getElementById('mainDomCanvas');
        if (el) {
            el.style.cursor = 'none';
        }
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
            UI512CursorAccess.currentMult = 3;
        } else if (mult > 1.5) {
            UI512CursorAccess.currentMult = 2;
        } else {
            UI512CursorAccess.currentMult = 1;
        }

        UI512CursorAccess.setCursor(UI512CursorAccess.getCursor(), true);
    }
}
