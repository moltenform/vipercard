
/* auto */ import { assertEq } from '../../ui512/utils/utilsUI512.js';

/**
 * assign a number to cursor
 * must correlate with canvas.classCursor in style.css
 */
export enum UI512Cursors {
    __isUI512Enum = 1,
    unknown = 2,
    arrow = 3,
    beam = 4,
    crosshair = 5,
    hand = 6,
    pencil = 7,
    plus = 8,
    watch = 9,
    paintbrush = 10,
    paintbucket = 11,
    painttext = 12,
    paintlasso = 13,
    painteraser = 14,
    paintspray = 15,
    hosthand = 20,
    hostpointer = 21,
}

/**
 * cache the current cursor so that repeated calls to setCursor
 * won't have any effect on performance
 */
export class UI512CursorAccess {
    protected static currentCursor = UI512Cursors.unknown;
    static defaultCursor = UI512Cursors.arrow;
    static getCursor(): UI512Cursors {
        return UI512CursorAccess.currentCursor;
    }

    static setCursor(nextCursor: UI512Cursors) {
        if (nextCursor !== UI512CursorAccess.currentCursor) {
            let el = window.document.getElementById('mainDomCanvas');
            if (el) {
                assertEq('number', typeof nextCursor, '3#|');
                let className = 'classCursor' + nextCursor.toString();
                el.className = className;
            }

            UI512CursorAccess.currentCursor = nextCursor;
        }
    }
}
