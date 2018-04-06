
/* auto */ import { isRelease } from '../../appsettings.js';
/* auto */ import { assertTrue, assertTrueWarn, makeUI512Error } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper, RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { UI512Patterns, clrBlack, clrTransp, clrWhite } from '../../ui512/draw/ui512drawpattern.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512drawpaintclasses.js';

export class UI512PainterCvData extends UI512Painter {
    constructor(public arr: Uint8ClampedArray, public widthParam: number, public heightParam: number) {
        super();
    }

    setPixel(x: number, y: number, color: number): void {
        if (!RectUtils.hasPoint(x, y, 0, 0, this.widthParam, this.heightParam)) {
            return;
        }

        let offset = 4 * (y * this.widthParam + x);
        if (color === clrTransp) {
            this.arr[offset + 0] = 0;
            this.arr[offset + 1] = 0;
            this.arr[offset + 2] = 0;
            this.arr[offset + 3] = 0;
        } else if (color === clrBlack) {
            this.arr[offset + 0] = 0;
            this.arr[offset + 1] = 0;
            this.arr[offset + 2] = 0;
            this.arr[offset + 3] = 255;
        } else if (color === clrWhite) {
            this.arr[offset + 0] = 255;
            this.arr[offset + 1] = 255;
            this.arr[offset + 2] = 255;
            this.arr[offset + 3] = 255;
        } else {
            assertTrueWarn(false, `2~|unknown color ${color}`);
        }
    }

    fillRect(xin: number, yin: number, win: number, hin: number, color: number): void {
        for (let y = yin; y < yin + hin; y++) {
            for (let x = xin; x < xin + win; x++) {
                this.setPixel(x, y, color);
            }
        }
    }

    readPixel(x: number, y: number) {
        // browsers can change the colors written, see https://en.wikipedia.org/wiki/Canvas_fingerprinting
        // fortunately I'm just drawing black and white
        const i = (y * this.widthParam + x) * 4;
        const minThreshold = isRelease ? 20 : 5;
        const largeThreshold = isRelease ? 230 : 250;
        if (
            this.arr[i] < minThreshold &&
            this.arr[i + 1] < minThreshold &&
            this.arr[i + 2] < minThreshold &&
            this.arr[i + 3] < minThreshold
        ) {
            return clrTransp;
        } else if (
            this.arr[i] > largeThreshold &&
            this.arr[i + 1] > largeThreshold &&
            this.arr[i + 2] > largeThreshold
        ) {
            return clrWhite;
        } else if (
            this.arr[i] < minThreshold &&
            this.arr[i + 1] < minThreshold &&
            this.arr[i + 2] < minThreshold &&
            this.arr[i + 3] > largeThreshold
        ) {
            return clrBlack;
        } else {
            assertTrueWarn(
                false,
                `2||unsupported color ${this.arr[i]},${this.arr[i + 1]},${this.arr[i + 2]},${this.arr[i + 3]}`
            );
            return clrBlack;
        }
    }

    readPixelSupported() {
        return true;
    }

    getCanvasWidth() {
        return this.widthParam;
    }

    getCanvasHeight() {
        return this.heightParam;
    }

    getBackingSurface() {
        return this.arr;
    }

    getSurfaceName() {
        return 'makePainterCvDataDraw';
    }

    supportsPatterns() {
        return false;
    }

    floodFill(xinput: number, yinput: number, color: number) {
        assertTrue(isFinite(xinput) && isFinite(yinput), 'not finite', xinput, yinput);
        if (color > 50) {
            // if pattern support is needed, do it in 2 steps.
            // necessary because our algorithm reads what we have set to see where we have gone.
            // , so it'd be thrown off if we are drawing a pattern as we are going.
            let currentColor = this.readPixel(xinput, yinput);
            let changedColor: number;
            if (currentColor === clrBlack) {
                changedColor = clrWhite;
            } else if (currentColor === clrWhite) {
                changedColor = clrBlack;
            } else {
                changedColor = clrBlack;
            }

            let simpleDraw = new UI512PainterCvData(
                this.getBackingSurface(),
                this.getCanvasWidth(),
                this.getCanvasHeight()
            );

            let recordOutputX: number[] = [];
            let recordOutputY: number[] = [];
            simpleDraw.floodFillWithoutPattern(xinput, yinput, changedColor, recordOutputX, recordOutputY);
            for (let i = 0; i < recordOutputX.length; i++) {
                this.setPixel(recordOutputX[i], recordOutputY[i], color);
            }
        } else {
            this.floodFillWithoutPattern(xinput, yinput, color, undefined, undefined);
        }
    }
}

export class UI512PainterCvDataAndPatterns extends UI512PainterCvData {
    constructor(public arr: Uint8ClampedArray, public widthParam: number, public heightParam: number) {
        super(arr, widthParam, heightParam);
    }

    setPixel(x: number, y: number, color: number): void {
        const offsetpatternx = 0;
        const offsetpatterny = 0;
        // fill with a pattern
        if (color >= 100) {
            const dim = 8;
            let patternstring = UI512Patterns.patterns[color];
            assertEq(dim * dim, slength(patternstring), '3B|');
            let xmod = (x + offsetpatternx) % dim;
            let ymod = (y + offsetpatterny) % dim;
            let index = ymod * dim + xmod;
            let c = patternstring.charCodeAt(index);
            color = c === UI512Patterns.c0 ? clrBlack : clrWhite;
        }

        super.setPixel(x, y, color);
    }

    fillRect(xin: number, yin: number, win: number, hin: number, color: number): void {
        for (let y = yin; y < yin + hin; y++) {
            for (let x = xin; x < xin + win; x++) {
                this.setPixel(x, y, color);
            }
        }
    }

    getSurfaceName() {
        return 'makePainterCvDataWithPatternSupport';
    }

    supportsPatterns() {
        return true;
    }
}

export class UI512PainterCvCanvas extends UI512Painter {
    constructor(public cv: CanvasWrapper, public widthParam: number, public heightParam: number) {
        super();
    }

    setPixel(x: number, y: number, color: number): void {
        if (color === clrBlack) {
            this.cv.fillPixelUnchecked(x, y, 'black');
        } else if (color === clrWhite) {
            this.cv.fillPixelUnchecked(x, y, 'white');
        } else if (color === clrTransp) {
            this.cv.context.clearRect(x, y, 1, 1);
        } else {
            assertTrueWarn(false, '32|unsupported color', color);
        }
    }

    fillRect(x: number, y: number, w: number, h: number, color: number): void {
        if (color === clrBlack) {
            this.cv.fillRectUnchecked(x, y, w, h, 'black');
        } else if (color === clrWhite) {
            this.cv.fillRectUnchecked(x, y, w, h, 'white');
        } else if (color === clrTransp) {
            this.cv.context.clearRect(x, y, w, h);
        } else {
            assertTrueWarn(false, '30|unsupported color', color);
        }
    }

    readPixel(x: number, y: number): number {
        throw makeUI512Error('31|not implemented');
    }

    readPixelSupported() {
        return false;
    }

    getCanvasWidth() {
        return this.widthParam;
    }

    getCanvasHeight() {
        return this.heightParam;
    }

    getBackingSurface() {
        return this.cv;
    }

    getSurfaceName() {
        return 'makePainterCvCanvas';
    }

    supportsPatterns() {
        return false;
    }
}
