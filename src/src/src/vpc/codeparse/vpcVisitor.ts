
/* auto */ import { O, assertTrue, cProductName, checkThrow, makeVpcInternalErr, makeVpcScriptErr, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, checkThrowEq, getStrToEnum, isString, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { OrdinalOrPosition, PropAdjective, RequestedChunkType, VpcElType, VpcOpCtg } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { IntermedMapOfIntermedVals, VpcIntermedValBase, VpcVal, VpcValBool, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VpcEvalHelpers } from '../../vpc/vpcutils/vpcValEval.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcChunk.js';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from '../../vpc/vpcutils/vpcOutsideClasses.js';
/* auto */ import { OutsideWorldRead } from '../../vpc/vel/vpcOutsideInterfaces.js';
/* auto */ import { ReadableContainerStr } from '../../vpc/vel/velResolveReference.js';
/* auto */ import { ChvIToken, ChvLexer } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { listTokens } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { ChvParserClass } from '../../vpc/codeparse/vpcRules.js';
/* auto */ import { VisitingContext, VisitingVisitor } from '../../vpc/codeparse/vpcVisitorMethods.js';

class CachedObjects {
    lexer: O<ChvLexer> = undefined;
    parser: O<ChvParserClass> = undefined;
    visitor: O<Object> = undefined;
}

export function getParsingObjects(): [ChvLexer, ChvParserClass, any] {
    if (!cachedObjects.lexer) {
        cachedObjects.lexer = new ChvLexer(listTokens);
    }

    if (!cachedObjects.parser) {
        cachedObjects.parser = new ChvParserClass([], listTokens);
    }

    if (!cachedObjects.visitor) {
        cachedObjects.visitor = createVisitor(cachedObjects.parser);
    }

    return [cachedObjects.lexer, cachedObjects.parser, cachedObjects.visitor];
}

let mapNicknames: { [key: string]: string } = {
    FACTOR: 'RuleLvl6Expression',
    MAYBE_FACTOR: 'RuleLvl6Expression',
    MAYBE_ALLOW_ARITH: 'RuleLvl4Expression',
    ARITH: 'RuleLvl4Expression',
};

export function fromNickname(s: string) {
    return throwIfUndefined(mapNicknames[s], '9c|nickname not found', s);
}

let cachedObjects = new CachedObjects();

/*
In Chevtrotain:

The indices are NOT tied to the position in the grammar.
For example, let's say you have a rule like
MyRule := {<sub1> | <sub2>} {<sub1> | <sub3>}
you might imagine that results for
"Sub1" "Sub3" this would become tree.Sub1 = ["Sub1", null] tree.Sub2 = [null] tree.Sub3 = ["Sub3"]
"Sub2" "Sub1" this would become tree.Sub1 = [null, "Sub1"] tree.Sub2 = ["Sub2"] tree.Sub3 = [null]
the actual results are -- tree.Sub1 = ["Sub1"] in both cases...
--- you have to use the presence of <sub2> or <sub3> to know which branch was taken. ---
the rule results are pushed onto the array just from left to right as they come, they have no position information.
*/

export function createVisitor(parser: ChvParserClass): object {
    let Basev = parser.getBaseCstVisitorConstructor();
    class VPCCustomVisitor extends Basev implements VisitingVisitor {
        evalAllExpressions = true;
        evalHelp = new VpcEvalHelpers();
        outside: OutsideWorldRead;
        tmpar: [boolean, any] = [false, undefined];
        constructor() {
            super();
            this.validateVisitor();

            // built-in .visit accepts arrays and silently only processes the first element,
            // let's throw instead
            this.visit = (rule: any) => {
                checkThrow(
                    !Array.isArray(rule),
                    `9b|internal error, make sure you say this.visit(ctx.RuleX[0]) not this.visit(ctx.RuleX)`,
                    rule
                );
                return super.visit(rule);
            };
        }

        H$BuildMap(ctx: VisitingContext): IntermedMapOfIntermedVals {
            const ctxany = ctx as any;
            let ret = new IntermedMapOfIntermedVals();
            for (let key in ctxany) {
                if (!ctxany.hasOwnProperty(key)) {
                    continue;
                }

                let len = ctxany[key].length;
                if (len) {
                    let looksLikeRule = key.startsWith('Rule');
                    let looksLikeToken = key.startsWith('Token');
                    if (looksLikeRule || looksLikeToken) {
                        for (let i = 0; i < len; i++) {
                            let child = ctxany[key][i];
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

        RuleHSimpleContainer(ctx: VisitingContext): RequestedContainerRef {
            let ret = new RequestedContainerRef();
            if (ctx.RuleObjectPart[0]) {
                ret.vel = this.visit(ctx.RuleObjectPart[0]);
                checkThrow(ret.vel && ret.vel.isRequestedVelRef, `9a|internal error, not an element reference`);
                checkThrow(
                    ret.vel && ret.vel.type === VpcElType.Fld,
                    `9Z|we do not currently allow placing text into btns, or retrieving text from btns, please fields instead`
                );
            } else if (ctx.TokenTkidentifier[0]) {
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
                container.chunk = this.visit(ctx.RuleHChunk[0]);
                checkThrow(container.chunk && container.chunk.isRequestedChunk, `9W|chunk not valid`);
            }

            return container;
        }

        RuleHChunk(ctx: VisitingContext): RequestedChunk {
            let ret = new RequestedChunk(-1);
            let chunktype = ctx.TokenTkcharorwordoritemorlineorplural[0].image;
            ret.type = getStrToEnum<RequestedChunkType>(RequestedChunkType, 'RequestedChunkType', chunktype);
            if (ctx.RuleHOrdinal[0]) {
                ret.ordinal = getStrToEnum<OrdinalOrPosition>(
                    OrdinalOrPosition,
                    'OrdinalOrPosition',
                    this.visit(ctx.RuleHOrdinal[0])
                );
            } else {
                checkThrow(ctx.RuleHChunk_1[0], `9V|internal error in RuleHChunk`);
                let factors = ctx.RuleHChunk_1[0].children.RuleHChunkAmt;
                let first = this.visit(factors[0]) as VpcVal;
                ret.first = ret.confirmValidIndex(first, chunktype, this.tmpar);
                if (factors[1]) {
                    let last = this.visit(factors[1]) as VpcVal;
                    ret.last = ret.confirmValidIndex(last, chunktype, this.tmpar);
                }
            }

            return ret;
        }

        RuleObject_1(ctx: VisitingContext): RequestedVelRef {
            checkThrow(ctx.TokenTkidentifier[0], '9U|RuleObject_1. all choices null.');
            let ret = new RequestedVelRef(VpcElType.Unknown);
            ret.lookByRelative = OrdinalOrPosition.this;
            if (ctx.TokenTkidentifier[0].image === 'target') {
                ret.isReferenceToTarget = true;
            } else if (ctx.TokenTkidentifier[0].image === 'me') {
                ret.isReferenceToMe = true;
            } else if (ctx.TokenTkidentifier[0].image === cProductName.toLowerCase()) {
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
            let ret = new RequestedVelRef(VpcElType.Stack);
            ret.lookByRelative = OrdinalOrPosition.this;
            return ret;
        }

        Helper$ObjectFldOrBtn(ctx: VisitingContext, type: VpcElType, maintoken: any): RequestedVelRef {
            let ref = new RequestedVelRef(type);
            if (ctx.TokenTkcardorpluralsyn[0]) {
                this.Helper$DisallowPlural(ctx.TokenTkcardorpluralsyn[0].image);
                ref.partIsCd = true;
            } else if (ctx.TokenTkbkgndorpluralsyn[0]) {
                this.Helper$DisallowPlural(ctx.TokenTkbkgndorpluralsyn[0].image);
                ref.partIsBg = true;
            } else {
                throw makeVpcScriptErr(
                    '9Q|when referring to a button or field you must specify either "cd btn 1" or "bg btn 1"'
                );
            }

            this.Helper$EvalForObjects(ctx, ref, !!ctx.TokenId[0]);
            if (ctx.RuleObjectCard[0]) {
                ref.parentCdInfo = this.visit(ctx.RuleObjectCard[0]);
            }

            if (maintoken) {
                this.Helper$DisallowPlural(maintoken.image);
            }

            return ref;
        }

        Helper$ObjectCdOrBg(
            ctx: VisitingContext,
            type: VpcElType,
            maintoken: any,
            bgSubrule: any,
            stackSubrule: any
        ): RequestedVelRef {
            let ret = new RequestedVelRef(type);
            ret.parentBgInfo = bgSubrule ? this.visit(bgSubrule) : undefined;
            ret.parentStackInfo = stackSubrule ? this.visit(stackSubrule) : undefined;
            if (ctx.RuleHOrdinal[0]) {
                ret.lookByRelative = getStrToEnum<OrdinalOrPosition>(
                    OrdinalOrPosition,
                    'OrdinalOrPosition',
                    this.visit(ctx.RuleHOrdinal[0])
                );
            } else if (ctx.RuleHPosition[0]) {
                ret.lookByRelative = getStrToEnum<OrdinalOrPosition>(
                    OrdinalOrPosition,
                    'OrdinalOrPosition',
                    this.visit(ctx.RuleHPosition[0])
                );
            } else {
                this.Helper$EvalForObjects(ctx, ret, !!ctx.TokenId[0]);
            }

            if (maintoken) {
                this.Helper$DisallowPlural(maintoken.image);
            }

            return ret;
        }

        Helper$ReadVpcVal(ctx: VisitingContext, name: string, isNickname: boolean): VpcVal {
            name = isNickname ? fromNickname(name) : name;
            let chsub = (ctx as any)[name];
            checkThrow(!!chsub[0], `9P|expected this to have a RuleLvl6Expression`);
            let evaledvpc = this.visit(chsub[0]) as VpcVal;
            checkThrow(evaledvpc.isVpcVal, `9O|expected a vpcval when looking up element id or name`);
            return evaledvpc;
        }

        Helper$EvalForObjects(ctx: VisitingContext, ref: RequestedVelRef, hasId: boolean): void {
            let evaled = this.Helper$ReadVpcVal(ctx, 'FACTOR', true);
            if (hasId) {
                ref.lookById = evaled.readAsStrictNumeric(this.tmpar);
            } else if (evaled.isItNumeric()) {
                ref.lookByAbsolute = evaled.readAsStrictNumeric(this.tmpar);
            } else {
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

        RuleFnCall_Length(ctx: VisitingContext): VpcVal {
            let evaledvpc = this.Helper$ReadVpcVal(ctx, 'FACTOR', true);
            let len = evaledvpc.readAsString().length;
            return VpcValN(len);
        }

        RuleFnCallNumberOf_1(ctx: VisitingContext): VpcVal {
            let evaledvpc = this.Helper$ReadVpcVal(ctx, 'FACTOR', true);
            let str = evaledvpc.readAsString();
            let stype = ctx.TokenTkcharorwordoritemorlineorplural[0].image;
            let type = getStrToEnum<RequestedChunkType>(RequestedChunkType, 'RequestedChunkType', stype);
            let result = ChunkResolution.applyCount(str, this.outside.GetItemDelim(), type, true);
            return VpcValN(result);
        }

        RuleFnCallNumberOf_2(ctx: VisitingContext): VpcVal {
            let parentType: VpcElType;
            let type: VpcElType;
            if (ctx.TokenTkcardorpluralsyn.length) {
                parentType = VpcElType.Card;
            } else if (ctx.TokenTkbkgndorpluralsyn.length) {
                parentType = VpcElType.Bg;
            } else {
                throw makeVpcScriptErr('9N|RuleFnCallNumberOf_2 should have cd or bg, and btn or fld');
            }

            if (ctx.TokenTkbtnorpluralsyn.length) {
                type = VpcElType.Btn;
            } else if (ctx.TokenTkfldorpluralsyn.length) {
                type = VpcElType.Fld;
            } else {
                throw makeVpcScriptErr('9M|RuleFnCallNumberOf_2 should have cd or bg, and btn or fld');
            }

            let parentRef = new RequestedVelRef(parentType);
            parentRef.lookByRelative = OrdinalOrPosition.this;
            let count = this.outside.CountElements(type, parentRef);
            return VpcValN(count);
        }

        RuleFnCallNumberOf_3(ctx: VisitingContext): VpcVal {
            let parentRef: RequestedVelRef;
            if (ctx.RuleObjectBg.length) {
                parentRef = this.visit(ctx.RuleObjectBg[0]);
            } else {
                if (ctx.RuleObjectStack.length) {
                    parentRef = this.visit(ctx.RuleObjectStack[0]);
                } else {
                    // if nothing was specified, default to looking at current stack
                    parentRef = new RequestedVelRef(VpcElType.Stack);
                    parentRef.lookByRelative = OrdinalOrPosition.this;
                }
            }

            let count = this.outside.CountElements(VpcElType.Card, parentRef);
            return VpcValN(count);
        }

        RuleFnCallNumberOf_4(ctx: VisitingContext): VpcVal {
            let parentRef: RequestedVelRef;
            if (ctx.RuleObjectStack.length) {
                parentRef = this.visit(ctx.RuleObjectStack[0]);
            } else {
                parentRef = new RequestedVelRef(VpcElType.Stack);
                parentRef.lookByRelative = OrdinalOrPosition.this;
            }

            let count = this.outside.CountElements(VpcElType.Bg, parentRef);
            return VpcValN(count);
        }

        RuleFnCallWithParens(ctx: VisitingContext): VpcVal {
            let builtinFnName: string;
            if (ctx.TokenLength.length) {
                assertTrue(!ctx.TokenTkidentifier.length, '9L|specified both tkidentifier and length?');
                builtinFnName = ctx.TokenLength[0].image;
            } else if (ctx.TokenTkidentifier.length) {
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
            let sadjective = ctx.TokenTkadjective[0] ? ctx.TokenTkadjective[0].image : '';
            let adjective = slength(sadjective)
                ? getStrToEnum<PropAdjective>(PropAdjective, "adjective (the 'long' target)", sadjective)
                : PropAdjective.empty;
            let fnOrPropName = ctx.TokenTkidentifier[0].image;
            switch (fnOrPropName) {
                case 'target':
                    return this.outside.GetProp(undefined, 'target', adjective, undefined);
                case 'result': // fallthrough
                case 'paramcount': // fallthrough
                case 'params':
                    checkThrow(
                        adjective === PropAdjective.empty,
                        "9G|we don't support an adjective (the 'long' target) here."
                    );
                    return this.outside.CallBuiltinFunction(fnOrPropName, []);
                default:
                    // maybe it's a property?
                    if (this.outside.IsProductProp(fnOrPropName)) {
                        let refProductOps = new RequestedVelRef(VpcElType.Product);
                        refProductOps.lookByRelative = OrdinalOrPosition.this;
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
                // strip the opening and closing quotes
                let sLit = ctx.TokenTkstringliteral[0].image;
                sLit = sLit.slice(1, -1);
                return VpcValS(sLit);
            } else if (ctx.TokenTknumliteral[0]) {
                // here we allow scientific notation
                return VpcVal.getScientificNotation(ctx.TokenTknumliteral[0].image);
            } else if (ctx.RuleExprGetProperty[0]) {
                return this.visit(ctx.RuleExprGetProperty[0]);
            } else if (ctx.RuleFnCall[0]) {
                return this.visit(ctx.RuleFnCall[0]);
            } else if (ctx.RuleHSimpleContainer[0]) {
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
                : PropAdjective.empty;
            let propname = this.visit(ctx.RuleAnyPropertyName[0]) as string;
            checkThrow(isString(propname), `9C|internal error, expected AnyPropertyName to be a string`);
            if (ctx.RuleHChunk[0]) {
                let chunk = this.visit(ctx.RuleHChunk[0]) as RequestedChunk;
                checkThrow(chunk.isRequestedChunk, `9B|internal error, expected RuleHChunk to be a chunk`);
                let fld = this.visit(ctx.RuleObjectFld[0]) as RequestedVelRef;
                checkThrow(fld.isRequestedVelRef, `9A|internal error, expected RuleObjectFld to be a RequestedElRef`);
                return this.outside.GetProp(fld, propname, adjective, chunk);
            } else {
                let velRef = this.visit(ctx.RuleObject[0]) as RequestedVelRef;
                checkThrow(velRef.isRequestedVelRef, `99|internal error, expected RuleObject to be a RequestedElRef`);
                return this.outside.GetProp(velRef, propname, adjective, undefined);
            }
        }

        RuleExprThereIs(ctx: VisitingContext): VpcVal {
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

            for (let sub of ctx.RuleLvl2Sub) {
                if (sub.children.RuleLvl2TypeCheck.length) {
                    // type check expression "is a number"
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
                    // "is within" expression
                    let lvl2within = sub.children.RuleLvl2Within[0];
                    checkThrow(lvl2within.children.RuleLvl3Expression.length, '92|no RuleLvl3Expression');
                    let val = this.visit(lvl2within.children.RuleLvl3Expression[0]);
                    checkThrow(val.isVpcVal, `91|not a vpcval`, val);
                    total = this.evalHelp.evalOp(total, val, VpcOpCtg.OpStringWithin, 'is within');
                } else if (sub.children.RuleLvl3Expression.length) {
                    // "is" or "is not" expression
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
                // here we allow scientific notation
                return VpcVal.getScientificNotation(ctx.TokenTknumliteral[0].image);
            } else if (ctx.RuleHSimpleContainer[0]) {
                let container = this.visit(ctx.RuleHSimpleContainer[0]) as RequestedContainerRef;
                checkThrow(container.isRequestedContainerRef, `internal error, expected IntermedValContainer`);
                return VpcValS(this.outside.ContainerRead(container));
            } else {
                throw makeVpcInternalErr('|3|null');
            }
        }

        // generated code, any changes past this point will be lost:

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
            if (ctx.RuleFnCall_Length[0]) {
                return this.visit(ctx.RuleFnCall_Length[0]);
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
    }

    return new VPCCustomVisitor();
}
