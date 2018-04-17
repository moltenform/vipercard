
/* auto */ import { RingBuffer, UI512Compress, checkThrowUI512, joinIntoMessage, makeUI512Error, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';

export class TestUtilsAssert extends UI512TestBase {
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
        'testCheckThrow',
        () => {
            /* these should not throw */
            checkThrowUI512(1, 'should not throw');
            checkThrowUI512(true, 'should not throw');

            /* false should throw */
            this.assertThrows('', 'mymessage s1 s2', () => {
                checkThrowUI512(false, 'mymessage', 's1', 's2');
            });

            /* null should throw */
            this.assertThrows('', 'mymessage s1 s2', () => {
                checkThrowUI512(null, 'mymessage', 's1', 's2');
            });

            /* undefined should throw */
            this.assertThrows('', 'mymessage s1 s2', () => {
                checkThrowUI512(undefined, 'mymessage', 's1', 's2');
            });
        },
        'testThrowIfUndefined',
        () => {
            /* these should not throw */
            let n = throwIfUndefined(1, 'should not throw');
            assertEq(1, n, '');

            let n0 = throwIfUndefined(0, 'should not throw');
            assertEq(0, n0, '');

            let s = throwIfUndefined('abc', 'should not throw');
            assertEq('abc', s, '');

            let s0 = throwIfUndefined('', 'should not throw');
            assertEq('', s0, '');

            let b = throwIfUndefined(true, 'should not throw');
            assertEq(b, true, '');

            let b0 = throwIfUndefined(false, 'should not throw');
            assertEq(b0, false, '');

            /* null should throw */
            this.assertThrows('', 'mymessage, s1, s2', () => {
                throwIfUndefined(null, 'mymessage', 's1', 's2');
            });

            /* undefined should throw */
            this.assertThrows('', 'mymessage, s1, s2', () => {
                throwIfUndefined(undefined, 'mymessage', 's1', 's2');
            });
        },
        'testJoinIntoMessage',
        () => {
            /* should move tags to the end */
            let got = joinIntoMessage('ab|', 'prefix:', 'c', 'd', 'e');
            assertEq('prefix: \nc, d, e (ab)', got, '');
            got = joinIntoMessage('ab|the message', 'prefix:');
            assertEq('prefix: the message (ab)', got, '');
            got = joinIntoMessage('the message', 'prefix:', 'ab|c');
            assertEq('prefix: the message\nc (ab)', got, '');
            got = joinIntoMessage('without|tags', 'prefix:');
            assertEq('prefix: without|tags', got, '');
        },
        'test_utils_compressString',
        () => {
            /* simple compress and uncompress */
            assertEq('\u2020 ', UI512Compress.compressString(''), '');
            assertEq('\u10E8 ', UI512Compress.compressString('a'), '');
            assertEq('\u10E6\u4866\u4AEA  ', UI512Compress.compressString('aaaaaaaabbbbbbbb'), '');
            assertEq('\u10E6\u4866\u4AE8\u31B0 ', UI512Compress.compressString('aaaaaaaabbbbbbbbc'), '');
            assertEq('\u10E6\u7070\u0256\u4CF0 ', UI512Compress.compressString('aaaaaaa\nbbbbbbbbb'), '');
            assertEq('', UI512Compress.decompressString('\u2020 '), '');
            assertEq('a', UI512Compress.decompressString('\u10E8 '), '');
            assertEq('aaaaaaaabbbbbbbb', UI512Compress.decompressString('\u10E6\u4866\u4AEA  '), '');
            assertEq('aaaaaaaabbbbbbbbc', UI512Compress.decompressString('\u10E6\u4866\u4AE8\u31B0 '), '');
            assertEq('aaaaaaa\nbbbbbbbbb', UI512Compress.decompressString('\u10E6\u7070\u0256\u4CF0 '), '');
        },
        'testRingBuffer',
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

            /* wrap around, test that buf.retrieve correctly wraps negative numbers */
            buf.append('e');
            assertEq(['e', 'd'], buf.retrieve(2), '');
            buf.append('f');
            assertEq(['f', 'e'], buf.retrieve(2), '');
            buf.append('g');
            assertEq(['g', 'f'], buf.retrieve(2), '');
        }
    ];
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
