
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { IFontManager } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CharRectType, DrawCharResult, TextRendererFont, largearea, specialCharFontChange, specialCharNumNewline, specialCharNumZeroPixelChar, typefacenameToTypefaceIdFull } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { TextRendererFontCache } from '../../ui512/draw/ui512DrawTextRequestData.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { RenderTextArgs } from '../../ui512/draw/ui512DrawTextParams.js';
/* auto */ import { TextRendererFontDrawChar } from '../../ui512/draw/ui512DrawTextChar.js';

const space = ' '.charCodeAt(0);
const dash = '-'.charCodeAt(0);

class LineTextToRender {
    text = new FormattedText();
    tallestLineHeight = -1;
    tallestCapHeight = -1;
    width = -1;
    charIndices: number[] = [];

    measureHeight(
        cache: TextRendererFontCache,
        addvspacing: number,
        lastHeightMeasured: number,
        lastCapHeightMeasured: number
    ) {
        if (this.text.len() === 0) {
            this.tallestLineHeight = lastHeightMeasured;
            this.tallestCapHeight = lastCapHeightMeasured;
            return;
        }

        this.tallestLineHeight = 0;
        this.tallestCapHeight = 0;
        let currentFont: TextRendererFont;

        for (let i = 0; i < this.text.len(); i++) {
            currentFont = cache.getFont(this.text.fontAt(i));
            this.tallestLineHeight = Math.max(this.tallestLineHeight, currentFont.grid.getLineHeight());
            this.tallestCapHeight = Math.max(this.tallestCapHeight, currentFont.grid.getCapHeight());
        }

        this.tallestLineHeight += addvspacing;
    }

    measureCharNew(i: number, measurements: DrawCharResult[]) {
        let totalnumber = this.charIndices[i];
        return measurements[totalnumber];
    }

    measureWidthNew(cache: TextRendererFontCache, measurements: DrawCharResult[]) {
        let curX = 0;
        for (let i = 0; i < this.text.len(); i++) {
            if (this.text.charAt(i) !== specialCharNumZeroPixelChar) {
                let drawn = this.measureCharNew(i, measurements);
                assertTrue(drawn !== undefined, '');
                curX += drawn.newlogicalx;
            }
        }

        this.width = curX;
    }
}

export class TextRendererFontManager implements IFontManager {
    cache = new TextRendererFontCache();
    static readonly defaultFont = TextRendererFontCache.defaultFont;
    static readonly smallestFont = TextRendererFontCache.smallestFont;

    isFontSupported(font: string) {
        font = typefacenameToTypefaceIdFull(font);
        let gridkey = this.cache.stripManuallyAddedStyling(font);
        return this.cache.cachedGrids[gridkey] !== undefined;
    }

    measureString(s: string) {
        let args = new RenderTextArgs(0, 0, largearea, largearea, false, false, false);
        return this.drawStringIntoBox(s, undefined, args);
    }

    // returns undefined if waiting for font to load.
    drawStringIntoBox(s: string, canvas: O<CanvasWrapper>, args: RenderTextArgs): O<DrawCharResult> {
        if (s === null || s === undefined) {
            assertTrue(false, '3M|tried to draw null string...');
            return new DrawCharResult(args.boxx, args.boxx + 1, args.boxy + 1);
        }

        let text = new FormattedText();
        text.fromPersisted(s);
        return this.drawFormattedStringIntoBox(text, canvas, args);
    }

    drawFormattedStringIntoBox(text: FormattedText, canvas: O<CanvasWrapper>, args: RenderTextArgs): O<DrawCharResult> {
        if (!text) {
            return new DrawCharResult(args.boxx, args.boxx + 1, args.boxy + 1);
        }

        // the default font must be available
        if (!this.cache.findFont(TextRendererFontManager.defaultFont) || !this.cache.findFont(args.defaultFont)) {
            return undefined;
        }

        // are any of the fonts available?
        for (let i = 0; i < text.len(); i++) {
            if (!this.cache.findFont(text.fontAt(i))) {
                return undefined;
            }
        }

        return this.drawStringIntoBoxImpl(text, canvas, args);
    }

