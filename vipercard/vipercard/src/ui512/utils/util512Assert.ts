
/* auto */ import { O, RingBufferLocalStorage, UI512Compress, callDebuggerIfNotInProduction, tostring } from './util512Base';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the MIT license */

/**
 * EXCEPTION HANDLING STRATEGY:
 *
 * We don't want any exception to be accidentally swallowed silently.
 * It's not enough to just put an alert in assertTrue,
 * because this won't cover base javascript errors like null-dereference.
 * It's important to show errors visibly so not to silently fall into
 * a bad state, and also we can log into local storage.
 * So, EVERY TOP OF THE CALL STACK must catch errors and send them to respondUI512Error
 * This includes:
 *          events from the browser (e.g. via golly)
 *              make sure they are wrapped in trycatch
 *          onload callbacks
 *              for images, json, server requests, dynamic script loading
 *              look for "addEventListener" and "onload"
 *              make sure they are wrapped in showMsgIfExceptionThrown
 *          setinterval and settimeout. use eslint ban / ban to stop them.
 *              use syncToAsyncAfterPause instead
 *          all async code
 *              use syncToAsyncTransition
 *          placeCallbackInQueue
 *              already ok because it's under the drawframe event.
 */

/**
 * It's useful to distinguish between errors we've thrown
 * and generic javascript errors.
 *
 * Currently we use a plain Error object and expando our
 * own properties onto it. Works for everything except
 * instanceof, because it's not actually a different class.
 * If I wanted true custom Error objects I'd have to navigate
 * a lot of browser differences, see
 * https://github.com/bjyoungblood/es6-error
 */
export class Util512BaseErr {
    isUtil512BaseErr = true;
    origClass = Util512BaseErr.name;
    protected constructor(public message: string, public level: string) {}

    /**
     * cast an Error instance to a Util512BaseErr, or return undefined
     * if the Error isn't marked as that classs.
     */
    static errAsCls<T extends Util512BaseErr>(nm: string, e: Error): O<T> {
        let fld = 'is' + nm;
        if ((e as any)[fld]) {
            return (e as any) as T;
        } else {
            return undefined;
        }
    }

    /**
     * cast a class to an Error
     */
    clsAsErr() {
        assertWarn((this as any).isUtil512BaseErr, '');
        assertWarn((this as any).message, '');
        return (this as any) as Error;
    }

    /**
     * take the information from another Error object
     * and put it into the information in this object.
     */
    addErr(e: Error) {
        (this as any).message += '\n' + e.message;
        (this as any).stack = e.stack;
        (this as any).line = (e as any).line;
        (this as any).sourceURL = (e as any).sourceURL;
    }

    /**
     * create an Error instance that also acts like a
     * Util512BaseErr instance (it isn't really, but because
     * it has the same shape, it works fine)
     */
    static createErrorImpl<T extends Util512BaseErr>(
        fnCtor: (...args: unknown[]) => T,
        ...params: unknown[]
    ): T {
        let e = new Error();
        let err = fnCtor(...params);
        Object.assign(e, err);
        let cls = (e as any) as T;
        cls.clsAsErr = err.clsAsErr.bind(e);
        cls.addErr = err.addErr.bind(e);
        if (!UI512ErrorHandling.runningTests) {
            callDebuggerIfNotInProduction(e.message);
        }

        return cls;
    }

    /**
     * workaround because constructor is protected
     */
    protected static gen(message: string, level: string) {
        return new Util512BaseErr(message, level);
    }

    /**
     * create a Util512BaseErr (or at least something that acts like one)
     */
    static createError(...params: unknown[]) {
        return Util512BaseErr.createErrorImpl(Util512BaseErr.gen, ...params);
    }
}

/**
 * a warning. execution can continue afterwards, but
 * we'll show a message to the user.
 */
export class Util512Warn extends Util512BaseErr {
    isUtil512Warn = true;
    origClass = Util512Warn.name;
    protected static gen(message: string, level: string) {
        return new Util512Warn(message, level);
    }
    static createError(...params: unknown[]) {
        return Util512BaseErr.createErrorImpl(Util512Warn.gen, ...params);
    }
}

/**
 * just a message, not an error case.
 */
export class Util512Message extends Util512BaseErr {
    isUtil512Message = true;
    origClass = Util512Message.name;
    protected static gen(message: string, level: string) {
        return new Util512Message(message, level);
    }
    static createError(...params: unknown[]) {
        return Util512BaseErr.createErrorImpl(Util512Message.gen, ...params);
    }
}

/**
 * helper for making a Util512BaseErr, at any level
 */
function makeUtil512BaseErrGeneric(
    firstMsg: string,
    level: string,
    s1?: unknown,
    s2?: unknown,
    s3?: unknown
) {
    let msg = joinIntoMessage(firstMsg, level, s1, s2, s3);
    return Util512BaseErr.createError(msg, level);
}

/**
 * make a Util512BaseErr
 */
export function make512Error(msg: string, s1?: unknown, s2?: unknown, s3?: unknown) {
    return makeUtil512BaseErrGeneric(msg, 'ui512', s1, s2, s3);
}

/**
 * this is a hard assert that always throws.
 */
