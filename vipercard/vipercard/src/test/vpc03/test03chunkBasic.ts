
/* auto */ import { ScriptTestBatch, TestMultiplier } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { h3 } from './test03lexer';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/* all tests here confirmed in emulator -
yes, it's weird that put and delete ignore order.
most tests here, unlike in test03chunk additional,
are redundant with those in the extensive test. */

let t = new SimpleUtil512TestCollection('testCollection03chunkBasic');
export let testCollection03chunkBasic = t;

t.atest('--init--testCollection03chunkBasic', async () => {
    assertTrue(
        h3,
        longstr(`forgot to include the
        _testCollection03lexer_ test? put it below this test in _testTop_.ts`)
    );

    /* go to a cd with at least 2 fields */
    let b = new ScriptTestBatch();
    b.t(`go to cd id ${h3.ids.cdBC}\\1`, '1');
    b.batchEvaluate(h3);

    /* turn on compat mode */
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', true, h3.vcstate.model)
    );
});

t.test('03 chunk groundwork', () => {
    let b = new ScriptTestBatch();
    /* chunk bounds */
    b.t('global z\nput "abcde" into z\\1', '1');
    b.t('char 1 of z', 'a');
    b.t('char (1) of z', 'a');
    b.t('char (1+1) of z', 'b');
    /* var containers */
    b.t('put 1 into x1\\x1', '1');
    b.t('put 1 into x1\\char x1 of z', 'a');
    b.t('put 2 into x1\\char x1 of z', 'b');
    b.t('put 2 into x1\nput 3 into y1\\char x1 to y1 of z', 'bc');
    /* with field (it expects to see cd fld 1 of card "parentCard") */
    b.t('global z\nput 1 into cd fld 1\\char cd fld 1 of z', 'ERR:6:parse err');
    b.t(
        'global z\nput 1 into cd fld 1\\char cd fld 1 of this cd of this stack of z',
        'a'
    );
    b.t('global z\nput 1 into cd fld 1\\char target of z', 'ERR:6:reading text');
    /* with field */
    b.t('put 1 into cd fld 1\\char (cd fld 1) of z', 'a');
    b.t('put 2 into cd fld 1\\char (cd fld 1) of z', 'b');
    b.t('put 2 into cd fld 1\\char (cd fld 1) to 3 of z', 'bc');
    /* non integer bounds */
    b.t('global z\\char 1.5 of z', 'ERR:5:expected an integer');
    b.t('global z\\char 1.2 of z', 'ERR:5:expected an integer');
    b.t('global z\\char 0.001 of z', 'ERR:5:expected an integer');
    b.t('global z\\char "no" of z', 'ERR:5:parse err');
    b.t('global z\nput "no" into x\\char x of z', 'ERR:6:expected an integer');
    b.t('global z\nput -1 into x\\char x of z', 'ERR:6:negative');
    b.t('global z\nput "" into x\\char x of z', 'ERR:6:integer');
    b.t('global z\\char -1 of z', 'ERR:5:parse err');
    b.t('global z\\char 1 to char 2 of z', 'ERR:5:parse err');
    b.t('global z\\char 1 to word 1 of z', 'ERR:5:parse err');
    b.t('global z\\char 1 to 2 to 3 of z', 'ERR:5:parse err');
    /* backwards bounds (more in vpcTestChunkResolution.ts) */
    b.t('item 3 to 1 of ",,cd,"', 'cd');
    b.t('word 2 to 1 of "  abc  .def gh.i   "', '.def');
    b.t('char 1 to 0 of "abc"', '');
    /* we only allow backwards ranges if non-recursive and not a delete
    (i.e. those covered by vpcTestChunkResolution.ts) */
    b.t('global z\\char 3 to 2 of line 2 of z', 'ERR:5:backwards');
    b.t('global z\\item 3 to 2 of line 2 of z', 'ERR:5:backwards');
    b.t('global z\\line 3 to 2 of line 2 of z', 'ERR:5:backwards');
    b.t('global z\\word 3 to 2 of line 2 of z', 'ERR:5:backwards');
    b.t('global z\\line 2 of char 3 to 2 of z', 'ERR:5:backwards');
    b.t('global z\\line 2 of item 3 to 2 of z', 'ERR:5:backwards');
    b.t('global z\\line 2 of line 3 to 2 of z', 'ERR:5:backwards');
    b.t('global z\\line 2 of word 3 to 2 of z', 'ERR:5:backwards');
    b.t('global z\nput "A" into char 3 to 2 of line 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\nput "A" into item 3 to 2 of line 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\nput "A" into line 3 to 2 of line 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\nput "A" into word 3 to 2 of line 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\nput "A" into line 2 of char 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\nput "A" into line 2 of item 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\nput "A" into line 2 of line 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\nput "A" into line 2 of word 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete line 2 of char 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete line 2 of item 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete line 2 of line 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete line 2 of word 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete char 3 to 2 of line 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete item 3 to 2 of line 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete line 3 to 2 of line 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete word 3 to 2 of line 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete char 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete item 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete line 3 to 2 of z\\1', 'ERR:5:backwards');
    b.t('global z\ndelete word 3 to 2 of z\\1', 'ERR:5:backwards');
    /* ordinal bounds */
    b.t('first char of z', 'a');
    b.t('third char of z', 'c');
    b.t('last char of z', 'e');
    b.t('tenth char of z', '');
    b.t('global z\\char 1 to fifth char of z', 'ERR:5:parse err');
    /* ordinal puts */
    b.t('global z1\nput "abc" into z1\\1', '1');
    b.t('put z1 into z\nput "AA" into char 1 of z\\z', 'AAbc');
    b.t('put z1 into z\nput "AA" into char 2 of z\\z', 'aAAc');
    b.t('put z1 into z\nput "AA" into char 10 of z\\z', 'abcAA');
    b.t('put z1 into z\nput "AA" into first char of z\\z', 'AAbc');
    b.t('put z1 into z\nput "AA" into third char of z\\z', 'abAA');
    b.t('put z1 into z\nput "AA" into last char of z\\z', 'abAA');
    b.t('put z1 into z\nput "AA" into tenth char of z\\z', 'abcAA');
    b.t(
        'global z1\nput z1 into z\nput "AA" into char 1 to fifth char of z\\z',
        'ERR:6:parse err'
    );
    /* ordinal puts item */
    b.t('global z1\nput "ab,cd,ef" into z1\\1', '1');
    b.t('put z1 into z\nput "AA" into item 1 of z\\z', 'AA,cd,ef');
    b.t('put z1 into z\nput "AA" into item 2 of z\\z', 'ab,AA,ef');
    b.t('put z1 into z\nput "AA" into item 5 of z\\z', 'ab,cd,ef,,AA');
    b.t('put z1 into z\nput "AA" into first item of z\\z', 'AA,cd,ef');
    b.t('put z1 into z\nput "AA" into third item of z\\z', 'ab,cd,AA');
    b.t('put z1 into z\nput "AA" into last item of z\\z', 'ab,cd,AA');
    b.t('put z1 into z\nput "AA" into fifth item of z\\z', 'ab,cd,ef,,AA');
    b.t(
        'global z1\nput z1 into z\nput "AA" into item 1 to fifth item of z\\z',
        'ERR:6:parse err'
    );

    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});

