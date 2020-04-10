
/* auto */ import { VpcAppUIToolBase } from './vpcToolBase';
/* auto */ import { VpcTool } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { UI512Cursors } from './../../ui512/utils/utilsCursors';
/* auto */ import { CanvasWrapper, RectUtils } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { O, bool, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElCanvasPiece } from './../../ui512/elements/ui512ElementCanvasPiece';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { largeArea } from './../../ui512/draw/ui512DrawTextClasses';
/* auto */ import { UI512Painter } from './../../ui512/draw/ui512DrawPainterClasses';
/* auto */ import { UI512PainterCvCanvas } from './../../ui512/draw/ui512DrawPainter';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
select tool implementation

create 3 canvaspiece elements:
    "elBorder"
    "elStage"
    "elMask"
    and "elPlaceholderForCursor" which is simply used to tell UI when to show the arrow cursor

first, when the user clicks to drag with lasso tool,
    draw pixels like the pencil tool, drawn to elStage
    record all of the points where the cursor is moved.

when user releases the mouse button,
    follow conventional lasso tool behavior by connecting back to initial click point
    find the smallest bounding rectangle containing all the points drawn (minX, maxX, etc)
    make elPlaceholderForCursor the size of this small rectangle,
    create "elBorder", make it the size of this small rectangle,
    copy what was painted in elStage to elBorder
    clear elStage
    use the recorded points to draw the shape, but opaque and filled-in black, onto elStage
    make elMask an opaque white of the shape - the "hole" that is left behind when you move
    make elPiece a copy of elMask,
    then make elPiece the cut-out piece of the card paint (using source-in trick)
    clear elStage and draw elPiece onto elStage

    now we can draw elMask to be the "hole" left behond and move around elStage.
    to commit the change, simply draw elMask and then elStage onto the card paint.
 */
export abstract class VpcAppUIToolSelectBase extends VpcAppUIToolBase {
    st: O<SelectToolState>;

