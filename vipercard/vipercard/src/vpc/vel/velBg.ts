
/* auto */ import { PropGetter, PropSetter, PrpTyp } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcElType } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { VpcElButton } from './velButton';
/* auto */ import { VpcElBase } from './velBase';
/* auto */ import { Util512 } from './../../ui512/utils/util512';

/**
 * a vipercard "background"
 * a stack contains backgrounds, which contain cards
 */
export class VpcElBg extends VpcElBase {
    protected _script = '';
    protected _name = '';
    protected _paint = '';
    constructor(id: string, parentId: string) {
        super(id, parentId);
    }

    /* cached getters */
    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };

    /* cached setters */
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };

    /* child cards */
    cards: VpcElCard[] = [];

    /* a bg can hold its own buttons and fields, refered to as "bg fld x" instead of "cd fld x" */
    parts: (VpcElButton | VpcElField)[] = [];

    /**
     * type of element
     */
    getType() {
        return VpcElType.Bg;
    }

    /**
     * re-use cached getters and setter callback functions for better perf
     */
    startGettersSetters() {
        VpcElBg.bgInit();
        this.getters = VpcElBg.cachedGetters;
        this.setters = VpcElBg.cachedSetters;
    }

    /**
     * define getters and setters
     */
    static bgInit() {
        if (!VpcElBg.cachedGetters || !VpcElBg.cachedSetters) {
            VpcElBg.cachedGetters = {};
            VpcElBg.cachedGetters['script'] = [PrpTyp.Str, 'script'];
            VpcElBg.cachedSetters = {};
            VpcElBg.cachedSetters['name'] = [PrpTyp.Str, 'name'];
            Util512.freezeRecurse(VpcElBg.cachedGetters);
            Util512.freezeRecurse(VpcElBg.cachedSetters);
        }
    }
}
