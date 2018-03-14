
/* autoimport:start */
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { clrBlack, clrWhite, clrTransp, makePainterCvDataDraw, makePainterCvDataWithPatternSupport, simplifyPattern, needsPatternSupport, makePainterCvCanvas, UI512Painter, DissolveImages, UI512ImageSerialization, PaintOntoCanvasShapes, PaintOntoCanvas } from "../ui512/ui512paint.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */


export abstract class UI512ElementWithText extends UI512Element {
    protected _labeltext = "";
    protected _labelvalign = true;
    protected _labelhalign = true;
    protected _labelwrap = false;
}

export abstract class UI512ElementWithHighlight extends UI512ElementWithText {
    protected _highlightactive = false;
    protected _autohighlight = true;
    protected _checkmark = false;
    protected _iconsetid = "";
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

export enum UI512BtnStyle {
    __isUI512Enum = 1,
    transparent,
    rectangle,
    opaque,
    roundrect,
    plain,
    shadow,
    osstandard,
    osdefault,
    osboxmodal,
    checkbox,
    radio,
    alternateforms_standard = osstandard,
    alternateforms_default = osdefault,
    alternateforms_rect = rectangle,
}

export abstract class UI512ElementButtonGeneral extends UI512ElementWithHighlight {
    readonly typeName: string = "UI512ElementButtonGeneral";
    protected _style: number = UI512BtnStyle.rectangle;
}

export class UI512ElButton extends UI512ElementButtonGeneral {}

export class UI512ElLabel extends UI512ElementWithText {
    readonly typeName: string = "UI512ElLabel";
    protected _transparentExceptChars = false;
    constructor(idString: string, labeltext = "", observer: ElementObserver = elementObserverDefault) {
        super(idString, observer);
        this._labeltext = labeltext;
        this._labelvalign = false;
        this._labelhalign = false;
    }
}

export enum UI512FldStyle {
    __isUI512Enum = 1,
    opaque,
    transparent,
    rectangle,
    shadow,
    alternateforms_rect = rectangle,
}

// a scrollbar is not part of the field, it is created separately.
export class UI512ElTextField extends UI512Element {
    readonly typeName: string = "UI512ElTextField";
    protected _labelvalign = true;
    protected _labelhalign = true;
    protected _labelwrap = false;
    protected _nudgex = 0;
    protected _nudgey = 0;
    protected _selcaret = 0;
    protected _selend = 0;
    protected _showcaret = false;
    protected _canedit = true;
    protected _canselecttext = true;
    protected _selectbylines = false; // works best if: !canedit, !labelwrap, canselecttext, multiline
    protected _multiline = true;
    protected _asteriskonly = false;
    protected _scrollbar = false;
    protected _scrollamt = 0;
    protected _style: number = UI512FldStyle.rectangle;
    protected _addvspacing = 0;
    protected _defaultFont = "";
    protected _contentHeightInPixels = -1;
    protected _ftxt = new FormattedText();

    constructor(idString: string, observer: ElementObserver = elementObserverDefault) {
        super(idString, observer);
        this._labelwrap = true;
        this._labelvalign = false;
        this._labelhalign = false;
        this._defaultFont = TextRendererFontManager.defaultFont;
        this._ftxt.lock();
    }

    set<T>(s: string, newval: T, context = ChangeContext.Default) {
        // reset cached height if anything changes
        if (s !== "contentHeightInPixels" && s !== "selcaret" && s !== "selend" && s !== "scrollamt") {
            this.set("contentHeightInPixels", -1, context);
        }

        return super.set(s, newval, context);
    }

    setftxt(newtxt: FormattedText, context = ChangeContext.Default) {
        if (newtxt !== this._ftxt) {
            this.set("contentHeightInPixels", -1, context);
        }

        return super.setftxt(newtxt, context);
    }

