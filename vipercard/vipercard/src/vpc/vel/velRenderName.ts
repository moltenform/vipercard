
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { OrdinalOrPosition, PropAdjective, VpcElType, checkThrow, vpcElTypeShowInUI } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './velStack';
/* auto */ import { VpcElProductOpts } from './velProductOpts';
/* auto */ import { VpcModelTop } from './velModelTop';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { VpcElButton } from './velButton';
/* auto */ import { VpcElBg } from './velBg';
/* auto */ import { VpcElBase } from './velBase';
/* auto */ import { cProductName } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, castVerifyIsStr, findStrToEnum, getEnumToStrOrFallback, getStrToEnum } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * when a script asks for the name of an object
 * put the long name of cd btn "myBtn" into x
 */
export class VelRenderName {
    constructor(protected model: VpcModelTop) {}

    /**
     * get the name
     */
    go(vel: VpcElBase, adjective: PropAdjective): string {
        let type = vel.getType();
        let methodName = 'goResolveName' + Util512.capitalizeFirst(getEnumToStrOrFallback(VpcElType, type));
        return castVerifyIsStr(Util512.callAsMethodOnClass(VelRenderName.name, this, methodName, [vel, adjective], false));
    }

    /**
     * re-use logic for buttons and fields
     */
    protected goResolveNameBtn(vel: VpcElButton, adjective: PropAdjective) {
        checkThrow(vel instanceof VpcElButton, 'J[|');
        return this.goResolveBtnOrFld(vel, adjective);
    }

    /**
     * re-use logic for buttons and fields
     */
    protected goResolveNameFld(vel: VpcElField, adjective: PropAdjective) {
        checkThrow(vel instanceof VpcElField, 'J@|');
        return this.goResolveBtnOrFld(vel, adjective);
    }

    /**
     * get the name of a button or field
     */
    protected goResolveBtnOrFld(vel: VpcElButton | VpcElField, adjective: PropAdjective) {
        let typ = vel.getType() === VpcElType.Btn ? 'button' : 'field';
        let name = vel.getS('name');
        let cdOrBg = vel.getS('is_bg_velement_id').length ? 'bkgnd' : 'card';
        if (name.length) {
            /* name exists, show the name */
            if (adjective === PropAdjective.Long) {
                let parent = this.model.getCardById(vel.parentIdInternal);
                return `${cdOrBg} ${typ} "${name}" of ${this.goResolveNameCard(parent, adjective)}`;
            } else if (adjective === PropAdjective.Short) {
                return `${name}`;
            } else {
                return `${cdOrBg} ${typ} "${name}"`;
            }
        } else {
            /* no name, fall back to showing the id */
            let userFacingId = vel.getUserFacingId();
            if (adjective === PropAdjective.Long) {
                let parent = this.model.getCardById(vel.parentIdInternal);
                return `${cdOrBg} ${typ} id ${userFacingId} of ${this.goResolveNameCard(parent, adjective)}`;
            } else {
                return `${cdOrBg} ${typ} id ${userFacingId}`;
            }
        }
    }

    /**
     * get the name of a card
     */
    protected goResolveNameCard(vel: VpcElCard, adjective: PropAdjective): string {
        checkThrow(vel instanceof VpcElCard, 'J>|');
        let name = vel.getS('name');
        let stname = this.model.stack.getS('name');
        if (name.length) {
            /* name exists, show the name */
            if (adjective === PropAdjective.Long) {
                return `card "${name}" of stack "${stname}"`;
            } else if (adjective === PropAdjective.Short) {
                return `${name}`;
            } else {
                return `card "${name}"`;
            }
        } else {
            /* no name, fall back to showing the id */
            if (adjective === PropAdjective.Long) {
                return `card id ${vel.getUserFacingId()} of stack "${stname}"`;
            } else {
                return `card id ${vel.getUserFacingId()}`;
            }
        }
    }

    /**
     * get the name of a background
     */
    protected goResolveNameBg(vel: VpcElBg, adjective: PropAdjective) {
        checkThrow(vel instanceof VpcElBg, 'J=|');
        let name = vel.getS('name');
        let stname = this.model.stack.getS('name');
        if (name.length) {
            /* name exists, show the name */
            if (adjective === PropAdjective.Long) {
                return `bkgnd "${name}" of stack "${stname}"`;
            } else if (adjective === PropAdjective.Short) {
                return `${name}`;
            } else {
                return `bkgnd "${name}"`;
            }
        } else {
            /* no name, fall back to showing the id */
            if (adjective === PropAdjective.Long) {
                return `bkgnd id ${vel.getUserFacingId()} of stack "${stname}"`;
            } else {
                return `bkgnd id ${vel.getUserFacingId()}`;
            }
        }
    }

