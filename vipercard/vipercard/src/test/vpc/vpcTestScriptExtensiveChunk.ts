
/* auto */ import { VpcValS } from '../../vpc/vpcutils/vpcVal';
/* auto */ import { TestVpcScriptRunBase } from './vpcTestScriptRunBase';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack';
/* auto */ import { Util512Higher } from '../../ui512/utils/util512Higher';
/* auto */ import { UI512ErrorHandling, assertWarn } from '../../ui512/utils/util512Assert';
/* auto */ import { assertWarnEq, longstr } from '../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection, YetToBeDefinedTestHelper } from '../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollectionScriptExtensiveChunk', true);
export let testCollectionScriptExtensiveChunk = t;

let h = YetToBeDefinedTestHelper<TestVpcScriptRunBase>();
t.atest('--init--testCollectionScriptExtensive', async () => {
    h = new TestVpcScriptRunBase(t);
    return h.initEnvironment();
});
t.atest('runConditionalTests', () => {
    let test = new RunExtensiveConditionalTests();
    return test.go();
});