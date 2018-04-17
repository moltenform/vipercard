
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcEditPanelsBase } from '../../vpcui/panels/vpcEditPanelsBase.js';

/**
 * properties panel, for editing a button's properties
 */
export class VpcEditPanelsBtn extends VpcEditPanelsBase {
    isVpcEditPanelsBtn = true;
    compositeType = 'VpcEditPanelsBtn';
    readonly velTypeShortName = 'cd btn';
    readonly velTypeLongName = 'lngbutton';
    readonly velType = VpcElType.Btn;
    topInputs: [string, string, number][] = [
        ['lngButton Name:', 'name', 190],
        ['lngButton Label:', 'label', 190],
        ['lngIcon:', 'icon', 45]
    ];

    leftChoices: [string, string][] = [
        ['lngOpaque', 'opaque'],
        ['lngRectangle', 'rectangle'],
        ['lngTransparent', 'transparent'],
        ['lngRoundrect', 'roundrect'],
        ['lngShadow', 'shadow'],
        ['lngCheckbox', 'checkbox'],
        ['lngRadio', 'radio'],
        ['lngPlain', 'plain'],
        ['lngOS Standard', 'standard'],
        ['lngOS Default', 'default']
    ];

    rightOptions: [string, string][] = [
        ['lngShow Label', 'showlabel'],
        ['lngAuto Hilite', 'autohilite'],
        ['lngEnabled', 'enabled']
    ];
}
