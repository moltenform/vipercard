
/* auto */ import { O, makeVpcInternalErr, msgNotification, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { BrowserOSInfo, Util512, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { VpcSession, vpcStacksFlagContent } from '../../vpc/request/vpcRequest.js';
/* auto */ import { VpcSaveUtilsInterface } from '../../vpcui/nonmodaldialogs/vpcNonModalCommon.js';
/* auto */ import { VpcAppNonModalDialogSendReport } from '../../vpcui/nonmodaldialogs/vpcSendErrReport.js';
/* auto */ import { VpcFormNonModalDialogLogIn } from '../../vpcui/nonmodaldialogs/vpcFormLogin.js';
/* auto */ import { VpcPresenterInterface } from '../../vpcui/presentation/vpcPresenterInterface.js';

declare var saveAs: any;

export class VpcSaveUtils implements VpcSaveUtilsInterface {
    busy = false;
    constructor(protected c: VpcPresenterInterface) {}

    mnuGoSave_As(): void {
        let ses = VpcSession.fromRoot();
        if (ses) {
            this.busy = true;
            UI512BeginAsync(() => this.goSave_AsAsync(throwIfUndefined(ses, "")), undefined, false);
        } else {
            let form = new VpcFormNonModalDialogLogIn(this.c.appli, true /* newUserOk*/);
            VpcAppNonModalDialogSendReport.standardWindowBounds(form, this.c.appli);
            form.fnCbWhenSignedIn = () => {
                this.mnuGoSave_As();
            };
            this.c.appli.setNonModalDialog(form);
        }
    }

    mnuGoSave(): void {
        let ses = VpcSession.fromRoot();
        if (ses) {
            this.busy = true;
            UI512BeginAsync(() => this.goSaveAsync(throwIfUndefined(ses, "")), undefined, false);
        } else {
            let form = new VpcFormNonModalDialogLogIn(this.c.appli, true /* newUserOk*/);
            VpcAppNonModalDialogSendReport.standardWindowBounds(form, this.c.appli);
            form.fnCbWhenSignedIn = () => {
                this.mnuGoSave();
            };
            this.c.appli.setNonModalDialog(form);
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
            let newstackdata = this.c.getSerializedStack();
            let [stackowner, stackid, stackname] = this.c.appli.getModel().stack.getLatestStackLineage();
            didsave = !!await this.goSaveAsWithNewName(ses, stackname, newstackdata);
        } catch (e) {
            caught = true;
            this.busy = false;
            this.c.answerMsg(
                "Save did not complete. If you encounter repeated errors, you can use 'Save As Json' instead.\n" +
                    e.toString(),
                n => {}
            );
        }

        if (didsave) {
            this.c.lyrCoverArea.setMyMessage('Save was successful.');
            window.setTimeout(() => {
                this.c.placeCallbackInQueue(() => this.c.lyrCoverArea.setMyMessage(''));
            }, 2000);
        }

        this.c.cameFromDemoSoNeverPromptSave = '';
        this.busy = false;
    }

    protected async goSaveAsyncImpl(ses: VpcSession) {
        let caught = false;
        let didsave = false;
        try {
            let newstackdata = this.c.getSerializedStack();
            let [stackowner, stackid, stackname] = this.c.appli.getModel().stack.getLatestStackLineage();
            if (stackowner === ses.username) {
                didsave = !!await this.goSaveAlreadyExists(ses, stackid, stackname, newstackdata);
            } else {
                didsave = !!await this.goSaveAsWithNewName(ses, stackname, newstackdata);
            }
        } catch (e) {
            caught = true;
            this.busy = false;
            await this.c.answerMsgAsync(
                "Save did not complete. If you encounter repeated errors, you can use 'Save As Json' instead.\n" +
                    e.toString()
            );
        }

        if (didsave) {
            this.c.lyrCoverArea.setMyMessage('Save was successful.');
            window.setTimeout(() => {
                this.c.placeCallbackInQueue(() => this.c.lyrCoverArea.setMyMessage(''));
            }, 2000);
        }

        this.c.cameFromDemoSoNeverPromptSave = '';
        this.busy = false;
    }

    protected async goSaveAlreadyExists(ses: VpcSession, stackid: string, stackname: string, newstackdata: string) {
        await ses.vpcStacksSave(stackid, newstackdata);
        this.c.appli.setOption('lastSavedStateId', this.c.appli.getCurrentStateId());
        return true;
    }

    protected async goSaveAsWithNewName(ses: VpcSession, prevstackname: string, newstackdata: string) {
        let prevstacknameToShow = prevstackname || 'untitled';
        if (prevstacknameToShow === 'untitled') {
            prevstacknameToShow = 'Untitled ' + Util512.getRandIntInclusiveWeak(1, 100);
        }

        let [newname, n] = await this.c.askMsgAsync('Save as:', prevstacknameToShow);
        if (newname && newname.trim().length) {
            newname = newname.trim();
            let lineageBeforeChanges = this.c.appli.getModel().stack.get_s('stacklineage');
            try {
                // add new part to stack lineage!
                let stack = this.c.appli.getModel().stack;
                let newpartialid = VpcSession.generateStackPartialId();
                stack.appendToStackLineage([ses.username, newpartialid, newname]);
                newstackdata = this.c.getSerializedStack(); // serialize it with the new lineage
                await ses.vpcStacksSaveAs(newpartialid, newname, newstackdata);
                this.c.appli.setOption('lastSavedStateId', this.c.appli.getCurrentStateId());
                return true;
            } catch (e) {
                // something went wrong - revert the changes!
                this.c.appli.getModel().stack.set('stacklineage', lineageBeforeChanges);
                throw e;
            }
        }
    }

    mnuGoShareLink(): void {
        let gotlink = this.getShareLink();
        let br = getRoot().getBrowserInfo();
        let key = BrowserOSInfo.Mac ? 'Cmd' : 'Ctrl';
        this.c.askMsg(lng(`lngPress ${key}+C to copy this link!`), gotlink, () => {});
    }

    mnuGoExportJson(): void {
        // *don't* use this.busy with this. need a way to recover if save() hangs for some reason.
        let eThrown: O<Error>;
        try {
            this.c.lyrPropPanel.saveChangesToModel(false);
        } catch (e) {
            // shouldn't happen, but let the save continue.
            eThrown = e;
        }

        let defaultFilename = 'my stack.json';
        let blob = new Blob([this.c.getSerializedStack()], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, defaultFilename);
        this.c.appli.setOption('lastSavedStateId', this.c.appli.getCurrentStateId());

        // count json saves
        let [stackowner, stackid, stackname] = this.c.appli.getModel().stack.getLatestStackLineage();
        let ses = VpcSession.fromRoot();
        let currentusername = ses ? ses.username : '';
        UI512BeginAsync(() => this.goCountJsonSaves(currentusername, stackowner, stackid), undefined, false);
        // no need to synchronously block on it
        if (eThrown) {
            throw eThrown;
        }
    }

    async goCountJsonSaves(currentusername: string, stackowner: string, stackid: string) {
        try {
            await VpcSession.vpcStacksCountJsonSaves(stackowner, stackid, currentusername);
        } catch (e) {
            console.error('could not count json saves ' + e.toString());
        }
    }

    mnuGoExportGif(): void {
        this.c.askMsg('Animation speed (1-10, where 10 is fastest):', '5', (typed, btnPressed) => {
            let speed = parseFloat(typed === undefined ? '' : typed);
            speed = Number.isFinite(speed) ? speed : -1;
            this.c.lyrPaintRender.paintExportToGif(this.c, speed);
        });
    }

    mnuGoFlagContent(): void {
        UI512BeginAsync(() => this.mnuGoFlagContentAsync(), undefined, false);
    }

    async mnuGoFlagContentAsync() {
        let choice = await this.c.answerMsgAsync(
            'We do not allow the hosting of malware, spam, phishing, obscene, libelous, defamatory, pornographic, or hateful content. Submit a report?',
            'Submit',
            'Cancel'
        );
        if (choice === 0) {
            let caught = false;
            try {
                let ses = VpcSession.fromRoot();
                let currentusername = ses ? ses.username : '';
                let [stackowner, stackid, stackname] = this.c.appli.getModel().stack.getLatestStackLineage();
                if (
                    stackowner &&
                    stackowner.length &&
                    stackowner !== this.c.appli.getModel().stack.lineageUsernameNull() &&
                    stackowner !== currentusername
                ) {
                    await vpcStacksFlagContent(stackowner, stackid, currentusername);
                } else {
                    let e = new Error('');
                    e.toString = () => '';
                    throw e;
                }
            } catch (e) {
                caught = true;
                await this.c.answerMsgAsync('Could not send a report. ' + e.toString());
            }

            if (!caught) {
                await this.c.answerMsgAsync('Submitted a content report for this stack. Thank you.');
            }
        }
    }

    mnuGoExit(destination: string): void {
        this.c.exit(destination);
    }

    protected getShareLink(): string {
        let loc = location.href.split('?')[0];
        // case 1) from a demo stack (perf optimization, 0 db hits)
        if (this.c.cameFromDemoSoNeverPromptSave.length) {
            let url = loc + '?s=' + Util512.toBase64UrlSafe(this.c.cameFromDemoSoNeverPromptSave);
            return url;
        } else {
            let [stackowner, stackid, stackname] = this.c.appli.getModel().stack.getLatestStackLineage();
            // case 2) from a stack not saved online
            if (
                !stackowner ||
                !stackowner.length ||
                stackowner === this.c.appli.getModel().stack.lineageUsernameNull()
            ) {
                throw makeVpcInternalErr(
                    msgNotification + lng('lngFirst, go to File->Save to upload the stack.')
                );
            }

            let ses = VpcSession.fromRoot();
            let currentusername = ses ? ses.username : '';

            if (stackowner !== currentusername) {
                // case 3) from a stack we don't own -- don't check if changes need to be saved
                return VpcSession.getUrlForOpeningStack(loc, stackowner, stackid, stackname);
            } else {
                // case 4) from a stack we do own
                if (this.c.isDocDirty()) {
                    throw makeVpcInternalErr(
                        msgNotification +
                            lng(
                                "lngIt looks like you have unsaved changes, we're reminding you to hit Save first."
                            )
                    );
                }
                return VpcSession.getUrlForOpeningStack(loc, stackowner, stackid, stackname);
            }
        }
    }

    protected showLoginForm(newUserOk: boolean) {
        let form = new VpcFormNonModalDialogLogIn(this.c.appli, newUserOk);
        VpcAppNonModalDialogSendReport.standardWindowBounds(form, this.c.appli);
        this.c.appli.setNonModalDialog(form);
    }
}
