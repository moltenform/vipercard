
/* auto */ import { ScriptTestBatch } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { cAltProductName, cProductName } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, Util512, longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { TestVpc03, h3, testCollection03lexer } from './test03lexer';


/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollection03exprObjectRef');
export let testCollection03exprObjectRef = t;
//~ enable this when we support bg elements
let useBg = false

t.atest('--init--testCollection03exprObjectRef', async () => {
    assertTrue(h3, longstr(`forgot to include the
        testCollection03lexer test? put it below this test in _testTop_.ts`))
});
t.test('03ObjectSpecial', () => {
    let b = new ScriptTestBatch();
    /* special objects */
    b.t(`the short id of ${cProductName}`, `WILD`)
    b.t(`the short id of ${cAltProductName}`, `WILD`)
    b.t(`the short id of me`, `${h3.ids.go}`)
    /* invalid syntax objects */
    b.t(`the short id of 9`, `ERR:parse`)
    b.t(`the short id of 9 card`, `ERR:parse`)
    b.t(`the short id of 9 me`, `ERR:parse`)
    b.t(`the short id of card card 1`, `ERR:parse`)
    b.t(`the short id of id`, `ERR:parse`)
    b.t(`the short id of part`, `ERR:parse`)
    b.t(`the short id of button`, `ERR:parse`)
    evaluateForBothShortIdAndThereIs(b, h3)
    /* exists, but wrong type
    test every combination! */
    let map = new MapKeyToObjectCanSet<string>()
    map.set(h3.ids.stack, "stack")
    map.set(h3.ids.bgA, "bg")
    map.set(h3.ids.cdA, "cd")
    map.set(h3.ids.bBC1, "cd btn")
    map.set(h3.ids.fBC1, "cd fld")
    if (useBg) {
        map.set(h3.ids.bgbB1, "bg btn")
        map.set(h3.ids.bgfB1, "bg fld")
    }
    b = new ScriptTestBatch();
    for (let key of map.getKeys()) {
        for (let val of map.getVals()) {
            let isOk = map.get(key) === val
            if (isOk) {
                b.t(`the short id of ${val} id ${key}`, `${key}`)
            } else {
                b.t(`the short id of ${val} id ${key}`, `ERR:ggggggg`)
            }
        }
    }

    b.batchEvaluate(h3);
})
t.test('03ObjectPart', () => {
    let b = new ScriptTestBatch();
    /* btns are valid parts */
    b.t(`show cd btn id ${h3.ids.go}\\0`, `0`)
    /* we don't yet support referring by part.
    because we support object lookup by string (set the loc of x to 2,3)
    it's not really necessary */
    b.t(`show cd part id 1\\0`, `ERR:parse`)
    b.t(`show bg part id 1\\0`, `ERR:parse`)
    b.t(`show part id 1\\0`, `ERR:parse err`)
    b.t(`show cd part 1\\0`, `ERR:parse err`)
    b.t(`show bg part 1\\0`, `ERR:parse err`)
    b.t(`show part 1\\0`, `ERR:parse err`)
    b.t(`show part (1 + 1)\\0`, `ERR:parse err`)
    b.t(`show first part\\0`, `ERR:parse err`)
    b.t(`show first part of this card\\0`, `ERR:parse err`)
    b.batchEvaluate(h3);
})
t.test('03ObjectStack', () => {
    let b = new ScriptTestBatch();
    /* by position, confirmed in emulator */
    b.t(`the short id of this stack`, `${h3.ids.stack}`)
    b.t(`the short id of next stack`, `ERR:could not find`)
    b.t(`the short id of prev stack`, `ERR:could not find`)
    /* we should not support ordinal */
    b.t(`the short id of first stack`, `ERR:parse`)
    b.t(`the short id of last stack`, `ERR:parse`)
    b.t(`the short id of any stack`, `ERR:parse`)
    /* by expression */
    b.t(`the short id of stack 1`, `${h3.ids.stack}`)
    b.t(`the short id of stack id 1`, `ERR:could not find`)
    b.t(`the short id of stack id ${h3.ids.stack}`, `${h3.ids.stack}`)
    /* by expression, not exist */
    b.t(`the short id of stack 999`, `ERR:could not find`)
    b.t(`the short id of stack id 9`, `ERR:could not find`)
    b.t(`the short id of stack id -9`, `ERR:could not find`)
    b.t(`the short id of stack id "no"`, `ERR:could not find`)
    /* stack-at-end-of-line is parsed differently*/
    b.t(`the short id of stack`, `ERR:parse`)
    b.t(`get the short id of first stack\\it`, `ERR:parse`)
    b.t(`get the short id of this stack\\it`, `${h3.ids.stack}`)
    b.t(`get the short id of stack\\it`, `${h3.ids.stack}`)
    b.batchEvaluate(h3);
})
t.test('03ObjectBg', () => {
    let b = new ScriptTestBatch();
    /* synonyms */
    b.t(`the short id of this bg`, `${h3.ids.bgA}`)
    b.t(`the short id of this bkgnd`, `${h3.ids.bgA}`)
    b.t(`the short id of this background`, `${h3.ids.bgA}`)
    /* by expression */
    b.t(`the short id of bg id ${h3.ids.bgA}`, `${h3.ids.bgA}`)
    b.t(`the short id of bg id ${h3.ids.bgB}`, `${h3.ids.bgB}`)
    b.t(`the short id of bg 1`, `${h3.ids.bgA}`)
    b.t(`the short id of bg 2`, `${h3.ids.bgB}`)
    b.t(`the short id of bg "a"`, `${h3.ids.bgA}`)
    b.t(`the short id of bg "b"`, `${h3.ids.bgB}`)
    b.t(`the short id of bg "A"`, `${h3.ids.bgA}`)
    b.t(`the short id of bg "B"`, `${h3.ids.bgB}`)
    /* by ord/position */
    b.t(`the short id of third bg`, `${h3.ids.bgC}`)
    b.t(`the short id of second bg`, `${h3.ids.bgB}`)
    b.t(`the short id of first bg`, `${h3.ids.bgA}`)
    b.t(`the short id of this bg`, `${h3.ids.bgA}`)
    b.t(`the short id of next bg`, `${h3.ids.bgB}`)
    b.t(`the short id of prev bg`, `${h3.ids.bgC}`)
    /* by ord/position at end of line */
    b.t(`get the short id of second bg\\it`, `${h3.ids.bgB}`)
    b.t(`get the short id of this bg\\it`, `${h3.ids.bgA}`)
    b.t(`get the short id of next bg\\it`, `${h3.ids.bgB}`)
    /* not exist, by expression */
    b.t(`the short id of bg id 9`, `ERR:xxxx`)
    b.t(`the short id of bg 999`, `ERR:xxxx`)
    b.t(`the short id of bg "xyz"`, `ERR:xxxx`)
    /* not exist, by ord/position */
    b.t(`the short id of tenth bg`, `ERR:xxxx`)
    /* not exist, by ord/position at end of line */
    b.t(`get the short id of tenth bg\\it`, `ERR:xxxx`)
    /* bg-at-end-of-line is parsed differently*/
    b.t(`the short id of bg\\it`, `ERR:parse`)
    b.t(`get the short id of 1 bg\\it`, `ERR:parse`)
    b.t(`get the short id of bg\\it`, `${h3.ids.bgA}`)
    let savedTests = b.tests
    b.batchEvaluate(h3);

    /* run the tests again, specifying the stack */
    b = new ScriptTestBatch();
    b.tests = savedTests.map(item=>[item[0]+' of stack 1', item[1]])
    b.batchEvaluate(h3);
})
    //~ todo: don't just get fld 1, get all the objects in all possible ways

    
function evaluateForBothShortIdAndThereIs(b:ScriptTestBatch, h3:TestVpc03) {
    let savedTests = b.tests
    b.batchEvaluate(h3)
    let convert1 = (s:string) => {
        assertTrue(s.startsWith("the short id of"), '')
        assertTrue(!s.includes("\\"), '')
        return s.replace(/the short id of/, 'there is a')
    }

    let convert2 = (s:string) => {
        if (s.startsWith('ERR:could not find')) {
            return "false"
        } else if (s.startsWith('ERR:')||s.startsWith('PREPARSEERR:')) {
            return s
        } else {
            assertTrue(s === 'WILD' || Util512.parseIntStrict(s) !== undefined, "")
            return "true"
        }
    }

    /* convert it from "the short id" to "there is a" */
    b = new ScriptTestBatch()
    b.tests = savedTests.map(item=>[convert1(item[0]), convert2(item[1])])
    b.batchEvaluate(h3)
}
