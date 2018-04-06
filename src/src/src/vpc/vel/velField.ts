
/* auto */ import { makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, fitIntoInclusive, getEnumToStrOrUnknown, getStrToEnum } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { TextFontSpec, specialCharNumNewline } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512FldStyle } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { RequestedChunkType, VpcElType } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcVal, VpcValN, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { FormattedSubstringUtil } from '../../vpc/vpcutils/vpcStyleComplex.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcChunk.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp, VpcElBase, VpcElSizable } from '../../vpc/vel/velBase.js';

export class VpcElField extends VpcElSizable {
    isVpcElField = true;
    protected _dontwrap = false;
    protected _enabled = true;
    protected _locktext = false;
    protected _singleline = false;
    protected _selcaret = 0;
    protected _selend = 0;
    protected _scroll = 0;
    protected _style: number = UI512FldStyleInclScrolling.rectangle;
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
        'ftxt',
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
        getters['singleline'] = [PrpTyp.bool, 'singleline'];
        getters['textalign'] = [PrpTyp.str, 'textalign'];
        getters['alltext'] = [PrpTyp.str, (me: VpcElField) => me.get_ftxt().toUnformatted()];
        getters['defaulttextstyle'] = [
            PrpTyp.str,
            (me: VpcElField) => FormattedSubstringUtil.vpcstyleFromInt(me._defaulttextstyle),
        ];
        getters['style'] = [
            PrpTyp.str,
            (me: VpcElField) => {
                return getEnumToStrOrUnknown<UI512FldStyleInclScrolling>(UI512FldStyleInclScrolling, me._style);
            },
        ];

        // interestingly, when calling these without providing a chunk, they act on the default font
        // confirmed in emulator that it won't even say 'mixed', it will return default font even if no chars have it.
        getters['textstyle'] = getters['defaulttextstyle'];
        getters['textfont'] = getters['defaulttextfont'];
        getters['textsize'] = getters['defaulttextsize'];
    }

    static fldSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters['name'] = [PrpTyp.str, 'name'];
        setters['style'] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                let styl = getStrToEnum<UI512FldStyleInclScrolling>(
                    UI512FldStyleInclScrolling,
                    'Field style or "scrolling"',
                    s
                );
                me.set('style', styl);

                // changing style resets scroll amount
                me.setProp('scroll', VpcValN(0));
            },
        ];

        setters['textstyle'] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                me.setProp('defaulttextstyle', VpcValS(s));
                me.setEntireFontFromDefaultFont();
            },
        ];

        setters['textfont'] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                me.set('defaulttextfont', s);
                me.setEntireFontFromDefaultFont();
            },
        ];

        setters['textsize'] = [
            PrpTyp.num,
            (me: VpcElField, n: number) => {
                me.set('defaulttextsize', n);
                me.setEntireFontFromDefaultFont();
            },
        ];

        // as done by ui when the field tool is selected, or when saying put "abc" into cd fld 1 with no chunk qualifications
        setters['alltext'] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                let newtxt = FormattedText.newFromUnformatted(s);
                newtxt.setFontEverywhere(me.getDefaultFontAsUi512());
                me.setftxt(newtxt);
            },
        ];

        setters['defaulttextstyle'] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                let list = s.split(',').map(item => item.trim());
                me.set('defaulttextstyle', FormattedSubstringUtil.vpcstyleToInt(list));
            },
        ];

        setters['textalign'] = [
            PrpTyp.str,
            (me: VpcElField, s: string) => {
                s = s.toLowerCase().trim();
                if (s === 'left') {
                    me.set('textalign', 'left');
                } else if (s === 'center') {
                    me.set('textalign', 'center');
                } else {
                    throw makeVpcScriptErr(`4y|we don't currently support setting text align to ${s}`);
                }
            },
        ];

        setters['singleline'] = [
            PrpTyp.bool,
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
            },
        ];
    }

    static simpleFldGetSet(): [string, PrpTyp][] {
        return [
            ['dontwrap', PrpTyp.bool],
            ['enabled', PrpTyp.bool],
            ['locktext', PrpTyp.bool],
            ['scroll', PrpTyp.num],
            ['defaulttextfont', PrpTyp.str],
            ['defaulttextsize', PrpTyp.num],
            ['visible', PrpTyp.bool],
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
        let newchunk = chunk.getClone();
        if (
            newchunk.type === RequestedChunkType.Chars &&
            !newchunk.ordinal &&
            newchunk.last !== undefined &&
            newchunk.last < newchunk.first
        ) {
            // for consistency with emulator, interesting behavior for negative intervals
            newchunk.first = newchunk.first - 1;
            newchunk.last = newchunk.first + 1;
        }

        // we handle the formattedText.len() === 0 case in getChunkTextAttribute
        let unformatted = this.get_ftxt().toUnformatted();
        newchunk.first = fitIntoInclusive(newchunk.first, 1, unformatted.length);
        let bounds = ChunkResolution.resolveBoundsForGet(unformatted, itemDel, newchunk);
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

export enum UI512FldStyleInclScrolling {
    __isUI512Enum = 1,
    opaque = UI512FldStyle.opaque,
    transparent = UI512FldStyle.transparent,
    rectangle = UI512FldStyle.rectangle,
    shadow = UI512FldStyle.shadow,
    alternateforms_rect = UI512FldStyle.rectangle,
    scrolling = 200,
}
