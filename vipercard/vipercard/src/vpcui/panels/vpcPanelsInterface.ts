
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512PresenterBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';

/**
 * a property panel is a window on the right side of the screen,
 * for editing vel properties.
 */
export interface VpcEditPanels {
    x: number;
    y: number;
    logicalWidth: number;
    logicalHeight: number;
    vci: VpcStateInterface;
    create(pr: UI512PresenterBase, app: UI512Application): void;
    setVisible(app: UI512Application, visible: boolean): void;
    refreshFromModel(app: UI512Application): void;
    saveChangesToModel(app: UI512Application, onlyCheckIfDirty: boolean): void;
    fromFullId(fullId: string): O<string>;
    cbGetAndValidateSelectedVel: (prp: string) => O<VpcElBase>;
    showOrHideBgSpecific(app: UI512Application, isBgPart:boolean):void
}
