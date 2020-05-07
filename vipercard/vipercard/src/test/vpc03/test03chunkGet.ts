
/* auto */ import { ScriptTestBatch } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { h3 } from './test03lexer';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollection03chunkGet');
export let testCollection03chunkGet = t;

t.atest('--init--testCollection03chunkGet', async () => {
    assertTrue(h3, longstr(`forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`))
});

/*
    what's not covered by the extensive test:
        put "" into char 2 to 4 of z
        put "AB" into char 2 to 4 of z
        set the textstyle of char 2 to 4 of cd fld 1 to bold
        ensure disallow going backwards in scope
        
    item,word,line,char and 3 slots.
    we disallow line/item after word
    we disallow everything after char
    char->char->char, covered by tests
    item->item->item, covered by tests
    line->line->line, covered by tests
    word->word->word, covered by tests
    char->item->item, covered by tests
    item->line->line, covered by tests
    line and item likely have same underlying logic.
    so test here:
    char->char->item
    char->char->word
    char->word->word
    char->item->line
    char->line->item
    line->item->line
    item->line->item
*/

t.test('03getchunkexpression_char', () => {
    let b = new ScriptTestBatch();
    /* normal char */
    b.t('global z\nput "abc" into z\\1', '1')
    b.t('char 1 of z', 'a')
    b.t('char 2 of z', 'b')
    b.t('char 3 of z', 'c')
    /* abnormal char */
    b.t('char 0 of z', '')
    b.t('char 4 of z', '')
    b.t('char 5 of z', '')
    /* normal ranges */
    b.t('char 1 to 1 of z', 'a')
    b.t('char 1 to 2 of z', 'ab')
    b.t('char 1 to 3 of z', 'abc')
    b.t('char 2 to 3 of z', 'bc')
    /* recurse */
    b.t('char 2 of char 1 to 2 of z', 'b')
    b.t('char 2 to 3 of char 1 to 3 of z', 'bc')
    b.t('char 2 to 3 of char 2 to 3 of char 1 to 3 of z', 'c')
    b.batchEvaluate(h3);
});


