
/* auto */ import { assertTrue, assertTrueWarn, bool, checkThrow, makeVpcInternalErr } from './../../ui512/utils/util512Assert';
/* auto */ import { AnyJson, Util512, isString } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/draw/ui512FormattedText';
/* auto */ import { ElementObserverNoOp, ElementObserverVal, UI512Gettable, UI512Settable } from './../../ui512/elements/ui512ElementGettable';
/* auto */ import { specialCharNumFontChange, specialCharNumNewline, specialCharNumTab } from './../../ui512/draw/ui512DrawTextClasses';
/* auto */ import { bridgedBase64Js } from './../../bridge/bridgeBase64Js';

/**
 * serialization of VPC objects, preparing them for JSON.serialize
 */
export class VpcGettableSerialization {
    /**
     * serialize a Gettable to a JS object
     */
    static serializeGettable(vel: UI512Gettable) {
        let ret: { [key: string]: ElementObserverVal } = {};
        let keys = Util512.getMapKeys(vel as any);
        for (let i = 0, len = keys.length; i < len; i++) {
            let propName = keys[i];
            if (propName.startsWith('_') && propName[1] !== '_') {
                propName = propName.slice(1);
                let v = vel.getGeneric(propName);
                assertTrueWarn(v !== undefined, propName, 'J||');
                if (v instanceof FormattedText) {
                    assertTrueWarn(
                        VpcGettableSerialization.propNameExpectFormattedText(propName),
                        'expected ftxt, got ',
                        propName
                    );
                    assertTrue(v instanceof FormattedText, 'J{|invalid ftxt');
                    ret[propName] = v.toSerialized();
                } else {
                    ret[propName] = VpcGettableSerialization.serializePlain(v);
                }
            }
        }

        return ret;
    }

    /**
     * deserialize a JS object to a Settable
     */
    static deserializeSettable(vel: UI512Settable, vals: AnyJson) {
        let savedObserver = vel.observer;
        try {
            vel.observer = new ElementObserverNoOp();

            let expectToSee = Util512.getMapKeys(vel as any);
            let whichWereSet: { [key: string]: boolean } = {};
            let keys = Util512.getMapKeys(vals as any);
            for (let i = 0, len = keys.length; i < len; i++) {
                let propName = keys[i];
                whichWereSet[propName] = true;
                let v = vals[propName];
                if (VpcGettableSerialization.propNameExpectFormattedText(propName)) {
                    if (isString(v)) {
                        let vAsText = FormattedText.newFromSerialized(v);
                        VpcGettableSerialization.setAnyAndSendChangeNotification(vel, propName, vAsText);
                    } else {
                        assertTrue(v instanceof FormattedText, 'J`|not a string or FormattedText');
                        VpcGettableSerialization.setAnyAndSendChangeNotification(vel, propName, v);
                    }
                } else {
                    let decoded = VpcGettableSerialization.deserializePlain(v);
                    VpcGettableSerialization.setAnyAndSendChangeNotification(vel, propName, decoded);
                }
            }

            /* send an alert if the saved file didn't have a property.
            ok to have seen extra ones, though, could have come from card-specific */
            for (let prp of expectToSee) {
                let prpSliced = prp.slice(1);
                if (
                    !whichWereSet[prpSliced] &&
                    prp.startsWith('_') &&
                    prp[1] !== '_' &&
                    !VpcGettableSerialization.okNotToSee[prpSliced]
                ) {
                    throw makeVpcInternalErr(`in obj ${vel.id} did not see ${prpSliced}`);
                }
            }
        } finally {
            vel.observer = savedObserver;
        }
    }

    protected static okNotToSee: { [key: string]: boolean } = {
        sharedtext: true,
        sharedhilite: true
    };

    /**
     * set a property, and set to 2 different values to ensure that the 'change' event is sent
     */
    protected static setAnyAndSendChangeNotification(vel: UI512Settable, propName: string, v: ElementObserverVal) {
        if (typeof v === 'boolean') {
            (vel as any)['_' + propName] = false;
            vel.set(propName, !v);
            vel.set(propName, v);
        } else if (typeof v === 'number') {
            (vel as any)['_' + propName] = 0;
            vel.set(propName, v === 0 ? 1 : 0);
            vel.set(propName, v);
        } else if (isString(v)) {
            (vel as any)['_' + propName] = '';
            vel.set(propName, v.length === 0 ? ' ' : '');
            vel.set(propName, v);
        } else if (v instanceof FormattedText) {
            (vel as any)['_' + propName] = new FormattedText();
            vel.set(propName, new FormattedText());
            vel.set(propName, v);
        } else {
            assertTrueWarn(false, 'unknown data type for ' + v);
        }
    }

    /**
     * do we expect the type of this property to be a formattedtext
     */
    protected static propNameExpectFormattedText(propName: string) {
        return bool(propName === UI512Settable.fmtTxtVarName) || bool(propName.startsWith(UI512Settable.fmtTxtVarName + '_'));
    }

    /**
     * copy over the prop values of one object onto another object
     */
    static copyPropsOver(getter: UI512Gettable, setter: UI512Settable) {
        checkThrow(false, 'nyi -- use serialization instead');
    }

    /**
     * use base64 if the string contains nonprintable or nonascii chars
     */
    static serializePlain(v: ElementObserverVal): ElementObserverVal {
        if (isString(v) && VpcGettableSerialization.containsNonSimpleAscii(v.toString())) {
            return 'b64``' + VpcGettableSerialization.jsBinaryStringToUtf16Base64(v.toString());
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
            return VpcGettableSerialization.Base64Utf16ToJsBinaryString(s.substr('b64``'.length));
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
        let bytes: Uint8Array = new Uint8Array(str.length * 2);
        for (let i = 0, len = str.length; i < len; i++) {
            let n = str.charCodeAt(i) | 0;
            bytes[i * 2] = n % 256;
            bytes[i * 2 + 1] = n >> 8;
        }

        return bridgedBase64Js.fromByteArray(bytes);
    }

    /**
     * decode a string encoded by jsBinaryStringToUtf16Base64
     */
    static Base64Utf16ToJsBinaryString(str: string) {
        let bytes = bridgedBase64Js.toByteArray(str);
        let s = '';
        for (let i = 0, len = bytes.length; i < len; i += 2) {
            let n = bytes[i] + (bytes[i + 1] << 8);
            s += String.fromCharCode(n);
        }

        return s;
    }
}
