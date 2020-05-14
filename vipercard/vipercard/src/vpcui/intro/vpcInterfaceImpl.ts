
/* auto */ import { VpcState } from './../state/vpcState';
/* auto */ import { VpcExecTop } from './../../vpc/codeexec/vpcScriptExecTop';
/* auto */ import { VpcExecFrameStack } from './../../vpc/codeexec/vpcScriptExecFrameStack';
/* auto */ import { VpcExecFrame } from './../../vpc/codeexec/vpcScriptExecFrame';
/* auto */ import { VpcPresenterEvents } from './../presentation/vpcPresenterEvents';
/* auto */ import { VpcPresenter } from './../presentation/vpcPresenter';
/* auto */ import { TypeOfUndoAction, VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { OrdinalOrPosition, VpcElType, VpcTool, checkThrow } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { DialogDocsType, VpcNonModalDocViewer } from './../nonmodaldialogs/vpcDocViewer';
/* auto */ import { OutsideWorldReadWrite } from './../../vpc/vel/velOutsideInterfaces';
/* auto */ import { VpcModelTop } from './../../vpc/vel/velModelTop';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { SetToInvalidObjectAtEndOfExecution } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { arLast } from './../../ui512/utils/util512';
/* auto */ import { EventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { ElementObserverVal } from './../../ui512/elements/ui512ElementGettable';
/* auto */ import { UI512PaintDispatch } from './../../ui512/draw/ui512DrawPaintDispatch';
/* auto */ import { UI512CompBase } from './../../ui512/composites/ui512Composites';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * fulfill the VpcStateInterface interface
 */
export class VpcStateInterfaceImpl implements VpcStateInterface {
    protected vcstate: VpcState;
    protected pr: VpcPresenter;
    init(vcstate: VpcState, pr: VpcPresenter) {
        this.vcstate = vcstate;
        this.pr = pr;
    }

    /**
     * get a string runtime (not-persisted) option
     */
    getOptionS(prop: string) {
        if (this.vcstate.runtime.opts.isARuntimeOpt[prop]) {
            return this.vcstate.runtime.opts.getS(prop);
        } else {
            return this.vcstate.model.productOpts.getS(prop);
        }
    }

    /**
     * get a numeric runtime (not-persisted) option
     */
    getOptionN(prop: string) {
        if (this.vcstate.runtime.opts.isARuntimeOpt[prop]) {
            return this.vcstate.runtime.opts.getN(prop);
        } else {
            return this.vcstate.model.productOpts.getN(prop);
        }
    }

    /**
     * get a boolean runtime (not-persisted) option
     */
    getOptionB(prop: string) {
        if (this.vcstate.runtime.opts.isARuntimeOpt[prop]) {
            return this.vcstate.runtime.opts.getB(prop);
        } else {
            return this.vcstate.model.productOpts.getB(prop);
        }
    }

    /**
     * set a boolean runtime (not-persisted) option
     */
    setOption<T extends ElementObserverVal>(prop: string, newVal: T) {
        if (this.vcstate.runtime.opts.isARuntimeOpt[prop]) {
            return this.vcstate.runtime.opts.set(prop, newVal);
        } else {
            return this.vcstate.model.productOpts.setProductOpt(prop, newVal);
        }
    }

    /**
     * perform undo
     */
    performUndo(): boolean {
        return this.vcstate.undoManager.performUndo(this);
    }

    /**
     * perform redo
     */
    performRedo(): boolean {
        return this.vcstate.undoManager.performRedo(this);
    }

    /**
     * get state id, for undo/redo and seeing if a stack is dirty/needs to be saved
     */
    getCurrentStateId(): string {
        return this.vcstate && this.vcstate.undoManager && this.vcstate.undoManager.getCurrentStateId();
    }

    /**
     * get current execution context, or undefined if script not running
     */
    findExecFrameStack(): [O<VpcExecFrameStack>, O<VpcExecFrame>] {
        let frStack = this.vcstate.runtime.codeExec.workQueue[0];
        if (frStack) {
            return [frStack, arLast(frStack.stack)];
        } else {
            return [undefined, undefined];
        }
    }

    /**
     * get vel model structure
     */
    getModel(): VpcModelTop {
        return this.vcstate.model;
    }

    /**
     * is code currently running
     */
    isCodeRunning(): boolean {
        return this.vcstate.runtime.codeExec.isCodeRunning();
    }

    /**
     * re-add a vel to the model
     */
    rawRevive(readded: VpcElBase) {
        checkThrow(!this.getCodeExec().isCodeRunning(), "8#|currently can't add or remove an element while code is running");

        this.causeFullRedraw();
        readded.observer = this.vcstate.runtime.useThisObserverForVpcEls;
        this.getModel().addIdToMapOfElements(readded);
    }

    /**
     * create a new vel on its own
     */
    rawCreate<T extends VpcElBase>(velId: string, parentId: string, ctr: { new (...args: any[]): T }): T {
        this.causeFullRedraw();
        let vel = new ctr(velId, parentId);
        checkThrow(vel instanceof VpcElBase, `8*|must be a VpcElBase`);
        vel.observer = this.vcstate.runtime.useThisObserverForVpcEls;
        this.vcstate.model.addIdToMapOfElements(vel);
        return vel;
    }

    /**
     * create a new vel and add it to the model
     */
    createVel(parentId: string, type: VpcElType, insertIndex: number, specifyId?: string): VpcElBase {
        return this.vcstate.createVel(parentId, type, insertIndex, specifyId);
    }

    /**
     * remove vel from the model
     */
    removeVel(vel: VpcElBase) {
        this.vcstate.removeVel(vel);
    }

    /**
     * don't record changes made for undo, and assert that no changes were made
     */
    doWithoutAbilityToUndoExpectingNoChanges(fn: () => void) {
        this.vcstate.undoManager.doWithoutAbilityToUndoExpectingNoChanges(fn);
    }

    /**
     * don't record changes made for undo
     */
    doWithoutAbilityToUndo(fn: () => void) {
        this.vcstate.undoManager.doWithoutAbilityToUndo(fn);
    }

    /**
     * record changes made for undo
     */
    undoableAction(fn: () => void, typ: O<TypeOfUndoAction>) {
        this.vcstate.undoManager.undoableAction(fn, typ ?? TypeOfUndoAction.StartNewAction);
    }

    /**
     * are we 'back in time' looking at a previous state?
     */
    isCurrentlyUndoing() {
        return this.vcstate.undoManager.isCurrentlyUndoing();
    }

    /**
     * schedule event to be sent
     */
    scheduleScriptEventSend(d: EventDetails) {
        return VpcPresenterEvents.scheduleScriptMsg(this.pr, this, d);
    }

    /**
     * get the UI512 app for the Presenter
     */
    UI512App() {
        return this.pr.app;
    }

    /**
     * get the Presenter
     */
    getPresenter() {
        return this.pr;
    }

    /**
     * a way to call a function asynchronously and get the error handling and typical callstack
     * the function will be called soon via onIdle
     */
    placeCallbackInQueue(cb: () => void) {
        return this.pr.placeCallbackInQueue(cb);
    }

    /**
     * get bounds of the UI512Presenter
     */
    bounds() {
        return this.pr.bounds;
    }

    /**
     * get user-bounds of the UI512Presenter
     */
    userBounds() {
        return this.pr.userBounds;
    }

    /**
     * get current card number
     */
    getCurrentCardNum() {
        return this.pr.getCurrentCardNum();
    }

    /**
     * get current card id
     */
    getCurrentCardId() {
        return this.getOptionS('currentCardId');
    }

    /**
     * asynchronously go to a card, if browse tool calls closecard + opencard events
     */
    beginSetCurCardWithOpenCardEvt(pos: OrdinalOrPosition, idSpecific: O<string>) {
        this.pr.beginSetCurCardWithOpenCardEvt(pos, idSpecific);
    }

    /**
     * go to a card without sending any closecard or opencard events
     */
    setCurCardNoOpenCardEvt(id: string): void {
        return this.pr.setCurCardNoOpenCardEvt(id);
    }

    /**
     * get the current tool
     */
    getTool() {
        return this.pr.getTool();
    }

    /**
     * set the current tool
     */
    setTool(n: VpcTool) {
        return this.pr.setTool(n);
    }

    /**
     * show a non-modal form, closing any other active form
     */
    setNonModalDialog(form: O<UI512CompBase>) {
        return this.pr.lyrNonModalDlgHolder.setNonModalDialog(form);
    }

    /**
     * show a non-modal form, closing any other active form
     */
    setNonModalDialogByStr(form: O<string>) {
        if (form === 'VpcNonModalDocViewerReference') {
            let dlg = new VpcNonModalDocViewer(this, DialogDocsType.Reference);
            this.setNonModalDialog(dlg);
        } else if (!form) {
            this.setNonModalDialog(undefined);
        } else {
            checkThrow(false, 'T~|unknown dialog', form);
        }
    }

    /**
     * show a modal dialog
     */
    answerMsgAsync(prompt: string, choice1?: string, choice2?: string, choice3?: string): Promise<number> {
        return this.pr.answerMsgAsync(prompt, choice1, choice2, choice3);
    }

    /**
     * get the currently focused vel
     */
    getCurrentFocusVelField() {
        return this.pr.getSelectedFieldVel();
    }

    /**
     * set the currently focused element
     */
    setCurrentFocus(s: O<string>) {
        return this.pr.setCurrentFocus(s);
    }

    /**
     * get the currently focused element, either an element of the stack or part of vpc ui
     */
    getCurrentFocus() {
        return this.pr.getCurrentFocus();
    }

    /**
     * flush queue of paint actions
     */
    commitSimulatedClicks(queue: UI512PaintDispatch[]) {
        return this.pr.lyrPaintRender.commitSimulatedClicks(queue);
    }

    /**
     * perform a menu action.
     * might not be synchronous; the menu action could show a modal dialog
     */
    performMenuAction(s: string) {
        return this.pr.performMenuAction(s);
    }

    /**
     * cause VPC UI to be redrawn
     */
    causeUIRedraw() {
        return this.pr.lyrModelRender.uiRedrawNeeded();
    }

    /**
     * cause VPC UI and also every vel to be redrawn
     */
    causeFullRedraw() {
        return this.pr.lyrModelRender.fullRedrawNeeded();
    }

    /**
     * get top code execution object
     */
    getCodeExec(): VpcExecTop {
        return this.vcstate.runtime.codeExec;
    }

    /**
     * get "outside world" interface
     */
    getOutside(): OutsideWorldReadWrite {
        return this.vcstate.runtime.outside;
    }

    /**
     * append text to the message box
     * ignored if the message box is not currently open
     */
    writeToReplMessageBox(s: string, returnFocus: boolean): void {
        return this.pr.writeToReplMessageBox(s, returnFocus);
    }

    /**
     * releases memory by nulling out everything owned by the class
     */
    destroy(): void {
        this.vcstate.model.destroy();
        this.vcstate.runtime.destroy();
        this.vcstate.vci = SetToInvalidObjectAtEndOfExecution(this.vcstate.vci);
        this.vcstate.model = SetToInvalidObjectAtEndOfExecution(this.vcstate.model);
        this.vcstate.runtime = SetToInvalidObjectAtEndOfExecution(this.vcstate.runtime);
        this.vcstate.undoManager = SetToInvalidObjectAtEndOfExecution(this.vcstate.undoManager);
        this.vcstate = SetToInvalidObjectAtEndOfExecution(this.vcstate);
        this.pr = SetToInvalidObjectAtEndOfExecution(this.pr);
    }
}
