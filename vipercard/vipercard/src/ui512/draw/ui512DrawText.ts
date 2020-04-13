
/* auto */ import { CanvasWrapper } from './../utils/utilsCanvasDraw';
/* auto */ import { UI512IsDrawTextInterface } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertTrue } from './../utils/util512AssertCustom';
/* auto */ import { Util512, arLast } from './../utils/util512';
/* auto */ import { FormattedText } from './ui512FormattedText';
/* auto */ import { UI512FontRequest } from './ui512DrawTextFontRequest';
/* auto */ import { CharRectType, DrawCharResult, TextRendererFont, largeArea, specialCharFontChange, specialCharNumNewline, specialCharNumZeroPixelChar, typefacenameToTypefaceIdFull } from './ui512DrawTextClasses';
/* auto */ import { UI512DrawChar } from './ui512DrawTextChar';
/* auto */ import { DrawTextArgs } from './ui512DrawTextArgs';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

const space = ' '.charCodeAt(0);
const dash = '-'.charCodeAt(0);

/**
 * main class to draw text.
 */
export class UI512DrawText implements UI512IsDrawTextInterface {
    cache = new UI512FontRequest();
    static readonly defaultFont = UI512FontRequest.defaultFont;
    static readonly smallestFont = UI512FontRequest.smallestFont;

    /**
     * check if font is supported
     */
    isFontSupported(font: string) {
        font = typefacenameToTypefaceIdFull(font);
        let gridkey = this.cache.stripManuallyAddedStyling(font);
        return this.cache.cachedGrids[gridkey] !== undefined;
    }

    /**
     * measure dimensions of text without drawing onto a canvas
     */
    measureString(s: string) {
        let args = new DrawTextArgs(0, 0, largeArea, largeArea, false, false, false);
        return this.drawStringIntoBox(s, undefined, args);
    }

    /**
     * draws a (plain text) string, returns undefined if still waiting
     * for the font to load.
     */
    drawStringIntoBox(
        s: string,
        canvas: O<CanvasWrapper>,
        args: DrawTextArgs
    ): O<DrawCharResult> {
        if (s === null || s === undefined) {
            assertTrue(false, '3M|tried to draw null string...');
            return new DrawCharResult(args.boxX, args.boxX + 1, args.boxY + 1);
        }

        let text = new FormattedText();
        text.fromSerialized(s);
        return this.drawFormattedStringIntoBox(text, canvas, args);
    }

    /**
     * draws a (formatted) string, returns undefined if still waiting for
     * the font to load.
     */
    drawFormattedStringIntoBox(
        text: FormattedText,
        canvas: O<CanvasWrapper>,
        args: DrawTextArgs
    ): O<DrawCharResult> {
        if (!text) {
            return new DrawCharResult(args.boxX, args.boxX + 1, args.boxY + 1);
        }

        /* the default font must be available */
        if (
            !this.cache.findFont(UI512DrawText.defaultFont) ||
            !this.cache.findFont(args.defaultFont)
        ) {
            return undefined;
        }

        /* are any of the fonts not available? if so, exit early */
        for (let i = 0; i < text.len(); i++) {
            if (!this.cache.findFont(text.fontAt(i))) {
                return undefined;
            }
        }

        return this.drawStringIntoBoxImpl(text, canvas, args);
    }

    /**
     * wrap text, one character at a time. e.g, if there is a long string with no spaces,
     * fall back to wrapping one character at a time.
     */
    protected wrapTextIntoLinesOneCharAtATime(
        s: FormattedText,
        boxW: number,
        ret: LineTextToRender[],
        retStarts: number[],
        charNum: number,
        measurements: DrawCharResult[],
        curX: number
    ) {
        if (
            curX + measurements[charNum].newLogicalX >= boxW &&
            arLast(ret).text.len() > 0
        ) {
            ret.push(new LineTextToRender());
            retStarts.push(charNum);
            curX = 0;
        }

        arLast(ret).text.push(s.charAt(charNum), s.fontAt(charNum));
        curX += measurements[charNum].newLogicalX;
        return curX;
    }

