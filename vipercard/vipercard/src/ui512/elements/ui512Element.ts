
/* auto */ import { assertTrue } from './../utils/util512Assert';
/* auto */ import { ChangeContext } from './../draw/ui512Interfaces';
/* auto */ import { FormattedText } from './../draw/ui512FormattedText';
/* auto */ import { UI512Settable } from './ui512ElementGettable';

/**
 * base class for UI model classes (button, label, etc)
 */
export abstract class UI512Element extends UI512Settable {
    readonly typename: string = 'UI512Element';
    transparentToClicks = false;
    protected _visible = true;
    protected _enabled = true;
    protected _enabledstyle = true;
    protected _x = 0;
    protected _y = 0;
    protected _w = 0;
    protected _h = 0;

    /* simply a quick way to set x, y, w, and h in one line */
    setDimensions(
        newX: number,
        newY: number,
        newW: number,
        newH: number,
        context = ChangeContext.Default
    ) {
        assertTrue(newW >= 0, `2 |width must be >= 0 but got ${newW}`);
        assertTrue(newH >= 0, `2z|height must be >= 0 but got ${newH}`);
        this.set('x', newX, context);
        this.set('y', newY, context);
        this.set('w', newW, context);
        this.set('h', newH, context);
    }

    /* instead of setting by width and height, set by x1 and y1. */
    setDimensionsX1Y1(
        newX0: number,
        newY0: number,
        newX1: number,
        newY1: number,
        context = ChangeContext.Default
    ) {
        this.setDimensions(newX0, newY0, newX1 - newX0, newY1 - newY0);
    }

    getFmTxt(): FormattedText {
        let got = (this as any)['_' + UI512Settable.fmtTxtVarName] as FormattedText;
        assertTrue(
            got && got.isFormattedText,
            `2&|did not get formatted text as expected`
        );

        /* ensure the "lock" bit has been set before we allow access
        otherwise, you could make changes to the object and we'd never
        receive any change notification */
        got.lock();
        return got;
    }

    setFmTxt(newTxt: FormattedText, context = ChangeContext.Default) {
        this.setImpl(UI512Settable.fmtTxtVarName, newTxt, undefined, context);
    }

    /* a few getters for convenience */
    get enabled() {
        return this._enabled;
    }

    get visible() {
        return this._visible;
    }

    get x() {
        return this.getN('x');
    }

    get y() {
        return this.getN('y');
    }

    get w() {
        return this.getN('w');
    }

    get h() {
        return this.getN('h');
    }

    get bottom() {
        return this.y + this.h;
    }

    get right() {
        return this.x + this.w;
    }
}

/**
 * an element that has a text label
 */
export abstract class UI512ElementWithText extends UI512Element {
    protected _labeltext = '';
    protected _labelvalign = true;
    protected _labelhalign = true;
    protected _labelwrap = false;
}

/**
 * an element that can show an icon and be highlighted
 */
export abstract class UI512ElementWithHighlight extends UI512ElementWithText {
    protected _highlightactive = false;
    protected _autohighlight = true;
    protected _checkmark = false;
    protected _icongroupid = '';
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
