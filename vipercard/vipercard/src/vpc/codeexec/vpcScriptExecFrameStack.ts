
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr, assertTrueWarn } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, ValHolder, assertEq, assertEqWarn, checkThrowEq, getEnumToStrOrUnknown } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512PaintDispatch } from '../../ui512/draw/ui512DrawPaintDispatch.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { CodeLimits, VpcScriptMessage, VpcScriptRuntimeError } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VarCollection } from '../../vpc/vpcutils/vpcVarCollection.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { VpcParsed } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { LoopLimit, VpcLineCategory } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpcCheckReserved.js';
/* auto */ import { VpcCodeLine, VpcCodeLineReference } from '../../vpc/codepreparse/vpcCodeLine.js';
/* auto */ import { BranchProcessing } from '../../vpc/codepreparse/vpcBranchProcessing.js';
/* auto */ import { VpcAllCode, VpcCodeOfOneVel } from '../../vpc/codepreparse/vpcAllCode.js';
/* auto */ import { VpcCacheParsed } from '../../vpc/codeexec/vpcScriptCacheParsed.js';
/* auto */ import { VpcPendingAsyncOps } from '../../vpc/codeexec/vpcScriptExecAsync.js';
/* auto */ import { ExecuteStatement } from '../../vpc/codeexec/vpcScriptExecStatement.js';
/* auto */ import { VpcExecFrame } from '../../vpc/codeexec/vpcScriptExecFrame.js';

/**
 * frame stack for the vipercard code-interpreter
 * like C, entering a function pushes a frame onto this stack,
 * returning from a function pops a frame from this stack
 */
export class VpcExecFrameStack {
    stack: O<VpcExecFrame>[] = [undefined];
    constructor(
        protected code: VpcAllCode,
        protected outside: OutsideWorldReadWrite,
        protected cacheParsed: VpcCacheParsed,
        protected execStatements: ExecuteStatement,
        public constants: VarCollection,
        public globals: VarCollection,
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
        code: VpcCodeOfOneVel,
        codeLine: VpcCodeLineReference
    ) {
        checkThrowEq(VpcTool.Browse, this.outside.GetCurrentTool(true), 'JI|not browse tool?');
        let newFrame = new VpcExecFrame(msgName, msg);
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
        let curFrame = this.stack[this.stack.length - 1];
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
        let parsed = this.cacheParsed.getParsedLine(curLine);
        let methodName = 'visit' + getEnumToStrOrUnknown<VpcLineCategory>(VpcLineCategory, curLine.ctg);
        Util512.callAsMethodOnClass('VpcExecFrameStack', this, methodName, [curFrame, curLine, parsed, blocked], false);

        /* make sure we're not stuck on the same line again */
        if (this.stack[this.stack.length - 1] === curFrame && !blocked.val) {
            checkThrow(curFrame.getOffset() !== curLine.offset, '7x|stuck on the same line', curLine.offset.toString());
        }
    }

    /**
     * we were told to evaluate an expression, return the value
     */
    protected evalRequestedExpression(parsed: VpcParsed, curLine: VpcCodeLine): VpcVal {
        assertTrue(curLine.ctg !== VpcLineCategory.Statement, '5b|', curLine.ctg);
        assertTrue(
            this.cacheParsed.parser.RuleTopLevelRequestEval === curLine.getParseRule(),
            '5a|expected eval parse rule'
        );

        let visited = this.evalGeneralVisit(parsed, curLine) as IntermedMapOfIntermedVals;
        checkThrow(visited && visited.isIntermedMapOfIntermedVals, '7w|evalRequestedExpression wrong type');
        checkThrow(
            visited.vals.RuleExpr && visited.vals.RuleExpr[0],
            '7v|evalRequestedExpression no result of RuleExpr'
        );

        let ret = visited.vals.RuleExpr[0] as VpcVal;
        checkThrow(ret.isVpcVal, '7u|evalRequestedExpression expected a number, string, or bool.');
        return ret;
    }

