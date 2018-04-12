
/* auto */ import { assertTrue, checkThrow, makeVpcScriptErr, scontains, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { CodeLimits } from '../../vpc/vpcutils/vpcUtils.js';

/* largest positive 32bit signed integer */
const maxint32 = 2147483647;

/* largest negative 32bit signed integer */
const minint32 = -2147483648;

/* we don't want code outside this module to directly create a VpcVal
you should use the VpcValN or VpcValS functions. */
let allowUsingVpcValConstructor = {}

/**
 * for the interpreter, when interpreting a script,
 * an "intermedval" is the result of part of an expression
 */
export class VpcIntermedValBase {
    isIntermedValBase = true;
}

/**
 * VpcVal, a ViperCard script value
 * immutable
 * like in the original product, can hold a string, a number, or a boolean
 */
export class VpcVal extends VpcIntermedValBase {
    isVpcVal = true;
    static readonly epsilon = 0.000001;
    protected readonly v: string;

    /**
     * construct a VpcVal.
     * the required "token" prevents code outside this module from calling the constructor
     */
    constructor(v: string, token: {}) {
        super();

        assertTrue(token === allowUsingVpcValConstructor, "66|please don't use the VpcVal constructor directly");
        assertTrue(v !== null && v !== undefined, '65|tried to set string as null or undefined');
        checkThrow(v.length < CodeLimits.MaxStringLength, '8w|exceeded max string length');
        this.v = v;
    }

    /**
     * like in the original product, booleans are strictly "true" or "false"
     * you can't say "if 0 then" or "if "" then"
     * interestingly, "true  " with trailing whitespace is allowed, though.
     */
    isItAStrictBooleanImpl(output: [boolean, any]) {
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

    /**
     * get value as boolean, or throw if not a boolean
     */
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

    /**
     * is value an integer
     */
    isItInteger() {
        let ar: [boolean, any] = [false, undefined];
        this.isItAStrictIntegerImpl(ar);
        return ar[0];
    }

    /**
     * is value a number (possibly floating point)
     */
    isItNumeric() {
        let ar: [boolean, any] = [false, undefined];
        this.isItNumericImpl(ar);
        return ar[0];
    }

    /**
     * parse scientific notation into a number
     * note that scientific notation is allowed only for numeric literals, when you're first setting it.
     * put 2.34e6 into x --valid, seen as number
     * put x * 2 into y --valid
     *
     * put "2.34e6" into x --seen as a string
     * put x * 2 into y --runtime error, can't multiply
     */
    static readScientificNotation(s: string) {
        if (s.match(/^\s*-?[0-9]+(\.[0-9]*)?(e[-+]?[0-9]+)?\s*$/)) {
            let f = parseFloat(s);
            if (isFinite(f) && f < 1e18 && f > -1e18) {
                return VpcValN(f);
            }
        }

        return undefined;
    }

    /**
     * read as scientific notation, or throw exception
     */
    static getScientificNotation(s: string) {
        return throwIfUndefined(
            VpcVal.readScientificNotation(s),
            `63|expected a number/scientific notation here, or > 1e18, got "${s}"`
        );
    }

    /**
     * is it numeric - can we treat this string as a number?
     * original product accepts whitespace, even newlines, before/after the number
     * confirmed that original product accepts "3." as same as "3.0"
     */
    isItNumericImpl(output: [boolean, any]) {
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

    /**
     * reads as a number.
     * you can provide the temporary array so that it doesn't have to be allocd
     */
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

    /**
     * is the value in the string an integer?
     *
     * note: if the value is greater than max 32bit signed integer,
     * we'll treat it as a valid "number" but not as a valid "integer"
     * i.e. if x is 2^40 you can multiply x by 2 but can't get the xth line of a string.
     * we're being a bit cautious, the true dangerous cutoff is Number.LARGEST_SAFE_INT.
     */
    isItAStrictIntegerImpl(output: [boolean, any]) {
        this.isItNumericImpl(output);
        let rounded = Math.round(output[1]);
        if (output[0] && (output[1] > maxint32 || output[1] < minint32)) {
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

    /**
     * read as an integer, or throw exception
     */
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

    /**
     * read as a string
     */
    readAsString() {
        if (this.v !== null && this.v !== undefined) {
            return this.v;
        } else {
            throw makeVpcScriptErr(`9g|value is null, got "${this.v}"`);
        }
    }

    /**
     * is emppty
     */
    isEmpty() {
        return this.v.length > 0;
    }

    static readonly Empty = new VpcVal('', allowUsingVpcValConstructor);
    static readonly True = new VpcVal('true', allowUsingVpcValConstructor);
    static readonly False = new VpcVal('false', allowUsingVpcValConstructor);
    static readonly Zero = new VpcVal('0', allowUsingVpcValConstructor);
    static readonly One = new VpcVal('1', allowUsingVpcValConstructor);
}

/**
 * factory for VpcVal, create from a string
 */
export function VpcValS(s: string) {
    return new VpcVal(s, allowUsingVpcValConstructor);
}

/**
 * factory for VpcVal, create from a number
 */
export function VpcValN(f: number) {
    checkThrow(isFinite(f) && f < 1e18 && f > -1e18, '8v|not a number, or > 1e18');
    let s = f.toString();
    if (scontains(s, 'e')) {
        /* toFixed returns a string representation that does not use exponential notation */
        return new VpcVal(f.toFixed(20), allowUsingVpcValConstructor);
    } else {
        return new VpcVal(s, allowUsingVpcValConstructor);
    }
}

/**
 * factory for VpcVal, create from a bool
 */
export function VpcValBool(b: boolean) {
    return b ? VpcVal.True : VpcVal.False;
}

/**
 * map of keys to intermediate values
 */
export class IntermedMapOfIntermedVals extends VpcIntermedValBase {
    isIntermedMapOfIntermedVals = true;
    vals: { [key: string]: (VpcIntermedValBase | string)[] } = {};

    /**
     * add a string to the map
     */
    addString(key: string, val: string) {
        if (!this.vals[key]) {
            this.vals[key] = [val];
        } else {
            this.vals[key].push(val);
        }
    }

    /**
     * add a value to the map
     * same logic as addString, but some JavaScript performance articles
     * say it is faster to not use the same functions with different data types
     */
    addResult(key: string, val: VpcIntermedValBase) {
        if (!this.vals[key]) {
            this.vals[key] = [val];
        } else {
            this.vals[key].push(val);
        }
    }
}
