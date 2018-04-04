
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { EventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcappli.js';
/* auto */ import { VpcPaintRender } from '../../vpcui/modelrender/vpcpaintrender.js';
/* auto */ import { VpcModelRender } from '../../vpcui/modelrender/vpcmodelrender.js';

export abstract class VpcAppUIToolResponseBase {
    isVpcAppUIToolResponseBase = true;
    appli: IVpcStateInterface;
    cbModelRender: () => VpcModelRender;
    cbPaintRender: () => VpcPaintRender;
    cbScheduleScriptEventSend: (d: EventDetails) => void;
    constructor(protected bounds: number[], protected userBounds: number[], protected lang: UI512Lang) {}

    abstract respondMouseDown(root: Root, tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void;
    abstract cancelCurrentToolAction(): void;
    abstract whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors;
    respondMouseMove(root: Root, tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {}
    respondMouseUp(root: Root, tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {}
    onOpenTool(root: Root) {}
    onLeaveTool(root: Root) {}
    onDeleteSelection() {}
}

export class VpcAppUIToolNyi extends VpcAppUIToolResponseBase {
    respondMouseDown(root: Root, tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {}

    respondMouseMove(root: Root, tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {}

    respondMouseUp(root: Root, tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {}

    cancelCurrentToolAction(): void {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.arrow;
    }
}
