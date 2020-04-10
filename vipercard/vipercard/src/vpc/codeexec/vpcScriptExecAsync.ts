
/* auto */ import { VpcValN, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { VpcPhoneDial } from './../vpcutils/vpcAudio';
/* auto */ import { OutsideWorldReadWrite } from './../vel/velOutsideInterfaces';
/* auto */ import { Util512Higher, VoidFn } from './../../ui512/utils/util512Higher';
/* auto */ import { O, makeVpcInternalErr, throwIfUndefined } from './../../ui512/utils/util512Assert';
/* auto */ import { MapKeyToObjectCanSet, ValHolder } from './../../ui512/utils/util512';
/* auto */ import { UI512CompStdDialogResult } from './../../ui512/composites/ui512ModalDialog';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * execute an asynchronous statement
 *
 * case 1) when you first hit the statement:
 *      add an entry to "waitingFor"
 *      begin the async op
 *      return with 'blocked=true' so that the script can exit early
 *
 * case 2) when you next hit the statement, and it's not done yet:
 *      we can tell it's not done because there's no entry in completed
 *      return with 'blocked=true' so that the script can exit early
 *
 * case 3) when you hit the statement, and it's done:
 *      we can tell it's done because there's an entry in completed
 *      clear out everything
 *      return what was set in completed
 *      return with 'blocked=false' (the default) so script can continue
 *
 */
export class VpcScriptExecAsync {
    /**
     * e.g. 'wait 5 seconds'
     * when the script can continue, blocked will be set to 0
     */
    static goAsyncWait(
        pendingOps: VpcPendingAsyncOps,
        blocked: ValHolder<AsyncCodeOpState>,
        asyncOpId: string,
        milliseconds: number
    ) {
        let op = () => {
            let f = async () => {
                await Util512Higher.sleep(milliseconds);
                pendingOps.markCompleted(asyncOpId, true);
            };

            Util512Higher.syncToAsyncTransition(f, 'goAsyncWait');
        };

        pendingOps.go(asyncOpId, op, blocked);
    }

    /**
     * e.g. 'dial "1234"'
     * because we know the length of each audio clip,
     * we know how long to wait
     */
    static goAsyncDial(
        pendingOps: VpcPendingAsyncOps,
        blocked: ValHolder<AsyncCodeOpState>,
        asyncOpId: string,
        numbersToDial: string
    ) {
        let op = () => {
            let markComplete = () => pendingOps.markCompleted(asyncOpId, true);
            VpcPhoneDial.goDial(numbersToDial, markComplete);
        };

        pendingOps.go(asyncOpId, op, blocked);
    }

    /**
     * e.g. 'answer "abc"'
     * when the script can continue, blocked will be set to 0
     */
    static goAsyncAnswer(
        pendingOps: VpcPendingAsyncOps,
        blocked: ValHolder<AsyncCodeOpState>,
        outside: OutsideWorldReadWrite,
        dlg: O<FnAnswerMsgCallback>,
        cbStopCodeRunning: O<VoidFn>,
        asyncOpId: string,
        prmpt: string,
        opt1: string,
        opt2: string,
        opt3: string
    ) {
        let op = () => {
            let markComplete = (n: number) => {
                pendingOps.markCompleted(asyncOpId, [n]);
            };

            dlg = throwIfUndefined(dlg, 'JH|cbAnswerMsg is undefined');
            dlg(prmpt, markComplete, opt1, opt2, opt3);
        };

        let retrieved = pendingOps.go(asyncOpId, op, blocked);
        if (retrieved) {
            let [whichBtn] = retrieved;
            if (whichBtn === UI512CompStdDialogResult.Exit) {
                /* user is exiting out of the modal dialog by clicking the Stop button */
                if (cbStopCodeRunning) {
                    cbStopCodeRunning();
                } else {
                    throw makeVpcInternalErr('JG|cbStopCodeRunning');
                }

                /* this causes script to stop immediately,
                which is necessary because cbStopCodeRunning nuked our parent stack frame */
                blocked.val = AsyncCodeOpState.DisallowNext;
            } else {
                /* user can read which button by reading value of "it" */
                outside.SetSpecialVar('it', VpcValN(whichBtn + 1));
            }
        }
    }

    /**
     * e.g. 'ask "abc"'
     * when the script can continue, blocked will be set to 0
     */
    static goAsyncAsk(
        pendingOps: VpcPendingAsyncOps,
        blocked: ValHolder<AsyncCodeOpState>,
        outside: OutsideWorldReadWrite,
        dlg: O<FnAskMsgCallback>,
        cbStopCodeRunning: O<VoidFn>,
        asyncOpId: string,
        prmpt: string,
        defval: string
    ) {
        let op = () => {
            dlg = throwIfUndefined(dlg, 'JF|cbAskMsg');
            dlg(prmpt, defval, (s: string, n: number) => {
                pendingOps.markCompleted(asyncOpId, [s, n]);
            });
        };

        let retrieved = pendingOps.go(asyncOpId, op, blocked);
        if (retrieved) {
            let [typedText, btnPressed] = retrieved;
            if (btnPressed === UI512CompStdDialogResult.Exit) {
                /* user is exiting out of the modal dialog by clicking the Stop button */
                if (cbStopCodeRunning) {
                    cbStopCodeRunning();
                } else {
                    throw makeVpcInternalErr('JE|cbStopCodeRunning');
                }

                /* this causes script to stop immediately,
                which is necessary because cbStopCodeRunning nuked our parent stack frame */
                blocked.val = AsyncCodeOpState.DisallowNext;
            } else {
                /* user can read the result by reading value of "it" */
                let s = (typedText ?? '').toString();
                outside.SetSpecialVar('it', VpcValS(s));
            }
        }
    }
}

/**
 * logic for pending asynchronous operations
 */
export class VpcPendingAsyncOps {
    waitingFor = new MapKeyToObjectCanSet<boolean>();
    completed = new MapKeyToObjectCanSet<any>();

    /**
     * an async callback can run this and leave data to be picked up
     */
    markCompleted(asyncId: string, data: any) {
        this.waitingFor.remove(asyncId);
        this.completed.add(asyncId, data);
    }

    /**
     * when encountering code for an async operation,
     * do different actions based on if it is the first time we've encountered the action
     */
    go(asyncId: string, op: () => void, isblocked: ValHolder<AsyncCodeOpState>) {
        let ret: any = undefined;
        if (this.waitingFor.find(asyncId)) {
            /* case 2) described at the top of this file, we're still waiting */
            isblocked.val = AsyncCodeOpState.DisallowNext;
        } else if (this.completed.find(asyncId)) {
            /* case 3) described at the top of this file, we're done */
            ret = this.completed.get(asyncId);
            this.completed.remove(asyncId);
        } else {
            /* case 1) described at the top of this file,
            this is the first time we've hit the line */
            this.waitingFor.add(asyncId, true);
            isblocked.val = AsyncCodeOpState.DisallowNext;
            op();
        }

        return ret;
    }
}

export type FnAnswerMsgCallback = (
    prompt: string,
    fnOnResult: (n: number) => void,
    choice1: string,
    choice2: string,
    choice3: string
) => void;
export type FnAskMsgCallback = (prompt: string, deftxt: string, fnOnResult: (ret: O<string>, n: number) => void) => void;

export enum AsyncCodeOpState {
    AllowNext = 'AllowNext0',
    DisallowNext = 'DisallowNext1'
}
