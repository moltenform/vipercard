
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { cast, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512ImageCollection, UI512ImageCollectionCollection, UI512ImageCollectionImage } from '../../ui512/draw/ui512imagecollection.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512elementsgroup.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512elementslabel.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512elementsbutton.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512elementstextfield.js';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512genericfield.js';
/* auto */ import { SelAndEntry } from '../../ui512/textedit/ui512textselect.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { ToolboxDims } from '../../vpcui/panels/vpctoolboxpatterns.js';
/* auto */ import { VpcAppUIToolResponseBase } from '../../vpcui/tools/vpctoolbase.js';

export class VpcAppUIToolStamp extends VpcAppUIToolResponseBase {
    currentImg: O<UI512ImageCollectionImage>;
    images = new UI512ImageCollectionCollection();
    readonly directories: [string, string, number][] = [
        ['animals', 'lnganimals', 20],
        ['aquatic', 'lngaquatic', 14],
        ['food', 'lngfood', 16],
        ['people', 'lngpeople', 26],
        ['places', 'lngplaces', 10],
        ['plants', 'lngplants', 16],
        ['symbols', 'lngsymbols', 8],
        ['things', 'lngthings', 22],
        ['transport', 'lngtransport', 24],
    ];

    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {
        // check if picture finished loading :)
        this.checkIfLoaded();
    }

