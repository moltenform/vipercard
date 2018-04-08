
/* auto */ import { ElementObserver, elementObserverDefault } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512BtnStyle, UI512ElementButtonGeneral } from '../../ui512/elements/ui512ElementsButton.js';

function idstolist<T extends UI512Element>(app: UI512Application, grpname: string, childids: string): T[] {
    let list = childids.split('|');
    if (list.length) {
        let grp = app.getGroup(grpname);
        return list.map(s => grp.getEl(s) as T);
    } else {
        return [];
    }
}

export class UI512MenuItem extends UI512Element {
    readonly typeName: string = 'UI512MenuItem';
    protected _highlightactive = false;
    protected _labeltext = '';
    protected _labelhotkey = '';
    protected _checkmark = false;
    protected _enabled = true;
}

export class UI512MenuRoot extends UI512Element {
    readonly typeName: string = 'UI512MenuRoot';
    protected _whichIsExpanded = -1;
    protected _childids = ''; // list of item ids separated by |
    getchildren(app: UI512Application) {
        return idstolist<UI512MenuDropdown>(app, '$$grpmenubar', this._childids);
    }
}

export class UI512MenuDropdown extends UI512ElementButtonGeneral {
    /* _labeltext, _icongroupid, _iconnumber */
    protected _labeltext = '';
    protected _childids = ''; // list of item ids separated by |
    protected _fixedoffset = -1;
    protected _fixedwidth = -1;
    protected _icongroupid = '';
    protected _iconnumber = -1;
    protected _style: number = UI512BtnStyle.Transparent;
    protected _autohighlight = true;

    constructor(idString: string, observer: ElementObserver = elementObserverDefault) {
        super(idString, observer);
        this._style = UI512BtnStyle.Transparent;
        this._autohighlight = false;
    }

    getchildren(app: UI512Application) {
        return idstolist<UI512MenuItem>(app, '$$grpmenuitems', this._childids);
    }
}
