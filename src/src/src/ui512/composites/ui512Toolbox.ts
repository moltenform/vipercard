
/* auto */ import { O, assertTrueWarn, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { PalBorderDecorationConsts, UI512CompBase } from '../../ui512/composites/ui512Composites.js';

export class UI512CompToolbox extends UI512CompBase {
    protected whichChosen: O<string>;
    compositeType = 'toolbox';
    iconsetid = '';
    items: [string, number][] = [['circle', 23 /*iconnumber*/], ['rectangle', 24 /*iconnumber*/]];
    hasclosebtn = true;
    headerh = 10;
    iconh = 20;
    callbackOnChange: O<(id: O<string>) => void>;
    protected totalheight = 0;

    widthOfIcon(iconid: string) {
        return Math.floor(this.logicalWidth / this.items.length);
    }

    createSpecific(app: UI512Application) {
        Util512.freezeRecurse(this.items);
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawWindowDecoration(app, new PalBorderDecorationConsts(), this.hasclosebtn);

        let curx = this.x;
        let cury = this.y + headerheight - 1;
        let marginx = -1;
        let marginy = -1;
        for (let item of this.items) {
            let el = this.genBtn(app, grp, 'choice##' + item[0]);
            let thiswidth = this.widthOfIcon(item[0]);
            el.set('iconsetid', this.iconsetid);
            el.set('iconnumber', item[1]);
            el.setDimensions(curx, cury, thiswidth, this.iconh);

            curx += thiswidth + marginx;
            if (curx >= this.x + this.logicalWidth + marginx) {
                curx = this.x;
                cury += this.iconh + marginy;
            }
        }

        this.totalheight = cury + this.iconh;
        this.whichChosen = this.items[0][0];
        this.refreshHighlight(app);
    }

    getWhich() {
        return throwIfUndefined(this.whichChosen, '2u|this.whichChosen');
    }

    setWhich(app: UI512Application, subid: O<string>) {
        this.whichChosen = subid;
        this.refreshHighlight(app);
    }

    listenMouseUp(app: UI512Application, d: MouseUpEventDetails) {
        let grp = app.getGroup(this.grpid);
        if (!grp || !grp.getVisible()) {
            // optimization for a hidden toolbox
            return;
        }

        if (this.children.length && d.elClick) {
            let theId = d.elClick.id;
            let userId = this.fromFullId(theId);
            if (userId && userId.startsWith('choice##')) {
                userId = userId.substr('choice##'.length);
                let found = this.items.filter(o => o[0] === userId);
                if (found.length) {
                    let wasChosenBefore = this.whichChosen;
                    this.whichChosen = found[0][0];
                    this.refreshHighlight(app);
                    if (this.callbackOnChange && wasChosenBefore !== this.whichChosen) {
                        this.callbackOnChange(this.whichChosen);
                    }
                } else {
                    assertTrueWarn(false, `2t|did not find ${userId} in ${this.idprefix}`);
                }
            }
        }
    }

    changeIcon(app: UI512Application, shortid: string, iconnumber: number) {
        let grp = app.getGroup(this.grpid);
        let el = grp.findEl(this.getElId(shortid));
        if (el) {
            el.set('iconnumber', iconnumber);
        }
    }

    protected refreshHighlight(app: UI512Application) {
        let grp = app.getGroup(this.grpid);
        let lookfor = this.whichChosen;
        for (let item of this.items) {
            let id = this.getElId('choice##' + item[0]);
            let el = grp.getEl(id);
            el.set('highlightactive', item[0] === lookfor);
            el.set('autohighlight', item[0] !== lookfor);
        }
    }
}
