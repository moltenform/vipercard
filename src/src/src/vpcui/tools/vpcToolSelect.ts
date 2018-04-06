
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { clrBlack, clrWhite } from '../../ui512/draw/ui512drawpattern.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512drawpaintclasses.js';
/* auto */ import { PaintOntoCanvas, PaintOntoCanvasShapes } from '../../ui512/draw/ui512imageserialize.js';
/* auto */ import { SelectToolState, VpcAppUIGeneralSelect } from '../../vpcui/tools/vpctoolselectbase.js';

export class VpcAppUIRectSelect extends VpcAppUIGeneralSelect {
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
        let args = new PaintOntoCanvas(
            PaintOntoCanvasShapes.ShapeRectangle,
            [st.startX, tmousenx],
            [st.startY, tmouseny],
            clrBlack,
            clrWhite,
            false,
            1
        );
        PaintOntoCanvas.go(args, painter);
    }

    protected makeBlack() {
        if (this.state) {
            // make a floodfill. ideally we'd check inner and outer but this might be "good enough"
            // fails for cases where the top of the shape is a sharp spike 1pixel wide
            let floodfillx = this.state.topPtX + 1;
            let floodfilly = this.state.topPtY + 1;
            let args = new PaintOntoCanvas(
                PaintOntoCanvasShapes.Bucket,
                [floodfillx],
                [floodfilly],
                clrBlack,
                clrBlack,
                true
            );
            PaintOntoCanvas.go(args, this.state.elStage.getCachedPnterForWrite());
        }
    }

    protected checkTooSmall() {
        return !!this.state && (this.state.maxX - this.state.minX <= 2 || this.state.maxY - this.state.minY <= 2);
    }
}
