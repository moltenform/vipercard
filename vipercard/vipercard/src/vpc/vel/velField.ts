
/* auto */ import { VpcVal, VpcValN, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { SubstringStyleComplex } from './../vpcutils/vpcStyleComplex';
/* auto */ import { PropGetter, PropSetter, PrpTyp } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcChunkType, VpcElType } from './../vpcutils/vpcEnums';
/* auto */ import { ChunkResolution, RequestedChunk } from './../vpcutils/vpcChunkResolution';
/* auto */ import { VpcElBase, VpcElSizable } from './velBase';
/* auto */ import { bool, makeVpcScriptErr } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, castVerifyIsNum, fitIntoInclusive, getEnumToStrOrUnknown, getStrToEnum, last, longstr } from './../../ui512/utils/util512';
/* auto */ import { FormattedText } from './../../ui512/draw/ui512FormattedText';
/* auto */ import { UI512FldStyle } from './../../ui512/elements/ui512ElementTextField';
/* auto */ import { TextFontSpec, specialCharNumNewline } from './../../ui512/draw/ui512DrawTextClasses';

/**
 * vpc text field class.
 */
export class VpcElField extends VpcElSizable {
    isVpcElField = true;
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
    protected _ftxt = new FormattedText();
    /* always true if belongs to a card */
    protected _sharedtext = true;
    /* specific-card content will be in the form: */
    /* _scroll_oncard_12345 */
    /* _ftxt_oncard_12345 */
    constructor(id: string, parentId: string) {
        super(id, parentId);
        this.getCardFmTxt('').lock();
    }

