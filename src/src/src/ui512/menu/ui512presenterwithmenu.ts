
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512PresenterInterface } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512elementstextfield.js';
/* auto */ import { EventDetails } from '../../ui512/menu/ui512events.js';

export interface UI512PresenterWithMenuInterface extends UI512PresenterInterface {
    app: UI512Application;

    rawEvent(root: Root, d: EventDetails): void;
    canInteract(el: O<UI512Element>): boolean;
    canSelectTextInField(el: O<UI512ElTextField>): boolean;
}
