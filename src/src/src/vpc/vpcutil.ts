
/* autoimport:start */
import { RequestedChunkType, PropAdjective, SortStyle, OrdinalOrPosition, RequestedChunkTextPreposition, VpcElType, VpcTool, toolToPaintOntoCanvasShapes, VpcToolCtg, getToolCategory, VpcBuiltinMsg, getMsgNameFromType, VpcOpCtg, getPositionFromOrdinalOrPosition } from "../vpcscript/vpcenums.js";
import { ChvLexer, ChvParser, ChvToken, ChvILexingResult, ChvILexingError, ChvIToken } from "../vpcscript/bridgechv.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

const msgScriptErr = "VpcScriptError: ";
const msgInternalErr = "Vpc Internal Error: ";
export const cProductName = "Vpc";
export const cTkSyntaxMarker = "\n";
const maxint32 = 2147483647;
const minint32 = -2147483648;

export function makeVpcScriptErr(s: string) {
    let err = makeUI512ErrorGeneric(s, msgScriptErr);
    (err as any).isVpcError = true;
    (err as any).isVpcScriptError = true;
    (err as any).vpcLine = -1;
    return err;
}

export function makeVpcInternalErr(s: string) {
    let err = makeUI512ErrorGeneric(s, msgInternalErr);
    (err as any).isVpcError = true;
    (err as any).isVpcInternalError = true;
    (err as any).vpcLine = -1;
    return err;
}

export function checkThrow(condition: any, msg: string, c1: any = "", c2: any = "") {
    if (!condition) {
        throw makeVpcScriptErr(`${msg} ${c1} ${c2}`);
    }
}

export function checkThrowEq(expected: any, got: any, msg: string, c1: any = "", c2: any = "") {
    if (defaultSort(expected, got) !== 0) {
        throw makeVpcScriptErr(`${msg} expected "${expected}" but got "${got}" ${c1} ${c2}`);
    }
}

export class FormattedSubstringUtil {
    static vpcstyleToInt(list: string[]): TextFontStyling {
        let ret = TextFontStyling.Default;
        for (let s of list) {
            s = s.toLowerCase().trim();
            switch (s) {
                case "plain":
                    break;
                case "bold":
                    ret |= TextFontStyling.Bold;
                    break;
                case "italic":
                    ret |= TextFontStyling.Italic;
                    break;
                case "underline":
                    ret |= TextFontStyling.Underline;
                    break;
                case "outline":
                    ret |= TextFontStyling.Outline;
                    break;
                case "shadow":
                    ret |= TextFontStyling.Shadow;
                    break;
                case "condense":
                    ret |= TextFontStyling.Condensed;
                    break;
                case "extend":
                    ret |= TextFontStyling.Extend;
                    break;
                default:
                    throw makeVpcScriptErr(`67|warning: unrecognized text style ${s}`);
            }
        }

        return ret;
    }

    static vpcstyleFromInt(style: TextFontStyling) {
        let ret: string[] = [];
        if (style === 0) {
            ret.push("plain");
        }
        if ((style & TextFontStyling.Bold) !== 0) {
            ret.push("bold");
        }
        if ((style & TextFontStyling.Italic) !== 0) {
            ret.push("italic");
        }
        if ((style & TextFontStyling.Underline) !== 0) {
            ret.push("underline");
        }
        if ((style & TextFontStyling.Outline) !== 0) {
            ret.push("outline");
        }
        if ((style & TextFontStyling.Shadow) !== 0) {
            ret.push("shadow");
        }
        if ((style & TextFontStyling.Condensed) !== 0) {
            ret.push("condense");
        }
        if ((style & TextFontStyling.Extend) !== 0) {
            ret.push("extend");
        }

        return ret.join(",");
    }

    static ui512styleFromvpcStyleList(vpcstyles: string[]) {
        let n = FormattedSubstringUtil.vpcstyleToInt(vpcstyles);
        return textFontStylingToString(n);
    }

    static ui512styleTovpcStyleList(sstyle: string) {
        let style = stringToTextFontStyling(sstyle);
        return FormattedSubstringUtil.vpcstyleFromInt(style).split(",");
    }

    static fitBounds(txtlen: number, instart: number, inlen: number, isGet: boolean) {
        if (isGet && inlen === 0) {
            inlen = 1;
        }

        let end = instart + inlen;
        let start = fitIntoInclusive(instart, 0, txtlen - 1);
        end = fitIntoInclusive(end, start, txtlen);
        return [start, end];
    }

    protected static getChunkTextAttribute(txt: FormattedText, defaultFont: string, instart: number, inlen: number, fn: Function) {
        if (txt.len() === 0 || instart >= txt.len()) {
            return fn(defaultFont);
        }

        let seenAttr = "";
        let [start, end] = FormattedSubstringUtil.fitBounds(txt.len(), instart, inlen, true);
        for (let i = start; i < end; i++) {
            let attr = fn(txt.fontAt(i));
            if (seenAttr !== "" && seenAttr !== attr) {
                return "mixed";
            } else {
                seenAttr = attr;
            }
        }

        return seenAttr ? seenAttr : fn(defaultFont);
    }

