
/* auto */ import { O, assertTrue, checkThrowUI512 } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';

export type DrawableImage = HTMLCanvasElement | HTMLImageElement;

/**
 * wrap a canvas element.
 */
export class CanvasWrapper {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(canvas: O<HTMLCanvasElement>) {
        if (canvas) {
            let context = canvas.getContext('2d');
            checkThrowUI512(context, '3=|could not create 2d context');
            this.canvas = canvas;
            this.context = context as CanvasRenderingContext2D;
            let contextSetParams = this.context as any;

            /* we want sharp, aliased, non-smoothed graphics */
            contextSetParams.imageSmoothingEnabled = false; /* standard */
            contextSetParams.mozImageSmoothingEnabled = false; /* Firefox */
            contextSetParams.oImageSmoothingEnabled = false; /* Opera */
            contextSetParams.webkitImageSmoothingEnabled = false; /* Safari */
            contextSetParams.msImageSmoothingEnabled = false; /* IE */
        }
    }

    /**
     * create, but don't add to DOM. very useful for bg rendering.
     */
    static createMemoryCanvas(width: number, height: number) {
        let hiddenCanvasDom = window.document.createElement('canvas');
        hiddenCanvasDom.width = width;
        hiddenCanvasDom.height = height;
        let a = new CanvasWrapper(hiddenCanvasDom);
        a.fillRectUnchecked(0, 0, a.canvas.width, a.canvas.height, 'white');
        return a;
    }

    /**
     * set pixel, ignored if out of bounds
     */
    public fillPixelUnchecked(x: number, y: number, fillStyle: string) {
        return this.fillRectUnchecked(x, y, 1, 1, fillStyle);
    }

