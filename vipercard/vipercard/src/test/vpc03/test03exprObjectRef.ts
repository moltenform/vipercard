
/* auto */ import { ScriptTestBatch } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { h3, testCollection03lexer } from './test03lexer';


/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollection03exprObjectRef');
export let testCollection03exprObjectRef = t;

t.atest('--init--testCollection03exprObjectRef', async () => {
    assertTrue(h3, longstr(`forgot to include the
        testCollection03lexer test? put it below this test in _testTop_.ts`))
});
t.test('03ObjectBtn', () => {
    //~ let b = new ScriptTestBatch();
    //~ b.t(`the id `, ``)
    //~ b.batchEvaluate(h3);
})
