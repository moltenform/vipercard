
/* auto */ import { getParsingObjects } from './../codeparse/vpcVisitor';
/* auto */ import { VarCollection } from './../vpcutils/vpcVarCollection';
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { CodeLimits, RememberHistory, VpcScriptMessage, VpcScriptMessageMsgBoxCode } from './../vpcutils/vpcUtils';
/* auto */ import { VpcParsedCodeCollection } from './../codepreparse/vpcTopPreparse';
/* auto */ import { VpcParsed, listOfAllBuiltinEventsInOriginalProduct, tks, tkstr } from './../codeparse/vpcTokens';
/* auto */ import { ExecuteStatement } from './vpcScriptExecStatement';
/* auto */ import { VpcExecFrame } from './vpcScriptExecFrame';
/* auto */ import { AsyncCodeOpState, VpcPendingAsyncOps } from './vpcScriptExecAsync';
/* auto */ import { VpcCacheParsedAST, VpcCacheParsedCST } from './vpcScriptCaches';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcCodeLine, VpcCodeLineReference, VpcCurrentScriptStage, VpcLineCategory } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { VpcBuiltinMsg, VpcErrStage, VpcTool, checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { CheckReservedWords } from './../codepreparse/vpcCheckReserved';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { VpcElBase } from './../vel/velBase';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, ensureDefined } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { Util512, ValHolder, arLast, assertEq, assertWarnEq, getEnumToStrOrFallback, getStrToEnum, lastIfThere, slength } from './../../ui512/utils/util512';
/* auto */ import { UI512PaintDispatch } from './../../ui512/draw/ui512DrawPaintDispatch';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * messages and our support for them
 *
 *
 *
 * let's support, for now,
 *      openStack(already implemented) idle(already implemented) keydown(already implemented)
 *      mouse ones(already implemented)
 *      deleteBackground, deleteButton, deleteCard, deleteField
 *      newBackground, newButton, newCard, newField, openBackground, openCard
 *      closeBackground, closeCard
 *
 * Orders: verified in product.
 * startup: startup, openStack, openBackground, openCard
 * new bg: closecard, closebg, *, newbg, newcard, openbg, opencard
 * new card: closecard, *, newcard, opencard
 * delete bg: closecard, closebg, deletecard, deletebg, *, [ (openbg), opencard ]
 * delete cd: closecd, (closebg), deletecard (deletebg),* [ (openbg), opencard ]
 * move cd: closeorexitfield, closecd, closebg, *, openbg, opencard
 * cut card: let's not support this
 * paste card: closecard newcard opencard (it's different if pasting into a
 * newbg, but unclear how that is possible)
 *
 */

/**
 * frame stack for the vipercard code-interpreter
 * entering a function pushes a frame onto this stack,
 * returning from a function pops a frame from this stack
 */
export class VpcExecFrameStack {
    stack: O<VpcExecFrame>[] = [undefined];
    constructor(
        protected outside: OutsideWorldReadWrite,
        protected cacheParsedCST: VpcCacheParsedCST,
        protected cacheParsedAST: VpcCacheParsedAST,
        protected execStatements: ExecuteStatement,
        public constants: VarCollection,
        public globals: VarCollection,
        public cardHistory: RememberHistory,
        public check: CheckReservedWords,
        public originalMsg: VpcScriptMessage
    ) {
        this.execStatements.pendingOps = VpcExecFrameStack.staticPendingOps;
    }

    /* if you are drawing paint on the screen with a script,
    we cache the commands sent to the screen to coalesce later for better performance */
    paintQueue: UI512PaintDispatch[] = [];

    /* is this a completely new framestack? */
    hasRunCode = false;

    /* keep track of state for an async script action (like "wait 4 seconds") */
    static staticPendingOps = new VpcPendingAsyncOps();

