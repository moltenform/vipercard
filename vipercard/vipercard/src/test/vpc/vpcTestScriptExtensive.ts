
/* auto */ import { TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollectionScriptExtensive');
export let testCollectionScriptExtensive = t;

let h = YetToBeDefinedTestHelper<TestVpcScriptRunBase>();
t.atest('--init--vpcTestCollectionScriptExtensive', async () => {
    h = new TestVpcScriptRunBase(t);
    return h.initEnvironment();
});
t.test('vpcTestScriptBasics', () => {});
