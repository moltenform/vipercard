
/* autoimport:start */
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class IconInfo {
    iconadjustx = 0;
    iconadjusty = 0;
    iconadjustwidth = 0;
    iconadjustheight = 0;
    iconadjustsrcx = 0;
    iconadjustsrcy = 0;
    iconcentered = true;
    constructor(public iconsetid: string, public iconnumber: number) {}
    getcopy() {
        let ret = new IconInfo(this.iconsetid, this.iconnumber);
        ret.iconadjustx = this.iconadjustx;
        ret.iconadjusty = this.iconadjusty;
        ret.iconadjustsrcx = this.iconadjustsrcx;
        ret.iconadjustsrcy = this.iconadjustsrcy;
        ret.iconadjustwidth = this.iconadjustwidth;
        ret.iconadjustheight = this.iconadjustheight;
        ret.iconcentered = this.iconcentered;
        return ret;
    }
}

export class RenderIcon {
    constructor(public set: RenderIconSet, public srcrect: number[]) {}
    public drawIntoBox(canvas: CanvasWrapper, info: IconInfo, boxX0: number, boxY0: number, boxW: number, boxH: number) {
        let srcrect = [
            this.srcrect[0] + info.iconadjustsrcx,
            this.srcrect[1] + info.iconadjustsrcy,
            this.srcrect[2] + info.iconadjustwidth - info.iconadjustsrcx,
            this.srcrect[3] + info.iconadjustheight - info.iconadjustsrcy,
        ];
        if (info.iconcentered) {
            canvas.drawFromImageCentered(
                this.set.image,
                srcrect[0],
                srcrect[1],
                srcrect[2],
                srcrect[3],
                info.iconadjustx,
                info.iconadjusty,
                boxX0,
                boxY0,
                boxW,
                boxH
            );
        } else {
            canvas.drawFromImage(
                this.set.image,
                srcrect[0],
                srcrect[1],
                srcrect[2],
                srcrect[3],
                boxX0 + info.iconadjustx,
                boxY0 + info.iconadjusty,
                boxX0,
                boxY0,
                boxW,
                boxH
            );
        }
    }
}

class IconSetInfo {
    customDims: { [key: number]: number[] } = {};
    customOffsets: { [key: number]: number[] } = {};
    totalIcons = 0;
    gridsize = 1;
    gridspacing = 1;
    gridwidth = 1;
}