    /**
     * send a message, like "on mouseUp", and see if anything in the message hierarchy responds
     * if something responds, push it onto the stack so that it's ready to execute
     */
    getHandlerToExecOrThrow() {
        let chain = VpcExecFrame.getMessageChain(this.originalMsg.targetId, undefined, this.outside);
        if (this.originalMsg instanceof VpcScriptMessageMsgBoxCode) {
            return this.startHandlerMsgBox(this.originalMsg);
        }

        let found = this.getHandlerUpwardsOrThrow(this.originalMsg.targetId, chain, this.originalMsg.msgName, false);
        if (found) {
            let [ast, lineRef, vel] = found;
            this.pushStackFrame(this.originalMsg.msgName, this.originalMsg, ast, lineRef, vel.id, vel.parentId, undefined);
        }
    }

    /**
     * start for the message box
     */
    startHandlerMsgBox(obj: VpcScriptMessageMsgBoxCode) {
        let meId = this.outside.GetCurrentCardId();
        let statedParentId = this.outside.GetCurrentCardId();
        let targetId = this.outside.GetCurrentCardId();
        let codeToCompile = obj.msgBoxCodeBody;
        if (obj.addIntentionalError) {
            codeToCompile += '\n' + VpcScriptMessageMsgBoxCode.markIntentionalErr;
        }

        let dynamicCodeOrigin:[string, number] = ['messagebox', 0]
        let [[ast, lineRef], newHandlerName] = this.visitCallDynamicHelper(codeToCompile, meId, statedParentId, targetId);
        this.pushStackFrame(newHandlerName, obj, ast, lineRef, meId, statedParentId, dynamicCodeOrigin);
    }

    /**
     * push frame onto the stack so that it is ready to execute
     */
    protected pushStackFrame(
        msgName: string,
        msg: VpcScriptMessage,
        code: VpcParsedCodeCollection,
        codeLine: VpcCodeLineReference,
        meId: string,
        statedParentId: O<string>,
        dynamicCodeOrigin: O<[string, number]>
    ) {
        checkThrowEq(VpcTool.Browse, this.outside.GetCurrentTool(true), 'JI|not browse tool?');
        let newFrame = new VpcExecFrame(msgName, msg, meId, statedParentId, dynamicCodeOrigin, this.outside);
        newFrame.codeSection = code;
        this.validatedGoto(newFrame, codeLine, true);
        this.stack.push(newFrame);
        assertTrue(this.stack.length < CodeLimits.MaxCodeFrames, '5e|stack overflow... perhaps unbounded recursion?');
        return newFrame;
    }

    /**
     * when jumping to a line, ensure the expected line id matches line line we get.
     */
    protected validatedGoto(frame: VpcExecFrame, ref: VpcCodeLineReference, okToStartHandler?: boolean) {
        frame.jumpToOffset(ref.offset, okToStartHandler);
        assertEq(ref.lineId, frame.codeSection.lines[frame.getOffset()].lineId, '5h|');
        assertEq(ref.offset, frame.codeSection.lines[frame.getOffset()].offset, '5g|');
    }

    /**
     * continue running code until _ms_ milliseconds have passed
     */
    runTimesliceOrThrow(ms: number) {
        const howOftenToCheckElapsedTime = 4;
        if (!this.hasRunCode) {
            VpcExecFrameStack.staticPendingOps = new VpcPendingAsyncOps();
            this.execStatements.pendingOps = VpcExecFrameStack.staticPendingOps;
        }

        /* we should never have exited from more fns than we've entered. */
        assertTrue(this.stack.length >= 1 && this.stack[0] === undefined, '5f|popped too many off the stack');

        /* code will set this to true if we're blocked on an async op
        there's no sense in spin-waiting if the code says "wait 4 seconds" */
        let blocked = new ValHolder<AsyncCodeOpState>(AsyncCodeOpState.AllowNext);

        this.hasRunCode = true;
        let started = performance.now();
        let count = 0;
        while (this.stack.length > 1) {
            /* run one line of code */
            let isComplete = this.runOneLineOrThrow(blocked);
            if (isComplete || blocked.val !== AsyncCodeOpState.AllowNext) {
                break;
            }

            count += 1;
            if (count > howOftenToCheckElapsedTime) {
                /* see if our timeslice has expired */
                count = 0;
                let now = performance.now();
                if (now - started >= ms) {
                    break;
                }
            }
        }

        if (!this.outside.GetOptionB('screenLocked') || this.stack.length <= 1) {
            /* apply paint changes all in one swoop, for better perf */
            this.outside.CommitSimulatedClicks(this.paintQueue);
            this.paintQueue = [];
        }
    }

