
/* autoimport:start */
import { UI512CompStdDialogType, UI512CompStdDialog } from "../ui512/ui512compositesmodal.js";
import { UI512AutoIndent, UI512CompCodeEditor } from "../ui512/ui512compositeseditor.js";
import { EditTextBehavior, addDefaultListeners } from "../ui512/ui512elementstextlisten.js";
import { MouseDragStatus, UI512Controller } from "../ui512/ui512controller.js";
import { UI512ControllerBase, BasicHandlers, MenuOpenState, TemporaryIgnoreEvents } from "../ui512/ui512controllerbase.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512ViewDraw } from "../ui512/ui512elementsdefaultview.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { IconInfo, RenderIcon, RenderIconSet, RenderIconManager, UI512ImageCollectionCollection, UI512ImageCollection, UI512ImageCollectionImage } from "../ui512/ui512rendericon.js";
import { Test_ui512Elements, Test_CodeEditorHelpers, runTests } from "../test/testui512elements.js";
import { UI512DemoBasic } from "../test/uidemobasic.js";
import { UI512DemoButtons, Test_DrawButtons } from "../test/uidemobuttons.js";
import { UI512TestCompositesController, UI512DemoComposites, Test_DrawComposites } from "../test/uidemocomposites.js";
import { UI512DemoMenus, UI512TestMenusController, Test_DrawMenus } from "../test/uidemomenus.js";
import { UI512DemoPaint, Test_DrawPaint } from "../test/uidemopaint.js";
import { UI512DemoText, Test_DrawText, Test_RenderTextUtils, Test_CanvasComparison } from "../test/uidemotext.js";
import { UI512DemoTextEdit, UI512TestTextEditController, Test_DrawTextEdit, Test_SelAndEntry } from "../test/uidemotextedit.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

/* 
Layering
    this chart is used by auto_ts_import.py to construct import statements.
    items higher in the list may only import from items lower on the list, to prevent ref cycles.

    %%layerstart%%
    ---section---(+ui512utils,+ui512elements,+ui512elementsbase,+ui512elementstextlisten,+ui512controller,+ui512elementslisteners,+ui512renderutils)
    uidemobasic.ts                  ()
    uidemobuttons.ts                (+ui512rendericon,+ui512elementsdefaultview)  
    uidemocomposites.ts             (+ui512compositesmodal,+ui512compositeseditor,+ui512composites,+ui512controllerbase)     
    uidemomenus.ts                  (+ui512menurender,+ui512menulisteners)
    uidemopaint.ts                  (+ui512paint,+ui512rendericon)
    uidemotextedit.ts               (+ui512rendertext,+ui512elementstextselect)   
    uidemotext.ts                   (+ui512rendertext)



    ---section---()
    ui512root.ts                    (+ui512rendericon,+testui512elements,+uidemobasic,+uidemobuttons,+uidemocomposites,+uidemomenus,+uidemopaint,+uidemotext,+uidemotextedit)
    ui512compositesmodal.ts         (default,+ui512composites)
    ui512compositeseditor.ts        (default,+ui512composites,+ui512elementstextselect)
    ui512elementstextlisten.ts      (default,+ui512menulisteners,+ui512elementstextselect,+ui512elementsscrollbar)
    ui512controller.ts              (default,+ui512elementstextselect,+ui512elementsscrollbar,+ui512menulisteners,+ui512menurender,+ui512elementsmenu)
    ui512elementstextselect.ts      (+ui512elementsscrollbar)
    ui512elementsscrollbar.ts       (+ui512renderborders)
    ui512menulisteners.ts           (+ui512menurender,+ui512elementsmenu)
    ui512menurender.ts              (+ui512elementsmenu)
    ui512composites.ts              ()
    ui512controllerbase.ts          (default)
    ui512elementslisteners.ts       (default)
    ui512elementsdefaultview.ts     (default,+ui512rendericon,+ui512renderborders,+ui512paint,+ui512elementsmenu)
    ui512renderborders.ts           ()
    ui512elementsmenu.ts            ()
    ui512elements.ts                (default,+ui512paint)
    ui512elementsbase.ts            (default)
    ui512paint.ts                   (+ui512rendericon)
    ui512rendericon.ts              ()
    ui512rendertext.ts              (default)
    ui512renderutils.ts             (default)
    ui512utils.ts                   (default)
    %%layerend%%

*/


