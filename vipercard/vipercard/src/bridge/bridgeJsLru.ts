import type { LRUMap } from '../../external/js-lru/js-lru';

// [js-lru](https://github.com/rsms/js-lru)
// this library is bundled into externalmanualbundle.js and exists on globalThis

// note: vscode sometimes warns about this saying "LRUMap" cannot be used as a value
// because it was imported using import type.
// the actual build is clean, and it works at runtime which is what is most important.

export type BridgedLRUMap<K, V> = LRUMap<K, V>;
export function BridgedLRUMap() {
    return LRUMap;
}
