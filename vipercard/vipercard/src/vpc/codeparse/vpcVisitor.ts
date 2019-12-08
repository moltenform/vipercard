
/* auto */ import { VpcVisitorAddMixinMethods, VpcVisitorInterface } from './vpcVisitorMixin';
/* auto */ import { VisitingContext } from './vpcVisitorInterface';
/* auto */ import { VpcEvalHelpers } from './../vpcutils/vpcValEval';
/* auto */ import { IntermedMapOfIntermedVals } from './../vpcutils/vpcVal';
/* auto */ import { allVpcTokens } from './vpcTokens';
/* auto */ import { VpcChvParser } from './vpcParser';
/* auto */ import { OutsideWorldRead } from './../vel/velOutsideInterfaces';
/* auto */ import { O, checkThrow } from './../../ui512/utils/util512Assert';

/* check_long_lines_silence_subsequent */

/**
 * create a Visitor class instance
 * a Visitor can recurse through a CST to produce a single value.
 */
export function createVisitor(parser: VpcChvParser): VpcVisitorInterface {
    let BaseVisitor = parser.getBaseCstVisitorConstructor();
    class VPCCustomVisitor extends BaseVisitor {
        evalAllExpressions = true;
        evalHelp = new VpcEvalHelpers();
        outside: OutsideWorldRead;
        tmpArr: [boolean, any] = [false, undefined];
        constructor() {
            super();
            this.validateVisitor();
        }

        /**
         * visit a node and return a value
         */
        visit(rule: any) {
            /* the default .visit() accepts arrays and silently only processes the first element, */
            /* this has a risk of accepting unintended results, let's throw instead */
            checkThrow(!Array.isArray(rule), longstr(`9b|internal error, make sure you
                say this.visit(ctx.RuleX[0]) not this.visit(ctx.RuleX)`, ''), rule);

            return super.visit(rule);
        }

        /**
         * recurse through, and construct an IntermedMapOfIntermedVals
         * note: method name must have a $ so that chevrotain understands it is not a response to a rule.
         */
        H$BuildMap(ctx: VisitingContext): IntermedMapOfIntermedVals {
            let ret = new IntermedMapOfIntermedVals();
            for (let key in ctx) {
                if (!ctx.hasOwnProperty(key)) {
                    continue;
                }

                let len = ctx[key].length;
                if (len) {
                    let looksLikeRule = key.startsWith('Rule');
                    /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */
                    let looksLikeToken = key.startsWith('tk') || key.startsWith('_');
                    /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */
                    if (looksLikeRule || looksLikeToken) {
                        for (let i = 0; i < len; i++) {
                            let child = ctx[key][i];
                            if (child.image) {
                                ret.addString(key, child.image);
                            } else if (looksLikeRule && child.children !== undefined) {
                                ret.addResult(key, this.visit(child));
                            }
                        }
                    }
                }
            }

            return ret;
        }

        /* generated code, any changes past this point will be lost: --------------- */

        /* generated code, any changes above this point will be lost: --------------- */
    }

    let ComposedClass = VpcVisitorAddMixinMethods(VPCCustomVisitor);
    return new ComposedClass();
}

/**
 * cache the lexer, parser, and visitor
 */
class CachedObjects {
    lexer: O<chevrotain.Lexer> = undefined;
    parser: O<VpcChvParser> = undefined;
    visitor: O<VpcVisitorInterface> = undefined;

    static staticCache = new CachedObjects();
}

/**
 * retrieve cached objects, creating if needed
 */
export function getParsingObjects(): [chevrotain.Lexer, VpcChvParser, VpcVisitorInterface] {
    if (!CachedObjects.staticCache.lexer) {
        CachedObjects.staticCache.lexer = new chevrotain.Lexer(allVpcTokens, {
            ensureOptimizations: true
        });
    }

    if (!CachedObjects.staticCache.parser) {
        CachedObjects.staticCache.parser = new VpcChvParser();
    }

    if (!CachedObjects.staticCache.visitor) {
        let NoteThisIsDisabledCode = 1;
        //CachedObjects.staticCache.visitor = (createVisitor(
        //    CachedObjects.staticCache.parser
        //) as any) as VpcVisitorInterface;
        CachedObjects.staticCache.visitor = (12345 as any) as VpcVisitorInterface;
    }

    return [CachedObjects.staticCache.lexer, CachedObjects.staticCache.parser, CachedObjects.staticCache.visitor];
}
