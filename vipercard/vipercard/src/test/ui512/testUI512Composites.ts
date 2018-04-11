
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ModifierKeys, ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, NullaryFn, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { KeyDownEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { ClipManager } from '../../ui512/textedit/ui512Clipboard.js';
/* auto */ import { BasicHandlers } from '../../ui512/textedit/ui512BasicHandlers.js';
/* auto */ import { UI512TextEvents, addDefaultListeners } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { UI512CompRadioButtonGroup } from '../../ui512/composites/ui512ButtonGroup.js';
/* auto */ import { UI512CompToolbox } from '../../ui512/composites/ui512Toolbox.js';
/* auto */ import { UI512CompModalDialog } from '../../ui512/composites/ui512ModalDialog.js';
/* auto */ import { UI512CompCodeEditor } from '../../ui512/composites/ui512CodeEditor.js';

export class TestDrawUI512Composites extends UI512TestBase {
    uicontext = false;
    tests = [
        'callback/Test Drawing Composites',
        (callback: NullaryFn) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawComposites(), callback);
        }
    ];

    runtest(dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawComposites());
    }

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
        pr.testrbExclusive.items = [['apple', 'lngApple'], ['cherry', 'lngCherry'], ['strawberry', 'lngStrawberry']];
        pr.testrbExclusive.isExclusive = true;
        pr.testrbExclusive.logicalWidth = 100;
        pr.testrbExclusive.logicalHeight = 1;
        pr.testrbExclusive.x = 50;
        pr.testrbExclusive.y = 50;
        pr.testrbExclusive.create(pr, pr.app);
        pr.testrbInclusive.items = [
            ['fries', 'lngFries'],
            ['hamburger', 'lngHamburger'],
            ['soda', 'lngSoda'],
            ['hot dog', 'lngHot Dog']
        ];
        pr.testrbInclusive.isExclusive = false;
        pr.testrbInclusive.logicalWidth = 100;
        pr.testrbInclusive.logicalHeight = 1;
        pr.testrbInclusive.x = 50;
        pr.testrbInclusive.y = 130;
        pr.testrbInclusive.create(pr, pr.app);

        /* add toolbox */
        const iconw = 20;
        pr.testToolbox.iconGroupId = '001';
        pr.testToolbox.x = 50;
        pr.testToolbox.y = 300;
        pr.testToolbox.iconH = 22;
        pr.testToolbox.widthOfIcon = (id: string) => {
            return iconw;
        };
        pr.testToolbox.logicalWidth = 3 * iconw - 2;
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

        /* add code editor */
        pr.testEditor.x = 200;
        pr.testEditor.y = pr.testrbExclusive.y;
        pr.testEditor.logicalWidth = 200;
        pr.testEditor.logicalHeight = 200;
        pr.testEditor.autoIndent.caseSensitive = false;
        pr.testEditor.autoIndent.lineContinuation = ['\\', '\xC2' /* roman logical not */];
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

    drawTestCase(
        testnumber: number,
        tmpCanvas: CanvasWrapper,
        w: number,
        h: number,
        i: number,
        complete: RenderComplete
    ) {
        tmpCanvas.clear();
        let testc = new UI512TestCompositesPresenter();
        testc.init();
        testc.inited = true;
        testc.app = new UI512Application([0, 0, w, h], testc);
        this.addElements(testc, testc.app.bounds);
        testc.rebuildFieldScrollbars();

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

        if (testnumber === 0) {
            this.drawTestCaseComposites1(testc);
        } else {
            this.drawTestCaseComposites2(testc);
        }

        /* second pass rendering */
        testc.view.renderBorders = () => {};
        testc.needRedraw = true;
        testc.render(tmpCanvas, 1, complete);
    }

    drawTestCaseComposites1(pr: UI512TestCompositesPresenter) {
        pr.testrbExclusive.setWhichChecked(pr.app, ['apple']);
        pr.testrbInclusive.setWhichChecked(pr.app, ['fries', 'hamburger', 'soda']);
        pr.setCurrentFocus(pr.testEditor.el.id);
        this.simulateKey(pr, 'Home', '', false, true);
        this.simulateKey(pr, 'Enter', '', false, false);
        this.simulateKey(pr, 'ArrowRight', '', true, false);

        pr.useOSClipboard = false;
        let clipManager = pr.clipManager as ClipManager;
        assertTrue(clipManager.isClipManager, '');
        clipManager.simClipboard = '';
        this.simulateKey(pr, 'C', 'c', false, true);
        assertEq('\n', clipManager.simClipboard, '1R|');
    }

    drawTestCaseComposites2(pr: UI512TestCompositesPresenter) {
        pr.testrbExclusive.setWhichChecked(pr.app, ['apple']);
        pr.testrbExclusive.setWhichChecked(pr.app, ['cherry']);
        pr.testrbInclusive.setWhichChecked(pr.app, ['fries', 'hamburger', 'soda']);
        pr.testrbInclusive.setWhichChecked(pr.app, ['hot dog']);
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

        const totalh = h * screensToDraw;
        return new CanvasTestParams(
            'drawComposites',
            '/resources/test/drawcompositesexpected.png',
            draw,
            w,
            totalh,
            this.uicontext
        );
    }

    simulateKey(pr: UI512TestCompositesPresenter, keyCode: string, keyChar: string, isShift: boolean, isCmd = false) {
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
}

export class UI512TestCompositesPresenter extends UI512Presenter {
    testrbExclusive = new UI512CompRadioButtonGroup('testrbExclusive');
    testrbInclusive = new UI512CompRadioButtonGroup('testrbInclusive');
    testToolbox = new UI512CompToolbox('testToolbox');
    testEditor = new UI512CompCodeEditor('testCodeEditor');
    testModalDlg = new UI512CompModalDialog('testModalDlg');
    public init() {
        super.init();
        addDefaultListeners(this.listeners);
        let editTextBehavior = new UI512TextEvents();
        this.listeners[UI512EventType.KeyDown.valueOf()] = [
            BasicHandlers.basicKeyShortcuts,
            UI512TestCompositesPresenter.respondKeyDown, /* inserted before editTextBehavior so that we can recieve the "Enter" keystroke */
            editTextBehavior.onKeyDown.bind(editTextBehavior)
        ];
    }

    private static respondKeyDown(pr: UI512TestCompositesPresenter, d: KeyDownEventDetails) {
        let focus = pr.getCurrentFocus();
        if (pr.testEditor.children.length && focus && pr.testEditor.el && focus === pr.testEditor.el.id) {
            pr.testEditor.respondKeydown(d);
        }
    }
}
