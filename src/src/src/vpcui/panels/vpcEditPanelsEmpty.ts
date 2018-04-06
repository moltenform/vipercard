
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { TextFontSpec } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { PropPanelCompositeBase } from '../../vpcui/panels/vpcEditPanelsBase.js';

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
    createSpecific(app: UI512Application) {
        super.createSpecific(app);

        let txt = lng('lngNothing is selected.');
        txt = TextRendererFontManager.setInitialFont(txt, new TextFontSpec('monaco', 0, 9).toSpecString());
        this.lblNamingTip.set('labeltext', txt);
        this.lblNamingTip.setDimensions(
            this.lblNamingTip.x,
            this.lblNamingTip.y + 20,
            this.lblNamingTip.w,
            this.lblNamingTip.h
        );
    }

    refreshFromModel(app: UI512Application) {
        let grp = app.getGroup(this.grpid);
        let btnGenPart = grp.getEl(this.getElId('btnGenPart'));
        let currentTool = this.appli.getOption_n('currentTool');
        let lbl = currentTool === VpcTool.button ? 'lngMake new button' : 'lngMake new field';
        btnGenPart.set('labeltext', lng(lbl));
    }
}
