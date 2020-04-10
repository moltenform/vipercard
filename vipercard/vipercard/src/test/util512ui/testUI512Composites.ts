
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { RenderComplete } from './../../ui512/utils/util512Higher';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { assertEq } from './../../ui512/utils/util512';
/* auto */ import { UI512CompToolbox } from './../../ui512/composites/ui512Toolbox';
/* auto */ import { UI512TextEvents, addDefaultListeners } from './../../ui512/textedit/ui512TextEvents';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { UI512CompModalDialog } from './../../ui512/composites/ui512ModalDialog';
/* auto */ import { UI512EventType } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { KeyDownEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512CompCodeEditor } from './../../ui512/composites/ui512CodeEditor';
/* auto */ import { ClipManager } from './../../ui512/textedit/ui512ClipManager';
/* auto */ import { UI512CompButtonGroup } from './../../ui512/composites/ui512ButtonGroup';
/* auto */ import { BasicHandlers } from './../../ui512/textedit/ui512BasicHandlers';
/* auto */ import { CanvasTestParams, TestUtilsCanvas } from './../testUtils/testUtilsCanvas';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */


/**
 * TestDrawUI512Composites
 *
 * A "demo" project showing several composites. (A composite is a
 * group of ui512 elements that are closely related, like a dialog box).
 *
 * 1) tests use this project to compare against a known good screenshot,
 * to make sure rendering has not changed
 * 2) you can start this project in _rootUI512.ts_
 * (uncomment the line referencing _UI512DemoComposites_) to confirm that manually
 * interacting with the buttons has the expected behavior
 */
export class TestDrawUI512Composites extends UI512TestBase {
    uiContext = false;
    tests = [
        'async/Test Drawing Composites',
        async () => {
            await TestUtilsCanvas.RenderAndCompareImages(false, () =>
                this.testDrawComposites()
            );
        }
    ];

    addElements(pr: UI512TestCompositesPresenter, bounds: number[]) {
        let grp = new UI512ElGroup('grp');
        pr.app.addGroup(grp);
        pr.testModalDlg.labelText = 'aa';
        pr.testModalDlg.providedText = 'sample input';

        /* add bg */
        let bg = new UI512ElButton('bg');
        grp.addElement(pr.app, bg);
        bg.set('style', UI512BtnStyle.Opaque);
        bg.setDimensions(bounds[0], bounds[1], bounds[2], bounds[3]);
        bg.set('autohighlight', false);

        /* add choice groups */
        this.addElementsChoiceGroups(pr);

        /* add toolbox */
        this.addElementsToolbox(pr);

        /* add code editor */
        this.addElementsCodeEditor(pr);
    }

    protected addElementsCodeEditor(pr: UI512TestCompositesPresenter) {
        pr.testEditor.x = 200;
        pr.testEditor.y = pr.testRadioBtns.y;
        pr.testEditor.logicalWidth = 200;
        pr.testEditor.logicalHeight = 200;
        pr.testEditor.autoIndent.caseSensitive = false;
        pr.testEditor.autoIndent.lineContinuation = [
            '\\',
            '\xC2' /* roman logical not */
        ];
        pr.testEditor.lineCommentPrefix = '--~ ';
        pr.testEditor.create(pr, pr.app);
        pr.testEditor.setCaption(pr.app, 'Script "New Button"');
        pr.testEditor.setContent(
            `abc
start1
start b2
on custom
end other
123 \\
456 \\
789
end custom
end b2
start b22
start
end1`.replace(/\r\n/g, '\n')
        );
    }

    protected addElementsToolbox(pr: UI512TestCompositesPresenter) {
        const iconW = 20;
        pr.testToolbox.iconGroupId = '001';
        pr.testToolbox.x = 50;
        pr.testToolbox.y = 300;
        pr.testToolbox.iconH = 22;
        pr.testToolbox.widthOfIcon = (id: string) => {
            return iconW;
        };
        pr.testToolbox.logicalWidth = 3 * iconW - 2;
        pr.testToolbox.logicalHeight = 1;
        pr.testToolbox.items = [
            ['rectangle', 9],
            ['roundrect', 10],
            ['bucket', 11],
            ['cirle', 12],
            ['heart', 13],
            ['letter', 14]
        ];
        pr.testToolbox.create(pr, pr.app);
    }

    protected addElementsChoiceGroups(pr: UI512TestCompositesPresenter) {
        pr.testRadioBtns.items = [
            ['apple', 'lngApple'],
            ['cherry', 'lngCherry'],
            ['strawberry', 'lngStrawberry']
        ];
        pr.testRadioBtns.isExclusive = true;
        pr.testRadioBtns.logicalWidth = 100;
        pr.testRadioBtns.logicalHeight = 1;
        pr.testRadioBtns.x = 50;
        pr.testRadioBtns.y = 50;
        pr.testRadioBtns.create(pr, pr.app);
        pr.testCheckBtns.items = [
            ['fries', 'lngFries'],
            ['hamburger', 'lngHamburger'],
            ['soda', 'lngSoda'],
            ['hot dog', 'lngHot Dog']
        ];
        pr.testCheckBtns.isExclusive = false;
        pr.testCheckBtns.logicalWidth = 100;
        pr.testCheckBtns.logicalHeight = 1;
        pr.testCheckBtns.x = 50;
        pr.testCheckBtns.y = 130;
        pr.testCheckBtns.create(pr, pr.app);
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
        let testPr = new UI512TestCompositesPresenter();
        testPr.init();
        testPr.inited = true;
        testPr.app = new UI512Application([0, 0, w, h], testPr);
        this.addElements(testPr, testPr.app.bounds);
        testPr.rebuildFieldScrollbars();

        /* first pass rendering adds the scrollbars */
        /* don't show any borders */
        testPr.view.renderBorders = () => {};
        testPr.needRedraw = true;
        testPr.render(tmpCanvas, 1, complete);
        tmpCanvas.clear();

        if (!complete.complete) {
            /* the fonts aren't loaded yet, let's wait until later */
            return;
        }

        if (testNumber === 0) {
            this.drawTestCaseComposites1(testPr);
        } else {
            this.drawTestCaseComposites2(testPr);
        }

        /* second pass rendering */
        testPr.view.renderBorders = () => {};
        testPr.needRedraw = true;
        testPr.render(tmpCanvas, 1, complete);
    }