    protected wrapTextIntoLinesOneByOne(
        s: FormattedText,
        boxw: number,
        ret: LineTextToRender[],
        retstarts: number[],
        charnum: number,
        measurements: DrawCharResult[],
        curx: number
    ) {
        if (curx + measurements[charnum].newlogicalx >= boxw && ret[ret.length - 1].text.len() > 0) {
            ret.push(new LineTextToRender());
            retstarts.push(charnum);
            curx = 0;
        }

        ret[ret.length - 1].text.push(s.charAt(charnum), s.fontAt(charnum));
        curx += measurements[charnum].newlogicalx;
        return curx;
    }

    protected wrapTextIntoLinesMeasureSpan(measurements: DrawCharResult[], n1: number, n2: number) {
        let total = 0;
        for (let i = n1; i < n2; i++) {
            total += measurements[i].newlogicalx;
        }

        return total;
    }

    protected wrapTextIntoLines(s: FormattedText, args: RenderTextArgs): [LineTextToRender[], DrawCharResult[]] {
        let measurements: DrawCharResult[] = [];
        let words: FormattedText[] = [new FormattedText()];
        let wordStarts: number[] = [0];
        let divideNext = false;
        // 1) measure the chars and 2) split by words
        for (let i = 0; i < s.len(); i++) {
            let c = s.charAt(i);
            let font = s.fontAt(i);
            let fontobj = this.cache.getFont(font);
            measurements[i] = TextRendererFontDrawChar.drawChar(
                fontobj,
                c,
                0,
                largearea / 2,
                0,
                0,
                largearea,
                largearea,
                undefined
            );

            if (i > 0) {
                let prevC = s.charAt(i - 1);
                if (prevC === specialCharNumNewline || prevC === space || prevC === dash) {
                    words.push(new FormattedText());
                    wordStarts.push(i);
                }
            }

            words[words.length - 1].push(c, font);
        }

        // placeholder for the end of the string, for convenience drawing the selection when end of string is selected
        let fontLast = s.len() === 0 ? args.defaultFont : s.fontAt(s.len() - 1);
        words.push(new FormattedText());
        words[words.length - 1].push(specialCharNumZeroPixelChar, fontLast);
        wordStarts.push(s.len());

        // 3) place words into LineTextToRender
        let boxW = args.wrap ? args.boxw : largearea;
        boxW = Math.max(1, boxW);
        let ret = [new LineTextToRender()];
        let retstarts: number[] = [0];
        let total = 0;
        let curx = 0;
        for (let nword = 0; nword < words.length; nword++) {
            // make a new line if the last word ended with a newline
            let word = words[nword];
            if (nword > 0) {
                let prevword = words[nword - 1];
                if (prevword.charAt(prevword.len() - 1) === specialCharNumNewline) {
                    ret.push(new LineTextToRender());
                    retstarts.push(wordStarts[nword]);
                    curx = 0;
                }
            }

            let wordmeasured =
                nword === words.length - 1
                    ? 0
                    : this.wrapTextIntoLinesMeasureSpan(measurements, wordStarts[nword], wordStarts[nword + 1]);
            let nextx = curx + wordmeasured;
            if (nextx < boxW) {
                // it fits on the line
                ret[ret.length - 1].text.append(word);
                curx = nextx;
            } else if (wordmeasured < boxW) {
                // it would fit on *a* line, just not this line
                if (ret[ret.length - 1].text.len()) {
                    ret.push(new LineTextToRender());
                    retstarts.push(wordStarts[nword]);
                    curx = 0;
                }

                nextx = curx + wordmeasured;
                ret[ret.length - 1].text.append(word);
                curx = nextx;
            } else {
                // it won't fit on any line at all...
                // first go down to the next line if we're not at the start of a line
                if (ret[ret.length - 1].text.len()) {
                    ret.push(new LineTextToRender());
                    retstarts.push(wordStarts[nword]);
                    curx = 0;
                }

                // then add chars 1 by 1
                for (let charnum = wordStarts[nword]; charnum < wordStarts[nword + 1]; charnum++) {
                    curx = this.wrapTextIntoLinesOneByOne(s, boxW, ret, retstarts, charnum, measurements, curx);
                }
            }
        }

        // putting abc\ndef into a very narrow field of width 1px, wrapping enabled
        // currently adds an extra vertical space between the c and the d
        // doesn't look that bad, but maybe something to revisit

        // set charIndices
        for (let linenum = 0; linenum < ret.length; linenum++) {
            let line = ret[linenum];
            line.charIndices = [];
            for (let charnum = retstarts[linenum]; charnum < retstarts[linenum] + line.text.len(); charnum++) {
                line.charIndices.push(charnum);
            }
        }

        return [ret, measurements];
    }