    /**
     * get the name of a stack.
     * made compatible with original product.
     * we don't return 'stack id x' because original product never did that.
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
     * fun fact, in emulator the "long name" of product would return filepath of the app
     */
    protected goResolveNameProduct(vel: VpcElProductOpts, adjective: PropAdjective) {
        checkThrow(vel instanceof VpcElProductOpts, 'J;|');
        if (adjective === PropAdjective.Long) {
            return `Hard Drive:${cProductName}"`;
        } else {
            return `${cProductName}`;
        }
    }
}

/**
 * when a script asks for the id of an object
 * put the long name of cd btn "myBtn" into x
 */
export class VelRenderId {
    constructor(protected model: VpcModelTop) {}

    /**
     * get the id
     */
    go(vel: VpcElBase, adjective: PropAdjective, compatMode: boolean) {
        if (vel instanceof VpcElCard) {
            return this.goCard(vel, adjective);
        } else if (vel instanceof VpcElProductOpts) {
            return this.goProduct(vel, adjective);
        } else {
            return this.goOtherTypes(vel, adjective, compatMode);
        }
    }

    /**
     * matching the emulator's behavior. fascinating.
     */
    protected goProduct(vel: VpcElProductOpts, adjective: PropAdjective) {
        return 'WILD';
    }

    /**
     * confirmed in emulator that id of card is inconsistent,
     * and more verbose than other objects
     */
    protected goCard(vel: VpcElCard, adjective: PropAdjective) {
        let userFacingId = vel.getUserFacingId();
        if (adjective === PropAdjective.Short) {
            return userFacingId;
        } else if (adjective === PropAdjective.Long) {
            let stname = this.model.stack.getS('name');
            return `card id ${userFacingId} of stack "${stname}"`;
        } else {
            return `card id ${userFacingId}`;
        }
    }

    /**
     * the long id of a cd btn is the same as the short id of a cd btn
     */
    protected goOtherTypes(vel: VpcElBase, adjective: PropAdjective, compatMode: boolean) {
        let userFacingId = vel.getUserFacingId();
        if (adjective === PropAdjective.Long && !compatMode) {
            if (vel instanceof VpcElButton || vel instanceof VpcElField) {
                let cdOrBg = vel.getS('is_bg_velement_id').length ? 'bkgnd' : 'card';
                /* NOTE: this is ambiguous - for a bg object,
                it won't precisely identify the object.
                but this is the way the original product worked. */
                let s = `${cdOrBg} ${vpcElTypeShowInUI(vel.getType())} id ${userFacingId}`;
                if (!compatMode && vel.getS('is_bg_velement_id').length) {
                    /* this fixes the ambiguity */
                    let parent = this.model.getByIdUntyped(vel.parentIdInternal);
                    s += ` of cd id ${parent.getUserFacingId()}`;
                }

                return s;
            } else {
                return `${vpcElTypeShowInUI(vel.getType())} id ${userFacingId}`;
            }
        } else {
            return userFacingId;
        }
    }

