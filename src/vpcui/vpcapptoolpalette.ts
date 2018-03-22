
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { IsPropPanel, VpcPanelScriptEditor } from "../vpcui/vpcappscripteditor.js";
import { BorderDecorationConsts, PalBorderDecorationConsts, WndBorderDecorationConsts, UI512CompBase, UI512CompRadioButtonGroup, UI512CompToolbox } from "../ui512/ui512composites.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { SelAndEntryImpl, IGenericTextField, UI512ElTextFieldAsGeneric, SelAndEntry, ClipManager } from "../ui512/ui512elementstextselect.js";
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

export class VpcAppToolboxes extends VpcAppInterfaceLayer {
    static readonly toolsIconH = 24;
    toolsmain = new MainToolbox("toolsmain");
    toolspatterns = new PatternsToolbox("toolspatterns");
    toolsnav = new NavToolbox("toolsnav");
    toolsmainDefaultLoc: number[];
    toolsnavDefaultLoc: number[];
    toolspatternsDefaultLoc: number[];
    cbStopCodeRunning: () => void;

    init() {
        // add main toolbox
        const toolsmainw = 24;
        this.toolsmain.iconsetid = "001";
        this.toolsmain.x = this.appli.bounds()[0] + ScreenConsts.xareawidth + 1;
        this.toolsmain.y = this.appli.bounds()[1] + ScreenConsts.ymenubar - 1;
        this.toolsmain.iconh = VpcAppToolboxes.toolsIconH;
        this.toolsmain.widthOfIcon = function(id: string) {
            return toolsmainw;
        };

        this.toolsmain.items = [
            ["browse", 0],
            ["button", 1],
            ["field", 17],
            ["select", 2],
            ["brush", 5],
            ["bucket", 11],
            ["text", 14],
            ["pencil", 4],
            ["line", 7],
            ["lasso", 3],
            ["eraser", 6],
            ["rect", 9],
            ["oval", 12],
            ["roundrect", 10],
            ["curve", 13],
            ["spray", 8],
        ];
        assertEq(16, this.toolsmain.items.length, "6y|");
        this.toolsmain.logicalWidth = this.toolsmain.items.length * toolsmainw - (this.toolsmain.items.length - 1);
        this.toolsmain.logicalHeight = 1;
        this.toolsmain.hasclosebtn = false;
        this.toolsmain.create(this.appli.getUi512App(), this.appli.lang());
        this.toolsmain.callbackOnChange = s => this.toolsmainCallback(s);
        this.toolsmain.setWhich(this.appli.getUi512App(), "edit");
        this.toolsmainDefaultLoc = [this.toolsmain.x, this.toolsmain.y];
        const toolbarheight = 33;

        // add navigation toolbox
        const toolsnavw = 24;
        this.toolsnav.iconsetid = "001";
        this.toolsnav.x = this.toolsmain.x;
        this.toolsnav.y = this.toolsmain.y + toolbarheight;
        this.toolsnav.iconh = 24;
        this.toolsnav.widthOfIcon = function(id: string) {
            return toolsnavw;
        };
        const black = 77;
        this.toolsnav.items = [["nuCardNumOrStop", black], ["cardPrev", 94], ["cardNext", 95], ["nuRunStatus", black]];
        this.toolsnav.logicalWidth = this.toolsnav.items.length * toolsnavw - (this.toolsnav.items.length - 1);
        this.toolsnav.logicalHeight = 1;
        this.toolsnav.hasclosebtn = false;
        this.toolsnav.create(this.appli.getUi512App(), this.appli.lang());
        this.toolsnav.callbackOnChange = s => this.toolsnavCallback(s);
        this.toolsnav.setWhich(this.appli.getUi512App(), undefined);
        this.toolsnavDefaultLoc = [this.toolsnav.x, this.toolsnav.y];

        // add patterns toolbox
        const toolspatternsw = 24;
        const toolspatternperrow = 16;
        this.toolspatterns.iconsetid = "001";
        this.toolspatterns.x = this.toolsmain.x;
        this.toolspatterns.y = this.toolsnav.y + toolbarheight;
        this.toolspatterns.iconh = 24;
        this.toolspatterns.widthOfIcon = function(id: string) {
            return toolspatternsw;
        };
        this.toolspatterns.logicalWidth = toolspatternperrow * toolspatternsw - (toolspatternperrow - 1);
        this.toolspatterns.logicalHeight = 1;
        this.toolspatterns.items = [
            ["pattern100", 76],
            ["pattern148", 74],
            ["pattern101", 36],
            ["pattern102", 37],
            ["pattern103", 38],
            ["pattern104", 39],
            ["pattern106", 40],
            ["pattern107", 41],
            ["pattern108", 42],
            ["pattern109", 43],
            ["pattern110", 44],
            ["pattern111", 45],
            ["pattern112", 46],
            ["pattern113", 47],
            ["pattern114", 48],
            ["pattern115", 49],
            ["pattern116", 50],
            ["pattern117", 51],
            ["pattern118", 52],
            ["pattern119", 53],
            ["pattern120", 54],
            ["pattern121", 55],
            ["pattern122", 56],
            ["pattern123", 57],
            ["pattern124", 58],
            ["pattern125", 59],
            ["pattern126", 60],
            ["pattern127", 61],
            ["pattern128", 62],
            ["pattern129", 63],
            ["pattern130", 64],
            ["pattern131", 65],
            ["pattern132", 66],
            ["pattern133", 67],
            ["pattern134", 68],
            ["pattern135", 69],
            ["pattern136", 70],
            ["pattern137", 71],
            ["pattern138", 72],
            ["pattern139", 73],
            ["pattern140", 82],
            ["pattern141", 83],
            ["pattern142", 84],
            ["pattern143", 85],
            ["pattern144", 86],
            ["pattern145", 87],
            ["pattern146", 88],
            ["pattern105", 77],
        ];
        assertEq(48, this.toolspatterns.items.length, "6x|");
        this.toolspatterns.hasclosebtn = false;
        this.toolspatterns.create(this.appli.getUi512App(), this.appli.lang());
        this.toolspatterns.callbackOnChange = s => this.toolspatternsCallback(s);
        this.toolspatternsDefaultLoc = [this.toolspatterns.x, this.toolspatterns.y];
        this.toolspatterns.setWhich(this.appli.getUi512App(), this.appli.getOption_s("currentPattern"));
    }

