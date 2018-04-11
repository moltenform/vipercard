
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { TextFontStyling, textFontStylingToString } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { UI512CompModalDialog } from '../../ui512/composites/ui512ModalDialog.js';

export class VpcAboutDialog {
    static show(pr: UI512Presenter, dlg: UI512CompModalDialog) {
        let smaller = 'chicago_10_' + textFontStylingToString(TextFontStyling.Default);
        let defFont = 'chicago_12_' + textFontStylingToString(TextFontStyling.Default);
        dlg.destroy(pr, pr.app);
        dlg.cbOnMouseUp = n => {
            if (n === 1) {
                let redirectWindow = window.open('https://donorbox.org/vipercard', '_blank');
            }
        };

        dlg.standardAnswer(
            pr,
            pr.app,
            `@ViperCardDotNet\nRe-creating and re-imagining HyperCard, to make animations, games, and interactive art.\n` +
                `https://github.com/downpoured/vipercard\ngroups.google.com/forum/#!forum/vipercard\n`,
            n => {
                if (n === 1) {
                    // see cbOnMouseUp
                } else if (n === 2) {
                    VpcAboutDialog.showMore(pr, dlg);
                }
            },
            lng('lngClose'),
            lng('lngDonate'),
            lng('lngMore')
        );
    }

    static showDonateIndirectly(pr: UI512Presenter, dlg: UI512CompModalDialog) {
        dlg.destroy(pr, pr.app);
        dlg.cbOnMouseUp = n => {
            if (n === 0) {
                let redirectWindow = window.open('https://donorbox.org/vipercard', '_blank');
            }
        };
        dlg.standardAnswer(
            pr,
            pr.app,
            `Thank you for supporting this project.`,
            n => {
                dlg.cbOnMouseUp = undefined;
            },
            lng('lngDonate'),
            lng('lngClose')
        );
    }

    static showMore(pr: UI512Presenter, dlg: UI512CompModalDialog) {
        dlg.destroy(pr, pr.app);
        dlg.cbOnMouseUp = n => {
            if (n === 2) {
                let redirectWindow = window.open('/0.2/html/terms.html', '_blank');
            }
        };
        dlg.standardAnswer(
            pr,
            pr.app,
            `ViperCard has a right to remove any content\nthat has been posted. Spam, obscene images, malware, and hateful content are disallowed.` +
                `\nThis project is funded by donation and will not\nshare or sell any user data.`,
            n => {
                if (n === 1) {
                    VpcAboutDialog.showLibs(pr, dlg);
                } else if (n === 2) {
                    // see cbOnMouseUp
                } else {
                    VpcAboutDialog.show(pr, dlg);
                }
            },

            lng('lngBack'),
            lng('lngJS Libs Used'),
            lng('lngFull terms')
        );
    }

    static showLibs(pr: UI512Presenter, dlg: UI512CompModalDialog) {
        let smaller = 'chicago_10_' + textFontStylingToString(TextFontStyling.Default);
        let defFont = 'chicago_12_' + textFontStylingToString(TextFontStyling.Default);
        dlg.destroy(pr, pr.app);
        dlg.standardAnswer(
            pr,
            pr.app,
            `ViperCard, by Ben Fisher.\n\n` +
                'Uses Chevrotain (Apache), FileSaver.js (MIT),\nGolly (MIT), JSGIF (MIT), js-lru (MIT) ' +
                ', lz-string,\nClipboard.js (MIT), and easy.filter.',
            n => {
                VpcAboutDialog.show(pr, dlg);
            },
            lng('lngBack')
        );
    }
}
