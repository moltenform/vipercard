
/* auto */ import { RenderComplete, Root, cast } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { IconInfo } from '../../ui512/draw/ui512drawiconclasses.js';
/* auto */ import { RenderIconManager } from '../../ui512/draw/ui512drawicon.js';

export class DissolveImages {
    readonly iconset = 'fordissolvet';
    readonly countstages = 12;
    blendAtStage(root: Root, c1: CanvasWrapper, c2: CanvasWrapper, stage: number, comp: RenderComplete) {
        // note: is destructive to c2,
        // changes written to c1
        if (stage <= 0) {
            return;
        }

        // const iconnumber = stage - 1
        const iconnumber = 12;
        let iconManager = cast(root.getIconManager(), RenderIconManager);
        let icon = iconManager.findIcon(this.iconset, iconnumber);
        if (!icon) {
            comp.complete = false;
            return;
        }

        let info = new IconInfo(this.iconset, iconnumber);
        info.iconcentered = false;
        const tilew = icon.srcrect[2];
        const tileh = icon.srcrect[3];

        try {
            c2.context.globalCompositeOperation = 'destination-in';
            for (let tiley = 0; tiley < Math.ceil(c2.canvas.height / tileh); tiley++) {
                for (let tilex = 0; tilex < Math.ceil(c2.canvas.width / tilew); tilex++) {
                    let destx = tilex * tilew;
                    let desty = tiley * tileh;
                    icon.drawIntoBox(c2, info, destx, desty, tilex, tiley);
                }
            }
        } finally {
            // don't leave the context drawing in the destination-in mode
            c2.context.globalCompositeOperation = 'source-over';
        }

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
