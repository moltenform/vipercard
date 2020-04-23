
/* auto */ import { VpcUiIntro } from './../../vpcui/intro/vpcIntro';
/* auto */ import { VpcInitIcons } from './../../vpc/vpcutils/vpcInitIcons';
/* auto */ import { checkThrow } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { ModifierKeys } from './../utils/utilsKeypressHelpers';
/* auto */ import { UI512CursorAccess } from './../utils/utilsCursors';
/* auto */ import { CanvasWrapper } from './../utils/utilsCanvasDraw';
/* auto */ import { RenderComplete, RepeatingTimer, RespondToErr, UI512IsEventInterface, UI512IsSessionInterface, Util512Higher, showMsgIfExceptionThrown } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertWarn } from './../utils/util512Assert';
/* auto */ import { BrowserOSInfo, Util512 } from './../utils/util512';
/* auto */ import { UI512Presenter } from './../presentation/ui512Presenter';
/* auto */ import { EventDetails, IdleEventDetails, MouseDownDoubleEventDetails, MouseDownEventDetails, MouseEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../menu/ui512Events';
/* auto */ import { UI512DrawText } from './../draw/ui512DrawText';
/* auto */ import { UI512IconManager } from './../draw/ui512DrawIconManager';
/* auto */ import { SimpleUtil512Tests } from './../../test/testUtils/testTop';
/* auto */ import { RootHigher, RootSetupHelpers } from './rootSetupHelpers';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

export class FullRootUI512 implements RootHigher {
    domCanvas: CanvasWrapper;
    presenter: UI512Presenter;
    drawText: UI512DrawText;
    iconManager: UI512IconManager;
    browserOSInfo: BrowserOSInfo;
    prevMouseDown: O<MouseDownEventDetails>;
    scaleMouseCoords: O<number>;
    session: O<UI512IsSessionInterface>;

    /* send a ping to the apps every 0.1 seconds */
    timerSendIdleEvent = new RepeatingTimer(100);
    mouseButtonsExpected = 0;

    init(gly:any) {
        let domCanvas: HTMLCanvasElement = gly.domElement
        this.browserOSInfo = Util512.getBrowserOS(window.navigator.userAgent);
        this.drawText = new UI512DrawText();
        this.iconManager = new UI512IconManager();
        this.domCanvas = new CanvasWrapper(domCanvas);

        /* this.presenter = new UI512DemoBasic(); */
        /* this.presenter = new UI512DemoButtons(); */
        /* this.presenter = new UI512DemoComposites(); */
        /* this.presenter = new UI512DemoMenus(); */
        /* this.presenter = new UI512DemoPaint(); */
        /* this.presenter = new UI512DemoText(); */
        /* this.presenter = new UI512DemoTextEdit(); */
        this.presenter = new VpcUiIntro();
        domCanvas.setAttribute('id', 'mainDomCanvas');
        showMsgIfExceptionThrown(() => UI512CursorAccess.setCursor(UI512CursorAccess.defaultCursor), UI512CursorAccess.setCursor.name);
        showMsgIfExceptionThrown(VpcInitIcons.go, VpcInitIcons.name)
        showMsgIfExceptionThrown(() => this.presenter.init(), 'root.init');
    }

    invalidateAll() {
        /* called by us. does not need try/catch */
        this.presenter.invalidateAll();
    }

    getDrawText() {
        return this.drawText;
    }

    getDrawIcon() {
        return this.iconManager;
    }

    getSession() {
        return this.session;
    }

    setSession(ss: O<UI512IsSessionInterface>) {
        this.session = ss;
    }

    getBrowserInfo() {
        return this.browserOSInfo;
    }

    /* these are coming straight from golly, need to wrap in try/catch */

    replaceCurrentPresenter(newPrIn: any) {
        /* called by us. does not need try/catch */
        let newPr = newPrIn as UI512Presenter;
        checkThrow(newPr instanceof UI512Presenter, 'J2|');
        if (newPr.importMouseTracking) {
            newPr.importMouseTracking(this.presenter);
        }

        this.presenter = newPr;
        this.invalidateAll();
    }

    sendEvent(evt: UI512IsEventInterface) {
        let details = evt as EventDetails;
        assertWarn(details instanceof EventDetails, 'J1|');
        return this.event(details);
    }

    event(details: EventDetails) {
        if (details instanceof MouseEventDetails) {
            if (!this.scaleMouseCoords) {
                return false;
            }

            details.mouseX = Math.round(details.mouseX * this.scaleMouseCoords);
            details.mouseY = Math.round(details.mouseY * this.scaleMouseCoords);
        }

        if (details instanceof MouseMoveEventDetails) {
            if (!this.scaleMouseCoords) {
                return false;
            }

            details.mouseX = Math.round(details.mouseX * this.scaleMouseCoords);
            details.mouseY = Math.round(details.mouseY * this.scaleMouseCoords);
            details.prevMouseX = Math.round(details.prevMouseX * this.scaleMouseCoords);
            details.prevMouseY = Math.round(details.prevMouseY * this.scaleMouseCoords);
        }

        if (!details.handled()) {
            this.presenter.rawEventCanThrow(details);
        }

        if (details instanceof MouseDownEventDetails) {
            if (this.prevMouseDown) {
                if (
                    details.timestamp - this.prevMouseDown.timestamp < 500 &&
                    Math.abs(details.mouseX - this.prevMouseDown.mouseX) < 2 &&
                    Math.abs(details.mouseY - this.prevMouseDown.mouseY) < 2 &&
                    details.button === this.prevMouseDown.button
                ) {
                    let newevent = new MouseDownDoubleEventDetails(
                        details.timestamp,
                        details.mouseX,
                        details.mouseY,
                        details.button,
                        details.mods
                    );

                    /* don't set d.el yet, this.prevMouseDown.el might be out of date. */
                    this.event(newevent);
                }
            }

            this.prevMouseDown = details;
        }

        return details.handled();
    }

    rawResize(width: number, height: number) {
        this.invalidateAll();
    }

    sendMissedEvents(buttons: number) {
        /**
         * observed behavior: let's say there is a button on the screen.
         * you click the button, and it highlights as expected. you then, while
         * holding the mouse button down, drag the cursor outside of the window.
         * then release the mouse button when the cursor is outside. now,
         * when you bring the cursor back into the window, it *incorrectly*
         * thinks that the button should be re-highlighted, even though the mouse
         * button is up, because we never got the mouseup event.
         *
         * so, I wrote this fix. if we see that the mouse buttons are
         * different than we expected, send simulated "mouseup" events for
         * each mouse button that is now up. (the same could be done for
         * mousedown events, but we don't have any drag-into-window scenario now).
         */

        const maxNumberOfMouseButtons = 10;
        let needToSendMouseUp = this.mouseButtonsExpected & ~buttons;
        this.mouseButtonsExpected = buttons;
        for (let i = 0; i < maxNumberOfMouseButtons; i++) {
            if (needToSendMouseUp & (1 << i)) {
                let details = new MouseUpEventDetails(0, 0, 0, i, ModifierKeys.None);
                this.event(details);
            }
        }
    }

    drawFrame(frameCount: number, milliseconds: number) {
        this.timerSendIdleEvent.update(milliseconds);
        if (this.timerSendIdleEvent.isDue()) {
            this.timerSendIdleEvent.reset();
            this.event(new IdleEventDetails(milliseconds));
        }

        let complete = new RenderComplete();
        this.presenter.render(this.domCanvas, milliseconds, complete);
    }

    setTimerRate(s: string): void {
        let rate = s === 'faster' ? 50 : 100;
        this.timerSendIdleEvent = new RepeatingTimer(rate);
    }

    runTests(all: boolean) {
        Util512Higher.syncToAsyncTransition(
            SimpleUtil512Tests.runTests(all),
            'tests',
            RespondToErr.Alert
        );
    }
}
