
/* auto */ import { O, makeVpcInternalErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcAppUIToolResponseBase } from '../../vpcui/tools/vpctoolbase.js';

export class VpcAppUIToolBrowse extends VpcAppUIToolResponseBase {
    respondMouseDown(root: Root, tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (isVelOrBg) {
            this.cbScheduleScriptEventSend(d);
        }
    }

    respondMouseUp(root: Root, tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        if (isVelOrBg) {
            this.cbScheduleScriptEventSend(d);
        }
    }

    respondMouseMove(root: Root, tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {
        // mouseWithin events are set by onIdle, not here.
    }

    cancelCurrentToolAction() {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        if (el && el.typeName === 'UI512ElTextField' && el.get_b('canselecttext')) {
            return UI512Cursors.arrow;
        } else {
            return UI512Cursors.hand;
        }
    }

    onDeleteSelection() {
        throw makeVpcInternalErr(
            'Simple Notification: ' +
                this.appli.lang().translate('lngPlease press Backspace on the keyboard to \ndelete text.')
        );
    }
}
