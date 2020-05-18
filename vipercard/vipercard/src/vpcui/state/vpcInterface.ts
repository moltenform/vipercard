
/* auto */ import { VpcExecTop } from './../../vpc/codeexec/vpcScriptExecTop';
/* auto */ import { VpcExecFrameStack } from './../../vpc/codeexec/vpcScriptExecFrameStack';
/* auto */ import { VpcExecFrame } from './../../vpc/codeexec/vpcScriptExecFrame';
/* auto */ import { VpcTool } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { OutsideWorldReadWrite } from './../../vpc/vel/velOutsideInterfaces';
/* auto */ import { VpcModelTop } from './../../vpc/vel/velModelTop';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { UI512PresenterBase } from './../../ui512/presentation/ui512PresenterBase';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { EventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { ElementObserverVal } from './../../ui512/elements/ui512ElementGettable';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512PaintDispatch } from './../../ui512/draw/ui512DrawPaintDispatch';
/* auto */ import { UI512CompBase } from './../../ui512/composites/ui512Composites';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * interface,
 * a way to request from the Presenter
 * without any reference cycles
 */
export interface VpcStateInterface {
    /**
     * get a string runtime (not-persisted) option
     */
    getOptionS(prop: string): string;

    /**
     * get a numeric runtime (not-persisted) option
     */
    getOptionN(prop: string): number;

    /**
     * get a boolean runtime (not-persisted) option
     */
    getOptionB(prop: string): boolean;

    /**
     * set a boolean runtime (not-persisted) option
     */
    setOption<T extends ElementObserverVal>(prop: string, newVal: T): void;

    /**
     * perform undo
     */
    performUndo(): boolean;

    /**
     * perform redo
     */
    performRedo(): boolean;

    /**
     * get state id, for undo/redo and seeing if a stack is dirty/needs to be saved
     */
    getCurrentStateId(): string;

    /**
     * get current execution context, or undefined if script not running
     */
    findExecFrameStack(): [O<VpcExecFrameStack>, O<VpcExecFrame>];

    /**
     * get vel model structure
     */
    getModel(): VpcModelTop;

    /**
     * is code currently running
     */
    isCodeRunning(): boolean;

    /**
     * re-add a vel to the model
     */
    rawRevive(vel: VpcElBase): void;

    /**
     * perform a changeSeenCreationDeletion
     */
    doChangeSeenCreationDeletion(action:UndoableActionPlaceholder):void

    /**
     * don't record changes made for undo, and assert that no changes were made
     */
    doWithoutAbilityToUndoExpectingNoChanges(fn: () => void): void;

    /**
     * don't record changes made for undo
     */
    doWithoutAbilityToUndo(fn: () => void): void;

    /**
     * record changes made for undo
     */
    undoableAction(fn: () => void, typ?: TypeOfUndoAction): void;

    /**
     * are we 'back in time' looking at a previous state?
     */
    isCurrentlyUndoing(): boolean;

    /**
     * schedule event to be sent
     */
    scheduleScriptEventSend(d: EventDetails): void;

    /**
     * get the UI512 app for the Presenter
     */
    UI512App(): UI512Application;

    /**
     * get the Presenter
     */
    getPresenter(): UI512Presenter;

    /**
     * a way to call a function asynchronously and get the error handling and typical callstack
     * the function will be called soon via onIdle
     */
    placeCallbackInQueue(cb: () => void): void;

    /**
     * get bounds of the UI512Presenter
     */
    bounds(): number[];

    /**
     * get user-bounds of the UI512Presenter
     */
    userBounds(): number[];

    /**
     * get current card number
     */
    getCurrentCardNum(): number;

    /**
     * get current card id
     */
    getCurrentCardId(): string;

    /**
     * go to a card without sending any closecard or opencard events
     */
    setCurCardNoOpenCardEvt(id: string): void;

    /**
     * get the current tool
     */
    getTool(): VpcTool;

    /**
     * set the current tool
     */
    setTool(n: VpcTool): void;

    /**
     * show a non-modal form, closing any other active form
     */
    setNonModalDialog(form: O<UI512CompBase>): void;

    /**
     * show a non-modal form, closing any other active form
     */
    setNonModalDialogByStr(form: O<string>): void;

    /**
     * show a modal dialog
     */
    answerMsgAsync(prompt: string, choice1?: string, choice2?: string, choice3?: string): Promise<number>;

    /**
     * get the currently focused vel
     */
    getCurrentFocusVelField(): O<VpcElField>;

    /**
     * get the currently focused element, either an element of the stack or part of vpc ui
     */
    getCurrentFocus(): O<string>;

    /**
     * set the currently focused element
     */
    setCurrentFocus(s: O<string>): void;

    /**
     * flush queue of paint actions
     */
    commitSimulatedClicks(queue: UI512PaintDispatch[]): void;

    /**
     * perform a menu action.
     * might not be synchronous; the menu action could show a modal dialog
     */
    performMenuAction(s: string): void;

    /**
     * cause VPC UI to be redrawn
     */
    causeUIRedraw(): void;

    /**
     * cause VPC UI and also every vel to be redrawn
     */
    causeFullRedraw(): void;

    /**
     * get top code execution object
     */
    getCodeExec(): VpcExecTop;

    /**
     * get "outside world" interface
     */
    getOutside(): OutsideWorldReadWrite;

    /**
     * append text to the message box
     * ignored if the message box is not currently open
     */
    writeToReplMessageBox(s: string, returnFocus: boolean): void;

    /**
     * releases memory by nulling out everything owned by the class
     */
    destroy(): void;
}

/**
 * will become a UndoableActionCreateVel
 */
export interface UndoableActionPlaceholder {
}

/**
 * base class for layers in the Vpc UI
 */
export abstract class VpcUILayer {
    vci: VpcStateInterface;
    abstract init(pr: UI512PresenterBase): void;
    abstract updateUI512Els(): void;
}

/**
 * it seems more intuitive if all modifications caused by a script are
 * wrapped together into one undoable block, even though the script
 * is run in separate timeslices. without this coalescing of undo
 * events, user would have to hit Undo multiple times for no apparent reason
 */
export enum TypeOfUndoAction {
    None = 1,

    /* always create new action */
    StartNewAction,

    /* if latest action is also StartReusableAction, glue it together */
    StartReusableAction
}
