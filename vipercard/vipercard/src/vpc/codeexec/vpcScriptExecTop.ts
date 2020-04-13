
/* auto */ import { getParsingObjects } from './../codeparse/vpcVisitor';
/* auto */ import { VarCollection, VariableCollectionConstants } from './../vpcutils/vpcVarCollection';
/* auto */ import { CodeLimits, CountNumericId, RememberHistory, VpcScriptMessage, VpcScriptMessageMsgBoxCode } from './../vpcutils/vpcUtils';
/* auto */ import { ExecuteStatement } from './vpcScriptExecStatement';
/* auto */ import { VpcExecFrameStack } from './vpcScriptExecFrameStack';
/* auto */ import { VpcCacheParsedAST, VpcCacheParsedCST } from './vpcScriptCaches';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { OrdinalOrPosition, VpcBuiltinMsg, VpcElType, VpcScriptErrorBase, VpcTool, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { CheckReservedWords } from './../codepreparse/vpcCheckReserved';
/* auto */ import { VpcElStack } from './../vel/velStack';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { ValHolder, cast, slength } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
    readonly cachedAST: VpcCacheParsedAST;
    protected readonly outside: OutsideWorldReadWrite;
    constructor(outside: OutsideWorldReadWrite, public idGen: CountNumericId) {
        this.cachedAST = new VpcCacheParsedAST(this.idGen);
        this.cachedCST = new VpcCacheParsedCST();
        this.outside = outside;
        this.runStatements.outside = outside;
        this.runStatements.h.outside = outside;
        this.cardHistory.keepBeforeEnd = true;

        /* provide read-only access to the visitor */
        let visitor = getParsingObjects()[2];
        visitor.outside = outside as OutsideWorldRead;
    }

    //~ /**
    //~ *
    //~ */
    //~ goScript() {
    //~ try {
    //~ newWork.findHandlerToExec();
    //~ if (newWork.stack.length > 1) {
    //~ this.workQueue.push(newWork);
    //~ }
    //~ } catch (e) {
    //~ this.respondScriptError(e, VpcErrStage.);
    //~ }

    //~ return this.findHandlerOrThrowIfVelScriptHasSyntaxErrorImpl(code, handlername, velIdForErrMsg)
    //~ }

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
        checkThrow(false, 'nyi');
        //~ try {
        //~ newWork.findHandlerToExec();
        //~ if (newWork.stack.length > 1) {
        //~ this.workQueue.push(newWork);
        //~ }
        //~ } catch (e) {
        //~ if (e.isVpcScriptError) {
        //~ this.respondScriptError(e);
        //~ }
        //~ }
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
        try {
            first.runTimeslice(ms);
        } catch (e) {
            this.respondScriptError(e);
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
    //~ getOrGenerateScriptErr(e: any): VpcScriptErrorBase {
    //~ if (e instanceof VpcScriptErrorBase) {
    //~ return e;
    //~ } else if (e.attachErr && e.attachErr instanceof VpcScriptErrorBase) {
    //~ return e.attachErr;
    //~ } else if (e.vpcScriptErr && e.vpcScriptErr instanceof VpcScriptErrorBase) {
    //~ return e.vpcScriptErr;
    //~ } else {
    //~ let scrRuntime = new VpcScriptRuntimeError();
    //~ scrRuntime.isScriptException = false;
    //~ scrRuntime.isExternalException = !e.isUi512Error;
    //~ scrRuntime.details = e.toString();
    //~ scrRuntime.e = e;
    //~ return scrRuntime;
    //~ }
    //~ }

    /**
     * add context information to the error and call cbOnScriptError
     */
    protected respondScriptError(e: any) {
        assertTrue(false, 'nyi');
        //~ this.forceStopRunning();
        //~ let err = this.getOrGenerateScriptErr(e);

        //~ if (this.cbOnScriptError) {
        //~ this.cbOnScriptError(err);
        //~ } else {
        //~ alert(`5i|script error occurred on line ${e.vpcLine} of el ${e.vpcVelId}`);
        //~ }
    }

    /**
     * run maintenance
     */
    doMaintenance() {
        let refStack = new RequestedVelRef(VpcElType.Stack);
        refStack.lookByRelative = OrdinalOrPosition.This;
        let got = this.outside.ResolveVelRef(refStack);
        if (got && got[0]) {
            VpcExecTop.checkNoRepeatedIds(cast(VpcElStack, got[0]));
        }
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

    /**
     * make sure there are no repeated ids
     */
    static checkNoRepeatedIds(stack: VpcElStack) {
        let idsSeen = new Map<string, boolean>();
        for (let vel of stack.iterEntireStack()) {
            if (idsSeen.has(vel.id)) {
                /* use assertwarn, not throw, because it's sure to show
                a dialog, but the user can also ignore subsquent ones */
                assertWarn(false, 'duplicate id seen: ' + vel.id);
            }

            idsSeen.set(vel.id, true);
        }
    }
}
