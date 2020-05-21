
/* auto */ import { ScriptTestBatch } from './../../vpc/vpcTestScriptRunBase';
/* auto */ import { assertTrue } from './../../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../../testUtils/testUtils';
/* auto */ import { h3 } from './../test03lexer';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */


let t = new SimpleUtil512TestCollection('testCollection03fnsStandalone');
export let testCollection03fnsStandalone = t;

t.atest('--init--testCollection03fnsStandalone', async () => {
    assertTrue(h3, longstr(`forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`))
});
t.test('casing', () => {
    let b = new ScriptTestBatch();
    b.t('toUpperCase("abc")', 'ABC')
    b.t('toUpperCase("AbC")', 'ABC')
    b.t('toUpperCase("ABC")', 'ABC')
    b.t('toUpperCase("123 abc")', '123 ABC')
    b.t('toUpperCase("123 AbC")', '123 ABC')
    b.t('toUpperCase("123 ABC")', '123 ABC')
    b.t('toUpperCase("123 ")', '123 ')
    b.t('toLowerCase("abc")', 'abc')
    b.t('toLowerCase("AbC")', 'abc')
    b.t('toLowerCase("ABC")', 'abc')
    b.t('toLowerCase("123 abc")', '123 abc')
    b.t('toLowerCase("123 AbC")', '123 abc')
    b.t('toLowerCase("123 ABC")', '123 abc')
    b.t('toLowerCase("123 ")', '123 ')
    b.batchEvaluate(h3);
});
t.test('min and max', () => {
    let b = new ScriptTestBatch();
    b.t('min(46, 40, 50)', '40')
    b.t('min("46,40,50")', '40')
    b.t('min(40)', '40')
    b.t('max(46, 40, 50)', '50')
    b.t('max("46,40,50")', '50')
    b.t('max(50)', '50')
    b.batchEvaluate(h3);
});
t.test('sum and average', () => {
    let b = new ScriptTestBatch();
    b.t('sum(46, 40, 50, 4)', '140')
    b.t('sum("46,40,50,4")', '140')
    b.t('sum(40)', '40')
    b.t('average(46, 40, 50, 4)', '35')
    b.t('average("46,40,50,4")', '35')
    b.t('average(40)', '40')
    b.batchEvaluate(h3);
});
