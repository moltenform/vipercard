
/* auto */ import { RenderComplete, cast, getRoot } from '../../ui512/utils/utils512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { IconInfo } from '../../ui512/draw/ui512DrawIconClasses.js';
/* auto */ import { UI512IconManager } from '../../ui512/draw/ui512DrawIconManager.js';

/**
 * dissolve from one image to another
 * we can cleverly use composition modes to do this very efficiently.
 */
export class UI512ImageDissolve {
    readonly iconGroup = 'fordissolvet';
    readonly countstages = 12;
    blendAtStage(c1: CanvasWrapper, c2: CanvasWrapper, stage: number, comp: RenderComplete) {
        /* note: is destructive to c2, */
        /* changes written to c1 */
        if (stage <= 0) {
            return;
        }

        const iconnumber = 12; /* stage - 1 */
        let iconManager = cast(getRoot().getDrawIcon(), UI512IconManager);
        let icon = iconManager.findIcon(this.iconGroup, iconnumber);
        if (!icon) {
            comp.complete = false;
            return;
        }

        let info = new IconInfo(this.iconGroup, iconnumber);
        info.centered = false;
        const tileW = icon.srcRect[2];
        const tileH = icon.srcRect[3];

        c2.temporarilyChangeCompositeMode('destination-in', () => {
            c2.context.globalCompositeOperation = 'destination-in';
            for (let tileY = 0; tileY < Math.ceil(c2.canvas.height / tileH); tileY++) {
                for (let tileX = 0; tileX < Math.ceil(c2.canvas.width / tileW); tileX++) {
                    let destX = tileX * tileW;
                    let destY = tileY * tileH;
                    icon!.drawIntoBox(c2, info, destX, destY, tileX, tileY);
                }
            }
        });

        c1.drawFromImage(
            c2.canvas,
            0,
            0,
            c2.canvas.width,
            c2.canvas.height,
            0,
            0,
            0,
            0,
            c1.canvas.width,
            c1.canvas.height
        );
    }
}
