
/* auto */ import { assertTrue, assertTrueWarn } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { isString } from '../../ui512/utils/utils512.js';
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
            let v = vel.get_generic(propName);
            assertTrueWarn(v !== undefined, propName);
            if (propName === UI512Settable.formattedTextField) {
                let vAsText = v as FormattedText;
                assertTrue(vAsText && vAsText.isFormattedText, 'invalid ftxt');
                ret[propName] = vAsText.toSerialized();
            } else {
                ret[propName] = v;
            }
        }

        return ret;
    }

    /**
     * deserialize a JS object to a UI512Settable
     */
    static deserializeSettable(vel: UI512Settable, propList: string[], vals: any) {
        let savedObserver = vel.observer;
        try {
            vel.observer = new ElementObserverNoOp();
            for (let propName of propList) {
                let v = vals[propName];
                if (v !== null && v !== undefined) {
                    if (propName === UI512Settable.formattedTextField) {
                        if (isString(v)) {
                            let vAsText = FormattedText.newFromSerialized(v);
                            vel.setftxt(vAsText);
                        } else {
                            assertTrue(v instanceof FormattedText, 'not a string or FormattedText');
                            vel.setftxt(v as FormattedText);
                        }
                    } else {
                        vel.set(propName, v);
                    }
                } else {
                    assertTrueWarn(false, 'missing or null attr', propName);
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
        for (let propName of propList) {
            let v = getter.get_generic(propName);
            if (v !== null && v !== undefined) {
                if (propName === UI512Settable.formattedTextField) {
                    if (isString(v)) {
                        let vAsText = FormattedText.newFromSerialized(v as string);
                        setter.setftxt(vAsText);
                    } else {
                        assertTrue(v instanceof FormattedText, 'not a string or FormattedText');
                        setter.setftxt(v as FormattedText);
                    }
                } else {
                    setter.set(propName, v);
                }
            } else {
                assertTrueWarn(false, 'missing or null attr', propName);
            }
        }
    }
}