    /**
     * run one line of code, and catch exceptions
     */
    protected runOneLineOrThrow(blocked: ValHolder<AsyncCodeOpState>): boolean {
        let curFrame = lastIfThere(this.stack);
        if (curFrame) {
            let curLine = curFrame.codeSection.lines[curFrame.getOffset()];
            checkThrow(curLine, `5c|no code defined at offset ${curFrame.getOffset()} of element ${curFrame.meId}`);
            assertEq(curLine.offset, curFrame.getOffset(), '5d|');
            VpcCurrentScriptStage.latestSrcLineSeen = curLine.firstToken.startLine;
            VpcCurrentScriptStage.latestDestLineSeen = curLine;
            VpcCurrentScriptStage.origClass = undefined;
            VpcCurrentScriptStage.latestVelID = curFrame.meId;
            VpcCurrentScriptStage.dynamicCodeOrigin = curFrame.dynamicCodeOrigin
            this.runOneLineOrThrowImpl(curFrame, curLine, blocked);
            return false;
        } else {
            /* there's no current stack, looks like we are done! */
            return true;
        }
    }

    /**
     * run one line of code
     */
    protected runOneLineOrThrowImpl(curFrame: VpcExecFrame, curLine: VpcCodeLine, blocked: ValHolder<AsyncCodeOpState>) {
        VpcCurrentScriptStage.currentStage = VpcErrStage.Parse;
        let parsed = this.cacheParsedCST.getParsedLine(curLine);

        VpcCurrentScriptStage.currentStage = VpcErrStage.SyntaxStep;
        let methodName = 'visit' + getEnumToStrOrFallback(VpcLineCategory, curLine.ctg);
        Util512.callAsMethodOnClass('VpcExecFrameStack', this, methodName, [curFrame, curLine, parsed, blocked], false);

        /* make sure we're not stuck on the same line again */
        if (arLast(this.stack) === curFrame && blocked.val === AsyncCodeOpState.AllowNext) {
            checkThrow(curFrame.getOffset() !== curLine.offset, '7x|stuck on the same line', curLine.offset.toString());
        }
    }

    /**
     * we were told to evaluate an expression, return the value
     */
    protected evalRequestedExpression(parsed: VpcParsed, curLine: VpcCodeLine): VpcVal {
        VpcCurrentScriptStage.currentStage = VpcErrStage.Visit;
        VpcCurrentScriptStage.origClass = undefined;
        assertTrue(curLine.ctg !== VpcLineCategory.Statement, '5b|', curLine.ctg);
        assertTrue(
            this.cacheParsedCST.parser.RuleInternalCmdRequestEval === curLine.getParseRule(),
            '5a|expected eval parse rule'
        );

        VpcCurrentScriptStage.origClass = 'evalGeneralVisit';
        let visited = this.evalGeneralVisit(parsed, curLine) as IntermedMapOfIntermedVals;
        VpcCurrentScriptStage.origClass = undefined;
        checkThrow(visited instanceof IntermedMapOfIntermedVals, '7w|evalRequestedExpression wrong type');
        checkThrow(visited.vals.RuleExpr && visited.vals.RuleExpr[0], '7v|evalRequestedExpression no result of RuleExpr');

        let ret = visited.vals.RuleExpr[0] as VpcVal;
        checkThrow(ret instanceof VpcVal, '7u|evalRequestedExpression expected a number, string, or boolean.');
        VpcCurrentScriptStage.currentStage = VpcErrStage.SyntaxStep;
        return ret;
    }

    /**
     * run the visitor, to get a value from the CST
     */
    protected evalGeneralVisit(parsed: VpcParsed, curLine: VpcCodeLine): VpcIntermedValBase {
        if (parsed !== null && parsed !== undefined) {
            let visited = getParsingObjects()[2].visit(parsed);
            checkThrow(visited instanceof VpcIntermedValBase, '7t|did not get IntermedValBase when running', curLine.allImages);
            return visited;
        } else {
            checkThrow(false, '5Z|no expression was parsed');
        }
    }

