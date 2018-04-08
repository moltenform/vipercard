
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';

/**
 * an array of UI512ImageCollections.
 */
export class UI512ImageCollectionCollection {
    children: UI512ImageCollection[] = [];
}

/**
 * an array of cached images.
 */
export class UI512ImageCollection {
    children: UI512ImageCollectionImage[] = [];
    suffix = '.png';
    constructor(public id: string, public name: string, public readonly url:string) {}
    genChildren(largestNumber: number) {
        for (let i = 1; i <= largestNumber; i++) {
            let id = Util512.padStart(i, 2, '0')
            let name = 'lng' + i.toString();
            this.children.push(new UI512ImageCollectionImage(id, name));
            this.children[this.children.length - 1].parent = this;
        }
    }
}

/**
 * a cached image.
 * three possible states
 * 1) image is completely unloaded (!image && !loaded)
 * 2) image is waiting for download (image && !loaded)
 * 3) image is ready to use (image && loaded)
 */
export class UI512ImageCollectionImage {
    constructor(public id: string, public name: string) {}
    parent: UI512ImageCollection;
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
        assertTrue(this.parent.id.match(/^[a-z]+$/), '');
        return this.parent.url + this.parent.id + '/' + this.id + this.parent.suffix;
    }
}
