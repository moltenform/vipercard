
/* auto */ import { isRelease } from '../../config.js';
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, ValHolder, checkThrowEq, getStrToEnum, isString } from '../../ui512/utils/utils512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { MapTermToMilliseconds, OrdinalOrPosition, SortType, VpcChunkPreposition, VpcChunkType, VpcElType, VpcTool, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValBool, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcChunkResolution.js';
/* auto */ import { VpcAudio } from '../../vpc/vpcutils/vpcAudio.js';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from '../../vpc/vpcutils/vpcRequestedReference.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { isTkType, tks } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { fromNickname } from '../../vpc/codeparse/vpcVisitorMixin.js';
/* auto */ import { VpcLineCategory } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { VpcCodeLine } from '../../vpc/codepreparse/vpcCodeLine.js';
/* auto */ import { VpcPendingAsyncOps, VpcScriptExecAsync } from '../../vpc/codeexec/vpcScriptExecAsync.js';

/**
 * execute a single line of code
 */
export class ExecuteStatement {
    cbAskMsg: O<(prompt: string, deftxt: string, fnOnResult: (ret: O<string>, n: number) => void) => void>;
    cbAnswerMsg: O<
        (prompt: string, fnOnResult: (n: number) => void, choice1: string, choice2: string, choice3: string) => void
    >;

    outside: OutsideWorldReadWrite;
    cbStopCodeRunning: O<() => void>;
    pendingOps: VpcPendingAsyncOps;

    /**
     * execute a single line of code
     */
    go(line: VpcCodeLine, visitResult: VpcIntermedValBase, blocked: ValHolder<number>) {
        checkThrowEq(VpcLineCategory.Statement, line.ctg, '7h|not a statement');
        let firstToken = line.excerptToParse[0];
        checkThrow(isTkType(firstToken, tks.TokenTkidentifier), `7g|expect built-in statement`);
        let vals = visitResult as IntermedMapOfIntermedVals;
        checkThrow(
            vals.isIntermedMapOfIntermedVals,
            `7f|command ${firstToken.image} did not return IntermedMapOfIntermedVals`
        );

        let method = 'go' + Util512.capitalizeFirst(firstToken.image);
        Util512.callAsMethodOnClass('ExecuteStatement', this, method, [line, vals, blocked], false);
    }

    /**
     * add {number} to [chunk of] {container}
     * Adds the value of number to the number in a container.
     */
    goAdd(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        this.goMathAlter(line, vals, (a: number, b: number) => a + b);
    }

    /**
     * subtract [chunk of] {container} from {number}
     * Subtracts a number from the number in a container.
     */
    goSubtract(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        this.goMathAlter(line, vals, (a: number, b: number) => a - b);
    }

    /**
     * multiply [chunk of] {container} by {number}
     * Multiplies the number in a container by a number.
     */
    goMultiply(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        this.goMathAlter(line, vals, (a: number, b: number) => a * b);
    }

    /**
     * divide [chunk of] {container} by {number}
     * Divides the number in a container by a number.
     */
    goDivide(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        this.goMathAlter(line, vals, (a: number, b: number) => a / b);
    }

    /**
     * implementation of add, subtract, etc
     */
    protected goMathAlter(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, fn: (a: number, b: number) => number) {
        let val = throwIfUndefined(this.findChildVal(vals, 'RuleLvl4Expression'), '5M|');
        let container = throwIfUndefined(
            this.findChildOther<RequestedContainerRef>('RequestedContainerRef', vals, 'RuleHContainer'),
            '5L|'
        );

        let getResultAsString = (s: string) => {
            let f1 = VpcValS(s).readAsStrictNumeric();
            let f2 = val.readAsStrictNumeric();
            let res = fn(f1, f2);
            return VpcValN(res).readAsString();
        };

        this.outside.ContainerModify(container, getResultAsString);
    }

