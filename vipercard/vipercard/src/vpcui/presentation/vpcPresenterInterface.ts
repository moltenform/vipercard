
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RepeatingTimer } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcScriptErrorBase } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcPaintRender } from '../../vpcui/modelrender/vpcPaintRender.js';
/* auto */ import { VpcModelRender } from '../../vpcui/modelrender/vpcModelRender.js';
/* auto */ import { VpcAppLyrToolbox } from '../../vpcui/panels/vpcLyrToolbox.js';
/* auto */ import { VpcAppLyrDragHandles } from '../../vpcui/panels/vpcLyrDragHandles.js';
/* auto */ import { VpcAppLyrNotification } from '../../vpcui/panels/vpcLyrNotification.js';
/* auto */ import { VpcAppLyrPanels } from '../../vpcui/panels/vpcLyrPanels.js';
/* auto */ import { VpcAppUIToolBase } from '../../vpcui/tools/vpcToolBase.js';
/* auto */ import { VpcAppUIToolSelect } from '../../vpcui/tools/vpcToolSelect.js';
/* auto */ import { VpcAppUIToolLasso } from '../../vpcui/tools/vpcToolLasso.js';
/* auto */ import { VpcLyrNonModalHolder } from '../../vpcui/nonmodaldialogs/vpcLyrNonModalHolder.js';
/* auto */ import { VpcAppMenu } from '../../vpcui/menu/vpcMenu.js';

/**
 * forward-declare methods on the presenter class, solely
 * to break circular dependencies
 */
export abstract class VpcPresenterInterface extends UI512Presenter {
    vci: VpcStateInterface;
    timerSendMouseWithin: RepeatingTimer;
    timerRunScript: RepeatingTimer;
    timerBlinkMarquee: RepeatingTimer;
    timerRunMaintenance: RepeatingTimer;
    userBounds: number[];
    cursorRefreshPending: boolean;
    runScriptTimeslice: number;
    tlctgRectSelect: VpcAppUIToolSelect;
    tlctgLasso: VpcAppUIToolLasso;
    lyrPaintRender: VpcPaintRender;
    lyrModelRender: VpcModelRender;
    lyrResizeHandles: VpcAppLyrDragHandles;
    lyrCoverArea: VpcAppLyrNotification;
    lyrToolboxes: VpcAppLyrToolbox;
    lyrPropPanel: VpcAppLyrPanels;
    lyrMenus: VpcAppMenu;
    lyrNonModalDlgHolder: VpcLyrNonModalHolder;
    cameFromDemoSoNeverPromptSave: string;

    abstract askMsg(prompt: string, defText: string, fnOnResult: (ret: O<string>, n: number) => void): void;
    abstract exit(s: string): void;
    abstract askMsgAsync(prompt: string, defText: string): Promise<[O<string>, number]>;
    abstract answerMsgAsync(prompt: string, choice1?: string, choice2?: string, choice3?: string): Promise<number>;
    abstract isDocDirty(): boolean;
    abstract showError(scriptErr: VpcScriptErrorBase): void;
    abstract getSerializedStack(): string;
    abstract getToolResponse(t: VpcTool): VpcAppUIToolBase;
    abstract refreshCursor(): void;
    abstract refreshCursorElemKnown(el: O<UI512Element>, isDocumentEl: boolean): void;
    abstract answerMsg(
        prompt: string,
        fnOnResult?: (n: number) => void,
        choice1?: string,
        choice2?: string,
        choice3?: string
    ): void;
}