    protected drawCaret(args: RenderTextArgs, canvas: CanvasWrapper, bounds: number[]) {
        // draw a vertical line
        canvas.fillRect(bounds[0], bounds[1], 1, bounds[3], args.boxx, args.boxy, args.boxw, args.boxh, 'black');
    }

    protected drawSelected(args: RenderTextArgs, canvas: CanvasWrapper, bounds: number[], type: CharRectType) {
        canvas.invertColorsRect(bounds[0], bounds[1], bounds[2], bounds[3], args.boxx, args.boxy, args.boxw, args.boxh);
    }

    protected callPerChar(
        args: RenderTextArgs,
        canvas: O<CanvasWrapper>,
        charindex: number,
        type: CharRectType,
        bounds: number[]
    ): boolean {
        if (args.callbackPerChar && args.callbackPerChar(charindex, type, bounds) === false) {
            return false;
        }

        if (canvas && args.selcaret === args.selend) {
            /* draw the caret */
            if (args.showCaret && args.selcaret === charindex && type === CharRectType.Char) {
                this.drawCaret(args, canvas, bounds);
            }
        } else if (canvas) {
            /* highlight the selected text */
            if (args.selcaret < args.selend && charindex >= args.selcaret && charindex < args.selend) {
                this.drawSelected(args, canvas, bounds, type);
            } else if (args.selend < args.selcaret && charindex >= args.selend && charindex < args.selcaret) {
                this.drawSelected(args, canvas, bounds, type);
            }
        }

        return true;
    }

    protected drawStringIntoBoxImplLine(
        curx: number,
        cury: number,
        baseline: number,
        text: FormattedText,
        canvas: O<CanvasWrapper>,
        args: RenderTextArgs,
        line: LineTextToRender,
        ret: DrawCharResult
    ) {
        assertTrue(args.selcaret !== undefined && args.selcaret !== null, '3L|invalid selection');
        assertTrue(args.selend !== undefined && args.selend !== null, '3K|invalid selection');
        for (let i = 0; i < text.len(); i++) {
            let fontobj = this.cache.getFont(text.fontAt(i));
            let drawn = TextRendererFontDrawChar.drawChar(
                fontobj,
                text.charAt(i),
                curx,
                baseline,
                args.boxx,
                args.boxy,
                args.boxw,
                args.boxh,
                canvas
            );

            let prevX = curx;
            curx = drawn.newlogicalx;
            ret.update(drawn);
            let prevxforbounds = prevX + 1;
            let curxforbounds = curx + 1;

            // the "logical" bounds is the full area surrounding the character,
            // the area that is highlighted when char is selected
            let cbounds = [prevxforbounds, cury, curxforbounds - prevxforbounds, line.tallestLineHeight];
            if (!this.callPerChar(args, canvas, line.charIndices[i], CharRectType.Char, cbounds)) {
                return ret;
            }

            // region to the left of the text on this line (can be large if field is haligned)
            if (i === 0) {
                let bounds = [args.boxx, cury, prevxforbounds - args.boxx, line.tallestLineHeight];
                if (bounds[2] >= 0 && bounds[3] >= 0) {
                    if (!this.callPerChar(args, canvas, line.charIndices[i], CharRectType.SpaceToLeft, bounds)) {
                        return ret;
                    }
                }
            }

            // region to the right of the text on this line
            if (i === text.len() - 1) {
                let bounds = [curxforbounds, cury, args.boxx + args.boxw - curxforbounds, line.tallestLineHeight];
                if (bounds[2] >= 0 && bounds[3] >= 0) {
                    if (!this.callPerChar(args, canvas, line.charIndices[i], CharRectType.SpaceToRight, bounds)) {
                        return ret;
                    }
                }
            }
        }

        return undefined;
    }

