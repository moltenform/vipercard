
/* auto */ import { TemporarilySuspendEvents } from './ui512SuspendEvents';
/* auto */ import { UI512MenuItem } from './../elements/ui512ElementMenu';

/**
 * right when you choose a menu item, suspend all other events while we blink the menu item
 */
export class SuspendEventsForMenuBlinkAnimation extends TemporarilySuspendEvents {
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
