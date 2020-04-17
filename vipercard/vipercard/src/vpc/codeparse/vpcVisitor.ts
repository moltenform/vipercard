
/* auto */ import { VpcVisitorAddMixinMethods, VpcVisitorInterface } from './vpcVisitorMixin';
/* auto */ import { VisitingContext } from './vpcVisitorInterface';
/* auto */ import { VpcEvalHelpers } from './../vpcutils/vpcValEval';
/* auto */ import { IntermedMapOfIntermedVals, VpcVal } from './../vpcutils/vpcVal';
/* auto */ import { ChvITk, allVpcTokens } from './vpcTokens';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcChvParser } from './vpcParser';
/* auto */ import { VpcOpCtg, checkThrow, makeVpcInternalErr } from './../vpcutils/vpcEnums';
/* auto */ import { OutsideWorldRead } from './../vel/velOutsideInterfaces';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { longstr } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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

                let item = ctx[key];
                if (item) {
                    let looksLikeRule = key.startsWith('Rule');
                    /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */
                    let looksLikeToken = key.startsWith('tk') || key.startsWith('_');
                    /* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */
                    if (looksLikeRule || looksLikeToken) {
                        const len = item.length;
                        for (let i = 0; i < len; i++) {
                            let child = item[i];
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
            if (ctx.tkAllUnaryPropertiesIfNotAlready && ctx.tkAllUnaryPropertiesIfNotAlready[0]) {
                return ctx.tkAllUnaryPropertiesIfNotAlready[0];
            } else if (ctx.tkUnaryVipercardProperties && ctx.tkUnaryVipercardProperties[0]) {
                return ctx.tkUnaryVipercardProperties[0];
            } else if (ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready && ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0]) {
                return ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0];
            } else if (ctx._id && ctx._id[0]) {
                return ctx._id[0];
            } else if (ctx._marked && ctx._marked[0]) {
                return ctx._marked[0];
            } else if (ctx._number && ctx._number[0]) {
                return ctx._number[0];
            } else {
                throw makeVpcInternalErr('OR in HAllPropertiesThatCouldBeUnary, no branch found').clsAsErr();
            }
        }

        RuleHAnyFnNameOrAllPropertiesThatCouldBeNullary(ctx: VisitingContext): ChvITk {
            if (ctx.RuleHAnyFnName && ctx.RuleHAnyFnName[0]) {
                return this.visit(ctx.RuleHAnyFnName[0]);
            } else if (ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready && ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0]) {
                return ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0];
            } else {
                throw makeVpcInternalErr('OR in HAnyFnNameOrAllPropertiesThatCouldBeNullary, no branch found').clsAsErr();
            }
        }

        RuleHAnyFnName(ctx: VisitingContext): ChvITk {
            if (ctx.tkIdentifier && ctx.tkIdentifier[0]) {
                return ctx.tkIdentifier[0];
            } else if (ctx._target && ctx._target[0]) {
                return ctx._target[0];
            } else if (ctx._windows && ctx._windows[0]) {
                return ctx._windows[0];
            } else {
                throw makeVpcInternalErr('OR in HAnyFnName, no branch found').clsAsErr();
            }
        }

        RuleHCouldBeAPropertyToSet(ctx: VisitingContext): ChvITk {
            if (ctx.tkIdentifier && ctx.tkIdentifier[0]) {
                return ctx.tkIdentifier[0];
            } else if (ctx.RuleHAllPropertiesThatCouldBeUnary && ctx.RuleHAllPropertiesThatCouldBeUnary[0]) {
                return this.visit(ctx.RuleHAllPropertiesThatCouldBeUnary[0]);
            } else {
                throw makeVpcInternalErr('OR in HCouldBeAPropertyToSet, no branch found').clsAsErr();
            }
        }

        RuleHAnyAllowedVariableName(ctx: VisitingContext): ChvITk {
            if (ctx.tkIdentifier && ctx.tkIdentifier[0]) {
                return ctx.tkIdentifier[0];
            } else if (ctx._number && ctx._number[0]) {
                return ctx._number[0];
            } else if (ctx.tkA && ctx.tkA[0]) {
                return ctx.tkA[0];
            } else if (ctx.tkAllUnaryPropertiesIfNotAlready && ctx.tkAllUnaryPropertiesIfNotAlready[0]) {
                return ctx.tkAllUnaryPropertiesIfNotAlready[0];
            } else if (ctx.tkUnaryVipercardProperties && ctx.tkUnaryVipercardProperties[0]) {
                return ctx.tkUnaryVipercardProperties[0];
            } else if (ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready && ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0]) {
                return ctx.tkAllNullaryOrUnaryPropertiesIfNotAlready[0];
            } else {
                throw makeVpcInternalErr('OR in HAnyAllowedVariableName, no branch found').clsAsErr();
            }
        }

        RuleObject(ctx: VisitingContext): RequestedVelRef {
            if (ctx.RuleObjectSpecial && ctx.RuleObjectSpecial[0]) {
                return this.visit(ctx.RuleObjectSpecial[0]);
            } else if (ctx.RuleObjectInterpretedFromString && ctx.RuleObjectInterpretedFromString[0]) {
                return this.visit(ctx.RuleObjectInterpretedFromString[0]);
            } else if (ctx.RuleObjectBtn && ctx.RuleObjectBtn[0]) {
                return this.visit(ctx.RuleObjectBtn[0]);
            } else if (ctx.RuleObjectFld && ctx.RuleObjectFld[0]) {
                return this.visit(ctx.RuleObjectFld[0]);
            } else if (ctx.RuleObjectCard && ctx.RuleObjectCard[0]) {
                return this.visit(ctx.RuleObjectCard[0]);
            } else if (ctx.RuleObjectBg && ctx.RuleObjectBg[0]) {
                return this.visit(ctx.RuleObjectBg[0]);
            } else if (ctx.RuleObjectStack && ctx.RuleObjectStack[0]) {
                return this.visit(ctx.RuleObjectStack[0]);
            } else {
                throw makeVpcInternalErr('OR in Object, no branch found').clsAsErr();
            }
        }

        RuleOf(ctx: VisitingContext): ChvITk {
            if (ctx.tkOfOnly && ctx.tkOfOnly[0]) {
                return ctx.tkOfOnly[0];
            } else if (ctx.tkInOnly && ctx.tkInOnly[0]) {
                return ctx.tkInOnly[0];
            } else {
                throw makeVpcInternalErr('OR in Of, no branch found').clsAsErr();
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

        RuleHGenericFunctionCall(ctx: VisitingContext): VpcVal {
            if (ctx.RuleFnCallNumberOf && ctx.RuleFnCallNumberOf[0]) {
                return this.visit(ctx.RuleFnCallNumberOf[0]);
            } else if (ctx.RuleFnCallThereIs && ctx.RuleFnCallThereIs[0]) {
                return this.visit(ctx.RuleFnCallThereIs[0]);
            } else if (ctx.RuleHFnCallWParens && ctx.RuleHFnCallWParens[0]) {
                return this.visit(ctx.RuleHFnCallWParens[0]);
            } else if (ctx.RuleHUnaryPropertyGet && ctx.RuleHUnaryPropertyGet[0]) {
                return this.visit(ctx.RuleHUnaryPropertyGet[0]);
            } else if (ctx.RuleHOldStyleFnNonNullary && ctx.RuleHOldStyleFnNonNullary[0]) {
                return this.visit(ctx.RuleHOldStyleFnNonNullary[0]);
            } else if (ctx.RuleHOldStyleFnNullaryOrNullaryPropGet && ctx.RuleHOldStyleFnNullaryOrNullaryPropGet[0]) {
                return this.visit(ctx.RuleHOldStyleFnNullaryOrNullaryPropGet[0]);
            } else {
                throw makeVpcInternalErr('OR in HGenericFunctionCall, no branch found').clsAsErr();
            }
        }

        RuleFnCallNumberOf(ctx: VisitingContext): VpcVal {
            if (ctx.RuleFnCallNumberOf_1 && ctx.RuleFnCallNumberOf_1[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_1[0]);
            } else if (ctx.RuleFnCallNumberOf_5 && ctx.RuleFnCallNumberOf_5[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_5[0]);
            } else if (ctx.RuleFnCallNumberOf_6 && ctx.RuleFnCallNumberOf_6[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_6[0]);
            } else if (ctx.RuleFnCallNumberOf_7 && ctx.RuleFnCallNumberOf_7[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_7[0]);
            } else if (ctx.RuleFnCallNumberOf_8 && ctx.RuleFnCallNumberOf_8[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_8[0]);
            } else if (ctx.RuleFnCallNumberOf_9 && ctx.RuleFnCallNumberOf_9[0]) {
                return this.visit(ctx.RuleFnCallNumberOf_9[0]);
            } else {
                throw makeVpcInternalErr('OR in FnCallNumberOf, no branch found').clsAsErr();
            }
        }

        RuleAnyPropertyVal(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleExpr(ctx: VisitingContext): VpcVal {
            let operatorList = ctx.RuleAndOrOr;
            let operatorListLen = operatorList ? operatorList.length : 0;
            if (
                !ctx.RuleLvl1Expression ||
                !ctx.RuleLvl1Expression.length ||
                operatorListLen + 1 !== ctx.RuleLvl1Expression.length
            ) {
                throw makeVpcInternalErr(`RuleExpr:${operatorListLen},${ctx.RuleLvl1Expression.length}.`).clsAsErr();
            }

            let total = this.visit(ctx.RuleLvl1Expression[0]) as VpcVal;
            checkThrow(total instanceof VpcVal, 'RuleExpr: first not a vpcval');
            const oprulecategory = VpcOpCtg.OpLogicalOrAnd;
            for (let i = 0; i < operatorListLen; i++) {
                let whichop = this.visit(ctx.RuleAndOrOr[i]);
                checkThrow(typeof whichop === 'string', 'RuleExpr: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl1Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, 'RuleExpr: not a vpcval');
            }

            return total;
        }

        RuleLvl1Expression(ctx: VisitingContext): VpcVal {
            let operatorList = ctx.RuleContainsOrGreaterLessEqual;
            let operatorListLen = operatorList ? operatorList.length : 0;
            if (
                !ctx.RuleLvl2Expression ||
                !ctx.RuleLvl2Expression.length ||
                operatorListLen + 1 !== ctx.RuleLvl2Expression.length
            ) {
                throw makeVpcInternalErr(`RuleLvl1Expression:${operatorListLen},${ctx.RuleLvl2Expression.length}.`).clsAsErr();
            }

            let total = this.visit(ctx.RuleLvl2Expression[0]) as VpcVal;
            checkThrow(total instanceof VpcVal, 'RuleLvl1Expression: first not a vpcval');
            const oprulecategory = VpcOpCtg.OpEqualityGreaterLessOrContains;
            for (let i = 0; i < operatorListLen; i++) {
                let whichop = this.visit(ctx.RuleContainsOrGreaterLessEqual[i]);
                checkThrow(typeof whichop === 'string', 'RuleLvl1Expression: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl2Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, 'RuleLvl1Expression: not a vpcval');
            }

            return total;
        }

        RuleLvl3Expression(ctx: VisitingContext): VpcVal {
            let operatorList = ctx.tkStringConcat;
            let operatorListLen = operatorList ? operatorList.length : 0;
            if (
                !ctx.RuleLvl4Expression ||
                !ctx.RuleLvl4Expression.length ||
                operatorListLen + 1 !== ctx.RuleLvl4Expression.length
            ) {
                throw makeVpcInternalErr(`RuleLvl3Expression:${operatorListLen},${ctx.RuleLvl4Expression.length}.`).clsAsErr();
            }

            let total = this.visit(ctx.RuleLvl4Expression[0]) as VpcVal;
            checkThrow(total instanceof VpcVal, 'RuleLvl3Expression: first not a vpcval');
            const oprulecategory = VpcOpCtg.OpStringConcat;
            for (let i = 0; i < operatorListLen; i++) {
                let whichop = ctx.tkStringConcat[i].image;
                checkThrow(typeof whichop === 'string', 'RuleLvl3Expression: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl4Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, 'RuleLvl3Expression: not a vpcval');
            }

            return total;
        }

        RuleLvl4Expression(ctx: VisitingContext): VpcVal {
            let operatorList = ctx.tkPlusOrMinus;
            let operatorListLen = operatorList ? operatorList.length : 0;
            if (
                !ctx.RuleLvl5Expression ||
                !ctx.RuleLvl5Expression.length ||
                operatorListLen + 1 !== ctx.RuleLvl5Expression.length
            ) {
                throw makeVpcInternalErr(`RuleLvl4Expression:${operatorListLen},${ctx.RuleLvl5Expression.length}.`).clsAsErr();
            }

            let total = this.visit(ctx.RuleLvl5Expression[0]) as VpcVal;
            checkThrow(total instanceof VpcVal, 'RuleLvl4Expression: first not a vpcval');
            const oprulecategory = VpcOpCtg.OpPlusMinus;
            for (let i = 0; i < operatorListLen; i++) {
                let whichop = ctx.tkPlusOrMinus[i].image;
                checkThrow(typeof whichop === 'string', 'RuleLvl4Expression: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl5Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, 'RuleLvl4Expression: not a vpcval');
            }

            return total;
        }

        RuleLvl5Expression(ctx: VisitingContext): VpcVal {
            let operatorList = ctx.tkMultDivideExpDivMod;
            let operatorListLen = operatorList ? operatorList.length : 0;
            if (
                !ctx.RuleLvl6Expression ||
                !ctx.RuleLvl6Expression.length ||
                operatorListLen + 1 !== ctx.RuleLvl6Expression.length
            ) {
                throw makeVpcInternalErr(`RuleLvl5Expression:${operatorListLen},${ctx.RuleLvl6Expression.length}.`).clsAsErr();
            }

            let total = this.visit(ctx.RuleLvl6Expression[0]) as VpcVal;
            checkThrow(total instanceof VpcVal, 'RuleLvl5Expression: first not a vpcval');
            const oprulecategory = VpcOpCtg.OpMultDivideExpDivMod;
            for (let i = 0; i < operatorListLen; i++) {
                let whichop = ctx.tkMultDivideExpDivMod[i].image;
                checkThrow(typeof whichop === 'string', 'RuleLvl5Expression: op not a string');
                let val1 = total;
                let val2 = this.visit(ctx.RuleLvl6Expression[i + 1]);
                total = this.evalHelp.evalOp(val1, val2, oprulecategory, whichop);
                checkThrow(total instanceof VpcVal, 'RuleLvl5Expression: not a vpcval');
            }

            return total;
        }

        RuleAndOrOr(ctx: VisitingContext): string {
            if (ctx._or && ctx._or[0]) {
                return ctx._or[0].image;
            } else if (ctx._and && ctx._and[0]) {
                return ctx._and[0].image;
            } else {
                throw makeVpcInternalErr('OR in AndOrOr, no branch found').clsAsErr();
            }
        }

        RuleContainsOrGreaterLessEqual(ctx: VisitingContext): string {
            if (ctx._contains && ctx._contains[0]) {
                return ctx._contains[0].image;
            } else if (ctx.tkGreaterOrLessEqualOrEqual && ctx.tkGreaterOrLessEqualOrEqual[0]) {
                return ctx.tkGreaterOrLessEqualOrEqual[0].image;
            } else {
                throw makeVpcInternalErr('OR in ContainsOrGreaterLessEqual, no branch found').clsAsErr();
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

        RuleBuiltinCmdHide(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdLock(ctx: VisitingContext): IntermedMapOfIntermedVals {
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

        RuleBuiltinCmdReset(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdReplace(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdSelect(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdSet(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdShow(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        RuleBuiltinCmdSort(ctx: VisitingContext): IntermedMapOfIntermedVals {
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

        RuleCmdSend(ctx: VisitingContext): IntermedMapOfIntermedVals {
            return this.H$BuildMap(ctx);
        }

        /* generated code, any changes above this point will be lost: --------------- */

        /**
         * for slightly faster performance, hand-write the put command,
         * since it is used so often
         */
        RuleBuiltinCmdPut(ctx: VisitingContext) {
            return [this.visit(ctx.RuleExpr[0]), ctx.tkIdentifier[0].image, this.visit(ctx.RuleHContainer[0])];
        }

        /**
         * for slightly faster performance, hand-write these commands,
         * since they are used so often
         */
        RuleInternalCmdRequestEval(ctx: VisitingContext) {
            return this.visit(ctx.RuleExpr[0]);
        }

        /**
         * for slightly faster performance, hand-write these commands,
         * since they are used so often
         */
        RuleInternalCmdUserHandler(ctx: VisitingContext) {
            let ret: VpcVal[] = [];
            let len = ctx.RuleExpr ? ctx.RuleExpr.length : 0;
            for (let i = 0; i < len; i++) {
                ret.push(this.visit(ctx.RuleExpr[i]));
            }
            return ret;
        }
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
export function getParsingObjects(): [chevrotain.Lexer, VpcChvParser] {
    if (!CachedObjects.staticCache.lexer) {
        CachedObjects.staticCache.lexer = new chevrotain.Lexer(allVpcTokens, {
            ensureOptimizations: true
        });
    }

    if (!CachedObjects.staticCache.parser) {
        CachedObjects.staticCache.parser = new VpcChvParser();
    }

    return [CachedObjects.staticCache.lexer, CachedObjects.staticCache.parser];
}

/**
 * because the visitor is a singleton, one must provide
 * it with the correct OutsideWorldRead before using it.
 */
export function getChvVisitor(outside: OutsideWorldRead): VpcVisitorInterface {
    let parser = getParsingObjects()[1];
    if (!CachedObjects.staticCache.visitor) {
        CachedObjects.staticCache.visitor = createVisitor(parser);
    }

    CachedObjects.staticCache.visitor.outside = outside;
    return CachedObjects.staticCache.visitor;
}
