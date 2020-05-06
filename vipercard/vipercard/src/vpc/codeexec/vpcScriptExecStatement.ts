
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValBool, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { ChvITk, tkstr } from './../codeparse/vpcTokens';
/* auto */ import { VpcScriptExecuteStatementHelpers } from './vpcScriptExecStatementHelpers';
/* auto */ import { AsyncCodeOpState, FnAnswerMsgCallback, FnAskMsgCallback, VpcPendingAsyncOps, VpcScriptExecAsync } from './vpcScriptExecAsync';
/* auto */ import { RequestedContainerRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcCodeLine, VpcLineCategory } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { MapTermToMilliseconds, SortType, VpcChunkPreposition, VpcGranularity, VpcTool, VpcToolCtg, checkThrow, checkThrowEq, checkThrowNotifyMsg, getToolCategory, originalToolNumberToTool } from './../vpcutils/vpcEnums';
/* auto */ import { ChunkResolutionSort } from './../vpcutils/vpcChunkResolutionSort';
/* auto */ import { ChunkResolutionApplication, RequestedChunk } from './../vpcutils/vpcChunkResolution';
/* auto */ import { VpcAudio } from './../vpcutils/vpcAudio';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { VoidFn } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, ensureDefined } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, ValHolder, cast, getStrToEnum, longstr } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/* see the section in internaldocs.md to read how we execute code. */

/**
 * execute a single line of code
 */
export class ExecuteStatement {
    cbAskMsg: O<FnAskMsgCallback>;
    cbAnswerMsg: O<FnAnswerMsgCallback>;

    outside: OutsideWorldReadWrite;
    cbStopCodeRunning: O<VoidFn>;
    pendingOps: VpcPendingAsyncOps;
    h = new VpcScriptExecuteStatementHelpers();

    /**
     * execute a single line of code
     */
    go(line: VpcCodeLine, visitResult: VpcIntermedValBase, blocked: ValHolder<AsyncCodeOpState>) {
        checkThrowEq(VpcLineCategory.Statement, line.ctg, '7h|not a statement');
        let firstToken = line.firstToken;
        let method = 'go' + Util512.capitalizeFirst(firstToken.image);
        Util512.callAsMethodOnClass(ExecuteStatement.name, this, method, [line, visitResult, blocked], false);
    }

