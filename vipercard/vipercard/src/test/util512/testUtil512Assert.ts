
/* auto */ import { checkThrow, checkThrowEq, checkThrowInternal, checkThrowNotifyMessage } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { RingBuffer, UI512Compress, tostring } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, checkThrow512, ensureDefined, joinIntoMessage, make512Error } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { assertEq, checkThrowEq512 } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, assertThrows } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the MIT license */

let t = new SimpleUtil512TestCollection('testCollectionUtil512Assert');
export let testCollectionUtil512Assert = t;

t.test('AssertThrows', () => {
    t.say(/*——————————*/ 'Get Message From Custom Error');
    assertThrows('L0|', 'mymessage', () => {
        throw make512Error('1N|1 mymessage 2').clsAsErr();
    });
    t.say(/*——————————*/ 'Get Message From Plain Error');
    assertThrows('K~|', 'xyz', () => {
        throw new Error('1 xyz 2');
    });
});
t.test('CheckThrow', () => {
    t.say(/*——————————*/ 'Should Not Throw');
    checkThrow512(1, 'K<|should not throw');
    checkThrow512(true, 'K;|should not throw');
    t.say(/*——————————*/ 'False Should Throw');
    assertThrows('K}|', 'mymessage\ns1, s2', () => {
        checkThrow512(false, 'K:|mymessage', 's1', 's2');
    });
    t.say(/*——————————*/ 'Null Should Throw');
    assertThrows('K||', 'mymessage\ns1, s2', () => {
        checkThrow512(null, 'K/|mymessage', 's1', 's2');
    });
    t.say(/*——————————*/ 'Undefined Should Throw');
    assertThrows('K{|', 'mymessage\ns1, s2', () => {
        checkThrow512(undefined, 'K.|mymessage', 's1', 's2');
    });
});
t.test('GetAssertMessages', () => {
    checkThrow512(1, '')
    checkThrowEq512('a', 'a', '')
    checkThrow(1, '')
    checkThrowEq('a', 'a', '')
    checkThrowInternal(1, '')
    checkThrowNotifyMessage(1, '')
    assertThrows('', 'ui512 a (;0)', () => {
        checkThrow512(false, ';0|a');
    })
    assertThrows('', 'ui512 a\nb (;1)', () => {
        checkThrow512(false, ';1|a', 'b');
    })
    assertThrows('', 'ui512 a\nb, c (;2)', () => {
        checkThrow512(false, ';2|a', 'b', 'c');
    })
    assertThrows('', "ui512 a expected 'a' but got 'b'. (;3)", () => {
        checkThrowEq512('a', 'b', ';3|a');
    })
    assertThrows('', "ui512 a expected 'a' but got 'b'.\nc1 (;4)", () => {
        checkThrowEq512('a', 'b', ';4|a', 'c1');
    })
    assertThrows('', "ui512 a expected 'a' but got 'b'.\nc1, c2 (;5)", () => {
        checkThrowEq512('a', 'b', ';5|a', 'c1', 'c2');
    })
    assertThrows('', "vpc a (;6)", () => {
        checkThrow(false, ';6|a');
    })
    assertThrows('', "vpc a\nb (;7)", () => {
        checkThrow(false, ';7|a', 'b');
    })
    assertThrows('', "vpc a\nb, c (;8)", () => {
        checkThrow(false, ';8|a', 'b', 'c');
    })
    assertThrows('', "vpc a expected 'a' but got 'b'. (;9)", () => {
        checkThrowEq('a', 'b', ';9|a');
    })
    assertThrows('', "vpc a expected 'a' but got 'b'.\nc1 (;a)", () => {
        checkThrowEq('a', 'b', ';a|a', 'c1');
    })
    assertThrows('', "vpc a expected 'a' but got 'b'.\nc1, c2 (;b)", () => {
        checkThrowEq('a', 'b', ';b|a', 'c1', 'c2');
    })
    assertThrows('', "vpcinternal a (;c)", () => {
        checkThrowInternal(false, ';c|a');
    })
    assertThrows('', "vpcinternal a\nb (;d)", () => {
        checkThrowInternal(false, ';d|a', 'b');
    })
    assertThrows('', "vpcinternal a\nb, c (;e)", () => {
        checkThrowInternal(false, ';e|a', 'b', 'c');
    })
    assertThrows('', "vpcmessage a (;f)", () => {
        checkThrowNotifyMessage(false, ';f|a');
    })
    assertThrows('', "vpcmessage a\nb (;g)", () => {
        checkThrowNotifyMessage(false, ';g|a', 'b');
    })
    assertThrows('', "vpcmessage a\nb, c (;h)", () => {
        checkThrowNotifyMessage(false, ';h|a', 'b', 'c');
    })
});
t.test('ThrowIfUndefined', () => {
    t.say(/*——————————*/ 'Truthy Should Not Throw');
    let n1 = ensureDefined(1, 'Cq|should not throw');
    assertEq(1, n1, 'Cp|');

    let s1 = ensureDefined('abc', 'Co|should not throw');
    assertEq('abc', s1, 'Cn|');

    let b1 = ensureDefined(true, 'Cm|should not throw');
    assertEq(b1, true, 'Cl|');

    t.say(/*——————————*/ 'Falsy Should Not Throw');
    let n0 = ensureDefined(0, 'Ck|should not throw');
    assertEq(0, n0, 'Cj|');

    let s0 = ensureDefined('', 'Ci|should not throw');
    assertEq('', s0, 'Ch|');

    let b0 = ensureDefined(false, 'Cg|should not throw');
    assertEq(false, b0, 'Cf|');

    t.say(/*——————————*/ 'NullAndUndefinedShouldThrow');
    assertThrows('K`|', 'mymessage, s1, s2', () => {
        ensureDefined(null, 'Ce|mymessage', 's1', 's2');
    });
    assertThrows('K_|', 'mymessage, s1, s2', () => {
        ensureDefined(undefined, 'Cd|mymessage', 's1', 's2');
    });
});
t.test('JoinIntoMessage', () => {
    t.say(/*——————————*/ 'WithoutMarks');
    let got = joinIntoMessage('without|marks', 'prefix:');
    assertEq('prefix: without|marks', got, 'Cc|');

    t.say(/*——————————*/ 'ShouldMoveMarksToTheEnd');
    got = joinIntoMessage('ab|', 'prefix:', 'c', 'd', 'e');
    assertEq('prefix: \nc, d, e (ab)', got, 'Cb|');
    got = joinIntoMessage('ab|the message', 'prefix:');
    assertEq('prefix: the message (ab)', got, 'Ca|');
    got = joinIntoMessage('the message', 'prefix:', 'ab|c');
    assertEq('prefix: the message\nc (ab)', got, 'CZ|');
});
t.test('CompressString', () => {
    assertEq('\u2020 ', UI512Compress.compressString(''), 'CY|');
    assertEq('\u10E8 ', UI512Compress.compressString('a'), 'CX|');
    assertEq(
        '\u10E6\u4866\u4AEA  ',
        UI512Compress.compressString('aaaaaaaabbbbbbbb'),
        'CW|'
    );
    assertEq(
        '\u10E6\u4866\u4AE8\u31B0 ',
        UI512Compress.compressString('aaaaaaaabbbbbbbbc'),
        'CV|'
    );
    assertEq(
        '\u10E6\u7070\u0256\u4CF0 ',
        UI512Compress.compressString('aaaaaaa\nbbbbbbbbb'),
        'CU|'
    );
});
t.test('DecompressString', () => {
    assertEq('', UI512Compress.decompressString('\u2020 '), 'CT|');
    assertEq('a', UI512Compress.decompressString('\u10E8 '), 'CS|');
    assertEq(
        'aaaaaaaabbbbbbbb',
        UI512Compress.decompressString('\u10E6\u4866\u4AEA  '),
        'CR|'
    );
    assertEq(
        'aaaaaaaabbbbbbbbc',
        UI512Compress.decompressString('\u10E6\u4866\u4AE8\u31B0 '),
        'CQ|'
    );
    assertEq(
        'aaaaaaa\nbbbbbbbbb',
        UI512Compress.decompressString('\u10E6\u7070\u0256\u4CF0 '),
        'CP|'
    );
});
t.test('RingBufferSizeRemainsConstant', () => {
    let buf = new RingBufferArray(4);
    buf.append('a');
    buf.append('b');
    buf.append('c');
    buf.append('d');
    buf.append('e');
    buf.append('f');
    assertEq(['f'], buf.retrieve(1), 'CO|');
    assertEq(['f', 'e'], buf.retrieve(2), 'CN|');
    assertEq(['f', 'e', 'd'], buf.retrieve(3), 'CM|');
    assertEq('d', buf.getAt(0), 'CL|');
    assertEq('e', buf.getAt(1), 'CK|');
    assertEq('f', buf.getAt(2), 'CJ|');
    assertEq('c', buf.getAt(3), 'CI|');
    assertEq('', buf.getAt(5), 'CH|');
});
t.test('RingBuffer.CorrectlyWrapsAroundWhenNegative', () => {
    let buf = new RingBufferArray(4);
    assertEq(['', ''], buf.retrieve(2), 'CG|');
    buf.append('a');
    assertEq(['a', ''], buf.retrieve(2), 'CF|');
    buf.append('b');
    assertEq(['b', 'a'], buf.retrieve(2), 'CE|');
    buf.append('c');
    assertEq(['c', 'b'], buf.retrieve(2), 'CD|');
    buf.append('d');
    assertEq(['d', 'c'], buf.retrieve(2), 'CC|');
    buf.append('e');
    assertEq(['e', 'd'], buf.retrieve(2), 'CB|');
    buf.append('f');
    assertEq(['f', 'e'], buf.retrieve(2), 'CA|');
    buf.append('g');
    assertEq(['g', 'f'], buf.retrieve(2), 'C9|');
});
t.test('built-in includes', () => {
    t.say(/*——————————*/ 'typical usage');
    assertTrue('a test string'.includes('e'), 'Nh|');
    assertTrue('a test string'.includes('test'), 'Ng|');
    assertTrue('a test string'.includes('a test'), 'Nf|');
    assertTrue('a test string'.includes('a test string'), 'Ne|');
    assertTrue(!'a test string'.includes('a test string '), 'Nd|');
    assertTrue(!'a test string'.includes('x'), 'Nc|');
    t.say(/*——————————*/ 'edge cases');
    assertTrue('test'.includes('test'), 'Nb|');
    assertTrue('test'.includes(''), 'Na|');
    assertTrue(!''.includes('test'), 'NZ|');
    assertTrue(''.includes(''), 'NY|');
});
t.test('unknownToString', () => {
    class CustomToString {
        public toString() {
            return 'abc';
        }
    }

    let a: unknown = new CustomToString();
    let b: unknown = 'a string';
    let c: unknown = 123;
    let d: unknown = undefined;
    let e: unknown = null;
    let f: unknown = false;
    assertEq('abc', tostring(a), 'NX|');
    assertEq('a string', tostring(b), 'NW|');
    assertEq('123', tostring(c), 'NV|');
    assertEq('undefined', tostring(d), 'NU|');
    assertEq('null', tostring(e), 'NT|');
    assertEq('false', tostring(f), 'NS|');
});

/**
 * implementation of RingBuffer backed by a simple array
 */
class RingBufferArray extends RingBuffer {
    arr: string[] = [];
    ptrLatest = 0;
    getAt(index: number): string {
        return this.arr[index] ?? '';
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
