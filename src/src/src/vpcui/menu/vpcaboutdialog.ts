
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { TextFontStyling, textFontStylingToString } from '../../ui512/draw/ui512drawtextclasses.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512presenter.js';
/* auto */ import { UI512CompStdDialog } from '../../ui512/composites/ui512modaldialog.js';

export class VpcAboutDialog {
    static show(root: Root, c: UI512Controller, dlg: UI512CompStdDialog) {
        let smaller = 'chicago_10_' + textFontStylingToString(TextFontStyling.Default);
        let defFont = 'chicago_12_' + textFontStylingToString(TextFontStyling.Default);
        dlg.destroy(c, c.app);
        dlg.cbOnMouseUp = n => {
            if (n === 1) {
                let redirectWindow = window.open('https://donorbox.org/vipercard', '_blank');
            }
        };

        dlg.standardAnswer(
            root,
            c,
            c.app,
            `@ViperCardDotNet\nRe-creating and re-imagining HyperCard, to make animations, games, and interactive art.\n` +
                `https://github.com/downpoured/vipercard\ngroups.google.com/forum/#!forum/vipercard\n`,
            n => {
                if (n === 1) {
                    // see cbOnMouseUp
                } else if (n === 2) {
                    VpcAboutDialog.showMore(root, c, dlg);
                }
            },
            c.lang.translate('lngClose'),
            c.lang.translate('lngDonate'),
            c.lang.translate('lngMore')
        );
    }

    static showDonateIndirectly(root: Root, c: UI512Controller, dlg: UI512CompStdDialog) {
        dlg.destroy(c, c.app);
        dlg.cbOnMouseUp = n => {
            if (n === 0) {
                let redirectWindow = window.open('https://donorbox.org/vipercard', '_blank');
            }
        };
        dlg.standardAnswer(
            root,
            c,
            c.app,
            `Thank you for supporting this project.`,
            n => {
                dlg.cbOnMouseUp = undefined;
            },
            c.lang.translate('lngDonate'),
            c.lang.translate('lngClose')
        );
    }

    static showMore(root: Root, c: UI512Controller, dlg: UI512CompStdDialog) {
        dlg.destroy(c, c.app);
        dlg.cbOnMouseUp = n => {
            if (n === 2) {
                let redirectWindow = window.open('/0.2/html/terms.html', '_blank');
            }
        };
        dlg.standardAnswer(
            root,
            c,
            c.app,
            `ViperCard has a right to remove any content\nthat has been posted. Spam, obscene images, malware, and hateful content are disallowed.` +
                `\nThis project is funded by donation and will not\nshare or sell any user data.`,
            n => {
                if (n === 1) {
                    VpcAboutDialog.showLibs(root, c, dlg);
                } else if (n === 2) {
                    // see cbOnMouseUp
                } else {
                    VpcAboutDialog.show(root, c, dlg);
                }
            },
            c.lang.translate('lngBack'),
            c.lang.translate('lngJS Libs Used'),
            c.lang.translate('lngFull terms')
        );
    }

    static showLibs(root: Root, c: UI512Controller, dlg: UI512CompStdDialog) {
        let smaller = 'chicago_10_' + textFontStylingToString(TextFontStyling.Default);
        let defFont = 'chicago_12_' + textFontStylingToString(TextFontStyling.Default);
        dlg.destroy(c, c.app);
        dlg.standardAnswer(
            root,
            c,
            c.app,
            `ViperCard, by Ben Fisher.\n\n` +
                'Uses Chevrotain (Apache), FileSaver.js (MIT),\nGolly (MIT), JSGIF (MIT), js-lru (MIT) ' +
                ', lz-string,\nClipboard.js (MIT), and easy.filter.',
            n => {
                VpcAboutDialog.show(root, c, dlg);
            },
            c.lang.translate('lngBack')
        );
    }
}