    /**
     * run the visitor, to get a value from the CST
     */
    protected evalGeneralVisit(parsed: VpcParsed, curLine: VpcCodeLine): VpcIntermedValBase {
        if (parsed !== null && parsed !== undefined) {
            let visited = this.cacheParsed.visitor.visit(parsed);
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
                let found = this.code.findHandlerInScript(vel.id, VpcElBase.getScript(vel), handlername);
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
        let found = this.findHandlerUpwards(curFrame.codeSection.ownerId, curFrame.handlerName, true);
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
        let blockEnd = blockInfo[blockInfo.length - 1];
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
            this.validatedGoto(curFrame, blockInfo[blockInfo.length - 1]);
            curFrame.next();
        } else {
            /* enter the branch */
            curFrame.offsetsMarked[curLine.offset] = true;
            curFrame.next();
        }
    }

    /**
     * start an "else if"
     * use offsetsMarked to record where we've been
     */
    visitIfElse(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        let blockInfo = this.getBlockInfo(curLine, 3);
        let anyTaken = blockInfo.some(ln => curFrame.offsetsMarked[ln.offset]);
        if (anyTaken) {
            /* we've already taken a branch - skip to one past the end of the block */
            this.validatedGoto(curFrame, blockInfo[blockInfo.length - 1]);
            curFrame.next();
        } else {
            let evaluated = this.evalRequestedExpression(parsed, curLine);
            let got = evaluated.readAsStrictBoolean();
            if (got) {
                /* enter the branch */
                curFrame.offsetsMarked[curLine.offset] = true;
                curFrame.next();
            } else {
                /* go to the next branch */
                let curindex = blockInfo.findIndex(v => v.offset === curLine.offset);
                checkThrow(curindex !== -1, '7r|not found in blockinfo');
                checkThrow(curindex !== 0, "7q|it doesn't make sense that we are at the first");
                checkThrow(curindex < blockInfo.length, '7p|already at the end of block?');
                this.validatedGoto(curFrame, blockInfo[curindex + 1]);
            }
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
        this.validatedGoto(curFrame, blockInfo[blockInfo.length - 1]);
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
     * helper for running repeat
     */
    protected repeatImpl(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed, invert: boolean) {
        let evaluated = this.evalRequestedExpression(parsed, curLine);
        let got = evaluated.readAsStrictBoolean();
        got = invert ? !got : got;
        if (got) {
            /* continue in the loop */
            curFrame.next();
        } else {
            /* advance to one line past the end of the loop */
            let blockInfo = this.getBlockInfo(curLine, 2);
            this.validatedGoto(curFrame, blockInfo[blockInfo.length - 1]);
            curFrame.next();
        }
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
        this.callHandlerAndThrowIfNotExist(curFrame, args, curFrame.codeSection.ownerId, newHandlerName )
    }

    /**
     * call a handler
     */
    protected callHandlerAndThrowIfNotExist(curFrame: VpcExecFrame, args: VpcVal[], ownerId:string, handlerName:string) {
        /* reset the result, in case the callee doesn't return anything */
        curFrame.locals.set('$result', VpcVal.Empty);
        curFrame.next();
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
     * run dynamically-built code like 'do "answer 1+1"'
     */
    visitCallDynamic(curFrame: VpcExecFrame, curLine: VpcCodeLine, parsed: VpcParsed) {
        let evaluated = this.evalRequestedExpression(parsed, curLine);
        let s = evaluated.readAsString()
        let lineNumber = curLine.excerptToParse[1].startLine || 0

        /* build a new temporary handler, then call it.
        a bit "interesting" to be modifying the same script we are currently running,
        but because we are appending only, and because VpcExecFrame has its own copy of the code anyways,
        this should be safe. */
        let newHandlerName = VpcExecFrame.appendTemporaryDynamicCodeToScript(this.outside, curFrame.codeSection.ownerId, s, lineNumber)
        this.callHandlerAndThrowIfNotExist(curFrame, [], curFrame.codeSection.ownerId, newHandlerName)
    }
}
