
/* auto */ import { VpcEvalHelpers } from './../vpcutils/vpcValEval';
/* auto */ import { VpcVal, VpcValBool, VpcValN, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { VpcScriptMessage } from './../vpcutils/vpcUtils';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { PropAdjective, VpcElType, VpcTool } from './../vpcutils/vpcEnums';
/* auto */ import { OutsideWorldRead } from './../vel/velOutsideInterfaces';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { assertTrue, checkThrow, makeVpcScriptErr } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, checkThrowEq, findEnumToStr, longstr } from './../../ui512/utils/util512';
/* auto */ import { UI512Lines } from './../../ui512/textedit/ui512TextLines';

/**
 * built-in functions
 */
export class VpcBuiltinFunctions {
    protected tmpArr: [boolean, any] = [false, false];
    protected static readonly sep = ',';
    protected static readonly hardcodedMemoryAvailable = 100 * 1024 * 1024;
    protected static readonly hardcodedSysVersion = 7.55;
    protected static readonly time1904 = -2082844800;
    protected static basisTicks = 0;
    protected static count = 0;
    protected static indicateVarArgs = -1;
    constructor(protected readoutside: OutsideWorldRead) {
        Object.freeze(VpcBuiltinFunctions.simpleFns);
        Object.freeze(VpcBuiltinFunctions.simpleMath);
        Object.freeze(VpcBuiltinFunctions.fnsNeedOutside);
    }

    /**
     * define the # of parameters for "simpleFns"
     * a "simpleFn" takes a VpcVal[] and returns a VpcVal
     */
    protected static simpleFns: { [key: string]: number } = {
        diskspace: 0,
        heapspace: 0,
        stackspace: 0,
        systemversion: 0,
        seconds: 0,
        ticks: 0,
        random: 1,
        round: 1,
        screenrect: 0,
        counting: 0,
        chartonum: 1,
        numtochar: 1,
        strtonumber: 1,
        numbertostr: 1,
        length: 1,
        offset: 2,
        max: VpcBuiltinFunctions.indicateVarArgs,
        min: VpcBuiltinFunctions.indicateVarArgs,
        sum: VpcBuiltinFunctions.indicateVarArgs
    };

    /**
     * define the # of parameters for "fnsNeedOutside"
     * a "fnsNeedOutside" takes a VpcScriptMessage
     */
    protected static fnsNeedOutside: { [key: string]: number } = {
        cmdkey: 0,
        commandkey: 0,
        optionkey: 0,
        shiftkey: 0,
        keyrepeated: 0,
        keychar: 0,
        clickh: 0,
        clickloc: 0,
        clickv: 0,
        mouse: 0,
        mouseclick: 0,
        mouseh: 0,
        mouseloc: 0,
        mousev: 0,
        param: 1,
        paramcount: 0,
        params: 0,
        result: 0,
        selectedchunk: 0,
        selectedfield: 0,
        selectedline: 0,
        selectedtext: 0,
        tool: 0
    };

    /**
     * define the # of parameters for a "simpleMath"
     * a simplemath returns a number which we'll call a VpcValN on
     */
    protected static simpleMath: { [key: string]: Function } = {
        abs: (f: number) => Math.abs(f),
        atan: (f: number) => Math.atan(f),
        sin: (f: number) => Math.sin(f),
        cos: (f: number) => Math.cos(f),
        tan: (f: number) => Math.tan(f),
        ln: (f: number) => Math.log(f),
        ln1: (f: number) => Math.log(f + 1),
        log2: (f: number) => Math.log(f) / Math.log(2),
        exp: (f: number) => Math.exp(f),
        exp1: (f: number) => Math.exp(f) - 1,
        exp2: (f: number) => Math.pow(2, f),
        sqrt: (f: number) => Math.sqrt(f),
        trunc: (f: number) => Math.trunc(f)
    };

