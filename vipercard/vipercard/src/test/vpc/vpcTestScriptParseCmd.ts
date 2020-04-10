
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEq, assertEqWarn } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ChvLexer } from '../../vpc/codeparse/bridgeChv.js';
/* auto */ import { cloneToken, tks, tokenType } from '../../vpc/codeparse/vpcTokens.js';
/* auto */ import { VpcChvParser } from '../../vpc/codeparse/vpcParser.js';
/* auto */ import { VpcVisitorInterface } from '../../vpc/codeparse/vpcVisitorMixin.js';
/* auto */ import { getParsingObjects } from '../../vpc/codeparse/vpcVisitor.js';

/**
 * test parsing a command
 */
let t = new SimpleUtil512TestCollection('testCollectionMMMMMM');
export let testCollectionMMMMMM = t;

t.test('TestVpcParseCmdSet.Basic syntax', () => {
        testCmdSet(
            `set the prop to 1`,
            'parses'
        );
        testCmdSet(
            `set the prop to -1`,
            'parses'
        );
        testCmdSet(
            `set the prop to 1 + 1`,
            'parses'
        );
        testCmdSet(
            `set the prop to (1 < 2)`,
            'parses'
        );
        testCmdSet(
            `set prop to 1`,
            'parses'
        );
});
t.test('TestVpcParseCmdSet.confirm that cases that should fail, do fail', () => {
        assertFailsCmdSet(`set prop in cd btn 1 to 2`, `MismatchedTokenException: Expecting token of type `);
        assertFailsCmdSet(`set prop of cd btn 1 to 2 and 3`, `NotAllInputParsedException: Redundant input, expec`);

        /* hm, a TkIdentifier is currently a valid <Object>. not ideal but saves a few tokens. */
        /* we'll fail at a later stage. */
        /* this.assertFailsParseSetExp(#set prop of x to 1#, ##) */
});
t.test('TestVpcParseCmdSet.test property targets', () => {
        testCmdSet(
            `set prop of cd 1 to 2`,
            'parses'
        );
        testCmdSet(
            `set prop of bg 1 to 2`,
            'parses'
        );
        testCmdSet(
            `set prop of cd x to 2`,
            'parses'
        );
        testCmdSet(
            `set prop of bg x to 2`,
            'parses'
        );
        testCmdSet(
            `set prop of cd btn 1 to 2`,
            'parses'
        );
        testCmdSet(
            `set prop of cd btn 1 of cd 2 to 3`,
            'parses'
        );
        testCmdSet(
            `set prop of cd fld 1 to 2`,
            'parses'
        );
        testCmdSet(
            `set prop of cd fld 1 to 2`,
            'parses'
        );
        testCmdSet(
            `set prop of this stack to 2`,
            'parses'
        );
        testCmdSet(
            `set prop of the target to 2`,
            'parses'
        );
        testCmdSet(
            `set prop of me to 2`,
            'parses'
        );
});
t.test('TestVpcParseCmdSet.using keyword "to" more than once', () => {
        testCmdSet(
            `set prop to chars 1 to 2 of "a"`,
            'parses'
        );
        testCmdSet(
            `set prop of chars 1 to 2 of cd fld 1 to chars 3 to 4 of "a"`,
            'parses'
        );
});
t.test('TestVpcParseCmdSet.chunks of fields', () => {
        testCmdSet(
            `set prop of word 1 to 2 of cd fld 3 to 4`,
            'parses'
        );
        testCmdSet(
            `set prop of item 1 to (2 + 3) of cd fld 4 to 5`,
            'parses'
        );
});
t.test(`TestVpcParseCmdSet.can't take chunks of anything else`, () => {
        assertFailsCmdSet(`set prop of word 1 to 2 of cd 3 to 4`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsCmdSet(`set prop of word 1 to 2 of bg 3 to 4`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsCmdSet(
            `set prop of word 1 to 2 of cd btn 3 to 4`,
            `NoViableAltException: Expecting: one of these poss`
        );
        assertFailsCmdSet(
            `set prop of word 1 to 2 of this stack to 4`,
            `NoViableAltException: Expecting: one of these poss`
        );
        assertFailsCmdSet(`set prop of word 1 to 2 of x to 4`, `NoViableAltException: Expecting: one of these poss`);
});
t.test('TestVpcParseCmdSet.will fail at runtime, but syntax is valid', () => {
        testCmdSet(
            `set the id of cd btn 1 to 2`,
            'parses'
        );
        testCmdSet(
            `set the id of cd btn id 1 to 2`,
            'parses'
        );
});
t.test('TestVpcParseCmdSet.types of things to set to', () => {
        testCmdSet(
            `set prop to ta`,
            'parses'
        );
        testCmdSet(
            `set prop to ta, tb`,
            'parses'
        );
        testCmdSet(
            `set prop to ta, tb, tc`,
            'parses'
        );
        testCmdSet(
            `set prop to ta, tb, tc, td`,
            'parses'
        );
        testCmdSet(
            `set prop to ta, tb, tc, td, te`,
            'parses'
        );
        testCmdSet(
            `set prop to opaque`,
            'parses'
        );
        testCmdSet(
            `set prop to bold`,
            'parses'
        );
        testCmdSet(
            `set prop to bold, italic`,
            'parses'
        );
        testCmdSet(
            `set prop to bold, italic, shadow`,
            'parses'
        );
        testCmdSet(
            `set prop to (1), (2)`,
            'parses'
        );
        testCmdSet(
            `set prop to (1+2), (3+4)`,
            'parses'
        );
});
t.test('TestVpcParseCmdSet.not a valid property set', () => {
        assertFailsCmdSet(`set prop to cd 1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsCmdSet(`set prop prop to 1`, `MismatchedTokenException: Expecting token of type `);
        assertFailsCmdSet(`set prop to (ta, tb)`, `MismatchedTokenException: Expecting token of type `);
        assertFailsCmdSet(`set prop to ta tb`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsCmdSet(`set prop to 1 2`, `NotAllInputParsedException: Redundant input, expec`);
        assertFailsCmdSet(`set prop to`, `EarlyExitException: Expecting: expecting at least `);
        assertFailsCmdSet(`set prop to ,`, `EarlyExitException: Expecting: expecting at least `);
        assertFailsCmdSet(`set prop to 1,`, `NoViableAltException: Expecting: one of these poss`);
});
t.test('TestVpcParseCmdAdd', () => {
        testCmd(
            'add x to y',
            'parses'
        );
        testCmd(
            'add 1+2+3 to y',
            'parses'
        );
        testCmd(
            'add 1 to cd fld o',
            'parses'
        );
        testCmd(
            'add 1 to line 2 of cd fld o',
            'parses'
        );
        testCmd(
            'add 1 to line 2 to 3 of cd fld o',
            'parses'
        );
        testCmd(
            'add 1 to line 2 to (3*4) of cd fld o',
            'parses'
        );
});
t.test('TestVpcParseCmdAdd.invalid syntax', () => {
        assertFailsCmd('add 1 + 2', 'MismatchedTokenException');
        assertFailsCmd('add 1 to 2', 'NoViableAltException');
        assertFailsCmd('add 1 to "abc"', 'NoViableAltException');
        assertFailsCmd('add 1 to line 2', 'NoViableAltException');
        assertFailsCmd('add 1 to line 2 to 3 of', 'NoViableAltException');
        assertFailsCmd('add 1 to cd x', 'NoViableAltException');
        assertFailsCmd('add 1 to bg x', 'NoViableAltException');
        assertFailsCmd('add 1 to the x', 'MismatchedTokenException');
        assertFailsCmd('add 1 to the left of cd btn 1', 'MismatchedTokenException');
});
t.test('TestVpcParseCmdAnswer', () => {
        testCmd(
            'answer x',
            'parses'
        );
        testCmd(
            'answer x \n y',
            'parses'
        );
        testCmd(
            'answer x \n y or z1',
            'parses'
        );
        testCmd(
            'answer x \n y or z1 or z2',
            'parses'
        );
        testCmd(
            'ask x',
            'parses'
        );
        testCmd(
            'ask x \n y',
            'parses'
        );
});
t.test('TestVpcParseCmdMultiply', () => {
        testCmd(
            'multiply x \n 2',
            'parses'
        );
        testCmd(
            'multiply x \n "2"',
            'parses'
        );
});
t.test('TestVpcParseCmdDrag', () => {
        testCmd(
            'drag from 2,3 to 4,5',
            'parses'
        );
        testCmd(
            'drag from 2,3 to 4,5 \n shiftkey',
            'parses'
        );
        testCmd(
            'drag from 2,3 to 4,5 \n shiftkey, optkey',
            'parses'
        );
        testCmd(
            'drag from 2,3 to 4,5 \n shiftkey, optkey, cmdkey',
            'parses'
        );
        testCmd(
            'drag from 2,3 to 4,5 to 6,7',
            'parses'
        );
        testCmd(
            'drag from 2,3 to 4,5 to 6,7 \n shiftkey',
            'parses'
        );
        testCmd(
            'drag from 2,3 to 4,5 to 6,7 \n shiftkey, optkey',
            'parses'
        );
        testCmd(
            'drag from 2,3 to 4,5 to 6,7 \n shiftkey, optkey, cmdkey',
            'parses'
        );
});
t.test('TestVpcParseCmdPut', () => {
        testCmd(
            'put 1+2 \n into \n x',
            'parses'
        );
        testCmd(
            'put 1+2 \n before \n x',
            'parses'
        );
        testCmd(
            'put 1 \n into \n x',
            'parses'
        );
        testCmd(
            'put "abc" \n into \n x',
            'parses'
        );
        testCmd(
            'put cd fld 1 \n into \n x',
            'parses'
        );
        testCmd(
            'put y \n into \n x',
            'parses'
        );
        testCmd(
            'put myfn(1,2) \n into \n x',
            'parses'
        );
        testCmd(
            'put sin(1) \n into \n x',
            'parses'
        );
        testCmd(
            'put result() \n into \n x',
            'parses'
        );
        testCmd(
            'put the result \n into \n x',
            'parses'
        );
        testCmd(
            'put the left of cd btn 1 \n into \n x',
            'parses'
        );
        testCmd(
            'put the textfont of line 1 of cd fld 1 \n into \n x',
            'parses'
        );
        testCmd(
            'put the long name of cd fld 1 \n into \n x',
            'parses'
        );
        testCmd(
            'put the long version \n into \n x',
            'parses'
        );
        testCmd(
            'put the number of cd btns \n into \n x',
            'parses'
        );
        testCmd(
            'put there is a cd btn y \n into \n x',
            'parses'
        );
        testCmd(
            'put true or false \n into \n x',
            `Expr(
    ExprSource(
        HSimpleContainer( $true ) )
    ExprSource(
        HSimpleContainer( $false ) )
    OpLogicalOrAnd( or ) )
HContainer(
    HSimpleContainer( $x ) ) $put $into`
        );
        testCmd(
            'put 2 > 3 \n into \n x',
            'parses'
        );
        testCmd(
            'put 2 is a number \n into \n x',
            'parses'
        );
        testCmd(
            'put y is within z \n into \n x',
            'parses'
        );
        testCmd(
            'put y is in z \n into \n x',
            'parses'
        );
        testCmd(
            'put y & z \n into \n x',
            'parses'
        );
        testCmd(
            'put 4/5 \n into \n x',
            'parses'
        );
        testCmd(
            'put 4 div 5 \n into \n x',
            'parses'
        );
        testCmd(
            'put (1) \n into \n x',
            'parses'
        );
        testCmd(
            'put -1 \n into \n x',
            'parses'
        );
        testCmd(
            'put not true \n into \n x',
            'parses'
        );
        testCmd(
            'put first line of y \n into \n x',
            'parses'
        );
        testCmd(
            'put line 1 of y \n into \n x',
            'parses'
        );
        testCmd(
            'put line 1 to 2 of y \n into \n x',
            'parses'
        );
        testCmd(
            'put not char 1 of (char 2 of y) \n into \n x',
            'parses'
        );
});
t.test('TestLexerRemembersInitialLine', () => {
        /* if chevrotain didn't remember this,
        when there was a runtime error,
        we'd take you to the wrong line number */
        let lexer = TestParseHelpers.instance.lexer;
        let input = 'put\\\n 4\\\n into\\\n x\nput 5\\\n into y';
        let lexResult = lexer.tokenize(input);
        assertTrue(!lexResult.errors.length, `HX|${lexResult.errors[0]}`);
        assertEq(9, lexResult.tokens.length, 'HW|');
        assertEq('1,2,3,4,4,5,5,6,6', lexResult.tokens.map(o => o.startLine).join(','), 'HV|');
        assertEq('1,2,3,4,4,5,5,6,6', lexResult.tokens.map(o => o.endLine).join(','), 'HU|');
        assertEq('put,4,into,x,\n,put,5,into,y', lexResult.tokens.map(o => o.image).join(','), 'HT|');
});
t.test('TestCloneToken', () => {
        let lexer = TestParseHelpers.instance.lexer;
        let input = 'put 4 into x';
        let lexResult = lexer.tokenize(input);
        assertTrue(!lexResult.errors.length, `HS|${lexResult.errors[0]}`);
        assertEq(4, lexResult.tokens.length, 'HR|');
        assertEq('put,4,into,x', lexResult.tokens.map(o => o.image).join(','), 'HQ|');

        /* check that the properties we copy over in
        cloneToken are the same that the real lexer produces */
        let real = lexResult.tokens[0];
        let cloned = cloneToken(real);
        let realTokenKeys = Util512.getMapKeys(real as any);
        let clonedTokenKeys = Util512.getMapKeys(cloned as any);
        realTokenKeys.sort();
        clonedTokenKeys.sort();

        /* these ones we know we can ignore, after confirming they are undefined in the real object */
        assertEq(undefined, real.isInsertedInRecovery, 'HP|');
        assertEq(undefined, real.tokenClassName, 'HO|');
        clonedTokenKeys = clonedTokenKeys.filter(k => k !== 'isInsertedInRecovery' && k !== 'tokenClassName');
        assertEqWarn(realTokenKeys.join(','), clonedTokenKeys.join(','), 'HN|');
    }
);
    

    

/**
 * helpers for testing parsing
 */
export class TestParseHelpers {
    static instance = new TestParseHelpers();
    lexer: ChvLexer;
    parser: VpcChvParser;
    visitor: VpcVisitorInterface;
    constructor() {
        [this.lexer, this.parser, this.visitor] = getParsingObjects();
        assertTrue(this.lexer, '1<|bad input');
        assertTrue(this.parser, '1;|bad input');
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
        assertTrue(!lexResult.errors.length, `1,|${lexResult.errors[0]}`);
        this.parser.input = lexResult.tokens;
        let cst = Util512.callAsMethodOnClass('parser', this.parser, sTopRule, [], false);
        let shouldCont = this.testParseRespondToErrs(sInput, sErrExpected, cst);
        if (!shouldCont) {
            return;
        }

        if (sExpected.replace(/ /g, '') !== flattened.replace(/ /g, '')) {
            UI512TestBase.warnAndAllowToContinue(`err--for ${sInput} we got \n${flattened}\n`);
        }
    }

    /**
     * respond to errors coming from the parser.
     * return false if we should return early
     */
    protected testParseRespondToErrs(sInput: string, sErrExpected: string, cst: any) {
        if (this.parser.errors.length) {
            if (sErrExpected.length) {
                if (sErrExpected === 'GETTING') {
                    let got = this.parser.errors[0]
                        .toString()
                        .substr(0, 50)
                        .split('\r')[0]
                        .split('\n')[0];
                    UI512TestBase.warnAndAllowToContinue(`for input ${sInput} got\n${got}`);
                    return false;
                }

                assertTrue(
                    this.parser.errors[0].toString().includes( sErrExpected),
                    `1+|for input ${sInput} got different failure message, expected ${sErrExpected} ${
                        this.parser.errors
                    }`
                );

                return false;
            } else {
                assertTrue(false, `1*|for input ${sInput} got parse errors ${this.parser.errors}`);
            }
        } else {
            if (sErrExpected.length > 0) {
                assertTrue(false, `1)|for input ${sInput} expected failure but succeeded.`);
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
    return TestParseHelpers.instance.testParse(sInput, 'RuleBuiltinCmdSet', sExpected, '');
}

/**
 * wrapper around testParse, asserts that it fails with the expected message
 */
function assertFailsCmdSet(sInput: string, sErrExpected: string) {
    assertTrue(sInput.startsWith('set '), '1/|expected start with set');
    return TestParseHelpers.instance.testParse(sInput, 'RuleBuiltinCmdSet', '', sErrExpected);
}

/**
 * wrapper around testParse, for an arbitrary command
 * we'll get the rule name by extracting the first word from sInput
 */
function testCmd(sInput: string, sExpected: string) {
    let sCmd = sInput.split(' ')[0];
    assertTrue(sInput.startsWith(sCmd + ' '), '1.|expected start with ' + sCmd);
    let firstCapital = sCmd[0].toUpperCase() + sCmd.slice(1).toLowerCase();
    firstCapital = firstCapital === 'Go' ? 'GoCard' : firstCapital;
    return TestParseHelpers.instance.testParse(sInput, 'RuleBuiltinCmd' + firstCapital, sExpected, '');
}

/**
 * wrapper around testParse, asserts that it fails with the expected message
 */
function assertFailsCmd(sInput: string, sErrExpected: string) {
    let sCmd = sInput.split(' ')[0];
    assertTrue(sInput.startsWith(sCmd + ' '), '1-|expected start with ' + sCmd);
    let firstCapital = sCmd[0].toUpperCase() + sCmd.slice(1).toLowerCase();
    firstCapital = firstCapital === 'Go' ? 'GoCard' : firstCapital;
    return TestParseHelpers.instance.testParse(sInput, 'RuleBuiltinCmd' + firstCapital, '', sErrExpected);
}
