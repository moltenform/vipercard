
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { UndoableAction, UndoManager, VpcSerialization, VpcRuntimeOpts, VpcStateInterface, VpcApplication } from "../vpcui/vpcstate.js";
import { clrBlack, clrWhite, clrTransp, makePainterCvDataDraw, makePainterCvDataWithPatternSupport, simplifyPattern, needsPatternSupport, makePainterCvCanvas, UI512Painter, DissolveImages, UI512ImageSerialization } from "../ui512/ui512paint.js";
import { MouseDragStatus, UI512Controller } from "../ui512/ui512controller.js";
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

export class MenuActionImpl {
    appli: IVpcStateInterface;
    cbAnswerMsg: (prompt: string) => void;
    cbExit: (s: string) => void;
    cbSaveImpl: (isSaveAs: boolean) => void;
    cbGetEditToolSelectedFldOrBtn: () => O<VpcElBase>;

    // OS menu
    go_mnuOSAbout(appl: VpcApplication) {
        this.cbAnswerMsg(`ViperCard, by Ben Fisher\nPlease support the project on Patreon.`);
    }

    // File menu
    go_mnuSaveStack(appl: VpcApplication) {
        this.cbSaveImpl(false);
    }

    go_mnuSaveStackCopy(appl: VpcApplication) {
        this.cbSaveImpl(true);
    }

    go_mnuNewStack(appl: VpcApplication) {
        this.cbExit("mnuNewStack");
    }

    go_mnuQuit(appl: VpcApplication) {
        this.cbExit("mnuQuit");
    }

    // Edit menu
    go_mnuUndo(appl: VpcApplication) {
        let done = appl.undoManager.performUndo(appl);
        if (!done) {
            this.cbAnswerMsg(this.appli.lang().translate("lngNothing to undo."));
        } else {
            this.refreshAfterUndoRedo(appl);
        }
    }

    go_mnuRedo(appl: VpcApplication) {
        let done = appl.undoManager.performRedo(appl);
        if (!done) {
            this.cbAnswerMsg(this.appli.lang().translate("lngNothing to redo."));
        } else {
            this.refreshAfterUndoRedo(appl);
        }
    }

    protected refreshAfterUndoRedo(appl: VpcApplication) {
        // check that the current card still exists, otherwise go to first card
        let currentCardId = appl.model.productOpts.get_s("currentCardId");
        let currentCard = appl.model.findById(currentCardId, VpcElCard);
        if (!currentCard) {
            appl.doWithoutAbilityToUndo(() => appl.model.goCardRelative(OrdinalOrPosition.first));
        }
    }

    go_mnuUseHostClipboard(appl: VpcApplication) {
        this.appli.setOption("optUseHostClipboard", !this.appli.getOption_b("optUseHostClipboard"));
        this.appli.getController().useOSClipboard = this.appli.getOption_b("optUseHostClipboard");
    }

    go_mnuNewCard(appl: VpcApplication) {
        let currentCardId = appl.model.productOpts.get_s("currentCardId");
        let currentCard = appl.model.getById(currentCardId, VpcElCard);
        let currentBg = appl.model.getById(currentCard.parentId, VpcElBg);
        let currentIndex = VpcElBase.findIndexById(currentBg.cards, currentCardId);
        let created = appl.runtime.outside.CreateCard(currentIndex === undefined ? 0 : currentIndex + 1);
        appl.model.productOpts.set("currentCardId", created.id);
    }

    go_mnuCopyCardOrVel(appl: VpcApplication) {
        let selected = this.cbGetEditToolSelectedFldOrBtn();
        if (selected) {
            this.appli.setOption("copiedVelId", selected.id);
        } else {
            this.cbAnswerMsg("Copying this type of element is not yet supported.");
        }
    }

    go_mnuDelCard(appl: VpcApplication) {
        let wasCurrentCardId = appl.model.productOpts.get_s("currentCardId");
        let wasCurrentCard = appl.model.getById(wasCurrentCardId, VpcElCard);
        appl.model.goCardRelative(OrdinalOrPosition.previous);
        if (appl.model.productOpts.get_s("currentCardId") === wasCurrentCardId) {
            appl.model.goCardRelative(OrdinalOrPosition.next);
        }

        appl.runtime.outside.RemoveCard(wasCurrentCard);
    }