    /**
     * get width in pixels of a span of text.
     */
    protected measureSpanOfText(measurements: DrawCharResult[], n1: number, n2: number) {
        let total = 0;
        for (let i = n1; i < n2; i++) {
            total += measurements[i].newLogicalX;
        }

        return total;
    }

    /**
     * wrap text into lines.
     * 1) measure the size of characters
     * 2) split by words
     * 3) add placeholder at end of string
     * 4) place words into LineTextToRender
     */
    protected wrapTextIntoLines(
        s: FormattedText,
        args: DrawTextArgs
    ): [LineTextToRender[], DrawCharResult[]] {
        let measurements: DrawCharResult[] = [];
        let words: FormattedText[] = [new FormattedText()];
        let wordStarts: number[] = [0];
        for (let i = 0; i < s.len(); i++) {
            /* 1) measure the size of characters */
            let c = s.charAt(i);
            let font = s.fontAt(i);
            let fontObj = this.cache.getFont(font);
            measurements[i] = UI512DrawChar.draw(
                fontObj,
                c,
                0,
                largeArea / 2,
                0,
                0,
                largeArea,
                largeArea,
                undefined
            );

            /* 2) split by words */
            if (i > 0) {
                let prevC = s.charAt(i - 1);
                if (
                    prevC === specialCharNumNewline ||
                    prevC === space ||
                    prevC === dash
                ) {
                    words.push(new FormattedText());
                    wordStarts.push(i);
                }
            }

            arLast(words).push(c, font);
        }

        /* 3) placeholder for the end of the string,
        for convenience drawing the selection when end of string is selected */
        let fontLast = s.len() === 0 ? args.defaultFont : s.fontAt(s.len() - 1);
        words.push(new FormattedText());
        arLast(words).push(specialCharNumZeroPixelChar, fontLast);
        wordStarts.push(s.len());

        /* 4) place words into LineTextToRender */
        let boxW = args.wrap ? args.boxW : largeArea;
        boxW = Math.max(1, boxW);
        let ret = [new LineTextToRender()];
        let retStarts: number[] = [0];
        let curX = 0;
        for (let nWord = 0; nWord < words.length; nWord++) {
            /* make a new line if the last word ended with a newline */
            let word = words[nWord];
            if (nWord > 0) {
                let prevWord = words[nWord - 1];
                if (prevWord.charAt(prevWord.len() - 1) === specialCharNumNewline) {
                    ret.push(new LineTextToRender());
                    retStarts.push(wordStarts[nWord]);
                    curX = 0;
                }
            }

            /* measure the text, unless it's the placeholder at the end */
            let wordMeasured = 0;
            if (nWord < words.length - 1) {
                wordMeasured = this.measureSpanOfText(
                    measurements,
                    wordStarts[nWord],
                    wordStarts[nWord + 1]
                );
            }

            let nextX = curX + wordMeasured;
            if (nextX < boxW) {
                /* it fits on the line */
                arLast(ret).text.append(word);
                curX = nextX;
            } else if (wordMeasured < boxW) {
                /* it would fit on *a* line, just not this line */
                if (arLast(ret).text.len()) {
                    ret.push(new LineTextToRender());
                    retStarts.push(wordStarts[nWord]);
                    curX = 0;
                }

                nextX = curX + wordMeasured;
                arLast(ret).text.append(word);
                curX = nextX;
            } else {
                /* it won't fit on any line at all... */
                /* first go down to the next line if we're not at the start of a line */
                if (arLast(ret).text.len()) {
                    ret.push(new LineTextToRender());
                    retStarts.push(wordStarts[nWord]);
                    curX = 0;
                }

                /* then add chars 1 by 1 */
                for (
                    let charNum = wordStarts[nWord];
                    charNum < wordStarts[nWord + 1];
                    charNum++
                ) {
                    curX = this.wrapTextIntoLinesOneCharAtATime(
                        s,
                        boxW,
                        ret,
                        retStarts,
                        charNum,
                        measurements,
                        curX
                    );
                }
            }
        }

        /* putting abc\ndef into a very narrow field of width 1px, wrapping enabled
        adds an extra vertical space between the c and the d
        doesn't look that bad, but maybe something to revisit */

        /* set charIndices */
        for (let lineNum = 0; lineNum < ret.length; lineNum++) {
            let line = ret[lineNum];
            line.charIndices = [];
            for (
                let charnum = retStarts[lineNum];
                charnum < retStarts[lineNum] + line.text.len();
                charnum++
            ) {
                line.charIndices.push(charnum);
            }
        }

        return [ret, measurements];
    }