export class UI512Root implements Root {
    domCanvas: CanvasWrapper;
    controller: UI512ControllerAbstract;
    fontManager: TextRendererFontManager;
    iconManager: RenderIconManager;
    browserOSInfo: BrowserOSInfo;
    prevMouseDown: O<MouseDownEventDetails>;
    scaleMouseCoords: O<number>;
    session: O<IUI512Session>;

    // send a ping to the apps every 0.1 seconds
    timerSendIdleEvent = new RepeatingTimer(100);
    mouseButtonsExpected = 0;

    init(domCanvas: HTMLCanvasElement) {
        this.browserOSInfo = Util512.getBrowserOS(window.navigator.userAgent);
        this.fontManager = new TextRendererFontManager();
        this.iconManager = new RenderIconManager();
        this.domCanvas = new CanvasWrapper(domCanvas);

        // this.controller = new UI512DemoBasic();
        // this.controller = new UI512DemoButtons();
        // this.controller = new UI512DemoComposites();
        // this.controller = new UI512DemoMenus();
        // this.controller = new UI512DemoPaint();
        // this.controller = new UI512DemoText();
        this.controller = new UI512DemoTextEdit();
        domCanvas.setAttribute('id', 'mainDomCanvas')
        UI512CursorAccess.setCursor(UI512CursorAccess.defaultCursor)

        try {
            this.controller.init(this);
        } catch (e) {
            ui512RespondError(e, "init");
        }
    }

    public invalidateAll() {
        try {
            this.controller.invalidateAll();
        } catch (e) {
            ui512RespondError(e, "invalidateAll");
        }
    }

    public getFontManager() {
        return this.fontManager;
    }

    public getIconManager() {
        return this.iconManager;
    }

    public getSession() {
        return this.session;
    }

    public setSession(ss:O<IUI512Session>) {
        this.session = ss;
    }

    public getBrowserInfo() {
        return this.browserOSInfo;
    }

    replaceCurrentController(newController: any) {
        assertTrue(newController instanceof UI512ControllerAbstract, "3@|not a controller");
        if (newController.importMouseTracking) {
            newController.importMouseTracking(this.controller)
        }

        this.controller = newController;
        this.invalidateAll();
    }

    event(details: EventDetails) {
        if (details instanceof MouseEventDetails) {
            if (!this.scaleMouseCoords) {
                return false;
            }

            details.mouseX = Math.trunc(details.mouseX / this.scaleMouseCoords);
            details.mouseY = Math.trunc(details.mouseY / this.scaleMouseCoords);
        }

        if (details instanceof MouseMoveEventDetails) {
            if (!this.scaleMouseCoords) {
                return false;
            }

            details.mouseX = Math.trunc(details.mouseX / this.scaleMouseCoords);
            details.mouseY = Math.trunc(details.mouseY / this.scaleMouseCoords);
            details.prevMouseX = Math.trunc(details.prevMouseX / this.scaleMouseCoords);
            details.prevMouseY = Math.trunc(details.prevMouseY / this.scaleMouseCoords);
        }

        if (!details.handled()) {
            try {
                this.controller.rawEvent(this, details);
            } catch (e) {
                ui512RespondError(e, "event " + details.type());
            }
        }

        if (details instanceof MouseDownEventDetails) {
            if (this.prevMouseDown) {
                if (
                    details.timestamp - this.prevMouseDown.timestamp < 500 &&
                    Math.abs(details.mouseX - this.prevMouseDown.mouseX) < 2 &&
                    Math.abs(details.mouseY - this.prevMouseDown.mouseY) < 2 &&
                    details.button === this.prevMouseDown.button
                ) {
                    let newevent = new MouseDownDoubleEventDetails(
                        details.timestamp,
                        details.mouseX,
                        details.mouseY,
                        details.button,
                        details.mods
                    );

                    // don't set d.el yet, this.prevMouseDown.el might be out of date.
                    this.event(newevent);
                }
            }

            this.prevMouseDown = details;
        }

        return details.handled();
    }

