
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RepeatingTimer, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ClipManagerInterface } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { PasteTextEventDetails } from '../../ui512/menu/ui512events.js';

export class ClipManager implements ClipManagerInterface {
    isClipManager = true;
    simClipboard = '';
    readonly clipboardreadyperiod = 2000;
    timerClipboardReady = new RepeatingTimer(this.clipboardreadyperiod);
    ensureReadyForPaste(milliseconds: number) {
        this.timerClipboardReady.update(milliseconds);
        if (this.timerClipboardReady.isDue()) {
            this.timerClipboardReady.reset();
            ClipManager.ensureReadyForPasteImpl(this.getOrCreateHidden());
        }
    }

    paste(useOSClipboard: boolean) {
        if (useOSClipboard) {
            // cannot do anything here, the PasteTextEventDetails event will be sent from _root_
        } else {
            let d = new PasteTextEventDetails(0, this.simClipboard, useOSClipboard);
            (getRoot() as any).event(d);
        }
    }

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
                succeeded = false;
            }

            return succeeded;
        } else {
            this.simClipboard = s;
            return true;
        }
    }

    protected static ensureReadyForPasteImpl(hiddenInput: HTMLTextAreaElement) {
        hiddenInput.value = ' ';
        hiddenInput.focus();
        hiddenInput.select();
    }

    protected getOrCreateHidden() {
        let hiddenInput = window.document.getElementById('hidden-dom-input') as HTMLTextAreaElement;
        if (!hiddenInput) {
            const isRTL = window.document.documentElement.getAttribute('dir') === 'rtl';
            hiddenInput = window.document.createElement('textarea');
            hiddenInput.id = 'hidden-dom-input';
            // Prevent zooming on iOS
            hiddenInput.style.fontSize = '12pt';
            // Reset box model
            hiddenInput.style.border = '0';
            hiddenInput.style.padding = '0';
            hiddenInput.style.margin = '0';
            // Move element out of screen horizontally
            hiddenInput.style.position = 'absolute';
            hiddenInput.style[isRTL ? 'right' : 'left'] = '-99999px';
            // Move element to the same position vertically
            let yPosition = window.pageYOffset || window.document.documentElement.scrollTop;
            hiddenInput.style.top = `${yPosition}px`;
            hiddenInput.setAttribute('readonly', '');
            window.document.body.appendChild(hiddenInput);

            // register events
            let setFocusToHiddenInput = () => {
                ClipManager.ensureReadyForPasteImpl(hiddenInput);
            };

            // keep the hidden text area focused, no matter what...
            window.document.addEventListener('mouseup', setFocusToHiddenInput);
            window.document.addEventListener('keyup', setFocusToHiddenInput);
            hiddenInput.addEventListener('input', e => {
                setTimeout(setFocusToHiddenInput, 0);
            });

            // register for paste event
            window.document.addEventListener('paste', (e: ClipboardEvent) => {
                setFocusToHiddenInput();
                e.preventDefault();
                if (e.clipboardData.types.indexOf('text/plain') !== -1) {
                    let plaintext = e.clipboardData.getData('text/plain');
                    if (plaintext) {
                        let details = new PasteTextEventDetails(0, plaintext, true);
                        (getRoot() as any).event(details);
                    }
                }
            });
        }

        return hiddenInput;
    }
}
