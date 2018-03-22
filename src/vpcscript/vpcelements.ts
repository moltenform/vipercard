
/* autoimport:start */
import { cProductName, cTkSyntaxMarker, makeVpcScriptErr, makeVpcInternalErr, checkThrow, checkThrowEq, FormattedSubstringUtil, CodeLimits, VpcIntermedValBase, IntermedMapOfIntermedVals, VpcVal, VpcValS, VpcValN, VpcValBool, VarCollection, VariableCollectionConstants, VpcEvalHelpers, ReadableContainer, WritableContainer, RequestedChunk, ChunkResolution, VpcUI512Serialization, CountNumericId } from "../vpcscript/vpcutil.js";
import { RequestedChunkType, PropAdjective, SortStyle, OrdinalOrPosition, RequestedChunkTextPreposition, VpcElType, VpcTool, toolToPaintOntoCanvasShapes, VpcToolCtg, getToolCategory, VpcBuiltinMsg, getMsgNameFromType, VpcOpCtg, getPositionFromOrdinalOrPosition } from "../vpcscript/vpcenums.js";
import { ChvLexer, ChvParser, ChvToken, ChvILexingResult, ChvILexingError, ChvIToken } from "../vpcscript/bridgechv.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export enum PrpTyp {
    __isUI512Enum = 1,
    str,
    num,
    bool,
}

type PropGetter<T extends VpcElBase> = [PrpTyp, string | ((me: T) => string | number | boolean)];
type PropSetter<T extends VpcElBase> = [PrpTyp, string | ((me: T, v: string | number | boolean) => void)];

export abstract class VpcElBase extends UI512Settable {
    isVpcElBase = true;
    readonly parentId: string;
    protected abstract _name: string;
    readonly tmpar: [boolean, any] = [false, undefined];
    abstract getType(): VpcElType;
    abstract getAttributesList(): string[];
    abstract startGettersSetters(): void;
    private realSet: Function;
    private realSetFtxt: Function;
    protected getters: { [key: string]: PropGetter<VpcElBase> };
    protected setters: { [key: string]: PropSetter<VpcElBase> };

    constructor(id: string, parentid: string) {
        super(id);
        this.parentId = parentid;
        this.startGettersSetters();
        this.realSet = this.set;
        this.realSetFtxt = this.setftxt;
    }

    makeDormant() {
        // cause errors if anyone tries to access the object
        this.getters = undefined as any;
        this.setters = undefined as any;
        this.set = undefined as any;
        this.setftxt = undefined as any;
    }

    unmakeDormant1() {
        this.startGettersSetters();
        this.set = this.realSet as any;
        this.setftxt = this.realSetFtxt as any;
    }

    matchesType(type: VpcElType): boolean {
        if (type === VpcElType.Bg) {
            return ((this as any) as VpcElBg).isVpcElBg;
        } else if (type === VpcElType.Btn) {
            return ((this as any) as VpcElButton).isVpcElButton;
        } else if (type === VpcElType.Fld) {
            return ((this as any) as VpcElField).isVpcElField;
        } else if (type === VpcElType.Card) {
            return ((this as any) as VpcElCard).isVpcElCard;
        } else if (type === VpcElType.Stack) {
            return ((this as any) as VpcElStack).isVpcElStack;
        } else {
            return false;
        }
    }

    static simpleGetSet(
        getters: { [key: string]: PropGetter<VpcElBase> },
        setters: { [key: string]: PropSetter<VpcElBase> },
        simple: [string, PrpTyp][]
    ) {
        for (let [propname, prptyp] of simple) {
            getters[propname] = [prptyp, propname];
            setters[propname] = [prptyp, propname];
        }
    }

