
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { VpcRenderPaint } from "../vpcui/vpcmodelrenderpaint.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
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


export class VpcModelRender extends VpcAppInterfaceLayer implements ElementObserver {
    grp: UI512ElGroup;
    paint: VpcRenderPaint;
    directMapProperty: { [key: string]: string } = {};
    indirectProperty: { [key: string]: (elv: VpcElBase, el: UI512Element, newv: ElementObserverVal) => void } = {};
    propertiesCouldUnFocus: { [key: string]: boolean } = {};

    // changes go into a queue, for efficiency and also for "lock screen"
    queue: { [velIdAndPropName: string]: [VpcElBase, string, ElementObserverVal] } = {};
    ignoreQueueBecauseBuildingFromScratch = true;
    constructor() {
        super();
        // buttons
        this.directMapProperty[VpcElType.Btn + "/autohilite"] = "autohighlight";
        this.indirectProperty[VpcElType.Btn + "/enabled"] = (elv, el, newv) => {
            let isEdit = getToolCategory(this.appli.getOption_n("currentTool")) === VpcToolCtg.ctgEdit;
            el.set("enabledstyle", newv);
            el.set("enabled", isEdit ? true : newv);
        };
        this.directMapProperty[VpcElType.Btn + "/hilite"] = "highlightactive";
        this.directMapProperty[VpcElType.Btn + "/checkmark"] = "checkmark";
        this.indirectProperty[VpcElType.Btn + "/icon"] = (elv, el, newv) => {
            el.set("iconnumber", newv, ChangeContext.FromRenderModel);
            el.set("iconsetid", newv === 0 ? "" : "002", ChangeContext.FromRenderModel);
        };
        this.indirectProperty[VpcElType.Btn + "/showlabel"] = (elv, el, newv) => {
            this.refreshLabelWithFont(elv, el);
        };
        this.directMapProperty[VpcElType.Btn + "/style"] = "style";
        this.indirectProperty[VpcElType.Btn + "/label"] = (elv, el, newv) => {
            this.refreshLabelWithFont(elv, el);
        };
        this.indirectProperty[VpcElType.Btn + "/textfont"] = (elv, el, newv) => {
            this.refreshLabelWithFont(elv, el);
        };
        this.indirectProperty[VpcElType.Btn + "/textsize"] = (elv, el, newv) => {
            this.refreshLabelWithFont(elv, el);
        };
        this.indirectProperty[VpcElType.Btn + "/textstyle"] = (elv, el, newv) => {
            this.refreshLabelWithFont(elv, el);
        };
        this.indirectProperty[VpcElType.Btn + "/textalign"] = (elv, el, newv) => {
            el.set("labelhalign", newv !== "left", ChangeContext.FromRenderModel);
        };
        this.indirectProperty[VpcElType.Btn + "/visible"] = (elv, el, newv) => {
            let isEdit = getToolCategory(this.appli.getOption_n("currentTool")) === VpcToolCtg.ctgEdit;
            el.set("visible", isEdit ? true : newv);
        };

        // fields
        // changing defaulttextfont, defaulttextsize, defaulttextstyle does nothing on its own
        this.indirectProperty[VpcElType.Fld + "/dontwrap"] = (elv, el, newv) => {
            el.set("labelwrap", !newv, ChangeContext.FromRenderModel);
        };
        this.indirectProperty[VpcElType.Fld + "/singleline"] = (elv, el, newv) => {
            el.set("multiline", !newv, ChangeContext.FromRenderModel);
        };
        this.indirectProperty[VpcElType.Fld + "/enabled"] = (elv, el, newv) => {
            let isEdit = getToolCategory(this.appli.getOption_n("currentTool")) === VpcToolCtg.ctgEdit;
            el.set("enabledstyle", newv);
            el.set("enabled", isEdit ? true : newv);
        };
        this.indirectProperty[VpcElType.Fld + "/locktext"] = (elv, el, newv) => {
            el.set("canselecttext", !newv, ChangeContext.FromRenderModel);
            el.set("canedit", !newv, ChangeContext.FromRenderModel);
        };
        this.directMapProperty[VpcElType.Fld + "/selcaret"] = "selcaret";
        this.directMapProperty[VpcElType.Fld + "/selend"] = "selend";
        this.directMapProperty[VpcElType.Fld + "/scroll"] = "scrollamt";
        this.indirectProperty[VpcElType.Fld + "/style"] = (elv, el, newv) => {
            let wasScroll = el.get_b("scrollbar");
            if (newv === UI512FldStyleInclScrolling.scrolling) {
                el.set("style", UI512FldStyle.rectangle, ChangeContext.FromRenderModel);
                el.set("scrollbar", true, ChangeContext.FromRenderModel);
            } else {
                el.set("style", newv, ChangeContext.FromRenderModel);
                el.set("scrollbar", false, ChangeContext.FromRenderModel);
            }

            if (wasScroll !== el.get_b("scrollbar")) {
                this.appli.getController().rebuildFieldScrollbars();
            }
        };

        this.directMapProperty[VpcElType.Fld + "/scrollbar"] = "scrollbar";
        this.indirectProperty[VpcElType.Fld + "/visible"] = (elv, el, newv) => {
            let isEdit = getToolCategory(this.appli.getOption_n("currentTool")) === VpcToolCtg.ctgEdit;
            el.set("visible", isEdit ? true : newv);
        };
        this.indirectProperty[VpcElType.Fld + "/textalign"] = (elv, el, newv) => {
            el.set("labelhalign", newv !== "left", ChangeContext.FromRenderModel);
        };

        // location
        for (let type of [VpcElType.Btn, VpcElType.Fld]) {
            this.indirectProperty[type + "/x"] = (elv, el, newv) => {
                el.set("x", this.appli.userBounds()[0] + (newv as number), ChangeContext.FromRenderModel);
            };
            this.indirectProperty[type + "/y"] = (elv, el, newv) => {
                el.set("y", this.appli.userBounds()[1] + (newv as number), ChangeContext.FromRenderModel);
            };
            this.indirectProperty[type + "/w"] = (elv, el, newv) => {
                el.set("w", newv, ChangeContext.FromRenderModel);
            };
            this.indirectProperty[type + "/h"] = (elv, el, newv) => {
                el.set("h", newv, ChangeContext.FromRenderModel);
            };
        }

        // invalidating focus
        this.propertiesCouldUnFocus[VpcElType.Fld + "/enabled"] = true;
        this.propertiesCouldUnFocus[VpcElType.Fld + "/locktext"] = true;
        this.propertiesCouldUnFocus[VpcElType.Fld + "/visible"] = true;
    }

