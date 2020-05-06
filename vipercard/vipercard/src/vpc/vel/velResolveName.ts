
/* auto */ import { RememberHistory } from './../vpcutils/vpcUtils';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { OrdinalOrPosition, PropAdjective, VpcElType, checkThrow, vpcElTypeShowInUI } from './../vpcutils/vpcEnums';
/* auto */ import { StackOrderHelpers } from './velStackOrderHelpers';
/* auto */ import { VpcElStack } from './velStack';
/* auto */ import { VpcElProductOpts } from './velProductOpts';
/* auto */ import { VpcModelTop } from './velModelTop';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { VpcElButton } from './velButton';
/* auto */ import { VpcElBg } from './velBg';
/* auto */ import { VpcElBase, VpcElSizable } from './velBase';
/* auto */ import { O, cProductName } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, arLast, castVerifyIsStr, getEnumToStrOrFallback, getStrToEnum } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
        let methodName = 'goResolveName' + Util512.capitalizeFirst(getEnumToStrOrFallback(VpcElType, type));
        return castVerifyIsStr(Util512.callAsMethodOnClass(VelResolveName.name, this, methodName, [vel, adjective], false));
    }

    /**
     * re-use logic for buttons and fields
     */
    protected goResolveNameBtn(vel: VpcElButton, adjective: PropAdjective) {
        checkThrow(vel instanceof VpcElButton, 'J[|');
        return this.belongsToBg(vel) ? this.goResolveBgBtnOrFld(vel, adjective) : this.goResolveCdBtnOrFld(vel, adjective);
    }

    /**
     * re-use logic for buttons and fields
     */
    protected goResolveNameFld(vel: VpcElField, adjective: PropAdjective) {
        checkThrow(vel instanceof VpcElField, 'J@|');
        return this.belongsToBg(vel) ? this.goResolveBgBtnOrFld(vel, adjective) : this.goResolveCdBtnOrFld(vel, adjective);
    }

    /**
     * get the name of a card button or field
     */
    protected goResolveCdBtnOrFld(vel: VpcElButton | VpcElField, adjective: PropAdjective) {
        let typ = vel.getType() === VpcElType.Btn ? 'button' : 'field';
        let name = vel.getS('name');
        if (name.length) {
            /* name exists, show the name */
            if (adjective === PropAdjective.Long) {
                let parent = this.model.getCardById(vel.parentId);
                return `card ${typ} "${name}" of ${this.goResolveNameCard(parent, adjective)}`;
            } else if (adjective === PropAdjective.Short) {
                return `${name}`;
            } else {
                return `card ${typ} "${name}"`;
            }
        } else {
            /* no name, fall back to showing the id */
            if (adjective === PropAdjective.Long) {
                let parent = this.model.getCardById(vel.parentId);
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
        checkThrow(false, 'J?|not yet implemented');
    }

    /**
     * get the name of a card
     */
    protected goResolveNameCard(vel: VpcElCard, adjective: PropAdjective): string {
        checkThrow(vel instanceof VpcElCard, 'J>|');
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
        checkThrow(vel instanceof VpcElBg, 'J=|');
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
     * get the name of a stack.
     * made compatible with original product.
     */
    protected goResolveNameStack(vel: VpcElStack, adjective: PropAdjective) {
        checkThrow(vel instanceof VpcElStack, 'J<|');
        let nm = vel.getS('name');
        if (adjective === PropAdjective.Short) {
            return nm;
        } else if (adjective === PropAdjective.Long) {
            return `stack "Hard Drive:${nm}"`;
        } else {
            return `stack "${nm}"`;
        }
    }

    /**
     * get the name of product
     * interesting fact, in emulator the "long name" of product would return filepath of the app
     */
    protected goResolveNameProduct(vel: VpcElProductOpts, adjective: PropAdjective) {
        checkThrow(vel instanceof VpcElProductOpts, 'J;|');
        return cProductName;
    }

    /**
     * does the object belong to a background
     */
    belongsToBg(part: VpcElSizable): boolean {
        let parent = this.model.getByIdUntyped(part.parentId);
        return parent.getType() === VpcElType.Bg;
    }
}

/**
 * when a script asks for the id of an object
 * put the long name of cd btn "myBtn" into x
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

    /**
     * the long id of a cd btn is the same as the short id of a cd btn
     */
    protected goOtherTypes(vel: VpcElBase, adjective: PropAdjective) {
        if (adjective === PropAdjective.Long) {
            if (vel instanceof VpcElButton || vel instanceof VpcElField) {
                let parent = this.model.getOwnerUntyped(vel);
                if (parent instanceof VpcElBg) {
                    checkThrow(false, `T(|nyi. probably write something like "bg id 123 via cd id 567"`);
                } else {
                    return `${vpcElTypeShowInUI(VpcElType.Card)} ${vpcElTypeShowInUI(vel.getType())} id ${vel.id}`;
                }
            } else {
                return `${vpcElTypeShowInUI(vel.getType())} id ${vel.id}`;
            }
        } else {
            return vel.id;
        }
    }

    /**
     * go from card id 123 back to a RequestedVelRef
     */
    static parseFromString(s: string) {
        let words = s.split(/\s+/);
        if (
            words.length >= 3 &&
            arLast(words) === 'stack' &&
            words[words.length - 2] === 'this' &&
            words[words.length - 3] === 'of'
        ) {
            words = words.slice(0, -3);
        }

        if (words.length === 2 && words[0] === 'this' && words[1] === 'stack') {
            let ref = new RequestedVelRef(VpcElType.Stack);
            ref.lookByRelative = OrdinalOrPosition.This;
            return ref;
        }

        checkThrow(!words.some(w => w === 'name'), 'T&|we only support looking by id, like `card id 123`');
        checkThrow(!words.some(w => w.startsWith('"')), 'T%|we only support looking by id, like `card id 123`');
        checkThrow(words.length === 3 || words.length === 4, 'T#|expected something like `card id 123`');
        let getType = (s: string) => {
            return getStrToEnum<VpcElType>(VpcElType, 'expected something like `card id 123`', s);
        };
        let firstType = getType(words[0]);
        let realType = VpcElType.Unknown;
        if ((firstType === VpcElType.Card || firstType === VpcElType.Bg) && words[1] !== 'id') {
            checkThrow(firstType !== VpcElType.Bg, 'T!|nyi, would probably need something like via card 2');
            realType = getType(words[1]);
            words.splice(1, 1);
        } else {
            realType = firstType;
        }

        checkThrow(words[1] === 'id', 'T |expected something like `card id 123`');
        let theId = Util512.parseInt(words[2]);
        checkThrow(theId, 'Tz|invalid number. expected something like `card id 123`');
        let ret = new RequestedVelRef(realType);
        ret.lookById = theId;
        return ret;
    }
}

/**
 * the user asked "put the number of cd btn 'a' into x"
 */
export class VelResolveNumber {
    constructor(protected model: VpcModelTop) {}
    /**
     * get the number. note that the adjective is ignored, "long number" === "short number"
     */
    go(vel: VpcElBase) {
        if (vel instanceof VpcElStack) {
            checkThrow(false, 'Ty|This type of object does not have a number.');
        } else if (vel instanceof VpcElProductOpts) {
            checkThrow(false, 'Tx|This type of object does not have a number.');
        } else {
            return this.goOtherTypes(vel);
        }
    }

    /**
     * most objects exist in a list of siblings
     */
    goOtherTypes(vel: VpcElBase) {
        let parentList: VpcElBase[] = [];
        if (vel.getType() === VpcElType.Bg) {
            let parent = this.model.getOwner(VpcElStack, vel);
            parentList = parent.bgs;
        } else if (vel.getType() === VpcElType.Card) {
            let parent = this.model.getOwner(VpcElBg, vel);
            parentList = parent.cards;
        } else if (vel.getType() === VpcElType.Btn) {
            let parent = this.model.getOwnerUntyped(vel);
            checkThrow(parent instanceof VpcElCard, 'Tw|bg not yet implemented');
            parentList = parent.parts.filter(e => e.getType() === VpcElType.Btn);
        } else if (vel.getType() === VpcElType.Fld) {
            let parent = this.model.getOwnerUntyped(vel);
            checkThrow(parent instanceof VpcElCard, 'Tv|bg not yet implemented');
            parentList = parent.parts.filter(e => e.getType() === VpcElType.Fld);
        }

        checkThrow(parentList && parentList.length, 'Tu|parent list not found or empty');
        let index = parentList.findIndex(e => e.id === vel.id);
        checkThrow(index !== -1, 'Tt|object not found belonging to its parent');
        return index + 1; /* one-based indexing */
    }
}


/* tempppppppppppppppppppppppppppp */
export class VelResolveReferenceCOPYY {
    constructor(protected model: VpcModelTop) {}

    /**
     * resolve the reference
     * returns the given parent card as well,
     * since 'bg fld id 1234 of cd 1' is different than 'bg fld id 1234 of cd 2'
     */
    go(ref: RequestedVelRef, me: O<VpcElBase>, target: O<VpcElBase>, cardHistory: RememberHistory): [O<VpcElBase>, VpcElCard] {
        const currentCard = this.model.getCurrentCard();

        /* check that the types are consistent */

        
        if (ref.lookById && !ref.partIsBg) {
            /* looking up by id is very fast, and the same for every type */
            checkThrow(
                !ret || ret.getType() === ref.type || ref.type === VpcElType.Unknown,
                'T/|wrong type',
                ref.type,
                ret ? ret.getType() : ''
            );
            return [ret, currentCard];
        }

        
        return ret;
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
    protected goBtnOrFld(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBgGiven: O<VpcElBg>,
        isBg: boolean
    ): [O<VpcElBase>, VpcElCard] {
        checkThrow(!parentBgGiven, "J*|this type can't have a parent bg, specify card instead");
        checkThrow(!isBg, 'J)|not yet supported');
        parentCd = parentCd ?? this.model.getCurrentCard();
        let retBtnOrFld: O<VpcElBase>;
        if (isBg) {
            let parentBgId = parentCd.parentId;
            let parentBg = this.model.getById(VpcElBg, parentBgId);
            if (ref.lookById !== undefined) {
                /* put the name of bg btn id 1234 into x */
                let reflookById = ref.lookById;
                retBtnOrFld = parentBg.parts.find(vel => vel.id === reflookById.toString());
            } else if (ref.lookByAbsolute !== undefined) {
                /* put the name of bg btn 2 into x */
                let arr = parentBg.parts.filter(vel => vel.getType() === ref.type);
                retBtnOrFld = arr[ref.lookByAbsolute - 1];
            } else if (ref.lookByName !== undefined) {
                /* put the name of bg btn "myBtn" into x */
                retBtnOrFld = parentBg.parts.find(
                    vel => vel.getType() === ref.type && vel.getS('name').toLowerCase() === ref.lookByName?.toLowerCase()
                );
            } else {
                checkThrow(false, 'T,|unknown object reference');
            }
        } else {
            if (ref.lookByAbsolute !== undefined) {
                /* put the name of cd btn 2 into x */
                let arr = parentCd.parts.filter(vel => vel.getType() === ref.type);
                retBtnOrFld = arr[ref.lookByAbsolute - 1];
            } else if (ref.lookByName !== undefined) {
                /* put the name of cd btn "myBtn" into x */
                retBtnOrFld = parentCd.parts.find(
                    vel => vel.getType() === ref.type && vel.getS('name').toLowerCase() === ref.lookByName?.toLowerCase()
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
            checkThrow(!ref.cardLookAtMarkedOnly, "T+|can't look at only marked cds of a bg");
            let arr = parentBg.cards;
            if (ref.lookByAbsolute !== undefined) {
                /* put the name of card 2 of bg "myBg" into x */
                retCard = arr[ref.lookByAbsolute - 1];
            } else if (ref.lookByName !== undefined) {
                /* put the name of card "myCard" of bg "myBg" into x */
                retCard = arr.find(vel => vel.getS('name').toLowerCase() === ref.lookByName?.toLowerCase());
            } else if (ref.lookByRelative !== undefined) {
                /* put the name of next card of bg "myBg" into x */
                let currentPos = arr.findIndex(vel => vel.id === currentCard.id);
                retCard = VpcElBase.findByOrdinal(VpcElCard, arr, currentPos === -1 ? 0 : currentPos, ref.lookByRelative);
            }
        } else if (ref.cardLookAtMarkedOnly) {
            let arrAllCards: VpcElCard[] = this.model.stack.getCardOrder().map(s => this.model.getCardById(s));
            if (ref.lookByAbsolute !== undefined) {
                let arrOnlyMarked = arrAllCards.filter(c => c.getB('marked'));
                retCard = arrOnlyMarked[ref.lookByAbsolute - 1];
            } else if (ref.lookByRelative === OrdinalOrPosition.This) {
                if (currentCard.getB('marked')) {
                    retCard = currentCard;
                } else {
                    checkThrow(false, 'T*|no such card');
                }
            } else if (ref.lookByRelative === OrdinalOrPosition.Next || ref.lookByRelative === OrdinalOrPosition.Previous) {
                let curPos = arrAllCards.findIndex(c => c.id === currentCard.id);
                checkThrow(curPos !== -1, 'T)|');
                if (ref.lookByRelative === OrdinalOrPosition.Next) {
                    let subArr = arrAllCards.slice(curPos);
                    retCard = subArr.find(c => c.getB('marked'));
                } else if (ref.lookByRelative === OrdinalOrPosition.Previous) {
                    let subArr = arrAllCards.splice(0, curPos + 1);
                    subArr.reverse();
                    retCard = subArr.find(c => c.getB('marked'));
                }
            } else if (ref.lookByRelative) {
                let arrOnlyMarked = arrAllCards.filter(c => c.getB('marked'));
                retCard = VpcElBase.findByOrdinal(VpcElCard,
                    arrOnlyMarked,
                    0 /* we only have Ordinals left, so the current position doesn't matter */,
                    ref.lookByRelative
                );
            }
        } else {
            if (ref.lookByAbsolute !== undefined) {
                /* put the name of card 2 into x */
                retCard = StackOrderHelpers.findFromCardStackPosition(this.model, ref.lookByAbsolute - 1);
            } else if (ref.lookByName !== undefined) {
                /* put the name of card "myCard" into x */
                retCard = StackOrderHelpers.findCardByName(ref.lookByName, this.model);
            } else if (ref.lookByRelative !== undefined) {
                /* put the name of next card into x */
                retCard = StackOrderHelpers.getCardByOrdinal(currentCard.id, ref.lookByRelative, this.model);
            }
        }

        return [retCard, currentCard];
    }

    /**
     * resolve a background
     */
    protected goBg(ref: RequestedVelRef, parentCd: O<VpcElCard>, parentBg: O<VpcElBg>, isBg: boolean): [O<VpcElBase>, VpcElCard] {
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
            retBg = arr.find(vel => vel.getS('name').toLowerCase() === ref.lookByName?.toLowerCase());
        } else if (ref.lookByRelative !== undefined) {
            /* put the name of next bkgnd into x */
            let currentCard = this.model.getCurrentCard();
            let currentBg = currentCard.parentId;
            let currentPos = arr.findIndex(vel => vel.id === currentBg);
            retBg = VpcElBase.findByOrdinal(VpcElBg, arr, currentPos === -1 ? 0 : currentPos, ref.lookByRelative);
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
        let currentCard = this.model.getCurrentCard();
        if (ref.lookByName && ref.lookByName === this.model.stack.getS('name')) {
            return [this.model.stack, currentCard];
        } else if (ref.lookById && ref.lookById.toString() === this.model.stack.id) {
            return [this.model.stack, currentCard];
        } else if (ref.lookByAbsolute === 1) {
            return [this.model.stack, currentCard];
        } else if (
            ref.lookByRelative === OrdinalOrPosition.Any ||
            ref.lookByRelative === OrdinalOrPosition.Middle ||
            ref.lookByRelative === OrdinalOrPosition.Last ||
            ref.lookByRelative === OrdinalOrPosition.First ||
            ref.lookByRelative === OrdinalOrPosition.This
        ) {
            return [this.model.stack, currentCard];
        } else {
            checkThrow(
                !ref || ref.onlyThisSpecified(),
                `Jx|we don't currently support referring to stacks other than "this stack"`
            );

            return [this.model.stack, currentCard];
        }
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
        checkThrow(!ref || ref.onlyThisSpecified(), `75|we don't currently support referring to other than "${cProductName}"`);

        let currentCard = this.model.getCurrentCard();
        return [this.model.productOpts, currentCard];
    }
}

