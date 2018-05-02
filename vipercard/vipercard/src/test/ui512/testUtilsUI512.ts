
/* auto */ import { UI512ErrorHandling, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { OrderedHash, Util512, assertEq, defaultSort, findStrToEnum, fitIntoInclusive, getEnumToStrOrUnknown, getStrToEnum } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase, assertThrows } from '../../ui512/utils/utilsTest.js';

/**
 * tests on Util512 functions
 */
let mTests: (string | Function)[] = [
    'testUtil512findStrToEnum.FoundPrimary',
    () => {
        assertEq(TestEnum.First, findStrToEnum<TestEnum>(TestEnum, 'First'), 'Dz|');
        assertEq(TestEnum.Second, findStrToEnum<TestEnum>(TestEnum, 'Second'), 'Dy|');
        assertEq(TestEnum.Third, findStrToEnum<TestEnum>(TestEnum, 'Third'), 'Dx|');
    },
    'testUtil512findStrToEnum.NotFound',
    () => {
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, ''), 'Dw|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'F'), 'Dv|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'Firstf'), 'Du|');
    },
    'testUtil512findStrToEnum.YouShouldNotBeAbleToAccessFlags',
    () => {
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, '__isUI512Enum'), 'Dt|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, '__UI512EnumCapitalize'), 'Ds|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, '__foo'), 'Dr|');
    },
    'testUtil512findStrToEnum.YouShouldNotBeAbleToDirectlyAccessAlts',
    () => {
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'AlternateFormTheFirst'), 'Dq|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'AlternateFormScnd'), 'Dp|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'AlternateFormFoo'), 'Do|');
    },
    'testUtil512findStrToEnum.FirstLetterCaseInsensitive',
    () => {
        assertEq(TestEnum.First, findStrToEnum<TestEnum>(TestEnum, 'First'), 'Dn|');
        assertEq(TestEnum.First, findStrToEnum<TestEnum>(TestEnum, 'first'), 'Dm|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'firsT'), 'Dl|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'FirsT'), 'Dk|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'First '), 'Dj|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'Firstf'), 'Di|');
        assertEq(undefined, findStrToEnum<TestEnum>(TestEnum, 'Firs'), 'Dh|');
    },
    'testUtil512findStrToEnum.UseAlts',
    () => {
        assertEq(TestEnum.First, findStrToEnum<TestEnum>(TestEnum, 'First'), 'Dg|');
        assertEq(TestEnum.First, findStrToEnum<TestEnum>(TestEnum, 'TheFirst'), 'Df|');
        assertEq(TestEnum.Second, findStrToEnum<TestEnum>(TestEnum, 'Scnd'), 'De|');
        assertEq(TestEnum.Third, findStrToEnum<TestEnum>(TestEnum, 'Thd'), 'Dd|');
    },
    'testUtil512getEnumToStr.FoundPrimary',
    () => {
        assertEq('first', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.First), 'Dc|');
        assertEq('second', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.Second), 'Db|');
        assertEq('third', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.Third), 'Da|');
    },
    'testUtil512getEnumToStr.AlternatesHaveSameVal',
    () => {
        assertEq('first', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.AlternateFormTheFirst), 'DZ|');
        assertEq('second', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.AlternateFormScnd), 'DY|');
        assertEq('third', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.AlternateFormThd), 'DX|');
    },
    'testUtil512getEnumToStr.NotFound',
    () => {
        assertEq('Unknown', getEnumToStrOrUnknown<TestEnum>(TestEnum, -1), 'DW|');
        assertEq('Unknown', getEnumToStrOrUnknown<TestEnum>(TestEnum, 999), 'DV|');
    },
    'testUtil512getEnumToStr.ShouldNotBeAbleToAccessFlags',
    () => {
        assertEq('Unknown', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.__isUI512Enum), 'DU|');
        assertEq('Unknown', getEnumToStrOrUnknown<TestEnum>(TestEnum, TestEnum.__UI512EnumCapitalize), 'DT|');
    },
    'testUtil512getStrToEnum.FoundPrimary',
    () => {
        assertEq(TestEnum.First, getStrToEnum<TestEnum>(TestEnum, 'TestEnum', 'First'), 'DS|');
        assertEq(TestEnum.Second, getStrToEnum<TestEnum>(TestEnum, 'TestEnum', 'Second'), 'DR|');
        assertEq(TestEnum.Third, getStrToEnum<TestEnum>(TestEnum, 'TestEnum', 'Third'), 'DQ|');
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
        assertEq(pts[0], ` first`, 'DP|');
        assertEq(pts[1], ` second`, 'DO|');
        assertEq(pts[2], ` third (4E)`, 'DN|');
        assertTrue(pts[3].endsWith(`Not a valid choice of TestEnum  try one of`), 'DM|');
    },
    'testUtil512fitIntoInclusive.AlreadyWithin',
    () => {
        assertEq(1, fitIntoInclusive(1, 1, 1), 'DL|');
        assertEq(1, fitIntoInclusive(1, 1, 3), 'DK|');
        assertEq(2, fitIntoInclusive(2, 1, 3), 'DJ|');
        assertEq(3, fitIntoInclusive(3, 1, 3), 'DI|');
    },
    'testUtil512fitIntoInclusive.NeedToTruncate',
    () => {
        assertEq(1, fitIntoInclusive(0, 1, 1), 'DH|');
        assertEq(1, fitIntoInclusive(2, 1, 1), 'DG|');
        assertEq(1, fitIntoInclusive(0, 1, 3), 'DF|');
        assertEq(3, fitIntoInclusive(4, 1, 3), 'DE|');
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
        assertThrows('Le|', 'not compare', () => defaultSort('a', 1));
        assertThrows('Ld|', 'not compare', () => defaultSort('a', true));
        assertThrows('Lc|', 'not compare', () => defaultSort('a', undefined));
        assertThrows('Lb|', 'not compare', () => defaultSort('a', []));
        assertThrows('La|', 'not compare', () => defaultSort(1, 'a'));
        assertThrows('LZ|', 'not compare', () => defaultSort(1, true));
        assertThrows('LY|', 'not compare', () => defaultSort(1, undefined));
        assertThrows('LX|', 'not compare', () => defaultSort(1, []));
        assertThrows('LW|', 'not compare', () => defaultSort(true, 'a'));
        assertThrows('LV|', 'not compare', () => defaultSort(true, 1));
        assertThrows('LU|', 'not compare', () => defaultSort(true, undefined));
        assertThrows('LT|', 'not compare', () => defaultSort(true, []));
        assertThrows('LS|', 'not compare', () => defaultSort(undefined, 'a'));
        assertThrows('LR|', 'not compare', () => defaultSort(undefined, 1));
        assertThrows('LQ|', 'not compare', () => defaultSort(undefined, true));
        assertThrows('LP|', 'not compare', () => defaultSort(undefined, []));
        assertThrows('LO|', 'not compare', () => defaultSort([], 'a'));
        assertThrows('LN|', 'not compare', () => defaultSort([], 1));
        assertThrows('LM|', 'not compare', () => defaultSort([], true));
        assertThrows('LL|', 'not compare', () => defaultSort([], undefined));
    },
    'testUtil512defaultSort.DiffTypesInArrayShouldThrow',
    () => {
        assertThrows('LK|', 'not compare', () => defaultSort(['a', 'a'], ['a', 1]));
        assertThrows('LJ|', 'not compare', () => defaultSort(['a', 'a'], ['a', true]));
        assertThrows('LI|', 'not compare', () => defaultSort(['a', 'a'], ['a', undefined]));
        assertThrows('LH|', 'not compare', () => defaultSort(['a', 'a'], ['a', []]));
        assertThrows('LG|', 'not compare', () => defaultSort(['a', 1], ['a', 'a']));
        assertThrows('LF|', 'not compare', () => defaultSort(['a', 1], ['a', true]));
        assertThrows('LE|', 'not compare', () => defaultSort(['a', 1], ['a', undefined]));
        assertThrows('LD|', 'not compare', () => defaultSort(['a', 1], ['a', []]));
        assertThrows('LC|', 'not compare', () => defaultSort(['a', true], ['a', 'a']));
        assertThrows('LB|', 'not compare', () => defaultSort(['a', true], ['a', 1]));
        assertThrows('LA|', 'not compare', () => defaultSort(['a', true], ['a', undefined]));
        assertThrows('L9|', 'not compare', () => defaultSort(['a', true], ['a', []]));
        assertThrows('L8|', 'not compare', () => defaultSort(['a', undefined], ['a', 'a']));
        assertThrows('L7|', 'not compare', () => defaultSort(['a', undefined], ['a', 1]));
        assertThrows('L6|', 'not compare', () => defaultSort(['a', undefined], ['a', true]));
        assertThrows('L5|', 'not compare', () => defaultSort(['a', undefined], ['a', []]));
        assertThrows('L4|', 'not compare', () => defaultSort(['a', []], ['a', 'a']));
        assertThrows('L3|', 'not compare', () => defaultSort(['a', []], ['a', 1]));
        assertThrows('L2|', 'not compare', () => defaultSort(['a', []], ['a', true]));
        assertThrows('L1|', 'not compare', () => defaultSort(['a', []], ['a', undefined]));
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

        assertEq([], result, 'DD|');
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
