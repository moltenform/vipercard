
/* auto */ import { ToolboxDims, VpcToolboxPatterns } from './vpcToolboxPatterns';
/* auto */ import { VpcToolboxNav } from './vpcToolboxNav';
/* auto */ import { VpcToolboxMain } from './vpcToolboxMain';
/* auto */ import { VpcUILayer } from './../state/vpcInterface';
/* auto */ import { VpcTool, checkThrow } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { ScreenConsts } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { findEnumToStr, getStrToEnum, slength } from './../../ui512/utils/util512';
/* auto */ import { UI512PresenterBase } from './../../ui512/presentation/ui512PresenterBase';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * UI layer containing toolboxes
 */
export class VpcAppLyrToolbox extends VpcUILayer {
    toolsMain = new VpcToolboxMain('toolsMain');
    toolsPatterns = new VpcToolboxPatterns('toolsPatterns');
    toolsNav = new VpcToolboxNav('toolsNav');
    toolsMainDefaultLoc: number[];
    toolsNavDefaultLoc: number[];
    toolsPatternsDefaultLoc: number[];
    cbStopCodeRunning: () => void;
    cbAnswerMsg: (s: string, cb: () => void) => void;

    /**
     * initialize layout
     */
    init(pr: UI512PresenterBase) {
        /* add main toolbox */
        this.toolsMain.iconGroupId = '001';
        this.toolsMain.x = this.vci.bounds()[0] + ScreenConsts.xAreaWidth + 1;
        this.toolsMain.y = this.vci.bounds()[1] + ScreenConsts.yMenuBar - 1;
        this.toolsMain.callbackOnChange = s => this.toolsMainRespondClicked(s);
        this.toolsMainDefaultLoc = VpcToolboxMain.layout(this.toolsMain, this.vci);

        /* add navigation toolbox */
        this.toolsNav.iconGroupId = '001';
        this.toolsNav.x = this.toolsMain.x + ToolboxDims.NavAddedX;
        this.toolsNav.y = this.toolsMain.y + ToolboxDims.ToolbarHeight;
        this.toolsNav.callbackOnChange = s => this.toolsNavRespondClicked(s);
        this.toolsNavDefaultLoc = VpcToolboxNav.layout(this.toolsNav, this.vci);

        /* add patterns toolbox */
        this.toolsPatterns.iconGroupId = '001';
        this.toolsPatterns.x = this.toolsMain.x;
        this.toolsPatterns.y = this.toolsNav.y + ToolboxDims.ToolbarHeight;
        this.toolsPatterns.callbackOnChange = s => this.toolsPatternsRespondClicked(s);
        this.toolsPatternsDefaultLoc = VpcToolboxPatterns.layout(this.toolsPatterns, this.vci);
    }

    /**
     * update UI
     */
    updateUI512Els() {
        /* don't call this.setOption in this method -- it could cause an infinite loop */
        let currentTool = this.vci.getOptionN('currentTool');

        /* position toolboxes according to fullscreen mode */
        this.toolsMain.setVisible(this.vci.UI512App(), true);
        this.toolsNav.moveAllTo(this.toolsNavDefaultLoc[0], this.toolsNavDefaultLoc[1], this.vci.UI512App());

        /* main toolbox */
        this.toolsMain.setWhich(this.vci.UI512App(), findEnumToStr(VpcTool, currentTool));

        /* navigation toolbox */
        let codeRunning = this.vci.isCodeRunning();
        let cardNum = this.vci.getCurrentCardNum();
        this.toolsNav.refreshNavIcons(this.vci.UI512App(), codeRunning, cardNum);

        /* patterns toolbox */
        this.toolsPatterns.setVisible(this.vci.UI512App(), currentTool === VpcTool.Bucket);
        this.toolsPatterns.setWhich(this.vci.UI512App(), this.vci.getOptionS('currentPattern'));
    }

    /**
     * user clicked on patterns palette
     */
    toolsPatternsRespondClicked(id: O<string>) {
        if (id && slength(id) > 0) {
            this.vci.setOption('currentPattern', id);
        }
    }

    /**
     * user clicked on main palette
     */
    toolsMainRespondClicked(sTool: O<string>) {
        if (sTool) {
            checkThrow(sTool.length > 1, 'Ka|not a valid tool name.');
            let toolParsed = getStrToEnum<VpcTool>(VpcTool, 'VpcTool', sTool);
            this.vci.setTool(toolParsed);
            this.vci.setOption('viewingScriptVelId', '');
            this.vci.setOption('selectedVelId', '');
        } else {
            assertWarn(false, `6w|invalid tool id ${sTool}`);
        }
    }

    /**
     * user clicked on nav palette
     */
    toolsNavRespondClicked(id: O<string>) {
        /* immediately undo the highlight */
        this.toolsNav.setWhich(this.vci.UI512App(), undefined);

        if (id === 'cardNumOrStop') {
            this.cbStopCodeRunning();
        } else if (id === 'cardPrev') {
            this.vci.performMenuAction('mnuGoCardPrev');
        } else if (id === 'cardNext') {
            this.vci.performMenuAction('mnuGoCardNext');
        } else if (id === 'dupeCardOrStatus') {
            if (!this.vci.isCodeRunning()) {
                this.vci.performMenuAction('mnuDupeCard');
            }
        } else if (id === 'makeAnimOrStatus') {
            if (!this.vci.isCodeRunning()) {
                this.vci.performMenuAction('mnuExportGif');
            }
        }
    }

    /**
     * is this element the 'stop' button?
     */
    isElemStopRunning(el: O<UI512Element>): boolean {
        if (el) {
            let short = this.toolsNav.fromFullId(el.id);
            if (short === 'choice##cardNumOrStop') {
                return true;
            }

            short = this.toolsMain.fromFullId(el.id);
            if (short && (short.includes('choice##button') || short.includes('choice##field'))) {
                return true;
            }
        }

        return false;
    }
}