    /**
     * is this the name of a function
     */
    static isFunction(s: string) {
        return (
            VpcBuiltinFunctions.simpleFns[s] !== undefined ||
            VpcBuiltinFunctions.simpleMath[s] !== undefined ||
            VpcBuiltinFunctions.fnsNeedOutside[s] !== undefined
        );
    }

    /**
     * call the function, return result as a VpcVal
     */
    call(name: string, args: VpcVal[]): VpcVal {
        let asSimpleMath = VpcBuiltinFunctions.simpleMath[name];
        if (asSimpleMath !== undefined) {
            /* it's a "simple math" one */
            checkThrowEq(1, args.length, '7%|function requires exactly one arg', name);
            let fin = args[0].readAsStrictNumeric(this.tmpArr);
            let v = asSimpleMath(fin);
            return VpcValN(v);
        }

        let asSimpleFns = VpcBuiltinFunctions.simpleFns[name];
        if (asSimpleFns !== undefined) {
            /* it's a "simpleFns" one */
            if (asSimpleFns === VpcBuiltinFunctions.indicateVarArgs) {
                checkThrow(
                    args.length > 0,
                    '7$|function requires at least one arg',
                    name
                );
            } else {
                checkThrowEq(
                    asSimpleFns,
                    args.length,
                    '7#|function recieved incorrect # of args',
                    name,
                    asSimpleFns
                );
            }

            let method = 'call' + Util512.capitalizeFirst(name);
            let ret = Util512.callAsMethodOnClass(
                'VpcBuiltinFunctions',
                this,
                method,
                [args],
                false
            );
            assertTrue(ret.isVpcVal, '5m|did not return a vpcval');
            return ret;
        }

        let asfnsNeedOutside = VpcBuiltinFunctions.fnsNeedOutside[name];
        if (asfnsNeedOutside !== undefined) {
            /* it's a "needs outside" one */
            checkThrowEq(
                asfnsNeedOutside,
                args.length,
                '7!|function recieved incorrect # of args',
                name,
                asfnsNeedOutside
            );

            let [frameMsg, frameParams] = this.readoutside.GetFrameInfo();
            let method = 'call' + Util512.capitalizeFirst(name);
            let ret = Util512.callAsMethodOnClass(
                'VpcBuiltinFunctions',
                this,
                method,
                [args, frameMsg, frameParams],
                false
            );

            assertTrue(ret.isVpcVal, '5l|did not return a vpcval');
            return ret;
        }

        throw makeVpcScriptErr(`5k|no such function ${name}`);
    }

    /**
     * returns the largest of all arguments given
     */
    callMax(args: VpcVal[]) {
        /* eslint-disable-next-line ban/ban */
        return this.mathVariadic(args, 'max', ar => Math.max.apply(null, ar));
    }

    /**
     * returns the smallest of all arguments given
     */
    callMin(args: VpcVal[]) {
        /* eslint-disable-next-line ban/ban */
        return this.mathVariadic(args, 'min', ar => Math.min.apply(null, ar));
    }

    /**
     * returns the sum of all arguments given
     */
    callSum(args: VpcVal[]) {
        return this.mathVariadic(args, 'sum', ar => ar.reduce(Util512.add));
    }

    /**
     * disk space (Deprecated and hard-coded)
     */
    callDiskspace(args: VpcVal[]) {
        return VpcValN(VpcBuiltinFunctions.hardcodedMemoryAvailable);
    }

    /**
     * heap space (Deprecated and hard-coded)
     */
    callHeapspace(args: VpcVal[]) {
        return VpcValN(VpcBuiltinFunctions.hardcodedMemoryAvailable);
    }

    /**
     * stack space (Deprecated and hard-coded)
     */
    callStackspace(args: VpcVal[]) {
        return VpcValN(VpcBuiltinFunctions.hardcodedMemoryAvailable);
    }

    /**
     * system version (Deprecated and hard-coded)
     */
    callSystemversion(args: VpcVal[]) {
        return VpcValN(VpcBuiltinFunctions.hardcodedSysVersion);
    }

