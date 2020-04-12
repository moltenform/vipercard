
/* auto */ import { SelectToolState, VpcAppUIToolSelectBase } from './vpcToolSelectBase';
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { bool } from './../../ui512/utils/util512Base';
/* auto */ import { cast, last } from './../../ui512/utils/util512';
/* auto */ import { clrBlack } from './../../ui512/draw/ui512DrawPatterns';
/* auto */ import { UI512Painter } from './../../ui512/draw/ui512DrawPainterClasses';
/* auto */ import { UI512PaintDispatch, UI512PaintDispatchShapes } from './../../ui512/draw/ui512DrawPaintDispatch';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * lasso tool, for free-form selection
 * see VpcAppUIToolSelectBase for more information
 */
export class VpcAppUIToolLasso extends VpcAppUIToolSelectBase {
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
        if (this.st) {
            let args = new UI512PaintDispatch(
                UI512PaintDispatchShapes.SmearPencil,
                [prevTX, tx],
                [prevTY, ty],
                clrBlack,
                clrBlack,
                false,
                1
            );

            UI512PaintDispatch.go(args, painter);
            if (prevTX !== last(this.st.recordXpts) || prevTY !== last(this.st.recordYpts)) {
                this.st.recordXpts.push(prevTX);
                this.st.recordYpts.push(prevTY);
            }

            this.st.recordXpts.push(tx);
            this.st.recordYpts.push(ty);
        }
    }

    /**
     * draw the shape we want to select as a filled-in black shape
     */
    protected makeBlack() {
        if (this.st) {
            let cv = cast(CanvasWrapper, this.st.elStage.getCachedPainterForWrite().getBackingSurface());
            cv.clear();

            let args = new UI512PaintDispatch(
                UI512PaintDispatchShapes.IrregularPolygon,
                this.st.recordXpts,
                this.st.recordYpts,
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
        return bool(
            this.st &&
                (this.st.maxX - this.st.minX <= minSize || this.st.maxY - this.st.minY <= minSize) &&
                this.st.recordXpts.length > minSize &&
                this.st.recordYpts.length > minSize
        );
    }
}
