
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { clrBlack, clrWhite } from '../../ui512/draw/ui512DrawPatterns.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512DrawPainterClasses.js';
/* auto */ import { UI512PaintDispatch, UI512PaintDispatchShapes } from '../../ui512/draw/ui512DrawPaintDispatch.js';
/* auto */ import { SelectToolState, VpcAppUIToolSelectBase } from '../../vpcui/tools/vpcToolSelectBase.js';

export class VpcAppUIRectSelect extends VpcAppUIToolSelectBase {
    protected selectingDrawTheBorder(
        st: SelectToolState,
        cv: CanvasWrapper,
        painter: UI512Painter,
        tmousepx: number,
        tmousepy: number,
        tmousenx: number,
        tmouseny: number
    ) {
        // rect select.
        cv.clear();
        let args = new UI512PaintDispatch(
            UI512PaintDispatchShapes.ShapeRectangle,
            [st.startX, tmousenx],
            [st.startY, tmouseny],
            clrBlack,
            clrWhite,
            false,
            1
        );
        UI512PaintDispatch.go(args, painter);
    }

    protected makeBlack() {
        if (this.state) {
            // make a floodfill. ideally we'd check inner and outer but this might be "good enough"
            // fails for cases where the top of the shape is a sharp spike 1pixel wide
            let floodfillx = this.state.topPtX + 1;
            let floodfilly = this.state.topPtY + 1;
            let args = new UI512PaintDispatch(
                UI512PaintDispatchShapes.Bucket,
                [floodfillx],
                [floodfilly],
                clrBlack,
                clrBlack,
                true
            );
            UI512PaintDispatch.go(args, this.state.elStage.getCachedPainterForWrite());
        }
    }

    protected checkTooSmall() {
        return !!this.state && (this.state.maxX - this.state.minX <= 2 || this.state.maxY - this.state.minY <= 2);
    }
}
