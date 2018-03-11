
/* autoimport:start */
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export const specialCharOnePixelSpace = "\x01";
export const specialCharFontChange = "\x02";
export const specialCharZeroPixelChar = "\x03";
export const specialCharCmdSymbol = "\xBD";
export const specialCharNumNewline = "\n".charCodeAt(0);
export const specialCharNumZeroPixelChar = specialCharZeroPixelChar.charCodeAt(0);
export const largearea = 1024 * 1024 * 1024;
const specialCharNumOnePixelSpace = specialCharOnePixelSpace.charCodeAt(0);
const specialCharNumFontChange = specialCharFontChange.charCodeAt(0);
const specialCharNumCmdSymbol = specialCharCmdSymbol.charCodeAt(0);
const specialCharNumTab = "\t".charCodeAt(0);

export class RenderTextArgs {
    constructor(
        public boxx: number,
        public boxy: number,
        public boxw: number,
        public boxh: number,
        public halign = false,
        public valign = false,
        public wrap = false
    ) {}

    addvspacing = 0;
    vscrollamt = 0;
    hscrollamt = 0;
    selcaret = -1;
    selend = -1;
    showCaret = false;
    defaultFont = TextRendererFontManager.defaultFont;
    drawBeyondVisible = true;
    asteriskOnly = false;
    callbackPerChar: O<(charindex: number, type: CharRectType, bounds: number[]) => boolean>;
}

export class FormattedText {
    isFormattedText = true;
    protected charArray: number[] = [];
    protected fontArray: string[] = [];
    protected locked = false;

    charAt(i: number) {
        return this.charArray[i];
    }

    fontAt(i: number) {
        return this.fontArray[i];
    }

    indexOf(c: number) {
        return this.charArray.indexOf(c);
    }

    setFontAt(i: number, s: string) {
        assertTrueWarn(s.length > 0, "")
        assertTrue(!this.locked, "3q|locked");
        assertTrue(!scontains(s, specialCharFontChange), `3p|invalid character ${specialCharFontChange.charCodeAt(0)} in font description`);
        this.fontArray[i] = s;
    }

    setCharAt(i: number, n: number) {
        assertTrue(!this.locked, "3o|locked");
        this.charArray[i] = n;
    }

    setFontEverywhere(s: string) {
        assertTrueWarn(s.length > 0, "")        
        assertTrue(!this.locked, "3n|locked");
        assertTrue(!scontains(s, specialCharFontChange), `3m|invalid character ${specialCharFontChange.charCodeAt(0)} in font description`);
        for (let i = 0; i < this.fontArray.length; i++) {
            this.fontArray[i] = s;
        }
    }

    push(char: number, font: string) {
        assertTrueWarn(font.length > 0, "")        
        assertTrue(!this.locked, "3l|locked");
        assertTrue(!scontains(font, specialCharFontChange), `3k|invalid character ${specialCharFontChange.charCodeAt(0)} in font description`);
        this.charArray.push(char);
        this.fontArray.push(font);
    }

    append(other: FormattedText) {
        assertTrue(!this.locked, "3j|locked");
        this.charArray = this.charArray.concat(other.charArray);
        this.fontArray = this.fontArray.concat(other.fontArray);
    }

    lock() {
        this.locked = true;
    }

    isLocked() {
        return this.locked
    }

    getUnlockedCopy() {
        let other = this.clone()
        other.locked = false;
        return other;
    }

    clone() {
        let other = new FormattedText();
        other.charArray = this.charArray.slice(0);
        other.fontArray = this.fontArray.slice(0);
        return other;
    }

    splice(n: number, nDelete: number) {
        assertTrue(!this.locked, "3i|locked");
        this.charArray.splice(n, nDelete);
        this.fontArray.splice(n, nDelete);
    }

    deleteAll() {
        assertTrue(!this.locked, "3h|locked");
        this.charArray = [];
        this.fontArray = [];
    }

    static byInsertion(t: FormattedText, n: number, nDelete: number, insert: string, font: string) {
        // could use splice() and fn.apply(), but that might hit javascript arg count limit
        let tnew = new FormattedText();
        tnew.charArray = t.charArray.slice(0, n);
        for (let i = 0; i < insert.length; i++) {
            tnew.charArray.push(insert.charCodeAt(i));
        }

        assertTrue(!scontains(font, specialCharFontChange), `3g|invalid character ${specialCharFontChange.charCodeAt(0)} in font description`);
        tnew.charArray = tnew.charArray.concat(t.charArray.slice(n + nDelete));

        tnew.fontArray = t.fontArray.slice(0, n);
        for (let i = 0; i < insert.length; i++) {
            tnew.fontArray.push(font);
        }

        tnew.fontArray = tnew.fontArray.concat(t.fontArray.slice(n + nDelete));
        return tnew;
    }

    static newFromPersisted(s: string) {
        let tnew = new FormattedText();
        tnew.fromPersisted(s);
        return tnew;
    }

    static newFromUnformatted(s: string) {
        s = s.replace(new RegExp(specialCharFontChange, "g"), "");
        s = s.replace(new RegExp("\x00", "g"), "");
        s = s.replace(new RegExp("\r\n", "g"), "\n");
        s = s.replace(new RegExp("\r", "g"), "\n");
        return FormattedText.newFromPersisted(s);
    }

    static fromExternalCharset(s: string, info: BrowserOSInfo, fallback = "?") {
        s = s.replace(new RegExp(specialCharFontChange, "g"), "");
        s = s.replace(new RegExp("\x00", "g"), "");
        s = s.replace(new RegExp("\r\n", "g"), "\n");
        s = s.replace(new RegExp("\r", "g"), "\n");
        s = CharsetTranslation.translateUnToRoman(s, fallback);
        return s;
    }

    static toExternalCharset(s: string, info: BrowserOSInfo, fallback = "?") {
        s = s.replace(new RegExp(specialCharFontChange, "g"), "");
        s = s.replace(new RegExp("\x00", "g"), "");
        s = s.replace(new RegExp("\r\n", "g"), "\n");
        s = s.replace(new RegExp("\r", "g"), "\n");
        s = CharsetTranslation.translateRomanToUn(s, fallback);
        if (info === BrowserOSInfo.Windows) {
            s = s.replace(new RegExp("\n", "g"), "\r\n");
        }
        
        return s;
    }

    static fromHostCharsetStrict(s: string, brinfo: BrowserOSInfo) {
        let try1 = FormattedText.fromExternalCharset(s, brinfo, "?");
        let try2 = FormattedText.fromExternalCharset(s, brinfo, "!");
        return try1 !== try2 ? undefined : try1;
    }

    appendSubstring(other: FormattedText, b1: number, b2: number) {
        this.charArray.concat(other.charArray.slice(b1, b2));
        this.fontArray.concat(other.fontArray.slice(b1, b2));
    }

