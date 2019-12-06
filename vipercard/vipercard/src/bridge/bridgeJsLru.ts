
import type { LRUMap } from '../../external/js-lru/js-lru';

// this library is bundled into externalmanualbundle.js and exists on globalThis

export type BridgedLRUMap<K, V> = LRUMap<K, V>;
export const BridgedLRUMap = LRUMap;
