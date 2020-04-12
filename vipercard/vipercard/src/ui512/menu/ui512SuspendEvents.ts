
/* auto */ import { assertTrue } from './../utils/util512AssertCustom';
/* auto */ import { UI512PresenterWithMenuInterface } from './ui512PresenterWithMenu';
/* auto */ import { FnEventCallback, TemporarilySuspendEventsInterface } from './../draw/ui512Interfaces';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * temporarily suspend (ignore) events.
 * replace all listeners with a different set of listeners,
 * until shouldRestore() returns true, then return to normal
 */
export abstract class TemporarilySuspendEvents
    implements TemporarilySuspendEventsInterface {
    savedListeners: { [t: number]: FnEventCallback[] } = {};
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
            pr.tmpSuspend = undefined;
            this.whenComplete();
        }
    }
}