export class RenderIconSet {
    image: any;
    loadedImage = false;
    customDims: { [key: number]: number[] } = {};
    customOffsets: { [key: number]: number[] } = {};
    totalIcons = 0;
    gridsize = 1;
    gridspacing = 1;
    gridwidth = 1;
    protected static setInfo: { [setid: string]: IconSetInfo } = {};
    static initRenderIconSet() {
        if (RenderIconSet.setInfo["000"]) {
            // already loaded.
            return;
        }

        let iconset000 = new IconSetInfo();
        RenderIconSet.setInfo["000"] = iconset000;
        iconset000.totalIcons = 4;
        iconset000.customOffsets[0] = [0, 0];
        iconset000.customDims[0] = [896, 48];
        iconset000.customOffsets[1] = [0, 48];
        iconset000.customDims[1] = [896, 48];
        iconset000.customOffsets[2] = [0, 48 + 48];
        iconset000.customDims[2] = [896, 64];
        iconset000.customOffsets[3] = [0, 48 + 48 + 64];
        iconset000.customDims[3] = [896, 24];

        let iconset001 = new IconSetInfo();
        RenderIconSet.setInfo["001"] = iconset001;
        iconset001.gridsize = 32;
        iconset001.gridspacing = 1;
        iconset001.gridwidth = 9;
        iconset001.totalIcons = 9 * 16 + 2;
        for (let i = 0; i < 18; i++) {
            iconset001.customDims[i] = [22, 20];
        }
        iconset001.customDims[18] = [9, 9];
        iconset001.customDims[19] = [9, 8];
        for (let i = 20; i < 23; i++) {
            iconset001.customDims[i] = [22, 20];
        }
        for (let i = 23; i < 27; i++) {
            iconset001.customDims[i] = [14, 14];
        }
        iconset001.customDims[27] = [11, 8];
        for (let i = 28; i < 36; i++) {
            iconset001.customDims[i] = [12, 12];
        }
        // pattern toolbox icons part 1
        for (let i = 36; i < 75; i++) {
            iconset001.customDims[i] = [17, 12];
        }
        iconset001.customDims[75] = [18, 16];
        iconset001.customDims[76] = [32, 32];
        iconset001.customDims[77] = [32, 32];
        iconset001.customDims[78] = [12, 15];
        iconset001.customDims[79] = [11, 13];
        iconset001.customDims[80] = [8, 11];
        // pattern toolbox icons part 2
        for (let i = 81; i < 90; i++) {
            iconset001.customDims[i] = [17, 12];
        }
        // nav icons
        for (let i = 90; i < 100; i++) {
            iconset001.customDims[i] = [22, 20];
        }
        // first gray pattern
        iconset001.customOffsets[144] = [0, 529];
        iconset001.customDims[144] = [304, 384];
        // second gray pattern
        iconset001.customOffsets[145] = [0, 529 + 384];
        iconset001.customDims[145] = [304, 383];

        let iconset002 = new IconSetInfo();
        RenderIconSet.setInfo["002"] = iconset002;
        iconset002.gridsize = 32;
        iconset002.gridspacing = 1;
        iconset002.gridwidth = 12;
        iconset002.totalIcons = 20 * 13;
        let defaultsize = [iconset002.gridsize, iconset002.gridsize];

        let iconsetDissolve = new IconSetInfo();
        RenderIconSet.setInfo["fordissolve"] = iconsetDissolve;
        iconsetDissolve.gridsize = 64;
        iconsetDissolve.gridspacing = 0;
        iconsetDissolve.gridwidth = 64;
        iconsetDissolve.totalIcons = 11;

        let iconsetLogo = new IconSetInfo();
        RenderIconSet.setInfo["logo"] = iconsetLogo;
        iconsetLogo.totalIcons = 3;
        iconsetLogo.customOffsets[0] = [0, 0];
        iconsetLogo.customDims[0] = [176, 90];
        iconsetLogo.customOffsets[1] = [180, 0];
        iconsetLogo.customDims[1] = [284, 512];
        iconsetLogo.customOffsets[2] = [1, 491];
        iconsetLogo.customDims[2] = [22, 20];

        let screenshots_anim = new IconSetInfo();
        RenderIconSet.setInfo["screenshots_anim"] = screenshots_anim;
        screenshots_anim.totalIcons = 29;
        for (let i = 0; i < screenshots_anim.totalIcons; i++) {
            screenshots_anim.customOffsets[i] = [0, i * 351];
            screenshots_anim.customDims[i] = [726, 351];
        }

        let screenshots_hello = new IconSetInfo();
        RenderIconSet.setInfo["screenshots_hello"] = screenshots_hello;
        screenshots_hello.totalIcons = 11;
        for (let i = 0; i < screenshots_hello.totalIcons; i++) {
            screenshots_hello.customOffsets[i] = [0, i * 362];
            screenshots_hello.customDims[i] = [726, 362];
        }

        Util512.freezeRecurse(RenderIconSet.setInfo);
    }

    constructor(public readonly iconsetid: string) {
        RenderIconSet.initRenderIconSet();

        let info = RenderIconSet.setInfo[iconsetid];
        assertTrue(info, "3I|unknown icon set", iconsetid);
        if (info) {
            this.customDims = info.customDims;
            this.customOffsets = info.customOffsets;
            this.gridsize = info.gridsize;
            this.gridspacing = info.gridspacing;
            this.gridwidth = info.gridwidth;
            this.totalIcons = info.totalIcons;
        }
    }

