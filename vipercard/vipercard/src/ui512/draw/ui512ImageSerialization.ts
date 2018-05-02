
/* auto */ import { UI512Compress, checkThrowUI512, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { clrBlack, clrTransp, clrWhite } from '../../ui512/draw/ui512DrawPatterns.js';
/* auto */ import { UI512PainterCvData } from '../../ui512/draw/ui512DrawPainter.js';

/**
 * serialize an image to a string
 *
 * create a long string of ascii characters 0,1,2,
 * one character for each pixel in the image.
 * then run lz to compress the string to binary data.
 */
export class UI512ImageSerialization {
    readonly asciiBlack = clrBlack.toString().charAt(0);
    readonly asciiWhite = clrWhite.toString().charAt(0);
    readonly asciiTransp = clrTransp.toString().charAt(0);
    readonly asciiNumBlack = clrBlack.toString().charCodeAt(0);
    readonly asciiNumWhite = clrWhite.toString().charCodeAt(0);
    readonly asciiNumTransp = clrTransp.toString().charCodeAt(0);

    /**
     * uncompress the string and paint the image onto the canvas
     */
    loadFromString(canvas: CanvasWrapper, compressed: string) {
        const w = canvas.canvas.width;
        const h = canvas.canvas.height;
        if (compressed.length === 0) {
            /* treat empty string as an empty white image. */
            canvas.fillRect(0, 0, w, h, 0, 0, w, h, 'white');
            return;
        }

        let data = canvas.context.createImageData(w, h);
        assertEq(data.data.length, 4 * w * h, '2{|');
        let uncompressed = UI512Compress.decompressString(compressed);
        if (uncompressed.length * 4 !== data.data.length) {
            let loc = window.location.href;
            if (scontains(loc, 'U3ZcVJ')) {
                console.error('length mismatch, expected, got' + data.data.length + 'wanted' + uncompressed.length * 4);
                console.error('not throwing due to special stack.');
                return;
            }
        }

        checkThrowUI512(
            uncompressed.length * 4 === data.data.length,
            'K=|length mismatch, expected, got',
            data.data.length,
            uncompressed.length * 4
        );

        let paint = new UI512PainterCvData(data.data, w, h);
        let i = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let pixel = uncompressed.charCodeAt(i);
                paint.setPixel(x, y, pixel - this.asciiNumBlack);
                i++;
            }
        }

        canvas.context.putImageData(data, 0, 0);
    }

    /**
     * convert the image on the canvas to a compressed string
     */
    writeToString(canvas: CanvasWrapper) {
        const w = canvas.canvas.width;
        const h = canvas.canvas.height;
        let data = canvas.context.getImageData(0, 0, w, h);
        return this.writeToStringFromData(data.data, w, h);
    }

    /**
     * convert the given imagedata to a compressed string
     */
    writeToStringFromData(data: Uint8ClampedArray, w: number, h: number) {
        assertEq(data.length, 4 * w * h, '2`|');
        let reader = new UI512PainterCvData(data, w, h);
        let result = '';
        let map: { [key: number]: string } = {};
        map[clrBlack] = this.asciiBlack;
        map[clrWhite] = this.asciiWhite;
        map[clrTransp] = this.asciiTransp;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let clr = reader.readPixel(x, y);
                result += map[clr];
            }
        }

        return UI512Compress.compressString(result);
    }
}
