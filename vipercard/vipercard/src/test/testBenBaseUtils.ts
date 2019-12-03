
/* auto */ import { SimpleSensibleTestCategory, assertThrows, sorted } from './testUtils';
/* auto */ import { UI512ErrorHandling, assertTrue } from './../util/benBaseUtilsAssert';
/* auto */ import { MapKeyToObjectCanSet, OrderedHash, Util512, ValHolder, assertEq, bool, cast, checkThrowEq, findStrToEnum, fitIntoInclusive, getEnumToStrOrUnknown, getStrToEnum, isString, last, longstr, sensibleSort, slength, } from './../util/benBaseUtils';

let t = new SimpleSensibleTestCategory('testBenBaseUtils');
export let testBenBaseUtils = t;

t.test('ValHolder.param', () => {
    function increment(vv: ValHolder<number>) {
        vv.val += 1;
    }

    let v = new ValHolder(0);
    increment(v);
    assertEq(1, v.val, 'NR|');
});
t.test('ValHolder.closure', () => {
    function increment() {
        v.val += 1;
    }

    let v = new ValHolder(0);
    increment();
    assertEq(1, v.val, 'NQ|');
});
t.test('findStrToEnum.FoundPrimary', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'), 'Dz|');
    assertEq(TestEnum.Second, findStrToEnum(TestEnum, 'Second'), 'Dy|');
    assertEq(TestEnum.Third, findStrToEnum(TestEnum, 'Third'), 'Dx|');
});
t.test('findStrToEnum.NotFound', () => {
    assertEq(undefined, findStrToEnum(TestEnum, ''), 'Dw|');
    assertEq(undefined, findStrToEnum(TestEnum, 'F'), 'Dv|');
    assertEq(undefined, findStrToEnum(TestEnum, 'Firstf'), 'Du|');
});
t.test('findStrToEnum.YouShouldNotBeAbleToAccessFlags', () => {
    assertEq(undefined, findStrToEnum(TestEnum, '__isUI512Enum'), 'Dt|');
    assertEq(undefined, findStrToEnum(TestEnum, '__UI512EnumCapitalize'), 'Ds|');
    assertEq(undefined, findStrToEnum(TestEnum, '__foo'), 'Dr|');
});
t.test('findStrToEnum.YouShouldNotBeAbleToDirectlyAccessAlts', () => {
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormTheFirst'), 'NP|');
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormScnd'), 'NO|');
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateFormFoo'), 'NN|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateFormTheFirst'), 'NM|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateFormScnd'), 'NL|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateFormFoo'), 'NK|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__TheFirst'), 'NJ|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__Scnd'), 'Dp|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__Foo'), 'Do|');
    assertEq(undefined, findStrToEnum(TestEnum, 'AlternateForm'), 'NI|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm'), 'NH|');
    assertEq(undefined, findStrToEnum(TestEnum, '__AlternateForm__'), 'Dq|');
});
t.test('findStrToEnum.FirstLetterCaseInsensitive', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'), 'Dn|');
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'first'), 'Dm|');
    assertEq(undefined, findStrToEnum(TestEnum, 'firsT'), 'Dl|');
    assertEq(undefined, findStrToEnum(TestEnum, 'FirsT'), 'Dk|');
    assertEq(undefined, findStrToEnum(TestEnum, 'First '), 'Dj|');
    assertEq(undefined, findStrToEnum(TestEnum, 'Firstf'), 'Di|');
    assertEq(undefined, findStrToEnum(TestEnum, 'Firs'), 'Dh|');
});
t.test('findStrToEnum.UseAlts', () => {
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'First'), 'Dg|');
    assertEq(TestEnum.First, findStrToEnum(TestEnum, 'TheFirst'), 'Df|');
    assertEq(TestEnum.Second, findStrToEnum(TestEnum, 'Scnd'), 'De|');
    assertEq(TestEnum.Third, findStrToEnum(TestEnum, 'Thd'), 'Dd|');
});
t.test('getEnumToStr.FoundPrimary', () => {
    assertEq('first', getEnumToStrOrUnknown(TestEnum, TestEnum.First), 'Dc|');
    assertEq('second', getEnumToStrOrUnknown(TestEnum, TestEnum.Second), 'Db|');
    assertEq('third', getEnumToStrOrUnknown(TestEnum, TestEnum.Third), 'Da|');
});
t.test('getEnumToStr.AlternatesHaveSameVal', () => {
    assertEq(
        'first',
        getEnumToStrOrUnknown(TestEnum, TestEnum.__AlternateForm__TheFirst),
        'DZ|',
    );
    assertEq(
        'second',
        getEnumToStrOrUnknown(TestEnum, TestEnum.__AlternateForm__Scnd),
        'DY|',
    );
    assertEq(
        'third',
        getEnumToStrOrUnknown(TestEnum, TestEnum.__AlternateForm__Thd),
        'DX|',
    );
});
t.test('getEnumToStr.NotFound', () => {
    assertEq('Unknown', getEnumToStrOrUnknown(TestEnum, -1), 'DW|');
    assertEq('Unknown', getEnumToStrOrUnknown(TestEnum, 999), 'DV|');
});
t.test('getEnumToStr.ShouldNotBeAbleToAccessFlags', () => {
    assertEq('Unknown', getEnumToStrOrUnknown(TestEnum, TestEnum.__isUI512Enum), 'DU|');
    assertEq(
        'Unknown',
        getEnumToStrOrUnknown(TestEnum, TestEnum.__UI512EnumCapitalize),
        'DT|',
    );
});
t.test('getStrToEnum.FoundPrimary', () => {
    assertEq(TestEnum.First, getStrToEnum(TestEnum, 'TestEnum', 'First'), 'DS|');
    assertEq(TestEnum.Second, getStrToEnum(TestEnum, 'TestEnum', 'Second'), 'DR|');
    assertEq(TestEnum.Third, getStrToEnum(TestEnum, 'TestEnum', 'Third'), 'DQ|');
});
t.test('getStrToEnum.ShowValuesInExceptionMsg', () => {
    let excMessage = '';
    try {
        UI512ErrorHandling.breakOnThrow = false;
        getStrToEnum(TestEnum, 'TestEnum', 'Firstf');
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
    assertTrue(pts[3].endsWith(`Not a valid choice of TestEnum. try one of`), 'DM|');
});
t.test('slength', () => {
    assertEq(0, slength(null), 'NG|');
    assertEq(0, slength(undefined), 'NF|');
    assertEq(0, slength(''), 'NE|');
    assertEq(3, slength('abc'), 'ND|');
});
t.test('cast', () => {
    class Parent {
        public a() {
            return 'parent';
        }
    }
    class Child extends Parent {
        public a() {
            return 'child';
        }
    }
    class Other {
        public a() {
            return 'other';
        }
    }

    let o1: unknown = new Parent();
    assertEq('parent', cast(o1, Parent).a(), 'NC|');
    o1 = new Child();
    assertEq('child', cast(o1, Parent).a(), 'NB|');
    o1 = new Other();
    assertThrows('NA|', 'type cast exception', () => {
        cast(o1, Parent);
    });
});
t.test('isString', () => {
    assertTrue(isString(''), 'N9|');
    assertTrue(isString('abc'), 'N8|');
    assertTrue(isString(String('abc')), 'N7|');
    assertTrue(isString(new String('abc')), 'N6|');
    assertTrue(!isString(123), 'N5|');
    assertTrue(!isString(null), 'N4|');
    assertTrue(!isString(undefined), 'N3|');
    assertTrue(!isString(['a']), 'N2|');
});
t.test('fitIntoInclusive.AlreadyWithin', () => {
    assertEq(1, fitIntoInclusive(1, 1, 1), 'DL|');
    assertEq(1, fitIntoInclusive(1, 1, 3), 'DK|');
    assertEq(2, fitIntoInclusive(2, 1, 3), 'DJ|');
    assertEq(3, fitIntoInclusive(3, 1, 3), 'DI|');
});
t.test('fitIntoInclusive.NeedToTruncate', () => {
    assertEq(1, fitIntoInclusive(0, 1, 1), 'DH|');
    assertEq(1, fitIntoInclusive(2, 1, 1), 'DG|');
    assertEq(1, fitIntoInclusive(0, 1, 3), 'DF|');
    assertEq(3, fitIntoInclusive(4, 1, 3), 'DE|');
});
t.test('sensibleSort.String', () => {
    assertEq(0, sensibleSort('', ''), '1M|');
    assertEq(0, sensibleSort('a', 'a'), '1L|');
    assertEq(1, sensibleSort('abc', 'abb'), '1K|');
    assertEq(-1, sensibleSort('abb', 'abc'), '1J|');
    assertEq(1, sensibleSort('abcd', 'abc'), '1I|');
    assertEq(-1, sensibleSort('abc', 'abcd'), '1H|');
});
t.test('sensibleSort.StringWithNonAscii', () => {
    assertEq(0, sensibleSort('aunicode\u2666char', 'aunicode\u2666char'), '1G|');
    assertEq(1, sensibleSort('aunicode\u2667char', 'aunicode\u2666char'), '1F|');
    assertEq(-1, sensibleSort('aunicode\u2666char', 'aunicode\u2667char'), '1E|');
    assertEq(0, sensibleSort('accented\u00e9letter', 'accented\u00e9letter'), '1D|');
    assertEq(
        1,
        sensibleSort('accented\u00e9letter', 'accented\u0065\u0301letter'),
        '1C|',
    );
    assertEq(
        -1,
        sensibleSort('accented\u0065\u0301letter', 'accented\u00e9letter'),
        '1B|',
    );
});
t.test('sensibleSort.Bool', () => {
    assertEq(0, sensibleSort(false, false), '1A|');
    assertEq(0, sensibleSort(true, true), '19|');
    assertEq(1, sensibleSort(true, false), '18|');
    assertEq(-1, sensibleSort(false, true), '17|');
});
t.test('sensibleSort.Number', () => {
    assertEq(0, sensibleSort(0, 0), '16|');
    assertEq(0, sensibleSort(1, 1), '15|');
    assertEq(0, sensibleSort(12345, 12345), '14|');
    assertEq(0, sensibleSort(-11.15, -11.15), '13|');
    assertEq(-1, sensibleSort(0, 1), '12|');
    assertEq(1, sensibleSort(1, 0), '11|');
    assertEq(1, sensibleSort(1.4, 1.3), '10|');
    assertEq(1, sensibleSort(0, -1), '0~|');
    assertEq(1, sensibleSort(Number.POSITIVE_INFINITY, 12345), '0}|');
    assertEq(-1, sensibleSort(Number.NEGATIVE_INFINITY, -12345), '0||');
});
t.test('sensibleSort.Nullish', () => {
    assertEq(0, sensibleSort(undefined, undefined), 'N1|');
    assertEq(0, sensibleSort(null, null), 'N0|');
    assertThrows('M~|', 'not compare', () => sensibleSort(null, undefined));
    assertThrows('M}|', 'not compare', () => sensibleSort(undefined, null));
});
t.test('sensibleSort.DiffTypesShouldThrow', () => {
    assertThrows('Le|', 'not compare', () => sensibleSort('a', 1));
    assertThrows('Ld|', 'not compare', () => sensibleSort('a', true));
    assertThrows('Lc|', 'not compare', () => sensibleSort('a', undefined));
    assertThrows('Lb|', 'not compare', () => sensibleSort('a', []));
    assertThrows('La|', 'not compare', () => sensibleSort(1, 'a'));
    assertThrows('LZ|', 'not compare', () => sensibleSort(1, true));
    assertThrows('LY|', 'not compare', () => sensibleSort(1, undefined));
    assertThrows('LX|', 'not compare', () => sensibleSort(1, []));
    assertThrows('LW|', 'not compare', () => sensibleSort(true, 'a'));
    assertThrows('LV|', 'not compare', () => sensibleSort(true, 1));
    assertThrows('LU|', 'not compare', () => sensibleSort(true, undefined));
    assertThrows('LT|', 'not compare', () => sensibleSort(true, []));
    assertThrows('LS|', 'not compare', () => sensibleSort(undefined, 'a'));
    assertThrows('LR|', 'not compare', () => sensibleSort(undefined, 1));
    assertThrows('LQ|', 'not compare', () => sensibleSort(undefined, true));
    assertThrows('LP|', 'not compare', () => sensibleSort(undefined, []));
    assertThrows('LO|', 'not compare', () => sensibleSort([], 'a'));
    assertThrows('LN|', 'not compare', () => sensibleSort([], 1));
    assertThrows('LM|', 'not compare', () => sensibleSort([], true));
    assertThrows('LL|', 'not compare', () => sensibleSort([], undefined));
});
t.test('sensibleSort.DiffTypesInArrayShouldThrow', () => {
    assertThrows('LK|', 'not compare', () => sensibleSort(['a', 'a'], ['a', 1]));
    assertThrows('LJ|', 'not compare', () => sensibleSort(['a', 'a'], ['a', true]));
    assertThrows('LI|', 'not compare', () => sensibleSort(['a', 'a'], ['a', undefined]));
    assertThrows('LH|', 'not compare', () => sensibleSort(['a', 'a'], ['a', []]));
    assertThrows('LG|', 'not compare', () => sensibleSort(['a', 1], ['a', 'a']));
    assertThrows('LF|', 'not compare', () => sensibleSort(['a', 1], ['a', true]));
    assertThrows('LE|', 'not compare', () => sensibleSort(['a', 1], ['a', undefined]));
    assertThrows('LD|', 'not compare', () => sensibleSort(['a', 1], ['a', []]));
    assertThrows('LC|', 'not compare', () => sensibleSort(['a', true], ['a', 'a']));
    assertThrows('LB|', 'not compare', () => sensibleSort(['a', true], ['a', 1]));
    assertThrows('LA|', 'not compare', () => sensibleSort(['a', true], ['a', undefined]));
    assertThrows('L9|', 'not compare', () => sensibleSort(['a', true], ['a', []]));
    assertThrows('L8|', 'not compare', () => sensibleSort(['a', undefined], ['a', 'a']));
    assertThrows('L7|', 'not compare', () => sensibleSort(['a', undefined], ['a', 1]));
    assertThrows('L6|', 'not compare', () => sensibleSort(['a', undefined], ['a', true]));
    assertThrows('L5|', 'not compare', () => sensibleSort(['a', undefined], ['a', []]));
    assertThrows('L4|', 'not compare', () => sensibleSort(['a', []], ['a', 'a']));
    assertThrows('L3|', 'not compare', () => sensibleSort(['a', []], ['a', 1]));
    assertThrows('L2|', 'not compare', () => sensibleSort(['a', []], ['a', true]));
    assertThrows('L1|', 'not compare', () => sensibleSort(['a', []], ['a', undefined]));
});
t.test('sensibleSort.ArrayThreeElements', () => {
    assertEq(0, sensibleSort([5, 'a', 'abcdef'], [5, 'a', 'abcdef']), '0@|');
    assertEq(1, sensibleSort([5, 'a', 'abc'], [5, 'a', 'abb']), '0?|');
    assertEq(-1, sensibleSort([5, 'a', 'abb'], [5, 'a', 'abc']), '0>|');
});
t.test('sensibleSort.ArraySameLength', () => {
    assertEq(0, sensibleSort([], []), '0{|');
    assertEq(0, sensibleSort([5, 'a'], [5, 'a']), '0`|');
    assertEq(1, sensibleSort([5, 'a', 7], [5, 'a', 6]), '0_|');
    assertEq(-1, sensibleSort([5, 'a', 6], [5, 'a', 7]), '0^|');
    assertEq(1, sensibleSort([5, 7, 'a'], [5, 6, 'a']), '0]|');
    assertEq(1, sensibleSort([5, 7, 'a', 600], [5, 6, 'a', 700]), '0[|');
});
t.test('sensibleSort.ArrayDifferentLength', () => {
    assertEq(1, sensibleSort([1], []), '0=|');
    assertEq(-1, sensibleSort([], [1]), '0<|');
    assertEq(1, sensibleSort([10, 20], [10]), '0;|');
    assertEq(-1, sensibleSort([10], [10, 20]), '0:|');
});
t.test('sensibleSort.ArrayNested', () => {
    assertEq(0, sensibleSort([[]], [[]]), '0/|');
    assertEq(0, sensibleSort([[], []], [[], []]), '0.|');
    assertEq(0, sensibleSort([[1, 2], []], [[1, 2], []]), '0-|');
    assertEq(0, sensibleSort([[10, 20], [30]], [[10, 20], [30]]), '0,|');
    assertEq(1, sensibleSort([[10, 20], [30]], [[10, 20], [-30]]), '0+|');
    assertEq(-1, sensibleSort([[10, 20], [-30]], [[10, 20], [30]]), '0*|');
    assertEq(
        1,
        sensibleSort(
            [
                [10, 20],
                [1, 30],
            ],
            [
                [10, 20],
                [1, -30],
            ],
        ),
        '0)|',
    );
    assertEq(
        -1,
        sensibleSort(
            [
                [10, 20],
                [1, -30],
            ],
            [
                [10, 20],
                [1, 30],
            ],
        ),
        '0(|',
    );
    assertEq(
        1,
        sensibleSort(
            [
                [10, 20],
                [30, 31],
            ],
            [[10, 20], [30]],
        ),
        '0&|',
    );
    assertEq(
        -1,
        sensibleSort(
            [[10, 20], [30]],
            [
                [10, 20],
                [30, 31],
            ],
        ),
        '0%|',
    );
    assertEq(0, sensibleSort([[10, 20], 50, [30]], [[10, 20], 50, [30]]), '0$|');
    assertEq(1, sensibleSort([[10, 20], 60, [30]], [[10, 20], 50, [30]]), '0#|');
    assertEq(-1, sensibleSort([[10, 20], 50, [30]], [[10, 20], 60, [30]]), '0!|');
});
t.test('forOf', () => {
    let ar = [11, 22, 33];
    let result: number[] = [];
    for (let item of ar) {
        result.push(item);
    }

    assertEq([11, 22, 33], result, '0t|');
});
t.test('forOfEmpty', () => {
    let ar: number[] = [];
    let result: number[] = [];
    for (let item of ar) {
        result.push(item);
    }

    assertEq([], result, 'DD|');
});
t.test('forOfGenerator', () => {
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
});
t.test('testOrderedHash.IterKeys', () => {
    let h = new OrderedHash<number>();
    h.insertNew('ccc', 30);
    h.insertNew('ccb', 29);
    h.insertNew('cca', 28);
    let result: string[] = [];
    for (let item of h.iterKeys()) {
        result.push(item);
    }

    assertEq(['ccc', 'ccb', 'cca'], result, '0q|');
});
t.test('testOrderedHash.IterVals', () => {
    let h = new OrderedHash<number>();
    h.insertNew('ccc', 30);
    h.insertNew('ccb', 29);
    h.insertNew('cca', 28);
    let result: number[] = [];
    for (let item of h.iter()) {
        result.push(item);
    }

    assertEq([30, 29, 28], result, '0p|');
});
t.test('testOrderedHash.IterReversed', () => {
    let h = new OrderedHash<number>();
    h.insertNew('ccc', 30);
    h.insertNew('ccb', 29);
    h.insertNew('cca', 28);
    let result: number[] = [];
    for (let item of h.iterReversed()) {
        result.push(item);
    }

    assertEq([28, 29, 30], result, '0o|');
});
t.test('MapKeyToObjectCanSet', () => {
    let o = new MapKeyToObjectCanSet<number>();
    o.add('five', 5);
    o.add('six', 6);
    t.say(/*——————————*/ 'exists');
    assertTrue(o.exists('five'), 'M||');
    assertTrue(o.exists('six'), 'M{|');
    assertTrue(!o.exists('seven'), 'M_|');
    assertTrue(!o.exists(''), 'M^|');
    t.say(/*——————————*/ 'get');
    assertEq(5, o.get('five'), 'M]|');
    assertEq(6, o.get('six'), 'M[|');
    assertThrows('M@|', 'not found', () => {
        o.get('seven');
    });
    assertThrows('M?|', 'not found', () => {
        o.get('');
    });
    t.say(/*——————————*/ 'find');
    assertEq(5, o.find('five'), 'M>|');
    assertEq(6, o.find('six'), 'M=|');
    assertEq(undefined, o.find('seven'), 'M<|');
    assertEq(undefined, o.find(''), 'M;|');
    t.say(/*——————————*/ 'getKeys');
    assertEq(['five', 'six'], sorted(o.getKeys()), 'M:|');
    assertEq([5, 6], sorted(o.getVals()), 'M/|');
    t.say(/*——————————*/ 'remove');
    o.remove('five');
    assertEq(undefined, o.find('five'), 'M.|');
});
t.test('checkThrowEq', () => {
    checkThrowEq(1, 1, 'M-|');
    checkThrowEq('abc', 'abc', 'M,|');
    assertThrows('M+|', 'but got', () => {
        checkThrowEq(1, 2, 'M*|');
    });
    assertThrows('M)|', 'but got', () => {
        checkThrowEq('abc', 'ABC', 'M(|');
    });
});
t.test('last', () => {
    assertEq(3, last([1, 2, 3]), 'M&|');
    assertEq(1, last([1]), 'M%|');
});
t.test('bool', () => {
    assertEq(true, bool(true), 'M#|');
    assertEq(true, bool(['abc']), 'M!|');
    assertEq(true, bool('abc'), 'M |');
    assertEq(true, bool(123), 'Mz|');
    assertEq(false, bool(false), 'My|');
    assertEq(false, bool(''), 'Mx|');
    assertEq(false, bool(0), 'Mw|');
    assertEq(true, bool([]), 'Mv|');
    assertEq(false, bool(null), 'Mu|');
    assertEq(false, bool(undefined), 'Mt|');
    assertEq(false, bool(NaN), 'Ms|');
});
t.test('longstr', () => {
    let s = longstr(`a long
        string across
        a few lines`);
    assertEq('a long string across a few lines', s, 'Mr|');
    s = `a long
    string across
    a few lines`;
    let sUnix = Util512.normalizeNewlines(s);
    assertEq('a long string across a few lines', longstr(sUnix), 'Mq|');
    let sWindows = Util512.normalizeNewlines(s).replace(/\n/g, '\r\n');
    assertEq('a long string across a few lines', longstr(sWindows), 'Mp|');
});

/**
 * test-only enum
 */
enum TestEnum {
    __isUI512Enum = 1,
    __UI512EnumCapitalize,
    First,
    Second,
    Third,
    __AlternateForm__TheFirst = First,
    __AlternateForm__Scnd = Second,
    __AlternateForm__Thd = Third,
}
