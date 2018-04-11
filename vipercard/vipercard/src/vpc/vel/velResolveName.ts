
/* auto */ import { O, checkThrow, makeVpcInternalErr, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { checkThrowEq, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { PropAdjective, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { RequestedVelRef } from '../../vpc/vpcutils/vpcOutsideClasses.js';
/* auto */ import { VpcElBase, VpcElSizable } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';
/* auto */ import { VpcModel } from '../../vpc/vel/velModel.js';
/* auto */ import { vpcElTypeAsSeenInName } from '../../vpc/vel/velResolveReference.js';

export class VelResolveName {
    constructor(protected model: VpcModel) {}

    doesPartBelongToBg(part: VpcElSizable) {
        let parent = this.model.getByIdUntyped(part.parentId);
        return parent.getType() === VpcElType.Bg;
    }

    getUserFormattedId(vel: VpcElBase, adjective: PropAdjective): string {
        if (vel.getType() === VpcElType.Product) {
            return 'WILD';
        } else if (vel.getType() === VpcElType.Stack) {
            return 'this stack';
        } else if (vel.getType() === VpcElType.Bg || vel.getType() === VpcElType.Card) {
            if (adjective === PropAdjective.short) {
                return vel.id;
            } else {
                let ret = `${vpcElTypeAsSeenInName(vel.getType())} id ${vel.id}`;
                return adjective === PropAdjective.long ? ret + ' of this stack' : ret;
            }
        } else if (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld) {
            // confirmed in emulator that adjective is ignored
            return vel.id;
        } else {
            throw makeVpcScriptErr(`4r|unknown type ${vel.getType()}`);
        }
    }

    getUserFormattedName(vel: VpcElBase, adjective: PropAdjective): string {
        let hasAName = slength(vel.get_s('name')) > 0;
        if (vel.getType() === VpcElType.Product) {
            return adjective === PropAdjective.long ? vel.get_s('longname') : vel.get_s('name');
        } else if (vel.getType() === VpcElType.Stack) {
            return adjective === PropAdjective.short && hasAName ? vel.get_s('name') : 'this stack';
        } else if (vel.getType() === VpcElType.Bg || vel.getType() === VpcElType.Card) {
            if (adjective === PropAdjective.short) {
                return hasAName ? vel.get_s('name') : this.getUserFormattedId(vel, PropAdjective.empty);
            } else {
                let ret = `${vpcElTypeAsSeenInName(vel.getType())} `;
                ret += hasAName ? `"${vel.get_s('name')}"` : `id ${vel.id}`;
                return adjective === PropAdjective.long ? ret + ' of this stack' : ret;
            }
        } else if (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld) {
            let elPart = vel as VpcElSizable;
            checkThrow(elPart.isVpcElSizable, '78|wrong type');
            let prefix = '';
            if (vel instanceof VpcElButton || vel instanceof VpcElField) {
                prefix = this.doesPartBelongToBg(elPart) ? 'bkgnd' : 'card';
            }

            if (adjective === PropAdjective.short) {
                return hasAName ? vel.get_s('name') : `${prefix} ${vpcElTypeAsSeenInName(vel.getType())} id ${vel.id}`;
            } else {
                let parent = this.model.getByIdUntyped(vel.parentId);
                let ret = `${prefix} ${vpcElTypeAsSeenInName(vel.getType())} `;
                ret += hasAName ? `"${vel.get_s('name')}"` : `id ${vel.id}`;
                return adjective === PropAdjective.long
                    ? ret + ' of ' + this.getUserFormattedName(parent, PropAdjective.long)
                    : ret;
            }
        } else {
            throw makeVpcScriptErr(`4q|unknown type ${vel.getType()}`);
        }
    }

    getOwnerName(vel: VpcElBase, adjective: PropAdjective): string {
        let card = vel as VpcElCard;
        checkThrow(card.isVpcElCard, `77|you can only get the owner of a card.`);
        let bg = this.model.getOwner(card);
        return this.getUserFormattedName(bg, adjective);
    }

    resolveReference(ref: RequestedVelRef, me: O<VpcElBase>, target: O<VpcElBase>): O<VpcElBase> {
        const currentCard = this.model.getCurrentCard();
        checkThrow(ref.isRequestedVelRef, '76|invalid RequestedElRef');
        checkThrow(
            !ref.parentStackInfo || ref.parentStackInfo.onlyThisSpecified(),
            `75|we don't currently support referring to stacks other than "this stack"`
        );

        let parentCard: O<VpcElCard>;
        if (ref.parentCdInfo) {
            checkThrow(
                ref.type === VpcElType.Btn || ref.type === VpcElType.Fld,
                `74|you can only specify parent card for btn, fld`
            );
            checkThrowEq(
                VpcElType.Card,
                ref.parentCdInfo.type,
                `73|required type card but got ${ref.parentCdInfo.type}`
            );
            parentCard = this.resolveReference(ref.parentCdInfo, me, target) as VpcElCard;
            checkThrow(!parentCard || parentCard.isVpcElCard, `72|wrong type`);
        }

        let parentBg: O<VpcElBg>;
        if (ref.parentBgInfo) {
            checkThrow(
                ref.type === VpcElType.Btn || ref.type === VpcElType.Fld || ref.type === VpcElType.Card,
                `71|you can only specify parent card for btn, fld, cd`
            );
            checkThrowEq(VpcElType.Bg, ref.parentBgInfo.type, `70|required type bg but got ${ref.parentBgInfo.type}`);
            parentBg = this.resolveReference(ref.parentBgInfo, me, target) as VpcElBg;
            checkThrow(!parentBg || parentBg.isVpcElBg, `6~|wrong type`);
        }

        if ((ref.parentCdInfo && parentCard === undefined) || (ref.parentBgInfo && parentBg === undefined)) {
            return undefined;
        } else if (ref.lookById !== undefined) {
            let found = this.model.findByIdUntyped(ref.lookById.toString());
            return found && matchesType(found, ref.type) ? found : undefined;
        } else if (ref.isReferenceToMe) {
            checkThrowEq(VpcElType.Unknown, ref.type, '6}|');
            return me;
        } else if (ref.isReferenceToTarget) {
            checkThrowEq(VpcElType.Unknown, ref.type, '6||');
            return target;
        } else if (ref.type === VpcElType.Card && !parentBg) {
            if (ref.lookByAbsolute !== undefined) {
                return this.model.stack.findFromCardStackPosition(ref.lookByAbsolute - 1);
            } else if (ref.lookByName !== undefined) {
                return this.model.stack.findCardByName(ref.lookByName);
            } else if (ref.lookByRelative !== undefined) {
                return this.model.stack.getCardByOrdinal(currentCard.id, ref.lookByRelative);
            } else {
                throw makeVpcInternalErr(`4p|unknown el reference`);
            }
        } else if (ref.type === VpcElType.Bg || (ref.type === VpcElType.Card && parentBg)) {
            let arr: VpcElBase[] = [];
            let currentpos = 0;
            if (ref.type === VpcElType.Bg) {
                arr = this.model.stack.bgs;
                currentpos = VpcElBase.getIndexById(this.model.stack.bgs, currentCard.parentId);
            } else if (parentBg) {
                // "next card of bg 7" if we're in bg 7, use current position
                // "next card of bg 7" if we're not in bg 7, go to the 2nd card.
                arr = parentBg.cards;
                currentpos =
                    currentCard.parentId === parentBg.id ? VpcElBase.getIndexById(parentBg.cards, currentCard.id) : 0;
            }

            if (ref.lookByAbsolute !== undefined) {
                return arr[ref.lookByAbsolute - 1];
            } else if (ref.lookByName !== undefined) {
                return VpcElBase.findByName(arr, ref.lookByName, ref.type);
            } else if (ref.lookByRelative !== undefined) {
                return VpcElBase.findByOrdinal(arr, currentpos, ref.lookByRelative);
            } else {
                throw makeVpcInternalErr(`4o|unknown el reference`);
            }
        } else if (ref.type === VpcElType.Btn || ref.type === VpcElType.Fld) {
            let arr: VpcElBase[];
            let spart = ref.type === VpcElType.Btn ? 'btn' : 'fld';
            if (ref.partIsBg) {
                checkThrow(
                    !ref.parentCdInfo,
                    `6{|It doesn't make sense to refer to 'bg ${spart} "a" of cd 2', need to say say 'bg ${spart} "a" of bg 3' or 'cd ${spart} "a" of cd 2'`
                );
                parentBg = parentBg ? parentBg : (this.model.getOwner(currentCard) as VpcElBg);
                checkThrow(parentBg && parentBg.isVpcElBg, `60|Current bg not found`);
                arr = parentBg.parts;
            } else {
                checkThrow(
                    !ref.parentBgInfo,
                    `6_|It doesn't make sense to refer to 'cd ${spart} "a" of bg 3', need to say say 'bg ${spart} "a" of bg 3' or 'cd ${spart} "a" of cd 2'`
                );
                parentCard = parentCard ? parentCard : currentCard;
                arr = parentCard.parts;
            }

            if (ref.lookByName !== undefined) {
                let ret = VpcElBase.findByName(arr, ref.lookByName, ref.type);
                checkThrow(
                    !ret || this.doesPartBelongToBg(ret as VpcElSizable) === ref.partIsBg,
                    `6^|wanted a cd ${spart} but somehow got a bg ${spart}`
                );
                return ret;
            } else if (ref.lookByAbsolute !== undefined || ref.lookByRelative !== undefined) {
                throw makeVpcScriptErr(
                    `4n|we no longer support referring to cd ${spart} 2. use cd ${spart} "name" or cd ${spart} id 1001 instead. (got ${
                        ref.lookByAbsolute
                    })`
                );
            } else {
                throw makeVpcInternalErr(`4m|unknown el reference`);
            }
        } else if (ref.type === VpcElType.Stack) {
            checkThrow(ref.onlyThisSpecified(), `6]|we don't currently support referring to other stacks`);
            return this.model.stack;
        } else if (ref.type === VpcElType.Product) {
            return this.model.productOpts;
        } else {
            throw makeVpcScriptErr(`4l|AttemptedElRef didn't know how to look up type ${ref.type}`);
        }
    }

    static getChildrenArrays(vel: VpcElBase): VpcElBase[][] {
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
}

function matchesType(vel: VpcElBase, type: VpcElType): boolean {
    if (type === VpcElType.Bg) {
        return (vel as VpcElBg).isVpcElBg;
    } else if (type === VpcElType.Btn) {
        return (vel as VpcElButton).isVpcElButton;
    } else if (type === VpcElType.Fld) {
        return (vel as VpcElField).isVpcElField;
    } else if (type === VpcElType.Card) {
        return (vel as VpcElCard).isVpcElCard;
    } else if (type === VpcElType.Stack) {
        return (vel as VpcElStack).isVpcElStack;
    } else {
        return false;
    }
}
