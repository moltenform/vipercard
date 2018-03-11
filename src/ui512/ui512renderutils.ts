
/* autoimport:start */
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
/* autoimport:end */

import { isRelease } from "../appsettings.js";

export enum RectOverlapType {
    __isUI512Enum = 1,
    NoOverlap,
    PartialOverlap,
    BoxCompletelyCovers,
    BoxCompletelyWithin,
}

export class RectUtils {
    static getRectClipped(x0: number, y0: number, width: number, height: number, boxX0: number, boxY0: number, boxW: number, boxH: number) {
        const x1 = x0 + width;
        const y1 = y0 + height;
        const boxx1 = boxX0 + boxW;
        const boxy1 = boxY0 + boxH;
        let newx0, newy0, newx1, newy1, newwidth, newheight;
        if (x0 >= boxx1 || y0 >= boxy1) {
            // it's way outside on the right or bottom
            newx0 = boxX0;
            newy0 = boxY0;
            newwidth = 0;
            newheight = 0;
        } else if (x1 < boxX0 || y1 < boxY0) {
            // it's way outside on the left or top
            newx0 = boxX0;
            newy0 = boxY0;
            newwidth = 0;
            newheight = 0;
        } else {
            // it's at least partially overlapping
            newx0 = x0 >= boxX0 ? x0 : boxX0;
            newy0 = y0 >= boxY0 ? y0 : boxY0;
            newx1 = x1 <= boxx1 ? x1 : boxx1;
            newy1 = y1 <= boxy1 ? y1 : boxy1;
            newwidth = newx1 - newx0;
            newheight = newy1 - newy0;
        }

        assertTrue(
            width >= 0 &&
                height >= 0 &&
                newwidth <= width &&
                newheight <= height &&
                newx0 >= boxX0 &&
                newx0 + newwidth <= boxX0 + boxW &&
                newy0 >= boxY0 &&
                newy0 + newheight <= boxY0 + boxH,
            "3>|bad dims"
        );

        return [newx0, newy0, newwidth, newheight];
    }

    static getOverlap(
        x0: number,
        y0: number,
        width: number,
        height: number,
        boxx0: number,
        boxy0: number,
        boxw: number,
        boxh: number,
        boxx1: number,
        boxy1: number
    ): RectOverlapType {
        const x1 = x0 + width;
        const y1 = y0 + height;
        if (x0 >= boxx1 || y0 >= boxy1) {
            // it's way outside on the right or bottom
            return RectOverlapType.NoOverlap;
        } else if (x1 < boxx0 || y1 < boxy0) {
            // it's way outside on the left or top
            return RectOverlapType.NoOverlap;
        } else if (x0 >= boxx0 && x1 <= boxx1 && y0 >= boxy0 && y1 <= boxy1) {
            return RectOverlapType.BoxCompletelyCovers;
        } else if (boxx0 >= x0 && boxx1 <= x1 && boxy0 >= y0 && boxy1 <= y1) {
            return RectOverlapType.BoxCompletelyWithin;
        } else {
            return RectOverlapType.PartialOverlap;
        }
    }

    static hasPoint(x: number, y: number, boxx0: number, boxy0: number, boxw: number, boxh: number) {
        return x >= boxx0 && x < boxx0 + boxw && y >= boxy0 && y < boxy0 + boxh;
    }

    static getSubRectRaw(x: number, y: number, w: number, h: number, padx: number, pady: number) {
        if (w > padx * 2 && h > pady * 2) {
            return [x + padx, y + pady, w - padx * 2, h - pady * 2];
        } else {
            return undefined;
        }
    }
}

export enum ModifierKeys {
    None = 0,
    Shift = 1 << 0,
    Cmd = 1 << 1,
    Opt = 1 << 2,
}

