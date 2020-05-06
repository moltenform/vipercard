
/* auto */ import { RememberHistory } from './../vpcutils/vpcUtils';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { OrdinalOrPosition, VpcElType, checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { StackOrderHelpers } from './velStackOrderHelpers';
/* auto */ import { VpcModelTop } from './velModelTop';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { VpcElBg } from './velBg';
/* auto */ import { VpcElBase } from './velBase';
/* auto */ import { O, bool, cProductName, trueIfDefinedAndNotNull, tostring } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, getEnumToStrOrFallback, cast } from './../../ui512/utils/util512';

import { VpcElStack } from './velStack';
import { VpcElButton } from './velButton';
import { assertTrue } from '../../ui512/utils/util512Assert';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
    go(ref: RequestedVelRef, me: O<VpcElBase>, target: O<VpcElBase>, cardHistory: RememberHistory): [O<VpcElBase>, VpcElCard] {
        const currentCard = this.model.getCurrentCard();

        /* check that the types are consistent */
        checkThrow(ref instanceof RequestedVelRef, '76|invalid RequestedElRef');
        checkThrow(!ref.parentCdInfo || ref.parentCdInfo.type === VpcElType.Card, 'J/|');
        checkThrow(!ref.parentBgInfo || ref.parentBgInfo.type === VpcElType.Bg, 'J.|');
        checkThrow(!ref.parentStackInfo || ref.parentStackInfo.type === VpcElType.Stack, 'J-|');
        checkThrow(
            !ref.parentStackInfo || ref.parentStackInfo.onlyThisSpecified(),
            `J,|we don't currently support referring to stacks other than "this stack"`
        );
        checkThrow(!ref.cardLookAtMarkedOnly || ref.type === VpcElType.Card, 'T<|');
        checkThrow(!ref.cardIsRecentHistory || ref.type === VpcElType.Card, 'T;|');

        if (ref.isReferenceToMe) {
            checkThrowEq(VpcElType.Unknown, ref.type, 'T:|');
            return [me, currentCard];
        } else if (ref.isReferenceToTarget) {
            checkThrowEq(VpcElType.Unknown, ref.type, '6}|');
            return [target, currentCard];
        } else if (ref.cardIsRecentHistory) {
            return this.getFromCardRecentHistory(currentCard, ref, cardHistory);
        }

        let parentCard: O<VpcElBase> = ref.parentCdInfo ? this.go(ref.parentCdInfo, me, target, cardHistory)[0] : undefined;
        let parentBg: O<VpcElBase> = ref.parentBgInfo ? this.go(ref.parentBgInfo, me, target, cardHistory)[0] : undefined;
        let methodName = 'go' + Util512.capitalizeFirst(getEnumToStrOrFallback(VpcElType, ref.type));
        if (bool(ref.parentCdInfo && !parentCard) || bool(ref.parentBgInfo && !parentBg)) {
            /* you have specified a parent, but the parent does not exist!
            therefore the child does not exist */
            return [undefined, currentCard];
        } else if (ref.lookById && !ref.partIsBg) {
            /* looking up by id is very fast, and the same for every type */
            let ret = this.model.findByIdUntyped(ref.lookById.toString());
            checkThrow(
                !ret || ret.getType() === ref.type || ref.type === VpcElType.Unknown,
                'T/|wrong type',
                ref.type,
                ret ? ret.getType() : ''
            );
            return [ret, currentCard];
        }

        let ret = Util512.callAsMethodOnClass(
            VelResolveReference.name,
            this,
            methodName,
            [ref, parentCard, parentBg, ref.partIsBg],
            false
        ) as [O<VpcElBase>, VpcElCard];
        checkThrow(Array.isArray(ret) && ret[1] instanceof VpcElCard, 'T.|');
        return ret;
    }

    /**
     * implement "back", "forth". match product behavior: if card no longer exists, keep going
     */
    private getFromCardRecentHistory(
        currentCard: VpcElCard,
        ref: RequestedVelRef,
        cardHistory: RememberHistory
    ): [O<VpcElBase>, VpcElCard] {
        let refersTo: O<string>;
        let fallback = () => currentCard.id;
        let cardExists = (s: string) => {
            let cd = this.model.findByIdUntyped(s);
            return trueIfDefinedAndNotNull(cd) && cd.getType() === VpcElType.Card;
        };

        /* confirmed in the emulator that refering to 'back' doesn't alter its state */
        if (ref.cardIsRecentHistory === 'recent' || ref.cardIsRecentHistory === 'back') {
            refersTo = cardHistory.walkPreviousWhileAcceptible(fallback, cardExists);
            cardHistory.walkNextWhileAcceptible(fallback, cardExists);
        } else if (ref.cardIsRecentHistory === 'forth') {
            refersTo = cardHistory.walkNextWhileAcceptible(fallback, cardExists);
            cardHistory.walkPreviousWhileAcceptible(fallback, cardExists);
        }

        checkThrow(refersTo, `T-|can't see card "${ref.cardIsRecentHistory}"`);
        let cd = this.model.findByIdUntyped(refersTo);
        checkThrow(trueIfDefinedAndNotNull(cd) && cd.getType() === VpcElType.Card, 'J+|wrong type');
        return [cd, currentCard];
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























//~ make this it
/**
 * a script refers to an object that might or might not exist,
 * go from a RequestedVelRef to a concrete VpcElBase
 */
export class VelResolveReference2 {
    constructor(protected model: VpcModelTop) {}
    /**
     * resolve the reference
     * returns the given parent card as well,
     * since 'bg fld id 1234 of cd 1' is different than 'bg fld id 1234 of cd 2'
     */
    go(ref: RequestedVelRef, me: O<VpcElBase>, target: O<VpcElBase>, cardHistory: RememberHistory): [O<VpcElBase>, VpcElCard] {
        const currentCard = this.model.getCurrentCard();
        checkThrow(ref instanceof RequestedVelRef, '76|invalid RequestedElRef');

        /* special categories */
        checkThrow(!ref.cardLookAtMarkedOnly || ref.type === VpcElType.Card, 'T<|');
        checkThrow(!ref.cardIsRecentHistory || ref.type === VpcElType.Card, 'T;|');
        if (ref.isReferenceToMe) {
            checkThrowEq(VpcElType.Unknown, ref.type, 'T:|');
            return [me, currentCard];
        } else if (ref.isReferenceToTarget) {
            checkThrowEq(VpcElType.Unknown, ref.type, '6}|');
            return [target, currentCard];
        } else if (ref.cardIsRecentHistory) {
            return this.getFromCardRecentHistory(currentCard, ref, cardHistory);
        }

        /* combine parents into one chain */
        this.combineParents(ref)

        /* resolve parents */
        let parentCard: O<VpcElCard>
        let parentBg: O<VpcElBg>
        if (ref.parentCdInfo) {
            let aParentCard = this.go(ref.parentCdInfo, me, target, cardHistory)
            checkThrow(aParentCard[0], "break, not found, parent not found")
            parentCard = cast(VpcElCard, aParentCard, "break, not found, wrong parent type")
        }
        if (ref.parentBgInfo) {
            let aParentBg = this.go(ref.parentBgInfo, me, target, cardHistory)
            checkThrow(aParentBg[0], "break, not found, parent not found")
            parentBg = cast(VpcElBg, aParentBg, "break, not found, wrong parent type")
        }
        if (ref.parentStackInfo) {
            let aParentStack = this.go(ref.parentStackInfo, me, target, cardHistory)
            checkThrow(aParentStack[0], "break, not found, parent not found")
            cast(VpcElStack, aParentStack, "break, not found, wrong parent type")
            /* we can now safely ignore parentStack,
            since the only options are 1) doesn't exist
            and 2) exists and refers to this stack */
        }

        /* optimize looking by id */
        let ret: [O<VpcElBase>, VpcElCard]
        if (ref.lookById) {
            let found = this.lookById(ref, currentCard, parentCard, parentBg)
            this.doParentsHaveRightHierarchy(found, ref, parentCard, parentBg)
            return this.getResultsFromFound(found, currentCard, ref, parentCard, parentBg)
        } else {
            let methodName = 'go' + Util512.capitalizeFirst(getEnumToStrOrFallback(VpcElType, ref.type));
            let found = Util512.callAsMethodOnClass(
                VelResolveReference.name,
                this,
                methodName,
                [ref, parentCard, parentBg],
                false
            ) as O<VpcElBase>;
            this.doParentsHaveRightHierarchy(found, ref, parentCard, parentBg)
            ret = this.getResultsFromFound(found, currentCard, ref, parentCard, parentBg)
        }

        /* confirm type lines up with what we expect */
        checkThrow(!ret[0] || ref.type === VpcElType.Unknown || ref.type === ret[0].getType(), 'break, not found, unexpected type')
        return ret
    }

    /**
     * do parents make sense
     */
    protected doParentsHaveRightHierarchy(found:O<VpcElBase>, ref: RequestedVelRef, parentCard: O<VpcElCard>, parentBg: O<VpcElBg>) {
        if (found && found.getType() === VpcElType.Stack) {
            checkThrow(!parentCard, "break, not found, cannot have this this type of parent")
            checkThrow(!parentBg, "break, not found, cannot have this this type of parent")
        } else if (found && found.getType() === VpcElType.Bg) {
            checkThrow(!parentCard, "break, not found, cannot have this this type of parent")
            checkThrow(!parentBg, "break, not found, cannot have this this type of parent")
        } else if (found && found.getType() === VpcElType.Card) {
            checkThrow(!parentCard, "break, not found, cannot have this this type of parent")
        }
    }

    /**
     * get the results, get the correct card to reference a bg item from
     */
    protected getResultsFromFound(found:O<VpcElBase>, currentCard: VpcElCard, ref: RequestedVelRef, parentCard: O<VpcElCard>, parentBg: O<VpcElBg>): [O<VpcElBase>, VpcElCard] {
        if (!found) {
            return [undefined, currentCard]
        }

        if (ref.partIsBg) {
            let parent = this.model.findByIdUntyped(found.parentId)
            checkThrow(parent?.getType() === VpcElType.Bg, "break, not found, said to belong to bg")
        }
        if (ref.partIsCd) {
            let parent = this.model.findByIdUntyped(found.parentId)
            checkThrow(parent?.getType() === VpcElType.Card, "break, not found, said to belong to card")
        }

        let retCard = currentCard
        if (found.getType() === VpcElType.Card) {
            checkThrow(!parentBg || found.parentId === parentBg.id, "break, not found, wrong card parent")
        } else if (found.getType() === VpcElType.Btn || found.getType() === VpcElType.Fld) {
            let parent = this.model.findByIdUntyped(found.parentId)
            let isFromABg = parent?.getType() === VpcElType.Bg
            if (isFromABg) {
                checkThrow(!parentBg || found.parentId === parentBg.id, "break, not found, wrong bg parent")
                if (parentCard) {
                    checkThrow(parentCard.parentId === parent?.id, "break, not found, card not in this bg")
                    retCard = parentCard
                }
            } else {
                checkThrow(!parentCard || found.parentId === parentCard.id, "break, not found, wrong card parent")
                checkThrow(!parentBg, "break, not found, a card element can't belong to a bg")
            }
        }

        return [found, retCard]
    }

    /**
     * consolidate parents into one chain
     */
    protected combineParents(ref: RequestedVelRef) {
        if (ref.parentCdInfo) {
            if (ref.parentBgInfo) {
                ref.parentCdInfo.parentBgInfo = ref.parentBgInfo
                ref.parentBgInfo = undefined
                if (ref.parentStackInfo) {
                    ref.parentCdInfo.parentBgInfo.parentStackInfo = ref.parentStackInfo
                    ref.parentStackInfo = undefined
                }
            } else if (ref.parentStackInfo) {
                ref.parentCdInfo.parentStackInfo = ref.parentStackInfo
                ref.parentStackInfo = undefined
            }
        } else if (ref.parentBgInfo) {
            if (ref.parentStackInfo) {
                ref.parentBgInfo.parentStackInfo = ref.parentStackInfo
                ref.parentStackInfo = undefined
            }
        }
    }

    /**
     * implement "back", "forth". match product behavior: if card no longer exists, keep going
     */
    protected getFromCardRecentHistory(
        currentCard: VpcElCard,
        ref: RequestedVelRef,
        cardHistory: RememberHistory
    ): [O<VpcElBase>, VpcElCard] {
        let refersTo: O<string>;
        let fallback = () => currentCard.id;
        let cardExists = (s: string) => {
            let cd = this.model.findByIdUntyped(s);
            return trueIfDefinedAndNotNull(cd) && cd.getType() === VpcElType.Card;
        };

        /* confirmed in the emulator that refering to 'back' doesn't alter its state */
        if (ref.cardIsRecentHistory === 'recent' || ref.cardIsRecentHistory === 'back') {
            refersTo = cardHistory.walkPreviousWhileAcceptible(fallback, cardExists);
            cardHistory.walkNextWhileAcceptible(fallback, cardExists);
        } else if (ref.cardIsRecentHistory === 'forth') {
            refersTo = cardHistory.walkNextWhileAcceptible(fallback, cardExists);
            cardHistory.walkPreviousWhileAcceptible(fallback, cardExists);
        }

        checkThrow(refersTo, `T-|can't see card "${ref.cardIsRecentHistory}"`);
        let cd = this.model.findByIdUntyped(refersTo);
        checkThrow(trueIfDefinedAndNotNull(cd) && cd.getType() === VpcElType.Card, 'J+|wrong type');
        return [cd, currentCard];
    }

    /**
     * looking by id has similar logic for all types
     */
    protected lookById(ref: RequestedVelRef, currentCard: VpcElCard, parentCard: O<VpcElCard>, parentBg: O<VpcElBg>): [O<VpcElBase>, VpcElCard] {
        let found = this.model.findByIdUntyped(tostring(ref.lookById))
        return [found, currentCard]
    }
}






