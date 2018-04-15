
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512PaintDispatch } from '../../ui512/draw/ui512DrawPaintDispatch.js';
/* auto */ import { ElementObserverVal } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { EventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { UI512CompBase } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { OrdinalOrPosition, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcModelTop } from '../../vpc/vel/velModelTop.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { CodeExecFrame } from '../../vpc/codeexec/vpcScriptExecFrame.js';
/* auto */ import { CodeExecFrameStack } from '../../vpc/codeexec/vpcScriptExecFrameStack.js';
/* auto */ import { CodeExecTop } from '../../vpc/codeexec/vpcScriptExecTop.js';

export interface VpcStateInterface {
    getOption_s(prop: string): string;
    getOption_n(prop: string): number;
    getOption_b(prop: string): boolean;
    setOption<T extends ElementObserverVal>(prop: string, newval: T): void;
    performUndo(): boolean;
    performRedo(): boolean;
    getCurrentStateId(): string;
    findExecFrameStack(): [O<CodeExecFrameStack>, O<CodeExecFrame>];
    getModel(): VpcModelTop;
    isCodeRunning(): boolean;
    rawRevive(vel: VpcElBase): void;
    rawCreate<T extends VpcElBase>(velId: string, parentId: string, ctr: { new (...args: any[]): T }): T;
    createElem(parent_id: string, type: VpcElType, insertIndex: number, specifyId?: string): VpcElBase;
    removeElem(vel: VpcElBase): void;
    doWithoutAbilityToUndoExpectingNoChanges(fn: () => void): void;
    doWithoutAbilityToUndo(fn: () => void): void;
    undoableAction(fn: () => void, typ?: TypeOfUndoAction): void;
    scheduleScriptEventSend(d: EventDetails): void;
    UI512App(): UI512Application;
    getPresenter(): UI512Presenter;
    placeCallbackInQueue(cb: () => void): void;
    bounds(): number[];
    userBounds(): number[];
    getCurrentCardNum(): number;
    setCurrentCardNum(pos: OrdinalOrPosition): void;
    getTool(): number;
    setTool(n: VpcTool): void;
    setNonModalDialog(frm: O<UI512CompBase>): void;
    getCurrentFocusVelField(): O<VpcElField>;
    getCurrentFocus(): O<string>;
    setCurrentFocus(s: O<string>): void;
    commitSimulatedClicks(queue: UI512PaintDispatch[]): void;
    performMenuAction(s: string): void;
    causeUIRedraw(): void;
    causeFullRedraw(): void;
    getCodeExec(): CodeExecTop;
    getOutside(): OutsideWorldReadWrite;
    destroy(): void;
}

export enum TypeOfUndoAction {
    None,
    StartNewAction, // always create new action
    StartReusableAction // if latest action is also StartReusableAction, glue it together
}
