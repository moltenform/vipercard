
/* auto */ import { CodeLimits } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { VpcStateInterface } from './vpcInterface';
/* auto */ import { VpcElType, checkThrow, checkThrowInternal } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './../../vpc/vel/velStack';
/* auto */ import { VpcElProductOpts } from './../../vpc/vel/velProductOpts';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { VpcElCard } from './../../vpc/vel/velCard';
/* auto */ import { VpcElButton } from './../../vpc/vel/velButton';
/* auto */ import { VpcElBg } from './../../vpc/vel/velBg';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { assertWarnEq } from './../../ui512/utils/util512';
/* auto */ import { ElementObserver } from './../../ui512/elements/ui512ElementGettable';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * create or delete a vel
 */
export abstract class UndoableActionCreateOrDelVel {
    constructor(
        public velId: string,
        public parentId: string,
        public type: VpcElType,
        public isBg: boolean,
        public insertIndex: number
    ) {}

    /**
     * from VpcElType to class object
     */
    protected static getConstructor(type: VpcElType): { new (...args: any[]): VpcElBase } {
        if (type === VpcElType.Btn) {
            return VpcElButton;
        } else if (type === VpcElType.Fld) {
            return VpcElField;
        } else if (type === VpcElType.Card) {
            return VpcElCard;
        } else if (type === VpcElType.Bg) {
            return VpcElBg;
        } else if (type === VpcElType.Stack) {
            return VpcElStack;
        } else {
            checkThrowInternal(false, `6f|incorrect type/parent. type is a ${type}`);
        }
    }

    /**
     * get child array
     */
    static getChildVelsArray(velId: string, vci: VpcStateInterface, type: VpcElType): VpcElBase[] {
        let vel = vci.getModel().getByIdUntyped(velId);
        if ((type === VpcElType.Btn || type === VpcElType.Fld) && vel instanceof VpcElCard) {
            return vel.parts;
        } else if (type === VpcElType.Card && vel instanceof VpcElBg) {
            return vel.cards;
        } else if (type === VpcElType.Bg && vel instanceof VpcElStack) {
            return vel.bgs;
        } else {
            checkThrowInternal(false, `6e|incorrect type/parent. child is a ${type} and parent is a `);
        }
    }

    /**
     * create a new vel on its own
     */
    protected static rawMakeVelInstanceAndAddToModelMap<T extends VpcElBase>(
        vci: VpcStateInterface,
        velId: string,
        parentId: string,
        ctr: { new (...args: any[]): T },
        ob?: ElementObserver
    ): T {
        vci.causeFullRedraw();
        let vel = new ctr(velId, parentId);
        checkThrow(vel instanceof VpcElBase, `8*|must be a VpcElBase`);
        if (ob) {
            vel.observer = ob;
        } else {
            vel.observer = vci.getModel().productOpts.observer;
        }

        vci.getModel().addIdToMapOfElements(vel);
        return vel;
    }

    /**
     * find index in array
     */
    protected determineIndexInAr(vel: VpcElBase, vci: VpcStateInterface) {
        let ar = UndoableActionCreateOrDelVel.getChildVelsArray(this.parentId, vci, vel.getType());
        for (let i = 0; i < ar.length; i++) {
            if (ar[i].idInternal === vel.idInternal) {
                return i;
            }
        }

        checkThrowInternal(false, `6d|could not find place in parent array for ${vel.idInternal}`);
    }

    /**
     * create a vel, supports creating a bg vel
     */
    protected create(vci: VpcStateInterface) {
        if (this.isBg && (this.type === VpcElType.Btn || this.type === VpcElType.Fld)) {
            let userFacingId = vci.getModel().stack.getNextId(vci.getModel());
            console.log(userFacingId);
            checkThrow(false, 'Wa|not yet implemented');
        } else {
            return this.createImpl(vci);
        }
    }

