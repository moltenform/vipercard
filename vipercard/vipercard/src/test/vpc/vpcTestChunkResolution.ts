
/* auto */ import { VpcVal, VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { VpcChunkPreposition, VpcGranularity } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { ChunkResolution, RequestedChunk } from './../../vpc/vpcutils/vpcChunkResolution';
/* auto */ import { ReadableContainerVar, WritableContainerVar } from './../../vpc/vel/velResolveContainer';
/* auto */ import { OutsideWorldReadWrite } from './../../vpc/vel/velOutsideInterfaces';
/* auto */ import { assertEq } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, assertAsserts } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * tests on chunk resolution
 */
let t = new SimpleUtil512TestCollection('testCollectionvpcChunkResolution');
export let testCollectionvpcChunkResolution = t;

t.test('ChunkGetChar', () => {
    testGetChunk('', 'abc', VpcGranularity.Chars, 0, undefined);
    testGetChunk('a', 'abc', VpcGranularity.Chars, 1, undefined);
    testGetChunk('b', 'abc', VpcGranularity.Chars, 2, undefined);
    testGetChunk('', 'abc', VpcGranularity.Chars, 4, undefined);
    testGetChunk('', 'abc', VpcGranularity.Chars, 5, undefined);
    testGetChunk('', 'abc', VpcGranularity.Chars, 0, 0);
    testGetChunk('', 'abc', VpcGranularity.Chars, 0, 2);
    testGetChunk('', 'abc', VpcGranularity.Chars, 0, 4);
    testGetChunk('', 'abc', VpcGranularity.Chars, 0, 5);
    testGetChunk('', 'abc', VpcGranularity.Chars, 1, 0);
    testGetChunk('a', 'abc', VpcGranularity.Chars, 1, 1);
    testGetChunk('ab', 'abc', VpcGranularity.Chars, 1, 2);
    testGetChunk('abc', 'abc', VpcGranularity.Chars, 1, 3);
    testGetChunk('abc', 'abc', VpcGranularity.Chars, 1, 4);
    testGetChunk('abc', 'abc', VpcGranularity.Chars, 1, 5);
    testGetChunk('', 'abc', VpcGranularity.Chars, 2, 1);
    testGetChunk('b', 'abc', VpcGranularity.Chars, 2, 2);
    testGetChunk('bc', 'abc', VpcGranularity.Chars, 2, 3);
    testGetChunk('bc', 'abc', VpcGranularity.Chars, 2, 4);
    testGetChunk('bc', 'abc', VpcGranularity.Chars, 2, 5);
    testGetChunk('', 'abc', VpcGranularity.Chars, 3, 1);
    testGetChunk('c', 'abc', VpcGranularity.Chars, 3, 3);
    testGetChunk('c', 'abc', VpcGranularity.Chars, 3, 5);
    testGetChunk('', 'abc', VpcGranularity.Chars, 4, 4);
    testGetChunk('', 'abc', VpcGranularity.Chars, 4, 5);
    testGetChunk('', 'abc', VpcGranularity.Chars, 4, 6);
    testGetChunk('', 'abc', VpcGranularity.Chars, 5, 5);
});
t.test('ChunkGetCharConfirmExpectedFailure', () => {
    testGetChunk('ab', 'abc', VpcGranularity.Chars, 1, 2);
    assertAsserts('', 'assert:', () => {
        testGetChunk('ac', 'abc', VpcGranularity.Chars, 1, 2);
    });
    assertAsserts('', 'assert:', () => {
        testGetChunk('abcd', 'abc', VpcGranularity.Chars, 1, 2);
    });
    testSetChunk('123', 'abc', VpcGranularity.Chars, 1, 3);
    assertAsserts('', 'assert:', () => {
        testSetChunk('124', 'abc', VpcGranularity.Chars, 1, 3);
    });
    assertAsserts('', 'assert:', () => {
        testSetChunk('1234', 'abc', VpcGranularity.Chars, 1, 3);
    });
});
t.test('ChunkGetItem1', () => {
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 0, undefined);
    testGetChunk('a', 'a,b,c', VpcGranularity.Items, 1, undefined);
    testGetChunk('b', 'a,b,c', VpcGranularity.Items, 2, undefined);
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 4, undefined);
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 5, undefined);
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 0, 0);
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 0, 2);
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 0, 4);
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 0, 5);
    testGetChunk('a', 'a,b,c', VpcGranularity.Items, 1, 0);
    testGetChunk('a', 'a,b,c', VpcGranularity.Items, 1, 1);
    testGetChunk('a,b', 'a,b,c', VpcGranularity.Items, 1, 2);
    testGetChunk('a,b,c', 'a,b,c', VpcGranularity.Items, 1, 3);
    testGetChunk('a,b,c', 'a,b,c', VpcGranularity.Items, 1, 4);
    testGetChunk('a,b,c', 'a,b,c', VpcGranularity.Items, 1, 5);
    testGetChunk('b', 'a,b,c', VpcGranularity.Items, 2, 1);
    testGetChunk('b', 'a,b,c', VpcGranularity.Items, 2, 2);
    testGetChunk('b,c', 'a,b,c', VpcGranularity.Items, 2, 3);
    testGetChunk('b,c', 'a,b,c', VpcGranularity.Items, 2, 4);
    testGetChunk('b,c', 'a,b,c', VpcGranularity.Items, 2, 5);
    testGetChunk('c', 'a,b,c', VpcGranularity.Items, 3, 1);
    testGetChunk('c', 'a,b,c', VpcGranularity.Items, 3, 3);
    testGetChunk('c', 'a,b,c', VpcGranularity.Items, 3, 5);
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 4, 4);
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 4, 5);
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 4, 6);
    testGetChunk('', 'a,b,c', VpcGranularity.Items, 5, 5);
});
t.test('ChunkGetItem2', () => {
    testGetChunk('', ',,cd,', VpcGranularity.Items, 0, undefined);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 1, undefined);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 2, undefined);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 4, undefined);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 5, undefined);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 0, 0);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 0, 2);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 0, 4);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 0, 5);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 1, 0);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 1, 1);
    testGetChunk(',', ',,cd,', VpcGranularity.Items, 1, 2);
    testGetChunk(',,cd', ',,cd,', VpcGranularity.Items, 1, 3);
    testGetChunk(',,cd,', ',,cd,', VpcGranularity.Items, 1, 4);
    testGetChunk(',,cd,', ',,cd,', VpcGranularity.Items, 1, 5);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 2, 1);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 2, 2);
    testGetChunk(',cd', ',,cd,', VpcGranularity.Items, 2, 3);
    testGetChunk(',cd,', ',,cd,', VpcGranularity.Items, 2, 4);
    testGetChunk(',cd,', ',,cd,', VpcGranularity.Items, 2, 5);
    testGetChunk('cd', ',,cd,', VpcGranularity.Items, 3, 1);
    testGetChunk('cd', ',,cd,', VpcGranularity.Items, 3, 3);
    testGetChunk('cd,', ',,cd,', VpcGranularity.Items, 3, 5);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 4, 4);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 4, 5);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 4, 6);
    testGetChunk('', ',,cd,', VpcGranularity.Items, 5, 5);
});
t.test('ChunkGetWord1', () => {
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 0, undefined);
    testGetChunk('abc', '  abc  .def gh.i   ', VpcGranularity.Words, 1, undefined);
    testGetChunk('.def', '  abc  .def gh.i   ', VpcGranularity.Words, 2, undefined);
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 4, undefined);
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 5, undefined);
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 0, 0);
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 0, 2);
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 0, 4);
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 0, 5);
    testGetChunk('abc', '  abc  .def gh.i   ', VpcGranularity.Words, 1, 0);
    testGetChunk('abc', '  abc  .def gh.i   ', VpcGranularity.Words, 1, 1);
    testGetChunk('abc  .def', '  abc  .def gh.i   ', VpcGranularity.Words, 1, 2);
    testGetChunk('abc  .def gh.i', '  abc  .def gh.i   ', VpcGranularity.Words, 1, 3);
    testGetChunk('abc  .def gh.i', '  abc  .def gh.i   ', VpcGranularity.Words, 1, 4);
    testGetChunk('abc  .def gh.i', '  abc  .def gh.i   ', VpcGranularity.Words, 1, 5);
    testGetChunk('.def', '  abc  .def gh.i   ', VpcGranularity.Words, 2, 1);
    testGetChunk('.def', '  abc  .def gh.i   ', VpcGranularity.Words, 2, 2);
    testGetChunk('.def gh.i', '  abc  .def gh.i   ', VpcGranularity.Words, 2, 3);
    testGetChunk('.def gh.i', '  abc  .def gh.i   ', VpcGranularity.Words, 2, 4);
    testGetChunk('.def gh.i', '  abc  .def gh.i   ', VpcGranularity.Words, 2, 5);
    testGetChunk('gh.i', '  abc  .def gh.i   ', VpcGranularity.Words, 3, 1);
    testGetChunk('gh.i', '  abc  .def gh.i   ', VpcGranularity.Words, 3, 3);
    testGetChunk('gh.i', '  abc  .def gh.i   ', VpcGranularity.Words, 3, 5);
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 4, 4);
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 4, 5);
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 4, 6);
    testGetChunk('', '  abc  .def gh.i   ', VpcGranularity.Words, 5, 5);
});
t.test('ChunkGetWord2', () => {
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 0, undefined);
    testGetChunk('ABC', 'ABC   DEF  GHI', VpcGranularity.Words, 1, undefined);
    testGetChunk('DEF', 'ABC   DEF  GHI', VpcGranularity.Words, 2, undefined);
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 4, undefined);
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 5, undefined);
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 0, 0);
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 0, 2);
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 0, 4);
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 0, 5);
    testGetChunk('ABC', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 0);
    testGetChunk('ABC', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 1);
    testGetChunk('ABC   DEF', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 2);
    testGetChunk('ABC   DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 3);
    testGetChunk('ABC   DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 4);
    testGetChunk('ABC   DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 5);
    testGetChunk('DEF', 'ABC   DEF  GHI', VpcGranularity.Words, 2, 1);
    testGetChunk('DEF', 'ABC   DEF  GHI', VpcGranularity.Words, 2, 2);
    testGetChunk('DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 2, 3);
    testGetChunk('DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 2, 4);
    testGetChunk('DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 2, 5);
    testGetChunk('GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 3, 1);
    testGetChunk('GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 3, 3);
    testGetChunk('GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 3, 5);
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 4, 4);
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 4, 5);
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 4, 6);
    testGetChunk('', 'ABC   DEF  GHI', VpcGranularity.Words, 5, 5);
});
t.test('ChunkSetChar', () => {
    testSetChunk('123abc', 'abc', VpcGranularity.Chars, 0, undefined);
    testSetChunk('123bc', 'abc', VpcGranularity.Chars, 1, undefined);
    testSetChunk('a123c', 'abc', VpcGranularity.Chars, 2, undefined);
    testSetChunk('abc123', 'abc', VpcGranularity.Chars, 4, undefined);
    testSetChunk('abc123', 'abc', VpcGranularity.Chars, 5, undefined);
    testSetChunk('123abc', 'abc', VpcGranularity.Chars, 0, 0);
    testSetChunk('123abc', 'abc', VpcGranularity.Chars, 0, 2);
    testSetChunk('123abc', 'abc', VpcGranularity.Chars, 0, 4);
    testSetChunk('123abc', 'abc', VpcGranularity.Chars, 0, 5);
    testSetChunk('123abc', 'abc', VpcGranularity.Chars, 1, 0);
    testSetChunk('123bc', 'abc', VpcGranularity.Chars, 1, 1);
    testSetChunk('123c', 'abc', VpcGranularity.Chars, 1, 2);
    testSetChunk('123', 'abc', VpcGranularity.Chars, 1, 3);
    testSetChunk('123', 'abc', VpcGranularity.Chars, 1, 4);
    testSetChunk('123', 'abc', VpcGranularity.Chars, 1, 5);
    testSetChunk('a123bc', 'abc', VpcGranularity.Chars, 2, 1);
    testSetChunk('a123c', 'abc', VpcGranularity.Chars, 2, 2);
    testSetChunk('a123', 'abc', VpcGranularity.Chars, 2, 3);
    testSetChunk('a123', 'abc', VpcGranularity.Chars, 2, 4);
    testSetChunk('a123', 'abc', VpcGranularity.Chars, 2, 5);
    testSetChunk('ab123c', 'abc', VpcGranularity.Chars, 3, 1);
    testSetChunk('ab123', 'abc', VpcGranularity.Chars, 3, 3);
    testSetChunk('ab123', 'abc', VpcGranularity.Chars, 3, 5);
    testSetChunk('abc123', 'abc', VpcGranularity.Chars, 4, 4);
    testSetChunk('abc123', 'abc', VpcGranularity.Chars, 4, 5);
    testSetChunk('abc123', 'abc', VpcGranularity.Chars, 4, 6);
    testSetChunk('abc123', 'abc', VpcGranularity.Chars, 5, 5);
});
t.test('ChunkSetItem1', () => {
    testSetChunk('123a,b,c', 'a,b,c', VpcGranularity.Items, 0, undefined);
    testSetChunk('123,b,c', 'a,b,c', VpcGranularity.Items, 1, undefined);
    testSetChunk('a,123,c', 'a,b,c', VpcGranularity.Items, 2, undefined);
    testSetChunk('a,b,c,123', 'a,b,c', VpcGranularity.Items, 4, undefined);
    testSetChunk('a,b,c,,123', 'a,b,c', VpcGranularity.Items, 5, undefined);
    testSetChunk('123a,b,c', 'a,b,c', VpcGranularity.Items, 0, 0);
    testSetChunk('123a,b,c', 'a,b,c', VpcGranularity.Items, 0, 2);
    testSetChunk('123a,b,c', 'a,b,c', VpcGranularity.Items, 0, 4);
    testSetChunk('123a,b,c', 'a,b,c', VpcGranularity.Items, 0, 5);
    testSetChunk('123,b,c', 'a,b,c', VpcGranularity.Items, 1, 0);
    testSetChunk('123,b,c', 'a,b,c', VpcGranularity.Items, 1, 1);
    testSetChunk('123,c', 'a,b,c', VpcGranularity.Items, 1, 2);
    testSetChunk('123', 'a,b,c', VpcGranularity.Items, 1, 3);
    testSetChunk('123', 'a,b,c', VpcGranularity.Items, 1, 4);
    testSetChunk('123', 'a,b,c', VpcGranularity.Items, 1, 5);
    testSetChunk('a,123,c', 'a,b,c', VpcGranularity.Items, 2, 1);
    testSetChunk('a,123,c', 'a,b,c', VpcGranularity.Items, 2, 2);
    testSetChunk('a,123', 'a,b,c', VpcGranularity.Items, 2, 3);
    testSetChunk('a,123', 'a,b,c', VpcGranularity.Items, 2, 4);
    testSetChunk('a,123', 'a,b,c', VpcGranularity.Items, 2, 5);
    testSetChunk('a,b,123', 'a,b,c', VpcGranularity.Items, 3, 1);
    testSetChunk('a,b,123', 'a,b,c', VpcGranularity.Items, 3, 3);
    testSetChunk('a,b,123', 'a,b,c', VpcGranularity.Items, 3, 5);
    testSetChunk('a,b,c,123', 'a,b,c', VpcGranularity.Items, 4, 4);
    testSetChunk('a,b,c,123', 'a,b,c', VpcGranularity.Items, 4, 5);
    testSetChunk('a,b,c,123', 'a,b,c', VpcGranularity.Items, 4, 6);
    testSetChunk('a,b,c,,123', 'a,b,c', VpcGranularity.Items, 5, 5);
});
t.test('ChunkSetItem2', () => {
    testSetChunk('123,,cd,', ',,cd,', VpcGranularity.Items, 0, undefined);
    testSetChunk('123,,cd,', ',,cd,', VpcGranularity.Items, 1, undefined);
    testSetChunk(',123,cd,', ',,cd,', VpcGranularity.Items, 2, undefined);
    testSetChunk(',,cd,123', ',,cd,', VpcGranularity.Items, 4, undefined);
    testSetChunk(',,cd,,123', ',,cd,', VpcGranularity.Items, 5, undefined);
    testSetChunk('123,,cd,', ',,cd,', VpcGranularity.Items, 0, 0);
    testSetChunk('123,,cd,', ',,cd,', VpcGranularity.Items, 0, 2);
    testSetChunk('123,,cd,', ',,cd,', VpcGranularity.Items, 0, 4);
    testSetChunk('123,,cd,', ',,cd,', VpcGranularity.Items, 0, 5);
    testSetChunk('123,,cd,', ',,cd,', VpcGranularity.Items, 1, 0);
    testSetChunk('123,,cd,', ',,cd,', VpcGranularity.Items, 1, 1);
    testSetChunk('123,cd,', ',,cd,', VpcGranularity.Items, 1, 2);
    testSetChunk('123,', ',,cd,', VpcGranularity.Items, 1, 3);
    testSetChunk('123', ',,cd,', VpcGranularity.Items, 1, 4);
    testSetChunk('123', ',,cd,', VpcGranularity.Items, 1, 5);
    testSetChunk(',123,cd,', ',,cd,', VpcGranularity.Items, 2, 1);
    testSetChunk(',123,cd,', ',,cd,', VpcGranularity.Items, 2, 2);
    testSetChunk(',123,', ',,cd,', VpcGranularity.Items, 2, 3);
    testSetChunk(',123', ',,cd,', VpcGranularity.Items, 2, 4);
    testSetChunk(',123', ',,cd,', VpcGranularity.Items, 2, 5);
    testSetChunk(',,123,', ',,cd,', VpcGranularity.Items, 3, 1);
    testSetChunk(',,123,', ',,cd,', VpcGranularity.Items, 3, 3);
    testSetChunk(',,123', ',,cd,', VpcGranularity.Items, 3, 5);
    testSetChunk(',,cd,123', ',,cd,', VpcGranularity.Items, 4, 4);
    testSetChunk(',,cd,123', ',,cd,', VpcGranularity.Items, 4, 5);
    testSetChunk(',,cd,123', ',,cd,', VpcGranularity.Items, 4, 6);
    testSetChunk(',,cd,,123', ',,cd,', VpcGranularity.Items, 5, 5);
});
t.test('ChunkSetWord1', () => {
    testSetChunk(
        '123  abc  .def gh.i   ',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        0,
        undefined
    );
    testSetChunk(
        '  123  .def gh.i   ',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        1,
        undefined
    );
    testSetChunk(
        '  abc  123 gh.i   ',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        2,
        undefined
    );
    testSetChunk(
        '  abc  .def gh.i   123',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        4,
        undefined
    );
    testSetChunk(
        '  abc  .def gh.i   123',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        5,
        undefined
    );
    testSetChunk(
        '123  abc  .def gh.i   ',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        0,
        0
    );
    testSetChunk(
        '123  abc  .def gh.i   ',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        0,
        2
    );
    testSetChunk(
        '123  abc  .def gh.i   ',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        0,
        4
    );
    testSetChunk(
        '123  abc  .def gh.i   ',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        0,
        5
    );
    testSetChunk(
        '  123  .def gh.i   ',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        1,
        0
    );
    testSetChunk(
        '  123  .def gh.i   ',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        1,
        1
    );
    testSetChunk('  123 gh.i   ', '  abc  .def gh.i   ', VpcGranularity.Words, 1, 2);
    testSetChunk('  123   ', '  abc  .def gh.i   ', VpcGranularity.Words, 1, 3);
    testSetChunk('  123   ', '  abc  .def gh.i   ', VpcGranularity.Words, 1, 4);
    testSetChunk('  123   ', '  abc  .def gh.i   ', VpcGranularity.Words, 1, 5);
    testSetChunk('  abc  123 gh.i   ', '  abc  .def gh.i   ', VpcGranularity.Words, 2, 1);
    testSetChunk('  abc  123 gh.i   ', '  abc  .def gh.i   ', VpcGranularity.Words, 2, 2);
    testSetChunk('  abc  123   ', '  abc  .def gh.i   ', VpcGranularity.Words, 2, 3);
    testSetChunk('  abc  123   ', '  abc  .def gh.i   ', VpcGranularity.Words, 2, 4);
    testSetChunk('  abc  123   ', '  abc  .def gh.i   ', VpcGranularity.Words, 2, 5);
    testSetChunk('  abc  .def 123   ', '  abc  .def gh.i   ', VpcGranularity.Words, 3, 1);
    testSetChunk('  abc  .def 123   ', '  abc  .def gh.i   ', VpcGranularity.Words, 3, 3);
    testSetChunk('  abc  .def 123   ', '  abc  .def gh.i   ', VpcGranularity.Words, 3, 5);
    testSetChunk(
        '  abc  .def gh.i   123',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        4,
        4
    );
    testSetChunk(
        '  abc  .def gh.i   123',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        4,
        5
    );
    testSetChunk(
        '  abc  .def gh.i   123',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        4,
        6
    );
    testSetChunk(
        '  abc  .def gh.i   123',
        '  abc  .def gh.i   ',
        VpcGranularity.Words,
        5,
        5
    );
});
t.test('ChunkSetWord2', () => {
    testSetChunk(
        '123ABC   DEF  GHI',
        'ABC   DEF  GHI',
        VpcGranularity.Words,
        0,
        undefined
    );
    testSetChunk('123   DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 1, undefined);
    testSetChunk('ABC   123  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 2, undefined);
    testSetChunk(
        'ABC   DEF  GHI123',
        'ABC   DEF  GHI',
        VpcGranularity.Words,
        4,
        undefined
    );
    testSetChunk(
        'ABC   DEF  GHI123',
        'ABC   DEF  GHI',
        VpcGranularity.Words,
        5,
        undefined
    );
    testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 0, 0);
    testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 0, 2);
    testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 0, 4);
    testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 0, 5);
    testSetChunk('123   DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 0);
    testSetChunk('123   DEF  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 1);
    testSetChunk('123  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 2);
    testSetChunk('123', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 3);
    testSetChunk('123', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 4);
    testSetChunk('123', 'ABC   DEF  GHI', VpcGranularity.Words, 1, 5);
    testSetChunk('ABC   123  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 2, 1);
    testSetChunk('ABC   123  GHI', 'ABC   DEF  GHI', VpcGranularity.Words, 2, 2);
    testSetChunk('ABC   123', 'ABC   DEF  GHI', VpcGranularity.Words, 2, 3);
    testSetChunk('ABC   123', 'ABC   DEF  GHI', VpcGranularity.Words, 2, 4);
    testSetChunk('ABC   123', 'ABC   DEF  GHI', VpcGranularity.Words, 2, 5);
    testSetChunk('ABC   DEF  123', 'ABC   DEF  GHI', VpcGranularity.Words, 3, 1);
    testSetChunk('ABC   DEF  123', 'ABC   DEF  GHI', VpcGranularity.Words, 3, 3);
    testSetChunk('ABC   DEF  123', 'ABC   DEF  GHI', VpcGranularity.Words, 3, 5);
    testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcGranularity.Words, 4, 4);
    testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcGranularity.Words, 4, 5);
    testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcGranularity.Words, 4, 6);
    testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcGranularity.Words, 5, 5);
});
t.test('cornercases', () => {
    testGetChunk('', '', VpcGranularity.Chars, 0, 0);
    testGetChunk('', '', VpcGranularity.Chars, 0, 2);
    testGetChunk('', '', VpcGranularity.Chars, 1, 1);
    testGetChunk('', '', VpcGranularity.Chars, 1, 3);
    testGetChunk('', '', VpcGranularity.Items, 0, 0);
    testGetChunk('', '', VpcGranularity.Items, 0, 2);
    testGetChunk('', '', VpcGranularity.Items, 1, 1);
    testGetChunk('', '', VpcGranularity.Items, 1, 3);
    testGetChunk('', '', VpcGranularity.Words, 0, 0);
    testGetChunk('', '', VpcGranularity.Words, 0, 2);
    testGetChunk('', '', VpcGranularity.Words, 1, 1);
    testGetChunk('', '', VpcGranularity.Words, 1, 3);
    testSetChunk('123', '', VpcGranularity.Chars, 0, 0);
    testSetChunk('123', '', VpcGranularity.Chars, 0, 2);
    testSetChunk('123', '', VpcGranularity.Chars, 1, 1);
    testSetChunk('123', '', VpcGranularity.Chars, 1, 3);
    testSetChunk('123', '', VpcGranularity.Chars, 5, 5);
    testSetChunk('123', '', VpcGranularity.Chars, 5, 7);
    testSetChunk('123', '', VpcGranularity.Items, 0, 0);
    testSetChunk('123', '', VpcGranularity.Items, 0, 2);
    testSetChunk('123', '', VpcGranularity.Items, 1, 1);
    testSetChunk('123', '', VpcGranularity.Items, 1, 3);
    testSetChunk(',,,,123', '', VpcGranularity.Items, 5, 5);
    testSetChunk(',,,,123', '', VpcGranularity.Items, 5, 7);
    testSetChunk('123', '', VpcGranularity.Words, 0, 0);
    testSetChunk('123', '', VpcGranularity.Words, 0, 2);
    testSetChunk('123', '', VpcGranularity.Words, 1, 1);
    testSetChunk('123', '', VpcGranularity.Words, 1, 3);
    testSetChunk('123', '', VpcGranularity.Words, 5, 5);
    testSetChunk('123', '', VpcGranularity.Words, 5, 7);
    testSetChunk('abc123', 'abc', VpcGranularity.Chars, 5, 7);
    testSetChunk('a,b,c,,123', 'a,b,c', VpcGranularity.Items, 5, 7);
    testSetChunk(',,cd,,123', ',,cd,', VpcGranularity.Items, 5, 7);
});

/**
 * assert that sExpected === get {VpcGranularity} {first} to {last} of s
 */
function testGetChunk(
    sExpected: string,
    s: string,
    type: VpcGranularity,
    first: number,
    last: number | undefined
) {
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
 * assert that sExpected === set {VpcGranularity} {first} to {last} of s to "123"
 */
function testSetChunk(
    sExpected: string,
    s: string,
    type: VpcGranularity,
    first: number,
    last: number | undefined
) {
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
        assertEq('varName', varName, 'F6|');
        this.result = v.readAsString();
    }

    ReadVarContents(varName: string): VpcVal {
        assertEq('varName', varName, 'F5|');
        return VpcValS(this.result);
    }

    getMock(): OutsideWorldReadWrite {
        return (this as any) as OutsideWorldReadWrite; /* test code */
    }
}
