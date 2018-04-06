
/* auto */ import { O, makeVpcInternalErr, msgNotification } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, cast } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { TextFontSpec } from '../../ui512/draw/ui512drawtextclasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512drawtext.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512elementslabel.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512elementsbutton.js';
/* auto */ import { UI512ElTextField, UI512FldStyle } from '../../ui512/elements/ui512elementstextfield.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512genericfield.js';
/* auto */ import { SelAndEntry } from '../../ui512/textedit/ui512textselect.js';
/* auto */ import { UI512CompBase } from '../../ui512/composites/ui512composites.js';
/* auto */ import { VpcElType, vpcElTypeToString } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcVal, VpcValBool, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcval.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velbase.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcappli.js';
/* auto */ import { IsPropPanel } from '../../vpcui/panels/vpcpanelsbase.js';
/* auto */ import { VpcPanelScriptEditor } from '../../vpcui/panels/vpceditscripteditor.js';

export abstract class PropPanelCompositeBase extends UI512CompBase implements IsPropPanel {
    isPropPanelCompositeBase = true;
    isBlank = false;
    appli: IVpcStateInterface;
    isExclusive = false;
    compositeType = 'PropPanelCompositeBase';
    firstSectionH = 100;
    secondSectionH = 162;
    thirdSectionH = 100;
    cbGetAndValidateSelectedVel: (prp: string) => O<VpcElBase>;
    protected static numeric: { [key: string]: boolean } = { icon: true };
    topInputs: [string, string, number][] = [];

    leftChoices: [string, string][] = [];
    leftChoicesX = 20;
    leftChoicesW = 130;
    leftChoicesH = 117;
    rightOptions: [string, string][] = [];
    rightOptionsX = 216;
    abstract readonly velType: VpcElType;

    lblNamingTip: UI512ElLabel;
    protected refreshTip(name: string, id: string) {
        let shortname = vpcElTypeToString(this.velType, this.appli.lang(), true);
        let longname = vpcElTypeToString(this.velType, this.appli.lang(), false);
        let txt = this.appli.lang().translate('lngRefer to this %typ in a script as');
        txt = txt.replace(/%typ/g, longname);
        txt += `\n${shortname} id ${id}`;
        if (name.length) {
            txt += `\nor\n${shortname} "${name}"`;
        }

        txt = TextRendererFontManager.setInitialFont(txt, new TextFontSpec('monaco', 0, 9).toSpecString());
        this.lblNamingTip.set('labeltext', txt);
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        Util512.freezeProperty(this, 'topInputs');
        Util512.freezeProperty(this, 'leftChoices');
        Util512.freezeProperty(this, 'rightOptions');

        // draw a 1px border around the panel
        let grp = app.getGroup(this.grpid);
        let bg = this.genBtn(app, grp, 'bg');
        bg.set('autohighlight', false);
        bg.setDimensions(this.x, this.y, this.logicalWidth, this.logicalHeight);
        this.createTopInputs(app);
        this.createLeftChoices(app);
        this.createRightOptions(app);
        this.createLowerSection(app);
    }

    createTopInputs(app: UI512Application) {
        const lblX = 16;
        const inputX = 170;
        const inputH = 22;
        const inputMargin = 11;
        let totalUsedH = this.topInputs.length * inputH + (this.topInputs.length - 1) * inputMargin;
        let startY = this.y + Math.floor((this.firstSectionH - totalUsedH) / 2);
        let curY = startY;
        let grp = app.getGroup(this.grpid);
        for (let [lbltxt, inid, inputW] of this.topInputs) {
            let lbl = this.genChild<UI512ElLabel>(app, grp, `lbl##${inid}`, UI512ElLabel);
            lbl.set('labeltext', this.appli.lang().translate(lbltxt));
            lbl.set('labelhalign', false);
            lbl.set('labelvalign', true);
            lbl.setDimensions(this.x + lblX, curY, inputX - lblX, inputH);
            let inp = this.genChild<UI512ElTextField>(app, grp, `inp##${inid}`, UI512ElTextField);
            inp.set('multiline', false);
            inp.set('labelwrap', false);
            inp.set('nudgey', 2);
            inp.setDimensions(this.x + inputX, curY, inputW, inputH);
            curY += inputH + inputMargin;
        }
    }