    len() {
        assertEqWarn(this.charArray.length, this.fontArray.length, '3f|');
        return this.charArray.length;
    }

    fromPersisted(s: string) {
        assertTrue(!this.locked, "3e|locked");
        this.charArray = [];
        this.fontArray = [];
        assertEq(-1, s.indexOf("\r"), '3d|');
        assertEq(-1, s.indexOf("\x00"), '3c|');

        if (!s.startsWith(specialCharFontChange)) {
            s = TextRendererFontManager.setInitialFont(s, TextRendererFontManager.defaultFont);
        }

        let parts = s.split(new RegExp(specialCharFontChange, "g"));
        assertTrue(parts.length % 2 === 1, "3b|parts length must be odd");
        let currentFont = TextRendererFontManager.defaultFont;
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                let content = parts[i];
                for (let j = 0; j < content.length; j++) {
                    this.charArray.push(content.charCodeAt(j));
                    this.fontArray.push(currentFont);
                }
            } else {
                currentFont = parts[i];
                assertTrue(currentFont.length > 0 ,'')
                assertTrue(
                    !scontains(currentFont, specialCharFontChange),
                    `3a|invalid character ${specialCharFontChange.charCodeAt(0)} in font description`
                );
            }
        }
    }

    toPersisted() {
        let s = "";
        let currentFont: O<string> = undefined;
        assertEq(this.charArray.length, this.fontArray.length, '3Z|');
        for (let i = 0; i < this.charArray.length; i++) {
            if (currentFont !== this.fontArray[i]) {
                s += specialCharFontChange + this.fontArray[i] + specialCharFontChange;
                currentFont = this.fontArray[i];
            }
            s += String.fromCharCode(this.charAt(i));
        }

        return s;
    }

    toUnformatted() {
        let ret = this.charArray.map(c => String.fromCharCode(c)).join("");
        assertEq(this.len(), ret.length, '3Y|');
        return ret;
    }

    toUnformattedSubstr(from: number, len: number) {
        return this.charArray
            .slice(from, from + len)
            .map(c => String.fromCharCode(c))
            .join("");
    }
}

export enum TextFontStyling {
    Default = 0,
    Bold = 1 << 0,
    Italic = 1 << 1,
    Underline = 1 << 2,
    Outline = 1 << 3,
    Shadow = 1 << 4,
    Disabled = 1 << 5,
    Condensed = 1 << 6,
    Extend = 1 << 7,
}

export function textFontStylingToString(e: TextFontStyling): string {
    let ret = "";
    ret += e & TextFontStyling.Bold ? "+b" : "b";
    ret += e & TextFontStyling.Italic ? "+i" : "i";
    ret += e & TextFontStyling.Underline ? "+u" : "u";
    ret += e & TextFontStyling.Outline ? "+o" : "o";
    ret += e & TextFontStyling.Shadow ? "+s" : "s";
    ret += e & TextFontStyling.Disabled ? "+d" : "d";
    ret += e & TextFontStyling.Condensed ? "+c" : "c";
    ret += e & TextFontStyling.Extend ? "+e" : "e";
    return ret;
}

export function stringToTextFontStyling(s: string): TextFontStyling {
    let ret = TextFontStyling.Default;
    for (let i = 0; i < s.length - 1; i++) {
        if (s.charAt(i) === "+") {
            switch (s.charAt(i + 1)) {
                case "b":
                    ret |= TextFontStyling.Bold;
                    break;
                case "i":
                    ret |= TextFontStyling.Italic;
                    break;
                case "u":
                    ret |= TextFontStyling.Underline;
                    break;
                case "o":
                    ret |= TextFontStyling.Outline;
                    break;
                case "s":
                    ret |= TextFontStyling.Shadow;
                    break;
                case "d":
                    ret |= TextFontStyling.Disabled;
                    break;
                case "c":
                    ret |= TextFontStyling.Condensed;
                    break;
                case "e":
                    ret |= TextFontStyling.Extend;
                    break;
                default:
                    console.log(`warning: unrecognized text style ${s}`);
                    break;
            }
        }
    }
    return ret;
}

function typefacenameToTypefaceId(s: string): string {
    switch (s.toLowerCase().replace(/%20/g, " ")) {
        case "chicago":
            return "00";
        case "courier":
            return "01";
        case "geneva":
            return "02";
        case "new york":
            return "03";
        case "times":
            return "04";
        case "helvetica":
            return "05";
        case "monaco":
            return "06";
        case "symbol":
            return "07";
        default:
            return "00";
    }
}

function typefacenameToTypefaceIdFull(s: string): string {
    let face = TextFontSpec.getFacePart(s);
    return TextFontSpec.setFacePart(s, typefacenameToTypefaceId(face));
}

export class TextFontSpec {
    constructor(public typefacename: string, public style: TextFontStyling, public size: number) {}
    static fromString(s: string) {
        let parts = s.split("_");
        let typefacename = parts[0];
        let size = parseInt(parts[1], 10);
        let style = stringToTextFontStyling(parts[2]);
        return new TextFontSpec(typefacename, style, size);
    }

    toSpecString() {
        let ret = this.typefacename + "_";
        ret += this.size.toString() + "_";
        ret += textFontStylingToString(this.style);
        return ret;
    }

    static getFacePart(s: string) {
        return s.split("_")[0];
    }

    static setFacePart(s: string, snext: string) {
        let parts = s.split("_");
        assertTrue(!scontains(snext, "_"), '3X|parts of a font cannot contain the "_" character');
        return [snext, parts[1], parts[2]].join("_");
    }

    static getSizePart(s: string) {
        return s.split("_")[1];
    }

    static setSizePart(s: string, snext: string) {
        let parts = s.split("_");
        assertTrue(!scontains(snext, "_"), '3W|parts of a font cannot contain the "_" character');
        return [parts[0], snext, parts[2]].join("_");
    }

    static getStylePart(s: string) {
        return s.split("_")[2];
    }

    static setStylePart(s: string, snext: string) {
        let parts = s.split("_");
        assertTrue(!scontains(snext, "_"), '3V|parts of a font cannot contain the "_" character');
        return [parts[0], parts[1], snext].join("_");
    }
}

class DrawCharResult {
    constructor(public newlogicalx: number, public rightmostpixeldrawn: number, public lowestpixeldrawn: number) {}
    update(drawn: DrawCharResult) {
        this.lowestpixeldrawn = Math.max(this.lowestpixeldrawn, drawn.lowestpixeldrawn);
        this.rightmostpixeldrawn = Math.max(this.rightmostpixeldrawn, drawn.rightmostpixeldrawn);
        this.newlogicalx = drawn.newlogicalx;
    }
}

