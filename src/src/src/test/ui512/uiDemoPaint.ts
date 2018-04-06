
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, Util512, assertEq, cast, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ScreenConsts, getUI512WindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { clrBlack, clrWhite } from '../../ui512/draw/ui512drawpattern.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512drawpaintclasses.js';
/* auto */ import { UI512PainterCvCanvas, UI512PainterCvData, UI512PainterCvDataAndPatterns } from '../../ui512/draw/ui512drawpaint.js';
/* auto */ import { PaintOntoCanvas, PaintOntoCanvasShapes, UI512ImageSerialization } from '../../ui512/draw/ui512imageserialize.js';
/* auto */ import { IconInfo } from '../../ui512/draw/ui512drawiconclasses.js';
/* auto */ import { RenderIconManager } from '../../ui512/draw/ui512drawicon.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512elementsgroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { GridLayout, UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512elementsbutton.js';
/* auto */ import { UI512ElCanvasPiece } from '../../ui512/elements/ui512elementscanvaspiece.js';
/* auto */ import { IdleEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { addDefaultListeners } from '../../ui512/textedit/ui512textevents.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512presenter.js';

class UI512TestPaintController extends UI512Controller {
    testFillRect: CanvasWrapper;
    testSetPixel: CanvasWrapper;
    testSetPixelSupportingPattern: CanvasWrapper;
    testDeserialize: CanvasWrapper;
    public init() {
        super.init();
        addDefaultListeners(this.listeners);
    }

    runTest() {}
}

export class UI512DemoPaint extends UI512TestPaintController {
    test = new TestDrawUI512Paint();
    fltest = new FloodFillTest();
    mouseDragDropOffset: [number, number] = [0, 0];

    public init() {
        super.init();
        addDefaultListeners(this.listeners);

        let clientrect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientrect, this);
        this.inited = true;
        this.test.addElements(this, clientrect);
        this.test.uicontext = true;

        let grp = this.app.getGroup('grp');

        let testBtns = ['RunTest', 'DldImage', 'RunTestFill', 'DldImageFill', 'TestDrag'];
        let layoutTestBtns = new GridLayout(clientrect[0] + 10, clientrect[1] + 330, 100, 15, testBtns, [1], 5, 5);
        layoutTestBtns.createElems(this.app, grp, 'btn', UI512ElButton, () => {}, true, true);

        let elfloodtest = new UI512ElCanvasPiece('elfloodtest');
        grp.addElement(this.app, elfloodtest);
        elfloodtest.setCanvas(this.fltest.start());
        elfloodtest.setDimensions(700, 50, elfloodtest.getCvWidth(), elfloodtest.getCvHeight());

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseDown, UI512DemoPaint.respondMouseDown);
        this.listenEvent(UI512EventType.MouseUp, UI512DemoPaint.respondMouseUp);
        this.listenEvent(UI512EventType.MouseMove, UI512DemoPaint.respondMouseMove);
        this.listenEvent(UI512EventType.Idle, UI512DemoPaint.respondOnIdle);
        this.rebuildFieldScrollbars();
    }

    private static respondMouseDown(c: UI512DemoPaint, d: MouseDownEventDetails) {
        if (d.el && d.button === 0) {
            if (d.el.id === 'btnTestDrag') {
                assertEq('btnTestDrag', c.trackClickedIds[0], '1U|');
                c.beginDragDrop(d.mouseX, d.mouseY, d.el);
            }
        }
    }

    private static respondMouseUp(c: UI512DemoPaint, d: MouseUpEventDetails) {
        if (d.elClick && d.button === 0) {
            if (d.elClick.id === 'btnDldImage') {
                c.test.runtestShape(true);
            } else if (d.elClick.id === 'btnRunTest') {
                c.test.runtestShape(false);
            } else if (d.elClick.id === 'btnDldImageFill') {
                c.test.runtestFloodFill(true);
            } else if (d.elClick.id === 'btnRunTestFill') {
                c.test.runtestFloodFill(false);
            }
        }

        c.mouseDragDropOffset = [0, 0];
    }

    private static respondOnIdle(c: UI512DemoPaint, d: IdleEventDetails) {
        if (!c.fltest.isdone) {
            let grp = c.app.getGroup('grp');
            let elfloodtest = cast(grp.getEl('elfloodtest'), UI512ElCanvasPiece);
            c.fltest.floodFillTest(elfloodtest.getCanvasForWrite());
        }
    }

    beginDragDrop(x: number, y: number, el: UI512Element) {
        this.mouseDragDropOffset = [x - el.x, y - el.y];
        this.mouseDragStatus = MouseDragStatusDemoPaint.DragAndDrop;
    }

    static respondMouseMove(c: UI512DemoPaint, d: MouseMoveEventDetails) {
        if (c.mouseDragStatus === MouseDragStatusDemoPaint.DragAndDrop && c.trackPressedBtns[0]) {
            let el = c.app.findElemById(c.trackClickedIds[0]);
            if (el) {
                let newx = d.mouseX - c.mouseDragDropOffset[0];
                let newy = d.mouseY - c.mouseDragDropOffset[1];
                el.setDimensions(newx, newy, el.w, el.h);
            }
        }
    }
}

