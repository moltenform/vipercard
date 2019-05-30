
/* auto */ import { O, assertTrue, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, anyJson, assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { ExpTextEncoder } from '../../vpc/request/bridgeTextEncoding.js';

/**
 * send a request signed with hmac, and return json response
 */
export async function sendSignedRequestJson(
    url: string,
    verb: string,
    params: { [key: string]: string },
    keyBuffer: ArrayBuffer,
    overrideSig?: string
) {
    /* part 1: get signature */
    let mapKeys = Util512.getMapKeys(params).filter(k => k !== 'simulateCurrentServerTime' && k !== 'simulateRemoteIp');
    mapKeys.sort();
    let msg = mapKeys.map(k => k + '~' + params[k]).join('~');
    let signature = await getHmacSignature(msg, keyBuffer);

    /* part 2: send the request */
    let paramsToSend = Util512.shallowClone(params);
    paramsToSend['sig'] = overrideSig ? overrideSig : signature;
    let response = await vpcSendRequestForJson(url, verb, paramsToSend);
    return response;
}

/**
 * send a web request and return the parsed JSON,
 * throws a user-readable exception upon error.
 */
export async function vpcSendRequestForJson(
    url: string,
    verb: string,
    params: O<{ [key: string]: string }>
): Promise<anyJson> {
    let ret: anyJson = {};
    let [statusCode, response] = await webRequestImpl(url, verb, params);
    if (statusCode === 200) {
        ret = JSON.parse(response);
    } else if (statusCode === 404) {
        throw new Error('not connected (404)');
    } else {
        let processed = processErrFromBase64(response);
        processed += ` (${statusCode})`;
        throw new Error(processed);
    }

    return ret;
}

/**
 * web request implementation
 * returns tuple [statusCode, response]
 */
function webRequestImpl(url: string, verb: string, params: O<{ [key: string]: string }>): Promise<[number, string]> {
    return new Promise<[number, string]>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.addEventListener('load', () => {
            resolve([xhr.status || 0, xhr.responseText || '']);
        });

        xhr.addEventListener('error', () => {
            resolve([xhr.status || 0, xhr.responseText || '']);
        });

        if (verb === 'GET') {
            url += '?' + joinParams(params);
        }

        xhr.open(verb, url, true /* async=true */);
        xhr.timeout = 1000 * 10; /* 10 seconds */
        if (verb === 'POST') {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        } else if (verb !== 'GET') {
            reject(new Error('unknown verb'));
        }

        xhr.send(verb === 'POST' ? joinParams(params) : null);
    });
}

/**
 * join parameters from {a:1, b:2} to a=1&b=2
 */
export function joinParams(params: O<{ [key: string]: string }>) {
    let joinedParams = '';
    if (params) {
        joinedParams = Util512.getMapKeys(params)
            .map(k => k + '=' + encodeURIComponent(params[k]))
            .join('&');
    }

    return joinedParams;
}

/**
 * get an hmac signature for this string of params
 */
async function getHmacSignature(msg: string, keyBuffer: ArrayBuffer) {
    if (location.protocol !== 'https:' && location.href.indexOf('vipercard') !== -1) {
        throw new Error('Requires https, not http connection');
    }

    let enc = new ExpTextEncoder('utf-8');
    let msgAsUtf8 = enc.encode(msg);

    /* go from ArrayBuffer to key object */
    /* tslint:disable-next-line:await-promise */
    let keyObject = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
            name: 'HMAC',
            hash: { name: 'SHA-256' }
        },
        false /* useForExport */,
        ['sign', 'verify']
    );

    /* tslint:disable-next-line:await-promise */
    let signature = await window.crypto.subtle.sign('HMAC', keyObject, msgAsUtf8);
    let buf = new Uint8Array(signature);
    return Util512.arrayToBase64(buf);
}

/**
 * get unix time in seconds
 */
export function getUnixTimeSeconds() {
    let d = new Date();
    return Math.round(d.getTime() / 1000);
}

/**
 * add random bytes to the message, to make it difficult for a request to be replayed
 */
export function makeNonce() {
    return Util512.makeCryptRandString(8);
}

/**
 * deserialize an error message from the server, which returns errors in base64
 */
function processErrFromBase64(s: string) {
    let spl = s.split(/~/g);
    let got = s;
    if (spl.length >= 2) {
        let asBase64 = spl[1];
        got = atob(asBase64);
    }

    return got.replace(/</g, '').replace(/>/g, '');
}

/**
 * pbkdf2, gist by Chris Veness
 * takes a user-typed password, and uses a salt to generate a ArrayBuffer key.
 *
 * returns tuple [iterations, key, keyBase64, saltBase64]
 * note: since this computation is on the client, a malicious user could bypass this function
 * and use their choice of password. however, I don't see any dangerous consequence
 * if a user can change the client JS to make an account with a weak password.
 */
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

    assertTrue(iterations >= 1e6, 'Jr|not enough iterations');
    let saltUint8 = new Uint8Array(16);
    if (saltB64) {
        let decoded = atob(saltB64);
        assertEq(saltUint8.length, decoded.length, 'Jq|');
        for (let i = 0; i < saltUint8.length; i++) {
            saltUint8[i] = decoded.charCodeAt(i);
        }
    } else {
        /* get random salt */
        let saltOrNull = crypto.getRandomValues(new Uint8Array(16));
        checkThrow(saltOrNull, 'Jp|getRandomValues returned null');
        saltUint8 = saltOrNull as Uint8Array;
    }

    /* encode pw as UTF-8 */
    const pwUtf8 = new ExpTextEncoder('utf-8').encode(password);

    /* create pw key */
    /* tslint:disable-next-line:await-promise */
    const pwKey = await window.crypto.subtle.importKey('raw', pwUtf8, 'PBKDF2', false, ['deriveBits']);

    /* pbkdf2 params */
    const params = { name: 'PBKDF2', hash: 'SHA-256', salt: saltUint8, iterations: iterations };

    /* derive key */
    /* tslint:disable-next-line:await-promise */
    const keyBuffer = await window.crypto.subtle.deriveBits(params, pwKey, 256);
    const keyBufferAr = new Uint8Array(keyBuffer);
    return [iterations, keyBuffer, Util512.arrayToBase64(keyBufferAr), Util512.arrayToBase64(saltUint8)];
}
