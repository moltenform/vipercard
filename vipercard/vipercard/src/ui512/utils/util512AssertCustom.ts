
/* auto */ import { O, RingBufferLocalStorage, UI512Compress, callDebuggerIfNotInProduction, tostring } from './util512Base';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */


/**
 * if I wanted true custom Error objects,
 * approaches like https://github.com/bjyoungblood/es6-error
 * look good, but I don't think I need that now.
 * 
 * throwing an assert does *not* need to show an alert or
 * record error information. in any context, there should be a
 * catch() at the top, which we need in any case to catch
 * generic javascript exceptions.
*/

/**
 * it's useful to distinguish between errors we've thrown
 * and generic javascript errors.
 * the errors we deal with will be true Error,
 * with no es6 custom-error-inheritance,
 * but they will be the same shape as types Util512BaseErr,
 * although instanceof won't know it.
 */
export class Util512BaseErr {
    isUtil512BaseErr = true
    constructor(public message:string, public level:string) {
    }
    static from<T extends Util512BaseErr>(ctor: { new (...args: unknown[]): T }, e:Error):O<T> {
        let fld = 'is' + ctor.name
        if ((e as any)[fld]) {
            return e as any as T
        } else {
            return undefined
        }
    }
    static create<T extends Util512BaseErr>(ctor: { new (...args: unknown[]): T }, ...params: unknown[]) {
        let e = new Error()
        let err = new ctor(...params)
        Object.assign(e, err)
        return e
    }
}

/**
 * a warning. execution can continue afterwards, but
 * we'll show a message to the user.
 */
export class Util512Warn extends Util512BaseErr {
    isUtil512Warn = true
}

/**
 * just a message, not an error case.
 */
export class Util512Message extends Util512BaseErr {
    isUtil512Message = true
}

function makeUtil512BaseErrGeneric(
    firstMsg: string,
    level: string,
    s1?: unknown,
    s2?: unknown,
    s3?: unknown
) {
    let msg = joinIntoMessage(firstMsg, level, s1, s2, s3);
    return Util512BaseErr.create(Util512BaseErr, msg, level)
}


export function make512Error(msg: string, s1?: unknown, s2?: unknown, s3?: unknown) {
    return makeUtil512BaseErrGeneric(msg, 'ui512', s1, s2, s3);
}

/**
 * this is a 'hard' assert that always throws.
 */
export function assertTrue(
    condition: unknown,
    s1: string,
    s2?: unknown,
    s3?: unknown
): asserts condition {
    if (!condition) {
        callDebuggerIfNotInProduction();
        throw make512Error('O#|assertion failed:', s1, s2, s3);
    }
}

/**
 * can be ignored/ignore all.
 * in case proceeding execution would be unsafe, use assertTrue instead
 */
export function assertWarn(
    condition: unknown,
    s1: string,
    s2?: unknown,
    s3?: unknown
): asserts condition {
    if (!condition) {
        let msg = joinIntoMessage('assert:', 'ui512', s1, s2, s3);
        if (!UI512ErrorHandling.silenceWarnings) {
            /* we won't throw this error, but we'll make it
            so we can save it + the callstack to logs */
            let e = Util512BaseErr.create(Util512Warn, msg, 'ui512warn')
            respondUI512Error(e, 'ui512warn')
            let msgTotal = msg + ' Press OK to silence future asserts.'
            if (confirm(msgTotal)) {
                UI512ErrorHandling.silenceWarnings = true
            }
        }
    }
}

/**
 * a quick way to throw if condition is false.
 * not the same as assert, which should only be triggered when
 * something goes wrong.
 */
export function checkThrow512(
    condition: unknown,
    msg: string,
    s1: unknown = '',
    s2: unknown = ''
): asserts condition {
    if (!condition) {
        throw make512Error(`O |${msg} ${s1} ${s2}`);
    }
}

/* see also: assertEq, assertWarnEq, checkThrowEq512 in util512.ts*/

/**
 * if an error is thrown, show a warning message and swallow the error
 */
export function showWarningIfExceptionThrown(fn: () => void) {
    try {
        fn();
    } catch (e) {
        assertWarn(false, e.toString(), 'Oz|');
    }
}

