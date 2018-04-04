
/* auto */ import { O, assertTrue, assertTrueWarn, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';

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
    public drawIntoBox(
        canvas: CanvasWrapper,
        info: IconInfo,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number
    ) {
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

export class RenderIconSet {
    image: any;
    loadedImage = false;
    customDims: { [key: number]: number[] } = {};
    customOffsets: { [key: number]: number[] } = {};
    totalIcons = 0;
    gridsize = 1;
    gridspacing = 1;
    gridwidth = 1;
    static setInfo: { [setid: string]: IconSetInfo } = {};

    constructor(public readonly iconsetid: string) {
        let info = RenderIconSet.setInfo[iconsetid];
        assertTrue(info, '3I|unknown icon set', iconsetid);
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
            offsets = [
                gridx * this.gridsize + (gridx + 1) * this.gridspacing,
                gridy * this.gridsize + (gridy + 1) * this.gridspacing,
            ];
        }

        let dims = this.customDims[iconnumber];
        if (dims === undefined) {
            assertTrueWarn(
                this.iconsetid === 'fordissolve' || this.iconsetid === '002' || this.iconsetid === 'spacegame',
                '3H|falling back to default grid size'
            );
            dims = [this.gridsize, this.gridsize];
        }

        return [offsets[0], offsets[1], dims[0], dims[1]];
    }

    getIcon(iconnumber: number): RenderIcon {
        let rectangle = this.getRectangle(iconnumber);
        return new RenderIcon(
            this,
            throwIfUndefined(rectangle, '3G|could not load icon number', iconnumber, this.iconsetid)
        );
    }

    static lookupRectangle(iconsetid: string, iconnumber: number): O<number[]> {
        let set = new RenderIconSet(iconsetid);
        return set.getRectangle(iconnumber);
    }
}

export class IconSetInfo {
    customDims: { [key: number]: number[] } = {};
    customOffsets: { [key: number]: number[] } = {};
    totalIcons = 0;
    gridsize = 1;
    gridspacing = 1;
    gridwidth = 1;
}