    /**
     * Seconds since January 1, 1904.
     */
    callSeconds(args: VpcVal[]) {
        let unixNow = Date.now() / 1000.0;
        return VpcValN(Math.trunc(unixNow - VpcBuiltinFunctions.time1904));
    }

    /**
     * Ticks (60th of a second) since January 1, 1904.
     */
    callTicks(args: VpcVal[]) {
        if (VpcBuiltinFunctions.basisTicks === 0) {
            VpcBuiltinFunctions.basisTicks = Date.now();
        }

        let msSinceFirstCall = Date.now() - VpcBuiltinFunctions.basisTicks;
        return VpcValN(Math.trunc(msSinceFirstCall * (60 / 1000)));
    }

    /**
     * n must be an integer.
     * Returns random value between 1 and n.
     */
    callRandom(args: VpcVal[]) {
        let f = args[0].readAsStrictNumeric(this.tmpArr);
        let max = Math.trunc(f);
        if (max < 1) {
            throw makeVpcScriptErr(`5j|value must be >= 1 but got ${f}`);
        } else {
            return VpcValN(Util512Higher.getRandIntInclusiveWeak(1, max));
        }
    }

    /**
     * Returns integer nearest to number. Odd integers plus 0.5
     * round up, even integers plus 0.5 round down.
     */
    callRound(args: VpcVal[]) {
        /* credit: @warby on jsfiddle */
        let f = args[0].readAsStrictNumeric(this.tmpArr);
        if (f % 0.5 === 0) {
            let flr = Math.floor(f);
            return VpcValN(flr % 2 === 0 ? flr : Math.round(f));
        } else {
            return VpcValN(Math.round(f));
        }
    }

    /**
     * screen dimensions
     */
    callScreenrect(args: VpcVal[]) {
        return VpcValS(`0,0,${ScreenConsts.ScreenWidth},${ScreenConsts.ScreenHeight}`);
    }

    /**
     * get an incrementing counter
     *
     * every other function here is basically idempotent,
     * this is intentionally a non-idempotent function, for testing, to detect if it has been called
     */
    callCounting(args: VpcVal[]) {
        VpcBuiltinFunctions.count += 1;
        return VpcValN(VpcBuiltinFunctions.count);
    }

    /**
     * From ascii-like number to a character.
     * Note that characters in a field are displayed in Mac OS Roman
     * encoding.
     */
    callChartonum(args: VpcVal[]) {
        let s = args[0].readAsString();
        return VpcValN(s.length ? s.charCodeAt(0) : 0);
    }

    /**
     * From a character to an ascii-like number.
     * Note that characters in a field are displayed in Mac OS Roman
     * encoding.
     */
    callNumtochar(args: VpcVal[]) {
        let n = args[0].readAsStrictInteger(this.tmpArr);
        checkThrow(n >= 1, `7 |numToChar must be given a number >= 1`);
        return VpcValS(String.fromCharCode(n));
    }

    /**
     * Parse string to number.
     * Supports scientific notation.
     * If cannot be parsed, returns "false"
     */
    callStrtonumber(args: VpcVal[]) {
        return VpcVal.readScientificNotation(args[0].readAsString()) ?? VpcVal.False;
    }

    /**
     * Convert number to string.
     */
    callNumbertostr(args: VpcVal[]) {
        return VpcValS(args[0].readAsString());
    }

    /**
     * Returns the length of a string, in characters.
     */
    callLength(args: VpcVal[]) {
        return VpcValN(args[0].readAsString().length);
    }

    /**
     * Search for a string within a string, and return the position where found.
     * If not found, returns 0.
     * (one-based indexing).
     */
    callOffset(args: VpcVal[]) {
        let needle = args[0].readAsString();
        let haystack = args[1].readAsString();
        let index = haystack.indexOf(needle);
        return VpcValN(index === -1 ? 0 : index + 1);
    }

    /**
     * In an afterkeydown or afterkeyup handler, check if this modifier
        key is pressed.
     */
    callCommandkey(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return this.callCmdkey(args, frmMsg, frmParams);
    }

