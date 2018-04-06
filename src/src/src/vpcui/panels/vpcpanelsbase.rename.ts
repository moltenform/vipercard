
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { UI512ControllerBase } from '../../ui512/presentation/ui512presenterbase.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velbase.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcappli.js';

export interface IsPropPanel {
    x: number;
    y: number;
    logicalWidth: number;
    logicalHeight: number;
    appli: IVpcStateInterface;
    create(c: UI512ControllerBase, app: UI512Application, lang: UI512Lang): void;
    setVisible(app: UI512Application, visible: boolean): void;
    refreshFromModel(root: Root, app: UI512Application): void;
    saveChangesToModel(root: Root, app: UI512Application, onlyCheckIfDirty: boolean): void;
    fromFullId(fullid: string): O<string>;
    cbGetAndValidateSelectedVel: (prp: string) => O<VpcElBase>;
}
