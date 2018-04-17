
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, Util512, assertEq, cast } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ModifierKeys, ScreenConsts, ScrollConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, NullaryFn, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { TextFontSpec, TextFontStyling, specialCharFontChange, specialCharNonBreakingSpace, textFontStylingToString } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementGroup.js';
/* auto */ import { GridLayout, UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512ElementLabel.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { KeyDownEventDetails, MouseDownDoubleEventDetails, MouseDownEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { addDefaultListeners } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';

export class UI512TestTextEditPresenter extends UI512Presenter {
    public init() {
        super.init();
        addDefaultListeners(this.listeners);
    }
}

export class TestDrawUI512TextEdit extends UI512TestBase {
    uicontext = false;
    tests = [
        'callback/Test Drawing Text Edits',
        (callback: NullaryFn) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawTextEdit(), callback);
        }
    ];

    runtest(dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawTextEdit());
    }

    geneva(el: UI512ElTextField, s: string) {
        let spec = new TextFontSpec('geneva', TextFontStyling.Default, 10);
        el.set('defaultFont', spec.toSpecString());
        let t = FormattedText.newFromSerialized(UI512DrawText.setFont(s, spec.toSpecString()));
        el.setftxt(t);
    }

    getTextWithFonts() {
        let s = '';
        let c = specialCharFontChange;
        s += c + 'geneva_18_' + textFontStylingToString(TextFontStyling.Outline) + c + 'ab';
        s += c + 'geneva_12_' + textFontStylingToString(TextFontStyling.Outline) + c + 'ab';
        s += c + 'geneva_18_' + textFontStylingToString(TextFontStyling.Bold) + c + 'ab';
        s += c + 'geneva_12_' + textFontStylingToString(TextFontStyling.Bold) + c + 'ab';
        s += c + 'chicago_18_' + textFontStylingToString(TextFontStyling.Underline) + c + 'ab';
        s += c + 'chicago_12_' + textFontStylingToString(TextFontStyling.Underline) + c + 'ab';
        return FormattedText.newFromSerialized(s);
    }

    toggleScroll(pr: UI512Presenter) {
        let grp = pr.app.getGroup('grp');
        for (let el of grp.iterEls()) {
            if (el instanceof UI512ElTextField) {
                el.set('scrollbar', !el.getB('scrollbar'));
            }
        }

        pr.rebuildFieldScrollbars();
    }

    addElements(pr: UI512Presenter, bounds: number[]) {
        let grp = new UI512ElGroup('grp');
        pr.app.addGroup(grp);

        /* add bg */
        let bg = new UI512ElButton('bg');
        grp.addElement(pr.app, bg);
        bg.set('style', UI512BtnStyle.Opaque);
        bg.setDimensions(bounds[0], bounds[1], bounds[2], bounds[3]);
        bg.set('autohighlight', false);

        /* add horizontal lines, for testing opacity */
        const b0 = 45;
        const b1 = 45;
        let testTransparency1 = new UI512ElButton('bgTransparency1');
        grp.addElement(pr.app, testTransparency1);
        testTransparency1.setDimensions(b0 + 2, b1 + 24, 300, 2);
        let testTransparency2 = new UI512ElButton('bgTransparency2');
        grp.addElement(pr.app, testTransparency2);
        testTransparency2.setDimensions(b0 + 2, b1 + 30, 300, 2);

        /* test different styles */
        let styles: number[] = [
            UI512FldStyle.Opaque,
            UI512FldStyle.Transparent,
            UI512FldStyle.Rectangle,
            UI512FldStyle.Shadow
        ];
        let layoutst = new GridLayout(b0 + 10, b1 + 5, 60, 45, styles, [1], 10, 10);
        layoutst.createElems(pr.app, grp, 'testStyles', UI512ElTextField, (a, b, el) => {
            el.set('style', a);
            el.setftxt(FormattedText.newFromSerialized('text\ntext'));
        });

        /* test large fields with varying amounts of text */
        /* why use NonBreakingSpace? this test was written before we had actual word wrapping, */
        /* instead of rewriting the test just use NonBreakingSpace so that it matches what was rendered before. */
        let shortSampleText = loremText.substr(0, 70).replace(/ /g, specialCharNonBreakingSpace);
        let longSampleText = loremText.substr(0, 700).replace(/ /g, specialCharNonBreakingSpace);
        let rowsTextContent = [shortSampleText, longSampleText];
        let cols = [[true, true], [true, false], [false, true], [false, false]];
        let layoutgrid = new GridLayout(b0 + 10, 100, 130, 130, cols, rowsTextContent, 10, 10);
        layoutgrid.createElems(pr.app, grp, 'testGrid', UI512ElTextField, (a, content, el) => {
            let [isWide, isScroll] = a;
            this.geneva(el, content);
            el.set('scrollbar', isScroll);
            if (!isWide) {
                el.setDimensions(el.x, el.y, el.w / 2, el.h);
                if (el.id === 'testGrid_3' || el.id === 'testGrid_7') {
                    el.setDimensions(el.x - el.w, el.y, el.w, el.h);
                }
            }
        });

        /* test field properties */
        let cases = [
            'halign+scr',
            'halign',
            'oneline',
            'rdonly',
            'noselct',
            'nowrap',
            'fnts',
            'ignorevalgn',
            'vspace',
            'small'
        ];
        let layoutlbl = new GridLayout(485, 80, 80, 20, Util512.range(5), Util512.range(2), 10, 100 - 20);
        layoutlbl.createElems(pr.app, grp, 'caseLbl', UI512ElLabel, (a, b, el) => {
            let whichcase = cases[a + b * 5];
            el.set('labeltext', whichcase);
        });

        let layoutcases = new GridLayout(485, 100, 80, 60, Util512.range(5), Util512.range(2), 10, 40);
        layoutcases.createElems(pr.app, grp, 'testCases', UI512ElTextField, (a, b, el) => {
            let whichcase = cases[a + b * 5];
            this.geneva(el, '1234123412345\nabc');
            switch (whichcase) {
                case 'halign+scr':
                    el.set('labelhalign', true);
                    el.set('scrollbar', true);
                    break;
                case 'halign':
                    el.set('labelhalign', true);
                    break;
                case 'oneline':
                    el.set('multiline', false);
                    this.geneva(el, 'abc');
                    break;
                case 'rdonly':
                    el.set('canedit', false);
                    break;
                case 'noselct':
                    el.set('canselecttext', false);
                    break;
                case 'nowrap':
                    el.set('labelwrap', false);
                    break;
                case 'fnts':
                    el.setftxt(this.getTextWithFonts());
                    el.set('defaultFont', 'geneva_18_' + textFontStylingToString(TextFontStyling.Outline));
                    break;
                case 'ignorevalgn':
                    el.set('labelvalign', true);
                    break;
                case 'vspace':
                    el.set('addvspacing', 8);
                    break;
                case 'small':
                    el.setDimensions(el.x, el.y, el.w, ScrollConsts.BoxHeight * 2);
                    el.set('scrollbar', true);
                    this.geneva(el, 'scrll hidden bc of size');
                    break;
                default:
                    assertTrue(false, '1u|not reached');
                    break;
            }
        });

        pr.rebuildFieldScrollbars();
    }

    drawTestCase(
        testnumber: number,
        tmpCanvas: CanvasWrapper,
        w: number,
        h: number,
        i: number,
        complete: RenderComplete
    ) {
        tmpCanvas.clear();
        let testc = new UI512TestTextEditPresenter();
        testc.init();
        testc.inited = true;
        testc.app = new UI512Application([0, 0, w, h], testc);
        this.addElements(testc, testc.app.bounds);

        /* first pass rendering adds the scrollbars */
        /* don't show any borders */
        testc.view.renderBorders = () => {};
        testc.needRedraw = true;
        testc.render(tmpCanvas, 1, complete);
        tmpCanvas.clear();

        if (!complete.complete) {
            /* the fonts aren't loaded yet, let's wait until later */
            return;
        }

        if (testnumber === 1) {
            this.drawTestCaseSelection(testc);
        } else if (testnumber === 2) {
            this.drawTestCaseScrolling(testc);
        }

        /* second pass rendering */
        testc.view.allowMultipleFocus = true;
        testc.view.renderBorders = () => {};
        testc.needRedraw = true;
        testc.render(tmpCanvas, 1, complete);
    }

    testDrawTextEdit() {
        const w = 928;
        const h = 400;
        const screensToDraw = 3;
        assertEq(w, ScreenConsts.ScreenWidth, '1t|');
        let tmpCanvasDom = window.document.createElement('canvas');
        tmpCanvasDom.width = w;
        tmpCanvasDom.height = h;
        let tmpCanvas = new CanvasWrapper(tmpCanvasDom);

        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = true;
            for (let i = 0; i < screensToDraw; i++) {
                this.drawTestCase(i, tmpCanvas, w, h, i, complete);
                let dest = [0, i * h, w, h];
                canvas.drawFromImage(
                    tmpCanvas.canvas,
                    0,
                    0,
                    w,
                    h,
                    dest[0],
                    dest[1],
                    dest[0],
                    dest[1],
                    dest[2],
                    dest[3]
                );
            }
        };

        const totalh = h * screensToDraw;
        return new CanvasTestParams(
            'drawTextEdit',
            '/resources/test/drawtexteditexpected.png',
            draw,
            w,
            totalh,
            this.uicontext
        );
    }

    simulateClick(pr: UI512TestTextEditPresenter, x: number, y: number, doubleclick = false, isShift = false) {
        let mods = isShift ? ModifierKeys.Shift : ModifierKeys.None;
        if (doubleclick) {
            pr.rawEvent(new MouseDownEventDetails(0, x, y, 0, mods));
            pr.rawEvent(new MouseDownEventDetails(1, x, y, 0, mods));
            pr.rawEvent(new MouseDownDoubleEventDetails(2, x, y, 0, mods));
        } else {
            pr.rawEvent(new MouseDownEventDetails(0, x, y, 0, mods));
        }
    }

    simulateKey(pr: UI512TestTextEditPresenter, keyCode: string, keyChar: string, isShift: boolean, isCmd = false) {
        let mods = isShift ? ModifierKeys.Shift : ModifierKeys.None;
        mods |= isCmd ? ModifierKeys.Cmd : ModifierKeys.None;
        let d = new KeyDownEventDetails(0, keyCode, keyChar, false, mods);
        pr.rawEvent(d);
    }

    drawTestCaseScrolling(pr: UI512TestTextEditPresenter) {
        /* confirm that a scrollbar is enabled when text gets too long */
        /* click in the padding area after '12345' in fld 'halign+scr' and enter lots of text */
        this.simulateClick(pr, 539, 118, false, false);
        for (let i = 0; i < 16; i++) {
            this.simulateKey(pr, 'Q', 'q', true);
            this.simulateKey(pr, 'W', 'w', true);
            this.simulateKey(pr, 'E', 'e', true);
        }

        /* confirm that scrollbar disabled when text short enough */
        /* the scrollbar should now be disabled because the text is short, and scrolled to top */
        /* click on fld 7 and hit Ctrl+End */
        this.simulateClick(pr, 360, 296, false, false);
        this.simulateKey(pr, 'End', '', false, true);
        /* hit Ctrl+Backspace 120 times */
        for (let i = 0; i < 120; i++) {
            this.simulateKey(pr, 'Backspace', '', false, true);
        }

        /* try scrolling up/down with the arrows */
        /* insert some text at the beginning of fld 3 */
        this.simulateClick(pr, 340, 110, false, false);
        for (let i = 1; i <= 8; i++) {
            this.simulateKey(pr, i.toString(), i.toString(), true);
            this.simulateKey(pr, 'Enter', '', false);
        }
        /* hit the scroll down arrow 5x */
        for (let i = 0; i < 5; i++) {
            this.simulateClick(pr, 390, 222, false, false);
        }
        /* hit the scroll up arrow 2x */
        for (let i = 0; i < 2; i++) {
            this.simulateClick(pr, 390, 111, false, false);
        }

        /* try scrolling up/down by clicking on the background */
        /* click the lower bg of fld 5, 5x */
        for (let i = 0; i < 2; i++) {
            this.simulateClick(pr, 180, 345, false, false);
        }
        /* hit the upper bg 2x */
        for (let i = 0; i < 2; i++) {
            this.simulateClick(pr, 178, 266, false, false);
        }

        /* clicking the arrows should have no effect if scrollbar is disabled */
        /* click on the up/down arrows of fld 1 */
        for (let i = 0; i < 2; i++) {
            this.simulateClick(pr, 177, 110, false, false);
        }
        for (let i = 0; i < 5; i++) {
            this.simulateClick(pr, 177, 224, false, false);
        }

        /* make it big enough to have a scrollbar */
        let wastoosmall = pr.app.getEl('testCases_9');
        wastoosmall.setDimensions(wastoosmall.x, wastoosmall.y, wastoosmall.w, 120);
        cast(wastoosmall, UI512ElTextField).setftxt(FormattedText.newFromSerialized('now ok'));
    }

    drawTestCaseSelection(pr: UI512TestTextEditPresenter) {
        /* part 1: set selections ------------------------------------------ */
        /* in the 1st field double-click at 105, 105 to select "ipsum" */
        this.simulateClick(pr, 105, 105, true);

        /* in the 2nd field click at 216, 106 to click on lorem */
        /* shift click at 282, 109 to move the selection to middle of "dolor" */
        this.simulateClick(pr, 216, 106);
        this.simulateClick(pr, 282, 109, false, true);

        /* in the 3rd field click at 351,108 to select part of lorem */
        /* hit shift-page down to select down to "pla" */
        this.simulateClick(pr, 351, 108);
        this.simulateKey(pr, 'PageDown', '', true);

        /* in the 4th field click at 430, 133 to select part of amet */
        /* shift click at 460, 160 to select down to erat */
        this.simulateClick(pr, 430, 133);
        this.simulateClick(pr, 460, 160, false, true);

        /* in the 5th field click at 115, 246 to select part of ipsum */
        /* hit shift-page down to select down to "sea te" */
        this.simulateClick(pr, 115, 246);
        this.simulateKey(pr, 'PageDown', '', true);

        /* in the 6th field click at 263, 271 to select part of feugait */
        /* hit shift-up 5x (the rest are unneeded) to select up to "dolor" */
        this.simulateClick(pr, 263, 271);
        for (let i = 0; i < 5; i++) {
            this.simulateKey(pr, 'ArrowUp', '', true);
        }

        /* in 7th fld click at 360, 260 to select part of psum */
        /* hit shift-pagedown 5x to select down to apeirian */
        this.simulateClick(pr, 360, 260);
        for (let i = 0; i < 5; i++) {
            this.simulateKey(pr, 'PageDown', '', true);
        }

        /* in 8th fld click at 444,288 to select part of pericula */
        /* hit shift-down 6x to select down to "uam N". */
        /* if this were a scrolling field it would should shift scroll slightly down, */
        /* but we've decided that for perf, a field with no scrollbar doesn't need to scroll down. */
        this.simulateClick(pr, 444, 288);
        for (let i = 0; i < 6; i++) {
            this.simulateKey(pr, 'ArrowDown', '', true);
        }

        /* click to set focus left of the 12345 in fld 'halign+scr' */
        /* hit shift-left 4x */
        this.simulateClick(pr, 500, 118);
        for (let i = 0; i < 4; i++) {
            this.simulateKey(pr, 'ArrowLeft', '', true);
        }

        /* click to set focus left of the text in fld 'rdonly' */
        /* hit shift-left 5x */
        this.simulateClick(pr, 759, 135);
        for (let i = 0; i < 5; i++) {
            this.simulateKey(pr, 'ArrowLeft', '', true);
        }

        /* part 2: cases with few characters ------------------------------------------ */
        /* zero chars */
        this.simulateClick(pr, 78, 63);
        this.simulateKey(pr, 'A', 'a', false, true);
        this.simulateKey(pr, 'Delete', '', false, false);

        /* 1 char, caret after */
        this.simulateClick(pr, 143, 60);
        this.simulateKey(pr, 'A', 'a', false, true);
        this.simulateKey(pr, '1', '1', false, false);

        /* 1 char, selected */
        this.simulateClick(pr, 218, 60);
        this.simulateKey(pr, 'A', 'a', false, true);
        this.simulateKey(pr, '1', '1', false, false);
        this.simulateKey(pr, 'ArrowLeft', '', true, false);

        /* 1 char, caret before */
        this.simulateClick(pr, 291, 60);
        this.simulateKey(pr, 'A', 'a', false, true);
        this.simulateKey(pr, '1', '1', false, false);
        this.simulateKey(pr, 'ArrowLeft', '', false, false);

        /* part 3: set selections & input text ------------------------------------------ */

        /* click at 598, 212 to set focus to the right of the ab font typeface tests */
        /* type z to insert a z */
        this.simulateClick(pr, 618, 218);
        this.simulateKey(pr, 'Z', 'z', true);
        this.simulateKey(pr, 'ArrowRight', '', true);

        /* click to set focus to the right of the 345 in fld 'halign' */
        /* type a to insert an a */
        this.simulateClick(pr, 638, 121);
        this.simulateKey(pr, 'A', 'a', true);
        this.simulateKey(pr, 'ArrowRight', '', true, true);

        /* test rendering with right font after all chars deleted */
        /* click, hit Backspace 13 times, hit Delete 4 times */
        /* type Y */
        this.simulateClick(pr, 697, 219);
        for (let i = 0; i < 13; i++) {
            this.simulateKey(pr, 'Backspace', '', false);
        }
        for (let i = 0; i < 4; i++) {
            this.simulateKey(pr, 'Delete', '', false);
        }
        this.simulateKey(pr, 'Y', 'y', false);
        this.simulateKey(pr, 'A', 'a', false);
        this.simulateKey(pr, 'B', 'b', false);

        /* test rendering \n\n */
        /* click, hit Backspace 13 times, hit Delete 4 times */
        /* type Enter */
        /* type Enter */
        /* type shift-left */
        /* type shift left */
        this.simulateClick(pr, 812, 231);
        for (let i = 0; i < 13; i++) {
            this.simulateKey(pr, 'Backspace', '', false);
        }
        for (let i = 0; i < 4; i++) {
            this.simulateKey(pr, 'Delete', '', false);
        }
        this.simulateKey(pr, 'Enter', '', false);
        this.simulateKey(pr, 'Enter', '', false);
        this.simulateKey(pr, 'ArrowLeft', '', true);
        this.simulateKey(pr, 'ArrowLeft', '', true);

        /* for fld "small" */
        /* type & to insert text before any text in the field */
        this.simulateClick(pr, 847, 205);
        this.simulateKey(pr, '', '&', false);
        this.simulateKey(pr, 'ArrowDown', '', true);
    }
}