    protected static setChunkTextAttribute(txt: FormattedText, defaultFont: string, instart: number, inlen: number, fn: Function) {
        if (txt.len() === 0 || instart >= txt.len()) {
            return;
        }

        let [start, end] = FormattedSubstringUtil.fitBounds(txt.len(), instart, inlen, false);
        for (let i = start; i < end; i++) {
            txt.setFontAt(i, fn(txt.fontAt(i)));
        }
    }

    static getChunkTextFace(txt: FormattedText, defaultFont: string, instart: number, inlen: number): string {
        let fn = (s: string) => TextFontSpec.getFacePart(s);
        return FormattedSubstringUtil.getChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
    }

    static setChunkTextFace(txt: FormattedText, defaultFont: string, instart: number, inlen: number, snext: string) {
        let fn = (scurrent: string) => TextFontSpec.setFacePart(scurrent, snext);
        return FormattedSubstringUtil.setChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
    }

    static getChunkTextSize(txt: FormattedText, defaultFont: string, instart: number, inlen: number): number | string {
        let fn = (s: string) => TextFontSpec.getSizePart(s);
        let ret = FormattedSubstringUtil.getChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
        let n = parseInt(ret, 10);
        return ret === "mixed" ? ret : isFinite(n) ? n : 0;
    }

    static setChunkTextSize(txt: FormattedText, defaultFont: string, instart: number, inlen: number, next: number) {
        let ssize = next.toString();
        let fn = (scurrent: string) => TextFontSpec.setSizePart(scurrent, ssize);
        return FormattedSubstringUtil.setChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
    }

    static getChunkTextStyle(txt: FormattedText, defaultFont: string, instart: number, inlen: number): string[] {
        let fn = (s: string) => TextFontSpec.getStylePart(s);
        let ret = FormattedSubstringUtil.getChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
        return ret === "mixed" ? ["mixed"] : FormattedSubstringUtil.ui512styleTovpcStyleList(ret);
    }

    static setChunkTextStyle(txt: FormattedText, defaultFont: string, instart: number, inlen: number, list: string[]) {
        let snext = FormattedSubstringUtil.ui512styleFromvpcStyleList(list);
        let fn = (scurrent: string) => TextFontSpec.setStylePart(scurrent, snext);
        return FormattedSubstringUtil.setChunkTextAttribute(txt, defaultFont, instart, inlen, fn);
    }
}

export enum CodeLimits {
    maxCustomFnCallsAllowedInLine = 100,
    maxTokensInLine = 512,
    maxLinesInScript = 32 * 1024,
    maxCodeFrames = 1000,
    cacheThisManyParsedLines = 100,
    maxLocalVars = 128,
    maxGlobalVars = 128,
    maxStringLength = 64 * 1024,
    maxVelChildren = 128,
    limitChevErr = 128,
    maxStackNameLen = 256,
}

export class VpcIntermedValBase {
    isIntermedValBase = true;
}

export class IntermedMapOfIntermedVals extends VpcIntermedValBase {
    isIntermedMapOfIntermedVals = true;
    vals: { [key: string]: (VpcIntermedValBase | string)[] } = {};

    // same logic, but minor perf benefit if 2 methods
    addString(key: string, val: string) {
        if (!this.vals[key]) {
            this.vals[key] = [val];
        } else {
            this.vals[key].push(val);
        }
    }

    addResult(key: string, val: VpcIntermedValBase) {
        if (!this.vals[key]) {
            this.vals[key] = [val];
        } else {
            this.vals[key].push(val);
        }
    }
}

// VpcVals are now immutable
let restrictConstructorAccess: number[] = [];
export class VpcVal extends VpcIntermedValBase {
    isVpcVal = true;
    static readonly epsilon = 0.000001;
    protected readonly v: string;
    constructor(v: string, token: number[]) {
        super();

        // discourage people outside this file from calling the constructor
        assertTrue(token === restrictConstructorAccess, "66|please don't use the VpcVal constructor directly");
        assertTrue(v !== null && v !== undefined, "65|tried to set string as null or undefined");
        checkThrow(v.length < CodeLimits.maxStringLength, "8w|exceeded max string length");
        this.v = v;
    }

    isItAStrictBooleanImpl(output: [boolean, any]) {
        // the product is strict. "if 0" or "if ''"" are runtime errors.
        // it does allow trailing whitespace though
        output[0] = false;
        output[1] = undefined;
        if (this.v.match(/^true\s*$/)) {
            output[0] = true;
            output[1] = true;
        } else if (this.v.match(/^false\s*$/)) {
            output[0] = true;
            output[1] = false;
        }
    }

    readAsStrictBoolean(tmpArr?: [boolean, any]): boolean {
        if (!tmpArr) {
            tmpArr = [false, undefined];
        }

        this.isItAStrictBooleanImpl(tmpArr);
        if (tmpArr[0]) {
            return tmpArr[1];
        } else {
            throw makeVpcScriptErr(`64|expected true or false here, got "${this.v}"`);
        }
    }

    isItInteger() {
        let ar: [boolean, any] = [false, undefined];
        this.isItAStrictIntegerImpl(ar);
        return ar[0];
    }

