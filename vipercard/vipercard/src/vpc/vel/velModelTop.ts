
/* auto */ import { VpcElType, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './velStack';
/* auto */ import { VpcElProductOpts } from './velProductOpts';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { VpcElButton } from './velButton';
/* auto */ import { VpcElBg } from './velBg';
/* auto */ import { VpcElBase, VpcHandleLinkedVels } from './velBase';
/* auto */ import { SetToInvalidObjectAtEndOfExecution } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { AnyParameterCtor, MapKeyToObject, cast } from './../../ui512/utils/util512';
/* auto */ import { ChangeContext } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { ElementObserverDefault, ElementObserverVal } from './../../ui512/elements/ui512ElementGettable';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * owner of the stack model and productopts model
 */
export class VpcModelTop implements VpcHandleLinkedVels {
    /* initialized by _VpcDocLoader_ which calls ensureModelNotEmpty() */
    stack: VpcElStack;

    /* initialized by _VpcDocLoader_ which calls ensureModelNotEmpty() */
    productOpts: VpcElProductOpts;

    /* a unique id for the entire project, as distinct from the stack's stackLineage */
    uuid: string;

    /* for performance, a fast map from velId to vel */
    protected elements = new MapKeyToObject<VpcElBase>();

    /**
     * look for a vel by id, returns undefined if not found
     */
    findByIdUntyped(id: O<string>) {
        return this.elements.find(id);
    }

    /**
     * look for a vel by id, throw if not found
     */
    getByIdUntyped(id: string) {
        return this.elements.get(id);
    }

    /**
     * look for a vel of specified type by id, returns undefined if not found
     */
    findById<T extends VpcElBase>(ctor: AnyParameterCtor<T>, id: O<string>) {
        let vel = this.elements.find(id);
        return vel ? cast(ctor, vel, id) : undefined;
    }

    /**
     * look for a vel of specified type by id, throws if not found
     */
    getById<T extends VpcElBase>(ctor: AnyParameterCtor<T>, id: string): T {
        let vel = this.elements.get(id);
        return cast(ctor, vel, id);
    }

    /**
     * look for a vel of specified type by id, throws if not found
     */
    getCardById(id: string) {
        return this.getById(VpcElCard, id);
    }

    /**
     * add a vel to our map
     */
    addIdToMapOfElements(vel: VpcElBase) {
        this.elements.add(vel.idInternal, vel);
    }

    /**
     * remove a vel from our map
     */
    removeIdFromMapOfElements(id: string) {
        return this.elements.remove(id);
    }

    /**
     * a convenient way to go from a vel to its owner
     */
    getOwnerUntyped(vel: VpcElBase): VpcElBase {
        if (vel instanceof VpcElStack) {
            return this.productOpts;
        } else if (vel instanceof VpcElProductOpts) {
            checkThrow(false, `4t|cannot get the owner of product`);
        } else {
            let found = this.findByIdUntyped(vel.parentIdInternal);
            if (found !== undefined) {
                return found;
            } else {
                checkThrow(false, `4s|cannot get the owner of el ${vel.idInternal}`);
            }
        }
    }

    /**
     * a convenient way to go from a vel to its owner, confirm type is as expected
     */
    getOwner<T>(ctor: AnyParameterCtor<T>, vel: VpcElBase) {
        let found = this.getOwnerUntyped(vel);
        return cast(ctor, found);
    }

    /**
     * get the parent card of an element
     */
    getParentCardOfElement(vel: VpcElBase): VpcElBase {
        let cur = this.getCurrentCard();
        if (vel instanceof VpcElCard) {
            return vel;
        } else if (vel instanceof VpcElBg) {
            if (vel.idInternal === cur.parentIdInternal) {
                return cur;
            } else {
                return vel.cards[0];
            }
        } else if (vel instanceof VpcElButton || vel instanceof VpcElField) {
            return this.getCardById(vel.parentIdInternal);
        } else {
            return cur;
        }
    }

    /**
     * get the current card
     */
    getCurrentCard() {
        let cardId = this.productOpts.getS('currentCardId');
        let found = this.getCardById(cardId);
        checkThrow(found instanceof VpcElCard && found.getType() === VpcElType.Card, '79|getCurrentCard failed');
        return found;
    }

    /**
     * get child arrays
     */
    static getChildArrays(vel: VpcElBase): VpcElBase[][] {
        let velAsCard = vel as VpcElCard;
        let velAsBg = vel as VpcElBg;
        let velAsStack = vel as VpcElStack;
        if (velAsCard instanceof VpcElCard) {
            return [velAsCard.parts];
        } else if (velAsBg instanceof VpcElBg) {
            return [velAsBg.cards];
        } else if (velAsStack instanceof VpcElStack) {
            return [velAsStack.bgs];
        } else {
            return [];
        }
    }

    /**
     * background elements are linked!
     */
    setOnVelLinked(
        me: VpcElBase,
        s: string,
        newVal: ElementObserverVal,
        cb: (s: string, newVal: ElementObserverVal, ctx: ChangeContext) => void
    ): void {
        if (me instanceof VpcElButton || me instanceof VpcElField) {
            let group = me.getS('is_bg_velement_id');
            if (group && !s.endsWith('_uniquetocard')) {
                /* it's a linked one, we'll need to update everything it is linked to! */
                let card = this.getById(VpcElCard, me.parentIdInternal);
                let bg = this.getById(VpcElBg, card.parentIdInternal);
                for (let card of bg.cards) {
                    for (let part of card.parts) {
                        if (part.getS('is_bg_velement_id') === group) {
                            cb.apply(part, [s, newVal, ChangeContext.Default]);
                            break;
                        }
                    }
                }
            } else {
                cb.apply(me, [s, newVal, ChangeContext.Default]);
            }
        } else {
            cb.apply(me, [s, newVal, ChangeContext.Default]);
        }
    }

    /**
     * we've created a new card. copy over the vels
     */
    copyBgVelsOnNewCard(newCard: VpcElBase) {
        checkThrow(newCard instanceof VpcElCard, '');
        let bg = this.getById(VpcElBg, newCard.parentIdInternal);
        /* use the first card in the bg as a template */
        for (let part of bg.getTemplateCard().parts) {
            let group = part.getS('is_bg_velement_id');
            if (group) {
                checkThrow(false, 'nyi');
            }
        }
    }

    /**
     * when modeltop is no longer valid, null out the fields
     * so that code mistakenly referring to it will
     * cause an exception
     */
    destroy() {
        for (let vel of this.stack.iterEntireStack()) {
            vel.destroy();
        }

        this.productOpts.observer = new ElementObserverDefault();
        this.elements = SetToInvalidObjectAtEndOfExecution(this.elements);
        this.productOpts = SetToInvalidObjectAtEndOfExecution(this.productOpts);
        this.stack = SetToInvalidObjectAtEndOfExecution(this.stack);
    }
}
