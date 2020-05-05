
/* auto */ import { ScriptTestBatch, TestVpcScriptRunBase } from './../vpc/vpcTestScriptRunBase';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollection03lexer');
export let testCollection03lexer = t;

export let h3 = YetToBeDefinedTestHelper<TestVpc03>();
t.atest('--init--testCollection03lexer', async () => {
    if (!h3) {
        h3 = new TestVpc03(t);
        return h3.initEnvironment();
    }
});
t.test('03stringliterals', () => {
    let b = new ScriptTestBatch();
    /* basic */
    b.t('put "" into x\\x', '')
    b.t('put "a" into x\\x', 'a')
    b.t('put "a--comment ok" into x\\x', 'a--comment ok')
    b.t('put "a--[[comment]]" into x\\x', 'a--[[comment]]')
    b.t('put "a into x" into x\\x', 'a into x')
    b.t('put "a""b" into x\\x', 'ERR:parse')
    b.t("put 'a' into x\\x", 'PREPARSEERR:lex')
    b.t("put '' into x\\x", 'PREPARSEERR:lex')
    b.t('put " into x\\x', 'PREPARSEERR:lex')
    b.t('put "\n" into x\\x', 'PREPARSEERR:lex')
    b.t('put "a\nb" into x\\x', 'PREPARSEERR:lex')
    /* things right after the quotes */
    b.t('put ("a") into x\\x', 'a')
    b.t('put "1"+"2" into x\\x', '3')
    b.t('put "a"id x\\x', 'PREPARSEERR:lex')
    b.t('put "a"stack x\\x', 'PREPARSEERR:lex')
    b.t('put "a"into x\\x', 'PREPARSEERR:lex')
    b.t('put "a"4 into x\\x', 'PREPARSEERR:lex')
    /* things right before the quotes */
    b.t('put )"b" into x\\x', 'ERR:')
    b.t('put -"4" into x\\x', '-4')
    b.t('put id"b" into x\\x', 'ERR:')
    b.t('put stack"b" into x\\x', 'ERR:')
    b.t('put into"b" into x\\x', 'PREPARSEERR:only see one')
    b.t('put 4"b" into x\\x', 'ERR:')
    /* works, but maybe shouldn't */
    b.t('put"4" into x\\x', '4')
    b.t('put 4 into x\ndivide x by"2"\\x', '2')
    b.t('there is a cd btn"xyz"', 'false')
    b.batchEvaluate(h3);
});

export class TestVpc03 extends TestVpcScriptRunBase {}
