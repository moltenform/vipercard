
/* autoimport:start */
import { ChvLexer, ChvParser, ChvToken, ChvILexingResult, ChvILexingError, ChvIToken } from "../vpcscript/bridgechv.js";
import { UI512ViewDraw, PaintOntoCanvasShapes, PaintOntoCanvas } from "../ui512/ui512elementsdefaultview.js";
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export enum RequestedChunkType {
    __isUI512Enum = 1,
    Chars,
    Words,
    Items,
    Lines,
    alternateforms_char = Chars,
    alternateforms_character = Chars,
    alternateforms_chars = Chars,
    alternateforms_characters = Chars,
    alternateforms_word = Words,
    alternateforms_words = Words,
    alternateforms_item = Items,
    alternateforms_items = Items,
    alternateforms_line = Lines,
    alternateforms_lines = Lines,
}

export enum PropAdjective {
    __isUI512Enum = 1,
    empty,
    abbrev,
    long,
    short,
    alternateforms_abbreviated = abbrev,
    alternateforms_abbr = abbrev,
}

export enum SortStyle {
    __isUI512Enum = 1,
    text,
    numeric,
    international,
}

export enum OrdinalOrPosition {
    __isUI512Enum = 1,
    last,
    middle,
    any,
    first,
    second,
    third,
    fourth,
    fifth,
    sixth,
    seventh,
    eigth,
    ninth,
    tenth,
    next,
    previous,
    this,
    alternateforms_mid = middle,
    alternateforms_prev = previous,
}

export enum RequestedChunkTextPreposition {
    __isUI512Enum = 1,
    into,
    before,
    after,
}

export enum VpcElType {
    __isUI512Enum = 1,
    Unknown,
    Btn,
    Fld,
    Card,
    Bg,
    Stack,
    Product,
}

export enum VpcTool {
    __isUI512Enum = 1,
    browse,
    button,
    field,
    select,
    brush,
    bucket,
    text,
    pencil,
    line,
    lasso,
    eraser,
    rect,
    oval,
    roundrect,
    curve,
    spray,
    alternateforms_spray_can = spray,
    alternateforms_round_rect = roundrect,
    __first = browse,
    __last = spray,
}

export function toolToPaintOntoCanvasShapes(tl: VpcTool) {
    if (tl === VpcTool.line) {
        return PaintOntoCanvasShapes.ShapeLine;
    } else if (tl === VpcTool.rect) {
        return PaintOntoCanvasShapes.ShapeRectangle;
    } else if (tl === VpcTool.oval) {
        return PaintOntoCanvasShapes.ShapeElipse;
    } else if (tl === VpcTool.roundrect) {
        return PaintOntoCanvasShapes.ShapeRoundRect;
    } else if (tl === VpcTool.brush) {
        return PaintOntoCanvasShapes.SmearSmallBrush;
    } else if (tl === VpcTool.pencil) {
        return PaintOntoCanvasShapes.SmearPencil;
    } else if (tl === VpcTool.eraser) {
        return PaintOntoCanvasShapes.SmearRectangle;
    } else if (tl === VpcTool.spray) {
        return PaintOntoCanvasShapes.SmearSpraycan;
    } else if (tl === VpcTool.curve) {
        return PaintOntoCanvasShapes.ShapeCurve;
    } else {
        throw makeUI512Error("toPaintOntoCanvasShapes unsupported tool " + tl);
    }
}

export enum VpcToolCtg {
    __isUI512Enum = 1,
    ctgBrowse,
    ctgEdit,
    ctgShape,
    ctgRectSelect,
    ctgSmear,
    ctgBucket,
    ctgCurve,
    ctgNyi,
}