    /* cached getters */
    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };

    /* cached setters */
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };

    /* confirmed that there is a separate 'defaultfont' property
    try this in an emulator:
    create a new field, by default it has geneva text.
    browse tool, select all, font menu->symbol, put "abc" into cd fld 1, text is still geneva
    field tool, select the field, font menu->symbol, put "abc" into cd fld 1, text is now symbol */
    protected _defaulttextfont = 'geneva';
    protected _defaulttextsize = 12;
    protected _defaulttextstyle = 0;

    /* e.g. a background field has different content on every card */
    isCardSpecificContent(key: string): boolean {
        return (
            !this.getB('sharedtext') && (bool(key === 'scroll') || bool(key === 'ftxt'))
        );
    }

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
        let spec = new TextFontSpec(
            this.getS('textfont'),
            this.getN('textstyle'),
            this.getN('textsize')
        );
        return spec.toSpecString();
    }

    /**
     * for convenience, get the default font as ui512
     */
    getDefaultFontAsUi512() {
        let spec = new TextFontSpec(
            this.getS('defaulttextfont'),
            this.getN('defaulttextstyle'),
            this.getN('defaulttextsize')
        );
        return spec.toSpecString();
    }

    /**
     * for convenience, set entire font
     */
    protected setEntireFontFromDefaultFont(cardId: string) {
        let font = this.getDefaultFontAsUi512();
        let newTxt = this.getCardFmTxt(cardId).getUnlockedCopy();
        newTxt.setFontEverywhere(font);
        this.setCardFmTxt(cardId, newTxt);
    }

    /**
     * define getters
     */
    static fldGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters['singleline'] = [PrpTyp.Bool, 'singleline'];
        getters['textalign'] = [PrpTyp.Str, 'textalign'];
        getters['alltext'] = [
            PrpTyp.Str,
            (me: VpcElField, cardId: string) => me.getCardFmTxt(cardId).toUnformatted()
        ];
        getters['defaulttextstyle'] = [
            PrpTyp.Str,
            (me: VpcElField) =>
                SubstringStyleComplex.vpcStyleFromInt(me._defaulttextstyle)
        ];
        getters['style'] = [
            PrpTyp.Str,
            (me: VpcElField) => {
                return getEnumToStrOrUnknown(VpcFldStyleInclScroll, me._style);
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
            (me: VpcElField, cardId: string) => {
                return me.getPossiblyCardSpecific('scroll', 0, cardId) as number;
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
            (me: VpcElField, s: string, cardId: string) => {
                let styl = getStrToEnum<VpcFldStyleInclScroll>(
                    VpcFldStyleInclScroll,
                    'Field style or "scrolling"',
                    s
                );
                me.set('style', styl);

                /* changing style resets scroll amount */
                me.setProp('scroll', VpcValN(0), cardId);
            }
        ];

        setters['textstyle'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string, cardId: string) => {
                me.setProp('defaulttextstyle', VpcValS(s), cardId);
                me.setEntireFontFromDefaultFont(cardId);
            }
        ];

        setters['textfont'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string, cardId: string) => {
                me.set('defaulttextfont', s);
                me.setEntireFontFromDefaultFont(cardId);
            }
        ];

        setters['textsize'] = [
            PrpTyp.Num,
            (me: VpcElField, n: number, cardId: string) => {
                me.set('defaulttextsize', n);
                me.setEntireFontFromDefaultFont(cardId);
            }
        ];

        /* as done by ui when the field tool is selected,
        or when saying put "abc" into cd fld 1 with no chunk qualifications */
        setters['alltext'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string, cardId: string) => {
                let newTxt = FormattedText.newFromUnformatted(s);
                newTxt.setFontEverywhere(me.getDefaultFontAsUi512());
                me.setCardFmTxt(cardId, newTxt);
            }
        ];

        setters['defaulttextstyle'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string) => {
                let list = s.split(',').map(item => item.trim());
                me.set('defaulttextstyle', SubstringStyleComplex.vpcStyleToInt(list));
            }
        ];

        setters['textalign'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string) => {
                s = s.toLowerCase().trim();
                if (s === 'left') {
                    me.set('textalign', 'left');
                } else if (s === 'center') {
                    me.set('textalign', 'center');
                } else {
                    throw makeVpcScriptErr(
                        `4y|we don't currently support setting text align to ${s}`
                    );
                }
            }
        ];

        setters['singleline'] = [
            PrpTyp.Bool,
            (me: VpcElField, b: boolean, cardId: string) => {
                me.set('singleline', b);
                if (b) {
                    let hasNewLine = me
                        .getCardFmTxt(cardId)
                        .indexOf(specialCharNumNewline);
                    if (hasNewLine !== -1) {
                        let newTxt = new FormattedText();
                        newTxt.appendSubstring(me.getCardFmTxt(cardId), 0, hasNewLine);
                        me.setCardFmTxt(cardId, newTxt);
                    }
                }
            }
        ];

        setters['scroll'] = [
            PrpTyp.Num,
            (me: VpcElField, n: number, cardId: string) => {
                me.setPossiblyCardSpecific('scroll', n, 0, cardId);
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
            VpcElBase.simpleGetSet(
                VpcElField.cachedGetters,
                VpcElField.cachedSetters,
                VpcElField.simpleFldGetSet()
            );
            VpcElField.fldGetters(VpcElField.cachedGetters);
            VpcElSizable.initSizeGetters(VpcElField.cachedGetters);
            VpcElField.fldSetters(VpcElField.cachedSetters);
            VpcElSizable.initSizeSetters(VpcElField.cachedSetters);
            Util512.freezeRecurse(VpcElField.cachedGetters);
            Util512.freezeRecurse(VpcElField.cachedSetters);
        }
    }

    /**
     * chunk set, e.g. 'set the textstyle of char 2 to 4 of cd fld...'
     */
    specialSetPropChunkImpl(
        cardId: string,
        prop: string,
        s: string,
        charstart: number,
        charend: number
    ): void {
        let newTxt = this.getCardFmTxt(cardId).getUnlockedCopy();
        let len = charend - charstart;
        if (prop === 'textstyle') {
            let list = s.split(',').map(item => item.trim());
            SubstringStyleComplex.setChunkTextStyle(
                newTxt,
                this.getDefaultFontAsUi512(),
                charstart,
                len,
                list
            );
        } else if (prop === 'textfont') {
            SubstringStyleComplex.setChunkTextFace(
                newTxt,
                this.getDefaultFontAsUi512(),
                charstart,
                len,
                s
            );
        } else if (prop === 'textsize') {
            let n = VpcValS(s).readAsStrictInteger();
            SubstringStyleComplex.setChunkTextSize(
                newTxt,
                this.getDefaultFontAsUi512(),
                charstart,
                len,
                n
            );
        } else {
            throw makeVpcScriptErr(
                longstr(`4x|can only say 'set the (prop) of char 1 to 2'
                    for textstyle, textfont, or textsize`)
            );
        }

        this.setCardFmTxt(cardId, newTxt);
    }

    /**
     * chunk get, e.g. 'get the textstyle of char 2 to 4 of cd fld...'
     */
    specialGetPropChunkImpl(
        cardId: string,
        prop: string,
        charstart: number,
        charend: number
    ): string {
        let len = charend - charstart;
        if (prop === 'textstyle') {
            /* returns comma-delimited styles, or the string 'mixed' */
            let list = SubstringStyleComplex.getChunkTextStyle(
                this.getCardFmTxt(cardId),
                this.getDefaultFontAsUi512(),
                charstart,
                len
            );

            return list.join(',');
        } else if (prop === 'textfont') {
            /* returns typeface name or the string 'mixed' */
            return SubstringStyleComplex.getChunkTextFace(
                this.getCardFmTxt(cardId),
                this.getDefaultFontAsUi512(),
                charstart,
                len
            );
        } else if (prop === 'textsize') {
            /* as per spec this can return either an integer or the string 'mixed' */
            return SubstringStyleComplex.getChunkTextSize(
                this.getCardFmTxt(cardId),
                this.getDefaultFontAsUi512(),
                charstart,
                len
            ).toString();
        } else {
            throw makeVpcScriptErr(
                longstr(`4w|can only say 'get the (prop) of char 1 to 2'
                    for textstyle, textfont, or textsize`)
            );
        }
    }

    /**
     * when you say set the textstyle of char 999 to 1000...
     * how do we respond when outside content length
     */
    protected resolveChunkBounds(cardId: string, chunk: RequestedChunk, itemDel: string) {
        let newChunk = chunk.getClone();
        if (
            newChunk.type === VpcChunkType.Chars &&
            !newChunk.ordinal &&
            newChunk.last !== undefined &&
            newChunk.last < newChunk.first
        ) {
            /* for consistency with emulator, interesting behavior for negative intervals */
            newChunk.first = newChunk.first - 1;
            newChunk.last = newChunk.first + 1;
        }

        /* we handle the formattedText.len() === 0 case in getChunkTextAttribute */
        let unformatted = this.getCardFmTxt(cardId).toUnformatted();
        newChunk.first = fitIntoInclusive(newChunk.first, 1, unformatted.length);
        let bounds = ChunkResolution.resolveBoundsForGet(unformatted, itemDel, newChunk);
        bounds = bounds === undefined ? [0, 0] : bounds;
        return bounds;
    }

    /**
     * chunk set, e.g. 'set the textstyle of char 2 to 4 of cd fld...'
     */
    specialSetPropChunk(
        cardId: string,
        prop: string,
        chunk: RequestedChunk,
        val: VpcVal,
        itemDel: string
    ) {
        let [start, end] = this.resolveChunkBounds(cardId, chunk, itemDel);
        return this.specialSetPropChunkImpl(cardId, prop, val.readAsString(), start, end);
    }

    /**
     * chunk get, e.g. 'get the textstyle of char 2 to 4 of cd fld...'
     */
    specialGetPropChunk(
        cardId: string,
        prop: string,
        chunk: RequestedChunk,
        itemDel: string
    ): VpcVal {
        let [start, end] = this.resolveChunkBounds(cardId, chunk, itemDel);
        return VpcValS(this.specialGetPropChunkImpl(cardId, prop, start, end));
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
    AlternateFormsRect = UI512FldStyle.Rectangle,
    Scrolling = 200
}