export function osTranslateModifiers(browserOS: BrowserOSInfo, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean) {
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
    let s = "";
    if ((mods & ModifierKeys.Cmd) !== 0) {
        s += "Cmd+";
    }

    if ((mods & ModifierKeys.Opt) !== 0) {
        s += "Opt+";
    }

    if ((mods & ModifierKeys.Shift) !== 0) {
        s += "Shift+";
    }

    // from "KeyA" to "A"
    if (code.length === 4 && code.toLowerCase().startsWith("key") && code.charCodeAt(3) >= "A".charCodeAt(0) && code.charCodeAt(3) <= "Z".charCodeAt(0)) {
        code = code.substr(3);
    }

    return s + code;
}

export type DrawableImage = HTMLCanvasElement | HTMLImageElement;

export class CanvasWrapper {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(canvas: O<HTMLCanvasElement>) {
        if (canvas) {
            let context = canvas.getContext("2d");
            checkThrowUI512(context, "3=|could not create 2d context");
            this.canvas = canvas;
            this.context = context as CanvasRenderingContext2D;
            let contextSetParams = this.context as any;
            contextSetParams.imageSmoothingEnabled = false; /* standard */
            contextSetParams.mozImageSmoothingEnabled = false; /* Firefox */
            contextSetParams.oImageSmoothingEnabled = false; /* Opera */
            contextSetParams.webkitImageSmoothingEnabled = false; /* Safari */
            contextSetParams.msImageSmoothingEnabled = false; /* IE */
        }
    }

    static createMemoryCanvas(width:number, height:number) {
        let hiddenCanvasDom = document.createElement("canvas");
        hiddenCanvasDom.width = width
        hiddenCanvasDom.height = height
        let a = new CanvasWrapper(hiddenCanvasDom);
        a.fillRectUnchecked(0, 0, a.canvas.width, a.canvas.height, "white");
        return a;
    }

    public fillPixelUnchecked(x: number, y: number, fillStyle: string) {
        return this.fillRectUnchecked(x, y, 1, 1, fillStyle);
    }

    public fillPixel(
        x: number,
        y: number,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number,
        fillStyle: string,
        assertWithin?: boolean
    ) {
        if (x >= boxX0 && x < boxX0 + boxW && y >= boxY0 && y < boxY0 + boxH) {
            this.context.fillStyle = fillStyle;
            this.context.fillRect(x, y, 1, 1);
            return true;
        } else {
            assertTrue(!assertWithin, "3<|drawing out of bounds");
            return false;
        }
    }

    fillRectUnchecked(x0: number, y0: number, width: number, height: number, fillStyle: string) {
        assertTrue(width >= 0, "3;|invalid width " + width.toString());
        assertTrue(height >= 0, "3:|invalid height " + height.toString());
        assertTrue(
            Util512.isValidNumber(x0) && Util512.isValidNumber(y0) && Util512.isValidNumber(width) && Util512.isValidNumber(height),
            "3/|bad dims"
        );
        if (CanvasWrapper.debugRenderingWithChangingColors && fillStyle !== "white") {
            let rr = Math.trunc(Math.random() * 200),
                gg = Math.trunc(Math.random() * 200),
                bb = Math.trunc(Math.random() * 200);
            fillStyle = `rgb(${rr},${gg},${bb})`;
        }

        this.context.fillStyle = fillStyle;
        this.context.fillRect(x0, y0, width, height);
    }

    public fillRect(
        x0: number,
        y0: number,
        width: number,
        height: number,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number,
        fillStyle: string,
        assertWithin?: boolean
    ) {
        let rectClipped = RectUtils.getRectClipped(x0, y0, width, height, boxX0, boxY0, boxW, boxH);
        if (assertWithin) {
            assertTrue(
                rectClipped[0] === x0 && rectClipped[1] === y0 && rectClipped[2] === width && rectClipped[3] === height,
                "3.|not within"
            );
        }

        this.fillRectUnchecked(rectClipped[0], rectClipped[1], rectClipped[2], rectClipped[3], fillStyle);
        return rectClipped;
    }

