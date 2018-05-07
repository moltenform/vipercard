
/* auto */ import { O, checkThrow, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObject, cast } from '../../ui512/utils/utils512.js';
/* auto */ import { ElementObserverDefault } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { OrdinalOrPosition, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';
/* auto */ import { VpcElProductOpts } from '../../vpc/vel/velProductOpts.js';

/**
 * owner of the stack model and productopts model
 */
export class VpcModelTop {
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
    findById<T extends VpcElBase>(id: O<string>, ctor: { new (...args: any[]): T }): O<T> {
        let vel = this.elements.find(id);
        return vel ? cast(vel, ctor, id) : undefined;
    }

    /**
     * look for a vel of specified type by id, throws if not found
     */
    getById<T extends VpcElBase>(id: string, ctor: { new (...args: any[]): T }): T {
        let vel = this.elements.get(id);
        return cast(vel, ctor, id);
    }

    /**
     * add a vel to our map
     */
    addIdToMapOfElements(vel: VpcElBase) {
        this.elements.add(vel.id, vel);
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
            throw makeVpcScriptErr(`4t|cannot get the owner of product`);
        } else {
            let found = this.findByIdUntyped(vel.parentId);
            if (found !== undefined) {
                return found;
            } else {
                throw makeVpcScriptErr(`4s|cannot get the owner of el ${vel.id}`);
            }
        }
    }

    /**
     * a convenient way to go from a vel to its owner, confirm type is as expected
     */
    getOwner<T>(vel: VpcElBase, ctor: { new (...args: any[]): T }): T {
        let found = this.getOwnerUntyped(vel)
        return cast(found, ctor)
    }

    /**
     * get the vel of the current card
     */
    getCurrentCard() {
        let cardId = this.productOpts.getS('currentCardId');
        let found = this.getById(cardId, VpcElCard);
        checkThrow(found && found.isVpcElCard && found.getType() === VpcElType.Card, '79|getCurrentCard failed');
        return found;
    }

    /**
     * set the current card based on relative position
     */
    getCardRelative(pos: OrdinalOrPosition) {
        let curcardid =
            pos === OrdinalOrPosition.First || pos === OrdinalOrPosition.Last ? '' : this.getCurrentCard().id;
        let found = this.stack.getCardByOrdinal(curcardid, pos);
        return found.id;
    }

    /**
     * get child arrays
     */
    static getChildArrays(vel: VpcElBase): VpcElBase[][] {
        let velAsCard = vel as VpcElCard;
        let velAsBg = vel as VpcElBg;
        let velAsStack = vel as VpcElStack;
        if (velAsCard && velAsCard.isVpcElCard) {
            return [velAsCard.parts];
        } else if (velAsBg && velAsBg.isVpcElBg) {
            return [velAsBg.cards, velAsBg.parts];
        } else if (velAsStack && velAsStack.isVpcElStack) {
            return [velAsStack.bgs];
        } else {
            return [];
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
        this.elements = undefined as any; /* destroy() */
        this.productOpts = undefined as any; /* destroy() */
        this.stack = undefined as any; /* destroy() */
    }
}
