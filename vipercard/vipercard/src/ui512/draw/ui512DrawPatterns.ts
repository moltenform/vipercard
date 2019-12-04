
/* auto */ import { O } from './../utils/util512Assert';

export const clrBlack = 0;
export const clrWhite = 1;
export const clrTransp = 2;

/**
 * table of patterns.
 * currently held as strings, probably could be faster, but works well enough for now.
 */
export class UI512Patterns {
    static readonly patterns: { [key: number]: string } = {
        100: '1111111111111111111111111111111111111111111111111111111111111111',
        101: '1101111111111110111101111011111111111011011111111110111111111101',
        102: '1111111111111111111111111111111111111111011111111111111111111111',
        103: '1111111111111011111101011111111111111111101111110101111111111111',
        104: '1111111111110111111111111111111111111111011111111111111111111111',
        105: '0000000000000000000000000000000000000000000000000000000000000000',
        106: '1010101001010101101010100101010110101010010101011010101001010101',
        107: '1101111111111111111111011111101111110111111111110111111110111111',
        108: '1101110111111111011101111111111111011101111111110111011111111111',
        109: '0111011111011101011101111101110101110111110111010111011111011101',
        110: '1011011111001111111100111111110111111110111111101111110001111011',
        111: '0111111111111111011101111111111101111111111111110101010111111111',
        112: '1101110111011101011101110111011111011101110111010111011101110111',
        113: '1011101101110111111011101101110110111011011101111110111011011101',
        114: '0111110110111011110001101011101101111101111111101111111011111110',
        115: '0000000001111111011111110111111101111111011111110111111101111111',
        116: '0111011101010101110111010101010101110111010101011101110101010101',
        117: '0011101101111111111100111001011110111100111111011100111111011001',
        118: '0111011111101011110111011011111001110111101111101101110111101011',
        119: '1111011111100011110111010011111001111111111111101111110111111011',
        120: '0011001101010101110011000101010100110011010101011100110001010101',
        121: '0100111011001111111111001110010000100111001111111111001101110010',
        122: '0111111101111111101111101100000111110111111101111110101100011100',
        123: '0000000001111111011111110111111100000000111101111111011111110111',
        124: '0001000101010101010001000101010100010001010101010100010001010101',
        125: '0101010111111111010101011111111101010101111111110101010111111111',
        126: '1101110111111011011100111000101111011101111010000110011111101111',
        127: '0000011110001011110111011011100001110000111010001101110110001110',
        128: '0001000101000100010001000001000100010001010001000100010000010001',
        129: '0111011111011101101010101101110101110111110111011010101011011101',
        130: '0100000101111111011101111111011100010100111101110111011101111111',
        131: '0100000011111111010000000100000001001111010011110100111101001111',
        132: '0000000001000100000000000001000100000000010001000000000000010001',
        133: '0111011110101010110111011010101001110111101010101101110110101010',
        134: '1101101000110111110011010111011010011011110110111011001101101101',
        135: '0000000010000000010000011010001001011101101111100111111111111111',
        136: '0000000000000000000000000100010000000000000000000000000001000100',
        137: '1000100000100010100010000010001010001000001000101000100000100010',
        138: '1110101100010100010111010110001110111110010000011101010100110110',
        139: '0101111110101111000001010000101000000101000010100101111110101111',
        140: '0100100000110000000011000000001000000001000000010000001110000100',
        141: '1011111010000000100010000000100011101011000010001000100010000000',
        142: '1000001001000100001110010100010010000010000000010000000100000001',
        143: '1111111110000000100000001000000010000000100000001000000010000000',
        144: '1100010010000000000011000110100001000011000000100011000000100110',
        145: '1011000100110000000000110001101111011000110000000000110010001101',
        146: '0010001000000100100011000111010000100010000101111001100000010000',
        147: '0100010010001000000100010010001001000100100010000001000100100010',
        148: '1111111111101111111111111011101111111111111011111111111111111111'
    };

    static readonly defaultPattern = 'pattern148';
    static readonly defaultLineColor = clrBlack;
    static readonly defaultFillColor = -1;
    static readonly c0 = '0'.charCodeAt(0);
    static readonly c1 = '1'.charCodeAt(0);
}

/**
 * paint utilities that are more complex than drawing a line or shape.
 */
export abstract class UI512BasePainterUtils {
    abstract setPixel(x: number, y: number, color: number): void;
    abstract fillRect(x: number, y: number, w: number, h: number, color: number): void;

