
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512ControllerBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcInterface.js';

export interface IsPropPanel {
    x: number;
    y: number;
    logicalWidth: number;
    logicalHeight: number;
    appli: IVpcStateInterface;
    create(c: UI512ControllerBase, app: UI512Application): void;
    setVisible(app: UI512Application, visible: boolean): void;
    refreshFromModel(app: UI512Application): void;
    saveChangesToModel(app: UI512Application, onlyCheckIfDirty: boolean): void;
    fromFullId(fullid: string): O<string>;
    cbGetAndValidateSelectedVel: (prp: string) => O<VpcElBase>;
}
