
/* autoimport:start */
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

// definitions for js-lru.js

// An entry holds the key and value, and pointers to any older and newer entries.
interface LRUMapEntry<K, V> {
    key: K;
    value: V;
}

declare class LRUMap<K, V> {
    // Construct a new cache object which will hold up to limit entries.
    // When the size === limit, a `put` operation will evict the oldest entry.
    //
    // If `entries` is provided, all entries are added to the new map.
    // `entries` should be an Array or other iterable object whose elements are
    // key-value pairs (2-element Arrays). Each key-value pair is added to the new Map.
    // null is treated as undefined.
    constructor(limit: number, entries?: Iterable<[K, V]>);

    // Convenience constructor equivalent to `new LRUMap(count(entries), entries)`
    constructor(entries: Iterable<[K, V]>);

    // Current number of items
    size: number;

    // Maximum number of items this map can hold
    limit: number;

    // Least recently-used entry. Invalidated when map is modified.
    oldest: LRUMapEntry<K, V>;

    // Most recently-used entry. Invalidated when map is modified.
    newest: LRUMapEntry<K, V>;

    // Replace all values in this map with key-value pairs (2-element Arrays) from
    // provided iterable.
    assign(entries: Iterable<[K, V]>): void;

    // Put <value> into the cache associated with <key>. Replaces any existing entry
    // with the same key. Returns `this`.
    set(key: K, value: V): LRUMap<K, V>;

    // Purge the least recently used (oldest) entry from the cache.
    // Returns the removed entry or undefined if the cache was empty.
    shift(): [K, V] | undefined;

    // Get and register recent use of <key>.
    // Returns the value associated with <key> or undefined if not in cache.
    get(key: K): V | undefined;

    // Check if there's a value for key in the cache without registering recent use.
    has(key: K): boolean;

    // Access value for <key> without registering recent use. Useful if you do not
    // want to chage the state of the map, but only "peek" at it.
    // Returns the value associated with <key> if found, or undefined if not found.
    find(key: K): V | undefined;
}

// why give it a new name instead of exporting LRUMap directly?
// we need to put something "real" into this file so that when it is turned into js, there is something to export.
// without any renaming, we'd get an empty bridgejslru.js -- and would fail in the browser because it's trying to import from empty file.
// with renaming, we get a bridgejslru.js with "export var ExpLRUMap = LRUMap" and both TS and the browser are happy.
// There's probably a better way of doing this, but this works for now.
export type ExpLRUMap<K, V> = LRUMap<K, V>;
export const ExpLRUMap = LRUMap;
