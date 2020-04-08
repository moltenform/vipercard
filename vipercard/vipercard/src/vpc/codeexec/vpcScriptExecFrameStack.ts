
/* auto */ import { VarCollection } from './../vpcutils/vpcVarCollection';
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { CodeLimits, RememberHistory, VpcScriptMessage, VpcScriptRuntimeError } from './../vpcutils/vpcUtils';
/* auto */ import { VpcParsed } from './../codeparse/vpcTokens';
/* auto */ import { ExecuteStatement } from './vpcScriptExecStatement';
/* auto */ import { VpcExecGoCardHelpers } from './vpcScriptExecGoCard';
/* auto */ import { VpcExecFrame } from './vpcScriptExecFrame';
/* auto */ import { VpcPendingAsyncOps } from './vpcScriptExecAsync';
/* auto */ import { VpcCacheParsedAST } from './vpcScriptCaches';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { LoopLimit, VpcCodeLine, VpcCodeLineReference, VpcLineCategory } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { VpcTool } from './../vpcutils/vpcEnums';
/* auto */ import { CheckReservedWords } from './../codepreparse/vpcCheckReserved';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { VpcElBase } from './../vel/velBase';
/* auto */ import { O, assertTrue, assertTrueWarn, bool, checkThrow, makeVpcScriptErr, throwIfUndefined } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, ValHolder, assertEq, assertEqWarn, checkThrowEq, getEnumToStrOrUnknown, last, slength } from './../../ui512/utils/util512';
/* auto */ import { UI512PaintDispatch } from './../../ui512/draw/ui512DrawPaintDispatch';
import { VpcParsedCodeCollection } from '../codepreparse/vpcTopPreparse';

