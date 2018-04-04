
/* auto */ import { isRelease } from '../../appsettings.js';

export function makeUI512ErrorGeneric(
    firstmsg: string,
    prefix: string,
    c1?: any,
    c2?: any,
    c3?: any,
    c4?: any,
    c5?: any
) {
    let tags: string[] = [];
    firstmsg = gatherTags(firstmsg, tags);
    c1 = gatherTags(c1, tags);
    c2 = gatherTags(c2, tags);
    c3 = gatherTags(c3, tags);

    let msg = prefix + ' ' + firstmsg;
    if (c1) {
        msg += ' context: ' + c1.toString();
    }

    msg += c2 ? ' ' + c2.toString() : '';
    msg += c3 ? ' ' + c3.toString() : '';
    msg += c4 ? ' ' + c4.toString() : '';
    msg += c5 ? ' ' + c5.toString() : '';
    if (tags.length) {
        msg += ' (' + tags.join(',') + ')';
    }

    let ret = new Error(msg);
    (ret as any).isUi512Error = true;
    msg += `\n${ret.stack}`;
    if (UI512ErrorHandling.breakOnThrow || scontains(firstmsg, 'assertion failed')) {
        try {
            // prevent an infinite loop in case this throws
            UI512ErrorHandling.appendErrMsgToLogs(true, msg);
        } catch (e) {
            console.error('could not log ' + e.message);
        }

        console.error(msg);
        if (!isRelease) {
            debugger;
        }

        window.alert(msg);
    } else {
        try {
            // prevent an infinite loop in case this throws
            UI512ErrorHandling.appendErrMsgToLogs(false, msg);
        } catch (e) {
            console.error('could not log ' + e.message);
        }
    }

    return ret;
}

export function checkThrowUI512(condition: any, msg: string, c1: any = '', c2: any = '') {
    if (!condition) {
        throw makeUI512Error(`${msg} ${c1} ${c2}`);
    }
}

function gatherTags(s: any, tags: string[]) {
    if (s && typeof s === 'string' && s[2] === '|') {
        tags.push(s.slice(0, 2));
        return s.slice(3);
    } else {
        return s;
    }
}

export function makeUI512Error(msg: string, c1?: any, c2?: any, c3?: any, c4?: any, c5?: any) {
    return makeUI512ErrorGeneric(msg, ui512InternalErr, c1, c2, c3, c4, c5);
}

