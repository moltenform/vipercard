
/* auto */ import { assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512CompToolbox } from '../../ui512/composites/ui512Toolbox.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { ToolboxDims } from '../../vpcui/panels/vpcToolboxPatterns.js';

export class MainToolbox extends UI512CompToolbox {
    compositeType = 'toolbox_main';
    respondMouseUp(app: UI512Application, d: MouseUpEventDetails) {
        if (d.elClick) {
            let short = this.fromFullId(d.elClick.id);
            if (short === 'closebtn') {
                // todo: closing the main toolbox enters fullscreen mode
            }
        }

        super.respondMouseUp(app, d);
    }

    static layout(toolsmain: MainToolbox, appli: VpcStateInterface) {
        toolsmain.iconH = ToolboxDims.IconH;
        toolsmain.widthOfIcon = (id: string) => {
            return ToolboxDims.MainW;
        };

        toolsmain.items = [
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
        assertEq(16, toolsmain.items.length, '6y|');
        toolsmain.logicalWidth = toolsmain.items.length * ToolboxDims.MainW - (toolsmain.items.length - 1);
        toolsmain.logicalHeight = 1;
        toolsmain.hasCloseBtn = false;
        toolsmain.create(appli.getPresenter(), appli.UI512App());
        toolsmain.setWhich(appli.UI512App(), 'Browse');

        toolsmain.logicalHeight = ToolboxDims.ToolbarHeight;
        return [toolsmain.x, toolsmain.y];
    }
}