    /**
     * set pixel, asserts if out of bounds
     */
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
            assertTrue(!assertWithin, '3<|drawing out of bounds');
            return false;
        }
    }

    /**
     * fill rectangle, ignored if out of bounds
     */
    fillRectUnchecked(x0: number, y0: number, width: number, height: number, fillStyle: string) {
        assertTrue(width >= 0, '3;|invalid width ' + width.toString());
        assertTrue(height >= 0, '3:|invalid height ' + height.toString());
        assertTrue(
            Util512.isValidNumber(x0) &&
            Util512.isValidNumber(y0) &&
            Util512.isValidNumber(width) &&
            Util512.isValidNumber(height),
            '3/|dimensions must be numeric'
        );

        /* to visualize bugs with unnecessary redraws, use random colors in this mode */
        if (CanvasWrapper.debugRenderingWithChangingColors && fillStyle !== 'white') {
            let r = Math.trunc(Math.random() * 200);
            let g = Math.trunc(Math.random() * 200);
            let b = Math.trunc(Math.random() * 200);
            fillStyle = `rgb(${r},${g},${b})`;
        }

        this.context.fillStyle = fillStyle;
        this.context.fillRect(x0, y0, width, height);
    }

    /**
     * fill rectangle.
     * the "box" is the region of the canvas we are allowed to write to,
     * any writes outside of this region will be clipped
     */
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
                '3.|not within'
            );
        }

        this.fillRectUnchecked(rectClipped[0], rectClipped[1], rectClipped[2], rectClipped[3], fillStyle);
        return rectClipped;
    }

    /**
     * rectangle outline.
     */
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

    /**
     * invert colors in a rectangle.
     * globalCompositeOperations save my life :)
     */
    private invertColorsRectUnchecked(x0: number, y0: number, width: number, height: number) {
        assertTrue(width >= 0, '3-|invalid width ' + width.toString());
        assertTrue(height >= 0, '3,|invalid height ' + height.toString());
        assertTrue(
            Util512.isValidNumber(x0) &&
                Util512.isValidNumber(y0) &&
                Util512.isValidNumber(width) &&
                Util512.isValidNumber(height),
            '3+|dimensions must be numeric'
        );

        if (CanvasWrapper.debugRenderingWithChangingColors && Math.random() > 0.75) {
            this.fillRectUnchecked(x0, y0, width, height, 'black');
        } else {
            this.context.globalCompositeOperation = 'difference';
            this.context.fillStyle = 'white';
            this.context.fillRect(x0, y0, width, height);
            this.context.globalCompositeOperation = 'source-over';
        }
    }

    /**
     * invert colors in a rectangle.
     * the "box" is the region of the canvas we are allowed to write to,
     * any writes outside of this region will be clipped
     */
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
                '3*|not within'
            );
        }

        this.invertColorsRectUnchecked(rectClipped[0], rectClipped[1], rectClipped[2], rectClipped[3]);
        return rectClipped;
    }

    /**
     * draw an image, or a piece of another canvas, onto the canvas
     */
    private drawFromImageUnchecked(
        img: DrawableImage,
        srcX: number,
        srcY: number,
        srcWidth: number,
        srcHeight: number,
        destX: number,
        destY: number
    ) {
        assertTrue(srcWidth >= 0, '3)|invalid sWidth ' + srcWidth.toString());
        assertTrue(srcHeight >= 0, '3(|invalid height ' + srcHeight.toString());
        assertTrue(
            Util512.isValidNumber(srcX) &&
                Util512.isValidNumber(srcY) &&
                Util512.isValidNumber(srcWidth) &&
                Util512.isValidNumber(srcHeight) &&
                Util512.isValidNumber(destX) &&
                Util512.isValidNumber(destY),
            '3&|dimensions must be numeric'
        );

        if (CanvasWrapper.debugRenderingWithChangingColors && Math.random() > 0.8) {
            this.fillRectUnchecked(destX, destY, srcWidth, srcHeight, 'black');
        } else {
            this.context.drawImage(img, srcX, srcY, srcWidth, srcHeight, destX, destY, srcWidth, srcHeight);
        }
    }

    /**
     * draw an image, or a piece of another canvas, onto the canvas
     * the "box" is the region of the canvas we are allowed to write to,
     * any writes outside of this region will be clipped
     */
    public drawFromImage(
        img: DrawableImage,
        srcX: number,
        srcY: number,
        width: number,
        height: number,
        destX: number,
        destY: number,
        boxX: number,
        boxY: number,
        boxW: number,
        boxH: number
    ) {
        let rectClipped = RectUtils.getRectClipped(destX, destY, width, height, boxX, boxY, boxW, boxH);
        if (rectClipped[2] === 0 || rectClipped[3] === 0) {
            return [destX, destY, 0, 0];
        } else {
            srcX += rectClipped[0] - destX;
            srcY += rectClipped[1] - destY;
            this.drawFromImageUnchecked(img, srcX, srcY, rectClipped[2], rectClipped[3], rectClipped[0], rectClipped[1]);
            return rectClipped;
        }
    }

    /**
     * draw image centered in the box.
     */
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

    /**
     * use a try/finally block to ensure that the mode is reset, even if an exception is thrown.
     */
    public temporarilyChangeCompositeMode(s: string, fn: () => void) {
        try {
            this.context.globalCompositeOperation = s;
            fn();
        } finally {
            this.context.globalCompositeOperation = 'source-over';
        }
    }

    /**
     * clear everything on the canvas. note that transparent != white.
     */
    public clear() {
        this.resetTransform();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * resizing a canvas implicitly clears all contents, so name method likewise
     */
    public resizeAndClear(newWidth: number, newHeight: number) {
        assertTrue(newWidth >= 0, '3%|invalid newWidth ' + newWidth.toString());
        assertTrue(newHeight >= 0, '3$|invalid newHeight ' + newHeight.toString());
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
    }

    /**
     * reset any current scaling/transformations
     */
    public resetTransform() {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
    }

    /**
     * use this mode to visually see where redrawing is occurring,
     * if a region is rapidly flickering rainbow colors, there is a bug causing extra re-draws.
     */
    static debugRenderingWithChangingColors = false;
    static setDebugRenderingWithChangingColors(b: boolean) {
        this.debugRenderingWithChangingColors = b;
    }
}

