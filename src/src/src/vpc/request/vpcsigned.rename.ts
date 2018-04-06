
/* auto */ import { O, assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEq } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ExpTextEncoder } from '../../vpc/request/bridgetextencoding.js';

export function getUnixTimeSeconds() {
    let d = new Date();
    return Math.round(d.getTime() / 1000);
}

function processErrFromBase64(s: string) {
    let spl = s.split(/~/g);
    let got = s;
    if (spl.length >= 2) {
        let gotbase64 = spl[1];
        got = atob(gotbase64);
    }

    return got.replace(/</g, '').replace(/>/g, '');
}

export function makeNonce() {
    return Util512.makeCryptRandString(8);
}

// https://gist.github.com/chrisveness/770ee96945ec12ac84f134bf538d89fb
export async function pbkdf2(
    password: string,
    iterations?: number,
    saltB64?: string
): Promise<[number, ArrayBuffer, string, string]> {
    if (location.protocol !== 'https:' && location.href.indexOf('vipercard') !== -1) {
        throw new Error('Requires https, not http connection');
    }

    if (!iterations) {
        iterations = 1e6;
    }
    assertTrue(iterations >= 1e6, '');

    let saltUint8 = new Uint8Array(16);
    if (saltB64) {
        let decoded = atob(saltB64);
        assertEq(saltUint8.length, decoded.length, '');
        for (let i = 0; i < saltUint8.length; i++) {
            saltUint8[i] = decoded.charCodeAt(i);
        }
    } else {
        saltUint8 = crypto.getRandomValues(new Uint8Array(16)); // get random salt
    }

    const pwUtf8 = new ExpTextEncoder('utf-8').encode(password); // encode pw as UTF-8

    // tslint:disable-next-line:await-promise
    const pwKey = await window.crypto.subtle.importKey('raw', pwUtf8, 'PBKDF2', false, ['deriveBits']); // create pw key

    const params = { name: 'PBKDF2', hash: 'SHA-256', salt: saltUint8, iterations: iterations }; // pbkdf2 params

    // tslint:disable-next-line:await-promise
    const keyBuffer = await window.crypto.subtle.deriveBits(params, pwKey, 256); // derive key
    const keyBufferAr = new Uint8Array(keyBuffer);
    return [iterations, keyBuffer, Util512.arrayToBase64(saltUint8), Util512.arrayToBase64(keyBufferAr)];
}

export async function sendWebRequestGetJson(
    url: string,
    verb: string,
    params: O<{ [key: string]: string }>
): Promise<any> {
    let ret: any = {};
    let [ncode, sresponse] = await sendWebRequestImpl(url, verb, params);
    if (ncode === 200) {
        ret = JSON.parse(sresponse);
    } else if (ncode === 404 && (scontains(sresponse, 'Cannot GET') || scontains(sresponse, 'Cannot POST'))) {
        throw new Error('not connected (404)');
    } else {
        let processed = processErrFromBase64(sresponse);
        processed += ` (${ncode})`;
        throw new Error(processed);
    }

    return ret;
}

function sendWebRequestImpl(
    url: string,
    verb: string,
    params: O<{ [key: string]: string }>
): Promise<[number, string]> {
    return new Promise<[number, string]>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
            resolve([xhr.status, xhr.responseText]);
        });
        xhr.addEventListener('error', () => {
            resolve([xhr.status, xhr.responseText]);
        });

        let sParams = '';
        if (params) {
            sParams = Util512.getMapKeys(params)
                .map(k => k + '=' + encodeURIComponent(params[k]))
                .join('&');
        }

        if (verb === 'GET') {
            url += '?' + sParams;
        }

        xhr.open(verb, url, true /*async=true*/);
        xhr.timeout = 1000 * 10; // 10 seconds
        if (verb === 'POST') {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        } else if (verb === 'GET') {
        } else {
            reject(new Error('unknown verb'));
        }

        xhr.send(verb === 'POST' ? sParams : null);
    });
}

async function getHmacSignature(msg: string, keyBuffer: ArrayBuffer) {
    if (location.protocol !== 'https:' && location.href.indexOf('vipercard') !== -1) {
        throw new Error('Requires https, not http connection');
    }

    let enc = new ExpTextEncoder('utf-8');
    let msgAsUtf8 = enc.encode(msg);

    // tslint:disable-next-line:await-promise
    let keyObject = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
            name: 'HMAC',
            hash: { name: 'SHA-256' },
        },
        false, // use_for_export = false
        ['sign', 'verify']
    );

    // tslint:disable-next-line:await-promise
    let signature = await window.crypto.subtle.sign('HMAC', keyObject, msgAsUtf8);
    let buf = new Uint8Array(signature);
    return Util512.arrayToBase64(buf);
}

export async function sendSignedRequestJson(
    url: string,
    verb: string,
    params: { [key: string]: string },
    keyBuffer: ArrayBuffer,
    overrideSig?: string
) {
    // part 1: get signature
    let mapKeys = Util512.getMapKeys(params).filter(k => k !== 'simulateCurrentServerTime' && k !== 'simulateRemoteIp');
    mapKeys.sort();
    let msg = mapKeys.map(k => k + '~' + params[k]).join('~');
    let signature = await getHmacSignature(msg, keyBuffer);

    // part 2: send the request
    let paramsToSend = Util512.shallowClone(params);
    paramsToSend['sig'] = overrideSig ? overrideSig : signature;
    let response = await sendWebRequestGetJson(url, verb, paramsToSend);
    return response;
}
