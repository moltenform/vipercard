
/* auto */ import { Util512, cast } from './../utils/util512';
/* auto */ import { MouseUpEventDetails } from './../menu/ui512Events';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../elements/ui512ElementApp';
/* auto */ import { UI512CompBase } from './ui512Composites';
/* auto */ import { lng } from './../lang/langBase';

/**
 * if isExclusive, a group of mutually exclusive radio buttons
 * if not isExclusive, a group of checkboxes
 * to use this composite,
 * create an onMouseUp listener in your presenter
 * that forwards the event to this object's listenMouseUp
 *
 * see uiDemoComposites for an example.
 */
export class UI512CompButtonGroup extends UI512CompBase {
    items: [string, string][] = [];
    isExclusive = false;
    itemMargin = 5;
    itemHeight = 20;
    compositeType = 'buttongroup';

    /**
     * draw UI
     */
    createSpecific(app: UI512Application) {
        Util512.freezeRecurse(this.items);
        let grp = app.getGroup(this.grpId);
        let curY = this.y;
        for (let item of this.items) {
            /* create a button for each item */
            let el = this.genBtn(app, grp, item[0]);
            el.set(
                'style',
                this.isExclusive ? UI512BtnStyle.Radio : UI512BtnStyle.Checkbox
            );
            el.set('labelhalign', false);
            el.set('labelvalign', true);
            el.setDimensions(this.x, curY, this.logicalWidth, this.itemHeight);
            let translated = lng(item[1]);
            el.set('labeltext', translated);
            curY += this.itemHeight + this.itemMargin;
        }
    }

    /**
     * returns short id of the chosen item(s), or empty array
     */
    getWhichChecked(app: UI512Application) {
        let ret: string[] = [];
        let grp = app.getGroup(this.grpId);
        for (let item of this.items) {
            let el = grp.getEl(this.getElId(item[0]));
            let btn = cast(UI512ElButton, el);
            if (btn.getB('checkmark')) {
                ret.push(item[0]);
            }
        }

        return ret;
    }

    /**
     * choose an item
     */
    setWhichChecked(app: UI512Application, idlist: string[]) {
        let grp = app.getGroup(this.grpId);
        for (let item of this.items) {
            let el = grp.getEl(this.getElId(item[0]));
            let shouldCheck = idlist.indexOf(item[0]) !== -1;
            el.set('checkmark', shouldCheck);
        }
    }

    /**
     * onMouseUp, see if one of our elements was clicked on
     */
    respondMouseUp(app: UI512Application, d: MouseUpEventDetails) {
        if (!this.children.length) {
            return;
        }

        if (d.elClick && this.isExclusive) {
            let userId = this.fromFullId(d.elClick.id);
            if (userId) {
                this.setWhichChecked(app, [userId]);
            }
        } else if (d.elClick) {
            let userId = this.fromFullId(d.elClick.id);
            if (userId) {
                d.elClick.set('checkmark', !d.elClick.getB('checkmark'));
            }
        }
    }
}
