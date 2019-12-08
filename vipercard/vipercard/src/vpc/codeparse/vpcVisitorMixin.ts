
/* auto */ import { VisitingContext } from './vpcVisitorInterface';
/* auto */ import { VpcEvalHelpers } from './../vpcutils/vpcValEval';
/* auto */ import { VpcIntermedValBase, VpcVal, VpcValBool, VpcValN, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { OrdinalOrPosition, PropAdjective, VpcChunkType, VpcElType } from './../vpcutils/vpcEnums';
/* auto */ import { ChunkResolution, RequestedChunk } from './../vpcutils/vpcChunkResolution';
/* auto */ import { OutsideWorldRead } from './../vel/velOutsideInterfaces';
/* auto */ import { bool, checkThrow, makeVpcInternalErr } from './../../ui512/utils/util512Assert';
/* auto */ import { getStrToEnum, isString, last, longstr } from './../../ui512/utils/util512';


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

function nicerErrMsgcast<T>(ctor: Constructor<T>, input: string | VpcIntermedValBase): T {
    if (input instanceof ctor) {
        return input;
    } else {
        checkThrow(`cast failed, expected type ${ctor.name}`, '');
    }
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
            checkThrow(bool(child[0]), `9P|expected to have an expression ${context}`);
            let evaledVpc = this.visit(child[0]) as VpcVal;
            checkThrow(evaledVpc.isVpcVal, `9O|expected a vpcval when looking up element id or name`);
            return evaledVpc;
        }

        helper$SetByNumberOrName(ret: RequestedVelRef, ctx: VisitingContext, subrule: string) {
            let val = this.Helper$ReadVpcVal(ctx, subrule, '');
            if (val.isItNumeric()) {
                ret.lookByAbsolute = val.readAsStrictNumeric(this.tmpArr);
            } else {
                ret.lookByName = val.readAsString();
            }
        }

        RuleObjectBtn(ctx: VisitingContext): RequestedVelRef {
            let ret = new RequestedVelRef(VpcElType.Btn);
            return this.help$ObjBtnOrFld(ctx, 'tkBtn', ret);
        }
        RuleObjectFld(ctx: VisitingContext): RequestedVelRef {
            let ret = new RequestedVelRef(VpcElType.Fld);
            return this.help$ObjBtnOrFld(ctx, 'tkFld', ret);
        }

        help$ObjBtnOrFld(ctx: VisitingContext, tokenName: string, ret: RequestedVelRef): RequestedVelRef {
            if (ctx.RuleObjectCard[0]) {
                ret.parentCdInfo = this.visit(ctx.RuleObjectCard[0]);
            } else {
                ret.parentCdInfo = new RequestedVelRef(VpcElType.Card)
                ret.parentCdInfo.lookByRelative = OrdinalOrPosition.This;
            }
            let isBg = tokenName === 'tkFld'
            if (ctx.tkBg[0]) {
                isBg = true
            }
            if (ctx.tkCard[0]) {
                isBg = false
            }
            ret.partIsBg = isBg
            ret.partIsCd = !isBg
            if (ctx.RuleOrdinal[0] && ctx.RuleLvl6Expression[0]) {
                checkThrow(false, "you can't say 'the first cd btn 1'");
            } else if (ctx.RuleOrdinal[0]) {
                ret.lookByRelative = this.visit(ctx.RuleOrdinal[0]);
            } else if (ctx._id[0]) {
                ret.lookById = this.Helper$ReadVpcVal(ctx, 'Lvl6Expression', '').readAsStrictNumeric(this.tmpArr);
            } else {
                this.helper$SetByNumberOrName(ret, ctx, 'Lvl6Expression');
            }

            return ret;
        }

        RuleObjectBg(ctx: VisitingContext): RequestedVelRef {
            let ret = new RequestedVelRef(VpcElType.Bg);
            if (ctx.RuleObjectStack[0]) {
                ret.parentStackInfo = this.visit(ctx.RuleObjectStack[0]);
            }
            if (ctx._id[0]) {
                ret.lookById = this.Helper$ReadVpcVal(ctx, 'Lvl6Expression', '').readAsStrictNumeric(this.tmpArr);
            } else if (ctx._tkBgAtEndOfLine[0]) {
                ret.lookByRelative = OrdinalOrPosition.This;
            } else if (ctx.RuleOrdinal[0]) {
                ret.lookByRelative = this.visit(ctx.RuleOrdinal[0]);
            } else if (ctx.RulePosition[0]) {
                ret.lookByRelative = this.visit(ctx.RulePosition[0]);
            } else {
                this.helper$SetByNumberOrName(ret, ctx, 'Lvl6Expression');
            }
            return ret;
        }

        RuleObjectCard(ctx: VisitingContext): RequestedVelRef {
            let ret = new RequestedVelRef(VpcElType.Card);
            if (ctx.RuleObjectBg[0]) {
                ret.parentBgInfo = this.visit(ctx.RuleObjectBg[0]);
            }
            if (ctx._marked[0]) {
                ret.cardLookAtMarkedOnly = true
            }
            if (ctx._recent[0]) {
                ret.cardIsRecentHistory = 'recent'
            } else if (ctx._back[0]) {
                ret.cardIsRecentHistory = 'back'
            } else if (ctx._forth[0]) {
                ret.cardIsRecentHistory = 'forth'
            } else if (ctx._id[0]) {
                ret.lookById = this.Helper$ReadVpcVal(ctx, 'Lvl6Expression', '').readAsStrictNumeric(this.tmpArr);
            } else if (ctx._tkCdAtEndOfLine[0]) {
                ret.lookByRelative = OrdinalOrPosition.This;
            }else if (ctx.RuleOrdinal[0]) {
                ret.lookByRelative = this.visit(ctx.RuleOrdinal[0]);
            } else if (ctx.RulePosition[0]) {
                ret.lookByRelative = this.visit(ctx.RulePosition[0]);
            }  else {
                this.helper$SetByNumberOrName(ret, ctx, 'Lvl6Expression');
            }
            return ret;
        }

        help$throwOnUnsupported(ctx: VisitingContext, unsupported:string[], context:string) {
            for  (let s of unsupported ) {
                if (ctx[s] && ctx[s][0]) {
                    checkThrow(false, `we don't yet support a ${s} in the context of ${context}`)
                }
            }
        }


        RuleObjectStack(ctx: VisitingContext): RequestedVelRef {
            let ret = new RequestedVelRef(VpcElType.Stack);
            if (ctx._id[0]) {
                ret.lookById = this.Helper$ReadVpcVal(ctx, 'Lvl6Expression', '').readAsStrictNumeric(this.tmpArr);
            } else if (ctx._tkBgAtEndOfLine[0]) {
                ret.lookByRelative = OrdinalOrPosition.This;
            } else if (ctx.RulePosition[0]) {
                ret.lookByRelative = this.visit(ctx.RuleOrdinal[0]);
            } else {
                this.helper$SetByNumberOrName(ret, ctx, 'Lvl6Expression');
            }

            checkThrow(ret.lookByRelative === OrdinalOrPosition.This, 
                longstr(`9R|currently, we only accept referring to a stack as "this stack", 
                and don't support referencing other stacks.`))
            return ret;
        }

        RuleObjectSpecial(ctx: VisitingContext): RequestedVelRef {
            let ret: RequestedVelRef;
            if (ctx.tkTopObject[0]) {
                ret = new RequestedVelRef(VpcElType.Product);
                ret.lookByRelative = OrdinalOrPosition.This;
            } else if (ctx._me[0]) {
                ret = new RequestedVelRef(VpcElType.Unknown);
                ret.isReferenceToMe = true;
            } else if (ctx._target[0]) {
                ret = new RequestedVelRef(VpcElType.Unknown);
                ret.isReferenceToTarget = true;
            } else {
                throw makeVpcInternalErr('|3|null');
            }

            return ret;
        }
        RuleObjectPart(ctx: VisitingContext): RequestedVelRef {
            if (ctx.RuleObjectBtn[0]) {
                return this.RuleObjectBtn(this.visit(ctx.RuleObjectBtn[0]));
            } else if (ctx.RuleObjectFld[0]) {
                return this.RuleObjectFld(this.visit(ctx.RuleObjectFld[0]));
            } else {
                checkThrow(false, "we don't yet support looking up an object by 'part'")
            }
        }

        RuleOrdinal(ctx: VisitingContext):OrdinalOrPosition  {
            let image = ctx.tkOrdinal[0].image
            let ret = getStrToEnum<OrdinalOrPosition>(OrdinalOrPosition, 'RuleOrdinal', image)
            return ret 
        }
        RulePosition(ctx: VisitingContext):OrdinalOrPosition  {
            let image = ctx.tkPosition[0].image
            let ret = getStrToEnum<OrdinalOrPosition>(OrdinalOrPosition, 'RulePosition', image)
            return ret 
        }
        HSimpleContainer(ctx: VisitingContext): RequestedContainerRef {
            let ret = new RequestedContainerRef()
            if (ctx.RuleMenu[0]) {
                checkThrow(false, "we don't yet support custom menus")
            } else if (ctx.RuleMessageBox[0]) {
                ret.vel = 'msgbox'
            } else if (ctx._selection[0]) {
                ret.vel = 'selection'
            } else if (ctx.RuleObjectPart[0]) {
                ret.vel = this.visit(ctx.RuleObjectPart[0])
            }else if (ctx.RuleHAnyAllowedVariableName[0]) {
                let token = this.visit(ctx.RuleHAnyAllowedVariableName[0])
                ret.variable = token.image;
            } else {
                throw makeVpcInternalErr('|3|HsimpleContainer no branch taken');
            }
            return ret;
        }
        RuleHContainer(ctx: VisitingContext): RequestedContainerRef {
            let ret = this.visit(ctx.RuleHSimpleContainer[0]) as RequestedContainerRef
            checkThrow(ret.isRequestedContainerRef, `JT|internal error, expected IntermedValContainer`);
            if (ctx.RuleHChunk[0]) {
                ret.chunk = this.visit(ctx.RuleHChunk[0])
            }
            return ret;
        }
        RuleHChunk(ctx: VisitingContext): RequestedChunk {
            let ret = new RequestedChunk(-1)
            checkThrow(ctx.tkChunkGranularity[0], 'RuleHChunk')
            ret.type = getStrToEnum<VpcChunkType>(VpcChunkType, "RuleHChunk", ctx.tkChunkGranularity[0].image)
            if (ctx.RuleHOrdinal[0]) {
                ret.ordinal = this.visit(ctx.RuleHOrdinal[0])
            } else {
                ret.first = this.visit(ctx.RuleHChunkAmt[0])
                if (ctx.RuleHChunkAmt[1]) {
                    ret.last = this.visit(ctx.RuleHChunkAmt[1])
                }
            }
            return ret
        }

        RuleHSource_1(ctx: VisitingContext): VpcVal {
            if (ctx.tkNumLiteral[0]) {
                /* here we allow scientific notation */
                return VpcVal.getScientificNotation(ctx.tkNumLiteral[0].image);
            } else if (ctx.tkStringLiteral[0]) {
                /* example: put "abc" into x */
                /* strip the opening and closing quotes */
                let sLit = ctx.TokenTkstringliteral[0].image;
                sLit = sLit.slice(1, -1);
                return VpcValS(sLit);
            } else {
                throw makeVpcInternalErr('RuleHSource_1 no branch taken');
            }
        }

        RuleFnCallThereIs(ctx: VisitingContext): VpcVal {
            /* put there is a cd btn "myBtn" into x */
            let requestRef = this.visit(ctx.RuleObject[0]) as RequestedVelRef;
            checkThrow(requestRef.isRequestedVelRef, `98|internal error, expected RuleObject to be a RequestedElRef`);
            let velExists = this.outside.ElementExists(requestRef);
            return VpcValBool(ctx.TokenNot.length ? !velExists : velExists);
        }

        FnCallNumberOf_1(ctx: VisitingContext): VpcVal {
            checkThrow(!ctx.tkPartPlural[0], "we don't yet support looking up an object by 'part'")
            let type:VpcElType
            if (ctx.tkFldPlural) {
                type = VpcElType.Fld
            } else if (ctx.tkBtnPlural) {
                type = VpcElType.Btn
            } else {
                checkThrow(false, "no branch taken")
            }
            let contextIsBg = type === VpcElType.Fld
            if (ctx.tkBg[0]) {
                contextIsBg = true
            }
            if (ctx.tkCard[0]) {
                contextIsBg = false
            }

            let parentRef = new RequestedVelRef(contextIsBg ? VpcElType.Bg : VpcElType.Card);
            if (ctx.RuleObjectCard[0]) {
                checkThrow(!contextIsBg, "number of bg btns of card 3 doesn't really make sense")
                parentRef = this.visit(ctx.RuleObjectCard[0])
            } else {
                parentRef.lookByRelative = OrdinalOrPosition.This
            }
            
            return VpcValN(this.outside.CountElements(type, parentRef));
        }

        FnCallNumberOf_5(ctx: VisitingContext): VpcVal {
            // number of marked cards
            let parentRef = new RequestedVelRef(VpcElType.Stack);
            parentRef.cardLookAtMarkedOnly = true
            parentRef.lookByRelative = OrdinalOrPosition.This
            return VpcValN(this.outside.CountElements(VpcElType.Card, parentRef));
        }

        FnCallNumberOf_6(ctx: VisitingContext): VpcVal {
            let parentRef = new RequestedVelRef(VpcElType.Stack)
            parentRef.lookByRelative = OrdinalOrPosition.This
            if (ctx.RuleObjectBg[0]) {
                parentRef = this.visit(ctx.RuleObjectBg[0])
            }
            return VpcValN(this.outside.CountElements(VpcElType.Card, parentRef));
        }

        FnCallNumberOf_7(ctx: VisitingContext): VpcVal {
            let parentRef = new RequestedVelRef(VpcElType.Stack)
            parentRef.lookByRelative = OrdinalOrPosition.This
            if (ctx.RuleObjectStack[0]) {
                parentRef = this.visit(ctx.RuleObjectStack[0])
            }
            return VpcValN(this.outside.CountElements(VpcElType.Bg, parentRef));
        }

        FnCallNumberOf_8(_ctx: VisitingContext): VpcVal {
            checkThrow(false, "we don't yet support getting the number of custom menus or windows")
        }

        RuleFnCallNumberOf_9(ctx: VisitingContext): VpcVal {
            /* put the number of card buttons into x */
            let evaledvpc = this.Helper$ReadVpcVal(ctx, 'RuleLvl3Expression', true);
            let str = evaledvpc.readAsString();
            let stype = ctx.TokenTkcharorwordoritemorlineorplural[0].image;
            let type = getStrToEnum(VpcChunkType, 'VpcChunkType', stype);
            let result = ChunkResolution.applyCount(str, this.outside.GetItemDelim(), type, true);
            return VpcValN(result);
        }

        HFnCallWParens(ctx: VisitingContext): VpcVal {
            // note: custom functions are handled separately
            let fnName = this.visit(ctx.HAnyFnName[0]).image;
            let args: VpcVal[] = [];
            for (let i = 0; i < ctx.RuleExpr.length; i++) {
                args.push(this.visit(ctx.RuleExpr[i]));
                checkThrow(last(args).isVpcVal, '9H|did not get a vpc val, got', args[args.length - 1]);
            }

            return this.outside.CallBuiltinFunction(fnName, args);
        }

        HUnaryPropertyGet(ctx: VisitingContext): VpcVal {
            let propName = this.visit(ctx.HAllPropertiesThatCouldBeUnary[0]).image;
            let adjective = ctx.tkAdjective[0] ? getStrToEnum<PropAdjective>(PropAdjective, 'HUnaryPropertyGet', ctx.tkAdjective[0].image) : PropAdjective.Empty
            checkThrow(!ctx.RuleWindow[0], "don't yet support looking up property on window")
            checkThrow(!ctx.RuleMenuItem[0], "don't yet support looking up property on menuitem")
            checkThrow(!ctx.RuleMenu[0], "don't yet support looking up property on menu")
            checkThrow(isString(propName), `9C|internal error, expected AnyPropertyName to be a string`);
            if (ctx.RuleHChunk[0]) {
                /* put the textfont of char 2 to 4 of cd fld "myFld" into x */
                let chunk = this.visit(ctx.RuleHChunk[0]) as RequestedChunk;
                checkThrow(chunk.isRequestedChunk, `9B|internal error, expected RuleHChunk to be a chunk`);
                let fld = this.visit(ctx.RuleObjectFld[0]) as RequestedVelRef;
                checkThrow(fld.isRequestedVelRef, `9A|internal error, expected RuleObjectFld to be a RequestedElRef`);
                return this.outside.GetProp(fld, propName, adjective, chunk);
            } else {
                /* put the locktext of cd fld "myFld" into x */
                let velRef = this.visit(ctx.RuleObject[0]) as RequestedVelRef;
                checkThrow(velRef.isRequestedVelRef, `99|internal error, expected RuleObject to be a RequestedElRef`);
                return this.outside.GetProp(velRef, propName, adjective, undefined);
            }
        }

        RuleHOldStyleFnNonNullary(ctx: VisitingContext): VpcVal {
            let fnName = this.visit(ctx.HAnyFnName[0]).image;
            let arg = this.visit(ctx.RuleExpr[0])
            return this.outside.CallBuiltinFunction(fnName, [arg]);
        }

        RuleHOldStyleFnNullaryOrNullaryPropGet(ctx: VisitingContext): VpcVal {
            let adjective = ctx.tkAdjective[0] ? getStrToEnum<PropAdjective>(PropAdjective, 'HUnaryPropertyGet', ctx.tkAdjective[0].image) : PropAdjective.Empty
            let fnOrPropName = this.visit(ctx.HAnyFnNameOrAllPropertiesThatCouldBeNullary[0]).image;
            if (this.outside.IsProductProp(fnOrPropName)) {
                let refProductOps = new RequestedVelRef(VpcElType.Product);
                refProductOps.lookByRelative = OrdinalOrPosition.This;
                return this.outside.GetProp(refProductOps, fnOrPropName, adjective, undefined);
            } else {
                // we'll match the product and let you say "get the long sin of 4" and ignore the nonsensical adjective
                return this.outside.CallBuiltinFunction(fnOrPropName, []);
            }
        }

        RuleHChfghfghfghfghfghgfhunkAmt(ctx: VisitingContext): VpcVal {
            if (ctx.RuleExpr[0]) {
                return this.visit(ctx.RuleExpr[0]);
            } else else  if (ctx.RuleHSimpleContainer[0]) {
                let container = this.visit(ctx.RuleHSimpleContainer[0]) as RequestedContainerRef;
                checkThrow(container.isRequestedContainerRef, `JT|internal error, expected IntermedValContainer`);
                return VpcValS(this.outside.ContainerRead(container));
            } else {
                throw makeVpcInternalErr('|3|null');
            }
        }



        RuleLvl2Expression(ctx: VisitingContext): VpcVal {
            checkThrow(ctx.RuleLvl3Expression.length > 0, '97|needs at least one');
            let total = this.visit(ctx.RuleLvl3Expression[0]) as VpcVal;
            checkThrow(total.isVpcVal, `96|visit of Lvl3Expression did not result in value`);
            checkThrowEq(ctx.TokenIs.length, ctx.RuleLvl2Sub.length, '95|not equal');

            for (let i = 0, len = ctx.RuleLvl2Sub.length; i < len; i++) {
                let sub = ctx.RuleLvl2Sub[i];
                let child = 
            }
        }

        help$RuleLvl2Expression(ctx: VisitingContext, total:VpcVal, ): VpcVal {

        }

        RuleLvl6Expression(ctx: VisitingContext): VpcVal {
            let val: VpcVal;
            if (ctx.RuleHSource[0]) {
                val = this.visit(ctx.RuleHSource[0]);
                checkThrow(val.isVpcVal, '8||not a vpcval', val);
            } else if (ctx.RuleExpr[0]) {
                val = this.visit(ctx.RuleExpr[0]);
                checkThrow(val.isVpcVal, '8{|not a vpcval', val);
            } else {
                throw makeVpcInternalErr(`80|in RuleLvl6Expression. all interesting children null.`);
            }

            if (ctx.RuleHChunk[0]) {
                let chunk = this.visit(ctx.RuleHChunk[0]) as RequestedChunk;
                checkThrow(chunk.isRequestedChunk, '8_|not a RequestedChunk', chunk);
                let reader = new ReadableContainerStr(val.readAsString());
                let result = ChunkResolution.applyRead(reader, chunk, this.outside.GetItemDelim());
                val = VpcValS(result);
            }

            if (ctx.TokenTkplusorminus[0]) {
                val = this.evalHelp.evalUnary(val, ctx.TokenTkplusorminus[0].image);
            } else if (ctx.TokenNot[0]) {
                val = this.evalHelp.evalUnary(val, ctx.TokenNot[0].image);
            }

            return val;
        }
    };
}