    toolsmainCallback(id: O<string>) {
        let toolParsed: VpcTool;
        if (id) {
            toolParsed = getStrToEnum<VpcTool>(VpcTool, "VpcTool", id);
            this.appli.setTool(toolParsed);
        } else {
            assertTrueWarn(false, `6w|invalid tool id ${id}`);
        }
    }

    toolsnavCallback(id: O<string>) {
        // immediately undo the highlight
        this.toolsnav.setWhich(this.appli.getUi512App(), undefined);
        if (id === "cardNext") {
            this.appli.setCurrentCardNum(OrdinalOrPosition.next);
        } else if (id === "cardPrev") {
            this.appli.setCurrentCardNum(OrdinalOrPosition.previous);
        } else if (id === "nuCardNumOrStop") {
            this.cbStopCodeRunning();
        }
    }

    toolspatternsCallback(id: O<string>) {
        if (id && slength(id) > 0) {
            this.appli.setOption("currentPattern", id);
        }
    }

    isElemStopRunning(el: O<UI512Element>): boolean {
        if (el) {
            let short = this.toolsnav.fromFullId(el.id);
            return short === "choice##nuCardNumOrStop";
        } else {
            return false;
        }
    }

    refresh() {
        // don't call this.setOption in this method -- it could cause an infinite loop
        let currentTool = this.appli.getOption_n("currentTool");
        let isFullscreen = this.appli.getOption_b("optFullscreen");

        // position toolboxes according to fullscreen mode
        if (isFullscreen) {
            this.toolsmain.setVisible(this.appli.getUi512App(), false);
            this.toolsnav.moveAllTo(this.toolsnavDefaultLoc[0], 0, this.appli.getUi512App());
        } else {
            this.toolsmain.setVisible(this.appli.getUi512App(), true);
            this.toolsnav.moveAllTo(this.toolsnavDefaultLoc[0], this.toolsnavDefaultLoc[1], this.appli.getUi512App());
        }

        // main toolbox
        this.toolsmain.setWhich(this.appli.getUi512App(), findEnumToStr<VpcTool>(VpcTool, currentTool));

        // navigation toolbox
        let coderunning = this.appli.isCodeRunning();
        let cardnum = this.appli.getCurrentCardNum();
        this.toolsnav.refreshNavIcons(this.appli.getUi512App(), coderunning, cardnum, isFullscreen);

        // patterns toolbox
        this.toolspatterns.setVisible(this.appli.getUi512App(), currentTool === VpcTool.bucket);
    }
}

