
/* auto */ import { VpcStandardLibScript } from './../vpcutils/vpcStandardLibScript';
/* auto */ import { VpcStandardLibDoMenu } from './../vpcutils/vpcStandardLibDoMenu';
/* auto */ import { VpcElType, VpcTool, checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './velStack';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { VpcElButton } from './velButton';
/* auto */ import { VpcElBg } from './velBg';
/* auto */ import { PropGetter, PropSetter, PrpTyp, VpcElBase } from './velBase';
/* auto */ import { UI512CursorAccess, UI512Cursors } from './../../ui512/utils/utilsCursors';
/* auto */ import { cProductName } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, getEnumToStrOrFallback, getStrToEnum } from './../../ui512/utils/util512';
/* auto */ import { ChangeContext } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { ElementObserverVal } from './../../ui512/elements/ui512ElementGettable';
/* auto */ import { UI512Patterns } from './../../ui512/draw/ui512DrawPatterns';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * product options class
 *
 * the vel object singleton that can be referred to with code like
 * 'exit to ViperCard'
 * or
 * 'set the cursor to watch'
 * (when you set a global property, you are setting a
 * property on this object.)
 *
 * settings here are undoable, since they are on a vel
 * settings in vpcruntimesettings, on the other hand, are not undoable
 *
 * these are runtime-only settings -- nothing here is persisted during save.
 */
export class VpcElProductOpts extends VpcElBase {
    allowSetCurrentTool = false;
    allowSetCurrentCard = false;
    protected _itemDel = ',';
    protected _script = VpcStandardLibDoMenu.script + '\n' + VpcStandardLibScript.script
    protected _name = `${cProductName}`;
    constructor(id: string, parentId: string) {
        super(id, parentId);
        VpcElProductOpts.prodInit();
    }

    /* settings that shouldn't be touched directly */
    protected _currentTool = VpcTool.Pencil;
    protected _currentCardId = '';

    /* settings stored here to get an undoable setting */
    protected _optWideLines = false;
    protected _optPaintDrawMult = false;
    protected _currentPattern = UI512Patterns.defaultPattern;
    protected _optPaintLineColor = UI512Patterns.defaultLineColor;
    protected _optPaintFillColor = UI512Patterns.defaultFillColor;
    protected _optUseHostClipboard = true;
    protected _viewingScriptVelId = '';
    protected _selectedVelId = '';
    protected _suggestedIdleRate = '';

