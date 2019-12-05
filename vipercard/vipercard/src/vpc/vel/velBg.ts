
/* auto */ import { Util512 } from '../../ui512/utils/utils512.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp } from '../../vpc/vpcutils/vpcRequestedReference.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';

/**
 * a vipercard "background"
 * a stack contains backgrounds, which contain cards
 */
export class VpcElBg extends VpcElBase {
    isVpcElBg = true;
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
