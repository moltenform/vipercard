
/* auto */ import { TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { VpcElStack } from './../../vpc/vel/velStack';
/* auto */ import { VpcElButton } from './../../vpc/vel/velButton';
/* auto */ import { assertWarnEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * test running ViperCard scripts.
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
 */

let t = new SimpleUtil512TestCollection('testCollectionScriptRunCmd');
export let testCollectionScriptRunCmd = t;

let h = YetToBeDefinedTestHelper<TestVpcScriptRunBase>();
t.atest('--init--vpcTestScriptRunCmd', async () => {
    h = new TestVpcScriptRunBase(t);
    return h.initEnvironment();
});
t.test('execCommands choose', () => {
    let batch: [string, string][];
    batch = [
        /* not valid */
        ['choose tool\\tool()', 'ERR:not a valid tool'],
        ['choose pencil def tool\\tool()', 'ERR:NotAllInputParsedException'],
        ['choose tool 3 tool\\tool()', 'ERR:Redundant input'],
        ['choose tool "pencil" tool\\tool()', 'ERR:NotAllInputParsedException'],
        ['choose tool "pencil" xyz\\tool()', 'ERR:NotAllInputParsedException'],
        ['choose tool "pencil" "tool"\\tool()', 'ERR:NotAllInputParsedException'],
        ['choose', 'PREPARSEERR:not enough args'],
        ['choose brush', 'PREPARSEERR:tool'],
        ['choose 3', 'PREPARSEERR:tool'],
        ['choose pencil', 'PREPARSEERR:tool'],
        ['choose abc', 'PREPARSEERR:tool'],
        ['choose pencil def', 'PREPARSEERR:tool'],
        ['choose "pencil" xyz', 'PREPARSEERR:tool'],
        ['choose "pencil" "tool"', 'PREPARSEERR:tool'],

        /* updated style */
        ['choose "browse" tool\\tool()', 'browse'],
        ['choose "button" tool\\tool()', 'ERR:drawing only'],
        ['choose "field" tool\\tool()', 'ERR:drawing only'],
        ['choose "select" tool\\tool()', 'ERR:drawing only'],
        ['choose "brush" tool\\tool()', 'brush'],
        ['choose "bucket" tool\\tool()', 'bucket'],
        ['choose "stamp" tool\\tool()', 'ERR:drawing only'],
        ['choose "pencil" tool\\tool()', 'pencil'],
        ['choose "line" tool\\tool()', 'line'],
        ['choose "curve" tool\\tool()', 'curve'],
        ['choose "lasso" tool\\tool()', 'ERR:drawing only'],
        ['choose "eraser" tool\\tool()', 'eraser'],
        ['choose "rect" tool\\tool()', 'rect'],
        ['choose "oval" tool\\tool()', 'oval'],
        ['choose "roundrect" tool\\tool()', 'roundrect'],
        ['choose "spray" tool\\tool()', 'spray'],
        ['choose "spray can" tool\\tool()', 'spray'],
        ['choose "round rect" tool\\tool()', 'roundrect'],
        ['choose "round  rect" tool\\tool()', 'roundrect'],
        ['choose "xyz" tool\\tool()', 'ERR:Not a valid choice'],
        ['choose "" tool\\tool()', 'ERR:valid tool name'],

        /* classic style */
        ['choose browse tool\\tool()', 'browse'],
        ['choose button tool\\tool()', 'ERR:drawing only'],
        ['choose field tool\\tool()', 'ERR:drawing only'],
        ['choose select tool\\tool()', 'ERR:drawing only'],
        ['choose brush tool\\tool()', 'brush'],
        ['choose bucket tool\\tool()', 'bucket'],
        ['choose stamp tool\\tool()', 'ERR:drawing only'],
        ['choose pencil tool\\tool()', 'pencil'],
        ['choose line tool\\tool()', 'line'],
        ['choose curve tool\\tool()', 'curve'],
        ['choose lasso tool\\tool()', 'ERR:drawing only'],
        ['choose eraser tool\\tool()', 'eraser'],
        ['choose rect tool\\tool()', 'rect'],
        ['choose oval tool\\tool()', 'oval'],
        ['choose roundrect tool\\tool()', 'roundrect'],
        ['choose spray tool\\tool()', 'spray'],
        ['choose spray can tool\\tool()', 'spray'],
        ['choose round rect tool\\tool()', 'roundrect'],
        ['choose round  rect tool\\tool()', 'roundrect'],
        ['choose xyz tool\\tool()', 'ERR:no variable found'],

        /* numeric style */
        ['choose tool 1\\tool()', 'browse'],
        ['choose tool 2\\tool()', 'ERR:drawing only'],
        ['choose tool 4\\tool()', 'ERR:drawing only'],
        ['choose tool 9\\tool()', 'line'],
        ['choose tool 10\\tool()', 'spray'],
        ['choose tool 15\\tool()', 'curve'],
        ['choose tool 17\\tool()', 'ERR:unknown or unsupported'],
        ['choose tool 99\\tool()', 'ERR:unknown or unsupported'],
        ['choose tool 0\\tool()', 'ERR:unknown or unsupported'],
        ['choose tool -1\\tool()', 'ERR:unknown or unsupported'],

        /* we'll allow this */
        ['choose tool "pencil"\\tool()', 'pencil'],
        ['choose 10 tool\\tool()', 'spray'],

        /* by expression */
        ['choose "pen" & "cil" tool\\tool()', 'pencil'],
        ['choose ("pen" & "cil") tool\\tool()', 'pencil'],
        ['put "pencil" into x\nchoose x tool\\tool()', 'pencil'],
        ['put "spray can" into x\nchoose x tool\\tool()', 'spray'],
        ['put "spray can" into x\nchoose (x) tool\\tool()', 'spray'],
        ['choose tool 10 + 5\\tool()', 'curve'],
        ['choose tool 100/10\\tool()', 'spray'],
        ['choose tool (10 - 1)\\tool()', 'line'],
        ['put 15 into x\nchoose tool x\\tool()', 'curve'],
        ['put 15 into x\nchoose tool (x)\\tool()', 'curve']
    ];

    h.testBatchEvaluate(batch);
});
t.test('execCommands arithmetic invalid parse', () => {
    /* add, subtract, divide, multiply */
    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    h.runGeneralCode('', 'put "0" into cd fld "p1"');
    h.assertLineErr('add 4 with cd fld "p1"', 'MismatchedTokenException', 3);
    h.assertLineErr('add 4 into cd fld "p1"', 'MismatchedTokenException', 3);
    h.assertLineErr('add 4 from cd fld "p1"', 'MismatchedTokenException', 3);
    h.assertLineErr('add 4 from cd fld "to"', 'MismatchedTokenException', 3);
    h.assertLineErr('add 4 to', 'NoViableAltException', 3);
    h.assertLineErr('add to cd fld "p1"', 'NoViableAltException', 3);
    h.assertPreparseErrLn('subtract 4 with cd fld "p1"', 'did not see', 3);
    h.assertPreparseErrLn('subtract 4 into cd fld "p1"', 'did not see', 3);
    h.assertPreparseErrLn('subtract 4 to cd fld "p1"', 'did not see', 3);
    h.assertPreparseErrLn('subtract 4 to cd fld "from"', 'did not see', 3);
    h.assertLineErr('subtract 4 from', 'NoViableAltException', 3);
    h.assertLineErr('subtract from cd fld "p1"', 'NoViableAltException', 3);
    h.assertPreparseErrLn('divide cd fld "p1"', 'did not see', 3);
    h.assertPreparseErrLn('divide cd fld "p1" to 4', 'did not see', 3);
    h.assertPreparseErrLn('divide cd fld "p1" with 4', 'did not see', 3);
    h.assertPreparseErrLn('divide cd fld "p1" from 4', 'did not see', 3);
    h.assertPreparseErrLn('divide cd fld "by" from 4', 'did not see', 3);
    h.assertLineErr('divide cd fld "p1" by', 'NoViableAltException', 3);
    h.assertPreparseErrLn('multiply cd fld "p1"', 'did not see', 3);
    h.assertPreparseErrLn('multiply cd fld "p1" to 4', 'did not see', 3);
    h.assertPreparseErrLn('multiply cd fld "p1" with 4', 'did not see', 3);
    h.assertPreparseErrLn('multiply cd fld "p1" from 4', 'did not see', 3);
    h.assertPreparseErrLn('multiply cd fld "by" from 4', 'did not see', 3);
    h.assertLineErr('multiply cd fld "p1" by', 'NoViableAltException', 3);
});
t.test('execCommands arithmetic valid', () => {
    let batch: [string, string][];
    batch = [
        /* operations */
        ['put 4 into x\\x', '4'],
        ['add (1+2) to x\\x', '7'],
        ['subtract (1+2) from x\\x', '4'],
        ['multiply x by (1+2)\\x', '12'],
        ['divide x by (1+3)\\x', '3'],

        /* operations, field */
        ['put "4" into cd fld "p1"\\0', '0'],
        ['add (1+2) to cd fld "p1"\\cd fld "p1"', '7'],
        ['subtract (1+2) from cd fld "p1"\\cd fld "p1"', '4'],
        ['multiply cd fld "p1" by (1+2)\\cd fld "p1"', '12'],
        ['divide cd fld "p1" by (1+3)\\cd fld "p1"', '3'],

        /* by item */
        ['put "3,4,5" into x\\0', '0'],
        ['add (1+2) to item 2 of x\\item 2 of x', '7'],
        ['subtract (1+2) from item 2 of x\\item 2 of x', '4'],
        ['multiply item 2 of x by (1+2)\\item 2 of x', '12'],
        ['divide item 2 of x by (1+3)\\item 2 of x', '3'],
        ['chartonum(x=="3,3,5")', '116'],

        /* by word */
        ['put "3  4  5" into x\\0', '0'],
        ['add (1+2) to word 2 of x\\word 2 of x', '7'],
        ['subtract (1+2) from word 2 of x\\word 2 of x', '4'],
        ['multiply word 2 of x by (1+2)\\word 2 of x', '12'],
        ['divide word 2 of x by (1+3)\\word 2 of x', '3'],
        ['chartonum(x=="3  3  5")', '116'],

        /* by char */
        ['put "345" into x\\0', '0'],
        ['add (1+2) to char 2 to 2 of x\\x', '375'],
        ['subtract (1+2) from char 2 to 2 of x\\x', '345'],
        ['multiply char 2 to 2 of x by (1+2)\\x', '3125'],
        ['divide char 2 to 3 of x by (1+3)\\x', '335'],

        /* not a number */
        ['put "4a" into cd fld "p2"\\0', '0'],
        ['add (1+2) to cd fld "p2"\\cd fld "p2"', 'ERR:expected a number'],
        ['subtract (1+2) from cd fld "p2"\\cd fld "p2"', 'ERR:expected a number'],
        ['multiply cd fld "p2" by (1+2)\\cd fld "p2"', 'ERR:expected a number'],
        ['divide cd fld "p2" by (1+3)\\cd fld "p2"', 'ERR:expected a number'],

        /* to match original product, allow Lvl3Expressions */
        ['put 1 into x\n add 1&1 to x\\x', '12'],
        ['put 1 into x\n add 1+1 to x\\x', '3'],
        ['put 1 into x\n add 1*1 to x\\x', '2'],
        ['put 1 into x\n subtract 1&1 from x\\x', '-10'],
        ['put 1 into x\n subtract 1+1 from x\\x', '-1'],
        ['put 1 into x\n subtract 1*1 from x\\x', '0'],
        ['put 1 into x\n multiply x by 1&1\\x', '11'],
        ['put 1 into x\n multiply x by 1+1\\x', '2'],
        ['put 1 into x\n multiply x by 1*1\\x', '1'],
        ['put 22 into x\n divide x by 1&1\\x', '2'],
        ['put 22 into x\n divide x by 1+1\\x', '11'],
        ['put 22 into x\n divide x by 1*1\\x', '22']
    ];

    h.testBatchEvaluate(batch, true);
});
t.test('execCommands go to card', () => {
    /* changing current card */
    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    h.assertPreparseErrLn('go', 'on its own', 3);
    h.assertLineErr('go "a"', 'something like', 3);
    h.assertLineErr('go 1', 'NoViableAltException', 3);
    h.assertLineErr('go xyz', 'no variable found', 3);
    let batch: [string, string][];
    batch = [
        /* go by id */
        [
            `go card 1\ngo to card id ${h.elIds.card_b_d}\\the short id of this cd`,
            `${h.elIds.card_b_d}`
        ],

        /* going to nonexistant cards is a no-op,
confirmed in emulator */
        [`go card 1\ngo to cd id 8888\\the short id of this cd`, `${h.elIds.card_a_a}`],
        [
            `go card 1\ngo to cd "notexist"\\the short id of this cd`,
            `${h.elIds.card_a_a}`
        ],
        [`go card 1\ngo to bg 8888\\the short id of this cd`, `${h.elIds.card_a_a}`],
        /* going to different types of objects is an error,
confirmed in emulator  */
        [
            `go card id ${h.elIds.card_b_c}\ngo to cd btn "p1"\\the short id of this cd`,
            `ERR:5:Cannot go to a`
        ],
        [
            `go card id ${h.elIds.card_b_c}\ngo to cd fld 1\\the short id of this cd`,
            `ERR:5:Cannot go to a`
        ],
        [`go to vipercard\\the short id of this cd`, `ERR:expected a number`],
        [`go card 1\ngo to cd btn id 1\\the short id of this cd`, `${h.elIds.card_a_a}`],
        /* go by id */
        [
            `go card 1\ngo to card id ${h.elIds.card_b_d}\\the short id of this cd`,
            `${h.elIds.card_b_d}`
        ],
        [
            `go card 1\ngo to card id ${h.elIds.card_c_d}\\the short id of this cd`,
            `${h.elIds.card_c_d}`
        ],

        /* go by number */
        ['go to card 1\\the short id of this cd', `${h.elIds.card_a_a}`],
        ['go to card 2\\the short id of this cd', `${h.elIds.card_b_b}`],
        ['go to card 3\\the short id of this cd', `${h.elIds.card_b_c}`],
        ['go to card 4\\the short id of this cd', `${h.elIds.card_b_d}`],
        ['go to card 5\\the short id of this cd', `${h.elIds.card_c_d}`],

        /* get by relative (tests getCardByOrdinal) */
        ['go to card 1\\the short id of next cd', `${h.elIds.card_b_b}`],
        ['go to card 2\\the short id of next cd', `${h.elIds.card_b_c}`],
        ['go to card 3\\the short id of next cd', `${h.elIds.card_b_d}`],
        ['go to card 4\\the short id of next cd', `${h.elIds.card_c_d}`],
        ['go to card 2\\the short id of prev cd', `${h.elIds.card_a_a}`],
        ['go to card 3\\the short id of prev cd', `${h.elIds.card_b_b}`],
        ['go to card 4\\the short id of prev cd', `${h.elIds.card_b_c}`],
        ['go to card 5\\the short id of prev cd', `${h.elIds.card_b_d}`],

        /* ord/position */
        ['go to card 3\\the short id of this cd', `${h.elIds.card_b_c}`],
        ['go next\\the short id of this cd', `${h.elIds.card_b_d}`],
        ['go prev\\the short id of this cd', `${h.elIds.card_b_c}`],
        ['go previous\\the short id of this cd', `${h.elIds.card_b_b}`],
        ['go next\\the short id of this cd', `${h.elIds.card_b_c}`],
        ['go first\\the short id of this cd', `${h.elIds.card_a_a}`],
        ['go last\\the short id of this cd', `${h.elIds.card_c_d}`],
        ['go third\\the short id of this cd', `${h.elIds.card_b_c}`],

        /* should wrap around */
        ['go first\ngo prev\\the short id of this cd', `${h.elIds.card_c_d}`],
        ['go last\ngo next\\the short id of this cd', `${h.elIds.card_a_a}`],

        /* reference by name */
        ['go card 1\ngo to card "a"\\the short id of this cd', `${h.elIds.card_a_a}`],
        ['go card 1\ngo to card "b"\\the short id of this cd', `${h.elIds.card_b_b}`],
        ['go card 1\ngo to card "c"\\the short id of this cd', `${h.elIds.card_b_c}`],
        ['go card 1\ngo to card "d"\\the short id of this cd', `${h.elIds.card_b_d}`],
        [
            'go card 1\ngo to card "d" of bg 2\\the short id of this cd',
            `${h.elIds.card_b_d}`
        ],
        [
            'go card 1\ngo to card "d" of bg 3\\the short id of this cd',
            `${h.elIds.card_c_d}`
        ],

        /* confirmed in emulator: if there are ambiguous card names,
use whichever comes first in the stack, regardless of current bg */
        [
            `go card id ${h.elIds.card_a_a}\ngo to card "d"\\the short id of this cd`,
            `${h.elIds.card_b_d}`
        ],
        [
            `go card id ${h.elIds.card_b_d}\ngo to card "d"\\the short id of this cd`,
            `${h.elIds.card_b_d}`
        ],
        [
            `go card id ${h.elIds.card_c_d}\ngo to card "d"\\the short id of this cd`,
            `${h.elIds.card_b_d}`
        ],

        /* reference by bg */
        ['go to card 1\ngo to bg 1\\the short id of this cd', `${h.elIds.card_a_a}`],
        ['go to card 2\ngo to bg 1\\the short id of this cd', `${h.elIds.card_a_a}`],
        ['go to card 2\ngo to bg 2\\the short id of this cd', `${h.elIds.card_b_b}`],
        ['go to card 5\ngo to bg 2\\the short id of this cd', `${h.elIds.card_b_b}`],
        ['go to card 5\ngo to bg 3\\the short id of this cd', `${h.elIds.card_c_d}`],
        ['go to card 2\ngo to bg 3\\the short id of this cd', `${h.elIds.card_c_d}`],

        /* confirmed in emulator: if sent to the same bg,
do not change the current card */
        ['go to card 2\ngo to bg 2\\the short id of this cd', `${h.elIds.card_b_b}`],
        ['go to card 3\ngo to bg 2\\the short id of this cd', `${h.elIds.card_b_c}`],
        ['go to card 4\ngo to bg 2\\the short id of this cd', `${h.elIds.card_b_d}`],

        /* object reference */
        ['go third\ngo to this stack\\the short id of this cd', `${h.elIds.card_b_c}`],
        ['go third\ngo to stack "other"\\the short id of this cd', `${h.elIds.card_b_c}`],
        ['go third\ngo to stack id 999\\the short id of this cd', `${h.elIds.card_b_c}`],
        [
            `go third\ngo to stack id ${h.vcstate.model.stack.id}\\the short id of this cd`,
            `${h.elIds.card_b_c}`
        ],
        ['go to card 1 of this stack\\the short id of this cd', `${h.elIds.card_a_a}`],
        ['go to card 4 of this stack\\the short id of this cd', `${h.elIds.card_b_d}`],
        ['go to card 1 of bg 2\\the short id of this cd', `${h.elIds.card_b_b}`],
        ['go to card 1 of bg 3\\the short id of this cd', `${h.elIds.card_c_d}`],
        [
            'go to card 1 of bg 2 of this stack\\the short id of this cd',
            `${h.elIds.card_b_b}`
        ],
        [
            'go to card 1 of bg 3 of this stack\\the short id of this cd',
            `${h.elIds.card_c_d}`
        ],
        /* go by variable lookup - correct, confirmed in emulator */
        [
            longstr(`go card 1{{NEWLINE}}put "card id ${h.elIds.card_b_d}" into
                xx{{NEWLINE}}go to xx\\the short id of this cd`),
            `${h.elIds.card_b_d}`
        ],
        [
            longstr(`go card 1{{NEWLINE}}put the long id of card id ${h.elIds.card_b_d} into
                xx{{NEWLINE}}go to xx\\the short id of this cd`),
            `${h.elIds.card_b_d}`
        ],
        [
            longstr(`go card 1{{NEWLINE}}put the short name of card id ${h.elIds.card_b_d} into
                xx{{NEWLINE}}go to card xx\\the short id of this cd`),
            `${h.elIds.card_b_d}`
        ],
        /* go by variable lookup - incorrect, confirmed in emulator */
        [
            longstr(`go card 1{{NEWLINE}}put "card id ${h.elIds.card_b_d}" into xx{{NEWLINE}}go to
                card xx\\the short id of this cd`),
            `${h.elIds.card_a_a}`
        ],
        [
            longstr(`go card 1{{NEWLINE}}put "cd id ${h.elIds.card_b_c}" into
                xx{{NEWLINE}}go to card xx\\the short id of this cd`),
            `${h.elIds.card_a_a}`
        ],
        [
            longstr(`go card 1{{NEWLINE}}put the long id of cd id ${h.elIds.card_b_c} into
                xx{{NEWLINE}}go to card xx\\the short id of this cd`),
            `${h.elIds.card_a_a}`
        ]
    ];
    h.testBatchEvaluate(batch);
});
t.test('execCommands disable and enable', () => {
    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    let batch: [string, string][];
    batch = [
        /* not valid */
        ['enable cd 1', `ERR:MismatchedTokenException`],
        ['enable bg 1', `ERR:MismatchedTokenException`],
        ['enable cd fld "p1"', `ERR:MismatchedTokenException`],
        ['disable cd 1', `ERR:MismatchedTokenException`],
        ['disable bg 1', `ERR:MismatchedTokenException`],
        ['disable cd fld "p1"', `ERR:MismatchedTokenException`],

        /* valid */
        ['disable cd btn "p1"\\the enabled of cd btn "p1"', `false`],
        ['disable cd btn "p1"\\the enabled of cd btn "p1"', `false`],
        ['enable cd btn "p1"\\the enabled of cd btn "p1"', `true`],
        ['enable cd btn "p1"\\the enabled of cd btn "p1"', `true`]
    ];
    h.testBatchEvaluate(batch);
});
t.test('execCommands hide and show', () => {
    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    let batch: [string, string][];
    batch = [
        /* not valid */
        ['hide\\0', `ERR:NoViableAltException`],
        ['hide cd 1\\0', `ERR:NoViableAltException`],
        ['hide bg 1\\0', `ERR:NoViableAltException`],
        ['hide this stack\\0', `ERR:parse err`],
        ['show\\0', `ERR:NoViableAltException`],
        ['show cd 1\\0', `ERR:parse error`],
        ['show bg 1\\0', `ERR:NoViableAltException`],
        ['show this stack\\0', `ERR:parse error`],
        ['show cd btn "p1" from 12, 23\\0', `ERR:must be show *at*`],
        ['show cd btn "p1" into 12, 23\\0', `ERR:must be show *at*`],
        ['show cd btn "p1" xyz 12, 23\\0', `ERR:must be show *at*`],
        ['show cd btn "p1" at 12\\0', `ERR:Not a list`],
        ['show cd btn "p1" at "12a,23"\\0', `ERR:Not a list`],
        ['show cd btn "p1" at "12,23a"\\0', `ERR:Not a list`],
        ['show cd btn "p1" at 12, 23, 34\\0', `ERR:parse err`],
        ['show cd btn "p1" at "12", "23", "34"\\0', `ERR:parse err`],
        ['show cd btn "p1" at "12, 23, 34"\\0', `ERR:expected 2 numbers`],

        /* valid */
        ['hide cd btn "p1"\\the visible of cd btn "p1"', `false`],
        ['hide cd btn "p1"\\the visible of cd btn "p1"', `false`],
        ['show cd btn "p1"\\the visible of cd btn "p1"', `true`],
        ['show cd btn "p1"\\the visible of cd btn "p1"', `true`],
        ['hide cd fld "p1"\\the visible of cd fld "p1"', `false`],
        ['hide cd fld "p1"\\the visible of cd fld "p1"', `false`],
        ['show cd fld "p1"\\the visible of cd fld "p1"', `true`],
        ['show cd fld "p1"\\the visible of cd fld "p1"', `true`],

        /* set locations */
        ['set the rect of cd btn "p1" to 10, 20, 40, 60\\0', `0`],
        ['show cd btn "p1" at 123, 234\\the loc of cd btn "p1"', `123,234`],
        ['show cd btn "p1" at 12, 23\\the loc of cd btn "p1"', `12,23`],
        ['show cd btn "p1" at "12", "23"\\the loc of cd btn "p1"', `12,23`],
        ['show cd btn "p1" at "13,24"\\the loc of cd btn "p1"', `13,24`],
        ['show cd btn "p1" at (12), (" 23 ")\\the loc of cd btn "p1"', `12,23`],
        ['set the rect of cd fld "p1" to 10, 20, 40, 60\\0', `0`],
        ['show cd fld "p1" at 123, 234\\the loc of cd fld "p1"', `123,234`],
        ['show cd fld "p1" at 12, 23\\the loc of cd fld "p1"', `12,23`],
        ['show cd fld "p1" at "12", "23"\\the loc of cd fld "p1"', `12,23`],
        ['show cd fld "p1" at "12, 23"\\the loc of cd fld "p1"', `12,23`],
        ['show cd fld "p1" at (12), (" 23 ")\\the loc of cd fld "p1"', `12,23`]
    ];
    h.testBatchEvaluate(batch);
});
t.test('execCommands sort', () => {
    let batch: [string, string][];
    batch = [
        ['put "pear,Apple2,z11,z2,11,2,apple1,peach" into initlist\\0', '0'],
        ['put initlist into x\\0', `0`],
        ['sort items of x\\x', `11,2,apple1,Apple2,peach,pear,z11,z2`],
        ['put initlist into x\\0', `0`],
        ['sort ascending items of x text\\x', `11,2,apple1,Apple2,peach,pear,z11,z2`],
        ['put initlist into x\\0', `0`],
        ['sort items of x text descending\\x', `z2,z11,pear,peach,Apple2,apple1,2,11`],
        ['put initlist into x\\0', `0`],
        ['sort descending items of x text\\x', `z2,z11,pear,peach,Apple2,apple1,2,11`],
        ['put initlist into x\\0', `0`],
        ['sort items of x text ascending\\x', `11,2,apple1,Apple2,peach,pear,z11,z2`],
        ['put initlist into x\\0', `0`],
        ['sort items of x numeric\\x', `2,11,apple1,Apple2,peach,pear,z11,z2`],
        ['put initlist into x\\0', `0`],
        ['sort descending items of x numeric\\x', `z2,z11,pear,peach,Apple2,apple1,11,2`],
        [
            longstr(
                `put "pear"&cr&"Apple2"&cr&"z11"&cr&
"z2"&cr&"11"&cr&"2"&cr&"apple1"&cr&"peach" into initlist\\0`,
                ''
            ),
            `0`
        ],
        ['put initlist into x\\0', `0`],
        ['sort lines of x\\x', `11\n2\napple1\nApple2\npeach\npear\nz11\nz2`],
        ['put initlist into x\\0', `0`],
        [
            'sort ascending lines of x text\\x',
            `11\n2\napple1\nApple2\npeach\npear\nz11\nz2`
        ],
        ['put initlist into x\\0', `0`],
        [
            'sort descending lines of x text\\x',
            `z2\nz11\npear\npeach\nApple2\napple1\n2\n11`
        ],
        ['put initlist into x\\0', `0`],
        ['sort lines of x numeric\\x', `2\n11\napple1\nApple2\npeach\npear\nz11\nz2`],
        ['put initlist into x\\0', `0`],
        [
            'sort descending lines of x numeric\\x',
            `z2\nz11\npear\npeach\nApple2\napple1\n11\n2`
        ],
        ['sort xyz items of x\\x', `PREPARSEERR:expect something like`],
        ['sort xyz items of x xyz\\x', `PREPARSEERR:expect something like`],
        ['sort items of x xyz\\x', `ERR:parse err`],
        ['sort xyz of x\\x', `PREPARSEERR:expect something like`],
        ['sort xyz xyz of x\\x', `PREPARSEERR:expect something like`]
    ];
    h.testBatchEvaluate(batch);
    /* cool new sort-by-expression feature */
    batch = [
        ['put "ac,bb,ca" into li\\0', '0'],
        ['sort items of li by char 2 of each\\li', 'ca,bb,ac'],
        ['put "ac" & cr & "bb" & cr & "ca" into li\\0', '0'],
        ['sort lines of li by char 2 of each\\li', 'ca\nbb\nac']
    ];
    h.testBatchEvaluate(batch);
});
t.test('execCommands delete', () => {
    let batch: [string, string][];
    batch = [
        /* not yet supported */
        ['put "abcdef,123,456" into initlist\\0', '0'],
        ['put initlist into x\\0', '0'],
        ['delete cd btn "a1"\\0', 'ERR:not yet supported'],
        ['delete cd fld "a1"\\0', 'ERR:not yet supported'],
        ['delete cd 1\\0', 'ERR:NoViableAltException'],
        ['put "a" into x\ndelete x\\0', 'ERR:5:NoViableAltException'],
        ['put "abcdef,123,456" into x\ndelete item 2 of x\\x', 'ERR:5:not yet supported'],
        [
            'put "abcdef,123,456" into x\ndelete item 1 to 2 of x\\x',
            'ERR:5:not yet supported'
        ],
        [
            'put "abcdef,123,456" into x\ndelete item 999 of x\\x',
            'ERR:5:not yet supported'
        ],
        [
            'put "abcdef,123,456" into x\ndelete word 999 of x\\x',
            'ERR:5:not yet supported'
        ],
        [
            'put "abcdef,123,456" into x\ndelete line 999 of x\\x',
            'ERR:5:not yet supported'
        ],
        [
            'put "abcdef,123,456" into x\ndelete item 1 to 999 of x\\x',
            'ERR:5:not yet supported'
        ],
        [
            'put "abcdef,123,456" into x\ndelete item 2 to 999 of x\\x',
            'ERR:5:not yet supported'
        ],

        /* normal chunks */
        ['put "abcdef,123,456" into initlist\\0', '0'],
        ['put initlist into x\\0', '0'],
        ['delete first char of x\\x', 'bcdef,123,456'],
        ['put initlist into x\\0', '0'],
        ['delete char 2 of x\\x', 'acdef,123,456'],
        ['put initlist into x\\0', '0'],
        ['delete char 2 to 5 of x\\x', 'af,123,456'],

        /* big numbers */
        ['put initlist into x\\0', '0'],
        ['delete char 999 of x\\x', 'abcdef,123,456'],
        ['put initlist into x\\0', '0'],
        ['delete char 2 to 999 of x\\x', 'a'],
        ['put initlist into x\\0', '0'],
        ['delete char 1 to 999 of x\\x', '']
    ];
    h.testBatchEvaluate(batch);
});
t.test('execCommands put', () => {
    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    let batch: [string, string][];
    batch = [
        ['put "abc"\\0', '0'],
        ['put "abc" xyz\\0', 'ERR:MismatchedTokenException'],
        ['put "abc" xyz x\\0', 'ERR:MismatchedTokenException'],
        ['put "abc" xyz cd fld "p1"\\0', 'ERR:MismatchedTokenException'],
        [
            'put "abc" xyz line 1 to into of cd fld "p1"\\0',
            'ERR:MismatchedTokenException'
        ],
        ['put "abc" into line 1 to into of cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" into line 1 to before of cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" into line 1 to after of cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" before line 1 to into of cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" before line 1 to before of cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" before line 1 to after of cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" after line 1 to into of cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" after line 1 to before of cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" after line 1 to after of cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" into into cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" into after cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" into before cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" before into cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" before after cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" before before cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" after into cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" after after cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "abc" after before cd fld "p1"', 'PREPARSEERR:only see one'],
        ['put "ab,cd,ef,12,34,56,78" into inititms\\0', '0'],
        ['put "abcdef,123,456" into initlist\\0', '0'],

        /* empty string into */
        ['put initlist into x\\0', '0'],
        ['put "" into char 2 of x\\x', 'acdef,123,456'],
        ['put initlist into x\\0', '0'],
        ['put "" into char 2 to 5 of x\\x', 'af,123,456'],
        ['put initlist into x\\0', '0'],
        ['put "" into char 999 of x\\x', 'abcdef,123,456'],
        ['put initlist into x\\0', '0'],
        ['put "" into char 888 to 999 of x\\x', 'abcdef,123,456'],
        ['put initlist into x\\0', '0'],
        ['put "" into char 2 to 999 of x\\x', 'a'],

        /* empty string before/after */
        ['put initlist into x\\0', '0'],
        ['put "" before char 2 of x\\x', 'abcdef,123,456'],
        ['put "" after char 2 of x\\x', 'abcdef,123,456'],
        ['put "" before char 2 to 5 of x\\x', 'abcdef,123,456'],
        ['put "" after char 2 to 5 of x\\x', 'abcdef,123,456'],
        ['put "" before char 999 of x\\x', 'abcdef,123,456'],
        ['put "" after char 999 of x\\x', 'abcdef,123,456'],
        ['put "" before char 888 to 999 of x\\x', 'abcdef,123,456'],
        ['put "" after char 888 to 999 of x\\x', 'abcdef,123,456'],

        /* medium sized string into */
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" into char 2 of x\\x', 'aqwertyqwertycdef,123,456'],
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" into char 2 to 5 of x\\x', 'aqwertyqwertyf,123,456'],
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" into char 999 of x\\x', 'abcdef,123,456qwertyqwerty'],
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" into char 888 to 999 of x\\x', 'abcdef,123,456qwertyqwerty'],
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" into char 2 to 999 of x\\x', 'aqwertyqwerty'],

        /* medium sized string before/after */
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" before char 2 of x\\x', 'aqwertyqwertybcdef,123,456'],
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" after char 2 of x\\x', 'abqwertyqwertycdef,123,456'],
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" before char 2 to 5 of x\\x', 'aqwertyqwertybcdef,123,456'],
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" after char 2 to 5 of x\\x', 'abcdeqwertyqwertyf,123,456'],
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" before char 999 of x\\x', 'abcdef,123,456qwertyqwerty'],
        ['put initlist into x\\0', '0'],
        ['put "qwertyqwerty" after char 999 of x\\x', 'abcdef,123,456qwertyqwerty'],
        ['put initlist into x\\0', '0'],
        [
            'put "qwertyqwerty" before char 888 to 999 of x\\x',
            'abcdef,123,456qwertyqwerty'
        ],
        ['put initlist into x\\0', '0'],
        [
            'put "qwertyqwerty" after char 888 to 999 of x\\x',
            'abcdef,123,456qwertyqwerty'
        ],

        /* items */
        ['put inititms into x\\0', '0'],
        ['put "" into item 2 of x\\x', 'ab,,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "" into item 2 to 5 of x\\x', 'ab,,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "" into item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
        ['put inititms into x\\0', '0'],
        ['put "" into item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
        ['put inititms into x\\0', '0'],
        ['put "" into item 2 to 999 of x\\x', 'ab,'],

        /* empty string before/after */
        ['put inititms into x\\0', '0'],
        ['put "" before item 2 of x\\x', 'ab,cd,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "" after item 2 of x\\x', 'ab,cd,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "" before item 2 to 5 of x\\x', 'ab,cd,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "" after item 2 to 5 of x\\x', 'ab,cd,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "" before item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
        ['put inititms into x\\0', '0'],
        ['put "" after item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
        ['put inititms into x\\0', '0'],
        ['put "" before item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
        ['put inititms into x\\0', '0'],
        ['put "" after item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,'],
        ['put inititms into x\\0', '0'],
        ['put "" before item 2 to 12 of x\\x', 'ab,cd,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "" after item 2 to 12 of x\\x', 'ab,cd,ef,12,34,56,78'],

        /* medium sized string into */
        ['put inititms into x\\0', '0'],
        ['put "qwerty" into item 2 of x\\x', 'ab,qwerty,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" into item 2 to 5 of x\\x', 'ab,qwerty,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" into item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" into item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" into item 2 to 12 of x\\x', 'ab,qwerty'],

        /* medium sized string before/after */
        ['put inititms into x\\0', '0'],
        ['put "qwerty" before item 2 of x\\x', 'ab,qwertycd,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" after item 2 of x\\x', 'ab,cdqwerty,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" before item 2 to 5 of x\\x', 'ab,qwertycd,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" after item 2 to 5 of x\\x', 'ab,cd,ef,12,34qwerty,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" before item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" after item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" before item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" after item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" before item 2 to 12 of x\\x', 'ab,qwertycd,ef,12,34,56,78'],
        ['put inititms into x\\0', '0'],
        ['put "qwerty" after item 2 to 12 of x\\x', 'ab,cd,ef,12,34,56,78qwerty'],

        /* with variables that aren't yet defined */
        /* we'll treat it as an empty string, unless you are trying to use with a chunk */
        ['put "abc" into newvar1\\newvar1', 'abc'],
        ['put "abc" before newvar2\\newvar2', 'abc'],
        ['put "abc" after newvar3\\newvar3', 'abc'],
        ['put "abc" into char 2 of newvar4\\0', 'ERR:no variable found'],
        ['put "abc" before char 2 of newvar5\\0', 'ERR:no variable found'],
        ['put "abc" after char 2 of newvar6\\0', 'ERR:no variable found'],
        ['put "abc" into char 2 to 3 of newvar7\\0', 'ERR:no variable found'],
        ['put "abc" before char 2 to 3 of newvar8\\0', 'ERR:no variable found'],
        ['put "abc" after char 2 to 3 of newvar9\\0', 'ERR:no variable found']
    ];
    h.testBatchEvaluate(batch);
});
t.test('execCommands get', () => {
    let batch: [string, string][];
    batch = [
        ['get 1+2\\it', `3`],
        ['get xyz()\\it', `ERR:no handler`],
        ['get the environment\\it', `development`],
        ['get the systemversion\\it', `7.55`],
        ['get the systemversion()\\it', `ERR:parse err`],
        ['get abs(-2)\\it', `2`],
        ['get sum(3,4,5)\\it', `12`],
        ['get - char 1 to 2 of 345\\it', `-34`],
        ['get not true\\it', `false`],
        ['get\\0', `ERR:NoViableAltException`],
        ['get the\\0', `ERR:NoViableAltException`],
        ['put 123 into it\\it', `123`]
    ];
    h.testBatchEvaluate(batch);
});
t.test('execCommands replace', () => {
    let batch: [string, string][];
    batch = [
        /* incorrect usage */
        ['put 123 into replace\\0', `ERR:variable name not allowed`],
        ['replace\\0', `PREPARSEERR:did not see`],
        ['replace with\\0', `ERR:NoViableAltException`],
        ['replace in\\0', `PREPARSEERR:did not see`],
        ['replace "aa" "bb" \\0', `PREPARSEERR:did not see`],
        ['replace "aa" with "bb" \\0', `ERR:MismatchedTokenException`],
        ['replace "aa" in "bb" \\0', `PREPARSEERR:did not see`],
        ['replace with in \\0', `ERR:NoViableAltException`],
        ['replace with "bb" in \\0', `ERR:NoViableAltException`],
        ['replace "aa" with in \\0', `ERR:NoViableAltException`],
        ['replace "aa" with in "bb" \\0', `ERR:NoViableAltException`],
        ['replace "aa" with "bb" in "cc" \\0', `ERR:NoViableAltException`],
        ['replace "aa" with "bb" in 123 \\0', `ERR:NoViableAltException`],
        ['replace "aa" with "bb" in this stack \\0', `ERR:parse err`],
        ['replace "aa" with "bb" in this card \\0', `ERR:parse err`],
        [
            `put "" into s
replace "aa" with "bb" of s
\\s`,
            'ERR:5:MismatchedTokenException'
        ],
        /* correct usage */
        [
            `put "" into s
replace "aa" with "bb" in s
\\s`,
            ''
        ],
        [
            `put "abc" into s
replace "aa" with "bb" in s
\\s`,
            'abc'
        ],
        [
            `put "aa" into s
replace "aa" with "bb" in s
\\s`,
            'bb'
        ],
        [
            `put "aa.aa.aa." into s
replace "aa" with "bb" in s
\\s`,
            'bb.bb.bb.'
        ],
        [
            `put ".aa.aa.aa" into s
replace "aa" with "bb" in s
\\s`,
            '.bb.bb.bb'
        ],
        [
            `put "aaa.aaaa.aaaaa" into s
replace "aa" with "bb" in s
\\s`,
            'bba.bbbb.bbbba'
        ],
        [
            `put "123123" into s
replace "1" with "2" in s
\\s`,
            '223223'
        ],
        [
            `put "123123" into s
put "1" into s1
put "2" into s2
replace s1 with s2 in s
\\s`,
            '223223'
        ],
        [
            `put "aaAA" into s
replace "aa" with "bb" in s
\\s`,
            'bbAA'
        ],
        [
            `put "cc aa aa bb" into s
replace "aa" with "bb" in s
\\s`,
            'cc bb bb bb'
        ],
        [
            `put "cc aa aa bb" into s
replace "a" & "a" with "b" & "b" in s
\\s`,
            'cc bb bb bb'
        ],
        /* test with empty string */
        [
            `put "cc aa aa bb" into s
replace "aa" with "" in s
\\s`,
            'cc   bb'
        ],
        [
            `put "cc aa aa bb" into s
replace "" with "bb" in s
\\s`,
            'ERR:5:empty string'
        ],
        [
            `put "cc aa aa bb" into s
replace "" with "" in s
\\s`,
            'ERR:5:empty string'
        ],
        /* use regex trip-up chars */
        [
            `put "a**a" into s
replace "*" with "**" in s
\\s`,
            'a****a'
        ],
        [
            `put "a%$a" into s
replace "%$" with "*" in s
\\s`,
            'a*a'
        ],
        [
            `put "abba" into s
replace "b" with "$&" in s
\\s`,
            'a$&$&a'
        ]
    ];
    h.testBatchEvaluate(batch);

    /* use a real field */
    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_b_c);
    batch = [
        [
            `put "" into cd fld "p1"
replace "1" with "2" in cd fld ("p" & "1")
\\cd fld "p1"`,
            ''
        ],
        [
            `put "123123" into cd fld "p1"
replace "1" with "2" in cd fld "p1"
\\cd fld "p1"`,
            '223223'
        ],
        [
            `put "cc aa aa bb" into cd fld "p1"
replace "aa" with "bb" in cd fld "p1"
\\cd fld "p1"`,
            'cc bb bb bb'
        ],
        [
            `put "cc aa aa bb" into cd fld "p1"
replace "aa" with "bb" in cd btn "p1"
\\cd fld "p1"`,
            'ERR:5:placing text'
        ],
        [
            `put "cc aa aa bb" into cd fld "p1"
replace "aa" with "bb" in cd fld "pnotexist"
\\cd fld "p1"`,
            'ERR:5:not found'
        ]
    ];
    h.testBatchEvaluate(batch);
});
t.test('dynamicCode do', () => {
    let batch: [string, string][];
    batch = [
        /* valid */
        ['global g\ndo "global g" & cr & "put 1+1 into g"\\g', '2'],
        ['global g\ndo "global g" & cr & "put 2+2 into g"\\g', '4'],
        ['global g\ndo ("global g" & cr & "put 3+3 into g")\\g', '6'],
        [
            'global g\ndo ("global g" & cr & "put 64 into t" & cr & "put sqrt(t) into g")\\g',
            '8'
        ],
        ['put "put 0 into x" into code\ndo code\\0', '0'],
        ['put "" into code\ndo code\\0', '0'],
        /* runtime error */
        [
            'global g\ndo ("global g" & cr & "put abcde into g")\\g',
            'ERR:5:no variable found'
        ],
        ['global g\ndo "callNonExist"\\g', 'ERR:5:of this name found'],
        /* lex error */
        ['put "$$$" into code\ndo code\\0', 'ERR:5:lex error'],
        ['put "put " & quote & "unterminated" into code\ndo code\\0', 'ERR:5:unexpected'],
        /* syntax error */
        ['put "on abc" into code\ndo code\\0', 'ERR:5:cannot begin'],
        ['put "end if" into code\ndo code\\0', 'ERR:5:outside of if'],
        ['put "if true then" into code\ndo code\\0', 'ERR:5:interleaved'],
        ['put "put" into code\ndo code\\0', 'ERR:5:not enough args'],
        ['put 123 into do\\0', `ERR:variable name not allowed`],
        /* nested (do calls do) */
        ['put counting() into cfirst\\counting() - cfirst', '1'],
        [
            `
put counting() into cfirst
put "put counting() into incremented" into code1
put ("do " & quote & code1 & quote) into code2
do code2\\counting() - cfirst`,
            '2'
        ],
        /* nested (do calls do calls do) */
        [
            `
put counting() into cfirst
put "" into s
put "do (" after s
put quote & "do" & quote after s
put " & quote & " after s
put quote & "put counting() into incremented" & quote after s
put " & quote )" after s
do s\\counting() - cfirst`,
            '2'
        ]
    ];

    h.testBatchEvaluate(batch);
});
t.test('dynamicCode send', () => {
    h.pr.setCurCardNoOpenCardEvt(h.elIds.card_a_a);
    let batch: [string, string][];
    batch = [
        /* valid */
        [
            `global g
        put "global g" & cr & "put the short id of me into g" into code
        send code to cd fld id ${h.elIds.fld_c_d_1}\\g`,
            `${h.elIds.fld_c_d_1}`
        ],
        [
            `global g
        put "global g" & cr & "put the short id of me into g" into code
        send code to cd btn id ${h.elIds.btn_b_c_1}\\g`,
            `${h.elIds.btn_b_c_1}`
        ],
        [
            `global g
        put "global g" & cr & "put the short id of me into g" into code
        send code to card "a"\\g`,
            `${h.elIds.card_a_a}`
        ],
        [
            `global g
        put "global g" & cr & "put the short id of me into g" into code
        send code to card id ${h.elIds.card_c_d}\\g`,
            `${h.elIds.card_c_d}`
        ],
        [
            `global g
        put "global g" & cr & "put the short id of me into g" into code
        send code to bg "b"\\g`,
            `${h.elIds.bg_b}`
        ],
        [
            `global g
put "global g" & cr & "put the short id of me into g" into code
send code to this stack\\g`,
            `${h.elIds.stack}`
        ],
        /* not valid */
        ['send\\0', 'PREPARSEERR:too short'],
        ['send "put 1 into x"\\0', 'ERR:MismatchedTokenException'],
        ['send to\\0', 'ERR:NoViableAltException'],
        ['send to this stack\\0', 'ERR:NoViableAltException'],
        ['send "put 1 into x" to\\0', 'ERR:NoViableAltException'],
        ['send "put 1 into x" this stack\\0', 'ERR:MismatchedTokenException'],
        ['send "put 1 into x" of this stack\\0', 'ERR:MismatchedTokenException'],
        ['send "put 1 into x" to "string"\\0', 'ERR:expected something like'],
        ['put 123 into send\\0', `ERR:variable name not allowed`],
        /* syntax error in sent code */
        ['send "put" to this stack\\0', 'ERR:4:not enough args'],
        ['send "put 1 into" to this stack\\0', 'ERR:4:parse err'],
        ['send "put \'1 into" to this stack\\0', 'ERR:4:lex error'],
        ['send "put " & quote & "1 into" to this stack\\0', 'ERR:4:unexpected character'],
        ['send "on h" to this stack\\0', 'ERR:4:cannot begin'],
        ['send "put 10 11 into x" to this stack\\0', 'ERR:4:MismatchedTokenException'],
        ['send "put 1 into cd fld id 99999" to this stack\\0', 'ERR:4:element not found'],
        /* not exist */
        ['send "put 1 into x" to card 10\\0', "ERR:target of 'send' not found"],
        ['send "put 1 into x" to bg "notfound"\\0', "ERR:target of 'send' not found"],
        ['send "put 1 into x" to cd btn 99999\\0', "ERR:target of 'send' not found"],
        ['send "put 1 into x" to cd btn id 99999\\0', "ERR:target of 'send' not found"]
    ];
    h.testBatchEvaluate(batch);

    /* make sure that invalid code is cleaned out after a preparse failure. */
    let stack = h.vcstate.vci.getModel().getById(VpcElStack, h.elIds.stack);
    h.vcstate.vci.undoableAction(() => stack.set('script', ``));
    batch = [['send "$$$#$%#$" to this stack\\0', 'ERR:4:lex error']];
    h.testBatchEvaluate(batch);
    batch = [
        [
            `global g
put "global g" & cr & "put the short id of me into g" into code
send code to this stack\\g`,
            `${h.elIds.stack}`
        ]
    ];
    h.testBatchEvaluate(batch);

    /* make sure that code can run after a runtime failure. */
    h.vcstate.vci.undoableAction(() => stack.set('script', ``));
    batch = [
        ['send "put 1 into cd fld 999" to this stack\\0', 'ERR:4:element not found']
    ];
    h.testBatchEvaluate(batch);
    batch = [
        [
            `global g
put "global g" & cr & "put the short id of me into g" into code
send code to this stack\\g`,
            `${h.elIds.stack}`
        ]
    ];
    h.testBatchEvaluate(batch);

    /* calling as a handler, like the original product could do */
    let v = h.vcstate.vci.getModel().getById(VpcElButton, h.elIds.btn_b_c_1);
    h.vcstate.vci.undoableAction(() =>
        v.set(
            'script',
            `
on myCompute a, b
return a * a + b
end myCompute`
        )
    );
    batch = [
        [
            `send "myCompute 2, 3" to cd btn id ${h.elIds.btn_b_c_1}
        \\the result`,
            `7`
        ],
        [
            `send "myCompute 2, 3" & cr & "return the result" to cd btn id ${h.elIds.btn_b_c_1}
        \\the result`,
            `7`
        ]
    ];
    h.testBatchEvaluate(batch);

    /* calling as a function */
    h.vcstate.vci.undoableAction(() =>
        v.set(
            'script',
            `
function myCompute a, b
return a * a + b
end myCompute`
        )
    );
    batch = [
        [
            `send "myCompute(2, 3)" to cd btn id ${h.elIds.btn_b_c_1}
        \\the result`,
            `ERR:4:this isn't C`
        ],
        [
            `send "return myCompute(3, 3)" to cd btn id ${h.elIds.btn_b_c_1}
        \\the result`,
            `12`
        ]
    ];
    h.testBatchEvaluate(batch);

    /* calling as a function (can access others in that scope) */
    h.vcstate.vci.undoableAction(() =>
        v.set(
            'script',
            `
function myDouble a
return a * 2
end myDouble

function myCompute a, b
return myDouble(a) + myDouble(b)
end myCompute`
        )
    );
    batch = [
        [
            `send "return myCompute(2, 3)" to cd btn id ${h.elIds.btn_b_c_1}
        \\the result`,
            `10`
        ]
    ];
    h.testBatchEvaluate(batch);

    /* the 'result' must be cleared out between calls */
    let codeBefore = `
function sometimesSetResult p
    if p>=1 then return p * 2
end sometimesSetResult`
let got = h.testOneEvaluate('', 'sometimesSetResult(1) & sometimesSetResult(0) & "a"', undefined, undefined, codeBefore )
assertWarnEq('2a', got.readAsString(), '')
    codeBefore = `
on sometimesSetResult p
    if p>=1 then return p * 2
end sometimesSetResult`
got = h.testOneEvaluate('', 'sometimesSetResult(1) & sometimesSetResult(0) & "a"', undefined, undefined, codeBefore )
assertWarnEq('2a', got.readAsString(), '')
codeBefore = `
function sometimesSetResult p
    if length(the result) > 0 then return "hmm"
    if p>=1 then return p * 2
end sometimesSetResult`
 got = h.testOneEvaluate('', 'sometimesSetResult(1) & sometimesSetResult(0) & "a"', undefined, undefined, codeBefore )
assertWarnEq('2a', got.readAsString(), '')

/* sending an event down, it can bubble back up */

h.vcstate.vci.undoableAction(() =>
h.vcstate.model.stack.set(
            'script',
            `
function myCompute a, b
return a * a + b
end myCompute

on doTest
    send "myCompute 3, 4" to cd btn id ${h.elIds.btn_go}
    return the result
end doTest
`
        )
    );
    got = h.testOneEvaluate('', 'doTest()' )
    assertWarnEq('13', got.readAsString(), '')

/* unless it is overridden in the button */
    let differentFn = `
function myCompute a, b
    return 0
end myCompute`
got = h.testOneEvaluate('', 'doTest()', undefined, undefined, differentFn )
    assertWarnEq('0', got.readAsString(), '')

/* or it is overridden in the card */
h.vcstate.vci.undoableAction(() =>
h.vcstate.model.getCurrentCard().set(
            'script',
            `
function myCompute a, b
    return 1
end myCompute`
        )
    );
    got = h.testOneEvaluate('', 'doTest()' )
    assertWarnEq('1', got.readAsString(), '')

});