export class TextRendererGrid {
    metrics: any;
    image: HTMLImageElement;
    loadedMetrics = false;
    loadedImage = false;
    spec: TextFontSpec;
    adjustSpacing = 0;

    freezeWhenComplete() {
        if (this.loadedImage && this.loadedMetrics) {
            Object.freeze(this.metrics);
            Object.freeze(this.spec);
            Object.freeze(this);
        }
    }

    getLineHeight() {
        if (!this.metrics || !this.metrics.lineheight) {
            throw makeUI512Error(`3U|invalid metrics for font ${this.spec.typefacename} ${this.spec.size} ${this.spec.style}`);
        }

        return this.metrics.lineheight as number;
    }

    getCapHeight() {
        if (!this.metrics || !this.metrics["cap-height"]) {
            throw makeUI512Error(`3T|invalid metrics for font ${this.spec.typefacename} ${this.spec.size} ${this.spec.style}`);
        }

        return this.metrics["cap-height"] as number;
    }
}

export class TextRendererFont {
    underline = false;
    condense = false;
    extend = false;
    constructor(public readonly grid: TextRendererGrid) {}
    drawChar(
        n: number,
        x: number,
        baseline: number,
        windowX0: number,
        windowY0: number,
        windowW: number,
        windowH: number,
        canvas?: O<CanvasWrapper>
    ): DrawCharResult {
        let nForImage = n;
        if (n === specialCharNumTab) {
            let obj = new DrawCharResult(0, 0, 0);
            for (let i = 0; i < ScrollConsts.tabSize; i++) {
                obj = this.drawChar(0x20, x, baseline, windowX0, windowY0, windowW, windowH, canvas);
                x = obj.newlogicalx;
            }

            return obj;
        } else if (n === specialCharNumOnePixelSpace) {
            // character 1 is a one-pixel spacer
            // pretend to draw a 1x1 pixel, exit early before applying any styling
            return new DrawCharResult(x + 1, x, baseline);
        } else if (n === specialCharNumNewline) {
            // character is a zero-pixel placeholder representing the newline
            return new DrawCharResult(x, x, baseline);
        } else if (n === specialCharNumZeroPixelChar) {
            // character is a zero-pixel placeholder, so empty fields remember the font
            return new DrawCharResult(x, x, baseline);
        } else if (n < 32 || n >= this.grid.metrics.length) {
            n = "?".charCodeAt(0);
        }

        // these need to be passed in as bools to the method
        assertTrue((this.grid.spec.style & TextFontStyling.Underline) === 0, "3S|style should have been removed");
        assertTrue((this.grid.spec.style & TextFontStyling.Condensed) === 0, "3R|style should have been removed");
        assertTrue((this.grid.spec.style & TextFontStyling.Extend) === 0, "3Q|style should have been removed");

        let bounds = this.grid.metrics.bounds[n];
        assertTrue(bounds && bounds.length >= 6, "3P|invalid bounds");
        let logicalHorizontalSpace = bounds[4];
        let verticalOffset = bounds[5];

        // get coordinates within source image
        let srcx = bounds[0] + (this.grid.metrics.leftmost - 1);
        let srcy = bounds[1];
        let srcw = bounds[2] - (this.grid.metrics.leftmost - 1);
        let srch = bounds[3];
        srcw = Math.max(1, srcw); /* for empty characters, like an italics space */
        srch = Math.max(1, srch); /* for empty characters, like an italics space */

        // get destination coordinates
        let destx = x;
        let desty = baseline + verticalOffset - this.grid.metrics["cap-height"];

        // get logical spacing
        // for example, when drawing italics, the spacing < the width of the character drawn
        let spacing = logicalHorizontalSpace - this.grid.metrics.leftmost;
        spacing += this.grid.adjustSpacing || 0;
        if (this.extend && !this.condense) {
            spacing = Math.max(1, spacing + 1);
        } else if (this.condense && !this.extend) {
            spacing = Math.max(1, spacing - 1);
        } else {
            spacing = Math.max(1, spacing);
        }

        if (canvas) {
            canvas.drawFromImage(this.grid.image, srcx, srcy, srcw, srch, destx, desty, windowX0, windowY0, windowW, windowH);

            // following emulator, underline follows the drawn width if longer than the logical width
            if (this.underline) {
                let underlinelength = Math.max(srcw + 1, spacing);
                canvas.fillRect(destx, baseline + 1, underlinelength, 1, windowX0, windowY0, windowW, windowH, "black");
            }
        }

        return new DrawCharResult(x + spacing, destx + srcw, desty + srch);
    }
}

export class TextRendererFontCache {
    cachedGrids: { [key: string]: TextRendererGrid | boolean | undefined } = {};
    cachedFonts: { [key: string]: TextRendererFont } = {};
    adjustspacing: { [key: string]: number } = {};
    constructor() {
        // one-off supported fonts
        this.cachedGrids["00_12_biuosdce"] = true;
        this.cachedGrids["00_12_biuos+dce"] = true;
        this.cachedGrids["05_12_biuosdce"] = true;
        this.cachedGrids["00_9_biuosdce"] = true;
        this.cachedGrids["02_9_biuosdce"] = true;
        this.cachedGrids["02_9_biuos+dce"] = true;
        this.cachedGrids["06_9_biuosdce"] = true;
        this.cachedGrids["06_12_biuosdce"] = true;
        this.cachedGrids["07_12_biuosdce"] = true;
        this.cachedGrids["07_1_biuosdce"] = true;

        // standard supported fonts
        let listFonts = "00,01,02,03,04".split(/,/g);
        let listSizes = "10,12,14,18,24".split(/,/g);
        let listStyles = "biuosdce,+biuosdce,b+iuosdce,biu+osdce,+b+iuosdce,b+iu+osdce".split(/,/g);
        for (let fnt of listFonts) {
            for (let style of listStyles) {
                for (let sz of listSizes) {
                    let keyname = `${fnt}_${sz}_${style}`;
                    this.cachedGrids[keyname] = true;
                    this.loadSpacingAdjustments(keyname);
                }
            }
        }

        this.adjustspacing["02_12_b+iuosdce"] = 1;
        this.adjustspacing["02_24_b+iuosdce"] = 1;
        this.adjustspacing["02_24_biu+osdce"] = -2;
        this.adjustspacing["03_18_b+iuosdce"] = 1;
        Object.seal(this.cachedGrids);
        Object.freeze(this.adjustspacing);
    }

    loadSpacingAdjustments(keyname: string) {
        if (
            scontains(keyname, "+o") &&
            (keyname.startsWith("00_") || keyname.startsWith("01_") || keyname.startsWith("02_") || keyname.startsWith("03_"))
        ) {
            this.adjustspacing[keyname] = -1;
        } else if (keyname.startsWith("02_24_")) {
            this.adjustspacing[keyname] = -1;
        }
    }