    isItNumeric() {
        let ar: [boolean, any] = [false, undefined];
        this.isItNumericImpl(ar);
        return ar[0];
    }

    // scientific notation is allowed only for numeric literals
    // 12e1 is a number -- true
    // "12e1" is a number -- false
    static readScientificNotation(s: string) {
        if (s.match(/^\s*-?[0-9]+(\.[0-9]*)?(e[-+]?[0-9]+)?\s*$/)) {
            let f = parseFloat(s);
            if (isFinite(f) && f < 1e18 && f > -1e18) {
                return VpcValN(f);
            }
        }

        return undefined;
    }

    // scientific notation is allowed only for numeric literals
    // 12e1 is a number -- true
    // "12e1" is a number -- false
    static getScientificNotation(s: string) {
        return throwIfUndefined(VpcVal.readScientificNotation(s), `63|expected a number/scientific notation here, or > 1e18, got "${s}"`);
    }

    isItNumericImpl(output: [boolean, any]) {
        // emulator accepts whitespace, even newlines, before/after the number
        // confirmed that emulator accepts "3." as same as "3.0"
        output[0] = false;
        output[1] = undefined;
        if (!!this.v && !!this.v.match(/^\s*-?[0-9]+(\.[0-9]*)?\s*$/)) {
            let ret = parseFloat(this.v);
            if (isFinite(ret) && ret < 1e18 && ret > -1e18) {
                output[0] = true;
                output[1] = ret;
            }
        }
    }

    readAsStrictNumeric(tmpArr?: [boolean, any]): number {
        if (!tmpArr) {
            tmpArr = [false, undefined];
        }

        this.isItNumericImpl(tmpArr);
        if (tmpArr[0]) {
            return tmpArr[1];
        } else {
            throw makeVpcScriptErr(`62|expected a number here, got "${this.v}"`);
        }
    }

    isItAStrictIntegerImpl(output: [boolean, any]) {
        this.isItNumericImpl(output);
        let rounded = Math.round(output[1]);
        if (output[0] && (output[1] > maxint32 || output[1] < minint32)) {
            // "numbers" can be greater than 2^31,
            // but they aren't treated as "integers".
            // we're being conservative because for large numbers the rounding check below will fail,
            // let's use a well-defined cutoff that will be less than Number.LARGEST_SAFE_INT
            output[0] = false;
            output[1] = undefined;
        } else if (output[0] && Math.abs(output[1] - rounded) < VpcVal.epsilon) {
            output[0] = true;
            output[1] = rounded;
        } else {
            output[0] = false;
            output[1] = undefined;
        }
    }

    readAsStrictInteger(tmpArr?: [boolean, any]): number {
        if (!tmpArr) {
            tmpArr = [false, undefined];
        }

        this.isItAStrictIntegerImpl(tmpArr);
        if (tmpArr[0]) {
            return tmpArr[1];
        } else {
            throw makeVpcScriptErr(`61|expected an integer here, got "${this.v}"`);
        }
    }

    comparesEqual(other: VpcVal) {
        let h = new VpcEvalHelpers();
        let ret = h.evalOp(this, other, VpcOpCtg.OpEqualityGreaterLessOrContains, "==");
        return ret.readAsStrictBoolean();
    }

    readAsString() {
        if (this.v !== null && this.v !== undefined) {
            return this.v;
        } else {
            throw makeVpcScriptErr(`9g|value is null, got "${this.v}"`);
        }
    }

    isEmpty() {
        return this.v.length > 0;
    }

    static readonly Empty = new VpcVal("", restrictConstructorAccess);
    static readonly True = new VpcVal("true", restrictConstructorAccess);
    static readonly False = new VpcVal("false", restrictConstructorAccess);
    static readonly Zero = new VpcVal("0", restrictConstructorAccess);
    static readonly One = new VpcVal("1", restrictConstructorAccess);
}

export function VpcValS(s: string) {
    return new VpcVal(s, restrictConstructorAccess);
}

// toFixed returns a string representation that does not use exponential notation
export function VpcValN(f: number) {
    checkThrow(isFinite(f) && f < 1e18 && f > -1e18, "8v|not a number, or > 1e18");
    let s = f.toString();
    if (scontains(s, "e")) {
        return new VpcVal(f.toFixed(20), restrictConstructorAccess);
    } else {
        return new VpcVal(s, restrictConstructorAccess);
    }
}

export function VpcValBool(b: boolean) {
    return b ? VpcVal.True : VpcVal.False;
}

export class VarCollection extends MapKeyToObjectCanSet<VpcVal> {
    protected length = 0;
    protected readonly limitReason: string;
    constructor(protected readonly limit: number, protected readonly nameOfCollection: string) {
        super();
        this.limitReason = `exceeded max ${nameOfCollection} vars ${limit}`;
    }

    set(key: string, v: VpcVal) {
        if (this.objects[key] === undefined) {
            this.length += 1;
            checkThrow(this.length < this.limit, this.limitReason, "8u|");
        }

        super.set(key, v);
    }

    add(key: string, v: VpcVal) {
        if (this.objects[key] === undefined) {
            this.length += 1;
            checkThrow(this.length < this.limit, this.limitReason, "8t|");
        }

        super.add(key, v);
    }
}

