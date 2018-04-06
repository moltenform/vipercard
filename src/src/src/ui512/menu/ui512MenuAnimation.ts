
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { TemporaryIgnoreEventsInterface } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512MenuItem } from '../../ui512/elements/ui512ElementsMenu.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512PresenterWithMenu.js';

export abstract class TemporaryIgnoreEvents implements TemporaryIgnoreEventsInterface {
    savedListeners: { [t: number]: Function[] } = {};
    isCaptured = false;
    capture(ctrl: UI512PresenterWithMenuInterface) {
        assertTrue(!this.isCaptured, "2.|can't call capture twice");
        this.savedListeners = ctrl.listeners;
        ctrl.listeners = {};
        this.isCaptured = true;
    }

    abstract whenComplete(): void;
    abstract shouldRestore(ms: number): boolean;
    pulse(ctrl: UI512PresenterWithMenuInterface, ms: number) {
        assertTrue(this.isCaptured, '2-|please call capture first');
        if (this.shouldRestore(ms)) {
            ctrl.listeners = this.savedListeners;
            this.savedListeners = {};
            this.isCaptured = false;
            ctrl.tmpIgnore = undefined;
            this.whenComplete();
        }
    }
}

export class IgnoreDuringAnimation extends TemporaryIgnoreEvents {
    readonly msPerStage = 60;
    firstMs = 0;
    stage = -1;
    completed = false;
    constructor(public item: UI512MenuItem, public callback: () => void) {
        super();
    }

    shouldRestore(ms: number) {
        if (this.firstMs === 0) {
            this.firstMs = ms;
        }

        let stage = Math.trunc((ms - this.firstMs) / this.msPerStage);
        if (stage !== this.stage) {
            this.stage = stage;
            this.goStage();
        }

        return this.completed;
    }

    whenComplete() {
        this.callback();
    }

    goStage() {
        this.item.set('highlightactive', this.stage % 2 === 0);
        if (this.stage >= 6) {
            this.completed = true;
        }
    }
}
