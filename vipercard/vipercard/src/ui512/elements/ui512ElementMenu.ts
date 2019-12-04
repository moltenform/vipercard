
/* auto */ import { ElementObserver, elementObserverDefault } from './ui512ElementGettable';
/* auto */ import { UI512BtnStyle, UI512ElementButtonBase } from './ui512ElementButton';
/* auto */ import { UI512Application } from './ui512ElementApp';
/* auto */ import { UI512Element } from './ui512Element';

/**
 * the model for a UI menu item
 * you can use specialCharCmdSymbol in the hotkey to make the symbol.
 */
export class UI512MenuItem extends UI512Element {
    readonly typename: string = 'UI512MenuItem';
    protected _highlightactive = false;
    protected _labeltext = '';
    protected _labelhotkey = '';
    protected _checkmark = false;
    protected _enabled = true;
}

/**
 * the model for a UI menu drop-down
 */
export class UI512MenuDropdown extends UI512ElementButtonBase {
    protected _labeltext = '';
    protected _fixedoffset = -1;
    protected _fixedwidth = -1;
    protected _style: number = UI512BtnStyle.Transparent;
    protected _autohighlight = true;
    protected _icongroupid = '';
    protected _iconnumber = -1;

    /* list of item ids separated by | */
    protected _childids = '';

    constructor(idString: string, observer: ElementObserver = elementObserverDefault) {
        super(idString, observer);
        this._style = UI512BtnStyle.Transparent;
        this._autohighlight = false;
    }

    getChildren(app: UI512Application) {
        return idsToList<UI512MenuItem>(app, this._childids, '$$grpmenuitems');
    }
}

/**
 * the model for a UI menu root element
 */
export class UI512MenuRoot extends UI512Element {
    readonly typename: string = 'UI512MenuRoot';
    protected _whichIsExpanded = -1;

    /* list of item ids separated by | */
    protected _childids = '';

    getchildren(app: UI512Application) {
        return idsToList<UI512MenuDropdown>(app, this._childids, '$$grpmenubar');
    }
}

/**
 * calls getElByID on a list of ids.
 */
function idsToList<T extends UI512Element>(app: UI512Application, childIds: string, grpId: string): T[] {
    let list = childIds.split('|');
    if (list.length) {
        let grp = app.getGroup(grpId);
        return list.map(s => grp.getEl(s) as T);
    } else {
        return [];
    }
}
