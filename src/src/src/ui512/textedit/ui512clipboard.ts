
/* auto */ import { assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RepeatingTimer } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ClipManagerInterface } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { PasteTextEventDetails } from '../../ui512/menu/ui512events.js';

export class ClipManager implements ClipManagerInterface {
    root: any;
    simClipboard = '';
    readonly clipboardreadyperiod = 2000;
    timerClipboardReady = new RepeatingTimer(this.clipboardreadyperiod);
    ensureReadyForPaste(milliseconds: number) {
        if (this.root) {
            this.timerClipboardReady.update(milliseconds);
            if (this.timerClipboardReady.isDue()) {
                this.timerClipboardReady.reset();
                ClipManager.ensureReadyForPasteImpl(this.getOrCreateHidden());
            }
        }
    }

    paste(useOSClipboard: boolean) {
        if (useOSClipboard) {
            // cannot do anything here, the PasteTextEventDetails event will be sent from root
        } else {
            let d = new PasteTextEventDetails(0, this.simClipboard, useOSClipboard);
            this.root.event(d);
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
                succeeded = document.execCommand('copy');
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
        let hiddenInput = document.getElementById('hidden-dom-input') as HTMLTextAreaElement;
        if (!hiddenInput) {
            let root = this.root;
            assertTrue(root, '2=|root must be defined');
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
            hiddenInput = document.createElement('textarea');
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
            let yPosition = window.pageYOffset || document.documentElement.scrollTop;
            hiddenInput.style.top = `${yPosition}px`;
            hiddenInput.setAttribute('readonly', '');
            document.body.appendChild(hiddenInput);

            // register events
            let setFocusToHiddenInput = () => {
                ClipManager.ensureReadyForPasteImpl(hiddenInput);
            };

            // keep the hidden text area focused, no matter what...
            document.addEventListener('mouseup', setFocusToHiddenInput);
            document.addEventListener('keyup', setFocusToHiddenInput);
            hiddenInput.addEventListener('input', e => {
                setTimeout(setFocusToHiddenInput, 0);
            });

            // register for paste event
            document.addEventListener('paste', (e: ClipboardEvent) => {
                setFocusToHiddenInput();
                e.preventDefault();
                if (e.clipboardData.types.indexOf('text/plain') !== -1) {
                    let plaintext = e.clipboardData.getData('text/plain');
                    if (plaintext) {
                        let details = new PasteTextEventDetails(0, plaintext, true);
                        root.event(details);
                    }
                }
            });
        }

        return hiddenInput;
    }
}
