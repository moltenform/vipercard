
/* autoimport:start */
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { SelAndEntryImpl, IGenericTextField, UI512ElTextFieldAsGeneric, SelAndEntry, ClipManager } from "../ui512/ui512elementstextselect.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { EditTextBehavior, addDefaultListeners } from "../ui512/ui512elementstextlisten.js";
import { MouseDragStatus, UI512Controller } from "../ui512/ui512controller.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class UI512DemoTextEdit extends UI512Controller {
    test = new Test_DrawTextEdit();
    public init(root: Root) {
        super.init(root);
        addDefaultListeners(this.listeners);

        let clientrect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientrect, this);
        this.inited = true;
        this.test.addElements(this, clientrect);
        this.test.uicontext = true;

        let curx = 10;
        let grp = this.app.getGroup("grp");

        // run this after hitting toggle scroll a couple times to make sure we're not leaking elements
        // i.e. if this number is continually increasing we are leaking elements somewhere
        let testBtns = ["RunTest", "DldImage", "ToggleScroll", "Count Elems", "WhichChoice"];
        let layoutTestBtns = new GridLayout(clientrect[0] + 10, clientrect[1] + 330, 85, 15, testBtns, [1], 5, 5);
        layoutTestBtns.createElems(this.app, grp, "btn", UI512ElButton, () => {}, true, true);

        let testSelByLines = new UI512ElTextField("testSelByLines");
        grp.addElement(this.app, testSelByLines);
        testSelByLines.setDimensions(485, 270, 170, 80);
        let choices = "choice 0\nchoice 1\nchoice 2 (another)\nchoice 3\nchoice 4\nchoice 5\nchoice 6\nchoice 7".split("\n");
        UI512ElTextField.setListChoices(testSelByLines, choices);

        testSelByLines.set("scrollbar", true);
        testSelByLines.set("selectbylines", true);
        testSelByLines.set("multiline", true);
        testSelByLines.set("canselecttext", true);
        testSelByLines.set("canedit", false);
        testSelByLines.set("labelwrap", false);

        // by setting selcaret to equal selend, this is making the initial choice blank
        testSelByLines.set("selcaret", 0);
        testSelByLines.set("selend", 0);

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseUp, UI512DemoTextEdit.respondMouseUp);
        this.listenEvent(UI512EventType.KeyDown, UI512DemoTextEdit.respondKeyDown);
        this.rebuildFieldScrollbars();
    }

    private static respondMouseUp(c: UI512DemoTextEdit, root: Root, d: MouseUpEventDetails) {
        if (d.elClick && d.button === 0) {
            if (d.elClick.id === "btnDldImage") {
                c.test.runtest(root, true);
            } else if (d.elClick.id === "btnRunTest") {
                c.test.runtest(root, false);
            } else if (d.elClick.id === "btnToggleScroll") {
                c.test.toggleScroll(c);
            } else if (d.elClick.id === "btnCount Elems") {
                console.log(`# of elements === ${c.app.getGroup("grp").countElems()}`);
            } else if (d.elClick.id === "btnWhichChoice") {
                let grp = c.app.getGroup("grp");
                let el = cast(grp.getEl("testSelByLines"), UI512ElTextField);
                let gel = new UI512ElTextFieldAsGeneric(el);
                let whichLine = SelAndEntry.selectByLinesWhichLine(gel);
                console.log(`the chosen line is: ${whichLine} `);
            }
        }
    }

    private static respondKeyDown(c: UI512DemoTextEdit, root: Root, d: KeyDownEventDetails) {
        let el = SelAndEntry.getSelectedField(c);
        if (el && el.get_b("selectbylines")) {
            return;
        } else if (el && d.readableShortcut === "Tab") {
            c.onTabKeyDown(root, el, d, false);
        } else if (el && d.readableShortcut === "Shift+Tab") {
            c.onTabKeyDown(root, el, d, true);
        }
    }

    onTabKeyDown(root: Root, el: O<UI512ElTextField>, d: KeyDownEventDetails, hasShift: boolean) {
        if (el && el.get_b("multiline") && el.get_n("selcaret") === el.get_n("selend")) {
            // simply insert a \t
            if (!hasShift) {
                let gel = new UI512ElTextFieldAsGeneric(el);
                SelAndEntry.changeTextInsert(root, gel, "\t");
            }
        } else if (el && el.get_b("multiline")) {
            // indent or dedent
            let gel = new UI512ElTextFieldAsGeneric(el);
            SelAndEntry.changeTextIndentation(root, gel, hasShift);
        }

        d.setHandled();
    }
}

export class UI512TestTextEditController extends UI512Controller {
    public init(root: Root) {
        super.init(root);
        addDefaultListeners(this.listeners);
    }
}

