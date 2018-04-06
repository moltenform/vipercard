
/* auto */ import { O, assertTrue, cleanExceptionMsg } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512Settable } from '../../ui512/elements/ui512ElementsGettable.js';

export abstract class UI512Element extends UI512Settable {
    readonly typeName: string = 'UI512Element';
    transparentToClicks = false;
    protected _canFocus = false;
    protected _visible = true;
    protected _enabled = true;
    protected _enabledstyle = true;

    get enabled() {
        return this._enabled;
    }

    get visible() {
        return this._visible;
    }

    protected _x = 0;
    protected _y = 0;
    protected _w = 0;
    protected _h = 0;

    setDimensions(newx: number, newy: number, neww: number, newh: number, context = ChangeContext.Default) {
        assertTrue(neww >= 0, `2 |width must be >= 0 but got ${neww}`);
        assertTrue(newh >= 0, `2z|height must be >= 0 but got ${newh}`);
        this.set('x', newx, context);
        this.set('y', newy, context);
        this.set('w', neww, context);
        this.set('h', newh, context);
    }

    setDimensionsX1Y1(newx0: number, newy0: number, newx1: number, newy1: number, context = ChangeContext.Default) {
        this.setDimensions(newx0, newy0, newx1 - newx0, newy1 - newy0);
    }

    get x() {
        return this.get_n('x');
    }
    get y() {
        return this.get_n('y');
    }
    get w() {
        return this.get_n('w');
    }
    get h() {
        return this.get_n('h');
    }
    get bottom() {
        return this.y + this.h;
    }
    get right() {
        return this.x + this.w;
    }
}

export abstract class UI512ElementWithText extends UI512Element {
    protected _labeltext = '';
    protected _labelvalign = true;
    protected _labelhalign = true;
    protected _labelwrap = false;
}

export abstract class UI512ElementWithHighlight extends UI512ElementWithText {
    protected _highlightactive = false;
    protected _autohighlight = true;
    protected _checkmark = false;
    protected _iconsetid = '';
    protected _iconnumber = -1;
    protected _iconnumberwhenhighlight = -1;
    protected _iconadjustx = 0;
    protected _iconadjusty = 0;
    protected _iconadjustwidth = 0;
    protected _iconadjustheight = 0;
    protected _iconadjustsrcx = 0;
    protected _iconadjustsrcy = 0;
    protected _iconcentered = true;
}

export function UI512BeginAsyncSetLabelText<T>(
    el: UI512Element,
    asyncFn: () => Promise<T>,
    onComplete: O<(r: T | Error) => void>
) {
    let cb = (r: T | Error) => {
        if (r instanceof Error) {
            el.set('labeltext', cleanExceptionMsg(r.toString()));
        } else {
            if (onComplete) {
                onComplete(r);
            }
        }
    };
}