/**
 * frame stack for the vipercard code-interpreter
 * like C, entering a function pushes a frame onto this stack,
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
        public cardHistory:RememberHistory,
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
    findHandlerToExec() {
        let handler = this.findHandlerUpwards(this.originalMsg.targetId, this.originalMsg.msgName, false);
        if (handler) {
            this.pushStackFrame(this.originalMsg.msgName, this.originalMsg, handler[0], handler[1]);
        }
    }

    /**
     * push frame onto the stack so that it is ready to execute
     */
    protected pushStackFrame(
        msgName: string,
        msg: VpcScriptMessage,
        code: VpcParsedCodeCollection,
        codeLine: VpcCodeLineReference,
        meId: string
    ) {
        checkThrowEq(VpcTool.Browse, this.outside.GetCurrentTool(true), 'JI|not browse tool?');
        let newFrame = new VpcExecFrame(msgName, msg, meId);
        newFrame.codeSection = code;
        this.validatedGoto(newFrame, codeLine, true);
        this.stack.push(newFrame);
        assertTrue(this.stack.length < CodeLimits.MaxCodeFrames, '5e|stack overflow... unbounded recursion?');
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
    runTimeslice(ms: number) {
        const howOftenToCheckElapsedTime = 4;
        if (!this.hasRunCode) {
            VpcExecFrameStack.staticPendingOps = new VpcPendingAsyncOps();
            this.execStatements.pendingOps = VpcExecFrameStack.staticPendingOps;
        }

        /* we should never have exited from more fns than we've entered. */
        assertTrue(this.stack.length >= 1 && this.stack[0] === undefined, '5f|popped too many off the stack');

        /* code will set this to true if we're blocked on an async op
        there's no sense in spin-waiting if the code says "wait 4 seconds" */
        let blocked = new ValHolder<number>(0);

        this.hasRunCode = true;
        let started = performance.now();
        let count = 0;
        while (this.stack.length > 1) {
            /* run one line of code */
            let isComplete = this.runOneLine(blocked);
            if (isComplete || blocked.val) {
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
    protected runOneLine(blocked: ValHolder<number>): boolean {
        let curFrame = last(this.stack);
        if (curFrame) {
            let curLine = curFrame.codeSection.lines[curFrame.getOffset()];
            checkThrow(
                curLine,
                `5c|no code defined at offset ${curFrame.getOffset()} of element ${curFrame.codeSection.ownerId}`
            );
            try {
                assertEq(curLine.offset, curFrame.getOffset(), '5d|');
                this.runOneLineImpl(curFrame, curLine, blocked);
                return false;
            } catch (e) {
                /* add error context and re-throw */
                let scriptErr = new VpcScriptRuntimeError();
                scriptErr.details = e.message;
                scriptErr.lineNumber = curLine.firstToken.startLine || 0;
                scriptErr.velId = curFrame.codeSection.ownerId;
                scriptErr.lineData = curLine;
                scriptErr.isScriptException = e.isVpcError;
                scriptErr.isExternalException = !e.isUi512Error;
                scriptErr.e = e;
                e.vpcScriptErr = scriptErr;
                throw e;
            }
        } else {
            /* there's no current stack, looks like we are done! */
            return true;
        }
    }

    /**
     * run one line of code
     */
    protected runOneLineImpl(curFrame: VpcExecFrame, curLine: VpcCodeLine, blocked: ValHolder<number>) {
        let parsed = this.cacheParsedCST.getParsedLine(curLine);
        let methodName = 'visit' + getEnumToStrOrUnknown(VpcLineCategory, curLine.ctg);
        Util512.callAsMethodOnClass('VpcExecFrameStack', this, methodName, [curFrame, curLine, parsed, blocked], false);

        /* make sure we're not stuck on the same line again */
        if (last(this.stack) === curFrame && !blocked.val) {
            checkThrow(curFrame.getOffset() !== curLine.offset, '7x|stuck on the same line', curLine.offset.toString());
        }
    }

    /**
     * we were told to evaluate an expression, return the value
     */
    protected evalRequestedExpression(parsed: VpcParsed, curLine: VpcCodeLine): VpcVal {
        assertTrue(curLine.ctg !== VpcLineCategory.Statement, '5b|', curLine.ctg);
        assertTrue(
            this.cacheParsedCST.parser.RuleTopLevelRequestEval === curLine.getParseRule(),
            '5a|expected eval parse rule'
        );

        let visited = this.evalGeneralVisit(parsed, curLine) as IntermedMapOfIntermedVals;
        checkThrow(visited && visited.isIntermedMapOfIntermedVals, '7w|evalRequestedExpression wrong type');
        checkThrow(
            visited.vals.RuleExpr && visited.vals.RuleExpr[0],
            '7v|evalRequestedExpression no result of RuleExpr'
        );

        let ret = visited.vals.RuleExpr[0] as VpcVal;
        checkThrow(ret && ret.isVpcVal, '7u|evalRequestedExpression expected a number, string, or bool.');
        return ret;
    }

    /**
     * run the visitor, to get a value from the CST
     */
    protected evalGeneralVisit(parsed: VpcParsed, curLine: VpcCodeLine): VpcIntermedValBase {
        if (parsed !== null && parsed !== undefined) {
            let visited = this.cacheParsedCST.visitor.visit(parsed);
            checkThrow(visited.isIntermedValBase, '7t|did not get isIntermedValBase when running', curLine.allImages);
            return visited;
        } else {
            throw makeVpcScriptErr('5Z|no expression was parsed');
        }
    }

    /**
     * look in the message hierarchy for a handler
     */
    findHandlerUpwards(id: string, handlername: string, onlyParents: boolean) {
        assertTrueWarn(id.match(/^[0-9]+$/), '')
        let loop = new LoopLimit(CodeLimits.MaxObjectsInMsgChain, 'maxObjectsInMsgChain');
        let vel = this.outside.FindVelById(id);
        let firstTimeInLoop = true
        while (loop.next()) {
            if (!vel) {
                return undefined
            }

            if (!onlyParents || !firstTimeInLoop) {
                let found = this.code.findHandlerInScript(vel.id, vel.getS('script'), handlername);
                if (found) {
                    return found
                }
            }

            vel = this.outside.FindVelById(vel.parentId)
            firstTimeInLoop = false
        }
    }

    /**
     * run a builtin command
     */
    visitStatement(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed, blocked: ValHolder<number>) {
        let visited = parsed ? this.evalGeneralVisit(parsed, curLine) : VpcVal.Empty;
        this.execStatements.go(curLine, visited, blocked);
        if (blocked.val === 0) {
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
     * start a handler
     */
    visitHandlerStart(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        /* confirm handler name */
        assertTrue(curLine.excerptToParse.length > 1, '5X|wrong readyToParse length');
        assertEqWarn(curFrame.handlerName.toLowerCase(), curLine.excerptToParse[1].image.toLowerCase(), '5W|');

        for (let i = 2; i < curLine.excerptToParse.length; i++) {
            /* set "params" values */
            let paramname = curLine.excerptToParse[i].image;
            let val = curFrame.args[i - 2] || VpcVal.Empty;
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
        /* in the rewriting stage we've added a "return" after this line, for simplicity */
        curFrame.next();
        let found = this.findHandlerUpwards(curFrame.meId, curFrame.handlerName, true);
        if (found) {
            this.pushStackFrame(curFrame.handlerName, curFrame.message, found[0], found[1]);
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
            throw makeVpcScriptErr(`5V|no branches stored in blockInfo`);
        }
    }

    /**
     * start an "if" block
     */
    visitIfStart(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        /* if blocks must start with "if" and end with an "end if" */
        let blockInfo = this.getBlockInfo(curLine, 2);
        let blockEnd = last(blockInfo);
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
            this.validatedGoto(curFrame, last(blockInfo));
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
        this.validatedGoto(curFrame, last(blockInfo));
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
     * run a "repeat while"
     */
    visitRepeatWhile(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        return this.repeatImpl(curFrame, curLine, parsed, false);
    }

    /**
     * run a "repeat until"
     */
    visitRepeatUntil(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        return this.repeatImpl(curFrame, curLine, parsed, true);
    }



    /**
     * from a line like myHandler x,y,z, retrieve the VpcVals (value of x y and z)
     */
    protected helpGetEvaledArgs(parsed: VpcParsed, curLine: VpcCodeLine): VpcVal[] {
        let evaluated = this.evalGeneralVisit(parsed, curLine) as IntermedMapOfIntermedVals;
        checkThrow(evaluated.isIntermedMapOfIntermedVals, '7o|expected IntermedMapOfIntermedVals');
        if (evaluated.vals['RuleExpr'] && evaluated.vals['RuleExpr'].length) {
            let ret = evaluated.vals['RuleExpr'] as VpcVal[];
            assertTrue(ret !== undefined, '5Q|expected RuleExpr');
            assertTrue(ret.every(v => v.isVpcVal), '5P|every arg must be a VpcVal');
            return ret;
        } else {
            return [];
        }
    }

    /**
     * run custom handler like doMyHandler
     */
    visitCallHandler(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        let newHandlerName = curLine.excerptToParse[1].image;
        let args = this.helpGetEvaledArgs(parsed, curLine);
        curFrame.next()
        this.callHandlerAndThrowIfNotExist(curFrame, args, curFrame.codeSection.ownerId, newHandlerName )
    }

    /**
     * call a handler
     */
    protected callHandlerAndThrowIfNotExist(curFrame: VpcExecFrame, args: VpcVal[], ownerId:string, handlerName:string) {
        /* reset the result, in case the callee doesn't return anything */
        curFrame.locals.set('$result', VpcVal.Empty);
        let found = this.findHandlerUpwards(ownerId, handlerName, false);
        if (found) {
            let newFrame = this.pushStackFrame(handlerName, curFrame.message, found[0], found[1]);
            newFrame.args = args;
            Util512.freezeRecurse(newFrame.args);
        } else {
            throw makeVpcScriptErr(`5O|tried to call ${handlerName} but no handler of this name found`);
        }
    }

    /**
     * 'send' has both an expression and a target object, so can't use the same old evalRequestedExpression
     */
    protected visitSendStatement(curLine: VpcCodeLine, parsed: VpcParsed):[VpcVal, VpcElBase] {
        assertTrue(
            this.cacheParsedCST.parser.RuleBuiltinCmdSend === curLine.getParseRule(),
            'expected "send" parse rule'
        );

        let visited = this.evalGeneralVisit(parsed, curLine) as IntermedMapOfIntermedVals;
        checkThrow(visited && visited.isIntermedMapOfIntermedVals, '7w|visitSendStatement wrong type');
        checkThrow(
            visited.vals.RuleExpr && visited.vals.RuleObject,
            'visitSendStatement expected both RuleExpr and RuleObject'
        );

        let val = visited.vals.RuleExpr[0] as VpcVal;
        checkThrow(val && val.isVpcVal, 'visitSendStatement expected a string.');

        let velRef = visited.vals.RuleObject[0] as RequestedVelRef;
        checkThrow(velRef && velRef.isRequestedVelRef, 'visitSendStatement expected vel reference.');
        let vel = throwIfUndefined(this.outside.ResolveVelRef(velRef)[0], "target of 'send' not found")

        return [val, vel]
    }

    /**
     * run dynamically-built code like 'send "answer 1+1" to cd btn "myBtn"'
    
    confirmed that when sending this, "the target" and "me" are both set to the receipient of the event
     */
    visitCallDynamic(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        let me = last(this.stack)!.codeSection.ownerId
        let lineNumber = curLine.excerptToParse[1].startLine || 0
        let [val, vel] = this.visitSendStatement(curLine, parsed)
        let codeToCompile = val.readAsString()
        curFrame.next()

        /* for compatibility with original product, if there's no return statement,
        return the last result that was computed. see the myCompute example in the docs. */
        codeToCompile += '\n' + 'return the result'

        /* build a new temporary handler, then call it.
        a bit "interesting" to be potentially modifying the same script we are currently running,
        but because we are appending only, and because VpcExecFrame has its own copy of the code anyways,
        this should be safe. */
        let prevCode = vel.getS('script')
        let newHandlerName = VpcExecFrame.appendTemporaryDynamicCodeToScript(this.outside, vel.id, codeToCompile, me, lineNumber)
        this.callHandlerAndThrowIfNotExist(curFrame, [], vel.id, newHandlerName)
    }

    /**
     * one of the goCardImpl pieces that result from a 'go next' call
     */
    visitGoCardImpl(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        assertTrue(
            this.cacheParsedCST.parser.RuleBuiltinInternalVpcGoCardImpl === curLine.getParseRule(),
            'expected "goCardImpl" parse rule'
        );

        let visited = this.evalGeneralVisit(parsed, curLine) as IntermedMapOfIntermedVals;
        checkThrow(visited && visited.isIntermedMapOfIntermedVals, '7w|visitSendStatement wrong type');
        curFrame.next();

        let helper = new VpcExecGoCardHelpers(this.outside, this.globals, curFrame.locals, this.cardHistory)
        let [sendMsg, sendMsgTarget] = helper.execGoCard(curLine, visited)
        if (slength(sendMsg)) {
            this.callHandlerAndThrowIfNotExist(curFrame, [], sendMsgTarget, sendMsg)
        }
    }
}
