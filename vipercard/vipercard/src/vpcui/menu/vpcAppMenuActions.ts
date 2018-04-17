
/* auto */ import { makeVpcInternalErr, msgNotification } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { BrowserOSInfo, getRoot } from '../../ui512/utils/utils512.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { clrBlack, clrWhite } from '../../ui512/draw/ui512DrawPatterns.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { UI512CompModalDialog } from '../../ui512/composites/ui512ModalDialog.js';
/* auto */ import { OrdinalOrPosition, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcFormNonModalDialogFormBase, VpcSaveInterface } from '../../vpcui/nonmodaldialogs/vpcLyrNonModalHolder.js';
/* auto */ import { DialogDocsType, VpcNonModalDocViewer } from '../../vpcui/nonmodaldialogs/vpcDocViewer.js';
/* auto */ import { VpcNonModalFormSendReport } from '../../vpcui/nonmodaldialogs/vpcFormSendReport.js';
/* auto */ import { VpcNonModalReplBox } from '../../vpcui/nonmodaldialogs/vpcReplMessageBox.js';
/* auto */ import { VpcNonModalFormLogin } from '../../vpcui/nonmodaldialogs/vpcFormLogin.js';
/* auto */ import { VpcAboutDialog } from '../../vpcui/menu/vpcAboutDialog.js';
/* auto */ import { VpcChangeSelectedFont } from '../../vpcui/menu/vpcChangeSelectedFont.js';

export class VpcMenuActions {
    fontChanger: VpcChangeSelectedFont;
    save: VpcSaveInterface;
    constructor(protected vci: VpcStateInterface) {
        this.fontChanger = new VpcChangeSelectedFont(vci);
    }

    // OS menu
    go_mnuOSAbout() {
        let pr = this.vci.getPresenter();
        let dlg = new UI512CompModalDialog('OSAboutDlg');
        VpcAboutDialog.show(pr, dlg);
    }

    go_mnuOSDonate() {
        let pr = this.vci.getPresenter();
        let dlg = new UI512CompModalDialog('OSAboutDlg');
        VpcAboutDialog.showDonateIndirectly(pr, dlg);
    }

    go_mnuReportErr() {
        if (getRoot().getSession()) {
            let dlg = new VpcNonModalFormSendReport(this.vci);
            this.vci.setNonModalDialog(dlg);
        } else {
            let form = new VpcNonModalFormLogin(this.vci, true /* newUserOk*/);
            VpcFormNonModalDialogFormBase.standardWindowBounds(form, this.vci);
            form.fnCbWhenSignedIn = () => {
                this.go_mnuReportErr();
            };
            this.vci.setNonModalDialog(form);
        }
    }

    go_mnuReportSec() {
        throw makeVpcInternalErr(
            msgNotification +
                lng(
                    'lngSecurity issues are taken seriously. If you are aware of an issue that has security\n' +
                        'implications, please contact the developers\nat security@vipercard.net.'
                )
        );
    }

    go_mnuMsgBox() {
        let dlg = new VpcNonModalReplBox(this.vci);
        this.vci.setNonModalDialog(dlg);
    }

