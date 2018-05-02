
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase, assertThrows } from '../../ui512/utils/utilsTest.js';
/* auto */ import { specialCharFontChange } from '../../ui512/draw/ui512DrawTextClasses.js';
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
        assertEq('abc', vel.getFmTxt().toUnformatted(), 'F+|');
        vel.setProp('singleline', VpcValBool(true));
        assertEq('abc', vel.getFmTxt().toUnformatted(), 'F*|');
    },
    'testChangeToSingleLine.making it single line should kill the other line',
    () => {
        let vel = new VpcElField('id1', 'parentid1');
        vel.observer = new ElementObserverNoOp();
        vel.setFmTxt(FormattedText.newFromUnformatted('abcd\ndef'));
        vel.setProp('singleline', VpcValBool(false));
        assertEq('abcd\ndef', vel.getFmTxt().toUnformatted(), 'F)|');
        vel.setProp('singleline', VpcValBool(true));
        assertEq('abcd', vel.getFmTxt().toUnformatted(), 'F(|');
    },
    'testChangeToSingleLine.making it single line should kill all the other lines',
    () => {
        let vel = new VpcElField('id1', 'parentid1');
        vel.observer = new ElementObserverNoOp();
        vel.setFmTxt(FormattedText.newFromUnformatted('a\nb\nc\nd'));
        vel.setProp('singleline', VpcValBool(false));
        assertEq('a\nb\nc\nd', vel.getFmTxt().toUnformatted(), 'F&|');
        vel.setProp('singleline', VpcValBool(true));
        assertEq('a', vel.getFmTxt().toUnformatted(), 'F%|');
    },
    'testVpcElButton.should translate style names for script',
    () => {
        let vel = new VpcElButton('id1', 'parentid1');
        vel.observer = new ElementObserverNoOp();
        vel.set('style', UI512BtnStyle.Rectangle);
        assertEq('rectangle', vel.getProp('style').readAsString(), 'F$|');
        vel.set('style', UI512BtnStyle.Checkbox);
        assertEq('checkbox', vel.getProp('style').readAsString(), 'F#|');
        vel.set('style', UI512BtnStyle.OSStandard);
        assertEq('standard', vel.getProp('style').readAsString(), 'F!|');
        vel.set('style', UI512BtnStyle.OSDefault);
        assertEq('default', vel.getProp('style').readAsString(), 'F |');
    },
    'testWritableContainerVar.setAll',
    () => {
        let world = new MockOutsideWorld();
        let writer = new WritableContainerVar(world.getMock(), 'varName');
        writer.setAll('abc');
        assertEq('abc', writer.getRawString(), 'Fz|');
        assertEq('abc', world.result, 'Fy|');
        writer.setAll('def');
        assertEq('def', writer.getRawString(), 'Fx|');
        assertEq('def', world.result, 'Fw|');
    },
    'testWritableContainerVar.splice',
    () => {
        let world = new MockOutsideWorld();
        let writer = new WritableContainerVar(world.getMock(), 'varName');

        /* 2 chars -> 0 chars */
        writer.setAll('abcde');
        writer.splice(1, 2, '');
        assertEq('ade', writer.getRawString(), 'Fv|');

        /* 2 chars -> 1 char */
        writer.setAll('abcde');
        writer.splice(1, 2, 'x');
        assertEq('axde', writer.getRawString(), 'Fu|');

        /* 2 chars -> 2 chars */
        writer.setAll('abcde');
        writer.splice(1, 2, 'xy');
        assertEq('axyde', writer.getRawString(), 'Ft|');

        /* 2 chars -> 3 chars */
        writer.setAll('abcde');
        writer.splice(1, 2, 'xyz');
        assertEq('axyzde', writer.getRawString(), 'Fs|');

        /* add 3 chars */
        writer.setAll('abcde');
        writer.splice(1, 0, 'xyz');
        assertEq('axyzbcde', writer.getRawString(), 'Fr|');
    },
    'testVpcElStackLineageEntry.Construct',
    () => {
        assertThrows('L(|', 'empty', () => new VpcElStackLineageEntry(undefined as any, 'stackGuid', 'stackName'));
        assertThrows('L&|', 'empty', () => new VpcElStackLineageEntry('', 'stackGuid', 'stackName'));
        assertThrows('L%|', 'empty', () => new VpcElStackLineageEntry('owner', undefined as any, 'stackName'));
        assertThrows('L$|', 'empty', () => new VpcElStackLineageEntry('owner', '', 'stackName'));
        assertThrows('L#|', 'empty', () => new VpcElStackLineageEntry('owner', 'stackGuid', undefined as any));
        assertThrows('L!|', 'empty', () => new VpcElStackLineageEntry('owner', 'stackGuid', ''));
        assertThrows('L |', 'contain', () => new VpcElStackLineageEntry('owner|', 'stackGuid', 'stackName'));
        assertThrows('Lz|', 'contain', () => new VpcElStackLineageEntry('owner', 'stackGuid|', 'stackName'));
        assertThrows('Ly|', 'contain', () => new VpcElStackLineageEntry('owner', 'stackGuid', 'stackName|'));
    },
    'testVpcElStackLineageEntry.Serialize',
    () => {
        let entry = new VpcElStackLineageEntry('owner', 'guid', 'name');
        let got = entry.serialize();
        assertEq('owner|guid|name', got, 'Fq|');
    },
    'testVpcElStackLineageEntry.Deserialize',
    () => {
        let restored = VpcElStackLineageEntry.fromSerialized('owner|guid|name');
        assertEq('owner', restored.stackOwner, 'Fp|');
        assertEq('guid', restored.stackGuid, 'Fo|');
        assertEq('name', restored.stackName, 'Fn|');
        assertThrows('Lx|', 'invalid', () => VpcElStackLineageEntry.fromSerialized(''));
        assertThrows('Lw|', 'invalid', () => VpcElStackLineageEntry.fromSerialized('owner|guid'));
        assertThrows('Lv|', 'invalid', () => VpcElStackLineageEntry.fromSerialized('1|2|3|4'));
    },
    'testVpcElStackLineage',
    () => {
        let vel = new VpcElStack('12', '34');
        vel.observer = new ElementObserverNoOp();
        assertThrows('Lu|', 'be empty', () => vel.getLatestStackLineage());
        assertEq('', vel.getS('stacklineage'), 'Fm|');

        let entry = new VpcElStackLineageEntry('own1', 'gid1', 'nm1');
        vel.appendToStackLineage(entry);
        assertEq('own1|gid1|nm1', vel.getLatestStackLineage().serialize(), 'Fl|');
        assertEq('own1|gid1|nm1', vel.getS('stacklineage'), 'Fk|');

        entry = new VpcElStackLineageEntry('own2', 'gid2', 'nm2');
        vel.appendToStackLineage(entry);
        assertEq('own2|gid2|nm2', vel.getLatestStackLineage().serialize(), 'K,|');
        assertEq('own1|gid1|nm1||own2|gid2|nm2', vel.getS('stacklineage'), 'Fj|');

        entry = new VpcElStackLineageEntry('own3', 'gid3', 'nm3');
        vel.appendToStackLineage(entry);
        assertEq('own3|gid3|nm3', vel.getLatestStackLineage().serialize(), 'K+|');
        assertEq('own1|gid1|nm1||own2|gid2|nm2||own3|gid3|nm3', vel.getS('stacklineage'), 'K*|');
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

            assertEq('abc', restored.getFmTxt().toUnformatted(), 'Fi|');
            assertEq(b, restored.getB('dontwrap'), 'Fh|');
            assertEq(!b, restored.getB('enabled'), 'Fg|');
            assertEq(b, restored.getB('locktext'), 'Ff|');
            assertEq(!b, restored.getB('singleline'), 'Fe|');
            assertEq(b, restored.getB('visible'), 'Fd|');
            assertEq(b ? 100 : 200, restored.getN('selcaret'), 'Fc|');
            assertEq(!b ? 100 : 200, restored.getN('selend'), 'Fb|');
            assertEq(b ? 100 : 200, restored.getN('scroll'), 'Fa|');
            assertEq(!b ? 100 : 200, restored.getN('style'), 'FZ|');
            assertEq('def', restored.getS('script'), 'FY|');
            assertEq('ghi', restored.getS('textalign'), 'FX|');
            assertEq('jkl', restored.getS('name'), 'FW|');
        }
    },
    'serializePlain with nonascii characters',
    () => {
        let txt = FormattedText.newFromUnformatted('abc');
        txt.setFontEverywhere('f1');
        let sAllAscii = 'abc';
        let sWithTab = 'abc\t';
        let sWithGreater = 'abc\u3667';
        let sWithSmaller = 'abc\x00';
        let sWithNewline = 'abc\n';
        let sWithSerialized = txt.toSerialized();
        assertTrue(scontains(sWithSerialized, specialCharFontChange), 'FV|');
        let sAllAsciiSer = VpcUI512Serialization.serializePlain(sAllAscii);
        let sWithTabSer = VpcUI512Serialization.serializePlain(sWithTab);
        let sWithGreaterSer = VpcUI512Serialization.serializePlain(sWithGreater);
        let sWithSmallerSer = VpcUI512Serialization.serializePlain(sWithSmaller);
        let sWithNewlineSer = VpcUI512Serialization.serializePlain(sWithNewline);
        let sWithSerializedSer = VpcUI512Serialization.serializePlain(sWithSerialized);
        assertTrue(!scontains(sAllAsciiSer.toString(), 'b64'), 'FU|');
        assertTrue(!scontains(sWithTabSer.toString(), 'b64'), 'FT|');
        assertTrue(scontains(sWithGreaterSer.toString(), 'b64'), 'FS|');
        assertTrue(scontains(sWithSmallerSer.toString(), 'b64'), 'FR|');
        assertTrue(!scontains(sWithNewlineSer.toString(), 'b64'), 'FQ|');
        assertTrue(!scontains(sWithSerializedSer.toString(), 'b64'), 'FP|');
        assertEq(sAllAscii, VpcUI512Serialization.deserializePlain(sAllAsciiSer), 'FO|');
        assertEq(sWithTab, VpcUI512Serialization.deserializePlain(sWithTabSer), 'FN|');
        assertEq(sWithGreater, VpcUI512Serialization.deserializePlain(sWithGreaterSer), 'FM|');
        assertEq(sWithSmaller, VpcUI512Serialization.deserializePlain(sWithSmallerSer), 'FL|');
        assertEq(sWithNewline, VpcUI512Serialization.deserializePlain(sWithNewlineSer), 'FK|');
        assertEq(sWithSerialized, VpcUI512Serialization.deserializePlain(sWithSerializedSer), 'FJ|');
    },
    'testSerializeGettable with nonascii characters',
    () => {
        let vel = new VpcElField('id1', 'parentid1');
        vel.observer = new ElementObserverNoOp();
        let sBinX01 = 'def\x01binary';
        let sBinXbb = 'ghi\xbbnonascii';
        let sBinMany = 'u\u2667c\u3667c\u4667c\u5667c\ud667c\ue667c\uf667c\u0301d\u00e9e\u0065';
        vel.set('script', sBinX01);
        vel.set('textalign', sBinXbb);
        vel.set('name', sBinMany);
        assertTrue(scontains(vel.getS('script'), '\x01'), 'FI|');
        assertTrue(scontains(vel.getS('textalign'), '\xbb'), 'FH|');
        let serialized = VpcUI512Serialization.serializeGettable(vel, vel.getKeyPropertiesList());
        assertTrue(scontains(serialized['script'].toString(), 'b64'), 'FG|');
        assertTrue(scontains(serialized['textalign'].toString(), 'b64'), 'FF|');
        assertTrue(!scontains(serialized['script'].toString(), '\x01'), 'FE|');
        assertTrue(!scontains(serialized['textalign'].toString(), '\xbb'), 'FD|');
        let s = JSON.stringify(serialized);
        assertTrue(!scontains(s, '\x01'), 'FC|');
        assertTrue(!scontains(s, '\xbb'), 'FB|');

        let restoredJson = JSON.parse(s);
        let restored = new VpcElField('id1', 'parentid1');
        restored.observer = new ElementObserverNoOp();
        VpcUI512Serialization.deserializeSettable(restored, restored.getKeyPropertiesList(), restoredJson);
        assertEq(sBinX01, restored.getS('script'), 'FA|');
        assertEq(sBinXbb, restored.getS('textalign'), 'F9|');
        assertEq(sBinMany, restored.getS('name'), 'F8|');
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
        assertEq(expected, got, 'F7|');
    }
}
