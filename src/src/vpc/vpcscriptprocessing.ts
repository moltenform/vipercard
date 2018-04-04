
/* autoimport:start */
import { cProductName, cTkSyntaxMarker, makeVpcScriptErr, makeVpcInternalErr, checkThrow, checkThrowEq, FormattedSubstringUtil, CodeLimits, VpcIntermedValBase, IntermedMapOfIntermedVals, VpcVal, VpcValS, VpcValN, VpcValBool, VarCollection, VariableCollectionConstants, VpcEvalHelpers, ReadableContainer, WritableContainer, RequestedChunk, ChunkResolution, VpcUI512Serialization, CountNumericId } from "../vpcscript/vpcutil.js";
import { RequestedChunkType, PropAdjective, SortStyle, OrdinalOrPosition, RequestedChunkTextPreposition, VpcElType, VpcTool, toolToPaintOntoCanvasShapes, VpcToolCtg, getToolCategory, VpcBuiltinMsg, getMsgNameFromType, VpcOpCtg, getPositionFromOrdinalOrPosition } from "../vpcscript/vpcenums.js";
import { ChvLexer, ChvParser, ChvToken, ChvILexingResult, ChvILexingError, ChvIToken } from "../vpcscript/bridgechv.js";
import { tokenType, isTkType, typeGreaterLessThanEqual, BuildFakeTokens, alsoReservedWordsList, listTokens, tks, partialReservedWordsList } from "../vpcscript/vpcgentokens.js";
import { ChvParserClass } from "../vpcscript/vpcgenrules.js";
import { getParsingObjects, fromNickname, createVisitor } from "../vpcscript/vpcgenvisitor.js";
import { PrpTyp, VpcElBase, VpcElSizable, VpcElButton, UI512FldStyleInclScrolling, VpcElField, VpcElCard, VpcElBg, VpcElStack } from "../vpcscript/vpcelements.js";
import { VpcBuiltinFunctions } from "../vpcscript/vpcscriptfunctions.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { RequestedVelRef, RequestedContainerRef, VpcModel, vpcElTypeAsSeenInName, ReadableContainerStr, ReadableContainerVar, WritableContainerVar, ReadableContainerField, WritableContainerField, VpcScriptMessage, OutsideWorldRead, OutsideWorldReadWrite, VpcElProductOpts } from "../vpcscript/vpcelementstop.js";
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

/*
code compilation/execution strategy
--------------------------------

Phase One: Before runtime
    Run lexing on all input
    SplitIntoLinesProducer splits into logical lines (aware of \ continuation)
    MakeLowerCase makes identifiers lowercase
    SyntaxRewriter rewrites syntax for some lines:
        1) To make parsing easier for some commands
            (because we've minimized the number of tokens so extensively (for faster lexing))
        2) Transforming "repeat with x=1 to 5" into a "repeat while" loop
        3) Transforming custom function calls in a statement
            A custom function call can be blocking/arbitrarily slow,
            so it *can't* be evaluated in an expression.
            so, we look for and extract custom function calls and evaluate them separately
            put 2 * mycustomfunc(5 + mycustomfunc(7 + sin(x))) into x
            -->
            requestCall mycustomfunc(7 + sin(x)) placed into tmp001
            put 2 * mycustomfunc(5 + tmp001) into x
            -->
            requestCall mycustomfunc(7 + sin(x)) placed into tmp001
            requestCall mycustomfunc(5 + tmp001) placed into tmp002
            put 2 * tmp002 into x

            (note, I'm now using the same requestCall for custom handlers and custom functions,
            since they basically do the same thing)
    DetermineCategory determines if a line is a syntax element like "end repeat"
    If the syntax element has an expression to evaluate, put the expression into the line's readyToParse
    BranchTracking lets syntax elements like "end repeat" see where to jump to the corresponding "repeat"
    Confirm hierarchical structure: an "else" must appear in a valid "if", "end myHandler" must follow "on myHandler"

Phase Two: Runtime
    Walk through the lines
        Some control flow keywords like 'end repeat' were already completely determined in lexing, we don't need to parse them at all
        If it is a line that needs parsing, like 'return 4+5+6',
            Parse the line syntax at runtime if it hasn't already been parsed
            Evaluate the expression
        We can easily pause and resume execution because we save the instruction offset + all state
        So we can implement async functions like dialog boxes and calling out to another handler
        When the current function is 'root', all execution has been completed.
        Easier to go from line to line than traverse some type of tree structure; offset is just a number from current handler.

*/

export class VpcAllCode {
    code = new MapKeyToObjectCanSet<O<VpcCodeOfOneVel>>();
    processor = new VpcCodeProcessor();
    readonly idgen: CountNumericId;
    constructor(idgen: CountNumericId) {
        this.idgen = idgen;
    }

    updateCode(s: string, owner: VpcElBase) {
        // if compile-time errors occur, all code from the element is treated as absent
        this.code.set(owner.id, undefined);
        if (!s || s.match(/^\s*$/)) {
            return;
        }

        let codeOfElem = new VpcCodeOfOneVel(owner);
        let latestSrcLineSeen = new refparam(0)
        let latestDestLineSeen = new refparam(new VpcCodeLine(0, []))
        try {
            codeOfElem.setHandlers(this.processor.processCode(s, codeOfElem.lines, this.idgen, latestSrcLineSeen, latestDestLineSeen));
        } catch (e) {
            e.vpcLine = latestSrcLineSeen.val
            e.vpcVelId = owner.id;
            e.vpcDestLine = latestDestLineSeen.val
            throw e;
        }

        // there were no exceptions, so we can save the changed code.
        assertTrue(slength(owner.id), "5*|invalid owner id");
        this.code.set(owner.id, codeOfElem);
        Util512.freezeRecurse(codeOfElem);
    }

    findHandlerInScript(id: O<string>, handlername: string): O<[VpcCodeOfOneVel, VpcCodeLineReference]> {
        if (id) {
            let velScript = this.code.find(id);
            if (velScript) {
                let handler = velScript.handlers.find(handlername);
                if (handler) {
                    return [velScript, handler];
                }
            }
        }
    }
}

export class VpcCodeLine {
    readonly lineId: number;
    readonly firstToken: ChvIToken;
    protected parseRule: O<Function>;
    excerptToParse: ChvIToken[] = [];
    ctg = VpcLineCategory.invalid
    blockInfo: O<VpcCodeLineReference[]>;
    allImages: O<string>;
    tmpEntireLine: O<ChvIToken[]>;
    offset = -1;
    public constructor(lineId: number, line: ChvIToken[]) {
        this.lineId = lineId;
        this.firstToken = line[0];
        this.tmpEntireLine = line;
    }

    getParseRule() {
        return this.parseRule;
    }

