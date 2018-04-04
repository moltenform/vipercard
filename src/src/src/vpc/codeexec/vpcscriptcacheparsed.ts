
/* auto */ import { assertTrue, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CodeLimits } from '../../vpc/vpcutils/vpcutils.js';
/* auto */ import { ChvParserClass } from '../../vpc/codeparse/vpcrules.js';
/* auto */ import { getParsingObjects } from '../../vpc/codeparse/vpcvisitor.js';
/* auto */ import { VpcCodeLine } from '../../vpc/codepreparse/vpccodeline.js';
/* auto */ import { ExpLRUMap } from '../../vpc/codeexec/bridgejslru.js';

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
        assertEq(!!rule, !!ln.allImages, '4>|');
        if (rule && ln.allImages) {
            assertTrue(ln.excerptToParse.length > 0, '4=|ln readyToParse is empty', ln.offset);
            let key = ln.allImages;
            let foundInCache = this.cache.get(key);
            if (foundInCache !== undefined) {
                return foundInCache;
            } else {
                let got = this.callParser(ln, rule);
                assertTrue(got !== null && got !== undefined, '4<|parse results null', ln.offset);
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
            throw makeVpcScriptErr('4;|parse error: ' + err);
        }

        if (this.parser.errors.length) {
            let err = this.parser.errors[0].toString().substr(0, CodeLimits.limitChevErr);
            throw makeVpcScriptErr('4:|parse error: ' + err);
        }

        return parsed;
    }
}
