
/* auto */ import { O, RingBuffer, UI512Compress, assertTrue, joinIntoMessage, makeUI512Error } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { OrderedHash, Util512, assertEq, defaultSort, findEnumToStr, findStrToEnum, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { RequestedChunkType } from '../../vpc/vpcutils/vpcenums.js';

declare var LZString: any;

export class TestUI512Utils extends UI512TestBase {
    tests = [
        'testAssertThrow',
        () => {
            this.assertThrows('', 'mymessage', () => {
                throw makeUI512Error('1N|1 mymessage 2');
            });

            this.assertThrows('', 'xyz', () => {
                throw new Error('1 xyz 2');
            });
        },
        'testRingBuffer',
        () => {
            let buf = new RingBufferArray(4)
            assertEq(['', ''], buf.retrieve(2), "")
            buf.append('a')
            assertEq(['a', ''], buf.retrieve(2), "")
            buf.append('b')
            assertEq(['b', 'a'], buf.retrieve(2), "")
            buf.append('c')
            assertEq(['c', 'b'], buf.retrieve(2), "")
            buf.append('d')
            assertEq(['d', 'c'], buf.retrieve(2), "")

            /* wrap around, test that buf.retrieve correctly wraps negative numbers */
            buf.append('e')
            assertEq(['e', 'd'], buf.retrieve(2), "")
            buf.append('f')
            assertEq(['f', 'e'], buf.retrieve(2), "")
            buf.append('g')
            assertEq(['g', 'f'], buf.retrieve(2), "")
        },
        'testJoinIntoMessage',
        () => {
            /* should move tags to the end */
            let got = joinIntoMessage('ab|', 'prefix:', 'c', 'd', 'e')
            assertEq('prefix: \nc, d, e (ab)', got, '')
            got = joinIntoMessage('ab|the message', 'prefix:')
            assertEq('prefix: the message (ab)', got, '')
            got = joinIntoMessage('the message', 'prefix:', 'ab|c')
            assertEq('prefix: the message\nc (ab)', got, '')
            got = joinIntoMessage('without|tags', 'prefix:')
            assertEq('prefix: without|tags', got, '')
        },
        'testRange',
        () => {
            /* upwards */
            assertEq([0, 1, 2, 3], Util512.range(4), "")
            assertEq([2, 3, 4], Util512.range(2, 5), "")
            assertEq([2, 5], Util512.range(2, 8, 3), "")
            assertEq([2, 5, 8], Util512.range(2, 9, 3), "")
            assertEq([2, 5, 8], Util512.range(2, 10, 3), "")

            /* downwards */
            assertEq([5, 4, 3], Util512.range(5, 2, -1), "")
            assertEq([10, 7, 4], Util512.range(10, 2, -3), "")
            assertEq([9, 6, 3], Util512.range(9, 2, -3), "")
            assertEq([8, 5], Util512.range(8, 2, -3), "")

            /* none */
            assertEq([], Util512.range(5, 2), "")
            assertEq([], Util512.range(2, 2), "")
            assertEq([], Util512.range(2, 5, -1), "")
            assertEq([], Util512.range(2, 2, -1), "")
        },
        'testRepeat',
        () => {
            assertEq([4, 4, 4], Util512.repeat(3, 4), "")
            assertEq(['a', 'a', 'a'], Util512.repeat(3, 'a'), "")
            assertEq([4], Util512.repeat(1, 4), "")
            assertEq(['a'], Util512.repeat(1, 'a'), "")
            assertEq([], Util512.repeat(0, 4), "")
            assertEq([], Util512.repeat(0, 'a'), "")
        },
        'testConcatArray',
        () => {
            let ar = [1, 2, 3]
            Util512.extendArray(ar, [])
            assertEq([1, 2, 3], ar, "")
            ar = [1, 2, 3]
            Util512.extendArray(ar, [4])
            assertEq([1, 2, 3, 4], ar, "")
            ar = [1, 2, 3]
            Util512.extendArray(ar, [4, 5, 6])
            assertEq([1, 2, 3, 4, 5, 6], ar, "")
        },
        'testEscapeForRegex',
        () => {
            assertEq('\\\\', Util512.escapeForRegex('\\'), "")
            assertEq('a\\?b\\?', Util512.escapeForRegex('a?b?'), "")
            assertEq('\\/', Util512.escapeForRegex('/'), "")
            assertEq('a\\/b', Util512.escapeForRegex('a/b'), "")
            assertEq('\\+', Util512.escapeForRegex('+'), "")
            assertEq('a\\+b', Util512.escapeForRegex('a+b'), "")
            assertEq('\\+\\+', Util512.escapeForRegex('++'), "")
            assertEq('a\\+\\+b', Util512.escapeForRegex('a++b'), "")
        },
        'testBase64',
        () => {
            /* test different lengths, since we strip and re-add the = padding */
            let testRt = (a:string, b:string) => {
                assertEq(Util512.toBase64UrlSafe(a), b, "")
                assertEq(Util512.fromBase64UrlSafe(b), a, "")
            }

            testRt('abc', 'YWJj')
            testRt('abcd', 'YWJjZA')
            testRt('abcde', 'YWJjZGU')
            testRt('abcdef', 'YWJjZGVm')
            testRt('abcdefg', 'YWJjZGVmZw')
            testRt('\x01\x05\xf8\xff', 'AQX4_w')
            testRt('\x01\x05\xf8\xffX', 'AQX4_1g')
            testRt('\x01\x05\xf8\xffXY', 'AQX4_1hZ')
            testRt('\x01\x05\xf8\xffXYZ', 'AQX4_1hZWg')
            testRt('\x01\x05\xf8\xffXYZ<', 'AQX4_1hZWjw')
            testRt('\x01\x05\xf8\xffXYZ<>', 'AQX4_1hZWjw-')
        },
        'test_defaultSortString',
        () => {
            assertEq(0, defaultSort('', ''), '1M|');
            assertEq(0, defaultSort('a', 'a'), '1L|');
            assertEq(1, defaultSort('abc', 'abb'), '1K|');
            assertEq(-1, defaultSort('abb', 'abc'), '1J|');
            assertEq(1, defaultSort('abcd', 'abc'), '1I|');
            assertEq(-1, defaultSort('abc', 'abcd'), '1H|');
            assertEq(0, defaultSort('aunicode\u2666char', 'aunicode\u2666char'), '1G|');
            assertEq(1, defaultSort('aunicode\u2667char', 'aunicode\u2666char'), '1F|');
            assertEq(-1, defaultSort('aunicode\u2666char', 'aunicode\u2667char'), '1E|');
            assertEq(0, defaultSort('accented\u00e9letter', 'accented\u00e9letter'), '1D|');
            assertEq(1, defaultSort('accented\u00e9letter', 'accented\u0065\u0301letter'), '1C|');
            assertEq(-1, defaultSort('accented\u0065\u0301letter', 'accented\u00e9letter'), '1B|');
        },
        'test_defaultSortBool',
        () => {
            assertEq(0, defaultSort(false, false), '1A|');
            assertEq(0, defaultSort(true, true), '19|');
            assertEq(1, defaultSort(true, false), '18|');
            assertEq(-1, defaultSort(false, true), '17|');
        },
        'test_defaultSortNumber',
        () => {
            assertEq(0, defaultSort(0, 0), '16|');
            assertEq(0, defaultSort(1, 1), '15|');
            assertEq(0, defaultSort(12345, 12345), '14|');
            assertEq(0, defaultSort(-11.15, -11.15), '13|');
            assertEq(-1, defaultSort(0, 1), '12|');
            assertEq(1, defaultSort(1, 0), '11|');
            assertEq(1, defaultSort(1.4, 1.3), '10|');
            assertEq(1, defaultSort(0, -1), '0~|');
            assertEq(1, defaultSort(Number.POSITIVE_INFINITY, 12345), '0}|');
            assertEq(-1, defaultSort(Number.NEGATIVE_INFINITY, -12345), '0||');
        },
        'test_defaultSortArraySameLength',
        () => {
            assertEq(0, defaultSort([], []), '0{|');
            assertEq(0, defaultSort([5, 'a'], [5, 'a']), '0`|');
            assertEq(1, defaultSort([5, 'a', 7], [5, 'a', 6]), '0_|');
            assertEq(-1, defaultSort([5, 'a', 6], [5, 'a', 7]), '0^|');
            assertEq(1, defaultSort([5, 7, 'a'], [5, 6, 'a']), '0]|');
            assertEq(1, defaultSort([5, 7, 'a', 600], [5, 6, 'a', 700]), '0[|');

            assertEq(0, defaultSort([5, 'a', 'abcdef'], [5, 'a', 'abcdef']), '0@|');
            assertEq(1, defaultSort([5, 'a', 'abc'], [5, 'a', 'abb']), '0?|');
            assertEq(-1, defaultSort([5, 'a', 'abb'], [5, 'a', 'abc']), '0>|');
        },
        'test_defaultSortArrayDifferentLength',
        () => {
            assertEq(1, defaultSort([1], []), '0=|');
            assertEq(-1, defaultSort([], [1]), '0<|');
            assertEq(1, defaultSort([10, 20], [10]), '0;|');
            assertEq(-1, defaultSort([10], [10, 20]), '0:|');
        },
        'test_defaultSortArrayNested',
        () => {
            assertEq(0, defaultSort([[]], [[]]), '0/|');
            assertEq(0, defaultSort([[], []], [[], []]), '0.|');
            assertEq(0, defaultSort([[1, 2], []], [[1, 2], []]), '0-|');
            assertEq(0, defaultSort([[10, 20], [30]], [[10, 20], [30]]), '0,|');
            assertEq(1, defaultSort([[10, 20], [30]], [[10, 20], [-30]]), '0+|');
            assertEq(-1, defaultSort([[10, 20], [-30]], [[10, 20], [30]]), '0*|');
            assertEq(1, defaultSort([[10, 20], [1, 30]], [[10, 20], [1, -30]]), '0)|');
            assertEq(-1, defaultSort([[10, 20], [1, -30]], [[10, 20], [1, 30]]), '0(|');
            assertEq(1, defaultSort([[10, 20], [30, 31]], [[10, 20], [30]]), '0&|');
            assertEq(-1, defaultSort([[10, 20], [30]], [[10, 20], [30, 31]]), '0%|');
            assertEq(0, defaultSort([[10, 20], 50, [30]], [[10, 20], 50, [30]]), '0$|');
            assertEq(1, defaultSort([[10, 20], 60, [30]], [[10, 20], 50, [30]]), '0#|');
            assertEq(-1, defaultSort([[10, 20], 50, [30]], [[10, 20], 60, [30]]), '0!|');
        },
        'test_forofarray',
        () => {
            let ar = [11, 22, 33];
            let result: number[] = [];
            for (let item of ar) {
                result.push(item);
            }
            assertEq([11, 22, 33], result, '0t|');
        },
        'test_forofgenerator',
        () => {
            // if targeting Es3 or Es5, must run typescript with downlevelIteration
            function* myGenerator() {
                yield 10;
                yield 20;
                yield 30;
                yield 40;
            }
            let result: number[] = [];
            for (let item of myGenerator()) {
                result.push(item);
            }
            assertEq([10, 20, 30, 40], result, '0s|');
        },
        'test_forofgeneratorexitearly',
        () => {
            function* myGenerator() {
                yield 10;
                yield 20;
                yield 30;
                yield 40;
            }
            let result: number[] = [];
            for (let item of myGenerator()) {
                result.push(item);
                if (item === 20) {
                    break;
                }
            }
            assertEq([10, 20], result, '0r|');
        },
        'test_orderedhashiterkeys',
        () => {
            let hash = new OrderedHash<number>();
            hash.insertNew('ccc', 30);
            hash.insertNew('ccb', 29);
            hash.insertNew('cca', 28);
            let result: string[] = [];
            for (let item of hash.iterKeys()) {
                result.push(item);
            }
            assertEq(['ccc', 'ccb', 'cca'], result, '0q|');
        },
        'test_orderedhashitervals',
        () => {
            let hash = new OrderedHash<number>();
            hash.insertNew('ccc', 30);
            hash.insertNew('ccb', 29);
            hash.insertNew('cca', 28);
            let result: number[] = [];
            for (let item of hash.iter()) {
                result.push(item);
            }
            assertEq([30, 29, 28], result, '0p|');
        },
        'test_orderedhashitervalsreversed',
        () => {
            let hash = new OrderedHash<number>();
            hash.insertNew('ccc', 30);
            hash.insertNew('ccb', 29);
            hash.insertNew('cca', 28);
            let result: number[] = [];
            for (let item of hash.iterReversed()) {
                result.push(item);
            }
            assertEq([28, 29, 30], result, '0o|');
        },
        'test_orderedhashitervalsreversedexit',
        () => {
            let hash = new OrderedHash<number>();
            hash.insertNew('A5', 555);
            hash.insertNew('A4', 444);
            hash.insertNew('A7', 777);
            let result: number[] = [];
            for (let item of hash.iterReversed()) {
                result.push(item);
                if (item === 444) {
                    break;
                }
            }
            assertEq([777, 444], result, '0n|');
        },
        'test_strToEnum',
        () => {
            // no item should be 0
            assertTrue(RequestedChunkType.Chars !== 0, '0m|no item should be 0');
            // alternates have same val
            assertEq(RequestedChunkType.alternateforms_word, RequestedChunkType.Words, '0l|');
            // alternates have same val
            assertEq(RequestedChunkType.alternateforms_words, RequestedChunkType.Words, '0k|');
            // we disallow this even though it's in the enum
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, 'alternateforms_word'), '0j|');
            // or this
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, '__isUI512Enum'), '0i|');
            // can't find empty string
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, ''), '0h|');
            // can't find non-existant
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, 'abc'), '0g|');
            // can't find non-existant that is close 1
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, 'words '), '0f|');
            // can't find non-existant that is close 2
            assertEq(undefined, findStrToEnum<RequestedChunkType>(RequestedChunkType, '_words'), '0e|');
            // look up by canonical form
            assertEq(RequestedChunkType.Words, findStrToEnum<RequestedChunkType>(RequestedChunkType, 'Words'), '0d|');
            // look up by alt form
            assertEq(RequestedChunkType.Words, findStrToEnum<RequestedChunkType>(RequestedChunkType, 'word'), '0c|');
            // look up by another alt form
            assertEq(RequestedChunkType.Words, findStrToEnum<RequestedChunkType>(RequestedChunkType, 'words'), '0b|');
            // look up by another alt form
            assertEq(
                RequestedChunkType.Chars,
                findStrToEnum<RequestedChunkType>(RequestedChunkType, 'characters'),
                '0a|'
            );
        },
        'test_enumToStr',
        () => {
            // can't find 0
            assertEq(undefined, findEnumToStr<RequestedChunkType>(RequestedChunkType, 0), '0Z|');
            // can't find non-existant
            assertEq(undefined, findEnumToStr<RequestedChunkType>(RequestedChunkType, 99), '0Y|');
            // don't allow lookup on marker
            assertEq(
                undefined,
                findEnumToStr<RequestedChunkType>(RequestedChunkType, RequestedChunkType.__isUI512Enum),
                '0X|'
            );
            // get canonical string for lines
            assertEq(
                'Lines',
                findEnumToStr<RequestedChunkType>(RequestedChunkType, RequestedChunkType.alternateforms_lines),
                '0W|'
            );
            // get canonical string for items
            assertEq(
                'Items',
                findEnumToStr<RequestedChunkType>(RequestedChunkType, RequestedChunkType.alternateforms_items),
                '0V|'
            );
            // get canonical string for words
            assertEq(
                'Words',
                findEnumToStr<RequestedChunkType>(RequestedChunkType, RequestedChunkType.alternateforms_words),
                '0U|'
            );
            // get canonical string for chars
            assertEq(
                'Chars',
                findEnumToStr<RequestedChunkType>(RequestedChunkType, RequestedChunkType.alternateforms_chars),
                '0T|'
            );
        },
        'test_utils_isMapEmpty',
        () => {
            let map0 = {};
            let map1 = { a: true };
            let map2 = { abc: 'abc', def: 'def' };
            let cls0 = new TestClsEmpty();
            let cls1 = new TestClsOne();
            let cls2 = new TestClsOne();
            (cls2 as any).aSingleAdded = 1;

            assertTrue(Util512.isMapEmpty(map0), '');
            assertTrue(!Util512.isMapEmpty(map1), '');
            assertTrue(!Util512.isMapEmpty(map2), '');
            assertTrue(Util512.isMapEmpty(cls0 as any), '');
            assertTrue(!Util512.isMapEmpty(cls1 as any), '');
            assertTrue(!Util512.isMapEmpty(cls2 as any), '');
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
            // freeze a simple object
            let simple = { a: true, b: true };
            assertTrue(!Object.isFrozen(simple), '');
            Util512.freezeRecurse(simple);
            let expectErr = looksLikeDesktopChrome() ? 'property' : '';
            this.assertThrows('', expectErr, () => {
                simple.a = false;
            });

            // freeze a complex object
            let c1 = new TestClsOne();
            let c2 = new TestClsOne();
            let c3 = new TestClsOne();
            (c1 as any).child = c2;
            (c2 as any).child = c3;
            (c3 as any).nullchild = undefined;
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
                (c1 as any).newProp = true;
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
            (cls2 as any).aSingleAdded = 1;

            // test getMapKeys
            assertEq('', this.getMapKeysString(map0), '');
            assertEq('a:true,', this.getMapKeysString(map1), '');
            assertEq('abc:abc,def:_def,', this.getMapKeysString(map2), '');
            assertEq('', this.getMapKeysString(cls0 as any), '');
            assertEq('aSingleProp:true,', this.getMapKeysString(cls1 as any), '');
            assertEq('aSingleAdded:1,aSingleProp:true,', this.getMapKeysString(cls2 as any), '');

            // test getMapVals
            assertEq('', this.getMapValsString(map0), '');
            assertEq('true', this.getMapValsString(map1), '');
            assertEq('_def,abc', this.getMapValsString(map2), '');
            assertEq('', this.getMapValsString(cls0 as any), '');
            assertEq('true', this.getMapValsString(cls1 as any), '');
            assertEq('1,true', this.getMapValsString(cls2 as any), '');

            // test shallowClone
            assertEq('', this.getMapKeysString(Util512.shallowClone(map0)), '');
            assertEq('a:true,', this.getMapKeysString(Util512.shallowClone(map1)), '');
            assertEq('abc:abc,def:_def,', this.getMapKeysString(Util512.shallowClone(map2)), '');
            assertEq('', this.getMapKeysString(Util512.shallowClone(cls0 as any)), '');
            assertEq('aSingleProp:true,', this.getMapKeysString(Util512.shallowClone(cls1 as any)), '');
            assertEq('aSingleAdded:1,aSingleProp:true,', this.getMapKeysString(Util512.shallowClone(cls2 as any)), '');
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
            // should throw on invalid method name
            let c = new TestClsWithMethods();
            for (let okIfNotExists of [false, true]) {
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', c, '', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', c, 'a', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', c, '?', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', c, 'a b', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', c, '1a', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', c, '_c', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', c, '__c', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', c, '.', [true, 1], okIfNotExists)
                );
                this.assertThrows('', 'requires alphanumeric', () =>
                    Util512.callAsMethodOnClass('TestClsWithMethods', c, 'a.b', [true, 1], okIfNotExists)
                );
            }

            // attempt to call missing method
            Util512.callAsMethodOnClass('TestClsWithMethods', c, 'notExist', [true, 1], true);
            this.assertThrows('', 'could not find', () =>
                Util512.callAsMethodOnClass('TestClsWithMethods', c, 'notExist', [true, 1], false)
            );
        },
        'test_utils_callAsMethodOnClassValid',
        () => {
            // call a valid method
            let c1 = new TestClsWithMethods();
            Util512.callAsMethodOnClass('TestClsWithMethods', c1, 'go_abc', [true, 1], false);
            assertEq(true, c1.calledAbc, '');
            assertEq(false, c1.calledZ, '');
            let c2 = new TestClsWithMethods();
            Util512.callAsMethodOnClass('TestClsWithMethods', c2, 'go_z', [true, 1], false);
            assertEq(false, c2.calledAbc, '');
            assertEq(true, c2.calledZ, '');
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
        'test_utils_fitIntoInclusive',
        () => {
            assertEq(1, fitIntoInclusive(0, 1, 1), '');
            assertEq(1, fitIntoInclusive(1, 1, 1), '');
            assertEq(1, fitIntoInclusive(2, 1, 1), '');
            assertEq(1, fitIntoInclusive(0, 1, 3), '');
            assertEq(1, fitIntoInclusive(1, 1, 3), '');
            assertEq(2, fitIntoInclusive(2, 1, 3), '');
            assertEq(3, fitIntoInclusive(3, 1, 3), '');
            assertEq(3, fitIntoInclusive(4, 1, 3), '');
        },
        'test_utils_compressString',
        () => {
            // simple compress and uncompress
            assertEq('\u2020 ', UI512Compress.compressString(''), '');
            assertEq('\u10E8 ', UI512Compress.compressString('a'), '');
            assertEq('\u10E6\u4866\u4AEA  ', UI512Compress.compressString('aaaaaaaabbbbbbbb'), '');
            assertEq(
                '\u10E6\u4866\u4AE8\u31B0 ',
                UI512Compress.compressString('aaaaaaaabbbbbbbbc'),
                ''
            );
            assertEq(
                '\u10E6\u7070\u0256\u4CF0 ',
                UI512Compress.compressString('aaaaaaa\nbbbbbbbbb'),
                ''
            );
            assertEq('', UI512Compress.decompressString('\u2020 '), '');
            assertEq('a', UI512Compress.decompressString('\u10E8 '), '');
            assertEq(
                'aaaaaaaabbbbbbbb',
                UI512Compress.decompressString('\u10E6\u4866\u4AEA  '),
                ''
            );
            assertEq(
                'aaaaaaaabbbbbbbbc',
                UI512Compress.decompressString('\u10E6\u4866\u4AE8\u31B0 '),
                ''
            );
            assertEq(
                'aaaaaaa\nbbbbbbbbb',
                UI512Compress.decompressString('\u10E6\u7070\u0256\u4CF0 '),
                ''
            );
        },
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

export class TestUI512CanvasWrapper extends UI512TestBase {
    tests = [
        'test_getRectClippedFullyContained',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, y0, w, h];
            assertEq(expected, got, '0S|');
        },
        'test_getRectClippedSidesSame',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            x0 = boxx0;
            w = boxw;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, y0, w, h];
            assertEq(expected, got, '0R|');
        },
        'test_getRectClippedTopsSame',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            y0 = boxy0;
            h = boxh;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, y0, w, h];
            assertEq(expected, got, '0Q|');
        },
        'test_getRectProtrudesLeft',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            x0 = 6;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [10, y0, 30 - (10 - 6), h];
            assertEq(expected, got, '0P|');
        },
        'test_getRectProtrudesTop',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            y0 = 50;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, 60, w, 22 - (60 - 50)];
            assertEq(expected, got, '0O|');
        },
        'test_getRectProtrudesRight',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            w = 300;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, y0, 200 + 10 - 15, h];
            assertEq(expected, got, '0N|');
        },
        'test_getRectProtrudesBottom',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            h = 400;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, y0, w, 130 + 60 - 65];
            assertEq(expected, got, '0M|');
        },
        'test_getRectCompletelyCovers',
        () => {
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            let x0 = boxx0 - 5,
                y0 = boxy0 - 7,
                w = boxw + 24,
                h = boxh + 31;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, boxy0, boxw, boxh];
            assertEq(expected, got, '0L|');
        },
        'test_getRectOutsideLeft',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            x0 = 3;
            w = 6;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, boxy0, 0, 0];
            assertEq(expected, got, '0K|');
        },
        'test_getRectOutsideLeftTouches',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            x0 = 3;
            w = 7;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, y0, 0, h];
            assertEq(expected, got, '0J|');
        },
        'test_getRectBarelyInsideLeft',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            x0 = 3;
            w = 8;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, y0, 1, h];
            assertEq(expected, got, '0I|');
        },
        'test_getRectOutsideTop',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            y0 = 55;
            h = 4;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, boxy0, 0, 0];
            assertEq(expected, got, '0H|');
        },
        'test_getRectOutsideTopTouches',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            y0 = 55;
            h = 5;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, boxy0, w, 0];
            assertEq(expected, got, '0G|');
        },
        'test_getRectBarelyInsideTop',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            y0 = 55;
            h = 6;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [x0, boxy0, w, 1];
            assertEq(expected, got, '0F|');
        },
        'test_getRectOutsideRight',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            x0 = boxx0 + boxw;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, boxy0, 0, 0];
            assertEq(expected, got, '0E|');
        },
        'test_getRectOutsideBottom',
        () => {
            let x0 = 15;
            let y0 = 65;
            let w = 30;
            let h = 22;
            let boxx0 = 10;
            let boxy0 = 60;
            let boxw = 200;
            let boxh = 130;
            y0 = boxy0 + boxh;
            let got = RectUtils.getRectClipped(x0, y0, w, h, boxx0, boxy0, boxw, boxh);
            let expected = [boxx0, boxy0, 0, 0];
            assertEq(expected, got, '0D|');
        },
    ];
}

function looksLikeDesktopChrome() {
    let isChromium = (window as any).chrome;
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

class RingBufferArray extends RingBuffer {
    arr:string[] = []
    ptrLatest = 0
    getAt(index:number) : string {
        return this.arr[index] || ''
    }

    setAt(index:number, s:string) {
        this.arr[index] = s;
    }

    getLatestIndex() {
        return this.ptrLatest
    }

    setLatestIndex(index:number) {
        this.ptrLatest = index
    }
}
