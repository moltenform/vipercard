
/* auto */ import { assertTrue, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ElementObserver, ElementObserverNoOp, UI512Settable } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcModelTop } from '../../vpc/vel/velModelTop.js';
/* auto */ import { VpcExecTop } from '../../vpc/codeexec/vpcScriptExecTop.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { UndoManager, UndoableActionCreateVel, UndoableActionDeleteVel } from '../../vpcui/state/vpcUndo.js';
/* auto */ import { VpcOutsideImpl } from '../../vpcui/state/vpcOutsideImpl.js';

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
    createVel(parentId: string, type: VpcElType, insertIndex = -1, newId?: string) {
        if (!newId) {
            let nextId = this.model.stack.getN('increasingnumberforid');
            this.model.stack.set('increasingnumberforid', nextId + 1);
            newId = nextId.toString();
        }

        checkThrow(newId.match(/^[0-9]+$/), 'id should be purely numeric', newId);
        let cr = new UndoableActionCreateVel(newId, parentId, type, insertIndex);
        this.undoManager.changeSeenCreationDeletion(cr);
        cr.do(this.vci);
        return this.model.getByIdUntyped(newId);
    }

    /**
     * remove an element from the model, includng children
     */
    removeVel(vel: VpcElBase) {
        UndoableActionDeleteVel.checkIfCanDelete(vel, this.vci);

        if (vel instanceof VpcElCard) {
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

        this.removeElemImpl(vel);

        if (vel.getType() === VpcElType.Card) {
            let parentBg = this.model.getById(vel.parentId, VpcElBg);
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
        this.observer = undefined as any; /* destroy() */
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
        this.opts = undefined as any; /* destroy() */
        this.codeExec = undefined as any; /* destroy() */
        this.useThisObserverForVpcEls = undefined as any; /* destroy() */
        this.outside = undefined as any; /* destroy() */
    }
}