    // returns undefined if waiting for font to load.
    findFont(font: string): O<TextRendererFont> {
        let found = this.cachedFonts[font];
        if (found) {
            return found;
        }

        let grid = this.findGrid(font);
        if (grid) {
            let spec = TextFontSpec.fromString(font);
            let fontobj = new TextRendererFont(grid);
            fontobj.underline = (spec.style & TextFontStyling.Underline) !== 0;
            fontobj.condense = (spec.style & TextFontStyling.Condensed) !== 0;
            fontobj.extend = (spec.style & TextFontStyling.Extend) !== 0;
            this.cachedFonts[font] = fontobj;
            return fontobj;
        } else {
            return undefined;
        }
    }

    getFont(font: string): TextRendererFont {
        return throwIfUndefined(this.findFont(font), "3O|font should have been cached", font);
    }

    stripManuallyAddedStyling(s: string) {
        s = s.replace("+c", "c");
        s = s.replace("+e", "e");
        s = s.replace("+u", "u");
        return s;
    }

    findGrid(font: string): O<TextRendererGrid> {
        font = typefacenameToTypefaceIdFull(font);
        let gridkey = this.stripManuallyAddedStyling(font);
        let found = this.cachedGrids[gridkey];
        if (found === undefined) {
            // case 1) client asked for an unsupported font, fall back to default font
            gridkey = TextRendererFontManager.defaultFontAsId;
            found = this.cachedGrids[gridkey];
            assertTrue(found !== undefined, "3N|found is undefined");
        }

        if (found === true) {
            // case 2) client asked for a supported font that has never been asked to be loaded
            let pendingGrid = new TextRendererGrid();
            pendingGrid.spec = TextFontSpec.fromString(gridkey);
            pendingGrid.adjustSpacing = this.adjustspacing[gridkey];
            this.cachedGrids[gridkey] = pendingGrid;

            // queue loading the image
            const imgUrl = "/resources/fonts/" + gridkey + ".png";
            pendingGrid.image = new Image();
            Util512.beginLoadImage(imgUrl, pendingGrid.image, () => {
                pendingGrid.loadedImage = true;
                pendingGrid.freezeWhenComplete();
            });

            // queue loading the bounds
            const jsonUrl = "/resources/fonts/" + gridkey + ".json";
            let req = new XMLHttpRequest();
            Util512.beginLoadJson(jsonUrl, req, s => {
                pendingGrid.metrics = JSON.parse(s);
                pendingGrid.loadedMetrics = true;
                pendingGrid.freezeWhenComplete();
            });

            return undefined;
        } else {
            if (!found || !found.loadedMetrics || !found.loadedImage) {
                // 3) font was started to load, but not yet complete.
                return undefined;
            } else {
                // 4) font is loaded and ready to use.
                return found;
            }
        }
    }
}

class LineTextToRender {
    text = new FormattedText();
    tallestLineHeight = -1;
    tallestCapHeight = -1;
    width = -1;
    charIndices: number[] = [];

    measureChar(cache: TextRendererFontCache, font: string, c: number) {
        let fontobj = cache.getFont(font);
        return fontobj.drawChar(c, 0, largearea / 2, 0, 0, largearea, largearea, undefined);
    }

    measureHeight(cache: TextRendererFontCache, addvspacing: number, lastHeightMeasured: number, lastCapHeightMeasured: number) {
        if (this.text.len() === 0) {
            this.tallestLineHeight = lastHeightMeasured;
            this.tallestCapHeight = lastCapHeightMeasured;
            return;
        }

        this.tallestLineHeight = 0;
        this.tallestCapHeight = 0;
        let currentFont = cache.getFont(TextRendererFontManager.defaultFont);

        for (let i = 0; i < this.text.len(); i++) {
            currentFont = cache.getFont(this.text.fontAt(i));

            this.tallestLineHeight = Math.max(this.tallestLineHeight, currentFont.grid.getLineHeight());
            this.tallestCapHeight = Math.max(this.tallestCapHeight, currentFont.grid.getCapHeight());
        }

        this.tallestLineHeight += addvspacing;
    }

    measureWidth(cache: TextRendererFontCache) {
        let curX = 0;
        for (let i = 0; i < this.text.len(); i++) {
            let letter = this.text.charAt(i);
            let font = this.text.fontAt(i);
            let drawn = this.measureChar(cache, font, letter);

            curX += drawn.newlogicalx;
        }

        this.width = curX;
    }
}

export enum CharRectType {
    __isUI512Enum = 1,
    Char,
    SpaceToLeft,
    SpaceToRight,
}

export class TextRendererFontManager implements IFontManager {
    cache = new TextRendererFontCache();
    static readonly defaultFont = "chicago_12_biuosdce";
    static readonly defaultFontAsId = "00_12_biuosdce";
    static readonly smallestFont = "symbol_1_biuosdce";
    static readonly smallestFontAsId = "07_1_biuosdce";

    isFontSupported(font: string) {
        font = typefacenameToTypefaceIdFull(font);
        let gridkey = this.cache.stripManuallyAddedStyling(font);
        return this.cache.cachedGrids[gridkey] !== undefined;
    }

    measureString(s: string) {
        let args = new RenderTextArgs(0, 0, largearea, largearea, false, false, false);
        return this.drawStringIntoBox(s, undefined, args);
    }

    // returns undefined if waiting for font to load.
    drawStringIntoBox(s: string, canvas: O<CanvasWrapper>, args: RenderTextArgs): O<DrawCharResult> {
        if (s === null || s === undefined) {
            assertTrue(false, "3M|tried to draw null string...");
            return new DrawCharResult(args.boxx, args.boxx + 1, args.boxy + 1);
        }

        let text = new FormattedText();
        text.fromPersisted(s);
        return this.drawFormattedStringIntoBox(text, canvas, args);
    }

    drawFormattedStringIntoBox(text: FormattedText, canvas: O<CanvasWrapper>, args: RenderTextArgs): O<DrawCharResult> {
        if (!text) {
            return new DrawCharResult(args.boxx, args.boxx + 1, args.boxy + 1);
        }

        // the default font must be available
        if (!this.cache.findFont(TextRendererFontManager.defaultFont) || !this.cache.findFont(args.defaultFont)) {
            return undefined;
        }

        // are any of the fonts available?
        for (let i = 0; i < text.len(); i++) {
            if (!this.cache.findFont(text.fontAt(i))) {
                return undefined;
            }
        }

        return this.drawStringIntoBoxImpl(text, canvas, args);
    }