    public outlineRect(
        x0: number,
        y0: number,
        width: number,
        height: number,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number,
        fillStyle: string
    ) {
        this.fillRect(x0, y0, width, 1, boxX0, boxY0, boxW, boxH, fillStyle);
        this.fillRect(x0, y0 + height, width, 1, boxX0, boxY0, boxW, boxH, fillStyle);
        this.fillRect(x0, y0, 1, height, boxX0, boxY0, boxW, boxH, fillStyle);
        this.fillRect(x0 + width, y0, 1, height, boxX0, boxY0, boxW, boxH, fillStyle);
    }

    private invertColorsRectUnchecked(x0: number, y0: number, width: number, height: number) {
        assertTrue(width >= 0, "3-|invalid width " + width.toString());
        assertTrue(height >= 0, "3,|invalid height " + height.toString());
        assertTrue(
            Util512.isValidNumber(x0) && Util512.isValidNumber(y0) && Util512.isValidNumber(width) && Util512.isValidNumber(height),
            "3+|bad dims"
        );

        if (CanvasWrapper.debugRenderingWithChangingColors && Math.random() > 0.75) {
            this.fillRectUnchecked(x0, y0, width, height, "black");
        } else {
            this.context.globalCompositeOperation = "difference";
            this.context.fillStyle = "white";
            this.context.fillRect(x0, y0, width, height);
            this.context.globalCompositeOperation = "source-over";
        }
    }

    public invertColorsRect(
        x0: number,
        y0: number,
        width: number,
        height: number,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number,
        assertWithin?: boolean
    ) {
        let rectClipped = RectUtils.getRectClipped(x0, y0, width, height, boxX0, boxY0, boxW, boxH);
        if (assertWithin) {
            assertTrue(
                rectClipped[0] === x0 && rectClipped[1] === y0 && rectClipped[2] === width && rectClipped[3] === height,
                "3*|not within"
            );
        }

        this.invertColorsRectUnchecked(rectClipped[0], rectClipped[1], rectClipped[2], rectClipped[3]);
        return rectClipped;
    }

    private drawFromImageUnchecked(img: DrawableImage, sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number) {
        assertTrue(sWidth >= 0, "3)|invalid sWidth " + sWidth.toString());
        assertTrue(sHeight >= 0, "3(|invalid height " + sHeight.toString());
        assertTrue(
            Util512.isValidNumber(sx) &&
                Util512.isValidNumber(sy) &&
                Util512.isValidNumber(sWidth) &&
                Util512.isValidNumber(sHeight) &&
                Util512.isValidNumber(dx) &&
                Util512.isValidNumber(dy),
            "3&|bad dims"
        );
        
        if (CanvasWrapper.debugRenderingWithChangingColors && Math.random() > 0.8) {
            this.fillRectUnchecked(dx, dy, sWidth, sHeight, "black");
        } else {
            this.context.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
        }
    }

    public drawFromImage(
        img: DrawableImage,
        sx: number,
        sy: number,
        width: number,
        height: number,
        destx0: number,
        desty0: number,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number
    ) {
        let rectClipped = RectUtils.getRectClipped(destx0, desty0, width, height, boxX0, boxY0, boxW, boxH);
        if (rectClipped[2] === 0 || rectClipped[3] === 0) {
            return [destx0, desty0, 0, 0];
        } else {
            sx += rectClipped[0] - destx0;
            sy += rectClipped[1] - desty0;
            this.drawFromImageUnchecked(img, sx, sy, rectClipped[2], rectClipped[3], rectClipped[0], rectClipped[1]);
            return rectClipped;
        }
    }

    public drawFromImageCentered(
        img: DrawableImage,
        sx: number,
        sy: number,
        width: number,
        height: number,
        adjustx: number,
        adjusty: number,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number
    ) {
        const destx0 = boxX0 + Math.trunc((boxW - width) / 2) + adjustx;
        const desty0 = boxY0 + Math.trunc((boxH - height) / 2) + adjusty;
        return this.drawFromImage(img, sx, sy, width, height, destx0, desty0, boxX0, boxY0, boxW, boxH);
    }

    public temporarilyChangeCompositeMode(s:string, fn:()=>void) {
        try {
            this.context.globalCompositeOperation = s;
            fn()
        } finally {
            this.context.globalCompositeOperation = "source-over";
        }
    }

