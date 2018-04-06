
/* auto */ import { O, assertTrue, checkThrowUI512, makeUI512Error, makeVpcScriptErr, scontains, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';

// reference parameter,
// indicates that this is an out param or that this parameter can be modified within the function
// also useful as a way of resetting reference types --
// if you say myArray = [3,4] then everyone holding a reference to myArray will incorrectly get the previous data
// tslint:disable-next-line
export class refparam<T> {
    constructor(public val: T) {}
}

declare var LZString: any;

export class Util512 {
    static bool(x: any): boolean {
        // false, 0, "", null, undefined, and NaN
        return !!x;
    }

    static booltrue(b: any) {
        assertEq(typeof b, 'boolean', '4O|');
        return !!b;
    }

    static add(a: number, b: number) {
        return a + b;
    }

    static isValidNumber(value: any) {
        return typeof value === 'number' && isFinite(value);
    }

    static range(start: number, end?: number, inc = 1) {
        if (end === undefined) {
            end = start;
            start = 0;
        }

        if ((inc > 0 && start >= end) || (inc < 0 && start <= end)) {
            return [];
        }

        let ret: number[] = [];
        for (let i = start; inc > 0 ? i < end : i > end; i += inc) {
            ret.push(i);
        }
        return ret;
    }

    // when, when can we have a ?? operator
    static coal<T>(maybe: T | null | undefined, val: T): T {
        return maybe === null || maybe === undefined ? val : maybe;
    }

    static repeat<T>(amount: number, item: T) {
        let ret: T[] = [];
        for (let i = 0; i < amount; i++) {
            ret.push(item);
        }

        return ret;
    }

    static concatarray(ar: any[], added: any[]) {
        let ags = [ar.length, 0];
        Array.prototype.splice.apply(ar, ags.concat(added));
    }

    static getdatestring(includeSeconds = false) {
        // month day hh mm
        let d = new Date();
        let hours = d.getHours();
        if (hours > 12) {
            hours -= 12;
        } else if (hours === 0) {
            hours = 12;
        }

        let sc = includeSeconds ? '-' + ('0' + d.getSeconds()).slice(-2) : '';
        return (
            `${d.getMonth() + 1} ${d.getDate()}, ` +
            ('0' + hours).slice(-2) +
            '-' +
            ('0' + d.getMinutes()).slice(-2) +
            sc
        );
    }

    static makeDefaultSort(onlyThisManyElements?: number) {
        return (a: any, b: any) => {
            return defaultSort(a, b, onlyThisManyElements);
        };
    }

    static getElem(s: string) {
        if (document) {
            let ret = document.getElementById(s);
            if (ret) {
                return ret;
            }
        }

        throw makeUI512Error('4N|getElem ' + s);
    }

    static weakUuid() {
        // by "broofa".
        // relies on the weak Math.random, so don't use this for crypto.
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = (Math.random() * 16) | 0;
            let v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    static getRandIntInclusiveWeak(min: number, max: number) {
        assertTrue(min >= 1 && max >= 1, `4M|invalid min ${min}`);
        // result can be min, max, or an integer between
        if (min === max) {
            return min;
        } else {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    static getBrowserOS(navString: string): BrowserOSInfo {
        if (scontains(navString, 'Windows')) {
            return BrowserOSInfo.Windows;
        } else if (
            /(iPhone|iPad|iPod)/.test(navString) ||
            /Mac OS X/.test(navString) ||
            /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/.test(navString)
        ) {
            return BrowserOSInfo.Mac;
        } else if (/(Linux|X11|UNIX)/.test(navString)) {
            return BrowserOSInfo.Linux;
        }
        return BrowserOSInfo.Unknown;
    }

    static beginLoadImage(url: string, img: HTMLImageElement, callback: () => void) {
        img.addEventListener('load', () => callback());
        img.onerror = () => {
            throw makeUI512Error('4L|failed to load ' + url);
        };
        img.src = url;
        if (img.complete) {
            // a website mentioned onLoad might be skipped if image is cached.
            callback();
        }
    }

    static beginLoadJson(url: string, req: XMLHttpRequest, callback: (s: string) => void, callbackOnErr?: () => void) {
        req.overrideMimeType('application/json');
        req.open('GET', url, true);
        if (!callbackOnErr) {
            callbackOnErr = () => {
                throw makeUI512Error('4K|failed to load ' + url + ' status=' + req.status);
            };
        }

        req.addEventListener('load', () => {
            if (req.status === 200) {
                callback(req.responseText);
            } else if (callbackOnErr) {
                callbackOnErr();
            }
        });
        req.addEventListener('error', () => {
            if (callbackOnErr) {
                callbackOnErr();
            }
        });
        req.send();
    }

    static asyncBeginLoadJson(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            Util512.beginLoadJson(
                url,
                req,
                s => {
                    let parsed = undefined;
                    try {
                        parsed = JSON.parse(s);
                    } catch (e) {
                        reject(e);
                    }

                    resolve(parsed);
                },
                () => reject(new Error('failed to load ' + url + ' with' + req.status))
            );
        });
    }

    static isMapEmpty<U>(map: { [key: string]: U }) {
        for (let key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    }

    // https://github.com/substack/deep-freeze
    // public domain
    static freezeRecurse(o: any) {
        Object.freeze(o);
        for (let prop in o) {
            if (
                o.hasOwnProperty(prop) &&
                o[prop] !== null &&
                o[prop] !== undefined &&
                (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
                !Object.isFrozen(o[prop])
            ) {
                Util512.freezeRecurse(o[prop]);
            }
        }
    }

    static freezeProperty(o: any, propName: string) {
        Object.freeze(o[propName]);
        Object.defineProperty(o, propName, { configurable: false, writable: false });
    }

    static shallowClone(o: any) {
        return Object.assign({}, o);
    }

    static escapeForRegex(s: string) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    static callAsMethodOnClass(clsname: string, me: any, s: string, args: any[], okIfNotExists: boolean) {
        checkThrowUI512(s.match(/^[a-zA-Z][0-9a-zA-Z_]+$/), 'callAsMethodOnClass requires alphanumeric no spaces', s);
        let method = me[s];
        assertTrue(args === undefined || Array.isArray(args), '4I|args not an array');
        if (method && typeof method === 'function') {
            assertTrue(
                me.hasOwnProperty(s) || me.__proto__.hasOwnProperty(s),
                '4H|cannot use parent classes',
                clsname,
                s
            );
            return method.apply(me, args);
        } else if (okIfNotExists) {
            return undefined;
        } else {
            throw makeUI512Error(`4G|callAsMethodOnClass ${clsname} could not find ${s}`);
        }
    }

    static getMapKeys<U>(map: { [key: string]: U }): string[] {
        let ret: string[] = [];
        for (let key in map) {
            if (map.hasOwnProperty(key)) {
                ret.push(key);
            }
        }

        return ret;
    }

    static getMapVals<T>(map: { [key: string]: T }) {
        let ret: T[] = [];
        for (let key in map) {
            if (map.hasOwnProperty(key)) {
                ret.push(map[key]);
            }
        }

        return ret;
    }

    static listUnique(ar: string[]) {
        let ret: string[] = [];
        let values: { [key: string]: boolean } = {};
        for (let i = 0; i < ar.length; i++) {
            if (!values[ar[i]]) {
                values[ar[i]] = true;
                ret.push(ar[i]);
            }
        }

        return ret;
    }

    static scriptsAlreadyLoaded: { [key: string]: boolean } = {};
    static asyncLoadJsIfNotAlreadyLoaded(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (Util512.scriptsAlreadyLoaded[url]) {
                resolve();
                return;
            }

            let script = document.createElement('script');
            script.setAttribute('src', url);
            let loaded = false; // prevents cb from being called twice
            script.onerror = () => {
                let urlsplit = url.split('/');
                reject(new Error('Did not load ' + urlsplit[urlsplit.length - 1]));
            };

            (script as any).onreadystatechange = script.onload = () => {
                if (!loaded) {
                    Util512.scriptsAlreadyLoaded[url] = true;
                    loaded = true;
                    resolve();
                }
            };

            document.getElementsByTagName('head')[0].appendChild(script);
        });
    }

    static makeCryptRandString(bytes: number) {
        let buf = new Uint8Array(bytes);
        window.crypto.getRandomValues(buf);
        return Util512.arrayToBase64(buf);
    }

    static arrayToBase64(b: Iterable<number>) {
        return btoa(String.fromCharCode.apply(null, b));
    }

    static toBase64UrlSafe(s: string) {
        // note: strips off final = padding
        return btoa(s)
            .replace(/\//g, '_')
            .replace(/\+/g, '-')
            .replace(/\=+$/, '');
    }
    static fromBase64UrlSafe(s: string) {
        // re-add final = padding
        if (s.length % 4 !== 0) {
            s += '==='.slice(0, 4 - s.length % 4);
        }
        return atob(s.replace(/_/g, '/').replace(/-/g, '+'));
    }

    static generateUniqueBase64UrlSafe(nbytes: number, charPrefix: string) {
        let buf = new Uint8Array(nbytes + 1);
        window.crypto.getRandomValues(buf);
        buf[0] = charPrefix.charCodeAt(0);
        let dataAsString = String.fromCharCode.apply(null, buf);
        return Util512.toBase64UrlSafe(dataAsString);
    }
}

export function findStrToEnum<T>(e: any, s: string): O<T> {
    assertTrue(e['__isUI512Enum'] !== undefined, '4F|must provide an enum type with __isUI512Enum defined.');
    if (s === '__isUI512Enum') {
        return undefined;
    } else if (s.startsWith('alternateforms_')) {
        return undefined;
    } else {
        let found = e[s];
        if (found) {
            return found;
        } else {
            return e['alternateforms_' + s];
        }
    }
}

export function getStrToEnum<T>(e: any, msgcontext: string, s: string): T {
    let found = findStrToEnum<T>(e, s);
    if (found !== undefined) {
        return found;
    } else {
        msgcontext = msgcontext ? `Not a valid choice of ${msgcontext} ` : `Not a valid choice for this value. `;
        if (e['__isUI512Enum'] !== undefined) {
            msgcontext += ' try one of';
            for (let enumMember in e) {
                if (
                    typeof enumMember === 'string' &&
                    !enumMember.startsWith('__') &&
                    !enumMember.startsWith('alternateform') &&
                    !scontains('0123456789', enumMember[0].toString())
                ) {
                    msgcontext += ', ' + enumMember;
                }
            }
        }

        throw makeUI512Error(msgcontext, '4E|');
    }
}

export function findEnumToStr<T>(e: any, n: number): O<string> {
    assertTrue(e['__isUI512Enum'] !== undefined, '4D|must provide an enum type with __isUI512Enum defined.');
    // currently e[n] might work if we put all alternateforms first.
    // but I don't want to depend on the current implementation which might change.
    for (let enumMember in e) {
        if (e[enumMember] === n && !enumMember.startsWith('__') && !enumMember.startsWith('alternateform')) {
            return enumMember.toString();
        }
    }

    return undefined;
}

export function getEnumToStrOrUnknown<T>(e: any, n: number, fallback = 'Unknown'): string {
    let found = findEnumToStr<T>(e, n);
    return found !== undefined ? found : fallback;
}

export function slength(s: string | null | undefined) {
    return !s ? 0 : s.length;
}

export function setarr<T>(ar: O<T>[], index: number, val: T) {
    assertTrue(index >= 0, `4C|invalid index ${index}`);
    if (index >= ar.length) {
        for (let i = 0; i < index - ar.length; i++) {
            ar.push(undefined);
        }
    }

    ar[index] = val;
}

export function cast<T>(instance: any, ctor: { new (...args: any[]): T }): T {
    if (instance instanceof ctor) {
        return instance;
    }

    throw new Error('type cast exception');
}

export function isString(v: any) {
    return typeof v === 'string' || v instanceof String;
}

export function fitIntoInclusive(n: number, min: number, max: number) {
    n = Math.min(n, max);
    n = Math.max(n, min);
    return n;
}

export class RenderComplete {
    complete = true;
    and(other: RenderComplete) {
        this.complete = this.complete && other.complete;
    }

    and_b(other: boolean) {
        this.complete = this.complete && other;
    }
}

export function defaultSort(a: any, b: any, onlyThisManyElements?: number): number {
    if (a === undefined && b === undefined) {
        return 0;
    } else if (a === null && b === null) {
        return 0;
    } else if (isString(a) && isString(b)) {
        return a < b ? -1 : a > b ? 1 : 0;
    } else if (typeof a === 'number' && typeof b === 'number') {
        return a < b ? -1 : a > b ? 1 : 0;
    } else if (typeof a === 'boolean' && typeof b === 'boolean') {
        return a < b ? -1 : a > b ? 1 : 0;
    } else if (a instanceof Array && b instanceof Array) {
        if (a.length < b.length) {
            return -1;
        }
        if (a.length > b.length) {
            return 1;
        }
        let howManyElementsToSort = onlyThisManyElements ? Math.min(onlyThisManyElements, a.length) : a.length;
        for (let i = 0; i < howManyElementsToSort; i++) {
            let cmp = defaultSort(a[i], b[i]);
            if (cmp !== 0) {
                return cmp;
            }
        }
        return 0;
    } else {
        throw makeUI512Error(`4B|could not compare types ${a} and ${b}`);
    }
}

export class LockableArr<T> {
    protected vals: T[] = [];
    protected locked = false;
    constructor(vals: T[] = []) {
        this.vals = vals;
    }
    lock() {
        this.locked = true;
    }
    push(v: T) {
        assertTrue(!this.locked, '4A|locked');
        this.vals.push(v);
    }
    set(i: number, v: T) {
        assertTrue(!this.locked, '49|locked');
        this.vals[i] = v;
    }
    len() {
        return this.vals.length;
    }
    at(i: number) {
        return this.vals[i];
    }
    getUnlockedCopy() {
        let other = new LockableArr<T>();
        other.locked = false;
        other.vals = this.vals.slice(0);
        return other;
    }
}

export class RepeatingTimer {
    periodInMilliseconds = 0;
    lasttimeseen = 0;
    started = 0;
    constructor(periodInMilliseconds: number) {
        this.periodInMilliseconds = periodInMilliseconds;
    }
    update(ms: number) {
        this.lasttimeseen = ms;
    }
    isDue(): boolean {
        return this.lasttimeseen - this.started > this.periodInMilliseconds;
    }
    reset() {
        this.started = this.lasttimeseen;
    }
}

export interface IFontManager {}

export interface IIconManager {}

export interface IUI512Session {}

export interface Root {
    invalidateAll(): void;
    getFontManager(): IFontManager;
    getIconManager(): IIconManager;
    getSession(): O<IUI512Session>;
    setSession(session: O<IUI512Session>): void;
    getBrowserInfo(): BrowserOSInfo;
    replaceCurrentController(newController: any): void;
    runTests(all: boolean): void;
}

export class OrderedHash<TValue> {
    private keys: string[] = [];
    private vals: { [key: string]: TValue } = {};

    deleteAll() {
        this.keys = [];
        this.vals = {};
    }

    insertNew(k: string, v: TValue) {
        assertTrue(k !== null && k !== undefined, '48|invalid key');
        assertTrue(v !== undefined, '47|invalid val');
        assertTrue(this.vals[k] === undefined, `46|key ${k} already exists`);
        this.keys.push(k);
        this.vals[k] = v;
    }

    insertAt(k: string, v: TValue, n: number) {
        assertTrue(k !== null && k !== undefined, '45|invalid key');
        assertTrue(v !== undefined, '44|invalid val');
        assertTrue(this.vals[k] === undefined, `43|key ${k} already exists`);
        this.keys.splice(n, 0, k);
        this.vals[k] = v;
    }

    getIndex(k: string) {
        let ret = this.keys.indexOf(k);
        assertTrue(ret !== -1, `42|could not find ${k}`);
        return ret;
    }

    atIndex(n: number): O<TValue> {
        if (n >= 0 && n < this.keys.length) {
            return this.vals[this.keys[n]];
        } else {
            return undefined;
        }
    }

    find(k: string): O<TValue> {
        return this.vals[k];
    }

    get(k: string): TValue {
        return throwIfUndefined(this.find(k), '41|could not find ', k);
    }

    delete(k: string): boolean {
        assertTrue(k !== null && k !== undefined, '40|invalid key');
        let index = this.keys.indexOf(k);
        if (index !== -1) {
            this.keys.splice(index, 1);
            delete this.vals[k];
            return true;
        } else {
            return false;
        }
    }

    length() {
        return this.keys.length;
    }

    *iterKeys() {
        for (let k of this.keys) {
            yield k;
        }
    }

    *iter() {
        for (let k of this.keys) {
            yield this.vals[k];
        }
    }

    *iterReversed() {
        for (let i = this.keys.length - 1; i >= 0; i--) {
            yield this.vals[this.keys[i]];
        }
    }
}

export enum BrowserOSInfo {
    __isUI512Enum = 1,
    Unknown,
    Windows,
    Linux,
    Mac,
}

/* CharClassify

Permission to use, copy, modify, and distribute this software and its
documentation for any purpose and without fee is hereby granted,
provided that the above copyright notice appear in all copies and that
both that copyright notice and this permission notice appear in
supporting documentation.
Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
Ported from C++ to TypeScript by Ben Fisher, 2017
*/

export enum CharClass {
    __isUI512Enum = 1,
    Space,
    NewLine,
    Word,
    Punctuation,
}

export class GetCharClass {
    static readonly a = 'a'.charCodeAt(0);
    static readonly z = 'z'.charCodeAt(0);
    static readonly A = 'A'.charCodeAt(0);
    static readonly Z = 'Z'.charCodeAt(0);
    static readonly n0 = '0'.charCodeAt(0);
    static readonly n9 = '9'.charCodeAt(0);
    static readonly hash = '#'.charCodeAt(0);
    static readonly under = '_'.charCodeAt(0);
    static readonly dash = '-'.charCodeAt(0);
    static readonly nl = '\n'.charCodeAt(0);
    static readonly cr = '\r'.charCodeAt(0);
    static readonly space = ' '.charCodeAt(0);
    static readonly nonbreakingspace = '\xCA'.charCodeAt(0);
    static get(c: number) {
        if (c === GetCharClass.cr || c === GetCharClass.nl) {
            return CharClass.NewLine;
        } else if (c < 0x20 || c === GetCharClass.space || c === GetCharClass.nonbreakingspace) {
            return CharClass.Space;
        } else if (
            (c >= 0x80 && c <= 0xff) ||
            (c >= GetCharClass.a && c <= GetCharClass.z) ||
            (c >= GetCharClass.A && c <= GetCharClass.Z) ||
            (c >= GetCharClass.n0 && c <= GetCharClass.n9) ||
            c === GetCharClass.hash ||
            c === GetCharClass.under ||
            c === GetCharClass.dash
        ) {
            return CharClass.Word;
        } else if (c <= 0xff) {
            return CharClass.Punctuation;
        } else {
            // let's choose to treat all unicode non-ascii as word.
            return CharClass.Word;
        }
    }

    static getLeftRight(
        charAt: Function,
        len: number,
        n: number,
        isLeft: boolean,
        isUntilWord: boolean,
        includeTrailingSpace: boolean
    ) {
        if (len === 0) {
            return n;
        }

        if (isUntilWord && isLeft) {
            if (includeTrailingSpace) {
                while (n > 0 && GetCharClass.get(charAt(n - 1)) === CharClass.Space) {
                    n--;
                }
            }

            if (n > 0) {
                let classStart = GetCharClass.get(charAt(n - 1));
                while (n > 0 && GetCharClass.get(charAt(n - 1)) === classStart) {
                    n--;
                }
            }
        } else if (isUntilWord && !isLeft) {
            if (n === len) {
                n -= 1;
            }

            let classStart = GetCharClass.get(charAt(n));
            while (n < len && GetCharClass.get(charAt(n)) === classStart) {
                n++;
            }

            if (includeTrailingSpace) {
                while (n < len && GetCharClass.get(charAt(n)) === CharClass.Space) {
                    n++;
                }
            }
        } else {
            n += isLeft ? -1 : 1;
        }

        return fitIntoInclusive(n, 0, len);
    }
}

export class MapKeyToObject<T> {
    protected objects: { [key: string]: T } = {};
    constructor() {}
    get(key: string) {
        return throwIfUndefined(this.objects[key], '3_|id not found', key);
    }

    find(key: O<string>) {
        if (key) {
            return this.objects[key];
        } else {
            return undefined;
        }
    }

    add(key: string, obj: T) {
        assertTrue(slength(key) > 0, `3^|invalid id ${key}`);
        if (this.objects[key] !== undefined) {
            throw makeUI512Error(`3]|duplicate key, ${key} already exists`);
        }

        this.objects[key] = obj;
    }

    freeze() {
        Object.freeze(this.objects);
    }

    remove(key: string) {
        delete this.objects[key];
    }

    getVals(): T[] {
        return Util512.getMapVals(this.objects);
    }

    getKeys(): string[] {
        return Util512.getMapKeys(this.objects);
    }
}

export const base10 = 10;

export class MapKeyToObjectCanSet<T> extends MapKeyToObject<T> {
    set(key: string, obj: T) {
        assertTrue(slength(key) > 0, `3[|invalid id ${key}`);
        this.objects[key] = obj;
    }
}

export function sleep(ms: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms);
    });
}

export function checkThrowEq(expected: any, got: any, msg: string, c1: any = '', c2: any = '') {
    if (defaultSort(expected, got) !== 0) {
        throw makeVpcScriptErr(`${msg} expected "${expected}" but got "${got}" ${c1} ${c2}`);
    }
}

export function assertEq(expected: any, received: any, c1: string, c2?: any, c3?: any, c4?: any, c5?: any) {
    // important: do not let execution continue if not equal
    if (defaultSort(expected, received) !== 0) {
        let msg =
            "assertion failed in assertEq, expected '" +
            expected.toString() +
            "' but got '" +
            received.toString() +
            "'.";
        throw makeUI512Error(msg, c1, c2, c3, c4, c5);
    }
}

export function assertEqWarn(expected: any, received: any, c1: string, c2?: any, c3?: any, c4?: any, c5?: any) {
    if (defaultSort(expected, received) !== 0) {
        let msg =
            "warning, assertion failed in assertEqWarn, expected '" +
            expected.toString() +
            "' but got '" +
            received.toString() +
            "'.";
        let er = makeUI512Error(msg, c1, c2, c3, c4, c5);
        if (!window.confirm('continue?')) {
            throw er;
        }
    }
}