    protected wrapTextIntoLines(s: FormattedText, args: RenderTextArgs) {
        let boxW = args.wrap ? args.boxw : largearea;
        boxW = Math.max(1, boxW)
        let ret = [new LineTextToRender()];
        let curx = 0;
        for (let i = 0; i < s.len(); i++) {
            let letter = s.charAt(i);
            let font = s.fontAt(i);

            // todo: putting abc\ndef into a very narrow field of width 1px, wrapping enabled
            // currently adds an extra vertical space between the c and the d
            // doesn't look that bad, but maybe something to revisit
            let measurement = letter===specialCharNumNewline ? 0 : 
                ret[ret.length - 1].measureChar(this.cache, font, letter).newlogicalx;
            curx += measurement;
            let tooFarToRight = curx >= boxW;
            let addNewLine = tooFarToRight && ret[ret.length - 1].text.len() > 0;

            if (addNewLine) {
                ret.push(new LineTextToRender());
                curx = measurement;
            }

            ret[ret.length - 1].text.push(letter, font);
            ret[ret.length - 1].charIndices.push(i);

            // we do keep the \n character at the end of each line
            if (letter === specialCharNumNewline && !addNewLine) {
                ret.push(new LineTextToRender());
                curx = 0;
            }
        }

        // placeholder for the end of the string, for convenience drawing the selection when end of string is selected
        let fontLast = s.len() === 0 ? args.defaultFont : s.fontAt(s.len() - 1);
        ret[ret.length - 1].text.push(specialCharNumZeroPixelChar, fontLast);
        ret[ret.length - 1].charIndices.push(s.len());
        return ret;
    }

    protected drawCaret(args: RenderTextArgs, canvas: CanvasWrapper, bounds: number[]) {
        // draw a vertical line
        canvas.fillRect(bounds[0], bounds[1], 1, bounds[3], args.boxx, args.boxy, args.boxw, args.boxh, "black");
    }

    protected drawSelected(args: RenderTextArgs, canvas: CanvasWrapper, bounds: number[], type: CharRectType) {
        canvas.invertColorsRect(bounds[0], bounds[1], bounds[2], bounds[3], args.boxx, args.boxy, args.boxw, args.boxh);
    }

    protected callPerChar(
        args: RenderTextArgs,
        canvas: O<CanvasWrapper>,
        charindex: number,
        type: CharRectType,
        bounds: number[]
    ): boolean {
        if (args.callbackPerChar && args.callbackPerChar(charindex, type, bounds) === false) {
            return false;
        }

        if (canvas && args.selcaret === args.selend) {
            /* draw the caret */
            if (args.showCaret && args.selcaret === charindex && type === CharRectType.Char) {
                this.drawCaret(args, canvas, bounds);
            }
        } else if (canvas) {
            /* highlight the selected text */
            if (args.selcaret < args.selend && charindex >= args.selcaret && charindex < args.selend) {
                this.drawSelected(args, canvas, bounds, type);
            } else if (args.selend < args.selcaret && charindex >= args.selend && charindex < args.selcaret) {
                this.drawSelected(args, canvas, bounds, type);
            }
        }

        return true;
    }

    protected drawStringIntoBoxImplLine(
        curx: number,
        cury: number,
        baseline: number,
        text: FormattedText,
        canvas: O<CanvasWrapper>,
        args: RenderTextArgs,
        line: LineTextToRender,
        ret: DrawCharResult
    ) {
        assertTrue(args.selcaret !== undefined && args.selcaret !== null, "3L|invalid selection");
        assertTrue(args.selend !== undefined && args.selend !== null, "3K|invalid selection");
        for (let i = 0; i < text.len(); i++) {
            let fontobj = this.cache.getFont(text.fontAt(i));
            let drawn = fontobj.drawChar(text.charAt(i), curx, baseline, args.boxx, args.boxy, args.boxw, args.boxh, canvas);

            let prevX = curx;
            curx = drawn.newlogicalx;
            ret.update(drawn);
            let prevxforbounds = prevX + 1;
            let curxforbounds = curx + 1;

            // the "logical" bounds is the full area surrounding the character,
            // the area that is highlighted when char is selected
            let cbounds = [prevxforbounds, cury, curxforbounds - prevxforbounds, line.tallestLineHeight];
            if (!this.callPerChar(args, canvas, line.charIndices[i], CharRectType.Char, cbounds)) {
                return ret;
            }

            // region to the left of the text on this line (can be large if field is haligned)
            if (i === 0) {
                let bounds = [args.boxx, cury, prevxforbounds - args.boxx, line.tallestLineHeight];
                if (bounds[2] >= 0 && bounds[3] >= 0) {
                    if (!this.callPerChar(args, canvas, line.charIndices[i], CharRectType.SpaceToLeft, bounds)) {
                        return ret;
                    }
                }
            }

            // region to the right of the text on this line
            if (i === text.len() - 1) {
                let bounds = [curxforbounds, cury, args.boxx + args.boxw - curxforbounds, line.tallestLineHeight];
                if (bounds[2] >= 0 && bounds[3] >= 0) {
                    if (!this.callPerChar(args, canvas, line.charIndices[i], CharRectType.SpaceToRight, bounds)) {
                        return ret;
                    }
                }
            }
        }

        return undefined;
    }

    static makeAsteriskOnlyIfApplicable(textin: FormattedText, args: RenderTextArgs) {
        if (!args.asteriskOnly) {
            return textin
        }

        let modifiedText = textin.clone()
        let c = '\xA5'.charCodeAt(0)
        for (let i=0; i<modifiedText.len(); i++) {
            modifiedText.setCharAt(i, c)
        }

        modifiedText.lock()
        return modifiedText
    }

    protected drawStringIntoBoxImpl(textin: FormattedText, canvas: O<CanvasWrapper>, args: RenderTextArgs): DrawCharResult {
        textin = TextRendererFontManager.makeAsteriskOnlyIfApplicable(textin, args)
        let lines = this.wrapTextIntoLines(textin, args);
        let totalWidth = 0,
            totalHeight = 0;
        let lastHeightMeasured = 0,
            lastCapHeightMeasured = 0;
        for (let line of lines) {
            line.measureWidth(this.cache);
            line.measureHeight(this.cache, args.addvspacing, lastHeightMeasured, lastCapHeightMeasured);
            totalWidth += line.width;
            totalHeight += line.tallestLineHeight;
            lastHeightMeasured = line.tallestLineHeight;
            lastCapHeightMeasured = line.tallestCapHeight;
        }

        let cury = args.boxy - args.vscrollamt;
        if (args.valign) {
            cury = args.boxy + Math.trunc((args.boxh - totalHeight) / 2);
        }

        let getPositionLineStart = (lineno: number) => {
            if (args.halign) {
                const adjustToBetterMatchEmulator = -1;
                return args.boxx + Math.trunc((args.boxw - lines[lineno].width) / 2) + adjustToBetterMatchEmulator;
            } else {
                return args.boxx - args.hscrollamt;
            }
        };

        let ret = new DrawCharResult(-1, -1, -1);
        let curx = 0;
        for (let lineno = 0; lineno < lines.length; lineno++) {
            curx = getPositionLineStart(lineno);
            let baseline = cury + lines[lineno].tallestCapHeight;
            let text = lines[lineno].text;
            assertTrue(text.len() > 0, "3J|cannot draw empty line");

            if (!args.drawBeyondVisible && cury > args.boxy + args.boxh) {
                /* perf optimization, don't need to keep drawing chars beyond the field */
                return ret;
            } else if (!args.drawBeyondVisible && cury + lines[lineno].tallestLineHeight < args.boxy) {
                /* perf optimization, skip this line since it is above visible text */
            } else {
                let r = this.drawStringIntoBoxImplLine(curx, cury, baseline, text, canvas, args, lines[lineno], ret);
                if (r !== undefined) {
                    return r;
                }
            }

            cury += lines[lineno].tallestLineHeight;
        }

        return ret;
    }

