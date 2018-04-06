
/* auto */ import { assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512CompToolbox } from '../../ui512/composites/ui512Toolbox.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcInterface.js';

export class PatternsToolbox extends UI512CompToolbox {
    // instead of hiliting the current item, draw a box around it
    compositeType = 'toolbox_patterns';
    borders: UI512ElButton[] = [];
    createSpecific(app: UI512Application) {
        super.createSpecific(app);
        let grp = app.getGroup(this.grpid);
        for (let i = 0; i < 4; i++) {
            this.borders[i] = this.genBtn(app, grp, 'selectwithbox' + i);
            this.borders[i].set('autohighlight', false);
        }

        let choiceblack = grp.getEl(this.getElId('choice##pattern105'));
        choiceblack.set('iconadjustwidth', 17 - 32);
        choiceblack.set('iconadjustheight', 12 - 32);
    }

    protected refreshHighlight(app: UI512Application) {
        let grp = app.getGroup(this.grpid);
        let lookfor = this.whichChosen;
        for (let item of this.items) {
            let id = this.getElId('choice##' + item[0]);
            let el = grp.getEl(id);
            el.set('highlightactive', false);
            el.set('autohighlight', item[0] !== lookfor);
            if (item[0] === lookfor) {
                let shrink = 2;
                let subr = [el.x, el.y, el.w - 2, el.h - 2];
                if (this.borders.length) {
                    this.borders[0].setDimensions(subr[0], subr[1], subr[2], 2);
                    this.borders[1].setDimensions(subr[0], subr[1], 2, subr[3]);
                    this.borders[2].setDimensions(subr[0] + subr[2], subr[1], 2, subr[3]);
                    this.borders[3].setDimensions(subr[0], subr[1] + subr[3], subr[2], 2);
                }
            }
        }
    }

    static layout(toolspatterns: PatternsToolbox, appli: IVpcStateInterface) {
        toolspatterns.iconh = ToolboxDims.toolsIconH;
        toolspatterns.widthOfIcon = (id: string) => {
            return ToolboxDims.toolspatternsw;
        };

        toolspatterns.logicalWidth =
            ToolboxDims.toolspatternperrow * ToolboxDims.toolspatternsw - (ToolboxDims.toolspatternperrow - 1);
        toolspatterns.logicalHeight = 1;
        toolspatterns.items = [
            ['pattern100', 76],
            ['pattern148', 74],
            ['pattern101', 36],
            ['pattern102', 37],
            ['pattern103', 38],
            ['pattern104', 39],
            ['pattern106', 40],
            ['pattern107', 41],
            ['pattern108', 42],
            ['pattern109', 43],
            ['pattern110', 44],
            ['pattern111', 45],
            ['pattern112', 46],
            ['pattern113', 47],
            ['pattern114', 48],
            ['pattern115', 49],
            ['pattern116', 50],
            ['pattern117', 51],
            ['pattern118', 52],
            ['pattern119', 53],
            ['pattern120', 54],
            ['pattern121', 55],
            ['pattern122', 56],
            ['pattern123', 57],
            ['pattern124', 58],
            ['pattern125', 59],
            ['pattern126', 60],
            ['pattern127', 61],
            ['pattern128', 62],
            ['pattern129', 63],
            ['pattern130', 64],
            ['pattern131', 65],
            ['pattern132', 66],
            ['pattern133', 67],
            ['pattern134', 68],
            ['pattern135', 69],
            ['pattern136', 70],
            ['pattern137', 71],
            ['pattern138', 72],
            ['pattern139', 73],
            ['pattern140', 82],
            ['pattern141', 83],
            ['pattern142', 84],
            ['pattern143', 85],
            ['pattern144', 86],
            ['pattern145', 87],
            ['pattern146', 88],
            ['pattern105', 77],
        ];
        assertEq(48, toolspatterns.items.length, '6x|');
        toolspatterns.hasclosebtn = false;
        toolspatterns.create(appli.getController(), appli.UI512App());
        toolspatterns.setWhich(appli.UI512App(), appli.getOption_s('currentPattern'));
        toolspatterns.logicalHeight = ToolboxDims.toolbarheight * 3;
        return [toolspatterns.x, toolspatterns.y];
    }
}

export enum ToolboxDims {
    toolsIconH = 24,
    toolsmainw = 24,
    toolspatternsw = 24,
    toolspatternperrow = 16,
    toolbarheight = 33,
    toolsnavw = 24,
    toolsnavaddedx = 253,
}
