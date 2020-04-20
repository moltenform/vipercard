
/* auto */ import { getParsingObjects } from './../codeparse/vpcVisitor';
/* auto */ import { CodeLimits, CountNumericId } from './../vpcutils/vpcUtils';
/* auto */ import { VpcParsedCodeCollection, VpcTopPreparse } from './../codepreparse/vpcTopPreparse';
/* auto */ import { VpcParsed } from './../codeparse/vpcTokens';
/* auto */ import { ChvRuleFnType, VpcCodeLine, VpcCodeLineReference, VpcCurrentScriptStage } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { VpcChvParser } from './../codeparse/vpcParser';
/* auto */ import { VpcErrStage, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { O, bool } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObject, Util512, assertEq } from './../../ui512/utils/util512';
/* auto */ import { BridgedLRUMap } from './../../bridge/bridgeJsLru';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/* see the top of vpcTopPreparse.ts to read how we execute code. */

/**
 * cache the CST from a parsed line of code, for better perf.
 * it can be re-evaluated by calling visit() again.
 *
 * the cache is across all code in the stack, so
 * the line "put 1 into x" in the script of one button can re-use the CST
 * for the line "put 1 into x" in the script of another button
 *
 * the cache is an LRU so that it doesn't have unbounded memory usage
 */
export class VpcCacheParsedCST {
    cache = new BridgedLRUMap<string, VpcParsed>(CodeLimits.CacheThisManyParsedLines);
    parser: VpcChvParser;
    static ensureNotChanged = true;
    constructor() {
        this.parser = getParsingObjects()[1];
    }

    /**
     * get the CST object for a line of code, using the cache if possible
     */
    getParsedLine(ln: VpcCodeLine) {
        let rule = ln.getParseRule();
        assertEq(bool(rule), bool(ln.allImages), '4>|');
        if (rule && ln.allImages) {
            assertTrue(ln.excerptToParse.length > 0, '4=|ln readyToParse is empty', ln.offset);
            let key = ln.allImages;
            let foundInCache = this.cache.get(key);
            if (foundInCache !== undefined) {
                /* we can use the cached cst */
                return foundInCache;
            } else {
                /* call the parser to get a new cst */
                let cst = this.callParser(ln, rule);
                checkThrow(cst !== null && cst !== undefined, '4<|parse results null', ln.offset);
                this.cache.set(key, cst);
                return cst;
            }
        } else {
            /* this line doesn't use the parser (a line like "end repeat") */
            return undefined;
        }
    }

    /**
     * call the parser to get a new cst
     */
    protected callParser(ln: VpcCodeLine, firstRule: ChvRuleFnType) {
        VpcCurrentScriptStage.currentStage = VpcErrStage.Parse;
        VpcCurrentScriptStage.latestSrcLineSeen = ln.firstToken.startLine;
        VpcCurrentScriptStage.latestDestLineSeen = ln;
        VpcCurrentScriptStage.origClass = undefined;

        /* setting input again will reset the parser's state */
        this.parser.input = ln.excerptToParse;
        this.parser.errors.length = 0;
        VpcCurrentScriptStage.origClass = 'chevrotain.parsecallthrew';
        let parsed = firstRule.apply(this.parser, []);
        if (VpcCacheParsedCST.ensureNotChanged) {
            Util512.freezeRecurse(parsed);
        }

        VpcCurrentScriptStage.origClass = 'chevrotain.parse';
        if (this.parser.errors.length) {
            let s = this.parser.errors[0]?.message?.substr(0, CodeLimits.LimitChevErrStringLen);
            checkThrow(false, '4:|parse error: ' + s);
        }

        VpcCurrentScriptStage.currentStage = VpcErrStage.Unknown;
        VpcCurrentScriptStage.latestSrcLineSeen = undefined;
        VpcCurrentScriptStage.latestDestLineSeen = undefined;
        VpcCurrentScriptStage.origClass = undefined;
        return parsed;
    }
}

/**
 * for efficiency, let's cache the entire script once we've processed it.
 * note that this isn't keyed by element id. if two elements have exactly
 * the same script, they'll share an entry here.
 *
 * this also helps simplify the case where a script deletes objects at runtime,
 * it can even delete itself with no issues.
 */
export class VpcCacheParsedAST {
    cache = new BridgedLRUMap<string, VpcParsedCodeCollection>(CodeLimits.CacheThisManyScripts);
    constructor(public idGen: CountNumericId) {}
    protected getParsedCodeCollectionOrThrow(code: string, velIdForErrMsg: string): VpcParsedCodeCollection {
        VpcCurrentScriptStage.currentStage = VpcErrStage.Unknown;
        VpcCurrentScriptStage.latestSrcLineSeen = undefined;
        VpcCurrentScriptStage.latestDestLineSeen = undefined;
        VpcCurrentScriptStage.origClass = undefined;
        VpcCurrentScriptStage.latestVelID = velIdForErrMsg;

        if (code.match(/^\s*$/)) {
            return new VpcParsedCodeCollection(new MapKeyToObject<VpcCodeLineReference>(), []);
        }

        let found = this.cache.get(code);
        if (found) {
            return found;
        } else {
            let got = VpcTopPreparse.goPreparseOrThrow(code, this.idGen);
            if (VpcCacheParsedCST.ensureNotChanged) {
                Util512.freezeRecurse(got);
            }
            this.cache.set(code, got);
            return got;
        }
    }

    /* parse+compile code, and find a handler.
        if the handler isn't found, returns undefined for the 2nd item */
    getHandlerOrThrow(
        code: string,
        handlername: string,
        velIdForErrMsg: string
    ): [VpcParsedCodeCollection, O<VpcCodeLineReference>] {
        let coll = this.getParsedCodeCollectionOrThrow(code, velIdForErrMsg);
        let handler = coll.handlers.find(handlername);
        return [coll, handler];
    }
}