    setParseRule(fn: O<Function>) {
        // we store 'allImages' as a string to cache ASTs.
        assertTrue(this.tmpEntireLine && this.tmpEntireLine.length, `5)|line ${this.offset}`);
        if (fn && this.tmpEntireLine) {
            this.allImages = "";
            for (let tk of this.tmpEntireLine) {
                this.allImages += tk.image;
                this.allImages += "~";
            }
        }

        this.parseRule = fn;
    }
}

class VpcCodeProcessor {
    processCode(
        code: string,
        output: VpcCodeLine[],
        idgen: CountNumericId,
        latestSrcLineSeen: refparam<number>,
        latestDestLineSeen: refparam<VpcCodeLine>
    ) {
        // lex the input
        let [lexer, parser, visitor] = getParsingObjects();
        let lexed = lexer.tokenize(code);
        if (lexed.errors.length) {
            latestSrcLineSeen.val = lexed.errors[0].line;
            let errmsg = lexed.errors[0].message.toString().substr(0, CodeLimits.limitChevErr)
            throw makeVpcScriptErr(`5(|lex error: ${errmsg}`);
        }

        // create a pipeline
        let linenumber = 0;
        let idGenThisScript = new CountNumericId();
        let makeLowercase = new MakeLowerCase();
        let checkReserved = new CheckReservedWords();
        let mapBuiltinCmds = new MapBuiltinCmds(parser)
        let determineCategory = new DetermineCategory(idgen, parser, mapBuiltinCmds, checkReserved);
        let splitter = new SplitIntoLinesProducer(lexed.tokens, idgen, makeLowercase);
        let syntaxRewriter = new SyntaxRewriter(idgen, idGenThisScript, mapBuiltinCmds, checkReserved);
        let branchTracking = new BranchTracking(idgen);
        let limit = new LoopLimit(CodeLimits.maxLinesInScript, "maxLinesInScript");
        while (limit.next()) {
            let tokenList = splitter.next();
            if (tokenList) {
                let latest = tokenList[0];
                if (latest.startLine) {
                    latestSrcLineSeen.val = latest.startLine;
                }

                // syntax rewriting might split a line into two lines
                let tokenLists = syntaxRewriter.go(tokenList);
                for (let i = 0; i < tokenLists.length; i++) {
                    let list = tokenLists[i];
                    let line = determineCategory.go(list);
                    latestDestLineSeen.val = line;
                    line.offset = linenumber;
                    branchTracking.go(line);
                    output[linenumber] = line;
                    linenumber += 1;

                    // save a bit of memory, we don't need this anymore
                    line.tmpEntireLine = undefined;
                }
            } else {
                break;
            }
        }

        branchTracking.ensureComplete();
        return branchTracking.handlers;
    }
}

export class VpcCodeOfOneVel {
    lines: VpcCodeLine[] = [];
    protected _handlers = new MapKeyToObject<VpcCodeLineReference>();
    protected _handlerStarts: number[] = [];
    readonly ownerId: string;
    public constructor(owner: VpcElBase) {
        this.ownerId = owner.id;
    }

    get handlers() {
        return this._handlers;
    }

    get handlerStarts() {
        return this._handlerStarts;
    }

    setHandlers(map: MapKeyToObject<VpcCodeLineReference>) {
        this._handlers = map;
        this._handlerStarts = map.getVals().map(h => h.offset);
        this._handlerStarts.sort();
        Object.freeze(this._handlerStarts);
    }

    determineHandlerFromOffset(offset: number): number {
        // declare var nodebinarysearch:any
        // return nodebinarysearch.first(this._handlerStarts,offset,(value:number,find:number) => {
        //    // find the first greater-than-or-equal-to
        //    if (find > value) return 0;
        //    else if (find < value) return 1;
        //    return 0;
        //  })
        
        if (this._handlerStarts.length && offset < this._handlerStarts[0]) {
            return -1;
        }

        for (let i = 0; i < this._handlerStarts.length; i++) {
            if (offset >= this._handlerStarts[i]) {
                return i;
            }
        }

        return -1;
    }
}

class MakeLowerCase {
    go(tk: ChvIToken) {
        if (!isTkType(tk, tks.TokenTkstringliteral)) {
            tk.image = tk.image.toLowerCase();
        }
    }
}

class SplitIntoLinesProducer {
    index = 0;
    constructor(protected instream: ChvIToken[], protected idgen: CountNumericId, protected makeLower: MakeLowerCase) {}

    nextWithnewlines(): O<ChvIToken[]> {
        let currentLine: ChvIToken[] = [];
        let limit = new LoopLimit(CodeLimits.maxTokensInLine, "maxTokensInLine");
        while (limit.next()) {
            let tk = this.instream[this.index];
            this.index += 1;

            // have we reached the end of the stream?
            if (tk === undefined) {
                return currentLine.length ? currentLine : undefined;
            }

            if (isTkType(tk, tks.TokenTknewline)) {
                return currentLine;
            } else {
                this.makeLower.go(tk);
                currentLine.push(tk);
            }
        }
    }

    next(): O<ChvIToken[]> {
        while(true) {
            let next = this.nextWithnewlines()
            if (next === undefined) {
                return undefined
            } else if (next && next.length === 0) {
                continue // skip empty lines
            } else if (next && next.length === 1 && isTkType(next[0], tks.TokenTknewline) ) {
                continue // skip only newlines
            } else {
                return next
            }
        }
    }
}

class SyntaxRewriter {
    protected readonly buildFake = new BuildFakeTokens();
    protected readonly expandCustomFns: ExpandCustomFunctions
    constructor(protected idgen: CountNumericId, protected idgenThisScript: CountNumericId, protected mapBuiltinCmds:MapBuiltinCmds, protected check: CheckReservedWords) {
        this.expandCustomFns = new ExpandCustomFunctions(idgenThisScript, mapBuiltinCmds, check)
    }

    go(totalLine: ChvIToken[]): ChvIToken[][] {
        assertTrue(totalLine.length > 0, "5&|line is empty");
        let ret:ChvIToken[][] = []
        let expanded = this.expandCustomFns.go(totalLine)
        for (let i=0; i<expanded.length; i++) {
            let line = expanded[i]
            let firsttoken = line[0].image;
            let methodname = "rewrite_" + firsttoken;
            let rewritten = Util512.callAsMethodOnClass("SyntaxRewriter", this, methodname, [line], true);
            rewritten = !rewritten ? [line] : rewritten;
            ret = ret.concat(rewritten)
        }

        return ret
    }

    protected replaceIdentifierWithSyntaxMarker(
        line: ChvIToken[],
        search: string,
        maxTimes: number,
        needed: "" | "required" = "",
        whichMarker = ""
    ) {
        let count = 0;
        for (let i = 0; i < line.length; i++) {
            if (isTkType(line[i], tks.TokenTkidentifier) && line[i].image === search) {
                line[i] = this.buildFake.makeSyntaxMarker(line[i], whichMarker);
                count += 1;
                if (count >= maxTimes) {
                    break;
                }
            }
        }

        if (needed === "required" && count !== maxTimes) {
            throw makeVpcScriptErr(`5%|syntax error, did not see the keyword "${search}"`);
        }

        return count;
    }

