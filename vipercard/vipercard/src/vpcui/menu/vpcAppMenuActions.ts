
/* auto */ import { RememberHistory } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { getVpcSessionTools } from './../../vpc/request/vpcRequest';
/* auto */ import { VpcNonModalReplBox } from './../nonmodaldialogs/vpcReplMessageBox';
/* auto */ import { VpcNonModalFormBase } from './../nonmodaldialogs/vpcLyrNonModalHolder';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { VpcNonModalFormSendReport } from './../nonmodaldialogs/vpcFormSendReport';
/* auto */ import { VpcNonModalFormLogin } from './../nonmodaldialogs/vpcFormLogin';
/* auto */ import { PropAdjective, VpcTool, checkThrowNotifyMsg } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { DialogDocsType, VpcNonModalDocViewer } from './../nonmodaldialogs/vpcDocViewer';
/* auto */ import { VpcAboutDialog } from './vpcAboutDialog';
/* auto */ import { VelRenderId } from './../../vpc/vel/velRenderName';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { BrowserInfo, BrowserOSInfo, getRoot } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, longstr } from './../../ui512/utils/util512';
/* auto */ import { UI512CompModalDialog } from './../../ui512/composites/ui512ModalDialog';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * respond to menu actions
 */
export class VpcMenuActions {
    save: VpcSaveInterface;
    msgBoxHistory = new RememberHistory();
    cbFindEditToolSelectedFldOrBtn: () => O<VpcElBase>;
    cbOnClearNonBrowseTool: () => void;
    constructor(protected vci: VpcStateInterface) {
    }

    /**
     * let's implement a lot of our menu commands in vipercard itself!
     * 1) don't need two implementations
     * 2) exposes more actions to scripts, i.e. doMenu
     * note: if you're not in the browse tool, we don't really want
     * a lot of code to run, so we use silenceMessagesForUIAction
     */
    runMenuActionCode(s: string) {
        this.vci.getCodeExec().silenceMessagesForUIAction.val = this.vci.getTool()
        this.vci.setTool(VpcTool.Browse)
        this.vci.getCodeExec().runMsgBoxCodeOrThrow(s, this.vci.getCurrentCardId(), false /* add return */);
    }

    /**
     * show about dialog
     */
    goMnuOSAbout() {
        let pr = this.vci.getPresenter();
        let dlg = new UI512CompModalDialog('OSAboutDlg');
        VpcAboutDialog.show(pr, dlg);
    }

    /**
     * show donate dialog
     */
    goMnuOSDonate() {
        let pr = this.vci.getPresenter();
        let dlg = new UI512CompModalDialog('OSAboutDlg');
        VpcAboutDialog.showDonateDlg(pr, dlg);
    }

    /**
     * show report error window
     */
    goMnuReportErr() {
        this.exitIfServerCodeInactive();
        if (getRoot().getSession()) {
            let dlg = new VpcNonModalFormSendReport(this.vci);
            this.vci.setNonModalDialog(dlg);
        } else {
            let form = new VpcNonModalFormLogin(this.vci, true /* newUserOk*/);
            VpcNonModalFormBase.standardWindowBounds(form, this.vci);
            form.fnCbWhenSignedIn = () => {
                this.goMnuReportErr();
            };

            this.vci.setNonModalDialog(form);
        }
    }

    /**
     * show "security info" dialog
     */
    goMnuReportSec() {
        this.showModal(
            longstr(`lngSecurity issues are taken seriously. If you are aware
                of an issue that has security{{NEWLINE}}implications, please
                contact the developers{{NEWLINE}}at security@vipercard.net.`)
        );
    }

    /**
     * show message box (repl)
     */
    goMnuMsgBox() {
        let dlg = new VpcNonModalReplBox(this.vci, this.msgBoxHistory);
        this.vci.setNonModalDialog(dlg);
    }

    /**
     * begin async save
     */
    goMnuSave() {
        if (!getVpcSessionTools().enableServerCode) {
            this.goMnuExportStack();
        } else {
            this.exitIfServerCodeInactive();
            if (this.save.busy) {
                console.log("Cannot start a new task until we've finished the other task.");
            } else {
                this.save.beginSave();
            }
        }
    }