    protected checkIfLoaded() {
        this.updateStatusIcon();
    }

    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {}

    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        if (isVelOrBg) {
            let theimg = this.currentImg;
            if (theimg && theimg.loaded && theimg.image) {
                // paint the image, centered on the mouse position
                let tmousex =
                    fitIntoInclusive(
                        d.mouseX,
                        this.appli.userBounds()[0],
                        this.appli.userBounds()[0] + this.appli.userBounds()[2] - 1
                    ) - this.appli.userBounds()[0];
                let tmousey =
                    fitIntoInclusive(
                        d.mouseY,
                        this.appli.userBounds()[1],
                        this.appli.userBounds()[1] + this.appli.userBounds()[3] - 1
                    ) - this.appli.userBounds()[1];
                let [srcw, srch] = theimg.getSize();
                tmousex -= Math.round(srcw / 2);
                tmousey -= Math.round(srch / 2);
                this.cbPaintRender().commitHtmlImageOntoImage(theimg.image, tmousex, tmousey, srcw, srch);
            }
        } else if (!isVelOrBg && d.elRaw && d.elRaw.id.endsWith('grpVpcAppUIToolStampChoiceLeft')) {
            this.onChooseCategory();
        } else if (!isVelOrBg && d.elRaw && d.elRaw.id.endsWith('grpVpcAppUIToolStampChoiceRight')) {
            this.onChoosePicture();
        }
    }

    cancelCurrentToolAction(): void {}

    protected getChosenCategory() {
        let el = this.appli.UI512App().findElemById('grpVpcAppUIToolStampChoiceLeft');
        if (el) {
            let gel = new UI512ElTextFieldAsGeneric(cast(el, UI512ElTextField));
            let ln = SelAndEntry.selectByLinesWhichLine(gel);
            if (ln !== undefined && ln >= 0 && ln < this.directories.length) {
                let ctg = this.images.children[ln];
                if (ctg) {
                    return ctg;
                }
            }
        }

        return undefined;
    }

    protected getChosenImage() {
        let ctg = this.getChosenCategory();
        if (ctg) {
            let el = this.appli.UI512App().findElemById('grpVpcAppUIToolStampChoiceRight');
            if (el && el.get_ftxt().len() > 0) {
                let gel = new UI512ElTextFieldAsGeneric(cast(el, UI512ElTextField));
                let ln = SelAndEntry.selectByLinesWhichLine(gel);
                if (ln !== undefined && ln >= 0) {
                    let img = ctg.children[ln];
                    if (img) {
                        return img;
                    }
                }
            }
        }

        return undefined;
    }

    protected onChooseCategory() {
        let ctg = this.getChosenCategory();
        if (ctg) {
            let lns = ctg.children.map(ch => this.appli.lang().translate(ch.name));
            let el = this.appli.UI512App().findElemById('grpVpcAppUIToolStampChoiceRight');
            if (el) {
                UI512ElTextField.setListChoices(cast(el, UI512ElTextField), lns);
                el.set('selcaret', 0);
                el.set('selend', 0);
                this.currentImg = undefined;
                if (el.get_ftxt().len() > 0) {
                    // auto-choose the first one
                    let rghtgel = new UI512ElTextFieldAsGeneric(cast(el, UI512ElTextField));
                    SelAndEntry.selectLineInField(rghtgel, 0);
                    this.onChoosePicture();
                }
            }
        }
    }

    protected onChoosePicture() {
        let img = this.getChosenImage();
        this.currentImg = img;
        if (img && !img.loaded) {
            // we used to use the mouse-move event to check if it loaded instead, but this is better.
            img.startLoad(() => {
                this.appli.placeCallbackInQueue(() => this.checkIfLoaded());
            });
        }

        this.checkIfLoaded();
    }

    protected updateStatusIcon() {
        let grp = this.appli.UI512App().findGroup('grpVpcAppUIToolStamp');
        if (grp) {
            let el = grp.findEl('grpVpcAppUIToolStampStatus');
            if (el && this.currentImg && this.currentImg.loaded) {
                el.set('iconnumber', 76); // white
            } else if (el && this.currentImg) {
                el.set('iconnumber', 91); // watch
            } else if (el) {
                el.set('iconnumber', 76); // white
            }
        }
    }

    onOpenTool() {
        this.images = new UI512ImageCollectionCollection();
        this.currentImg = undefined;
        for (let [id, name, n] of this.directories) {
            let cl = new UI512ImageCollection(id, name);
            cl.genChildren(n);
            this.images.children.push(cl);
        }

        this.appli.UI512App().removeGroup('grpVpcAppUIToolStamp');
        let grp = new UI512ElGroup('grpVpcAppUIToolStamp');
        this.appli.UI512App().addGroup(grp);

        let px = this.appli.bounds()[0] + ScreenConsts.xareawidth + 1;
        let py = this.appli.bounds()[1] + ScreenConsts.ymenubar + ToolboxDims.toolsIconH + 8;
        let pw = ScreenConsts.screenwidth - (ScreenConsts.xareawidth + 1);
        let ph = ScreenConsts.yareaheight - ToolboxDims.toolsIconH;

        // draw background rectangle
        let bg = new UI512ElButton('grpVpcAppUIToolStampBg');
        grp.addElement(this.appli.UI512App(), bg);
        bg.set('autohighlight', false);
        bg.set('style', UI512BtnStyle.rectangle);
        bg.setDimensions(px, py, pw, ph);

        // draw category choices
        let lft = UI512ElTextField.makeChoiceBox(
            this.appli.UI512App(),
            grp,
            'grpVpcAppUIToolStampChoiceLeft',
            px + 15,
            py + 15
        );
        let rght = UI512ElTextField.makeChoiceBox(
            this.appli.UI512App(),
            grp,
            'grpVpcAppUIToolStampChoiceRight',
            px + 170,
            py + 15
        );

        // draw status icon
        let statusicon = new UI512ElButton('grpVpcAppUIToolStampStatus');
        grp.addElement(this.appli.UI512App(), statusicon);
        statusicon.set('style', UI512BtnStyle.opaque);
        statusicon.set('iconsetid', '001');
        statusicon.set('iconnumber', 76); // white
        statusicon.setDimensions(px + 312, py + 15, 30, 30);

        // draw bottom-left label
        let lbl2 = new UI512ElLabel('grpVpcAppUIToolStampLbl2');
        grp.addElement(this.appli.UI512App(), lbl2);
        lbl2.set('labeltext', this.appli.lang().translate('lng"Art Bits" (1987)'));
        lbl2.setDimensions(px + 13, py + 280, 200, 20);

        // optimize group
        grp.updateBoundsBasedOnChildren();

        // set left choices
        UI512ElTextField.setListChoices(lft, this.directories.map(item => this.appli.lang().translate(item[1])));

        // auto-choose the first entry in the list
        let lftgel = new UI512ElTextFieldAsGeneric(cast(lft, UI512ElTextField));
        SelAndEntry.selectLineInField(lftgel, 0);
        this.onChooseCategory();
        if (rght.get_ftxt().len() > 0) {
            let rghtgel = new UI512ElTextFieldAsGeneric(cast(rght, UI512ElTextField));
            SelAndEntry.selectLineInField(rghtgel, 0);
            this.onChoosePicture();
        }
    }

    onLeaveTool() {
        // free memory by unreferencing everything
        this.appli.UI512App().removeGroup('grpVpcAppUIToolStamp');
        this.images = new UI512ImageCollectionCollection();
        this.currentImg = undefined;
        this.cancelCurrentToolAction();
    }

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.crosshair;
    }
}
