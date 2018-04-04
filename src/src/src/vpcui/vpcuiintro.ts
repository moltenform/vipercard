
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { OpenFromLocation, provideOpenFromLocal, VpcDocLoader } from "../vpcui/vpcuiintroprovider.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { MouseDragStatus, UI512Controller } from "../ui512/ui512controller.js";
import { EditTextBehavior, addDefaultListeners } from "../ui512/ui512elementstextlisten.js";
import { UI512CompStdDialogType, UI512CompStdDialog } from "../ui512/ui512compositesmodal.js";
import { BorderDecorationConsts, PalBorderDecorationConsts, WndBorderDecorationConsts, UI512CompBase, UI512CompRadioButtonGroup, UI512CompToolbox } from "../ui512/ui512composites.js";
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

declare var saveAs: any;

export class VpcUiIntro extends UI512Controller {
    counter = 0;
    activePage: IntroPageBase;
    root: Root;
    bounds: number[];
    init(root: Root) {
        super.init(root);
        addDefaultListeners(this.listeners);
        this.root = root;
        this.bounds = getStandardWindowBounds();
        this.app = new UI512Application(this.bounds, this);
        let grp = new UI512ElGroup("grpmain");
        this.app.addGroup(grp);

        // draw bg
        let fullBg = new UI512ElButton("bg");
        grp.addElement(this.app, fullBg);
        fullBg.set("style", UI512BtnStyle.opaque);
        fullBg.setDimensions(this.bounds[0], this.bounds[1], this.bounds[2], this.bounds[3]);
        fullBg.set("autohighlight", false);

        // draw gray bg
        let offsetForBetterPattern = -1;
        let layoutPatternBg = new GridLayout(offsetForBetterPattern, 0, 220, 512, Util512.range(5), Util512.range(2), -4, -4);
        layoutPatternBg.createElems(this.app, grp, "bgpattern", UI512ElButton, (col, row, el) => {
            el.set("iconsetid", "logo");
            el.set("iconnumber", 1);
            el.set("style", UI512BtnStyle.transparent);
            el.set("autohighlight", false);
        });

        this.activePage = new IntroFirstPage("introFirstPage", this.bounds);
        this.activePage.create(this.app, this.lang);

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseDown, VpcUiIntro.respondMouseDown);
        this.listenEvent(UI512EventType.MouseUp, VpcUiIntro.respondMouseUp);
        this.listenEvent(UI512EventType.MouseMove, VpcUiIntro.respondMouseMove);
        this.listenEvent(UI512EventType.KeyDown, VpcUiIntro.respondKeyDown);
        this.listenEvent(UI512EventType.Idle, VpcUiIntro.respondIdle);
        this.rebuildFieldScrollbars();
        this.inited = true;
    }

    newDocument() {
        let loader = new VpcDocLoader(this.lang, this.root, "", this.lang.translate("lngnew stack"), OpenFromLocation.NewDoc);
        this.beginLoadDocument(loader);
    }

    getModal() {
        return new UI512CompStdDialog("mainModalDlg", this.lang);
    }

    static respondKeyDown(c: VpcUiIntro, root: Root, d: KeyDownEventDetails) {
        if (c.activePage) {
            c.activePage.respondKeyDown(c, root, d);
        }
    }

    static respondMouseUp(c: VpcUiIntro, root: Root, d: MouseUpEventDetails) {
        if (c.activePage) {
            c.activePage.respondMouseUp(c, root, d);
        }

        if (d.elClick && c.activePage.compositeType === "IntroFirstPage") {
            let isCmdShift = (d.mods & ModifierKeys.Command) != 0 && (d.mods & ModifierKeys.Shift) != 0;
            IntroFirstPage.respondBtnClick(c, root, c.activePage as IntroFirstPage, d.elClick, isCmdShift);
        } else if (d.elClick && c.activePage.compositeType === "IntroOpenPage") {
            IntroOpenPage.respondBtnClick(c, root, c.activePage as IntroOpenPage, d.elClick);
        } else if (d.elClick && c.activePage.compositeType === "IntroLoadingPage") {
            IntroLoadingPage.respondBtnClick(c, root, c.activePage as IntroLoadingPage, d.elClick);
        } else if (d.elClick && c.activePage.compositeType === "IntroLoadFromDiskPage") {
            IntroLoadFromDiskPage.respondBtnClick(c, root, c.activePage as IntroLoadFromDiskPage, d.elClick);
        }
    }

    beginLoadDocument(loader: VpcDocLoader) {
        this.provideExitCallbacks(loader);
        let translatedLoadMessage = this.lang.translate("lngLoading %docname");
        translatedLoadMessage = translatedLoadMessage.replace(/%docname/g, loader.docname);
        let [x, y] = [this.activePage.x, this.activePage.y];
        this.activePage.destroy(this.app);
        this.activePage = new IntroLoadingPage("introLoadingPage", this.bounds, x, y, loader, translatedLoadMessage, this.root);
        this.activePage.create(this.app, this.lang);
    }

    protected provideExitCallbacks(loader: VpcDocLoader) {
        let exitToMainMenu = () => {
            let ctrller = new VpcUiIntro();
            ctrller.init(this.root);
            this.root.replaceCurrentController(ctrller);
            return ctrller;
        };
        loader.cbExitToMainMenu = () => {
            exitToMainMenu();
        };
        loader.cbExitToNewDocument = () => {
            let ctrller = exitToMainMenu();
            ctrller.newDocument();
        };
    }

    static respondMouseDown(c: VpcUiIntro, root: Root, d: MouseDownEventDetails) {
        if (c.activePage) {
            c.activePage.respondMouseDown(c, root, d);
        }
    }

    static respondMouseMove(c: VpcUiIntro, root: Root, d: MouseMoveEventDetails) {
        if (c.activePage) {
            c.activePage.respondMouseMove(c, root, d);
        }
    }

    static respondIdle(c: VpcUiIntro, root: Root, d: IdleEventDetails) {
        let introLoadingPage = c.activePage as IntroLoadingPage;
        if (introLoadingPage.isIntroLoadingPage) {
            introLoadingPage.checkIfLoadComplete(c.app, d);
        }
    }
}

