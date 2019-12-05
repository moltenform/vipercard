
/* auto */ import { CountNumericIdNormal } from './../vpcutils/vpcUtils';
/* auto */ import { PropGetter, PropSetter, PrpTyp } from './../vpcutils/vpcRequestedReference';
/* auto */ import { OrdinalOrPosition, VpcElType, getPositionFromOrdinalOrPosition } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { VpcElBg } from './velBg';
/* auto */ import { VpcElBase } from './velBase';
/* auto */ import { checkThrow, makeVpcInternalErr, throwIfUndefined } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, checkThrowEq, last, slength } from './../../ui512/utils/util512';

/**
 * a vipercard "stack"
 */
export class VpcElStack extends VpcElBase {
    isVpcElStack = true;
    protected _script = '';
    protected _name = '';
    constructor(id: string, parentId: string) {
        super(id, parentId);
    }

    /* cached getters */
    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };

    /* cached setters */
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };

    /* stacks are always given this id. */
    static readonly initStackId = '900';

    /* productopts are always given this id. */
    static readonly initProductOptsId = '901';

    /* initial value for counter used for internal script line numbers. */
    static readonly initIncreasingNumberId = 50000;

    /* counter for when you create a button in the ui and it's called "my button 3"
    (persisted, but not undoable) */
    protected _increasingnumberforelemname = 1;

    /* counter for creating numeric ids for elements
    (persisted, but not undoable) */
    protected _increasingnumberforid = 1000;

    /* original author of the stack. when you hit save as, we remember the original stack info.
    in the form author|1b2v123c|stack name||author|1b2v123c|stack name */
    protected _stacklineage = '';

    /* child backgrounds */
    bgs: VpcElBg[] = [];

    /* counter used for internal script line numbers. */
    increasingnumber: CountNumericIdNormal;

    /**
     * get next id for created element
     */
    getNextId() {
        let ret = this.getN('increasingnumberforid');
        this.set('increasingnumberforid', ret + 1);
        return ret.toString();
    }

    /**
     * get next number, when you create a button in the ui and it's called "my button 3"
     */
    getNextNumberForElemName() {
        let ret = this.getN('increasingnumberforelemname');
        this.set('increasingnumberforelemname', ret + 1);
        return ret.toString();
    }

    /**
     * re-use cached getters and setter callback functions for better perf
     */
    startGettersSetters() {
        VpcElStack.stackInit();
        this.getters = VpcElStack.cachedGetters;
        this.setters = VpcElStack.cachedSetters;
    }

    /**
     * use this username if you create a new stack and aren't signed in.
     */
    lineageUsernameNull() {
        return 'null';
    }

    /**
     * get latest stack info (server id, username)
     */
    getLatestStackLineage(): VpcElStackLineageEntry {
        let lin = this.getS('stacklineage');
        if (slength(lin)) {
            let linParts = lin.split('||');
            let last = linParts[linParts.length - 1];
            return VpcElStackLineageEntry.fromSerialized(last);
        } else {
            throw makeVpcInternalErr('K5|stacklineage should never be empty');
        }
    }

    /**
     * set latest stack info (server id, username)
     */
    appendToStackLineage(entryIn: VpcElStackLineageEntry) {
        /* round-trip to validate it */
        let entry = VpcElStackLineageEntry.fromSerialized(entryIn.serialize());
        let lin = this.getS('stacklineage');
        if (slength(lin)) {
            lin += '||' + entry.serialize();
        } else {
            lin += entry.serialize();
        }

        this.set('stacklineage', lin);
    }

    /**
     * define getters and setters
     */
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

    /**
     * type of element
     */
    getType() {
        return VpcElType.Stack;
    }

    /**
     * find card by name
     */
    findCardByName(name: string) {
        for (let bg of this.bgs) {
            let found = VpcElBase.findByName(bg.cards, name, VpcElType.Card);
            if (found) {
                return found;
            }
        }

        return undefined;
    }

    /**
     * position of card within the stack. return undefined if card not found
     */
    findCardStackPosition(cardId: string) {
        let count = 0;
        for (let bg of this.bgs) {
            for (let cd of bg.cards) {
                if (cd.id === cardId) {
                    return count;
                }

                count += 1;
            }
        }

        return undefined;
    }

    /**
     * position of card within the stack. throw if card not found
     */
    getCardStackPosition(cardId: string) {
        return throwIfUndefined(this.findCardStackPosition(cardId), '4v|card id not found', cardId);
    }

    /**
     * position of card within the stack, to card. "go to card 6", which card is it?
     */
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

    /**
     * position of card within the stack, to card. "go to card 6", which card is it? throws if not exist
     */
    getFromCardStackPosition(pos: number) {
        return throwIfUndefined(this.findFromCardStackPosition(pos), '4u|card number not found', pos);
    }

    /**
     * ordinal of card within the stack, to card. "go next card", which card is it?
     */
    getCardByOrdinal(currentCardId: string, pos: OrdinalOrPosition): VpcElCard {
        if (pos === OrdinalOrPosition.First) {
            return this.bgs[0].cards[0];
        }

        let totalCards = this.bgs.map(bg => bg.cards.length).reduce(Util512.add);
        let lastCdPosition = totalCards - 1;
        if (pos === OrdinalOrPosition.Last) {
            return this.getFromCardStackPosition(lastCdPosition);
        }

        let currentCdPosition = this.getCardStackPosition(currentCardId);
        let nextCdPosition = getPositionFromOrdinalOrPosition(pos, currentCdPosition, 0, lastCdPosition);
        return this.getFromCardStackPosition(nextCdPosition);
    }

    /**
     * iterate through a stack
     */
    *iterEntireStack(): IterableIterator<VpcElBase> {
        yield this;
        for (let bg of this.bgs) {
            /* must process parents before children, as we */
            /* use this ordering during deserialization */
            yield bg;
            for (let cd of bg.cards) {
                yield cd;
                for (let pt of cd.parts) {
                    yield pt;
                }
            }

            for (let bgpt of bg.parts) {
                yield bgpt;
            }
        }
    }
}

/**
 * stack info, like original author of the stack. when you hit save as, we remember the original stack info.
 */
export class VpcElStackLineageEntry {
    constructor(public stackOwner: string, public stackGuid: string, public stackName: string) {
        checkThrow(slength(stackOwner) > 0, 'K4|author is empty');
        checkThrow(slength(stackGuid) > 0, 'K3|guid is empty');
        checkThrow(slength(stackName) > 0, 'K2|name is empty');
        checkThrow(!stackOwner.includes( '|'), 'K1|author must not contain |', stackOwner);
        checkThrow(!stackGuid.includes( '|'), 'K0|guid must not contain |', stackGuid);
        checkThrow(!stackName.includes( '|'), 'J~|name must not contain |', stackName);
    }

    serialize() {
        return this.stackOwner + '|' + this.stackGuid + '|' + this.stackName;
    }

    static fromSerialized(s: string) {
        let pts = s.split('|');
        checkThrowEq(3, pts.length, 'J}|invalid lineage', s);
        return new VpcElStackLineageEntry(pts[0], pts[1], pts[2]);
    }
}
