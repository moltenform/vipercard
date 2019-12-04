
/* auto */ import { msgInternalErr, msgNotification, msgScriptErr, ui512InternalErr } from './util512Productname';

// moltenform.com(Ben Fisher)
// MIT license

/**
 * make an error object, record the error, and depending on severity, show alert box
 * you can pass in arguments to indicate context of when/why error occurred
 */
function makeUI512ErrorGeneric(
    firstMsg: string,
    prefix: string,
    s1?: unknown,
    s2?: unknown,
    s3?: unknown,
) {
    let msg = joinIntoMessage(firstMsg, prefix, s1, s2, s3);
    let err = new Error(msg);
    try {
        markUI512Err(err);
        recordAndShowErr(firstMsg, msg + '\n' + err.stack);
    } catch (e) {
        console.error('could not record err ' + e.message);
    }

    return err;
}

/**
 * make ui exception
 */
export function makeUI512Error(msg: string, s1?: unknown, s2?: unknown, s3?: unknown) {
    return makeUI512ErrorGeneric(msg, ui512InternalErr, s1, s2, s3);
}

/**
 * respond to exception, only for unexpected cases where answerDialog isn't available
 */
export function respondUI512Error(e: Error, context: string) {
    if ((e as any).isUi512Error) {
        /* assert.ts */
        console.log('caught ' + e.message + ' at context ' + context);
        console.log(e.stack);
        window.alert(e.message + ' ' + context);
    } else {
        console.error(e.message);
        console.error(e.stack);
        breakIntoDebugger();
        window.alert(e.message);
    }
}

/**
 * note: this is a 'hard' assert that always throws an exception + shows a dialog
 * use assertTrueWarn if it's not a very important check
 */
export function assertTrue(
    condition: unknown,
    s1: string,
    s2?: unknown,
    s3?: unknown,
): asserts condition {
    if (!condition) {
        throw makeUI512Error('O#|assertion failed in assertTrue.', s1, s2, s3);
    }
}

/**
 * a 'soft' assert. Record the error, but allow execution to continue
 */
export function assertTrueWarn(
    condition: unknown,
    s1: string,
    s2?: unknown,
    s3?: unknown,
) {
    if (!condition) {
        let er = makeUI512Error(
            'O!|warning, assertion failed in assertTrueWarn.',
            s1,
            s2,
            s3,
        );
        if (!window.confirm('continue?')) {
            throw er;
        }
    }
}

/**
 * a quick way to throw an exception if condition is false
 */
export function checkThrowUI512(
    condition: unknown,
    msg: string,
    s1: unknown = '',
    s2: unknown = '',
): asserts condition {
    if (!condition) {
        throw makeUI512Error(`O |${msg} ${s1} ${s2}`);
    }
}

/**
 * a way to safely go from optional<T> to T
 */
export function throwIfUndefined<T>(
    v: O<T>,
    s1: string,
    s2: unknown = '',
    s3: unknown = '',
): T {
    if (v === undefined || v === null) {
        let msgInThrowIfUndefined = 'not defined';
        if (s1 !== '') {
            msgInThrowIfUndefined += ', ' + s1;
        }

        if (s2 !== '') {
            msgInThrowIfUndefined += ', ' + s2;
        }

        if (s3 !== '') {
            msgInThrowIfUndefined += ', ' + s3;
        }

        throw makeUI512Error(msgInThrowIfUndefined);
    } else {
        return v;
    }
}

/**
 * a short way to say optional<T>.
 * prefer O<string> over ?string, I find it easier to read and reason about.
 */
export type O<T> = T | undefined;

/**
 * external LZString compression
 */
declare let LZString: any;

/**
 * LZString uses the fact that JS strings have 16 bit chars to compress data succinctly.
 * I use compressToUTF16() instead of compress() to use only valid utf sequences.
 */
