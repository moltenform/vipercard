
/* auto */ import { BrowserOSInfo, assertEq } from '../../ui512/utils/utilsUI512.js';

export enum MenuConsts {
    addtowidth = 45 + 6,
    shadowsizeleft = 1,
    shadowsizeright = 2,
    shadowsizetop = 1,
    shadowsizebottom = 2,
    itemheight = 16,
    xspacing = 13,
    firstLabelPadding = 13,
    secondLabelDistance = 24,
    topheadermargin1 = 11,
    topheadermargin2 = 500,
    barheight = 21,
}

export enum ScrollConsts {
    barwidth = 16,
    boxheight = 16,
    amtPerClick = 10,
    padBottomOfField = 6,
    tabSize = 4,
    windowCaptionSpacing = 12,
    windowCaptionAdjustTextY = 1,
}

export enum ScreenConsts {
    xleftmargin = 47,
    xareawidth = 512,
    xtoolwidth = 23,
    xtoolcount = 16,
    xtoolmargin = 1,
    xrightmargin = 0,
    ytopmargin = 47,
    ymenubar = 20,
    yareaheight = 342,
    ylowermargin = 7,
    screenwidth = 928,
    screenheight = 416,
}

/**
 * return bounds in form [x, y, width, height]
 */
export function getUI512WindowBounds() {
    return [
        ScreenConsts.xleftmargin,
        ScreenConsts.ytopmargin,
        ScreenConsts.screenwidth - (ScreenConsts.xleftmargin + ScreenConsts.xrightmargin),
        ScreenConsts.screenheight - (ScreenConsts.ytopmargin + ScreenConsts.ylowermargin),
    ];
}

/**
 * screen width should equal all the widths put together
 */
assertEq(
    ScreenConsts.screenwidth,
    ScreenConsts.xleftmargin +
        ScreenConsts.xareawidth +
        ScreenConsts.xtoolwidth * ScreenConsts.xtoolcount +
        ScreenConsts.xtoolmargin +
        ScreenConsts.xrightmargin,
    '3 |'
);

/**
 * screen height should equal all the heights put together
 */
assertEq(
    ScreenConsts.screenheight,
    ScreenConsts.ytopmargin + ScreenConsts.ymenubar + ScreenConsts.yareaheight + ScreenConsts.ylowermargin,
    '3z|'
);

/**
 * let's use dimensions divisible by 8
 */
assertEq(0, ScreenConsts.screenwidth % 8, '3y|');
assertEq(0, ScreenConsts.screenheight % 8, '3x|');

/**
 * ModifierKeys bitfield.
 */
export enum ModifierKeys {
    None = 0,
    Shift = 1 << 0,
    Cmd = 1 << 1,
    Opt = 1 << 2,
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
    let result = ModifierKeys.None;
    if (shiftKey) {
        result |= ModifierKeys.Shift;
    }

    if (browserOS === BrowserOSInfo.Mac) {
        /* there are apparently differences between chrome+safari here,
        so allow either. */
        if (ctrlKey || metaKey) {
            result |= ModifierKeys.Cmd;
        }
        if (altKey) {
            result |= ModifierKeys.Opt;
        }
    } else {
        if (ctrlKey) {
            result |= ModifierKeys.Cmd;
        }
        if (altKey) {
            result |= ModifierKeys.Opt;
        }
    }

    return result;
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

    return s + code;
}