    public clear() {
        this.resetTransform();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public resizeAndClear(newWidth: number, newHeight: number) {
        assertTrue(newWidth >= 0, "3%|invalid newWidth " + newWidth.toString());
        assertTrue(newHeight >= 0, "3$|invalid newHeight " + newHeight.toString());
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
    }
    public resetTransform() {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
    }

    // every black pixel drawn with a different color,
    // so that if we are redrawing more than expected, it shows up.
    static debugRenderingWithChangingColors = false;
    static setDebugRenderingWithChangingColors(b: boolean) {
        this.debugRenderingWithChangingColors = b;
    }
}

export enum UI512Cursors {
    __isUI512Enum = 1,    
    unknown = 2,
    arrow = 3,
    beam = 4,
    crosshair = 5,
    hand = 6,
    pencil = 7,
    plus = 8,
    watch = 9,
    paintbrush = 10,
    paintbucket = 11,
    painttext = 12,
    paintlasso = 13,
    painteraser = 14,
    paintspray = 15,
    hosthand = 20,
    hostpointer = 21,
}

export class UI512CursorAccess {
    protected static currentCursor = UI512Cursors.unknown
    static defaultCursor = UI512Cursors.arrow
    static getCursor(): UI512Cursors  {
        return UI512CursorAccess.currentCursor
    }

    static setCursor(nextCursor: UI512Cursors) {
        if (nextCursor !== UI512CursorAccess.currentCursor) {
            let el = document.getElementById('mainDomCanvas')
            if (el) {
                assertEq('number', typeof nextCursor, '3#|')
                let className = 'classCursor' + nextCursor.toString()
                el.className = className
            }
    
            UI512CursorAccess.currentCursor = nextCursor
        }
    }

    protected static getCursorFromClass() {
        let el = document.getElementById('mainDomCanvas')
        if (el) {
            let className = el.className;
            let n = parseInt(className.replace(/classCursor/, ''), 10)
            if (isFinite(n)) {
                if (findEnumToStr<UI512Cursors>(UI512Cursors, n) !== undefined) {
                    return n
                }
            }
        }

        return UI512Cursors.unknown
    }
}

export function getColorFromCanvasData(data: Uint8ClampedArray, i: number) {
    assertTrue(data[i] !== undefined, "3!|point not defined");
    if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0 && data[i + 3] < 5) {
        return "white";
    } else if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) {
        return "white";
    } else if (data[i] < 5 && data[i + 1] < 5 && data[i + 2] < 5 && data[i + 3] > 250) {
        return "black";
    } else {
        return `other(${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]})`;
    }
}

// Const enums are placed inline
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
        ScreenConsts.xrightmargin
, '3 |');

assertEq(ScreenConsts.screenheight, ScreenConsts.ytopmargin + ScreenConsts.ymenubar + ScreenConsts.yareaheight + ScreenConsts.ylowermargin, '3z|');
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

export function sleep(ms: number) {
    return new Promise<void>(function(resolve) {
        setTimeout(resolve, ms);
    });
}

export function compareCanvas(knownGoodImage: any, canvasGot: CanvasWrapper, imwidth: number, imheight: number, drawRed: boolean) {
    let hiddenCanvasExpectedDom = document.createElement("canvas");
    hiddenCanvasExpectedDom.width = imwidth;
    hiddenCanvasExpectedDom.height = imheight;
    let hiddenCanvasExpected = new CanvasWrapper(hiddenCanvasExpectedDom);
    hiddenCanvasExpected.drawFromImage(knownGoodImage, 0, 0, imwidth, imheight, 0, 0, 0, 0, imwidth, imheight);
    let dataExpected = hiddenCanvasExpected.context.getImageData(0, 0, imwidth, imheight);
    let dataGot = canvasGot.context.getImageData(0, 0, imwidth, imheight);
    assertEq(dataExpected.data.length, dataGot.data.length, '3w|');
    assertEq(dataExpected.data.length, 4 * imwidth * imheight, '3v|');
    let countDifferences = 0;
    for (let i = 0; i < dataExpected.data.length; i += 4) {
        if (getColorFromCanvasData(dataExpected.data, i) !== getColorFromCanvasData(dataGot.data, i)) {
            if (drawRed) {
                dataGot.data[i] = 255;
                dataGot.data[i + 1] = 0;
                dataGot.data[i + 2] = 0;
                dataGot.data[i + 3] = 255;
            }
            countDifferences++;
        }
    }

    if (drawRed) {
        canvasGot.context.putImageData(dataGot, 0, 0);
    }

    return countDifferences;
}

