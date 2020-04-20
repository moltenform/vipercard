
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { RenderComplete } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, assertEq } from './../../ui512/utils/util512';
/* auto */ import { addDefaultListeners } from './../../ui512/textedit/ui512TextEvents';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { UI512ImageSerialization } from './../../ui512/draw/ui512ImageSerialization';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512ElCanvasPiece } from './../../ui512/elements/ui512ElementCanvasPiece';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { GridLayout, UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { clrBlack, clrWhite } from './../../ui512/draw/ui512DrawPatterns';
/* auto */ import { UI512Painter } from './../../ui512/draw/ui512DrawPainterClasses';
/* auto */ import { UI512PainterCvCanvas, UI512PainterCvData, UI512PainterCvDataAndPatterns } from './../../ui512/draw/ui512DrawPainter';
/* auto */ import { UI512PaintDispatch, UI512PaintDispatchShapes } from './../../ui512/draw/ui512DrawPaintDispatch';
/* auto */ import { CanvasTestParams, TestUtilsCanvas } from './../testUtils/testUtilsCanvas';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { FloodFillTest } from './testUI512PaintFlood';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * TestDrawUI512Paint
 *
 * A "demo" project showing several painted shapes.
 *
 * 1) tests use this project to compare against a known good screenshot,
 * to make sure rendering has not changed
 * 2) you can start this project in _rootUI512.ts_
 * (uncomment the line referencing _UI512DemoPaint_), and test drag/drop,
 * and click Download Image to update the test
 */

let t = new SimpleUtil512TestCollection('testCollectionUI512Paint');
export let testCollectionUI512Paint = t;

t.atest('Test Shape', () =>
    TestUtilsCanvas.RenderAndCompareImages(false, () =>
        new TestDrawUI512Paint().testDrawShape()
    )
);
t.atest('Test Flood Fill', () =>
    TestUtilsCanvas.RenderAndCompareImages(false, () =>
        new TestDrawUI512Paint().testDrawFloodFill()
    )
);

/**
 * a test layout showing drawing features
 */
export class TestDrawUI512Paint {
    uiContext = false;

    protected testSetPixelAndSerialize(
        app: UI512Application,
        grp: UI512ElGroup,
        mainPaint: CanvasWrapper,
        mainPainter: UI512Painter
    ) {
        const w = 80;
        const h = 60;
        let testFillRect = CanvasWrapper.createMemoryCanvas(w, h);
        let testSetPixel = CanvasWrapper.createMemoryCanvas(w, h);
        let testSetPixelSupportingPattern = CanvasWrapper.createMemoryCanvas(w, h);
        let testDeserialize = CanvasWrapper.createMemoryCanvas(w, h);
        let canvases = [
            testFillRect,
            testSetPixel,
            testSetPixelSupportingPattern,
            testDeserialize
        ];

        /* test 1: uses fillRect, probably faster than setpixel */
        let painter: UI512Painter = new UI512PainterCvCanvas(testFillRect, w, h);
        this.drawShapes(painter, w, h);

        /* test 2: uses low-level setpixel */
        let arr1 = testSetPixel.context.createImageData(w, h);
        painter = new UI512PainterCvData(arr1.data, w, h);
        this.drawShapes(painter, w, h);
        testSetPixel.context.putImageData(arr1, 0, 0);

        /* test 3: uses low-level setpixel, supporting patterns */
        let arr2 = testSetPixelSupportingPattern.context.createImageData(w, h);
        painter = new UI512PainterCvDataAndPatterns(arr2.data, w, h);
        this.drawShapes(painter, w, h);
        testSetPixelSupportingPattern.context.putImageData(arr2, 0, 0);

        /* test 4: serialize image to a string and round trip it */
        let worker = new UI512ImageSerialization();
        let serialized = worker.writeToString(testFillRect);
        assertTrue(serialized.length < w * h, 'Bz|');
        worker.loadFromString(testDeserialize, serialized);

        /* show these on the screen */
        let layout = new GridLayout(610, 50, w, h, [0], canvases, 5, 5);
        layout.combinations((n, unused, whichCanvas, bnds) => {
            let el = new UI512ElCanvasPiece(`setPixelAndSerialize${n}`);
            grp.addElement(app, el);
            el.setDimensions(bnds[0], bnds[1], bnds[2], bnds[3]);
            el.setCanvas(whichCanvas);
        });
    }

    protected testIrregularPoly(
        app: UI512Application,
        grp: UI512ElGroup,
        mainPaint: CanvasWrapper,
        mainPainter: UI512Painter
    ) {
        let [polygonX, polygonY] = this.getIrregularPolygon(610, 310, 80, 60);
        let pnt = new UI512PaintDispatch(
            UI512PaintDispatchShapes.IrregularPolygon,
            polygonX,
            polygonY,
            clrBlack,
            clrBlack,
            true
        );

        UI512PaintDispatch.go(pnt, mainPainter);
    }

