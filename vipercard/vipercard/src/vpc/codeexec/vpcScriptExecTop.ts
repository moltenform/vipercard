
/* auto */ import { VarCollection, VariableCollectionConstants } from './../vpcutils/vpcVarCollection';
/* auto */ import { VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { CodeLimits, CountNumericId, RememberHistory, VpcScriptMessage, VpcScriptMessageMsgBoxCode } from './../vpcutils/vpcUtils';
/* auto */ import { ExecuteStatement } from './vpcScriptExecStatement';
/* auto */ import { VpcExecFrameStack } from './vpcScriptExecFrameStack';
/* auto */ import { VpcExecFrame } from './vpcScriptExecFrame';
/* auto */ import { VpcCacheParsedAST, VpcCacheParsedCST } from './vpcScriptCaches';
/* auto */ import { VpcCurrentScriptStage } from './../codepreparse/vpcPreparseCommon';
/* auto */ import { PropAdjective, VpcBuiltinMsg, VpcElType, VpcErr, VpcErrStage, VpcTool } from './../vpcutils/vpcEnums';
/* auto */ import { CheckReservedWords } from './../codepreparse/vpcCheckReserved';
/* auto */ import { VpcElStack } from './../vel/velStack';
/* auto */ import { VelResolveName } from './../vel/velResolveName';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { VpcElBg } from './../vel/velBg';
/* auto */ import { VpcElBase } from './../vel/velBase';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { Util512BaseErr, assertWarn, respondUI512Error } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, OrderedHash, ValHolder, lastIfThere, orderedHashSummary, slength } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/* see the section in internaldocs.md to read how we execute code. */

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
            this.haveSentOpenStack = true;
            this.sendInitialOpenStackAndOpenCard();
        }

        if (this.workQueue.length === 0) {
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
            this.resetAfterFrameStackIsDone();
            this.cbCauseUIRedraw();
        }
    }

    /**
     * send the first opencard, openbackground, and openstack message
     */
    sendInitialOpenStackAndOpenCard() {
        {
            /* send openstack */
            let msg = new VpcScriptMessage(this.outside.Model().stack.id555, VpcBuiltinMsg.Openstack);
            this.scheduleCodeExec(msg);
        }

        {
            /* send openbackground */
            let currentCard = this.outside.Model().getCardById(this.outside.GetCurrentCardId());
            let currentBg = this.outside.Model().getOwner555(VpcElBg, currentCard);
            let msg = new VpcScriptMessage(currentBg.id555, VpcBuiltinMsg.Openbackground);
            this.scheduleCodeExec(msg);
        }

        {
            /* send opencard */
            let msg = new VpcScriptMessage(this.outside.GetCurrentCardId(), VpcBuiltinMsg.Opencard);
            this.scheduleCodeExec(msg);
        }
    }

    /**
     * some state should be reset after the call returns.
     */
    resetAfterFrameStackIsDone() {
        VpcCurrentScriptStage.latestSrcLineSeen = undefined;
        VpcCurrentScriptStage.latestDestLineSeen = undefined;
        VpcCurrentScriptStage.origClass = undefined;
        VpcCurrentScriptStage.latestVelID = undefined;
        VpcCurrentScriptStage.dynamicCodeOrigin = undefined;
        VpcCurrentScriptStage.currentStage = VpcErrStage.Unknown;

        this.outside.SetOption('screenLocked', false);
        this.outside.SetOption('mimicCurrentTool', VpcTool.Browse);
        this.outside.Model().productOpts.setProductOpt('itemDel', ',');
        this.globals.set('$currentVisEffect', VpcValS(''));

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
        VpcCurrentScriptStage.dynamicCodeOrigin = undefined;

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

    /**
     * respond to an exception when running a script.
     * because the error is likely from the last line that
     * was encountered, we'll attach the information from
     * VpcCurrentScriptStage to the error.
     */
    protected handleScriptException(e: Error, context: string) {
        let stackTrace = new GuessStackTrace(this, this.outside).go();
        this.forceStopRunning();

        let scriptErr = Util512BaseErr.errIfExactCls<VpcErr>('VpcErr', e);
        if (!scriptErr) {
            scriptErr = VpcErr.createError('', 'runOneLine');
            scriptErr.addErr(e);
            scriptErr.origClass = (e as any).typeName ?? '(javascript)';
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
        if (!scriptErr.traceInfo) {
            scriptErr.traceInfo = stackTrace;
        }
        if (VpcCurrentScriptStage.origClass) {
            scriptErr.origClass = VpcCurrentScriptStage.origClass;
        }

        /* for errors in dynamic code, the line number should be adjusted */
        if (scriptErr.dynamicCodeOrigin) {
            scriptErr.origClass += ';';
            scriptErr.origClass += scriptErr.scriptErrVelid;
            scriptErr.origClass += ';';
            scriptErr.origClass += scriptErr.scriptErrLine;
            scriptErr.scriptErrVelid = scriptErr.dynamicCodeOrigin[0];
            scriptErr.scriptErrLine = scriptErr.dynamicCodeOrigin[1];
        }

        /* reset state */
        VpcCurrentScriptStage.latestSrcLineSeen = undefined;
        VpcCurrentScriptStage.latestDestLineSeen = undefined;
        VpcCurrentScriptStage.origClass = undefined;
        VpcCurrentScriptStage.latestVelID = undefined;
        VpcCurrentScriptStage.dynamicCodeOrigin = undefined;
        VpcCurrentScriptStage.currentStage = VpcErrStage.Unknown;

        /* reset flags */
        this.resetAfterFrameStackIsDone();

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
        let stack = this.outside.Model().stack;
        VpcExecTop.checkNoRepeatedIds(stack);
    }

    /**
     * run messagebox code
     */
    runMsgBoxCodeOrThrow(codeBody: string, curCardId: string, addReturnToMsgBox: boolean) {
        let msg = new VpcScriptMessageMsgBoxCode(curCardId, VpcBuiltinMsg.SendCode);
        msg.msgBoxCodeBody = codeBody;
        msg.returnToMsgBox = addReturnToMsgBox;
        this.scheduleCodeExec(msg);
    }

    /**
     * make sure there are no repeated ids
     */
    static checkNoRepeatedIds(stack: VpcElStack) {
        let idsSeen = new MapKeyToObjectCanSet<boolean>();
        idsSeen.set(stack.parentId555, true);
        for (let vel of stack.iterEntireStack()) {
            if (idsSeen.exists(vel.id555)) {
                /* use assertwarn, not throw, because it's sure to show
                a dialog, but the user can also ignore subsequent ones */
                assertWarn(false, 'R?|duplicate id seen: ' + vel.id555);
            }

            idsSeen.set(vel.id555, true);
        }

        /* check that each bg element is correctly present on each card */
        let idsSeenAcrossBgs = new MapKeyToObjectCanSet<boolean>();
        for (let bg of stack.bgs) {
            let template = bg.getTemplateCard()
            let bgParts = template.parts.filter(vel=>vel.getS('is_bg_velement_id').length)
            let bgIdsSeen = new OrderedHash<VpcElType>()
            for (let pt of bgParts) {
                assertWarn(!idsSeenAcrossBgs.exists(pt.getS('is_bg_velement_id')), "bg id seen twice across bgs")
                idsSeenAcrossBgs.add(pt.getS('is_bg_velement_id'), true)
                assertWarn(!bgIdsSeen.find(pt.getS('is_bg_velement_id')), "bg id seen twice")
                bgIdsSeen.insertNew(pt.getS('is_bg_velement_id'), pt.getType())
            }

            let expect = orderedHashSummary(bgIdsSeen)
            for (let cd of bg.cards) {
                if (cd.id555 === template.id555) {
                    continue
                }

                let bgIdsSeenThisCd = new OrderedHash<VpcElType>()
                for (let pt of bgParts) {
                    assertWarn(!bgIdsSeenThisCd.find(pt.getS('is_bg_velement_id')), "bg id seen twice")
                    bgIdsSeenThisCd.insertNew(pt.getS('is_bg_velement_id'), pt.getType())
                }

                assertWarn(expect, orderedHashSummary(bgIdsSeenThisCd), '')
            }
        }
    }
}

/**
 * get a stack trace, just to show in the ui
 */
export class GuessStackTrace {
    constructor(protected top: VpcExecTop, protected outside: OutsideWorldReadWrite) {}
    protected guessLatestFrame(): O<VpcExecFrame>[] {
        let lastSeen = VpcCurrentScriptStage.latestDestLineSeen;
        for (let stack of this.top.workQueue) {
            let lastFrame = lastIfThere(stack.stack);
            if (lastFrame) {
                let lns = lastFrame?.codeSection?.lines;
                if (lns && (lns[lastFrame.getOffset()] === lastSeen || lns[lastFrame.getOffset() - 1] === lastSeen)) {
                    return stack.stack;
                }
            }
        }

        return [];
    }

    go() {
        /* vel, handlername, origoffset */
        let ret: [string, string, number][] = [];
        let stack = this.guessLatestFrame();
        if (stack) {
            stack.reverse();
            for (let frame of stack) {
                if (frame) {
                    let velId = frame.meId;
                    let origoffset = frame?.codeSection?.lines[frame.getOffset() - 1]?.firstToken?.startLine;
                    origoffset = origoffset ?? 0;
                    ret.push([velId, frame.handlerName, origoffset]);
                }
            }
        }

        return ret;
    }

    goAsString(actualMeId: string, actualLine: number, ar: O<[string, string, number][]>) {
        let arout: string[] = [];
        if (!ar || !ar.length) {
            return '';
        }

        /* Ignore the top of the stack trace!
        It might be inaccurate because of dynamic code.
        we **don't use** the me-id there.
        we need to look at actualMeId */
        ar = ar.slice(1);

        for (let [velId, handlername, origoffset] of ar) {
            let vel = this.outside.Model().findByIdUntyped(velId);
            if (!vel) {
                arout.push('missing');
            } else if (vel.getType() === VpcElType.Product) {
                arout.push('vpc');
            } else {
                arout.push(this.renderVelAndLine(actualMeId, vel, handlername, origoffset));
            }
        }

        let ret = arout.join('\n');
        return ret ? 'via ' + ret : ret;
    }

    renderVelAndLine(actualMeId: string, vel: VpcElBase, handlername: string, origoffset: number): string {
        let s = '';
        if (vel.id555.toString() === actualMeId.toString()) {
            /* save space */
        } else if (vel.getType() === VpcElType.Stack) {
            s += 'stack';
        } else if (vel.getS('name')) {
            s += `"${vel.getS('name')}"`;
        } else {
            /* get the short name of v */
            let res = new VelResolveName(this.outside.Model());
            s += res.go(vel, PropAdjective.Short);
        }

        return s + ' ' + handlername + ', line ' + origoffset;
    }
}
