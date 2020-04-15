
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValBool, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { tkstr, ChvITk } from './../codeparse/vpcTokens';
/* auto */ import { VpcScriptExecuteStatementHelpers } from './vpcScriptExecStatementHelpers';
/* auto */ import { AsyncCodeOpState, FnAnswerMsgCallback, FnAskMsgCallback, VpcPendingAsyncOps, VpcScriptExecAsync } from './vpcScriptExecAsync';
/* auto */ import { RequestedContainerRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcCodeLine, VpcLineCategory } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { MapTermToMilliseconds, SortType, VpcChunkPreposition, VpcGranularity, VpcTool, VpcToolCtg, VpcVisualEffectSpec, VpcVisualEffectSpeed, VpcVisualEffectType, VpcVisualEffectTypeDestination, VpcVisualEffectTypeDirection, checkThrow, checkThrowEq, getToolCategory, originalToolNumberToTool } from './../vpcutils/vpcEnums';
/* auto */ import { ChunkResolution, RequestedChunk } from './../vpcutils/vpcChunkResolution';
/* auto */ import { VpcAudio } from './../vpcutils/vpcAudio';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { VoidFn } from './../../ui512/utils/util512Higher';
/* auto */ import { O, isString } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, ensureDefined } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { Util512, ValHolder, getStrToEnum, longstr } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
        let vals = visitResult as IntermedMapOfIntermedVals;
        checkThrow(
            vals instanceof IntermedMapOfIntermedVals,
            `7f|command ${firstToken.image} did not return IntermedMapOfIntermedVals`
        );

        let method = 'go' + Util512.capitalizeFirst(firstToken.image);
        Util512.callAsMethodOnClass(ExecuteStatement.name, this, method, [line, vals, blocked], false);
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
                chunk.type === VpcGranularity.Chars,
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
        checkThrow(false, 'not yet implemented');
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
        checkThrow(params[0] === 'screen', 'only support lock screen');
        this.outside.SetOption('screenLocked', true);
    }
    /**
     * mark cards
     */
    goMark(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        checkThrow(false, 'not yet implemented');
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
        if (isJustLoadIdentifier && isString(isJustLoadIdentifier)) {
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
        let terms = this.h.getChildStrs(vals, tkstr.tkIdentifier, true);
        checkThrow(terms.length === 1, longstr(`7M|(missing into, before, or after).`));
        let prep = getStrToEnum<VpcChunkPreposition>(VpcChunkPreposition, 'VpcChunkPreposition', terms[0]);
        let val = ensureDefined(this.h.findChildVal(vals, tkstr.RuleExpr), '54|');
        let contRef = ensureDefined(this.h.findChildAndCast(RequestedContainerRef, vals, tkstr.RuleHContainer), '53|');

        let cont = this.outside.ResolveContainerWritable(contRef);
        let itemDel = this.outside.GetItemDelim();
        ChunkResolution.applyPut(cont, contRef.chunk, itemDel, val.readAsString(), prep);
    }
    /**
     * reset paint/ menubar
     */
    goReset(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals, tkstr.tkIdentifier);
        checkThrow(params[0] === 'paint', 'only support reset paint');
        checkThrow(false, "52|the 'reset' command is not yet implemented.");
    }
    /**
     * replace text
     */
    goReplace(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let exprs = vals.vals[tkstr.RuleExpr];
        let expr1 = exprs[0] as VpcVal;
        let expr2 = exprs[1] as VpcVal;
        checkThrowEq(2, exprs.length, '');
        checkThrow(expr1 instanceof VpcVal, '');
        checkThrow(expr2 instanceof VpcVal, '');
        let searchFor = expr1.readAsString();
        let replaceWith = expr2.readAsString();

        let contRef = ensureDefined(this.h.findChildAndCast(RequestedContainerRef, vals, tkstr.RuleHSimpleContainer), '53|');
        let cont = this.outside.ResolveContainerWritable(contRef);
        cont.replaceAll(searchFor, replaceWith);
    }
    /**
     * selects text
     */
    goSelect(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals);
        if (params[0] === 'empty') {
            checkThrow(false, 'nyi: deselecting text');
        } else {
            let contRef = ensureDefined(this.h.findChildAndCast(RequestedContainerRef, vals, tkstr.RuleHContainer), '53|');
            checkThrow(contRef.vel, 'has to be a field, not a variable');
            this.outside.ResolveContainerWritable(contRef);
            checkThrow(false, 'nyi: selecting text');
        }
    }
    /**
     * set the {property} of {button|field} to {value}
     */
    goSet(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let velRef = this.h.findChildVelRef(vals, tkstr.RuleObject);
        let velRefFld = this.h.findChildVelRef(vals, tkstr.RuleObjectFld);
        let velRefChunk = this.h.findChildAndCast(RequestedChunk, vals, tkstr.RuleHChunk);
        let tk = ensureDefined(vals.vals[tkstr.RuleHCouldBeAPropertyToSet], '')[0];
        let propName = (tk as ChvITk).image

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

        checkThrow(!identifiers || !identifiers[0] || identifiers[0] === 'at', 'must be show *at*');
        let location = this.h.getChildVpcVals(vals, tkstr.RuleLvl4Expression, false);
        let locationStr = location.map(v => v.readAsString()).join(',');

        let ref = ensureDefined(this.h.findChildVelRef(vals, tkstr.RuleObjectPart), '4||');
        this.outside.SetProp(ref, 'visible', VpcVal.True, undefined);
        if (locationStr) {
            this.outside.SetProp(ref, 'loc', VpcValS(locationStr), undefined);
        }
    }
    /**
     * sort [lines|items|chars] of {container}
     */
    goSort(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals);
        checkThrowEq(3, params.length, '');
        let itemDel = this.outside.GetItemDelim();
        let [sgranularity, smethod, sorder] = params;
        let granularity = getStrToEnum<VpcGranularity>(VpcGranularity, 'Granularity', sgranularity);
        let method = getStrToEnum<SortType>(SortType, 'SortType', smethod);
        let ascend = sorder.toLowerCase() !== 'descending';
        let contRef = ensureDefined(this.h.findChildAndCast(RequestedContainerRef, vals, tkstr.RuleHContainer), '4[|');
        let cont = this.outside.ResolveContainerWritable(contRef);
        ChunkResolution.applySort(cont, itemDel, granularity, method, ascend);
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
        checkThrow(params[0] === 'screen', 'only support lock screen');
        this.outside.SetOption('screenLocked', false);
        if (params.length > 1) {
            // let spec = this.getVisualEffect(params.slice(1));
            checkThrow(false, 'visual effects are nyi');
        }
    }
    /**
     * wait {number} [seconds|milliseconds|ms|ticks]
     * Pauses the script.
     */
    goWait(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<AsyncCodeOpState>) {
        let params = this.h.getLiteralParams(vals, tkstr.tkIdentifier);
        let multiply = MapTermToMilliseconds.Ticks;
        if (params && params.length) {
            checkThrowEq(1, params.length, 'expected `wait 400 ms`');
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
        s = s.replace(/ +/g, '_');
        checkThrow(s.length >= 1, 'JP|not a valid tool name.');
        let choseNumber = Util512.parseInt(s);
        if (choseNumber !== undefined) {
            return originalToolNumberToTool(choseNumber);
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

    /**
     * parse visual effect params. they were already set up nicely in rewrites.
     */
    protected getVisualEffect(params: string[]) {
        checkThrowEq(4, params.length, '');
        return new VpcVisualEffectSpec(
            getStrToEnum<VpcVisualEffectSpeed>(VpcVisualEffectSpeed, 'VpcVisualEffectSpeed', params[0]),
            getStrToEnum<VpcVisualEffectType>(VpcVisualEffectType, 'VpcVisualEffectType', params[1]),
            getStrToEnum<VpcVisualEffectTypeDirection>(VpcVisualEffectTypeDirection, 'VpcVisualEffectTypeDirection', params[2]),
            getStrToEnum<VpcVisualEffectTypeDestination>(VpcVisualEffectTypeDestination, 'VpcVisualEffectTypeDestination', params[3])
        );
    }
}