export class VariableCollectionConstants extends VarCollection {
    constructor() {
        super(256, "constants");
        this.add("one", VpcValS("1"));
        this.add("two", VpcValS("2"));
        this.add("three", VpcValS("3"));
        this.add("four", VpcValS("4"));
        this.add("five", VpcValS("5"));
        this.add("six", VpcValS("6"));
        this.add("seven", VpcValS("7"));
        this.add("eight", VpcValS("8"));
        this.add("nine", VpcValS("9"));
        this.add("ten", VpcValS("10"));
        this.add("colon", VpcValS(":"));
        this.add("comma", VpcValS(","));
        this.add("empty", VpcValS(""));
        this.add("true", VpcValS("true"));
        this.add("false", VpcValS("false"));
        this.add("up", VpcValS("up"));
        this.add("down", VpcValS("down"));
        this.add("pi", VpcValS("3.14159265358979323846"));
        this.add("quote", VpcValS('"'));
        this.add("space", VpcValS(" "));
        this.add("tab", VpcValS("\t"));
        this.add("return", VpcValS("\n"));
        this.add("cr", VpcValS("\n"));
        this.add("formfeed", VpcValS("\x0C"));
        this.add("linefeed", VpcValS("\n"));

        // text style
        this.add("plain", VpcValS("plain"));
        this.add("bold", VpcValS("bold"));
        this.add("italic", VpcValS("italic"));
        this.add("underline", VpcValS("underline"));
        this.add("outline", VpcValS("outline"));
        this.add("shadow", VpcValS("shadow"));
        this.add("condense", VpcValS("condense"));
        this.add("extend", VpcValS("extend"));
        // button style
        this.add("transparent", VpcValS("transparent"));
        this.add("rect", VpcValS("rect"));
        this.add("opaque", VpcValS("opaque"));
        this.add("roundrect", VpcValS("roundrect"));
        this.add("standard", VpcValS("standard"));
        this.add("default", VpcValS("default"));
        this.add("osboxmodal", VpcValS("osboxmodal"));
        this.add("checkbox", VpcValS("checkbox"));
        this.add("radio", VpcValS("radio"));
        this.add("rectangle", VpcValS("rectangle"));
        // textalign
        this.add("left", VpcValS("left"));
        this.add("center", VpcValS("center"));
        this.add("right", VpcValS("right"));
        // field style
        this.add("scrolling", VpcValS("scrolling"));

        Util512.freezeRecurse(this);
    }
    set(varname: string, val: VpcVal) {
        throw makeVpcInternalErr("5~|we don't support creating a new constant " + varname);
    }
}

export class VpcEvalHelpers {
    tmp1: [boolean, any] = [false, undefined];
    tmp2: [boolean, any] = [false, undefined];
    typeMatches(v: VpcVal, stype: string): VpcVal {
        let tmp = this.tmp1;
        if (stype === "number") {
            v.isItNumericImpl(tmp);
            return VpcValBool(tmp[0]);
        } else if (stype === "integer") {
            v.isItAStrictIntegerImpl(tmp);
            return VpcValBool(tmp[0]);
        } else if (stype === "logical") {
            v.isItAStrictBooleanImpl(tmp);
            return VpcValBool(tmp[0]);
        } else {
            let numExpected: number;
            if (stype === "point") {
                numExpected = 2;
            } else if (stype === "rect") {
                numExpected = 4;
            } else {
                throw makeVpcScriptErr(
                    `5}|expected "if x is a number" but got "if x is a ${stype}" needs one of {number|integer|point|rect|logical}`
                );
            }

            let pts = v.readAsString().split(",");
            if (numExpected !== pts.length) {
                return VpcVal.False;
            } else {
                return VpcValBool(pts.every(s => VpcValS(s).isItInteger()));
            }
        }
    }

    evalUnary(aIn: any, op: string): VpcVal {
        if (!aIn || !aIn.isVpcVal) {
            throw makeVpcInternalErr(`5||can't compute, not VpcVal. ${aIn} ${op}`);
        }

        let a = aIn as VpcVal;
        if (op === "not") {
            let v = a.readAsStrictBoolean(this.tmp1);
            return VpcValBool(!v);
        } else if (op === "-") {
            let f = a.readAsStrictNumeric(this.tmp1);
            return VpcValN(-f);
        } else if (op === "+") {
            throw makeVpcScriptErr(`5{|syntax error, "+" in the wrong place. we can't evaluate something like 2*(+3)`);
        } else {
            throw makeVpcInternalErr(`9f|unknown unary operation ${op}`);
        }
    }

