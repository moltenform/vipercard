
/* auto */ import { VpcValN, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { SubstringStyleComplex } from './../vpcutils/vpcStyleComplex';
/* auto */ import { VpcElType, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { PropGetter, PropSetter, PrpTyp, VpcElBase, VpcElSizable, VpcFindByIdInterface } from './velBase';
/* auto */ import { O, bool } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, getEnumToStrOrFallback, getStrToEnum } from './../../ui512/utils/util512';
/* auto */ import { ChangeContext } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { GenericTextField } from './../../ui512/textedit/ui512GenericField';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { UI512ElTextField, UI512FldStyle } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { TextFontSpec, specialCharNumNewline } from './../../ui512/drawtext/ui512DrawTextClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * vpc text field class.
 */
export class VpcElField extends VpcElSizable {
    protected _is_bg_velement_id = ''
    
    protected _dontwrap = false;
    protected _enabled = true;
    protected _locktext = false;
    protected _singleline = false;
    protected _selcaret = 0;
    protected _selend = 0;
    protected _style: number = VpcFldStyleInclScroll.Rectangle;
    protected _visible = true;
    protected _script = '';
    protected _textalign = 'left';
    protected _name = '';
    protected _scroll = 0;
    protected _scroll_uniquetocard = 0;
    protected _ftxt = new FormattedText();
    protected _ftxt_uniquetocard = new FormattedText();

    /* confirmed that there is a separate 'defaultfont' property
    try this in an emulator:
    create a new field, by default it has geneva text.
    browse tool, select all, font menu->symbol, put "abc" into cd fld 1, text is still geneva
    field tool, select the field, font menu->symbol, put "abc" into cd fld 1, text is now symbol */
    protected _defaulttextfont = 'geneva';
    protected _defaulttextsize = 12;
    protected _defaulttextstyle = 0;


    /* always true if belongs to a card */
    protected _sharedtext = true;
    
    constructor(id: string, parentId: string) {
        super(id, parentId);
        this._ftxt.lock();
        this._ftxt_uniquetocard.lock();
    }

    /* cached getters */
    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };

    /* cached setters */
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };

    

    //~ /* e.g. a background field has different content on every card */
    //~ isCardSpecificContent(key: string): boolean {
        //~ return !this.getB('sharedtext') && (bool(key === 'scroll') || bool(key === 'ftxt'));
    //~ }

    /**
     * type of element
     */
    getType() {
        return VpcElType.Fld;
    }

    /**
     * re-use cached getters and setter callback functions for better perf
     */
    startGettersSetters() {
        VpcElField.fldInit();
        this.getters = VpcElField.cachedGetters;
        this.setters = VpcElField.cachedSetters;
    }

    /**
     * from internal textfont to "geneva_12_biuosdce"
     */
    getFontAsUI512() {
        let spec = new TextFontSpec(this.getS('textfont'), this.getN('textstyle'), this.getN('textsize'));
        return spec.toSpecString();
    }

    /**
     * for convenience, get the default font as ui512
     */
    getDefaultFontAsUi512() {
        let spec = new TextFontSpec(this.getS('defaulttextfont'), this.getN('defaulttextstyle'), this.getN('defaulttextsize'));
        return spec.toSpecString();
    }

    /**
     * for convenience, set entire font
     */
    protected setEntireFontFromDefaultFont(h:VpcFindByIdInterface) {
        let font = this.getDefaultFontAsUi512();
        let newTxt = this.getCardFmTxt().getUnlockedCopy();
        newTxt.setFontEverywhere(font);
        this.setCardFmTxt(newTxt, h);
    }

    /**
     * define getters
     */
    static fldGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters['singleline'] = [PrpTyp.Bool, 'singleline'];
        getters['textalign'] = [PrpTyp.Str, 'textalign'];
        getters['alltext'] = [PrpTyp.Str, (me: VpcElField) => me.getCardFmTxt().toUnformatted()];
        getters['defaulttextstyle'] = [
            PrpTyp.Str,
            (me: VpcElField) => SubstringStyleComplex.vpcStyleFromInt(me._defaulttextstyle)
        ];
        getters['style'] = [
            PrpTyp.Str,
            (me: VpcElField) => {
                return getEnumToStrOrFallback(VpcFldStyleInclScroll, me._style);
            }
        ];

        /* interestingly, when calling these without providing a chunk,
        they always act on the default font.
        confirmed in emulator that it won't even say 'mixed',
        and it will return default font even if no chars have it. */
        getters['textstyle'] = getters['defaulttextstyle'];
        getters['textfont'] = getters['defaulttextfont'];
        getters['textsize'] = getters['defaulttextsize'];

        getters['scroll'] = [
            PrpTyp.Num,
            (me: VpcElField) => {
                return (me.getB('sharedtext')) ? me.getN('scroll') : me.getN('scroll_uniquetocard')
            }
        ];
    }

    /**
     * define setters
     */
    static fldSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters['name'] = [PrpTyp.Str, 'name'];
        setters['style'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string, h:VpcFindByIdInterface) => {
                let styl = getStrToEnum<VpcFldStyleInclScroll>(VpcFldStyleInclScroll, 'Field style or "scrolling"', s);
                me.setOnVel('style', styl, h);

                /* changing style resets scroll amount */
                me.setProp('scroll', VpcValN(0), h);
            }
        ];

        setters['textstyle'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string, h:VpcFindByIdInterface) => {
                me.setProp('defaulttextstyle', VpcValS(s), h);
                me.setEntireFontFromDefaultFont(h);
            }
        ];

        setters['textfont'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string, h:VpcFindByIdInterface) => {
                me.setOnVel('defaulttextfont', s,h);
                me.setEntireFontFromDefaultFont(h);
            }
        ];

        setters['textsize'] = [
            PrpTyp.Num,
            (me: VpcElField, n: number, h:VpcFindByIdInterface) => {
                me.setOnVel('defaulttextsize', n, h);
                me.setEntireFontFromDefaultFont(h);
            }
        ];

        /* as done by ui when the field tool is selected,
        or when saying put "abc" into cd fld 1 with no chunk qualifications */
        setters['alltext'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string, h:VpcFindByIdInterface) => {
                let newTxt = FormattedText.newFromUnformatted(s);
                newTxt.setFontEverywhere(me.getDefaultFontAsUi512());
                me.setCardFmTxt(newTxt, h);
            }
        ];

        setters['defaulttextstyle'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string, h:VpcFindByIdInterface) => {
                let list = s.split(',').map(item => item.trim());
                me.setOnVel('defaulttextstyle', SubstringStyleComplex.vpcStyleToInt(list), h);
            }
        ];

        setters['textalign'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string, h:VpcFindByIdInterface) => {
                s = s.toLowerCase().trim();
                if (s === 'left') {
                    me.setOnVel('textalign', 'left', h);
                } else if (s === 'center') {
                    me.setOnVel('textalign', 'center', h);
                } else {
                    checkThrow(false, `4y|we don't currently support setting text align to ${s}`);
                }
            }
        ];

        setters['singleline'] = [
            PrpTyp.Bool,
            (me: VpcElField, b: boolean, h:VpcFindByIdInterface) => {
                me.setOnVel('singleline', b, h);
                if (b) {
                    let hasNewLine = me.getCardFmTxt().indexOf(specialCharNumNewline);
                    if (hasNewLine !== -1) {
                        let newTxt = new FormattedText();
                        newTxt.appendSubstring(me.getCardFmTxt(), 0, hasNewLine);
                        me.setCardFmTxt(newTxt, h);
                    }
                }
            }
        ];

        setters['scroll'] = [
            PrpTyp.Num,
            (me: VpcElField, n: number, h:VpcFindByIdInterface) => {
                 me.setOnVel(me.getB('sharedtext') ?'scroll' : 'scroll_uniquetocard', n, h)
            }
        ];
    }

    /**
     * define getters+setters that simply get/set a value
     */
    static simpleFldGetSet(): [string, PrpTyp][] {
        return [
            ['dontwrap', PrpTyp.Bool],
            ['enabled', PrpTyp.Bool],
            ['locktext', PrpTyp.Bool],
            ['sharedtext', PrpTyp.Bool],
            ['defaulttextfont', PrpTyp.Str],
            ['defaulttextsize', PrpTyp.Num],
            ['visible', PrpTyp.Bool]
        ];
    }

    /**
     * define getters and setters
     */
    static fldInit() {
        if (!VpcElField.cachedGetters || !VpcElField.cachedSetters) {
            VpcElField.cachedGetters = {};
            VpcElField.cachedSetters = {};
            VpcElBase.simpleGetSet(VpcElField.cachedGetters, VpcElField.cachedSetters, VpcElField.simpleFldGetSet());
            VpcElField.fldGetters(VpcElField.cachedGetters);
            VpcElSizable.initSizeGetters(VpcElField.cachedGetters);
            VpcElField.fldSetters(VpcElField.cachedSetters);
            VpcElSizable.initSizeSetters(VpcElField.cachedSetters);
            Util512.freezeRecurse(VpcElField.cachedGetters);
            Util512.freezeRecurse(VpcElField.cachedSetters);
        }
    }
}

