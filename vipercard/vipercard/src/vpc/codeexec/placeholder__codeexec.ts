
export const isAllScriptingDisabled: boolean = true;

//export type VpcExecTop = any;

export class VpcExecTop {
    forceStopRunning() {}
    isCodeRunning():boolean {
        return false
    }

    scheduleCodeExec(...args: any[]) {}
}

export class VpcExecFrameStack {

}

export class CheckReservedWords {
    okLocalVar(...args: any[]) {
        return true;
    }
}

export class VpcExecFrame {
    static filterTemporaryFromScript(script: string) {
        return script;
    }
    codeSection: any;
    message: any;
    declaredGlobals: any;
    locals: any;
    args: any;

    getBetterLineNumberIfTemporary(s1: string, s2: string, n: number) {
        return ['', 0];
    }
    static getBetterLineNumberIfTemporary(s1: string, s2: string, n: number) {
        return ['', 0];
    }
    static filterTemporaryFromAllScripts(...args: any[]) {}
    static appendTemporaryDynamicCodeToScript(...args: any[]) {
        return '';
    }
}
