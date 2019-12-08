
/* auto */ import { VpcAppUIToolBase } from './vpcToolBase';
/* auto */ import { VpcTool } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { UI512Cursors } from './../../ui512/utils/utilsCursors';
/* auto */ import { O } from './../../ui512/utils/util512Assert';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElCanvasPiece } from './../../ui512/elements/ui512ElementCanvasPiece';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { UI512Painter } from './../../ui512/draw/ui512DrawPainterClasses';
/* auto */ import { UI512PainterCvCanvas } from './../../ui512/draw/ui512DrawPainter';

/**
 * smear tool (pencil, brush, eraser, etc)
 *
 * when you click and drag, we are drawing onto a separate "elStage" layer,
 * that floats above the real card paint.
 * when you release the mouse, we actually commit onto the card paint.
 */
export class VpcAppUIToolSmear extends VpcAppUIToolBase {
    state: O<SmearToolState> = undefined;

    /**
     * respond to mouse down event
     */
    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg) {
            return;
        }

        if (!this.state) {
            let state = new SmearToolState();
            let elStage = this.cbPaintRender().makeAndAddFullsizeEl(
                'VpcAppUIToolSmearSelectStage'
            );
            elStage.transparentToClicks = true;
            elStage.setCanvas(this.cbPaintRender().getTemporaryCanvas(1));
            state.elStage = elStage;
            state.paStage = new UI512PainterCvCanvas(
                state.elStage.getCanvasForWrite(),
                state.elStage.getCvWidth(),
                state.elStage.getCvHeight()
            );
            this.state = state;
        }

        /* also draw where the user clicked. */
        this.state.mode = SmearToolMode.Dragging;
        this.respondMouseMove(
            tl,
            new MouseMoveEventDetails(0, d.mouseX, d.mouseY, d.mouseX, d.mouseY),
            true
        );
    }

    /**
     * respond to mouse move event
     */
    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg) {
            return;
        }

        if (this.state && this.state.mode === SmearToolMode.Dragging) {
            let [tprevX, tprevY] = this.getTranslatedCoords(d.prevMouseX, d.prevMouseY);
            let [tnX, tnY] = this.getTranslatedCoords(d.mouseX, d.mouseY);

            this.cbPaintRender().drawPartialSmear(
                [tprevX, tnX],
                [tprevY, tnY],
                this.state.elStage,
                this.state.paStage
            );
        }
    }

    /**
     * respond to mouse up event
     */
    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        if (this.state && this.state.mode === SmearToolMode.Dragging) {
            this.cbPaintRender().commitImageOntoImage(
                [this.state.elStage.getCanvasForWrite()],
                0,
                0
            );
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
        switch (tl) {
            case VpcTool.Pencil:
                return UI512Cursors.Pencil;
            case VpcTool.Eraser:
                return UI512Cursors.PaintEraser;
            case VpcTool.Brush:
                return UI512Cursors.PaintBrush;
            case VpcTool.Spray:
                return UI512Cursors.PaintSpray;
            default:
                return UI512Cursors.Arrow;
        }
    }

    /**
     * make everything opaque white
     */
    clearAllPaint() {
        let canvas = this.cbPaintRender().getTemporaryCanvas(1);
        canvas.fillRect(
            0,
            0,
            canvas.canvas.width,
            canvas.canvas.height,
            0,
            0,
            canvas.canvas.width,
            canvas.canvas.height,
            'white'
        );

        this.cbPaintRender().commitImageOntoImage([canvas], 0, 0);
    }
}

/**
 * state of the smear tool
 */
class SmearToolState {
    mode: SmearToolMode;
    elStage: UI512ElCanvasPiece;
    paStage: UI512Painter;
}

/**
 * stage of the drawing lifecycle
 */
enum SmearToolMode {
    Inited = 1,
    Dragging
}