    evalOp(aIn: any, bIn: any, opclass: VpcOpCtg, op: string): VpcVal {
        if (!aIn || !bIn || !aIn.isVpcVal || !bIn.isVpcVal) {
            throw makeVpcInternalErr(`5_|can't compute, not VpcVal. ${aIn} ${bIn} ${opclass} ${op}`);
        }

        let a = aIn as VpcVal;
        let b = bIn as VpcVal;
        if (opclass === VpcOpCtg.OpLogicalOrAnd) {
            let av = a.readAsStrictBoolean(this.tmp1);
            let bv = b.readAsStrictBoolean(this.tmp2);
            switch (op) {
                case "or":
                    return VpcValBool(av || bv);
                case "and":
                    return VpcValBool(av && bv);
                default:
                    throw makeVpcInternalErr(`5^|unknown operator. ${opclass} ${op}`);
            }
        } else if (opclass === VpcOpCtg.OpEqualityGreaterLessOrContains && op !== "contains") {
            a.isItNumericImpl(this.tmp1);
            b.isItNumericImpl(this.tmp2);
            if (this.tmp1[0] && this.tmp2[0]) {
                // numeric comparison
                let av = this.tmp1[1];
                let bv = this.tmp2[1];
                switch (op) {
                    case ">":
                        return VpcValBool(av > bv);
                    case ">=":
                        return VpcValBool(av >= bv);
                    case "<":
                        return VpcValBool(av < bv);
                    case "<=":
                        return VpcValBool(av <= bv);
                    case "is":
                    // fall-through
                    case "==":
                    // fall-through
                    case "=":
                        // confirmed in emulator -- very close numbers compare equal
                        return VpcValBool(Math.abs(av - bv) < VpcVal.epsilon);
                    case "is not":
                    // fall-through
                    case "<>":
                    // fall-through
                    case "!=":
                        return VpcValBool(Math.abs(av - bv) >= VpcVal.epsilon);
                    default:
                        throw makeVpcInternalErr(`5]|unknown operator. ${opclass} ${op}`);
                }
            } else {
                // string comparison
                let av = a.readAsString();
                let bv = b.readAsString();
                switch (op) {
                    case ">":
                        return VpcValBool(av > bv);
                    case ">=":
                        return VpcValBool(av >= bv);
                    case "<":
                        return VpcValBool(av < bv);
                    case "<=":
                        return VpcValBool(av <= bv);
                    case "is":
                    // fall-through
                    case "==":
                    // fall-through
                    case "=":
                        // string equality, no leniency for whitespace
                        return VpcValBool(av === bv);
                    case "is not":
                    // fall-through
                    case "<>":
                    // fall-through
                    case "!=":
                        return VpcValBool(av !== bv);
                    default:
                        throw makeVpcInternalErr(`5[|unknown operator. ${opclass} ${op}`);
                }
            }
        } else if (opclass === VpcOpCtg.OpStringConcat || opclass === VpcOpCtg.OpStringWithin || op === "contains") {
            let av = a.readAsString();
            let bv = b.readAsString();
            switch (op) {
                case "&&":
                    return VpcValS(av + " " + bv);
                case "&":
                    return VpcValS(av + bv);
                case "contains":
                    return VpcValBool(scontains(av, bv));
                case "is within":
                    return VpcValBool(scontains(bv, av));
                default:
                    throw makeVpcInternalErr(`5@|unknown operator. ${opclass} ${op}`);
            }
        } else if (opclass === VpcOpCtg.OpPlusMinus || opclass === VpcOpCtg.OpMultDivideExpDivMod) {
            let av = a.readAsStrictNumeric(this.tmp1);
            let bv = b.readAsStrictNumeric(this.tmp2);
            switch (op) {
                case "+":
                    return VpcValN(av + bv);
                case "-":
                    return VpcValN(av - bv);
                case "*":
                    return VpcValN(av * bv);
                case "/":
                    return VpcValN(av / bv);
                case "^":
                    return VpcValN(Math.pow(av, bv));
                case "mod":
                    return VpcValN(av % bv);
                case "div":
                    return VpcValN(Math.trunc(av / bv));
                default:
                    throw makeVpcInternalErr(`5?|unknown operator. ${opclass} ${op}`);
            }
        } else {
            throw makeVpcInternalErr(`5>|unknown opclass ${opclass} ${op}`);
        }
    }

    protected numberListFromStrings(fnname: string, sAr: string[]): number[] {
        checkThrow(sAr.length > 0, `8s|Wrong number of arguments given to ${fnname}, need at least 1`);
        return sAr.map(s => {
            if (s.trim().length === 0) {
                return 0.0;
            } else {
                return VpcValS(s).readAsStrictNumeric();
            }
        });
    }

    numberListFromArgsGiven(fnname: string, vAr: VpcVal[], sep: string): number[] {
        checkThrow(vAr.length > 0, `8r|Wrong number of arguments given to ${fnname}, need at least 1`);
        checkThrowEq(1, sep.length, `8q|numberListFromArgsGiven`);
        if (vAr.length === 1 && !vAr[0].isItNumeric()) {
            // following what the emulator seems to do.
            // first, a trailing comma is removed if present.
            let s = vAr[0].readAsString();
            if (s[s.length - 1] === sep) {
                s = s.substr(0, s.length - 1);
            }

            // then, split by comma and treat empty items as zero.
            return this.numberListFromStrings(fnname, s.split(sep));
        } else {
            return this.numberListFromStrings(fnname, vAr.map(v => v.readAsString()));
        }
    }
}

export interface ReadableContainer {
    isDefined(): boolean;
    getRawString(): string;
    len(): number;
}

export interface WritableContainer extends ReadableContainer {
    setAll(newtext: string): void;
    splice(insertion: number, lenToDelete: number, newtext: string): void;
}

