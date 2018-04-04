
/* autoimport:start */
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { IconInfo, RenderIcon, RenderIconSet, RenderIconManager, UI512ImageCollectionCollection, UI512ImageCollection, UI512ImageCollectionImage } from "../ui512/ui512rendericon.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export const clrBlack = 0;
export const clrWhite = 1;
export const clrTransp = 2;
// 100 and above are patterns from 001.png

export function makePainterCvDataDraw(arr: Uint8ClampedArray, widthParam: number, heightParam: number) {
    let ret = new UI512Painter();
    ret.cbGetCanvasWidth = () => widthParam;
    ret.cbGetCanvasHeight = () => heightParam;
    ret.cbGetBackingSurface = () => arr;
    ret.cbGetSurfaceName = () => "makePainterCvDataDraw";
    ret.cbSupportsPatterns = () => false;
    ret.cbSetPixel = (x: number, y: number, color: number) => {
        if (!RectUtils.hasPoint(x, y, 0, 0, widthParam, heightParam)) {
            return;
        }

        let offset = 4 * (y * widthParam + x);
        if (color === clrTransp) {
            arr[offset + 0] = 0;
            arr[offset + 1] = 0;
            arr[offset + 2] = 0;
            arr[offset + 3] = 0;
        } else if (color === clrBlack) {
            arr[offset + 0] = 0;
            arr[offset + 1] = 0;
            arr[offset + 2] = 0;
            arr[offset + 3] = 255;
        } else if (color === clrWhite) {
            arr[offset + 0] = 255;
            arr[offset + 1] = 255;
            arr[offset + 2] = 255;
            arr[offset + 3] = 255;
        } else {
            assertTrueWarn(false, `2~|unknown color ${color}`);
        }
    };

    ret.cbFillRect = (xin: number, yin: number, win: number, hin: number, color: number) => {
        for (let y = yin; y < yin + hin; y++) {
            for (let x = xin; x < xin + win; x++) {
                ret.cbSetPixel(x, y, color);
            }
        }
    };

    ret.cbReadPixelSupported = () => true;
    ret.cbReadPixel = (x: number, y: number) => {
        const i = (y * widthParam + x) * 4;
        if (arr[i] === 0 && arr[i + 1] === 0 && arr[i + 2] === 0 && arr[i + 3] < 5) {
            return clrTransp;
        } else if (arr[i] > 250 && arr[i + 1] > 250 && arr[i + 2] > 250) {
            return clrWhite;
        } else if (arr[i] < 5 && arr[i + 1] < 5 && arr[i + 2] < 5 && arr[i + 3] > 250) {
            return clrBlack;
        } else {
            assertTrueWarn(false, `2||unsupported color ${arr[i]},${arr[i + 1]},${arr[i + 2]},${arr[i + 3]}`);
            return clrBlack;
        }
    };

    return ret;
}

export function makePainterCvDataWithPatternSupport(arr: Uint8ClampedArray, widthParam: number, heightParam: number) {
    let ret = makePainterCvDataDraw(arr, widthParam, heightParam);
    ret.cbGetCanvasWidth = () => widthParam;
    ret.cbGetCanvasHeight = () => heightParam;
    ret.cbGetBackingSurface = () => arr;
    ret.cbGetSurfaceName = () => "makePainterCvDataWithPatternSupport";
    ret.cbSupportsPatterns = () => true;
    let rawSetPixel = ret.cbSetPixel;
    ret.cbSetPixel = (x: number, y: number, color: number) => {
        const offsetpatternx = 0;
        const offsetpatterny = 0;
        // fill with a pattern
        if (color >= 100) {
            const dim = 8;
            let patternstring = UI512Painter.patterns[color];
            assertEq(dim * dim, slength(patternstring), "3B|");
            let xmod = (x + offsetpatternx) % dim;
            let ymod = (y + offsetpatterny) % dim;
            let index = ymod * dim + xmod;
            let c = patternstring.charCodeAt(index);
            color = c === UI512Painter.c0 ? clrBlack : clrWhite;
        }

        rawSetPixel(x, y, color);
    };

    ret.cbFillRect = (xin: number, yin: number, win: number, hin: number, color: number) => {
        for (let y = yin; y < yin + hin; y++) {
            for (let x = xin; x < xin + win; x++) {
                ret.cbSetPixel(x, y, color);
            }
        }
    };

    return ret;
}

export function simplifyPattern(colorOrPattern: number) {
    // perf optimization to not support patterns when possible
    if (colorOrPattern === 100) {
        return clrWhite;
    } else if (colorOrPattern === 105) {
        return clrBlack;
    } else {
        return colorOrPattern;
    }
}

export function needsPatternSupport(fillcolor: O<number>) {
    return fillcolor && fillcolor > 50;
}

export function makePainterCvCanvas(cv: CanvasWrapper, widthParam: number, heightParam: number) {
    let ret = new UI512Painter();
    ret.cbGetCanvasWidth = () => widthParam;
    ret.cbGetCanvasHeight = () => heightParam;
    ret.cbGetBackingSurface = () => cv;
    ret.cbGetSurfaceName = () => "makePainterCvCanvas";
    ret.cbSupportsPatterns = () => false;
    const cvcontext = cv.context;
    ret.cbSetPixel = (x: number, y: number, color: number) => {
        if (color === clrBlack) {
            cv.fillPixelUnchecked(x, y, "black");
        } else if (color === clrWhite) {
            cv.fillPixelUnchecked(x, y, "white");
        } else if (color === clrTransp) {
            cvcontext.clearRect(x, y, 1, 1);
        } else {
            assertTrueWarn(false, "32|unsupported color", color);
        }
    };

    ret.cbReadPixelSupported = () => false;
    ret.cbReadPixel = (x: number, y: number): number => {
        throw makeUI512Error("31|not implemented");
    };

    ret.cbFillRect = (x: number, y: number, w: number, h: number, color: number) => {
        if (color === clrBlack) {
            cv.fillRectUnchecked(x, y, w, h, "black");
        } else if (color === clrWhite) {
            cv.fillRectUnchecked(x, y, w, h, "white");
        } else if (color === clrTransp) {
            cvcontext.clearRect(x, y, w, h);
        } else {
            assertTrueWarn(false, "30|unsupported color", color);
        }
    };

    return ret;
}

