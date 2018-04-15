
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, NullaryFn, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { TextFontStyling, textFontStylingToString } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { RenderTextArgs } from '../../ui512/draw/ui512DrawTextParams.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';

export class TestDrawUI512Text extends UI512TestBase {
    uicontext = false;
    readonly margin = 1;
    tests = [
        'callback/Text Core Fonts',
        (callback: NullaryFn) => {
            testUtilCompareCanvasWithExpected(false, () => this.draw1(), callback);
        },
        'callback/Text All Fonts',
        (callback: NullaryFn) => {
            testUtilCompareCanvasWithExpected(false, () => this.draw2(), callback);
        },
        'callback/Text Wrap, align, underlign',
        (callback: NullaryFn) => {
            testUtilCompareCanvasWithExpected(false, () => this.draw3(), callback);
        },
        'callback/Text corner cases',
        (callback: NullaryFn) => {
            testUtilCompareCanvasWithExpected(false, () => this.draw4(), callback);
        }
    ];

    addFonts(listFonts: string[], sfaces: string, ssizes: string, sstyles: string) {
        let faces = sfaces.split(',');
        let sizes = ssizes.split(',');
        let styles = sstyles.split(',');
        for (let fnt of faces) {
            for (let style of styles) {
                for (let sz of sizes) {
                    let keyname = `${fnt}_${sz}_${style}`;
                    listFonts.push(keyname);
                }
            }
        }
    }

    getFormattedText(list: string[], addNewlines: boolean) {
        let demotextformatted = '';
        for (let i = 0; i < list.length; i++) {
            let demotext = 'File Edit Tools #123 Draw! :) ^^ {omnivore}';
            demotext += addNewlines ? '\n' : '';
            demotextformatted += UI512DrawText.setFont(demotext, list[i]);
        }
        return demotextformatted;
    }

    /* these we have confirmed in the emulator as pixel-perfect */
    draw1() {
        const imwidth = 504;
        const imheight = 556;
        let list: string[] = [];
        this.addFonts(list, 'chicago,courier,geneva', '10,12,14,18,24', 'biuosdce,+biuosdce');
        let drawText = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = !!drawText.drawStringIntoBox(
                this.getFormattedText(list, true),
                canvas,
                new RenderTextArgs(this.margin, this.margin, imwidth - 5, imheight - 5)
            );
        };

