
/* auto */ import { ScriptTestBatch, TestMultiplier } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { O, cAltProductName, cProductName } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, Util512, longstr } from './../../ui512/utils/util512';
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
    /* special objects */
    b.t(`the short id of ${cProductName}`, `WILD`);
    b.t(`the short id of ${cAltProductName}`, `WILD`);
    b.t(`the short id of me`, `${h3.ids.go}`);
    /* invalid syntax objects */
    b.t(`the short id of 9`, `ERR:parse`);
    b.t(`the short id of 9 card`, `ERR:parse`);
    b.t(`the short id of 9 me`, `ERR:parse`);
    b.t(`the short id of card card 1`, `ERR:parse`);
    b.t(`the short id of id`, `ERR:parse`);
    b.t(`the short id of the`, `ERR:parse`);
    b.t(`the short id of stack`, `ERR:parse`);
    b.t(`the short id of button`, `PREPARSEERR:compatibility`);

    b.batchEvaluate(h3, [EvaluateForBothShortIdAndThereIs]);
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

    b = new ScriptTestBatch();
    for (let key of map.getKeys()) {
        for (let val of map.getVals()) {
            let isOk = map.get(key) === val;
            if (isOk) {
                b.t(`the short id of ${val} id ${key}`, `${key}`);
            } else {
                b.t(`the short id of ${val} id ${key}`, `ERR:could not find`);
            }
        }
    }

    b.batchEvaluate(h3);
});
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
    b.batchEvaluate(h3);
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
    /* stack-at-end-of-line is parsed differently*/
    b.t(`the short id of stack`, `ERR:parse`);
    b.t(`get the short id of first stack\\it`, `ERR:parse`);
    b.t(`get the short id of this stack\\it`, `${h3.ids.stack}`);
    b.t(`get the short id of stack\\it`, `${h3.ids.stack}`);
    b.batchEvaluate(h3);
});
t.test('03ObjectBg', () => {
    let b = new ScriptTestBatch();
    b.t(`go cd 1\\1`, `1`);
    /* by ord/position at end of line */
    b.t(`get the short id of second bg\\it`, `${h3.ids.bgB}`);
    b.t(`get the short id of this bg\\it`, `${h3.ids.bgA}`);
    b.t(`get the short id of next bg\\it`, `${h3.ids.bgB}`);
    /* not exist, by ord/position at end of line */
    b.t(`get the short id of tenth bg\\it`, `ERR:could not find`);
    /* bg-at-end-of-line is parsed differently*/
    b.t(`put the short id of bg into x\\x`, `ERR:parse`);
    b.t(`get the short id of 1 bg\\it`, `ERR:parse`);
    b.t(`get the short id of bg\\it`, `${h3.ids.bgA}`);
    b.batchEvaluate(h3);
    b = new ScriptTestBatch();
    /* synonyms */
    b.t(`the short id of this bg`, `${h3.ids.bgA}`);
    b.t(`the short id of this bkgnd`, `${h3.ids.bgA}`);
    b.t(`the short id of this background`, `${h3.ids.bgA}`);
    /* by expression */
    b.t(`the short id of bg id ${h3.ids.bgA}`, `${h3.ids.bgA}`);
    b.t(`the short id of bg id ${h3.ids.bgB}`, `${h3.ids.bgB}`);
    b.t(`the short id of bg 1`, `${h3.ids.bgA}`);
    b.t(`the short id of bg 2`, `${h3.ids.bgB}`);
    b.t(`the short id of bg "a"`, `${h3.ids.bgA}`);
    b.t(`the short id of bg "b"`, `${h3.ids.bgB}`);
    b.t(`the short id of bg "A"`, `${h3.ids.bgA}`);
    b.t(`the short id of bg "B"`, `${h3.ids.bgB}`);
    /* by ord/position */
    b.t(`the short id of third bg`, `${h3.ids.bgC}`);
    b.t(`the short id of second bg`, `${h3.ids.bgB}`);
    b.t(`the short id of first bg`, `${h3.ids.bgA}`);
    b.t(`the short id of this bg`, `${h3.ids.bgA}`);
    b.t(`the short id of next bg`, `${h3.ids.bgB}`);
    b.t(`the short id of prev bg`, `${h3.ids.bgC}`);
    /* not exist, by expression */
    b.t(`the short id of bg id 9`, `ERR:could not find`);
    b.t(`the short id of bg 999`, `ERR:could not find`);
    b.t(`the short id of bg "xyz"`, `ERR:could not find`);
    /* not exist, by ord/position */
    b.t(`the short id of tenth bg`, `ERR:could not find`);

    /* run the tests again, specifying the stack */
    class AppendOfThisStack extends TestMultiplier {
        secondTransformation(code: string, expected: string): O<[string, string]> {
            code = code + ' of stack 1';
            return [code, expected];
        }
    }

    b.batchEvaluate(h3, [AppendOfThisStack, EvaluateForBothShortIdAndThereIs]);
});
//~ todo: don't just get fld 1, get all the objects in all possible ways

/**
 * transform it from "the short id" to "there is a"
 */
//~ todo: use this everywhere
class EvaluateForBothShortIdAndThereIs extends TestMultiplier {
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
