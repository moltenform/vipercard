
/* auto */ import { O, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512PaintDispatch } from '../../ui512/draw/ui512DrawPaintDispatch.js';
/* auto */ import { ElementObserverVal } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { EventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { UI512CompBase } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { OrdinalOrPosition, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcModelTop } from '../../vpc/vel/velModelTop.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { VpcExecFrame } from '../../vpc/codeexec/vpcScriptExecFrame.js';
/* auto */ import { VpcExecFrameStack } from '../../vpc/codeexec/vpcScriptExecFrameStack.js';
/* auto */ import { VpcExecTop } from '../../vpc/codeexec/vpcScriptExecTop.js';
/* auto */ import { TypeOfUndoAction, VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcState } from '../../vpcui/state/vpcState.js';
/* auto */ import { VpcPresenterEvents } from '../../vpcui/presentation/vpcPresenterEvents.js';
/* auto */ import { VpcPresenter } from '../../vpcui/presentation/vpcPresenter.js';

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
            return this.vcstate.model.productOpts.set(prop, newVal);
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
            return [frStack, frStack.stack[frStack.stack.length - 1]];
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
        checkThrow(
            !this.getCodeExec().isCodeRunning(),
            "8#|currently can't add or remove an element while code is running"
        );

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
        checkThrow(vel && vel.isVpcElBase, `8*|must be a VpcElBase`);
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
    undoableAction(fn: () => void, typ?: TypeOfUndoAction) {
        this.vcstate.undoManager.undoableAction(fn, typ || TypeOfUndoAction.StartNewAction);
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
     * go to a card
     */
    setCurrentCardNum(pos: OrdinalOrPosition) {
        return this.pr.setCurrentCardNum(pos);
    }

    /**
     * get current card id
     */
    getCurrentCardId() {
        return this.getOptionS('currentCardId')
    }

    /**
     * go to a card
     */
    setCurrentCardId(id:string, b:boolean) {
        return this.pr.setCurrentCardId(id, b)
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
     * releases memory by nulling out everything owned by the class
     */
    destroy(): void {
        this.vcstate.vci = undefined as any; /* destroy() */
        this.vcstate.model.destroy();
        this.vcstate.model = undefined as any; /* destroy() */
        this.vcstate.runtime.destroy();
        this.vcstate.runtime = undefined as any; /* destroy() */
        this.vcstate.undoManager = undefined as any; /* destroy() */
        this.vcstate = undefined as any; /* destroy() */
        this.pr = undefined as any; /* destroy() */
    }
}