export class RequestedChunk extends VpcIntermedValBase {
    isRequestedChunk = true;
    first: number;
    last: O<number>;
    type: RequestedChunkType = RequestedChunkType.Chars;
    ordinal: O<OrdinalOrPosition>;

    constructor(first: number) {
        super();
        this.first = first;
    }

    getClone() {
        let other = new RequestedChunk(this.first);
        other.first = this.first;
        other.last = this.last;
        other.type = this.type;
        other.ordinal = this.ordinal;
        return other;
    }

    confirmValidIndex(v: VpcVal, chunktype: string, tmpArr: [boolean, any]) {
        checkThrow(v && v.isVpcVal, `8p|internal error in RuleHChunk`);
        checkThrow(v.isItInteger(), `8o|when getting ${chunktype}, need to provide an integer but got ${v.readAsString()}`);
        let asInt = v.readAsStrictInteger(tmpArr);
        checkThrow(asInt >= 0, `8n|when getting ${chunktype}, need to provide a number >= 0 but got ${v.readAsString()}`);
        return asInt;
    }
}

export class ChunkResolution {
    protected getPositionsTable(s: string, regex: RegExp, isWords: boolean): number[] {
        let positions: number[] = [];
        if (!isWords || (s[0] !== " " && s[0] !== "\n")) {
            positions.push(0);
        }

        while (true) {
            let match = regex.exec(s);
            if (match) {
                let endofmatch = match.index + match[0].length;
                if (!isWords || endofmatch !== s.length) {
                    positions.push(endofmatch);
                }
            } else {
                break;
            }
        }

        return positions;
    }

    // return semi-inclusive bounds [start, end)
    protected charsBoundsForGet(sInput: string, start: number, end: number): O<[number, number]> {
        if (start >= sInput.length) {
            return undefined;
        } else {
            end = Math.min(end, sInput.length);
            return [start, end];
        }
    }

    protected regexpForDelim(delim: string) {
        checkThrowEq(1, delim.length, "8m|delim should be length 1 but got", delim);
        let escaped = Util512.escapeForRegex(delim);
        return new RegExp(escaped, "g");
    }

    // return semi-inclusive bounds [start, end)
    protected itemsBoundsForGet(sInput: string, delim: string, start: number, end: number): O<[number, number]> {
        let table = this.getPositionsTable(sInput, this.regexpForDelim(delim), false);
        if (start >= table.length) {
            return undefined;
        } else {
            let firstchar = table[start];
            let lastchar = end >= table.length ? sInput.length : table[end] - 1;
            return [firstchar, lastchar];
        }
    }

    // return semi-inclusive bounds [start, end)
    // checked in emulator: only spaces and newlines separate words, not punctuation.
    protected wordsBoundsForGet(sInput: string, start: number, end: number): O<[number, number]> {
        let table = this.getPositionsTable(sInput, new RegExp("(\\n| )+", "g"), true);
        if (start >= table.length) {
            return undefined;
        } else {
            let firstchar = table[start];
            let lastchar = end >= table.length ? sInput.length : table[end] - 1;
            while (lastchar > 0 && (sInput[lastchar - 1] === "\n" || sInput[lastchar - 1] === " ")) {
                lastchar--;
            }

            return [firstchar, lastchar];
        }
    }

    protected charsBoundsForSet(sInput: string, start: number, end: number): any {
        if (start >= sInput.length) {
            return [sInput.length, sInput.length, ""];
        } else {
            end = Math.min(end, sInput.length);
            return [start, end, ""];
        }
    }

    protected itemsBoundsForSet(sInput: string, delim: string, start: number, end: number): any {
        let table = this.getPositionsTable(sInput, this.regexpForDelim(delim), false);
        if (start >= table.length) {
            // add trailing commas!
            let howmanytoadd = 1 + (start - table.length);
            let trailingCommas = Util512.repeat(howmanytoadd, delim).join("");
            return [sInput.length + howmanytoadd, sInput.length + howmanytoadd, trailingCommas];
        } else {
            let firstchar = table[start];
            let lastchar = end >= table.length ? sInput.length : table[end] - 1;
            return [firstchar, lastchar, ""];
        }
    }

    protected wordsBoundsForSet(sInput: string, start: number, end: number): any {
        let boundsGet = this.wordsBoundsForGet(sInput, start, end);
        if (boundsGet === undefined) {
            return [sInput.length, sInput.length, ""];
        } else {
            return [boundsGet[0], boundsGet[1], ""];
        }
    }

