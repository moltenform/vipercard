
/* auto */ import { assertTrue, checkThrow, makeVpcScriptErr, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { checkThrowEq, isString, slength } from '../../ui512/utils/utils512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { ElementObserverVal, UI512Settable } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { OrdinalOrPosition, VpcElType, getPositionFromOrdinalOrPosition } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcVal, VpcValBool, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp } from '../../vpc/vpcutils/vpcRequestedReference.js';

/**
 * base class for a vel (vpc element)
 *
 * this is just a model, _modelrender_ will create a corresponding ui512 element.
 * why do have new objects for vpc and not use ui512 elements directly?
 *      vipercard elements have properties like 'script' that don't apply to ui512
 *      vipercard elements like a scrolling text field comprise several ui512 elements
 *      a script should be able to set properties of vipercard elements without seeing the change in ui
 *      (screen locked) which would be complex to do otherwise (you'd have to clone the state somewhere)
 *      allows ui512 behavior to change independently from vpc, which might otherwise break saved vpc stacks
 */
export abstract class VpcElBase extends UI512Settable {
    isVpcElBase = true;
    readonly parentId: string;
    protected abstract _name: string;
    abstract getType(): VpcElType;
    abstract getKeyPropertiesList(): string[];
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
     * by storing the parentId, this is a good weakreference that
     * allows access to the parent without keeping a reference cycle.
     */
    constructor(id: string, parentId: string) {
        super(id);
        this.parentId = parentId;
        this.startGettersSetters();
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
    getProp(propName: string, cardId: string): VpcVal {
        let found = this.getters[propName];
        if (found) {
            let type = found[0];
            let mappedProp = found[1];
            if (type === PrpTyp.Str) {
                if (typeof mappedProp === 'function') {
                    return VpcValS(mappedProp(this, cardId) as string);
                } else {
                    assertTrue(isString(mappedProp), '4,|not a string');
                    return VpcValS(this.getS(mappedProp));
                }
            } else if (type === PrpTyp.Num) {
                if (typeof mappedProp === 'function') {
                    return VpcValN(mappedProp(this, cardId) as number);
                } else {
                    assertTrue(isString(mappedProp), '4+|not a string');
                    return VpcValN(this.getN(mappedProp));
                }
            } else if (type === PrpTyp.Bool) {
                if (typeof mappedProp === 'function') {
                    return VpcValBool(mappedProp(this, cardId) as boolean);
                } else {
                    assertTrue(isString(mappedProp), '4*|not a string');
                    return VpcValBool(this.getB(mappedProp));
                }
            } else {
                throw makeVpcScriptErr(`4)|invalid PrpTyp ${type} for el id ${this.id}`);
            }
        } else {
            throw makeVpcScriptErr(`4(|unknown property ${propName} for el id ${this.id}`);
        }
    }

    /**
     * high-level property set, from a vpc script
     */
    setProp(propName: string, val: VpcVal, cardId: string): void {
        let found = this.setters[propName];
        if (found) {
            let type = found[0];
            let mappedProp = found[1];
            if (type === PrpTyp.Str) {
                if (typeof mappedProp === 'function') {
                    mappedProp(this, val.readAsString(), cardId);
                } else {
                    assertTrue(isString(mappedProp), '4&|prop name not a string');
                    this.set(mappedProp, val.readAsString());
                }
            } else if (type === PrpTyp.Num) {
                if (typeof mappedProp === 'function') {
                    mappedProp(this, val.readAsStrictInteger(this.tmpArray), cardId);
                } else {
                    assertTrue(isString(mappedProp), '4%|prop name not a string');
                    this.set(mappedProp, val.readAsStrictInteger(this.tmpArray));
                }
            } else if (type === PrpTyp.Bool) {
                if (typeof mappedProp === 'function') {
                    mappedProp(this, val.readAsStrictBoolean(this.tmpArray), cardId);
                } else {
                    assertTrue(isString(mappedProp), '4$|prop name not a string');
                    this.set(mappedProp, val.readAsStrictBoolean(this.tmpArray));
                }
            } else {
                throw makeVpcScriptErr(`4#|invalid PrpTyp ${type} for el id ${this.id}`);
            }
        } else {
            throw makeVpcScriptErr(`4!|unknown property ${propName} for el id ${this.id}`);
        }
    }

    /* e.g. a background field has different content on every card */
    isCardSpecificContent(key:string) {
        return false
    }

    /**
     * when a vel is no longer valid, null out the fields
     * so that code mistakenly referring to it will
     * cause an exception
     */
    destroy() {
        this.getters = undefined as any; /* destroy() */
        this.setters = undefined as any; /* destroy() */
        this.set = undefined as any; /* destroy() */
        this.setCardFmTxt = undefined as any; /* destroy() */
    }

    /**
     * look for the index (z-order) of a child element
     * return undefined if not found
     */
    static findIndexById<T extends VpcElBase>(list: T[], id: string) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                return i;
            }
        }

        return undefined;
    }

    /**
     * look for the index (z-order) of a child element
     * throw if not found
     */
    static getIndexById<T extends VpcElBase>(list: T[], id: string) {
        return throwIfUndefined(VpcElBase.findIndexById(list, id), '4 |id not found in this list', id);
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

    /**
     * look for a child element by ordinal ("first", "next")
     */
    static findByOrdinal<T extends VpcElBase>(list: VpcElBase[], currentIndex: number, pos: OrdinalOrPosition) {
        let index = getPositionFromOrdinalOrPosition(pos, currentIndex, 0, list.length - 1);
        return list[index] ? (list[index] as T) : undefined;
    }

    setPossiblyCardSpecific(key:string, newv:ElementObserverVal, defaultVal:ElementObserverVal, cardId:string) {
        if (this.isCardSpecificContent(key)) {
            checkThrow(slength(cardId) > 0, 'invalid card id')
            let curVal = this.get(key)
            checkThrowEq(typeof curVal, typeof newv, '')
            let specificKey = key + '_oncard_' + cardId;
            this.setSkipTypeCheck(specificKey, newv, defaultVal)
        } else {
            this.set(key, newv)
        }
    }

    getPossiblyCardSpecific(key:string, defaultVal:ElementObserverVal, cardId:string):ElementObserverVal {
        if (this.isCardSpecificContent(key)) {
            let specificKey = key + '_oncard_' + cardId;
            return this.getSkipTypeCheck(specificKey, defaultVal)
        } else {
            return this.get(key)
        }
    }

    getCardFmTxt(cardId:string): FormattedText {
        let got = this.getPossiblyCardSpecific('ftxt', new FormattedText(), cardId)
        let gotAsTxt = got as FormattedText;
        checkThrow(gotAsTxt && gotAsTxt.isFormattedText, 'not FormattedText')
        return gotAsTxt
    }

    setCardFmTxt(cardId:string, newTxt: FormattedText, context = ChangeContext.Default) {
        newTxt.lock()
        this.setPossiblyCardSpecific('ftxt', newTxt, new FormattedText(), cardId)
    }
}

