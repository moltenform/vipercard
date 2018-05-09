
/* auto */ import { O, assertTrue, cProductName, checkThrow, makeVpcInternalErr, makeVpcScriptErr, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, checkThrowEq, getStrToEnum, isString, slength } from '../../ui512/utils/utils512.js';
/* auto */ import { OrdinalOrPosition, PropAdjective, VpcChunkType, VpcElType, VpcOpCtg } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcVal, VpcValBool, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VpcEvalHelpers } from '../../vpc/vpcutils/vpcValEval.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcChunkResolution.js';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from '../../vpc/vpcutils/vpcRequestedReference.js';
/* auto */ import { OutsideWorldRead } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { ReadableContainerStr } from '../../vpc/vel/velResolveContainer.js';
/* auto */ import { ChvIToken } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { VisitingContext } from '../../vpc/codeparse/vpcVisitorMethods.js';

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
        RuleHSimpleContainer(ctx: VisitingContext): RequestedContainerRef {
            let ret = new RequestedContainerRef();
            if (ctx.RuleObjectPart[0]) {
                /* example: put cd fld "myFld" into x */
                ret.vel = this.visit(ctx.RuleObjectPart[0]);
                checkThrow(ret.vel && ret.vel.isRequestedVelRef, `9a|internal error, not an element reference`);
                checkThrow(
                    ret.vel && ret.vel.type === VpcElType.Fld,
                    `9Z|we do not currently allow placing text into btns, or retrieving text from btns, please fields instead`
                );
            } else if (ctx.TokenTkidentifier[0]) {
                /* example: put myVar into x */
                ret.variable = ctx.TokenTkidentifier[0].image;
            } else {
                throw makeVpcInternalErr('9Y|all choices null ' + 'HSimpleContainer');
            }

            return ret;
        }

        RuleHContainer(ctx: VisitingContext): RequestedContainerRef {
            let container = this.visit(ctx.RuleHSimpleContainer[0]) as RequestedContainerRef;
            checkThrow(container.isRequestedContainerRef, `9X|container not valid`);
            if (ctx.RuleHChunk[0]) {
                /* example: put char 2 of myVar into x */
                container.chunk = this.visit(ctx.RuleHChunk[0]);
                checkThrow(container.chunk && container.chunk.isRequestedChunk, `9W|chunk not valid`);
            }

            return container;
        }

        RuleHChunk(ctx: VisitingContext): RequestedChunk {
            let ret = new RequestedChunk(-1);
            let chunktype = ctx.TokenTkcharorwordoritemorlineorplural[0].image;
            ret.type = getStrToEnum<VpcChunkType>(VpcChunkType, 'VpcChunkType', chunktype);
            if (ctx.RuleHOrdinal[0]) {
                /* example: put second char of myVar into x */
                ret.ordinal = getStrToEnum<OrdinalOrPosition>(
                    OrdinalOrPosition,
                    'OrdinalOrPosition',
                    this.visit(ctx.RuleHOrdinal[0])
                );
            } else {
                /* example: put char 2 of myVar into x */
                checkThrow(ctx.RuleHChunk_1[0], `9V|internal error in RuleHChunk`);
                let factors = ctx.RuleHChunk_1[0].children.RuleHChunkAmt;
                let first = this.visit(factors[0]) as VpcVal;
                ret.first = ret.confirmValidIndex(first, chunktype, this.tmpArr);
                if (factors[1]) {
                    /* example: put char 2 to 5 of myVar into x */
                    let last = this.visit(factors[1]) as VpcVal;
                    ret.last = ret.confirmValidIndex(last, chunktype, this.tmpArr);
                }
            }

            return ret;
        }

        RuleObject_1(ctx: VisitingContext): RequestedVelRef {
            checkThrow(ctx.TokenTkidentifier[0], '9U|RuleObject_1. all choices null.');
            let ret = new RequestedVelRef(VpcElType.Unknown);
            ret.lookByRelative = OrdinalOrPosition.This;
            if (ctx.TokenTkidentifier[0].image === 'target') {
                /* example: put the name of the target into x */
                ret.isReferenceToTarget = true;
            } else if (ctx.TokenTkidentifier[0].image === 'me') {
                /* example: put the name of me into x */
                ret.isReferenceToMe = true;
            } else if (ctx.TokenTkidentifier[0].image === cProductName.toLowerCase()) {
                /* example: put the name of %cProductName into x */
                ret.type = VpcElType.Product;
            } else {
                throw makeVpcScriptErr(
                    `9T|Please use something like 'cd btn id 123', 'cd btn "name"', 'the target', 'me', or '${cProductName}'. We did not recognize ${
                        ctx.TokenTkidentifier[0].image
                    } `
                );
            }

            return ret;
        }

        Helper$DisallowPlural(s: string) {
            /* without this, we'd allow something confusing like put "abc" into cards fields "myField" */
            let withoutS = s.substr(0, s.length - 1);
            checkThrow(s[s.length - 1] !== 's', `9S|encountered '${s}' where expected '${withoutS}`);
        }

        RuleObjectStack(ctx: VisitingContext): RequestedVelRef {
            let identifier = ctx.TokenTkidentifier[0].image;
            checkThrowEq(
                'this',
                identifier,
                `9R|currently, we only accept referring to a stack as "this stack", and don't support referencing other stacks.`
            );

            /* example: put the name of this stack into x */
            let ret = new RequestedVelRef(VpcElType.Stack);
            ret.lookByRelative = OrdinalOrPosition.This;
            return ret;
        }

        Helper$ObjectFldOrBtn(ctx: VisitingContext, type: VpcElType, mainToken: any): RequestedVelRef {
            let ref = new RequestedVelRef(type);
            if (ctx.TokenTkcardorpluralsyn[0]) {
                /* example: put the name of *cd* fld "myField" into x */
                this.Helper$DisallowPlural(ctx.TokenTkcardorpluralsyn[0].image);
                ref.partIsCd = true;
            } else if (ctx.TokenTkbkgndorpluralsyn[0]) {
                /* example: put the name of *bg* fld "myField" into x */
                this.Helper$DisallowPlural(ctx.TokenTkbkgndorpluralsyn[0].image);
                ref.partIsBg = true;
            } else {
                /* unlike original product, we require the prefix, for clarity. */
                throw makeVpcScriptErr(
                    '9Q|when referring to a button or field you must specify either "cd btn 1" or "bg btn 1"'
                );
            }

            this.Helper$EvalForObjects(ctx, ref, !!ctx.TokenId[0]);
            if (ctx.RuleObjectCard[0]) {
                /* cd fld "myField" of cd 4 */
                ref.parentCdInfo = this.visit(ctx.RuleObjectCard[0]);
            }

            if (mainToken) {
                this.Helper$DisallowPlural(mainToken.image);
            }

            return ref;
        }

        Helper$ObjectCdOrBg(
            ctx: VisitingContext,
            type: VpcElType,
            mainToken: any,
            bgSubrule: any,
            stackSubrule: any
        ): RequestedVelRef {
            let ret = new RequestedVelRef(type);
            ret.parentBgInfo = bgSubrule ? this.visit(bgSubrule) : undefined;
            ret.parentStackInfo = stackSubrule ? this.visit(stackSubrule) : undefined;
            if (ctx.RuleHOrdinal[0]) {
                /* put the name of second card into x */
                ret.lookByRelative = getStrToEnum<OrdinalOrPosition>(
                    OrdinalOrPosition,
                    'OrdinalOrPosition',
                    this.visit(ctx.RuleHOrdinal[0])
                );
            } else if (ctx.RuleHPosition[0]) {
                /* put the name of next card into x */
                ret.lookByRelative = getStrToEnum<OrdinalOrPosition>(
                    OrdinalOrPosition,
                    'OrdinalOrPosition',
                    this.visit(ctx.RuleHPosition[0])
                );
            } else {
                this.Helper$EvalForObjects(ctx, ret, !!ctx.TokenId[0]);
            }

            if (mainToken) {
                this.Helper$DisallowPlural(mainToken.image);
            }

            return ret;
        }

        Helper$ReadVpcVal(ctx: VisitingContext, name: string, isNickname: boolean): VpcVal {
            name = isNickname ? fromNickname(name) : name;
            let child = ctx[name];
            checkThrow(!!child[0], `9P|expected this to have a RuleLvl6Expression`);
            let evaledVpc = this.visit(child[0]) as VpcVal;
            checkThrow(evaledVpc.isVpcVal, `9O|expected a vpcval when looking up element id or name`);
            return evaledVpc;
        }

        Helper$EvalForObjects(ctx: VisitingContext, ref: RequestedVelRef, hasId: boolean): void {
            let evaled = this.Helper$ReadVpcVal(ctx, 'FACTOR', true);
            if (hasId) {
                /* put the name of cd btn id 1234 into x */
                ref.lookById = evaled.readAsStrictNumeric(this.tmpArr);
            } else if (evaled.isItNumeric()) {
                /* put the name of cd btn 2 into x */
                ref.lookByAbsolute = evaled.readAsStrictNumeric(this.tmpArr);
            } else {
                /* put the name of cd btn "myBtn" into x */
                ref.lookByName = evaled.readAsString();
            }
        }

        RuleObjectBtn(ctx: VisitingContext): RequestedVelRef {
            return this.Helper$ObjectFldOrBtn(ctx, VpcElType.Btn, ctx.TokenTkbtnorpluralsyn[0]);
        }

        RuleObjectFld(ctx: VisitingContext): RequestedVelRef {
            return this.Helper$ObjectFldOrBtn(ctx, VpcElType.Fld, ctx.TokenTkfldorpluralsyn[0]);
        }

        RuleObjectCard(ctx: VisitingContext): RequestedVelRef {
            return this.Helper$ObjectCdOrBg(
                ctx,
                VpcElType.Card,
                ctx.TokenTkcardorpluralsyn[0],
                ctx.RuleObjectBg[0],
                undefined
            );
        }

        RuleObjectBg(ctx: VisitingContext): RequestedVelRef {
            return this.Helper$ObjectCdOrBg(
                ctx,
                VpcElType.Bg,
                ctx.TokenTkbkgndorpluralsyn[0],
                undefined,
                ctx.RuleObjectStack[0]
            );
        }

        RuleFnCallLength(ctx: VisitingContext): VpcVal {
            /* put the length of "abc" into x */
            let evaledvpc = this.Helper$ReadVpcVal(ctx, 'FACTOR', true);
            let len = evaledvpc.readAsString().length;
            return VpcValN(len);
        }

        RuleFnCallNumberOf_1(ctx: VisitingContext): VpcVal {
            /* put the number of card buttons into x */
            let evaledvpc = this.Helper$ReadVpcVal(ctx, 'FACTOR', true);
            let str = evaledvpc.readAsString();
            let stype = ctx.TokenTkcharorwordoritemorlineorplural[0].image;
            let type = getStrToEnum<VpcChunkType>(VpcChunkType, 'VpcChunkType', stype);
            let result = ChunkResolution.applyCount(str, this.outside.GetItemDelim(), type, true);
            return VpcValN(result);
        }

        RuleFnCallNumberOf_2(ctx: VisitingContext): VpcVal {
            let parentType: VpcElType;
            let type: VpcElType;
            if (ctx.TokenTkcardorpluralsyn.length) {
                /* put the number of card {} into x */
                parentType = VpcElType.Card;
            } else if (ctx.TokenTkbkgndorpluralsyn.length) {
                /* put the number of bg {} into x */
                parentType = VpcElType.Bg;
            } else {
                throw makeVpcScriptErr('9N|RuleFnCallNumberOf_2 should have cd or bg, and btn or fld');
            }

            if (ctx.TokenTkbtnorpluralsyn.length) {
                /* put the number of {} buttons into x */
                type = VpcElType.Btn;
            } else if (ctx.TokenTkfldorpluralsyn.length) {
                /* put the number of {} fields into x */
                type = VpcElType.Fld;
            } else {
                throw makeVpcScriptErr('9M|RuleFnCallNumberOf_2 should have cd or bg, and btn or fld');
            }

            let parentRef = new RequestedVelRef(parentType);
            parentRef.lookByRelative = OrdinalOrPosition.This;
            let count = this.outside.CountElements(type, parentRef);
            return VpcValN(count);
        }

        RuleFnCallNumberOf_3(ctx: VisitingContext): VpcVal {
            let parentRef: RequestedVelRef;
            if (ctx.RuleObjectBg.length) {
                /* number of cards of bg 2 */
                parentRef = this.visit(ctx.RuleObjectBg[0]);
            } else {
                if (ctx.RuleObjectStack.length) {
                    /* number of cards of this stack */
                    parentRef = this.visit(ctx.RuleObjectStack[0]);
                } else {
                    /* if nothing was specified, default to looking at current stack */
                    parentRef = new RequestedVelRef(VpcElType.Stack);
                    parentRef.lookByRelative = OrdinalOrPosition.This;
                }
            }

            let count = this.outside.CountElements(VpcElType.Card, parentRef);
            return VpcValN(count);
        }

        RuleFnCallNumberOf_4(ctx: VisitingContext): VpcVal {
            let parentRef: RequestedVelRef;
            if (ctx.RuleObjectStack.length) {
                /* number of bgs of this stack */
                parentRef = this.visit(ctx.RuleObjectStack[0]);
            } else {
                /* number of bgs */
                parentRef = new RequestedVelRef(VpcElType.Stack);
                parentRef.lookByRelative = OrdinalOrPosition.This;
            }

            let count = this.outside.CountElements(VpcElType.Bg, parentRef);
            return VpcValN(count);
        }

        RuleFnCallWithParens(ctx: VisitingContext): VpcVal {
            let builtinFnName: string;
            if (ctx.TokenLength.length) {
                /* put length("abc") into x */
                assertTrue(!ctx.TokenTkidentifier.length, '9L|specified both tkidentifier and length?');
                builtinFnName = ctx.TokenLength[0].image;
            } else if (ctx.TokenTkidentifier.length) {
                /* put sqrt(4) into x */
                assertTrue(!ctx.TokenLength.length, '9K|specified both tkidentifier and length?');
                assertEq(1, ctx.TokenTkidentifier.length, '9J|');
                builtinFnName = ctx.TokenTkidentifier[0].image;
            } else {
                throw makeVpcScriptErr('9I|RuleFnCallWithParens should have TokenLength or TokenTkidentifier');
            }

            let args: VpcVal[] = [];
            for (let i = 0; i < ctx.RuleExpr.length; i++) {
                args.push(this.visit(ctx.RuleExpr[i]));
                checkThrow(args[args.length - 1].isVpcVal, '9H|did not get a vpc val, got', args[args.length - 1]);
            }

            return this.outside.CallBuiltinFunction(builtinFnName, args);
        }

        RuleFnCallWithoutParensOrGlobalGetPropOrTarget(ctx: VisitingContext): VpcVal {
            /* original product you could say
            put the sin of 4 into x and it'd be like saying sin(4)
            we don't support that except for these cases */
            let sAdjective = ctx.TokenTkadjective[0] ? ctx.TokenTkadjective[0].image : '';
            let adjective = slength(sAdjective)
                ? getStrToEnum<PropAdjective>(PropAdjective, "adjective (the 'long' target)", sAdjective)
                : PropAdjective.Empty;

            let fnOrPropName = ctx.TokenTkidentifier[0].image;
            switch (fnOrPropName) {
                case 'target':
                    return this.outside.GetProp(undefined, 'target', adjective, undefined);
                case 'result': /* fallthrough */
                case 'paramcount': /* fallthrough */
                case 'params':
                    checkThrow(
                        adjective === PropAdjective.Empty,
                        "9G|we don't support an adjective (the 'long' target) here."
                    );

                    return this.outside.CallBuiltinFunction(fnOrPropName, []);
                default:
                    /* maybe it's a property? */
                    if (this.outside.IsProductProp(fnOrPropName)) {
                        let refProductOps = new RequestedVelRef(VpcElType.Product);
                        refProductOps.lookByRelative = OrdinalOrPosition.This;
                        return this.outside.GetProp(refProductOps, fnOrPropName, adjective, undefined);
                    } else {
                        throw makeVpcScriptErr(
                            `9F|you can't say something like 'the sin of 4', use 'sin(4)' instead. Or you've mistyped something like 'get the version' which is valid.`
                        );
                    }
            }
        }

        RuleExprSource(ctx: VisitingContext): VpcVal {
            if (ctx.TokenTkstringliteral[0]) {
                /* example: put "abc" into x */
                /* strip the opening and closing quotes */
                let sLit = ctx.TokenTkstringliteral[0].image;
                sLit = sLit.slice(1, -1);
                return VpcValS(sLit);
            } else if (ctx.TokenTknumliteral[0]) {
                /* example: put 2.34e6 into x */
                /* here we allow scientific notation */
                return VpcVal.getScientificNotation(ctx.TokenTknumliteral[0].image);
            } else if (ctx.RuleExprGetProperty[0]) {
                /* example: put the itemDel into x */
                return this.visit(ctx.RuleExprGetProperty[0]);
            } else if (ctx.RuleFnCall[0]) {
                /* example: put sqrt(4) into x */
                return this.visit(ctx.RuleFnCall[0]);
            } else if (ctx.RuleHSimpleContainer[0]) {
                /* example: put cd fld "myFld" into x */
                let container = this.visit(ctx.RuleHSimpleContainer[0]) as RequestedContainerRef;
                checkThrow(container.isRequestedContainerRef, `9E|internal error, expected IntermedValContainer`);
                return VpcValS(this.outside.ContainerRead(container));
            } else {
                throw makeVpcInternalErr(`9D|in RuleExprSource. all interesting children null.`);
            }
        }

        RuleExprGetProperty(ctx: VisitingContext): VpcVal {
            let sadjective = ctx.TokenTkadjective[0] ? ctx.TokenTkadjective[0].image : '';
            let adjective = slength(sadjective)
                ? getStrToEnum<PropAdjective>(PropAdjective, 'adjective (the "long" name of cd btn 1)', sadjective)
                : PropAdjective.Empty;

            let propName = this.visit(ctx.RuleAnyPropertyName[0]) as string;
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

        RuleExprThereIs(ctx: VisitingContext): VpcVal {
            /* put there is a cd btn "myBtn" into x */
            let requestRef = this.visit(ctx.RuleObject[0]) as RequestedVelRef;
            checkThrow(requestRef.isRequestedVelRef, `98|internal error, expected RuleObject to be a RequestedElRef`);
            let velExists = this.outside.ElementExists(requestRef);
            let ret = ctx.TokenNot.length ? !velExists : velExists;
            return VpcValBool(ret);
        }

        RuleLvl2Expression(ctx: VisitingContext): VpcVal {
            checkThrow(ctx.RuleLvl3Expression.length > 0, '97|needs at least one');
            let total = this.visit(ctx.RuleLvl3Expression[0]) as VpcVal;
            checkThrow(total.isVpcVal, `96|visit of Lvl3Expression did not result in value`);
            checkThrowEq(ctx.TokenIs.length, ctx.RuleLvl2Sub.length, '95|not equal');

            for (let i = 0, len = ctx.RuleLvl2Sub.length; i < len; i++) {
                let sub = ctx.RuleLvl2Sub[i];
                if (sub.children.RuleLvl2TypeCheck.length) {
                    /* type check expression "is a number" */
                    let nameOfType = this.visit(sub.children.RuleLvl2TypeCheck[0]) as string;
                    let expectA = sub.children.RuleLvl2TypeCheck[0].children.TokenTkidentifier[0] as ChvIToken;
                    checkThrow(
                        expectA && (expectA.image === 'a' || expectA.image === 'an'),
                        '94|expect is a number, not is xyz number'
                    );
                    checkThrow(
                        isString(nameOfType),
                        `93|error in RuleLvl2Expression, expected string but got`,
                        nameOfType
                    );
                    total = this.evalHelp.typeMatches(total, nameOfType);
                } else if (sub.children.RuleLvl2Within.length) {
                    /* "is within" expression */
                    let lvl2within = sub.children.RuleLvl2Within[0];
                    checkThrow(lvl2within.children.RuleLvl3Expression.length, '92|no RuleLvl3Expression');
                    let val = this.visit(lvl2within.children.RuleLvl3Expression[0]);
                    checkThrow(val.isVpcVal, `91|not a vpcval`, val);
                    total = this.evalHelp.evalOp(total, val, VpcOpCtg.OpStringWithin, 'is within');
                } else if (sub.children.RuleLvl3Expression.length) {
                    /* "is" or "is not" expression */
                    let val = this.visit(sub.children.RuleLvl3Expression[0]);
                    checkThrow(val.isVpcVal, `90|not a vpcval`, val);
                    total = this.evalHelp.evalOp(total, val, VpcOpCtg.OpEqualityGreaterLessOrContains, 'is');
                } else {
                    throw makeVpcInternalErr(`8~|in RuleLvl2Expression. all interesting children null.`);
                }

                checkThrow(total.isVpcVal, `8}|visit of sub did not result in value`);
                let negated = sub.children.TokenNot.length > 0;
                if (negated) {
                    total = VpcValBool(!total.readAsStrictBoolean());
                }
            }

            return total;
        }

        RuleLvl6Expression(ctx: VisitingContext): VpcVal {
            let val: VpcVal;
            if (ctx.RuleExprSource[0]) {
                val = this.visit(ctx.RuleExprSource[0]);
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

        RuleHChunkAmt(ctx: VisitingContext): VpcVal {
            if (ctx.RuleExpr[0]) {
                return this.visit(ctx.RuleExpr[0]);
            } else if (ctx.TokenTknumliteral[0]) {
                /* here we allow scientific notation */
                return VpcVal.getScientificNotation(ctx.TokenTknumliteral[0].image);
            } else if (ctx.RuleHSimpleContainer[0]) {
                let container = this.visit(ctx.RuleHSimpleContainer[0]) as RequestedContainerRef;
                checkThrow(container.isRequestedContainerRef, `JT|internal error, expected IntermedValContainer`);
                return VpcValS(this.outside.ContainerRead(container));
            } else {
                throw makeVpcInternalErr('|3|null');
            }
        }
    };
}

/**
 * nicknames in the grammar, where it wasn't clear which level of expression to allow
 */
let mapNicknames: { [key: string]: string } = {
    FACTOR: 'RuleLvl6Expression',
    MAYBE_FACTOR: 'RuleLvl6Expression',
    MAYBE_ALLOW_ARITH: 'RuleLvl4Expression',
    ARITH: 'RuleLvl4Expression'
};

/**
 * from nickname to rulename.
 */
export function fromNickname(s: string) {
    return throwIfUndefined(mapNicknames[s], '9c|nickname not found', s);
}
