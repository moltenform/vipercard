
/* auto */ import { O, makeVpcInternalErr, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObjectCanSet, ValHolder } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512CompStdDialogResult } from '../../ui512/composites/ui512ModalDialog.js';
/* auto */ import { VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';

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
        blocked: ValHolder<number>,
        asyncOpId: string,
        milliseconds: number
    ) {
        let asyncOp = () => {
            window.setTimeout(() => {
                pendingOps.markCompleted(asyncOpId, true);
            }, milliseconds);
        };

        pendingOps.go(asyncOpId, asyncOp, blocked);
    }

    /**
     * e.g. 'answer "abc"'
     * when the script can continue, blocked will be set to 0
     */
    static goAsyncAnswer(
        pendingOps: VpcPendingAsyncOps,
        blocked: ValHolder<number>,
        outside: OutsideWorldReadWrite,
        dlg: O<Function>,
        cbStopCodeRunning: O<Function>,
        asyncOpId: string,
        prmpt: string,
        opt1: string,
        opt2: string,
        opt3: string
    ) {
        let asyncOp = () => {
            let markComplete = (n: number) => {
                pendingOps.markCompleted(asyncOpId, [n]);
            };

            dlg = throwIfUndefined(dlg, 'cbAnswerMsg is undefined');
            dlg(prmpt, markComplete, opt1, opt2, opt3);
        };

        let retrieved = pendingOps.go(asyncOpId, asyncOp, blocked);
        if (retrieved) {
            let [whichBtn] = retrieved;
            if (whichBtn === UI512CompStdDialogResult.Exit) {
                /* user is exiting out of the modal dialog by clicking the Stop button */
                if (cbStopCodeRunning) {
                    cbStopCodeRunning();
                } else {
                    throw makeVpcInternalErr('cbStopCodeRunning');
                }

                /* this causes script to stop immediately,
                which is necessary because cbStopCodeRunning nuked our parent stack frame */
                blocked.val = 1;
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
        blocked: ValHolder<number>,
        outside: OutsideWorldReadWrite,
        dlg: O<Function>,
        cbStopCodeRunning: O<Function>,
        asyncOpId: string,
        prmpt: string,
        defval: string
    ) {
        let asyncOp = () => {
            dlg = throwIfUndefined(dlg, 'cbAskMsg');
            dlg(prmpt, defval, (s: string, n: number) => {
                pendingOps.markCompleted(asyncOpId, [s, n]);
            });
        };

        let retrieved = pendingOps.go(asyncOpId, asyncOp, blocked);
        if (retrieved) {
            let [typedText, btnPressed] = retrieved;
            if (btnPressed === UI512CompStdDialogResult.Exit) {
                /* user is exiting out of the modal dialog by clicking the Stop button */
                if (cbStopCodeRunning) {
                    cbStopCodeRunning();
                } else {
                    throw makeVpcInternalErr('cbStopCodeRunning');
                }

                /* this causes script to stop immediately,
                which is necessary because cbStopCodeRunning nuked our parent stack frame */
                blocked.val = 1;
            } else {
                /* user can read the result by reading value of "it" */
                let s = (typedText || '').toString();
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
    go(asyncId: string, asyncOp: () => void, isblocked: ValHolder<number>) {
        let ret: any = undefined;
        if (this.waitingFor.find(asyncId)) {
            /* case 2) described at the top of this file, we're still waiting */
            isblocked.val = 1;
        } else if (this.completed.find(asyncId)) {
            /* case 3) described at the top of this file, we're done */
            ret = this.completed.get(asyncId);
            this.completed.remove(asyncId);
        } else {
            /* case 1) described at the top of this file, this is the first time we've hit the line */
            this.waitingFor.add(asyncId, true);
            isblocked.val = 1;
            asyncOp();
        }

        return ret;
    }
}
