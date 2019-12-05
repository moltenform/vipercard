
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { cProductName } from './../../ui512/utils/util512Productname';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { UI512ElLabel } from './../../ui512/elements/ui512ElementLabel';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/**
 * export paint to GIF
 */
export class PaintGifExport {
    elStatus: O<UI512ElLabel>;
    constructor(
        protected vci: VpcStateInterface,
        protected cbRefreshCachedPaintForCard: (cardId: string) => [string, CanvasWrapper]
    ) {}

    /**
     * begin gif export
     */
    begin(speed: number) {
        this.init();
        Util512Higher.syncToAsyncTransition(
            () => this.beginPaintExportToGif(speed),
            'gif export'
        );
    }

    /**
     * create a temporary label element
     */
    protected init() {
        let grp = this.vci.UI512App().findGroup('grpPaintExportToGif');
        if (!grp) {
            grp = new UI512ElGroup('grpPaintExportToGif');
            this.vci.UI512App().addGroup(grp);
        }

        let labelElemId = 'labelPaintExportToGif' + Math.random();
        this.elStatus = new UI512ElLabel(labelElemId);
        grp.addElement(this.vci.UI512App(), this.elStatus);
        this.elStatus.setDimensions(
            this.vci.userBounds()[0] + this.vci.userBounds()[2] + 10,
            300,
            40,
            40
        );
        this.elStatus.set('w', this.vci.bounds()[2] - this.elStatus.x);
    }

    /**
     * delete our temporary label element
     */
    protected teardown() {
        let grp = this.vci.UI512App().findGroup('grpPaintExportToGif');
        if (grp && this.elStatus) {
            grp.removeElement(this.elStatus.id);
            this.elStatus = undefined;
            if (grp.countElems() === 0) {
                this.vci.UI512App().removeGroup('grpPaintExportToGif');
            }
        }
    }

    /**
     * set status, s is untranslated, s2 is already translated
     */
    protected setStatus(s: string, s2 = '') {
        if (this.elStatus) {
            this.elStatus.set('labeltext', lng(s) + ' ' + s2);
        }
    }

    /**
     * begin to export the gif
     * no exceptions thrown
     *
     * let's not use TemporarilySuspendEvents, so that the ui is not stuck if the
     * GIFEncoder is somehow stuck in a long operation
     */
    async beginPaintExportToGif(speed: number) {
        try {
            this.setStatus('lngLoading .gif creation module...');
            await Util512Higher.asyncLoadJsIfNotAlreadyLoaded(
                '/lib/jsgif/jsgifcombined.js'
            );
            this.setStatus('lngBegin .gif export.');

            if (speed < 1 || speed > 10) {
                return await this.showMsgAndClose('lngSpeed should be between 1 and 10');
            }

            let framesTodo = this.vci.getModel().stack.bgs[0].cards.length;
            let encoder = this.getEncoder(speed);
            for (let i = 0; i < framesTodo; i++) {
                this.setStatus(`lngFrame ${i + 1} of ${framesTodo}...`);
                await Util512Higher.sleep(100);
                let cds = this.vci.getModel().stack.bgs[0].cards;
                let cardId = cds[i].id;
                let [
                    currentlyCachedV,
                    currentlyCachedIm
                ] = this.cbRefreshCachedPaintForCard(cardId);
                checkThrow(
                    encoder.addFrame(currentlyCachedIm.context),
                    `KT|addFrame() returned false on cd ${i + 1}.`
                );
            }

            await Util512Higher.sleep(100);
            encoder.finish();
            let blob = new Blob([encoder.getUint8Array()], { type: 'image/gif' });
            saveAs(blob, `made with ${cProductName}.gif`);

            return this.showMsgAndClose('lngCreating .gif complete.');
        } catch (e) {
            return this.showMsgAndClose('lngErr: ' + e.toString());
        }
    }

    /**
     * get encoder and set the gif speed
     */
    protected getEncoder(speed: number) {
        /* 1-> 0.5 fps, 10-> 20fps */
        let fpsDesired = 0.5 + (speed - 1) * (19.5 / 9);
        let delay = Math.round(1000 / fpsDesired);
        let encoder = new GIFEncoder();

        /* loop forever */
        encoder.setRepeat(0);

        /* next frame every n milliseconds */
        encoder.setDelay(delay);

        checkThrow(encoder.start(), 'KS|start() returned false.');
        return encoder;
    }

    /**
     * show a message, and then close
     */
    protected async showMsgAndClose(msg: string) {
        this.setStatus(msg);
        await Util512Higher.sleep(2000);
        this.setStatus('');
        this.teardown();
    }
}

/* js-gif library */
declare let GIFEncoder: any;

/* filesaver.js library */
declare let saveAs: any;
