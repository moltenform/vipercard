
/* auto */ import { VpcElType } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcEditPanelsBase } from './vpcEditPanelsBase';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { TextFontSpec } from './../../ui512/drawtext/ui512DrawTextClasses';
/* auto */ import { UI512DrawText } from './../../ui512/drawtext/ui512DrawText';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * properties panel, for editing a stack's properties
 */
export class VpcEditPanelsStack extends VpcEditPanelsBase {
    compositeType = 'VpcEditPanelsStack';
    readonly velTypeShortName = '';
    readonly velTypeLongName = '';
    readonly velType = VpcElType.Stack;
    topInputs: [string, string, number][] = [['lngStack Name:', 'name', 190]];
    leftChoices: [string, string][] = [];
    rightOptions: [string, string, boolean][] = [];

    /**
     * you should refer to a stack as 'this stack' rather than by name or id
     */
    fillInValuesTip(app: UI512Application, vel: VpcElBase) {
        let txt = lng('lngRefer to the current stack in a script as\nthis stack');
        txt = UI512DrawText.setFont(txt, new TextFontSpec('monaco', 0, 9).toSpecString());
        this.lblNamingTip.set('labeltext', txt);
    }
}
