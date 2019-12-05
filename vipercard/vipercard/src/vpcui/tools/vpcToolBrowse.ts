
/* auto */ import { VpcAppUIToolBase } from './vpcToolBase';
/* auto */ import { VpcTool } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { UI512Cursors } from './../../ui512/utils/utilsCursors';
/* auto */ import { msgNotification } from './../../ui512/utils/util512Productname';
/* auto */ import { O, makeVpcInternalErr } from './../../ui512/utils/util512Assert';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/**
 * browse tool
 */
export class VpcAppUIToolBrowse extends VpcAppUIToolBase {
    /**
     * respond to mouse down event
     */
    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (isVelOrBg) {
            this.cbScheduleScriptEventSend(d);
        }
    }

    /**
     * respond to mouse up event
     */
    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        if (isVelOrBg) {
            this.cbScheduleScriptEventSend(d);
        }
    }

    /**
     * respond to mouse move event
     * mouseWithin events are scheduled by onIdle, not here.
     */
    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean): void {}

    /**
     * erase any uncommitted partial changes, called by Undo() etc
     */
    cancelCurrentToolAction() {}

    /**
     * which cursor should be shown if the mouse is over el.
     */
    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        if (el && el.typename === 'UI512ElTextField' && el.getB('canselecttext')) {
            /* change the cursor if you can edit text in a field */
            return UI512Cursors.Arrow;
        } else {
            /* otherwise, use the default hand cursor */
            return UI512Cursors.Hand;
        }
    }

    /**
     * respond to backspace and edit->clear
     */
    onDeleteSelection() {
        throw makeVpcInternalErr(
            msgNotification +
                lng('lngPlease press Backspace on the keyboard to \ndelete text.')
        );
    }
}
