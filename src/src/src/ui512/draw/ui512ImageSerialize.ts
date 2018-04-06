
/* auto */ import { O, UI512Compress, assertTrue, assertTrueWarn, checkThrowUI512, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, base10 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { clrBlack, clrTransp, clrWhite, needsPatternSupport, simplifyPattern } from '../../ui512/draw/ui512drawpattern.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512drawpaintclasses.js';
/* auto */ import { UI512PainterCvData, UI512PainterCvDataAndPatterns } from '../../ui512/draw/ui512drawpaint.js';

export class UI512ImageSerialization {
    /*
    Serialization.
    First create a width*height string containing one of the ascii characters 0,1,2
    Then compress this string.
    */
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
            // for convenience, treat empty string as a white image.
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

        let drawer = new UI512PainterCvData(data.data, w, h);
        let i = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let pixel = uncompressed.charCodeAt(i);
                drawer.setPixel(x, y, pixel - this.asciiNumBlack);
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

export class PaintOntoCanvas {
    mods: ModifierKeys;
    cardId: string;
    constructor(
        public shape: PaintOntoCanvasShapes,
        public xpts: number[],
        public ypts: number[],
        public color: number,
        public fillColor: number,
        public isFilled = true,
        public lineSize = 1
    ) {}

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

    static go(args: PaintOntoCanvas, painter: UI512Painter) {
        let color: number = args.color;
        let fillcolor: O<number> = args.isFilled ? simplifyPattern(args.fillColor) : undefined;
        if (args.shape !== PaintOntoCanvasShapes.Bucket) {
            assertTrue(
                !needsPatternSupport(color) && !needsPatternSupport(fillcolor),
                'not yet implemented (currently kinda slow when tested)'
            );
        }

        let xpts = args.xpts;
        let ypts = args.ypts;

        switch (args.shape) {
            case PaintOntoCanvasShapes.SmearPencil: {
                return painter.higherSmearPixels(xpts, ypts, color);
            }
            case PaintOntoCanvasShapes.SmearRectangle: {
                return painter.higherSmearRectangle(xpts, ypts, color, 16, 16);
            }
            case PaintOntoCanvasShapes.SmearSpraycan: {
                return painter.higherSmearSpraycan(xpts, ypts, color);
            }
            case PaintOntoCanvasShapes.SmearSmallBrush: {
                return painter.higherSmearSmallBrush(xpts, ypts, color);
            }
            case PaintOntoCanvasShapes.ShapeLine: {
                assertEq(2, xpts.length, 'ShapeLine');
                assertEq(2, ypts.length, 'ShapeLine');
                return painter.higherStraightLine(xpts[0], ypts[0], xpts[1], ypts[1], color, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeRectangle: {
                assertEq(2, xpts.length, 'ShapeRectangle');
                assertEq(2, ypts.length, 'ShapeRectangle');
                return painter.higherRectangle(xpts[0], ypts[0], xpts[1], ypts[1], color, fillcolor, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeElipse: {
                assertEq(2, xpts.length, 'ShapeElipse');
                assertEq(2, ypts.length, 'ShapeElipse');
                return painter.higherPlotEllipse(xpts[0], ypts[0], xpts[1], ypts[1], color, fillcolor, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeRoundRect: {
                assertEq(2, xpts.length, 'ShapeRoundRect');
                assertEq(2, ypts.length, 'ShapeRoundRect');
                return painter.higherRoundRect(xpts[0], ypts[0], xpts[1], ypts[1], color, fillcolor, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeCurve: {
                assertEq(3, xpts.length, 'ShapeCurve');
                assertEq(3, ypts.length, 'ShapeCurve');
                return painter.higherCurve(xpts[0], ypts[0], xpts[1], ypts[1], xpts[2], ypts[2], color, args.lineSize);
            }
            case PaintOntoCanvasShapes.Bucket: {
                assertEq(1, xpts.length, 'Bucket');
                assertEq(1, ypts.length, 'Bucket');
                return PaintOntoCanvas.paintBucketSlowButWorks(painter, xpts[0], ypts[0], fillcolor || 0);
            }
            case PaintOntoCanvasShapes.IrregularPolygon: {
                return PaintOntoCanvas.paintIrregularPolySlowButWorks(painter, xpts, ypts, fillcolor || 0);
            }
            default: {
                assertTrueWarn(false, 'unknown shape', args.shape);
            }
        }
    }

    static paintIrregularPolySlowButWorks(painter: UI512Painter, xpts: number[], ypts: number[], fillcolor: number) {
        fillcolor = simplifyPattern(fillcolor);
        assertTrue(!needsPatternSupport(fillcolor), 'not yet implemented');
        if (painter.readPixelSupported()) {
            painter.fillPolygon(
                0,
                0,
                painter.getCanvasWidth(),
                painter.getCanvasHeight(),
                xpts,
                ypts,
                fillcolor
            );
        } else {
            // unfortunately, we'll have to make a new painter that supports reading pixels
            let cv: CanvasWrapper = painter.getBackingSurface();
            assertTrue(cv instanceof CanvasWrapper, 'cv instanceof CanvasWrapper');
            const w = cv.canvas.width;
            const h = cv.canvas.height;
            let data = cv.context.getImageData(0, 0, w, h);

            let painterWithData = new UI512PainterCvData(data.data, w, h);
            painterWithData.fillPolygon(0, 0, w, h, xpts, ypts, fillcolor);
            cv.context.putImageData(data, 0, 0);
        }
    }

    static paintBucketSlowButWorks(painter: UI512Painter, x: number, y: number, fillpattern: number) {
        fillpattern = simplifyPattern(fillpattern);
        if (painter.readPixelSupported()) {
            painter.floodFill(x, y, fillpattern);
        } else {
            // unfortunately, we'll have to make a new painter that supports reading pixels
            let cv: CanvasWrapper = painter.getBackingSurface();
            assertTrue(cv instanceof CanvasWrapper, 'cv instanceof CanvasWrapper');
            const w = cv.canvas.width;
            const h = cv.canvas.height;
            let data = cv.context.getImageData(0, 0, w, h);

            let painterWithData =
                fillpattern > 50
                    ? new UI512PainterCvDataAndPatterns(data.data, w, h)
                    : new UI512PainterCvData(data.data, w, h);
            painterWithData.floodFill(x, y, fillpattern);
            cv.context.putImageData(data, 0, 0);
        }
    }
}
