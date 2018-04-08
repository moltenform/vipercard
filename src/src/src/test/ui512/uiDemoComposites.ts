
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ModifierKeys, ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, NullaryFn, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { GridLayout, UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { KeyDownEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { ClipManager } from '../../ui512/textedit/ui512Clipboard.js';
/* auto */ import { BasicHandlers } from '../../ui512/textedit/ui512BasicHandlers.js';
/* auto */ import { EditTextBehavior, addDefaultListeners } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { UI512CompRadioButtonGroup } from '../../ui512/composites/ui512ButtonGroup.js';
/* auto */ import { UI512CompToolbox } from '../../ui512/composites/ui512Toolbox.js';
/* auto */ import { UI512CompStdDialog, UI512CompStdDialogType } from '../../ui512/composites/ui512ModalDialog.js';
/* auto */ import { UI512CompCodeEditor } from '../../ui512/composites/ui512CodeEditor.js';

export class UI512TestCompositesController extends UI512Controller {
    testrbExclusive = new UI512CompRadioButtonGroup('testrbExclusive');
    testrbInclusive = new UI512CompRadioButtonGroup('testrbInclusive');
    testToolbox = new UI512CompToolbox('testToolbox');
    testEditor = new UI512CompCodeEditor('testCodeEditor');
    testModalDlg = new UI512CompStdDialog('testModalDlg');
    public init() {
        super.init();
        addDefaultListeners(this.listeners);
        let editTextBehavior = new EditTextBehavior();
        this.listeners[UI512EventType.KeyDown.valueOf()] = [
            BasicHandlers.basicKeyShortcuts,
            UI512TestCompositesController.respondKeyDown, // inserted before editTextBehavior so that we can recieve the "Enter" keystroke
            editTextBehavior.onKeyDown.bind(editTextBehavior),
        ];
    }

    private static respondKeyDown(c: UI512DemoComposites, d: KeyDownEventDetails) {
        let focus = c.getCurrentFocus();
        if (c.testEditor.children.length && focus && c.testEditor.el && focus === c.testEditor.el.id) {
            c.testEditor.respondKeydown(d);
        }
    }
}

export class UI512DemoComposites extends UI512TestCompositesController {
    test = new TestDrawUI512Composites();

    public init() {
        super.init();

        let clientrect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientrect, this);
        this.inited = true;
        this.test.addElements(this, clientrect);
        this.test.uicontext = true;
        let grp = this.app.getGroup('grp');

        let testBtns = ['WhichChecked', 'RunTest', 'DldImage', 'Dlg1', 'Dlg2', 'DlgAsk'];
        let layoutTestBtns = new GridLayout(clientrect[0] + 10, clientrect[1] + 330, 100, 15, testBtns, [1], 5, 5);
        layoutTestBtns.createElems(this.app, grp, 'btn', UI512ElButton, () => {}, true, true);

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseUp, UI512DemoComposites.respondMouseUp);
        this.rebuildFieldScrollbars();
    }

    private static respondMouseUp(c: UI512DemoComposites, d: MouseUpEventDetails) {
        if (d.elClick && d.button === 0) {
            if (d.elClick.id === 'btnDldImage') {
                c.test.runtest(true);
            } else if (d.elClick.id === 'btnRunTest') {
                c.test.runtest(false);
            } else if (d.elClick.id === 'btnWhichChecked') {
                console.log('Fruit: ' + c.testrbExclusive.getWhichChecked(c.app));
                console.log('Food: ' + c.testrbInclusive.getWhichChecked(c.app));
                console.log('Tool: ' + c.testToolbox.getWhich());
            } else if (d.elClick.id === 'btnDlg1') {
                c.testModalDlg.dlgtype = UI512CompStdDialogType.Answer;
                c.testModalDlg.btnlabels = ['', '', ''];
                c.testModalDlg.create(c, c.app);
                c.testModalDlg.autoRegisterAndSuppressAndRestore(c, c.app, n => c.gotFromDlg(n));
            } else if (d.elClick.id === 'btnDlg2') {
                c.testModalDlg.dlgtype = UI512CompStdDialogType.Answer;
                c.testModalDlg.btnlabels = ['Ch A', 'Ch B', 'Ch C'];
                c.testModalDlg.create(c, c.app);
                c.testModalDlg.autoRegisterAndSuppressAndRestore(c, c.app, n => c.gotFromDlg(n));
            } else if (d.elClick.id === 'btnDlgAsk') {
                c.testModalDlg.dlgtype = UI512CompStdDialogType.Ask;
                c.testModalDlg.btnlabels = ['OK', 'Cancel'];
                c.testModalDlg.create(c, c.app);
                c.testModalDlg.autoRegisterAndSuppressAndRestore(c, c.app, n => c.gotFromDlg(n));
            }

            c.testrbInclusive.listenMouseUp(c.app, d);
            c.testrbExclusive.listenMouseUp(c.app, d);
            c.testToolbox.listenMouseUp(c.app, d);
        }
    }

    gotFromDlg(n: number) {
        console.log(`you clicked on choice "${this.testModalDlg.btnlabels[n]}".`);
        if (this.testModalDlg.resultText) {
            console.log(`you typed ${this.testModalDlg.resultText}`);
        }
    }
}

