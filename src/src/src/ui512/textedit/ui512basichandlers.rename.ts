
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { UI512ElementWithHighlight } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { KeyDownEventDetails, KeyUpEventDetails, MouseDownDoubleEventDetails, MouseDownEventDetails, MouseEnterDetails, MouseLeaveDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512presenterwithmenu.js';

export class BasicHandlers {
    static trackMouseStatusMouseDown(c: UI512PresenterWithMenuInterface, root: Root, d: MouseDownEventDetails) {
        if (d.button >= 0 && d.button < c.trackPressedBtns.length) {
            c.trackPressedBtns[d.button] = true;
        } else {
            d.setHandled();
        }
    }

    static trackMouseStatusMouseUp(c: UI512PresenterWithMenuInterface, root: Root, d: MouseUpEventDetails) {
        if (d.button >= 0 && d.button < c.trackPressedBtns.length) {
            c.trackPressedBtns[d.button] = false;
        } else {
            d.setHandled();
        }
    }

    static trackCurrentElMouseDown(c: UI512PresenterWithMenuInterface, root: Root, d: MouseDownEventDetails) {
        d.el = c.app.coordsToElement(d.mouseX, d.mouseY);
        if (!c.canInteract(d.el)) {
            d.el = undefined;
        }

        if (d.el) {
            c.trackClickedIds[d.button] = d.el.id;
        } else {
            c.trackClickedIds[d.button] = undefined;
        }
    }

    static trackCurrentElMouseUp(c: UI512PresenterWithMenuInterface, root: Root, d: MouseUpEventDetails) {
        d.elRaw = c.app.coordsToElement(d.mouseX, d.mouseY);
        d.elClick = d.elRaw && c.trackClickedIds[d.button] === d.elRaw.id ? d.elRaw : undefined;
        if (!c.canInteract(d.elRaw)) {
            d.elRaw = undefined;
            d.elClick = undefined;
        }

        c.trackClickedIds[d.button] = undefined;
    }

    static trackCurrentElMouseMove(c: UI512PresenterWithMenuInterface, root: Root, d: MouseMoveEventDetails) {
        c.trackMouse = [d.mouseX, d.mouseY];
        d.elNext = c.app.coordsToElement(d.mouseX, d.mouseY);
        d.elPrev = c.app.coordsToElement(d.prevMouseX, d.prevMouseY);
    }

    static trackMouseDoubleDown(c: UI512PresenterWithMenuInterface, root: Root, d: MouseDownDoubleEventDetails) {
        d.el = c.app.coordsToElement(d.mouseX, d.mouseY);
    }

    static trackHighlightedButtonMouseDown(c: UI512PresenterWithMenuInterface, root: Root, d: MouseDownEventDetails) {
        if (d.button === 0 && c.canInteract(d.el) && d.el instanceof UI512ElementWithHighlight) {
            if (d.el.get_b('autohighlight')) {
                d.el.set('highlightactive', true);
            }
        }
    }

    static trackHighlightedButtonMouseUp(c: UI512PresenterWithMenuInterface, root: Root, d: MouseUpEventDetails) {
        if (d.button === 0 && d.elClick && d.elClick instanceof UI512ElementWithHighlight) {
            if (d.elClick.get_b('autohighlight')) {
                d.elClick.set('highlightactive', false);
            }
        }
    }

    static trackHighlightedButtonMouseEnter(c: UI512PresenterWithMenuInterface, root: Root, d: MouseEnterDetails) {
        if (c.trackClickedIds[0] === d.el.id && c.canInteract(d.el) && d.el instanceof UI512ElementWithHighlight) {
            if (d.el.get_b('autohighlight')) {
                d.el.set('highlightactive', true);
            }
        }
    }

    static trackHighlightedButtonMouseLeave(c: UI512PresenterWithMenuInterface, root: Root, d: MouseLeaveDetails) {
        if (d.el && d.el instanceof UI512ElementWithHighlight) {
            if (d.el.get_b('autohighlight')) {
                d.el.set('highlightactive', false);
            }
        }
    }

    static trackKeyDown(c: UI512PresenterWithMenuInterface, root: Root, d: KeyDownEventDetails) {
        if ((d.mods & ModifierKeys.Cmd) !== 0) {
            c.trackKeyCmd = true;
        }
        if ((d.mods & ModifierKeys.Opt) !== 0) {
            c.trackKeyOption = true;
        }
        if ((d.mods & ModifierKeys.Shift) !== 0) {
            c.trackKeyShift = true;
        }
    }

    static trackKeyUp(c: UI512PresenterWithMenuInterface, root: Root, d: KeyUpEventDetails) {
        if ((d.mods & ModifierKeys.Cmd) !== 0) {
            c.trackKeyCmd = false;
        }
        if ((d.mods & ModifierKeys.Opt) !== 0) {
            c.trackKeyOption = false;
        }
        if ((d.mods & ModifierKeys.Shift) !== 0) {
            c.trackKeyShift = false;
        }
    }

    static basicKeyShortcuts(c: UI512PresenterWithMenuInterface, root: Root, d: KeyDownEventDetails) {
        // define a few global hotkeys
        if (!d.repeated) {
            let wasShortcut = true;
            switch (d.readableShortcut) {
                case 'Cmd+Opt+Shift+Q':
                    CanvasWrapper.setDebugRenderingWithChangingColors(!CanvasWrapper.debugRenderingWithChangingColors);
                    c.invalidateAll();
                    break;
                case 'Opt+Shift+T':
                    root.runTests(false);
                    c.invalidateAll();
                    break;
                case 'Cmd+Opt+Shift+T':
                    root.runTests(true);
                    c.invalidateAll();
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

    static onIdleRunCallbackQueueFromAsyncs(c: UI512PresenterWithMenuInterface, root: Root, d: KeyDownEventDetails) {
        for (let i = 0; i < c.callbackQueueFromAsyncs.length; i++) {
            // assign it to undefined, so that if it throws, we won't be stuck in a loop calling it over again.
            let cb = c.callbackQueueFromAsyncs[i];
            c.callbackQueueFromAsyncs[i] = undefined;
            if (cb) {
                cb();
            }
        }

        c.callbackQueueFromAsyncs = [];
    }
}
