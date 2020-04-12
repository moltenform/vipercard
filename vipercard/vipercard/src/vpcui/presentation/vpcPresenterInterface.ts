
/* auto */ import { VpcAppUIToolSelect } from './../tools/vpcToolSelect';
/* auto */ import { VpcAppUIToolLasso } from './../tools/vpcToolLasso';
/* auto */ import { VpcAppUIToolBase } from './../tools/vpcToolBase';
/* auto */ import { VpcPaintRender } from './../modelrender/vpcPaintRender';
/* auto */ import { VpcModelRender } from './../modelrender/vpcModelRender';
/* auto */ import { VpcAppMenu } from './../menu/vpcMenu';
/* auto */ import { VpcAppLyrToolbox } from './../panels/vpcLyrToolbox';
/* auto */ import { VpcAppLyrPanels } from './../panels/vpcLyrPanels';
/* auto */ import { VpcAppLyrNotification } from './../panels/vpcLyrNotification';
/* auto */ import { VpcLyrNonModalHolder } from './../nonmodaldialogs/vpcLyrNonModalHolder';
/* auto */ import { VpcAppLyrDragHandles } from './../panels/vpcLyrDragHandles';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { VpcTool } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { RepeatingTimer } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { FocusChangedEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
    abstract beginScheduleFldOpenCloseEvent(evt: FocusChangedEventDetails): void;
    abstract beginScheduleFldOpenCloseEventClose(prevId: string): void;
    abstract beginScheduleFldOpenCloseEventOpen(nextId: string): void;

    abstract answerMsg(
        prompt: string,
        fnOnResult?: (n: number) => void,
        choice1?: string,
        choice2?: string,
        choice3?: string
    ): void;
}
