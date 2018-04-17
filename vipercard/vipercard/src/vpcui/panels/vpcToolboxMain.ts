
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512CompToolbox } from '../../ui512/composites/ui512Toolbox.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { ToolboxDims } from '../../vpcui/panels/vpcToolboxPatterns.js';

/**
 * the main tool palette
 */
export class VpcToolboxMain extends UI512CompToolbox {
    compositeType = 'toolbox_main';

    /**
     * initialize layout
     */
    static layout(toolsMain: VpcToolboxMain, vci: VpcStateInterface) {
        toolsMain.iconH = ToolboxDims.IconH;
        toolsMain.widthOfIcon = (id: string) => {
            return ToolboxDims.MainW;
        };

        toolsMain.items = [
            ['Browse', 0],
            ['Button', 1],
            ['Field', 17],
            ['Select', 2],
            ['Brush', 5],
            ['Bucket', 11],
            ['Pencil', 4],
            ['Line', 7],
            ['Lasso', 3],
            ['Eraser', 6],
            ['Rect', 9],
            ['Oval', 12],
            ['Roundrect', 10],
            ['Curve', 13],
            ['Stamp', 97],
            ['Spray', 8]
        ];

        assertEq(16, toolsMain.items.length, '6y|');
        toolsMain.logicalWidth = toolsMain.items.length * ToolboxDims.MainW - (toolsMain.items.length - 1);
        toolsMain.logicalHeight = 1;
        toolsMain.hasCloseBtn = false;
        toolsMain.create(vci.getPresenter(), vci.UI512App());
        toolsMain.setWhich(vci.UI512App(), 'Browse');

        toolsMain.logicalHeight = ToolboxDims.ToolbarHeight;
        return [toolsMain.x, toolsMain.y];
    }
}
