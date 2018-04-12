
/* auto */ import { makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, fitIntoInclusive, getEnumToStrOrUnknown, getStrToEnum } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { TextFontSpec, specialCharNumNewline } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512FldStyle } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { VpcChunkType, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcVal, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { FormattedSubstringUtil } from '../../vpc/vpcutils/vpcStyleComplex.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcChunk.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp, VpcElBase, VpcElSizable } from '../../vpc/vel/velBase.js';

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

    // confirmed in emulator that there really does seem to be a separate
    // browse tool, select all, font menu->symbol, put "abc" into cd fld 1 -- setting the font to symbol does not stick
    // field tool, select the field, font menu->symbol, put "abc" into cd fld 1 -- setting the font does stick
    protected _defaulttextfont = 'geneva';
    protected _defaulttextsize = 12;
    protected _defaulttextstyle = 0;

    protected _ftxt = new FormattedText();

    static readonly attributesList = [
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

    getAttributesList() {
        return VpcElField.attributesList;
    }

    getType() {
        return VpcElType.Fld;
    }

    startGettersSetters() {
        VpcElField.fldInit();
        this.getters = VpcElField.cachedGetters;
        this.setters = VpcElField.cachedSetters;
    }

    getDefaultFontAsUi512() {
        let spec = new TextFontSpec(this._defaulttextfont, this._defaulttextstyle, this._defaulttextsize);
        return spec.toSpecString();
    }

    protected setEntireFontFromDefaultFont() {
        let font = this.getDefaultFontAsUi512();
        let newtxt = this.get_ftxt().getUnlockedCopy();
        newtxt.setFontEverywhere(font);
        this.setftxt(newtxt);
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
        this._ftxt.lock();
    }

    static fldGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters['singleline'] = [PrpTyp.Bool, 'singleline'];
        getters['textalign'] = [PrpTyp.Str, 'textalign'];
        getters['alltext'] = [PrpTyp.Str, (me: VpcElField) => me.get_ftxt().toUnformatted()];
        getters['defaulttextstyle'] = [
            PrpTyp.Str,
            (me: VpcElField) => FormattedSubstringUtil.vpcstyleFromInt(me._defaulttextstyle)
        ];
        getters['style'] = [
            PrpTyp.Str,
            (me: VpcElField) => {
                return getEnumToStrOrUnknown<VpcFldStyleInclScroll>(VpcFldStyleInclScroll, me._style);
            }
        ];

        // interestingly, when calling these without providing a chunk, they act on the default font
        // confirmed in emulator that it won't even say 'mixed', it will return default font even if no chars have it.
        getters['textstyle'] = getters['defaulttextstyle'];
        getters['textfont'] = getters['defaulttextfont'];
        getters['textsize'] = getters['defaulttextsize'];
    }

    static fldSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters['name'] = [PrpTyp.Str, 'name'];
        setters['style'] = [
            PrpTyp.Str,
            (me: VpcElField, s: string) => {
                let styl = getStrToEnum<VpcFldStyleInclScroll>(VpcFldStyleInclScroll, 'Field style or "scrolling"', s);
                me.set('style', styl);

                // changing style resets scroll amount
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

        // as done by ui when the field tool is selected, or when saying put "abc" into cd fld 1 with no chunk qualifications
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
                me.set('defaulttextstyle', FormattedSubstringUtil.vpcstyleToInt(list));
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
                    for (let i = 0; i < me.get_ftxt().len(); i++) {
                        let c = me.get_ftxt().charAt(i);
                        if (c === specialCharNumNewline) {
                            let newtxt = new FormattedText();
                            newtxt.appendSubstring(me.get_ftxt(), 0, i);
                            me.setftxt(newtxt);
                            break;
                        }
                    }
                }
            }
        ];
    }

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

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
    static fldInit() {
        if (!VpcElField.cachedGetters || !VpcElField.cachedSetters) {
            VpcElField.cachedGetters = {};
            VpcElField.cachedSetters = {};
            VpcElBase.simpleGetSet(VpcElField.cachedGetters, VpcElField.cachedSetters, VpcElField.simpleFldGetSet());
            VpcElField.fldGetters(VpcElField.cachedGetters);
            VpcElSizable.szGetters(VpcElField.cachedGetters);
            VpcElField.fldSetters(VpcElField.cachedSetters);
            VpcElSizable.szSetters(VpcElField.cachedSetters);
            Util512.freezeRecurse(VpcElField.cachedGetters);
            Util512.freezeRecurse(VpcElField.cachedSetters);
        }
    }

    specialSetPropChunkImpl(prop: string, s: string, charstart: number, charend: number): void {
        let newtxt = this.get_ftxt().getUnlockedCopy();
        let len = charend - charstart;
        if (prop === 'textstyle') {
            let list = s.split(',').map(item => item.trim());
            FormattedSubstringUtil.setChunkTextStyle(newtxt, this.getDefaultFontAsUi512(), charstart, len, list);
        } else if (prop === 'textfont') {
            FormattedSubstringUtil.setChunkTextFace(newtxt, this.getDefaultFontAsUi512(), charstart, len, s);
        } else if (prop === 'textsize') {
            let n = VpcValS(s).readAsStrictInteger();
            FormattedSubstringUtil.setChunkTextSize(newtxt, this.getDefaultFontAsUi512(), charstart, len, n);
        } else {
            throw makeVpcScriptErr(
                `4x|can only say 'set the (prop) of char 1 to 2' for textstyle, textfont, or textsize`
            );
        }

        this.setftxt(newtxt);
    }

    specialGetPropChunkImpl(prop: string, charstart: number, charend: number): string {
        let len = charend - charstart;
        if (prop === 'textstyle') {
            let list = FormattedSubstringUtil.getChunkTextStyle(
                this.get_ftxt(),
                this.getDefaultFontAsUi512(),
                charstart,
                len
            );
            return list.join(',');
        } else if (prop === 'textfont') {
            return FormattedSubstringUtil.getChunkTextFace(
                this.get_ftxt(),
                this.getDefaultFontAsUi512(),
                charstart,
                len
            );
        } else if (prop === 'textsize') {
            // as per spec this can return either an integer or the string 'mixed'
            return FormattedSubstringUtil.getChunkTextSize(
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

    protected resolveChunkBounds(chunk: RequestedChunk, itemDel: string) {
        let newChunk = chunk.getClone();
        if (
            newChunk.type === VpcChunkType.Chars &&
            !newChunk.ordinal &&
            newChunk.last !== undefined &&
            newChunk.last < newChunk.first
        ) {
            // for consistency with emulator, interesting behavior for negative intervals
            newChunk.first = newChunk.first - 1;
            newChunk.last = newChunk.first + 1;
        }

        // we handle the formattedText.len() === 0 case in getChunkTextAttribute
        let unformatted = this.get_ftxt().toUnformatted();
        newChunk.first = fitIntoInclusive(newChunk.first, 1, unformatted.length);
        let bounds = ChunkResolution.resolveBoundsForGet(unformatted, itemDel, newChunk);
        bounds = bounds === undefined ? [0, 0] : bounds;
        return bounds;
    }

    specialSetPropChunk(prop: string, chunk: RequestedChunk, val: VpcVal, itemDel: string) {
        let [start, end] = this.resolveChunkBounds(chunk, itemDel);
        return this.specialSetPropChunkImpl(prop, val.readAsString(), start, end);
    }

    specialGetPropChunk(prop: string, chunk: RequestedChunk, itemDel: string): VpcVal {
        let [start, end] = this.resolveChunkBounds(chunk, itemDel);
        return VpcValS(this.specialGetPropChunkImpl(prop, start, end));
    }
}
