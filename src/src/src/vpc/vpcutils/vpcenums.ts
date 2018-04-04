
/* auto */ import { makeUI512Error } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { Lines } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { PaintOntoCanvasShapes } from '../../ui512/draw/ui512imageserialize.js';

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
    eighth,
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

export function vpcElTypeToString(type: VpcElType, lang: UI512Lang, veryshort: boolean) {
    if (veryshort) {
        if (type === VpcElType.Unknown) {
            return '';
        } else if (type === VpcElType.Btn) {
            return 'cd btn';
        } else if (type === VpcElType.Fld) {
            return 'cd fld';
        } else if (type === VpcElType.Card) {
            return 'cd';
        } else if (type === VpcElType.Bg) {
            return 'bg';
        } else if (type === VpcElType.Stack) {
            return 'stack';
        } else if (type === VpcElType.Product) {
            return '';
        } else {
            throw makeUI512Error('unknown VpcElType' + type);
        }
    } else {
        if (type === VpcElType.Unknown) {
            return '';
        } else if (type === VpcElType.Btn) {
            return lang.translate('lngbutton');
        } else if (type === VpcElType.Fld) {
            return lang.translate('lngfield');
        } else if (type === VpcElType.Card) {
            return lang.translate('lngcard');
        } else if (type === VpcElType.Bg) {
            return lang.translate('lngbackground');
        } else if (type === VpcElType.Stack) {
            return lang.translate('lngstack');
        } else if (type === VpcElType.Product) {
            return '';
        } else {
            throw makeUI512Error('unknown VpcElType' + type);
        }
    }
}

export enum VpcTool {
    __isUI512Enum = 1,
    browse,
    button,
    field,
    select,
    brush,
    bucket,
    stamp,
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
    } else if (tl === VpcTool.bucket) {
        return PaintOntoCanvasShapes.Bucket;
    } else {
        throw makeUI512Error('toPaintOntoCanvasShapes unsupported tool ' + tl);
    }
}

export enum VpcToolCtg {
    __isUI512Enum = 1,
    ctgBrowse,
    ctgEdit,
    ctgShape,
    ctgRectSelect,
    ctgLasso,
    ctgSmear,
    ctgBucket,
    ctgCurve,
    ctgStamp,
    ctgNyi,
}

export function getToolCategory(tl: VpcTool): VpcToolCtg {
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
        case VpcTool.stamp:
            return VpcToolCtg.ctgStamp;
        case VpcTool.pencil:
            return VpcToolCtg.ctgSmear;
        case VpcTool.line:
            return VpcToolCtg.ctgShape;
        case VpcTool.lasso:
            return VpcToolCtg.ctgLasso;
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
    idle,
    afterkeydown,
    afterkeyup,
    __custom,
}

export enum MapTermToMilliseconds {
    __isUI512Enum = 1,
    tick = 16,
    ticks = 16,
    milliseconds = 1,
    ms = 1,
    second = 1000,
    seconds = 1000,
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

export function getPositionFromOrdinalOrPosition(
    rel: OrdinalOrPosition,
    current: number,
    min: number,
    max: number
): number {
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
            case OrdinalOrPosition.eighth:
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