    createLeftChoices(app: UI512Application) {
        if (!this.leftChoices.length) {
            return;
        }

        let grp = app.getGroup(this.grpid);
        let startY = this.y + this.firstSectionH + Math.floor((this.secondSectionH - this.leftChoicesH) / 2);
        let fld = this.genChild<UI512ElTextField>(app, grp, `leftchoice`, UI512ElTextField);
        fld.set('scrollbar', true);
        fld.set('selectbylines', true);
        fld.set('multiline', true);
        fld.set('canselecttext', true);
        fld.set('canedit', false);
        fld.set('labelwrap', false);
        UI512ElTextField.setListChoices(fld, this.leftChoices.map(item => this.appli.lang().translate(item[0])));
        fld.setDimensions(this.x + this.leftChoicesX, startY, this.leftChoicesW, this.leftChoicesH);
    }

    createRightOptions(app: UI512Application) {
        const inputH = 15;
        const inputMargin = 3;
        let totalUsedH = this.rightOptions.length * inputH + (this.rightOptions.length - 1) * inputMargin;
        let startY = this.y + this.firstSectionH + Math.floor((this.secondSectionH - totalUsedH) / 2);
        let curY = startY;
        let grp = app.getGroup(this.grpid);
        for (let [lbltxt, inid] of this.rightOptions) {
            let inp = this.genBtn(app, grp, `toggle##${inid}`);
            inp.set('style', UI512BtnStyle.checkbox);
            inp.set('labeltext', this.appli.lang().translate(lbltxt));
            inp.set('labelhalign', false);
            inp.set('labelvalign', true);
            inp.setDimensions(this.x + this.rightOptionsX, curY, this.logicalWidth - this.rightOptionsX, inputH);
            curY += inputH + inputMargin;
        }
    }

    createLowerSection(app: UI512Application) {
        let tipsX = this.leftChoicesX + 0;
        let tipsY = this.firstSectionH + this.secondSectionH - 9;
        let grp = app.getGroup(this.grpid);
        this.lblNamingTip = this.genChild<UI512ElLabel>(app, grp, `lbl##tip`, UI512ElLabel);
        this.lblNamingTip.set('labelhalign', false);
        this.lblNamingTip.set('labelvalign', false);
        this.lblNamingTip.setDimensions(
            this.x + tipsX,
            this.y + tipsY,
            this.logicalWidth - tipsX,
            this.logicalHeight - tipsY
        );

        const spaceFromRight = 55;
        const spaceFromBottom = 17;
        const btnW = 68;
        const btnH = 23;
        let scriptBtn = this.genBtn(app, grp, this.isBlank ? 'btnGenPart' : 'btnScript');
        scriptBtn.set('labeltext', this.appli.lang().translate('lngScript...'));
        scriptBtn.set('style', UI512BtnStyle.osstandard);
        scriptBtn.setDimensions(
            this.x + this.logicalWidth - (btnW + spaceFromRight),
            this.y + this.logicalHeight - (btnH + spaceFromBottom),
            btnW,
            btnH
        );

        if (this.isBlank) {
            scriptBtn.setDimensions(scriptBtn.x - 75, scriptBtn.y, scriptBtn.w + 75, scriptBtn.h);
        }
    }

    refreshFromModel(app: UI512Application) {
        let vel = this.cbGetAndValidateSelectedVel('selectedVelId');
        if (!vel) {
            return;
        }

        this.fillInValuesTip(app, vel);
        let grp = app.getGroup(this.grpid);
        for (let [lbltxt, inid, inputW] of this.topInputs) {
            let el = grp.getEl(this.getElId(`inp##${inid}`));
            if (inid === 'fldcontent') {
                el.set('style', UI512FldStyle.transparent);
                el.set('canedit', false);
                el.set('canselecttext', false);
                el.set('h', 50);
                el.set('x', grp.getEl(this.getElId(`inp##name`)).x - 3);
                el.setftxt(
                    FormattedText.newFromUnformatted('To edit text, use the Browse\ntool and click on the field.')
                );
            } else {
                let s = PropPanelCompositeBase.numeric[inid] ? vel.get_n(inid).toString() : vel.get_s(inid);
                el.setftxt(FormattedText.newFromUnformatted(s));
            }
        }

        if (this.leftChoices.length) {
            let styl = vel.getProp('style').readAsString();
            let el = grp.getEl(this.getElId(`leftchoice`));
            let found = this.leftChoices.findIndex(item => item[1].toLowerCase() === styl.toLowerCase());
            if (found !== -1) {
                let wasScroll = el.get_n('scrollamt');
                let gel = new UI512ElTextFieldAsGeneric(cast(el, UI512ElTextField));
                SelAndEntry.selectLineInField(gel, found);
                el.set('scrollamt', wasScroll);
            } else {
                el.set('selcaret', 0);
                el.set('selend', 0);
            }
        }

        for (let [lbltxt, inid] of this.rightOptions) {
            let el = grp.getEl(this.getElId(`toggle##${inid}`));
            let val = vel.getProp(inid);
            el.set('checkmark', val.readAsStrictBoolean());
        }
    }

