
import { UI512Lang, cProductName } from "./lang-base.js";
import { assertTrue, assertEq, Root, RepeatingTimer } from "../ui512/ui512utils.js";

let langTable: { [key: string]: string } = {
    lngFile: "File",
    lngNewStack: "New Stack...",
    lngOpenStack: "Open Stack...",
    lngImportPaint: "Import Paint...",
    lngExportPaint: "Export Paint...",
    lngEdit: "Edit",
    lngUndo: "Undo",
    lngCopy: "Copy",
};

export class UI512LangEnUs implements UI512Lang {
    translate(s: string) {
        if (s === '') {
            return ''
        }
        
        assertTrue(s.startsWith("lng"), "0B|not starts with lng");
        let ret = langTable[s] || "???????";
        ret = ret.replace(/%cProductName/g, cProductName);
        return ret;
    }
}