    /**
     * look in the message hierarchy for a handler
     * don't stop iterating if an object is missing!
     */
    getHandlerUpwardsOrThrow(
        velIdStart: string,
        chain: string[],
        handlername: string,
        onlyParents: boolean
    ): O<[VpcParsedCodeCollection, VpcCodeLineReference, VpcElBase]> {
        for (let velId of chain) {
            if (onlyParents && velId === velIdStart) {
                continue;
            }

            let v = this.outside.FindVelById(velId);
            if (v) {
                let [codeColl, lineRef] = this.cacheParsedAST.getHandlerOrThrow(v.getS('script'), handlername, v.id);
                if (codeColl && lineRef) {
                    return [codeColl, lineRef, v];
                }
            }
        }

        return undefined;
    }

    /**
     * run a builtin command
     */
    visitStatement(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed, blocked: ValHolder<AsyncCodeOpState>) {
        VpcCurrentScriptStage.currentStage = VpcErrStage.Execute;
        let visited = parsed ? this.evalGeneralVisit(parsed, curLine) : VpcVal.Empty;
        VpcCurrentScriptStage.currentStage = VpcErrStage.Execute;
        this.execStatements.go(curLine, visited, blocked);
        if (blocked.val === AsyncCodeOpState.AllowNext) {
            curFrame.next();
        }
    }

    /**
     * declare a global
     */
    visitDeclareGlobal(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        for (let i = 0; i < curLine.excerptToParse.length; i++) {
            let varName = curLine.excerptToParse[i].image;
            checkThrow(varName !== 'it' && this.check.okLocalVar(varName), '7s|reserved word', varName);
            curFrame.declaredGlobals[varName] = true;
            if (!this.outside.IsVarDefined(varName)) {
                /* not-yet-used globals default to "" */
                this.outside.SetVarContents(varName, VpcValS(''));
            }
        }

        curFrame.next();
    }

    /**
     * beginning of a handler, like "on mouseup"
     */
    visitHandlerStart(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        /* confirm handler name */
        assertTrue(curLine.excerptToParse.length > 1, '5X|wrong readyToParse length');
        assertWarnEq(curFrame.handlerName.toLowerCase(), curLine.excerptToParse[1].image.toLowerCase(), '5W|');

        for (let i = 2; i < curLine.excerptToParse.length; i++) {
            /* set "params" values */
            let paramname = curLine.excerptToParse[i].image;
            let val = curFrame.args[i - 2] ?? VpcVal.Empty;
            curFrame.locals.set(paramname, val);
        }

        curFrame.next();
    }

    /**
     * end a handler
     */
    visitHandlerEnd(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        this.stack.pop();
    }

    /**
     * end all handlers
     */
    visitProductExit(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        while (this.stack.length > 1) {
            this.stack.pop();
        }
    }

    /**
     * exit a handler
     */
    visitHandlerExit(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        /* we've validated curLine.readyToParse[1] in the BranchProcessing class */
        this.stack.pop();
    }

    /**
     * "pass" the message up the chain
     */
    visitHandlerPass(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        /* we've validated curLine.readyToParse[1] in the BranchProcessing class */
        /* in rewriting we've added a "return" after this line so we don't need to pop a frame */
        curFrame.next();
        let found = this.getHandlerUpwardsOrThrow(curFrame.meId, curFrame.messageChain, curFrame.handlerName, true);
        if (found) {
            let [ast, lineRef, vel] = found;
            this.pushStackFrame(curFrame.handlerName, curFrame.message, ast, lineRef, vel.id, vel.parentId, undefined);
        }
    }

    /**
     * return an expression, place results into the local variable "result"
     */
    visitReturnExpr(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        let val = this.evalRequestedExpression(parsed, curLine);

        /* set the result as a local variable in the frame beneath */
        let frameBeneath = this.stack[this.stack.length - 2];
        if (frameBeneath !== undefined) {
            frameBeneath.locals.set('$result', val);
        }

        this.stack.pop();
    }

