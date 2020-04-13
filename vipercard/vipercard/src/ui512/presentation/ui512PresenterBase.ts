
/* auto */ import { CanvasWrapper } from './../utils/utilsCanvasDraw';
/* auto */ import { RenderComplete, RepeatingTimer, UI512IsPresenterInterface, VoidFn } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { UI512ErrorHandling } from './../utils/util512AssertCustom';
/* auto */ import { Util512, fitIntoInclusive } from './../utils/util512';
/* auto */ import { TemporarilySuspendEvents } from './../menu/ui512SuspendEvents';
/* auto */ import { UI512PresenterWithMenuInterface } from './../menu/ui512PresenterWithMenu';
/* auto */ import { ChangeContext, ClipManagerInterface, FnEventCallback, MenuOpenState, UI512EventType, UI512PresenterInterface } from './../draw/ui512Interfaces';
/* auto */ import { EventDetails, FocusChangedEventDetails, MouseEnterDetails, MouseLeaveDetails, MouseMoveEventDetails } from './../menu/ui512Events';
/* auto */ import { UI512ViewDraw } from './../elements/ui512ElementView';
/* auto */ import { UI512ElTextField } from './../elements/ui512ElementTextField';
/* auto */ import { UI512Application } from './../elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../elements/ui512Element';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * a Presenter receives Events,
 * updates Models accordingly,
 * and sends Models to ElementsView to be drawn.
 *
 * UI512PresenterBase can draw a UI not including indirectly constructed
 * elements (scrollbars and menus).
 * for those, use the full _UI512Presenter_ class.
 */
export abstract class UI512PresenterBase
    implements UI512PresenterWithMenuInterface, UI512IsPresenterInterface {
    readonly defaultPriority = 10;
    readonly maxMouseButtons = 5;
    private currentFocus: O<string>;
    app: UI512Application;
    trackMouse = [-1, -1];
    trackPressedBtns: boolean[] = Util512.repeat(this.maxMouseButtons, false);
    trackClickedIds: O<string>[] = Util512.repeat(this.maxMouseButtons, undefined);
    listeners: { [t: number]: FnEventCallback[] } = {};
    callbackQueueForIdle: O<VoidFn>[] = [];
    needRedraw = true;
    inited = false;
    openState = MenuOpenState.MenusClosed;
    view = new UI512ViewDraw();
    tmpSuspend: O<TemporarilySuspendEvents>;
    mouseDragStatus: number;
    useOSClipboard: boolean;
    clipManager: ClipManagerInterface;
    timerSlowIdle: RepeatingTimer;

    /**
     * copy over mouse-tracking state from another presenter.
     */
    importMouseTracking(other: UI512PresenterWithMenuInterface) {
        /* note, we don't need to copy over trackClickedIds,
        since having a click+drag persist across loading a screen would be weird. */
        if (other.trackMouse !== undefined) {
            this.trackMouse = other.trackMouse;
            this.trackPressedBtns = other.trackPressedBtns;
        }
    }

    /**
     * which element is focused
     */
    getCurrentFocus() {
        return this.currentFocus;
    }

    /**
     * set element with the focus
     */
    setCurrentFocus(next: O<string>, skipCloseFieldMsg = false) {
        if (next !== this.currentFocus) {
            let evt = new FocusChangedEventDetails(this.currentFocus, next);
            evt.skipCloseFieldMsg = skipCloseFieldMsg;

            UI512ErrorHandling.contextHint = 'setCurrentFocus';
            this.rawEventCanThrow(evt);
            if (!evt.preventChange) {
                this.currentFocus = next;
            }

            /* adjust focus to be appropriate to length of content */
            let nextFocus = this.app.findEl(next);
            if (nextFocus && nextFocus instanceof UI512ElTextField) {
                let txt = nextFocus.getFmTxt();
                nextFocus.set(
                    'selcaret',
                    fitIntoInclusive(nextFocus.getN('selcaret'), 0, txt.len())
                );
                nextFocus.set(
                    'selend',
                    fitIntoInclusive(nextFocus.getN('selend'), 0, txt.len())
                );
            }
        }
    }

    /**
     * register to listen for an event
     */
    listenEvent(
        type: UI512EventType,
        fn: (pr: UI512PresenterInterface, d: EventDetails) => void
    ) {
        let ar = this.listeners[type.valueOf()];
        if (ar !== undefined) {
            ar.push(fn);
        } else {
            this.listeners[type.valueOf()] = [fn];
        }
    }

    /**
     * handle an incoming event, and dispatch it to all of the listeners
     */
    rawEventCanThrow(d: EventDetails) {
        let evtNumber = d.type().valueOf();
        let ar = this.listeners[evtNumber];
        if (ar) {
            /* use a plain JS loop and not a for/of loop here, this area
            benefits from perf micro-optimizations */
            for (let i = 0, len = ar.length; i < len; i++) {
                if (d.handled()) {
                    break;
                }

                let cb = ar[i];
                cb(this, d);
            }
        }

        /* construct mouseleave and mouseenter events */
        if (d instanceof MouseMoveEventDetails) {
            if (d.elNext !== d.elPrev) {
                if (d.elPrev) {
                    this.rawEventCanThrow(new MouseLeaveDetails(d.elPrev));
                }

                if (d.elNext && this.canInteract(d.elNext)) {
                    this.rawEventCanThrow(new MouseEnterDetails(d.elNext));
                }
            }
        }
    }

    /**
     * can the element be interacted with
     */
    canInteract(el: O<UI512Element>) {
        if (el) {
            return el.enabled && el.visible;
        } else {
            return false;
        }
    }

    /**
     * return true if text can be selected in this field
     */
    canSelectTextInField(el: UI512ElTextField): boolean {
        /* subclasses can provide other logic here */
        return true;
    }

    /**
     * implementation of the change Observer. cause redraw if an element has changed.
     */
    changeSeen(context: ChangeContext): void {
        this.needRedraw = true;
    }

    /**
     * cause redraw if an element has changed.
     */
    invalidateAll() {
        this.needRedraw = true;
    }

    /**
     * render - if an element has changed, draw all elements onto the canvas!
     */
    render(canvas: CanvasWrapper, ms: number, cmpTotal: RenderComplete): void {
        if (!this.inited) {
            cmpTotal.complete = false;
            return;
        }

        if (this.needRedraw) {
            this.setPositionsForRender(cmpTotal);
        }

        this.view.renderApp(
            canvas,
            cmpTotal,
            this.app,
            this.currentFocus,
            this.needRedraw
        );
        if (cmpTotal.complete) {
            this.needRedraw = false;
        }

        if (this.tmpSuspend) {
            this.tmpSuspend.pulse(this, ms);
        }
    }

    /**
     * this is a way to run code asynchronously, while still
     * responding to unhandled exceptions
     */
    placeCallbackInQueue(cb: () => void) {
        this.callbackQueueForIdle.push(cb);
    }

    /**
     * queueRefreshCursor, not needed here but a subclass can implement it
     */
    queueRefreshCursor(): void {}

    abstract removeEl(gpid: string, elId: string, context: ChangeContext): void;
    protected abstract setPositionsForRender(cmpTotal: RenderComplete): void;
    abstract rebuildFieldScrollbars(): void;
}
