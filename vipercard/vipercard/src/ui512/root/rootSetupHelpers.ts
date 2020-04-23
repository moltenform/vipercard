
/* auto */ import { VpcDocumentLocation, VpcIntroProvider } from './../../vpcui/intro/vpcIntroProvider';
/* auto */ import { IntroPageFirst } from './../../vpcui/intro/vpcIntroPageFirst';
/* auto */ import { ScreenConsts } from './../utils/utilsDrawConstants';
/* auto */ import { Root, Util512Higher, justConsoleMsgIfExceptionThrown } from './../utils/util512Higher';
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
    static mainOnResize(root: RootHigher, gly: any) {
        if (root.getBrowserInfo() === BrowserOSInfo.Windows || document.location.href.includes("newscaling")) {
            RootSetupHelpers.mainOnResizeNew(root, gly)
        } else {
            RootSetupHelpers.mainOnResizeClassic(root, gly)
        }
    }
    
    static mainOnResizeNew(root: RootHigher, gly: any) {
        /* there are two types of scaling we do:
        1) css "transform"
            use to negate the effects of the "devicePixelRatio"
            for example, the OS will notice a high-dpi screen and 
            set devicePixelRatio to 1.25 by default. This doesn't blur
            our canvas, but it looks nearest-neighbor-aliased and still bad.
            we used to have to tell the user to set the browser zoom,
            but using css transform seems to solve it.
        2) canvas sizing
            we see if the innerWidth can hold multiple copies of the screen,
            if so, we do this:
            set the width of the dom element to 800 pixels
            set the internal width of the canvas to 400 pixels
            this has the effect of scaling all the output: 
            
        for both of these we need to scale the coordinates of mouse events
        to compensate.
        
        scaling methods that I'm not using:
            tab.setZoom() only available for browser extensions
            css "zoom", non-standard
            canvasCtx.scale(0.8, 0.8) makes canvas blurred
            multiplying in the canvas: the width of dom element and width of canvas are 800px,
                but when our app tells it to draw 1pixel, it will draw 4.
                would work, but loading png images would be trickier.
        */

        /* to be conservative, set everything to 1x, so that later failures won't
        destroy the ui */
        let domElement:HTMLCanvasElement = gly.domElement;
        gly.width = ScreenConsts.ScreenWidth;
        gly.height = ScreenConsts.ScreenHeight;
        domElement.style.width = ScreenConsts.ScreenWidth + 'px';
        domElement.style.height = ScreenConsts.ScreenHeight  + 'px';
        root.rawResize(ScreenConsts.ScreenWidth, ScreenConsts.ScreenHeight);
        root.scaleMouseCoords = 1
        console.log("innerwidth", window.innerWidth)
        console.log("innerheight", window.innerHeight)

        justConsoleMsgIfExceptionThrown(()=>RootSetupHelpers.mainOnResizeNewAdvanced(root, gly), RootSetupHelpers.mainOnResizeNewAdvanced.name)

        /* sets both priv['domElement']['width'] and priv['width'] */
        
        //~ /* css scaling:*/
        //~ let dpr = window.devicePixelRatio
        //~ let oneOverDpr = 1.0/window.devicePixelRatio
        //~ if (Number.isFinite(oneOverDpr)) {
            //~ let availW = window.innerWidth;
            //~ let availH = window.innerHeight;
            ;
            //~ if (Number.isFinite(canFitTotal)) {
                //~ dpr *= canFitTotal
                //~ oneOverDpr = 1.0/dpr
            //~ }

           
            //~ 

            //~ /* sets both priv['domElement']['width'] and priv['width'] */
            
            //~ 
        //~ }
    }

    static mainOnResizeNewAdvanced(root: RootHigher, gly: any) {
        if (!window.devicePixelRatio) {
            return
        }

        /* note that window.innerWidth is affected by browser's current zoom setting */
        let domElement:HTMLCanvasElement = gly.domElement;
        let availW = window.innerWidth * window.devicePixelRatio
        let availH = window.innerHeight * window.devicePixelRatio
        let canFitW = Math.max(1, Math.trunc(availW / (ScreenConsts.ScreenWidth-20)));
        let canFitH = Math.max(1, Math.trunc(availH / (ScreenConsts.ScreenHeight-20)));
        let canFit = Math.min(canFitW, canFitH)
        gly.width = ScreenConsts.ScreenWidth;
        gly.height = ScreenConsts.ScreenHeight;
        domElement.style.width = ScreenConsts.ScreenWidth + 'px';
        domElement.style.height = ScreenConsts.ScreenHeight  + 'px';
        let totalScale = canFit / window.devicePixelRatio
        let totalScaleR = window.devicePixelRatio / canFit
        document.body.style.transform = `matrix(${totalScale}, 0, 0, ${totalScale}, 0, 0)`
        document.body.style.transformOrigin = 'top left'
        document.title = 'translated'

        root.scaleMouseCoords = totalScaleR
        root.rawResize(ScreenConsts.ScreenWidth, ScreenConsts.ScreenHeight);
    }


    static mainOnResizeClassic(root: RootHigher, gly: any) {
        /* on high-dpi screens, automatically show bigger pixels, with no blurring */
    
        let availW = window.innerWidth;
        let availH = window.innerHeight;
        let canFitW = Math.max(1, Math.trunc(availW / ScreenConsts.ScreenWidth));
        let canFitH = Math.max(1, Math.trunc(availH / ScreenConsts.ScreenHeight));
        let canFitTotal = Math.min(canFitW, canFitH);
        if (!Util512.isValidNumber(canFitTotal)) {
            assertWarn(false, `3?|invalid canFitW=${canFitW} canFitW=${canFitW}`);
            return;
        }
    
        let elemMessageBelow = window.document.getElementById('elemMessageBelow');
        if (elemMessageBelow) {
            if (
                Math.abs(window.devicePixelRatio - Math.round(window.devicePixelRatio)) > 0.01
            ) {
                elemMessageBelow.innerText =
                    'Please set your browser zoom level to 100% for the sharpest graphics...';
            } else {
                elemMessageBelow.innerText = '';
            }
        }
    
        if (1/canFitTotal !== root.scaleMouseCoords) {
            /* sets both priv['domElement']['width'] and priv['width'] */
            gly.width = ScreenConsts.ScreenWidth;
    
            /* sets both priv['domElement']['height'] and priv['height'] */
            gly.height = ScreenConsts.ScreenHeight;
    
            let domElement = gly.domElement;
            domElement.style.width = ScreenConsts.ScreenWidth * canFitTotal + 'px';
            domElement.style.height = ScreenConsts.ScreenHeight * canFitTotal + 'px';
            root.scaleMouseCoords = 1/canFitTotal;
            root.rawResize(ScreenConsts.ScreenWidth, ScreenConsts.ScreenHeight);
        }
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