    /* cached getters */
    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };

    /* cached setters */
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };

    /**
     * type of element
     */
    getType() {
        return VpcElType.Product;
    }

    /**
     * set a property
     * add a check allowSetCurrentTool -- the only place that can set currentTool
     * is the _vpcpresenter_ object, since it has special tool clean-up logic
     */
    setProductOpt(s: string, newVal: ElementObserverVal, context = ChangeContext.Default) {
        assertWarn(s !== 'currentTool' || this.allowSetCurrentTool, 'Jt|');
        assertWarn(s !== 'currentCardId' || this.allowSetCurrentCard, 'Tr|');
        assertTrue(s !== 'script', "Tq|you can't set script of Vpc");
        /* here and velbase are the only places we're allowed to do this */
        super.setImplInternal(undefined as any, s, newVal, undefined, context);
    }

    /**
     * re-use cached getters and setter callback functions for better perf
     */
    startGettersSetters() {
        VpcElProductOpts.prodInit();
        this.getters = VpcElProductOpts.cachedGetters;
        this.setters = VpcElProductOpts.cachedSetters;
    }

    /**
     * define getters
     */
    static prodGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        /* many 'properties' here are hard-coded values for backwards-compat only */
        getters['environment'] = [PrpTyp.Str, () => 'development'];
        getters['stacksinuse'] = [PrpTyp.Str, () => ''];
        getters['suspended'] = [PrpTyp.Bool, () => false];
        getters['itemdelimiter'] = [PrpTyp.Str, 'itemDel'];
        getters['itemdel'] = getters['itemdelimiter'];
        getters['itemdelim'] = getters['itemdelimiter'];
        getters['cursor'] = [
            PrpTyp.Str,
            (me: VpcElProductOpts) => {
                let curs = UI512CursorAccess.getCursor();
                let ret = getEnumToStrOrFallback(UI512Cursors, curs);
                if (ret.startsWith('drawn_')) {
                    ret = ret.substr('drawn_'.length);
                }
                if (ret.startsWith('css_')) {
                    ret = ret.substr('css_'.length);
                }
                return ret.toLowerCase();
            }
        ];
    }

    /**
     * define setters
     */
    static prodSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters['itemdelimiter'] = [
            PrpTyp.Str,
            (me: VpcElProductOpts, s: string) => {
                checkThrowEq(1, s.length, `7C|length of itemDel must be 1`);
                me.setProductOpt('itemDel', s);
            }
        ];
        setters['itemdel'] = setters['itemdelimiter'];
        setters['itemdelim'] = setters['itemdelimiter'];

        setters['cursor'] = [
            PrpTyp.Str,
            (me: VpcElProductOpts, s: string) => {
                if (s === '1') {
                    s = 'lbeam';
                } else if (s === '2') {
                    s = 'cross';
                } else if (s === '3') {
                    s = 'plus';
                } else if (s === '4') {
                    s = 'watch';
                } else if (s === '5') {
                    s = 'hand';
                } else if (s === '6') {
                    s = 'arrow';
                } else if (s === '7') {
                    s = 'busy';
                } else if (s === '8') {
                    s = 'none';
                }

                let n = getStrToEnum<UI512Cursors>(UI512Cursors, `cursor ${s} not supported`, s);
                UI512CursorAccess.setCursorSupportRotate(n);
            }
        ];

        setters['idlerate'] = [
            PrpTyp.Str,
            (me: VpcElProductOpts, s: string) => {
                if (s === 'faster') {
                    me.setProductOpt('suggestedIdleRate', 'faster');
                } else if (!s || s === 'default') {
                    me.setProductOpt('suggestedIdleRate', 'default');
                } else {
                    checkThrow(false, `Js|unsupported idlerate, try "faster" or "default"`);
                }
            }
        ];
    }

    /**
     * define getters and setters
     */
    static prodInit() {
        if (!VpcElProductOpts.cachedGetters || !VpcElProductOpts.cachedSetters) {
            VpcElProductOpts.cachedGetters = {};
            VpcElProductOpts.prodGetters(VpcElProductOpts.cachedGetters);
            VpcElProductOpts.cachedSetters = {};
            VpcElProductOpts.prodSetters(VpcElProductOpts.cachedSetters);
            Util512.freezeRecurse(VpcElProductOpts.cachedGetters);
            Util512.freezeRecurse(VpcElProductOpts.cachedSetters);
        }
    }

    /**
     * is this the name of a property?
     */
    static canGetProductProp(propName: string) {
        VpcElProductOpts.prodInit();
        return (
            VpcElProductOpts.cachedGetters[propName] !== undefined ||
            /* bool */ VpcElProductOpts.cachedSetters[propName] !== undefined
        );
    }

    /**
     * is this the name of any property on any type of object?
     */
    static isAnyProp(propName: string) {
        VpcElButton.btnInit();
        VpcElField.fldInit();
        VpcElCard.cdInit();
        VpcElBg.bgInit();
        VpcElStack.stackInit();
        VpcElProductOpts.prodInit();
        return (
            VpcElButton.cachedGetters[propName] ||
            VpcElButton.cachedSetters[propName] ||
            VpcElField.cachedGetters[propName] ||
            VpcElField.cachedSetters[propName] ||
            VpcElCard.cachedGetters[propName] ||
            VpcElCard.cachedSetters[propName] ||
            VpcElBg.cachedGetters[propName] ||
            VpcElBg.cachedSetters[propName] ||
            VpcElStack.cachedGetters[propName] ||
            VpcElStack.cachedSetters[propName] ||
            VpcElProductOpts.cachedGetters[propName] ||
            VpcElProductOpts.cachedSetters[propName]
        );
    }
}
