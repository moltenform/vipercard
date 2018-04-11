
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { PropPanelCompositeBase } from '../../vpcui/panels/vpcEditPanelsBase.js';

export class PropPanelCompositeField extends PropPanelCompositeBase {
    isPropPanelCompositeField = true;
    compositeType = 'PropPanelCompositeField';
    readonly velTypeShortName = 'cd fld';
    readonly velTypeLongName = 'lngfield';
    readonly velType = VpcElType.Fld;
    topInputs: [string, string, number][] = [
        ['lngField Name:', 'name', 190],
        ['lngField Contents:', 'fldcontent', 205]
    ];

    leftChoices: [string, string][] = [
        ['lngRectangle', 'rectangle'],
        ['lngScrolling', 'scrolling'],
        ['lngShadow', 'shadow'],
        ['lngOpaque', 'opaque'],
        ['lngTransparent', 'transparent']
    ];

    rightOptions: [string, string][] = [
        ['lngLock Text', 'locktext'],
        ["lngDon't Wrap", 'dontwrap'],
        ['lngSingle Line', 'singleline'],
        ['lngEnabled', 'enabled']
    ];
}
