
/* auto */ import { BrowserOSInfo } from './util512Higher';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * ModifierKeys bitfield.
 */
export enum ModifierKeys {
    None = 0,
    Shift = 1 << 0,
    Cmd = 1 << 1,
    Opt = 1 << 2
}

/**
 * fill out ModifierKeys bitfield.
 */
export function ui512TranslateModifiers(
    browserOS: BrowserOSInfo,
    ctrlKey: boolean,
    shiftKey: boolean,
    altKey: boolean,
    metaKey: boolean
) {
    let ret = ModifierKeys.None;
    if (shiftKey) {
        ret |= ModifierKeys.Shift;
    }

    if (browserOS === BrowserOSInfo.Mac) {
        /* there are apparently differences between chrome+safari here,
        so allow either. */
        if (ctrlKey || metaKey) {
            ret |= ModifierKeys.Cmd;
        }
        if (altKey) {
            ret |= ModifierKeys.Opt;
        }
    } else {
        if (ctrlKey) {
            ret |= ModifierKeys.Cmd;
        }
        if (altKey) {
            ret |= ModifierKeys.Opt;
        }
    }

    return ret;
}

/**
 * produce a human-readable string.
 * fortunately the new keyevent.code and keyevent.char do the heavy lifting here.
 */
export function toShortcutString(mods: ModifierKeys, code: string) {
    let s = '';
    if ((mods & ModifierKeys.Cmd) !== 0) {
        s += 'Cmd+';
    }

    if ((mods & ModifierKeys.Opt) !== 0) {
        s += 'Opt+';
    }

    if ((mods & ModifierKeys.Shift) !== 0) {
        s += 'Shift+';
    }

    /* from "KeyA" to "A" */
    /* check length first as a perf opt. */
    if (
        code.length === 4 &&
        code.toLowerCase().startsWith('key') &&
        code.charCodeAt(3) >= 'A'.charCodeAt(0) &&
        code.charCodeAt(3) <= 'Z'.charCodeAt(0)
    ) {
        code = code.substr(3);
    }

    /* from "Digit1" to "1" */
    /* check length first as a perf opt. */
    if (
        code.length === 6 &&
        code.toLowerCase().startsWith('digit') &&
        code.charCodeAt(5) >= '0'.charCodeAt(0) &&
        code.charCodeAt(5) <= '9'.charCodeAt(0)
    ) {
        code = code.substr(5);
    }

    /* e.g. numpadenter -> enter */
    if (code.toLowerCase().startsWith("Numpad")) {
        code = code.substr("Numpad".length)
    }

    return s + code;
}
