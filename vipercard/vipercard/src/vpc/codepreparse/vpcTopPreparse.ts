
/* auto */ import { getParsingObjects } from './../codeparse/vpcVisitor';
/* auto */ import { CodeLimits, VpcScriptSyntaxError } from './../vpcutils/vpcUtils';
/* auto */ import { ChvITk } from './../codeparse/vpcTokens';
/* auto */ import { VpcRewritesLoops } from './vpcRewritesLoops';
/* auto */ import { VpcRewritesGlobal, VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { ExpandCustomFunctions } from './vpcRewritesCustomFunctions';
/* auto */ import { VpcRewritesConditions, VpcRewritesConditionsNoElseIfClauses } from './vpcRewritesConditions';
/* auto */ import { VpcRewriteForCommands } from './vpcRewritesCommands';
/* auto */ import { BranchProcessing } from './vpcProcessBranchAndLoops';
/* auto */ import { MakeLowerCase, SplitIntoLinesAndMakeLowercase, VpcCodeLine, VpcCodeLineReference } from './vpcPreparseCommon';
/* auto */ import { VpcLineToCodeObj } from './vpcLineToCodeObj';
/* auto */ import { CheckReservedWords } from './vpcCheckReserved';
/* auto */ import { O, UI512ErrorHandling, assertTrue, checkThrow, makeVpcScriptErr } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObject, Util512, ValHolder, util512Sort } from './../../ui512/utils/util512';

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
        we could make 'with' a token so that it wouldn't get lumped into the expression
            line 2 of x.
        but we want to minimze number of tokens.
        so instead, during codepreparse, if the command is ask, replace any tokens
            that are exactly 'with'.
        ask line 2 of x $syntaxmarker$ "defaultText"
        a $syntaxmarker$ is never part of an expression, and so the parser has no difficulty.
    2) Transform "repeat with x=1 to 5" into a "repeat while" loop with same functionality
    3) To simplify parsing for a few commands
    4) To expand custom function calls in an expression
        We don't want a custom function call inside an expression, because the custom
        fn call could take an arbitrarily long time to run, and we can't pause
        execution halfway through evaling an expression. We also want evalling an
        expression to be a pure function with no side effects.
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
    If the syntax element has an expression to evaluate, put the expression into the
    line's readyToParse. Otherwise, we can skip running the parser entirely on the line,
    for better perf.
    Run BranchProcessing so that syntax elements like "end repeat" see where to jump
        to the corresponding "repeat"
    Run BranchProcessing to confirm hierarchical structure: an "else" must appear in
        a valid "if", "end myHandler" must follow "on myHandler"

    The preparsed code is a list, loops work by telling the interpreter to jump to a
        different offset in the list.
    The code is then stored in the VpcAllCode instance.

Part 2: execution
    Code execution walks line-by-line through the list, running one line at a time
    It checks the type of the line:
        If there is no expression to be parsed, run the line and continue (such as
            onMouseUp or end repeat)
        Else if there is an expression to be parsed, see if it is in the
            _VpcCacheParsedLines_, and use that if possible
        Otherwise, run the parser
            (we run the chevrotain parser at runtime right when the code is being executed)
            the parser creates a CST object, save the results to the _VpcCacheParsedLines_
        Use the _visitor_ class to recurse through the CST object and evaluate the result
    Check how long we've been running the script, so that we're not stuck in a tight
        loop. if it's been too long,
        save the instruction offset and all state
        exit, the scheduler will call into us again in a few ms
    If the stack of execution frames is empty, we've completed the script.
*/