export class UI512Painter {
    cbSetPixel: (x: number, y: number, color: number) => void;
    cbFillRect: (x: number, y: number, w: number, h: number, color: number) => void;
    cbReadPixel: (x: number, y: number) => number;
    cbReadPixelSupported: () => boolean;
    cbGetCanvasWidth: () => number;
    cbGetCanvasHeight: () => number;
    cbGetBackingSurface: () => any;
    cbGetSurfaceName: () => string;
    cbSupportsPatterns: () => boolean;

    fillRectMightBeClear(x: number, y: number, w: number, h: number, fill: O<number>) {
        if (fill !== undefined) {
            this.cbFillRect(x, y, w, h, fill);
        }
    }

    // "pencil" tool
    higherSmearPixels(xpts: LockableArr<number>, ypts: LockableArr<number>, colorparam: number) {
        let realSetPixel = this.cbSetPixel;
        this.smearShapes(xpts, ypts, colorparam, (x: number, y: number, color: number) => {
            realSetPixel(x, y, color);
        });
    }

    // "square brush" or "eraser" tool
    higherSmearRectangle(xpts: LockableArr<number>, ypts: LockableArr<number>, colorparam: number, diameterx: number, diametery: number) {
        let realFillRect = this.cbFillRect;
        this.smearShapes(xpts, ypts, colorparam, (x: number, y: number, color: number) => {
            realFillRect(x - Math.floor(diameterx / 2), y - Math.floor(diametery / 2), diameterx, diametery, color);
        });
    }

    // "brush" tool
    higherSmearSmallBrush(xpts: LockableArr<number>, ypts: LockableArr<number>, colorparam: number) {
        let realFillRect = this.cbFillRect;
        this.smearShapes(xpts, ypts, colorparam, (x: number, y: number, color: number) => {
            // central 4x2 rectangle
            realFillRect(x - 1, y, 4, 2, color);
            // first smaller 2x1 rectangle
            realFillRect(x, y - 1, 2, 1, color);
            // second smaller 2x1 rectangle
            realFillRect(x, y + 2, 2, 1, color);
        });
    }

    // "spraycan" tool
    higherSmearSpraycan(xpts: LockableArr<number>, ypts: LockableArr<number>, colorparam: number) {
        let realSetPixel = this.cbSetPixel;
        this.smearShapes(xpts, ypts, colorparam, (x: number, y: number, color: number) => {
            realSetPixel(x + -1, y + -8, color);
            realSetPixel(x + 3, y + -7, color);
            realSetPixel(x + -6, y + -6, color);
            realSetPixel(x + 0, y + -6, color);
            realSetPixel(x + -3, y + -5, color);
            realSetPixel(x + 2, y + -4, color);
            realSetPixel(x + 6, y + -4, color);
            realSetPixel(x + -8, y + -3, color);
            realSetPixel(x + -2, y + -3, color);
            realSetPixel(x + -5, y + -2, color);
            realSetPixel(x + 1, y + -2, color);
            realSetPixel(x + 4, y + -2, color);
            realSetPixel(x + -1, y + -1, color);
            realSetPixel(x + 7, y + -1, color);
            realSetPixel(x + -3, y + 0, color);
            realSetPixel(x + 1, y + 0, color);
            realSetPixel(x + -8, y + 1, color);
            realSetPixel(x + -5, y + 1, color);
            realSetPixel(x + 4, y + 1, color);
            realSetPixel(x + -2, y + 2, color);
            realSetPixel(x + 2, y + 2, color);
            realSetPixel(x + 6, y + 2, color);
            realSetPixel(x + -4, y + 3, color);
            realSetPixel(x + -7, y + 4, color);
            realSetPixel(x + -1, y + 4, color);
            realSetPixel(x + 2, y + 4, color);
            realSetPixel(x + 5, y + 5, color);
            realSetPixel(x + -4, y + 6, color);
            realSetPixel(x + 0, y + 7, color);
        });
    }

    protected smearShapes(
        xpts: LockableArr<number>,
        ypts: LockableArr<number>,
        color: number,
        newSetPixel: (x: number, y: number, color: number) => void
    ) {
        let realSetPixel = this.cbSetPixel;
        let realFillRect = this.cbFillRect;
        try {
            this.cbFillRect = () => {
                throw makeUI512Error("shouldn't be called");
            };
            this.cbSetPixel = newSetPixel;
            if (xpts.len() === 1 && ypts.len() === 1) {
                // plot one point
                this.plotLine(xpts.at(0), ypts.at(0), xpts.at(0), ypts.at(0), color);
            } else {
                // unconnected polygon
                for (let i = 0; i < xpts.len() - 1; i++) {
                    this.plotLine(xpts.at(i), ypts.at(i), xpts.at(i + 1), ypts.at(i + 1), color);
                }
            }
        } finally {
            this.cbSetPixel = realSetPixel;
            this.cbFillRect = realFillRect;
        }
    }

    /*
    drawing thicker lines used to be done by drawing the shape x times in a diagonal line from x-linesize/2 to x+linesize/2.
    drawing an elipse can be done by drawing n ellipses from furthest out inwards, which works
    this new way works better than all of them though.
    */

    protected canAdjustLineSize(fillcolor: O<number>, linesize: number, fn: (fill: O<number>, ofx: number, ofy: number) => void) {
        fn(fillcolor, 0, 0);
        if (linesize > 1) {
            // draw lots of transparent ones to make the border bigger
            fn(undefined, 0, 1);
            fn(undefined, 0, -1);
            fn(undefined, 1, 0);
            fn(undefined, -1, 0);
        }
    }

    higherStraightLine(x0: number, y0: number, x1: number, y1: number, color: number, linesize: number) {
        let w = x1 - x0;
        let h = y1 - y0;
        return this.canAdjustLineSize(0, linesize, (fillcolorinput: O<number>, ofx: number, ofy: number) => {
            let x1 = x0 + ofx + w,
                y1 = y0 + ofy + h;
            this.plotLine(x0 + ofx, y0 + ofy, x1, y1, color);
        });
    }

