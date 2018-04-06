
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { specialCharNumNewline } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { ElementObserver, elementObserverDefault } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';

export enum UI512FldStyle {
    __isUI512Enum = 1,
    opaque,
    transparent,
    rectangle,
    shadow,
    alternateforms_rect = rectangle,
}

// a scrollbar is not part of the field, it is created separately.
export class UI512ElTextField extends UI512Element {
    readonly typeName: string = 'UI512ElTextField';
    protected _labelvalign = true;
    protected _labelhalign = true;
    protected _labelwrap = false;
    protected _nudgex = 0;
    protected _nudgey = 0;
    protected _selcaret = 0;
    protected _selend = 0;
    protected _showcaret = false;
    protected _canedit = true;
    protected _canselecttext = true;
    protected _selectbylines = false; // works best if: !canedit, !labelwrap, canselecttext, multiline
    protected _multiline = true;
    protected _asteriskonly = false;
    protected _scrollbar = false;
    protected _scrollamt = 0;
    protected _style: number = UI512FldStyle.rectangle;
    protected _addvspacing = 0;
    protected _defaultFont = '';
    protected _contentHeightInPixels = -1;
    protected _ftxt = new FormattedText();

    constructor(idString: string, observer: ElementObserver = elementObserverDefault) {
        super(idString, observer);
        this._labelwrap = true;
        this._labelvalign = false;
        this._labelhalign = false;
        this._defaultFont = TextRendererFontManager.defaultFont;
        this._ftxt.lock();
    }

    set<T>(s: string, newval: T, context = ChangeContext.Default) {
        // reset cached height if anything changes
        if (
            s !== 'contentHeightInPixels' &&
            s !== 'selcaret' &&
            s !== 'selend' &&
            s !== 'scrollamt' &&
            s !== 'showcaret' &&
            s !== 'canedit' &&
            s !== 'canselecttext'
        ) {
            this.set('contentHeightInPixels', -1, context);

            // reset scroll position if dimensions change.
            if (s === 'x' || s === 'y' || s === 'w' || s === 'h') {
                this.set('scrollamt', 0, context);
            }
        }

        return super.set(s, newval, context);
    }

    setftxt(newtxt: FormattedText, context = ChangeContext.Default) {
        if (newtxt !== this._ftxt) {
            this.set('contentHeightInPixels', -1, context);
        }

        return super.setftxt(newtxt, context);
    }

    static setListChoices(el: UI512ElTextField, choices: string[]) {
        if (choices.length) {
            // little hack: add a space before each item because it looks better
            let s = choices.map(item => ' ' + item).join('\n');
            let ftxt = FormattedText.newFromUnformatted(s);

            // little hack: add an ending newline so that selecting the last line looks right
            // logic elsewhere prevents this last ending line from being actually chosen/selected.
            // we'll add the ending newline in a small font so it won't affect the scrollbar much.
            ftxt.push(specialCharNumNewline, TextRendererFontManager.smallestFont);
            el.setftxt(ftxt);
        } else {
            el.setftxt(FormattedText.newFromUnformatted(''));
        }
    }

    static makeChoiceBox(app: UI512Application, grp: UI512ElGroup, id: string, x: number, y: number) {
        const leftChoicesW = 130;
        const leftChoicesH = 117;
        let fld = new UI512ElTextField(id);
        grp.addElement(app, fld);
        fld.set('scrollbar', true);
        fld.set('selectbylines', true);
        fld.set('multiline', true);
        fld.set('canselecttext', true);
        fld.set('canedit', false);
        fld.set('labelwrap', false);
        fld.setDimensions(x, y, leftChoicesW, leftChoicesH);
        return fld;
    }
}
