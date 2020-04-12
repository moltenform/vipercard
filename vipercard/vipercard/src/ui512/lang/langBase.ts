
/* auto */ import { assertTrue } from './../utils/util512AssertCustom';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

const lngPrefix = 'lng';
const lngPrefixLength = 'lng'.length;

/**
 * for future internationalization + globalization
 * */
export function lng(s: string) {
    if (!s.length) {
        return s;
    }

    assertTrue(s.startsWith(lngPrefix), '0C|must start with prefix', lngPrefix);
    let ret = s.substr(lngPrefixLength);
    return ret;
}