    /**
     * respond to mouse down event
     */
    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg && !(d.el && d.el.id.endsWith('UiSelectElPlaceholderForCursor'))) {
            return;
        }

        let [tx, ty] = this.getTranslatedCoords(d.mouseX, d.mouseY);
        if (!this.st) {
            /* first click with this tool */
            this.cbPaintRender().deleteTempPaintEls();
            let st = new SelectToolState();
            st.elMask = this.cbPaintRender().makeAndAddFullsizeEl('UiSelectElMask');
            st.elStage = this.cbPaintRender().makeAndAddFullsizeEl('UiSelectElStage');
            st.elBorder = this.cbPaintRender().makeAndAddFullsizeEl('UiSelectElBorder');
            st.elPlaceholderForCursor = this.cbPaintRender().makeAndAddFullsizeEl('UiSelectElPlaceholderForCursor');
            st.elMask.transparentToClicks = true;
            st.elStage.transparentToClicks = true;
            st.elBorder.transparentToClicks = true;
            st.elStage.setCanvas(this.cbPaintRender().getTemporaryCanvas(1));
            st.elStage.setCachedPainter(
                new UI512PainterCvCanvas(st.elStage.getCanvasForWrite(), st.elStage.getCvWidth(), st.elStage.getCvHeight())
            );

            st.rawStartX = d.mouseX;
            st.rawStartY = d.mouseY;
            st.startX = tx;
            st.startY = ty;
            st.recordXpts = [];
            st.recordYpts = [];
            st.mode = SelectToolMode.SelectingRegion;
            this.st = st;

            /* draw where the user clicked. needed to get the right minx and miny */
            this.respondMouseMove(tl, new MouseMoveEventDetails(0, d.mouseX, d.mouseY, d.mouseX, d.mouseY), true);
        } else if (this.st && this.st.mode === SelectToolMode.SelectedRegion) {
            /* there's already a selection. */
            if (
                RectUtils.hasPoint(
                    d.mouseX,
                    d.mouseY,
                    this.st.elBorder.x,
                    this.st.elBorder.y,
                    this.st.elBorder.w,
                    this.st.elBorder.h
                )
            ) {
                /* user clicked in the selection, start moving it */
                this.st.offsetForMoveX = d.mouseX - this.st.elBorder.x;
                this.st.offsetForMoveY = d.mouseY - this.st.elBorder.y;
                this.st.elBorder.set('visible', false);
                this.st.isCopyMult = (d.mods & ModifierKeys.Opt) !== 0;
                this.st.isCopy = bool(this.st.isCopyMult) || bool((d.mods & ModifierKeys.Cmd) !== 0);
                this.st.elMask.set('visible', !this.st.isCopy);
                this.st.mode = SelectToolMode.MovingRegion;
            } else {
                /* user clicked outside of the selection, cancel the selection */
                this.onLeaveTool();
                this.onOpenTool();
            }
        }
    }

    /**
     * respond to mouse move event
     */
    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {
        let [prevX, prevY] = this.getTranslatedCoords(d.prevMouseX, d.prevMouseY);
        let [tnx, tny] = this.getTranslatedCoords(d.mouseX, d.mouseY);

        if (this.st && this.st.mode === SelectToolMode.SelectingRegion) {
            if (!isVelOrBg && !(d.elNext && d.elNext.id.endsWith('UiSelectElPlaceholderForCursor'))) {
                return;
            }

            /* user is dragging the mouse to select */
            this.selectingDrawTheBorder(
                this.st,
                this.st.elStage.getCanvasForWrite(),
                this.st.elStage.getCachedPainterForWrite(),
                prevX,
                prevY,
                tnx,
                tny
            );

            this.st.minX = Math.min(this.st.minX, tnx);
            this.st.maxX = Math.max(this.st.maxX, tnx);
            this.st.minY = Math.min(this.st.minY, tny);
            this.st.maxY = Math.max(this.st.maxY, tny);
            if (tny < this.st.topPtY) {
                this.st.topPtX = tnx;
                this.st.topPtY = tny;
            }
        } else if (this.st && this.st.mode === SelectToolMode.MovingRegion) {
            if (!this.st.isCopyMult) {
                this.st.elStage.getCanvasForWrite().clear();
            }

            /* user is dragging the mouse to move selection */
            let newX = tnx - this.st.rectx - this.st.offsetForMoveX;
            let newY = tny - this.st.recty - this.st.offsetForMoveY;

            this.st.elStage
                .getCanvasForWrite()
                .drawFromImage(
                    this.st.cvPiece.canvas,
                    0,
                    0,
                    this.st.cvPiece.canvas.width,
                    this.st.cvPiece.canvas.height,
                    newX,
                    newY,
                    0,
                    0,
                    this.st.elStage.getCvWidth(),
                    this.st.elStage.getCvHeight()
                );

            this.st.elBorder.set('x', newX + this.st.rectx + this.vci.userBounds()[0]);
            this.st.elBorder.set('y', newY + this.st.recty + this.vci.userBounds()[1]);
            this.st.elPlaceholderForCursor.set('x', this.st.elBorder.x);
            this.st.elPlaceholderForCursor.set('y', this.st.elBorder.y);
        }
    }

    /**
     * respond to mouse up event
     *
     * see comment at the top of the class for more info
     */
    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        if (this.st && this.st.mode === SelectToolMode.SelectingRegion) {
            /* if lasso, close the loop */
            if (tl === VpcTool.Lasso) {
                this.respondMouseMove(
                    tl,
                    new MouseMoveEventDetails(0, d.mouseX, d.mouseY, this.st.rawStartX, this.st.rawStartY),
                    true
                );
            }

            if (this.checkTooSmall()) {
                /* we don't yet support small selections. */
                this.onLeaveTool();
                this.onOpenTool();
                return;
            }

            let rectx = this.st.minX;
            let recty = this.st.minY;
            let rectw = this.st.maxX - this.st.minX;
            let recth = this.st.maxY - this.st.minY;

            /* make mask. */
            this.st.elMask.setCanvas(this.cbPaintRender().getTemporaryCanvas(2));

            /* copy what we have sketched as the border to "border". */
            this.st.elBorder.setDimensions(rectx + this.vci.userBounds()[0], recty + this.vci.userBounds()[1], rectw, recth);

            this.st.elBorder.setCanvas(this.cbPaintRender().getTemporaryCanvas(3, rectw, recth));
            this.st.elBorder
                .getCanvasForWrite()
                .drawFromImage(
                    this.st.elStage.getCanvasForWrite().canvas,
                    rectx,
                    recty,
                    rectw,
                    recth,
                    0,
                    0,
                    0,
                    0,
                    this.st.elBorder.getCvWidth(),
                    this.st.elBorder.getCvHeight()
                );

            this.st.elPlaceholderForCursor.setDimensions(
                this.st.elBorder.x,
                this.st.elBorder.y,
                this.st.elBorder.w,
                this.st.elBorder.h
            );

            /* draw the shape, but opaque and filled-in black, onto elStage */
            this.makeBlack();

            /* make the mask an opaque white of the shape */
            this.st.elMask
                .getCanvasForWrite()
                .drawFromImage(
                    this.st.elStage.getCanvasForWrite().canvas,
                    rectx,
                    recty,
                    rectw,
                    recth,
                    rectx,
                    recty,
                    0,
                    0,
                    this.st.elMask.getCvWidth(),
                    this.st.elMask.getCvHeight()
                );

            this.st.elMask.getCanvasForWrite().temporarilyChangeCompositeMode('source-in', () => {
                checkThrow(this.st, '');
                this.st.elMask
                    .getCanvasForWrite()
                    .fillRect(
                        0,
                        0,
                        this.st.elMask.getCvWidth(),
                        this.st.elMask.getCvHeight(),
                        0,
                        0,
                        this.st.elMask.getCvWidth(),
                        this.st.elMask.getCvHeight(),
                        'white'
                    );
            });

            /* make cvPiece equal to cvMask */
            this.st.cvPiece = this.cbPaintRender().getTemporaryCanvas(4);
            this.st.cvPiece.drawFromImage(
                this.st.elMask.getCanvasForWrite().canvas,
                0,
                0,
                this.st.elMask.getCvWidth(),
                this.st.elMask.getCvHeight(),
                0,
                0,
                0,
                0,
                this.st.cvPiece.canvas.width,
                this.st.cvPiece.canvas.height
            );

            /* make cvPiece a cut-out of the main bg */
            let basePaint = this.cbPaintRender().getMainBg();
            this.st.cvPiece.temporarilyChangeCompositeMode('source-in', () => {
                checkThrow(this.st, '');
                this.st.cvPiece.drawFromImage(
                    basePaint.getCanvasForWrite().canvas,
                    0,
                    0,
                    basePaint.getCvWidth(),
                    basePaint.getCvHeight(),
                    0,
                    0,
                    0,
                    0,
                    this.st.cvPiece.canvas.width,
                    this.st.cvPiece.canvas.height
                );
            });

            /* clear stage, draw piece on stage */
            this.st.elStage.getCanvasForWrite().clear();
            this.st.elStage
                .getCanvasForWrite()
                .drawFromImage(
                    this.st.cvPiece.canvas,
                    0,
                    0,
                    this.st.cvPiece.canvas.width,
                    this.st.cvPiece.canvas.height,
                    0,
                    0,
                    0,
                    0,
                    this.st.elStage.getCvWidth(),
                    this.st.elStage.getCvHeight()
                );
            this.st.rectx = rectx;
            this.st.recty = recty;
            this.st.mode = SelectToolMode.SelectedRegion;
        } else if (this.st && this.st.mode === SelectToolMode.MovingRegion) {
            this.st.mode = SelectToolMode.SelectedRegion;
        }

        this.vci.causeUIRedraw(); /* will refresh cursor */
    }

    /**
     * respond to backspace and edit->clear
     */
    onDeleteSelection() {
        if (this.st && this.st.mode === SelectToolMode.SelectedRegion) {
            this.cbPaintRender().commitImageOntoImage([this.st.elMask.getCanvasForWrite()], 0, 0);
            this.cbPaintRender().deleteTempPaintEls();
            this.st = undefined;
        }
    }

    /**
     * reset state when opening tool
     */
    onOpenTool() {
        this.st = undefined;
        this.cbPaintRender().deleteTempPaintEls();
    }

    /**
     * commit changes when leaving tool
     */
    onLeaveTool() {
        this.applyMove();
        this.cancelCurrentToolAction();
    }

    /**
     * commit changes to the card
     */
    applyMove() {
        if (this.st) {
            if (this.st.elMask.getCanvasForWrite()) {
                let basePaint = this.cbPaintRender().getMainBg();
                let incoming = this.st.isCopy
                    ? [this.st.elStage.getCanvasForWrite()]
                    : [this.st.elMask.getCanvasForWrite(), this.st.elStage.getCanvasForWrite()];
                this.cbPaintRender().commitImageOntoImage(incoming, 0, 0);
            }

            this.cbPaintRender().deleteTempPaintEls();
            this.st = undefined;
        }
    }

    /**
     * erase any uncommitted partial changes, called by Undo() etc
     */
    cancelCurrentToolAction() {
        this.st = undefined;
        this.cbPaintRender().deleteTempPaintEls();
    }

    /**
     * which cursor should be shown if the mouse is over el.
     */
    whichCursor(tl: VpcTool, el: O<UI512Element>) {
        if (
            this.st &&
            (this.st.mode === SelectToolMode.SelectedRegion || this.st.mode === SelectToolMode.MovingRegion) &&
            el &&
            el.id.endsWith('PlaceholderForCursor')
        ) {
            return UI512Cursors.Arrow;
        } else {
            return UI512Cursors.Crosshair;
        }
    }

    /**
     * make the selection blink by toggling visibility of elBorder
     */
    blinkSelection() {
        if (
            (this.vci.getTool() === VpcTool.Select || this.vci.getTool() === VpcTool.Lasso) &&
            this.st &&
            this.st.mode === SelectToolMode.SelectedRegion
        ) {
            this.st.elBorder.set('visible', !this.st.elBorder.visible);
        }
    }

    /**
     * draw the blinking border around the selection
     */
    protected abstract selectingDrawTheBorder(
        st: SelectToolState,
        cv: CanvasWrapper,
        painter: UI512Painter,
        tmousepx: number,
        tmousepy: number,
        tmousenx: number,
        tmouseny: number
    ): void;

    /**
     * we'll cancel selection if the region is too small
     */
    protected abstract checkTooSmall(): boolean;

    /**
     * draw the shape we want to select as a filled-in black shape
     */
    protected abstract makeBlack(): void;
}

/**
 * state of the select tool
 */
export class SelectToolState {
    mode: SelectToolMode;
    isCopy = false;
    isCopyMult = false;
    rawStartX = -1;
    rawStartY = -1;
    startX = -1;
    startY = -1;
    minX = largeArea;
    minY = largeArea;
    maxX = -largeArea;
    maxY = -largeArea;
    topPtX = 0;
    topPtY = largeArea;
    rectx = 0;
    recty = 0;
    recordXpts: number[];
    recordYpts: number[];

    offsetForMoveX = 0;
    offsetForMoveY = 0;
    cvPiece: CanvasWrapper;
    elMask: UI512ElCanvasPiece;
    elStage: UI512ElCanvasPiece;
    elBorder: UI512ElCanvasPiece;
    elPlaceholderForCursor: UI512ElCanvasPiece;
}

/**
 * which stage of the selecting lifecycle
 */
export enum SelectToolMode {
    SelectingRegion = 1,
    SelectedRegion,
    MovingRegion
}
