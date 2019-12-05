
import type { Bowser } from '../../external/bowser-2.9/bowser';
declare const bowser: typeof Bowser;

export function bridgedGetBrowserInfo() : [O<string>, O<string>, O<string>] {
    let o = bowser.parse(window.navigator.userAgent);
    return [o?.browser?.name, o?.browser?.version, o?.platform?.type];
}
