
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ModifierKeys, toShortcutString } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';

export abstract class EventDetails {
    isEventDetails = true;
    abstract type(): UI512EventType;
    protected _handled = false;
    constructor() {}
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

export class MouseMoveEventDetails extends EventDetails {
    isMouseMoveEventDetails = true;
    public elPrev: O<UI512Element>;
    public elNext: O<UI512Element>;
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

export class IdleEventDetails extends EventDetails {
    isIdleEventDetails = true;
    constructor(public readonly milliseconds: number) {
        super();
    }
    type() {
        return UI512EventType.Idle;
    }
}

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

export class MenuItemClickedDetails extends EventDetails {
    isMenuItemClickedDetails = true;
    constructor(public readonly id: string, public readonly mods: ModifierKeys) {
        super();
    }
    type() {
        return UI512EventType.MenuItemClicked;
    }
}

export class KeyUpEventDetails extends KeyEventDetails {
    isKeyUpEventDetails = true;
    type() {
        return UI512EventType.KeyUp;
    }
}

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

export class MouseUpEventDetails extends MouseEventDetails {
    // distinguish between elRaw -- element under x, y
    // and elClick -- element that had a complete mousedown+mouseup cycle
    isMouseUpEventDetails = true;
    public elRaw: O<UI512Element>;
    public elClick: O<UI512Element>;
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

export class MouseDownEventDetails extends MouseEventDetails {
    isMouseDownEventDetails = true;
    public el: O<UI512Element>;
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

export class MouseDownDoubleEventDetails extends MouseEventDetails {
    isMouseDownDoubleEventDetails = true;
    public el: O<UI512Element>;
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

export class PasteTextEventDetails extends EventDetails {
    isPasteTextEventDetails = true;
    constructor(public readonly timestamp: number, public readonly text: string, public readonly fromOS: boolean) {
        super();
    }

    type() {
        return UI512EventType.PasteText;
    }
}

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
