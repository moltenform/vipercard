
/* auto */ import { BrowserOSInfo, assertEq } from '../../ui512/utils/utilsUI512.js';

export enum MenuConsts {
    AddToWidth = 45 + 6,
    ShadowSizeLeft = 1,
    ShadowSizeRight = 2,
    ShadowSizeTop = 1,
    ShadowSizeBottom = 2,
    ItemHeight = 16,
    XSpacing = 13,
    FirstLabelPadding = 13,
    SecondLabelDistance = 24,
    TopHeaderMargin1 = 11,
    TopHeaderMargin2 = 500,
    BarHeight = 21,
}

export enum ScrollConsts {
    BarWidth = 16,
    BoxHeight = 16,
    AmtPerClick = 10,
    PadBottomOfField = 6,
    TabSize = 4,
    WindowCaptionSpacing = 12,
    WindowCaptionAdjustTextY = 1,
}

export enum ScreenConsts {
    xLeftMargin = 47,
    xAreaWidth = 512,
    xToolWidth = 23,
    xToolCount = 16,
    xToolMargin = 1,
    xRightMargin = 0,
    yTopMargin = 47,
    yMenuBar = 20,
    yAreaHeight = 342,
    yLowerMargin = 7,
    ScreenWidth = 928,
    ScreenHeight = 416,
}

/**
 * return bounds in form [x, y, width, height]
 */
export function getUI512WindowBounds() {
    return [
        ScreenConsts.xLeftMargin,
        ScreenConsts.yTopMargin,
        ScreenConsts.ScreenWidth - (ScreenConsts.xLeftMargin + ScreenConsts.xRightMargin),
        ScreenConsts.ScreenHeight - (ScreenConsts.yTopMargin + ScreenConsts.yLowerMargin),
    ];
}

/**
 * screen width should equal all the widths put together
 */
assertEq(
    ScreenConsts.ScreenWidth,
    ScreenConsts.xLeftMargin +
        ScreenConsts.xAreaWidth +
        ScreenConsts.xToolWidth * ScreenConsts.xToolCount +
        ScreenConsts.xToolMargin +
        ScreenConsts.xRightMargin,
    '3 |'
);

/**
 * screen height should equal all the heights put together
 */
assertEq(
    ScreenConsts.ScreenHeight,
    ScreenConsts.yTopMargin + ScreenConsts.yMenuBar + ScreenConsts.yAreaHeight + ScreenConsts.yLowerMargin,
    '3z|'
);

/**
 * let's use dimensions divisible by 8
 */
assertEq(0, ScreenConsts.ScreenWidth % 8, '3y|');
assertEq(0, ScreenConsts.ScreenHeight % 8, '3x|');

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

    return s + code;
}
