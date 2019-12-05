
/* auto */ import { VpcOutsideImpl } from './../state/vpcOutsideImpl';
/* auto */ import { VpcStateInterface, VpcUILayer } from './../state/vpcInterface';
/* auto */ import { PaintGifExport } from './vpcGifExport';
/* auto */ import { VpcElCard } from './../../vpc/vel/velCard';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { O } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, cast } from './../../ui512/utils/util512';
/* auto */ import { UI512PresenterBase } from './../../ui512/presentation/ui512PresenterBase';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { UI512ImageSerialization } from './../../ui512/draw/ui512ImageSerialization';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512ElCanvasPiece } from './../../ui512/elements/ui512ElementCanvasPiece';
/* auto */ import { clrWhite } from './../../ui512/draw/ui512DrawPatterns';
/* auto */ import { UI512Painter } from './../../ui512/draw/ui512DrawPainterClasses';
/* auto */ import { UI512PainterCvCanvas } from './../../ui512/draw/ui512DrawPainter';
/* auto */ import { UI512PaintDispatch, UI512PaintDispatchShapes } from './../../ui512/draw/ui512DrawPaintDispatch';

/**
 * drawing paint to the canvas
 *
 * draws the main background paint for the card,
 * also, draws the temporary shapes while the user is clicking/dragging to paint,
 * which will later be committed to the background paint
 */
export class VpcPaintRender extends VpcUILayer {
    vci: VpcStateInterface;
    canvasesByCardId = new MapKeyToObjectCanSet<[string, CanvasWrapper]>();
    canvasesForPainting: CanvasWrapper[] = [];
    paintGrp: UI512ElGroup;
    userPaintW = -1;
    userPaintH = -1;
    constructor() {
        super();
    }

    /**
     * create our ui512element group
     */
    init(pr: UI512PresenterBase) {
        this.userPaintW = this.vci.userBounds()[2];
        this.userPaintH = this.vci.userBounds()[3];
        this.paintGrp = new UI512ElGroup('VpcPaintRender');
        this.vci.UI512App().addGroup(this.paintGrp);
        this.makeAndAddFullsizeEl('VpcModelRender$$renderbg');
    }

    /**
     * we paint onto a hidden canvas, and
     * use a UI512ElCanvasPiece to draw a piece of this canvas onto the main canvas
     */
    updateUI512Els(): void {
        let mainPaint = cast(
            this.vci.UI512App().getEl('VpcModelRender$$renderbg'),
            UI512ElCanvasPiece
        );
        let currentCardId = this.vci.getModel().productOpts.getS('currentCardId');
        let [currentlyCachedV, currentlyCachedIm] = this.refreshCachedPaintForCard(
            currentCardId
        );
        mainPaint.setCanvas(currentlyCachedIm);
    }

    /**
     * make a full-size canvas piece
     */
    makeAndAddFullsizeEl(id: string) {
        let el = new UI512ElCanvasPiece(id);
        this.paintGrp.addElement(this.vci.UI512App(), el);
        el.set('x', this.vci.userBounds()[0]);
        el.set('y', this.vci.userBounds()[1]);
        el.set('w', this.vci.userBounds()[2]);
        el.set('h', this.vci.userBounds()[3]);
        return el;
    }

    /**
     * refresh cached paint for the card
     */
    refreshCachedPaintForCard(cardId: string) {
        let cd = this.vci.getModel().getById(cardId, VpcElCard);
        let currentVersion = cd.getS('paint');
        let currentlyCached = this.canvasesByCardId.find(cardId);

        if (!currentlyCached) {
            currentlyCached = [
                '(placeholder)',
                CanvasWrapper.createMemoryCanvas(this.userPaintW, this.userPaintH)
            ];
            this.canvasesByCardId.set(cardId, currentlyCached);
        }

        if (currentlyCached[0] !== currentVersion) {
            let worker = new UI512ImageSerialization();
            currentlyCached[0] = currentVersion;
            worker.loadFromString(currentlyCached[1], cd.getS('paint'));
        }

        return currentlyCached;
    }

