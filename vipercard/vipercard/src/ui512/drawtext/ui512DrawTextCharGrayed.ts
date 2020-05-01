
/* auto */ import { CanvasWrapper, DrawableImage } from './../utils/utilsCanvasDraw';
/* auto */ import { O } from './../utils/util512Base';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */



class UI512DrawTextCharGrayed {
    readonly maxCharWidth = 40;
    readonly maxCharHeight = 40;
    tempCanvas: O<CanvasWrapper>
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
        if (!this.tempCanvas) {
            this.tempCanvas = CanvasWrapper.createMemoryCanvas(this.maxCharWidth, this.maxCharHeight)
        }

        /* erase any previous contents */
        this.tempCanvas.clear()

        /* draw font character onto the temp canvas */
        this.tempCanvas.drawFromImage(img, srcX, srcY, width, height, 0, 0, 0, 0, this.tempCanvas.canvas.width, this.tempCanvas.canvas.height)

        /* make every other pixel transparent */
        let parity = (destX + destY) % 2;
        this.makeCheckered(this.tempCanvas, parity)

    }

    makeCheckered(c:CanvasWrapper, parity:number) {
        for (let y=0; y<c.canvas.height; y++) {
            for (let x=0; x<c.canvas.width; x++)  {
                if ((x + y) % 2 === parity) {
                    c.context.clearRect(x, y, 1, 1);
                }
            }
        }
    }

}

export const uI512DrawTextCharGrayed = new UI512DrawTextCharGrayed()
