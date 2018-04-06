
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { UI512Painter } from '../../ui512/draw/ui512DrawPaintClasses.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';

export class UI512ElCanvasPiece extends UI512Element {
    readonly typeName: string = 'UI512ElCanvasPiece';
    private canvas: CanvasWrapper;
    private cachedPnter: UI512Painter;
    protected _srcx = 0;
    protected _srcy = 0;
    protected _incrementUntilLoaded = 0;

    setCanvas(cv: CanvasWrapper) {
        this.set('incrementUntilLoaded', this.get_n('incrementUntilLoaded') + 1);
        this.canvas = cv;
    }

    getCanvasForWrite() {
        this.set('incrementUntilLoaded', this.get_n('incrementUntilLoaded') + 1);
        return this.canvas;
    }

    getCanvasForRead() {
        return this.canvas;
    }

    getCvWidth() {
        return this.canvas.canvas.width;
    }

    getCvHeight() {
        return this.canvas.canvas.height;
    }

    setCachedPnter(pnter: UI512Painter) {
        this.set('incrementUntilLoaded', this.get_n('incrementUntilLoaded') + 1);
        this.cachedPnter = pnter;
    }

    getCachedPnterForWrite() {
        this.set('incrementUntilLoaded', this.get_n('incrementUntilLoaded') + 1);
        return this.cachedPnter;
    }
}
