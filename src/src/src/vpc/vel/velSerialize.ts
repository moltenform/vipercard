
/* auto */ import { assertTrue, assertTrueWarn } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { isString } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { ElementObserverNoOp, ElementObserverVal, UI512Gettable, UI512Settable } from '../../ui512/elements/ui512ElementsGettable.js';

export class VpcUI512Serialization {
    static serializeUiGettable(vel: UI512Gettable, attrlist: string[]) {
        let ret: { [key: string]: ElementObserverVal } = {};
        for (let attrname of attrlist) {
            let v = (vel as any)['_' + attrname];
            assertTrueWarn(v !== undefined, attrname);
            if (attrname === UI512Settable.formattedTextField) {
                let vAsText = v as FormattedText;
                assertTrue(vAsText && vAsText.isFormattedText, 'invalid ftxt');
                ret[attrname] = vAsText.toPersisted();
            } else {
                ret[attrname] = v;
            }
        }

        return ret;
    }

    static deserializeUiSettable(vel: UI512Settable, attrlist: string[], vals: any) {
        let svdObserver = vel.observer;
        try {
            vel.observer = new ElementObserverNoOp();
            for (let attrname of attrlist) {
                let v = vals[attrname];
                if (v !== null && v !== undefined) {
                    if (attrname === UI512Settable.formattedTextField) {
                        if (isString(v)) {
                            let vAsText = FormattedText.newFromPersisted(v);
                            vel.setftxt(vAsText);
                        } else {
                            assertTrue(v instanceof FormattedText, 'not a string or FormattedText');
                            vel.setftxt(v as FormattedText);
                        }
                    } else {
                        vel.set(attrname, v);
                    }
                } else {
                    assertTrueWarn(false, 'missing or null attr', attrname);
                }
            }
        } finally {
            vel.observer = svdObserver;
        }
    }

    static copyAttrsOver(getter: UI512Gettable, setter: UI512Settable, attrlist: string[]) {
        for (let attrname of attrlist) {
            let v = (getter as any)['_' + attrname];
            if (v !== null && v !== undefined) {
                if (attrname === UI512Settable.formattedTextField) {
                    if (isString(v)) {
                        let vAsText = FormattedText.newFromPersisted(v);
                        setter.setftxt(vAsText);
                    } else {
                        assertTrue(v instanceof FormattedText, 'not a string or FormattedText');
                        setter.setftxt(v as FormattedText);
                    }
                } else {
                    setter.set(attrname, v);
                }
            } else {
                assertTrueWarn(false, 'missing or null attr', attrname);
            }
        }
    }
}
