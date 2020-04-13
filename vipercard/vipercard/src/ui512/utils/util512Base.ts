
/* auto */ import { BridgedLZString } from './../../bridge/bridgeLzString';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * be extra cautious in case string was made via new String
 */
export function isString(v: unknown): v is string {
    return bool(typeof v === 'string') || bool(v instanceof String);
}

/**
 * is it truthy? anything except false, 0, "", null, undefined, and NaN
 */
export function bool(x: unknown): boolean {
    /* eslint-disable-next-line no-implicit-coercion */
    return !!x;
}

/**
 * works as a typescript type assertion
 */
export function trueIfDefinedAndNotNull<T>(x: O<T>): x is T {
    return bool(x);
}

/**
 * cast to string.
 */
export function tostring(s: unknown): string {
    /* eslint-disable-next-line no-implicit-coercion */
    return '' + s;
}

/**
 * retains the let a = b || c; behavior
 */
export function coalesceIfFalseLike<T>(instance: T | null | undefined, defaultval: T): T {
    return instance ? instance : defaultval;
}

/**
 * this will not exist at runtime, the string is rewritten
 */
declare const WEBPACK_PRODUCTION: boolean;
declare const DBGPLACEHOLDER: boolean;

/**
 * check if we are in a production build.
 */
export function checkIsProductionBuild(): boolean {
    let ret = false;
    try {
        /* when webpack builds this file it will replace the string */
        /* with `true` or `false` */
        ret = WEBPACK_PRODUCTION;
    } catch {
        ret = false;
    }

    return ret;
}

/**
 * at build time, the string below
 * might be replaced with "debugger".
 * V8's perf can be affected if there's a debugger statement around,
 * so this makes sure it's not even there.
 */
export function callDebuggerIfNotInProduction() {
    window['DBG' + 'PLACEHOLDER'] = true;
    /* eslint-disable-next-line no-unused-expressions */
    DBGPLACEHOLDER;
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
export class RingBufferLocalStorage extends RingBuffer {
    getAt(index: number): string {
        if (window.localStorage) {
            return window.localStorage['ui512Log_' + index] ?? '';
        } else {
            return '';
        }
    }

    setAt(index: number, s: string) {
        if (window.localStorage) {
            window.localStorage['ui512Log_' + index] = s;
        }
    }

    getLatestIndex() {
        if (window.localStorage) {
            let sLatest = window.localStorage['ui512LogPtr'] ?? '0';

            /* ok to use here, we remembered to say base 10 */
            /* eslint-disable-next-line ban/ban */
            let ptrLatest = parseInt(sLatest, 10);
            return Number.isFinite(ptrLatest) ? ptrLatest : 0;
        } else {
            return 0;
        }
    }

    setLatestIndex(index: number) {
        if (window.localStorage) {
            window.localStorage['ui512LogPtr'] = index.toString();
        }
    }
}

/**
 * change these as appropriate for your product
 */
export const cProductName = 'ViperCard';
export const cAltProductName = 'HyperCard';
export const vpcVersion = '00002061';
export const vpcWebsite = 'https://www.vipercard.net/0.3/';
export const vpcWebsitePart = '/0.3/';

/**
 * a short way to say optional<T>.
 * prefer O<string> over ?string, I find it easier to read and reason about.
 */
export type O<T> = T | undefined;

/**
 * LZString uses the fact that JS strings have 16 bit chars to compress data succinctly.
 * I use compressToUTF16() instead of compress() to use only valid utf sequences.
 */
export class UI512Compress {
    protected static stringEscapeNewline = '##Newline##';
    protected static reEscapeNewline = new RegExp(UI512Compress.stringEscapeNewline, 'g');
    protected static reNewline = /\n/g;
    static compressString(s: string): string {
        let compressed = BridgedLZString.compressToUTF16(s);
        return compressed;
    }

    static decompressString(s: string): string {
        return BridgedLZString.decompressFromUTF16(s) ?? '';
    }
}
