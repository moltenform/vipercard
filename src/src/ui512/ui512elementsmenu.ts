
/* autoimport:start */
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

function idstolist<T extends UI512Element>(app: UI512Application, grpname: string, childids: string): T[] {
    let list = childids.split("|");
    if (list.length) {
        let grp = app.getGroup(grpname);
        return list.map(s => grp.getEl(s) as T);
    } else {
        return [];
    }
}

export class UI512MenuItem extends UI512Element {
    readonly typeName: string = "UI512MenuItem";
    protected _highlightactive = false;
    protected _labeltext = "";
    protected _labelhotkey = "";
    protected _checkmark = false;
    protected _enabled = true;
}

export class UI512MenuRoot extends UI512Element {
    readonly typeName: string = "UI512MenuRoot";
    protected _whichIsExpanded = -1;
    protected _childids = ""; // list of item ids separated by |
    getchildren(app: UI512Application) {
        return idstolist<UI512MenuDropdown>(app, "$$grpmenubar", this._childids);
    }
}

export class UI512MenuDropdown extends UI512ElementButtonGeneral {
    /* _labeltext, _iconsetid, _iconnumber */
    protected _labeltext = "";
    protected _childids = ""; // list of item ids separated by |
    protected _fixedoffset = -1;
    protected _fixedwidth = -1;
    protected _iconsetid = "";
    protected _iconnumber = -1;
    protected _style: number = UI512BtnStyle.transparent;
    protected _autohighlight = true;

    constructor(idString: string, observer: ElementObserver = elementObserverDefault) {
        super(idString, observer);
        this._style = UI512BtnStyle.transparent;
        this._autohighlight = false;
    }

    getchildren(app: UI512Application) {
        return idstolist<UI512MenuItem>(app, "$$grpmenuitems", this._childids);
    }
}

