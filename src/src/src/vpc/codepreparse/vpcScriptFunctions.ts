
/* auto */ import { assertTrue, checkThrow, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, checkThrowEq, findEnumToStr } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { Lines } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { PropAdjective, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcVal, VpcValBool, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VpcEvalHelpers } from '../../vpc/vpcutils/vpcValEval.js';
/* auto */ import { RequestedVelRef } from '../../vpc/vpcutils/vpcOutsideClasses.js';
/* auto */ import { OutsideWorldRead, VpcScriptMessage } from '../../vpc/vel/vpcOutsideInterfaces.js';

export class VpcBuiltinFunctions {
    // confirmed in emulator that this is not tied to itemdelimeter.
    // max(1,2,3) and max("1,2,3") have same results, even if itemdel set to .
    protected tmpArr: [boolean, any] = [false, false];
    protected static readonly sep = ',';
    protected static readonly hardcodedMemoryAvailable = 100 * 1024 * 1024;
    protected static readonly hardcodedSysVersion = 7.55;
    protected static readonly time1904 = -2082844800;
    protected static basisTicks = 0;
    protected static count = 0;
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
        max: -1,
        min: -1,
        sum: -1,
    };

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
        tool: 0,
    };

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
        trunc: (f: number) => Math.trunc(f),
    };

    constructor(protected readoutside: OutsideWorldRead) {
        Object.freeze(VpcBuiltinFunctions.simpleFns);
        Object.freeze(VpcBuiltinFunctions.simpleMath);
        Object.freeze(VpcBuiltinFunctions.fnsNeedOutside);
    }

    static isFunction(s: string) {
        return (
            VpcBuiltinFunctions.simpleFns[s] !== undefined ||
            VpcBuiltinFunctions.simpleMath[s] !== undefined ||
            VpcBuiltinFunctions.fnsNeedOutside[s] !== undefined
        );
    }

    call(name: string, args: VpcVal[]): VpcVal {
        let asSimpleMath = VpcBuiltinFunctions.simpleMath[name];
        if (asSimpleMath !== undefined) {
            checkThrowEq(1, args.length, '7%|function requires exactly one arg', name);
            let fin = args[0].readAsStrictNumeric(this.tmpArr);
            let v = asSimpleMath(fin);
            return VpcValN(v);
        }

        let asSimpleFns = VpcBuiltinFunctions.simpleFns[name];
        if (asSimpleFns !== undefined) {
            if (asSimpleFns === -1) {
                checkThrow(args.length > 0, '7$|function requires at least one arg', name);
            } else {
                checkThrowEq(asSimpleFns, args.length, '7#|function recieved incorrect # of args', name, asSimpleFns);
            }

            let ret = Util512.callAsMethodOnClass('VpcBuiltinFunctions', this, 'call_' + name, [args], false);
            assertTrue(ret.isVpcVal, '5m|did not return a vpcval');
            return ret;
        }

        let asfnsNeedOutside = VpcBuiltinFunctions.fnsNeedOutside[name];
        if (asfnsNeedOutside !== undefined) {
            checkThrowEq(
                asfnsNeedOutside,
                args.length,
                '7!|function recieved incorrect # of args',
                name,
                asfnsNeedOutside
            );
            let [frameMsg, frameParams] = this.readoutside.GetFrameInfo();
            let ret = Util512.callAsMethodOnClass(
                'VpcBuiltinFunctions',
                this,
                'call_' + name,
                [args, frameMsg, frameParams],
                false
            );
            assertTrue(ret.isVpcVal, '5l|did not return a vpcval');
            return ret;
        }

        throw makeVpcScriptErr(`5k|no such function ${name}`);
    }

    call_max(args: VpcVal[]) {
        return this.mathVariadic(args, 'max', ar => Math.max.apply(null, ar));
    }

    call_min(args: VpcVal[]) {
        return this.mathVariadic(args, 'min', ar => Math.min.apply(null, ar));
    }

    call_sum(args: VpcVal[]) {
        return this.mathVariadic(args, 'sum', ar => ar.reduce(Util512.add));
    }

    call_diskspace(args: VpcVal[]) {
        return VpcValN(VpcBuiltinFunctions.hardcodedMemoryAvailable);
    }

    call_heapspace(args: VpcVal[]) {
        return VpcValN(VpcBuiltinFunctions.hardcodedMemoryAvailable);
    }

    call_stackspace(args: VpcVal[]) {
        return VpcValN(VpcBuiltinFunctions.hardcodedMemoryAvailable);
    }

    call_systemversion(args: VpcVal[]) {
        return VpcValN(VpcBuiltinFunctions.hardcodedSysVersion);
    }

    call_seconds(args: VpcVal[]) {
        let unixNow = Date.now() / 1000.0;
        return VpcValN(Math.trunc(unixNow - VpcBuiltinFunctions.time1904));
    }

    call_ticks(args: VpcVal[]) {
        if (VpcBuiltinFunctions.basisTicks === 0) {
            VpcBuiltinFunctions.basisTicks = Date.now();
        }

        let msSinceFirstCall = Date.now() - VpcBuiltinFunctions.basisTicks;
        return VpcValN(Math.trunc(msSinceFirstCall * (60 / 1000)));
    }

    call_random(args: VpcVal[]) {
        let f = args[0].readAsStrictNumeric(this.tmpArr);
        let max = Math.trunc(f);
        if (max < 1) {
            throw makeVpcScriptErr(`5j|value must be >= 1 but got ${f}`);
        } else {
            return VpcValN(Util512.getRandIntInclusiveWeak(1, max));
        }
    }

    call_round(args: VpcVal[]) {
        // credit: @warby on jsfiddle
        let f = args[0].readAsStrictNumeric(this.tmpArr);
        if (f % 0.5 === 0) {
            let flr = Math.floor(f);
            return VpcValN(flr % 2 === 0 ? flr : Math.round(f));
        } else {
            return VpcValN(Math.round(f));
        }
    }

    call_screenrect(args: VpcVal[]) {
        return VpcValS(`0,0,${ScreenConsts.screenwidth},${ScreenConsts.screenheight}`);
    }

    call_counting(args: VpcVal[]) {
        // basically every other function here is idempotent
        // provide a non-idempotent function, for testing, to see when it has been called
        VpcBuiltinFunctions.count += 1;
        return VpcValN(VpcBuiltinFunctions.count);
    }

    call_chartonum(args: VpcVal[]) {
        let s = args[0].readAsString();
        return VpcValN(s.length ? s.charCodeAt(0) : 0);
    }

    call_numtochar(args: VpcVal[]) {
        let n = args[0].readAsStrictInteger(this.tmpArr);
        checkThrow(n >= 1, `7 |numToChar must be given a number >= 1`);
        return VpcValS(String.fromCharCode(n));
    }

    call_strtonumber(args: VpcVal[]) {
        return VpcVal.readScientificNotation(args[0].readAsString()) || VpcVal.False;
    }

    call_numbertostr(args: VpcVal[]) {
        return VpcValS(args[0].readAsString());
    }

    call_length(args: VpcVal[]) {
        return VpcValN(args[0].readAsString().length);
    }

    call_offset(args: VpcVal[]) {
        let needle = args[0].readAsString();
        let haystack = args[1].readAsString();
        let index = haystack.indexOf(needle);
        return VpcValN(index === -1 ? 0 : index + 1);
    }

    call_commandkey(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return this.call_cmdkey(args, frmMsg, frmParams);
    }

    call_cmdkey(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.cmdKey === undefined) {
            throw makeVpcScriptErr("not a key event - function can only be called in a handler like 'on afterkeydown'");
        } else {
            return VpcValBool(frmMsg && frmMsg.cmdKey);
        }
    }

    call_optionkey(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.optionKey === undefined) {
            throw makeVpcScriptErr("not a key event - function can only be called in a handler like 'on afterkeydown'");
        } else {
            return VpcValBool(frmMsg && frmMsg.optionKey);
        }
    }

    call_shiftkey(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.shiftKey === undefined) {
            throw makeVpcScriptErr("not a key event - function can only be called in a handler like 'on afterkeydown'");
        } else {
            return VpcValBool(frmMsg && frmMsg.shiftKey);
        }
    }

    call_keychar(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.keychar === undefined) {
            throw makeVpcScriptErr("not a key event - function can only be called in a handler like 'on afterkeydown'");
        } else {
            return VpcValS(frmMsg.keychar);
        }
    }

    call_keyrepeated(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        if (!frmMsg || frmMsg.keyrepeated === undefined) {
            throw makeVpcScriptErr("not a key event - function can only be called in a handler like 'on afterkeydown'");
        } else {
            return VpcValBool(frmMsg && frmMsg.keyrepeated);
        }
    }

    call_clickh(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return frmMsg && frmMsg.clickLoc && frmMsg.clickLoc.length > 1 ? VpcValN(frmMsg.clickLoc[0]) : VpcVal.Empty;
    }

    call_clickv(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return frmMsg && frmMsg.clickLoc && frmMsg.clickLoc.length > 1 ? VpcValN(frmMsg.clickLoc[1]) : VpcVal.Empty;
    }

    call_clickloc(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return frmMsg && frmMsg.clickLoc && frmMsg.clickLoc.length > 1
            ? VpcValS(`${frmMsg.clickLoc[0]},${frmMsg.clickLoc[1]}`)
            : VpcVal.Empty;
    }

    call_mouse(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return frmMsg && frmMsg.mouseIsDown ? VpcValS('down') : VpcValS('up');
    }

    call_mouseclick(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return VpcValBool(frmMsg && !!frmMsg.clickLoc && frmMsg.clickLoc.length > 1);
    }

    call_mouseh(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return VpcValN(frmMsg.mouseLoc[0]);
    }

    call_mousev(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return VpcValN(frmMsg.mouseLoc[1]);
    }

    call_mouseloc(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return VpcValS(`${frmMsg.mouseLoc[0]},${frmMsg.mouseLoc[1]}`);
    }

    call_paramcount(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return VpcValN(frmParams.length);
    }

    call_param(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let n = args[0].readAsStrictInteger(this.tmpArr);
        let ret = frmParams[this.fromOneBased(n)];
        return ret === undefined ? VpcVal.Empty : ret;
    }

    call_params(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let s = frmParams.map(v => v.readAsString()).join(',');
        return VpcValS(s);
    }

    call_result(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        return this.readoutside.ReadVarContents('$result');
    }

    call_selectedfield(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let fld = this.readoutside.GetSelectedField();
        if (fld) {
            let container = this.getFullNameById(fld.id, PropAdjective.abbrev, VpcElType.Fld);
            return VpcValS(container);
        } else {
            return VpcVal.Empty;
        }
    }

    call_selectedchunk(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let fld = this.readoutside.GetSelectedField();
        if (fld) {
            let start = this.toOneBased(fld.get_n('selcaret'));
            let end = this.toOneBased(fld.get_n('selend'));
            let container = this.getFullNameById(fld.id, PropAdjective.abbrev, VpcElType.Fld);
            return VpcValS(`char ${start} to ${end} of ${container}`);
        } else {
            return VpcVal.Empty;
        }
    }

    call_selectedtext(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let fld = this.readoutside.GetSelectedField();
        if (fld) {
            let start = fld.get_n('selcaret');
            let end = fld.get_n('selend');
            let s = fld.get_ftxt().toUnformattedSubstr(start, end - start);
            return VpcValS(s);
        } else {
            return VpcVal.Empty;
        }
    }

    call_selectedline(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let fld = this.readoutside.GetSelectedField();
        if (fld) {
            let start = fld.get_n('selcaret');
            let lines = new Lines(fld.get_ftxt());
            return VpcValN(lines.indexToLineNumber(start));
        } else {
            return VpcVal.Empty;
        }
    }

    call_tool(args: VpcVal[], frmMsg: VpcScriptMessage, frmParams: VpcVal[]) {
        let nTool = this.readoutside.GetCurrentTool(false);
        let s = findEnumToStr<VpcTool>(VpcTool, nTool);
        return VpcValS(s ? s : '');
    }

    protected getFullNameById(id: string, adjective: PropAdjective, type: VpcElType) {
        let ref = new RequestedVelRef(type);
        let idn = VpcValS(id).readAsStrictInteger(this.tmpArr);
        ref.lookById = idn;
        let fullname = this.readoutside.GetProp(ref, 'name', adjective, undefined);
        return fullname.readAsString();
    }

    protected toOneBased(n: number) {
        // here, unfortunately arrays start at 1 instead of 0.
        return n + 1;
    }

    protected fromOneBased(n: number) {
        // here, unfortunately arrays start at 1 instead of 0.
        return n - 1;
    }

    protected mathVariadic(args: VpcVal[], name: string, fn: (ar: number[]) => number): VpcVal {
        let h = new VpcEvalHelpers();
        let numlist = h.numberListFromArgsGiven(name, args, VpcBuiltinFunctions.sep);
        return VpcValN(fn(numlist));
    }
}