    rawResize(width: number, height: number) {
        this.invalidateAll();
    }

    sendMissedEvents(buttons: number) {
        // observed behavior: let's say there is a button on the screen. you click the button,
        // and it highlights as expected. you then, while holding the mouse button down, drag the
        // cursor outside of the window. then release the mouse button when the cursor is outside.
        // now, when you bring the cursor back into the window, it *incorrectly* thinks that
        // the button should be re-highlighted, even though the mouse button is up, because
        // we never got the mouseup event.

        // so, I wrote this fix. if we see that the mouse buttons are different than we
        // expected, send simulated "mouseup" events for each mouse button that is now up.
        // (the same could be done for mousedown events, but we don't have any drag-into-window scenario now).
        const maxNumberOfMouseButtons = 10;
        let needToSendMouseUp = this.mouseButtonsExpected & ~buttons;
        this.mouseButtonsExpected = buttons;
        for (let i = 0; i < maxNumberOfMouseButtons; i++) {
            if (needToSendMouseUp & (1 << i)) {
                let details = new MouseUpEventDetails(0, 0, 0, i, ModifierKeys.None);
                this.event(details);
            }
        }
    }

    drawFrame(frameCount: number, milliseconds: number) {
        this.timerSendIdleEvent.update(milliseconds);
        if (this.timerSendIdleEvent.isDue()) {
            this.timerSendIdleEvent.reset();
            this.event(new IdleEventDetails(milliseconds));
        }

        let complete = new RenderComplete();
        try {
            this.controller.render(this, this.domCanvas, milliseconds, complete);
        } catch (e) {
            ui512RespondError(e, "drawFrame");
        }
    }

    public runTests(all: boolean) {
        runTests(this, all);
    }
}

function mainOnResize(root: UI512Root, gly: any) {
    // on high-dpi screens, automatically show bigger pixels, with no blurring

    let availW = window.innerWidth;
    let availH = window.innerHeight;
    let canFitW = Math.max(1, Math.trunc(availW / ScreenConsts.screenwidth));
    let canFitH = Math.max(1, Math.trunc(availH / ScreenConsts.screenheight));
    let canFitTotal = Math.min(canFitW, canFitH);
    if (!Util512.isValidNumber(canFitTotal)) {
        assertTrueWarn(false, `3?|invalid canFitW=${canFitW} canFitW=${canFitW}`);
        return;
    }

    let elemMessageBelow = document.getElementById("elemMessageBelow");
    if (elemMessageBelow) {
        if (Math.abs(window.devicePixelRatio - Math.round(window.devicePixelRatio)) > 0.01) {
            elemMessageBelow.innerText = "Please set your browser zoom level to 100% for the sharpest graphics...";
        } else {
            elemMessageBelow.innerText = "";
        }
    }

    if (canFitTotal !== root.scaleMouseCoords) {
        let domElement = gly.domElement;
        gly.width = ScreenConsts.screenwidth; // sets both priv['domElement']['width'] and priv['width']
        gly.height = ScreenConsts.screenheight; // sets both priv['domElement']['height'] and priv['height']
        domElement.style.width = ScreenConsts.screenwidth * canFitTotal + "px";
        domElement.style.height = ScreenConsts.screenheight * canFitTotal + "px";
        root.scaleMouseCoords = canFitTotal;
        root.rawResize(ScreenConsts.screenwidth, ScreenConsts.screenheight);
    }
}

