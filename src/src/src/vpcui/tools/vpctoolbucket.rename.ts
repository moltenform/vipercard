
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { MouseDownEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcAppUIToolResponseBase } from '../../vpcui/tools/vpctoolbase.js';

export class VpcAppUIToolBucket extends VpcAppUIToolResponseBase {
    respondMouseDown(root: Root, tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        if (!isVelOrBg) {
            return;
        }
        let tmousex =
            fitIntoInclusive(
                d.mouseX,
                this.appli.userBounds()[0],
                this.appli.userBounds()[0] + this.appli.userBounds()[2] - 1
            ) - this.appli.userBounds()[0];
        let tmousey =
            fitIntoInclusive(
                d.mouseY,
                this.appli.userBounds()[1],
                this.appli.userBounds()[1] + this.appli.userBounds()[3] - 1
            ) - this.appli.userBounds()[1];
        this.cbPaintRender().commitPaintBucket(tmousex, tmousey);
    }

    cancelCurrentToolAction(): void {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.crosshair;
    }
}