    getRectangle(iconnumber: number) {
        if (iconnumber < 0 || iconnumber >= this.totalIcons) {
            return undefined;
        }
        let offsets = this.customOffsets[iconnumber];
        if (offsets === undefined) {
            let gridy = Math.trunc(iconnumber / this.gridwidth);
            let gridx = iconnumber - gridy * this.gridwidth;
            offsets = [gridx * this.gridsize + (gridx + 1) * this.gridspacing, gridy * this.gridsize + (gridy + 1) * this.gridspacing];
        }

        let dims = this.customDims[iconnumber];
        if (dims === undefined) {
            assertTrueWarn(this.iconsetid === "fordissolve" || this.iconsetid === "002", "3H|falling back to default grid size");
            dims = [this.gridsize, this.gridsize];
        }

        return [offsets[0], offsets[1], dims[0], dims[1]];
    }

    getIcon(iconnumber: number): RenderIcon {
        let rectangle = this.getRectangle(iconnumber);
        return new RenderIcon(this, throwIfUndefined(rectangle, "3G|could not load icon number", iconnumber, this.iconsetid));
    }

    static lookupRectangle(iconsetid: string, iconnumber: number): O<number[]> {
        let set = new RenderIconSet(iconsetid);
        return set.getRectangle(iconnumber);
    }
}

export class RenderIconManager implements IIconManager {
    cachedIconSets: { [key: string]: RenderIconSet } = {};

    findIcon(iconsetid: string, iconnumber: number): O<RenderIcon> {
        let cached = this.cachedIconSets[iconsetid];
        if (cached === undefined) {
            // case 1) we haven't queued loading this icon set.
            assertTrue(iconsetid.match(/^[0-9a-z_]+$/), `3F|iconsetid must be alphanumberic but got ${iconsetid}`);
            let iconset = new RenderIconSet(iconsetid);
            this.cachedIconSets[iconsetid] = iconset;
            let url = `/resources/images/${iconsetid}.png`;
            iconset.image = new Image();
            Util512.beginLoadImage(url, iconset.image, () => {
                iconset.loadedImage = true;
            });

            return undefined;
        } else {
            if (!cached.loadedImage) {
                // case 2) we need to wait for the icon set to load.
                return undefined;
            } else {
                // case 3) it's loaded and ready to use
                return cached.getIcon(iconnumber);
            }
        }
    }
}

export class UI512ImageCollectionCollection {
    children: UI512ImageCollection[] = [];
}

export class UI512ImageCollection {
    children: UI512ImageCollectionImage[] = [];
    suffix = ".png";
    readonly url = "/resources/images/stamps/";
    constructor(public id: string, public name: string) {}
    genChildren(largestNumber: number) {
        for (let i = 1; i <= largestNumber; i++) {
            let id = i.toString();
            id = id.length === 2 ? id : "0" + id;
            let name = "lng" + i.toString();
            this.children.push(new UI512ImageCollectionImage(id, name));
            this.children[this.children.length - 1].parent = this;
        }
    }
}

export class UI512ImageCollectionImage {
    parent: UI512ImageCollection;
    constructor(public id: string, public name: string) {}
    image: O<HTMLImageElement>;
    loaded = false;
    startLoad(cb: () => void) {
        if (!this.loaded && !this.image) {
            let url = this.getUrl();
            this.image = new Image();
            Util512.beginLoadImage(url, this.image, () => {
                this.loaded = true;
                cb();
            });
        }
    }
    getSize() {
        return this.image ? [this.image.naturalWidth, this.image.naturalHeight] : [0, 0];
    }
    getUrl() {
        assertTrue(this.parent.id.match(/^[a-z]+$/), "");
        return this.parent.url + this.parent.id + "/" + this.id + this.parent.suffix;
    }
}