export function assertTrue(
    condition: unknown,
    s1: string,
    s2?: unknown,
    s3?: unknown
): asserts condition {
    if (!condition) {
        if (!UI512ErrorHandling.silenceAssertMsgs) {
            let msg = joinIntoMessage('assertTrue:', 'ui512', s1, s2, s3);
            console.error(msg);
            callDebuggerIfNotInProduction(msg);
        }

        throw make512Error('assert:', s1, s2, s3).clsAsErr();
    }
}

/**
 * can be ignored/ignore all.
 * if proceeding with execution would be unsafe, use assertTrue instead
 */
export function assertWarn(condition: unknown, s1: string, s2?: unknown, s3?: unknown) {
    if (!condition) {
        if (UI512ErrorHandling.silenceAssertMsgs) {
            /* we are in a assertAsserts test,
            for testing convenience throw, we won't normally. */
            throw new Error('assert:' + s1 + (s2 ?? '') + (s3 ?? ''));
        }

        let msg = joinIntoMessage('assert:', 'ui512', s1, s2, s3);
        console.error(msg);
        callDebuggerIfNotInProduction(msg);
        if (!UI512ErrorHandling.silenceWarnings) {
            /* we won't throw this error, but we'll make it
            so we can save it + the callstack to logs */
            let e = Util512Warn.createError(msg, 'ui512warn');
            respondUI512Error(e.clsAsErr(), 'ui512warn');
            if (UI512ErrorHandling.runningTests) {
                let msgTotal = msg + ' Press Cancel to exit tests.';
                if (!confirm(msgTotal)) {
                    throw new Error('Exiting tests.');
                }
            } else {
                let msgTotal = msg + ' Press OK to silence future asserts.';
                if (confirm(msgTotal)) {
                    UI512ErrorHandling.silenceWarnings = true;
                }
            }
        }
    }
}

/**
 * a quick way to throw if condition is false.
 * not the same as assert - an assert should only be
 * triggered for unexpected conditions.
 */
export function checkThrow512(
    condition: unknown,
    msg: string,
    s1: unknown = '',
    s2: unknown = ''
): asserts condition {
    if (!condition) {
        throw make512Error(msg, s1, s2).clsAsErr();
    }
}

/* see also: assertEq, assertWarnEq, checkThrowEq512 in util512.ts */

/**
 * store logs. user can choose "send err report" to send us error context.
 */
export class UI512ErrorHandling {
    static shouldRecordErrors = true;
    static runningTests = false;
    static silenceAssertMsgs = false;
    static silenceWarnings = false;
    static silenceWarningsAndMore = false;
    static silenceWarningsAndMoreCount = 0;
    static contextHint = '';
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
            if (!UI512ErrorHandling.runningTests) {
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
 * I used to show a dialog in assertTrue, but that's not needed,
 * since we'll show a dialog in the respondtoui512. and by putting the
 * logging in just the response and not the error site, we won't have
 * unbounded recursion if there's an exception in the logging code.
 *
 * how to respond to exception:
 */
export function respondUI512Error(e: Error, context: string, logOnly = false) {
    let message = Util512BaseErr.errAsCls(Util512Message.name, e);
    let warn = Util512BaseErr.errAsCls(Util512Warn.name, e);
    let structure = Util512BaseErr.errAsCls(Util512BaseErr.name, e);
    callDebuggerIfNotInProduction(e.message);
    if (message) {
        /* not really an error, just a message */
        if (logOnly) {
            console.error(e.message);
        } else {
            window.alert(e.message);
        }

        return;
    }

    let sAllInfo = '';
    if (e.message) {
        sAllInfo += e.message;
    }
    if (e.stack) {
        sAllInfo += '\n\n' + e.stack.toString();
    }
    if ((e as any).line) {
        sAllInfo += '\n\n' + (e as any).line.toString();
    }
    if ((e as any).sourceURL) {
        sAllInfo += '\n\n' + (e as any).sourceURL;
    }
    if (!structure && UI512ErrorHandling.contextHint) {
        sAllInfo += ` ${UI512ErrorHandling.contextHint}`;
    }
    if (context) {
        sAllInfo += ` (${context})`;
    }

    console.error(sAllInfo);
    let severity = false;
    if (!e.message || !e.message.includes('assertion failed')) {
        severity = true;
    }

    if (UI512ErrorHandling.shouldRecordErrors && !UI512ErrorHandling.runningTests) {
        UI512ErrorHandling.appendErrMsgToLogs(severity, sAllInfo);
    }

    /* let's always show at least some type of dialog,
    unless user has explicitly silenced it. */
    if (!(warn && UI512ErrorHandling.silenceWarnings)) {
        UI512ErrorHandling.silenceWarningsAndMoreCount += 1;
        if (logOnly || UI512ErrorHandling.silenceWarningsAndMore) {
            /* do nothing, we've already logged it */
        } else if (UI512ErrorHandling.silenceWarningsAndMoreCount > 4) {
            /* unfortunately, we probably want an option like this,
            otherwise if there's */
            let msgTotal =
                sAllInfo +
                ` -- we recommend that you save your` +
                `work and refresh the website -- Press OK to silence future asserts`;
            if (confirm(msgTotal)) {
                UI512ErrorHandling.silenceWarningsAndMore = true;
            }
        } else {
            window.alert(sAllInfo);
        }
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
    let message = level + ': ' + c0;
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

        throw make512Error(sTotal).clsAsErr();
    } else {
        return v;
    }
}
