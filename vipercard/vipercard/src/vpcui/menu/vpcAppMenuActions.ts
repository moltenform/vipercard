
/* auto */ import { makeVpcInternalErr, msgNotification } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { BrowserOSInfo, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { clrBlack, clrWhite } from '../../ui512/draw/ui512DrawPattern.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512CompModalDialog } from '../../ui512/composites/ui512ModalDialog.js';
/* auto */ import { OrdinalOrPosition, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcFormNonModalDialogFormBase, VpcSaveUtilsInterface } from '../../vpcui/nonmodaldialogs/vpcNonModalCommon.js';
/* auto */ import { DialogDocsType, VpcAppNonModalDialogDocs } from '../../vpcui/nonmodaldialogs/vpcDocViewer.js';
/* auto */ import { VpcAppNonModalDialogSendReport } from '../../vpcui/nonmodaldialogs/vpcSendErrReport.js';
/* auto */ import { VpcAppNonModalDialogReplBox } from '../../vpcui/nonmodaldialogs/vpcReplMessageBox.js';
/* auto */ import { VpcFormNonModalDialogLogIn } from '../../vpcui/nonmodaldialogs/vpcFormLogin.js';
/* auto */ import { VpcAboutDialog } from '../../vpcui/menu/vpcAboutDialog.js';
/* auto */ import { VpcChangeSelectedFont } from '../../vpcui/menu/vpcChangeSelectedFont.js';

export class VpcMenuActions {
    fontChanger: VpcChangeSelectedFont;
    saveUtils: VpcSaveUtilsInterface;
    constructor(protected appli: VpcStateInterface) {
        this.fontChanger = new VpcChangeSelectedFont(appli);
    }

    // OS menu
    go_mnuOSAbout() {
        let pr = this.appli.getPresenter();
        let dlg = new UI512CompModalDialog('OSAboutDlg');
        VpcAboutDialog.show(pr, dlg);
    }

    go_mnuOSDonate() {
        let pr = this.appli.getPresenter();
        let dlg = new UI512CompModalDialog('OSAboutDlg');
        VpcAboutDialog.showDonateIndirectly(pr, dlg);
    }

    go_mnuReportErr() {
        if (getRoot().getSession()) {
            let dlg = new VpcAppNonModalDialogSendReport(this.appli);
            this.appli.setNonModalDialog(dlg);
        } else {
            let form = new VpcFormNonModalDialogLogIn(this.appli, true /* newUserOk*/);
            VpcFormNonModalDialogFormBase.standardWindowBounds(form, this.appli);
            form.fnCbWhenSignedIn = () => {
                this.go_mnuReportErr();
            };
            this.appli.setNonModalDialog(form);
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
        let dlg = new VpcAppNonModalDialogReplBox(this.appli);
        this.appli.setNonModalDialog(dlg);
    }

    // File menu
    go_mnuSave() {
        if (this.saveUtils.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.saveUtils.mnuGoSave();
        }
    }

    go_mnuSaveAs() {
        if (this.saveUtils.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.saveUtils.mnuGoSave_As();
        }
    }

    go_mnuOpen() {
        if (this.saveUtils.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.saveUtils.mnuGoExit('mnuOpen');
        }
    }

    go_mnuShareALink() {
        if (this.saveUtils.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.saveUtils.mnuGoShareLink();
        }
    }

    go_mnuNewStack() {
        if (this.saveUtils.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.saveUtils.mnuGoExit('mnuNewStack');
        }
    }

    go_mnuExportStack() {
        // *don't* use this.busy with this. need a way to recover if save() hangs for some reason.
        this.saveUtils.mnuGoExportJson();
    }

    go_mnuExportGif() {
        if (this.saveUtils.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.saveUtils.mnuGoExportGif();
        }
    }

    go_mnuQuit() {
        if (this.saveUtils.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.saveUtils.mnuGoExit('mnuQuit');
        }
    }

    go_mnuFlagStack() {
        if (this.saveUtils.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.saveUtils.mnuGoFlagContent();
        }
    }

    // Edit menu
    go_mnuUseHostClipboard() {
        this.appli.setOption('optUseHostClipboard', !this.appli.getOption_b('optUseHostClipboard'));
        this.appli.getPresenter().useOSClipboard = this.appli.getOption_b('optUseHostClipboard');
    }

    go_mnuNewCard() {
        let currentCardId = this.appli.getModel().productOpts.get_s('currentCardId');
        let currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
        let currentBg = this.appli.getModel().getById(currentCard.parentId, VpcElBg);
        let currentIndex = VpcElBase.findIndexById(currentBg.cards, currentCardId);
        let created = this.appli.getOutside().CreateCard(currentIndex === undefined ? 0 : currentIndex + 1);
        this.appli.getModel().productOpts.set('currentCardId', created.id);
    }

    go_mnuDupeCard() {
        // can't use copy card/paste card since it's not yet impl'd
        // use this workaround instead (only copies the paint)
        let currentCardId = this.appli.getOption_s('currentCardId');
        let currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
        let paint = currentCard.get_s('paint');
        this.appli.setOption('selectedVelId', '');
        this.go_mnuNewCard();
        currentCardId = this.appli.getOption_s('currentCardId');
        currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
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
            this.appli.setOption('copiedVelId', selected.id);
        } else {
            throw makeVpcInternalErr(msgNotification + 'This feature has not yet been developed.');
        }
    }

    go_mnuOSAbout2() {
        this.go_mnuOSAbout();
    }

    go_mnuCreateManyButtons() {
        let currentCardId = this.appli.getModel().productOpts.get_s('currentCardId');
        let first = this.appli.createElem(currentCardId, VpcElType.Btn, 0, undefined);
        first.set('showlabel', false);
        first.set('autohilite', false);
        first.set('style', UI512BtnStyle.Transparent);
        first.set('name', 'spacegame_sprites_n' + 0);
        first.set('script', '');
        let firstidgot = first.id;
        for (let i = 0; i < 170; i++) {
            let v = this.appli.createElem(currentCardId, VpcElType.Btn, 0, undefined);
            v.set('showlabel', false);
            v.set('autohilite', false);
            v.set('style', UI512BtnStyle.Transparent);
            v.set('name', 'spacegame_sprites_n' + 0);
            v.set('script', '');
        }
        throw makeVpcInternalErr(msgNotification + 'First id: ' + firstidgot);
    }

    go_mnuDelCard() {
        let wasCurrentCardId = this.appli.getModel().productOpts.get_s('currentCardId');
        let wasCurrentCard = this.appli.getModel().getById(wasCurrentCardId, VpcElCard);
        this.appli.getModel().goCardRelative(OrdinalOrPosition.previous);
        if (this.appli.getModel().productOpts.get_s('currentCardId') === wasCurrentCardId) {
            this.appli.getModel().goCardRelative(OrdinalOrPosition.next);
        }

        this.appli.getOutside().RemoveCard(wasCurrentCard);
    }

    go_mnuPaintWideLines() {
        this.appli.setOption('optWideLines', !this.appli.getOption_b('optWideLines'));
    }

    go_mnuPaintBlackLines() {
        this.appli.setOption('optPaintLineColor', clrBlack);
    }

    go_mnuPaintWhiteLines() {
        this.appli.setOption('optPaintLineColor', clrWhite);
    }

    go_mnuPaintBlackFill() {
        this.appli.setOption('optPaintFillColor', clrBlack);
    }

    go_mnuPaintWhiteFill() {
        this.appli.setOption('optPaintFillColor', clrWhite);
    }

    go_mnuPaintNoFill() {
        this.appli.setOption('optPaintFillColor', -1);
    }

    go_mnuPaintDrawMult() {
        this.appli.setOption('optPaintDrawMult', !this.appli.getOption_b('optPaintDrawMult'));
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
        this.appli.setCurrentCardNum(OrdinalOrPosition.first);
    }

    go_mnuGoCardPrev() {
        this.appli.setCurrentCardNum(OrdinalOrPosition.previous);
    }

    go_mnuGoCardNext() {
        this.appli.setCurrentCardNum(OrdinalOrPosition.next);
    }

    go_mnuGoCardLast() {
        this.appli.setCurrentCardNum(OrdinalOrPosition.last);
    }

    go_mnuCardInfo() {
        let currentCardId = this.appli.getOption_s('currentCardId');
        this.appli.setTool(VpcTool.Button);
        this.appli.setOption('selectedVelId', currentCardId);
        this.appli.setOption('viewingScriptVelId', '');
    }

    go_mnuStackInfo() {
        let currentstackid = this.appli.getModel().stack.id;
        this.appli.setTool(VpcTool.Button);
        this.appli.setOption('selectedVelId', currentstackid);
        this.appli.setOption('viewingScriptVelId', '');
    }

    go_mnuDlgHelpScreenshots() {
        let dlg = new VpcAppNonModalDialogDocs(this.appli, DialogDocsType.Screenshots);
        this.appli.setNonModalDialog(dlg);
    }

    go_mnuDlgHelpReference() {
        let dlg = new VpcAppNonModalDialogDocs(this.appli, DialogDocsType.Reference);
        this.appli.setNonModalDialog(dlg);
    }

    runFontMenuActionsIfApplicable(s: string) {
        return this.fontChanger.runFontMenuActionsIfApplicable(s);
    }
}
