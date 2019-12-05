
/* auto */ import { VpcVal, VpcValBool, VpcValN, VpcValS } from './vpcVal';
/* auto */ import { VpcOpCtg } from './vpcEnums';
/* auto */ import { checkThrow, makeVpcInternalErr, makeVpcScriptErr } from './../../ui512/utils/util512Assert';
/* auto */ import { checkThrowEq } from './../../ui512/utils/util512';

/**
 * used by the interpreter to evaluate operations
 * tested in vpcTestScriptEval
 */
export class VpcEvalHelpers {
    /* re-use temporary arrays instead of re-allocating */
    tmp1: [boolean, any] = [false, undefined];
    tmp2: [boolean, any] = [false, undefined];

    /**
     * for checking the type of a value
     * e.g. 'if x is a number then'
     */
    typeMatches(v: VpcVal, sType: string): VpcVal {
        let tmp = this.tmp1;
        if (sType === 'number') {
            v.isItNumericImpl(tmp);
            return VpcValBool(tmp[0]);
        } else if (sType === 'integer') {
            v.isItAStrictIntegerImpl(tmp);
            return VpcValBool(tmp[0]);
        } else if (sType === 'logical') {
            v.isItAStrictBooleanImpl(tmp);
            return VpcValBool(tmp[0]);
        } else {
            let numExpected: number;
            if (sType === 'point') {
                numExpected = 2;
            } else if (sType === 'rect') {
                numExpected = 4;
            } else {
                throw makeVpcScriptErr(
                    `5}|expected "if x is a number" but got "if x is a ${sType}" needs one of {number|integer|point|rect|logical}`
                );
            }

            let pts = v.readAsString().split(',');
            if (numExpected !== pts.length) {
                return VpcVal.False;
            } else {
                return VpcValBool(pts.every(s => VpcValS(s).isItInteger()));
            }
        }
    }

    /**
     * evaluate unary operation
     */
    evalUnary(aIn: any, op: string): VpcVal {
        if (!aIn || !aIn.isVpcVal) {
            throw makeVpcInternalErr(`5||can't compute, not VpcVal. ${aIn} ${op}`);
        }

        let a = aIn as VpcVal;
        if (op === 'not') {
            let v = a.readAsStrictBoolean(this.tmp1);
            return VpcValBool(!v);
        } else if (op === '-') {
            let f = a.readAsStrictNumeric(this.tmp1);
            return VpcValN(-f);
        } else if (op === '+') {
            throw makeVpcScriptErr(`5{|syntax error, "+" in the wrong place. we can't evaluate something like 2*(+3)`);
        } else {
            throw makeVpcInternalErr(`9f|unknown unary operation ${op}`);
        }
    }

    /**
     * evaluate binary operation
     */
    evalOp(aIn: any, bIn: any, opClass: VpcOpCtg, op: string): VpcVal {
        let a = aIn as VpcVal;
        let b = bIn as VpcVal;
        if (!a || !b || !a.isVpcVal || !b.isVpcVal) {
            throw makeVpcInternalErr(`5_|can't eval, not VpcVal. ${a} ${b} ${opClass} ${op}`);
        }

        if (opClass === VpcOpCtg.OpLogicalOrAnd) {
            return this.evalOpLogicalOrAnd(a, b, op, opClass);
        } else if (opClass === VpcOpCtg.OpEqualityGreaterLessOrContains && op !== 'contains') {
            a.isItNumericImpl(this.tmp1);
            b.isItNumericImpl(this.tmp2);
            if (this.tmp1[0] && this.tmp2[0]) {
                return this.evalOpNumericComparison(op, opClass);
            } else {
                return this.evalOpStringComparison(a, b, op, opClass);
            }
        } else if (opClass === VpcOpCtg.OpStringConcat || opClass === VpcOpCtg.OpStringWithin || op === 'contains') {
            return this.evalOpStrings(a, b, op, opClass);
        } else if (opClass === VpcOpCtg.OpPlusMinus || opClass === VpcOpCtg.OpMultDivideExpDivMod) {
            return this.evalOpMath(a, b, op, opClass);
        } else {
            throw makeVpcInternalErr(`5>|unknown opClass ${opClass} ${op}`);
        }
    }

    /**
     * evaluate math (both arguments numeric)
     */
    protected evalOpMath(a: VpcVal, b: VpcVal, op: string, opClass: VpcOpCtg) {
        let av = a.readAsStrictNumeric(this.tmp1);
        let bv = b.readAsStrictNumeric(this.tmp2);
        switch (op) {
            case '+':
                return VpcValN(av + bv);
            case '-':
                return VpcValN(av - bv);
            case '*':
                return VpcValN(av * bv);
            case '/':
                return VpcValN(av / bv);
            case '^':
                return VpcValN(Math.pow(av, bv));
            case 'mod':
                return VpcValN(av % bv);
            case 'div':
                return VpcValN(Math.trunc(av / bv));
            default:
                throw makeVpcInternalErr(`5?|unknown operator. ${opClass} ${op}`);
        }
    }