    /**
     * fill a polygon
     * http://alienryderflex.com/polygon_fill/
     * Darel Rex Finley, released as public-domain
     * ported to JavaScript by Ben Fisher
     */
    fillPolygon(x0: number, y0: number, w: number, h: number, xPts: number[], yPts: number[], color: number) {
        let nodeX: number[] = [];
        let sortByNumber = (a: number, b: number) => {
            return a - b;
        };

        /* loop through the rows of the image */
        for (let pixelY = y0; pixelY < y0 + h; pixelY++) {
            nodeX.length = 0;

            /* build a list of nodes */
            let nodes = 0;
            let j = xPts.length - 1;
            let i = 0;
            for (i = 0; i < xPts.length; i++) {
                if ((yPts[i] < pixelY && yPts[j] >= pixelY) || (yPts[j] < pixelY && yPts[i] >= pixelY)) {
                    nodeX[nodes++] = Math.floor(
                        xPts[i] + (pixelY - yPts[i]) / (yPts[j] - yPts[i]) * (xPts[j] - xPts[i])
                    );
                }

                j = i;
            }

            /* sort the nodes */
            nodeX.sort(sortByNumber);

            /* fill the pixels between node pairs. */
            const imageLeft = x0;
            const imageRight = x0 + w;
            for (i = 0; i < nodes; i += 2) {
                if (nodeX[i] >= imageRight) {
                    break;
                }

                if (nodeX[i + 1] > imageLeft) {
                    if (nodeX[i] < imageLeft) {
                        nodeX[i] = imageLeft;
                    }

                    if (nodeX[i + 1] > imageRight) {
                        nodeX[i + 1] = imageRight;
                    }

                    for (j = nodeX[i]; j < nodeX[i + 1]; j++) {
                        this.setPixel(j, pixelY, color);
                    }
                }
            }
        }
    }

    /**
     * same as drawBorder's drawvpcroundrect, but ported to painting.
     * code generated by a Python script I wrote
     */
    drawvpcroundrectPorted(bx: number, by: number, w: number, h: number, clr: number, fill: O<number>) {
        let y = 0;
        let stretchV = 0;
        const stretchH = w - (9 + 7) + 1;
        if (w < 17) {
            return this.drawboxthinborderPorted(bx, by, w, h, clr, fill);
        }
        if (h < 14) {
            return this.drawboxthinborderPorted(bx, by, w, h, clr, fill);
        }

        /* drawing left side */
        stretchV = h - (40 - 27);
        y = by;
        y += 6;
        this.fillRect(bx + 0, by + 6, 1, stretchV, clr);
        y = by + 6 + stretchV;
        this.fillRect(bx + 0, y, 1, 1, clr);
        y += 1;
        y += 6;

        y = by;
        y += 4;
        this.fillRect(bx + 1, y, 1, 2, clr);
        y += 2;
        this.fillRectMightBeClear(bx + 1, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 1, y, 1, 1, fill);
        y += 1;
        this.fillRect(bx + 1, y, 1, 2, clr);
        y += 2;
        y += 4;

        y = by;
        y += 3;
        this.fillRect(bx + 2, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 2, y, 1, 2, fill);
        y += 2;
        this.fillRectMightBeClear(bx + 2, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 2, y, 1, 3, fill);
        y += 3;
        this.fillRect(bx + 2, y, 1, 1, clr);
        y += 1;
        y += 3;

        y = by;
        y += 2;
        this.fillRect(bx + 3, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 3, y, 1, 3, fill);
        y += 3;
        this.fillRectMightBeClear(bx + 3, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 3, y, 1, 4, fill);
        y += 4;
        this.fillRect(bx + 3, y, 1, 1, clr);
        y += 1;
        y += 2;

        y = by;
        y += 1;
        this.fillRect(bx + 4, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 4, y, 1, 4, fill);
        y += 4;
        this.fillRectMightBeClear(bx + 4, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 4, y, 1, 5, fill);
        y += 5;
        this.fillRect(bx + 4, y, 1, 1, clr);
        y += 1;
        y += 1;

        y = by;
        y += 1;
        this.fillRect(bx + 5, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 5, y, 1, 4, fill);
        y += 4;
        this.fillRectMightBeClear(bx + 5, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 5, y, 1, 5, fill);
        y += 5;
        this.fillRect(bx + 5, y, 1, 1, clr);
        y += 1;
        y += 1;

        y = by;
        this.fillRect(bx + 6, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 6, y, 1, 5, fill);
        y += 5;
        this.fillRectMightBeClear(bx + 6, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 6, y, 1, 6, fill);
        y += 6;
        this.fillRect(bx + 6, y, 1, 1, clr);
        y += 1;

        y = by;
        this.fillRect(bx + 7, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 7, y, 1, 5, fill);
        y += 5;
        this.fillRectMightBeClear(bx + 7, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 7, y, 1, 6, fill);
        y += 6;
        this.fillRect(bx + 7, y, 1, 1, clr);
        y += 1;

        y = by;
        this.fillRect(bx + 8, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 8, y, 1, 5, fill);
        y += 5;
        this.fillRectMightBeClear(bx + 8, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 8, y, 1, 6, fill);
        y += 6;
        this.fillRect(bx + 8, y, 1, 1, clr);
        y += 1;

        /* drawing middle */
        y = by;
        this.fillRect(bx + 9, y, stretchH, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 9, y, stretchH, 5, fill);
        y += 5;
        this.fillRectMightBeClear(bx + 8, by + 6, stretchH, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 9, y, stretchH, 6, fill);
        y += 6;
        this.fillRect(bx + 9, y, stretchH, 1, clr);
        y += 1;

        /* drawing right side */
        stretchV = h - (40 - 27);
        y = by;
        this.fillRect(bx + w - 7 + 0, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + w - 7 + 0, y, 1, 5, fill);
        y += 5;
        this.fillRectMightBeClear(bx + w - 7 + 0, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 0, y, 1, 6, fill);
        y += 6;
        this.fillRect(bx + w - 7 + 0, y, 1, 1, clr);
        y += 1;

        y = by;
        y += 1;
        this.fillRect(bx + w - 7 + 1, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + w - 7 + 1, y, 1, 4, fill);
        y += 4;
        this.fillRectMightBeClear(bx + w - 7 + 1, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 1, y, 1, 5, fill);
        y += 5;
        this.fillRect(bx + w - 7 + 1, y, 1, 1, clr);
        y += 1;
        y += 1;

        y = by;
        y += 1;
        this.fillRect(bx + w - 7 + 2, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + w - 7 + 2, y, 1, 4, fill);
        y += 4;
        this.fillRectMightBeClear(bx + w - 7 + 2, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 2, y, 1, 5, fill);
        y += 5;
        this.fillRect(bx + w - 7 + 2, y, 1, 1, clr);
        y += 1;
        y += 1;

        y = by;
        y += 2;
        this.fillRect(bx + w - 7 + 3, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + w - 7 + 3, y, 1, 3, fill);
        y += 3;
        this.fillRectMightBeClear(bx + w - 7 + 3, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 3, y, 1, 4, fill);
        y += 4;
        this.fillRect(bx + w - 7 + 3, y, 1, 1, clr);
        y += 1;
        y += 2;

        y = by;
        y += 3;
        this.fillRect(bx + w - 7 + 4, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + w - 7 + 4, y, 1, 2, fill);
        y += 2;
        this.fillRectMightBeClear(bx + w - 7 + 4, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 4, y, 1, 3, fill);
        y += 3;
        this.fillRect(bx + w - 7 + 4, y, 1, 1, clr);
        y += 1;
        y += 3;

        y = by;
        y += 4;
        this.fillRect(bx + w - 7 + 5, y, 1, 2, clr);
        y += 2;
        this.fillRectMightBeClear(bx + w - 7 + 5, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 5, y, 1, 1, fill);
        y += 1;
        this.fillRect(bx + w - 7 + 5, y, 1, 2, clr);
        y += 2;
        y += 4;

        y = by;
        y += 6;
        this.fillRect(bx + w - 7 + 6, by + 6, 1, stretchV, clr);
        y = by + 6 + stretchV;
        this.fillRect(bx + w - 7 + 6, y, 1, 1, clr);
        y += 1;
        y += 6;

        return true;
    }