abstract class IntroPageBase extends UI512CompBase {
    protected canDrag = true;
    protected isDraggingWindow = false;
    protected fadedWindowDragging: UI512ElButton[] = [];
    protected dragOffsetX = 0;
    protected dragOffsetY = 0;
    protected appBounds: number[];
    hasclosebtn = false;
    btnIds: { [key: string]: string } = {};

    constructor(compid: string, bounds: number[], x?: number, y?: number) {
        super(compid);
        this.logicalWidth = 512;
        this.logicalHeight = 342;
        this.appBounds = bounds;

        if (x === undefined || y === undefined) {
            this.x = bounds[0] + Math.trunc((bounds[2] - this.logicalWidth) / 2);
            this.y = bounds[1] + Math.trunc((bounds[3] - this.logicalHeight) / 2);
        } else {
            this.x = x;
            this.y = y;
        }
    }

    drawCommonFirst(app: UI512Application, grp: UI512ElGroup, lang: UI512Lang) {
        let wndbg = this.genBtn(app, grp, "wndbg");
        wndbg.set("style", UI512BtnStyle.shadow);
        wndbg.set("autohighlight", false);
        wndbg.setDimensions(this.x, this.y, this.logicalWidth + 1, this.logicalHeight + 2);
        let headerheight = this.drawWindowDecoration(app, new WndBorderDecorationConsts(), this.hasclosebtn);

        let caption = grp.getEl(this.getElId("caption"));
        caption.set("labeltext", lang.translate("lngWelcome to %cProductName"));

        let footerText = this.genChild(app, grp, "footerText", UI512ElLabel);
        footerText.set("labeltext", lang.translate("lngby Ben Fisher"));
        footerText.setDimensions(this.x + 5, this.y + this.logicalHeight - 20, 300, 20);

        let footerTextRight = this.genChild(app, grp, "footerTextRight", UI512ElLabel);
        footerTextRight.set("labelwrap", true);
        footerTextRight.setDimensions(this.x + 200, this.y + this.logicalHeight - 60, 300, 55);
        return headerheight;
    }

