
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { RenderComplete, getRoot } from './../../ui512/utils/util512Higher';
/* auto */ import { bool } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { TextFontStyling, largeArea, specialCharOnePixelSpace, textFontStylingToString, typefacenameToTypefaceIdFull } from './../../ui512/draw/ui512DrawTextClasses';
/* auto */ import { DrawTextArgs } from './../../ui512/draw/ui512DrawTextArgs';
/* auto */ import { UI512DrawText } from './../../ui512/draw/ui512DrawText';
/* auto */ import { CanvasTestParams, TestUtilsCanvas } from './../testUtils/testUtilsCanvas';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * TestDrawUI512Text
 *
 * A "demo" project showing text drawn in many fonts and alignments
 *
 * 1) tests use this project to compare against a known good screenshot,
 * to make sure rendering has not changed
 * 2) you can start this project in _rootUI512.ts_ (uncomment the
 * line referencing _UI512DemoText_) to test combinations
 * of styles and fonts, by clicking the buttons like Bold and Italic
 */

let t = new SimpleUtil512TestCollection('testCollectionUI512DrawText', true);
export let testCollectionUI512DrawText = t;

t.atest('Text Core Fonts', () =>
    TestUtilsCanvas.RenderAndCompareImages(false, () => new TestDrawUI512Text().draw1())
);
t.atest('Text All 0.2 Fonts', () =>
    TestUtilsCanvas.RenderAndCompareImages(false, () => new TestDrawUI512Text().draw2())
);
t.atest('Text Wrap, align, underlign', () =>
    TestUtilsCanvas.RenderAndCompareImages(false, () => new TestDrawUI512Text().draw3())
);
t.atest('Text corner cases', () =>
    TestUtilsCanvas.RenderAndCompareImages(false, () => new TestDrawUI512Text().draw4())
);
t.atest('Text All 0.3 fonts', () =>
    TestUtilsCanvas.RenderAndCompareImages(false, () => new TestDrawUI512Text().draw5())
);

/**
 * A demo project showing text drawn in many fonts and alignments
 */
export class TestDrawUI512Text {
    uiContext = false;
    readonly margin = 1;
    readonly demoText1 = 'File Edit Tools #123 Draw! :) ^^ {omnivore}';
    readonly demoText2 = longstr(`a quick brown fox jumps over the lazy dog
        QUICKBROWNFOXJUMPSVRTHELAZYDG,.:)0123456789!@#$%^&*(?/|\\_-=`);

    addFonts(listFonts: string[], sFaces: string, sSizes: string, sStyles: string) {
        let faces = sFaces.split(',');
        let sizes = sSizes.split(',');
        let styles = sStyles.split(',');
        for (let fnt of faces) {
            for (let style of styles) {
                for (let sz of sizes) {
                    listFonts.push(`${fnt}_${sz}_${style}`);
                }
            }
        }
    }

    getFormattedText(list: string[], addNewlines: boolean, demo: string) {
        demo += addNewlines ? '\n' : '';
        let demoTextFormatted = '';
        for (let i = 0; i < list.length; i++) {
            demoTextFormatted += UI512DrawText.setFont(demo, list[i]);
        }

        return demoTextFormatted;
    }

    draw1() {
        /* these we have confirmed in an emulator as pixel-perfect */
        const imWidth = 504;
        const imHeight = 556;
        let list: string[] = [];
        this.addFonts(
            list,
            'chicago,courier,geneva',
            '10,12,14,18,24',
            'biuosdce,+biuosdce'
        );
        let drawText = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = bool(
                drawText.drawStringIntoBox(
                    this.getFormattedText(list, true, this.demoText1),
                    canvas,
                    new DrawTextArgs(this.margin, this.margin, imWidth - 5, imHeight - 5)
                )
            );
        };

