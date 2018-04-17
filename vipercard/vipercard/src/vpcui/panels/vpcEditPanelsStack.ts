
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { TextFontSpec } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcEditPanelsBase } from '../../vpcui/panels/vpcEditPanelsBase.js';

/**
 * properties panel, for editing a stack's properties
 */
export class VpcEditPanelsStack extends VpcEditPanelsBase {
    isVpcEditPanelsStack = true;
    compositeType = 'VpcEditPanelsStack';
    readonly velTypeShortName = '';
    readonly velTypeLongName = '';
    readonly velType = VpcElType.Stack;
    topInputs: [string, string, number][] = [['lngStack Name:', 'name', 190]];
    leftChoices: [string, string][] = [];
    rightOptions: [string, string][] = [];

    /**
     * you should refer to a stack as 'this stack' rather than by name or id
     */
    fillInValuesTip(app: UI512Application, vel: VpcElBase) {
        let txt = lng('lngRefer to this element in a script as\nthis stack');
        txt = UI512DrawText.setFont(txt, new TextFontSpec('monaco', 0, 9).toSpecString());
        this.lblNamingTip.set('labeltext', txt);
    }
}
