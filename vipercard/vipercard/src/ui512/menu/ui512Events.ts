
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root, UI512IsEventInterface } from '../../ui512/utils/utils512.js';
/* auto */ import { ModifierKeys, toShortcutString } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';

/**
 * event details base class
 */
export abstract class EventDetails {
    isEventDetails = true;
    protected _handled = false;
    constructor() {}

    abstract type(): UI512EventType;

    handled() {
        return this._handled;
    }

    setHandled() {
        this._handled = true;
    }

    getAffectedElements(): UI512Element[] {
        return [];
    }
}

/**
 * key event base class
 */
export abstract class KeyEventDetails extends EventDetails {
    isKeyEventDetails = true;
    constructor(
        public readonly timestamp: number,
        public readonly keyCode: string,
        public readonly keyChar: string,
        public readonly repeated: boolean,
        public readonly mods: ModifierKeys
    ) {
        super();
    }
}

/**
 * mouse event base class
 */
export abstract class MouseEventDetails extends EventDetails {
    isMouseEventDetails = true;
    constructor(
        public readonly timestamp: number,
        public mouseX: number,
        public mouseY: number,
        public button: number,
        public mods: ModifierKeys
    ) {
        super();
    }
}

/**
 * mouse move details
 * elPrev and elNext aren't set here,
 * but will optionally be filled in by a listener
 */
export class MouseMoveEventDetails extends EventDetails {
    isMouseMoveEventDetails = true;
    elPrev: O<UI512Element>;
    elNext: O<UI512Element>;
    constructor(
        public readonly timestamp: number,
        public mouseX: number,
        public mouseY: number,
        public prevMouseX: number,
        public prevMouseY: number
    ) {
        super();
    }

    type() {
        return UI512EventType.MouseMove;
    }

    getAffectedElements(): UI512Element[] {
        let ret = [];
        if (this.elPrev) {
            ret.push(this.elPrev);
        }
        if (this.elNext) {
            ret.push(this.elNext);
        }
        return ret;
    }
}

/**
 * "idle" event. always firing, several times a second.
 */
export class IdleEventDetails extends EventDetails {
    isIdleEventDetails = true;
    constructor(public readonly milliseconds: number) {
        super();
    }

    type() {
        return UI512EventType.Idle;
    }
}

/**
 * mouse enter details.
 * event not sent directly by Root, but as a consequence of mousemove
 */
export class MouseEnterDetails extends EventDetails {
    isMouseEnterDetails = true;
    constructor(public el: UI512Element) {
        super();
    }

    type() {
        return UI512EventType.MouseEnter;
    }

    getAffectedElements(): UI512Element[] {
        let ret = [];
        if (this.el) {
            ret.push(this.el);
        }
        return ret;
    }
}

/**
 * mouse leave details
 * event not sent directly by Root, but as a consequence of mousemove
 */
export class MouseLeaveDetails extends EventDetails {
    isMouseLeaveDetails = true;
    constructor(public el: UI512Element) {
        super();
    }

    type() {
        return UI512EventType.MouseLeave;
    }

    getAffectedElements(): UI512Element[] {
        let ret = [];
        if (this.el) {
            ret.push(this.el);
        }
        return ret;
    }
}

/**
 * menu item clicked
 * don't use a button's mouseup event for this, it's kind of different
 * because the mouseup event should fire right after user releases mouse,
 * whereas menuitem event is fired after a few seconds because of the menuitem animation.
 */
export class MenuItemClickedDetails extends EventDetails {
    isMenuItemClickedDetails = true;
    constructor(public readonly id: string, public readonly mods: ModifierKeys) {
        super();
    }

    type() {
        return UI512EventType.MenuItemClicked;
    }
}

/**
 * key up event
 */
export class KeyUpEventDetails extends KeyEventDetails {
    isKeyUpEventDetails = true;

    type() {
        return UI512EventType.KeyUp;
    }
}

/**
 * key down event
 */
export class KeyDownEventDetails extends KeyEventDetails {
    isKeyDownEventDetails = true;
    readonly readableShortcut: string;
    constructor(timestamp: number, keyCode: string, keyChar: string, repeated: boolean, mods: ModifierKeys) {
        super(timestamp, keyCode, keyChar, repeated, mods);
        this.readableShortcut = toShortcutString(mods, keyCode);
    }

    type() {
        return UI512EventType.KeyDown;
    }
}

/**
 * mouse up event.
 * elRaw and elClick are filled out later by a listener.
 * did the user click down and release on the same element (a full click)?
 * if so, set "elClick".
 * otherwise, only "elRaw" is set.
 */
export class MouseUpEventDetails extends MouseEventDetails {
    isMouseUpEventDetails = true;
    elRaw: O<UI512Element>;
    elClick: O<UI512Element>;

    type() {
        return UI512EventType.MouseUp;
    }

    getAffectedElements(): UI512Element[] {
        let ret = [];
        if (this.elRaw) {
            ret.push(this.elRaw);
        }

        if (this.elClick) {
            ret.push(this.elClick);
        }

        return ret;
    }
}

/**
 * mouse down event.
 * el is filled out later by a listener.
 */
export class MouseDownEventDetails extends MouseEventDetails {
    isMouseDownEventDetails = true;
    el: O<UI512Element>;
    type() {
        return UI512EventType.MouseDown;
    }
    getAffectedElements(): UI512Element[] {
        let ret = [];
        if (this.el) {
            ret.push(this.el);
        }

        return ret;
    }
}

/**
 * mouse double-click event.
 * el is filled out later by a listener.
 */
export class MouseDownDoubleEventDetails extends MouseEventDetails {
    isMouseDownDoubleEventDetails = true;
    el: O<UI512Element>;
    type() {
        return UI512EventType.MouseDownDouble;
    }

    getAffectedElements(): UI512Element[] {
        let ret = [];
        if (this.el) {
            ret.push(this.el);
        }

        return ret;
    }
}

/**
 * paste event
 */
export class PasteTextEventDetails extends EventDetails implements UI512IsEventInterface {
    isPasteTextEventDetails = true;
    constructor(public readonly timestamp: number, public readonly text: string, public readonly fromOS: boolean) {
        super();
    }

    type() {
        return UI512EventType.PasteText;
    }
}

/**
 * focus-changed event
 */
export class FocusChangedEventDetails extends EventDetails {
    isFocusChangedEventDetails = true;
    preventChange = false;
    constructor(public readonly idPrev: O<string>, public readonly idNext: O<string>) {
        super();
    }

    type() {
        return UI512EventType.FocusChanged;
    }
}
