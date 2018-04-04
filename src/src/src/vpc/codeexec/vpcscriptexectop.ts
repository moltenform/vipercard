
/* auto */ import { O, UI512ErrorHandling, assertTrue, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { VpcTool } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { CodeLimits, CountNumericId, VpcScriptErrorBase, VpcScriptRuntimeError } from '../../vpc/vpcutils/vpcutils.js';
/* auto */ import { VarCollection, VariableCollectionConstants } from '../../vpc/vpcutils/vpcvarcollection.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velbase.js';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite, VpcScriptMessage } from '../../vpc/vel/vpcoutsideinterfaces.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpccheckreserved.js';
/* auto */ import { VpcAllCode } from '../../vpc/codepreparse/vpcallcode.js';
/* auto */ import { VpcParsingCache } from '../../vpc/codeexec/vpcscriptcacheparsed.js';
/* auto */ import { ExecuteStatements } from '../../vpc/codeexec/vpcscriptexecstatement.js';
/* auto */ import { CodeExecFrameStack } from '../../vpc/codeexec/vpcscriptexecframestack.js';

export class CodeExecTop {
    constants = new VariableCollectionConstants();
    check = new CheckReservedWords();
    globals = new VarCollection(CodeLimits.maxGlobalVars, 'global');
    runStatements = new ExecuteStatements();
    parsingCache = new VpcParsingCache();
    workQueue: CodeExecFrameStack[] = [];
    cbOnScriptError: O<(err: VpcScriptErrorBase) => void>;
    cbCauseUIRedraw: O<() => void>;
    lastEncounteredScriptErr: O<VpcScriptErrorBase>;

    protected readonly code: VpcAllCode;
    protected readonly outside: OutsideWorldReadWrite;
    constructor(idgen: CountNumericId, outside: OutsideWorldReadWrite) {
        this.code = new VpcAllCode(idgen);
        this.outside = outside;
        this.runStatements.outside = outside;
        this.parsingCache.visitor.outside = outside as OutsideWorldRead;
    }

    protected justSawRepeatedMousedown = false;
    scheduleCodeExec(msg: VpcScriptMessage) {
        let newWork = new CodeExecFrameStack(
            this.code,
            this.outside,
            this.parsingCache,
            this.runStatements,
            this.constants,
            this.globals,
            this.check,
            msg
        );

        let isRepeatedKeydown = newWork.originalMsg.msgName === 'afterkeydown' && newWork.originalMsg.keyrepeated;

        if (isRepeatedKeydown && this.workQueue.length > 2) {
            // don't queue up a key that is held down at least beyond 3 evts
            return;
        } else if (
            (newWork.originalMsg.msgName === 'idle' || newWork.originalMsg.msgName === 'mousewithin') &&
            this.workQueue.length > 0
        ) {
            // don't queue up an onidle
            return;
        }

        // don't let keydowns swamp everything else!
        if (isRepeatedKeydown) {
            if (this.justSawRepeatedMousedown) {
                return;
            }
            this.justSawRepeatedMousedown = true;
        } else {
            this.justSawRepeatedMousedown = false;
        }

        try {
            UI512ErrorHandling.breakOnThrow = false;
            newWork.findHandlerToExec();
            if (newWork.stack.length > 1) {
                this.workQueue.push(newWork);
            }
        } catch (e) {
            if (e.isVpcScriptError) {
                this.respondScriptError(e);
            }
        } finally {
            UI512ErrorHandling.breakOnThrow = true;
        }
    }

    findCode(id: string) {
        return this.code.findCode(id);
    }

    removeScript(id: string) {
        // disabled because this hasn't been tested, but actually this probably "works"
        // since the framecontext holds a reference to the codesection.
        checkThrow(!this.isCodeRunning(), "7z|we don't currently support deleting an element while code is running");
        this.code.remove(id);
    }

    isCodeRunning() {
        // check hasRunCode to make ui less gummed up
        return this.workQueue.length > 0 && this.workQueue[0].hasRunCode;
    }

    forceStopRunning() {
        this.workQueue.length = 0;
        if (this.cbCauseUIRedraw) {
            this.cbCauseUIRedraw();
        }
    }

    runTimeslice(ms: number) {
        let codeRunningBefore = this.isCodeRunning();
        this.runTimesliceImpl(ms);
        let codeRunningAfter = this.isCodeRunning();
        if (codeRunningBefore !== codeRunningAfter && this.cbCauseUIRedraw) {
            this.cbCauseUIRedraw();
        }
    }

    protected runTimesliceImpl(ms: number) {
        let first = this.workQueue[0];
        let currentcardid = this.outside.GetOption_s('currentCardId');

        if (!this.workQueue.length || !first) {
            // no code is running.
            // make sure screen is unlocked, just in case
            this.outside.SetOption('screenLocked', false);
            return;
        }

        if (
            !first.hasRunCode &&
            slength(first.originalMsg.cardWhenFired) > 0 &&
            first.originalMsg.causedByUserAction &&
            first.originalMsg.cardWhenFired !== currentcardid
        ) {
            // important: don't run queued messages that were created on a different card
            this.workQueue.splice(0, 1);
            return;
        }

        if (first.stack.length <= 1) {
            // we just finished a handler
            this.workQueue.splice(0, 1);
            this.outside.SetOption('screenLocked', false);
            this.outside.SetOption('mimicCurrentTool', VpcTool.browse);
            return;
        }

        try {
            UI512ErrorHandling.breakOnThrow = false;
            first.runTimeslice(ms);
        } catch (e) {
            this.respondScriptError(e);
        } finally {
            UI512ErrorHandling.breakOnThrow = true;
        }

        if (first.stack.length <= 1) {
            // we just finished a handler
            this.workQueue.splice(0, 1);
            this.outside.SetOption('screenLocked', false);
            this.outside.SetOption('mimicCurrentTool', VpcTool.browse);
            return;
        }
    }

    updateChangedCode(owner: VpcElBase, code: string) {
        checkThrow(!this.isCodeRunning(), "7y|we don't currently support changing code while code is running");
        UI512ErrorHandling.breakOnThrow = false;
        try {
            this.code.updateCode(code, owner);
        } finally {
            UI512ErrorHandling.breakOnThrow = true;
        }
    }

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
}