    // File menu
    go_mnuSave() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.mnuGoSave();
        }
    }

    go_mnuSaveAs() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.mnuGoSave_As();
        }
    }

    go_mnuOpen() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.mnuGoExit('mnuOpen');
        }
    }

    go_mnuShareALink() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.mnuGoShareLink();
        }
    }

    go_mnuNewStack() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.mnuGoExit('mnuNewStack');
        }
    }

    go_mnuExportStack() {
        // *don't* use this.busy with this. need a way to recover if save() hangs for some reason.
        this.save.mnuGoExportJson();
    }

    go_mnuExportGif() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.mnuGoExportGif();
        }
    }

    go_mnuQuit() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.mnuGoExit('mnuQuit');
        }
    }

    go_mnuFlagStack() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.mnuGoFlagContent();
        }
    }

    // Edit menu
    go_mnuUseHostClipboard() {
        this.vci.setOption('optUseHostClipboard', !this.vci.getOptionB('optUseHostClipboard'));
        this.vci.getPresenter().useOSClipboard = this.vci.getOptionB('optUseHostClipboard');
    }

    go_mnuNewCard() {
        let currentCardId = this.vci.getModel().productOpts.getS('currentCardId');
        let currentCard = this.vci.getModel().getById(currentCardId, VpcElCard);
        let currentBg = this.vci.getModel().getById(currentCard.parentId, VpcElBg);
        let currentIndex = VpcElBase.findIndexById(currentBg.cards, currentCardId);
        let created = this.vci.getOutside().CreateCard(currentIndex === undefined ? 0 : currentIndex + 1);
        this.vci.getModel().productOpts.set('currentCardId', created.id);
    }

    go_mnuDupeCard() {
        // can't use copy card/paste card since it's not yet impl'd
        // use this workaround instead (only copies the paint)
        let currentCardId = this.vci.getOptionS('currentCardId');
        let currentCard = this.vci.getModel().getById(currentCardId, VpcElCard);
        let paint = currentCard.getS('paint');
        this.vci.setOption('selectedVelId', '');
        this.go_mnuNewCard();
        currentCardId = this.vci.getOptionS('currentCardId');
        currentCard = this.vci.getModel().getById(currentCardId, VpcElCard);
        currentCard.set('paint', paint);
    }

    go_mnuPublishFeatured() {
        throw makeVpcInternalErr(
            msgNotification +
                "Your project could be featured on ViperCard's front page! We will be adding 10 new featured stacks by April 2. Save the project, choose 'Share a link' from the File menu, and send the link to @ViperCardDotNet on Twitter."
        );
    }

    go_mnuCopyCardOrVel() {
        let selected = this.fontChanger.cbGetEditToolSelectedFldOrBtn();
        if (selected) {
            this.vci.setOption('copiedVelId', selected.id);
        } else {
            throw makeVpcInternalErr(msgNotification + 'This feature has not yet been developed.');
        }
    }

    go_mnuOSAbout2() {
        this.go_mnuOSAbout();
    }

    go_mnuCreateManyButtons() {
        let currentCardId = this.vci.getModel().productOpts.getS('currentCardId');
        let first = this.vci.createVel(currentCardId, VpcElType.Btn, 0, undefined);
        first.set('showlabel', false);
        first.set('autohilite', false);
        first.set('style', UI512BtnStyle.Transparent);
        first.set('name', 'spacegame_sprites_n' + 0);
        first.set('script', '');
        let firstidgot = first.id;
        for (let i = 0; i < 170; i++) {
            let v = this.vci.createVel(currentCardId, VpcElType.Btn, 0, undefined);
            v.set('showlabel', false);
            v.set('autohilite', false);
            v.set('style', UI512BtnStyle.Transparent);
            v.set('name', 'spacegame_sprites_n' + 0);
            v.set('script', '');
        }
        throw makeVpcInternalErr(msgNotification + 'First id: ' + firstidgot);
    }

    go_mnuDelCard() {
        let wasCurrentCardId = this.vci.getModel().productOpts.getS('currentCardId');
        let wasCurrentCard = this.vci.getModel().getById(wasCurrentCardId, VpcElCard);
        this.vci.getModel().goCardRelative(OrdinalOrPosition.previous);
        if (this.vci.getModel().productOpts.getS('currentCardId') === wasCurrentCardId) {
            this.vci.getModel().goCardRelative(OrdinalOrPosition.next);
        }

        this.vci.getOutside().RemoveCard(wasCurrentCard);
    }

    go_mnuPaintWideLines() {
        this.vci.setOption('optWideLines', !this.vci.getOptionB('optWideLines'));
    }

    go_mnuPaintBlackLines() {
        this.vci.setOption('optPaintLineColor', clrBlack);
    }

    go_mnuPaintWhiteLines() {
        this.vci.setOption('optPaintLineColor', clrWhite);
    }

    go_mnuPaintBlackFill() {
        this.vci.setOption('optPaintFillColor', clrBlack);
    }

    go_mnuPaintWhiteFill() {
        this.vci.setOption('optPaintFillColor', clrWhite);
    }

    go_mnuPaintNoFill() {
        this.vci.setOption('optPaintFillColor', -1);
    }

    go_mnuPaintDrawMult() {
        this.vci.setOption('optPaintDrawMult', !this.vci.getOptionB('optPaintDrawMult'));
    }

    go_mnuPaintManyCopies() {
        let keyname = getRoot().getBrowserInfo() === BrowserOSInfo.Mac ? 'Option' : 'Alt';
        throw makeVpcInternalErr(
            msgNotification +
                lng(
                    `lngTo make many of copies of a shape, first use the 'lasso' or 'select' tool to select the region. Then, hold the ${keyname} key, click within the region, and drag.`
                )
        );
    }

    go_mnuCut() {
        throw makeVpcInternalErr(msgNotification + lng('lngPlease use the keyboard shortcut Cmd+X to \ncut text.'));
    }

    go_mnuCopy() {
        throw makeVpcInternalErr(msgNotification + lng('lngPlease use the keyboard shortcut Cmd+C to \ncopy text.'));
    }

    go_mnuPaste() {
        throw makeVpcInternalErr(msgNotification + lng('lngPlease use the keyboard shortcut Cmd+V to \npaste text.'));
    }

    go_mnuGoCardFirst() {
        this.vci.setCurrentCardNum(OrdinalOrPosition.first);
    }

    go_mnuGoCardPrev() {
        this.vci.setCurrentCardNum(OrdinalOrPosition.previous);
    }

    go_mnuGoCardNext() {
        this.vci.setCurrentCardNum(OrdinalOrPosition.next);
    }

    go_mnuGoCardLast() {
        this.vci.setCurrentCardNum(OrdinalOrPosition.last);
    }

    go_mnuCardInfo() {
        let currentCardId = this.vci.getOptionS('currentCardId');
        this.vci.setTool(VpcTool.Button);
        this.vci.setOption('selectedVelId', currentCardId);
        this.vci.setOption('viewingScriptVelId', '');
    }

    go_mnuStackInfo() {
        let currentstackid = this.vci.getModel().stack.id;
        this.vci.setTool(VpcTool.Button);
        this.vci.setOption('selectedVelId', currentstackid);
        this.vci.setOption('viewingScriptVelId', '');
    }

    go_mnuDlgHelpScreenshots() {
        let dlg = new VpcNonModalDocViewer(this.vci, DialogDocsType.Screenshots);
        this.vci.setNonModalDialog(dlg);
    }

    go_mnuDlgHelpReference() {
        let dlg = new VpcNonModalDocViewer(this.vci, DialogDocsType.Reference);
        this.vci.setNonModalDialog(dlg);
    }

    runFontMenuActionsIfApplicable(s: string) {
        return this.fontChanger.runFontMenuActionsIfApplicable(s);
    }
}
