
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase, assertThrows } from '../../ui512/utils/utilsTest.js';

/**
 * tests on the static methods of Util512
 */
let mTests: (string | Function)[] = [
    'testUtil512Repeat.String',
    () => {
        assertEq(['a', 'a', 'a'], Util512.repeat(3, 'a'), '');
        assertEq(['a'], Util512.repeat(1, 'a'), '');
        assertEq([], Util512.repeat(0, 'a'), '');
    },
    'testUtil512Repeat.Number',
    () => {
        assertEq([4, 4, 4], Util512.repeat(3, 4), '');
        assertEq([4], Util512.repeat(1, 4), '');
        assertEq([], Util512.repeat(0, 4), '');
    },
    'testUtil512ConcatArray.AppendNothing',
    () => {
        let ar = [1, 2, 3];
        Util512.extendArray(ar, []);
        assertEq([1, 2, 3], ar, '');
    },
    'testUtil512ConcatArray.AppendOneElem',
    () => {
        let ar = [1, 2, 3];
        Util512.extendArray(ar, [4]);
        assertEq([1, 2, 3, 4], ar, '');
    },
    'testUtil512ConcatArray.AppendThreeElems',
    () => {
        let ar = [1, 2, 3];
        Util512.extendArray(ar, [4, 5, 6]);
        assertEq([1, 2, 3, 4, 5, 6], ar, '');
    },
    'testUtil512Range.Upwards',
    () => {
        assertEq([0], Util512.range(0, 1), '');
        assertEq([1], Util512.range(1, 2), '');
        assertEq([0, 1, 2, 3], Util512.range(4), '');
        assertEq([2, 3, 4], Util512.range(2, 5), '');
        assertEq([2, 5], Util512.range(2, 8, 3), '');
        assertEq([2, 5, 8], Util512.range(2, 9, 3), '');
        assertEq([2, 5, 8], Util512.range(2, 10, 3), '');
    },
    'testUtil512Range.Downwards',
    () => {
        assertEq([1], Util512.range(1, 0, -1), '');
        assertEq([2], Util512.range(2, 1, -1), '');
        assertEq([5, 4, 3], Util512.range(5, 2, -1), '');
        assertEq([10, 7, 4], Util512.range(10, 2, -3), '');
        assertEq([9, 6, 3], Util512.range(9, 2, -3), '');
        assertEq([8, 5], Util512.range(8, 2, -3), '');
    },
    'testUtil512Range.None',
    () => {
        assertEq([], Util512.range(5, 2), '');
        assertEq([], Util512.range(2, 2), '');
        assertEq([], Util512.range(2, 5, -1), '');
        assertEq([], Util512.range(2, 2, -1), '');
    },
    'testUtil512capitalizeFirst.NonAlphabet',
    () => {
        assertEq('', Util512.capitalizeFirst(''), '');
        assertEq('1', Util512.capitalizeFirst('1'), '');
        assertEq('0123', Util512.capitalizeFirst('0123'), '');
        assertEq('\t1', Util512.capitalizeFirst('\t1'), '');
        assertEq(' 1', Util512.capitalizeFirst(' 1'), '');
        assertEq('!@#1', Util512.capitalizeFirst('!@#1'), '');
    },
    'testUtil512capitalizeFirst.Alphabet',
    () => {
        assertEq('A', Util512.capitalizeFirst('a'), '');
        assertEq('Abc', Util512.capitalizeFirst('abc'), '');
        assertEq('Def ghi', Util512.capitalizeFirst('def ghi'), '');
        assertEq('A', Util512.capitalizeFirst('A'), '');
        assertEq('ABC', Util512.capitalizeFirst('ABC'), '');
        assertEq('DEF ghi', Util512.capitalizeFirst('DEF ghi'), '');
    },
    'testUtil512EscapeForRegex.NoEscapeNeeded',
    () => {
        assertEq('', Util512.escapeForRegex(''), '');
        assertEq('abc', Util512.escapeForRegex('abc'), '');
        assertEq('a 1 "', Util512.escapeForRegex('a 1 "'), '');
    },
    'testUtil512EscapeForRegex.EscapeNeeded',
    () => {
        assertEq('\\\\', Util512.escapeForRegex('\\'), '');
        assertEq('a\\?b\\?', Util512.escapeForRegex('a?b?'), '');
        assertEq('\\/', Util512.escapeForRegex('/'), '');
        assertEq('a\\/b', Util512.escapeForRegex('a/b'), '');
        assertEq('\\+', Util512.escapeForRegex('+'), '');
        assertEq('a\\+b', Util512.escapeForRegex('a+b'), '');
        assertEq('\\+\\+', Util512.escapeForRegex('++'), '');
        assertEq('a\\+\\+b', Util512.escapeForRegex('a++b'), '');
    },
    'testUtil512EscapeForRegex.Consecutive',
    () => {
        assertEq('', Util512.escapeForRegex(''), '');
        assertEq('abc', Util512.escapeForRegex('abc'), '');
        assertEq('\\[abc\\]', Util512.escapeForRegex('[abc]'), '');
        assertEq('123\\[abc\\]456', Util512.escapeForRegex('123[abc]456'), '');
        assertEq('\\.\\.', Util512.escapeForRegex('..'), '');
        assertEq('\\|\\|', Util512.escapeForRegex('||'), '');
        assertEq('\\[\\[', Util512.escapeForRegex('[['), '');
        assertEq('\\]\\]', Util512.escapeForRegex(']]'), '');
        assertEq('\\(\\(', Util512.escapeForRegex('(('), '');
        assertEq('\\)\\)', Util512.escapeForRegex('))'), '');
        assertEq('\\/\\/', Util512.escapeForRegex('//'), '');
        assertEq('\\\\\\\\', Util512.escapeForRegex('\\\\'), '');
    },
    'testUtil512WeakUuid',
    () => {
        let uid1 = Util512.weakUuid();
        let uid2 = Util512.weakUuid();
        assertTrue(uid1 !== uid2, '');

        let uid = Util512.weakUuid();
        assertEq(36, uid.length, '');
        for (let i = 0; i < uid.length; i++) {
            let c = uid.charAt(i);
            if (i === 23 || i === 18 || i === 13 || i === 8) {
                assertEq('-', c, '');
            } else {
                assertTrue(scontains('0123456789abcdef', c), '');
            }
        }
    },
    'testUtil512getRandIntInclusiveWeak.OKIfBoundsEqual',
    () => {
        assertEq(1, Util512.getRandIntInclusiveWeak(1, 1), '');
        assertEq(2, Util512.getRandIntInclusiveWeak(2, 2), '');
        assertEq(3, Util512.getRandIntInclusiveWeak(3, 3), '');
    },
    'testUtil512getRandIntInclusiveWeak',
    () => {
        let got = Util512.getRandIntInclusiveWeak(1, 3);
        assertTrue(got >= 1 && got <= 3, '');
        got = Util512.getRandIntInclusiveWeak(4, 6);
        assertTrue(got >= 4 && got <= 6, '');
        got = Util512.getRandIntInclusiveWeak(7, 9);
        assertTrue(got >= 7 && got <= 9, '');
    },
    'testUtil512Base64UrlSafe.StripsAndReAddEqualsSign',
    () => {
        let roundTrip = (a: string, b: string) => {
            assertEq(Util512.toBase64UrlSafe(a), b, '');
            assertEq(Util512.fromBase64UrlSafe(b), a, '');
        };

        roundTrip('abc', 'YWJj');
        roundTrip('abcd', 'YWJjZA');
        roundTrip('abcde', 'YWJjZGU');
        roundTrip('abcdef', 'YWJjZGVm');
        roundTrip('abcdefg', 'YWJjZGVmZw');
    },
    'testUtil512Base64UrlSafe.ReplacesWithUnderscoreAndDash',
    () => {
        let roundTrip = (a: string, b: string) => {
            assertEq(Util512.toBase64UrlSafe(a), b, '');
            assertEq(Util512.fromBase64UrlSafe(b), a, '');
        };

        roundTrip('\x01\x05\xf8\xff', 'AQX4_w');
        roundTrip('\x01\x05\xf8\xffX', 'AQX4_1g');
        roundTrip('\x01\x05\xf8\xffXY', 'AQX4_1hZ');
        roundTrip('\x01\x05\xf8\xffXYZ', 'AQX4_1hZWg');
        roundTrip('\x01\x05\xf8\xffXYZ<', 'AQX4_1hZWjw');
        roundTrip('\x01\x05\xf8\xffXYZ<>', 'AQX4_1hZWjw-');
    },
    'testUtil512isMapEmpty.PlainObject',
    () => {
        let obj0 = {};
        let obj1 = { a: true };
        let obj2 = { abc: 'abc', def: 'def' };
        assertTrue(Util512.isMapEmpty(obj0), '');
        assertTrue(!Util512.isMapEmpty(obj1), '');
        assertTrue(!Util512.isMapEmpty(obj2), '');
    },
    'testUtil512isMapEmpty.Class',
    () => {
        let cls0 = new TestClsEmpty();
        let cls1 = new TestClsOne();
        let cls2 = new TestClsOne();
        (cls2 as any).aSingleAdded = 1;
        assertTrue(Util512.isMapEmpty(cls0 as any), '');
        assertTrue(!Util512.isMapEmpty(cls1 as any), '');
        assertTrue(!Util512.isMapEmpty(cls2 as any), '');
    },
    'testUtil512freezeProperty.PlainObject',
    () => {
        let obj1 = { a: true, b: true };
        Util512.freezeProperty(obj1, 'a');
        obj1.b = false;
        assertThrows('', '', () => {
            obj1.a = false;
        });
    },
    'testUtil512freezeProperty.Class',
    () => {
        let cls1 = new TestClsOne();
        Util512.freezeProperty(cls1, 'aSingleProp');
        assertThrows('', '', () => {
            cls1.aSingleProp = false;
        });
    },
    'testUtil512freezeRecurse.PlainObject',
    () => {
        let obj = { a: true, b: true };
        assertTrue(!Object.isFrozen(obj), '');
        Util512.freezeRecurse(obj);
        assertThrows('', '', () => {
            obj.a = false;
        });
    },
    'testUtil512freezeRecurse.Class',
    () => {
        let cls1 = new TestClsOne();
        let cls2 = new TestClsOne();
        let cls3 = new TestClsOne();
        (cls1 as any).child = cls2;
        (cls2 as any).child = cls3;
        (cls3 as any).nullchild = undefined;
        assertTrue(!Object.isFrozen(cls1), '');
        Util512.freezeRecurse(cls1);
        assertTrue(Object.isFrozen(cls1), '');
        assertTrue(Object.isFrozen(cls2), '');
        assertTrue(Object.isFrozen(cls3), '');
        assertThrows('', '', () => {
            cls1.aSingleProp = false;
        });

        assertThrows('', '', () => {
            (cls1 as any).newProp = true;
        });
    },
    'testUtil512getMapKeys.PlainObject',
    () => {
        let obj0 = {};
        let obj1 = { a: true };
        let obj2 = { abc: 'abc', def: '_def' };
        assertEq([], sorted(Util512.getMapKeys(obj0)), '');
        assertEq(['a'], sorted(Util512.getMapKeys(obj1)), '');
        assertEq(['abc', 'def'], sorted(Util512.getMapKeys(obj2)), '');
    },
    'testUtil512getMapKeys.Class',
    () => {
        let cls0 = new TestClsEmpty();
        let cls1 = new TestClsOne();
        let cls2 = new TestClsOne();
        (cls2 as any).aSingleAdded = 1;
        assertEq([], sorted(Util512.getMapKeys(cls0 as any)), '');
        assertEq(['aSingleProp'], sorted(Util512.getMapKeys(cls1 as any)), '');
        assertEq(['aSingleAdded', 'aSingleProp'], sorted(Util512.getMapKeys(cls2 as any)), '');
    },
    'testUtil512getMapVals.PlainObject',
    () => {
        let obj0 = {};
        let obj1 = { a: true };
        let obj2 = { abc: 'abc', def: '_def' };
        assertEq([], sorted(Util512.getMapVals(obj0)), '');
        assertEq([true], sorted(Util512.getMapVals(obj1)), '');
        assertEq(['_def', 'abc'], sorted(Util512.getMapVals(obj2)), '');
    },
    'testUtil512getMapVals.Class',
    () => {
        let cls0 = new TestClsEmpty();
        let cls1 = new TestClsOne();
        let cls2 = new TestClsOne();
        (cls2 as any).aSingleAdded = false;
        assertEq([], sorted(Util512.getMapVals(cls0 as any)), '');
        assertEq([true], sorted(Util512.getMapVals(cls1 as any)), '');
        assertEq([false, true], sorted(Util512.getMapVals(cls2 as any)), '');
    },
    'testUtil512getMapShallowClone.PlainObject',
    () => {
        let obj0 = {};
        let obj1 = { a: true };
        let obj2 = { abc: 'abc', def: '_def' };
        let clone0 = Util512.shallowClone(obj0);
        let clone1 = Util512.shallowClone(obj1);
        let clone2 = Util512.shallowClone(obj2);
        assertEq([], sorted(Util512.getMapKeys(clone0)), '');
        assertEq(['a'], sorted(Util512.getMapKeys(clone1)), '');
        assertEq(['abc', 'def'], sorted(Util512.getMapKeys(clone2)), '');
    },
    'testUtil512getMapShallowClone.Class',
    () => {
        let cls0 = new TestClsEmpty();
        let cls1 = new TestClsOne();
        let cls2 = new TestClsOne();
        (cls2 as any).aSingleAdded = 1;
        let clone0 = Util512.shallowClone(cls0);
        let clone1 = Util512.shallowClone(cls1);
        let clone2 = Util512.shallowClone(cls2);
        assertEq([], sorted(Util512.getMapKeys(clone0)), '');
        assertEq(['aSingleProp'], sorted(Util512.getMapKeys(clone1)), '');
        assertEq(['aSingleAdded', 'aSingleProp'], sorted(Util512.getMapKeys(clone2)), '');
    },
    'testUtil512callAsMethod.BadCharInMethodName',
    () => {
        let o = new TestClsWithMethods();
        assertThrows('', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '', [true, 1], true)
        );

        assertThrows('', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, 'a b', [true, 1], true)
        );

        assertThrows('', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, 'a', [true, 1], true)
        );

        assertThrows('', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '?', [true, 1], true)
        );

        assertThrows('', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '1a', [true, 1], true)
        );

        assertThrows('', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '_c', [true, 1], true)
        );

        assertThrows('', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '__c', [true, 1], true)
        );

        assertThrows('', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '.', [true, 1], true)
        );

        assertThrows('', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, 'a.b', [true, 1], true)
        );
    },
    'testUtil512callAsMethod.MissingMethodWhenAllowed',
    () => {
        let o = new TestClsWithMethods();
        Util512.callAsMethodOnClass('TestClsWithMethods', o, 'notExist', [true, 1], true);
    },
    'testUtil512callAsMethod.MissingMethodWhenDisAllowed',
    () => {
        let o = new TestClsWithMethods();
        assertThrows('', 'could not find', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, 'notExist', [true, 1], false)
        );
    },
    'testUtil512callAsMethod.ValidMethod',
    () => {
        let o1 = new TestClsWithMethods();
        Util512.callAsMethodOnClass('TestClsWithMethods', o1, 'goAbc', [true, 1], false);
        assertEq(true, o1.calledAbc, '');
        assertEq(false, o1.calledZ, '');
        let o2 = new TestClsWithMethods();
        Util512.callAsMethodOnClass('TestClsWithMethods', o2, 'goZ', [true, 1], false);
        assertEq(false, o2.calledAbc, '');
        assertEq(true, o2.calledZ, '');
    },
    'testUtil512callAsMethod.isMethodOnClass',
    () => {
        let o1 = new TestClsWithMethods();
        assertTrue(Util512.isMethodOnClass(o1, 'goAbc'), '');
        assertTrue(Util512.isMethodOnClass(o1, 'goZ'), '');
        assertTrue(!Util512.isMethodOnClass(o1, 'goAbcd'), '');
        assertTrue(!Util512.isMethodOnClass(o1, 'calledAbc'), '');
        assertTrue(!Util512.isMethodOnClass(o1, 'notPresent'), '');
        assertTrue(!Util512.isMethodOnClass(o1, ''), '');
    },
    'testUtil512padStart',
    () => {
        assertEq('123', Util512.padStart(123, 2, '0'), '');
        assertEq('123', Util512.padStart(123, 3, '0'), '');
        assertEq('0123', Util512.padStart(123, 4, '0'), '');
        assertEq('00123', Util512.padStart(123, 5, '0'), '');
    },
    'testUtil512arrayToBase64.arrayOfNumbers',
    () => {
        let nums = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
        assertEq('aGVsbG8=', Util512.arrayToBase64(nums), '');
    },
    'testUtil512arrayToBase64.Uint8Array',
    () => {
        let nums = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
        let uint8 = new Uint8Array(nums);
        assertEq('aGVsbG8=', Util512.arrayToBase64(uint8), '');
    },
    'testUtil512arrayToBase64.ArrayBuffer',
    () => {
        let nums = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
        let buffer = new ArrayBuffer(nums.length);
        let view = new Uint8Array(buffer);
        for (let i = 0; i < nums.length; i++) {
            view[i] = nums[i];
        }

        assertEq('aGVsbG8=', Util512.arrayToBase64(view), '');
    },
    'testUtil512generateUniqueBase64UrlSafe',
    () => {
        let generated1 = Util512.generateUniqueBase64UrlSafe(8, '!');
        let generated2 = Util512.generateUniqueBase64UrlSafe(8, '!');
        assertTrue(generated1 !== generated2, '');
        assertEq('!', Util512.fromBase64UrlSafe(generated1)[0], '');
        assertEq('!', Util512.fromBase64UrlSafe(generated2)[0], '');
    }
];

/**
 * exported test class for mTests
 */
export class TestUtil512Class extends UI512TestBase {
    tests = mTests;
}

/**
 * test-only code. class with no members
 */
class TestClsEmpty {}

/**
 * test-only code. class with 1 member
 */
class TestClsOne {
    aSingleProp = true;
}

/**
 * test-only code. class with methods
 */
class TestClsWithMethods {
    calledAbc = false;
    calledZ = false;
    goAbc(p1: boolean, p2: number) {
        assertEq(true, p1, '');
        assertEq(1, p2, '');
        this.calledAbc = true;
    }

    goZ(p1: boolean, p2: number) {
        assertEq(true, p1, '');
        assertEq(1, p2, '');
        this.calledZ = true;
    }
}

/**
 * test-only code, since this is needlessly slow (like Python's sorted)
 */
function sorted(ar: any[]) {
    let arCopy = ar.slice();
    arCopy.sort();
    return arCopy;
}
