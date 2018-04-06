
/* auto */ import { O, ui512RespondError } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, RepeatingTimer, Root, Util512, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { ChangeContext, ClipManagerInterface, MenuOpenState, UI512EventType } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512elementstextfield.js';
/* auto */ import { UI512ViewDraw } from '../../ui512/elements/ui512elementsview.js';
/* auto */ import { EventDetails, FocusChangedEventDetails, MouseEnterDetails, MouseLeaveDetails, MouseMoveEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512presenterwithmenu.js';
/* auto */ import { TemporaryIgnoreEvents } from '../../ui512/menu/ui512menuanimation.js';

export abstract class UI512ControllerBase implements UI512PresenterWithMenuInterface {
    app: UI512Application;
    readonly defaultPriority = 10;
    readonly maxMouseButtons = 5;
    private _currentFocus: O<string>;
    trackMouse = [-1, -1];
    trackPressedBtns: boolean[] = Util512.repeat(this.maxMouseButtons, false);
    trackClickedIds: O<string>[] = Util512.repeat(this.maxMouseButtons, undefined);
    trackKeyCmd = false;
    trackKeyOption = false;
    trackKeyShift = false;
    listeners: { [t: number]: Function[] } = {};
    callbackQueueFromAsyncs: (O<() => void>)[] = [];
    continueEventAfterError = true;
    needRedraw = true;
    view = new UI512ViewDraw();
    inited = false;
    openState = MenuOpenState.MenusClosed;
    tmpIgnore: O<TemporaryIgnoreEvents>;
    lang: UI512Lang;
    mouseDragStatus: number;
    useOSClipboard: boolean;
    clipManager: ClipManagerInterface;
    timerSlowIdle: RepeatingTimer;

    importMouseTracking(other: UI512PresenterWithMenuInterface) {
        // but don't copy over trackClickedIds
        if (other.trackMouse !== undefined) {
            this.trackMouse = other.trackMouse;
            this.trackPressedBtns = other.trackPressedBtns;
            this.trackKeyCmd = other.trackKeyCmd;
            this.trackKeyOption = other.trackKeyOption;
            this.trackKeyShift = other.trackKeyShift;
        }
    }

    getCurrentFocus() {
        return this._currentFocus;
    }

    setCurrentFocus(root: Root, next: O<string>) {
        if (next !== this._currentFocus) {
            let evt = new FocusChangedEventDetails(this._currentFocus, next);

            try {
                this.rawEvent(root, evt);
            } catch (e) {
                ui512RespondError(e, 'FocusChangedEvent response');
            }

            if (!evt.preventChange) {
                this._currentFocus = next;
            }

            // change 3/30
            // adjust focus to be appropriate to length of content
            let nextfocus = this.app.findElemById(next);
            if (nextfocus && nextfocus instanceof UI512ElTextField) {
                let txt = nextfocus.get_ftxt();
                nextfocus.set('selcaret', fitIntoInclusive(nextfocus.get_n('selcaret'), 0, txt.len()));
                nextfocus.set('selend', fitIntoInclusive(nextfocus.get_n('selend'), 0, txt.len()));
            }
        }
    }

    listenEvent(type: UI512EventType, fn: Function) {
        let ar = this.listeners[type.valueOf()];
        if (ar !== undefined) {
            ar.push(fn);
        } else {
            this.listeners[type.valueOf()] = [fn];
        }
    }

    rawEvent(root: Root, d: EventDetails) {
        let evtNumber = d.type().valueOf();
        let ar = this.listeners[evtNumber];
        if (ar) {
            // don't use a for/of loop here because it eats exceptions
            for (let i = 0; i < ar.length; i++) {
                let cb = ar[i];
                if (!d.handled()) {
                    try {
                        cb(this, root, d);
                    } catch (e) {
                        ui512RespondError(e, 'event ' + d.type());
                        if (!this.continueEventAfterError) {
                            break;
                        }
                    }
                }
            }
        }

        if (d instanceof MouseMoveEventDetails) {
            if (d.elNext !== d.elPrev) {
                if (d.elPrev) {
                    this.rawEvent(root, new MouseLeaveDetails(d.elPrev));
                }
                if (d.elNext && this.canInteract(d.elNext)) {
                    this.rawEvent(root, new MouseEnterDetails(d.elNext));
                }
            }
        }
    }

    canInteract(el: O<UI512Element>) {
        if (el) {
            return el.enabled && el.visible;
        } else {
            return false;
        }
    }

    canSelectTextInField(el: UI512ElTextField): boolean {
        // subclasses can provide other logic here
        return true;
    }

    changeSeen(context: ChangeContext): void {
        this.needRedraw = true;
    }

    render(root: Root, canvas: CanvasWrapper, ms: number, cmptotal: RenderComplete): void {
        if (!this.inited) {
            cmptotal.complete = false;
            return;
        }

        if (this.needRedraw) {
            this.setPositionsForRender(root, cmptotal);
        }

        this.view.renderApp(root, canvas, cmptotal, this.app, this._currentFocus, this.needRedraw);
        if (cmptotal.complete) {
            this.needRedraw = false;
        }

        if (this.tmpIgnore) {
            this.tmpIgnore.pulse(this, ms);
        }
    }

    invalidateAll() {
        this.needRedraw = true;
    }

    placeCallbackInQueue(cb: () => void) {
        this.callbackQueueFromAsyncs.push(cb);
    }

    abstract removeEl(gpid: string, elid: string, context: ChangeContext): void;
    protected abstract setPositionsForRender(root: Root, cmptotal: RenderComplete): void;
    abstract rebuildFieldScrollbars(): void;
}
