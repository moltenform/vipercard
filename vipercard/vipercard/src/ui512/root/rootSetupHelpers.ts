
/* auto */ import { ScreenConsts } from './../utils/utilsDrawConstants';
/* auto */ import { UI512CursorAccess } from './../utils/utilsCursors';
/* auto */ import { BrowserInfo, Root, justConsoleMsgIfExceptionThrown } from './../utils/util512Higher';
/* auto */ import { coalesceIfFalseLike } from './../utils/util512Base';
/* auto */ import { assertWarn } from './../utils/util512Assert';
/* auto */ import { Util512 } from './../utils/util512';
/* auto */ import { BowserBrowsers, BowserPlatform } from './../../bridge/bridgeBrowserInfo';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * non-application-specific ui helpers
 */
export class RootSetupHelpers {
    /**
     * called on init and on browser resize,
     * it gets called continually *during* the resize
     */
    static mainOnResize(root: RootHigher, gly: any) {
        let res: [number, number];
        if (RootSetupHelpers.useNewResize()) {
            res = RootSetupHelpers.mainOnResizeNew(root, gly);
        } else {
            res = RootSetupHelpers.mainOnResizeClassic(root, gly);
        }

        let canFitMultiple = coalesceIfFalseLike(res[1], 1);
        UI512CursorAccess.notifyScreenMult(canFitMultiple);
    }

    /**
     * let's not enable the new scaling everywhere yet
     */
    static useNewResize() {
        if (window.document.location.href.includes('newscaling')) {
            return true;
        }

        if (BrowserInfo.inst().platform === BowserPlatform.desktop) {
            if (
                BrowserInfo.inst().browser === BowserBrowsers.chrome ||
                BrowserInfo.inst().browser === BowserBrowsers.chromium ||
                BrowserInfo.inst().browser === BowserBrowsers.firefox
            ) {
                return true;
            }
        }

        return false;
    }

    /*
    css "transform" -- automatically show the best sharpest graphics!
        use to negate the effects of the "devicePixelRatio"
        for example, the OS will often for a high-dpi screen
        set devicePixelRatio to 1.25 by default. This doesn't blur
        our canvas, but it still looks nearest-neighbor-aliased and bad.
        We used to have to tell the user to set the browser zoom,
        but using css transform seems to solve it.
        Also use to fit

        we need to scale the coordinates of mouse events to compensate.

        scaling methods that I'm not currently using:
            canvas sizing
                set the width of the dom element to 800 pixels
                set the internal width of the canvas to 400 pixels
                this has the effect of scaling all the output.
                works well, used in v0.2.
            tab.setZoom() only available for browser extensions
            css "zoom", non-standard
            canvasCtx.scale(0.8, 0.8) makes canvas blurred
            multiplying in the canvas: the width of dom element and width of canvas are 800px,
                but when our app tells it to draw 1pixel, it will draw 4.
                would work, but loading png images would be trickier.
    */
    static mainOnResizeNew(root: RootHigher, gly: any): [number, number] {
        /* to be conservative, set everything to 1x, so that later failures won't
        destroy the ui */
        let domElement: HTMLCanvasElement = gly.domElement;
        gly.width = ScreenConsts.ScreenWidth;
        gly.height = ScreenConsts.ScreenHeight;
        domElement.style.width = ScreenConsts.ScreenWidth + 'px';
        domElement.style.height = ScreenConsts.ScreenHeight + 'px';
        root.rawResize(ScreenConsts.ScreenWidth, ScreenConsts.ScreenHeight);
        root.scaleMouseCoords = 1;
        let ret: [number, number] = [1, 1];
        justConsoleMsgIfExceptionThrown(() => {
            ret = RootSetupHelpers.mainOnResizeNewAdvanced(root, gly);
        }, RootSetupHelpers.mainOnResizeNewAdvanced.name);

        return ret;
    }

    static mainOnResizeNewAdvanced(root: RootHigher, gly: any): [number, number] {
        /* note, window.innerWidth is affected by browser's current zoom setting */
        let dpr = window.devicePixelRatio ?? 1;
        let domElement: HTMLCanvasElement = gly.domElement;
        let availW = window.innerWidth * dpr;
        let availH = window.innerHeight * dpr;
        let canFitW = Math.max(1, Math.trunc(availW / (ScreenConsts.ScreenWidth)));
        let canFitH = Math.max(1, Math.trunc(availH / (ScreenConsts.ScreenHeight)));
        let canFit = Math.min(canFitW, canFitH);
        gly.width = ScreenConsts.ScreenWidth;
        gly.height = ScreenConsts.ScreenHeight;
        domElement.style.width = ScreenConsts.ScreenWidth + 'px';
        domElement.style.height = ScreenConsts.ScreenHeight + 'px';
        let totalScale = canFit / dpr;
        let totalScaleR = dpr / canFit;
        window.document.body.style.transform = `matrix(${totalScale}, 0, 0, ${totalScale}, 0, 0)`;
        window.document.body.style.transformOrigin = 'top left';

        root.scaleMouseCoords = totalScaleR;
        root.rawResize(ScreenConsts.ScreenWidth, ScreenConsts.ScreenHeight);
        return [root.scaleMouseCoords, canFit];
    }

    static mainOnResizeClassic(root: RootHigher, gly: any): [number, number] {
        /* on high-dpi screens, automatically show bigger pixels, with no blurring */

        let availW = window.innerWidth;
        let availH = window.innerHeight;
        let canFitW = Math.max(1, Math.trunc(availW / ScreenConsts.ScreenWidth));
        let canFitH = Math.max(1, Math.trunc(availH / ScreenConsts.ScreenHeight));
        let canFitTotal = Math.min(canFitW, canFitH);
        if (!Util512.isValidNumber(canFitTotal)) {
            assertWarn(false, `3?|invalid canFitW=${canFitW} canFitW=${canFitW}`);
            return [1, 1];
        }

        let elemMessageBelow = window.document.getElementById('elemMessageBelow');
        if (elemMessageBelow) {
            if (
                Math.abs(window.devicePixelRatio - Math.round(window.devicePixelRatio)) >
                0.01
            ) {
                elemMessageBelow.innerText =
                    'Please set your browser zoom level to 100% for the sharpest graphics...';
            } else {
                elemMessageBelow.innerText = '';
            }
        }

        if (1.0 / canFitTotal !== root.scaleMouseCoords) {
            /* sets both priv['domElement']['width'] and priv['width'] */
            gly.width = ScreenConsts.ScreenWidth;

            /* sets both priv['domElement']['height'] and priv['height'] */
            gly.height = ScreenConsts.ScreenHeight;

            let domElement = gly.domElement;
            domElement.style.width = ScreenConsts.ScreenWidth * canFitTotal + 'px';
            domElement.style.height = ScreenConsts.ScreenHeight * canFitTotal + 'px';
            root.scaleMouseCoords = 1.0 / canFitTotal;
            root.rawResize(ScreenConsts.ScreenWidth, ScreenConsts.ScreenHeight);
        }

        return [root.scaleMouseCoords, canFitTotal];
    }
}

/**
 * a higher level root interface
 */
export interface RootHigher extends Root {
    rawResize(width: number, height: number): void;
    scaleMouseCoords: number;
}
