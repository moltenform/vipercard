
/* auto */ import { TextFontSpec } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512CompToolbox } from '../../ui512/composites/ui512Toolbox.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { ToolboxDims } from '../../vpcui/panels/vpcToolboxPatterns.js';

/**
 * a tool palette for moving from card to card
 */
export class VpcToolboxNav extends UI512CompToolbox {
    compositeType = 'toolbox_nav';
    readonly geneva: string;
    constructor(id: string) {
        super(id);
        let font = new TextFontSpec('geneva', 0, 10);
        this.geneva = font.toSpecString();
    }

    /**
     * override refreshHighlight to do nothing,
     * don't highlight any button at all
     */
    protected refreshHighlight(app: UI512Application) {}

    /**
     * when a script is running, we'll show a Stop icon
     * when a script isn't running, show the current card number
     */
    refreshNavIcons(app: UI512Application, coderunning: boolean, cardnum: number) {
        this.setWhich(app, undefined);
        let grpnav = app.getGroup(this.grpId);

        let btnCardNumOrStop = grpnav.getEl(this.getElId('choice##cardNumOrStop'));
        let btnDupeCardOrStatus = grpnav.getEl(this.getElId('choice##dupeCardOrStatus'));
        let btnMakeAnimOrStatus = grpnav.getEl(this.getElId('choice##makeAnimOrStatus'));

        if (coderunning) {
            btnCardNumOrStop.set('icongroupid', '001');
            btnCardNumOrStop.set('iconnumber', 90);
            btnCardNumOrStop.set('labeltext', '');
            btnCardNumOrStop.set('autohighlight', true);
            btnDupeCardOrStatus.set('iconnumber', 91); /* waiting */
            btnDupeCardOrStatus.set('autohighlight', false);
            btnMakeAnimOrStatus.set('iconnumber', 76); /* white */
            btnMakeAnimOrStatus.set('autohighlight', false);
        } else {
            btnCardNumOrStop.set('icongroupid', '');
            btnCardNumOrStop.set('iconnumber', -1);
            btnCardNumOrStop.set('labeltext', UI512DrawText.setFont((cardnum + 1).toString(), this.geneva));
            btnCardNumOrStop.set('autohighlight', false);
            btnDupeCardOrStatus.set('iconnumber', 98); /* dupecard */
            btnDupeCardOrStatus.set('autohighlight', true);
            btnMakeAnimOrStatus.set('iconnumber', 96); /* anim */
            btnMakeAnimOrStatus.set('autohighlight', true);
        }
    }

    /**
     * initialize layout
     */
    static layout(toolsNav: VpcToolboxNav, vci: VpcStateInterface) {
        toolsNav.iconH = 24;
        toolsNav.widthOfIcon = (id: string) => {
            return ToolboxDims.NavW;
        };

        const black = 77;
        toolsNav.items = [
            ['cardNumOrStop', black],
            ['cardPrev', 94],
            ['cardNext', 95],
            ['dupeCardOrStatus', black],
            ['makeAnimOrStatus', black]
        ];

        toolsNav.logicalWidth = toolsNav.items.length * ToolboxDims.NavW - (toolsNav.items.length - 1);
        toolsNav.logicalHeight = 1;
        toolsNav.hasCloseBtn = false;
        toolsNav.create(vci.getPresenter(), vci.UI512App());
        toolsNav.setWhich(vci.UI512App(), undefined);
        toolsNav.logicalHeight = ToolboxDims.ToolbarHeight;
        return [toolsNav.x, toolsNav.y];
    }
}
