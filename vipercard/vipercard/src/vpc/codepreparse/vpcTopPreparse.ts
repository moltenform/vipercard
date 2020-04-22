
/* auto */ import { getParsingObjects } from './../codeparse/vpcVisitor';
/* auto */ import { CodeLimits, CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { ChvITk } from './../codeparse/vpcTokens';
/* auto */ import { VpcRewritesLoops } from './vpcRewritesLoops';
/* auto */ import { VpcRewritesGlobal, VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { ExpandCustomFunctions } from './vpcRewritesCustomFunctions';
/* auto */ import { VpcRewriteNoElseIfClauses, VpcSplitSingleLineIf } from './vpcRewritesConditions';
/* auto */ import { VpcRewriteForCommands } from './vpcRewritesCommands';
/* auto */ import { BranchProcessing } from './vpcProcessBranchAndLoops';
/* auto */ import { MakeLowerCase, SplitIntoLinesAndMakeLowercase, VpcCodeLine, VpcCodeLineReference, VpcCurrentScriptStage } from './vpcPreparseCommon';
/* auto */ import { VpcLineToCodeObj } from './vpcLineToCodeObj';
/* auto */ import { VpcErrStage, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { CheckReservedWords } from './vpcCheckReserved';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { MapKeyToObject, Util512, util512Sort } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/*
How Code Compilation + Execution Works In ViperCard
==========================================================

Done on a per-script basis.
Part 1: processing
    Run lexer, getting a list of tokens
    SplitIntoLinesAndMakeLowercase yields one line at a time
    We'll then process these lines.
    We do pre-processing before handing to the parser,
    one reason being that the ViperCard language has dozens
    of unquoted terms, and it would be unwieldly if they were
    all different tokens, so it's best to transform in software,
    for example to add quotes or to add 'syntax markers'
    that tell the parser that this term isn't just a variable,
    it's part of the syntax.

    processing steps include:
    making tokens lower-case, since the language is case insensitive,

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
        expression to be a pure function with no side effects (which we
        enforce by providing it with an interface that has readonly methods).
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
    line's excerptToParse. Otherwise, we can skip running the parser entirely on the line,
    for better perf.
    Run BranchProcessing so that syntax elements like "end repeat" see where to jump
        to the corresponding "repeat"
    Run BranchProcessing to confirm hierarchical structure: an "else" must appear in
        a valid "if", "end myHandler" must follow "on myHandler"

    Finally everything gets put into a list of CodeLines.
    Each line has an offset, and loops work by the if statement containing a list
    of offsets where it can tell the interpreter to jump to.
    The list of code is put in a VpcCodeCollection, and then cached.

Part 2: execution
    when you say, click on a button, the message is added to a queue.
    code execution will then see the message in the queue and create a
    framestack for it. each frame stores local variables and the current line offset,
    so it can move from line to line. when calling a function, a frame is
    pushed onto the stack. when returning from a function, the frame
    is popped from the stack, so that we'll continue running the caller's code.
    when the last frame is popped, we know we're done.

    Code execution walks line-by-line through the list, running one line at a time
    It checks the type of the line:
        If there is no expression to be parsed, run the line and continue (such as
            onMouseUp or end repeat)
        Else if there is an expression to be parsed, see if it is in the
            cache of parsed lines, and use that if possible, otherwise run the parser.
        Take the CST (tree of parsed data) and pass it to the Visitor to evaluate it.
            for expressions, visiting evaluates and returns a single VpcVal value
            for commands, visiting creates a IntermedMapOfIntermedVals object
                which code execution can easily see the results of.
    We don't run the script continuously, we frequently let other events/ui drawing
        occur. this also saves us if the user writes an infinite loop.
        the scheduler will call into us again in a few milliseconds.
    If the stack of execution frames is empty, we've completed the script.
*/
export namespace VpcTopPreparse {
    export function goPreparseOrThrow(code: string, idGen: CountNumericId): VpcParsedCodeCollection {
        /* set current status */
        VpcCurrentScriptStage.currentStage = VpcErrStage.Lex;
        VpcCurrentScriptStage.latestSrcLineSeen = undefined;
        VpcCurrentScriptStage.latestDestLineSeen = undefined;
        VpcCurrentScriptStage.origClass = undefined;

        /* lex the input */
        let lexer = getParsingObjects()[0];
        let lexed = lexer.tokenize(code);
        if (lexed.errors.length) {
            VpcCurrentScriptStage.latestSrcLineSeen = lexed.errors[0].line;
            VpcCurrentScriptStage.origClass = 'chevrotain.lex';
            let errmsg = lexed.errors[0]?.message?.substr(0, CodeLimits.LimitChevErrStringLen);
            checkThrow(false, `5(|lex error: ${errmsg}`);
        }

        VpcCurrentScriptStage.currentStage = VpcErrStage.Rewrite;
        let rw = new VpcSuperRewrite(idGen);
        let lowercase = new MakeLowerCase();
        let splitter = new SplitIntoLinesAndMakeLowercase(lexed.tokens, lowercase);
        let rewrites = new VpcRewriteForCommands(rw);
        let exp = new ExpandCustomFunctions(idGen, new CheckReservedWords());
        let buildTree = new VpcRewriteNoElseIfClauses.TreeBuilder();
        let ifSplitter = new VpcSplitSingleLineIf();
        while (true) {
            let next = splitter.next();
            if (!next) {
                break;
            }

            /* the stage 1 transformations must be done first */
            VpcCurrentScriptStage.latestSrcLineSeen = next[0].startLine;
            let nextSublines = stage1Process(next, rw);
            if (nextSublines) {
                for (let subline of nextSublines) {
                    let sublines2 = ifSplitter.go(subline, rw);
                    for (let subline2 of sublines2) {
                        buildTree.addLine(subline2);
                    }
                }
            } else {
                let sublines2 = ifSplitter.go(next, rw);
                for (let subline2 of sublines2) {
                    buildTree.addLine(subline2);
                }
            }
        }

        /* transform else-if into their own if-end */
        VpcCurrentScriptStage.latestSrcLineSeen = undefined;
        let lines = VpcRewriteNoElseIfClauses.go(buildTree, rw);
        if (!lines.length) {
            return VpcParsedCodeCollection.makeEmptyInst();
        }

        /* now do these as stages, they don't need access to the entire array */
        /* by passing the result of one to the next, we're saving some allocations */
        VpcCurrentScriptStage.latestSrcLineSeen = lines[0][0].startLine;
        let totalOutput: VpcCodeLine[] = [];
        let checkReserved = new CheckReservedWords();
        let toCodeObj = new VpcLineToCodeObj(idGen, checkReserved);
        toCodeObj.init(lines[0][0]);
        let lineNumber = 0;
        let branchProcessor = new BranchProcessing(idGen);
        for (let line of lines) {
            VpcCurrentScriptStage.latestSrcLineSeen = line[0].startLine;
            let nextLines2 = stage2Process(line, rewrites) ?? [line];
            for (let line2 of nextLines2) {
                VpcCurrentScriptStage.latestSrcLineSeen = line2[0].startLine;
                let nextLines3 = stage3Process(line2, exp, rw);
                for (let line3 of nextLines3) {
                    VpcCurrentScriptStage.latestSrcLineSeen = line3[0].startLine;
                    /* make it lowercase again, just in case */
                    for (let item of line3) {
                        lowercase.go(item);
                    }

                    let lineObj = toCodeObj.toCodeLine(line3);
                    VpcCurrentScriptStage.latestDestLineSeen = lineObj;
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

        branchProcessor.ensureComplete();
        VpcCurrentScriptStage.latestSrcLineSeen = undefined;
        VpcCurrentScriptStage.latestDestLineSeen = undefined;
        VpcCurrentScriptStage.origClass = undefined;
        return new VpcParsedCodeCollection(branchProcessor.handlers, totalOutput);
    }

    /* apply the 1st stage of rewriting */
    function stage1Process(line: ChvITk[], rw: VpcSuperRewrite): O<ChvITk[][]> {
        if (line.length && line[0].image === 'repeat') {
            return VpcRewritesLoops.Go(line, rw);
        } else {
            return undefined;
        }
    }

    /* apply the 3nd stage of rewriting */
    function stage2Process(line: ChvITk[], rwcmd: VpcRewriteForCommands): O<ChvITk[][]> {
        let methodName = 'rewrite' + Util512.capitalizeFirst(line[0].image);
        return Util512.callAsMethodOnClass(VpcRewriteForCommands.name, rwcmd, methodName, [line], true) as O<ChvITk[][]>;
    }

    /* apply the 3rd stage of rewriting */
    function stage3Process(line: ChvITk[], exp: ExpandCustomFunctions, rw: VpcSuperRewrite): ChvITk[][] {
        line = VpcRewritesGlobal.rewriteSpecifyCdOrBgPart(line);
        line = VpcRewritesGlobal.rewritePropertySynonyms(line, rw);
        let outlines = exp.go(line);
        return outlines;
    }
}

/**
 * the top level collection of parsed and processed code.
 */
export class VpcParsedCodeCollection {
    protected _handlerStarts: number[];
    constructor(protected _handlers: MapKeyToObject<VpcCodeLineReference>, public lines: VpcCodeLine[]) {
        this._handlerStarts = _handlers.getVals().map(h => h.offset);
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

    /**
     * for cases like where the script is only comments
     */
    static makeEmptyInst() {
        return new VpcParsedCodeCollection(new MapKeyToObject<VpcCodeLineReference>(), []);
    }
}
