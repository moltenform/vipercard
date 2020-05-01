
/* auto */ import { VpcUiIntro } from './../../vpcui/intro/vpcIntro';
/* auto */ import { VpcInitIcons } from './../../vpc/vpcutils/vpcInitIcons';
/* auto */ import { checkThrow } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { ModifierKeys } from './../utils/utilsKeypressHelpers';
/* auto */ import { UI512CursorAccess, UI512Cursors } from './../utils/utilsCursors';
/* auto */ import { CanvasWrapper } from './../utils/utilsCanvasDraw';
/* auto */ import { RenderComplete, RepeatingTimer, RespondToErr, UI512IsEventInterface, UI512IsSessionInterface, Util512Higher, showMsgIfExceptionThrown } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertWarn } from './../utils/util512Assert';
/* auto */ import { UI512Presenter } from './../presentation/ui512Presenter';
/* auto */ import { EventDetails, IdleEventDetails, MouseDownDoubleEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails, MouseUpOrDownDetails } from './../menu/ui512Events';
/* auto */ import { UI512DrawText } from './../drawtext/ui512DrawText';
/* auto */ import { UI512IconManager } from './../draw/ui512DrawIconManager';
/* auto */ import { SimpleUtil512Tests } from './../../test/testUtils/testTop';
/* auto */ import { RootHigher } from './rootSetupHelpers';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

export class FullRootUI512 implements RootHigher {
    domCanvas: CanvasWrapper;
    canvasBeforeCursor: CanvasWrapper;
    presenter: UI512Presenter;
    drawText: UI512DrawText;
    iconManager: UI512IconManager;
    prevMouseDown: O<MouseDownEventDetails>;
    scaleMouseCoords = 1;
    session: O<UI512IsSessionInterface>;

    /* send a ping to the apps every 0.1 seconds */
    timerSendIdleEvent = new RepeatingTimer(100);
    mouseButtonsExpected = 0;

    init(gly: any) {
        let domCanvas: HTMLCanvasElement = gly.domElement;
        this.canvasBeforeCursor = CanvasWrapper.createMemoryCanvas(
            domCanvas.width,
            domCanvas.height
        );
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
        showMsgIfExceptionThrown(
            () => UI512CursorAccess.setCursor(UI512Cursors.arrow),
            UI512CursorAccess.setCursor.name
        );
        showMsgIfExceptionThrown(VpcInitIcons.go, VpcInitIcons.name);
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

    event(details: EventDetails, skipScaleMouseClickEvent?: boolean) {
        if (details instanceof MouseUpOrDownDetails && !skipScaleMouseClickEvent) {
            details.mouseX = adjustMouseCoord(details.mouseX, this.scaleMouseCoords);
            details.mouseY = adjustMouseCoord(details.mouseY, this.scaleMouseCoords);
        }

        if (details instanceof MouseMoveEventDetails) {
            /* we changed golly so that it sends mousemove events
            for the entire document, even if outside the canvas.
            this is useful for cursor movement -- if we stopped getting mouse events
            when the cursor left the canvas, we wouldn't know to hide the cursor */
            details.mouseX = adjustMouseCoord(details.mouseX, this.scaleMouseCoords);
            details.mouseY = adjustMouseCoord(details.mouseY, this.scaleMouseCoords);
            details.prevMouseX = adjustMouseCoord(
                details.prevMouseX,
                this.scaleMouseCoords
            );
            details.prevMouseY = adjustMouseCoord(
                details.prevMouseY,
                this.scaleMouseCoords
            );
            UI512CursorAccess.onmousemove(details.mouseX, details.prevMouseY);
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
                    /* set skipScaleMouseClickEvent flag, don't scale coords twice. */
                    this.event(newevent, true);
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
        if (
            this.canvasBeforeCursor.canvas.width !== this.domCanvas.canvas.width ||
            this.canvasBeforeCursor.canvas.height !== this.domCanvas.canvas.height
        ) {
            this.canvasBeforeCursor = CanvasWrapper.createMemoryCanvas(
                this.domCanvas.canvas.width,
                this.domCanvas.canvas.height
            );
        }

        let complete = new RenderComplete();
        let drewAnything = this.presenter.render(
            this.canvasBeforeCursor,
            milliseconds,
            complete
        );
        UI512CursorAccess.drawFinalWithCursor(
            this.canvasBeforeCursor,
            this.domCanvas,
            drewAnything
        );
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

function adjustMouseCoord(c: number, scaleMouseCoords: number) {
    return Math.round(c * scaleMouseCoords);
}
