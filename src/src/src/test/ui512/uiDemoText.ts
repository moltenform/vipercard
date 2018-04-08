
/* auto */ import { assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { BrowserOSInfo, RenderComplete, assertEq, cast, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, NullaryFn, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { TextFontSpec, TextFontStyling, largeArea, specialCharFontChange, stringToTextFontStyling, textFontStylingToString } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { RenderTextArgs } from '../../ui512/draw/ui512DrawTextParams.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { GridLayout, UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { addDefaultListeners } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512Presenter.js';

export class UI512DemoText extends UI512Controller {
    typeface = 'geneva';
    style: TextFontStyling = TextFontStyling.Default;
    demoText = 'File Edit Tools\n123 This is really good, it looks right to me! :) ^^ ### mniv';
    mixSizes = false;
    testrunner: TestDrawUI512Text;
    public init() {
        super.init();
        addDefaultListeners(this.listeners);
        this.testrunner = new TestDrawUI512Text();
        this.testrunner.uicontext = true;

        let clientrect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientrect, this);
        let grp = new UI512ElGroup('grpmain');
        this.app.addGroup(grp);
        this.inited = true;

        // choose a font
        let fonts = 'chicago,courier,geneva,new york,times,helvetica,monaco,symbol'.split(/,/);
        let layout = new GridLayout(65, 70, 70, 15, fonts, [1], 5, 5);
        layout.createElems(this.app, grp, 'btnSetFont:', UI512ElButton, () => {}, true, true);

        // choose a style
        let styles = 'biuosdce'.split('');
        let layoutv = new GridLayout(70, 90, 40, 15, [1], styles, 5, 5);
        layoutv.createElems(this.app, grp, 'btnSetStyle:', UI512ElButton, () => {}, true, true);

        // choose alteration
        let attributes = 'narrow,valign,halign,wrap,mixsizes,test,testdld1,testdld2,testdld3,testdld4'.split(/,/);
        layoutv = new GridLayout(130, 90, 65, 15, [1], attributes, 5, 5);
        layoutv.createElems(this.app, grp, 'btnSetAttr:', UI512ElButton, () => {}, true, true);

        // caption:
        let caption = new UI512ElButton('caption');
        grp.addElement(this.app, caption);
        caption.set('style', UI512BtnStyle.Opaque);
        caption.setDimensions(70, 300, 180, 15);

        let mainfield = new UI512ElButton('mainfield');
        grp.addElement(this.app, mainfield);
        mainfield.setDimensions(300, 120, 400, 250);
        this.drawTextDemo();
        this.invalidateAll();

        this.listenEvent(UI512EventType.MouseUp, UI512DemoText.respondMouseUp);
        this.rebuildFieldScrollbars();
    }

    drawTextDemo() {
        let s = this.typeface + ' ';
        s += textFontStylingToString(this.style);

        let demo = '';
        let listSizes = '10,12,14,18,24'.split(/,/g);
        let delim = '\n';
        if (this.mixSizes) {
            listSizes = '10,18,14,12,24'.split(/,/g);
            delim = '';
        }

        if (
            this.style === TextFontStyling.Default &&
            (this.typeface.toLowerCase() === 'chicago' ||
                this.typeface.toLowerCase() === 'geneva' ||
                this.typeface.toLowerCase() === 'monaco')
        ) {
            listSizes.splice(0, 0, '9');
        }

        for (let size of listSizes) {
            let font = this.typeface + '_' + size + '_' + textFontStylingToString(this.style);
            demo += UI512DrawText.setFont(this.demoText, font);
            demo += delim;
        }

        let caption = cast(this.app.getElemById('caption'), UI512ElButton);
        caption.set('labeltext', s);

        let mainfield = cast(this.app.getElemById('mainfield'), UI512ElButton);
        mainfield.set('labeltext', demo);
    }

    private static respondMouseUp(c: UI512DemoText, d: MouseUpEventDetails) {
        if (d.button !== 0) {
            return;
        }

        if (!d.elClick) {
            return;
        }

        let mainfield = cast(c.app.getElemById('mainfield'), UI512ElButton);
        if (d.elClick.id.startsWith('btnSetFont:')) {
            c.typeface = d.elClick.id.split(':')[1];
        } else if (d.elClick.id.startsWith('btnSetStyle:')) {
            let styleletter = d.elClick.id.split(':')[1];
            let curStyle = textFontStylingToString(c.style);
            if (scontains(curStyle, '+' + styleletter)) {
                curStyle = curStyle.replace(new RegExp('\\+' + styleletter), styleletter);
            } else {
                curStyle = curStyle.replace(new RegExp(styleletter), '+' + styleletter);
            }
            c.style = stringToTextFontStyling(curStyle);
        } else if (d.elClick.id.startsWith('btnSetAttr:')) {
            let attr = d.elClick.id.split(':')[1];
            if (attr === 'mixsizes') {
                c.mixSizes = !c.mixSizes;
            } else if (attr === 'wrap') {
                mainfield.set('labelwrap', !mainfield.get_b('labelwrap'));
            } else if (attr === 'halign') {
                mainfield.set('labelhalign', !mainfield.get_b('labelhalign'));
            } else if (attr === 'valign') {
                mainfield.set('labelvalign', !mainfield.get_b('labelvalign'));
            } else if (attr === 'narrow') {
                let newwidth = mainfield.w === 400 ? 100 : 400;
                mainfield.setDimensions(mainfield.x, mainfield.y, newwidth, mainfield.h);
            } else if (attr.startsWith('test')) {
                c.runtest(attr);
            }
        }

        c.drawTextDemo();
    }

    runtest(params: string) {
        if (params.startsWith('testdld')) {
            let testNumber = parseInt(params.substr('testdld'.length), 10);
            this.testrunner.runtest(testNumber, true);
        } else {
            this.testrunner.runtest(-1 /* all tests */, false);
        }
    }
}

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
        },
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

    // these we have confirmed in the emulator as pixel-perfect
    draw1() {
        const imwidth = 504;
        const imheight = 556;
        let list: string[] = [];
        this.addFonts(list, 'chicago,courier,geneva', '10,12,14,18,24', 'biuosdce,+biuosdce');
        let fontManager = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = !!fontManager.drawStringIntoBox(
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

    // not yet confirmed as pixel-perfect
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
        let fontManager = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = !!fontManager.drawStringIntoBox(
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
        // tests wrap, halign, valign, mixsize, underline and condense+extend
        const imwidth = 300;
        const imheight = 556;
        let list: string[] = [];
        this.addFonts(list, 'geneva', '10,24,12', 'biuosdce,b+i+uosdce,biuosd+ce,bi+uosdc+e');
        let fontManager = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = !!fontManager.drawStringIntoBox(
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
        // tests corner cases
        const imwidth = 700;
        const imheight = 200;
        let fontManager = getRoot().getDrawText() as UI512DrawText;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            let draws = (s: string, args: RenderTextArgs) => {
                canvas.fillRect(args.boxX, args.boxY, args.boxW, args.boxH, 0, 0, imwidth, imheight, '#dddddd');
                complete.and_b(!!fontManager.drawStringIntoBox(s, canvas, args));
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
                    // todo: putting abc\ndef into a very narrow field of width 1px, wrapping enabled
                    // currently adds an extra vertical space between the c and the d
                    // doesn't look that bad, but maybe something to revisit
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

export class TestRenderUI512TextUtils extends UI512TestBase {
    cleanCharsTests: [string, string][] = [
        // empty string
        ['', ''],
        // normal string
        ['abc def', 'abc def'],
        // should remove null bytes
        ['abc def', '\x00abc\x00 def\x00'],
        // should remove null bytes even if entire string is null bytes
        ['', '\x00\x00'],
        // should remove special formatting bytes
        ['abc def', `${specialCharFontChange}abc${specialCharFontChange} def${specialCharFontChange}`],
        // should remove special formatting bytes even if entire string
        ['', `${specialCharFontChange}${specialCharFontChange}`],
        // should keep unix newlines
        ['\nabc\n123\n', '\nabc\n123\n'],
        // should convert win newlines
        ['\nabc\n123\n', '\r\nabc\r\n123\r\n'],
        // should convert classic-mac newlines
        ['\nabc\n123\n', '\rabc\r123\r'],
        // every newline combination
        [
            '\n\n\n1\n\n\n2\n\n3\n\n\n4\n\n5\n\n6\n\n7\n\n\n8',
            '\n\n\n1\n\n\r2\n\r\n3\n\r\r4\r\n\n5\r\n\r6\r\r\n7\r\r\r8',
        ],
    ];
    tests = [
        'test_newFromUnformatted',
        () => {
            for (let [expected, sinput] of this.cleanCharsTests) {
                let newtxt = FormattedText.newFromUnformatted(sinput);
                let unformatted = newtxt.toUnformatted();
                assertEq(expected, unformatted, '1k|');
            }
        },
        'test_fromHostCharset',
        () => {
            let fromHost = (s: string) => FormattedText.fromExternalCharset(s, BrowserOSInfo.Unknown);
            for (let [expected, sinput] of this.cleanCharsTests) {
                let unformatted = fromHost(sinput);
                assertEq(expected, unformatted, '1j|');
            }

            // control chars are not accepted
            assertEq('ab?cd?', fromHost('ab\x03cd\x03'), '1i|');
            // more control chars are not accepted
            assertEq('ab?cd????', fromHost('ab\x01cd\x06\x0f\x15\x1a'), '1h|');
            // tabs are accepted
            assertEq('ab\tcd?', fromHost('ab\tcd\x03'), '1g|');
            // accented letters are translated
            assertEq(
                'ab' + String.fromCharCode(135, 32, 136, 32, 146, 32, 147, 32, 148, 32, 153, 32, 155),
                fromHost('ab\u00e1 \u00e0 \u00ed \u00ec \u00ee \u00f4 \u00f5'),
                '1f|'
            );
            // greek letters are translated
            assertEq(
                'ab' + String.fromCharCode(185, 32, 184, 32, 183, 32, 181, 32, 190, 32, 174, 32, 207),
                fromHost('ab\u03C0 \u220F \u2211 \u00B5 \u00E6 \u00C6 \u0153'),
                '1e|'
            );
            // symbols are translated
            assertEq('ab' + String.fromCharCode(166, 32, 165, 32, 161), fromHost('ab\u00B6 \u2022 \u00B0'), '1d|');
            // unknown lower letters are not accepted (1/4, superscript 1, capital thorn)
            assertEq('ab???cd', fromHost('ab\u00BC\u00B9\u00DEcd'), '1c|');
            // unknown higher letters are not accepted
            assertEq('12???34', fromHost('12\u05E7\u3042\uB9D034'), '1b|');
            // different fallback
            assertEq('ab!cd!', FormattedText.fromExternalCharset('ab\x03cd\x03', BrowserOSInfo.Unknown, '!'), '1a|');
            // into charset, control chars are not accepted
            assertEq('ab?cd?', FormattedText.toExternalCharset('ab\x05cd\x05', BrowserOSInfo.Unknown), '1Z|');
            // into charset, different fallback
            assertEq('ab!cd!', FormattedText.toExternalCharset('ab\x05cd\x05', BrowserOSInfo.Unknown, '!'), '1Y|');
            // into charset, tabs are accepted
            assertEq('AB\nCD\tEF', FormattedText.toExternalCharset('AB\nCD\tEF', BrowserOSInfo.Unknown), '1X|');
            // into charset, greek letters are translated
            assertEq(
                'ab\u03C0 \u220F \u2211 \u00B5 \u00E6 \u00C6 \u0153',
                FormattedText.toExternalCharset(
                    'ab' + String.fromCharCode(185, 32, 184, 32, 183, 32, 181, 32, 190, 32, 174, 32, 207),
                    BrowserOSInfo.Unknown
                ),
                '1W|'
            );
            // into charset, unknown letters are not accepted
            assertEq(
                '12???34',
                FormattedText.toExternalCharset('12\u001f\u0100\u221134', BrowserOSInfo.Unknown),
                '1V|'
            );
        },
        'test_asteriskOnly',
        () => {
            let args = new RenderTextArgs(0, 0, largeArea, largeArea);
            args.asteriskOnly = true;

            // zero-length string
            let textin = FormattedText.newFromUnformatted('');
            let modded = UI512DrawText.makeAsteriskOnlyIfApplicable(textin, args);
            assertEq(0, modded.len(), '');
            assertTrue(modded.isLocked(), '');

            // no formatting
            textin = FormattedText.newFromUnformatted('abcd');
            modded = UI512DrawText.makeAsteriskOnlyIfApplicable(textin, args);
            assertEq('abcd', textin.toUnformatted(), '');
            assertEq('\xA5\xA5\xA5\xA5', modded.toUnformatted(), '');
            assertEq(4, modded.len(), '');

            // formatting is preserved
            let font1 = new TextFontSpec('geneva', TextFontStyling.Default, 12).toSpecString();
            let font2 = new TextFontSpec('times', TextFontStyling.Bold, 14).toSpecString();
            let s =
                UI512DrawText.setFont('abc', font1) +
                UI512DrawText.setFont('def', font2);
            let expected =
                UI512DrawText.setFont('\xA5\xA5\xA5', font1) +
                UI512DrawText.setFont('\xA5\xA5\xA5', font2);
            textin = FormattedText.newFromSerialized(s);
            modded = UI512DrawText.makeAsteriskOnlyIfApplicable(textin, args);
            assertEq('abcdef', textin.toUnformatted(), '');
            assertEq('\xA5\xA5\xA5\xA5\xA5\xA5', modded.toUnformatted(), '');
            assertEq(6, modded.len(), '');
            assertEq(expected, modded.toSerialized(), '');
        },
    ];
}

export class TestUI512CanvasComparison extends UI512TestBase {
    uicontext = false;
    readonly margin = 1;
    readonly imwidth = 300;
    readonly imheight = 556;
    tests = [
        'callback/Simple Draw Rectangles',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Simple Draw Rectangles with no-op drawing',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                // draw with width zero, should have no effect
                canvas.fillRect(250, 15, 0, 405, 0, 0, this.imwidth, this.imheight, 'black');
                // draw with height zero, should have no effect
                canvas.fillRect(100, 5, 40, 0, 0, 0, this.imwidth, this.imheight, 'black');
                // draw black over black, should have no effect
                canvas.fillRect(3 + 1, 5 + 1, 30 - 1, 50 - 1, 0, 0, this.imwidth, this.imheight, 'black');
                // draw white over transparent, should have no effect as far as our testing.
                canvas.fillRect(245, 3, 0, 15, 0, 0, this.imwidth, this.imheight, 'white');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if shifted',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3 + 1, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                let expectedDifferences = 85;
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    expectedDifferences
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if black pixel turned white',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(3 + 2, 5 + 2, 1, 1, 0, 0, this.imwidth, this.imheight, 'white');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    1
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if white pixel turned black (NW)',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(0, 0, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(1, 1, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    2
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if white pixel turned black (NE)',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(this.imwidth - 1, 0, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(this.imwidth - 1, 1, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    2
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if white pixel turned black (SW)',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(0, this.imheight - 1, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(1, this.imheight - 1, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    2
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if white pixel turned black (SE)',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(this.imwidth - 1, this.imheight - 1, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(this.imwidth - 2, this.imheight - 2, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    2
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should succeed even if the first renders are wrong',
        (callback: NullaryFn) => {
            let countRenderAttempt = 0;
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                if (countRenderAttempt === 0) {
                    canvas.fillRect(1, 1, 500, 500, 0, 0, this.imwidth, this.imheight, 'black');
                } else if (countRenderAttempt === 1) {
                    canvas.fillRect(1, 1, 100, 100, 0, 0, this.imwidth, this.imheight, 'white');
                } else if (countRenderAttempt === 2) {
                    canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                    canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                    canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                }
                complete.complete = countRenderAttempt === 2;
                countRenderAttempt++;
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },
    ];
}
