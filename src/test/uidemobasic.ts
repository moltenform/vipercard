
/* autoimport:start */
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { EditTextBehavior, addDefaultListeners } from "../ui512/ui512elementstextlisten.js";
import { MouseDragStatus, UI512Controller } from "../ui512/ui512controller.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class UI512DemoBasic extends UI512Controller {
    timer = new RepeatingTimer(2000);
    counter = 0;
    init(root: Root) {
        super.init(root);
        addDefaultListeners(this.listeners);

        let clientrect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientrect, this);
        let grp = new UI512ElGroup("grpmain");
        this.app.addGroup(grp);
        this.inited = true;

        let btn1 = new UI512ElButton("btn1");
        grp.addElement(this.app, btn1);
        btn1.set("labeltext", "abc\n12345678\nFile");
        btn1.setDimensions(300, 80, 90, 90);

        let btn2 = new UI512ElButton("btn2");
        grp.addElement(this.app, btn2);
        btn2.set("labeltext", "pulsating");
        btn2.setDimensions(100, 90, 90, 90);

        this.invalidateAll();

        this.listenEvent(UI512EventType.MouseEnter, (_: object, r: Root, d: MouseEnterDetails) => {
            if (d.el && d.el.id === "btn1") {
                UI512CursorAccess.setCursor(UI512Cursors.hand);
            }
        });

        this.listenEvent(UI512EventType.MouseLeave, (_: object, r: Root, d: MouseLeaveDetails) => {
            if (d.el && d.el.id === "btn1") {
                UI512CursorAccess.setCursor(UI512Cursors.arrow);
            }
        });

        this.listenEvent(UI512EventType.Idle, (_: object, r: Root, d: IdleEventDetails) => {
            this.timer.update(d.milliseconds);
            if (this.timer.isDue()) {
                this.timer.reset();
                let getbtn2 = cast(this.app.getElemById("btn2"), UI512ElButton);
                getbtn2.set("labeltext", getbtn2.get_s("labeltext") === "pulsating" ? "pulsating..." : "pulsating");
            }
        });

        this.listenEvent(UI512EventType.MouseUp, UI512DemoBasic.respondMouseUp);
        this.rebuildFieldScrollbars();
    }

    private static respondMouseUp(c: UI512DemoBasic, root: Root, d: MouseUpEventDetails) {
        if (d.button !== 0) {
            return;
        }

        if (d.elClick) {
            console.log("hello from " + d.elClick.id);
            if (d.elClick.id === "btn1") {
                c.counter += 1;

                let btn1 = cast(d.elClick, UI512ElButton);
                btn1.set("labeltext", "counter: " + c.counter.toString());
                btn1.setDimensions(btn1.x + 10, btn1.y + 10, btn1.w, btn1.h);
            }
        }
    }
}
