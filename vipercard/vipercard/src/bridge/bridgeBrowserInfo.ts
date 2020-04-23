
import type { Bowser } from '../../external/bowser-2.9/bowser';
declare const bowser: typeof Bowser;

/* [Bowser](https://github.com/lancedikson/bowser) */
/* is bundled into externalmanualbundle.js and exists on globalThis */

/* https://github.com/lancedikson/bowser/blob/master/src/constants.js */
export enum BowserBrowsers {
    __isUI512Enum = 1,
    unknown,
    amazon_silk,
    android,
    bada,
    blackberry,
    chrome,
    chromium,
    electron,
    epiphany,
    firefox,
    focus,
    generic,
    googlebot,
    google_search,
    ie,
    k_meleon,
    maxthon,
    edge,
    mz,
    naver,
    opera,
    opera_coast,
    phantomjs,
    puffin,
    qupzilla,
    qq,
    qqlite,
    safari,
    sailfish,
    samsung_internet,
    seamonkey,
    sleipnir,
    swing,
    tizen,
    uc,
    vivaldi,
    webos,
    wechat,
    yandex,
}

export enum BowserOS {
    __isUI512Enum = 1,
    unknown,
    windowsphone,
    windows,
    macos,
    ios,
    android,
    webos,
    blackberry,
    bada,
    tizen,
    linux,
    chromeos,
    playstation4,
    roku,
}

export enum BowserPlatform {
    __isUI512Enum = 1,
    unknown,
    tablet,
    mobile,
    desktop,
    tv,
}

function mapToBowserBrowsers(s:string):BowserBrowsers {
    let map = Object.create(null);
    let assign = (k:string, v:string) => {
        k = k.toLowerCase()
        v = v.toLowerCase()
        if (!BowserBrowsers[v]) {
            console.error('get the latest bowser?', k, v)
        } else {
            map[k] = BowserBrowsers[v]
        }
    }

    for (let key in bowser.BROWSER_MAP) {
        if (typeof key === 'string' && typeof bowser.BROWSER_MAP[key] === 'string') {
            assign(key, key)
            assign(bowser.BROWSER_MAP[key], key)
        }
    }

    let ret = map[s.toLowerCase()]
    return ret ?? BowserBrowsers.unknown
}

function mapToBowserOs(s:string):BowserOS {
    let map = Object.create(null);
    let assign = (k:string, v:string) => {
        k = k.toLowerCase()
        v = v.toLowerCase()
        if (!BowserOS[v]) {
            console.error('get the latest bowser?', k, v)
        } else {
            map[k] = BowserOS[v]
        }
    }

    for (let key in bowser.OS_MAP) {
        if (typeof key === 'string' && typeof bowser.OS_MAP[key] === 'string') {
            assign(key, key)
            assign(bowser.OS_MAP[key], key)
        }
    }

    let ret = map[s.toLowerCase()]
    return ret ?? BowserOS.unknown
}

function mapToBowserPlatform(s:string):BowserPlatform {
    let map = Object.create(null);
    let assign = (k:string, v:string) => {
        k = k.toLowerCase()
        v = v.toLowerCase()
        if (!BowserPlatform[v]) {
            console.error('get the latest bowser?', k, v)
        } else {
            map[k] = BowserPlatform[v]
        }
    }

    for (let key in bowser.PLATFORMS_MAP) {
        if (typeof key === 'string' && typeof bowser.PLATFORMS_MAP[key] === 'string') {
            assign(key, key)
            assign(bowser.PLATFORMS_MAP[key], key)
        }
    }

    let ret = map[s.toLowerCase()]
    return ret ?? BowserPlatform.unknown
}


export function bridgedGetAllBrowserInfo(s:string):[BowserBrowsers, BowserOS, BowserPlatform] {
    let rBowserBrowsers = BowserBrowsers.unknown
    let rBowserOS = BowserOS.unknown
    let rBowserPlatform = BowserPlatform.unknown
    let obj = bowser.parse(s);
    
    let rawBrowsername = obj?.browser?.name
    if (rawBrowsername) {
        rBowserBrowsers = mapToBowserBrowsers(rawBrowsername)
    }

    let rawOsName = obj?.os?.name
    if (rawOsName) {
        rBowserOS = mapToBowserOs(rawOsName)
    }

    let rawPlatform = obj?.platform?.type
    if (rawPlatform) {
        rBowserPlatform = mapToBowserPlatform(rawPlatform)
    }

    return [rBowserBrowsers, rBowserOS, rBowserPlatform ]
}