export class Test_DrawTextEdit extends Tests_BaseClass {
    uicontext = false;
    tests = [
        "callback/Test Drawing Text Edits",
        (root: Root, callback: Function) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawTextEdit(root), callback);
        },
    ];

    runtest(root: Root, dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawTextEdit(root));
    }

    geneva(el: UI512ElTextField, s: string) {
        let spec = new TextFontSpec("geneva", TextFontStyling.Default, 10);
        el.set("defaultFont", spec.toSpecString());
        let t = FormattedText.newFromPersisted(TextRendererFontManager.setInitialFont(s, spec.toSpecString()));
        el.setftxt(t);
    }

    getTextWithFonts() {
        let s = "";
        let c = specialCharFontChange;
        s += c + "geneva_18_" + textFontStylingToString(TextFontStyling.Outline) + c + "ab";
        s += c + "geneva_12_" + textFontStylingToString(TextFontStyling.Outline) + c + "ab";
        s += c + "geneva_18_" + textFontStylingToString(TextFontStyling.Bold) + c + "ab";
        s += c + "geneva_12_" + textFontStylingToString(TextFontStyling.Bold) + c + "ab";
        s += c + "chicago_18_" + textFontStylingToString(TextFontStyling.Underline) + c + "ab";
        s += c + "chicago_12_" + textFontStylingToString(TextFontStyling.Underline) + c + "ab";
        return FormattedText.newFromPersisted(s);
    }

    toggleScroll(c: UI512Controller) {
        let grp = c.app.getGroup("grp");
        for (let el of grp.iterEls()) {
            if (el instanceof UI512ElTextField) {
                el.set("scrollbar", !el.get_b("scrollbar"));
            }
        }
    }

    addElements(c: UI512Controller, bounds: number[]) {
        let grp = new UI512ElGroup("grp");
        c.app.addGroup(grp);

        // add bg
        let bg = new UI512ElButton("bg");
        grp.addElement(c.app, bg);
        bg.set("style", UI512BtnStyle.opaque);
        bg.setDimensions(bounds[0], bounds[1], bounds[2], bounds[3]);
        bg.set("autohighlight", false);

        // add horizontal lines, for testing opacity
        const b0 = 45,
            b1 = 45;
        let testTransparency1 = new UI512ElButton("bgTransparency1");
        grp.addElement(c.app, testTransparency1);
        testTransparency1.setDimensions(b0 + 2, b1 + 24, 300, 2);
        let testTransparency2 = new UI512ElButton("bgTransparency2");
        grp.addElement(c.app, testTransparency2);
        testTransparency2.setDimensions(b0 + 2, b1 + 30, 300, 2);

        // test different styles
        let styles: number[] = [UI512FldStyle.opaque, UI512FldStyle.transparent, UI512FldStyle.rectangle, UI512FldStyle.shadow];
        let layoutst = new GridLayout(b0 + 10, b1 + 5, 60, 45, styles, [1], 10, 10);
        layoutst.createElems(c.app, grp, "testStyles", UI512ElTextField, (a, b, el) => {
            el.set("style", a);
            el.setftxt(FormattedText.newFromPersisted("text\ntext"));
        });

        // test large fields with varying amounts of text
        let rowsTextContent = [loremText.substr(0, 70), loremText.substr(0, 700)];
        let cols = [[true, true], [true, false], [false, true], [false, false]];
        let layoutgrid = new GridLayout(b0 + 10, 100, 130, 130, cols, rowsTextContent, 10, 10);
        layoutgrid.createElems(c.app, grp, "testGrid", UI512ElTextField, (a, content, el) => {
            let [isWide, isScroll] = a;
            this.geneva(el, content);
            el.set("scrollbar", isScroll);
            if (!isWide) {
                el.setDimensions(el.x, el.y, el.w / 2, el.h);
                if (el.id === "testGrid_3" || el.id === "testGrid_7") {
                    el.setDimensions(el.x - el.w, el.y, el.w, el.h);
                }
            }
        });

        // test field properties
        let cases = ["halign+scr", "halign", "oneline", "rdonly", "noselct", "nowrap", "fnts", "ignorevalgn", "vspace", "small"];
        let layoutlbl = new GridLayout(485, 80, 80, 20, Util512.range(5), Util512.range(2), 10, 100 - 20);
        layoutlbl.createElems(c.app, grp, "caseLbl", UI512ElLabel, (a, b, el) => {
            let whichcase = cases[a + b * 5];
            el.set("labeltext", whichcase);
        });

        let layoutcases = new GridLayout(485, 100, 80, 60, Util512.range(5), Util512.range(2), 10, 40);
        layoutcases.createElems(c.app, grp, "testCases", UI512ElTextField, (a, b, el) => {
            let whichcase = cases[a + b * 5];
            this.geneva(el, "1234123412345\nabc");
            switch (whichcase) {
                case "halign+scr":
                    el.set("labelhalign", true);
                    el.set("scrollbar", true);
                    break;
                case "halign":
                    el.set("labelhalign", true);
                    break;
                case "oneline":
                    el.set("multiline", false);
                    this.geneva(el, "abc");
                    break;
                case "rdonly":
                    el.set("canedit", false);
                    break;
                case "noselct":
                    el.set("canselecttext", false);
                    break;
                case "nowrap":
                    el.set("labelwrap", false);
                    break;
                case "fnts":
                    el.setftxt(this.getTextWithFonts());
                    el.set("defaultFont", "geneva_18_" + textFontStylingToString(TextFontStyling.Outline));
                    break;
                case "ignorevalgn":
                    el.set("labelvalign", true);
                    break;
                case "vspace":
                    el.set("addvspacing", 8);
                    break;
                case "small":
                    el.setDimensions(el.x, el.y, el.w, ScrollConsts.boxheight * 2);
                    el.set("scrollbar", true);
                    this.geneva(el, "scrll hidden bc of size");
                    break;
                default:
                    assertTrue(false, "1u|not reached");
                    break;
            }
        });

        c.rebuildFieldScrollbars();
    }

    drawTestCase(root: Root, testnumber: number, tmpCanvas: CanvasWrapper, w: number, h: number, i: number, complete: RenderComplete) {
        tmpCanvas.clear();
        let testc = new UI512TestTextEditController();
        testc.init(root);
        testc.inited = true;
        testc.app = new UI512Application([0, 0, w, h], testc);
        this.addElements(testc, testc.app.bounds);

        // first pass rendering adds the scrollbars
        // don't show any borders
        testc.view.renderBorders = function() {};
        testc.needRedraw = true;
        testc.render(root, tmpCanvas, 1, complete);
        tmpCanvas.clear();

        if (!complete.complete) {
            // the fonts aren't loaded yet, let's wait until later
            return;
        }

        if (testnumber === 1) {
            this.drawTestCaseSelection(root, testc);
        } else if (testnumber === 2) {
            this.drawTestCaseScrolling(root, testc);
        }

        // second pass rendering
        testc.view.allowMultipleFocus = true;
        testc.view.renderBorders = function() {};
        testc.needRedraw = true;
        testc.render(root, tmpCanvas, 1, complete);
    }

    testDrawTextEdit(root: Root) {
        const w = 928;
        const h = 400;
        const screensToDraw = 3;
        assertEq(w, ScreenConsts.screenwidth, "1t|");
        let tmpCanvasDom = document.createElement("canvas");
        tmpCanvasDom.width = w;
        tmpCanvasDom.height = h;
        let tmpCanvas = new CanvasWrapper(tmpCanvasDom);

        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = true;
            for (let i = 0; i < screensToDraw; i++) {
                this.drawTestCase(root, i, tmpCanvas, w, h, i, complete);
                let dest = [0, i * h, w, h];
                canvas.drawFromImage(tmpCanvas.canvas, 0, 0, w, h, dest[0], dest[1], dest[0], dest[1], dest[2], dest[3]);
            }
        };

        const totalh = h * screensToDraw;
        return new CanvasTestParams("drawTextEdit", "/resources/test/drawtexteditexpected.png", draw, w, totalh, this.uicontext);
    }

    simulateClick(root: Root, c: UI512TestTextEditController, x: number, y: number, doubleclick = false, isShift = false) {
        let mods = isShift ? ModifierKeys.Shift : ModifierKeys.None;
        if (doubleclick) {
            c.rawEvent(root, new MouseDownEventDetails(0, x, y, 0, mods));
            c.rawEvent(root, new MouseDownEventDetails(1, x, y, 0, mods));
            c.rawEvent(root, new MouseDownDoubleEventDetails(2, x, y, 0, mods));
        } else {
            c.rawEvent(root, new MouseDownEventDetails(0, x, y, 0, mods));
        }
    }

    simulateKey(root: Root, c: UI512TestTextEditController, keyCode: string, keyChar: string, isShift: boolean, isCmd = false) {
        let mods = isShift ? ModifierKeys.Shift : ModifierKeys.None;
        mods |= isCmd ? ModifierKeys.Cmd : ModifierKeys.None;
        let d = new KeyDownEventDetails(0, keyCode, keyChar, false, mods);
        c.rawEvent(root, d);
    }

    drawTestCaseScrolling(root: Root, c: UI512TestTextEditController) {
        // confirm that a scrollbar is enabled when text gets too long
        // click in the padding area after '12345' in fld 'halign+scr' and enter lots of text
        this.simulateClick(root, c, 539, 118, false, false);
        for (let i = 0; i < 16; i++) {
            this.simulateKey(root, c, "Q", "q", true);
            this.simulateKey(root, c, "W", "w", true);
            this.simulateKey(root, c, "E", "e", true);
        }

        // confirm that scrollbar disabled when text short enough
        // the scrollbar should now be disabled because the text is short, and scrolled to top
        // click on fld 7 and hit Ctrl+End
        this.simulateClick(root, c, 360, 296, false, false);
        this.simulateKey(root, c, "End", "", false, true);
        // hit Ctrl+Backspace 120 times
        for (let i = 0; i < 120; i++) {
            this.simulateKey(root, c, "Backspace", "", false, true);
        }

        // try scrolling up/down with the arrows
        // insert some text at the beginning of fld 3
        this.simulateClick(root, c, 340, 110, false, false);
        for (let i = 1; i <= 8; i++) {
            this.simulateKey(root, c, i.toString(), i.toString(), true);
            this.simulateKey(root, c, "Enter", "", false);
        }
        // hit the scroll down arrow 5x
        for (let i = 0; i < 5; i++) {
            this.simulateClick(root, c, 390, 222, false, false);
        }
        // hit the scroll up arrow 2x
        for (let i = 0; i < 2; i++) {
            this.simulateClick(root, c, 390, 111, false, false);
        }

        // try scrolling up/down by clicking on the background
        // click the lower bg of fld 5, 5x
        for (let i = 0; i < 2; i++) {
            this.simulateClick(root, c, 180, 345, false, false);
        }
        // hit the upper bg 2x
        for (let i = 0; i < 2; i++) {
            this.simulateClick(root, c, 178, 266, false, false);
        }

        // clicking the arrows should have no effect if scrollbar is disabled
        // click on the up/down arrows of fld 1
        for (let i = 0; i < 2; i++) {
            this.simulateClick(root, c, 177, 110, false, false);
        }
        for (let i = 0; i < 5; i++) {
            this.simulateClick(root, c, 177, 224, false, false);
        }

        // make it big enough to have a scrollbar
        let wastoosmall = c.app.getElemById("testCases_9");
        wastoosmall.setDimensions(wastoosmall.x, wastoosmall.y, wastoosmall.w, 120);
        cast(wastoosmall, UI512ElTextField).setftxt(FormattedText.newFromPersisted("now ok"));
    }

    drawTestCaseSelection(root: Root, c: UI512TestTextEditController) {
        // part 1: set selections ------------------------------------------
        // in the 1st field double-click at 105, 105 to select "ipsum"
        this.simulateClick(root, c, 105, 105, true);

        // in the 2nd field click at 216, 106 to click on lorem
        // shift click at 282, 109 to move the selection to middle of "dolor"
        this.simulateClick(root, c, 216, 106);
        this.simulateClick(root, c, 282, 109, false, true);

        // in the 3rd field click at 351,108 to select part of lorem
        // hit shift-page down to select down to "pla"
        this.simulateClick(root, c, 351, 108);
        this.simulateKey(root, c, "PageDown", "", true);

        // in the 4th field click at 430, 133 to select part of amet
        // shift click at 460, 160 to select down to erat
        this.simulateClick(root, c, 430, 133);
        this.simulateClick(root, c, 460, 160, false, true);

        // in the 5th field click at 115, 246 to select part of ipsum
        // hit shift-page down to select down to "sea te"
        this.simulateClick(root, c, 115, 246);
        this.simulateKey(root, c, "PageDown", "", true);

        // in the 6th field click at 263, 271 to select part of feugait
        // hit shift-up 5x (the rest are unneeded) to select up to "dolor"
        this.simulateClick(root, c, 263, 271);
        for (let i = 0; i < 5; i++) {
            this.simulateKey(root, c, "ArrowUp", "", true);
        }

        // in 7th fld click at 360, 260 to select part of psum
        // hit shift-pagedown 5x to select down to apeirian
        this.simulateClick(root, c, 360, 260);
        for (let i = 0; i < 5; i++) {
            this.simulateKey(root, c, "PageDown", "", true);
        }

        // in 8th fld click at 444,288 to select part of pericula
        // hit shift-down 6x to select down to "uam N".
        // if this were a scrolling field it would should shift scroll slightly down,
        // but we've decided that for perf, a field with no scrollbar doesn't need to scroll down.
        this.simulateClick(root, c, 444, 288);
        for (let i = 0; i < 6; i++) {
            this.simulateKey(root, c, "ArrowDown", "", true);
        }

        // click to set focus left of the 12345 in fld 'halign+scr'
        // hit shift-left 4x
        this.simulateClick(root, c, 500, 118);
        for (let i = 0; i < 4; i++) {
            this.simulateKey(root, c, "ArrowLeft", "", true);
        }

        // click to set focus left of the text in fld 'rdonly'
        // hit shift-left 5x
        this.simulateClick(root, c, 759, 135);
        for (let i = 0; i < 5; i++) {
            this.simulateKey(root, c, "ArrowLeft", "", true);
        }

        // part 2: cases with few characters ------------------------------------------
        // zero chars
        this.simulateClick(root, c, 78, 63);
        this.simulateKey(root, c, "A", "a", false, true);
        this.simulateKey(root, c, "Delete", "", false, false);

        // 1 char, caret after
        this.simulateClick(root, c, 143, 60);
        this.simulateKey(root, c, "A", "a", false, true);
        this.simulateKey(root, c, "1", "1", false, false);

        // 1 char, selected
        this.simulateClick(root, c, 218, 60);
        this.simulateKey(root, c, "A", "a", false, true);
        this.simulateKey(root, c, "1", "1", false, false);
        this.simulateKey(root, c, "ArrowLeft", "", true, false);

        // 1 char, caret before
        this.simulateClick(root, c, 291, 60);
        this.simulateKey(root, c, "A", "a", false, true);
        this.simulateKey(root, c, "1", "1", false, false);
        this.simulateKey(root, c, "ArrowLeft", "", false, false);

        // part 3: set selections & input text ------------------------------------------

        // click at 598, 212 to set focus to the right of the ab font typeface tests
        // type z to insert a z
        this.simulateClick(root, c, 618, 218);
        this.simulateKey(root, c, "Z", "z", true);
        this.simulateKey(root, c, "ArrowRight", "", true);

        // click to set focus to the right of the 345 in fld 'halign'
        // type a to insert an a
        this.simulateClick(root, c, 638, 121);
        this.simulateKey(root, c, "A", "a", true);
        this.simulateKey(root, c, "ArrowRight", "", true, true);

        // test rendering with right font after all chars deleted
        // click, hit Backspace 13 times, hit Delete 4 times
        // type Y
        this.simulateClick(root, c, 697, 219);
        for (let i = 0; i < 13; i++) {
            this.simulateKey(root, c, "Backspace", "", false);
        }
        for (let i = 0; i < 4; i++) {
            this.simulateKey(root, c, "Delete", "", false);
        }
        this.simulateKey(root, c, "Y", "y", false);
        this.simulateKey(root, c, "A", "a", false);
        this.simulateKey(root, c, "B", "b", false);

        // test rendering \n\n
        // click, hit Backspace 13 times, hit Delete 4 times
        // type Enter
        // type Enter
        // type shift-left
        // type shift left
        this.simulateClick(root, c, 812, 231);
        for (let i = 0; i < 13; i++) {
            this.simulateKey(root, c, "Backspace", "", false);
        }
        for (let i = 0; i < 4; i++) {
            this.simulateKey(root, c, "Delete", "", false);
        }
        this.simulateKey(root, c, "Enter", "", false);
        this.simulateKey(root, c, "Enter", "", false);
        this.simulateKey(root, c, "ArrowLeft", "", true);
        this.simulateKey(root, c, "ArrowLeft", "", true);

        // for fld "small"
        // type & to insert text before any text in the field
        this.simulateClick(root, c, 847, 205);
        this.simulateKey(root, c, "", "&", false);
        this.simulateKey(root, c, "ArrowDown", "", true);
    }
}

