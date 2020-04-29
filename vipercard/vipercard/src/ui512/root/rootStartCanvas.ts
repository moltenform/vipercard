
/* auto */ import { toShortcutString, ui512TranslateModifiers } from './../utils/utilsKeypressHelpers';
/* auto */ import { BrowserInfo, setRoot, showMsgIfExceptionThrown } from './../utils/util512Higher';
/* auto */ import { respondUI512Error } from './../utils/util512Assert';
/* auto */ import { KeyDownEventDetails, KeyUpEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../menu/ui512Events';
/* auto */ import { FullRootUI512 } from './rootUI512';
/* auto */ import { RootSetupHelpers } from './rootSetupHelpers';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

let mainVPCStartCanvasStarted = false;

function mainVPCStartCanvas(fnMakeGolly: any) {
    if (mainVPCStartCanvasStarted) {
        return;
    }

    mainVPCStartCanvasStarted = true;
    let gollyParams = {
        eatallkeyevents: true,
        customsizing: true,
        trackFrameTime: false,
        includeallmousemoveevents: true,
        fnaddtodom: (container: any, d: any) => {
            container.insertBefore(d, window.document.getElementById('elemMessageBelow'));
        }
    };

    let browserOSInfo = BrowserInfo.inst().os;
    let root = new FullRootUI512();
    let gly: any = fnMakeGolly(gollyParams);
    gly.desiredFrameTime = 60;
    root.init(gly);
    gly.draw = () => {
        try {
            root.drawFrame(gly.frameCount, gly.milliseconds);
        } catch (e) {
            respondUI512Error(e, 'drawframe');
        }
    };

    gly.onresize = () => {
        try {
            RootSetupHelpers.mainOnResize(root, gly);
        } catch (e) {
            respondUI512Error(e, 'onresize');
        }
        return true;
    };

    gly.keydown = (
        keyCode: string,
        keyChar: string,
        repeated: boolean,
        ctrlKey: boolean,
        shiftKey: boolean,
        altKey: boolean,
        metaKey: boolean
    ) => {
        try {
            let mods = ui512TranslateModifiers(
                browserOSInfo,
                ctrlKey,
                shiftKey,
                altKey,
                metaKey
            );
            let details = new KeyDownEventDetails(
                gly.milliseconds,
                keyCode,
                keyChar,
                repeated,
                mods
            );
            root.event(details);

            /* let "paste" through, stop everything else */
            if (details.readableShortcut !== 'Cmd+V') {
                details.setHandled();
            }

            return !details.handled();
        } catch (e) {
            respondUI512Error(e, 'keydown');
            return true;
        }
    };

    gly.keyup = (
        keyCode: string,
        keyChar: string,
        ctrlKey: boolean,
        shiftKey: boolean,
        altKey: boolean,
        metaKey: boolean
    ) => {
        try {
            let mods = ui512TranslateModifiers(
                browserOSInfo,
                ctrlKey,
                shiftKey,
                altKey,
                metaKey
            );
            let details = new KeyUpEventDetails(
                gly.milliseconds,
                keyCode,
                keyChar,
                false,
                mods
            );
            root.event(details);

            /* let "paste" through, stop everything else */
            let readableShortcut = toShortcutString(details.mods, details.keyCode);
            if (readableShortcut !== 'Cmd+V') {
                details.setHandled();
            }

            return !details.handled();
        } catch (e) {
            respondUI512Error(e, 'keyup');
            return true;
        }
    };

    gly.mousemove = (
        mouseX: number,
        mouseY: number,
        button: number,
        buttons: number,
        prevMouseX: number,
        prevMouseY: number
    ) => {
        try {
            let details = new MouseMoveEventDetails(
                gly.milliseconds,
                mouseX,
                mouseY,
                prevMouseX,
                prevMouseY
            );
            root.event(details);
            if (buttons !== root.mouseButtonsExpected) {
                root.sendMissedEvents(buttons);
            }

            return !details.handled();
        } catch (e) {
            respondUI512Error(e, 'mousemove');
            return true;
        }
    };

    gly.mouseup = (
        mouseX: number,
        mouseY: number,
        button: number,
        buttons: number,
        ctrlKey: boolean,
        shiftKey: boolean,
        altKey: boolean,
        metaKey: boolean
    ) => {
        try {
            let mods = ui512TranslateModifiers(
                browserOSInfo,
                ctrlKey,
                shiftKey,
                altKey,
                metaKey
            );
            let details = new MouseUpEventDetails(
                gly.milliseconds,
                mouseX,
                mouseY,
                button,
                mods
            );
            root.event(details);
            root.mouseButtonsExpected = buttons;
            return !details.handled();
        } catch (e) {
            respondUI512Error(e, 'mouseup');
            return true;
        }
    };

    gly.mousedown = (
        mouseX: number,
        mouseY: number,
        button: number,
        buttons: number,
        ctrlKey: boolean,
        shiftKey: boolean,
        altKey: boolean,
        metaKey: boolean
    ) => {
        try {
            let mods = ui512TranslateModifiers(
                browserOSInfo,
                ctrlKey,
                shiftKey,
                altKey,
                metaKey
            );
            let details = new MouseDownEventDetails(
                gly.milliseconds,
                mouseX,
                mouseY,
                button,
                mods
            );
            root.event(details);
            root.mouseButtonsExpected = buttons;
            return !details.handled();
        } catch (e) {
            respondUI512Error(e, 'mousedown');
            return true;
        }
    };

    showMsgIfExceptionThrown(() => {
        setRoot(root);
        RootSetupHelpers.mainOnResize(root, gly);
    }, 'rootStartCanvas');
}

/* expose this function globally */
(window as any).mainVPCStartCanvas = mainVPCStartCanvas; /* on window */
