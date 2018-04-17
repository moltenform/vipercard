
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { fitIntoInclusive } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512DrawPainterClasses.js';
/* auto */ import { UI512PainterCvCanvas } from '../../ui512/draw/ui512DrawPainter.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512ElCanvasPiece } from '../../ui512/elements/ui512ElementCanvasPiece.js';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcAppUIToolBase } from '../../vpcui/tools/vpcToolBase.js';

export class VpcAppUIToolShape extends VpcAppUIToolBase {
    state: O<ShapeToolState> = undefined;

    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg) {
            return;
        }
        if (!this.state) {
            let tmousex =
                fitIntoInclusive(
                    d.mouseX,
                    this.vci.userBounds()[0],
                    this.vci.userBounds()[0] + this.vci.userBounds()[2] - 1
                ) - this.vci.userBounds()[0];
            let tmousey =
                fitIntoInclusive(
                    d.mouseY,
                    this.vci.userBounds()[1],
                    this.vci.userBounds()[1] + this.vci.userBounds()[3] - 1
                ) - this.vci.userBounds()[1];

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
            state.startx = tmousex;
            state.starty = tmousey;
            state.mode = ShapeToolMode.Dragging;
            this.state = state;
        }
    }

    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg) {
            return;
        }
        if (this.state && this.state.mode === ShapeToolMode.Dragging) {
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
            if (!this.state.drawMultiple) {
                this.state.elStage.getCanvasForWrite().clear();
            }

            this.drawPartial(this.state.elStage.getCanvasForWrite(), this.state, tl, tmousenx, tmouseny);
        }
    }

    protected drawPartial(cv: CanvasWrapper, st: ShapeToolState, tl: VpcTool, x: number, y: number) {
        this.cbPaintRender().drawPartialShape([st.startx, x], [st.starty, y], st.elStage, st.paStage);
    }

    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        if (this.state && this.state.mode === ShapeToolMode.Dragging) {
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
        return UI512Cursors.Crosshair;
    }
}

enum ShapeToolMode {
    Inited,
    Dragging
}

export class ShapeToolState {
    mode: ShapeToolMode;
    elStage: UI512ElCanvasPiece;
    paStage: UI512Painter;
    drawMultiple = false;
    startx = 0;
    starty = 0;
}
