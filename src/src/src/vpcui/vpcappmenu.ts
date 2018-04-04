
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { MenuPositioning } from "../ui512/ui512menurender.js";
import { MouseDragStatus, UI512Controller } from "../ui512/ui512controller.js";
import { clrBlack, clrWhite, clrTransp, makePainterCvDataDraw, makePainterCvDataWithPatternSupport, simplifyPattern, needsPatternSupport, makePainterCvCanvas, UI512Painter, DissolveImages, UI512ImageSerialization } from "../ui512/ui512paint.js";
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { PrpTyp, VpcElBase, VpcElSizable, VpcElButton, UI512FldStyleInclScrolling, VpcElField, VpcElCard, VpcElBg, VpcElStack } from "../vpcscript/vpcelements.js";
import { RequestedVelRef, RequestedContainerRef, VpcModel, vpcElTypeAsSeenInName, ReadableContainerStr, ReadableContainerVar, WritableContainerVar, ReadableContainerField, WritableContainerField, VpcScriptMessage, OutsideWorldRead, OutsideWorldReadWrite, VpcElProductOpts } from "../vpcscript/vpcelementstop.js";
import { cProductName, cTkSyntaxMarker, makeVpcScriptErr, makeVpcInternalErr, checkThrow, checkThrowEq, FormattedSubstringUtil, CodeLimits, VpcIntermedValBase, IntermedMapOfIntermedVals, VpcVal, VpcValS, VpcValN, VpcValBool, VarCollection, VariableCollectionConstants, VpcEvalHelpers, ReadableContainer, WritableContainer, RequestedChunk, ChunkResolution, VpcUI512Serialization, CountNumericId } from "../vpcscript/vpcutil.js";
import { RequestedChunkType, PropAdjective, SortStyle, OrdinalOrPosition, RequestedChunkTextPreposition, VpcElType, VpcTool, toolToPaintOntoCanvasShapes, VpcToolCtg, getToolCategory, VpcBuiltinMsg, getMsgNameFromType, VpcOpCtg, getPositionFromOrdinalOrPosition } from "../vpcscript/vpcenums.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */


