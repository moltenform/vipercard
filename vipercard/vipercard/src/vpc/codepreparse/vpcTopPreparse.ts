
/* auto */ import { getParsingObjects } from './../codeparse/vpcVisitor';
/* auto */ import { CodeLimits, CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { ChvITk } from './../codeparse/vpcTokens';
/* auto */ import { VpcRewritesLoops } from './vpcRewritesLoops';
/* auto */ import { VpcRewritesGlobal, VpcSuperRewrite } from './vpcRewritesGlobal';
/* auto */ import { ExpandCustomFunctions } from './vpcRewritesCustomFunctions';
/* auto */ import { NoElseIfClausesTreeBuilder, VpcRewriteNoElseIfClauses, VpcSplitSingleLineIf } from './vpcRewritesConditions';
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

/* see the section in internaldocs.md to read how we execute code. */

/**
 * the main preparse (syntax rewriting) logic is here
 */
export const VpcTopPreparse = /* static class */ {
    goPreparseOrThrow(code: string, idGen: CountNumericId, compatMode: boolean): VpcParsedCodeCollection {
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
        let buildTree = new NoElseIfClausesTreeBuilder();
        let ifSplitter = new VpcSplitSingleLineIf();
        while (true) {
            let next = splitter.next();
            if (!next) {
                break;
            }

            /* the stage 1 transformations must be done first */
            VpcCurrentScriptStage.latestSrcLineSeen = next[0].startLine;
            let nextSublines = this._stage1Process(next, rw);
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
            let nextLines2 = this._stage2Process(line, rewrites, rw, compatMode) ?? [line];
            for (let line2 of nextLines2) {
                VpcCurrentScriptStage.latestSrcLineSeen = line2[0].startLine;
                let nextLines3 = this._stage3Process(line2, exp, rw);
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
                    checkThrow(lineNumber < CodeLimits.MaxLinesInScript, 'TV|maxLinesInScript');

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
    },

    /* apply the 1st stage of rewriting */
    _stage1Process(line: ChvITk[], rw: VpcSuperRewrite): O<ChvITk[][]> {
        if (line.length && line[0].image === 'repeat') {
            return VpcRewritesLoops.Go(line, rw);
        } else {
            return undefined;
        }
    },

    /* apply the 3nd stage of rewriting */
    _stage2Process(line: ChvITk[], rwcmd: VpcRewriteForCommands, rw: VpcSuperRewrite, compatMode: boolean): O<ChvITk[][]> {
        line = VpcRewritesGlobal.rewriteSpecifyCdOrBgPartAndMore(line, rw, compatMode);
        let methodName = 'rewrite' + Util512.capitalizeFirst(line[0].image);
        return Util512.callAsMethodOnClass(VpcRewriteForCommands.name, rwcmd, methodName, [line], true) as O<ChvITk[][]>;
    },

    /* apply the 3rd stage of rewriting */
    _stage3Process(line: ChvITk[], exp: ExpandCustomFunctions, rw: VpcSuperRewrite): ChvITk[][] {
        line = VpcRewritesGlobal.rewritePropertySynonyms(line, rw);
        let outlines = exp.go(line);
        return outlines;
    }
};

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
