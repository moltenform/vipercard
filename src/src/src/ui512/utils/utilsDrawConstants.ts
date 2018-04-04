
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
    ymenubar = 20, // includes bottom line
    yareaheight = 342,
    ylowermargin = 7,
    screenwidth = 928,
    screenheight = 416,
}

assertEq(
    ScreenConsts.screenwidth,
    ScreenConsts.xleftmargin +
        ScreenConsts.xareawidth +
        ScreenConsts.xtoolwidth * ScreenConsts.xtoolcount +
        ScreenConsts.xtoolmargin +
        ScreenConsts.xrightmargin,
    '3 |'
);

assertEq(
    ScreenConsts.screenheight,
    ScreenConsts.ytopmargin + ScreenConsts.ymenubar + ScreenConsts.yareaheight + ScreenConsts.ylowermargin,
    '3z|'
);

assertEq(0, ScreenConsts.screenwidth % 8, '3y|');
assertEq(0, ScreenConsts.screenheight % 8, '3x|');

export function getStandardWindowBounds() {
    return [
        ScreenConsts.xleftmargin,
        ScreenConsts.ytopmargin,
        ScreenConsts.screenwidth - (ScreenConsts.xleftmargin + ScreenConsts.xrightmargin),
        ScreenConsts.screenheight - (ScreenConsts.ytopmargin + ScreenConsts.ylowermargin),
    ];
}

export enum ModifierKeys {
    None = 0,
    Shift = 1 << 0,
    Cmd = 1 << 1,
    Opt = 1 << 2,
}

export function osTranslateModifiers(
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
        // there are apparently differences between chrome+safari here, so just use either.
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

    // from "KeyA" to "A"
    if (
        code.length === 4 &&
        code.toLowerCase().startsWith('key') &&
        code.charCodeAt(3) >= 'A'.charCodeAt(0) &&
        code.charCodeAt(3) <= 'Z'.charCodeAt(0)
    ) {
        code = code.substr(3);
    }

    // from "Digit2" to "2"
    if (
        code.length === 6 &&
        code.startsWith('Digit') &&
        code.charCodeAt(5) >= '0'.charCodeAt(0) &&
        code.charCodeAt(5) <= '9'.charCodeAt(0)
    ) {
        code = code.substr(5);
    }

    return s + code;
}
