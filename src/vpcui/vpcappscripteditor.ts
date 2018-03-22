
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { BorderDecorationConsts, PalBorderDecorationConsts, WndBorderDecorationConsts, UI512CompBase, UI512CompRadioButtonGroup, UI512CompToolbox } from "../ui512/ui512composites.js";
import { UI512AutoIndent, UI512CompCodeEditor } from "../ui512/ui512compositeseditor.js";
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


export interface IsPropPanel {
    x: number;
    y: number;
    logicalWidth: number;
    logicalHeight: number;
    appli: IVpcStateInterface;
    create(app: UI512Application, lang: UI512Lang): void;
    setVisible(app: UI512Application, visible: boolean): void;
    refreshFromModel(root: Root, app: UI512Application): void;
    saveChangesToModel(root: Root, app: UI512Application): void;
    fromFullId(fullid: string): O<string>;
    cbGetAndValidateSelectedVel: (prp: string) => O<VpcElBase>;
}

export class VpcPanelScriptEditor extends UI512CompCodeEditor implements IsPropPanel {
    isVpcPanelScriptEditor = true;
    hasCloseBtn = true;
    autoCreateBlock = true;
    compositeType = "VpcPanelScriptEditor";
    lineCommentPrefix = "--~ ";
    el: O<UI512ElTextField>;
    //appl:VpcApplication
    appli: IVpcStateInterface;
    wasEditingId = "_";
    cbGetAndValidateSelectedVel: (prp: string) => O<VpcElBase>;
    protected status1a: UI512ElLabel;
    protected status1b: UI512ElLabel;
    protected status2a: UI512ElLabel;
    protected status2b: UI512ElButton;
    protected status2c: UI512ElLabel;
    protected status3: UI512ElLabel;
    constructor(compositeId: string) {
        super(compositeId);
        this.autoIndent.lineContinuation = ["\\"];
        this.autoIndent.linesCauseIndent = [
            [/^repeat\b/, /^end\s+repeat\b/],
            [/^if\b/, /^else|end\s+if\b/],
            [/^else\b/, /^else|end\s+if\b/],
            [/^on\s+(\w+)\b/, /^end\s+%MATCH%\b/],
            [/^func\s+(\w+)\b/, /^end\s+%MATCH%\b/],
        ];

        this.autoIndent.caseSensitive = true;
        this.autoIndent.useTabs = true;
        this.autoIndent.useAutoIndent = true;
        this.autoIndent.useAutoCreateBlock = true;
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        console.log("hack...");
        this.logicalWidth -= 50; // occurs because apparent discrepency between 'screenwidth' and bounds[2], not sure why those don't match
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawWindowDecoration(app, new WndBorderDecorationConsts(), this.hasCloseBtn);

        let cury = this.y + headerheight - 1;
        const spacerheight = 6;
        let spacer = this.genBtn(app, grp, "spacer");
        spacer.set("autohighlight", false);
        spacer.setDimensions(this.x, cury, this.logicalWidth, spacerheight);
        cury += spacerheight - 1;

        const footerHeight = 65;

        this.el = this.genChild(app, grp, "editor", UI512ElTextField);
        this.el.set("style", UI512FldStyle.rectangle);
        this.el.set("labelwrap", false);
        this.el.set("scrollbar", true);
        this.el.set("defaultFont", UI512CompCodeEditor.currentFont);
        this.el.set("nudgey", 2);
        this.el.setDimensions(this.x, cury, this.logicalWidth, this.y + this.logicalHeight - cury - footerHeight);

        this.status1a = this.genChild(app, grp, "status1a", UI512ElLabel);
        this.status1a.setDimensions(this.el.x, this.el.bottom, 90, 20);
        this.status1a.set("labeltext", "status1a");
        this.status1b = this.genChild(app, grp, "status1b", UI512ElLabel);
        this.status1b.setDimensions(this.el.x + 90, this.el.bottom, this.el.w - 90, 20);
        this.status1b.set("labeltext", "status1b");

        this.status2a = this.genChild(app, grp, "status2a", UI512ElLabel);
        this.status2a.setDimensions(this.el.x, this.status1a.bottom, 90, 20);
        this.status2a.set("labeltext", "status2a");
        this.status2b = this.genBtn(app, grp, "status2b");
        this.status2b.setDimensions(this.el.x + 90, this.status1a.bottom, 20, 20);
        this.status2b.set("labeltext", "a");
        this.status2c = this.genChild(app, grp, "status2c", UI512ElLabel);
        this.status2c.setDimensions(this.el.x + 90 + 20, this.status1a.bottom, this.el.w - (90 + 20), 20);
        this.status2c.set("labeltext", "status2c");

        this.status3 = this.genChild(app, grp, "status3", UI512ElLabel);
        this.status3.setDimensions(this.el.x, this.status2a.bottom, this.el.w, 20);
        this.status3.set("labeltext", "status3");

        this.status2b.set("style", UI512BtnStyle.opaque);
        this.status2b.set("labeltext", "");
        this.status2b.set("autohighlight", false);
    }

    refreshStatusLabels(canUpdateComp = false) {
        let currentlyEditing = this.appli.getOption_s("viewingScriptOfId");
        let lastRuntimeErr = this.appli.getOption_s("viewingScriptLastRuntimeErr").split("/");
        if (currentlyEditing === lastRuntimeErr[0]) {
            this.status1a.set("labeltext", lastRuntimeErr[1]);
            this.status1b.set("labeltext", lastRuntimeErr[2]);
        } else {
            this.status1a.set("labeltext", "");
            this.status1b.set("labeltext", "");
        }

        if (canUpdateComp) {
            let lastCompileErr = this.appli.getOption_s("viewingScriptLastCompileErr").split("/");
            if (currentlyEditing === lastCompileErr[0]) {
                this.status2a.set("labeltext", lastCompileErr[1]);
                this.status2c.set("labeltext", lastCompileErr[2]);
                this.status2b.set("iconsetid", "001");
                this.status2b.set("iconnumber", 30);
            } else {
                this.status2a.set("labeltext", "Status:");
                this.status2c.set("labeltext", "");
                this.status2b.set("iconsetid", "001");
                this.status2b.set("iconnumber", 19);
            }
        }

        this.status3.set("labeltext", "");
    }

    refreshFromModel(root: Root, app: UI512Application) {
    }

    sendClick(root: Root, app: UI512Application, clicked: string): any {
        if (clicked.endsWith("##btnScript")) {
            this.appli.setOption("viewingScript", true);
            this.appli.setOption("viewingScriptOfId", this.appli.getOption_s("selectedVelId"));
            this.refreshFromModel(root, app);
        } else if (clicked.endsWith("pcPanelScriptEditor##caption")) {
            this.saveChangesToModel(root, app);
            this.appli.setOption("viewingScript", false);
        } else if (scontains(clicked, "##status")) {
            let grp = app.getGroup(this.grpid);
            let el = grp.getEl(clicked);
            let fullstatus = el.get_s("labeltext");
            console.log("full status:");
            console.log(fullstatus);
        }
    }

    saveChangesToModel(root: Root, app: UI512Application) {
    }
}