    fillInValuesTip(app: UI512Application, vel: VpcElBase) {
        this.refreshTip(vel.get_s('name'), vel.id);
    }

    protected saveChangesToModelSetProp(vel: VpcElBase, propname: string, newval: VpcVal, onlyCheckIfDirty: boolean) {
        if (onlyCheckIfDirty) {
            let current = propname === 'name' ? VpcValS(vel.get_s('name')) : vel.getProp(propname);
            if (current.readAsString() !== newval.readAsString()) {
                throw makeVpcInternalErr(msgNotification + VpcPanelScriptEditor.thereArePendingChanges);
            }
        } else {
            vel.setProp(propname, newval);
        }
    }

    saveChangesToModel(app: UI512Application, onlyCheckIfDirty: boolean) {
        let vel = this.cbGetAndValidateSelectedVel('selectedVelId');
        if (!vel) {
            return;
        }

        // if you are adding/removing a button's icon, set font as appropriate
        let grp = app.getGroup(this.grpid);
        let elIcon = grp.findEl(this.getElId(`inp##icon`));
        if (elIcon && vel.getType() === VpcElType.Btn && !onlyCheckIfDirty) {
            let typed = elIcon.get_ftxt().toUnformatted();
            let n = parseInt(typed, 10);
            let nextIcon = isFinite(n) && n >= 0 ? n : 0;
            let curIcon = vel.get_n('icon') || 0;
            if (nextIcon === 0 && curIcon !== 0) {
                vel.set('textfont', 'chicago');
                vel.set('textstyle', 0);
                vel.set('textsize', 12);
            } else if (nextIcon !== 0 && curIcon === 0) {
                vel.set('textfont', 'geneva');
                vel.set('textstyle', 0);
                vel.set('textsize', 9);
            }
        }

        for (let [lbltxt, inid, inputW] of this.topInputs) {
            if (inid === 'fldcontent') {
                continue;
            }

            let el = grp.getEl(this.getElId(`inp##${inid}`));
            let typed = el.get_ftxt().toUnformatted();
            if (PropPanelCompositeBase.numeric[inid]) {
                let n = parseInt(typed, 10);
                n = isFinite(n) && n >= 0 ? n : 0;
                this.saveChangesToModelSetProp(vel, inid, VpcValN(n), onlyCheckIfDirty);
            } else {
                this.saveChangesToModelSetProp(vel, inid, VpcValS(typed), onlyCheckIfDirty);
            }
        }

        if (this.leftChoices.length) {
            let el = grp.getEl(this.getElId(`leftchoice`));
            let gel = new UI512ElTextFieldAsGeneric(cast(el, UI512ElTextField));
            let ln = SelAndEntry.selectByLinesWhichLine(gel);
            if (ln !== undefined && ln >= 0 && ln < this.leftChoices.length) {
                this.saveChangesToModelSetProp(vel, 'style', VpcValS(this.leftChoices[ln][1]), onlyCheckIfDirty);
            }
        }

        for (let [lbltxt, inid] of this.rightOptions) {
            let el = grp.getEl(this.getElId(`toggle##${inid}`));
            let checked = el.get_b('checkmark');
            vel.setProp(inid, VpcValBool(checked));
            this.saveChangesToModelSetProp(vel, inid, VpcValBool(checked), onlyCheckIfDirty);
        }
    }
}
