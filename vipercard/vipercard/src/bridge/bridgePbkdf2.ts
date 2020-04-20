
/* auto */ import { assertTrue, checkThrow512 } from './../ui512/utils/util512Assert';
/* auto */ import { Util512, assertEq } from './../ui512/utils/util512';
/* auto */ import { ExpTextEncoder } from './bridgeTextEncoding';

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
    if (location.protocol !== 'https:' && location.href.includes('vipercard')) {
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
        checkThrow512(saltOrNull, 'Jp|getRandomValues returned null');
        saltUint8 = saltOrNull;
    }

    /* encode pw as UTF-8 */
    const pwUtf8 = new ExpTextEncoder('utf-8').encode(password);

    /* create pw key */
    const pwKey = await window.crypto.subtle.importKey('raw', pwUtf8, 'PBKDF2', false, [
        'deriveBits'
    ]);

    /* pbkdf2 params */
    const params = {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: saltUint8,
        iterations: iterations
    };

    /* derive key */
    const keyBuffer = await window.crypto.subtle.deriveBits(params, pwKey, 256);
    const keyBufferAr = new Uint8Array(keyBuffer);
    return [
        iterations,
        keyBuffer,
        Util512.arrayToBase64(keyBufferAr),
        Util512.arrayToBase64(saltUint8)
    ];
}
