
/* auto */ import { IsUtil512Serializable, Util512SerializableHelpers } from './../../ui512/utils/util512Serialize';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, assertEq } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, assertThrows, assertThrowsAsync, sorted } from './../testUtils/testUtils';

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
    assertEq('f1,f2,fld1,fld2', ks, 'Q6|');
    assertEq('fld 1', got.fld1, 'Q5|');
    assertEq('fld 2 and text', got.fld2, 'Q4|');
    assertEq('an optional field', got.f1, 'Q3|');
    assertEq('also optional', got.f2, 'Q2|');
    assertTrue(undefined === got.__private, 'Q1|');
    t.say(/*——————————*/ 'round trip');
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,optional_f1,optional_f2',
        ks,
        'Q0|'
    );
    assertEq('fld 1', oGot.fld1, 'P~|');
    assertEq('fld 2 and text', oGot.fld2, 'P}|');
    assertEq('an optional field', oGot.optional_f1, 'P||');
    assertEq('also optional', oGot.optional_f2, 'P{|');
    assertEq('not serialized', oGot.__private, 'P_|');
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
        'P^|'
    );
    assertEq('fld 1~', oGot.fld1, 'P]|');
    assertEq('fld 2 and text~', oGot.fld2, 'P[|');
    assertEq('an optional field~', oGot.optional_f1, 'P@|');
    assertEq('also optional~', oGot.optional_f2, 'P?|');
    assertEq('not serialized', oGot.__private, 'P>|');
});
t.test('serialize: missing an optional is fine', () => {
    let okIncoming = { fld1: 'a', fld2: 'b', f2: 'c' };
    let s = JSON.stringify(okIncoming);
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    let ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,optional_f1,optional_f2',
        ks,
        'P=|'
    );
    assertEq('a', oGot.fld1, 'P<|');
    assertEq('b', oGot.fld2, 'P;|');
    assertTrue(undefined === oGot.optional_f1, 'P:|');
    assertEq('c', oGot.optional_f2, 'P/|');
    assertEq('not serialized', oGot.__private, 'P.|');
});
t.test('serialize: getting extra data is fine', () => {
    let okIncoming = { fld1: 'a', fld2: 'b', f1: 'c', f2: 'd', somethingelse: 'e' };
    let s = JSON.stringify(okIncoming);
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    let ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,optional_f1,optional_f2',
        ks,
        'Ug|'
    );
    assertEq('a', oGot.fld1, 'Uf|');
    assertEq('b', oGot.fld2, 'Ue|');
    assertEq('c', oGot.optional_f1, 'Ud|');
    assertEq('d', oGot.optional_f2, 'Uc|');
    assertEq('not serialized', oGot.__private, 'P(|');
    t.say(/*——————————*/ 'test loose');
    oGot = Util512SerializableHelpers.deserializeObjLoose(
        DemoSerializable,
        JSON.parse(s)
    );
    ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq('__isUtil512Serializable,f1,f2,fld1,fld2,somethingelse', ks, 'P-|');
    assertEq('a', oGot.fld1, 'P,|');
    assertEq('b', oGot.fld2, 'P+|');
    assertEq('c', oGot['f1'], 'P*|');
    assertEq('d', oGot['f2'], 'P)|');
});
t.test('serialize: throw on missing field ', () => {
    let badIncoming = { fld1: 'fld 1', f1: 'an optional field', f2: 'also optional' };
    let s = JSON.stringify(badIncoming);
    assertThrows('P&|', 'required', () =>
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
    assertThrows('P%|', 'support', () =>
        Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s)
    );
});
t.test('serialize: throw on unsupported type 2', () => {
    let badIncoming = { fld1: 'fld 1', fld2: 'b', f1: 1234, f2: 'also optional' };
    let s = JSON.stringify(badIncoming);
    assertThrows('P#|', 'not a string', () =>
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
    assertThrows('P!|', 'support', () =>
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
    assertThrows('P |', 'support', () =>
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
    assertThrows('Pz|', 'support', () =>
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
    assertThrows('Py|', 'must be', () =>
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
    assertThrows('Px|', 'must be', () =>
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
    assertEq('f2,fld1,fld2', ks, 'Pw|');
    t.say(/*——————————*/ 'round trip');
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,optional_f1,optional_f2',
        ks,
        'Pv|'
    );
    assertEq('fld 1~', oGot.fld1, 'Pu|');
    assertEq('fld 2 and text~', oGot.fld2, 'Pt|');
    assertTrue(undefined === oGot.optional_f1, 'Ps|');
    assertEq('also optional~', oGot.optional_f2, 'Pr|');
    assertEq('not serialized', oGot.__private, 'Pq|');
});
t.test('serialize: incoming nulls map to undefined ', () => {
    let okIncoming = { fld1: 'a', fld2: 'b', f1: 'c', f2: null };
    let s = JSON.stringify(okIncoming);
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    assertTrue(undefined === oGot.optional_f2, 'Pp|');
    assertTrue('a' === oGot.fld1, 'Po|');
});
t.test("serialize: we don't read private incoming", () => {
    let okIncoming = { fld1: 'a', fld2: 'b', f1: 'c', f2: 'd', __private: 'e' };
    let s = JSON.stringify(okIncoming);
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoSerializable, s);
    assertTrue('not serialized' === oGot.__private, 'Pn|');
    assertTrue('d' === oGot.optional_f2, 'Pm|');
    assertTrue('c' === oGot.optional_f1, 'Pl|');
    assertTrue('b' === oGot.fld2, 'Pk|');
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
    assertEq('f1,f2,fld1,fld2,other', ks, 'Pj|');
    let oGot = Util512SerializableHelpers.deserializeFromJson(DemoChild, s);
    ks = sorted(Util512.getMapKeys(oGot)).join(',');
    assertEq(
        '__isUtil512Serializable,__private,fld1,fld2,method1,optional_f1,optional_f2,other',
        ks,
        'Pi|'
    );
    ks = sorted(IsUtil512Serializable.getKeys(oGot)).join(',');
    assertEq('fld1,fld2,optional_f1,optional_f2,other', ks, 'Ph|');
    assertEq('fld 1~', oGot.fld1, 'Pg|');
    assertEq('fld 2 and text~', oGot.fld2, 'Pf|');
    assertEq('an optional field~', oGot.optional_f1, 'Pe|');
    assertEq('also optional~', oGot.optional_f2, 'Pd|');
    assertEq('not serialized', oGot.__private, 'Pc|');
    assertEq('other', oGot.other, 'Pb|');
    assertEq(1, oGot.method1(), 'Pa|');
    assertTrue(undefined === oGot['method2'], 'PZ|');
});

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

/* an example async function */
async function exampleAsyncFn() {
    t.say(/*——————————*/ '1...');
    await Util512Higher.sleep(100);
    t.say(/*——————————*/ '2...');
}
t.atest('minimumTimeSlowsDown', async () => {
    let shortFn = async () => {
        await Util512Higher.sleep(100);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithMinimumTime(shortFn(), 500);
    assertEq(123, result, 'PY|');
    assertTrue(performance.now() - start > 400, 'PX|too fast');
});
t.atest('minimumTimeStaysSame', async () => {
    let longFn = async () => {
        await Util512Higher.sleep(500);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithMinimumTime(longFn(), 100);
    assertEq(123, result, 'PW|');
    assertTrue(performance.now() - start > 400, 'PV|too fast');
});
t.atest('doesNotTimeOut', async () => {
    let shortFn = async () => {
        await Util512Higher.sleep(200);
        return 123;
    };
    let start = performance.now();
    let result = await Util512Higher.runAsyncWithTimeout(shortFn(), 800);
    assertEq(123, result, 'PU|');
    assertTrue(performance.now() - start < 600, 'PT|too slow');
});
t.atest('timesOut', async () => {
    let longFn = async () => {
        await Util512Higher.sleep(800);
        return 123;
    };
    let start = performance.now();
    let cb = async () => {
        return Util512Higher.runAsyncWithTimeout(longFn(), 200);
    };
    await assertThrowsAsync('PS|', 'Timed out', () => cb());
    assertTrue(performance.now() - start < 600, 'PR|too slow');
});

/**
 * test some less useful classes
 */
t.test('LockableArr', () => {
    t.say(/*——————————*/ 'standard use');
    let ar = new Util512.LockableArr<number>();
    ar.set(0, 55);
    ar.set(1, 56);
    assertEq(55, ar.at(0), 'OS|');
    assertEq(56, ar.at(1), 'OR|');
    assertEq(2, ar.len(), 'OQ|');
    ar.lock();
    assertThrows('OP|', 'locked', () => {
        ar.set(1, 57);
    });
    t.say(/*——————————*/ "changing the copy won't change original");
    let copy = ar.getUnlockedCopy();
    assertEq(55, copy.at(0), 'OO|');
    assertEq(56, copy.at(1), 'ON|');
    assertEq(2, copy.len(), 'OM|');
    copy.set(1, 57);
    assertEq(57, copy.at(1), 'OL|');
    assertEq(56, ar.at(1), 'OK|');
});
t.test('keepOnlyUnique', () => {
    assertEq([], Util512.keepOnlyUnique([]), 'OJ|');
    assertEq(['1'], Util512.keepOnlyUnique(['1']), 'OI|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3']), 'OH|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3']), 'OG|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3', '3']), 'OF|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3', '2']), 'OE|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '2', '3', '3']), 'OD|');
    assertEq(['1', '2', '3'], Util512.keepOnlyUnique(['1', '2', '3', '2', '3']), 'OC|');
    assertEq(
        ['11', '12', '13', '14', '15'],
        Util512.keepOnlyUnique(['11', '12', '13', '14', '15', '15']),
        'OB|'
    );
});
