
/* auto */ import { assertTrueWarn, checkThrow, makeVpcInternalErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEqWarn } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { CodeLimits } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';
/* auto */ import { VpcElProductOpts } from '../../vpc/vel/velProductOpts.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcInterface.js';

export abstract class UndoableActionCreateOrDelVelement {
    isUndoableActionCreateOrDelVel = true;
    constructor(public velId: string, public parentid: string, public type: VpcElType, public insertindex: number) {}

    protected static getconstructor(type: VpcElType): { new (...args: any[]): any } {
        if (type === VpcElType.Btn) {
            return VpcElButton;
        } else if (type === VpcElType.Fld) {
            return VpcElField;
        } else if (type === VpcElType.Card) {
            return VpcElCard;
        } else if (type === VpcElType.Bg) {
            return VpcElBg;
        } else {
            throw makeVpcInternalErr(`6f|incorrect type/parent. type is a ${type}`);
        }
    }

    static getparentarray(parentId: string, appli: IVpcStateInterface, type: VpcElType): VpcElBase[] {
        let parent = appli.getModel().getByIdUntyped(parentId);
        let parentasCard = parent as VpcElCard;
        let parentasBg = parent as VpcElBg;
        let parentasStack = parent as VpcElStack;

        if ((type === VpcElType.Btn || type === VpcElType.Fld) && parentasCard.isVpcElCard) {
            return parentasCard.parts;
        } else if ((type === VpcElType.Btn || type === VpcElType.Fld) && parentasBg.isVpcElBg) {
            return parentasBg.parts;
        } else if (type === VpcElType.Card && parentasBg.isVpcElBg) {
            return parentasBg.cards;
        } else if (type === VpcElType.Bg && parentasStack.isVpcElStack) {
            return parentasStack.bgs;
        } else {
            throw makeVpcInternalErr(`6e|incorrect type/parent. child is a ${type} and parent is a `);
        }
    }

    protected determineIndexInAr(vel: VpcElBase, appli: IVpcStateInterface) {
        let ar = UndoableActionCreateOrDelVelement.getparentarray(this.parentid, appli, vel.getType());
        for (let i = 0; i < ar.length; i++) {
            if (ar[i].id === vel.id) {
                return i;
            }
        }

        throw makeVpcInternalErr(`6d|could not find place in parent array for ${vel.id}`);
    }

    protected create(appli: IVpcStateInterface) {
        let ctr = UndoableActionCreateOrDelVelement.getconstructor(this.type);
        let el = appli.rawCreate(this.velId, this.parentid, ctr);
        let ar = UndoableActionCreateOrDelVelement.getparentarray(this.parentid, appli, el.getType());
        if (this.insertindex === -1) {
            // note, save this for undo posterity
            this.insertindex = ar.length;
        }

        // check bounds, note that it is ok to insert one past the end.
        assertTrueWarn(this.insertindex >= 0 && this.insertindex <= ar.length, '6c|incorrect insertion point');
        checkThrow(
            ar.length < CodeLimits.MaxVelChildren,
            `8)|exceeded maximum number of child elements (${CodeLimits.MaxVelChildren})`
        );
        ar.splice(this.insertindex, 0, el);
    }

    protected remove(appli: IVpcStateInterface) {
        appli.causeFullRedraw();
        let el = appli.getModel().getByIdUntyped(this.velId);
        let ar = UndoableActionCreateOrDelVelement.getparentarray(el.parentId, appli, el.getType());
        assertEqWarn(el.id, ar[this.insertindex].id, '6b|');
        assertTrueWarn(this.insertindex >= 0 && this.insertindex < ar.length, '6a|incorrect insertion point');
        ar.splice(this.insertindex, 1);
        appli.getModel().removeIdFromMapOfElements(el.id);
        appli.getCodeExec().removeScript(this.velId);
        el.makeDormant();
    }

    static ensureDocumentNotEmpty(appli: IVpcStateInterface, createFirstCard: boolean) {
        let model = appli.getModel();
        if (!model.productOpts) {
            appli.doWithoutAbilityToUndo(() => {
                model.productOpts = appli.rawCreate(
                    VpcElStack.initStackId,
                    '(VpcElProductOpts has no parent)',
                    VpcElProductOpts
                );
            });
        }

        if (!model.stack) {
            appli.doWithoutAbilityToUndo(() => {
                // create a new stack
                model.stack = appli.rawCreate(VpcElStack.initProductOptsId, model.productOpts.id, VpcElStack);

                if (createFirstCard) {
                    let firstbg = appli.createElem(model.stack.id, VpcElType.Bg, -1);
                    let firstcard = appli.createElem(firstbg.id, VpcElType.Card, -1);
                }
            });
        }
    }
}
