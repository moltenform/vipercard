
/* auto */ import { ScrollConsts } from './../utils/utilsDrawConstants';
/* auto */ import { CanvasWrapper } from './../utils/utilsCanvasDraw';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertTrue } from './../utils/util512Assert';
/* auto */ import { DrawCharResult, TextFontStyling, TextRendererFont, specialCharNumNewline, specialCharNumNonBreakingSpace, specialCharNumOnePixelSpace, specialCharNumTab, specialCharNumZeroPixelChar } from './ui512DrawTextClasses';
/* auto */ import { UI512DrawTextCharGrayed } from './ui512DrawTextCharGrayed';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

const space = ' '.charCodeAt(0);

/**
 * draw one character onto a canvas
 * returns metadata/dimensions of the character drawn
 */
export const UI512DrawChar = /* static class */ {
    /**
     * draw a character, does some redirection like unknown -> ?
     * and tab -> spaces
     */
    draw(
        font: TextRendererFont,
        n: number,
        x: number,
        baseline: number,
        destX0: number,
        destY0: number,
        destW: number,
        destH: number,
        canvas?: O<CanvasWrapper>
    ): DrawCharResult {
        if (n === specialCharNumTab) {
            /* to draw a tab, just draw 4 spaces */
            let ret = new DrawCharResult(0, 0, 0);
            for (let i = 0; i < ScrollConsts.TabSize; i++) {
                ret = UI512DrawChar.draw(
                    font,
                    space,
                    x,
                    baseline,
                    destX0,
                    destY0,
                    destW,
                    destH,
                    canvas
                );
                x = ret.newLogicalX;
            }

            return ret;
        } else if (n === specialCharNumOnePixelSpace) {
            /* character 1 is a one-pixel spacer */
            /* pretend to draw a 1x1 pixel, exit early before applying any styling */
            return new DrawCharResult(x + 1, x, baseline);
        } else if (n === specialCharNumNewline) {
            /* character is a zero-pixel placeholder representing the newline */
            return new DrawCharResult(x, x, baseline);
        } else if (n === specialCharNumZeroPixelChar) {
            /* character is a zero-pixel placeholder */
            return new DrawCharResult(x, x, baseline);
        } else if (n === specialCharNumNonBreakingSpace) {
            /* draw a nbsp as a space, the only place nbsp is different is in
            GetCharClass */
            n = space;
        } else if (n < 32 || n >= font.grid.metrics.bounds.length) {
            /* invalid characters drawn as '?' */
            n = '?'.charCodeAt(0);
        }

        return UI512DrawChar._drawImpl(
            font,
            n,
            x,
            baseline,
            destX0,
            destY0,
            destW,
            destH,
            canvas
        );
    },

    /**
     * draws a character
     */
    _drawImpl(
        font: TextRendererFont,
        n: number,
        x: number,
        baseline: number,
        destX0: number,
        destY0: number,
        destW: number,
        destH: number,
        canvas?: O<CanvasWrapper>
    ): DrawCharResult {
        /* these decorations are flags on the TextRendererFont
        rather than part of the grid. */
        assertTrue(
            (font.grid.spec.style & TextFontStyling.Underline) === 0,
            '3S|style should have been removed'
        );
        assertTrue(
            (font.grid.spec.style & TextFontStyling.Condense) === 0,
            '3R|style should have been removed'
        );
        assertTrue(
            (font.grid.spec.style & TextFontStyling.Extend) === 0,
            '3Q|style should have been removed'
        );

        /* get dimensions of the subset from source image */
        let bounds = font.grid.metrics.bounds[n] as number[];
        assertTrue(bounds && bounds.length >= 6, '3P|invalid bounds');
        let logicalHorizontalSpace = bounds[4];
        let verticalOffset = bounds[5];

        /* get coordinates within source image */
        let srcX = bounds[0] + (font.grid.metrics.leftmost - 1);
        let srcY = bounds[1];
        let srcW = bounds[2] - (font.grid.metrics.leftmost - 1);
        let srcH = bounds[3];

        /* ensure dimensions are >= 1; there are empty chars like an italics space */
        srcW = Math.max(1, srcW);
        srcH = Math.max(1, srcH);

        /* get destination coordinates */
        let destX = x;
        let destY = baseline + verticalOffset - font.grid.metrics.capHeight;

        /* get logical spacing */
        /* for example, when drawing italics,
        the spacing < the width of the character drawn */
        let spacing = logicalHorizontalSpace - font.grid.metrics.leftmost;
        spacing += font.grid.adjustHSpacing ?? 0;
        if (font.extend && !font.condense) {
            spacing = Math.max(1, spacing + 1);
        } else if (font.condense && !font.extend) {
            spacing = Math.max(1, spacing - 1);
        } else {
            spacing = Math.max(1, spacing);
        }

        if (canvas) {
            if (font.grayed) {
                UI512DrawTextCharGrayed.go(
                    font.grid.image,
                    canvas,
                    srcX,
                    srcY,
                    srcW,
                    srcH,
                    destX,
                    destY,
                    destX0,
                    destY0,
                    destW,
                    destH
                );
            } else {
                canvas.drawFromImage(
                    font.grid.image,
                    srcX,
                    srcY,
                    srcW,
                    srcH,
                    destX,
                    destY,
                    destX0,
                    destY0,
                    destW,
                    destH
                );
            }

            /* following original os, underline follows the drawn width
            if longer than the logical width */
            if (font.underline) {
                let underlinelength = Math.max(srcW + 1, spacing);
                canvas.fillRect(
                    destX,
                    baseline + 1,
                    underlinelength,
                    1,
                    destX0,
                    destY0,
                    destW,
                    destH,
                    'black'
                );
            }
        }

        return new DrawCharResult(x + spacing, destX + srcW, destY + srcH);
    }
}