enum MouseDragStatusDemoPaint {
    __isUI512Enum = 1,
    None,
    ScrollArrow,
    SelectingText,
    DragAndDrop, // newly added value
}

class FloodFillTest {
    readonly columns = [true, true, true, true, true];
    readonly iconnumbers = [33, 85, 170];
    readonly layout = new GridLayout(0, 0, 32, 32, this.columns, this.iconnumbers, 5, 5);

    isdone = false;
    start() {
        return CanvasWrapper.createMemoryCanvas(this.layout.getTotalWidth(), this.layout.getTotalHeight());
    }

    floodFillTest(canvas: CanvasWrapper) {
        let iconManager = cast(getRoot().getIconManager(), RenderIconManager);
        let readyToLoad = true;
        this.layout.combinations((n, _, iconnumber, bnds) => {
            let info = new IconInfo('002', iconnumber);
            let icon = iconManager.findIcon(info.iconsetid, info.iconnumber);
            if (!icon) {
                readyToLoad = false;
                return;
            }

            icon.drawIntoBox(canvas, info, bnds[0], bnds[1], bnds[2], bnds[3]);
        });

        if (!readyToLoad) {
            return;
        }

        let imdata = canvas.context.getImageData(0, 0, canvas.canvas.width, canvas.canvas.height);
        let painter = new UI512PainterCvDataAndPatterns(imdata.data, canvas.canvas.width, canvas.canvas.height);
        const xspace = this.layout.getColWidth();

        // floodfill black onto black
        painter.floodFill(2, 18, clrBlack);
        painter.floodFill(16, 53, clrBlack);
        painter.floodFill(20, 96, clrBlack);

        // floodfill white onto white
        painter.floodFill(56, 9, clrWhite);
        painter.floodFill(52, 45, clrWhite);
        painter.floodFill(52, 90, clrWhite);

        // floodfill black onto white
        painter.floodFill(56 + xspace, 9, clrBlack);
        painter.floodFill(52 + xspace, 45, clrBlack);
        painter.floodFill(52 + xspace, 90, clrBlack);

        // floodfill white onto black
        painter.floodFill(2 + 3 * xspace, 18, clrWhite);
        painter.floodFill(16 + 3 * xspace, 53, clrWhite);
        painter.floodFill(20 + 3 * xspace, 96, clrWhite);

        // floodfill with pattern
        painter.floodFill(166, 14, 108);
        painter.floodFill(163, 53, 108);
        painter.floodFill(163, 91, 108);

        canvas.context.putImageData(imdata, 0, 0);
        this.isdone = true;
    }
}

