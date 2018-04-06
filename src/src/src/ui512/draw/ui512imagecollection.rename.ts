
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';

export class UI512ImageCollectionCollection {
    children: UI512ImageCollection[] = [];
}

export class UI512ImageCollection {
    children: UI512ImageCollectionImage[] = [];
    suffix = '.png';
    readonly url = '/resources/images/stamps/';
    constructor(public id: string, public name: string) {}
    genChildren(largestNumber: number) {
        for (let i = 1; i <= largestNumber; i++) {
            let id = i.toString();
            id = id.length === 2 ? id : '0' + id;
            let name = 'lng' + i.toString();
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
        assertTrue(this.parent.id.match(/^[a-z]+$/), '');
        return this.parent.url + this.parent.id + '/' + this.id + this.parent.suffix;
    }
}
