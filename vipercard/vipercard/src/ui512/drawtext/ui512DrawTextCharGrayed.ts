
/* auto */ import { CanvasWrapper, DrawableImage } from './../utils/utilsCanvasDraw';
/* auto */ import { O } from './../utils/util512Base';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

export const UI512DrawTextCharGrayed = /* static class */ {
    maxCharWidth: 64 as const,
    maxCharHeight: 64 as const,
    tempCanvas: undefined as O<CanvasWrapper>,
    ensureTempCanvas():CanvasWrapper {
        /* create the cached mem canvas if we don't have one */
        if (!this.tempCanvas) {
            this.tempCanvas = CanvasWrapper.createMemoryCanvas(
                this.maxCharWidth,
                this.maxCharHeight
            );
        }

        /* erase any previous contents */
        this.tempCanvas.clear();
        return this.tempCanvas
    },
    go(
        img: DrawableImage,
        dest: CanvasWrapper,
        srcX: number,
        srcY: number,
        width: number,
        height: number,
        destX: number,
        destY: number,
        boxX: number,
        boxY: number,
        boxW: number,
        boxH: number
    ) {
        let cnvs = this.ensureTempCanvas()
        /* draw font character onto the temp canvas */
        cnvs.drawFromImage(
            img,
            srcX,
            srcY,
            width,
            height,
            0,
            0,
            0,
            0,
            cnvs.canvas.width,
            cnvs.canvas.height
        );

        /* make every other pixel transparent */
        let parity = (destX + destY) % 2;
        this.makeCheckered(cnvs, parity);

        /* draw the results */
        dest.drawFromImage(
            cnvs.canvas,
            0,
            0,
            cnvs.canvas.width,
            cnvs.canvas.height,
            destX,
            destY,
            boxX,
            boxY,
            boxW,
            boxH
        );
    },

    /**
     * make every other pixel transparent
     */
    makeCheckered(c: CanvasWrapper, parity: number) {
        for (let y = 0; y < c.canvas.height; y++) {
            for (let x = 0; x < c.canvas.width; x++) {
                if ((x + y) % 2 === parity) {
                    c.context.clearRect(x, y, 1, 1);
                }
            }
        }
    }
};