    getActiveChunkSel(appl: VpcApplication): O<[VpcElBase, number, number]> {
        let vel = this.appli.getCurrentFocusVelField();
        if (vel) {
            // note: get from focused, not vel, since it's more up to date?
            // no, since we're acting on the vel, get everything from one for consistency
            let selcaret = fitIntoInclusive(vel.get_n("selcaret"), 0, vel.get_ftxt().len());
            let selend = fitIntoInclusive(vel.get_n("selend"), 0, vel.get_ftxt().len());
            if (selcaret !== selend) {
                return [vel, Math.min(selcaret, selend), Math.max(selcaret, selend)];
            }
        }

        return undefined;
    }

    go_mnuPaintWideLines(appl: VpcApplication) {
        this.appli.setOption("optWideLines", !this.appli.getOption_b("optWideLines"));
    }

    go_mnuPaintBlackLines(appl: VpcApplication) {
        this.appli.setOption("optPaintLineColor", clrBlack);
    }

    go_mnuPaintWhiteLines(appl: VpcApplication) {
        this.appli.setOption("optPaintLineColor", clrWhite);
    }

    go_mnuPaintBlackFill(appl: VpcApplication) {
        this.appli.setOption("optPaintFillColor", clrBlack);
    }

    go_mnuPaintWhiteFill(appl: VpcApplication) {
        this.appli.setOption("optPaintFillColor", clrWhite);
    }

    go_mnuPaintNoFill(appl: VpcApplication) {
        this.appli.setOption("optPaintFillColor", -1);
    }

    go_mnuGoCardFirst(appl: VpcApplication) {
        this.appli.setCurrentCardNum(OrdinalOrPosition.first);
    }

    go_mnuGoCardPrev(appl: VpcApplication) {
        this.appli.setCurrentCardNum(OrdinalOrPosition.previous);
    }

    go_mnuGoCardNext(appl: VpcApplication) {
        this.appli.setCurrentCardNum(OrdinalOrPosition.next);
    }

    go_mnuGoCardLast(appl: VpcApplication) {
        this.appli.setCurrentCardNum(OrdinalOrPosition.last);
    }

    go_mnuCardInfo(appl: VpcApplication) {
        let currentCardId = this.appli.getOption_s("currentCardId");
        this.appli.setTool(VpcTool.button);
        this.appli.setOption("selectedVelId", currentCardId);
        this.appli.setOption("viewingScript", false);
    }

    go_mnuStackInfo(appl: VpcApplication) {
        let currentstackid = this.appli.getModel().stack.id;
        this.appli.setTool(VpcTool.button);
        this.appli.setOption("selectedVelId", currentstackid);
        this.appli.setOption("viewingScript", false);
    }

    runFontMenuActionsIfApplicable(s: string, appl: VpcApplication) {
        if (s.startsWith("mnuItemTool")) {
            let toolNumber = parseInt(s.substr("mnuItemTool".length), 10);
            toolNumber = isFinite(toolNumber) ? toolNumber : VpcTool.browse;
            this.appli.setTool(toolNumber);
            return true;
        } else if (s.startsWith("mnuItemSetFontFace")) {
            let v = s.substr("mnuItemSetFontFace".length);
            this.setFont(appl, v, /*btn*/ "textfont", /*fld*/ "textfont", /*sel*/ "textfont");
            return true;
        } else if (s.startsWith("mnuItemSetFontSize")) {
            let v = s.substr("mnuItemSetFontSize".length);
            this.setFont(appl, v, /*btn*/ "textsize", /*fld*/ "textsize", /*sel*/ "textsize");
            return true;
        } else if (s.startsWith("mnuSetFontStyle")) {
            let v = s.substr("mnuSetFontStyle".length);
            this.setFont(appl, v, /*btn*/ "textstyle", /*fld*/ "textstyle", /*sel*/ "textstyle");
            return true;
        } else if (s.startsWith("mnuSetAlign")) {
            let v = s.substr("mnuSetAlign".length);
            this.setAlign(appl, v);
            return true;
        } else {
            return false;
        }
    }

