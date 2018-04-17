
/* auto */ import { UI512ElementWithHighlight } from '../../ui512/elements/ui512Element.js';

/**
 * style of a button, e.g. type of border decoration
 */
export enum UI512BtnStyle {
    __isUI512Enum = 1,
    Transparent,
    Rectangle,
    Opaque,
    RoundRect,
    Plain,
    Shadow,
    OSStandard,
    OSDefault,
    OSBoxModal,
    Checkbox,
    Radio
}

/**
 * general button class, rendering logic will render anything inheriting
 * from this class as a button.
 */
export abstract class UI512ElementButtonBase extends UI512ElementWithHighlight {
    readonly typename: string = 'UI512ElementButtonBase';
    protected _style: number = UI512BtnStyle.Rectangle;
}

/**
 * the model for a UI button element
 */
export class UI512ElButton extends UI512ElementButtonBase {}
