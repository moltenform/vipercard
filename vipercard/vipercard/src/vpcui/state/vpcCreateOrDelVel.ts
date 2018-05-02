
/* auto */ import { assertTrueWarn, checkThrow, makeVpcInternalErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEqWarn } from '../../ui512/utils/utils512.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { CodeLimits } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';
/* auto */ import { VpcElProductOpts } from '../../vpc/vel/velProductOpts.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';

/**
 * create or delete a vel
 */
export abstract class UndoableActionCreateOrDelVel {
    isUndoableActionCreateOrDelVel = true;
    constructor(public velId: string, public parentId: string, public type: VpcElType, public insertIndex: number) {}

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
            throw makeVpcInternalErr(`6f|incorrect type/parent. type is a ${type}`);
        }
    }

    /**
     * get child array
     */
    static getChildVelsArray(velId: string, vci: VpcStateInterface, type: VpcElType): VpcElBase[] {
        let vel = vci.getModel().getByIdUntyped(velId);
        let velAsCard = vel as VpcElCard;
        let velAsBg = vel as VpcElBg;
        let velAsStack = vel as VpcElStack;

        if ((type === VpcElType.Btn || type === VpcElType.Fld) && velAsCard.isVpcElCard) {
            return velAsCard.parts;
        } else if ((type === VpcElType.Btn || type === VpcElType.Fld) && velAsBg.isVpcElBg) {
            return velAsBg.parts;
        } else if (type === VpcElType.Card && velAsBg.isVpcElBg) {
            return velAsBg.cards;
        } else if (type === VpcElType.Bg && velAsStack.isVpcElStack) {
            return velAsStack.bgs;
        } else {
            throw makeVpcInternalErr(`6e|incorrect type/parent. child is a ${type} and parent is a `);
        }
    }

    /**
     * find index in array
     */
    protected determineIndexInAr(vel: VpcElBase, vci: VpcStateInterface) {
        let ar = UndoableActionCreateOrDelVel.getChildVelsArray(this.parentId, vci, vel.getType());
        for (let i = 0; i < ar.length; i++) {
            if (ar[i].id === vel.id) {
                return i;
            }
        }

        throw makeVpcInternalErr(`6d|could not find place in parent array for ${vel.id}`);
    }

    /**
     * create a vel
     */
    protected create(vci: VpcStateInterface) {
        checkThrow(
            !vci.getCodeExec().isCodeRunning(),
            "Ks|currently can't add or remove an element while code is running"
        );

        let ctr = UndoableActionCreateOrDelVel.getConstructor(this.type);
        let el = vci.rawCreate(this.velId, this.parentId, ctr);
        let ar = UndoableActionCreateOrDelVel.getChildVelsArray(this.parentId, vci, el.getType());
        if (this.insertIndex === -1) {
            /* note, save this for undo posterity */
            this.insertIndex = ar.length;
        }

        /* check bounds, note that it is ok to insert one past the end. */
        assertTrueWarn(this.insertIndex >= 0 && this.insertIndex <= ar.length, '6c|incorrect insertion point');
        checkThrow(
            ar.length < CodeLimits.MaxVelChildren,
            `8)|exceeded maximum number of child elements (${CodeLimits.MaxVelChildren})`
        );
        ar.splice(this.insertIndex, 0, el);
    }

    /**
     * remove a vel
     */
    protected remove(vci: VpcStateInterface) {
        checkThrow(
            !vci.getCodeExec().isCodeRunning(),
            "8(|currently can't add or remove an element while code is running"
        );

        vci.causeFullRedraw();
        let el = vci.getModel().getByIdUntyped(this.velId);
        let ar = UndoableActionCreateOrDelVel.getChildVelsArray(el.parentId, vci, el.getType());
        assertEqWarn(el.id, ar[this.insertIndex].id, '6b|');
        assertTrueWarn(this.insertIndex >= 0 && this.insertIndex < ar.length, '6a|incorrect insertion point');
        ar.splice(this.insertIndex, 1);
        vci.getModel().removeIdFromMapOfElements(el.id);
        vci.getCodeExec().removeScript(this.velId);
    }

    /**
     * ensure model is not empty, create a productOpts and stack object if either is missing.
     */
    static ensureModelNotEmpty(vci: VpcStateInterface, createFirstCard: boolean) {
        let model = vci.getModel();
        if (!model.productOpts) {
            vci.doWithoutAbilityToUndo(() => {
                model.productOpts = vci.rawCreate(
                    VpcElStack.initStackId,
                    '(VpcElProductOpts has no parent)',
                    VpcElProductOpts
                );
            });
        }

        if (!model.stack) {
            vci.doWithoutAbilityToUndo(() => {
                /* create a new stack */
                model.stack = vci.rawCreate(VpcElStack.initProductOptsId, model.productOpts.id, VpcElStack);
                if (createFirstCard) {
                    let firstBg = vci.createVel(model.stack.id, VpcElType.Bg, -1);
                    let firstCard = vci.createVel(firstBg.id, VpcElType.Card, -1);
                }
            });
        }
    }
}
