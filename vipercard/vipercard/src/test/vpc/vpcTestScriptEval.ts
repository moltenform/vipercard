
/* auto */ import { TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { cProductName, vpcversion } from './../../ui512/utils/util512Base';
/* auto */ import { assertEq, last, longstr } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/draw/ui512FormattedText';
/* auto */ import { UI512FldStyle } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { TextFontSpec, TextFontStyling, specialCharFontChange } from './../../ui512/draw/ui512DrawTextClasses';
/* auto */ import { UI512DrawText } from './../../ui512/draw/ui512DrawText';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';

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

t.atest('--init--vpcTestScriptExprLvl', async () => {
    h = new TestVpcScriptRunBase(t);
    await h.initEnvironment();
});

t.test('_getProp', () => {
    let batch: [string, string][];

    /* object resolution */
    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    batch = [
        /* invalid */
        [`the short id of xyz`, `ERR:We did not recognize`],
        [`the short id of the xyz`, `ERR:We did not recognize`],

        /* target, me, productOpts */
        [`the short id of target`, `${h.elIds.btn_go}`],
        [`the short id of the target`, `${h.elIds.btn_go}`],
        [`the short id of me`, `${h.elIds.btn_go}`],
        [`the short id of the me`, `${h.elIds.btn_go}`],
        [`the short id of ${cProductName}`, `WILD`],
        [`the short id of the ${cProductName}`, `WILD`],

        /* stack */
        [`the short id of this stack`, `901`],
        [`the short id of next stack`, 'ERR:only accept referring to a stack'],
        [`the short id of xyz stack`, 'ERR:only accept referring to a stack'],

        /* bg absolute */
        [`the short id of bg id ${h.elIds.bg_a}`, `${h.elIds.bg_a}`],
        [`the short id of bg id ${h.elIds.bg_c}`, `${h.elIds.bg_c}`],
        [`the short id of bg id (${h.elIds.bg_c})`, `${h.elIds.bg_c}`],
        [`the short id of bg id 99`, `ERR: could not find the specified`],
        [`the short id of bg "a"`, `${h.elIds.bg_a}`],
        [`the short id of bg "c"`, `${h.elIds.bg_c}`],
        [`the short id of bg ("c")`, `${h.elIds.bg_c}`],
        [`the short id of bg ""`, `ERR: could not find the specified`],
        [`the short id of bg "notfound"`, `ERR: could not find the specified`],
        [`the short id of bg 1`, `${h.elIds.bg_a}`],
        [`the short id of bg 3`, `${h.elIds.bg_c}`],
        [`the short id of bg (3)`, `${h.elIds.bg_c}`],
        [`the short id of bg -1`, `ERR:could not find the specified`],
        [`the short id of bg 5`, `ERR:could not find the specified`],

        /* bg relative */
        [`the short id of this bg`, `${h.elIds.bg_b}`],
        [`the short id of next bg`, `${h.elIds.bg_c}`],
        [`the short id of first bg`, `${h.elIds.bg_a}`],
        [`the short id of last bg`, `${h.elIds.bg_c}`],
        [`the short id of the first bg`, `${h.elIds.bg_a}`],
        [`the short id of the second bg`, `${h.elIds.bg_b}`],
        [`the short id of the next bg`, `${h.elIds.bg_c}`],
        [`the short id of xyz bg`, `ERR:Not a valid choice of OrdinalOrPosition`],
        [`the short id of the xyz bg`, `ERR:Not a valid choice of OrdinalOrPosition`],

        /* bg with parent */
        [`the short id of bg id ${h.elIds.bg_a} of this stack`, `${h.elIds.bg_a}`],
        [`the short id of bg 1 of this stack`, `${h.elIds.bg_a}`],
        [`the short id of bg "a" of this stack`, `${h.elIds.bg_a}`],
        [`the short id of this bg of this stack`, `${h.elIds.bg_b}`],

        /* card absolute */
        [`the short id of card id ${h.elIds.card_a_a}`, `${h.elIds.card_a_a}`],
        [`the short id of card id ${h.elIds.card_c_d}`, `${h.elIds.card_c_d}`],
        [`the short id of card id (${h.elIds.card_c_d})`, `${h.elIds.card_c_d}`],
        [`the short id of card id 99`, `ERR: could not find the specified`],
        [`the short id of card "a"`, `${h.elIds.card_a_a}`],
        [`the short id of card "d"`, `${h.elIds.card_b_d}`],
        [`the short id of card ("d")`, `${h.elIds.card_b_d}`],
        [`the short id of card ""`, `ERR: could not find the specified`],
        [`the short id of card "notfound"`, `ERR: could not find the specified`],
        [`the short id of card 1`, `${h.elIds.card_a_a}`],
        [`the short id of card 3`, `${h.elIds.card_b_c}`],
        [`the short id of card (3)`, `${h.elIds.card_b_c}`],
        [`the short id of card -1`, `ERR:could not find`],
        [`the short id of card 99`, `ERR:could not find`],

        /* card relative */
        [`the short id of this card`, `${h.elIds.card_b_c}`],
        [`the short id of next card`, `${h.elIds.card_b_d}`],
        [`the short id of first card`, `${h.elIds.card_a_a}`],
        [`the short id of last card`, `${h.elIds.card_c_d}`],
        [`the short id of the first card`, `${h.elIds.card_a_a}`],
        [`the short id of the second card`, `${h.elIds.card_b_b}`],
        [`the short id of the next card`, `${h.elIds.card_b_d}`],
        [`the short id of xyz card`, `ERR:Not a valid choice of OrdinalOrPosition`],
        [`the short id of the xyz card`, `ERR:Not a valid choice of OrdinalOrPosition`],

        /* card with parent */
        [`the short id of card "d" of this bg`, `${h.elIds.card_b_d}`],
        [`the short id of card "d" of bg "c"`, `${h.elIds.card_c_d}`],
        [`the short id of card "d" of bg 3`, `${h.elIds.card_c_d}`],
        [`the short id of card 1 of this bg`, `${h.elIds.card_b_b}`],
        [`the short id of card 1 of bg 2`, `${h.elIds.card_b_b}`],
        [`the short id of card 1 of bg 3`, `${h.elIds.card_c_d}`],
        [`the short id of card 2 of bg 2`, `${h.elIds.card_b_c}`],
        [`the short id of card 2 of bg 1`, `ERR: could not find the specified`],
        [`the short id of card "d" of this bg of this stack`, `${h.elIds.card_b_d}`],

        /* field */
        [`the short id of cd fld id ${h.elIds.fld_b_c_1}`, `${h.elIds.fld_b_c_1}`],
        [`the short id of cd fld id ${h.elIds.fld_c_d_1}`, `${h.elIds.fld_c_d_1}`],
        [`the short id of cd fld id (${h.elIds.fld_c_d_1})`, `${h.elIds.fld_c_d_1}`],
        [`the short id of cd fld id 99`, `ERR:could not find the specified`],
        [`the short id of cd fld "p1"`, `${h.elIds.fld_b_c_1}`],
        [`the short id of cd fld "p2"`, `${h.elIds.fld_b_c_2}`],
        [`the short id of cd fld ("p2")`, `${h.elIds.fld_b_c_2}`],
        [`the short id of cd fld "notfound"`, `ERR:could not find the specified`],
        [`the short id of cd fld 1`, `${h.elIds.fld_b_c_1}`],

        /* field with parent */
        [
            `the short id of cd fld id ${h.elIds.fld_b_c_1} of this cd`,
            `${h.elIds.fld_b_c_1}`
        ],
        [
            `the short id of cd fld id ${h.elIds.fld_c_d_1} of this cd`,
            `${h.elIds.fld_c_d_1}`
        ],
        [`the short id of cd fld "p1" of cd 1`, `ERR:could not find the specified`],
        [`the short id of cd fld "p1" of this cd`, `${h.elIds.fld_b_c_1}`],
        [`the short id of cd fld "p1" of fifth cd`, `${h.elIds.fld_c_d_1}`],
        [`the short id of cd fld "p1" of cd 4`, `${h.elIds.fld_b_d_1}`],
        [`the short id of cd fld "p1" of cd "d"`, `${h.elIds.fld_b_d_1}`],
        [`the short id of cd fld "p1" of cd "d" of bg 3`, `${h.elIds.fld_c_d_1}`],
        [
            `the short id of cd fld "p1" of cd "d" of bg 3 of this stack`,
            `${h.elIds.fld_c_d_1}`
        ],

        /* button */
        [`the short id of cd btn id ${h.elIds.btn_b_c_1}`, `${h.elIds.btn_b_c_1}`],
        [`the short id of cd btn id ${h.elIds.btn_c_d_1}`, `${h.elIds.btn_c_d_1}`],
        [`the short id of cd btn id (${h.elIds.btn_c_d_1})`, `${h.elIds.btn_c_d_1}`],
        [`the short id of cd btn id 99`, `ERR:could not find the specified`],
        [`the short id of cd btn "p1"`, `${h.elIds.btn_b_c_1}`],
        [`the short id of cd btn "p2"`, `${h.elIds.btn_b_c_2}`],
        [`the short id of cd btn ("p2")`, `${h.elIds.btn_b_c_2}`],
        [`the short id of cd btn "notfound"`, `ERR:could not find the specified`],
        [`the short id of cd btn 1`, `${h.elIds.btn_b_c_1}`],

        /* button with parent */
        [
            `the short id of cd btn id ${h.elIds.btn_b_c_1} of this cd`,
            `${h.elIds.btn_b_c_1}`
        ],
        [
            `the short id of cd btn id ${h.elIds.btn_c_d_1} of this cd`,
            `${h.elIds.btn_c_d_1}`
        ],
        [`the short id of cd btn "p1" of cd 1`, `ERR:could not find the specified`],
        [`the short id of cd btn "p1" of this cd`, `${h.elIds.btn_b_c_1}`],
        [`the short id of cd btn "p1" of fifth cd`, `${h.elIds.btn_c_d_1}`],
        [`the short id of cd btn "p1" of cd 4`, `${h.elIds.btn_b_d_1}`],
        [`the short id of cd btn "p1" of cd "d"`, `${h.elIds.btn_b_d_1}`],
        [`the short id of cd btn "p1" of cd "d" of bg 3`, `${h.elIds.btn_c_d_1}`],
        [
            `the short id of cd btn "p1" of cd "d" of bg 3 of this stack`,
            `${h.elIds.btn_c_d_1}`
        ]
    ];
    h.testBatchEvaluate(batch);
});
t.test('_vpcProperties', () => {
    let batch: [string, string][];

    batch = [
        /* basic type checking */
        ['set the scroll of cd fld "p1" to ""\\0', 'ERR:expected an integer'],
        ['set the scroll of cd fld "p1" to "10a"\\0', 'ERR:expected an integer'],
        ['set the scroll of cd fld "p1" to "a10"\\0', 'ERR:expected an integer'],
        ['set the scroll of cd fld "p1" to "10.1"\\0', 'ERR:expected an integer'],
        ['set the dontwrap of cd fld "p1" to ""\\0', 'ERR:expected true or false'],
        ['set the dontwrap of cd fld "p1" to "true a"\\0', 'ERR:expected true or false'],
        ['set the dontwrap of cd fld "p1" to "truea"\\0', 'ERR:expected true or false'],
        ['set the dontwrap of cd fld "p1" to "tru"\\0', 'ERR:expected true or false'],

        /* get nonexistent props */
        ['the notexist of cd fld "p1"', 'ERR:unknown property'],
        ['the scrolla of cd fld "p1"', 'ERR:unknown property'],
        ['the scrol of cd fld "p1"', 'ERR:unknown property'],
        ['the style of cd 1', 'ERR:unknown property'],
        ['the selcaret of cd btn "p1"', 'ERR:unknown property'],
        ['the autohilite of cd fld "p1"', 'ERR:unknown property'],
        ['the autohilite of cd btn "p1"', 'true'],
        ['the abbr autohilite of cd btn "p1"', 'ERR:does not take an adjective'],
        ['the short autohilite of cd btn "p1"', 'ERR:does not take an adjective'],
        ['the long autohilite of cd btn "p1"', 'ERR:does not take an adjective'],
        ['the abbr textsize of cd fld "p1"', 'ERR:does not take an adjective'],
        ['the short textsize of cd fld "p1"', 'ERR:does not take an adjective'],
        ['the long textsize of cd fld "p1"', 'ERR:does not take an adjective'],
        ['the abbr cursor', 'ERR:does not take an adjective'],
        ['the short cursor', 'ERR:does not take an adjective'],
        ['the long cursor', 'ERR:does not take an adjective'],

        /* set nonexistent props */
        ['set the notexist of cd fld "p1" to "abc"\\0', 'ERR:unknown property'],
        ['set the scrolla of cd fld "p1" to 10\\0', 'ERR:unknown property'],
        ['set the scrol of cd fld "p1" to 10\\0', 'ERR:unknown property'],
        ['set the style of cd 1 to "opaque"\\0', 'ERR:unknown property'],
        ['set the selcaret of cd btn "p1" to 100\\0', 'ERR:unknown property'],
        ['set the autohilite of cd fld "p1" to true\\0', 'ERR:unknown property'],

        /* nonsettable props */
        ['set the id of cd fld "p1" to 100\\0', 'ERR:unknown property'],
        ['set the script of cd fld "p1" to "abc"\\0', 'ERR:unknown property']
    ];
    h.testBatchEvaluate(batch);

    batch = [
        /* product opts get */
        ['the xyz', "ERR:use 'sin(4)' instead"],
        ['the long xyz', "ERR:use 'sin(4)' instead"],
        ['the short xyz', "ERR:use 'sin(4)' instead"],
        ['the environment', 'development'],
        ['the freesize', '0'],
        ['the size', '0'],
        ['the stacksinuse', ''],
        ['the suspended', 'false'],
        ['the long version', `${vpcversion}`],
        ['the version', `${vpcversion[0]}.${vpcversion[1]}`],

        /* product opts set */
        ['set the itemdelimiter to "|" \\ the itemdelimiter', '|'],
        ['item 2 of "a|b|c"', 'b'],
        ['set the itemdelimiter to "," \\ the itemdelimiter', ','],
        ['set the itemdelimiter to "" \\ 0', 'ERR:length of itemDel must be 1'],
        ['set the itemdelimiter to ",," \\ 0', 'ERR:length of itemDel must be 1'],
        ['set the cursor to "plus" \\ the cursor', 'plus'],
        ['set the cursor to "arrow" \\ the cursor', 'arrow']
    ];
    h.testBatchEvaluate(batch);

    h.updateObjectScript(h.vcstate.model.stack.id, 'on stackscript\nend stackscript');
    h.updateObjectScript(h.vcstate.model.stack.bgs[1].id, 'on bgscript\nend bgscript');
    h.updateObjectScript(
        h.vcstate.model.stack.bgs[1].cards[1].id,
        'on cdscript\nend cdscript'
    );
    batch = [
        /* stack get and set */
        ['length(the script of this stack) > 1', `true`],
        ['the script of this stack', `${h.vcstate.model.stack.getS('script')}`],
        [
            'set the name of this stack to "newname" \\ the short name of this stack',
            'newname'
        ],
        [
            'set the name of this stack to "teststack" \\ the short name of this stack',
            'teststack'
        ],

        /* bg get and set */
        ['length(the script of bg 1) == 0', `true`],
        ['the script of bg 1', ``],
        ['length(the script of bg 2) > 1', `true`],
        ['the script of bg 2', `${h.vcstate.model.stack.bgs[1].getS('script')}`],
        ['the short name of bg 2', 'b'],
        ['set the name of bg 2 to "newname" \\ the short name of bg 2', 'newname'],
        ['set the name of bg 2 to "b" \\ the short name of bg 2', 'b'],

        /* card get and set */
        ['length(the script of cd 1) == 0', `true`],
        ['the script of cd 1', ``],
        ['length(the script of cd 3) > 1', `true`],
        ['the script of cd 3', `${h.vcstate.model.stack.bgs[1].cards[1].getS('script')}`],
        ['the short name of cd 3', 'c'],
        ['set the name of cd 3 to "newname" \\ the short name of cd 3', 'newname'],
        ['set the name of cd 3 to "c" \\ the short name of cd 3', 'c']
    ];
    h.testBatchEvaluate(batch);

    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    batch = [
        /* size properties */
        ['the left of cd btn "p1"', '0'],
        ['the top of cd btn "p1"', '0'],
        ['the width of cd btn "p1"', '0'],
        ['the height of cd btn "p1"', '0'],
        ['set the rect of cd btn "p1" to 10,20,40,60\\0', '0'],
        ['the rect of cd btn "p1"', '10,20,40,60'],
        ['the left of cd btn "p1"', '10'],
        ['the top of cd btn "p1"', '20'],
        ['the width of cd btn "p1"', '30'],
        ['the height of cd btn "p1"', '40'],
        ['the right of cd btn "p1"', '40'],
        ['the bottom of cd btn "p1"', '60'],
        ['the topleft of cd btn "p1"', '10,20'],
        ['the botright of cd btn "p1"', '40,60'],
        ['the loc of cd btn "p1"', '25,40'],

        ['set the left of cd btn "p1" to 100\\0', '0'],
        ['set the top of cd btn "p1" to 200\\0', '0'],
        ['set the width of cd btn "p1" to 300\\0', '0'],
        ['set the height of cd btn "p1" to 400\\0', '0'],
        ['the rect of cd btn "p1"', '100,200,400,600'],
        ['the loc of cd btn "p1"', '250,400'],

        ['set the right of cd btn "p1" to 401\\0', '0'],
        ['set the bottom of cd btn "p1" to 601\\0', '0'],
        ['the rect of cd btn "p1"', '101,201,401,601'],

        ['set the topleft of cd btn "p1" to 10,20\\0', '0'],
        ['set the botright of cd btn "p1" to 40,60\\0', '0'],
        ['the rect of cd btn "p1"', '10,20,40,60'],

        /* test loc with even widths */
        ['set the rect of cd btn "p1" to 10,20,40,60\\0', '0'],
        ['the loc of cd btn "p1"', '25,40'],
        ['set the loc of cd btn "p1" to 26,41\\0', '0'],
        ['the rect of cd btn "p1"', '11,21,41,61'],

        /* test loc with odd widths */
        ['set the rect of cd btn "p1" to 10,20,41,61\\0', '0'],
        ['the loc of cd btn "p1"', '25,40'],
        ['set the loc of cd btn "p1" to 26,41\\0', '0'],
        ['the rect of cd btn "p1"', '11,21,42,62'],

        /* test loc with even widths */
        ['set the rect of cd btn "p1" to 10,20,42,62\\0', '0'],
        ['the loc of cd btn "p1"', '26,41'],
        ['set the loc of cd btn "p1" to 26,41\\0', '0'],
        ['the rect of cd btn "p1"', '10,20,42,62'],

        /* set name */
        [`the short name of cd btn id ${h.elIds.btn_b_c_1}`, 'p1'],
        [
            longstr(
                `set the name of cd btn id ${h.elIds.btn_b_c_1} to
                "newname" \\ the short name of cd btn id ${h.elIds.btn_b_c_1}`
            ),
            'newname'
        ],
        [
            longstr(
                `set the name of cd btn id ${h.elIds.btn_b_c_1} to
                "p1" \\ the short name of cd btn id ${h.elIds.btn_b_c_1}`
            ),
            'p1'
        ],

        /* type checking, coords */
        ['set the rect of cd btn "p1" to "10,20,30,40"\\0', '0'],
        ['the rect of cd btn "p1"', '10,20,30,40'],
        ['set the rect of cd btn "p1" to " 10 , 20 , 30 , 40 "\\0', '0'],
        ['the rect of cd btn "p1"', '10,20,30,40'],
        ['set the rect of cd btn "p1" to 10\\0', 'ERR:could not get coord'],
        ['set the rect of cd btn "p1" to 10,20\\0', 'ERR:could not get coord'],
        ['set the rect of cd btn "p1" to 10,20,30\\0', 'ERR:could not get coord'],
        ['set the rect of cd btn "p1" to "10"\\0', 'ERR:could not get coord'],
        ['set the rect of cd btn "p1" to "10,20"\\0', 'ERR:could not get coord'],
        ['set the rect of cd btn "p1" to "10,20,30"\\0', 'ERR:could not get coord'],
        ['set the rect of cd btn "p1" to "10,20,30,40a"\\0', 'ERR:not an integer'],
        ['set the rect of cd btn "p1" to "10,20,30a,40"\\0', 'ERR:not an integer'],
        ['set the rect of cd btn "p1" to "10,20a,30,40"\\0', 'ERR:not an integer'],
        ['set the rect of cd btn "p1" to "10a,20,30,40"\\0', 'ERR:not an integer'],
        ['set the rect of cd btn "p1" to "10,20,30,40.1"\\0', 'ERR:not an integer'],
        ['set the rect of cd btn "p1" to "10,20,30.1,40"\\0', 'ERR:not an integer'],
        ['set the rect of cd btn "p1" to "10,20.1,30,40"\\0', 'ERR:not an integer'],
        ['set the rect of cd btn "p1" to "10.1,20,30,40"\\0', 'ERR:not an integer'],
        ['set the topleft of cd btn "p1" to "10"\\0', 'ERR:could not get coord'],
        ['set the topleft of cd btn "p1" to "10,20a"\\0', 'ERR:not an integer'],
        ['set the topleft of cd btn "p1" to "10a,20"\\0', 'ERR:not an integer'],

        /* type checking, single values */
        ['set the left of cd btn "p1" to "-30"\\0', '0'],
        ['the left of cd btn "p1"', '-30'],
        ['set the left of cd btn "p1" to " 10 "\\0', '0'],
        ['the left of cd btn "p1"', '10'],
        ['set the left of cd btn "p1" to ""\\0', 'ERR:expected an integer'],
        ['set the left of cd btn "p1" to "10a"\\0', 'ERR:expected an integer'],
        ['set the left of cd btn "p1" to "a10"\\0', 'ERR:expected an integer'],
        ['set the left of cd btn "p1" to "10.1"\\0', 'ERR:expected an integer']
    ];
    h.testBatchEvaluate(batch);
    let batchWithFld = batch.map((item): [string, string] => [
        item[0]
            .replace(/ cd btn /g, ' cd fld ')
            .replace(new RegExp(`${h.elIds.btn_b_c_1}`, 'g'), `${h.elIds.fld_b_c_1}`),
        item[1]
    ]);
    h.testBatchEvaluate(batchWithFld);

    batch = [
        /* btn simple get/set */
        ['the autohilite of cd btn "p1"', 'true'],
        [
            'set the autohilite of cd btn "p1" to false\\the autohilite of cd btn "p1"',
            'false'
        ],
        ['the enabled of cd btn "p1"', 'true'],
        ['set the enabled of cd btn "p1" to false\\the enabled of cd btn "p1"', 'false'],
        ['the hilite of cd btn "p1"', 'false'],
        ['set the hilite of cd btn "p1" to true\\the hilite of cd btn "p1"', 'true'],
        ['the icon of cd btn "p1"', '0'],
        ['set the icon of cd btn "p1" to 1\\the icon of cd btn "p1"', '1'],
        ['the label of cd btn "p1"', ''],
        [
            'set the label of cd btn "p1" to "newlabel"\\the label of cd btn "p1"',
            'newlabel'
        ],
        ['the showlabel of cd btn "p1"', 'true'],
        [
            'set the showlabel of cd btn "p1" to false\\the showlabel of cd btn "p1"',
            'false'
        ],
        ['the visible of cd btn "p1"', 'true'],
        ['set the visible of cd btn "p1" to false\\the visible of cd btn "p1"', 'false'],
        ['the textfont of cd btn "p1"', 'chicago'],
        [
            'set the textfont of cd btn "p1" to "helvetica"\\the textfont of cd btn "p1"',
            'helvetica'
        ],
        ['the textsize of cd btn "p1"', '12'],
        ['set the textsize of cd btn "p1" to 16\\the textsize of cd btn "p1"', '16'],

        /* btn validated get/set */
        ['the style of cd btn "p1"', 'rectangle'],
        ['set the style of cd btn "p1" to "xyz"\\0', 'ERR:Button style'],
        ['set the style of cd btn "p1" to "radio"\\the style of cd btn "p1"', 'radio'],
        ['set the style of cd btn "p1" to shadow\\the style of cd btn "p1"', 'shadow'],
        ['the textstyle of cd btn "p1"', 'plain'],
        ['set the textstyle of cd btn "p1" to "xyz"\\0', 'ERR:unrecognized text style'],
        [
            'set the textstyle of cd btn "p1" to "bold,xyz"\\0',
            'ERR:unrecognized text style'
        ],
        [
            longstr(
                `set the textstyle of cd btn "p1" to
                "bold,italic,underline,outline,shadow,condense,extend"\\the
                textstyle of cd btn "p1"`
            ),
            'bold,italic,underline,outline,shadow,condense,extend'
        ],
        [
            longstr(
                `set the textstyle of cd btn "p1" to
                bold,italic,underline,outline,shadow,condense,extend\\the
                textstyle of cd btn "p1"`
            ),
            'bold,italic,underline,outline,shadow,condense,extend'
        ],
        [
            longstr(
                `set the textstyle of cd btn "p1" to
                " Underline , Italic , Bold "\\the textstyle of cd btn "p1"`
            ),
            'bold,italic,underline'
        ],
        ['the textalign of cd btn "p1"', 'center'],
        [
            'set the textalign of cd btn "p1" to "xyz"\\0',
            'ERR:support setting text align to'
        ],
        [
            'set the textalign of cd btn "p1" to "left"\\the textalign of cd btn "p1"',
            'left'
        ],
        [
            'set the textalign of cd btn "p1" to center\\the textalign of cd btn "p1"',
            'center'
        ]
    ];

    h.testBatchEvaluate(batch);

    batch = [
        /* field simple get/set */
        ['the dontwrap of cd fld "p1"', 'false'],
        ['set the dontwrap of cd fld "p1" to true\\the dontwrap of cd fld "p1"', 'true'],
        ['the enabled of cd fld "p1"', 'true'],
        ['set the enabled of cd fld "p1" to false\\the enabled of cd fld "p1"', 'false'],
        ['the locktext of cd fld "p1"', 'false'],
        ['set the locktext of cd fld "p1" to true\\the locktext of cd fld "p1"', 'true'],
        ['the singleline of cd fld "p1"', 'false'],
        [
            'set the singleline of cd fld "p1" to true\\the singleline of cd fld "p1"',
            'true'
        ],
        ['the scroll of cd fld "p1"', '0'],
        ['set the scroll of cd fld "p1" to 1\\the scroll of cd fld "p1"', '1'],
        ['set the scroll of cd fld "p1" to 0\\the scroll of cd fld "p1"', '0'],
        ['the defaulttextsize of cd fld "p1"', '12'],
        [
            'set the defaulttextsize of cd fld "p1" to 14\\the defaulttextsize of cd fld "p1"',
            '14'
        ],
        ['the defaulttextfont of cd fld "p1"', 'geneva'],
        [
            'set the defaulttextfont of cd fld "p1" to helvetica\\0',
            'ERR:no variable found'
        ],
        [
            longstr(
                `set the defaulttextfont of cd fld "p1" to
                "helvetica"\\the defaulttextfont of cd fld "p1"`
            ),
            'helvetica'
        ],

        /* validated get/set */
        ['the defaulttextstyle of cd fld "p1"', 'plain'],
        [
            longstr(
                `set the defaulttextstyle of cd fld "p1" to
                "outline"\\the defaulttextstyle of cd fld "p1"`
            ),
            'outline'
        ],
        [
            longstr(
                `set the defaulttextstyle of cd fld "p1" to
                " bold , shadow , italic "\\the defaulttextstyle of cd fld "p1"`
            ),
            'bold,italic,shadow'
        ],
        [
            longstr(
                `set the defaulttextstyle of cd fld "p1" to
                " italic , outline, extend, bold "\\the defaulttextstyle of cd fld "p1"`
            ),
            'bold,italic,outline,extend'
        ],

        [
            longstr(
                `set the defaulttextstyle of cd fld "p1" to bold,
                 shadow, italic \\the defaulttextstyle of cd fld "p1"`
            ),
            'bold,italic,shadow'
        ],
        [
            longstr(
                `set the defaulttextstyle of cd fld "p1" to italic ,
                 outline, extend, bold \\the defaulttextstyle of cd fld "p1"`
            ),
            'bold,italic,outline,extend'
        ],
        [
            longstr(
                `set the defaulttextstyle of cd fld "p1" to
                 "plain"\\the defaulttextstyle of cd fld "p1"`
            ),
            'plain'
        ],
        [
            'set the defaulttextstyle of cd fld "p1" to ""\\0',
            'ERR:unrecognized text style'
        ],
        [
            'set the defaulttextstyle of cd fld "p1" to "bold,"\\0',
            'ERR:unrecognized text style'
        ],
        [
            'set the defaulttextstyle of cd fld "p1" to "xyz"\\0',
            'ERR:unrecognized text style'
        ],
        ['set the defaulttextstyle of cd fld "p1" to xyz\\0', 'ERR:no variable found'],
        [
            'set the defaulttextstyle of cd fld "p1" to "bold, xyz"\\0',
            'ERR:unrecognized text style'
        ],
        [
            'set the defaulttextstyle of cd fld "p1" to bold, xyz\\0',
            'ERR:no variable found'
        ],
        ['the textalign of cd fld "p1"', 'left'],
        [
            'set the textalign of cd fld "p1" to "center"\\the textalign of cd fld "p1"',
            'center'
        ],
        [
            'set the textalign of cd fld "p1" to left\\the textalign of cd fld "p1"',
            'left'
        ],
        [
            'set the textalign of cd fld "p1" to "right"\\0',
            'ERR:currently support setting text align'
        ],
        [
            'set the textalign of cd fld "p1" to "xyz"\\0',
            'ERR:currently support setting text align'
        ],
        ['set the textalign of cd fld "p1" to xyz\\0', 'ERR:no variable found']
    ];

    h.testBatchEvaluate(batch);

    /* setting style */
    const fld = h.vcstate.model.getById(VpcElField, h.elIds.fld_b_c_1);
    assertEq(UI512FldStyle.Rectangle, fld.getN('style'), '1 |');
    batch = [
        ['the style of cd fld "p1"', 'rectangle'],
        ['set the style of cd fld "p1" to "xyz"\\0', 'ERR:Field style or'],
        ['set the style of cd fld "p1" to "opaque"\\the style of cd fld "p1"', 'opaque'],
        [
            'set the style of cd fld "p1" to "scrolling"\\the style of cd fld "p1"',
            'scrolling'
        ],
        [
            'set the style of cd fld "p1" to "transparent"\\the style of cd fld "p1"',
            'transparent'
        ]
    ];

    h.testBatchEvaluate(batch);
    assertEq(UI512FldStyle.Transparent, fld.getN('style'), '1z|');

    /* reading per-character formatting */
    /* here's what we'll set it to: Courier/Bold/24"ab"
        Courier/ItalicShadow/18"cd"Times/Plain/18ef */
    const fldPerChar = h.vcstate.model.getById(VpcElField, h.elIds.fld_b_c_2);
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
        fldPerChar.setCardFmTxt(
            fldPerChar.parentId,
            FormattedText.newFromSerialized(sfmt)
        )
    );
    batch = [
        /* non per-character properties */
        ['the defaulttextfont of cd fld "p2"', 'geneva'],
        ['the defaulttextstyle of cd fld "p2"', 'plain'],
        ['the defaulttextsize of cd fld "p2"', '12'],
        ['the textfont of cd fld "p2"', 'geneva'],
        ['the textstyle of cd fld "p2"', 'plain'],
        ['the textsize of cd fld "p2"', '12'],
        ['the alltext of cd fld "p2"', 'abcdef'],
        ['cd fld "p2"', 'abcdef'],

        /* read per-character! */
        ['the textfont of char 1 to 4 of cd fld "p2"', 'Courier'],
        ['the textfont of char 3 to 4 of cd fld "p2"', 'Courier'],
        ['the textfont of char 3 to 5 of cd fld "p2"', 'mixed'],
        ['the textstyle of char 1 to 2 of cd fld "p2"', 'bold'],
        ['the textstyle of char 1 to 3 of cd fld "p2"', 'mixed'],
        ['the textstyle of char 3 to 4 of cd fld "p2"', 'italic,shadow'],
        ['the textsize of char 3 to 4 of cd fld "p2"', '18'],
        ['the textsize of char 3 to 6 of cd fld "p2"', '18'],
        ['the textsize of char 2 to 6 of cd fld "p2"', 'mixed'],

        /* getting most properties aren't supported for per-character */
        ['the textfont of char 1 to 2 of cd btn "p2"', 'ERR:NoViableAltException'],
        ['the textfont of char 1 to 2 of cd 1', 'ERR:NoViableAltException'],
        ['the textfont of char 1 to 2 of bg 1', 'ERR:NoViableAltException'],
        ['the dontwrap of char 1 to 2 of cd fld "p2"', 'ERR:can only say'],
        ['the style of char 1 to 2 of cd fld "p2"', 'ERR:can only say'],
        ['the xyz of char 1 to 2 of cd fld "p2"', 'ERR:can only say']
    ];

    h.testBatchEvaluate(batch);

    /* formatting should have been preserved */
    let contents = fldPerChar.getCardFmTxt(fldPerChar.parentId).toSerialized();
    assertEqWarn(sfmt, contents, '1y|');

    batch = [
        /* setting per-character formatting */
        [
            longstr(
                `set the textfont of char 2 to 3 of cd fld "p2" to
                 "geneva"\\the textfont of char 2 to 3 of cd fld "p2"`
            ),
            'geneva'
        ],
        [
            longstr(
                `set the textstyle of char 4 to 5 of cd fld "p2" to
                 "underline"\\the textstyle of char 4 to 5 of cd fld "p2"`
            ),
            'underline'
        ],
        [
            longstr(
                `set the textsize of char 6 to 6 of cd fld "p2" to
                 "14"\\the textsize of char 6 to 6 of cd fld "p2"`
            ),
            '14'
        ],

        /* confirm what was set */
        ['the textfont of char 1 to 1 of cd fld "p2"', 'Courier'],
        ['the textfont of char 2 to 2 of cd fld "p2"', 'geneva'],
        ['the textfont of char 3 to 3 of cd fld "p2"', 'geneva'],
        ['the textfont of char 4 to 4 of cd fld "p2"', 'Courier'],
        ['the textfont of char 5 to 5 of cd fld "p2"', 'Times'],
        ['the textfont of char 6 to 6 of cd fld "p2"', 'Times'],
        ['the textstyle of char 1 to 1 of cd fld "p2"', 'bold'],
        ['the textstyle of char 2 to 2 of cd fld "p2"', 'bold'],
        ['the textstyle of char 3 to 3 of cd fld "p2"', 'italic,shadow'],
        ['the textstyle of char 4 to 4 of cd fld "p2"', 'underline'],
        ['the textstyle of char 5 to 5 of cd fld "p2"', 'underline'],
        ['the textstyle of char 6 to 6 of cd fld "p2"', 'plain'],
        ['the textsize of char 1 to 1 of cd fld "p2"', '24'],
        ['the textsize of char 2 to 2 of cd fld "p2"', '24'],
        ['the textsize of char 3 to 3 of cd fld "p2"', '18'],
        ['the textsize of char 4 to 4 of cd fld "p2"', '18'],
        ['the textsize of char 5 to 5 of cd fld "p2"', '18'],
        ['the textsize of char 6 to 6 of cd fld "p2"', '14'],

        /* setting most properties aren't supported for per-character */
        [
            'set the textfont of char 1 to 2 of cd btn "p2" to "Geneva"\\0',
            'ERR:NoViableAltException'
        ],
        [
            'set the textfont of char 1 to 2 of cd 1 to "Geneva"\\0',
            'ERR:NoViableAltException'
        ],
        [
            'set the textfont of char 1 to 2 of bg 1 to "Geneva"\\0',
            'ERR:NoViableAltException'
        ],
        [
            'set the dontwrap of char 1 to 2 of cd fld "p2" to "false"\\0',
            'ERR:can only say'
        ],
        [
            'set the style of char 1 to 2 of cd fld "p2" to "opaque"\\0',
            'ERR:can only say'
        ],
        ['set the xyz of char 1 to 2 of cd fld "p2" to "Geneva"\\0', 'ERR:can only say']
    ];
    h.testBatchEvaluate(batch);

    /* confirm formatting */
    contents = fldPerChar.getCardFmTxt(fldPerChar.parentId).toSerialized();
    assertEqWarn(
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
            fldPerChar.setCardFmTxt(
                fldPerChar.parentId,
                FormattedText.newFromSerialized(sfmt)
            )
        );
        assertEq(
            sfmt,
            fldPerChar.getCardFmTxt(fldPerChar.parentId).toSerialized(),
            '1w|'
        );
        batch = [
            ['set the defaulttextfont of cd fld "p2" to "geneva"\\0', '0'],
            ['set the defaulttextstyle of cd fld "p2" to "plain"\\0', '0'],
            ['set the defaulttextsize of cd fld "p2" to "12"\\0', '0'],
            [`${action}\\0`, '0']
        ];
        h.testBatchEvaluate(batch);

        /* formatting should have been lost */
        contents = fldPerChar.getCardFmTxt(fldPerChar.parentId).toSerialized();
        let expected = UI512DrawText.setFont('abcdef', expectedFont.toSpecString());
        assertEq(expected, contents, '1v|');
    }

    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    batch = [
        /* productopts */
        [`the name of the ${cProductName}`, `${cProductName}`],
        [`the abbr name of ${cProductName}`, `${cProductName}`],
        [`the short name of ${cProductName}`, `${cProductName}`],
        [`the long name of ${cProductName}`, `${cProductName}`],
        [`the id of the ${cProductName}`, `WILD`],
        [`the abbr id of ${cProductName}`, `WILD`],
        [`the short id of ${cProductName}`, `WILD`],
        [`the long id of ${cProductName}`, `WILD`],

        /* stack */
        ['the name of this stack', 'h stack'],
        ['the abbr name of this stack', 'h stack'],
        ['the short name of this stack', 'teststack'],
        ['the long name of this stack', 'h stack'],
        ['the id of this stack', '901'],
        ['the abbr id of this stack', '901'],
        ['the short id of this stack', '901'],
        ['the long id of this stack', '901'],

        /* bkgnd with a name */
        ['the name of bg 2', 'bkgnd "b"'],
        ['the abbr name of bg 2', 'bkgnd "b"'],
        ['the short name of bg 2', 'b'],
        ['the long name of bg 2', 'bkgnd "b" of this stack'],
        ['the id of bg 2', `${h.elIds.bg_b}`],
        ['the abbr id of bg 2', `${h.elIds.bg_b}`],
        ['the short id of bg 2', `${h.elIds.bg_b}`],
        ['the long id of bg 2', `bkgnd id ${h.elIds.bg_b}`],

        /* bkgnd with no name */
        ['set the name of bg 2 to ""\\0', '0'],
        ['the name of bg 2', `bkgnd id ${h.elIds.bg_b}`],
        ['the abbr name of bg 2', `bkgnd id ${h.elIds.bg_b}`],
        ['the short name of bg 2', `bkgnd id ${h.elIds.bg_b}`],
        ['the long name of bg 2', `bkgnd id ${h.elIds.bg_b} of this stack`],
        ['the id of bg 2', `${h.elIds.bg_b}`],
        ['the abbr id of bg 2', `${h.elIds.bg_b}`],
        ['the short id of bg 2', `${h.elIds.bg_b}`],
        ['the long id of bg 2', `bkgnd id ${h.elIds.bg_b}`],
        ['set the name of bg 2 to "b"\\0', '0'],

        /* card with a name */
        ['the name of cd 4', 'card "d"'],
        ['the abbr name of cd 4', 'card "d"'],
        ['the short name of cd 4', 'd'],
        ['the long name of cd 4', 'card "d" of this stack'],
        ['the id of cd 4', `card id ${h.elIds.card_b_d}`],
        ['the abbr id of cd 4', `card id ${h.elIds.card_b_d}`],
        ['the short id of cd 4', `${h.elIds.card_b_d}`],
        ['the long id of cd 4', `card id ${h.elIds.card_b_d} of this stack`],

        /* card with no name */
        ['set the name of cd 4 to ""\\0', '0'],
        ['the name of cd 4', `card id ${h.elIds.card_b_d}`],
        ['the abbr name of cd 4', `card id ${h.elIds.card_b_d}`],
        ['the short name of cd 4', `card id ${h.elIds.card_b_d}`],
        ['the long name of cd 4', `card id ${h.elIds.card_b_d} of this stack`],
        ['the id of cd 4', `card id ${h.elIds.card_b_d}`],
        ['the abbr id of cd 4', `card id ${h.elIds.card_b_d}`],
        ['the short id of cd 4', `${h.elIds.card_b_d}`],
        ['the long id of cd 4', `card id ${h.elIds.card_b_d} of this stack`],
        ['set the name of cd 4 to "d"\\0', '0'],

        /* button with a name */
        ['the name of cd btn "p1"', 'card button "p1"'],
        ['the abbr name of cd btn "p1"', 'card button "p1"'],
        ['the short name of cd btn "p1"', 'p1'],
        ['the long name of cd btn "p1"', 'card button "p1" of card "c" of this stack'],
        ['the id of cd btn "p1"', `${h.elIds.btn_b_c_1}`],
        ['the abbr id of cd btn "p1"', `${h.elIds.btn_b_c_1}`],
        ['the short id of cd btn "p1"', `${h.elIds.btn_b_c_1}`],
        ['the long id of cd btn "p1"', `card btn id ${h.elIds.btn_b_c_1}`],

        /* button with no name */
        [`set the name of cd btn id ${h.elIds.btn_b_c_1} to ""\\0`, '0'],
        [
            `the name of cd btn id ${h.elIds.btn_b_c_1}`,
            `card button id ${h.elIds.btn_b_c_1}`
        ],
        [
            `the abbr name of cd btn id ${h.elIds.btn_b_c_1}`,
            `card button id ${h.elIds.btn_b_c_1}`
        ],
        [
            `the short name of cd btn id ${h.elIds.btn_b_c_1}`,
            `card button id ${h.elIds.btn_b_c_1}`
        ],
        [
            `the long name of cd btn id ${h.elIds.btn_b_c_1}`,
            `card button id ${h.elIds.btn_b_c_1} of card "c" of this stack`
        ],
        [`the id of cd btn id ${h.elIds.btn_b_c_1}`, `${h.elIds.btn_b_c_1}`],
        [`the abbr id of cd btn id ${h.elIds.btn_b_c_1}`, `${h.elIds.btn_b_c_1}`],
        [`the short id of cd btn id ${h.elIds.btn_b_c_1}`, `${h.elIds.btn_b_c_1}`],
        [
            `the long id of cd btn id ${h.elIds.btn_b_c_1}`,
            `card button id ${h.elIds.btn_b_c_1}`
        ],
        [`set the name of cd btn id ${h.elIds.btn_b_c_1} to "p1"\\0`, '0'],

        /* field with a name */
        ['the name of cd fld "p1"', 'card field "p1"'],
        ['the abbr name of cd fld "p1"', 'card field "p1"'],
        ['the short name of cd fld "p1"', 'p1'],
        ['the long name of cd fld "p1"', 'card field "p1" of card "c" of this stack'],
        ['the id of cd fld "p1"', `${h.elIds.fld_b_c_1}`],
        ['the abbr id of cd fld "p1"', `${h.elIds.fld_b_c_1}`],
        ['the short id of cd fld "p1"', `${h.elIds.fld_b_c_1}`],
        ['the long id of cd fld "p1"', `card field id ${h.elIds.fld_b_c_1}`],

        /* field with no name */
        [`set the name of cd fld id ${h.elIds.fld_b_c_1} to ""\\0`, '0'],
        [
            `the name of cd fld id ${h.elIds.fld_b_c_1}`,
            `card field id ${h.elIds.fld_b_c_1}`
        ],
        [
            `the abbr name of cd fld id ${h.elIds.fld_b_c_1}`,
            `card field id ${h.elIds.fld_b_c_1}`
        ],
        [
            `the short name of cd fld id ${h.elIds.fld_b_c_1}`,
            `card field id ${h.elIds.fld_b_c_1}`
        ],
        [
            `the long name of cd fld id ${h.elIds.fld_b_c_1}`,
            `card field id ${h.elIds.fld_b_c_1} of card "c" of this stack`
        ],
        [`the id of cd fld id ${h.elIds.fld_b_c_1}`, `${h.elIds.fld_b_c_1}`],
        [`the abbr id of cd fld id ${h.elIds.fld_b_c_1}`, `${h.elIds.fld_b_c_1}`],
        [`the short id of cd fld id ${h.elIds.fld_b_c_1}`, `${h.elIds.fld_b_c_1}`],
        [
            `the long id of cd fld id ${h.elIds.fld_b_c_1}`,
            `card field id ${h.elIds.fld_b_c_1}`
        ],
        [`set the name of cd fld id ${h.elIds.fld_b_c_1} to "p1"\\0`, '0'],

        /* when nothing has names, we get different output */
        ['set the name of this stack to ""\\0', '0'],
        ['set the name of this bg to ""\\0', '0'],
        ['set the name of this card to ""\\0', '0'],
        [`set the name of cd btn id ${h.elIds.btn_b_c_1} to ""\\0`, '0'],
        [
            `the name of cd btn id ${h.elIds.btn_b_c_1}`,
            `card button id ${h.elIds.btn_b_c_1}`
        ],
        [
            `the abbr name of cd btn id ${h.elIds.btn_b_c_1}`,
            `card button id ${h.elIds.btn_b_c_1}`
        ],
        [
            `the short name of cd btn id ${h.elIds.btn_b_c_1}`,
            `card button id ${h.elIds.btn_b_c_1}`
        ],
        [
            `the long name of cd btn id ${h.elIds.btn_b_c_1}`,
            `card button id ${h.elIds.btn_b_c_1} of card id ${h.elIds.card_b_c} of this stack`
        ],
        ['set the name of this stack to "teststack"\\0', '0'],
        ['set the name of this bg to "b"\\0', '0'],
        ['set the name of this card to "c"\\0', '0'],
        [`set the name of cd btn id ${h.elIds.btn_b_c_1} to "p1"\\0`, '0'],

        /* the target (h.objids.btn_go) */
        ['the target', 'card button "go"'],
        ['the abbr target', 'card button "go"'],
        ['the short target', 'go'],
        ['the long target', 'card button "go" of card "a" of this stack'],

        /* owner */
        ['the owner of vipercard', 'ERR:get the owner'],
        ['the owner of this stack', 'ERR:get owner'],
        ['the owner of bg 1', 'h stack'],
        ['the owner of cd fld "p1"', 'card "c"'],
        ['the owner of cd btn "p1"', 'card "c"'],
        ['the owner of cd btn "xyz"', 'ERR:could not find'],
        ['the owner of cd fld "xyz"', 'ERR:could not find'],
        ['the owner of cd 1', 'bkgnd "a"'],
        ['the owner of second cd', 'bkgnd "b"'],
        ['the owner of fifth cd', 'bkgnd "c"'],
        ['the owner of cd "d" of bg 3', 'bkgnd "c"']
    ];
    h.testBatchEvaluate(batch);
});
t.test('_setting a property can use variety of expression levels', () => {
    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    let batch: [string, string][] = [
        ['set hilite of cd btn "p1" to 2 == 3\\hilite of cd btn "p1"', 'false'],
        ['set hilite of cd btn "p1" to 3 > 2\\hilite of cd btn "p1"', 'true'],
        ['set hilite of cd btn "p1" to 3 is a number\\hilite of cd btn "p1"', 'true'],
        ['set hilite of cd btn "p1" to 3 is "3"\\hilite of cd btn "p1"', 'true'],
        ['set hilite of cd btn "p1" to "c" is in "abc"\\hilite of cd btn "p1"', 'true'],
        ['set label of cd btn "p1" to "a" & "b"\\label of cd btn "p1"', 'ab'],
        ['set label of cd btn "p1" to 1+1\\label of cd btn "p1"', '2'],
        ['set label of cd btn "p1" to 2*2\\label of cd btn "p1"', '4'],
        [
            'set label of cd btn "p1" to -(the number of chars in "ab")\\label of cd btn "p1"',
            '-2'
        ],
        ['set hilite of cd btn "p1" to (2 == 3)\\hilite of cd btn "p1"', 'false'],
        ['set hilite of cd btn "p1" to (3 > 2)\\hilite of cd btn "p1"', 'true']
    ];
    h.testBatchEvaluate(batch);
});
t.test('_builtinFunctions', () => {
    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    let batch: [string, string][];
    batch = [
        /* RuleExprSource and RuleHSimpleContainer */
        ['12', '12'],
        ['"abc"', 'abc'],
        ['put "qwerty" into cd fld "p3"\\cd fld "p3"', 'qwerty'],
        ['put "" into cd fld "p3"\\cd fld "p3"', ''],
        ['cd fld "p4"', 'ERR:element not found'],
        ['cd btn "p1"', 'ERR:we do not currently allow placing text'],
        ['cd btn "p4"', 'ERR:we do not currently allow placing text'],

        /* casing */
        ['PUT 5 Into myVar\\myVar', '5'],
        ['3 * MYVAR', '15'],
        ['SUM(MYVAR, Myvar, myvar)', '15'],

        /* constants */
        ['one', '1'],
        ['up', 'up'],
        ['cr', '\n'],
        ['return', '\n']
    ];
    h.testBatchEvaluate(batch);

    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    batch = [
        /* length */
        ['the length of ""', '0'],
        ['the length of "abc"', '3'],
        ['the length of ("abc" & cr & cr & cr)', '6'],
        ['the length of 12', '2'],
        ['the length of true', '4'],
        ['length("")', '0'],
        ['length("abc")', '3'],
        ['length("abc" & cr & cr & cr)', '6'],
        ['length(12)', '2'],
        ['length(true)', '4'],

        /* counting chunks */
        ['the number of chars in ""', '0'],
        ['the number of chars in "  "', '2'],
        ['the number of chars in "abc"', '3'],
        ['the number of chars in 12', '2'],
        ['the number of chars in true', '4'],
        ['the number of items in ""', '0'],
        ['the number of items in "  "', '1'],
        ['the number of items in "a"', '1'],
        ['the number of items in "a,b,c"', '3'],
        ['the number of lines in ""', '0'],
        ['the number of lines in "  "', '1'],
        ['the number of lines in "a"', '1'],
        ['the number of lines in ("a" & cr & "b" & cr & "c")', '3'],
        ['the number of words in ""', '0'],
        ['the number of words in "  "', '0'],
        ['the number of words in "a"', '1'],
        ['the number of words in "a b c"', '3'],

        /* counting objects */
        ['the number of bgs', '3'],
        ['the number of bgs of this stack', '3'],
        ['the number of bgs of next stack', 'ERR:only accept referring to a stack'],
        ['the number of bgs of second stack', 'ERR:MismatchedTokenException'],
        ['the number of cds', '5'],
        ['the number of cds of this stack', '5'],
        ['the number of cds of this bg', '3'],
        ['the number of cds of bg 1', '1'],
        ['the number of cd btns', '2'],
        ['the number of cd flds', '3'],
        ['the number of cards', '5'],
        ['the number of cards of this stack', '5'],
        ['the number of cards of bg 1 of this stack', '1'],
        ['the number of cards of bg 1', '1'],
        ['the number of cards of bg 2', '3'],
        ['the number of cards of bg 3', '1'],
        [
            'the number of cards of bg 4',
            'ERR:Cannot find this element'
        ] /* confirmed in emulator that it should throw */,
        ['the number of bgs', '3'],
        ['the number of bgs of this stack', '3'],
        ['selectedtext()', ''] /* use as breakpoint */
    ];
    h.testBatchEvaluate(batch);

    batch = [
        /* existence of objects */
        [`there _is_ a ${cProductName}`, 'true'],
        [`there _is_ a target`, 'true'],
        [`there _is_ a the target`, 'true'],
        [`there _is_ a me`, 'true'],
        [`there _is_ a xyz`, 'ERR:We did not recognize'],
        [`there _is_ a this stack`, 'true'],
        [`there _is_ a next stack`, 'ERR:we only accept referring to a stack'],
        [`there _is_ a second stack`, 'ERR:NoViableAltException'],
        [`there _is_ a xyz stack`, 'ERR:we only accept referring to a stack'],

        /* bg */
        [`there _is_ a bg 1`, 'true'],
        [`there _is_ a bg 2`, 'true'],
        [`there _is_ a bg 4`, 'false'],
        [`there _is_ a bg id ${h.elIds.bg_b}`, 'true'],
        [`there _is_ a bg id 99`, 'false'],
        [`there _is_ a bg "a"`, 'true'],
        [`there _is_ a bg "notexist"`, 'false'],
        [`there _is_ a this bg`, 'true'],
        [`there _is_ a next bg`, 'true'],
        [`there _is_ a first bg`, 'true'],
        [`there _is_ a tenth bg`, 'true'] /* todo: not really right? */,

        /* card */
        [`there _is_ a card 1`, 'true'],
        [`there _is_ a card 4`, 'true'],
        [`there _is_ a card 8`, 'false'],
        [`there _is_ a card id ${h.elIds.card_b_d}`, 'true'],
        [`there _is_ a card id 99`, 'false'],
        [`there _is_ a card "a"`, 'true'],
        [`there _is_ a card "notexist"`, 'false'],
        [`there _is_ a this card`, 'true'],
        [`there _is_ a next card`, 'true'],
        [`there _is_ a first card`, 'true'],
        [`there _is_ a tenth card`, 'true'] /* todo: not really right? */,
        [`there _is_ a card 2 of this bg`, 'true'],
        [`there _is_ a card 2 of bg 2`, 'true'],
        [`there _is_ a card 2 of bg 1`, 'false'],
        [`there _is_ a card "d" of bg 1`, 'false'],
        [`there _is_ a card "d" of bg 2`, 'true'],
        [`there _is_ a card "d" of bg 3`, 'true'],

        /* btn */
        [`there _is_ a cd btn 1`, 'true'],
        [`there _is_ a cd btn 70`, 'false'],
        [`there _is_ a cd btn "p1"`, 'true'],
        [`there _is_ a cd btn "p"`, 'false'],
        [`there _is_ a cd btn id ${h.elIds.btn_b_c_1}`, 'true'],
        [`there _is_ a cd btn id ${h.elIds.btn_b_d_1}`, 'true'],
        [`there _is_ a cd btn id 99`, 'false'],
        [`there _is_ a cd btn "p1" of this cd`, 'true'],
        [`there _is_ a cd btn "p1" of cd 2`, 'false'],
        [`there _is_ a cd btn "p1" of next cd`, 'true'],
        [`there _is_ a cd btn "p1" of cd "d" of bg 1`, 'false'],
        [`there _is_ a cd btn "p1" of cd "d" of bg 2`, 'true'],
        [`there _is_ a cd btn "p1" of cd "d" of bg 3`, 'true'],

        /* fld */
        [`there _is_ a cd fld 1`, 'true'],
        [`there _is_ a cd fld 70`, 'false'],
        [`there _is_ a cd fld "p1"`, 'true'],
        [`there _is_ a cd fld "p"`, 'false'],
        [`there _is_ a cd fld id ${h.elIds.fld_b_c_1}`, 'true'],
        [`there _is_ a cd fld id ${h.elIds.fld_b_d_2}`, 'true'],
        [`there _is_ a cd fld id 99`, 'false'],
        [`there _is_ a cd fld "p1" of this cd`, 'true'],
        [`there _is_ a cd fld "p1" of cd 2`, 'false'],
        [`there _is_ a cd fld "p1" of next cd`, 'true'],
        [`there _is_ a cd fld "p2" of cd "d" of bg 1`, 'false'],
        [`there _is_ a cd fld "p2" of cd "d" of bg 2`, 'true'],
        [`there _is_ a cd fld "p2" of cd "d" of bg 3`, 'false']
    ];
    h.testBatchEvalInvert(batch);

    batch = [
        /* fn calls without parens */
        ['the paramcount', '0'],
        ['the ParamCount', '0'],
        ['the params', ''],
        ['the result', ''],

        /* we require parens for basically everything else though. */
        ['the ticks', "ERR:you can't say something"],
        ['the screenrect', "ERR:you can't say something"],
        ['the sin', "ERR:you can't say something"],
        ['the offset', "ERR:you can't say something"],
        ['the rand', "ERR:you can't say something"],
        ['the sin of 2', 'ERR:NoViableAltException'],
        ['the xyz', "ERR:you can't say something"],
        ['sin of 2', 'ERR:NoViableAltException']
    ];
    h.testBatchEvaluate(batch);

    batch = [
        /* isolated */
        ['diskspace()', `${100 * 1024 * 1024}`],
        ['heapspace()', `${100 * 1024 * 1024}`],
        ['stackspace()', `${100 * 1024 * 1024}`],
        ['round(systemversion() * 100)', `755`],
        ['random(1)', `1`],
        ['random(2) is in "12"', `true`],
        ['random(3) is in "123"', `true`],
        ['random(0)', `ERR:value must be >= 1`],
        ['random(-1)', `ERR:value must be >= 1`],
        ['screenrect()', `0,0,${ScreenConsts.ScreenWidth},${ScreenConsts.ScreenHeight}`],
        ['chartonum("")', `0`],
        ['chartonum("a")', `97`],
        ['chartonum("abc")', `97`],
        ['chartonum(numtochar(4567))', `4567`],
        ['numtochar(0)', `ERR:numToChar must be`],
        ['numtochar(3)', `\x03`],
        ['numtochar(97)', `a`],
        ['numtochar(98)', `b`],
        ['numtochar(4567)', `\u11d7`],
        ['offset("a", "abc")', `1`],
        ['offset("c", "abc")', `3`],
        ['offset("", "abc")', `1`],
        ['offset("x", "abc")', `0`],
        ['offset("abcd", "abc")', `0`],
        ['offset("abd", "abc")', `0`],
        ['offset("bcd", "abc")', `0`],

        /* math variadic */
        ['max()', 'ERR:requires at least one'],
        ['min()', 'ERR:requires at least one'],
        ['sum()', 'ERR:requires at least one'],
        ['max(4,5,6)', '6'],
        ['max(6,5,4)', '6'],
        ['min(4,5,6)', '4'],
        ['min(6,5,4)', '4'],
        ['sum(4,5,6)', '15'],
        ['sum(1,2,3)', '6'],
        ['min("1,2,3")', '1'],
        ['min("1,2,3,")', '1'] /* a bit odd, but confirmed in emulator */,
        ['min(",1,2,3")', '0'],
        ['min(",1,2,3,")', '0'],
        ['min("1,2,3,,")', '0'],
        ['sum("")', '0'],
        ['sum(1)', '1'],
        ['sum("1")', '1'],
        ['sum(" 1 ")', '1'],
        ['sum(1,2)', '3'],
        ['sum("1,2")', '3'],
        ['sum(1," 2 ")', '3'],
        ['sum(" 1 ",2)', '3'],
        ['sum(" 1 "," 2 ")', '3'],
        ['sum(" 1 , 2 ")', '3'],
        ['sum("1a")', 'ERR:expected a number'],
        ['sum("1 a")', 'ERR:expected a number'],
        ['sum("1 , 2a")', 'ERR:expected a number'],
        ['sum("1 , 2 a")', 'ERR:expected a number'],
        ['sum("1,2")', '3'],
        ['sum("1,2,")', '3'],
        ['sum("1,2, ")', '3'],
        ['sum(",1,2")', '3'],
        ['sum("1,2,,")', '3'],
        ['sum(" ,1,2,,")', '3'],
        ['sum(" , 1 , 2 , , ")', '3'],

        /* with "the" */
        ['the diskspace', `ERR:you can't say something`],
        ['the diskspace()', `${100 * 1024 * 1024}`],
        ['the abs(123)', '123'],
        ['the offset("c", "abc")', '3'],

        /* reading the time */
        ['the ticks() - the ticks() >= 0', 'true'],
        [
            `put the seconds() into x
            put 31557600 into sInYear
            put 2017.75 into curYear
            put (curYear - 1904) * sInYear into lowBound
            put lowBound + sInYear into upperBound
            \\x > lowBound and x < upperBound`,
            'true'
        ]
    ];

    h.testBatchEvaluate(batch);

    batch = [
        /* isolated, math */
        /* abs */
        ['abs(0)', '0'],
        ['abs(-123)', '123'],
        ['abs(123)', '123'],

        /* round */
        ['round(3.9)', '4'],
        ['round(4)', '4'],
        ['round(4.4)', '4'],
        ['round(4.49)', '4'],
        ['round(4.51)', '5'],
        ['round(4.6)', '5'],
        ['round(4.5)', '4'],
        ['round(5.5)', '6'],
        ['round(6.5)', '6'],
        ['round(7.5)', '8'],
        ['round(-0.5)', '0'],
        ['round(-1.5)', '-2'],
        ['round(-2.5)', '-2'],
        ['round(-3.5)', '-4'],

        /* trunc */
        ['trunc(4.5)', '4'],
        ['trunc(4.6)', '4'],
        ['trunc(4.4)', '4'],
        ['trunc(4)', '4'],
        ['trunc(3.9)', '3'],
        ['trunc(-0)', '0'],
        ['trunc(-0.3)', '0'],
        ['trunc(-1.7)', '-1'],

        /* unlike the original product, we throw errors */
        ['4/0', 'ERR:> 1e18'],
        ['0/0', 'ERR:> 1e18'],
        ['"1.0"/"0.0"', 'ERR:> 1e18'],
        ['sqrt(-3)', 'ERR:> 1e18'],
        ['ln(-400)', 'ERR:> 1e18'],
        ['ln1(-400)', 'ERR:> 1e18'],
        ['log2(-400)', 'ERR:> 1e18'],

        /* isolated, needs floating point compare */
        ['atan(5)', '1.373400766945016'],
        ['atan(6)', '1.4056476493802699'],
        ['sin(5)', '-0.9589242746631385'],
        ['sin(6)', '-0.27941549819892586'],
        ['cos(5)', '0.28366218546322625'],
        ['cos(6)', '0.9601702866503661'],
        ['tan(5)', '-3.380515006246586'],
        ['tan(6)', '-0.29100619138474915'],
        ['ln(5)', '1.6094379124341003'],
        ['ln(6)', '1.791759469228055'],
        ['ln1(5)', '1.791759469228055'],
        ['ln1(6)', '1.9459101490553132'],
        ['log2(5)', '2.321928094887362'],
        ['log2(6)', '2.584962500721156'],
        ['exp(5)', '148.4131591025766'],
        ['exp(6)', '403.4287934927351'],
        ['exp1(5)', '147.4131591025766'],
        ['exp1(6)', '402.4287934927351'],
        ['exp2(5)', '32'],
        ['exp2(6)', '64'],
        ['sqrt(5)', '2.23606797749979'],
        ['sqrt(6)', '2.449489742783178'],

        /* round trip */
        ['ln(6)', '1.791759469228055'],
        ['exp(1.791759469228055)', '6'],
        ['ln1(6)', '1.9459101490553132'],
        ['exp1(1.9459101490553132)', '6'],
        ['log2(5)', '2.321928094887362'],
        ['exp2(2.321928094887362)', '5']
    ];
    h.testBatchEvaluate(batch, true);

    let userBounds = h.pr.userBounds;
    batch = [
        /* unknown */
        ['xyz()', 'ERR:no handler'],
        ['xyz(1)', 'ERR:no handler'],
        ['xyz(1,2)', 'ERR:no handler'],

        /* uses outside world */
        ['cmdkey()', 'ERR:not a key event'],
        ['commandkey()', 'ERR:not a key event'],
        ['optionkey()', 'ERR:not a key event'],
        ['shiftkey()', 'ERR:not a key event'],
        ['clickh()', `${h.simClickX - userBounds[0]}`],
        ['clickv()', `${h.simClickY - userBounds[1]}`],
        ['clickloc()', `${h.simClickX - userBounds[0]},${h.simClickY - userBounds[1]}`],
        ['mouse()', `up`],
        ['mouseclick()', `true`],
        ['mouseh()', `${h.simMouseX - userBounds[0]}`],
        ['mousev()', `${h.simMouseY - userBounds[1]}`],
        ['mouseloc()', `${h.simMouseX - userBounds[0]},${h.simMouseY - userBounds[1]}`],
        ['param(0)', ``],
        ['param(1)', ``],
        ['param(2)', ``],
        ['paramcount()', `0`],
        ['params()', ``],
        ['result()', ``],
        ['tool()', `browse`],

        /* casing */
        ['CLICKLOC()', `${h.simClickX - userBounds[0]},${h.simClickY - userBounds[1]}`],
        ['clIcKloC()', `${h.simClickX - userBounds[0]},${h.simClickY - userBounds[1]}`],
        ['ClickLoc()', `${h.simClickX - userBounds[0]},${h.simClickY - userBounds[1]}`]
    ];

    h.testBatchEvaluate(batch);
});
