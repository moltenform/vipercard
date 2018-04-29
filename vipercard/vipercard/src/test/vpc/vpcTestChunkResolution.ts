
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { VpcChunkPreposition, VpcChunkType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcVal, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcChunkResolution.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { ReadableContainerVar, WritableContainerVar } from '../../vpc/vel/velResolveContainer.js';

/**
 * tests on chunk resolution
 */
let mTests: (string | Function)[] = [
    'testChunkGetChar',
    () => {
        testGetChunk('', 'abc', VpcChunkType.Chars, 0, undefined);
        testGetChunk('a', 'abc', VpcChunkType.Chars, 1, undefined);
        testGetChunk('b', 'abc', VpcChunkType.Chars, 2, undefined);
        testGetChunk('', 'abc', VpcChunkType.Chars, 4, undefined);
        testGetChunk('', 'abc', VpcChunkType.Chars, 5, undefined);
        testGetChunk('', 'abc', VpcChunkType.Chars, 0, 0);
        testGetChunk('', 'abc', VpcChunkType.Chars, 0, 2);
        testGetChunk('', 'abc', VpcChunkType.Chars, 0, 4);
        testGetChunk('', 'abc', VpcChunkType.Chars, 0, 5);
        testGetChunk('', 'abc', VpcChunkType.Chars, 1, 0);
        testGetChunk('a', 'abc', VpcChunkType.Chars, 1, 1);
        testGetChunk('ab', 'abc', VpcChunkType.Chars, 1, 2);
        testGetChunk('abc', 'abc', VpcChunkType.Chars, 1, 3);
        testGetChunk('abc', 'abc', VpcChunkType.Chars, 1, 4);
        testGetChunk('abc', 'abc', VpcChunkType.Chars, 1, 5);
        testGetChunk('', 'abc', VpcChunkType.Chars, 2, 1);
        testGetChunk('b', 'abc', VpcChunkType.Chars, 2, 2);
        testGetChunk('bc', 'abc', VpcChunkType.Chars, 2, 3);
        testGetChunk('bc', 'abc', VpcChunkType.Chars, 2, 4);
        testGetChunk('bc', 'abc', VpcChunkType.Chars, 2, 5);
        testGetChunk('', 'abc', VpcChunkType.Chars, 3, 1);
        testGetChunk('c', 'abc', VpcChunkType.Chars, 3, 3);
        testGetChunk('c', 'abc', VpcChunkType.Chars, 3, 5);
        testGetChunk('', 'abc', VpcChunkType.Chars, 4, 4);
        testGetChunk('', 'abc', VpcChunkType.Chars, 4, 5);
        testGetChunk('', 'abc', VpcChunkType.Chars, 4, 6);
        testGetChunk('', 'abc', VpcChunkType.Chars, 5, 5);
    },
    'testChunkGetItem1',
    () => {
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 0, undefined);
        testGetChunk('a', 'a,b,c', VpcChunkType.Items, 1, undefined);
        testGetChunk('b', 'a,b,c', VpcChunkType.Items, 2, undefined);
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 4, undefined);
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 5, undefined);
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 0, 0);
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 0, 2);
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 0, 4);
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 0, 5);
        testGetChunk('a', 'a,b,c', VpcChunkType.Items, 1, 0);
        testGetChunk('a', 'a,b,c', VpcChunkType.Items, 1, 1);
        testGetChunk('a,b', 'a,b,c', VpcChunkType.Items, 1, 2);
        testGetChunk('a,b,c', 'a,b,c', VpcChunkType.Items, 1, 3);
        testGetChunk('a,b,c', 'a,b,c', VpcChunkType.Items, 1, 4);
        testGetChunk('a,b,c', 'a,b,c', VpcChunkType.Items, 1, 5);
        testGetChunk('b', 'a,b,c', VpcChunkType.Items, 2, 1);
        testGetChunk('b', 'a,b,c', VpcChunkType.Items, 2, 2);
        testGetChunk('b,c', 'a,b,c', VpcChunkType.Items, 2, 3);
        testGetChunk('b,c', 'a,b,c', VpcChunkType.Items, 2, 4);
        testGetChunk('b,c', 'a,b,c', VpcChunkType.Items, 2, 5);
        testGetChunk('c', 'a,b,c', VpcChunkType.Items, 3, 1);
        testGetChunk('c', 'a,b,c', VpcChunkType.Items, 3, 3);
        testGetChunk('c', 'a,b,c', VpcChunkType.Items, 3, 5);
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 4, 4);
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 4, 5);
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 4, 6);
        testGetChunk('', 'a,b,c', VpcChunkType.Items, 5, 5);
    },
    'testChunkGetItem2',
    () => {
        testGetChunk('', ',,cd,', VpcChunkType.Items, 0, undefined);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 1, undefined);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 2, undefined);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 4, undefined);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 5, undefined);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 0, 0);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 0, 2);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 0, 4);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 0, 5);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 1, 0);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 1, 1);
        testGetChunk(',', ',,cd,', VpcChunkType.Items, 1, 2);
        testGetChunk(',,cd', ',,cd,', VpcChunkType.Items, 1, 3);
        testGetChunk(',,cd,', ',,cd,', VpcChunkType.Items, 1, 4);
        testGetChunk(',,cd,', ',,cd,', VpcChunkType.Items, 1, 5);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 2, 1);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 2, 2);
        testGetChunk(',cd', ',,cd,', VpcChunkType.Items, 2, 3);
        testGetChunk(',cd,', ',,cd,', VpcChunkType.Items, 2, 4);
        testGetChunk(',cd,', ',,cd,', VpcChunkType.Items, 2, 5);
        testGetChunk('cd', ',,cd,', VpcChunkType.Items, 3, 1);
        testGetChunk('cd', ',,cd,', VpcChunkType.Items, 3, 3);
        testGetChunk('cd,', ',,cd,', VpcChunkType.Items, 3, 5);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 4, 4);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 4, 5);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 4, 6);
        testGetChunk('', ',,cd,', VpcChunkType.Items, 5, 5);
    },
    'testChunkGetWord1',
    () => {
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 0, undefined);
        testGetChunk('abc', '  abc  .def gh.i   ', VpcChunkType.Words, 1, undefined);
        testGetChunk('.def', '  abc  .def gh.i   ', VpcChunkType.Words, 2, undefined);
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 4, undefined);
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 5, undefined);
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 0);
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 2);
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 4);
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 5);
        testGetChunk('abc', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 0);
        testGetChunk('abc', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 1);
        testGetChunk('abc  .def', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 2);
        testGetChunk('abc  .def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 3);
        testGetChunk('abc  .def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 4);
        testGetChunk('abc  .def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 5);
        testGetChunk('.def', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 1);
        testGetChunk('.def', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 2);
        testGetChunk('.def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 3);
        testGetChunk('.def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 4);
        testGetChunk('.def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 5);
        testGetChunk('gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 1);
        testGetChunk('gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 3);
        testGetChunk('gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 5);
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 4);
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 5);
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 6);
        testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 5, 5);
    },
    'testChunkGetWord2',
    () => {
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 0, undefined);
        testGetChunk('ABC', 'ABC   DEF  GHI', VpcChunkType.Words, 1, undefined);
        testGetChunk('DEF', 'ABC   DEF  GHI', VpcChunkType.Words, 2, undefined);
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 4, undefined);
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 5, undefined);
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 0);
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 2);
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 4);
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 5);
        testGetChunk('ABC', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 0);
        testGetChunk('ABC', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 1);
        testGetChunk('ABC   DEF', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 2);
        testGetChunk('ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 3);
        testGetChunk('ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 4);
        testGetChunk('ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 5);
        testGetChunk('DEF', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 1);
        testGetChunk('DEF', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 2);
        testGetChunk('DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 3);
        testGetChunk('DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 4);
        testGetChunk('DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 5);
        testGetChunk('GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 1);
        testGetChunk('GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 3);
        testGetChunk('GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 5);
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 4);
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 5);
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 6);
        testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 5, 5);
    },
    'testChunkSetChar',
    () => {
        testSetChunk('123abc', 'abc', VpcChunkType.Chars, 0, undefined);
        testSetChunk('123bc', 'abc', VpcChunkType.Chars, 1, undefined);
        testSetChunk('a123c', 'abc', VpcChunkType.Chars, 2, undefined);
        testSetChunk('abc123', 'abc', VpcChunkType.Chars, 4, undefined);
        testSetChunk('abc123', 'abc', VpcChunkType.Chars, 5, undefined);
        testSetChunk('123abc', 'abc', VpcChunkType.Chars, 0, 0);
        testSetChunk('123abc', 'abc', VpcChunkType.Chars, 0, 2);
        testSetChunk('123abc', 'abc', VpcChunkType.Chars, 0, 4);
        testSetChunk('123abc', 'abc', VpcChunkType.Chars, 0, 5);
        testSetChunk('123abc', 'abc', VpcChunkType.Chars, 1, 0);
        testSetChunk('123bc', 'abc', VpcChunkType.Chars, 1, 1);
        testSetChunk('123c', 'abc', VpcChunkType.Chars, 1, 2);
        testSetChunk('123', 'abc', VpcChunkType.Chars, 1, 3);
        testSetChunk('123', 'abc', VpcChunkType.Chars, 1, 4);
        testSetChunk('123', 'abc', VpcChunkType.Chars, 1, 5);
        testSetChunk('a123bc', 'abc', VpcChunkType.Chars, 2, 1);
        testSetChunk('a123c', 'abc', VpcChunkType.Chars, 2, 2);
        testSetChunk('a123', 'abc', VpcChunkType.Chars, 2, 3);
        testSetChunk('a123', 'abc', VpcChunkType.Chars, 2, 4);
        testSetChunk('a123', 'abc', VpcChunkType.Chars, 2, 5);
        testSetChunk('ab123c', 'abc', VpcChunkType.Chars, 3, 1);
        testSetChunk('ab123', 'abc', VpcChunkType.Chars, 3, 3);
        testSetChunk('ab123', 'abc', VpcChunkType.Chars, 3, 5);
        testSetChunk('abc123', 'abc', VpcChunkType.Chars, 4, 4);
        testSetChunk('abc123', 'abc', VpcChunkType.Chars, 4, 5);
        testSetChunk('abc123', 'abc', VpcChunkType.Chars, 4, 6);
        testSetChunk('abc123', 'abc', VpcChunkType.Chars, 5, 5);
    },
    'testChunkSetItem1',
    () => {
        testSetChunk('123a,b,c', 'a,b,c', VpcChunkType.Items, 0, undefined);
        testSetChunk('123,b,c', 'a,b,c', VpcChunkType.Items, 1, undefined);
        testSetChunk('a,123,c', 'a,b,c', VpcChunkType.Items, 2, undefined);
        testSetChunk('a,b,c,123', 'a,b,c', VpcChunkType.Items, 4, undefined);
        testSetChunk('a,b,c,,123', 'a,b,c', VpcChunkType.Items, 5, undefined);
        testSetChunk('123a,b,c', 'a,b,c', VpcChunkType.Items, 0, 0);
        testSetChunk('123a,b,c', 'a,b,c', VpcChunkType.Items, 0, 2);
        testSetChunk('123a,b,c', 'a,b,c', VpcChunkType.Items, 0, 4);
        testSetChunk('123a,b,c', 'a,b,c', VpcChunkType.Items, 0, 5);
        testSetChunk('123,b,c', 'a,b,c', VpcChunkType.Items, 1, 0);
        testSetChunk('123,b,c', 'a,b,c', VpcChunkType.Items, 1, 1);
        testSetChunk('123,c', 'a,b,c', VpcChunkType.Items, 1, 2);
        testSetChunk('123', 'a,b,c', VpcChunkType.Items, 1, 3);
        testSetChunk('123', 'a,b,c', VpcChunkType.Items, 1, 4);
        testSetChunk('123', 'a,b,c', VpcChunkType.Items, 1, 5);
        testSetChunk('a,123,c', 'a,b,c', VpcChunkType.Items, 2, 1);
        testSetChunk('a,123,c', 'a,b,c', VpcChunkType.Items, 2, 2);
        testSetChunk('a,123', 'a,b,c', VpcChunkType.Items, 2, 3);
        testSetChunk('a,123', 'a,b,c', VpcChunkType.Items, 2, 4);
        testSetChunk('a,123', 'a,b,c', VpcChunkType.Items, 2, 5);
        testSetChunk('a,b,123', 'a,b,c', VpcChunkType.Items, 3, 1);
        testSetChunk('a,b,123', 'a,b,c', VpcChunkType.Items, 3, 3);
        testSetChunk('a,b,123', 'a,b,c', VpcChunkType.Items, 3, 5);
        testSetChunk('a,b,c,123', 'a,b,c', VpcChunkType.Items, 4, 4);
        testSetChunk('a,b,c,123', 'a,b,c', VpcChunkType.Items, 4, 5);
        testSetChunk('a,b,c,123', 'a,b,c', VpcChunkType.Items, 4, 6);
        testSetChunk('a,b,c,,123', 'a,b,c', VpcChunkType.Items, 5, 5);
    },
    'testChunkSetItem2',
    () => {
        testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 0, undefined);
        testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 1, undefined);
        testSetChunk(',123,cd,', ',,cd,', VpcChunkType.Items, 2, undefined);
        testSetChunk(',,cd,123', ',,cd,', VpcChunkType.Items, 4, undefined);
        testSetChunk(',,cd,,123', ',,cd,', VpcChunkType.Items, 5, undefined);
        testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 0, 0);
        testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 0, 2);
        testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 0, 4);
        testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 0, 5);
        testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 1, 0);
        testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 1, 1);
        testSetChunk('123,cd,', ',,cd,', VpcChunkType.Items, 1, 2);
        testSetChunk('123,', ',,cd,', VpcChunkType.Items, 1, 3);
        testSetChunk('123', ',,cd,', VpcChunkType.Items, 1, 4);
        testSetChunk('123', ',,cd,', VpcChunkType.Items, 1, 5);
        testSetChunk(',123,cd,', ',,cd,', VpcChunkType.Items, 2, 1);
        testSetChunk(',123,cd,', ',,cd,', VpcChunkType.Items, 2, 2);
        testSetChunk(',123,', ',,cd,', VpcChunkType.Items, 2, 3);
        testSetChunk(',123', ',,cd,', VpcChunkType.Items, 2, 4);
        testSetChunk(',123', ',,cd,', VpcChunkType.Items, 2, 5);
        testSetChunk(',,123,', ',,cd,', VpcChunkType.Items, 3, 1);
        testSetChunk(',,123,', ',,cd,', VpcChunkType.Items, 3, 3);
        testSetChunk(',,123', ',,cd,', VpcChunkType.Items, 3, 5);
        testSetChunk(',,cd,123', ',,cd,', VpcChunkType.Items, 4, 4);
        testSetChunk(',,cd,123', ',,cd,', VpcChunkType.Items, 4, 5);
        testSetChunk(',,cd,123', ',,cd,', VpcChunkType.Items, 4, 6);
        testSetChunk(',,cd,,123', ',,cd,', VpcChunkType.Items, 5, 5);
    },
    'testChunkSetWord1',
    () => {
        testSetChunk('123  abc  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 0, undefined);
        testSetChunk('  123  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, undefined);
        testSetChunk('  abc  123 gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, undefined);
        testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 4, undefined);
        testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 5, undefined);
        testSetChunk('123  abc  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 0);
        testSetChunk('123  abc  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 2);
        testSetChunk('123  abc  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 4);
        testSetChunk('123  abc  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 5);
        testSetChunk('  123  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 0);
        testSetChunk('  123  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 1);
        testSetChunk('  123 gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 2);
        testSetChunk('  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 3);
        testSetChunk('  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 4);
        testSetChunk('  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 5);
        testSetChunk('  abc  123 gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 1);
        testSetChunk('  abc  123 gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 2);
        testSetChunk('  abc  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 3);
        testSetChunk('  abc  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 4);
        testSetChunk('  abc  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 5);
        testSetChunk('  abc  .def 123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 1);
        testSetChunk('  abc  .def 123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 3);
        testSetChunk('  abc  .def 123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 5);
        testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 4);
        testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 5);
        testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 6);
        testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 5, 5);
    },
    'testChunkSetWord2',
    () => {
        testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 0, undefined);
        testSetChunk('123   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, undefined);
        testSetChunk('ABC   123  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, undefined);
        testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 4, undefined);
        testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 5, undefined);
        testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 0);
        testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 2);
        testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 4);
        testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 5);
        testSetChunk('123   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 0);
        testSetChunk('123   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 1);
        testSetChunk('123  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 2);
        testSetChunk('123', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 3);
        testSetChunk('123', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 4);
        testSetChunk('123', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 5);
        testSetChunk('ABC   123  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 1);
        testSetChunk('ABC   123  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 2);
        testSetChunk('ABC   123', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 3);
        testSetChunk('ABC   123', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 4);
        testSetChunk('ABC   123', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 5);
        testSetChunk('ABC   DEF  123', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 1);
        testSetChunk('ABC   DEF  123', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 3);
        testSetChunk('ABC   DEF  123', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 5);
        testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 4);
        testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 5);
        testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 6);
        testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 5, 5);
    },
    'test_cornercases',
    () => {
        testGetChunk('', '', VpcChunkType.Chars, 0, 0);
        testGetChunk('', '', VpcChunkType.Chars, 0, 2);
        testGetChunk('', '', VpcChunkType.Chars, 1, 1);
        testGetChunk('', '', VpcChunkType.Chars, 1, 3);
        testGetChunk('', '', VpcChunkType.Items, 0, 0);
        testGetChunk('', '', VpcChunkType.Items, 0, 2);
        testGetChunk('', '', VpcChunkType.Items, 1, 1);
        testGetChunk('', '', VpcChunkType.Items, 1, 3);
        testGetChunk('', '', VpcChunkType.Words, 0, 0);
        testGetChunk('', '', VpcChunkType.Words, 0, 2);
        testGetChunk('', '', VpcChunkType.Words, 1, 1);
        testGetChunk('', '', VpcChunkType.Words, 1, 3);
        testSetChunk('123', '', VpcChunkType.Chars, 0, 0);
        testSetChunk('123', '', VpcChunkType.Chars, 0, 2);
        testSetChunk('123', '', VpcChunkType.Chars, 1, 1);
        testSetChunk('123', '', VpcChunkType.Chars, 1, 3);
        testSetChunk('123', '', VpcChunkType.Chars, 5, 5);
        testSetChunk('123', '', VpcChunkType.Chars, 5, 7);
        testSetChunk('123', '', VpcChunkType.Items, 0, 0);
        testSetChunk('123', '', VpcChunkType.Items, 0, 2);
        testSetChunk('123', '', VpcChunkType.Items, 1, 1);
        testSetChunk('123', '', VpcChunkType.Items, 1, 3);
        testSetChunk(',,,,123', '', VpcChunkType.Items, 5, 5);
        testSetChunk(',,,,123', '', VpcChunkType.Items, 5, 7);
        testSetChunk('123', '', VpcChunkType.Words, 0, 0);
        testSetChunk('123', '', VpcChunkType.Words, 0, 2);
        testSetChunk('123', '', VpcChunkType.Words, 1, 1);
        testSetChunk('123', '', VpcChunkType.Words, 1, 3);
        testSetChunk('123', '', VpcChunkType.Words, 5, 5);
        testSetChunk('123', '', VpcChunkType.Words, 5, 7);
        testSetChunk('abc123', 'abc', VpcChunkType.Chars, 5, 7);
        testSetChunk('a,b,c,,123', 'a,b,c', VpcChunkType.Items, 5, 7);
        testSetChunk(',,cd,,123', ',,cd,', VpcChunkType.Items, 5, 7);
    }
];

/**
 * exported test class for mTests
 */
export class TestVpcChunkResolution extends UI512TestBase {
    tests = mTests;
}

/**
 * assert that sExpected === get {VpcChunkType} {first} to {last} of s
 */
function testGetChunk(sExpected: string, s: string, type: VpcChunkType, first: number, last: number | undefined) {
    const itemDel = ',';
    let world = new MockOutsideWorld();
    let reader = new ReadableContainerVar(world.getMock(), 'varName');
    world.result = s;
    let ch = new RequestedChunk(first);
    ch.last = last;
    ch.type = type;
    let got = ChunkResolution.applyRead(reader, ch, itemDel);
    assertEq(s, world.result, '2l|');
    assertEq(sExpected, got, '2k|');
}

/**
 * assert that sExpected === set {VpcChunkType} {first} to {last} of s to "123"
 */
function testSetChunk(sExpected: string, s: string, type: VpcChunkType, first: number, last: number | undefined) {
    const itemDel = ',';
    let world = new MockOutsideWorld();
    let writer = new WritableContainerVar(world.getMock(), 'varName');
    world.result = s;
    const sReplace = '123';
    let ch = new RequestedChunk(first);
    ch.last = last;
    ch.type = type;
    ChunkResolution.applyPut(writer, ch, itemDel, sReplace, VpcChunkPreposition.Into);
    assertEq(sExpected, world.result, '2j|');
}

/**
 * provide stub implementation of OutsideWorldReadWrite
 */
export class MockOutsideWorld {
    result = '_';
    SetVarContents(varName: string, v: VpcVal) {
        assertEq('varName', varName, '');
        this.result = v.readAsString();
    }

    ReadVarContents(varName: string): VpcVal {
        assertEq('varName', varName, '');
        return VpcValS(this.result);
    }

    getMock(): OutsideWorldReadWrite {
        return (this as any) as OutsideWorldReadWrite; /* test code */
    }
}
