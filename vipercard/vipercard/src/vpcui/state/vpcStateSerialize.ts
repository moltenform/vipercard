
/* auto */ import { vpcversion } from '../../config.js';
/* auto */ import { O, UI512Compress, assertTrue, assertTrueWarn, checkThrow, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { anyJson, checkThrowEq } from '../../ui512/utils/utils512.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcGettableSerialization } from '../../vpc/vel/velSerialization.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';

/**
 * from a stack to a plain JSON object, and vice-versa
 */
export class VpcStateSerialize {
    readonly latestMajor = 3;
    readonly latestMinor = 0;

    /**
     * serialize an entire project, to a plain JSON object
     *
     * fileformatmajor 1, not released to public
     * fileformatmajor 2, initial March release
     * fileformatmajor 3, supports base64
     */
    serializeAll(vci: VpcStateInterface) {
        let ret: anyJson = {};
        ret.product = 'vpc';
        ret.fileformatmajor = this.latestMajor;
        ret.fileformatminor = this.latestMinor;
        ret.buildnumber = vpcversion;
        ret.uuid = vci.getModel().uuid;
        ret.elements = [];
        let stack = vci.getModel().stack;
        for (let vel of stack.iterEntireStack()) {
            let serialized = this.serializeVel(vel);
            ret.elements.push(serialized);
        }

        return ret;
    }

    /**
     * serialize a vel
     */
    serializeVel(vel: VpcElBase) {
        let ret: anyJson = {};
        ret.type = vel.getType();
        ret.id = vel.id;
        ret.parent_id = vel.parentId;

        ret.attrs = VpcGettableSerialization.serializeGettable(vel);
        return ret;
    }

    /**
     * deserialize an entire project, from a plain JSON object
     */
    deserializeAll(building: VpcStateInterface, incoming: anyJson) {
        building.doWithoutAbilityToUndo(() => {
            checkThrowEq('vpc', incoming.product, 'K |');
            checkThrow(
                incoming.fileformatmajor <= this.latestMajor,
                'Kz|file comes from a future version, cannot open'
            );
            console.log(
                `opening a document format ${incoming.fileformatmajor}.${incoming.fileformatminor},
                my version is ${this.latestMajor}.${this.latestMinor}`
            );
            console.log(
                `opening a document made by buildnumber ${incoming.buildnumber}, my buildnumber is ${vpcversion}`
            );

            building.getModel().uuid = incoming.uuid;
            checkThrow(incoming.elements && incoming.elements.length > 0, 'Ky|elements missing or empty');
            for (let i = 0; i < incoming.elements.length; i++) {
                this.deserializeVel(building, incoming.elements[i]);
            }
        });
    }

    /**
     * deserialize a vel, from a plain JSON object
     */
    deserializeVel(building: VpcStateInterface, incoming: anyJson) {
        if (incoming.type === VpcElType.Stack) {
            /* don't create a new element, just copy over the attrs */
            VpcGettableSerialization.deserializeSettable(
                building.getModel().stack,
                incoming.attrs
            );
        } else if (
            incoming.type === VpcElType.Bg ||
            incoming.type === VpcElType.Card ||
            incoming.type === VpcElType.Btn ||
            incoming.type === VpcElType.Fld
        ) {
            let created = building.createVel(incoming.parent_id, incoming.type, -1, incoming.id);
            VpcGettableSerialization.deserializeSettable(created, incoming.attrs);
        } else {
            assertTrueWarn(false, 'Kx|unsupported type', incoming.type);
        }
    }

    /**
     * serialize to a string and compress
     */
    serializeVelCompressed(building: VpcStateInterface, vel: VpcElBase, insertIndex: number): string {
        let s = '';
        building.doWithoutAbilityToUndoExpectingNoChanges(() => {
            let obj = this.serializeVel(vel);
            obj.insertIndex = insertIndex;
            s = JSON.stringify(obj);
        });

        return UI512Compress.compressString(s);
    }

    /**
     * deserialize from serializeVelCompressed
     */
    deserializeVelCompressed(building: VpcStateInterface, s: string): VpcElBase {
        let created: O<VpcElBase>;
        building.doWithoutAbilityToUndo(() => {
            s = UI512Compress.decompressString(s);
            let incoming = JSON.parse(s);
            assertTrue(
                incoming.type === VpcElType.Bg ||
                    incoming.type === VpcElType.Card ||
                    incoming.type === VpcElType.Btn ||
                    incoming.type === VpcElType.Fld,
                'Kw|unexpected type',
                incoming.type
            );

            created = building.createVel(incoming.parent_id, incoming.type, incoming.insertIndex, incoming.id);
            VpcGettableSerialization.deserializeSettable(created, incoming.attrs);
        });

        return throwIfUndefined(created, 'Kv|');
    }
}
