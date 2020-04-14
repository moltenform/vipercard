
/* auto */ import { RespondToErr, Util512Higher } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertTrue, ensureDefined } from './../utils/util512AssertCustom';
/* auto */ import { TextFontSpec, TextFontStyling, TextRendererFont, UI512FontGrid, typefacenameToTypefaceIdFull } from './ui512DrawTextClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * cache the font data that has been loaded
 */
export class UI512FontRequest {
    /* default font, we currently fall back to this if a nonexistent font is requested */
    static readonly defaultFont = 'chicago_12_biuosdce';
    static readonly defaultFontAsId = '00_12_biuosdce';

    /* define a small 1-pt font which can be useful for UI spacing */
    static readonly smallestFont = 'symbol_1_biuosdce';
    static readonly smallestFontAsId = '07_1_biuosdce';

    /* 3 possible states
    1) undefined means that this font isn't supported at all
    2) NotYetLoaded means that the font is supported but hasn't been loaded yet
    3) UI512FontGrid, the loaded font */
    cachedGrids: { [key: string]: UI512FontGrid | CacheState | undefined } = {};
    cachedFonts: { [key: string]: TextRendererFont } = {};
    adjustspacing: { [key: string]: number } = {};
    constructor() {
        /* pre-specify which fonts can be loaded */
        let fnts = '00,01,02,03,04'.split(/,/g);
        let sizes = '10,12,14,18,24'.split(/,/g);
        let styls = 'biuosdce,+biuosdce,b+iuosdce,biu+osdce,+b+iuosdce,b+iu+osdce'.split(
            /,/g
        );
        for (let fnt of fnts) {
            for (let style of styls) {
                for (let sz of sizes) {
                    let keyname = `${fnt}_${sz}_${style}`;
                    this.cachedGrids[keyname] = CacheState.NotYetLoaded;
                    this.loadSpacingAdjustments(keyname);
                }
            }
        }

        /* some typefaces we only support in a few sizes and styles */
        this.cachedGrids['00_12_biuosdce'] = CacheState.NotYetLoaded;
        this.cachedGrids['00_12_biuos+dce'] = CacheState.NotYetLoaded;
        this.cachedGrids['05_12_biuosdce'] = CacheState.NotYetLoaded;
        this.cachedGrids['00_9_biuosdce'] = CacheState.NotYetLoaded;
        this.cachedGrids['02_9_biuosdce'] = CacheState.NotYetLoaded;
        this.cachedGrids['02_9_biuos+dce'] = CacheState.NotYetLoaded;
        this.cachedGrids['06_9_biuosdce'] = CacheState.NotYetLoaded;
        this.cachedGrids['06_12_biuosdce'] = CacheState.NotYetLoaded;
        this.cachedGrids['07_12_biuosdce'] = CacheState.NotYetLoaded;
        this.cachedGrids['07_1_biuosdce'] = CacheState.NotYetLoaded;

        /* tweak spacing to match original os */
        this.adjustspacing['02_12_b+iuosdce'] = 1;
        this.adjustspacing['02_24_b+iuosdce'] = 1;
        this.adjustspacing['02_24_biu+osdce'] = -2;
        this.adjustspacing['03_18_b+iuosdce'] = 1;
        Object.seal(this.cachedGrids);
        Object.freeze(this.adjustspacing);
    }

    /**
     * find grid for a font
     */
    findGrid(font: string): O<UI512FontGrid> {
        font = typefacenameToTypefaceIdFull(font);
        let gridkey = this.stripManuallyAddedStyling(font);
        let found = this.cachedGrids[gridkey];
        if (found === undefined) {
            /* case 1) you asked for an unsupported font, fall back to default font */
            gridkey = UI512FontRequest.defaultFontAsId;
            found = this.cachedGrids[gridkey];
            assertTrue(found !== undefined, '3N|found is undefined');
        }

        if (found === CacheState.NotYetLoaded) {
            /* case 2) you asked for a supported font that has never been asked
            to be loaded */
            let pendingGrid = new UI512FontGrid();
            pendingGrid.spec = TextFontSpec.fromString(gridkey);
            pendingGrid.adjustSpacing = this.adjustspacing[gridkey];
            this.cachedGrids[gridkey] = pendingGrid;

            /* queue loading the image */
            const imgUrl = '/resources/fonts/' + gridkey + '.png';
            pendingGrid.image = new Image();
            Util512Higher.beginLoadImage(imgUrl, pendingGrid.image, () => {
                pendingGrid.loadedImage = true;
                pendingGrid.freeze();
            });

            /* queue loading the metrics */
            const jsonUrl = '/resources/fonts/' + gridkey + '.json';
            let afn = async () => {
                let obj = await Util512Higher.asyncLoadJson(jsonUrl);
                pendingGrid.metrics = obj;
                pendingGrid.loadedMetrics = true;
                pendingGrid.freeze();
            };

            Util512Higher.syncToAsyncTransition(afn, 'loadfont', RespondToErr.Alert);
            return undefined;
        } else {
            if (!found || !found.loadedMetrics || !found.loadedImage) {
                /* case 3) font was started to load, but not yet complete. */
                return undefined;
            } else {
                /* case 4) font is loaded and ready to use. */
                return found;
            }
        }
    }

    /**
     * outline fonts and a few other cases need slightly tighter spacing
     */
    loadSpacingAdjustments(keyname: string) {
        if (
            keyname.includes('+o') &&
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

    /**
     * find font in cache.
     * if font is not supported, return undefined
     */
    findFont(font: string): O<TextRendererFont> {
        let found = this.cachedFonts[font];
        if (found) {
            return found;
        }

        /* different fonts share the same grid */
        /* for example an "underline" variant of font has the same grid,
        just different flag */
        let grid = this.findGrid(font);
        if (grid) {
            let spec = TextFontSpec.fromString(font);
            let fontObj = new TextRendererFont(grid);
            fontObj.underline = (spec.style & TextFontStyling.Underline) !== 0;
            fontObj.condense = (spec.style & TextFontStyling.Condense) !== 0;
            fontObj.extend = (spec.style & TextFontStyling.Extend) !== 0;
            this.cachedFonts[font] = fontObj;
            return fontObj;
        } else {
            return undefined;
        }
    }

    /**
     * find font and throw if not present.
     */
    getFont(font: string): TextRendererFont {
        return ensureDefined(
            this.findFont(font),
            '3O|font should have been cached',
            font
        );
    }

    /**
     * the decorations condense, extend, underline are added at runtime,
     * and aren't persisted in a json file
     */
    stripManuallyAddedStyling(s: string) {
        s = s.replace(/\+c/g, 'c');
        s = s.replace(/\+e/g, 'e');
        s = s.replace(/\+u/g, 'u');
        return s;
    }
}

enum CacheState {
    NotYetLoaded = 1
}
