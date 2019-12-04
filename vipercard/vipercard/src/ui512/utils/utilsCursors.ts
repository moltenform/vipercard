
/* auto */ import { assertEq } from './util512';

/**
 * assign a number to cursor
 * must correlate with canvas.classCursor in style.css
 */
export enum UI512Cursors {
    __isUI512Enum = 1,
    Unknown = 2,
    Arrow = 3,
    Beam = 4,
    Crosshair = 5,
    Hand = 6,
    Pencil = 7,
    Plus = 8,
    Watch = 9,
    PaintBrush = 10,
    PaintBucket = 11,
    PaintText = 12,
    PaintLasso = 13,
    PaintEraser = 14,
    PaintSpray = 15,
    HostHand = 20,
    HostPointer = 21
}

/**
 * cache the current cursor so that repeated calls to setCursor
 * won't have any effect on performance
 */
export class UI512CursorAccess {
    protected static currentCursor = UI512Cursors.Unknown;
    static defaultCursor = UI512Cursors.Arrow;
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
