
/* auto */ import { cast } from '../../ui512/utils/utils512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { clrBlack } from '../../ui512/draw/ui512DrawPatterns.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512DrawPainterClasses.js';
/* auto */ import { UI512PaintDispatch, UI512PaintDispatchShapes } from '../../ui512/draw/ui512DrawPaintDispatch.js';
/* auto */ import { SelectToolState, VpcAppUIToolSelectBase } from '../../vpcui/tools/vpcToolSelectBase.js';

export class VpcAppUILasso extends VpcAppUIToolSelectBase {
    protected selectingDrawTheBorder(
        st: SelectToolState,
        cv: CanvasWrapper,
        painter: UI512Painter,
        tmousepx: number,
        tmousepy: number,
        tmousenx: number,
        tmouseny: number
    ) {
        /* lasso select. */
        if (this.state) {
            let args = new UI512PaintDispatch(
                UI512PaintDispatchShapes.SmearPencil,
                [tmousepx, tmousenx],
                [tmousepy, tmouseny],
                clrBlack,
                clrBlack,
                false,
                1
            );
            UI512PaintDispatch.go(args, painter);
            if (
                tmousepx !== this.state.recordxpts[this.state.recordxpts.length - 1] ||
                tmousepy !== this.state.recordypts[this.state.recordypts.length - 1]
            ) {
                this.state.recordxpts.push(tmousepx);
                this.state.recordypts.push(tmousepy);
            }

            this.state.recordxpts.push(tmousenx);
            this.state.recordypts.push(tmouseny);
        }
    }

    protected makeBlack() {
        if (this.state) {
            let cv = cast(this.state.elStage.getCachedPainterForWrite().getBackingSurface(), CanvasWrapper);
            cv.clear();

            let args = new UI512PaintDispatch(
                UI512PaintDispatchShapes.IrregularPolygon,
                this.state.recordxpts,
                this.state.recordypts,
                clrBlack,
                clrBlack,
                true
            );

            UI512PaintDispatch.go(args, this.state.elStage.getCachedPainterForWrite());
        }
    }

    protected checkTooSmall() {
        return (
            !!this.state &&
            (this.state.maxX - this.state.minX <= 2 || this.state.maxY - this.state.minY <= 2) &&
            this.state.recordxpts.length > 2 &&
            this.state.recordypts.length > 2
        );
    }
}
