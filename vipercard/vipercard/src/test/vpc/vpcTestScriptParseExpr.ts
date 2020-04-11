
/* auto */ import { TestParseHelpers } from './vpcTestScriptParseCmd';
/* auto */ import { cProductName } from './../../ui512/utils/util512Productname';
/* auto */ import { last, longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * test parsing an expression
 */
let t = new SimpleUtil512TestCollection('testCollectionvpcScriptParseExpr');
export let testCollectionvpcScriptParseExpr = t;

t.test('ScriptParseExpr.Simple Expressions', () => {
    testExp('4', 'parses');
    testExp('1+2', 'parses');
    testExp('1 + 2', 'parses');
    testExp('011  +  02.2', 'parses');
    testExp('11  +  (2 * 3)', 'parses');
    testExp('11  *  (2 + 3)', 'parses');
});
t.test('ScriptParseExpr.lexing should take care of this', () => {
    testExp('1 + \\\n2', 'parses');
    testExp('1 + \\\n\\\n2', 'parses');
    testExp('1 + \\\n    \\\n2', 'parses');
    assertFailsParseExp('1 + \n 2', 'NoViableAltException: Expecting: one of these');
    assertFailsParseExp('1 + \\\n\n 2', 'NoViableAltException: Expecting: one of these');
});
t.test('ScriptParseUnaryMinusAndSubtraction', () => {
    testExp('1-2-3', 'parses');
    testExp('1 - 2 - 3', 'parses');
    testExp('1.0-2.0-3.0', 'parses');
    testExp('(1)-(2)-(3)', 'parses');
    testExp('(1)- -(2)- -(3)', 'parses');
    testExp('- 1 - - 2 - - 3- -4', 'parses');
});
t.test('ScriptParseExpr.EveryLevelOfExpression', () => {
    testExp('true and false', 'parses');
    testExp('true and false or true', 'parses');
    testExp('1 > 2', 'parses');
    testExp('1 > 2 != 3', 'parses');
    testExp('x contains y', 'parses');
    testExp('x contains y contains z', 'parses');
    testExp('x is not a number', 'parses');
    testExp('x is not a number is a point', 'parses');
    testExp('1 is not in 2', 'parses');
    testExp('1 is not in 2 is in 3', 'parses');
    testExp('x is not within y', 'parses');
    testExp('x is not within y is within z', 'parses');
    testExp('1 is not 2', 'parses');
    testExp('1 is not 2 is 3', 'parses');
    testExp('x && y', 'parses');
    testExp('x && y & z', 'parses');
    testExp('1 + 2', 'parses');
    testExp('1 + 2 - 3', 'parses');
    testExp('1 * 2', 'parses');
    testExp('1 * 2 / 3', 'parses');
    testExp('not true', 'parses');
    testExp('- (1)', 'parses');
});
t.test('ScriptParseExpr.expressions that should fail', () => {
    /* cases that should fail */
    assertFailsParseExp(`(1`, `MismatchedTokenException: Expecting token of type `);
    assertFailsParseExp(`1(`, `NotAllInputParsedException: Redundant input, expec`);
    assertFailsParseExp(`1*`, `NoViableAltException: Expecting: one of these poss`);
    assertFailsParseExp(`1-`, `NoViableAltException: Expecting: one of these poss`);
    assertFailsParseExp(`1()`, `NotAllInputParsedException: Redundant input, expec`);
    assertFailsParseExp(`()1`, `NoViableAltException: Expecting: one of these poss`);
    assertFailsParseExp(`()`, `NoViableAltException: Expecting: one of these poss`);
    assertFailsParseExp(``, `NoViableAltException: Expecting: one of these poss`);

    /* we don't want two consecutive TkIdentifiers to be a valid expression, */
    /* not that important but it makes parsing more streamlined. */
    assertFailsParseExp(
        `var1 var2`,
        `NotAllInputParsedException: Redundant input, expec`
    );

    /* we don't want points to be a valid expression in general, */
    /* I just think it's a good idea */
    assertFailsParseExp(`1, 2`, `NotAllInputParsedException: Redundant input, expec`);
    assertFailsParseExp(
        `var1, var2`,
        `NotAllInputParsedException: Redundant input, expec`
    );
    assertFailsParseExp(`(1, 2)`, `MismatchedTokenException: Expecting token of type `);
    assertFailsParseExp(
        `(1, 2, 3)`,
        `MismatchedTokenException: Expecting token of type `
    );

    /* let's not accept these either */
    assertFailsParseExp(`1 2`, `NotAllInputParsedException: Redundant input, expec`);
    assertFailsParseExp(`1 2 3`, `NotAllInputParsedException: Redundant input, expec`);
    assertFailsParseExp(`(1 2)`, `MismatchedTokenException: Expecting token of type `);
    assertFailsParseExp(`(1 2 3)`, `MismatchedTokenException: Expecting token of type `);
});
t.test('ScriptParseExpr.expression precedence, lvl0 to higher', () => {
    /* for 1+2*3 */
    /* I call this "lower to higher", the first operator in the input string ("+") is done last. */
    /* for 1*2+3 */
    /* I call this "higher to lower", the first operator in the input string ("*") is done first. */
    testExp('1 and 2 is not a number', 'parses');
    testExp('1 and 2 mod 3', 'parses');
    testExp('not 1 and 2', 'parses');
});
t.test('ScriptParseExpr.expression precedence, lvl 1 to higher', () => {
    testExp('1 > 2 is within "a"', 'parses');
    testExp('1 > 2 && "a"', 'parses');
    testExp('not 1>2', 'parses');
});
t.test('ScriptParseExpr.expression precedence, lvl 1 to lower', () => {
    testExp('1 > 2 and 3', 'parses');
});
t.test('ScriptParseExpr.expression precedence, lvl 2 to higher', () => {
    testExp('1 is in 2 + 3', 'parses');
    testExp('1 is 2 mod 3', 'parses');
    /* path "is a number" terminates, confirmed is consisent with the emulator. */
    assertFailsParseExp(
        `1 is a number & 2`,
        `NotAllInputParsedException: Redundant input, expecting EOF`
    );
});
t.test('ScriptParseExpr.expression precedence, lvl 2 to lower', () => {
    testExp('1 is a number > 2', 'parses');
    testExp('1 is in 2 contains 3', 'parses');
    testExp('1 is 2 or 3', 'parses');
});
t.test('ScriptParseExpr.expression precedence, lvl 3 to higher', () => {
    testExp(`"a" && "b" + 1`, 'parses');
    testExp(`"a" & "b" div 1`, 'parses');
});
t.test('ScriptParseExpr.expression precedence, lvl 3 to lower', () => {
    testExp(`"a" && "b" is a number`, 'parses');
    testExp(`("a" is a number) && "b"`, 'parses');
    testExp(`"a" & "b" > 1`, 'parses');
});
t.test('ScriptParseExpr.expression precedence, lvl 4 to higher', () => {
    testExp(`1 + 2 * 3`, 'parses');
    testExp(`1 - 2 div 3`, 'parses');
});
t.test('ScriptParseExpr.expression precedence, lvl 4 to lower', () => {
    testExp(`1 + 2 is 3`, 'parses');
    testExp(`1 - 2 is within 3`, 'parses');
});
t.test('ScriptParseExpr.expression precedence, lvl 5 to higher', () => {
    testExp(`not 1 * 2`, 'parses');
    testExp(`- 1 mod 2`, 'parses');
    testExp(`1 * sin(2)`, 'parses');
    testExp(`1 * the result`, 'parses');
    testExp(`1 * the result * 2`, 'parses');
});
t.test('ScriptParseExpr.expression precedence, level 5 to lower', () => {
    testExp(`1 * 2 + 3`, 'parses');
    testExp(`1 / 2 contains 3`, 'parses');
});
t.test('ScriptParseExpr.expression precedence, above level 5', () => {
    testExp(`1 * style of cd btn "a"`, 'parses');
    testExp(`1 & the style of cd btn var & 2`, 'parses');
    testExp(`1 & the length of var & 2`, 'parses');
});
t.test('exp precedence', () => {
    t.say(
        longstr(`ScriptParseExpr.expression
        precedence, the btn name is a Lvl6Expression, confirmed in emulator`)
    );
    testExp(`cd btn 1 + 1`, 'parses');
    testExp(`not there is a cd btn the number of cds + 1`, 'parses');
});
t.test('ScriptParseExpr.expression precedence, high-level precedence', () => {
    testExp(`cd fld 1`, 'parses');
    testExp(`cd fld 1 of cd (cd fld 1)`, 'parses');
    testExp(`cd fld 1 of cd the result + 1`, 'parses');
    testExp(`char 1 of "a" + 2`, 'parses');
    testExp(`char (1 + 2) of "a" + 3`, 'parses');
    testExp(`char (char 1 of "a") of "b"`, 'parses');
    testExp(`char (char 1 of (char 2 of "a")) of "b"`, 'parses');
    testExp(`char (char (char 1 of "a") of "b") of "c"`, 'parses');
});
t.test('ScriptParseExpr.parts of expressions, HChunk', () => {
    testExp(`word 1 of "a"`, 'parses');
    testExp(`word 1 to 2 of "a"`, 'parses');
    testExp(`word (1+2) of "a"`, 'parses');
    testExp(`word (1+2) to (3+4) of "a"`, 'parses');
    testExp(`word 1 of (word 2 of "a")`, 'parses');
    testExp(`first word of "a"`, 'parses');
    testExp(`fifth word of "a"`, 'parses');
});
t.test('ScriptParseExpr.parts of expressions, Lvl6Expression', () => {
    testExp(`(1)`, 'parses');
    testExp(`("a")`, 'parses');
    testExp(`((1))`, 'parses');
    testExp(`(((1)))`, 'parses');
});
t.test('ScriptParseExpr.parts of expressions, ExprGetProperty', () => {
    testExp(`prop of this cd`, 'parses');
    testExp(`the prop of this cd`, 'parses');
    testExp(`long prop of this cd`, 'parses');
    testExp(`the long prop of this cd`, 'parses');
    testExp(`id of this cd`, 'parses');
    testExp(`the id of this cd`, 'parses');
    testExp(`prop of word 1 of cd fld 2`, 'parses');
    testExp(`prop of word 1 to 2 of cd fld 3`, 'parses');
    testExp(`prop of cd fld 1`, 'parses');
    testExp(`prop of cd btn 1`, 'parses');
});
t.test('ScriptParseExpr.parts of expressions, Object corner-cases', () => {
    testExp(`prop of the target`, 'parses');
    testExp(`prop of target`, 'parses');
    testExp(`prop of ${cProductName}`, 'parses');
    testExp(`prop of me`, 'parses');
});
t.test(
    `testScriptParseExpr.parts of expressions, cards/bgs can't stand alone as an expression`,
    () => {
        assertFailsParseExp(`cd 1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(
            `this cd`,
            `NotAllInputParsedException: Redundant input, expec`
        );
        assertFailsParseExp(
            `(cd 1)`,
            `NoViableAltException: Expecting: one of these poss`
        );
        assertFailsParseExp(
            `(this cd)`,
            `MismatchedTokenException: Expecting token of type `
        );
        assertFailsParseExp(`bg 1`, `NoViableAltException: Expecting: one of these poss`);
        assertFailsParseExp(
            `this bg`,
            `NotAllInputParsedException: Redundant input, expec`
        );
        assertFailsParseExp(
            `(bg 1)`,
            `NoViableAltException: Expecting: one of these poss`
        );
        assertFailsParseExp(
            `(this bg)`,
            `MismatchedTokenException: Expecting token of type `
        );

        /* this will fail at a later stage, right now thinks target() is a function */
        /* assertFailsParseExp(#the target#, ##) */
        /* assertFailsParseExp(#(the target)#, ##) */
    }
);
t.test('parts of exp', () => {
    t.say(`ScriptParseExpr.parts of expressions,
        Fields (they are 'containers' and as such can stand alone)`);
    testExp(`cd fld 1`, 'parses');
    testExp(`cd fld id 1`, 'parses');
    testExp(`card field "a"`, 'parses');
    testExp(`card field "a" & "b"`, 'parses');
    testExp(`bg fld 1`, 'parses');
    testExp(`bg fld id 1`, 'parses');
    testExp(`background fld 1`, 'parses');
    testExp(`background fld id 1`, 'parses');
    testExp(`cd fld 1 of cd 2`, 'parses');
    testExp(`cd fld id 1 of cd id 2`, 'parses');
});
t.test('ScriptParseExpr parts', () => {
    t.say(
        longstr(
            `testScriptParseExpr.parts of expressions,
            Buttons (they are 'containers' and as such can stand alone)`
        )
    );
    testExp(`cd btn 1`, 'parses');
    testExp(`cd btn id 1`, 'parses');
    testExp(`card button "a"`, 'parses');
    testExp(`card button "a"`, 'parses');
    testExp(`bg btn 1`, 'parses');
    testExp(`bg btn id 1`, 'parses');
    testExp(`background btn 1`, 'parses');
    testExp(`background btn id 1`, 'parses');
    testExp(`cd btn 1 of cd 2`, 'parses');
    testExp(`cd btn id 1 of cd id 2`, 'parses');
});
t.test('ScriptParseExpr.parts of', () => {
    t.say(
        longstr(`ScriptParseExpr.parts of
        expressions, we require the cd or btn prefix.`)
    );
    assertFailsParseExp(`btn 1`, `NoViableAltException: Expecting: one of these poss`);
    assertFailsParseExp(
        `prop of btn 1`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsParseExp(`fld 1`, `NoViableAltException: Expecting: one of these poss`);
    assertFailsParseExp(
        `prop of fld 1`,
        `NoViableAltException: Expecting: one of these poss`
    );
});
t.test('ScriptParseExpr.parts of expressions, Cards', () => {
    testExp(`prop of cd 1`, 'parses');
    testExp(`prop of cd id 1`, 'parses');
    testExp(`prop of first cd`, 'parses');
    testExp(`prop of last cd`, 'parses');
    testExp(`prop of prev cd`, 'parses');
    testExp(`prop of next cd`, 'parses');
});
t.test('ScriptParseExpr.parts of expressions, Bkgnds', () => {
    testExp(`prop of bg 1`, 'parses');
    testExp(`prop of bg id 1`, 'parses');
    testExp(`prop of first bg`, 'parses');
    testExp(`prop of last bg`, 'parses');
    testExp(`prop of prev bg`, 'parses');
    testExp(`prop of next bg`, 'parses');
});
t.test('ScriptParseExpr.parts of expressions, Stacks', () => {
    testExp(`prop of this stack`, 'parses');
    testExp(`there is a this stack`, 'parses');
});
t.test(
    `testScriptParseExpr.parts of expressions, you can't refer to other stacks`,
    () => {
        assertFailsParseExp(
            `prop of stack`,
            `NoViableAltException: Expecting: one of these poss`
        );
        assertFailsParseExp(
            `there is a stack`,
            `NoViableAltException: Expecting: one of these poss`
        );
        assertFailsParseExp(
            `prop of stack "a"`,
            `NoViableAltException: Expecting: one of these poss`
        );
        assertFailsParseExp(
            `there is a stack "a"`,
            `NoViableAltException: Expecting: one of these poss`
        );
    }
);
t.test('ScriptParseExpr1', () => {
    t.say(
        longstr(`ScriptParseExpr.parts of
        expressions, other possible HSimpleContainers`)
    );
    testExp(`1 + cd fld "a"`, 'parses');
    testExp(`cd fld "a" + 1`, 'parses');
});
t.test('ScriptParseFunctionCalls length', () => {
    testExp(`the length of "a"`, 'parses');
    testExp(`the length of "a" + 1`, 'parses');
    testExp(`length("a")`, 'parses');
    testExp(`the length("a")`, 'parses');
    testExp(`char (length("a")) of "b"`, 'parses');
});
t.test('ScriptParseFunctionCalls fn call with no args', () => {
    testExp(`time()`, 'parses');
    testExp(`time ()`, 'parses');
    testExp(`time \\\n ()`, 'parses');
    testExp(`(time())`, 'parses');
    testExp(`the time()`, 'parses');
    testExp(`not time()`, 'parses');
    testExp(`not the time()`, 'parses');
    testExp(`the target`, 'parses');
    testExp(`the long target`, 'parses');
});
t.test('ScriptParseFunctionCalls ensure that invalid fn calls are rejected', () => {
    assertFailsParseExp(
        `time() time()`,
        `NotAllInputParsedException: Redundant input, expec`
    );
    assertFailsParseExp(`time() 1`, `NotAllInputParsedException: Redundant input, expec`);
    assertFailsParseExp(`1 time()`, `NotAllInputParsedException: Redundant input, expec`);
    assertFailsParseExp(`1.23()`, `NotAllInputParsedException: Redundant input, expec`);
    assertFailsParseExp(`the ()`, `NoViableAltException: Expecting: one of these poss`);
    assertFailsParseExp(`+ ()`, `NoViableAltException: Expecting: one of these poss`);
    assertFailsParseExp(`the long target()`, `Redundant input, expecting EOF`);
});
t.test('ScriptParseFunctionCalls arguments', () => {
    testExp(`time(f1())`, 'parses');
    testExp(`time((1))`, 'parses');
    testExp(`time(1,2)`, 'parses');
    testExp(`time(1*2,3)`, 'parses');
    testExp(`time(not 1,3)`, 'parses');
    testExp(`time(1,2,3)`, 'parses');
    testExp(`f1(f2(1,2))`, 'parses');
    testExp(`f1(1,f2(2,3),4)`, 'parses');
});
t.test(`testScriptParseFunctionCalls arguments aren't given correctly`, () => {
    assertFailsParseExp(
        `f1(1,f2(2,3)),4`,
        `NotAllInputParsedException: Redundant input, expec`
    );
    assertFailsParseExp(`f1((1,2)`, `MismatchedTokenException: Expecting token of type `);
    assertFailsParseExp(`f1(1 2)`, `MismatchedTokenException: Expecting token of type `);
    assertFailsParseExp(
        `f1(1 2 3)`,
        `MismatchedTokenException: Expecting token of type `
    );
});
t.test('ScriptParseFunctionCalls allowed without parens', () => {
    testExp(`the target`, 'parses');
    testExp(`the long target`, 'parses');
    testExp(`the long target + 1`, 'parses');
    testExp(`the params`, 'parses');
    testExp(`the paramcount`, 'parses');
    testExp(`not the paramcount + 1`, 'parses');

    assertFailsParseExp(
        `the target params`,
        `NotAllInputParsedException: Redundant input, expec`
    );
});
t.test('ScriptParseFunctionCalls1', () => {
    t.say(
        longstr(`ScriptParseFunctionCalls but
        parens are ok too if you want, as long as there is no adjective`)
    );
    testExp(`the target()`, 'parses');
    testExp(`the params()`, 'parses');
    testExp(`the paramcount()`, 'parses');
    testExp(`not the paramcount() + 1`, 'parses');
});
t.test('ScriptParseFunctionCalls number of', () => {
    testExp(`the number of words of "a"`, 'parses');
    testExp(`the number of words of "a" && "b"`, 'parses');
    testExp(`the number of chars in "a"`, 'parses');
    testExp(`the number of items in "a"`, 'parses');
    testExp(`the number of cd btns`, 'parses');
    testExp(`the number of cd flds`, 'parses');
    testExp(`the number of bg btns`, 'parses');
    testExp(`the number of bg flds`, 'parses');
});
t.test('ScriptParseFunctionCalls invalid "number of" syntax', () => {
    assertFailsParseExp(
        `the number of btns`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsParseExp(
        `the number of flds`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsParseExp(
        `the number of cd cds`,
        `NotAllInputParsedException: Redundant input, expec`
    );
    assertFailsParseExp(
        `the number of cd x`,
        `NotAllInputParsedException: Redundant input, expec`
    );
    assertFailsParseExp(
        `the number of x in "a"`,
        `NoViableAltException: Expecting: one of these poss`
    );
});
t.test('ScriptParseFunctionCalls number of, nested', () => {
    testExp(`the number of cds`, 'parses');
    testExp(`the number of cds of bg 1`, 'parses');
    testExp(`the number of cds of bg 1 of this stack`, 'parses');
    testExp(`the number of cds of this stack`, 'parses');
    testExp(`the number of bgs`, 'parses');
    testExp(`the number of bgs of this stack`, 'parses');
});
t.test('ScriptParseFunctionCalls number of, invalid', () => {
    assertFailsParseExp(
        `the long number of cds`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsParseExp(
        `the number of this stack`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsParseExp(
        `the number of cd bg 1`,
        `NotAllInputParsedException: Redundant input, expec`
    );
    assertFailsParseExp(
        `the number of words of bg 1`,
        `NoViableAltException: Expecting: one of these poss`
    );
});
t.test('ScriptParse There-is-a', () => {
    testExp(`there is a cd 1`, 'parses');
    testExp(`there is a cd x`, 'parses');
    testExp(`there is a cd btn 1`, 'parses');
    testExp(`there is a cd btn x`, 'parses');
    testExp(`there is a this stack`, 'parses');
    testExp(`there is a me`, 'parses');
    testExp(`there is a target`, 'parses');
    testExp(`there is a the target`, 'parses');
    testExp(`there is a ${cProductName}`, 'parses');
});
t.test('ScriptParse Invalid There-is-a, we require "cd btn", not "btn" alone', () => {
    assertFailsParseExp(
        `there is a btn 1`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsParseExp(
        `there is a (cd 1)`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsParseExp(
        `there is a (cd btn 1)`,
        `NoViableAltException: Expecting: one of these poss`
    );
    assertFailsParseExp(
        `there is a (cd fld 1)`,
        `NoViableAltException: Expecting: one of these poss`
    );
});
t.test('ScriptParse1', () => {
    t.say(longstr(`ScriptParse there is not a`));
    testExp(`there is not a card 1`, 'parses');
    testExp(`there is not a card x`, 'parses');

    assertFailsParseExp(
        `there is not cd btn 1`,
        `MismatchedTokenException: Expecting token of type `
    );
    assertFailsParseExp(
        `there not cd btn 1`,
        `MismatchedTokenException: Expecting token of type `
    );
});
t.test('testScriptParseExpr.get rect property', () => {
    testExp(`the rect of cd btn "p1"`, 'parses');
    testExp(`the rect of bg btn "p1"`, 'parses');
});

/**
 * wrapper around testParse, for testing parsing an expression
 * uses the get command,
 * and then strips the get command out of the output as well
 */
function testExp(sInput: string, sExpected: string) {
    return TestParseHelpers.instance.testParse(
        'get ' + sInput,
        'RuleBuiltinCmdGet',
        sExpected,
        ''
    );
}

/**
 * wrapper around testParse, asserts that it fails with the expected message
 */
function assertFailsParseExp(sInput: string, sErrExpected: string) {
    return TestParseHelpers.instance.testParse(
        'get ' + sInput,
        'RuleBuiltinCmdGet',
        '',
        sErrExpected
    );
}
