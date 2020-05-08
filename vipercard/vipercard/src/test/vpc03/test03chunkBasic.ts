
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
    assertTrue(
        h3,
        longstr(`forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`)
    );
});

/*
everything here is confirmed in emulator.

    what's not covered by the extensive test:
        put "" into char 2 to 4 of z
        put "A" into char 2 to 4 of z
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

/**
 * get chunk
 */
t.test('03chunkexpression_get_char', () => {
    let b = new ScriptTestBatch();
    /* normal char */
    b.t('global z\nput "abc" into z\\1', '1');
    b.t('char 1 of z', 'a');
    b.t('char 2 of z', 'b');
    b.t('char 3 of z', 'c');
    /* abnormal char */
    b.t('char 0 of z', '');
    b.t('char 4 of z', '');
    b.t('char 5 of z', '');
    /* normal ranges */
    b.t('char 1 to 1 of z', 'a');
    b.t('char 1 to 2 of z', 'ab');
    b.t('char 1 to 3 of z', 'abc');
    b.t('char 2 to 3 of z', 'bc');
    /* recurse */
    b.t('char 2 of char 1 to 2 of z', 'b');
    b.t('char 2 to 3 of char 1 to 3 of z', 'bc');
    b.t('char 2 to 3 of char 2 to 3 of char 1 to 3 of z', 'c');
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_get_word', () => {
    let b = new ScriptTestBatch();
    /* normal word */
    b.t('global z\nput "a.b  c.d" & cr & "e" into z\\1', '1');
    b.t('word 1 of z', 'a.b');
    b.t('word 2 of z', 'c.d');
    b.t('word 3 of z', 'e');
    /* abnormal word */
    b.t('word 0 of z', '');
    b.t('word 4 of z', '');
    b.t('word 5 of z', '');
    /* normal ranges */
    b.t('word 1 to 1 of z', 'a.b');
    b.t('word 1 to 2 of z', 'a.b  c.d');
    b.t('word 1 to 3 of z', 'a.b  c.d\ne');
    b.t('word 2 to 3 of z', 'c.d\ne');
    /* recurse */
    b.t('word 2 of word 1 to 2 of z', 'c.d');
    b.t('word 2 to 3 of word 1 to 3 of z', 'c.d\ne');
    b.t('word 2 to 3 of word 2 to 3 of word 1 to 3 of z', 'e');
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_get_line', () => {
    let b = new ScriptTestBatch();
    /* normal line */
    b.t('global z\nput "ab" & cr & "cd" & cr & "ef" into z\\1', '1');
    b.t('line 1 of z', 'ab');
    b.t('line 2 of z', 'cd');
    b.t('line 3 of z', 'ef');
    /* abnormal line */
    b.t('line 0 of z', '');
    b.t('line 4 of z', '');
    b.t('line 5 of z', '');
    /* normal ranges */
    b.t('line 1 to 1 of z', 'ab');
    b.t('line 1 to 2 of z', 'ab\ncd');
    b.t('line 1 to 3 of z', 'ab\ncd\nef');
    b.t('line 2 to 3 of z', 'cd\nef');
    /* recurse */
    b.t('line 2 of line 1 to 2 of z', 'cd');
    b.t('line 2 to 3 of line 1 to 3 of z', 'cd\nef');
    b.t('line 2 to 3 of line 2 to 3 of line 1 to 3 of z', 'ef');
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_get_item', () => {
    h3.vcstate.model.productOpts.setProductOpt('itemDel', ',');
    let b = new ScriptTestBatch();
    /* normal item */
    b.t('global z\nput "ab,,cd" into z\\1', '1');
    b.t('item 1 of z', 'ab');
    b.t('item 2 of z', '');
    b.t('item 3 of z', 'cd');
    /* abnormal item */
    b.t('item 0 of z', '');
    b.t('item 4 of z', '');
    b.t('item 5 of z', '');
    /* normal ranges */
    b.t('item 1 to 1 of z', 'ab');
    b.t('item 1 to 2 of z', 'ab,');
    b.t('item 1 to 3 of z', 'ab,,cd');
    b.t('item 2 to 3 of z', ',cd');
    /* recurse */
    b.t('item 2 of item 1 to 2 of z', '');
    b.t('item 2 to 3 of item 1 to 3 of z', ',cd');
    b.t('item 2 to 3 of item 2 to 3 of item 1 to 3 of z', 'cd');
    b.batchEvaluate(h3);
});