    static setInitialFont(s: string, font: string) {
        return specialCharFontChange + font + specialCharFontChange + s;
    }

    static makeInitialTextDisabled(s:string) {
        let search1 = specialCharFontChange + 'chicago_12_biuosdce' + specialCharFontChange
        let repl1 = specialCharFontChange + 'chicago_12_biuos+dce' + specialCharFontChange
        let search2 = specialCharFontChange + 'geneva_9_biuosdce' + specialCharFontChange
        let repl2 = specialCharFontChange + 'geneva_9_biuos+dce' + specialCharFontChange
        
        if (s.length == 0) {
            // empty string, no point in changing style
            return s
        } else if (s.charAt(0) !== specialCharFontChange) {
            // text uses the default font, so add disabled style
            return repl1 + s
        } else {
            // there are only 2 fonts where we support a disabled style,
            // if it's one of these we will make it disabled,
            // otherwise, leave formatting as is.
            return s.replace(new RegExp(search1, 'ig'), repl1).replace(new RegExp(search2, 'ig'), repl2)
        }
    }
}

export function renderTextArgsFromEl(el: any, subrect: number[], hasFocus: boolean): [RenderTextArgs, FormattedText] {
    let args = new RenderTextArgs(
        subrect[0],
        subrect[1],
        subrect[2],
        subrect[3],
        el.get_b("labelhalign"),
        el.get_b("labelvalign"),
        el.get_b("labelwrap")
    );

    // adjust positions
    args.boxx += el.get_n("nudgex");
    args.boxy += el.get_n("nudgey");
    args.boxw -= el.get_n("nudgex");
    args.boxh -= el.get_n("nudgey");

    // we currently don't support v-aligned text fields. can be used in a label.
    args.valign = false;
    args.addvspacing = el.get_n("addvspacing");
    args.hscrollamt = 0;
    args.vscrollamt = el.get_n("scrollamt");
    args.defaultFont = el.get_s("defaultFont");
    args.asteriskOnly = el.get_b("asteriskonly");

    if (el.get_b("selectbylines")) {
        // always show the highlight, even when text in another field is being edited.
        hasFocus = true;

        // shrink margins of the field.
        args.boxx -= 2;
        args.boxw += 4;
    }

    if (hasFocus && el.get_b("canselecttext")) {
        args.selcaret = el.get_n("selcaret");
        args.selend = el.get_n("selend");
        args.showCaret = el.get_b("showcaret");
    }

    if (el.get_b("selectbylines") && args.selcaret === args.selend) {
        // when selecting by lines, don't show the normal blinking caret
        args.showCaret = false;
    }

    let ret: FormattedText = el.get_ftxt();
    return [args, ret];
}

export class Lines {
    lns: FormattedText[];
    constructor(txt: FormattedText) {
        this.lns = [new FormattedText()];
        // include the '\n' characters at the end of the line like we do when rendering
        // if we strip the \n characters we would lose the formatting of the \n characters
        for (let i = 0; i < txt.len(); i++) {
            this.lns[this.lns.length - 1].push(txt.charAt(i), txt.fontAt(i));

            if (txt.charAt(i) === specialCharNumNewline) {
                this.lns.push(new FormattedText());
            }
        }
    }

    flatten() {
        let newtext = new FormattedText();
        for (let line of this.lns) {
            newtext.append(line);
        }

        return newtext;
    }

    indexToLineNumber(n: number) {
        let runningtotal = 0;
        for (let i = 0; i < this.lns.length; i++) {
            let nexttotal = runningtotal + this.lns[i].len();
            if (n >= runningtotal && n < nexttotal) {
                return i;
            }

            runningtotal = nexttotal;
        }

        return this.lns.length - 1;
    }

    static fastLineNumberToIndex(txt: FormattedText, linenumber: number) {
        let count = 0;
        for (let i = 0; i < txt.len(); i++) {
            if (count === linenumber) {
                return i;
            } else if (txt.charAt(i) === specialCharNumNewline) {
                count += 1;
            }
        }

        return txt.len();
    }

    static fastLineNumberAndEndToIndex(txt: FormattedText, linenumber: number) {
        let startindex = Lines.fastLineNumberToIndex(txt, linenumber);
        let i = startindex;
        for (i = startindex; i < txt.len(); i++) {
            if (txt.charAt(i) === specialCharNumNewline) {
                break;
            }
        }

        return [startindex, i + 1];
    }

    length() {
        let runningtotal = 0;
        for (let i = 0; i < this.lns.length; i++) {
            runningtotal += this.lns[i].len();
        }

        return runningtotal;
    }

    lineNumberToIndex(linenum: number) {
        let runningtotal = 0;
        linenum = Math.min(linenum, this.lns.length - 1);
        for (let i = 0; i < linenum; i++) {
            runningtotal += this.lns[i].len();
        }

        return runningtotal;
    }

    lineNumberToLineEndIndex(linenum: number) {
        let ln = this.lns[linenum];
        let startline = this.lineNumberToIndex(linenum);
        if (ln.len() === 0) {
            return startline;
        } else if (ln.charAt(ln.len() - 1) === specialCharNumNewline) {
            return startline + ln.len() - 1;
        } else {
            return startline + ln.len();
        }
    }

    getLineUnformatted(linenum: number) {
        let r = this.lns[linenum].toUnformatted();
        return r;
    }

    static alterSelectedLines(
        t: FormattedText,
        ncaret: number,
        nend: number,
        fnAlterLine: (t: FormattedText) => void
    ): [FormattedText, number, number] {
        let lines = new Lines(t);
        let firstline = lines.indexToLineNumber(Math.min(ncaret, nend));
        let lastline = lines.indexToLineNumber(Math.max(ncaret, nend));
        for (let i = firstline; i <= lastline; i++) {
            fnAlterLine(lines.lns[i]);
        }

        // let's select both entire lines we altered
        let nextcaret = lines.lineNumberToIndex(firstline);
        let nextend = lines.lineNumberToLineEndIndex(lastline);
        return [lines.flatten(), nextcaret, nextend];
    }