export class UI512Compress {
    protected static stringEscapeNewline = '##Newline##';
    protected static reEscapeNewline = new RegExp(UI512Compress.stringEscapeNewline, 'g');
    protected static reNewline = /\n/g;
    static compressString(s: string): string {
        let compressed = LZString.compressToUTF16(s);
        return compressed;
    }

    static decompressString(s: string): string {
        return LZString.decompressFromUTF16(s);
    }
}

/**
 * store the last <size> log entries, without needing to
 * move contents or allocate more memory.
 */
export abstract class RingBuffer {
    constructor(protected size: number) {}

    /**
     * add log to buffer.
     */
    append(s: string) {
        let ptrLatest = this.getLatestIndex();
        ptrLatest = this.mod(ptrLatest + 1, this.size);
        this.setAt(ptrLatest, s);
        this.setLatestIndex(ptrLatest);
    }

    /**
     * retrieve the latest entries.
     */
    retrieve(howMany: number) {
        howMany = Math.min(howMany, this.size - 1);
        let ptrLatest = this.getLatestIndex();
        let ret: string[] = [];
        for (let i = 0; i < howMany; i++) {
            let index = this.mod(ptrLatest - i, this.size);
            ret.push(this.getAt(index));
        }

        return ret;
    }

    /**
     * more intuitive with negative numbers than the % operator
     */
    mod(a: number, n: number) {
        return ((a % n) + n) % n;
    }

    abstract getAt(index: number): string;
    abstract setAt(index: number, s: string): void;
    abstract getLatestIndex(): number;
    abstract setLatestIndex(index: number): void;
}

/**
 * use localstorage to store, so that logs persist when page is refreshed.
 * ui512LogPtr should be in local storage, we could be running in 2 browser windows.
 */
class RingBufferLocalStorage extends RingBuffer {
    getAt(index: number): string {
        return window.localStorage['ui512Log_' + index] ?? '';
    }

    setAt(index: number, s: string) {
        window.localStorage['ui512Log_' + index] = s;
    }

    getLatestIndex() {
        let sLatest = window.localStorage['ui512LogPtr'] ?? '0';

        /* ok to use here, we remembered to say base 10 */
        /* eslint-disable ban/ban */
        let ptrLatest = parseInt(sLatest, 10);
        return Number.isFinite(ptrLatest) ? ptrLatest : 0;
    }

    setLatestIndex(index: number) {
        window.localStorage['ui512LogPtr'] = index.toString();
    }
}

/**
 * if an error is thrown, show a warning message and swallow the error
 */
export function showWarningIfExceptionThrown(fn: () => void) {
    try {
        fn();
    } catch (e) {
        assertTrueWarn(false, e.toString(), 'Oz|');
    }
}

/**
 * store logs. user can choose "send err report" to send us error context.
 */
export class UI512ErrorHandling {
    static shouldRecordErrors = true;
    static breakOnThrow = true;
    static runningTests = false;
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

    static appendErrMsgToLogs(showedDialog: boolean, s: string) {
        if (UI512ErrorHandling.shouldRecordErrors) {
            if (
                !UI512ErrorHandling.runningTests &&
                bool(window.localStorage) &&
                !s.includes(msgNotification)
            ) {
                let severity = showedDialog ? '1' : '2';
                let encoded = severity + UI512ErrorHandling.encodeErrMsg(s);
                UI512ErrorHandling.store.append(encoded);
            }
        }
    }

    static getLatestErrLogs(amount: number): string[] {
        return UI512ErrorHandling.store.retrieve(amount);
    }
}

/**
 * is it truthy? anything except false, 0, "", null, undefined, and NaN
 */
export function bool(x: unknown): boolean {
    /* eslint-disable no-implicit-coercion */
    return !!x;
}

/**
 * cast to string.
 */
export function tostring(s: unknown): string {
    /* eslint-disable no-implicit-coercion */
    return '' + s;
}

