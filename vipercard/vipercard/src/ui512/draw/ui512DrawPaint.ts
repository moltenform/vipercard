
/* auto */ import { assertTrue, assertTrueWarn, makeUI512Error } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper, RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { clrThreshold } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512Patterns, clrBlack, clrTransp, clrWhite, needsPatternSupport, simplifyPattern } from '../../ui512/draw/ui512DrawPattern.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512DrawPaintClasses.js';

/**
 * paint into an array of raw pixel data
 */
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

    fillRect(xIn: number, yIn: number, wIn: number, hIn: number, color: number): void {
        for (let y = yIn; y < yIn + hIn; y++) {
            for (let x = xIn; x < xIn + wIn; x++) {
                this.setPixel(x, y, color);
            }
        }
    }

    readPixel(x: number, y: number) {
        /* remember to use clrThreshold, since writing to a Canvas is lossy */
        const i = (y * this.widthParam + x) * 4;
        const clrLarge = 256 - clrThreshold;

        if (this.arr[i + 3] < clrThreshold) {
            return clrTransp;
        } else if (this.arr[i] > clrLarge && this.arr[i + 1] > clrLarge && this.arr[i + 2] > clrLarge) {
            return clrWhite;
        } else if (this.arr[i] < clrThreshold && this.arr[i + 1] < clrThreshold && this.arr[i + 2] < clrThreshold) {
            return clrBlack;
        } else {
            assertTrueWarn(
                false,
                `2||unknown color ${this.arr[i]},${this.arr[i + 1]},${this.arr[i + 2]},${this.arr[i + 3]}`
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

    floodFill(xIn: number, yIn: number, color: number) {
        assertTrue(isFinite(xIn) && isFinite(yIn), 'not finite', xIn, yIn);
        color = simplifyPattern(color);
        if (needsPatternSupport(color)) {
            this.floodFillInTwoStages(xIn, yIn, color);
        } else {
            this.floodFillImpl(xIn, yIn, color, undefined, undefined);
        }
    }

    protected floodFillInTwoStages(xIn: number, yIn: number, color: number) {
        /* we need to use two stages, because our algorithm reads
        what we have set to see where we have already placed a pixel.*/

        /* find the opposite color of what is already there */
        let currentColor = this.readPixel(xIn, yIn);
        let oppositeColor = this.getOppositeColor(currentColor);

        /* make a painter with a simple setPixel */
        let simpleDraw = new UI512PainterCvData(
            this.getBackingSurface(),
            this.getCanvasWidth(),
            this.getCanvasHeight()
        );

        /* stage 1: run flood fill with a solid color and record every pixel drawn */
        let recordOutputX: number[] = [];
        let recordOutputY: number[] = [];
        simpleDraw.floodFillImpl(xIn, yIn, oppositeColor, recordOutputX, recordOutputY);

        /* stage 2: replace drawn pixels with our pattern */
        for (let i = 0; i < recordOutputX.length; i++) {
            this.setPixel(recordOutputX[i], recordOutputY[i], color);
        }
    }

    protected getOppositeColor(clr: number) {
        if (clr === clrBlack) {
            return clrWhite;
        } else {
            return clrBlack;
        }
    }
}

/**
 * paint into an array of raw pixel data, supports drawing with a pattern
 */
export class UI512PainterCvDataAndPatterns extends UI512PainterCvData {
    constructor(public arr: Uint8ClampedArray, public widthParam: number, public heightParam: number) {
        super(arr, widthParam, heightParam);
    }

    setPixel(x: number, y: number, color: number): void {
        const offsetpatternx = 0;
        const offsetpatterny = 0;
        /* fill with a pattern */
        /* note: this is slow, but works well enough for now */
        if (needsPatternSupport(color)) {
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

    getSurfaceName() {
        return 'makePainterCvDataWithPatternSupport';
    }

    supportsPatterns() {
        return true;
    }
}

/**
 * paint onto an HTML5 canvas object
 * efficiently draws rectangles, since it can call fillRect.
 */
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
