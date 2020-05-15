
/* auto */ import { ScriptTestBatch, TestMultiplier } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { O, cAltProductName, cProductName } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, Util512, assertWarnEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { h3 } from './test03lexer';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollection03exprObjectRef');
export let testCollection03exprObjectRef = t;

t.atest('--init--testCollection03exprObjectRef', async () => {
    assertTrue(
        h3,
        longstr(`forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`)
    );
});
t.test('03ObjectSpecial', () => {
    assertWarn(!h3.vcstate.model.stack.getB('compatibilitymode'), '');
    let b = new ScriptTestBatch();
    /* special objects. see pseudoObjects for more on 'me', 'target' */
    b.t(`the short id of ${cProductName}`, `WILD`);
    b.t(`the short id of ${cAltProductName}`, `WILD`);
    b.t(`the short id of me`, `${h3.ids.go}`);
    /* invalid syntax */
    b.t(`the short id of 9`, `ERR:parse`);
    b.t(`the short id of 9 card`, `ERR:parse`);
    b.t(`the short id of 9 me`, `ERR:parse`);
    b.t(`the short id of card card 1`, `ERR:parse`);
    b.t(`the short id of id`, `ERR:parse`);
    b.t(`the short id of the`, `ERR:parse`);
    b.t(`the short id of stack`, `ERR:parse`);
    b.t(`the short id of button`, `PREPARSEERR:compatibility`);
    b.batchEvaluate(h3, [EvaluateThereIs]);
});
t.test('03Object look by id', () => {
    /* even if the id exists, we must reject if the type does not match.
    confirm for every combination of types! */
    /* exists, but wrong type
    test every combination! */
    let map = new MapKeyToObjectCanSet<string>();
    map.set(h3.ids.stack, 'stack');
    map.set(h3.ids.bgA, 'bg');
    map.set(h3.ids.cdA, 'cd');
    map.set(h3.ids.bBC1, 'cd btn');
    map.set(h3.ids.fBC1, 'cd fld');
    if (h3.useBg) {
        map.set(h3.ids.bgbB1, 'bg btn');
        map.set(h3.ids.bgfB1, 'bg fld');
    }

    let b = new ScriptTestBatch();
    for (let key of map.getKeys()) {
        for (let val of map.getVals()) {
            if (map.get(key) === val) {
                b.t(`the short id of ${val} id ${key}`, `${key}`);
            } else {
                b.t(`the short id of ${val} id ${key}`, `ERR:could not find`);
            }
        }
    }

    assertWarnEq(map.getKeys().length * map.getKeys().length, b.tests.length, '');
    b.batchEvaluate(h3, [EvaluateThereIs]);
    /* looking by id with incorrect parent must also fail! */
    b = new ScriptTestBatch();
    b.t(`the short id of bg id ${h3.ids.bgA} of stack 2`, `ERR:could not find`);
    b.t(
        `the short id of cd id ${h3.ids.cdBC} of bg id ${h3.ids.bgB} of stack 2`,
        `ERR:could not find`
    );
    b.t(`the short id of cd id ${h3.ids.cdBC} of stack 2`, `ERR:could not find`);
    b.t(
        `the short id of cd id ${h3.ids.cdBC} of bg id ${h3.ids.bgA}`,
        `ERR:could not find`
    );
    b.t(
         longstr(`the short id of cd fld id ${h3.ids.fBC1} of cd id
         ${h3.ids.cdBC} of bg id ${h3.ids.bgB} of stack 2`),
        `ERR:could not find`
    );
    b.t(
        `the short id of cd fld id ${h3.ids.fBC1} of cd id ${h3.ids.cdBC} of bg id ${h3.ids.bgA}`,
        `ERR:could not find`
    );
    b.t(
        `the short id of cd fld id ${h3.ids.fBC1} of cd id ${h3.ids.cdBB}`,
        `ERR:could not find`
    );
    b.t(
         longstr(`the short id of cd btn id ${h3.ids.bBC1} of cd id ${h3.ids.cdBC}
         of bg id ${h3.ids.bgB} of stack 2`),
        `ERR:could not find`
    );
    b.t(
        `the short id of cd btn id ${h3.ids.bBC1} of cd id ${h3.ids.cdBC} of bg id ${h3.ids.bgA}`,
        `ERR:could not find`
    );
    b.t(
        `the short id of cd btn id ${h3.ids.bBC1} of cd id ${h3.ids.cdBB}`,
        `ERR:could not find`
    );
    b.t(`the short id of bg id ${h3.ids.bgA} of stack 1`, `${h3.ids.bgA}`);
    b.t(
        `the short id of cd id ${h3.ids.cdBC} of bg id ${h3.ids.bgB} of stack 1`,
        `${h3.ids.cdBC}`
    );
    b.t(`the short id of cd id ${h3.ids.cdBC} of stack 1`, `${h3.ids.cdBC}`);
    b.t(`the short id of cd id ${h3.ids.cdBC} of bg id ${h3.ids.bgB}`, `${h3.ids.cdBC}`);
    b.t(
         longstr(`the short id of cd fld id ${h3.ids.fBC1} of cd id ${h3.ids.cdBC}
         of bg id ${h3.ids.bgB} of stack 1`),
        `${h3.ids.fBC1}`
    );
    b.t(
        `the short id of cd fld id ${h3.ids.fBC1} of cd id ${h3.ids.cdBC} of bg id ${h3.ids.bgB}`,
        `${h3.ids.fBC1}`
    );
    b.t(
        `the short id of cd fld id ${h3.ids.fBC1} of cd id ${h3.ids.cdBC}`,
        `${h3.ids.fBC1}`
    );
    b.t(
         longstr(`the short id of cd btn id ${h3.ids.bBC1} of cd id ${h3.ids.cdBC}
         of bg id ${h3.ids.bgB} of stack 1`),
        `${h3.ids.bBC1}`
    );
    b.t(
        `the short id of cd btn id ${h3.ids.bBC1} of cd id ${h3.ids.cdBC} of bg id ${h3.ids.bgB}`,
        `${h3.ids.bBC1}`
    );
    b.t(
        `the short id of cd btn id ${h3.ids.bBC1} of cd id ${h3.ids.cdBC}`,
        `${h3.ids.bBC1}`
    );
    b.batchEvaluate(h3, [EvaluateThereIs]);
});
t.test('03Objects use a Lvl6Expression', () => {
    let b = new ScriptTestBatch();
    b.t(`go cd 1\\1`, `1`);
    b.t(`put -1 into x\\the short id of cd -x`, `${h3.ids.cdA}`);
    b.t(`put "a b c" into x\\the short id of cd word 2 of x`, `${h3.ids.cdBB}`);
    b.t(`put "a b c" into x\\the short id of cd second word of x`, `${h3.ids.cdBB}`);
    b.t(`put "a"&cr&"a b c"&"c" into x\\the short id of cd word 2 of line 2 of x`, `${h3.ids.cdBB}`);
    b.t(`put 1 into x\\the short id of cd x`, `${h3.ids.cdA}`);
    b.t(`put 1 into x\\the short id of cd (x+1)`, `${h3.ids.cdBB}`);
    b.t(`put 1 into x\\the short id of cd (char 1 of x)`, `${h3.ids.cdA}`);
    b.t(`put 1 into x\\the short id of cd length("ab")`, `${h3.ids.cdBB}`);
    b.t(`put 1 into x\\the short id of cd the length of "ab"`, `${h3.ids.cdBB}`);
    b.t(`put 1 into x\\the short id of cd the name of this cd`, `${h3.ids.cdA}`);
    b.t(`put 1 into x\\the short id of cd the number of cds`, `${h3.ids.cdDH}`);
    b.batchEvaluate(h3, [EvaluateThereIs]);
})
t.test('03ObjectPart', () => {
    let b = new ScriptTestBatch();
    /* btns are valid parts */
    b.t(`show cd btn id ${h3.ids.go}\\0`, `0`);
    /* we don't yet support referring by part.
    because we support object lookup by string (set the loc of x to 2,3)
    it's not really necessary */
    b.t(`show cd part id 1\\0`, `ERR:parse`);
    b.t(`show bg part id 1\\0`, `ERR:parse`);
    b.t(`show part id 1\\0`, `ERR:parse err`);
    b.t(`show cd part 1\\0`, `ERR:parse err`);
    b.t(`show bg part 1\\0`, `ERR:parse err`);
    b.t(`show part 1\\0`, `ERR:parse err`);
    b.t(`show part (1 + 1)\\0`, `ERR:no handler`);
    b.t(`show first part\\0`, `ERR:parse err`);
    b.t(`show first part of this card\\0`, `ERR:parse err`);
    b.batchEvaluate(h3, [EvaluateThereIs]);
});
t.test('03ObjectStack', () => {
    let b = new ScriptTestBatch();
    /* by position, confirmed in emulator */
    b.t(`the short id of this stack`, `${h3.ids.stack}`);
    b.t(`the short id of next stack`, `ERR:could not find`);
    b.t(`the short id of prev stack`, `ERR:could not find`);
    /* we should not support ordinal */
    b.t(`the short id of first stack`, `ERR:parse`);
    b.t(`the short id of last stack`, `ERR:parse`);
    b.t(`the short id of any stack`, `ERR:parse`);
    /* by expression */
    b.t(`the short id of stack 1`, `${h3.ids.stack}`);
    b.t(`the short id of stack id 1`, `ERR:could not find`);
    b.t(`the short id of stack id ${h3.ids.stack}`, `${h3.ids.stack}`);
    /* by expression, not exist */
    b.t(`the short id of stack 999`, `ERR:could not find`);
    b.t(`the short id of stack id 9`, `ERR:could not find`);
    b.t(`the short id of stack id -9`, `ERR:could not find`);
    b.t(`the short id of stack id "no"`, `ERR:expected a number`);
    /* stack-at-end-of-line is parsed differently
    it's intentionally using 'get'
    do not simplify! */
    b.t(`the short id of stack`, `ERR:parse`);
    b.t(`get the short id of first stack\\it`, `ERR:parse`);
    b.t(`get the short id of this stack\\it`, `${h3.ids.stack}`);
    b.t(`get the short id of stack\\it`, `${h3.ids.stack}`);
    b.batchEvaluate(h3, [EvaluateThereIs]);
});
t.test('03ObjectBg', () => {
    let b = new ScriptTestBatch();
    b.t(`go cd 1\\1`, `1`);
    /* synonyms */
    b.t(`the short id of this bg`, `${h3.ids.bgA}`);
    b.t(`the short id of this bkgnd`, `${h3.ids.bgA}`);
    b.t(`the short id of this background`, `${h3.ids.bgA}`);
    /* by expression */
    b.t(`the short id of bg id ${h3.ids.bgA}`, `${h3.ids.bgA}`);
    b.t(`the short id of bg id ${h3.ids.bgB}`, `${h3.ids.bgB}`);
    b.t(`the short id of bg id ${h3.ids.bgC}`, `${h3.ids.bgC}`);
    b.t(`the short id of bg id 9`, `ERR:could not find`);
    b.t(`the short id of bg 1`, `${h3.ids.bgA}`);
    b.t(`the short id of bg 2`, `${h3.ids.bgB}`);
    b.t(`the short id of bg 3`, `${h3.ids.bgC}`);
    b.t(`the short id of bg 999`, `ERR:could not find`);
    b.t(`the short id of bg "a"`, `${h3.ids.bgA}`);
    b.t(`the short id of bg "b"`, `${h3.ids.bgB}`);
    b.t(`the short id of bg "c"`, `${h3.ids.bgC}`);
    b.t(`the short id of bg "A"`, `${h3.ids.bgA}`);
    b.t(`the short id of bg "B"`, `${h3.ids.bgB}`);
    b.t(`the short id of bg "C"`, `${h3.ids.bgC}`);
    b.t(`the short id of bg "notfound"`, `ERR:could not find`);
    /* by ord/position */
    b.t(`the short id of third bg`, `${h3.ids.bgC}`);
    b.t(`the short id of second bg`, `${h3.ids.bgB}`);
    b.t(`the short id of first bg`, `${h3.ids.bgA}`);
    b.t(`the short id of last bg`, `${h3.ids.bgC}`);
    b.t(`the short id of this bg`, `${h3.ids.bgA}`);
    b.t(`the short id of next bg`, `${h3.ids.bgB}`);
    b.t(`the short id of prev bg`, `${h3.ids.bgC}`);
    b.t(`the short id of tenth bg`, `ERR:could not find`);
    /* more by position */
    b.t(`go cd id ${h3.ids.cdBC}\\1`, `1`);
    b.t(`the short id of this bg`, `${h3.ids.bgB}`);
    b.t(`the short id of next bg`, `${h3.ids.bgC}`);
    b.t(`the short id of prev bg`, `${h3.ids.bgA}`);
    /* by ord/position at end of line
    it's intentionally using 'get'
    do not simplify! */
    b.t(`get the short id of second bg\\it`, `${h3.ids.bgB}`);
    b.t(`get the short id of this bg\\it`, `${h3.ids.bgB}`);
    b.t(`get the short id of next bg\\it`, `${h3.ids.bgC}`);
    /* not exist, by ord/position at end of line */
    b.t(`get the short id of tenth bg\\it`, `ERR:could not find`);
    /* bg-at-end-of-line is parsed differently*/
    b.t(`put the short id of bg into x\\x`, `ERR:parse`);
    b.t(`get the short id of 1 bg\\it`, `ERR:parse`);
    b.t(`get the short id of bg\\it`, `${h3.ids.bgA}`);

    b.batchEvaluate(h3, [AppendOfThisStack, EvaluateThereIs]);
});
t.test('03ObjectCard', () => {
    let b = new ScriptTestBatch();
    /* if names are ambiguous, pick the first, even if closer to another. 
    confirmed in emulator. but if you're already at one, pick the other. */
    b.t(`go cd id ${h3.ids.cdBC}\\1`, `1`);
    b.t(`the short id of cd "d"`, `${h3.ids.cdBD}`);
    b.t(`go cd id ${h3.ids.cdBD}\\1`, `1`);
    b.t(`the short id of cd "d"`, `${h3.ids.cdCD}`);
    b.t(`go cd id ${h3.ids.cdCD}\\1`, `1`);
    b.t(`the short id of cd "d"`, `${h3.ids.cdDD}`);
    b.t(`go cd id ${h3.ids.cdDD}\\1`, `1`);
    b.t(`the short id of cd "d"`, `${h3.ids.cdBD}`);
    b.t(`go cd id ${h3.ids.cdDE}\\1`, `1`);
    b.t(`the short id of cd "d"`, `${h3.ids.cdBD}`);
    /* look by name */
    b.t(`go cd id ${h3.ids.cdA}\\1`, `1`);
    b.t(`the short id of cd "a"`, `${h3.ids.cdA}`);
    b.t(`go cd id ${h3.ids.cdBB}\\1`, `1`);
    b.t(`the short id of cd "a"`, `${h3.ids.cdA}`);
    b.t(`the short id of cd "b"`, `${h3.ids.cdBB}`);
    b.t(`the short id of cd "C"`, `${h3.ids.cdBC}`);
    b.t(`the short id of cd "b" of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of cd "C" of bg 2`, `${h3.ids.cdBC}`);
    b.t(`the short id of cd "b" of bg 1`, `ERR:could not find`);
    b.t(`the short id of cd "notfound"`, `ERR:could not find`);
    /* look by absolute */
    b.t(`the short id of cd 1`, `${h3.ids.cdA}`);
    b.t(`the short id of cd 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of cd 3`, `${h3.ids.cdBC}`);
    b.t(`the short id of cd 99`, `ERR:could not find`);
    b.t(`the short id of cd 1 of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of cd 2 of bg 2`, `${h3.ids.cdBC}`);
    b.t(`the short id of cd 3 of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of cd 99 of bg 2`, `ERR:could not find`);
    /* look by relative */
    b.t(`go cd id ${h3.ids.cdBC}\\1`, `1`);
    b.t(`the short id of first cd`, `${h3.ids.cdA}`);
    b.t(`the short id of this cd`, `${h3.ids.cdA}`);
    b.t(`the short id of prev cd`, `${h3.ids.cdBB}`);
    b.t(`the short id of next cd`, `${h3.ids.cdBD}`);
    b.t(`the short id of last cd`, `${h3.ids.cdCD}`);
    b.t(`the short id of tenth cd`, `ERR:could not find`);
    b.t(`go cd id ${h3.ids.cdBB}\\1`, `1`);
    b.t(`the short id of first cd of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of this cd of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of prev cd of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of next cd of bg 2`, `${h3.ids.cdBC}`);
    b.t(`the short id of last cd of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of tenth cd of bg 2`, `ERR:could not find`);
    b.t(`go cd 1\\1`, `1`);
    b.t(`the short id of first cd of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of this cd of bg 2`, `ERR:ffff`);
    b.t(`the short id of prev cd of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of next cd of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of last cd of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of tenth cd of bg 2`, `ERR:could not find`);
    /* special back-forth cards */
    b.t(`go cd 2\\1`, `1`);
    b.t(`go cd 3\\1`, `1`);
    b.t(`the short id of recent`, `${h3.ids.cdBB}`);
    b.t(`the short id of back`, `${h3.ids.cdBB}`);
    b.t(`go back\\1`, ``);
    b.t(`the short id of forth`, `${h3.ids.cdBC}`);
    /* by ord/position at end of line
    it's intentionally using 'get'
    do not simplify! */
    b.t(`go cd 1\\1`, `1`);
    b.t(`get the short id of second cd\\it`, `${h3.ids.cdBB}`);
    b.t(`get the short id of this cd\\it`, `${h3.ids.cdA}`);
    b.t(`get the short id of next cd\\it`, `${h3.ids.cdBB}`);
    /* not exist, by ord/position at end of line */
    b.t(`get the short id of tenth cd\\it`, `ERR:could not find`);
    /* cd-at-end-of-line is parsed differently*/
    b.t(`put the short id of cd into x\\x`, `ERR:parse`);
    b.t(`get the short id of 1 cd\\it`, `ERR:parse`);
    b.t(`get the short id of cd\\it`, `${h3.ids.cdA}`);
    b.batchEvaluate(h3, [AppendOfThisStack, EvaluateThereIs]);
});
t.test('03ObjectCardMarked', () => {
    let b = new ScriptTestBatch();
    b.t(`unmark all cards\\1`, `1`);
    b.t(`mark cd id ${h3.ids.cdBB}\\1`, `1`);
    b.t(`mark cd id ${h3.ids.cdCD}\\1`, `1`);
    b.t(`mark cd id ${h3.ids.cdDD}\\1`, `1`);
    /* look by name */
    b.t(`the short id of marked cd "b"`, `${h3.ids.cdBB}`);
    b.t(`the short id of marked cd "d"`, `${h3.ids.cdCD}`);
    b.t(`the short id of marked cd "c"`, `ERR:could not find`);
    b.t(`the short id of marked cd "a"`, `ERR:could not find`);
    /* look by absolute */
    b.t(`the short id of marked cd 1`, `${h3.ids.cdBB}`);
    b.t(`the short id of marked cd 2`, `${h3.ids.cdCD}`);
    b.t(`the short id of marked cd 10`, `ERR:could not find`);
    /* look by ordinal */
    b.t(`the short id of first marked cd`, `${h3.ids.cdBB}`);
    b.t(`the short id of second marked cd`, `${h3.ids.cdCD}`);
    b.t(`the short id of last marked cd`, `${h3.ids.cdDD}`);
    b.t(`the short id of tenth marked cd`, `ERR:could not find`);
    /* look by relative - before all */
    b.t(`go cd 1\\1`, `1`);
    b.t(`the short id of this marked cd`, `ERR:could not find`);
    b.t(`the short id of next marked cd`, `${h3.ids.cdBB}`);
    b.t(`the short id of prev marked cd`, `${h3.ids.cdDD}`);
    /* look by relative - on first */
    b.t(`go cd id ${h3.ids.cdBB}\\1`, `1`);
    b.t(`the short id of this marked cd`, `${h3.ids.cdBB}`);
    b.t(`the short id of next marked cd`, `${h3.ids.cdCD}`);
    b.t(`the short id of prev marked cd`, `${h3.ids.cdDD}`);
    /* look by relative - between them */
    b.t(`go cd id ${h3.ids.cdBD}\\1`, `1`);
    b.t(`the short id of this marked cd`, `ERR:could not find`);
    b.t(`the short id of next marked cd`, `${h3.ids.cdCD}`);
    b.t(`the short id of prev marked cd`, `${h3.ids.cdBB}`);
    /* look by relative - on last */
    b.t(`go cd id ${h3.ids.cdDD}\\1`, `1`);
    b.t(`the short id of this marked cd`, `${h3.ids.cdDD}`);
    b.t(`the short id of next marked cd`, `${h3.ids.cdBB}`);
    b.t(`the short id of prev marked cd`, `${h3.ids.cdCD}`);
    /* look by relative - after all */
    b.t(`go cd id ${h3.ids.cdDF}\\1`, `1`);
    b.t(`the short id of this marked cd`, `ERR:could not find`);
    b.t(`the short id of next marked cd`, `${h3.ids.cdBB}`);
    b.t(`the short id of prev marked cd`, `${h3.ids.cdCD}`);
    /* none marked */
    b.t(`unmark all cards\\1`, `1`);
    b.t(`the short id of this marked cd`, `ERR:could not find`);
    b.t(`the short id of next marked cd`, `ERR:could not find`);
    b.t(`the short id of prev marked cd`, `ERR:could not find`);
    /* one marked, wraps around */
    b.t(`mark cd id ${h3.ids.cdDF}\\1`, `1`);
    b.t(`go cd id ${h3.ids.cdDF}\\1`, `1`);
    b.t(`the short id of this marked cd`, `${h3.ids.cdDF}`);
    b.t(`the short id of next marked cd`, `${h3.ids.cdDF}`);
    b.t(`the short id of prev marked cd`, `${h3.ids.cdDF}`);

    /* now do all of the above, but within a bg */
    b.t(`unmark all cards\\1`, `1`);
    b.t(`mark cd id ${h3.ids.cdCD}\\1`, `1`);
    b.t(`mark cd id ${h3.ids.cdDD}\\1`, `1`);
    b.t(`mark cd id ${h3.ids.cdDF}\\1`, `1`);
    b.t(`mark cd id ${h3.ids.cdDG}\\1`, `1`);
    /* look by name */
    b.t(`the short id of marked cd "d" of bg 4`, `${h3.ids.cdDD}`);
    b.t(`the short id of marked cd "f" of bg 4`, `${h3.ids.cdDF}`);
    b.t(`the short id of marked cd "e" of bg 4`, `ERR:could not find`);
    b.t(`the short id of marked cd "a" of bg 4`, `ERR:could not find`);
    /* look by absolute */
    b.t(`the short id of marked cd 1 of bg 4`, `${h3.ids.cdDD}`);
    b.t(`the short id of marked cd 2 of bg 4`, `${h3.ids.cdDF}`);
    b.t(`the short id of marked cd 10 of bg 4`, `ERR:could not find`);
    /* look by ordinal */
    b.t(`the short id of first marked cd of bg 4`, `${h3.ids.cdDD}`);
    b.t(`the short id of second marked cd of bg 4`, `${h3.ids.cdDF}`);
    b.t(`the short id of last marked cd of bg 4`, `${h3.ids.cdDG}`);
    b.t(`the short id of tenth marked cd of bg 4`, `ERR:could not find`);
    /* look by relative - before all */
    b.t(`go cd id ${h3.ids.cdCD}\\1`, `1`);
    b.t(`the short id of this marked cd of bg 4`, `ERR:could not find`);
    b.t(`the short id of next marked cd of bg 4`, `${h3.ids.cdDD}`);
    b.t(`the short id of prev marked cd of bg 4`, `${h3.ids.cdDF}`);
    /* look by relative - on first */
    b.t(`go cd id ${h3.ids.cdDD}\\1`, `1`);
    b.t(`the short id of this marked cd of bg 4`, `${h3.ids.cdDD}`);
    b.t(`the short id of next marked cd of bg 4`, `${h3.ids.cdDF}`);
    b.t(`the short id of prev marked cd of bg 4`, `${h3.ids.cdDG}`);
    /* look by relative - between them */
    b.t(`go cd id ${h3.ids.cdDE}\\1`, `1`);
    b.t(`the short id of this marked cd of bg 4`, `ERR:could not find`);
    b.t(`the short id of next marked cd of bg 4`, `${h3.ids.cdDF}`);
    b.t(`the short id of prev marked cd of bg 4`, `${h3.ids.cdDD}`);
    /* look by relative - on last */
    b.t(`go cd id ${h3.ids.cdDG}\\1`, `1`);
    b.t(`the short id of this marked cd of bg 4`, `${h3.ids.cdDG}`);
    b.t(`the short id of next marked cd of bg 4`, `${h3.ids.cdDD}`);
    b.t(`the short id of prev marked cd of bg 4`, `${h3.ids.cdDF}`);
    /* look by relative - after all */
    b.t(`go cd id ${h3.ids.cdDH}\\1`, `1`);
    b.t(`the short id of this marked cd of bg 4`, `ERR:could not find`);
    b.t(`the short id of next marked cd of bg 4`, `${h3.ids.cdDD}`);
    b.t(`the short id of prev marked cd of bg 4`, `${h3.ids.cdDG}`);
    /* bg ones that don't have an analogue */
    b.t(`go cd id ${h3.ids.cdBB}\\1`, `1`);
    b.t(`the short id of this marked cd of bg 4`, `ERR:could not find`);
    b.t(`the short id of next marked cd of bg 4`, `${h3.ids.cdDD}`);
    b.t(`the short id of prev marked cd of bg 4`, `${h3.ids.cdDG}`);
    b.t(`the short id of this marked cd of bg 1`, `ERR:could not find`);
    b.t(`the short id of next marked cd of bg 1`, `ERR:could not find`);
    b.t(`the short id of prev marked cd of bg 1`, `ERR:could not find`);
    /* none marked */
    b.t(`unmark all cards\\1`, `1`);
    b.t(`the short id of this marked cd of bg 4`, `ERR:could not find`);
    b.t(`the short id of next marked cd of bg 4`, `ERR:could not find`);
    b.t(`the short id of prev marked cd of bg 4`, `ERR:could not find`);
    /* one marked, wraps around */
    b.t(`mark cd id ${h3.ids.cdDF}\\1`, `1`);
    b.t(`go cd id ${h3.ids.cdDF}\\1`, `1`);
    b.t(`the short id of this marked cd of bg 4`, `${h3.ids.cdDF}`);
    b.t(`the short id of next marked cd of bg 4`, `${h3.ids.cdDF}`);
    b.t(`the short id of prev marked cd of bg 4`, `${h3.ids.cdDF}`);
    /* clean up */
    b.t(`unmark all cards\\1`, `1`);
    b.batchEvaluate(h3, [AppendOfThisStack, EvaluateThereIs]);
});
t.test('03ObjectBtnAndField', () => {


})


