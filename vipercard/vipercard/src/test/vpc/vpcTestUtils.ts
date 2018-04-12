
/* auto */ import { assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { VpcChunkPreposition, VpcChunkType, VpcOpCtg } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcVal, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { VpcEvalHelpers } from '../../vpc/vpcutils/vpcValEval.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcChunk.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/vpcOutsideInterfaces.js';
/* auto */ import { ReadableContainerVar, WritableContainerVar } from '../../vpc/vel/velResolveReference.js';

class MockWorld {
    result = '_';
    SetVarContents(varname: string, v: VpcVal) {
        this.result = v.readAsString();
    }

    ReadVarContents(varname: string): VpcVal {
        return VpcValS(this.result);
    }

    getMock(): OutsideWorldReadWrite {
        return (this as any) as OutsideWorldReadWrite; /* test code */
    }
}

export class TestVpcUtils extends UI512TestBase {
    readonly itemDel = ',';
    mockReadVar = new MockWorld();
    constructor() {
        super();
    }

    testGetChunk(sExpected: string, s: string, type: VpcChunkType, first: number, last: number | undefined) {
        let reader = new ReadableContainerVar(this.mockReadVar.getMock(), 'varname');
        this.mockReadVar.result = s;
        let ch = new RequestedChunk(first);
        ch.last = last;
        ch.type = type;
        let got = ChunkResolution.applyRead(reader, ch, this.itemDel);
        assertEq(s, this.mockReadVar.result, '2l|');
        assertEq(sExpected, got, '2k|');
    }

    testSetChunk(sExpected: string, s: string, type: VpcChunkType, first: number, last: number | undefined) {
        let writer = new WritableContainerVar(this.mockReadVar.getMock(), 'varname');
        this.mockReadVar.result = s;
        const itemDel = ',';
        const sReplace = '123';
        let ch = new RequestedChunk(first);
        ch.last = last;
        ch.type = type;
        ChunkResolution.applyPut(writer, ch, this.itemDel, sReplace, VpcChunkPreposition.into);
        assertEq(sExpected, this.mockReadVar.result, '2j|');
    }

    tests = [
        'test_evalOp',
        () => {
            // covering equality is the most important. oter ops covered elsewhere
            let h = new VpcEvalHelpers();
            let testEqualityS = (exp: boolean, inp1: string, inp2: string) => {
                let got = h.evalOp(VpcValS(inp1), VpcValS(inp2), VpcOpCtg.OpEqualityGreaterLessOrContains, '==');
                assertEq(exp.toString(), got.readAsString(), '2i|');

                // order should not matter
                got = h.evalOp(VpcValS(inp2), VpcValS(inp1), VpcOpCtg.OpEqualityGreaterLessOrContains, '==');
                assertEq(exp.toString(), got.readAsString(), '2h|');
            };

            // when doing string comparison, must be a strict match
            testEqualityS(true, '', '');
            testEqualityS(false, '', ' ');
            testEqualityS(true, ' ', ' ');
            testEqualityS(false, ' ', '\t');
            testEqualityS(false, ' ', '\n');
            testEqualityS(false, ' ', ' \t');
            testEqualityS(false, ' ', ' \n');
            testEqualityS(false, ' ', '  ');
            testEqualityS(false, '\n', '\n\n');
            testEqualityS(false, '\t', '\t\t');
            testEqualityS(true, 'abc', 'abc');
            testEqualityS(true, '123', '123');
            testEqualityS(true, '   ', '   ');
            testEqualityS(true, '\t', '\t');
            testEqualityS(true, '\r', '\r');
            testEqualityS(true, '\n', '\n');
            testEqualityS(false, 'abc', 'abc ');
            testEqualityS(true, 'abc ', 'abc ');
            testEqualityS(false, 'abc', ' abc');
            testEqualityS(true, ' abc', ' abc');
            testEqualityS(false, 'abc', 'abc\t');
            testEqualityS(true, 'abc\t', 'abc\t');
            testEqualityS(false, 'abc', '\tabc');
            testEqualityS(true, '\tabc', '\tabc');
            testEqualityS(false, 'abc', 'abc\n');
            testEqualityS(true, 'abc\n', 'abc\n');
            testEqualityS(false, 'abc', '\nabc');
            testEqualityS(true, '\nabc', '\nabc');
            testEqualityS(false, '12a', '12a ');
            testEqualityS(true, '12a ', '12a ');
            testEqualityS(false, '12a', ' 12a');
            testEqualityS(true, ' 12a', ' 12a');
            testEqualityS(false, '12a', '12a\t');
            testEqualityS(true, '12a\t', '12a\t');
            testEqualityS(false, '12a', '\t12a');
            testEqualityS(true, '\t12a', '\t12a');
            testEqualityS(false, '12a', '12a\n');
            testEqualityS(true, '12a\n', '12a\n');
            testEqualityS(false, '12a', '\n12a');
            testEqualityS(true, '\n12a', '\n12a');

            // when doing number comparison, allow trailing - and even preceding - whitespace
            testEqualityS(true, '12', '12 ');
            testEqualityS(true, '12 ', '12 ');
            testEqualityS(true, '12', ' 12');
            testEqualityS(true, '12', ' 12 ');
            testEqualityS(true, ' 12 ', ' 12 ');
            testEqualityS(true, '12', '12\t');
            testEqualityS(true, '12\t', '12\t');
            testEqualityS(true, '12', '\t12');
            testEqualityS(true, '12', ' 12\t');
            testEqualityS(true, '\t12\t', '\t12\t');
            testEqualityS(true, '12', '12\n');
            testEqualityS(true, '12\n', '12\n');
            testEqualityS(true, '12', '\n12');
            testEqualityS(true, '12', ' 12\n');
            testEqualityS(true, '\n12\n', '\n12\n');
            testEqualityS(true, '12.0', '12 ');
            testEqualityS(true, '12.0 ', '12 ');
            testEqualityS(true, '12.0', ' 12');
            testEqualityS(true, '12.0', ' 12 ');
            testEqualityS(true, ' 12.0 ', ' 12 ');
            testEqualityS(true, '12.0', '12\t');
            testEqualityS(true, '12.0\t', '12\t');
            testEqualityS(true, '12.0', '\t12');
            testEqualityS(true, '12.0', ' 12\t');
            testEqualityS(true, '\t12.0\t', '\t12\t');
            testEqualityS(true, '12.0', '12\n');
            testEqualityS(true, '12.0\n', '12\n');
            testEqualityS(true, '12.0', '\n12');
            testEqualityS(true, '12.0', ' 12\n');
            testEqualityS(true, '\n12.0\n', '\n12\n');

            // special numeric cases
            testEqualityS(true, '\n12', '\t12\t');
            testEqualityS(true, '   12', '\n\n12\n\n');
            testEqualityS(true, '12', '12.');
            testEqualityS(true, '12.', '12.');
            testEqualityS(true, '12', '12.0');
            testEqualityS(true, '12', '12.0000000');
            testEqualityS(true, '12', '012');
            testEqualityS(true, '12', '0000012');
            testEqualityS(true, '12', '0000012.0000');
            testEqualityS(true, '-12', '-0000012.0000');
            testEqualityS(true, '-012', '-12');
            testEqualityS(true, '-12 ', '-12');
            testEqualityS(true, '12.000', '00012');
            testEqualityS(false, '12', '12,0');
            testEqualityS(false, '12,000', '00012,0');

            // numeric comparison
            // confirmed in emulator -- very close numbers compare equal
            testEqualityS(true, '4', '4 ');
            testEqualityS(true, '4', '4.0 ');
            testEqualityS(true, '4', '4.0000000000 ');
            testEqualityS(true, '4', '4.0000000001 ');
            testEqualityS(false, '4', '4.0001 ');
            testEqualityS(true, '4', '3.99999999999 ');
            testEqualityS(false, '4', '3.9999 ');
            testEqualityS(true, '-4', '-4 ');
            testEqualityS(true, '-4', ' -4. ');
            testEqualityS(true, '-4', '-4.0 ');
            testEqualityS(true, '-4', '-4.0000000000 ');
            testEqualityS(true, '-4', '-4.0000000001 ');
            testEqualityS(false, '-4', '-4.0001 ');
            testEqualityS(true, '-4', '-3.99999999999 ');
            testEqualityS(false, '-4', '-3.9999 ');
            testEqualityS(true, '0', '0 ');
            testEqualityS(true, '0', '0.0 ');
            testEqualityS(true, '0', '0.0000000000 ');
            testEqualityS(true, '0', '0.0000000001 ');
            testEqualityS(false, '0', '0.0001 ');
            testEqualityS(true, '0', '-0.0000000000 ');
            testEqualityS(true, '0', '-0.0000000001 ');
            testEqualityS(false, '0', '-0.0001 ');
            testEqualityS(true, '0', '-0 ');
            testEqualityS(true, '0', '-0');
            testEqualityS(false, '4', '-4 ');
            testEqualityS(false, '4', '-4');
        },
        'test_chunkGetChar',
        () => {
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 0, undefined);
            this.testGetChunk('a', 'abc', VpcChunkType.Chars, 1, undefined);
            this.testGetChunk('b', 'abc', VpcChunkType.Chars, 2, undefined);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 4, undefined);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 5, undefined);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 0, 0);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 0, 2);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 0, 4);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 0, 5);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 1, 0);
            this.testGetChunk('a', 'abc', VpcChunkType.Chars, 1, 1);
            this.testGetChunk('ab', 'abc', VpcChunkType.Chars, 1, 2);
            this.testGetChunk('abc', 'abc', VpcChunkType.Chars, 1, 3);
            this.testGetChunk('abc', 'abc', VpcChunkType.Chars, 1, 4);
            this.testGetChunk('abc', 'abc', VpcChunkType.Chars, 1, 5);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 2, 1);
            this.testGetChunk('b', 'abc', VpcChunkType.Chars, 2, 2);
            this.testGetChunk('bc', 'abc', VpcChunkType.Chars, 2, 3);
            this.testGetChunk('bc', 'abc', VpcChunkType.Chars, 2, 4);
            this.testGetChunk('bc', 'abc', VpcChunkType.Chars, 2, 5);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 3, 1);
            this.testGetChunk('c', 'abc', VpcChunkType.Chars, 3, 3);
            this.testGetChunk('c', 'abc', VpcChunkType.Chars, 3, 5);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 4, 4);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 4, 5);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 4, 6);
            this.testGetChunk('', 'abc', VpcChunkType.Chars, 5, 5);
        },
        'test_chunkGetItem1',
        () => {
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 0, undefined);
            this.testGetChunk('a', 'a,b,c', VpcChunkType.Items, 1, undefined);
            this.testGetChunk('b', 'a,b,c', VpcChunkType.Items, 2, undefined);
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 4, undefined);
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 5, undefined);
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 0, 0);
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 0, 2);
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 0, 4);
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 0, 5);
            this.testGetChunk('a', 'a,b,c', VpcChunkType.Items, 1, 0);
            this.testGetChunk('a', 'a,b,c', VpcChunkType.Items, 1, 1);
            this.testGetChunk('a,b', 'a,b,c', VpcChunkType.Items, 1, 2);
            this.testGetChunk('a,b,c', 'a,b,c', VpcChunkType.Items, 1, 3);
            this.testGetChunk('a,b,c', 'a,b,c', VpcChunkType.Items, 1, 4);
            this.testGetChunk('a,b,c', 'a,b,c', VpcChunkType.Items, 1, 5);
            this.testGetChunk('b', 'a,b,c', VpcChunkType.Items, 2, 1);
            this.testGetChunk('b', 'a,b,c', VpcChunkType.Items, 2, 2);
            this.testGetChunk('b,c', 'a,b,c', VpcChunkType.Items, 2, 3);
            this.testGetChunk('b,c', 'a,b,c', VpcChunkType.Items, 2, 4);
            this.testGetChunk('b,c', 'a,b,c', VpcChunkType.Items, 2, 5);
            this.testGetChunk('c', 'a,b,c', VpcChunkType.Items, 3, 1);
            this.testGetChunk('c', 'a,b,c', VpcChunkType.Items, 3, 3);
            this.testGetChunk('c', 'a,b,c', VpcChunkType.Items, 3, 5);
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 4, 4);
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 4, 5);
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 4, 6);
            this.testGetChunk('', 'a,b,c', VpcChunkType.Items, 5, 5);
        },
        'test_chunkGetItem2',
        () => {
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 0, undefined);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 1, undefined);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 2, undefined);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 4, undefined);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 5, undefined);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 0, 0);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 0, 2);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 0, 4);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 0, 5);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 1, 0);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 1, 1);
            this.testGetChunk(',', ',,cd,', VpcChunkType.Items, 1, 2);
            this.testGetChunk(',,cd', ',,cd,', VpcChunkType.Items, 1, 3);
            this.testGetChunk(',,cd,', ',,cd,', VpcChunkType.Items, 1, 4);
            this.testGetChunk(',,cd,', ',,cd,', VpcChunkType.Items, 1, 5);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 2, 1);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 2, 2);
            this.testGetChunk(',cd', ',,cd,', VpcChunkType.Items, 2, 3);
            this.testGetChunk(',cd,', ',,cd,', VpcChunkType.Items, 2, 4);
            this.testGetChunk(',cd,', ',,cd,', VpcChunkType.Items, 2, 5);
            this.testGetChunk('cd', ',,cd,', VpcChunkType.Items, 3, 1);
            this.testGetChunk('cd', ',,cd,', VpcChunkType.Items, 3, 3);
            this.testGetChunk('cd,', ',,cd,', VpcChunkType.Items, 3, 5);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 4, 4);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 4, 5);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 4, 6);
            this.testGetChunk('', ',,cd,', VpcChunkType.Items, 5, 5);
        },
        'test_chunkGetWord1',
        () => {
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 0, undefined);
            this.testGetChunk('abc', '  abc  .def gh.i   ', VpcChunkType.Words, 1, undefined);
            this.testGetChunk('.def', '  abc  .def gh.i   ', VpcChunkType.Words, 2, undefined);
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 4, undefined);
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 5, undefined);
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 0);
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 2);
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 4);
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 5);
            this.testGetChunk('abc', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 0);
            this.testGetChunk('abc', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 1);
            this.testGetChunk('abc  .def', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 2);
            this.testGetChunk('abc  .def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 3);
            this.testGetChunk('abc  .def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 4);
            this.testGetChunk('abc  .def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 5);
            this.testGetChunk('.def', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 1);
            this.testGetChunk('.def', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 2);
            this.testGetChunk('.def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 3);
            this.testGetChunk('.def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 4);
            this.testGetChunk('.def gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 5);
            this.testGetChunk('gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 1);
            this.testGetChunk('gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 3);
            this.testGetChunk('gh.i', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 5);
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 4);
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 5);
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 6);
            this.testGetChunk('', '  abc  .def gh.i   ', VpcChunkType.Words, 5, 5);
        },
        'test_chunkGetWord2',
        () => {
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 0, undefined);
            this.testGetChunk('ABC', 'ABC   DEF  GHI', VpcChunkType.Words, 1, undefined);
            this.testGetChunk('DEF', 'ABC   DEF  GHI', VpcChunkType.Words, 2, undefined);
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 4, undefined);
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 5, undefined);
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 0);
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 2);
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 4);
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 5);
            this.testGetChunk('ABC', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 0);
            this.testGetChunk('ABC', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 1);
            this.testGetChunk('ABC   DEF', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 2);
            this.testGetChunk('ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 3);
            this.testGetChunk('ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 4);
            this.testGetChunk('ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 5);
            this.testGetChunk('DEF', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 1);
            this.testGetChunk('DEF', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 2);
            this.testGetChunk('DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 3);
            this.testGetChunk('DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 4);
            this.testGetChunk('DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 5);
            this.testGetChunk('GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 1);
            this.testGetChunk('GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 3);
            this.testGetChunk('GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 5);
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 4);
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 5);
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 6);
            this.testGetChunk('', 'ABC   DEF  GHI', VpcChunkType.Words, 5, 5);
        },
        'test_chunkSetChar',
        () => {
            this.testSetChunk('123abc', 'abc', VpcChunkType.Chars, 0, undefined);
            this.testSetChunk('123bc', 'abc', VpcChunkType.Chars, 1, undefined);
            this.testSetChunk('a123c', 'abc', VpcChunkType.Chars, 2, undefined);
            this.testSetChunk('abc123', 'abc', VpcChunkType.Chars, 4, undefined);
            this.testSetChunk('abc123', 'abc', VpcChunkType.Chars, 5, undefined);
            this.testSetChunk('123abc', 'abc', VpcChunkType.Chars, 0, 0);
            this.testSetChunk('123abc', 'abc', VpcChunkType.Chars, 0, 2);
            this.testSetChunk('123abc', 'abc', VpcChunkType.Chars, 0, 4);
            this.testSetChunk('123abc', 'abc', VpcChunkType.Chars, 0, 5);
            this.testSetChunk('123abc', 'abc', VpcChunkType.Chars, 1, 0);
            this.testSetChunk('123bc', 'abc', VpcChunkType.Chars, 1, 1);
            this.testSetChunk('123c', 'abc', VpcChunkType.Chars, 1, 2);
            this.testSetChunk('123', 'abc', VpcChunkType.Chars, 1, 3);
            this.testSetChunk('123', 'abc', VpcChunkType.Chars, 1, 4);
            this.testSetChunk('123', 'abc', VpcChunkType.Chars, 1, 5);
            this.testSetChunk('a123bc', 'abc', VpcChunkType.Chars, 2, 1);
            this.testSetChunk('a123c', 'abc', VpcChunkType.Chars, 2, 2);
            this.testSetChunk('a123', 'abc', VpcChunkType.Chars, 2, 3);
            this.testSetChunk('a123', 'abc', VpcChunkType.Chars, 2, 4);
            this.testSetChunk('a123', 'abc', VpcChunkType.Chars, 2, 5);
            this.testSetChunk('ab123c', 'abc', VpcChunkType.Chars, 3, 1);
            this.testSetChunk('ab123', 'abc', VpcChunkType.Chars, 3, 3);
            this.testSetChunk('ab123', 'abc', VpcChunkType.Chars, 3, 5);
            this.testSetChunk('abc123', 'abc', VpcChunkType.Chars, 4, 4);
            this.testSetChunk('abc123', 'abc', VpcChunkType.Chars, 4, 5);
            this.testSetChunk('abc123', 'abc', VpcChunkType.Chars, 4, 6);
            this.testSetChunk('abc123', 'abc', VpcChunkType.Chars, 5, 5);
        },
        'test_chunkSetItem1',
        () => {
            this.testSetChunk('123a,b,c', 'a,b,c', VpcChunkType.Items, 0, undefined);
            this.testSetChunk('123,b,c', 'a,b,c', VpcChunkType.Items, 1, undefined);
            this.testSetChunk('a,123,c', 'a,b,c', VpcChunkType.Items, 2, undefined);
            this.testSetChunk('a,b,c,123', 'a,b,c', VpcChunkType.Items, 4, undefined);
            this.testSetChunk('a,b,c,,123', 'a,b,c', VpcChunkType.Items, 5, undefined);
            this.testSetChunk('123a,b,c', 'a,b,c', VpcChunkType.Items, 0, 0);
            this.testSetChunk('123a,b,c', 'a,b,c', VpcChunkType.Items, 0, 2);
            this.testSetChunk('123a,b,c', 'a,b,c', VpcChunkType.Items, 0, 4);
            this.testSetChunk('123a,b,c', 'a,b,c', VpcChunkType.Items, 0, 5);
            this.testSetChunk('123,b,c', 'a,b,c', VpcChunkType.Items, 1, 0);
            this.testSetChunk('123,b,c', 'a,b,c', VpcChunkType.Items, 1, 1);
            this.testSetChunk('123,c', 'a,b,c', VpcChunkType.Items, 1, 2);
            this.testSetChunk('123', 'a,b,c', VpcChunkType.Items, 1, 3);
            this.testSetChunk('123', 'a,b,c', VpcChunkType.Items, 1, 4);
            this.testSetChunk('123', 'a,b,c', VpcChunkType.Items, 1, 5);
            this.testSetChunk('a,123,c', 'a,b,c', VpcChunkType.Items, 2, 1);
            this.testSetChunk('a,123,c', 'a,b,c', VpcChunkType.Items, 2, 2);
            this.testSetChunk('a,123', 'a,b,c', VpcChunkType.Items, 2, 3);
            this.testSetChunk('a,123', 'a,b,c', VpcChunkType.Items, 2, 4);
            this.testSetChunk('a,123', 'a,b,c', VpcChunkType.Items, 2, 5);
            this.testSetChunk('a,b,123', 'a,b,c', VpcChunkType.Items, 3, 1);
            this.testSetChunk('a,b,123', 'a,b,c', VpcChunkType.Items, 3, 3);
            this.testSetChunk('a,b,123', 'a,b,c', VpcChunkType.Items, 3, 5);
            this.testSetChunk('a,b,c,123', 'a,b,c', VpcChunkType.Items, 4, 4);
            this.testSetChunk('a,b,c,123', 'a,b,c', VpcChunkType.Items, 4, 5);
            this.testSetChunk('a,b,c,123', 'a,b,c', VpcChunkType.Items, 4, 6);
            this.testSetChunk('a,b,c,,123', 'a,b,c', VpcChunkType.Items, 5, 5);
        },
        'test_chunkSetItem2',
        () => {
            this.testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 0, undefined);
            this.testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 1, undefined);
            this.testSetChunk(',123,cd,', ',,cd,', VpcChunkType.Items, 2, undefined);
            this.testSetChunk(',,cd,123', ',,cd,', VpcChunkType.Items, 4, undefined);
            this.testSetChunk(',,cd,,123', ',,cd,', VpcChunkType.Items, 5, undefined);
            this.testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 0, 0);
            this.testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 0, 2);
            this.testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 0, 4);
            this.testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 0, 5);
            this.testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 1, 0);
            this.testSetChunk('123,,cd,', ',,cd,', VpcChunkType.Items, 1, 1);
            this.testSetChunk('123,cd,', ',,cd,', VpcChunkType.Items, 1, 2);
            this.testSetChunk('123,', ',,cd,', VpcChunkType.Items, 1, 3);
            this.testSetChunk('123', ',,cd,', VpcChunkType.Items, 1, 4);
            this.testSetChunk('123', ',,cd,', VpcChunkType.Items, 1, 5);
            this.testSetChunk(',123,cd,', ',,cd,', VpcChunkType.Items, 2, 1);
            this.testSetChunk(',123,cd,', ',,cd,', VpcChunkType.Items, 2, 2);
            this.testSetChunk(',123,', ',,cd,', VpcChunkType.Items, 2, 3);
            this.testSetChunk(',123', ',,cd,', VpcChunkType.Items, 2, 4);
            this.testSetChunk(',123', ',,cd,', VpcChunkType.Items, 2, 5);
            this.testSetChunk(',,123,', ',,cd,', VpcChunkType.Items, 3, 1);
            this.testSetChunk(',,123,', ',,cd,', VpcChunkType.Items, 3, 3);
            this.testSetChunk(',,123', ',,cd,', VpcChunkType.Items, 3, 5);
            this.testSetChunk(',,cd,123', ',,cd,', VpcChunkType.Items, 4, 4);
            this.testSetChunk(',,cd,123', ',,cd,', VpcChunkType.Items, 4, 5);
            this.testSetChunk(',,cd,123', ',,cd,', VpcChunkType.Items, 4, 6);
            this.testSetChunk(',,cd,,123', ',,cd,', VpcChunkType.Items, 5, 5);
        },
        'test_chunkSetWord1',
        () => {
            this.testSetChunk('123  abc  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 0, undefined);
            this.testSetChunk('  123  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, undefined);
            this.testSetChunk('  abc  123 gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, undefined);
            this.testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 4, undefined);
            this.testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 5, undefined);
            this.testSetChunk('123  abc  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 0);
            this.testSetChunk('123  abc  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 2);
            this.testSetChunk('123  abc  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 4);
            this.testSetChunk('123  abc  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 0, 5);
            this.testSetChunk('  123  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 0);
            this.testSetChunk('  123  .def gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 1);
            this.testSetChunk('  123 gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 2);
            this.testSetChunk('  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 3);
            this.testSetChunk('  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 4);
            this.testSetChunk('  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 1, 5);
            this.testSetChunk('  abc  123 gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 1);
            this.testSetChunk('  abc  123 gh.i   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 2);
            this.testSetChunk('  abc  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 3);
            this.testSetChunk('  abc  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 4);
            this.testSetChunk('  abc  123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 2, 5);
            this.testSetChunk('  abc  .def 123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 1);
            this.testSetChunk('  abc  .def 123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 3);
            this.testSetChunk('  abc  .def 123   ', '  abc  .def gh.i   ', VpcChunkType.Words, 3, 5);
            this.testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 4);
            this.testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 5);
            this.testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 4, 6);
            this.testSetChunk('  abc  .def gh.i   123', '  abc  .def gh.i   ', VpcChunkType.Words, 5, 5);
        },
        'test_chunkSetWord2',
        () => {
            this.testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 0, undefined);
            this.testSetChunk('123   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, undefined);
            this.testSetChunk('ABC   123  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, undefined);
            this.testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 4, undefined);
            this.testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 5, undefined);
            this.testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 0);
            this.testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 2);
            this.testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 4);
            this.testSetChunk('123ABC   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 0, 5);
            this.testSetChunk('123   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 0);
            this.testSetChunk('123   DEF  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 1);
            this.testSetChunk('123  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 2);
            this.testSetChunk('123', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 3);
            this.testSetChunk('123', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 4);
            this.testSetChunk('123', 'ABC   DEF  GHI', VpcChunkType.Words, 1, 5);
            this.testSetChunk('ABC   123  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 1);
            this.testSetChunk('ABC   123  GHI', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 2);
            this.testSetChunk('ABC   123', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 3);
            this.testSetChunk('ABC   123', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 4);
            this.testSetChunk('ABC   123', 'ABC   DEF  GHI', VpcChunkType.Words, 2, 5);
            this.testSetChunk('ABC   DEF  123', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 1);
            this.testSetChunk('ABC   DEF  123', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 3);
            this.testSetChunk('ABC   DEF  123', 'ABC   DEF  GHI', VpcChunkType.Words, 3, 5);
            this.testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 4);
            this.testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 5);
            this.testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 4, 6);
            this.testSetChunk('ABC   DEF  GHI123', 'ABC   DEF  GHI', VpcChunkType.Words, 5, 5);
        },
        'test_cornercases',
        () => {
            this.testGetChunk('', '', VpcChunkType.Chars, 0, 0);
            this.testGetChunk('', '', VpcChunkType.Chars, 0, 2);
            this.testGetChunk('', '', VpcChunkType.Chars, 1, 1);
            this.testGetChunk('', '', VpcChunkType.Chars, 1, 3);
            this.testGetChunk('', '', VpcChunkType.Items, 0, 0);
            this.testGetChunk('', '', VpcChunkType.Items, 0, 2);
            this.testGetChunk('', '', VpcChunkType.Items, 1, 1);
            this.testGetChunk('', '', VpcChunkType.Items, 1, 3);
            this.testGetChunk('', '', VpcChunkType.Words, 0, 0);
            this.testGetChunk('', '', VpcChunkType.Words, 0, 2);
            this.testGetChunk('', '', VpcChunkType.Words, 1, 1);
            this.testGetChunk('', '', VpcChunkType.Words, 1, 3);
            this.testSetChunk('123', '', VpcChunkType.Chars, 0, 0);
            this.testSetChunk('123', '', VpcChunkType.Chars, 0, 2);
            this.testSetChunk('123', '', VpcChunkType.Chars, 1, 1);
            this.testSetChunk('123', '', VpcChunkType.Chars, 1, 3);
            this.testSetChunk('123', '', VpcChunkType.Chars, 5, 5);
            this.testSetChunk('123', '', VpcChunkType.Chars, 5, 7);
            this.testSetChunk('123', '', VpcChunkType.Items, 0, 0);
            this.testSetChunk('123', '', VpcChunkType.Items, 0, 2);
            this.testSetChunk('123', '', VpcChunkType.Items, 1, 1);
            this.testSetChunk('123', '', VpcChunkType.Items, 1, 3);
            this.testSetChunk(',,,,123', '', VpcChunkType.Items, 5, 5);
            this.testSetChunk(',,,,123', '', VpcChunkType.Items, 5, 7);
            this.testSetChunk('123', '', VpcChunkType.Words, 0, 0);
            this.testSetChunk('123', '', VpcChunkType.Words, 0, 2);
            this.testSetChunk('123', '', VpcChunkType.Words, 1, 1);
            this.testSetChunk('123', '', VpcChunkType.Words, 1, 3);
            this.testSetChunk('123', '', VpcChunkType.Words, 5, 5);
            this.testSetChunk('123', '', VpcChunkType.Words, 5, 7);
            this.testSetChunk('abc123', 'abc', VpcChunkType.Chars, 5, 7);
            this.testSetChunk('a,b,c,,123', 'a,b,c', VpcChunkType.Items, 5, 7);
            this.testSetChunk(',,cd,,123', ',,cd,', VpcChunkType.Items, 5, 7);
        }
    ];
}