    rewrite_answer(line: ChvIToken[]) {
        // real syntax: answer <FACTOR> [with <FACTOR> [ or <FACTOR> [ or <FACTOR>]]]
        // turn the 'with' into TkSyntaxMarker for easier parsing later
        // safe because there won't ever be a real variable/function called "with".
        this.replaceIdentifierWithSyntaxMarker(line, "with", 1);
    }

    rewrite_ask(line: ChvIToken[]) {
        // real syntax: ask [password] <Expr> [with <Expr>]
        // turn the 'with' into TkSyntaxMarker for easier parsing later
        // turn the 'password' into TkSyntaxComma for easier parsing later
        this.replaceIdentifierWithSyntaxMarker(line, "with", 1);
        if (line.length > 0 && isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "password") {
            line[1] = this.buildFake.makeSyntaxMarker(line[1], ",");
        }
    }

    rewrite_choose(line: ChvIToken[]) {
        // original syntax: choose browse tool, choose round rect tool, choose tool 3
        // my syntax (much simpler): choose "browse" tool, choose "round rect" tool
        checkThrow(line.length > 2, `8l|not enough args given for choose, expected 'choose tool 3' or 'choose line tool'`);
        this.replaceIdentifierWithSyntaxMarker(line, "tool", 1, "required")
    }

    rewrite_click(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, "with", 1);
    }

    rewrite_drag(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, "with", 1);
    }

    rewrite_wait(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, "for", 1);
    }

    rewrite_divide(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, "by", 1, "required");
    }

    rewrite_multiply(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, "by", 1, "required");
    }

    rewrite_subtract(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, "from", 1, "required");
    }

    rewrite_pass(line: ChvIToken[]) {
        // add a return statement afterwards, solely to make code exec simpler.
        let newline: ChvIToken[] = [];
        newline.push(this.buildFake.makeIdentifier(line[0], "return"));
        newline.push(this.buildFake.makeNumLiteral(line[0], 0));
        return [line, newline];
    }

    rewrite_go(line: ChvIToken[]) {
        // we no longer support "go back" and "go forth".
        // they'd be wrongly parsed (eaten by NtDest / Position) anyways
        checkThrow(line.length > 1, "8k|can't have just 'go' on its own. try 'go next' or 'go prev' ");
        checkThrow(line[1].image !== "back", "8j|we don't support 'go back', instead use 'go next' or 'go prev' or 'go card 2'.");
        checkThrow(line[1].image !== "forth", "8i|we don't support 'go forth', instead use 'go next' or 'go prev' or 'go card 2'.");
    }

    rewrite_put(line: ChvIToken[]) {
        // transform put "abc" into x
        // into
        // put "abc" (marker) into (marker) x
        let findwhere = (s: string) => line.findIndex(tk => isTkType(tk, tks.TokenTkidentifier) && tk.image === s);
        let findInto = findwhere("into");
        let findBefore = findwhere("before");
        let findAfter = findwhere("after");
        let sum = [findInto === -1, findBefore === -1, findAfter === -1].filter(x => !x).length;
        if (sum === 0) {
            throw makeVpcScriptErr("5$|missing into, before, or after. we don't support 'put \"abc\"' to use the message box.");
        } else if (sum > 1) {
            throw makeVpcScriptErr("5#|expected to only see one of into, before, or after...");
        } else {
            let newmarker1 = this.buildFake.makeSyntaxMarker(line[0]);
            let newmarker2 = this.buildFake.makeSyntaxMarker(line[0]);
            let pos = [findInto, findBefore, findAfter].filter(x => x !== -1)[0];
            checkThrow(line.length > 1 && pos && pos > 0, "8h|line should not start with into,before,or after");
            line.splice(pos + 1, 0, newmarker1);
            line.splice(pos, 0, newmarker2);
        }
    }

    rewrite_exit(line: ChvIToken[]) {
        // simplifies logic later.
        // rewrite "exit to vpc" to "exit vpc"
        if (line.length > 1 && line[1].image === "to") {
            line.splice(1, 1);
        }
    }

    rewrite_show(line: ChvIToken[]) {
        this.replaceIdentifierWithSyntaxMarker(line, "at", 1);
    }

    rewrite_repeat(line: ChvIToken[]) {
        if (line.length > 1 && isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "forever") {
            // from 'repeat forever' to 'repeat'
            checkThrowEq(2, line.length, `8g|bad syntax, use 'repeat forever' not 'repeat forever xyz'`);
            line.splice(1, 1);
        } else if (line.length > 1 && isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "with") {
            // transform 'repeat with' into 'repeat while'
            return this.rewriteRepeatWith(line);
        } else if (
            line.length > 1 &&
            !(isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "until") &&
            !(isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "while")
        ) {
            // transform 'repeat for' into 'repeat while'
            return this.rewriteRepeatFor(line);
        }
    }

    static checkCommonMistakenVarNames(tk: O<ChvIToken>) {
        // not a thorough validation. but let's do simple checks here before they become more mysterious parse errors.
        checkThrow(!tk || !isTkType(tk, tks.TokenTkadjective), `8f|we don't support variables named "short", "long", etc`);
        checkThrow(!tk || !isTkType(tk, tks.TokenNumber), `8e|we don't support variables named "number"`);
        checkThrow(!tk || !isTkType(tk, tks.TokenLength), `8d|we don't support variables named "length"`);
        checkThrow(!tk || !isTkType(tk, tks.TokenId), `8c|we don't support variables named "id"`);
        checkThrow(!tk || !isTkType(tk, tks.TokenTkordinal), `8b|we don't support variables named "first", "last", "second", "middle", "any"`);
    }

    rewriteRepeatFor(line: ChvIToken[]) {
        /*
        Transform:
            repeat 5 times
                print x
            end repeat
        into a 'repeat with' that will then be transformed by rewriteRepeatWith
        */
        let ret: ChvIToken[][] = [];
        let msg = `bad repeat statement. needed 'repeat 5' or 'repeat for 5 times'`;
        checkThrow(line.length >= 2, msg + "wrong length", '8a|');
        if (isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "for") {
            line.splice(1, 1);
        }
        if (isTkType(line[line.length - 1], tks.TokenTkidentifier) && line[line.length - 1].image === "times") {
            line.splice(line.length - 1, 1);
        }

        checkThrow(line.length >= 2, msg + "no expression found", '8Z|');

        // use a number relative to this script -- otherwise it would change on
        // every re-compile, it'd be a bit slower because wouldn't be found in the cache
        let newvarname = `tmploopvar^^${this.idgenThisScript.next()}`;
        let repeatWith = [
            this.buildFake.makeIdentifier(line[0], "repeat"),
            this.buildFake.makeIdentifier(line[0], "with"),
            this.buildFake.makeIdentifier(line[0], newvarname),
            this.buildFake.makeGreaterLessThanEqual(line[0], "="),
            this.buildFake.makeNumLiteral(line[0], 1),
            this.buildFake.make(line[0], tks.TokenTo),
        ];

        repeatWith = repeatWith.concat(line.slice(1));
        return this.rewriteRepeatWith(repeatWith);
    }

    rewriteRepeatWith(line: ChvIToken[]) {
        /*
        Transform:
                repeat with x = 3+got1() to 7+needthis()
                    print x
                end repeat
        Into:
                put (3+got1()) into tmpvar
                put tmpvar into x
                repeat while tmpvar <= (7+needthis())
                    put tmpvar into x
                    put tmpvar+1 into tmpvar
                    print x
                end repeat
        */

        let ret: ChvIToken[][] = [];
        let msg = `bad repeat with statement. needed 'repeat with x = 1 to 3' : `;
        checkThrow(line.length >= 7, msg + "wrong length", '8Y|');
        checkThrow(isTkType(line[0], tks.TokenTkidentifier) && line[0].image === "repeat", `8X|missing "repeat"`);
        checkThrow(isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "with", `8W|missing "with"`);
        checkThrow(
            isTkType(line[2], tks.TokenTkidentifier) && this.check.okLocalVar(line[2].image),
            `8V|missing "x" or "x" is a reserved word like "a" or "sin"`
        );
        checkThrow(isTkType(line[3], tks.TokenTkgreaterorlessequalorequal) && line[3].image === "=", `8U|missing "="`);
        let indexOfTo = -1;
        for (let i = 0; i < line.length; i++) {
            if (isTkType(line[i], tks.TokenTo)) {
                indexOfTo = i;
                break;
            }
        }

        checkThrow(indexOfTo !== -1, msg + 'missing "to"', '8T|');
        let isCountDown = isTkType(line[indexOfTo - 1], tks.TokenTkidentifier) && line[indexOfTo - 1].image === "down";
        let visiblecountvar = line[2].image;
        let initExprStart = 4;
        let initExprEnd = isCountDown ? indexOfTo - 1 : indexOfTo;
        let limitExprStart = indexOfTo + 1;
        let limitExprEnd = line.length;
        let newvarname = `tmploopvar^^${this.idgenThisScript.next()}`;
        let incOrDec = [
            this.buildFake.makeIdentifier(line[0], newvarname),
            this.buildFake.makePlusMinus(line[0], isCountDown ? "-" : "+"),
            this.buildFake.makeNumLiteral(line[0], 1),
        ];

        ret.push(this.buildPutIntoStatement(newvarname, line, initExprStart, initExprEnd));
        ret.push(this.buildPutIntoStatement(visiblecountvar, [this.buildFake.makeIdentifier(line[0], newvarname)]));
        ret.push(this.buildRepeatWhile(newvarname, isCountDown ? ">=" : "<=", line, limitExprStart, limitExprEnd));
        ret.push(this.buildPutIntoStatement(visiblecountvar, [this.buildFake.makeIdentifier(line[0], newvarname)]));
        ret.push(this.buildPutIntoStatement(newvarname, incOrDec));
        return ret;
    }

    buildPutIntoStatement(destination: string, expr: ChvIToken[], exprstart: O<number> = undefined, exprend: O<number> = undefined) {
        let newcode: ChvIToken[] = [];
        newcode.push(this.buildFake.makeIdentifier(expr[0], "put"));
        newcode.push(this.buildFake.make(expr[0], tks.TokenTklparen));
        let slice = expr.slice(exprstart, exprend)
        checkThrow(slice.length > 0, '8S|wrong length, not enough tokens')
        newcode = newcode.concat(slice);
        newcode.push(this.buildFake.make(expr[0], tks.TokenTkrparen));
        newcode.push(this.buildFake.makeIdentifier(expr[0], "into"));
        newcode.push(this.buildFake.makeIdentifier(expr[0], destination));
        this.rewrite_put(newcode);
        return newcode;
    }

    buildRepeatWhile(counter: string, direction: typeGreaterLessThanEqual, expr: ChvIToken[], exprstart: number, exprend: number) {
        let newcode: ChvIToken[] = [];
        newcode.push(this.buildFake.makeIdentifier(expr[0], "repeat"));
        newcode.push(this.buildFake.makeIdentifier(expr[0], "while"));
        newcode.push(this.buildFake.makeIdentifier(expr[0], counter));
        newcode.push(this.buildFake.makeGreaterLessThanEqual(expr[0], direction));
        newcode.push(this.buildFake.make(expr[0], tks.TokenTklparen));
        let slice = expr.slice(exprstart, exprend)
        checkThrow(slice.length > 0, '8R|wrong length, not enough tokens')
        newcode = newcode.concat(slice);
        newcode.push(this.buildFake.make(expr[0], tks.TokenTkrparen));
        return newcode;
    }
}

