
/* auto */ import { VpcVal, VpcValS } from './vpcVal';
/* auto */ import { checkThrow, makeVpcInternalErr } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, Util512 } from './../../ui512/utils/util512';

/**
 * a collection of variables
 */
export class VarCollection extends MapKeyToObjectCanSet<VpcVal> {
    protected length = 0;
    protected readonly limitReason: string;
    constructor(
        protected readonly limit: number,
        protected readonly nameOfCollection: string
    ) {
        super();
        this.limitReason = `exceeded max ${nameOfCollection} vars ${limit}`;
    }

    /**
     * assign a value to the variable
     */
    set(key: string, v: VpcVal) {
        if (this.objects[key] === undefined) {
            this.length += 1;
            checkThrow(this.length < this.limit, this.limitReason, '8u|');
        }

        super.set(key, v);
    }

    /**
     * add a new value to the collection
     */
    add(key: string, v: VpcVal) {
        if (this.objects[key] === undefined) {
            this.length += 1;
            checkThrow(this.length < this.limit, this.limitReason, '8t|');
        }

        super.add(key, v);
    }
}

/**
 * built-in VPC constants
 */
export class VariableCollectionConstants extends VarCollection {
    constructor() {
        super(256, 'constants');
        this.add('one', VpcValS('1'));
        this.add('two', VpcValS('2'));
        this.add('three', VpcValS('3'));
        this.add('four', VpcValS('4'));
        this.add('five', VpcValS('5'));
        this.add('six', VpcValS('6'));
        this.add('seven', VpcValS('7'));
        this.add('eight', VpcValS('8'));
        this.add('nine', VpcValS('9'));
        this.add('ten', VpcValS('10'));
        this.add('colon', VpcValS(':'));
        this.add('comma', VpcValS(','));
        this.add('empty', VpcValS(''));
        this.add('true', VpcValS('true'));
        this.add('false', VpcValS('false'));
        this.add('up', VpcValS('up'));
        this.add('down', VpcValS('down'));
        this.add('pi', VpcValS('3.14159265358979323846'));
        this.add('quote', VpcValS('"'));
        this.add('space', VpcValS(' '));
        this.add('tab', VpcValS('\t'));
        this.add('newline', VpcValS('\n'));
        this.add('return', VpcValS('\n'));
        this.add('cr', VpcValS('\n'));
        this.add('formfeed', VpcValS('\x0C'));
        this.add('linefeed', VpcValS('\n'));

        /* text style */
        this.add('plain', VpcValS('plain'));
        this.add('bold', VpcValS('bold'));
        this.add('italic', VpcValS('italic'));
        this.add('underline', VpcValS('underline'));
        this.add('outline', VpcValS('outline'));
        this.add('shadow', VpcValS('shadow'));
        this.add('condense', VpcValS('condense'));
        this.add('extend', VpcValS('extend'));

        /* button style */
        this.add('transparent', VpcValS('transparent'));
        this.add('rect', VpcValS('rect'));
        this.add('opaque', VpcValS('opaque'));
        this.add('roundrect', VpcValS('roundrect'));
        this.add('standard', VpcValS('standard'));
        this.add('default', VpcValS('default'));
        this.add('osboxmodal', VpcValS('osboxmodal'));
        this.add('checkbox', VpcValS('checkbox'));
        this.add('radio', VpcValS('radio'));
        this.add('rectangle', VpcValS('rectangle'));

        /* textalign */
        this.add('center', VpcValS('center'));
        this.add('left', VpcValS('left'));
        this.add('right', VpcValS('right'));
        this.add('up', VpcValS('up'));
        this.add('down', VpcValS('down'));

        /* field style */
        this.add('scrolling', VpcValS('scrolling'));

        Util512.freezeRecurse(this);
    }

    set(varName: string, val: VpcVal) {
        throw makeVpcInternalErr(
            "5~|we don't support creating a new constant " + varName
        );
    }
}