    /**
     * get block information (e.g. branch offsets)
     */
    protected getBlockInfo(curLine: VpcCodeLine, nAtLeast: number): VpcCodeLineReference[] {
        if (curLine.blockInfo && curLine.blockInfo.length >= nAtLeast) {
            return curLine.blockInfo;
        } else {
            checkThrow(false, `5V|no branches stored in blockInfo`);
        }
    }

    /**
     * start an "if" block
     */
    visitIfStart(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        /* if blocks must start with "if" and end with an "end if" */
        let blockInfo = this.getBlockInfo(curLine, 2);
        let blockEnd = arLast(blockInfo);
        assertEq(curLine.offset, blockInfo[0].offset, '5U|');
        assertEq(curLine.lineId, blockInfo[0].lineId, '5T|');
        assertEq(VpcLineCategory.IfEnd, curFrame.codeSection.lines[blockEnd.offset].ctg, '5S|');

        /* mark all of the child branches as untried. */
        for (let i = 0; i < blockInfo.length; i++) {
            curFrame.offsetsMarked[blockInfo[i].offset] = false;
            assertEq(blockInfo[i].lineId, curFrame.codeSection.lines[blockInfo[i].offset].lineId, '5R|');
        }

        let evaluated = this.evalRequestedExpression(parsed, curLine);
        let got = evaluated.readAsStrictBoolean();
        if (got) {
            /* enter this branch */
            curFrame.offsetsMarked[blockInfo[0].offset] = true;
            curFrame.next();
        } else {
            /* skip to the next */
            this.validatedGoto(curFrame, blockInfo[1]);
        }
    }

    /**
     * start an "else"
     * use offsetsMarked to record where we've been
     */
    visitIfElsePlain(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        let blockInfo = this.getBlockInfo(curLine, 3);
        let anyTaken = blockInfo.some(ln => curFrame.offsetsMarked[ln.offset]);
        if (anyTaken) {
            /* we've already taken a branch - skip to one past the end of the block */
            this.validatedGoto(curFrame, arLast(blockInfo));
            curFrame.next();
        } else {
            /* enter the branch */
            curFrame.offsetsMarked[curLine.offset] = true;
            curFrame.next();
        }
    }

    /**
     * run an "end if"
     */
    visitIfEnd(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        curFrame.next();
    }

    /**
     * run an "exit repeat"
     */
    visitRepeatExit(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        /* advance to one line past the end of the loop */
        let blockInfo = this.getBlockInfo(curLine, 2);
        this.validatedGoto(curFrame, arLast(blockInfo));
        curFrame.next();
    }

    /**
     * run an "end repeat"
     */
    visitRepeatEnd(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        /* go back to the top of the loop */
        let blockInfo = this.getBlockInfo(curLine, 2);
        this.validatedGoto(curFrame, blockInfo[0]);
    }

    /**
     * run a "next repeat"
     */
    visitRepeatNext(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        return this.visitRepeatEnd(curFrame, curLine, parsed);
    }

    /**
     * run a "repeat"
     */
    visitRepeatForever(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        curFrame.next();
    }

    /**
     * from a line like myHandler x,y,z, retrieve the VpcVals (value of x y and z)
     */
    protected helpGetEvaledArgs(parsed: VpcParsed, curLine: VpcCodeLine): VpcVal[] {
        let evaluated = this.evalGeneralVisit(parsed, curLine) as IntermedMapOfIntermedVals;
        checkThrow(evaluated instanceof IntermedMapOfIntermedVals, '7o|expected IntermedMapOfIntermedVals');
        if (evaluated.vals[tkstr.RuleExpr] && evaluated.vals[tkstr.RuleExpr].length) {
            let ret = evaluated.vals[tkstr.RuleExpr] as VpcVal[];
            assertTrue(ret !== undefined, '5Q|expected RuleExpr');
            assertTrue(
                ret.every(v => v instanceof VpcVal),
                '5P|every arg must be a VpcVal'
            );
            return ret;
        } else {
            return [];
        }
    }