    /**
     * release objects that we're no longer using
     */
    doMaintenance() {
        let keys = this.canvasesByCardId.getKeys().slice();
        for (let cardId of keys) {
            if (!this.vci.getModel().findById(cardId, VpcElCard)) {
                this.canvasesByCardId.remove(cardId);
            }
        }
    }

    /**
     * clear all temporary paint elements
     */
    deleteTempPaintEls() {
        let mainPaint = this.vci.UI512App().getEl('VpcModelRender$$renderbg');
        this.paintGrp.removeAllEls();
        this.paintGrp.addElement(this.vci.UI512App(), mainPaint);
    }

    /**
     * get the main background paint hidden canvas piece
     */
    getMainBg(): UI512ElCanvasPiece {
        return cast(
            this.vci.UI512App().getEl('VpcModelRender$$renderbg'),
            UI512ElCanvasPiece
        );
    }

    /**
     * get one of our cached temporary canvases, create if necessary
     */
    getTemporaryCanvas(n: number, w = -1, h = -1) {
        if (w === -1 || h === -1) {
            w = this.userPaintW;
            h = this.userPaintH;
        }

        if (this.canvasesForPainting[n] === undefined) {
            this.canvasesForPainting[n] = CanvasWrapper.createMemoryCanvas(w, h);
        }

        if (
            this.canvasesForPainting[n].canvas.width !== w ||
            this.canvasesForPainting[n].canvas.height !== h
        ) {
            this.canvasesForPainting[n].resizeAndClear(w, h);
        }

        this.canvasesForPainting[n].clear();
        return this.canvasesForPainting[n];
    }

    /**
     * comit moving a rectangle
     */
    commitRectangleMove(
        incoming: CanvasWrapper,
        offsetX: number,
        offsetY: number,
        x: number,
        y: number,
        w: number,
        h: number
    ) {
        this.commitPaintOps((mainCanvas, painter) => {
            let argsMask = new UI512PaintDispatch(
                UI512PaintDispatchShapes.ShapeRectangle,
                [x, x + w],
                [y, y + h],
                clrWhite,
                clrWhite,
                true,
                1
            );
            UI512PaintDispatch.go(argsMask, painter);
            mainCanvas.drawFromImage(
                incoming.canvas,
                0,
                0,
                incoming.canvas.width,
                incoming.canvas.height,
                offsetX,
                offsetY,
                0,
                0,
                mainCanvas.canvas.width,
                mainCanvas.canvas.height
            );
        });
    }

    /**
     * commit deleting a rectangle
     */
    commitRectangleDelete(x: number, y: number, w: number, h: number) {
        this.commitPaintOps((mainCanvas, painter) => {
            let argsMask = new UI512PaintDispatch(
                UI512PaintDispatchShapes.ShapeRectangle,
                [x, x + w],
                [y, y + h],
                clrWhite,
                clrWhite,
                true,
                1
            );
            UI512PaintDispatch.go(argsMask, painter);
        });
    }

    /**
     * commit paint bucket (floodfill)
     */
    commitPaintBucket(x: number, y: number) {
        this.commitPaintOps((mainCanvas, painter) => {
            let args = this.argsFromCurrentOptions([x], [y]);
            UI512PaintDispatch.go(args, painter);
        });
    }

    /**
     * commit one or more drawing images onto an image
     */
    commitImageOntoImage(incoming: CanvasWrapper[], offsetX: number, offsetY: number) {
        this.commitPaintOps((mainCanvas, painter) => {
            for (let i = 0, len = incoming.length; i < len; i++) {
                let im = incoming[i];
                mainCanvas.drawFromImage(
                    im.canvas,
                    0,
                    0,
                    im.canvas.width,
                    im.canvas.height,
                    offsetX,
                    offsetY,
                    0,
                    0,
                    mainCanvas.canvas.width,
                    mainCanvas.canvas.height
                );
            }
        });
    }