    setAlign(appl: VpcApplication, v: string) {
        let worked = this.setAlignImpl(appl, v);
        if (!worked) {
            this.cbAnswerMsg(this.appli.lang().translate("lngNo selection found. Select a button or field."));
        }
    }

    setAlignImpl(appl: VpcApplication, v: string) {
        v = v.toLowerCase();
        let seled = this.cbGetEditToolSelectedFldOrBtn();
        if (seled) {
            seled.setProp("textalign", VpcValS(v));
            return true;
        } else {
            let chunksel = this.getActiveChunkSel(appl);
            if (chunksel) {
                // we don't yet support setting alignment on a per-paragraph basis
                chunksel[0].setProp("textalign", VpcValS(v));
                return true;
            }
        }
    }

    setFont(appl: VpcApplication, v: string, forBtn: string, forFld: string, forSel: string) {
        let worked = this.setFontImpl(appl, v, forBtn, forFld, forSel);
        if (!worked) {
            this.cbAnswerMsg(
                this.appli
                    .lang()
                    .translate("lngNo selection found. Either select a button or field, or use the browse tool to select a few letters.")
            );
        }
    }

    protected toggleStyle(allstyle: string, v: string) {
        if (v === "plain") {
            // user is setting font to plain, so lose the other formatting
            return "plain";
        }

        checkThrow(allstyle !== "mixed", 'did not expected to see "mixed".');
        let parts = allstyle.split(",");
        parts = parts.filter(s => s !== "plain");
        let foundIndex = parts.findIndex(s => s === v);
        if (foundIndex === -1) {
            parts.push(v);
        } else {
            parts.splice(foundIndex, 1);
        }

        return parts.length ? parts.join(",") : "plain";
    }

    setFontImpl(appl: VpcApplication, v: string, forBtn: string, forFld: string, forSel: string) {
        v = v.toLowerCase();
        let seled = this.cbGetEditToolSelectedFldOrBtn();
        if (seled) {
            let which = seled.getType() === VpcElType.Btn ? forBtn : forFld;
            if (forSel !== "textstyle") {
                seled.setProp(which, VpcValS(v));
                return true;
            } else {
                let curstyle = seled
                    .getProp("textstyle")
                    .readAsString()
                    .toLowerCase();
                curstyle = this.toggleStyle(curstyle, v);
                seled.setProp("textstyle", VpcValS(curstyle));
                return true;
            }
        } else {
            let chunksel = this.getActiveChunkSel(appl);
            if (chunksel) {
                let [vel, b1, b2] = chunksel;
                let chunk = new RequestedChunk(b1);
                chunk.last = b2;
                // adjust the range because vpc is both 1-based and inclusive
                chunk.first += 1;

                chunk.type = RequestedChunkType.Chars;
                let velref = new RequestedVelRef(VpcElType.Fld);
                let idn = parseInt(vel.id, 10);
                checkThrow(isFinite(idn), "non numeric id?", vel.id);
                velref.lookById = idn;
                if (forSel !== "textstyle") {
                    appl.runtime.outside.SetProp(velref, forSel, VpcValS(v), chunk);
                    return true;
                } else {
                    // do this character by character, because styles can differ
                    // 1) if one of the letters was bold, setting the selection to italic shouldn't lose the bold of that one
                    // 2) besides, if we looked up current style of all the selection, it might return 'mixed' and we wouldn't know how to flip
                    assertTrueWarn(chunk.first <= chunk.last, "", chunk.first, chunk.last);
                    for (let i = chunk.first; i <= chunk.last; i++) {
                        let subchunk = new RequestedChunk(i);
                        subchunk.first = i;
                        subchunk.last = i;
                        subchunk.type = RequestedChunkType.Chars;
                        let curstyle = appl.runtime.outside.GetProp(velref, forSel, PropAdjective.empty, subchunk).readAsString();
                        curstyle = this.toggleStyle(curstyle, v);
                        appl.runtime.outside.SetProp(velref, forSel, VpcValS(curstyle), subchunk);
                    }

                    return true;
                }
            }
        }
    }
}
