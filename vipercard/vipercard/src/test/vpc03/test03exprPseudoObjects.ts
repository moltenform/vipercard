
/* auto */ import { ScriptTestBatch } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { h3 } from './test03lexer';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollection03exprPseudoObjects');
export let testCollection03exprPseudoObjects = t;

t.atest('--init--testCollection03exprPseudoObject', async () => {
    assertTrue(
        h3,
        longstr(`forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`)
    );
});
t.test('03exprPseudoObject a', () => {
    let b = new ScriptTestBatch();
    b.t('the short id of the target', `${h3.ids.cdA}`)
    b.batchEvaluate(h3);
});
