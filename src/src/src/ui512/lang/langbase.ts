
/* auto */ import { assertTrue, cProductName } from '../../ui512/utils/utilsAssert.js';

export interface UI512Lang {
    translate(s: string): string;
}

export class UI512LangNull implements UI512Lang {
    translate(s: string) {
        if (s.length === 0) {
            return s;
        }

        assertTrue(s.startsWith('lng'), '0C|not starts with lng');
        let ret = s.substr('lng'.length);
        ret = ret.replace(/%cProductName/g, cProductName);
        return ret;
    }
}