    static getNonSpaceStartOfLine(t: FormattedText, okToExceedLength: boolean) {
        let i = 0;
        let space = " ".charCodeAt(0);
        let tab = "\t".charCodeAt(0);
        if (!t.len()) {
            return 0;
        }

        for (i = 0; i < t.len(); i++) {
            if (t.charAt(i) !== space && t.charAt(i) !== tab) {
                return i;
            }
        }

        return okToExceedLength ? t.len() : t.len() - 1;
    }

    static getIndentLevel(t: FormattedText) {
        let spaces = Util512.repeat(ScrollConsts.tabSize, " ").join("");
        let s = t.toUnformatted();
        const maxIndents = 1024;
        let count = 0;
        for (let i = 0; i < maxIndents; i++) {
            if (s.startsWith("\t")) {
                count += 1;
                s = s.substr(1);
            } else if (s.startsWith(spaces)) {
                count += 1;
                s = s.substr(spaces.length);
            } else {
                break;
            }
        }

        return count;
    }
}

class CharsetTranslation {
    static romanToUn: O<{ [key: number]: string }>;
    static unToRoman: O<{ [key: number]: string }>;
    protected static getRomanToUn() {
        if (CharsetTranslation.romanToUn === undefined) {
            CharsetTranslation.romanToUn = {
                9: "\u0009",
                10: "\u000A",
                32: "\u0020",
                33: "\u0021",
                34: "\u0022",
                35: "\u0023",
                36: "\u0024",
                37: "\u0025",
                38: "\u0026",
                39: "\u0027",
                40: "\u0028",
                41: "\u0029",
                42: "\u002A",
                43: "\u002B",
                44: "\u002C",
                45: "\u002D",
                46: "\u002E",
                47: "\u002F",
                48: "\u0030",
                49: "\u0031",
                50: "\u0032",
                51: "\u0033",
                52: "\u0034",
                53: "\u0035",
                54: "\u0036",
                55: "\u0037",
                56: "\u0038",
                57: "\u0039",
                58: "\u003A",
                59: "\u003B",
                60: "\u003C",
                61: "\u003D",
                62: "\u003E",
                63: "\u003F",
                64: "\u0040",
                65: "\u0041",
                66: "\u0042",
                67: "\u0043",
                68: "\u0044",
                69: "\u0045",
                70: "\u0046",
                71: "\u0047",
                72: "\u0048",
                73: "\u0049",
                74: "\u004A",
                75: "\u004B",
                76: "\u004C",
                77: "\u004D",
                78: "\u004E",
                79: "\u004F",
                80: "\u0050",
                81: "\u0051",
                82: "\u0052",
                83: "\u0053",
                84: "\u0054",
                85: "\u0055",
                86: "\u0056",
                87: "\u0057",
                88: "\u0058",
                89: "\u0059",
                90: "\u005A",
                91: "\u005B",
                92: "\u005C",
                93: "\u005D",
                94: "\u005E",
                95: "\u005F",
                96: "\u0060",
                97: "\u0061",
                98: "\u0062",
                99: "\u0063",
                100: "\u0064",
                101: "\u0065",
                102: "\u0066",
                103: "\u0067",
                104: "\u0068",
                105: "\u0069",
                106: "\u006A",
                107: "\u006B",
                108: "\u006C",
                109: "\u006D",
                110: "\u006E",
                111: "\u006F",
                112: "\u0070",
                113: "\u0071",
                114: "\u0072",
                115: "\u0073",
                116: "\u0074",
                117: "\u0075",
                118: "\u0076",
                119: "\u0077",
                120: "\u0078",
                121: "\u0079",
                122: "\u007A",
                123: "\u007B",
                124: "\u007C",
                125: "\u007D",
                126: "\u007E",
                127: "\u007F",
                128: "\u00C4",
                129: "\u00C5",
                130: "\u00C7",
                131: "\u00C9",
                132: "\u00D1",
                133: "\u00D6",
                134: "\u00DC",
                135: "\u00E1",
                136: "\u00E0",
                137: "\u00E2",
                138: "\u00E4",
                139: "\u00E3",
                140: "\u00E5",
                141: "\u00E7",
                142: "\u00E9",
                143: "\u00E8",
                144: "\u00EA",
                145: "\u00EB",
                146: "\u00ED",
                147: "\u00EC",
                148: "\u00EE",
                149: "\u00EF",
                150: "\u00F1",
                151: "\u00F3",
                152: "\u00F2",
                153: "\u00F4",
                154: "\u00F6",
                155: "\u00F5",
                156: "\u00FA",
                157: "\u00F9",
                158: "\u00FB",
                159: "\u00FC",
                160: "\u2020",
                161: "\u00B0",
                162: "\u00A2",
                163: "\u00A3",
                164: "\u00A7",
                165: "\u2022",
                166: "\u00B6",
                167: "\u00DF",
                168: "\u00AE",
                169: "\u00A9",
                170: "\u2122",
                171: "\u00B4",
                172: "\u00A8",
                173: "\u2260",
                174: "\u00C6",
                175: "\u00D8",
                176: "\u221E",
                177: "\u00B1",
                178: "\u2264",
                179: "\u2265",
                180: "\u00A5",
                181: "\u00B5",
                182: "\u2202",
                183: "\u2211",
                184: "\u220F",
                185: "\u03C0",
                186: "\u222B",
                187: "\u00AA",
                188: "\u00BA",
                189: "\u03A9",
                190: "\u00E6",
                191: "\u00F8",
                192: "\u00BF",
                193: "\u00A1",
                194: "\u00AC",
                195: "\u221A",
                196: "\u0192",
                197: "\u2248",
                198: "\u2206",
                199: "\u00AB",
                200: "\u00BB",
                201: "\u2026",
                202: "\u00A0",
                203: "\u00C0",
                204: "\u00C3",
                205: "\u00D5",
                206: "\u0152",
                207: "\u0153",
                208: "\u2013",
                209: "\u2014",
                210: "\u201C",
                211: "\u201D",
                212: "\u2018",
                213: "\u2019",
                214: "\u00F7",
                215: "\u25CA",
                216: "\u00FF",
                217: "\u0178",
                218: "\u2044",
                219: "\u20AC",
                220: "\u2039",
                221: "\u203A",
                222: "\uFB01",
                223: "\uFB02",
                224: "\u2021",
                225: "\u00B7",
                226: "\u201A",
                227: "\u201E",
                228: "\u2030",
                229: "\u00C2",
                230: "\u00CA",
                231: "\u00C1",
                232: "\u00CB",
                233: "\u00C8",
                234: "\u00CD",
                235: "\u00CE",
                236: "\u00CF",
                237: "\u00CC",
                238: "\u00D3",
                239: "\u00D4",
                240: "\uF8FF",
                241: "\u00D2",
                242: "\u00DA",
                243: "\u00DB",
                244: "\u00D9",
            };

            Object.freeze(CharsetTranslation.romanToUn);
        }

        return CharsetTranslation.romanToUn;
    }