export function getToolCategory(tl: VpcTool) {
    switch (tl) {
        case VpcTool.browse:
            return VpcToolCtg.ctgBrowse;
        case VpcTool.button:
            return VpcToolCtg.ctgEdit;
        case VpcTool.field:
            return VpcToolCtg.ctgEdit;
        case VpcTool.select:
            return VpcToolCtg.ctgRectSelect;
        case VpcTool.brush:
            return VpcToolCtg.ctgSmear;
        case VpcTool.bucket:
            return VpcToolCtg.ctgBucket;
        case VpcTool.text:
            return VpcToolCtg.ctgNyi;
        case VpcTool.pencil:
            return VpcToolCtg.ctgSmear;
        case VpcTool.line:
            return VpcToolCtg.ctgShape;
        case VpcTool.lasso:
            return VpcToolCtg.ctgNyi;
        case VpcTool.eraser:
            return VpcToolCtg.ctgSmear;
        case VpcTool.rect:
            return VpcToolCtg.ctgShape;
        case VpcTool.oval:
            return VpcToolCtg.ctgShape;
        case VpcTool.roundrect:
            return VpcToolCtg.ctgShape;
        case VpcTool.spray:
            return VpcToolCtg.ctgSmear;
        case VpcTool.curve:
            return VpcToolCtg.ctgCurve;
        default:
            throw makeUI512Error(`4/|unknown tool ${tl}`);
    }
}

export enum VpcBuiltinMsg {
    __isUI512Enum = 1,
    openbackground,
    opencard,
    openstack,
    closebackground,
    closecard,
    mousedoubleclick,
    mousedown,
    mouseenter,
    mouseleave,
    mouseup,
    mousewithin,
    afterkeydown,
    afterkeyup,
    __custom,
}

export function getMsgNameFromType(tp: UI512EventType) {
    switch (tp) {
        case UI512EventType.KeyUp:
            return VpcBuiltinMsg.afterkeyup;
        case UI512EventType.KeyDown:
            return VpcBuiltinMsg.afterkeydown;
        case UI512EventType.MouseDown:
            return VpcBuiltinMsg.mousedown;
        case UI512EventType.MouseDownDouble:
            return VpcBuiltinMsg.mousedoubleclick;
        case UI512EventType.MouseUp:
            return VpcBuiltinMsg.mouseup;
        case UI512EventType.Idle:
            return VpcBuiltinMsg.mousewithin;
        case UI512EventType.MouseEnter:
            return VpcBuiltinMsg.mouseenter;
        case UI512EventType.MouseLeave:
            return VpcBuiltinMsg.mouseleave;
        default:
            throw makeUI512Error(`4.|unknown event type ${tp}`);
    }
}

export enum VpcOpCtg {
    __isUI512Enum = 1,
    OpLogicalOrAnd,
    OpStringConcat,
    OpStringWithin,
    OpEqualityGreaterLessOrContains,
    OpPlusMinus,
    OpMultDivideExpDivMod,
}

export function getPositionFromOrdinalOrPosition(rel: OrdinalOrPosition, current: number, min: number, max: number): number {
    let getPositionUnbounded = () => {
        switch (rel) {
            case OrdinalOrPosition.last:
                return max;
            case OrdinalOrPosition.middle:
                // confirmed in emulator that this rounds to highest
                return Math.ceil((min + max) / 2);
            case OrdinalOrPosition.any:
                return Util512.getRandIntInclusiveWeak(min, max);
            case OrdinalOrPosition.first:
                return min;
            case OrdinalOrPosition.second:
                return min + 1;
            case OrdinalOrPosition.third:
                return min + 2;
            case OrdinalOrPosition.fourth:
                return min + 3;
            case OrdinalOrPosition.fifth:
                return min + 4;
            case OrdinalOrPosition.sixth:
                return min + 5;
            case OrdinalOrPosition.seventh:
                return min + 6;
            case OrdinalOrPosition.eigth:
                return min + 7;
            case OrdinalOrPosition.ninth:
                return min + 8;
            case OrdinalOrPosition.tenth:
                return min + 9;
            case OrdinalOrPosition.next:
                return current + 1;
            case OrdinalOrPosition.previous:
                return current - 1;
            case OrdinalOrPosition.this:
                return current;
            default:
                throw makeUI512Error(`4-|unknown ordinal ${rel}`);
        }
    };

    let ret = getPositionUnbounded();
    return fitIntoInclusive(ret, min, max);
}