    protected drawBlackRectangle(
        mainPaint: CanvasWrapper,
        mainPainter: UI512Painter,
        x: number,
        y: number,
        w: number,
        h: number
    ) {
        let pnt = new UI512PaintDispatch(
            UI512PaintDispatchShapes.ShapeRectangle,
            [x, x + w],
            [y, y + h],
            clrBlack,
            clrBlack,
            true
        );

        UI512PaintDispatch.go(pnt, mainPainter);
    }

    protected testSmears(
        app: UI512Application,
        grp: UI512ElGroup,
        mainPaint: CanvasWrapper,
        mainPainter: UI512Painter
    ) {
        let colors = [clrWhite, clrBlack];
        let types = [
            UI512PaintDispatchShapes.SmearPencil,
            UI512PaintDispatchShapes.SmearRectangle,
            UI512PaintDispatchShapes.SmearSmallBrush,
            UI512PaintDispatchShapes.SmearSpraycan
        ];

        let layout = new GridLayout(50, 50, 90, 70, colors, types, 5, 5);
        layout.combinations((n, color, type, bnds) => {
            if (color === clrWhite) {
                this.drawBlackRectangle(
                    mainPaint,
                    mainPainter,
                    bnds[0],
                    bnds[1],
                    bnds[2],
                    bnds[3]
                );
            }

            /* draw a smear */
            let [polygonX, polygonY] = this.getIrregularPolygon(
                bnds[0],
                bnds[1],
                bnds[2],
                bnds[3]
            );
            let pnt = new UI512PaintDispatch(type, polygonX, polygonY, color, 0);
            UI512PaintDispatch.go(pnt, mainPainter);

            /* drawing a smear with 0 points should be a no-op */
            pnt = new UI512PaintDispatch(type, [], [], color, 0);
            UI512PaintDispatch.go(pnt, mainPainter);

            /* drawing a smear with 1 point should still appear */
            pnt = new UI512PaintDispatch(
                type,
                [bnds[0] + bnds[2] - 5],
                [bnds[1] + bnds[3] - 5],
                color,
                0
            );
            UI512PaintDispatch.go(pnt, mainPainter);
        });
    }

    protected drawShapes(painter: UI512Painter, w: number, h: number) {
        painter.publicPlotEllipse(0, 0, w - 5, h - 5, clrBlack, undefined, 1);
        painter.publicRoundRect(0, 0, w / 2, h / 2, clrBlack, clrWhite, 1);
        painter.publicRectangle(
            w / 2,
            h / 2,
            w / 2 + w / 2,
            h / 2 + h / 2,
            clrBlack,
            undefined,
            1
        );
    }

    protected testShapes(
        app: UI512Application,
        grp: UI512ElGroup,
        mainPaint: CanvasWrapper,
        mainPainter: UI512Painter
    ) {
        let lineColors = [clrWhite, clrBlack, clrBlack, clrBlack];
        let fillColors: O<number>[] = [clrBlack, clrBlack, undefined, clrWhite];
        let lineSizes = [1, 1, 1, 5];

        let types = [
            UI512PaintDispatchShapes.ShapeLine,
            UI512PaintDispatchShapes.ShapeRectangle,
            UI512PaintDispatchShapes.ShapeEllipse,
            UI512PaintDispatchShapes.ShapeRoundRect,
            UI512PaintDispatchShapes.ShapeCurve
        ];

        let layout = new GridLayout(
            270,
            50,
            80,
            60,
            Util512.range(0, lineColors.length),
            types,
            5,
            5
        );
        layout.combinations((n, column: any, type, bnds) => {
            let lineColor = lineColors[column];
            let fillColor = fillColors[column];
            let lineSize = lineSizes[column];
            if (lineColor === clrWhite) {
                this.drawBlackRectangle(
                    mainPaint,
                    mainPainter,
                    bnds[0] - 5,
                    bnds[1] - 5,
                    bnds[2] + 10,
                    bnds[3] + 10
                );
            }

            let pnt = new UI512PaintDispatch(
                type,
                [],
                [],
                lineColor,
                fillColor !== undefined ? fillColor : 0,
                fillColor !== undefined,
                lineSize
            );
            if (type === UI512PaintDispatchShapes.ShapeCurve) {
                pnt.xPts = [
                    bnds[0],
                    bnds[0] + Math.floor(bnds[2] / 2),
                    bnds[0] + bnds[2]
                ];
                pnt.yPts = [
                    bnds[1],
                    bnds[1] + Math.floor(bnds[3] / 8),
                    bnds[1] + bnds[3]
                ];
            } else {
                pnt.xPts = [bnds[0], bnds[0] + bnds[2]];
                pnt.yPts = [bnds[1], bnds[1] + bnds[3]];
            }

            UI512PaintDispatch.go(pnt, mainPainter);
        });
    }

