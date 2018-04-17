
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { GridLayout, UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512CompStdDialogType } from '../../ui512/composites/ui512ModalDialog.js';
/* auto */ import { TestDrawUI512Composites, UI512TestCompositesPresenter } from '../../test/ui512/testUI512Composites.js';

export class UI512DemoComposites extends UI512TestCompositesPresenter {
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

    private static respondMouseUp(pr: UI512DemoComposites, d: MouseUpEventDetails) {
        if (d.elClick && d.button === 0) {
            if (d.elClick.id === 'btnDldImage') {
                pr.test.runtest(true);
            } else if (d.elClick.id === 'btnRunTest') {
                pr.test.runtest(false);
            } else if (d.elClick.id === 'btnWhichChecked') {
                console.log('Fruit: ' + pr.testrbExclusive.getWhichChecked(pr.app));
                console.log('Food: ' + pr.testrbInclusive.getWhichChecked(pr.app));
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

            pr.testrbInclusive.respondMouseUp(pr.app, d);
            pr.testrbExclusive.respondMouseUp(pr.app, d);
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
