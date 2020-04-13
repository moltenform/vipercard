
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { getUI512WindowBounds } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { RespondToErr, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { cast } from './../../ui512/utils/util512';
/* auto */ import { addDefaultListeners } from './../../ui512/textedit/ui512TextEvents';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { UI512EventType } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { KeyDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { GridLayout, UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { TestUtilsCanvas } from './../testUtils/testUtilsCanvas';
/* auto */ import { TestDrawUI512Buttons } from './../util512ui/testUI512ElementsViewButtons';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * UI512DemoButtons
 *
 * A "demo" project showing several buttons with different properties and
 * icons. There are vertical lines in the background to verify transparency.
 *
 * 1) tests use this project to compare against a known good screenshot,
 * to make sure rendering has not changed
 * 2) you can start this project in _rootUI512.ts_ to confirm that manually
 * interacting with the buttons has the expected behavior
 */
export class UI512DemoButtons extends UI512Presenter {
    counter = 0;
    isCurrentlyResizingButton = false;
    btnstyleindex = 0;
    drawEnabledStyle = true;
    testrunner: TestDrawUI512Buttons;

    init() {
        super.init();
        addDefaultListeners(this.listeners);
        let clientRect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientRect, this);
        let grp = new UI512ElGroup('grpmain');
        this.app.addGroup(grp);
        this.inited = true;

        this.testrunner = new TestDrawUI512Buttons();
        this.testrunner.uiContext = true;
        let list: UI512ElButton[] = [];
        this.testrunner.addBackgroundButtons(
            this.app,
            grp,
            list,
            clientRect[0],
            clientRect[1]
        );
        this.testrunner.addButtons(
            this.app,
            grp,
            list,
            clientRect[0],
            clientRect[1],
            false,
            false,
            'btns'
        );

        let testBtns = ['DldImage', 'RunTest', 'Disable'];
        let layoutTestBtns = new GridLayout(710, 378, 65, 15, testBtns, [1], 5, 5);
        layoutTestBtns.createElems(
            this.app,
            grp,
            'btn',
            UI512ElButton,
            () => {},
            true,
            true
        );

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseUp, UI512DemoButtons.respondMouseUp);
        this.listenEvent(UI512EventType.MouseMove, UI512DemoButtons.respondMouseMove);
        this.listenEvent(UI512EventType.KeyUp, UI512DemoButtons.respondKeyUp);
        this.rebuildFieldScrollbars();
    }

    protected static respondMouseUp(pr: UI512DemoButtons, d: MouseUpEventDetails) {
        if (d.button !== 0) {
            return;
        }
        if (!d.elClick) {
            return;
        }

        console.log('clicked on ' + d.elClick.id);
        if (d.elClick.id === 'btnDldImage') {
            Util512Higher.syncToAsyncTransition(
                () =>
                    TestUtilsCanvas.RenderAndCompareImages(true, () =>
                        pr.testrunner.testDrawButtons()
                    ),
                'demobuttons',
                RespondToErr.Alert
            );
        } else if (d.elClick.id === 'btnRunTest') {
            Util512Higher.syncToAsyncTransition(
                () =>
                    TestUtilsCanvas.RenderAndCompareImages(false, () =>
                        pr.testrunner.testDrawButtons()
                    ),
                'demobuttons',
                RespondToErr.Alert
            );
        } else if (d.elClick.id === 'btnDisable') {
            pr.drawEnabledStyle = !pr.drawEnabledStyle;
            let grp = pr.app.getGroup('grpmain');
            for (let el of grp.iterEls()) {
                if (el.id.startsWith('btnnumber')) {
                    cast(UI512ElButton, el).set('enabled', pr.drawEnabledStyle);
                    cast(UI512ElButton, el).set('enabledstyle', pr.drawEnabledStyle);
                }
            }
        }
    }

    protected static respondKeyUp(pr: UI512DemoButtons, d: KeyDownEventDetails) {
        if (d.keyChar === 'k' && d.mods === ModifierKeys.Cmd) {
            pr.isCurrentlyResizingButton = !pr.isCurrentlyResizingButton;
            console.log('Resizing is ' + (pr.isCurrentlyResizingButton ? 'on' : 'off'));
        }
    }

    protected static respondMouseMove(pr: UI512DemoButtons, d: MouseMoveEventDetails) {
        if (pr.isCurrentlyResizingButton) {
            let clientRect = getUI512WindowBounds();
            let newW = d.mouseX - clientRect[0];
            let newH = d.mouseY - clientRect[1];
            newW = Math.max(1, newW);
            newH = Math.max(1, newH);

            let grp = pr.app.getGroup('grpmain');
            for (let el of grp.iterEls()) {
                if (el.id.startsWith('btntest')) {
                    el.setDimensions(el.x, el.y, newW, newH);
                }
            }
        }
    }
}
