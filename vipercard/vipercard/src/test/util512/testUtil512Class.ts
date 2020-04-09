
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { BrowserOSInfo, Util512, assertEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, assertThrows, sorted } from './../testUtils/testUtils';

let t = new SimpleUtil512TestCollection('testCollectionUtil512Class');
export let testCollectionUtil512Class = t;

t.test('isValidNumber', () => {
    assertTrue(Util512.isValidNumber(123), 'O9|');
    assertTrue(Util512.isValidNumber(0), 'O8|');
    assertTrue(!Util512.isValidNumber(null), 'O7|');
    assertTrue(!Util512.isValidNumber(undefined), 'O6|');
    assertTrue(!Util512.isValidNumber(NaN), 'O5|');
    assertTrue(!Util512.isValidNumber(Infinity), 'O4|');
    assertTrue(!Util512.isValidNumber(Number.POSITIVE_INFINITY), 'O3|');
    assertTrue(!Util512.isValidNumber(Number.NEGATIVE_INFINITY), 'O2|');
    assertTrue(!Util512.isValidNumber('12'), 'O1|');
    assertTrue(!Util512.isValidNumber(''), 'O0|');
});
t.test('Range.Upwards', () => {
    assertEq([0], Util512.range(0, 1), 'E`|');
    assertEq([1], Util512.range(1, 2), 'E_|');
    assertEq([0, 1, 2, 3], Util512.range(0, 4), 'E^|');
    assertEq([2, 3, 4], Util512.range(2, 5), 'E]|');
    assertEq([2, 5], Util512.range(2, 8, 3), 'E[|');
    assertEq([2, 5, 8], Util512.range(2, 9, 3), 'E@|');
    assertEq([2, 5, 8], Util512.range(2, 10, 3), 'E?|');
});
t.test('Range.Downwards', () => {
    assertEq([1], Util512.range(1, 0, -1), 'E>|');
    assertEq([2], Util512.range(2, 1, -1), 'E=|');
    assertEq([5, 4, 3], Util512.range(5, 2, -1), 'E<|');
    assertEq([10, 7, 4], Util512.range(10, 2, -3), 'E;|');
    assertEq([9, 6, 3], Util512.range(9, 2, -3), 'E:|');
    assertEq([8, 5], Util512.range(8, 2, -3), 'E/|');
});
t.test('Range.None', () => {
    assertEq([], Util512.range(5, 2), 'E.|');
    assertEq([], Util512.range(2, 2), 'E-|');
    assertEq([], Util512.range(2, 5, -1), 'E,|');
    assertEq([], Util512.range(2, 2, -1), 'E+|');
});
t.test('Repeat', () => {
    t.say(/*——————————*/ 'strings');
    assertEq(['a', 'a', 'a'], Util512.repeat(3, 'a'), 'F4|');
    assertEq(['a'], Util512.repeat(1, 'a'), 'F3|');
    assertEq([], Util512.repeat(0, 'a'), 'F2|');
    t.say(/*——————————*/ 'numbers');
    assertEq([4, 4, 4], Util512.repeat(3, 4), 'F1|');
    assertEq([4], Util512.repeat(1, 4), 'F0|');
    assertEq([], Util512.repeat(0, 4), 'E~|');
});
t.test('setarr', () => {
    let ar1: number[] = [];
    Util512.setarr(ar1, 0, 12, 0);
    assertEq([12], ar1, 'N~|');
    let ar2: number[] = [];
    Util512.setarr(ar2, 1, 12, 0);
    assertEq([0, 12], ar2, 'N}|');
    let ar3: number[] = [];
    Util512.setarr(ar3, 3, 12, 0);
    assertEq([0, 0, 0, 12], ar3, 'N||');
    let ar: number[] = [1, 2];
    Util512.setarr(ar, 0, 12, 0);
    assertEq([12, 2], ar, 'N{|');
    ar = [1, 2];
    Util512.setarr(ar, 2, 12, 0);
    assertEq([1, 2, 12], ar, 'N_|');
    ar = [1, 2];
    Util512.setarr(ar, 3, 12, 0);
    assertEq([1, 2, 0, 12], ar, 'N^|');
});
t.test('extendArray', () => {
    t.say(/*——————————*/ 'AppendNothing');
    let ar = [1, 2, 3];
    Util512.extendArray(ar, []);
    assertEq([1, 2, 3], ar, 'E}|');
    t.say(/*——————————*/ 'AppendOneElem');
    ar = [1, 2, 3];
    Util512.extendArray(ar, [4]);
    assertEq([1, 2, 3, 4], ar, 'E||');
    t.say(/*——————————*/ 'AppendThreeElems');
    ar = [1, 2, 3];
    Util512.extendArray(ar, [4, 5, 6]);
    assertEq([1, 2, 3, 4, 5, 6], ar, 'E{|');
});
t.test('parseIntStrict', () => {
    assertEq(0, Util512.parseIntStrict('0'), 'N]|');
    assertEq(9, Util512.parseIntStrict('9'), 'N[|');
    assertEq(12, Util512.parseIntStrict('12'), 'N@|');
    assertEq(12, Util512.parseIntStrict(' 12'), 'N?|');
    assertEq(12, Util512.parseIntStrict('12 '), 'N>|');
    assertEq(12, Util512.parseIntStrict(' 12 '), 'N=|');
    assertEq(undefined, Util512.parseIntStrict(''), 'N<|');
    assertEq(undefined, Util512.parseIntStrict(undefined), 'N;|');
    assertEq(undefined, Util512.parseIntStrict('1more'), 'N:|');
    assertEq(undefined, Util512.parseIntStrict('1 more'), 'N/|');
    assertEq(undefined, Util512.parseIntStrict('1.1'), 'N.|');
    assertEq(undefined, Util512.parseIntStrict('12a'), 'N-|');
    assertEq(undefined, Util512.parseIntStrict('a12'), 'N,|');
    assertEq(undefined, Util512.parseIntStrict('abc'), 'N+|');
    assertEq(12, Util512.parseIntStrict('012'), 'N*|');
    assertEq(12, Util512.parseIntStrict('0012'), 'N)|');
});
t.test('add', () => {
    assertEq(0, Util512.add(0, 0), 'N(|');
    assertEq(9, Util512.add(4, 5), 'N&|');
    assertEq(6, [1, 2, 3].reduce(Util512.add), 'N%|');
    assertEq(9, [1, 2, 3].reduce(Util512.add, 3), 'N#|');
    assertEq(0, [].reduce(Util512.add, 0), 'N!|');
});
t.test('getBrowserOS', () => {
    let s = longstr(`Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X)
        AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A5370a
        Safari/604.1`);
    assertEq(BrowserOSInfo.Mac, Util512.getBrowserOS(s), 'N |');
    s = longstr(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
        (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246`);
    assertEq(BrowserOSInfo.Windows, Util512.getBrowserOS(s), 'Nz|');
    s = longstr(`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9
        (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9`);
    assertEq(BrowserOSInfo.Mac, Util512.getBrowserOS(s), 'Ny|');
    s = longstr(`Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML,
        like Gecko) Chrome/47.0.2526.111 Safari/537.36`);
    assertEq(BrowserOSInfo.Windows, Util512.getBrowserOS(s), 'Nx|');
    s = longstr(`Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101
        Firefox/15.0.1`);
    assertEq(BrowserOSInfo.Linux, Util512.getBrowserOS(s), 'Nw|');
});
t.test('isMapEmpty.PlainObject', () => {
    let obj0 = {};
    let obj1 = { a: true };
    let obj2 = { abc: 'abc', def: 'def' };
    assertTrue(Util512.isMapEmpty(obj0), 'EM|');
    assertTrue(!Util512.isMapEmpty(obj1), 'EL|');
    assertTrue(!Util512.isMapEmpty(obj2), 'EK|');
});
t.test('isMapEmpty.Class', () => {
    let o0 = new TestClsEmpty();
    let o1 = new TestClsOne();
    let o2 = new TestClsOne();
    (o2 as any).aSingleAdded = 1;
    assertTrue(Util512.isMapEmpty(o0 as any), 'EJ|');
    assertTrue(!Util512.isMapEmpty(o1 as any), 'EI|');
    assertTrue(!Util512.isMapEmpty(o2 as any), 'EH|');
});
t.test('getMapShallowClone.PlainObject', () => {
    let obj0 = {};
    let obj1 = { a: true };
    let obj2 = { abc: 'abc', def: '_def' };
    let clone0 = Util512.shallowClone(obj0);
    let clone1 = Util512.shallowClone(obj1);
    let clone2 = Util512.shallowClone(obj2);
    assertEq([], sorted(Util512.getMapKeys(clone0)), 'D~|');
    assertEq(['a'], sorted(Util512.getMapKeys(clone1)), 'D}|');
    assertEq(['abc', 'def'], sorted(Util512.getMapKeys(clone2)), 'D||');
});
t.test('getMapShallowClone.Class', () => {
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
});
t.test('freezeProperty.PlainObject', () => {
    let obj1 = { a: true, b: true };
    Util512.freezeProperty(obj1, 'a');
    obj1.b = false;
    assertThrows('Lt|', '', () => {
        obj1.a = false;
    });
});
t.test('freezeProperty.Class', () => {
    let cls1 = new TestClsOne();
    Util512.freezeProperty(cls1, 'aSingleProp');
    assertThrows('Ls|', '', () => {
        cls1.aSingleProp = false;
    });
});
t.test('freezeRecurse.PlainObject', () => {
    let obj = { a: true, b: true };
    assertTrue(!Object.isFrozen(obj), 'EG|');
    Util512.freezeRecurse(obj);
    assertThrows('Lr|', '', () => {
        obj.a = false;
    });
});
t.test('freezeRecurse.Class', () => {
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
});
t.test('EscapeForRegex.NoEscapeNeeded', () => {
    assertEq('', Util512.escapeForRegex(''), 'Ew|');
    assertEq('abc', Util512.escapeForRegex('abc'), 'Ev|');
    assertEq('a 1 "', Util512.escapeForRegex('a 1 "'), 'Eu|');
});
t.test('EscapeForRegex.EscapeNeeded', () => {
    assertEq('\\\\', Util512.escapeForRegex('\\'), 'Et|');
    assertEq('a\\?b\\?', Util512.escapeForRegex('a?b?'), 'Es|');
    assertEq('\\/', Util512.escapeForRegex('/'), 'Er|');
    assertEq('a\\/b', Util512.escapeForRegex('a/b'), 'Eq|');
    assertEq('\\+', Util512.escapeForRegex('+'), 'Ep|');
    assertEq('a\\+b', Util512.escapeForRegex('a+b'), 'Eo|');
    assertEq('\\+\\+', Util512.escapeForRegex('++'), 'En|');
    assertEq('a\\+\\+b', Util512.escapeForRegex('a++b'), 'Em|');
});
t.test('EscapeForRegex.Consecutive', () => {
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
});
t.test('capitalizeFirst.NonAlphabet', () => {
    assertEq('', Util512.capitalizeFirst(''), 'E*|');
    assertEq('1', Util512.capitalizeFirst('1'), 'E)|');
    assertEq('0123', Util512.capitalizeFirst('0123'), 'E(|');
    assertEq('\t1', Util512.capitalizeFirst('\t1'), 'E&|');
    assertEq(' 1', Util512.capitalizeFirst(' 1'), 'E%|');
    assertEq('!@#1', Util512.capitalizeFirst('!@#1'), 'E$|');
});
t.test('capitalizeFirst.Alphabet', () => {
    assertEq('A', Util512.capitalizeFirst('a'), 'E#|');
    assertEq('Abc', Util512.capitalizeFirst('abc'), 'E!|');
    assertEq('Def ghi', Util512.capitalizeFirst('def ghi'), 'E |');
    assertEq('A', Util512.capitalizeFirst('A'), 'Ez|');
    assertEq('ABC', Util512.capitalizeFirst('ABC'), 'Ey|');
    assertEq('DEF ghi', Util512.capitalizeFirst('DEF ghi'), 'Ex|');
});
t.test('callAsMethod.BadCharInMethodName', () => {
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
});
t.test('callAsMethod.MissingMethodWhenAllowed', () => {
    let o = new TestClsWithMethods();
    Util512.callAsMethodOnClass('TestClsWithMethods', o, 'notExist', [true, 1], true);
});
t.test('callAsMethod.MissingMethodWhenDisAllowed', () => {
    let o = new TestClsWithMethods();
    assertThrows('Lf|', 'could not find', () =>
        Util512.callAsMethodOnClass('TestClsWithMethods', o, 'notExist', [true, 1], false)
    );
});
t.test('callAsMethod.ValidMethod', () => {
    let o1 = new TestClsWithMethods();
    Util512.callAsMethodOnClass('TestClsWithMethods', o1, 'goAbc', [true, 1], false);
    assertEq(true, o1.calledAbc, 'D^|');
    assertEq(false, o1.calledZ, 'D]|');
    let o2 = new TestClsWithMethods();
    Util512.callAsMethodOnClass('TestClsWithMethods', o2, 'goZ', [true, 1], false);
    assertEq(false, o2.calledAbc, 'D[|');
    assertEq(true, o2.calledZ, 'D@|');
});
t.test('isMethodOnClass', () => {
    let o1 = new TestClsWithMethods();
    assertTrue(Util512.isMethodOnClass(o1, 'goAbc'), 'D?|');
    assertTrue(Util512.isMethodOnClass(o1, 'goZ'), 'D>|');
    assertTrue(!Util512.isMethodOnClass(o1, 'goAbcd'), 'D=|');
    assertTrue(!Util512.isMethodOnClass(o1, 'calledAbc'), 'D<|');
    assertTrue(!Util512.isMethodOnClass(o1, 'notPresent'), 'D;|');
    assertTrue(!Util512.isMethodOnClass(o1, ''), 'D:|');
});
t.test('getMapKeys.PlainObject', () => {
    let obj0 = {};
    let obj1 = { a: true };
    let obj2 = { abc: 'abc', def: '_def' };
    assertEq([], sorted(Util512.getMapKeys(obj0)), 'EB|');
    assertEq(['a'], sorted(Util512.getMapKeys(obj1)), 'EA|');
    assertEq(['abc', 'def'], sorted(Util512.getMapKeys(obj2)), 'E9|');
});
t.test('getMapKeys.Class', () => {
    let cls0 = new TestClsEmpty();
    let cls1 = new TestClsOne();
    let cls2 = new TestClsOne();
    (cls2 as any).aSingleAdded = 1;
    assertEq([], sorted(Util512.getMapKeys(cls0 as any)), 'E8|');
    assertEq(['aSingleProp'], sorted(Util512.getMapKeys(cls1 as any)), 'E7|');
    assertEq(
        ['aSingleAdded', 'aSingleProp'],
        sorted(Util512.getMapKeys(cls2 as any)),
        'E6|'
    );
});
t.test('getMapVals.PlainObject', () => {
    let obj0 = {};
    let obj1 = { a: true };
    let obj2 = { abc: 'abc', def: '_def' };
    assertEq([], sorted(Util512.getMapVals(obj0)), 'E5|');
    assertEq([true], sorted(Util512.getMapVals(obj1)), 'E4|');
    assertEq(['_def', 'abc'], sorted(Util512.getMapVals(obj2)), 'E3|');
});
t.test('getMapVals.Class', () => {
    let cls0 = new TestClsEmpty();
    let cls1 = new TestClsOne();
    let cls2 = new TestClsOne();
    (cls2 as any).aSingleAdded = false;
    assertEq([], sorted(Util512.getMapVals(cls0 as any)), 'E2|');
    assertEq([true], sorted(Util512.getMapVals(cls1 as any)), 'E1|');
    assertEq([false, true], sorted(Util512.getMapVals(cls2 as any)), 'E0|');
});
t.test('padStart', () => {
    assertEq('123', Util512.padStart(123, 2, '0'), 'D/|');
    assertEq('123', Util512.padStart(123, 3, '0'), 'D.|');
    assertEq('0123', Util512.padStart(123, 4, '0'), 'D-|');
    assertEq('00123', Util512.padStart(123, 5, '0'), 'D,|');
});
t.test('arrayToBase64.arrayOfNumbers', () => {
    let nums: any = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
    assertEq('aGVsbG8=', Util512.arrayToBase64(nums), 'D+|');
});
t.test('arrayToBase64.Uint8Array', () => {
    let nums: any = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
    let uint8 = new Uint8Array(nums);
    assertEq('aGVsbG8=', Util512.arrayToBase64(uint8), 'D*|');
});
t.test('arrayToBase64.ArrayBuffer', () => {
    let nums: any = Array.prototype.map.call('hello', (x: string) => x.charCodeAt(0));
    let buffer = new ArrayBuffer(nums.length);
    let view = new Uint8Array(buffer);
    for (let i = 0; i < nums.length; i++) {
        view[i] = nums[i];
    }

    assertEq('aGVsbG8=', Util512.arrayToBase64(view), 'D)|');
});
t.test('Base64UrlSafe.StripsAndReAddEqualsSign', () => {
    let roundTrip = (a: string, b: string) => {
        assertEq(Util512.toBase64UrlSafe(a), b, 'EQ|');
        assertEq(Util512.fromBase64UrlSafe(b), a, 'EP|');
    };

    roundTrip('abc', 'YWJj');
    roundTrip('abcd', 'YWJjZA');
    roundTrip('abcde', 'YWJjZGU');
    roundTrip('abcdef', 'YWJjZGVm');
    roundTrip('abcdefg', 'YWJjZGVmZw');
});
t.test('Base64UrlSafe.ReplacesWithUnderscoreAndDash', () => {
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
});
t.test('stringToCharArray', () => {
    assertEq([], Util512.stringToCharArray(''), 'Nv|');
    assertEq(['a'], Util512.stringToCharArray('a'), 'Nu|');
    assertEq(['a', 'b', ' ', 'c', 'd'], Util512.stringToCharArray('ab cd'), 'Nt|');
});
t.test('stringToByteArray', () => {
    assertEq([], Util512.stringToByteArray(''), 'Ns|');
    assertEq([97], Util512.stringToByteArray('a'), 'Nr|');
    assertEq([97, 98, 32, 99, 100], Util512.stringToByteArray('ab cd'), 'Nq|');
});
t.test('sortDecorated', () => {
    class MyClass {
        constructor(public a: string) {}
    }

    t.say(/*——————————*/ 'typical usage');
    let input: string[] = ['abc', 'dba', 'aab', 'ffd'];
    let ret = Util512.sortDecorated(input, s => s.charAt(2));
    assertEq('dba;aab;abc;ffd', ret.join(';'), 'Np|');
    t.say(/*——————————*/ 'with class');
    let inputCl = [new MyClass('bb'), new MyClass('aa'), new MyClass('cc')];
    let retCl = Util512.sortDecorated(inputCl, o => o.a);
    assertEq('aa;bb;cc', retCl.map(o => o.a).join(';'), 'O+|');
    t.say(/*——————————*/ 'with class and ties');
    inputCl = [new MyClass('bb'), new MyClass('aa'), new MyClass('bb')];
    retCl = Util512.sortDecorated(inputCl, o => o.a);
    assertEq('aa;bb;bb', retCl.map(o => o.a).join(';'), 'O*|');
});
t.test('normalizeNewlines', () => {
    assertEq('ab', Util512.normalizeNewlines('ab'), 'Nn|');
    assertEq('a\nb\n', Util512.normalizeNewlines('a\nb\n'), 'Nm|');
    assertEq('a\nb\n', Util512.normalizeNewlines('a\r\nb\r\n'), 'Nl|');
    assertEq('a\nb\n', Util512.normalizeNewlines('a\rb\r'), 'Nk|');
    assertEq('a\nb\n', Util512.normalizeNewlines('a\rb\r\n'), 'Nj|');
    assertEq('a\nb\n', Util512.normalizeNewlines('a\r\nb\n'), 'Ni|');
});

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
