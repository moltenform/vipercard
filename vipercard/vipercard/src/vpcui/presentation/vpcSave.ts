
/* auto */ import { VpcSession, vpcStacksFlagContent } from './../../vpc/request/vpcRequest';
/* auto */ import { VpcPresenterInterface } from './vpcPresenterInterface';
/* auto */ import { VpcNonModalFormSendReport } from './../nonmodaldialogs/vpcFormSendReport';
/* auto */ import { VpcNonModalFormLogin } from './../nonmodaldialogs/vpcFormLogin';
/* auto */ import { VpcSaveInterface } from './../menu/vpcAppMenuActions';
/* auto */ import { VpcElStackLineageEntry } from './../../vpc/vel/velStack';
/* auto */ import { msgNotification } from './../../ui512/utils/util512Productname';
/* auto */ import { Util512Higher, getRoot } from './../../ui512/utils/util512Higher';
/* auto */ import { O, bool, makeVpcInternalErr, throwIfUndefined } from './../../ui512/utils/util512Assert';
/* auto */ import { BrowserOSInfo, Util512, coalesceIfFalseLike, longstr } from './../../ui512/utils/util512';
/* auto */ import { lng } from './../../ui512/lang/langBase';
/* auto */ import { bridgedSaveAs } from './../../bridge/bridgeFileSaver';

/**
 * saving stacks
 * we limit to one async operation running at a time, so that the UI isn't confusing.
 * overlapping saves would be OK functionally but confusing to the user.
 */
export class VpcSave implements VpcSaveInterface {
    busy = false;
    constructor(protected pr: VpcPresenterInterface) {}

    /**
     * save to server with a new name
     */
    beginSaveAs() {
        let ses = VpcSession.fromRoot();
        if (ses) {
            this.busy = true;

            Util512Higher.syncToAsyncTransition(() => this.goSaveAsAsync(throwIfUndefined(ses, 'Kr|')), 'goSaveAsAsync');
        } else {
            /* not logged in yet, show log in form */
            let form = new VpcNonModalFormLogin(this.pr.vci, true /* newUserOk*/);
            VpcNonModalFormSendReport.standardWindowBounds(form, this.pr.vci);
            form.fnCbWhenSignedIn = () => {
                this.beginSaveAs();
            };

            this.pr.vci.setNonModalDialog(form);
        }
    }

    /**
     * save to server
     */
    beginSave() {
        let ses = VpcSession.fromRoot();
        if (ses) {
            this.busy = true;
            Util512Higher.syncToAsyncTransition(() => this.goSaveAsync(throwIfUndefined(ses, 'Kq|')), 'beginSave async');
        } else {
            /* not logged in yet, show log in form */
            let form = new VpcNonModalFormLogin(this.pr.vci, true /* newUserOk*/);
            VpcNonModalFormSendReport.standardWindowBounds(form, this.pr.vci);
            form.fnCbWhenSignedIn = () => {
                this.beginSave();
            };

            this.pr.vci.setNonModalDialog(form);
        }
    }

    /**
     * save as, show dialog upon failure
     */
    protected async goSaveAsAsyncImpl(ses: VpcSession) {
        let caught = false;
        let didSave = false;
        try {
            let newStackData = this.pr.getSerializedStack();
            let info = this.pr.vci.getModel().stack.getLatestStackLineage();
            didSave = bool(await this.goSaveAsWithNewName(ses, info.stackName, newStackData));
        } catch (e) {
            caught = true;
            this.busy = false;
            this.pr.answerMsg(
                longstr(`Save did not complete. If you encounter repeated
                 errors, you can use 'Save As Json' instead.\n${e}`),
                n => {}
            );
        }

        if (didSave) {
            this.pr.lyrCoverArea.setMyMessage('Save was successful.');
            Util512Higher.syncToAsyncTransition(async () => {
                await Util512Higher.sleep(2000);
                this.pr.placeCallbackInQueue(() => this.pr.lyrCoverArea.setMyMessage(''));
            }, 'hide succesful save msg');
        }

        this.pr.cameFromDemoSoNeverPromptSave = '';
        this.busy = false;
    }

