
/* auto */ import { O, assertTrue, checkThrowUI512 } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';

export type DrawableImage = HTMLCanvasElement | HTMLImageElement;

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
            contextSetParams.imageSmoothingEnabled = false; /* standard */
            contextSetParams.mozImageSmoothingEnabled = false; /* Firefox */
            contextSetParams.oImageSmoothingEnabled = false; /* Opera */
            contextSetParams.webkitImageSmoothingEnabled = false; /* Safari */
            contextSetParams.msImageSmoothingEnabled = false; /* IE */
        }
    }

    static createMemoryCanvas(width: number, height: number) {
        let hiddenCanvasDom = document.createElement('canvas');
        hiddenCanvasDom.width = width;
        hiddenCanvasDom.height = height;
        let a = new CanvasWrapper(hiddenCanvasDom);
        a.fillRectUnchecked(0, 0, a.canvas.width, a.canvas.height, 'white');
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
            assertTrue(!assertWithin, '3<|drawing out of bounds');
            return false;
        }
    }

    fillRectUnchecked(x0: number, y0: number, width: number, height: number, fillStyle: string) {
        assertTrue(width >= 0, '3;|invalid width ' + width.toString());
        assertTrue(height >= 0, '3:|invalid height ' + height.toString());
        assertTrue(
            Util512.isValidNumber(x0) &&
                Util512.isValidNumber(y0) &&
                Util512.isValidNumber(width) &&
                Util512.isValidNumber(height),
            '3/|bad dims'
        );
        if (CanvasWrapper.debugRenderingWithChangingColors && fillStyle !== 'white') {
            let rr = Math.trunc(Math.random() * 200);
            let gg = Math.trunc(Math.random() * 200);
            let bb = Math.trunc(Math.random() * 200);
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
                '3.|not within'
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
        assertTrue(width >= 0, '3-|invalid width ' + width.toString());
        assertTrue(height >= 0, '3,|invalid height ' + height.toString());
        assertTrue(
            Util512.isValidNumber(x0) &&
                Util512.isValidNumber(y0) &&
                Util512.isValidNumber(width) &&
                Util512.isValidNumber(height),
            '3+|bad dims'
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

    private drawFromImageUnchecked(
        img: DrawableImage,
        sx: number,
        sy: number,
        sWidth: number,
        sHeight: number,
        dx: number,
        dy: number
    ) {
        assertTrue(sWidth >= 0, '3)|invalid sWidth ' + sWidth.toString());
        assertTrue(sHeight >= 0, '3(|invalid height ' + sHeight.toString());
        assertTrue(
            Util512.isValidNumber(sx) &&
                Util512.isValidNumber(sy) &&
                Util512.isValidNumber(sWidth) &&
                Util512.isValidNumber(sHeight) &&
                Util512.isValidNumber(dx) &&
                Util512.isValidNumber(dy),
            '3&|bad dims'
        );

        if (CanvasWrapper.debugRenderingWithChangingColors && Math.random() > 0.8) {
            this.fillRectUnchecked(dx, dy, sWidth, sHeight, 'black');
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

    public temporarilyChangeCompositeMode(s: string, fn: () => void) {
        try {
            this.context.globalCompositeOperation = s;
            fn();
        } finally {
            this.context.globalCompositeOperation = 'source-over';
        }
    }

    public clear() {
        this.resetTransform();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public resizeAndClear(newWidth: number, newHeight: number) {
        assertTrue(newWidth >= 0, '3%|invalid newWidth ' + newWidth.toString());
        assertTrue(newHeight >= 0, '3$|invalid newHeight ' + newHeight.toString());
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

export enum RectOverlapType {
    __isUI512Enum = 1,
    NoOverlap,
    PartialOverlap,
    BoxCompletelyCovers,
    BoxCompletelyWithin,
}

export class RectUtils {
    static getRectClipped(
        x0: number,
        y0: number,
        width: number,
        height: number,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number
    ) {
        const x1 = x0 + width;
        const y1 = y0 + height;
        const boxx1 = boxX0 + boxW;
        const boxy1 = boxY0 + boxH;
        let newx0;
        let newy0;
        let newx1;
        let newy1;
        let newwidth;
        let newheight;
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
            '3>|bad dims'
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
