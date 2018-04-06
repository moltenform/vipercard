
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementsTextField.js';

/*
use a generic field-like object
when inside vipercard, modifies the vel (vipercard element)
when inside ui512, modifies the ui512 element

for example, when you type the right arrow key in a vipercard element,
we need to apply the change to the vipercard model.
vpcmodelrender will then echo the change to the actual backing ui512 element.
necessary because otherwise we wouldn't get undo-ability or script visibility.

*/

export interface IGenericTextField {
    setftxt(newtxt: FormattedText, context: ChangeContext): void;
    getftxt(): FormattedText;
    canEdit(): boolean;
    canSelectText(): boolean;
    isMultiline(): boolean;
    setSel(a: number, b: number): void;
    getSel(): [number, number];
    identifier(): string;
    getHeight(): number;
    getDefaultFont(): string;
    getReadonlyUi512(): UI512ElTextField;
    getScrollAmt(): number;
    setScrollAmt(n: O<number>): void;
}

export class UI512ElTextFieldAsGeneric implements IGenericTextField {
    constructor(protected impl: UI512ElTextField) {}
    setftxt(newtxt: FormattedText, context: ChangeContext) {
        this.impl.setftxt(newtxt, context);
    }
    getftxt(): FormattedText {
        return this.impl.get_ftxt();
    }
    canEdit() {
        return this.impl.get_b('canedit');
    }
    canSelectText(): boolean {
        return this.impl.get_b('canselecttext');
    }
    isMultiline(): boolean {
        return this.impl.get_b('multiline');
    }
    setSel(a: number, b: number): void {
        this.impl.set('selcaret', a);
        this.impl.set('selend', b);
    }
    getSel(): [number, number] {
        return [this.impl.get_n('selcaret'), this.impl.get_n('selend')];
    }
    identifier(): string {
        return this.impl.id;
    }
    getHeight(): number {
        return this.impl.h;
    }
    getDefaultFont(): string {
        return this.impl.get_s('defaultFont');
    }
    getReadonlyUi512(): UI512ElTextField {
        return this.impl;
    }
    getScrollAmt(): number {
        return this.impl.get_n('scrollamt');
    }
    setScrollAmt(n: O<number>): void {
        if (n !== undefined && n !== null) {
            return this.impl.set('scrollamt', n);
        }
    }
}
