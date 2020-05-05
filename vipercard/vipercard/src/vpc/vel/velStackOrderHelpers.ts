
/* auto */ import { OrdinalOrPosition, checkThrow, findPositionFromOrdinalOrPosition } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './velStack';
/* auto */ import { VpcModelTop } from './velModelTop';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { O, bool } from './../../ui512/utils/util512Base';
/* auto */ import { ensureDefined } from './../../ui512/utils/util512Assert';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

export const StackOrderHelpers = /* static class */ {
    /**
     * find card by name
     */
    findCardByName(name: string, model: VpcModelTop) {
        let cdids = model.stack.getCardOrder();
        for (let cdid of cdids) {
            let vel = model.getByIdUntyped(cdid);
            if (vel.getS('name') === name) {
                return vel;
            }
        }

        return undefined;
    },

    /**
     * position of card within the stack. return undefined if card not found
     */
    findCardStackPosition(stack: VpcElStack, cardId: string): O<number> {
        let cdids = stack.getCardOrder();
        let found = cdids.findIndex(s => s === cardId);
        return found === -1 ? undefined : found;
    },

    /**
     * position of card within the stack. throw if card not found
     */
    getCardStackPosition(stack: VpcElStack, cardId: string) {
        return ensureDefined(this.findCardStackPosition(stack, cardId), '4v|card id not found', cardId);
    },

    /**
     * position of card within the stack, to card. "go to card 6", which card is it?
     * 0-based index
     */
    findFromCardStackPosition(model: VpcModelTop, pos: number) {
        let cdids = model.stack.getCardOrder();
        if (pos >= 0 && pos < cdids.length) {
            return model.getCardById(cdids[pos]);
        } else {
            return undefined;
        }
    },

    /**
     * position of card within the stack, to card.
     * "go to card 6", which card is it? throws if not exist
     * 0-based index
     */
    getFromCardStackPosition(model: VpcModelTop, pos: number) {
        return ensureDefined(this.findFromCardStackPosition(model, pos), '4u|card number not found', pos);
    },

    /**
     * ordinal of card within the stack, to card. "go next card", which card is it?
     */
    getCardByOrdinal(currentCardId: string, pos: OrdinalOrPosition, model: VpcModelTop): VpcElCard {
        let cdids = model.stack.getCardOrder();
        let currentCdPosition = this.getCardStackPosition(model.stack, currentCardId);
        let lastCdPosition = cdids.length - 1;
        let nextCdPosition = findPositionFromOrdinalOrPosition(pos, currentCdPosition, 0, lastCdPosition);
        checkThrow(nextCdPosition !== undefined, "card ordinal not found")
        return this.getFromCardStackPosition(model, nextCdPosition);
    },

    /**
     * get relative position card
     */
    getCardRelative(model: VpcModelTop, pos: OrdinalOrPosition) {
        let curcardid =
            bool(pos === OrdinalOrPosition.First) || bool(pos === OrdinalOrPosition.Last) ? '' : model.getCurrentCard().id;
        let found = this.getCardByOrdinal(curcardid, pos, model);
        return found.id;
    }
};
