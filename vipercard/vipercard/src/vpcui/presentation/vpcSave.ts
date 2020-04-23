
/* auto */ import { VpcSessionInterface } from './../../vpc/request/vpcRequestBase';
/* auto */ import { getVpcSessionTools } from './../../vpc/request/vpcRequest';
/* auto */ import { VpcPresenterInterface } from './vpcPresenterInterface';
/* auto */ import { VpcNonModalFormSendReport } from './../nonmodaldialogs/vpcFormSendReport';
/* auto */ import { VpcNonModalFormLogin } from './../nonmodaldialogs/vpcFormLogin';
/* auto */ import { checkThrowNotifyMsg } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcSaveInterface } from './../menu/vpcAppMenuActions';
/* auto */ import { VpcElStackLineageEntry } from './../../vpc/vel/velStack';
/* auto */ import { BrowserInfo, BrowserOSInfo, RespondToErr, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O, bool, coalesceIfFalseLike } from './../../ui512/utils/util512Base';
/* auto */ import { ensureDefined } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, longstr } from './../../ui512/utils/util512';
/* auto */ import { lng } from './../../ui512/lang/langBase';
/* auto */ import { bridgedSaveAs } from './../../bridge/bridgeFileSaver';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
        let ses = getVpcSessionTools().fromRoot();
        if (ses) {
            this.busy = true;
            Util512Higher.syncToAsyncTransition(
                this.goSaveAsAsync(ensureDefined(ses, 'Kr|')),
                'goSaveAsAsync',
                RespondToErr.Alert
            );
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
        let ses = getVpcSessionTools().fromRoot();
        if (ses) {
            this.busy = true;
            Util512Higher.syncToAsyncTransition(
                this.goSaveAsync(ensureDefined(ses, 'Kq|')),
                'beginSave async',
                RespondToErr.Alert
            );
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
    protected async goSaveAsAsyncImpl(ses: VpcSessionInterface) {
        let didSave = false;
        try {
            let newStackData = this.pr.getSerializedStack();
            let info = this.pr.vci.getModel().stack.getLatestStackLineage();
            didSave = bool(await this.goSaveAsWithNewName(ses, info.stackName, newStackData));
        } catch (e) {
            this.pr.answerMsg(
                longstr(`Save did not complete. If you encounter repeated
                 errors, you can use 'Save As Json' instead.\n${e}`),
                n => {}
            );
        }

        if (didSave) {
            this.pr.lyrCoverArea.setMyMessage('Save was successful.');
            Util512Higher.syncToAsyncAfterPause(
                () => this.pr.lyrCoverArea.setMyMessage(''),
                2000,
                'hide succesful save msg',
                RespondToErr.ConsoleErrOnly
            );
        }

        this.pr.cameFromDemoSoNeverPromptSave = '';
    }

    /**
     * save, show dialog upon failure
     */
    protected async goSaveAsyncImpl(ses: VpcSessionInterface) {
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
            await this.pr.answerMsgAsync(
                longstr(`Save did not complete. If you encounter repeated
                    errors, you can use 'Save As Json' instead.\n${e}`)
            );
        }

        if (didSave) {
            this.pr.lyrCoverArea.setMyMessage('Save was successful.');
            Util512Higher.syncToAsyncAfterPause(
                () => this.pr.lyrCoverArea.setMyMessage(''),
                2000,
                'hide succesful save msg',
                RespondToErr.ConsoleErrOnly
            );
        }

        this.pr.cameFromDemoSoNeverPromptSave = '';
    }

    /**
     * stack was already saved, so we can quietly send our updated version
     */
    protected async goSaveQuietUpdate(ses: VpcSessionInterface, stackId: string, stackName: string, newStackData: string) {
        await ses.vpcStacksSave(stackId, newStackData);
        this.pr.vci.setOption('lastSavedStateId', this.pr.vci.getCurrentStateId());
        return true;
    }

    /**
     * ensures 'busy' flag reset
     */
    protected async goSaveAsAsync(ses: VpcSessionInterface) {
        try {
            await this.goSaveAsAsyncImpl(ses);
        } finally {
            this.busy = false;
        }
    }

    /**
     * ensures 'busy' flag reset
     */
    protected async goSaveAsync(ses: VpcSessionInterface) {
        try {
            await this.goSaveAsyncImpl(ses);
        } finally {
            this.busy = false;
        }
    }

    /**
     * ask the user to choose a new name
     */
    protected async goSaveAsWithNewName(ses: VpcSessionInterface, prevStackName: string, newStackData: string) {
        let prevStackNameToShow = coalesceIfFalseLike(prevStackName, 'untitled');
        if (prevStackNameToShow === 'untitled') {
            prevStackNameToShow = 'Untitled ' + Util512Higher.getRandIntInclusiveWeak(1, 100);
        }

        let newName = await this.pr.askMsgAsync('Save as:', prevStackNameToShow)[0];
        if (newName && newName.trim().length) {
            newName = newName.trim();
            let lineageBeforeChanges = this.pr.vci.getModel().stack.getS('stacklineage');
            try {
                /* add new part to stack lineage! */
                let stack = this.pr.vci.getModel().stack;
                let newPartialId = getVpcSessionTools().generateStackPartialId();
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
        let br = BrowserInfo.inst().os;
        let key = br === BrowserOSInfo.Mac ? 'Cmd' : 'Ctrl';
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

        /* count json saves, send to our server to count */
        let info = this.pr.vci.getModel().stack.getLatestStackLineage();
        let ses = getVpcSessionTools().fromRoot();
        let currentUsername = ses ? ses.username : '';

        /* telemetry on how often people save stacks */
        if (getVpcSessionTools().enableServerCode) {
            Util512Higher.syncToAsyncTransition(
                getVpcSessionTools().vpcStacksCountJsonSaves(info.stackOwner, info.stackGuid, currentUsername),
                'count json saves',
                RespondToErr.ConsoleErrOnly
            );
        }

        /* now rethrow if we got an error */
        if (eThrown) {
            throw eThrown;
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
        Util512Higher.syncToAsyncTransition(this.mnuGoFlagContentAsync(), 'beginFlagContent', RespondToErr.Alert);
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
            try {
                let ses = getVpcSessionTools().fromRoot();
                let currentUsername = ses ? ses.username : '';
                let info = this.pr.vci.getModel().stack.getLatestStackLineage();
                if (
                    info.stackOwner &&
                    info.stackOwner.length &&
                    info.stackOwner !== this.pr.vci.getModel().stack.lineageUsernameNull() &&
                    info.stackOwner !== currentUsername
                ) {
                    await getVpcSessionTools().vpcStacksFlagContent(info.stackOwner, info.stackGuid, currentUsername);
                } else {
                    let e = new Error('Could not get info, or it looks like you own this stack.');
                    throw e;
                }
            } catch (e) {
                return this.pr.answerMsgAsync('Could not send a report. ' + e.toString());
            }

            return this.pr.answerMsgAsync('Submitted a content report for this stack. Thank you.');
        } else {
            return undefined;
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
                checkThrowNotifyMsg(false, 'First, go to File->Save to upload the stack.');
            }

            let ses = getVpcSessionTools().fromRoot();
            let currentUsername = ses ? ses.username : '';

            if (info.stackOwner !== currentUsername) {
                /* case 3) from a stack we don't own -- don't check if changes need to be saved */
                return getVpcSessionTools().getUrlForOpeningStack(loc, info.stackOwner, info.stackGuid, info.stackName);
            } else {
                /* case 4) from a stack we do own */
                if (this.pr.isDocDirty()) {
                    checkThrowNotifyMsg(
                        false,
                        longstr(`It looks like you have unsaved
                    changes, we're reminding you to hit Save first.`)
                    );
                }

                return getVpcSessionTools().getUrlForOpeningStack(loc, info.stackOwner, info.stackGuid, info.stackName);
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
