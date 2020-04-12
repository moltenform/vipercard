
/* auto */ import { IsUtil512Serializable, Util512SerializableHelpers } from './../../ui512/utils/util512Serialize';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { Util512, assertEq } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, assertThrows, sorted } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the MIT license */

let t = new SimpleUtil512TestCollection('testCollectionUtil512Higher');
export let testCollectionUtil512Higher = t;

t.test('WeakUuid', () => {
    let uid1 = Util512Higher.weakUuid();
    let uid2 = Util512Higher.weakUuid();
    assertTrue(uid1 !== uid2, 'Ea|');

    let uid = Util512Higher.weakUuid();
    assertEq(36, uid.length, 'EZ|');
    for (let i = 0; i < uid.length; i++) {
        let c = uid.charAt(i);
        if (i === 23 || i === 18 || i === 13 || i === 8) {
            assertEq('-', c, 'EY|');
        } else {
            assertTrue('0123456789abcdef'.includes(c), 'EX|');
        }
    }
});
t.test('getRandIntInclusiveWeak.OKIfBoundsEqual', () => {
    assertEq(1, Util512Higher.getRandIntInclusiveWeak(1, 1), 'EW|');
    assertEq(2, Util512Higher.getRandIntInclusiveWeak(2, 2), 'EV|');
    assertEq(3, Util512Higher.getRandIntInclusiveWeak(3, 3), 'EU|');
});
t.test('getRandIntInclusiveWeak', () => {
    let got = Util512Higher.getRandIntInclusiveWeak(1, 3);
    assertTrue(got >= 1 && got <= 3, 'ET|');
    got = Util512Higher.getRandIntInclusiveWeak(4, 6);
    assertTrue(got >= 4 && got <= 6, 'ES|');
    got = Util512Higher.getRandIntInclusiveWeak(7, 9);
    assertTrue(got >= 7 && got <= 9, 'ER|');
});
t.test('generateUniqueBase64UrlSafe', () => {
    let generated1 = Util512Higher.generateUniqueBase64UrlSafe(8, '!');
    let generated2 = Util512Higher.generateUniqueBase64UrlSafe(8, '!');
    assertTrue(generated1 !== generated2, 'D(|');
    assertEq('!', Util512.fromBase64UrlSafe(generated1)[0], 'D&|');
    assertEq('!', Util512.fromBase64UrlSafe(generated2)[0], 'D%|');
});

/**
 * example for testing serializable.
 * field names begining in optional_ can be skipped.
 */
class DemoSerializable implements IsUtil512Serializable {
    __isUtil512Serializable = true;
    __private = 'not serialized';
    fld1 = 'fld 1';
    fld2 = 'fld 2 and text';
    optional_f1: O<string> = 'an optional field';
    optional_f2: O<string> = 'also optional';
}