    /**
     * draw the caret, a vertical line
     */
    protected drawCaret(args: DrawTextArgs, canvas: CanvasWrapper, bounds: number[]) {
        canvas.fillRect(
            bounds[0],
            bounds[1],
            1,
            bounds[3],
            args.boxX,
            args.boxY,
            args.boxW,
            args.boxH,
            'black'
        );
    }

    /**
     * show text as selected by inverting the colors
     */
    protected drawSelected(
        args: DrawTextArgs,
        canvas: CanvasWrapper,
        bounds: number[],
        type: CharRectType
    ) {
        canvas.invertColorsRect(
            bounds[0],
            bounds[1],
            bounds[2],
            bounds[3],
            args.boxX,
            args.boxY,
            args.boxW,
            args.boxH
        );
    }

    /**
     * for each character, run the callback, draw the caret,
     * highlight the letter if it should be selected
     */
    protected callPerChar(
        args: DrawTextArgs,
        canvas: O<CanvasWrapper>,
        charIndex: number,
        type: CharRectType,
        bounds: number[]
    ): ShouldContinueDrawing {
        /* run the callback and see if it's telling us to stop looping */
        if (
            args.callbackPerChar &&
            args.callbackPerChar(charIndex, type, bounds) === false
        ) {
            return ShouldContinueDrawing.No;
        }

        if (canvas && args.selCaret === args.selEnd) {
            /* draw the caret */
            if (
                args.showCaret &&
                args.selCaret === charIndex &&
                type === CharRectType.Char
            ) {
                this.drawCaret(args, canvas, bounds);
            }
        } else if (canvas) {
            /* highlight the selected text */
            if (
                args.selCaret < args.selEnd &&
                charIndex >= args.selCaret &&
                charIndex < args.selEnd
            ) {
                this.drawSelected(args, canvas, bounds, type);
            } else if (
                args.selEnd < args.selCaret &&
                charIndex >= args.selEnd &&
                charIndex < args.selCaret
            ) {
                this.drawSelected(args, canvas, bounds, type);
            }
        }

        return ShouldContinueDrawing.Yes;
    }

