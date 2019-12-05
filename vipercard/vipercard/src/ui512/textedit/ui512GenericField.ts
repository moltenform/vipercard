
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementTextField.js';

/**
 * IGenericTextField, a generic text-field-like object.
 *
 * let's say you are typing on the keyboard to insert a letter into the text field.
 * if this is a UI512 text field, we can directly insert the letter.
 * but if it is a ViperCard text field,
 * we need to update the _VpcElField_ model first, for undoability,
 * and let modelrender insert the letter into the field.
 */
export interface GenericTextField {
    setFmtTxt(newTxt: FormattedText, context: ChangeContext): void;
    getFmtTxt(): FormattedText;
    canEdit(): boolean;
    canSelectText(): boolean;
    isMultiline(): boolean;
    setSel(a: number, b: number): void;
    getSel(): [number, number];
    getID(): string;
    getHeight(): number;
    getDefaultFont(): string;
    getReadOnlyUI512(): UI512ElTextField;
    getScrollAmt(): number;
    setScrollAmt(n: O<number>): void;
}

/**
 * GenericTextField wrapping a normal UI512ElTextField
 */
export class UI512ElTextFieldAsGeneric implements GenericTextField {
    constructor(protected el: UI512ElTextField) {}
    setFmtTxt(newTxt: FormattedText, context: ChangeContext) {
        this.el.setFmTxt(newTxt, context);
    }

    getFmtTxt(): FormattedText {
        return this.el.getFmTxt();
    }

    canEdit() {
        return this.el.getB('canedit');
    }

    canSelectText(): boolean {
        return this.el.getB('canselecttext');
    }

    isMultiline(): boolean {
        return this.el.getB('multiline');
    }

    setSel(a: number, b: number): void {
        this.el.set('selcaret', a);
        this.el.set('selend', b);
    }

    getSel(): [number, number] {
        return [this.el.getN('selcaret'), this.el.getN('selend')];
    }

    getID(): string {
        return this.el.id;
    }

    getHeight(): number {
        return this.el.h;
    }

    getDefaultFont(): string {
        return this.el.getS('defaultFont');
    }

    getReadOnlyUI512(): UI512ElTextField {
        return this.el;
    }

    getScrollAmt(): number {
        return this.el.getN('scrollamt');
    }

    setScrollAmt(n: O<number>): void {
        if (n !== undefined && n !== null) {
            return this.el.set('scrollamt', n);
        }
    }
}
