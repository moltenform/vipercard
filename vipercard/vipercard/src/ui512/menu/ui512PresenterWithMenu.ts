
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { UI512PresenterInterface } from './../draw/ui512Interfaces';
/* auto */ import { EventDetails } from './ui512Events';
/* auto */ import { UI512ElTextField } from './../elements/ui512ElementTextField';
/* auto */ import { UI512Application } from './../elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../elements/ui512Element';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * forward-declare more of the Presenter class
 */
export interface UI512PresenterWithMenuInterface extends UI512PresenterInterface {
    app: UI512Application;

    rawEventCanThrow(d: EventDetails): void;
    canInteract(el: O<UI512Element>): boolean;
    canSelectTextInField(el: O<UI512ElTextField>): boolean;
    queueRefreshCursor(): void;
}
