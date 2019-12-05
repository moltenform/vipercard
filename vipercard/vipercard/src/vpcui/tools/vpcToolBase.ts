
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { fitIntoInclusive } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { EventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcPaintRender } from '../../vpcui/modelrender/vpcPaintRender.js';
/* auto */ import { VpcModelRender } from '../../vpcui/modelrender/vpcModelRender.js';

/**
 * base class for VPC tools
 */
export abstract class VpcAppUIToolBase {
    isVpcAppUIToolBase = true;
    vci: VpcStateInterface;
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

    protected getTranslatedCoords(mouseX: number, mouseY: number) {
        /* get coordinates relative to user area */
        let tmouseX =
            fitIntoInclusive(
                mouseX,
                this.vci.userBounds()[0],
                this.vci.userBounds()[0] + this.vci.userBounds()[2] - 1
            ) - this.vci.userBounds()[0];

        let tmouseY =
            fitIntoInclusive(
                mouseY,
                this.vci.userBounds()[1],
                this.vci.userBounds()[1] + this.vci.userBounds()[3] - 1
            ) - this.vci.userBounds()[1];

        return [tmouseX, tmouseY];
    }
}
