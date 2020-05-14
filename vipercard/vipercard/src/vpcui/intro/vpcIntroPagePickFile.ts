
/* auto */ import { VpcDocumentLocation, VpcIntroProvider } from './vpcIntroProvider';
/* auto */ import { IntroPageBase } from './vpcIntroPageBase';
/* auto */ import { VpcIntroInterface } from './vpcIntroInterface';
/* auto */ import { showMsgIfExceptionThrown } from './../../ui512/utils/util512Higher';
/* auto */ import { trueIfDefinedAndNotNull } from './../../ui512/utils/util512Base';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { UI512PresenterBase } from './../../ui512/presentation/ui512PresenterBase';
/* auto */ import { UI512ElLabel } from './../../ui512/elements/ui512ElementLabel';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * opening from a json file on disk
 */
export class IntroPagePickFile extends IntroPageBase {
    compositeType = 'IntroPagePickFile';
    canDrag = false;
    constructor(compId: string, bounds: number[], x: number, y: number, protected pr: VpcIntroInterface) {
        /* always display this window in the center, even if it was moved earlier */
        super(compId, bounds, undefined, undefined);
    }

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        let grp = app.getGroup(this.grpId);
        this.drawCommonFirst(app, grp);

        let noteToUser = this.genChild(app, grp, 'noteToUser', UI512ElLabel);
        noteToUser.setDimensions(this.x + 30, this.y + 30, 300, 200);
        noteToUser.set(
            'labeltext',
            lng(
                longstr(
                    `lngOpen from .json file:{{NEWLINE}}{{NEWLINE}}
                    {{NEWLINE}}Please click anywhere on this page{{NEWLINE}}
                    to choose a .json file to open...`
                )
            )
        );

        /* draw the cancel button */
        let windowLowestLayer = grp.getEl(this.getElId('windowLowestLayer'));
        const baseX = windowLowestLayer.right - 170;
        const baseY = windowLowestLayer.bottom - 50;
        let btnCancel = this.drawBtn(app, grp, 1, baseX + (252 - 174), baseY + (68 - 64), 68, 21);
        this.cancelBtnId = btnCancel.id;

