
/* auto */ import { O, UI512ErrorHandling, assertTrue, makeVpcScriptErr, markUI512Err, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObject, MapKeyToObjectCanSet, Util512, ValHolder, slength } from '../../ui512/utils/utils512.js';
/* auto */ import { CodeLimits, CountNumericId, CountNumericIdNormal, VpcScriptErrorBase, VpcScriptSyntaxError } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { getParsingObjects } from '../../vpc/codeparse/vpcVisitor.js';
/* auto */ import { LoopLimit, MakeLowerCase, MapBuiltinCmds, SplitIntoLinesProducer } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpcCheckReserved.js';
/* auto */ import { VpcCodeLine, VpcCodeLineReference } from '../../vpc/codepreparse/vpcCodeLine.js';
/* auto */ import { DetermineCategory } from '../../vpc/codepreparse/vpcDetermineCategory.js';
/* auto */ import { ExpandIfElse } from '../../vpc/codepreparse/vpcExpandIfElse.js';
/* auto */ import { SyntaxRewriter } from '../../vpc/codepreparse/vpcRewrite.js';
/* auto */ import { BranchProcessing } from '../../vpc/codepreparse/vpcBranchProcessing.js';

/*
==========================================================
How Code Compilation + Execution Works In ViperCard
==========================================================

Part 1: codepreparse
    Run lexer on all input, getting a list of tokens
    SplitIntoLinesProducer splits into lines (and is aware of \ line continuation)
    MakeLowerCase makes identifiers lowercase, since the language is case insensitive
    SyntaxRewriter rewrites syntax for some lines:
    1) To minimize number of tokens needed in the lexer (for faster lexing)
        for example:
        ask line 2 of x with "defaultText"
        we could make 'with' a token so that it wouldn't get lumped into the expression line 2 of x.
        but we want to minimze number of tokens.
        so instead, during codepreparse, if the command is ask, replace any tokens that are exactly 'with'.
        ask line 2 of x $syntaxmarker$ "defaultText"
        a $syntaxmarker$ is never part of an expression, and so the parser has no difficulty.
    2) To transform "repeat with x=1 to 5" into a "repeat while" loop with the same functionality
    3) To simplify parsing for a few commands
    4) To expand custom function calls in an expression
        We don't want a custom function call inside an expression, because the custom fn call could take
        an arbitrarily long time to run, and we can't pause execution halfway through evaling an expression.
        We also want evalling an expression to be a pure function with no side effects.
        So, if a function call occurs inside an expression, we pull it outside:

        put 2 * mycustomfunc(5 + mycustomfunc(7 + sin(x))) into x
            -->
        mycustomfunc(7 + sin(x))
        put the result into tmp001
        put 2 * mycustomfunc(5 + tmp001) into x
            -->
        mycustomfunc(7 + sin(x))
        put the result into tmp001
        mycustomfunc(5 + tmp001)
        put the result into tmp002
        put 2 * tmp002 into x

    Next, DetermineCategory determines if a line is a syntax element like "end repeat"
    If the syntax element has an expression to evaluate, put the expression into the line's readyToParse
    Otherwise, we can skip running the parser entirely on the line, for better perf
    Run BranchProcessing so that syntax elements like "end repeat" see where to jump to the corresponding "repeat"
    Run BranchProcessing to confirm hierarchical structure: an "else" must appear in a valid "if", "end myHandler" must follow "on myHandler"

    The preparsed code is a list, loops work by telling the interpreter to jump to a different offset in the list.
    The code is then stored in the VpcAllCode instance.

Part 2: execution
    Code execution walks line-by-line through the list, running one line at a time
    It checks the type of the line:
        If there is no expression to be parsed, run the line and continue (such as onMouseUp or end repeat)
        Else if there is an expression to be parsed, see if it is in the _VpcCacheParsedLines_, and use that if possible
        Otherwise, run the parser
            (we run the chevrotain parser at runtime right when the code is being executed)
            the parser creates a CST object, save the results to the _VpcCacheParsedLines_
        Use the _visitor_ class to recurse through the CST object and evaluate the result
    Check how long we've been running the script, so that we're not stuck in a tight loop. if it's been too long,
        save the instruction offset and all state
        exit, the scheduler will call into us again in a few ms
    If the stack of execution frames is empty, we've completed the script.
*/

