
/* auto */ import { isRelease } from '../../config.js';

/**
 * a VpcScriptErr came from an error in script the user typed, not from our code
 * a VpcInternalErr came from the vpc layer
 * a ui512InternallErr came from ui layer
 */
export const msgScriptErr = 'VpcScriptError: ';
export const msgInternalErr = 'Vpc Internal Error: ';
export const msgNotification = 'Simple Notification: ';
export const ui512InternalErr = 'ui512: ';
export const cProductName = 'ViperCard';
export const cAltProductName = 'HyperCard';

/**
 * make an error object, record the error, and depending on severity, show alert box
 * you can pass in arguments to indicate context of when/why error occurred
 */
export function makeUI512ErrorGeneric(firstMsg: string, prefix: string, s1?: any, s2?: any, s3?: any) {
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
export function makeUI512Error(msg: string, s1?: any, s2?: any, s3?: any) {
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
        if (!isRelease) {
            debugger;
        }

        window.alert(e.message);
    }
}

/**
 * note: this is a 'hard' assert that always throws an exception + shows a dialog
 * use assertTrueWarn if it's not a very important check
 */
export function assertTrue(condition: any, s1: string, s2?: any, s3?: any) {
    if (!condition) {
        throw makeUI512Error('assertion failed in assertTrue.', s1, s2, s3);
    }
}

/**
 * a 'soft' assert. Record the error, but allow execution to continue
 */
export function assertTrueWarn(condition: any, s1: string, s2?: any, s3?: any) {
    if (!condition) {
        let er = makeUI512Error('warning, assertion failed in assertTrueWarn.', s1, s2, s3);
        if (!window.confirm('continue?')) {
            throw er;
        }
    }
}

/**
 * a quick way to throw an exception if condition is false
 */
export function checkThrowUI512(condition: any, msg: string, s1: any = '', s2: any = '') {
    if (!condition) {
        throw makeUI512Error(`${msg} ${s1} ${s2}`);
    }
}

/**
 * a way to safely go from optional<T> to T
 */
export function throwIfUndefined<T>(v: O<T>, s1: string, s2: any = '', s3: any = ''): T {
    if (v === undefined || v === null) {
        let msg = 'not defined';
        if (s1 !== '') {
            msg += ', ' + s1.toString();
        }

        if (s2 !== '') {
            msg += ', ' + s2.toString();
        }

        if (s3 !== '') {
            msg += ', ' + s3.toString();
        }

        throw makeUI512Error(msg);
    } else {
        return v;
    }
}

/**
 * a short way to say optional<T>.
 * prefer O<string> over ?string everywhere, I find it easier to read and reason about.
 */
export type O<T> = T | undefined;

/**
 * external LZString compression
 */
declare var LZString: any;

/**
 * LZString uses the fact that JS strings are UTF16 to compress data.
 * I use compressToUTF16() instead of compress() which creates invalid utf sequences.
 */
export class UI512Compress {
    protected static stringEscapeNewline = '##Newline##';
    protected static reEscapeNewline = new RegExp(UI512Compress.stringEscapeNewline, 'g');
    protected static reNewline = new RegExp('\n', 'g');
    static compressString(s: string) {
        let compressed = LZString.compressToUTF16(s);
        return compressed;
    }

    static decompressString(s: string) {
        return LZString.decompressFromUTF16(s);
    }
}

/**
 * store the last <size> log entries, without needing to move contents or allocate more memory.
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
        assertTrue(howMany < this.size, '');
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
        return (a % n + n) % n;
    }

    abstract getAt(index: number): string;
    abstract setAt(index: number, s: string): void;
    abstract getLatestIndex(): number;
    abstract setLatestIndex(index: number): void;
}

/**
 * use localstorage to store, so that logs persist when page is refreshed.
 * vpc_log_ptr should be in local storage, vpc could be running in 2 browser windows.
 */
class RingBufferLocalStorage extends RingBuffer {
    getAt(index: number): string {
        return window.localStorage['vpc_log_' + index] || '';
    }

    setAt(index: number, s: string) {
        window.localStorage['vpc_log_' + index] = s;
    }

