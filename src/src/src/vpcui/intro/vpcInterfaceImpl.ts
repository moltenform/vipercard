
/* auto */ import { O, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { PaintOntoCanvas } from '../../ui512/draw/ui512ImageSerialize.js';
/* auto */ import { ElementObserverVal } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { EventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512CompBase } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { OrdinalOrPosition, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/vpcOutsideInterfaces.js';
/* auto */ import { VpcModel } from '../../vpc/vel/velModel.js';
/* auto */ import { CodeExecFrame } from '../../vpc/codeexec/vpcScriptExecFrame.js';
/* auto */ import { CodeExecFrameStack } from '../../vpc/codeexec/vpcScriptExecFrameStack.js';
/* auto */ import { CodeExecTop } from '../../vpc/codeexec/vpcScriptExecTop.js';
/* auto */ import { TypeOfUndoAction, VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcApplication } from '../../vpcui/state/vpcState.js';
/* auto */ import { VpcAppControllerEvents } from '../../vpcui/presentation/vpcPresenterEvents.js';
/* auto */ import { VpcAppController } from '../../vpcui/presentation/vpcPresenter.js';

export class VpcStateInterfaceCompleted implements VpcStateInterface {
    protected appl: VpcApplication;
    protected ctrller: VpcAppController;
    init(appl: VpcApplication, ctrller: VpcAppController) {
        this.appl = appl;
        this.ctrller = ctrller;
    }

    getOption_s(prop: string) {
        if (this.appl.runtime.opts.isARuntimeOpt[prop]) {
            return this.appl.runtime.opts.get_s(prop);
        } else {
            return this.appl.model.productOpts.get_s(prop);
        }
    }
    getOption_n(prop: string) {
        if (this.appl.runtime.opts.isARuntimeOpt[prop]) {
            return this.appl.runtime.opts.get_n(prop);
        } else {
            return this.appl.model.productOpts.get_n(prop);
        }
    }

    getOption_b(prop: string) {
        if (this.appl.runtime.opts.isARuntimeOpt[prop]) {
            return this.appl.runtime.opts.get_b(prop);
        } else {
            return this.appl.model.productOpts.get_b(prop);
        }
    }

    setOption<T extends ElementObserverVal>(prop: string, newval: T) {
        if (this.appl.runtime.opts.isARuntimeOpt[prop]) {
            return this.appl.runtime.opts.set(prop, newval);
        } else {
            return this.appl.model.productOpts.set(prop, newval);
        }
    }

    performUndo(): boolean {
        return this.appl.undoManager.performUndo(this);
    }

    performRedo(): boolean {
        return this.appl.undoManager.performRedo(this);
    }

    getCurrentStateId(): string {
        return this.appl && this.appl.undoManager && this.appl.undoManager.getCurrentStateId();
    }

    findExecFrameStack(): [O<CodeExecFrameStack>, O<CodeExecFrame>] {
        let frstack = this.appl.runtime.codeExec.workQueue[0];
        if (frstack) {
            return [frstack, frstack.stack[frstack.stack.length - 1]];
        } else {
            return [undefined, undefined];
        }
    }

    getModel(): VpcModel {
        return this.appl.model;
    }
    isCodeRunning(): boolean {
        return this.appl.runtime.codeExec.isCodeRunning();
    }

    rawRevive(readded: VpcElBase) {
        checkThrow(
            !this.getCodeExec().isCodeRunning(),
            "8#|currently can't add or remove an element while code is running"
        );
        this.causeFullRedraw();
        readded.observer = this.appl.runtime.useThisObserverForVpcEls;
        this.getModel().addIdToMapOfElements(readded);
        this.getCodeExec().updateChangedCode(readded, readded.get_s('script'));
    }

    rawCreate<T extends VpcElBase>(velid: string, parentid: string, ctr: { new (...args: any[]): T }): T {
        this.causeFullRedraw();
        let vel = new ctr(velid, parentid);
        checkThrow(vel && vel.isVpcElBase, `8*|must be a VpcElBase`);
        vel.observer = this.appl.runtime.useThisObserverForVpcEls;
        this.appl.model.addIdToMapOfElements(vel);
        return vel;
    }

    createElem(parent_id: string, type: VpcElType, insertIndex: number, specifyId?: string): VpcElBase {
        return this.appl.createElem(parent_id, type, insertIndex, specifyId);
    }

    removeElem(vel: VpcElBase) {
        this.appl.removeElem(vel);
    }

    doWithoutAbilityToUndo(fn: () => void) {
        this.appl.undoManager.doWithoutAbilityToUndo(fn);
    }

    doWithoutAbilityToUndoExpectingNoChanges(fn: () => void) {
        this.appl.undoManager.doWithoutAbilityToUndoExpectingNoChanges(fn);
    }

    undoableAction(fn: () => void, typ?: TypeOfUndoAction) {
        this.appl.undoManager.undoableAction(fn, typ || TypeOfUndoAction.StartNewAction);
    }

    scheduleScriptEventSend(d: EventDetails) {
        return VpcAppControllerEvents.scheduleScriptMsg(this.ctrller, this, d);
    }

    UI512App() {
        return this.ctrller.app;
    }

    getController() {
        return this.ctrller;
    }

    placeCallbackInQueue(cb: () => void) {
        return this.ctrller.placeCallbackInQueue(cb);
    }
    bounds() {
        return this.ctrller.bounds;
    }
    userBounds() {
        return this.ctrller.userBounds;
    }
    getCurrentCardNum() {
        return this.ctrller.getCurrentCardNum();
    }
    setCurrentCardNum(pos: OrdinalOrPosition) {
        return this.ctrller.setCurrentCardNum(pos);
    }
    getTool() {
        return this.ctrller.getTool();
    }
    setTool(n: VpcTool) {
        return this.ctrller.setTool(n);
    }
    setNonModalDialog(frm: O<UI512CompBase>) {
        return this.ctrller.lyrNonModalDlgHolder.setNonModalDialog(frm);
    }
    getCurrentFocusVelField() {
        return this.ctrller.getSelectedFieldVel();
    }
    setCurrentFocus(s: O<string>) {
        return this.ctrller.setCurrentFocus(s);
    }
    getCurrentFocus() {
        return this.ctrller.getCurrentFocus();
    }
    performMenuAction(s: string) {
        return this.ctrller.performMenuAction(s);
    }
    commitSimulatedClicks(queue: PaintOntoCanvas[]) {
        return this.ctrller.lyrPaintRender.commitSimulatedClicks(queue);
    }
    causeUIRedraw() {
        return this.ctrller.lyrModelRender.uiRedrawNeeded();
    }
    causeFullRedraw() {
        return this.ctrller.lyrModelRender.fullRedrawNeeded();
    }

    getOutside(): OutsideWorldReadWrite {
        return this.appl.runtime.outside;
    }

    getCodeExec(): CodeExecTop {
        return this.appl.runtime.codeExec;
    }

    destroy(): void {
        this.appl.appli = undefined as any;
        this.appl.model.destroy();
        this.appl.model = undefined as any;
        this.appl.runtime.destroy();
        this.appl.runtime = undefined as any;
        this.appl.undoManager = undefined as any;
        this.appl = undefined as any;
        this.ctrller = undefined as any;
    }
}
