
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, Util512, cast } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ModifierKeys, getUI512WindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { elementObserverNoOp } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { GridLayout, UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512ViewDraw } from '../../ui512/elements/ui512ElementsView.js';
/* auto */ import { KeyDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { addDefaultListeners } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512Presenter.js';

export class UI512DemoButtons extends UI512Controller {
    counter = 0;
    isCurrentlyResizingButton = false;
    btnstylelist: string[];
    btnstyleindex = 0;
    drawEnabledStyle = true;
    testrunner: TestDrawUI512Buttons;

    public init() {
        super.init();
        addDefaultListeners(this.listeners);
        let clientrect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientrect, this);
        let grp = new UI512ElGroup('grpmain');
        this.app.addGroup(grp);
        this.inited = true;

        this.testrunner = new TestDrawUI512Buttons();
        this.testrunner.uicontext = true;
        let list: UI512ElButton[] = [];
        this.testrunner.addBackgroundButtons(this.app, grp, list, clientrect[0], clientrect[1]);
        this.testrunner.addButtons(this.app, grp, list, clientrect[0], clientrect[1], false, false, 'btns');

        let testBtns = ['DldImage', 'RunTest', 'Disable'];
        let layoutTestBtns = new GridLayout(710, 378, 65, 15, testBtns, [1], 5, 5);
        layoutTestBtns.createElems(this.app, grp, 'btn', UI512ElButton, () => {}, true, true);

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseUp, UI512DemoButtons.respondMouseUp);
        this.listenEvent(UI512EventType.MouseMove, UI512DemoButtons.respondMouseMove);
        this.listenEvent(UI512EventType.KeyUp, UI512DemoButtons.respondKeyUp);
        this.rebuildFieldScrollbars();
    }

    private static respondMouseUp(c: UI512DemoButtons, d: MouseUpEventDetails) {
        if (d.button !== 0) {
            return;
        }
        if (!d.elClick) {
            return;
        }

        console.log('clicked on ' + d.elClick.id);
        if (d.elClick.id === 'btnDldImage') {
            c.testrunner.runtest(true);
        } else if (d.elClick.id === 'btnRunTest') {
            c.testrunner.runtest(false);
        } else if (d.elClick.id === 'btnDisable') {
            c.drawEnabledStyle = !c.drawEnabledStyle;
            let grp = c.app.getGroup('grpmain');
            for (let el of grp.iterEls()) {
                if (el.id.startsWith('btnnumber')) {
                    cast(el, UI512ElButton).set('enabled', c.drawEnabledStyle);
                    cast(el, UI512ElButton).set('enabledstyle', c.drawEnabledStyle);
                }
            }
        }
    }

    private static respondKeyUp(c: UI512DemoButtons, d: KeyDownEventDetails) {
        if (d.keyChar === 'k' && d.mods === ModifierKeys.Cmd) {
            c.isCurrentlyResizingButton = !c.isCurrentlyResizingButton;
            console.log('Resizing is ' + (c.isCurrentlyResizingButton ? 'on' : 'off'));
        }
    }

    private static respondMouseMove(c: UI512DemoButtons, d: MouseMoveEventDetails) {
        if (c.isCurrentlyResizingButton) {
            let clientrect = getUI512WindowBounds();
            let neww = d.mouseX - clientrect[0];
            let newh = d.mouseY - clientrect[1];
            neww = Math.max(1, neww);
            newh = Math.max(1, newh);

            let grp = c.app.getGroup('grpmain');
            for (let el of grp.iterEls()) {
                if (el.id.startsWith('btntest')) {
                    el.setDimensions(el.x, el.y, neww, newh);
                }
            }
        }
    }
}

enum BtnPropsToTest {
    // note: needs to begin with 0.
    IconAndNoLabel = 0,
    IconAndLabelAndChecked,
    IconAndLabelMultiline,
    NoIconAndLabelNotCenteredDisabled,
    NoIconAndLabelCentered,
    NoIconNoLabel,
    BtnPropsToTestMax,
}

