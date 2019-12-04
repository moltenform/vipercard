
/* auto */ import { CanvasWrapper, DrawableImage } from './../utils/utilsCanvasDraw';
/* auto */ import { O, assertTrue, throwIfUndefined } from './../utils/util512Assert';

/**
 * arguments for drawing icon into a box
 */
export class IconInfo {
    adjustX = 0;
    adjustY = 0;
    adjustWidth = 0;
    adjustHeight = 0;
    adjustSrcX = 0;
    adjustSrcY = 0;
    centered = true;
    constructor(public iconGroup: string, public iconNumber: number) {}
}

/**
 * drawing an icon into box
 */
export class RenderIcon {
    constructor(public set: RenderIconGroup, public srcRect: number[]) {}
    drawIntoBox(
        canvas: CanvasWrapper,
        info: IconInfo,
        boxX0: number,
        boxY0: number,
        boxW: number,
        boxH: number
    ) {
        let srcRect = [
            this.srcRect[0] + info.adjustSrcX,
            this.srcRect[1] + info.adjustSrcY,
            this.srcRect[2] + info.adjustWidth - info.adjustSrcX,
            this.srcRect[3] + info.adjustHeight - info.adjustSrcY
        ];

        if (info.centered) {
            canvas.drawFromImageCentered(
                this.set.image,
                srcRect[0],
                srcRect[1],
                srcRect[2],
                srcRect[3],
                info.adjustX,
                info.adjustY,
                boxX0,
                boxY0,
                boxW,
                boxH
            );
        } else {
            canvas.drawFromImage(
                this.set.image,
                srcRect[0],
                srcRect[1],
                srcRect[2],
                srcRect[3],
                boxX0 + info.adjustX,
                boxY0 + info.adjustY,
                boxX0,
                boxY0,
                boxW,
                boxH
            );
        }
    }
}

/**
 * a group of cached icons.
 * each group is one .png file on the server.
 */
export class RenderIconGroup {
    image: DrawableImage;
    loadedImage = false;
    customDims: { [key: number]: number[] } = {};
    customOffsets: { [key: number]: number[] } = {};
    totalIcons = 0;
    gridSize = 1;
    gridSpacing = 1;
    gridWidth = 1;

    /* a map from group id to IconGroupInfo */
    static cachedGridInfo: { [groupId: string]: IconGroupInfo } = {};

    /* initialize from the cached IconGroupInfo information */
    constructor(public readonly groupId: string) {
        let info = RenderIconGroup.cachedGridInfo[groupId];
        assertTrue(info, '3I|unknown icon set', groupId);
        if (info) {
            this.customDims = info.customDims;
            this.customOffsets = info.customOffsets;
            this.gridSize = info.gridSize;
            this.gridSpacing = info.gridSpacing;
            this.gridWidth = info.gridWidth;
            this.totalIcons = info.totalIcons;
        }
    }

    /* eslint no-mixed-operators: 0 */

    /* get source rectangle */
    getRectangle(iconNumber: number) {
        if (iconNumber < 0 || iconNumber >= this.totalIcons) {
            return undefined;
        }

        /* srcX and srcY can either be manually set in customOffsets,
        or computed assuming that icons are laid out in a grid */
        let offsets = this.customOffsets[iconNumber];
        if (offsets === undefined) {
            let gridY = Math.trunc(iconNumber / this.gridWidth);
            let gridX = iconNumber - gridY * this.gridWidth;
            offsets = [
                gridX * this.gridSize + (gridX + 1) * this.gridSpacing,
                gridY * this.gridSize + (gridY + 1) * this.gridSpacing
            ];
        }

        /* width and height can either be manually set in customDims,
        or computed assuming that icons are laid out in a grid */
        let dims = this.customDims[iconNumber];
        if (dims === undefined) {
            dims = [this.gridSize, this.gridSize];
        }

        return [offsets[0], offsets[1], dims[0], dims[1]];
    }

    /* get icon, throws if not found */
    getIcon(iconNumber: number): RenderIcon {
        let rect = this.getRectangle(iconNumber);
        return new RenderIcon(
            this,
            throwIfUndefined(
                rect,
                '3G|could not load icon number',
                iconNumber,
                this.groupId
            )
        );
    }

    /* get icon, return undefined if not found  */
    static lookupRectangle(iconGroupId: string, iconNumber: number): O<number[]> {
        let group = new RenderIconGroup(iconGroupId);
        return group.getRectangle(iconNumber);
    }
}

/**
 * by default, icons are arranged in a grid.
 * you can use customDims and customOffsets to specify arbitrary positions for the icons.
 */
export class IconGroupInfo {
    customDims: { [key: number]: number[] } = {};
    customOffsets: { [key: number]: number[] } = {};
    totalIcons = 0;
    gridSize = 1;
    gridSpacing = 1;
    gridWidth = 1;
}