    protected getBoundsForGet(s: string, itemDel: string, ch: RequestedChunk): O<[number, number]> {
        let first = ch.first,
            last = ch.last;
        if (ch.ordinal !== undefined) {
            let count = ChunkResolution.applyCount(s, itemDel, ch.type, false);
            first = getPositionFromOrdinalOrPosition(ch.ordinal, 0, 1, count);
            last = first;
        }

        if (ch.type === RequestedChunkType.Chars && last !== undefined && last < first) {
            // checked in emulator, behavior for chars differs here for some reason.
            return undefined;
        }

        assertTrue(first !== null && first !== undefined && last !== null, "5=|invalid first or last");
        last = last === undefined ? first : last;
        last = last < first ? first : last;
        if (first <= 0) {
            return undefined;
        } else if (s.length === 0) {
            return undefined;
        }

        // convert from one-based to zero-based
        let start = first - 1;
        let end = (last -= 1);

        // from inclusive to semiinclusive
        end++;

        // type-specific actions
        if (ch.type === RequestedChunkType.Chars) {
            return this.charsBoundsForGet(s, start, end);
        } else if (ch.type === RequestedChunkType.Items) {
            return this.itemsBoundsForGet(s, itemDel, start, end);
        } else if (ch.type === RequestedChunkType.Lines) {
            return this.itemsBoundsForGet(s, "\n", start, end);
        } else if (ch.type === RequestedChunkType.Words) {
            return this.wordsBoundsForGet(s, start, end);
        } else {
            throw makeVpcScriptErr(`5<|unknown chunk type ${ch.type}`);
        }
    }

    protected getBoundsForSet(sInput: string, itemDel: string, ch: RequestedChunk): [number, number, string] {
        let first = ch.first,
            last = ch.last;
        if (ch.ordinal !== undefined) {
            let count = ChunkResolution.applyCount(sInput, itemDel, ch.type, false);
            first = getPositionFromOrdinalOrPosition(ch.ordinal, 0, 1, count);
            last = first;
        }

        assertTrue(first !== null && first !== undefined && last !== null, "5;|invalid first or last");
        if (ch.type === RequestedChunkType.Chars && last !== undefined && last < first) {
            // checked in emulator, behavior for chars differs here for some reason.
            return [first - 1, first - 1, ""];
        }

        last = last === undefined ? first : last;
        last = last < first ? first : last;
        if (first <= 0) {
            return [0, 0, ""];
        }

        // convert from one-based to zero-based
        let start = first - 1;
        let end = (last -= 1);

        // from inclusive to semiinclusive
        end++;

        // type-specific actions
        if (ch.type === RequestedChunkType.Chars) {
            return this.charsBoundsForSet(sInput, start, end);
        } else if (ch.type === RequestedChunkType.Items) {
            return this.itemsBoundsForSet(sInput, itemDel, start, end);
        } else if (ch.type === RequestedChunkType.Lines) {
            return this.itemsBoundsForSet(sInput, "\n", start, end);
        } else if (ch.type === RequestedChunkType.Words) {
            return this.wordsBoundsForSet(sInput, start, end);
        } else {
            throw makeVpcScriptErr(`5:|unknown chunk type ${ch.type}`);
        }
    }

    static applySort(cont: WritableContainer, itemDel: string, type: RequestedChunkType, sorttype: SortStyle, ascend: boolean) {
        let splitBy: string;
        if (type === RequestedChunkType.Chars) {
            splitBy = "";
        } else if (type === RequestedChunkType.Items) {
            splitBy = itemDel;
        } else if (type === RequestedChunkType.Lines) {
            splitBy = "\n";
        } else {
            throw makeVpcScriptErr(`5/|we don't currently support sorting by ${type}`);
        }

        let split = cont.getRawString().split(splitBy);
        let sorter: (a: string, b: string) => number;
        if (sorttype === SortStyle.numeric) {
            sorter = (a, b) => {
                // don't use a different comparison if both inputs are numbers
                // that would be an inconsistent comparison
                // if there are some strings/some numbers in the array
                let na = parseFloat(a);
                let nb = parseFloat(b);
                na = isFinite(na) ? na : Infinity;
                nb = isFinite(nb) ? nb : Infinity;
                return defaultSort([na, a.toLowerCase()], [nb, b.toLowerCase()]);
            };
        } else if (sorttype === SortStyle.text) {
            sorter = (a, b) => {
                a = a.toLowerCase();
                b = b.toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            };
        } else if (sorttype === SortStyle.international) {
            sorter = (a, b) => {
                return a.localeCompare(b);
            };
        } else {
            throw makeVpcScriptErr(`5.|Don't yet support sorting by style ${sorttype}`);
        }

        split.sort(sorter);
        if (!ascend) {
            split.reverse();
        }

        let result = split.join(splitBy);
        cont.splice(0, cont.len(), result);
    }

    static applyCount(sInput: string, itemDel: string, type: RequestedChunkType, isPublicCall: boolean) {
        let self = new ChunkResolution();
        // in the public interface, change behavior to be closer(still not 100% match) to emulator
        if (isPublicCall && sInput === "" && (type === RequestedChunkType.Items || RequestedChunkType.Lines)) {
            return 0;
        }

        if (type === RequestedChunkType.Chars) {
            return sInput.length;
        } else if (type === RequestedChunkType.Items) {
            return self.getPositionsTable(sInput, self.regexpForDelim(itemDel), false).length;
        } else if (type === RequestedChunkType.Lines) {
            return self.getPositionsTable(sInput, new RegExp("\n", "g"), false).length;
        } else if (type === RequestedChunkType.Words) {
            return self.getPositionsTable(sInput, new RegExp("(\\n| )+", "g"), true).length;
        } else {
            throw makeVpcScriptErr(`5-|unknown chunk type ${type}`);
        }
    }

