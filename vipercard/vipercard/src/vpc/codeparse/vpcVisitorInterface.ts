
/* auto */ import { IntermedMapOfIntermedVals, VpcVal } from './../vpcutils/vpcVal';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { OrdinalOrPosition } from './../vpcutils/vpcEnums';
/* auto */ import { RequestedChunk } from './../vpcutils/vpcChunkResolution';

// the VpcCompleteVisitor interface will make it easier
// to see that all visitor methods are there

// the VisitingContext interface is just basically there
// while writing the visitor to get autocomplete in the code editor

/* generated code, any changes past this point will be lost: --------------- */

export interface VpcCompleteVisitor {
    RuleHAllPropertiesThatCouldBeUnary(ctx: VisitingContext): chevrotain.IToken;
    RuleHAnyFnNameOrAllPropertiesThatCouldBeNullary(
        ctx: VisitingContext
    ): chevrotain.IToken;
    RuleHAnyFnName(ctx: VisitingContext): chevrotain.IToken;
    RuleHAnyAllowedVariableName(ctx: VisitingContext): chevrotain.IToken;
    RuleObject(ctx: VisitingContext): RequestedVelRef;
    RuleObjectBtn(ctx: VisitingContext): RequestedVelRef;
    RuleObjectFld(ctx: VisitingContext): RequestedVelRef;
    RuleObjectCard(ctx: VisitingContext): RequestedVelRef;
    RuleObjectBg(ctx: VisitingContext): RequestedVelRef;
    RuleObjectStack(ctx: VisitingContext): RequestedVelRef;
    RuleObjectPart(ctx: VisitingContext): RequestedVelRef;
    RuleObjectSpecial(ctx: VisitingContext): RequestedVelRef;
    RuleOf(ctx: VisitingContext): chevrotain.IToken;
    RuleOrdinal(ctx: VisitingContext): OrdinalOrPosition;
    RulePosition(ctx: VisitingContext): OrdinalOrPosition;
    RuleMenuItem(ctx: VisitingContext): string;
    RuleMenu(ctx: VisitingContext): string;
    RuleWindow_1(ctx: VisitingContext): string;
    RuleWindow(ctx: VisitingContext): string;
    RuleMessageBox(ctx: VisitingContext): string;
    RuleHSimpleContainer(ctx: VisitingContext): RequestedContainerRef;
    RuleHContainer(ctx: VisitingContext): RequestedContainerRef;
    RuleHChunk(ctx: VisitingContext): RequestedChunk;
    RuleHChunkBound(ctx: VisitingContext): VpcVal;
    RuleHSource(ctx: VisitingContext): VpcVal;
    RuleHSource_1(ctx: VisitingContext): VpcVal;
    RuleHFnCallWParens(ctx: VisitingContext): VpcVal;
    RuleHUnaryPropertyGet(ctx: VisitingContext): VpcVal;
    RuleHOldStyleFnNonNullary(ctx: VisitingContext): VpcVal;
    RuleHOldStyleFnNullaryOrNullaryPropGet(ctx: VisitingContext): VpcVal;
    RuleHGenericFunctionCall(ctx: VisitingContext): VpcVal;
    RuleFnCallNumberOf(ctx: VisitingContext): VpcVal;
    RuleFnCallNumberOf_1(ctx: VisitingContext): VpcVal;
    RuleFnCallNumberOf_5(ctx: VisitingContext): VpcVal;
    RuleFnCallNumberOf_6(ctx: VisitingContext): VpcVal;
    RuleFnCallNumberOf_7(ctx: VisitingContext): VpcVal;
    RuleFnCallNumberOf_8(ctx: VisitingContext): VpcVal;
    RuleFnCallNumberOf_9(ctx: VisitingContext): VpcVal;
    RuleFnCallThereIs(ctx: VisitingContext): VpcVal;
    RuleAnyPropertyVal(ctx: VisitingContext): IntermedMapOfIntermedVals;
    RuleExpr(ctx: VisitingContext): VpcVal;
    RuleLvl1Expression(ctx: VisitingContext): VpcVal;
    RuleLvl2Expression(ctx: VisitingContext): VpcVal;
    RuleLvl3Expression(ctx: VisitingContext): VpcVal;
    RuleLvl4Expression(ctx: VisitingContext): VpcVal;
    RuleLvl5Expression(ctx: VisitingContext): VpcVal;
    RuleLvl6Expression(ctx: VisitingContext): VpcVal;
    RuleAndOrOr(ctx: VisitingContext): string;
    RuleContainsOrGreaterLessEqual(ctx: VisitingContext): string;
    RuleIsExpression(ctx: VisitingContext): IntermedMapOfIntermedVals;
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
    RuleObjectSpecial: any[];
    RuleOf: any[];
    RuleOrdinal: any[];
    RulePosition: any[];
    RuleMenuItem: any[];
    RuleMenu: any[];
    RuleWindow_1: any[];
    RuleWindow: any[];
    RuleMessageBox: any[];
    RuleHSimpleContainer: any[];
    RuleHContainer: any[];
    RuleHChunk: any[];
    RuleHChunkBound: any[];
    RuleHSource: any[];
    RuleHSource_1: any[];
    RuleHFnCallWParens: any[];
    RuleHUnaryPropertyGet: any[];
    RuleHOldStyleFnNonNullary: any[];
    RuleHOldStyleFnNullaryOrNullaryPropGet: any[];
    RuleHGenericFunctionCall: any[];
    RuleFnCallNumberOf: any[];
    RuleFnCallNumberOf_1: any[];
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
