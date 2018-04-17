
/* auto */ import { makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, fitIntoInclusive, getEnumToStrOrUnknown, getStrToEnum } from '../../ui512/utils/utils512.js';
/* auto */ import { TextFontSpec, specialCharNumNewline } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512FldStyle } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { VpcChunkType, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcVal, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { SubstringStyleComplex } from '../../vpc/vpcutils/vpcStyleComplex.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcChunkResolution.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp } from '../../vpc/vpcutils/vpcRequestedReference.js';
/* auto */ import { VpcElBase, VpcElSizable } from '../../vpc/vel/velBase.js';

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
    protected _scroll = 0;
    protected _style: number = VpcFldStyleInclScroll.rectangle;
    protected _visible = true;
    protected _script = '';
    protected _textalign = 'left';
    protected _name = '';
    protected _ftxt = new FormattedText();
    constructor(id: string, parentId: string) {
        super(id, parentId);
        this._ftxt.lock();
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

    /* verified in tests */
    static readonly keyPropertiesList = [
        'x',
        'y',
        'w',
        'h',
        'dontwrap',
        'enabled',
        'locktext',
        'singleline',
        'selcaret',
        'selend',
        'scroll',
        'style',
        'visible',
        'script',
        'textalign',
        'name',
        'defaulttextfont',
        'defaulttextsize',
        'defaulttextstyle',
        'ftxt'
    ];

    /**
     * get the properties that need to be serialized
     */
    getKeyPropertiesList() {
        return VpcElField.keyPropertiesList;
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
     * for convenience, get the default font as ui512
     */
    getDefaultFontAsUi512() {
        let spec = new TextFontSpec(this._defaulttextfont, this._defaulttextstyle, this._defaulttextsize);
        return spec.toSpecString();
    }

    /**
     * for convenience, set entire font
     */
    protected setEntireFontFromDefaultFont() {
        let font = this.getDefaultFontAsUi512();
        let newtxt = this.get_ftxt().getUnlockedCopy();
        newtxt.setFontEverywhere(font);
        this.setftxt(newtxt);
    }

    /**
     * define getters
     */
    static fldGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters['singleline'] = [PrpTyp.Bool, 'singleline'];
        getters['textalign'] = [PrpTyp.Str, 'textalign'];
        getters['alltext'] = [PrpTyp.Str, (me: VpcElField) => me.get_ftxt().toUnformatted()];
        getters['defaulttextstyle'] = [
            PrpTyp.Str,
            (me: VpcElField) => SubstringStyleComplex.vpcstyleFromInt(me._defaulttextstyle)
        ];
        getters['style'] = [
            PrpTyp.Str,
            (me: VpcElField) => {
                return getEnumToStrOrUnknown<VpcFldStyleInclScroll>(VpcFldStyleInclScroll, me._style);
            }
        ];

        /* interestingly, when calling these without providing a chunk, they always act on the default font */
        /* confirmed in emulator that it won't even say 'mixed', and it will return default font even if no chars have it. */
        getters['textstyle'] = getters['defaulttextstyle'];
        getters['textfont'] = getters['defaulttextfont'];
        getters['textsize'] = getters['defaulttextsize'];
    }

    /**
     * define setters
     */
    static fldSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters['name'] = [PrpTyp.Str, 'name'];
        setters['style'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string) => {
                let styl = getStrToEnum<VpcFldStyleInclScroll>(VpcFldStyleInclScroll, 'Field style or "scrolling"', s);
                me.set('style', styl);

                /* changing style resets scroll amount */
                me.setProp('scroll', VpcValN(0));
            }
        ];

        setters['textstyle'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string) => {
                me.setProp('defaulttextstyle', VpcValS(s));
                me.setEntireFontFromDefaultFont();
            }
        ];

        setters['textfont'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string) => {
                me.set('defaulttextfont', s);
                me.setEntireFontFromDefaultFont();
            }
        ];

        setters['textsize'] = [
            PrpTyp.Num,
            (me: VpcElField, n: number) => {
                me.set('defaulttextsize', n);
                me.setEntireFontFromDefaultFont();
            }
        ];

        /* as done by ui when the field tool is selected,
        or when saying put "abc" into cd fld 1 with no chunk qualifications */
        setters['alltext'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string) => {
                let newtxt = FormattedText.newFromUnformatted(s);
                newtxt.setFontEverywhere(me.getDefaultFontAsUi512());
                me.setftxt(newtxt);
            }
        ];

        setters['defaulttextstyle'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string) => {
                let list = s.split(',').map(item => item.trim());
                me.set('defaulttextstyle', SubstringStyleComplex.vpcstyleToInt(list));
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
                    throw makeVpcScriptErr(`4y|we don't currently support setting text align to ${s}`);
                }
            }
        ];

        setters['singleline'] = [
            PrpTyp.Bool,
            (me: VpcElField, b: boolean) => {
                me.set('singleline', b);
                if (b) {
                    let hasNewLine = me.get_ftxt().indexOf(specialCharNumNewline);
                    if (hasNewLine !== -1) {
                        let newtxt = new FormattedText();
                        newtxt.appendSubstring(me.get_ftxt(), 0, hasNewLine);
                        me.setftxt(newtxt);
                    }
                }
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
            ['scroll', PrpTyp.Num],
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

    /**
     * chunk set, e.g. 'set the textstyle of char 2 to 4 of cd fld...'
     */
    specialSetPropChunkImpl(prop: string, s: string, charstart: number, charend: number): void {
        let newtxt = this.get_ftxt().getUnlockedCopy();
        let len = charend - charstart;
        if (prop === 'textstyle') {
            let list = s.split(',').map(item => item.trim());
            SubstringStyleComplex.setChunkTextStyle(newtxt, this.getDefaultFontAsUi512(), charstart, len, list);
        } else if (prop === 'textfont') {
            SubstringStyleComplex.setChunkTextFace(newtxt, this.getDefaultFontAsUi512(), charstart, len, s);
        } else if (prop === 'textsize') {
            let n = VpcValS(s).readAsStrictInteger();
            SubstringStyleComplex.setChunkTextSize(newtxt, this.getDefaultFontAsUi512(), charstart, len, n);
        } else {
            throw makeVpcScriptErr(
                `4x|can only say 'set the (prop) of char 1 to 2' for textstyle, textfont, or textsize`
            );
        }

        this.setftxt(newtxt);
    }

    /**
     * chunk get, e.g. 'get the textstyle of char 2 to 4 of cd fld...'
     */
    specialGetPropChunkImpl(prop: string, charstart: number, charend: number): string {
        let len = charend - charstart;
        if (prop === 'textstyle') {
            /* returns comma-delimited styles, or the string 'mixed' */
            let list = SubstringStyleComplex.getChunkTextStyle(
                this.get_ftxt(),
                this.getDefaultFontAsUi512(),
                charstart,
                len
            );
            return list.join(',');
        } else if (prop === 'textfont') {
            /* returns typeface name or the string 'mixed' */
            return SubstringStyleComplex.getChunkTextFace(
                this.get_ftxt(),
                this.getDefaultFontAsUi512(),
                charstart,
                len
            );
        } else if (prop === 'textsize') {
            /* as per spec this can return either an integer or the string 'mixed' */
            return SubstringStyleComplex.getChunkTextSize(
                this.get_ftxt(),
                this.getDefaultFontAsUi512(),
                charstart,
                len
            ).toString();
        } else {
            throw makeVpcScriptErr(
                `4w|can only say 'get the (prop) of char 1 to 2' for textstyle, textfont, or textsize`
            );
        }
    }

    /**
     * when you say set the textstyle of char 999 to 1000... how do we respond when outside content length
     */
    protected resolveChunkBounds(chunk: RequestedChunk, itemDel: string) {
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
        let unformatted = this.get_ftxt().toUnformatted();
        newChunk.first = fitIntoInclusive(newChunk.first, 1, unformatted.length);
        let bounds = ChunkResolution.resolveBoundsForGet(unformatted, itemDel, newChunk);
        bounds = bounds === undefined ? [0, 0] : bounds;
        return bounds;
    }

    /**
     * chunk set, e.g. 'set the textstyle of char 2 to 4 of cd fld...'
     */
    specialSetPropChunk(prop: string, chunk: RequestedChunk, val: VpcVal, itemDel: string) {
        let [start, end] = this.resolveChunkBounds(chunk, itemDel);
        return this.specialSetPropChunkImpl(prop, val.readAsString(), start, end);
    }

    /**
     * chunk get, e.g. 'get the textstyle of char 2 to 4 of cd fld...'
     */
    specialGetPropChunk(prop: string, chunk: RequestedChunk, itemDel: string): VpcVal {
        let [start, end] = this.resolveChunkBounds(chunk, itemDel);
        return VpcValS(this.specialGetPropChunkImpl(prop, start, end));
    }
}

/**
 * values here are lowercase, because they are used by the interpreter.
 */
export enum VpcFldStyleInclScroll {
    __isUI512Enum = 1,
    opaque = UI512FldStyle.Opaque,
    transparent = UI512FldStyle.Transparent,
    rectangle = UI512FldStyle.Rectangle,
    shadow = UI512FldStyle.Shadow,
    alternateforms_rect = UI512FldStyle.Rectangle,
    scrolling = 200
}