    static setListChoices(el: UI512ElTextField, choices: string[]) {
        if (choices.length) {
            // little hack: add a space before each item because it looks better
            let s = choices.map(item => " " + item).join("\n");
            let ftxt = FormattedText.newFromUnformatted(s);

            // little hack: add an ending newline so that selecting the last line looks right
            // logic elsewhere prevents this last ending line from being actually chosen/selected.
            // we'll add the ending newline in a small font so it won't affect the scrollbar much.
            ftxt.push(specialCharNumNewline, TextRendererFontManager.smallestFont);
            el.setftxt(ftxt);
        } else {
            el.setftxt(FormattedText.newFromUnformatted(""));
        }
    }

    static makeChoiceBox(app: UI512Application, grp: UI512ElGroup, id: string, x: number, y: number) {
        const leftChoicesW = 130;
        const leftChoicesH = 117;
        let fld = new UI512ElTextField(id);
        grp.addElement(app, fld);
        fld.set("scrollbar", true);
        fld.set("selectbylines", true);
        fld.set("multiline", true);
        fld.set("canselecttext", true);
        fld.set("canedit", false);
        fld.set("labelwrap", false);
        fld.setDimensions(x, y, leftChoicesW, leftChoicesH);
        return fld;
    }
}

export class UI512ElCanvasPiece extends UI512Element {
    readonly typeName: string = "UI512ElCanvasPiece";
    private canvas: CanvasWrapper;
    private cachedPnter: UI512Painter;
    setCanvas(cv: CanvasWrapper) {
        this.set("incrementUntilLoaded", this.get_n("incrementUntilLoaded") + 1);
        this.canvas = cv;
    }
    getCanvasForWrite() {
        this.set("incrementUntilLoaded", this.get_n("incrementUntilLoaded") + 1);
        return this.canvas;
    }
    getCanvasForRead() {
        return this.canvas;
    }
    getCvWidth() {
        return this.canvas.canvas.width;
    }
    getCvHeight() {
        return this.canvas.canvas.height;
    }
    setCachedPnter(pnter: UI512Painter) {
        this.set("incrementUntilLoaded", this.get_n("incrementUntilLoaded") + 1);
        this.cachedPnter = pnter;
    }
    getCachedPnterForWrite() {
        this.set("incrementUntilLoaded", this.get_n("incrementUntilLoaded") + 1);
        return this.cachedPnter;
    }

    protected _srcx = 0;
    protected _srcy = 0;
    protected _incrementUntilLoaded = 0;
}

export class GridLayout<RowType, ColType> {
    constructor(
        public basex: number,
        public basey: number,
        public itemw: number,
        public itemh: number,
        public cols: ColType[],
        public rows: RowType[],
        public marginx: number,
        public marginy: number
    ) {}

    getColWidth() {
        return this.itemw + this.marginx;
    }

    getRowHeight() {
        return this.itemh + this.marginy;
    }

    getTotalWidth() {
        return this.getColWidth() * this.cols.length;
    }

    getTotalHeight() {
        return this.getRowHeight() * this.rows.length;
    }

    boundsForNumber(numx: number, numy: number) {
        return [this.basex + numx * (this.itemw + this.marginx), this.basey + numy * (this.itemh + this.marginy), this.itemw, this.itemh];
    }

    combinations(fn: (n: number, a: ColType, b: RowType, bnds: number[]) => void) {
        let count = 0;
        for (let yy = 0; yy < this.rows.length; yy++) {
            for (let xx = 0; xx < this.cols.length; xx++) {
                let bnds = this.boundsForNumber(xx, yy);
                fn(count, this.cols[xx], this.rows[yy], bnds);
                count += 1;
            }
        }
    }