    higherRoundRect(x0: number, y0: number, x1: number, y1: number, color: number, fillcolor: O<number>, linesize: number) {
        let w = x1 - x0;
        let h = y1 - y0;
        return this.canAdjustLineSize(fillcolor, linesize, (fillcolorinput: O<number>, ofx: number, ofy: number) => {
            this.drawvpcroundrectPorted(x0 + ofx, y0 + ofy, w, h, color, fillcolorinput);
        });
    }

    higherRectangle(x0: number, y0: number, x1: number, y1: number, color: number, fillcolor: O<number>, linesize: number) {
        let w = x1 - x0;
        let h = y1 - y0;
        return this.canAdjustLineSize(fillcolor, linesize, (fillcolorinput: O<number>, ofx: number, ofy: number) => {
            this.drawboxthinborderPorted(x0 + ofx, y0 + ofy, w, h, color, fillcolorinput);
        });
    }

    higherCurve(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, color: number, linesize: number) {
        return this.canAdjustLineSize(0, linesize, (fillcolorinput: O<number>, ofx: number, ofy: number) => {
            this.plotQuadBezier(x0 + ofx, y0 + ofy, x1 + ofx, y1 + ofy, x2 + ofx, y2 + ofy, color);
        });
    }

    higherPlotEllipse(xm: number, ym: number, x1: number, y1: number, color: number, fillcolor: O<number>, linesize: number) {
        let w = x1 - xm;
        let h = y1 - ym;
        let centerx = xm + Math.floor(w / 2);
        let centery = ym + Math.floor(h / 2);
        let a = Math.floor(w / 2);
        let b = Math.floor(h / 2);

        return this.canAdjustLineSize(fillcolor, linesize, (fillcolorinput: O<number>, ofx: number, ofy: number) => {
            this.plotEllipseAxis(centerx + ofx, centery + ofy, a, b, color, fillcolorinput);
        });
    }

    floodFill(xinput: number, yinput: number, color: number) {
        assertTrue(isFinite(xinput) && isFinite(yinput), "not finite", xinput, yinput);
        if (color > 50) {
            // if pattern support is needed, do it in 2 steps.
            // necessary because our algorithm reads what we have set to see where we have gone.
            // , so it'd be thrown off if we are drawing a pattern as we are going.
            let currentColor = this.cbReadPixel(xinput, yinput);
            let changedColor: number;
            if (currentColor === clrBlack) {
                changedColor = clrWhite;
            } else if (currentColor === clrWhite) {
                changedColor = clrBlack;
            } else {
                changedColor = clrBlack;
            }
            let simpleDraw = makePainterCvDataDraw(this.cbGetBackingSurface(), this.cbGetCanvasWidth(), this.cbGetCanvasHeight());
            let recordOutputX: number[] = [],
                recordOutputY: number[] = [];
            simpleDraw.floodFillWithoutPattern(xinput, yinput, changedColor, recordOutputX, recordOutputY);
            for (let i = 0; i < recordOutputX.length; i++) {
                this.cbSetPixel(recordOutputX[i], recordOutputY[i], color);
            }
        } else {
            this.floodFillWithoutPattern(xinput, yinput, color, undefined, undefined);
        }
    }

    protected floodFillWithoutPattern(
        xinput: number,
        yinput: number,
        tmpColor: number,
        recordOutputX?: number[],
        recordOutputY?: number[]
    ) {
        // from Jared Updike, http://stackoverflow.com/questions/1257117/does-anyone-have-a-working-non-recursive-floodfill-algorithm-written-in-c
        // modified by Ben Fisher, lb_drawing.h from fastpixelpic
        const w = this.cbGetCanvasWidth();
        const h = this.cbGetCanvasHeight();
        if (!RectUtils.hasPoint(xinput, yinput, 0, 0, w, h)) {
            return 0;
        }

        let qx: number[] = [];
        let qy: number[] = [];

        const targetColor = this.cbReadPixel(xinput, yinput);
        if (targetColor === tmpColor) {
            // no work needed
            return 0;
        }

        qx.push(xinput);
        qy.push(yinput);
        let countPixelsWritten = 0;
        let maxallowediters = 1000 * w * h;
        let counter = 0;
        while (qx.length > 0) {
            counter += 1;
            if (counter > maxallowediters) {
                assertTrueWarn(false, `39|exceeded maxallowediters ${counter}`);
                return countPixelsWritten;
            }

            let x = qx.pop() as number;
            let y = qy.pop() as number;
            if (RectUtils.hasPoint(x, y, 0, 0, w, h) && this.cbReadPixel(x, y) === targetColor) {
                countPixelsWritten += 1;
                this.cbSetPixel(x, y, tmpColor);
                if (recordOutputX) {
                    (recordOutputX as any).push(x);
                    (recordOutputY as any).push(y);
                }

                qx.push(x + 1);
                qy.push(y);
                qx.push(x - 1);
                qy.push(y);
                qx.push(x);
                qy.push(y + 1);
                qx.push(x);
                qy.push(y - 1);
            }
        }

        return countPixelsWritten;
    }

