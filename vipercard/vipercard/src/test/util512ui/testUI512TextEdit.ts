
/* auto */ import { ScreenConsts, ScrollConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { RenderComplete } from './../../ui512/utils/util512Higher';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, assertEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { addDefaultListeners } from './../../ui512/textedit/ui512TextEvents';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { FormattedText } from './../../ui512/draw/ui512FormattedText';
/* auto */ import { UI512ElTextField, UI512FldStyle } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { UI512ElLabel } from './../../ui512/elements/ui512ElementLabel';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { GridLayout, UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { TextFontSpec, TextFontStyling, specialCharFontChange, specialCharNonBreakingSpace, textFontStylingToString } from './../../ui512/draw/ui512DrawTextClasses';
/* auto */ import { UI512DrawText } from './../../ui512/draw/ui512DrawText';
/* auto */ import { CanvasTestParams, TestUtilsCanvas } from './../testUtils/testUtilsCanvas';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';
/* auto */ import { TestTextEventInteractions } from './testUI512TextEditInteractions';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * TestDrawUI512TextEdit
 *
 * A "demo" project showing several text fields with different properties,
 * and containing different amounts of content.
 * 1) tests use this project to compare against a known good screenshot,
 * to make sure rendering has not changed
 * 2) you can start this project in _rootUI512.ts_ (uncomment the line
 * referencing _UI512DemoTextEdit_) to confirm that manually
 * interacting with the text fields has the expected behavior
 */

let t = new SimpleUtil512TestCollection('testCollectionUI512TextEdit');
export let testCollectionUI512TextEdit = t;

t.atest('async/Test Drawing Text Edits', () =>
    TestUtilsCanvas.RenderAndCompareImages(false, () =>
        new TestDrawUI512TextEdit().testDrawTextEdit()
    )
);

export class TestDrawUI512TextEdit {
    uiContext = false;

    addElements(pr: UI512Presenter, bounds: number[]) {
        const b0 = 45;
        const b1 = 45;
        let grp = new UI512ElGroup('grp');
        pr.app.addGroup(grp);

        /* add an opaque bg */
        let bg = new UI512ElButton('bg');
        grp.addElement(pr.app, bg);
        bg.set('style', UI512BtnStyle.Opaque);
        bg.setDimensions(bounds[0], bounds[1], bounds[2], bounds[3]);
        bg.set('autohighlight', false);

        /* test different styles in upper left */
        this.addElementsUpperLeft(grp, pr, b0, b1);

        /* test large scrolling fields in left */
        this.addElementsLeft(b0, pr, grp);

        /* test field properties on the right */
        this.addElementsRight(pr, grp);

        /* required, tell the presenter to add build scrollbar parts */
        pr.rebuildFieldScrollbars();
    }

    getTextWithFonts() {
        let s = '';
        let c = specialCharFontChange;
        s +=
            c +
            'geneva_18_' +
            textFontStylingToString(TextFontStyling.Outline) +
            c +
            'ab';
        s +=
            c +
            'geneva_12_' +
            textFontStylingToString(TextFontStyling.Outline) +
            c +
            'ab';
        s += c + 'geneva_18_' + textFontStylingToString(TextFontStyling.Bold) + c + 'ab';
        s += c + 'geneva_12_' + textFontStylingToString(TextFontStyling.Bold) + c + 'ab';
        s +=
            c +
            'chicago_18_' +
            textFontStylingToString(TextFontStyling.Underline) +
            c +
            'ab';
        s +=
            c +
            'chicago_12_' +
            textFontStylingToString(TextFontStyling.Underline) +
            c +
            'ab';
        return FormattedText.newFromSerialized(s);
    }

