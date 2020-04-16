
/* auto */ import { VpcStandardLibScript } from './../vpcutils/vpcStandardLibScript';
/* auto */ import { PropGetter, PropSetter, PrpTyp } from './../vpcutils/vpcRequestedReference';
/* auto */ import { VpcElType, VpcTool, checkThrow, checkThrowEq } from './../vpcutils/vpcEnums';
/* auto */ import { VpcElStack } from './velStack';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElCard } from './velCard';
/* auto */ import { VpcElButton } from './velButton';
/* auto */ import { VpcElBg } from './velBg';
/* auto */ import { VpcElBase } from './velBase';
/* auto */ import { UI512CursorAccess, UI512Cursors } from './../../ui512/utils/utilsCursors';
/* auto */ import { bool, cProductName } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512AssertCustom';
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
    protected _script = VpcElProductOpts.productOptsScript;
    protected _name = `${cProductName}`;
    protected _longname = `Applications:${cProductName} Folder:${cProductName}`;
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
    set(s: string, newVal: ElementObserverVal, context = ChangeContext.Default) {
        assertWarn(s !== 'currentTool' || this.allowSetCurrentTool, 'Jt|');
        assertWarn(s !== 'currentCardId' || this.allowSetCurrentCard, '');
        assertTrue(s !== 'script', "you can't set script of Vpc");
        return super.set(s, newVal, context);
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
        getters['freesize'] = [PrpTyp.Num, () => 0];
        getters['size'] = [PrpTyp.Num, () => 0];
        getters['stacksinuse'] = [PrpTyp.Str, () => ''];
        getters['suspended'] = [PrpTyp.Bool, () => false];
        getters['itemdelimiter'] = [PrpTyp.Str, 'itemDel'];
        getters['cursor'] = [
            PrpTyp.Str,
            (me: VpcElProductOpts) => {
                let curs = UI512CursorAccess.getCursor();
                let ret = getEnumToStrOrFallback(UI512Cursors, curs);
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
                me.set('itemDel', s);
            }
        ];

        setters['cursor'] = [
            PrpTyp.Str,
            (me: VpcElProductOpts, s: string) => {
                if (s === '1') {
                    s = 'beam';
                } else if (s === '2') {
                    s = 'cross';
                } else if (s === '3') {
                    s = 'plus';
                } else if (s === '4') {
                    s = 'watch';
                }

                let n = getStrToEnum<VpcCursors>(VpcCursors, `cursor ${s} not supported`, s);
                UI512CursorAccess.setCursor(n.valueOf());
            }
        ];

        setters['idlerate'] = [
            PrpTyp.Str,
            (me: VpcElProductOpts, s: string) => {
                if (s === 'faster') {
                    me.set('suggestedIdleRate', 'faster');
                } else if (!s || s === 'default') {
                    me.set('suggestedIdleRate', 'default');
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
        return bool(VpcElProductOpts.cachedGetters[propName]) || bool(VpcElProductOpts.cachedSetters[propName]);
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
            bool(VpcElButton.cachedGetters[propName]) ||
            bool(VpcElButton.cachedSetters[propName]) ||
            bool(VpcElField.cachedGetters[propName]) ||
            bool(VpcElField.cachedSetters[propName]) ||
            bool(VpcElCard.cachedGetters[propName]) ||
            bool(VpcElCard.cachedSetters[propName]) ||
            bool(VpcElBg.cachedGetters[propName]) ||
            bool(VpcElBg.cachedSetters[propName]) ||
            bool(VpcElStack.cachedGetters[propName]) ||
            bool(VpcElStack.cachedSetters[propName]) ||
            bool(VpcElProductOpts.cachedGetters[propName]) ||
            bool(VpcElProductOpts.cachedSetters[propName])
        );
    }

    static productOptsScript = VpcStandardLibScript.script;
}

/**
 * vipercard cursors
 */
export enum VpcCursors {
    __isUI512Enum = 1,
    __UI512EnumCapitalize = -1,
    Arrow = UI512Cursors.Arrow,
    Beam = UI512Cursors.Beam,
    Crosshair = UI512Cursors.Crosshair,
    Hand = UI512Cursors.Hand,
    Pencil = UI512Cursors.Pencil,
    Plus = UI512Cursors.Plus,
    Watch = UI512Cursors.Watch,
    Paintbrush = UI512Cursors.PaintBrush,
    Paintbucket = UI512Cursors.PaintBucket,
    Painttext = UI512Cursors.PaintText,
    Paintlasso = UI512Cursors.PaintLasso,
    Painteraser = UI512Cursors.PaintEraser,
    Paintspray = UI512Cursors.PaintSpray
}
