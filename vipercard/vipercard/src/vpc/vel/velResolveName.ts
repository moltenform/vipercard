
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { PropAdjective, VpcElType } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './velStack';
/* auto */ import { VpcElProductOpts } from './velProductOpts';
/* auto */ import { VpcModelTop } from './velModelTop';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { VpcElButton } from './velButton';
/* auto */ import { VpcElBg } from './velBg';
/* auto */ import { VpcElBase, VpcElSizable } from './velBase';
/* auto */ import { cProductName } from './../../ui512/utils/util512Productname';
/* auto */ import { O, bool, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, checkThrowEq } from './../../ui512/utils/util512';

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
        return Util512.callAsMethodOnClass(
            'VelResolveName',
            this,
            methodName,
            [vel, adjective],
            false
        );
    }

    /**
     * re-use logic for buttons and fields
     */
    protected goResolveNameBtn(vel: VpcElButton, adjective: PropAdjective) {
        checkThrow(vel.isVpcElButton, 'J[|');
        return this.belongsToBg(vel)
            ? this.goResolveBgBtnOrFld(vel, adjective)
            : this.goResolveCdBtnOrFld(vel, adjective);
    }

    /**
     * re-use logic for buttons and fields
     */
    protected goResolveNameFld(vel: VpcElField, adjective: PropAdjective) {
        checkThrow(vel.isVpcElField, 'J@|');
        return this.belongsToBg(vel)
            ? this.goResolveBgBtnOrFld(vel, adjective)
            : this.goResolveCdBtnOrFld(vel, adjective);
    }

    /**
     * get the name of a card button or field
     */
    protected goResolveCdBtnOrFld(
        vel: VpcElButton | VpcElField,
        adjective: PropAdjective
    ) {
        let typ = vel.getType() === VpcElType.Btn ? 'button' : 'field';
        let name = vel.getS('name');
        if (name.length) {
            /* name exists, show the name */
            if (adjective === PropAdjective.Long) {
                let parent = this.model.getById(vel.parentId, VpcElCard);
                return `card ${typ} "${name}" of ${this.goResolveNameCard(
                    parent,
                    adjective
                )}`;
            } else if (adjective === PropAdjective.Short) {
                return `${name}`;
            } else {
                return `card ${typ} "${name}"`;
            }
        } else {
            /* no name, fall back to showing the id */
            if (adjective === PropAdjective.Long) {
                let parent = this.model.getById(vel.parentId, VpcElCard);
                return `card ${typ} id ${vel.id} of ${this.goResolveNameCard(
                    parent,
                    adjective
                )}`;
            } else {
                return `card ${typ} id ${vel.id}`;
            }
        }
    }

    /**
     * get the name of a background button or field
     */
    protected goResolveBgBtnOrFld(
        vel: VpcElButton | VpcElField,
        adjective: PropAdjective
    ) {
        checkThrow(false, 'J?|not yet implemented');
    }

    /**
     * get the name of a card
     */
    protected goResolveNameCard(vel: VpcElCard, adjective: PropAdjective): string {
        checkThrow(vel.isVpcElCard, 'J>|');
        let name = vel.getS('name');
        if (name.length) {
            /* name exists, show the name */
            if (adjective === PropAdjective.Long) {
                return `card "${name}" of this stack`;
            } else if (adjective === PropAdjective.Short) {
                return `${name}`;
            } else {
                return `card "${name}"`;
            }
        } else {
            /* no name, fall back to showing the id */
            if (adjective === PropAdjective.Long) {
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
        checkThrow(vel.isVpcElBg, 'J=|');
        let name = vel.getS('name');
        if (name.length) {
            /* name exists, show the name */
            if (adjective === PropAdjective.Long) {
                return `bkgnd "${name}" of this stack`;
            } else if (adjective === PropAdjective.Short) {
                return `${name}`;
            } else {
                return `bkgnd "${name}"`;
            }
        } else {
            /* no name, fall back to showing the id */
            if (adjective === PropAdjective.Long) {
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
        checkThrow(vel.isVpcElStack, 'J<|');
        if (adjective === PropAdjective.Short) {
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
        checkThrow(vel.isVpcElProduct, 'J;|');
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
        checkThrow(!(vel as VpcElStack).isVpcElStack, 'J:|cannot get owner of stack');
        return this.go(this.model.getOwnerUntyped(vel), adjective);
    }
}

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
        if (adjective === PropAdjective.Short) {
            return vel.id;
        } else if (adjective === PropAdjective.Long) {
            return `card id ${vel.id} of this stack`;
        } else {
            return `card id ${vel.id}`;
        }
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
     * returns the given parent card as well,
     * since 'bg fld id 1234 of cd 1' is different than 'bg fld id 1234 of cd 2'
     */
    go(
        ref: RequestedVelRef,
        me: O<VpcElBase>,
        target: O<VpcElBase>
    ): [O<VpcElBase>, VpcElCard] {
        const currentCard = this.model.getCurrentCard();

        /* check that the types are consistent */
        checkThrow(ref.isRequestedVelRef, '76|invalid RequestedElRef');
        checkThrow(!ref.parentCdInfo || ref.parentCdInfo.type === VpcElType.Card, 'J/|');
        checkThrow(!ref.parentBgInfo || ref.parentBgInfo.type === VpcElType.Bg, 'J.|');
        checkThrow(
            !ref.parentStackInfo || ref.parentStackInfo.type === VpcElType.Stack,
            'J-|'
        );
        checkThrow(
            !ref.parentStackInfo || ref.parentStackInfo.onlyThisSpecified(),
            `J,|we don't currently support referring to stacks other than "this stack"`
        );

        if (ref.isReferenceToMe) {
            checkThrowEq(VpcElType.Unknown, ref.type, '6}|');
            return [me, currentCard];
        } else if (ref.isReferenceToTarget) {
            checkThrowEq(VpcElType.Unknown, ref.type, '6||');
            return [target, currentCard];
        }

        let parentCard: O<VpcElBase> = ref.parentCdInfo
            ? this.go(ref.parentCdInfo, me, target)[0]
            : undefined;
        let parentBg: O<VpcElBase> = ref.parentBgInfo
            ? this.go(ref.parentBgInfo, me, target)[0]
            : undefined;
        let methodName = 'go' + VpcElType[ref.type];
        if (
            bool(ref.parentCdInfo && !parentCard) ||
            bool(ref.parentBgInfo && !parentBg)
        ) {
            /* you have specified a parent, but the parent does not exist!
            therefore the child does not exist */
            return [undefined, currentCard];
        } else if (ref.lookById && !ref.partIsBg) {
            /* looking up by id is very fast, and the same for every type */
            let ret = this.model.findByIdUntyped(ref.lookById.toString());
            checkThrow(
                !ret || bool(ret.getType() === ref.type),
                'J+|wrong type',
                ref.type,
                ret ? ret.getType() : ''
            );
            return [ret, currentCard];
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
    protected goFld(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
        isBg: boolean
    ) {
        return this.goBtnOrFld(ref, parentCd, parentBg, isBg);
    }

    /**
     * share logic for buttons and fields
     */
    protected goBtn(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
        isBg: boolean
    ) {
        return this.goBtnOrFld(ref, parentCd, parentBg, isBg);
    }

    /**
     * resolve a button or field
     */
    protected goBtnOrFld(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBgGiven: O<VpcElBg>,
        isBg: boolean
    ): [O<VpcElBase>, VpcElCard] {
        checkThrow(
            !parentBgGiven,
            "J*|this type can't have a parent bg, specify card instead"
        );
        checkThrow(!isBg, 'J)|not yet supported');
        parentCd = parentCd ?? this.model.getCurrentCard();
        let retBtnOrFld: O<VpcElBase>;
        if (isBg) {
            let parentBgId = parentCd.parentId;
            let parentBg = this.model.getById(parentBgId, VpcElBg);
            if (ref.lookById !== undefined) {
                /* put the name of bg btn id 1234 into x */
                let reflookById = ref.lookById;
                retBtnOrFld = parentBg.parts.find(
                    vel => vel.id === reflookById.toString()
                );
            } else if (ref.lookByAbsolute !== undefined) {
                /* put the name of bg btn 2 into x */
                let arr = parentBg.parts.filter(vel => vel.getType() === ref.type);
                retBtnOrFld = arr[ref.lookByAbsolute - 1];
            } else if (ref.lookByName !== undefined) {
                /* put the name of cd btn "myBtn" into x */
                retBtnOrFld = parentBg.parts.find(
                    vel =>
                        vel.getType() === ref.type && vel.getS('name') === ref.lookByName
                );
            } else {
                checkThrow(false, 'J(|unknown object reference');
            }
        } else {
            if (ref.lookByAbsolute !== undefined) {
                /* put the name of cd btn 2 into x */
                let arr = parentCd.parts.filter(vel => vel.getType() === ref.type);
                retBtnOrFld = arr[ref.lookByAbsolute - 1];
            } else if (ref.lookByName !== undefined) {
                /* put the name of cd btn "myBtn" into x */
                retBtnOrFld = parentCd.parts.find(
                    vel =>
                        vel.getType() === ref.type && vel.getS('name') === ref.lookByName
                );
            } else {
                checkThrow(false, 'J(|unknown object reference');
            }
        }

        return [retBtnOrFld, parentCd];
    }

    /**
     * resolve a card
     */
    protected goCard(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
        isBg: boolean
    ): [O<VpcElBase>, VpcElCard] {
        checkThrow(!parentCd, "J&|this type can't have a parent card");
        checkThrow(!isBg, "J%|this type can't be in a bkgnd");
        let currentCard = this.model.getCurrentCard();
        let retCard: O<VpcElBase>;
        if (parentBg) {
            let arr = parentBg.cards;
            if (ref.lookByAbsolute !== undefined) {
                /* put the name of card 2 of bg "myBg" into x */
                retCard = arr[ref.lookByAbsolute - 1];
            } else if (ref.lookByName !== undefined) {
                /* put the name of card "myCard" of bg "myBg" into x */
                retCard = arr.find(vel => vel.getS('name') === ref.lookByName);
            } else if (ref.lookByRelative !== undefined) {
                /* put the name of next card of bg "myBg" into x */
                let currentPos = arr.findIndex(vel => vel.id === currentCard.id);
                retCard = VpcElBase.findByOrdinal(
                    arr,
                    currentPos === -1 ? 0 : currentPos,
                    ref.lookByRelative
                );
            }
        } else {
            if (ref.lookByAbsolute !== undefined) {
                /* put the name of card 2 into x */
                retCard = this.model.stack.findFromCardStackPosition(
                    ref.lookByAbsolute - 1
                );
            } else if (ref.lookByName !== undefined) {
                /* put the name of card "myCard" into x */
                retCard = this.model.stack.findCardByName(ref.lookByName);
            } else if (ref.lookByRelative !== undefined) {
                /* put the name of next card into x */
                retCard = this.model.stack.getCardByOrdinal(
                    currentCard.id,
                    ref.lookByRelative
                );
            }
        }

        return [retCard, currentCard];
    }

    /**
     * resolve a background
     */
    protected goBg(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
        isBg: boolean
    ): [O<VpcElBase>, VpcElCard] {
        checkThrow(!parentCd, "J$|this type can't have a parent card");
        checkThrow(!parentBg, "J#|this type can't have a parent bg");
        checkThrow(!isBg, "J!|this type can't be in a bkgnd");
        let arr = this.model.stack.bgs;
        let retBg: O<VpcElBase>;
        if (ref.lookByAbsolute !== undefined) {
            /* put the name of bkgnd 2 into x */
            retBg = arr[ref.lookByAbsolute - 1];
        } else if (ref.lookByName !== undefined) {
            /* put the name of bkgnd "myBg" into x */
            retBg = arr.find(vel => vel.getS('name') === ref.lookByName);
        } else if (ref.lookByRelative !== undefined) {
            /* put the name of next bkgnd into x */
            let currentCard = this.model.getCurrentCard();
            let currentBg = currentCard.parentId;
            let currentPos = arr.findIndex(vel => vel.id === currentBg);
            retBg = VpcElBase.findByOrdinal(
                arr,
                currentPos === -1 ? 0 : currentPos,
                ref.lookByRelative
            );
        }

        let currentCard = this.model.getCurrentCard();
        return [retBg, currentCard];
    }

    /**
     * resolve a stack
     */
    protected goStack(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
        isBg: boolean
    ): [O<VpcElBase>, VpcElCard] {
        checkThrow(!parentCd, "J |this type can't have a parent card");
        checkThrow(!parentBg, "Jz|this type can't have a parent bg");
        checkThrow(!isBg, "Jy|this type can't be in a bkgnd");
        checkThrow(
            !ref || ref.onlyThisSpecified(),
            `Jx|we don't currently support referring to stacks other than "this stack"`
        );

        let currentCard = this.model.getCurrentCard();
        return [this.model.stack, currentCard];
    }

    /**
     * resolve a product
     */
    protected goProduct(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
        isBg: boolean
    ): [O<VpcElBase>, VpcElCard] {
        checkThrow(!parentCd, "Jw|this type can't have a parent card");
        checkThrow(!parentBg, "Jv|this type can't have a parent bg");
        checkThrow(!isBg, "Ju|this type can't be in a bkgnd");
        checkThrow(
            !ref || ref.onlyThisSpecified(),
            `75|we don't currently support referring to other than "${cProductName}"`
        );

        let currentCard = this.model.getCurrentCard();
        return [this.model.productOpts, currentCard];
    }
}
