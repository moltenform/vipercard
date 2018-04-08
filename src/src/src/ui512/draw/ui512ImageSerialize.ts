
/* auto */ import { O, UI512Compress, assertTrue, assertTrueWarn, checkThrowUI512, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, base10 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { clrBlack, clrTransp, clrWhite, needsPatternSupport, simplifyPattern } from '../../ui512/draw/ui512DrawPattern.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512DrawPaintClasses.js';
/* auto */ import { UI512PainterCvData, UI512PainterCvDataAndPatterns } from '../../ui512/draw/ui512DrawPaint.js';

/**
 * serialize an image to a string
 * 
 * create a long string of ascii characters 0,1,2,
 * one character for each pixel in the image.
 * then run lz to compress the string to binary data.
 */
export class UI512ImageSerialization {
    readonly asciiBlack = clrBlack.toString().charAt(0);
    readonly asciiWhite = clrWhite.toString().charAt(0);
    readonly asciiTransp = clrTransp.toString().charAt(0);
    readonly asciiNumBlack = clrBlack.toString().charCodeAt(0);
    readonly asciiNumWhite = clrWhite.toString().charCodeAt(0);
    readonly asciiNumTransp = clrTransp.toString().charCodeAt(0);

    loadFromString(canvas: CanvasWrapper, compressed: string) {
        const w = canvas.canvas.width;
        const h = canvas.canvas.height;
        if (compressed.length === 0) {
            /* treat empty string as an empty white image. */
            canvas.fillRect(0, 0, w, h, 0, 0, w, h, 'white');
            return;
        }

        let data = canvas.context.createImageData(w, h);
        assertEq(data.data.length, 4 * w * h, '2{|');
        let uncompressed = UI512Compress.decompressString(compressed);
        if (uncompressed.length * 4 !== data.data.length) {
            let loc = window.location.href;
            if (scontains(loc, 'U3ZcVJ')) {
                console.error('length mismatch, expected, got' + data.data.length + 'wanted' + uncompressed.length * 4);
                console.error('not throwing due to special stack.');
                return;
            }
        }

        checkThrowUI512(
            uncompressed.length * 4 === data.data.length,
            'length mismatch, expected, got',
            data.data.length,
            uncompressed.length * 4
        );

        let paint = new UI512PainterCvData(data.data, w, h);
        let i = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let pixel = uncompressed.charCodeAt(i);
                paint.setPixel(x, y, pixel - this.asciiNumBlack);
                i++;
            }
        }

        canvas.context.putImageData(data, 0, 0);
    }

    writeToString(canvas: CanvasWrapper) {
        const w = canvas.canvas.width;
        const h = canvas.canvas.height;
        let data = canvas.context.getImageData(0, 0, w, h);
        return this.writeToStringFromData(data.data, w, h);
    }

    writeToStringFromData(data: Uint8ClampedArray, w: number, h: number) {
        assertEq(data.length, 4 * w * h, '2`|');
        let reader = new UI512PainterCvData(data, w, h);
        let result = '';
        let map: { [key: number]: string } = {};
        map[clrBlack] = this.asciiBlack;
        map[clrWhite] = this.asciiWhite;
        map[clrTransp] = this.asciiTransp;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let clr = reader.readPixel(x, y);
                result += map[clr];
            }
        }

        return UI512Compress.compressString(result);
    }
}

/**
 * painted shapes supported
 */
export enum PaintOntoCanvasShapes {
    __isUI512Enum = 1,
    SmearPencil,
    SmearRectangle,
    SmearSmallBrush,
    SmearSpraycan,
    ShapeLine,
    ShapeRectangle,
    ShapeElipse,
    ShapeRoundRect,
    ShapeCurve,
    Bucket,
    IrregularPolygon,
}

/**
 * high-level interface for painting a shape on a canvas
 */
export class PaintOntoCanvas {
    mods: ModifierKeys;
    cardId: string;
    constructor(
        public shape: PaintOntoCanvasShapes,
        public xPts: number[],
        public yPts: number[],
        public color: number,
        public fillColor: number,
        public isFilled = true,
        public lineSize = 1
    ) {}