    /*
    * Bresenham Curve Rasterizing Algorithms
    Used with explicit permission, e-mail on Oct 27 2017
    * @author  Zingl Alois
    * @date    17.12.2014
    * @version 1.3
    * @url     http://members.chello.at/easyfilter/bresenham.html
    */
    plotLine(x0: number, y0: number, x1: number, y1: number, color: number) {
        x0 = Math.floor(x0);
        y0 = Math.floor(y0);
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        let dx = Math.abs(x1 - x0),
            sx = x0 < x1 ? 1 : -1;
        let dy = -Math.abs(y1 - y0),
            sy = y0 < y1 ? 1 : -1;
        let err = dx + dy,
            e2; /* error value e_xy */

        for (;;) {
            /* loop */
            this.cbSetPixel(x0, y0, color);
            if (x0 === x1 && y0 === y1) {
                break;
            }

            e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x0 += sx;
            } /* x step */
            if (e2 <= dx) {
                err += dx;
                y0 += sy;
            } /* y step */
        }
    }

    plotEllipse(xm: number, ym: number, w: number, h: number, color: number, fillcolor: O<number>) {
        this.plotEllipseAxis(xm + Math.floor(w / 2), ym + Math.floor(h / 2), Math.floor(w / 2), Math.floor(h / 2), color, fillcolor);
    }

    protected plotEllipseAxis(xm: number, ym: number, a: number, b: number, color: number, fillcolor: O<number>) {
        xm = Math.floor(xm);
        ym = Math.floor(ym);
        a = Math.floor(a);
        b = Math.floor(b);
        let x = -a,
            y = 0; /* II. quadrant from bottom left to top right */
        let e2,
            dx = (1 + 2 * x) * b * b; /* error increment  */
        let dy = x * x,
            err = dx + dy; /* error of 1.step */

        do {
            this.fillRectMightBeClear(xm - Math.abs(x), ym - Math.abs(y), Math.abs(x) * 2 + 1, Math.abs(y) * 2 + 1, fillcolor);
            this.cbSetPixel(xm - x, ym + y, color); /*   I. Quadrant */
            this.cbSetPixel(xm + x, ym + y, color); /*  II. Quadrant */
            this.cbSetPixel(xm + x, ym - y, color); /* III. Quadrant */
            this.cbSetPixel(xm - x, ym - y, color); /*  IV. Quadrant */
            e2 = 2 * err;
            if (e2 >= dx) {
                x++;
                err += dx += 2 * b * b;
            } /* x step */
            if (e2 <= dy) {
                y++;
                err += dy += 2 * a * a;
            } /* y step */
        } while (x <= 0);

        while (y++ < b) {
            /* too early stop for flat ellipses with a=1, */
            this.fillRectMightBeClear(xm, ym - Math.abs(y), 1, Math.abs(y) * 2, fillcolor);
            this.cbSetPixel(xm, ym - y, color); /* -> finish tip of ellipse */
            this.cbSetPixel(xm, ym + y, color);
        }
    }

    plotCircle(xm: number, ym: number, r: number, color: number, fillcolor: number) {
        xm = Math.floor(xm);
        ym = Math.floor(ym);
        r = Math.floor(r);
        let x = -r,
            y = 0,
            err = 2 - 2 * r; /* bottom left to top right */
        do {
            this.cbSetPixel(xm - x, ym + y, color); /*   I. Quadrant +x +y */
            this.cbSetPixel(xm - y, ym - x, color); /*  II. Quadrant -x +y */
            this.cbSetPixel(xm + x, ym - y, color); /* III. Quadrant -x -y */
            this.cbSetPixel(xm + y, ym + x, color); /*  IV. Quadrant +x -y */
            r = err;
            if (r <= y) {
                err += ++y * 2 + 1; /* y step */
            }

            if (r > x || err > y) {
                err += ++x * 2 + 1; /* x step */
            }
        } while (x < 0);
    }

    plotQuadBezierSeg(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, color: number) {
        /* plot a limited quadratic Bezier segment */

        let sx = x2 - x1,
            sy = y2 - y1;
        let xx = x0 - x1,
            yy = y0 - y1,
            xy; /* relative values for checks */
        let dx,
            dy,
            err,
            cur = xx * sy - yy * sx; /* curvature */

        if (!(xx * sx <= 0 && yy * sy <= 0)) {
            console.error("38|sign of gradient must not change");
            return;
        }

        if (sx * sx + sy * sy > xx * xx + yy * yy) {
            /* begin with shorter part */
            x2 = x0;
            x0 = sx + x1;
            y2 = y0;
            y0 = sy + y1;
            cur = -cur; /* swap P0 P2 */
        }
        if (cur !== 0) {
            /* no straight line */
            xx += sx;
            xx *= sx = x0 < x2 ? 1 : -1; /* x step direction */
            yy += sy;
            yy *= sy = y0 < y2 ? 1 : -1; /* y step direction */
            xy = 2 * xx * yy;
            xx *= xx;
            yy *= yy; /* differences 2nd degree */
            if (cur * sx * sy < 0) {
                /* negated curvature? */
                xx = -xx;
                yy = -yy;
                xy = -xy;
                cur = -cur;
            }
            dx = 4.0 * sy * cur * (x1 - x0) + xx - xy; /* differences 1st degree */
            dy = 4.0 * sx * cur * (y0 - y1) + yy - xy;
            xx += xx;
            yy += yy;
            err = dx + dy + xy; /* error 1st step */
            do {
                this.cbSetPixel(x0, y0, color); /* plot curve */
                if (x0 === x2 && y0 === y2) {
                    return; /* last pixel -> curve finished */
                }

                y1 = 2 * err < dx ? 1 : 0; /* save value for test of y step */
                if (2 * err > dy) {
                    x0 += sx;
                    dx -= xy;
                    err += dy += yy;
                } /* x step */
                if (y1) {
                    y0 += sy;
                    dy -= xy;
                    err += dx += xx;
                } /* y step */
            } while (dy < 0 && dx > 0); /* gradient negates -> algorithm fails */
        }

        this.plotLine(x0, y0, x2, y2, color); /* plot remaining part to end */
    }

    plotQuadBezier(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, color: number) {
        /* plot any quadratic Bezier curve */
        let x = x0 - x1,
            y = y0 - y1,
            t = x0 - 2 * x1 + x2,
            r;

        if (x * (x2 - x1) > 0) {
            /* horizontal cut at P4? */
            if (y * (y2 - y1) > 0) {
                if (Math.abs((y0 - 2 * y1 + y2) / t * x) > Math.abs(y)) {
                    /* vertical cut at P6 too? */
                    /* which first? */
                    x0 = x2;
                    x2 = x + x1;
                    y0 = y2;
                    y2 = y + y1; /* swap points */
                } /* now horizontal cut at P4 comes first */
            }

            t = (x0 - x1) / t;
            r = (1 - t) * ((1 - t) * y0 + 2.0 * t * y1) + t * t * y2; /* By(t=P4) */
            t = (x0 * x2 - x1 * x1) * t / (x0 - x1); /* gradient dP4/dx=0 */
            x = Math.floor(t + 0.5);
            y = Math.floor(r + 0.5);
            r = (y1 - y0) * (t - x0) / (x1 - x0) + y0; /* intersect P3 | P0 P1 */
            this.plotQuadBezierSeg(x0, y0, x, Math.floor(r + 0.5), x, y, color);
            r = (y1 - y2) * (t - x2) / (x1 - x2) + y2; /* intersect P4 | P1 P2 */
            x0 = x1 = x;
            y0 = y;
            y1 = Math.floor(r + 0.5); /* P0 = P4, P1 = P8 */
        }
        if ((y0 - y1) * (y2 - y1) > 0) {
            /* vertical cut at P6? */
            t = y0 - 2 * y1 + y2;
            t = (y0 - y1) / t;
            r = (1 - t) * ((1 - t) * x0 + 2.0 * t * x1) + t * t * x2; /* Bx(t=P6) */
            t = (y0 * y2 - y1 * y1) * t / (y0 - y1); /* gradient dP6/dy=0 */
            x = Math.floor(r + 0.5);
            y = Math.floor(t + 0.5);
            r = (x1 - x0) * (t - y0) / (y1 - y0) + x0; /* intersect P6 | P0 P1 */
            this.plotQuadBezierSeg(x0, y0, Math.floor(r + 0.5), y, x, y, color);
            r = (x1 - x2) * (t - y2) / (y1 - y2) + x2; /* intersect P7 | P1 P2 */
            x0 = x;
            x1 = Math.floor(r + 0.5);
            y0 = y1 = y; /* P0 = P6, P1 = P7 */
        }
        this.plotQuadBezierSeg(x0, y0, x1, y1, x2, y2, color); /* remaining part */
    }

    fillPolygon(x0: number, y0: number, w: number, h: number, xpts: LockableArr<number>, ypts: LockableArr<number>, color: number) {
        let nodeX: number[] = [];
        let sortByNumber = (a: number, b: number) => {
            return a - b;
        };

        // http://alienryderflex.com/polygon_fill/
        // Loop through the rows of the image.
        for (let pixelY = y0; pixelY < y0 + h; pixelY++) {
            nodeX.length = 0;
            //  Build a list of nodes.
            let nodes = 0;
            let j = xpts.len() - 1;
            let i = 0;
            for (i = 0; i < xpts.len(); i++) {
                if ((ypts.at(i) < pixelY && ypts.at(j) >= pixelY) || (ypts.at(j) < pixelY && ypts.at(i) >= pixelY)) {
                    nodeX[nodes++] = Math.floor(xpts.at(i) + (pixelY - ypts.at(i)) / (ypts.at(j) - ypts.at(i)) * (xpts.at(j) - xpts.at(i)));
                }

                j = i;
            }

            // sort the nodes
            nodeX.sort(sortByNumber);

            //  Fill the pixels between node pairs.
            const IMAGE_LEFT = x0,
                IMAGE_RIGHT = x0 + w;
            for (i = 0; i < nodes; i += 2) {
                if (nodeX[i] >= IMAGE_RIGHT) {
                    break;
                }

                if (nodeX[i + 1] > IMAGE_LEFT) {
                    if (nodeX[i] < IMAGE_LEFT) {
                        nodeX[i] = IMAGE_LEFT;
                    }

                    if (nodeX[i + 1] > IMAGE_RIGHT) {
                        nodeX[i + 1] = IMAGE_RIGHT;
                    }

                    for (j = nodeX[i]; j < nodeX[i + 1]; j++) {
                        this.cbSetPixel(j, pixelY, color);
                    }
                }
            }
        }
    }

    drawboxthinborderPorted(basex: number, basey: number, width: number, height: number, color: number, fill: O<number>) {
        if (width > 0 && height > 0) {
            let realbordersize = 1;
            // clear it
            this.fillRectMightBeClear(basex, basey, width, height, fill);
            // draw borders
            this.cbFillRect(basex, basey, width, realbordersize, color);
            this.cbFillRect(basex, basey, realbordersize, height, color);
            this.cbFillRect(basex, basey + height - realbordersize, width, realbordersize, color);
            this.cbFillRect(basex + width - realbordersize, basey, realbordersize, height, color);
        }
    }

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

        // drawing left side
        stretchV = h - (40 - 27);
        y = by;
        y += 6;
        this.cbFillRect(bx + 0, by + 6, 1, stretchV, clr);
        y = by + 6 + stretchV;
        this.cbFillRect(bx + 0, y, 1, 1, clr);
        y += 1;
        y += 6;

        y = by;
        y += 4;
        this.cbFillRect(bx + 1, y, 1, 2, clr);
        y += 2;
        this.fillRectMightBeClear(bx + 1, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 1, y, 1, 1, fill);
        y += 1;
        this.cbFillRect(bx + 1, y, 1, 2, clr);
        y += 2;
        y += 4;

        y = by;
        y += 3;
        this.cbFillRect(bx + 2, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 2, y, 1, 2, fill);
        y += 2;
        this.fillRectMightBeClear(bx + 2, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 2, y, 1, 3, fill);
        y += 3;
        this.cbFillRect(bx + 2, y, 1, 1, clr);
        y += 1;
        y += 3;

        y = by;
        y += 2;
        this.cbFillRect(bx + 3, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 3, y, 1, 3, fill);
        y += 3;
        this.fillRectMightBeClear(bx + 3, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 3, y, 1, 4, fill);
        y += 4;
        this.cbFillRect(bx + 3, y, 1, 1, clr);
        y += 1;
        y += 2;

        y = by;
        y += 1;
        this.cbFillRect(bx + 4, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 4, y, 1, 4, fill);
        y += 4;
        this.fillRectMightBeClear(bx + 4, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 4, y, 1, 5, fill);
        y += 5;
        this.cbFillRect(bx + 4, y, 1, 1, clr);
        y += 1;
        y += 1;

        y = by;
        y += 1;
        this.cbFillRect(bx + 5, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 5, y, 1, 4, fill);
        y += 4;
        this.fillRectMightBeClear(bx + 5, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 5, y, 1, 5, fill);
        y += 5;
        this.cbFillRect(bx + 5, y, 1, 1, clr);
        y += 1;
        y += 1;

        y = by;
        this.cbFillRect(bx + 6, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 6, y, 1, 5, fill);
        y += 5;
        this.fillRectMightBeClear(bx + 6, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 6, y, 1, 6, fill);
        y += 6;
        this.cbFillRect(bx + 6, y, 1, 1, clr);
        y += 1;

        y = by;
        this.cbFillRect(bx + 7, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 7, y, 1, 5, fill);
        y += 5;
        this.fillRectMightBeClear(bx + 7, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 7, y, 1, 6, fill);
        y += 6;
        this.cbFillRect(bx + 7, y, 1, 1, clr);
        y += 1;

        y = by;
        this.cbFillRect(bx + 8, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 8, y, 1, 5, fill);
        y += 5;
        this.fillRectMightBeClear(bx + 8, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 8, y, 1, 6, fill);
        y += 6;
        this.cbFillRect(bx + 8, y, 1, 1, clr);
        y += 1;

        // drawing middle
        y = by;
        this.cbFillRect(bx + 9, y, stretchH, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + 9, y, stretchH, 5, fill);
        y += 5;
        this.fillRectMightBeClear(bx + 8, by + 6, stretchH, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + 9, y, stretchH, 6, fill);
        y += 6;
        this.cbFillRect(bx + 9, y, stretchH, 1, clr);
        y += 1;

        // drawing right side
        stretchV = h - (40 - 27);
        y = by;
        this.cbFillRect(bx + w - 7 + 0, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + w - 7 + 0, y, 1, 5, fill);
        y += 5;
        this.fillRectMightBeClear(bx + w - 7 + 0, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 0, y, 1, 6, fill);
        y += 6;
        this.cbFillRect(bx + w - 7 + 0, y, 1, 1, clr);
        y += 1;

        y = by;
        y += 1;
        this.cbFillRect(bx + w - 7 + 1, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + w - 7 + 1, y, 1, 4, fill);
        y += 4;
        this.fillRectMightBeClear(bx + w - 7 + 1, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 1, y, 1, 5, fill);
        y += 5;
        this.cbFillRect(bx + w - 7 + 1, y, 1, 1, clr);
        y += 1;
        y += 1;

        y = by;
        y += 1;
        this.cbFillRect(bx + w - 7 + 2, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + w - 7 + 2, y, 1, 4, fill);
        y += 4;
        this.fillRectMightBeClear(bx + w - 7 + 2, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 2, y, 1, 5, fill);
        y += 5;
        this.cbFillRect(bx + w - 7 + 2, y, 1, 1, clr);
        y += 1;
        y += 1;

        y = by;
        y += 2;
        this.cbFillRect(bx + w - 7 + 3, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + w - 7 + 3, y, 1, 3, fill);
        y += 3;
        this.fillRectMightBeClear(bx + w - 7 + 3, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 3, y, 1, 4, fill);
        y += 4;
        this.cbFillRect(bx + w - 7 + 3, y, 1, 1, clr);
        y += 1;
        y += 2;

        y = by;
        y += 3;
        this.cbFillRect(bx + w - 7 + 4, y, 1, 1, clr);
        y += 1;
        this.fillRectMightBeClear(bx + w - 7 + 4, y, 1, 2, fill);
        y += 2;
        this.fillRectMightBeClear(bx + w - 7 + 4, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 4, y, 1, 3, fill);
        y += 3;
        this.cbFillRect(bx + w - 7 + 4, y, 1, 1, clr);
        y += 1;
        y += 3;

        y = by;
        y += 4;
        this.cbFillRect(bx + w - 7 + 5, y, 1, 2, clr);
        y += 2;
        this.fillRectMightBeClear(bx + w - 7 + 5, by + 6, 1, stretchV, fill);
        y = by + 6 + stretchV;
        this.fillRectMightBeClear(bx + w - 7 + 5, y, 1, 1, fill);
        y += 1;
        this.cbFillRect(bx + w - 7 + 5, y, 1, 2, clr);
        y += 2;
        y += 4;

        y = by;
        y += 6;
        this.cbFillRect(bx + w - 7 + 6, by + 6, 1, stretchV, clr);
        y = by + 6 + stretchV;
        this.cbFillRect(bx + w - 7 + 6, y, 1, 1, clr);
        y += 1;
        y += 6;

        return true;
    }

    static readonly defaultPattern = "pattern148";
    static readonly defaultLineColor = clrBlack;
    static readonly defaultFillColor = -1;
    static readonly c0 = "0".charCodeAt(0);
    static readonly c1 = "1".charCodeAt(0);
    static readonly patterns: { [key: number]: string } = {
        100: "1111111111111111111111111111111111111111111111111111111111111111",
        101: "1101111111111110111101111011111111111011011111111110111111111101",
        102: "1111111111111111111111111111111111111111011111111111111111111111",
        103: "1111111111111011111101011111111111111111101111110101111111111111",
        104: "1111111111110111111111111111111111111111011111111111111111111111",
        105: "0000000000000000000000000000000000000000000000000000000000000000",
        106: "1010101001010101101010100101010110101010010101011010101001010101",
        107: "1101111111111111111111011111101111110111111111110111111110111111",
        108: "1101110111111111011101111111111111011101111111110111011111111111",
        109: "0111011111011101011101111101110101110111110111010111011111011101",
        110: "1011011111001111111100111111110111111110111111101111110001111011",
        111: "0111111111111111011101111111111101111111111111110101010111111111",
        112: "1101110111011101011101110111011111011101110111010111011101110111",
        113: "1011101101110111111011101101110110111011011101111110111011011101",
        114: "0111110110111011110001101011101101111101111111101111111011111110",
        115: "0000000001111111011111110111111101111111011111110111111101111111",
        116: "0111011101010101110111010101010101110111010101011101110101010101",
        117: "0011101101111111111100111001011110111100111111011100111111011001",
        118: "0111011111101011110111011011111001110111101111101101110111101011",
        119: "1111011111100011110111010011111001111111111111101111110111111011",
        120: "0011001101010101110011000101010100110011010101011100110001010101",
        121: "0100111011001111111111001110010000100111001111111111001101110010",
        122: "0111111101111111101111101100000111110111111101111110101100011100",
        123: "0000000001111111011111110111111100000000111101111111011111110111",
        124: "0001000101010101010001000101010100010001010101010100010001010101",
        125: "0101010111111111010101011111111101010101111111110101010111111111",
        126: "1101110111111011011100111000101111011101111010000110011111101111",
        127: "0000011110001011110111011011100001110000111010001101110110001110",
        128: "0001000101000100010001000001000100010001010001000100010000010001",
        129: "0111011111011101101010101101110101110111110111011010101011011101",
        130: "0100000101111111011101111111011100010100111101110111011101111111",
        131: "0100000011111111010000000100000001001111010011110100111101001111",
        132: "0000000001000100000000000001000100000000010001000000000000010001",
        133: "0111011110101010110111011010101001110111101010101101110110101010",
        134: "1101101000110111110011010111011010011011110110111011001101101101",
        135: "0000000010000000010000011010001001011101101111100111111111111111",
        136: "0000000000000000000000000100010000000000000000000000000001000100",
        137: "1000100000100010100010000010001010001000001000101000100000100010",
        138: "1110101100010100010111010110001110111110010000011101010100110110",
        139: "0101111110101111000001010000101000000101000010100101111110101111",
        140: "0100100000110000000011000000001000000001000000010000001110000100",
        141: "1011111010000000100010000000100011101011000010001000100010000000",
        142: "1000001001000100001110010100010010000010000000010000000100000001",
        143: "1111111110000000100000001000000010000000100000001000000010000000",
        144: "1100010010000000000011000110100001000011000000100011000000100110",
        145: "1011000100110000000000110001101111011000110000000000110010001101",
        146: "0010001000000100100011000111010000100010000101111001100000010000",
        147: "0100010010001000000100010010001001000100100010000001000100100010",
        148: "1111111111101111111111111011101111111111111011111111111111111111",
    };
}