export class TestDrawUI512Paint extends UI512TestBase {
    uicontext = false;
    tests = [
        'callback/Test Shape',
        (callback: Function) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawShape(), callback);
        },
        'callback/Test Flood Fill',
        (callback: Function) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawFloodFill(), callback);
        },
    ];

    runtestFloodFill(dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawFloodFill());
    }

    runtestShape(dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawShape());
    }

    protected drawShapes(painter: UI512Painter, w: number, h: number) {
        painter.higherPlotEllipse(0, 0, w - 5, h - 5, clrBlack, undefined, 1);
        painter.higherRoundRect(0, 0, w / 2, h / 2, clrBlack, clrWhite, 1);
        painter.higherRectangle(w / 2, h / 2, w / 2 + w / 2, h / 2 + h / 2, clrBlack, undefined, 1);
    }

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
        let canvases = [testFillRect, testSetPixel, testSetPixelSupportingPattern, testDeserialize];

        // test 1: uses fillrect, probably faster than setpixel
        let painter: UI512Painter = new UI512PainterCvCanvas(testFillRect, w, h);
        this.drawShapes(painter, w, h);

        // test 2: uses low-level setpixel
        let arr1 = testSetPixel.context.createImageData(w, h);
        painter = new UI512PainterCvData(arr1.data, w, h);
        this.drawShapes(painter, w, h);
        testSetPixel.context.putImageData(arr1, 0, 0);

        // test 3: uses low-level setpixel, supporting patterns
        let arr2 = testSetPixelSupportingPattern.context.createImageData(w, h);
        painter = new UI512PainterCvDataAndPatterns(arr2.data, w, h);
        this.drawShapes(painter, w, h);
        testSetPixelSupportingPattern.context.putImageData(arr2, 0, 0);

        // test 4: serialize image to a string and round trip it
        let worker = new UI512ImageSerialization();
        let serialized = worker.writeToString(testFillRect);
        assertTrue(serialized.length < w * h, '');
        let deserialized = worker.loadFromString(testDeserialize, serialized);

        // show these on the screen
        let layoutshapes = new GridLayout(610, 50, w, h, [0], canvases, 5, 5);
        layoutshapes.combinations((n, unused, whichCanvas, bnds) => {
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
        let pnt = new PaintOntoCanvas(
            PaintOntoCanvasShapes.IrregularPolygon,
            polygonX,
            polygonY,
            clrBlack,
            clrBlack,
            true
        );
        PaintOntoCanvas.go(pnt, mainPainter);
    }

    protected drawBlackRectangle(
        mainPaint: CanvasWrapper,
        mainPainter: UI512Painter,
        x: number,
        y: number,
        w: number,
        h: number
    ) {
        let pnt = new PaintOntoCanvas(
            PaintOntoCanvasShapes.ShapeRectangle,
            [x, x + w],
            [y, y + h],
            clrBlack,
            clrBlack,
            true
        );
        PaintOntoCanvas.go(pnt, mainPainter);
    }

    protected testSmears(
        app: UI512Application,
        grp: UI512ElGroup,
        mainPaint: CanvasWrapper,
        mainPainter: UI512Painter
    ) {
        let colors = [clrWhite, clrBlack];
        let types = [
            PaintOntoCanvasShapes.SmearPencil,
            PaintOntoCanvasShapes.SmearRectangle,
            PaintOntoCanvasShapes.SmearSmallBrush,
            PaintOntoCanvasShapes.SmearSpraycan,
        ];

        let layoutshapes = new GridLayout(50, 50, 90, 70, colors, types, 5, 5);
        layoutshapes.combinations((n, color, type, bnds) => {
            if (color === clrWhite) {
                this.drawBlackRectangle(mainPaint, mainPainter, bnds[0], bnds[1], bnds[2], bnds[3]);
            }

            // draw a smear
            let [polygonX, polygonY] = this.getIrregularPolygon(bnds[0], bnds[1], bnds[2], bnds[3]);
            let pnt = new PaintOntoCanvas(type, polygonX, polygonY, color, 0);
            PaintOntoCanvas.go(pnt, mainPainter);

            // drawing a smear with 0 points should be a no-op
            pnt = new PaintOntoCanvas(type, [], [], color, 0);
            PaintOntoCanvas.go(pnt, mainPainter);

            // drawing a smear with 1 point should still appear
            pnt = new PaintOntoCanvas(type, [bnds[0] + bnds[2] - 5], [bnds[1] + bnds[3] - 5], color, 0);
            PaintOntoCanvas.go(pnt, mainPainter);
        });
    }

    protected testShapes(
        app: UI512Application,
        grp: UI512ElGroup,
        mainPaint: CanvasWrapper,
        mainPainter: UI512Painter
    ) {
        let linecolors = [clrWhite, clrBlack, clrBlack, clrBlack];
        let fillcolors: O<number>[] = [clrBlack, clrBlack, undefined, clrWhite];
        let linesizes = [1, 1, 1, 5];

        let types = [
            PaintOntoCanvasShapes.ShapeLine,
            PaintOntoCanvasShapes.ShapeRectangle,
            PaintOntoCanvasShapes.ShapeElipse,
            PaintOntoCanvasShapes.ShapeRoundRect,
            PaintOntoCanvasShapes.ShapeCurve,
        ];

        let layoutshapes = new GridLayout(270, 50, 80, 60, Util512.range(linecolors.length), types, 5, 5);
        layoutshapes.combinations((n, column, type, bnds) => {
            let linecolor = linecolors[column];
            let fillcolor = fillcolors[column];
            let linesize = linesizes[column];
            if (linecolor === clrWhite) {
                this.drawBlackRectangle(mainPaint, mainPainter, bnds[0] - 5, bnds[1] - 5, bnds[2] + 10, bnds[3] + 10);
            }

            let pnt = new PaintOntoCanvas(
                type,
                [],
                [],
                linecolor,
                fillcolor !== undefined ? fillcolor : 0,
                fillcolor !== undefined,
                linesize
            );
            if (type === PaintOntoCanvasShapes.ShapeCurve) {
                pnt.xpts = [bnds[0], bnds[0] + Math.floor(bnds[2] / 2), bnds[0] + bnds[2]];
                pnt.ypts = [bnds[1], bnds[1] + Math.floor(bnds[3] / 8), bnds[1] + bnds[3]];
            } else {
                pnt.xpts = [bnds[0], bnds[0] + bnds[2]];
                pnt.ypts = [bnds[1], bnds[1] + bnds[3]];
            }

            PaintOntoCanvas.go(pnt, mainPainter);
        });
    }

    protected getIrregularPolygon(x: number, y: number, w: number, h: number) {
        let xpts = [x, x + w, x, x, x + Math.floor(w / 2)];
        let ypts = [y, y + Math.floor(h / 2), y + h, y + Math.floor(h / 2), y + Math.floor(h / 2)];
        return [xpts, ypts];
    }

    addElements(c: UI512Controller, bounds: number[]) {
        let grp = new UI512ElGroup('grp');
        c.app.addGroup(grp);

        // draw bg
        let layoutPatternBg = new GridLayout(0, 0, 68, 68, Util512.range(20), Util512.range(20), 30, 30);
        let bg = new UI512ElButton('bg');
        grp.addElement(c.app, bg);
        bg.set('style', UI512BtnStyle.opaque);
        bg.setDimensions(bounds[0], bounds[1], bounds[2], bounds[3]);
        bg.set('autohighlight', false);
        layoutPatternBg.createElems(c.app, grp, 'bgGrid', UI512ElButton, () => {});

        let canvasMainPaint = new UI512ElCanvasPiece('canvasMainPaint');
        grp.addElement(c.app, canvasMainPaint);
        let cvmain = CanvasWrapper.createMemoryCanvas(bounds[2], bounds[3]);
        canvasMainPaint.setCanvas(cvmain);
        canvasMainPaint.setDimensions(0, 0, bounds[2], bounds[3]);
        cvmain.clear();
        let canvasMainPainter = new UI512PainterCvCanvas(cvmain, cvmain.canvas.width, cvmain.canvas.height);

        this.testSmears(c.app, grp, cvmain, canvasMainPainter);
        this.testShapes(c.app, grp, cvmain, canvasMainPainter);
        this.testSetPixelAndSerialize(c.app, grp, cvmain, canvasMainPainter);
        this.testIrregularPoly(c.app, grp, cvmain, canvasMainPainter);
        c.rebuildFieldScrollbars();
    }

    drawTestCase(

        testnumber: number,
        tmpCanvas: CanvasWrapper,
        w: number,
        h: number,
        i: number,
        complete: RenderComplete
    ) {
        tmpCanvas.clear();
        let testc = new UI512TestPaintController();
        testc.init();
        testc.inited = true;
        testc.app = new UI512Application([0, 0, w, h], testc);
        this.addElements(testc, testc.app.bounds);
        tmpCanvas.clear();

        if (!complete.complete) {
            // we're not loaded yet, let's wait until later
            return;
        }

        testc.needRedraw = true;
        testc.render(tmpCanvas, 1, complete);
    }

    testDrawShape() {
        const w = 928;
        const h = 400;
        const screensToDraw = 1;
        assertEq(w, ScreenConsts.screenwidth, '1T|');
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

        const totalh = h * screensToDraw;
        return new CanvasTestParams(
            'drawpaintshape',
            '/resources/test/drawpaintshapeexpected.png',
            draw,
            w,
            totalh,
            this.uicontext
        );
    }

    testDrawFloodFill() {
        let floodfilltest = new FloodFillTest();
        let canvasUnused = floodfilltest.start();
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            floodfilltest.floodFillTest(canvas);
            complete.complete = floodfilltest.isdone;
        };

        return new CanvasTestParams(
            'drawpaintflood',
            '/resources/test/drawpaintfloodexpected.png',
            draw,
            floodfilltest.layout.getTotalWidth(),
            floodfilltest.layout.getTotalHeight(),
            this.uicontext
        );
    }
}
