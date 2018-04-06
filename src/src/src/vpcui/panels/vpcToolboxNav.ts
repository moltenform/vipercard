
/* auto */ import { TextFontSpec } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512CompToolbox } from '../../ui512/composites/ui512Toolbox.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { ToolboxDims } from '../../vpcui/panels/vpcToolboxPatterns.js';

export class NavToolbox extends UI512CompToolbox {
    compositeType = 'toolbox_nav';
    readonly geneva: string;
    constructor(id: string) {
        super(id);
        let font = new TextFontSpec('geneva', 0, 10);
        this.geneva = font.toSpecString();
    }

    protected refreshHighlight(app: UI512Application) {
        // don't set the highlight or autohighlight of anything
    }

    refreshNavIcons(app: UI512Application, coderunning: boolean, cardnum: number) {
        this.setWhich(app, undefined);
        let grpnav = app.getGroup(this.grpid);

        let btnCardNumOrStop = grpnav.getEl(this.getElId('choice##cardNumOrStop'));
        let btnDupeCardOrStatus = grpnav.getEl(this.getElId('choice##dupeCardOrStatus'));
        let btnMakeAnimOrStatus = grpnav.getEl(this.getElId('choice##makeAnimOrStatus'));

        if (coderunning) {
            btnCardNumOrStop.set('iconsetid', '001');
            btnCardNumOrStop.set('iconnumber', 90);
            btnCardNumOrStop.set('labeltext', '');
            btnCardNumOrStop.set('autohighlight', true);
            btnDupeCardOrStatus.set('iconnumber', 91); // waiting
            btnDupeCardOrStatus.set('autohighlight', false);
            btnMakeAnimOrStatus.set('iconnumber', 76); // white
            btnMakeAnimOrStatus.set('autohighlight', false);
        } else {
            btnCardNumOrStop.set('iconsetid', '');
            btnCardNumOrStop.set('iconnumber', -1);
            btnCardNumOrStop.set(
                'labeltext',
                TextRendererFontManager.setInitialFont((cardnum + 1).toString(), this.geneva)
            );
            btnCardNumOrStop.set('autohighlight', false);
            btnDupeCardOrStatus.set('iconnumber', 98); // dupecard
            btnDupeCardOrStatus.set('autohighlight', true);
            btnMakeAnimOrStatus.set('iconnumber', 96); // anim
            btnMakeAnimOrStatus.set('autohighlight', true);
        }
    }

    static layout(toolsnav: NavToolbox, appli: IVpcStateInterface) {
        toolsnav.iconh = 24;
        toolsnav.widthOfIcon = (id: string) => {
            return ToolboxDims.NavW;
        };

        const black = 77;
        toolsnav.items = [
            ['cardNumOrStop', black],
            ['cardPrev', 94],
            ['cardNext', 95],
            ['dupeCardOrStatus', black],
            ['makeAnimOrStatus', black],
        ];

        toolsnav.logicalWidth = toolsnav.items.length * ToolboxDims.NavW - (toolsnav.items.length - 1);
        toolsnav.logicalHeight = 1;
        toolsnav.hasclosebtn = false;
        toolsnav.create(appli.getController(), appli.UI512App());
        toolsnav.setWhich(appli.UI512App(), undefined);
        toolsnav.logicalHeight = ToolboxDims.ToolbarHeight;
        return [toolsnav.x, toolsnav.y];
    }
}
