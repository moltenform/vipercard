
/* auto */ import { ElementObserver, elementObserverDefault } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { UI512ElementWithText } from '../../ui512/elements/ui512ElementsBase.js';

export class UI512ElLabel extends UI512ElementWithText {
    readonly typeName: string = 'UI512ElLabel';
    protected _transparentExceptChars = false;
    constructor(idString: string, labeltext = '', observer: ElementObserver = elementObserverDefault) {
        super(idString, observer);
        this._labeltext = labeltext;
        this._labelvalign = false;
        this._labelhalign = false;
    }
}