    drawTestCaseComposites1(pr: UI512TestCompositesPresenter) {
        pr.testRadioBtns.setWhichChecked(pr.app, ['apple']);
        pr.testCheckBtns.setWhichChecked(pr.app, ['fries', 'hamburger', 'soda']);
        pr.setCurrentFocus(pr.testEditor.el.id);
        this.simulateKey(pr, 'Home', '', false, true);
        this.simulateKey(pr, 'Enter', '', false, false);
        this.simulateKey(pr, 'ArrowRight', '', true, false);

        pr.useOSClipboard = false;
        let clipManager = pr.clipManager as ClipManager;
        assertTrue(clipManager.isClipManager, '9p|');
        clipManager.simClipboard = '';
        this.simulateKey(pr, 'C', 'c', false, true);
        assertEq('\n', clipManager.simClipboard, '1R|');
    }

    drawTestCaseComposites2(pr: UI512TestCompositesPresenter) {
        pr.testRadioBtns.setWhichChecked(pr.app, ['apple']);
        pr.testRadioBtns.setWhichChecked(pr.app, ['cherry']);
        pr.testCheckBtns.setWhichChecked(pr.app, ['fries', 'hamburger', 'soda']);
        pr.testCheckBtns.setWhichChecked(pr.app, ['hot dog']);
        pr.testToolbox.setWhich(pr.app, 'letter');
        pr.setCurrentFocus(pr.testEditor.el.id);
        this.simulateKey(pr, 'Home', '', false, true);
        this.simulateKey(pr, 'A', 'a', false, true);
        this.simulateKey(pr, 'Backspace', '', false, false);
        this.simulateText(pr, 'on a');
        this.simulateKey(pr, 'Enter', '', false, false);
        this.simulateText(pr, 'on b');
        this.simulateKey(pr, 'Enter', '', false, false);
        this.simulateKey(pr, 'ArrowLeft', '', false, false);
        this.simulateKey(pr, 'ArrowLeft', '', false, false);
        this.simulateKey(pr, 'ArrowLeft', '', false, false);
        this.simulateKey(pr, 'Enter', '', false, false);
        this.simulateText(pr, 'end bb');
        this.simulateKey(pr, 'Enter', '', false, false);
        this.simulateKey(pr, 'ArrowRight', '', true, false);
    }

    testDrawComposites() {
        const w = 928;
        const h = 360;
        const screensToDraw = 2;
        assertEq(w, ScreenConsts.ScreenWidth, '1Q|');
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
            'drawComposites',
            '/resources/test/drawcompositesexpected.png',
            draw,
            w,
            totalH,
            this.uiContext
        );
    }

    simulateKey(
        pr: UI512TestCompositesPresenter,
        keyCode: string,
        keyChar: string,
        isShift: boolean,
        isCmd = false
    ) {
        let mods = isShift ? ModifierKeys.Shift : ModifierKeys.None;
        mods |= isCmd ? ModifierKeys.Cmd : ModifierKeys.None;
        let d = new KeyDownEventDetails(0, keyCode, keyChar, false, mods);
        pr.rawEvent(d);
    }

    simulateText(pr: UI512TestCompositesPresenter, s: string) {
        assertTrue(s.match(/^(\w| )*$/), '1P|expected only words/spaces');
        for (let chr of s) {
            this.simulateKey(pr, chr, chr, false, false);
        }
    }

    runTest(dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawComposites());
    }
}

/**
 * presenter that will be driven by tests to take a screenshot of rendered elements
 */
export class UI512TestCompositesPresenter extends UI512Presenter {
    testRadioBtns = new UI512CompButtonGroup('testRadioBtns');
    testCheckBtns = new UI512CompButtonGroup('testCheckBtns');
    testToolbox = new UI512CompToolbox('testToolbox');
    testEditor = new UI512CompCodeEditor('testCodeEditor');
    testModalDlg = new UI512CompModalDialog('testModalDlg');
    init() {
        super.init();
        addDefaultListeners(this.listeners);
        let editTextBehavior = new UI512TextEvents();
        this.listeners[UI512EventType.KeyDown.valueOf()] = [
            BasicHandlers.basicKeyShortcuts,
            UI512TestCompositesPresenter.respondKeyDown,
            /* inserted before editTextBehavior so that we
            can recieve the "Enter" keystroke */ editTextBehavior.onKeyDown.bind(
                editTextBehavior
            )
        ];
    }

    protected static respondKeyDown(
        pr: UI512TestCompositesPresenter,
        d: KeyDownEventDetails
    ) {
        let focus = pr.getCurrentFocus();
        if (
            pr.testEditor.children.length &&
            focus &&
            pr.testEditor.el &&
            focus === pr.testEditor.el.id
        ) {
            pr.testEditor.respondKeydown(d);
        }
    }
}
