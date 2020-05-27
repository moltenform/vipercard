
/* [lz-string](https://github.com/pieroxy/lz-string)
this library is bundled into externalmanualbundle.js and exists on globalThis */

import type { NsLZString } from '../../external/lz-string-1.4.4/lzstring';

declare let LZString: NsLZString.LZStringStatic;
export function BridgedLZString() {
    return LZString;
}
