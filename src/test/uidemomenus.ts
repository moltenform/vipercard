
/* autoimport:start */
import { MenuPositioning } from "../ui512/ui512menurender.js";
import { MenuBehavior } from "../ui512/ui512menulisteners.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { EditTextBehavior, addDefaultListeners } from "../ui512/ui512elementstextlisten.js";
import { MouseDragStatus, UI512Controller } from "../ui512/ui512controller.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class UI512DemoMenus extends UI512Controller {
    test = new Test_DrawMenus();
    public init(root: Root) {
        super.init(root);
        addDefaultListeners(this.listeners);

        let clientrect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientrect, this);
        this.inited = true;
        this.test.addElements(this, "(background)", clientrect);
        this.test.uicontext = true;

        let grp = this.app.getGroup("grp");
        let btn1 = new UI512ElButton("btn1");
        grp.addElement(this.app, btn1);
        btn1.set("labeltext", "abc");
        btn1.setDimensions(300, 300, 90, 25);

        let btnDldImage = new UI512ElButton("btnDldImage");
        grp.addElement(this.app, btnDldImage);
        btnDldImage.set("labeltext", "dld test");
        btnDldImage.setDimensions(clientrect[0] + 20, clientrect[1] + 100, 65, 15);

        let btnRunTest = new UI512ElButton("btnRunTest");
        grp.addElement(this.app, btnRunTest);
        btnRunTest.set("labeltext", "run test");
        btnRunTest.setDimensions(clientrect[0] + 20, clientrect[1] + 150, 65, 15);

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseUp, UI512DemoMenus.respondMouseUp);
        this.listenEvent(UI512EventType.MenuItemClicked, UI512DemoMenus.respondMenuItemClick);
        this.rebuildFieldScrollbars();
    }

    private static respondMenuItemClick(c: UI512DemoMenus, root: Root, d: MenuItemClickedDetails) {
        console.log("clicked on menuitem " + d.id);
        let idsInList = "mnuOptFirst|mnuOptSecond|mnuOptThird".split("|");
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(c.app);
        if (idsInList.indexOf(d.id) !== -1) {
            for (let idInList of idsInList) {
                let item = grpitems.getEl(idInList);
                item.set("checkmark", d.id === item.id);
            }
        }
    }

    private static respondMouseUp(c: UI512DemoMenus, root: Root, d: MouseUpEventDetails) {
        if (d.elClick && d.button === 0) {
            if (d.elClick.id === "btn1") {
                let btn1 = cast(d.elClick, UI512ElButton);
                btn1.set("labeltext", "changed");
            } else if (d.elClick.id === "btnDldImage") {
                c.test.runtest(root, true);
            } else if (d.elClick.id === "btnRunTest") {
                c.test.runtest(root, false);
            }
        }
    }
}

export class UI512TestMenusController extends UI512Controller {}

