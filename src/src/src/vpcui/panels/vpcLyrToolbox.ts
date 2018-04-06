
/* auto */ import { O, assertTrueWarn, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { findEnumToStr, getStrToEnum, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ControllerBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { OrdinalOrPosition, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcAppInterfaceLayer } from '../../vpcui/modelrender/vpcPaintRender.js';
/* auto */ import { PatternsToolbox, ToolboxDims } from '../../vpcui/panels/vpcToolboxPatterns.js';
/* auto */ import { NavToolbox } from '../../vpcui/panels/vpcToolboxNav.js';
/* auto */ import { MainToolbox } from '../../vpcui/panels/vpcToolboxTools.js';

export class VpcAppToolboxes extends VpcAppInterfaceLayer {
    toolsmain = new MainToolbox('toolsmain');
    toolspatterns = new PatternsToolbox('toolspatterns');
    toolsnav = new NavToolbox('toolsnav');
    toolsmainDefaultLoc: number[];
    toolsnavDefaultLoc: number[];
    toolspatternsDefaultLoc: number[];
    cbStopCodeRunning: () => void;
    cbAnswerMsg: (s: string, cb: () => void) => void;

    init(c: UI512ControllerBase) {
        // add main toolbox
        this.toolsmain.iconsetid = '001';
        this.toolsmain.x = this.appli.bounds()[0] + ScreenConsts.xareawidth + 1;
        this.toolsmain.y = this.appli.bounds()[1] + ScreenConsts.ymenubar - 1;
        this.toolsmain.callbackOnChange = s => this.toolsmainCallback(s);
        this.toolsmainDefaultLoc = MainToolbox.layout(this.toolsmain, this.appli);

        // add navigation toolbox
        this.toolsnav.iconsetid = '001';
        this.toolsnav.x = this.toolsmain.x + ToolboxDims.toolsnavaddedx;
        this.toolsnav.y = this.toolsmain.y + ToolboxDims.toolbarheight;
        this.toolsnav.callbackOnChange = s => this.toolsnavCallback(s);
        this.toolsnavDefaultLoc = NavToolbox.layout(this.toolsnav, this.appli);

        // add patterns toolbox
        this.toolspatterns.iconsetid = '001';
        this.toolspatterns.x = this.toolsmain.x;
        this.toolspatterns.y = this.toolsnav.y + ToolboxDims.toolbarheight;
        this.toolspatterns.callbackOnChange = s => this.toolspatternsCallback(s);
        this.toolspatternsDefaultLoc = PatternsToolbox.layout(this.toolspatterns, this.appli);
    }

    toolsmainCallback(id: O<string>) {
        let toolParsed: VpcTool;
        if (id) {
            toolParsed = getStrToEnum<VpcTool>(VpcTool, 'VpcTool', id);
            this.appli.setTool(toolParsed);
            this.appli.setOption('viewingScriptVelId', '');
            this.appli.setOption('selectedVelId', '');
        } else {
            assertTrueWarn(false, `6w|invalid tool id ${id}`);
        }
    }

    toolsnavCallback(id: O<string>) {
        // immediately undo the highlight
        this.toolsnav.setWhich(this.appli.UI512App(), undefined);

        if (id === 'cardNumOrStop') {
            this.cbStopCodeRunning();
        } else if (id === 'cardPrev') {
            this.nav(OrdinalOrPosition.previous, 'lngYou are already at the first card.');
        } else if (id === 'cardNext') {
            this.nav(
                OrdinalOrPosition.next,
                "lngYou are at the last-most card. You can create a new card by selecting 'New Card' from the Edit menu."
            );
        } else if (id === 'dupeCardOrStatus') {
            if (!this.appli.isCodeRunning()) {
                this.dupeCard();
            }
        } else if (id === 'makeAnimOrStatus') {
            if (!this.appli.isCodeRunning()) {
                this.appli.performMenuAction('mnuExportGif');
            }
        }
    }

    protected dupeCard() {
        this.appli.performMenuAction('mnuDupeCard');
    }

    protected nav(pos: OrdinalOrPosition, msg: string) {
        let was = this.appli.getOption_s('currentCardId');
        this.appli.setCurrentCardNum(pos);
        let isNow = this.appli.getOption_s('currentCardId');
        if (was === isNow) {
            this.cbAnswerMsg(lng(msg), () => {});
            // remember to not run other code after showing modal dialog
        }
    }

    toolspatternsCallback(id: O<string>) {
        if (id && slength(id) > 0) {
            this.appli.setOption('currentPattern', id);
        }
    }

    isElemStopRunning(el: O<UI512Element>): boolean {
        if (el) {
            let short = this.toolsnav.fromFullId(el.id);
            if (short === 'choice##cardNumOrStop') {
                return true;
            }

            short = this.toolsmain.fromFullId(el.id);
            if (short && (scontains(short, 'choice##button') || scontains(short, 'choice##field'))) {
                return true;
            }
        }

        return false;
    }

    updateUI512Els() {
        // don't call this.setOption in this method -- it could cause an infinite loop
        let currentTool = this.appli.getOption_n('currentTool');

        // position toolboxes according to fullscreen mode
        this.toolsmain.setVisible(this.appli.UI512App(), true);
        this.toolsnav.moveAllTo(this.toolsnavDefaultLoc[0], this.toolsnavDefaultLoc[1], this.appli.UI512App());

        // main toolbox
        this.toolsmain.setWhich(this.appli.UI512App(), findEnumToStr<VpcTool>(VpcTool, currentTool));

        // navigation toolbox
        let coderunning = this.appli.isCodeRunning();
        let cardnum = this.appli.getCurrentCardNum();
        this.toolsnav.refreshNavIcons(this.appli.UI512App(), coderunning, cardnum);

        // patterns toolbox
        this.toolspatterns.setVisible(this.appli.UI512App(), currentTool === VpcTool.bucket);
        this.toolspatterns.setWhich(this.appli.UI512App(), this.appli.getOption_s('currentPattern'));
    }
}
