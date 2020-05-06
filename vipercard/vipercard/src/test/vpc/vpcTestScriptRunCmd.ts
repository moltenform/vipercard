
/* auto */ import { BatchType, ScriptTestBatch, TestVpcScriptRunBase } from './vpcTestScriptRunBase';
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
    /* not valid tools */
    let b = new ScriptTestBatch();
    b.t('choose tool\\tool()', 'ERR:not a valid tool');
    b.t('choose pencil def tool\\tool()', 'ERR:NotAllInputParsedException');
    b.t('choose tool 3 tool\\tool()', 'ERR:Redundant input');
    b.t('choose tool "pencil" tool\\tool()', 'ERR:NotAllInputParsedException');
    b.t('choose tool "pencil" xyz\\tool()', 'ERR:NotAllInputParsedException');
    b.t('choose tool "pencil" "tool"\\tool()', 'ERR:NotAllInputParsedException');
    b.t('choose\\0', 'PREPARSEERR:not enough args');
    b.t('choose brush\\0', 'PREPARSEERR:tool');
    b.t('choose 3\\0', 'PREPARSEERR:tool');
    b.t('choose pencil\\0', 'PREPARSEERR:tool');
    b.t('choose abc\\0', 'PREPARSEERR:tool');
    b.t('choose pencil def\\0', 'PREPARSEERR:tool');
    b.t('choose "pencil" xyz\\0', 'PREPARSEERR:tool');
    b.t('choose "pencil" "tool"\\0', 'PREPARSEERR:tool');

    /* our new preferred style */
    b.t('choose "browse" tool\\tool()', 'browse');
    b.t('choose "button" tool\\tool()', 'ERR:drawing only');
    b.t('choose "field" tool\\tool()', 'ERR:drawing only');
    b.t('choose "select" tool\\tool()', 'ERR:drawing only');
    b.t('choose "brush" tool\\tool()', 'brush');
    b.t('choose "bucket" tool\\tool()', 'bucket');
    b.t('choose "stamp" tool\\tool()', 'ERR:drawing only');
    b.t('choose "pencil" tool\\tool()', 'pencil');
    b.t('choose "line" tool\\tool()', 'line');
    b.t('choose "curve" tool\\tool()', 'curve');
    b.t('choose "lasso" tool\\tool()', 'ERR:drawing only');
    b.t('choose "eraser" tool\\tool()', 'eraser');
    b.t('choose "rect" tool\\tool()', 'rect');
    b.t('choose "oval" tool\\tool()', 'oval');
    b.t('choose "roundrect" tool\\tool()', 'roundrect');
    b.t('choose "spray" tool\\tool()', 'spray');
    b.t('choose "spray can" tool\\tool()', 'spray');
    b.t('choose "round rect" tool\\tool()', 'roundrect');
    b.t('choose "round  rect" tool\\tool()', 'roundrect');
    b.t('choose "xyz" tool\\tool()', 'ERR:Not a valid choice');
    b.t('choose "" tool\\tool()', 'ERR:valid tool name');

    /* classic style */
    b.t('choose browse tool\\tool()', 'browse');
    b.t('choose button tool\\tool()', 'ERR:drawing only');
    b.t('choose field tool\\tool()', 'ERR:drawing only');
    b.t('choose select tool\\tool()', 'ERR:drawing only');
    b.t('choose brush tool\\tool()', 'brush');
    b.t('choose bucket tool\\tool()', 'bucket');
    b.t('choose stamp tool\\tool()', 'ERR:drawing only');
    b.t('choose pencil tool\\tool()', 'pencil');
    b.t('choose line tool\\tool()', 'line');
    b.t('choose curve tool\\tool()', 'curve');
    b.t('choose lasso tool\\tool()', 'ERR:drawing only');
    b.t('choose eraser tool\\tool()', 'eraser');
    b.t('choose rect tool\\tool()', 'rect');
    b.t('choose oval tool\\tool()', 'oval');
    b.t('choose roundrect tool\\tool()', 'roundrect');
    b.t('choose spray tool\\tool()', 'spray');
    b.t('choose spray can tool\\tool()', 'spray');
    b.t('choose round rect tool\\tool()', 'roundrect');
    b.t('choose round  rect tool\\tool()', 'roundrect');
    b.t('choose xyz tool\\tool()', 'ERR:no variable found');

    /* numeric style */
    b.t('choose tool 1\\tool()', 'browse');
    b.t('choose tool 2\\tool()', 'ERR:drawing only');
    b.t('choose tool 4\\tool()', 'ERR:drawing only');
    b.t('choose tool 9\\tool()', 'line');
    b.t('choose tool 10\\tool()', 'spray');
    b.t('choose tool 15\\tool()', 'curve');
    b.t('choose tool 17\\tool()', 'ERR:unknown or unsupported');
    b.t('choose tool 99\\tool()', 'ERR:unknown or unsupported');
    b.t('choose tool 0\\tool()', 'ERR:unknown or unsupported');
    b.t('choose tool -1\\tool()', 'ERR:unknown or unsupported');

    /* we'll allow this */
    b.t('choose tool "pencil"\\tool()', 'pencil');
    b.t('choose 10 tool\\tool()', 'spray');

    /* by expression */
    b.t('choose "pen" & "cil" tool\\tool()', 'pencil');
    b.t('choose ("pen" & "cil") tool\\tool()', 'pencil');
    b.t('put "pencil" into x\nchoose x tool\\tool()', 'pencil');
    b.t('put "spray can" into x\nchoose x tool\\tool()', 'spray');
    b.t('put "spray can" into x\nchoose (x) tool\\tool()', 'spray');
    b.t('choose tool 10 + 5\\tool()', 'curve');
    b.t('choose tool 100/10\\tool()', 'spray');
    b.t('choose tool (10 - 1)\\tool()', 'line');
    b.t('put 15 into x\nchoose tool x\\tool()', 'curve');
    b.t('put 15 into x\nchoose tool (x)\\tool()', 'curve');

    b.batchEvaluate(h);
});
t.test('execCommands arithmetic invalid parse', () => {
    /* add, subtract, divide, multiply */
    let b = new ScriptTestBatch();
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);
    h.runGeneralCode('', 'put "0" into cd fld "p1"');
    b.t('add 4 with cd fld "p1"\\0', 'ERR:4:MismatchedTokenException');
    b.t('add 4 into cd fld "p1"\\0', 'ERR:4:MismatchedTokenException');
    b.t('add 4 from cd fld "p1"\\0', 'ERR:4:MismatchedTokenException');
    b.t('add 4 from cd fld "to"\\0', 'ERR:4:MismatchedTokenException');
    b.t('add 4 to\\0', 'ERR:4:NoViableAltException');
    b.t('add to cd fld "p1"\\0', 'ERR:4:NoViableAltException');
    b.t('subtract 4 with cd fld "p1"\\0', 'PREPARSEERR:3:did not see');
    b.t('subtract 4 into cd fld "p1"\\0', 'PREPARSEERR:3:did not see');
    b.t('subtract 4 to cd fld "p1"\\0', 'PREPARSEERR:3:did not see');
    b.t('subtract 4 to cd fld "from"\\0', 'PREPARSEERR:3:did not see');
    b.t('subtract 4 from\\0', 'ERR:4:NoViableAltException');
    b.t('subtract from cd fld "p1"\\0', 'ERR:4:NoViableAltException');
    b.t('divide cd fld "p1"\\0', 'PREPARSEERR:3:did not see');
    b.t('divide cd fld "p1" to 4\\0', 'PREPARSEERR:3:did not see');
    b.t('divide cd fld "p1" with 4\\0', 'PREPARSEERR:3:did not see');
    b.t('divide cd fld "p1" from 4\\0', 'PREPARSEERR:3:did not see');
    b.t('divide cd fld "by" from 4\\0', 'PREPARSEERR:3:did not see');
    b.t('divide cd fld "p1" by\\0', 'ERR:4:NoViableAltException');
    b.t('multiply cd fld "p1"\\0', 'PREPARSEERR:3:did not see');
    b.t('multiply cd fld "p1" to 4\\0', 'PREPARSEERR:3:did not see');
    b.t('multiply cd fld "p1" with 4\\0', 'PREPARSEERR:3:did not see');
    b.t('multiply cd fld "p1" from 4\\0', 'PREPARSEERR:3:did not see');
    b.t('multiply cd fld "by" from 4\\0', 'PREPARSEERR:3:did not see');
    b.t('multiply cd fld "p1" by\\0', 'ERR:4:NoViableAltException');
    b.batchEvaluate(h);
});
t.test('execCommands arithmetic valid', () => {
    let b = new ScriptTestBatch();

    /* operations */
    b.t('put 4 into x\\x', '4');
    b.t('add (1+2) to x\\x', '7');
    b.t('subtract (1+2) from x\\x', '4');
    b.t('multiply x by (1+2)\\x', '12');
    b.t('divide x by (1+3)\\x', '3');

    /* operations, field */
    b.t('put "4" into cd fld "p1"\\0', '0');
    b.t('add (1+2) to cd fld "p1"\\cd fld "p1"', '7');
    b.t('subtract (1+2) from cd fld "p1"\\cd fld "p1"', '4');
    b.t('multiply cd fld "p1" by (1+2)\\cd fld "p1"', '12');
    b.t('divide cd fld "p1" by (1+3)\\cd fld "p1"', '3');

    /* by item */
    b.t('put "3,4,5" into x\\0', '0');
    b.t('add (1+2) to item 2 of x\\item 2 of x', '7');
    b.t('subtract (1+2) from item 2 of x\\item 2 of x', '4');
    b.t('multiply item 2 of x by (1+2)\\item 2 of x', '12');
    b.t('divide item 2 of x by (1+3)\\item 2 of x', '3');
    b.t('chartonum(x=="3,3,5")', '116');

    /* by word */
    b.t('put "3  4  5" into x\\0', '0');
    b.t('add (1+2) to word 2 of x\\word 2 of x', '7');
    b.t('subtract (1+2) from word 2 of x\\word 2 of x', '4');
    b.t('multiply word 2 of x by (1+2)\\word 2 of x', '12');
    b.t('divide word 2 of x by (1+3)\\word 2 of x', '3');
    b.t('chartonum(x=="3  3  5")', '116');

    /* by char */
    b.t('put "345" into x\\0', '0');
    b.t('add (1+2) to char 2 to 2 of x\\x', '375');
    b.t('subtract (1+2) from char 2 to 2 of x\\x', '345');
    b.t('multiply char 2 to 2 of x by (1+2)\\x', '3125');
    b.t('divide char 2 to 3 of x by (1+3)\\x', '335');

    /* not a number */
    b.t('put "4a" into cd fld "p2"\\0', '0');
    b.t('add (1+2) to cd fld "p2"\\cd fld "p2"', 'ERR:expected a number');
    b.t('subtract (1+2) from cd fld "p2"\\cd fld "p2"', 'ERR:expected a number');
    b.t('multiply cd fld "p2" by (1+2)\\cd fld "p2"', 'ERR:expected a number');
    b.t('divide cd fld "p2" by (1+3)\\cd fld "p2"', 'ERR:expected a number');

    /* to match original product, allow Lvl3Expressions */
    b.t('put 1 into x\n add 1&1 to x\\x', '12');
    b.t('put 1 into x\n add 1+1 to x\\x', '3');
    b.t('put 1 into x\n add 1*1 to x\\x', '2');
    b.t('put 1 into x\n subtract 1&1 from x\\x', '-10');
    b.t('put 1 into x\n subtract 1+1 from x\\x', '-1');
    b.t('put 1 into x\n subtract 1*1 from x\\x', '0');
    b.t('put 1 into x\n multiply x by 1&1\\x', '11');
    b.t('put 1 into x\n multiply x by 1+1\\x', '2');
    b.t('put 1 into x\n multiply x by 1*1\\x', '1');
    b.t('put 22 into x\n divide x by 1&1\\x', '2');
    b.t('put 22 into x\n divide x by 1+1\\x', '11');
    b.t('put 22 into x\n divide x by 1*1\\x', '22');

    b.batchEvaluate(h, BatchType.floatingPoint);
});
t.test('execCommands go to card', () => {
    /* changing current card */
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);
    h.assertPreparseErrLn('go', 'on its own', 3);
    h.assertLineErr('go "a"', 'something like', 3);
    h.assertLineErr('go 1', 'NoViableAltException', 3);
    h.assertLineErr('go xyz', 'no variable found', 3);
    let b = new ScriptTestBatch();

    /* go by id */
    b.t(
        `go card 1\ngo to card id ${h.ids.cdBD}\\the short id of this cd`,
        `${h.ids.cdBD}`
    );

    /* going to nonexistant cards is a no-op,
confirmed in emulator */
    b.t(`go card 1\ngo to cd id 8888\\the short id of this cd`, `${h.ids.cdA}`);
    b.t(`go card 1\ngo to cd "notexist"\\the short id of this cd`, `${h.ids.cdA}`);
    b.t(`go card 1\ngo to bg 8888\\the short id of this cd`, `${h.ids.cdA}`);

    /* going to different types of objects is an error,
confirmed in emulator  */
    b.t(
        `go card id ${h.ids.cdBC}\ngo to cd btn "p1"\\the short id of this cd`,
        `ERR:5:Cannot go to a`
    );
    b.t(
        `go card id ${h.ids.cdBC}\ngo to cd fld 1\\the short id of this cd`,
        `ERR:5:Cannot go to a`
    );
    b.t(`go to vipercard\\the short id of this cd`, `ERR:expected a number`);
    b.t(`go card 1\ngo to cd btn id 1\\the short id of this cd`, `${h.ids.cdA}`);

    /* go by id */
    b.t(
        `go card 1\ngo to card id ${h.ids.cdBD}\\the short id of this cd`,
        `${h.ids.cdBD}`
    );
    b.t(
        `go card 1\ngo to card id ${h.ids.cdCD}\\the short id of this cd`,
        `${h.ids.cdCD}`
    );

    /* go by number */
    b.t('go to card 1\\the short id of this cd', `${h.ids.cdA}`);
    b.t('go to card 2\\the short id of this cd', `${h.ids.cdBB}`);
    b.t('go to card 3\\the short id of this cd', `${h.ids.cdBC}`);
    b.t('go to card 4\\the short id of this cd', `${h.ids.cdBD}`);
    b.t('go to card 5\\the short id of this cd', `${h.ids.cdCD}`);

    /* get by relative (tests getCardByOrdinal) */
    b.t('go to card 1\\the short id of next cd', `${h.ids.cdBB}`);
    b.t('go to card 2\\the short id of next cd', `${h.ids.cdBC}`);
    b.t('go to card 3\\the short id of next cd', `${h.ids.cdBD}`);
    b.t('go to card 4\\the short id of next cd', `${h.ids.cdCD}`);
    b.t('go to card 2\\the short id of prev cd', `${h.ids.cdA}`);
    b.t('go to card 3\\the short id of prev cd', `${h.ids.cdBB}`);
    b.t('go to card 4\\the short id of prev cd', `${h.ids.cdBC}`);
    b.t('go to card 5\\the short id of prev cd', `${h.ids.cdBD}`);

    /* ord/position */
    b.t('go to card 3\\the short id of this cd', `${h.ids.cdBC}`);
    b.t('go next\\the short id of this cd', `${h.ids.cdBD}`);
    b.t('go prev\\the short id of this cd', `${h.ids.cdBC}`);
    b.t('go previous\\the short id of this cd', `${h.ids.cdBB}`);
    b.t('go next\\the short id of this cd', `${h.ids.cdBC}`);
    b.t('go first\\the short id of this cd', `${h.ids.cdA}`);
    b.t('go last\\the short id of this cd', `${h.ids.cdCD}`);
    b.t('go third\\the short id of this cd', `${h.ids.cdBC}`);

    /* should wrap around */
    b.t('go first\ngo prev\\the short id of this cd', `${h.ids.cdCD}`);
    b.t('go last\ngo next\\the short id of this cd', `${h.ids.cdA}`);

    /* reference by name */
    b.t('go card 1\ngo to card "a"\\the short id of this cd', `${h.ids.cdA}`);
    b.t('go card 1\ngo to card "b"\\the short id of this cd', `${h.ids.cdBB}`);
    b.t('go card 1\ngo to card "c"\\the short id of this cd', `${h.ids.cdBC}`);
    b.t('go card 1\ngo to card "d"\\the short id of this cd', `${h.ids.cdBD}`);
    b.t(
        'go card 1\ngo to card "d" of bg 2\\the short id of this cd',
        `${h.ids.cdBD}`
    );
    b.t(
        'go card 1\ngo to card "d" of bg 3\\the short id of this cd',
        `${h.ids.cdCD}`
    );

    /* confirmed in emulator: if there are ambiguous card names,
use whichever comes first in the stack, regardless of current bg */
    b.t(
        `go card id ${h.ids.cdA}\ngo to card "d"\\the short id of this cd`,
        `${h.ids.cdBD}`
    );
    b.t(
        `go card id ${h.ids.cdBD}\ngo to card "d"\\the short id of this cd`,
        `${h.ids.cdBD}`
    );
    b.t(
        `go card id ${h.ids.cdCD}\ngo to card "d"\\the short id of this cd`,
        `${h.ids.cdBD}`
    );

    /* reference by bg */
    b.t('go to card 1\ngo to bg 1\\the short id of this cd', `${h.ids.cdA}`);
    b.t('go to card 2\ngo to bg 1\\the short id of this cd', `${h.ids.cdA}`);
    b.t('go to card 2\ngo to bg 2\\the short id of this cd', `${h.ids.cdBB}`);
    b.t('go to card 5\ngo to bg 2\\the short id of this cd', `${h.ids.cdBB}`);
    b.t('go to card 5\ngo to bg 3\\the short id of this cd', `${h.ids.cdCD}`);
    b.t('go to card 2\ngo to bg 3\\the short id of this cd', `${h.ids.cdCD}`);

    /* confirmed in emulator: if sent to the same bg,
do not change the current card */
    b.t('go to card 2\ngo to bg 2\\the short id of this cd', `${h.ids.cdBB}`);
    b.t('go to card 3\ngo to bg 2\\the short id of this cd', `${h.ids.cdBC}`);
    b.t('go to card 4\ngo to bg 2\\the short id of this cd', `${h.ids.cdBD}`);

    /* object reference */
    b.t('go third\ngo to this stack\\the short id of this cd', `${h.ids.cdBC}`);
    b.t('go third\ngo to stack "other"\\the short id of this cd', `${h.ids.cdBC}`);
    b.t('go third\ngo to stack id 999\\the short id of this cd', `${h.ids.cdBC}`);
    b.t(
        `go third\ngo to stack id ${h.vcstate.model.stack.id}\\the short id of this cd`,
        `${h.ids.cdBC}`
    );
    b.t('go to card 1 of this stack\\the short id of this cd', `${h.ids.cdA}`);
    b.t('go to card 4 of this stack\\the short id of this cd', `${h.ids.cdBD}`);
    b.t('go to card 1 of bg 2\\the short id of this cd', `${h.ids.cdBB}`);
    b.t('go to card 1 of bg 3\\the short id of this cd', `${h.ids.cdCD}`);
    b.t(
        'go to card 1 of bg 2 of this stack\\the short id of this cd',
        `${h.ids.cdBB}`
    );
    b.t(
        'go to card 1 of bg 3 of this stack\\the short id of this cd',
        `${h.ids.cdCD}`
    );

    /* go by variable lookup - correct, confirmed in emulator */
    b.t(
        longstr(`go card 1{{NEWLINE}}put "card id ${h.ids.cdBD}" into
                xx{{NEWLINE}}go to xx\\the short id of this cd`),
        `${h.ids.cdBD}`
    );
    b.t(
        longstr(`go card 1{{NEWLINE}}put the long id of card id ${h.ids.cdBD} into
                xx{{NEWLINE}}go to xx\\the short id of this cd`),
        `${h.ids.cdBD}`
    );
    b.t(
        longstr(`go card 1{{NEWLINE}}put the short name of card id ${h.ids.cdBD} into
                xx{{NEWLINE}}go to card xx\\the short id of this cd`),
        `${h.ids.cdBD}`
    );

    /* go by variable lookup - incorrect, confirmed in emulator */
    b.t(
        longstr(`go card 1{{NEWLINE}}put "card id ${h.ids.cdBD}" into xx{{NEWLINE}}go to
                card xx\\the short id of this cd`),
        `${h.ids.cdA}`
    );
    b.t(
        longstr(`go card 1{{NEWLINE}}put "cd id ${h.ids.cdBC}" into
                xx{{NEWLINE}}go to card xx\\the short id of this cd`),
        `${h.ids.cdA}`
    );
    b.t(
        longstr(`go card 1{{NEWLINE}}put the long id of cd id ${h.ids.cdBC} into
                xx{{NEWLINE}}go to card xx\\the short id of this cd`),
        `${h.ids.cdA}`
    );
    b.batchEvaluate(h);
});
t.test('execCommands disable and enable', () => {
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);
    let b = new ScriptTestBatch();

    /* not valid */
    b.t('enable cd 1', `ERR:MismatchedTokenException`);
    b.t('enable bg 1', `ERR:MismatchedTokenException`);
    b.t('enable cd fld "p1"', `ERR:MismatchedTokenException`);
    b.t('disable cd 1', `ERR:MismatchedTokenException`);
    b.t('disable bg 1', `ERR:MismatchedTokenException`);
    b.t('disable cd fld "p1"', `ERR:MismatchedTokenException`);

    /* valid */
    b.t('disable cd btn "p1"\\the enabled of cd btn "p1"', `false`);
    b.t('disable cd btn "p1"\\the enabled of cd btn "p1"', `false`);
    b.t('enable cd btn "p1"\\the enabled of cd btn "p1"', `true`);
    b.t('enable cd btn "p1"\\the enabled of cd btn "p1"', `true`);
    b.batchEvaluate(h);
});
t.test('execCommands hide and show', () => {
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);
    let b = new ScriptTestBatch();

    /* not valid */
    b.t('hide\\0', `ERR:NoViableAltException`);
    b.t('hide cd 1\\0', `ERR:NoViableAltException`);
    b.t('hide bg 1\\0', `ERR:NoViableAltException`);
    b.t('hide this stack\\0', `ERR:parse err`);
    b.t('show\\0', `ERR:NoViableAltException`);
    b.t('show cd 1\\0', `ERR:parse error`);
    b.t('show bg 1\\0', `ERR:NoViableAltException`);
    b.t('show this stack\\0', `ERR:parse error`);
    b.t('show cd btn "p1" from 12, 23\\0', `ERR:must be show *at*`);
    b.t('show cd btn "p1" into 12, 23\\0', `ERR:must be show *at*`);
    b.t('show cd btn "p1" xyz 12, 23\\0', `ERR:must be show *at*`);
    b.t('show cd btn "p1" at 12\\0', `ERR:Not a list`);
    b.t('show cd btn "p1" at "12a,23"\\0', `ERR:Not a list`);
    b.t('show cd btn "p1" at "12,23a"\\0', `ERR:Not a list`);
    b.t('show cd btn "p1" at 12, 23, 34\\0', `ERR:parse err`);
    b.t('show cd btn "p1" at "12", "23", "34"\\0', `ERR:parse err`);
    b.t('show cd btn "p1" at "12, 23, 34"\\0', `ERR:expected 2 numbers`);

    /* valid */
    b.t('hide cd btn "p1"\\the visible of cd btn "p1"', `false`);
    b.t('hide cd btn "p1"\\the visible of cd btn "p1"', `false`);
    b.t('show cd btn "p1"\\the visible of cd btn "p1"', `true`);
    b.t('show cd btn "p1"\\the visible of cd btn "p1"', `true`);
    b.t('hide cd fld "p1"\\the visible of cd fld "p1"', `false`);
    b.t('hide cd fld "p1"\\the visible of cd fld "p1"', `false`);
    b.t('show cd fld "p1"\\the visible of cd fld "p1"', `true`);
    b.t('show cd fld "p1"\\the visible of cd fld "p1"', `true`);

    /* set locations */
    b.t('set the rect of cd btn "p1" to 10, 20, 40, 60\\0', `0`);
    b.t('show cd btn "p1" at 123, 234\\the loc of cd btn "p1"', `123,234`);
    b.t('show cd btn "p1" at 12, 23\\the loc of cd btn "p1"', `12,23`);
    b.t('show cd btn "p1" at "12", "23"\\the loc of cd btn "p1"', `12,23`);
    b.t('show cd btn "p1" at "13,24"\\the loc of cd btn "p1"', `13,24`);
    b.t('show cd btn "p1" at (12), (" 23 ")\\the loc of cd btn "p1"', `12,23`);
    b.t('set the rect of cd fld "p1" to 10, 20, 40, 60\\0', `0`);
    b.t('show cd fld "p1" at 123, 234\\the loc of cd fld "p1"', `123,234`);
    b.t('show cd fld "p1" at 12, 23\\the loc of cd fld "p1"', `12,23`);
    b.t('show cd fld "p1" at "12", "23"\\the loc of cd fld "p1"', `12,23`);
    b.t('show cd fld "p1" at "12, 23"\\the loc of cd fld "p1"', `12,23`);
    b.t('show cd fld "p1" at (12), (" 23 ")\\the loc of cd fld "p1"', `12,23`);
    b.batchEvaluate(h);
});
t.test('execCommands sort', () => {
    let b = new ScriptTestBatch();

    /* sort by item */
    b.t('put "pear,Apple2,z11,z2,11,2,apple1,peach" into initlist\\0', '0');
    b.t('put initlist into x\\0', `0`);
    b.t('sort items of x\\x', `11,2,apple1,Apple2,peach,pear,z11,z2`);
    b.t('put initlist into x\\0', `0`);
    b.t('sort ascending items of x text\\x', `11,2,apple1,Apple2,peach,pear,z11,z2`);
    b.t('put initlist into x\\0', `0`);
    b.t('sort items of x text descending\\x', `z2,z11,pear,peach,Apple2,apple1,2,11`);
    b.t('put initlist into x\\0', `0`);
    b.t('sort descending items of x text\\x', `z2,z11,pear,peach,Apple2,apple1,2,11`);
    b.t('put initlist into x\\0', `0`);
    b.t('sort items of x text ascending\\x', `11,2,apple1,Apple2,peach,pear,z11,z2`);
    b.t('put initlist into x\\0', `0`);
    b.t('sort items of x numeric\\x', `2,11,apple1,Apple2,peach,pear,z11,z2`);
    b.t('put initlist into x\\0', `0`);
    b.t('sort descending items of x numeric\\x', `z2,z11,pear,peach,Apple2,apple1,11,2`);
    b.t(
        longstr(
            `put "pear"&cr&"Apple2"&cr&"z11"&cr&
"z2"&cr&"11"&cr&"2"&cr&"apple1"&cr&"peach" into initlist\\0`,
            ''
        ),
        `0`
    );
    b.t('put initlist into x\\0', `0`);
    b.t('sort lines of x\\x', `11\n2\napple1\nApple2\npeach\npear\nz11\nz2`);
    b.t('put initlist into x\\0', `0`);
    b.t(
        'sort ascending lines of x text\\x',
        `11\n2\napple1\nApple2\npeach\npear\nz11\nz2`
    );
    b.t('put initlist into x\\0', `0`);
    b.t(
        'sort descending lines of x text\\x',
        `z2\nz11\npear\npeach\nApple2\napple1\n2\n11`
    );
    b.t('put initlist into x\\0', `0`);
    b.t('sort lines of x numeric\\x', `2\n11\napple1\nApple2\npeach\npear\nz11\nz2`);
    b.t('put initlist into x\\0', `0`);
    b.t(
        'sort descending lines of x numeric\\x',
        `z2\nz11\npear\npeach\nApple2\napple1\n11\n2`
    );
    b.t('sort xyz items of x\\x', `PREPARSEERR:expect something like`);
    b.t('sort xyz items of x xyz\\x', `PREPARSEERR:expect something like`);
    b.t('sort items of x xyz\\x', `ERR:parse err`);
    b.t('sort xyz of x\\x', `PREPARSEERR:expect something like`);
    b.t('sort xyz xyz of x\\x', `PREPARSEERR:expect something like`);
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* new sort-by-expression! (very interesting to implement) */
    b.t('put "ac,bb,ca" into li\\0', '0');
    b.t('sort items of li by char 2 of each\\li', 'ca,bb,ac');
    b.t('put "ac" & cr & "bb" & cr & "ca" into li\\0', '0');
    b.t('sort lines of li by char 2 of each\\li', 'ca\nbb\nac');
    b.batchEvaluate(h);
});
t.test('execCommands delete', () => {
    let b = new ScriptTestBatch();

    /* not yet supported */
    b.t('put "abcdef,123,456" into initlist\\0', '0');
    b.t('put initlist into x\\0', '0');
    b.t('delete cd btn "a1"\\0', 'ERR:not yet supported');
    b.t('delete cd fld "a1"\\0', 'ERR:not yet supported');
    b.t('delete cd 1\\0', 'ERR:NoViableAltException');
    b.t('put "a" into x\ndelete x\\0', 'ERR:5:NoViableAltException');
    b.t('put "abcdef,123,456" into x\ndelete item 2 of x\\x', 'ERR:5:not yet supported');
    b.t(
        'put "abcdef,123,456" into x\ndelete item 1 to 2 of x\\x',
        'ERR:5:not yet supported'
    );
    b.t(
        'put "abcdef,123,456" into x\ndelete item 999 of x\\x',
        'ERR:5:not yet supported'
    );
    b.t(
        'put "abcdef,123,456" into x\ndelete word 999 of x\\x',
        'ERR:5:not yet supported'
    );
    b.t(
        'put "abcdef,123,456" into x\ndelete line 999 of x\\x',
        'ERR:5:not yet supported'
    );
    b.t(
        'put "abcdef,123,456" into x\ndelete item 1 to 999 of x\\x',
        'ERR:5:not yet supported'
    );
    b.t(
        'put "abcdef,123,456" into x\ndelete item 2 to 999 of x\\x',
        'ERR:5:not yet supported'
    );

    /* normal chunks */
    b.t('put "abcdef,123,456" into initlist\\0', '0');
    b.t('put initlist into x\\0', '0');
    b.t('delete first char of x\\x', 'bcdef,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('delete char 2 of x\\x', 'acdef,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('delete char 2 to 5 of x\\x', 'af,123,456');

    /* big numbers */
    b.t('put initlist into x\\0', '0');
    b.t('delete char 999 of x\\x', 'abcdef,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('delete char 2 to 999 of x\\x', 'a');
    b.t('put initlist into x\\0', '0');
    b.t('delete char 1 to 999 of x\\x', '');
    b.batchEvaluate(h);
});
t.test('execCommands put', () => {
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);
    let b = new ScriptTestBatch();

    /* testing a lot of prepositions */
    b.t('put "abc"\\0', '0');
    b.t('put "abc" xyz\\0', 'ERR:MismatchedTokenException');
    b.t('put "abc" xyz x\\0', 'ERR:MismatchedTokenException');
    b.t('put "abc" xyz cd fld "p1"\\0', 'ERR:MismatchedTokenException');
    b.t('put "abc" xyz line 1 to into of cd fld "p1"\\0', 'ERR:MismatchedTokenException');
    b.t('put "abc" into line 1 to into of cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" into line 1 to before of cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" into line 1 to after of cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" before line 1 to into of cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" before line 1 to before of cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" before line 1 to after of cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" after line 1 to into of cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" after line 1 to before of cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" after line 1 to after of cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" into into cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" into after cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" into before cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" before into cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" before after cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" before before cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" after into cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" after after cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "abc" after before cd fld "p1"\\0', 'PREPARSEERR:only see one');
    b.t('put "ab,cd,ef,12,34,56,78" into inititms\\0', '0');
    b.t('put "abcdef,123,456" into initlist\\0', '0');

    /* empty string into */
    b.t('put initlist into x\\0', '0');
    b.t('put "" into char 2 of x\\x', 'acdef,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('put "" into char 2 to 5 of x\\x', 'af,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('put "" into char 999 of x\\x', 'abcdef,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('put "" into char 888 to 999 of x\\x', 'abcdef,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('put "" into char 2 to 999 of x\\x', 'a');

    /* empty string before/after */
    b.t('put initlist into x\\0', '0');
    b.t('put "" before char 2 of x\\x', 'abcdef,123,456');
    b.t('put "" after char 2 of x\\x', 'abcdef,123,456');
    b.t('put "" before char 2 to 5 of x\\x', 'abcdef,123,456');
    b.t('put "" after char 2 to 5 of x\\x', 'abcdef,123,456');
    b.t('put "" before char 999 of x\\x', 'abcdef,123,456');
    b.t('put "" after char 999 of x\\x', 'abcdef,123,456');
    b.t('put "" before char 888 to 999 of x\\x', 'abcdef,123,456');
    b.t('put "" after char 888 to 999 of x\\x', 'abcdef,123,456');

    /* medium sized string into */
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" into char 2 of x\\x', 'aqwertyqwertycdef,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" into char 2 to 5 of x\\x', 'aqwertyqwertyf,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" into char 999 of x\\x', 'abcdef,123,456qwertyqwerty');
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" into char 888 to 999 of x\\x', 'abcdef,123,456qwertyqwerty');
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" into char 2 to 999 of x\\x', 'aqwertyqwerty');

    /* medium sized string before/after */
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" before char 2 of x\\x', 'aqwertyqwertybcdef,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" after char 2 of x\\x', 'abqwertyqwertycdef,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" before char 2 to 5 of x\\x', 'aqwertyqwertybcdef,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" after char 2 to 5 of x\\x', 'abcdeqwertyqwertyf,123,456');
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" before char 999 of x\\x', 'abcdef,123,456qwertyqwerty');
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" after char 999 of x\\x', 'abcdef,123,456qwertyqwerty');
    b.t('put initlist into x\\0', '0');
    b.t(
        'put "qwertyqwerty" before char 888 to 999 of x\\x',
        'abcdef,123,456qwertyqwerty'
    );
    b.t('put initlist into x\\0', '0');
    b.t('put "qwertyqwerty" after char 888 to 999 of x\\x', 'abcdef,123,456qwertyqwerty');

    /* items */
    b.t('put inititms into x\\0', '0');
    b.t('put "" into item 2 of x\\x', 'ab,,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "" into item 2 to 5 of x\\x', 'ab,,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "" into item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,');
    b.t('put inititms into x\\0', '0');
    b.t('put "" into item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,');
    b.t('put inititms into x\\0', '0');
    b.t('put "" into item 2 to 999 of x\\x', 'ab,');

    /* empty string before/after */
    b.t('put inititms into x\\0', '0');
    b.t('put "" before item 2 of x\\x', 'ab,cd,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "" after item 2 of x\\x', 'ab,cd,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "" before item 2 to 5 of x\\x', 'ab,cd,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "" after item 2 to 5 of x\\x', 'ab,cd,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "" before item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,');
    b.t('put inititms into x\\0', '0');
    b.t('put "" after item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,');
    b.t('put inititms into x\\0', '0');
    b.t('put "" before item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,');
    b.t('put inititms into x\\0', '0');
    b.t('put "" after item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,');
    b.t('put inititms into x\\0', '0');
    b.t('put "" before item 2 to 12 of x\\x', 'ab,cd,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "" after item 2 to 12 of x\\x', 'ab,cd,ef,12,34,56,78');

    /* medium sized string into */
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" into item 2 of x\\x', 'ab,qwerty,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" into item 2 to 5 of x\\x', 'ab,qwerty,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" into item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" into item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" into item 2 to 12 of x\\x', 'ab,qwerty');

    /* medium sized string before/after */
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" before item 2 of x\\x', 'ab,qwertycd,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" after item 2 of x\\x', 'ab,cdqwerty,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" before item 2 to 5 of x\\x', 'ab,qwertycd,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" after item 2 to 5 of x\\x', 'ab,cd,ef,12,34qwerty,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" before item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" after item 12 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" before item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" after item 12 to 14 of x\\x', 'ab,cd,ef,12,34,56,78,,,,,qwerty');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" before item 2 to 12 of x\\x', 'ab,qwertycd,ef,12,34,56,78');
    b.t('put inititms into x\\0', '0');
    b.t('put "qwerty" after item 2 to 12 of x\\x', 'ab,cd,ef,12,34,56,78qwerty');

    /* with variables that aren't yet defined */
    /* we'll treat it as an empty string, unless you are trying to use with a chunk */
    b.t('put "abc" into newvar1\\newvar1', 'abc');
    b.t('put "abc" before newvar2\\newvar2', 'abc');
    b.t('put "abc" after newvar3\\newvar3', 'abc');
    b.t('put "abc" into char 2 of newvar4\\0', 'ERR:no variable found');
    b.t('put "abc" before char 2 of newvar5\\0', 'ERR:no variable found');
    b.t('put "abc" after char 2 of newvar6\\0', 'ERR:no variable found');
    b.t('put "abc" into char 2 to 3 of newvar7\\0', 'ERR:no variable found');
    b.t('put "abc" before char 2 to 3 of newvar8\\0', 'ERR:no variable found');
    b.t('put "abc" after char 2 to 3 of newvar9\\0', 'ERR:no variable found');
    b.batchEvaluate(h);
});
t.test('execCommands get', () => {
    let b = new ScriptTestBatch();
    b.t('get 1+2\\it', `3`);
    b.t('get xyz()\\it', `ERR:no handler`);
    b.t('get the environment\\it', `development`);
    b.t('get the systemversion\\it', `7.55`);
    b.t('get the systemversion()\\it', `ERR:parse err`);
    b.t('get abs(-2)\\it', `2`);
    b.t('get sum(3,4,5)\\it', `12`);
    b.t('get - char 1 to 2 of 345\\it', `-34`);
    b.t('get not true\\it', `false`);
    b.t('get\\0', `ERR:NoViableAltException`);
    b.t('get the\\0', `ERR:NoViableAltException`);
    b.t('put 123 into it\\it', `123`);
    b.batchEvaluate(h);
});
t.test('execCommands replace', () => {
    let b = new ScriptTestBatch();

    /* incorrect usage */
    b.t('put 123 into replace\\0', `ERR:variable name not allowed`);
    b.t('replace\\0', `PREPARSEERR:did not see`);
    b.t('replace with\\0', `ERR:NoViableAltException`);
    b.t('replace in\\0', `PREPARSEERR:did not see`);
    b.t('replace "aa" "bb" \\0', `PREPARSEERR:did not see`);
    b.t('replace "aa" with "bb" \\0', `ERR:MismatchedTokenException`);
    b.t('replace "aa" in "bb" \\0', `PREPARSEERR:did not see`);
    b.t('replace with in \\0', `ERR:NoViableAltException`);
    b.t('replace with "bb" in \\0', `ERR:NoViableAltException`);
    b.t('replace "aa" with in \\0', `ERR:NoViableAltException`);
    b.t('replace "aa" with in "bb" \\0', `ERR:NoViableAltException`);
    b.t('replace "aa" with "bb" in "cc" \\0', `ERR:NoViableAltException`);
    b.t('replace "aa" with "bb" in 123 \\0', `ERR:NoViableAltException`);
    b.t('replace "aa" with "bb" in this stack \\0', `ERR:parse err`);
    b.t('replace "aa" with "bb" in this card \\0', `ERR:parse err`);
    b.t(
        `put "" into s
replace "aa" with "bb" of s
\\s`,
        'ERR:5:MismatchedTokenException'
    );

    /* correct usage */
    b.t(
        `put "" into s
replace "aa" with "bb" in s
\\s`,
        ''
    );
    b.t(
        `put "abc" into s
replace "aa" with "bb" in s
\\s`,
        'abc'
    );
    b.t(
        `put "aa" into s
replace "aa" with "bb" in s
\\s`,
        'bb'
    );
    b.t(
        `put "aa.aa.aa." into s
replace "aa" with "bb" in s
\\s`,
        'bb.bb.bb.'
    );
    b.t(
        `put ".aa.aa.aa" into s
replace "aa" with "bb" in s
\\s`,
        '.bb.bb.bb'
    );
    b.t(
        `put "aaa.aaaa.aaaaa" into s
replace "aa" with "bb" in s
\\s`,
        'bba.bbbb.bbbba'
    );
    b.t(
        `put "123123" into s
replace "1" with "2" in s
\\s`,
        '223223'
    );
    b.t(
        `put "123123" into s
put "1" into s1
put "2" into s2
replace s1 with s2 in s
\\s`,
        '223223'
    );
    b.t(
        `put "aaAA" into s
replace "aa" with "bb" in s
\\s`,
        'bbAA'
    );
    b.t(
        `put "cc aa aa bb" into s
replace "aa" with "bb" in s
\\s`,
        'cc bb bb bb'
    );
    b.t(
        `put "cc aa aa bb" into s
replace "a" & "a" with "b" & "b" in s
\\s`,
        'cc bb bb bb'
    );

    /* test with empty string */
    b.t(
        `put "cc aa aa bb" into s
replace "aa" with "" in s
\\s`,
        'cc   bb'
    );
    b.t(
        `put "cc aa aa bb" into s
replace "" with "bb" in s
\\s`,
        'ERR:5:empty string'
    );
    b.t(
        `put "cc aa aa bb" into s
replace "" with "" in s
\\s`,
        'ERR:5:empty string'
    );

    /* use regex trip-up chars */
    b.t(
        `put "a**a" into s
replace "*" with "**" in s
\\s`,
        'a****a'
    );
    b.t(
        `put "a%$a" into s
replace "%$" with "*" in s
\\s`,
        'a*a'
    );
    b.t(
        `put "abba" into s
replace "b" with "$&" in s
\\s`,
        'a$&$&a'
    );
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* use a real field */
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdBC);

    b.t(
        `put "" into cd fld "p1"
replace "1" with "2" in cd fld ("p" & "1")
\\cd fld "p1"`,
        ''
    );
    b.t(
        `put "123123" into cd fld "p1"
replace "1" with "2" in cd fld "p1"
\\cd fld "p1"`,
        '223223'
    );
    b.t(
        `put "cc aa aa bb" into cd fld "p1"
replace "aa" with "bb" in cd fld "p1"
\\cd fld "p1"`,
        'cc bb bb bb'
    );
    b.t(
        `put "cc aa aa bb" into cd fld "p1"
replace "aa" with "bb" in cd btn "p1"
\\cd fld "p1"`,
        'ERR:5:placing text'
    );
    b.t(
        `put "cc aa aa bb" into cd fld "p1"
replace "aa" with "bb" in cd fld "pnotexist"
\\cd fld "p1"`,
        'ERR:5:not found'
    );

    b.batchEvaluate(h);
});
t.test('dynamicCode do', () => {
    let b = new ScriptTestBatch();

    /* valid */
    b.t('global g\ndo "global g" & cr & "put 1+1 into g"\\g', '2');
    b.t('global g\ndo "global g" & cr & "put 2+2 into g"\\g', '4');
    b.t('global g\ndo ("global g" & cr & "put 3+3 into g")\\g', '6');
    b.t(
        'global g\ndo ("global g" & cr & "put 64 into t" & cr & "put sqrt(t) into g")\\g',
        '8'
    );
    b.t('put "put 0 into x" into code\ndo code\\0', '0');
    b.t('put "" into code\ndo code\\0', '0');

    /* runtime error */
    b.t(
        'global g\ndo ("global g" & cr & "put abcde into g")\\g',
        'ERR:5:no variable found'
    );
    b.t('global g\ndo "callNonExist"\\g', 'ERR:5:of this name found');

    /* lex error */
    b.t('put "$$$" into code\ndo code\\0', 'ERR:5:lex error');
    b.t('put "put " & quote & "unterminated" into code\ndo code\\0', 'ERR:5:unexpected');

    /* syntax error */
    b.t('put "on abc" into code\ndo code\\0', 'ERR:5:cannot begin');
    b.t('put "end if" into code\ndo code\\0', 'ERR:5:outside of if');
    b.t('put "if true then" into code\ndo code\\0', 'ERR:5:interleaved');
    b.t('put "put" into code\ndo code\\0', 'ERR:5:not enough args');
    b.t('put 123 into do\\0', `ERR:variable name not allowed`);

    /* nested (do calls do) */
    b.t('put counting() into cfirst\\counting() - cfirst', '1');
    b.t(
        `
put counting() into cfirst
put "put counting() into incremented" into code1
put ("do " & quote & code1 & quote) into code2
do code2\\counting() - cfirst`,
        '2'
    );

    /* nested (do calls do calls do) */
    b.t(
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
    );

    b.batchEvaluate(h);
});
t.test('dynamicCode send', () => {
    h.pr.setCurCardNoOpenCardEvt(h.ids.cdA);
    let b = new ScriptTestBatch();

    /* valid */
    b.t(
        `global g
        put "global g" & cr & "put the short id of me into g" into code
        send code to cd fld id ${h.ids.fCD1}\\g`,
        `${h.ids.fCD1}`
    );
    b.t(
        `global g
        put "global g" & cr & "put the short id of me into g" into code
        send code to cd btn id ${h.ids.bBC1}\\g`,
        `${h.ids.bBC1}`
    );
    b.t(
        `global g
        put "global g" & cr & "put the short id of me into g" into code
        send code to card "a"\\g`,
        `${h.ids.cdA}`
    );
    b.t(
        `global g
        put "global g" & cr & "put the short id of me into g" into code
        send code to card id ${h.ids.cdCD}\\g`,
        `${h.ids.cdCD}`
    );
    b.t(
        `global g
        put "global g" & cr & "put the short id of me into g" into code
        send code to bg "b"\\g`,
        `${h.ids.bgB}`
    );
    b.t(
        `global g
put "global g" & cr & "put the short id of me into g" into code
send code to this stack\\g`,
        `${h.ids.stack}`
    );

    /* not valid */
    b.t('send\\0', 'PREPARSEERR:too short');
    b.t('send "put 1 into x"\\0', 'ERR:MismatchedTokenException');
    b.t('send to\\0', 'ERR:NoViableAltException');
    b.t('send to this stack\\0', 'ERR:NoViableAltException');
    b.t('send "put 1 into x" to\\0', 'ERR:NoViableAltException');
    b.t('send "put 1 into x" this stack\\0', 'ERR:MismatchedTokenException');
    b.t('send "put 1 into x" of this stack\\0', 'ERR:MismatchedTokenException');
    b.t('send "put 1 into x" to "string"\\0', 'ERR:expected something like');
    b.t('put 123 into send\\0', `ERR:variable name not allowed`);

    /* syntax error in sent code */
    b.t('send "put" to this stack\\0', 'ERR:4:not enough args');
    b.t('send "put 1 into" to this stack\\0', 'ERR:4:parse err');
    b.t('send "put \'1 into" to this stack\\0', 'ERR:4:lex error');
    b.t('send "put " & quote & "1 into" to this stack\\0', 'ERR:4:unexpected character');
    b.t('send "on h" to this stack\\0', 'ERR:4:cannot begin');
    b.t('send "put 10 11 into x" to this stack\\0', 'ERR:4:MismatchedTokenException');
    b.t('send "put 1 into cd fld id 99999" to this stack\\0', 'ERR:4:element not found');

    /* not exist */
    b.t('send "put 1 into x" to card 10\\0', "ERR:target of 'send' not found");
    b.t('send "put 1 into x" to bg "notfound"\\0', "ERR:target of 'send' not found");
    b.t('send "put 1 into x" to cd btn 99999\\0', "ERR:target of 'send' not found");
    b.t('send "put 1 into x" to cd btn id 99999\\0', "ERR:target of 'send' not found");
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* make sure that invalid code is cleaned out after a preparse failure. */
    let stack = h.vcstate.vci.getModel().getById(VpcElStack, h.ids.stack);
    h.vcstate.vci.undoableAction(() => stack.set('script', ``));
    b.t('send "$$$#$%#$" to this stack\\0', 'ERR:4:lex error');
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    b.t(
        `global g
put "global g" & cr & "put the short id of me into g" into code
send code to this stack\\g`,
        `${h.ids.stack}`
    );
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* make sure that code can run after a runtime failure. */
    h.vcstate.vci.undoableAction(() => stack.set('script', ``));

    b.t('send "put 1 into cd fld 999" to this stack\\0', 'ERR:4:element not found');

    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    b.t(
        `global g
put "global g" & cr & "put the short id of me into g" into code
send code to this stack\\g`,
        `${h.ids.stack}`
    );
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

    /* calling as a handler, like the original product could do */
    let v = h.vcstate.vci.getModel().getById(VpcElButton, h.ids.bBC1);
    h.vcstate.vci.undoableAction(() =>
        v.set(
            'script',
            `
on myCompute a, b
return a * a + b
end myCompute`
        )
    );

    b.t(
        `send "myCompute 2, 3" to cd btn id ${h.ids.bBC1}
        \\the result`,
        `7`
    );
    b.t(
        `send "myCompute 2, 3" & cr & "return the result" to cd btn id ${h.ids.bBC1}
        \\the result`,
        `7`
    );
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

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

    b.t(
        `send "myCompute(2, 3)" to cd btn id ${h.ids.bBC1}
        \\the result`,
        `ERR:4:this isn't C`
    );
    b.t(
        `send "return myCompute(3, 3)" to cd btn id ${h.ids.bBC1}
        \\the result`,
        `12`
    );
    b.batchEvaluate(h);
    b = new ScriptTestBatch();

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

    b.t(
        `send "return myCompute(2, 3)" to cd btn id ${h.ids.bBC1}
        \\the result`,
        `10`
    );
    b.batchEvaluate(h);

    /* the 'result' must be cleared out between calls */
    let codeBefore = `
function sometimesSetResult p
    if p>=1 then return p * 2
end sometimesSetResult`;
    let got = h.testOneEvaluate(
        '',
        'sometimesSetResult(1) & sometimesSetResult(0) & "a"',
        undefined,
        undefined,
        codeBefore
    );
    assertWarnEq('2a', got.readAsString(), 'RF|');
    codeBefore = `
on sometimesSetResult p
    if p>=1 then return p * 2
end sometimesSetResult`;
    got = h.testOneEvaluate(
        '',
        'sometimesSetResult(1) & sometimesSetResult(0) & "a"',
        undefined,
        undefined,
        codeBefore
    );
    assertWarnEq('2a', got.readAsString(), 'RE|');
    codeBefore = `
function sometimesSetResult p
    if length(the result) > 0 then return "hmm"
    if p>=1 then return p * 2
end sometimesSetResult`;
    got = h.testOneEvaluate(
        '',
        'sometimesSetResult(1) & sometimesSetResult(0) & "a"',
        undefined,
        undefined,
        codeBefore
    );
    assertWarnEq('2a', got.readAsString(), 'RD|');

    /* sending an event down, it can bubble back up */
    h.vcstate.vci.undoableAction(() =>
        h.vcstate.model.stack.set(
            'script',
            `
function myCompute a, b
return a * a + b
end myCompute

on doTest
    send "myCompute 3, 4" to cd btn id ${h.ids.go}
    return the result
end doTest
`
        )
    );
    got = h.testOneEvaluate('', 'doTest()');
    assertWarnEq('13', got.readAsString(), 'RC|');

    /* unless it is overridden in the button */
    let differentFn = `
function myCompute a, b
    return 0
end myCompute`;
    got = h.testOneEvaluate('', 'doTest()', undefined, undefined, differentFn);
    assertWarnEq('0', got.readAsString(), 'RB|');

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
    got = h.testOneEvaluate('', 'doTest()');
    assertWarnEq('1', got.readAsString(), 'RA|');
});
