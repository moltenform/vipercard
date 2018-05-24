
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512Gettable, UI512Settable } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { OrdinalOrPosition, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcIntermedValBase } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { RequestedChunk } from '../../vpc/vpcutils/vpcChunkResolution.js';

/**
 * a script is requesting a reference to a vel element.
 * e.g. cd fld id 1234, or
 * cd btn "c" of second cd of bg "myBg"
 *
 * the vel might or might not exist, it hasn't been
 * "resolved", by _velResolveReference_.
 */
export class RequestedVelRef extends VpcIntermedValBase {
    isRequestedVelRef = true;
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
    isReferenceToTarget = false;
    isReferenceToMe = false;
    constructor(type: VpcElType) {
        super();
        this.type = type;
    }

    /**
     * does the reference only refer to this.
     * e.g. "this card" or "this stack"
     */
    onlyThisSpecified() {
        return (
            this.lookById === undefined &&
            this.lookByName === undefined &&
            this.lookByAbsolute === undefined &&
            (!this.lookByRelative || this.lookByRelative === OrdinalOrPosition.This)
        );
    }
}

/**
 * a script is requesting a reference to a container
 * maybe a variable or a field.
 * the container might or might not exist, it hasn't been resolved
 */
export class RequestedContainerRef extends VpcIntermedValBase {
    isRequestedContainerRef = true;
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
export type PropSetter<T extends UI512Settable> = [PrpTyp, string | ((me: T, v: string | number | boolean, cardId: string) => void)];
