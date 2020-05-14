
import type { FileSaver } from '../../external/FileSaver.js-2.0.2/FileSaver';

// [filesaver.js](https://github.com/eligrey/FileSaver.js)
// this library is bundled into externalmanualbundle.js and exists on globalThis
declare let saveAs: FileSaver;
export function bridgedSaveAs() {
    return saveAs;
}
