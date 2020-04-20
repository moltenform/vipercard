
/* auto */ import { VpcStateInterface } from './vpcInterface';
/* auto */ import { VpcElType, checkThrow, checkThrowEq } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { SerializedVelStructure, SerializedVpcDocStructure, VpcGettableSerialization } from './../../vpc/vel/velSerialization';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { O, UI512Compress, vpcVersion } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn, ensureDefined } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
        let ret = new SerializedVpcDocStructure();
        ret.product = 'vpc';
        ret.fileformatmajor = this.latestMajor;
        ret.fileformatminor = this.latestMinor;
        ret.buildnumber = vpcVersion;
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
        let ret = new SerializedVelStructure();
        ret.type = vel.getType();
        ret.id = vel.id;
        ret.parent_id = vel.parentId;

        ret.attrs = VpcGettableSerialization.serializeGettable(vel);
        return ret;
    }

    /**
     * deserialize an entire project, from a plain JSON object
     */
    deserializeAll(building: VpcStateInterface, incoming: SerializedVpcDocStructure) {
        building.doWithoutAbilityToUndo(() => {
            checkThrowEq('vpc', incoming.product, 'K |');
            checkThrow(incoming.fileformatmajor <= this.latestMajor, 'Kz|file comes from a future version, cannot open');
            console.log(
                `opening a document format ${incoming.fileformatmajor}.
                ${incoming.fileformatminor}, my version is
                ${this.latestMajor}.${this.latestMinor}`
            );
            console.log(
                longstr(`opening a document made by
                buildnumber ${incoming.buildnumber}, my buildnumber is ${vpcVersion}`)
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
    deserializeVel(building: VpcStateInterface, incoming: SerializedVelStructure) {
        if (incoming.type === VpcElType.Stack) {
            /* don't create a new element, just copy over the attrs */
            VpcGettableSerialization.deserializeSettable(building.getModel().stack, incoming.attrs);
        } else if (
            incoming.type === VpcElType.Bg ||
            incoming.type === VpcElType.Card ||
            incoming.type === VpcElType.Btn ||
            incoming.type === VpcElType.Fld
        ) {
            let created = building.createVel(incoming.parent_id, incoming.type, -1, incoming.id);
            VpcGettableSerialization.deserializeSettable(created, incoming.attrs);
        } else {
            assertWarn(false, 'Kx|unsupported type', incoming.type);
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

        return ensureDefined(created, 'Kv|');
    }
}
