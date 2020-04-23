
/* auto */ import { checkThrow512 } from './util512Assert';
/* auto */ import { NoParameterCtor, Util512 } from './util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * serialize and deserialize simple structures.
 *
 * use optional_ to indicate an optional field.
 * fields beginning with "__" will be skipped.
 * unknown incoming fields are skipped silently.
 */
export namespace Util512SerializableHelpers {
    /**
     * serialize a typescript object to a plain json map of strings to strings
     */
    export function serializeObj<T extends IsUtil512Serializable>(obj: T) {
        checkThrow512(obj.__isUtil512Serializable, 'Rg|must be a isUtil512Serializable');
        let objToSend: { [key: string]: unknown } = {};
        for (let prop in obj) {
            if (shouldSerializeProperty(obj, prop)) {
                let isOpt = prop.startsWith('optional_');
                if (isOpt) {
                    checkThrow512(
                        obj[prop] === undefined ||
                            obj[prop] === null ||
                            typeof obj[prop] === 'string',
                        'Rf|we currently only support strings'
                    );
                    let propDest = prop.slice('optional_'.length);
                    if (typeof obj[prop] === 'string') {
                        objToSend[propDest] = obj[prop];
                    }
                } else {
                    checkThrow512(
                        typeof obj[prop] === 'string',
                        'Re|we currently only support strings'
                    );
                    objToSend[prop] = obj[prop];
                }
            }
        }

        return objToSend;
    }

    /**
     * helper that calls stringify for you
     */
    export function serializeToJson<T extends IsUtil512Serializable>(obj: T) {
        return JSON.stringify(serializeObj(obj));
    }

    /**
     * goes from a plain json map of string-of-strings
     * to instance of a typescript class
     */
    export function deserializeObj<T extends IsUtil512Serializable>(
        ctor: NoParameterCtor<T>,
        incoming: IsUtil512Serializable
    ): T {
        let objNew = new ctor();
        checkThrow512(
            objNew.__isUtil512Serializable,
            'Rd|must be a isUtil512Serializable'
        );
        let prop = '';
        for (prop in objNew) {
            if (shouldSerializeProperty(objNew, prop)) {
                let isOpt = prop.startsWith('optional_');
                if (isOpt) {
                    checkThrow512(
                        objNew[prop] === undefined ||
                            objNew[prop] === null ||
                            typeof objNew[prop] === 'string',
                        'Rc|we currently only support strings'
                    );
                    let propSrc = prop.slice('optional_'.length);
                    checkThrow512(
                        typeof incoming[propSrc] === 'string' ||
                            incoming[propSrc] === null ||
                            incoming[propSrc] === undefined,
                        `Rb|field ${prop} is not a string`
                    );
                    objNew[prop] =
                        incoming[propSrc] === null ? undefined : incoming[propSrc];
                } else {
                    checkThrow512(
                        typeof objNew[prop] === 'string',
                        'Ra|we currently only support strings'
                    );
                    checkThrow512(
                        incoming[prop] !== undefined,
                        `RZ|did not see required field ${prop}`
                    );
                    checkThrow512(
                        typeof incoming[prop] === 'string',
                        `RY|field ${prop} not a string, only support strings`
                    );
                    objNew[prop] = incoming[prop];
                }
            }
        }

        return objNew;
    }

    /**
     * helper that cals json parse for you
     */
    export function deserializeFromJson<T extends IsUtil512Serializable>(
        ctor: NoParameterCtor<T>,
        s: string
    ): T {
        return deserializeObj(ctor, JSON.parse(s));
    }

    /**
     * is this something like toString() that's everywhere?
     * another approach is checking hasOwnProperty,
     * but we do want to see parent classes
     */
    export function isAPropertyOnAllObjects(prop: string) {
        return prop in new Object();
    }

    /**
     * we'll skip methods, Object properties, and props starting with __
     */
    export function shouldSerializeProperty(obj: { [key: string]: any }, prop: string) {
        return (
            !isAPropertyOnAllObjects(prop) &&
            !prop.startsWith('__') &&
            typeof obj[prop] !== 'function'
        );
    }
}

/**
 * essentially just a signal that this class can be serialized
 */
export abstract class IsUtil512Serializable {
    __isUtil512Serializable = true;

    /**
     * get a shallow clone of the object
     */
    static getClone<T extends object>(me: IsUtil512Serializable): T {
        return Util512.shallowClone(me);
    }

    /**
     * get only the keys that should be serialized
     */
    static getKeys(me: IsUtil512Serializable) {
        return Util512.getMapKeys(me).filter(k =>
            Util512SerializableHelpers.shouldSerializeProperty(me, k)
        );
    }
}
