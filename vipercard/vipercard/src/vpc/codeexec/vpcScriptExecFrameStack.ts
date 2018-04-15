
/* auto */ import { O, assertTrue, checkThrow, makeVpcInternalErr, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, ValHolder, assertEq, assertEqWarn, checkThrowEq, getEnumToStrOrUnknown } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512PaintDispatch } from '../../ui512/draw/ui512DrawPaintDispatch.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { CodeLimits, VpcScriptMessage, VpcScriptRuntimeError } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VarCollection } from '../../vpc/vpcutils/vpcVarCollection.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { VpcLineCategory } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpcCheckReserved.js';
/* auto */ import { VpcCodeLine, VpcCodeLineReference } from '../../vpc/codepreparse/vpcCodeLine.js';
/* auto */ import { BranchProcessing } from '../../vpc/codepreparse/vpcBranchProcessing.js';
/* auto */ import { VpcAllCode, VpcCodeOfOneVel } from '../../vpc/codepreparse/vpcAllCode.js';
/* auto */ import { VpcParsingCache } from '../../vpc/codeexec/vpcScriptCacheParsed.js';
/* auto */ import { ScriptAsyncOperations } from '../../vpc/codeexec/vpcScriptExecAsync.js';
/* auto */ import { ExecuteStatements } from '../../vpc/codeexec/vpcScriptExecStatement.js';
/* auto */ import { CodeExecFrame } from '../../vpc/codeexec/vpcScriptExecFrame.js';

/**
 * frame stack for the vipercard code-interpreter
 * like C, entering a function pushes a frame onto this stack,
 * returning from a function pops a frame from this stack
 */
export class CodeExecFrameStack {
    stack: O<CodeExecFrame>[] = [undefined];
    constructor(
        protected code: VpcAllCode,
        protected outside: OutsideWorldReadWrite,
        protected parsingCache: VpcParsingCache,
        protected execStatements: ExecuteStatements,
        public constants: VarCollection,
        public globals: VarCollection,
        public check: CheckReservedWords,
        public originalMsg: VpcScriptMessage
    ) {
        this.execStatements.asyncOps = CodeExecFrameStack.staticAsyncOps;
    }

    /* if you are drawing paint on the screen with a script,
    we cache the commands sent to the screen to coalesce later for better performance */
    paintQueue: UI512PaintDispatch[] = [];

    /* is this a completely new framestack? */
    hasRunCode = false;