t.test('serialize: expected', () => {
    t.say(/*——————————*/ 'typical usage');
    let o = new DemoSerializable();
    let s = Util512SerializableHelpers.serializeToJson(o);
    let got = JSON.parse(s);
    let ks = sorted(Util512.getMapKeys(got)).join(',');
    assertEq('f1,f2,fld1,fld2', ks, '');
    assertEq('fld 1', got.fld1, '');
    assertEq('fld 2 and text', got.fld2, '');
    assertEq('an optional field', got.f1, '');
    assertEq('also optional', got.f2, '');
    assertTrue(undefined === got.__private, '');
    t.say(/*——————————*/ 'round trip');
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,optional_f1,optional_f2',
        ks,
        ''
    );
    assertEq('fld 1', oGot.fld1, '');
    assertEq('fld 2 and text', oGot.fld2, '');
    assertEq('an optional field', oGot.optional_f1, '');
    assertEq('also optional', oGot.optional_f2, '');
    assertEq('not serialized', oGot.__private, '');
});
t.test('serialize: private values not sent', () => {
    t.say(/*——————————*/ 'typical usage');
    let o = new DemoSerializable();
    o.__private += '~';
    o.fld1 += '~';
    o.fld2 += '~';
    o.optional_f1 += '~';
    o.optional_f2 += '~';
    let s = Util512SerializableHelpers.serializeToJson(o);
    t.say(/*——————————*/ 'round trip');
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    let ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,optional_f1,optional_f2',
        ks,
        ''
    );
    assertEq('fld 1~', oGot.fld1, '');
    assertEq('fld 2 and text~', oGot.fld2, '');
    assertEq('an optional field~', oGot.optional_f1, '');
    assertEq('also optional~', oGot.optional_f2, '');
    assertEq('not serialized', oGot.__private, '');
});
t.test('serialize: missing an optional is fine', () => {
    let okIncoming = { fld1: 'a', fld2: 'b', f2: 'c' };
    let s = JSON.stringify(okIncoming);
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    let ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,optional_f1,optional_f2',
        ks,
        ''
    );
    assertEq('a', oGot.fld1, '');
    assertEq('b', oGot.fld2, '');
    assertTrue(undefined === oGot.optional_f1, '');
    assertEq('c', oGot.optional_f2, '');
    assertEq('not serialized', oGot.__private, '');
});
t.test('serialize: getting extra data is fine', () => {
    let okIncoming = { fld1: 'a', fld2: 'b', f1: 'c', f2: 'd', somethingelse: 'e' };
    let s = JSON.stringify(okIncoming);
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    let ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,optional_f1,optional_f2',
        ks,
        ''
    );
    assertEq('a', oGot.fld1, '');
    assertEq('b', oGot.fld2, '');
    assertEq('c', oGot.optional_f1, '');
    assertEq('d', oGot.optional_f2, '');
    assertEq('not serialized', oGot.__private, '');
});
t.test('serialize: throw on missing field ', () => {
    let badIncoming = { fld1: 'fld 1', f1: 'an optional field', f2: 'also optional' };
    let s = JSON.stringify(badIncoming);
    assertThrows('', 'required', () =>
        Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s)
    );
});
t.test('serialize: throw on unsupported type 1', () => {
    let badIncoming = {
        fld1: 'fld 1',
        fld2: 1234,
        f1: 'an optional field',
        f2: 'also optional'
    };
    let s = JSON.stringify(badIncoming);
    assertThrows('', 'support', () =>
        Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s)
    );
});
t.test('serialize: throw on unsupported type 2', () => {
    let badIncoming = { fld1: 'fld 1', fld2: 'b', f1: 1234, f2: 'also optional' };
    let s = JSON.stringify(badIncoming);
    assertThrows('', 'not a string', () =>
        Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s)
    );
});
t.test('serialize: invalid send, undefined', () => {
    let badOutgoing = {
        __isUtil512Serializable: true,
        fld1: 'fld 1',
        fld2: undefined,
        optional_f1: 'b',
        optional_f2: 'also optional'
    };
    assertThrows('', 'support', () =>
        Util512SerializableHelpers.serializeToJson(badOutgoing)
    );
});
t.test('serialize: invalid send, not string', () => {
    let badOutgoing = {
        __isUtil512Serializable: true,
        fld1: 'fld 1',
        fld2: 1234,
        optional_f1: 'b',
        optional_f2: 'also optional'
    };
    assertThrows('', 'support', () =>
        Util512SerializableHelpers.serializeToJson(badOutgoing)
    );
});
t.test('serialize: invalid send, not string opt', () => {
    let badOutgoing = {
        __isUtil512Serializable: true,
        fld1: 'fld 1',
        fld2: 'a',
        optional_f1: [123],
        optional_f2: 'also optional'
    };
    assertThrows('', 'support', () =>
        Util512SerializableHelpers.serializeToJson(badOutgoing)
    );
});
t.test('serialize: invalid send, not marked', () => {
    let badOutgoing = {
        __isUtil512Serializable: true,
        fld1: 'fld 1',
        fld2: 1234,
        optional_f1: 'b',
        optional_f2: 'also optional'
    };
    badOutgoing.__isUtil512Serializable = undefined as any;
    assertThrows('', 'must be', () =>
        Util512SerializableHelpers.serializeToJson(badOutgoing)
    );
});
t.test('serialize: invalid recieve, not marked', () => {
    let o = new DemoSerializable();
    let s = Util512SerializableHelpers.serializeToJson(o);
    class NotMarked {
        __private = 'not serialized';
        fld1 = 'fld 1';
        fld2 = 'fld 2 and text';
        optional_f1: O<string> = 'an optional field';
        optional_f2: O<string> = 'also optional';
    }
    assertThrows('', 'must be', () =>
        Util512SerializableHelpers.deserializeFromJson(NotMarked as any, s)
    );
});
t.test('serialize: ok to send an undefined if optional', () => {
    t.say(/*——————————*/ 'send');
    let o = new DemoSerializable();
    o.__private += '~';
    o.fld1 += '~';
    o.fld2 += '~';
    o.optional_f1 = undefined;
    o.optional_f2 += '~';
    let s = Util512SerializableHelpers.serializeToJson(o);
    let ks = sorted(Util512.getMapKeys(JSON.parse(s))).join(',');
    assertEq('f2,fld1,fld2', ks, '');
    t.say(/*——————————*/ 'round trip');
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,optional_f1,optional_f2',
        ks,
        ''
    );
    assertEq('fld 1~', oGot.fld1, '');
    assertEq('fld 2 and text~', oGot.fld2, '');
    assertTrue(undefined === oGot.optional_f1, '');
    assertEq('also optional~', oGot.optional_f2, '');
    assertEq('not serialized', oGot.__private, '');
});
t.test('serialize: incoming nulls map to undefined ', () => {
    let okIncoming = { fld1: 'a', fld2: 'b', f1: 'c', f2: null };
    let s = JSON.stringify(okIncoming);
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    assertTrue(undefined === oGot.optional_f2, '');
    assertTrue('a' === oGot.fld1, '');
});
t.test("serialize: we don't read private incoming", () => {
    let okIncoming = { fld1: 'a', fld2: 'b', f1: 'c', f2: 'd', __private: 'e' };
    let s = JSON.stringify(okIncoming);
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    assertTrue('not serialized' === oGot.__private, '');
    assertTrue('d' === oGot.optional_f2, '');
    assertTrue('c' === oGot.optional_f1, '');
    assertTrue('b' === oGot.fld2, '');
});
t.test('serialize: inheritance works, methods skipped', () => {
    class DemoChild extends DemoSerializable {
        other = 'other';
        method1 = () => {
            return 1;
        };
    }
    let o = new DemoChild();
    o.__private += '~';
    o.fld1 += '~';
    o.fld2 += '~';
    o.optional_f1 += '~';
    o.optional_f2 += '~';
    (o as any).method2 = () => {
        return 2;
    };
    let s = Util512SerializableHelpers.serializeToJson(o);
    let got = JSON.parse(s);
    let ks = sorted(Util512.getMapKeys(got)).join(',');
    assertEq('f1,f2,fld1,fld2,other', ks, '');
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoChild, s);
    ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,method1,optional_f1,optional_f2,other',
        ks,
        ''
    );
    ks = sorted(IsUtil512Serializable.getKeys(oGot)).join(',');
    assertEq(
        'fld1,fld2,optional_f1,optional_f2,other',
        ks,
        ''
    );
    assertEq('fld 1~', oGot.fld1, '');
    assertEq('fld 2 and text~', oGot.fld2, '');
    assertEq('an optional field~', oGot.optional_f1, '');
    assertEq('also optional~', oGot.optional_f2, '');
    assertEq('not serialized', oGot.__private, '');
    assertEq('other', oGot.other, '');
    assertEq(1, oGot.method1(), '');
    assertTrue(undefined === oGot['method2'], '');
});

t = new SimpleUtil512TestCollection('testCollectionExampleAsyncTests');
export let testCollectionExampleAsyncTests = t;

/* ok to disable warning, we're intentionally only synchronous here */
/* eslint-disable-next-line @typescript-eslint/require-await */
t.atest('canDoSimpleSynchronousActions', async () => {
    t.say(/*——————————*/ 'adding numbers');
    assertEq(4, 2 + 2, 'OA|');
});
t.atest('canAwaitACall', async () => {
    t.say(/*——————————*/ '0...');
    await exampleAsyncFn();
    t.say(/*——————————*/ '3');
});
/* note that we're intentionally returning a promise */
t.atest('canChainACall', async () => {
    return exampleAsyncFn();
});

async function exampleAsyncFn() {
    t.say(/*——————————*/ '1...');
    await Util512Higher.sleep(100);
    t.say(/*——————————*/ '2...');
}
