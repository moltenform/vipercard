
/* auto */ import { O, assertTrue, scontains, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { TextFontSpec, TextFontStyling, TextRendererFont, TextRendererGrid, typefacenameToTypefaceIdFull } from '../../ui512/draw/ui512drawtextclasses.js';

export class TextRendererFontCache {
    static readonly defaultFont = 'chicago_12_biuosdce';
    static readonly defaultFontAsId = '00_12_biuosdce';
    static readonly smallestFont = 'symbol_1_biuosdce';
    static readonly smallestFontAsId = '07_1_biuosdce';

    cachedGrids: { [key: string]: TextRendererGrid | boolean | undefined } = {};
    cachedFonts: { [key: string]: TextRendererFont } = {};
    adjustspacing: { [key: string]: number } = {};
    constructor() {
        // one-off supported fonts
        this.cachedGrids['00_12_biuosdce'] = true;
        this.cachedGrids['00_12_biuos+dce'] = true;
        this.cachedGrids['05_12_biuosdce'] = true;
        this.cachedGrids['00_9_biuosdce'] = true;
        this.cachedGrids['02_9_biuosdce'] = true;
        this.cachedGrids['02_9_biuos+dce'] = true;
        this.cachedGrids['06_9_biuosdce'] = true;
        this.cachedGrids['06_12_biuosdce'] = true;
        this.cachedGrids['07_12_biuosdce'] = true;
        this.cachedGrids['07_1_biuosdce'] = true;

        // standard supported fonts
        let listFonts = '00,01,02,03,04'.split(/,/g);
        let listSizes = '10,12,14,18,24'.split(/,/g);
        let listStyles = 'biuosdce,+biuosdce,b+iuosdce,biu+osdce,+b+iuosdce,b+iu+osdce'.split(/,/g);
        for (let fnt of listFonts) {
            for (let style of listStyles) {
                for (let sz of listSizes) {
                    let keyname = `${fnt}_${sz}_${style}`;
                    this.cachedGrids[keyname] = true;
                    this.loadSpacingAdjustments(keyname);
                }
            }
        }

        this.adjustspacing['02_12_b+iuosdce'] = 1;
        this.adjustspacing['02_24_b+iuosdce'] = 1;
        this.adjustspacing['02_24_biu+osdce'] = -2;
        this.adjustspacing['03_18_b+iuosdce'] = 1;
        Object.seal(this.cachedGrids);
        Object.freeze(this.adjustspacing);
    }

    loadSpacingAdjustments(keyname: string) {
        if (
            scontains(keyname, '+o') &&
            (keyname.startsWith('00_') ||
                keyname.startsWith('01_') ||
                keyname.startsWith('02_') ||
                keyname.startsWith('03_'))
        ) {
            this.adjustspacing[keyname] = -1;
        } else if (keyname.startsWith('02_24_')) {
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
        return throwIfUndefined(this.findFont(font), '3O|font should have been cached', font);
    }

    stripManuallyAddedStyling(s: string) {
        s = s.replace('+c', 'c');
        s = s.replace('+e', 'e');
        s = s.replace('+u', 'u');
        return s;
    }

    findGrid(font: string): O<TextRendererGrid> {
        font = typefacenameToTypefaceIdFull(font);
        let gridkey = this.stripManuallyAddedStyling(font);
        let found = this.cachedGrids[gridkey];
        if (found === undefined) {
            // case 1) client asked for an unsupported font, fall back to default font
            gridkey = TextRendererFontCache.defaultFontAsId;
            found = this.cachedGrids[gridkey];
            assertTrue(found !== undefined, '3N|found is undefined');
        }

        if (found === true) {
            // case 2) client asked for a supported font that has never been asked to be loaded
            let pendingGrid = new TextRendererGrid();
            pendingGrid.spec = TextFontSpec.fromString(gridkey);
            pendingGrid.adjustSpacing = this.adjustspacing[gridkey];
            this.cachedGrids[gridkey] = pendingGrid;

            // queue loading the image
            const imgUrl = '/resources/fonts/' + gridkey + '.png';
            pendingGrid.image = new Image();
            Util512.beginLoadImage(imgUrl, pendingGrid.image, () => {
                pendingGrid.loadedImage = true;
                pendingGrid.freezeWhenComplete();
            });

            // queue loading the bounds
            const jsonUrl = '/resources/fonts/' + gridkey + '.json';
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
