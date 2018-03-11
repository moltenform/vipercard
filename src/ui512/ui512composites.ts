
/* autoimport:start */
import { UI512ControllerBase, BasicHandlers, MenuOpenState, TemporaryIgnoreEvents } from "../ui512/ui512controllerbase.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512ViewDraw } from "../ui512/ui512elementsdefaultview.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { makeUI512ErrorGeneric, checkThrowUI512, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, IUI512Session, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

export class BorderDecorationConsts {
    headHeight = 0;
    fillshrinkX = 0;
    fillshrinkY = 0;
    closeBtnBgWidth = 0;
    closeBtnWidth = 0;
    closeBtnHeight = 0;
    closeBtnX = 0;
    closeBtnY = 0;
    filliconset = "";
    filliconnumber = 0;
    filliconadjustx = 0;
    filliconadjusty = 0;
    footer = 2;
}

export class PalBorderDecorationConsts extends BorderDecorationConsts {
    readonly headHeight = 11;
    readonly fillshrinkX = -1;
    readonly fillshrinkY = -1;
    readonly filliconset = "000";
    readonly filliconnumber = 2;
    readonly filliconadjusty = 1;
    readonly closeBtnBgWidth = 11;
    readonly closeBtnWidth = 7;
    readonly closeBtnHeight = 7;
    readonly closeBtnX = 8;
    readonly closeBtnY = 2;
}

export class WndBorderDecorationConsts extends BorderDecorationConsts {
    readonly headHeight = 19;
    readonly fillshrinkX = 1;
    readonly fillshrinkY = 2;
    readonly filliconset = "000";
    readonly filliconnumber = 3;
    readonly filliconadjusty = 1;
    readonly closeBtnBgWidth = 13;
    readonly closeBtnWidth = 11;
    readonly closeBtnHeight = 11;
    readonly closeBtnX = 9;
    readonly closeBtnY = 4;
}

export abstract class UI512CompBase {
    idprefix = "";
    readonly grpid: string;
    readonly compositeId: string;
    compositeType = "";
    children: UI512Element[] = [];

    // logical dimensions. it is ok if children extend beyond these boundaries.
    logicalWidth = 0;
    logicalHeight = 0;
    x = 0;
    y = 0;

    constructor(compositeId: string) {
        this.compositeId = compositeId;
        this.grpid = this.getElId("composite");
    }

    getElId(suffix: string) {
        return this.compositeId + "##" + this.compositeType + "##" + suffix;
    }

    fromFullId(fullid: string) {
        let parts = fullid.split(this.compositeId + "##" + this.compositeType + "##");
        if (parts.length !== 2) {
            return undefined;
        } else {
            return parts[1];
        }
    }

    moveAllTo(newx: number, newy: number, app: UI512Application) {
        let dx = newx - this.x;
        let dy = newy - this.y;
        if (dx !== 0 && dy !== 0) {
            this.x += dx;
            this.y += dy;
            for (let el of this.children) {
                el.setDimensions(el.x + dx, el.y + dy, el.w, el.h);
            }
        }
    }

    protected genBtn(app: UI512Application, grp: UI512ElGroup, shortid: string) {
        return this.genChild(app, grp, shortid, UI512ElButton);
    }

    protected genChild<T extends UI512Element>(
        app: UI512Application,
        grp: UI512ElGroup,
        shortid: string,
        ctor: { new (...args: any[]): T }
    ): T {
        let el = new ctor(this.getElId(shortid));
        grp.addElement(app, el);
        this.children.push(el);
        return el;
    }

    abstract createSpecific(app: UI512Application, lang: UI512Lang): void;

    create(c:UI512ControllerBase, app: UI512Application, lang: UI512Lang) {
        assertEq(0, this.children.length, `2v|creating composite twice? ${this.compositeId}`);
        if (!app.findGroup(this.grpid)) {
            let grp = new UI512ElGroup(this.grpid, app.observer);
            app.addGroup(grp);
        }

        this.createSpecific(app, lang);
        c.rebuildFieldScrollbars()        
    }

    destroy(c:UI512ControllerBase, app: UI512Application) {
        this.children.length = 0;
        app.removeGroup(this.grpid);
        c.rebuildFieldScrollbars()
    }

    protected drawWindowDecoration(app: UI512Application, c: BorderDecorationConsts, hasclosebtn: boolean) {
        let grp = app.getGroup(this.grpid);

        // draw background+shadow
        let headerbox = this.genBtn(app, grp, "headerbox");
        headerbox.set("autohighlight", false);
        headerbox.setDimensions(this.x, this.y, this.logicalWidth, c.headHeight);

        // get header fill rect
        if (c.fillshrinkX >= 0) {
            let fillrect = RectUtils.getSubRectRaw(this.x, this.y, this.logicalWidth, c.headHeight, c.fillshrinkX, c.fillshrinkY);
            if (!fillrect) {
                return c.headHeight;
            }

            // draw header fill
            let headerfill = this.genBtn(app, grp, "headerfill");
            headerfill.set("style", UI512BtnStyle.opaque);
            headerfill.set("autohighlight", false);
            headerfill.set("iconsetid", c.filliconset);
            headerfill.set("iconnumber", c.filliconnumber);
            headerfill.set("iconadjustx", c.filliconadjustx);
            headerfill.set("iconadjusty", c.filliconadjusty);
            headerfill.setDimensions(fillrect[0], fillrect[1], fillrect[2], fillrect[3]);
        } else {
            headerbox.set("iconsetid", c.filliconset);
            headerbox.set("iconnumber", c.filliconnumber);
            headerbox.set("iconadjustx", c.filliconadjustx);
            headerbox.set("iconadjusty", c.filliconadjusty);
        }

        if (hasclosebtn) {
            // draw background for close button
            let closebtnbg = this.genBtn(app, grp, "closebtnbg");
            closebtnbg.set("style", UI512BtnStyle.opaque);
            closebtnbg.set("autohighlight", false);
            let clx = c.closeBtnX - Math.floor((c.closeBtnBgWidth - c.closeBtnWidth) / 2);
            closebtnbg.setDimensions(this.x + clx, this.y + 1, c.closeBtnBgWidth, c.headHeight - 2);

            // draw close button
            let closebtn = this.genBtn(app, grp, "closebtn");
            closebtn.set("autohighlight", true);
            closebtn.setDimensions(this.x + c.closeBtnX, this.y + c.closeBtnY, c.closeBtnWidth, c.closeBtnHeight);
        }

        // draw caption
        if (c instanceof WndBorderDecorationConsts) {
            let caption = this.genChild(app, grp, "caption", UI512ElLabel);
            caption.set("transparentExceptChars", true);
            caption.set("labeltext", "");
            caption.set("labelwrap", false);
            caption.set("labelhalign", true);
            caption.set("labelvalign", true);
            caption.setDimensions(headerbox.x, headerbox.y, headerbox.w, headerbox.h);
        }

        return c.headHeight;
    }

    setVisible(app: UI512Application, visible: boolean) {
        let grp = app.getGroup(this.grpid);
        grp.setVisible(visible);
    }
}

export class UI512CompRadioButtonGroup extends UI512CompBase {
    items: [string, string][] = [["circle", "lngCircle"], ["rectangle", "lngRectangle"]];
    isExclusive = false;
    elemymargin = 5;
    elemheight = 20;
    compositeType = "buttongroup";

    createSpecific(app: UI512Application, lang: UI512Lang) {
        Util512.freezeRecurse(this.items);
        let grp = app.getGroup(this.grpid);
        let cury = this.y;
        for (let item of this.items) {
            let el = this.genBtn(app, grp, item[0]);
            el.set("style", this.isExclusive ? UI512BtnStyle.radio : UI512BtnStyle.checkbox);
            el.set("labelhalign", false);
            el.set("labelvalign", true);
            el.setDimensions(this.x, cury, this.logicalWidth, this.elemheight);
            let translated = lang.translate(item[1]);
            el.set("labeltext", translated);
            cury += this.elemheight + this.elemymargin;
        }
    }

    getWhichChecked(app: UI512Application) {
        let ret = [];
        let grp = app.getGroup(this.grpid);
        for (let item of this.items) {
            let el = grp.getEl(this.getElId(item[0]));
            let btn = cast(el, UI512ElButton);
            if (btn.get_b("checkmark")) {
                ret.push(item[0]);
            }
        }

        return ret;
    }

    setWhichChecked(app: UI512Application, idlist: string[]) {
        let grp = app.getGroup(this.grpid);
        for (let item of this.items) {
            let el = grp.getEl(this.getElId(item[0]));
            let shouldcheck = idlist.indexOf(item[0]) !== -1;
            el.set("checkmark", shouldcheck);
        }
    }

    listenMouseUp(app: UI512Application, d: MouseUpEventDetails) {
        if (!this.children.length) {
            return;
        }

        if (d.elClick && this.isExclusive) {
            let userId = this.fromFullId(d.elClick.id);
            if (userId) {
                this.setWhichChecked(app, [userId]);
            }
        } else if (d.elClick) {
            let userId = this.fromFullId(d.elClick.id);
            if (userId) {
                d.elClick.set("checkmark", !d.elClick.get_b("checkmark"));
            }
        }
    }
}

export class UI512CompToolbox extends UI512CompBase {
    protected whichChosen: O<string>;
    compositeType = "toolbox";
    iconsetid = "";
    items: [string, number][] = [["circle", 23 /*iconnumber*/], ["rectangle", 24 /*iconnumber*/]];
    hasclosebtn = true;
    headerh = 10;
    iconh = 20;
    callbackOnChange: O<(id: O<string>) => void>;
    protected totalheight = 0;

    widthOfIcon(iconid: string) {
        return Math.floor(this.logicalWidth / this.items.length);
    }

    createSpecific(app: UI512Application, lang: UI512Lang) {
        Util512.freezeRecurse(this.items);
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawWindowDecoration(app, new PalBorderDecorationConsts(), this.hasclosebtn);

        let curx = this.x;
        let cury = this.y + headerheight - 1;
        let marginx = -1;
        let marginy = -1;
        for (let item of this.items) {
            let el = this.genBtn(app, grp, "choice##" + item[0]);
            let thiswidth = this.widthOfIcon(item[0]);
            el.set("iconsetid", this.iconsetid);
            el.set("iconnumber", item[1]);
            el.setDimensions(curx, cury, thiswidth, this.iconh);

            curx += thiswidth + marginx;
            if (curx >= this.x + this.logicalWidth + marginx) {
                curx = this.x;
                cury += this.iconh + marginy;
            }
        }

        this.totalheight = cury + this.iconh;
        this.whichChosen = this.items[0][0];
        this.refreshHighlight(app);
    }

    getWhich() {
        return throwIfUndefined(this.whichChosen, "2u|this.whichChosen");
    }

    setWhich(app: UI512Application, subid: O<string>) {
        this.whichChosen = subid;
        this.refreshHighlight(app);
    }

    listenMouseUp(app: UI512Application, d: MouseUpEventDetails) {
        let grp = app.getGroup(this.grpid);
        if (!grp || !grp.getVisible()) {
            // optimization for a hidden toolbox
            return;
        }

        if (this.children.length && d.elClick) {
            let theId = d.elClick.id;
            let userId = this.fromFullId(theId);
            if (userId && userId.startsWith("choice##")) {
                userId = userId.substr("choice##".length);
                let found = this.items.filter(o => o[0] === userId);
                if (found.length) {
                    let wasChosenBefore = this.whichChosen;
                    this.whichChosen = found[0][0];
                    this.refreshHighlight(app);
                    if (this.callbackOnChange && wasChosenBefore !== this.whichChosen) {
                        this.callbackOnChange(this.whichChosen);
                    }
                } else {
                    assertTrueWarn(false, `2t|did not find ${userId} in ${this.idprefix}`);
                }
            }
        }
    }

    changeIcon(app: UI512Application, shortid: string, iconnumber: number) {
        let grp = app.getGroup(this.grpid);
        let el = grp.findEl(this.getElId(shortid));
        if (el) {
            el.set("iconnumber", iconnumber);
        }
    }

    protected refreshHighlight(app: UI512Application) {
        let grp = app.getGroup(this.grpid);
        let lookfor = this.whichChosen;
        for (let item of this.items) {
            let id = this.getElId("choice##" + item[0]);
            let el = grp.getEl(id);
            el.set("highlightactive", item[0] === lookfor);
            el.set("autohighlight", item[0] !== lookfor);
        }
    }
}