/**
 * put empty chunk
 */
t.test('03chunkexpression_put_empty_char', () => {
    let b = new ScriptTestBatch();
    /* normal char */
    b.t('global z1\nput "abc" into z1\\1', '1');
    b.t('put z1 into z\nput "" into char 1 of z\\z', 'bc');
    b.t('put z1 into z\nput "" into char 2 of z\\z', 'ac');
    b.t('put z1 into z\nput "" into char 3 of z\\z', 'ab');
    /* abnormal char */
    b.t('put z1 into z\nput "" into char 0 of z\\z', 'abc');
    b.t('put z1 into z\nput "" into char 4 of z\\z', 'abc');
    b.t('put z1 into z\nput "" into char 5 of z\\z', 'abc');
    /* normal ranges */
    b.t('put z1 into z\nput "" into char 1 to 1 of z\\z', 'bc');
    b.t('put z1 into z\nput "" into char 1 to 2 of z\\z', 'c');
    b.t('put z1 into z\nput "" into char 1 to 3 of z\\z', '');
    b.t('put z1 into z\nput "" into char 2 to 3 of z\\z', 'a');
    /* recurse */
    b.t('put z1 into z\nput "" into char 2 of char 1 to 2 of z\\z', 'ac');
    b.t('put z1 into z\nput "" into char 2 to 3 of char 1 to 3 of z\\z', 'a');
    b.t(
        'put z1 into z\nput "" into char 2 to 3 of char 2 to 3 of char 1 to 3 of z\\z',
        'a'
    );
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_put_empty_word', () => {
    let b = new ScriptTestBatch();
    /* normal word */
    b.t('global z1\nput "a.b  c.d" & cr & "e" into z1\\1', '1');
    b.t('put z1 into z\nput "" into word 1 of z\\z', '  c.d\ne');
    b.t('put z1 into z\nput "" into word 2 of z\\z', 'a.b  \ne');
    b.t('put z1 into z\nput "" into word 3 of z\\z', 'a.b  c.d\n');
    /* abnormal word */
    b.t('put z1 into z\nput "" into word 0 of z\\z', 'a.b  c.d\ne');
    b.t('put z1 into z\nput "" into word 4 of z\\z', 'a.b  c.d\ne');
    b.t('put z1 into z\nput "" into word 5 of z\\z', 'a.b  c.d\ne');
    /* normal ranges */
    b.t('put z1 into z\nput "" into word 1 to 1 of z\\z', '  c.d\ne');
    b.t('put z1 into z\nput "" into word 1 to 2 of z\\z', '\ne');
    b.t('put z1 into z\nput "" into word 1 to 3 of z\\z', '');
    b.t('put z1 into z\nput "" into word 2 to 3 of z\\z', 'a.b  ');
    /* recurse */
    b.t('put z1 into z\nput "" into word 2 of word 1 to 2 of z\\z', 'a.b  \ne');
    b.t('put z1 into z\nput "" into word 2 to 3 of word 1 to 3 of z\\z', 'a.b  ');
    b.t(
        'put z1 into z\nput "" into word 2 to 3 of word 2 to 3 of word 1 to 3 of z\\z',
        'a.b  '
    );
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_put_empty_line', () => {
    let b = new ScriptTestBatch();
    /* normal line */
    b.t('global z1\nput "ab" & cr & "cd" & cr & "ef" into z1\\1', '1');
    b.t('put z1 into z\nput "" into line 1 of z\\z', '\ncd\nef');
    b.t('put z1 into z\nput "" into line 2 of z\\z', 'ab\n\nef');
    b.t('put z1 into z\nput "" into line 3 of z\\z', 'ab\ncd\n');
    /* abnormal line */
    b.t('put z1 into z\nput "" into line 0 of z\\z', 'ab\ncd\nef');
    b.t('put z1 into z\nput "" into line 4 of z\\z', 'ab\ncd\nef\n');
    b.t('put z1 into z\nput "" into line 5 of z\\z', 'ab\ncd\nef\n\n');
    /* normal ranges */
    b.t('put z1 into z\nput "" into line 1 to 1 of z\\z', '\ncd\nef');
    b.t('put z1 into z\nput "" into line 1 to 2 of z\\z', '\nef');
    b.t('put z1 into z\nput "" into line 1 to 3 of z\\z', '');
    b.t('put z1 into z\nput "" into line 2 to 3 of z\\z', 'ab\n');
    /* recurse */
    b.t('put z1 into z\nput "" into line 2 of line 1 to 2 of z\\z', 'ab\n\nef');
    b.t('put z1 into z\nput "" into line 2 to 3 of line 1 to 3 of z\\z', 'ab\n');
    b.t(
        'put z1 into z\nput "" into line 2 to 3 of line 2 to 3 of line 1 to 3 of z\\z',
        'ab\n'
    );
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_put_empty_item', () => {
    h3.vcstate.model.productOpts.setProductOpt('itemDel', ',');
    let b = new ScriptTestBatch();
    /* normal item */
    b.t('global z1\nput "ab,,cd" into z1\\1', '1');
    b.t('put z1 into z\nput "" into item 1 of z\\z', ',,cd');
    b.t('put z1 into z\nput "" into item 2 of z\\z', 'ab,,cd');
    b.t('put z1 into z\nput "" into item 3 of z\\z', 'ab,,');
    /* abnormal item */
    b.t('put z1 into z\nput "" into item 0 of z\\z', 'ab,,cd');
    b.t('put z1 into z\nput "" into item 4 of z\\z', 'ab,,cd,');
    b.t('put z1 into z\nput "" into item 5 of z\\z', 'ab,,cd,,');
    /* normal ranges */
    b.t('put z1 into z\nput "" into item 1 to 1 of z\\z', ',,cd');
    b.t('put z1 into z\nput "" into item 1 to 2 of z\\z', ',cd');
    b.t('put z1 into z\nput "" into item 1 to 3 of z\\z', '');
    b.t('put z1 into z\nput "" into item 2 to 3 of z\\z', 'ab,');
    /* recurse */
    b.t('put z1 into z\nput "" into item 2 of item 1 to 2 of z\\z', 'ab,,cd');
    b.t('put z1 into z\nput "" into item 2 to 3 of item 1 to 3 of z\\z', 'ab,');
    b.t(
        'put z1 into z\nput "" into item 2 to 3 of item 2 to 3 of item 1 to 3 of z\\z',
        'ab,'
    );
    b.batchEvaluate(h3);
});

