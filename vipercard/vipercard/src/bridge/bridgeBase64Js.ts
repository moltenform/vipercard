
// this library is bundled into externalmanualbundle.js and exists on globalThis

export declare namespace base64js {
    // Type definitions for base64-js 1.2
    // Project: https://github.com/beatgammit/base64-js
    // Definitions by: Peter Safranek <https://github.com/pe8ter>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    function byteLength(encoded: string): number;
    function toByteArray(encoded: string): Uint8Array;
    function fromByteArray(bytes: Uint8Array): string;
}

export const bridgedBase64Js = base64js;
