
/* auto */ import { VpcStateInterface, VpcUILayer } from './../state/vpcInterface';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { Util512 } from './../../ui512/utils/util512';
/* auto */ import { UI512PresenterBase } from './../../ui512/presentation/ui512PresenterBase';
/* auto */ import { KeyDownEventDetails, MouseDownEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElTextField, UI512FldStyle } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { UI512ElLabel } from './../../ui512/elements/ui512ElementLabel';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512BtnStyle } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { BorderDecorationConsts, UI512CompBase, WndBorderDecorationConsts } from './../../ui512/composites/ui512Composites';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * a UI layer that holds a non-modal window
 * there can only be one non-modal window active at any given time
 * non-modal windows are usually shown on the left of the screen,
 * particularly we want the script reference + script editor to both be visible
 */
export class VpcLyrNonModalHolder extends VpcUILayer {
    vci: VpcStateInterface;
    pr: UI512PresenterBase;
    current: O<VpcNonModalBase>;
    init(pr: UI512PresenterBase) {}
    updateUI512Els() {}

    /**
     * open this non-modal window,
     * and close any other non-modal window
     */
    setNonModalDialog(form: O<UI512CompBase>) {
        if (this.current) {
            this.current.destroy(this.pr, this.vci.UI512App());
            this.current = undefined;
        }

        if (form && form instanceof VpcNonModalBase) {
            form.create(this.pr, this.vci.UI512App());
            this.current = form;
        } else if (form) {
            throw makeVpcInternalErr('KY|expected VpcFormNonModalDialogBase.');
        }
    }

    /**
     * route mouseup to the dialog
     */
    respondMouseUp(d: MouseUpEventDetails) {
        if (this.current) {
            if (d.elClick) {
                let short = this.current.fromFullId(d.elClick.id);
                if (short === 'caption') {
                    /* clicked the close box */
                    this.current.destroy(this.pr, this.vci.UI512App());
                    this.current = undefined;
                } else if (short) {
                    this.current.onClickBtn(short, d.elClick, this.vci);
                }
            }
        }
    }

    /**
     * route mousedown to the dialog
     */
    respondMouseDown(d: MouseDownEventDetails) {
        if (this.current) {
            if (d.el) {
                let short = this.current.fromFullId(d.el.id);
                if (short) {
                    this.current.onMouseDown(short, d.el, this.vci);
                }
            }
        }
    }

    /**
     * route keydown to the dialog
     */
    respondKeyDown(d: KeyDownEventDetails) {
        if (this.current) {
            let focused = this.vci.getCurrentFocus();
            let el = focused ? this.current.fromFullId(focused) : undefined;
            this.current.onKeyDown(focused, el, d);
        }
    }
}

/**
 * base class for nonmodal windows
 */
export abstract class VpcNonModalBase extends UI512CompBase {
    abstract onClickBtn(short: string, el: UI512Element, vci: VpcStateInterface): void;
    abstract onMouseDown(short: string, el: UI512Element, vci: VpcStateInterface): void;
    onKeyDown(elId: O<string>, short: O<string>, d: KeyDownEventDetails): void {}
}

/**
 * drawing a form, with inputs, labels, and buttons
 */
export abstract class VpcNonModalFormBase extends VpcNonModalBase {
    fields: [string, string, number][] = [];
    btns: [string, string][] = [];
    compositeType = 'VpcNonModalFormBase';
    logicalWidth = 1;
    logicalHeight = 1;
    fldHeight = 22;
    fldWidth = 180;
    lblWidth = 100;
    lblMarginSpace = 5;
    showHeader = false;
    hasCloseBtn = false;
    captionText = '';
    lblStatus: O<UI512ElLabel>;
    fieldsThatAreLabels: { [key: string]: boolean } = {};
    decorations: BorderDecorationConsts = new WndBorderDecorationConsts();

    /**
     * set window bounds to the 'userarea' in the left half of the screen
     */
    static standardWindowBounds(me: UI512CompBase, vci: VpcStateInterface) {
        me.x = vci.userBounds()[0];
        me.y = vci.userBounds()[1] + 32;
        me.logicalWidth = vci.userBounds()[2] + 2;
        me.logicalHeight = vci.userBounds()[3] - (me.y - vci.userBounds()[1]);
    }

    /**
     * set window bounds to cover most of the screen
     */
    static largeWindowBounds(me: UI512CompBase, vci: VpcStateInterface) {
        me.x = vci.userBounds()[0];
        me.y = vci.bounds()[1] + 3;
        me.logicalWidth = vci.bounds()[2];
        me.logicalHeight = vci.bounds()[3] - (me.y - vci.bounds()[1]);
    }

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        let grp = app.getGroup(this.grpId);
        this.createHeaderAndBg(app, grp);

