
/* auto */ import { assertTrue, checkThrow, makeVpcScriptErr, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { isString } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512Settable } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { OrdinalOrPosition, VpcElType, getPositionFromOrdinalOrPosition } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcVal, VpcValBool, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';

export enum PrpTyp {
    __isUI512Enum = 1,
    str,
    num,
    bool,
}

export type PropGetter<T extends VpcElBase> = [PrpTyp, string | ((me: T) => string | number | boolean)];
export type PropSetter<T extends VpcElBase> = [PrpTyp, string | ((me: T, v: string | number | boolean) => void)];

export abstract class VpcElBase extends UI512Settable {
    isVpcElBase = true;
    readonly parentId: string;
    protected abstract _name: string;
    readonly tmpar: [boolean, any] = [false, undefined];
    abstract getType(): VpcElType;
    abstract getAttributesList(): string[];
    abstract startGettersSetters(): void;
    private realSet: Function;
    private realSetFtxt: Function;
    protected getters: { [key: string]: PropGetter<VpcElBase> };
    protected setters: { [key: string]: PropSetter<VpcElBase> };

    constructor(id: string, parentid: string) {
        super(id);
        this.parentId = parentid;
        this.startGettersSetters();
        this.realSet = this.set;
        this.realSetFtxt = this.setftxt;
    }

    makeDormant() {
        // cause errors if anyone tries to access the object
        this.getters = undefined as any;
        this.setters = undefined as any;
        this.set = undefined as any;
        this.setftxt = undefined as any;
    }

    static simpleGetSet(
        getters: { [key: string]: PropGetter<VpcElBase> },
        setters: { [key: string]: PropSetter<VpcElBase> },
        simple: [string, PrpTyp][]
    ) {
        for (let [propname, prptyp] of simple) {
            getters[propname] = [prptyp, propname];
            setters[propname] = [prptyp, propname];
        }
    }

    getProp(propname: string) {
        let found = this.getters[propname];
        if (found) {
            let typ = found[0];
            let mappedprop = found[1];
            if (typ === PrpTyp.str) {
                if (typeof mappedprop === 'function') {
                    return VpcValS(mappedprop(this) as string);
                } else {
                    assertTrue(isString(mappedprop), '4,|not a string');
                    return VpcValS(this.get_s(mappedprop));
                }
            } else if (typ === PrpTyp.num) {
                if (typeof mappedprop === 'function') {
                    return VpcValN(mappedprop(this) as number);
                } else {
                    assertTrue(isString(mappedprop), '4+|not a string');
                    return VpcValN(this.get_n(mappedprop));
                }
            } else if (typ === PrpTyp.bool) {
                if (typeof mappedprop === 'function') {
                    return VpcValBool(mappedprop(this) as boolean);
                } else {
                    assertTrue(isString(mappedprop), '4*|not a string');
                    return VpcValBool(this.get_b(mappedprop));
                }
            } else {
                throw makeVpcScriptErr(`4)|invalid PrpTyp ${typ} for el id ${this.id}`);
            }
        } else {
            throw makeVpcScriptErr(`4(|unknown property ${propname} for el id ${this.id}`);
        }
    }

    setProp(propname: string, val: VpcVal) {
        let found = this.setters[propname];
        if (found) {
            let typ = found[0];
            let mappedprop = found[1];
            if (typ === PrpTyp.str) {
                if (typeof mappedprop === 'function') {
                    mappedprop(this, val.readAsString());
                } else {
                    assertTrue(isString(mappedprop), '4&|prop name not a string');
                    this.set(mappedprop, val.readAsString());
                }
            } else if (typ === PrpTyp.num) {
                if (typeof mappedprop === 'function') {
                    mappedprop(this, val.readAsStrictInteger(this.tmpar));
                } else {
                    assertTrue(isString(mappedprop), '4%|prop name not a string');
                    this.set(mappedprop, val.readAsStrictInteger(this.tmpar));
                }
            } else if (typ === PrpTyp.bool) {
                if (typeof mappedprop === 'function') {
                    mappedprop(this, val.readAsStrictBoolean(this.tmpar));
                } else {
                    assertTrue(isString(mappedprop), '4$|prop name not a string');
                    this.set(mappedprop, val.readAsStrictBoolean(this.tmpar));
                }
            } else {
                throw makeVpcScriptErr(`4#|invalid PrpTyp ${typ} for el id ${this.id}`);
            }
        } else {
            throw makeVpcScriptErr(`4!|unknown property ${propname} for el id ${this.id}`);
        }
    }

    static findIndexById<T extends VpcElBase>(list: T[], id: string) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                return i;
            }
        }

        return undefined;
    }

    static getIndexById<T extends VpcElBase>(list: T[], id: string) {
        return throwIfUndefined(VpcElBase.findIndexById(list, id), '4 |id not found in this list', id);
    }

    static findByName<T extends VpcElBase>(list: VpcElBase[], name: string, type: VpcElType) {
        for (let item of list) {
            if (item._name === name) {
                if (item.getType() === type) {
                    return item as T;
                }
            }
        }

        return undefined;
    }

    static findByOrdinal<T extends VpcElBase>(list: VpcElBase[], currentIndex: number, pos: OrdinalOrPosition) {
        let index = getPositionFromOrdinalOrPosition(pos, currentIndex, 0, list.length - 1);
        return list[index] ? (list[index] as T) : undefined;
    }

    static isActuallyMsgRepl(vel: VpcElBase) {
        return vel.getType() === VpcElType.Btn && vel.get_s('name') === VpcElBase.nameForMsgRepl();
    }

    static nameForMsgRepl() {
        return '$$msgrepl$$';
    }
}

