
/* auto */ import { O, assertTrue, makeVpcScriptErr, markUI512Err } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObject, MapKeyToObjectCanSet, Util512, ValHolder, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CodeLimits, CountNumericId, CountNumericIdNormal, VpcScriptErrorBase, VpcScriptSyntaxError } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { getParsingObjects } from '../../vpc/codeparse/vpcVisitor.js';
/* auto */ import { LoopLimit, MakeLowerCase, MapBuiltinCmds, SplitIntoLinesProducer } from '../../vpc/codepreparse/vpcPreparseCommon.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpcCheckReserved.js';
/* auto */ import { VpcCodeLine, VpcCodeLineReference } from '../../vpc/codepreparse/vpcCodeLine.js';
/* auto */ import { DetermineCategory } from '../../vpc/codepreparse/vpcDetermineCategory.js';
/* auto */ import { SyntaxRewriter } from '../../vpc/codepreparse/vpcRewrite.js';
/* auto */ import { BranchTracking } from '../../vpc/codepreparse/vpcBranchProcessing.js';

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
        When the stack of frames is empty, all execution has been completed.
        Easier to go from line to line than traverse some type of tree structure; offset is just a number from current handler.

*/

export class VpcAllCode {
    protected code = new MapKeyToObjectCanSet<O<VpcCodeOfOneVel | VpcScriptSyntaxError>>();
    processor = new VpcCodeProcessor();
    readonly idgen: CountNumericId;
    constructor(idgen: CountNumericId) {
        this.idgen = idgen;
    }

    updateCode(s: string, owner: VpcElBase) {
        assertTrue(owner && slength(owner.id), '5*|invalid owner id');
        this.code.set(owner.id, undefined);
        if (!s || s.match(/^\s*$/)) {
            this.code.set(owner.id, undefined);
            return;
        }

        let codeOfElem = new VpcCodeOfOneVel(owner);
        let latestSrcLineSeen = new ValHolder(0);
        let latestDestLineSeen = new ValHolder(new VpcCodeLine(0, []));
        let syntaxError: O<VpcScriptSyntaxError>;
        try {
            codeOfElem.setHandlers(
                this.processor.processCode(s, codeOfElem.lines, this.idgen, latestSrcLineSeen, latestDestLineSeen)
            );
        } catch (e) {
            syntaxError = new VpcScriptSyntaxError();
            syntaxError.isScriptException = e.isVpcError;
            syntaxError.isExternalException = !e.isUi512Error;
            syntaxError.lineNumber = latestSrcLineSeen.val;
            syntaxError.velid = owner.id;
            syntaxError.lineData = latestDestLineSeen.val;
            syntaxError.details = e.message;
        }

        if (syntaxError) {
            this.code.set(owner.id, syntaxError);
        } else {
            this.code.set(owner.id, codeOfElem);
            Util512.freezeRecurse(codeOfElem);
        }
    }

    findCode(id: O<string>): O<VpcCodeOfOneVel | VpcScriptSyntaxError> {
        // returns undefined if the object has no script
        return this.code.find(id);
    }

    remove(id: string) {
        this.code.remove(id);
    }

    findHandlerInScript(id: O<string>, handlername: string): O<[VpcCodeOfOneVel, VpcCodeLineReference]> {
        if (id) {
            let ret = this.findCode(id);
            let retAsCode = ret as VpcCodeOfOneVel;
            if (retAsCode && retAsCode.isVpcCodeOfOneVel) {
                let handler = retAsCode.handlers.find(handlername);
                if (handler) {
                    return [retAsCode, handler];
                }
            } else if (ret) {
                let retAsErr = ret as VpcScriptErrorBase;
                if (retAsErr && retAsErr.isVpcScriptErrorBase) {
                    let err = makeVpcScriptErr('$compilation error$');
                    markUI512Err(err, true, false, true, retAsErr);
                    throw err;
                } else {
                    throw makeVpcScriptErr('VpcCodeOfOneVel did not return expected type ' + ret);
                }
            }
        }
    }
}

class VpcCodeProcessor {
    processCode(
        code: string,
        output: VpcCodeLine[],
        idgen: CountNumericId,
        latestSrcLineSeen: ValHolder<number>,
        latestDestLineSeen: ValHolder<VpcCodeLine>
    ) {
        // lex the input
        let [lexer, parser, visitor] = getParsingObjects();
        let lexed = lexer.tokenize(code);
        if (lexed.errors.length) {
            latestSrcLineSeen.val = lexed.errors[0].line;
            let errmsg = lexed.errors[0].message.toString().substr(0, CodeLimits.LimitChevErr);
            throw makeVpcScriptErr(`5(|lex error: ${errmsg}`);
        }

        // create a pipeline
        let linenumber = 0;
        let idGenThisScript = new CountNumericIdNormal();
        let makeLowercase = new MakeLowerCase();
        let checkReserved = new CheckReservedWords();
        let mapBuiltinCmds = new MapBuiltinCmds(parser);
        let determineCategory = new DetermineCategory(idgen, parser, mapBuiltinCmds, checkReserved);
        let splitter = new SplitIntoLinesProducer(lexed.tokens, idgen, makeLowercase);
        let syntaxRewriter = new SyntaxRewriter(idgen, idGenThisScript, mapBuiltinCmds, checkReserved);
        let branchTracking = new BranchTracking(idgen);
        let limit = new LoopLimit(CodeLimits.MaxLinesInScript, 'maxLinesInScript');
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
    isVpcCodeOfOneVel = true;
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