    init() {
        this.paint = new VpcRenderPaint(this.appli);
        this.paint.init();
        this.grp = new UI512ElGroup("VpcModelRender");
        this.appli.getUi512App().addGroup(this.grp);
    }

    protected grpReset() {
        this.grp.removeAllEls();
    }

    refresh() {
        if (!this.appli.getOption_b("screenLocked")) {
            this.applyQueue();
        }
    }

    changeSeen(context: ChangeContext, elid: string, propname: string, prev: ElementObserverVal, newv: ElementObserverVal) {
        let currentCardId = this.appli.getModel().productOpts.get_s("currentCardId");
        this.singleChangeSeen(currentCardId, elid, propname, newv);
    }

    nonTrivialChangeSeen() {
        this.nonTrivialChangeSeenImpl();
    }

    isQueueEmpty() {
        return !this.ignoreQueueBecauseBuildingFromScratch && Util512.isMapEmpty(this.queue);
    }

    protected singleChangeSeen(currentCardId: string, velId: string, propname: string, newv: ElementObserverVal) {
        if (velId === this.appli.getModel().productOpts.id && propname === "currentCardId") {
            this.nonTrivialChangeSeenImpl();
            return;
        }

        let vpel = this.appli.getModel().findByIdUntyped(velId);
        if (vpel) {
            let type = vpel.getType();
            if (type === VpcElType.Fld || type === VpcElType.Btn) {
                if (vpel.parentId === currentCardId) {
                    let key = velId + "/" + propname;
                    this.queue[key] = [vpel, propname, newv];
                }
            } else if (type === VpcElType.Card && velId === currentCardId) {
                let key = velId + "/" + propname;
                this.queue[key] = [vpel, propname, newv];
            }
        }
    }

