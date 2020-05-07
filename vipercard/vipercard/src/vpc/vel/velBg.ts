
/* auto */ import { VpcElType } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { PropGetter, PropSetter, PrpTyp, VpcElBase } from './velBase';
/* auto */ import { Util512 } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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

    /* get template card, for bg vel replication */
    getTemplateCard() {
        return this.cards[0]
    }

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
            VpcElBg.cachedSetters['script'] = [PrpTyp.Str, 'script'];
            Util512.freezeRecurse(VpcElBg.cachedGetters);
            Util512.freezeRecurse(VpcElBg.cachedSetters);
        }
    }
}