/**
 * put one char
 */
t.test('03chunkexpression_put_one_char', () => {
    let b = new ScriptTestBatch();
    /* normal char */
    b.t('global z1\nput "abc" into z1\\1', '1');
    b.t('put z1 into z\nput "A" into char 1 of z\\z', 'Abc');
    b.t('put z1 into z\nput "A" into char 2 of z\\z', 'aAc');
    b.t('put z1 into z\nput "A" into char 3 of z\\z', 'abA');
    /* abnormal char */
    b.t('put z1 into z\nput "A" into char 0 of z\\z', 'Aabc');
    b.t('put z1 into z\nput "A" into char 4 of z\\z', 'abcA');
    b.t('put z1 into z\nput "A" into char 5 of z\\z', 'abcA');
    /* normal ranges */
    b.t('put z1 into z\nput "A" into char 1 to 1 of z\\z', 'Abc');
    b.t('put z1 into z\nput "A" into char 1 to 2 of z\\z', 'Ac');
    b.t('put z1 into z\nput "A" into char 1 to 3 of z\\z', 'A');
    b.t('put z1 into z\nput "A" into char 2 to 3 of z\\z', 'aA');
    /* recurse */
    b.t('put z1 into z\nput "A" into char 2 of char 1 to 2 of z\\z', 'aAc');
    b.t('put z1 into z\nput "A" into char 2 to 3 of char 1 to 3 of z\\z', 'aA');
    b.t(
        'put z1 into z\nput "A" into char 2 to 3 of char 2 to 3 of char 1 to 3 of z\\z',
        'aA'
    );
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_put_one_word', () => {
    let b = new ScriptTestBatch();
    /* normal word */
    b.t('global z1\nput "a.b  c.d" & cr & "e" into z1\\1', '1');
    b.t('put z1 into z\nput "A" into word 1 of z\\z', 'A  c.d\ne');
    b.t('put z1 into z\nput "A" into word 2 of z\\z', 'a.b  A\ne');
    b.t('put z1 into z\nput "A" into word 3 of z\\z', 'a.b  c.d\nA');
    /* abnormal word */
    b.t('put z1 into z\nput "A" into word 0 of z\\z', 'Aa.b  c.d\ne');
    b.t('put z1 into z\nput "A" into word 4 of z\\z', 'a.b  c.d\neA');
    b.t('put z1 into z\nput "A" into word 5 of z\\z', 'a.b  c.d\neA');
    /* normal ranges */
    b.t('put z1 into z\nput "A" into word 1 to 1 of z\\z', 'A  c.d\ne');
    b.t('put z1 into z\nput "A" into word 1 to 2 of z\\z', 'A\ne');
    b.t('put z1 into z\nput "A" into word 1 to 3 of z\\z', 'A');
    b.t('put z1 into z\nput "A" into word 2 to 3 of z\\z', 'a.b  A');
    /* recurse */
    b.t('put z1 into z\nput "A" into word 2 of word 1 to 2 of z\\z', 'a.b  A\ne');
    b.t('put z1 into z\nput "A" into word 2 to 3 of word 1 to 3 of z\\z', 'a.b  A');
    b.t(
        'put z1 into z\nput "A" into word 2 to 3 of word 2 to 3 of word 1 to 3 of z\\z',
        'a.b  A'
    );
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_put_one_line', () => {
    let b = new ScriptTestBatch();
    /* normal line */
    b.t('global z1\nput "ab" & cr & "cd" & cr & "ef" into z1\\1', '1');
    b.t('put z1 into z\nput "A" into line 1 of z\\z', 'A\ncd\nef');
    b.t('put z1 into z\nput "A" into line 2 of z\\z', 'ab\nA\nef');
    b.t('put z1 into z\nput "A" into line 3 of z\\z', 'ab\ncd\nA');
    /* abnormal line */
    b.t('put z1 into z\nput "A" into line 0 of z\\z', 'Aab\ncd\nef');
    b.t('put z1 into z\nput "A" into line 4 of z\\z', 'ab\ncd\nef\nA');
    b.t('put z1 into z\nput "A" into line 5 of z\\z', 'ab\ncd\nef\n\nA');
    /* normal ranges */
    b.t('put z1 into z\nput "A" into line 1 to 1 of z\\z', 'A\ncd\nef');
    b.t('put z1 into z\nput "A" into line 1 to 2 of z\\z', 'A\nef');
    b.t('put z1 into z\nput "A" into line 1 to 3 of z\\z', 'A');
    b.t('put z1 into z\nput "A" into line 2 to 3 of z\\z', 'ab\nA');
    /* recurse */
    b.t('put z1 into z\nput "A" into line 2 of line 1 to 2 of z\\z', 'ab\nA\nef');
    b.t('put z1 into z\nput "A" into line 2 to 3 of line 1 to 3 of z\\z', 'ab\nA');
    b.t(
        'put z1 into z\nput "A" into line 2 to 3 of line 2 to 3 of line 1 to 3 of z\\z',
        'ab\nA'
    );
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_put_one_item', () => {
    h3.vcstate.model.productOpts.setProductOpt('itemDel', ',');
    let b = new ScriptTestBatch();
    /* normal item */
    b.t('global z1\nput "ab,,cd" into z1\\1', '1');
    b.t('put z1 into z\nput "A" into item 1 of z\\z', 'A,,cd');
    b.t('put z1 into z\nput "A" into item 2 of z\\z', 'ab,A,cd');
    b.t('put z1 into z\nput "A" into item 3 of z\\z', 'ab,,A');
    /* abnormal item */
    b.t('put z1 into z\nput "A" into item 0 of z\\z', 'Aab,,cd');
    b.t('put z1 into z\nput "A" into item 4 of z\\z', 'ab,,cd,A');
    b.t('put z1 into z\nput "A" into item 5 of z\\z', 'ab,,cd,,A');
    /* normal ranges */
    b.t('put z1 into z\nput "A" into item 1 to 1 of z\\z', 'A,,cd');
    b.t('put z1 into z\nput "A" into item 1 to 2 of z\\z', 'A,cd');
    b.t('put z1 into z\nput "A" into item 1 to 3 of z\\z', 'A');
    b.t('put z1 into z\nput "A" into item 2 to 3 of z\\z', 'ab,A');
    /* recurse */
    b.t('put z1 into z\nput "A" into item 2 of item 1 to 2 of z\\z', 'ab,A,cd');
    b.t('put z1 into z\nput "A" into item 2 to 3 of item 1 to 3 of z\\z', 'ab,A');
    b.t(
        'put z1 into z\nput "A" into item 2 to 3 of item 2 to 3 of item 1 to 3 of z\\z',
        'ab,A'
    );
    b.batchEvaluate(h3);
});

