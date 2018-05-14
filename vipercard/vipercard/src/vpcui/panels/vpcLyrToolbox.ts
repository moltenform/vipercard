
/* auto */ import { O, assertTrueWarn, checkThrow, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, findEnumToStr, getStrToEnum, slength } from '../../ui512/utils/utils512.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512PresenterBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { OrdinalOrPosition, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcUILayer } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { ToolboxDims, VpcToolboxPatterns } from '../../vpcui/panels/vpcToolboxPatterns.js';
/* auto */ import { VpcToolboxNav } from '../../vpcui/panels/vpcToolboxNav.js';
/* auto */ import { VpcToolboxMain } from '../../vpcui/panels/vpcToolboxMain.js';

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
        this.toolsMain.setWhich(this.vci.UI512App(), findEnumToStr<VpcTool>(VpcTool, currentTool));

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
            assertTrueWarn(false, `6w|invalid tool id ${sTool}`);
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
            this.nav(OrdinalOrPosition.Previous, 'lngYou are already at the first card.');
        } else if (id === 'cardNext') {
            this.nav(
                OrdinalOrPosition.Next,
                "lngYou are at the last-most card. You can create a new card by selecting 'New Card' from the Edit menu."
            );
        } else if (id === 'dupeCardOrStatus') {
            if (!this.vci.isCodeRunning()) {
                this.dupeCard();
            }
        } else if (id === 'makeAnimOrStatus') {
            if (!this.vci.isCodeRunning()) {
                this.vci.performMenuAction('mnuExportGif');
            }
        }
    }

    /**
     * duplicate card
     */
    protected dupeCard() {
        this.vci.performMenuAction('mnuDupeCard');
    }

    /**
     * navigate to a different card, or
     * show a dialog if we can go no further
     */
    protected nav(pos: OrdinalOrPosition, msg: string) {
        let cardNum = this.vci.getCurrentCardNum()
        if (pos === OrdinalOrPosition.Previous) {
            if (cardNum <= 0) {
                this.cbAnswerMsg(lng(msg), () => {});
            } else {
                this.vci.beginSetCurCardWithOpenCardEvt(pos, undefined)
            }
        } else if (pos === OrdinalOrPosition.Next) {
            let totalCardNum = this.vci.getModel().stack.bgs.map(bg => bg.cards.length).reduce(Util512.add);
            if (cardNum >= totalCardNum - 1) {
                this.cbAnswerMsg(lng(msg), () => {});
            } else {
                this.vci.beginSetCurCardWithOpenCardEvt(pos, undefined)
            }
        } else {
            assertTrueWarn(false, "expected prev or next")
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
            if (short && (scontains(short, 'choice##button') || scontains(short, 'choice##field'))) {
                return true;
            }
        }

        return false;
    }
}