class ExpandCustomFunctions {
    protected readonly buildFake = new BuildFakeTokens();    
    constructor(protected idgenThisScript: CountNumericId, protected mapBuiltinCmds:MapBuiltinCmds, protected check:CheckReservedWords) {
    }

    go(line:ChvIToken[]):ChvIToken[][] {
        if (this.supportsCustomFnExpansion(line)) {
            return this.rewriteToAllowCustomFns(line)
        } else {
            let isPotentialUserFn = (n:number, s:string) => this.check.potentialUserFn(s)
            let found = this.findAFunctionCall(line, 1, line.length, isPotentialUserFn)
            if (found) {
                throw makeVpcScriptErr(`5!|this looks like a custom function call ${line[found[0]].image}(), 
                but we don't yet support custom fn calls in this type of line. 
                try putting into another variable first.`)
            }
            return [line]
        }
    }

    protected supportsCustomFnExpansion(line:ChvIToken[]) {
        return line.length > 0 && isTkType(line[0], tks.TokenTkidentifier) && (
            line[0].image === 'if' ||
            line[0].image === 'return' ||
            this.mapBuiltinCmds.find(line[0].image))
    }

    findAFunctionCall(ln:ChvIToken[], start:number, end:number, filterCalls:(n:number, s:string)=>boolean) : O<[number, number]> {
        // function call has TkIdentifier, LParen, then a RParen at the same level
        // find a TkIdentifier next to a LParen
        let foundCall = -1
        for (let i = start; i<end-1; i++) {
            if (ln[i] && isTkType(ln[i], tks.TokenTkidentifier) && 
            ln[i+1] && isTkType(ln[i+1], tks.TokenTklparen) && 
                filterCalls(i, ln[i].image)) {
                    foundCall = i
                    break
                }
        }

        if (foundCall != -1) {
            // find the closing paren
            let level = 0
            let foundEnd = -1
            for (let i = foundCall; i<end; i++) {
                if (isTkType(ln[i], tks.TokenTklparen)) {
                    level++
                } else if (isTkType(ln[i], tks.TokenTkrparen)) {
                    level--
                    if (level === 0) {
                        foundEnd = i
                        break
                    }
                }
            }

            checkThrow(foundEnd != -1, "8Q|missing ) for function call?", ln[foundCall].image)
            return [foundCall, foundEnd + 1]
        }
    }