    protected static getUnToRoman() {
        if (CharsetTranslation.unToRoman === undefined) {
            CharsetTranslation.unToRoman = {
                9: "\u0009",
                10: "\u000a",
                32: "\u0020",
                33: "\u0021",
                34: "\u0022",
                35: "\u0023",
                36: "\u0024",
                37: "\u0025",
                38: "\u0026",
                39: "\u0027",
                40: "\u0028",
                41: "\u0029",
                42: "\u002a",
                43: "\u002b",
                44: "\u002c",
                45: "\u002d",
                46: "\u002e",
                47: "\u002f",
                48: "\u0030",
                49: "\u0031",
                50: "\u0032",
                51: "\u0033",
                52: "\u0034",
                53: "\u0035",
                54: "\u0036",
                55: "\u0037",
                56: "\u0038",
                57: "\u0039",
                58: "\u003a",
                59: "\u003b",
                60: "\u003c",
                61: "\u003d",
                62: "\u003e",
                63: "\u003f",
                64: "\u0040",
                65: "\u0041",
                66: "\u0042",
                67: "\u0043",
                68: "\u0044",
                69: "\u0045",
                70: "\u0046",
                71: "\u0047",
                72: "\u0048",
                73: "\u0049",
                74: "\u004a",
                75: "\u004b",
                76: "\u004c",
                77: "\u004d",
                78: "\u004e",
                79: "\u004f",
                80: "\u0050",
                81: "\u0051",
                82: "\u0052",
                83: "\u0053",
                84: "\u0054",
                85: "\u0055",
                86: "\u0056",
                87: "\u0057",
                88: "\u0058",
                89: "\u0059",
                90: "\u005a",
                91: "\u005b",
                92: "\u005c",
                93: "\u005d",
                94: "\u005e",
                95: "\u005f",
                96: "\u0060",
                97: "\u0061",
                98: "\u0062",
                99: "\u0063",
                100: "\u0064",
                101: "\u0065",
                102: "\u0066",
                103: "\u0067",
                104: "\u0068",
                105: "\u0069",
                106: "\u006a",
                107: "\u006b",
                108: "\u006c",
                109: "\u006d",
                110: "\u006e",
                111: "\u006f",
                112: "\u0070",
                113: "\u0071",
                114: "\u0072",
                115: "\u0073",
                116: "\u0074",
                117: "\u0075",
                118: "\u0076",
                119: "\u0077",
                120: "\u0078",
                121: "\u0079",
                122: "\u007a",
                123: "\u007b",
                124: "\u007c",
                125: "\u007d",
                126: "\u007e",
                127: "\u007f",
                196: "\u0080",
                197: "\u0081",
                199: "\u0082",
                201: "\u0083",
                209: "\u0084",
                214: "\u0085",
                220: "\u0086",
                225: "\u0087",
                224: "\u0088",
                226: "\u0089",
                228: "\u008a",
                227: "\u008b",
                229: "\u008c",
                231: "\u008d",
                233: "\u008e",
                232: "\u008f",
                234: "\u0090",
                235: "\u0091",
                237: "\u0092",
                236: "\u0093",
                238: "\u0094",
                239: "\u0095",
                241: "\u0096",
                243: "\u0097",
                242: "\u0098",
                244: "\u0099",
                246: "\u009a",
                245: "\u009b",
                250: "\u009c",
                249: "\u009d",
                251: "\u009e",
                252: "\u009f",
                8224: "\u00a0",
                176: "\u00a1",
                162: "\u00a2",
                163: "\u00a3",
                167: "\u00a4",
                8226: "\u00a5",
                182: "\u00a6",
                223: "\u00a7",
                174: "\u00a8",
                169: "\u00a9",
                8482: "\u00aa",
                180: "\u00ab",
                168: "\u00ac",
                8800: "\u00ad",
                198: "\u00ae",
                216: "\u00af",
                8734: "\u00b0",
                177: "\u00b1",
                8804: "\u00b2",
                8805: "\u00b3",
                165: "\u00b4",
                181: "\u00b5",
                8706: "\u00b6",
                8721: "\u00b7",
                8719: "\u00b8",
                960: "\u00b9",
                8747: "\u00ba",
                170: "\u00bb",
                186: "\u00bc",
                937: "\u00bd",
                230: "\u00be",
                248: "\u00bf",
                191: "\u00c0",
                161: "\u00c1",
                172: "\u00c2",
                8730: "\u00c3",
                402: "\u00c4",
                8776: "\u00c5",
                8710: "\u00c6",
                171: "\u00c7",
                187: "\u00c8",
                8230: "\u00c9",
                160: "\u00ca",
                192: "\u00cb",
                195: "\u00cc",
                213: "\u00cd",
                338: "\u00ce",
                339: "\u00cf",
                8211: "\u00d0",
                8212: "\u00d1",
                8220: "\u00d2",
                8221: "\u00d3",
                8216: "\u00d4",
                8217: "\u00d5",
                247: "\u00d6",
                9674: "\u00d7",
                255: "\u00d8",
                376: "\u00d9",
                8260: "\u00da",
                8364: "\u00db",
                8249: "\u00dc",
                8250: "\u00dd",
                64257: "\u00de",
                64258: "\u00df",
                8225: "\u00e0",
                183: "\u00e1",
                8218: "\u00e2",
                8222: "\u00e3",
                8240: "\u00e4",
                194: "\u00e5",
                202: "\u00e6",
                193: "\u00e7",
                203: "\u00e8",
                200: "\u00e9",
                205: "\u00ea",
                206: "\u00eb",
                207: "\u00ec",
                204: "\u00ed",
                211: "\u00ee",
                212: "\u00ef",
                63743: "\u00f0",
                210: "\u00f1",
                218: "\u00f2",
                219: "\u00f3",
                217: "\u00f4",
            };

            Object.freeze(CharsetTranslation.unToRoman);
        }

        return CharsetTranslation.unToRoman;
    }

    static translateRomanToUn(s: string, fallback = "?") {
        return CharsetTranslation.translate(s, CharsetTranslation.getRomanToUn(), fallback);
    }
    static translateUnToRoman(s: string, fallback = "?") {
        return CharsetTranslation.translate(s, CharsetTranslation.getUnToRoman(), fallback);
    }

    protected static translate(s: string, map: { [key: number]: string }, fallback: string) {
        let ret = "";
        for (let i = 0; i < s.length; i++) {
            let found = map[s.charCodeAt(i)];
            ret += found ? found : fallback;
        }

        return ret;
    }
}
