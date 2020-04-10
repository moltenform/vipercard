
/* auto */ import { RespondToErr, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { UI512CompStdDialogType } from './../../ui512/composites/ui512ModalDialog';
/* auto */ import { UI512EventType } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { GridLayout, UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { TestUtilsCanvas } from './../testUtils/testUtilsCanvas';
/* auto */ import { TestDrawUI512Composites, UI512TestCompositesPresenter } from './../util512ui/testUI512Composites';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */


/**
 * UI512DemoComposites
 *
 * A "demo" project showing several composites. (A composite is a
 * group of ui512 elements that are closely related, like a dialog box).
 *
 * 1) tests use this project to compare against a known good screenshot,
 * to make sure rendering has not changed
 * 2) you can start this project in _rootUI512.ts_ to confirm that manually
 * interacting with the buttons has the expected behavior
 */
export class UI512DemoComposites extends UI512TestCompositesPresenter {
    test = new TestDrawUI512Composites();

    init() {
        super.init();

        let clientRect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientRect, this);
        this.inited = true;
        this.test.addElements(this, clientRect);
        this.test.uiContext = true;
        let grp = this.app.getGroup('grp');

        let testBtns = ['WhichChecked', 'RunTest', 'DldImage', 'Dlg1', 'Dlg2', 'DlgAsk'];
        let layoutTestBtns = new GridLayout(clientRect[0] + 10, clientRect[1] + 330, 100, 15, testBtns, [1], 5, 5);
        layoutTestBtns.createElems(this.app, grp, 'btn', UI512ElButton, () => {}, true, true);

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseUp, UI512DemoComposites.respondMouseUp);
        this.rebuildFieldScrollbars();
    }

    protected static respondMouseUp(pr: UI512DemoComposites, d: MouseUpEventDetails) {
        if (d.elClick && d.button === 0) {
            if (d.elClick.id === 'btnDldImage') {
            Util512Higher.syncToAsyncTransition(() => TestUtilsCanvas.RenderAndCompareImages(true, () => pr.test.testDrawComposites()), 'democomposite', RespondToErr.Alert)
        ;
            } else if (d.elClick.id === 'btnRunTest') {
            Util512Higher.syncToAsyncTransition(() => TestUtilsCanvas.RenderAndCompareImages(false, () => pr.test.testDrawComposites()), 'democomposite', RespondToErr.Alert)
            } else if (d.elClick.id === 'btnWhichChecked') {
                console.log('Fruit: ' + pr.testRadioBtns.getWhichChecked(pr.app));
                console.log('Food: ' + pr.testCheckBtns.getWhichChecked(pr.app));
                console.log('Tool: ' + pr.testToolbox.getWhich());
            } else if (d.elClick.id === 'btnDlg1') {
                pr.testModalDlg.dlgType = UI512CompStdDialogType.Answer;
                pr.testModalDlg.btnLabels = ['', '', ''];
                pr.testModalDlg.create(pr, pr.app);
                pr.testModalDlg.showStandardModalDialog(pr, pr.app, n => pr.gotFromDlg(n));
            } else if (d.elClick.id === 'btnDlg2') {
                pr.testModalDlg.dlgType = UI512CompStdDialogType.Answer;
                pr.testModalDlg.btnLabels = ['Ch A', 'Ch B', 'Ch C'];
                pr.testModalDlg.create(pr, pr.app);
                pr.testModalDlg.showStandardModalDialog(pr, pr.app, n => pr.gotFromDlg(n));
            } else if (d.elClick.id === 'btnDlgAsk') {
                pr.testModalDlg.dlgType = UI512CompStdDialogType.Ask;
                pr.testModalDlg.btnLabels = ['OK', 'Cancel'];
                pr.testModalDlg.create(pr, pr.app);
                pr.testModalDlg.showStandardModalDialog(pr, pr.app, n => pr.gotFromDlg(n));
            }

            pr.testCheckBtns.respondMouseUp(pr.app, d);
            pr.testRadioBtns.respondMouseUp(pr.app, d);
            pr.testToolbox.respondMouseUp(pr.app, d);
        }
    }

    gotFromDlg(n: number) {
        console.log(`you clicked on choice "${this.testModalDlg.btnLabels[n]}".`);
        if (this.testModalDlg.resultText) {
            console.log(`you typed ${this.testModalDlg.resultText}`);
        }
    }
}
