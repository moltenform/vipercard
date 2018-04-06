
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { TextFontSpec } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { PropPanelCompositeBase } from '../../vpcui/panels/vpcEditPanelsBase.js';

export class PropPanelCompositeStack extends PropPanelCompositeBase {
    isPropPanelCompositeStack = true;
    compositeType = 'PropPanelCompositeStack';
    readonly velTypeShortName = '';
    readonly velTypeLongName = '';
    readonly velType = VpcElType.Stack;
    topInputs: [string, string, number][] = [['lngStack Name:', 'name', 190]];
    leftChoices: [string, string][] = [];
    rightOptions: [string, string][] = [];
    fillInValuesTip(app: UI512Application, vel: VpcElBase) {
        let txt = lng('lngRefer to this element in a script as\nthis stack');
        txt = TextRendererFontManager.setInitialFont(txt, new TextFontSpec('monaco', 0, 9).toSpecString());
        this.lblNamingTip.set('labeltext', txt);
    }
}