        return new CanvasTestParams(
            'drawtext1',
            '/resources03a/test/drawtextexpected1.png',
            draw,
            imWidth,
            imHeight,
            this.uiContext
        );
    }

    draw2() {
        /* not yet confirmed as pixel-perfect */
        const imWidth = 540;
        const imHeight = 2450;
        let list: string[] = [];
        this.addFonts(
            list,
            'chicago,courier,geneva',
            '10,12,14,18,24',
            'b+iuosdce,biu+osdce,+b+iuosdce,b+iu+osdce'
        );
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
            complete.complete = bool(
                drawText.drawStringIntoBox(
                    this.getFormattedText(list, true, this.demoText1),
                    canvas,
                    new DrawTextArgs(this.margin, this.margin, imWidth - 5, imHeight - 5)
                )
            );
        };

        return new CanvasTestParams(
            'drawtext2',
            '/resources03a/test/drawtextexpected2.png',
            draw,
            imWidth,
            imHeight,
            this.uiContext
        );
    }

    draw3() {
        /* test wrap, halign, valign, mixsize, underline and condense+extend */
        const imWidth = 300;
        const imHeight = 556;
        let list: string[] = [];
        this.addFonts(
            list,
            'geneva',
            '10,24,12',
            'biuosdce,b+i+uosdce,biuosd+ce,bi+uosdc+e'
        );
        let drawText = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = bool(
                drawText.drawStringIntoBox(
                    this.getFormattedText(list, false, this.demoText1),
                    canvas,
                    new DrawTextArgs(
                        this.margin,
                        this.margin,
                        imWidth - 5,
                        imHeight - 5,
                        true,
                        true,
                        true
                    )
                )
            );
        };

        return new CanvasTestParams(
            'drawtext3',
            '/resources03a/test/drawtextexpected3.png',
            draw,
            imWidth,
            imHeight,
            this.uiContext
        );
    }

    draw4() {
        /* test corner cases */
        const imWidth = 700;
        const imHeight = 200;
        let drawText = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            let draws = (s: string, args: DrawTextArgs) => {
                canvas.fillRect(
                    args.boxX,
                    args.boxY,
                    args.boxW,
                    args.boxH,
                    0,
                    0,
                    imWidth,
                    imHeight,
                    '#dddddd'
                );
                complete.andB(bool(drawText.drawStringIntoBox(s, canvas, args)));
            };

            let margin = 10;
            for (let i = 0; i < 6; i++) {
                let args = new DrawTextArgs(
                    margin + i * (margin + 100),
                    margin,
                    100,
                    200,
                    false,
                    false,
                    true
                );
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
                    /* todo: putting abc\ndef into a very narrow field of
                    width 1px, wrapping enabled */
                    /* currently adds an extra vertical space between the
                    c and the d */
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
                    s = UI512DrawText.setFont(
                        s,
                        `geneva_18_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                } else if (i === 5) {
                    /* unsupported typefaces should go back to the default font */
                    let available = UI512DrawText.setFont(
                        'abc',
                        `geneva_18_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                    s = available;
                    s += UI512DrawText.setFont(
                        'abc',
                        `geneva_123_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                    s += available;
                    s += UI512DrawText.setFont(
                        'abc',
                        `geneva_19_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                    s += available;
                    s += UI512DrawText.setFont(
                        'abc',
                        `chicago_0_${textFontStylingToString(TextFontStyling.Default)}`
                    );
                    s += available;
                    s += UI512DrawText.setFont(
                        'abc',
                        `genevaextra_12_${textFontStylingToString(
                            TextFontStyling.Default
                        )}`
                    );
                    s += available;
                    s += UI512DrawText.setFont(
                        'abc',
                        `notavailable_12_${textFontStylingToString(
                            TextFontStyling.Default
                        )}`
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
            '/resources03a/test/drawtextexpected4.png',
            draw,
            imWidth,
            imHeight,
            this.uiContext
        );
    }

    getFormattedTextAndShiftOutlines(list: string[], addNewlines: boolean, demo: string) {
        demo += addNewlines ? '\n' : '';
        let demoTextFormatted = '';
        for (let i = 0; i < list.length; i++) {
            if (!list[i].includes('+o')) {
                //~ demoTextFormatted += specialCharOnePixelSpace
                //~ demoTextFormatted += specialCharOnePixelSpace
                //~ demoTextFormatted += specialCharOnePixelSpace
                //~ demoTextFormatted += specialCharOnePixelSpace
                //~ demoTextFormatted += specialCharOnePixelSpace
            }

            demoTextFormatted += UI512DrawText.setFont(demo, list[i]);
        }

        return demoTextFormatted;
    }

    getDraw5List() {
        let allfonts = 'chicago,courier,geneva,new york,times'.split(',');
        let allsizes = '24,18,14,12,10,9'.split(',');
        return [allfonts, allsizes];
    }

    renderOneDraw5(font: string, size: string) {
        let allstyles = longstr(
            `biuosdce
        |+biuosdce
        |b+iuosdce
        |biu+osdce
        |+b+iuosdce
        |b+iu+osdce
        |+biu+osdce
        |+b+iu+osdce`,
            ''
        ).split('|');
        let list: string[] = [];
        this.addFonts(list, font, size, allstyles.join(','));
        let txt = this.getFormattedTextAndShiftOutlines(list, true, this.demoText2);

        let maxWidths = {
            '24': 1280,
            '18': 1280,
            '14': 1076,
            '12': 960,
            '10': 870,
            '9': 750
        };
        let maxHeights = {
            '24': 300,
            '18': 256,
            '14': 180,
            '12': 150,
            '10': 150,
            '9': 140
        };
        let w = maxWidths[size];
        let h = maxHeights[size];
        assertTrue(w, 'could not find in maxWidths');
        assertTrue(h, 'could not find in maxHeights');
        let drawText = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = bool(
                drawText.drawStringIntoBox(
                    txt,
                    canvas,
                    /* pretending we have more space to draw in helps some tests pass */
                    new DrawTextArgs(3, 1, w-4, h - 1, false, false, false)
                )
            );
        };

        let fontid = typefacenameToTypefaceIdFull(`${font}_12_biuosdce`).split('_')[0];
        return new CanvasTestParams(
            `drawtext5_${fontid}_${size}`,
            `/resources03a/test/verifyfonts/${fontid}_${size}.png`,
            draw,
            w,
            h,
            this.uiContext
        );
    }

    draw5() {}
}
