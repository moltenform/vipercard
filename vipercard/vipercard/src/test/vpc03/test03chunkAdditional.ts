
/* auto */ import { ScriptTestBatch, TestMultiplier } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { assertWarnEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { h3 } from './test03lexer';
/* auto */ import { EvaluateWithVarAndFld } from './test03chunkBasic';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/* all tests here confirmed in emulator -
yes, it's weird that put and delete ignore order.
most tests here, unlike in test03chunk additional,
are not covered in the extensive test. */

let t = new SimpleUtil512TestCollection('testCollection03chunkAdditional');
export let testCollection03chunkAdditional = t;

t.atest('--init--testCollection03chunkAdditional', async () => {
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

/*
    what's not covered by the extensive tests:
        put "" into item 2 to 4 of z
        put "A" into item 2 to 4 of z
        set the textstyle of item 2 to 4 of cd fld 1 to bold
        put "ABCDE" into item 2 to 4 of cd fld 1
        ensure disallow going backwards in granularity scope order
        before/after
        math ops
*/

t.test('03chunkexpression_set_textstyle', () => {
    h3.vcstate.model.productOpts.setProductOpt('itemDel', ',');
    let helperCode = `
on resetStyle
    put "ab,,cd" into cd fld 1
    set the textstyle of cd fld 1 to plain
end resetStyle
function getBoldChars
    put cd fld 1 into unformatted
    if unformatted != "ab,,cd" then
        causeErrBecauseStringDoesNotMatch
        return 0
    end if
    put "" into ret
    repeat with x = 1 to the number of chars in cd fld 1
        if the textstyle of char x of cd fld 1 is bold then
            put char x of cd fld 1 after ret
        end if
    end repeat
    return ret
end getBoldChars
    `;
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('script', helperCode, h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    /* go to a cd with a field */
    b.t(`go to cd id ${h3.ids.cdBC}\\1`, '1');
    /* normal item */
    b.t(
        'resetStyle\nset the textstyle of item 1 of cd fld 1 to bold\\getBoldChars()',
        'ab'
    );
    b.t(
        'resetStyle\nset the textstyle of item 2 of cd fld 1 to bold\\getBoldChars()',
        ''
    );
    b.t(
        'resetStyle\nset the textstyle of item 3 of cd fld 1 to bold\\getBoldChars()',
        'cd'
    );
    /* abnormal item */
    b.t(
        'resetStyle\nset the textstyle of item 0 of cd fld 1 to bold\\getBoldChars()',
        ''
    );
    b.t(
        'resetStyle\nset the textstyle of item 4 of cd fld 1 to bold\\getBoldChars()',
        ''
    );
    b.t(
        'resetStyle\nset the textstyle of item 5 of cd fld 1 to bold\\getBoldChars()',
        ''
    );
    /* normal ranges */
    b.t(
        'resetStyle\nset the textstyle of item 1 to 1 of cd fld 1 to bold\\getBoldChars()',
        'ab'
    );
    b.t(
        'resetStyle\nset the textstyle of item 1 to 2 of cd fld 1 to bold\\getBoldChars()',
        'ab,'
    );
    b.t(
        'resetStyle\nset the textstyle of item 1 to 3 of cd fld 1 to bold\\getBoldChars()',
        'ab,,cd'
    );
    b.t(
        'resetStyle\nset the textstyle of item 2 to 3 of cd fld 1 to bold\\getBoldChars()',
        ',cd'
    );
    /* recurse */
    b.t(
        longstr(`resetStyle{{NEWLINE}}set the textstyle of item 2 of item 1 to 2
         of cd fld 1 to bold\\getBoldChars()`),
        ''
    );
    b.t(
        longstr(`resetStyle{{NEWLINE}}set the textstyle of item 2 to 3
         of item 1 to 3 of cd fld 1 to bold\\getBoldChars()`),
        ',cd'
    );
    b.t(
        longstr(
            `resetStyle{{NEWLINE}}set the textstyle of item 2 to 3
         of item 2 to 3 of item 1 to 3 of cd fld 1 to bold\\getBoldChars()`
        ),
        'cd'
    );
    /* reset fld */
    b.t('put "" into cd fld 1\\1', '1');
    b.batchEvaluate(h3);
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('script', '', h3.vcstate.model)
    );
});

t.test('03chunkexpression_recursivescopes', () => {
    /*
        test here:
        char->char->item
        char->char->word
        char->word->word
        char->item->line
        char->line->item
        line->item->line
        item->line->item
    */
    /* scopes that should not work */
    let b = new ScriptTestBatch();
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', false, h3.vcstate.model)
    );
    /* put, nothing after a char */
    b.t('global z1\nput "a.b  c.d" & cr & "e" into z1\\1', '1');
    b.t(
        'global z1\nput z1 into z\nput "A" into item 1 of char 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into word 1 of char 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into line 1 of char 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into item 1 of char 1 of char 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into word 1 of char 1 of char 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into line 1 of char 1 of char 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    /* put, nothing after a word except char */
    b.t(
        'global z1\nput z1 into z\nput "A" into item 1 of word 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into line 1 of word 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into item 1 of word 1 of word 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into line 1 of word 1 of word 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into item 1 of word 1 of char 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into line 1 of word 1 of char 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    /* can't double up */
    b.t(
        'global z1\nput z1 into z\nput "A" into line 1 of line 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into line 2 of line 2 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into line 1 to 2 of line 2 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into line 1 of line 2 to 3 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into line 1 to 2 of line 2 to 3 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into item 1 of item 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into item 2 of item 2 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into item 1 to 2 of item 2 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into item 1 of item 2 to 3 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into item 1 to 2 of item 2 to 3 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into word 1 of word 1 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into word 2 of word 2 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into word 1 to 2 of word 2 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into word 1 of word 2 to 3 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.t(
        'global z1\nput z1 into z\nput "A" into word 1 to 2 of word 2 to 3 of z\\z',
        'ERR:6:compatibility mode'
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
    b = new ScriptTestBatch();
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', true, h3.vcstate.model)
    );
    /* negatives should throw */
    b.t('char (-1) of "abc"', 'ERR:negative');
    b.t('char (-1) to 1 of "abc"', 'ERR:negative');
    b.t('char 1 to (-1) of "abc"', 'ERR:negative');
    b.t('word (-1) of "abc"', 'ERR:negative');
    b.t('word (-1) to 1 of "abc"', 'ERR:negative');
    b.t('word 1 to (-1) of "abc"', 'ERR:negative');
    b.t('item (-1) of "abc"', 'ERR:negative');
    b.t('item (-1) to 1 of "abc"', 'ERR:negative');
    b.t('item 1 to (-1) of "abc"', 'ERR:negative');
    b.t('line (-1) of "abc"', 'ERR:negative');
    b.t('line (-1) to 1 of "abc"', 'ERR:negative');
    b.t('line 1 to (-1) of "abc"', 'ERR:negative');
    /* transform the above into "put" */
    class MakePutCmd extends TestMultiplier {
        secondTransformation(code: string, expected: string): O<[string, string]> {
            code = 'global z\nput "A" into ' + code.replace(/"abc"/, 'z\\1');
            expected = expected.replace(/ERR:/, 'ERR:5:');
            return [code, expected];
        }
    }
    b.batchEvaluate(h3, [MakePutCmd, EvaluateWithVarAndFld]);
    b = new ScriptTestBatch();
    b.t(
        'global z\nput "ab cd, ef"&cr&"gh ii,jj,kk"&cr&"mn,op,q"&cr&"r,s" into z1\\1',
        '1'
    );
    /* get scopes */
    b.t('char 2 of char 2 of z1', '');
    b.t('char 2 of word 2 of z1', 'd');
    b.t('char 2 of item 2 of z1', 'e');
    b.t('char 2 of line 2 of z1', 'h');
    b.t('word 2 of char 2 of z1', '');
    b.t('word 2 of word 2 of z1', '');
    b.t('word 2 of item 2 of z1', 'gh');
    b.t('word 2 of line 2 of z1', 'ii,jj,kk');
    b.t('item 2 of char 2 of z1', '');
    b.t('item 2 of word 2 of z1', '');
    b.t('item 2 of item 2 of z1', '');
    b.t('item 2 of line 2 of z1', 'jj');
    b.t('line 2 of char 2 of z1', '');
    b.t('line 2 of word 2 of z1', '');
    b.t('line 2 of item 2 of z1', 'gh ii');
    b.t('line 2 of line 2 of z1', '');
    b.t('char 2 of char 3 of z1', '');
    b.t('word 2 of word 3 of z1', '');
    b.t('item 2 of item 3 of z1', '');
    b.t('line 2 of line 3 of z1', '');
    b.t('char 3 of char 2 of z1', '');
    b.t('word 3 of word 2 of z1', '');
    b.t('item 3 of item 2 of z1', '');
    b.t('line 3 of line 2 of z1', '');
    /* set scopes */
    b.t(
        'put z1 into z\nput "A" into char 2 of char 2 of z\\z',
        'aA cd, ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 of word 2 of z\\z',
        'ab cA, ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 of item 2 of z\\z',
        'ab cd, Af\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 of line 2 of z\\z',
        'ab cd, ef\ngA ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into word 2 of char 2 of z\\z',
        'ab cA, ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into word 2 of word 2 of z\\z',
        'ab A ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into word 2 of item 2 of z\\z',
        'ab cd, ef\nA ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into word 2 of line 2 of z\\z',
        'ab cd, ef\ngh A\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into item 2 of char 2 of z\\z',
        'ab cd, Af\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into item 2 of word 2 of z\\z',
        'ab cd, ef\nA ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into item 2 of item 2 of z\\z',
        'ab cd,A,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into item 2 of line 2 of z\\z',
        'ab cd, ef\ngh ii,A,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into line 2 of char 2 of z\\z',
        'ab cd, ef\ngA ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into line 2 of word 2 of z\\z',
        'ab cd, ef\ngh A\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into line 2 of item 2 of z\\z',
        'ab cd, ef\ngh ii,A,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into line 2 of line 2 of z\\z',
        'ab cd, ef\nA\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 of char 3 of z\\z',
        'aA cd, ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into word 2 of word 3 of z\\z',
        'ab A ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into item 2 of item 3 of z\\z',
        'ab cd,A,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into line 2 of line 3 of z\\z',
        'ab cd, ef\nA\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 3 of char 2 of z\\z',
        'abAcd, ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into word 3 of word 2 of z\\z',
        'ab cd, A\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into item 3 of item 2 of z\\z',
        'ab cd, ef\ngh ii,A,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into line 3 of line 2 of z\\z',
        'ab cd, ef\ngh ii,jj,kk\nA\nr,s'
    );
    /* get complicated scopes */
    /* for get, it's as expected. can add parens, happens in logical order */
    b.t('char 2 of char 4 of item 2 of z1', '');
    b.t('char 2 of char 4 of word 2 of z1', '');
    b.t('char 2 of word 2 of word 4 of z1', '');
    b.t('char 2 of item 2 of line 2 of z1', 'j');
    b.t('char 2 of line 2 of item 2 of z1', 'h');
    b.t('line 2 of item 2 of line 2 of z1', '');
    b.t('item 2 of line 2 of item 2 of z1', '');
    b.t('char 2 to 3 of char 4 to 7 of item 2 to 3 of z1', 'gh');
    b.t('char 2 to 3 of char 4 to 7 of word 2 to 3 of z1', 'ef');
    b.t('char 2 to 3 of word 2 to 3 of word 4 to 7 of z1', 'i,');
    b.t('char 2 to 3 of item 2 to 3 of line 2 to 3 of z1', 'j,');
    b.t('char 2 to 3 of line 2 to 3 of item 2 to 3 of z1', 'h ');
    b.t('line 2 to 3 of item 2 to 5 of line 2 to 3 of z1', 'mn,op,q');
    b.t('item 2 to 3 of line 2 to 3 of item 2 to 5 of z1', 'jj,kk\nmn');
    /* set complicated scopes */
    /* for set, it's NOT as expected. */
    b.t(
        'put z1 into z\nput "A" into char 2 of char 4 of item 2 of z\\z',
        'ab cd, Af\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 of char 4 of word 2 of z\\z',
        'ab cA, ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 of word 2 of word 4 of z\\z',
        'ab cA, ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 of item 2 of line 2 of z\\z',
        'ab cd, ef\ngh ii,jA,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 of line 2 of item 2 of z\\z',
        'ab cd, ef\ngh ii,jA,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into line 2 of item 2 of line 2 of z\\z',
        'ab cd, ef\ngh ii,A,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into item 2 of line 2 of item 2 of z\\z',
        'ab cd, ef\ngh ii,A,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 to 3 of char 4 to 7 of item 2 to 3 of z\\z',
        'ab cd, A\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 to 3 of char 4 to 7 of word 2 to 3 of z\\z',
        'ab cA ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 to 3 of word 2 to 3 of word 4 to 7 of z\\z',
        'ab cA ef\ngh ii,jj,kk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 to 3 of item 2 to 3 of line 2 to 3 of z\\z',
        'ab cd, ef\ngh ii,jAkk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into char 2 to 3 of line 2 to 3 of item 2 to 3 of z\\z',
        'ab cd, ef\ngh ii,jAkk\nmn,op,q\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into line 2 to 3 of item 2 to 5 of line 2 to 3 of z\\z',
        'ab cd, ef\ngh ii,A\nr,s'
    );
    b.t(
        'put z1 into z\nput "A" into item 2 to 3 of line 2 to 3 of item 2 to 5 of z\\z',
        'ab cd, ef\ngh ii,A,op,q\nr,s'
    );
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});

t.test('03chunkexpression_ordinal recursive', () => {
    let b = new ScriptTestBatch();
    b.t(
        'global z1\nput "a,b"&cr&"cd,ef"&cr&"g,h"&cr&"ij"&cr&"kl"&cr&"mn,op"&cr&"qr" into z1\\1',
        '1'
    );
    b.t('second line of second item of z1', 'cd');
    b.t(
        'put z1 into z\nput "A" into second line of second item of z\\z',
        'a,b\ncd,A\ng,h\nij\nkl\nmn,op\nqr'
    );
    b.t(
        'put z1 into z\ndelete second line of second item of z\\z',
        'a,b\ncd\ng,h\nij\nkl\nmn,op\nqr'
    );
    b.t('last line of last item of z1', 'qr');
    b.t(
        'put z1 into z\nput "A" into last line of last item of z\\z',
        'a,b\ncd,ef\ng,h\nij\nkl\nmn,op\nA'
    );
    b.t(
        'put z1 into z\ndelete last line of last item of z\\z',
        'a,b\ncd,ef\ng,h\nij\nkl\nmn,op'
    );
    b.t('second char of second item of z1', '\n');
    b.t(
        'put z1 into z\nput "A" into second char of second item of z\\z',
        'a,bAcd,ef\ng,h\nij\nkl\nmn,op\nqr'
    );
    b.t(
        'put z1 into z\ndelete second char of second item of z\\z',
        'a,bcd,ef\ng,h\nij\nkl\nmn,op\nqr'
    );
    b.t('second item of second char of z1', '');
    b.t(
        'put z1 into z\nput "A" into second item of second char of z\\z',
        'a,bAcd,ef\ng,h\nij\nkl\nmn,op\nqr'
    );
    b.t(
        'put z1 into z\ndelete second item of second char of z\\z',
        'a,bcd,ef\ng,h\nij\nkl\nmn,op\nqr'
    );
    b.t('global z1\nput "a,b,c" into z1\\1', '1');
    b.t('put z1 into z\ndelete first item of z\\z', 'b,c');
    b.t('put z1 into z\ndelete last item of z\\z', 'a,b');
    b.t('global z1\nput "a"&cr&"b"&cr&"c" into z1\\1', '1');
    b.t('put z1 into z\ndelete first line of z\\z', 'b\nc');
    b.t('put z1 into z\ndelete last line of z\\z', 'a\nb\n');
    b.t('global z1\nput "abcd" into z1\\1', '1');
    b.t('put z1 into z\ndelete first char of z\\z', 'bcd');
    b.t('put z1 into z\ndelete last char of z\\z', 'abc');
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});

/**
 * math ops
 */
t.test('03chunkexpression_mathops', () => {
    let b = new ScriptTestBatch();
    b.t('global z1\nput "1,2,3" into z1\\1', '1');
    b.t('put z1 into z\nadd 1 to item 0 of z\\z', '11,2,3');
    b.t('put z1 into z\nadd 1 to item 1 of z\\z', '2,2,3');
    b.t('put z1 into z\nadd 1 to item 2 of z\\z', '1,3,3');
    b.t('put z1 into z\nadd 1 to item 3 of z\\z', '1,2,4');
    b.t('put z1 into z\nadd 1 to item 4 of z\\z', '1,2,3,1');
    b.t('put z1 into z\nadd 1 to item 5 of z\\z', '1,2,3,,1');
    b.t('global z1\nput ",1,2,3," into z1\\1', '1');
    b.t('put z1 into z\nadd 1 to item 0 of z\\z', '1,1,2,3,');
    b.t('put z1 into z\nadd 1 to item 1 of z\\z', '1,1,2,3,');
    b.t('put z1 into z\nadd 1 to item 2 of z\\z', ',2,2,3,');
    b.t('put z1 into z\nadd 1 to item 3 of z\\z', ',1,3,3,');
    b.t('put z1 into z\nadd 1 to item 4 of z\\z', ',1,2,4,');
    b.t('put z1 into z\nadd 1 to item 5 of z\\z', ',1,2,3,1');
    b.t('global z1\nput "1,2,3" into z1\\1', '1');
    b.t('put z1 into z\nmultiply item 0 of z by 2\\z', '01,2,3');
    b.t('put z1 into z\nmultiply item 1 of z by 2\\z', '2,2,3');
    b.t('put z1 into z\nmultiply item 2 of z by 2\\z', '1,4,3');
    b.t('put z1 into z\nmultiply item 3 of z by 2\\z', '1,2,6');
    b.t('put z1 into z\nmultiply item 4 of z by 2\\z', '1,2,3,0');
    b.t('put z1 into z\nmultiply item 5 of z by 2\\z', '1,2,3,,0');
    /* has same weird behavior */
    b.t('global z1\nput "1,2,3"&cr&"4,5,6" into z1\\1', '1');
    b.t('put z1 into z\nadd 1 to item 2 of item 1 of z\\z', '1,3,3\n4,5,6');
    b.t('put z1 into z\nadd 1 to item 1 of item 2 of z\\z', '2,2,3\n4,5,6');
    b.t('put z1 into z\nadd 1 to item 2 of line 2 of z\\z', '1,2,3\n4,6,6');
    b.t('put z1 into z\nadd 1 to line 2 of item 2 of z\\z', '1,2,3\n4,6,6');
    b.t('global z1\nput "1,2,3" into z1\\1', '1');
    b.t('put z1 into z\nadd 100 to item 0 of z\\z', '1001,2,3');
    b.t('put z1 into z\nadd 100 to item 1 of z\\z', '101,2,3');
    b.t('put z1 into z\nadd 100 to item 2 of z\\z', '1,102,3');
    b.t('put z1 into z\nadd 100 to item 3 of z\\z', '1,2,103');
    b.t('put z1 into z\nadd 100 to item 4 of z\\z', '1,2,3,100');
    b.t('put z1 into z\nadd 100 to item 5 of z\\z', '1,2,3,,100');
    b.t('global z1\nput ",1,2,3," into z1\\1', '1');
    b.t('put z1 into z\nadd 100 to item 0 of z\\z', '100,1,2,3,');
    b.t('put z1 into z\nadd 100 to item 1 of z\\z', '100,1,2,3,');
    b.t('put z1 into z\nadd 100 to item 2 of z\\z', ',101,2,3,');
    b.t('put z1 into z\nadd 100 to item 3 of z\\z', ',1,102,3,');
    b.t('put z1 into z\nadd 100 to item 4 of z\\z', ',1,2,103,');
    b.t('put z1 into z\nadd 100 to item 5 of z\\z', ',1,2,3,100');
    b.t('global z1\nput "1,2,3" into z1\\1', '1');
    b.t('put z1 into z\nmultiply item 0 of z by 200\\z', '01,2,3');
    b.t('put z1 into z\nmultiply item 1 of z by 200\\z', '200,2,3');
    b.t('put z1 into z\nmultiply item 2 of z by 200\\z', '1,400,3');
    b.t('put z1 into z\nmultiply item 3 of z by 200\\z', '1,2,600');
    b.t('put z1 into z\nmultiply item 4 of z by 200\\z', '1,2,3,0');
    b.t('put z1 into z\nmultiply item 5 of z by 200\\z', '1,2,3,,0');
    /* has same weird behavior */
    b.t('global z1\nput "1,2,3"&cr&"4,5,6" into z1\\1', '1');
    b.t('put z1 into z\nadd 100 to item 2 of item 1 of z\\z', '1,102,3\n4,5,6');
    b.t('put z1 into z\nadd 100 to item 1 of item 2 of z\\z', '101,2,3\n4,5,6');
    b.t('put z1 into z\nadd 100 to item 2 of line 2 of z\\z', '1,2,3\n4,105,6');
    b.t('put z1 into z\nadd 100 to line 2 of item 2 of z\\z', '1,2,3\n4,105,6');
    b.t('global z1\nput "100,200,300" into z1\\1', '1');
    b.t('put z1 into z\ndivide item 2 of z by 100\\z', '100,2,300');
    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});

t.test('03chunk, recommended use scenarios', () => {
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', false, h3.vcstate.model)
    );
    let b = new ScriptTestBatch();
    /* use as a 1-d array */
    b.t('global arrayLike\nput "" into arrayLike\\1', '1');
    b.t(
        'put 9 into item 5 of arrayLike\\arrayLike && the number of items in arrayLike',
        ',,,,9 5'
    );
    b.t(
        'put 10 into item 3 of arrayLike\\arrayLike && the number of items in arrayLike',
        ',,10,,9 5'
    );
    b.t(
        'put 11 into item 1 of arrayLike\\arrayLike && the number of items in arrayLike',
        '11,,10,,9 5'
    );
    b.t(
        'put 12 into item 7 of arrayLike\\arrayLike && the number of items in arrayLike',
        '11,,10,,9,,12 7'
    );
    b.t(
        'put "" into item 3 of arrayLike\\arrayLike && the number of items in arrayLike',
        '11,,,,9,,12 7'
    );
    b.t(
        'put 1 into item 4 of arrayLike\\arrayLike && the number of items in arrayLike',
        '11,,,1,9,,12 7'
    );
    b.t(
        'delete item 4 of arrayLike\\arrayLike && the number of items in arrayLike',
        '11,,,9,,12 6'
    );
    b.t(
        'delete item 3 of arrayLike\\arrayLike && the number of items in arrayLike',
        '11,,9,,12 5'
    );
    b.t('item 1 of arrayLike && item 2 of arrayLike && item 5 of arrayLike', '11  12');
    /* use as a 2-d array */
    b.t('global arr2d\nput "" into arr2d\\1', '1');
    b.t(
        'put 9 into item 5 of line 3 of arr2d\\arr2d && the number of lines in arr2d',
        '\n\n,,,,9 3'
    );
    b.t(
        'put 10 into item 3 of line 5 of arr2d\\arr2d && the number of lines in arr2d',
        '\n\n,,,,9\n\n,,10 5'
    );
    b.t(
        'put 11 into item 1 of line 3 of arr2d\\arr2d && the number of lines in arr2d',
        '\n\n11,,,,9\n\n,,10 5'
    );
    b.t(
        'put 12 into item 2 of line 1 of arr2d\\arr2d && the number of lines in arr2d',
        ',12\n\n11,,,,9\n\n,,10 5'
    );
    b.t(
        'put 13 into item 2 of line 3 of arr2d\\arr2d && the number of lines in arr2d',
        ',12\n\n11,13,,,9\n\n,,10 5'
    );
    b.t(
        'put 14 into item 2 of line 3 of arr2d\\arr2d && the number of lines in arr2d',
        ',12\n\n11,14,,,9\n\n,,10 5'
    );
    b.t(
        'put 20 into item 7 of line 3 of arr2d\\arr2d && the number of lines in arr2d',
        ',12\n\n11,14,,,9,,20\n\n,,10 5'
    );
    b.t(
        'put 21 into item 3 of line 1 of arr2d\\arr2d && the number of lines in arr2d',
        ',12,21\n\n11,14,,,9,,20\n\n,,10 5'
    );
    b.t(
        'put 22 into item 5 of line 5 of arr2d\\arr2d && the number of lines in arr2d',
        ',12,21\n\n11,14,,,9,,20\n\n,,10,,22 5'
    );
    b.t(
        'put "" into item 1 of line 3 of arr2d\\arr2d && the number of lines in arr2d',
        ',12,21\n\n,14,,,9,,20\n\n,,10,,22 5'
    );
    b.t(
        'put "" into item 3 of line 5 of arr2d\\arr2d && the number of lines in arr2d',
        ',12,21\n\n,14,,,9,,20\n\n,,,,22 5'
    );
    b.t(
        'delete item 2 of line 3 of arr2d\\arr2d && the number of lines in arr2d',
        ',12,21\n\n,,,9,,20\n\n,,,,22 5'
    );
    b.t(
        'put 23 into item 1 of line 2 of arr2d\\arr2d && the number of lines in arr2d',
        ',12,21\n23\n,,,9,,20\n\n,,,,22 5'
    );
    b.t(
        'delete item 1 of line 2 of arr2d\\arr2d && the number of lines in arr2d',
        ',12,21\n\n,,,9,,20\n\n,,,,22 5'
    );
    b.batchEvaluate(h3);
    /* loops */
    const code = `
function sum1d arr
    put 0 into total
    repeat with x = 1 to the number of items in arr
        put item x of arr into v
        if length(v) > 0 then add v to total
    end repeat
    return total
end sum1d

function sum2d arr
    put 0 into total
    repeat with y = 1 to the number of lines in arr
        put line y of arr into vy
        repeat with x = 1 to the number of items in vy
            put item x of vy into v
            if length(v) > 0 then add v to total
        end repeat
    end repeat
    return total
end sum2d
    `;
    h3.runGeneralCode(code, 'global testresult1\nput sum1d("") into testresult1');
    let got = h3.vcstate.runtime.codeExec.globals.get(`testresult1`).readAsString();
    assertWarnEq('0', got, '');
    h3.runGeneralCode(
        code,
        'global testresult1, arrayLike\nput sum1d(arrayLike) into testresult1'
    );
    got = h3.vcstate.runtime.codeExec.globals.get(`testresult1`).readAsString();
    assertWarnEq((11 + 9 + 12).toString(), got, '');
    h3.runGeneralCode(
        code,
        'global testresult1, arr2d\nput sum2d(arr2d) into testresult1'
    );
    got = h3.vcstate.runtime.codeExec.globals.get(`testresult1`).readAsString();
    assertWarnEq((12 + 21 + 9 + 20 + 22).toString(), got, '');
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', true, h3.vcstate.model)
    );
});

t.test('03chunkexpression_additional chunk tests', () => {
    /* most are covered by extensive tests */
    let b = new ScriptTestBatch();
    /* line aggressive delete */
    b.t('put "a"&cr&"b"&cr&"c" into z1\\1', '1');
    b.t('put z1 into z\ndelete item 1 of line 0 of z\\z', 'a\nb\nc');
    b.t('put z1 into z\ndelete item 1 of line 1 of z\\z', '\nb\nc');
    b.t('put z1 into z\ndelete item 1 of line 2 of z\\z', 'a\nc');
    b.t('put z1 into z\ndelete item 1 of line 3 of z\\z', 'a\nb');
    b.t('put z1 into z\ndelete item 1 of line 4 of z\\z', 'a\nb\nc');
    b.t('put z1 into z\ndelete item 1 of line 5 of z\\z', 'a\nb\nc');
    /* aggressive delete */
    b.t('put ",, " into z1\\1', '1');
    b.t('put z1 into z\ndelete item 3 of z\\z', ',');
    /* aggressive delete in a line */
    b.t('put ",, "&cr into z1\\1', '1');
    b.t('put z1 into z\ndelete item 3 of line 1 of z\\z', ',\n');
    /* leave the space */
    b.t('put ""&""&cr&" ,"&cr&""&"" into z1\\1', '1');
    b.t('put z1 into z\ndelete word 1 to 1 of line 2 to 2 of z\\z', '\n \n');
    /* don't delete the comma */
    b.t('put ""&","&cr&""&"" into z1\\1', '1');
    b.t('put z1 into z\ndelete item 2 to 2 of line 1 to 1 of z\\z', ',\n');
    /* don't delete the space */
    b.t('put ""&" ,"&cr&""&"" into z1\\1', '1');
    b.t('put z1 into z\ndelete word 1 to 1 of z\\z', ' \n');
    /* should add commas */
    b.t(
        longstr(`put ""&"ab"&cr&"cd,ef"&cr&""&cr&"gh"&cr&"ij"&cr&"kl"&cr&"mn,op"&cr&
         "qr"&cr&"st,uv,wx"&cr&"01 23"&cr&"45 "&cr&"67 89,/."&cr&"#$,;: &*,(),-="&cr&
         "~+, <>"&cr&"[],{}"&"" into z1\\1`),
        '1'
    );
    b.t(
        'put z1 into z\nput "ABCDE" into line 3 to 4 of item 3 to 3 of z\\z',
        'ab\ncd,ef\n\ngh,,ABCDE\nij\nkl\nmn,op\nqr\nst,uv,wx\n01 ' +
            '23\n45 \n67 89,/.\n#$,;: &*,(),-=\n~+, <>\n[],{}'
    );
    /* seems to contradict if (!okToAppend) { */
    /* apparently it can add the bounds[2] info after all */
    b.t(
        longstr(`put ""&"ab"&cr&"cd,ef  gh ij"&cr&"kl mn op qr,st,uv"&cr&
         "wx,01,23,45 ,67,89"&cr&"/.,#$ ;:"&cr&"&*"&cr&"()"&cr&"-="&cr&
         "~+, <>,[]"&cr&"{}"&"" into z1\\1`),
        '1'
    );
    b.t(
        'put z1 into z\nput "ABCDE" into line 2 of word 3 of item 3 of z\\z',
        'ab\ncd,ef  gh ij,ABCDE\nkl mn op qr,st,uv\nwx,01,23,45 ' +
            ',67,89\n/.,#$ ;:\n&*\n()\n-=\n~+, <>,[]\n{}'
    );
    /* apparently it can add the bounds[2] info after all */
    b.t(
        longstr(`put ""&"ab"&cr&"cd,ef  gh ij"&cr&"kl mn op qr,st,uv"&cr&
         "wx,01,23,45 ,67,89"&cr&"/.,#$ ;:"&cr&"&*"&cr&"()"&cr&"-="&cr
         &"~+, <>,[]"&cr&"{}"&"" into z1\\1`),
        '1'
    );
    b.t(
        'put z1 into z\nput "ABCDE" into line 1 of word 1 of item 3 of z\\z',
        'ab,,ABCDE\ncd,ef  gh ij\nkl mn op qr,st,uv\nwx,01,23,45 ,' +
            '67,89\n/.,#$ ;:\n&*\n()\n-=\n~+, <>,[]\n{}'
    );
    /* should not delete anything */
    b.t(
        longstr(`put ""&"ab"&cr&"cd,ef"&cr&""&cr&"gh"&cr&"ij"&cr&"kl"&cr&
         "mn,op"&cr&"qr"&cr&"st,uv,wx"&cr&"01 23"&cr&"45 "&cr&"67 89,/."&cr&
         "#$,;: &*,(),-="&cr&"~+, <>"&cr&"[],{}"&"" into z1\\1`),
        '1'
    );
    b.t(
        'put z1 into z\ndelete line 3 of line 3 of word 3 of z\\z',
        'ab\ncd,ef\n\ngh\nij\nkl\nmn,op\nqr\nst,uv,wx\n01 23\n45 \n67' +
            ' 89,/.\n#$,;: &*,(),-=\n~+, <>\n[],{}'
    );
    /* shouldn't have the weird delete behavior if not actually by end of string */
    b.t(
        longstr(`put ""&"ab"&cr&"cd,ef  gh ij"&cr&"kl mn op qr,st,uv"&cr&
         "wx,01,23,45 ,67,89"&cr&"/.,#$ ;:"&cr&"&*"&cr&"()"&cr&"-="&cr&
         "~+, <>,[]"&cr&"{}"&"" into z1\\1`),
        '1'
    );
    b.t(
        'put z1 into z\ndelete word 3 of line 2 of word 2 of z\\z',
        'ab\ncd,ef  gh \nkl mn op qr,st,uv\nwx,01,23,45 ,67,89\n/.,#$ ;:\n&*' +
            '\n()\n-=\n~+, <>,[]\n{}'
    );
    /* shouldn't have the strip-last-whitespace behavior if not actually by end of string */
    b.t(
        longstr(`put ""&"ab cd,ef ,gh,ij kl mn,op"&cr&"qr"&cr&"st,uv,wx 01 23 45,"&
         cr&"67,89"&cr&"/. #$ ;: &*,() -="&cr&"~+, <> [],{}"&"" into z1\\1`),
        '1'
    );
    b.t(
        'put z1 into z\ndelete line 1 of word 3 of item 2 of z\\z',
        'ab cd,ef ,gh,ij kl mn,op\nqr\nst,uv,wx 01 23 45,\n67,89\n/. #$ ;: &*,() -=\n~+, <> [],{}'
    );
    /* don't add commas. not intuitive, so disabled in compat mode */
    b.t('put ""&" ,"&"" into z1\\1', '1');
    b.t(
        'put z1 into z\nput "ABCDE" into item 2 to 2 of line 2 to 2 of z\\z',
        ' ,\nABCDE'
    );
    b.t('put ""&" ,"&"" into z1\\1', '1');
    b.t(
        'put z1 into z\nput "ABCDE" into char 1 of item 2 of line 2 of z\\z',
        ' ,\nABCDE'
    );
    b.t('put ""&" ,"&"" into z1\\1', '1');
    b.t(
        'put z1 into z\nput "ABCDE" into char 7 of item 2 of line 2 of z\\z',
        ' ,\nABCDE'
    );

    /* deleting item might delete a lot */
    b.t(
        longstr(`put ""&"ab cd,ef ,gh,ij kl mn,op"&cr&"qr"&cr&"st,uv,wx 01 23 45,"&
         cr&"67,89"&cr&"/. #$ ;: &*,() -="&cr&"~+, <> [],{}"&"" into z1\\1`),
        '1'
    );
    b.t(
        'put z1 into z\ndelete line 2 of item 1 of line 3 of z\\z',
        'ab cd,ef ,gh,ij kl mn,op\nst,uv,wx 01 23 45,\n67,89\n/. #$ ;: &*,() -=\n~+, <> [],{}'
    );
    /* deleting item might delete a lot, unless line is empty */
    b.t(
        longstr(`put ""&"ab cd,ef ,gh,ij kl mn,op"&cr&""&cr&"st,uv,wx 01 23 45,"&
         cr&"67,89"&cr&"/. #$ ;: &*,() -="&cr&"~+, <> [],{}"&"" into z1\\1`),
        '1'
    );
    b.t(
        'put z1 into z\ndelete line 2 of item 1 of line 3 of z\\z',
        'ab cd,ef ,gh,ij kl mn,op\n\nst,uv,wx 01 23 45,\n67,89\n/. #$ ;: &*,() -=\n~+, <> [],{}'
    );
    /* deleting item might delete a lot, only if delete item 0 */
    b.t(
        longstr(`put ""&"ab cd,ef ,gh,ij kl mn,op"&cr&"qr"&cr&"st,uv,wx 01 23 45,"&
         cr&"67,89"&cr&"/. #$ ;: &*,() -="&cr&"~+, <> [],{}"&"" into z1\\1`),
        '1'
    );
    b.t(
        'put z1 into z\ndelete line 2 of item 0 of line 3 of z\\z',
        'ab cd,ef ,gh,ij kl mn,op\nqr\nst,uv,wx 01 23 45,\n67,89\n/. #$ ;: &*,() -=\n~+, <> [],{}'
    );

    /* shows that just doing this in a loop is not sufficient. */
    b.t('global z1\nput "a.b  c.d" & cr & "e" into z1\\1', '1');
    b.t('put z1 into z\ndelete word 3 of z\\z', 'a.b  c.d\n');
    b.t('put z1 into z\ndelete word 3 of z\ndelete word 2 of z\\z', 'a.b  \n');
    b.t(
        'put z1 into z\ndelete word 3 of z\ndelete word 2 of z\ndelete word 1 of z\\z',
        '\n'
    );

    /* corner cases */
    b.t('global z1\nput "  "&cr&" ab  "&cr&" bc  "&cr&" de  "&cr&" " into z1\\1', '1');
    b.t('put z1 into z\ndelete word 3 of z\\z', '  \n ab  \n bc  \n \n ');
    b.t(
        longstr(`global z1{{NEWLINE}}put "ab"&cr&"cd,ef"&cr&""&cr&"gh"&cr&
        "ij"&cr&"kl"&cr&"mn,op"&cr&"qr"&cr&"st,uv,wx"&cr&"01 23"&cr
        &"45 "&cr&"67 89,/."&cr&"#$,;: &*,(),-="&cr&"~+, <>"&cr&
        "[],{}" into z1\\1`),
        '1'
    );
    b.t(
        'global z1\nput z1 into z\ndelete word 3 to 4 of z\\z',
        'ERR:6:deleting ranges' /* 'ab\ncd,ef\n\n\nkl\nmn,op\nqr\nst,uv,wx\n
        01 23\n45 \n67 89,/.\n#$,;: &*,(),-=\n~+, <>\n[],{}' */
    );

    b.batchEvaluate(h3, [EvaluateWithVarAndFld]);
});

t.test('03chunkadditional turn off compat mode', () => {
    h3.vcstate.vci.doWithoutAbilityToUndo(() =>
        h3.vcstate.model.stack.setOnVel('compatibilitymode', false, h3.vcstate.model)
    );
});