export class Test_SelAndEntry extends Tests_BaseClass {
    constructor(protected root: Root) {
        super();
    }

    tests = [
        "testchangeSelSelectAll",
        () => {
            // no current selection
            this.testChangeSel("^abc#", "^#abc", SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel("^abc#", "a^#bc", SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel("^abc#", "abc^#", SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel("^a#", "a^#", SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel("^\n#", "\n^#", SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel("^\n#", "^#\n", SelAndEntryImpl.changeSelSelectAll);
            // with current selection
            this.testChangeSel("^abc#", "^abc#", SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel("^abc#", "#abc^", SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel("^abc#", "a^b#c", SelAndEntryImpl.changeSelSelectAll);
            this.testChangeSel("^ab\nc#", "a^#b\nc", SelAndEntryImpl.changeSelSelectAll);
        },
        "testchangeSelGoDocHomeEnd",
        () => {
            // go to start, no extend
            this.testChangeSel("^#abc", "^#abc", SelAndEntryImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel("^#abc", "a^#bc", SelAndEntryImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel("^#abc", "a^b#c", SelAndEntryImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel("^#abc", "a#b^c", SelAndEntryImpl.changeSelGoDocHomeEnd, true, false);
            this.testChangeSel("^#abc", "abc^#", SelAndEntryImpl.changeSelGoDocHomeEnd, true, false);
            // go to start, extend
            this.testChangeSel("^#abc", "^#abc", SelAndEntryImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel("^a#bc", "a^#bc", SelAndEntryImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel("^ab#c", "a^b#c", SelAndEntryImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel("^a#bc", "a#b^c", SelAndEntryImpl.changeSelGoDocHomeEnd, true, true);
            this.testChangeSel("^abc#", "abc^#", SelAndEntryImpl.changeSelGoDocHomeEnd, true, true);
            // go to end, no extend
            this.testChangeSel("abc#^", "^#abc", SelAndEntryImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel("abc#^", "a^#bc", SelAndEntryImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel("abc#^", "a^b#c", SelAndEntryImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel("abc#^", "a#b^c", SelAndEntryImpl.changeSelGoDocHomeEnd, false, false);
            this.testChangeSel("abc#^", "abc^#", SelAndEntryImpl.changeSelGoDocHomeEnd, false, false);
            // go to end, extend
            this.testChangeSel("#abc^", "^#abc", SelAndEntryImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel("a#bc^", "a^#bc", SelAndEntryImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel("ab#c^", "a^b#c", SelAndEntryImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel("a#bc^", "a#b^c", SelAndEntryImpl.changeSelGoDocHomeEnd, false, true);
            this.testChangeSel("abc#^", "abc^#", SelAndEntryImpl.changeSelGoDocHomeEnd, false, true);
        },
        "testchangeSelLeftRight",
        () => {
            // move left, no extend
            this.testChangeSel("^#abcd", "^#abcd", SelAndEntryImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel("^#abcd", "a^#bcd", SelAndEntryImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel("a^#bcd", "ab^#cd", SelAndEntryImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel("ab^#cd", "abc^#d", SelAndEntryImpl.changeSelLeftRight, true, false, false);
            this.testChangeSel("abc^#d", "abcd^#", SelAndEntryImpl.changeSelLeftRight, true, false, false);
            // move left, extend
            this.testChangeSel("^#abcd", "^#abcd", SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel("^a#bcd", "a^#bcd", SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel("a^b#cd", "ab^#cd", SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel("ab^c#d", "abc^#d", SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel("abc^d#", "abcd^#", SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel("^abc#d", "^abc#d", SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel("^abc#d", "a^bc#d", SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel("#ab^cd", "#abc^d", SelAndEntryImpl.changeSelLeftRight, true, true, false);
            this.testChangeSel("a#b^cd", "a#bc^d", SelAndEntryImpl.changeSelLeftRight, true, true, false);
            // move right, no extend
            this.testChangeSel("a^#bcd", "^#abcd", SelAndEntryImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel("ab^#cd", "a^#bcd", SelAndEntryImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel("abc^#d", "ab^#cd", SelAndEntryImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel("abcd^#", "abc^#d", SelAndEntryImpl.changeSelLeftRight, false, false, false);
            this.testChangeSel("abcd^#", "abcd^#", SelAndEntryImpl.changeSelLeftRight, false, false, false);
            // move right, extend
            this.testChangeSel("#a^bcd", "^#abcd", SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel("a#b^cd", "a^#bcd", SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel("ab#c^d", "ab^#cd", SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel("abc#d^", "abc^#d", SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel("abcd#^", "abcd^#", SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel("a^bc#d", "^abc#d", SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel("ab^c#d", "a^bc#d", SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel("#abcd^", "#abc^d", SelAndEntryImpl.changeSelLeftRight, false, true, false);
            this.testChangeSel("a#bcd^", "a#bc^d", SelAndEntryImpl.changeSelLeftRight, false, true, false);
        },
        "testchangeSelGoLineHomeEnd",
        () => {
            // middle line, go to start, no extend
            this.testChangeSel("qr|^#abc|st", "qr|^#abc|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("qr|^#abc|st", "qr|a^#bc|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("qr|^#abc|st", "qr|a^b#c|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("qr|^#abc|st", "qr|a#b^c|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("qr|^#abc|st", "qr|abc^#|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            // middle line, go to start, extend
            this.testChangeSel("qr|^#abc|st", "qr|^#abc|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("qr|^a#bc|st", "qr|a^#bc|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("qr|^ab#c|st", "qr|a^b#c|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("qr|^a#bc|st", "qr|a#b^c|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("qr|^abc#|st", "qr|abc^#|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            // middle line, go to end, no extend
            this.testChangeSel("qr|abc#^|st", "qr|^#abc|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel("qr|abc#^|st", "qr|a^#bc|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel("qr|abc#^|st", "qr|a^b#c|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel("qr|abc#^|st", "qr|a#b^c|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel("qr|abc#^|st", "qr|abc^#|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            // middle line, go to end, extend
            this.testChangeSel("qr|#abc^|st", "qr|^#abc|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel("qr|a#bc^|st", "qr|a^#bc|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel("qr|ab#c^|st", "qr|a^b#c|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel("qr|a#bc^|st", "qr|a#b^c|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel("qr|abc#^|st", "qr|abc^#|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            // one line, go to start, no extend
            this.testChangeSel("^#abc", "^#abc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#abc", "a^#bc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#abc", "a^b#c", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#abc", "a#b^c", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#abc", "abc^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            // one line, go to start, extend
            this.testChangeSel("^#abc", "^#abc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^a#bc", "a^#bc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^ab#c", "a^b#c", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^a#bc", "a#b^c", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^abc#", "abc^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            // one line, go to end, no extend
            this.testChangeSel("abc#^", "^#abc", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel("abc#^", "a^#bc", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel("abc#^", "a^b#c", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel("abc#^", "a#b^c", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            this.testChangeSel("abc#^", "abc^#", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            // one line, go to end, extend
            this.testChangeSel("#abc^", "^#abc", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel("a#bc^", "a^#bc", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel("ab#c^", "a^b#c", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel("a#bc^", "a#b^c", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel("abc#^", "abc^#", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            // empty line in middle
            this.testChangeSel("qr|#^|st", "qr|^#|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("qr|#^|st", "qr|^#|st", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("qr|#^|st", "qr|^#|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel("qr|#^|st", "qr|^#|st", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            // empty line at end
            this.testChangeSel("qr|#^", "qr|^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("qr|#^", "qr|^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("qr|#^", "qr|^#", SelAndEntryImpl.changeSelGoLineHomeEnd, false, true);
            this.testChangeSel("qr|#^", "qr|^#", SelAndEntryImpl.changeSelGoLineHomeEnd, false, false);
            // go to whitespace start, no extend
            this.testChangeSel("   ^#abc", "   abc^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("   ^#abc   def", "   abc   def^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("\t^#abc\tdef", "\tabc\tdef^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("\t\t\t^#abc\t\t\tdef", "\t\t\tabc\t\t\tdef^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("   ^#abc", "   ab^#c", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("   ^#abc", "   a^#bc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#   abc", "   ^#abc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#   abc", "  ^# abc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#   abc", " ^#  abc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#   abc", "^#   abc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#   ", "   ^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#   ", "  ^# ", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^# ", " ^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#\t\t\t", "\t\t\t^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            this.testChangeSel("^#\t", "\t^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, false);
            // go to whitespace start, extend
            this.testChangeSel("   ^abc#", "   abc^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("   ^abc   def#", "   abc   def^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("\t^abc\tdef#", "\tabc\tdef^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("\t\t\t^abc\t\t\tdef#", "\t\t\tabc\t\t\tdef^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("   ^ab#c", "   ab^#c", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("   ^a#bc", "   a^#bc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^   #abc", "   ^#abc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^  # abc", "  ^# abc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^ #  abc", " ^#  abc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^#   abc", "^#   abc", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^   #", "   ^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^  # ", "  ^# ", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^ #", " ^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^\t\t\t#", "\t\t\t^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
            this.testChangeSel("^\t#", "\t^#", SelAndEntryImpl.changeSelGoLineHomeEnd, true, true);
        },
        "testchangeTextDuplicate",
        () => {
            this.testChangeText("^#", "^#", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("^#a|a", "^#a", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("a^#|a", "a^#", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("abcd^#|abcd", "abcd^#", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("a^#bcd|abcd", "a^#bcd", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("^#abcd|abcd", "^#abcd", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("a^#bcd|abcd", "a^bc#d", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("12|abcd^#|abcd", "12|abcd^#", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("12|a^#bcd|abcd", "12|a^#bcd", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("12|^#abcd|abcd", "12|^#abcd", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("12|a^#bcd|abcd", "12|a^bc#d", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("12|abcd^#|abcd|34", "12|abcd^#|34", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("12|a^#bcd|abcd|34", "12|a^#bcd|34", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("12|^#abcd|abcd|34", "12|^#abcd|34", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("12|a^#bcd|abcd|34", "12|a^bc#d|34", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("abcd^#|abcd|34", "abcd^#|34", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("a^#bcd|abcd|34", "a^#bcd|34", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("^#abcd|abcd|34", "^#abcd|34", SelAndEntryImpl.changeTextDuplicate);
            this.testChangeText("a^#bcd|abcd|34", "a^bc#d|34", SelAndEntryImpl.changeTextDuplicate);
        },
        "testchangeTextIndentation",
        () => {
            let defFont = "geneva_18_" + textFontStylingToString(TextFontStyling.Default);

            // decrease indentation, one line
            this.testChangeText("^#", "^#", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^abc#", "abc^#", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^a\tbc#", "a\tbc^#", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^abc#", "\ta^b#c", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^abc#", "\tabc^#", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^\tabc#", "\t\tabc^#", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^\t\tabc#", "\t\t\tabc^#", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^abc\tdef#", "\tabc\tdef^#", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^abc#", "    abc^#", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^\tabc#", "        abc^#", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^\tabc#", "    \tabc^#", SelAndEntryImpl.changeTextIndentation, true, defFont);

            // decrease indentation, many lines
            this.testChangeText("^\tabc|ABC|def#|\tDEF", "^\t\tabc|\tABC|def#|\tDEF", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText("^\tabc|ABC|def#|\tDEF", "\t\tab^c|\tABC|d#ef|\tDEF", SelAndEntryImpl.changeTextIndentation, true, defFont);
            this.testChangeText(
                "\t\tabc|^ABC|def#|\tDEF",
                "\t\tabc|^\tABC|def#|\tDEF",
                SelAndEntryImpl.changeTextIndentation,
                true,
                defFont
            );
            this.testChangeText(
                "\t\tabc|^ABC|def#|\tDEF",
                "\t\tabc|\tABC^|#def|\tDEF",
                SelAndEntryImpl.changeTextIndentation,
                true,
                defFont
            );

            // increase indentation, one line
            this.testChangeText("^#", "^#", SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText("^\tabc#", "abc^#", SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText("^\ta\tbc#", "a\tbc^#", SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText("^\t\tabc#", "\ta^b#c", SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText("^\t\tabc#", "\tabc^#", SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText("^\t\t\tabc#", "\t\tabc^#", SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText("^\t\t\t\tabc#", "\t\t\tabc^#", SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText("^\t\tabc\tdef#", "\tabc\tdef^#", SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText("^\t\tabc#", "    abc^#", SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText("^\t\t\tabc#", "        abc^#", SelAndEntryImpl.changeTextIndentation, false, defFont);
            this.testChangeText("^\t\t\tabc#", "    \tabc^#", SelAndEntryImpl.changeTextIndentation, false, defFont);

            // increase indentation, many lines
            this.testChangeText(
                "^\t\t\tabc|\t\tABC|\tdef#|\tDEF",
                "^\t\tabc|\tABC|def#|\tDEF",
                SelAndEntryImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText(
                "^\t\t\tabc|\t\tABC|\tdef#|\tDEF",
                "\t\tab^c|\tABC|d#ef|\tDEF",
                SelAndEntryImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText(
                "\t\tabc|^\t\tABC|\tdef#|\tDEF",
                "\t\tabc|^\tABC|def#|\tDEF",
                SelAndEntryImpl.changeTextIndentation,
                false,
                defFont
            );
            this.testChangeText(
                "\t\tabc|^\t\tABC|\tdef#|\tDEF",
                "\t\tabc|\tABC^|#def|\tDEF",
                SelAndEntryImpl.changeTextIndentation,
                false,
                defFont
            );
        },
        "testchangeTextToggleLinePrefix",
        () => {
            let defFont = "geneva_18_" + textFontStylingToString(TextFontStyling.Default);
            let c = specialCharFontChange;
            // add prefix, one line
            this.testChangeText("^#", "^#", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^PREabc#", "abc^#", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^PREabc#", "^#abc", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^PREPRabc#", "PRabc^#", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^PREaPREbc#", "^#aPREbc", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^\tPREaPREbc#", "^#\taPREbc", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            // remove prefix, one line
            this.testChangeText("^abc#", "PREabc^#", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^abc#", "^#PREabc", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^PRabc#", "PREPRabc^#", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^aPREbc#", "^#PREaPREbc", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^PREabc#", "^#PREPREabc", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^\tPREabc#", "^#\tPREPREabc", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            // add prefix, many lines
            this.testChangeText("^PREab|PREcd#|ef", "^ab|cd#|ef", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^PREab|PREcd#|ef", "ab^|#cd|ef", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText(`ab|^PREcd|${c}${defFont}${c}PRE#`, "ab|cd#|^", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText(`ab|cd|${c}${defFont}${c}^PRE#`, "ab|cd|^#", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            // remove prefix, many lines
            this.testChangeText("^ab|cd#|PREef", "^PREab|PREcd#|PREef", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText("^ab|cd#|PREef", "PREab^|#PREcd|PREef", SelAndEntryImpl.changeTextToggleLinePrefix, "PRE", defFont);
            this.testChangeText(
                `PREab|^cd|${c}${defFont}${c}PRE#`,
                "PREab|PREcd#|^",
                SelAndEntryImpl.changeTextToggleLinePrefix,
                "PRE",
                defFont
            );
            this.testChangeText(
                `PREab|PREcd|^${c}${defFont}${c}PRE#`,
                "PREab|PREcd|^#",
                SelAndEntryImpl.changeTextToggleLinePrefix,
                "PRE",
                defFont
            );
        },
        "testchangeTextDeleteLine",
        () => {
            this.testChangeText("^#", "^#", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("^#", "abc^#", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("^#", "a^b#c", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("^#cd|ef", "ab^#|cd|ef", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("^#cd|ef", "^ab#|cd|ef", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("^#cd|ef", "ab^|cd#|ef", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("ab|^#ef", "ab|cd^#|ef", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("ab|^#ef", "ab|^cd#|ef", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("ab|^#ef", "ab|cd^|ef#", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("ab|cd|^#", "ab|cd|ef^#", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("ab|cd|^#", "ab|cd|^ef#", SelAndEntryImpl.changeTextDeleteLine);
            this.testChangeText("ab|cd|^#", "ab|cd#|ef^", SelAndEntryImpl.changeTextDeleteLine);
        },
        "testchangeTextBackspace",
        () => {
            // delete left
            this.testChangeText("^#abc", "^#abc", SelAndEntryImpl.changeTextBackspace, true, false);
            this.testChangeText("^#bc", "a^#bc", SelAndEntryImpl.changeTextBackspace, true, false);
            this.testChangeText("a^#c", "ab^#c", SelAndEntryImpl.changeTextBackspace, true, false);
            this.testChangeText("ab^#", "abc^#", SelAndEntryImpl.changeTextBackspace, true, false);
            // delete right
            this.testChangeText("^#bc", "^#abc", SelAndEntryImpl.changeTextBackspace, false, false);
            this.testChangeText("a^#c", "a^#bc", SelAndEntryImpl.changeTextBackspace, false, false);
            this.testChangeText("ab^#", "ab^#c", SelAndEntryImpl.changeTextBackspace, false, false);
            this.testChangeText("abc^#", "abc^#", SelAndEntryImpl.changeTextBackspace, false, false);

            // delete selection
            for (let isLeft of [true, false]) {
                this.testChangeText("a^#d", "a^bc#d", SelAndEntryImpl.changeTextBackspace, isLeft, false);
                this.testChangeText("a^#d", "a#bc^d", SelAndEntryImpl.changeTextBackspace, isLeft, false);
                this.testChangeText("^#d", "^abc#d", SelAndEntryImpl.changeTextBackspace, isLeft, false);
                this.testChangeText("a^#", "a^bcd#", SelAndEntryImpl.changeTextBackspace, isLeft, false);
                this.testChangeText("^#", "^abcd#", SelAndEntryImpl.changeTextBackspace, isLeft, false);
                this.testChangeText("^#", "^#", SelAndEntryImpl.changeTextBackspace, isLeft, false);
            }
        },
        "testchangeTextInsert",
        () => {
            let style = textFontStylingToString(TextFontStyling.Default);
            let defFont = "geneva_18_" + style;
            let c = specialCharFontChange;

            // basic usage
            this.testChangeText("1^#abc", "^#abc", SelAndEntryImpl.changeTextInsert, "1", defFont);
            this.testChangeText("123^#abc", "^#abc", SelAndEntryImpl.changeTextInsert, "123", defFont);
            this.testChangeText("a123^#bc", "a^#bc", SelAndEntryImpl.changeTextInsert, "123", defFont);
            this.testChangeText("ab123^#c", "ab^#c", SelAndEntryImpl.changeTextInsert, "123", defFont);
            this.testChangeText("abc123^#", "abc^#", SelAndEntryImpl.changeTextInsert, "123", defFont);
            // replace selection
            this.testChangeText("a123^#d", "a^bc#d", SelAndEntryImpl.changeTextInsert, "123", defFont);
            this.testChangeText("a123^#d", "a#bc^d", SelAndEntryImpl.changeTextInsert, "123", defFont);
            this.testChangeText("123^#d", "^abc#d", SelAndEntryImpl.changeTextInsert, "123", defFont);
            this.testChangeText("a123^#", "a^bcd#", SelAndEntryImpl.changeTextInsert, "123", defFont);
            this.testChangeText("123^#", "^abcd#", SelAndEntryImpl.changeTextInsert, "123", defFont);
            // if input is empty, use the default font
            this.testChangeText(`${c}${defFont}${c}123^#`, "^#", SelAndEntryImpl.changeTextInsert, "123", defFont);
            // input string changes fonts for each character
            this.testChangeText(
                `${c}courier_1_${style}${c}ABC^#a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
                `^#${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
                SelAndEntryImpl.changeTextInsert,
                "ABC",
                defFont
            );
            this.testChangeText(
                `${c}courier_1_${style}${c}aABC^#${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c`,
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}^#b${c}courier_3_${style}${c}c`,
                SelAndEntryImpl.changeTextInsert,
                "ABC",
                defFont
            );
            this.testChangeText(
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}bABC^#${c}courier_3_${style}${c}c`,
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}^#c`,
                SelAndEntryImpl.changeTextInsert,
                "ABC",
                defFont
            );
            this.testChangeText(
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}cABC^#`,
                `${c}courier_1_${style}${c}a${c}courier_2_${style}${c}b${c}courier_3_${style}${c}c^#`,
                SelAndEntryImpl.changeTextInsert,
                "ABC",
                defFont
            );
        },

        "testchangeSelLeftRightUntilWord",
        () => {
            // move left by words
            this.testChangeSel("#^abcd", "^#abcd", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("#^abcd", "ab^#cd", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("#^abcd", "abcd^#", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("#^abcd ", "abcd ^#", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("#^abcd  ", "abcd  ^#", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("#^abcd\t", "abcd\t^#", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("abcd ^#d", "abcd d^#", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("abcd ^#de", "abcd de^#", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("abcd ^#\n", "abcd \n^#", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("abcd \n^#d", "abcd \nd^#", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("abc ^#123 abc", "abc 123^# abc", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("^#abc 123 abc", "abc^# 123 abc", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("abc.123.^#abc", "abc.123.abc^#", SelAndEntryImpl.changeSelLeftRight, true, false, true);
            this.testChangeSel("abc.123^#.abc", "abc.123.^#abc", SelAndEntryImpl.changeSelLeftRight, true, false, true);

            // move right by words
            this.testChangeSel("abcd^#", "^#abcd", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abcd^#", "ab^#cd", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abcd^#", "abcd^#", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abcd #^", "abcd ^#", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel(" #^abcd", "^# abcd", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abcd  #^", "^#abcd  ", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abcd\t#^", "^#abcd\t", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abcd ^#d", "^#abcd d", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abcd ^#de", "^#abcd de", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abcd ^#\n", "^#abcd \n", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abcd ^#\nd", "^#abcd \nd", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abc 123 ^#abc", "abc ^#123 abc", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abc 123 abc^#", "abc 123 ^#abc", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abc^#.123.abc", "^#abc.123.abc", SelAndEntryImpl.changeSelLeftRight, false, false, true);
            this.testChangeSel("abc.^#123.abc", "abc^#.123.abc", SelAndEntryImpl.changeSelLeftRight, false, false, true);
        },
        "testchangeSelCurrentWord",
        () => {
            this.testChangeSel("^#", "^#", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("^a#", "^#a", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("^abc#", "^#abc", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel(" ^abc#", " ^#abc", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("^abc# ", "^#abc ", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("test1 test2^ #test3", "test1 test2^# test3", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("test1 ^test2# test3", "test1 test^#2 test3", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("test1 ^test2# test3", "test1 tes^#t2 test3", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("test1 ^test2# test3", "test1 te^#st2 test3", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("test1 ^test2# test3", "test1 ^#test2 test3", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("test1^ #test2 test3", "test1^# test2 test3", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel(".^a#.", ".^#a.", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel(".a^.#", ".a^#.", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel(".^abc#.", ".ab^#c.", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("1 ^a# 2", "1 ^#a 2", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("1 ^abc# 2", "1 ab^#c 2", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("1 abc ^2#", "1 abc ^#2", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("1 abc^ #2", "1 abc^# 2", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("1 abc^  #2", "1 abc^#  2", SelAndEntryImpl.changeSelCurrentWord);
            this.testChangeSel("1 abc^  #2", "1 abc ^# 2", SelAndEntryImpl.changeSelCurrentWord);
        },
        "test_selectLineInField,selectByLinesWhichLine",
        () => {
            // empty field
            let el = new UI512ElTextField("test", new ElementObserverNoOp());
            let gel = new UI512ElTextFieldAsGeneric(el);
            el.setftxt(FormattedText.newFromUnformatted(""));
            SelAndEntry.selectLineInField(this.root, gel, 0);
            assertEq(0, el.get_n("selcaret"), "");
            assertEq(0, el.get_n("selend"), "");
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), "");
            SelAndEntry.selectLineInField(this.root, gel, 2);
            assertEq(0, el.get_n("selcaret"), "");
            assertEq(0, el.get_n("selend"), "");
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), "");

            // field with no empty lines
            el.setftxt(FormattedText.newFromUnformatted("abc\ndef\nghi"));
            SelAndEntry.selectLineInField(this.root, gel, 0);
            assertEq(0, el.get_n("selcaret"), "");
            assertEq(4, el.get_n("selend"), "");
            assertEq(0, SelAndEntry.selectByLinesWhichLine(gel), "");
            SelAndEntry.selectLineInField(this.root, gel, 1);
            assertEq(4, el.get_n("selcaret"), "");
            assertEq(8, el.get_n("selend"), "");
            assertEq(1, SelAndEntry.selectByLinesWhichLine(gel), "");
            SelAndEntry.selectLineInField(this.root, gel, 2);
            assertEq(8, el.get_n("selcaret"), "");
            assertEq(11, el.get_n("selend"), "");
            assertEq(2, SelAndEntry.selectByLinesWhichLine(gel), "");
            SelAndEntry.selectLineInField(this.root, gel, 3);
            assertEq(11, el.get_n("selcaret"), "");
            assertEq(11, el.get_n("selend"), "");
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), "");
            SelAndEntry.selectLineInField(this.root, gel, 4);
            assertEq(11, el.get_n("selcaret"), "");
            assertEq(11, el.get_n("selend"), "");
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), "");

            // field with some empty lines
            el.setftxt(FormattedText.newFromUnformatted("\nabc\n\ndef\n"));
            SelAndEntry.selectLineInField(this.root, gel, 0);
            assertEq(0, el.get_n("selcaret"), "");
            assertEq(1, el.get_n("selend"), "");
            assertEq(0, SelAndEntry.selectByLinesWhichLine(gel), "");
            SelAndEntry.selectLineInField(this.root, gel, 1);
            assertEq(1, el.get_n("selcaret"), "");
            assertEq(5, el.get_n("selend"), "");
            assertEq(1, SelAndEntry.selectByLinesWhichLine(gel), "");
            SelAndEntry.selectLineInField(this.root, gel, 2);
            assertEq(5, el.get_n("selcaret"), "");
            assertEq(6, el.get_n("selend"), "");
            assertEq(2, SelAndEntry.selectByLinesWhichLine(gel), "");
            SelAndEntry.selectLineInField(this.root, gel, 3);
            assertEq(6, el.get_n("selcaret"), "");
            assertEq(10, el.get_n("selend"), "");
            assertEq(3, SelAndEntry.selectByLinesWhichLine(gel), "");
            SelAndEntry.selectLineInField(this.root, gel, 4);
            assertEq(10, el.get_n("selcaret"), "");
            assertEq(10, el.get_n("selend"), "");
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), "");
            SelAndEntry.selectLineInField(this.root, gel, 5);
            assertEq(10, el.get_n("selcaret"), "");
            assertEq(10, el.get_n("selend"), "");
            assertEq(undefined, SelAndEntry.selectByLinesWhichLine(gel), "");
        },
    ];

    // ^ is caret, # is end, | is newline
    testChangeSel(expected: string, input: string, fn: Function, ...moreargs: any[]) {
        expected = expected.replace(/\|/g, "\n");
        input = input.replace(/\|/g, "\n");
        let [t, selcaret, selend] = this.fromPlainText(input);
        let args = [t, selcaret, selend, ...moreargs];
        let [nextselcaret, nextselend] = fn.apply(null, args);
        let [expectedt, expectedcaret, expectedend] = this.fromPlainText(expected);
        assertEq(expectedt.toPersisted(), t.toPersisted(), "1s|");
        assertEq(expectedcaret, nextselcaret, "1r|incorrect caret position");
        assertEq(expectedend, nextselend, "1q|incorrect select-end position");
    }

    testChangeText(expected: string, input: string, fn: Function, ...moreargs: any[]) {
        expected = expected.replace(/\|/g, "\n");
        input = input.replace(/\|/g, "\n");
        let [t, selcaret, selend] = this.fromPlainText(input);
        let args = [t, selcaret, selend, ...moreargs];
        let [nextt, nextselcaret, nextselend] = fn.apply(null, args);
        let [expectedt, expectedcaret, expectedend] = this.fromPlainText(expected);
        assertEq(expectedt.toPersisted(), nextt.toPersisted(), "1p|");
        assertEq(expectedcaret, nextselcaret, "1o|");
        assertEq(expectedend, nextselend, "1n|");
    }

    protected fromPlainText(s: string): [FormattedText, number, number] {
        // step 1) get a string without the font changes
        let tToGetUnformatted = FormattedText.newFromPersisted(s);
        let sUnformatted = tToGetUnformatted.toUnformatted();
        assertTrue(scontains(sUnformatted, "^") && scontains(sUnformatted, "#"), `1m|string "${sUnformatted}" needs ^ and #`);

        // step 2) get caret positions
        let selcaret, selend;
        if (sUnformatted.indexOf("^") < sUnformatted.indexOf("#")) {
            selcaret = sUnformatted.indexOf("^");
            sUnformatted = sUnformatted.replace(/\^/g, "");
            selend = sUnformatted.indexOf("#");
            sUnformatted = sUnformatted.replace(/#/g, "");
        } else {
            selend = sUnformatted.indexOf("#");
            sUnformatted = sUnformatted.replace(/#/g, "");
            selcaret = sUnformatted.indexOf("^");
            sUnformatted = sUnformatted.replace(/\^/g, "");
        }

        // step 3) create formatted text
        let t = FormattedText.newFromPersisted(s.replace(/#/g, "").replace(/\^/g, ""));
        return [t, selcaret, selend];
    }
}

const loremText = `Lorem ipsum dolor sit amet, dolore pericula ne mel, erat feugait placerat ut sit, id vel persecuti constituam. Nibh probo et pro, ei quo case deterruisset. Nibh impetus per at. Oporteat scripserit has te, sea te nostrud pertinacia. Per deleniti deseruisse an, et usu singulis necessitatibus. Antiopam efficiendi an mei.\nCum cu ignota timeam consequat, salutandi contentiones nam an, ut apeirian deserunt conclusionemque eum. Eu singulis deterruisset vix, sed in sumo suas facete. Qui reprimique dissentiunt te, nam ne habeo officiis argumentum, cu pri homero democritum. No illum moderatius sea, vim no equidem nusquam complectitur.\nAutem dolor principes ea duo. In sea suas tation regione, cum ei maiorum volumus reformidans. Ei mei noluisse oportere iudicabit, ex ius summo officiis, feugait blandit nominavi id vel. Purto accusamus eu ius, an posse probatus similique qui.\nUt nibh maiestatis ius, sea dolorum facilisi ei. Cu cum tritani quaeque pertinacia, causae delectus delicata pro te, graeco scribentur reprehendunt pri eu. Corpora iracundia adolescens sit ei, in duo commune reprimique. In aliquam graecis eum, fugit utamur et sea. In molestie platonem conceptam mel. Ea hinc sensibus eam, aeque expetendis reprimique et vim.\nSumo saepe sit ne. Ex facilisi pericula constituam pri, et pro habemus definiebas, aliquam electram ex nam. Magna nostro moderatius ei sea, cu quo nostro theophrastus. Tation blandit ei per, odio dolorem has at. At brute alterum vituperatoribus nec, ad vix idque vocent. An porro ullum euripidis his, an graecis nostrum eligendi nec. Eos saepe aeterno accommodare ei.`;