    rewriteToAllowCustomFns(line: ChvIToken[]) {
        let ret: ChvIToken[][] = [];
        let limit = new LoopLimit(CodeLimits.maxCustomFnCallsAllowedInLine, "maxCustomFnCallsAllowedInLine");
        let cantUseYetAr = new refparam<{ [key: number]: boolean }>({})
        while (limit.next()) {
            // look for a custom function call
            let isPotentialUserFn = (n:number, s:string) => !cantUseYetAr.val[n] && this.check.potentialUserFn(s)
            let found = this.findAFunctionCall(line, 1, line.length, isPotentialUserFn)
            if (!found) {
                break
            }

            // is there a custom function call *within* this call?
            let [callstart, callend] = found
            let foundInside = this.findAFunctionCall(line, callstart + 1, callend, isPotentialUserFn)
            if (foundInside) {
                // there is a custom fn inside, can't process it yet
                cantUseYetAr.val[callstart] = true
            } else {
                // let's process this one
                this.expandAFnCall(ret, line, callstart, callend)

                // reset, since one we couldn't do before we might be able to do now
                cantUseYetAr.val = {}
            }
        }

        ret.push(line);
        return ret;
    }

    expandAFnCall(ret: ChvIToken[][], line: ChvIToken[], start: number, end: number) {
        assertTrue(isTkType(line[start], tks.TokenTkidentifier), "5 |line did not start w identifier");
        assertTrue(isTkType(line[start + 1], tks.TokenTklparen), "5z|line did not start w identifier(");
        assertTrue(isTkType(line[end - 1], tks.TokenTkrparen), "5y|line did not end w )");
        let stmtCall: ChvIToken[] = [];
        let stmtPut: ChvIToken[] = [];
        let newvarname = `tmpvar^^${this.idgenThisScript.next()}`;

        // create new line of code calling this fn
        checkThrow(this.check.potentialUserFn(line[start].image), '8P|must be valid userfn', line[start].image)
        stmtCall.push(line[start]);
        assertEq(line[start + 1].image, "(", "5x|expected to start with lparen");
        assertEq(line[end - 1].image, ")", "5w|expected to end with rparen");
        let argsNoParens = line.slice(start + 2, end - 1);
        stmtCall = stmtCall.concat(argsNoParens);
        ret.push(stmtCall);

        // rewrite the syntax, replacing the function call with the new variable!
        line.splice(start, end - start, this.buildFake.makeIdentifier(line[0], newvarname));

        // put results of the call into the temporary variable
        stmtPut.push(this.buildFake.makeIdentifier(line[0], "put"));
        stmtPut.push(this.buildFake.makeIdentifier(line[0], "result"));
        stmtPut.push(this.buildFake.make(line[0], tks.TokenTklparen));
        stmtPut.push(this.buildFake.make(line[0], tks.TokenTkrparen));
        stmtPut.push(this.buildFake.makeIdentifier(line[0], "into"));
        stmtPut.push(this.buildFake.makeIdentifier(line[0], newvarname));
        ret.push(stmtPut);
    }
}

export enum VpcLineCategory {
    __isUI512Enum = 1,
    invalid,
    handlerStart,
    handlerEnd,
    handlerExit,
    productExit,
    handlerPass,
    returnExpr,
    ifStart,
    ifElsePlain,
    ifElse,
    ifEnd,
    repeatExit,
    repeatNext,
    repeatForever,
    repeatUntil,
    repeatWhile,
    repeatEnd,
    declareGlobal,
    statement,
    callHandler,
}

class MapBuiltinCmds extends MapKeyToObject<Function> {
    constructor(parser: ChvParserClass) {
        super()
        this.add("add", parser.RuleBuiltinCmdAdd);
        this.add("answer", parser.RuleBuiltinCmdAnswer);
        this.add("ask", parser.RuleBuiltinCmdAsk);
        this.add("beep", parser.RuleBuiltinCmdBeep);
        this.add("choose", parser.RuleBuiltinCmdChoose);
        this.add("click", parser.RuleBuiltinCmdClick);
        this.add("create", parser.RuleBuiltinCmdCreate);
        this.add("delete", parser.RuleBuiltinCmdDelete);
        this.add("disable", parser.RuleBuiltinCmdDisable);
        this.add("divide", parser.RuleBuiltinCmdDivide);
        this.add("drag", parser.RuleBuiltinCmdDrag);
        this.add("enable", parser.RuleBuiltinCmdEnable);
        this.add("get", parser.RuleBuiltinCmdGet);
        this.add("go", parser.RuleBuiltinCmdGoCard);
        this.add("hide", parser.RuleBuiltinCmdHide);
        this.add("lock", parser.RuleBuiltinCmdLock);
        this.add("multiply", parser.RuleBuiltinCmdMultiply);
        this.add("put", parser.RuleBuiltinCmdPut);
        this.add("reset", parser.RuleBuiltinCmdReset);
        this.add("set", parser.RuleBuiltinCmdSet);
        this.add("show", parser.RuleBuiltinCmdShow);
        this.add("sort", parser.RuleBuiltinCmdSort);
        this.add("subtract", parser.RuleBuiltinCmdSubtract);
        this.add("unlock", parser.RuleBuiltinCmdUnlock);
        this.add("visual", parser.RuleBuiltinCmdVisual);
        this.add("wait", parser.RuleBuiltinCmdWait);
        this.freeze();
    }
}

class DetermineCategory {
    buildFake = new BuildFakeTokens();
    sharedRequestEval: ChvIToken;
    sharedRequestUserHandler: ChvIToken;
    constructor(protected idgen: CountNumericId, protected parser: ChvParserClass, protected mapBuiltinCmds: MapBuiltinCmds, protected check: CheckReservedWords) {
        this.sharedRequestEval = {
            image: CodeSymbols.requestEval,
            startOffset: -1,
            startLine: -1,
            startColumn: -1,
            endOffset: -1,
            endLine: -1,
            endColumn: -1,
            isInsertedInRecovery: false,
            tokenType: tokenType(tks.TokenTkidentifier),
            tokenClassName: undefined,
        };

        this.sharedRequestUserHandler = {
            image: CodeSymbols.requestHandlerCall,
            startOffset: -1,
            startLine: -1,
            startColumn: -1,
            endOffset: -1,
            endLine: -1,
            endColumn: -1,
            isInsertedInRecovery: false,
            tokenType: tokenType(tks.TokenTkidentifier),
            tokenClassName: undefined,
        };
    }

