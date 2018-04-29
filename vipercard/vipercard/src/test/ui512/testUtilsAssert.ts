
/* auto */ import { RingBuffer, UI512Compress, checkThrowUI512, joinIntoMessage, makeUI512Error, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase, assertThrows } from '../../ui512/utils/utilsTest.js';

/**
 * tests on utilsAssert.ts
 */
let mTests: (string | Function)[] = [
    'testUtilsAssertThrow.GetsMessageFromCustomError',
    () => {
        assertThrows('', 'mymessage', () => {
            throw makeUI512Error('1N|1 mymessage 2');
        });
    },
    'testUtilsAssertThrow.GetsMessageFromPlainError',
    () => {
        assertThrows('', 'xyz', () => {
            throw new Error('1 xyz 2');
        });
    },
    'testUtilsAssertCheckThrow.ShouldNotThrow',
    () => {
        checkThrowUI512(1, 'should not throw');
        checkThrowUI512(true, 'should not throw');
    },
    'testUtilsAssertCheckThrow.FalseShouldThrow',
    () => {
        assertThrows('', 'mymessage s1 s2', () => {
            checkThrowUI512(false, 'mymessage', 's1', 's2');
        });
    },
    'testUtilsAssertCheckThrow.NullShouldThrow',
    () => {
        assertThrows('', 'mymessage s1 s2', () => {
            checkThrowUI512(null, 'mymessage', 's1', 's2');
        });
    },
    'testUtilsAssertCheckThrow.UndefinedShouldThrow',
    () => {
        assertThrows('', 'mymessage s1 s2', () => {
            checkThrowUI512(undefined, 'mymessage', 's1', 's2');
        });
    },
    'testUtilsAssertThrowIfUndefined.TruthyShouldNotThrow',
    () => {
        let n1 = throwIfUndefined(1, 'should not throw');
        assertEq(1, n1, '');

        let s1 = throwIfUndefined('abc', 'should not throw');
        assertEq('abc', s1, '');

        let b1 = throwIfUndefined(true, 'should not throw');
        assertEq(b1, true, '');
    },
    'testUtilsAssertThrowIfUndefined.FalsyShouldNotThrow',
    () => {
        let n0 = throwIfUndefined(0, 'should not throw');
        assertEq(0, n0, '');

        let s0 = throwIfUndefined('', 'should not throw');
        assertEq('', s0, '');

        let b0 = throwIfUndefined(false, 'should not throw');
        assertEq(b0, false, '');
    },
    'testUtilsAssertThrowIfUndefined.NullShouldThrow',
    () => {
        assertThrows('', 'mymessage, s1, s2', () => {
            throwIfUndefined(null, 'mymessage', 's1', 's2');
        });
    },
    'testUtilsAssertThrowIfUndefined.UndefinedShouldThrow',
    () => {
        assertThrows('', 'mymessage, s1, s2', () => {
            throwIfUndefined(undefined, 'mymessage', 's1', 's2');
        });
    },
    'testUtilsAssertJoinIntoMessage.WithoutTags',
    () => {
        let got = joinIntoMessage('without|tags', 'prefix:');
        assertEq('prefix: without|tags', got, '');
    },
    'testUtilsAssertJoinIntoMessage.ShouldMoveTagsToTheEnd',
    () => {
        let got = joinIntoMessage('ab|', 'prefix:', 'c', 'd', 'e');
        assertEq('prefix: \nc, d, e (ab)', got, '');
        got = joinIntoMessage('ab|the message', 'prefix:');
        assertEq('prefix: the message (ab)', got, '');
        got = joinIntoMessage('the message', 'prefix:', 'ab|c');
        assertEq('prefix: the message\nc (ab)', got, '');
    },
    'testUtilsAssertCompressString',
    () => {
        assertEq('\u2020 ', UI512Compress.compressString(''), '');
        assertEq('\u10E8 ', UI512Compress.compressString('a'), '');
        assertEq('\u10E6\u4866\u4AEA  ', UI512Compress.compressString('aaaaaaaabbbbbbbb'), '');
        assertEq('\u10E6\u4866\u4AE8\u31B0 ', UI512Compress.compressString('aaaaaaaabbbbbbbbc'), '');
        assertEq('\u10E6\u7070\u0256\u4CF0 ', UI512Compress.compressString('aaaaaaa\nbbbbbbbbb'), '');
    },
    'testUtilsAssertDecompressString',
    () => {
        assertEq('', UI512Compress.decompressString('\u2020 '), '');
        assertEq('a', UI512Compress.decompressString('\u10E8 '), '');
        assertEq('aaaaaaaabbbbbbbb', UI512Compress.decompressString('\u10E6\u4866\u4AEA  '), '');
        assertEq('aaaaaaaabbbbbbbbc', UI512Compress.decompressString('\u10E6\u4866\u4AE8\u31B0 '), '');
        assertEq('aaaaaaa\nbbbbbbbbb', UI512Compress.decompressString('\u10E6\u7070\u0256\u4CF0 '), '');
    },
    'testUtilsAssertRingBuffer.SizeRemainsConstant',
    () => {
        let buf = new RingBufferArray(4);
        buf.append('a');
        buf.append('b');
        buf.append('c');
        buf.append('d');
        buf.append('e');
        buf.append('f');
        assertEq(['f'], buf.retrieve(1), '');
        assertEq(['f', 'e'], buf.retrieve(2), '');
        assertEq(['f', 'e', 'd'], buf.retrieve(3), '');
        assertEq('d', buf.getAt(0), '');
        assertEq('e', buf.getAt(1), '');
        assertEq('f', buf.getAt(2), '');
        assertEq('c', buf.getAt(3), '');
        assertEq('', buf.getAt(5), '');
    },
    'testUtilsAssertRingBuffer.CorrectlyWrapsAroundWhenNegative',
    () => {
        let buf = new RingBufferArray(4);
        assertEq(['', ''], buf.retrieve(2), '');
        buf.append('a');
        assertEq(['a', ''], buf.retrieve(2), '');
        buf.append('b');
        assertEq(['b', 'a'], buf.retrieve(2), '');
        buf.append('c');
        assertEq(['c', 'b'], buf.retrieve(2), '');
        buf.append('d');
        assertEq(['d', 'c'], buf.retrieve(2), '');
        buf.append('e');
        assertEq(['e', 'd'], buf.retrieve(2), '');
        buf.append('f');
        assertEq(['f', 'e'], buf.retrieve(2), '');
        buf.append('g');
        assertEq(['g', 'f'], buf.retrieve(2), '');
    }
];

/**
 * exported test class for mTests
 */
export class TestUtilsAssert extends UI512TestBase {
    tests = mTests;
}

/**
 * implementation of RingBuffer backed by a simple array
 */
class RingBufferArray extends RingBuffer {
    arr: string[] = [];
    ptrLatest = 0;
    getAt(index: number): string {
        return this.arr[index] || '';
    }

    setAt(index: number, s: string) {
        this.arr[index] = s;
    }

    getLatestIndex() {
        return this.ptrLatest;
    }

    setLatestIndex(index: number) {
        this.ptrLatest = index;
    }
}
