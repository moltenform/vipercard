
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { PropPanelCompositeBase } from '../../vpcui/panels/vpceditpanelsbase.js';

export class PropPanelCompositeCard extends PropPanelCompositeBase {
    isPropPanelCompositeCard = true;
    compositeType = 'PropPanelCompositeCard';
    readonly velTypeShortName = 'card';
    readonly velTypeLongName = 'lngcard';
    readonly velType = VpcElType.Card;
    topInputs: [string, string, number][] = [['lngCard Name:', 'name', 190]];
    leftChoices: [string, string][] = [];
    rightOptions: [string, string][] = [];
}
