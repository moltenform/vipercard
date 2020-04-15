
/* auto */ import { getParsingObjects } from './../codeparse/vpcVisitor';
/* auto */ import { VarCollection, VariableCollectionConstants } from './../vpcutils/vpcVarCollection';
/* auto */ import { CodeLimits, CountNumericId, RememberHistory, VpcScriptMessage, VpcScriptMessageMsgBoxCode } from './../vpcutils/vpcUtils';
/* auto */ import { ExecuteStatement } from './vpcScriptExecStatement';
/* auto */ import { VpcExecFrameStack } from './vpcScriptExecFrameStack';
/* auto */ import { VpcCacheParsedAST, VpcCacheParsedCST } from './vpcScriptCaches';
/* auto */ import { VpcCurrentScriptStage } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { VpcBuiltinMsg, VpcErr, VpcErrStage, VpcTool } from './../vpcutils/vpcEnums';
/* auto */ import { CheckReservedWords } from './../codepreparse/vpcCheckReserved';
/* auto */ import { VpcElStack } from './../vel/velStack';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { VpcElBg } from './../vel/velBg';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { Util512BaseErr, assertWarn, respondUI512Error } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { ValHolder, slength } from './../../ui512/utils/util512';

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
    which = Math.random()
    globals = new VarCollection(CodeLimits.MaxGlobalVars, 'global');
    cardHistory = new RememberHistory();
    constants = new VariableCollectionConstants();
    check = new CheckReservedWords();
    runStatements = new ExecuteStatement();
    workQueue: VpcExecFrameStack[] = [];
    cbOnScriptError: O<(err: VpcErr) => void>;
    cbCauseUIRedraw: O<() => void>;
    fieldsRecentlyEdited: ValHolder<{ [id: string]: boolean }> = new ValHolder({});
    silenceMessagesForUIAction: ValHolder<O<VpcTool>> = new ValHolder(undefined);
    protected justSawRepeatedMousedown = false;
    protected readonly cachedCST: VpcCacheParsedCST;
    readonly cachedAST: VpcCacheParsedAST;
    protected readonly outside: OutsideWorldReadWrite;
    protected haveSentOpenStack = false;
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

        /* an error might be thrown, for example if
        the script has a lexer error. */
        try {
            newWork.getAndRunHandlerOrThrow();
            if (newWork.stack.length > 1) {
                this.workQueue.push(newWork);
            }
        } catch (e) {
            this.handleScriptException(e, 'scheduleCodeExec');
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
        if (!this.haveSentOpenStack) {
            this.haveSentOpenStack = true
            this.sendInitialOpenStackAndOpenCard();
        }

        if (this.workQueue.length === 0) {
            this.resetAfterFrameStackIsDone();
            return;
        }

        let codeRunningBefore = this.isCodeRunning();
        try {
            this.runTimesliceImpl(ms);
        } catch (e) {
            this.handleScriptException(e, 'runTimeslice');
        }

        let codeRunningAfter = this.isCodeRunning();
        if (codeRunningBefore !== codeRunningAfter && this.cbCauseUIRedraw) {
            this.cbCauseUIRedraw();
        }
    }

    /**
     * send the first opencard, openbackground, and openstack message
     */
    sendInitialOpenStackAndOpenCard() {
        {
            /* send openstack */
            let msg = new VpcScriptMessage(this.outside.Model().stack.id, VpcBuiltinMsg.Openstack);
            this.scheduleCodeExec(msg);
        }

        {
            /* send openbackground */
            let currentCard = this.outside.Model().getCardById(this.outside.GetCurrentCardId());
            let currentBg = this.outside.Model().getOwner(VpcElBg, currentCard);
            let msg = new VpcScriptMessage(currentBg.id, VpcBuiltinMsg.Openbackground);
            this.scheduleCodeExec(msg);
        }

        {
            /* send opencard */
            let msg = new VpcScriptMessage(this.outside.GetCurrentCardId(), VpcBuiltinMsg.Opencard);
            this.scheduleCodeExec(msg);
        }
    }

    resetAfterFrameStackIsDone() {
        this.outside.SetOption('screenLocked', false);
        this.outside.SetOption('mimicCurrentTool', VpcTool.Browse);

        /* nyi: new style ui actions */
        if (this.silenceMessagesForUIAction.val) {
            /* this.vci.setTool(this.silenceMessagesForUIAction.val) */
            this.silenceMessagesForUIAction.val = undefined;
        }
    }

    /**
     * run code
     */
    protected runTimesliceImpl(ms: number) {
        VpcCurrentScriptStage.latestVelID = undefined;
        VpcCurrentScriptStage.currentStage = VpcErrStage.Unknown;
        VpcCurrentScriptStage.latestSrcLineSeen = undefined;
        VpcCurrentScriptStage.latestDestLineSeen = undefined;
        VpcCurrentScriptStage.origClass = undefined;

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
            this.resetAfterFrameStackIsDone();
            return;
        }

        first.runTimesliceOrThrow(ms);

        if (first.stack.length <= 1) {
            /* we just finished a frame */
            this.workQueue.splice(0, 1);
            this.resetAfterFrameStackIsDone();
            return;
        }
    }

    protected handleScriptException(e: Error, context: string) {
        this.forceStopRunning()

        let scriptErr = Util512BaseErr.errAsCls<VpcErr>(VpcErr.name, e);
        if (!scriptErr) {
            scriptErr = VpcErr.createError('', 'runOneLine');
            scriptErr.addErr(e);
            scriptErr.origClass = (e as any).origClass ?? '(javascript)';
        }

        if (!scriptErr.scriptErrVelid) {
            scriptErr.scriptErrVelid = VpcCurrentScriptStage.latestVelID;
        }
        if (!scriptErr.stage) {
            scriptErr.stage = VpcCurrentScriptStage.currentStage;
        }
        if (!scriptErr.scriptErrLine) {
            scriptErr.scriptErrLine = VpcCurrentScriptStage.latestSrcLineSeen;
        }
        if (!scriptErr.lineObj) {
            scriptErr.lineObj = VpcCurrentScriptStage.latestDestLineSeen;
        }
        if (!scriptErr.dynamicCodeOrigin) {
            scriptErr.dynamicCodeOrigin = VpcCurrentScriptStage.dynamicCodeOrigin;
        }
        if (VpcCurrentScriptStage.origClass) {
            scriptErr.origClass = VpcCurrentScriptStage.origClass;
        }

        if (this.cbOnScriptError) {
            this.cbOnScriptError(scriptErr);
        } else {
            respondUI512Error(scriptErr.clsAsErr(), context);
        }
    }

    /**
     * run maintenance
     */
    doMaintenance() {
        let stack = this.outside.Model().stack
        VpcExecTop.checkNoRepeatedIds(stack);
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
