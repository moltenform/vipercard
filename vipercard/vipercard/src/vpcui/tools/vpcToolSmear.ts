
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { fitIntoInclusive } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512DrawPainterClasses.js';
/* auto */ import { UI512PainterCvCanvas } from '../../ui512/draw/ui512DrawPainter.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512ElCanvasPiece } from '../../ui512/elements/ui512ElementCanvasPiece.js';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcAppUIToolBase } from '../../vpcui/tools/vpcToolBase.js';

export class VpcAppUIToolSmear extends VpcAppUIToolBase {
    state: O<SmearToolState> = undefined;
    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg) {
            return;
        }
        if (!this.state) {
            let state = new SmearToolState();
            let elStage = this.cbPaintRender().makeAndAddFullsizeEl('VpcAppUIToolSmearSelectStage');
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

        // also draw where the user clicked.
        this.state.mode = SmearToolMode.Dragging;
        this.respondMouseMove(tl, new MouseMoveEventDetails(0, d.mouseX, d.mouseY, d.mouseX, d.mouseY), true);
    }

    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg) {
            return;
        }

        if (this.state && this.state.mode === SmearToolMode.Dragging) {
            let tmousepx =
                fitIntoInclusive(
                    d.prevMouseX,
                    this.vci.userBounds()[0],
                    this.vci.userBounds()[0] + this.vci.userBounds()[2] - 1
                ) - this.vci.userBounds()[0];
            let tmousepy =
                fitIntoInclusive(
                    d.prevMouseY,
                    this.vci.userBounds()[1],
                    this.vci.userBounds()[1] + this.vci.userBounds()[3] - 1
                ) - this.vci.userBounds()[1];
            let tmousenx =
                fitIntoInclusive(
                    d.mouseX,
                    this.vci.userBounds()[0],
                    this.vci.userBounds()[0] + this.vci.userBounds()[2] - 1
                ) - this.vci.userBounds()[0];
            let tmouseny =
                fitIntoInclusive(
                    d.mouseY,
                    this.vci.userBounds()[1],
                    this.vci.userBounds()[1] + this.vci.userBounds()[3] - 1
                ) - this.vci.userBounds()[1];
            this.cbPaintRender().drawPartialSmear(
                [tmousepx, tmousenx],
                [tmousepy, tmouseny],
                this.state.elStage,
                this.state.paStage
            );
        }
    }

    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        if (this.state && this.state.mode === SmearToolMode.Dragging) {
            this.cbPaintRender().commitImageOntoImage([this.state.elStage.getCanvasForWrite()], 0, 0);
            this.onLeaveTool();
            this.onOpenTool();
        }
    }

    cancelCurrentToolAction(): void {
        this.state = undefined;
        this.cbPaintRender().deleteTempPaintEls();
    }

    onOpenTool() {
        this.state = undefined;
        this.cbPaintRender().deleteTempPaintEls();
    }

    onLeaveTool() {
        this.state = undefined;
        this.cancelCurrentToolAction();
    }

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

enum SmearToolMode {
    Inited,
    Dragging
}

class SmearToolState {
    mode: SmearToolMode;
    elStage: UI512ElCanvasPiece;
    paStage: UI512Painter;
}