export namespace VpcCodeProcessor {
    function goImpl(
        code: string,
        latestSrcLineSeen: ValHolder<number>,
        latestDestLineSeen: ValHolder<VpcCodeLine>
    ): VpcParsedCodeCollection {
        /* lex the input */
        let lexer = getParsingObjects()[0];
        let lexed = lexer.tokenize(code);
        if (lexed.errors.length) {
            latestSrcLineSeen.val = lexed.errors[0].line;
            let errmsg = lexed.errors[0].message.toString().substr(0, CodeLimits.LimitChevErr);
            throw makeVpcScriptErr(`5(|lex error: ${errmsg}`);
        }

        let lowercase = new MakeLowerCase();
        let splitter = new SplitIntoLinesAndMakeLowercase(lexed.tokens, lowercase);
        let rewrites = new VpcRewriteForCommands();
        let exp = new ExpandCustomFunctions(VpcSuperRewrite.CounterForUniqueNames, new CheckReservedWords());
        let lines: ChvITk[][] = [];
        while (true) {
            let next = splitter.next();
            if (!next) {
                break;
            }

            lines.push(next);
        }

        // get rid of else-if clauses, they don't support custom function calls
        // and make our branch-processing code a little more complex
        // this one needs access to the entire array.
        lines = VpcRewritesConditionsNoElseIfClauses.goNoElseIfClauses(lines);

        // now do these as stages, they don't need access to the entire array
        // by passing the result of one to the next, we're saving some allocations
        let totalOutput: VpcCodeLine[] = [];
        let checkReserved = new CheckReservedWords();
        let idGen = VpcSuperRewrite.CounterForUniqueNames;
        let toCodeObj = new VpcLineToCodeObj(idGen, checkReserved);
        toCodeObj.init(lines[0][0]);
        let lineNumber = 0;
        let branchProcessor = new BranchProcessing(idGen);

        for (let line of lines) {
            let nextLines1 = stage1Process(line) ?? [line];
            for (let line1 of nextLines1) {
                let nextLines2 = stage2Process(line1, rewrites) ?? [line1];
                for (let line2 of nextLines2) {
                    let nextLines3 = stage3Process(line2, exp);
                    for (let line3 of nextLines3) {
                        /* make it lowercase again, just in case */
                        for (let item of line3) {
                            lowercase.go(item);
                        }

                        let lineObj = toCodeObj.toCodeLine(line3);
                        latestDestLineSeen.val = lineObj;
                        lineObj.offset = lineNumber;
                        branchProcessor.go(lineObj);
                        totalOutput[lineNumber] = lineObj;
                        lineNumber += 1;
                        checkThrow(lineNumber < CodeLimits.MaxLinesInScript, 'maxLinesInScript');

                        /* save memory, we don't need this anymore */
                        lineObj.tmpEntireLine = undefined;
                    }
                }
            }
        }

        branchProcessor.ensureComplete();
        return new VpcParsedCodeCollection(branchProcessor.handlers, totalOutput);
    }

    function stage1Process(line: ChvITk[]): O<ChvITk[][]> {
        if (line.length && line[0].image === 'if') {
            return VpcRewritesConditions.splitSinglelineIf(line);
        } else if (line.length && line[0].image === 'repeat') {
            return VpcRewritesLoops.Go(line);
        } else {
            return undefined;
        }
    }

    function stage2Process(line: ChvITk[], rewrites: VpcRewriteForCommands): O<ChvITk[][]> {
        let methodName = 'rewrite' + Util512.capitalizeFirst(line[0].image);
        return Util512.callAsMethodOnClass('VpcRewriteForCommands', rewrites, methodName, [line], true) as O<ChvITk[][]>;
    }

    function stage3Process(line: ChvITk[], exp: ExpandCustomFunctions): ChvITk[][] {
        line = VpcRewritesGlobal.rewriteSpecifyCdOrBgPart(line);
        return exp.go(line);
    }

    export function go(code: string, velIdForErrMsg: string): VpcScriptSyntaxError | VpcParsedCodeCollection {
        assertTrue(!code.match(/^\s*$/), '');
        let latestSrcLineSeen = new ValHolder(0);
        let latestDestLineSeen = new ValHolder(new VpcCodeLine(0, []));
        let syntaxError: O<VpcScriptSyntaxError>;
        let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow;
        try {
            UI512ErrorHandling.breakOnThrow = false;
            return goImpl(code, latestSrcLineSeen, latestDestLineSeen);
        } catch (e) {
            syntaxError = new VpcScriptSyntaxError();
            syntaxError.isScriptException = e.isVpcError;
            syntaxError.isExternalException = !e.isUi512Error;
            syntaxError.lineNumber = latestSrcLineSeen.val;
            syntaxError.velId = velIdForErrMsg;
            syntaxError.lineData = latestDestLineSeen.val;
            syntaxError.details = e.message;
        } finally {
            UI512ErrorHandling.breakOnThrow = storedBreakOnThrow;
        }

        return syntaxError;
    }
}

export class VpcParsedCodeCollection {
    protected _handlerStarts: number[];
    protected _handlers: MapKeyToObject<VpcCodeLineReference>;
    constructor(protected map: MapKeyToObject<VpcCodeLineReference>, public lines: VpcCodeLine[]) {
        this._handlers = map;
        this._handlerStarts = map.getVals().map(h => h.offset);
        this._handlerStarts.sort(util512Sort);
        Object.freeze(this._handlerStarts);
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
    setHandlers(map: MapKeyToObject<VpcCodeLineReference>) {}

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