/**
 * store logs. user can choose "send err report" to send us error context.
 */
export class UI512ErrorHandling {
    static shouldRecordErrors = true;
    static runningTests = false;
    static silenceWarnings = false
    static readonly maxEntryLength = 512;
    static readonly maxLinesKept = 256;
    static store = new RingBufferLocalStorage(UI512ErrorHandling.maxLinesKept);

    protected static encodeErrMsg(s: string) {
        s = s.substr(0, UI512ErrorHandling.maxEntryLength);
        return UI512Compress.compressString(s);
    }

    protected static decodeErrMsg(compressed: string) {
        return UI512Compress.decompressString(compressed);
    }

    static appendErrMsgToLogs(severity: boolean, s: string) {
        if (UI512ErrorHandling.shouldRecordErrors) {
            if (!UI512ErrorHandling.runningTests ) {
                let sseverity = severity ? '1' : '2';
                let encoded = sseverity + UI512ErrorHandling.encodeErrMsg(s);
                UI512ErrorHandling.store.append(encoded);
            }
        }
    }

    static getLatestErrLogs(amount: number): string[] {
        return UI512ErrorHandling.store.retrieve(amount);
    }
}

/**
 * combine strings, and move all 'markers' to the end
 */
export function joinIntoMessage(
    c0: string,
    level: string,
    s1?: unknown,
    s2?: unknown,
    s3?: unknown
) {
    let markers: string[] = [];
    c0 = findMarkers(c0, markers) ?? '';
    s1 = findMarkers(s1, markers);
    let message = level + ' ' + c0;
    message += s1 ? '\n' + s1 : '';
    message += s2 ? ', ' + s2 : '';
    message += s3 ? ', ' + s3 : '';
    if (markers.length) {
        message += ' (' + markers.join(',') + ')';
    }

    return message;
}


/**
 * we add two-digit markers to most asserts, so that if a bug report comes in,
 * we have more context about the site of failure.
 * assert markers are in the form xx|; this fn extracts them from a string.
 */
function findMarkers(s: unknown, markers: string[]): O<string> {
    if (s && typeof s === 'string' && s[2] === '|') {
        markers.push(s.slice(0, 2));
        return s.slice(3);
    } else if (!s) {
        return undefined;
    } else {
        return tostring(s);
    }
}

/**
 * a way to safely go from optional<T> to T
 */
export function ensureDefined<T>(
    v: O<T>,
    s1: string,
    s2: unknown = '',
    s3: unknown = ''
): T {
    if (v === undefined || v === null) {
        let sTotal = 'not defined';
        if (s1 !== '') {
            sTotal += ', ' + s1;
        }

        if (s2 !== '') {
            sTotal += ', ' + s2;
        }

        if (s3 !== '') {
            sTotal += ', ' + s3;
        }

        throw make512Error(sTotal);
    } else {
        return v;
    }
}

/**
 * respond to exception.
 */
export function respondUI512Error(e: Error, context: string) {
    let message = Util512BaseErr.from(Util512Message, e)
    let warn = Util512BaseErr.from(Util512Warn, e)
    let structure = Util512BaseErr.from(Util512BaseErr, e)
    if (message) {
        window.alert(e.message)
        return
    }

    if (!structure) {
        callDebuggerIfNotInProduction();
    }

    let sAllInfo = ''
    if (e.message) {
        sAllInfo += e.message;
    }
    if (e.stack) {
        sAllInfo += '\n\n' + e.stack.toString()
    }
    if ((e as any).line) {
        sAllInfo += '\n\n' + (e as any).line.toString()
    }
    if ((e as any).sourceURL ) {
        sAllInfo += '\n\n' + (e as any).sourceURL
    }

    console.error(sAllInfo)
    let severity = !e.message.includes('assertion failed')
    if (UI512ErrorHandling.shouldRecordErrors && !UI512ErrorHandling.runningTests) {
        UI512ErrorHandling.appendErrMsgToLogs(severity, sAllInfo);        
    }

    if (!warn) {
        window.alert(sAllInfo);
    }
}