/**
 * sometimes when showing exception message, don't need to show prefix
 */
export function cleanExceptionMsg(s: string) {
    if (s.startsWith(msgInternalErr + ' ' + msgNotification)) {
        s = s.substr((msgInternalErr + ' ' + msgNotification).length).trim();
    }

    if (s.startsWith(ui512InternalErr)) {
        s = s.substr(ui512InternalErr.length).trim();
    } else if (s.startsWith(msgScriptErr)) {
        s = s.substr(msgScriptErr.length).trim();
    } else if (s.startsWith(msgInternalErr)) {
        s = s.substr(msgInternalErr.length).trim();
    }

    s = s.trim();
    return s;
}

/**
 * combine strings, and move all 'markers' to the end
 */
export function joinIntoMessage(
    c0: string,
    prefix: string,
    s1?: unknown,
    s2?: unknown,
    s3?: unknown,
) {
    let markers: string[] = [];
    c0 = findMarkers(c0, markers) ?? '';
    s1 = findMarkers(s1, markers);
    let message = prefix + ' ' + c0;
    message += s1 ? '\n' + s1 : '';
    message += s2 ? ', ' + s2 : '';
    message += s3 ? ', ' + s3 : '';
    if (markers.length) {
        message += ' (' + markers.join(',') + ')';
    }

    return message;
}

/**
 * an error that can be attached with markUI512Err
 */
export interface UI512AttachableErr {}

/**
 * break into debugger. V8 js perf sometimes hurt if seeing a debugger
 * statement, so separate it here.
 */
function breakIntoDebugger() {
    if (!checkIsProductionBuild()) {
        debugger;
    }
}

/**
 * record and show an unhandled exception
 */
function recordAndShowErr(firstMsg: string, msg: string) {
    if (UI512ErrorHandling.breakOnThrow || firstMsg.includes('assertion failed')) {
        UI512ErrorHandling.appendErrMsgToLogs(true, msg);
        console.error(msg);
        breakIntoDebugger();
        window.alert(msg);
    } else {
        UI512ErrorHandling.appendErrMsgToLogs(false, msg);
    }
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
 * make an error at the Vpc level
 */
export function makeVpcScriptErr(s: string) {
    let err = makeUI512ErrorGeneric(s, msgScriptErr);
    markUI512Err(err, true, false, true);
    return err;
}

/**
 * make an error that is labeled as "internal"
 */
export function makeVpcInternalErr(s: string) {
    let err = makeUI512ErrorGeneric(s, msgInternalErr);
    markUI512Err(err, true, true, false);
    return err;
}

/**
 * stamp the error object with our flags
 * we'd rather make a subclass of Error but some browsers don't like that.
 */
export function markUI512Err(
    e: Error,
    vpc?: boolean,
    internal?: boolean,
    script?: boolean,
    attachErr?: UI512AttachableErr,
) {
    (e as any).isUi512Error = true; /* assert.ts */
    (e as any).isVpcError = vpc ? true : undefined; /* assert.ts */
    (e as any).isVpcScriptError = script ? true : undefined; /* assert.ts */
    (e as any).isVpcInternalError = internal ? true : undefined; /* assert.ts */
    (e as any).attachErr = attachErr ? attachErr : undefined; /* assert.ts */
}

/**
 * a quick way to throw an exception if condition is false, for vpc layer
 */
export function checkThrow(condition: any, msg: string, s1: any = '', s2: any = '') {
    if (!condition) {
        throw makeVpcScriptErr(`${msg} ${s1} ${s2}`);
    }
}

declare const WEBPACK_PRODUCTION: boolean;

/**
 * check if we are in a production build.
 */
export function checkIsProductionBuild(): boolean {
    let ret = false;
    try {
        // when webpack builds this file it will replace the symbol
        // with `true` or `false`
        ret = WEBPACK_PRODUCTION;
    } catch {
        ret = false;
    }

    return ret;
}