    protected refreshLabelWithFont(elv: VpcElBase, target: UI512Element) {
        if (elv instanceof VpcElButton) {
            let lbl = elv.get_b("showlabel") ? TextRendererFontManager.setInitialFont(elv.get_s("label"), elv.getFontAsUi512()) : "";
            target.set("labeltext", lbl, ChangeContext.FromRenderModel);
        } else {
            throw makeVpcInternalErr(`6+|expected button`);
        }
    }

    protected buildAllFromScratch() {
        let currentCardId = this.appli.getModel().productOpts.get_s("currentCardId");
        let currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
        let currentBgid = currentCard.parentId;

        this.grpReset();
        this.paint.onNonTrivialChangeSeen();
        this.paint.doPaintUpdate();
        for (let part of currentCard.parts) {
            let partAsBtn = part as VpcElButton;
            let partAsField = part as VpcElField;
            if (partAsBtn && partAsBtn.isVpcElButton) {
                this.buildBtnFromScratch(partAsBtn);
            } else if (partAsField && partAsField.isVpcElField) {
                this.buildFldFromScratch(partAsField);
            } else {
                throw makeVpcInternalErr("6*|invalid part type");
            }
        }

        this.seeIfCurrentFocusMakesSense();

        for (let part of currentCard.parts) {
            // make sure to edit something!!
            let target = this.findVpcToUi512(currentCard.parts[0].id);
            if (target) {
                target.set("x", target.get_n("x") + 1);
                target.set("x", target.get_n("x") - 1);
            }
        }
    }

    isVelOrBackground(id: string) {
        return id.startsWith("VpcModelRender$$") && !scontains(id, "##sb##");
    }

    elIdToVelId(id: string): O<string> {
        if (scontains(id, "##sb##")) {
            return undefined;
        } else if (id === "VpcModelRender$$renderbg") {
            return undefined;
        } else if (id.startsWith("VpcModelRender$$")) {
            return id.substr("VpcModelRender$$".length);
        } else {
            return undefined;
        }
    }

    velIdToElId(id: string): string {
        return "VpcModelRender$$" + id;
    }

    elIdToVel(id: string): O<VpcElBase> {
        let card = this.appli.getModel().getCurrentCard();
        let vel = this.appli.getModel().findByIdUntyped(this.elIdToVelId(id));
        if (vel && vel.parentId === card.id) {
            return vel;
        } else {
            return undefined;
        }
    }

    velIdToEl(id: string) {
        return this.appli.getUi512App().findElemById(this.velIdToElId(id));
    }

    protected buildBtnFromScratch(vpcel: VpcElButton) {
        let target = new UI512ElButton(this.velIdToElId(vpcel.id));
        this.grp.addElement(this.appli.getUi512App(), target);
        for (let prop of VpcElButton.attributesList) {
            let newv = vpcel.get_generic(prop);
            this.applyOneFromQueue(vpcel, prop, newv, true);
        }
    }

    protected buildFldFromScratch(vpcel: VpcElField) {
        let target = new UI512ElTextField(this.velIdToElId(vpcel.id));
        this.grp.addElement(this.appli.getUi512App(), target);
        for (let prop of VpcElField.attributesList) {
            let newv = vpcel.get_generic(prop);
            this.applyOneFromQueue(vpcel, prop, newv, true);
        }

        target.setftxt(vpcel.get_ftxt(), ChangeContext.FromRenderModel);
    }

    protected applyOneFromQueue(vel: VpcElBase, propname: string, newv: ElementObserverVal, fromScratch: boolean) {
        if (vel.getType() === VpcElType.Card) {
            //improve this
            if (propname === "signalPaintUpdateWanted") {
                //this.paint.doPaintUpdate()
            }
        } else {
            let key = vel.getType().toString() + "/" + propname;
            let fnSetProperty = this.indirectProperty[key];
            let ui512propname = this.directMapProperty[key];
            let target = this.findVpcToUi512(vel.id);
            if (target) {
                if (fnSetProperty !== undefined) {
                    fnSetProperty(vel, target, newv);
                } else if (ui512propname !== undefined) {
                    target.set(ui512propname, newv, ChangeContext.FromRenderModel);
                } else if (propname === UI512Settable.formattedTextField) {
                    let newvAsText = newv as FormattedText;
                    assertTrue(newvAsText && newvAsText.isFormattedText, "6)|bad formatted text", vel.id);
                    target.setftxt(newvAsText, ChangeContext.FromRenderModel);
                } else {
                    // it's a property that doesn't impact rendering. that's ok.
                }
            } else {
                assertTrueWarn(false, `6(|did not find rendered corresponing ${vel.id}`);
            }

            if (!fromScratch && this.propertiesCouldUnFocus[key]) {
                this.seeIfCurrentFocusMakesSense();
            }
        }
    }

