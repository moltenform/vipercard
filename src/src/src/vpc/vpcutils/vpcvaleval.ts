
/* auto */ import { checkThrow, makeVpcInternalErr, makeVpcScriptErr, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { checkThrowEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { VpcOpCtg } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcVal, VpcValBool, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcval.js';

export class VpcEvalHelpers {
    tmp1: [boolean, any] = [false, undefined];
    tmp2: [boolean, any] = [false, undefined];
    typeMatches(v: VpcVal, stype: string): VpcVal {
        let tmp = this.tmp1;
        if (stype === 'number') {
            v.isItNumericImpl(tmp);
            return VpcValBool(tmp[0]);
        } else if (stype === 'integer') {
            v.isItAStrictIntegerImpl(tmp);
            return VpcValBool(tmp[0]);
        } else if (stype === 'logical') {
            v.isItAStrictBooleanImpl(tmp);
            return VpcValBool(tmp[0]);
        } else {
            let numExpected: number;
            if (stype === 'point') {
                numExpected = 2;
            } else if (stype === 'rect') {
                numExpected = 4;
            } else {
                throw makeVpcScriptErr(
                    `5}|expected "if x is a number" but got "if x is a ${stype}" needs one of {number|integer|point|rect|logical}`
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

    evalOp(aIn: any, bIn: any, opclass: VpcOpCtg, op: string): VpcVal {
        if (!aIn || !bIn || !aIn.isVpcVal || !bIn.isVpcVal) {
            throw makeVpcInternalErr(`5_|can't compute, not VpcVal. ${aIn} ${bIn} ${opclass} ${op}`);
        }

        let a = aIn as VpcVal;
        let b = bIn as VpcVal;
        if (opclass === VpcOpCtg.OpLogicalOrAnd) {
            let av = a.readAsStrictBoolean(this.tmp1);
            let bv = b.readAsStrictBoolean(this.tmp2);
            switch (op) {
                case 'or':
                    return VpcValBool(av || bv);
                case 'and':
                    return VpcValBool(av && bv);
                default:
                    throw makeVpcInternalErr(`5^|unknown operator. ${opclass} ${op}`);
            }
        } else if (opclass === VpcOpCtg.OpEqualityGreaterLessOrContains && op !== 'contains') {
            a.isItNumericImpl(this.tmp1);
            b.isItNumericImpl(this.tmp2);
            if (this.tmp1[0] && this.tmp2[0]) {
                // numeric comparison
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
                    // fall-through
                    case '==':
                    // fall-through
                    case '=':
                        // confirmed in emulator -- very close numbers compare equal
                        return VpcValBool(Math.abs(av - bv) < VpcVal.epsilon);
                    case 'is not':
                    // fall-through
                    case '<>':
                    // fall-through
                    case '!=':
                        return VpcValBool(Math.abs(av - bv) >= VpcVal.epsilon);
                    default:
                        throw makeVpcInternalErr(`5]|unknown operator. ${opclass} ${op}`);
                }
            } else {
                // string comparison
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
                    // fall-through
                    case '==':
                    // fall-through
                    case '=':
                        // string equality, no leniency for whitespace
                        return VpcValBool(av === bv);
                    case 'is not':
                    // fall-through
                    case '<>':
                    // fall-through
                    case '!=':
                        return VpcValBool(av !== bv);
                    default:
                        throw makeVpcInternalErr(`5[|unknown operator. ${opclass} ${op}`);
                }
            }
        } else if (opclass === VpcOpCtg.OpStringConcat || opclass === VpcOpCtg.OpStringWithin || op === 'contains') {
            let av = a.readAsString();
            let bv = b.readAsString();
            switch (op) {
                case '&&':
                    return VpcValS(av + ' ' + bv);
                case '&':
                    return VpcValS(av + bv);
                case 'contains':
                    return VpcValBool(scontains(av, bv));
                case 'is within':
                    return VpcValBool(scontains(bv, av));
                default:
                    throw makeVpcInternalErr(`5@|unknown operator. ${opclass} ${op}`);
            }
        } else if (opclass === VpcOpCtg.OpPlusMinus || opclass === VpcOpCtg.OpMultDivideExpDivMod) {
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
                    throw makeVpcInternalErr(`5?|unknown operator. ${opclass} ${op}`);
            }
        } else {
            throw makeVpcInternalErr(`5>|unknown opclass ${opclass} ${op}`);
        }
    }

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

    numberListFromArgsGiven(fnname: string, vAr: VpcVal[], sep: string): number[] {
        checkThrow(vAr.length > 0, `8r|Wrong number of arguments given to ${fnname}, need at least 1`);
        checkThrowEq(1, sep.length, `8q|numberListFromArgsGiven`);
        if (vAr.length === 1 && !vAr[0].isItNumeric()) {
            // following what the emulator seems to do.
            // first, a trailing comma is removed if present.
            let s = vAr[0].readAsString();
            if (s[s.length - 1] === sep) {
                s = s.substr(0, s.length - 1);
            }

            // then, split by comma and treat empty items as zero.
            return this.numberListFromStrings(fnname, s.split(sep));
        } else {
            return this.numberListFromStrings(fnname, vAr.map(v => v.readAsString()));
        }
    }
}
