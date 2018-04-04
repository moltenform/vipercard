
/* autoimport:start */
import { cProductName, cTkSyntaxMarker, makeVpcScriptErr, makeVpcInternalErr, checkThrow, checkThrowEq, FormattedSubstringUtil, CodeLimits, VpcIntermedValBase, IntermedMapOfIntermedVals, VpcVal, VpcValS, VpcValN, VpcValBool, VarCollection, VariableCollectionConstants, VpcEvalHelpers, ReadableContainer, WritableContainer, RequestedChunk, ChunkResolution, VpcUI512Serialization, CountNumericId } from "../vpcscript/vpcutil.js";
import { RequestedChunkType, PropAdjective, SortStyle, OrdinalOrPosition, RequestedChunkTextPreposition, VpcElType, VpcTool, toolToPaintOntoCanvasShapes, VpcToolCtg, getToolCategory, VpcBuiltinMsg, getMsgNameFromType, VpcOpCtg, getPositionFromOrdinalOrPosition } from "../vpcscript/vpcenums.js";
import { ChvLexer, ChvParser, ChvToken, ChvILexingResult, ChvILexingError, ChvIToken } from "../vpcscript/bridgechv.js";
import { tokenType, isTkType, typeGreaterLessThanEqual, BuildFakeTokens, alsoReservedWordsList, listTokens, tks, partialReservedWordsList } from "../vpcscript/vpcgentokens.js";
import { ChvParserClass } from "../vpcscript/vpcgenrules.js";
import { getParsingObjects, fromNickname, createVisitor } from "../vpcscript/vpcgenvisitor.js";
import { PrpTyp, VpcElBase, VpcElSizable, VpcElButton, UI512FldStyleInclScrolling, VpcElField, VpcElCard, VpcElBg, VpcElStack } from "../vpcscript/vpcelements.js";
import { RequestedVelRef, RequestedContainerRef, VpcModel, vpcElTypeAsSeenInName, ReadableContainerStr, ReadableContainerVar, WritableContainerVar, ReadableContainerField, WritableContainerField, VpcScriptMessage, OutsideWorldRead, OutsideWorldReadWrite, VpcElProductOpts } from "../vpcscript/vpcelementstop.js";
import { VpcAllCode, VpcCodeLine, VpcCodeOfOneVel, VpcLineCategory, VpcCodeLineReference, CodeSymbols, CheckReservedWords } from "../vpcscript/vpcscriptprocessing.js";
import { ExecuteStatements, ScriptAsyncOperations } from "../vpcscript/vpcscriptexecstatement.js";
import { ExpLRUMap } from "../vpcscript/bridgejslru.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { UI512ViewDraw, PaintOntoCanvasShapes, PaintOntoCanvas } from "../ui512/ui512elementsdefaultview.js";
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class CodeExecTop {
    constants = new VariableCollectionConstants();
    check = new CheckReservedWords();
    globals = new VarCollection(CodeLimits.maxGlobalVars, "global");
    runStatements = new ExecuteStatements();
    parsingCache = new VpcParsingCache();
    workQueue: CodeExecFrameStack[] = [];
    cbOnScriptError: O<(id: O<string>, n: O<number>, isUs: boolean, msg: string) => void>;

    protected readonly code: VpcAllCode;
    protected readonly outside: OutsideWorldReadWrite;
    constructor(idgen: CountNumericId, outside: OutsideWorldReadWrite) {
        this.code = new VpcAllCode(idgen);
        this.outside = outside;
        this.runStatements.outside = outside;
        this.parsingCache.visitor.outside = outside as OutsideWorldRead;
    }

    scheduleCodeExec(msg: VpcScriptMessage) {
        let newWork = new CodeExecFrameStack(
            this.code,
            this.outside,
            this.parsingCache,
            this.runStatements,
            this.constants,
            this.globals,
            this.check,
            msg
        );

        newWork.findHandlerToExec();
        if (newWork.stack.length > 1) {
            this.workQueue.push(newWork);
        }
    }

    removeScript(id: string) {
        // disabled because this hasn't been tested, but actually this probably "works"
        // since the framecontext holds a reference to the codesection.
        checkThrow(!this.isCodeRunning(), "7z|we don't currently support deleting an element while code is running");
        this.code.code.remove(id);
    }

    isCodeRunning() {
        // check hasRunCode to make ui less gummed up
        return this.workQueue.length > 0 && this.workQueue[0].hasRunCode;
    }

    forceStopRunning() {
        this.workQueue.length = 0;
    }

    runTimeslice(ms: number) {
        // remove indication of 'latest runtime error'
        this.outside.SetOption("viewingScriptLastRuntimeErr", "//");

        let first = this.workQueue[0];
        let currentcardid = this.outside.GetOption_s("currentCardId");
        while (true) {
            first = this.workQueue[0];
            if (!first || !this.workQueue.length) {
                // no code is running.
                // make sure screen is unlocked, just in case
                this.outside.SetOption("screenLocked", false);
                return;
            } else if (
                !first.hasRunCode &&
                slength(first.originalMsg.cardWhenFired) > 0 &&
                first.originalMsg.causedByUserAction &&
                first.originalMsg.cardWhenFired != currentcardid
            ) {
                // important: don't run queued messages that were created on a different card
                this.workQueue.splice(0, 1);
            } else {
                break;
            }
        }

        // we just finished a handler
        if (first.stack.length <= 1) {
            this.workQueue.splice(0, 1);
            this.outside.SetOption("screenLocked", false);
            this.outside.SetOption("mimicCurrentTool", VpcTool.browse);
            return;
        }

        ui512ErrorHandling.breakOnThrow = false;
        try {
            first.runTimeslice(ms);
        } catch (e) {
            this.respondScriptError(e);
        } finally {
            ui512ErrorHandling.breakOnThrow = true;
        }

        // we just finished a handler
        if (first.stack.length <= 1) {
            this.workQueue.splice(0, 1);
            this.outside.SetOption("screenLocked", false);
            this.outside.SetOption("mimicCurrentTool", VpcTool.browse);
            return;
        }
    }

    updateChangedCode(owner: VpcElBase, code: string, silent: boolean): boolean {
        checkThrow(!this.isCodeRunning(), "7y|we don't currently support changing code while code is running");
        ui512ErrorHandling.breakOnThrow = false;
        try {
            this.code.updateCode(code, owner);
        } catch (e) {
            if (silent) {
                return false;
            } else {
                this.respondScriptError(e);
                return false;
            }
        } finally {
            ui512ErrorHandling.breakOnThrow = true;
        }

        return true;
    }

    protected respondScriptError(e: any) {
        this.forceStopRunning();
        if (this.cbOnScriptError) {
            this.cbOnScriptError(e.vpcVelId, e.vpcLine, !!e.isUi512Error, e.message);
        } else {
            assertTrue(false, `5i|script error occurred on line ${e.vpcLine} of el ${e.vpcVelId}`);
        }
    }
}