/**
 * delete chunk
 */
t.test('03chunkexpression_delete_char', () => {
    let b = new ScriptTestBatch();
    /* normal char */
    b.t('global z1\nput "abc" into z1\\1', '1');
    b.t('put z1 into z\ndelete char 1 of z\\z', 'bc');
    b.t('put z1 into z\ndelete char 2 of z\\z', 'ac');
    b.t('put z1 into z\ndelete char 3 of z\\z', 'ab');
    /* abnormal char */
    b.t('put z1 into z\ndelete char 0 of z\\z', 'abc');
    b.t('put z1 into z\ndelete char 4 of z\\z', 'abc');
    b.t('put z1 into z\ndelete char 5 of z\\z', 'abc');
    /* normal ranges */
    b.t('put z1 into z\ndelete char 1 to 1 of z\\z', 'bc');
    b.t('put z1 into z\ndelete char 1 to 2 of z\\z', 'c');
    b.t('put z1 into z\ndelete char 1 to 3 of z\\z', '');
    b.t('put z1 into z\ndelete char 2 to 3 of z\\z', 'a');
    /* recurse */
    b.t('put z1 into z\ndelete char 2 of char 1 to 2 of z\\z', 'ac');
    b.t('put z1 into z\ndelete char 2 to 3 of char 1 to 3 of z\\z', 'a');
    b.t('put z1 into z\ndelete char 2 to 3 of char 2 to 3 of char 1 to 3 of z\\z', 'a');
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_delete_word', () => {
    let b = new ScriptTestBatch();
    /* normal word */
    b.t('global z1\nput "a.b  c.d" & cr & "e" into z1\\1', '1');
    b.t('put z1 into z\ndelete word 1 of z\\z', 'c.d\ne');
    b.t('put z1 into z\ndelete word 2 of z\\z', 'a.b  \ne');
    b.t('put z1 into z\ndelete word 3 of z\\z', 'a.b  c.d\n');
    /* abnormal word */
    b.t('put z1 into z\ndelete word 0 of z\\z', 'a.b  c.d\ne');
    b.t('put z1 into z\ndelete word 4 of z\\z', 'a.b  c.d\ne');
    b.t('put z1 into z\ndelete word 5 of z\\z', 'a.b  c.d\ne');
    /* normal ranges */
    b.t('put z1 into z\ndelete word 1 to 1 of z\\z', 'c.d\ne');
    b.t('put z1 into z\ndelete word 1 to 2 of z\\z', '\ne');
    b.t('put z1 into z\ndelete word 1 to 3 of z\\z', '');
    b.t('put z1 into z\ndelete word 2 to 3 of z\\z', 'a.b');
    /* recurse */
    b.t('put z1 into z\ndelete word 2 of word 1 to 2 of z\\z', 'a.b  \ne');
    b.t('put z1 into z\ndelete word 2 to 3 of word 1 to 3 of z\\z', 'a.b');
    b.t('put z1 into z\ndelete word 2 to 3 of word 2 to 3 of word 1 to 3 of z\\z', 'a.b');
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_delete_line', () => {
    let b = new ScriptTestBatch();
    /* normal line */
    b.t('global z1\nput "ab" & cr & "cd" & cr & "ef" into z1\\1', '1');
    b.t('put z1 into z\ndelete line 1 of z\\z', 'cd\nef');
    b.t('put z1 into z\ndelete line 2 of z\\z', 'ab\nef');
    b.t('put z1 into z\ndelete line 3 of z\\z', 'ab\ncd\n');
    /* abnormal line */
    b.t('put z1 into z\ndelete line 0 of z\\z', 'ab\ncd\nef');
    b.t('put z1 into z\ndelete line 4 of z\\z', 'ab\ncd\nef');
    b.t('put z1 into z\ndelete line 5 of z\\z', 'ab\ncd\nef');
    /* normal ranges */
    b.t('put z1 into z\ndelete line 1 to 1 of z\\z', 'cd\nef');
    b.t('put z1 into z\ndelete line 1 to 2 of z\\z', 'ef');
    b.t('put z1 into z\ndelete line 1 to 3 of z\\z', '');
    b.t('put z1 into z\ndelete line 2 to 3 of z\\z', 'ab\n');
    /* recurse */
    b.t('put z1 into z\ndelete line 2 of line 1 to 2 of z\\z', 'ab\nef');
    b.t('put z1 into z\ndelete line 2 to 3 of line 1 to 3 of z\\z', 'ab\n');
    b.t(
        'put z1 into z\ndelete line 2 to 3 of line 2 to 3 of line 1 to 3 of z\\z',
        'ab\n'
    );
    b.batchEvaluate(h3);
});
t.test('03chunkexpression_delete_item', () => {
    h3.vcstate.model.productOpts.setProductOpt('itemDel', ',');
    let b = new ScriptTestBatch();
    /* normal item */
    b.t('global z1\nput "ab,,cd" into z1\\1', '1');
    b.t('put z1 into z\ndelete item 1 of z\\z', ',cd');
    b.t('put z1 into z\ndelete item 2 of z\\z', 'ab,cd');
    b.t('put z1 into z\ndelete item 3 of z\\z', 'ab,');
    /* abnormal item */
    b.t('put z1 into z\ndelete item 0 of z\\z', 'ab,,cd');
    b.t('put z1 into z\ndelete item 4 of z\\z', 'ab,,cd');
    b.t('put z1 into z\ndelete item 5 of z\\z', 'ab,,cd');
    /* normal ranges */
    b.t('put z1 into z\ndelete item 1 to 1 of z\\z', ',cd');
    b.t('put z1 into z\ndelete item 1 to 2 of z\\z', 'cd');
    b.t('put z1 into z\ndelete item 1 to 3 of z\\z', '');
    b.t('put z1 into z\ndelete item 2 to 3 of z\\z', 'ab');
    /* recurse */
    b.t('put z1 into z\ndelete item 2 of item 1 to 2 of z\\z', 'ab,cd');
    b.t('put z1 into z\ndelete item 2 to 3 of item 1 to 3 of z\\z', 'ab');
    b.t('put z1 into z\ndelete item 2 to 3 of item 2 to 3 of item 1 to 3 of z\\z', 'ab');
    b.batchEvaluate(h3);
});