class MainToolbox extends UI512CompToolbox {
    compositeType = "toolbox_main";
    checkIfCloseBoxClicked(app: UI512Application, d: MouseUpEventDetails, tb: VpcAppToolboxes) {
        if (d.elClick) {
            let short = this.fromFullId(d.elClick.id);
            if (short === "closebtn") {
                // closing the main toolbox enters fullscreen mode.
                // go to full screen
                //tb.toolsnavCallback("toggleFullscreen");
            }
        }

        super.listenMouseUp(app, d);
    }
}

class NavToolbox extends UI512CompToolbox {
    compositeType = "toolbox_nav";

    protected refreshHighlight(app: UI512Application) {
        // don't set the highlight or autohighlight of anything
    }

    refreshNavIcons(app: UI512Application, coderunning: boolean, cardnum: number, isFullscreen: boolean) {
        this.setWhich(app, undefined);
        let grpnav = app.getGroup(this.grpid);

        let cardNumOrStop = grpnav.getEl(this.getElId("choice##nuCardNumOrStop"));
        if (coderunning) {
            cardNumOrStop.set("iconsetid", "001");
            cardNumOrStop.set("iconnumber", 90);
            cardNumOrStop.set("labeltext", "");
            cardNumOrStop.set("autohighlight", true);
        } else {
            cardNumOrStop.set("iconsetid", "");
            cardNumOrStop.set("iconnumber", -1);
            let font = new TextFontSpec("geneva", 0, 10);
            let s = TextRendererFontManager.setInitialFont((cardnum + 1).toString(), font.toSpecString());
            cardNumOrStop.set("labeltext", s);
            cardNumOrStop.set("autohighlight", false);
        }

        let showRunStatus = grpnav.getEl(this.getElId("choice##nuRunStatus"));
        showRunStatus.set("autohighlight", false);
        if (coderunning) {
            this.changeIcon(app, "choice##nuRunStatus", 91);
        } else {
            this.changeIcon(app, "choice##nuRunStatus", 19);
        }
    }
}

class PatternsToolbox extends UI512CompToolbox {
    // instead of hiliting the current item, draw a box around it
    compositeType = "toolbox_patterns";
    borders: UI512ElButton[] = [];
    createSpecific(app: UI512Application, lang: UI512Lang) {
        super.createSpecific(app, lang);
        let grp = app.getGroup(this.grpid);
        for (let i = 0; i < 4; i++) {
            this.borders[i] = this.genBtn(app, grp, "selectwithbox" + i);
            this.borders[i].set("autohighlight", false);
        }

        let choiceblack = grp.getEl(this.getElId("choice##pattern105"));
        choiceblack.set("iconadjustwidth", 17 - 32);
        choiceblack.set("iconadjustheight", 12 - 32);
    }

    protected refreshHighlight(app: UI512Application) {
        let grp = app.getGroup(this.grpid);
        let lookfor = this.whichChosen;
        for (let item of this.items) {
            let id = this.getElId("choice##" + item[0]);
            let el = grp.getEl(id);
            el.set("highlightactive", false);
            el.set("autohighlight", item[0] !== lookfor);
            if (item[0] === lookfor) {
                let shrink = 2;
                let subr = [el.x, el.y, el.w - 2, el.h - 2];
                if (this.borders.length) {
                    this.borders[0].setDimensions(subr[0], subr[1], subr[2], 2);
                    this.borders[1].setDimensions(subr[0], subr[1], 2, subr[3]);
                    this.borders[2].setDimensions(subr[0] + subr[2], subr[1], 2, subr[3]);
                    this.borders[3].setDimensions(subr[0], subr[1] + subr[3], subr[2], 2);
                }
            }
        }
    }
}

export class VpcAppResizeHandles extends VpcAppInterfaceLayer {
    readonly resizeBoxSize = 8;
    sizeHandles: UI512Element[] = [];
    whichHandle(id: string) {
        if (id === "grpAppHelperElemsHandle0") {
            return 0;
        } else if (id === "grpAppHelperElemsHandle1") {
            return 1;
        }
        if (id === "grpAppHelperElemsHandle2") {
            return 2;
        }
        if (id === "grpAppHelperElemsHandle3") {
            return 3;
        } else {
            return undefined;
        }
    }

    static getGrpHelperElems(app: UI512Application) {
        let fnd = app.findGroup("grpAppHelperElems");
        if (fnd) {
            return fnd;
        } else {
            let grp = new UI512ElGroup("grpAppHelperElems");
            app.addGroup(grp);
            return grp;
        }
    }