    static makeAsteriskOnlyIfApplicable(textin: FormattedText, args: RenderTextArgs) {
        if (!args.asteriskOnly) {
            return textin;
        }

        let modifiedText = textin.clone();
        let c = '\xA5'.charCodeAt(0);
        for (let i = 0; i < modifiedText.len(); i++) {
            modifiedText.setCharAt(i, c);
        }

        modifiedText.lock();
        return modifiedText;
    }

    protected drawStringIntoBoxImpl(
        textin: FormattedText,
        canvas: O<CanvasWrapper>,
        args: RenderTextArgs
    ): DrawCharResult {
        textin = TextRendererFontManager.makeAsteriskOnlyIfApplicable(textin, args);
        let [lines, measurements] = this.wrapTextIntoLines(textin, args);

        let totalWidth = 0;
        let totalHeight = 0;
        let lastHeightMeasured = 0;
        let lastCapHeightMeasured = 0;
        for (let line of lines) {
            line.measureWidthNew(this.cache, measurements);
            line.measureHeight(this.cache, args.addvspacing, lastHeightMeasured, lastCapHeightMeasured);
            totalWidth += line.width;
            totalHeight += line.tallestLineHeight;
            lastHeightMeasured = line.tallestLineHeight;
            lastCapHeightMeasured = line.tallestCapHeight;
        }

        let cury = args.boxy - args.vscrollamt;
        if (args.valign) {
            cury = args.boxy + Math.trunc((args.boxh - totalHeight) / 2);
        }

        let getPositionLineStart = (lineno: number) => {
            if (args.halign) {
                const adjustToBetterMatchEmulator = -1;
                return args.boxx + Math.trunc((args.boxw - lines[lineno].width) / 2) + adjustToBetterMatchEmulator;
            } else {
                return args.boxx - args.hscrollamt;
            }
        };

        let ret = new DrawCharResult(-1, -1, -1);
        let curx = 0;
        for (let lineno = 0; lineno < lines.length; lineno++) {
            curx = getPositionLineStart(lineno);
            let baseline = cury + lines[lineno].tallestCapHeight;
            let text = lines[lineno].text;
            assertTrue(text.len() > 0, '3J|cannot draw empty line');

            if (!args.drawBeyondVisible && cury > args.boxy + args.boxh) {
                /* perf optimization, don't need to keep drawing chars beyond the field */
                return ret;
            } else if (!args.drawBeyondVisible && cury + lines[lineno].tallestLineHeight < args.boxy) {
                /* perf optimization, skip this line since it is above visible text */
            } else {
                let r = this.drawStringIntoBoxImplLine(curx, cury, baseline, text, canvas, args, lines[lineno], ret);
                if (r !== undefined) {
                    return r;
                }
            }

            cury += lines[lineno].tallestLineHeight;
        }

        return ret;
    }

    static setInitialFont(s: string, font: string) {
        return specialCharFontChange + font + specialCharFontChange + s;
    }

    static makeInitialTextDisabled(s: string) {
        let search1 = specialCharFontChange + 'chicago_12_biuosdce' + specialCharFontChange;
        let repl1 = specialCharFontChange + 'chicago_12_biuos+dce' + specialCharFontChange;
        let search2 = specialCharFontChange + 'geneva_9_biuosdce' + specialCharFontChange;
        let repl2 = specialCharFontChange + 'geneva_9_biuos+dce' + specialCharFontChange;

        if (s.length === 0) {
            // empty string, no point in changing style
            return s;
        } else if (s.charAt(0) !== specialCharFontChange) {
            // text uses the default font, so add disabled style
            return repl1 + s;
        } else {
            // there are only 2 fonts where we support a disabled style,
            // if it's one of these we will make it disabled,
            // otherwise, leave formatting as is.
            return s.replace(new RegExp(search1, 'ig'), repl1).replace(new RegExp(search2, 'ig'), repl2);
        }
    }
}
