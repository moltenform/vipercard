
/* auto */ import { cast } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { clrBlack } from '../../ui512/draw/ui512DrawPattern.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512DrawPaintClasses.js';
/* auto */ import { PaintOntoCanvas, PaintOntoCanvasShapes } from '../../ui512/draw/ui512ImageSerialize.js';
/* auto */ import { SelectToolState, VpcAppUIGeneralSelect } from '../../vpcui/tools/vpcToolSelectBase.js';

export class VpcAppUILasso extends VpcAppUIGeneralSelect {
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
            let args = new PaintOntoCanvas(
                PaintOntoCanvasShapes.SmearPencil,
                [tmousepx, tmousenx],
                [tmousepy, tmouseny],
                clrBlack,
                clrBlack,
                false,
                1
            );
            PaintOntoCanvas.go(args, painter);
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
            let cv = cast(this.state.elStage.getCachedPnterForWrite().getBackingSurface(), CanvasWrapper);
            cv.clear();

            let args = new PaintOntoCanvas(
                PaintOntoCanvasShapes.IrregularPolygon,
                this.state.recordxpts,
                this.state.recordypts,
                clrBlack,
                clrBlack,
                true
            );
            
            PaintOntoCanvas.go(args, this.state.elStage.getCachedPnterForWrite());
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
