
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper, RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { largearea } from '../../ui512/draw/ui512drawtextclasses.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512drawpaintclasses.js';
/* auto */ import { UI512PainterCvCanvas } from '../../ui512/draw/ui512drawpaint.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512ElCanvasPiece } from '../../ui512/elements/ui512elementscanvaspiece.js';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcAppUIToolResponseBase } from '../../vpcui/tools/vpctoolbase.js';

export enum SelectToolMode {
    SelectingRegion,
    SelectedRegion,
    MovingRegion,
}

export class SelectToolState {
    mode: SelectToolMode;
    isCopy = false;
    isCopyMult = false;
    rawstartX = -1;
    rawstartY = -1;
    startX = -1;
    startY = -1;
    minX = largearea;
    minY = largearea;
    maxX = -largearea;
    maxY = -largearea;
    topPtX = 0;
    topPtY = largearea;
    rectx = 0;
    recty = 0;
    recordxpts: number[];
    recordypts: number[];

    offsetForMoveX = 0;
    offsetForMoveY = 0;
    cvPiece: CanvasWrapper; // the piece being pasted

    elMask: UI512ElCanvasPiece;
    elStage: UI512ElCanvasPiece;
    elBorder: UI512ElCanvasPiece;
    elPlaceholderForCursor: UI512ElCanvasPiece;
}

