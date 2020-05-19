
/* auto */ import { BatchType, ScriptTestBatch, TestMultiplier, TestMultiplierInvert, TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { O, cAltProductName, cProductName, vpcVersion } from './../../ui512/utils/util512Base';
/* auto */ import { assertEq, assertWarnEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { UI512FldStyle } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { TextFontSpec, TextFontStyling, specialCharFontChange } from './../../ui512/drawtext/ui512DrawTextClasses';
/* auto */ import { UI512DrawText } from './../../ui512/drawtext/ui512DrawText';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';
/* auto */ import { HigherNoReplication_TestOnly } from './../util512ui/testUI512Elements';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * test running ViperCard scripts that evaluate expressions.
 *
 * the syntax for a "test batch" is a tuple
 * [{script expression}, {expected result}]
 * for example, the following test passes:
 * ['1 + 1', '2']
 *
 * if you are testing a more complex expression or
 * command, you can write multiple lines, and use \\
 * at the end of the string to indicate what should be compared,
 * for example,
 *  ['put 1 + 1 into x\\x', '2']
 *
 *  or even
 *  ['put 1 into a \n put a + 1 into x\\x', '2']
 * the \\x means to evaluate x and compare it with 2.
 *
 *
 * use testBatchEvalInvertAndCommute to comfirm all four permutations,
 * since if a == b, we also confirm that
 * b == a, a != b, and b != a
 */

let t = new SimpleUtil512TestCollection('testCollectionvpcScriptEval');
export let testCollectionvpcScriptEval = t;

let h = YetToBeDefinedTestHelper<TestVpcScriptRunBase>();
let higher = new HigherNoReplication_TestOnly();

t.atest('--init--vpcTestScriptExprLvl', async () => {
    h = new TestVpcScriptRunBase(t);
    return h.initEnvironment();
});

t.test('getProp', () => {
    let b = new ScriptTestBatch();

    /* object resolution */
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);

    /* invalid */
    b.t(`the short id of xyz`, `ERR:no variable`);
    b.t(`the short id of the xyz`, `ERR:no such function`);

    /* target, me, productOpts have different behavior
        confirmed these in emulator */
    b.t(`the short id of the target`, `${h.ids.go}`);
    b.t(`the short id of target`, `${h.ids.go}`);
    b.t(`put 1 into target\\0`, `ERR:writing text to`);
    b.t(`the short id of target()`, `ERR:parse err`);
    b.t(`the short id of (target())`, `ERR:no such function`);
    /* tries to pull its contents */
    b.t(`the short id of (target)`, `ERR:only support reading text`);
    b.t(`the short id of the me`, `ERR:parse err`);
    b.t(`the short id of me()`, `ERR:parse err`);
    b.t(`the short id of (me)`, `ERR:parse err`);
    b.t(`the short id of me`, `${h.ids.go}`);
    b.t(`the short id of ${cProductName}`, `WILD`);
    b.t(`the short id of ${cAltProductName}`, `WILD`);

    /* stack */
    b.t(`the short id of this stack`, `921`);
    b.t(`the short id of previous stack`, `ERR:could not find`);
    b.t(`the short id of next stack`, `ERR:could not find`);
    b.t(`the short id of stack 1`, `921`);
    b.t(`the short id of stack 6`, 'ERR:could not find');
    b.t(`the short id of stack "teststack"`, `921`);
    b.t(`the short id of stack "other"`, `ERR:could not find`);
    b.t(`the short id of stack id 921`, `921`);
    b.t(`the short id of stack id 600`, `ERR:could not find`);
    b.t(`the short id of stack id ${h.ids.bgA}`, `ERR:could not find`);

    /* bg absolute */
    b.t(`the short id of bg id ${h.ids.bgA}`, `${h.ids.bgA}`);
    b.t(`the short id of bg id ${h.ids.bgC}`, `${h.ids.bgC}`);
    b.t(`the short id of bg id (${h.ids.bgC})`, `${h.ids.bgC}`);
    b.t(`the short id of bg id 99`, `ERR:could not find`);
    b.t(`the short id of bg "a"`, `${h.ids.bgA}`);
    b.t(`the short id of bg "c"`, `${h.ids.bgC}`);
    b.t(`the short id of bg ("c")`, `${h.ids.bgC}`);
    b.t(`the short id of bg ""`, `ERR:could not find`);
    b.t(`the short id of bg "notfound"`, `ERR:could not find`);
    b.t(`the short id of bg 1`, `${h.ids.bgA}`);
    b.t(`the short id of bg 3`, `${h.ids.bgC}`);
    b.t(`the short id of bg (3)`, `${h.ids.bgC}`);
    b.t(`the short id of bg -1`, `ERR:could not find`);
    b.t(`the short id of bg 5`, `ERR:could not find`);

    /* bg relative */
    b.t(`the short id of this bg`, `${h.ids.bgB}`);
    b.t(`the short id of next bg`, `${h.ids.bgC}`);
    b.t(`the short id of first bg`, `${h.ids.bgA}`);
    b.t(`the short id of last bg`, `${h.ids.bgC}`);
    b.t(`the short id of the first bg`, `${h.ids.bgA}`);
    b.t(`the short id of the second bg`, `${h.ids.bgB}`);
    b.t(`the short id of the next bg`, `${h.ids.bgC}`);
    b.t(`the short id of xyz bg`, `ERR:parse error`);
    b.t(`the short id of the xyz bg`, `ERR:parse error`);

    /* bg with parent */
    b.t(`the short id of bg id ${h.ids.bgA} of this stack`, `${h.ids.bgA}`);
    b.t(`the short id of bg 1 of this stack`, `${h.ids.bgA}`);
    b.t(`the short id of bg "a" of this stack`, `${h.ids.bgA}`);
    b.t(`the short id of this bg of this stack`, `${h.ids.bgB}`);

    /* card absolute */
    b.t(`the short id of card id ${h.ids.cdA}`, `${h.ids.cdA}`);
    b.t(`the short id of card id ${h.ids.cdCD}`, `${h.ids.cdCD}`);
    b.t(`the short id of card id (${h.ids.cdCD})`, `${h.ids.cdCD}`);
    b.t(`the short id of card id 99`, `ERR:could not find`);
    b.t(`the short id of card "a"`, `${h.ids.cdA}`);
    b.t(`the short id of card "d"`, `${h.ids.cdBD}`);
    b.t(`the short id of card ("d")`, `${h.ids.cdBD}`);
    b.t(`the short id of card ""`, `ERR:could not find`);
    b.t(`the short id of card "notfound"`, `ERR:could not find`);
    b.t(`the short id of card 1`, `${h.ids.cdA}`);
    b.t(`the short id of card 3`, `${h.ids.cdBC}`);
    b.t(`the short id of card (3)`, `${h.ids.cdBC}`);
    b.t(`the short id of card -1`, `ERR:could not find`);
    b.t(`the short id of card 99`, `ERR:could not find`);

    /* card relative */
    b.t(`the short id of this card`, `${h.ids.cdBC}`);
    b.t(`the short id of next card`, `${h.ids.cdBD}`);
    b.t(`the short id of first card`, `${h.ids.cdA}`);
    b.t(`the short id of last card`, `${h.ids.cdCD}`);
    b.t(`the short id of the first card`, `${h.ids.cdA}`);
    b.t(`the short id of the second card`, `${h.ids.cdBB}`);
    b.t(`the short id of the next card`, `${h.ids.cdBD}`);
    b.t(`the short id of xyz card`, `ERR:parse err`);
    b.t(`the short id of the xyz card`, `ERR:parse err`);

    /* card with parent */
    b.t(`the short id of card "d" of this bg`, `${h.ids.cdBD}`);
    b.t(`the short id of card "d" of bg "c"`, `${h.ids.cdCD}`);
    b.t(`the short id of card "d" of bg 3`, `${h.ids.cdCD}`);
    b.t(`the short id of card 1 of this bg`, `${h.ids.cdBB}`);
    b.t(`the short id of card 1 of bg 2`, `${h.ids.cdBB}`);
    b.t(`the short id of card 1 of bg 3`, `${h.ids.cdCD}`);
    b.t(`the short id of card 2 of bg 2`, `${h.ids.cdBC}`);
    b.t(`the short id of card 2 of bg 1`, `ERR:could not find`);
    b.t(`the short id of card "d" of this bg of this stack`, `${h.ids.cdBD}`);

    /* field */
    b.t(`the short id of cd fld id ${h.ids.fBC1}`, `${h.ids.fBC1}`);
    b.t(`the short id of cd fld id ${h.ids.fCD1}`, `${h.ids.fCD1}`);
    b.t(`the short id of cd fld id (${h.ids.fCD1})`, `${h.ids.fCD1}`);
    b.t(`the short id of cd fld id 99`, `ERR:could not find`);
    b.t(`the short id of cd fld "p1"`, `${h.ids.fBC1}`);
    b.t(`the short id of cd fld "p2"`, `${h.ids.fBC2}`);
    b.t(`the short id of cd fld ("p2")`, `${h.ids.fBC2}`);
    b.t(`the short id of cd fld "notfound"`, `ERR:could not find`);
    b.t(`the short id of cd fld 1`, `${h.ids.fBC1}`);

    /* field with parent */
    b.t(`the short id of cd fld id ${h.ids.fBC1} of this cd`, `${h.ids.fBC1}`);
    /* can't find even though it exists, wrong card parent */
    b.t(`the short id of cd fld id ${h.ids.fCD1} of this cd`, `ERR:could not find`);
    b.t(`the short id of cd fld "p1" of cd 1`, `ERR:could not find`);
    b.t(`the short id of cd fld "p1" of this cd`, `${h.ids.fBC1}`);
    b.t(`the short id of cd fld "p1" of fifth cd`, `${h.ids.fCD1}`);
    b.t(`the short id of cd fld "p1" of cd 4`, `${h.ids.fBD1}`);
    b.t(`the short id of cd fld "p1" of cd "d"`, `${h.ids.fBD1}`);
    b.t(`the short id of cd fld "p1" of cd "d" of bg 3`, `${h.ids.fCD1}`);
    b.t(`the short id of cd fld "p1" of cd "d" of bg 3 of this stack`, `${h.ids.fCD1}`);

    /* button */
    b.t(`the short id of cd btn id ${h.ids.bBC1}`, `${h.ids.bBC1}`);
    b.t(`the short id of cd btn id ${h.ids.bCD1}`, `${h.ids.bCD1}`);
    b.t(`the short id of cd btn id (${h.ids.bCD1})`, `${h.ids.bCD1}`);
    b.t(`the short id of cd btn id 99`, `ERR:could not find`);
    b.t(`the short id of cd btn "p1"`, `${h.ids.bBC1}`);
    b.t(`the short id of cd btn "p2"`, `${h.ids.bBC2}`);
    b.t(`the short id of cd btn ("p2")`, `${h.ids.bBC2}`);
    b.t(`the short id of cd btn "notfound"`, `ERR:could not find`);
    b.t(`the short id of cd btn 1`, `${h.ids.bBC1}`);

    /* button with parent */
    b.t(`the short id of cd btn id ${h.ids.bBC1} of this cd`, `${h.ids.bBC1}`);
    /* can't find even though it exists, wrong card parent */
    b.t(`the short id of cd btn id ${h.ids.bCD1} of this cd`, `ERR:could not find`);
    b.t(`the short id of cd btn "p1" of cd 1`, `ERR:could not find`);
    b.t(`the short id of cd btn "p1" of this cd`, `${h.ids.bBC1}`);
    b.t(`the short id of cd btn "p1" of fifth cd`, `${h.ids.bCD1}`);
    b.t(`the short id of cd btn "p1" of cd 4`, `${h.ids.bBD1}`);
    b.t(`the short id of cd btn "p1" of cd "d"`, `${h.ids.bBD1}`);
    b.t(`the short id of cd btn "p1" of cd "d" of bg 3`, `${h.ids.bCD1}`);
    b.t(`the short id of cd btn "p1" of cd "d" of bg 3 of this stack`, `${h.ids.bCD1}`);
    b.batchEvaluate(h);
});
t.test('vpcProperties', () => {
    let b = new ScriptTestBatch();

    /* basic type checking */
    b.t('set the scroll of cd fld "p1" to ""\\0', 'ERR:expected an integer');
    b.t('set the scroll of cd fld "p1" to "10a"\\0', 'ERR:expected an integer');
    b.t('set the scroll of cd fld "p1" to "a10"\\0', 'ERR:expected an integer');
    b.t('set the scroll of cd fld "p1" to "10.1"\\0', 'ERR:expected an integer');
    b.t('set the dontwrap of cd fld "p1" to ""\\0', 'ERR:expected true or false');
    b.t('set the dontwrap of cd fld "p1" to "true a"\\0', 'ERR:expected true or false');
    b.t('set the dontwrap of cd fld "p1" to "truea"\\0', 'ERR:expected true or false');
    b.t('set the dontwrap of cd fld "p1" to "tru"\\0', 'ERR:expected true or false');

    /* get nonexistent props */
    b.t('the notexist of cd fld "p1"', 'ERR:no such');
    b.t('the scrolla of cd fld "p1"', 'ERR:no such');
    b.t('the scrol of cd fld "p1"', 'ERR:no such');
    b.t('the style of cd 1', 'ERR:unknown property');
    b.t('the selcaret of cd btn "p1"', 'ERR:');
    b.t('the autohilite of cd fld "p1"', 'ERR:unknown property');
    b.t('the autohilite of cd btn "p1"', 'true');
    b.t('the abbr autohilite of cd btn "p1"', 'ERR:does not take an adjective');
    b.t('the short autohilite of cd btn "p1"', 'ERR:does not take an adjective');
    b.t('the long autohilite of cd btn "p1"', 'ERR:does not take an adjective');
    b.t('the abbr textsize of cd fld "p1"', 'ERR:does not take an adjective');
    b.t('the short textsize of cd fld "p1"', 'ERR:does not take an adjective');
    b.t('the long textsize of cd fld "p1"', 'ERR:does not take an adjective');
    b.t('the abbr cursor', 'ERR:does not take an adjective');
    b.t('the short cursor', 'ERR:does not take an adjective');
    b.t('the long cursor', 'ERR:does not take an adjective');

    /* set nonexistent props */
    b.t('set the notexist of cd fld "p1" to "abc"\\0', 'ERR:unknown property');
    b.t('set the scrolla of cd fld "p1" to 10\\0', 'ERR:unknown property');
    b.t('set the scrol of cd fld "p1" to 10\\0', 'ERR:unknown property');
    b.t('set the style of cd 1 to "opaque"\\0', 'ERR:unknown property');
    b.t('set the selcaret of cd btn "p1" to 100\\0', 'ERR:');
    b.t('set the autohilite of cd fld "p1" to true\\0', 'ERR:unknown property');

    /* nonsettable props */
    b.t('set the id of cd fld "p1" to 100\\0', 'ERR:unknown property');
    b.t('set the hilite of cd fld "p1" to true\\0', 'ERR:unknown property');
    b.t('set the number of cd fld "p1" to 6\\0', 'ERR:unknown property');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* product opts get */
    b.t('the xyz', 'ERR:no such function');
    b.t('the long xyz', 'ERR:no such function');
    b.t('the short xyz', 'ERR:no such function');
    b.t('the environment', 'development');
    b.t('the freesize of this stack', '0');
    b.t('the size of this stack', '0');
    b.t('size of this stack', '0');
    b.t('the stacksinuse', '');
    b.t('the suspended', 'false');
    b.t('the long version', `${vpcVersion}`);
    b.t('the version', `${vpcVersion[0]}.${vpcVersion[1]}`);

    /* product opts set */
    b.t('set the itemdelimiter to "|" \\ the itemdelimiter', '|');
    b.t('item 2 of "a|b|c"', 'b');
    b.t('set the itemdelimiter to "," \\ the itemdelimiter', ',');
    b.t('set the itemdelimiter to "" \\ 0', 'ERR:length of itemDel must be 1');
    b.t('set the itemdelimiter to ",," \\ 0', 'ERR:length of itemDel must be 1');
    b.t('set the cursor to "plus" \\ the cursor', 'plus');
    b.t('set the cursor to "arrow" \\ the cursor', 'arrow');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();
    h.setScript(h.ids.stack, 'on stackscript\nend stackscript');
    h.setScript(h.vcstate.model.stack.bgs[1].idInternal, 'on bgscript\nend bgscript');
    h.setScript(
        h.vcstate.model.stack.bgs[1].cards[1].idInternal,
        'on cdscript\nend cdscript'
    );

    /* stack get and set */
    b.t('length(the script of this stack) > 1', `true`);
    b.t('the script of this stack', `${h.vcstate.model.stack.getS('script')}`);
    b.t(
        'set the name of this stack to "newname" \\ the short name of this stack',
        'newname'
    );
    b.t(
        'set the name of this stack to "teststack" \\ the short name of this stack',
        'teststack'
    );

    /* bg get and set */
    b.t('length(the script of bg 1) == 0', `true`);
    b.t('the script of bg 1', ``);
    b.t('length(the script of bg 2) > 1', `true`);
    b.t('the script of bg 2', `${h.vcstate.model.stack.bgs[1].getS('script')}`);
    b.t('the short name of bg 2', 'b');
    b.t('set the name of bg 2 to "newname" \\ the short name of bg 2', 'newname');
    b.t('set the name of bg 2 to "b" \\ the short name of bg 2', 'b');

    /* card get and set */
    b.t('length(the script of cd 1) == 0', `true`);
    b.t('the script of cd 1', ``);
    b.t('length(the script of cd 3) > 1', `true`);
    b.t('the script of cd 3', `${h.vcstate.model.stack.bgs[1].cards[1].getS('script')}`);
    b.t('the short name of cd 3', 'c');
    b.t('set the name of cd 3 to "newname" \\ the short name of cd 3', 'newname');
    b.t('set the name of cd 3 to "c" \\ the short name of cd 3', 'c');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);

    /* size properties */
    b.t('the left of cd btn "p1"', '0');
    b.t('the top of cd btn "p1"', '0');
    b.t('the width of cd btn "p1"', '0');
    b.t('the height of cd btn "p1"', '0');
    b.t('set the rect of cd btn "p1" to 10,20,40,60\\0', '0');
    b.t('the rect of cd btn "p1"', '10,20,40,60');
    b.t('the left of cd btn "p1"', '10');
    b.t('the top of cd btn "p1"', '20');
    b.t('the width of cd btn "p1"', '30');
    b.t('the height of cd btn "p1"', '40');
    b.t('the right of cd btn "p1"', '40');
    b.t('the bottom of cd btn "p1"', '60');
    b.t('the topleft of cd btn "p1"', '10,20');
    b.t('the botright of cd btn "p1"', '40,60');
    b.t('the loc of cd btn "p1"', '25,40');

    /* plain dimensions */
    b.t('set the left of cd btn "p1" to 100\\0', '0');
    b.t('set the top of cd btn "p1" to 200\\0', '0');
    b.t('set the width of cd btn "p1" to 300\\0', '0');
    b.t('set the height of cd btn "p1" to 400\\0', '0');
    b.t('the rect of cd btn "p1"', '100,200,400,600');
    b.t('the loc of cd btn "p1"', '250,400');
    b.t('set the right of cd btn "p1" to 401\\0', '0');
    b.t('set the bottom of cd btn "p1" to 601\\0', '0');
    b.t('the rect of cd btn "p1"', '101,201,401,601');
    b.t('set the topleft of cd btn "p1" to 10,20\\0', '0');
    b.t('set the botright of cd btn "p1" to 40,60\\0', '0');
    b.t('the rect of cd btn "p1"', '10,20,40,60');

    /* test loc with even widths */
    b.t('set the rect of cd btn "p1" to 10,20,40,60\\0', '0');
    b.t('the loc of cd btn "p1"', '25,40');
    b.t('set the loc of cd btn "p1" to 26,41\\0', '0');
    b.t('the rect of cd btn "p1"', '11,21,41,61');

    /* test loc with odd widths */
    b.t('set the rect of cd btn "p1" to 10,20,41,61\\0', '0');
    b.t('the loc of cd btn "p1"', '25,40');
    b.t('set the loc of cd btn "p1" to 26,41\\0', '0');
    b.t('the rect of cd btn "p1"', '11,21,42,62');

    /* test loc with even widths */
    b.t('set the rect of cd btn "p1" to 10,20,42,62\\0', '0');
    b.t('the loc of cd btn "p1"', '26,41');
    b.t('set the loc of cd btn "p1" to 26,41\\0', '0');
    b.t('the rect of cd btn "p1"', '10,20,42,62');

    /* set name */
    b.t(`the short name of cd btn id ${h.ids.bBC1}`, 'p1');
    b.t(
        longstr(
            `set the name of cd btn id ${h.ids.bBC1} to
                "newname" \\ the short name of cd btn id ${h.ids.bBC1}`
        ),
        'newname'
    );
    b.t(
        longstr(
            `set the name of cd btn id ${h.ids.bBC1} to
                "p1" \\ the short name of cd btn id ${h.ids.bBC1}`
        ),
        'p1'
    );

    /* type checking, coords */
    b.t('set the rect of cd btn "p1" to "10,20,30,40"\\0', '0');
    b.t('the rect of cd btn "p1"', '10,20,30,40');
    b.t('set the rect of cd btn "p1" to " 10 , 20 , 30 , 40 "\\0', '0');
    b.t('the rect of cd btn "p1"', '10,20,30,40');
    b.t(
        'set the rect of cd btn "p1" to " 10 , 20.0000000001 , 29.99999999999 , 40 "\\0',
        '0'
    );
    b.t('the rect of cd btn "p1"', '10,20,30,40');
    b.t('set the rect of cd btn "p1" to 10\\0', 'ERR:Not a list of integers');
    b.t('set the rect of cd btn "p1" to 10,20\\0', 'ERR:expected 4 numbers but got 2');
    b.t('set the rect of cd btn "p1" to 10,20,30\\0', 'ERR:expected 4 numbers but got 3');
    b.t('set the rect of cd btn "p1" to "10"\\0', 'ERR:Not a list of integers');
    b.t('set the rect of cd btn "p1" to "10,20"\\0', 'ERR:expected 4 numbers but got 2');
    b.t(
        'set the rect of cd btn "p1" to "10,20,30"\\0',
        'ERR:expected 4 numbers but got 3'
    );
    b.t('set the rect of cd btn "p1" to "10,20,30,40a"\\0', 'ERR:Not a list of integers');
    b.t('set the rect of cd btn "p1" to "10,20,30a,40"\\0', 'ERR:Not a list of integers');
    b.t('set the rect of cd btn "p1" to "10,20a,30,40"\\0', 'ERR:Not a list of integers');
    b.t('set the rect of cd btn "p1" to "10a,20,30,40"\\0', 'ERR:Not a list of integers');
    b.t(
        'set the rect of cd btn "p1" to "10,20,30,40.1"\\0',
        'ERR:Not a list of integers'
    );
    b.t(
        'set the rect of cd btn "p1" to "10,20,30.1,40"\\0',
        'ERR:Not a list of integers'
    );
    b.t(
        'set the rect of cd btn "p1" to "10,20.1,30,40"\\0',
        'ERR:Not a list of integers'
    );
    b.t(
        'set the rect of cd btn "p1" to "10.1,20,30,40"\\0',
        'ERR:Not a list of integers'
    );
    b.t('set the topleft of cd btn "p1" to "10"\\0', 'ERR:Not a list of integers');
    b.t('set the topleft of cd btn "p1" to "10,20a"\\0', 'ERR:Not a list of integers');
    b.t('set the topleft of cd btn "p1" to "10a,20"\\0', 'ERR:Not a list of integers');

    /* type checking, single values */
    b.t('set the left of cd btn "p1" to "-30"\\0', '0');
    b.t('the left of cd btn "p1"', '-30');
    b.t('set the left of cd btn "p1" to " 10 "\\0', '0');
    b.t('the left of cd btn "p1"', '10');
    b.t('set the left of cd btn "p1" to "4,5"\\0', 'ERR:expected an integer');
    b.t('set the left of cd btn "p1" to ""\\0', 'ERR:expected an integer');
    b.t('set the left of cd btn "p1" to "10a"\\0', 'ERR:expected an integer');
    b.t('set the left of cd btn "p1" to "a10"\\0', 'ERR:expected an integer');
    b.t('set the left of cd btn "p1" to "10.1"\\0', 'ERR:expected an integer');

    /* run the tests again with fld instead of btn */
    class UseFldInsteadOfBtn extends TestMultiplier {
        secondTransformation(code: string, expected: string): O<[string, string]> {
            code = code
                .replace(/ cd btn /g, ' cd fld ')
                .replace(new RegExp(`${h.ids.bBC1}`, 'g'), `${h.ids.fBC1}`);
            return [code, expected];
        }
    }

    b.batchEvaluate(h, [UseFldInsteadOfBtn]);
    b = new ScriptTestBatch();

    /* btn simple get/set */
    b.t('the autohilite of cd btn "p1"', 'true');
    b.t(
        'set the autohilite of cd btn "p1" to false\\the autohilite of cd btn "p1"',
        'false'
    );
    b.t('the enabled of cd btn "p1"', 'true');
    b.t('set the enabled of cd btn "p1" to false\\the enabled of cd btn "p1"', 'false');
    b.t('the hilite of cd btn "p1"', 'false');
    b.t('set the hilite of cd btn "p1" to true\\the hilite of cd btn "p1"', 'true');
    b.t('the icon of cd btn "p1"', '0');
    b.t('set the icon of cd btn "p1" to 1\\the icon of cd btn "p1"', '1');
    b.t('the label of cd btn "p1"', '');
    b.t(
        'set the label of cd btn "p1" to "newlabel"\\the label of cd btn "p1"',
        'newlabel'
    );
    b.t('the showlabel of cd btn "p1"', 'true');
    b.t(
        'set the showlabel of cd btn "p1" to false\\the showlabel of cd btn "p1"',
        'false'
    );
    b.t('the visible of cd btn "p1"', 'true');
    b.t('set the visible of cd btn "p1" to false\\the visible of cd btn "p1"', 'false');
    b.t('the textfont of cd btn "p1"', 'chicago');
    b.t(
        'set the textfont of cd btn "p1" to "helvetica"\\the textfont of cd btn "p1"',
        'helvetica'
    );
    b.t('the textsize of cd btn "p1"', '12');
    b.t('set the textsize of cd btn "p1" to 16\\the textsize of cd btn "p1"', '16');

    /* btn validated get/set */
    b.t('the style of cd btn "p1"', 'rectangle');
    b.t('set the style of cd btn "p1" to "xyz"\\0', 'ERR:Button style');
    b.t('set the style of cd btn "p1" to "radio"\\the style of cd btn "p1"', 'radio');
    b.t('set the style of cd btn "p1" to shadow\\the style of cd btn "p1"', 'shadow');
    b.t('the textstyle of cd btn "p1"', 'plain');
    b.t('set the textstyle of cd btn "p1" to "xyz"\\0', 'ERR:unrecognized text style');
    b.t(
        'set the textstyle of cd btn "p1" to "bold,xyz"\\0',
        'ERR:unrecognized text style'
    );
    b.t(
        longstr(
            `set the textstyle of cd btn "p1" to
                "bold,italic,underline,outline,shadow,condense,extend"\\the
                textstyle of cd btn "p1"`
        ),
        'bold,italic,underline,outline,shadow,condense,extend'
    );
    b.t(
        longstr(
            `set the textstyle of cd btn "p1" to
                bold,italic,underline,outline,shadow,condense,extend\\the
                textstyle of cd btn "p1"`
        ),
        'bold,italic,underline,outline,shadow,condense,extend'
    );
    b.t(
        longstr(
            `set the textstyle of cd btn "p1" to
                " Underline , Italic , Bold "\\the textstyle of cd btn "p1"`
        ),
        'bold,italic,underline'
    );
    b.t('the textalign of cd btn "p1"', 'center');
    b.t(
        'set the textalign of cd btn "p1" to "xyz"\\0',
        'ERR:support setting text align to'
    );
    b.t(
        'set the textalign of cd btn "p1" to "left"\\the textalign of cd btn "p1"',
        'left'
    );
    b.t(
        'set the textalign of cd btn "p1" to center\\the textalign of cd btn "p1"',
        'center'
    );

    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* field simple get/set */
    b.t('the dontwrap of cd fld "p1"', 'false');
    b.t('set the dontwrap of cd fld "p1" to true\\the dontwrap of cd fld "p1"', 'true');
    b.t('the enabled of cd fld "p1"', 'true');
    b.t('set the enabled of cd fld "p1" to false\\the enabled of cd fld "p1"', 'false');
    b.t('the locktext of cd fld "p1"', 'false');
    b.t('set the locktext of cd fld "p1" to true\\the locktext of cd fld "p1"', 'true');
    b.t('the singleline of cd fld "p1"', 'false');
    b.t(
        'set the singleline of cd fld "p1" to true\\the singleline of cd fld "p1"',
        'true'
    );
    b.t('the scroll of cd fld "p1"', '0');
    b.t('set the scroll of cd fld "p1" to 1\\the scroll of cd fld "p1"', '1');
    b.t('set the scroll of cd fld "p1" to 0\\the scroll of cd fld "p1"', '0');
    b.t('the defaulttextsize of cd fld "p1"', '12');
    b.t(
        'set the defaulttextsize of cd fld "p1" to 14\\the defaulttextsize of cd fld "p1"',
        '14'
    );
    b.t('the defaulttextfont of cd fld "p1"', 'geneva');
    b.t(
        'set the defaulttextfont of cd fld "p1" to helvetica\\0',
        'ERR:no variable found'
    );
    b.t(
        longstr(
            `set the defaulttextfont of cd fld "p1" to
                "helvetica"\\the defaulttextfont of cd fld "p1"`
        ),
        'helvetica'
    );

    /* validated get/set */
    b.t('the defaulttextstyle of cd fld "p1"', 'plain');
    b.t(
        longstr(
            `set the defaulttextstyle of cd fld "p1" to
                "outline"\\the defaulttextstyle of cd fld "p1"`
        ),
        'outline'
    );
    b.t(
        longstr(
            `set the defaulttextstyle of cd fld "p1" to
                " bold , shadow , italic "\\the defaulttextstyle of cd fld "p1"`
        ),
        'bold,italic,shadow'
    );
    b.t(
        longstr(
            `set the defaulttextstyle of cd fld "p1" to
                " italic , outline, extend, bold "\\the defaulttextstyle of cd fld "p1"`
        ),
        'bold,italic,outline,extend'
    );

    b.t(
        longstr(
            `set the defaulttextstyle of cd fld "p1" to bold,
                 shadow, italic \\the defaulttextstyle of cd fld "p1"`
        ),
        'bold,italic,shadow'
    );
    b.t(
        longstr(
            `set the defaulttextstyle of cd fld "p1" to italic ,
                 outline, extend, bold \\the defaulttextstyle of cd fld "p1"`
        ),
        'bold,italic,outline,extend'
    );
    b.t(
        longstr(
            `set the defaulttextstyle of cd fld "p1" to
                 "plain"\\the defaulttextstyle of cd fld "p1"`
        ),
        'plain'
    );
    b.t(
        'set the defaulttextstyle of cd fld "p1" to ""\\0',
        'ERR:unrecognized text style'
    );
    b.t(
        'set the defaulttextstyle of cd fld "p1" to "bold,"\\0',
        'ERR:unrecognized text style'
    );
    b.t(
        'set the defaulttextstyle of cd fld "p1" to "xyz"\\0',
        'ERR:unrecognized text style'
    );
    b.t('set the defaulttextstyle of cd fld "p1" to xyz\\0', 'ERR:no variable found');
    b.t(
        'set the defaulttextstyle of cd fld "p1" to "bold, xyz"\\0',
        'ERR:unrecognized text style'
    );
    b.t(
        'set the defaulttextstyle of cd fld "p1" to bold, xyz\\0',
        'ERR:no variable found'
    );
    b.t('the textalign of cd fld "p1"', 'left');
    b.t(
        'set the textalign of cd fld "p1" to "center"\\the textalign of cd fld "p1"',
        'center'
    );
    b.t('set the textalign of cd fld "p1" to left\\the textalign of cd fld "p1"', 'left');
    b.t(
        'set the textalign of cd fld "p1" to "right"\\0',
        'ERR:currently support setting text align'
    );
    b.t(
        'set the textalign of cd fld "p1" to "xyz"\\0',
        'ERR:currently support setting text align'
    );
    b.t('set the textalign of cd fld "p1" to xyz\\0', 'ERR:no variable found');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* setting style */
    const fld = h.vcstate.model.getById(VpcElField, h.ids.fBC1);
    assertEq(UI512FldStyle.Rectangle, fld.getN('style'), '1 |');
    b.t('the style of cd fld "p1"', 'rectangle');
    b.t('set the style of cd fld "p1" to "xyz"\\0', 'ERR:Field style or');
    b.t('set the style of cd fld "p1" to "opaque"\\the style of cd fld "p1"', 'opaque');
    b.t(
        'set the style of cd fld "p1" to "scrolling"\\the style of cd fld "p1"',
        'scrolling'
    );
    b.t(
        'set the style of cd fld "p1" to "transparent"\\the style of cd fld "p1"',
        'transparent'
    );

    b.batchEvaluate(h);
    b = new ScriptTestBatch();
    assertEq(UI512FldStyle.Transparent, fld.getN('style'), '1z|');

    /* reading per-character formatting */
    /* here's what we'll set it to: Courier/Bold/24"ab"
        Courier/ItalicShadow/18"cd"Times/Plain/18ef */
    const fldPerChar = h.vcstate.model.getById(VpcElField, h.ids.fBC2);
    let sfmt = '';
    sfmt += UI512DrawText.setFont(
        'ab',
        new TextFontSpec('Courier', TextFontStyling.Bold, 24).toSpecString()
    );
    sfmt += UI512DrawText.setFont(
        'cd',
        new TextFontSpec(
            'Courier',
            TextFontStyling.Italic | TextFontStyling.Shadow,
            18
        ).toSpecString()
    );
    sfmt += UI512DrawText.setFont(
        'ef',
        new TextFontSpec('Times', TextFontStyling.Default, 18).toSpecString()
    );
    h.vcstate.vci.undoableAction(() =>
        fldPerChar.setCardFmTxt(FormattedText.newFromSerialized(sfmt), higher)
    );

    /* non per-character properties */
    b.t('the defaulttextfont of cd fld "p2"', 'geneva');
    b.t('the defaulttextstyle of cd fld "p2"', 'plain');
    b.t('the defaulttextsize of cd fld "p2"', '12');
    b.t('the textfont of cd fld "p2"', 'geneva');
    b.t('the textstyle of cd fld "p2"', 'plain');
    b.t('the textsize of cd fld "p2"', '12');
    b.t('the alltext of cd fld "p2"', 'abcdef');
    b.t('cd fld "p2"', 'abcdef');

    /* read per-character! */
    b.t('the textfont of char 1 to 4 of cd fld "p2"', 'Courier');
    b.t('the textfont of char 3 to 4 of cd fld "p2"', 'Courier');
    b.t('the textfont of char 3 to 5 of cd fld "p2"', 'mixed');
    b.t('the textstyle of char 1 to 2 of cd fld "p2"', 'bold');
    b.t('the textstyle of char 1 to 3 of cd fld "p2"', 'mixed');
    b.t('the textstyle of char 3 to 4 of cd fld "p2"', 'italic,shadow');
    b.t('the textsize of char 3 to 4 of cd fld "p2"', '18');
    b.t('the textsize of char 3 to 6 of cd fld "p2"', '18');
    b.t('the textsize of char 2 to 6 of cd fld "p2"', 'mixed');

    /* getting most properties aren't supported for per-character */
    b.t('the textfont of char 1 to 2 of cd btn "p2"', 'ERR:NoViableAltException');
    b.t('the textfont of char 1 to 2 of cd 1', 'ERR:NoViableAltException');
    b.t('the textfont of char 1 to 2 of bg 1', 'ERR:NoViableAltException');
    b.t('the dontwrap of char 1 to 2 of cd fld "p2"', 'ERR:for textstyle, textfont');
    b.t('the style of char 1 to 2 of cd fld "p2"', 'ERR:for textstyle, textfont');
    b.t('the xyz of char 1 to 2 of cd fld "p2"', 'ERR:no such function');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* formatting should have been preserved */
    let contents = fldPerChar.getCardFmTxt().toSerialized();
    assertWarnEq(sfmt, contents, '1y|');

    /* setting per-character formatting */
    b.t(
        longstr(
            `set the textfont of char 2 to 3 of cd fld "p2" to
                 "geneva"\\the textfont of char 2 to 3 of cd fld "p2"`
        ),
        'geneva'
    );
    b.t(
        longstr(
            `set the textstyle of char 4 to 5 of cd fld "p2" to
                 "underline"\\the textstyle of char 4 to 5 of cd fld "p2"`
        ),
        'underline'
    );
    b.t(
        longstr(
            `set the textsize of char 6 to 6 of cd fld "p2" to
                 "14"\\the textsize of char 6 to 6 of cd fld "p2"`
        ),
        '14'
    );

    /* confirm what was set */
    b.t('the textfont of char 1 to 1 of cd fld "p2"', 'Courier');
    b.t('the textfont of char 2 to 2 of cd fld "p2"', 'geneva');
    b.t('the textfont of char 3 to 3 of cd fld "p2"', 'geneva');
    b.t('the textfont of char 4 to 4 of cd fld "p2"', 'Courier');
    b.t('the textfont of char 5 to 5 of cd fld "p2"', 'Times');
    b.t('the textfont of char 6 to 6 of cd fld "p2"', 'Times');
    b.t('the textstyle of char 1 to 1 of cd fld "p2"', 'bold');
    b.t('the textstyle of char 2 to 2 of cd fld "p2"', 'bold');
    b.t('the textstyle of char 3 to 3 of cd fld "p2"', 'italic,shadow');
    b.t('the textstyle of char 4 to 4 of cd fld "p2"', 'underline');
    b.t('the textstyle of char 5 to 5 of cd fld "p2"', 'underline');
    b.t('the textstyle of char 6 to 6 of cd fld "p2"', 'plain');
    b.t('the textsize of char 1 to 1 of cd fld "p2"', '24');
    b.t('the textsize of char 2 to 2 of cd fld "p2"', '24');
    b.t('the textsize of char 3 to 3 of cd fld "p2"', '18');
    b.t('the textsize of char 4 to 4 of cd fld "p2"', '18');
    b.t('the textsize of char 5 to 5 of cd fld "p2"', '18');
    b.t('the textsize of char 6 to 6 of cd fld "p2"', '14');

    /* setting most properties aren't supported for per-character */
    b.t(
        'set the textfont of char 1 to 2 of cd btn "p2" to "Geneva"\\0',
        'ERR:NoViableAltException'
    );
    b.t(
        'set the textfont of char 1 to 2 of cd 1 to "Geneva"\\0',
        'ERR:NoViableAltException'
    );
    b.t(
        'set the textfont of char 1 to 2 of bg 1 to "Geneva"\\0',
        'ERR:NoViableAltException'
    );
    b.t(
        'set the dontwrap of char 1 to 2 of cd fld "p2" to "false"\\0',
        'ERR:can only say'
    );
    b.t('set the style of char 1 to 2 of cd fld "p2" to "opaque"\\0', 'ERR:can only say');
    b.t('set the xyz of char 1 to 2 of cd fld "p2" to "Geneva"\\0', 'ERR:can only say');
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* confirm formatting */
    contents = fldPerChar.getCardFmTxt().toSerialized();
    assertWarnEq(
        longstr(
            `|Courier_24_+biuosdce|a|geneva_24_+biuosdce|b|geneva_18_b+iuo+sdce|
            c|Courier_18_bi+uosdce|d|Times_18_bi+uosdce|e|Times_14_biuosdce|f`,
            ''
        ),
        contents.replace(new RegExp(specialCharFontChange, 'g'), '|'),
        '1x|'
    );

    /* all of these actions nuke formatting */
    let actions: [string, TextFontSpec][] = [
        ['put "abcdef" into cd fld "p2"', new TextFontSpec('geneva', 0, 12)],
        ['set the alltext of cd fld "p2" to "abcdef"', new TextFontSpec('geneva', 0, 12)],
        [
            'set the textstyle of cd fld "p2" to "bold"',
            new TextFontSpec('geneva', TextFontStyling.Bold, 12)
        ],
        [
            'set the textfont of cd fld "p2" to "helvetica"',
            new TextFontSpec('helvetica', 0, 12)
        ],
        ['set the textsize of cd fld "p2" to "9"', new TextFontSpec('geneva', 0, 9)],
        [
            'set the textfont of char 1 to 400 of cd fld "p2" to "times"\n' +
                'set the textstyle of char 1 to 400 of cd fld "p2" to "underline,outline"\n' +
                'set the textsize of char 1 to 400 of cd fld "p2" to "28"\n',
            new TextFontSpec(
                'times',
                TextFontStyling.Outline | TextFontStyling.Underline,
                28
            )
        ]
    ];

    for (let [action, expectedFont] of actions) {
        h.vcstate.vci.undoableAction(() =>
            fldPerChar.setCardFmTxt(FormattedText.newFromSerialized(sfmt), higher)
        );
        assertEq(sfmt, fldPerChar.getCardFmTxt().toSerialized(), '1w|');
        b.t('set the defaulttextfont of cd fld "p2" to "geneva"\\0', '0');
        b.t('set the defaulttextstyle of cd fld "p2" to "plain"\\0', '0');
        b.t('set the defaulttextsize of cd fld "p2" to "12"\\0', '0');
        b.t(`${action}\\0`, '0');
        b.batchEvaluate(h);
        b = new ScriptTestBatch();

        /* formatting should have been lost */
        contents = fldPerChar.getCardFmTxt().toSerialized();
        let expected = UI512DrawText.setFont('abcdef', expectedFont.toSpecString());
        assertEq(expected, contents, '1v|');
    }

    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);

    /* productopts */
    b.t(`the name of ${cProductName}`, `${cProductName}`);
    b.t(`the abbr name of ${cProductName}`, `${cProductName}`);
    b.t(`the short name of ${cProductName}`, `${cProductName}`);
    b.t(`the long name of ${cProductName}`, `Hard Drive:${cProductName}`);
    b.t(`the id of ${cProductName}`, `WILD`);
    b.t(`the abbr id of ${cProductName}`, `WILD`);
    b.t(`the short id of ${cProductName}`, `WILD`);
    b.t(`the long id of ${cProductName}`, `WILD`);

    /* stack */
    b.t('set the name of stack 1 to "teststack"\\1', '1');
    b.t('the name of this stack', 'stack "teststack"');
    b.t('the abbr name of this stack', 'stack "teststack"');
    b.t('the short name of this stack', 'teststack');
    b.t('the long name of this stack', 'stack "Hard Drive:teststack"');
    b.t('the id of this stack', '921');
    b.t('the abbr id of this stack', '921');
    b.t('the short id of this stack', '921');
    b.t('the long id of stack "teststack"', 'stack id 921');

    /* bkgnd with a name */
    b.t('the name of bg 2', 'bkgnd "b"');
    b.t('the abbr name of bg 2', 'bkgnd "b"');
    b.t('the short name of bg 2', 'b');
    b.t('the long name of bg 2', 'bkgnd "b" of stack "teststack"');
    b.t('the id of bg 2', `${h.ids.bgB}`);
    b.t('the abbr id of bg 2', `${h.ids.bgB}`);
    b.t('the short id of bg 2', `${h.ids.bgB}`);
    b.t('the long id of bg 2', `bkgnd id ${h.ids.bgB}`);

    /* bkgnd with no name */
    b.t('set the name of bg 2 to ""\\0', '0');
    b.t('the name of bg 2', `bkgnd id ${h.ids.bgB}`);
    b.t('the abbr name of bg 2', `bkgnd id ${h.ids.bgB}`);
    b.t('the short name of bg 2', `bkgnd id ${h.ids.bgB}`);
    b.t('the long name of bg 2', `bkgnd id ${h.ids.bgB} of stack "teststack"`);
    b.t('the id of bg 2', `${h.ids.bgB}`);
    b.t('the abbr id of bg 2', `${h.ids.bgB}`);
    b.t('the short id of bg 2', `${h.ids.bgB}`);
    b.t('the long id of bg 2', `bkgnd id ${h.ids.bgB}`);
    b.t('set the name of bg 2 to "b"\\0', '0');

    /* card with a name */
    b.t('the name of cd 4', 'card "d"');
    b.t('the abbr name of cd 4', 'card "d"');
    b.t('the short name of cd 4', 'd');
    b.t('the long name of cd 4', 'card "d" of stack "teststack"');
    b.t('the id of cd 4', `${h.ids.cdBD}`);
    b.t('the abbr id of cd 4', `${h.ids.cdBD}`);
    b.t('the short id of cd 4', `${h.ids.cdBD}`);
    b.t('the long id of cd 4', `card id ${h.ids.cdBD}`);

    /* card with no name */
    b.t('set the name of cd 4 to ""\\0', '0');
    b.t('the name of cd 4', `card id ${h.ids.cdBD}`);
    b.t('the abbr name of cd 4', `card id ${h.ids.cdBD}`);
    b.t('the short name of cd 4', `card id ${h.ids.cdBD}`);
    b.t('the long name of cd 4', `card id ${h.ids.cdBD} of stack "teststack"`);
    b.t('the id of cd 4', `${h.ids.cdBD}`);
    b.t('the abbr id of cd 4', `${h.ids.cdBD}`);
    b.t('the short id of cd 4', `${h.ids.cdBD}`);
    b.t('the long id of cd 4', `card id ${h.ids.cdBD}`);
    b.t('set the name of cd 4 to "d"\\0', '0');

    /* button with a name */
    b.t('the name of cd btn "p1"', 'card button "p1"');
    b.t('the abbr name of cd btn "p1"', 'card button "p1"');
    b.t('the short name of cd btn "p1"', 'p1');
    b.t('the long name of cd btn "p1"', 'card button "p1" of card "c" of stack "teststack"');
    b.t('the id of cd btn "p1"', `${h.ids.bBC1}`);
    b.t('the abbr id of cd btn "p1"', `${h.ids.bBC1}`);
    b.t('the short id of cd btn "p1"', `${h.ids.bBC1}`);
    b.t('the long id of cd btn "p1"', `card button id ${h.ids.bBC1}`);

    /* button with no name */
    b.t(`set the name of cd btn id ${h.ids.bBC1} to ""\\0`, '0');
    b.t(`the name of cd btn id ${h.ids.bBC1}`, `card button id ${h.ids.bBC1}`);
    b.t(`the abbr name of cd btn id ${h.ids.bBC1}`, `card button id ${h.ids.bBC1}`);
    b.t(`the short name of cd btn id ${h.ids.bBC1}`, `card button id ${h.ids.bBC1}`);
    b.t(
        `the long name of cd btn id ${h.ids.bBC1}`,
        `card button id ${h.ids.bBC1} of card "c" of stack "teststack"`
    );
    b.t(`the id of cd btn id ${h.ids.bBC1}`, `${h.ids.bBC1}`);
    b.t(`the abbr id of cd btn id ${h.ids.bBC1}`, `${h.ids.bBC1}`);
    b.t(`the short id of cd btn id ${h.ids.bBC1}`, `${h.ids.bBC1}`);
    b.t(`the long id of cd btn id ${h.ids.bBC1}`, `card button id ${h.ids.bBC1}`);
    b.t(`set the name of cd btn id ${h.ids.bBC1} to "p1"\\0`, `0`);

    /* field with a name */
    b.t('the name of cd fld "p1"', 'card field "p1"');
    b.t('the abbr name of cd fld "p1"', 'card field "p1"');
    b.t('the short name of cd fld "p1"', 'p1');
    b.t('the long name of cd fld "p1"', 'card field "p1" of card "c" of stack "teststack"');
    b.t('the id of cd fld "p1"', `${h.ids.fBC1}`);
    b.t('the abbr id of cd fld "p1"', `${h.ids.fBC1}`);
    b.t('the short id of cd fld "p1"', `${h.ids.fBC1}`);
    b.t('the long id of cd fld "p1"', `card field id ${h.ids.fBC1}`);

    /* field with no name */
    b.t(`set the name of cd fld id ${h.ids.fBC1} to ""\\0`, '0');
    b.t(`the name of cd fld id ${h.ids.fBC1}`, `card field id ${h.ids.fBC1}`);
    b.t(`the abbr name of cd fld id ${h.ids.fBC1}`, `card field id ${h.ids.fBC1}`);
    b.t(`the short name of cd fld id ${h.ids.fBC1}`, `card field id ${h.ids.fBC1}`);
    b.t(
        `the long name of cd fld id ${h.ids.fBC1}`,
        `card field id ${h.ids.fBC1} of card "c" of stack "teststack"`
    );
    b.t(`the id of cd fld id ${h.ids.fBC1}`, `${h.ids.fBC1}`);
    b.t(`the abbr id of cd fld id ${h.ids.fBC1}`, `${h.ids.fBC1}`);
    b.t(`the short id of cd fld id ${h.ids.fBC1}`, `${h.ids.fBC1}`);
    b.t(`the long id of cd fld id ${h.ids.fBC1}`, `card field id ${h.ids.fBC1}`);
    b.t(`set the name of cd fld id ${h.ids.fBC1} to "p1"\\0`, `0`);

    /* when nothing has names, we get different output */
    b.t('set the name of stack 1 to ""\\0', '0');
    b.t('set the name of this bg to ""\\0', '0');
    b.t('set the name of this card to ""\\0', '0');
    b.t(`set the name of cd btn id ${h.ids.bBC1} to ""\\0`, `0`);
    b.t(`the name of cd btn id ${h.ids.bBC1}`, `card button id ${h.ids.bBC1}`);
    b.t(`the abbr name of cd btn id ${h.ids.bBC1}`, `card button id ${h.ids.bBC1}`);
    b.t(`the short name of cd btn id ${h.ids.bBC1}`, `card button id ${h.ids.bBC1}`);
    b.t(
        `the long name of cd btn id ${h.ids.bBC1}`,
        `card button id ${h.ids.bBC1} of card id ${h.ids.cdBC} of stack ""`
    );
    b.t('set the name of stack 1 to ""\\0', '0');
    b.t('set the name of this bg to "b"\\0', '0');
    b.t('set the name of this card to "c"\\0', '0');
    b.t(`set the name of cd btn id ${h.ids.bBC1} to "p1"\\0`, `0`);

    /* the target */
    b.t(`the target`, `card button id ${h.ids.go}`);
    b.t(`the abbr target`, `card button id ${h.ids.go}`);
    b.t(`the short target`, `${h.ids.go}`);
    b.t(`the long target`, `card button id ${h.ids.go}`);
    b.t(`set the compatibilitymode of this stack to true\\1`, `1`);
    b.t(`the short target`, `go`);
    b.t(`set the compatibilitymode of this stack to false\\1`, `1`);

    /* owner */
    b.t('the owner of vipercard', 'ERR:get owner');
    b.t('the owner of stack ""', 'ERR:get owner');
    b.t('the owner of this stack', 'ERR:get owner');
    b.t('the owner of bg 1', 'stack id 921');
    b.t('the owner of cd fld "p1"', 'card id 1005');
    b.t('the owner of cd btn "p1"', 'card id 1005');
    b.t('the owner of cd btn "xyz"', 'ERR:could not find');
    b.t('the owner of cd fld "xyz"', 'ERR:could not find');
    b.t('the owner of cd 1', 'bkgnd id 1000');
    b.t('the owner of second cd', 'bkgnd id 1002');
    b.t('the owner of fifth cd', 'bkgnd id 1003');
    b.t('the owner of cd "d" of bg 3', 'bkgnd id 1003');

    b.batchEvaluate(h);
});
t.test('setting a property can use variety of expression levels', () => {
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);
    let b = new ScriptTestBatch();
    b.t('set hilite of cd btn "p1" to 2 == 3\\hilite of cd btn "p1"', 'false');
    b.t('set hilite of cd btn "p1" to 3 > 2\\hilite of cd btn "p1"', 'true');
    b.t('set hilite of cd btn "p1" to 3 is a number\\hilite of cd btn "p1"', 'true');
    b.t('set hilite of cd btn "p1" to 3 is "3"\\hilite of cd btn "p1"', 'true');
    b.t('set hilite of cd btn "p1" to "c" is in "abc"\\hilite of cd btn "p1"', 'true');
    b.t('set label of cd btn "p1" to "a" & "b"\\label of cd btn "p1"', 'ab');
    b.t('set label of cd btn "p1" to 1+1\\label of cd btn "p1"', '2');
    b.t('set label of cd btn "p1" to 2*2\\label of cd btn "p1"', '4');
    b.t(
        'set label of cd btn "p1" to -(the number of chars in "ab")\\label of cd btn "p1"',
        '-2'
    );
    b.t('set hilite of cd btn "p1" to (2 == 3)\\hilite of cd btn "p1"', 'false');
    b.t('set hilite of cd btn "p1" to (3 > 2)\\hilite of cd btn "p1"', 'true');
    b.batchEvaluate(h);
});
t.test('builtinFunctions', () => {
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);
    let b = new ScriptTestBatch();

    /* RuleExprSource and RuleHSimpleContainer */
    b.t('12', '12');
    b.t('"abc"', 'abc');
    b.t('put "qwerty" into cd fld "p3"\\cd fld "p3"', 'qwerty');
    b.t('put "" into cd fld "p3"\\cd fld "p3"', '');
    b.t('cd fld "p4"', 'ERR:element not found');
    b.t('cd btn "p1"', 'ERR:we do not allow placing text');
    b.t('cd btn "p4"', 'ERR:we do not allow placing text');

    /* casing */
    b.t('PUT 5 Into myVar\\myVar', '5');
    b.t('3 * MYVAR', '15');
    b.t('SUM(MYVAR, Myvar, myvar)', '15');

    /* constants */
    b.t('one', '1');
    b.t('up', 'up');
    b.t('cr', '\n');
    b.t('return', '\n');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);

    /* length */
    b.t('the length of ""', '0');
    b.t('the length of "abc"', '3');
    b.t('the length of ("abc" & cr & cr & cr)', '6');
    b.t('the length of 12', '2');
    b.t('the length of true', '4');
    b.t('length("")', '0');
    b.t('length("abc")', '3');
    b.t('length("abc" & cr & cr & cr)', '6');
    b.t('length(12)', '2');
    b.t('length(true)', '4');

    /* counting chunks */
    b.t('the number of chars in ""', '0');
    b.t('the number of chars in "  "', '2');
    b.t('the number of chars in "abc"', '3');
    b.t('the number of chars in 12', '2');
    b.t('the number of chars in true', '4');
    b.t('the number of items in ""', '0');
    b.t('the number of items in "  "', '0');
    b.t('the number of items in "a"', '1');
    b.t('the number of items in "a,b,c"', '3');
    b.t('the number of lines in ""', '0');
    b.t('the number of lines in "  "', '1');
    b.t('the number of lines in "a"', '1');
    b.t('the number of lines in ("a" & cr & "b" & cr & "c")', '3');
    b.t('the number of words in ""', '0');
    b.t('the number of words in "  "', '0');
    b.t('the number of words in "a"', '1');
    b.t('the number of words in "a b c"', '3');

    /* counting objects */
    b.t('the number of bgs', '3');
    b.t('the number of bgs of this stack', '3');
    b.t('the number of bgs of next stack', 'ERR:find this object');
    b.t('the number of bgs of second stack', 'ERR:parse error');
    b.t('the number of cds', '5');
    b.t('the number of cds of this stack', '5');
    b.t('the number of cds of this bg', '3');
    b.t('the number of cds of bg 1', '1');
    b.t('the number of cd btns', '2');
    b.t('the number of cd flds', '3');
    b.t('the number of cards', '5');
    b.t('the number of cards of this stack', '5');
    b.t('the number of cards of bg 1 of this stack', '1');
    b.t('the number of cards of bg 1', '1');
    b.t('the number of cards of bg 2', '3');
    b.t('the number of cards of bg 3', '1');

    /* ordinal and too-large ordinal */
    b.t('the short id of first card', `${h.ids.cdA}`);
    b.t('the short id of third card', `${h.ids.cdBC}`);
    b.t('the short id of tenth card', `ERR:find this object`);

    /* confirmed in emulator that it should throw */
    b.t('the number of cards of bg 4', 'ERR:find this object');
    b.t('the number of bgs', '3');
    b.t('the number of bgs of this stack', '3');
    b.t('selectedtext()', '');
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* existence of objects */
    b.t(`there _is_ a ${cProductName}`, 'true');
    b.t(`there _is_ a the target`, 'true');
    b.t(`there _is_ a me`, 'true');
    b.t(`there _is_ a xyz`, 'ERR:variable found');
    b.t(`there _is_ a this stack`, 'true');
    b.t(`there _is_ a next stack`, 'false');
    b.t(`there _is_ a second stack`, 'ERR:parse err');
    b.t(`there _is_ a xyz stack`, 'ERR:parse err');

    /* bg */
    b.t(`there _is_ a bg 1`, 'true');
    b.t(`there _is_ a bg 2`, 'true');
    b.t(`there _is_ a bg 4`, 'false');
    b.t(`there _is_ a bg id ${h.ids.bgB}`, 'true');
    b.t(`there _is_ a bg id 99`, 'false');
    b.t(`there _is_ a bg "a"`, 'true');
    b.t(`there _is_ a bg "notexist"`, 'false');
    b.t(`there _is_ a this bg`, 'true');
    b.t(`there _is_ a next bg`, 'true');
    b.t(`there _is_ a first bg`, 'true');
    b.t(`there _is_ a tenth bg`, 'false');

    /* card */
    b.t(`there _is_ a card 1`, 'true');
    b.t(`there _is_ a card 4`, 'true');
    b.t(`there _is_ a card 8`, 'false');
    b.t(`there _is_ a card id ${h.ids.cdBD}`, 'true');
    b.t(`there _is_ a card id 99`, 'false');
    b.t(`there _is_ a card "a"`, 'true');
    b.t(`there _is_ a card "notexist"`, 'false');
    b.t(`there _is_ a this card`, 'true');
    b.t(`there _is_ a next card`, 'true');
    b.t(`there _is_ a first card`, 'true');
    b.t(`there _is_ a tenth card`, 'false');
    b.t(`there _is_ a card 2 of this bg`, 'true');
    b.t(`there _is_ a card 2 of bg 2`, 'true');
    b.t(`there _is_ a card 2 of bg 1`, 'false');
    b.t(`there _is_ a card "d" of bg 1`, 'false');
    b.t(`there _is_ a card "d" of bg 2`, 'true');
    b.t(`there _is_ a card "d" of bg 3`, 'true');

    /* btn */
    b.t(`there _is_ a cd btn 1`, 'true');
    b.t(`there _is_ a cd btn 70`, 'false');
    b.t(`there _is_ a cd btn "p1"`, 'true');
    b.t(`there _is_ a cd btn "p"`, 'false');
    b.t(`there _is_ a cd btn id ${h.ids.bBC1}`, 'true');
    b.t(`there _is_ a cd btn id ${h.ids.bBD1}`, 'true');
    b.t(`there _is_ a cd btn id 99`, 'false');
    b.t(`there _is_ a cd btn "p1" of this cd`, 'true');
    b.t(`there _is_ a cd btn "p1" of cd 2`, 'false');
    b.t(`there _is_ a cd btn "p1" of next cd`, 'true');
    b.t(`there _is_ a cd btn "p1" of cd "d" of bg 1`, 'false');
    b.t(`there _is_ a cd btn "p1" of cd "d" of bg 2`, 'true');
    b.t(`there _is_ a cd btn "p1" of cd "d" of bg 3`, 'true');

    /* fld */
    b.t(`there _is_ a cd fld 1`, 'true');
    b.t(`there _is_ a cd fld 70`, 'false');
    b.t(`there _is_ a cd fld "p1"`, 'true');
    b.t(`there _is_ a cd fld "p"`, 'false');
    b.t(`there _is_ a cd fld id ${h.ids.fBC1}`, 'true');
    b.t(`there _is_ a cd fld id ${h.ids.fBD2}`, 'true');
    b.t(`there _is_ a cd fld id 99`, 'false');
    b.t(`there _is_ a cd fld "p1" of this cd`, 'true');
    b.t(`there _is_ a cd fld "p1" of cd 2`, 'false');
    b.t(`there _is_ a cd fld "p1" of next cd`, 'true');
    b.t(`there _is_ a cd fld "p2" of cd "d" of bg 1`, 'false');
    b.t(`there _is_ a cd fld "p2" of cd "d" of bg 2`, 'true');
    b.t(`there _is_ a cd fld "p2" of cd "d" of bg 3`, 'false');
    b.batchEvaluate(h, [TestMultiplierInvert]);
    b = new ScriptTestBatch();

    /* fn calls without parens */
    b.t('the paramcount', '0');
    b.t('the ParamCount', '0');
    b.t('the params', '');
    b.t('the result', '');

    /* we now accept fn calls without parens. */
    b.t('the screenrect', '0,0,928,416');
    b.t('the sin', 'ERR:arg expected');
    b.t('the offset', 'ERR:args expected');
    b.t('the random', 'ERR:args expected');
    b.t('round(100 * the sin of 2)', '91');
    b.t('the xyz', 'ERR:no such function');
    b.t('sin of 2', 'ERR:parse err');
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* isolated */
    b.t('diskspace()', `${100 * 1024 * 1024}`);
    b.t('heapspace()', `${100 * 1024 * 1024}`);
    b.t('stackspace()', `${100 * 1024 * 1024}`);
    b.t('round(systemversion() * 100)', `755`);
    b.t('random(1)', `1`);
    b.t('random(2) is in "12"', `true`);
    b.t('random(3) is in "123"', `true`);
    b.t('random(0)', `ERR:value must be >= 1`);
    b.t('random(-1)', `ERR:value must be >= 1`);
    b.t('screenrect()', `0,0,${ScreenConsts.ScreenWidth},${ScreenConsts.ScreenHeight}`);
    b.t('chartonum("")', `0`);
    b.t('chartonum("a")', `97`);
    b.t('chartonum("abc")', `97`);
    b.t('chartonum(numtochar(4567))', `4567`);
    b.t('numtochar(0)', `ERR:numToChar must be`);
    b.t('numtochar(3)', `\x03`);
    b.t('numtochar(97)', `a`);
    b.t('numtochar(98)', `b`);
    b.t('numtochar(4567)', `\u11d7`);
    b.t('offset("a", "abc")', `1`);
    b.t('offset("c", "abc")', `3`);
    b.t('offset("", "abc")', `1`);
    b.t('offset("x", "abc")', `0`);
    b.t('offset("abcd", "abc")', `0`);
    b.t('offset("abd", "abc")', `0`);
    b.t('offset("bcd", "abc")', `0`);

    /* math variadic */
    b.t('max()', 'ERR:requires at least one');
    b.t('min()', 'ERR:requires at least one');
    b.t('sum()', 'ERR:requires at least one');
    b.t('max(4,5,6)', '6');
    b.t('max(6,5,4)', '6');
    b.t('min(4,5,6)', '4');
    b.t('min(6,5,4)', '4');
    b.t('sum(4,5,6)', '15');
    b.t('sum(1,2,3)', '6');
    b.t('min("1,2,3")', '1');
    b.t('min("1,2,3,")', '1'); /* confirmed in emulator */
    b.t('min(",1,2,3")', '0');
    b.t('min(",1,2,3,")', '0');
    b.t('min("1,2,3,,")', '0');
    b.t('sum("")', 'ERR:Wrong arguments'); /* confirmed in emulator */
    b.t('sum(1)', '1');
    b.t('sum("1")', '1');
    b.t('sum(" 1 ")', '1');
    b.t('sum(1,2)', '3');
    b.t('sum("1,2")', '3');
    b.t('sum(1," 2 ")', '3');
    b.t('sum(" 1 ",2)', '3');
    b.t('sum(" 1 "," 2 ")', '3');
    b.t('sum(" 1 , 2 ")', '3');
    b.t('sum("1a")', 'ERR:wanted numbers');
    b.t('sum("1 a")', 'ERR:wanted numbers');
    b.t('sum("1 , 2a")', 'ERR:wanted numbers');
    b.t('sum("1 , 2 a")', 'ERR:wanted numbers');
    b.t('sum("1,2")', '3');
    b.t('sum("1,2,")', '3');
    b.t('sum("1,2, ")', '3');
    b.t('sum(",1,2")', '3');
    b.t('sum("1,2,,")', '3');
    b.t('sum(" ,1,2,,")', '3');
    b.t('sum(" , 1 , 2 , , ")', '3');

    /* with "the" */
    b.t('the diskspace()', `ERR:parse err`);
    b.t('the diskspace', `${100 * 1024 * 1024}`);
    b.t('the abs(123)', 'ERR:parse err');
    b.t('abs(123)', '123');
    b.t('offset("c", "abc")', '3');

    /* reading the time */
    b.t('ticks() - ticks() >= 0', 'true');
    b.t('the ticks - the ticks >= 0', 'true');
    b.t('seconds() - seconds() >= 0', 'true');
    b.t('the seconds - the seconds >= 0', 'true');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* isolated, math */
    /* abs */
    b.t('abs(0)', '0');
    b.t('abs(-123)', '123');
    b.t('abs(123)', '123');

    /* round */
    b.t('round(3.9)', '4');
    b.t('round(4)', '4');
    b.t('round(4.4)', '4');
    b.t('round(4.49)', '4');
    b.t('round(4.51)', '5');
    b.t('round(4.6)', '5');
    b.t('round(4.5)', '4');
    b.t('round(5.5)', '6');
    b.t('round(6.5)', '6');
    b.t('round(7.5)', '8');
    b.t('round(-0.5)', '0');
    b.t('round(-1.5)', '-2');
    b.t('round(-2.5)', '-2');
    b.t('round(-3.5)', '-4');

    /* trunc */
    b.t('trunc(4.5)', '4');
    b.t('trunc(4.6)', '4');
    b.t('trunc(4.4)', '4');
    b.t('trunc(4)', '4');
    b.t('trunc(3.9)', '3');
    b.t('trunc(-0)', '0');
    b.t('trunc(-0.3)', '0');
    b.t('trunc(-1.7)', '-1');

    /* unlike the original product, we throw errors */
    b.t('4/0', 'ERR:> 1e18');
    b.t('0/0', 'ERR:> 1e18');
    b.t('"1.0"/"0.0"', 'ERR:> 1e18');
    b.t('sqrt(-3)', 'ERR:> 1e18');
    b.t('ln(-400)', 'ERR:> 1e18');
    b.t('ln1(-400)', 'ERR:> 1e18');
    b.t('log2(-400)', 'ERR:> 1e18');

    /* isolated, needs floating point compare */
    b.t('atan(5)', '1.373400766945016');
    b.t('atan(6)', '1.4056476493802699');
    b.t('sin(5)', '-0.9589242746631385');
    b.t('sin(6)', '-0.27941549819892586');
    b.t('cos(5)', '0.28366218546322625');
    b.t('cos(6)', '0.9601702866503661');
    b.t('tan(5)', '-3.380515006246586');
    b.t('tan(6)', '-0.29100619138474915');
    b.t('ln(5)', '1.6094379124341003');
    b.t('ln(6)', '1.791759469228055');
    b.t('ln1(5)', '1.791759469228055');
    b.t('ln1(6)', '1.9459101490553132');
    b.t('log2(5)', '2.321928094887362');
    b.t('log2(6)', '2.584962500721156');
    b.t('exp(5)', '148.4131591025766');
    b.t('exp(6)', '403.4287934927351');
    b.t('exp1(5)', '147.4131591025766');
    b.t('exp1(6)', '402.4287934927351');
    b.t('exp2(5)', '32');
    b.t('exp2(6)', '64');
    b.t('sqrt(5)', '2.23606797749979');
    b.t('sqrt(6)', '2.449489742783178');

    /* round trip */
    b.t('ln(6)', '1.791759469228055');
    b.t('exp(1.791759469228055)', '6');
    b.t('ln1(6)', '1.9459101490553132');
    b.t('exp1(1.9459101490553132)', '6');
    b.t('log2(5)', '2.321928094887362');
    b.t('exp2(2.321928094887362)', '5');

    b.batchEvaluate(h, [], BatchType.floatingPoint);
    b = new ScriptTestBatch();
    let userBounds = h.pr.userBounds;

    /* unknown */
    b.t('xyz()', 'ERR:no handler');
    b.t('xyz(1)', 'ERR:no handler');
    b.t('xyz(1,2)', 'ERR:no handler');

    /* uses outside world */
    b.t('cmdkey()', 'ERR:not a key event');
    b.t('commandkey()', 'ERR:not a key event');
    b.t('optionkey()', 'ERR:not a key event');
    b.t('shiftkey()', 'ERR:not a key event');
    b.t('clickh()', `${h.simClickX - userBounds[0]}`);
    b.t('clickv()', `${h.simClickY - userBounds[1]}`);
    b.t('clickloc()', `${h.simClickX - userBounds[0]},${h.simClickY - userBounds[1]}`);
    b.t('mouse()', `up`);
    b.t('mouseclick()', `true`);
    b.t('mouseh()', `${h.simMouseX - userBounds[0]}`);
    b.t('mousev()', `${h.simMouseY - userBounds[1]}`);
    b.t('mouseloc()', `${h.simMouseX - userBounds[0]},${h.simMouseY - userBounds[1]}`);
    b.t('param(0)', ``);
    b.t('param(1)', ``);
    b.t('param(2)', ``);
    b.t('paramcount()', `0`);
    b.t('params()', ``);
    b.t('result()', ``);
    b.t('tool()', `browse`);

    /* casing */
    b.t('CLICKLOC()', `${h.simClickX - userBounds[0]},${h.simClickY - userBounds[1]}`);
    b.t('clIcKloC()', `${h.simClickX - userBounds[0]},${h.simClickY - userBounds[1]}`);
    b.t('ClickLoc()', `${h.simClickX - userBounds[0]},${h.simClickY - userBounds[1]}`);

    b.batchEvaluate(h);
});
