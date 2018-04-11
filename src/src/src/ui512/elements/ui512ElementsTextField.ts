
/* auto */ import { ScrollConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { specialCharNumNewline } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512DrawText } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { ElementObserver, ElementObserverVal, elementObserverDefault } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';

/**
 * style of a text field, e.g. type of border decoration
 */
export enum UI512FldStyle {
    __isUI512Enum = 1,
    Opaque,
    Transparent,
    Rectangle,
    Shadow
}

/**
 * the model for a UI text field element
 */
export class UI512ElTextField extends UI512Element {
    readonly typename: string = 'UI512ElTextField';
    protected _labelvalign = true;
    protected _labelhalign = true;
    protected _labelwrap = false;
    protected _showcaret = false;
    protected _canedit = true;
    protected _canselecttext = true;
    protected _multiline = true;
    protected _asteriskonly = false;
    protected _style: number = UI512FldStyle.Rectangle;
    protected _defaultFont: string = UI512DrawText.defaultFont;
    protected _addvspacing = 0;

    /* contents of the field */
    protected _ftxt = new FormattedText();

    /* vertical scroll amount in pixels. */
    protected _scrollamt = 0;

    /* adjust rendered text within the field, e.g. to add additional margin space */
    protected _nudgex = 0;

    /* adjust rendered text within the field, e.g. to add additional margin space */
    protected _nudgey = 0;

    /* start of selection. 0-based. ok if past the length of content. */
    protected _selcaret = 0;

    /* end of selection. 0-based. ok if past the length of content.
    can be before selcaret if, say, you drag from right to left to select text, or hit shift-left. */
    protected _selend = 0;

    /* used for choice box. it's easiest to call makeChoiceBox instead of setting this directly */
    protected _selectbylines = false;

    /* a scrollbar is not part of the field, it is created separately.  */
    protected _scrollbar = false;

    /* we'll cache the height of content, for better perf. used for scrollbar math. */
    protected _contentHeightInPixels = -1;

    constructor(idString: string, observer: ElementObserver = elementObserverDefault) {
        super(idString, observer);
        this._labelwrap = true;
        this._labelvalign = false;
        this._labelhalign = false;
        this._ftxt.lock();
    }

    /**
     * we override set() so that we can invalidate our cached contentHeightInPixels
     */
    set(s: string, newval: ElementObserverVal, context = ChangeContext.Default) {
        /* reset cached height if anything substantial changes */
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

            /* reset scroll position if dimensions change. */
            if (s === 'x' || s === 'y' || s === 'w' || s === 'h') {
                this.set('scrollamt', 0, context);
            }
        }

        return super.set(s, newval, context);
    }

    /**
     * change the content of the text field
     */
    setftxt(newtxt: FormattedText, context = ChangeContext.Default) {
        if (newtxt !== this._ftxt) {
            this.set('contentHeightInPixels', -1, context);
        }

        return super.setftxt(newtxt, context);
    }

    /**
     * helper function for a choicebox list of choices
     */
    static setListChoices(el: UI512ElTextField, choices: string[]) {
        if (choices.length) {
            /* add a space before each item because it looks better */
            let s = choices.map(item => ' ' + item).join('\n');
            let ftxt = FormattedText.newFromUnformatted(s);

            /* little hack: add an ending newline so that selecting the last line looks right
            logic elsewhere prevents this last ending line from being actually chosen/selected.
            we'll add the ending newline in a small font so it won't affect the scrollbar much. */
            ftxt.push(specialCharNumNewline, UI512DrawText.smallestFont);
            el.setftxt(ftxt);
        } else {
            el.setftxt(FormattedText.newFromUnformatted(''));
        }
    }

    /**
     * helper function for a choicebox list of choices
     */
    static makeChoiceBox(app: UI512Application, grp: UI512ElGroup, id: string, x: number, y: number) {
        let fld = new UI512ElTextField(id);
        grp.addElement(app, fld);
        fld.set('scrollbar', true);
        fld.set('selectbylines', true);
        fld.set('multiline', true);
        fld.set('canselecttext', true);
        fld.set('canedit', false);
        fld.set('labelwrap', false);
        fld.setDimensions(x, y, ScrollConsts.ChoiceListDefaultWidth, ScrollConsts.ChoiceListDefaultHeight);
        return fld;
    }
}
