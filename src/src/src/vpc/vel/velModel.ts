
/* auto */ import { O, checkThrow, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObject } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ElementObserverDefault } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { OrdinalOrPosition, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';
/* auto */ import { VpcElProductOpts } from '../../vpc/vel/velProductOpts.js';

export class VpcModel {
    // set by _VpcDocLoader_ which calls ensureDocumentNotEmpty()
    stack: VpcElStack;
    productOpts: VpcElProductOpts;
    modelUuid: string;
    protected elements = new MapKeyToObject<VpcElBase>();
    findByIdUntyped(id: O<string>) {
        return this.elements.find(id);
    }

    getByIdUntyped(id: string) {
        return this.elements.get(id);
    }

    findById<T extends VpcElBase>(id: O<string>, ctor: { new (...args: any[]): T }): O<T> {
        let vel = this.elements.find(id) as any;
        if (vel && !(vel instanceof ctor)) {
            checkThrow(false, '7B|wrong type', vel.id);
        }

        return vel;
    }

    getById<T extends VpcElBase>(id: string, ctor: { new (...args: any[]): T }): T {
        let vel = this.elements.get(id) as any;
        if (!(vel instanceof ctor)) {
            checkThrow(false, '7A|wrong type', vel.id);
        }

        return vel;
    }

    addIdToMapOfElements(vel: VpcElBase) {
        this.elements.add(vel.id, vel);
    }

    removeIdFromMapOfElements(id: string) {
        return this.elements.remove(id);
    }

    getOwner(vel: VpcElBase): VpcElBase {
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

    getCurrentCard() {
        let cardid = this.productOpts.get_s('currentCardId');
        let found = this.getById(cardid, VpcElCard);
        checkThrow(found && found.isVpcElCard && found.getType() === VpcElType.Card, '79|getCurrentCard failed');
        return found;
    }

    goCardRelative(pos: OrdinalOrPosition) {
        let curcardid =
            pos === OrdinalOrPosition.first || pos === OrdinalOrPosition.last ? '' : this.getCurrentCard().id;
        let found = this.stack.getCardByOrdinal(curcardid, pos);
        this.productOpts.set('currentCardId', found.id);
    }

    destroy() {
        for (let vel of this.stack.iterEntireStack()) {
            vel.makeDormant();
        }

        this.productOpts.observer = new ElementObserverDefault();
        this.elements = undefined as any;
        this.productOpts = undefined as any;
        this.stack = undefined as any;
    }
}