    getLatestIndex() {
        let ptrLatest = parseInt(window.localStorage['vpc_log_ptr'] || '0', 10);
        return Number.isFinite(ptrLatest) ? ptrLatest : 0;
    }

    setLatestIndex(index: number) {
        window.localStorage['vpc_log_ptr'] = index.toString();
    }
}

/**
 * store logs. user can choose "send err report" to send us error context.
 */
export class UI512ErrorHandling {
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
        if (!UI512ErrorHandling.runningTests && !!window.localStorage && !scontains(s, msgNotification)) {
            let severity = showedDialog ? '1' : '2';
            let encoded = severity + UI512ErrorHandling.encodeErrMsg(s);
            UI512ErrorHandling.store.append(encoded);
        }
    }

    static getLatestErrLogs(amount: number): string[] {
        return UI512ErrorHandling.store.retrieve(amount);
    }
}

export function makeVpcScriptErr(s: string) {
    let err = makeUI512ErrorGeneric(s, msgScriptErr);
    markUI512Err(err, true, false, true);
    return err;
}

export function makeVpcInternalErr(s: string) {
    let err = makeUI512ErrorGeneric(s, msgInternalErr);
    markUI512Err(err, true, true, false);
    return err;
}

/**
 * a quick way to throw an exception if condition is false, for vpc layer
 */
export function checkThrow(condition: any, msg: string, s1: any = '', s2: any = '') {
    if (!condition) {
        throw makeVpcScriptErr(`${msg} ${s1} ${s2}`);
    }
}

/**
 * string-contains
 */
export function scontains(haystack: string, needle: string) {
    return haystack.indexOf(needle) !== -1;
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
 * combine strings, and move all 'tags' to the end
 */
export function joinIntoMessage(c0: string, prefix: string, s1?: any, s2?: any, s3?: any) {
    let tags: string[] = [];
    c0 = findTags(c0, tags);
    s1 = findTags(s1, tags);
    let message = prefix + ' ' + c0;
    message += s1 ? '\n' + s1.toString() : '';
    message += s2 ? ', ' + s2.toString() : '';
    message += s3 ? ', ' + s3.toString() : '';
    if (tags.length) {
        message += ' (' + tags.join(',') + ')';
    }

    return message;
}

/**
 * an error that can be attached with markUI512Err
 */
export interface UI512AttachableErr {}

/**
 * stamp the error object with our flags
 * we'd rather make a subclass of Error but some browsers don't like that.
 */
export function markUI512Err(
    e: Error,
    vpc?: boolean,
    internal?: boolean,
    script?: boolean,
    attachErr?: UI512AttachableErr
) {
    (e as any).isUi512Error = true; /* assert.ts */
    (e as any).isVpcError = vpc ? true : undefined; /* assert.ts */
    (e as any).isVpcScriptError = script ? true : undefined; /* assert.ts */
    (e as any).isVpcInternalError = internal ? true : undefined; /* assert.ts */
    (e as any).attachErr = attachErr ? attachErr : undefined; /* assert.ts */
}

/**
 * break into debugger. V8 js perf sometimes hurt if seeing a debugger statement, so separate it here.
 */
function breakIntoDebugger() {
    if (!isRelease) {
        debugger;
    }
}

/**
 * record and show an unhandled exception
 */
function recordAndShowErr(firstMsg: string, msg: string) {
    if (UI512ErrorHandling.breakOnThrow || scontains(firstMsg, 'assertion failed')) {
        UI512ErrorHandling.appendErrMsgToLogs(true, msg);
        console.error(msg);
        breakIntoDebugger();
        window.alert(msg);
    } else {
        UI512ErrorHandling.appendErrMsgToLogs(false, msg);
    }
}

/**
 * we add two-digit tags to most asserts, so that if a bug report comes in,
 * we have more context about the site of failure.
 * assert tags are in the form xx|; this fn extracts them from a string.
 */
function findTags(s: any, tags: string[]) {
    if (s && typeof s === 'string' && s[2] === '|') {
        tags.push(s.slice(0, 2));
        return s.slice(3);
    } else {
        return s;
    }
}