    /**
     * add {number} to [chunk of] {container}
     * Adds the value of number to the number in a container.
     */
    goAdd(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        this.h.goMathAlter(line, vals, (a: number, b: number) => a + b);
    }
    /**
     * Displays a dialog box.
     * The button that is pressed (1, 2, or 3) will be assigned to the variable "it".
     */
    goAnswer(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let ruleCaption = tkstr.RuleExpr;
        let captionVals = this.h.getChildVpcVals(vals, ruleCaption, true);
        let captionArgs = captionVals.map(item => item.readAsString());
        let ruleChoices = tkstr.RuleLvl6Expression;
        let choicesVals = this.h.getChildVpcVals(vals, ruleChoices, false);
        let choicesArgs = choicesVals.map(item => item.readAsString());

        /* because there is only 1 script execution thread, don't need to assign a unique id. */
        let asyncOpId = 'singleThreadAsyncOpId';
        VpcScriptExecAsync.goAsyncAnswer(
            this.pendingOps,
            blocked,
            this.outside,
            this.cbAnswerMsg,
            this.cbStopCodeRunning,
            asyncOpId,
            captionArgs[0] || '',
            choicesArgs[0] || '',
            choicesArgs[1] || '',
            choicesArgs[2] || ''
        );
    }
    /**
     * Displays a dialog box allowing the user to type in a response.
     * The text typed will be assigned to the variable "it".
     * If the user clicks Cancel, the result will be an empty string "".
     */
    goAsk(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let argsVals = this.h.getChildVpcVals(vals, tkstr.RuleExpr, true);
        let args = argsVals.map(item => item.readAsString());

        /* because there is only 1 script execution thread, don't need to assign a unique id. */
        let asyncOpId = 'singleThreadAsyncOpId';
        VpcScriptExecAsync.goAsyncAsk(
            this.pendingOps,
            blocked,
            this.outside,
            this.cbAskMsg,
            this.cbStopCodeRunning,
            asyncOpId,
            args[0] || '',
            args[1] || ''
        );
    }
    /**
     * Play the system beep sound.
     */
    goBeep(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        VpcAudio.beep();
    }
    /**
     * choose {toolname} tool
     * Use the choose command for programmatically drawing pictures.
     * Doesn't set the actual tool, which is always Browse when scripts are running.
     */
    goVpccalluntrappablechoose(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let term = ensureDefined(this.h.findChildVal(vals, tkstr.RuleExpr), '5G|');
        let tool = this.getWhichTool(term.readAsString());
        let ctg = getToolCategory(tool);

        /* see if we support setting to this tool */
        if (
            ctg === VpcToolCtg.CtgShape ||
            ctg === VpcToolCtg.CtgSmear ||
            ctg === VpcToolCtg.CtgBucket ||
            ctg === VpcToolCtg.CtgCurve ||
            ctg === VpcToolCtg.CtgBrowse
        ) {
            this.outside.SetOption('mimicCurrentTool', tool);
        } else {
            checkThrow(
                false,
                longstr(`5F|the choose command is currently used for
                simulating drawing only, so it must be one of the
                paint tools like "pencil" or "brush" chosen`)
            );
        }
    }
    /**
     * click at {x}, {y}
     * Use the click command for programmatically drawing pictures.
     */
    goClick(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        return this.h.clickOrDrag(line, vals, 'at');
    }
    /**
     * delete char {i} of {container}
     */
    goDelete(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        if (vals.vals.RuleObjectPart && vals.vals.RuleObjectPart.length) {
            checkThrow(false, "5C|the 'delete' command is not yet supported for btns or flds.");
        } else {
            let contRef = ensureDefined(this.h.findChildAndCast(RequestedContainerRef, vals, tkstr.RuleHSimpleContainer), '5B|');
            let chunk = ensureDefined(this.h.findChildAndCast(RequestedChunk, vals, tkstr.RuleHChunk), '5A|');

            contRef.chunk = chunk;

            /* it's not as simple as 'put "" into item 2 of x' because */
            /* delete item 2 of "a,b,c" should be "a,c" not "a,,c" */
            checkThrow(
                chunk.type555 === VpcGranularity.Chars,
                "7Q|not yet supported. 'delete char 1 of x' works but not 'delete item 1 of x'"
            );

            this.outside.ContainerWrite(contRef, '', VpcChunkPreposition.Into);
        }
    }
    /**
     * Dial a number with old touch tones
     */
    goDial(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let args = this.h.getChildVpcVals(vals, tkstr.RuleExpr, true);

        /* read as a string, since it could have embedded - or a leading zero */
        let numbersToDial = args[0].readAsString();

        /* because there is only 1 script execution thread, don't need to assign a unique id. */
        let asyncOpId = 'singleThreadAsyncOpId';
        VpcScriptExecAsync.goAsyncDial(this.pendingOps, blocked, asyncOpId, numbersToDial);
    }
    /**
     * divide [chunk of] {container} by {number}
     * Divides the number in a container by a number.
     */
    goDivide(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        this.h.goMathAlter(line, vals, (a: number, b: number) => a / b);
    }
    /**
     * disable a vel
     */
    goDisable(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        this.setEnabled(line, vals, false);
    }
    /**
     * simulate a menu command
     */
    goVpccalluntrappabledomenu(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let exprs = vals.vals[tkstr.RuleExpr];
        checkThrow(exprs.length === 1 || exprs.length === 2, '');
        let firstP = cast(VpcVal, exprs[0]).readAsString();
        let secondP = exprs.length === 1 ? '' : cast(VpcVal, exprs[1]).readAsString();
        let result = this.outside.DoMenuAction(firstP, secondP);
        this.outside.SetVarContents('$result', VpcValS(result));
    }
    /**
     * drag from {x1}, {y1} to {x2}, {y2}
     * Use the drag command for programmatically drawing pictures.
     */
    goDrag(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        return this.h.clickOrDrag(line, vals, 'from');
    }
    /**
     * enable a vel
     */
    goEnable(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        this.setEnabled(line, vals, true);
    }
    /**
     * show an error, appears as a script error conveniently
     */
    goVpccalluntrappableerrordialog(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let args = this.h.getChildVpcVals(vals, tkstr.RuleExpr, true);
        let s = args[0].readAsString();
        checkThrowNotifyMsg(false, 'aa|' + s);
    }
    /**
     * hide {button|field}
     */
    goHide(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let ref = this.h.findChildVelRef(vals, tkstr.RuleObjectPart);
        let identifier = this.h.findChildStr(vals, tkstr.tkIdentifier);
        if (ref) {
            this.outside.SetProp(ref, 'visible', VpcVal.False, undefined);
        } else if (identifier) {
            if (identifier === 'menubar') {
                this.outside.SetOption('fullScreen', true);
            } else {
                checkThrow(false, '4_|so far we only support hide menubar or hide cd btn 1');
            }
        } else {
            checkThrow(false, '4^|all choices null');
        }
    }
    /**
     * lock screen
     */
    goLock(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals, tkstr.tkIdentifier);
        checkThrow(params[0] === 'screen', 'R<|only support lock screen');
        this.outside.SetOption('screenLocked', true);
    }
    /**
     * mark cards
     */
    goMark(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        checkThrow(false, 'R;|not yet implemented');
    }
    /**
     * multiply [chunk of] {container} by {number}
     * Multiplies the number in a container by a number.
     */
    goMultiply(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        this.h.goMathAlter(line, vals, (a: number, b: number) => a * b);
    }
    /**
     * Play a sound effect.
     * Use
     *      play "mySound" load
     * first, and then
     *      play "mySound"
     */
    goPlay(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let args = this.h.getChildVpcVals(vals, tkstr.RuleExpr, true);
        let whichSound = args[0].readAsString();
        let isJustLoadIdentifier =
            vals.vals[tkstr.tkIdentifier] && vals.vals[tkstr.tkIdentifier].length > 1
                ? vals.vals[tkstr.tkIdentifier][1]
                : undefined;
        let justLoad = false;
        if (isJustLoadIdentifier && typeof isJustLoadIdentifier === 'string') {
            checkThrow(isJustLoadIdentifier === 'load', 'JQ|expected play "snd" load, but got', isJustLoadIdentifier);
            justLoad = true;
        }

        if (justLoad) {
            VpcAudio.preloadNoThrow(whichSound);
        } else {
            VpcAudio.play(whichSound);
        }
    }
    /**
     * put {expression} into {container}
     * Evaluates any expression and saves the result to a variable or container.
     */
    goPut(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        /* for performance, visiting a put returns a flat array */
        let ar = vals as any;
        let val = cast(VpcVal, ar[0]);
        let prep = getStrToEnum<VpcChunkPreposition>(VpcChunkPreposition, 'VpcChunkPreposition', ar[1]);
        let contRef = cast(RequestedContainerRef, ar[2]);
        let cont = this.outside.ResolveContainerWritable(contRef);
        let itemDel = this.outside.GetItemDelim();
        ChunkResolutionApplication.applyPut(cont, contRef.chunk, itemDel, val.readAsString(), prep);
    }
    /**
     * reset paint/ menubar
     */
    goReset(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals, tkstr.tkIdentifier);
        checkThrow(params[0] === 'paint', 'R:|only support reset paint');
        checkThrow(false, "52|the 'reset' command is not yet implemented.");
    }
    /**
     * replace text
     */
    goReplace(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let exprs = vals.vals[tkstr.RuleExpr];
        let expr1 = exprs[0];
        let expr2 = exprs[1];
        checkThrowEq(2, exprs.length, 'R/|');
        checkThrow(expr1 instanceof VpcVal, 'R.|');
        checkThrow(expr2 instanceof VpcVal, 'R-|');
        let searchFor = expr1.readAsString();
        let replaceWith = expr2.readAsString();

        let contRef = ensureDefined(this.h.findChildAndCast(RequestedContainerRef, vals, tkstr.RuleHSimpleContainer), 'R,|');
        let cont = this.outside.ResolveContainerWritable(contRef);
        cont.replaceAll(searchFor, replaceWith);
    }
    /**
     * selects text
     */
    goSelect(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals);
        if (params[0] === 'empty') {
            checkThrow(false, 'R+|nyi: deselecting text');
        } else {
            let contRef = ensureDefined(this.h.findChildAndCast(RequestedContainerRef, vals, tkstr.RuleHContainer), '53|');
            checkThrow(contRef.vel, 'R*|has to be a field, not a variable');
            this.outside.ResolveContainerWritable(contRef);
            checkThrow(false, 'R)|nyi: selecting text');
        }
    }
    /**
     * set the {property} of {button|field} to {value}
     */
    goSet(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let velRef = this.h.findChildVelRef(vals, tkstr.RuleObject);
        let velRefFld = this.h.findChildVelRef(vals, tkstr.RuleObjectFld);
        let velRefChunk = this.h.findChildAndCast(RequestedChunk, vals, tkstr.RuleHChunk);
        let tk = ensureDefined(vals.vals[tkstr.RuleHCouldBeAPropertyToSet], 'R(|')[0];
        let propName = (tk as ChvITk).image;

        /* let's concat all of the values together into one string separated by commas */
        /* that way we'll support coordinates "1,2" and text styles "plain, bold" */
        let strings: string[] = [];
        let val = this.h.findChildMap(vals, tkstr.RuleAnyPropertyVal);
        let nm = tkstr.RuleLvl1Expression;
        let ar = val ? val.vals[nm] : undefined;
        if (ar && ar.length) {
            let arVals = ar as VpcVal[];
            for (let i = 0, len = arVals.length; i < len; i++) {
                let item = arVals[i];
                assertTrue(item instanceof VpcVal, '50|every item must be a vpcval');
                strings.push(item.readAsString());
            }
        }

        checkThrow(strings.length > 0, '7L|could not find RuleAnyPropertyVal or its child', nm);
        let combined = VpcValS(strings.join(','));
        if (velRefChunk) {
            ensureDefined(velRefFld, '4~|');
            this.outside.SetProp(velRefFld, propName, combined, velRefChunk);
        } else {
            this.outside.SetProp(velRef, propName, combined, undefined);
        }
    }
    /**
     * show {button|field}
     */
    goShow(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let identifiers = this.h.getLiteralParams(vals, tkstr.tkIdentifier);
        if (identifiers && identifiers[0] === 'menubar') {
            this.outside.SetOption('fullScreen', false);
            return;
        }

        checkThrow(!identifiers || !identifiers[0] || identifiers[0] === 'at', 'R&|must be show *at*');
        let location = this.h.getChildVpcVals(vals, tkstr.RuleLvl4Expression, false);
        let locationStr = location.map(v => v.readAsString()).join(',');

        let ref = ensureDefined(this.h.findChildVelRef(vals, tkstr.RuleObjectPart), '4||');
        this.outside.SetProp(ref, 'visible', VpcVal.True, undefined);
        if (locationStr) {
            this.outside.SetProp(ref, 'location', VpcValS(locationStr), undefined);
        }
    }
    /**
     * sort (has been rewritten to add string literal params)
     */
    goSort(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals);
        checkThrowEq(2, params.length, 'R%|');
        let itemDel = this.outside.GetItemDelim();
        let [smethod, sorder] = params;
        let sg = ensureDefined(this.h.findChildStr(vals, tkstr.tkChunkGranularity), 'R#|');
        let granularity = getStrToEnum<VpcGranularity>(VpcGranularity, 'Granularity', sg);
        let method = getStrToEnum<SortType>(SortType, 'SortType', smethod);
        let ascend = sorder.toLowerCase() !== 'descending';
        let contRef = ensureDefined(this.h.findChildAndCast(RequestedContainerRef, vals, tkstr.RuleHSimpleContainer), '4[|');
        let cont = this.outside.ResolveContainerWritable(contRef);
        ChunkResolutionSort.applySort(cont, itemDel, granularity, method, ascend);
    }
    /**
     * subtract [chunk of] {container} from {number}
     * Subtracts a number from the number in a container.
     */
    goSubtract(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        this.h.goMathAlter(line, vals, (a: number, b: number) => a - b);
    }
    /**
     * unlock screen
     */
    goUnlock(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals, tkstr.tkIdentifier);
        checkThrow(params[0] === 'screen', 'R!|only support lock screen');
        this.outside.SetOption('screenLocked', false);
        if (params.length > 1) {
            let str = params.slice(1).join('|');
            this.outside.SetVarContents('$currentVisEffect', VpcValS(str));
            checkThrow(false, 'R |visual effects are nyi');
        }
    }
    /**
     * visual effect
     */
    goVisual(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals, tkstr.tkIdentifier);
        checkThrow(params[0] === 'effect', 'Rz|only support lock screen');
        if (params.length > 1) {
            let str = params.slice(1).join('|');
            this.outside.DeclareGlobal('$currentVisEffect');
            this.outside.SetVarContents('$currentVisEffect', VpcValS(str));
            checkThrow(false, 'Ry|visual effects are nyi');
        }
    }
    /**
     * wait {number} [seconds|milliseconds|ms|ticks]
     * Pauses the script.
     */
    goWait(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals, tkstr.tkIdentifier);
        Util512.extendArray(params, this.h.getLiteralParams(vals, tkstr.tkOrdinal));
        let multiply = MapTermToMilliseconds.Ticks;
        if (params && params.length) {
            checkThrowEq(1, params.length, 'Rx|expected something like `wait 400 ms`');
            multiply = getStrToEnum<MapTermToMilliseconds>(MapTermToMilliseconds, 'MapTermToMilliseconds', params[0]);
        }

        let args = this.h.getChildVpcVals(vals, tkstr.RuleExpr, true);
        let number = args[0].readAsStrictNumeric();
        /* because there is only 1 script execution thread, don't need to assign a unique id. */
        let asyncOpId = 'singleThreadAsyncOpId';
        let milliseconds = Math.max(0, Math.round(number * multiply));
        VpcScriptExecAsync.goAsyncWait(this.pendingOps, blocked, asyncOpId, milliseconds);
    }

    /**
     * understands both "4" and "line"
     */
    protected getWhichTool(s: string): VpcTool {
        s = s.replace(/ +/g, '');
        checkThrow(s.length >= 1, 'JP|not a valid tool name.');
        let num = Util512.parseInt(s);
        if (num !== undefined) {
            return originalToolNumberToTool(num);
        } else {
            return getStrToEnum<VpcTool>(VpcTool, 'VpcTool', s);
        }
    }

    /**
     * set if a vel is enabled or not
     */
    protected setEnabled(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, b: boolean) {
        let ref = ensureDefined(this.h.findChildVelRef(vals, tkstr.RuleObjectBtn), '59|');
        this.outside.SetProp(ref, 'enabled', VpcValBool(b), undefined);
    }
}