    createElems<T extends UI512Element>(
        app: UI512Application,
        grp: UI512ElGroup,
        idprefix: string,
        ctor: { new (...args: any[]): T },
        fn: (a: ColType, b: RowType, el: T) => void,
        nameBasedOnCol = false,
        labelBasedOnCol = false
    ) {
        this.combinations((n, a, b, bnds) => {
            let cellName = typeof a === "string" ? a : b;
            let id = nameBasedOnCol ? `${idprefix}${cellName}` : `${idprefix}_${n}`;
            let el = new ctor(id);
            grp.addElement(app, el);
            el.setDimensions(bnds[0], bnds[1], bnds[2], bnds[3]);
            fn(a, b, el);

            if (labelBasedOnCol) {
                el.set("labeltext", cellName.toString().toLowerCase());
            }
        });
    }
}

export class UI512ElGroup {
    readonly id: string;
    observer: ElementObserver;
    protected elements = new OrderedHash<UI512Element>();
    protected visible = true;

    // perf optimization: restrict mouse interaction to be within bounds
    enableMouseInteraction = true;
    mouseInteractionBounds: [number, number, number, number] = [0, 0, largearea, largearea];

    constructor(id: string, observer: ElementObserver = elementObserverDefault) {
        this.id = id;
        this.observer = observer;
    }

    getVisible() {
        return this.visible;
    }

    setVisible(v: boolean, context = ChangeContext.Default) {
        if (v !== this.visible) {
            this.observer.changeSeen(context, "(groupSetVisible)", "visible", this.visible, v);
            this.visible = v;
        }
    }

    updateBoundsBasedOnChildren() {
        let setAtLeastOne = false;
        let extremes = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

        for (let el of this.elements.iter()) {
            setAtLeastOne = true;
            extremes[0] = Math.min(extremes[0], el.x);
            extremes[1] = Math.min(extremes[1], el.y);
            extremes[2] = Math.max(extremes[2], el.right);
            extremes[3] = Math.max(extremes[3], el.bottom);
        }

        if (setAtLeastOne) {
            this.mouseInteractionBounds[0] = extremes[0];
            this.mouseInteractionBounds[1] = extremes[1];
            this.mouseInteractionBounds[2] = extremes[2] - extremes[0];
            this.mouseInteractionBounds[3] = extremes[3] - extremes[1];
        } else {
            this.mouseInteractionBounds[0] = 0;
            this.mouseInteractionBounds[1] = 0;
            this.mouseInteractionBounds[2] = 0;
            this.mouseInteractionBounds[3] = 0;
        }
    }

    getEl(id: string): UI512Element {
        return this.elements.get(id);
    }

    findEl(id: string): O<UI512Element> {
        return this.elements.find(id);
    }

    *iterEls() {
        for (let o of this.elements.iter()) {
            yield o;
        }
    }

    *iterElsReversed() {
        for (let o of this.elements.iterReversed()) {
            yield o;
        }
    }

    removeAllEls(context = ChangeContext.Default) {
        this.observer.changeSeen(context, "(removeallels)", "(removeallels)", 0, 0);
        this.elements.deleteAll();
    }

    addElementAfter(parent: UI512Application, elemIn: UI512Element, idOfZIndex: O<string>, context = ChangeContext.Default) {
        // disallow any duplicates
        for (let grp of parent.iterGrps()) {
            checkThrowUI512(!grp.findEl(elemIn.id), `2x|dup ${elemIn.id} found in grp ${grp.id}`);
        }

        if (elemIn.observer === elementObserverDefault) {
            elemIn.observer = this.observer;
        }

        if (idOfZIndex) {
            // example: you are adding "elemC##test" and idOfZIndex=="elemC"
            // already existing are "elemA", "elemB", "elemC", "elemC##1", "elemC##2", "elemD"
            // want order to be "elemA", "elemB", "elemC", "elemC##1", "elemC##2", "elemC##test", "elemD"
            // validated in test_utils_addElementAfter
            let index = this.elements.getIndex(idOfZIndex);
            let first = this.elements.atIndex(index);
            if (first) {
                let firstid = first.id;
                while (true) {
                    index += 1;
                    let cur = this.elements.atIndex(index);
                    if (!cur || !cur.id.startsWith(firstid + "##")) {
                        break;
                    }
                }
            }

            this.elements.insertAt(elemIn.id, elemIn, index);
        } else {
            this.elements.insertNew(elemIn.id, elemIn);
        }

        this.observer.changeSeen(context, elemIn.id, "(addel)", 0, 0);
    }