    /**
     * get arguments based on flags
     */
    static fromMemoryOpts(
        shape: PaintOntoCanvasShapes,
        isErase: boolean,
        fromOptsPattern: string,
        fromOptsFillcolor: number,
        fromOptsLineColor: number,
        fromOptsWide: boolean
    ) {
        let fill = fromOptsFillcolor;
        let isFilled = fromOptsFillcolor !== -1;
        if (shape === PaintOntoCanvasShapes.Bucket) {
            let pattern = fromOptsPattern;
            isFilled = true;
            fill = 0;
            if (pattern.startsWith('pattern')) {
                let npattern = parseInt(pattern.substr('pattern'.length), base10);
                fill = isFinite(npattern) ? npattern : 0;
            }
        }

        let ret = new PaintOntoCanvas(shape, [], [], fromOptsLineColor, fill, isFilled, fromOptsWide ? 5 : 1);
        if (isErase) {
            ret.color = clrWhite;
            ret.fillColor = clrWhite;
            ret.isFilled = true;
        }

        return ret;
    }

    /**
     * apply paint onto canvas
     */
    static go(args: PaintOntoCanvas, painter: UI512Painter) {
        let color: number = args.color;
        let fill: O<number> = args.isFilled ? simplifyPattern(args.fillColor) : undefined;
        if (args.shape !== PaintOntoCanvasShapes.Bucket) {
            assertTrue(
                !needsPatternSupport(color) && !needsPatternSupport(fill),
                'not yet implemented (currently kinda slow when tested)'
            );
        }

        let xPts = args.xPts;
        let yPts = args.yPts;
        switch (args.shape) {
            case PaintOntoCanvasShapes.SmearPencil: {
                return painter.publicSmearPencil(xPts, yPts, color);
            }
            case PaintOntoCanvasShapes.SmearRectangle: {
                return painter.publicSmearRectangle(xPts, yPts, color, 16, 16);
            }
            case PaintOntoCanvasShapes.SmearSpraycan: {
                return painter.publicSmearSpraycan(xPts, yPts, color);
            }
            case PaintOntoCanvasShapes.SmearSmallBrush: {
                return painter.publicSmearSmallBrush(xPts, yPts, color);
            }
            case PaintOntoCanvasShapes.IrregularPolygon: {
                return painter.fillPolygon(0,0,painter.getCanvasWidth(), painter.getCanvasHeight(), xPts, yPts, color)
            }
            case PaintOntoCanvasShapes.ShapeLine: {
                assertEq(2, xPts.length, 'ShapeLine');
                assertEq(2, yPts.length, 'ShapeLine');
                return painter.publicStraightLine(xPts[0], yPts[0], xPts[1], yPts[1], color, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeRectangle: {
                assertEq(2, xPts.length, 'ShapeRectangle');
                assertEq(2, yPts.length, 'ShapeRectangle');
                return painter.publicRectangle(xPts[0], yPts[0], xPts[1], yPts[1], color, fill, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeElipse: {
                assertEq(2, xPts.length, 'ShapeElipse');
                assertEq(2, yPts.length, 'ShapeElipse');
                return painter.publicPlotEllipse(xPts[0], yPts[0], xPts[1], yPts[1], color, fill, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeRoundRect: {
                assertEq(2, xPts.length, 'ShapeRoundRect');
                assertEq(2, yPts.length, 'ShapeRoundRect');
                return painter.publicRoundRect(xPts[0], yPts[0], xPts[1], yPts[1], color, fill, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeCurve: {
                assertEq(3, xPts.length, 'ShapeCurve');
                assertEq(3, yPts.length, 'ShapeCurve');
                return painter.publicCurve(xPts[0], yPts[0], xPts[1], yPts[1], xPts[2], yPts[2], color, args.lineSize);
            }
            case PaintOntoCanvasShapes.Bucket: {
                assertEq(1, xPts.length, 'Bucket');
                assertEq(1, yPts.length, 'Bucket');
                return PaintOntoCanvas.paintBucketSlowButWorks(painter, xPts[0], yPts[0], fill || 0);
            }
            default: {
                assertTrueWarn(false, 'unknown shape', args.shape);
            }
        }
    }

    /**
     * the other shapes work against either a canvas or against raw data
     * this one needs to be against raw data, so might need to call getImageData.
     */
    static paintBucketSlowButWorks(painter: UI512Painter, x: number, y: number, fillPattern: number) {
        fillPattern = simplifyPattern(fillPattern);
        if (painter.readPixelSupported()) {
            painter.floodFill(x, y, fillPattern);
        } else {
            /* unfortunately, we'll have to make a new painter that supports reading pixels */
            let cv: CanvasWrapper = painter.getBackingSurface();
            assertTrue(cv instanceof CanvasWrapper, 'cv instanceof CanvasWrapper');
            const w = cv.canvas.width;
            const h = cv.canvas.height;
            let data = cv.context.getImageData(0, 0, w, h);

            let painterWithData = new UI512PainterCvDataAndPatterns(data.data, w, h)
            painterWithData.floodFill(x, y, fillPattern);
            cv.context.putImageData(data, 0, 0);
        }
    }
}
