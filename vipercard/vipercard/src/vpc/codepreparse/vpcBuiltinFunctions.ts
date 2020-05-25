
/* auto */ import { VpcEvalHelpers } from './../vpcutils/vpcValEval';
/* auto */ import { VpcVal, VpcValBool, VpcValN, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { VpcScriptMessage } from './../vpcutils/vpcUtils';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { PropAdjective, VpcElType, VpcTool, checkThrow, checkThrowEq, OrdinalOrPosition } from './../vpcutils/vpcEnums';
/* auto */ import { OutsideWorldRead } from './../vel/velOutsideInterfaces';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, ValHolder, findEnumToStr, longstr } from './../../ui512/utils/util512';
/* auto */ import { UI512Lines } from './../../ui512/textedit/ui512TextLines';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
        tick: 0,
        ticks: 0,
        random: 1,
        round: 1,
        screenrect: 0,
        counting: 0,
        chartonum: 1,
        numtochar: 1,
        strtonumber: 1,
        numbertostr: 1,
        touppercase: 1,
        tolowercase: 1,
        length: 1,
        offset: 2,
        annuity: 2,
        compound: 2,
        max: VpcBuiltinFunctions.indicateVarArgs,
        min: VpcBuiltinFunctions.indicateVarArgs,
        sum: VpcBuiltinFunctions.indicateVarArgs,
        average: VpcBuiltinFunctions.indicateVarArgs
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
        objectbyid: 1,
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
    protected static simpleMath: { [key: string]: (f: number) => number } = {
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
                checkThrow(args.length > 0, '7$|function requires at least one arg', name);
            } else {
                checkThrowEq(asSimpleFns, args.length, '7#|function recieved incorrect # of args', name, asSimpleFns);
            }

            let method = 'call' + Util512.capitalizeFirst(name);
            let ret = Util512.callAsMethodOnClass(VpcBuiltinFunctions.name, this, method, [args], false);
            assertTrue(ret instanceof VpcVal, '5m|did not return a vpcval');
            return ret;
        }

        let asfnsNeedOutside = VpcBuiltinFunctions.fnsNeedOutside[name];
        if (asfnsNeedOutside !== undefined) {
            /* it's a "needs outside" one */
            checkThrowEq(asfnsNeedOutside, args.length, '7!|function recieved incorrect # of args', name, asfnsNeedOutside);

            let [frameMsg, frameParams] = this.readoutside.GetFrameInfo();
            let method = 'call' + Util512.capitalizeFirst(name);
            let ret = Util512.callAsMethodOnClass(
                VpcBuiltinFunctions.name,
                this,
                method,
                [args, frameMsg, frameParams],
                false
            )

            assertTrue(ret instanceof VpcVal, '5l|did not return a vpcval');
            return ret;
        }

        checkThrow(false, `5k|no such function ${name}`);
    }

    /**
     * returns the largest of all arguments given
     */
    callMax(args: VpcVal[]) {
        let f = (ar: number[]) => {
            assertTrue(ar.length < 100, 'SJ|too many args');
            return Math.max.apply(null, ar); /* warn-apply-ok */
        };

        return this.mathVariadic(args, 'max', f);
    }

    /**
     * returns the smallest of all arguments given
     */
    callMin(args: VpcVal[]) {
        let f = (ar: number[]) => {
            assertTrue(ar.length < 100, 'SI|too many args');
            return Math.min.apply(null, ar); /* warn-apply-ok */
        };

        return this.mathVariadic(args, 'min', f);
    }

    /**
     * returns the sum of all arguments given
     */
    callSum(args: VpcVal[]) {
        return this.mathVariadic(args, 'sum', ar => ar.reduce(Util512.add));
    }

    /**
     * returns the average of all arguments given
     */
    callAverage(args: VpcVal[]) {
        return this.mathVariadic(args, 'sum', ar => ar.reduce(Util512.add) / ar.length);
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
     * synonym
     */
    callTick(args: VpcVal[]) {
        return this.callTicks(args);
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
            checkThrow(false, `5j|value must be >= 1 but got ${f}`);
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
     * Convert to uppercase
     */
    callTouppercase(args: VpcVal[]) {
        return VpcValS(args[0].readAsString().toUpperCase());
    }

    /**
     * Convert to lowercase
     */
    callTolowercase(args: VpcVal[]) {
        return VpcValS(args[0].readAsString().toLowerCase());
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
     * Calculates interest rate annuity.
     */
    callAnnuity(args: VpcVal[]) {
        let rate = args[0].readAsStrictNumeric();
        let periods = args[1].readAsStrictNumeric();
        let ret = (1 - Math.pow(1 + rate, -periods)) / rate;
        return VpcValN(ret);
    }

    /**
     * Calculates compound interest rate.
     */
    callCompound(args: VpcVal[]) {
        let rate = args[0].readAsStrictNumeric();
        let periods = args[1].readAsStrictNumeric();
        let ret = Math.pow(1 + rate, periods);
        return VpcValN(ret);
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
        let buttons = new ValHolder([false])
        let mods = new ValHolder(ModifierKeys.None)
        this.readoutside.GetMouseAndKeyState([0,0], [0,0,0], buttons, mods)
        return VpcValS((mods.val & ModifierKeys.Cmd)!==0 ? 'down' : 'up')
    }

    /**
     * In an afterkeydown or afterkeyup handler, check if this modifier
        key is pressed.
     */
    callOptionkey(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let buttons = new ValHolder([false])
        let mods = new ValHolder(ModifierKeys.None)
        this.readoutside.GetMouseAndKeyState([0,0], [0,0,0], buttons, mods)
        return VpcValS((mods.val & ModifierKeys.Opt)!==0 ? 'down' : 'up')
    }

    /**
     * In an afterkeydown or afterkeyup handler, check if this modifier
        key is pressed.
     */
    callShiftkey(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let buttons = new ValHolder([false])
        let mods = new ValHolder(ModifierKeys.None)
        this.readoutside.GetMouseAndKeyState([0,0], [0,0,0], buttons, mods)
        return VpcValS((mods.val & ModifierKeys.Shift)!==0 ? 'down' : 'up')
    }

    /**
     * In an afterkeydown or afterkeyup handler, check the character.
        Is affected by shift.
     */
    callKeychar(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.keyChar === undefined) {
            checkThrow(
                false,
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
            checkThrow(
                false,
                longstr(`JW|not a key event - function can only be called
                    in a handler like 'on afterkeydown'`)
            );
        } else {
            return VpcValBool(frmMsg && frmMsg.keyRepeated);
        }
    }

    /**
     * Get click x coordinate.
     */
    callClickh(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return frmMsg && frmMsg.clickLoc && frmMsg.clickLoc.length > 1 ? VpcValN(frmMsg.clickLoc[0]) : VpcVal.Empty;
    }

    /**
     * Get click y coordinate.
     */
    callClickv(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return frmMsg && frmMsg.clickLoc && frmMsg.clickLoc.length > 1 ? VpcValN(frmMsg.clickLoc[1]) : VpcVal.Empty;
    }

    /**
     * Get click x,y coordinates.
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
        let buttons = new ValHolder([false])
        let mods = new ValHolder(ModifierKeys.None)
        this.readoutside.GetMouseAndKeyState([0,0], [0,0,0], buttons, mods)
        let isDown = buttons.val && buttons.val[0]
        return VpcValS(isDown ? 'down' : 'up')
    }

    /**
     * Was the mouse clicked?
     */
    callMouseclick(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let clicked:[number, number, number] = [0,0,0]
        let buttons = new ValHolder([false])
        let mods = new ValHolder(ModifierKeys.None)
        this.readoutside.GetMouseAndKeyState([0,0], clicked, buttons, mods)
        let ret = false
        if (clicked[2] !== frmMsg.lastSeenClickId) {
            ret = true
            frmMsg.clickLoc[0] = clicked[0]
            frmMsg.clickLoc[1] = clicked[1]    
            /* reset the mouseclick so subsequent calls return false */
            frmMsg.lastSeenClickId = clicked[2]
        }

        return VpcValBool(ret);
    }

    /**
     * The x coordinate of mouse location.
     */
    callMouseh(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let mouseCoords:[number, number] = [0,0]
        let buttons = new ValHolder([false])
        let mods = new ValHolder(ModifierKeys.None)
        this.readoutside.GetMouseAndKeyState(mouseCoords, [0,0,0], buttons, mods)
        return VpcValN(mouseCoords[0]);
    }

    /**
     * The y coordinate of mouse location.
     */
    callMousev(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let mouseCoords:[number, number] = [0,0]
        let buttons = new ValHolder([false])
        let mods = new ValHolder(ModifierKeys.None)
        this.readoutside.GetMouseAndKeyState(mouseCoords, [0,0,0], buttons, mods)
        return VpcValN(mouseCoords[1]);
    }

    /**
     * The coordinates of mouse location.
     */
    callMouseloc(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let h = this.callMouseh(args, frmMsg, frmParams)
        let v = this.callMousev(args, frmMsg, frmParams)
        return VpcValS(`${h.readAsString()},${v.readAsString()}`);
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
        let fld = this.readoutside.FindSelectedTextBounds()[0];
        if (fld) {
            let container = this.renderVelName(fld.idInternal);
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
        let fld = this.readoutside.FindSelectedTextBounds()[0];
        if (fld) {
            let start = this.toOneBased(fld.getN('selcaret'));
            let end = this.toOneBased(fld.getN('selend'));
            let container = this.renderVelName(fld.idInternal);
            return VpcValS(`char ${start} to ${end} of ${container}`);
        } else {
            return VpcVal.Empty;
        }
    }

    /**
     * The value of the current selected text.
     */
    callSelectedtext(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let ref = new RequestedContainerRef()
        ref.isJustSelection = true
        let resolved = this.readoutside.ResolveContainerReadable(ref)
        return VpcValS(resolved.getRawString())
    }

    /**
     * are we in compatibility mode
     */
    protected getCompatMode() {
        let ref = new RequestedVelRef(VpcElType.Stack)
        ref.lookByRelative = OrdinalOrPosition.This
        let read = this.readoutside.GetProp(ref, 'compatibilitymode', PropAdjective.Empty, undefined)
        return read.readAsStrictBoolean()
    }

    /**
     * The number of the line of the current selected text.
     * Note: disregards the end of the selection.
     */
    callSelectedline(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let selInfo = this.readoutside.FindSelectedTextBounds();
        if (selInfo && selInfo[0]) {
            let start = selInfo[1];
            let lines = new UI512Lines(selInfo[0].getFmTxt());
            let whichLine = this.toOneBased(lines.indexToLineNumber(start))
            if (this.getCompatMode()) {
                let s = `line ${whichLine} of ${this.renderVelName(selInfo[0].idInternal)}`
                return VpcValS(s)
            } else {
                return VpcValN(whichLine)
            }
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
     * what is the long id of this object, by id? return empty if object not found
     * supports both internalId and userfacingId
     */
    callObjectbyid(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let ref = new RequestedVelRef(VpcElType.Unknown);
        ref.lookById = args[0].readAsStrictInteger()
        ref.partIsCdOrBg = true
        let s = this.readoutside.ElementExists(ref)
        return VpcValS(s ?? '');
    }

    /**
     * get the name of a vel as a string.
     * if compat mode, "card field 3" (confirmed in emulator)
     * if non-compat mode, "card field id 234"
     */
    protected renderVelName(idInternal: string):string {
        let ref = new RequestedVelRef(VpcElType.Unknown);
        ref.partIsCdOrBg = true
        ref.lookById = Util512.parseInt(idInternal)
        checkThrow(ref.lookById, "id not a number")
        let sInfo = this.readoutside.ElementExists(ref)
        checkThrow(sInfo, "not found")
        if (this.getCompatMode()) {
            let words = sInfo.split(' ')
            let objType = words[0]
            if (words[1] === 'button' || words[1] === 'field') {
                objType += ' ' + words[1]
            }
            
            let objNumber = this.readoutside.GetProp(ref, 'number', PropAdjective.Long, undefined)
            return `${objType} ${objNumber.readAsString()}`
        } else {
            return sInfo
        }
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
    protected mathVariadic(args: VpcVal[], name: string, fn: (ar: number[]) => number): VpcVal {
        let h = new VpcEvalHelpers();
        let numlist = h.numberListFromArgsGiven(name, args, VpcBuiltinFunctions.sep);
        return VpcValN(fn(numlist));
    }
}
