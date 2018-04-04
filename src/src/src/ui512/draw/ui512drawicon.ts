
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { IIconManager, Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { RenderIcon, RenderIconSet } from '../../ui512/draw/ui512drawiconclasses.js';

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
