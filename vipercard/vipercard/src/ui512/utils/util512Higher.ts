
/* auto */ import { O, UI512ErrorHandling, assertTrue, checkThrowUI512, makeUI512Error, respondUI512Error } from './util512Assert';
/* auto */ import { AnyJson, BrowserOSInfo, Util512, assertEq, fitIntoInclusive, last } from './util512';

// moltenform.com(Ben Fisher)
// MIT license

export class Util512Higher {
    /**
     * weakUuid, by broofa
     * uses the weak Math.random, not cryptographically sound.
     */
    static weakUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = (Math.random() * 16) | 0;
            let v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * random number between min and max, inclusive
     * uses the weak Math.random, don't use this for crypto.
     * slightly an uneven distribution.
     */
    static getRandIntInclusiveWeak(min: number, max: number) {
        assertTrue(min >= 1 && max >= 1, `4M|invalid min ${min}`);
        if (min === max) {
            return min;
        } else {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    /**
     * random number between min and max, inclusive
     */
    static getRandIntInclusiveStrong(min: number, max: number) {
        assertTrue(min >= 1 && max >= 1, 'O)|getRandIntInclusiveStrong must be >= 1');
        min = Math.ceil(min);
        max = Math.floor(max);
        let nRange = max - min;
        assertTrue(
            nRange > 1 && nRange < 255,
            'O(|getRandIntInclusiveStrong too wide range'
        );
        let nextPowerOf2 = 1;
        while (nextPowerOf2 < nRange) {
            nextPowerOf2 *= 2;
        }

        // use rejection sampling. slower, but better for uniform values
        let buf = new Uint8Array(8);
        while (true) {
            window.crypto.getRandomValues(buf);
            for (let i = 0; i < buf.length; i++) {
                assertTrue(buf[i] >= 0 && buf[i] < 256, 'O&|out of range');
                let v = buf[i] % nextPowerOf2;
                if (v <= nRange) {
                    return min + v;
                }
            }
        }
    }

    /**
     * make random bytes, return as base64.
     */
    static makeCryptRandString(bytes: number) {
        let buf = new Uint8Array(bytes);
        window.crypto.getRandomValues(buf);
        return Util512.arrayToBase64(Array.from(buf));
    }

    /**
     * generate random string, first byte is specified
     */
    static generateUniqueBase64UrlSafe(nBytes: number, charPrefix: string) {
        assertEq(1, charPrefix.length, 'O%|expected one char');
        let buf = new Uint8Array(nBytes + 1);
        window.crypto.getRandomValues(buf);
        buf[0] = charPrefix.charCodeAt(0);
        let dataAsString = Array.from(buf)
            .map(item => String.fromCharCode(item))
            .join('');
        return Util512.toBase64UrlSafe(dataAsString);
    }

    /**
     * download image asynchronously
     */
    static beginLoadImage(url: string, img: HTMLImageElement, callback: () => void) {
        let haveRunCallback = false;
        img.addEventListener('load', () => {
            if (!haveRunCallback) {
                haveRunCallback = true;
                callback();
            }
        });
        img.onerror = () => {
            throw makeUI512Error('4L|failed to load ' + url);
        };
        img.src = url;
        if (img.complete) {
            /* some sources say it might be possible for .complete to be set
            immediately if image was cached */
            haveRunCallback = true;
            callback();
        }
    }

    /**
     * download json asynchronously. see vpcrequest.ts if sending parameters.
     */
    static beginLoadJson(
        url: string,
        req: XMLHttpRequest,
        callback: (s: string) => void,
        callbackOnErr?: () => void
    ) {
        req.overrideMimeType('application/json');
        req.open('GET', url, true);
        if (!callbackOnErr) {
            callbackOnErr = () => {
                throw makeUI512Error(`4K|failed to load ${url}, status=${req.status}`);
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

    /**
     * download json asynchronously, and return parsed js object.
     * chose to use an old-style Promise rather than async
     */
    static asyncBeginLoadJson(url: string): Promise<AnyJson> {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            Util512Higher.beginLoadJson(
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
                () => reject(new Error(`4K|failed to load ${url}, status=${req.status}`))
            );
        });
    }

    /**
     * load and run script. must be on same domain.
     */
    static scriptsAlreadyLoaded: { [key: string]: boolean } = {};
    static asyncLoadJsIfNotAlreadyLoaded(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            assertTrue(url.startsWith('/'), 'J8|');
            if (Util512Higher.scriptsAlreadyLoaded[url]) {
                resolve();
                return;
            }

            let script = window.document.createElement('script');
            script.setAttribute('src', url);

            /* prevents cb from being called twice */
            let loaded = false;
            script.onerror = () => {
                let urlsplit = url.split('/');
                reject(new Error('Did not load ' + last(urlsplit)));
            };

            script.onload = () => {
                if (!loaded) {
                    Util512Higher.scriptsAlreadyLoaded[url] = true;
                    loaded = true;
                    resolve();
                }
            };

            (script as any).onreadystatechange = script.onload; /* browser compat */

            window.document.getElementsByTagName('head')[0].appendChild(script);
        });
    }

    /**
     * all code that goes from sync to async *must* use this method
     * so that errors can be shown, otherwise they might be invisible.
     */
    static syncToAsyncTransition<T>(
        fn: () => Promise<T>,
        context: string,
        alertOnErr: RespondToErr = RespondToErr.Alert
    ) {
        fn().then(
            () => {
                /* fulfilled with no exceptions */
            },
            (err: unknown) => {
                if (!(err as any)?.isUi512Error) {
                    UI512ErrorHandling.appendErrMsgToLogs(
                        false,
                        'unhandled in async ' + err
                    );
                }

                let e = err instanceof Error ? err : new Error(`non-Error param ${err}`);
                if (alertOnErr === RespondToErr.Alert) {
                    respondUI512Error(e, context);
                } else {
                    console.error(e.toString());
                }
            }
        );
    }

    /**
     * call this in an async function: await sleep(1000) to wait one second.
     */
    static sleep(ms: number) {
        return new Promise<void>(resolve => {
            /* it's ok to use an old-style promise, we're not going from sync to async */
            /* eslint-disable-next-line ban/ban */
            setTimeout(resolve, ms);
        });
    }

    /**
     * get date as month day hh mm
     */
    static getdatestring(includeSeconds = false) {
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
}

export enum RespondToErr {
    Alert,
    ConsoleErrOnly
}

/**
 * easier-to-read type aliases
 */
export type VoidFn = () => void;
export type AsyncVoidFn = () => Promise<void>;

/**
 * root (top-level) object
 */
export interface UI512IsDrawTextInterface {}
export interface UI512IsDrawIconInterface {}
export interface UI512IsSessionInterface {}
export interface UI512IsPresenterInterface {}
export interface UI512IsEventInterface {}
export interface Root {
    invalidateAll(): void;
    getDrawText(): UI512IsDrawTextInterface;
    getDrawIcon(): UI512IsDrawIconInterface;
    getSession(): O<UI512IsSessionInterface>;
    setSession(session: O<UI512IsSessionInterface>): void;
    getBrowserInfo(): BrowserOSInfo;
    setTimerRate(s: string): void;
    sendEvent(evt: UI512IsEventInterface): void;
    replaceCurrentPresenter(pr: O<UI512IsPresenterInterface>): void;
    runTests(all: boolean): void;
}

/**
 * get top-level object
 */
let rootHolder: Root[] = [];
export function getRoot(): Root {
    checkThrowUI512(rootHolder[0], 'J6|root not yet set.');
    return rootHolder[0];
}

/**
 * set top-level object
 */
export function setRoot(r: Root) {
    rootHolder[0] = r;
}

/**
 * can be used to build a periodic timer.
 */
export class RepeatingManualTimer {
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

/**
 * just a flag indicating that the operation is complete.
 */
export class RenderComplete {
    complete = true;
    and(other: RenderComplete) {
        this.complete = this.complete && other.complete;
    }

    andB(other: boolean) {
        this.complete = this.complete && other;
    }
}

/**
 * can be used to build a periodic timer.
 */
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

/**
 * CharClassify
 *
 * Permission to use, copy, modify, and distribute this software and its
 * documentation for all purposes and without fee is hereby granted,
 * provided that the above copyright notice appear in all copies and that
 * both that copyright notice and this permission notice appear in
 * supporting documentation.
 * Copyright 1998-2003 by Neil Hodgson <neilh@scintilla.org>
 * Ported from C++ to TypeScript by Ben Fisher, 2017
 */
export enum CharClass {
    __isUI512Enum = 1,
    Space,
    NewLine,
    Word,
    Punctuation
}

/**
 * Porting SciTE's logic for typing move-to-next-word and move-to-prev-word.
 */
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

    /**
     * classify a character as word or whitespace
     */
    static get(c: number) {
        if (c === GetCharClass.cr || c === GetCharClass.nl) {
            return CharClass.NewLine;
        } else if (
            c < 0x20 ||
            c === GetCharClass.space ||
            c === GetCharClass.nonbreakingspace
        ) {
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
            /* let's choose to treat all unicode non-ascii as word. */
            return CharClass.Word;
        }
    }

    /**
     * move left or right in the text editor...
     * charCodeAt gets the character code at an index in the string
     * len is the length of the string
     * n is current index (caret position) in the string
     * isLeft is true if moving left, false if moving right
     * isUntilWord means to keep moving until word boundary is seen.
     * returns the next caret position.
     */
    static getLeftRight(
        charCodeAt: (pos: number) => number,
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
                while (n > 0 && GetCharClass.get(charCodeAt(n - 1)) === CharClass.Space) {
                    n--;
                }
            }

            if (n > 0) {
                let classStart = GetCharClass.get(charCodeAt(n - 1));
                while (n > 0 && GetCharClass.get(charCodeAt(n - 1)) === classStart) {
                    n--;
                }
            }
        } else if (isUntilWord && !isLeft) {
            if (n === len) {
                n -= 1;
            }

            let classStart = GetCharClass.get(charCodeAt(n));
            while (n < len && GetCharClass.get(charCodeAt(n)) === classStart) {
                n++;
            }

            if (includeTrailingSpace) {
                while (n < len && GetCharClass.get(charCodeAt(n)) === CharClass.Space) {
                    n++;
                }
            }
        } else {
            n += isLeft ? -1 : 1;
        }

        return fitIntoInclusive(n, 0, len);
    }
}