export abstract class VpcElSizable extends VpcElBase {
    isVpcElSizable = true;
    protected _x = 0;
    protected _y = 0;
    protected _w = 0;
    protected _h = 0;
    setDimensions(newx: number, newy: number, neww: number, newh: number, context = ChangeContext.Default) {
        checkThrow(neww >= 0, `7H|width must be >= 0 but got ${neww}`);
        checkThrow(newh >= 0, `7G|height must be >= 0 but got ${newh}`);
        this.set('x', newx, context);
        this.set('y', newy, context);
        this.set('w', neww, context);
        this.set('h', newh, context);
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    static szGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters['width'] = [PrpTyp.num, 'w'];
        getters['height'] = [PrpTyp.num, 'h'];
        getters['left'] = [PrpTyp.num, 'x'];
        getters['top'] = [PrpTyp.num, 'y'];
        getters['right'] = [PrpTyp.num, (me: VpcElSizable) => me._x + me._w];
        getters['bottom'] = [PrpTyp.num, (me: VpcElSizable) => me._y + me._h];
        getters['topleft'] = [PrpTyp.str, (me: VpcElSizable) => `${me._x},${me._y}`];
        getters['botright'] = [PrpTyp.str, (me: VpcElSizable) => `${me._x + me._w},${me._y + me._h}`];
        getters['rect'] = [PrpTyp.str, (me: VpcElSizable) => `${me._x},${me._y},${me._x + me._w},${me._y + me._h}`];
        getters['loc'] = [
            PrpTyp.str,
            (me: VpcElSizable) => `${me._x + Math.trunc(me._w / 2)},${me._y + Math.trunc(me._h / 2)}`,
        ];
        getters['bottomright'] = getters['botright'];
        getters['rectangle'] = getters['rect'];
        getters['location'] = getters['loc'];
    }

    static szSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters['width'] = [PrpTyp.num, (me: VpcElSizable, n: number) => me.setDimensions(me._x, me._y, n, me._h)];
        setters['height'] = [PrpTyp.num, (me: VpcElSizable, n: number) => me.setDimensions(me._x, me._y, me._w, n)];
        setters['left'] = [PrpTyp.num, (me: VpcElSizable, n: number) => me.setDimensions(n, me._y, me._w, me._h)];
        setters['top'] = [PrpTyp.num, (me: VpcElSizable, n: number) => me.setDimensions(me._x, n, me._w, me._h)];
        setters['right'] = [
            PrpTyp.num,
            (me: VpcElSizable, n: number) => me.setDimensions(n - me._w, me._y, me._w, me._h),
        ];
        setters['bottom'] = [
            PrpTyp.num,
            (me: VpcElSizable, n: number) => me.setDimensions(me._x, n - me._h, me._w, me._h),
        ];
        setters['topleft'] = [
            PrpTyp.str,
            (me: VpcElSizable, s: string) => me.setDimensions(getc(me, s, 0), getc(me, s, 1), me._w, me._h),
        ];
        setters['botright'] = [
            PrpTyp.str,
            (me: VpcElSizable, s: string) =>
                me.setDimensions(me._x, me._y, getc(me, s, 0) - me._x, getc(me, s, 1) - me._y),
        ];
        setters['rect'] = [
            PrpTyp.str,
            (me: VpcElSizable, s: string) =>
                me.setDimensions(
                    getc(me, s, 0),
                    getc(me, s, 1),
                    getc(me, s, 2) - getc(me, s, 0),
                    getc(me, s, 3) - getc(me, s, 1)
                ),
        ];
        setters['loc'] = [
            PrpTyp.str,
            (me: VpcElSizable, s: string) => {
                let wasLocX = me._x + Math.trunc(me._w / 2);
                let wasLocY = me._y + Math.trunc(me._h / 2);
                let moveX = getc(me, s, 0) - wasLocX;
                let moveY = getc(me, s, 1) - wasLocY;
                me.setDimensions(me._x + moveX, me._y + moveY, me._w, me._h);
            },
        ];
        setters['bottomright'] = setters['botright'];
        setters['rectangle'] = setters['rect'];
        setters['location'] = setters['loc'];
    }
}

function getc(me: VpcElBase, s: string, coord: number): number {
    // get a coordinate from a list of integers 1,1,1,1
    let pts = s.split(',');
    checkThrow(coord < pts.length, `7F|could not get coord ${coord + 1} of ${s}`);
    VpcValS(pts[coord]).isItAStrictIntegerImpl(me.tmpar);
    checkThrow(me.tmpar[0] && typeof me.tmpar[1] === 'number', `7E|coord ${coord + 1} of ${s} is not an integer`);
    return me.tmpar[1];
}
