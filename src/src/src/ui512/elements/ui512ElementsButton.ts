
/* auto */ import { UI512Element, UI512ElementWithHighlight } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';

export enum UI512BtnStyle {
    __isUI512Enum = 1,
    Transparent,
    Rectangle,
    Opaque,
    RoundRect,
    Plain,
    Shadow,
    OSStandard,
    OSDefault,
    OSBoxModal,
    Checkbox,
    Radio,
}

export abstract class UI512ElementButtonGeneral extends UI512ElementWithHighlight {
    readonly typeName: string = 'UI512ElementButtonGeneral';
    protected _style: number = UI512BtnStyle.Rectangle;
}

export class UI512ElButton extends UI512ElementButtonGeneral {}

export class GridLayout<RowType, ColType> {
    constructor(
        public basex: number,
        public basey: number,
        public itemw: number,
        public itemh: number,
        public cols: ColType[],
        public rows: RowType[],
        public marginx: number,
        public marginy: number
    ) {}

    getColWidth() {
        return this.itemw + this.marginx;
    }

    getRowHeight() {
        return this.itemh + this.marginy;
    }

    getTotalWidth() {
        return this.getColWidth() * this.cols.length;
    }

    getTotalHeight() {
        return this.getRowHeight() * this.rows.length;
    }

    boundsForNumber(numx: number, numy: number) {
        return [
            this.basex + numx * (this.itemw + this.marginx),
            this.basey + numy * (this.itemh + this.marginy),
            this.itemw,
            this.itemh,
        ];
    }

    combinations(fn: (n: number, a: ColType, b: RowType, bnds: number[]) => void) {
        let count = 0;
        for (let yy = 0; yy < this.rows.length; yy++) {
            for (let xx = 0; xx < this.cols.length; xx++) {
                let bnds = this.boundsForNumber(xx, yy);
                fn(count, this.cols[xx], this.rows[yy], bnds);
                count += 1;
            }
        }
    }

    createElems<T extends UI512Element>(
        app: UI512Application,
        grp: UI512ElGroup,
        idprefix: string,
        ctor: { new (...args: any[]): T },
        fn: (a: ColType, b: RowType, el: T) => void,
        nameBasedOnCol = false,
        labelBasedOnCol = false
    ) {
        this.combinations((n, a, b, bnds) => {
            let cellName = typeof a === 'string' ? a : b;
            let id = nameBasedOnCol ? `${idprefix}${cellName}` : `${idprefix}_${n}`;
            let el = new ctor(id);
            grp.addElement(app, el);
            el.setDimensions(bnds[0], bnds[1], bnds[2], bnds[3]);
            fn(a, b, el);

            if (labelBasedOnCol) {
                el.set('labeltext', cellName.toString().toLowerCase());
            }
        });
    }
}
