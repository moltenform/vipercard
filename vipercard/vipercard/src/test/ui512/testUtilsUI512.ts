
/* auto */ import { UI512ErrorHandling, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { OrderedHash, Util512, assertEq, defaultSort, findStrToEnum, fitIntoInclusive, getEnumToStrOrUnknown, getStrToEnum } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase, assertThrows } from '../../ui512/utils/utilsTest.js';

/**
 * tests on Util512 functions
 */
let mTests: (string | Function)[] = [
    'testUtil512findStrToEnum.FoundPrimary',
    () => {
        assertEq(TestEnum.First, findStrToEnum<TestEnum>(TestEnum, 'First'), '');
        assertEq(TestEnum.Second, findStrToEnum<TestEnum>(TestEnum, 'Second'), '');
        assertEq(TestEnum.Third, findStrToEnum<TestEnum>(TestEnum, 'Third'), '');
    },
    'testUtil512findStrToEnum.NotFound',
    () => {
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, ''), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'F'), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'Firstf'), '');
    },
    'testUtil512findStrToEnum.YouShouldNotBeAbleToAccessFlags',
    () => {
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, '__isUI512Enum'), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, '__UI512EnumCapitalize'), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, '__foo'), '');
    },
    'testUtil512findStrToEnum.YouShouldNotBeAbleToDirectlyAccessAlts',
    () => {
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'AlternateFormTheFirst'), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'AlternateFormScnd'), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'AlternateFormFoo'), '');
    },
    'testUtil512findStrToEnum.FirstLetterCaseInsensitive',
    () => {
        assertEq(TestEnum.First, findStrToEnum<TestEnum>(TestEnum, 'First'), '');
        assertEq(TestEnum.First, findStrToEnum<TestEnum>(TestEnum, 'first'), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'firsT'), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'FirsT'), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'First '), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'Firstf'), '');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'Firs'), '');
    },
    'testUtil512findStrToEnum.UseAlts',
    () => {
        assertEq(TestEnum.First, findStrToEnum<TestEnum>(TestEnum, 'First'), '');
        assertEq(TestEnum.First, findStrToEnum<TestEnum>(TestEnum, 'TheFirst'), '');
        assertEq(TestEnum.Second, findStrToEnum<TestEnum>(TestEnum, 'Scnd'), '');
        assertEq(TestEnum.Third, findStrToEnum<TestEnum>(TestEnum, 'Thd'), '');
    },
    'testUtil512getEnumToStr.FoundPrimary',
    () => {
        assertEq('first', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.First), '');
        assertEq('second', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.Second), '');
        assertEq('third', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.Third), '');
    },
    'testUtil512getEnumToStr.AlternatesHaveSameVal',
    () => {
        assertEq('first', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.AlternateFormTheFirst), '');
        assertEq('second', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.AlternateFormScnd), '');
        assertEq('third', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.AlternateFormThd), '');
    },
    'testUtil512getEnumToStr.NotFound',
    () => {
        assertEq('Unknown', getEnumToStrOrUnknown<TestEnum>(TestEnum, -1), '');
        assertEq('Unknown', getEnumToStrOrUnknown<TestEnum>(TestEnum, 999), '');
    },
    'testUtil512getEnumToStr.ShouldNotBeAbleToAccessFlags',
    () => {
        assertEq('Unknown', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.__isUI512Enum), '');
        assertEq('Unknown', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.__UI512EnumCapitalize), '');
    },
    'testUtil512getStrToEnum.FoundPrimary',
    () => {
        assertEq(TestEnum.First, getStrToEnum<TestEnum>(TestEnum, 'TestEnum', 'First'), '');
        assertEq(TestEnum.Second, getStrToEnum<TestEnum>(TestEnum, 'TestEnum', 'Second'), '');
        assertEq(TestEnum.Third, getStrToEnum<TestEnum>(TestEnum, 'TestEnum', 'Third'), '');
    },
    'testUtil512getStrToEnum.ShowValuesInExceptionMsg',
    () => {
        let excMessage = '';
        try {
            UI512ErrorHandling.breakOnThrow = false;
            getStrToEnum<TestEnum>(TestEnum, 'TestEnum', 'Firstf');
        } catch (e) {
            excMessage = e.toString();
        } finally {
            UI512ErrorHandling.breakOnThrow = true;
        }

        let pts = excMessage.split(',');
        pts.sort();
        assertEq(pts[0], ` first`, '');
        assertEq(pts[1], ` second`, '');
        assertEq(pts[2], ` third (4E)`, '');
        assertTrue(pts[3].endsWith(`Not a valid choice of TestEnum  try one of`), '');
    },
    'testUtil512fitIntoInclusive.AlreadyWithin',
    () => {
        assertEq(1, fitIntoInclusive(1, 1, 1), '');
        assertEq(1, fitIntoInclusive(1, 1, 3), '');
        assertEq(2, fitIntoInclusive(2, 1, 3), '');
        assertEq(3, fitIntoInclusive(3, 1, 3), '');
    },
    'testUtil512fitIntoInclusive.NeedToTruncate',
    () => {
        assertEq(1, fitIntoInclusive(0, 1, 1), '');
        assertEq(1, fitIntoInclusive(2, 1, 1), '');
        assertEq(1, fitIntoInclusive(0, 1, 3), '');
        assertEq(3, fitIntoInclusive(4, 1, 3), '');
    },
    'testUtil512defaultSort.String',
    () => {
        assertEq(0, defaultSort('', ''), '1M|');
        assertEq(0, defaultSort('a', 'a'), '1L|');
        assertEq(1, defaultSort('abc', 'abb'), '1K|');
        assertEq(-1, defaultSort('abb', 'abc'), '1J|');
        assertEq(1, defaultSort('abcd', 'abc'), '1I|');
        assertEq(-1, defaultSort('abc', 'abcd'), '1H|');
    },
    'testUtil512defaultSort.StringWithNonAscii',
    () => {
        assertEq(0, defaultSort('aunicode\u2666char', 'aunicode\u2666char'), '1G|');
        assertEq(1, defaultSort('aunicode\u2667char', 'aunicode\u2666char'), '1F|');
        assertEq(-1, defaultSort('aunicode\u2666char', 'aunicode\u2667char'), '1E|');
        assertEq(0, defaultSort('accented\u00e9letter', 'accented\u00e9letter'), '1D|');
        assertEq(1, defaultSort('accented\u00e9letter', 'accented\u0065\u0301letter'), '1C|');
        assertEq(-1, defaultSort('accented\u0065\u0301letter', 'accented\u00e9letter'), '1B|');
    },
    'testUtil512defaultSort.Bool',
    () => {
        assertEq(0, defaultSort(false, false), '1A|');
        assertEq(0, defaultSort(true, true), '19|');
        assertEq(1, defaultSort(true, false), '18|');
        assertEq(-1, defaultSort(false, true), '17|');
    },
    'testUtil512defaultSort.Number',
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
    'testUtil512defaultSort.DiffTypesShouldThrow',
    () => {
        assertThrows('', 'not compare', () => defaultSort('a', 1));
        assertThrows('', 'not compare', () => defaultSort('a', true));
        assertThrows('', 'not compare', () => defaultSort('a', undefined));
        assertThrows('', 'not compare', () => defaultSort('a', []));
        assertThrows('', 'not compare', () => defaultSort(1, 'a'));
        assertThrows('', 'not compare', () => defaultSort(1, true));
        assertThrows('', 'not compare', () => defaultSort(1, undefined));
        assertThrows('', 'not compare', () => defaultSort(1, []));
        assertThrows('', 'not compare', () => defaultSort(true, 'a'));
        assertThrows('', 'not compare', () => defaultSort(true, 1));
        assertThrows('', 'not compare', () => defaultSort(true, undefined));
        assertThrows('', 'not compare', () => defaultSort(true, []));
        assertThrows('', 'not compare', () => defaultSort(undefined, 'a'));
        assertThrows('', 'not compare', () => defaultSort(undefined, 1));
        assertThrows('', 'not compare', () => defaultSort(undefined, true));
        assertThrows('', 'not compare', () => defaultSort(undefined, []));
        assertThrows('', 'not compare', () => defaultSort([], 'a'));
        assertThrows('', 'not compare', () => defaultSort([], 1));
        assertThrows('', 'not compare', () => defaultSort([], true));
        assertThrows('', 'not compare', () => defaultSort([], undefined));
    },
    'testUtil512defaultSort.DiffTypesInArrayShouldThrow',
    () => {
        assertThrows('', 'not compare', () => defaultSort(['a', 'a'], ['a', 1]));
        assertThrows('', 'not compare', () => defaultSort(['a', 'a'], ['a', true]));
        assertThrows('', 'not compare', () => defaultSort(['a', 'a'], ['a', undefined]));
        assertThrows('', 'not compare', () => defaultSort(['a', 'a'], ['a', []]));
        assertThrows('', 'not compare', () => defaultSort(['a', 1], ['a', 'a']));
        assertThrows('', 'not compare', () => defaultSort(['a', 1], ['a', true]));
        assertThrows('', 'not compare', () => defaultSort(['a', 1], ['a', undefined]));
        assertThrows('', 'not compare', () => defaultSort(['a', 1], ['a', []]));
        assertThrows('', 'not compare', () => defaultSort(['a', true], ['a', 'a']));
        assertThrows('', 'not compare', () => defaultSort(['a', true], ['a', 1]));
        assertThrows('', 'not compare', () => defaultSort(['a', true], ['a', undefined]));
        assertThrows('', 'not compare', () => defaultSort(['a', true], ['a', []]));
        assertThrows('', 'not compare', () => defaultSort(['a', undefined], ['a', 'a']));
        assertThrows('', 'not compare', () => defaultSort(['a', undefined], ['a', 1]));
        assertThrows('', 'not compare', () => defaultSort(['a', undefined], ['a', true]));
        assertThrows('', 'not compare', () => defaultSort(['a', undefined], ['a', []]));
        assertThrows('', 'not compare', () => defaultSort(['a', []], ['a', 'a']));
        assertThrows('', 'not compare', () => defaultSort(['a', []], ['a', 1]));
        assertThrows('', 'not compare', () => defaultSort(['a', []], ['a', true]));
        assertThrows('', 'not compare', () => defaultSort(['a', []], ['a', undefined]));
    },
    'testUtil512defaultSort.ArrayThreeElements',
    () => {
        assertEq(0, defaultSort([5, 'a', 'abcdef'], [5, 'a', 'abcdef']), '0@|');
        assertEq(1, defaultSort([5, 'a', 'abc'], [5, 'a', 'abb']), '0?|');
        assertEq(-1, defaultSort([5, 'a', 'abb'], [5, 'a', 'abc']), '0>|');
    },
    'testUtil512defaultSort.ArraySameLength',
    () => {
        assertEq(0, defaultSort([], []), '0{|');
        assertEq(0, defaultSort([5, 'a'], [5, 'a']), '0`|');
        assertEq(1, defaultSort([5, 'a', 7], [5, 'a', 6]), '0_|');
        assertEq(-1, defaultSort([5, 'a', 6], [5, 'a', 7]), '0^|');
        assertEq(1, defaultSort([5, 7, 'a'], [5, 6, 'a']), '0]|');
        assertEq(1, defaultSort([5, 7, 'a', 600], [5, 6, 'a', 700]), '0[|');
    },
    'testUtil512defaultSort.ArrayDifferentLength',
    () => {
        assertEq(1, defaultSort([1], []), '0=|');
        assertEq(-1, defaultSort([], [1]), '0<|');
        assertEq(1, defaultSort([10, 20], [10]), '0;|');
        assertEq(-1, defaultSort([10], [10, 20]), '0:|');
    },
    'testUtil512defaultSort.ArrayNested',
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
    'testUtil512forOf',
    () => {
        let ar = [11, 22, 33];
        let result: number[] = [];
        for (let item of ar) {
            result.push(item);
        }

        assertEq([11, 22, 33], result, '0t|');
    },
    'testUtil512forOfEmpty',
    () => {
        let ar: number[] = [];
        let result: number[] = [];
        for (let item of ar) {
            result.push(item);
        }

        assertEq([], result, '');
    },
    'testUtil512forOfGenerator',
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
        }

        assertEq([10, 20, 30, 40], result, '0s|');
    },
    'testOrderedHash.IterKeys',
    () => {
        let h = new OrderedHash<number>();
        h.insertNew('ccc', 30);
        h.insertNew('ccb', 29);
        h.insertNew('cca', 28);
        let result: string[] = [];
        for (let item of h.iterKeys()) {
            result.push(item);
        }

        assertEq(['ccc', 'ccb', 'cca'], result, '0q|');
    },
    'testOrderedHash.IterVals',
    () => {
        let h = new OrderedHash<number>();
        h.insertNew('ccc', 30);
        h.insertNew('ccb', 29);
        h.insertNew('cca', 28);
        let result: number[] = [];
        for (let item of h.iter()) {
            result.push(item);
        }

        assertEq([30, 29, 28], result, '0p|');
    },
    'testOrderedHash.IterReversed',
    () => {
        let h = new OrderedHash<number>();
        h.insertNew('ccc', 30);
        h.insertNew('ccb', 29);
        h.insertNew('cca', 28);
        let result: number[] = [];
        for (let item of h.iterReversed()) {
            result.push(item);
        }

        assertEq([28, 29, 30], result, '0o|');
    }
];

/**
 * exported test class for mTests
 */
export class TestUI512Utils extends UI512TestBase {
    tests = mTests;
}

/**
 * test-only enum, similar to the real-world _VpcChunkType_
 */
enum TestEnum {
    __isUI512Enum = 1,
    __UI512EnumCapitalize,
    First,
    Second,
    Third,
    AlternateFormTheFirst = First,
    AlternateFormScnd = Second,
    AlternateFormThd = Third
}
