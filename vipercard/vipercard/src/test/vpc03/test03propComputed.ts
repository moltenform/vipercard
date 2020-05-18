
/* auto */ import { ScriptTestBatch } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { h3 } from './test03lexer';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */


let t = new SimpleUtil512TestCollection('testCollection03propComputed');
export let testCollection03propComputed = t;

t.atest('--init--testCollection03propComputed', async () => {
    assertTrue(h3, longstr(`forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`))
});
t.test('number property', () => {
    let b = new ScriptTestBatch();
    b.t(`the number of cd btn id ${h3.ids.cdA}`, `1`)
    
    b.batchEvaluate(h3);
});
