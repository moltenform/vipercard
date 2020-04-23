
/* auto */ import { VpcDocumentLocation, VpcIntroProvider } from './../../vpcui/intro/vpcIntroProvider';
/* auto */ import { IntroPageFirst } from './../../vpcui/intro/vpcIntroPageFirst';
/* auto */ import { ScreenConsts } from './../utils/utilsDrawConstants';
/* auto */ import { Root } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertWarn } from './../utils/util512Assert';
/* auto */ import { Util512, slength, BrowserOSInfo } from './../utils/util512';
/* auto */ import { lng } from './../lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * non-application-specific ui helpers
 */
export class RootSetupHelpers {
    static onceOnInit(root: RootHigher, gly: any) {
        //~ root.scaleMouseCoords = 1
        let domElement:HTMLCanvasElement = gly.domElement;
        gly.width = ScreenConsts.ScreenWidth;
        gly.height = ScreenConsts.ScreenHeight;
        domElement.style.width = ScreenConsts.ScreenWidth + 'px';
        domElement.style.height = ScreenConsts.ScreenHeight  + 'px';
        root.rawResize(ScreenConsts.ScreenWidth, ScreenConsts.ScreenHeight);
        if (root.getBrowserInfo() === BrowserOSInfo.Windows) {
            if (Math.abs(1.25 - window.devicePixelRatio) < 0.01) {
               /* css scaling:*/
               //~ document.body.style.transform = 'scale(0.8)'
               //~ document.body.style.transform = 'matrix(1.6, 0, 0, 1.6, 0, 0)'
               document.body.style.transform = 'matrix(0.8, 0, 0, 0.8, 0, 0)'
               document.body.style.transformOrigin = 'top left'
               document.title = 'translated'
               root.scaleMouseCoords = 1.25
            }
        }
    }

    static mainOnResize(root: RootHigher, gly: any) {
        //~ /* on high-dpi screens, automatically show bigger pixels, with no blurring */
    
        //~ let availW = window.innerWidth;
        //~ let availH = window.innerHeight;
        //~ let canFitW = Math.max(1, Math.trunc(availW / ScreenConsts.ScreenWidth));
        //~ let canFitH = Math.max(1, Math.trunc(availH / ScreenConsts.ScreenHeight));
        //~ let canFitTotal = Math.min(canFitW, canFitH);
        //~ if (!Util512.isValidNumber(canFitTotal)) {
            //~ assertWarn(false, `3?|invalid canFitW=${canFitW} canFitW=${canFitW}`);
            //~ return;
        //~ }
    
        //~ let elemMessageBelow = window.document.getElementById('elemMessageBelow');
        //~ if (elemMessageBelow) {
            //~ if (
                //~ Math.abs(window.devicePixelRatio - Math.round(window.devicePixelRatio)) > 0.01
            //~ ) {
                //~ elemMessageBelow.innerText =
                    //~ 'Please set your browser zoom level to 100% for the sharpest graphics...';
            //~ } else {
                //~ elemMessageBelow.innerText = '';
            //~ }
        //~ }
    
        //~ if (canFitTotal !== root.scaleMouseCoords) {
            //~ /* sets both priv['domElement']['width'] and priv['width'] */
            //~ gly.width = ScreenConsts.ScreenWidth;
    
            //~ /* sets both priv['domElement']['height'] and priv['height'] */
            //~ gly.height = ScreenConsts.ScreenHeight;
    
            //~ let domElement = gly.domElement;
            //~ domElement.style.width = ScreenConsts.ScreenWidth * canFitTotal + 'px';
            //~ domElement.style.height = ScreenConsts.ScreenHeight * canFitTotal + 'px';
            //~ root.scaleMouseCoords = canFitTotal;
            //~ root.rawResize(ScreenConsts.ScreenWidth, ScreenConsts.ScreenHeight);
        //~ }
    }

    /**
     * parse the page's url parameters and see if it refers to a stack
     */
    static checkPageUrlParamsGetProvider(fullLocation: string): O<VpcIntroProvider> {
        let id = RootSetupHelpers.parseStackIdFromParams(fullLocation);
        if (id && slength(id)) {
            id = id.replace(/%7C/g, '|').replace(/%7c/g, '|');
            let pts = id.split('|');
            if (pts.length === 1) {
                /* sending reference to a demo stack is different */
                /* saves some $ since no server code or even db hits need to be run */
                let demoName = Util512.fromBase64UrlSafe(pts[0]);
                if (demoName.startsWith('demo_') && demoName.match(/^[a-zA-Z0-9_-]{1,100}$/)) {
                    /* open the document */
                    let demoId = demoName + '.json';
                    return new VpcIntroProvider(demoId, lng('lngfeatured stack'), VpcDocumentLocation.FromStaticDemo);
                }
            } else if (pts.length === 2) {
                /* we're opening someone's online stack */
                return new VpcIntroProvider(id, lng('lngstack'), VpcDocumentLocation.FromStackIdOnline);
            }
        }

        return undefined;
    }

    /**
     * if the url contains something like s=xxxxx, return the xxxxx
     */
    protected static parseStackIdFromParams(s: string): O<string> {
        let spl = s.split('?');
        if (spl.length === 2) {
            let splParams = spl[1].split('&');
            for (let splParam of splParams) {
                let pair = splParam.split('=');
                if (pair.length === 2) {
                    if (pair[0] === 's') {
                        return pair[1];
                    }
                }
            }
        }

        return undefined;
    }

}

/**
 * a higher level root interface
 */
export interface RootHigher extends Root {
    rawResize(width: number, height: number):void
    scaleMouseCoords: O<number>;
}

