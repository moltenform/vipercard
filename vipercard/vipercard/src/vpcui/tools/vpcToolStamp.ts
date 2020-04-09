
/* auto */ import { ToolboxDims } from './../panels/vpcToolboxPatterns';
/* auto */ import { VpcAppUIToolBase } from './vpcToolBase';
/* auto */ import { VpcTool } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { UI512Cursors } from './../../ui512/utils/utilsCursors';
/* auto */ import { O } from './../../ui512/utils/util512Assert';
/* auto */ import { cast } from './../../ui512/utils/util512';
/* auto */ import { TextSelModify } from './../../ui512/textedit/ui512TextSelModify';
/* auto */ import { UI512ImageCollection, UI512ImageCollectionCollection, UI512ImageCollectionImage } from './../../ui512/draw/ui512ImageCollection';
/* auto */ import { UI512ElTextFieldAsGeneric } from './../../ui512/textedit/ui512GenericField';
/* auto */ import { MouseDownEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElTextField } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { UI512ElLabel } from './../../ui512/elements/ui512ElementLabel';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/**
 * stamp tool, draw clip art stamps onto the card
 * images are loaded asynchronously
 */
export class VpcAppUIToolStamp extends VpcAppUIToolBase {
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
        ['transport', 'lngtransport', 24]
    ];

    /**
     * hide the watch icon, once loaded from server
     */
    protected checkIfLoaded() {
        this.updateStatusIcon();
    }

    /**
     * respond to mouse down event
     */
    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {}

    /**
     * draw the clipart onto the page
     */
    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        if (isVelOrBg) {
            let theimg = this.currentImg;
            if (theimg && theimg.loaded && theimg.image) {
                /* paint the image, centered on the mouse position */
                let [tx, ty] = this.getTranslatedCoords(d.mouseX, d.mouseY);
                let [srcw, srch] = theimg.getSize();
                tx -= Math.round(srcw / 2);
                ty -= Math.round(srch / 2);
                this.cbPaintRender().commitHtmlImageOntoImage(theimg.image, tx, ty, srcw, srch);
            }
        } else if (!isVelOrBg && d.elRaw && d.elRaw.id.endsWith('grpVpcAppUIToolStampChoiceLeft')) {
            this.onChooseCategory();
        } else if (!isVelOrBg && d.elRaw && d.elRaw.id.endsWith('grpVpcAppUIToolStampChoiceRight')) {
            this.onChoosePicture();
        }
    }

    /**
     * erase any uncommitted partial changes, called by Undo() etc
     */
    cancelCurrentToolAction() {}

    /**
     * get category from the listbox
     */
    protected getChosenCategory() {
        let el = this.vci.UI512App().findEl('grpVpcAppUIToolStampChoiceLeft');
        if (el) {
            let gel = new UI512ElTextFieldAsGeneric(cast(UI512ElTextField, el));
            let ln = TextSelModify.selectByLinesWhichLine(gel);
            if (ln !== undefined && ln >= 0 && ln < this.directories.length) {
                let ctg = this.images.children[ln];
                if (ctg) {
                    return ctg;
                }
            }
        }

        return undefined;
    }

    /**
     * get image from the listbox
     */
    protected getChosenImage() {
        let ctg = this.getChosenCategory();
        if (ctg) {
            let el = this.vci.UI512App().findEl('grpVpcAppUIToolStampChoiceRight');
            if (el && el.getFmTxt().len() > 0) {
                let gel = new UI512ElTextFieldAsGeneric(cast(UI512ElTextField, el));
                let ln = TextSelModify.selectByLinesWhichLine(gel);
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

    /**
     * when you choose a category,
     * update the list of stamps, and
     * begin loading the first one
     */
    protected onChooseCategory() {
        let ctg = this.getChosenCategory();
        if (ctg) {
            let lns = ctg.children.map(ch => lng(ch.name));
            let el = this.vci.UI512App().findEl('grpVpcAppUIToolStampChoiceRight');
            if (el) {
                UI512ElTextField.setListChoices(cast(UI512ElTextField, el, ), lns);
                el.set('selcaret', 0);
                el.set('selend', 0);
                this.currentImg = undefined;
                if (el.getFmTxt().len() > 0) {
                    /* auto-choose the first one */
                    let rghtgel = new UI512ElTextFieldAsGeneric(cast(UI512ElTextField, el, ));
                    TextSelModify.selectLineInField(rghtgel, 0);
                    this.onChoosePicture();
                }
            }
        }
    }

    /**
     * when you choose a stamp,
     * request that it loads from the server
     */
    protected onChoosePicture() {
        let img = this.getChosenImage();
        this.currentImg = img;
        if (img && !img.loaded) {
            /* we used to use the mouse-move event to check if it
            loaded instead, but this is better. */
            img.startLoad(() => {
                this.vci.placeCallbackInQueue(() => this.checkIfLoaded());
            });
        }

        this.checkIfLoaded();
    }

    /**
     * show a watch if still waiting for image to load from server
     */
    protected updateStatusIcon() {
        let grp = this.vci.UI512App().findGroup('grpVpcAppUIToolStamp');
        if (grp) {
            let el = grp.findEl('grpVpcAppUIToolStampStatus');
            if (el && this.currentImg && this.currentImg.loaded) {
                el.set('iconnumber', 76); /* white */
            } else if (el && this.currentImg) {
                el.set('iconnumber', 91); /* watch */
            } else if (el) {
                el.set('iconnumber', 76); /* white */
            }
        }
    }

    /**
     * reset state when opening tool,
     * and initialize layout for a form on the right
     */
    onOpenTool() {
        this.images = new UI512ImageCollectionCollection();
        this.currentImg = undefined;
        for (let [id, name, n] of this.directories) {
            let cl = new UI512ImageCollection(id, name, '/resources/images/stamps/');
            cl.genChildren(n);
            this.images.children.push(cl);
        }

        this.vci.UI512App().removeGroup('grpVpcAppUIToolStamp');
        let grp = new UI512ElGroup('grpVpcAppUIToolStamp');
        this.vci.UI512App().addGroup(grp);

        let px = this.vci.bounds()[0] + ScreenConsts.xAreaWidth + 1;
        let py = this.vci.bounds()[1] + ScreenConsts.yMenuBar + ToolboxDims.IconH + 8;
        let pw = ScreenConsts.ScreenWidth - (ScreenConsts.xAreaWidth + 1);
        let ph = ScreenConsts.yAreaHeight - ToolboxDims.IconH;

        /* draw background rectangle */
        let bg = new UI512ElButton('grpVpcAppUIToolStampBg');
        grp.addElement(this.vci.UI512App(), bg);
        bg.set('autohighlight', false);
        bg.set('style', UI512BtnStyle.Rectangle);
        bg.setDimensions(px, py, pw, ph);

        /* draw category choices */
        let lft = UI512ElTextField.makeChoiceBox(this.vci.UI512App(), grp, 'grpVpcAppUIToolStampChoiceLeft', px + 15, py + 15);
        let rght = UI512ElTextField.makeChoiceBox(this.vci.UI512App(), grp, 'grpVpcAppUIToolStampChoiceRight', px + 170, py + 15);

        /* draw status icon */
        let statusicon = new UI512ElButton('grpVpcAppUIToolStampStatus');
        grp.addElement(this.vci.UI512App(), statusicon);
        statusicon.set('style', UI512BtnStyle.Opaque);
        statusicon.set('icongroupid', '001');
        statusicon.set('iconnumber', 76); /* white */
        statusicon.setDimensions(px + 312, py + 15, 30, 30);

        /* draw bottom-left label */
        let lbl2 = new UI512ElLabel('grpVpcAppUIToolStampLbl2');
        grp.addElement(this.vci.UI512App(), lbl2);
        lbl2.set('labeltext', lng('lng"Art Bits" (1987)'));
        lbl2.setDimensions(px + 13, py + 280, 200, 20);

        /* optimize group */
        grp.updateBoundsBasedOnChildren();

        /* set left choices */
        UI512ElTextField.setListChoices(
            lft,
            this.directories.map(item => lng(item[1]))
        );

        /* auto-choose the first entry in the list */
        let lftgel = new UI512ElTextFieldAsGeneric(cast(UI512ElTextField, lft));
        TextSelModify.selectLineInField(lftgel, 0);
        this.onChooseCategory();
        if (rght.getFmTxt().len() > 0) {
            let rghtgel = new UI512ElTextFieldAsGeneric(cast(UI512ElTextField, rght));
            TextSelModify.selectLineInField(rghtgel, 0);
            this.onChoosePicture();
        }
    }

    /**
     * commit changes when leaving tool
     */
    onLeaveTool() {
        /* free memory by unreferencing everything */
        this.vci.UI512App().removeGroup('grpVpcAppUIToolStamp');
        this.images = new UI512ImageCollectionCollection();
        this.currentImg = undefined;
        this.cancelCurrentToolAction();
    }

    /**
     * which cursor should be shown if the mouse is over el.
     */
    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.Crosshair;
    }
}
