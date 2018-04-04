
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObjectCanSet, Root, cast } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { clrWhite } from '../../ui512/draw/ui512drawpattern.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512drawpaintclasses.js';
/* auto */ import { UI512PainterCvCanvas } from '../../ui512/draw/ui512drawpaint.js';
/* auto */ import { PaintOntoCanvas, PaintOntoCanvasShapes, UI512ImageSerialization } from '../../ui512/draw/ui512imageserialize.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512elementsgroup.js';
/* auto */ import { UI512ElCanvasPiece } from '../../ui512/elements/ui512elementscanvaspiece.js';
/* auto */ import { UI512ControllerBase } from '../../ui512/presentation/ui512presenterbase.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512presenter.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velcard.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcappli.js';
/* auto */ import { VpcOutsideWorld } from '../../vpcui/state/vpcfulloutside.js';
/* auto */ import { PaintExportToGif } from '../../vpcui/modelrender/vpcgifexport.js';

export abstract class VpcAppInterfaceLayer {
    appli: IVpcStateInterface;
    abstract init(c: UI512ControllerBase): void;
    abstract updateUI512Els(root: Root): void;
}

export class VpcPaintRender extends VpcAppInterfaceLayer {
    appli: IVpcStateInterface;
    canvasesByCardid = new MapKeyToObjectCanSet<[string, CanvasWrapper]>();
    canvasesForPainting: CanvasWrapper[] = [];
    paintgrp: UI512ElGroup;
    userPaintW = -1;
    userPaintH = -1;
    constructor() {
        super();
    }

    init(c: UI512ControllerBase) {
        this.userPaintW = this.appli.userBounds()[2];
        this.userPaintH = this.appli.userBounds()[3];
        this.paintgrp = new UI512ElGroup('VpcPaintRender');
        this.appli.UI512App().addGroup(this.paintgrp);
        this.makeAndAddFullsizeEl('VpcModelRender$$renderbg');
    }

    updateUI512Els(root: Root): void {
        this.updateUI512ElsImpl();
    }

    updateUI512ElsImpl(): void {
        let mainPaint = cast(this.appli.UI512App().getElemById('VpcModelRender$$renderbg'), UI512ElCanvasPiece);
        let currentCardId = this.appli.getModel().productOpts.get_s('currentCardId');
        let [currentlyCachedV, currentlyCachedIm] = this.refreshCachedPaintForCard(currentCardId);
        mainPaint.setCanvas(currentlyCachedIm);
        this.doMaintenance();
    }

    makeAndAddFullsizeEl(id: string) {
        let el = new UI512ElCanvasPiece(id);
        this.paintgrp.addElement(this.appli.UI512App(), el);
        el.set('x', this.appli.userBounds()[0]);
        el.set('y', this.appli.userBounds()[1]);
        el.set('w', this.appli.userBounds()[2]);
        el.set('h', this.appli.userBounds()[3]);
        return el;
    }

    refreshCachedPaintForCard(cdid: string) {
        let cd = this.appli.getModel().getById(cdid, VpcElCard);
        let currentVersion = cd.get_s('paint');
        let currentlyCached = this.canvasesByCardid.find(cdid);

        if (!currentlyCached) {
            currentlyCached = ['(placeholder)', CanvasWrapper.createMemoryCanvas(this.userPaintW, this.userPaintH)];
            this.canvasesByCardid.set(cdid, currentlyCached);
        }

        if (currentlyCached[0] !== currentVersion) {
            let worker = new UI512ImageSerialization();
            currentlyCached[0] = currentVersion;
            worker.loadFromString(currentlyCached[1], cd.get_s('paint'));
        }

        return currentlyCached;
    }

    doMaintenance() {
        // do maintenence/cleanup to recover memory
        let keys = this.canvasesByCardid.getKeys().slice();
        for (let cdid of keys) {
            if (!this.appli.getModel().findById(cdid, VpcElCard)) {
                this.canvasesByCardid.remove(cdid);
            }
        }
    }

    deleteTempPaintEls() {
        let mainPaint = this.appli.UI512App().getElemById('VpcModelRender$$renderbg');
        this.paintgrp.removeAllEls();
        this.paintgrp.addElement(this.appli.UI512App(), mainPaint);
    }

    getMainBg(): UI512ElCanvasPiece {
        return cast(this.appli.UI512App().getElemById('VpcModelRender$$renderbg'), UI512ElCanvasPiece);
    }

    getTemporaryCanvas(n: number, w = -1, h = -1) {
        if (w === -1 || h === -1) {
            w = this.userPaintW;
            h = this.userPaintH;
        }

        n -= 1;
        if (this.canvasesForPainting[n] === undefined) {
            this.canvasesForPainting[n] = CanvasWrapper.createMemoryCanvas(w, h);
        }

        if (this.canvasesForPainting[n].canvas.width !== w || this.canvasesForPainting[n].canvas.height !== h) {
            this.canvasesForPainting[n].resizeAndClear(w, h);
        }

        this.canvasesForPainting[n].clear();
        return this.canvasesForPainting[n];
    }