export abstract class VpcAppUIGeneralSelect extends VpcAppUIToolResponseBase {
    state: O<SelectToolState>;
    respondMouseDown(root: Root, tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg && !(d.el && d.el.id.endsWith('UiSelectElPlaceholderForCursor'))) {
            return;
        }
        let tmousex =
            fitIntoInclusive(
                d.mouseX,
                this.appli.userBounds()[0],
                this.appli.userBounds()[0] + this.appli.userBounds()[2] - 1
            ) - this.appli.userBounds()[0];
        let tmousey =
            fitIntoInclusive(
                d.mouseY,
                this.appli.userBounds()[1],
                this.appli.userBounds()[1] + this.appli.userBounds()[3] - 1
            ) - this.appli.userBounds()[1];
        if (!this.state) {
            this.cbPaintRender().deleteTempPaintEls();
            let state = new SelectToolState();
            state.elMask = this.cbPaintRender().makeAndAddFullsizeEl('UiSelectElMask');
            state.elStage = this.cbPaintRender().makeAndAddFullsizeEl('UiSelectElStage');
            state.elBorder = this.cbPaintRender().makeAndAddFullsizeEl('UiSelectElBorder');
            state.elPlaceholderForCursor = this.cbPaintRender().makeAndAddFullsizeEl('UiSelectElPlaceholderForCursor');
            state.elMask.transparentToClicks = true;
            state.elStage.transparentToClicks = true;
            state.elBorder.transparentToClicks = true;

            state.elStage.setCanvas(this.cbPaintRender().getTemporaryCanvas(1));
            state.elStage.setCachedPnter(
                new UI512PainterCvCanvas(
                    state.elStage.getCanvasForWrite(),
                    state.elStage.getCvWidth(),
                    state.elStage.getCvHeight()
                )
            );

            state.rawstartX = d.mouseX;
            state.rawstartY = d.mouseY;
            state.startX = tmousex;
            state.startY = tmousey;
            state.recordxpts = [];
            state.recordypts = [];
            state.mode = SelectToolMode.SelectingRegion;
            this.state = state;

            // draw where the user clicked. needed to get the right minx and miny
            this.respondMouseMove(root, tl, new MouseMoveEventDetails(0, d.mouseX, d.mouseY, d.mouseX, d.mouseY), true);
        } else if (this.state && this.state.mode === SelectToolMode.SelectedRegion) {
            if (
                RectUtils.hasPoint(
                    d.mouseX,
                    d.mouseY,
                    this.state.elBorder.x,
                    this.state.elBorder.y,
                    this.state.elBorder.w,
                    this.state.elBorder.h
                )
            ) {
                this.state.offsetForMoveX = d.mouseX - this.state.elBorder.x;
                this.state.offsetForMoveY = d.mouseY - this.state.elBorder.y;
                this.state.elBorder.set('visible', false);
                this.state.isCopyMult = (d.mods & ModifierKeys.Opt) !== 0;
                this.state.isCopy = this.state.isCopyMult || (d.mods & ModifierKeys.Cmd) !== 0;
                this.state.elMask.set('visible', !this.state.isCopy);
                this.state.mode = SelectToolMode.MovingRegion;
            } else {
                this.onLeaveTool(root);
                this.onOpenTool();
            }
        }
    }

    respondMouseMove(root: Root, tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {
        let tmousepx =
            fitIntoInclusive(
                d.prevMouseX,
                this.appli.userBounds()[0],
                this.appli.userBounds()[0] + this.appli.userBounds()[2] - 1
            ) - this.appli.userBounds()[0];
        let tmousepy =
            fitIntoInclusive(
                d.prevMouseY,
                this.appli.userBounds()[1],
                this.appli.userBounds()[1] + this.appli.userBounds()[3] - 1
            ) - this.appli.userBounds()[1];
        let tmousenx =
            fitIntoInclusive(
                d.mouseX,
                this.appli.userBounds()[0],
                this.appli.userBounds()[0] + this.appli.userBounds()[2] - 1
            ) - this.appli.userBounds()[0];
        let tmouseny =
            fitIntoInclusive(
                d.mouseY,
                this.appli.userBounds()[1],
                this.appli.userBounds()[1] + this.appli.userBounds()[3] - 1
            ) - this.appli.userBounds()[1];

        if (this.state && this.state.mode === SelectToolMode.SelectingRegion) {
            if (!isVelOrBg && !(d.elNext && d.elNext.id.endsWith('UiSelectElPlaceholderForCursor'))) {
                return;
            }
            this.selectingDrawTheBorder(
                this.state,
                this.state.elStage.getCanvasForWrite(),
                this.state.elStage.getCachedPnterForWrite(),
                tmousepx,
                tmousepy,
                tmousenx,
                tmouseny
            );
            this.state.maxX = Math.max(this.state.maxX, tmousenx);
            this.state.minX = Math.min(this.state.minX, tmousenx);
            this.state.maxY = Math.max(this.state.maxY, tmouseny);
            this.state.minY = Math.min(this.state.minY, tmouseny);
            if (tmouseny < this.state.topPtY) {
                this.state.topPtX = tmousenx;
                this.state.topPtY = tmouseny;
            }
        } else if (this.state && this.state.mode === SelectToolMode.MovingRegion) {
            /*let rawRectx = this.state.rectx + this.appli.userBounds()[0]
            let rawRecty = this.state.recty + this.appli.userBounds()[1]
            let dx = tmousenx - this.state.offsetForMoveX
            let dy = tmouseny - this.state.offsetForMoveY*/
            if (!this.state.isCopyMult) {
                this.state.elStage.getCanvasForWrite().clear();
            }

            let newx = tmousenx - this.state.rectx - this.state.offsetForMoveX;
            let newy = tmouseny - this.state.recty - this.state.offsetForMoveY;

            this.state.elStage
                .getCanvasForWrite()
                .drawFromImage(
                    this.state.cvPiece.canvas,
                    0,
                    0,
                    this.state.cvPiece.canvas.width,
                    this.state.cvPiece.canvas.height,
                    newx,
                    newy,
                    0,
                    0,
                    this.state.elStage.getCvWidth(),
                    this.state.elStage.getCvHeight()
                );
            this.state.elBorder.set('x', newx + this.state.rectx + this.appli.userBounds()[0]);
            this.state.elBorder.set('y', newy + this.state.recty + this.appli.userBounds()[1]);
            this.state.elPlaceholderForCursor.set('x', this.state.elBorder.x);
            this.state.elPlaceholderForCursor.set('y', this.state.elBorder.y);
        }
    }

    respondMouseUp(root: Root, tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        let tmousex =
            fitIntoInclusive(
                d.mouseX,
                this.appli.userBounds()[0],
                this.appli.userBounds()[0] + this.appli.userBounds()[2] - 1
            ) - this.appli.userBounds()[0];
        let tmousey =
            fitIntoInclusive(
                d.mouseY,
                this.appli.userBounds()[1],
                this.appli.userBounds()[1] + this.appli.userBounds()[3] - 1
            ) - this.appli.userBounds()[1];
        if (this.state && this.state.mode === SelectToolMode.SelectingRegion) {
            // if lasso, close the loop
            if (tl === VpcTool.lasso) {
                this.respondMouseMove(
                    root,
                    tl,
                    new MouseMoveEventDetails(0, d.mouseX, d.mouseY, this.state.rawstartX, this.state.rawstartY),
                    true
                );
            }

            if (this.checkTooSmall()) {
                // haven't yet tested case where selection is small.
                this.onLeaveTool(root);
                this.onOpenTool();
                return;
            }

            let rectx = this.state.minX;
            let recty = this.state.minY;
            let rectw = this.state.maxX - this.state.minX;
            let recth = this.state.maxY - this.state.minY;

            // make mask.
            this.state.elMask.setCanvas(this.cbPaintRender().getTemporaryCanvas(2));

            // copy what we have sketched as the border to "border". note that elBorder is smaller than the page.
            this.state.elBorder.setDimensions(
                rectx + this.appli.userBounds()[0],
                recty + this.appli.userBounds()[1],
                rectw,
                recth
            );
            this.state.elBorder.setCanvas(this.cbPaintRender().getTemporaryCanvas(3, rectw, recth));
            this.state.elBorder
                .getCanvasForWrite()
                .drawFromImage(
                    this.state.elStage.getCanvasForWrite().canvas,
                    rectx,
                    recty,
                    rectw,
                    recth,
                    0,
                    0,
                    0,
                    0,
                    this.state.elBorder.getCvWidth(),
                    this.state.elBorder.getCvHeight()
                );
            this.state.elPlaceholderForCursor.setDimensions(
                this.state.elBorder.x,
                this.state.elBorder.y,
                this.state.elBorder.w,
                this.state.elBorder.h
            );

            this.makeBlack();

            // make the mask an opaque white outline of the shape
            this.state.elMask
                .getCanvasForWrite()
                .drawFromImage(
                    this.state.elStage.getCanvasForWrite().canvas,
                    rectx,
                    recty,
                    rectw,
                    recth,
                    rectx,
                    recty,
                    0,
                    0,
                    this.state.elMask.getCvWidth(),
                    this.state.elMask.getCvHeight()
                );

            this.state.elMask.getCanvasForWrite().temporarilyChangeCompositeMode('source-in', () => {
                this.state!.elMask.getCanvasForWrite().fillRect(
                    0,
                    0,
                    this.state!.elMask.getCvWidth(),
                    this.state!.elMask.getCvHeight(),
                    0,
                    0,
                    this.state!.elMask.getCvWidth(),
                    this.state!.elMask.getCvHeight(),
                    'white'
                );
            });

            // make cvPiece equal to cvMask
            this.state.cvPiece = this.cbPaintRender().getTemporaryCanvas(4);
            this.state.cvPiece.drawFromImage(
                this.state.elMask.getCanvasForWrite().canvas,
                0,
                0,
                this.state.elMask.getCvWidth(),
                this.state.elMask.getCvHeight(),
                0,
                0,
                0,
                0,
                this.state.cvPiece.canvas.width,
                this.state.cvPiece.canvas.height
            );

            // make cvPiece a cut-out of the main bg
            let basePaint = this.cbPaintRender().getMainBg();
            this.state.cvPiece.temporarilyChangeCompositeMode('source-in', () => {
                this.state!.cvPiece.drawFromImage(
                    basePaint.getCanvasForWrite().canvas,
                    0,
                    0,
                    basePaint.getCvWidth(),
                    basePaint.getCvHeight(),
                    0,
                    0,
                    0,
                    0,
                    this.state!.cvPiece.canvas.width,
                    this.state!.cvPiece.canvas.height
                );
            });

            // clear stage, draw piece on stage
            this.state.elStage.getCanvasForWrite().clear();
            this.state.elStage
                .getCanvasForWrite()
                .drawFromImage(
                    this.state.cvPiece.canvas,
                    0,
                    0,
                    this.state.cvPiece.canvas.width,
                    this.state.cvPiece.canvas.height,
                    0,
                    0,
                    0,
                    0,
                    this.state.elStage.getCvWidth(),
                    this.state.elStage.getCvHeight()
                );
            this.state.rectx = rectx;
            this.state.recty = recty;
            this.state.mode = SelectToolMode.SelectedRegion;
        } else if (this.state && this.state.mode === SelectToolMode.MovingRegion) {
            this.state.mode = SelectToolMode.SelectedRegion;
        }

        this.appli.causeUIRedraw(); // will refresh cursor
    }

    onDeleteSelection() {
        if (this.state && this.state.mode === SelectToolMode.SelectedRegion) {
            this.cbPaintRender().commitImageOntoImage([this.state.elMask.getCanvasForWrite()], 0, 0);
            this.cbPaintRender().deleteTempPaintEls();
            this.state = undefined;
        }
    }

    onOpenTool() {
        this.state = undefined;
        this.cbPaintRender().deleteTempPaintEls();
    }

    onLeaveTool(root: Root) {
        this.applyMove();
        this.cancelCurrentToolAction();
    }

    applyMove() {
        if (this.state) {
            if (this.state.elMask.getCanvasForWrite()) {
                let basePaint = this.cbPaintRender().getMainBg();
                let incoming = this.state.isCopy
                    ? [this.state.elStage.getCanvasForWrite()]
                    : [this.state.elMask.getCanvasForWrite(), this.state.elStage.getCanvasForWrite()];
                this.cbPaintRender().commitImageOntoImage(incoming, 0, 0);
            }

            this.cbPaintRender().deleteTempPaintEls();
            this.state = undefined;
        }
    }

    cancelCurrentToolAction(): void {
        this.state = undefined;
        this.cbPaintRender().deleteTempPaintEls();
    }

    whichCursor(tl: VpcTool, el: O<UI512Element>) {
        if (
            this.state &&
            (this.state.mode === SelectToolMode.SelectedRegion || this.state.mode === SelectToolMode.MovingRegion) &&
            el &&
            el.id.endsWith('PlaceholderForCursor')
        ) {
            return UI512Cursors.arrow;
        } else {
            return UI512Cursors.crosshair;
        }
    }

    blinkSelection() {
        if (
            (this.appli.getTool() === VpcTool.select || this.appli.getTool() === VpcTool.lasso) &&
            this.state &&
            this.state.mode === SelectToolMode.SelectedRegion
        ) {
            this.state.elBorder.set('visible', !this.state.elBorder.visible);
        }
    }

    protected abstract selectingDrawTheBorder(
        st: SelectToolState,
        cv: CanvasWrapper,
        painter: UI512Painter,
        tmousepx: number,
        tmousepy: number,
        tmousenx: number,
        tmouseny: number
    ): void;
    protected abstract checkTooSmall(): boolean;
    protected abstract makeBlack(): void;
}
