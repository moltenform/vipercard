
/* auto */ import { VpcElType } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcEditPanelsBase } from './vpcEditPanelsBase';

/**
 * properties panel, for editing a field's properties
 */
export class VpcEditPanelsField extends VpcEditPanelsBase {
    isVpcEditPanelsField = true;
    compositeType = 'VpcEditPanelsField';
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
        ['lngEnabled', 'enabled'],
        ['lngShare Text', 'sharedtext']
    ];
}
