
/* auto */ import { UndoManager, UndoableActionCreateVel, UndoableActionDeleteVel } from './vpcUndo';
/* auto */ import { VpcExecTop } from './../../vpc/codeexec/vpcScriptExecTop';
/* auto */ import { VpcOutsideImpl } from './vpcOutsideImpl';
/* auto */ import { VpcStateInterface } from './vpcInterface';
/* auto */ import { VpcElType, VpcTool } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcModelTop } from './../../vpc/vel/velModelTop';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { VpcElCard } from './../../vpc/vel/velCard';
/* auto */ import { VpcElButton } from './../../vpc/vel/velButton';
/* auto */ import { VpcElBg } from './../../vpc/vel/velBg';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { SetToInvalidObjectAtEndOfExecution } from './../../ui512/utils/util512Higher';
/* auto */ import { O, assertTrue, checkThrow } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512 } from './../../ui512/utils/util512';
/* auto */ import { ElementObserver, ElementObserverNoOp, UI512Settable } from './../../ui512/elements/ui512ElementGettable';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * holds all vipercard state
 */
export class VpcState {
    /* (started by _VpcDocLoader_) */
    model: VpcModelTop;

    /* (started by _VpcDocLoader_) */
    runtime: VpcRuntime;

    /* (started by _VpcDocLoader_) */
    undoManager: UndoManager;

    /* (started in _VpcPresenter_ constructor) */
    vci: VpcStateInterface;

    /**
     * create an element and add it to the model
     */
    createVel(parentId: string, type: VpcElType, insertIndex = -1, newId: O<string> = undefined) {
        if (!newId) {
            newId = this.model.stack.getNextId();
        }

        checkThrow(newId.match(/^[0-9]+$/), 'Ku|id should be purely numeric', newId);
        let cr = new UndoableActionCreateVel(newId, parentId, type, insertIndex);
        this.undoManager.changeSeenCreationDeletion(cr);
        cr.do(this.vci);
        return this.model.getByIdUntyped(newId);
    }

    /**
     * remove an element from the model, includng children
     */
    removeVel(vel: VpcElBase) {
        if (vel instanceof VpcElCard) {
            let totalCardNum = this.vci
                .getModel()
                .stack.bgs.map(bg => bg.cards.length)
                .reduce(Util512.add);
            checkThrow(totalCardNum > 1, '8%|Cannot delete the only card of a stack');
            let curCard = this.vci.getOptionS('currentCardId');
            checkThrow(vel.id !== curCard, 'cannot delete the current card');

            /* if deleting a card, first delete all of its children */
            let partsToRemove: VpcElBase[] = [];
            for (let part of vel.parts) {
                assertTrue(part instanceof VpcElButton || part instanceof VpcElField, '6M|bad type');
                partsToRemove.push(part);
            }

            for (let part of partsToRemove) {
                this.removeElemImpl(part);
            }
        }

        UndoableActionDeleteVel.checkIfCanDelete(vel, this.vci);
        this.removeElemImpl(vel);

        if (vel.getType() === VpcElType.Card) {
            let parentBg = this.model.getById(VpcElBg, vel.parentId);
            if (parentBg && parentBg.cards.length === 0) {
                /* if a bg has no remaining cards, let's remove the bg */
                this.removeElemImpl(parentBg);
            }
        }
    }

    /**
     * remove a single element from the model
     */
    protected removeElemImpl(vel: VpcElBase) {
        let action = new UndoableActionDeleteVel(vel, this.vci);
        this.undoManager.changeSeenCreationDeletion(action);
        action.do(this.vci);
    }
}

/**
 * VpcRuntimeOpts contains transient options that don't need to be undoable
 * nothing here is persisted as part of the stack
 */
export class VpcRuntimeOpts extends UI512Settable {
    protected _mimicCurrentTool = VpcTool.Browse;
    protected _screenLocked = false;
    protected _copiedVelId = '';
    protected _lastSavedStateId = '';
    constructor() {
        super('(VpcRuntimeOpts)');
    }

    /**
     * an option with getOptionS('foo') might either be on model.productOpts (so it's undoable)
     * or put here under VpcRuntimeOpts (so it's not undoable)
     * is this a VpcRuntimeOpts option?
     */
    isARuntimeOpt: { [key: string]: boolean } = {
        mimicCurrentTool: true,
        screenLocked: true,
        copiedVelId: true,
        lastSavedStateId: true
    };

    /**
     * set everything to undefined, to release ownership,
     * and cause any callers to throw exceptions if attempting to access
     */
    destroy() {
        this.observer = SetToInvalidObjectAtEndOfExecution(this.observer);
    }
}

/**
 * holds runtime state, not persisted
 */
export class VpcRuntime {
    /* set by _VpcDocLoader_, _VpcPresenter_::init */
    codeExec: VpcExecTop;
    outside: VpcOutsideImpl;
    useThisObserverForVpcEls: ElementObserver = new ElementObserverNoOp();
    opts = new VpcRuntimeOpts();

    /**
     * set everything to undefined, to release ownership,
     * and cause any callers to throw exceptions if attempting to access
     */
    destroy() {
        this.opts.destroy();
        this.opts = SetToInvalidObjectAtEndOfExecution(this.opts);
        this.codeExec = SetToInvalidObjectAtEndOfExecution(this.codeExec);
        this.useThisObserverForVpcEls = SetToInvalidObjectAtEndOfExecution(this.useThisObserverForVpcEls);
        this.outside = SetToInvalidObjectAtEndOfExecution(this.outside);
    }
}
