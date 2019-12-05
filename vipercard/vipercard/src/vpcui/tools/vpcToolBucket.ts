
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { MouseDownEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcAppUIToolBase } from '../../vpcui/tools/vpcToolBase.js';

export class VpcAppUIToolBucket extends VpcAppUIToolBase {
    /**
     * respond to mouse down event
     */
    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg) {
            return;
        }

        let [tx, ty] = this.getTranslatedCoords(d.mouseX, d.mouseY);
        this.cbPaintRender().commitPaintBucket(tx, ty);
    }

    /**
     * erase any uncommitted partial changes, called by Undo() etc
     */
    cancelCurrentToolAction() {}

    /**
     * which cursor should be shown if the mouse is over el.
     */
    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.Crosshair;
    }
}
