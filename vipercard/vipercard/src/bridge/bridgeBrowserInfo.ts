
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

export function bridgedGetAllBrowserInfo(s:string):[BowserBrowsers, BowserOS, BowserPlatform] {
    let rBowserBrowsers = BowserBrowsers.unknown
    let rBowserOS = BowserOS.unknown
    let rBowserPlatform = BowserPlatform.unknown
    let obj = bowser.parse(s);
    
    let rawBrowsername = obj?.browser?.name
    if (rawBrowsername) {
        if ( BowserBrowsers[rawBrowsername.toLowerCase()]) {
            rBowserBrowsers = BowserBrowsers[rawBrowsername.toLowerCase()]
        } else if ( BowserBrowsers[bowser.BROWSER_MAP[rawBrowsername].toLowerCase()]) {
            rBowserBrowsers = BowserBrowsers[bowser.BROWSER_MAP[rawBrowsername].toLowerCase()]
        }
    }

    let rawOsName = obj?.os?.name
    if (rawOsName) {
        if ( BowserOS[rawOsName.toLowerCase()]) {
            rBowserOS = BowserOS[rawOsName.toLowerCase()]
        } else if ( BowserOS[bowser.OS_MAP[rawOsName].toLowerCase()]) {
            rBowserOS = BowserOS[bowser.OS_MAP[rawOsName].toLowerCase()]
        }
    }

    let rawPlatform = obj?.platform?.type
    if (rawPlatform) {
        if ( BowserPlatform[rawPlatform.toLowerCase()]) {
            rBowserPlatform = BowserPlatform[rawPlatform.toLowerCase()]
        } else if ( BowserPlatform[bowser.PLATFORMS_MAP[rawPlatform].toLowerCase()]) {
            rBowserPlatform = BowserPlatform[bowser.PLATFORMS_MAP[rawPlatform].toLowerCase()]
        }
    }

    return [rBowserBrowsers, rBowserOS, rBowserPlatform ]
}

