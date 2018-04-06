
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512DrawPaintClasses.js';
/* auto */ import { UI512PainterCvCanvas } from '../../ui512/draw/ui512DrawPaint.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElCanvasPiece } from '../../ui512/elements/ui512ElementsCanvasPiece.js';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcAppUIToolResponseBase } from '../../vpcui/tools/vpcToolBase.js';

enum SmearToolMode {
    Inited,
    Dragging,
}

class SmearToolState {
    mode: SmearToolMode;
    elStage: UI512ElCanvasPiece;
    paStage: UI512Painter;
}

export class VpcAppUIToolSmear extends VpcAppUIToolResponseBase {
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
            case VpcTool.pencil:
                return UI512Cursors.pencil;
            case VpcTool.eraser:
                return UI512Cursors.painteraser;
            case VpcTool.brush:
                return UI512Cursors.paintbrush;
            case VpcTool.spray:
                return UI512Cursors.paintspray;
            default:
                return UI512Cursors.arrow;
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
