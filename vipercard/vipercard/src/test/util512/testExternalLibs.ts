
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { BridgedLRUMap } from './../../bridge/bridgeJsLru';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let t = new SimpleUtil512TestCollection('testCollectionExternalLibs');
export let testCollectionExternalLibs = t;

t.test('JsLru', () => {
    let testmap = new (BridgedLRUMap())<string, number>(3);
    testmap.set('a', 1);
    testmap.set('b', 2);
    testmap.set('c', 3);
    assertTrue(testmap.has('a'), '2B|');
    assertTrue(testmap.has('b'), '2A|');
    assertTrue(testmap.has('c'), '29|');
    testmap.set('d', 4);
    assertTrue(testmap.has('b'), '27|');
    assertTrue(testmap.has('c'), '26|');
    assertTrue(testmap.has('d'), '25|');
    assertTrue(!testmap.has('a'), '28|');
});