Object.freeze(UI512Painter.patterns);

export class DissolveImages {
    readonly iconset = "fordissolvet";
    readonly countstages = 12;
    blendAtStage(root: Root, c1: CanvasWrapper, c2: CanvasWrapper, stage: number, comp: RenderComplete) {
        // note: is destructive to c2,
        // changes written to c1
        if (stage <= 0) {
            return;
        }

        // const iconnumber = stage - 1
        const iconnumber = 12;
        let iconManager = cast(root.getIconManager(), RenderIconManager);
        let icon = iconManager.findIcon(this.iconset, iconnumber);
        if (!icon) {
            comp.complete = false;
            return;
        }

        let info = new IconInfo(this.iconset, iconnumber);
        info.iconcentered = false;
        const tilew = icon.srcrect[2];
        const tileh = icon.srcrect[3];

        try {
            c2.context.globalCompositeOperation = "destination-in";
            for (let tiley = 0; tiley < Math.ceil(c2.canvas.height / tileh); tiley++) {
                for (let tilex = 0; tilex < Math.ceil(c2.canvas.width / tilew); tilex++) {
                    let destx = tilex * tilew;
                    let desty = tiley * tileh;
                    icon.drawIntoBox(c2, info, destx, desty, tilex, tiley);
                }
            }
        } finally {
            // don't leave the context drawing in the destination-in mode
            c2.context.globalCompositeOperation = "source-over";
        }

        c1.drawFromImage(c2.canvas, 0, 0, c2.canvas.width, c2.canvas.height, 0, 0, 0, 0, c1.canvas.width, c1.canvas.height);
    }
}