export class TestDrawUI512Composites extends UI512TestBase {
    uicontext = false;
    tests = [
        'callback/Test Drawing Composites',
        (callback: NullaryFn) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawComposites(), callback);
        },
    ];

    runtest(dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawComposites());
    }

    addElements(c: UI512TestCompositesController, bounds: number[]) {
        let grp = new UI512ElGroup('grp');
        c.app.addGroup(grp);
        c.testModalDlg.labeltext = 'aa';
        c.testModalDlg.translatedProvidedText = 'sample input';

        // add bg
        let bg = new UI512ElButton('bg');
        grp.addElement(c.app, bg);
        bg.set('style', UI512BtnStyle.Opaque);
        bg.setDimensions(bounds[0], bounds[1], bounds[2], bounds[3]);
        bg.set('autohighlight', false);

        // add choice groups
        c.testrbExclusive.items = [['apple', 'lngApple'], ['cherry', 'lngCherry'], ['strawberry', 'lngStrawberry']];
        c.testrbExclusive.isExclusive = true;
        c.testrbExclusive.logicalWidth = 100;
        c.testrbExclusive.logicalHeight = 1;
        c.testrbExclusive.x = 50;
        c.testrbExclusive.y = 50;
        c.testrbExclusive.create(c, c.app);
        c.testrbInclusive.items = [
            ['fries', 'lngFries'],
            ['hamburger', 'lngHamburger'],
            ['soda', 'lngSoda'],
            ['hot dog', 'lngHot Dog'],
        ];
        c.testrbInclusive.isExclusive = false;
        c.testrbInclusive.logicalWidth = 100;
        c.testrbInclusive.logicalHeight = 1;
        c.testrbInclusive.x = 50;
        c.testrbInclusive.y = 130;
        c.testrbInclusive.create(c, c.app);

        // add toolbox
        const iconw = 20;
        c.testToolbox.icongroupid = '001';
        c.testToolbox.x = 50;
        c.testToolbox.y = 300;
        c.testToolbox.iconh = 22;
        c.testToolbox.widthOfIcon = (id: string) => {
            return iconw;
        };
        c.testToolbox.logicalWidth = 3 * iconw - 2;
        c.testToolbox.logicalHeight = 1;
        c.testToolbox.items = [
            ['rectangle', 9],
            ['roundrect', 10],
            ['bucket', 11],
            ['cirle', 12],
            ['heart', 13],
            ['letter', 14],
        ];
        c.testToolbox.create(c, c.app);

        // add code editor
        c.testEditor.x = 200;
        c.testEditor.y = c.testrbExclusive.y;
        c.testEditor.logicalWidth = 200;
        c.testEditor.logicalHeight = 200;
        c.testEditor.autoIndent.caseSensitive = false;
        c.testEditor.autoIndent.lineContinuation = ['\\', '\xC2' /* roman logical not */];
        c.testEditor.lineCommentPrefix = '--~ ';
        c.testEditor.create(c, c.app);
        c.testEditor.setCaption(c.app, 'Script "New Button"');
        c.testEditor.setContent(
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
        let testc = new UI512TestCompositesController();
        testc.init();
        testc.inited = true;
        testc.app = new UI512Application([0, 0, w, h], testc);
        this.addElements(testc, testc.app.bounds);
        testc.rebuildFieldScrollbars();

        // first pass rendering adds the scrollbars
        // don't show any borders
        testc.view.renderBorders = () => {};
        testc.needRedraw = true;
        testc.render(tmpCanvas, 1, complete);
        tmpCanvas.clear();

        if (!complete.complete) {
            // the fonts aren't loaded yet, let's wait until later
            return;
        }

        if (testnumber === 0) {
            this.drawTestCaseComposites1(testc);
        } else {
            this.drawTestCaseComposites2(testc);
        }

        // second pass rendering
        testc.view.renderBorders = () => {};
        testc.needRedraw = true;
        testc.render(tmpCanvas, 1, complete);
    }

    drawTestCaseComposites1(c: UI512TestCompositesController) {
        c.testrbExclusive.setWhichChecked(c.app, ['apple']);
        c.testrbInclusive.setWhichChecked(c.app, ['fries', 'hamburger', 'soda']);
        c.setCurrentFocus(c.testEditor.getEl().id);
        this.simulateKey(c, 'Home', '', false, true);
        this.simulateKey(c, 'Enter', '', false, false);
        this.simulateKey(c, 'ArrowRight', '', true, false);

        c.useOSClipboard = false;
        let clipManager = c.clipManager as ClipManager;
        assertTrue(clipManager.isClipManager, '');
        clipManager.simClipboard = '';
        this.simulateKey(c, 'C', 'c', false, true);
        assertEq('\n', clipManager.simClipboard, '1R|');
    }

    drawTestCaseComposites2(c: UI512TestCompositesController) {
        c.testrbExclusive.setWhichChecked(c.app, ['apple']);
        c.testrbExclusive.setWhichChecked(c.app, ['cherry']);
        c.testrbInclusive.setWhichChecked(c.app, ['fries', 'hamburger', 'soda']);
        c.testrbInclusive.setWhichChecked(c.app, ['hot dog']);
        c.testToolbox.setWhich(c.app, 'letter');
        c.setCurrentFocus(c.testEditor.getEl().id);
        this.simulateKey(c, 'Home', '', false, true);
        this.simulateKey(c, 'A', 'a', false, true);
        this.simulateKey(c, 'Backspace', '', false, false);
        this.simulateText(c, 'on a');
        this.simulateKey(c, 'Enter', '', false, false);
        this.simulateText(c, 'on b');
        this.simulateKey(c, 'Enter', '', false, false);
        this.simulateKey(c, 'ArrowLeft', '', false, false);
        this.simulateKey(c, 'ArrowLeft', '', false, false);
        this.simulateKey(c, 'ArrowLeft', '', false, false);
        this.simulateKey(c, 'Enter', '', false, false);
        this.simulateText(c, 'end bb');
        this.simulateKey(c, 'Enter', '', false, false);
        this.simulateKey(c, 'ArrowRight', '', true, false);
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

    simulateKey(

        c: UI512TestCompositesController,
        keyCode: string,
        keyChar: string,
        isShift: boolean,
        isCmd = false
    ) {
        let mods = isShift ? ModifierKeys.Shift : ModifierKeys.None;
        mods |= isCmd ? ModifierKeys.Cmd : ModifierKeys.None;
        let d = new KeyDownEventDetails(0, keyCode, keyChar, false, mods);
        c.rawEvent(d);
    }

    simulateText(c: UI512TestCompositesController, s: string) {
        assertTrue(s.match(/^(\w| )*$/), '1P|expected only words/spaces');
        for (let chr of s) {
            this.simulateKey(c, chr, chr, false, false);
        }
    }
}
