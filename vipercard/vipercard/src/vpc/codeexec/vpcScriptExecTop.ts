
/* auto */ import { O, UI512ErrorHandling, assertTrue, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { slength } from '../../ui512/utils/utils512.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { CodeLimits, CountNumericId, VpcScriptErrorBase, VpcScriptMessage, VpcScriptRuntimeError } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VarCollection, VariableCollectionConstants } from '../../vpc/vpcutils/vpcVarCollection.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpcCheckReserved.js';
/* auto */ import { VpcAllCode } from '../../vpc/codepreparse/vpcAllCode.js';
/* auto */ import { VpcCacheParsed } from '../../vpc/codeexec/vpcScriptCacheParsed.js';
/* auto */ import { ExecuteStatement } from '../../vpc/codeexec/vpcScriptExecStatement.js';
/* auto */ import { VpcExecFrameStack } from '../../vpc/codeexec/vpcScriptExecFrameStack.js';

/**
 * script execution in ViperCard
 *
 * user actions will schedule code execution by adding to the workQueue
 * periodically the Presenter within onIdle will call runTimeslice
 * and we'll start running code
 */
export class VpcExecTop {
    globals = new VarCollection(CodeLimits.MaxGlobalVars, 'global');
    constants = new VariableCollectionConstants();
    check = new CheckReservedWords();
    runStatements = new ExecuteStatement();
    cacheParsed = new VpcCacheParsed();
    workQueue: VpcExecFrameStack[] = [];
    cbOnScriptError: O<(err: VpcScriptErrorBase) => void>;
    cbCauseUIRedraw: O<() => void>;
    lastEncounteredScriptErr: O<VpcScriptErrorBase>;
    protected justSawRepeatedMousedown = false;
    protected readonly code: VpcAllCode;
    protected readonly outside: OutsideWorldReadWrite;
    constructor(idGen: CountNumericId, outside: OutsideWorldReadWrite) {
        this.code = new VpcAllCode(idGen);
        this.outside = outside;
        this.runStatements.outside = outside;
        this.cacheParsed.visitor.outside = outside as OutsideWorldRead;
    }

    /**
     * add an entry to the queue, scheduling code execution
     */
    scheduleCodeExec(msg: VpcScriptMessage) {
        let newWork = new VpcExecFrameStack(
            this.code,
            this.outside,
            this.cacheParsed,
            this.runStatements,
            this.constants,
            this.globals,
            this.check,
            msg
        );

        let isRepeatedKeydown = newWork.originalMsg.msgName === 'afterkeydown' && newWork.originalMsg.keyRepeated;
        if (isRepeatedKeydown && this.workQueue.length > 2) {
            /* don't queue up a key that is held down at least beyond 3 evts */
            return;
        } else if (
            (newWork.originalMsg.msgName === 'idle' || newWork.originalMsg.msgName === 'mousewithin') &&
            this.workQueue.length > 0
        ) {
            /* don't queue up an onidle */
            return;
        }

        /* don't let keydowns starve everyone else! */
        if (isRepeatedKeydown) {
            if (this.justSawRepeatedMousedown) {
                return;
            }

            this.justSawRepeatedMousedown = true;
        } else {
            this.justSawRepeatedMousedown = false;
        }

        /* an error might be thrown, e.g the script causes a lexer error  */
        let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow
        UI512ErrorHandling.breakOnThrow = false;

        try {
            newWork.findHandlerToExec();
            if (newWork.stack.length > 1) {
                this.workQueue.push(newWork);
            }
        } catch (e) {
            if (e.isVpcScriptError) {
                this.respondScriptError(e);
            }
        } finally {
            UI512ErrorHandling.breakOnThrow = storedBreakOnThrow;
        }
    }

    /**
     * retrieve code for a vel
     */
    getCompiledScript(id: string, rawScript:string) {
        return this.code.getCompiledScript(id, rawScript);
    }

    /**
     * remove code from a vel
     */
    removeScript(id: string) {
        checkThrow(
            !this.isCodeRunning(),
            "7z|deleting an element while code is running... we haven't tested this, so we don't support it"
        );
        this.code.remove(id);
    }

    /**
     * is code currently running?
     */
    isCodeRunning() {
        /* check hasRunCode to make ui less gummed up */
        return this.workQueue.length > 0 && this.workQueue[0].hasRunCode;
    }

    /**
     * force code to stop running
     */
    forceStopRunning() {
        this.workQueue.length = 0;
        if (this.cbCauseUIRedraw) {
            this.cbCauseUIRedraw();
        }
    }

    /**
     * run code, and trigger UI refresh
     */
    runTimeslice(ms: number) {
        let codeRunningBefore = this.isCodeRunning();
        this.runTimesliceImpl(ms);
        let codeRunningAfter = this.isCodeRunning();
        if (codeRunningBefore !== codeRunningAfter && this.cbCauseUIRedraw) {
            this.cbCauseUIRedraw();
        }
    }

    /**
     * run code
     */
    protected runTimesliceImpl(ms: number) {
        let first = this.workQueue[0];
        let currentCardId = this.outside.GetOptionS('currentCardId');

        if (!this.workQueue.length || !first) {
            /* no code is running. */
            /* make sure screen is unlocked, just in case */
            this.outside.SetOption('screenLocked', false);
            return;
        }

        if (
            !first.hasRunCode &&
            slength(first.originalMsg.cardWhenFired) > 0 &&
            first.originalMsg.causedByUserAction &&
            first.originalMsg.cardWhenFired !== currentCardId
        ) {
            /* important: don't run queued messages that were created on a different card */
            this.workQueue.splice(0, 1);
            return;
        }

        if (first.stack.length <= 1) {
            /* we just finished a handler */
            this.workQueue.splice(0, 1);
            this.outside.SetOption('screenLocked', false);
            this.outside.SetOption('mimicCurrentTool', VpcTool.Browse);
            return;
        }

        /* allow exceptions, because we will catch them here */
        let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow
        UI512ErrorHandling.breakOnThrow = false;

        try {
            first.runTimeslice(ms);
        } catch (e) {
            this.respondScriptError(e);
        } finally {
            UI512ErrorHandling.breakOnThrow = storedBreakOnThrow;
        }

        if (first.stack.length <= 1) {
            /* we just finished a handler */
            this.workQueue.splice(0, 1);
            this.outside.SetOption('screenLocked', false);
            this.outside.SetOption('mimicCurrentTool', VpcTool.Browse);
            return;
        }
    }

    /**
     * update a vel's code
     */
    updateChangedCode(owner: VpcElBase, code: string) {
        checkThrow(!this.isCodeRunning(), "7y|we don't currently support changing code while code is running");
        let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow
        UI512ErrorHandling.breakOnThrow = false;
        try {
            this.code.updateCode(code, owner.id);
        } finally {
            UI512ErrorHandling.breakOnThrow = storedBreakOnThrow;
        }
    }

    /**
     * add context information to the error and call cbOnScriptError
     */
    protected respondScriptError(e: any) {
        this.forceStopRunning();
        let vpcScriptErr = e.vpcScriptErr as VpcScriptErrorBase;
        if (!vpcScriptErr) {
            let scrRuntime = new VpcScriptRuntimeError();
            scrRuntime.isScriptException = false;
            scrRuntime.isExternalException = !e.isUi512Error;
            scrRuntime.details = e.message;
            scrRuntime.e = e;
            vpcScriptErr = scrRuntime;
        }

        if (this.cbOnScriptError) {
            this.cbOnScriptError(vpcScriptErr);
        } else {
            assertTrue(false, `5i|script error occurred on line ${e.vpcLine} of el ${e.vpcVelId}`);
        }
    }

    /**
     * run maintenance
     */
    doMaintenance() {
        this.code.doMaintenance(this.outside)
    }
}
