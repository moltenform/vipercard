
/* auto */ import { makeUI512Error } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512PaintDispatchShapes } from '../../ui512/draw/ui512DrawPaintDispatch.js';


/**
 * SortType for the "sort" command
 * text sorting (default), compares text, not case sensitive.
 * numeric sorting, interpret as numbers, e.g. 10 sorts after 2.
 * international sorting, compares text using current locale.
 * values here are lowercase, because they are used by the interpreter.
 */
export enum SortType {
    __isUI512Enum = 1,
    text,
    numeric,
    international
}


/**
 * PropAdjective for properties, e.g.
 * get the long id of cd btn "btn1"
 * values here are lowercase, because they are used by the interpreter.
 */
export enum PropAdjective {
    __isUI512Enum = 1,
    empty,
    abbrev,
    long,
    short,
    alternateforms_abbreviated = abbrev,
    alternateforms_abbr = abbrev
}

/**
 * ordinal or position, i.e. "go to third card"
 * values here are lowercase, because they are used by the interpreter.
 */
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
    alternateforms_prev = previous
}

/**
 * a 'chunk' is a way to specify a contiguous span of text, e.g.
 * word 3 to 4 of "a b c d e"
 * these are the types of chunks currently supported.
 * some values here are lowercase, because they are used by the interpreter.
 */
export enum VpcChunkType {
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
    alternateforms_lines = Lines
}

/**
 * preposition, e.g. put "a" after cd fld "fld1"
 * values here are lowercase, because they are used by the interpreter.
 */
export enum VpcChunkPreposition {
    __isUI512Enum = 1,
    into,
    before,
    after
}

/**
 * type of vpc element
 */
export enum VpcElType {
    __isUI512Enum = 1,
    Unknown,
    Btn,
    Fld,
    Card,
    Bg,
    Stack,
    Product
}

/**
 * string name of the type, to show in UI
 */
export function vpcElTypeToString(type: VpcElType, veryShort: boolean) {
    if (veryShort) {
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
            return 'button';
        } else if (type === VpcElType.Fld) {
            return 'field';
        } else if (type === VpcElType.Card) {
            return 'card';
        } else if (type === VpcElType.Bg) {
            return 'background';
        } else if (type === VpcElType.Stack) {
            return 'stack';
        } else if (type === VpcElType.Product) {
            return '';
        } else {
            throw makeUI512Error('unknown VpcElType' + type);
        }
    }
}

/**
 * a tool
 * you can use __first and __last to iterate all tools
 */
export enum VpcTool {
    __isUI512Enum = 1,
    Browse,
    Button,
    Field,
    Select,
    Brush,
    Bucket,
    Stamp,
    Pencil,
    Line,
    Lasso,
    Eraser,
    Rect,
    Oval,
    Roundrect,
    Curve,
    Spray,
    __first = Browse,
    __last = Spray,
    alternateforms_Spray_can = Spray,
    alternateforms_Round_rect = Roundrect,
}

/**
 * a tool category
 * not used by scripts, but used by UI implementation,
 * since say the "pencil" tool and "brush" tool do basically the same thing,
 * they can share the same code
 */
export enum VpcToolCtg {
    __isUI512Enum = 1,
    CtgBrowse,
    CtgEdit,
    CtgShape,
    CtgRectSelect,
    CtgLasso,
    CtgSmear,
    CtgBucket,
    CtgCurve,
    CtgStamp,
    CtgNyi
}

/**
 * from tool to tool category
 */
export function getToolCategory(tl: VpcTool): VpcToolCtg {
    switch (tl) {
        case VpcTool.Browse:
            return VpcToolCtg.CtgBrowse;
        case VpcTool.Button:
            return VpcToolCtg.CtgEdit;
        case VpcTool.Field:
            return VpcToolCtg.CtgEdit;
        case VpcTool.Select:
            return VpcToolCtg.CtgRectSelect;
        case VpcTool.Brush:
            return VpcToolCtg.CtgSmear;
        case VpcTool.Bucket:
            return VpcToolCtg.CtgBucket;
        case VpcTool.Stamp:
            return VpcToolCtg.CtgStamp;
        case VpcTool.Pencil:
            return VpcToolCtg.CtgSmear;
        case VpcTool.Line:
            return VpcToolCtg.CtgShape;
        case VpcTool.Lasso:
            return VpcToolCtg.CtgLasso;
        case VpcTool.Eraser:
            return VpcToolCtg.CtgSmear;
        case VpcTool.Rect:
            return VpcToolCtg.CtgShape;
        case VpcTool.Oval:
            return VpcToolCtg.CtgShape;
        case VpcTool.Roundrect:
            return VpcToolCtg.CtgShape;
        case VpcTool.Spray:
            return VpcToolCtg.CtgSmear;
        case VpcTool.Curve:
            return VpcToolCtg.CtgCurve;
        default:
            throw makeUI512Error(`4/|unknown tool ${tl}`);
    }
}

/**
 * from tool to UI512PaintDispatchShapes
 */
export function toolToDispatchShapes(tl: VpcTool) {
    if (tl === VpcTool.Line) {
        return UI512PaintDispatchShapes.ShapeLine;
    } else if (tl === VpcTool.Rect) {
        return UI512PaintDispatchShapes.ShapeRectangle;
    } else if (tl === VpcTool.Oval) {
        return UI512PaintDispatchShapes.ShapeElipse;
    } else if (tl === VpcTool.Roundrect) {
        return UI512PaintDispatchShapes.ShapeRoundRect;
    } else if (tl === VpcTool.Brush) {
        return UI512PaintDispatchShapes.SmearSmallBrush;
    } else if (tl === VpcTool.Pencil) {
        return UI512PaintDispatchShapes.SmearPencil;
    } else if (tl === VpcTool.Eraser) {
        return UI512PaintDispatchShapes.SmearRectangle;
    } else if (tl === VpcTool.Spray) {
        return UI512PaintDispatchShapes.SmearSpraycan;
    } else if (tl === VpcTool.Curve) {
        return UI512PaintDispatchShapes.ShapeCurve;
    } else if (tl === VpcTool.Bucket) {
        return UI512PaintDispatchShapes.Bucket;
    } else {
        throw makeUI512Error('toPaintOntoCanvasShapes unsupported tool ' + tl);
    }
}

/**
 * built-in messages sent to scripts.
 * values here are lowercase, because they are used by the interpreter.
 */
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
    __custom
}

/**
 * what we support for the wait command, e.g. "wait 100 ms"
 * values here are lowercase, because they are used by the interpreter.
 */
export enum MapTermToMilliseconds {
    __isUI512Enum = 1,
    tick = 16,
    ticks = 16,
    milliseconds = 1,
    ms = 1,
    second = 1000,
    seconds = 1000
}

/**
 * event details type tp message type
 * note that Idle can become either on mousewithin or on idle depending on context
 */
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

/**
 * levels of operations when evaluating an expression
 */
export enum VpcOpCtg {
    __isUI512Enum = 1,
    OpLogicalOrAnd,
    OpStringConcat,
    OpStringWithin,
    OpEqualityGreaterLessOrContains,
    OpPlusMinus,
    OpMultDivideExpDivMod
}

/**
 * evaulate an OrdinalOrPosition
 */
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
                /* confirmed in emulator that this rounds to highest */
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