    go(line: ChvIToken[]): VpcCodeLine {
        checkThrow(line && line.length > 0, `8O|we don't allow empty lines of code`);
        checkThrow(
            isTkType(line[0], tks.TokenTkidentifier),
            `8N|The first word of this line (${line[0].image}) is not a valid command or keyword.`
        );
        let firstImage = line[0].image;
        let output = new VpcCodeLine(this.idgen.next(), line);
        if (this.mapBuiltinCmds.find(firstImage)) {
            this.go_builtincmd(firstImage, line, output);
            return output;
        } else {
            let methodname = `go_${firstImage.replace(/\^/g, "")}`;
            methodname = (this as any)[methodname] ? methodname : "go_customhandler";
            let ret = Util512.callAsMethodOnClass("DetermineCategory", this, methodname, [line, output], false);
            assertTrue(ret === undefined, "5v|expected undefined but got", ret);
            if (!output.getParseRule() && output.excerptToParse.length > 0) {
                // handlerStart and declareGlobal put data in excerptToParse, but only as a place to store things
                if (this.isParsingNeeded(output.ctg)) {
                    output.setParseRule(this.parser.RuleTopLevelRequestEval);
                    output.excerptToParse = [this.sharedRequestEval].concat(output.excerptToParse);
                }
            }

            return output;
        }
    }

    protected isParsingNeeded(ctg:VpcLineCategory) {
        switch(ctg) {
            case VpcLineCategory.handlerStart: // fall-through
            case VpcLineCategory.handlerEnd: // fall-through
            case VpcLineCategory.handlerExit: // fall-through
            case VpcLineCategory.productExit: // fall-through
            case VpcLineCategory.handlerPass: // fall-through
            case VpcLineCategory.ifElsePlain: // fall-through
            case VpcLineCategory.ifEnd: // fall-through
            case VpcLineCategory.repeatExit: // fall-through
            case VpcLineCategory.repeatNext: // fall-through
            case VpcLineCategory.repeatForever: // fall-through
            case VpcLineCategory.repeatEnd: // fall-through
            case VpcLineCategory.declareGlobal: // fall-through
                return false;
            default:
                return true; 
        }
    }

    go_builtincmd(firstImage: string, line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.statement;
        output.excerptToParse = line;
        output.setParseRule(this.mapBuiltinCmds.get(firstImage));
    }

    go_customhandler(line: ChvIToken[], output: VpcCodeLine) {
        if (line.length > 1) {
            // kind reminders to the user
            let firsttoken = line[0];
            checkThrow(line[1].image !== "=", `8M|this isn't C... you need to use 'put 1 into x' not 'x = 1'`);
            checkThrow(
                !firsttoken.endOffset || (line[1].image !== "(" || line[1].startOffset > firsttoken.endOffset + 1),
                `8L|this isn't C... you need to say 'put fn() into x' or 'get fn()' but not 'fn()' alone`
            );
        }

        output.ctg = VpcLineCategory.callHandler;
        checkThrow(
            this.check.okHandlerName(line[0].image),
            `8K|it looked like you were calling a handler like mouseUp or myHandler, but this is a reserved word.`
        );
        output.excerptToParse = [this.sharedRequestUserHandler].concat(line);
        output.setParseRule(this.parser.RuleTopLevelRequestHandlerCall);
    }

    go_requesteval(line: ChvIToken[], output: VpcCodeLine) {
        checkThrow(false, `8J|we shouldn't reach this yet, we don't add them until after this step.`);
    }

    helper_getListOfValidIdentifiers(line: ChvIToken[], output: VpcCodeLine, index:number) {
        for (let i = index; i < line.length; i++) {
            SyntaxRewriter.checkCommonMistakenVarNames(line[i]);
            checkThrow(this.check.okLocalVar(line[i].image), `8I|name of parameter is a reserved word.`);

            if ((i - index) % 2 === 1) {
                checkThrowEq(
                    tokenType(tks.TokenTkcomma),
                    line[i].tokenType,
                    `8H|required comma every other param (expected on myhandler x, y, z)`,
                    line[i].image
                );
            } else {
                checkThrowEq(
                    tokenType(tks.TokenTkidentifier),
                    line[i].tokenType,
                    `8G|parameter is not a valid variable name (expected on myhandler x, y, z)`,
                    line[i].image
                );

                output.excerptToParse.push(line[i]);
            }
        }
    }

    helper_handlerStart(line: ChvIToken[], output: VpcCodeLine, firstToken:ChvIToken) {
        output.ctg = VpcLineCategory.handlerStart;
        checkThrow(line.length > 1, `8F|cannot have a line that is just "on"`);
        SyntaxRewriter.checkCommonMistakenVarNames(line[1]);
        checkThrow(this.check.okHandlerName(line[1].image), `8E|name of handler is a reserved word.`);
        checkThrowEq(tokenType(tks.TokenTkidentifier), line[1].tokenType, `8D|expected "on myhandler" but got "on <invalid name>`);

        output.excerptToParse.push(firstToken); // 'on' or 'func'
        output.excerptToParse.push(line[1]); // name of handler
        this.helper_getListOfValidIdentifiers(line, output, 2)
    }

    go_on(line: ChvIToken[], output: VpcCodeLine) {
        return this.helper_handlerStart(line, output, line[0])
    }

    go_func(line: ChvIToken[], output: VpcCodeLine) {
        return this.helper_handlerStart(line, output, line[0])
    }

    go_global(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.declareGlobal;
        checkThrow(line.length > 1, `8C|cannot have a line that is just "global"`);
        this.helper_getListOfValidIdentifiers(line, output, 1)
    }

    go_handlerend_common(line: ChvIToken[], output: VpcCodeLine, s: string) {
        checkThrowEq(2, line.length, `8B|wrong line length, in '${s} myhandler'`);
        SyntaxRewriter.checkCommonMistakenVarNames(line[1]);
        checkThrow(
            this.check.okHandlerName(line[1].image),
            `8A|we think you are trying to say '${s} myhandler', but name of handler is a reserved word.`
        );
        checkThrowEq(
            tokenType(tks.TokenTkidentifier),
            line[1].tokenType,
            `89|expected "end myhandler" but name of my handler is not valid`
        );

        output.excerptToParse.push(line[0]);
        output.excerptToParse.push(line[1]);
    }

    go_end_handler(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.handlerEnd;
        this.go_handlerend_common(line, output, "end");
    }

    go_exit_handler(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.handlerExit;
        this.go_handlerend_common(line, output, "exit");
    }

