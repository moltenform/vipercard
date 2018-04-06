
/* auto */ import { checkThrow, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, getEnumToStrOrUnknown, getStrToEnum } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { TextFontSpec } from '../../ui512/draw/ui512drawtextclasses.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512elementsbutton.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { FormattedSubstringUtil } from '../../vpc/vpcutils/vpcsubsstring.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp, VpcElBase, VpcElSizable } from '../../vpc/vel/velbase.js';

export class VpcElButton extends VpcElSizable {
    isVpcElButton = true;
    protected _autohilite = true;
    protected _enabled = true;
    protected _hilite = false;
    protected _checkmark = false;
    protected _icon = 0;
    protected _showlabel = true;
    protected _style: number = UI512BtnStyle.rectangle;
    protected _label = '';
    protected _textalign = 'center';
    protected _textfont = 'chicago';
    protected _textsize = 12;
    protected _textstyle = 0;
    protected _visible = true;
    protected _script = '';
    protected _name = '';

    static readonly attributesList = [
        'x',
        'y',
        'w',
        'h',
        'autohilite',
        'enabled',
        'hilite',
        'checkmark',
        'icon',
        'showlabel',
        'style',
        'label',
        'textalign',
        'textfont',
        'textsize',
        'textstyle',
        'visible',
        'script',
        'name',
    ];

    getAttributesList() {
        return VpcElButton.attributesList;
    }

    getType() {
        return VpcElType.Btn;
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    startGettersSetters() {
        VpcElButton.btnInit();
        this.getters = VpcElButton.cachedGetters;
        this.setters = VpcElButton.cachedSetters;
    }

    getFontAsUi512() {
        let spec = new TextFontSpec(this._textfont, this._textstyle, this._textsize);
        return spec.toSpecString();
    }

    static btnGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        getters['textalign'] = [PrpTyp.str, 'textalign'];
        getters['script'] = [PrpTyp.str, 'script'];
        getters['textstyle'] = [PrpTyp.str, (me: VpcElButton) => FormattedSubstringUtil.vpcstyleFromInt(me._textstyle)];
        getters['style'] = [
            PrpTyp.str,
            (me: VpcElButton) => {
                let ret = getEnumToStrOrUnknown<UI512BtnStyle>(UI512BtnStyle, me._style);
                return ret.replace(/osstandard/, 'standard').replace(/osdefault/, 'default');
            },
        ];
    }

    static btnSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters['name'] = [PrpTyp.str, 'name'];
        setters['textstyle'] = [
            PrpTyp.str,
            (me: VpcElButton, s: string) => {
                let list = s.split(',').map(item => item.trim());
                me.set('textstyle', FormattedSubstringUtil.vpcstyleToInt(list));
            },
        ];

        setters['style'] = [
            PrpTyp.str,
            (me: VpcElButton, s: string) => {
                let styl = getStrToEnum<UI512BtnStyle>(UI512BtnStyle, 'Button style', s);
                checkThrow(styl !== UI512BtnStyle.osboxmodal, '7D|this style is only supported internally');
                me.set('style', styl);
            },
        ];

        setters['textalign'] = [
            PrpTyp.str,
            (me: VpcElButton, s: string) => {
                s = s.toLowerCase().trim();
                if (s === 'left') {
                    me.set('textalign', 'left');
                } else if (s === 'center') {
                    me.set('textalign', 'center');
                } else {
                    throw makeVpcScriptErr(`4z|we don't currently support setting text align to ${s}`);
                }
            },
        ];
    }

    static simpleBtnGetSet(): [string, PrpTyp][] {
        return [
            ['autohilite', PrpTyp.bool],
            ['enabled', PrpTyp.bool],
            ['hilite', PrpTyp.bool],
            ['checkmark', PrpTyp.bool],
            ['icon', PrpTyp.num],
            ['label', PrpTyp.str],
            ['showlabel', PrpTyp.bool],
            ['visible', PrpTyp.bool],
            ['textfont', PrpTyp.str],
            ['textsize', PrpTyp.num],
        ];
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
    static btnInit() {
        if (!VpcElButton.cachedGetters || !VpcElButton.cachedSetters) {
            VpcElButton.cachedGetters = {};
            VpcElButton.cachedSetters = {};
            VpcElBase.simpleGetSet(VpcElButton.cachedGetters, VpcElButton.cachedSetters, VpcElButton.simpleBtnGetSet());
            VpcElButton.btnGetters(VpcElButton.cachedGetters);
            VpcElSizable.szGetters(VpcElButton.cachedGetters);
            VpcElButton.btnSetters(VpcElButton.cachedSetters);
            VpcElSizable.szSetters(VpcElButton.cachedSetters);
            Util512.freezeRecurse(VpcElButton.cachedGetters);
            Util512.freezeRecurse(VpcElButton.cachedSetters);
        }
    }
}