    /**
     * run custom handler like doMyHandler
     */
    visitCallHandler(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        let newHandlerName = curLine.excerptToParse[3].image;
        let args = this.helpGetEvaledArgs(parsed, curLine);
        curFrame.next();
        this.callHandlerAndThrowIfNotExist(curFrame, args, newHandlerName);
    }

    /**
     * call a handler
     */
    protected callHandlerAndThrowIfNotExist(curFrame: VpcExecFrame, args: VpcVal[], handlerName: string) {
        /* reset the result, in case the callee doesn't return anything */
        curFrame.locals.set('$result', VpcVal.Empty);
        let found = this.getHandlerUpwardsOrThrow(curFrame.meId, curFrame.messageChain, handlerName, false);
        if (found) {
            let [ast, lineRef, vel] = found;
            let newFrame = this.pushStackFrame(handlerName, curFrame.message, ast, lineRef, vel.id, vel.parentId, undefined);
            newFrame.args = args;
            Util512.freezeRecurse(newFrame.args);
        } else {
            if (listOfAllBuiltinEventsInOriginalProduct[handlerName.toLowerCase()]) {
                /* it's fine, we shouldn't throw in this case.
                send "openCard" to cd 3 should never be an error
                even if there's no openCard handler.
                same effect has putting empty handlers in the standardlib. */
            } else {
                checkThrow(false, `5O|tried to call ${handlerName} but no handler of this name found`);
            }
        }
    }

    /**
     * 'send' has both an expression and a target object,
     * so can't use the same old evalRequestedExpression
     */
    protected visitSendStatement(curLine: VpcCodeLine, parsed: VpcParsed): [VpcVal, VpcElBase] {
        assertTrue(this.cacheParsedCST.parser.RuleCmdSend === curLine.getParseRule(), 'expected "send" parse rule');

        let visited = this.evalGeneralVisit(parsed, curLine) as IntermedMapOfIntermedVals;
        checkThrow(visited instanceof IntermedMapOfIntermedVals, '7w|visitSendStatement wrong type');
        checkThrow(visited.vals.RuleExpr && visited.vals.RuleObject, 'visitSendStatement expected both RuleExpr and RuleObject');

        let val = visited.vals.RuleExpr[0] as VpcVal;
        checkThrow(val instanceof VpcVal, 'visitSendStatement expected a string.');
        let newLineAndLowercaseCode = '\n' + val.readAsString().toLowerCase();
        checkThrow(
            !newLineAndLowercaseCode.includes('\nfunction\n') && !newLineAndLowercaseCode.includes('\non\n'),
            `defining custom handlers in dynamic code
            is an interesting idea, but it's not supported yet.`
        );

        let velRef = visited.vals.RuleObject[0] as RequestedVelRef;
        checkThrow(velRef instanceof RequestedVelRef, 'visitSendStatement expected vel reference.');
        let vel = ensureDefined(this.outside.ResolveVelRef(velRef)[0], "target of 'send' not found");

        return [val, vel];
    }

    visitCallDynamic(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        let [val, velTarget] = this.visitSendStatement(curLine, parsed);
        let codeToCompile = val.readAsString();
        curFrame.next();
        let meId = velTarget.id;
        let statedParentId = velTarget.id;
        let dynamicCodeOrigin:[string, number] = [curFrame.meId, curLine.firstToken.startLine ?? 0]
        let [[ast, lineref], newHandlerName] = this.visitCallDynamicHelper(codeToCompile, meId, statedParentId, velTarget.id);
        this.callCodeAtATarget(
            curFrame,
            ast,
            lineref,
            newHandlerName,
            meId,
            statedParentId,
            velTarget.id,
            VpcBuiltinMsg.SendCode,
            dynamicCodeOrigin
        );
    }