    /**
     * In an afterkeydown or afterkeyup handler, check if this modifier
        key is pressed.
     */
    callCmdkey(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.cmdKey === undefined) {
            throw makeVpcScriptErr(
                longstr(`Ja|not a key event - function can only be
                    called in a handler like 'on afterkeydown'`)
            );
        } else {
            return VpcValBool(frmMsg && frmMsg.cmdKey);
        }
    }

    /**
     * In an afterkeydown or afterkeyup handler, check if this modifier
        key is pressed.
     */
    callOptionkey(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.optionKey === undefined) {
            throw makeVpcScriptErr(
                longstr(`JZ|not a key event - function can only be called
                    in a handler like 'on afterkeydown'`)
            );
        } else {
            return VpcValBool(frmMsg && frmMsg.optionKey);
        }
    }

    /**
     * In an afterkeydown or afterkeyup handler, check if this modifier
        key is pressed.
     */
    callShiftkey(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.shiftKey === undefined) {
            throw makeVpcScriptErr(
                longstr(`JY|not a key event - function can only be called
                    in a handler like 'on afterkeydown'`)
            );
        } else {
            return VpcValBool(frmMsg && frmMsg.shiftKey);
        }
    }

    /**
     * In an afterkeydown or afterkeyup handler, check the character.
        Is affected by shift.
     */
    callKeychar(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.keyChar === undefined) {
            throw makeVpcScriptErr(
                longstr(`JX|not a key event - function can only be called
                    in a handler like 'on afterkeydown'`)
            );
        } else {
            return VpcValS(frmMsg.keyChar);
        }
    }

    /**
     * In an afterkeydown handler, did this event come from the user holding the key down?
     */
    callKeyrepeated(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.keyRepeated === undefined) {
            throw makeVpcScriptErr(
                longstr(`JW|not a key event - function can only be called
                    in a handler like 'on afterkeydown'`)
            );
        } else {
            return VpcValBool(frmMsg && frmMsg.keyRepeated);
        }
    }

    /**
     * In a mousedown or mouseup handler, get click x coordinate.
     */
    callClickh(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return frmMsg && frmMsg.clickLoc && frmMsg.clickLoc.length > 1
            ? VpcValN(frmMsg.clickLoc[0])
            : VpcVal.Empty;
    }

    /**
     * In a mousedown or mouseup handler, get click y coordinate.
     */
    callClickv(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return frmMsg && frmMsg.clickLoc && frmMsg.clickLoc.length > 1
            ? VpcValN(frmMsg.clickLoc[1])
            : VpcVal.Empty;
    }

    /**
     * In a mousedown or mouseup handler, get click x,y coordinates.
     */
    callClickloc(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return frmMsg && frmMsg.clickLoc && frmMsg.clickLoc.length > 1
            ? VpcValS(`${frmMsg.clickLoc[0]},${frmMsg.clickLoc[1]}`)
            : VpcVal.Empty;
    }

    /**
     * Is the mouse button currently down.
     */
    callMouse(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return frmMsg && frmMsg.mouseIsDown ? VpcValS('down') : VpcValS('up');
    }

    /**
     * Are we currently handling a mousedown or mouseup event.
     */
    callMouseclick(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return VpcValBool(frmMsg && frmMsg.clickLoc && frmMsg.clickLoc.length > 1);
    }

    /**
     * The x coordinate of mouse location.
     */
    callMouseh(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return VpcValN(frmMsg.mouseLoc[0]);
    }

    /**
     * The y coordinate of mouse location.
     */
    callMousev(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return VpcValN(frmMsg.mouseLoc[1]);
    }

    /**
     * The coordinates of mouse location.
     */
    callMouseloc(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return VpcValS(`${frmMsg.mouseLoc[0]},${frmMsg.mouseLoc[1]}`);
    }

    /**
     * Get the number of values passed into the current procedure.
    Can be used to build a function that takes any number of arguments
     */
    callParamcount(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return VpcValN(frmParams.length);
    }

    /**
     * Get the nth value passed into the current procedure. Can be used
    to build a function that takes any number of arguments
     */
    callParam(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let n = args[0].readAsStrictInteger(this.tmpArr);
        let ret = frmParams[this.fromOneBased(n)];
        return ret === undefined ? VpcVal.Empty : ret;
    }

    /**
     * Get all of the values passed into the current procedure.
     */
    callParams(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let s = frmParams.map(v => v.readAsString()).join(',');
        return VpcValS(s);
    }

    /**
     * The return value of the last called function or procedure.
     */
    callResult(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return this.readoutside.ReadVarContents('$result');
    }

    /**
     * The field that contains current selected text, looks something
        like 'cd fld id 1234'.
     */
    callSelectedfield(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let fld = this.readoutside.GetSelectedField();
        if (fld) {
            let container = this.getFullNameById(
                fld.id,
                PropAdjective.Abbrev,
                VpcElType.Fld
            );
            return VpcValS(container);
        } else {
            return VpcVal.Empty;
        }
    }

    /**
     * Current selection, looks something like 'char 2 to 4 of cd fld id
        1234'.
     */
    callSelectedchunk(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let fld = this.readoutside.GetSelectedField();
        if (fld) {
            let start = this.toOneBased(fld.getN('selcaret'));
            let end = this.toOneBased(fld.getN('selend'));
            let container = this.getFullNameById(
                fld.id,
                PropAdjective.Abbrev,
                VpcElType.Fld
            );
            return VpcValS(`char ${start} to ${end} of ${container}`);
        } else {
            return VpcVal.Empty;
        }
    }

    /**
     * The value of the current selected text.
     */
    callSelectedtext(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let fld = this.readoutside.GetSelectedField();
        if (fld) {
            let start = fld.getN('selcaret');
            let end = fld.getN('selend');
            let s = fld
                .getCardFmTxt(this.readoutside.GetCurrentCardId())
                .toUnformattedSubstr(start, end - start);
            return VpcValS(s);
        } else {
            return VpcVal.Empty;
        }
    }

    /**
     * The number of the line of the current selected text.
     */
    callSelectedline(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let fld = this.readoutside.GetSelectedField();
        if (fld) {
            let start = fld.getN('selcaret');
            let lines = new UI512Lines(
                fld.getCardFmTxt(this.readoutside.GetCurrentCardId())
            );
            return VpcValN(lines.indexToLineNumber(start));
        } else {
            return VpcVal.Empty;
        }
    }

    /**
     * The tool to be used when programmatically drawing shapes.
        (Not the actual tool, which would always be Browse)
     */
    callTool(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let nTool = this.readoutside.GetCurrentTool(false);
        let s = findEnumToStr(VpcTool, nTool);
        return VpcValS(s ? s.toLowerCase() : '');
    }

    /**
     * get the full name of a vel
     */
    protected getFullNameById(id: string, adjective: PropAdjective, type: VpcElType) {
        let ref = new RequestedVelRef(type);
        let idn = VpcValS(id).readAsStrictInteger(this.tmpArr);
        ref.lookById = idn;
        let fullname = this.readoutside.GetProp(ref, 'name', adjective, undefined);
        return fullname.readAsString();
    }

    /**
     * in the script, lists are all 1 based, but it's easier to work with 0-based indexes,
     * so convert them here
     */
    protected toOneBased(n: number) {
        /* here, unfortunately arrays start at 1 instead of 0. */
        return n + 1;
    }

    /**
     * in the script, lists are all 1 based, but it's easier to work with 0-based indexes,
     * so convert them here
     */
    protected fromOneBased(n: number) {
        return n - 1;
    }

    /**
     * variadic functions can take either sum(1,2,3) or sum("1,2,3")
     */
    protected mathVariadic(
        args: VpcVal[],
        name: string,
        fn: (ar: number[]) => number
    ): VpcVal {
        let h = new VpcEvalHelpers();
        let numlist = h.numberListFromArgsGiven(name, args, VpcBuiltinFunctions.sep);
        return VpcValN(fn(numlist));
    }
}