export class Test_DrawMenus extends Tests_BaseClass {
    uicontext = false;
    tests = [
        "callback/Test Drawing Menus",
        (root: Root, callback: Function) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawMenus(root), callback);
        },
    ];

    runtest(root: Root, dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawMenus(root));
    }

    getMenuStruct() {
        return [
            ["mnuHeaderOS|icon:001:80:26", ["|lngPlaceholder|"]],
            ["mnuHeaderFile|lngFile", ["|lngPlaceholder|"]],
            [
                "mnuHeaderEdit|lngEdit",
                [
                    "|lngUndo|\xBD Z",
                    "|---|",
                    "mnuCut1|lngCut|\xBD X",
                    "mnuCopy1|lngCopy|\xBD C",
                    "|lngPaste Text|\xBD V",
                    "mnuClear1|lngClear|",
                    "|---|",
                    "|lngNew Card|\xBD N",
                    "|lngDelete Card|",
                    "|lngCut Card|",
                    "|lngCopy Card|",
                    "|---|",
                    "mnuTextStyle1|lngText Style...|\xBD T",
                    "|lngBackground|\xBD B",
                    "|lngIcon...|\xBD I",
                ],
            ],
            [
                "mnuHeaderGo|lngGo",
                [
                    "|lngUndo 2|\xBD Z",
                    "|---|",
                    "mnuCut2|lngCut 2|\xBD X",
                    "mnuCopy2|lngCopy 2|\xBD C",
                    "|lngPaste Longer Text 2|\xBD V",
                    "mnuClear2|lngClear 2|",
                    "|---|",
                    "|lngNew Card 2|\xBD N",
                    "|lngDelete Card 2|",
                    "|lngCut Card 2|",
                    "|lngCopy Card 2|",
                    "|---|",
                    "mnuTextStyle2|lngText Style 2...|\xBD T",
                    "|lngBackground 2|\xBD B",
                    "|lngIcon 2...|\xBD I",
                ],
            ],
            ["mnuHeaderTools|lngTools", ["|lngPlaceholder|"]],
            ["mnuHeaderPaint|lngPaint", ["|lngPlaceholder|"]],
            ["mnuHeaderOptions|lngOptions", ["mnuOptFirst|lngFirst|", "mnuOptSecond|lngSecond|", "mnuOptThird|lngThird|"]],
            ["mnuHeaderPatterns|lngPatterns", ["|lngPlaceholder|"]],
            ["topClock|lng12/28/18", 790, ["|lngPlaceholder|"]],
            ["mnuHeaderHelpIcon|icon:001:75:27", 864, ["|lngA longer text...|"]],
            ["mnuHeaderAppIcon|icon:001:78:27", 891, ["|lngHide This Program|", "|lngHide Others|", "mnuShowAll|lngShow All|"]],
        ];
    }

    addElements(c: UI512Controller, bgtext: string, bounds: number[]) {
        let grp = new UI512ElGroup("grp");
        c.app.addGroup(grp);

        // add bg
        let bg = new UI512ElButton("bg");
        grp.addElement(c.app, bg);
        bg.set("labeltext", bgtext);
        bg.set("style", UI512BtnStyle.opaque);
        bg.setDimensions(bounds[0], bounds[1], bounds[2], bounds[3]);
        bg.set("enabled", false);
        bg.set("enabledstyle", false);

        // add a horizontal line, the dropdowns should cover it
        let testTransparency = new UI512ElButton("testTransparency1");
        grp.addElement(c.app, testTransparency);
        testTransparency.setDimensions(bounds[0] + 100, bounds[1] + 100, 5, 1);

        // add the menu
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(c.app);
        MenuPositioning.buildFromStruct(c, this.getMenuStruct(), c.lang);
        grpitems.getEl("mnuOptSecond").set("checkmark", true);
        let toDisable = ["mnuCut", "mnuCopy", "mnuClear", "mnuTextStyle"];
        for (let shortid of toDisable) {
            for (let number of ["1", "2"]) {
                grpitems.getEl(shortid + number).set("enabled", false);
                grpitems.getEl(shortid + number).set("enabledstyle", false);
            }
        }
    }

    drawTestCase(root: Root, expanded: number[], tmpCanvas: CanvasWrapper, w: number, h: number, i: number, complete: RenderComplete) {
        tmpCanvas.clear();
        let testc = new UI512TestMenusController();
        testc.inited = true;
        testc.app = new UI512Application([0, 0, w, h], testc);
        this.addElements(testc, "(background)", testc.app.bounds);

        // mimic the user clicking on a menu
        if (expanded[0] !== -1) {
            let menuroot = MenuPositioning.getMenuRoot(testc.app);
            let dropdns = menuroot.getchildren(testc.app);
            MenuBehavior.setActiveMenuByHeaderId(testc, dropdns[expanded[0]].id);
            menuroot.setdirty(true);

            if (expanded[1] !== -1) {
                let items = dropdns[expanded[0]].getchildren(testc.app);
                items[expanded[1]].set("highlightactive", true);
            }
        }

        // test different clock times
        if (i < 2) {
            let [grpbar, grpitems] = MenuPositioning.getMenuGroups(testc.app);
            grpbar.getEl("topClock").set("labeltext", i === 0 ? "1/1/17" : "1/18/18");
        }

        // don't show any borders
        testc.view.renderBorders = function() {};
        testc.render(root, tmpCanvas, 1, complete);
    }

    testDrawMenus(root: Root) {
        const w = 928;
        const h = 300;
        assertEq(w, ScreenConsts.screenwidth, "1S|");
        let tmpCanvasDom = document.createElement("canvas");
        tmpCanvasDom.width = w;
        tmpCanvasDom.height = h;
        let tmpCanvas = new CanvasWrapper(tmpCanvasDom);

        const drawMenuTestCases = [[-1, -1], [0, -1], [2, -1], [3, -1], [6, -1], [9, -1], [10, -1], [2, 0], [2, 4], [6, 0], [6, 1]];

        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = true;
            for (let i = 0; i < drawMenuTestCases.length; i++) {
                this.drawTestCase(root, drawMenuTestCases[i], tmpCanvas, w, h, i, complete);
                let dest = [0, i * h, w, h];
                canvas.drawFromImage(tmpCanvas.canvas, 0, 0, w, h, dest[0], dest[1], dest[0], dest[1], dest[2], dest[3]);
            }
        };

        const totalh = h * drawMenuTestCases.length;
        return new CanvasTestParams("drawMenus", "/resources/test/drawmenusexpected.png", draw, w, totalh, this.uicontext);
    }
}