export function ui512RespondError(e: Error, context: string) {
    if ((e as any).isUi512Error) {
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

export function assertTrue(condition: any, c1: string, c2?: any, c3?: any, c4?: any, c5?: any) {
    // important: do not let execution continue if condition is false.
    if (!condition) {
        throw makeUI512Error('assertion failed in assertTrue.', c1, c2, c3, c4, c5);
    }
}

export function assertTrueWarn(condition: any, c1: string, c2?: any, c3?: any, c4?: any, c5?: any) {
    if (!condition) {
        let er = makeUI512Error('warning, assertion failed in assertTrueWarn.', c1, c2, c3, c4, c5);
        if (!window.confirm('continue?')) {
            throw er;
        }
    }
}

export function throwIfUndefined<T>(v: O<T>, msg1: string, msg2: any = '', msg3: any = ''): T {
    if (v === undefined) {
        let fullmsgThrowIfUndefined = 'not defined';
        if (msg1 !== '') {
            fullmsgThrowIfUndefined += ', ' + msg1.toString();
        }
        if (msg2 !== '') {
            fullmsgThrowIfUndefined += ', ' + msg2.toString();
        }
        if (msg3 !== '') {
            fullmsgThrowIfUndefined += ', ' + msg3.toString();
        }
        throw makeUI512Error(fullmsgThrowIfUndefined);
    } else {
        return v;
    }
}

// optional type
export type O<T> = T | undefined;

declare var LZString: any;

export class UI512Compress {
    // use compressToUTF16 instead of default compress() which can create invalid utf sequences
    protected static tokenEscapeNewline = '##Newline##'; // odds of occurring are less than 1/256 ^ 6
    protected static reEscapeNewline = new RegExp(UI512Compress.tokenEscapeNewline, 'g');
    protected static reNewline = new RegExp('\n', 'g');
    static compressString(s: string, escapeNewlines: boolean) {
        let compressed = LZString.compressToUTF16(s);
        if (escapeNewlines) {
            checkThrowUI512(
                compressed.search(UI512Compress.reEscapeNewline) < 0,
                `cannot compress this data. the compressed data happened to contain the string ${
                    UI512Compress.tokenEscapeNewline
                } which mathematically is very unlikely.`
            );
            return compressed.replace(UI512Compress.reNewline, UI512Compress.tokenEscapeNewline);
        } else {
            return compressed;
        }
    }

    static decompressString(s: string, escapeNewlines: boolean) {
        if (escapeNewlines) {
            s = s.replace(UI512Compress.reEscapeNewline, '\n');
            return LZString.decompressFromUTF16(s);
        } else {
            return LZString.decompressFromUTF16(s);
        }
    }
}

export class UI512ErrorHandling {
    // use a ring buffer in local storage
    // current pointer to latest stored in window.localStorage['vpc_log_ptr']
    static breakOnThrow = true;
    static runningTests = false;
    static readonly maxErrLenKept = 512;
    static readonly maxNumberOfLinesKept = 256;

    protected static encodeErrMsg(s: string) {
        s = s.substr(0, UI512ErrorHandling.maxErrLenKept);
        return UI512Compress.compressString(s, true);
    }

    protected static decodeErrMsg(compressed: string) {
        return UI512Compress.decompressString(compressed, true);
    }

    static appendErrMsgToLogs(showedDialog: boolean, s: string) {
        // many of these will be expected errors, like script runtime errors
        // but right now we log everything

        if (!UI512ErrorHandling.runningTests && !!window.localStorage && !scontains(s, 'Simple Notification:')) {
            // we log errors in a compressed format
            // first character is showedDialog as 'severity', 1 or 2.
            let encoded = (showedDialog ? '1' : '2') + UI512ErrorHandling.encodeErrMsg(s);

            // update ring buffer pointer.
            // store ptr in the local storage, not in a global, in case there's another vpc instance in other browser window
            let ptrLatest = parseInt(window.localStorage['vpc_log_ptr'] || '0', 10);
            ptrLatest = Number.isFinite(ptrLatest) ? ptrLatest : 0;
            window.localStorage['vpc_log_ptr'] = UI512ErrorHandling.mod(
                ptrLatest + 1,
                UI512ErrorHandling.maxNumberOfLinesKept
            ).toString();
            window.localStorage['vpc_log_' + ptrLatest] = encoded;
        }
    }

    static mod(a: number, n: number) {
        // more intuitive with negative numbers
        return (a % n + n) % n;
    }

    static getLatestErrLogs(amount: number): string {
        let ret = '';
        let ptrLatest = parseInt(window.localStorage['vpc_log_ptr'] || '0', 10);
        ptrLatest = Number.isFinite(ptrLatest) ? ptrLatest : 0;
        for (let i = 0; i < amount; i++) {
            let index = UI512ErrorHandling.mod(ptrLatest - i, UI512ErrorHandling.maxNumberOfLinesKept);
            // safe to use \n as a delimiter because of our encoding
            ret += (window.localStorage['vpc_log_' + index] || '') + '\n';
        }

        return ret;
    }
}

export function makeVpcScriptErr(s: string) {
    let err = makeUI512ErrorGeneric(s, msgScriptErr);
    (err as any).isVpcError = true;
    (err as any).isVpcScriptError = true;
    return err;
}

export function makeVpcInternalErr(s: string) {
    let err = makeUI512ErrorGeneric(s, msgInternalErr);
    (err as any).isVpcError = true;
    (err as any).isVpcInternalError = true;
    return err;
}

export function checkThrow(condition: any, msg: string, c1: any = '', c2: any = '') {
    if (!condition) {
        throw makeVpcScriptErr(`${msg} ${c1} ${c2}`);
    }
}

export function scontains(haystack: string, needle: string) {
    return haystack.indexOf(needle) !== -1;
}

export function cleanExceptionMsg(s: string) {
    if (s.startsWith('Vpc Internal Error:  Simple Notification:')) {
        // this isn't even an error, it's a signal to show a dialog
        s = s.substr('Vpc Internal Error:  Simple Notification:'.length).trim();
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

export const msgScriptErr = 'VpcScriptError: ';
export const msgInternalErr = 'Vpc Internal Error: ';
export const ui512InternalErr = 'ui512: ';
export const cProductName = 'ViperCard';
