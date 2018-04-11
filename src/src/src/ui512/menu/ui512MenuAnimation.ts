
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { TemporarilyIgnoreEventsInterface } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512MenuItem } from '../../ui512/elements/ui512ElementsMenu.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512PresenterWithMenu.js';

/**
 * temporarily ignore events.
 * replace all listeners with a different set of listeners,
 * until shouldRestore() returns true, then return to normal
 */
export abstract class TemporarilyIgnoreEvents implements TemporarilyIgnoreEventsInterface {
    savedListeners: { [t: number]: Function[] } = {};
    isStarted = false;

    /**
     * called when state is restored to normal
     */
    abstract whenComplete(): void;

    /**
     * called periodically to ask if it is time to restore.
     * when this returns true, we'll go back to normal
     */
    abstract shouldRestore(ms: number): boolean;

    /**
     * start ignoring normal events and route them to us
     */
    start(pr: UI512PresenterWithMenuInterface) {
        assertTrue(!this.isStarted, "2.|can't call start twice");
        this.savedListeners = pr.listeners;
        pr.listeners = {};
        this.isStarted = true;
    }

    /**
     * called periodically. ms can be used to know the time elapsed.
     */
    pulse(pr: UI512PresenterWithMenuInterface, ms: number) {
        assertTrue(this.isStarted, '2-|please call start first');
        if (this.shouldRestore(ms)) {
            pr.listeners = this.savedListeners;
            this.savedListeners = {};
            this.isStarted = false;
            pr.tmpIgnore = undefined;
            this.whenComplete();
        }
    }
}

/**
 * right when you choose a menu item, suspend all other events while we blink the menu item
 */
export class IgnoreEventsForMenuBlinkAnimation extends TemporarilyIgnoreEvents {
    readonly msPerStage = 60;
    firstMs = 0;
    stage = -1;
    completed = false;
    constructor(public item: UI512MenuItem, public callback: () => void) {
        super();
    }

    /**
     * we're not done until we've hit the final stage
     */
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

    /**
     * alternate between highlighting and not-highlighting the button
     */
    goStage() {
        this.item.set('highlightactive', this.stage % 2 === 0);
        if (this.stage >= 6) {
            this.completed = true;
        }
    }

    /**
     * run the callback
     */
    whenComplete() {
        this.callback();
    }
}
