
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { BrowserOSInfo, assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { ModifierKeys, toShortcutString, ui512TranslateModifiers } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';

/**
 * testing functions from utilsDraw
 */
let mTests: (string | Function)[] = [
    'testUtilsDrawGetRectClipped.FullyContained',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [x0, y0, w, h];
        assertEq(expected, got, '0S|');
    },
    'testUtilsDrawGetRectClipped.SidesAreTheSame',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        x0 = boxX0;
        w = boxW;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [x0, y0, w, h];
        assertEq(expected, got, '0R|');
    },
    'testUtilsDrawGetRectClipped.TopsAreTheSame',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        y0 = boxY0;
        h = boxH;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [x0, y0, w, h];
        assertEq(expected, got, '0Q|');
    },
    'testUtilsDrawGetRectClipped.ProtrudesLeft',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        x0 = 6;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [10, y0, 30 - (10 - 6), h];
        assertEq(expected, got, '0P|');
    },
    'testUtilsDrawGetRectClipped.ProtrudesTop',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        y0 = 50;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [x0, 60, w, 22 - (60 - 50)];
        assertEq(expected, got, '0O|');
    },
    'testUtilsDrawGetRectClipped.ProtrudesRight',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        w = 300;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [x0, y0, 200 + 10 - 15, h];
        assertEq(expected, got, '0N|');
    },
    'testUtilsDrawGetRectClipped.ProtrudesBottom',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        h = 400;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [x0, y0, w, 130 + 60 - 65];
        assertEq(expected, got, '0M|');
    },
    'testUtilsDrawGetRectClipped.CompletelyCovers',
    () => {
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        let x0 = boxX0 - 5;
        let y0 = boxY0 - 7;
        let w = boxW + 24;
        let h = boxH + 31;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [boxX0, boxY0, boxW, boxH];
        assertEq(expected, got, '0L|');
    },
    'testUtilsDrawGetRectClipped.OutsideLeft',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        x0 = 3;
        w = 6;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [boxX0, boxY0, 0, 0];
        assertEq(expected, got, '0K|');
    },
    'testUtilsDrawGetRectClipped.OutsideLeftTouches',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        x0 = 3;
        w = 7;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [boxX0, y0, 0, h];
        assertEq(expected, got, '0J|');
    },
    'testUtilsDrawGetRectClipped.BarelyInsideLeft',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        x0 = 3;
        w = 8;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [boxX0, y0, 1, h];
        assertEq(expected, got, '0I|');
    },
    'testUtilsDrawGetRectClipped.OutsideTop',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        y0 = 55;
        h = 4;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [boxX0, boxY0, 0, 0];
        assertEq(expected, got, '0H|');
    },
    'testUtilsDrawGetRectClipped.OutsideTopTouches',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        y0 = 55;
        h = 5;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [x0, boxY0, w, 0];
        assertEq(expected, got, '0G|');
    },
    'testUtilsDrawGetRectClipped.BarelyInsideTop',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        y0 = 55;
        h = 6;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [x0, boxY0, w, 1];
        assertEq(expected, got, '0F|');
    },
    'testUtilsDrawGetRectClipped.OutsideRight',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        x0 = boxX0 + boxW;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [boxX0, boxY0, 0, 0];
        assertEq(expected, got, '0E|');
    },
    'testUtilsDrawGetRectClipped.OutsideBottom',
    () => {
        let x0 = 15;
        let y0 = 65;
        let w = 30;
        let h = 22;
        let boxX0 = 10;
        let boxY0 = 60;
        let boxW = 200;
        let boxH = 130;
        y0 = boxY0 + boxH;
        let got = RectUtils.getRectClipped(x0, y0, w, h, boxX0, boxY0, boxW, boxH);
        let expected = [boxX0, boxY0, 0, 0];
        assertEq(expected, got, '0D|');
    },
    'testUtilsDrawGetSubRectRaw.EnoughSpace',
    () => {
        assertEq([105, 206, 290, 388], RectUtils.getSubRectRaw(100, 200, 300, 400, 5, 6), '');
        assertEq([110, 211, 280, 378], RectUtils.getSubRectRaw(100, 200, 300, 400, 10, 11), '');
        assertEq([249, 211, 2, 378], RectUtils.getSubRectRaw(100, 200, 300, 400, 149, 11), '');
        assertEq([249, 399, 2, 2], RectUtils.getSubRectRaw(100, 200, 300, 400, 149, 199), '');
    },
    'testUtilsDrawGetSubRectRaw.NotEnoughSpace',
    () => {
        assertEq(undefined, RectUtils.getSubRectRaw(100, 200, 300, 400, 150, 11), '');
        assertEq(undefined, RectUtils.getSubRectRaw(100, 200, 300, 400, 10, 200), '');
        assertEq(undefined, RectUtils.getSubRectRaw(100, 200, 300, 400, 150, 200), '');
    },
    'testUtilsTranslateModifiers',
    () => {
        let shift: number = ModifierKeys.Shift;
        let cmd: number = ModifierKeys.Cmd;
        let opt: number = ModifierKeys.Opt;
        assertEq(0, ui512TranslateModifiers(BrowserOSInfo.Unknown, false, false, false, false), '');
        assertEq(shift, ui512TranslateModifiers(BrowserOSInfo.Unknown, false, true, false, false), '');
        assertEq(shift + opt, ui512TranslateModifiers(BrowserOSInfo.Unknown, false, true, true, false), '');
        assertEq(shift + cmd + opt, ui512TranslateModifiers(BrowserOSInfo.Unknown, true, true, true, false), '');
        assertEq(cmd + opt, ui512TranslateModifiers(BrowserOSInfo.Unknown, true, false, true, false), '');
        assertEq(opt, ui512TranslateModifiers(BrowserOSInfo.Unknown, false, false, true, false), '');
    },
    'testUtilsToShortcutString.TypicalShortcut',
    () => {
        let shift: number = ModifierKeys.Shift;
        let cmd: number = ModifierKeys.Cmd;
        let opt: number = ModifierKeys.Opt;
        assertEq('a', toShortcutString(ModifierKeys.None, 'a'), '');
        assertEq('Shift+a', toShortcutString(shift, 'a'), '');
        assertEq('Opt+Shift+a', toShortcutString(shift + opt, 'a'), '');
        assertEq('Cmd+Opt+Shift+a', toShortcutString(shift + cmd + opt, 'a'), '');
        assertEq('Cmd+Opt+a', toShortcutString(cmd + opt, 'a'), '');
        assertEq('Opt+a', toShortcutString(opt, 'a'), '');
    },
    'testUtilsToShortcutString.TruncateKey',
    () => {
        let shift: number = ModifierKeys.Shift;
        let cmd: number = ModifierKeys.Cmd;
        let opt: number = ModifierKeys.Opt;
        assertEq('Cmd+A', toShortcutString(cmd, 'KeyA'), '');
        assertEq('Cmd+Keya', toShortcutString(cmd, 'Keya'), '');
        assertEq('Cmd+A', toShortcutString(cmd, 'keyA'), '');
        assertEq('Cmd+keya', toShortcutString(cmd, 'keya'), '');
        assertEq('Cmd+Z', toShortcutString(cmd, 'keyZ'), '');
        assertEq('Cmd+keyz', toShortcutString(cmd, 'keyz'), '');
        assertEq('Cmd+Key ', toShortcutString(cmd, 'Key '), '');
        assertEq('Cmd+Key@', toShortcutString(cmd, 'Key@'), '');
        assertEq('Cmd+Key', toShortcutString(cmd, 'Key'), '');
        assertEq('Cmd+KeyAA', toShortcutString(cmd, 'KeyAA'), '');
    },
    'testUtilsToShortcutString.TruncateDigit',
    () => {
        let shift: number = ModifierKeys.Shift;
        let cmd: number = ModifierKeys.Cmd;
        let opt: number = ModifierKeys.Opt;
        assertEq('Cmd+1', toShortcutString(cmd, 'Digit1'), '');
        assertEq('Cmd+1', toShortcutString(cmd, 'digit1'), '');
        assertEq('Cmd+9', toShortcutString(cmd, 'digit9'), '');
        assertEq('Cmd+9', toShortcutString(cmd, 'digit9'), '');
        assertEq('Cmd+Digit ', toShortcutString(cmd, 'Digit '), '');
        assertEq('Cmd+Digit@', toShortcutString(cmd, 'Digit@'), '');
        assertEq('Cmd+Digit', toShortcutString(cmd, 'Digit'), '');
        assertEq('Cmd+Digit11', toShortcutString(cmd, 'Digit11'), '');
    },
    'testUtilsTranslateModifiers.Windows',
    () => {
        assertEq(ModifierKeys.None, ui512TranslateModifiers(BrowserOSInfo.Windows, false, false, false, false), '');
        assertEq(ModifierKeys.Shift, ui512TranslateModifiers(BrowserOSInfo.Windows, false, true, false, false), '');
        assertEq(ModifierKeys.Opt, ui512TranslateModifiers(BrowserOSInfo.Windows, false, false, true, false), '');
        assertEq(
            ModifierKeys.Shift | ModifierKeys.Cmd | ModifierKeys.Opt,
            ui512TranslateModifiers(BrowserOSInfo.Windows, true, true, true, true),
            ''
        );
        assertEq(
            ModifierKeys.Shift | ModifierKeys.Opt,
            ui512TranslateModifiers(BrowserOSInfo.Windows, false, true, true, true),
            ''
        );
    },
    'testUtilsTranslateModifiers.Linux',
    () => {
        assertEq(ModifierKeys.None, ui512TranslateModifiers(BrowserOSInfo.Linux, false, false, false, false), '');
        assertEq(ModifierKeys.Shift, ui512TranslateModifiers(BrowserOSInfo.Linux, false, true, false, false), '');
        assertEq(ModifierKeys.Opt, ui512TranslateModifiers(BrowserOSInfo.Linux, false, false, true, false), '');
        assertEq(
            ModifierKeys.Shift | ModifierKeys.Cmd | ModifierKeys.Opt,
            ui512TranslateModifiers(BrowserOSInfo.Linux, true, true, true, true),
            ''
        );
        assertEq(
            ModifierKeys.Shift | ModifierKeys.Opt,
            ui512TranslateModifiers(BrowserOSInfo.Linux, false, true, true, true),
            ''
        );
    },
    'testUtilsTranslateModifiers.Mac',
    () => {
        assertEq(ModifierKeys.None, ui512TranslateModifiers(BrowserOSInfo.Mac, false, false, false, false), '');
        assertEq(ModifierKeys.Shift, ui512TranslateModifiers(BrowserOSInfo.Mac, false, true, false, false), '');
        assertEq(ModifierKeys.Opt, ui512TranslateModifiers(BrowserOSInfo.Mac, false, false, true, false), '');
        assertEq(
            ModifierKeys.Shift | ModifierKeys.Cmd | ModifierKeys.Opt,
            ui512TranslateModifiers(BrowserOSInfo.Mac, true, true, true, true),
            ''
        );
        assertEq(
            ModifierKeys.Shift | ModifierKeys.Cmd | ModifierKeys.Opt,
            ui512TranslateModifiers(BrowserOSInfo.Mac, false, true, true, true),
            ''
        );
    }
];

export class TestUI512CanvasWrapper extends UI512TestBase {
    tests = [];
}