    /**
     * create a vel
     */
    protected createImpl(vci: VpcStateInterface) {
        vci.causeFullRedraw();
        let ctr = UndoableActionCreateOrDelVel.getConstructor(this.type);
        let vel = UndoableActionCreateOrDelVel.rawMakeVelInstanceAndAddToModelMap(vci, this.velId, this.parentId, ctr);
        let ar = UndoableActionCreateOrDelVel.getChildVelsArray(this.parentId, vci, vel.getType());
        if (this.insertIndex === -1) {
            /* note, save this for undo posterity */
            this.insertIndex = ar.length;
        }

        /* check bounds, note that it is ok to insert one past the end. */
        assertWarn(this.insertIndex >= 0 && this.insertIndex <= ar.length, '6c|incorrect insertion point');
        checkThrow(
            ar.length < CodeLimits.MaxVelChildren,
            `8)|exceeded maximum number of child elements (${CodeLimits.MaxVelChildren})`
        );

        ar.splice(this.insertIndex, 0, vel);

        if (vel.getType() === VpcElType.Card) {
            vci.getModel().copyBgVelsOnNewCard(vel);

            let order = vci.getModel().stack.getCardOrder();
            let found = order.findIndex(s => s === vci.getCurrentCardId());
            found = found === -1 ? order.length - 1 : found;
            order.splice(found + 1, 0, vel.idInternal);
            vci.getModel().stack.alterCardOrder(oldOrder => order, vci.getModel());
        }
    }

    /**
     * remove a vel
     */
    protected remove(vci: VpcStateInterface) {
        vci.causeFullRedraw();
        let vel = vci.getModel().getByIdUntyped(this.velId);
        let ar = UndoableActionCreateOrDelVel.getChildVelsArray(vel.parentIdInternal, vci, vel.getType());
        assertWarnEq(vel.idInternal, ar[this.insertIndex].idInternal, '6b|');
        assertWarn(this.insertIndex >= 0 && this.insertIndex < ar.length, '6a|incorrect insertion point');
        /* for safety, delete by id */
        let index = ar.findIndex(v => v.idInternal === this.velId);
        if (index !== -1) {
            ar.splice(index, 1);
            vci.getModel().removeIdFromMapOfElements(vel.idInternal);
            if (vel.getType() === VpcElType.Card) {
                vci.getModel().stack.alterCardOrder(list => list.filter(s => s !== vel.idInternal), vci.getModel());
            }
        }
    }

    /**
     * ensure model is not empty, create a productOpts and stack object if either is missing.
     */
    static ensureModelNotEmpty(vci: VpcStateInterface, createFirstCard: boolean, ob: ElementObserver) {
        vci.causeFullRedraw();
        let model = vci.getModel();
        if (!model.productOpts) {
            vci.doWithoutAbilityToUndo(() => {
                model.productOpts = UndoableActionCreateOrDelVel.rawMakeVelInstanceAndAddToModelMap(
                    vci,
                    VpcElStack.initProductOptsId,
                    '(VpcElProductOpts has no parent)',
                    VpcElProductOpts,
                    ob
                );
            });
        }

        if (!model.stack) {
            vci.doWithoutAbilityToUndo(() => {
                /* create a new stack */
                model.stack = UndoableActionCreateOrDelVel.rawMakeVelInstanceAndAddToModelMap(
                    vci,
                    VpcElStack.initStackId,
                    model.productOpts.idInternal,
                    VpcElStack,
                    ob
                );
                model.stack.setOnVel('name', 'my stack', model);
                if (createFirstCard) {
                    let creator = vci.getCodeExec().directiveImpl;
                    let firstBg = creator.rawCreateOneVelUseCarefully(model.stack.idInternal, VpcElType.Bg, -1, undefined);
                    creator.rawCreateOneVelUseCarefully(firstBg.idInternal, VpcElType.Card, -1, undefined);
                }
            });
        }

        model.productOpts.observer = ob;
        model.stack.observer = ob;
    }
}