    protected addElementsRight(pr: UI512Presenter, grp: UI512ElGroup) {
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

        let layoutLbl = new GridLayout(
            485,
            80,
            80,
            20,
            Util512.range(0, 5),
            Util512.range(0, 2),
            10,
            100 - 20
        );
        layoutLbl.createElems(pr.app, grp, 'caseLbl', UI512ElLabel, (a, b, el) => {
            let whichCase = cases[a + b * 5];
            el.set('labeltext', whichCase);
        });

        let layoutCases = new GridLayout(
            485,
            100,
            80,
            60,
            Util512.range(0, 5),
            Util512.range(0, 2),
            10,
            40
        );
        layoutCases.createElems(
            pr.app,
            grp,
            'testCases',
            UI512ElTextField,
            (a, b, el) => {
                let whichCase = cases[a + b * 5];
                this.geneva(el, '1234123412345\nabc');
                switch (whichCase) {
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
                        el.setFmTxt(this.getTextWithFonts());
                        el.set(
                            'defaultFont',
                            'geneva_18_' +
                                textFontStylingToString(TextFontStyling.Outline)
                        );
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
            }
        );
    }

    protected addElementsLeft(b0: number, pr: UI512Presenter, grp: UI512ElGroup) {
        /* test large fields with varying amounts of text */
        /* why use NonBreakingSpace? this test was written before we
        had actual word wrapping, */
        /* instead of rewriting the test just use NonBreakingSpace
        so that it matches what was rendered before. */
        let shortSampleText = loremText
            .substr(0, 70)
            .replace(/ /g, specialCharNonBreakingSpace);
        let longSampleText = loremText
            .substr(0, 700)
            .replace(/ /g, specialCharNonBreakingSpace);
        let rowsTextContent = [shortSampleText, longSampleText];
        let cols = [
            [true, true],
            [true, false],
            [false, true],
            [false, false]
        ];
        let layoutGrid = new GridLayout(
            b0 + 10,
            100,
            130,
            130,
            cols,
            rowsTextContent,
            10,
            10
        );
        layoutGrid.createElems(
            pr.app,
            grp,
            'testGrid',
            UI512ElTextField,
            (a, content, el) => {
                let [isWide, isScroll] = a;
                this.geneva(el, content);
                el.set('scrollbar', isScroll);
                if (!isWide) {
                    el.setDimensions(el.x, el.y, el.w / 2, el.h);
                    if (el.id === 'testGrid_3' || el.id === 'testGrid_7') {
                        el.setDimensions(el.x - el.w, el.y, el.w, el.h);
                    }
                }
            }
        );
    }

    protected addElementsUpperLeft(
        grp: UI512ElGroup,
        pr: UI512Presenter,
        b0: number,
        b1: number
    ) {
        /* add horizontal lines, for testing opacity */
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

        let layoutStyles = new GridLayout(b0 + 10, b1 + 5, 60, 45, styles, [1], 10, 10);
        layoutStyles.createElems(
            pr.app,
            grp,
            'testStyles',
            UI512ElTextField,
            (a, b, el) => {
                el.set('style', a);
                el.setFmTxt(FormattedText.newFromSerialized('text\ntext'));
            }
        );
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

    drawTestCase(
        testNumber: number,
        tmpCanvas: CanvasWrapper,
        w: number,
        h: number,
        i: number,
        complete: RenderComplete
    ) {
        tmpCanvas.clear();
        let pr = new UI512TestTextEditPresenter();
        pr.init();
        pr.inited = true;
        pr.app = new UI512Application([0, 0, w, h], pr);
        this.addElements(pr, pr.app.bounds);

        /* first pass rendering adds the scrollbars */
        /* don't show any borders */
        pr.view.renderBorders = () => {};
        pr.needRedraw = true;
        pr.render(tmpCanvas, 1, complete);
        tmpCanvas.clear();

        if (!complete.complete) {
            /* the fonts aren't loaded yet, let's wait until later */
            return;
        }

        if (testNumber === 1) {
            let interact = new TestTextEventInteractions();
            interact.drawTestCaseSelection(pr);
        } else if (testNumber === 2) {
            let interact = new TestTextEventInteractions();
            interact.drawTestCaseScrolling(pr);
        }

        /* second pass rendering */
        pr.view.allowMultipleFocus = true;
        pr.view.renderBorders = () => {};
        pr.needRedraw = true;
        pr.render(tmpCanvas, 1, complete);
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

        const totalH = h * screensToDraw;
        return new CanvasTestParams(
            'drawTextEdit',
            '/resources/test/drawtexteditexpected.png',
            draw,
            w,
            totalH,
            this.uiContext
        );
    }

    geneva(el: UI512ElTextField, s: string) {
        let spec = new TextFontSpec('geneva', TextFontStyling.Default, 10);
        el.set('defaultFont', spec.toSpecString());
        let t = FormattedText.newFromSerialized(
            UI512DrawText.setFont(s, spec.toSpecString())
        );
        el.setFmTxt(t);
    }
}

/**
 * nearly-empty presenter, driven by tests to take a screenshot of rendered elements
 */
export class UI512TestTextEditPresenter extends UI512Presenter {
    init() {
        super.init();
        addDefaultListeners(this.listeners);
    }
}

/**
 * lorem ipsum filler text
 */
const loremText = longstr(`Lorem ipsum dolor sit amet, dolore pericula ne mel,
erat feugait placerat ut sit, id vel persecuti constituam. Nibh probo et pro,
ei quo case deterruisset. Nibh impetus per at. Oporteat scripserit has te,
sea te nostrud pertinacia. Per deleniti deseruisse an, et usu singulis
necessitatibus. Antiopam efficiendi an mei.{{NEWLINE}}Cum cu ignota timeam consequat,
salutandi contentiones nam an, ut apeirian deserunt conclusionemque eum. Eu
singulis deterruisset vix, sed in sumo suas facete. Qui reprimique dissentiunt
te, nam ne habeo officiis argumentum, cu pri homero democritum. No illum
moderatius sea, vim no equidem nusquam complectitur.{{NEWLINE}}Autem dolor principes
ea duo. In sea suas tation regione, cum ei maiorum volumus reformidans.
Ei mei noluisse oportere iudicabit, ex ius summo officiis, feugait blandit
nominavi id vel. Purto accusamus eu ius, an posse probatus similique
qui.{{NEWLINE}}Ut nibh maiestatis ius, sea dolorum facilisi ei. Cu cum tritani quaeque
pertinacia, causae delectus delicata pro te, graeco scribentur
reprehendunt pri eu. Corpora iracundia adolescens sit ei, in duo
commune reprimique. In aliquam graecis eum, fugit utamur et sea.
In molestie platonem conceptam mel. Ea hinc sensibus eam, aeque
expetendis reprimique et vim.{{NEWLINE}}Sumo saepe sit ne. Ex facilisi pericula
constituam pri, et pro habemus definiebas, aliquam electram ex nam.
Magna nostro moderatius ei sea, cu quo nostro theophrastus. Tation
blandit ei per, odio dolorem has at. At brute alterum vituperatoribus
nec, ad vix idque vocent. An porro ullum euripidis his, an graecis
nostrum eligendi nec. Eos saepe aeterno accommodare ei.`);
