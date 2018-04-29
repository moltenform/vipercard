
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase, assertThrows } from '../../ui512/utils/utilsTest.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { ElementObserverNoOp } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { VpcValBool } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcUI512Serialization } from '../../vpc/vel/velSerialization.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack, VpcElStackLineageEntry } from '../../vpc/vel/velStack.js';
/* auto */ import { WritableContainerVar } from '../../vpc/vel/velResolveContainer.js';
/* auto */ import { MockOutsideWorld } from '../../test/vpc/vpcTestChunkResolution.js';

/**
 * tests on FormattedText
 */
let mTests: (string | Function)[] = [
    'testChangeToSingleLine.Should Preserve Text That Is Already One Line',
    () => {
        let vel = new VpcElField('id1', 'parentid1');
        vel.observer = new ElementObserverNoOp();
        vel.setFmTxt(FormattedText.newFromUnformatted('abc'));
        vel.setProp('singleline', VpcValBool(false));
        assertEq('abc', vel.getFmTxt().toUnformatted(), '');
        vel.setProp('singleline', VpcValBool(true));
        assertEq('abc', vel.getFmTxt().toUnformatted(), '');
    },
    'testChangeToSingleLine.making it single line should kill the other line',
    () => {
        let vel = new VpcElField('id1', 'parentid1');
        vel.observer = new ElementObserverNoOp();
        vel.setFmTxt(FormattedText.newFromUnformatted('abcd\ndef'));
        vel.setProp('singleline', VpcValBool(false));
        assertEq('abcd\ndef', vel.getFmTxt().toUnformatted(), '');
        vel.setProp('singleline', VpcValBool(true));
        assertEq('abcd', vel.getFmTxt().toUnformatted(), '');
    },
    'testChangeToSingleLine.making it single line should kill all the other lines',
    () => {
        let vel = new VpcElField('id1', 'parentid1');
        vel.observer = new ElementObserverNoOp();
        vel.setFmTxt(FormattedText.newFromUnformatted('a\nb\nc\nd'));
        vel.setProp('singleline', VpcValBool(false));
        assertEq('a\nb\nc\nd', vel.getFmTxt().toUnformatted(), '');
        vel.setProp('singleline', VpcValBool(true));
        assertEq('a', vel.getFmTxt().toUnformatted(), '');
    },
    'testVpcElButton.should translate style names for script',
    () => {
        let vel = new VpcElButton('id1', 'parentid1');
        vel.observer = new ElementObserverNoOp();
        vel.set('style', UI512BtnStyle.Rectangle);
        assertEq('rectangle', vel.getProp('style').readAsString(), '');
        vel.set('style', UI512BtnStyle.Checkbox);
        assertEq('checkbox', vel.getProp('style').readAsString(), '');
        vel.set('style', UI512BtnStyle.OSStandard);
        assertEq('standard', vel.getProp('style').readAsString(), '');
        vel.set('style', UI512BtnStyle.OSDefault);
        assertEq('default', vel.getProp('style').readAsString(), '');
    },
    'testWritableContainerVar.setAll',
    () => {
        let world = new MockOutsideWorld();
        let writer = new WritableContainerVar(world.getMock(), 'varName');
        writer.setAll('abc');
        assertEq('abc', writer.getRawString(), '');
        assertEq('abc', world.result, '');
        writer.setAll('def');
        assertEq('def', writer.getRawString(), '');
        assertEq('def', world.result, '');
    },
    'testWritableContainerVar.splice',
    () => {
        let world = new MockOutsideWorld();
        let writer = new WritableContainerVar(world.getMock(), 'varName');

        /* 2 chars -> 0 chars */
        writer.setAll('abcde');
        writer.splice(1, 2, '');
        assertEq('ade', writer.getRawString(), '');

        /* 2 chars -> 1 char */
        writer.setAll('abcde');
        writer.splice(1, 2, 'x');
        assertEq('axde', writer.getRawString(), '');

        /* 2 chars -> 2 chars */
        writer.setAll('abcde');
        writer.splice(1, 2, 'xy');
        assertEq('axyde', writer.getRawString(), '');

        /* 2 chars -> 3 chars */
        writer.setAll('abcde');
        writer.splice(1, 2, 'xyz');
        assertEq('axyzde', writer.getRawString(), '');

        /* add 3 chars */
        writer.setAll('abcde');
        writer.splice(1, 0, 'xyz');
        assertEq('axyzbcde', writer.getRawString(), '');
    },
    'testVpcElStackLineageEntry.Construct',
    () => {
        assertThrows('', 'empty', () => new VpcElStackLineageEntry(undefined as any, 'stackGuid', 'stackName'));
        assertThrows('', 'empty', () => new VpcElStackLineageEntry('', 'stackGuid', 'stackName'));
        assertThrows('', 'empty', () => new VpcElStackLineageEntry('owner', undefined as any, 'stackName'));
        assertThrows('', 'empty', () => new VpcElStackLineageEntry('owner', '', 'stackName'));
        assertThrows('', 'empty', () => new VpcElStackLineageEntry('owner', 'stackGuid', undefined as any));
        assertThrows('', 'empty', () => new VpcElStackLineageEntry('owner', 'stackGuid', ''));
        assertThrows('', 'contain', () => new VpcElStackLineageEntry('owner|', 'stackGuid', 'stackName'));
        assertThrows('', 'contain', () => new VpcElStackLineageEntry('owner', 'stackGuid|', 'stackName'));
        assertThrows('', 'contain', () => new VpcElStackLineageEntry('owner', 'stackGuid', 'stackName|'));
    },
    'testVpcElStackLineageEntry.Serialize',
    () => {
        let entry = new VpcElStackLineageEntry('owner', 'guid', 'name');
        let got = entry.serialize();
        assertEq('owner|guid|name', got, '');
    },
    'testVpcElStackLineageEntry.Deserialize',
    () => {
        let restored = VpcElStackLineageEntry.fromSerialized('owner|guid|name');
        assertEq('owner', restored.stackOwner, '');
        assertEq('guid', restored.stackGuid, '');
        assertEq('name', restored.stackName, '');
        assertThrows('', 'invalid', () => VpcElStackLineageEntry.fromSerialized(''));
        assertThrows('', 'invalid', () => VpcElStackLineageEntry.fromSerialized('owner|guid'));
        assertThrows('', 'invalid', () => VpcElStackLineageEntry.fromSerialized('1|2|3|4'));
    },
    'testVpcElStackLineage',
    () => {
        let vel = new VpcElStack('12', '34');
        vel.observer = new ElementObserverNoOp();
        assertThrows('', 'be empty', () => vel.getLatestStackLineage());
        assertEq('', vel.getS('stacklineage'), '');

        let entry = new VpcElStackLineageEntry('o1', 'g1', 'n1');
        vel.appendToStackLineage(entry);
        assertEq('o1|g1|n1', vel.getLatestStackLineage().serialize(), '');
        assertEq('o1|g1|n1', vel.getS('stacklineage'), '');

        entry = new VpcElStackLineageEntry('o2', 'g2', 'n2');
        vel.appendToStackLineage(entry);
        assertEq('o2|g2|n2', vel.getLatestStackLineage().serialize(), '');
        assertEq('o1|g1|n1||o2|g2|n2', vel.getS('stacklineage'), '');

        entry = new VpcElStackLineageEntry('o3', 'g3', 'n3');
        vel.appendToStackLineage(entry);
        assertEq('o3|g3|n3', vel.getLatestStackLineage().serialize(), '');
        assertEq('o1|g1|n1||o2|g2|n2||o3|g3|n3', vel.getS('stacklineage'), '');
    },
    'testSerializeGettable',
    () => {
        for (let b of [true, false]) {
            let vel = new VpcElField('id1', 'parentid1');
            vel.observer = new ElementObserverNoOp();

            vel.setFmTxt(FormattedText.newFromUnformatted('abc'));
            vel.set('dontwrap', b);
            vel.set('enabled', !b);
            vel.set('locktext', b);
            vel.set('singleline', !b);
            vel.set('visible', b);
            vel.set('selcaret', b ? 100 : 200);
            vel.set('selend', !b ? 100 : 200);
            vel.set('scroll', b ? 100 : 200);
            vel.set('style', !b ? 100 : 200);
            vel.set('script', 'def');
            vel.set('textalign', 'ghi');
            vel.set('name', 'jkl');

            let serialized = VpcUI512Serialization.serializeGettable(vel, vel.getKeyPropertiesList());
            let restored = new VpcElField('id1', 'parentid1');
            restored.observer = new ElementObserverNoOp();
            let s = JSON.stringify(serialized);
            let restoredJson = JSON.parse(s);
            VpcUI512Serialization.deserializeSettable(restored, restored.getKeyPropertiesList(), restoredJson);

            assertEq('abc', restored.getFmTxt().toUnformatted(), '');
            assertEq(b, restored.getB('dontwrap'), '');
            assertEq(!b, restored.getB('enabled'), '');
            assertEq(b, restored.getB('locktext'), '');
            assertEq(!b, restored.getB('singleline'), '');
            assertEq(b, restored.getB('visible'), '');
            assertEq(b ? 100 : 200, restored.getN('selcaret'), '');
            assertEq(!b ? 100 : 200, restored.getN('selend'), '');
            assertEq(b ? 100 : 200, restored.getN('scroll'), '');
            assertEq(!b ? 100 : 200, restored.getN('style'), '');
            assertEq('def', restored.getS('script'), '');
            assertEq('ghi', restored.getS('textalign'), '');
            assertEq('jkl', restored.getS('name'), '');
        }
    },
    'testVpcElements.Properties for serialization should include all member vars starting with _',
    () => {
        TestVpcElements.testKeyProperties(VpcElButton);
        TestVpcElements.testKeyProperties(VpcElField);
        TestVpcElements.testKeyProperties(VpcElCard);
        TestVpcElements.testKeyProperties(VpcElBg);
        TestVpcElements.testKeyProperties(VpcElStack);
    }
];

/**
 * exported test class for mTests
 */
export class TestVpcElements extends UI512TestBase {
    tests = mTests;

    /**
     * Properties for serialization should include all member vars starting with _
     */
    static testKeyProperties<T extends VpcElBase>(ctor: { new (...args: any[]): T }) {
        let instance = new ctor('id1', 'parentid1');
        let expected = instance.getKeyPropertiesList();
        let got: string[] = [];
        for (let key in instance) {
            if (Object.prototype.hasOwnProperty.call(instance, key)) {
                if (key.startsWith('_') && !key.startsWith('__')) {
                    got.push(key.substr(1));
                }
            }
        }

        expected.sort();
        got.sort();
        assertEq(expected, got, '');
    }
}