    /**
     * retrieve an expected IntermedMapOfIntermedVals from the visitor result
     */
    protected findChildMap(vals: IntermedMapOfIntermedVals, nm: string): O<IntermedMapOfIntermedVals> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsMap = got[0] as IntermedMapOfIntermedVals;
            checkThrowEq(1, got.length, '7d|expected length 1');
            checkThrow(gotAsMap.isIntermedMapOfIntermedVals, '7c|wrong type');
            return gotAsMap;
        } else {
            return undefined;
        }
    }

    /**
     * retrieve an expected VpcVal from the visitor result
     */
    protected findChildVal(vals: IntermedMapOfIntermedVals, nm: string): O<VpcVal> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsVal = got[0] as VpcVal;
            checkThrowEq(1, got.length, '7b|expected length 1');
            checkThrow(gotAsVal.isVpcVal, '7a|wrong type');
            return gotAsVal;
        } else {
            return undefined;
        }
    }

    /**
     * retrieve an expected string from the visitor result
     */
    protected findChildStr(vals: IntermedMapOfIntermedVals, nm: string): O<string> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsString = got[0] as string;
            checkThrowEq(1, got.length, '7Z|expected length 1');
            checkThrow(isString(gotAsString), '7Y|wrong type');
            return gotAsString;
        } else {
            return undefined;
        }
    }

    /**
     * retrieve an expected RequestedVelRef from the visitor result
     */
    protected findChildVelRef(vals: IntermedMapOfIntermedVals, nm: string): O<RequestedVelRef> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsVelRef = got[0] as RequestedVelRef;
            checkThrowEq(1, got.length, '7X|expected length 1');
            checkThrow(gotAsVelRef.isRequestedVelRef, '7W|wrong type');
            return gotAsVelRef;
        } else {
            return undefined;
        }
    }

    /**
     * retrieve an expected type of VpcIntermedValBase from the visitor result
     */
    protected findChildOther<T extends VpcIntermedValBase>(
        typeAsString: string,
        vals: IntermedMapOfIntermedVals,
        nm: string
    ): O<T> {
        let got = vals.vals[nm];
        if (got) {
            let gotAsT = got[0] as T;
            checkThrowEq(1, got.length, '7V|expected length 1');
            checkThrow((gotAsT as any)['is' + typeAsString] === true, '7U|wrong type');
            return gotAsT;
        } else {
            return undefined;
        }
    }

    /**
     * resolve reference to a vel
     */
    protected getResolveChildVel(vals: IntermedMapOfIntermedVals, nm: string): VpcElBase {
        let ref = throwIfUndefined(this.findChildVelRef(vals, nm), '5K|not found', nm);
        return throwIfUndefined(this.outside.ResolveVelRef(ref), '5J|element not found');
    }

    /**
     * get all child strings
     */
    protected getAllChildStrs(vals: IntermedMapOfIntermedVals, nm: string, atLeastOne: boolean): string[] {
        let ret: string[] = [];
        if (vals.vals[nm]) {
            for (let child of vals.vals[nm]) {
                checkThrow(isString(child), '7T|');
                ret.push(child as string);
            }
        } else {
            checkThrow(!atLeastOne, '7S|no child');
        }

        return ret;
    }

    /**
     * get all child VpcVals
     */
    protected getAllChildVpcVals(vals: IntermedMapOfIntermedVals, nm: string, atLeastOne: boolean): VpcVal[] {
        let ret: VpcVal[] = [];
        if (vals.vals[nm]) {
            for (let child of vals.vals[nm]) {
                checkThrow(child instanceof VpcVal, '');
                ret.push(child as VpcVal);
            }
        } else {
            checkThrow(!atLeastOne, 'no child');
        }

        return ret;
    }

    /**
     * Displays a dialog box.
     * The button that is pressed (1, 2, or 3) will be assigned to the variable "it".
     */
    goAnswer(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let nm = fromNickname('FACTOR');
        let argsVals = this.getAllChildVpcVals(vals, nm, true);
        let args = argsVals.map(item => item.readAsString());

        /* because there is only 1 script execution thread, don't need to assign a unique id. */
        let asyncOpId = 'singleThreadAsyncOpId';
        VpcScriptExecAsync.goAsyncAnswer(
            this.pendingOps,
            blocked,
            this.outside,
            this.cbAnswerMsg,
            this.cbStopCodeRunning,
            asyncOpId,
            args[0] || '',
            args[1] || '',
            args[2] || '',
            args[3] || ''
        );
    }

    /**
     * Displays a dialog box allowing the user to type in a response.
     * The text typed will be assigned to the variable "it".
     * If the user clicks Cancel, the result will be an empty string "".
     */
    goAsk(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let argsVals = this.getAllChildVpcVals(vals, 'RuleExpr', true);
        let args = argsVals.map(item => item.readAsString());
        let closureGetAsyncOps = this.pendingOps;

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
    goBeep(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        VpcAudio.beep();
    }

    /**
     * Play a sound effect.
     * Use
     *      play "mySound" load
     * first, and then
     *      play "mySound"
     */
    goPlay(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let args = this.getAllChildVpcVals(vals, 'RuleExpr', true);
        let whichSound = args[0].readAsString();
        let isJustLoadIdentifier =
            vals.vals['TokenTkidentifier'] && vals.vals['TokenTkidentifier'].length > 1
                ? vals.vals['TokenTkidentifier'][1]
                : undefined;
        let justLoad = false;
        if (isJustLoadIdentifier && isString(isJustLoadIdentifier)) {
            checkThrow(isJustLoadIdentifier === 'load', 'expected play "snd" load, but got', isJustLoadIdentifier);
            justLoad = true;
        }

        try {
            if (justLoad) {
                VpcAudio.preload(whichSound);
            } else {
                VpcAudio.play(whichSound);
            }
        } catch (e) {
            if (isRelease) {
                console.error('audio encountered ' + e);
            } else {
                throw e;
            }
        }
    }

    /**
     * choose {toolname} tool
     * Use the choose command for programmatically drawing pictures.
     * Doesn't set the actual tool, which is always Browse when scripts are running.
     */
    goChoose(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let nm = fromNickname('FACTOR');
        let factor = throwIfUndefined(this.findChildVal(vals, nm), '5G|');
        let sTool = factor.readAsString().replace(/ +/, '_');
        checkThrow(sTool.length > 1, 'not a valid tool name.');

        /* from string to enum entry */
        let tl = getStrToEnum<VpcTool>(VpcTool, 'VpcTool', sTool);
        let ctg = getToolCategory(tl);
        if (
            ctg === VpcToolCtg.CtgShape ||
            ctg === VpcToolCtg.CtgSmear ||
            ctg === VpcToolCtg.CtgBucket ||
            ctg === VpcToolCtg.CtgCurve ||
            ctg === VpcToolCtg.CtgBrowse
        ) {
            this.outside.SetOption('mimicCurrentTool', tl);
        } else {
            throw makeVpcScriptErr(
                '5F|the choose command is now used for simulating drawing only, so it must be one of the paint tools like "pencil" or "brush" chosen'
            );
        }
    }

    /**
     * click at {x}, {y}
     * Use the click command for programmatically drawing pictures.
     */
    goClick(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        return this.clickOrDrag(line, vals, 'at');
    }

    /**
     * drag from {x1}, {y1} to {x2}, {y2}
     * Use the drag command for programmatically drawing pictures.
     */
    goDrag(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        return this.clickOrDrag(line, vals, 'from');
    }

    /**
     * click, drag implementation
     */
    protected clickOrDrag(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, expectSee: string) {
        let nm = fromNickname('MAYBE_ALLOW_ARITH');
        let argsGiven: number[] = [];
        let ar = vals.vals[nm];
        if (ar && ar.length) {
            for (let item of ar as VpcVal[]) {
                assertTrue(item && item.isVpcVal, '50|every item must be a vpcval');
                argsGiven.push(item.readAsStrictInteger());
            }
        }

        checkThrow(argsGiven.length > 1, 'not enough args');
        let mods = ModifierKeys.None;
        let allIdentifiers = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        let sawExpected = false;
        for (let id of allIdentifiers) {
            if (id === 'shiftkey') {
                mods |= ModifierKeys.Shift;
            } else if (id === 'optionkey') {
                mods |= ModifierKeys.Opt;
            } else if (id === 'commandkey' || id === 'cmdkey') {
                mods |= ModifierKeys.Cmd;
            } else if (id === expectSee) {
                sawExpected = true;
            }
        }

        checkThrow(sawExpected, 'syntax error did not see ', expectSee);
        this.outside.SimulateClick(argsGiven, mods);
    }

    /**
     * delete char {i} of {container}
     */
    goDelete(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        if (vals.vals.RuleObjectPart && vals.vals.RuleObjectPart.length) {
            throw makeVpcScriptErr("5C|the 'delete' command is not yet supported for btns or flds.");
        } else {
            let contRef = throwIfUndefined(
                this.findChildOther<RequestedContainerRef>('RequestedContainerRef', vals, 'RuleHSimpleContainer'),
                '5B|'
            );
            let chunk = throwIfUndefined(
                this.findChildOther<RequestedChunk>('RequestedChunk', vals, 'RuleHChunk'),
                '5A|'
            );

            contRef.chunk = chunk;

            /* it's not as simple as 'put "" into item 2 of x' because */
            /* delete item 2 of "a,b,c" should be "a,c" not "a,,c" */
            checkThrow(
                chunk.type === VpcChunkType.Chars,
                "7Q|not yet supported. 'delete char 1 of x' works but not 'delete item 1 of x'"
            );
            this.outside.ContainerWrite(contRef, '', VpcChunkPreposition.Into);
        }
    }

    /**
     * This feature will arrive in a future version...
     */
    goCreate(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        throw makeVpcScriptErr("the 'create' command is not yet supported.");
    }

    /**
     * set if a vel is enabled or not
     */
    protected setEnabled(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, b: boolean) {
        let ref = throwIfUndefined(this.findChildVelRef(vals, 'RuleObjectBtn'), '59|');
        this.outside.SetProp(ref, 'enabled', VpcValBool(b), undefined);
    }

    /**
     * enable a vel
     */
    goEnable(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        this.setEnabled(line, vals, true);
    }

    /**
     * disable a vel
     */
    goDisable(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        this.setEnabled(line, vals, false);
    }

    /**
     * get {expression}
     * Evaluates any expression and saves the result to the variable "it".
     */
    goGet(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let expr = throwIfUndefined(this.findChildVal(vals, 'RuleExpr'), '58|');
        this.outside.SetSpecialVar('it', expr);
    }

    /**
     * Go to a different card.
     */
    goGo(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let ref = this.findChildVelRef(vals, 'RuleNtDest');
        if (ref) {
            let vel = this.getResolveChildVel(vals, 'RuleNtDest');
            let velAsStack = vel as VpcElStack;
            let velAsBg = vel as VpcElBg;
            let velAsCard = vel as VpcElCard;
            if (velAsCard && velAsCard.isVpcElCard) {
                /* e.g. go card 2 */
                this.outside.GoCardRelative(OrdinalOrPosition.This, velAsCard.id);
            } else {
                let requestStack = new RequestedVelRef(VpcElType.Stack);
                requestStack.lookByRelative = OrdinalOrPosition.This;
                let stack = this.outside.ResolveVelRef(requestStack) as VpcElStack;
                checkThrow(stack && stack.isVpcElStack, '7P|');

                if (velAsStack && velAsStack.isVpcElStack) {
                    if (velAsStack.id !== stack.id) {
                        /* e.g. go to stack "otherStack" */
                        throw makeVpcScriptErr("57|we don't support going to other stacks");
                    } else {
                        /* nothing to do, we're already on this stack */
                    }
                } else if (velAsBg && velAsBg.isVpcElBg && velAsBg.cards.length) {
                    /* e.g. go to bg 2 */
                    this.outside.GoCardRelative(OrdinalOrPosition.This, velAsBg.cards[0].id);
                } else {
                    /* e.g. go to cd btn 2 */
                    throw makeVpcScriptErr('56|we only support going to a card or a bg');
                }
            }
        } else {
            let shp: string;
            if (vals.vals.RuleHOrdinal) {
                /* e.g. go second card */
                shp = vals.vals.RuleHOrdinal[0] as string;
            } else if (vals.vals.RuleHPosition) {
                /* e.g. go next card */
                shp = vals.vals.RuleHPosition[0] as string;
            } else {
                throw makeVpcScriptErr('55|all choices null');
            }

            checkThrow(isString(shp), '7O|');
            let hp = getStrToEnum<OrdinalOrPosition>(OrdinalOrPosition, 'OrdinalOrPosition', shp);
            this.outside.GoCardRelative(hp);
        }
    }

    /**
     * put {expression} into {container}
     * Evaluates any expression and saves the result to a variable or container.
     */
    goPut(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let terms = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        checkThrow(
            terms.length === 2,
            "7M|we don't support 'put \"abc\"' to use the message box (missing into, before, or after)."
        );

        let prep = getStrToEnum<VpcChunkPreposition>(VpcChunkPreposition, 'VpcChunkPreposition', terms[1]);
        let val = throwIfUndefined(this.findChildVal(vals, 'RuleExpr'), '54|');
        let contRef = throwIfUndefined(
            this.findChildOther<RequestedContainerRef>('RequestedContainerRef', vals, 'RuleHContainer'),
            '53|'
        );

        let cont = this.outside.ResolveContainerWritable(contRef);
        let itemDel = this.outside.GetItemDelim();
        ChunkResolution.applyPut(cont, contRef.chunk, itemDel, val.readAsString(), prep);
    }

    /**
     * reset menubar
     */
    goReset(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        throw makeVpcScriptErr("52|the 'reset' command is not yet implemented.");
    }

    /**
     * set the {property} of {button|field} to {value}
     */
    goSet(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let velRef = this.findChildVelRef(vals, 'RuleObject');
        let velRefFld = this.findChildVelRef(vals, 'RuleObjectFld');
        let velRefChunk = this.findChildOther<RequestedChunk>('RequestedChunk', vals, 'RuleHChunk');
        let propName = throwIfUndefined(this.findChildStr(vals, 'RuleAnyPropertyName'), '51|');

        /* let's concat all of the values together into one string separated by commas */
        /* that way we'll support coordinates "1,2" and text styles "plain, bold" */
        let strings: string[] = [];
        let val = this.findChildMap(vals, 'RuleAnyPropertyVal');
        let nm = fromNickname('MAYBE_ALLOW_ARITH');
        let ar = val ? val.vals[nm] : undefined;
        if (ar && ar.length) {
            for (let item of ar as VpcVal[]) {
                assertTrue(item && item.isVpcVal, '50|every item must be a vpcval');
                strings.push(item.readAsString());
            }
        }

        checkThrow(strings.length > 0, '7L|could not find RuleAnyPropertyVal or its child', nm);
        let combined = VpcValS(strings.join(','));
        if (velRefChunk) {
            throwIfUndefined(velRefFld, '4~|');
            this.outside.SetProp(velRefFld, propName, combined, velRefChunk);
        } else {
            this.outside.SetProp(velRef, propName, combined, undefined);
        }
    }

    /**
     * show {button|field}
     */
    goShow(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let strs = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        let rule1 = this.findChildMap(vals, 'RuleShow_1');
        let rule2 = this.findChildMap(vals, 'RuleShow_1');
        if (strs.length > 1) {
            if (strs[1] === 'menubar') {
                this.outside.SetOption('fullScreen', false);
            } else {
                throw makeVpcScriptErr('4}|we only support show menubar or show cd btn 1 or show cd btn 1 at x,y');
            }
        } else if (rule1) {
            /* show cd btn "myBtn" at 34,45 */
            let ref = throwIfUndefined(this.findChildVelRef(rule1, 'RuleObjectPart'), '4||');
            this.outside.SetProp(ref, 'visible', VpcVal.True, undefined);
            let nmExpr = fromNickname('MAYBE_ALLOW_ARITH');
            if (rule1.vals[nmExpr]) {
                let val1 = rule1.vals[nmExpr][0] as VpcVal;
                let val2 = rule1.vals[nmExpr][1] as VpcVal;
                checkThrow(val1 && val1.isVpcVal && val2 && val2.isVpcVal, '7K|');
                checkThrow(val1.isItInteger() && val2.isItInteger(), '7J|');
                let coords = `${val1.readAsString()},${val2.readAsString()}`;
                this.outside.SetProp(ref, 'loc', VpcValS(coords), undefined);
            }
        } else if (rule2) {
            throw makeVpcScriptErr("4{|we don't yet support show all cards.");
        } else {
            throw makeVpcScriptErr('4`|all choices null');
        }
    }

    /**
     * hide {button|field}
     */
    goHide(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let ref = this.findChildVelRef(vals, 'RuleObjectPart');
        let identifier = this.findChildStr(vals, 'Tokentkidentifier');
        if (ref) {
            this.outside.SetProp(ref, 'visible', VpcVal.False, undefined);
        } else if (identifier) {
            if (identifier === 'menubar') {
                this.outside.SetOption('fullScreen', true);
            } else {
                throw makeVpcScriptErr('4_|so far we only support hide menubar or hide cd btn 1');
            }
        } else {
            throw makeVpcScriptErr('4^|all choices null');
        }
    }

    /**
     * sort [lines|items|chars] of {container}
     */
    goSort(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let terms = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        let ascend = true;
        let sortType = SortType.Text;
        for (let i = 1; i < terms.length; i++) {
            if (terms[i] === 'ascending') {
                ascend = true;
            } else if (terms[i] === 'descending') {
                ascend = false;
            } else {
                sortType = getStrToEnum<SortType>(SortType, 'SortType or "ascending" or "descending"', terms[i]);
            }
        }

        let strChunktype = throwIfUndefined(this.findChildStr(vals, 'TokenTkcharorwordoritemorlineorplural'), '4]|');
        let chunktype = getStrToEnum<VpcChunkType>(VpcChunkType, 'VpcChunkType', strChunktype);
        let contRef = throwIfUndefined(
            this.findChildOther<RequestedContainerRef>('RequestedContainerRef', vals, 'RuleHContainer'),
            '4[|'
        );

        let cont = this.outside.ResolveContainerWritable(contRef);
        let itemDel = this.outside.GetItemDelim();
        ChunkResolution.applySort(cont, itemDel, chunktype, sortType, ascend);
    }

    /**
     * lock screen
     */
    goLock(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let terms = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        checkThrow(
            terms.length === 2 && terms[0] === 'lock' && terms[1] === 'screen',
            '7N|the only thing we currently support here is lock screen.'
        );

        this.outside.SetOption('screenLocked', true);
    }

    /**
     * unlock screen
     */
    goUnlock(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let terms = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        checkThrow(
            terms.length === 2 && terms[0] === 'unlock' && terms[1] === 'screen',
            '7I|the only thing we currently support here is unlock screen.'
        );

        this.outside.SetOption('screenLocked', false);
    }

    /**
     * visual effect
     */
    goVisual(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        throw makeVpcScriptErr("4@|the 'visual' command is not yet implemented.");
    }

    /**
     * wait {number} [seconds|milliseconds|ms|ticks]
     * Pauses the script.
     */
    goWait(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: ValHolder<number>) {
        let args = this.getAllChildVpcVals(vals, 'RuleExpr', true);
        let number = args[0].readAsStrictNumeric();
        let unitRawOrdinal =
            vals.vals['TokenTkordinal'] && vals.vals['TokenTkordinal'].length
                ? vals.vals['TokenTkordinal'][0]
                : undefined;
        let unitRawIdentifier =
            vals.vals['TokenTkidentifier'] && vals.vals['TokenTkidentifier'].length > 1
                ? vals.vals['TokenTkidentifier'][1]
                : undefined;
        let unitRaw = throwIfUndefined(unitRawOrdinal || unitRawIdentifier, 'unitRawOrdinal || unitRawIdentifier');
        checkThrow(isString(unitRaw), '');

        /* because there is only 1 script execution thread, don't need to assign a unique id. */
        let asyncOpId = 'singleThreadAsyncOpId';

        /* getStrToEnum will conveniently show a list of valid alternatives on error */
        let multiply = getStrToEnum<MapTermToMilliseconds>(MapTermToMilliseconds, '', unitRaw as string);
        let milliseconds = Math.max(0, Math.round(number * multiply));
        VpcScriptExecAsync.goAsyncWait(this.pendingOps, blocked, asyncOpId, milliseconds);
    }
}
