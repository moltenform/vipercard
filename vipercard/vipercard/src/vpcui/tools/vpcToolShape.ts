
/* auto */ import { VpcAppUIToolBase } from './vpcToolBase';
/* auto */ import { VpcTool } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { UI512Cursors } from './../../ui512/utils/utilsCursors';
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { O } from './../../ui512/utils/util512Assert';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElCanvasPiece } from './../../ui512/elements/ui512ElementCanvasPiece';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { UI512Painter } from './../../ui512/draw/ui512DrawPainterClasses';
/* auto */ import { UI512PainterCvCanvas } from './../../ui512/draw/ui512DrawPainter';

/**
 * shape tool (rect, oval, etc)
 *
 * when you click and drag, we are drawing onto a separate "elStage" layer,
 * that floats above the real card paint.
 * when you release the mouse, we actually commit onto the card paint.
 */
export class VpcAppUIToolShape extends VpcAppUIToolBase {
    state: O<ShapeToolState> = undefined;

    /**
     * respond to mouse down event
     */
    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg) {
            return;
        }
        if (!this.state) {
            let [tx, ty] = this.getTranslatedCoords(d.mouseX, d.mouseY);
            let state = new ShapeToolState();
            let elStage = this.cbPaintRender().makeAndAddFullsizeEl('VpcAppUIToolShapeStage');
            elStage.transparentToClicks = true;
            elStage.setCanvas(this.cbPaintRender().getTemporaryCanvas(1));
            state.elStage = elStage;
            state.paStage = new UI512PainterCvCanvas(
                state.elStage.getCanvasForWrite(),
                state.elStage.getCanvasForWrite().canvas.width,
                state.elStage.getCanvasForWrite().canvas.height
            );
            state.drawMultiple = this.vci.getOptionB('optPaintDrawMult');
            state.startX = tx;
            state.startY = ty;
            state.mode = ShapeToolMode.Dragging;
            this.state = state;
        }
    }

    /**
     * respond to mouse move event
     */
    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg) {
            return;
        }
        if (this.state && this.state.mode === ShapeToolMode.Dragging) {
            let [tnx, tny] = this.getTranslatedCoords(d.mouseX, d.mouseY);
            if (!this.state.drawMultiple) {
                this.state.elStage.getCanvasForWrite().clear();
            }

            this.drawPartial(this.state.elStage.getCanvasForWrite(), this.state, tl, tnx, tny);
        }
    }

    /**
     * draw the shape
     */
    protected drawPartial(cv: CanvasWrapper, st: ShapeToolState, tl: VpcTool, x: number, y: number) {
        this.cbPaintRender().drawPartialShape([st.startX, x], [st.startY, y], st.elStage, st.paStage);
    }

    /**
     * respond to mouse up event
     */
    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        if (this.state && this.state.mode === ShapeToolMode.Dragging) {
            this.cbPaintRender().commitImageOntoImage([this.state.elStage.getCanvasForWrite()], 0, 0);
            this.onLeaveTool();
            this.onOpenTool();
        }
    }

    /**
     * erase any uncommitted partial changes, called by Undo() etc
     */
    cancelCurrentToolAction() {
        this.state = undefined;
        this.cbPaintRender().deleteTempPaintEls();
    }

    /**
     * reset state when opening tool
     */
    onOpenTool() {
        this.state = undefined;
        this.cbPaintRender().deleteTempPaintEls();
    }

    /**
     * commit changes when leaving tool
     */
    onLeaveTool() {
        this.state = undefined;
        this.cancelCurrentToolAction();
    }

    /**
     * which cursor should be shown if the mouse is over el.
     */
    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.Crosshair;
    }
}

/**
 * state of the shape tool
 */
export class ShapeToolState {
    mode: ShapeToolMode;
    elStage: UI512ElCanvasPiece;
    paStage: UI512Painter;
    drawMultiple = false;
    startX = 0;
    startY = 0;
}

/**
 * stage of the drawing lifecycle
 */
enum ShapeToolMode {
    Inited,
    Dragging
}