const loremText = `Lorem ipsum dolor sit amet, dolore pericula ne mel, erat feugait placerat ut sit, id vel persecuti constituam. Nibh probo et pro, ei quo case deterruisset. Nibh impetus per at. Oporteat scripserit has te, sea te nostrud pertinacia. Per deleniti deseruisse an, et usu singulis necessitatibus. Antiopam efficiendi an mei.\nCum cu ignota timeam consequat, salutandi contentiones nam an, ut apeirian deserunt conclusionemque eum. Eu singulis deterruisset vix, sed in sumo suas facete. Qui reprimique dissentiunt te, nam ne habeo officiis argumentum, cu pri homero democritum. No illum moderatius sea, vim no equidem nusquam complectitur.\nAutem dolor principes ea duo. In sea suas tation regione, cum ei maiorum volumus reformidans. Ei mei noluisse oportere iudicabit, ex ius summo officiis, feugait blandit nominavi id vel. Purto accusamus eu ius, an posse probatus similique qui.\nUt nibh maiestatis ius, sea dolorum facilisi ei. Cu cum tritani quaeque pertinacia, causae delectus delicata pro te, graeco scribentur reprehendunt pri eu. Corpora iracundia adolescens sit ei, in duo commune reprimique. In aliquam graecis eum, fugit utamur et sea. In molestie platonem conceptam mel. Ea hinc sensibus eam, aeque expetendis reprimique et vim.\nSumo saepe sit ne. Ex facilisi pericula constituam pri, et pro habemus definiebas, aliquam electram ex nam. Magna nostro moderatius ei sea, cu quo nostro theophrastus. Tation blandit ei per, odio dolorem has at. At brute alterum vituperatoribus nec, ad vix idque vocent. An porro ullum euripidis his, an graecis nostrum eligendi nec. Eos saepe aeterno accommodare ei.`;