    /**
     * save, show dialog upon failure
     */
    protected async goSaveAsyncImpl(ses: VpcSession) {
        let caught = false;
        let didSave = false;
        try {
            let newStackData = this.pr.getSerializedStack();
            let info = this.pr.vci.getModel().stack.getLatestStackLineage();
            if (info.stackOwner === ses.username) {
                didSave = bool(await this.goSaveQuietUpdate(ses, info.stackGuid, info.stackName, newStackData));
            } else {
                didSave = bool(await this.goSaveAsWithNewName(ses, info.stackName, newStackData));
            }
        } catch (e) {
            caught = true;
            this.busy = false;
            await this.pr.answerMsgAsync(
                longstr(`Save did not complete. If you encounter repeated
                    errors, you can use 'Save As Json' instead.\n${e}`)
            );
        }

        if (didSave) {
            this.pr.lyrCoverArea.setMyMessage('Save was successful.');
            Util512Higher.syncToAsyncTransition(async () => {
                await Util512Higher.sleep(2000);
                this.pr.placeCallbackInQueue(() => this.pr.lyrCoverArea.setMyMessage(''));
            }, 'hide succesful save msg');
        }

        this.pr.cameFromDemoSoNeverPromptSave = '';
        this.busy = false;
    }

    /**
     * stack was already saved, so we can quietly send our updated version
     */
    protected async goSaveQuietUpdate(ses: VpcSession, stackId: string, stackName: string, newStackData: string) {
        await ses.vpcStacksSave(stackId, newStackData);
        this.pr.vci.setOption('lastSavedStateId', this.pr.vci.getCurrentStateId());
        return true;
    }

    /**
     * ensures 'busy' flag reset
     */
    protected async goSaveAsAsync(ses: VpcSession) {
        try {
            await this.goSaveAsAsyncImpl(ses);
        } finally {
            this.busy = false;
        }
    }

    /**
     * ensures 'busy' flag reset
     */
    protected async goSaveAsync(ses: VpcSession) {
        try {
            await this.goSaveAsyncImpl(ses);
        } finally {
            this.busy = false;
        }
    }

    /**
     * ask the user to choose a new name
     */
    protected async goSaveAsWithNewName(ses: VpcSession, prevStackName: string, newStackData: string) {
        let prevStackNameToShow = coalesceIfFalseLike(prevStackName, 'untitled');
        if (prevStackNameToShow === 'untitled') {
            prevStackNameToShow = 'Untitled ' + Util512Higher.getRandIntInclusiveWeak(1, 100);
        }

        let [newName, n] = await this.pr.askMsgAsync('Save as:', prevStackNameToShow);
        if (newName && newName.trim().length) {
            newName = newName.trim();
            let lineageBeforeChanges = this.pr.vci.getModel().stack.getS('stacklineage');
            try {
                /* add new part to stack lineage! */
                let stack = this.pr.vci.getModel().stack;
                let newPartialId = VpcSession.generateStackPartialId();
                let en = new VpcElStackLineageEntry(ses.username, newPartialId, newName);
                stack.appendToStackLineage(en);

                /* a serialized stack -- with the new lineage */
                newStackData = this.pr.getSerializedStack();
                await ses.vpcStacksSaveAs(newPartialId, newName, newStackData);
                this.pr.vci.setOption('lastSavedStateId', this.pr.vci.getCurrentStateId());
                return true;
            } catch (e) {
                /* something went wrong - revert the changes! */
                this.pr.vci.getModel().stack.set('stacklineage', lineageBeforeChanges);
                throw e;
            }
        }

        return false;
    }

    /**
     * show a dialog where user can copy link
     * might be able to set clipboard, but this is simpler to implement
     */
    beginShareLink() {
        let gotLink = this.getShareLink();
        let br = getRoot().getBrowserInfo();
        let key = BrowserOSInfo.Mac ? 'Cmd' : 'Ctrl';
        this.pr.askMsg(lng(`lngPress ${key}+C to copy this link!`), gotLink, () => {});
    }

    /**
     * export stack to json
     */
    beginExportJson() {
        /* *don't* use this.busy with this.
        this isn't async so it isn't really needed,
        but more importantly we don't want a malfunctioning server save
        to stop us from saving as json, which is our fallback if server fails. */
        let eThrown: O<Error>;
        try {
            this.pr.lyrPropPanel.saveChangesToModel(false);
        } catch (e) {
            /* shouldn't happen, but let the save continue. */
            eThrown = e;
        }

        let defaultFilename = 'my stack.json';
        let blob = new Blob([this.pr.getSerializedStack()], {
            type: 'text/plain;charset=utf-8'
        });
        bridgedSaveAs(blob, defaultFilename);
        this.pr.vci.setOption('lastSavedStateId', this.pr.vci.getCurrentStateId());

        /* count json saves */
        let info = this.pr.vci.getModel().stack.getLatestStackLineage();
        let ses = VpcSession.fromRoot();
        let currentUsername = ses ? ses.username : '';

        Util512Higher.syncToAsyncTransition(
            () => this.goCountJsonSaves(currentUsername, info.stackOwner, info.stackGuid),
            'count json saves'
        );

        /* now rethrow if we got an error */
        if (eThrown) {
            throw eThrown;
        }
    }

