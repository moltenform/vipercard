
/* auto */ import { ElementObserver, elementObserverDefault } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { UI512ElementWithText } from '../../ui512/elements/ui512Element.js';

/**
 * the model for a UI label element
 */
export class UI512ElLabel extends UI512ElementWithText {
    readonly typename: string = 'UI512ElLabel';
    protected _transparentExceptChars = false;
    constructor(idString: string, labeltext = '', observer: ElementObserver = elementObserverDefault) {
        super(idString, observer);
        this._labeltext = labeltext;
        this._labelvalign = false;
        this._labelhalign = false;
    }
}
