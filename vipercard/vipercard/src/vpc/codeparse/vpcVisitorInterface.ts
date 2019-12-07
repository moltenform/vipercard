
/* auto */ import { VpcIntermedValBase } from './../vpcutils/vpcVal';

// the VpcCompleteVisitor interface will make it easier
// to see that all visitor methods are there

// the VisitingContext interface is just basically there
// while writing the visitor to get autocomplete in the code editor

/* generated code, any changes past this point will be lost: --------------- */

export interface VpcCompleteVisitor {
    RuleHAllPropertiesThatCouldBeUnary(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHAnyFnNameOrAllPropertiesThatCouldBeNullary(
        ctx: VisitingContext
    ): string | VpcIntermedValBase;
    RuleHAnyFnName(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHAnyAllowedVariableName(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleObject(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleObjectBtn(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleObjectFld(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleObjectCard(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleObjectBg(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleObjectStack(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleObjectPart(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleOf(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleOrdinal(ctx: VisitingContext): string | VpcIntermedValBase;
    RulePosition(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleMenuItem(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleMenu(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleWindow1(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleWindow(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleMessageBox(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHSimpleContainer(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHContainer(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHChunk(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHChunkAmt(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHSource(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHFnCallWParens(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHUnaryPropertyGet(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHOldStyleFnNonNullary(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleHOldStyleFnNullaryOrNullaryPropGet(
        ctx: VisitingContext
    ): string | VpcIntermedValBase;
    RuleHGenericFunctionCall(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallNumberOf(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallNumberOf_1(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallNumberOf_2(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallNumberOf_3(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallNumberOf_4(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallNumberOf_5(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallNumberOf_6(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallNumberOf_7(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallNumberOf_8(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallNumberOf_9(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleFnCallThereIs(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleAnyPropertyVal(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleExpr(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleLvl1Expression(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleLvl2Expression(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleLvl3Expression(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleLvl4Expression(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleLvl5Expression(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleLvl6Expression(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleAndOrOr(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleContainsOrGreaterLessEqual(ctx: VisitingContext): string | VpcIntermedValBase;
    RuleIsExpression(ctx: VisitingContext): string | VpcIntermedValBase;
}

export interface VisitingContext {
    [index: string]: any;
    RuleHAllPropertiesThatCouldBeUnary: any[];
    RuleHAnyFnNameOrAllPropertiesThatCouldBeNullary: any[];
    RuleHAnyFnName: any[];
    RuleHAnyAllowedVariableName: any[];
    RuleObject: any[];
    RuleObjectBtn: any[];
    RuleObjectFld: any[];
    RuleObjectCard: any[];
    RuleObjectBg: any[];
    RuleObjectStack: any[];
    RuleObjectPart: any[];
    RuleOf: any[];
    RuleOrdinal: any[];
    RulePosition: any[];
    RuleMenuItem: any[];
    RuleMenu: any[];
    RuleWindow1: any[];
    RuleWindow: any[];
    RuleMessageBox: any[];
    RuleHSimpleContainer: any[];
    RuleHContainer: any[];
    RuleHChunk: any[];
    RuleHChunkAmt: any[];
    RuleHSource: any[];
    RuleHFnCallWParens: any[];
    RuleHUnaryPropertyGet: any[];
    RuleHOldStyleFnNonNullary: any[];
    RuleHOldStyleFnNullaryOrNullaryPropGet: any[];
    RuleHGenericFunctionCall: any[];
    RuleFnCallNumberOf: any[];
    RuleFnCallNumberOf_1: any[];
    RuleFnCallNumberOf_2: any[];
    RuleFnCallNumberOf_3: any[];
    RuleFnCallNumberOf_4: any[];
    RuleFnCallNumberOf_5: any[];
    RuleFnCallNumberOf_6: any[];
    RuleFnCallNumberOf_7: any[];
    RuleFnCallNumberOf_8: any[];
    RuleFnCallNumberOf_9: any[];
    RuleFnCallThereIs: any[];
    RuleAnyPropertyVal: any[];
    RuleExpr: any[];
    RuleLvl1Expression: any[];
    RuleLvl2Expression: any[];
    RuleLvl3Expression: any[];
    RuleLvl4Expression: any[];
    RuleLvl5Expression: any[];
    RuleLvl6Expression: any[];
    RuleAndOrOr: any[];
    RuleContainsOrGreaterLessEqual: any[];
    RuleIsExpression: any[];
    tkStringLiteral: chevrotain.IToken[];
    tkBlockComment: chevrotain.IToken[];
    tkLineComment: chevrotain.IToken[];
    tkContinuedLineOrWhiteSpace: chevrotain.IToken[];
    tkCardAtEndOfLine: chevrotain.IToken[];
    tkBgAtEndOfLine: chevrotain.IToken[];
    tkStackAtEndOfLine: chevrotain.IToken[];
    tkNewLine: chevrotain.IToken[];
    tkSyntaxPlaceholder: chevrotain.IToken[];
    tkNumLiteral: chevrotain.IToken[];
    tkStack: chevrotain.IToken[];
    tkBg: chevrotain.IToken[];
    tkBgPlural: chevrotain.IToken[];
    tkCard: chevrotain.IToken[];
    tkCardPlural: chevrotain.IToken[];
    tkBtn: chevrotain.IToken[];
    tkBtnPlural: chevrotain.IToken[];
    tkFld: chevrotain.IToken[];
    tkFldPlural: chevrotain.IToken[];
    tkPart: chevrotain.IToken[];
    tkPartPlural: chevrotain.IToken[];
    tkTopObject: chevrotain.IToken[];
    tkAdjective: chevrotain.IToken[];
    tkOrdinal: chevrotain.IToken[];
    tkPosition: chevrotain.IToken[];
    tkChunkGranularity: chevrotain.IToken[];
    tkInOnly: chevrotain.IToken[];
    tkOfOnly: chevrotain.IToken[];
    tkA: chevrotain.IToken[];
    _not: chevrotain.IToken[];
    _there: chevrotain.IToken[];
    _is: chevrotain.IToken[];
    _no: chevrotain.IToken[];
    _and: chevrotain.IToken[];
    _or: chevrotain.IToken[];
    _contains: chevrotain.IToken[];
    _within: chevrotain.IToken[];
    _the: chevrotain.IToken[];
    _message: chevrotain.IToken[];
    _window: chevrotain.IToken[];
    _windows: chevrotain.IToken[];
    _box: chevrotain.IToken[];
    _me: chevrotain.IToken[];
    _target: chevrotain.IToken[];
    _recent: chevrotain.IToken[];
    _back: chevrotain.IToken[];
    _forth: chevrotain.IToken[];
    _marked: chevrotain.IToken[];
    _to: chevrotain.IToken[];
    _menuItem: chevrotain.IToken[];
    _menu: chevrotain.IToken[];
    _id: chevrotain.IToken[];
    _number: chevrotain.IToken[];
    _selection: chevrotain.IToken[];
    tkComma: chevrotain.IToken[];
    tkLParen: chevrotain.IToken[];
    tkRParen: chevrotain.IToken[];
    tkPlusOrMinus: chevrotain.IToken[];
    tkMultDivideExpDivMod: chevrotain.IToken[];
    tkStringConcat: chevrotain.IToken[];
    tkGreaterOrLessEqualOrEqual: chevrotain.IToken[];
    tkIdentifier: chevrotain.IToken[];
    tkAllUnaryPropertiesIfNotAlready: chevrotain.IToken[];
    tkAllNullaryOrUnaryPropertiesIfNotAlready: chevrotain.IToken[];
}
/* generated code, any changes above this point will be lost: --------------- */

interface VisitingContextWithin {
    name: string;
    children: VisitingContext;
}
