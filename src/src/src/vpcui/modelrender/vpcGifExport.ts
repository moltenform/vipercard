
/* auto */ import { O, cProductName, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, sleep } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512elementsgroup.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512elementslabel.js';
/* auto */ import { TemporaryIgnoreEvents } from '../../ui512/menu/ui512menuanimation.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcappli.js';

declare var GIFEncoder: any;
declare var saveAs: any;

export class PaintExportToGif {
    createdElem: O<UI512ElLabel>;
    constructor(
        protected appli: IVpcStateInterface,
        protected cbRefreshCachedPaintForCard: (cdid: string) => [string, CanvasWrapper]
    ) {}

    begin(speed: number) {
        this.init();
        UI512BeginAsync(() => this.beginPaintExportToGif(speed));
    }

    protected init() {
        let grp = this.appli.UI512App().findGroup('grpPaintExportToGif');
        if (!grp) {
            grp = new UI512ElGroup('grpPaintExportToGif');
            this.appli.UI512App().addGroup(grp);
        }

        let labelElemId = 'labelPaintExportToGif' + Math.random();
        this.createdElem = new UI512ElLabel(labelElemId);
        grp.addElement(this.appli.UI512App(), this.createdElem);
        this.createdElem.setDimensions(this.appli.userBounds()[0] + this.appli.userBounds()[2] + 10, 300, 40, 40);
        this.createdElem.set('w', this.appli.bounds()[2] - this.createdElem.x);
    }

    protected teardown() {
        let grp = this.appli.UI512App().findGroup('grpPaintExportToGif');
        if (grp && this.createdElem) {
            grp.removeElement(this.createdElem.id);
            this.createdElem = undefined;
            if (grp.countElems() === 0) {
                this.appli.UI512App().removeGroup('grpPaintExportToGif');
            }
        }
    }

    protected setStatus(s: string, s2 = '') {
        if (this.createdElem) {
            this.createdElem.set('labeltext', this.appli.lang().translate(s) + ' ' + s2);
        }
    }

    async beginPaintExportToGif(speed: number) {
        try {
            this.setStatus('lngLoading .gif creation module...');
            await Util512.asyncLoadJsIfNotAlreadyLoaded('/lib/jsgif/jsgifcombined.js');
            this.setStatus('lngBegin .gif export.');

            if (speed < 1 || speed > 10) {
                this.setStatus('lngSpeed should be between 1 and 10');
                await sleep(2000);
                this.setStatus('');
                this.teardown();
                return true;
            }

            let fpsDesired = 0.5 + (speed - 1) * (19.5 / 9); // 1-> 0.5 fps, 10-> 20fps
            let delay = Math.round(1000 / fpsDesired);

            let framesTodo = this.appli.getModel().stack.bgs[0].cards.length;
            let encoder = new GIFEncoder();
            encoder.setRepeat(0); // loop forever
            encoder.setDelay(delay); // next frame every n milliseconds
            checkThrow(encoder.start(), 'start() returned false.');

            for (let i = 0; i < framesTodo; i++) {
                this.setStatus(`lngFrame ${i + 1} of ${framesTodo}...`);
                await sleep(100);
                let cds = this.appli.getModel().stack.bgs[0].cards;
                let cdid = cds[i].id;
                let [currentlyCachedV, currentlyCachedIm] = this.cbRefreshCachedPaintForCard(cdid);
                checkThrow(encoder.addFrame(currentlyCachedIm.context), `addFrame() returned false on cd ${i + 1}.`);
            }

            await sleep(100);
            encoder.finish();
            let blob = new Blob([encoder.getUint8Array()], { type: 'image/gif' });
            saveAs(blob, `made with ${cProductName}.gif`);
            this.setStatus('lngCreating .gif complete.');
            await sleep(2000);
            this.setStatus('');
            this.teardown();
        } catch (e) {
            this.setStatus('lngErr:', e.toString());
            await sleep(2000);
            this.setStatus('');
            this.teardown();
        }

        return true;
    }

    // previous version of PaintExportToGif worked, but used TemporaryIgnoreEvents.capture
    // if it got stuck/took a long time to load, user is stuck and can't do anything.
}
