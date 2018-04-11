
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp, VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';

export class VpcElBg extends VpcElBase {
    isVpcElBg = true;
    protected _script = '';
    protected _name = '';
    protected _paint = '';
    cards: VpcElCard[] = [];
    parts: (VpcElButton | VpcElField)[] = [];

    getAttributesList() {
        return ['script', 'name', 'paint'];
    }
    getType() {
        return VpcElType.Bg;
    }

    startGettersSetters() {
        VpcElBg.bgInit();
        this.getters = VpcElBg.cachedGetters;
        this.setters = VpcElBg.cachedSetters;
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
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
