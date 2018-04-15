
/* auto */ import { O, makeVpcInternalErr, msgNotification, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { BrowserOSInfo, Util512, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { VpcElStackLineageEntry } from '../../vpc/vel/velStack.js';
/* auto */ import { VpcSession, vpcStacksFlagContent } from '../../vpc/request/vpcRequest.js';
/* auto */ import { VpcSaveUtilsInterface } from '../../vpcui/nonmodaldialogs/vpcNonModalCommon.js';
/* auto */ import { VpcAppNonModalDialogSendReport } from '../../vpcui/nonmodaldialogs/vpcSendErrReport.js';
/* auto */ import { VpcFormNonModalDialogLogIn } from '../../vpcui/nonmodaldialogs/vpcFormLogin.js';
/* auto */ import { VpcPresenterInterface } from '../../vpcui/presentation/vpcPresenterInterface.js';

declare var saveAs: any;

export class VpcSaveUtils implements VpcSaveUtilsInterface {
    busy = false;
    constructor(protected pr: VpcPresenterInterface) {}

    mnuGoSave_As(): void {
        let ses = VpcSession.fromRoot();
        if (ses) {
            this.busy = true;
            UI512BeginAsync(() => this.goSave_AsAsync(throwIfUndefined(ses, '')), undefined, false);
        } else {
            let form = new VpcFormNonModalDialogLogIn(this.pr.appli, true /* newUserOk*/);
            VpcAppNonModalDialogSendReport.standardWindowBounds(form, this.pr.appli);
            form.fnCbWhenSignedIn = () => {
                this.mnuGoSave_As();
            };
            this.pr.appli.setNonModalDialog(form);
        }
    }

    mnuGoSave(): void {
        let ses = VpcSession.fromRoot();
        if (ses) {
            this.busy = true;
            UI512BeginAsync(() => this.goSaveAsync(throwIfUndefined(ses, '')), undefined, false);
        } else {
            let form = new VpcFormNonModalDialogLogIn(this.pr.appli, true /* newUserOk*/);
            VpcAppNonModalDialogSendReport.standardWindowBounds(form, this.pr.appli);
            form.fnCbWhenSignedIn = () => {
                this.mnuGoSave();
            };
            this.pr.appli.setNonModalDialog(form);
        }
    }

    protected async goSave_AsAsync(ses: VpcSession) {
        try {
            await this.goSave_AsAsyncImpl(ses);
        } finally {
            this.busy = false;
        }
    }

    protected async goSaveAsync(ses: VpcSession) {
        try {
            await this.goSaveAsyncImpl(ses);
        } finally {
            this.busy = false;
        }
    }

    protected async goSave_AsAsyncImpl(ses: VpcSession) {
        let caught = false;
        let didsave = false;
        try {
            let newstackdata = this.pr.getSerializedStack();
            let lin = this.pr.appli.getModel().stack.getLatestStackLineage();
            didsave = !!await this.goSaveAsWithNewName(ses, lin.stackName, newstackdata);
        } catch (e) {
            caught = true;
            this.busy = false;
            this.pr.answerMsg(
                "Save did not complete. If you encounter repeated errors, you can use 'Save As Json' instead.\n" +
                    e.toString(),
                n => {}
            );
        }

        if (didsave) {
            this.pr.lyrCoverArea.setMyMessage('Save was successful.');
            window.setTimeout(() => {
                this.pr.placeCallbackInQueue(() => this.pr.lyrCoverArea.setMyMessage(''));
            }, 2000);
        }

        this.pr.cameFromDemoSoNeverPromptSave = '';
        this.busy = false;
    }

    protected async goSaveAsyncImpl(ses: VpcSession) {
        let caught = false;
        let didsave = false;
        try {
            let newstackdata = this.pr.getSerializedStack();
            let lin = this.pr.appli.getModel().stack.getLatestStackLineage();
            if (lin.stackOwner === ses.username) {
                didsave = !!await this.goSaveAlreadyExists(ses, lin.stackGuid, lin.stackName, newstackdata);
            } else {
                didsave = !!await this.goSaveAsWithNewName(ses, lin.stackName, newstackdata);
            }
        } catch (e) {
            caught = true;
            this.busy = false;
            await this.pr.answerMsgAsync(
                "Save did not complete. If you encounter repeated errors, you can use 'Save As Json' instead.\n" +
                    e.toString()
            );
        }

        if (didsave) {
            this.pr.lyrCoverArea.setMyMessage('Save was successful.');
            window.setTimeout(() => {
                this.pr.placeCallbackInQueue(() => this.pr.lyrCoverArea.setMyMessage(''));
            }, 2000);
        }

        this.pr.cameFromDemoSoNeverPromptSave = '';
        this.busy = false;
    }

    protected async goSaveAlreadyExists(ses: VpcSession, stackId: string, stackName: string, newstackdata: string) {
        await ses.vpcStacksSave(stackId, newstackdata);
        this.pr.appli.setOption('lastSavedStateId', this.pr.appli.getCurrentStateId());
        return true;
    }

    protected async goSaveAsWithNewName(ses: VpcSession, prevstackname: string, newstackdata: string) {
        let prevstacknameToShow = prevstackname || 'untitled';
        if (prevstacknameToShow === 'untitled') {
            prevstacknameToShow = 'Untitled ' + Util512.getRandIntInclusiveWeak(1, 100);
        }

        let [newname, n] = await this.pr.askMsgAsync('Save as:', prevstacknameToShow);
        if (newname && newname.trim().length) {
            newname = newname.trim();
            let lineageBeforeChanges = this.pr.appli.getModel().stack.getS('stacklineage');
            try {
                // add new part to stack lineage!
                let stack = this.pr.appli.getModel().stack;
                let newpartialid = VpcSession.generateStackPartialId();
                let en = new VpcElStackLineageEntry(ses.username, newpartialid, newname);
                stack.appendToStackLineage(en);
                newstackdata = this.pr.getSerializedStack(); // serialize it with the new lineage
                await ses.vpcStacksSaveAs(newpartialid, newname, newstackdata);
                this.pr.appli.setOption('lastSavedStateId', this.pr.appli.getCurrentStateId());
                return true;
            } catch (e) {
                // something went wrong - revert the changes!
                this.pr.appli.getModel().stack.set('stacklineage', lineageBeforeChanges);
                throw e;
            }
        }
    }

    mnuGoShareLink(): void {
        let gotlink = this.getShareLink();
        let br = getRoot().getBrowserInfo();
        let key = BrowserOSInfo.Mac ? 'Cmd' : 'Ctrl';
        this.pr.askMsg(lng(`lngPress ${key}+C to copy this link!`), gotlink, () => {});
    }

    mnuGoExportJson(): void {
        // *don't* use this.busy with this. need a way to recover if save() hangs for some reason.
        let eThrown: O<Error>;
        try {
            this.pr.lyrPropPanel.saveChangesToModel(false);
        } catch (e) {
            // shouldn't happen, but let the save continue.
            eThrown = e;
        }

        let defaultFilename = 'my stack.json';
        let blob = new Blob([this.pr.getSerializedStack()], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, defaultFilename);
        this.pr.appli.setOption('lastSavedStateId', this.pr.appli.getCurrentStateId());

        // count json saves
        let lin = this.pr.appli.getModel().stack.getLatestStackLineage();
        let ses = VpcSession.fromRoot();
        let currentusername = ses ? ses.username : '';
        UI512BeginAsync(() => this.goCountJsonSaves(currentusername, lin.stackOwner, lin.stackGuid), undefined, false);
        // no need to synchronously block on it
        if (eThrown) {
            throw eThrown;
        }
    }

    async goCountJsonSaves(currentusername: string, stackOwner: string, stackId: string) {
        try {
            await VpcSession.vpcStacksCountJsonSaves(stackOwner, stackId, currentusername);
        } catch (e) {
            console.error('could not count json saves ' + e.toString());
        }
    }

    mnuGoExportGif(): void {
        this.pr.askMsg('Animation speed (1-10, where 10 is fastest):', '5', (typed, btnPressed) => {
            let speed = parseFloat(typed === undefined ? '' : typed);
            speed = Number.isFinite(speed) ? speed : -1;
            this.pr.lyrPaintRender.paintExportToGif(this.pr, speed);
        });
    }

    mnuGoFlagContent(): void {
        UI512BeginAsync(() => this.mnuGoFlagContentAsync(), undefined, false);
    }

    async mnuGoFlagContentAsync() {
        let choice = await this.pr.answerMsgAsync(
            'We do not allow the hosting of malware, spam, phishing, obscene, libelous, defamatory, pornographic, or hateful content. Submit a report?',
            'Submit',
            'Cancel'
        );
        if (choice === 0) {
            let caught = false;
            try {
                let ses = VpcSession.fromRoot();
                let currentusername = ses ? ses.username : '';
                let lin = this.pr.appli.getModel().stack.getLatestStackLineage();
                if (
                    lin.stackOwner &&
                    lin.stackOwner.length &&
                    lin.stackOwner !== this.pr.appli.getModel().stack.lineageUsernameNull() &&
                    lin.stackOwner !== currentusername
                ) {
                    await vpcStacksFlagContent(lin.stackOwner, lin.stackGuid, currentusername);
                } else {
                    let e = new Error('');
                    e.toString = () => '';
                    throw e;
                }
            } catch (e) {
                caught = true;
                await this.pr.answerMsgAsync('Could not send a report. ' + e.toString());
            }

            if (!caught) {
                await this.pr.answerMsgAsync('Submitted a content report for this stack. Thank you.');
            }
        }
    }

    mnuGoExit(destination: string): void {
        this.pr.exit(destination);
    }

    protected getShareLink(): string {
        let loc = location.href.split('?')[0];
        // case 1) from a demo stack (perf optimization, 0 db hits)
        if (this.pr.cameFromDemoSoNeverPromptSave.length) {
            let url = loc + '?s=' + Util512.toBase64UrlSafe(this.pr.cameFromDemoSoNeverPromptSave);
            return url;
        } else {
            let lin = this.pr.appli.getModel().stack.getLatestStackLineage();
            // case 2) from a stack not saved online
            if (
                !lin.stackOwner ||
                !lin.stackOwner.length ||
                lin.stackOwner === this.pr.appli.getModel().stack.lineageUsernameNull()
            ) {
                throw makeVpcInternalErr(msgNotification + lng('lngFirst, go to File->Save to upload the stack.'));
            }

            let ses = VpcSession.fromRoot();
            let currentusername = ses ? ses.username : '';

            if (lin.stackOwner !== currentusername) {
                // case 3) from a stack we don't own -- don't check if changes need to be saved
                return VpcSession.getUrlForOpeningStack(loc, lin.stackOwner, lin.stackGuid, lin.stackName);
            } else {
                // case 4) from a stack we do own
                if (this.pr.isDocDirty()) {
                    throw makeVpcInternalErr(
                        msgNotification +
                            lng("lngIt looks like you have unsaved changes, we're reminding you to hit Save first.")
                    );
                }
                return VpcSession.getUrlForOpeningStack(loc, lin.stackOwner, lin.stackGuid, lin.stackName);
            }
        }
    }

    protected showLoginForm(newUserOk: boolean) {
        let form = new VpcFormNonModalDialogLogIn(this.pr.appli, newUserOk);
        VpcAppNonModalDialogSendReport.standardWindowBounds(form, this.pr.appli);
        this.pr.appli.setNonModalDialog(form);
    }
}
