
/* auto */ import { SimpleSensibleTestCategory, assertThrows } from './testUtils';
/* auto */ import { O, assertTrue } from './../util/benBaseUtilsAssert';
/* auto */ import { Util512, assertEq, longstr } from './../util/benBaseUtils';

import { Skip, Type } from 'serializer.ts/decorators';
import { serialize, deserialize } from 'serializer.ts/serializer';

let t = new SimpleSensibleTestCategory('testExternalLibs');
export let testExternalLibs = t;

t.test('testCsvLib', () => {
    let encoded = csv.encode([
        { prop1: 'v1', prop2: 'v2' },
        { prop1: 'v1b', prop2: 'v2b' },
    ]);
    let lines = encoded.split('\n');
    assertEq(3, lines.length, 'Oq|');
    assertEq('prop1,prop2', lines[0], 'Op|');
    assertEq('v1,v2', lines[1], 'Oo|');
    assertEq('v1b,v2b', lines[2], 'On|');
});
t.test('testSimpleSerialize', () => {
    let o = new ClassTestSimpleSerialization('id1001');
    o.unimportant = 'not important';
    let oAsJson = serialize(o);
    let oAsString = JSON.stringify(oAsJson);
    let gotJson = JSON.parse(oAsString);
    let oFromString = deserialize<ClassTestSimpleSerialization>(
        ClassTestSimpleSerialization,
        gotJson,
    );
    assertTrue(oFromString instanceof ClassTestSimpleSerialization, 'Om|');
    assertEq('id1001', oFromString.id, 'Ol|');
    assertEq('content', oFromString.content, 'Ok|');
    assertEq('skipped', oFromString.unimportant, 'Oj|');
});
t.test('testClassSerialization', () => {
    let hl = new Hand(1, 'left');
    let hr = new Hand(1, 'right');
    let person = new Person('jim');

    person.hands = [hl, hr];
    hl.fingers = [new Finger(1, 'fl1'), new Finger(2, 'fl2'), new Finger(3, 'fl3')];
    hr.fingers = [new Finger(11, 'fr1'), new Finger(12, 'fr2'), new Finger(13, 'fr3')];
    hl.currentOrientation = 'dn';
    hl.holding = ['a', 'b'];
    let expectedS = longstr(
        `p=jim,h=[hid=1,hnm=left,hol=a|b,o=dn,f=[id=1nm=[fl1],
        id=2nm=[fl2],id=3nm=[fl3]],hid=1,hnm=right,hol=,o=up,f=[id=11nm=[fr1],
        id=12nm=[fr2],id=13nm=[fr3]]]`,
        '',
    );
    assertEq(expectedS, person.asString(), 'Oi|');

    let serialized = JSON.stringify(serialize(person));
    let got = deserialize<Person>(Person, JSON.parse(serialized));

    // o was marked as skip, so it should return to the default value
    let expectedDeser = expectedS.replace(/,o=dn,/, ',o=up,');
    assertEq(expectedDeser, got.asString(), 'Oh|');

    // round trip it
    let serialized2 = JSON.stringify(serialize(got));
    let got2 = deserialize<Person>(Person, JSON.parse(serialized2));
    assertEq(expectedDeser, got2.asString(), 'Og|');
});
t.test('testClassSerializationWithNulls', () => {
    t.say(/*——————————*/ 'with empty array');
    let h = new Hand(1, 'test');
    h.holding = [];
    let expectedS = 'hid=1,hnm=test,hol=,o=up,f=[]';
    assertEq(expectedS, h.asString(), 'Of|');
    let serialized = JSON.stringify(serialize(h));
    let got = deserialize<Hand>(Hand, JSON.parse(serialized));
    assertEq(expectedS, got.asString(), 'Oe|');

    t.say(/*——————————*/ 'with array with null and undefined');
    h = new Hand(1, 'test');
    h.holding = [null as any, undefined as any];
    expectedS = 'hid=1,hnm=test,hol=|,o=up,f=[]';
    assertEq(expectedS, h.asString(), 'Od|');
    serialized = JSON.stringify(serialize(h));
    got = deserialize<Hand>(Hand, JSON.parse(serialized));
    assertEq(expectedS, got.asString(), 'Oc|');
    assertEq(2, got.holding.length, 'Ob|');
    assertTrue(got.holding[0] === null, 'Oa|expected null->null');
    assertTrue(got.holding[1] === null, 'OZ|expected undefined->null');

    t.say(/*——————————*/ 'with array with undefined between values');
    h = new Hand(1, 'test');
    h.holding = ['a', undefined, 'c'];
    expectedS = 'hid=1,hnm=test,hol=a||c,o=up,f=[]';
    assertEq(expectedS, h.asString(), 'OY|');
    serialized = JSON.stringify(serialize(h));
    got = deserialize<Hand>(Hand, JSON.parse(serialized));
    assertEq(expectedS, got.asString(), 'OX|');
    assertEq(3, got.holding.length, 'OW|');
    assertTrue(got.holding[0] === 'a', 'OV|');
    assertTrue(got.holding[1] === null, 'OU|expected undefined->null');
    assertTrue(got.holding[2] === 'c', 'OT|');
});

t = new SimpleSensibleTestCategory('testsBenBaseLessUsefulLibs');
export let testBenBaseLessUsefulLibs = t;

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
        'OB|',
    );
});

declare namespace csv {
    function encode(o: any): string;
}

class Person {
    constructor(public name: string) {}
    @Type(() => Hand)
    hands: Hand[] = [];
    asString() {
        let h = this.hands.map(a => a.asString()).join(',');
        return `p=${this.name},h=[${h}]`;
    }
}

class Hand {
    constructor(public id: number, private _name: string) {}

    holding: O<string>[] = [];

    @Skip()
    currentOrientation = 'up';

    @Type(() => Finger)
    fingers: Finger[] = [];

    @Skip()
    get name() {
        return this._name;
    }

    getCountFingers() {
        return this.fingers.length;
    }

    asString() {
        let f = this.fingers.map(a => a.asString()).join(',');
        return `hid=${this.id},hnm=${this.name},hol=${this.holding.join('|')},o=${
            this.currentOrientation
        },f=[${f}]`;
    }
}

class Finger {
    constructor(public id: number, public name: string) {}
    asString() {
        return `id=${this.id}nm=[${this.name}]`;
    }
}

class ClassTestSimpleSerialization {
    constructor(public id: string) {}
    public content = 'content';
    @Skip() unimportant = 'skipped';
}
