
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { PaintOntoCanvas } from '../../ui512/draw/ui512imageserialize.js';
/* auto */ import { ElementObserverVal } from '../../ui512/elements/ui512elementsgettable.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { EventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512presenter.js';
/* auto */ import { UI512CompBase } from '../../ui512/composites/ui512composites.js';
/* auto */ import { OrdinalOrPosition, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velbase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velfield.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/vpcoutsideinterfaces.js';
/* auto */ import { VpcModel } from '../../vpc/vel/velmodel.js';
/* auto */ import { CodeExecFrame } from '../../vpc/codeexec/vpcscriptexecframe.js';
/* auto */ import { CodeExecFrameStack } from '../../vpc/codeexec/vpcscriptexecframestack.js';
/* auto */ import { CodeExecTop } from '../../vpc/codeexec/vpcscriptexectop.js';

export interface IVpcStateInterface {
    getOption_s(prop: string): string;
    getOption_n(prop: string): number;
    getOption_b(prop: string): boolean;
    setOption<T extends ElementObserverVal>(prop: string, newval: T): void;
    performUndo(): boolean;
    performRedo(): boolean;
    getCurrentStateId(): string;
    findExecFrameStack(): [O<CodeExecFrameStack>, O<CodeExecFrame>];
    getModel(): VpcModel;
    isCodeRunning(): boolean;
    rawRevive(vel: VpcElBase): void;
    rawCreate<T extends VpcElBase>(velid: string, parentid: string, ctr: { new (...args: any[]): T }): T;
    createElem(parent_id: string, type: VpcElType, insertIndex: number, specifyId?: string): VpcElBase;
    removeElem(vel: VpcElBase): void;
    doWithoutAbilityToUndoExpectingNoChanges(fn: () => void): void;
    doWithoutAbilityToUndo(fn: () => void): void;
    undoableAction(fn: () => void, typ?: TypeOfUndoAction): void;
    scheduleScriptEventSend(d: EventDetails): void;
    UI512App(): UI512Application;
    getController(): UI512Controller;
    placeCallbackInQueue(cb: () => void): void;
    bounds(): number[];
    userBounds(): number[];
    lang(): UI512Lang;
    getCurrentCardNum(): number;
    setCurrentCardNum(pos: OrdinalOrPosition): void;
    getTool(): number;
    setTool(n: VpcTool): void;
    getRoot(): Root;
    setNonModalDialog(frm: O<UI512CompBase>): void;
    getCurrentFocusVelField(): O<VpcElField>;
    getCurrentFocus(): O<string>;
    setCurrentFocus(s: O<string>): void;
    commitSimulatedClicks(queue: PaintOntoCanvas[]): void;
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
    StartReusableAction, // if latest action is also StartReusableAction, glue it together
}
