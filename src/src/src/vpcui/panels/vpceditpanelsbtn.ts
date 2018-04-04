
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { PropPanelCompositeBase } from '../../vpcui/panels/vpceditpanelsbase.js';

export class PropPanelCompositeBtn extends PropPanelCompositeBase {
    isPropPanelCompositeBtn = true;
    compositeType = 'PropPanelCompositeBtn';
    readonly velTypeShortName = 'cd btn';
    readonly velTypeLongName = 'lngbutton';
    readonly velType = VpcElType.Btn;
    topInputs: [string, string, number][] = [
        ['lngButton Name:', 'name', 190],
        ['lngButton Label:', 'label', 190],
        ['lngIcon:', 'icon', 45],
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
        ['lngOS Default', 'default'],
    ];

    rightOptions: [string, string][] = [
        ['lngShow Label', 'showlabel'],
        ['lngAuto Hilite', 'autohilite'],
        ['lngEnabled', 'enabled'],
    ];
}
