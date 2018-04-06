
/* auto */ import { vpcversion } from '../../config.js';
/* auto */ import { UI512Compress, assertTrue, assertTrueWarn, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { checkThrowEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcUI512Serialization } from '../../vpc/vel/velSerialize.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcInterface.js';

export class VpcSerialization {
    serializeAll(appli: IVpcStateInterface) {
        let ret: any = {};
        ret.product = 'vpc';
        ret.fileformatmajor = 2;
        ret.fileformatminor = 0;
        ret.buildnumber = vpcversion;
        ret.uuid = appli.getModel().modelUuid;
        ret.elements = [];
        let stack = appli.getModel().stack;
        for (let vel of stack.iterEntireStack()) {
            if (!VpcElBase.isActuallyMsgRepl(vel)) {
                let serialized = this.serializeVel(vel);
                ret.elements.push(serialized);
            }
        }

        return ret;
    }

    serializeVel(vel: VpcElBase) {
        let ret: any = {};
        ret.type = vel.getType();
        ret.id = vel.id;
        ret.parent_id = vel.parentId;
        ret.attrs = VpcUI512Serialization.serializeUiGettable(vel, vel.getAttributesList());
        return ret;
    }

    deserializeAll(building: IVpcStateInterface, incoming: any) {
        building.doWithoutAbilityToUndo(() => {
            checkThrowEq('vpc', incoming.product, '');
            checkThrowEq(2, incoming.fileformatmajor, 'file comes from a future version, cannot open');
            console.log(
                `opening a document format ${incoming.fileformatmajor}.${incoming.fileformatminor}, my version is 2.0`
            );
            console.log(
                `opening a document made by buildnumber ${incoming.buildnumber}, my buildnumber is ${vpcversion}`
            );
            building.getModel().modelUuid = incoming.uuid;
            checkThrow(incoming.elements && incoming.elements.length > 0, 'elements missing or empty');
            for (let i = 0; i < incoming.elements.length; i++) {
                this.deserializeVel(building, incoming.elements[i]);
            }
        });
    }

    deserializeVel(building: IVpcStateInterface, incoming: any) {
        if (incoming.type === VpcElType.Stack) {
            // we don't need to create a new element, just copy over the attrs
            VpcUI512Serialization.deserializeUiSettable(
                building.getModel().stack,
                building.getModel().stack.getAttributesList(),
                incoming.attrs
            );
        } else if (
            incoming.type === VpcElType.Bg ||
            incoming.type === VpcElType.Card ||
            incoming.type === VpcElType.Btn ||
            incoming.type === VpcElType.Fld
        ) {
            let created = building.createElem(incoming.parent_id, incoming.type, -1, incoming.id);
            VpcUI512Serialization.deserializeUiSettable(created, created.getAttributesList(), incoming.attrs);
        } else {
            assertTrueWarn(false, 'unsupported type', incoming.type);
        }
    }

    serializeVelCompressed(building: IVpcStateInterface, vel: VpcElBase, insertIndex: number): string {
        let s = '';
        building.doWithoutAbilityToUndoExpectingNoChanges(() => {
            let obj = this.serializeVel(vel);
            obj.insertIndex = insertIndex;
            s = JSON.stringify(obj);
        });
        return UI512Compress.compressString(s);
    }

    deserializeVelCompressed(building: IVpcStateInterface, s: string): VpcElBase {
        let created: VpcElBase = undefined as any;
        building.doWithoutAbilityToUndo(() => {
            s = UI512Compress.decompressString(s);
            let incoming = JSON.parse(s);
            assertTrue(
                incoming.type === VpcElType.Bg ||
                    incoming.type === VpcElType.Card ||
                    incoming.type === VpcElType.Btn ||
                    incoming.type === VpcElType.Fld,
                'bad type',
                incoming.type
            );
            created = building.createElem(incoming.parent_id, incoming.type, incoming.insertIndex, incoming.id);
            VpcUI512Serialization.deserializeUiSettable(created, created.getAttributesList(), incoming.attrs);
        });
        return created;
    }
}
