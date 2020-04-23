
/* auto */ import { VisitingContext } from './vpcVisitorInterface';
/* auto */ import { VpcEvalHelpers } from './../vpcutils/vpcValEval';
/* auto */ import { IntermedMapOfIntermedVals, VpcVal, VpcValBool, VpcValN, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { LogToReplMsgBox } from './../vpcutils/vpcUtils';
/* auto */ import { tkstr } from './vpcTokens';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { OrdinalOrPosition, PropAdjective, VpcElType, VpcGranularity, VpcOpCtg, checkThrow, checkThrowInternal } from './../vpcutils/vpcEnums';
/* auto */ import { ChunkResolution, RequestedChunk } from './../vpcutils/vpcChunkResolution';
/* auto */ import { VelResolveId } from './../vel/velResolveName';
/* auto */ import { ReadableContainerStr } from './../vel/velResolveContainer';
/* auto */ import { OutsideWorldRead } from './../vel/velOutsideInterfaces';
/* auto */ import { VpcTextFieldAsGeneric } from './../vel/velField';
/* auto */ import { bool } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, arLast, castVerifyIsStr, getStrToEnum } from './../../ui512/utils/util512';
/* auto */ import { TextSelModify } from './../../ui512/textedit/ui512TextSelModify';
/* auto */ import { UI512ElTextField } from './../../ui512/elements/ui512ElementTextField';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/* check_long_lines_silence_subsequent */

/**
 * a Visitor object can recurse through a syntax tree to evaluate an expression
 * this interface provides what is needed for VpcVisitorAddMixinMethods
 */
export interface VpcVisitorInterface {
    visit(rule: any): any;
    tmpArr: [boolean, any];
    outside: OutsideWorldRead;
    evalHelp: VpcEvalHelpers;
}

/**
 * constructor type, used to create a mixin
 */
type Constructor<T> = new (...args: any[]) => T;

/**
 * create a mixin adding more methods to the visitor
 * this class contains the custom visitor logic not created by genparse.py
 */
