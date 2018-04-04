
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ScrollConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { DrawCharResult, TextFontStyling, TextRendererFont, specialCharNumNewline, specialCharNumNonBreakingSpace, specialCharNumOnePixelSpace, specialCharNumTab, specialCharNumZeroPixelChar } from '../../ui512/draw/ui512drawtextclasses.js';

const space = ' '.charCodeAt(0);
const dash = '-'.charCodeAt(0);

export class TextRendererFontDrawChar {
    static drawChar(
        font: TextRendererFont,
        n: number,
        x: number,
        baseline: number,
        windowX0: number,
        windowY0: number,
        windowW: number,
        windowH: number,
        canvas?: O<CanvasWrapper>
    ): DrawCharResult {
        if (n === specialCharNumTab) {
            let obj = new DrawCharResult(0, 0, 0);
            for (let i = 0; i < ScrollConsts.tabSize; i++) {
                obj = TextRendererFontDrawChar.drawChar(
                    font,
                    0x20,
                    x,
                    baseline,
                    windowX0,
                    windowY0,
                    windowW,
                    windowH,
                    canvas
                );
                x = obj.newlogicalx;
            }

            return obj;
        } else if (n === specialCharNumOnePixelSpace) {
            // character 1 is a one-pixel spacer
            // pretend to draw a 1x1 pixel, exit early before applying any styling
            return new DrawCharResult(x + 1, x, baseline);
        } else if (n === specialCharNumNewline) {
            // character is a zero-pixel placeholder representing the newline
            return new DrawCharResult(x, x, baseline);
        } else if (n === specialCharNumZeroPixelChar) {
            // character is a zero-pixel placeholder, so empty fields remember the font
            return new DrawCharResult(x, x, baseline);
        } else if (n === specialCharNumNonBreakingSpace) {
            n = space;
        } else if (n < 32 || n >= font.grid.metrics.length) {
            n = '?'.charCodeAt(0);
        }

        // these need to be passed in as bools to the method
        assertTrue((font.grid.spec.style & TextFontStyling.Underline) === 0, '3S|style should have been removed');
        assertTrue((font.grid.spec.style & TextFontStyling.Condensed) === 0, '3R|style should have been removed');
        assertTrue((font.grid.spec.style & TextFontStyling.Extend) === 0, '3Q|style should have been removed');

        let bounds = font.grid.metrics.bounds[n];
        assertTrue(bounds && bounds.length >= 6, '3P|invalid bounds');
        let logicalHorizontalSpace = bounds[4];
        let verticalOffset = bounds[5];

        // get coordinates within source image
        let srcx = bounds[0] + (font.grid.metrics.leftmost - 1);
        let srcy = bounds[1];
        let srcw = bounds[2] - (font.grid.metrics.leftmost - 1);
        let srch = bounds[3];
        srcw = Math.max(1, srcw); /* for empty characters, like an italics space */
        srch = Math.max(1, srch); /* for empty characters, like an italics space */

        // get destination coordinates
        let destx = x;
        let desty = baseline + verticalOffset - font.grid.metrics['cap-height'];

        // get logical spacing
        // for example, when drawing italics, the spacing < the width of the character drawn
        let spacing = logicalHorizontalSpace - font.grid.metrics.leftmost;
        spacing += font.grid.adjustSpacing || 0;
        if (font.extend && !font.condense) {
            spacing = Math.max(1, spacing + 1);
        } else if (font.condense && !font.extend) {
            spacing = Math.max(1, spacing - 1);
        } else {
            spacing = Math.max(1, spacing);
        }

        if (canvas) {
            canvas.drawFromImage(
                font.grid.image,
                srcx,
                srcy,
                srcw,
                srch,
                destx,
                desty,
                windowX0,
                windowY0,
                windowW,
                windowH
            );

            // following emulator, underline follows the drawn width if longer than the logical width
            if (font.underline) {
                let underlinelength = Math.max(srcw + 1, spacing);
                canvas.fillRect(destx, baseline + 1, underlinelength, 1, windowX0, windowY0, windowW, windowH, 'black');
            }
        }

        return new DrawCharResult(x + spacing, destx + srcw, desty + srch);
    }
}