/**
 * implementation of GenericTextField for vel text fields
 *
 * let's say you are typing on the keyboard to insert a letter into the text field.
 * if this is a UI512 text field, we can directly insert the letter.
 * but if it is a ViperCard text field,
 * we need to update the _VpcElField_ model first
 */
export class VpcTextFieldAsGeneric implements GenericTextField {
    constructor(protected el512: UI512ElTextField, protected impl: VpcElField, protected h:VpcFindByIdInterface) {}

    setFmtTxt(newTxt: FormattedText, context: ChangeContext) {
        this.impl.setCardFmTxt(newTxt, this.h, context);
    }

    getFmtTxt(): FormattedText {
        return this.impl.getCardFmTxt();
    }

    canEdit() {
        return !this.impl.getB('locktext');
    }

    canSelectText(): boolean {
        return !this.impl.getB('locktext');
    }

    isMultiline(): boolean {
        return !this.impl.getB('singleline');
    }

    setSel(a: number, b: number): void {
        this.impl.setOnVel('selcaret', a, this.h);
        this.impl.setOnVel('selend', b, this.h);
    }

    getSel(): [number, number] {
        return [this.impl.getN('selcaret'), this.impl.getN('selend')];
    }

    //~ getID(): string {
        //~ return this.impl.id;
    //~ }

    getHeight(): number {
        return this.impl.getN('h');
    }

    getDefaultFont(): string {
        return this.impl.getDefaultFontAsUi512();
    }

    getReadOnlyUI512(): UI512ElTextField {
        return this.el512;
    }

    getScrollAmt(): number {
        return this.impl.getProp('scroll').readAsStrictNumeric()
    }

    setScrollAmt(n: O<number>): void {
        if (n !== undefined && n !== null) {
            this.impl.setProp('scroll', VpcValN(n), this.h)
        }
    }
}

/**
 * field styles.
 */
export enum VpcFldStyleInclScroll {
    __isUI512Enum = 1,
    __UI512EnumCapitalize,
    Opaque = UI512FldStyle.Opaque,
    Transparent = UI512FldStyle.Transparent,
    Rectangle = UI512FldStyle.Rectangle,
    Shadow = UI512FldStyle.Shadow,
    __AlternateForm__Rect = UI512FldStyle.Rectangle,
    Scrolling = 200
}