    /**
     * run dynamically-built code like 'send "answer 1+1" to cd btn "myBtn"'
        confirmed in the product when running `send`, "the target" and "me"
        are both set to the receipient of the event
     */
    visitCallDynamicHelper(
        codeToCompile: string,
        meId: string,
        statedParentId: string,
        targetId: string
    ): [[VpcParsedCodeCollection, VpcCodeLineReference], string] {
        /* for compatibility with original product, if there's no return statement,
        return the last result that was computed. see the myCompute example in the docs. */
        /* build a new temporary handler, then call it.
        it's a bit inefficent because we might have to re-preparse everything in the file. */
        //~ let newHandlerName = 'vpcinternaltmpcode';
        //~ let code = `
        //~ on ${newHandlerName}
        //~ ${codeToCompile}
        //~ return the result
        //~ end ${newHandlerName}
        //~ `.replace(/\r\n/g, '\n');

        assertTrue(false, 'nyi');

        //~ let compiled = this.cacheParsedAST.findHandlerOrThrowIfVelScriptHasSyntaxError(code, newHandlerName, meId);
        //~ checkThrow(compiled, 'did not find the handler we just created');

        //~ return [compiled, newHandlerName];
    }

    private callCodeAtATarget(
        curFrame: VpcExecFrame,
        code: VpcParsedCodeCollection,
        linref: VpcCodeLineReference,
        newHandlerName: string,
        meId: string,
        statedParentId: string,
        velTargetId: string,
        msg: VpcBuiltinMsg,
        dynamicCodeOrigin:O<[string, number]>
    ) {
        curFrame.locals.set('$result', VpcVal.Empty);

        /* this is a bit interesting: we are setting the "me" and the "StatedParent" to the
        same object, so that calls in the new code can access the real object's code
        in the message chain. */
        let newScriptMessage = Util512.shallowClone<VpcScriptMessage>(curFrame.message);
        newScriptMessage.targetId = velTargetId;
        newScriptMessage.msgName = getEnumToStrOrFallback(VpcBuiltinMsg, msg);
        newScriptMessage.msg = msg;
        let newFrame = this.pushStackFrame(newHandlerName, newScriptMessage, code, linref, meId, statedParentId, dynamicCodeOrigin);
        newFrame.args = [];
    }

    /**
     * send a directive that can't be done solely in software
     */
    visitIsInternalvpcmessagesdirective(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        curFrame.next();
        checkThrowEq(3, curLine.excerptToParse.length, '');
        checkThrowEq(tks.tkStringLiteral, curLine.excerptToParse[1], '');
        checkThrowEq(tks.tkIdentifier, curLine.excerptToParse[2], '');
        let directive = curLine.excerptToParse[1].image.replace(/"/g, '').toLowerCase();
        let variable = curLine.excerptToParse[2].image;
        let sendMsg = '';
        let sendMsgTarget = '';
        if (directive === 'closeorexit') {
            let currentCardId = this.outside.GetOptionS('currentCardId');
            let seld = this.outside.GetSelectedField();
            if (seld && seld.parentId === currentCardId) {
                let fieldsRecent = this.outside.GetFieldsRecentlyEdited().val;
                if (fieldsRecent[seld.id]) {
                    sendMsg = 'closefield';
                    sendMsgTarget = seld.id;
                    fieldsRecent[seld.id] = false;
                } else {
                    sendMsg = 'exitfield';
                    sendMsgTarget = seld.id;
                }

                /* we're changing cards, so mark the other ones false too */
                this.outside.GetFieldsRecentlyEdited().val = {};
            }
        } else if (directive === 'gotocardsendnomessages') {
            let nextCardId = curFrame.locals.get(variable);
            checkThrow(nextCardId && nextCardId.isItInteger(), '');
            this.outside.SetCurCardNoOpenCardEvt(nextCardId.readAsString());
        } else {
            checkThrow(false, 'unknown directive', directive);
        }

        if (slength(sendMsg)) {
            let theMsg = getStrToEnum<VpcBuiltinMsg>(VpcBuiltinMsg, 'sending message directive', sendMsg);
            let found = this.getHandlerUpwardsOrThrow(
                this.originalMsg.targetId,
                curFrame.messageChain,
                this.originalMsg.msgName,
                false
            );
            if (found) {
                let [ast, lineRef, vel] = found;
                this.callCodeAtATarget(curFrame, ast, lineRef, sendMsg, vel.id, vel.parentId, sendMsgTarget, theMsg, undefined);
            }
        }
    }
}