    addElement(parent: UI512Application, elemIn: UI512Element, context = ChangeContext.Default) {
        return this.addElementAfter(parent, elemIn, undefined, context);
    }

    removeElement(id: string, context = ChangeContext.Default): boolean {
        let found = this.elements.find(id);
        if (found) {
            this.observer.changeSeen(context, found.id, "(removeel)", 0, 0);
        }

        return this.elements.delete(id);
    }

    countElems() {
        return this.elements.length();
    }
}

export class UI512Application {
    protected groups = new OrderedHash<UI512ElGroup>();
    observer: ElementObserver;
    bounds: number[] = [];

    constructor(bounds: number[], observer: ElementObserver = elementObserverDefault) {
        this.bounds = bounds;
        this.observer = observer;
    }

    getGroup(id: string) {
        return this.groups.get(id);
    }

    findGroup(id: string) {
        return this.groups.find(id);
    }

    *iterGrps() {
        for (let o of this.groups.iter()) {
            yield o;
        }
    }

    *iterGrpsReversed() {
        for (let o of this.groups.iterReversed()) {
            yield o;
        }
    }

    addGroup(grp: UI512ElGroup, context = ChangeContext.Default) {
        grp.observer = this.observer;
        this.groups.insertNew(grp.id, grp);
        this.observer.changeSeen(context, grp.id, "(addgrp)", 0, 0);
    }

    removeGroup(id: string, context = ChangeContext.Default) {
        this.groups.delete(id);
        this.observer.changeSeen(context, id, "(removegrp)", 0, 0);
    }

    coordsToElement(x: number, y: number) {
        for (let grp of this.groups.iterReversed()) {
            if (
                !grp.getVisible() ||
                !grp.enableMouseInteraction ||
                !RectUtils.hasPoint(
                    x,
                    y,
                    grp.mouseInteractionBounds[0],
                    grp.mouseInteractionBounds[1],
                    grp.mouseInteractionBounds[2],
                    grp.mouseInteractionBounds[3]
                )
            ) {
                continue;
            }

            for (let el of grp.iterElsReversed()) {
                if (el.visible) {
                    if (!el.transparentToClicks) {
                        if (RectUtils.hasPoint(x, y, el.x, el.y, el.w, el.h)) {
                            return el;
                        }
                    }
                }
            }
        }

        return undefined;
    }

    findElemByIdAndGroup(gpid: string, elemid: string) {
        let grp = this.groups.find(gpid);
        if (grp) {
            return grp.findEl(elemid);
        }

        return undefined;
    }

    findElemAndGroupById(elemid: O<string>): O<[UI512ElGroup, UI512Element]> {
        if (!elemid) {
            return undefined;
        }

        for (let grp of this.groups.iterReversed()) {
            let el = grp.findEl(elemid);
            if (el) {
                return [grp, el];
            }
        }

        return undefined;
    }

    findElemById(elemid: O<string>) {
        let found = this.findElemAndGroupById(elemid);
        if (found) {
            return found[1];
        }

        return undefined;
    }

    getElemById(elemid: string) {
        return throwIfUndefined(this.findElemById(elemid), "2w|not found " + elemid);
    }
}

export class ElementObserverToTwo implements ElementObserver {
    observer1: ElementObserver;
    observer2: ElementObserver;
    changeSeen(context: ChangeContext, elid: string, propname: string, prev: ElementObserverVal, newv: ElementObserverVal) {
        this.observer1.changeSeen(context, elid, propname, prev, newv);
        this.observer2.changeSeen(context, elid, propname, prev, newv);
    }
}
