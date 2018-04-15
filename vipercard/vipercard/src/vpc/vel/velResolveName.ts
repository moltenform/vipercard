
/* auto */ import { O, cProductName, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, checkThrowEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { PropAdjective, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { RequestedVelRef } from '../../vpc/vpcutils/vpcRequestedReference.js';
/* auto */ import { VpcElBase, VpcElSizable } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';
/* auto */ import { VpcElProductOpts } from '../../vpc/vel/velProductOpts.js';
/* auto */ import { VpcModelTop } from '../../vpc/vel/velModelTop.js';

/**
 * when a script asks for the id of an object
 * put the long id of cd btn "myBtn" into x
 */
export class VelResolveId {
    constructor(protected model: VpcModelTop) {}

    /**
     * get the id
     */
    go(vel: VpcElBase, adjective: PropAdjective) {
        if (vel instanceof VpcElCard) {
            return this.goCard(vel, adjective);
        } else if (vel instanceof VpcElProductOpts) {
            return this.goProduct(vel, adjective);
        } else {
            return this.goOtherTypes(vel, adjective);
        }
    }

    /**
     * matching the emulator's behavior. interesting.
     */
    protected goProduct(vel: VpcElProductOpts, adjective: PropAdjective) {
        return 'WILD';
    }

    /**
     * the long id of a cd btn is the same as the short id of a cd btn
     */
    protected goOtherTypes(vel: VpcElBase, adjective: PropAdjective) {
        return vel.id;
    }

    /**
     * confirmed in emulator that id of card is inconsistent,
     * and more verbose than other objects
     */
    protected goCard(vel: VpcElCard, adjective: PropAdjective) {
        if (adjective === PropAdjective.short) {
            return vel.id;
        } else if (adjective === PropAdjective.long) {
            return `card id ${vel.id} of this stack`;
        } else {
            return `card id ${vel.id}`;
        }
    }
}

/**
 * when a script asks for the name of an object
 * put the long name of cd btn "myBtn" into x
 */
export class VelResolveName {
    constructor(protected model: VpcModelTop) {}

    /**
     * get the name
     */
    go(vel: VpcElBase, adjective: PropAdjective): string {
        let type = vel.getType();
        let methodName = 'goResolveName' + VpcElType[type];
        return Util512.callAsMethodOnClass('VelResolveName', this, methodName, [vel, adjective], false);
    }

    /**
     * re-use logic for buttons and fields
     */
    protected goResolveNameBtn(vel: VpcElButton, adjective: PropAdjective) {
        checkThrow(vel.isVpcElButton, '');
        return this.belongsToBg(vel)
            ? this.goResolveBgBtnOrFld(vel, adjective)
            : this.goResolveCdBtnOrFld(vel, adjective);
    }

    /**
     * re-use logic for buttons and fields
     */
    protected goResolveNameFld(vel: VpcElField, adjective: PropAdjective) {
        checkThrow(vel.isVpcElField, '');
        return this.belongsToBg(vel)
            ? this.goResolveBgBtnOrFld(vel, adjective)
            : this.goResolveCdBtnOrFld(vel, adjective);
    }

    /**
     * get the name of a card button or field
     */
    protected goResolveCdBtnOrFld(vel: VpcElButton | VpcElField, adjective: PropAdjective) {
        let typ = vel.getType() === VpcElType.Btn ? 'button' : 'field';
        let name = vel.getS('name');
        if (name.length) {
            /* name exists, show the name */
            if (adjective === PropAdjective.long) {
                let parent = this.model.getById(vel.parentId, VpcElCard);
                return `card ${typ} "${name}" of ${this.goResolveNameCard(parent, adjective)}`;
            } else if (adjective === PropAdjective.short) {
                return `${name}`;
            } else {
                return `card ${typ} "${name}"`;
            }
        } else {
            /* no name, fall back to showing the id */
            if (adjective === PropAdjective.long) {
                let parent = this.model.getById(vel.parentId, VpcElCard);
                return `card ${typ} id ${vel.id} of ${this.goResolveNameCard(parent, adjective)}`;
            } else {
                return `card ${typ} id ${vel.id}`;
            }
        }
    }

    /**
     * get the name of a background button or field
     */
    protected goResolveBgBtnOrFld(vel: VpcElButton | VpcElField, adjective: PropAdjective) {
        checkThrow(false, 'not yet implemented');
    }

    /**
     * get the name of a card
     */
    protected goResolveNameCard(vel: VpcElCard, adjective: PropAdjective): string {
        checkThrow(vel.isVpcElCard, '');
        let name = vel.getS('name');
        if (name.length) {
            /* name exists, show the name */
            if (adjective === PropAdjective.long) {
                return `card "${name}" of this stack`;
            } else if (adjective === PropAdjective.short) {
                return `${name}`;
            } else {
                return `card "${name}"`;
            }
        } else {
            /* no name, fall back to showing the id */
            if (adjective === PropAdjective.long) {
                return `card id ${vel.id} of this stack`;
            } else {
                return `card id ${vel.id}`;
            }
        }
    }

    /**
     * get the name of a background
     */
    protected goResolveNameBg(vel: VpcElBg, adjective: PropAdjective) {
        checkThrow(vel.isVpcElBg, '');
        let name = vel.getS('name');
        if (name.length) {
            /* name exists, show the name */
            if (adjective === PropAdjective.long) {
                return `bkgnd "${name}" of this stack`;
            } else if (adjective === PropAdjective.short) {
                return `${name}`;
            } else {
                return `bkgnd "${name}"`;
            }
        } else {
            /* no name, fall back to showing the id */
            if (adjective === PropAdjective.long) {
                return `bkgnd id ${vel.id} of this stack`;
            } else {
                return `bkgnd id ${vel.id}`;
            }
        }
    }

    /**
     * get the name of a stack
     * interesting fact, in emulator the "long name" of stack would return filepath of the stack
     */
    protected goResolveNameStack(vel: VpcElStack, adjective: PropAdjective) {
        checkThrow(vel.isVpcElStack, '');
        if (adjective === PropAdjective.short) {
            return vel.getS('name');
        } else {
            return 'this stack';
        }
    }

    /**
     * get the name of product
     * interesting fact, in emulator the "long name" of product would return filepath of the app
     */
    protected goResolveNameProduct(vel: VpcElProductOpts, adjective: PropAdjective) {
        checkThrow(vel.isVpcElProduct, '');
        return cProductName;
    }

    /**
     * does the object belong to a background
     */
    belongsToBg(part: VpcElSizable): boolean {
        let parent = this.model.getByIdUntyped(part.parentId);
        return parent.getType() === VpcElType.Bg;
    }

    /**
     * implementation for "put the owner of cd 1 into x"
     */
    getOwnerName(vel: VpcElBase, adjective: PropAdjective) {
        checkThrow(!(vel as VpcElStack).isVpcElStack, 'cannot get owner of stack');
        return this.go(this.model.getOwner(vel), adjective);
    }
}

/**
 * a script refers to an object that might or might not exist,
 * go from a RequestedVelRef to a concrete VpcElBase
 */
export class VelResolveReference {
    constructor(protected model: VpcModelTop) {}

    /**
     * resolve the reference
     */
    go(ref: RequestedVelRef, me: O<VpcElBase>, target: O<VpcElBase>): O<VpcElBase> {
        const currentCard = this.model.getCurrentCard();

        /* check that the types are consistent */
        checkThrow(ref.isRequestedVelRef, '76|invalid RequestedElRef');
        checkThrow(!ref.parentCdInfo || ref.parentCdInfo.type === VpcElType.Card, '');
        checkThrow(!ref.parentBgInfo || ref.parentBgInfo.type === VpcElType.Bg, '');
        checkThrow(!ref.parentStackInfo || ref.parentStackInfo.type === VpcElType.Stack, '');
        checkThrow(
            !ref.parentStackInfo || ref.parentStackInfo.onlyThisSpecified(),
            `75|we don't currently support referring to stacks other than "this stack"`
        );

        if (ref.isReferenceToMe) {
            checkThrowEq(VpcElType.Unknown, ref.type, '6}|');
            return me;
        } else if (ref.isReferenceToTarget) {
            checkThrowEq(VpcElType.Unknown, ref.type, '6||');
            return target;
        }

        let parentCard = ref.parentCdInfo ? this.go(ref.parentCdInfo, me, target) : undefined;
        let parentBg = ref.parentBgInfo ? this.go(ref.parentBgInfo, me, target) : undefined;
        let methodName = 'go' + VpcElType[ref.type];
        if ((ref.parentCdInfo && !parentCard) || (ref.parentBgInfo && !parentBg)) {
            /* you have specified a parent, but the parent does not exist! therefore the child does not exist */
            return undefined;
        } else if (ref.lookById) {
            /* looking up by id is very fast, and the same for every type */
            let ret = this.model.findByIdUntyped(ref.lookById.toString());
            checkThrow(!ret || ret.getType() === ref.type, 'wrong type', ref.type, ret ? ret.getType() : '');
            return ret;
        }

        return Util512.callAsMethodOnClass(
            'VelResolveReference',
            this,
            methodName,
            [ref, parentCard, parentBg, ref.partIsBg],
            false
        );
    }

    /**
     * share logic for buttons and fields
     */
    protected goFld(ref: RequestedVelRef, parentCd: O<VpcElCard>, parentBg: O<VpcElBg>, isBg: boolean) {
        return this.goBtnOrFld(ref, parentCd, parentBg, isBg);
    }

    /**
     * share logic for buttons and fields
     */
    protected goBtn(ref: RequestedVelRef, parentCd: O<VpcElCard>, parentBg: O<VpcElBg>, isBg: boolean) {
        return this.goBtnOrFld(ref, parentCd, parentBg, isBg);
    }

    /**
     * resolve a button or field
     */
    protected goBtnOrFld(ref: RequestedVelRef, parentCd: O<VpcElCard>, parentBg: O<VpcElBg>, isBg: boolean) {
        checkThrow(!parentBg, "this type can't have a parent bg");
        checkThrow(!isBg, 'not yet supported');
        parentCd = parentCd || this.model.getCurrentCard();
        if (!isBg) {
            if (ref.lookByAbsolute !== undefined) {
                /* put the name of cd btn 2 into x */
                let arr = parentCd.parts.filter(vel => vel.getType() === ref.type);
                return arr[ref.lookByAbsolute - 1];
            } else if (ref.lookByName !== undefined) {
                /* put the name of cd btn "myBtn" into x */
                return parentCd.parts.find(vel => vel.getType() === ref.type && vel.getS('name') === ref.lookByName);
            } else {
                checkThrow(false, 'unknown object reference');
            }
        }
    }

    /**
     * resolve a card
     */
    protected goCard(ref: RequestedVelRef, parentCd: O<VpcElCard>, parentBg: O<VpcElBg>, isBg: boolean) {
        checkThrow(!parentCd, "this type can't have a parent card");
        checkThrow(!isBg, "this type can't be in a bkgnd");
        let currentCard = this.model.getCurrentCard();
        if (parentBg) {
            let arr = parentBg.cards;
            if (ref.lookByAbsolute !== undefined) {
                /* put the name of card 2 of bg "myBg" into x */
                return arr[ref.lookByAbsolute - 1];
            } else if (ref.lookByName !== undefined) {
                /* put the name of card "myCard" of bg "myBg" into x */
                return arr.find(vel => vel.getS('name') === ref.lookByName);
            } else if (ref.lookByRelative !== undefined) {
                /* put the name of next card of bg "myBg" into x */
                let currentPos = arr.findIndex(vel => vel.id === currentCard.id);
                return VpcElBase.findByOrdinal(arr, currentPos === -1 ? 0 : currentPos, ref.lookByRelative);
            }
        } else {
            if (ref.lookByAbsolute !== undefined) {
                /* put the name of card 2 into x */
                return this.model.stack.findFromCardStackPosition(ref.lookByAbsolute - 1);
            } else if (ref.lookByName !== undefined) {
                /* put the name of card "myCard" into x */
                return this.model.stack.findCardByName(ref.lookByName);
            } else if (ref.lookByRelative !== undefined) {
                /* put the name of next card into x */
                return this.model.stack.getCardByOrdinal(currentCard.id, ref.lookByRelative);
            }
        }
    }

    /**
     * resolve a background
     */
    protected goBg(ref: RequestedVelRef, parentCd: O<VpcElCard>, parentBg: O<VpcElBg>, isBg: boolean) {
        checkThrow(!parentCd, "this type can't have a parent card");
        checkThrow(!parentBg, "this type can't have a parent bg");
        checkThrow(!isBg, "this type can't be in a bkgnd");
        let arr = this.model.stack.bgs;
        if (ref.lookByAbsolute !== undefined) {
            /* put the name of bkgnd 2 into x */
            return arr[ref.lookByAbsolute - 1];
        } else if (ref.lookByName !== undefined) {
            /* put the name of bkgnd "myBg" into x */
            return arr.find(vel => vel.getS('name') === ref.lookByName);
        } else if (ref.lookByRelative !== undefined) {
            /* put the name of next bkgnd into x */
            let currentCard = this.model.getCurrentCard();
            let currentBg = currentCard.parentId;
            let currentPos = arr.findIndex(vel => vel.id === currentBg);
            return VpcElBase.findByOrdinal(arr, currentPos === -1 ? 0 : currentPos, ref.lookByRelative);
        }
    }

    /**
     * resolve a stack
     */
    protected goStack(ref: RequestedVelRef, parentCd: O<VpcElCard>, parentBg: O<VpcElBg>, isBg: boolean) {
        checkThrow(!parentCd, "this type can't have a parent card");
        checkThrow(!parentBg, "this type can't have a parent bg");
        checkThrow(!isBg, "this type can't be in a bkgnd");
        checkThrow(
            !ref || ref.onlyThisSpecified(),
            `75|we don't currently support referring to stacks other than "this stack"`
        );

        return this.model.stack;
    }

    /**
     * resolve a product
     */
    protected goProduct(ref: RequestedVelRef, parentCd: O<VpcElCard>, parentBg: O<VpcElBg>, isBg: boolean) {
        checkThrow(!parentCd, "this type can't have a parent card");
        checkThrow(!parentBg, "this type can't have a parent bg");
        checkThrow(!isBg, "this type can't be in a bkgnd");
        checkThrow(
            !ref || ref.onlyThisSpecified(),
            `75|we don't currently support referring to other than "${cProductName}"`
        );

        return this.model.productOpts;
    }
}