declare var saveAs: any;
export class CanvasTestParams {
    constructor(
        public testname: string,
        public urlExpectedImg: string,
        public fnDraw: (canvas: CanvasWrapper, complete: RenderComplete) => void,
        public imwidth: number,
        public imheight: number,
        public uicontext: boolean,
        public expectCountDifferentPixels = 0
    ) {}
}

async function testUtilCompareCanvasWithExpectedAsyncOne(dldgot: boolean, fnGetParams: Function): Promise<void> {
    let params = fnGetParams();
    let { testname, urlExpectedImg, imwidth, imheight, fnDraw, dlddelta, uicontext } = params;
    let knownGoodImage = new Image();
    Util512.beginLoadImage(urlExpectedImg, knownGoodImage, () => {});

    let hiddenCanvasDom = document.createElement("canvas");
    hiddenCanvasDom.width = imwidth;
    hiddenCanvasDom.height = imheight;
    let hiddenCanvas = new CanvasWrapper(hiddenCanvasDom);
    let finished = false;
    for (let i = 0; i < 500; i++) {
        if (knownGoodImage.complete) {
            let complete = new RenderComplete();
            let ret = fnDraw(hiddenCanvas, complete);
            assertTrue(ret === undefined || ret === null, "3u|please don't return anything from fnDraw");
            if (complete.complete) {
                finished = true;
                break;
            }
        }

        hiddenCanvas.clear();
        await sleep(100);
    }

    if (!finished) {
        alert("timed out waiting for images to load...");
        assertTrue(false, "3t|test failed, timed out");
        throw new Error("test failed, timed out");
    }

    if (dldgot) {
        hiddenCanvasDom.toBlob(function(blob) {
            saveAs(blob, "test" + testname + ".png");
        });
        console.log("Image sent to download, test complete.");
    } else {
        let countDifferences = compareCanvas(knownGoodImage, hiddenCanvas, imwidth, imheight, true);
        if (params.expectCountDifferentPixels !== 0) {
            assertEq(params.expectCountDifferentPixels, countDifferences, '3s|');
        }

        if (countDifferences === params.expectCountDifferentPixels) {
            console.log(`\t\ttest ${testname} passed`);
        } else {
            console.log(
                `test ${testname} failed -- ${countDifferences} pixels ${100 * (countDifferences / (imwidth * imheight))}% do not match.`
            );
            hiddenCanvasDom.toBlob(function(blob) {
                saveAs(blob, "failed" + testname + ".png");
            });
            console.log("Delta image sent to download, failures marked in red.");
            if (uicontext) {
                alert(`test ${testname} failed`);
            }
            assertTrue(false, "3r|test failed");
            throw new Error("test failed");
        }
    }
}

async function testUtilCompareCanvasWithExpectedAsync(
    dldgot: boolean,
    fnGetParams: Function | Function[],
    callbackWhenComplete?: Function
): Promise<void> {
    if (fnGetParams instanceof Array) {
        for (let fn of fnGetParams) {
            await testUtilCompareCanvasWithExpectedAsyncOne(dldgot, fn);
        }
    } else {
        await testUtilCompareCanvasWithExpectedAsyncOne(dldgot, fnGetParams);
    }

    if (callbackWhenComplete) {
        callbackWhenComplete();
    }
}

export function testUtilCompareCanvasWithExpected(dldgot: boolean, fnGetParams: Function | Function[], callbackWhenComplete?: Function) {
    testUtilCompareCanvasWithExpectedAsync(dldgot, fnGetParams, callbackWhenComplete);
}
