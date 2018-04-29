
/* auto */ import { isRelease, vpcversion } from '../../config.js';
/* auto */ import { UI512ErrorHandling, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { anyJson } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { VpcSession } from '../../vpc/request/vpcRequest.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcNonModalFormBase } from '../../vpcui/nonmodaldialogs/vpcLyrNonModalHolder.js';

/**
 * send a report
 */
export class VpcNonModalFormSendReport extends VpcNonModalFormBase {
    showHeader = true;
    captionText = 'lngReport an error...';
    hasCloseBtn = true;
    compositeType = 'VpcNonModalFormSendReport';
    fieldsThatAreLabels: { [key: string]: boolean } = { header: true };
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

    /**
     * when not building as 'release', we can download the raw logs as json
     */
    constructor(protected vci: VpcStateInterface) {
        super('VpcNonModalFormSendReport' + Math.random());
        VpcNonModalFormBase.standardWindowBounds(this, vci);
        if (isRelease) {
            this.btns = [['ok', 'lngSend'], ['close', 'lngClose']];
        } else {
            this.btns = [['ok', 'lngSend'], ['close', 'lngClose'], ['errorlogs', 'lngGet Logs']];
        }
    }

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        super.createSpecific(app);
        let grp = app.getGroup(this.grpId);
        let header = grp.findEl(this.getElId('lblForheader'));
        if (header) {
            header.setDimensions(header.x - 20, header.y, header.w + 40, header.h);
        }

        let descHeader = grp.findEl(this.getElId('lblFordesc'));
        if (descHeader) {
            descHeader.setDimensions(descHeader.x - 20, descHeader.y, descHeader.w + 40, descHeader.h);
        }

        let fld = grp.findEl(this.getElId('flddesc'));
        if (fld) {
            fld.set('scrollbar', true);
        }
    }

    /**
     * respond to button click
     */
    onClickBtn(short: string, el: UI512Element, vci: VpcStateInterface): void {
        if (short === 'btnerrorlogs') {
            this.downloadJsonLogs();
        } else if (short === 'btnok') {
            this.doSendErrReport(this.vci);
        } else if (short === 'btnclose') {
            this.vci.setNonModalDialog(undefined);
        }
    }

    /**
     * download the raw logs as json
     */
    protected downloadJsonLogs() {
        const amountToGet = 50;
        let lastClientLogs = UI512ErrorHandling.getLatestErrLogs(amountToGet);
        let obj: anyJson = { logs: ['(logs are compressed with lz-string)', lastClientLogs], version: vpcversion };
        let s = JSON.stringify(obj);
        let defaultFilename = 'vpc logs.json';
        let blob = new Blob([s], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, defaultFilename);
    }

    /**
     * send the err report and respond in the ui
     */
    doSendErrReport(vci: VpcStateInterface) {
        let params = this.readFields(vci.UI512App());
        let ses = VpcSession.fromRoot() as VpcSession;
        UI512BeginAsync(
            () => this.asyncSendErrReport(this.vci, params['desc']),
            (result: Error | boolean) => {
                if (this.children.length === 0) {
                    /* user hit cancel */
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

    /**
     * send the err report
     */
    async asyncSendErrReport(vci: VpcStateInterface, userdesc: string) {
        let ses = VpcSession.fromRoot() as VpcSession;

        /* get the last 30 logged errors, which might be useful. */
        let lastClientLogs = vpcversion;
        lastClientLogs += '\n' + UI512ErrorHandling.getLatestErrLogs(30).join('\n\n\n\n');
        let info = this.vci.getModel().stack.getLatestStackLineage();
        let fullStackId = VpcSession.getFullStackId(info.stackOwner, info.stackGuid);

        /* ok to set props on lblStatus, since we have a firm reference, if form has been closed is a no-op */
        this.setStatus('lngSending report...');
        await ses.vpcLogEntriesCreate(userdesc, lastClientLogs, fullStackId);
        return true;
    }
}

/**
 * reference to filesaver.js
 */
declare var saveAs: any;
