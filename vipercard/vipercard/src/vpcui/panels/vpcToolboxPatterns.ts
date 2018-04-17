
/* auto */ import { assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { UI512CompToolbox } from '../../ui512/composites/ui512Toolbox.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';

/**
 * a tool palette showing the available fill patterns
 */
export class VpcToolboxPatterns extends UI512CompToolbox {
    compositeType = 'toolbox_patterns';
    hiliteSelected: UI512ElButton[] = [];
    createSpecific(app: UI512Application) {
        super.createSpecific(app);
        let grp = app.getGroup(this.grpId);
        for (let i = 0; i < 4; i++) {
            /* create elements for the hilite */
            this.hiliteSelected[i] = this.genBtn(app, grp, 'selection' + i);
            this.hiliteSelected[i].set('autohighlight', false);
        }

        /* adjust the icon size for black */
        let choiceBlack = grp.getEl(this.getElId('choice##pattern105'));
        choiceBlack.set('iconadjustwidth', 17 - 32);
        choiceBlack.set('iconadjustheight', 12 - 32);
    }

    /**
     * override the refreshHighlight method,
     * instead of inverting colors of the selected tool,
     * draw a box around it
     */
    protected refreshHighlight(app: UI512Application) {
        const shrink = 2;
        let grp = app.getGroup(this.grpId);
        let lookfor = this.whichChosen;
        for (let item of this.items) {
            let id = this.getElId('choice##' + item[0]);
            let el = grp.getEl(id);
            el.set('highlightactive', false);
            el.set('autohighlight', item[0] !== lookfor);
            if (item[0] === lookfor) {
                let subr = [el.x, el.y, el.w - shrink, el.h - shrink];
                if (this.hiliteSelected.length) {
                    this.hiliteSelected[0].setDimensions(subr[0], subr[1], subr[2], 2);
                    this.hiliteSelected[1].setDimensions(subr[0], subr[1], 2, subr[3]);
                    this.hiliteSelected[2].setDimensions(subr[0] + subr[2], subr[1], 2, subr[3]);
                    this.hiliteSelected[3].setDimensions(subr[0], subr[1] + subr[3], subr[2], 2);
                }
            }
        }
    }

    /**
     * initialize the layout
     */
    static layout(toolsPatterns: VpcToolboxPatterns, vci: VpcStateInterface) {
        toolsPatterns.iconH = ToolboxDims.IconH;
        toolsPatterns.widthOfIcon = (id: string) => {
            return ToolboxDims.PatternsW;
        };

        toolsPatterns.logicalHeight = 1;
        toolsPatterns.logicalWidth =
            ToolboxDims.PatternsPerRow * ToolboxDims.PatternsW - (ToolboxDims.PatternsPerRow - 1);

        toolsPatterns.items = [
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
            ['pattern105', 77]
        ];

        assertEq(48, toolsPatterns.items.length, '6x|');
        toolsPatterns.hasCloseBtn = false;
        toolsPatterns.create(vci.getPresenter(), vci.UI512App());
        toolsPatterns.setWhich(vci.UI512App(), vci.getOptionS('currentPattern'));
        toolsPatterns.logicalHeight = ToolboxDims.ToolbarHeight * 3;
        return [toolsPatterns.x, toolsPatterns.y];
    }
}

/**
 * constants for tool dimensions
 */
export enum ToolboxDims {
    IconH = 24,
    MainW = 24,
    PatternsW = 24,
    PatternsPerRow = 16,
    ToolbarHeight = 33,
    NavW = 24,
    NavAddedX = 253
}