export class CodeExecFrameStack {
    stack: O<CodeExecFrame>[] = [undefined];
    paintQueue: PaintOntoCanvas[] = [];
    hasRunCode = false;
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
        this.execStatements.asyncOps = new ScriptAsyncOperations();
    }

    findHandlerToExec() {
        let handler = this.findHandlerUpwards(this.originalMsg.targetId, this.originalMsg.msgName, false);
        if (handler) {
            this.pushStackFrame(this.originalMsg.msgName, this.originalMsg, handler[0], handler[1]);
        }
    }

    protected pushStackFrame(msgName: string, msg: VpcScriptMessage, code: VpcCodeOfOneVel, codeline: VpcCodeLineReference) {
        checkThrowEq(VpcTool.browse, this.outside.GetCurrentTool(true), "not browse tool?");
        let newframe = new CodeExecFrame(msgName, msg);
        newframe.codeSection = code;
        this.validatedGoto(newframe, codeline, true);
        this.stack.push(newframe);
        return newframe;
    }

    protected validatedGoto(frm: CodeExecFrame, ref: VpcCodeLineReference, okToStartHandler?: boolean) {
        frm.jumpToOffset(ref.offset, okToStartHandler);
        assertEq(ref.lineid, frm.codeSection.lines[frm.offset].lineId, "5h|");
        assertEq(ref.offset, frm.codeSection.lines[frm.offset].offset, "5g|");
    }

    runTimeslice(ms: number) {
        this.hasRunCode = true;
        let blocked = new refparam<number>(0);

        let started = performance.now();
        assertTrue(this.stack.length >= 1 && this.stack[0] === undefined, "5f|popped too many off the stack");
        assertTrue(this.stack.length < CodeLimits.maxCodeFrames, "5e|stack overflow... unbounded recursion?");
        let count = 0;
        while (this.stack.length > 1) {
            let isComplete = this.runOneLine(blocked);
            if (isComplete || blocked.val) {
                break;
            }

            count += 1;
            if (count % 4 === 0) {
                let now = performance.now();
                if (now - started >= ms) {
                    break;
                }
            }
        }

        if (!this.outside.GetOption_b("screenLocked") || this.stack.length <= 1) {
            this.outside.CommitSimulatedClicks(this.paintQueue);
            this.paintQueue = [];
        }
    }

    protected runOneLine(blocked: refparam<number>): boolean {
        let curframe = this.stack[this.stack.length - 1];
        if (curframe) {
            let curline = curframe.codeSection.lines[curframe.offset];
            if (curline) {
                try {
                    assertEq(curline.offset, curframe.offset, "5d|");
                    this.runOneLineImpl(curframe, curline, blocked);
                    return false;
                } catch (e) {
                    e.vpcLine = curline.firstToken.startLine;
                    e.vpcVelId = curframe.codeSection.ownerId;
                    e.vpcDestLine = curline;
                    throw e;
                }
            } else {
                throw makeVpcInternalErr(`5c|no code defined at offset ${curframe.offset} of element ${curframe.codeSection.ownerId}`);
            }
        } else {
            // there's no current stack, looks like we are done!
            return true;
        }
    }

    protected runOneLineImpl(curframe: CodeExecFrame, curline: VpcCodeLine, blocked: refparam<number>) {
        let parsed = this.parsingCache.getParsedLine(curline);
        let methodname = "visit_" + getEnumToStrOrUnknown<VpcLineCategory>(VpcLineCategory, curline.ctg);
        Util512.callAsMethodOnClass("CodeExecFrameStack", this, methodname, [curframe, curline, parsed, blocked], false);

        // make sure we're not stuck on the same line again
        if (this.stack[this.stack.length - 1] === curframe && !blocked.val) {
            checkThrow(curframe.offset !== curline.offset, "7x|stuck on the same line", curline.offset.toString());
        }
    }

    protected evalRequestedExpression(parsed: any, curline: VpcCodeLine): VpcVal {
        assertTrue(curline.ctg !== VpcLineCategory.statement, "5b|", curline.ctg);
        assertTrue(this.parsingCache.parser.RuleTopLevelRequestEval === curline.getParseRule(), "5a|expected eval parse rule");
        let visited = this.evalGeneralVisit(parsed, curline) as IntermedMapOfIntermedVals;
        checkThrow(visited && visited.isIntermedMapOfIntermedVals, "7w|evalRequestedExpression wrong type");
        checkThrow(visited.vals.RuleExpr && visited.vals.RuleExpr[0], "7v|evalRequestedExpression no result of RuleExpr");
        let ret = visited.vals.RuleExpr[0] as VpcVal;
        checkThrow(ret.isVpcVal, "7u|evalRequestedExpression expected a number, string, or bool.");
        return ret;
    }

    protected evalGeneralVisit(parsed: any, curline: VpcCodeLine): VpcIntermedValBase {
        if (parsed !== null && parsed !== undefined) {
            let visited = this.parsingCache.visitor.visit(parsed);
            checkThrow(visited.isIntermedValBase, "7t|did not get isIntermedValBase when running", curline.allImages);
            return visited;
        } else {
            throw makeVpcScriptErr("5Z|no expression was parsed");
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

    visit_statement(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any, blocked: refparam<number>) {
        let visited = parsed ? this.evalGeneralVisit(parsed, curline) : VpcVal.Empty;
        this.execStatements.go(curline, visited, blocked);
        if (blocked.val === 0) {
            curframe.next();
        }
    }

    visit_declareGlobal(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        for (let i = 0; i < curline.excerptToParse.length; i++) {
            let varname = curline.excerptToParse[i].image;
            checkThrow(varname !== "it" && this.check.okLocalVar(varname), "7s|reserved word", varname);
            curframe.declaredGlobals[varname] = true;
        }

        curframe.next();
    }

    visit_handlerStart(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        // confirm handler name
        assertTrue(curline.excerptToParse.length > 1, "5X|wrong readyToParse length");
        assertEqWarn(curframe.handlerName.toLowerCase(), curline.excerptToParse[1].image.toLowerCase(), "5W|");

        // set locals for the params
        for (let i = 2; i < curline.excerptToParse.length; i++) {
            let paramname = curline.excerptToParse[i].image;
            let val = curframe.args[i - 2] || VpcVal.Empty;
            curframe.locals.set(paramname, val);
        }

        curframe.next();
    }

    visit_handlerEnd(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        this.stack.pop();
    }

    visit_productExit(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        while (this.stack.length > 1) {
            this.stack.pop();
        }
    }

    visit_handlerExit(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        // we've validated curline.readyToParse[1] in the BranchTracking class
        this.stack.pop();
    }

    visit_handlerPass(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        // we've validated curline.readyToParse[1] in the BranchTracking class
        // in the rewriting stage we've added a "return" after this line, for simplicity
        curframe.next();
        let found = this.findHandlerUpwards(curframe.codeSection.ownerId, curframe.handlerName, true);
        if (found) {
            this.pushStackFrame(curframe.handlerName, curframe.message, found[0], found[1]);
        }
    }

    visit_returnExpr(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        let evald = this.evalRequestedExpression(parsed, curline);
        // set the result as a local variable in the frame beneath
        let frameBeneath = this.stack[this.stack.length - 2];
        if (frameBeneath !== undefined) {
            frameBeneath.locals.set("$result", evald);
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

    visit_ifStart(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        // if blocks must start with "if" and end with an "end if"
        let blockInfo = this.getBlockInfo(curline, 2);
        let blockEnd = blockInfo[blockInfo.length - 1];
        assertEq(curline.offset, blockInfo[0].offset, "5U|");
        assertEq(curline.lineId, blockInfo[0].lineid, "5T|");
        assertEq(VpcLineCategory.ifEnd, curframe.codeSection.lines[blockEnd.offset].ctg, "5S|");

        // mark all of the child branches as untried.
        for (let i = 0; i < blockInfo.length; i++) {
            curframe.offsetsMarked[blockInfo[i].offset] = false;
            assertEq(blockInfo[i].lineid, curframe.codeSection.lines[blockInfo[i].offset].lineId, "5R|");
        }

        let evald = this.evalRequestedExpression(parsed, curline);
        let got = evald.readAsStrictBoolean();
        if (got) {
            curframe.offsetsMarked[blockInfo[0].offset] = true;
            curframe.next();
        } else {
            // skip to the next branch
            this.validatedGoto(curframe, blockInfo[1]);
        }
    }

    visit_ifElsePlain(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        let blockInfo = this.getBlockInfo(curline, 3);
        let anyTaken = blockInfo.some(ln => curframe.offsetsMarked[ln.offset]);
        if (anyTaken) {
            // we've already taken a branch - skip to one past the end of the block
            this.validatedGoto(curframe, blockInfo[blockInfo.length - 1]);
            curframe.next();
        } else {
            // enter the branch
            curframe.offsetsMarked[curline.offset] = true;
            curframe.next();
        }
    }

    visit_ifElse(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        let blockInfo = this.getBlockInfo(curline, 3);
        let anyTaken = blockInfo.some(ln => curframe.offsetsMarked[ln.offset]);
        if (anyTaken) {
            // we've already taken a branch - skip to one past the end of the block
            this.validatedGoto(curframe, blockInfo[blockInfo.length - 1]);
            curframe.next();
        } else {
            let evald = this.evalRequestedExpression(parsed, curline);
            let got = evald.readAsStrictBoolean();
            if (got) {
                // enter the branch
                curframe.offsetsMarked[curline.offset] = true;
                curframe.next();
            } else {
                // go to the next branch
                let curindex = blockInfo.findIndex(v => v.offset === curline.offset);
                checkThrow(curindex !== -1, "7r|not found in blockinfo");
                checkThrow(curindex !== 0, "7q|it doesn't make sense that we are at the first");
                checkThrow(curindex < blockInfo.length, "7p|already at the end of block?");
                this.validatedGoto(curframe, blockInfo[curindex + 1]);
            }
        }
    }

    visit_ifEnd(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        curframe.next();
    }

    visit_repeatExit(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        // advance to one line past the end of the loop
        let blockInfo = this.getBlockInfo(curline, 2);
        this.validatedGoto(curframe, blockInfo[blockInfo.length - 1]);
        curframe.next();
    }

    visit_repeatEnd(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        // go back to the top of the loop
        let blockInfo = this.getBlockInfo(curline, 2);
        this.validatedGoto(curframe, blockInfo[0]);
    }

    visit_repeatNext(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        return this.visit_repeatEnd(curframe, curline, parsed);
    }

    visit_repeatForever(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        curframe.next();
    }

    protected helpRepeat(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any, invert: boolean) {
        let evald = this.evalRequestedExpression(parsed, curline);
        let got = evald.readAsStrictBoolean();
        got = invert ? !got : got;
        if (got) {
            // continue in the loop
            curframe.next();
        } else {
            // advance to one line past the end of the loop
            let blockInfo = this.getBlockInfo(curline, 2);
            this.validatedGoto(curframe, blockInfo[blockInfo.length - 1]);
            curframe.next();
        }
    }

    visit_repeatWhile(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        return this.helpRepeat(curframe, curline, parsed, false);
    }

    visit_repeatUntil(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        return this.helpRepeat(curframe, curline, parsed, true);
    }

    protected helpGetEvaledArgs(parsed: any, curline: VpcCodeLine): VpcVal[] {
        let evald = this.evalGeneralVisit(parsed, curline) as IntermedMapOfIntermedVals;
        checkThrow(evald.isIntermedMapOfIntermedVals, "7o|expected IntermedMapOfIntermedVals");
        if (evald.vals["RuleExpr"] && evald.vals["RuleExpr"].length) {
            let ret = evald.vals["RuleExpr"] as VpcVal[];
            assertTrue(ret !== undefined, "5Q|expected RuleExpr");
            assertTrue(ret.every(v => v.isVpcVal), "5P|every arg must be a VpcVal");
            return ret;
        } else {
            return [];
        }
    }

    visit_callHandler(curframe: CodeExecFrame, curline: VpcCodeLine, parsed: any) {
        // reset the result, in case the callee doesn't return anything
        curframe.locals.set("$result", VpcVal.Empty);
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

export class CodeExecFrame {
    locals = new VarCollection(CodeLimits.maxLocalVars, "local");
    codeSection: VpcCodeOfOneVel;
    protected _offset: number;
    offsetsMarked: { [offset: number]: boolean } = {};
    declaredGlobals: { [varname: string]: boolean } = {};
    args: VpcVal[] = [];
    currentHandler: O<number>;
    constructor(public handlerName: string, public message: VpcScriptMessage) {
        // make special locals
        this.locals.set("$result", VpcVal.Empty);
        this.locals.set("it", VpcVal.Empty);
        assertTrue(!!this.message, "5N|message is null");
    }

    get offset() {
        return this._offset;
    }

    next() {
        this._offset += 1;
        checkThrow(this._offset < this.codeSection.lines.length, "7n|went past end of code");
        checkThrow(
            this.codeSection.lines[this.offset].ctg !== VpcLineCategory.handlerStart,
            "7m|we should never walk onto a handler start"
        );
    }

    // in the past, I checked if we were jumping backwards,
    // and if so, reset all of the offsetsMarkedAsComplete.
    // I think it is safe to instead reset during the first if statement, though.
    jumpToOffset(newOffset: number, okToStartHandler?: boolean) {
        this._offset = newOffset;
        checkThrow(this._offset < this.codeSection.lines.length, "7l|went past end of code");
        checkThrow(
            okToStartHandler || this.codeSection.lines[this.offset].ctg !== VpcLineCategory.handlerStart,
            "7k|we should never walk onto a handler start"
        );

        // make sure we did not jump into a different handler
        let next = this.codeSection.determineHandlerFromOffset(this._offset);
        checkThrow(next !== -1, "7j|could not determine handler", next);
        if (this.currentHandler === undefined) {
            this.currentHandler = next;
        } else {
            checkThrow(next === this.currentHandler, "7i|we somehow jumped into an entirely different handler", next);
            this.currentHandler = next;
        }
    }
}

export class VpcParsingCache {
    cache = new ExpLRUMap<string, any>(CodeLimits.cacheThisManyParsedLines);
    parser: ChvParserClass;
    visitor: any;
    constructor() {
        let [lexer, parser, visitor] = getParsingObjects();
        this.parser = parser;
        this.visitor = visitor;
    }

    getParsedLine(ln: VpcCodeLine) {
        let rule = ln.getParseRule();
        assertEq(!!rule, !!ln.allImages, "4>|");
        if (rule && ln.allImages) {
            assertTrue(ln.excerptToParse.length > 0, "4=|ln readyToParse is empty", ln.offset);
            let key = ln.allImages;
            let foundInCache = this.cache.get(key);
            if (foundInCache !== undefined) {
                return foundInCache;
            } else {
                let got = this.callParser(ln, rule);
                assertTrue(got !== null && got !== undefined, "4<|parse results null", ln.offset);
                this.cache.set(key, got);
                return got;
            }
        } else {
            return undefined;
        }
    }

    protected callParser(ln: VpcCodeLine, firstRule: Function) {
        let parsed: any;
        try {
            // setting input safely resets the parser state
            this.parser.input = ln.excerptToParse;
            this.parser.errors.length = 0;
            parsed = firstRule.apply(this.parser, []);
        } catch (e) {
            let err = e.message.toString().substr(0, CodeLimits.limitChevErr);
            throw makeVpcScriptErr("4;|parse error: " + err);
        }

        if (this.parser.errors.length) {
            let err = this.parser.errors[0].toString().substr(0, CodeLimits.limitChevErr);
            throw makeVpcScriptErr("4:|parse error: " + err);
        }

        return parsed;
    }
}
