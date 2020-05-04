
/* auto */ import { getParsingObjects } from './../../vpc/codeparse/vpcVisitor';
/* auto */ import { BuildFakeTokens, cloneToken } from './../../vpc/codeparse/vpcTokens';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, assertEq, assertWarnEq, longstr, util512Sort } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, assertAsserts } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * test parsing a command
 */
let t = new SimpleUtil512TestCollection('testCollectionvpcScriptParseCmd');
export let testCollectionvpcScriptParseCmd = t;

t.test('VpcParseCmdSet.Basic syntax', () => {
    testCmdSet(`set the topleft to 1`, 'parses');
    testCmdSet(`set the topleft to -1`, 'parses');
    testCmdSet(`set the topleft to 1 + 1`, 'parses');
    testCmdSet(`set the topleft to (1 < 2)`, 'parses');
    testCmdSet(`set topleft to 1`, 'parses');
});
t.test('VpcParseCmdSet.ConfirmThatFailureAsserts', () => {
    testCmdSet(`set the topleft to 1`, 'parses');
    assertFailsCmdSet(`set topleft in cd btn 1 to 2`, `Exception`);
    /* test that the tests can fail */
    assertAsserts('Q>|', 'assert:', () => {
        testCmdSet(`set topleft in cd btn 1 to 2`, 'parses');
    });
    assertAsserts('Q=|', 'assert:', () => {
        assertFailsCmdSet(`set the topleft to 1`, 'Exception');
    });
    /* incorrect message */
    assertAsserts('Q<|', 'assert:', () => {
        testCmdSet(`set the topleft to 1`, 'Exception');
    });
    assertAsserts('Q;|', 'assert:', () => {
        assertFailsCmdSet(`set topleft in cd btn 1 to 2`, 'parses');
    });
});
t.test('VpcParseCmdSet.confirm that cases that should fail, do fail', () => {
    assertFailsCmdSet(
        `set topleft in cd btn 1 to 2`,
        `MismatchedTokenException: Expecting token of type `
    );
    assertFailsCmdSet(
        `set topleft of cd btn 1 to 2 and 3`,
        `NotAllInputParsedException: Redundant input, expec`
    );
});
t.test('VpcParseCmdSet.test property targets', () => {
    testCmdSet(`set topleft of cd 1 to 2`, 'parses');
    testCmdSet(`set topleft of bg 1 to 2`, 'parses');
    testCmdSet(`set topleft of cd x to 2`, 'parses');
    testCmdSet(`set topleft of bg x to 2`, 'parses');
    testCmdSet(`set topleft of cd btn 1 to 2`, 'parses');
    testCmdSet(`set topleft of cd btn 1 of cd 2 to 3`, 'parses');
    testCmdSet(`set topleft of cd fld 1 to 2`, 'parses');
    testCmdSet(`set topleft of cd fld 1 to 2`, 'parses');
    testCmdSet(`set topleft of this stack to 2`, 'parses');
    testCmdSet(`set topleft of the target to 2`, 'parses');
    testCmdSet(`set topleft of me to 2`, 'parses');
});
t.test('VpcParseCmdSet.using keyword "to" more than once', () => {
    testCmdSet(`set topleft to chars 1 to 2 of "a"`, 'parses');
    testCmdSet(
        `set topleft of chars 1 to 2 of cd fld 1 to chars 3 to 4 of "a"`,
        'parses'
    );
});
t.test('VpcParseCmdSet.chunks of fields', () => {
    testCmdSet(`set topleft of word 1 to 2 of cd fld 3 to 4`, 'parses');
    testCmdSet(`set topleft of item 1 to (2 + 3) of cd fld 4 to 5`, 'parses');
});
t.test(`TestVpcParseCmdSet.can't take chunks of anything else`, () => {
    assertFailsCmdSet(
        `set topleft of word 1 to 2 of cd 3 to 4`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsCmdSet(
        `set topleft of word 1 to 2 of bg 3 to 4`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsCmdSet(
        `set topleft of word 1 to 2 of cd btn 3 to 4`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsCmdSet(
        `set topleft of word 1 to 2 of this stack to 4`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsCmdSet(
        `set topleft of word 1 to 2 of x to 4`,
        `NoViableAltException: Expecting: one of these poss`
    );
});
t.test('VpcParseCmdSet.will fail at runtime, but syntax is valid', () => {
    testCmdSet(`set the id of cd btn 1 to 2`, 'parses');
    testCmdSet(`set the id of cd btn id 1 to 2`, 'parses');
});
t.test('VpcParseCmdSet.types of things to set to', () => {
    testCmdSet(`set topleft to ta`, 'parses');
    testCmdSet(`set topleft to ta, tb`, 'parses');
    testCmdSet(`set topleft to ta, tb, tc`, 'parses');
    testCmdSet(`set topleft to ta, tb, tc, td`, 'parses');
    testCmdSet(`set topleft to ta, tb, tc, td, te`, 'parses');
    testCmdSet(`set topleft to opaque`, 'parses');
    testCmdSet(`set topleft to bold`, 'parses');
    testCmdSet(`set topleft to bold, italic`, 'parses');
    testCmdSet(`set topleft to bold, italic, shadow`, 'parses');
    testCmdSet(`set topleft to (1), (2)`, 'parses');
    testCmdSet(`set topleft to (1+2), (3+4)`, 'parses');
});
t.test('VpcParseCmdSet.not a valid property set', () => {
    assertFailsCmdSet(
        `set topleft to cd 1`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsCmdSet(
        `set topleft topleft to 1`,
        `MismatchedTokenException: Expecting token of type `
    );
    assertFailsCmdSet(
        `set topleft to (ta, tb)`,
        `MismatchedTokenException: Expecting token of type `
    );
    assertFailsCmdSet(
        `set topleft to ta tb`,
        `NotAllInputParsedException: Redundant input, expec`
    );
    assertFailsCmdSet(
        `set topleft to 1 2`,
        `NotAllInputParsedException: Redundant input, expec`
    );
    assertFailsCmdSet(
        `set topleft to`,
        `EarlyExitException: Expecting: expecting at least `
    );
    assertFailsCmdSet(
        `set topleft to ,`,
        `EarlyExitException: Expecting: expecting at least `
    );
    assertFailsCmdSet(
        `set topleft to 1,`,
        `NoViableAltException: Expecting: one of these poss`
    );
});
t.test('VpcParseCmdAdd', () => {
    testCmd('add x to y', 'parses');
    testCmd('add 1+2+3 to y', 'parses');
    testCmd('add 1 to cd fld o', 'parses');
    testCmd('add 1 to line 2 of cd fld o', 'parses');
    testCmd('add 1 to line 2 to 3 of cd fld o', 'parses');
    testCmd('add 1 to line 2 to (3*4) of cd fld o', 'parses');
});
t.test('VpcParseCmdAdd.invalid syntax', () => {
    assertFailsCmd('add 1 + 2', 'MismatchedTokenException');
    assertFailsCmd('add 1 to 2', 'NoViableAltException');
    assertFailsCmd('add 1 to "abc"', 'NoViableAltException');
    assertFailsCmd('add 1 to line 2', 'NoViableAltException');
    assertFailsCmd('add 1 to line 2 to 3 of', 'NoViableAltException');
    assertFailsCmd('add 1 to cd x', 'NoViableAltException');
    assertFailsCmd('add 1 to bg x', 'NoViableAltException');
    assertFailsCmd('add 1 to the x', 'Exception');
    assertFailsCmd('add 1 to the left of cd btn 1', 'Exception');
});
t.test('VpcParseCmdAnswer', () => {
    testCmd('answer x', 'parses');
    testCmd('answer x {MK} y', 'parses');
    testCmd('answer x {MK} y or z1', 'parses');
    testCmd('answer x {MK} y or z1 or z2', 'parses');
    testCmd('ask x', 'parses');
    testCmd('ask x {MK} y', 'parses');
});
t.test('VpcParseCmdMultiply', () => {
    testCmd('multiply x {MK} 2', 'parses');
    testCmd('multiply x {MK} "2"', 'parses');
});
t.test('VpcParseCmdDrag', () => {
    testCmd('drag from 2,3 to 4,5', 'parses');
    testCmd('drag from 2,3 to 4,5 {MK} shiftkey', 'parses');
    testCmd('drag from 2,3 to 4,5 {MK} shiftkey, optkey', 'parses');
    testCmd('drag from 2,3 to 4,5 {MK} shiftkey, optkey, cmdkey', 'parses');
    testCmd('drag from 2,3 to 4,5 to 6,7', 'parses');
    testCmd('drag from 2,3 to 4,5 to 6,7 {MK} shiftkey', 'parses');
    testCmd('drag from 2,3 to 4,5 to 6,7 {MK} shiftkey, optkey', 'parses');
    testCmd('drag from 2,3 to 4,5 to 6,7 {MK} shiftkey, optkey, cmdkey', 'parses');
});
t.test('VpcParseCmdPut', () => {
    testCmd('put 1+2 {MK} into {MK} x', 'parses');
    testCmd('put 1+2 {MK} before {MK} x', 'parses');
    testCmd('put 1 {MK} into {MK} x', 'parses');
    testCmd('put "abc" {MK} into {MK} x', 'parses');
    testCmd('put cd fld 1 {MK} into {MK} x', 'parses');
    testCmd('put y {MK} into {MK} x', 'parses');
    testCmd('put myfn(1,2) {MK} into {MK} x', 'parses');
    testCmd('put sin(1) {MK} into {MK} x', 'parses');
    testCmd('put result() {MK} into {MK} x', 'parses');
    testCmd('put the result {MK} into {MK} x', 'parses');
    testCmd('put the left of cd btn 1 {MK} into {MK} x', 'parses');
    testCmd('put the textfont of line 1 of cd fld 1 {MK} into {MK} x', 'parses');
    testCmd('put the long name of cd fld 1 {MK} into {MK} x', 'parses');
    testCmd('put the long version {MK} into {MK} x', 'parses');
    testCmd('put the number of cd btns {MK} into {MK} x', 'parses');
    testCmd('put there is a cd btn y {MK} into {MK} x', 'parses');
    testCmd('put true or false {MK} into {MK} x', `parses`);
    testCmd('put 2 > 3 {MK} into {MK} x', 'parses');
    testCmd('put 2 is a number {MK} into {MK} x', 'parses');
    testCmd('put y is within z {MK} into {MK} x', 'parses');
    testCmd('put y is in z {MK} into {MK} x', 'parses');
    testCmd('put y & z {MK} into {MK} x', 'parses');
    testCmd('put 4/5 {MK} into {MK} x', 'parses');
    testCmd('put 4 div 5 {MK} into {MK} x', 'parses');
    testCmd('put (1) {MK} into {MK} x', 'parses');
    testCmd('put -1 {MK} into {MK} x', 'parses');
    testCmd('put not true {MK} into {MK} x', 'parses');
    testCmd('put first line of y {MK} into {MK} x', 'parses');
    testCmd('put line 1 of y {MK} into {MK} x', 'parses');
    testCmd('put line 1 to 2 of y {MK} into {MK} x', 'parses');
    testCmd('put not char 1 of (char 2 of y) {MK} into {MK} x', 'parses');
});
t.test('LexerRemembersInitialLine', () => {
    /* if chevrotain didn't remember this,
        when there was a runtime error,
        we'd take you to the wrong line number */
    let lexer = TestParseHelpers.instance().lexer;
    let input = 'put\\\n 4\\\n into\\\n x\nput 5\\\n into y';
    let lexResult = lexer.tokenize(input);
    assertTrue(!lexResult.errors.length, `HX|${lexResult.errors[0]?.message}`);
    assertEq(9, lexResult.tokens.length, 'HW|');
    assertEq(
        '1,2,3,4,4,5,5,6,6',
        lexResult.tokens.map(o => o.startLine).join(','),
        'HV|'
    );
    assertEq('1,2,3,4,4,5,5,6,6', lexResult.tokens.map(o => o.endLine).join(','), 'HU|');
    assertEq(
        'put,4,into,x,\n,put,5,into,y',
        lexResult.tokens.map(o => o.image).join(','),
        'HT|'
    );
});
t.test('CloneToken', () => {
    let lexer = TestParseHelpers.instance().lexer;
    let input = 'put 4 into x';
    let lexResult = lexer.tokenize(input);
    assertTrue(!lexResult.errors.length, `HS|${lexResult.errors[0]?.message}`);
    assertEq(4, lexResult.tokens.length, 'HR|');
    assertEq('put,4,into,x', lexResult.tokens.map(o => o.image).join(','), 'HQ|');

    /* check that the properties we copy over in
        cloneToken are the same that the real lexer produces */
    let real = lexResult.tokens[0];
    let cloned = cloneToken(real);
    let realTokenKeys = Util512.getMapKeys(real as any);
    let clonedTokenKeys = Util512.getMapKeys(cloned as any);
    realTokenKeys.sort(util512Sort);
    clonedTokenKeys.sort(util512Sort);

    /* these ones we know we can ignore, after confirming they are undefined in the real object */
    assertTrue(!real.isInsertedInRecovery, 'HP|');
    clonedTokenKeys = clonedTokenKeys.filter(
        k => k !== 'isInsertedInRecovery' && k !== 'tokenClassName' && k !== 'payload'
    );
    assertWarnEq(realTokenKeys.join(','), clonedTokenKeys.join(','), 'HN|');
});

/**
 * helpers for testing parsing
 */
export class TestParseHelpers {
    protected static _instance: O<TestParseHelpers>
    lexer: chevrotain.Lexer;
    parser: chevrotain.CstParser;
    constructor() {
        [this.lexer, this.parser] = getParsingObjects();
        assertTrue(this.lexer, '1<|could not getParsingObjects');
        assertTrue(this.parser, '1;|could not getParsingObjects');
    }

    /**
    * make an instance or use cached
    */
    static instance() {
        if (!TestParseHelpers._instance) {
            TestParseHelpers._instance = new TestParseHelpers()
        }

        return TestParseHelpers._instance
    }


    /**
     * parse the input, flatten the resulting syntax tree into a string,
     * and then compare the string to what was expected.
     *
     * if sErrExpected is set, expect there to be a parsing error
     * with an error message containing sErrExpected
     */
    testParse(sInput: string, sTopRule: string, sExpected: string, sErrExpected: string) {
        let lexResult = this.lexer.tokenize(sInput);
        if (sErrExpected.startsWith('Lexer:')) {
            sErrExpected = sErrExpected.substr('Lexer:'.length);
            if (!lexResult.errors.length) {
                assertWarn(
                    false,
                    "Q:|expected a lexer error but there weren't any",
                    `${lexResult.errors[0]?.message}`
                );
            } else {
                return;
            }
        } else {
            assertWarn(!lexResult.errors.length, `1,|${lexResult.errors[0]?.message}`);
        }

        let line = lexResult.tokens;
        line.splice(
            0,
            1,
            BuildFakeTokens.makeSyntaxMarker(line[0]),
            BuildFakeTokens.makeSyntaxMarker(line[0]),
            BuildFakeTokens.makeSyntaxMarker(line[0])
        );
        this.parser.input = line;
        let cst = Util512.callAsMethodOnClass(
            this.testParse.name,
            this.parser,
            sTopRule,
            [],
            false
        );
        assertWarn(
            sExpected === '' || sExpected === 'parses',
            "Q/|we don't check the cst anymore"
        );
        let shouldCont = this.testParseRespondToErrs(sInput, sErrExpected, cst);
        if (!shouldCont) {
            return;
        }
    }

    /**
     * respond to errors coming from the parser.
     * return false if we should return early
     */
    protected testParseRespondToErrs(sInput: string, sErrExpected: string, cst: any) {
        if (this.parser.errors.length) {
            if (sErrExpected.length) {
                /* add the exception name, for backwards compat */
                let compatName =
                    this.parser.errors[0].name + ': ' + this.parser.errors[0].message;
                if (!compatName.includes(sErrExpected)) {
                    let sParseErr = longstr(
                        `1+|for input ${sInput} got different
                        failure message, expected ${sErrExpected} ${this.parser.errors}`
                    );
                    assertWarn(false, sParseErr);
                }

                return false;
            } else {
                let sParseErr = `1*|for input ${sInput} got parse errors ${this.parser.errors}`;
                assertWarn(false, sParseErr);
            }
        } else {
            if (sErrExpected.length > 0) {
                let sParseErr = `1&|for input ${sInput} expected failure but succeeded.`;
                assertWarn(false, sParseErr);
            }
        }

        return true;
    }
}

/**
 * wrapper around testParse, for the set command
 */
function testCmdSet(sInput: string, sExpected: string) {
    assertTrue(sInput.startsWith('set '), '1:|expected start with set');
    return TestParseHelpers.instance().testParse(
        sInput,
        'RuleBuiltinCmdSet',
        sExpected,
        ''
    );
}

/**
 * wrapper around testParse, asserts that it fails with the expected message
 */
function assertFailsCmdSet(sInput: string, sErrExpected: string) {
    assertTrue(sInput.startsWith('set '), '1/|expected start with set');
    return TestParseHelpers.instance().testParse(
        sInput,
        'RuleBuiltinCmdSet',
        '',
        sErrExpected
    );
}

/**
 * wrapper around testParse, for an arbitrary command
 * we'll get the rule name by extracting the first word from sInput
 */
function testCmd(sInput: string, sExpected: string) {
    /* manually make a syntax marker */
    let sSyntaxMarker = BuildFakeTokens.strSyntaxMark;
    sInput = sInput.replace(/\{MK\}/g, sSyntaxMarker);
    let sCmd = sInput.split(' ')[0];
    assertTrue(sInput.startsWith(sCmd + ' '), '1.|expected start with ' + sCmd);
    let firstCapital = sCmd[0].toUpperCase() + sCmd.slice(1).toLowerCase();
    firstCapital = firstCapital === 'Go' ? 'GoCard' : firstCapital;
    return TestParseHelpers.instance().testParse(
        sInput,
        'RuleBuiltinCmd' + firstCapital,
        sExpected,
        ''
    );
}

/**
 * wrapper around testParse, asserts that it fails with the expected message
 */
function assertFailsCmd(sInput: string, sErrExpected: string) {
    let sCmd = sInput.split(' ')[0];
    assertTrue(sInput.startsWith(sCmd + ' '), '1-|expected start with ' + sCmd);
    let firstCapital = sCmd[0].toUpperCase() + sCmd.slice(1).toLowerCase();
    firstCapital = firstCapital === 'Go' ? 'GoCard' : firstCapital;
    return TestParseHelpers.instance().testParse(
        sInput,
        'RuleBuiltinCmd' + firstCapital,
        '',
        sErrExpected
    );
}