export class UI512ImageSerialization {
    /*
    Serialization.
    First create a width*height string containing one of the ascii characters 0,1,2
    Then compress this string.
    */
    readonly asciiBlack = clrBlack.toString().charAt(0);
    readonly asciiWhite = clrWhite.toString().charAt(0);
    readonly asciiTransp = clrTransp.toString().charAt(0);
    readonly asciiNumBlack = clrBlack.toString().charCodeAt(0);
    readonly asciiNumWhite = clrWhite.toString().charCodeAt(0);
    readonly asciiNumTransp = clrTransp.toString().charCodeAt(0);

    loadFromString(canvas: CanvasWrapper, compressed: string) {
        const w = canvas.canvas.width;
        const h = canvas.canvas.height;
        if (compressed.length === 0) {
            // for convenience, treat empty string as a white image.
            canvas.fillRect(0, 0, w, h, 0, 0, w, h, "white");
            return;
        }

        let data = canvas.context.createImageData(w, h);
        assertEq(data.data.length, 4 * w * h, "2{|");
        let uncompressed = Util512.decompressString(compressed, false);
        checkThrowUI512(
            uncompressed.length * 4 === data.data.length,
            "length mismatch, expected, got",
            data.data.length,
            uncompressed.length * 4
        );

        let drawer = makePainterCvDataDraw(data.data, w, h);
        let i = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let pixel = uncompressed.charCodeAt(i);
                drawer.cbSetPixel(x, y, pixel - this.asciiNumBlack);
                i++;
            }
        }

        canvas.context.putImageData(data, 0, 0);
    }

    writeToString(canvas: CanvasWrapper) {
        const w = canvas.canvas.width;
        const h = canvas.canvas.height;
        let data = canvas.context.getImageData(0, 0, w, h);
        return this.writeToStringFromData(data.data, w, h);
    }

    writeToStringFromData(data: Uint8ClampedArray, w: number, h: number) {
        assertEq(data.length, 4 * w * h, "2`|");
        let reader = makePainterCvDataDraw(data, w, h);
        let result = "";
        let map: { [key: number]: string } = {};
        map[clrBlack] = this.asciiBlack;
        map[clrWhite] = this.asciiWhite;
        map[clrTransp] = this.asciiTransp;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let clr = reader.cbReadPixel(x, y);
                result += map[clr];
            }
        }

        return Util512.compressString(result, false);
    }
}