    getProp(propname: string) {
        let found = this.getters[propname];
        if (found) {
            let typ = found[0];
            let mappedprop = found[1];
            if (typ === PrpTyp.str) {
                if (typeof mappedprop === "function") {
                    return VpcValS(mappedprop(this) as string);
                } else {
                    assertTrue(isString(mappedprop), "4,|not a string");
                    return VpcValS(this.get_s(mappedprop));
                }
            } else if (typ === PrpTyp.num) {
                if (typeof mappedprop === "function") {
                    return VpcValN(mappedprop(this) as number);
                } else {
                    assertTrue(isString(mappedprop), "4+|not a string");
                    return VpcValN(this.get_n(mappedprop));
                }
            } else if (typ === PrpTyp.bool) {
                if (typeof mappedprop === "function") {
                    return VpcValBool(mappedprop(this) as boolean);
                } else {
                    assertTrue(isString(mappedprop), "4*|not a string");
                    return VpcValBool(this.get_b(mappedprop));
                }
            } else {
                throw makeVpcScriptErr(`4)|invalid PrpTyp ${typ} for el id ${this.id}`);
            }
        } else {
            throw makeVpcScriptErr(`4(|unknown property ${propname} for el id ${this.id}`);
        }
    }

    setProp(propname: string, val: VpcVal) {
        let found = this.setters[propname];
        if (found) {
            let typ = found[0];
            let mappedprop = found[1];
            if (typ === PrpTyp.str) {
                if (typeof mappedprop === "function") {
                    mappedprop(this, val.readAsString());
                } else {
                    assertTrue(isString(mappedprop), "4&|prop name not a string");
                    this.set(mappedprop, val.readAsString());
                }
            } else if (typ === PrpTyp.num) {
                if (typeof mappedprop === "function") {
                    mappedprop(this, val.readAsStrictInteger(this.tmpar));
                } else {
                    assertTrue(isString(mappedprop), "4%|prop name not a string");
                    this.set(mappedprop, val.readAsStrictInteger(this.tmpar));
                }
            } else if (typ === PrpTyp.bool) {
                if (typeof mappedprop === "function") {
                    mappedprop(this, val.readAsStrictBoolean(this.tmpar));
                } else {
                    assertTrue(isString(mappedprop), "4$|prop name not a string");
                    this.set(mappedprop, val.readAsStrictBoolean(this.tmpar));
                }
            } else {
                throw makeVpcScriptErr(`4#|invalid PrpTyp ${typ} for el id ${this.id}`);
            }
        } else {
            throw makeVpcScriptErr(`4!|unknown property ${propname} for el id ${this.id}`);
        }
    }

    static findIndexById<T extends VpcElBase>(list: T[], id: string) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                return i;
            }
        }

        return undefined;
    }

    static getIndexById<T extends VpcElBase>(list: T[], id: string) {
        return throwIfUndefined(VpcElBase.findIndexById(list, id), "4 |id not found in this list", id);
    }

    static findByName<T extends VpcElBase>(list: VpcElBase[], name: string, type: VpcElType) {
        for (let item of list) {
            if (item._name === name) {
                if (item.getType() === type) {
                    return item as T;
                }
            }
        }

        return undefined;
    }

    static findByOrdinal<T extends VpcElBase>(list: VpcElBase[], currentIndex: number, pos: OrdinalOrPosition) {
        let index = getPositionFromOrdinalOrPosition(pos, currentIndex, 0, list.length - 1);
        return list[index] ? (list[index] as T) : undefined;
    }

    static getChildrenArrays(vel: VpcElBase): VpcElBase[][] {
        let velAsCard = vel as VpcElCard;
        let velAsBg = vel as VpcElBg;
        let velAsStack = vel as VpcElStack;
        if (velAsCard && velAsCard.isVpcElCard) {
            return [velAsCard.parts];
        } else if (velAsBg && velAsBg.isVpcElBg) {
            return [velAsBg.cards, velAsBg.parts];
        } else if (velAsStack && velAsStack.isVpcElStack) {
            return [velAsStack.bgs];
        } else {
            return [];
        }
    }
}

