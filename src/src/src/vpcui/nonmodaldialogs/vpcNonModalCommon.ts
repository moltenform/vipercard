
/* auto */ import { O, makeVpcInternalErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langBase.js';
/* auto */ import { UI512BeginAsyncSetLabelText, UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512ElementsLabel.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { KeyDownEventDetails, MouseDownEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512ControllerBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { BorderDecorationConsts, UI512CompBase, WndBorderDecorationConsts } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcAppInterfaceLayer } from '../../vpcui/modelrender/vpcPaintRender.js';

// see UI512BeginAsyncSetLabelText

export interface IVpcSaveUtils {
    mnuGoSave(): void;
    mnuGoSave_As(): void;
    mnuGoShareLink(): void;
    mnuGoExportJson(): void;
    mnuGoExportGif(): void;
    mnuGoFlagContent(): void;
    mnuGoExit(destination: string): void;
    busy: boolean;
}

export class VpcAppNonModalDlgHolder extends VpcAppInterfaceLayer {
    appli: IVpcStateInterface;
    c: UI512ControllerBase;
    current: O<VpcFormNonModalDialogBase>;
    setNonModalDialog(frm: O<UI512CompBase>) {
        if (this.current) {
            this.current.destroy(this.c, this.appli.UI512App());
            this.current = undefined;
        }

        if (frm && frm instanceof VpcFormNonModalDialogBase) {
            frm.create(this.c, this.appli.UI512App(), this.appli.lang());
            this.current = frm;
        } else if (frm) {
            throw makeVpcInternalErr('expected VpcFormNonModalDialogBase.');
        }
    }

    init(c: UI512ControllerBase) {}

    updateUI512Els() {}

    respondMouseUp(d: MouseUpEventDetails) {
        if (this.current) {
            if (d.elClick) {
                let short = this.current.fromFullId(d.elClick.id);
                if (short === 'caption') {
                    // clicked the close box
                    this.current.destroy(this.c, this.appli.UI512App());
                    this.current = undefined;
                } else if (short) {
                    this.current.onClickBtn(short, d.elClick, this.appli);
                }
            }
        }
    }

    respondMouseDown(d: MouseDownEventDetails) {
        if (this.current) {
            if (d.el) {
                let short = this.current.fromFullId(d.el.id);
                if (short) {
                    this.current.onMouseDown(short, d.el, this.appli);
                }
            }
        }
    }

    respondKeyDown(d: KeyDownEventDetails) {
        if (this.current) {
            let focused = this.appli.getCurrentFocus();
            this.current.onKeyDown(focused, focused ? this.current.fromFullId(focused) : undefined, d);
        }
    }
}

export abstract class VpcFormNonModalDialogBase extends UI512CompBase {
    abstract onClickBtn(short: string, el: UI512Element, appli: IVpcStateInterface): void;
    abstract onMouseDown(short: string, el: UI512Element, appli: IVpcStateInterface): void;
    onKeyDown(elid: O<string>, short: O<string>, d: KeyDownEventDetails): void {}
}

export abstract class VpcFormNonModalDialogFormBase extends VpcFormNonModalDialogBase {
    fields: [string, string, number][] = [];
    btns: [string, string][] = [];
    compositeType = 'VpcFormNonModalDialogFormBase';
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

    static standardWindowBounds(me: UI512CompBase, appli: IVpcStateInterface) {
        me.x = appli.userBounds()[0];
        me.y = appli.userBounds()[1] + 32;
        me.logicalWidth = appli.userBounds()[2] + 2;
        me.logicalHeight = appli.userBounds()[3] - (me.y - appli.userBounds()[1]);
    }

    static largeWindowBounds(me: UI512CompBase, appli: IVpcStateInterface) {
        me.x = appli.userBounds()[0];
        me.y = appli.bounds()[1] + 3;
        me.logicalWidth = appli.bounds()[2];
        me.logicalHeight = appli.bounds()[3] - (me.y - appli.bounds()[1]);
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        let grp = app.getGroup(this.grpid);
        let headheight = 0;
        if (this.showHeader) {
            headheight = this.drawWindowDecoration(app, this.decorations, this.hasCloseBtn) - 1;
            let caption = grp.getEl(this.getElId('caption'));
            caption.set('labeltext', lang.translate(this.captionText));
        }

        let bg = this.genBtn(app, grp, 'bg');
        bg.set('autohighlight', false);
        bg.set('style', this.showHeader ? UI512BtnStyle.rectangle : UI512BtnStyle.opaque);
        bg.setDimensions(this.x, this.y + headheight, this.logicalWidth, this.logicalHeight - headheight);

        const fldVerticalMargin = 5;
        const totalWidthForCenter = this.lblWidth + this.fldWidth + this.lblMarginSpace;
        const totalHeightForCenter =
            this.fields.length * fldVerticalMargin + this.fields.map(t => t[2] * this.fldHeight).reduce(Util512.add);
        const startx = this.x + Math.round((this.logicalWidth - totalWidthForCenter) / 2);
        const starty = this.y + Math.round((this.logicalHeight - totalHeightForCenter) / 2);
        let curx;
        let cury = starty;
        for (let [fldId, fldUntransed, heightMult] of this.fields) {
            let h = heightMult * this.fldHeight;
            curx = startx;

            let lbl = this.genChild<UI512ElLabel>(app, grp, 'lblFor' + fldId, UI512ElLabel);
            lbl.setDimensions(curx, cury, this.lblWidth, h);
            lbl.set('labeltext', lang.translate(fldUntransed));
            curx += this.lblWidth + this.lblMarginSpace;

            let rght = this.genChild<UI512ElTextField>(app, grp, 'fld' + fldId, UI512ElTextField);
            rght.setDimensions(curx, cury, this.fldWidth, h);
            rght.set('style', UI512FldStyle.rectangle);
            rght.set('multiline', heightMult > 1);
            rght.set('nudgey', 2);

            if (this.fieldsThatAreLabels[fldId]) {
                lbl.setDimensionsX1Y1(lbl.x, lbl.y, rght.right, rght.bottom + fldVerticalMargin);
                rght.set('visible', false);
            }

            cury += h + fldVerticalMargin;
        }

        cury += fldVerticalMargin * 2;
        curx = startx + totalWidthForCenter - 90;
        this.drawBtn(app, grp, 0, curx, cury, 69, 29, lang);
        curx -= 69 + this.lblMarginSpace * 2;
        this.drawBtn(app, grp, 1, curx, cury + 4, 68, 21, lang);
        curx -= 68 + this.lblMarginSpace * 2;
        this.drawBtn(app, grp, 2, curx, cury + 4, 68, 21, lang);

        curx = startx;
        cury += 30;

        this.lblStatus = this.genChild<UI512ElLabel>(app, grp, 'lblStatusOfForm', UI512ElLabel);
        this.lblStatus.setDimensionsX1Y1(curx, cury, this.x + this.logicalWidth - 1, cury + 27);
    }

    protected readFields(app: UI512Application, trim = true) {
        let ret: { [key: string]: string } = {};
        let grp = app.getGroup(this.grpid);
        for (let [fldId, fldUntransed, heightMult] of this.fields) {
            let el = grp.getEl(this.getElId('fld' + fldId));
            ret[fldId] = el.get_ftxt().toUnformatted();
            if (trim) {
                ret[fldId] = ret[fldId].trim();
            }
        }

        return ret;
    }

    setStatus(lang: UI512Lang, s: string) {
        if (this.lblStatus) {
            s = s.replace(/\r\n/g, '').replace(/\n/g, '');
            if (!s.endsWith('.')) {
                s += '.';
            }

            this.lblStatus.set('labeltext', lang.translate(s));
        }
    }

    onMouseDown(short: string, el: UI512Element, appli: IVpcStateInterface): void {}

    protected drawBtn(
        app: UI512Application,
        grp: UI512ElGroup,
        n: number,
        x: number,
        y: number,
        w: number,
        h: number,
        lang: UI512Lang
    ) {
        if (this.btns[n]) {
            let btn = this.genBtn(app, grp, `btn${this.btns[n][0]}`);
            btn.set('style', n === 0 ? UI512BtnStyle.osdefault : UI512BtnStyle.osstandard);
            btn.set('autohighlight', true);
            btn.set('labeltext', lang.translate(this.btns[n][1]));
            btn.setDimensions(x, y, w, h);
        }
    }
}
