
/* auto */ import { ElementObserver, elementObserverDefault } from './ui512ElementGettable';
/* auto */ import { UI512ElementWithText } from './ui512Element';

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
