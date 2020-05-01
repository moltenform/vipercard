
/* auto */ import { RespondToErr, Util512Higher } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertTrue, ensureDefined } from './../utils/util512Assert';
/* auto */ import { AnyUnshapedJson, longstr } from './../utils/util512';
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
        
        Object.seal(this.cachedGrids);
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
                AdjustFontMetrics.go(gridkey, pendingGrid)
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

export const mapAdjustLineHeight: { [key: string]: number } = {};
mapAdjustLineHeight['00_9_biuosdce'] = 1
mapAdjustLineHeight['00_9_+biuosdce'] = 2
mapAdjustLineHeight['00_9_biu+osdce'] = 1
mapAdjustLineHeight['01_9_biuosdce'] =2
mapAdjustLineHeight['01_9_+biuosdce'] =4
mapAdjustLineHeight['01_9_biu+osdce'] =2
mapAdjustLineHeight['01_9_+b+iuosdce'] =1
mapAdjustLineHeight['01_9_b+iu+osdce'] = -1
mapAdjustLineHeight['01_9_+biu+osdce'] =1

mapAdjustLineHeight['01_10_biuosdce'] = 1;
mapAdjustLineHeight['01_10_+biuosdce'] = 2;
mapAdjustLineHeight['01_10_b+iuosdce'] = 0;
mapAdjustLineHeight['01_10_biu+osdce'] = 1;
mapAdjustLineHeight['01_10_+b+iuosdce'] = 0;
mapAdjustLineHeight['01_10_b+iu+osdce'] = 0;
mapAdjustLineHeight['01_10_+biu+osdce'] = 0;
mapAdjustLineHeight['01_10_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['01_12_biuosdce'] = 1;
mapAdjustLineHeight['01_12_+biuosdce'] = 1;
mapAdjustLineHeight['01_12_b+iuosdce'] = 1;
mapAdjustLineHeight['01_12_biu+osdce'] = 0;
mapAdjustLineHeight['01_12_+b+iuosdce'] = 1;
mapAdjustLineHeight['01_12_b+iu+osdce'] = 0;
mapAdjustLineHeight['01_12_+biu+osdce'] = 0;
mapAdjustLineHeight['01_12_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['02_9_biuosdce'] = 1;
mapAdjustLineHeight['02_9_+biuosdce'] = 1;
mapAdjustLineHeight['02_9_b+iuosdce'] = 1;
mapAdjustLineHeight['02_9_biu+osdce'] = 0;
mapAdjustLineHeight['02_9_+b+iuosdce'] = 1;
mapAdjustLineHeight['02_9_b+iu+osdce'] = 0;
mapAdjustLineHeight['02_9_+biu+osdce'] = 0;
mapAdjustLineHeight['02_9_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['03_9_biuosdce'] = 1;
mapAdjustLineHeight['03_9_+biuosdce'] = 1;
mapAdjustLineHeight['03_9_b+iuosdce'] = 1;
mapAdjustLineHeight['03_9_biu+osdce'] = 0;
mapAdjustLineHeight['03_9_+b+iuosdce'] = 1;
mapAdjustLineHeight['03_9_b+iu+osdce'] = 0;
mapAdjustLineHeight['03_9_+biu+osdce'] = 0;
mapAdjustLineHeight['03_9_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['03_10_biuosdce'] = 1;
mapAdjustLineHeight['03_10_+biuosdce'] = 1;
mapAdjustLineHeight['03_10_b+iuosdce'] = 1;
mapAdjustLineHeight['03_10_biu+osdce'] = 0;
mapAdjustLineHeight['03_10_+b+iuosdce'] = 1;
mapAdjustLineHeight['03_10_b+iu+osdce'] = 0;
mapAdjustLineHeight['03_10_+biu+osdce'] = 0;
mapAdjustLineHeight['03_10_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['04_9_biuosdce'] = 2;
mapAdjustLineHeight['04_9_+biuosdce'] = 4;
mapAdjustLineHeight['04_9_b+iuosdce'] = 0;
mapAdjustLineHeight['04_9_biu+osdce'] = 2;
mapAdjustLineHeight['04_9_+b+iuosdce'] = 1;
mapAdjustLineHeight['04_9_b+iu+osdce'] = -1;
mapAdjustLineHeight['04_9_+biu+osdce'] = 1;
mapAdjustLineHeight['04_9_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['04_10_biuosdce'] = 1;
mapAdjustLineHeight['04_10_+biuosdce'] = 2;
mapAdjustLineHeight['04_10_b+iuosdce'] = 0;
mapAdjustLineHeight['04_10_biu+osdce'] = 1;
mapAdjustLineHeight['04_10_+b+iuosdce'] = 0;
mapAdjustLineHeight['04_10_b+iu+osdce'] = 0;
mapAdjustLineHeight['04_10_+biu+osdce'] = 0;
mapAdjustLineHeight['04_10_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['04_12_biuosdce'] = 1;
mapAdjustLineHeight['04_12_+biuosdce'] = 2;
mapAdjustLineHeight['04_12_b+iuosdce'] = 0;
mapAdjustLineHeight['04_12_biu+osdce'] = 1;
mapAdjustLineHeight['04_12_+b+iuosdce'] = 0;
mapAdjustLineHeight['04_12_b+iu+osdce'] = 0;
mapAdjustLineHeight['04_12_+biu+osdce'] = 0;
mapAdjustLineHeight['04_12_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['05_9_biuosdce'] = 2;
mapAdjustLineHeight['05_9_+biuosdce'] = 4;
mapAdjustLineHeight['05_9_b+iuosdce'] = 0;
mapAdjustLineHeight['05_9_biu+osdce'] = 2;
mapAdjustLineHeight['05_9_+b+iuosdce'] = 1;
mapAdjustLineHeight['05_9_b+iu+osdce'] = -1;
mapAdjustLineHeight['05_9_+biu+osdce'] = 1;
mapAdjustLineHeight['05_9_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['05_10_biuosdce'] = 1;
mapAdjustLineHeight['05_10_+biuosdce'] = 2;
mapAdjustLineHeight['05_10_b+iuosdce'] = 0;
mapAdjustLineHeight['05_10_biu+osdce'] = 1;
mapAdjustLineHeight['05_10_+b+iuosdce'] = 0;
mapAdjustLineHeight['05_10_b+iu+osdce'] = 0;
mapAdjustLineHeight['05_10_+biu+osdce'] = 0;
mapAdjustLineHeight['05_10_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['06_9_biuosdce'] = 2;
mapAdjustLineHeight['06_9_+biuosdce'] = 3;
mapAdjustLineHeight['06_9_b+iuosdce'] = 1;
mapAdjustLineHeight['06_9_biu+osdce'] = 1;
mapAdjustLineHeight['06_9_+b+iuosdce'] = 1;
mapAdjustLineHeight['06_9_b+iu+osdce'] = 0;
mapAdjustLineHeight['06_9_+biu+osdce'] = 0;
mapAdjustLineHeight['06_9_+b+iu+osdce'] = 0; /* not checked yet */
mapAdjustLineHeight['07_10_biuosdce'] = 2;
mapAdjustLineHeight['07_10_+biuosdce'] = 3;
mapAdjustLineHeight['07_10_b+iuosdce'] = 1;
mapAdjustLineHeight['07_10_biu+osdce'] = 1;
mapAdjustLineHeight['07_10_+b+iuosdce'] = 1;
mapAdjustLineHeight['07_10_b+iu+osdce'] = 0;
mapAdjustLineHeight['07_10_+biu+osdce'] = 0;
mapAdjustLineHeight['07_10_+b+iu+osdce'] = 0; /* not checked yet */


/**
 * our font-screenshot gathering tool can't know the metrics
 * with 100% accuracy, so adjust metrics here
 */
class AdjustFontMetrics {
    static go(gridkey:string, obj:UI512FontGrid) {
        obj.adjustHSpacing = 0
       
        /* 
            when addressing differences: move towards the blue.
            to slide characters horizontally,
                keep (adjustHSpacing - obj.metrics['leftmost']) a constant
                and adjust both of them in lockstep
            to stretch characters horizontally,
                adjust (adjustHSpacing - obj.metrics['leftmost'])
        */

        if ((gridkey.startsWith('02_9_') && gridkey.includes('+i'))) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
            /* j is too wide */
            obj.metrics.bounds['j'.charCodeAt(0)][4] += -1
        }

        if ((gridkey.startsWith('02_12_') && gridkey.includes('+i'))) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += -1
        }

        if ((gridkey.startsWith('02_24_') && gridkey.includes('+i'))) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += -1
        } else if (gridkey.startsWith('02_24_')) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
        }

        if ((gridkey.startsWith('03_18_') && gridkey.includes('+i'))) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += -1
        }

        if (gridkey.startsWith('04_18_')) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
        }

        if (gridkey.startsWith('05_18_')) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
        }

        if (gridkey.startsWith('06_10_')) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
        }

        if ((gridkey.startsWith('06_12_') && gridkey.includes('+i'))) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += -1
        }

        if (gridkey.startsWith('06_14_')) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
        }

        if (gridkey.startsWith('06_18_')) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
        }

        if ((gridkey.startsWith('06_24_') && gridkey.includes('+i'))) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
        }

        if ((gridkey.startsWith('07_9_') && gridkey.includes('+i'))) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
        }

        if (gridkey.startsWith('07_10_')) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
        }

        if ((gridkey.startsWith('07_14_') && !gridkey.includes('+i'))) {
            obj.adjustHSpacing += 0
            obj.metrics['leftmost'] += 1
        }

        if (gridkey.includes("+o")) {
            obj.metrics['leftmost'] += 1
        }

        

        let adj = mapAdjustLineHeight[gridkey]
        if (adj !== undefined) {
            obj.metrics.lineheight += adj
        }
    }

}