    protected getIrregularPolygon(x: number, y: number, w: number, h: number) {
        let xPts = [x, x + w, x, x, x + Math.floor(w / 2)];
        let yPts = [
            y,
            y + Math.floor(h / 2),
            y + h,
            y + Math.floor(h / 2),
            y + Math.floor(h / 2)
        ];
        return [xPts, yPts];
    }

    addElements(pr: UI512Presenter, bounds: number[]) {
        let grp = new UI512ElGroup('grp');
        pr.app.addGroup(grp);

        /* draw bg */
        let layoutPatternBg = new GridLayout(
            0,
            0,
            68,
            68,
            Util512.range(0, 20),
            Util512.range(0, 20),
            30,
            30
        );
        let bg = new UI512ElButton('bg');
        grp.addElement(pr.app, bg);
        bg.set('style', UI512BtnStyle.Opaque);
        bg.setDimensions(bounds[0], bounds[1], bounds[2], bounds[3]);
        bg.set('autohighlight', false);
        layoutPatternBg.createElems(pr.app, grp, 'bgGrid', UI512ElButton, () => {});

        /* draw a 'canvaspiece' element that shows a piece of the canvas */
        let canvasMainPaint = new UI512ElCanvasPiece('canvasMainPaint');
        grp.addElement(pr.app, canvasMainPaint);
        let cvmain = CanvasWrapper.createMemoryCanvas(bounds[2], bounds[3]);
        canvasMainPaint.setCanvas(cvmain);
        canvasMainPaint.setDimensions(0, 0, bounds[2], bounds[3]);
        cvmain.clear();
        let canvasMainPainter = new UI512PainterCvCanvas(
            cvmain,
            cvmain.canvas.width,
            cvmain.canvas.height
        );

        /* run tests; drawing shapes onto the canvas */
        this.testSmears(pr.app, grp, cvmain, canvasMainPainter);
        this.testShapes(pr.app, grp, cvmain, canvasMainPainter);
        this.testSetPixelAndSerialize(pr.app, grp, cvmain, canvasMainPainter);
        this.testIrregularPoly(pr.app, grp, cvmain, canvasMainPainter);
        pr.rebuildFieldScrollbars();
    }

    drawTestCase(
        testNumber: number,
        tmpCanvas: CanvasWrapper,
        w: number,
        h: number,
        i: number,
        complete: RenderComplete
    ) {
        tmpCanvas.clear();
        let testPr = new UI512TestPaintPresenter();
        testPr.init();
        testPr.inited = true;
        testPr.app = new UI512Application([0, 0, w, h], testPr);
        this.addElements(testPr, testPr.app.bounds);
        tmpCanvas.clear();

        if (!complete.complete) {
            /* we're not loaded yet, let's wait until later */
            return;
        }

        testPr.needRedraw = true;
        testPr.render(tmpCanvas, 1, complete);
    }

    testDrawShape() {
        const w = 928;
        const h = 400;
        const screensToDraw = 1;
        assertEq(w, ScreenConsts.ScreenWidth, '1T|');
        let tmpCanvasDom = window.document.createElement('canvas');
        tmpCanvasDom.width = w;
        tmpCanvasDom.height = h;
        let tmpCanvas = new CanvasWrapper(tmpCanvasDom);

        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = true;
            for (let i = 0; i < screensToDraw; i++) {
                this.drawTestCase(i, tmpCanvas, w, h, i, complete);
                let dest = [0, i * h, w, h];
                canvas.drawFromImage(
                    tmpCanvas.canvas,
                    0,
                    0,
                    w,
                    h,
                    dest[0],
                    dest[1],
                    dest[0],
                    dest[1],
                    dest[2],
                    dest[3]
                );
            }
        };

        const totalH = h * screensToDraw;
        return new CanvasTestParams(
            'drawpaintshape',
            '/resources/test/drawpaintshapeexpected.png',
            draw,
            w,
            totalH,
            this.uiContext
        );
    }

    testDrawFloodFill() {
        let floodfilltest = new FloodFillTest();
        floodfilltest.start();
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            floodfilltest.floodFillTest(canvas);
            complete.complete = floodfilltest.isDone;
        };

        return new CanvasTestParams(
            'drawpaintflood',
            '/resources/test/drawpaintfloodexpected.png',
            draw,
            floodfilltest.layout.getTotalWidth(),
            floodfilltest.layout.getTotalHeight(),
            this.uiContext
        );
    }
}

/**
 * nearly-empty presenter, driven by tests to take a screenshot of rendered elements
 */
export class UI512TestPaintPresenter extends UI512Presenter {
    testFillRect: CanvasWrapper;
    testSetPixel: CanvasWrapper;
    testSetPixelSupportingPattern: CanvasWrapper;
    testDeserialize: CanvasWrapper;
    init() {
        super.init();
        addDefaultListeners(this.listeners);
    }
}
