
/* auto */ import { vpcversion } from '../../config.js';
/* auto */ import { assertTrueWarn, cProductName, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, checkThrowEq, getEnumToStrOrUnknown, getStrToEnum } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512CursorAccess, UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512Patterns } from '../../ui512/draw/ui512DrawPattern.js';
/* auto */ import { ElementObserverVal } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { PropGetter, PropSetter, PrpTyp, VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';

export class VpcElProductOpts extends VpcElBase {
    // unlike other elements, nothing here is persisted during save.
    isVpcElProduct = true;
    protected _itemDel = ',';
    protected _script = '';
    protected _name = `${cProductName}`;
    protected _longname = `Applications:${cProductName} Folder:${cProductName}`;

    // settings that shouldn't be touched directly
    protected _currentTool = VpcTool.Pencil;
    allowSetCurrentTool = false;

    // settings stored here to get an undoable setting
    protected _currentCardId = '';
    protected _optWideLines = false;
    protected _optPaintDrawMult = false;
    protected _currentPattern = UI512Patterns.defaultPattern;
    protected _optPaintLineColor = UI512Patterns.defaultLineColor;
    protected _optPaintFillColor = UI512Patterns.defaultFillColor;
    protected _optUseHostClipboard = true;
    protected _viewingScriptVelId = '';
    protected _selectedVelId = '';
    protected _suggestedIdleRate = '';

    getAttributesList() {
        // none of these attributes are persisted
        return [];
    }

    getType() {
        return VpcElType.Product;
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    set(s: string, newval: ElementObserverVal, context = ChangeContext.Default) {
        assertTrueWarn(s !== 'currentTool' || this.allowSetCurrentTool, '');
        return super.set(s, newval, context);
    }

    startGettersSetters() {
        VpcElProductOpts.prodInit();
        this.getters = VpcElProductOpts.cachedGetters;
        this.setters = VpcElProductOpts.cachedSetters;
    }

    static prodGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        // hard-coded responses to properties
        getters['environment'] = [PrpTyp.Str, () => 'development'];
        getters['freesize'] = [PrpTyp.Num, () => 0];
        getters['size'] = [PrpTyp.Num, () => 0];
        getters['stacksinuse'] = [PrpTyp.Str, () => ''];
        getters['suspended'] = [PrpTyp.Bool, () => false];
        getters['version/long'] = [PrpTyp.Str, () => vpcversion];
        getters['version'] = [PrpTyp.Str, () => vpcversion[0] + '.' + vpcversion[1]];

        getters['itemdelimiter'] = [PrpTyp.Str, 'itemDel'];
        getters['cursor'] = [
            PrpTyp.Str,
            (me: VpcElProductOpts) => {
                let curs = UI512CursorAccess.getCursor();
                let ret = getEnumToStrOrUnknown<UI512Cursors>(UI512Cursors, curs);
                return ret.toLowerCase();
            }
        ];
    }

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
                    checkThrow(false, `unsupported idlerate, try "faster" or "default"`);
                }
            }
        ];
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
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

    static canGetProductProp(propName: string) {
        VpcElProductOpts.prodInit();
        return !!VpcElProductOpts.cachedGetters[propName] || !!VpcElProductOpts.cachedSetters[propName];
    }

    static isAnyProp(propName: string) {
        VpcElButton.btnInit();
        VpcElField.fldInit();
        VpcElCard.cdInit();
        VpcElBg.bgInit();
        VpcElStack.stackInit();
        VpcElProductOpts.prodInit();
        return (
            !!VpcElButton.cachedGetters[propName] ||
            !!VpcElButton.cachedSetters[propName] ||
            !!VpcElField.cachedGetters[propName] ||
            !!VpcElField.cachedSetters[propName] ||
            !!VpcElCard.cachedGetters[propName] ||
            !!VpcElCard.cachedSetters[propName] ||
            !!VpcElBg.cachedGetters[propName] ||
            !!VpcElBg.cachedSetters[propName] ||
            !!VpcElStack.cachedGetters[propName] ||
            !!VpcElStack.cachedSetters[propName] ||
            !!VpcElProductOpts.cachedGetters[propName] ||
            !!VpcElProductOpts.cachedSetters[propName]
        );
    }
}

/**
 * values here are lowercase, because they are used by the interpreter.
 */
export enum VpcCursors {
    __isUI512Enum = 1,
    arrow = UI512Cursors.Arrow,
    beam = UI512Cursors.Beam,
    crosshair = UI512Cursors.Crosshair,
    hand = UI512Cursors.Hand,
    pencil = UI512Cursors.Pencil,
    plus = UI512Cursors.Plus,
    watch = UI512Cursors.Watch,
    paintbrush = UI512Cursors.PaintBrush,
    paintbucket = UI512Cursors.PaintBucket,
    painttext = UI512Cursors.PaintText,
    paintlasso = UI512Cursors.PaintLasso,
    painteraser = UI512Cursors.PaintEraser,
    paintspray = UI512Cursors.PaintSpray
}