    drawCommonLast(app: UI512Application, grp: UI512ElGroup, lang: UI512Lang) {
        for (let i of Util512.range(6)) {
            this.fadedWindowDragging[i] = this.genBtn(app, grp, `faded${i}`);
            this.fadedWindowDragging[i].set("style", UI512BtnStyle.transparent);
            this.fadedWindowDragging[i].set("iconsetid", "logo");
            this.fadedWindowDragging[i].set("iconnumber", 1);
        }

        this.setFadedDragPositions(this.x, this.y);
        this.setFadedDragPositionsVisible(false);
    }

    setFadedDragPositionsVisible(v: boolean) {
        for (let el of this.fadedWindowDragging) {
            el.set("visible", v);
        }
    }

    setFadedDragPositions(x: number, y: number) {
        // vertical ones
        this.fadedWindowDragging[0].setDimensions(x, y, 1, this.logicalHeight);
        this.fadedWindowDragging[1].setDimensions(x + this.logicalWidth, y, 1, this.logicalHeight);

        // horizontal ones
        const half = Math.floor(this.logicalWidth / 2);
        this.fadedWindowDragging[2].setDimensions(x, y, half, 1);
        this.fadedWindowDragging[3].setDimensions(x + half, y, half, 1);
        this.fadedWindowDragging[4].setDimensions(x, y + this.logicalHeight, half, 1);
        this.fadedWindowDragging[5].setDimensions(x + half, y + this.logicalHeight, half, 1);
    }

    respondMouseDown(c: UI512Controller, root: Root, d: MouseDownEventDetails) {
        if (d.el && d.el.id === this.getElId("caption") && !this.isDraggingWindow && this.canDrag) {
            this.isDraggingWindow = true;

            this.setFadedDragPositions(this.x, this.y);
            this.setFadedDragPositionsVisible(true);
            this.dragOffsetX = d.mouseX - this.x;
            this.dragOffsetY = d.mouseY - this.y;
        }
    }

    respondMouseMove(c: UI512Controller, root: Root, d: MouseMoveEventDetails) {
        this.setFadedDragPositions(d.mouseX - this.dragOffsetX, d.mouseY - this.dragOffsetY);
    }

    respondKeyDown(c: VpcUiIntro, root: Root, d: KeyDownEventDetails) {}

    respondMouseUp(c: UI512Controller, root: Root, d: MouseUpEventDetails) {
        if (this.isDraggingWindow) {
            this.isDraggingWindow = false;
            this.setFadedDragPositionsVisible(false);
            let nextx = this.fadedWindowDragging[0].x;
            let nexty = this.fadedWindowDragging[0].y;

            // we won't let you drag it all of the way off the screen
            nextx = fitIntoInclusive(nextx, this.appBounds[0], this.appBounds[0] + this.appBounds[2] - this.logicalWidth);
            nexty = fitIntoInclusive(nexty, this.appBounds[1], this.appBounds[1] + this.appBounds[3] - 100);
            this.moveAllTo(nextx, nexty, c.app);
        }
    }

    protected drawBtn(app: UI512Application, grp: UI512ElGroup, n: number, x: number, y: number, w: number, h: number, lang: UI512Lang) {
        let btn = this.genBtn(app, grp, `choicebtn${n}`);
        let labeltext = n === 0 ? "lngOK" : "lngCancel";
        btn.set("style", n === 0 ? UI512BtnStyle.osdefault : UI512BtnStyle.osstandard);
        btn.set("autohighlight", true);
        btn.set("labeltext", lang.translate(labeltext));
        btn.setDimensions(x, y, w, h);
    }
}

class IntroFirstPage extends IntroPageBase {
    compositeType = "IntroFirstPage";