export class VpcAppMenus extends VpcAppInterfaceLayer {
    cbGetModel: () => VpcModel;
    protected getMenuStruct() {
        /*
        Non-catchable chrome shortcuts :(
            Ctrl-T
            Ctrl-W
            Ctrl-N
            Ctrl-Q
        */
        return [
            ["mnuHeaderOS|icon:001:80:26", ["mnuOSAbout|lngAbout %cProductName...|"]],
            [
                "mnuHeaderFile|lngFile",
                [
                    "mnuNewStack|lngNew Stack|",
                    "mnuSaveStack|lngSave Stack|\xBD S",
                    "mnuSaveStackCopy|lngSave As...|",
                    "|---|",
                    "mnuExportStack|lngExport to .json file...|",
                    "|---|",
                    "mnuQuit|lngQuit %cProductName|",
                ],
            ],
            [
                "mnuHeaderEdit|lngEdit",
                [
                    "mnuUndo|lngUndo|\xBD Z",
                    "mnuRedo|lngRedo|\xBD Y",
                    "|---|",
                    "mnuCut|lngCut Text|\xBD X",
                    "mnuCopy|lngCopy Text|\xBD C",
                    "mnuPaste|lngPaste Text|\xBD V",
                    "mnuClear|lngClear|",
                    "|---|",
                    "mnuUseHostClipboard|lngUse OS Clipboard|",
                    "|---|",
                    "mnuNewCard|lngNew Card|\xBD M",
                    "mnuCopyCardOrObj|lngCopy Card|",
                    "mnuPasteCardOrObj|lngPaste Card|",
                    "mnuDelCard|lngDelete Card|",
                ],
            ],
            [
                "mnuHeaderGo|lngGo",
                [
                    "mnuGoCardFirst|lngFirst|\xBD 1",
                    "mnuGoCardPrev|lngPrev|\xBD 2",
                    "mnuGoCardNext|lngNext|\xBD 3",
                    "mnuGoCardLast|lngLast|\xBD 4",
                ],
            ],
            [
                "mnuHeaderTools|lngTools",
                [
                    "mnuItemTool2|lngBrowse|",
                    "mnuItemTool3|lngButton|",
                    "mnuItemTool4|lngField|",
                    "mnuItemTool5|lngSelect|",
                    "mnuItemTool6|lngBrush|",
                    "mnuItemTool7|lngBucket|",
                    "mnuItemTool8|lngText|",
                    "mnuItemTool9|lngPencil|",
                    "mnuItemTool10|lngLine|",
                    "mnuItemTool11|lngLasso|",
                    "mnuItemTool12|lngEraser|",
                    "mnuItemTool13|lngRect|",
                    "mnuItemTool14|lngOval|",
                    "mnuItemTool15|lngRoundrect|",
                    "mnuItemTool16|lngCurve|",
                    "mnuItemTool17|lngSpray|",
                ],
            ],
            [
                "mnuHeaderObjects|lngObjects",
                [
                    "mnuCardInfo|lngCard Info...|",
                    "mnuStackInfo|lngStack Info...|",
                    "|---|",
                    "mnuObjectsNewBtn|lngNew Button|",
                    "mnuObjectsNewFld|lngNew Field|",
                ],
            ],
            [
                "mnuHeaderDraw|lngDraw",
                [
                    "mnuPaintWideLines|lngWide lines|",
                    "|---|",
                    "mnuPaintBlackLines|lngBlack lines|",
                    "mnuPaintWhiteLines|lngWhite lines|",
                    "|---|",
                    "mnuPaintNoFill|lngNo fill|",
                    "mnuPaintBlackFill|lngBlack fill|",
                    "mnuPaintWhiteFill|lngWhite fill|",
                ],
            ],
            [
                "mnuHeaderFont|lngFont",
                [
                    "mnuItemSetFontFaceChicago|lngChicago|",
                    "mnuItemSetFontFaceGeneva|lngGeneva|",
                    "mnuItemSetFontFaceCourier|lngCourier|",
                    "mnuItemSetFontFaceTimes|lngTimes|",
                    "mnuItemSetFontFaceNew York|lngNew York|",
                ],
            ],
            [
                "mnuHeaderFontStyle|lngStyle",
                [
                    "mnuSetFontStylePlain|lngPlain|",
                    "mnuSetFontStyleBold|lngBold|",
                    "mnuSetFontStyleItalic|lngItalic|",
                    "mnuSetFontStyleUnderline|lngUnderline|",
                    "mnuSetFontStyleOutline|lngOutline|",
                    "mnuSetFontStyleCondense|lngCondense|",
                    "mnuSetFontStyleExtend|lngExtend|",
                    "|---|",
                    "mnuSetAlignLeft|lngAlign Left|",
                    "mnuSetAlignCenter|lngAlign Center|",
                    "|---|",
                    "mnuItemSetFontSize9|lng9|",
                    "mnuItemSetFontSize10|lng10|",
                    "mnuItemSetFontSize12|lng12|",
                    "mnuItemSetFontSize14|lng14|",
                    "mnuItemSetFontSize18|lng18|",
                    "mnuItemSetFontSize24|lng24|",
                ],
            ],
            ["topClock|lng12/28/18", 776, ["|lngPlaceholder|"]],
            [
                "mnuHeaderHelpIcon|icon:001:75:27",
                864,
                ["mnuDlgAboutDoc|lngShow Documentation...|", "mnuDlgAboutScript|lngShow Scripting Reference...|"],
            ],
            [
                "mnuHeaderAppIcon|icon:001:78:27",
                891,
                [
                    "mnuSysAppsHideProduct|lngHide %cProductName|",
                    "mnuSysAppsHideOthers|lngHide Others|",
                    "mnuSysAppsShowAll|lngShow All|",
                    "|---|",
                    "mnuSysAppsCheckProduct|lng%cProductName|",
                ],
            ],
        ];
    }

    init() {
        MenuPositioning.buildFromStruct(this.appli.getController(), this.getMenuStruct(), this.appli.lang());
        MenuPositioning.setItemStatus(this.appli.getUi512App(), "mnuSysAppsHideProduct", undefined, false);
        MenuPositioning.setItemStatus(this.appli.getUi512App(), "mnuSysAppsHideOthers", undefined, false);
        MenuPositioning.setItemStatus(this.appli.getUi512App(), "mnuSysAppsShowAll", undefined, false);
        MenuPositioning.setItemStatus(this.appli.getUi512App(), "mnuSysAppsCheckProduct", true, true);
    }