export abstract class VpcElSizable extends VpcElBase {
    isVpcElSizable = true;
    protected _x = 0;
    protected _y = 0;
    protected _w = 0;
    protected _h = 0;
    setDimensions(newx: number, newy: number, neww: number, newh: number, context = ChangeContext.Default) {
        checkThrow(neww >= 0, `7H|width must be >= 0 but got ${neww}`);
        checkThrow(newh >= 0, `7G|height must be >= 0 but got ${newh}`);
        this.set("x", newx, context);
        this.set("y", newy, context);
        this.set("w", neww, context);
        this.set("h", newh, context);
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    static szGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters["width"] = [PrpTyp.num, "w"];
        getters["height"] = [PrpTyp.num, "h"];
        getters["left"] = [PrpTyp.num, "x"];
        getters["top"] = [PrpTyp.num, "y"];
        getters["right"] = [PrpTyp.num, (me: VpcElSizable) => me._x + me._w];
        getters["bottom"] = [PrpTyp.num, (me: VpcElSizable) => me._y + me._h];
        getters["topleft"] = [PrpTyp.str, (me: VpcElSizable) => `${me._x},${me._y}`];
        getters["botright"] = [PrpTyp.str, (me: VpcElSizable) => `${me._x + me._w},${me._y + me._h}`];
        getters["rect"] = [PrpTyp.str, (me: VpcElSizable) => `${me._x},${me._y},${me._x + me._w},${me._y + me._h}`];
        getters["loc"] = [PrpTyp.str, (me: VpcElSizable) => `${me._x + Math.trunc(me._w / 2)},${me._y + Math.trunc(me._h / 2)}`];
        getters["bottomright"] = getters["botright"];
        getters["rectangle"] = getters["rect"];
        getters["location"] = getters["loc"];
    }

    static szSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters["width"] = [PrpTyp.num, (me: VpcElSizable, n: number) => me.setDimensions(me._x, me._y, n, me._h)];
        setters["height"] = [PrpTyp.num, (me: VpcElSizable, n: number) => me.setDimensions(me._x, me._y, me._w, n)];
        setters["left"] = [PrpTyp.num, (me: VpcElSizable, n: number) => me.setDimensions(n, me._y, me._w, me._h)];
        setters["top"] = [PrpTyp.num, (me: VpcElSizable, n: number) => me.setDimensions(me._x, n, me._w, me._h)];
        setters["right"] = [PrpTyp.num, (me: VpcElSizable, n: number) => me.setDimensions(n - me._w, me._y, me._w, me._h)];
        setters["bottom"] = [PrpTyp.num, (me: VpcElSizable, n: number) => me.setDimensions(me._x, n - me._h, me._w, me._h)];
        setters["topleft"] = [PrpTyp.str, (me: VpcElSizable, s: string) => me.setDimensions(getc(me, s, 0), getc(me, s, 1), me._w, me._h)];
        setters["botright"] = [
            PrpTyp.str,
            (me: VpcElSizable, s: string) => me.setDimensions(me._x, me._y, getc(me, s, 0) - me._x, getc(me, s, 1) - me._y),
        ];
        setters["rect"] = [
            PrpTyp.str,
            (me: VpcElSizable, s: string) =>
                me.setDimensions(getc(me, s, 0), getc(me, s, 1), getc(me, s, 2) - getc(me, s, 0), getc(me, s, 3) - getc(me, s, 1)),
        ];
        setters["loc"] = [
            PrpTyp.str,
            (me: VpcElSizable, s: string) => {
                let wasLocX = me._x + Math.trunc(me._w / 2);
                let wasLocY = me._y + Math.trunc(me._h / 2);
                let moveX = getc(me, s, 0) - wasLocX;
                let moveY = getc(me, s, 1) - wasLocY;
                me.setDimensions(me._x + moveX, me._y + moveY, me._w, me._h);
            },
        ];
        setters["bottomright"] = setters["botright"];
        setters["rectangle"] = setters["rect"];
        setters["location"] = setters["loc"];
    }
}