    /**
     * draw one line of text
     */
    protected drawStringIntoBoxImplLine(
        curX: number,
        curY: number,
        baseline: number,
        text: FormattedText,
        canvas: O<CanvasWrapper>,
        args: DrawTextArgs,
        line: LineTextToRender,
        ret: DrawCharResult
    ) {
        assertTrue(
            args.selCaret !== undefined && args.selCaret !== null,
            '3L|invalid selection'
        );
        assertTrue(
            args.selEnd !== undefined && args.selEnd !== null,
            '3K|invalid selection'
        );
        for (let i = 0; i < text.len(); i++) {
            let fontObj = this.cache.getFont(text.fontAt(i));
            let drawn = UI512DrawChar.draw(
                fontObj,
                text.charAt(i),
                curX,
                baseline,
                args.boxX,
                args.boxY,
                args.boxW,
                args.boxH,
                canvas
            );

            let prevX = curX;
            curX = drawn.newLogicalX;
            ret.update(drawn);
            let prevXForBounds = prevX + 1;
            let curXForBounds = curX + 1;

            /* the "logical" bounds is the full area surrounding the character,
            the area that is highlighted when char is selected */
            let cbounds = [
                prevXForBounds,
                curY,
                curXForBounds - prevXForBounds,
                line.tallestLineHeight
            ];
            if (
                this.callPerChar(
                    args,
                    canvas,
                    line.charIndices[i],
                    CharRectType.Char,
                    cbounds
                ) === ShouldContinueDrawing.No
            ) {
                return ret;
            }

            /* region to the left of the text on this line (can be large if
            field is haligned) */
            if (i === 0) {
                let bounds = [
                    args.boxX,
                    curY,
                    prevXForBounds - args.boxX,
                    line.tallestLineHeight
                ];
                if (bounds[2] >= 0 && bounds[3] >= 0) {
                    if (
                        this.callPerChar(
                            args,
                            canvas,
                            line.charIndices[i],
                            CharRectType.SpaceToLeft,
                            bounds
                        ) === ShouldContinueDrawing.No
                    ) {
                        return ret;
                    }
                }
            }

            /* region to the right of the text on this line */
            if (i === text.len() - 1) {
                let bounds = [
                    curXForBounds,
                    curY,
                    args.boxX + args.boxW - curXForBounds,
                    line.tallestLineHeight
                ];
                if (bounds[2] >= 0 && bounds[3] >= 0) {
                    if (
                        this.callPerChar(
                            args,
                            canvas,
                            line.charIndices[i],
                            CharRectType.SpaceToRight,
                            bounds
                        ) === ShouldContinueDrawing.No
                    ) {
                        return ret;
                    }
                }
            }
        }

        return ShouldContinueDrawing.Yes;
    }

