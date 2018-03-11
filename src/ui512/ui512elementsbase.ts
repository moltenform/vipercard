
/* autoimport:start */
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export enum ChangeContext {
    __isUI512Enum = 1,
    Default,
    FromRenderModel,
}

export type ElementObserverVal = string | boolean | number | FormattedText;

export interface ElementObserver {
    changeSeen(context: ChangeContext, elid: string, propname: string, prev: ElementObserverVal, newv: ElementObserverVal): void;
}

export class ElementObserverNoOp implements ElementObserver {
    changeSeen(context: ChangeContext, elid: string, propname: string, prev: ElementObserverVal, newv: ElementObserverVal) {}
}

export class ElementObserverDefault implements ElementObserver {
    changeSeen(context: ChangeContext, elid: string, propname: string, prev: ElementObserverVal, newv: ElementObserverVal) {
        assertTrue(false, "2,|no observer attached");
    }
}

export const elementObserverNoOp = new ElementObserverNoOp();
export const elementObserverDefault = new ElementObserverDefault();

export abstract class UI512Gettable {
    get_n(s: string): number {
        let v = this.get(s);
        assertEq(typeof 0, typeof v, `2+|property ${s} expected type ${typeof 0}`);
        return v as number;
    }

    get_s(s: string): string {
        let v = this.get(s);
        assertEq(typeof "", typeof v, `2*|property ${s} expected type ${typeof ""}`);
        return v as string;
    }

    get_b(s: string): boolean {
        let v = this.get(s);
        assertEq("boolean", typeof v, `2)|property ${s} expected type 'boolean'}`);
        return v as boolean;
    }

    get_generic(s: string): ElementObserverVal {
        return this.get(s);
    }

    protected get(s: string): any {
        let v: any = (this as any)["_" + s];
        assertTrue(v !== null && v !== undefined, `2(|property ${s} undefined`);
        return v;
    }

    get_ftxt(): FormattedText {
        let v = this.get(UI512Settable.formattedTextField);
        let ftxt = v as FormattedText;
        assertTrue(ftxt && ftxt.isFormattedText, `2&|did not get formatted text as expected`);
        // safe to allow access because the "lock" bit has been set
        ftxt.lock();
        return ftxt;
    }
}

export abstract class UI512Settable extends UI512Gettable {
    static readonly formattedTextField = "ftxt";
    readonly id: string;
    protected dirty = true;
    protected locked = false;
    observer: ElementObserver;

    lock(locked:boolean) {
        this.locked = locked
    }

    constructor(id: string, observer: ElementObserver = elementObserverDefault) {
        super();
        assertTrue(slength(id), "2%|invalid id");
        assertTrue(!scontains(id, "|"), "2$|invalid id");
        this.id = id;
        this.observer = observer;
    }

    set<T>(s: string, newval: T, context = ChangeContext.Default) {
        checkThrowUI512(!this.locked, "6L|tried to set value when locked. setting during refresh()?")
        let prev = this.get(s);
        assertEq(typeof prev, typeof newval, `2#|property ${s} type mismatch`);
        (this as any)["_" + s] = newval;
        if (prev !== newval) {
            this.dirty = true;
            this.observer.changeSeen(context, this.id, s, prev, newval as any);
        }
    }

    setftxt(newtxt: FormattedText, context = ChangeContext.Default) {
        checkThrowUI512(!this.locked, "tried to set value when locked. setting during refresh()?")
        let prev = this.get_ftxt();
        assertTrue(!!newtxt, "2!|invalid newtxt", this.id);
        (this as any)["_" + UI512Settable.formattedTextField] = newtxt;
        if (prev !== newtxt) {
            this.dirty = true;
            newtxt.lock();
            this.observer.changeSeen(context, this.id, UI512Settable.formattedTextField, prev, newtxt);
        }
    }

    getdirty() {
        return this.dirty;
    }

    setdirty(newval: boolean, context = ChangeContext.Default) {
        this.dirty = newval;
        if (newval) {
            this.observer.changeSeen(context, this.id, "", "", "");
        }
    }
}

export abstract class UI512Element extends UI512Settable {
    readonly typeName: string = "UI512Element";
    transparentToClicks = false
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
        this.set("x", newx, context);
        this.set("y", newy, context);
        this.set("w", neww, context);
        this.set("h", newh, context);
    }

    setDimensionsX1Y1(newx0: number, newy0: number, newx1: number, newy1: number, context = ChangeContext.Default) {
        this.setDimensions(newx0, newy0, newx1-newx0, newy1-newy0)
    }

    get x() {
        return this.get_n("x");
    }
    get y() {
        return this.get_n("y");
    }
    get w() {
        return this.get_n("w");
    }
    get h() {
        return this.get_n("h");
    }
    get bottom() {
        return this.y + this.h;
    }
    get right() {
        return this.x + this.w;
    }
}
