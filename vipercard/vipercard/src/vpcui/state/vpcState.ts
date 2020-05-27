
/* auto */ import { UndoManager } from './vpcUndo';
/* auto */ import { VpcExecTop } from './../../vpc/codeexec/vpcScriptExecTop';
/* auto */ import { VpcOutsideImpl } from './vpcOutsideImpl';
/* auto */ import { VpcStateInterface } from './vpcInterface';
/* auto */ import { VpcTool } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { VpcModelTop } from './../../vpc/vel/velModelTop';
/* auto */ import { SetToInvalidObjectAtEndOfExecution } from './../../ui512/utils/util512Higher';
/* auto */ import { ElementObserver, ElementObserverNoOp, UI512PublicSettable } from './../../ui512/elements/ui512ElementGettable';

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
}

/**
 * VpcRuntimeOpts contains transient options that don't need to be undoable
 * nothing here is persisted as part of the stack
 */
export class VpcRuntimeOpts extends UI512PublicSettable {
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
     * if it should be persisted, make it a stack property
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