    init() {
        // create resize handles
        let grpHelperElems = VpcAppResizeHandles.getGrpHelperElems(this.appli.getUi512App());
        for (let i = 0; i < 4; i++) {
            let handle = new UI512ElButton(`grpAppHelperElemsHandle${i}`);
            grpHelperElems.addElement(this.appli.getUi512App(), handle);
            handle.set("style", UI512BtnStyle.rectangle);
            handle.set("visible", true);
            handle.set("autohighlight", false);
            handle.set("highlightactive", true);
            handle.setDimensions(0, 0, this.resizeBoxSize, this.resizeBoxSize);
            this.sizeHandles[i] = handle;
        }
    }

    getSelectedUiElForHandles(currentTool: VpcTool) {
        let selectedVelId = this.appli.getOption_s("selectedVelId");
        if (getToolCategory(currentTool) === VpcToolCtg.ctgEdit && slength(selectedVelId)) {
            // if the current card / stack is selected,
            // we won't find an element, that's ok.
            let uigrp = this.appli.getUi512App().getGroup("VpcModelRender");
            return uigrp.findEl("VpcModelRender$$" + selectedVelId);
        } else {
            return undefined;
        }
    }

    refresh() {
        let currentTool = this.appli.getOption_n("currentTool");
        let uiel = this.getSelectedUiElForHandles(currentTool);
        if (uiel) {
            this.sizeHandles[0].setDimensions(
                uiel.x - this.sizeHandles[0].w / 2,
                uiel.y - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );
            this.sizeHandles[1].setDimensions(
                uiel.x + uiel.w - this.sizeHandles[0].w / 2,
                uiel.y - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );
            this.sizeHandles[2].setDimensions(
                uiel.x - this.sizeHandles[0].w / 2,
                uiel.y + uiel.h - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );
            this.sizeHandles[3].setDimensions(
                uiel.x + uiel.w - this.sizeHandles[0].w / 2,
                uiel.y + uiel.h - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );
        } else {
            for (let handle of this.sizeHandles) {
                handle.setDimensions(-400, -400, handle.w, handle.h);
            }
        }
    }
}

export class VpcAppCoverArea extends VpcAppInterfaceLayer {
    elems: { [key: string]: UI512Element } = {};

    init() {
        let grpHelperElems = VpcAppResizeHandles.getGrpHelperElems(this.appli.getUi512App());

        // create a white opaque rectangle to cover up user elements that leave the user area
        this.elems.cover = new UI512ElButton("grpAppHelperElemsCover");
        grpHelperElems.addElement(this.appli.getUi512App(), this.elems.cover);
        this.elems.cover.set("style", UI512BtnStyle.opaque);
        this.elems.cover.set("autohighlight", false);
        let coverx = this.appli.bounds()[0] + ScreenConsts.xareawidth;
        let covery = this.appli.bounds()[1];
        let coverw = 10 + this.appli.bounds()[2] - ScreenConsts.xareawidth;
        let coverh = 10 + this.appli.bounds()[3];
        this.elems.cover.setDimensions(coverx, covery, coverw, coverh);

        // a message to the user saying "nyi"
        const margin = 45;
        let msg = this.appli.lang().translate("lng(This feature is not yet supported.)");
        let font = new TextFontSpec("geneva", 0, 10);
        msg = TextRendererFontManager.setInitialFont(msg, font.toSpecString());
        this.elems.nyiMsg = new UI512ElLabel("grpAppHelperElemsNyiMsg");
        grpHelperElems.addElement(this.appli.getUi512App(), this.elems.nyiMsg);
        this.elems.nyiMsg.set("visible", false);
        this.elems.nyiMsg.set("labeltext", msg);
        this.elems.nyiMsg.set("labelwrap", true);
        this.elems.nyiMsg.set("labelhalign", true);
        this.elems.nyiMsg.set("labelvalign", true);
        this.elems.nyiMsg.setDimensions(this.elems.cover.x, this.elems.cover.y, this.elems.cover.w, this.elems.cover.h);
    }

    refresh() {
        let currentTool = this.appli.getOption_n("currentTool");
        let showNyi = getToolCategory(currentTool) === VpcToolCtg.ctgNyi;
        this.elems.nyiMsg.set("visible", showNyi);
    }
}

export class VpcAppFullScreenCovers extends VpcAppInterfaceLayer {
    elems: { [key: string]: UI512Element } = {};

    init() {
        let grpFullscreen = new UI512ElGroup("grpAppHelperFullscreen");
        this.appli.getUi512App().addGroup(grpFullscreen);
        grpFullscreen.setVisible(false);
    }

    refresh() {
        let isFullscreen = this.appli.getOption_b("optFullscreen");
        let grpFullscreen = this.appli.getUi512App().getGroup("grpAppHelperFullscreen");
        grpFullscreen.setVisible(isFullscreen);
    }
}