    go_pass(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.handlerPass;
        this.go_handlerend_common(line, output, "pass");
    }

    go_exit_product(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.productExit;
    }

    go_return(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.returnExpr;
        checkThrow(line.length > 1, `88|cannot have a line that is just "return". if you really want to return void, try exit myhandler.`);
        output.excerptToParse = line.slice(1);
    }

    go_if(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.ifStart;
        let lasttk = line[line.length - 1];
        checkThrow(isTkType(lasttk, tks.TokenTkidentifier) && lasttk.image === "then", `87|expected line to end with "then". 'if x > 2 then' `);
        checkThrow(line.length > 2, `86|cannot have a line that is just "if then"`);
        output.excerptToParse = line.slice(1, -1);
    }

    go_else_if_cond(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.ifElse;
        let lasttk = line[line.length - 1];
        checkThrow(
            isTkType(lasttk, tks.TokenTkidentifier) && lasttk.image === "then",
            `85|expected line to end with "then". 'else if x > 3 then' `
        );
        checkThrow(line.length > 3, `84|cannot have a line that is just "else if then"`);
        checkThrow(
            isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "if",
            `83|expected line to be 'else if x > 3 then' but 'if' not seen`
        );
        output.excerptToParse = line.slice(2, -1);
    }

    go_else_if_plain(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.ifElsePlain;
        checkThrowEq(1, line.length, `82|line should be just 'else'`);
    }

    go_end_if(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.ifEnd;
        checkThrowEq(2, line.length, `81|line should be just 'end if'`);
    }

    go_else(line: ChvIToken[], output: VpcCodeLine) {
        if (line.length > 1) {
            this.go_else_if_cond(line, output);
        } else {
            this.go_else_if_plain(line, output);
        }
    }

    go_exit_repeat(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.repeatExit;
        checkThrowEq(2, line.length, `80|line should be just 'exit repeat'`);
    }

    go_end_repeat(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.repeatEnd;
        checkThrowEq(2, line.length, `7~|line should be just 'end repeat'`);
    }

    go_next(line: ChvIToken[], output: VpcCodeLine) {
        output.ctg = VpcLineCategory.repeatNext;
        checkThrowEq(2, line.length, `7}|line should be just 'next repeat'`);
        checkThrow(isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "repeat", `7||line should be just 'next repeat'`);
    }

    go_repeat(line: ChvIToken[], output: VpcCodeLine) {
        if (line.length === 1) {
            output.ctg = VpcLineCategory.repeatForever;
        } else if (isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "while") {
            output.ctg = VpcLineCategory.repeatWhile;
            checkThrow(line.length > 2, `7{|can't have "repeat while" without an expression`);
            output.excerptToParse = line.slice(2)
        } else if (isTkType(line[1], tks.TokenTkidentifier) && line[1].image === "until") {
            output.ctg = VpcLineCategory.repeatUntil;
            checkThrow(line.length > 2, `9e|can't have "repeat until" without an expression`);
            output.excerptToParse = line.slice(2)
        } else {
            throw makeVpcScriptErr(
                `5u|unsupported repeat type. need repeat forever, repeat 5 times, repeat with, repeat while, repeat until.`
            );
        }
    }

    go_end(line: ChvIToken[], output: VpcCodeLine) {
        checkThrow(line.length > 1, `7_|cannot have a line that is just "end"`);
        checkThrowEq(2, line.length, `7^|wrong line length. expected "end if", "end repeat", "end handler"`);
        checkThrowEq(tokenType(tks.TokenTkidentifier), line[1].tokenType, `7]|expected one of: "end if", "end repeat", "end handler"`);
        if (line[1].image === "if") {
            return this.go_end_if(line, output);
        } else if (line[1].image === "repeat") {
            return this.go_end_repeat(line, output);
        } else {
            return this.go_end_handler(line, output);
        }
    }

    go_exit(line: ChvIToken[], output: VpcCodeLine) {
        checkThrow(line.length > 1, `7[|cannot have a line that is just "exit"`);
        checkThrow(line.length === 2, `7@|wrong line length, expected "exit myhandler", "exit repeat", "exit to ${cProductName}"`);
        checkThrowEq(
            tokenType(tks.TokenTkidentifier),
            line[1].tokenType,
            `7?|expected "exit myhandler", "exit repeat", "exit to ${cProductName}"`
        );
        if (line[1].image === "repeat") {
            return this.go_exit_repeat(line, output);
        } else if (line[1].image === cProductName.toLowerCase()) {
            return this.go_exit_product(line, output);
        } else {
            return this.go_exit_handler(line, output);
        }
    }
}

export class VpcCodeLineReference {
    readonly offset: number;
    readonly lineid: number;
    constructor(line: VpcCodeLine) {
        assertTrue(line.offset !== undefined && line.offset >= 0, "5t|invalid line");
        assertTrue(line.lineId !== undefined && line.lineId >= 0, "5s|invalid line");
        this.offset = line.offset;
        this.lineid = line.lineId;
    }
}

// remember the entrance/exit points of a block.
// we'll use this to set the blockInformation for these lines,
// so that e.g. a loop knows which offset to go back up to.
class BranchTrackingBlock {
    constructor(public readonly cat: VpcLineCategory, firstline?: VpcCodeLine) {
        if (firstline) {
            this.add(firstline);
        }
    }

    add(line: VpcCodeLine) {
        this.relevantLines.push(line);
    }

    relevantLines: VpcCodeLine[] = [];
}

// create a BranchTrackingBlock for each block,
// also makes sure the opening/closing of a block is correct.
class BranchTracking {
    handlers = new MapKeyToObject<VpcCodeLineReference>();
    stackBlocks: BranchTrackingBlock[] = [];

    constructor(protected idgen: CountNumericId) {}

    findCurrentLoop() {
        for (let i = this.stackBlocks.length - 1; i >= 0; i--) {
            if (this.stackBlocks[i].cat === VpcLineCategory.repeatForever) {
                return this.stackBlocks[i];
            }
        }

        throw makeVpcScriptErr(`5r|cannot call 'exit repeat' or 'next repeat' outside of a loop`);
    }

    findCurrentHandler(): BranchTrackingBlock {
        checkThrowEq(VpcLineCategory.handlerStart, this.stackBlocks[0].cat, `7>|could not find current handler`);
        return this.stackBlocks[0];
    }

    finalizeBlock() {
        let topOfStack = this.stackBlocks[this.stackBlocks.length - 1];
        let references = topOfStack.relevantLines.map(ln => new VpcCodeLineReference(ln));
        for (let line of topOfStack.relevantLines) {
            line.blockInfo = references;
        }

        this.stackBlocks.pop();
    }

    ensureComplete() {
        checkThrowEq(0, this.stackBlocks.length, `7=|missing 'end myHandler' at end of script.`);
    }