    createSpecific(app: UI512Application, lang: UI512Lang) {
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawCommonFirst(app, grp, lang);
        // draw weird hands
        let cbHands = (a: number, b: number, el: UI512ElButton) => {
            el.set("iconsetid", "logo");
            el.set("iconnumber", 2);
            el.set("style", UI512BtnStyle.transparent);
            el.set("autohighlight", false);
            this.children.push(el);
        };
        const ptwidth = 66,
            ptheight = 110,
            iconw = 24,
            iconh = 24;
        let layoutIconPattern = new GridLayout(
            this.x + 26,
            this.y + 39,
            iconw,
            iconh,
            Util512.range(7),
            Util512.range(3),
            ptwidth - iconw,
            ptheight - iconh
        );
        layoutIconPattern.createElems(app, grp, this.getElId("wallpaper1"), UI512ElButton, cbHands);
        layoutIconPattern = new GridLayout(
            this.x + 26 + ptwidth / 2,
            this.y + 39 + ptheight / 2,
            iconw,
            iconh,
            Util512.range(7),
            Util512.range(2),
            ptwidth - iconw,
            ptheight - iconh
        );
        layoutIconPattern.createElems(app, grp, this.getElId("wallpaper2"), UI512ElButton, cbHands);

        const footerheight = 45,
            numbtns = 4;
        const btnwidth = 200,
            btnheight = 24,
            btnmargin = 22;
        const yspacebtns = numbtns * btnheight + (numbtns - 1) * btnmargin;
        const yspace = this.logicalHeight - (headerheight + footerheight);
        const ycentered = this.y + headerheight + Math.trunc((yspace - yspacebtns) / 2);
        const btnx = this.x + Math.trunc((this.logicalWidth - btnwidth) / 2);

        let coverbgforbtns = this.genBtn(app, grp, "coverbgforbtns");
        coverbgforbtns.set("style", UI512BtnStyle.opaque);
        coverbgforbtns.set("autohighlight", false);
        coverbgforbtns.setDimensions(btnx, ycentered, btnwidth, yspacebtns);

        const btnKeywords = ["new", "openLocal", "openWeb", "openUpload"];
        const btnLabels = ["lngStart new stack", "lngOpen from my stacks...", "lngOpen from web...", "lngOpen from .json file..."];
        let layoutgrid = new GridLayout(btnx, ycentered, btnwidth, btnheight, [0], Util512.range(numbtns), btnmargin, btnmargin);
        layoutgrid.combinations((n, a, b, bnds) => {
            let id = "choice_" + btnKeywords[b];
            let el = this.genBtn(app, grp, id);
            el.setDimensions(bnds[0], bnds[1], bnds[2], bnds[3]);
            el.set("style", UI512BtnStyle.osstandard);
            el.set("labeltext", lang.translate(btnLabels[b]));
        });

        this.drawCommonLast(app, grp, lang);
    }

    static respondBtnClick(c: VpcUiIntro, root: Root, self: IntroFirstPage, el: UI512Element, isCtrlShift?: boolean) {
        if (el.id.endsWith("choice_new")) {
            c.newDocument();
        } else if (el.id.endsWith("choice_openWeb")) {
            assertEq(c.activePage.compositeType, "IntroFirstPage", "");
            let grp = c.app.getGroup(c.activePage.grpid);
            let footerText = grp.getEl(c.activePage.getElId("footerTextRight"));
            footerText.set(
                "labeltext",
                c.lang.translate(`lngThis feature has not yet been written.
Please consider donating to Patreon so that this feature can be added.`)
            );
        } else if (el.id.endsWith("choice_openUpload")) {
            let [x, y] = [c.activePage.x, c.activePage.y];
            c.activePage.destroy(c.app);
            c.activePage = new IntroLoadFromDiskPage("IntroLoadFromDiskPage", c.bounds, x, y, c, c.root);
            c.activePage.create(c.app, c.lang);
        } else if (el.id.endsWith("choice_openLocal")) {
            let shouldShowAll = !!isCtrlShift;
            let data = provideOpenFromLocal(shouldShowAll);
            let [x, y] = [c.activePage.x, c.activePage.y];
            c.activePage.destroy(c.app);
            c.activePage = new IntroOpenPage("introOpenPage", c.bounds, x, y, data, c.root, shouldShowAll);
            c.activePage.create(c.app, c.lang);
        }
    }
}