        const fldVerticalMargin = 5;
        const totalWidthForCenter = this.lblWidth + this.fldWidth + this.lblMarginSpace;
        const totalHeightForCenter =
            this.fields.length * fldVerticalMargin + this.fields.map(t => t[2] * this.fldHeight).reduce(Util512.add);
        const startX = this.x + Math.round((this.logicalWidth - totalWidthForCenter) / 2);
        const startY = this.y + Math.round((this.logicalHeight - totalHeightForCenter) / 2);
        let curX;
        let curY = startY;
        for (let [fldId, fldUntransed, heightMult] of this.fields) {
            curY = this.createFormFld(heightMult, curX, startX, app, grp, fldId, curY, fldUntransed, fldVerticalMargin);
        }

        curY += fldVerticalMargin * 2;
        curX = startX + totalWidthForCenter - 90;
        this.drawBtn(app, grp, 0, curX, curY, 69, 29);
        curX -= 69 + this.lblMarginSpace * 2;
        this.drawBtn(app, grp, 1, curX, curY + 4, 68, 21);
        curX -= 68 + this.lblMarginSpace * 2;
        this.drawBtn(app, grp, 2, curX, curY + 4, 68, 21);

        curX = startX;
        curY += 30;

        this.lblStatus = this.genChild<UI512ElLabel>(app, grp, 'lblStatusOfForm', UI512ElLabel);
        this.lblStatus.setDimensionsX1Y1(curX, curY, this.x + this.logicalWidth - 1, curY + 27);
    }

    /**
     * draw header and background (an opaque background to cover the card paint below)
     */
    protected createHeaderAndBg(app: UI512Application, grp: UI512ElGroup) {
        let headHeight = 0;
        if (this.showHeader) {
            headHeight = this.drawWindowDecoration(app, this.decorations, this.hasCloseBtn) - 1;
            let caption = grp.getEl(this.getElId('caption'));
            caption.set('labeltext', lng(this.captionText));
        }

        let bg = this.genBtn(app, grp, 'bg');
        bg.set('autohighlight', false);
        bg.set('style', this.showHeader ? UI512BtnStyle.Rectangle : UI512BtnStyle.Opaque);
        bg.setDimensions(this.x, this.y + headHeight, this.logicalWidth, this.logicalHeight - headHeight);
    }

    /**
     * draw a field in the form, and its label
     */
    protected createFormFld(
        heightMult: number,
        curX: any,
        startX: number,
        app: UI512Application,
        grp: UI512ElGroup,
        fldId: string,
        curY: number,
        fldUntransed: string,
        fldVerticalMargin: number
    ) {
        let h = heightMult * this.fldHeight;
        curX = startX;
        let lbl = this.genChild<UI512ElLabel>(app, grp, 'lblFor' + fldId, UI512ElLabel);
        lbl.setDimensions(curX, curY, this.lblWidth, h);
        lbl.set('labeltext', lng(fldUntransed));
        curX += this.lblWidth + this.lblMarginSpace;
        let rght = this.genChild<UI512ElTextField>(app, grp, 'fld' + fldId, UI512ElTextField);
        rght.setDimensions(curX, curY, this.fldWidth, h);
        rght.set('style', UI512FldStyle.Rectangle);
        rght.set('multiline', heightMult > 1);
        rght.set('nudgey', 2);
        if (this.fieldsThatAreLabels[fldId]) {
            /* instead of having an entry box, this is
            a wide label that uses the space where the entry box would be */
            lbl.setDimensionsX1Y1(lbl.x, lbl.y, rght.right, rght.bottom + fldVerticalMargin);
            rght.set('visible', false);
        }

        curY += h + fldVerticalMargin;
        return curY;
    }

    /**
     * read all strings out of the UI, for convenience
     */
    readFields(app: UI512Application, trim = true) {
        let ret: { [key: string]: string } = {};
        let grp = app.getGroup(this.grpId);
        for (let [fldId, fldUntransed, heightMult] of this.fields) {
            let el = grp.getEl(this.getElId('fld' + fldId));
            ret[fldId] = el.getFmTxt().toUnformatted();
            if (trim) {
                ret[fldId] = ret[fldId].trim();
            }
        }

        return ret;
    }

    /**
     * show a status message at the bottom
     */
    setStatus(s: string) {
        if (this.lblStatus) {
            s = s.replace(/\r\n/g, '').replace(/\n/g, '');
            if (!s.endsWith('.')) {
                s += '.';
            }

            this.lblStatus.set('labeltext', lng(s));
        }
    }

    /**
     * don't need to respond to mousedown
     */
    onMouseDown(short: string, el: UI512Element, vci: VpcStateInterface): void {}

    /**
     * draw one of the OK or Cancel buttons at the bottom
     */
    protected drawBtn(app: UI512Application, grp: UI512ElGroup, n: number, x: number, y: number, w: number, h: number) {
        if (this.btns[n]) {
            let btn = this.genBtn(app, grp, `btn${this.btns[n][0]}`);
            btn.set('style', n === 0 ? UI512BtnStyle.OSDefault : UI512BtnStyle.OSStandard);
            btn.set('autohighlight', true);
            btn.set('labeltext', lng(this.btns[n][1]));
            btn.setDimensions(x, y, w, h);
        }
    }
}
