
/* auto */ import { assertTrue, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { CodeLimits } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcParsed } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { VpcChvParser } from '../../vpc/codeparse/vpcParser.js';
/* auto */ import { VpcVisitorInterface } from '../../vpc/codeparse/vpcVisitorMixin.js';
/* auto */ import { getParsingObjects } from '../../vpc/codeparse/vpcVisitor.js';
/* auto */ import { VpcCodeLine } from '../../vpc/codepreparse/vpcCodeLine.js';
/* auto */ import { ExpLRUMap } from '../../vpc/codeexec/bridgeJSLru.js';

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
export class VpcCacheParsed {
    cache = new ExpLRUMap<string, VpcParsed>(CodeLimits.CacheThisManyParsedLines);
    parser: VpcChvParser;
    visitor: VpcVisitorInterface;
    constructor() {
        let [lexer, parser, visitor] = getParsingObjects();
        this.parser = parser;
        this.visitor = visitor;
    }

    /**
     * get the CST object for a line of code, using the cache if possible
     */
    getParsedLine(ln: VpcCodeLine) {
        let rule = ln.getParseRule();
        assertEq(!!rule, !!ln.allImages, '4>|');
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
                assertTrue(cst !== null && cst !== undefined, '4<|parse results null', ln.offset);
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
    protected callParser(ln: VpcCodeLine, firstRule: Function) {
        let parsed: VpcParsed;
        try {
            /* setting input is documented to reset the parser state */
            this.parser.input = ln.excerptToParse;
            this.parser.errors.length = 0;
            parsed = firstRule.apply(this.parser, []);
        } catch (e) {
            /* don't expect error to be thrown here, but am checking this case out of caution */
            let err = e.message.toString().substr(0, CodeLimits.LimitChevErr);
            throw makeVpcScriptErr('4;|parse error: ' + err);
        }

        if (this.parser.errors.length) {
            let err = this.parser.errors[0].toString().substr(0, CodeLimits.LimitChevErr);
            throw makeVpcScriptErr('4:|parse error: ' + err);
        }

        return parsed;
    }
}