let mainVPCStartCanvasStarted = false;

function mainVPCStartCanvas(fnMakeGolly: any) {
    if (mainVPCStartCanvasStarted) {
        return;
    }

    mainVPCStartCanvasStarted = true;
    let gollyParams = {
        eatallkeyevents: true,
        customsizing: true,
        trackFrameTime: false,
        fnaddtodom: function(container: any, d: any) {
            container.insertBefore(d, document.getElementById("elemMessageBelow"));
        },
    };

    let browserOSInfo = Util512.getBrowserOS(window.navigator.userAgent);
    let root = new UI512Root();
    let gly: any = fnMakeGolly(gollyParams);
    gly.desiredFrameTime = 60;
    root.init(gly.domElement);
    gly.draw = function() {
        root.drawFrame(gly.frameCount, gly.milliseconds);
    };

    gly.onresize = function() {
        mainOnResize(root, gly);
    };

    gly.keydown = function(
        keyCode: string,
        keyChar: string,
        repeated: boolean,
        ctrlKey: boolean,
        shiftKey: boolean,
        altKey: boolean,
        metaKey: boolean
    ) {
        let mods = osTranslateModifiers(browserOSInfo, ctrlKey, shiftKey, altKey, metaKey);
        let details = new KeyDownEventDetails(gly.milliseconds, keyCode, keyChar, repeated, mods);
        root.event(details);

        // let "paste" through, stop everything else
        if (details.readableShortcut !== "Cmd+V") {
            details.setHandled();
        }

        return !details.handled();
    };

    gly.keyup = function(keyCode: string, keyChar: string, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean) {
        let mods = osTranslateModifiers(browserOSInfo, ctrlKey, shiftKey, altKey, metaKey);
        let details = new KeyUpEventDetails(gly.milliseconds, keyCode, keyChar, false, mods);
        root.event(details);

        // let "paste" through, stop everything else
        let readableShortcut = toShortcutString(details.mods, details.keyCode);
        if (readableShortcut !== "Cmd+V") {
            details.setHandled();
        }

        return !details.handled();
    };

    gly.mousemove = function(mouseX: number, mouseY: number, button: number, buttons: number, prevMouseX: number, prevMouseY: number) {
        let details = new MouseMoveEventDetails(gly.milliseconds, mouseX, mouseY, prevMouseX, prevMouseY);
        root.event(details);
        if (buttons !== root.mouseButtonsExpected) {
            root.sendMissedEvents(buttons);
        }

        return !details.handled();
    };

    gly.mouseup = function(
        mouseX: number,
        mouseY: number,
        button: number,
        buttons: number,
        ctrlKey: boolean,
        shiftKey: boolean,
        altKey: boolean,
        metaKey: boolean
    ) {
        let mods = osTranslateModifiers(browserOSInfo, ctrlKey, shiftKey, altKey, metaKey);
        let details = new MouseUpEventDetails(gly.milliseconds, mouseX, mouseY, button, mods);
        root.event(details);
        root.mouseButtonsExpected = buttons;
        return !details.handled();
    };

    gly.mousedown = function(
        mouseX: number,
        mouseY: number,
        button: number,
        buttons: number,
        ctrlKey: boolean,
        shiftKey: boolean,
        altKey: boolean,
        metaKey: boolean
    ) {
        let mods = osTranslateModifiers(browserOSInfo, ctrlKey, shiftKey, altKey, metaKey);
        let details = new MouseDownEventDetails(gly.milliseconds, mouseX, mouseY, button, mods);
        root.event(details);
        root.mouseButtonsExpected = buttons;
        return !details.handled();
    };

    mainOnResize(root, gly);
}

// expose this function globally
(window as any).mainVPCStartCanvas = mainVPCStartCanvas;
