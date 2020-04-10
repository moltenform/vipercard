
/* auto */ import { ToolboxDims } from './vpcToolboxPatterns';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { assertEq } from './../../ui512/utils/util512';
/* auto */ import { UI512CompToolbox } from './../../ui512/composites/ui512Toolbox';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * the main tool palette
 */
export class VpcToolboxMain extends UI512CompToolbox {
    compositeType = 'ToolboxMain';

    /**
     * initialize layout
     */
    static layout(toolsMain: VpcToolboxMain, vci: VpcStateInterface) {
        toolsMain.iconH = ToolboxDims.IconH;
        toolsMain.widthOfIcon = (id: string) => {
            return ToolboxDims.MainW;
        };

        toolsMain.items = [
            ['browse', 0],
            ['button', 1],
            ['field', 17],
            ['select', 2],
            ['brush', 5],
            ['bucket', 11],
            ['pencil', 4],
            ['line', 7],
            ['lasso', 3],
            ['eraser', 6],
            ['rect', 9],
            ['oval', 12],
            ['roundrect', 10],
            ['curve', 13],
            ['stamp', 97],
            ['spray', 8]
        ];

        assertEq(16, toolsMain.items.length, '6y|');
        toolsMain.logicalWidth = toolsMain.items.length * ToolboxDims.MainW - (toolsMain.items.length - 1);
        toolsMain.logicalHeight = 1;
        toolsMain.hasCloseBtn = false;
        toolsMain.create(vci.getPresenter(), vci.UI512App());
        toolsMain.setWhich(vci.UI512App(), 'browse');

        toolsMain.logicalHeight = ToolboxDims.ToolbarHeight;
        return [toolsMain.x, toolsMain.y];
    }
}
