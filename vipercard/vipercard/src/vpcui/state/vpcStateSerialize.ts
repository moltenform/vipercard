
/* auto */ import { VpcStateInterface } from './vpcInterface';
/* auto */ import { VpcElType, checkThrow, checkThrowEq } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { SerializedVelStructure, SerializedVpcDocStructure, VpcGettableSerialization } from './../../vpc/vel/velSerialization';
/* auto */ import { VpcElBase, VpcHandleLinkedVels } from './../../vpc/vel/velBase';
/* auto */ import { O, UI512Compress, vpcVersion } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn, ensureDefined } from './../../ui512/utils/util512Assert';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * from a stack to a plain JSON object, and vice-versa
 */
export const VpcStateSerialize = /* static class */ {
    latestMajor: 3,
    latestMinor: 0,
    /**
     * serialize an entire project, to a plain JSON object
     *
     * fileformatmajor 1, not released to public
     * fileformatmajor 2, initial March release
     * fileformatmajor 3, supports base64
     *
     * a change in major number means that a previous version
     * won't be able to open the document
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
        let i = 0;
        for (let vel of stack.iterEntireStack()) {
            let serialized = this.serializeVel(vel, i);
            ret.elements.push(serialized);
            i += 1;
        }

        return ret;
    },

    /**
     * serialize a vel
     */
    serializeVel(vel: VpcElBase, i: number): SerializedVelStructure {
        let ret = new SerializedVelStructure();
        ret.type = vel.getType();
        ret.id = vel.idInternal;
        ret.parent_id = vel.parentIdInternal;
        ret.insertIndex = i;

        ret.attrs = VpcGettableSerialization.serializeGettable(vel);

        /* remove unnecessary noise */
        delete ret['__isUtil512Serializable'];
        return ret;
    },

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

            building.getModel().uuid = incoming.uuid;
            checkThrow(incoming.elements && incoming.elements.length > 0, 'Ky|elements missing or empty');
            let savedCardOrder = '';
            for (let i = 0; i < incoming.elements.length; i++) {
                let vel = this.deserializeVel(building, incoming.elements[i], building.getModel());
                if (vel && vel.getType() === VpcElType.Stack) {
                    savedCardOrder = vel.getS('cardorder');
                }
            }

            /* we need to save and restore card order, or opening a stack will double it */
            if (savedCardOrder) {
                building.getModel().stack.setOnVel('cardorder', savedCardOrder, building.getModel());
            }
        });
    },

    /**
     * deserialize a vel, from a plain JSON object
     */
    deserializeVel(vci: VpcStateInterface, incoming: SerializedVelStructure, h: VpcHandleLinkedVels) {
        if (incoming.type === VpcElType.Stack) {
            /* the parent of a stack is always the product opts */
            incoming.parent_id = vci.getModel().productOpts.idInternal;
            /* don't create a new element, just copy over the attrs */
            VpcGettableSerialization.deserializeSettable(vci.getModel().stack, incoming.attrs, h);
            return vci.getModel().stack;
        } else if (
            incoming.type === VpcElType.Bg ||
            incoming.type === VpcElType.Card ||
            incoming.type === VpcElType.Btn ||
            incoming.type === VpcElType.Fld
        ) {
            /* the parent of a bg is always the stack */
            if (incoming.type === VpcElType.Bg) {
                incoming.parent_id = vci.getModel().stack.idInternal;
            }

            let creator = vci.getCodeExec().directiveImpl;
            let newVel = creator.rawCreateOneVelUseCarefully(incoming.parent_id, incoming.type, -1, incoming.id);
            VpcGettableSerialization.deserializeSettable(newVel, incoming.attrs, h);
            return newVel;
        } else {
            assertWarn(false, 'Kx|unsupported type', incoming.type);
            return undefined;
        }
    },

    /**
     * serialize to a string and compress
     */
    serializeVelCompressed(building: VpcStateInterface, vel: VpcElBase, insertIndex: number): string {
        let s = '';
        building.doWithoutAbilityToUndoExpectingNoChanges(() => {
            let obj = this.serializeVel(vel, insertIndex);
            s = JSON.stringify(obj);
        });

        return UI512Compress.compressString(s);
    },

    /**
     * deserialize from serializeVelCompressed
     */
    deserializeVelCompressed(vci: VpcStateInterface, s: string, h: VpcHandleLinkedVels): VpcElBase {
        let created: O<VpcElBase>;
        vci.doWithoutAbilityToUndo(() => {
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

            let creator = vci.getCodeExec().directiveImpl;
            let newVel = creator.rawCreateOneVelUseCarefully(incoming.parent_id, incoming.type, -1, incoming.id);
            VpcGettableSerialization.deserializeSettable(newVel, incoming.attrs, h);
        });

        return ensureDefined(created, 'Kv|');
    }
};
