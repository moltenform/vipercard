
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { OrderedHash, assertEq, defaultSort, findEnumToStr, findStrToEnum, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { VpcChunkType } from '../../vpc/vpcutils/vpcEnums.js';

export class TestUI512Utils extends UI512TestBase {
    tests = [
        'test_strToEnum',
        () => {
            /* no item should be 0 */
            assertTrue(VpcChunkType.Chars !== 0, '0m|no item should be 0');
            /* alternates have same val */
            assertEq(VpcChunkType.alternateforms_word, VpcChunkType.Words, '0l|');
            /* alternates have same val */
            assertEq(VpcChunkType.alternateforms_words, VpcChunkType.Words, '0k|');
            /* we disallow this even though it's in the enum */
            assertEq(undefined, findStrToEnum<VpcChunkType>(VpcChunkType, 'alternateforms_word'), '0j|');
            /* or this */
            assertEq(undefined, findStrToEnum<VpcChunkType>(VpcChunkType, '__isUI512Enum'), '0i|');
            /* can't find empty string */
            assertEq(undefined, findStrToEnum<VpcChunkType>(VpcChunkType, ''), '0h|');
            /* can't find non-existant */
            assertEq(undefined, findStrToEnum<VpcChunkType>(VpcChunkType, 'abc'), '0g|');
            /* can't find non-existant that is close 1 */
            assertEq(undefined, findStrToEnum<VpcChunkType>(VpcChunkType, 'words '), '0f|');
            /* can't find non-existant that is close 2 */
            assertEq(undefined, findStrToEnum<VpcChunkType>(VpcChunkType, '_words'), '0e|');
            /* look up by canonical form */
            assertEq(VpcChunkType.Words, findStrToEnum<VpcChunkType>(VpcChunkType, 'Words'), '0d|');
            /* look up by alt form */
            assertEq(VpcChunkType.Words, findStrToEnum<VpcChunkType>(VpcChunkType, 'word'), '0c|');
            /* look up by another alt form */
            assertEq(VpcChunkType.Words, findStrToEnum<VpcChunkType>(VpcChunkType, 'words'), '0b|');
            /* look up by another alt form */
            assertEq(VpcChunkType.Chars, findStrToEnum<VpcChunkType>(VpcChunkType, 'characters'), '0a|');
        },
        'test_enumToStr',
        () => {
            /* can't find 0 */
            assertEq(undefined, findEnumToStr<VpcChunkType>(VpcChunkType, 0), '0Z|');
            /* can't find non-existant */
            assertEq(undefined, findEnumToStr<VpcChunkType>(VpcChunkType, 99), '0Y|');
            /* don't allow lookup on marker */
            assertEq(undefined, findEnumToStr<VpcChunkType>(VpcChunkType, VpcChunkType.__isUI512Enum), '0X|');
            /* get canonical string for lines */
            assertEq('Lines', findEnumToStr<VpcChunkType>(VpcChunkType, VpcChunkType.alternateforms_lines), '0W|');
            /* get canonical string for items */
            assertEq('Items', findEnumToStr<VpcChunkType>(VpcChunkType, VpcChunkType.alternateforms_items), '0V|');
            /* get canonical string for words */
            assertEq('Words', findEnumToStr<VpcChunkType>(VpcChunkType, VpcChunkType.alternateforms_words), '0U|');
            /* get canonical string for chars */
            assertEq('Chars', findEnumToStr<VpcChunkType>(VpcChunkType, VpcChunkType.alternateforms_chars), '0T|');
        },
        'test_fitIntoInclusive',
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
            /* if targeting Es3 or Es5, must run typescript with downlevelIteration */
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
        }
    ];
}