    /**
     * evaluate string ops (both arguments strings)
     */
    protected evalOpStrings(a: VpcVal, b: VpcVal, op: string, opClass: VpcOpCtg) {
        let av = a.readAsString();
        let bv = b.readAsString();
        switch (op) {
            case '&&':
                return VpcValS(av + ' ' + bv);
            case '&':
                return VpcValS(av + bv);
            case 'contains':
                return VpcValBool(av.includes( bv));
            case 'is within':
                return VpcValBool(bv.includes( av));
            default:
                throw makeVpcInternalErr(`5@|unknown operator. ${opClass} ${op}`);
        }
    }

    /**
     * evaluate string comparison (both arguments strings)
     */
    protected evalOpStringComparison(a: VpcVal, b: VpcVal, op: string, opClass: VpcOpCtg) {
        let av = a.readAsString();
        let bv = b.readAsString();
        switch (op) {
            case '>':
                return VpcValBool(av > bv);
            case '>=':
                return VpcValBool(av >= bv);
            case '<':
                return VpcValBool(av < bv);
            case '<=':
                return VpcValBool(av <= bv);
            case 'is':
            // falls through
            case '==':
            // falls through
            case '=':
                /* string equality, no leniency for whitespace */
                return VpcValBool(av === bv);
            case 'is not':
            // falls through
            case '<>':
            // falls through
            case '!=':
                return VpcValBool(av !== bv);
            default:
                throw makeVpcInternalErr(`5[|unknown operator. ${opClass} ${op}`);
        }
    }

    /**
     * evaluate numeric comparison
     */
    protected evalOpNumericComparison(op: string, opClass: VpcOpCtg) {
        let av = this.tmp1[1];
        let bv = this.tmp2[1];
        switch (op) {
            case '>':
                return VpcValBool(av > bv);
            case '>=':
                return VpcValBool(av >= bv);
            case '<':
                return VpcValBool(av < bv);
            case '<=':
                return VpcValBool(av <= bv);
            case 'is':
            // falls through
            case '==':
            // falls through
            case '=':
                /* confirmed in emulator -- very close numbers compare equal */
                return VpcValBool(Math.abs(av - bv) < VpcVal.epsilon);
            case 'is not':
            // falls through
            case '<>':
            // falls through
            case '!=':
                return VpcValBool(Math.abs(av - bv) >= VpcVal.epsilon);
            default:
                throw makeVpcInternalErr(`5]|unknown operator. ${opClass} ${op}`);
        }
    }

    /**
     * evaluate logical
     */
    protected evalOpLogicalOrAnd(a: VpcVal, b: VpcVal, op: string, opClass: VpcOpCtg) {
        let av = a.readAsStrictBoolean(this.tmp1);
        let bv = b.readAsStrictBoolean(this.tmp2);
        switch (op) {
            case 'or':
                return VpcValBool(av || bv);
            case 'and':
                return VpcValBool(av && bv);
            default:
                throw makeVpcInternalErr(`5^|unknown operator. ${opClass} ${op}`);
        }
    }

    /**
     * get list of numbers from a list of strings
     */
    protected numberListFromStrings(fnname: string, sAr: string[]): number[] {
        checkThrow(sAr.length > 0, `8s|Wrong number of arguments given to ${fnname}, need at least 1`);
        return sAr.map(s => {
            if (s.trim().length === 0) {
                return 0.0;
            } else {
                return VpcValS(s).readAsStrictNumeric();
            }
        });
    }

    /**
     * get list of numbers... sometimes from a string, sometimes from args
     * e.g. put sum(1,2,3) into x
     * and put sum("1,2,3") into x
     * should do the same thing.
     */
    numberListFromArgsGiven(fnname: string, vAr: VpcVal[], sep: string): number[] {
        checkThrow(vAr.length > 0, `8r|Wrong number of arguments given to ${fnname}, need at least 1`);
        checkThrowEq(1, sep.length, `8q|numberListFromArgsGiven`);
        if (vAr.length === 1 && !vAr[0].isItNumeric()) {
            /* following what the emulator seems to do. */
            /* first, a trailing comma is removed if present. */
            let s = vAr[0].readAsString();
            if (s.endsWith(sep)) {
                s = s.substr(0, s.length - 1);
            }

            /* then, split by comma and treat empty items as zero. */
            return this.numberListFromStrings(fnname, s.split(sep));
        } else {
            return this.numberListFromStrings(fnname, vAr.map(v => v.readAsString()));
        }
    }
}
