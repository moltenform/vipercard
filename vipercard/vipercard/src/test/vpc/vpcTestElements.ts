
/* auto */ import { VpcValBool } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { MockOutsideWorld } from './vpcTestChunkResolution';
/* auto */ import { VpcElStack, VpcElStackLineageEntry } from './../../vpc/vel/velStack';
/* auto */ import { VpcGettableSerialization } from './../../vpc/vel/velSerialization';
/* auto */ import { WritableContainerVar } from './../../vpc/vel/velResolveContainer';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { VpcElButton } from './../../vpc/vel/velButton';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { assertEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { ElementObserverNoOp } from './../../ui512/elements/ui512ElementGettable';
/* auto */ import { UI512BtnStyle } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { specialCharFontChange } from './../../ui512/drawtext/ui512DrawTextClasses';
/* auto */ import { SimpleUtil512TestCollection, assertThrows } from './../testUtils/testUtils';
/* auto */ import { MockHigher } from './../util512ui/testUI512Elements';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * tests on FormattedText
 */
let t = new SimpleUtil512TestCollection('testCollectionvpcElements');
export let testCollectionvpcElements = t;
let higher = new MockHigher()

t.test('ChangeToSingleLine.Should Preserve Text That Is Already One Line', () => {
    let vel = new VpcElField('id1', 'parentid1');
    vel.observer = new ElementObserverNoOp();
    vel.setCardFmTxt(FormattedText.newFromUnformatted('abc'), higher);
    vel.setProp('singleline', VpcValBool(false), higher);
    assertEq('abc', vel.getCardFmTxt().toUnformatted(), 'F+|');
    vel.setProp('singleline', VpcValBool(true), higher);
    assertEq('abc', vel.getCardFmTxt().toUnformatted(), 'F*|');
});
t.test('ChangeToSingleLine.making it single line should kill the other line', () => {
    let vel = new VpcElField('id1', 'parentid1');
    vel.observer = new ElementObserverNoOp();
    vel.setCardFmTxt(FormattedText.newFromUnformatted('abcd\ndef'), higher);
    vel.setProp('singleline', VpcValBool(false), higher);
    assertEq('abcd\ndef', vel.getCardFmTxt().toUnformatted(), 'F)|');
    vel.setProp('singleline', VpcValBool(true), higher);
    assertEq('abcd', vel.getCardFmTxt().toUnformatted(), 'F(|');
});
t.test('ChangeToSingleLine1', () => {
    t.say(
        longstr(`ChangeToSingleLine.making
        it single line should kill all the other lines`)
    );
    let vel = new VpcElField('id1', 'parentid1');
    vel.observer = new ElementObserverNoOp();
    vel.setCardFmTxt(FormattedText.newFromUnformatted('a\nb\nc\nd'), higher);
    vel.setProp('singleline', VpcValBool(false), higher);
    assertEq('a\nb\nc\nd', vel.getCardFmTxt().toUnformatted(), 'F&|');
    vel.setProp('singleline', VpcValBool(true), higher);
    assertEq('a', vel.getCardFmTxt().toUnformatted(), 'F%|');
});
t.test('VpcElButton.should translate style names for script', () => {
    let vel = new VpcElButton('id1', 'parentid1');
    vel.observer = new ElementObserverNoOp();
    vel.setOnVel('style', UI512BtnStyle.Rectangle, higher);
    assertEq('rectangle', vel.getProp('style').readAsString(), 'F$|');
    vel.setOnVel('style', UI512BtnStyle.Checkbox, higher);
    assertEq('checkbox', vel.getProp('style').readAsString(), 'F#|');
    vel.setOnVel('style', UI512BtnStyle.OSStandard, higher);
    assertEq('standard', vel.getProp('style').readAsString(), 'F!|');
    vel.setOnVel('style', UI512BtnStyle.OSDefault, higher);
    assertEq('default', vel.getProp('style').readAsString(), 'F |');
});
t.test('WritableContainerVar.setAll', () => {
    let world = new MockOutsideWorld();
    let writer = new WritableContainerVar(world.getMock(), 'varName');
    writer.setAll('abc');
    assertEq('abc', writer.getRawString(), 'Fz|');
    assertEq('abc', world.result, 'Fy|');
    writer.setAll('def');
    assertEq('def', writer.getRawString(), 'Fx|');
    assertEq('def', world.result, 'Fw|');
});
t.test('WritableContainerVar.splice', () => {
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
});
t.test('VpcElStackLineageEntry.Construct', () => {
    assertThrows(
        'L(|',
        'empty',
        () => new VpcElStackLineageEntry(undefined as any, 'stackGuid', 'stackName')
    );
    assertThrows(
        'L&|',
        'empty',
        () => new VpcElStackLineageEntry('', 'stackGuid', 'stackName')
    );
    assertThrows(
        'L%|',
        'empty',
        () => new VpcElStackLineageEntry('owner', undefined as any, 'stackName')
    );
    assertThrows(
        'L$|',
        'empty',
        () => new VpcElStackLineageEntry('owner', '', 'stackName')
    );
    assertThrows(
        'L#|',
        'empty',
        () => new VpcElStackLineageEntry('owner', 'stackGuid', undefined as any)
    );
    assertThrows(
        'L!|',
        'empty',
        () => new VpcElStackLineageEntry('owner', 'stackGuid', '')
    );
    assertThrows(
        'L |',
        'contain',
        () => new VpcElStackLineageEntry('owner|', 'stackGuid', 'stackName')
    );
    assertThrows(
        'Lz|',
        'contain',
        () => new VpcElStackLineageEntry('owner', 'stackGuid|', 'stackName')
    );
    assertThrows(
        'Ly|',
        'contain',
        () => new VpcElStackLineageEntry('owner', 'stackGuid', 'stackName|')
    );
});
t.test('VpcElStackLineageEntry.Serialize', () => {
    let entry = new VpcElStackLineageEntry('owner', 'guid', 'name');
    let got = entry.serialize();
    assertEq('owner|guid|name', got, 'Fq|');
});
t.test('VpcElStackLineageEntry.Deserialize', () => {
    let restored = VpcElStackLineageEntry.fromSerialized('owner|guid|name');
    assertEq('owner', restored.stackOwner, 'Fp|');
    assertEq('guid', restored.stackGuid, 'Fo|');
    assertEq('name', restored.stackName, 'Fn|');
    assertThrows('Lx|', 'invalid', () => VpcElStackLineageEntry.fromSerialized(''));
    assertThrows('Lw|', 'invalid', () =>
        VpcElStackLineageEntry.fromSerialized('owner|guid')
    );
    assertThrows('Lv|', 'invalid', () =>
        VpcElStackLineageEntry.fromSerialized('1|2|3|4')
    );
});
t.test('VpcElStackLineage', () => {
    let vel = new VpcElStack('12', '34');
    vel.observer = new ElementObserverNoOp();
    assertThrows('Lu|', 'be empty', () => vel.getLatestStackLineage());
    assertEq('', vel.getS('stacklineage'), 'Fm|');

    let entry = new VpcElStackLineageEntry('own1', 'gid1', 'nm1');
    vel.appendToStackLineage(entry, higher);
    assertEq('own1|gid1|nm1', vel.getLatestStackLineage().serialize(), 'Fl|');
    assertEq('own1|gid1|nm1', vel.getS('stacklineage'), 'Fk|');

    entry = new VpcElStackLineageEntry('own2', 'gid2', 'nm2');
    vel.appendToStackLineage(entry, higher);
    assertEq('own2|gid2|nm2', vel.getLatestStackLineage().serialize(), 'K,|');
    assertEq('own1|gid1|nm1||own2|gid2|nm2', vel.getS('stacklineage'), 'Fj|');

    entry = new VpcElStackLineageEntry('own3', 'gid3', 'nm3');
    vel.appendToStackLineage(entry, higher);
    assertEq('own3|gid3|nm3', vel.getLatestStackLineage().serialize(), 'K+|');
    assertEq(
        'own1|gid1|nm1||own2|gid2|nm2||own3|gid3|nm3',
        vel.getS('stacklineage'),
        'K*|'
    );
});
t.test('SerializeGettable1', () => {
    t.say(longstr(`SerializeGettable1`));
    for (let b of [true, false]) {
        let vel = new VpcElField('id1', 'parentid1');
        vel.observer = new ElementObserverNoOp();

        vel.setCardFmTxt(FormattedText.newFromUnformatted('abc'), higher);
        vel.setOnVel('dontwrap', b, higher);
        vel.setOnVel('enabled', !b, higher);
        vel.setOnVel('locktext', b, higher);
        vel.setOnVel('singleline', !b, higher);
        vel.setOnVel('visible', b, higher);
        vel.setOnVel('selcaret', b ? 100 : 200, higher);
        vel.setOnVel('selend', !b ? 100 : 200, higher);
        vel.setOnVel('scroll', b ? 100 : 200, higher);
        vel.setOnVel('style', !b ? 100 : 200, higher);
        vel.setOnVel('script', 'def', higher);
        vel.setOnVel('textalign', 'ghi', higher);
        vel.setOnVel('name', 'jkl', higher);

        let serialized = VpcGettableSerialization.serializeGettable(vel);
        let restored = new VpcElField('id1', 'parentid1');
        restored.observer = new ElementObserverNoOp();
        let s = JSON.stringify(serialized);
        let restoredJson = JSON.parse(s);
        VpcGettableSerialization.deserializeSettable(restored, restoredJson, higher);

        assertEq('abc', restored.getCardFmTxt().toUnformatted(), 'Fi|');
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
});
t.test('serializePlain with nonascii characters', () => {
    let txt = FormattedText.newFromUnformatted('abc');
    txt.setFontEverywhere('f1');
    let sAllAscii = 'abc';
    let sWithTab = 'abc\t';
    let sWithGreater = 'abc\u3667';
    let sWithSmaller = 'abc\x00';
    let sWithNewline = 'abc\n';
    let sWithSerialized = txt.toSerialized();
    assertTrue(sWithSerialized.includes(specialCharFontChange), 'FV|');
    let sAllAsciiSer = VpcGettableSerialization.serializePlain(sAllAscii);
    let sWithTabSer = VpcGettableSerialization.serializePlain(sWithTab);
    let sWithGreaterSer = VpcGettableSerialization.serializePlain(sWithGreater);
    let sWithSmallerSer = VpcGettableSerialization.serializePlain(sWithSmaller);
    let sWithNewlineSer = VpcGettableSerialization.serializePlain(sWithNewline);
    let sWithSerializedSer = VpcGettableSerialization.serializePlain(sWithSerialized);
    assertTrue(!sAllAsciiSer.toString().includes('b64'), 'FU|');
    assertTrue(!sWithTabSer.toString().includes('b64'), 'FT|');
    assertTrue(sWithGreaterSer.toString().includes('b64'), 'FS|');
    assertTrue(sWithSmallerSer.toString().includes('b64'), 'FR|');
    assertTrue(!sWithNewlineSer.toString().includes('b64'), 'FQ|');
    assertTrue(!sWithSerializedSer.toString().includes('b64'), 'FP|');
    assertEq(sAllAscii, VpcGettableSerialization.deserializePlain(sAllAsciiSer), 'FO|');
    assertEq(sWithTab, VpcGettableSerialization.deserializePlain(sWithTabSer), 'FN|');
    assertEq(
        sWithGreater,
        VpcGettableSerialization.deserializePlain(sWithGreaterSer),
        'FM|'
    );
    assertEq(
        sWithSmaller,
        VpcGettableSerialization.deserializePlain(sWithSmallerSer),
        'FL|'
    );
    assertEq(
        sWithNewline,
        VpcGettableSerialization.deserializePlain(sWithNewlineSer),
        'FK|'
    );
    assertEq(
        sWithSerialized,
        VpcGettableSerialization.deserializePlain(sWithSerializedSer),
        'FJ|'
    );
});
t.test('SerializeGettable with nonascii characters', () => {
    let vel = new VpcElField('id1', 'parentid1');
    vel.observer = new ElementObserverNoOp();
    let sBinX01 = 'def\x01binary';
    let sBinXbb = 'ghi\xbbnonascii';
    let sBinMany =
        'u\u2667c\u3667c\u4667c\u5667c\ud667c\ue667c\uf667c\u0301d\u00e9e\u0065';
    vel.setOnVel('script', sBinX01, higher);
    vel.setOnVel('textalign', sBinXbb, higher);
    vel.setOnVel('name', sBinMany, higher);
    assertTrue(vel.getS('script').includes('\x01'), 'FI|');
    assertTrue(vel.getS('textalign').includes('\xbb'), 'FH|');
    let serialized = VpcGettableSerialization.serializeGettable(vel);
    assertTrue(serialized['script'].toString().includes('b64'), 'FG|');
    assertTrue(serialized['textalign'].toString().includes('b64'), 'FF|');
    assertTrue(!serialized['script'].toString().includes('\x01'), 'FE|');
    assertTrue(!serialized['textalign'].toString().includes('\xbb'), 'FD|');
    let s = JSON.stringify(serialized);
    assertTrue(!s.includes('\x01'), 'FC|');
    assertTrue(!s.includes('\xbb'), 'FB|');

    let restoredJson = JSON.parse(s);
    let restored = new VpcElField('id1', 'parentid1');
    restored.observer = new ElementObserverNoOp();
    VpcGettableSerialization.deserializeSettable(restored, restoredJson, higher);
    assertEq(sBinX01, restored.getS('script'), 'FA|');
    assertEq(sBinXbb, restored.getS('textalign'), 'F9|');
    assertEq(sBinMany, restored.getS('name'), 'F8|');
});
t.test('vars starting with _', () => {
    t.say(
        longstr(`VpcElements.Properties for
        serialization should include all member vars starting with _`)
    );
    return;
    /* perhaps add a test, we want assert to fire if an important property on a button is missing */
});

const fakeCardId = '(fakeCardId)';
