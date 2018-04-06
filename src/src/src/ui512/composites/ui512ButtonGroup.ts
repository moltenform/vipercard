
/* auto */ import { Util512, cast } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512CompBase } from '../../ui512/composites/ui512Composites.js';

export class UI512CompRadioButtonGroup extends UI512CompBase {
    items: [string, string][] = [['circle', 'lngCircle'], ['rectangle', 'lngRectangle']];
    isExclusive = false;
    elemymargin = 5;
    elemheight = 20;
    compositeType = 'buttongroup';

    createSpecific(app: UI512Application) {
        Util512.freezeRecurse(this.items);
        let grp = app.getGroup(this.grpid);
        let cury = this.y;
        for (let item of this.items) {
            let el = this.genBtn(app, grp, item[0]);
            el.set('style', this.isExclusive ? UI512BtnStyle.radio : UI512BtnStyle.checkbox);
            el.set('labelhalign', false);
            el.set('labelvalign', true);
            el.setDimensions(this.x, cury, this.logicalWidth, this.elemheight);
            let translated = lng(item[1]);
            el.set('labeltext', translated);
            cury += this.elemheight + this.elemymargin;
        }
    }

    getWhichChecked(app: UI512Application) {
        let ret = [];
        let grp = app.getGroup(this.grpid);
        for (let item of this.items) {
            let el = grp.getEl(this.getElId(item[0]));
            let btn = cast(el, UI512ElButton);
            if (btn.get_b('checkmark')) {
                ret.push(item[0]);
            }
        }

        return ret;
    }

    setWhichChecked(app: UI512Application, idlist: string[]) {
        let grp = app.getGroup(this.grpid);
        for (let item of this.items) {
            let el = grp.getEl(this.getElId(item[0]));
            let shouldcheck = idlist.indexOf(item[0]) !== -1;
            el.set('checkmark', shouldcheck);
        }
    }

    listenMouseUp(app: UI512Application, d: MouseUpEventDetails) {
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
                d.elClick.set('checkmark', !d.elClick.get_b('checkmark'));
            }
        }
    }
}
