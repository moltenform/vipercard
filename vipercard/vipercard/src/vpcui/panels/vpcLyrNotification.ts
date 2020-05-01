
/* auto */ import { VpcAppLyrDragHandles } from './vpcLyrDragHandles';
/* auto */ import { VpcUILayer } from './../state/vpcInterface';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElLabel } from './../../ui512/elements/ui512ElementLabel';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { TextFontSpec } from './../../ui512/drawtext/ui512DrawTextClasses';
/* auto */ import { UI512DrawText } from './../../ui512/drawtext/ui512DrawText';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * text notifications to the user in the lower right of the screen
 */
export class VpcAppLyrNotification extends VpcUILayer {
    elems: { [key: string]: UI512Element } = {};

    /**
     * update ui
     */
    updateUI512Els() {
        this.elems.nyiMsg.set('visible', false);
    }

    /**
     * hide the message
     */
    hideMyMessage() {
        let grpHelperElems = VpcAppLyrDragHandles.getGrpHelperElems(this.vci.UI512App());
        let lbl = grpHelperElems.findEl('grpAppHelperElemsShowTutorial');
        if (lbl) {
            lbl.set('visible', false);
        }
    }

    /**
     * set the message
     */
    setMyMessage(s: string) {
        let grpHelperElems = VpcAppLyrDragHandles.getGrpHelperElems(this.vci.UI512App());
        let lbl = grpHelperElems.findEl('grpAppHelperElemsShowTutorial');
        if (lbl) {
            lbl.set('labeltext', s);
            lbl.set('visible', true);
        }
    }

    /**
     * if user clicked 'open tutorial', hide our message
     */
    respondMouseUp(d: MouseUpEventDetails) {
        if (d.elClick) {
            if (d.elClick.id === 'grpAppHelperElemsShowTutorial') {
                let grpHelperElems = VpcAppLyrDragHandles.getGrpHelperElems(this.vci.UI512App());
                let lbl = grpHelperElems.findEl('grpAppHelperElemsShowTutorial');
                if (lbl) {
                    if (this.vci.bounds()[0] + this.vci.bounds()[2] - d.mouseX < 55) {
                        lbl.set('visible', false);
                    } else {
                        this.vci.performMenuAction('mnuDlgHelpExamples');
                    }
                }
            }
        }
    }

    /**
     * initialize layout
     */
    init() {
        /* get or create group */
        let grpHelperElems = VpcAppLyrDragHandles.getGrpHelperElems(this.vci.UI512App());

        /* create a white opaque rectangle to cover up user elements that leave the user area */
        this.elems.cover = new UI512ElButton('grpAppHelperElemsCover');
        grpHelperElems.addElement(this.vci.UI512App(), this.elems.cover);
        this.elems.cover.set('style', UI512BtnStyle.Opaque);
        this.elems.cover.set('autohighlight', false);
        let coverx = this.vci.bounds()[0] + ScreenConsts.xAreaWidth;
        let covery = this.vci.bounds()[1];
        let coverw = 10 + this.vci.bounds()[2] - ScreenConsts.xAreaWidth;
        let coverh = 10 + this.vci.bounds()[3];
        this.elems.cover.setDimensions(coverx, covery, coverw, coverh);

        /* a message to the user saying "nyi" */
        let msg = lng('lng(This feature is not yet supported.)');
        let font = new TextFontSpec('geneva', 0, 10);
        msg = UI512DrawText.setFont(msg, font.toSpecString());
        this.elems.nyiMsg = new UI512ElLabel('grpAppHelperElemsNyiMsg');
        grpHelperElems.addElement(this.vci.UI512App(), this.elems.nyiMsg);
        this.elems.nyiMsg.set('visible', false);
        this.elems.nyiMsg.set('labeltext', msg);
        this.elems.nyiMsg.set('labelwrap', true);
        this.elems.nyiMsg.set('labelhalign', true);
        this.elems.nyiMsg.set('labelvalign', true);
        this.elems.nyiMsg.setDimensions(this.elems.cover.x, this.elems.cover.y, this.elems.cover.w, this.elems.cover.h);

        /* a message to the user saying where tutorials are. */
        let s = lng('lngNew? Click here to see how to use ViperCard. (Close).');
        let style = 'biuosdce';
        s = UI512DrawText.setFont(s, `chicago_10_${style}`);
        let lbl = new UI512ElLabel('grpAppHelperElemsShowTutorial');
        grpHelperElems.addElement(this.vci.UI512App(), lbl);
        lbl.set('labelhalign', false);
        lbl.set('labeltext', s);
        lbl.set('w', 318);
        lbl.set('h', 20);
        lbl.set('x', this.vci.bounds()[0] + this.vci.bounds()[2] - lbl.w);
        lbl.set('y', this.vci.bounds()[1] + this.vci.bounds()[3] - lbl.h);
    }
}