    commitRectangleMove(
        incoming: CanvasWrapper,
        offsetx: number,
        offsety: number,
        x: number,
        y: number,
        w: number,
        h: number
    ) {
        this.commitPaintOps((mainCanvas, painter) => {
            let argsMask = new PaintOntoCanvas(
                PaintOntoCanvasShapes.ShapeRectangle,
                [x, x + w],
                [y, y + h],
                clrWhite,
                clrWhite,
                true,
                1
            );
            PaintOntoCanvas.go(argsMask, painter);
            mainCanvas.drawFromImage(
                incoming.canvas,
                0,
                0,
                incoming.canvas.width,
                incoming.canvas.height,
                offsetx,
                offsety,
                0,
                0,
                mainCanvas.canvas.width,
                mainCanvas.canvas.height
            );
        });
    }

    commitRectangleDelete(x: number, y: number, w: number, h: number) {
        this.commitPaintOps((mainCanvas, painter) => {
            let argsMask = new PaintOntoCanvas(
                PaintOntoCanvasShapes.ShapeRectangle,
                [x, x + w],
                [y, y + h],
                clrWhite,
                clrWhite,
                true,
                1
            );
            PaintOntoCanvas.go(argsMask, painter);
        });
    }

    commitPaintBucket(x: number, y: number) {
        this.commitPaintOps((mainCanvas, painter) => {
            let args = this.argsFromCurrentOptions([x], [y]);
            PaintOntoCanvas.go(args, painter);
        });
    }

    commitImageOntoImage(incoming: CanvasWrapper[], offsetx: number, offsety: number) {
        this.commitPaintOps((mainCanvas, painter) => {
            for (let im of incoming) {
                mainCanvas.drawFromImage(
                    im.canvas,
                    0,
                    0,
                    im.canvas.width,
                    im.canvas.height,
                    offsetx,
                    offsety,
                    0,
                    0,
                    mainCanvas.canvas.width,
                    mainCanvas.canvas.height
                );
            }
        });
    }

    commitHtmlImageOntoImage(im: HTMLImageElement, offsetx: number, offsety: number, srcw: number, srch: number) {
        this.commitPaintOps((mainCanvas, painter) => {
            mainCanvas.drawFromImage(
                im,
                0,
                0,
                srcw,
                srch,
                offsetx,
                offsety,
                0,
                0,
                mainCanvas.canvas.width,
                mainCanvas.canvas.height
            );
        });
    }

    drawPartialSmear(
        xpts: number[],
        ypts: number[],
        elPiece: O<UI512ElCanvasPiece>,
        painter: UI512Painter,
        setShape?: PaintOntoCanvasShapes
    ) {
        let args = this.argsFromCurrentOptions(xpts, ypts);
        if (setShape) {
            args.shape = setShape;
        }
        PaintOntoCanvas.go(args, painter);
        if (elPiece) {
            elPiece.getCanvasForWrite();
        }
    }

    drawPartialShape(xpts: number[], ypts: number[], elPiece: UI512ElCanvasPiece, painter: UI512Painter) {
        elPiece.getCanvasForWrite();
        return this.drawPartialSmear(xpts, ypts, elPiece, painter);
    }

    protected argsFromCurrentOptions(xpts: number[], ypts: number[]) {
        let outside = new VpcOutsideWorld(this.appli.lang());
        outside.appli = this.appli;
        let args = outside.paintOptionsFromCurrentOptions(true, ModifierKeys.None);
        args.xpts = xpts;
        args.ypts = ypts;
        return args;
    }

    protected commitPaintOps(fn: (mainCanvas: CanvasWrapper, pnt: UI512Painter) => void) {
        // make sure we have the latest paint
        this.updateUI512ElsImpl();
        let mainCanvas = this.getMainBg().getCanvasForWrite();
        let painter = new UI512PainterCvCanvas(mainCanvas, mainCanvas.canvas.width, mainCanvas.canvas.height);
        fn(mainCanvas, painter);
        let serialized = new UI512ImageSerialization().writeToString(mainCanvas);
        let currentCardId = this.appli.getModel().productOpts.get_s('currentCardId');
        let currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
        currentCard.set('paint', serialized);
    }

    commitSimulatedClicks(queue: PaintOntoCanvas[]) {
        let curCard = '';
        let queuesPerCard: PaintOntoCanvas[][] = [];
        for (let item of queue) {
            if (item.cardId === curCard) {
                queuesPerCard[queuesPerCard.length - 1].push(item);
            } else {
                queuesPerCard.push([]);
                queuesPerCard[queuesPerCard.length - 1].push(item);
                curCard = item.cardId;
            }
        }

        for (let queuePerCard of queuesPerCard) {
            let cd = this.appli.getModel().getById(queuePerCard[0].cardId, VpcElCard);
            let [v, cvs] = this.refreshCachedPaintForCard(cd.id);
            let painter = new UI512PainterCvCanvas(cvs, cvs.canvas.width, cvs.canvas.height);

            for (let item of queuePerCard) {
                PaintOntoCanvas.go(item, painter);
            }

            let serialized = new UI512ImageSerialization().writeToString(cvs);
            cd.set('paint', serialized);
        }
    }

    paintExportToGif(c: UI512Controller, speed: number) {
        let gif = new PaintExportToGif(this.appli, cdid => this.refreshCachedPaintForCard(cdid));
        gif.begin(speed);
    }
}
