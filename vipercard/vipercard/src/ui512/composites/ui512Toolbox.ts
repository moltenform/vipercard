
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertWarn, ensureDefined } from './../utils/util512AssertCustom';
/* auto */ import { Util512 } from './../utils/util512';
/* auto */ import { MouseUpEventDetails } from './../menu/ui512Events';
/* auto */ import { UI512Application } from './../elements/ui512ElementApp';
/* auto */ import { PalBorderDecorationConsts, UI512CompBase } from './ui512Composites';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * a "toolbox"/tool pallete
 * to use this composite,
 * create an onMouseUp listener in your presenter
 * that forwards the event to this object's respondMouseUp
 *
 * see uiDemoComposites for an example.
 */
export class UI512CompToolbox extends UI512CompBase {
    protected whichChosen: O<string>;
    protected totalHeight = 0;
    compositeType = 'toolbox';
    iconGroupId = '';
    items: [string, number][] = [];
    hasCloseBtn = true;
    iconH = 20;
    callbackOnChange: O<(id: O<string>) => void>;

    /**
     * draw UI
     */
    createSpecific(app: UI512Application) {
        Util512.freezeRecurse(this.items);
        let grp = app.getGroup(this.grpId);
        let headerHeight = this.drawWindowDecoration(
            app,
            new PalBorderDecorationConsts(),
            this.hasCloseBtn
        );

        let curX = this.x;
        let curY = this.y + headerHeight - 1;
        let marginX = -1;
        let marginY = -1;
        for (let item of this.items) {
            /* draw a button for each tool */
            let el = this.genBtn(app, grp, 'choice##' + item[0]);
            let thiswidth = this.widthOfIcon(item[0]);
            el.set('icongroupid', this.iconGroupId);
            el.set('iconnumber', item[1]);
            el.setDimensions(curX, curY, thiswidth, this.iconH);

            curX += thiswidth + marginX;
            if (curX >= this.x + this.logicalWidth + marginX) {
                /* we've gone too far to the right, make a new row */
                curX = this.x;
                curY += this.iconH + marginY;
            }
        }

        this.totalHeight = curY + this.iconH;
        this.whichChosen = this.items[0][0];
        this.refreshHighlight(app);
    }

    /**
     * returns short id of chosen tool
     */
    getWhich() {
        return ensureDefined(this.whichChosen, '2u|this.whichChosen');
    }

    /**
     * set the current tool
     */
    setWhich(app: UI512Application, subid: O<string>) {
        this.whichChosen = subid;
        this.refreshHighlight(app);
    }

    /**
     * width in pixels of each tool part
     */
    widthOfIcon(iconid: string) {
        return Math.floor(this.logicalWidth / this.items.length);
    }

    /**
     * onMouseUp, see if one of our tools was clicked
     */
    respondMouseUp(app: UI512Application, d: MouseUpEventDetails) {
        let grp = app.getGroup(this.grpId);
        if (!grp || !grp.getVisible()) {
            /* optimization for a hidden toolbox */
            return;
        }

        if (this.children.length && d.elClick) {
            let theId = d.elClick.id;
            let userId = this.fromFullId(theId);
            if (userId && userId.startsWith('choice##')) {
                userId = userId.substr('choice##'.length);
                let found = this.items.filter(o => o[0] === userId);
                if (found.length) {
                    /* it was one of ours, highlight it */
                    let wasChosenBefore = this.whichChosen;
                    this.whichChosen = found[0][0];
                    this.refreshHighlight(app);
                    if (this.callbackOnChange && wasChosenBefore !== this.whichChosen) {
                        this.callbackOnChange(this.whichChosen);
                    }
                } else {
                    assertWarn(false, `2t|did not find ${userId} in ${this.idPrefix}`);
                }
            }
        }
    }

    /**
     * refresh our UI as to which tool is active
     */
    protected refreshHighlight(app: UI512Application) {
        let grp = app.getGroup(this.grpId);
        let lookfor = this.whichChosen;
        for (let item of this.items) {
            let id = this.getElId('choice##' + item[0]);
            let el = grp.getEl(id);
            el.set('highlightactive', item[0] === lookfor);
            el.set('autohighlight', item[0] !== lookfor);
        }
    }
}