    go(line: VpcCodeLine) {
        if (this.stackBlocks.length === 0 && line.ctg !== VpcLineCategory.handlerStart) {
            throw makeVpcScriptErr(`5q|only 'on mouseup' and 'func myfunction' can exist at this scope`);
        } else if (this.stackBlocks.length > 0 && line.ctg === VpcLineCategory.handlerStart) {
            throw makeVpcScriptErr(`5p|cannot begin a handler inside an existing handler`);
        }

        switch (line.ctg) {
            case VpcLineCategory.repeatForever: // fall-through
            case VpcLineCategory.repeatWhile: // fall-through
            case VpcLineCategory.repeatUntil:
                this.stackBlocks.push(new BranchTrackingBlock(VpcLineCategory.repeatForever, line));
                break;
            case VpcLineCategory.repeatNext: // fall-through
            case VpcLineCategory.repeatExit:
                let tracking = this.findCurrentLoop();
                tracking.add(line);
                break;
            case VpcLineCategory.repeatEnd:
                let topOfStack = this.stackBlocks[this.stackBlocks.length - 1];
                checkThrowEq(VpcLineCategory.repeatForever, topOfStack.cat, `7<|cannot "end repeat" interleaved within some other block.`);
                topOfStack.add(line);
                this.finalizeBlock();
                break;
            case VpcLineCategory.ifStart:
                this.stackBlocks.push(new BranchTrackingBlock(VpcLineCategory.ifStart, line));
                break;
            case VpcLineCategory.ifElse: // fall-through
            case VpcLineCategory.ifElsePlain:
                topOfStack = this.stackBlocks[this.stackBlocks.length - 1];
                checkThrowEq(VpcLineCategory.ifStart, topOfStack.cat, `7;|cannot have an "else" interleaved within some other block.`);
                topOfStack.add(line);
                break;
            case VpcLineCategory.ifEnd:
                topOfStack = this.stackBlocks[this.stackBlocks.length - 1];
                checkThrowEq(VpcLineCategory.ifStart, topOfStack.cat, `7:|cannot have an "end if" interleaved within some other block.`);
                topOfStack.add(line);
                this.finalizeBlock();
                break;
            case VpcLineCategory.handlerStart:
                this.stackBlocks.push(new BranchTrackingBlock(VpcLineCategory.handlerStart, line));
                break;
            case VpcLineCategory.handlerEnd:
                topOfStack = this.stackBlocks[this.stackBlocks.length - 1];
                checkThrowEq(
                    VpcLineCategory.handlerStart,
                    topOfStack.cat,
                    `7/|cannot have an "end myHandler" interleaved within some other block.`
                );
                topOfStack.add(line);
                this.checkStartAndEndMatch(topOfStack.relevantLines);
                let firstname = topOfStack.relevantLines[0].excerptToParse[1].image;

                // call add() so that we'll throw if there is a duplicate
                this.handlers.add(firstname, new VpcCodeLineReference(topOfStack.relevantLines[0]));
                this.finalizeBlock();
                break;
            case VpcLineCategory.handlerExit: // fall-through
            case VpcLineCategory.handlerPass:
                // if we're in "on mouseup", it's illegal to say "exit otherHandler"
                let currentHandlerStart = this.findCurrentHandler().relevantLines[0];
                checkThrow(currentHandlerStart.excerptToParse.length > 1, "7.|expected on myHandler, not found");
                let currentHandlerName = currentHandlerStart.excerptToParse[1].image;
                let gotName = line.excerptToParse[1].image;
                checkThrowEq(gotName, currentHandlerName, "7-|we are in handler but got exit otherHandler", currentHandlerName, gotName);
                break;
            case VpcLineCategory.invalid:
                throw makeVpcInternalErr("5o|should not have this line category");
            default:
                break;
        }
    }

    checkStartAndEndMatch(lines: VpcCodeLine[]) {
        checkThrow(lines[0].excerptToParse.length > 1, "7,|on myHandler, missing name of handler");
        let firstname = lines[0].excerptToParse[1].image;
        let lastline = lines[lines.length - 1];
        checkThrow(lastline.excerptToParse.length > 1, "7+|end myHandler, missing name of handler");
        let lastname = lastline.excerptToParse[1].image;
        checkThrowEq(lastname, firstname, `7*|handler names mismatch. startwith with "on ${firstname}" ended with "end ${lastname}"`);
    }
}

class LoopLimit {
    count: number;
    constructor(protected maxcount: number, protected msg = "") {
        this.count = maxcount;
    }

    next() {
        this.count--;
        if (this.count < 0) {
            throw makeVpcScriptErr(`5n|Unfortunately, we need to have limitations on scripts, in order to prevent denial of service.
                for ${this.msg}, the limit is ${this.maxcount}`);
        }

        return true;
    }
}

export enum CodeSymbols {
    requestHandlerCall = "$requesthandlercall",
    requestEval = "$requesteval",
}

export class CheckReservedWords {
    constants = new VariableCollectionConstants();
    isBuiltinHandler(s: string): boolean {
        // "mouseup", "arrowkey"
        return findStrToEnum<VpcBuiltinMsg>(VpcBuiltinMsg, s) !== undefined;
    }

    isBuiltinVarOrConstant(s: string): boolean {
        // "pi", "result"
        return !!this.constants.find(s) || s === "result" || s === "$result";
    }

    isPropertyName(s: string): boolean {
        // "autohilite", "style"
        return VpcElProductOpts.isAnyProp(s);
    }

    isBuiltinFunction(s: string): boolean {
        // "sin", "length", "result"
        return VpcBuiltinFunctions.isFunction(s);
    }

    isKeyword(s: string): boolean {
        // "from", "with", "to", "end"
        return partialReservedWordsList[s] || alsoReservedWordsList[s];
    }

    okHandlerName(s: string) {
        checkThrow(slength(s), `7)|invalid identifier ${s}`);
        return this.isBuiltinHandler(s) || (!this.isKeyword(s) && !this.isPropertyName(s) && !this.isBuiltinFunction(s) && !this.isBuiltinVarOrConstant(s));
    }

    okLocalVar(s: string) {
        checkThrow(slength(s), `7(|invalid identifier ${s}`);
        return s === 'a' || (
            !this.isKeyword(s) &&
            !this.isBuiltinHandler(s) &&
            !this.isPropertyName(s) &&
            !this.isBuiltinFunction(s) &&
            !this.isBuiltinVarOrConstant(s)
        );
    }

    potentialUserFn(s: string) {
        checkThrow(slength(s), `7&|invalid identifier ${s}`);
        return !this.isKeyword(s) &&
            !this.isBuiltinHandler(s) &&
            !this.isPropertyName(s) &&
            !this.isBuiltinFunction(s) &&
            !this.isBuiltinVarOrConstant(s);
    }
}