    static resolveBoundsForGet(s: string, itemDel: string, chunk: RequestedChunk) {
        let me = new ChunkResolution();
        return me.getBoundsForGet(s, itemDel, chunk);
    }

    static applyRead(readContainer: ReadableContainer, chunk: O<RequestedChunk>, itemDel: string): string {
        if (chunk) {
            let s = readContainer.getRawString();
            let me = new ChunkResolution();
            let bounds = me.getBoundsForGet(s, itemDel, chunk);
            if (bounds) {
                return s.substring(bounds[0], bounds[1]);
            } else {
                return "";
            }
        } else {
            return readContainer.getRawString();
        }
    }

    static applyModify(cont: WritableContainer, chunk: O<RequestedChunk>, itemDel: string, fn: (s: string) => string) {
        if (chunk) {
            // confirmed in emulator that modify uses "set" bounds not "get" bounds
            // so "multiply line 300 of x" extends the contents of x if necessary
            let s = cont.getRawString();
            let me = new ChunkResolution();
            let bounds = me.getBoundsForSet(s, itemDel, chunk);
            let sinput = s.substring(bounds[0], bounds[1]);
            let result = bounds[2] + fn(sinput);
            cont.splice(bounds[0], bounds[1] - bounds[0], result);
        } else {
            let s = cont.getRawString();
            let news = fn(s);
            cont.splice(0, cont.len(), news);
        }
    }

    static applyPut(
        cont: WritableContainer,
        chunk: O<RequestedChunk>,
        itemDel: string,
        news: string,
        prep: RequestedChunkTextPreposition
    ): void {
        if (chunk) {
            let s = cont.getRawString();
            let me = new ChunkResolution();
            let bounds = me.getBoundsForSet(s, itemDel, chunk);
            if (prep === RequestedChunkTextPreposition.into || (bounds[2] && bounds[2].length)) {
                // it's a brand new item, adding 'before' or 'after' isn't applicable
                let result = bounds[2] + news;
                cont.splice(bounds[0], bounds[1] - bounds[0], result);
            } else if (prep === RequestedChunkTextPreposition.after) {
                cont.splice(bounds[1], 0, news);
            } else if (prep === RequestedChunkTextPreposition.before) {
                cont.splice(bounds[0], 0, news);
            } else {
                throw makeVpcScriptErr(`5,|unknown preposition ${prep}`);
            }
        } else {
            let result: string;
            if (prep === RequestedChunkTextPreposition.after) {
                let prevs = cont.isDefined() ? cont.getRawString() : "";
                result = prevs + news;
            } else if (prep === RequestedChunkTextPreposition.before) {
                let prevs = cont.isDefined() ? cont.getRawString() : "";
                result = news + prevs;
            } else if (prep === RequestedChunkTextPreposition.into) {
                result = news;
            } else {
                throw makeVpcScriptErr(`5+|unknown preposition ${prep}`);
            }

            cont.setAll(result);
        }
    }
}

export class VpcUI512Serialization {
    static serializeUiGettable(vel: UI512Gettable, attrlist: string[]) {
        let ret: { [key: string]: ElementObserverVal } = {};
        for (let attrname of attrlist) {
            let v = (vel as any)["_" + attrname];
            assertTrueWarn(v !== undefined, attrname);
            if (attrname === UI512Settable.formattedTextField) {
                let vAsText = v as FormattedText;
                assertTrue(vAsText && vAsText.isFormattedText, "invalid ftxt");
                ret[attrname] = vAsText.toPersisted();
            } else {
                ret[attrname] = v;
            }
        }

        return ret;
    }

    static deserializeUiSettable(vel: UI512Settable, attrlist: string[], vals: any) {
        for (let attrname of attrlist) {
            let v = vals[attrname];
            if (v !== null && v !== undefined) {
                if (attrname === UI512Settable.formattedTextField) {
                    assertTrue(v && isString(v), "ftxt not a string");
                    let vAsText = FormattedText.newFromPersisted(v);
                    vel.setftxt(vAsText);
                } else {
                    vel.set(attrname, v);
                }
            } else {
                assertTrueWarn(false, "missing or null attr", attrname);
            }
        }
    }

    static copyAttrsOver(getter: UI512Gettable, setter: UI512Settable, attrlist: string[]) {
        for (let attrname of attrlist) {
            let v = (getter as any)["_" + attrname];
            if (v !== null && v !== undefined) {
                if (attrname === UI512Settable.formattedTextField) {
                    assertTrue(v && isString(v), "ftxt not a string");
                    let vAsText = FormattedText.newFromPersisted(v);
                    setter.setftxt(vAsText);
                } else {
                    setter.set(attrname, v);
                }
            } else {
                assertTrueWarn(false, "missing or null attr", attrname);
            }
        }
    }
}

export class CountNumericId {
    constructor(protected counter = 1000) {}
    next() {
        let ret = this.counter;
        this.counter += 1;
        return ret;
    }

    nextAsStr() {
        return this.next().toString();
    }

    setCounter(n: number) {
        if (n >= this.counter) {
            this.counter = n;
        } else {
            assertTrueWarn(false, "tried to set counter lower", n);
        }
    }
}