    /**
     * same as drawBorder's drawboxthinborder, but ported to painting.
     */
    drawboxthinborderPorted(x0: number, y0: number, w: number, h: number, clr: number, fill: O<number>) {
        if (w > 0 && h > 0) {
            let realBorderSize = 1;

            /* clear it */
            this.fillRectMightBeClear(x0, y0, w, h, fill);

            /* draw borders */
            this.fillRect(x0, y0, w, realBorderSize, clr);
            this.fillRect(x0, y0, realBorderSize, h, clr);
            this.fillRect(x0, y0 + h - realBorderSize, w, realBorderSize, clr);
            this.fillRect(x0 + w - realBorderSize, y0, realBorderSize, h, clr);
        }
    }

    /**
     * distinguish between make-transparent and draw transparent.
     * filling-with-transparent means to make the area transparent
     * filling-with-undefined means to leave the area untouched
     */
    fillRectMightBeClear(x: number, y: number, w: number, h: number, fill: O<number>) {
        if (fill !== undefined) {
            this.fillRect(x, y, w, h, fill);
        }
    }
}

/**
 * test if the color represents a pattern.
 * if clr is 100 and above, it represents a pattern
 */
export function needsPatternSupport(fillColor: O<number>) {
    return fillColor !== undefined && fillColor >= 100;
}

/**
 * simplifyPattern
 * this is a perf optimization,
 * it is faster to draw a solid color black than pattern #105.
 */
export function simplifyPattern(colorOrPattern: number) {
    if (colorOrPattern === 100) {
        return clrWhite;
    } else if (colorOrPattern === 105) {
        return clrBlack;
    } else {
        return colorOrPattern;
    }
}