/**
 * stores all pre-parsed code
 */
export class VpcAllCode {
    constructor(idGen: CountNumericId) {
        this.idGen = idGen;
    }

    /* map vel id to code or syntax error*/
    protected code = new MapKeyToObjectCanSet<VpcCodeOfOneVel | VpcScriptSyntaxError>();

    /* processes code */
    protected processor = new VpcCodeProcessor();

    /* generates an id */
    readonly idGen: CountNumericId;

    /**
     * update the code of a vel.
     */
    updateCode(code: string, ownerId: string) {
        assertTrue(slength(ownerId), '5*|invalid owner id');
        let emptyCode = new VpcCodeOfOneVel(ownerId, code)
        this.code.set(ownerId, emptyCode);
        if (!code || code.match(/^\s*$/)) {
            /* there is no code, so exit early */
            this.code.set(ownerId, emptyCode);
            return;
        }

        let codeOfElem = new VpcCodeOfOneVel(ownerId, code);
        let latestSrcLineSeen = new ValHolder(0);
        let latestDestLineSeen = new ValHolder(new VpcCodeLine(0, []));
        let syntaxError: O<VpcScriptSyntaxError>;
        let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow
        try {
            UI512ErrorHandling.breakOnThrow = false
            codeOfElem.setHandlers(
                this.processor.go(code, codeOfElem.lines, this.idGen, latestSrcLineSeen, latestDestLineSeen)
            );
        } catch (e) {
            syntaxError = new VpcScriptSyntaxError();
            syntaxError.isScriptException = e.isVpcError;
            syntaxError.isExternalException = !e.isUi512Error;
            syntaxError.lineNumber = latestSrcLineSeen.val;
            syntaxError.velId = ownerId;
            syntaxError.lineData = latestDestLineSeen.val;
            syntaxError.details = e.message;
        } finally {
            UI512ErrorHandling.breakOnThrow = storedBreakOnThrow
        }

        if (syntaxError) {
            this.code.set(ownerId, syntaxError);
        } else {
            this.code.set(ownerId, codeOfElem);
            Util512.freezeRecurse(codeOfElem);
        }
    }

    /**
     * retrieve code for a vel
     * if code could not compile, returns a VpcScriptSyntaxError instance
     * returns undefined if the object has an empty script
     */
    getCompiledScript(id: string, rawScript:string): VpcCodeOfOneVel | VpcScriptSyntaxError {
        let foundInCache = this.code.find(id)
        if (foundInCache instanceof VpcCodeOfOneVel && foundInCache.rawScript === rawScript) {
            return foundInCache
        } else {
            /* cache might be out of date, recompile */
            this.updateCode(rawScript, id)
            return throwIfUndefined(this.code.find(id), '');
        }
    }

    /**
     * remove code for a vel
     */
    remove(id: string) {
        this.code.remove(id);
    }

    /**
     * find a handler in a script
     */
    findHandlerInScript(id: string, rawScript:string, handlername: string): O<[VpcCodeOfOneVel, VpcCodeLineReference]> {
        let ret = this.getCompiledScript(id, rawScript);
        let retAsCode = ret as VpcCodeOfOneVel;
        if (retAsCode && retAsCode.isVpcCodeOfOneVel) {
            /* check in the cached map of handlers */
            let handler = retAsCode.handlers.find(handlername);
            if (handler) {
                return [retAsCode, handler];
            }
        } else if (ret) {
            /* a syntax error occurred */
            let retAsErr = ret as VpcScriptErrorBase;
            if (retAsErr && retAsErr.isVpcScriptErrorBase) {
                let err = makeVpcScriptErr('JV|$compilation error$');
                markUI512Err(err, true, false, true, retAsErr);
                throw err;
            } else {
                throw makeVpcScriptErr('JU|VpcCodeOfOneVel did not return expected type ' + ret);
            }
        } else {
            /* it's fine, this vel has no code */
        }
    }

    /**
     * flush out unneeded code from deleted objects
     */
    doMaintenance(outside: OutsideWorldReadWrite) {
        let newCode = new MapKeyToObjectCanSet<VpcCodeOfOneVel | VpcScriptSyntaxError>();
        for(let key of this.code.getKeys()) {
            if (outside.FindVelById(key)) {
                newCode.set(key, this.code.get(key))
            }
        }

        this.code = newCode
    }
}

