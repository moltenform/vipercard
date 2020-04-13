
/* auto */ import { VpcSession } from './../../vpc/request/vpcRequest';
/* auto */ import { VpcNonModalFormBase } from './vpcLyrNonModalHolder';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { RespondToErr, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { checkIsProductionBuild, vpcversion } from './../../ui512/utils/util512Base';
/* auto */ import { UI512ErrorHandling } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { AnyJson, longstr } from './../../ui512/utils/util512';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { bridgedSaveAs } from './../../bridge/bridgeFileSaver';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
            longstr(`lngThank you for reporting a potential area\nof improvement.
                We will notify you of any\nupdates or fixes\nby posting to
                \ngroups.google.com/forum/#!forum/vipercard' `),
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
        if (checkIsProductionBuild()) {
            this.btns = [
                ['ok', 'lngSend'],
                ['close', 'lngClose']
            ];
        } else {
            this.btns = [
                ['ok', 'lngSend'],
                ['close', 'lngClose'],
                ['errorlogs', 'lngGet Logs']
            ];
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
        let obj: AnyJson = {
            logs: ['(logs are compressed with lz-string)', lastClientLogs],
            version: vpcversion
        };
        let s = JSON.stringify(obj);
        let defaultFilename = 'vpc logs.json';
        let blob = new Blob([s], { type: 'text/plain;charset=utf-8' });
        bridgedSaveAs(blob, defaultFilename);
    }

    /**
     * send the err report and respond in the ui
     */
    doSendErrReport(vci: VpcStateInterface) {
        let params = this.readFields(vci.UI512App());
        let ses = VpcSession.fromRoot() as VpcSession;
        let fn = async () => {
            try {
                await this.asyncSendErrReport(this.vci, params['desc']);
            } catch (e) {
                if (e.toString().includes('could not create log entry')) {
                    this.setStatus('lngAlready sent.');
                } else {
                    this.setStatus(e.toString());
                }
                return;
            }

            if (this.children.length === 0) {
                /* user hit cancel */
                return;
            } else {
                this.setStatus('lngSent report.');
            }
        };

        Util512Higher.syncToAsyncTransition(fn, 'doSendErrReport', RespondToErr.Alert);
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

        /* ok to set props on lblStatus, since we have a
        firm reference, if form has been closed is a no-op */
        this.setStatus('lngSending report...');
        await ses.vpcLogEntriesCreate(userdesc, lastClientLogs, fullStackId);
        return true;
    }
}
