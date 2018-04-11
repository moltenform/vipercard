
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { EventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcPaintRender } from '../../vpcui/modelrender/vpcPaintRender.js';
/* auto */ import { VpcModelRender } from '../../vpcui/modelrender/vpcModelRender.js';

export abstract class VpcAppUIToolResponseBase {
    isVpcAppUIToolResponseBase = true;
    appli: VpcStateInterface;
    cbModelRender: () => VpcModelRender;
    cbPaintRender: () => VpcPaintRender;
    cbScheduleScriptEventSend: (d: EventDetails) => void;
    constructor(protected bounds: number[], protected userBounds: number[]) {}

    abstract respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void;
    abstract cancelCurrentToolAction(): void;
    abstract whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors;
    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {}
    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {}
    onOpenTool() {}
    onLeaveTool() {}
    onDeleteSelection() {}
}

export class VpcAppUIToolNyi extends VpcAppUIToolResponseBase {
    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {}

    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {}

    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {}

    cancelCurrentToolAction(): void {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.Arrow;
    }
}
