
import type { FileSaver } from '../../external/FileSaver.js-2.0.2/FileSaver';
declare let saveAs: FileSaver;
export const bridgedSaveAs = saveAs;

// this library is bundled into externalmanualbundle.js and exists on globalThis
