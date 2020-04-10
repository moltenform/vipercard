
/* auto */ import { PropGetter, PropSetter, PrpTyp } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcElType } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElButton } from './velButton';
/* auto */ import { VpcElBase } from './velBase';
/* auto */ import { Util512 } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * a vipercard "card"
 */
export class VpcElCard extends VpcElBase {
    protected _script = '';
    protected _name = '';
    protected _paint = '';
    protected _marked = false;
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
            VpcElCard.cachedGetters['marked'] = [PrpTyp.Bool, 'marked'];
            VpcElCard.cachedSetters = {};
            VpcElCard.cachedSetters['name'] = [PrpTyp.Str, 'name'];
            VpcElCard.cachedSetters['marked'] = [PrpTyp.Bool, 'marked'];
            Util512.freezeRecurse(VpcElCard.cachedGetters);
            Util512.freezeRecurse(VpcElCard.cachedSetters);
        }
    }
}
