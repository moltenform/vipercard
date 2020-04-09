
/* auto */ import { getParsingObjects } from './../codeparse/vpcVisitor';
/* auto */ import { VarCollection, VariableCollectionConstants } from './../vpcutils/vpcVarCollection';
/* auto */ import { CodeLimits, RememberHistory, VpcScriptErrorBase, VpcScriptMessage, VpcScriptMessageMsgBoxCode, VpcScriptRuntimeError } from './../vpcutils/vpcUtils';
/* auto */ import { ExecuteStatement } from './vpcScriptExecStatement';
/* auto */ import { VpcExecFrameStack } from './vpcScriptExecFrameStack';
/* auto */ import { VpcCacheParsedAST, VpcCacheParsedCST } from './vpcScriptCaches';
/* auto */ import { VpcBuiltinMsg, VpcTool } from './../vpcutils/vpcEnums';
/* auto */ import { CheckReservedWords } from './../codepreparse/vpcCheckReserved';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { O, UI512ErrorHandling, assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { ValHolder, slength } from './../../ui512/utils/util512';

/**
 * script execution in ViperCard
 *
 * user actions will schedule code execution by adding to the workQueue
 * periodically the Presenter within onIdle will call runTimeslice
 * and we'll start running code
 */
export class VpcExecTop {
    globals = new VarCollection(CodeLimits.MaxGlobalVars, 'global');
    cardHistory = new RememberHistory();
    constants = new VariableCollectionConstants();
    check = new CheckReservedWords();
    runStatements = new ExecuteStatement();
    workQueue: VpcExecFrameStack[] = [];
    cbOnScriptError: O<(err: VpcScriptErrorBase) => void>;
    cbCauseUIRedraw: O<() => void>;
    lastEncounteredScriptErr: O<VpcScriptErrorBase>;
    fieldsRecentlyEdited: ValHolder<{ [id: string]: boolean }> = new ValHolder({});
    silenceMessagesForUIAction: ValHolder<O<VpcTool>> = new ValHolder(undefined);
    protected justSawRepeatedMousedown = false;
    protected readonly cachedCST: VpcCacheParsedCST;
    protected readonly cachedAST: VpcCacheParsedAST;
    protected readonly outside: OutsideWorldReadWrite;
    constructor(outside: OutsideWorldReadWrite) {
        this.cachedAST = new VpcCacheParsedAST();
        this.cachedCST = new VpcCacheParsedCST();
        this.outside = outside;
        this.runStatements.outside = outside;
        this.runStatements.h.outside = outside;
        this.cardHistory.keepBeforeEnd = true;

        /* provide read-only access to the visitor */
        let visitor = getParsingObjects()[2];
        visitor.outside = outside as OutsideWorldRead;
    }

    /**
     * add an entry to the queue, scheduling code execution
     */
    scheduleCodeExec(msg: VpcScriptMessage) {
        if (
            this.silenceMessagesForUIAction.val &&
            this.silenceMessagesForUIAction.val !== VpcTool.Browse &&
            !(msg instanceof VpcScriptMessageMsgBoxCode)
        ) {
            /* all messages are silenced  */
            return;
        }

        let newWork = new VpcExecFrameStack(
            this.outside,
            this.cachedCST,
            this.cachedAST,
            this.runStatements,
            this.constants,
            this.globals,
            this.cardHistory,
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

        /* an error might be thrown, e.g. the script causes a lexer error  */
        let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow;
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
        if (this.silenceMessagesForUIAction.val && this.workQueue.length === 0) {
            /* nyi: new style ui actions */
            /* this.vci.setTool(this.silenceMessagesForUIAction.val) */
            this.silenceMessagesForUIAction.val = undefined;
            return;
        }

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
        let storedBreakOnThrow = UI512ErrorHandling.breakOnThrow;
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
     * get an instance of VpcScriptErrorBase, or create if needed
     */
    protected getOrGenerateScriptErr(e: any): VpcScriptErrorBase {
        if (e instanceof VpcScriptErrorBase) {
            return e;
        } else if (e.attachErr && e.attachErr instanceof VpcScriptErrorBase) {
            return e.attachErr;
        } else if (e.vpcScriptErr && e.vpcScriptErr instanceof VpcScriptErrorBase) {
            return e.vpcScriptErr;
        } else {
            let scrRuntime = new VpcScriptRuntimeError();
            scrRuntime.isScriptException = false;
            scrRuntime.isExternalException = !e.isUi512Error;
            scrRuntime.details = e.toString();
            scrRuntime.e = e;
            return scrRuntime;
        }
    }

    /**
     * add context information to the error and call cbOnScriptError
     */
    protected respondScriptError(e: any) {
        this.forceStopRunning();
        let err = this.getOrGenerateScriptErr(e);

        if (this.cbOnScriptError) {
            this.cbOnScriptError(err);
        } else {
            assertTrue(false, `5i|script error occurred on line ${e.vpcLine} of el ${e.vpcVelId}`);
        }
    }

    /**
     * run maintenance
     */
    doMaintenance() {
        // currently has no maintenance
    }

    /**
     * run messagebox code
     */
    runMsgBoxCodeOrThrow(codeBody: string, curCardId: string, addIntentionalError: boolean) {
        let msg = new VpcScriptMessageMsgBoxCode(curCardId, VpcBuiltinMsg.SendCode);
        msg.msgBoxCodeBody = codeBody;
        msg.addIntentionalError = addIntentionalError;
        this.scheduleCodeExec(msg);
    }
}
