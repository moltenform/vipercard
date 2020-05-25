
/* auto */ import { VpcEvalHelpers } from './../../vpc/vpcutils/vpcValEval';
/* auto */ import { ScriptTestBatch, TestMultiplier } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { OrdinalOrPosition, VpcElType } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { O, cAltProductName, cProductName } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, Util512, assertWarnEq, listEnumValsIncludingAlternates, longstr } from './../../ui512/utils/util512';
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
    b.t(`put 1 into x\\the short id of cd (the short name of this cd)`, `${h3.ids.cdA}`);
    b.t(`put 1 into x\\the short id of cd the short name of this cd`, `${h3.ids.cdA}`);
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
    /* we support ordinal, although product doesn't */
    b.t(`the short id of first stack`, `${h3.ids.stack}`);
    b.t(`the short id of last stack`, `${h3.ids.stack}`);
    b.t(`the short id of any stack`, `${h3.ids.stack}`);
    /* by id */
    b.t(`the short id of stack id ${h3.ids.stack}`, `${h3.ids.stack}`);
    b.t(`the short id of stack id 9`, `ERR:could not find`);
    b.t(`the short id of stack id -9`, `ERR:could not find`);
    b.t(`the short id of stack id "no"`, `ERR:expected a number`);
    /* by expression */
    b.t(`the short id of stack 1`, `${h3.ids.stack}`);
    b.t(`the short id of stack 999`, `ERR:could not find`);
    /* stack-at-end-of-line is parsed differently
    it's intentionally using 'get'
    do not simplify! */
    b.t(`the short id of stack`, `ERR:parse`);
    b.t(`get the short id of first stack\\it`, `${h3.ids.stack}`);
    b.t(`get the short id of this stack\\it`, `${h3.ids.stack}`);
    b.t(`get the short id of stack\\it`, `${h3.ids.stack}`);
    b.batchEvaluate(h3, [EvaluateThereIs, EvaluateAsParsedFromAString]);
    /* by name */
    b = new ScriptTestBatch();
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('name', 'stname', h3.vcstate.model)
    );
    b.t(`the short id of stack "stname"`, `${h3.ids.stack}`);
    b.t(`the short id of stack "Hard Drive:stname"`, `${h3.ids.stack}`);
    b.t(`the short id of stack "STNAME"`, `${h3.ids.stack}`);
    b.batchEvaluate(h3, [EvaluateThereIs, EvaluateAsParsedFromAString]);
    b = new ScriptTestBatch();
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('name', '', h3.vcstate.model)
    );
    b.t(`the short id of stack ""`, `${h3.ids.stack}`);
    b.t(`the short id of stack "Hard Drive:"`, `${h3.ids.stack}`);
    b.t(`the short id of stack "xyz"`, `ERR:could not find`);
    b.batchEvaluate(h3, [EvaluateThereIs, EvaluateAsParsedFromAString]);
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
    b.t(`the short id of last bg`, `${h3.ids.bgD}`);
    b.t(`the short id of this bg`, `${h3.ids.bgA}`);
    b.t(`the short id of next bg`, `${h3.ids.bgB}`);
    b.t(`the short id of prev bg`, `${h3.ids.bgD}`);
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
    b.t(`get the short id of bg\\it`, `${h3.ids.bgB}`);

    b.batchEvaluate(h3, [AppendOfThisStack, EvaluateThereIs, EvaluateAsParsedFromAString]);
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
    b.t(`the short id of cd 8`, `${h3.ids.cdDF}`);
    b.t(`the short id of cd 9`, `${h3.ids.cdDG}`);
    b.t(`the short id of cd 10`, `${h3.ids.cdDH}`);
    b.t(`the short id of cd 99`, `ERR:could not find`);
    b.t(`the short id of cd 1 of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of cd 2 of bg 2`, `${h3.ids.cdBC}`);
    b.t(`the short id of cd 3 of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of cd 99 of bg 2`, `ERR:could not find`);
    /* look by relative */
    b.t(`go cd id ${h3.ids.cdBC}\\1`, `1`);
    b.t(`the short id of first cd`, `${h3.ids.cdA}`);
    b.t(`the short id of this cd`, `${h3.ids.cdBC}`);
    b.t(`the short id of prev cd`, `${h3.ids.cdBB}`);
    b.t(`the short id of next cd`, `${h3.ids.cdBD}`);
    b.t(`the short id of last cd`, `${h3.ids.cdDH}`);
    b.t(`the short id of tenth cd`, `${h3.ids.cdDH}`);
    b.t(`go cd id ${h3.ids.cdBB}\\1`, `1`);
    b.t(`the short id of first cd of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of this cd of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of prev cd of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of next cd of bg 2`, `${h3.ids.cdBC}`);
    b.t(`the short id of last cd of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of tenth cd of bg 2`, `ERR:could not find`);
    b.t(`go cd 1\\1`, `1`);
    b.t(`the short id of first cd of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of this cd of bg 2`, `ERR:could not find`);
    b.t(`the short id of prev cd of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of next cd of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of last cd of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of tenth cd of bg 2`, `ERR:could not find`);
    /* add 'the' */
    b.t(`go cd 1\\1`, `1`);
    b.t(`the short id of the first cd of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of the this cd of bg 2`, `ERR:could not find`);
    b.t(`the short id of the prev cd of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of the next cd of bg 2`, `${h3.ids.cdBB}`);
    b.t(`the short id of the last cd of bg 2`, `${h3.ids.cdBD}`);
    b.t(`the short id of the tenth cd of bg 2`, `ERR:could not find`);
    /* special back-forth cards */
    b.t(`go cd 2\\1`, `1`);
    b.t(`go cd 3\\1`, `1`);
    b.t(`the short id of recent card--[[noSParse]]`, `${h3.ids.cdBB}`);
    b.t(`the short id of back --[[noSParse]]`, `${h3.ids.cdBB}`);
    b.t(`go back\\1`, `1`);
    b.t(`the short id of forth --[[noSParse]]`, `${h3.ids.cdBC}`);
    /* by ord/position at end of line
    it's intentionally using 'get'
    do not simplify! */
    b.t(`go cd 1\\1`, `1`);
    b.t(`get the short id of second cd\\it`, `${h3.ids.cdBB}`);
    b.t(`get the short id of this cd\\it`, `${h3.ids.cdA}`);
    b.t(`get the short id of next cd\\it`, `${h3.ids.cdBB}`);
    /* ord/position at end of line */
    b.t(`get the short id of tenth cd\\it`, `${h3.ids.cdDH}`);
    /* cd-at-end-of-line is parsed differently*/
    b.t(`put the short id of cd into x\\x`, `ERR:parse`);
    b.t(`get the short id of 1 cd\\it`, `ERR:parse`);
    b.t(`get the short id of cd\\it`, `${h3.ids.cdA}`);
    b.batchEvaluate(h3, [AppendOfThisStack, EvaluateThereIs, EvaluateAsParsedFromAString]);
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
    b.t(`the short id of prev marked cd`, `${h3.ids.cdDD}`);
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
    /* prepare */
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
    b.t(`the short id of prev marked cd of bg 4`, `${h3.ids.cdDG}`);
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
    /* count number of! */
    b.t(`the number of marked cards`, `4`);
    b.t(`the number of marked cards of bg 1`, `0`);
    b.t(`the number of marked cards of bg 2`, `0`);
    b.t(`the number of marked cards of bg 3`, `1`);
    b.t(`the number of marked cards of bg 4`, `3`);
    b.t(`the number of marked cards of bg 999`, `ERR:could not find`);
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
    let b = new ScriptTestBatch();
    /* can't read ones from the wrong card */
    b.t(`go cd id ${h3.ids.cdDE}\\1`, `1`);
    b.t(`the short id of cd btn "p1"`, `ERR:could not find`);
    b.t(`the short id of cd fld "p2"`, `ERR:could not find`);
    b.t(`the short id of cd btn "p1" of cd 1`, `ERR:could not find`);
    b.t(`the short id of cd fld "p2" of cd 1`, `ERR:could not find`);
    b.t(`the short id of cd btn "p1" of cd id ${h3.ids.cdBC}`, `${h3.ids.bBC1}`);
    b.t(`the short id of cd fld "p2" of cd id ${h3.ids.cdBC}`, `${h3.ids.fBC2}`);
    /* look by name */
    b.t(`go cd id ${h3.ids.cdDE}\\1`, `1`);
    b.t(`the short id of cd (typ) "de1"`, `(1)`);
    b.t(`the short id of cd (typ) "de2"`, `(2)`);
    b.t(`the short id of cd (typ) "DE3"`, `(3)`);
    b.t(`the short id of cd (typ) "de1" of this bg --[[noSParse]]`, `ERR:parse err`);
    b.t(`the short id of cd (typ) "de1" of this stack --[[noSParse]]`, `ERR:parse err`);
    b.t(`the short id of cd (typ) "xyz"`, `ERR:could not find`);
    /* look by absolute */
    b.t(`the short id of cd (typ) 1`, `(1)`);
    b.t(`the short id of cd (typ) 2`, `(2)`);
    b.t(`the short id of cd (typ) 3`, `(3)`);
    b.t(`the short id of cd (typ) -1`, `ERR:could not find`);
    b.t(`the short id of cd (typ) 0`, `ERR:could not find`);
    b.t(`the short id of cd (typ) 99`, `ERR:could not find`);
    /* look by relative */
    b.t(`the short id of this cd (typ)`, `ERR:by position`);
    b.t(`the short id of prev cd (typ)`, `ERR:by position`);
    b.t(`the short id of next cd (typ)`, `ERR:by position`);
    b.t(`the short id of first cd (typ)`, `(1)`);
    b.t(`the short id of second cd (typ)`, `(2)`);
    b.t(`the short id of last cd (typ)`, `(3)`);
    /* bad syntax */
    b.t(`the short id of first cd (typ) 1`, `ERR:parse err`);
    b.t(`the short id of cd (typ) (typ) 1`, `PREPARSEERR:mode`);
    b.t(`the short id of cd 1 of this cd`, `ERR:parse err`);
    b.batchEvaluate(h3, [GoForBothFldAndBtn, EvaluateThereIs, EvaluateAsParsedFromAString]);
})
t.test('03exprNumberOfObjects', () => {
    let b = new ScriptTestBatch();
    b.t(`go cd id ${h3.ids.cdBB}\\1`, `1`);
    /* buttons and fields */
    b.t(`the number of cd btns`, `0`);
    b.t(`the number of cd flds`, `0`);
    b.t(`the number of bg btns`, `0`);
    b.t(`the number of bg btns`, `0`);
    /* the original product doesn't support this either */
    b.t(`the number of cd btns of cd id ${h3.ids.cdBC}`, `ERR:parse err`);
    b.t(`the number of cd flds of cd id ${h3.ids.cdBC}`, `ERR:parse err`);
    b.t(`go cd id ${h3.ids.cdBC}\\1`, `1`);
    b.t(`the number of cd btns`, `2`);
    b.t(`the number of cd flds`, `3`);
    /* cards */
    b.t(`the number of cards`, `10`);
    b.t(`the number of cards of this stack`, `10`);
    b.t(`the number of cards of bg 1`, `1`);
    b.t(`the number of cards of bg 2`, `3`);
    b.t(`the number of cards of bg 1 of this stack`, `1`);
    b.t(`the number of cards of bg 2 of this stack`, `3`);
    b.t(`the number of cards of bg 99`, `ERR:could not find`);
    b.t(`the number of cards of me`, `ERR:incorrect type`);
    b.t(`the number of cards of card 2`, `ERR:incorrect type`);
    b.t(`the number of cards of cd btn 1`, `ERR:incorrect type`);
    /* number of marked cards-see above */
    /* bkgnds */
    b.t(`the number of bkgnds`, `4`);
    b.t(`the number of bkgnds of this stack`, `4`);
    b.t(`the number of bkgnds of stack 2`, `ERR:could not find`);
    /* other */
    b.t(`the number of stacks`, `ERR:no variable`);
    b.t(`the number of ViperCards`, `ERR:no variable`);
    b.t(`the number of me`, `1`);
    /* parent should accept different expressions */
    b.t(`put "bg id ${h3.ids.bgB}" into x\\the number of cards of x`, `3`);
    b.t(`the number of cards of the owner of cd id ${h3.ids.cdBC}`, `3`);
    b.t(`the number of cards of (the owner of cd id ${h3.ids.cdBC})`, `3`);
    b.t(`the number of cards of the target`, `ERR:incorrect type`);
    b.batchEvaluate(h3, [EvaluateThereIs]);
})
t.test('03Object Auto-insert scope for backwards compat', () => {
    /* tests rewriteSpecifyCdOrBgPart in vpcRewritesGlobal.ts */
    /* turn on compat mode */
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', true, h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    b.t(`go to cd id ${h3.ids.cdBB}\\1`, `1`);
    b.t(`the number of btns`, `0`);
    b.t(`the number of flds`, `0`);
    b.t(`go to cd id ${h3.ids.cdBC}\\1`, `1`);
    b.t(`the number of btns`, `2`);
    b.t(`the number of flds`, `0`);
    b.t(`go cd id ${h3.ids.cdDE}\\1`, `1`);
    b.t(`the short id of btn 1`, `${h3.ids.bDE1}`);
    b.t(`the short id of btn "de2"`, `${h3.ids.bDE2}`);
    b.t(`the short id of last btn`, `${h3.ids.bDE3}`);
    b.t(`the short id of fld 1`, `ERR:could not find`);
    b.t(`the short id of fld "de2"`, `ERR:could not find`);
    b.t(`the short id of last fld`, `ERR:could not find`);
    b.batchEvaluate(h3, [EvaluateThereIs]);
    /* turn off compat mode */
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', false, h3.vcstate.model)
    );

    b = new ScriptTestBatch();
    b.t(`go cd id ${h3.ids.cdBB}\\1`, `1`);
    b.t(`the number of btns`, `PREPARSEERR:compatibility mode`);
    b.t(`the number of flds`, `PREPARSEERR:compatibility mode`);
    b.t(`go cd id ${h3.ids.cdBC}\\1`, `1`);
    b.t(`the number of btns`, `PREPARSEERR:compatibility mode`);
    b.t(`the number of flds`, `PREPARSEERR:compatibility mode`);
    b.t(`go cd id ${h3.ids.cdDE}\\1`, `1`);
    b.t(`the short id of btn 1`, `PREPARSEERR:compatibility mode`);
    b.t(`the short id of btn "de2"`, `PREPARSEERR:compatibility mode`);
    b.t(`the short id of last btn`, `PREPARSEERR:compatibility mode`);
    b.t(`the short id of fld 1`, `PREPARSEERR:compatibility mode`);
    b.t(`the short id of fld "de2"`, `PREPARSEERR:compatibility mode`);
    b.t(`the short id of last fld`, `PREPARSEERR:compatibility mode`);
    b.batchEvaluate(h3, [EvaluateThereIs]);
})