class IntroOpenPage extends IntroPageBase {
    compositeType = "IntroOpenPage";
    chooser: O<UI512ElTextField>;

    constructor(
        compid: string,
        bounds: number[],
        x: number,
        y: number,
        public data: [string, string][],
        protected root: Root,
        protected showAll: boolean
    ) {
        super(compid, bounds, x, y);

        // sort data by first element (name)
        data.sort((afull, bfull) => {
            let a = afull[0],
                b = bfull[0];
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawCommonFirst(app, grp, lang);

        // draw the OK and cancel buttons
        let wndbg = grp.getEl(this.getElId("wndbg"));
        const basex = wndbg.right - 170;
        const basey = wndbg.bottom - 50;
        this.drawBtn(app, grp, 0, basex, basey, 69, 29, lang);
        this.drawBtn(app, grp, 1, basex + (252 - 174), basey + (68 - 64), 68, 21, lang);

        // draw the logo
        let half = Math.floor(this.logicalWidth / 2);
        let footerheight = 70;
        let yspace = this.logicalHeight - (footerheight + headerheight);
        let aroundLogo = [this.x + half, this.y + headerheight, half, yspace];
        const logomargin = 20;
        let logobounds = RectUtils.getSubRectRaw(aroundLogo[0], aroundLogo[1], aroundLogo[2], aroundLogo[3], logomargin, logomargin);
        logobounds = logobounds ? logobounds : [0, 0, 0, 0];
        let logo = this.genBtn(app, grp, "logo");
        logo.set("style", UI512BtnStyle.opaque);
        logo.set("autohighlight", false);
        logo.set("iconsetid", "logo");
        logo.set("iconnumber", 0);
        logo.setDimensions(logobounds[0], logobounds[1], logobounds[2], logobounds[3]);

        // draw the prompt
        let prompt = this.genChild(app, grp, "prompt", UI512ElLabel);
        let caption = this.showAll ? lang.translate("lngView raw data...") : lang.translate("lngOpen from my stacks...");
        prompt.set("labeltext", caption);
        prompt.setDimensions(this.x + 20, this.y + 50, 200, 50);

        // draw the list of choices
        let chooserWidth = 218;
        let chooserX = this.x + Math.floor(half - chooserWidth);
        this.chooser = this.genChild(app, grp, "chooser", UI512ElTextField);
        this.chooser.set("scrollbar", true);
        this.chooser.set("selectbylines", true);
        this.chooser.set("multiline", true);
        this.chooser.set("canselecttext", true);
        this.chooser.set("canedit", false);
        this.chooser.set("labelwrap", false);
        this.chooser.setDimensions(this.x + 26, this.y + 84, 190, 140);

        let sDocs: string[] = [];
        for (let [docname, docid] of this.data) {
            docname = docname.replace(/\r/g, "").replace(/\n/g, "");
            docname = docname.length > 0 ? docname : lang.translate("lngUntitled");
            sDocs.push(docname);
        }

        UI512ElTextField.setListChoices(this.chooser, sDocs);

        if (this.root && sDocs.length) {
            SelAndEntry.selectLineInField(this.root, new UI512ElTextFieldAsGeneric(this.chooser), 0);
        }

        this.drawCommonLast(app, grp, lang);
    }

    dldRawData(key: string) {
        let defaultFilename = "data.json";
        let text = window.localStorage[key] || "(no data found)";
        let result = text;
        if (key === ui512ErrorHandling.getErrListKey(true) || key === ui512ErrorHandling.getErrListKey(false)) {
            // decode/uncompress the data
            try {
                result = "";
                let compressed = text.split("\n");
                for (let i = 0; i < compressed.length; i++) {
                    result += "\n" + ui512ErrorHandling.decodeErrMsg(compressed[i]);
                }
            } catch (e) {
                result += "error decompresing. " + e.message;
                result += "remainder of contents:\n" + text;
            }
        }

        let blob = new Blob([result], { type: "text/plain;charset=utf-8" });
        saveAs(blob, defaultFilename);
    }

    static getChosen(self: IntroOpenPage) {
        if (self.chooser) {
            let whichLine = SelAndEntry.selectByLinesWhichLine(new UI512ElTextFieldAsGeneric(self.chooser));
            if (whichLine !== undefined) {
                return self.data[whichLine];
            }
        }
    }

    static respondBtnClick(c: VpcUiIntro, root: Root, self: IntroOpenPage, el: UI512Element) {
        if (el.id.endsWith("choicebtn0")) {
            let whichData = IntroOpenPage.getChosen(self);
            if (whichData && self.showAll) {
                // we're in a diagnostic mode, get the raw data
                self.dldRawData(whichData[1]);
            } else if (whichData) {
                // open the document
                let loader = new VpcDocLoader(c.lang, c.root, whichData[1], whichData[0], OpenFromLocation.LocalStorage);
                c.beginLoadDocument(loader);
            }
        } else if (el.id.endsWith("choicebtn1")) {
            // user clicked cancel, go back to first screen
            let [x, y] = [c.activePage.x, c.activePage.y];
            c.activePage.destroy(c.app);
            c.activePage = new IntroFirstPage("introFirstPage", c.bounds, x, y);
            c.activePage.create(c.app, c.lang);
        }
    }

    deleteSelected(c: VpcUiIntro) {
        let whichData = IntroOpenPage.getChosen(this);
        if (whichData && whichData[1] && whichData[1].length) {
            let key = this.showAll ? whichData[1] : VpcDocLoader.docprefix + whichData[1];
            window.localStorage.removeItem(key);
            c.getModal().standardAnswer(
                this.root,
                c,
                c.app,
                "Item removed",
                n => {
                    // go back to first screen
                    let [x, y] = [c.activePage.x, c.activePage.y];
                    c.activePage.destroy(c.app);
                    c.activePage = new IntroFirstPage("introFirstPage", c.bounds, x, y);
                    c.activePage.create(c.app, c.lang);
                },
                "lngOK"
            );
        }
    }

    respondKeyDown(c: VpcUiIntro, root: Root, d: KeyDownEventDetails) {
        if (d.readableShortcut === "Delete" || d.readableShortcut === "Backspace") {
            c.getModal().standardAnswer(
                this.root,
                c,
                c.app,
                "Confirm deletion?",
                n => {
                    if (n === 0) {
                        this.deleteSelected(c);
                    }
                },
                "lngOK",
                "lngCancel"
            );
        }
    }
}

class IntroLoadingPage extends IntroPageBase {
    isIntroLoadingPage = true;
    compositeType = "IntroLoadingPage";
    protected prompt: O<UI512ElLabel>;
    constructor(
        compid: string,
        bounds: number[],
        x: number,
        y: number,
        public loader: VpcDocLoader,
        public initialLoadMessage: string,
        protected root: Root
    ) {
        super(compid, bounds, x, y);
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawCommonFirst(app, grp, lang);

        // draw the prompt
        const margin = 80;
        this.prompt = this.genChild(app, grp, "prompt", UI512ElLabel);
        this.prompt.set("labeltext", this.initialLoadMessage + "...");
        this.prompt.set("labelwrap", true);
        this.prompt.set("labelhalign", true);
        this.prompt.setDimensions(
            this.x + margin,
            this.y + headerheight + margin,
            this.logicalWidth - 2 * margin,
            this.logicalHeight - headerheight - 2 * margin
        );

        this.drawCommonLast(app, grp, lang);
    }

    checkIfLoadComplete(app: UI512Application, d: IdleEventDetails) {
        if (this.prompt) {
            let status = this.loader.workOnLoad(this.root, d.milliseconds);
            this.prompt.set("labeltext", this.initialLoadMessage + status);
        }
    }

    static respondBtnClick(c: VpcUiIntro, root: Root, self: IntroLoadingPage, el: UI512Element) {}
}

class IntroLoadFromDiskPage extends IntroPageBase {
    isIntroLoadFromDiskPage = true;
    compositeType = "IntroLoadFromDiskPage";
    canDrag = false;
    constructor(compid: string, bounds: number[], x: number, y: number, protected c: VpcUiIntro, protected root: Root) {
        // always display centered, even if was changed earlier
        super(compid, bounds, undefined, undefined);
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawCommonFirst(app, grp, lang);

        // draw the OK and cancel buttons
        let wndbg = grp.getEl(this.getElId("wndbg"));
        const basex = wndbg.right - 170;
        const basey = wndbg.bottom - 50;
        this.drawBtn(app, grp, 0, basex, basey, 69, 29, lang);
        this.drawBtn(app, grp, 1, basex + (252 - 174), basey + (68 - 64), 68, 21, lang);

        // create the file picker, unfortunately it's a real html element :(
        // saying things like .trigger("click"); doesn't work in all browsers
        let thediv = document.createElement("div");
        thediv.setAttribute("id", "divvpcfilepicker");
        let thelabel = document.createElement("label");
        thelabel.setAttribute("for", "idFilePicker");
        let img = document.createElement("img");
        img.src = "/resources/images/choosejsonfile.png";
        img.style.position = "absolute";

        let el = document.getElementById("mainDomCanvas") || document.body;
        let allElBounds = el.getBoundingClientRect();
        let posX = allElBounds.left + Math.floor(allElBounds.width / 2);
        let posY = allElBounds.top + Math.floor(allElBounds.height / 2);
        posX -= 20;
        posY -= 10;
        img.style.left = `${posX}px`;
        img.style.top = `${posY}px`;
        let filepicker = document.createElement("input");
        filepicker.setAttribute("id", "idFilePicker");
        filepicker.setAttribute("type", "file");
        filepicker.setAttribute("accept", ".json");
        filepicker.style.position = "absolute";
        filepicker.style.top = `-999px`;
        filepicker.style.left = `-999px`;
        filepicker.addEventListener("change", () => this.loadFromFile());
        thediv.appendChild(filepicker);
        thelabel.appendChild(img);
        thediv.appendChild(thelabel);
        document.body.appendChild(thediv);
        this.drawCommonLast(app, grp, lang);
    }

    loadFromFile() {
        if (!FileReader) {
            alert('opening files not supported in this browser, "FileReader" not found');
            return;
        }

        let picker = document.getElementById("idFilePicker") as any;
        if (!picker) {
            alert("file picker element not found");
            return;
        }

        let files = picker.files;
        if (!files || !files.length) {
            // no file chosen yet
            return;
        } else {
            let file = files[0];
            var reader = new FileReader();

            reader.onload = evt => this.onOpenFileCallback(reader);
            reader.onerror = evt => this.onOpenFileErrorCallback(reader);

            // Read in the image file as a data URL.
            reader.readAsText(file, "utf-8");
        }
    }

    onOpenFileErrorCallback(reader: FileReader) {
        alert("error reading the file contents. " + reader.error ? reader.error.toString() : "");
    }

    onOpenFileCallback(reader: FileReader) {
        if (reader.readyState == reader.DONE) {
            if (reader.error) {
                alert("error reading the file contents. " + reader.error ? reader.error.toString() : "");
                return;
            }

            let text = reader.result;
            let loader = new VpcDocLoader(
                this.c.lang,
                this.root,
                text,
                this.c.lang.translate("lngfile from disk"),
                OpenFromLocation.FromJsonFile
            );
            this.c.beginLoadDocument(loader);
        }
    }

    destroy(app: UI512Application) {
        let el = document.getElementById("divvpcfilepicker");
        if (el) {
            document.body.removeChild(el);
        }

        super.destroy(app);
    }

    static respondBtnClick(c: VpcUiIntro, root: Root, self: IntroLoadFromDiskPage, el: UI512Element) {
        if (el.id.endsWith("choicebtn0") || el.id.endsWith("choicebtn1")) {
            let [x, y] = [c.activePage.x, c.activePage.y];
            c.activePage.destroy(c.app);
            c.activePage = new IntroFirstPage("introFirstPage", c.bounds, x, y);
            c.activePage.create(c.app, c.lang);
        }
    }
}