/**
 * top-level code processing
 */
class VpcCodeProcessor {
    go(
        code: string,
        output: VpcCodeLine[],
        idGen: CountNumericId,
        latestSrcLineSeen: ValHolder<number>,
        latestDestLineSeen: ValHolder<VpcCodeLine>
    ) {
        /* lex the input */
        let [lexer, parser, visitor] = getParsingObjects();
        let lexed = lexer.tokenize(code);
        if (lexed.errors.length) {
            latestSrcLineSeen.val = lexed.errors[0].line;
            let errmsg = lexed.errors[0].message.toString().substr(0, CodeLimits.LimitChevErr);
            throw makeVpcScriptErr(`5(|lex error: ${errmsg}`);
        }

        /* create a pipeline */
        let lineNumber = 0;
        let idGenThisScript = new CountNumericIdNormal();
        let makeLowercase = new MakeLowerCase();
        let checkReserved = new CheckReservedWords();
        let mapBuiltinCmds = new MapBuiltinCmds(parser);
        let determineCategory = new DetermineCategory(idGen, parser, mapBuiltinCmds, checkReserved);
        let lineSplitter = new SplitIntoLinesProducer(lexed.tokens, idGen, makeLowercase);
        let ifElseExpander = new ExpandIfElse()
        let syntaxRewriter = new SyntaxRewriter(idGen, idGenThisScript, mapBuiltinCmds, checkReserved);
        let branchProcessor = new BranchProcessing(idGen);
        let loop = new LoopLimit(CodeLimits.MaxLinesInScript, 'maxLinesInScript');
        while (loop.next()) {
            let tokenList = lineSplitter.next();
            if (tokenList) {
                let latest = tokenList[0];
                if (latest.startLine) {
                    latestSrcLineSeen.val = latest.startLine;
                }

                /* the ifElseExpander might split a line into many lines */
                let lines = ifElseExpander.go(tokenList)
                for (let i = 0, len = lines.length; i < len; i++) {
                    let lineExpanded = lines[i]

                    /* syntax rewriting might split a line into many lines */
                    let linesRewritten = syntaxRewriter.go(lineExpanded);
                    for (let j = 0, len = linesRewritten.length; j < len; j++) {
                        let list = linesRewritten[j];
                        let line = determineCategory.go(list);
                        latestDestLineSeen.val = line;
                        line.offset = lineNumber;
                        branchProcessor.go(line);
                        output[lineNumber] = line;
                        lineNumber += 1;

                        /* save memory, we don't need this anymore */
                        line.tmpEntireLine = undefined;
                    }
                }
            } else {
                break;
            }
        }

        /* ensure that all blocks are closed */
        branchProcessor.ensureComplete();
        return branchProcessor.handlers;
    }
}

/**
 * store the code in a vel
 */
export class VpcCodeOfOneVel {
    isVpcCodeOfOneVel = true;
    lines: VpcCodeLine[] = [];
    protected _handlers = new MapKeyToObject<VpcCodeLineReference>();
    protected _handlerStarts: number[] = [];
    constructor(public readonly ownerId: string, public readonly rawScript: string) {
    }

    /**
     * cache information about each handler (like on mouseUp)
     */
    get handlers() {
        return this._handlers;
    }

    /**
     * cache where each handler (like on mouseUp) begins
     */
    get handlerStarts() {
        return this._handlerStarts;
    }

    /**
     * store handlers
     */
    setHandlers(map: MapKeyToObject<VpcCodeLineReference>) {
        this._handlers = map;
        this._handlerStarts = map.getVals().map(h => h.offset);
        this._handlerStarts.sort();
        Object.freeze(this._handlerStarts);
    }

    /**
     * given a code offset, which handler is it in?
     */
    determineHandlerFromOffset(offset: number): number {
        if (this._handlerStarts.length && offset < this._handlerStarts[0]) {
            /* line is before any handlers */
            return -1;
        }

        for (let i = 0; i < this._handlerStarts.length; i++) {
            if (offset >= this._handlerStarts[i]) {
                /* line is in this handler */
                return i;
            }
        }

        /* line is after all handlers */
        return -1;
    }
}
