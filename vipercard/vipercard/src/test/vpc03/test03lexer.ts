
/* auto */ import { TestVpcScriptRunBase } from './../vpc/vpcTestScriptRunBase';
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
t.test('stringliterals', () => {



});

export class TestVpc03 extends TestVpcScriptRunBase {}