/* run the tests again, except for fld instead of btn */
class GoForFldInsteadOfBtn extends TestMultiplier {
    secondTransformation(code: string, expected: string): O<[string, string]> {
        if (code.startsWith('the short id of')) {
            code = code + ' of stack 1';
            return [code, expected];
        } else {
            return undefined
        }
    }
}

/* run the tests again, specifying the stack */
class AppendOfThisStack extends TestMultiplier {
    secondTransformation(code: string, expected: string): O<[string, string]> {
        if (code.startsWith('the short id of')) {
            code = code + ' of stack 1';
            return [code, expected];
        } else {
            return undefined
        }
    }
}


/**
 * transform it from "the short id" to "there is a"
 */
//~ todo: use this everywhere
class EvaluateThereIs extends TestMultiplier {
    secondTransformation(code: string, expected: string): O<[string, string]> {
        if (!code.startsWith('the short id of')) {
            /* might be testing a command, or going to a card */
            return undefined;
        } else {
            return [this.convertCode(code), this.convertExpected(expected)];
        }
    }
    protected convertCode(s: string) {
        assertTrue(s.startsWith('the short id of'), '');
        assertTrue(!s.includes('\\'), '');
        return s.replace(/the short id of/, 'there is a');
    }
    protected convertExpected(s: string) {
        if (s.startsWith('ERR:could not find')) {
            return 'false';
        } else if (s.startsWith('ERR:') || s.startsWith('PREPARSEERR:')) {
            return s;
        } else {
            assertTrue(s === 'WILD' || Util512.parseIntStrict(s) !== undefined, '');
            return 'true';
        }
    }
}
