
/* auto */ import { RepeatingTimer, getRoot } from './../utils/util512Higher';
/* auto */ import { assertTrue, tostring } from './../utils/util512Assert';
/* auto */ import { ClipManagerInterface } from './../draw/ui512Interfaces';
/* auto */ import { PasteTextEventDetails } from './../menu/ui512Events';

/**
 * ClipManager
 * Ben Fisher, 2017
 * Uses some ideas from clipboard.js
 * If useOSClipboard, reads from operating system clipboard
 * If not useOSClipboard, simulates a clipboard and holds the string in memory
 * Modern browsers are quite restrictive about clipboard access,
 * for example, Paste basically has to come from a Cmd+V event and can't be triggered by us.
 */
export class ClipManager implements ClipManagerInterface {
    isClipManager = true;
    simClipboard = '';
    readonly ensureClipboardReady = 2000;
    timerClipboardReady: RepeatingTimer;

    constructor() {
        this.timerClipboardReady = new RepeatingTimer(this.ensureClipboardReady);
    }

    /**
     * every 2 seconds, set the browser focus to
     * our hidden input box in case the focus somehow was changed
     */
    ensureReadyForPaste(milliseconds: number) {
        this.timerClipboardReady.update(milliseconds);
        if (this.timerClipboardReady.isDue()) {
            this.timerClipboardReady.reset();
            this.goEnsureReadyForPaste();
        }
    }

    /**
     * paste from the clipboard
     */
    paste(useOSClipboard: boolean) {
        if (useOSClipboard) {
            /* cannot do anything here, the PasteTextEventDetails event will be sent from _root_ */
        } else {
            let d = new PasteTextEventDetails(0, this.simClipboard, useOSClipboard);
            getRoot().sendEvent(d);
        }
    }

    /**
     * copy to the clipboard. this one can be triggered by us.
     */
    copy(s: string, useOSClipboard: boolean) {
        if (useOSClipboard) {
            let hiddenInput = this.getOrCreateHidden();
            assertTrue(hiddenInput, '2>|could not create hiddenInput');
            hiddenInput.value = s;
            hiddenInput.select();
            let succeeded = false;
            try {
                succeeded = window.document.execCommand('copy');
            } catch (e) {
                console.warn(e);
                succeeded = false;
            }

            return succeeded;
        } else {
            this.simClipboard = s;
            return true;
        }
    }

    /**
     * run in a try/catch, we shouldn't interrupt user with a non-critical error
     */
    goEnsureReadyForPaste() {
        try {
            ClipManager.ensureReadyForPasteImpl(this.getOrCreateHidden());
        } catch (e) {
            console.warn('ensureReadyForPaste ' + e);
        }
    }

    /**
     * set the focus
     */
    protected static ensureReadyForPasteImpl(hiddenInput: HTMLTextAreaElement) {
        hiddenInput.value = ' ';
        hiddenInput.focus();
        hiddenInput.select();
    }

    /**
     * a hidden input box, required for the browser to let us copy/paste
     */
    protected getOrCreateHidden() {
        let hiddenInput = window.document.getElementById(
            'hidden-dom-input'
        ) as HTMLTextAreaElement;
        if (!hiddenInput) {
            const isRTL = window.document.documentElement.getAttribute('dir') === 'rtl';
            hiddenInput = window.document.createElement('textarea');
            hiddenInput.id = 'hidden-dom-input';

            /* prevent zooming on iOS */
            hiddenInput.style.fontSize = '12pt';

            /* reset box model */
            hiddenInput.style.border = '0';
            hiddenInput.style.padding = '0';
            hiddenInput.style.margin = '0';

            /* move element out of screen horizontally */
            hiddenInput.style.position = 'absolute';
            hiddenInput.style[isRTL ? 'right' : 'left'] = '-99999px';

            /* move element to the same position vertically */
            let yPosition =
                window.pageYOffset ?? window.document.documentElement.scrollTop;
            hiddenInput.style.top = `${yPosition}px`;
            hiddenInput.setAttribute('readonly', '');
            window.document.body.appendChild(hiddenInput);

            /* register events */
            let setFocusToHiddenInput = () => {
                try {
                    ClipManager.ensureReadyForPasteImpl(hiddenInput);
                } catch (e) {
                    console.error(tostring(e));
                }
            };

            /* keep the hidden text area focused, no matter what... */
            window.document.addEventListener('mouseup', setFocusToHiddenInput);
            window.document.addEventListener('keyup', setFocusToHiddenInput);
            hiddenInput.addEventListener('input', e => {
                /* ok to use setTimeout, there's no error we need to record from this */
                /* eslint-disable-next-line ban/ban */
                setTimeout(setFocusToHiddenInput, 0);
            });

            /* register for paste event */
            window.document.addEventListener('paste', (e: ClipboardEvent) => {
                setFocusToHiddenInput();
                e.preventDefault();
                if (
                    e.clipboardData &&
                    e.clipboardData.types.indexOf('text/plain') !== -1
                ) {
                    let plainText = e.clipboardData.getData('text/plain');
                    if (plainText) {
                        let details = new PasteTextEventDetails(0, plainText, true);
                        getRoot().sendEvent(details);
                    }
                }
            });
        }

        return hiddenInput;
    }
}
