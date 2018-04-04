
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { TextFontSpec } from '../../ui512/draw/ui512drawtextclasses.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512drawtext.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { VpcElType, VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { PropPanelCompositeBase } from '../../vpcui/panels/vpceditpanelsbase.js';

export class PropPanelCompositeBlank extends PropPanelCompositeBase {
    isPropPanelCompositeBlank = true;
    isBlank = true;
    compositeType = 'PropPanelCompositeBlank';
    readonly velTypeShortName = '';
    readonly velTypeLongName = '';
    readonly velType = VpcElType.Unknown;
    topInputs: [string, string, number][] = [];
    leftChoices: [string, string][] = [];
    rightOptions: [string, string][] = [];
    createSpecific(app: UI512Application, lang: UI512Lang) {
        super.createSpecific(app, lang);

        let txt = this.appli.lang().translate('lngNothing is selected.');
        txt = TextRendererFontManager.setInitialFont(txt, new TextFontSpec('monaco', 0, 9).toSpecString());
        this.lblNamingTip.set('labeltext', txt);
        this.lblNamingTip.setDimensions(
            this.lblNamingTip.x,
            this.lblNamingTip.y + 20,
            this.lblNamingTip.w,
            this.lblNamingTip.h
        );
    }

    refreshFromModel(root: Root, app: UI512Application) {
        let grp = app.getGroup(this.grpid);
        let btnGenPart = grp.getEl(this.getElId('btnGenPart'));
        let currentTool = this.appli.getOption_n('currentTool');
        let lbl = currentTool === VpcTool.button ? 'lngMake new button' : 'lngMake new field';
        btnGenPart.set('labeltext', this.appli.lang().translate(lbl));
    }
}
