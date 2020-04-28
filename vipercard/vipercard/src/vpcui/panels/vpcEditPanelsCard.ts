
/* auto */ import { VpcElType } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcEditPanelsBase } from './vpcEditPanelsBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * properties panel, for editing a card's properties
 */
export class VpcEditPanelsCard extends VpcEditPanelsBase {
    compositeType = 'VpcEditPanelsCard';
    readonly velTypeShortName = 'card';
    readonly velTypeLongName = 'lngcard';
    readonly velType = VpcElType.Card;
    topInputs: [string, string, number][] = [['lngCard Name:', 'name', 190]];
    leftChoices: [string, string][] = [];
    rightOptions: [string, string, boolean][] = [];
}