export enum PaintOntoCanvasShapes {
    __isUI512Enum = 1,
    SmearPencil,
    SmearRectangle,
    SmearSmallBrush,
    SmearSpraycan,
    ShapeLine,
    ShapeRectangle,
    ShapeElipse,
    ShapeRoundRect,
    ShapeCurve,
    Bucket,
    IrregularPolygon,
}

export class PaintOntoCanvas {
    mods: ModifierKeys;
    cardId: string;
    constructor(
        public shape: PaintOntoCanvasShapes,
        public xpts: number[],
        public ypts: number[],
        public color: number,
        public fillColor: number,
        public isFilled = true,
        public lineSize = 1
    ) {}

    static fromMemoryOpts(
        shape: PaintOntoCanvasShapes,
        isErase: boolean,
        fromOptsPattern: string,
        fromOptsFillcolor: number,
        fromOptsLineColor: number,
        fromOptsWide: boolean
    ) {
        let fill = fromOptsFillcolor;
        let isFilled = fromOptsFillcolor !== -1;
        if (shape === PaintOntoCanvasShapes.Bucket) {
            let pattern = fromOptsPattern;
            isFilled = true;
            fill = 0;
            if (pattern.startsWith("pattern")) {
                let npattern = parseInt(pattern.substr("pattern".length), 10);
                fill = isFinite(npattern) ? npattern : 0;
            }
        }

        let ret = new PaintOntoCanvas(shape, [], [], fromOptsLineColor, fill, isFilled, fromOptsWide ? 5 : 1);

        if (isErase) {
            ret.color = clrWhite;
            ret.fillColor = clrWhite;
            ret.isFilled = true;
        }

        return ret;
    }

