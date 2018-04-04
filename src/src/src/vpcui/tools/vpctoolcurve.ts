
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { ShapeToolState, VpcAppUIToolShape } from '../../vpcui/tools/vpctoolshape.js';

export class VpcAppUIToolCurve extends VpcAppUIToolShape {
    protected drawPartial(cv: CanvasWrapper, st: ShapeToolState, tl: VpcTool, x: number, y: number) {
        // for now, have a simplified curve tool that can only start with horizontal lines.
        // used to have a full two-stage tool, but people were confused by the interface.
        let startx = Math.round(cv.canvas.width / 3);
        let endx = Math.round(2 * cv.canvas.width / 3);
        this.cbPaintRender().drawPartialShape(
            [startx, x, endx],
            [Math.round(cv.canvas.height / 2), y, Math.round(cv.canvas.height / 2)],
            st.elStage,
            st.paStage
        );
    }
}
