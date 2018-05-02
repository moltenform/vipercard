
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase, assertThrows } from '../../ui512/utils/utilsTest.js';

/**
 * tests on the static methods of Util512
 */
let mTests: (string | Function)[] = [
    'testUtil512Repeat.String',
    () => {
        assertEq(['a', 'a', 'a'], Util512.repeat(3, 'a'), 'F4|');
        assertEq(['a'], Util512.repeat(1, 'a'), 'F3|');
        assertEq([], Util512.repeat(0, 'a'), 'F2|');
    },
    'testUtil512Repeat.Number',
    () => {
        assertEq([4, 4, 4], Util512.repeat(3, 4), 'F1|');
        assertEq([4], Util512.repeat(1, 4), 'F0|');
        assertEq([], Util512.repeat(0, 4), 'E~|');
    },
    'testUtil512ConcatArray.AppendNothing',
    () => {
        let ar = [1, 2, 3];
        Util512.extendArray(ar, []);
        assertEq([1, 2, 3], ar, 'E}|');
    },
    'testUtil512ConcatArray.AppendOneElem',
    () => {
        let ar = [1, 2, 3];
        Util512.extendArray(ar, [4]);
        assertEq([1, 2, 3, 4], ar, 'E||');
    },
    'testUtil512ConcatArray.AppendThreeElems',
    () => {
        let ar = [1, 2, 3];
        Util512.extendArray(ar, [4, 5, 6]);
        assertEq([1, 2, 3, 4, 5, 6], ar, 'E{|');
    },
    'testUtil512Range.Upwards',
    () => {
        assertEq([0], Util512.range(0, 1), 'E`|');
        assertEq([1], Util512.range(1, 2), 'E_|');
        assertEq([0, 1, 2, 3], Util512.range(4), 'E^|');
        assertEq([2, 3, 4], Util512.range(2, 5), 'E]|');
        assertEq([2, 5], Util512.range(2, 8, 3), 'E[|');
        assertEq([2, 5, 8], Util512.range(2, 9, 3), 'E@|');
        assertEq([2, 5, 8], Util512.range(2, 10, 3), 'E?|');
    },
    'testUtil512Range.Downwards',
    () => {
        assertEq([1], Util512.range(1, 0, -1), 'E>|');
        assertEq([2], Util512.range(2, 1, -1), 'E=|');
        assertEq([5, 4, 3], Util512.range(5, 2, -1), 'E<|');
        assertEq([10, 7, 4], Util512.range(10, 2, -3), 'E;|');
        assertEq([9, 6, 3], Util512.range(9, 2, -3), 'E:|');
        assertEq([8, 5], Util512.range(8, 2, -3), 'E/|');
    },
    'testUtil512Range.None',
    () => {
        assertEq([], Util512.range(5, 2), 'E.|');
        assertEq([], Util512.range(2, 2), 'E-|');
        assertEq([], Util512.range(2, 5, -1), 'E,|');
        assertEq([], Util512.range(2, 2, -1), 'E+|');
    },
    'testUtil512capitalizeFirst.NonAlphabet',
    () => {
        assertEq('', Util512.capitalizeFirst(''), 'E*|');
        assertEq('1', Util512.capitalizeFirst('1'), 'E)|');
        assertEq('0123', Util512.capitalizeFirst('0123'), 'E(|');
        assertEq('\t1', Util512.capitalizeFirst('\t1'), 'E&|');
        assertEq(' 1', Util512.capitalizeFirst(' 1'), 'E%|');
        assertEq('!@#1', Util512.capitalizeFirst('!@#1'), 'E$|');
    },
    'testUtil512capitalizeFirst.Alphabet',
    () => {
        assertEq('A', Util512.capitalizeFirst('a'), 'E#|');
        assertEq('Abc', Util512.capitalizeFirst('abc'), 'E!|');
        assertEq('Def ghi', Util512.capitalizeFirst('def ghi'), 'E |');
        assertEq('A', Util512.capitalizeFirst('A'), 'Ez|');
        assertEq('ABC', Util512.capitalizeFirst('ABC'), 'Ey|');
        assertEq('DEF ghi', Util512.capitalizeFirst('DEF ghi'), 'Ex|');
    },
    'testUtil512EscapeForRegex.NoEscapeNeeded',
    () => {
        assertEq('', Util512.escapeForRegex(''), 'Ew|');
        assertEq('abc', Util512.escapeForRegex('abc'), 'Ev|');
        assertEq('a 1 "', Util512.escapeForRegex('a 1 "'), 'Eu|');
    },
    'testUtil512EscapeForRegex.EscapeNeeded',
    () => {
        assertEq('\\\\', Util512.escapeForRegex('\\'), 'Et|');
        assertEq('a\\?b\\?', Util512.escapeForRegex('a?b?'), 'Es|');
        assertEq('\\/', Util512.escapeForRegex('/'), 'Er|');
        assertEq('a\\/b', Util512.escapeForRegex('a/b'), 'Eq|');
        assertEq('\\+', Util512.escapeForRegex('+'), 'Ep|');
        assertEq('a\\+b', Util512.escapeForRegex('a+b'), 'Eo|');
        assertEq('\\+\\+', Util512.escapeForRegex('++'), 'En|');
        assertEq('a\\+\\+b', Util512.escapeForRegex('a++b'), 'Em|');
    },
    'testUtil512EscapeForRegex.Consecutive',
    () => {
        assertEq('', Util512.escapeForRegex(''), 'El|');
        assertEq('abc', Util512.escapeForRegex('abc'), 'Ek|');
        assertEq('\\[abc\\]', Util512.escapeForRegex('[abc]'), 'Ej|');
        assertEq('123\\[abc\\]456', Util512.escapeForRegex('123[abc]456'), 'Ei|');
        assertEq('\\.\\.', Util512.escapeForRegex('..'), 'Eh|');
        assertEq('\\|\\|', Util512.escapeForRegex('||'), '');
        assertEq('\\[\\[', Util512.escapeForRegex('[['), 'Eg|');
        assertEq('\\]\\]', Util512.escapeForRegex(']]'), 'Ef|');
        assertEq('\\(\\(', Util512.escapeForRegex('(('), 'Ee|');
        assertEq('\\)\\)', Util512.escapeForRegex('))'), 'Ed|');
        assertEq('\\/\\/', Util512.escapeForRegex('//'), 'Ec|');
        assertEq('\\\\\\\\', Util512.escapeForRegex('\\\\'), 'Eb|');
    },
    'testUtil512WeakUuid',
    () => {
        let uid1 = Util512.weakUuid();
        let uid2 = Util512.weakUuid();
        assertTrue(uid1 !== uid2, 'Ea|');

        let uid = Util512.weakUuid();
        assertEq(36, uid.length, 'EZ|');
        for (let i = 0; i < uid.length; i++) {
            let c = uid.charAt(i);
            if (i === 23 || i === 18 || i === 13 || i === 8) {
                assertEq('-', c, 'EY|');
            } else {
                assertTrue(scontains('0123456789abcdef', c), 'EX|');
            }
        }
    },
    'testUtil512getRandIntInclusiveWeak.OKIfBoundsEqual',
    () => {
        assertEq(1, Util512.getRandIntInclusiveWeak(1, 1), 'EW|');
        assertEq(2, Util512.getRandIntInclusiveWeak(2, 2), 'EV|');
        assertEq(3, Util512.getRandIntInclusiveWeak(3, 3), 'EU|');
    },
    'testUtil512getRandIntInclusiveWeak',
    () => {
        let got = Util512.getRandIntInclusiveWeak(1, 3);
        assertTrue(got >= 1 && got <= 3, 'ET|');
        got = Util512.getRandIntInclusiveWeak(4, 6);
        assertTrue(got >= 4 && got <= 6, 'ES|');
        got = Util512.getRandIntInclusiveWeak(7, 9);
        assertTrue(got >= 7 && got <= 9, 'ER|');
    },
    'testUtil512Base64UrlSafe.StripsAndReAddEqualsSign',
    () => {
        let roundTrip = (a: string, b: string) => {
            assertEq(Util512.toBase64UrlSafe(a), b, 'EQ|');
            assertEq(Util512.fromBase64UrlSafe(b), a, 'EP|');
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
            assertEq(Util512.toBase64UrlSafe(a), b, 'EO|');
            assertEq(Util512.fromBase64UrlSafe(b), a, 'EN|');
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
        assertTrue(Util512.isMapEmpty(obj0), 'EM|');
        assertTrue(!Util512.isMapEmpty(obj1), 'EL|');
        assertTrue(!Util512.isMapEmpty(obj2), 'EK|');
    },
    'testUtil512isMapEmpty.Class',
    () => {
        let cls0 = new TestClsEmpty();
        let cls1 = new TestClsOne();
        let cls2 = new TestClsOne();
        (cls2 as any).aSingleAdded = 1;
        assertTrue(Util512.isMapEmpty(cls0 as any), 'EJ|');
        assertTrue(!Util512.isMapEmpty(cls1 as any), 'EI|');
        assertTrue(!Util512.isMapEmpty(cls2 as any), 'EH|');
    },
    'testUtil512freezeProperty.PlainObject',
    () => {
        let obj1 = { a: true, b: true };
        Util512.freezeProperty(obj1, 'a');
        obj1.b = false;
        assertThrows('Lt|', '', () => {
            obj1.a = false;
        });
    },
    'testUtil512freezeProperty.Class',
    () => {
        let cls1 = new TestClsOne();
        Util512.freezeProperty(cls1, 'aSingleProp');
        assertThrows('Ls|', '', () => {
            cls1.aSingleProp = false;
        });
    },
    'testUtil512freezeRecurse.PlainObject',
    () => {
        let obj = { a: true, b: true };
        assertTrue(!Object.isFrozen(obj), 'EG|');
        Util512.freezeRecurse(obj);
        assertThrows('Lr|', '', () => {
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
        assertTrue(!Object.isFrozen(cls1), 'EF|');
        Util512.freezeRecurse(cls1);
        assertTrue(Object.isFrozen(cls1), 'EE|');
        assertTrue(Object.isFrozen(cls2), 'ED|');
        assertTrue(Object.isFrozen(cls3), 'EC|');
        assertThrows('Lq|', '', () => {
            cls1.aSingleProp = false;
        });

        assertThrows('Lp|', '', () => {
            (cls1 as any).newProp = true;
        });
    },
    'testUtil512getMapKeys.PlainObject',
    () => {
        let obj0 = {};
        let obj1 = { a: true };
        let obj2 = { abc: 'abc', def: '_def' };
        assertEq([], sorted(Util512.getMapKeys(obj0)), 'EB|');
        assertEq(['a'], sorted(Util512.getMapKeys(obj1)), 'EA|');
        assertEq(['abc', 'def'], sorted(Util512.getMapKeys(obj2)), 'E9|');
    },
    'testUtil512getMapKeys.Class',
    () => {
        let cls0 = new TestClsEmpty();
        let cls1 = new TestClsOne();
        let cls2 = new TestClsOne();
        (cls2 as any).aSingleAdded = 1;
        assertEq([], sorted(Util512.getMapKeys(cls0 as any)), 'E8|');
        assertEq(['aSingleProp'], sorted(Util512.getMapKeys(cls1 as any)), 'E7|');
        assertEq(['aSingleAdded', 'aSingleProp'], sorted(Util512.getMapKeys(cls2 as any)), 'E6|');
    },
    'testUtil512getMapVals.PlainObject',
    () => {
        let obj0 = {};
        let obj1 = { a: true };
        let obj2 = { abc: 'abc', def: '_def' };
        assertEq([], sorted(Util512.getMapVals(obj0)), 'E5|');
        assertEq([true], sorted(Util512.getMapVals(obj1)), 'E4|');
        assertEq(['_def', 'abc'], sorted(Util512.getMapVals(obj2)), 'E3|');
    },
    'testUtil512getMapVals.Class',
    () => {
        let cls0 = new TestClsEmpty();
        let cls1 = new TestClsOne();
        let cls2 = new TestClsOne();
        (cls2 as any).aSingleAdded = false;
        assertEq([], sorted(Util512.getMapVals(cls0 as any)), 'E2|');
        assertEq([true], sorted(Util512.getMapVals(cls1 as any)), 'E1|');
        assertEq([false, true], sorted(Util512.getMapVals(cls2 as any)), 'E0|');
    },
    'testUtil512getMapShallowClone.PlainObject',
    () => {
        let obj0 = {};
        let obj1 = { a: true };
        let obj2 = { abc: 'abc', def: '_def' };
        let clone0 = Util512.shallowClone(obj0);
        let clone1 = Util512.shallowClone(obj1);
        let clone2 = Util512.shallowClone(obj2);
        assertEq([], sorted(Util512.getMapKeys(clone0)), 'D~|');
        assertEq(['a'], sorted(Util512.getMapKeys(clone1)), 'D}|');
        assertEq(['abc', 'def'], sorted(Util512.getMapKeys(clone2)), 'D||');
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
        assertEq([], sorted(Util512.getMapKeys(clone0)), 'D{|');
        assertEq(['aSingleProp'], sorted(Util512.getMapKeys(clone1)), 'D`|');
        assertEq(['aSingleAdded', 'aSingleProp'], sorted(Util512.getMapKeys(clone2)), 'D_|');
    },
    'testUtil512callAsMethod.BadCharInMethodName',
    () => {
        let o = new TestClsWithMethods();
        assertThrows('Lo|', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '', [true, 1], true)
        );

        assertThrows('Ln|', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, 'a b', [true, 1], true)
        );

        assertThrows('Lm|', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, 'a', [true, 1], true)
        );

        assertThrows('Ll|', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '?', [true, 1], true)
        );

        assertThrows('Lk|', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '1a', [true, 1], true)
        );

        assertThrows('Lj|', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '_c', [true, 1], true)
        );

        assertThrows('Li|', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '__c', [true, 1], true)
        );

        assertThrows('Lh|', 'requires alphanumeric', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, '.', [true, 1], true)
        );

        assertThrows('Lg|', 'requires alphanumeric', () =>
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
        assertThrows('Lf|', 'could not find', () =>
            Util512.callAsMethodOnClass('TestClsWithMethods', o, 'notExist', [true, 1], false)
        );
    },
    'testUtil512callAsMethod.ValidMethod',
    () => {
        let o1 = new TestClsWithMethods();
        Util512.callAsMethodOnClass('TestClsWithMethods', o1, 'goAbc', [true, 1], false);
        assertEq(true, o1.calledAbc, 'D^|');
        assertEq(false, o1.calledZ, 'D]|');
        let o2 = new TestClsWithMethods();
        Util512.callAsMethodOnClass('TestClsWithMethods', o2, 'goZ', [true, 1], false);
        assertEq(false, o2.calledAbc, 'D[|');
        assertEq(true, o2.calledZ, 'D@|');
    },
    'testUtil512callAsMethod.isMethodOnClass',
    () => {
        let o1 = new TestClsWithMethods();
        assertTrue(Util512.isMethodOnClass(o1, 'goAbc'), 'D?|');
        assertTrue(Util512.isMethodOnClass(o1, 'goZ'), 'D>|');
        assertTrue(!Util512.isMethodOnClass(o1, 'goAbcd'), 'D=|');
        assertTrue(!Util512.isMethodOnClass(o1, 'calledAbc'), 'D<|');
        assertTrue(!Util512.isMethodOnClass(o1, 'notPresent'), 'D;|');
        assertTrue(!Util512.isMethodOnClass(o1, ''), 'D:|');
    },
    'testUtil512padStart',
    () => {
        assertEq('123', Util512.padStart(123, 2, '0'), 'D/|');
        assertEq('123', Util512.padStart(123, 3, '0'), 'D.|');
        assertEq('0123', Util512.padStart(123, 4, '0'), 'D-|');
        assertEq('00123', Util512.padStart(123, 5, '0'), 'D,|');
    },
    'testUtil512arrayToBase64.arrayOfNumbers',
    () => {
        let nums = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
        assertEq('aGVsbG8=', Util512.arrayToBase64(nums), 'D+|');
    },
    'testUtil512arrayToBase64.Uint8Array',
    () => {
        let nums = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
        let uint8 = new Uint8Array(nums);
        assertEq('aGVsbG8=', Util512.arrayToBase64(uint8), 'D*|');
    },
    'testUtil512arrayToBase64.ArrayBuffer',
    () => {
        let nums = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
        let buffer = new ArrayBuffer(nums.length);
        let view = new Uint8Array(buffer);
        for (let i = 0; i < nums.length; i++) {
            view[i] = nums[i];
        }

        assertEq('aGVsbG8=', Util512.arrayToBase64(view), 'D)|');
    },
    'testUtil512generateUniqueBase64UrlSafe',
    () => {
        let generated1 = Util512.generateUniqueBase64UrlSafe(8, '!');
        let generated2 = Util512.generateUniqueBase64UrlSafe(8, '!');
        assertTrue(generated1 !== generated2, 'D(|');
        assertEq('!', Util512.fromBase64UrlSafe(generated1)[0], 'D&|');
        assertEq('!', Util512.fromBase64UrlSafe(generated2)[0], 'D%|');
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
        assertEq(true, p1, 'D$|');
        assertEq(1, p2, 'D#|');
        this.calledAbc = true;
    }

    goZ(p1: boolean, p2: number) {
        assertEq(true, p1, 'D!|');
        assertEq(1, p2, 'D |');
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
