// [lz-string](https://github.com/pieroxy/lz-string)

import type { NsLZString } from '../../external/lz-string-1.4.4/lzstring';

// this library is bundled into externalmanualbundle.js and exists on globalThis

declare let LZString: NsLZString.LZStringStatic;
export function BridgedLZString() {
    return LZString;
}