/**
 * base class for elements that can be resized.
 */
export abstract class VpcElSizable extends VpcElBase {
    isVpcElSizable = true;
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
    setDimensions(newX: number, newY: number, newW: number, newH: number, context = ChangeContext.Default) {
        checkThrow(newW >= 0, `7H|width must be >= 0 but got ${newW}`);
        checkThrow(newH >= 0, `7G|height must be >= 0 but got ${newH}`);
        this.set('x', newX, context);
        this.set('y', newY, context);
        this.set('w', newW, context);
        this.set('h', newH, context);
    }

    /**
     * define size getters
     */
    static initSizeGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters['width'] = [PrpTyp.Num, 'w'];
        getters['height'] = [PrpTyp.Num, 'h'];
        getters['left'] = [PrpTyp.Num, 'x'];
        getters['top'] = [PrpTyp.Num, 'y'];
        getters['right'] = [PrpTyp.Num, (me: VpcElSizable) => me._x + me._w];
        getters['bottom'] = [PrpTyp.Num, (me: VpcElSizable) => me._y + me._h];
        getters['topleft'] = [PrpTyp.Str, (me: VpcElSizable) => `${me._x},${me._y}`];
        getters['botright'] = [PrpTyp.Str, (me: VpcElSizable) => `${me._x + me._w},${me._y + me._h}`];
        getters['rect'] = [PrpTyp.Str, (me: VpcElSizable) => `${me._x},${me._y},${me._x + me._w},${me._y + me._h}`];
        getters['loc'] = [
            PrpTyp.Str,
            (me: VpcElSizable) => `${me._x + Math.trunc(me._w / 2)},${me._y + Math.trunc(me._h / 2)}`
        ];
        getters['bottomright'] = getters['botright'];
        getters['rectangle'] = getters['rect'];
        getters['location'] = getters['loc'];
    }

    /**
     * define size setters
     */
    static initSizeSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters['width'] = [PrpTyp.Num, (me: VpcElSizable, n: number) => me.setDimensions(me._x, me._y, n, me._h)];
        setters['height'] = [PrpTyp.Num, (me: VpcElSizable, n: number) => me.setDimensions(me._x, me._y, me._w, n)];
        setters['left'] = [PrpTyp.Num, (me: VpcElSizable, n: number) => me.setDimensions(n, me._y, me._w, me._h)];
        setters['top'] = [PrpTyp.Num, (me: VpcElSizable, n: number) => me.setDimensions(me._x, n, me._w, me._h)];
        setters['right'] = [
            PrpTyp.Num,
            (me: VpcElSizable, n: number) => me.setDimensions(n - me._w, me._y, me._w, me._h)
        ];
        setters['bottom'] = [
            PrpTyp.Num,
            (me: VpcElSizable, n: number) => me.setDimensions(me._x, n - me._h, me._w, me._h)
        ];
        setters['topleft'] = [
            PrpTyp.Str,
            (me: VpcElSizable, s: string) => me.setDimensions(coord(me, s, 0), coord(me, s, 1), me._w, me._h)
        ];
        setters['botright'] = [
            PrpTyp.Str,
            (me: VpcElSizable, s: string) =>
                me.setDimensions(me._x, me._y, coord(me, s, 0) - me._x, coord(me, s, 1) - me._y)
        ];
        setters['rect'] = [
            PrpTyp.Str,
            (me: VpcElSizable, s: string) =>
                me.setDimensions(
                    coord(me, s, 0),
                    coord(me, s, 1),
                    coord(me, s, 2) - coord(me, s, 0),
                    coord(me, s, 3) - coord(me, s, 1)
                )
        ];
        setters['loc'] = [
            PrpTyp.Str,
            (me: VpcElSizable, s: string) => {
                let wasLocX = me._x + Math.trunc(me._w / 2);
                let wasLocY = me._y + Math.trunc(me._h / 2);
                let moveX = coord(me, s, 0) - wasLocX;
                let moveY = coord(me, s, 1) - wasLocY;
                me.setDimensions(me._x + moveX, me._y + moveY, me._w, me._h);
            }
        ];
        setters['bottomright'] = setters['botright'];
        setters['rectangle'] = setters['rect'];
        setters['location'] = setters['loc'];
    }
}

/**
 * get a coordinate from a list of integers 1,2,3,4
 * splits the list and gets the nth coordinate
 */
function coord(me: VpcElBase, s: string, whichCoord: number): number {
    let pts = s.split(',');
    checkThrow(whichCoord < pts.length, `7F|could not get coord ${whichCoord + 1} of ${s}`);
    VpcValS(pts[whichCoord]).isItAStrictIntegerImpl(me.tmpArray);
    checkThrow(
        me.tmpArray[0] && typeof me.tmpArray[1] === 'number',
        `7E|coord ${whichCoord + 1} of ${s} is not an integer`
    );
    return me.tmpArray[1];
}
