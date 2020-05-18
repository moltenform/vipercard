
/* auto */ import { VpcVal, VpcValBool, VpcValN, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { VpcElType, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { SetToInvalidObjectAtEndOfExecution } from './../../ui512/utils/util512Higher';
/* auto */ import { coalesceIfFalseLike } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { cast } from './../../ui512/utils/util512';
/* auto */ import { ChangeContext } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { ElementObserverVal, UI512Gettable, UI512Settable } from './../../ui512/elements/ui512ElementGettable';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * base class for a vel (vpc element)
 *
 * this is just a model, _modelrender_ will create a corresponding ui512 element.
 * why have separate "vpc" objects and not use ui512 elements directly?
 *      vipercard elements have properties like 'script' that don't apply to ui512
 *      vipercard elements like a scrolling text field comprise several ui512 elements
 *      for features like 'lock screen' a script should be able to set properties of
 *      vipercard elements without seeing the change in ui which would be complex to do
 *      otherwise (you'd have to clone the state somewhere). also allows ui512 to change
 *      apart from vpc; vpc is persisted to disk, so harder to change w/o breaking compat
 */
export abstract class VpcElBase extends UI512Settable {
    readonly parentIdInternal: string;
    protected abstract _name: string;
    abstract getType(): VpcElType;
    abstract startGettersSetters(): void;
    readonly tmpArray: [boolean, any] = [false, undefined];

    /* a vel prop-getter can be either a
     string (1-1 map from vel property to ui512el property) or a
     function (dynamic code to retrieve the property) */
    protected getters: { [key: string]: PropGetter<VpcElBase> };

    /* a vel prop-setter can be either a
     string (1-1 map from vel property to ui512el property) or a
     function (dynamic code to set the property) */
    protected setters: { [key: string]: PropSetter<VpcElBase> };

    /**
     * construct an element,
     * and set its .getters and .setters
     * we store the parentId, this is an ok weakreference that
     * allows access to the parent without keeping a reference cycle.
     */
    constructor(id: string, parentId: string) {
        super(id);
        this.parentIdInternal = parentId;
        this.startGettersSetters();
    }

    /**
     * make this inaccessible from outside - you must use setOnVel instead
     */
    private setImplInternalExposedOnlyInVelBase(s: string, newVal: ElementObserverVal, context = ChangeContext.Default) {
        /* here and productopts are the only places we're allowed to do this */
        super.setImplInternal(undefined as any, s, newVal, undefined, context);
    }

    /**
     * can link to all siblings for a bg vel!
     */
    setOnVel(s: string, newVal: ElementObserverVal, higher: VpcHandleLinkedVels, context = ChangeContext.Default) {
        higher.setOnVelLinked(this, s, newVal, this.setImplInternalExposedOnlyInVelBase);
    }

    /**
     * for bg elements, the one shown to user is NOT the same as our internal one
     */
    getUserFacingId() {
        if (this.ui512GettableHas('is_bg_velement_id')) {
            return coalesceIfFalseLike(this.getS('is_bg_velement_id'), this.idInternal);
        } else {
            return this.idInternal;
        }
    }

    /**
     * subclasses can use this to quickly define
     * simple properties that map directly to ui512
     */
    protected static simpleGetSet(
        getters: { [key: string]: PropGetter<VpcElBase> },
        setters: { [key: string]: PropSetter<VpcElBase> },
        simple: [string, PrpTyp][]
    ) {
        for (let [propName, prpTyp] of simple) {
            getters[propName] = [prpTyp, propName];
            setters[propName] = [prpTyp, propName];
        }
    }

    /**
     * high-level property get, from a vpc script
     */
    getProp(propName: string): VpcVal {
        let found = this.getters[propName];
        if (found) {
            let type = found[0];
            let mappedProp = found[1];
            if (type === PrpTyp.Str) {
                if (typeof mappedProp === 'function') {
                    return VpcValS(mappedProp(this) as string);
                } else {
                    assertTrue(typeof mappedProp === 'string', '4,|not a string');
                    return VpcValS(this.getS(mappedProp));
                }
            } else if (type === PrpTyp.Num) {
                if (typeof mappedProp === 'function') {
                    return VpcValN(mappedProp(this) as number);
                } else {
                    assertTrue(typeof mappedProp === 'string', '4+|not a string');
                    return VpcValN(this.getN(mappedProp));
                }
            } else if (type === PrpTyp.Bool) {
                if (typeof mappedProp === 'function') {
                    return VpcValBool(mappedProp(this) as boolean);
                } else {
                    assertTrue(typeof mappedProp === 'string', '4*|not a string');
                    return VpcValBool(this.getB(mappedProp));
                }
            } else {
                checkThrow(false, `4)|invalid PrpTyp ${type} for el id ${this.getUserFacingId()}`);
            }
        } else {
            checkThrow(false, `4(|unknown property ${propName} for el id ${this.getUserFacingId()}`);
        }
    }

    /**
     * high-level property set, from a vpc script
     */
    setProp(propName: string, val: VpcVal, higher: VpcHandleLinkedVels): void {
        let found = this.setters[propName];
        if (found) {
            let type = found[0];
            let mappedProp = found[1];
            if (type === PrpTyp.Str) {
                if (typeof mappedProp === 'function') {
                    mappedProp(this, val.readAsString(), higher);
                } else {
                    assertTrue(typeof mappedProp === 'string', '4&|prop name not a string');
                    FormattedText.throwIfContainsControlCharacters(val.readAsString())
                    this.setOnVel(mappedProp, val.readAsString(), higher);
                }
            } else if (type === PrpTyp.Num) {
                if (typeof mappedProp === 'function') {
                    mappedProp(this, val.readAsStrictInteger(this.tmpArray), higher);
                } else {
                    assertTrue(typeof mappedProp === 'string', '4%|prop name not a string');
                    this.setOnVel(mappedProp, val.readAsStrictInteger(this.tmpArray), higher);
                }
            } else if (type === PrpTyp.Bool) {
                if (typeof mappedProp === 'function') {
                    mappedProp(this, val.readAsStrictBoolean(this.tmpArray), higher);
                } else {
                    assertTrue(typeof mappedProp === 'string', '4$|prop name not a string');
                    this.setOnVel(mappedProp, val.readAsStrictBoolean(this.tmpArray), higher);
                }
            } else {
                checkThrow(false, `4#|invalid PrpTyp ${type} for el id ${this.getUserFacingId()}`);
            }
        } else {
            checkThrow(false, `4!|unknown property ${propName} for el id ${this.getUserFacingId()}`);
        }
    }

    /* e.g. a background field has different content on every card */
    isCardSpecificContent(key: string) {
        return false;
    }

    /**
     * when a vel is no longer valid, null out the fields
     * so that code mistakenly referring to it will
     * cause an exception
     */
    destroy() {
        this.getters = SetToInvalidObjectAtEndOfExecution(this.getters);
        this.setters = SetToInvalidObjectAtEndOfExecution(this.setters);
        this.setOnVel = SetToInvalidObjectAtEndOfExecution(this.setOnVel);
        this.setCardFmTxt = SetToInvalidObjectAtEndOfExecution(this.setCardFmTxt);
    }

    /**
     * find a child element by name
     */
    static findByName<T extends VpcElBase>(list: VpcElBase[], name: string, type: VpcElType) {
        for (let i = 0, len = list.length; i < len; i++) {
            let item = list[i];
            if (item._name === name) {
                if (item.getType() === type) {
                    return item as T;
                }
            }
        }

        return undefined;
    }

    getCardFmTxt(): FormattedText {
        if (this.getB('sharedtext')) {
            return cast(FormattedText, this.getGeneric('ftxt'));
        } else {
            return cast(FormattedText, this.getGeneric('ftxt_uniquetocard'));
        }
    }

    setCardFmTxt(newTxt: FormattedText, h: VpcHandleLinkedVels, context = ChangeContext.Default) {
        newTxt.lock();
        if (this.getB('sharedtext')) {
            this.setOnVel('ftxt', newTxt, h);
        } else {
            this.setOnVel('ftxt_uniquetocard', newTxt, h);
        }
    }
}

/**
 * base class for elements that can be resized.
 */
export abstract class VpcElSizable extends VpcElBase {
    protected _x = 0;
    protected _y = 0;
    protected _w = 0;
    protected _h = 0;

    constructor(id: string, parentId: string) {
        super(id, parentId);
    }

    /**
     * a quick way to set dimensions of an object
     */
    setDimensions(
        newX: number,
        newY: number,
        newW: number,
        newH: number,
        h: VpcHandleLinkedVels,
        context = ChangeContext.Default
    ) {
        checkThrow(newW >= 0, `7H|width must be >= 0 but got ${newW}`);
        checkThrow(newH >= 0, `7G|height must be >= 0 but got ${newH}`);
        this.setOnVel('x', newX, h, context);
        this.setOnVel('y', newY, h, context);
        this.setOnVel('w', newW, h, context);
        this.setOnVel('h', newH, h, context);
    }

    /**
     * define size getters
     */
    static initSizeGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters['script'] = [PrpTyp.Str, 'script'];
        getters['width'] = [PrpTyp.Num, 'w'];
        getters['height'] = [PrpTyp.Num, 'h'];
        getters['left'] = [PrpTyp.Num, 'x'];
        getters['top'] = [PrpTyp.Num, 'y'];
        getters['right'] = [PrpTyp.Num, (me: VpcElSizable) => me._x + me._w];
        getters['bottom'] = [PrpTyp.Num, (me: VpcElSizable) => me._y + me._h];
        getters['topleft'] = [PrpTyp.Str, (me: VpcElSizable) => `${me._x},${me._y}`];
        getters['bottomright'] = [PrpTyp.Str, (me: VpcElSizable) => `${me._x + me._w},${me._y + me._h}`];
        getters['rectangle'] = [PrpTyp.Str, (me: VpcElSizable) => `${me._x},${me._y},${me._x + me._w},${me._y + me._h}`];
        getters['location'] = [
            PrpTyp.Str,
            (me: VpcElSizable) => `${me._x + Math.trunc(me._w / 2)},${me._y + Math.trunc(me._h / 2)}`
        ];
    }

    /**
     * define size setters
     */
    static initSizeSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters['script'] = [PrpTyp.Str, 'script'];
        setters['width'] = [
            PrpTyp.Num,
            (me: VpcElSizable, n: number, h: VpcHandleLinkedVels) => me.setDimensions(me._x, me._y, n, me._h, h)
        ];
        setters['height'] = [
            PrpTyp.Num,
            (me: VpcElSizable, n: number, h: VpcHandleLinkedVels) => me.setDimensions(me._x, me._y, me._w, n, h)
        ];
        setters['left'] = [
            PrpTyp.Num,
            (me: VpcElSizable, n: number, h: VpcHandleLinkedVels) => me.setDimensions(n, me._y, me._w, me._h, h)
        ];
        setters['top'] = [
            PrpTyp.Num,
            (me: VpcElSizable, n: number, h: VpcHandleLinkedVels) => me.setDimensions(me._x, n, me._w, me._h, h)
        ];
        setters['right'] = [
            PrpTyp.Num,
            (me: VpcElSizable, n: number, h: VpcHandleLinkedVels) => me.setDimensions(n - me._w, me._y, me._w, me._h, h)
        ];
        setters['bottom'] = [
            PrpTyp.Num,
            (me: VpcElSizable, n: number, h: VpcHandleLinkedVels) => me.setDimensions(me._x, n - me._h, me._w, me._h, h)
        ];
        setters['topleft'] = [
            PrpTyp.Str,
            (me: VpcElSizable, s: string, h: VpcHandleLinkedVels) => {
                let coords = VpcValS(s).readAsIntegerList(2);
                me.setDimensions(coords[0], coords[1], me._w, me._h, h);
            }
        ];
        setters['bottomright'] = [
            PrpTyp.Str,
            (me: VpcElSizable, s: string, h: VpcHandleLinkedVels) => {
                let coords = VpcValS(s).readAsIntegerList(2);
                me.setDimensions(me._x, me._y, coords[0] - me._x, coords[1] - me._y, h);
            }
        ];
        setters['rectangle'] = [
            PrpTyp.Str,
            (me: VpcElSizable, s: string, h: VpcHandleLinkedVels) => {
                let coords = VpcValS(s).readAsIntegerList(4);
                me.setDimensions(coords[0], coords[1], coords[2] - coords[0], coords[3] - coords[1], h);
            }
        ];
        setters['location'] = [
            PrpTyp.Str,
            (me: VpcElSizable, s: string, h: VpcHandleLinkedVels) => {
                let coords = VpcValS(s).readAsIntegerList(2);
                let wasLocX = me._x + Math.trunc(me._w / 2);
                let wasLocY = me._y + Math.trunc(me._h / 2);
                let moveX = coords[0] - wasLocX;
                let moveY = coords[1] - wasLocY;
                me.setDimensions(me._x + moveX, me._y + moveY, me._w, me._h, h);
            }
        ];
    }
}

/**
 * will currently be a ModelTop
 */
export interface VpcHandleLinkedVels {
    setOnVelLinked(
        me: VpcElBase,
        s: string,
        newVal: ElementObserverVal,
        cb: (s: string, newVal: ElementObserverVal, ctx: ChangeContext) => void
    ): void;
}

/**
 * type of property.
 * string, numeric (integer), or boolean
 */
export enum PrpTyp {
    __isUI512Enum = 1,
    Str,
    Num,
    Bool
}

/**
 * a vel prop-getter can be either a
 * string (1-1 map from vel property to ui512el property)
 * or a
 * function (dynamic code to retrieve the property)
 */
export type PropGetter<T extends UI512Gettable> = [PrpTyp, string | ((me: T) => string | number | boolean)];

/**
 * a vel prop-setter can be either a
 * string (1-1 map from vel property to ui512el property)
 * or a
 * function (dynamic code to set the property)
 */
export type PropSetter<T extends UI512Settable> = [
    PrpTyp,
    string | ((me: T, v: string | number | boolean, higher: VpcHandleLinkedVels) => void)
];