function getc(me: VpcElBase, s: string, coord: number): number {
    // get a coordinate from a list of integers 1,1,1,1
    let pts = s.split(",");
    checkThrow(coord < pts.length, `7F|could not get coord ${coord + 1} of ${s}`);
    VpcValS(pts[coord]).isItAStrictIntegerImpl(me.tmpar);
    checkThrow(me.tmpar[0] && typeof me.tmpar[1] === "number", `7E|coord ${coord + 1} of ${s} is not an integer`);
    return me.tmpar[1];
}

export class VpcElButton extends VpcElSizable {
    isVpcElButton = true;
    protected _autohilite = true;
    protected _enabled = true;
    protected _hilite = false;
    protected _checkmark = false;
    protected _icon = 0;
    protected _showlabel = true;
    protected _style: number = UI512BtnStyle.rectangle;
    protected _label = "";
    protected _textalign = "center";
    protected _textfont = "chicago";
    protected _textsize = 12;
    protected _textstyle = 0;
    protected _visible = true;
    protected _script = "";
    protected _name = "";

    static readonly attributesList = [
        "x",
        "y",
        "w",
        "h",
        "autohilite",
        "enabled",
        "hilite",
        "checkmark",
        "icon",
        "showlabel",
        "style",
        "label",
        "textalign",
        "textfont",
        "textsize",
        "textstyle",
        "visible",
        "script",
        "name",
    ];

    getAttributesList() {
        return VpcElButton.attributesList;
    }

    getType() {
        return VpcElType.Btn;
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    startGettersSetters() {
        VpcElButton.btnInit();
        this.getters = VpcElButton.cachedGetters;
        this.setters = VpcElButton.cachedSetters;
    }

    getFontAsUi512() {
        let spec = new TextFontSpec(this._textfont, this._textstyle, this._textsize);
        return spec.toSpecString();
    }

    static btnGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters["textalign"] = [PrpTyp.str, "textalign"];
        getters["script"] = [PrpTyp.str, "script"];
        getters["textstyle"] = [PrpTyp.str, (me: VpcElButton) => FormattedSubstringUtil.vpcstyleFromInt(me._textstyle)];
        getters["style"] = [
            PrpTyp.str,
            (me: VpcElButton) => {
                let ret = getEnumToStrOrUnknown<UI512BtnStyle>(UI512BtnStyle, me._style);
                return ret.replace(/osstandard/, "standard").replace(/osdefault/, "default");
            },
        ];
    }

    static btnSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters["name"] = [PrpTyp.str, "name"];
        setters["textstyle"] = [
            PrpTyp.str,
            (me: VpcElButton, s: string) => {
                let list = s.split(",").map(item => item.trim());
                me.set("textstyle", FormattedSubstringUtil.vpcstyleToInt(list));
            },
        ];

        setters["style"] = [
            PrpTyp.str,
            (me: VpcElButton, s: string) => {
                let styl = getStrToEnum<UI512BtnStyle>(UI512BtnStyle, "Button style", s);
                checkThrow(styl !== UI512BtnStyle.osboxmodal, "7D|this style is only supported internally");
                me.set("style", styl);
            },
        ];

