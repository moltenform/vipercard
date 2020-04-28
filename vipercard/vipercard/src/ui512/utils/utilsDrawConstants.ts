
/* auto */ import { assertEq } from './util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
    BarHeight = 21
}

export enum ScrollConsts {
    BarWidth = 16,
    BoxHeight = 16,
    AmtPerClick = 10,
    PadBottomOfField = 6,
    TabSize = 4,
    WindowCaptionSpacing = 12,
    WindowCaptionAdjustTextY = 1,
    ChoiceListDefaultWidth = 130,
    ChoiceListDefaultHeight = 117
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
    /* give ourselves a margin, primarily so our fakecursor won't stay stuck
    when user puts cursor below the screen  */
    FullCanvasWidth = ScreenWidth + 32,
    FullCanvasHeight = ScreenHeight + 32,
}

/**
 * return bounds in form [x, y, width, height]
 */
export function getUI512WindowBounds() {
    return [
        ScreenConsts.xLeftMargin,
        ScreenConsts.yTopMargin,
        ScreenConsts.ScreenWidth - (ScreenConsts.xLeftMargin + ScreenConsts.xRightMargin),
        ScreenConsts.ScreenHeight - (ScreenConsts.yTopMargin + ScreenConsts.yLowerMargin)
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
    ScreenConsts.yTopMargin +
        ScreenConsts.yMenuBar +
        ScreenConsts.yAreaHeight +
        ScreenConsts.yLowerMargin,
    '3z|'
);

/**
 * let's use dimensions divisible by 8
 */
assertEq(0, ScreenConsts.ScreenWidth % 8, '3y|');
assertEq(0, ScreenConsts.ScreenHeight % 8, '3x|');
assertEq(0, ScreenConsts.FullCanvasWidth % 8, '3y|');
assertEq(0, ScreenConsts.FullCanvasHeight % 8, '3y|');
