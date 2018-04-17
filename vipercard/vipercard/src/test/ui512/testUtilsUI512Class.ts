
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';

export class TestUtil512Class extends UI512TestBase {
    tests = [
        'testRange',
        () => {
            /* upwards */
            assertEq([0, 1, 2, 3], Util512.range(4), '');
            assertEq([2, 3, 4], Util512.range(2, 5), '');
            assertEq([2, 5], Util512.range(2, 8, 3), '');
            assertEq([2, 5, 8], Util512.range(2, 9, 3), '');
            assertEq([2, 5, 8], Util512.range(2, 10, 3), '');

            /* downwards */
            assertEq([5, 4, 3], Util512.range(5, 2, -1), '');
            assertEq([10, 7, 4], Util512.range(10, 2, -3), '');
            assertEq([9, 6, 3], Util512.range(9, 2, -3), '');
            assertEq([8, 5], Util512.range(8, 2, -3), '');

            /* none */
            assertEq([], Util512.range(5, 2), '');
            assertEq([], Util512.range(2, 2), '');
            assertEq([], Util512.range(2, 5, -1), '');
            assertEq([], Util512.range(2, 2, -1), '');
        },
        'testRepeat',
        () => {
            assertEq([4, 4, 4], Util512.repeat(3, 4), '');
            assertEq(['a', 'a', 'a'], Util512.repeat(3, 'a'), '');
            assertEq([4], Util512.repeat(1, 4), '');
            assertEq(['a'], Util512.repeat(1, 'a'), '');
            assertEq([], Util512.repeat(0, 4), '');
            assertEq([], Util512.repeat(0, 'a'), '');
        },
        'testConcatArray',
        () => {
            let ar = [1, 2, 3];
            Util512.extendArray(ar, []);
            assertEq([1, 2, 3], ar, '');
            ar = [1, 2, 3];
            Util512.extendArray(ar, [4]);
            assertEq([1, 2, 3, 4], ar, '');
            ar = [1, 2, 3];
            Util512.extendArray(ar, [4, 5, 6]);
            assertEq([1, 2, 3, 4, 5, 6], ar, '');
        },
        'testEscapeForRegex',
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
        'testBase64',
        () => {
            /* test different lengths, since we strip and re-add the = padding */
            let testRt = (a: string, b: string) => {
                assertEq(Util512.toBase64UrlSafe(a), b, '');
                assertEq(Util512.fromBase64UrlSafe(b), a, '');
            };

            testRt('abc', 'YWJj');
            testRt('abcd', 'YWJjZA');
            testRt('abcde', 'YWJjZGU');
            testRt('abcdef', 'YWJjZGVm');
            testRt('abcdefg', 'YWJjZGVmZw');
            testRt('\x01\x05\xf8\xff', 'AQX4_w');
            testRt('\x01\x05\xf8\xffX', 'AQX4_1g');
            testRt('\x01\x05\xf8\xffXY', 'AQX4_1hZ');
            testRt('\x01\x05\xf8\xffXYZ', 'AQX4_1hZWg');
            testRt('\x01\x05\xf8\xffXYZ<', 'AQX4_1hZWjw');
            testRt('\x01\x05\xf8\xffXYZ<>', 'AQX4_1hZWjw-');
        },
        'test_utils_isMapEmpty',
        () => {
            let map0 = {};
            let map1 = { a: true };
            let map2 = { abc: 'abc', def: 'def' };
            let cls0 = new TestClsEmpty();
            let cls1 = new TestClsOne();
            let cls2 = new TestClsOne();
            (cls2 as any).aSingleAdded = 1; /* test code */

            assertTrue(Util512.isMapEmpty(map0), '');
            assertTrue(!Util512.isMapEmpty(map1), '');
            assertTrue(!Util512.isMapEmpty(map2), '');
            assertTrue(Util512.isMapEmpty(cls0 as any), ''); /* test code */
            assertTrue(!Util512.isMapEmpty(cls1 as any), ''); /* test code */
            assertTrue(!Util512.isMapEmpty(cls2 as any), ''); /* test code */
        },
        'test_utils_freezeProperty',
        () => {
            let map1 = { a: true, b: true };
            Util512.freezeProperty(map1, 'a');
            map1.b = false;
            let expectErr = looksLikeDesktopChrome() ? 'property' : '';
            this.assertThrows('', expectErr, () => {
                map1.a = false;
            });
        },
        'test_utils_freezeRecurse',
        () => {
            /* freeze a simple object */
            let simple = { a: true, b: true };
            assertTrue(!Object.isFrozen(simple), '');
            Util512.freezeRecurse(simple);
            let expectErr = looksLikeDesktopChrome() ? 'property' : '';
            this.assertThrows('', expectErr, () => {
                simple.a = false;
            });

            /* freeze a complex object */
            let c1 = new TestClsOne();
            let c2 = new TestClsOne();
            let c3 = new TestClsOne();
            (c1 as any).child = c2; /* test code */
            (c2 as any).child = c3; /* test code */
            (c3 as any).nullchild = undefined; /* test code */
            assertTrue(!Object.isFrozen(c1), '');
            Util512.freezeRecurse(c1);
            assertTrue(Object.isFrozen(c1), '');
            assertTrue(Object.isFrozen(c2), '');
            assertTrue(Object.isFrozen(c3), '');
            this.assertThrows('', expectErr, () => {
                c1.aSingleProp = false;
            });
            let expectErr2 = looksLikeDesktopChrome() ? '' : '';
            this.assertThrows('', expectErr2, () => {
                (c1 as any).newProp = true; /* test code */
            });
        },
        'test_utils_getMapKeys_shallowClone',
        () => {
            let map0 = {};
            let map1 = { a: true };
            let map2 = { abc: 'abc', def: '_def' };
            let cls0 = new TestClsEmpty();
            let cls1 = new TestClsOne();
            let cls2 = new TestClsOne();
            (cls2 as any).aSingleAdded = 1; /* test code */

            /* test getMapKeys */
            assertEq('', this.getMapKeysString(map0), '');
            assertEq('a:true,', this.getMapKeysString(map1), '');
            assertEq('abc:abc,def:_def,', this.getMapKeysString(map2), '');
            assertEq('', this.getMapKeysString(cls0 as any), ''); /* test code */
            assertEq('aSingleProp:true,', this.getMapKeysString(cls1 as any), ''); /* test code */
            assertEq('aSingleAdded:1,aSingleProp:true,', this.getMapKeysString(cls2 as any), ''); /* test code */

            /* test getMapVals */
            assertEq('', this.getMapValsString(map0), '');
            assertEq('true', this.getMapValsString(map1), '');
            assertEq('_def,abc', this.getMapValsString(map2), '');
            assertEq('', this.getMapValsString(cls0 as any), ''); /* test code */
            assertEq('true', this.getMapValsString(cls1 as any), ''); /* test code */
            assertEq('1,true', this.getMapValsString(cls2 as any), ''); /* test code */

            /* test shallowClone */
            assertEq('', this.getMapKeysString(Util512.shallowClone(map0)), '');
            assertEq('a:true,', this.getMapKeysString(Util512.shallowClone(map1)), '');
            assertEq('abc:abc,def:_def,', this.getMapKeysString(Util512.shallowClone(map2)), '');
            assertEq('', this.getMapKeysString(Util512.shallowClone(cls0 as any)), ''); /* test code */
            assertEq('aSingleProp:true,', this.getMapKeysString(Util512.shallowClone(cls1 as any)), ''); /* test code */
            assertEq(
                'aSingleAdded:1,aSingleProp:true,',
                this.getMapKeysString(Util512.shallowClone(cls2 as any)),
                ''
            ); /* test code */
        },
        'test_utils_escapeForRegex',
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
        'test_utils_callAsMethodOnClassInvalid',
        () => {
            /* should throw on invalid method name */
            let o = new TestClsWithMethods();
            for (let okIfNotExists of [false, true]) {
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', o, '', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', o, 'a', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', o, '?', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', o, 'a b', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', o, '1a', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', o, '_c', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', o, '__c', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', o, '.', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', o, 'a.b', [true, 1], okIfNotExists)
                );
            }

            /* attempt to call missing method */
            Util512.callAsMethodOnClass('TestClsWithMethods', o, 'notExist', [true, 1], true);
            this.assertThrows('', 'could not find', () =>
                Util512.callAsMethodOnClass('TestClsWithMethods', o, 'notExist', [true, 1], false)
            );
        },
        'test_utils_callAsMethodOnClassValid',
        () => {
            /* call a valid method */
            let o1 = new TestClsWithMethods();
            Util512.callAsMethodOnClass('TestClsWithMethods', o1, 'go_abc', [true, 1], false);
            assertEq(true, o1.calledAbc, '');
            assertEq(false, o1.calledZ, '');
            let o2 = new TestClsWithMethods();
            Util512.callAsMethodOnClass('TestClsWithMethods', o2, 'go_z', [true, 1], false);
            assertEq(false, o2.calledAbc, '');
            assertEq(true, o2.calledZ, '');
        },
        'test_utils_listUnique',
        () => {
            assertEq([], Util512.listUnique([]), '');
            assertEq(['1'], Util512.listUnique(['1']), '');
            assertEq(['1', '2', '3'], Util512.listUnique(['1', '2', '3']), '');
            assertEq(['1', '2', '3'], Util512.listUnique(['1', '2', '2', '3']), '');
            assertEq(['1', '2', '3'], Util512.listUnique(['1', '2', '3', '3']), '');
            assertEq(['1', '2', '3'], Util512.listUnique(['1', '2', '2', '3', '2']), '');
            assertEq(['1', '2', '3'], Util512.listUnique(['1', '2', '2', '3', '3']), '');
            assertEq(['1', '2', '3'], Util512.listUnique(['1', '2', '3', '2', '3']), '');
        },
        'test_utils_padStart',
        () => {
            assertEq('123', Util512.padStart(123, 2, '0'), '');
            assertEq('123', Util512.padStart(123, 3, '0'), '');
            assertEq('0123', Util512.padStart(123, 4, '0'), '');
            assertEq('00123', Util512.padStart(123, 5, '0'), '');
        }
    ];

    protected getMapKeysString<T>(map: { [key: string]: T }) {
        let keys = Util512.getMapKeys(map);
        keys.sort();
        let ret = '';
        for (let key of keys) {
            ret += key + ':' + map[key] + ',';
        }

        return ret;
    }

    protected getMapValsString<T>(map: { [key: string]: T }) {
        let vals = Util512.getMapVals(map);
        vals.sort();
        return vals.join(',');
    }
}

function looksLikeDesktopChrome() {
    let isChromium = (window as any).chrome; /* test code */
    let winNav = window.navigator;
    let vendorName = winNav.vendor;
    let isOpera = winNav.userAgent.indexOf('OPR') > -1;
    let isIEedge = winNav.userAgent.indexOf('Edge') > -1;
    let isIOSChrome = winNav.userAgent.match('CriOS');

    if (isIOSChrome) {
        return false;
    } else if (
        isChromium !== null &&
        typeof isChromium !== 'undefined' &&
        vendorName.indexOf('Google') > -1 &&
        isOpera === false &&
        isIEedge === false
    ) {
        return true;
    } else {
        return false;
    }
}

class TestClsEmpty {}

class TestClsOne {
    aSingleProp = true;
}

class TestClsWithMethods {
    calledAbc = false;
    calledZ = false;
    go_abc(p1: boolean, p2: number) {
        assertEq(true, p1, '');
        assertEq(1, p2, '');
        this.calledAbc = true;
    }
    go_z(p1: boolean, p2: number) {
        assertEq(true, p1, '');
        assertEq(1, p2, '');
        this.calledZ = true;
    }
}
