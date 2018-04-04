
/* auto */ import { isRelease } from '../../appsettings.js';
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, checkThrowEq, getStrToEnum, isString, refparam } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { MapTermToMilliseconds, OrdinalOrPosition, RequestedChunkTextPreposition, RequestedChunkType, SortStyle, VpcElType, VpcTool, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValBool, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcval.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcchunk.js';
/* auto */ import { VpcAudio } from '../../vpc/vpcutils/vpcaudio.js';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from '../../vpc/vpcutils/vpcoutsideclasses.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velbase.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velcard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velbg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velstack.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/vpcoutsideinterfaces.js';
/* auto */ import { isTkType, tks } from '../../vpc/codeparse/vpctokens.js';
/* auto */ import { fromNickname } from '../../vpc/codeparse/vpcvisitor.js';
/* auto */ import { VpcLineCategory } from '../../vpc/codepreparse/vpcpreparsecommon.js';
/* auto */ import { VpcCodeLine } from '../../vpc/codepreparse/vpccodeline.js';
/* auto */ import { ScriptAsyncOperations, VpcScriptExecAsync } from '../../vpc/codeexec/vpcscriptexecasync.js';

export class ExecuteStatements {
    outside: OutsideWorldReadWrite;
    cbAnswerMsg: O<
        (prompt: string, fnOnResult: (n: number) => void, choice1: string, choice2: string, choice3: string) => void
    >;
    cbAskMsg: O<(prompt: string, deftxt: string, fnOnResult: (ret: O<string>, n: number) => void) => void>;
    cbStopCodeRunning: O<() => void>;
    asyncOps: ScriptAsyncOperations;
    go(line: VpcCodeLine, visitResult: VpcIntermedValBase, blocked: refparam<number>) {
        checkThrowEq(VpcLineCategory.statement, line.ctg, '7h|not a statement');
        let firstToken = line.excerptToParse[0];
        checkThrow(isTkType(firstToken, tks.TokenTkidentifier), `7g|expect built-in statement`);
        let vals = visitResult as IntermedMapOfIntermedVals;
        checkThrow(
            vals.isIntermedMapOfIntermedVals,
            `7f|command ${firstToken.image} did not return IntermedMapOfIntermedVals`
        );
        Util512.callAsMethodOnClass('ExecuteStatements', this, 'go_' + firstToken.image, [line, vals, blocked], false);
    }

    go_add(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        this.go_math_alter(line, vals, (a: number, b: number) => a + b);
    }

    go_subtract(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        this.go_math_alter(line, vals, (a: number, b: number) => a - b);
    }

    go_multiply(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        this.go_math_alter(line, vals, (a: number, b: number) => a * b);
    }

    go_divide(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        this.go_math_alter(line, vals, (a: number, b: number) => a / b);
    }

    go_math_alter(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, fn: (a: number, b: number) => number) {
        let exprval = throwIfUndefined(this.findChildVal(vals, 'RuleLvl4Expression'), '5M|');
        let container = throwIfUndefined(
            this.findChildOther<RequestedContainerRef>('RequestedContainerRef', vals, 'RuleHContainer'),
            '5L|'
        );
        let fn_s = (s: string) => {
            let f1 = VpcValS(s).readAsStrictNumeric();
            let f2 = exprval.readAsStrictNumeric();
            let res = fn(f1, f2);
            return VpcValN(res).readAsString();
        };

        this.outside.ContainerModify(container, fn_s);
    }

    protected findChildMap(vals: IntermedMapOfIntermedVals, nm: string): O<IntermedMapOfIntermedVals> {
        let attempt1 = vals.vals[nm];
        if (attempt1) {
            let attempt = attempt1[0] as IntermedMapOfIntermedVals;
            checkThrowEq(1, attempt1.length, '7d|expected length 1');
            checkThrow(attempt.isIntermedMapOfIntermedVals, '7c|wrong type');
            return attempt;
        } else {
            return undefined;
        }
    }

    protected findChildVal(vals: IntermedMapOfIntermedVals, nm: string): O<VpcVal> {
        let attempt1 = vals.vals[nm];
        if (attempt1) {
            let attempt = attempt1[0] as VpcVal;
            checkThrowEq(1, attempt1.length, '7b|expected length 1');
            checkThrow(attempt.isVpcVal, '7a|wrong type');
            return attempt;
        } else {
            return undefined;
        }
    }

    protected findChildStr(vals: IntermedMapOfIntermedVals, nm: string): O<string> {
        let attempt1 = vals.vals[nm];
        if (attempt1) {
            let attempt = attempt1[0] as string;
            checkThrowEq(1, attempt1.length, '7Z|expected length 1');
            checkThrow(isString(attempt), '7Y|wrong type');
            return attempt;
        } else {
            return undefined;
        }
    }

    protected findChildVelRef(vals: IntermedMapOfIntermedVals, nm: string): O<RequestedVelRef> {
        let attempt1 = vals.vals[nm];
        if (attempt1) {
            let attempt = attempt1[0] as RequestedVelRef;
            checkThrowEq(1, attempt1.length, '7X|expected length 1');
            checkThrow(attempt.isRequestedVelRef, '7W|wrong type');
            return attempt;
        } else {
            return undefined;
        }
    }

    protected getResolveChildVel(vals: IntermedMapOfIntermedVals, nm: string): VpcElBase {
        let ref = throwIfUndefined(this.findChildVelRef(vals, nm), '5K|not found', nm);
        return throwIfUndefined(this.outside.ResolveElRef(ref), '5J|element not found');
    }

    protected findChildOther<T extends VpcIntermedValBase>(
        typeAsString: string,
        vals: IntermedMapOfIntermedVals,
        nm: string
    ): O<T> {
        let attempt1 = vals.vals[nm];
        if (attempt1) {
            let attempt = attempt1[0] as T;
            checkThrowEq(1, attempt1.length, '7V|expected length 1');
            checkThrow((attempt as any)['is' + typeAsString] === true, '7U|wrong type');
            return attempt;
        } else {
            return undefined;
        }
    }

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

    go_answer(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        // we'll call go_answer() many times.
        // first time it is called, opens the dialog
        // second through nth time it is called, does nothing because dialog still open, sets blocked=true
        // last time it is called, returns normally
        let nm = fromNickname('FACTOR');
        let argsVals = this.getAllChildVpcVals(vals, nm, true);
        let args = argsVals.map(item => item.readAsString());

        let asyncOpId = 'single_thread_asyncOpId';

        VpcScriptExecAsync.go_answer(
            this.asyncOps,
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

    go_ask(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        // we'll call go_ask() many times.
        // first time it is called, opens the dialog
        // second through nth time it is called, does nothing because dialog still open, sets blocked=true
        // last time it is called, returns normally

        let argsVals = this.getAllChildVpcVals(vals, 'RuleExpr', true);
        let args = argsVals.map(item => item.readAsString());
        let closureGetAsyncOps = this.asyncOps;

        let asyncOpId = 'single_thread_asyncOpId';
        VpcScriptExecAsync.go_ask(
            this.asyncOps,
            blocked,
            this.outside,
            this.cbAskMsg,
            this.cbStopCodeRunning,
            asyncOpId,
            args[0] || '',
            args[1] || ''
        );
    }

    go_beep(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        VpcAudio.beep();
    }

    go_play(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        let args = this.getAllChildVpcVals(vals, 'RuleExpr', true);
        let whichS = args[0].readAsString();
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
                VpcAudio.preload(whichS);
            } else {
                VpcAudio.play(whichS);
            }
        } catch (e) {
            if (isRelease) {
                console.error('audio encountered ' + e);
            } else {
                throw e;
            }
        }
    }

    go_choose(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        // note: this won't actually change the real tool, it's
        // used for setting up mimicking drawing with the click/drag commands
        let nm = fromNickname('FACTOR');
        let factor = throwIfUndefined(this.findChildVal(vals, nm), '5G|');

        let stl = factor.readAsString().replace(/ +/, '_');
        let tl = getStrToEnum<VpcTool>(VpcTool, 'VpcTool', stl);
        let ctg = getToolCategory(tl);
        if (
            ctg === VpcToolCtg.ctgShape ||
            ctg === VpcToolCtg.ctgSmear ||
            ctg === VpcToolCtg.ctgBucket ||
            ctg === VpcToolCtg.ctgCurve ||
            ctg === VpcToolCtg.ctgBrowse
        ) {
            this.outside.SetOption('mimicCurrentTool', tl);
        } else {
            throw makeVpcScriptErr(
                '5F|the choose command is now used for simulating drawing only, so it must be one of the paint tools like "pencil" or "brush" chosen'
            );
        }
    }

    go_click(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        return this.clickOrDrag(line, vals, 'at');
    }

    go_drag(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        return this.clickOrDrag(line, vals, 'from');
    }

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

    go_delete(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        if (vals.vals.RuleObjectPart && vals.vals.RuleObjectPart.length) {
            throw makeVpcScriptErr("5C|the 'delete' command is not yet supported for btns or flds.");
        } else {
            let contref = throwIfUndefined(
                this.findChildOther<RequestedContainerRef>('RequestedContainerRef', vals, 'RuleHSimpleContainer'),
                '5B|'
            );
            let chunk = throwIfUndefined(
                this.findChildOther<RequestedChunk>('RequestedChunk', vals, 'RuleHChunk'),
                '5A|'
            );

            contref.chunk = chunk;

            // it's not as simple as 'put "" into item 2 of x' because
            // delete item 2 of "a,b,c" should be "a,c" not "a,,c"
            checkThrow(
                chunk.type === RequestedChunkType.Chars,
                "7Q|not yet supported. 'delete char 1 of x' works but not 'delete item 1 of x'"
            );
            this.outside.ContainerWrite(contref, '', RequestedChunkTextPreposition.into);
        }
    }

    go_create(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        throw makeVpcScriptErr("the 'create' command is not yet supported.");
    }

    protected setabled(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, b: boolean) {
        let ref = throwIfUndefined(this.findChildVelRef(vals, 'RuleObjectBtn'), '59|');
        this.outside.SetProp(ref, 'enabled', VpcValBool(b), undefined);
    }

    go_enable(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        this.setabled(line, vals, true);
    }

    go_disable(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        this.setabled(line, vals, false);
    }

    go_get(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        let expr = throwIfUndefined(this.findChildVal(vals, 'RuleExpr'), '58|');
        this.outside.SetSpecialVar('it', expr);
    }

    go_go(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        let ref = this.findChildVelRef(vals, 'RuleNtDest');
        if (ref) {
            let vel = this.getResolveChildVel(vals, 'RuleNtDest');
            let velAsStack = vel as VpcElStack;
            let velAsBg = vel as VpcElBg;
            let velAsCard = vel as VpcElCard;
            if (velAsCard && velAsCard.isVpcElCard) {
                this.outside.GoCardRelative(OrdinalOrPosition.this, velAsCard.id);
            } else {
                let getstack = new RequestedVelRef(VpcElType.Stack);
                getstack.lookByRelative = OrdinalOrPosition.this;
                let stack = this.outside.ResolveElRef(getstack) as VpcElStack;
                checkThrow(stack && stack.isVpcElStack, '7P|');

                if (velAsStack && velAsStack.isVpcElStack) {
                    if (velAsStack.id !== stack.id) {
                        throw makeVpcScriptErr("57|we don't support going to other stacks");
                    } else {
                        // nothing to do, we're already on this stack
                    }
                } else if (velAsBg && velAsBg.isVpcElBg && velAsBg.cards.length) {
                    this.outside.GoCardRelative(OrdinalOrPosition.this, velAsBg.cards[0].id);
                } else {
                    throw makeVpcScriptErr('56|we only support going to a card or a bg');
                }
            }
        } else {
            let shp: string;
            if (vals.vals.RuleHOrdinal) {
                shp = vals.vals.RuleHOrdinal[0] as string;
            } else if (vals.vals.RuleHPosition) {
                shp = vals.vals.RuleHPosition[0] as string;
            } else {
                throw makeVpcScriptErr('55|all choices null');
            }

            checkThrow(isString(shp), '7O|');
            let hp = getStrToEnum<OrdinalOrPosition>(OrdinalOrPosition, 'OrdinalOrPosition', shp);
            this.outside.GoCardRelative(hp);
        }
    }

    go_put(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        let terms = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        checkThrow(
            terms.length === 2,
            "7M|we don't support 'put \"abc\"' to use the message box (missing into, before, or after)."
        );
        let prep = getStrToEnum<RequestedChunkTextPreposition>(
            RequestedChunkTextPreposition,
            'RequestedChunkTextPreposition',
            terms[1]
        );
        let val = throwIfUndefined(this.findChildVal(vals, 'RuleExpr'), '54|');
        let contref = throwIfUndefined(
            this.findChildOther<RequestedContainerRef>('RequestedContainerRef', vals, 'RuleHContainer'),
            '53|'
        );
        let cont = this.outside.ResolveContainerWritable(contref);
        let itemdel = this.outside.GetItemDelim();
        ChunkResolution.applyPut(cont, contref.chunk, itemdel, val.readAsString(), prep);
    }

    go_reset(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        throw makeVpcScriptErr("52|the 'reset' command is not yet implemented.");
    }

    go_set(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        let velRef = this.findChildVelRef(vals, 'RuleObject');
        let velRefFld = this.findChildVelRef(vals, 'RuleObjectFld');
        let velRefChunk = this.findChildOther<RequestedChunk>('RequestedChunk', vals, 'RuleHChunk');
        let propname = throwIfUndefined(this.findChildStr(vals, 'RuleAnyPropertyName'), '51|');

        // let's concat all of the values together into one string separated by commas
        // that way we'll support coordinates "1,2" and text styles "plain, bold"
        let strs: string[] = [];
        let newv = this.findChildMap(vals, 'RuleAnyPropertyVal');
        let nm = fromNickname('MAYBE_ALLOW_ARITH');
        let ar = newv ? newv.vals[nm] : undefined;
        if (ar && ar.length) {
            for (let item of ar as VpcVal[]) {
                assertTrue(item && item.isVpcVal, '50|every item must be a vpcval');
                strs.push(item.readAsString());
            }
        }

        checkThrow(strs.length > 0, '7L|could not find RuleAnyPropertyVal or its child', nm);
        let combined = VpcValS(strs.join(','));
        if (velRefChunk) {
            throwIfUndefined(velRefFld, '4~|');
            this.outside.SetProp(velRefFld, propname, combined, velRefChunk);
        } else {
            this.outside.SetProp(velRef, propname, combined, undefined);
        }
    }

    go_show(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        let strs = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        let rule1 = this.findChildMap(vals, 'RuleShow_1');
        let rule2 = this.findChildMap(vals, 'RuleShow_1');
        if (strs.length > 1) {
            if (strs[1] === 'menubar') {
                this.outside.SetOption('fullScreen', false);
            } else {
                throw makeVpcScriptErr(
                    '4}|so far we only support show menubar or show cd btn 1 or show cd btn 1 at x,y'
                );
            }
        } else if (rule1) {
            let ref = throwIfUndefined(this.findChildVelRef(rule1, 'RuleObjectPart'), '4||');
            this.outside.SetProp(ref, 'visible', VpcVal.True, undefined);
            let nmExpr = fromNickname('MAYBE_ALLOW_ARITH');
            if (rule1.vals[nmExpr]) {
                let e1 = rule1.vals[nmExpr][0] as VpcVal;
                let e2 = rule1.vals[nmExpr][1] as VpcVal;
                checkThrow(e1 && e1.isVpcVal && e2 && e2.isVpcVal, '7K|');
                checkThrow(e1.isItInteger() && e2.isItInteger(), '7J|');
                let coords = `${e1.readAsString()},${e2.readAsString()}`;
                this.outside.SetProp(ref, 'loc', VpcValS(coords), undefined);
            }
        } else if (rule2) {
            throw makeVpcScriptErr("4{|we don't yet support show all cards.");
        } else {
            throw makeVpcScriptErr('4`|all choices null');
        }
    }

    go_hide(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
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

    go_sort(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        let terms = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        let ascend = true;
        let sorttype = SortStyle.text;
        for (let i = 1; i < terms.length; i++) {
            if (terms[i] === 'ascending') {
                ascend = true;
            } else if (terms[i] === 'descending') {
                ascend = false;
            } else {
                sorttype = getStrToEnum<SortStyle>(SortStyle, 'SortStyle or "ascending" or "descending"', terms[i]);
            }
        }

        let schunktype = throwIfUndefined(this.findChildStr(vals, 'TokenTkcharorwordoritemorlineorplural'), '4]|');
        let chunktype = getStrToEnum<RequestedChunkType>(RequestedChunkType, 'RequestedChunkType', schunktype);
        let contref = throwIfUndefined(
            this.findChildOther<RequestedContainerRef>('RequestedContainerRef', vals, 'RuleHContainer'),
            '4[|'
        );
        let cont = this.outside.ResolveContainerWritable(contref);
        let itemdel = this.outside.GetItemDelim();
        ChunkResolution.applySort(cont, itemdel, chunktype, sorttype, ascend);
    }

    go_lock(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        let terms = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        checkThrow(
            terms.length === 2 && terms[0] === 'lock' && terms[1] === 'screen',
            '7N|the only thing we currently support here is lock screen.'
        );

        this.outside.SetOption('screenLocked', true);
    }

    go_unlock(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        let terms = this.getAllChildStrs(vals, 'TokenTkidentifier', true);
        checkThrow(
            terms.length === 2 && terms[0] === 'unlock' && terms[1] === 'screen',
            '7I|the only thing we currently support here is unlock screen.'
        );

        this.outside.SetOption('screenLocked', false);
    }

    go_visual(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        throw makeVpcScriptErr("4@|the 'visual' command is not yet implemented.");
    }

    go_wait(line: VpcCodeLine, vals: IntermedMapOfIntermedVals, blocked: refparam<number>) {
        let args = this.getAllChildVpcVals(vals, 'RuleExpr', true);
        let n = args[0].readAsStrictNumeric();
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

        let asyncOpId = 'single_thread_asyncOpId';

        // use an enum because we'll automatically show a list of valid alternatives on error
        let multiply = getStrToEnum<MapTermToMilliseconds>(MapTermToMilliseconds, '', unitRaw as string);
        let milliseconds = Math.max(0, Math.round(n * multiply));
        VpcScriptExecAsync.go_wait(this.asyncOps, blocked, asyncOpId, milliseconds);
    }
}
