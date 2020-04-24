
/* auto */ import { VpcAppUIToolBase } from './vpcToolBase';
/* auto */ import { VpcTool, checkThrowNotifyMsg } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { UI512Cursors } from './../../ui512/utils/utilsCursors';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
            return UI512Cursors.arrow;
        } else {
            /* otherwise, use the default hand cursor */
            return UI512Cursors.hand;
        }
    }

    /**
     * respond to backspace and edit->clear
     */
    onDeleteSelection() {
        checkThrowNotifyMsg(false, 'UO|Please press Backspace on the keyboard to \ndelete text.');
    }
}