    applyQueue() {
        if (this.ignoreQueueBecauseBuildingFromScratch) {
            this.buildAllFromScratch();
        } else {
            for (let key in this.queue) {
                if (this.queue.hasOwnProperty(key)) {
                    let v = this.queue[key];
                    this.applyOneFromQueue(v[0], v[1], v[2], false);
                }
            }
        }

        this.ignoreQueueBecauseBuildingFromScratch = false;
        this.queue = {};
    }

    protected nonTrivialChangeSeenImpl() {
        this.ignoreQueueBecauseBuildingFromScratch = true;
        this.queue = {};
    }

    findVpcToUi512(id: string) {
        return this.grp.findEl("VpcModelRender$$" + id);
    }

    getVpcToUi512(id: string) {
        return this.grp.getEl("VpcModelRender$$" + id);
    }

    findUi512ToVpc(id: O<string>) {
        if (id && id.startsWith("VpcModelRender$$")) {
            let vpcid = id.substr("VpcModelRender$$".length);
            return this.appli.getModel().findByIdUntyped(vpcid);
        } else {
            return undefined;
        }
    }

    static fieldPropsCompatibleWithFocus(vel: VpcElField) {
        return vel.get_b("enabled") && !vel.get_b("locktext") && vel.get_b("visible");
    }

    seeIfCurrentFocusMakesSense() {
        let focusid = this.appli.getCurrentFocus();
        if (!focusid || !focusid.startsWith("VpcModelRender$$")) {
            // if it's another ui element like a box in edit panel having focus, ok
            return;
        }

        let focusvpc = this.findUi512ToVpc(focusid);
        let focusvpcAsFld = focusvpc as VpcElField;
        if (!focusvpc || !focusvpcAsFld.isVpcElField) {
            // missing or non-field focus
            this.appli.setCurrentFocus(undefined);
        } else if (!VpcModelRender.fieldPropsCompatibleWithFocus(focusvpcAsFld)) {
            // field not enabled/visible
            this.appli.setCurrentFocus(undefined);
        } else {
            let parent = this.appli.getModel().getById(focusvpc.parentId, VpcElCard);
            let currentCardId = this.appli.getModel().productOpts.get_s("currentCardId");
            if (parent.getType() === VpcElType.Card && parent.id !== currentCardId) {
                // field not on the current card
                this.appli.setCurrentFocus(undefined);
            } else if (parent.getType() === VpcElType.Bg) {
                let currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
                if (parent.id !== currentCard.parentId) {
                    // field not on the current bg
                    this.appli.setCurrentFocus(undefined);
                }
            }
        }
    }
}

export class VpcElTextFieldAsGeneric implements IGenericTextField {
    constructor(protected el512: UI512ElTextField, protected impl: VpcElField) {}
    setftxt(newtxt: FormattedText, context: ChangeContext) {
        this.impl.setftxt(newtxt, context);
    }
    getftxt(): FormattedText {
        return this.impl.get_ftxt();
    }
    canEdit() {
        return !this.impl.get_b("locktext");
    }
    canSelectText(): boolean {
        return !this.impl.get_b("locktext");
    }
    isMultiline(): boolean {
        return !this.impl.get_b("singleline");
    }
    setSel(a: number, b: number): void {
        this.impl.set("selcaret", a);
        this.impl.set("selend", b);
    }
    getSel(): [number, number] {
        return [this.impl.get_n("selcaret"), this.impl.get_n("selend")];
    }
    identifier(): string {
        return this.impl.id;
    }
    getHeight(): number {
        return this.impl.get_n("h");
    }
    getDefaultFont(): string {
        return this.impl.getDefaultFontAsUi512();
    }
    getReadonlyUi512(): UI512ElTextField {
        return this.el512;
    }
    getScrollAmt(): number {
        return this.impl.get_n("scroll");
    }
    setScrollAmt(n: O<number>): void {
        if (n !== undefined && n !== null) {
            return this.impl.set("scroll", n);
        }
    }
}
