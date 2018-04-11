
/* auto */ import { O, makeVpcInternalErr, msgNotification } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcAppUIToolResponseBase } from '../../vpcui/tools/vpcToolBase.js';

export class VpcAppUIToolBrowse extends VpcAppUIToolResponseBase {
    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (isVelOrBg) {
            this.cbScheduleScriptEventSend(d);
        }
    }

    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        if (isVelOrBg) {
            this.cbScheduleScriptEventSend(d);
        }
    }

    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {
        // mouseWithin events are set by onIdle, not here.
    }

    cancelCurrentToolAction() {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        if (el && el.typename === 'UI512ElTextField' && el.get_b('canselecttext')) {
            return UI512Cursors.Arrow;
        } else {
            return UI512Cursors.Hand;
        }
    }

    onDeleteSelection() {
        throw makeVpcInternalErr(msgNotification + lng('lngPlease press Backspace on the keyboard to \ndelete text.'));
    }
}