export function VpcVisitorAddMixinMethods<T extends Constructor<VpcVisitorInterface>>(Base: T) {
    return class extends Base {
        Helper$ReadVpcVal(ctx: VisitingContext, subrule: string, context: string): VpcVal {
            let child = ctx[subrule];
            checkThrow(bool(child && child[0]), `9P|expected to have an expression ${context}`);
            let evaledVpc = this.visit(child[0]) as VpcVal;
            checkThrow(evaledVpc instanceof VpcVal, `9O|expected a vpcval when looking up element id or name`);
            return evaledVpc;
        }

        Helper$SetByNumberOrName(ret: RequestedVelRef, ctx: VisitingContext, subrule: string) {
            let val = this.Helper$ReadVpcVal(ctx, subrule, this.Helper$SetByNumberOrName.name);
            if (val.isItNumeric()) {
                ret.lookByAbsolute = val.readAsStrictNumeric(this.tmpArr);
            } else {
                ret.lookByName = val.readAsString();
            }
        }

        RuleObjectBtn(ctx: VisitingContext): RequestedVelRef {
            let ret = new RequestedVelRef(VpcElType.Btn);
            return this.help$ObjBtnOrFld(ctx, tkstr.tkBtn, ret);
        }

        RuleObjectFld(ctx: VisitingContext): RequestedVelRef {
            let ret = new RequestedVelRef(VpcElType.Fld);
            return this.help$ObjBtnOrFld(ctx, tkstr.tkFld, ret);
        }

        help$ObjBtnOrFld(ctx: VisitingContext, tokenName: string, ret: RequestedVelRef): RequestedVelRef {
            if (ctx.RuleObjectCard && ctx.RuleObjectCard[0]) {
                ret.parentCdInfo = this.visit(ctx.RuleObjectCard[0]);
            } else {
                ret.parentCdInfo = new RequestedVelRef(VpcElType.Card);
                ret.parentCdInfo.lookByRelative = OrdinalOrPosition.This;
            }

            let isBg = tokenName === tkstr.tkFld;
            if (ctx.tkBg && ctx.tkBg[0]) {
                isBg = true;
            }
            if (ctx.tkCard && ctx.tkCard[0]) {
                isBg = false;
            }
            ret.partIsBg = isBg;
            ret.partIsCd = !isBg;
            if (ctx.RuleOrdinal && ctx.RuleOrdinal[0] && ctx.RuleLvl6Expression && ctx.RuleLvl6Expression[0]) {
                checkThrow(false, "SH|you can't say 'the first cd btn 1'");
            } else if (ctx.RuleOrdinal && ctx.RuleOrdinal[0]) {
                ret.lookByRelative = this.visit(ctx.RuleOrdinal[0]);
            } else if (ctx._id && ctx._id[0]) {
                ret.lookById = this.Helper$ReadVpcVal(
                    ctx,
                    tkstr.RuleLvl6Expression,
                    this.help$ObjBtnOrFld.name
                ).readAsStrictNumeric(this.tmpArr);
            } else {
                this.Helper$SetByNumberOrName(ret, ctx, tkstr.RuleLvl6Expression);
            }

            return ret;
        }

        RuleObjectCard(ctx: VisitingContext): RequestedVelRef {
            let ret = new RequestedVelRef(VpcElType.Card);
            if (ctx.RuleObjectBg && ctx.RuleObjectBg[0]) {
                ret.parentBgInfo = this.visit(ctx.RuleObjectBg[0]);
            }
            if (ctx.RuleObjectStack && ctx.RuleObjectStack[0]) {
                ret.parentStackInfo = this.visit(ctx.RuleObjectStack[0]);
            }
            if (ctx._marked && ctx._marked[0]) {
                ret.cardLookAtMarkedOnly = true;
            }

            if (ctx._recent && ctx._recent[0]) {
                ret.cardIsRecentHistory = 'recent';
            } else if (ctx._back && ctx._back[0]) {
                ret.cardIsRecentHistory = 'back';
            } else if (ctx._forth && ctx._forth[0]) {
                ret.cardIsRecentHistory = 'forth';
            } else if (ctx._id && ctx._id[0]) {
                ret.lookById = this.Helper$ReadVpcVal(
                    ctx,
                    tkstr.RuleLvl6Expression,
                    this.RuleObjectCard.name
                ).readAsStrictNumeric(this.tmpArr);
            } else if (ctx.RuleOrdinal && ctx.RuleOrdinal[0]) {
                ret.lookByRelative = this.visit(ctx.RuleOrdinal[0]);
            } else if (ctx.RulePosition && ctx.RulePosition[0]) {
                ret.lookByRelative = this.visit(ctx.RulePosition[0]);
            } else if (ctx.RuleLvl6Expression && ctx.RuleLvl6Expression[0]) {
                this.Helper$SetByNumberOrName(ret, ctx, tkstr.RuleLvl6Expression);
            } else if (ctx.tkCardAtEndOfLine && ctx.tkCardAtEndOfLine[0]) {
                ret.lookByRelative = OrdinalOrPosition.This;
            } else {
                checkThrow(false, 'SG|no branch taken');
            }

            return ret;
        }

        RuleObjectBg(ctx: VisitingContext): RequestedVelRef {
            let ret = new RequestedVelRef(VpcElType.Bg);
            if (ctx.RuleObjectStack && ctx.RuleObjectStack[0]) {
                ret.parentStackInfo = this.visit(ctx.RuleObjectStack[0]);
            }
            if (ctx._id && ctx._id[0]) {
                ret.lookById = this.Helper$ReadVpcVal(ctx, tkstr.RuleLvl6Expression, this.RuleObjectBg.name).readAsStrictNumeric(
                    this.tmpArr
                );
            } else if (ctx.RuleOrdinal && ctx.RuleOrdinal[0]) {
                ret.lookByRelative = this.visit(ctx.RuleOrdinal[0]);
            } else if (ctx.RulePosition && ctx.RulePosition[0]) {
                ret.lookByRelative = this.visit(ctx.RulePosition[0]);
            } else if (ctx.RuleLvl6Expression && ctx.RuleLvl6Expression[0]) {
                this.Helper$SetByNumberOrName(ret, ctx, tkstr.RuleLvl6Expression);
            } else if (ctx.tkBgAtEndOfLine && ctx.tkBgAtEndOfLine[0]) {
                ret.lookByRelative = OrdinalOrPosition.This;
            } else {
                checkThrow(false, 'SF|no branch taken');
            }

            return ret;
        }

        RuleObjectStack(ctx: VisitingContext): RequestedVelRef {
            let ret = new RequestedVelRef(VpcElType.Stack);
            if (ctx._id && ctx._id[0]) {
                ret.lookById = this.Helper$ReadVpcVal(
                    ctx,
                    tkstr.RuleLvl6Expression,
                    this.RuleObjectStack.name
                ).readAsStrictNumeric(this.tmpArr);
            } else if (ctx.RulePosition && ctx.RulePosition[0]) {
                ret.lookByRelative = this.visit(ctx.RulePosition[0]);
            } else if (ctx.tkStackAtEndOfLine && ctx.tkStackAtEndOfLine[0]) {
                ret.lookByRelative = OrdinalOrPosition.This;
            } else if (ctx.RuleLvl6Expression && ctx.RuleLvl6Expression[0]) {
                this.Helper$SetByNumberOrName(ret, ctx, tkstr.RuleLvl6Expression);
            } else {
                checkThrow(false, 'SE|no branch taken');
            }

            return ret;
        }

        RuleObjectSpecial(ctx: VisitingContext): RequestedVelRef {
            let ret: RequestedVelRef;
            if (ctx.tkProductName && ctx.tkProductName[0]) {
                ret = new RequestedVelRef(VpcElType.Product);
                ret.lookByRelative = OrdinalOrPosition.This;
            } else if (ctx._me && ctx._me[0]) {
                ret = new RequestedVelRef(VpcElType.Unknown);
                ret.isReferenceToMe = true;
            } else if (ctx._target && ctx._target[0]) {
                ret = new RequestedVelRef(VpcElType.Unknown);
                ret.isReferenceToTarget = true;
            } else {
                checkThrowInternal(false, 'SD|null');
            }

            return ret;
        }

        RuleObjectInterpretedFromString(ctx: VisitingContext): RequestedVelRef {
            let val = VpcVal.Empty;
            if (ctx.RuleHAnyAllowedVariableName && ctx.RuleHAnyAllowedVariableName[0]) {
                let s: string = this.visit(ctx.RuleHAnyAllowedVariableName[0]).image;
                checkThrow(typeof s === 'string', 'SC|');
                let req = new RequestedContainerRef();
                req.variable = s;
                let resolved = this.outside.ResolveContainerReadable(req);
                val = VpcValS(resolved.getRawString());
            } else if (ctx._target && ctx._target[0]) {
                /* here we're looking up a true object, not reading the results of a variable */
                let ref = new RequestedVelRef(VpcElType.Unknown);
                ref.isReferenceToTarget = true;
                return ref;
            } else if (ctx.RuleHOldStyleFnNonNullary && ctx.RuleHOldStyleFnNonNullary[0]) {
                val = this.visit(ctx.RuleHOldStyleFnNonNullary[0]);
            } else if (ctx.RuleHOldStyleFnNullaryOrNullaryPropGet && ctx.RuleHOldStyleFnNullaryOrNullaryPropGet[0]) {
                val = this.visit(ctx.RuleHOldStyleFnNullaryOrNullaryPropGet[0]);
            } else if (ctx.RuleExpr && ctx.RuleExpr[0]) {
                val = this.visit(ctx.RuleExpr[0]);
            } else if (ctx.tkStringLiteral && ctx.tkStringLiteral[0]) {
                let im = ctx.tkStringLiteral[0].image;
                val = VpcValS(im.slice(1, -1));
            } else {
                checkThrow(false, 'SB|no branch');
            }

            checkThrow(val instanceof VpcVal, 'SA|');
            return VelResolveId.parseFromString(val.readAsString());
        }

        RuleObjectPart(ctx: VisitingContext): RequestedVelRef {
            if (ctx.RuleObjectBtn && ctx.RuleObjectBtn[0]) {
                return this.visit(ctx.RuleObjectBtn[0]);
            } else if (ctx.RuleObjectFld && ctx.RuleObjectFld[0]) {
                return this.visit(ctx.RuleObjectFld[0]);
            } else {
                checkThrow(false, "S9|we don't yet support looking up an object by 'part'");
            }
        }

        /*
        something interesting about Chevtrotain:
            The indices are not tied to the position in the grammar.
            For example, let's say you have a rule like
            MyRule := {<sub1> | <sub2>} {<sub1> | <sub3>}
            you might imagine that results for
            "Sub1" "Sub3" this would become tree.Sub1 = ["Sub1", null] tree.Sub2 = [null] tree.Sub3 = ["Sub3"]
            "Sub2" "Sub1" this would become tree.Sub1 = [null, "Sub1"] tree.Sub2 = ["Sub2"] tree.Sub3 = [null]
            the actual results are -- tree.Sub1 = ["Sub1"] in both cases...
            --- you have to use the presence of <sub2> or <sub3> to know which branch was taken. ---
            the rule results are pushed onto the array just from left to right as they come, they have no position information.
        */
        RuleOrdinal(ctx: VisitingContext): OrdinalOrPosition {
            let image = ctx.tkOrdinal[0].image;
            let ret = getStrToEnum<OrdinalOrPosition>(OrdinalOrPosition, tkstr.RuleOrdinal, image);
            return ret;
        }

        RulePosition(ctx: VisitingContext): OrdinalOrPosition {
            let image = ctx.tkPosition[0].image;
            let ret = getStrToEnum<OrdinalOrPosition>(OrdinalOrPosition, tkstr.RulePosition, image);
            return ret;
        }

        RuleHSimpleContainer(ctx: VisitingContext): RequestedContainerRef {
            let ret = new RequestedContainerRef();
            if (ctx.RuleMenu && ctx.RuleMenu[0]) {
                checkThrow(false, "S8|we don't yet support custom menus");
            } else if (ctx.RuleMessageBox && ctx.RuleMessageBox[0]) {
                ret.variable = LogToReplMsgBox.redirectThisVariableToMsgBox;
            } else if (ctx._target && ctx._target[0]) {
                ret.vel = new RequestedVelRef(VpcElType.Unknown);
                ret.vel.isReferenceToTarget = true;
            } else if (ctx._selection && ctx._selection[0]) {
                ret.vel = new RequestedVelRef(VpcElType.Fld);
                ret.vel.lookByName = 'there is no selection';
                let selFld = this.outside.GetSelectedField();
                if (selFld) {
                    let generic = new VpcTextFieldAsGeneric(
                        (-1 as unknown) as UI512ElTextField,
                        selFld,
                        this.outside.GetCurrentCardId()
                    );
                    let bounds = TextSelModify.getSelectedTextBounds(generic);
                    if (bounds) {
                        ret.vel = new RequestedVelRef(VpcElType.Fld);
                        ret.vel.lookById = Util512.parseIntStrict(selFld.id);
                        checkThrow(ret.vel.lookById, 'S7|');
                        ret.chunk = new RequestedChunk(bounds[0]);
                        ret.chunk.last = bounds[1];
                    }
                }
            } else if (ctx.RuleObjectPart && ctx.RuleObjectPart[0]) {
                ret.vel = this.visit(ctx.RuleObjectPart[0]);
                checkThrow(ret.vel instanceof RequestedVelRef, `9a|internal error, not an element reference`);
                checkThrow(
                    ret.vel && ret.vel.type === VpcElType.Fld,
                    `9Z|we do not currently allow placing text into btns, or retrieving text from btns, please fields instead`
                );
            } else if (ctx.RuleHAnyAllowedVariableName && ctx.RuleHAnyAllowedVariableName[0]) {
                let token = this.visit(ctx.RuleHAnyAllowedVariableName[0]);
                ret.variable = token.image;
            } else {
                checkThrowInternal(false, 'S6|HsimpleContainer no branch taken');
            }
            return ret;
        }

        RuleHContainer(ctx: VisitingContext): RequestedContainerRef {
            let ret = this.visit(ctx.RuleHSimpleContainer[0]) as RequestedContainerRef;
            checkThrow(ret instanceof RequestedContainerRef, `S5|internal error, expected IntermedValContainer`);
            if (ctx.RuleHChunk && ctx.RuleHChunk[0]) {
                checkThrow(
                    !ret.chunk,
                    `S4|a chunk has already been set. for example, we don't currently support 'put "a" into char 2 of the selection`
                );
                ret.chunk = this.visit(ctx.RuleHChunk[0]);
                checkThrow(ret.chunk && ret.chunk instanceof RequestedChunk, `9W|chunk not valid`);
            }
            return ret;
        }

        RuleHChunk(ctx: VisitingContext): RequestedChunk {
            let ret = new RequestedChunk(-1);
            checkThrow(ctx.tkChunkGranularity && ctx.tkChunkGranularity[0], 'S3|RuleHChunk');
            ret.type = getStrToEnum<VpcGranularity>(VpcGranularity, tkstr.RuleHChunk, ctx.tkChunkGranularity[0].image);
            if (ctx.RuleOrdinal && ctx.RuleOrdinal[0]) {
                ret.ordinal = this.visit(ctx.RuleOrdinal[0]);
            } else {
                ret.first = this.visit(ctx.RuleHChunkBound[0]).readAsStrictNumeric(this.tmpArr);
                if (ctx.RuleHChunkBound[1]) {
                    ret.last = this.visit(ctx.RuleHChunkBound[1]).readAsStrictNumeric(this.tmpArr);
                }
            }
            return ret;
        }

        RuleHChunkBound(ctx: VisitingContext): VpcVal {
            if (ctx.RuleExpr && ctx.RuleExpr[0]) {
                return this.visit(ctx.RuleExpr[0]);
            } else if (ctx.tkNumLiteral && ctx.tkNumLiteral[0]) {
                return VpcVal.getScientificNotation(ctx.tkNumLiteral[0].image);
            } else if (ctx.RuleHSimpleContainer && ctx.RuleHSimpleContainer[0]) {
                let container = this.visit(ctx.RuleHSimpleContainer[0]) as RequestedContainerRef;
                checkThrow(container instanceof RequestedContainerRef, `JT|internal error, expected IntermedValContainer`);
                return VpcValS(this.outside.ContainerRead(container));
            } else {
                checkThrowInternal(false, '|3|null');
            }
        }

        RuleHSource(ctx: VisitingContext): VpcVal {
            if (ctx.RuleHSource_1 && ctx.RuleHSource_1[0]) {
                return this.visit(ctx.RuleHSource_1[0]);
            } else if (ctx.RuleHGenericFunctionCall && ctx.RuleHGenericFunctionCall[0]) {
                return this.visit(ctx.RuleHGenericFunctionCall[0]);
            } else if (ctx.RuleHSimpleContainer && ctx.RuleHSimpleContainer[0]) {
                let reference = this.visit(ctx.RuleHSimpleContainer[0]);
                checkThrow(reference instanceof RequestedContainerRef, 'S2|');
                let readable = this.outside.ResolveContainerReadable(reference);
                let s = readable.getRawString();
                return VpcValS(s);
            } else {
                checkThrowInternal(false, 'S1|OR in HSource, no branch found');
            }
        }

        RuleHSource_1(ctx: VisitingContext): VpcVal {
            if (ctx.tkNumLiteral && ctx.tkNumLiteral[0]) {
                /* here we allow scientific notation */
                return VpcVal.getScientificNotation(ctx.tkNumLiteral[0].image);
            } else if (ctx.tkStringLiteral && ctx.tkStringLiteral[0]) {
                /* example: put "abc" into x */
                /* strip the opening and closing quotes */
                let sLit = ctx.tkStringLiteral[0].image;
                sLit = sLit.slice(1, -1);
                return VpcValS(sLit);
            } else {
                checkThrowInternal(false, 'S0|RuleHSource_1 no branch taken');
            }
        }

        RuleFnCallThereIs(ctx: VisitingContext): VpcVal {
            /* put there is a cd btn "myBtn" into x */
            let requestRef = this.visit(ctx.RuleObject[0]) as RequestedVelRef;
            checkThrow(requestRef instanceof RequestedVelRef, `98|internal error, expected RuleObject to be a RequestedElRef`);
            let velExists = bool(this.outside.ElementExists(requestRef));
            return VpcValBool(ctx._not && ctx._not.length ? !velExists : velExists);
        }

        RuleFnCallNumberOf_1(ctx: VisitingContext): VpcVal {
            checkThrow(!ctx.tkPartPlural || !ctx.tkPartPlural[0], "R~|we don't yet support looking up an object by 'part'");
            let type: VpcElType;
            if (ctx.tkFldPlural) {
                type = VpcElType.Fld;
            } else if (ctx.tkBtnPlural) {
                type = VpcElType.Btn;
            } else {
                checkThrow(false, 'R}|no branch taken');
            }
            let contextIsBg = type === VpcElType.Fld;
            if (ctx.tkBg && ctx.tkBg[0]) {
                contextIsBg = true;
            }
            if (ctx.tkCard && ctx.tkCard[0]) {
                contextIsBg = false;
            }

            let parentRef = new RequestedVelRef(contextIsBg ? VpcElType.Bg : VpcElType.Card);
            if (ctx.RuleObjectCard && ctx.RuleObjectCard[0]) {
                checkThrow(!contextIsBg, "R||number of bg btns of card 3 doesn't really make sense");
                parentRef = this.visit(ctx.RuleObjectCard[0]);
            } else {
                parentRef.lookByRelative = OrdinalOrPosition.This;
            }

            return VpcValN(this.outside.CountElements(type, parentRef));
        }

        RuleFnCallNumberOf_5(ctx: VisitingContext): VpcVal {
            /* number of marked cards */
            let parentRef = new RequestedVelRef(VpcElType.Stack);
            parentRef.cardLookAtMarkedOnly = true;
            parentRef.lookByRelative = OrdinalOrPosition.This;
            return VpcValN(this.outside.CountElements(VpcElType.Card, parentRef));
        }

        RuleFnCallNumberOf_6(ctx: VisitingContext): VpcVal {
            let parentRef = new RequestedVelRef(VpcElType.Stack);
            parentRef.lookByRelative = OrdinalOrPosition.This;
            if (ctx.RuleObjectBg && ctx.RuleObjectBg[0]) {
                parentRef = this.visit(ctx.RuleObjectBg[0]);
            }
            return VpcValN(this.outside.CountElements(VpcElType.Card, parentRef));
        }

        RuleFnCallNumberOf_7(ctx: VisitingContext): VpcVal {
            let parentRef = new RequestedVelRef(VpcElType.Stack);
            parentRef.lookByRelative = OrdinalOrPosition.This;
            if (ctx.RuleObjectStack && ctx.RuleObjectStack[0]) {
                parentRef = this.visit(ctx.RuleObjectStack[0]);
            }
            return VpcValN(this.outside.CountElements(VpcElType.Bg, parentRef));
        }

        RuleFnCallNumberOf_8(_ctx: VisitingContext): VpcVal {
            checkThrow(false, "R{|we don't yet support getting the number of custom menus or windows");
        }

        RuleFnCallNumberOf_9(ctx: VisitingContext): VpcVal {
            /* put the number of card buttons into x */
            let evaledvpc = this.Helper$ReadVpcVal(ctx, tkstr.RuleLvl3Expression, this.RuleFnCallNumberOf_9.name);
            let str = evaledvpc.readAsString();
            let stype = ctx.tkChunkGranularity[0].image;
            let type = getStrToEnum<VpcGranularity>(VpcGranularity, 'VpcGranularity', stype);
            let result = ChunkResolution.applyCount(str, this.outside.GetItemDelim(), type, true);
            return VpcValN(result);
        }

        RuleHFnCallWParens(ctx: VisitingContext): VpcVal {
            /* note: custom functions are handled separately */
            let fnName = this.visit(ctx.RuleHAnyFnName[0]).image;
            let args: VpcVal[] = [];
            if (ctx.RuleExpr) {
                for (let i = 0; i < ctx.RuleExpr.length; i++) {
                    args.push(this.visit(ctx.RuleExpr[i]));
                    checkThrow(arLast(args) instanceof VpcVal, '9H|did not get a vpc val, got', arLast(args));
                }
            }

            return this.outside.CallBuiltinFunction(fnName, args);
        }

        RuleHUnaryPropertyGet(ctx: VisitingContext): VpcVal {
            let propName = this.visit(ctx.RuleHAllPropertiesThatCouldBeUnary[0]).image;
            let adjective =
                ctx.tkAdjective && ctx.tkAdjective[0]
                    ? getStrToEnum<PropAdjective>(PropAdjective, 'PropAdjective', ctx.tkAdjective[0].image)
                    : PropAdjective.Empty;
            checkThrow(!ctx.RuleWindow || !ctx.RuleWindow[0], "R_|don't yet support looking up property on window");
            checkThrow(!ctx.RuleMenuItem || !ctx.RuleMenuItem[0], "R^|don't yet support looking up property on menuitem");
            checkThrow(!ctx.RuleMenu || !ctx.RuleMenu[0], "R]|don't yet support looking up property on menu");
            checkThrow(typeof propName === 'string', `9C|internal error, expected AnyPropertyName to be a string`);
            if (ctx.RuleHChunk && ctx.RuleHChunk[0]) {
                /* put the textfont of char 2 to 4 of cd fld "myFld" into x */
                let chunk = this.visit(ctx.RuleHChunk[0]) as RequestedChunk;
                checkThrow(chunk instanceof RequestedChunk, `9B|internal error, expected RuleHChunk to be a chunk`);
                let fld = this.visit(ctx.RuleObjectFld[0]) as RequestedVelRef;
                checkThrow(fld instanceof RequestedVelRef, `9A|internal error, expected RuleObjectFld to be a RequestedElRef`);
                return this.outside.GetProp(fld, propName, adjective, chunk);
            } else {
                /* put the locktext of cd fld "myFld" into x */
                let velRef = this.visit(ctx.RuleObject[0]) as RequestedVelRef;
                checkThrow(velRef instanceof RequestedVelRef, `99|internal error, expected RuleObject to be a RequestedElRef`);
                return this.outside.GetProp(velRef, propName, adjective, undefined);
            }
        }

        RuleHOldStyleFnNonNullary(ctx: VisitingContext): VpcVal {
            let fnName = this.visit(ctx.RuleHAnyFnName[0]).image;
            let arg = this.visit(ctx.RuleLvl6Expression[0]);
            return this.outside.CallBuiltinFunction(fnName, [arg]);
        }

        RuleHOldStyleFnNullaryOrNullaryPropGet(ctx: VisitingContext): VpcVal {
            let adjective =
                ctx.tkAdjective && ctx.tkAdjective[0]
                    ? getStrToEnum<PropAdjective>(PropAdjective, 'PropAdjective', ctx.tkAdjective[0].image)
                    : PropAdjective.Empty;
            let fnOrPropName = this.visit(ctx.RuleHAnyFnNameOrAllPropertiesThatCouldBeNullary[0]).image;
            if (this.outside.IsProductProp(fnOrPropName)) {
                let refProductOps = new RequestedVelRef(VpcElType.Product);
                refProductOps.lookByRelative = OrdinalOrPosition.This;
                return this.outside.GetProp(refProductOps, fnOrPropName, adjective, undefined);
            } else {
                /* we'll match the product and let you say "get the long sin of 4" and ignore the nonsensical adjective */
                return this.outside.CallBuiltinFunction(fnOrPropName, []);
            }
        }

        RuleLvl2Expression(ctx: VisitingContext): VpcVal {
            let total = this.visit(ctx.RuleLvl3Expression[0]) as VpcVal;
            checkThrow(total instanceof VpcVal, '|L|');
            if (ctx.RuleIsExpression) {
                for (let i = 0; i < ctx.RuleIsExpression.length; i++) {
                    let map = this.visit(ctx.RuleIsExpression[i]);
                    total = this.help$RuleLvl2Expression(total, map);
                }
            }

            return total;
        }

        help$RuleLvl2Expression(total: VpcVal, map: IntermedMapOfIntermedVals): VpcVal {
            let typeCheck = '';
            if (map.vals.tkIdentifier && map.vals.tkIdentifier[0]) {
                typeCheck = castVerifyIsStr(map.vals.tkIdentifier[0]);
            } else if (map.vals._number && map.vals._number[0]) {
                typeCheck = castVerifyIsStr(map.vals._number[0]);
            }

            let checkIsWithin = bool(map.vals.tkInOnly) || bool(map.vals._within);
            if (checkIsWithin) {
                /* "is within" expression */
                checkThrow(map.vals.RuleLvl3Expression && map.vals.RuleLvl3Expression[0] instanceof VpcVal, 'R[|');
                total = this.evalHelp.evalOp(total, map.vals.RuleLvl3Expression[0], VpcOpCtg.OpStringWithin, 'is within');
            } else if (typeCheck) {
                /* type check expression "is a number" */
                total = this.evalHelp.typeMatches(total, typeCheck);
            } else {
                /* "is" or "is not" expression */
                checkThrow(map.vals.RuleLvl3Expression && map.vals.RuleLvl3Expression[0] instanceof VpcVal, 'R@|');
                total = this.evalHelp.evalOp(
                    total,
                    map.vals.RuleLvl3Expression[0],
                    VpcOpCtg.OpEqualityGreaterLessOrContains,
                    'is'
                );
            }

            let negated = map.vals._not && map.vals._not.length > 0;
            if (negated) {
                total = VpcValBool(!total.readAsStrictBoolean());
            }

            return total;
        }

        RuleLvl6Expression(ctx: VisitingContext): VpcVal {
            let val: VpcVal;
            if (ctx.RuleHSource && ctx.RuleHSource[0]) {
                val = this.visit(ctx.RuleHSource[0]);
                checkThrow(val instanceof VpcVal, '8||not a vpcval', val);
            } else if (ctx.RuleExpr && ctx.RuleExpr[0]) {
                val = this.visit(ctx.RuleExpr[0]);
                checkThrow(val instanceof VpcVal, '8{|not a vpcval', val);
            } else {
                checkThrowInternal(false, `80|in RuleLvl6Expression. all interesting children null.`);
            }

            if (ctx.RuleHChunk && ctx.RuleHChunk[0]) {
                let chunk = this.visit(ctx.RuleHChunk[0]) as RequestedChunk;
                checkThrow(chunk instanceof RequestedChunk, '8_|not a RequestedChunk', chunk);
                let reader = new ReadableContainerStr(val.readAsString());
                let result = ChunkResolution.applyRead(reader, chunk, this.outside.GetItemDelim());
                val = VpcValS(result);
            }

            if (ctx.tkPlusOrMinus && ctx.tkPlusOrMinus[0]) {
                val = this.evalHelp.evalUnary(val, ctx.tkPlusOrMinus[0].image);
            } else if (ctx._not && ctx._not[0]) {
                val = this.evalHelp.evalUnary(val, ctx._not[0].image);
            }

            return val;
        }
    };
}
