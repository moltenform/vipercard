
/* auto */ import { VpcVisitorAddMixinMethods, VpcVisitorInterface } from './vpcVisitorMixin';
/* auto */ import { VisitingContext } from './vpcVisitorInterface';
/* auto */ import { VpcEvalHelpers } from './../vpcutils/vpcValEval';
/* auto */ import { IntermedMapOfIntermedVals, VpcVal } from './../vpcutils/vpcVal';
/* auto */ import { ChvITk, allVpcTokens } from './vpcTokens';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcChvParser } from './vpcParser';
/* auto */ import { VpcOpCtg } from './../vpcutils/vpcEnums';
/* auto */ import { OutsideWorldRead } from './../vel/velOutsideInterfaces';
/* auto */ import { O, checkThrow, makeVpcInternalErr } from './../../ui512/utils/util512Assert';
/* auto */ import { isString, longstr } from './../../ui512/utils/util512';

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
        public warningFlags: string[] = [];
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
                longstr(
                    `9b|internal error, make sure you
                say this.visit(ctx.RuleX[0]) not this.visit(ctx.RuleX)`,
                    ''
                ),
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

        RuleHAllPropertiesThatCouldBeUnary(ctx: VisitingContext): ChvITk {
            if (ctx.tkAllUnaryPropertiesIfNotAlready[0]) {
                return ctx.tkAllUnaryPropertiesIfNotAlready[0];
            } else if (ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0]) {
                return ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0];
            } else if (ctx._id[0]) {
                return ctx._id[0];
            } else if (ctx._marked[0]) {
                return ctx._marked[0];
            } else if (ctx._number[0]) {
                return ctx._number[0];
            } else {
                throw makeVpcInternalErr('OR in HAllPropertiesThatCouldBeUnary, no branch found');
            }
        }

        RuleHAnyFnNameOrAllPropertiesThatCouldBeNullary(ctx: VisitingContext): ChvITk {
            if (ctx.RuleHAnyFnName[0]) {
                return this.visit(ctx.RuleHAnyFnName[0]);
            } else if (ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0]) {
                return ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0];
            } else {
                throw makeVpcInternalErr('OR in HAnyFnNameOrAllPropertiesThatCouldBeNullary, no branch found');
            }
        }

        RuleHAnyFnName(ctx: VisitingContext): ChvITk {
            if (ctx.tkIdentifier[0]) {
                return ctx.tkIdentifier[0];
            } else if (ctx._windows[0]) {
                return ctx._windows[0];
            } else {
                throw makeVpcInternalErr('OR in HAnyFnName, no branch found');
            }
        }

        RuleHCouldBeAPropertyToSet(ctx: VisitingContext): ChvITk {
            if (ctx.tkIdentifier[0]) {
                return ctx.tkIdentifier[0];
            } else if (ctx.RuleHAllPropertiesThatCouldBeUnary[0]) {
                return this.visit(ctx.RuleHAllPropertiesThatCouldBeUnary[0]);
            } else {
                throw makeVpcInternalErr('OR in HCouldBeAPropertyToSet, no branch found');
            }
        }

        RuleHAnyAllowedVariableName(ctx: VisitingContext): ChvITk {
            if (ctx.tkIdentifier[0]) {
                return ctx.tkIdentifier[0];
            } else if (ctx._number[0]) {
                return ctx._number[0];
            } else if (ctx.tkA[0]) {
                return ctx.tkA[0];
            } else if (ctx.tkAllUnaryPropertiesIfNotAlready[0]) {
                return ctx.tkAllUnaryPropertiesIfNotAlready[0];
            } else if (ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0]) {
                return ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0];
            } else {
                throw makeVpcInternalErr('OR in HAnyAllowedVariableName, no branch found');
            }
        }

        RuleObject(ctx: VisitingContext): RequestedVelRef {
            if (ctx.RuleObjectSpecial[0]) {
                return this.visit(ctx.RuleObjectSpecial[0]);
            } else if (ctx.RuleObjectBtn[0]) {
                return this.visit(ctx.RuleObjectBtn[0]);
            } else if (ctx.RuleObjectFld[0]) {
                return this.visit(ctx.RuleObjectFld[0]);
            } else if (ctx.RuleObjectCard[0]) {
                return this.visit(ctx.RuleObjectCard[0]);
            } else if (ctx.RuleObjectBg[0]) {
                return this.visit(ctx.RuleObjectBg[0]);
            } else if (ctx.RuleObjectStack[0]) {
                return this.visit(ctx.RuleObjectStack[0]);
            } else {
                throw makeVpcInternalErr('OR in Object, no branch found');
            }
        }

        RuleOf(ctx: VisitingContext): ChvITk {
            if (ctx.tkOfOnly[0]) {
                return ctx.tkOfOnly[0];
            } else if (ctx.tkInOnly[0]) {
                return ctx.tkInOnly[0];
            } else {
                throw makeVpcInternalErr('OR in Of, no branch found');
            }
        }

        RuleMenuItem(ctx: VisitingContext): string {
            return '{menuitemExpr}';
        }

        RuleMenu(ctx: VisitingContext): string {
            return '{menuExpr}';
        }

        RuleWindow_1(ctx: VisitingContext): string {
            return '{windowExpr}';
        }

        RuleWindow(ctx: VisitingContext): string {
            return '{windowExpr}';
        }

        RuleMessageBox(ctx: VisitingContext): string {
            return '{msgBoxExpr}';
        }

        RuleHSource(ctx: VisitingContext): VpcVal {
            if (ctx.RuleHSource_1[0]) {
                return this.visit(ctx.RuleHSource_1[0]);
            } else if (ctx.RuleHGenericFunctionCall[0]) {
                return this.visit(ctx.RuleHGenericFunctionCall[0]);
            } else if (ctx.RuleHSimpleContainer[0]) {
                return this.visit(ctx.RuleHSimpleContainer[0]);
            } else {
                throw makeVpcInternalErr('OR in HSource, no branch found');
            }
        }

        RuleHGenericFunctionCall(ctx: VisitingContext): VpcVal {
            if (ctx.RuleFnCallNumberOf[0]) {
                return this.visit(ctx.RuleFnCallNumberOf[0]);
            } else if (ctx.RuleFnCallThereIs[0]) {
                return this.visit(ctx.RuleFnCallThereIs[0]);
            } else if (ctx.RuleHFnCallWParens[0]) {
                return this.visit(ctx.RuleHFnCallWParens[0]);
            } else if (ctx.RuleHUnaryPropertyGet[0]) {
                return this.visit(ctx.RuleHUnaryPropertyGet[0]);
            } else if (ctx.RuleHOldStyleFnNonNullary[0]) {
                return this.visit(ctx.RuleHOldStyleFnNonNullary[0]);
            } else if (ctx.RuleHOldStyleFnNullaryOrNullaryPropGet[0]) {
                return this.visit(ctx.RuleHOldStyleFnNullaryOrNullaryPropGet[0]);
            } else {
                throw makeVpcInternalErr('OR in HGenericFunctionCall, no branch found');
            }
        }

        RuleFnCallNumberOf(ctx: VisitingContext): VpcVal {
            if (ctx.RuleFnCallNumberOf_1[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_1[0]);
            } else if (ctx.RuleFnCallNumberOf_5[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_5[0]);
            } else if (ctx.RuleFnCallNumberOf_6[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_6[0]);
            } else if (ctx.RuleFnCallNumberOf_7[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_7[0]);
            } else if (ctx.RuleFnCallNumberOf_8[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_8[0]);
            } else if (ctx.RuleFnCallNumberOf_9[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_9[0]);
            } else {
                throw makeVpcInternalErr('OR in FnCallNumberOf, no branch found');
            }
        }

        RuleAnyPropertyVal(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleExpr(ctx: VisitingContext): VpcVal {
            if (!ctx.RuleLvl1Expression.length || ctx.RuleAndOrOr.length + 1 !== ctx.RuleLvl1Expression.length) {
                throw makeVpcInternalErr(`RuleExpr:${ctx.RuleAndOrOr.length},${ctx.RuleLvl1Expression.length}.`);
            }

            let total = this.visit(ctx.RuleLvl1Expression[0]) as VpcVal;
            checkThrow(total instanceof isVpcVal, 'RuleExpr: first not a vpcval');
            const oprulecategory = VpcOpCtg.OpLogicalOrAnd;
            for (let i = 0; i < ctx.RuleAndOrOr.length; i++) {
                let whichop = this.visit(ctx.RuleAndOrOr[i]);
                checkThrow(isString(whichop), 'RuleExpr: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl1Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, 'RuleExpr: not a vpcval');
            }

            return total;
        }

        RuleLvl1Expression(ctx: VisitingContext): VpcVal {
            if (
                !ctx.RuleLvl2Expression.length ||
                ctx.RuleContainsOrGreaterLessEqual.length + 1 !== ctx.RuleLvl2Expression.length
            ) {
                throw makeVpcInternalErr(
                    `RuleLvl1Expression:${ctx.RuleContainsOrGreaterLessEqual.length},${ctx.RuleLvl2Expression.length}.`
                );
            }

            let total = this.visit(ctx.RuleLvl2Expression[0]) as VpcVal;
            checkThrow(total instanceof isVpcVal, 'RuleLvl1Expression: first not a vpcval');
            const oprulecategory = VpcOpCtg.OpEqualityGreaterLessOrContains;
            for (let i = 0; i < ctx.RuleContainsOrGreaterLessEqual.length; i++) {
                let whichop = this.visit(ctx.RuleContainsOrGreaterLessEqual[i]);
                checkThrow(isString(whichop), 'RuleLvl1Expression: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl2Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, 'RuleLvl1Expression: not a vpcval');
            }

            return total;
        }

        RuleLvl3Expression(ctx: VisitingContext): VpcVal {
            if (!ctx.RuleLvl4Expression.length || ctx.tkStringConcat.length + 1 !== ctx.RuleLvl4Expression.length) {
                throw makeVpcInternalErr(`RuleLvl3Expression:${ctx.tkStringConcat.length},${ctx.RuleLvl4Expression.length}.`);
            }

            let total = this.visit(ctx.RuleLvl4Expression[0]) as VpcVal;
            checkThrow(total instanceof isVpcVal, 'RuleLvl3Expression: first not a vpcval');
            const oprulecategory = VpcOpCtg.OpStringConcat;
            for (let i = 0; i < ctx.tkStringConcat.length; i++) {
                let whichop = ctx.tkStringConcat[i].image;
                checkThrow(isString(whichop), 'RuleLvl3Expression: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl4Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, 'RuleLvl3Expression: not a vpcval');
            }

            return total;
        }

        RuleLvl4Expression(ctx: VisitingContext): VpcVal {
            if (!ctx.RuleLvl5Expression.length || ctx.tkPlusOrMinus.length + 1 !== ctx.RuleLvl5Expression.length) {
                throw makeVpcInternalErr(`RuleLvl4Expression:${ctx.tkPlusOrMinus.length},${ctx.RuleLvl5Expression.length}.`);
            }

            let total = this.visit(ctx.RuleLvl5Expression[0]) as VpcVal;
            checkThrow(total instanceof isVpcVal, 'RuleLvl4Expression: first not a vpcval');
            const oprulecategory = VpcOpCtg.OpPlusMinus;
            for (let i = 0; i < ctx.tkPlusOrMinus.length; i++) {
                let whichop = ctx.tkPlusOrMinus[i].image;
                checkThrow(isString(whichop), 'RuleLvl4Expression: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl5Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, 'RuleLvl4Expression: not a vpcval');
            }

            return total;
        }

        RuleLvl5Expression(ctx: VisitingContext): VpcVal {
            if (!ctx.RuleLvl6Expression.length || ctx.tkMultDivideExpDivMod.length + 1 !== ctx.RuleLvl6Expression.length) {
                throw makeVpcInternalErr(
                    `RuleLvl5Expression:${ctx.tkMultDivideExpDivMod.length},${ctx.RuleLvl6Expression.length}.`
                );
            }

            let total = this.visit(ctx.RuleLvl6Expression[0]) as VpcVal;
            checkThrow(total instanceof isVpcVal, 'RuleLvl5Expression: first not a vpcval');
            const oprulecategory = VpcOpCtg.OpMultDivideExpDivMod;
            for (let i = 0; i < ctx.tkMultDivideExpDivMod.length; i++) {
                let whichop = ctx.tkMultDivideExpDivMod[i].image;
                checkThrow(isString(whichop), 'RuleLvl5Expression: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl6Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, 'RuleLvl5Expression: not a vpcval');
            }

            return total;
        }

        RuleAndOrOr(ctx: VisitingContext): string {
            if (ctx._or[0]) {
                return ctx._or[0].image;
            } else if (ctx._and[0]) {
                return ctx._and[0].image;
            } else {
                throw makeVpcInternalErr('OR in AndOrOr, no branch found');
            }
        }

        RuleContainsOrGreaterLessEqual(ctx: VisitingContext): string {
            if (ctx._contains[0]) {
                return ctx._contains[0].image;
            } else if (ctx.tkGreaterOrLessEqualOrEqual[0]) {
                return ctx.tkGreaterOrLessEqualOrEqual[0].image;
            } else {
                throw makeVpcInternalErr('OR in ContainsOrGreaterLessEqual, no branch found');
            }
        }

        RuleIsExpression(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
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

        RuleBuiltinCmdBeep(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdVpccalluntrappablechoose(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdClick(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdDelete(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdDial(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdDisable(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdDivide(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdDomenu(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdVpccalluntrappabledomenu(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdDrag(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleHBuiltinCmdDrag_1(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdEnable(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdInternalvpcgocardimpl(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleHBuiltinCmdGoDest(ctx: VisitingContext): RequestedVelRef {
            if (ctx.RuleObjectCard[0]) {
                return this.visit(ctx.RuleObjectCard[0]);
            } else if (ctx.RuleObjectBg[0]) {
                return this.visit(ctx.RuleObjectBg[0]);
            } else if (ctx.RuleObjectStack[0]) {
                return this.visit(ctx.RuleObjectStack[0]);
            } else {
                throw makeVpcInternalErr('OR in HBuiltinCmdGoDest, no branch found');
            }
        }

        RuleBuiltinCmdHide(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdMark(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdMultiply(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdPlay(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdPut(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdReset(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdReplace(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdSelect(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdSend(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdSet(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdShow(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdInternalvpcsort(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdStart(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdStop(ctx: VisitingContext): IntermedMapOfIntermedVals {
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

        RuleBuiltinCmdWait(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleInternalCmdRequestEval(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleInternalCmdUserHandler(ctx: VisitingContext): IntermedMapOfIntermedVals {
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
        //~ let NoteThisIsDisabledCode = 1;
        CachedObjects.staticCache.visitor = (createVisitor(CachedObjects.staticCache.parser) as any) as VpcVisitorInterface;
        //~ CachedObjects.staticCache.visitor = (12345 as any) as VpcVisitorInterface;
    }

    return [CachedObjects.staticCache.lexer, CachedObjects.staticCache.parser, CachedObjects.staticCache.visitor];
}
