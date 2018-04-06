
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RepeatingTimer } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512presenter.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcScriptErrorBase } from '../../vpc/vpcutils/vpcutils.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcappli.js';
/* auto */ import { VpcPaintRender } from '../../vpcui/modelrender/vpcpaintrender.js';
/* auto */ import { VpcModelRender } from '../../vpcui/modelrender/vpcmodelrender.js';
/* auto */ import { VpcAppToolboxes } from '../../vpcui/panels/vpclyrtoolbox.js';
/* auto */ import { VpcAppResizeHandles } from '../../vpcui/panels/vpclyrdraghandles.js';
/* auto */ import { VpcAppCoverArea } from '../../vpcui/panels/vpclyrnotifications.js';
/* auto */ import { VpcAppPropPanel } from '../../vpcui/panels/vpclyrpanels.js';
/* auto */ import { VpcAppUIToolResponseBase } from '../../vpcui/tools/vpctoolbase.js';
/* auto */ import { VpcAppUIRectSelect } from '../../vpcui/tools/vpctoolselect.js';
/* auto */ import { VpcAppUILasso } from '../../vpcui/tools/vpctoollasso.js';
/* auto */ import { VpcAppNonModalDlgHolder } from '../../vpcui/nonmodaldialogs/vpcnonmodalcommon.js';
/* auto */ import { VpcAppMenus } from '../../vpcui/menu/vpcmenu.js';

export abstract class VpcPresenterInterface extends UI512Controller {
    abstract answerMsg(
        prompt: string,
        fnOnResult?: (n: number) => void,
        choice1?: string,
        choice2?: string,
        choice3?: string
    ): void;
    abstract askMsg(prompt: string, defText: string, fnOnResult: (ret: O<string>, n: number) => void): void;
    abstract exit(s: string): void;

    abstract askMsgAsync(prompt: string, defText: string): Promise<[O<string>, number]>;
    abstract answerMsgAsync(prompt: string, choice1?: string, choice2?: string, choice3?: string): Promise<number>;
    abstract isDocDirty(): boolean;
    abstract showError(scriptErr: VpcScriptErrorBase): void;
    abstract getSerializedStack(): string;

    abstract getToolResponse(t: VpcTool): VpcAppUIToolResponseBase;
    abstract refreshCursor(): void;
    abstract refreshCursorElemKnown(el: O<UI512Element>, isDocumentEl: boolean): void;

    timerSendMouseWithin: RepeatingTimer;
    timerRunScript: RepeatingTimer;
    timerBlinkMarquee: RepeatingTimer;
    userBounds: number[];
    cursorRefreshPending: boolean;
    runScriptTimeslice: number;
    tlctgRectSelect: VpcAppUIRectSelect;
    tlctgLasso: VpcAppUILasso;

    lyrPaintRender: VpcPaintRender;
    lyrModelRender: VpcModelRender;
    lyrResizeHandles: VpcAppResizeHandles;
    lyrCoverArea: VpcAppCoverArea;
    lyrToolboxes: VpcAppToolboxes;
    lyrPropPanel: VpcAppPropPanel;
    lyrMenus: VpcAppMenus;
    lyrNonModalDlgHolder: VpcAppNonModalDlgHolder;
    appli: IVpcStateInterface;
    cameFromDemoSoNeverPromptSave: string;
}
