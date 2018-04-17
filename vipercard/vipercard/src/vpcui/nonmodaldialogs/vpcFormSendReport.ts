
/* auto */ import { vpcversion } from '../../config.js';
/* auto */ import { UI512ErrorHandling, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { anyJson } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { VpcSession } from '../../vpc/request/vpcRequest.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcFormNonModalDialogFormBase } from '../../vpcui/nonmodaldialogs/vpcLyrNonModalHolder.js';

export class VpcNonModalFormSendReport extends VpcFormNonModalDialogFormBase {
    showHeader = true;
    captionText = 'lngReport an error...';
    hasCloseBtn = true;
    compositeType = 'VpcNonModalFormSendReport';
    fields: [string, string, number][] = [
        [
            'header',
            'lngThank you for reporting a potential area\nof improvement. ' +
                'We will notify you of any\nupdates or fixes\nby posting to \ngroups.google.com/forum/#!forum/vipercard' +
                '',
            4
        ],
        ['desc', 'lngDescription of\nbug or error\nmessage, incl.\ncontext:', 3]
    ];
    btns: [string, string][] = [
        ['ok', 'lngSend'],
        ['close', 'lngClose']
        /*['errorlogs', 'lngGet Logs'],*/
    ];
    fieldsThatAreLabels: { [key: string]: boolean } = { header: true };

    constructor(protected vci: VpcStateInterface) {
        super('VpcNonModalFormSendReport' + Math.random());
        VpcFormNonModalDialogFormBase.standardWindowBounds(this, vci);
    }

    createSpecific(app: UI512Application) {
        super.createSpecific(app);
        let grp = app.getGroup(this.grpId);
        let header = grp.findEl(this.getElId('lblForheader'));
        if (header) {
            header.setDimensions(header.x - 20, header.y, header.w + 40, header.h);
        }
        let header2 = grp.findEl(this.getElId('lblFordesc'));
        if (header2) {
            header2.setDimensions(header2.x - 20, header2.y, header2.w + 40, header2.h);
        }
        let fld = grp.findEl(this.getElId('flddesc'));
        if (fld) {
            fld.set('scrollbar', true);
        }
    }

    onClickBtn(short: string, el: UI512Element, vci: VpcStateInterface): void {
        if (short === 'btnerrorlogs') {
            let lastClientLogs = UI512ErrorHandling.getLatestErrLogs(50);
            let obj: anyJson = { logs: ['(logs are compressed with lz-string)', lastClientLogs], version: vpcversion };
            let objs = JSON.stringify(obj);
            let defaultFilename = 'error logs.json';
            let blob = new Blob([objs], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, defaultFilename);
        } else if (short === 'btnok') {
            this.doSendErrReport(this.vci);
        } else if (short === 'btnclose') {
            this.vci.setNonModalDialog(undefined);
        }
    }

    doSendErrReport(vci: VpcStateInterface) {
        let paramFields = this.readFields(vci.UI512App());
        let ses = VpcSession.fromRoot() as VpcSession;
        UI512BeginAsync(
            () => this.asyncSendErrReport(this.vci, paramFields['desc']),
            (result: Error | boolean) => {
                if (this.children.length === 0) {
                    /* someone hit cancel */
                    return;
                } else if (result instanceof Error) {
                    if (scontains(result.toString(), 'could not create log entry')) {
                        this.setStatus('lngAlready sent.');
                    } else {
                        this.setStatus('lng ' + result.toString());
                    }
                } else {
                    this.setStatus('lngSent report.');
                }
            }
        );
    }

    async asyncSendErrReport(vci: VpcStateInterface, userdesc: string) {
        let ses = VpcSession.fromRoot() as VpcSession;

        /* get the last 30 logged errors, which might be useful. */
        let lastClientLogs = vpcversion;
        lastClientLogs += '\n' + UI512ErrorHandling.getLatestErrLogs(30).join('\n\n\n\n');
        let lin = this.vci.getModel().stack.getLatestStackLineage();
        let fullstackid = VpcSession.getFullStackId(lin.stackOwner, lin.stackGuid);

        /* ok to set props on lblStatus, since we have a firm reference, if form has been closed is a no-op */
        this.setStatus('lngSending report...');
        await ses.vpcLogEntriesCreate(userdesc, lastClientLogs, fullstackid);
        return true;
    }
}

declare var saveAs: any;