export class RectUtils {
    /**
     * return a rectangle that is the intersection of the rectangles.
     */
    static getRectClipped(
        x0: number,
        y0: number,
        w: number,
        h: number,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number
    ) {
        const x1 = x0 + w;
        const y1 = y0 + h;
        const boxX1 = boxX0 + boxW;
        const boxY1 = boxY0 + boxH;
        let newX0;
        let newY0;
        let newX1;
        let newY1;
        let newW;
        let newH;
        if (x0 >= boxX1 || y0 >= boxY1) {
            /* it's way outside on the right or bottom */
            newX0 = boxX0;
            newY0 = boxY0;
            newW = 0;
            newH = 0;
        } else if (x1 < boxX0 || y1 < boxY0) {
            /* it's way outside on the left or top */
            newX0 = boxX0;
            newY0 = boxY0;
            newW = 0;
            newH = 0;
        } else {
            /* it's at least partially overlapping */
            newX0 = x0 >= boxX0 ? x0 : boxX0;
            newY0 = y0 >= boxY0 ? y0 : boxY0;
            newX1 = x1 <= boxX1 ? x1 : boxX1;
            newY1 = y1 <= boxY1 ? y1 : boxY1;
            newW = newX1 - newX0;
            newH = newY1 - newY0;
        }

        assertTrue(
            w >= 0 &&
                h >= 0 &&
                newW <= w &&
                newH <= h &&
                newX0 >= boxX0 &&
                newX0 + newW <= boxX0 + boxW &&
                newY0 >= boxY0 &&
                newY0 + newH <= boxY0 + boxH,
            '3>|dimensions must be numeric'
        );

        return [newX0, newY0, newW, newH];
    }

    /**
     * same as getRectClipped, but just return the type of overlap rather than resulting rectangle.
     */
    static getOverlap(
        x0: number,
        y0: number,
        w: number,
        h: number,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number,
        boxX1: number,
        boxY1: number
    ): RectOverlapType {
        const x1 = x0 + w;
        const y1 = y0 + h;
        if (x0 >= boxX1 || y0 >= boxY1) {
            /* it's way outside on the right or bottom */
            return RectOverlapType.NoOverlap;
        } else if (x1 < boxX0 || y1 < boxY0) {
            /* it's way outside on the left or top */
            return RectOverlapType.NoOverlap;
        } else if (x0 >= boxX0 && x1 <= boxX1 && y0 >= boxY0 && y1 <= boxY1) {
            return RectOverlapType.BoxCompletelyCovers;
        } else if (boxX0 >= x0 && boxX1 <= x1 && boxY0 >= y0 && boxY1 <= y1) {
            return RectOverlapType.BoxCompletelyWithin;
        } else {
            return RectOverlapType.PartialOverlap;
        }
    }

    /**
     * is point within rectangle.
     */
    static hasPoint(x: number, y: number, boxX0: number, boxY0: number, boxW: number, boxH: number) {
        return x >= boxX0 && x < boxX0 + boxW && y >= boxY0 && y < boxY0 + boxH;
    }

    /**
     * shrink a rectangle by a defined amount of padding, and keep it centered.
     */
    static getSubRectRaw(x: number, y: number, w: number, h: number, padX: number, padY: number) {
        if (w > padX * 2 && h > padY * 2) {
            return [x + padX, y + padY, w - padX * 2, h - padY * 2];
        } else {
            return undefined;
        }
    }
}

/**
 * for determining overlap between two rectangles
 */
export enum RectOverlapType {
    __isUI512Enum = 1,
    NoOverlap,
    PartialOverlap,
    BoxCompletelyCovers,
    BoxCompletelyWithin,
}
