
/* auto */ import { vpcWebsitePart } from './../../ui512/utils/util512Base';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { UI512CompModalDialog, UI512CompStdDialogResult } from './../../ui512/composites/ui512ModalDialog';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * ViperCard's about dialog
 */
export const VpcAboutDialog = /* static class */ {
    /**
     * show main about screen
     *
     * opening a window is often blocked by browsers because it looks like a pop-up,
     * so we have to open the window in a more direct way, straght from
     * the mouseUp event.
     *
     * we used to use donorbox's iframe to show the donation without opening
     * a new page, but this is fragile with a lot of moving parts.
     * would it interfere with my code to capture the focus for clipboard paste?
     * also, browser differences, with Firefox treating typing into the
     * donation page also sending the events to vipercard, which didn't look right.
     */
     show(pr: UI512Presenter, dlg: UI512CompModalDialog) {
        dlg.destroy(pr, pr.app);
        dlg.cbOnMouseUp = n => {
            if (n === UI512CompStdDialogResult.Btn2) {
                window.open('https://donorbox.org/vipercard', '_blank');
            }
        };

        dlg.standardAnswer(
            pr,
            pr.app,
            longstr(
                `@ViperCardDotNet{{NEWLINE}} Re-creating and re-imagining HyperCard,
                to make animations, games, and interactive art.{{NEWLINE}}` +
                    `https://github.com/moltenform/vipercard{{NEWLINE}}` +
                    `groups.google.com/forum/#!forum/vipercard{{NEWLINE}}`,
                ' '
            ),
            n => {
                if (n === UI512CompStdDialogResult.Btn2) {
                    /* see cbOnMouseUp */
                } else if (n === UI512CompStdDialogResult.Btn3) {
                    VpcAboutDialog.showMore(pr, dlg);
                }
            },
            lng('lngClose'),
            lng('lngDonate'),
            lng('lngMore')
        );
    },

    /**
     * go directly to a dialog about Donation
     */
     showDonateDlg(pr: UI512Presenter, dlg: UI512CompModalDialog) {
        dlg.destroy(pr, pr.app);
        dlg.cbOnMouseUp = n => {
            if (n === UI512CompStdDialogResult.Btn1) {
                window.open('https://donorbox.org/vipercard', '_blank');
            }
        };

        dlg.standardAnswer(
            pr,
            pr.app,
            `Thank you for supporting this project.`,
            n => {
                /* see cbOnMouseUp */
            },
            lng('lngDonate'),
            lng('lngClose')
        );
    },

    /**
     * show more information, incl terms
     */
     showMore(pr: UI512Presenter, dlg: UI512CompModalDialog) {
        dlg.destroy(pr, pr.app);
        dlg.cbOnMouseUp = n => {
            if (n === UI512CompStdDialogResult.Btn3) {
                window.open(vpcWebsitePart + 'html/terms.html', '_blank');
            }
        };

        dlg.standardAnswer(
            pr,
            pr.app,
            longstr(
                `ViperCard has a right to remove any content{{NEWLINE}}
            that has been posted. Spam, obscene images, malware, and hateful
            content are disallowed.{{NEWLINE}}This project is funded by
            donation and will not{{NEWLINE}}share or sell any user data.`,
                ' '
            ),
            n => {
                if (n === UI512CompStdDialogResult.Btn2) {
                    VpcAboutDialog.showLibs(pr, dlg);
                } else if (n === UI512CompStdDialogResult.Btn3) {
                    /* see cbOnMouseUp */
                } else {
                    VpcAboutDialog.show(pr, dlg);
                }
            },

            lng('lngBack'),
            lng('lngJS Libs Used'),
            lng('lngFull terms')
        );
    },

    /**
     * show libraries, to fulfill terms of MIT license
     */
     showLibs(pr: UI512Presenter, dlg: UI512CompModalDialog) {
        dlg.destroy(pr, pr.app);
        dlg.standardAnswer(
            pr,
            pr.app,
            longstr(
                `ViperCard, by moltenform (Ben Fisher). GPLv3. {{NEWLINE}}{{NEWLINE}}
                Uses Chevrotain (Apache), base64-js (MIT), FileSaver (MIT),
                Golly (MIT), JSGIF (MIT), js-lru (MIT), lz-string,
                Bowser (MIT), Clipboard.js (MIT), and easy.filter.`,
                ' '
            ),
            n => {
                VpcAboutDialog.show(pr, dlg);
            },
            lng('lngBack')
        );
    }
}
