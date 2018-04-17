
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcEditPanelsBase } from '../../vpcui/panels/vpcEditPanelsBase.js';

/**
 * properties panel, for editing a card's properties
 */
export class VpcEditPanelsCard extends VpcEditPanelsBase {
    isVpcEditPanelsCard = true;
    compositeType = 'VpcEditPanelsCard';
    readonly velTypeShortName = 'card';
    readonly velTypeLongName = 'lngcard';
    readonly velType = VpcElType.Card;
    topInputs: [string, string, number][] = [['lngCard Name:', 'name', 190]];
    leftChoices: [string, string][] = [];
    rightOptions: [string, string][] = [];
}