/* run the tests again, except for fld instead of btn */
class GoForBothFldAndBtn extends TestMultiplier {
    firstTransformation(code: string, expected: string): O<[string, string]> {
        code = code.replace(/\(typ\)/g, 'btn')
        expected = expected.replace(/\(1\)/g, `${h3.ids.bDE1}`)
        expected = expected.replace(/\(2\)/g, `${h3.ids.bDE2}`)
        expected = expected.replace(/\(3\)/g, `${h3.ids.bDE3}`)
        return [code, expected];
    }
    secondTransformation(code: string, expected: string): O<[string, string]> {
        code = code.replace(/\(typ\)/g, 'fld')
        expected = expected.replace(/\(1\)/g, `${h3.ids.fDE1}`)
        expected = expected.replace(/\(2\)/g, `${h3.ids.fDE2}`)
        expected = expected.replace(/\(3\)/g, `${h3.ids.fDE3}`)
        return [code, expected];
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
        assertWarn(s.startsWith('the short id of'), '');
        assertWarn(!s.includes('\\'), '');
        return s.replace(/the short id of/, 'there is a');
    }
    protected convertExpected(s: string) {
        if (s.startsWith('ERR:could not find')) {
            return 'false';
        } else if (s.startsWith('ERR:') || s.startsWith('PREPARSEERR:')) {
            return s;
        } else {
            assertWarn(s === 'WILD' || Util512.parseIntStrict(s) !== undefined, '');
            return 'true';
        }
    }
}

