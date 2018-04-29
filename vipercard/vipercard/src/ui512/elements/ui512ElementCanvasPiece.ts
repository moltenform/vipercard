
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512DrawPainterClasses.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';

/**
 * the model for a UI image element,
 * the image is drawn from a region of a canvas.
 */
export class UI512ElCanvasPiece extends UI512Element {
    readonly typename: string = 'UI512ElCanvasPiece';
    protected canvas: CanvasWrapper;
    protected cachedPainter: UI512Painter;
    protected _srcX = 0;
    protected _srcY = 0;
    protected _incrementUntilLoaded = 0;

    /**
     * set which canvas the image will be drawn from.
     * we need to bump the other property, to signal to our Observer that something has changed.
     */
    setCanvas(cv: CanvasWrapper) {
        this.set('incrementUntilLoaded', this.getN('incrementUntilLoaded') + 1);
        this.canvas = cv;
    }

    /**
     * get the canvas in order to draw changes on the canvas.
     * we need to bump the other property, to signal to our Observer that something has changed.
     */
    getCanvasForWrite() {
        this.set('incrementUntilLoaded', this.getN('incrementUntilLoaded') + 1);
        return this.canvas;
    }

    /**
     * get the canvas, but not to make changes.
     */
    getCanvasForRead() {
        return this.canvas;
    }

    /**
     * get width of canvas
     */
    getCvWidth() {
        return this.canvas.canvas.width;
    }

    /**
     * get height of canvas
     */
    getCvHeight() {
        return this.canvas.canvas.height;
    }

    /**
     * we can cache a painter as a very minor perf improvement.
     * we need to bump the other property, to signal to our Observer that something has changed.
     */
    setCachedPainter(pnter: UI512Painter) {
        this.set('incrementUntilLoaded', this.getN('incrementUntilLoaded') + 1);
        this.cachedPainter = pnter;
    }

    /**
     * get the cached painter.
     * assumes that we'll use it to draw something soon, so
     * we need to bump the other property, to signal to our Observer that something has changed.
     */
    getCachedPainterForWrite() {
        this.set('incrementUntilLoaded', this.getN('incrementUntilLoaded') + 1);
        return this.cachedPainter;
    }
}
