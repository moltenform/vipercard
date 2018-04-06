
/* auto */ import { assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512CompToolbox } from '../../ui512/composites/ui512Toolbox.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { ToolboxDims } from '../../vpcui/panels/vpcToolboxPatterns.js';

export class MainToolbox extends UI512CompToolbox {
    compositeType = 'toolbox_main';
    listenMouseUp(app: UI512Application, d: MouseUpEventDetails) {
        if (d.elClick) {
            let short = this.fromFullId(d.elClick.id);
            if (short === 'closebtn') {
                // todo: closing the main toolbox enters fullscreen mode
            }
        }

        super.listenMouseUp(app, d);
    }

    static layout(toolsmain: MainToolbox, appli: IVpcStateInterface) {
        toolsmain.iconh = ToolboxDims.IconH;
        toolsmain.widthOfIcon = (id: string) => {
            return ToolboxDims.MainW;
        };

        toolsmain.items = [
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
            ['spray', 8],
        ];
        assertEq(16, toolsmain.items.length, '6y|');
        toolsmain.logicalWidth = toolsmain.items.length * ToolboxDims.MainW - (toolsmain.items.length - 1);
        toolsmain.logicalHeight = 1;
        toolsmain.hasclosebtn = false;
        toolsmain.create(appli.getController(), appli.UI512App());
        toolsmain.setWhich(appli.UI512App(), 'edit');

        toolsmain.logicalHeight = ToolboxDims.ToolbarHeight;
        return [toolsmain.x, toolsmain.y];
    }
}