    /**
     * draw as asterisk (or solid dot to mimic original os)
     * "ask password"
     */
    static makeAsteriskOnlyIfApplicable(textin: FormattedText, args: DrawTextArgs) {
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

    /**
     * main draw text implementation
     */
    protected drawStringIntoBoxImpl(
        textIn: FormattedText,
        canvas: O<CanvasWrapper>,
        args: DrawTextArgs
    ): DrawCharResult {
        /* divide into lines */
        textIn = UI512DrawText.makeAsteriskOnlyIfApplicable(textIn, args);
        let [lines, measurements] = this.wrapTextIntoLines(textIn, args);

        /* measure dimensions */
        let totalHeight = 0;
        let lastHeightMeasured = 0;
        let lastCapHeightMeasured = 0;
        for (let i = 0, len = lines.length; i < len; i++) {
            let line = lines[i];
            line.measureWidth(this.cache, measurements);
            line.measureHeight(
                this.cache,
                args.addVSpacing,
                lastHeightMeasured,
                lastCapHeightMeasured
            );
            totalHeight += line.tallestLineHeight;
            lastHeightMeasured = line.tallestLineHeight;
            lastCapHeightMeasured = line.tallestCapHeight;
        }

        /* align vertically if requested */
        let curY = args.boxY - args.vScrollAmt;
        if (args.vAlign) {
            curY = args.boxY + Math.trunc((args.boxH - totalHeight) / 2);
        }

        /* align horizontally if requested */
        let getPositionLineStart = (lineno: number) => {
            if (args.hAlign) {
                return args.boxX + Math.trunc((args.boxW - lines[lineno].width) / 2) - 1;
            } else {
                return args.boxX - args.hScrollAmt;
            }
        };

        let ret = new DrawCharResult(-1, -1, -1);
        let curX = 0;
        for (let lineno = 0; lineno < lines.length; lineno++) {
            curX = getPositionLineStart(lineno);
            let baseline = curY + lines[lineno].tallestCapHeight;
            let text = lines[lineno].text;
            assertTrue(text.len() > 0, '3J|cannot draw empty line');

            if (!args.drawBeyondVisible && curY > args.boxY + args.boxH) {
                /* perf optimization, don't need to keep drawing chars beyond the field */
                return ret;
            } else if (
                !args.drawBeyondVisible &&
                curY + lines[lineno].tallestLineHeight < args.boxY
            ) {
                /* perf optimization, skip this line since it is above visible text */
            } else {
                /* draw this line of text */
                let r = this.drawStringIntoBoxImplLine(
                    curX,
                    curY,
                    baseline,
                    text,
                    canvas,
                    args,
                    lines[lineno],
                    ret
                );
                if (r !== ShouldContinueDrawing.Yes) {
                    return r;
                }
            }

            curY += lines[lineno].tallestLineHeight;
        }

        return ret;
    }

    /**
     * set initial font of the string, preparing FormattedText.newFromSerialized
     */
    static setFont(s: string, font: string) {
        return specialCharFontChange + font + specialCharFontChange + s;
    }

    /**
     * disabled buttons should have the text grayed out,
     * this function will set the font to disabled if there aren't other
     * font customizations.
     */
    static makeInitialTextDisabled(s: string) {
        let search1 =
            specialCharFontChange + 'chicago_12_biuosdce' + specialCharFontChange;
        let repl1 =
            specialCharFontChange + 'chicago_12_biuos+dce' + specialCharFontChange;
        let search2 = specialCharFontChange + 'geneva_9_biuosdce' + specialCharFontChange;
        let repl2 = specialCharFontChange + 'geneva_9_biuos+dce' + specialCharFontChange;

        if (s.length === 0) {
            /* empty string, no point in changing style */
            return s;
        } else if (!s.startsWith(specialCharFontChange)) {
            /* text uses the default font, so add disabled style */
            return repl1 + s;
        } else {
            /* there are only 2 fonts where we support a disabled style,
            if it's one of these we will make it disabled,
            otherwise, leave formatting as is. */
            return s
                .replace(new RegExp(Util512.escapeForRegex(search1), 'ig'), repl1)
                .replace(new RegExp(Util512.escapeForRegex(search2), 'ig'), repl2);
        }
    }
}

/**
 * we draw text one line at a time
 * this helps for computing horizontal alignment
 */
class LineTextToRender {
    text = new FormattedText();
    tallestLineHeight = -1;
    tallestCapHeight = -1;
    width = -1;
    charIndices: number[] = [];

    /**
     * get total height of the line (in pixels). need to check every character,
     * because there could be one very tall character in a different font
     */
    measureHeight(
        cache: UI512FontRequest,
        addVSpacing: number,
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
            this.tallestLineHeight = Math.max(
                this.tallestLineHeight,
                currentFont.grid.getLineHeight()
            );
            this.tallestCapHeight = Math.max(
                this.tallestCapHeight,
                currentFont.grid.getCapHeight()
            );
        }

        this.tallestLineHeight += addVSpacing;
    }

    /**
     * get total width of this line (in pixels)
     */
    measureWidth(cache: UI512FontRequest, measurements: DrawCharResult[]) {
        let curX = 0;
        for (let i = 0; i < this.text.len(); i++) {
            if (this.text.charAt(i) !== specialCharNumZeroPixelChar) {
                let drawn = this.measureChar(i, measurements);
                assertTrue(drawn !== undefined, 'I[|');
                curX += drawn.newLogicalX;
            }
        }

        this.width = curX;
    }

    /**
     * get measurements of a character
     */
    measureChar(i: number, measurements: DrawCharResult[]) {
        let totalNumber = this.charIndices[i];
        return measurements[totalNumber];
    }
}

/**
 * indicate if we should continue drawing text
 */
const enum ShouldContinueDrawing {
    None = 1,
    No,
    Yes
}
