
/* auto */ import { assertEq, base10, findEnumToStr } from '../../ui512/utils/utilsUI512.js';

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

export class UI512CursorAccess {
    protected static currentCursor = UI512Cursors.unknown;
    static defaultCursor = UI512Cursors.arrow;
    static getCursor(): UI512Cursors {
        return UI512CursorAccess.currentCursor;
    }

    static setCursor(nextCursor: UI512Cursors) {
        if (nextCursor !== UI512CursorAccess.currentCursor) {
            let el = document.getElementById('mainDomCanvas');
            if (el) {
                assertEq('number', typeof nextCursor, '3#|');
                let className = 'classCursor' + nextCursor.toString();
                el.className = className;
            }

            UI512CursorAccess.currentCursor = nextCursor;
        }
    }

    protected static getCursorFromClass() {
        let el = document.getElementById('mainDomCanvas');
        if (el) {
            let className = el.className;
            let n = parseInt(className.replace(/classCursor/, ''), base10);
            if (isFinite(n)) {
                if (findEnumToStr<UI512Cursors>(UI512Cursors, n) !== undefined) {
                    return n;
                }
            }
        }

        return UI512Cursors.unknown;
    }
}
