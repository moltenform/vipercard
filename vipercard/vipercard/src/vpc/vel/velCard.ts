
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp } from '../../vpc/vpcutils/vpcRequestedReference.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';

/**
 * a vipercard "card"
 */
export class VpcElCard extends VpcElBase {
    isVpcElCard = true;
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

    /* child vels */
    parts: (VpcElButton | VpcElField)[] = [];

    /**
     * get the properties that need to be serialized
     */
    getKeyPropertiesList() {
        return ['script', 'name', 'paint'];
    }

    /**
     * type of element
     */
    getType() {
        return VpcElType.Card;
    }

    /**
     * re-use cached getters and setter callback functions for better perf
     */
    startGettersSetters() {
        VpcElCard.cdInit();
        this.getters = VpcElCard.cachedGetters;
        this.setters = VpcElCard.cachedSetters;
    }

    /**
     * define getters and setters
     */
    static cdInit() {
        if (!VpcElCard.cachedGetters || !VpcElCard.cachedSetters) {
            VpcElCard.cachedGetters = {};
            VpcElCard.cachedGetters['script'] = [PrpTyp.Str, 'script'];
            VpcElCard.cachedSetters = {};
            VpcElCard.cachedSetters['name'] = [PrpTyp.Str, 'name'];
            Util512.freezeRecurse(VpcElCard.cachedGetters);
            Util512.freezeRecurse(VpcElCard.cachedSetters);
        }
    }
}