/**
 * transform from
 * the short id of card "myCard"
 * to
 * put "card "&quote&"myCard"&quote&"" into x; the short id of x
 */
export class EvaluateAsParsedFromAString extends TestMultiplier {
    secondTransformation(code: string, expected: string): O<[string, string]> {
        if (!code.startsWith('the short id of ') || code.includes('\\') || code.includes('--[[noSParse]]')) {
            /* might be testing a command, or going to a card */
            return undefined;
        } else {
            /* automatically skip "next", "third", etc */
            for (let key of listEnumValsIncludingAlternates(OrdinalOrPosition)) {
                if (key.toLowerCase() !=='this' && new RegExp('(^|\\b)'+key+'(\\b|$)', 'i').exec(code)) {
                    return undefined
                }
            }

            /* we don't support absolute like cd 4,
            so look for either quotes or the string id.
            bg 4. automatically skip "bg 4" */
            for (let key of listEnumValsIncludingAlternates(VpcElType)) {
                if (new RegExp('(^|\\b)'+key+'\\b [0-9]+(\\b|$)', 'i').exec(code)) {
                    return undefined
                }
            }

            code = '"' + code.substr('the short id of '.length) + '"'
            code = VpcEvalHelpers.escapeWithinString(code, /"/g, 'quote')
            code = `put ${code} into x\\the short id of x --[[${code}]]`
            if (expected.startsWith('ERR:') || expected.startsWith('PREPARSEERR:')) {
                expected = 'ERR:5:'
            }

            return [code, expected]
        }
    }
}