        return new CanvasTestParams(
            'drawtext1',
            '/resources/test/drawtextexpected1.png',
            draw,
            imwidth,
            imheight,
            this.uicontext
        );
    }

    /* not yet confirmed as pixel-perfect */
    draw2() {
        const imwidth = 540;
        const imheight = 2450;
        let list: string[] = [];
        this.addFonts(list, 'chicago,courier,geneva', '10,12,14,18,24', 'b+iuosdce,biu+osdce,+b+iuosdce,b+iu+osdce');
        this.addFonts(
            list,
            'new york,times',
            '10,12,14,18,24',
            'biuosdce,+biuosdce,b+iuosdce,biu+osdce,+b+iuosdce,b+iu+osdce'
        );
        this.addFonts(list, 'helvetica', '12', 'biuosdce');
        this.addFonts(list, 'monaco', '9,12', 'biuosdce');
        this.addFonts(list, 'symbol', '12', 'biuosdce');
        let drawText = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = !!drawText.drawStringIntoBox(
                this.getFormattedText(list, true),
                canvas,
                new RenderTextArgs(this.margin, this.margin, imwidth - 5, imheight - 5)
            );
        };

        return new CanvasTestParams(
            'drawtext2',
            '/resources/test/drawtextexpected2.png',
            draw,
            imwidth,
            imheight,
            this.uicontext
        );
    }

    draw3() {
        /* tests wrap, halign, valign, mixsize, underline and condense+extend */
        const imwidth = 300;
        const imheight = 556;
        let list: string[] = [];
        this.addFonts(list, 'geneva', '10,24,12', 'biuosdce,b+i+uosdce,biuosd+ce,bi+uosdc+e');
        let drawText = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = !!drawText.drawStringIntoBox(
                this.getFormattedText(list, false),
                canvas,
                new RenderTextArgs(this.margin, this.margin, imwidth - 5, imheight - 5, true, true, true)
            );
        };

        return new CanvasTestParams(
            'drawtext3',
            '/resources/test/drawtextexpected3.png',
            draw,
            imwidth,
            imheight,
            this.uicontext
        );
    }

    draw4() {
        /* tests corner cases */
        const imwidth = 700;
        const imheight = 200;
        let drawText = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            let draws = (s: string, args: RenderTextArgs) => {
                canvas.fillRect(args.boxX, args.boxY, args.boxW, args.boxH, 0, 0, imwidth, imheight, '#dddddd');
                complete.and_b(!!drawText.drawStringIntoBox(s, canvas, args));
            };

            let margin = 10;
            for (let i = 0; i < 6; i++) {
                let args = new RenderTextArgs(margin + i * (margin + 100), margin, 100, 200, false, false, true);
                let s = '';
                if (i === 0) {
                    /* consecutive newlines */
                    s = '\n\na\n\n\n';
                    args.hAlign = true;
                } else if (i === 1) {
                    /* all newlines */
                    s = '\n\n\n';
                } else if (i === 2) {
                    /* very narrow, wrap enabled */
                    /* todo: putting abc\ndef into a very narrow field of width 1px, wrapping enabled */
                    /* currently adds an extra vertical space between the c and the d */
                    /* doesn't look that bad, but maybe something to revisit */
                    s = UI512DrawText.setFont(
                        'abcd\nef\n\n\ngh',
                        `geneva_18_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                    args.boxW = 3;
                    args.wrap = true;
                } else if (i === 3) {
                    /* very narrow, wrap disabled */
                    s = UI512DrawText.setFont(
                        'abcd\nef\n\n\ngh',
                        `geneva_18_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                    args.boxW = 3;
                    args.wrap = false;
                } else if (i === 4) {
                    /* test drawing interesting characters */
                    s = 'a\x01b\x01\x01\x01\x01'; /* 1-pixel spaces */
                    s += '|';
                    s += String.fromCharCode('u'.charCodeAt(0) + 3 * 16); /* black dot */
                    s += String.fromCharCode('t'.charCodeAt(0) + 5 * 16); /* script f */
                    s += '\n{\x06}{\x1d}'; /* non-printable should become ? */
                    s += '\n{\xfa}{\xfb}'; /* upper-ascii should become ? */
                    s +=
                        '\n{' +
                        String.fromCharCode('m'.charCodeAt(0) + 7 * 16) +
                        '}'; /* in bounds, become a rectangle */
                    s +=
                        '\n{' +
                        String.fromCharCode('m'.charCodeAt(0) + 8 * 16) +
                        '}'; /* in bounds, become a rectangle */
                    s = UI512DrawText.setFont(s, `geneva_18_${textFontStylingToString(TextFontStyling.Default)}`);
                } else if (i === 5) {
                    /* unsupported typefaces should go back to the default font */
                    let available = UI512DrawText.setFont(
                        'abc',
                        `geneva_18_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                    s = available;
                    s += UI512DrawText.setFont('abc', `geneva_123_${textFontStylingToString(TextFontStyling.Default)}`);
                    s += available;
                    s += UI512DrawText.setFont('abc', `geneva_19_${textFontStylingToString(TextFontStyling.Default)}`);
                    s += available;
                    s += UI512DrawText.setFont('abc', `chicago_0_${textFontStylingToString(TextFontStyling.Default)}`);
                    s += available;
                    s += UI512DrawText.setFont(
                        'abc',
                        `genevaextra_12_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                    s += available;
                    s += UI512DrawText.setFont(
                        'abc',
                        `notavailable_12_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                    s += available;
                    s += UI512DrawText.setFont(
                        'abc',
                        `Courier12_12_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                    s += available;
                    s += UI512DrawText.setFont(
                        'serif',
                        `cOurIer_14_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                } else {
                    assertTrue(false, '1l|unsupported');
                }

                draws(s, args);
            }
        };

        return new CanvasTestParams(
            'drawtext4',
            '/resources/test/drawtextexpected4.png',
            draw,
            imwidth,
            imheight,
            this.uicontext
        );
    }

    runtest(testnum: number, dldimage: boolean, callback?: NullaryFn) {
        let tests = [() => this.draw1(), () => this.draw2(), () => this.draw3(), () => this.draw4()];
        let testToRun = testnum === -1 ? tests : tests[testnum - 1];
        testUtilCompareCanvasWithExpected(dldimage, testToRun, callback);
    }
}
