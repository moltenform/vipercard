
/* auto */ import { RememberHistory } from './../vpcutils/vpcUtils';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { OrdinalOrPosition, VpcElType, checkThrow, checkThrowEq, findPositionFromOrdinalOrPosition } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './velStack';
/* auto */ import { VpcElProductOpts } from './velProductOpts';
/* auto */ import { VpcModelTop } from './velModelTop';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { VpcElButton } from './velButton';
/* auto */ import { VpcElBg } from './velBg';
/* auto */ import { VpcElBase } from './velBase';
/* auto */ import { O, tostring, trueIfDefinedAndNotNull } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, cast, getEnumToStrOrFallback } from './../../ui512/utils/util512';

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
    go(ref: RequestedVelRef, me: O<VpcElBase>, target: O<VpcElBase>, cardHistory: RememberHistory): O<VpcElBase> {
        checkThrow(ref instanceof RequestedVelRef, '76|invalid RequestedElRef');
        ref.checkOnlyOneSpecified()

        /* special categories */
        checkThrow(!ref.cardLookAtMarkedOnly || ref.type === VpcElType.Card, 'T<|');
        checkThrow(!ref.cardIsRecentHistory || ref.type === VpcElType.Card, 'T;|');
        if (ref.isReferenceToMe) {
            checkThrowEq(VpcElType.Unknown, ref.type, 'T:|');
            return me;
        } else if (ref.isReferenceToTarget) {
            checkThrowEq(VpcElType.Unknown, ref.type, '6}|');
            return target;
        } else if (ref.cardIsRecentHistory) {
            return this.getFromCardRecentHistory(ref, cardHistory);
        }

        /* combine parents into one chain */
        this.combineParents(ref)

        /* resolve parents */
        let parentCard: O<VpcElCard>
        let parentBg: O<VpcElBg>
        if (ref.parentCdInfo) {
            let aParentCard = this.go(ref.parentCdInfo, me, target, cardHistory)
            checkThrow(aParentCard, "break, not found, parent not found")
            parentCard = cast(VpcElCard, aParentCard, "break, not found, wrong parent type")
        }
        if (ref.parentBgInfo) {
            let aParentBg = this.go(ref.parentBgInfo, me, target, cardHistory)
            checkThrow(aParentBg, "break, not found, parent not found")
            parentBg = cast(VpcElBg, aParentBg, "break, not found, wrong parent type")
        }
        if (ref.parentStackInfo) {
            let aParentStack = this.go(ref.parentStackInfo, me, target, cardHistory)
            checkThrow(aParentStack, "break, not found, parent not found")
            cast(VpcElStack, aParentStack, "break, not found, wrong parent type")
            /* we can now safely ignore parentStack,
            since the only options are 1) doesn't exist
            and 2) exists and refers to this stack */
        }

        let ret: O<VpcElBase>
        if (ref.partIsBg) {
            let found = this.lookForBgPart(ref, parentCard, parentBg)
            this.doParentsHaveRightHierarchy(found, ref, parentCard, parentBg)
            ret = this.doubleCheckVelType(found,  ref, parentCard, parentBg)
        } else if (ref.lookById) {
            let found = this.model.findByIdUntyped(tostring(ref.lookById))
            this.doParentsHaveRightHierarchy(found, ref, parentCard, parentBg)
            ret = this.doubleCheckVelType(found,  ref, parentCard, parentBg)
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
            ret = this.doubleCheckVelType(found,  ref, parentCard, parentBg)
        }

        return ret
    }
    
    /**
     * bg parts are complicated
     */
    protected lookForBgPart(ref: RequestedVelRef, parentCard: O<VpcElCard>, parentBg: O<VpcElBg>): O<VpcElBase> {
        checkThrow(!parentBg, "can't say bg fld 1 of bg 3, have to access via a card")
        checkThrow(ref.type === VpcElType.Btn || ref.type === VpcElType.Fld, "only parts can belong to a bg")
        parentCard = parentCard ?? this.model.getCurrentCard()
        let arr = parentCard.parts.filter(vel=>vel.getS('is_bg_velement_id').length > 0 && vel.getType() === ref.type)
        if (ref.lookById) {
            /* remember that for bg parts, userfacing id IS NOT THE SAME AS internal velid */
            let lookById = ref.lookById.toString()
            return arr.find(vel=>vel.getS('is_bg_velement_id') === lookById)
        } else if (ref.lookByAbsolute) {
            return arr[ref.lookByAbsolute - 1]
        } else if (ref.lookByName) {
            return arr.find(vel=>vel.getS('name').toLowerCase() === ref.lookByName?.toLowerCase())
        } else if (ref.lookByRelative) {
            let index = findPositionFromOrdinalOrPosition(ref.lookByRelative, 0, 0, arr.length - 1)
            return index === undefined ? undefined : arr[index]
        } else {
            checkThrow(false, "no specifier")
        }
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

        checkThrow(!ref.cardLookAtMarkedOnly || ref.type === VpcElType.Card, "marked only is only for cards")
        if (found && found.getType() !== VpcElType.Fld && found.getType() !== VpcElType.Btn) {
            checkThrow(!ref.partIsBg, "does not make sense to belong to bg")
            checkThrow(!ref.partIsCd, "does not make sense to belong to cd")
        }

        /* double-check classes */
        if (found && found.getType() === VpcElType.Card) {
            checkThrow(found instanceof VpcElCard, "incorrect class")
        } else if (found && found.getType() === VpcElType.Fld) {
            checkThrow(found instanceof VpcElField, "incorrect class")
        } else if (found && found.getType() === VpcElType.Product) {
            checkThrow(found instanceof VpcElProductOpts, "incorrect class")
        } else if (found && found.getType() === VpcElType.Stack) {
            checkThrow(found instanceof VpcElStack, "incorrect class")
        } else if (found && found.getType() === VpcElType.Bg) {
            checkThrow(found instanceof VpcElBg, "incorrect class")
        } else if (found && found.getType() === VpcElType.Btn) {
            checkThrow(found instanceof VpcElButton, "incorrect class")
        }
    }

    /**
     * get the results, get the correct card to reference a bg item from
     */
    protected doubleCheckVelType(found:O<VpcElBase>, ref: RequestedVelRef, parentCard: O<VpcElCard>, parentBg: O<VpcElBg>): O<VpcElBase> {
        if (!found) {
            return undefined
        }

        if (ref.partIsCd) {
            /* important for preventing someone from
            using the internal true id to look up a bg btn */
            checkThrow(found.getS('is_bg_velement_id').length === 0, "break, not found, said to belong to card")
            checkThrow(!ref.partIsBg, '')
        }
        if (ref.partIsBg) {
            checkThrow(found.getS('is_bg_velement_id').length > 0, "break, not found, said to belong to bg")
            checkThrow(!ref.partIsCd, '')
        }

        if (found.getType() === VpcElType.Card) {
            checkThrow(!parentBg || found.parentIdInternal === parentBg.idInternal, "break, not found, wrong card parent")
        } else if (found.getType() === VpcElType.Btn || found.getType() === VpcElType.Fld) {
            checkThrow(!parentCard || found.parentIdInternal === parentCard.idInternal, "break, not found, wrong card parent")
            checkThrow(!parentBg, "break, not found, a card element can't belong to a bg")
        }

        /* confirm type lines up with what we expect */
        checkThrow(!found || ref.type === VpcElType.Unknown || ref.type === found.getType(), 'break, not found, unexpected type')

        return found
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
        ref: RequestedVelRef,
        cardHistory: RememberHistory
    ): O<VpcElBase> {
        let currentCard = this.model.getCurrentCard()
        let refersTo: O<string>;
        let fallback = () => currentCard.idInternal;
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
        return cd
    }

    /**
     * share logic for buttons and fields
     */
    protected goFld(ref: RequestedVelRef, parentCd: O<VpcElCard>, parentBg: O<VpcElBg>) {
        return this.goBtnOrFld(ref, parentCd, parentBg);
    }

    /**
     * share logic for buttons and fields
     */
    protected goBtn(ref: RequestedVelRef, parentCd: O<VpcElCard>, parentBg: O<VpcElBg>) {
        return this.goBtnOrFld(ref, parentCd, parentBg);
    }

    /**
     * resolve a productopts
     */
    protected goProduct(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
    ): O<VpcElBase> {
        checkThrow(!ref.lookByAbsolute && !ref.lookById && !ref.lookByName && !ref.lookByRelative, "only one productOpts")
        return this.model.productOpts
    }

    /**
     * resolve a stack
     */
    protected goStack(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
    ): O<VpcElBase> {
        if (ref.lookByName) {
            /* `the short id of stack "myStack"` */
            return ref.lookByName === this.model.stack.getS('name') ? this.model.stack : undefined
        } else if (ref.lookByAbsolute) {
            /* `the short id of stack 1` */
            return ref.lookByAbsolute === 1 ? this.model.stack : undefined
        } else if (ref.lookByRelative) {
            /* `the short id of this stack` */
            if (ref.lookByRelative === OrdinalOrPosition.This ||
            ref.lookByRelative === OrdinalOrPosition.Any ||
            ref.lookByRelative === OrdinalOrPosition.Middle ||
            ref.lookByRelative === OrdinalOrPosition.Last ||
            ref.lookByRelative === OrdinalOrPosition.First
            ) {
                return this.model.stack
            } else {
                return undefined
            }
        } else {
            /* it's ok if no specifiers were given
            it is valid to say `get the number of cards of stack` */
            return this.model.stack
        }
    }

    /**
     * resolve a bg
     */
    protected goBg(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
    ): O<VpcElBase> {
        let arr = this.model.stack.bgs
        if (ref.lookByName) {
            /* `the short id of bg "theName"` */
            return arr.find(vel =>
                vel.getS('name').toLowerCase() === ref?.lookByName?.toLowerCase())
        } else if (ref.lookByAbsolute) {
            /* `the short id of bg 2` */
            return arr[ref.lookByAbsolute - 1];
        } else if (ref.lookByRelative) {
            /* `the short id of first bg, the short id of next bg` */
            let cur = this.model.getCurrentCard().parentIdInternal
            let curIndex = arr.findIndex(item => item.idInternal === cur)
            let index = findPositionFromOrdinalOrPosition(ref.lookByRelative, curIndex, 0, arr.length-1)
            return index === undefined ? undefined : arr[index]
        } else {
            checkThrow(false, 'T,|unknown object reference');
        }
    }

    /**
     * resolve a card
     */
    protected goCard(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
    ): O<VpcElBase> {
        let arr = this.model.stack.getCardOrder().map(item => this.model.getCardById(item))
        if (parentBg) {
            arr = parentBg.cards
        }

        let currCdId = this.model.getCurrentCard().idInternal
        if (ref.lookByName) {
            if (ref.cardLookAtMarkedOnly) {
                arr = arr.filter(cd => cd.getB('marked'))
            }
            /* `the short id of cd "theName"` */
            return arr.find(vel =>
                vel.getS('name').toLowerCase() === ref?.lookByName?.toLowerCase())
        } else if (ref.lookByAbsolute) {
            if (ref.cardLookAtMarkedOnly) {
                arr = arr.filter(cd => cd.getB('marked'))
            }
            /* `the short id of cd 2` */
            return arr[ref.lookByAbsolute - 1];
        } else if (ref.lookByRelative) {
            /* `the short id of first cd, the short id of next cd` */
            let curId = this.model.getCurrentCard().idInternal
            if (ref.cardLookAtMarkedOnly && (ref.lookByRelative === OrdinalOrPosition.Previous || ref.lookByRelative === OrdinalOrPosition.Next)) {
                let temparr = arr.filter(cd => cd.getB('marked'))
                checkThrow(temparr.length, "break, not found, no marked cards")
                /* add current one to it as a place of comparison */
                /* we should still use findPositionFromOrdinalOrPosition 
                since we still want wrap-around behavior */
                arr = arr.filter(cd => cd.getB('marked') || cd.idInternal === currCdId)
            } else if (ref.cardLookAtMarkedOnly) {
                arr = arr.filter(cd => cd.getB('marked'))
                checkThrow(arr.length, "break, not found, no marked cards")
            }

            /* confirmed in emulator: */
            /* `the short id of this marked cd` should fail if this cd is not marked */
            /* `the short id of this cd of bg 2` should fail if this cd is not in bg 2 */
            let curIndex = arr.findIndex(item => item.idInternal === curId)
            checkThrow(!(ref.lookByRelative === OrdinalOrPosition.This && curIndex===-1), "break, not found, 'this' card does not meet criteria")
            let index = findPositionFromOrdinalOrPosition(ref.lookByRelative, curIndex, 0, arr.length-1)
            return index === undefined ? undefined : arr[index]
        } else {
            checkThrow(false, 'T,|unknown object reference');
        }
    }

    /**
     * resolve a button or field
     */
    protected goBtnOrFld(
        ref: RequestedVelRef,
        parentCd: O<VpcElCard>,
        parentBg: O<VpcElBg>,
    ): O<VpcElBase> {
        checkThrow(!ref.partIsBg, "should be covered elsewhere")
        checkThrow(!parentBg, "does not make sense to have a parent bg")
        parentCd = parentCd ?? this.model.getCurrentCard()
        if (ref.lookByName) {
            /* `the short id of cd btn "theName"` */
            return parentCd.parts.find(vel => vel.getType() === ref.type &&
                vel.getS('name').toLowerCase() === ref?.lookByName?.toLowerCase() && !vel.getS('is_bg_velement_id').length)
        } else if (ref.lookByAbsolute) {
            /* `the short id of cd btn 2` */
            let arr = parentCd.parts.filter(vel => vel.getType() === ref.type&& !vel.getS('is_bg_velement_id').length);
            return arr[ref.lookByAbsolute - 1];
        } else if (ref.lookByRelative) {
            /* `the short id of first cd btn` */
            let arr = parentCd.parts.filter(vel => vel.getType() === ref.type&& !vel.getS('is_bg_velement_id').length);
            let index = findPositionFromOrdinalOrPosition(ref.lookByRelative, 0, 0, arr.length-1)
            return index === undefined ? undefined : arr[index]
        } else {
            checkThrow(false, 'T,|unknown object reference');
        }
    }

    /**
     * count number of elements
     * pretty limited, since we only support what the original product supported
     */
    countElements(type: VpcElType, parentRef: RequestedVelRef, cardHistory: RememberHistory) {
        let countMarked = parentRef.cardLookAtMarkedOnly
        parentRef.cardLookAtMarkedOnly = false
        let parent = this.go(parentRef, undefined, undefined, cardHistory)
        if (type === VpcElType.Product) {
            return 1
        } else if (type === VpcElType.Stack) {
            return 1
        } else if (type === VpcElType.Bg) {
            /* ensure parent exists and is a stack */
            cast(VpcElStack, parent)
            return this.model.stack.bgs.length
        } else if (type === VpcElType.Card) {
            if (parent instanceof VpcElStack) {
                let arr = parent.getCardOrder()
                if (countMarked) {
                    let cds = arr.map(id=>this.model.findByIdUntyped(id)).filter(cd=>cd?.getB('marked'))
                    return cds.length
                } else {
                    return arr.length
                }
            } else if (parent instanceof VpcElBg) {
                let arr = parent.cards
                if (countMarked) {
                    let cds = arr.filter(cd=>cd.getB('marked'))
                    return cds.length
                } else {
                    return arr.length
                }
            } else {
                checkThrow(false, "unknown parent type")
            }
        } else if (type === VpcElType.Btn || type === VpcElType.Fld) {
            if (parent instanceof VpcElBg) {
                let arr = parent.getTemplateCard().parts.filter(vel=>vel.getType() === type && vel.getS('is_bg_velement_id').length)
                return arr.length
            } else if (parent instanceof VpcElCard) {
                let arr = parent.parts.filter(vel=>vel.getType() === type && !vel.getS('is_bg_velement_id').length)
                return arr.length
            } else {
                checkThrow(false, "unexpected parent type")
            }
        } else {
            checkThrow(false, "unknown type")
        }
    }
}

