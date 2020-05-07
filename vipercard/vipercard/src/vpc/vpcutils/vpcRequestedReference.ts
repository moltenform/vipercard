
/* auto */ import { VpcIntermedValBase } from './vpcVal';
/* auto */ import { OrdinalOrPosition, VpcElType } from './vpcEnums';
/* auto */ import { RequestedChunk } from './vpcChunkResolution';
/* auto */ import { O, checkIsProductionBuild } from './../../ui512/utils/util512Base';
/* auto */ import { assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { UI512Gettable, UI512PublicSettable } from './../../ui512/elements/ui512ElementGettable';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * a script is requesting a reference to a vel element.
 * e.g. cd fld id 1234, or
 * cd btn "c" of second cd of bg "myBg"
 *
 * note that bg fld 1 of cd 2 is not the same as bg fld 1 of cd 3,
 * if it was accessed via different card it can change the meaning.
 *
 * the vel might or might not exist, it hasn't been
 * "resolved", by _velResolveReference_.
 */
export class RequestedVelRef extends VpcIntermedValBase {
    type: VpcElType;
    lookById: O<number>;
    lookByName: O<string>;
    lookByRelative: O<OrdinalOrPosition>;
    lookByAbsolute: O<number>;
    parentCdInfo: O<RequestedVelRef>;
    parentBgInfo: O<RequestedVelRef>;
    parentStackInfo: O<RequestedVelRef>;
    partIsBg = false;
    partIsCd = false;
    isReferenceToMe = false;
    isReferenceToTarget = false;
    cardLookAtMarkedOnly = false;
    cardIsRecentHistory = '';
    constructor(type: VpcElType) {
        super();
        this.type = type;
    }

    /**
     * should only have one specified
     */
    checkOnlyOneSpecified() {
        if (!checkIsProductionBuild()) {
            let total = 0
            if (this.lookByAbsolute) {
                total += 1
            }
            if (this.lookById) {
                total += 1
            }
            if (this.lookByName) {
                total += 1
            }
            if (this.lookByRelative) {
                total += 1
            }

            assertWarn(total <= 1, "too many specified")
        }
    }
}

/**
 * a script is requesting a reference to a container
 * maybe a variable or a field.
 * the container might or might not exist, it hasn't been resolved
 */
export class RequestedContainerRef extends VpcIntermedValBase {
    vel: O<RequestedVelRef>;
    variable: O<string>;
    chunk: O<RequestedChunk>;
}

/**
 * type of property.
 * string, numeric (integer), or boolean
 */
export enum PrpTyp {
    __isUI512Enum = 1,
    Str,
    Num,
    Bool
}

/**
 * a vel prop-getter can be either a
 * string (1-1 map from vel property to ui512el property)
 * or a
 * function (dynamic code to retrieve the property)
 */
export type PropGetter<T extends UI512Gettable> = [PrpTyp, string | ((me: T, cardId: string) => string | number | boolean)];

/**
 * a vel prop-setter can be either a
 * string (1-1 map from vel property to ui512el property)
 * or a
 * function (dynamic code to set the property)
 */
export type PropSetter<T extends UI512PublicSettable> = [
    PrpTyp,
    string | ((me: T, v: string | number | boolean, cardId: string) => void)
];