        /* set the dimensions of the clickbounds */
        let bounds = [0, 0, 9999, baseY - 50];
        this.addPickerHtml(bounds);
        this.drawCommonLast(app, grp);
        grp.getEl(this.getElId('footerText')).set('visible', false);
    }

    /**
     * add html elements for file picker
     * one of the rare cases in ViperCard where we touch the real DOM
     * we can't show any real input boxes, though, because the text
     * will be smoothed, which looks wrong.
     */
    protected addPickerHtml(bounds: number[]) {
        /* v1: use a ui512button and send click() to an <input>.
        doesn't work in some browsers, and it seems like the type of thing
        browsers will think is clickjacking and disable.

        v2: show the native <input>... can set opacity to 0 to hide the
        "no file chosen" text but, it's complicated to position (we sometimes
        scale all our content) and hitbox is really wonky+too wide.

        v3: create a 64px by 64px image that is a rectangle with text
        'click here', set as label. works but the position might not always
        be right and image looks ugly.

        v4: current
        make a real <input>, but hide it offscreen
        make a <label> for the input that contains an <img>, the image
        is a nearly-opaque png. so, clicking the png triggers the <input>.
        we make the hitbox as big as possible (nearly entire screen) so that
        any rendering discrepencies won't affect too badly.

        used fixed, not absolute, we position relative to window not parent */

        let pDiv = window.document.createElement('div');
        pDiv.setAttribute('id', 'divVpcFilePicker');
        pDiv.style.position = 'absolute';
        pDiv.style.left = `${bounds[0]}px`;
        pDiv.style.top = `${bounds[1]}px`;
        pDiv.style.cursor = 'none';

        let pLabel = window.document.createElement('label');
        pLabel.setAttribute('for', 'idFilePicker');
        pLabel.style.position = 'fixed';
        pLabel.style.left = `${bounds[0]}px`;
        pLabel.style.top = `${bounds[1]}px`;
        pLabel.style.width = `3`;
        pLabel.style.height = `3`;
        pLabel.innerText = ' ';
        pLabel.style.cursor = 'none';

        let img = window.document.createElement('img');
        img.src = '/resources03a/images/choosejsonfilenearlytransparent.png';
        img.style.position = 'fixed';
        img.style.left = `${bounds[0]}px`;
        img.style.top = `${bounds[1]}px`;
        img.style.width = `${bounds[2]}px`;
        img.style.height = `${bounds[3]}px`;
        img.style.cursor = 'none';
        img.setAttribute('class', 'arrowCursor');
        pLabel.appendChild(img);

        let pInput = window.document.createElement('input');
        pInput.setAttribute('id', 'idFilePicker');
        pInput.setAttribute('type', 'file');
        pInput.setAttribute('accept', '.json');
        pInput.style.position = 'fixed';
        pInput.style.left = `-9999px`;
        pInput.style.top = `-9999px`;
        pInput.style.cursor = 'none';
        pInput.addEventListener('change', () => this.loadFromFile());
        pDiv.appendChild(pLabel);
        pDiv.appendChild(pInput);
        window.document.body.appendChild(pDiv);
    }

    /**
     * called by the browser when a file is chosen
     */
    loadFromFile() {
        if (!FileReader) {
            alert('opening files not supported in this browser, "FileReader" not found');
            return;
        }

        let picker = window.document.getElementById('idFilePicker') as HTMLInputElement;
        if (!picker) {
            alert('file picker element not found');
            return;
        }

        let files = picker.files;
        if (!files || !files.length) {
            /* no file chosen yet */
            return;
        } else {
            let file = files[0];
            let reader = new FileReader();
            reader.addEventListener('load', evt => showMsgIfExceptionThrown(() => this.onOpenFileCallback(reader), ''));
            reader.addEventListener('error', evt => showMsgIfExceptionThrown(() => this.onOpenFileErrorCallback(reader), ''));

            /* read in the image file as a data URL */
            reader.readAsText(file, 'utf-8');
        }
    }

    /**
     * file could not be read.
     */
    onOpenFileErrorCallback(reader: FileReader) {
        alert('error reading the file contents. ' + reader.error);
    }

    /**
     * called when file is read.
     * pass the string read from the file as a string via identifier
     */
    onOpenFileCallback(reader: FileReader) {
        if (reader.readyState === reader.DONE) {
            if (
                !trueIfDefinedAndNotNull(reader) ||
                trueIfDefinedAndNotNull(reader.error) ||
                !trueIfDefinedAndNotNull(reader.result)
            ) {
                alert(`error reading the file contents. ${reader?.error?.toString()}`);
                return;
            }

            let text = reader.result;
            if (!text) {
                alert('got no text from file');
                return;
            }
            if (typeof text !== 'string') {
                alert('text is not a string. got binary data?');
                return;
            }

            let loader = new VpcIntroProvider(text, lng('lngfile from disk'), VpcDocumentLocation.FromJsonFile);
            this.pr.beginLoadDocument(loader);
        }
    }

    /**
     * override destroy and close our div
     */
    destroy(pr: UI512PresenterBase, app: UI512Application) {
        let el = window.document.getElementById('divVpcFilePicker');
        if (el) {
            window.document.body.removeChild(el);
        }

        super.destroy(pr, app);
    }

    /**
     * respond to button click
     */
    respondToBtnClick(pr: VpcIntroInterface, self: IntroPagePickFile, el: UI512Element) {
        if (el.id.endsWith('choicebtn0') || el.id.endsWith('choicebtn1')) {
            /* user clicked cancel, go back to first screen */
            pr.goBackToFirstScreen();
        }
    }
}
