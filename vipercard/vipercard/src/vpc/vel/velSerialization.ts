
/* auto */ import { assertTrue, assertTrueWarn, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { anyJson, isString } from '../../ui512/utils/utils512.js';
/* auto */ import { specialCharNumFontChange, specialCharNumNewline, specialCharNumTab } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { ElementObserverNoOp, ElementObserverVal, UI512Gettable, UI512Settable } from '../../ui512/elements/ui512ElementGettable.js';

/**
 * serialization of VPC objects, preparing them for JSON.serialize
 */
export class VpcUI512Serialization {
    /**
     * serialize a UI512Gettable to a JS object
     */
    static serializeGettable(vel: UI512Gettable, propList: string[]) {
        let ret: { [key: string]: ElementObserverVal } = {};
        for (let propName of propList) {
            let v = vel.getGeneric(propName);
            assertTrueWarn(v !== undefined, propName, 'J||');
            if (propName === UI512Settable.fmtTxtVarName) {
                let vAsText = v as FormattedText;
                assertTrue(vAsText && vAsText.isFormattedText, 'J{|invalid ftxt');
                ret[propName] = vAsText.toSerialized();
            } else {
                ret[propName] = VpcUI512Serialization.serializePlain(v);
            }
        }

        return ret;
    }

    /**
     * deserialize a JS object to a UI512Settable
     */
    static deserializeSettable(vel: UI512Settable, propList: string[], vals: anyJson) {
        let savedObserver = vel.observer;
        try {
            vel.observer = new ElementObserverNoOp();
            for (let propName of propList) {
                let v = vals[propName];
                if (v !== null && v !== undefined) {
                    assertTrueWarn(false, 'nyi')
                    /*if (propName === UI512Settable.fmtTxtVarName) {
                        if (isString(v)) {
                            let vAsText = FormattedText.newFromSerialized(v);
                            vel.setFmTxt(vAsText);
                        } else {
                            assertTrue(v instanceof FormattedText, 'J`|not a string or FormattedText');
                            vel.setFmTxt(v as FormattedText);
                        }
                    } else {
                        vel.set(propName, VpcUI512Serialization.deserializePlain(v));
                    }*/
                } else {
                    assertTrueWarn(false, 'J_|missing or null attr', propName);
                }
            }
        } finally {
            vel.observer = savedObserver;
        }
    }

    /**
     * copy over the prop values of one object onto another object
     */
    static copyPropsOver(getter: UI512Gettable, setter: UI512Settable, propList: string[]) {
        checkThrow(false, 'nyi -- delete this and serialize it instead')
    }

    /**
     * use base64 if the string contains nonprintable or nonascii chars
     */
    static serializePlain(v: ElementObserverVal): ElementObserverVal {
        if (isString(v) && VpcUI512Serialization.containsNonSimpleAscii(v.toString())) {
            return 'b64``' + VpcUI512Serialization.jsBinaryStringToUtf16Base64(v.toString());
        } else {
            return v;
        }
    }

    /**
     * decode a string encoded by serializePlain
     */
    static deserializePlain(v: ElementObserverVal): ElementObserverVal {
        if (isString(v) && v.toString().startsWith('b64``')) {
            let s = v.toString();
            return VpcUI512Serialization.Base64Utf16ToJsBinaryString(s.substr('b64``'.length));
        } else {
            return v;
        }
    }

    /**
     * does the string contain nonprintable or nonascii chars?
     */
    static containsNonSimpleAscii(s: string) {
        for (let i = 0, len = s.length; i < len; i++) {
            let c = s.charCodeAt(i);
            if (
                (c < 32 && c !== specialCharNumTab && c !== specialCharNumNewline && c !== specialCharNumFontChange) ||
                c >= 128
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * to base64
     * btoa does not support unicode characters and so we must use
     * an intermediate step.
     *
     * use utf16le instead of utf8 because it was measured to be 40% more
     * space-efficient for dense unicode data like this.
     */
    static jsBinaryStringToUtf16Base64(str: string) {
        let bytes: number[] = [];
        for (let i = 0, len = str.length; i < len; i++) {
            let n = str.charCodeAt(i) | 0;
            bytes.push(n % 256);
            bytes.push(n >> 8);
        }

        return base64js.fromByteArray(bytes);
    }

    /**
     * decode a string encoded by jsBinaryStringToUtf16Base64
     */
    static Base64Utf16ToJsBinaryString(str: string) {
        let bytes = base64js.toByteArray(str);
        let s = '';
        for (let i = 0, len = bytes.length; i < len; i += 2) {
            let n = bytes[i] + (bytes[i + 1] << 8);
            s += String.fromCharCode(n);
        }

        return s;
    }
}

/* the 3rd party base64js library */
declare var base64js: any;
