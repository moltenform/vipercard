
/* auto */ import { checkThrowUI512 } from './util512Assert';
/* auto */ import { AnyJson, NoParameterCtor, Util512, isString } from './util512';

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
    
    export function serializeObj<T extends IsUtil512Serializable>(obj:T) {
        checkThrowUI512(obj.__isUtil512Serializable, 'must be a isUtil512Serializable')
        let objToSend: { [key: string]: unknown } = {}
        for (let prop in obj) {
            if (
                shouldSerializeProperty(obj, prop)
            ) {
                let isOpt = prop.startsWith('optional_')
                if (isOpt) {
                    checkThrowUI512(obj[prop] === undefined || obj[prop] === null || isString(obj[prop]), "we currently only support strings")
                    let propDest = prop.slice('optional_'.length)
                    if (isString(obj[prop])) {
                        objToSend[propDest] = obj[prop]
                    }
                } else {
                    checkThrowUI512(isString(obj[prop]), "we currently only support strings")
                    objToSend[prop] = obj[prop]
                }
            }
        }
        
        return objToSend
    }

    export function serializeToJson<T extends IsUtil512Serializable>(obj:T) {
        return JSON.stringify(serializeObj(obj))
    }

    export function deserializeObj<T extends IsUtil512Serializable>(ctor: NoParameterCtor<T>, incoming:AnyJson):T {
        let objNew = new ctor()
        checkThrowUI512(objNew.__isUtil512Serializable, 'must be a isUtil512Serializable')
        let prop = ''
        for (prop in objNew) {
            if (
                shouldSerializeProperty(objNew, prop)
            ) {
                let isOpt = prop.startsWith('optional_')
                if (isOpt) {
                    checkThrowUI512(objNew[prop] === undefined || objNew[prop] === null || isString(objNew[prop]), "we currently only support strings")
                    let propSrc = prop.slice('optional_'.length)
                    checkThrowUI512(isString(incoming[propSrc]) || incoming[propSrc]===null || incoming[propSrc]===undefined, `field ${prop} is not a string`);
                    objNew[prop] = incoming[propSrc]===null ? undefined : incoming[propSrc]
                } else {
                    checkThrowUI512(isString(objNew[prop]), "we currently only support strings")
                    checkThrowUI512(incoming[prop] !== undefined, `did not see required field ${prop}`)
                    checkThrowUI512(isString(incoming[prop]), `field ${prop} not a string, only support strings`);
                    objNew[prop] = incoming[prop]
                }
            }
        }

        return objNew
    }

    export function deserializeFromJson<T extends IsUtil512Serializable>(ctor: NoParameterCtor<T>, s:string):T {
        return deserializeObj(ctor, JSON.parse(s))
    }

    export function isAPropertyOnAllObjects(prop:string) {
        /* don't use hasOwnProperty because we might want to use inheritance */
        return prop in new Object()
    }

    export function shouldSerializeProperty(obj:any, prop:string) {
        return !isAPropertyOnAllObjects(prop) && !prop.startsWith('__') && typeof obj[prop] !== 'function'
    }
}

export abstract class IsUtil512Serializable {
    __isUtil512Serializable = true
    getClone<T extends object>():T {
        return Util512.shallowClone(this)
    }
    getKeys() {
        return Util512.getMapKeys(this).filter(k => Util512SerializableHelpers.shouldSerializeProperty(this, k))
    }
}
