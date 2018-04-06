
/* auto */ import { O, makeVpcInternalErr, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObjectCanSet, ValHolder } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { VpcValN, VpcValS } from '../../vpc/vpcutils/vpcval.js';
/* auto */ import { OutsideWorldReadWrite } from '../../vpc/vel/vpcoutsideinterfaces.js';

export class VpcScriptExecAsync {
    static go_wait(
        asyncOps: ScriptAsyncOperations,
        blocked: ValHolder<number>,
        asyncOpId: string,
        milliseconds: number
    ) {
        let closureGetAsyncOps = asyncOps;
        let asyncOp = () => {
            window.setTimeout(() => {
                closureGetAsyncOps.markCompleted(asyncOpId, true);
            }, milliseconds);
        };

        let retrieved = new ValHolder<any>(false);
        asyncOps.go(asyncOpId, asyncOp, blocked, retrieved);
    }

    static go_answer(
        asyncOps: ScriptAsyncOperations,
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
        let closureGetAsyncOps = asyncOps;
        let asyncOp = () => {
            dlg = throwIfUndefined(dlg, 'cbAnswerMsg');
            dlg(
                prmpt,
                (n: number) => {
                    closureGetAsyncOps.markCompleted(asyncOpId, [n]);
                },
                opt1,
                opt2,
                opt3
            );
            // remember to not run other code after showing modal dialog
        };

        let retrieved = new ValHolder<any>([0]);
        asyncOps.go(asyncOpId, asyncOp, blocked, retrieved);
        if (retrieved.val) {
            let [btnPressed] = retrieved.val;
            if (btnPressed === 3) {
                if (cbStopCodeRunning) {
                    cbStopCodeRunning();
                } else {
                    throw makeVpcInternalErr('cbStopCodeRunning');
                }

                blocked.val = 1; // needed, or else we'll continue to run code in a zombie state and hit an error looking for parent stack frame which doesn't exist
            } else {
                outside.SetSpecialVar('it', VpcValN(btnPressed + 1));
            }
        }
    }

    static go_ask(
        asyncOps: ScriptAsyncOperations,
        blocked: ValHolder<number>,
        outside: OutsideWorldReadWrite,
        dlg: O<Function>,
        cbStopCodeRunning: O<Function>,
        asyncOpId: string,
        prmpt: string,
        defval: string
    ) {
        let closureGetAsyncOps = asyncOps;
        let asyncOp = () => {
            dlg = throwIfUndefined(dlg, 'cbAskMsg');
            dlg(prmpt, defval, (s: string, n: number) => {
                closureGetAsyncOps.markCompleted(asyncOpId, [s, n]);
            });
            // remember to not run other code after showing modal dialog
        };

        let retrieved = new ValHolder<any>(['', 0]);
        asyncOps.go(asyncOpId, asyncOp, blocked, retrieved);
        if (retrieved.val) {
            let [typedText, btnPressed] = retrieved.val;
            if (btnPressed === 3) {
                if (cbStopCodeRunning) {
                    cbStopCodeRunning();
                } else {
                    throw makeVpcInternalErr('cbStopCodeRunning');
                }

                blocked.val = 1; // needed, or else we'll continue to run code in a zombie state and hit an error looking for parent stack frame which doesn't exist
            } else {
                let s = (typedText || '').toString();
                outside.SetSpecialVar('it', VpcValS(s));
            }
        }
    }
}

export class ScriptAsyncOperations {
    waitingFor = new MapKeyToObjectCanSet<boolean>();
    completed = new MapKeyToObjectCanSet<any>();
    isBlocked() {
        return this.waitingFor.getKeys().length > 0;
    }

    markCompleted(asyncId: string, data: any) {
        this.waitingFor.remove(asyncId);
        this.completed.add(asyncId, data);
    }

    go(asyncId: string, asyncOp: () => void, isblocked: ValHolder<number>, retrieved: ValHolder<any>) {
        retrieved.val = undefined;
        if (this.waitingFor.find(asyncId)) {
            isblocked.val = 1;
        } else if (this.completed.find(asyncId)) {
            retrieved.val = this.completed.get(asyncId);
            this.completed.remove(asyncId);
        } else {
            this.waitingFor.add(asyncId, true);
            isblocked.val = 1;
            asyncOp();
        }
    }
}
