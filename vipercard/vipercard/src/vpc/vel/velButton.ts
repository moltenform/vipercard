
/* auto */ import { SubstringStyleComplex } from './../vpcutils/vpcStyleComplex';
/* auto */ import { PropGetter, PropSetter, PrpTyp } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcElType } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElBase, VpcElSizable } from './velBase';
/* auto */ import { bool, checkThrow, makeVpcScriptErr } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, getEnumToStrOrUnknown, getStrToEnum } from './../../ui512/utils/util512';
/* auto */ import { UI512BtnStyle } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { TextFontSpec } from './../../ui512/draw/ui512DrawTextClasses';

/**
 * a vipercard "button"
 */
export class VpcElButton extends VpcElSizable {
    isVpcElButton = true;
    protected _autohilite = true;
    protected _enabled = true;
    protected _hilite = false;
    protected _checkmark = false;
    protected _icon = 0;
    protected _showlabel = true;
    protected _style: number = VpcBtnStyle.Rectangle;
    protected _label = '';
    protected _textalign = 'center';
    protected _textfont = 'chicago';
    protected _textsize = 12;
    protected _textstyle = 0;
    protected _visible = true;
    protected _script = '';
    protected _name = '';
    /* always true if belongs to a card */
    protected _sharedhilite = true;
    /* specific-card content will be in the form: */
    /* _hilite_oncard_12345 */
    /* _checkmark_oncard_12345 */
    constructor(id: string, parentId: string) {
        super(id, parentId);
    }

    /* cached getters */
    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };

    /* cached setters */
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };

    /**
     * type of element
     */
    getType() {
        return VpcElType.Btn;
    }

    /* e.g. a background btn can have a different hilite on every card */
    isCardSpecificContent(key: string) {
        return !this.getB('sharedhilite') && (bool(key === 'hilite') || bool(key === 'checkmark'));
    }

    /**
     * re-use cached getters and setter callback functions for better perf
     */
    startGettersSetters() {
        VpcElButton.btnInit();
        this.getters = VpcElButton.cachedGetters;
        this.setters = VpcElButton.cachedSetters;
    }

    /**
     * define getters
     */
    static btnGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters['textalign'] = [PrpTyp.Str, 'textalign'];
        getters['script'] = [PrpTyp.Str, 'script'];
        getters['textstyle'] = [PrpTyp.Str, (me: VpcElButton) => SubstringStyleComplex.vpcStyleFromInt(me._textstyle)];
        getters['style'] = [
            PrpTyp.Str,
            (me: VpcElButton) => {
                let ret = getEnumToStrOrUnknown(VpcBtnStyle, me._style);
                return ret.replace(/osstandard/g, 'standard').replace(/osdefault/g, 'default');
            }
        ];

        getters['hilite'] = [
            PrpTyp.Bool,
            (me: VpcElButton, cardId: string) => {
                return me.getPossiblyCardSpecific('hilite', false, cardId) as boolean;
            }
        ];

        getters['checkmark'] = [
            PrpTyp.Bool,
            (me: VpcElButton, cardId: string) => {
                return me.getPossiblyCardSpecific('checkmark', false, cardId) as boolean;
            }
        ];
    }

    /**
     * define setters
     */
    static btnSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters['name'] = [PrpTyp.Str, 'name'];
        setters['textstyle'] = [
            PrpTyp.Str,
            (me: VpcElButton, s: string) => {
                let list = s.split(',').map(item => item.trim());
                me.set('textstyle', SubstringStyleComplex.vpcStyleToInt(list));
            }
        ];

        setters['style'] = [
            PrpTyp.Str,
            (me: VpcElButton, s: string) => {
                let styl = getStrToEnum<VpcBtnStyle>(VpcBtnStyle, 'Button style', s);
                checkThrow((styl as any) !== VpcBtnStyle.Osboxmodal, '7D|this style is only supported internally');
                me.set('style', styl);
            }
        ];

        setters['textalign'] = [
            PrpTyp.Str,
            (me: VpcElButton, s: string) => {
                s = s.toLowerCase().trim();
                if (s === 'left') {
                    me.set('textalign', 'left');
                } else if (s === 'center') {
                    me.set('textalign', 'center');
                } else {
                    throw makeVpcScriptErr(`4z|we don't currently support setting text align to ${s}`);
                }
            }
        ];

        setters['hilite'] = [
            PrpTyp.Bool,
            (me: VpcElButton, v: boolean, cardId: string) => {
                me.setPossiblyCardSpecific('hilite', v, false, cardId);
            }
        ];

        setters['checkmark'] = [
            PrpTyp.Bool,
            (me: VpcElButton, v: boolean, cardId: string) => {
                me.setPossiblyCardSpecific('checkmark', v, false, cardId);
            }
        ];
    }

    static simpleBtnGetSet(): [string, PrpTyp][] {
        return [
            ['autohilite', PrpTyp.Bool],
            ['sharedhilite', PrpTyp.Bool],
            ['enabled', PrpTyp.Bool],
            ['icon', PrpTyp.Num],
            ['label', PrpTyp.Str],
            ['showlabel', PrpTyp.Bool],
            ['visible', PrpTyp.Bool],
            ['textfont', PrpTyp.Str],
            ['textsize', PrpTyp.Num]
        ];
    }

    /**
     * define getters and setters
     */
    static btnInit() {
        if (!VpcElButton.cachedGetters || !VpcElButton.cachedSetters) {
            VpcElButton.cachedGetters = {};
            VpcElButton.cachedSetters = {};
            VpcElBase.simpleGetSet(VpcElButton.cachedGetters, VpcElButton.cachedSetters, VpcElButton.simpleBtnGetSet());
            VpcElButton.btnGetters(VpcElButton.cachedGetters);
            VpcElSizable.initSizeGetters(VpcElButton.cachedGetters);
            VpcElButton.btnSetters(VpcElButton.cachedSetters);
            VpcElSizable.initSizeSetters(VpcElButton.cachedSetters);
            Util512.freezeRecurse(VpcElButton.cachedGetters);
            Util512.freezeRecurse(VpcElButton.cachedSetters);
        }
    }

    /**
     * from internal textfont to "geneva_12_biuosdce"
     */
    getFontAsUI512() {
        let spec = new TextFontSpec(this.getS('textfont'), this.getN('textstyle'), this.getN('textsize'));
        return spec.toSpecString();
    }
}

/**
 * button styles
 */
export enum VpcBtnStyle {
    __isUI512Enum = 1,
    __UI512EnumCapitalize,
    Transparent = UI512BtnStyle.Transparent,
    Rectangle = UI512BtnStyle.Rectangle,
    Opaque = UI512BtnStyle.Opaque,
    Roundrect = UI512BtnStyle.RoundRect,
    Plain = UI512BtnStyle.Plain,
    Shadow = UI512BtnStyle.Shadow,
    Osstandard = UI512BtnStyle.OSStandard,
    Osdefault = UI512BtnStyle.OSDefault,
    Osboxmodal = UI512BtnStyle.OSBoxModal,
    Checkbox = UI512BtnStyle.Checkbox,
    Radio = UI512BtnStyle.Radio,
    __AlternateForm__Standard = UI512BtnStyle.OSStandard,
    __AlternateForm__Default = UI512BtnStyle.OSDefault,
    __AlternateForm__Rect = UI512BtnStyle.Rectangle
}
