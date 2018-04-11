
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { OrdinalOrPosition, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcIntermedValBase } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { RequestedChunk } from '../../vpc/vpcutils/vpcChunk.js';

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

    // no other information specified other than "this card" or "this stack"
    onlyThisSpecified() {
        return (
            this.lookById === undefined &&
            this.lookByName === undefined &&
            this.lookByAbsolute === undefined &&
            (!this.lookByRelative || this.lookByRelative === OrdinalOrPosition.this)
        );
    }
}

export class RequestedContainerRef extends VpcIntermedValBase {
    isRequestedContainerRef = true;
    vel: O<RequestedVelRef>;
    variable: O<string>;
    chunk: O<RequestedChunk>;
}