        setters["textalign"] = [
            PrpTyp.str,
            (me: VpcElButton, s: string) => {
                s = s.toLowerCase().trim();
                if (s === "left") {
                    me.set("textalign", "left");
                } else if (s === "center") {
                    me.set("textalign", "center");
                } else {
                    throw makeVpcScriptErr(`4z|we don't currently support setting text align to ${s}`);
                }
            },
        ];
    }

    static simpleBtnGetSet(): [string, PrpTyp][] {
        return [
            ["autohilite", PrpTyp.bool],
            ["enabled", PrpTyp.bool],
            ["hilite", PrpTyp.bool],
            ["checkmark", PrpTyp.bool],
            ["icon", PrpTyp.num],
            ["label", PrpTyp.str],
            ["showlabel", PrpTyp.bool],
            ["visible", PrpTyp.bool],
            ["textfont", PrpTyp.str],
            ["textsize", PrpTyp.num],
        ];
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
    static btnInit() {
        if (!VpcElButton.cachedGetters || !VpcElButton.cachedSetters) {
            VpcElButton.cachedGetters = {};
            VpcElButton.cachedSetters = {};
            VpcElBase.simpleGetSet(VpcElButton.cachedGetters, VpcElButton.cachedSetters, VpcElButton.simpleBtnGetSet());
            VpcElButton.btnGetters(VpcElButton.cachedGetters);
            VpcElSizable.szGetters(VpcElButton.cachedGetters);
            VpcElButton.btnSetters(VpcElButton.cachedSetters);
            VpcElSizable.szSetters(VpcElButton.cachedSetters);
            Util512.freezeRecurse(VpcElButton.cachedGetters);
            Util512.freezeRecurse(VpcElButton.cachedSetters);
        }
    }
}

export enum UI512FldStyleInclScrolling {
    __isUI512Enum = 1,
    opaque,
    transparent,
    rectangle,
    shadow,
    alternateforms_rect = rectangle,
    scrolling = 200,
}

export class VpcElField extends VpcElSizable {
    isVpcElField = true;
    protected _dontwrap = false;
    protected _enabled = true;
    protected _locktext = false;
    protected _singleline = false;
    protected _selcaret = 0;
    protected _selend = 0;
    protected _scroll = 0;
    protected _style: number = UI512FldStyleInclScrolling.rectangle;
    protected _visible = true;
    protected _script = "";
    protected _textalign = "left";
    protected _name = "";

    // confirmed in emulator that there really does seem to be a separate
    // browse tool, select all, font menu->symbol, put "abc" into cd fld 1 -- setting the font to symbol does not stick
    // field tool, select the field, font menu->symbol, put "abc" into cd fld 1 -- setting the font does stick
    protected _defaulttextfont = "geneva";
    protected _defaulttextsize = 12;
    protected _defaulttextstyle = 0;

    protected _ftxt = new FormattedText();

    static readonly attributesList = [
        "x",
        "y",
        "w",
        "h",
        "dontwrap",
        "enabled",
        "locktext",
        "singleline",
        "selcaret",
        "selend",
        "scroll",
        "style",
        "visible",
        "script",
        "textalign",
        "name",
        "defaulttextfont",
        "defaulttextsize",
        "defaulttextstyle",
        "ftxt",
    ];

    getAttributesList() {
        return VpcElField.attributesList;
    }

    getType() {
        return VpcElType.Fld;
    }

    startGettersSetters() {
        VpcElField.fldInit();
        this.getters = VpcElField.cachedGetters;
        this.setters = VpcElField.cachedSetters;
    }

    getDefaultFontAsUi512() {
        let spec = new TextFontSpec(this._defaulttextfont, this._defaulttextstyle, this._defaulttextsize);
        return spec.toSpecString();
    }

    protected setEntireFontFromDefaultFont() {
        let font = this.getDefaultFontAsUi512();
        let newtxt = this.get_ftxt().getUnlockedCopy();
        newtxt.setFontEverywhere(font);
        this.setftxt(newtxt);
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
        this._ftxt.lock();
    }

    static fldGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters["textalign"] = [PrpTyp.str, "textalign"];
        getters["alltext"] = [PrpTyp.str, (me: VpcElField) => me.get_ftxt().toUnformatted()];
        getters["defaulttextstyle"] = [PrpTyp.str, (me: VpcElField) => FormattedSubstringUtil.vpcstyleFromInt(me._defaulttextstyle)];
        getters["style"] = [
            PrpTyp.str,
            (me: VpcElField) => {
                return getEnumToStrOrUnknown<UI512FldStyleInclScrolling>(UI512FldStyleInclScrolling, me._style);
            },
        ];