/**
 * count number
 */
t.test('03countnumber', () => {
    let b = new ScriptTestBatch();
    b.t('the number of chars in ""', '0');
    b.t('the number of chars in "a"', '1');
    b.t('the number of chars in "   "', '3');
    b.t('the number of chars in cr', '1');
    b.t('the number of chars in " "&cr&" "', '3');
    b.t(
        'the number of chars in "ab cd, ef"&cr&"gh ii,jj,kk"&cr&"mn,op,q"&cr&"r,s"',
        '33'
    );
    b.t(
        longstr(`the number of chars in " ab"&cr&"cd,ef"&cr&""&cr&"gh"&cr&"ij"&
         cr&"kl"&cr&"mn,op"&cr&"qr"&cr&"st,uv,wx"&cr&"01 23"&cr&"45 "&cr&
         "67 89,/."&cr&"#$,;: &*,(),-="&cr&"~+, <>"&cr&"[],{}"`),
        '84'
    );
    b.t('the number of items in ""', '0');
    b.t('the number of items in "a"', '1');
    b.t('the number of items in "   "', '0');
    b.t('the number of items in cr', '0');
    b.t('the number of items in " "&cr&" "', '0');
    b.t('the number of items in "ab cd, ef"&cr&"gh ii,jj,kk"&cr&"mn,op,q"&cr&"r,s"', '7');
    b.t(
        longstr(`the number of items in " ab"&cr&"cd,ef"&cr&""&cr&"gh"&cr&"ij"&cr&
         "kl"&cr&"mn,op"&cr&"qr"&cr&"st,uv,wx"&cr&"01 23"&cr&"45 "&cr&"67 89,/."&
         cr&"#$,;: &*,(),-="&cr&"~+, <>"&cr&"[],{}"`),
        '11'
    );
    b.t('the number of lines in ""', '0');
    b.t('the number of lines in "a"', '1');
    b.t('the number of lines in "   "', '1');
    b.t('the number of lines in cr', '1');
    b.t('the number of lines in " "&cr&" "', '2');
    b.t('the number of lines in "ab cd, ef"&cr&"gh ii,jj,kk"&cr&"mn,op,q"&cr&"r,s"', '4');
    b.t(
        longstr(`the number of lines in " ab"&cr&"cd,ef"&cr&""&cr&"gh"&cr&"ij"&cr&
         "kl"&cr&"mn,op"&cr&"qr"&cr&"st,uv,wx"&cr&"01 23"&cr&"45 "&cr&"67 89,/."&
         cr&"#$,;: &*,(),-="&cr&"~+, <>"&cr&"[],{}"`),
        '15'
    );
    b.t('the number of words in ""', '0');
    b.t('the number of words in "a"', '1');
    b.t('the number of words in "   "', '0');
    b.t('the number of words in cr', '0');
    b.t('the number of words in " "&cr&" "', '0');
    b.t('the number of words in "ab cd, ef"&cr&"gh ii,jj,kk"&cr&"mn,op,q"&cr&"r,s"', '7');
    b.t(
        longstr(`the number of words in " ab"&cr&"cd,ef"&cr&""&cr&"gh"&cr&"ij"&
         cr&"kl"&cr&"mn,op"&cr&"qr"&cr&"st,uv,wx"&cr&"01 23"&cr&"45 "&
         cr&"67 89,/."&cr&"#$,;: &*,(),-="&cr&"~+, <>"&cr&"[],{}"`),
        '18'
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});

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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.t(
        'global z1\nput z1 into z\ndelete word 1 to 2 of z\\z',
        'ERR:6:deleting ranges' /* '\ne' */
    );
    b.t(
        'global z1\nput z1 into z\ndelete word 1 to 3 of z\\z',
        'ERR:6:deleting ranges' /* '' */
    );
    b.t(
        'global z1\nput z1 into z\ndelete word 2 to 3 of z\\z',
        'ERR:6:deleting ranges' /* 'a.b' */
    );
    /* recurse */
    b.t('put z1 into z\ndelete word 2 of word 1 to 2 of z\\z', 'a.b  \ne');
    b.t(
        'global z1\nput z1 into z\ndelete word 2 to 3 of word 1 to 3 of z\\z',
        'ERR:6:deleting ranges' /* 'a.b' */
    );
    b.t(
        'global z1\nput z1 into z\ndelete word 2 to 3 of word 2 to 3 of word 1 to 3 of z\\z',
        'ERR:6:deleting ranges' /* 'a.b' */
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.t(
        'global z1\nput z1 into z\ndelete line 1 to 2 of z\\z',
        'ERR:6:deleting ranges' /* 'ef' */
    );
    b.t(
        'global z1\nput z1 into z\ndelete line 1 to 3 of z\\z',
        'ERR:6:deleting ranges' /* '' */
    );
    b.t(
        'global z1\nput z1 into z\ndelete line 2 to 3 of z\\z',
        'ERR:6:deleting ranges' /* 'ab\n' */
    );
    /* recurse */
    b.t('global z1\nput z1 into z\ndelete line 2 of line 1 to 2 of z\\z', 'ab\nef');
    b.t(
        'global z1\nput z1 into z\ndelete line 2 to 3 of line 1 to 3 of z\\z',
        'ERR:6:deleting ranges' /* 'ab\n' */
    );
    b.t(
        'global z1\nput z1 into z\ndelete line 2 to 3 of line 2 to 3 of line 1 to 3 of z\\z',
        'ERR:6:deleting ranges' /* 'ab\n' */
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
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
    b.t(
        'global z1\nput z1 into z\ndelete item 1 to 2 of z\\z',
        'ERR:6:deleting ranges' /* 'cd' */
    );
    b.t(
        'global z1\nput z1 into z\ndelete item 1 to 3 of z\\z',
        'ERR:6:deleting ranges' /* '' */
    );
    b.t(
        'global z1\nput z1 into z\ndelete item 2 to 3 of z\\z',
        'ERR:6:deleting ranges' /* 'ab' */
    );
    /* recurse */
    b.t('put z1 into z\ndelete item 2 of item 1 to 2 of z\\z', 'ab,cd');
    b.t(
        'global z1\nput z1 into z\ndelete item 2 to 3 of item 1 to 3 of z\\z',
        'ERR:6:deleting ranges' /* 'ab' */
    );
    b.t(
        'global z1\nput z1 into z\ndelete item 2 to 3 of item 2 to 3 of item 1 to 3 of z\\z',
        'ERR:6:deleting ranges' /* 'ab' */
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});

t.test('03chunkexpression_additional delete tests', () => {
    let b = new ScriptTestBatch();
    /* normal word */
    b.t('global z1\nput "a b c" into z1\\1', '1');
    b.t('put z1 into z\ndelete word 0 of z\\z', 'a b c');
    b.t('put z1 into z\ndelete word 1 of z\\z', 'b c');
    b.t('put z1 into z\ndelete word 2 of z\\z', 'a c');
    b.t('put z1 into z\ndelete word 3 of z\\z', 'a b');
    b.t('put z1 into z\ndelete word 4 of z\\z', 'a b c');
    b.t('put z1 into z\ndelete word 5 of z\\z', 'a b c');
    /* normal word 2 */
    b.t('global z1\nput " a b c " into z1\\1', '1');
    b.t('put z1 into z\ndelete word 0 of z\\z', 'a b c ');
    b.t('put z1 into z\ndelete word 1 of z\\z', ' b c ');
    b.t('put z1 into z\ndelete word 2 of z\\z', ' a c ');
    b.t('put z1 into z\ndelete word 3 of z\\z', ' a b');
    b.t('put z1 into z\ndelete word 4 of z\\z', ' a b c');
    b.t('put z1 into z\ndelete word 5 of z\\z', ' a b c');
    b.t('put z1 into z\ndelete word 6 of z\\z', ' a b c');
    /* normal item */
    b.t('global z1\nput "a,b,c" into z1\\1', '1');
    b.t('put z1 into z\ndelete item 0 of z\\z', 'a,b,c');
    b.t('put z1 into z\ndelete item 1 of z\\z', 'b,c');
    b.t('put z1 into z\ndelete item 2 of z\\z', 'a,c');
    b.t('put z1 into z\ndelete item 3 of z\\z', 'a,b');
    b.t('put z1 into z\ndelete item 4 of z\\z', 'a,b,c');
    b.t('put z1 into z\ndelete item 5 of z\\z', 'a,b,c');
    b.t('put z1 into z\ndelete item 6 of z\\z', 'a,b,c');
    /* normal item 2 */
    b.t('global z1\nput ",a,b,c," into z1\\1', '1');
    b.t('put z1 into z\ndelete item 0 of z\\z', 'a,b,c,');
    b.t('put z1 into z\ndelete item 1 of z\\z', 'a,b,c,');
    b.t('put z1 into z\ndelete item 2 of z\\z', ',b,c,');
    b.t('put z1 into z\ndelete item 3 of z\\z', ',a,c,');
    b.t('put z1 into z\ndelete item 4 of z\\z', ',a,b,');
    b.t('put z1 into z\ndelete item 5 of z\\z', ',a,b,c');
    b.t('put z1 into z\ndelete item 6 of z\\z', ',a,b,c,');
    b.t('put z1 into z\ndelete item 7 of z\\z', ',a,b,c,');
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});

/**
 * put one char before
 */
t.test('03chunkexpression_put_one_char_before', () => {
    let b = new ScriptTestBatch();
    /* normal char */
    b.t('global z1\nput "abc" into z1\\1', '1');
    b.t('put z1 into z\nput "A" before char 1 of z\\z', 'Aabc');
    b.t('put z1 into z\nput "A" before char 2 of z\\z', 'aAbc');
    b.t('put z1 into z\nput "A" before char 3 of z\\z', 'abAc');
    /* abnormal char */
    b.t('put z1 into z\nput "A" before char 0 of z\\z', 'Aabc');
    b.t('put z1 into z\nput "A" before char 4 of z\\z', 'abcA');
    b.t('put z1 into z\nput "A" before char 5 of z\\z', 'abcA');
    /* normal ranges */
    b.t('put z1 into z\nput "A" before char 1 to 1 of z\\z', 'Aabc');
    b.t('put z1 into z\nput "A" before char 1 to 2 of z\\z', 'Aabc');
    b.t('put z1 into z\nput "A" before char 1 to 3 of z\\z', 'Aabc');
    b.t('put z1 into z\nput "A" before char 2 to 3 of z\\z', 'aAbc');
    /* recurse */
    b.t('put z1 into z\nput "A" before char 2 of char 1 to 2 of z\\z', 'aAbc');
    b.t('put z1 into z\nput "A" before char 2 to 3 of char 1 to 3 of z\\z', 'aAbc');
    b.t(
        'put z1 into z\nput "A" before char 2 to 3 of char 2 to 3 of char 1 to 3 of z\\z',
        'aAbc'
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});
t.test('03chunkexpression_put_one_word_before', () => {
    let b = new ScriptTestBatch();
    /* normal word */
    b.t('global z1\nput "a.b  c.d" & cr & "e" into z1\\1', '1');
    b.t('put z1 into z\nput "A" before word 1 of z\\z', 'Aa.b  c.d\ne');
    b.t('put z1 into z\nput "A" before word 2 of z\\z', 'a.b  Ac.d\ne');
    b.t('put z1 into z\nput "A" before word 3 of z\\z', 'a.b  c.d\nAe');
    /* abnormal word */
    b.t('put z1 into z\nput "A" before word 0 of z\\z', 'Aa.b  c.d\ne');
    b.t('put z1 into z\nput "A" before word 4 of z\\z', 'a.b  c.d\neA');
    b.t('put z1 into z\nput "A" before word 5 of z\\z', 'a.b  c.d\neA');
    /* normal ranges */
    b.t('put z1 into z\nput "A" before word 1 to 1 of z\\z', 'Aa.b  c.d\ne');
    b.t('put z1 into z\nput "A" before word 1 to 2 of z\\z', 'Aa.b  c.d\ne');
    b.t('put z1 into z\nput "A" before word 1 to 3 of z\\z', 'Aa.b  c.d\ne');
    b.t('put z1 into z\nput "A" before word 2 to 3 of z\\z', 'a.b  Ac.d\ne');
    /* recurse */
    b.t('put z1 into z\nput "A" before word 2 of word 1 to 2 of z\\z', 'a.b  Ac.d\ne');
    b.t(
        'put z1 into z\nput "A" before word 2 to 3 of word 1 to 3 of z\\z',
        'a.b  Ac.d\ne'
    );
    b.t(
        'put z1 into z\nput "A" before word 2 to 3 of word 2 to 3 of word 1 to 3 of z\\z',
        'a.b  Ac.d\ne'
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});
t.test('03chunkexpression_put_one_item_before', () => {
    h3.vcstate.model.productOpts.setProductOpt('itemDel', ',');
    let b = new ScriptTestBatch();
    /* normal item */
    b.t('global z1\nput "ab,,cd" into z1\\1', '1');
    b.t('put z1 into z\nput "A" before item 1 of z\\z', 'Aab,,cd');
    b.t('put z1 into z\nput "A" before item 2 of z\\z', 'ab,A,cd');
    b.t('put z1 into z\nput "A" before item 3 of z\\z', 'ab,,Acd');
    /* abnormal item */
    b.t('put z1 into z\nput "A" before item 0 of z\\z', 'Aab,,cd');
    b.t('put z1 into z\nput "A" before item 4 of z\\z', 'ab,,cd,A');
    b.t('put z1 into z\nput "A" before item 5 of z\\z', 'ab,,cd,,A');
    /* normal ranges */
    b.t('put z1 into z\nput "A" before item 1 to 1 of z\\z', 'Aab,,cd');
    b.t('put z1 into z\nput "A" before item 1 to 2 of z\\z', 'Aab,,cd');
    b.t('put z1 into z\nput "A" before item 1 to 3 of z\\z', 'Aab,,cd');
    b.t('put z1 into z\nput "A" before item 2 to 3 of z\\z', 'ab,A,cd');
    /* recurse */
    b.t('put z1 into z\nput "A" before item 2 of item 1 to 2 of z\\z', 'ab,A,cd');
    b.t('put z1 into z\nput "A" before item 2 to 3 of item 1 to 3 of z\\z', 'ab,A,cd');
    b.t(
        'put z1 into z\nput "A" before item 2 to 3 of item 2 to 3 of item 1 to 3 of z\\z',
        'ab,A,cd'
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});

/**
 * put one char after
 */
t.test('03chunkexpression_put_one_char_after', () => {
    let b = new ScriptTestBatch();
    /* normal char */
    b.t('global z1\nput "abc" into z1\\1', '1');
    b.t('put z1 into z\nput "A" after char 1 of z\\z', 'aAbc');
    b.t('put z1 into z\nput "A" after char 2 of z\\z', 'abAc');
    b.t('put z1 into z\nput "A" after char 3 of z\\z', 'abcA');
    /* abnormal char */
    b.t('put z1 into z\nput "A" after char 0 of z\\z', 'Aabc');
    b.t('put z1 into z\nput "A" after char 4 of z\\z', 'abcA');
    b.t('put z1 into z\nput "A" after char 5 of z\\z', 'abcA');
    /* normal ranges */
    b.t('put z1 into z\nput "A" after char 1 to 1 of z\\z', 'aAbc');
    b.t('put z1 into z\nput "A" after char 1 to 2 of z\\z', 'abAc');
    b.t('put z1 into z\nput "A" after char 1 to 3 of z\\z', 'abcA');
    b.t('put z1 into z\nput "A" after char 2 to 3 of z\\z', 'abcA');
    /* recurse */
    b.t('put z1 into z\nput "A" after char 2 of char 1 to 2 of z\\z', 'abAc');
    b.t('put z1 into z\nput "A" after char 2 to 3 of char 1 to 3 of z\\z', 'abcA');
    b.t(
        'put z1 into z\nput "A" after char 2 to 3 of char 2 to 3 of char 1 to 3 of z\\z',
        'abcA'
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});
t.test('03chunkexpression_put_one_word_after', () => {
    let b = new ScriptTestBatch();
    /* normal word */
    b.t('global z1\nput "a.b  c.d" & cr & "e" into z1\\1', '1');
    b.t('put z1 into z\nput "A" after word 1 of z\\z', 'a.bA  c.d\ne');
    b.t('put z1 into z\nput "A" after word 2 of z\\z', 'a.b  c.dA\ne');
    b.t('put z1 into z\nput "A" after word 3 of z\\z', 'a.b  c.d\neA');
    /* abnormal word */
    b.t('put z1 into z\nput "A" after word 0 of z\\z', 'Aa.b  c.d\ne');
    b.t('put z1 into z\nput "A" after word 4 of z\\z', 'a.b  c.d\neA');
    b.t('put z1 into z\nput "A" after word 5 of z\\z', 'a.b  c.d\neA');
    /* normal ranges */
    b.t('put z1 into z\nput "A" after word 1 to 1 of z\\z', 'a.bA  c.d\ne');
    b.t('put z1 into z\nput "A" after word 1 to 2 of z\\z', 'a.b  c.dA\ne');
    b.t('put z1 into z\nput "A" after word 1 to 3 of z\\z', 'a.b  c.d\neA');
    b.t('put z1 into z\nput "A" after word 2 to 3 of z\\z', 'a.b  c.d\neA');
    /* recurse */
    b.t('put z1 into z\nput "A" after word 2 of word 1 to 2 of z\\z', 'a.b  c.dA\ne');
    b.t(
        'put z1 into z\nput "A" after word 2 to 3 of word 1 to 3 of z\\z',
        'a.b  c.d\neA'
    );
    b.t(
        'put z1 into z\nput "A" after word 2 to 3 of word 2 to 3 of word 1 to 3 of z\\z',
        'a.b  c.d\neA'
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});
t.test('03chunkexpression_put_one_item_after', () => {
    h3.vcstate.model.productOpts.setProductOpt('itemDel', ',');
    let b = new ScriptTestBatch();
    /* normal item */
    b.t('global z1\nput "ab,,cd" into z1\\1', '1');
    b.t('put z1 into z\nput "A" after item 1 of z\\z', 'abA,,cd');
    b.t('put z1 into z\nput "A" after item 2 of z\\z', 'ab,A,cd');
    b.t('put z1 into z\nput "A" after item 3 of z\\z', 'ab,,cdA');
    /* abnormal item */
    b.t('put z1 into z\nput "A" after item 0 of z\\z', 'Aab,,cd');
    b.t('put z1 into z\nput "A" after item 4 of z\\z', 'ab,,cd,A');
    b.t('put z1 into z\nput "A" after item 5 of z\\z', 'ab,,cd,,A');
    /* normal ranges */
    b.t('put z1 into z\nput "A" after item 1 to 1 of z\\z', 'abA,,cd');
    b.t('put z1 into z\nput "A" after item 1 to 2 of z\\z', 'ab,A,cd');
    b.t('put z1 into z\nput "A" after item 1 to 3 of z\\z', 'ab,,cdA');
    b.t('put z1 into z\nput "A" after item 2 to 3 of z\\z', 'ab,,cdA');
    /* recurse */
    b.t('put z1 into z\nput "A" after item 2 of item 1 to 2 of z\\z', 'ab,A,cd');
    b.t('put z1 into z\nput "A" after item 2 to 3 of item 1 to 3 of z\\z', 'ab,,cdA');
    b.t(
        'put z1 into z\nput "A" after item 2 to 3 of item 2 to 3 of item 1 to 3 of z\\z',
        'ab,,cdA'
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});

/**
 * replays the test in a field
 */
export class EvaluateWithVarAndFld extends TestMultiplier {
    secondTransformation(code: string, expected: string): O<[string, string]> {
        return [this.doReplace(code), this.doReplace(expected)];
    }
    protected doReplace(s: string) {
        s = s.replace(/\bglobal z\b/g, '');
        s = s.replace(/\b z\b/g, ' cd fld 2');
        s = s.replace(/\b\\z\b/g, '\\cd fld 2');
        return s;
    }
}

t.test('03chunkbasic turn off compat mode', () => {
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', false, h3.vcstate.model)
    );
});
