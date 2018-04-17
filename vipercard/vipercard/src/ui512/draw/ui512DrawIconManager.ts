
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512IsDrawIconInterface, Util512 } from '../../ui512/utils/utils512.js';
/* auto */ import { RenderIcon, RenderIconGroup } from '../../ui512/draw/ui512DrawIconClasses.js';

/**
 * main icon class.
 * give it a group id and number,
 * and get back a RenderIcon that can be drawn on a canvas.
 */
export class UI512IconManager implements UI512IsDrawIconInterface {
    cachedIconGroups: { [key: string]: RenderIconGroup } = {};

    findIcon(iconGroupId: string, iconNumber: number): O<RenderIcon> {
        let cached = this.cachedIconGroups[iconGroupId];
        if (cached === undefined) {
            /* case 1) we haven't started loading this group yet. */
            assertTrue(iconGroupId.match(/^[0-9a-z_]+$/), `3F|icongroupid must be alphanumeric but got ${iconGroupId}`);
            let iconGroup = new RenderIconGroup(iconGroupId);
            this.cachedIconGroups[iconGroupId] = iconGroup;
            let url = `/resources/images/${iconGroupId}.png`;
            iconGroup.image = new Image();
            Util512.beginLoadImage(url, iconGroup.image, () => {
                iconGroup.loadedImage = true;
            });

            return undefined;
        } else {
            if (!cached.loadedImage) {
                /* case 2) we need to wait for the icon group to load. */
                return undefined;
            } else {
                /* case 3) it's loaded and ready to use */
                return cached.getIcon(iconNumber);
            }
        }
    }
}
