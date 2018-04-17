
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512ElementLabel.js';
/* auto */ import { UI512PresenterBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { IntroPageBase } from '../../vpcui/intro/vpcIntroPageBase.js';
/* auto */ import { OpenFromLocation, VpcIntroProvider } from '../../vpcui/intro/vpcIntroProvider.js';
/* auto */ import { VpcIntroInterface } from '../../vpcui/intro/vpcIntroInterface.js';

export class IntroPagePickFile extends IntroPageBase {
    isIntroOpenFromDiskPage = true;
    compositeType = 'IntroPagePickFile';
    canDrag = false;
    constructor(compid: string, bounds: number[], x: number, y: number, protected pr: VpcIntroInterface) {
        // always display centered, even if was changed earlier
        super(compid, bounds, undefined, undefined);
    }

    createSpecific(app: UI512Application) {
        let grp = app.getGroup(this.grpId);
        let headerheight = this.drawCommonFirst(app, grp);

        let noteToUser = this.genChild(app, grp, 'noteToUser', UI512ElLabel);
        noteToUser.set(
            'labeltext',
            lng('lngOpen from .json file.\n\n\nPlease click anywhere on this page\nto choose a .json file to open...')
        );
        noteToUser.setDimensions(this.x + 30, this.y + 30, 300, 200);

        // draw the cancel button
        let wndbg = grp.getEl(this.getElId('wndbg'));
        const baseX = wndbg.right - 170;
        const baseY = wndbg.bottom - 50;
        let btnOkX = baseX;
        let btnOkY = baseY;
        let btnOkW = 69;
        let btnOkH = 29;
        this.drawBtn(app, grp, 1, baseX + (252 - 174), baseY + (68 - 64), 68, 21);

        let elCanvas = window.document.getElementById('mainDomCanvas') || window.document.body;
        let elCanvasBounds = elCanvas.getBoundingClientRect();

        let clickBounds = [
            elCanvasBounds.left + elCanvasBounds.width / 6,
            elCanvasBounds.top + elCanvasBounds.height / 16,
            elCanvasBounds.width - elCanvasBounds.width / 3,
            3 * elCanvasBounds.height / 4
        ];

        // uploading a file...
        // v1: use a ui512button and send click() to an <input>. doesn't work in some browsers,
        // and feels like the type of thing clickjacking preventers will disable
        // v2: show the native <input>... can set opacity to 0 to hide the "no file chosen" text
        // but, it's complicated to position (we sometimes scale all our content) and hitbox is really wonky+too wide
        // v3: create a 64px by 64px image that is a rectangle with text 'click here', set as label.
        // works but the position might not always be right and image looks ugly
        // v4: what I have now.
        let thediv = window.document.createElement('div');
        thediv.setAttribute('id', 'divvpcfilepicker');
        thediv.style.position = 'absolute';
        thediv.style.left = `${elCanvasBounds.left}px`;
        thediv.style.top = `${elCanvasBounds.top}px`;
        let thelabel = window.document.createElement('label');
        thelabel.setAttribute('for', 'idFilePicker');
        thelabel.style.position = 'fixed';
        thelabel.style.left = `${clickBounds[0]}px`;
        thelabel.style.top = `${clickBounds[1]}px`;
        thelabel.style.width = `3`;
        thelabel.style.height = `3`;
        thelabel.innerText = ' ';

        let img = window.document.createElement('img');
        img.src = '/resources/images/choosejsonfile_nearlytransparent.png';
        img.style.position = 'fixed'; // not absolute
        img.style.left = `${clickBounds[0]}px`;
        img.style.top = `${clickBounds[1]}px`;
        img.style.width = `${clickBounds[2]}px`;
        img.style.height = `${clickBounds[3]}px`;
        img.setAttribute('class', 'arrowCursor');
        thelabel.appendChild(img);

        let filepicker = window.document.createElement('input');
        filepicker.setAttribute('id', 'idFilePicker');
        filepicker.setAttribute('type', 'file');
        filepicker.setAttribute('accept', '.json');
        filepicker.style.position = 'fixed';
        filepicker.style.left = `-9999px`;
        filepicker.style.top = `-9999px`;

        filepicker.addEventListener('change', () => this.loadFromFile());
        thediv.appendChild(thelabel);
        thediv.appendChild(filepicker);
        window.document.body.appendChild(thediv);
        this.drawCommonLast(app, grp);
        grp.getEl(this.getElId('footerText')).set('visible', false);
    }

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
            // no file chosen yet
            return;
        } else {
            let file = files[0];
            let reader = new FileReader();
            reader.onload = evt => this.onOpenFileCallback(reader);
            reader.onerror = evt => this.onOpenFileErrorCallback(reader);

            // dead in the image file as a data URL
            reader.readAsText(file, 'utf-8');
        }
    }

    onOpenFileErrorCallback(reader: FileReader) {
        alert('error reading the file contents. ' + reader.error);
    }

    onOpenFileCallback(reader: FileReader) {
        if (reader.readyState === reader.DONE) {
            if (reader.error) {
                alert('error reading the file contents. ' + reader.error ? reader.error.toString() : '');
                return;
            }

            let text = reader.result;
            let loader = new VpcIntroProvider(text, lng('lngfile from disk'), OpenFromLocation.FromJsonFile);
            this.pr.beginLoadDocument(loader);
        }
    }

    destroy(pr: UI512PresenterBase, app: UI512Application) {
        let el = window.document.getElementById('divvpcfilepicker');
        if (el) {
            window.document.body.removeChild(el);
        }

        super.destroy(pr, app);
    }

    static respondBtnClick(pr: VpcIntroInterface, self: IntroPagePickFile, el: UI512Element) {
        if (el.id.endsWith('choicebtn0') || el.id.endsWith('choicebtn1')) {
            // user clicked cancel, go back to first screen
            pr.goBackToFirstScreen();
        }
    }
}