    /**
     * begin save as
     */
    goMnuSaveAs() {
        this.exitIfServerCodeInactive();
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginSaveAs();
        }
    }

    /**
     * begin open (exits everything and goes back to start screen)
     */
    goMnuOpen() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginGoExit('mnuOpen');
        }
    }

    /**
     * share a link
     */
    goMnuShareALink() {
        this.exitIfServerCodeInactive();
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginShareLink();
        }
    }

    /**
     * create new stack
     */
    goMnuNewStack() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginGoExit('mnuNewStack');
        }
    }

    /**
     * export stack to json
     */
    goMnuExportStack() {
        /* *don't* use this.busy with this. need a way to
        recover if save() hangs for some reason. */
        this.save.beginExportJson();
    }

    /**
     * export to gif
     */
    goMnuExportGif() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginExportGif();
        }
    }

    /**
     * quit (to main screen)
     */
    goMnuQuit() {
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginGoExit('mnuQuit');
        }
    }

    /**
     * flag stack inappropriate content
     */
    goMnuFlagStack() {
        this.exitIfServerCodeInactive();
        if (this.save.busy) {
            console.log("Cannot start a new task until we've finished the other task.");
        } else {
            this.save.beginFlagContent();
        }
    }

    /**
     * use internal-only clipboard in case connection with os-clipboard isn't working
     */
    goMnuUseHostClipboard() {
        this.vci.setOption('optUseHostClipboard', !this.vci.getOptionB('optUseHostClipboard'));
        this.vci.getPresenter().useOSClipboard = this.vci.getOptionB('optUseHostClipboard');
    }

    /**
     * create new card
     */
    goMnuNewCard() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "New Card"')
    }

    /**
     * duplicate current card
     */
    goMnuDupeCardPaint() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "Duplicate Card Paint"')
    }

    /**
     * show publish stack info
     */
    goMnuPublishFeatured() {
        this.exitIfServerCodeInactive();
        this.showModal(
            longstr(`lngYour project could be featured on ViperCard's
                front page! Save the project, choose 'Share a link' from
                the File menu, and send the link to @ViperCardDotNet on Twitter.`)
        );
    }

    /**
     * copy card or element
     */
    goMnuCopyCardOrVel() {
        let selected = this.cbFindEditToolSelectedFldOrBtn();
        if (selected) {
            this.vci.setOption('copiedVelId', selected.idInternal);
        } else {
            this.showModal('lngThis feature has not yet been developed.');
        }
    }

    /**
     * paste card or element
     */
    goMnuPasteCardOrVel() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "Paste Card Or Vel"')
    }

    /**
     * show about dialog
     * (another method, each menuitem must have an id that is unique)
     */
    goMnuOSAbout2() {
        this.goMnuOSAbout();
    }

    /**
     * delete current card
     * note that we have to move away from this card first before deleting it
     */
    goMnuDelCard() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "Delete Card"')
    }

    /**
     * toggle wide lines option
     */
    goMnuPaintWideLines() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "Wide Lines"')
    }

    /**
     * set black lines option
     */
    goMnuPaintBlackLines() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "Black Lines"')
    }

    /**
     * set white lines option
     */
    goMnuPaintWhiteLines() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "White Lines"')
    }

    /**
     * set black fill option
     */
    goMnuPaintBlackFill() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "Black Fill"')
    }

    /**
     * set white fill option
     */
    goMnuPaintWhiteFill() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "White Fill"')
    }

    /**
     * set no fill option
     */
    goMnuPaintNoFill() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "No Fill"')
    }

    /**
     * set paint-multiple
     */
    goMnuPaintDrawMult() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "Draw Multiple"')
    }

    /**
     * show info about painting many copies
     */
    goMnuPaintManyCopies() {
        let keyname = BrowserInfo.get().os === BrowserOSInfo.Mac ? 'Option' : 'Alt';
        this.showModal(
            longstr(`lngTo make many of copies of a shape, first use the
                'lasso' or 'select' tool to select the region. Then, hold
                the ${keyname} key, click within the region, and drag.`)
        );
    }

    /**
     * cut, has to be done from keyboard
     */
    goMnuCut() {
        let keyname = BrowserInfo.get().os === BrowserOSInfo.Mac ? 'Cmd' : 'Ctrl';
        this.showModal(`lngPlease use the keyboard shortcut ${keyname}+X to \ncut text.`);
    }

    /**
     * copy, has to be done from keyboard
     */
    goMnuCopy() {
        let keyname = BrowserInfo.get().os === BrowserOSInfo.Mac ? 'Cmd' : 'Ctrl';
        this.showModal(`lngPlease use the keyboard shortcut ${keyname}+C to \ncopy text.`);
    }

    /**
     * paste, has to be done from keyboard
     */
    goMnuPaste() {
        let keyname = BrowserInfo.get().os === BrowserOSInfo.Mac ? 'Cmd' : 'Ctrl';
        this.showModal(`lngPlease use the keyboard shortcut ${keyname}+V to \npaste text.`);
    }

    /**
     * go to first card
     */
    goMnuGoCardFirst() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "First"')
    }

    /**
     * go to last card
     */
    goMnuGoCardLast() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "Last"')
    }

    /**
     * left arrow, usually go left but user can override
     */
    mnuOnArrowLeft() {
        this.runMenuActionCode('arrowkey "left"')
    }

    /**
     * right arrow, usually go right but user can override
     */
    mnuOnArrowRight() {
        this.runMenuActionCode('arrowkey "right"')
    }

    /**
     * up arrow, usually no-op but user can override
     */
    mnuOnArrowUp() {
        this.runMenuActionCode('arrowkey "up"')
    }

    /**
     * down arrow, usually no-op but user can override
     */
    mnuOnArrowDown() {
        this.runMenuActionCode('arrowkey "down"')
    }

    /**
     * go to previous card
     */
    goMnuGoCardPrev() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "Prev", "FromUI"')
    }

    /**
     * go to the next card
     */
    goMnuGoCardNext() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "Next", "FromUI"')
    }

    /**
     * select and edit the card
     */
    goMnuCardInfo() {
        let currentCardId = this.vci.getOptionS('currentCardId');
        this.vci.setTool(VpcTool.Button);
        this.vci.setOption('selectedVelId', currentCardId);
        this.vci.setOption('viewingScriptVelId', '');
    }

    /**
     * select and edit the stack
     */
    goMnuStackInfo() {
        let currentstackid = this.vci.getModel().stack.idInternal;
        this.vci.setTool(VpcTool.Button);
        this.vci.setOption('selectedVelId', currentstackid);
        this.vci.setOption('viewingScriptVelId', '');
    }

    /**
     * new button
     */
    goMnuObjectsNewBtn() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "New Button from ui"')
    }

    /**
     * new field
     */
    goMnuObjectsNewFld() {
        this.runMenuActionCode('vpcinternaluntrappabledomenu "New Field from ui"')
    }

    /**
     * clear (either selected text or a tool-specific action)
     */
    goMnuClear() {
        if (this.vci.getTool() === VpcTool.Browse) {
            this.runMenuActionCode('vpcinternaluntrappabledomenu "Clear"')
        } else {
            this.cbOnClearNonBrowseTool()
        }
    }

    /**
     * show help examples
     */
    goMnuDlgHelpExamples() {
        let dlg = new VpcNonModalDocViewer(this.vci, DialogDocsType.Examples);
        this.vci.setNonModalDialog(dlg);
    }

    /**
     * show complete script reference
     */
    goMnuDlgHelpReference() {
        let showVids = () => this.goMnuDlgHelpExamples()
        let dlg = new VpcNonModalDocViewer(this.vci, DialogDocsType.Reference);
        dlg.cbShowVids = showVids
        this.vci.setNonModalDialog(dlg);
    }

    /**
     * user has chosen something without its own method
     */
    fallbackToSetToolOrSetFont(s: string) {
        if (s.startsWith('mnuItemTool')) {
            /* these can't go through doMenu, scripts can't set the current tool */
            let toolNumber = Util512.parseInt(s.substr('mnuItemTool'.length));
            toolNumber = toolNumber ?? VpcTool.Browse;
            this.vci.setTool(toolNumber);
        } else if (s.startsWith('mnuItemFont')) {
            let cmd = s.substr("mnuItemFont".length)
            if (this.vci.getTool() === VpcTool.Browse) {
                this.runMenuActionCode(`doMenu "${cmd}"`)
            } else {
                let vel = this.cbFindEditToolSelectedFldOrBtn();
                let renderVel = vel ? new VelRenderId(this.vci.getModel()).go(vel, PropAdjective.LongForParse, this.vci.getModel().stack.getB('compatibilitymode')) : ''
                this.runMenuActionCode(`doMenu "${cmd}", "setAll|${renderVel}" `)
            }
        } else {
            console.error("Unknown menu item", s)
        }
    }

    /**
     * sometimes we disable saving to the server. you
     * can still save to json though.
     */
    protected exitIfServerCodeInactive() {
        checkThrowNotifyMsg(
            getVpcSessionTools().enableServerCode,
            'U2|Server code currently not enabled. You can still save as a .json file, though.'
        );
    }

    /**
     * show a modal dialog,
     * not an error at all but we just use this to enforce that
     * there's no other code run after showing the dialog
     * (code running after showing the dialog would be in a weird state)
     */
    protected showModal(untranslated: string) {
        checkThrowNotifyMsg(false, lng(untranslated));
    }
}

/**
 * asynchronous save methods
 */
export interface VpcSaveInterface {
    busy: boolean;
    beginSave(): void;
    beginSaveAs(): void;
    beginShareLink(): void;
    beginExportJson(): void;
    beginExportGif(): void;
    beginFlagContent(): void;
    beginGoExit(destination: string): void;
}