export class TestDrawUI512Buttons extends UI512TestBase {
    readonly numberOfBgButtons = 60;
    uicontext = false;
    tests = [
        'callback/Test Drawing Buttons',
        (callback:()=>void) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawButtons(), callback);
        },
    ];

    runtest(dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawButtons());
    }

    readonly stylesToTest: number[] = [
        UI512BtnStyle.rectangle,
        UI512BtnStyle.transparent,
        UI512BtnStyle.opaque,
        UI512BtnStyle.plain,
        UI512BtnStyle.shadow,
        UI512BtnStyle.osstandard,
        UI512BtnStyle.osdefault,
        UI512BtnStyle.radio,
        UI512BtnStyle.checkbox,
    ];

    setBtnStyle(button: UI512ElButton, props: BtnPropsToTest, style: UI512BtnStyle): UI512ElButton {
        button.set('style', style);
        button.set('labelhalign', !(style === UI512BtnStyle.radio || style === UI512BtnStyle.checkbox));
        button.set('labelvalign', true);

        switch (props) {
            case BtnPropsToTest.IconAndNoLabel:
                button.set('iconsetid', '001');
                button.set('iconnumber', 11);
                break;
            case BtnPropsToTest.IconAndLabelAndChecked:
                button.set('iconsetid', '002');
                button.set('iconnumber', 71 + 21);
                button.set('labeltext', 'label text');
                button.set('checkmark', true);
                break;
            case BtnPropsToTest.IconAndLabelMultiline:
                // intentionally show a truncated icon
                button.set('iconsetid', '001');
                button.set('iconnumber', 12);
                button.set('iconadjustx', 6);
                button.set('iconadjusty', 2);
                button.set('iconadjustwidth', 10);
                button.set('iconadjustheight', -6);
                button.set('labeltext', 'given \nnew line');
                break;
            case BtnPropsToTest.NoIconAndLabelNotCenteredDisabled:
                button.set('labeltext', 'label not centered');
                button.set('labelvalign', false);
                button.set('labelhalign', false);
                break;
            case BtnPropsToTest.NoIconAndLabelCentered:
                button.set('labeltext', "label centered and it's a pretty long string to show");
                button.set('labelvalign', true);
                button.set('labelhalign', true);
                break;
            case BtnPropsToTest.NoIconNoLabel:
                break;
            default:
                assertTrue(false, '1O|unknown button type');
        }

        return button;
    }

    addBackgroundButtons(
        app: UI512Application,
        grp: UI512ElGroup,
        list: UI512ElButton[],
        clientx0: number,
        clienty0: number
    ) {
        for (let x = 0; x < this.numberOfBgButtons; x++) {
            let id = 'btnnumber_bg_' + x.toString();
            let button = new UI512ElButton(id);
            grp.addElement(app, button);
            button.setDimensions(clientx0 + x * 50, 0, 25, 4096);
            list.push(button);
        }
    }

    addButtons(
        app: UI512Application,
        grp: UI512ElGroup,
        list: UI512ElButton[],
        clientx0: number,
        clienty0: number,
        drawBlank: boolean,
        areHighlighted: boolean,
        idprefix: string,
        dims = [90, 65]
    ) {
        let nrows = drawBlank ? BtnPropsToTest.BtnPropsToTestMax : BtnPropsToTest.NoIconNoLabel;
        let rows = Util512.range(0, nrows);
        let layout = new GridLayout(clientx0 + 3, clienty0 + 3, dims[0], dims[1], this.stylesToTest, rows, 3, 3);
        layout.createElems(app, grp, 'btntest' + idprefix + '_', UI512ElButton, (a, b, el) => {
            this.setBtnStyle(el, b, a);
            el.set('highlightactive', areHighlighted);
            list.push(el);
        });
    }

    // these we have confirmed in the emulator as pixel-perfect
    testDrawButtons() {
        const imwidth = 950;
        const imheight = 2400;
        let list: UI512ElButton[] = [];
        let count = 0;
        let view = new UI512ViewDraw();
        let fakeapp = new UI512Application([0, 0, 1, 1], elementObserverNoOp);
        let fakegrp = new UI512ElGroup('fakegrp', elementObserverNoOp);

        // draw background buttons
        this.addBackgroundButtons(fakeapp, fakegrp, list, 1, 1);
        // draw not-highlighted buttons
        this.addButtons(fakeapp, fakegrp, list, 1, 1, true, false, '1');
        // draw highlighted buttons
        this.addButtons(fakeapp, fakegrp, list, 1, 450, true, true, '2');
        // drawing very small buttons might look a bit different, but shouldn't throw errors
        this.addButtons(fakeapp, fakegrp, list, 1, 900, true, false, '3', [2, 2]);
        // drawing very small highlighted buttons
        this.addButtons(fakeapp, fakegrp, list, 500, 900, true, true, '4', [2, 2]);
        // drawing small buttons
        this.addButtons(fakeapp, fakegrp, list, 1, 1000, true, false, '5', [5, 5]);
        // drawing small highlighted buttons
        this.addButtons(fakeapp, fakegrp, list, 500, 1000, true, true, '6', [5, 5]);
        // drawing tall buttons
        this.addButtons(fakeapp, fakegrp, list, 1, 1100, true, false, '7', [40, 200]);
        // drawing tall highlighted buttons
        this.addButtons(fakeapp, fakegrp, list, 500, 1100, true, true, '8', [40, 200]);
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            for (let btn of list) {
                view.renderElement(canvas, btn, false, complete);
            }
        };

        return new CanvasTestParams(
            'drawButtons',
            '/resources/test/drawbuttonsexpected.png',
            draw,
            imwidth,
            imheight,
            this.uicontext
        );
    }
}