    refresh() {
        // called whenever selected vel changes
        MenuPositioning.setItemStatus(this.appli.getUi512App(), "mnuPaintWideLines", this.appli.getOption_b("optWideLines"), true);
        MenuPositioning.setItemStatus(
            this.appli.getUi512App(),
            "mnuPaintBlackLines",
            this.appli.getOption_n("optPaintLineColor") === clrBlack,
            true
        );
        MenuPositioning.setItemStatus(
            this.appli.getUi512App(),
            "mnuPaintWhiteLines",
            this.appli.getOption_n("optPaintLineColor") === clrWhite,
            true
        );
        MenuPositioning.setItemStatus(
            this.appli.getUi512App(),
            "mnuPaintBlackFill",
            this.appli.getOption_n("optPaintFillColor") === clrBlack,
            true
        );
        MenuPositioning.setItemStatus(
            this.appli.getUi512App(),
            "mnuPaintWhiteFill",
            this.appli.getOption_n("optPaintFillColor") === clrWhite,
            true
        );
        MenuPositioning.setItemStatus(this.appli.getUi512App(), "mnuPaintNoFill", this.appli.getOption_n("optPaintFillColor") === -1, true);

        MenuPositioning.setItemStatus(this.appli.getUi512App(), "mnuUseHostClipboard", this.appli.getOption_b("optUseHostClipboard"), true);
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(this.appli.getUi512App());
        let topClock = grpbar.getEl("topClock");
        topClock.set("labeltext", this.getDayOfYear());

        let currentTool = this.appli.getOption_n("currentTool");
        let toolCtg = getToolCategory(currentTool);
        for (let i = VpcTool.__first; i <= VpcTool.__last; i++) {
            let check = i === currentTool;
            MenuPositioning.setItemStatus(this.appli.getUi512App(), `mnuItemTool${i}`, check, true);
        }

        let selectedId = toolCtg === VpcToolCtg.ctgEdit ? this.appli.getOption_s("selectedVelId") : "";
        this.refreshCopyPasteMnuItem(selectedId, "mnuCopyCardOrObj", "lngCopy Card", "lngCopy Button", "lngCopy Field");
        let copiedId = this.appli.getOption_s("copiedVelId");
        this.refreshCopyPasteMnuItem(copiedId, "mnuPasteCardOrObj", "lngPaste Card", "lngPaste Button", "lngPaste Field");
    }

    refreshCopyPasteMnuItem(id: string, menuId: string, fallback: string, txtBtn: string, txtFld: string) {
        let found = this.cbGetModel().findByIdUntyped(id);
        if (found && (found.getType() == VpcElType.Btn || found.getType() == VpcElType.Fld)) {
            let txt = found.getType() == VpcElType.Btn ? txtBtn : txtFld;
            MenuPositioning.setItemStatus(this.appli.getUi512App(), menuId, undefined, undefined, this.appli.lang().translate(txt));
        } else {
            MenuPositioning.setItemStatus(this.appli.getUi512App(), menuId, undefined, undefined, this.appli.lang().translate(fallback));
        }
    }

    getDayOfYear() {
        // uses a locale-appropriate format.
        let d = new Date();
        return d.toLocaleDateString();
    }

    translateHotkey(d: KeyDownEventDetails) {
        if (!d.repeated) {
            switch (d.readableShortcut) {
                // ctrl z, ctrl y have to be elsewhere
                case "ArrowLeft":
                    return "onlyIfNotInTextField/mnuGoCardPrev";
                case "ArrowRight":
                    return "onlyIfNotInTextField/mnuGoCardNext";
                case "Home":
                    return "onlyIfNotInTextField/mnuGoCardFirst";
                case "End":
                    return "onlyIfNotInTextField/mnuGoCardLast";
                case "Backspace":
                    return "onlyIfNotInTextField/mnuClear";
                case "Delete":
                    return "onlyIfNotInTextField/mnuClear";
                case "Cmd+S":
                    return "mnuSaveStack";
                case "Cmd+Shift+S":
                    return "mnuSaveStackCopy";
                case "Cmd+M":
                    return "mnuNewCard";
                default:
                    return undefined;
            }
        }

        return undefined;
    }
}
