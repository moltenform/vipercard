
import { LZString } from '../../external/lz-string-1.4.4/lzstring';

// this library is bundled into externalmanualbundle.js and exists on globalThis

declare let LZString: LZString;
export const BridgedLZString = LZString;
