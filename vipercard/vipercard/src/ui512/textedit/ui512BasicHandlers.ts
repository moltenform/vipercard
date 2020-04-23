
/* auto */ import { CanvasWrapper } from './../utils/utilsCanvasDraw';
/* auto */ import { getRoot } from './../utils/util512Higher';
/* auto */ import { checkIsProductionBuild } from './../utils/util512Base';
/* auto */ import { UI512PresenterWithMenuInterface } from './../menu/ui512PresenterWithMenu';
/* auto */ import { KeyDownEventDetails, MouseDownDoubleEventDetails, MouseDownEventDetails, MouseEnterDetails, MouseLeaveDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../menu/ui512Events';
/* auto */ import { UI512ElementWithHighlight } from './../elements/ui512Element';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * a set of useful event-handler methods
 */
export class BasicHandlers {
    /**
     * keep a record of which mouse buttons are currently down.
     */
    static trackMouseStatusMouseDown(
        pr: UI512PresenterWithMenuInterface,
        d: MouseDownEventDetails
    ) {
        if (d.button >= 0 && d.button < pr.trackPressedBtns.length) {
            pr.trackPressedBtns[d.button] = true;
        } else {
            d.setHandled();
        }
    }

    /**
     * keep a record of which mouse buttons are currently down, set to false.
     */
    static trackMouseStatusMouseUp(
        pr: UI512PresenterWithMenuInterface,
        d: MouseUpEventDetails
    ) {
        if (d.button >= 0 && d.button < pr.trackPressedBtns.length) {
            pr.trackPressedBtns[d.button] = false;
        } else {
            d.setHandled();
        }
    }

    /**
     * find which element the user clicked on, and save it in the event.
     */
    static trackCurrentElMouseDown(
        pr: UI512PresenterWithMenuInterface,
        d: MouseDownEventDetails
    ) {
        d.el = pr.app.coordsToElement(d.mouseX, d.mouseY);
        if (!pr.canInteract(d.el)) {
            d.el = undefined;
        }

        if (d.el) {
            pr.trackClickedIds[d.button] = d.el.id;
        } else {
            pr.trackClickedIds[d.button] = undefined;
        }
    }

    /**
     * did the user click down and release on the same element?
     * if so, set "elClick".
     * otherwise, only "elRaw" is set.
     */
    static trackCurrentElMouseUp(
        pr: UI512PresenterWithMenuInterface,
        d: MouseUpEventDetails
    ) {
        d.elRaw = pr.app.coordsToElement(d.mouseX, d.mouseY);
        d.elClick =
            d.elRaw && pr.trackClickedIds[d.button] === d.elRaw.id ? d.elRaw : undefined;
        if (!pr.canInteract(d.elRaw)) {
            d.elRaw = undefined;
            d.elClick = undefined;
        }

        pr.trackClickedIds[d.button] = undefined;
    }

    /**
     * keep a record of mouse position
     */
    static trackCurrentElMouseMove(
        pr: UI512PresenterWithMenuInterface,
        d: MouseMoveEventDetails
    ) {
        pr.trackMouse = [d.mouseX, d.mouseY];
        d.elNext = pr.app.coordsToElement(d.mouseX, d.mouseY);
        d.elPrev = pr.app.coordsToElement(d.prevMouseX, d.prevMouseY);
    }

    /**
     * find which element the user clicked on, and save it in the event.
     */
    static trackMouseDoubleDown(
        pr: UI512PresenterWithMenuInterface,
        d: MouseDownDoubleEventDetails
    ) {
        d.el = pr.app.coordsToElement(d.mouseX, d.mouseY);
    }

    /**
     * if the element is "autohighlight", make it highlighted when mouse is down on it.
     */
    static trackHighlightedButtonMouseDown(
        pr: UI512PresenterWithMenuInterface,
        d: MouseDownEventDetails
    ) {
        if (
            d.button === 0 &&
            pr.canInteract(d.el) &&
            d.el instanceof UI512ElementWithHighlight
        ) {
            if (d.el.getB('autohighlight')) {
                d.el.set('highlightactive', true);
            }
        }
    }

    /**
     * if the element is "autohighlight", make it not highlighted when mouse is up on it.
     */
    static trackHighlightedButtonMouseUp(
        pr: UI512PresenterWithMenuInterface,
        d: MouseUpEventDetails
    ) {
        if (
            d.button === 0 &&
            d.elClick &&
            d.elClick instanceof UI512ElementWithHighlight
        ) {
            if (d.elClick.getB('autohighlight')) {
                d.elClick.set('highlightactive', false);
            }
        }
    }

    /**
     * if the element is "autohighlight", make it highlighted when mouse is down on it.
     */
    static trackHighlightedButtonMouseEnter(
        pr: UI512PresenterWithMenuInterface,
        d: MouseEnterDetails
    ) {
        if (
            pr.trackClickedIds[0] === d.el.id &&
            pr.canInteract(d.el) &&
            d.el instanceof UI512ElementWithHighlight
        ) {
            if (d.el.getB('autohighlight')) {
                d.el.set('highlightactive', true);
            }
        }
    }

    /**
     * if the element is "autohighlight", make it highlighted when mouse is down on it.
     */
    static trackHighlightedButtonMouseLeave(
        pr: UI512PresenterWithMenuInterface,
        d: MouseLeaveDetails
    ) {
        if (d.el && d.el instanceof UI512ElementWithHighlight) {
            if (d.el.getB('autohighlight')) {
                d.el.set('highlightactive', false);
            }
        }
    }

    /**
     * define a few global shortcut keys.
     * (we used to track keydown for cmd, option, and shift,
     * but it was too easy for these events to be stuck or missed if key released offscreen)
     */
    static basicKeyShortcuts(
        pr: UI512PresenterWithMenuInterface,
        d: KeyDownEventDetails
    ) {
        if (!d.repeated) {
            let wasShortcut = true;
            let runTestsShortcut = checkIsProductionBuild() ? 'Opt+Shift+T' : 'Opt+T';
            switch (d.readableShortcut) {
                case 'Cmd+Opt+Shift+Q':
                    pr.invalidateAll();
                    CanvasWrapper.setDebugRenderingWithChangingColors(
                        !CanvasWrapper.debugRenderingWithChangingColors
                    );
                    break;
                case runTestsShortcut:
                    BasicHandlers.showTestImage()
                    getRoot().runTests(false);
                    break;
                case 'Cmd+Opt+Shift+T':
                    BasicHandlers.showTestImage()
                    getRoot().runTests(true);
                    break;
                default:
                    wasShortcut = false;
                    break;
            }

            if (wasShortcut) {
                d.setHandled();
            }
        }
    }

    /**
     * show an image saying that we're running tests
     */
    static showTestImage() {
        let img = window.document.createElement('img')
        img.src = '/resources/test/messagefortests.png'
        window.document.body.appendChild(img)

        /* center image in the browser */
        img.style.position = 'absolute'
        const imgh = 160
        const imgw = 456
        let top = Math.round(window.innerHeight / 2 - imgh / 2)
        let left = Math.round(window.innerWidth / 2 - imgw / 2)
        img.style.top = top + 'px'
        img.style.left = left + 'px'
    }

    /**
     * run callbacks that were sent to the main event loop.
     */
    static onIdleRunCallbackQueueFromAsyncs(
        pr: UI512PresenterWithMenuInterface,
        d: KeyDownEventDetails
    ) {
        for (let i = 0; i < pr.callbackQueueForIdle.length; i++) {
            let cb = pr.callbackQueueForIdle[i];

            /* set to undefined before calling it: otherwise if it throws an exception,
            we might call it repeatedly. */
            pr.callbackQueueForIdle[i] = undefined;
            if (cb) {
                cb();
            }
        }

        pr.callbackQueueForIdle = [];
    }
}
