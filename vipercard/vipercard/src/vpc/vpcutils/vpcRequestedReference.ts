
/* auto */ import { VpcIntermedValBase } from './vpcVal';
/* auto */ import { OrdinalOrPosition, VpcElType } from './vpcEnums';
/* auto */ import { RequestedChunk } from './vpcChunkResolutionInternal';
/* auto */ import { O, checkIsProductionBuild } from './../../ui512/utils/util512Base';
/* auto */ import { assertWarn } from './../../ui512/utils/util512Assert';

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
            let total = 0;
            if (this.lookByAbsolute !== undefined) {
                total += 1;
            }
            if (this.lookById !== undefined) {
                total += 1;
            }
            if (this.lookByName !== undefined) {
                total += 1;
            }
            if (this.lookByRelative !== undefined) {
                total += 1;
            }

            assertWarn(total <= 1, 'too many specified');
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