        // interestingly, when calling these without providing a chunk, they act on the default font
        // confirmed in emulator that it won't even say 'mixed', it will return default font even if no chars have it.
        getters["textstyle"] = getters["defaulttextstyle"];
        getters["textfont"] = getters["defaulttextfont"];
        getters["textsize"] = getters["defaulttextsize"];
    }

    static fldSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters["name"] = [PrpTyp.str, "name"];
        setters["style"] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                let styl = getStrToEnum<UI512FldStyleInclScrolling>(UI512FldStyleInclScrolling, 'Field style or "scrolling"', s);
                me.set("style", styl);
            },
        ];

        setters["textstyle"] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                me.setProp("defaulttextstyle", VpcValS(s));
                me.setEntireFontFromDefaultFont();
            },
        ];

        setters["textfont"] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                me.set("defaulttextfont", s);
                me.setEntireFontFromDefaultFont();
            },
        ];

        setters["textsize"] = [
            PrpTyp.num,
            (me: VpcElField, n: number) => {
                me.set("defaulttextsize", n);
                me.setEntireFontFromDefaultFont();
            },
        ];

        // as done by ui when the field tool is selected, or when saying put "abc" into cd fld 1 with no chunk qualifications
        setters["alltext"] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                let newtxt = FormattedText.newFromUnformatted(s);
                newtxt.setFontEverywhere(me.getDefaultFontAsUi512());
                me.setftxt(newtxt);
            },
        ];

        setters["defaulttextstyle"] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                let list = s.split(",").map(item => item.trim());
                me.set("defaulttextstyle", FormattedSubstringUtil.vpcstyleToInt(list));
            },
        ];

        setters["textalign"] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                s = s.toLowerCase().trim();
                if (s === "left") {
                    me.set("textalign", "left");
                } else if (s === "center") {
                    me.set("textalign", "center");
                } else {
                    throw makeVpcScriptErr(`4y|we don't currently support setting text align to ${s}`);
                }
            },
        ];
    }

    static simpleFldGetSet(): [string, PrpTyp][] {
        return [
            ["dontwrap", PrpTyp.bool],
            ["enabled", PrpTyp.bool],
            ["locktext", PrpTyp.bool],
            ["singleline", PrpTyp.bool],
            ["scroll", PrpTyp.num],
            ["defaulttextfont", PrpTyp.str],
            ["defaulttextsize", PrpTyp.num],
            ["visible", PrpTyp.bool],
        ];
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
    static fldInit() {
        if (!VpcElField.cachedGetters || !VpcElField.cachedSetters) {
            VpcElField.cachedGetters = {};
            VpcElField.cachedSetters = {};
            VpcElBase.simpleGetSet(VpcElField.cachedGetters, VpcElField.cachedSetters, VpcElField.simpleFldGetSet());
            VpcElField.fldGetters(VpcElField.cachedGetters);
            VpcElSizable.szGetters(VpcElField.cachedGetters);
            VpcElField.fldSetters(VpcElField.cachedSetters);
            VpcElSizable.szSetters(VpcElField.cachedSetters);
            Util512.freezeRecurse(VpcElField.cachedGetters);
            Util512.freezeRecurse(VpcElField.cachedSetters);
        }
    }

    specialSetPropChunkImpl(prop: string, s: string, charstart: number, charend: number): void {
        let newtxt = this.get_ftxt().getUnlockedCopy();
        let len = charend - charstart;
        if (prop === "textstyle") {
            let list = s.split(",").map(item => item.trim());
            FormattedSubstringUtil.setChunkTextStyle(newtxt, this.getDefaultFontAsUi512(), charstart, len, list);
        } else if (prop === "textfont") {
            FormattedSubstringUtil.setChunkTextFace(newtxt, this.getDefaultFontAsUi512(), charstart, len, s);
        } else if (prop === "textsize") {
            let n = VpcValS(s).readAsStrictInteger();
            FormattedSubstringUtil.setChunkTextSize(newtxt, this.getDefaultFontAsUi512(), charstart, len, n);
        } else {
            throw makeVpcScriptErr(`4x|can only say 'set the (prop) of char 1 to 2' for textstyle, textfont, or textsize`);
        }

        this.setftxt(newtxt);
    }

    specialGetPropChunkImpl(prop: string, charstart: number, charend: number): string {
        let len = charend - charstart;
        if (prop === "textstyle") {
            let list = FormattedSubstringUtil.getChunkTextStyle(this.get_ftxt(), this.getDefaultFontAsUi512(), charstart, len);
            return list.join(",");
        } else if (prop === "textfont") {
            return FormattedSubstringUtil.getChunkTextFace(this.get_ftxt(), this.getDefaultFontAsUi512(), charstart, len);
        } else if (prop === "textsize") {
            // as per spec this can return either an integer or the string 'mixed'
            return FormattedSubstringUtil.getChunkTextSize(this.get_ftxt(), this.getDefaultFontAsUi512(), charstart, len).toString();
        } else {
            throw makeVpcScriptErr(`4w|can only say 'get the (prop) of char 1 to 2' for textstyle, textfont, or textsize`);
        }
    }

    protected resolveChunkBounds(chunk: RequestedChunk, itemDel: string) {
        let newchunk = chunk.getClone();
        if (
            newchunk.type === RequestedChunkType.Chars &&
            !newchunk.ordinal &&
            newchunk.last !== undefined &&
            newchunk.last < newchunk.first
        ) {
            // for consistency with emulator, interesting behavior for negative intervals
            newchunk.first = newchunk.first - 1;
            newchunk.last = newchunk.first + 1;
        }

        // we handle the formattedText.len() === 0 case in getChunkTextAttribute
        let unformatted = this.get_ftxt().toUnformatted();
        newchunk.first = fitIntoInclusive(newchunk.first, 1, unformatted.length);
        let bounds = ChunkResolution.resolveBoundsForGet(unformatted, itemDel, newchunk);
        bounds = bounds === undefined ? [0, 0] : bounds;
        return bounds;
    }

    specialSetPropChunk(prop: string, chunk: RequestedChunk, val: VpcVal, itemDel: string) {
        let [start, end] = this.resolveChunkBounds(chunk, itemDel);
        return this.specialSetPropChunkImpl(prop, val.readAsString(), start, end);
    }

    specialGetPropChunk(prop: string, chunk: RequestedChunk, itemDel: string): VpcVal {
        let [start, end] = this.resolveChunkBounds(chunk, itemDel);
        return VpcValS(this.specialGetPropChunkImpl(prop, start, end));
    }
}