    /**
     * commit an html image onto an image
     */
    commitHtmlImageOntoImage(
        im: HTMLImageElement,
        offsetX: number,
        offsetY: number,
        srcw: number,
        srch: number
    ) {
        this.commitPaintOps((mainCanvas, painter) => {
            mainCanvas.drawFromImage(
                im,
                0,
                0,
                srcw,
                srch,
                offsetX,
                offsetY,
                0,
                0,
                mainCanvas.canvas.width,
                mainCanvas.canvas.height
            );
        });
    }

    /**
     * draw a "smear" (pencil/brush/etc tool)
     */
    drawPartialSmear(
        xPts: number[],
        yPts: number[],
        elPiece: O<UI512ElCanvasPiece>,
        painter: UI512Painter,
        setShape?: UI512PaintDispatchShapes
    ) {
        let args = this.argsFromCurrentOptions(xPts, yPts);
        if (setShape) {
            args.shape = setShape;
        }

        UI512PaintDispatch.go(args, painter);
        if (elPiece) {
            elPiece.getCanvasForWrite();
        }
    }

    /**
     * draw a "shape" (oval/rectangle/etc tool)
     */
    drawPartialShape(
        xPts: number[],
        yPts: number[],
        elPiece: UI512ElCanvasPiece,
        painter: UI512Painter
    ) {
        elPiece.getCanvasForWrite();
        return this.drawPartialSmear(xPts, yPts, elPiece, painter);
    }

    /**
     * get a UI512PaintDispatch object
     */
    protected argsFromCurrentOptions(xPts: number[], yPts: number[]) {
        let outside = new VpcOutsideImpl();
        outside.vci = this.vci;
        let args = outside.MakeUI512PaintDispatchFromCurrentOptions(
            true,
            ModifierKeys.None
        );
        args.xPts = xPts;
        args.yPts = yPts;
        return args;
    }

    /**
     * commit paint operations
     * (writes a serialized copy of the paint data to the card vel, for undoability)
     * slower than it needs to be, since it doesn't need to be deserialized, but
     * it's also nice to know that everything that was serialized works
     */
    protected commitPaintOps(fn: (mainCanvas: CanvasWrapper, pnt: UI512Painter) => void) {
        /* make sure we have the latest paint */
        this.updateUI512Els();
        let mainCanvas = this.getMainBg().getCanvasForWrite();
        let painter = new UI512PainterCvCanvas(
            mainCanvas,
            mainCanvas.canvas.width,
            mainCanvas.canvas.height
        );
        fn(mainCanvas, painter);
        let serialized = new UI512ImageSerialization().writeToString(mainCanvas);
        let currentCardId = this.vci.getModel().productOpts.getS('currentCardId');
        let currentCard = this.vci.getModel().getById(currentCardId, VpcElCard);
        currentCard.set('paint', serialized);
    }

    /**
     * commit simulated paint actions
     */
    commitSimulatedClicks(queue: UI512PaintDispatch[]) {
        let currentCard = '';
        let queuesPerCard: UI512PaintDispatch[][] = [];
        for (let item of queue) {
            if (item.cardId === currentCard) {
                queuesPerCard[queuesPerCard.length - 1].push(item);
            } else {
                queuesPerCard.push([]);
                queuesPerCard[queuesPerCard.length - 1].push(item);
                currentCard = item.cardId;
            }
        }

        for (let queuePerCard of queuesPerCard) {
            let cd = this.vci.getModel().getById(queuePerCard[0].cardId, VpcElCard);
            let [v, cvs] = this.refreshCachedPaintForCard(cd.id);
            let painter = new UI512PainterCvCanvas(
                cvs,
                cvs.canvas.width,
                cvs.canvas.height
            );

            for (let item of queuePerCard) {
                UI512PaintDispatch.go(item, painter);
            }

            let serialized = new UI512ImageSerialization().writeToString(cvs);
            cd.set('paint', serialized);
        }
    }

    /**
     * export to gif
     */
    paintExportToGif(pr: UI512Presenter, speed: number) {
        let gif = new PaintGifExport(this.vci, cardId =>
            this.refreshCachedPaintForCard(cardId)
        );
        gif.begin(speed);
    }
}