    /* keep track of state for an async script action (like "wait 4 seconds") */
    static staticAsyncOps = new ScriptAsyncOperations();

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
        checkThrowEq(VpcTool.Browse, this.outside.GetCurrentTool(true), 'not browse tool?');
        let newFrame = new CodeExecFrame(msgName, msg);
        newFrame.codeSection = code;
        this.validatedGoto(newFrame, codeLine, true);
        this.stack.push(newFrame);
        assertTrue(this.stack.length < CodeLimits.MaxCodeFrames, '5e|stack overflow... unbounded recursion?');
        return newFrame;
    }

    /**
     * when jumping to a line, ensure the expected line id matches line line we get.
     */
    protected validatedGoto(frm: CodeExecFrame, ref: VpcCodeLineReference, okToStartHandler?: boolean) {
        frm.jumpToOffset(ref.offset, okToStartHandler);
        assertEq(ref.lineId, frm.codeSection.lines[frm.offset].lineId, '5h|');
        assertEq(ref.offset, frm.codeSection.lines[frm.offset].offset, '5g|');
    }

    /**
     * continue running code until _ms_ milliseconds have passed
     */
    runTimeslice(ms: number) {
        if (!this.hasRunCode) {
            CodeExecFrameStack.staticAsyncOps = new ScriptAsyncOperations();
            this.execStatements.asyncOps = CodeExecFrameStack.staticAsyncOps;
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
            if (count > 4) {
                /* see if our timeslice has expired */
                count = 0;
                let now = performance.now();
                if (now - started >= ms) {
                    break;
                }
            }
        }

        if (!this.outside.GetOption_b('screenLocked') || this.stack.length <= 1) {
            this.outside.CommitSimulatedClicks(this.paintQueue);
            this.paintQueue = [];
        }
    }

    /**
     *
     * @param blocked
     */
    protected runOneLine(blocked: ValHolder<number>): boolean {
        let curframe = this.stack[this.stack.length - 1];
        if (curframe) {
            let curline = curframe.codeSection.lines[curframe.offset];
            if (curline) {
                try {
                    assertEq(curline.offset, curframe.offset, '5d|');
                    this.runOneLineImpl(curframe, curline, blocked);
                    return false;
                } catch (e) {
                    let scriptErr = new VpcScriptRuntimeError();
                    scriptErr.callstack = []; /* not yet implemented */
                    scriptErr.details = e.message;
                    scriptErr.lineNumber = curline.firstToken.startLine || -1;
                    scriptErr.velId = curframe.codeSection.ownerId;
                    scriptErr.lineData = curline;
                    scriptErr.isScriptException = e.isVpcError;
                    scriptErr.isExternalException = !e.isUi512Error;
                    scriptErr.e = e;
                    e.vpcScriptErr = scriptErr;
                    throw e;
                }
            } else {
                throw makeVpcInternalErr(
                    `5c|no code defined at offset ${curframe.offset} of element ${curframe.codeSection.ownerId}`
                );
            }
        } else {
            /* there's no current stack, looks like we are done! */
            return true;
        }
    }

    protected runOneLineImpl(curframe: CodeExecFrame, curline: VpcCodeLine, blocked: ValHolder<number>) {
        let parsed = this.parsingCache.getParsedLine(curline);
        let methodName = 'visit' + getEnumToStrOrUnknown<VpcLineCategory>(VpcLineCategory, curline.ctg);
        Util512.callAsMethodOnClass(
            'CodeExecFrameStack',
            this,
            methodName,
            [curframe, curline, parsed, blocked],
            false
        );

        /* make sure we're not stuck on the same line again */
        if (this.stack[this.stack.length - 1] === curframe && !blocked.val) {
            checkThrow(curframe.offset !== curline.offset, '7x|stuck on the same line', curline.offset.toString());
        }
    }

    protected evalRequestedExpression(parsed: any, curline: VpcCodeLine): VpcVal {
        assertTrue(curline.ctg !== VpcLineCategory.Statement, '5b|', curline.ctg);
        assertTrue(
            this.parsingCache.parser.RuleTopLevelRequestEval === curline.getParseRule(),
            '5a|expected eval parse rule'
        );
        let visited = this.evalGeneralVisit(parsed, curline) as IntermedMapOfIntermedVals;
        checkThrow(visited && visited.isIntermedMapOfIntermedVals, '7w|evalRequestedExpression wrong type');
        checkThrow(
            visited.vals.RuleExpr && visited.vals.RuleExpr[0],
            '7v|evalRequestedExpression no result of RuleExpr'
        );
        let ret = visited.vals.RuleExpr[0] as VpcVal;
        checkThrow(ret.isVpcVal, '7u|evalRequestedExpression expected a number, string, or bool.');
        return ret;
    }

    protected evalGeneralVisit(parsed: any, curline: VpcCodeLine): VpcIntermedValBase {
        if (parsed !== null && parsed !== undefined) {
            let visited = this.parsingCache.visitor.visit(parsed);
            checkThrow(visited.isIntermedValBase, '7t|did not get isIntermedValBase when running', curline.allImages);
            return visited;
        } else {
            throw makeVpcScriptErr('5Z|no expression was parsed');
        }
    }

    findHandlerUpwards(id: string, handlername: string, onlyParents: boolean) {
        let vel = this.outside.ElementById(id);
        let nextParent = vel ? vel.parentId : undefined;
        let nextToLookAt = onlyParents ? nextParent : id;
        while (!!vel) {
            let found = this.code.findHandlerInScript(nextToLookAt, handlername);
            if (found) {
                return found;
            }

            vel = this.outside.ElementById(nextToLookAt);
            nextToLookAt = vel ? vel.parentId : undefined;
        }
    }

    visitStatement(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any, blocked: ValHolder<number>) {
        let visited = parsed ? this.evalGeneralVisit(parsed, curline) : VpcVal.Empty;
        this.execStatements.go(curline, visited, blocked);
        if (blocked.val === 0) {
            curframe.next();
        }
    }

    visitDeclareGlobal(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        for (let i = 0; i < curline.excerptToParse.length; i++) {
            let varName = curline.excerptToParse[i].image;
            checkThrow(varName !== 'it' && this.check.okLocalVar(varName), '7s|reserved word', varName);
            curframe.declaredGlobals[varName] = true;
            if (!this.outside.IsVarDefined(varName)) {
                /* not-yet-used globals default to "" */
                this.outside.SetVarContents(varName, VpcValS(''));
            }
        }

        curframe.next();
    }

    visitHandlerStart(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        /* confirm handler name */
        assertTrue(curline.excerptToParse.length > 1, '5X|wrong readyToParse length');
        assertEqWarn(curframe.handlerName.toLowerCase(), curline.excerptToParse[1].image.toLowerCase(), '5W|');

        /* set locals for the params */
        for (let i = 2; i < curline.excerptToParse.length; i++) {
            let paramname = curline.excerptToParse[i].image;
            let val = curframe.args[i - 2] || VpcVal.Empty;
            curframe.locals.set(paramname, val);
        }

        curframe.next();
    }

    visitHandlerEnd(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        this.stack.pop();
    }

    visitProductExit(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        while (this.stack.length > 1) {
            this.stack.pop();
        }
    }

    visitHandlerExit(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        /* we've validated curline.readyToParse[1] in the BranchProcessing class */
        this.stack.pop();
    }

    visitHandlerPass(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        /* we've validated curline.readyToParse[1] in the BranchProcessing class */
        /* in the rewriting stage we've added a "return" after this line, for simplicity */
        curframe.next();
        let found = this.findHandlerUpwards(curframe.codeSection.ownerId, curframe.handlerName, true);
        if (found) {
            this.pushStackFrame(curframe.handlerName, curframe.message, found[0], found[1]);
        }
    }

    visitReturnExpr(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        let evald = this.evalRequestedExpression(parsed, curline);
        /* set the result as a local variable in the frame beneath */
        let frameBeneath = this.stack[this.stack.length - 2];
        if (frameBeneath !== undefined) {
            frameBeneath.locals.set('$result', evald);
        }

        this.stack.pop();
    }

    protected getBlockInfo(curline: VpcCodeLine, nAtLeast: number): VpcCodeLineReference[] {
        if (curline.blockInfo && curline.blockInfo.length >= nAtLeast) {
            return curline.blockInfo;
        } else {
            throw makeVpcScriptErr(`5V|no branches stored in blockInfo`);
        }
    }

    visitIfStart(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        /* if blocks must start with "if" and end with an "end if" */
        let blockInfo = this.getBlockInfo(curline, 2);
        let blockEnd = blockInfo[blockInfo.length - 1];
        assertEq(curline.offset, blockInfo[0].offset, '5U|');
        assertEq(curline.lineId, blockInfo[0].lineId, '5T|');
        assertEq(VpcLineCategory.IfEnd, curframe.codeSection.lines[blockEnd.offset].ctg, '5S|');

        /* mark all of the child branches as untried. */
        for (let i = 0; i < blockInfo.length; i++) {
            curframe.offsetsMarked[blockInfo[i].offset] = false;
            assertEq(blockInfo[i].lineId, curframe.codeSection.lines[blockInfo[i].offset].lineId, '5R|');
        }

        let evald = this.evalRequestedExpression(parsed, curline);
        let got = evald.readAsStrictBoolean();
        if (got) {
            curframe.offsetsMarked[blockInfo[0].offset] = true;
            curframe.next();
        } else {
            /* skip to the next branch */
            this.validatedGoto(curframe, blockInfo[1]);
        }
    }

    visitIfElsePlain(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        let blockInfo = this.getBlockInfo(curline, 3);
        let anyTaken = blockInfo.some(ln => curframe.offsetsMarked[ln.offset]);
        if (anyTaken) {
            /* we've already taken a branch - skip to one past the end of the block */
            this.validatedGoto(curframe, blockInfo[blockInfo.length - 1]);
            curframe.next();
        } else {
            /* enter the branch */
            curframe.offsetsMarked[curline.offset] = true;
            curframe.next();
        }
    }

    visitIfElse(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        let blockInfo = this.getBlockInfo(curline, 3);
        let anyTaken = blockInfo.some(ln => curframe.offsetsMarked[ln.offset]);
        if (anyTaken) {
            /* we've already taken a branch - skip to one past the end of the block */
            this.validatedGoto(curframe, blockInfo[blockInfo.length - 1]);
            curframe.next();
        } else {
            let evald = this.evalRequestedExpression(parsed, curline);
            let got = evald.readAsStrictBoolean();
            if (got) {
                /* enter the branch */
                curframe.offsetsMarked[curline.offset] = true;
                curframe.next();
            } else {
                /* go to the next branch */
                let curindex = blockInfo.findIndex(v => v.offset === curline.offset);
                checkThrow(curindex !== -1, '7r|not found in blockinfo');
                checkThrow(curindex !== 0, "7q|it doesn't make sense that we are at the first");
                checkThrow(curindex < blockInfo.length, '7p|already at the end of block?');
                this.validatedGoto(curframe, blockInfo[curindex + 1]);
            }
        }
    }

    visitIfEnd(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        curframe.next();
    }

    visitRepeatExit(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        /* advance to one line past the end of the loop */
        let blockInfo = this.getBlockInfo(curline, 2);
        this.validatedGoto(curframe, blockInfo[blockInfo.length - 1]);
        curframe.next();
    }

    visitRepeatEnd(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        /* go back to the top of the loop */
        let blockInfo = this.getBlockInfo(curline, 2);
        this.validatedGoto(curframe, blockInfo[0]);
    }

    visitRepeatNext(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        return this.visitRepeatEnd(curframe, curline, parsed);
    }

    visitRepeatForever(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        curframe.next();
    }

    protected helpRepeat(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any, invert: boolean) {
        let evald = this.evalRequestedExpression(parsed, curline);
        let got = evald.readAsStrictBoolean();
        got = invert ? !got : got;
        if (got) {
            /* continue in the loop */
            curframe.next();
        } else {
            /* advance to one line past the end of the loop */
            let blockInfo = this.getBlockInfo(curline, 2);
            this.validatedGoto(curframe, blockInfo[blockInfo.length - 1]);
            curframe.next();
        }
    }

    visitRepeatWhile(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        return this.helpRepeat(curframe, curline, parsed, false);
    }

    visitRepeatUntil(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        return this.helpRepeat(curframe, curline, parsed, true);
    }

    protected helpGetEvaledArgs(parsed: any, curline: VpcCodeLine): VpcVal[] {
        let evald = this.evalGeneralVisit(parsed, curline) as IntermedMapOfIntermedVals;
        checkThrow(evald.isIntermedMapOfIntermedVals, '7o|expected IntermedMapOfIntermedVals');
        if (evald.vals['RuleExpr'] && evald.vals['RuleExpr'].length) {
            let ret = evald.vals['RuleExpr'] as VpcVal[];
            assertTrue(ret !== undefined, '5Q|expected RuleExpr');
            assertTrue(ret.every(v => v.isVpcVal), '5P|every arg must be a VpcVal');
            return ret;
        } else {
            return [];
        }
    }

    visitCallHandler(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        /* reset the result, in case the callee doesn't return anything */
        curframe.locals.set('$result', VpcVal.Empty);
        let newhandlername = curline.excerptToParse[1].image;
        curframe.next();
        let found = this.findHandlerUpwards(curframe.codeSection.ownerId, newhandlername, false);
        if (found) {
            let args = this.helpGetEvaledArgs(parsed, curline);
            let newfrm = this.pushStackFrame(newhandlername, curframe.message, found[0], found[1]);
            newfrm.args = args;
            Util512.freezeRecurse(newfrm.args);
        } else {
            throw makeVpcScriptErr(`5O|tried to call ${newhandlername} but no handler of this name found`);
        }
    }
}