    /**
     * go from "card id 123" back to a RequestedVelRef
     * an alternative would be to spin up the full parser/visitor and use it,
     * but that's awkward because we might be calling this from the visitor
     *
     * supports:
     *      at most one parent
     *      "this"
     *      lookup by id
     *      lookup by name
     *      but nothing more!
     *
     * what is most important is that it supports everything "the long id"
     * will render as!
     */
    static parseFromString(s: string) {
        s = s.trim();

        /* remove of this stack, of this bg */
        let sRemove = ' of this stack';
        if (s.endsWith(sRemove)) {
            s = s.substr(0, s.length - sRemove.length).trim();
        }
        sRemove = ' of this background';
        if (s.endsWith(sRemove)) {
            s = s.substr(0, s.length - sRemove.length).trim();
        }
        sRemove = ' of this bkgnd';
        if (s.endsWith(sRemove)) {
            s = s.substr(0, s.length - sRemove.length).trim();
        }
        sRemove = ' of this bg';
        if (s.endsWith(sRemove)) {
            s = s.substr(0, s.length - sRemove.length).trim();
        }
        sRemove = ' of this card';
        if (s.endsWith(sRemove)) {
            s = s.substr(0, s.length - sRemove.length).trim();
        }
        sRemove = ' of this cd';
        if (s.endsWith(sRemove)) {
            s = s.substr(0, s.length - sRemove.length).trim();
        }

        let ret = new RequestedVelRef(VpcElType.Unknown);
        let ptsStackParent = s.split(' of stack ');
        if (ptsStackParent.length === 2) {
            ret.parentStackInfo = VelRenderId.parseFromString('stack ' + ptsStackParent[1]);
            s = ptsStackParent[0];
        }
        let ptsBgParent = s.split(/ of (?:background|bkgnd|bg) /);
        if (ptsBgParent.length === 2) {
            ret.parentBgInfo = VelRenderId.parseFromString('bkgnd ' + ptsBgParent[1]);
            s = ptsBgParent[0];
        }
        let ptsCardParent = s.split(/ of (?:card|cd) /);
        if (ptsCardParent.length === 2) {
            ret.parentCdInfo = VelRenderId.parseFromString('card ' + ptsCardParent[1]);
            s = ptsCardParent[0];
        }

        /* by only splitting by single space we won't accept "this  stack"
        but we can also losslessly join by space later (to accept names with spaces) */
        let words = s.trim().split(/\s/);
        if (words.length === 2 && words[0] === 'this' && words[1] === 'stack') {
            ret.type = VpcElType.Stack;
            ret.lookByRelative = OrdinalOrPosition.This;
            return ret;
        } else if (words.length === 2 && words[0] === 'this' && findStrToEnum<VpcElType>(VpcElType, words[1]) === VpcElType.Bg) {
            ret.type = VpcElType.Bg;
            ret.lookByRelative = OrdinalOrPosition.This;
            return ret;
        } else if (
            words.length === 2 &&
            words[0] === 'this' &&
            findStrToEnum<VpcElType>(VpcElType, words[1]) === VpcElType.Card
        ) {
            ret.type = VpcElType.Card;
            ret.lookByRelative = OrdinalOrPosition.This;
            return ret;
        }

        let getType = (sIn: string) => {
            return getStrToEnum<VpcElType>(VpcElType, 'expected something like `card id 123`', sIn);
        };

        checkThrow(words.length >= 3, 'too short, expected something like `card id 123`');
        let isPartFld = findStrToEnum<VpcElType>(VpcElType, words[1]) === VpcElType.Fld;
        let isPartBtn = findStrToEnum<VpcElType>(VpcElType, words[1]) === VpcElType.Btn;
        if (isPartFld || isPartBtn) {
            let cdOrBg = getType(words[0]);
            if (cdOrBg === VpcElType.Card) {
                ret.partIsCd = true;
            } else if (cdOrBg === VpcElType.Bg) {
                ret.partIsBg = true;
            } else {
                checkThrow(false, 'expected something like `cd btn id 123`, got something like `stack btn id 123`');
            }

            /* remove the cd/bg prefix */
            words.splice(0, 1);
        }

        let realType = getType(words[0]);
        ret.type = realType;
        if (words[1] === 'id') {
            let theId = Util512.parseInt(words[2]);
            checkThrow(theId, 'Tz|invalid number. expected something like `card id 123`');
            ret.lookById = theId;
        } else {
            let restOfString = words.slice(1).join(' ');
            if (restOfString.startsWith('"') && restOfString.endsWith('"')) {
                ret.lookByName = restOfString.slice(1, -1);
            } else {
                checkThrow(false, 'expected either `cd id 123` or `cd "name"`');
            }
        }

        return ret;
    }
}

/**
 * the user asked "put the number of cd btn 'a' into x"
 */
export class VelGetNumberProperty {
    constructor(protected model: VpcModelTop) {}
    /**
     * get the number. note that the adjective is ignored, "long number" === "short number"
     */
    go(vel: VpcElBase) {
        if (vel instanceof VpcElStack) {
            /* emulator throws an error,
            but since we support 'stack 1' we may as well do this. */
            return 1
        } else if (vel instanceof VpcElProductOpts) {
            checkThrow(false, 'Tx|This type of object does not have a number.');
        } else {
            return this.goStandard(vel);
        }
    }

    /**
     * most objects exist in a list of siblings
     */
    goStandard(vel: VpcElBase) {
        let parentList: VpcElBase[] = [];
        if (vel.getType() === VpcElType.Bg) {
            let parent = this.model.getOwner(VpcElStack, vel);
            parentList = parent.bgs;
        } else if (vel.getType() === VpcElType.Card) {
            parentList = this.model.stack.getCardOrder().map(id => this.model.getByIdUntyped(id));
        } else if (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld) {
            let parent = this.model.getOwner(VpcElCard, vel);
            let isBg = vel.getS('is_bg_velement_id').length > 0;
            parentList = parent.parts.filter(
                e => e.getType() === vel.getType() && isBg === e.getS('is_bg_velement_id').length > 0
            );
        }

        checkThrow(parentList && parentList.length, 'Tu|parent list not found or empty');
        let index = parentList.findIndex(e => e.idInternal === vel.idInternal);
        checkThrow(index !== -1, 'Tt|object not found belonging to its parent');
        return index + 1; /* one-based indexing */
    }
}
