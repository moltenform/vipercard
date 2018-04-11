
/* auto */ import { assertTrue, makeVpcInternalErr, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEq, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { OrdinalOrPosition, VpcElType, getPositionFromOrdinalOrPosition } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { CountNumericIdNormal } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp, VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';

export class VpcElStack extends VpcElBase {
    isVpcElStack = true;
    protected _script = '';
    protected _name = '';

    // settings that are persisted, but not undoable
    protected _increasingnumberforelemname = 1;
    protected _increasingnumberforid = 1000;
    static readonly initStackId = '900';
    static readonly initProductOptsId = '901';
    static readonly initIncreasingNumberId = 50000;
    public increasingnumber: CountNumericIdNormal;
    protected _stacklineage = ''; // "author|1b2v123c|stack name||author|1b2v123c|stack name"
    getNextId() {
        let ret = this._increasingnumberforid;
        this.set('increasingnumberforid', ret + 1);
        return ret.toString();
    }
    getNextNumberForElemName() {
        let ret = this._increasingnumberforelemname;
        this.set('increasingnumberforelemname', ret + 1);
        return ret.toString();
    }

    bgs: VpcElBg[] = [];
    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    getAttributesList() {
        return ['script', 'name', 'increasingnumberforelemname', 'increasingnumberforid', 'stacklineage'];
    }
    startGettersSetters() {
        VpcElStack.stackInit();
        this.getters = VpcElStack.cachedGetters;
        this.setters = VpcElStack.cachedSetters;
    }

    lineageUsernameNull() {
        return 'null';
    }
    getLatestStackLineage(): [string, string, string] {
        let lin = this.get('stacklineage');
        if (slength(lin)) {
            let linparts = lin.split('||');
            let last = linparts[linparts.length - 1];
            let lastparts = last.split('|');
            assertEq(3, lastparts.length, '');
            return lastparts;
        } else {
            throw makeVpcInternalErr('stacklineage should never be empty');
        }
    }

    appendToStackLineage(item: [string, string, string]) {
        assertEq(3, item.length, '');
        assertTrue(item[0].length && item[1].length && item[2].length, '');
        let lin = this.get('stacklineage');
        if (slength(lin)) {
            lin += '||' + item.join('|');
        } else {
            lin += item.join('|');
        }

        this.set('stacklineage', lin);
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
    static stackInit() {
        if (!VpcElStack.cachedGetters || !VpcElStack.cachedSetters) {
            VpcElStack.cachedGetters = {};
            VpcElStack.cachedGetters['script'] = [PrpTyp.Str, 'script'];
            VpcElStack.cachedSetters = {};
            VpcElStack.cachedSetters['name'] = [PrpTyp.Str, 'name'];
            Util512.freezeRecurse(VpcElStack.cachedGetters);
            Util512.freezeRecurse(VpcElStack.cachedSetters);
        }
    }

    getType() {
        return VpcElType.Stack;
    }

    findCardByName(name: string) {
        for (let bg of this.bgs) {
            let found = VpcElBase.findByName(bg.cards, name, VpcElType.Card);
            if (found) {
                return found;
            }
        }

        return undefined;
    }

    findCardStackPosition(cardid: string) {
        let count = 0;
        for (let bg of this.bgs) {
            for (let cd of bg.cards) {
                if (cd.id === cardid) {
                    return count;
                }

                count += 1;
            }
        }

        return undefined;
    }

    getCardStackPosition(cardid: string) {
        return throwIfUndefined(this.findCardStackPosition(cardid), '4v|card id not found', cardid);
    }

    findFromCardStackPosition(pos: number) {
        let count = 0;
        for (let bg of this.bgs) {
            for (let cd of bg.cards) {
                if (count === pos) {
                    return cd;
                }

                count += 1;
            }
        }
    }

    getFromCardStackPosition(pos: number) {
        return throwIfUndefined(this.findFromCardStackPosition(pos), '4u|card number not found', pos);
    }

    getCardByOrdinal(currentCardId: string, pos: OrdinalOrPosition): VpcElCard {
        if (pos === OrdinalOrPosition.first) {
            return this.bgs[0].cards[0];
        }

        let totalcards = this.bgs.map(bg => bg.cards.length).reduce(Util512.add);
        let lastcdposition = totalcards - 1;
        if (pos === OrdinalOrPosition.last) {
            return this.getFromCardStackPosition(lastcdposition);
        }

        let currentcdposition = this.getCardStackPosition(currentCardId);
        let nextcdposition = getPositionFromOrdinalOrPosition(pos, currentcdposition, 0, lastcdposition);
        return this.getFromCardStackPosition(nextcdposition);
    }

    *iterEntireStack(): IterableIterator<VpcElBase> {
        // important:
        // must process parents before children, as we
        // use this ordering during deserialization
        yield this;
        for (let bg of this.bgs) {
            yield bg;
            for (let cd of bg.cards) {
                yield cd;
                for (let pt of cd.parts) {
                    yield pt;
                }
            }
        }
    }
}