    /**
     * telemetry on how often people save stacks
     */
    async goCountJsonSaves(currentUsername: string, stackOwner: string, stackId: string) {
        try {
            await VpcSession.vpcStacksCountJsonSaves(stackOwner, stackId, currentUsername);
        } catch (e) {
            console.error('could not count json saves ' + e.toString());
        }
    }

    /**
     * export to gif
     */
    beginExportGif() {
        this.pr.askMsg('Animation speed (1-10, where 10 is fastest):', '4', (typed, btnPressed) => {
            if (btnPressed === 0) {
                let speed = parseFloat(typed === undefined ? '' : typed);
                speed = Number.isFinite(speed) ? speed : -1;
                this.pr.lyrPaintRender.paintExportToGif(this.pr, speed);
            }
        });
    }

    /**
     * send mark to server to flag content
     */
    beginFlagContent() {
        Util512Higher.syncToAsyncTransition(() => this.mnuGoFlagContentAsync(), 'beginFlagContent');
    }

    /**
     * ask for confirmation and send content flag
     */
    async mnuGoFlagContentAsync() {
        let choice = await this.pr.answerMsgAsync(
            longstr(`We do not allow the hosting of malware, spam,
             phishing, obscene, libelous, defamatory, pornographic,
             or hateful content. Submit a report?`),
            'Submit',
            'Cancel'
        );

        if (choice === 0) {
            let caught = false;
            try {
                let ses = VpcSession.fromRoot();
                let currentUsername = ses ? ses.username : '';
                let info = this.pr.vci.getModel().stack.getLatestStackLineage();
                if (
                    info.stackOwner &&
                    info.stackOwner.length &&
                    info.stackOwner !== this.pr.vci.getModel().stack.lineageUsernameNull() &&
                    info.stackOwner !== currentUsername
                ) {
                    await vpcStacksFlagContent(info.stackOwner, info.stackGuid, currentUsername);
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

    /**
     * exit the stack
     */
    beginGoExit(destination: string) {
        this.pr.exit(destination);
    }

    /**
     * get url for this stack
     */
    protected getShareLink(): string {
        let loc = location.href.split('?')[0];
        /* case 1) from a demo stack (perf optimization, 0 db hits) */
        if (this.pr.cameFromDemoSoNeverPromptSave.length) {
            let url = loc + '?s=' + Util512.toBase64UrlSafe(this.pr.cameFromDemoSoNeverPromptSave);
            return url;
        } else {
            let info = this.pr.vci.getModel().stack.getLatestStackLineage();
            /* case 2) from a stack not saved online */
            if (
                !info.stackOwner ||
                !info.stackOwner.length ||
                info.stackOwner === this.pr.vci.getModel().stack.lineageUsernameNull()
            ) {
                throw makeVpcInternalErr(msgNotification + lng('lngFirst, go to File->Save to upload the stack.'));
            }

            let ses = VpcSession.fromRoot();
            let currentUsername = ses ? ses.username : '';

            if (info.stackOwner !== currentUsername) {
                /* case 3) from a stack we don't own -- don't check if changes need to be saved */
                return VpcSession.getUrlForOpeningStack(loc, info.stackOwner, info.stackGuid, info.stackName);
            } else {
                /* case 4) from a stack we do own */
                if (this.pr.isDocDirty()) {
                    let msg = lng(
                        longstr(`lngIt looks like you have unsaved
                         changes, we're reminding you to hit Save first.`)
                    );
                    throw makeVpcInternalErr(msgNotification + msg);
                }

                return VpcSession.getUrlForOpeningStack(loc, info.stackOwner, info.stackGuid, info.stackName);
            }
        }
    }

    /**
     * helper method to show the login form and set its dimensions
     */
    protected showLoginForm(newUserOk: boolean) {
        let form = new VpcNonModalFormLogin(this.pr.vci, newUserOk);
        VpcNonModalFormSendReport.standardWindowBounds(form, this.pr.vci);
        this.pr.vci.setNonModalDialog(form);
    }
}