    static go(args: PaintOntoCanvas, painter: UI512Painter) {
        let color: number = args.color;
        let fillcolor: O<number> = args.isFilled ? simplifyPattern(args.fillColor) : undefined;
        if (args.shape != PaintOntoCanvasShapes.Bucket) {
            assertTrue(
                !needsPatternSupport(color) && !needsPatternSupport(fillcolor),
                "not yet implemented (currently kinda slow when tested)"
            );
        }

        let xpts = args.xpts;
        let ypts = args.ypts;

        switch (args.shape) {
            case PaintOntoCanvasShapes.SmearPencil: {
                return painter.higherSmearPixels(new LockableArr(xpts), new LockableArr(ypts), color);
            }
            case PaintOntoCanvasShapes.SmearRectangle: {
                return painter.higherSmearRectangle(new LockableArr(xpts), new LockableArr(ypts), color, 16, 16);
            }
            case PaintOntoCanvasShapes.SmearSpraycan: {
                return painter.higherSmearSpraycan(new LockableArr(xpts), new LockableArr(ypts), color);
            }
            case PaintOntoCanvasShapes.SmearSmallBrush: {
                return painter.higherSmearSmallBrush(new LockableArr(xpts), new LockableArr(ypts), color);
            }
            case PaintOntoCanvasShapes.ShapeLine: {
                assertEq(2, xpts.length, "ShapeLine");
                assertEq(2, ypts.length, "ShapeLine");
                return painter.higherStraightLine(xpts[0], ypts[0], xpts[1], ypts[1], color, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeRectangle: {
                assertEq(2, xpts.length, "ShapeRectangle");
                assertEq(2, ypts.length, "ShapeRectangle");
                return painter.higherRectangle(xpts[0], ypts[0], xpts[1], ypts[1], color, fillcolor, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeElipse: {
                assertEq(2, xpts.length, "ShapeElipse");
                assertEq(2, ypts.length, "ShapeElipse");
                return painter.higherPlotEllipse(xpts[0], ypts[0], xpts[1], ypts[1], color, fillcolor, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeRoundRect: {
                assertEq(2, xpts.length, "ShapeRoundRect");
                assertEq(2, ypts.length, "ShapeRoundRect");
                return painter.higherRoundRect(xpts[0], ypts[0], xpts[1], ypts[1], color, fillcolor, args.lineSize);
            }
            case PaintOntoCanvasShapes.ShapeCurve: {
                assertEq(3, xpts.length, "ShapeCurve");
                assertEq(3, ypts.length, "ShapeCurve");
                return painter.higherCurve(xpts[0], ypts[0], xpts[1], ypts[1], xpts[2], ypts[2], color, args.lineSize);
            }
            case PaintOntoCanvasShapes.Bucket: {
                assertEq(1, xpts.length, "Bucket");
                assertEq(1, ypts.length, "Bucket");
                return PaintOntoCanvas.paintBucketSlowButWorks(painter, xpts[0], ypts[0], fillcolor || 0);
            }
            case PaintOntoCanvasShapes.IrregularPolygon: {
                return PaintOntoCanvas.paintIrregularPolySlowButWorks(painter, xpts, ypts, fillcolor || 0);
            }
            default: {
                assertTrueWarn(false, "unknown shape", args.shape);
            }
        }
    }

    static paintIrregularPolySlowButWorks(painter: UI512Painter, xpts: number[], ypts: number[], fillcolor: number) {
        fillcolor = simplifyPattern(fillcolor);
        assertTrue(!needsPatternSupport(fillcolor), "not yet implemented");
        if (painter.cbReadPixelSupported()) {
            painter.fillPolygon(
                0,
                0,
                painter.cbGetCanvasWidth(),
                painter.cbGetCanvasHeight(),
                new LockableArr(xpts),
                new LockableArr(ypts),
                fillcolor
            );
        } else {
            // unfortunately, we'll have to make a new painter that supports reading pixels
            let cv: CanvasWrapper = painter.cbGetBackingSurface();
            assertTrue(cv instanceof CanvasWrapper, "cv instanceof CanvasWrapper");
            const w = cv.canvas.width;
            const h = cv.canvas.height;
            let data = cv.context.getImageData(0, 0, w, h);

            let painterWithData = makePainterCvDataDraw(data.data, w, h);
            painterWithData.fillPolygon(0, 0, w, h, new LockableArr(xpts), new LockableArr(ypts), fillcolor);
            cv.context.putImageData(data, 0, 0);
        }
    }

    static paintBucketSlowButWorks(painter: UI512Painter, x: number, y: number, fillpattern: number) {
        fillpattern = simplifyPattern(fillpattern);
        if (painter.cbReadPixelSupported()) {
            painter.floodFill(x, y, fillpattern);
        } else {
            // unfortunately, we'll have to make a new painter that supports reading pixels
            let cv: CanvasWrapper = painter.cbGetBackingSurface();
            assertTrue(cv instanceof CanvasWrapper, "cv instanceof CanvasWrapper");
            const w = cv.canvas.width;
            const h = cv.canvas.height;
            let data = cv.context.getImageData(0, 0, w, h);

            let painterWithData =
                fillpattern > 50 ? makePainterCvDataWithPatternSupport(data.data, w, h) : makePainterCvDataDraw(data.data, w, h);
            painterWithData.floodFill(x, y, fillpattern);
            cv.context.putImageData(data, 0, 0);
        }
    }
}

