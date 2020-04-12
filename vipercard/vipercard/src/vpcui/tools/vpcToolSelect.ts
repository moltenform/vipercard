
/* auto */ import { SelectToolState, VpcAppUIToolSelectBase } from './vpcToolSelectBase';
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { trueIfDefinedAndNotNull } from './../../ui512/utils/util512Base';
/* auto */ import { clrBlack, clrWhite } from './../../ui512/draw/ui512DrawPatterns';
/* auto */ import { UI512Painter } from './../../ui512/draw/ui512DrawPainterClasses';
/* auto */ import { UI512PaintDispatch, UI512PaintDispatchShapes } from './../../ui512/draw/ui512DrawPaintDispatch';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * rectangular selection
 * see ToolSelectBase for more information
 */
export class VpcAppUIToolSelect extends VpcAppUIToolSelectBase {
    /**
     * draw the blinking border around the selection
     */
    protected selectingDrawTheBorder(
        st: SelectToolState,
        cv: CanvasWrapper,
        painter: UI512Painter,
        prevTX: number,
        prevTY: number,
        tx: number,
        ty: number
    ) {
        cv.clear();
        let args = new UI512PaintDispatch(
            UI512PaintDispatchShapes.ShapeRectangle,
            [st.startX, tx],
            [st.startY, ty],
            clrBlack,
            clrWhite,
            false,
            1
        );

        UI512PaintDispatch.go(args, painter);
    }

    /**
     * draw the shape we want to select as a filled-in black shape
     * currently uses a floodfill, should use a fillRect though...
     */
    protected makeBlack() {
        if (this.st) {
            /* make a floodfill. ideally we'd check inner and outer but this might be good enough */
            /* fails for cases where the top of the shape is a sharp spike 1pixel wide */
            let floodfillX = this.st.topPtX + 1;
            let floodfillY = this.st.topPtY + 1;
            let args = new UI512PaintDispatch(
                UI512PaintDispatchShapes.Bucket,
                [floodfillX],
                [floodfillY],
                clrBlack,
                clrBlack,
                true
            );

            UI512PaintDispatch.go(args, this.st.elStage.getCachedPainterForWrite());
        }
    }

    /**
     * we'll cancel selection if the region is too small
     */
    protected checkTooSmall() {
        const minSize = 2;
        return (
            trueIfDefinedAndNotNull(this.st) && (this.st.maxX - this.st.minX <= minSize || this.st.maxY - this.st.minY <= minSize)
        );
    }
}
