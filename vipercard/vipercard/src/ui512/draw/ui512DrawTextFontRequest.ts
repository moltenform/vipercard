
/* auto */ import { RespondToErr, Util512Higher } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertTrue, ensureDefined } from './../utils/util512Assert';
/* auto */ import { longstr } from './../utils/util512';
/* auto */ import { TextFontSpec, TextFontStyling, TextRendererFont, UI512FontGrid, typefacenameToTypefaceIdFull } from './ui512DrawTextClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * cache the font data that has been loaded
 */
export class UI512FontRequest {
    /* default font, we fall back to this if a nonexistent font is requested */
    static readonly defaultFont = 'chicago_12_biuosdce';
    static readonly defaultFontAsId = '00_12_biuosdce';

    /* define a small 1-pt font which can be useful for UI spacing */
    static readonly smallestFont = 'symbol_1_biuosdce';
    static readonly smallestFontAsId = '07_1_biuosdce';

    static manualFonts: { [key: string]: boolean } = {
        '00_12_biuosdce': true,
        '00_12_biuos+dce': true,
        '05_12_biuosdce': true,
        '00_9_biuosdce': true,
        '02_9_biuosdce': true,
        '02_9_biuos+dce': true,
        '06_9_biuosdce': true,
        '06_12_biuosdce': true,
        '07_12_biuosdce': true,
        '07_1_biuosdce': true
    };

    static hasRealDisabledImage: { [key: string]: boolean } = {
        '00_12_biuos+dce': true,
        '02_9_biuos+dce': true
    };

    /* 3 possible states
    1) undefined means that this font isn't supported at all
    2) NotYetLoaded means that the font is supported but hasn't been loaded yet
    3) UI512FontGrid, the loaded font */
    cachedGrids: { [key: string]: UI512FontGrid | CacheState | undefined } = {};
    cachedFonts: { [key: string]: TextRendererFont } = {};
    adjustspacing: { [key: string]: number } = {};
    constructor() {
        /* pre-specify which fonts can be loaded */
        let fnts = '00,01,02,03,04,05,06,07'.split(/,/g);
        let sizes = '9,10,12,14,18,24'.split(/,/g);
        let styls = longstr(
            `biuosdce
        |+biuosdce
        |b+iuosdce
        |biu+osdce
        |+b+iuosdce
        |b+iu+osdce
        |+biu+osdce
        |+b+iu+osdce`,
            ''
        ).split('|');
        for (let fnt of fnts) {
            for (let style of styls) {
                for (let sz of sizes) {
                    let keyname = `${fnt}_${sz}_${style}`;
                    this.cachedGrids[keyname] = CacheState.NotYetLoaded;
                    this.loadSpacingAdjustments(keyname);
                }
            }
        }

        /* we captured the fonts in 5 different stages:
            1) got the ones in manualFonts, checked pixel-perfect
            2) cohort 1, used in v0.2release
            listFonts=r'''00,01,02,03,04'''
            listSizes = r'''10,12,14,18,24'''
            listStyles = r'''biuosdce
            +biuosdce
            b+iuosdce
            biu+osdce
            +b+iuosdce
            b+iu+osdce'''
            we confirmed that 'chicago,courier,geneva',
            '10,12,14,18,24',
            'biuosdce,+biuosdce'
            were pixel perfect
            3) cohort 2, add missing styles
            listFonts=r'''00,01,02,03,04'''
            listSizes = r'''10,12,14,18,24'''
            listStyles = r'''+biu+osdce
            +b+iu+osdce'''

            4) cohort 3, add 9pt size for the original 5 fonts
            5) cohort 4, add last 3 fonts in all styles+sizes

        */

        /* these we've defined manually, e.g. to make a common font a pixel perfect match */
        for (let key in UI512FontRequest.manualFonts) {
            if (UI512FontRequest.manualFonts.hasOwnProperty(key)) {
                this.cachedGrids[key] = CacheState.NotYetLoaded;
            }
        }

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
        let gridkey = this.stripManuallyAddedStylingToGetGridKey(font);
        let found = this.cachedGrids[gridkey];
        if (found === undefined) {
            /* case 1) you asked for an unsupported font, fall back to default font */
            /* considered gracefully going to a similar font,
            but that is confusing also, because it's not what you asked for either. */
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
            const imgUrl = '/resources03a/fonts/' + gridkey + '.png';
            pendingGrid.image = new Image();
            Util512Higher.beginLoadImage(imgUrl, pendingGrid.image, () => {
                pendingGrid.loadedImage = true;
                pendingGrid.freeze();
            });

            /* queue loading the metrics */
            const jsonUrl = '/resources03a/fonts/' + gridkey + '.json';
            let afn = async () => {
                let obj = await Util512Higher.asyncLoadJson(jsonUrl);
                pendingGrid.metrics = obj;
                pendingGrid.loadedMetrics = true;
                pendingGrid.freeze();
            };

            Util512Higher.syncToAsyncTransition(afn(), 'loadfont', RespondToErr.Alert);
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
    stripManuallyAddedStylingToGetGridKey(s: string) {
        s = s.replace(/\+c/g, 'c');
        s = s.replace(/\+e/g, 'e');
        s = s.replace(/\+u/g, 'u');
        if (!UI512FontRequest.hasRealDisabledImage[s]) {
            s = s.replace(/\+d/g, 'd');
        }

        return s;
    }
}

enum CacheState {
    NotYetLoaded = 1
}
