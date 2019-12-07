
/* auto */ import { VpcVisitorAddMixinMethods, VpcVisitorInterface } from './vpcVisitorMixin';
/* auto */ import { VpcEvalHelpers } from './../vpcutils/vpcValEval';
/* auto */ import { allVpcTokens } from './vpcTokens';
/* auto */ import { VpcChvParser } from './vpcParser';
/* auto */ import { OutsideWorldRead } from './../vel/velOutsideInterfaces';
/* auto */ import { O } from './../../ui512/utils/util512Assert';

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
export function getParsingObjects(): [
    chevrotain.Lexer,
    VpcChvParser,
    VpcVisitorInterface
] {
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
        CachedObjects.staticCache.visitor = (createVisitor(
            CachedObjects.staticCache.parser
        ) as any) as VpcVisitorInterface;
    }

    return [
        CachedObjects.staticCache.lexer,
        CachedObjects.staticCache.parser,
        CachedObjects.staticCache.visitor
    ];
}
