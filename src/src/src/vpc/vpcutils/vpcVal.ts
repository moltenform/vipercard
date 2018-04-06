
/* auto */ import { assertTrue, checkThrow, makeVpcScriptErr, scontains, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { CodeLimits } from '../../vpc/vpcutils/vpcUtils.js';

export const cTkSyntaxMarker = '\n';
const maxint32 = 2147483647;
const minint32 = -2147483648;

export class VpcIntermedValBase {
    isIntermedValBase = true;
}

// VpcVals are now immutable
let restrictConstructorAccess: number[] = [];
export class VpcVal extends VpcIntermedValBase {
    isVpcVal = true;
    static readonly epsilon = 0.000001;
    protected readonly v: string;
    constructor(v: string, token: number[]) {
        super();

        // discourage people outside this file from calling the constructor
        assertTrue(token === restrictConstructorAccess, "66|please don't use the VpcVal constructor directly");
        assertTrue(v !== null && v !== undefined, '65|tried to set string as null or undefined');
        checkThrow(v.length < CodeLimits.maxStringLength, '8w|exceeded max string length');
        this.v = v;
    }

    isItAStrictBooleanImpl(output: [boolean, any]) {
        // the product is strict. "if 0" or "if ''"" are runtime errors.
        // it does allow trailing whitespace though
        output[0] = false;
        output[1] = undefined;
        if (this.v.match(/^true\s*$/)) {
            output[0] = true;
            output[1] = true;
        } else if (this.v.match(/^false\s*$/)) {
            output[0] = true;
            output[1] = false;
        }
    }

    readAsStrictBoolean(tmpArr?: [boolean, any]): boolean {
        if (!tmpArr) {
            tmpArr = [false, undefined];
        }

        this.isItAStrictBooleanImpl(tmpArr);
        if (tmpArr[0]) {
            return tmpArr[1];
        } else {
            throw makeVpcScriptErr(`64|expected true or false here, got "${this.v}"`);
        }
    }

    isItInteger() {
        let ar: [boolean, any] = [false, undefined];
        this.isItAStrictIntegerImpl(ar);
        return ar[0];
    }

    isItNumeric() {
        let ar: [boolean, any] = [false, undefined];
        this.isItNumericImpl(ar);
        return ar[0];
    }

    // scientific notation is allowed only for numeric literals
    // 12e1 is a number -- true
    // "12e1" is a number -- false
    static readScientificNotation(s: string) {
        if (s.match(/^\s*-?[0-9]+(\.[0-9]*)?(e[-+]?[0-9]+)?\s*$/)) {
            let f = parseFloat(s);
            if (isFinite(f) && f < 1e18 && f > -1e18) {
                return VpcValN(f);
            }
        }

        return undefined;
    }

    // scientific notation is allowed only for numeric literals
    // 12e1 is a number -- true
    // "12e1" is a number -- false
    static getScientificNotation(s: string) {
        return throwIfUndefined(
            VpcVal.readScientificNotation(s),
            `63|expected a number/scientific notation here, or > 1e18, got "${s}"`
        );
    }

    isItNumericImpl(output: [boolean, any]) {
        // emulator accepts whitespace, even newlines, before/after the number
        // confirmed that emulator accepts "3." as same as "3.0"
        output[0] = false;
        output[1] = undefined;
        if (!!this.v && !!this.v.match(/^\s*-?[0-9]+(\.[0-9]*)?\s*$/)) {
            let ret = parseFloat(this.v);
            if (isFinite(ret) && ret < 1e18 && ret > -1e18) {
                output[0] = true;
                output[1] = ret;
            }
        }
    }

    readAsStrictNumeric(tmpArr?: [boolean, any]): number {
        if (!tmpArr) {
            tmpArr = [false, undefined];
        }

        this.isItNumericImpl(tmpArr);
        if (tmpArr[0]) {
            return tmpArr[1];
        } else {
            throw makeVpcScriptErr(`62|expected a number here, got "${this.v}"`);
        }
    }

    isItAStrictIntegerImpl(output: [boolean, any]) {
        this.isItNumericImpl(output);
        let rounded = Math.round(output[1]);
        if (output[0] && (output[1] > maxint32 || output[1] < minint32)) {
            // "numbers" can be greater than 2^31,
            // but they aren't treated as "integers".
            // we're being conservative because for large numbers the rounding check below will fail,
            // let's use a well-defined cutoff that will be less than Number.LARGEST_SAFE_INT
            output[0] = false;
            output[1] = undefined;
        } else if (output[0] && Math.abs(output[1] - rounded) < VpcVal.epsilon) {
            output[0] = true;
            output[1] = rounded;
        } else {
            output[0] = false;
            output[1] = undefined;
        }
    }

    readAsStrictInteger(tmpArr?: [boolean, any]): number {
        if (!tmpArr) {
            tmpArr = [false, undefined];
        }

        this.isItAStrictIntegerImpl(tmpArr);
        if (tmpArr[0]) {
            return tmpArr[1];
        } else {
            throw makeVpcScriptErr(`61|expected an integer here, got "${this.v}"`);
        }
    }

    readAsString() {
        if (this.v !== null && this.v !== undefined) {
            return this.v;
        } else {
            throw makeVpcScriptErr(`9g|value is null, got "${this.v}"`);
        }
    }

    isEmpty() {
        return this.v.length > 0;
    }

    static readonly Empty = new VpcVal('', restrictConstructorAccess);
    static readonly True = new VpcVal('true', restrictConstructorAccess);
    static readonly False = new VpcVal('false', restrictConstructorAccess);
    static readonly Zero = new VpcVal('0', restrictConstructorAccess);
    static readonly One = new VpcVal('1', restrictConstructorAccess);
}

export function VpcValS(s: string) {
    return new VpcVal(s, restrictConstructorAccess);
}

// toFixed returns a string representation that does not use exponential notation
export function VpcValN(f: number) {
    checkThrow(isFinite(f) && f < 1e18 && f > -1e18, '8v|not a number, or > 1e18');
    let s = f.toString();
    if (scontains(s, 'e')) {
        return new VpcVal(f.toFixed(20), restrictConstructorAccess);
    } else {
        return new VpcVal(s, restrictConstructorAccess);
    }
}

export function VpcValBool(b: boolean) {
    return b ? VpcVal.True : VpcVal.False;
}

export class IntermedMapOfIntermedVals extends VpcIntermedValBase {
    isIntermedMapOfIntermedVals = true;
    vals: { [key: string]: (VpcIntermedValBase | string)[] } = {};

    // same logic, but minor perf benefit if 2 methods
    addString(key: string, val: string) {
        if (!this.vals[key]) {
            this.vals[key] = [val];
        } else {
            this.vals[key].push(val);
        }
    }

    addResult(key: string, val: VpcIntermedValBase) {
        if (!this.vals[key]) {
            this.vals[key] = [val];
        } else {
            this.vals[key].push(val);
        }
    }
}
