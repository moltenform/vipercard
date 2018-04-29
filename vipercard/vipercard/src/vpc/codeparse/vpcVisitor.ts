
/* auto */ import { O, checkThrow, makeVpcInternalErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { VpcOpCtg } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VpcEvalHelpers } from '../../vpc/vpcutils/vpcValEval.js';
/* auto */ import { OutsideWorldRead } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { ChvLexer } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { listTokens } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { VpcChvParser } from '../../vpc/codeparse/vpcParser.js';
/* auto */ import { VisitingContext } from '../../vpc/codeparse/vpcVisitorMethods.js';
/* auto */ import { VpcVisitorAddMixinMethods, VpcVisitorInterface } from '../../vpc/codeparse/vpcVisitorMixin.js';

/* see comment at the top of _vpcAllCode_.ts for an overview */

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
            checkThrow(
                !Array.isArray(rule),
                `9b|internal error, make sure you say this.visit(ctx.RuleX[0]) not this.visit(ctx.RuleX)`,
                rule
            );

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
                    let looksLikeToken = key.startsWith('Token');
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

        RuleHOrdinal(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenTkordinal[0]) {
                return ctx.TokenTkordinal[0].image;
            } else {
                throw makeVpcInternalErr('|0|null');
            }
        }

        RuleHPosition(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenTkidentifier[0]) {
                return ctx.TokenTkidentifier[0].image;
            } else {
                throw makeVpcInternalErr('|1|null');
            }
        }

        RuleHChunk_1(ctx: VisitingContext): string | VpcIntermedValBase {
            throw makeVpcInternalErr('|2|reached');
        }

        RuleObject(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.RuleObjectBtn[0]) {
                return this.visit(ctx.RuleObjectBtn[0]);
            } else if (ctx.RuleObjectFld[0]) {
                return this.visit(ctx.RuleObjectFld[0]);
            } else if (ctx.RuleObjectCard[0]) {
                return this.visit(ctx.RuleObjectCard[0]);
            } else if (ctx.RuleObjectBg[0]) {
                return this.visit(ctx.RuleObjectBg[0]);
            } else if (ctx.RuleObjectStack[0]) {
                return this.visit(ctx.RuleObjectStack[0]);
            } else if (ctx.RuleObject_1[0]) {
                return this.visit(ctx.RuleObject_1[0]);
            } else {
                throw makeVpcInternalErr('|3|null');
            }
        }

        RuleObjectPart(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.RuleObjectBtn[0]) {
                return this.visit(ctx.RuleObjectBtn[0]);
            } else if (ctx.RuleObjectFld[0]) {
                return this.visit(ctx.RuleObjectFld[0]);
            } else {
                throw makeVpcInternalErr('|4|null');
            }
        }

        RuleNtDest(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.RuleObjectCard[0]) {
                return this.visit(ctx.RuleObjectCard[0]);
            } else if (ctx.RuleObjectBg[0]) {
                return this.visit(ctx.RuleObjectBg[0]);
            } else if (ctx.RuleObjectStack[0]) {
                return this.visit(ctx.RuleObjectStack[0]);
            } else {
                throw makeVpcInternalErr('|5|null');
            }
        }

        RuleNtVisEffect(ctx: VisitingContext): string | VpcIntermedValBase {
            return this.H$BuildMap(ctx);
        }

        RuleNtVisEffectTerm(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenTkidentifier[0]) {
                return ctx.TokenTkidentifier[0].image;
            } else if (ctx.TokenTo[0]) {
                return ctx.TokenTo[0].image;
            } else if (ctx.TokenTkinonly[0]) {
                return ctx.TokenTkinonly[0].image;
            } else {
                throw makeVpcInternalErr('|6|null');
            }
        }

        RuleBuiltinCmdAdd(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdAnswer(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdAsk(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdWait(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdBeep(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdChoose(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdClick(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdCreate(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdDelete(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdDisable(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdDivide(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdDrag(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdEnable(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdGet(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdGoCard(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdHide(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdLock(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdMultiply(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdPut(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdReset(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdSet(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdShow(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleShow_1(ctx: VisitingContext): string | VpcIntermedValBase {
            return this.H$BuildMap(ctx);
        }

        RuleShow_2(ctx: VisitingContext): string | VpcIntermedValBase {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdSort(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdSubtract(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdUnlock(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdVisual(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdPlay(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleAnyPropertyName(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenId[0]) {
                return ctx.TokenId[0].image;
            } else if (ctx.TokenTkidentifier[0]) {
                return ctx.TokenTkidentifier[0].image;
            } else {
                throw makeVpcInternalErr('|7|null');
            }
        }

        RuleAnyPropertyVal(ctx: VisitingContext): string | VpcIntermedValBase {
            return this.H$BuildMap(ctx);
        }

        RuleOf(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenTkofonly[0]) {
                return ctx.TokenTkofonly[0].image;
            } else if (ctx.TokenTkinonly[0]) {
                return ctx.TokenTkinonly[0].image;
            } else {
                throw makeVpcInternalErr('|8|null');
            }
        }

        RuleFnCall(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.RuleFnCallLength[0]) {
                return this.visit(ctx.RuleFnCallLength[0]);
            } else if (ctx.RuleFnCallWithParens[0]) {
                return this.visit(ctx.RuleFnCallWithParens[0]);
            } else if (ctx.RuleFnCallWithoutParensOrGlobalGetPropOrTarget[0]) {
                return this.visit(ctx.RuleFnCallWithoutParensOrGlobalGetPropOrTarget[0]);
            } else if (ctx.RuleFnCallNumberOf[0]) {
                return this.visit(ctx.RuleFnCallNumberOf[0]);
            } else if (ctx.RuleExprThereIs[0]) {
                return this.visit(ctx.RuleExprThereIs[0]);
            } else {
                throw makeVpcInternalErr('|9|null');
            }
        }

        RuleFnCallNumberOf(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.RuleFnCallNumberOf_1[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_1[0]);
            } else if (ctx.RuleFnCallNumberOf_2[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_2[0]);
            } else if (ctx.RuleFnCallNumberOf_3[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_3[0]);
            } else if (ctx.RuleFnCallNumberOf_4[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_4[0]);
            } else {
                throw makeVpcInternalErr('|A|null');
            }
        }

        RuleExpr(ctx: VisitingContext): VpcVal {
            if (!ctx.RuleLvl1Expression.length || ctx.RuleOpLogicalOrAnd.length + 1 !== ctx.RuleLvl1Expression.length) {
                throw makeVpcInternalErr(`|B|,${ctx.RuleOpLogicalOrAnd.length},${ctx.RuleLvl1Expression.length}.`);
            }

            let total = this.visit(ctx.RuleLvl1Expression[0]) as VpcVal;
            checkThrow(total.isVpcVal, '|C|');
            const oprulename = VpcOpCtg.OpLogicalOrAnd;
            for (let i = 0; i < ctx.RuleOpLogicalOrAnd.length; i++) {
                let whichop = this.visit(ctx.RuleOpLogicalOrAnd[i]);
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl1Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulename, whichop);
                checkThrow(total.isVpcVal, '|D|');
            }

            return total;
        }

        RuleLvl1Expression(ctx: VisitingContext): VpcVal {
            if (
                !ctx.RuleLvl2Expression.length ||
                ctx.RuleOpEqualityGreaterLessOrContains.length + 1 !== ctx.RuleLvl2Expression.length
            ) {
                throw makeVpcInternalErr(
                    `|E|,${ctx.RuleOpEqualityGreaterLessOrContains.length},${ctx.RuleLvl2Expression.length}.`
                );
            }

            let total = this.visit(ctx.RuleLvl2Expression[0]) as VpcVal;
            checkThrow(total.isVpcVal, '|F|');
            const oprulename = VpcOpCtg.OpEqualityGreaterLessOrContains;
            for (let i = 0; i < ctx.RuleOpEqualityGreaterLessOrContains.length; i++) {
                let whichop = this.visit(ctx.RuleOpEqualityGreaterLessOrContains[i]);
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl2Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulename, whichop);
                checkThrow(total.isVpcVal, '|G|');
            }

            return total;
        }

        RuleLvl2Sub(ctx: VisitingContext): string | VpcIntermedValBase {
            throw makeVpcInternalErr('|H|reached');
        }

        RuleLvl2TypeCheck(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenNumber[0]) {
                return ctx.TokenNumber[0].image;
            } else if (ctx.TokenTkidentifier[1]) {
                return ctx.TokenTkidentifier[1].image;
            } else {
                throw makeVpcInternalErr('|I|null');
            }
        }

        RuleLvl2Within(ctx: VisitingContext): string | VpcIntermedValBase {
            throw makeVpcInternalErr('|J|reached');
        }

        RuleLvl3Expression(ctx: VisitingContext): VpcVal {
            if (!ctx.RuleLvl4Expression.length || ctx.RuleOpStringConcat.length + 1 !== ctx.RuleLvl4Expression.length) {
                throw makeVpcInternalErr(`|K|,${ctx.RuleOpStringConcat.length},${ctx.RuleLvl4Expression.length}.`);
            }

            let total = this.visit(ctx.RuleLvl4Expression[0]) as VpcVal;
            checkThrow(total.isVpcVal, '|L|');
            const oprulename = VpcOpCtg.OpStringConcat;
            for (let i = 0; i < ctx.RuleOpStringConcat.length; i++) {
                let whichop = this.visit(ctx.RuleOpStringConcat[i]);
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl4Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulename, whichop);
                checkThrow(total.isVpcVal, '|M|');
            }

            return total;
        }

        RuleLvl4Expression(ctx: VisitingContext): VpcVal {
            if (!ctx.RuleLvl5Expression.length || ctx.RuleOpPlusMinus.length + 1 !== ctx.RuleLvl5Expression.length) {
                throw makeVpcInternalErr(`|N|,${ctx.RuleOpPlusMinus.length},${ctx.RuleLvl5Expression.length}.`);
            }

            let total = this.visit(ctx.RuleLvl5Expression[0]) as VpcVal;
            checkThrow(total.isVpcVal, '|O|');
            const oprulename = VpcOpCtg.OpPlusMinus;
            for (let i = 0; i < ctx.RuleOpPlusMinus.length; i++) {
                let whichop = this.visit(ctx.RuleOpPlusMinus[i]);
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl5Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulename, whichop);
                checkThrow(total.isVpcVal, '|P|');
            }

            return total;
        }

        RuleLvl5Expression(ctx: VisitingContext): VpcVal {
            if (
                !ctx.RuleLvl6Expression.length ||
                ctx.RuleOpMultDivideExpDivMod.length + 1 !== ctx.RuleLvl6Expression.length
            ) {
                throw makeVpcInternalErr(
                    `|Q|,${ctx.RuleOpMultDivideExpDivMod.length},${ctx.RuleLvl6Expression.length}.`
                );
            }

            let total = this.visit(ctx.RuleLvl6Expression[0]) as VpcVal;
            checkThrow(total.isVpcVal, '|R|');
            const oprulename = VpcOpCtg.OpMultDivideExpDivMod;
            for (let i = 0; i < ctx.RuleOpMultDivideExpDivMod.length; i++) {
                let whichop = this.visit(ctx.RuleOpMultDivideExpDivMod[i]);
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl6Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulename, whichop);
                checkThrow(total.isVpcVal, '|S|');
            }

            return total;
        }

        RuleOpLogicalOrAnd(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenOr[0]) {
                return ctx.TokenOr[0].image;
            } else if (ctx.TokenAnd[0]) {
                return ctx.TokenAnd[0].image;
            } else {
                throw makeVpcInternalErr('|T|null');
            }
        }

        RuleOpEqualityGreaterLessOrContains(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenContains[0]) {
                return ctx.TokenContains[0].image;
            } else if (ctx.TokenTkgreaterorlessequalorequal[0]) {
                return ctx.TokenTkgreaterorlessequalorequal[0].image;
            } else {
                throw makeVpcInternalErr('|U|null');
            }
        }

        RuleOpStringConcat(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenTkconcatdoubleorsingle[0]) {
                return ctx.TokenTkconcatdoubleorsingle[0].image;
            } else {
                throw makeVpcInternalErr('|V|null');
            }
        }

        RuleOpPlusMinus(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenTkplusorminus[0]) {
                return ctx.TokenTkplusorminus[0].image;
            } else {
                throw makeVpcInternalErr('|W|null');
            }
        }

        RuleOpMultDivideExpDivMod(ctx: VisitingContext): string | VpcIntermedValBase {
            if (ctx.TokenTkmultdivideexpdivmod[0]) {
                return ctx.TokenTkmultdivideexpdivmod[0].image;
            } else {
                throw makeVpcInternalErr('|X|null');
            }
        }

        RuleTopLevelRequestEval(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleTopLevelRequestHandlerCall(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        /* generated code, any changes above this point will be lost: --------------- */
    }

    let ComposedClass = VpcVisitorAddMixinMethods(VPCCustomVisitor);
    return new ComposedClass();
}

/**
 * cache the lexer, parser, and visitor
 */
class CachedObjects {
    lexer: O<ChvLexer> = undefined;
    parser: O<VpcChvParser> = undefined;
    visitor: O<VpcVisitorInterface> = undefined;

    static staticCache = new CachedObjects();
}

/**
 * retrieve cached objects, creating if needed
 */
export function getParsingObjects(): [ChvLexer, VpcChvParser, VpcVisitorInterface] {
    if (!CachedObjects.staticCache.lexer) {
        CachedObjects.staticCache.lexer = new ChvLexer(listTokens);
    }

    if (!CachedObjects.staticCache.parser) {
        CachedObjects.staticCache.parser = new VpcChvParser([], listTokens);
    }

    if (!CachedObjects.staticCache.visitor) {
        CachedObjects.staticCache.visitor = createVisitor(CachedObjects.staticCache.parser);
    }

    return [CachedObjects.staticCache.lexer, CachedObjects.staticCache.parser, CachedObjects.staticCache.visitor];
}
