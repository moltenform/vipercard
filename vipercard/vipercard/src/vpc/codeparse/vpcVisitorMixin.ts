
/* auto */ import { VisitingContext } from './vpcVisitorInterface';
/* auto */ import { VpcEvalHelpers } from './../vpcutils/vpcValEval';
/* auto */ import { VpcVal, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { RequestedContainerRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { OutsideWorldRead } from './../vel/velOutsideInterfaces';
/* auto */ import { checkThrow, makeVpcInternalErr } from './../../ui512/utils/util512Assert';

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
export function VpcVisitorAddMixinMethods<T extends Constructor<VpcVisitorInterface>>(
    Base: T
) {
    return class extends Base {
        RuleHChunkAmt(ctx: VisitingContext): VpcVal {
            if (ctx.RuleExpr[0]) {
                return this.visit(ctx.RuleExpr[0]);
            } else if (ctx.TokenTknumliteral[0]) {
                /* here we allow scientific notation */
                return VpcVal.getScientificNotation(ctx.TokenTknumliteral[0].image);
            } else if (ctx.RuleHSimpleContainer[0]) {
                let container = this.visit(
                    ctx.RuleHSimpleContainer[0]
                ) as RequestedContainerRef;
                checkThrow(
                    container.isRequestedContainerRef,
                    `JT|internal error, expected IntermedValContainer`
                );
                return VpcValS(this.outside.ContainerRead(container));
            } else {
                throw makeVpcInternalErr('|3|null');
            }
        }
    };
}
