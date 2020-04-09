
/* auto */ import { VpcElType, VpcTool } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcEditPanelsBase } from './vpcEditPanelsBase';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { TextFontSpec } from './../../ui512/draw/ui512DrawTextClasses';
/* auto */ import { UI512DrawText } from './../../ui512/draw/ui512DrawText';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/**
 * properties panel, for when no object is selected
 */
export class VpcEditPanelsEmpty extends VpcEditPanelsBase {
    compositeType = 'VpcEditPanelsEmpty';
    readonly velTypeShortName = '';
    readonly velTypeLongName = '';
    readonly velType = VpcElType.Unknown;
    topInputs: [string, string, number][] = [];
    leftChoices: [string, string][] = [];
    rightOptions: [string, string][] = [];

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        super.createSpecific(app);

        let s = lng('lngNothing is selected.');
        s = UI512DrawText.setFont(s, new TextFontSpec('monaco', 0, 9).toSpecString());
        this.lblNamingTip.set('labeltext', s);
        this.lblNamingTip.setDimensions(this.lblNamingTip.x, this.lblNamingTip.y + 20, this.lblNamingTip.w, this.lblNamingTip.h);
    }

    /**
     * refresh from model
     */
    refreshFromModel(app: UI512Application) {
        let grp = app.getGroup(this.grpId);
        let btnGenPart = grp.getEl(this.getElId('btnGenPart'));
        let currentTool = this.vci.getOptionN('currentTool');
        let lbl = currentTool === VpcTool.Button ? 'lngMake new button' : 'lngMake new field';
        btnGenPart.set('labeltext', lng(lbl));
    }
}