export class VpcElCard extends VpcElBase {
    isVpcElCard = true;
    protected _script = "";
    protected _name = "";
    protected _paint = "";
    protected _signalPaintUpdateWanted = 0;
    parts: (VpcElButton | VpcElField)[] = [];
    getAttributesList() {
        return ["script", "name", "paint", "signalPaintUpdateWanted"];
    }

    getType() {
        return VpcElType.Card;
    }

    startGettersSetters() {
        VpcElCard.cdInit();
        this.getters = VpcElCard.cachedGetters;
        this.setters = VpcElCard.cachedSetters;
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
    static cdInit() {
        if (!VpcElCard.cachedGetters || !VpcElCard.cachedSetters) {
            VpcElCard.cachedGetters = {};
            VpcElCard.cachedGetters["script"] = [PrpTyp.str, "script"];
            VpcElCard.cachedSetters = {};
            VpcElCard.cachedSetters["name"] = [PrpTyp.str, "name"];
            Util512.freezeRecurse(VpcElCard.cachedGetters);
            Util512.freezeRecurse(VpcElCard.cachedSetters);
        }
    }
}

export class VpcElBg extends VpcElBase {
    isVpcElBg = true;
    protected _script = "";
    protected _name = "";
    protected _paint = "";
    cards: VpcElCard[] = [];
    parts: (VpcElButton | VpcElField)[] = [];

