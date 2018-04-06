
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp, VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';

export class VpcElCard extends VpcElBase {
    isVpcElCard = true;
    protected _script = '';
    protected _name = '';
    protected _paint = '';
    parts: (VpcElButton | VpcElField)[] = [];
    getAttributesList() {
        return ['script', 'name', 'paint'];
    }

    getType() {
        return VpcElType.Card;
    }

    startGettersSetters() {
        VpcElCard.cdInit();
        this.getters = VpcElCard.cachedGetters;
        this.setters = VpcElCard.cachedSetters;
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
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