    getAttributesList() {
        return ["script", "name", "paint"];
    }
    getType() {
        return VpcElType.Bg;
    }

    startGettersSetters() {
        VpcElBg.bgInit();
        this.getters = VpcElBg.cachedGetters;
        this.setters = VpcElBg.cachedSetters;
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
    static bgInit() {
        if (!VpcElBg.cachedGetters || !VpcElBg.cachedSetters) {
            VpcElBg.cachedGetters = {};
            VpcElBg.cachedGetters["script"] = [PrpTyp.str, "script"];
            VpcElBg.cachedSetters = {};
            VpcElBg.cachedSetters["name"] = [PrpTyp.str, "name"];
            Util512.freezeRecurse(VpcElBg.cachedGetters);
            Util512.freezeRecurse(VpcElBg.cachedSetters);
        }
    }
}

export class VpcElStack extends VpcElBase {
    isVpcElStack = true;
    protected _script = "";
    protected _name = "";
    bgs: VpcElBg[] = [];
    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    getAttributesList() {
        return ["script", "name"];
    }
    startGettersSetters() {
        VpcElStack.stackInit();
        this.getters = VpcElStack.cachedGetters;
        this.setters = VpcElStack.cachedSetters;
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
    static stackInit() {
        if (!VpcElStack.cachedGetters || !VpcElStack.cachedSetters) {
            VpcElStack.cachedGetters = {};
            VpcElStack.cachedGetters["script"] = [PrpTyp.str, "script"];
            VpcElStack.cachedSetters = {};
            VpcElStack.cachedSetters["name"] = [PrpTyp.str, "name"];
            Util512.freezeRecurse(VpcElStack.cachedGetters);
            Util512.freezeRecurse(VpcElStack.cachedSetters);
        }
    }

    getType() {
        return VpcElType.Stack;
    }

    findCardByName(name: string) {
        for (let bg of this.bgs) {
            let found = VpcElBase.findByName(bg.cards, name, VpcElType.Card);
            if (found) {
                return found;
            }
        }

        return undefined;
    }

    findCardStackPosition(cardid: string) {
        let count = 0;
        for (let bg of this.bgs) {
            for (let cd of bg.cards) {
                if (cd.id === cardid) {
                    return count;
                }

                count += 1;
            }
        }

        return undefined;
    }

    getCardStackPosition(cardid: string) {
        return throwIfUndefined(this.findCardStackPosition(cardid), "4v|card id not found", cardid);
    }

    findFromCardStackPosition(pos: number) {
        let count = 0;
        for (let bg of this.bgs) {
            for (let cd of bg.cards) {
                if (count === pos) {
                    return cd;
                }

                count += 1;
            }
        }
    }

    getFromCardStackPosition(pos: number) {
        return throwIfUndefined(this.findFromCardStackPosition(pos), "4u|card number not found", pos);
    }

    getCardByOrdinal(currentCardId: string, pos: OrdinalOrPosition): VpcElCard {
        if (pos === OrdinalOrPosition.first) {
            return this.bgs[0].cards[0];
        }

        let totalcards = this.bgs.map(bg => bg.cards.length).reduce(Util512.add);
        let lastcdposition = totalcards - 1;
        if (pos === OrdinalOrPosition.last) {
            return this.getFromCardStackPosition(lastcdposition);
        }

        let currentcdposition = this.getCardStackPosition(currentCardId);
        let nextcdposition = getPositionFromOrdinalOrPosition(pos, currentcdposition, 0, lastcdposition);
        return this.getFromCardStackPosition(nextcdposition);
    }

    *iterEntireStack(): IterableIterator<VpcElBase> {
        // important:
        // must process parents before children, as we
        // use this ordering during deserialization
        yield this;
        for (let bg of this.bgs) {
            yield bg;
            for (let cd of bg.cards) {
                yield cd;
                for (let pt of cd.parts) {
                    yield pt;
                }
            }
        }
    }
}

