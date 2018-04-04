
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { VpcModelRender, VpcElTextFieldAsGeneric } from "../vpcui/vpcmodelrender.js";
import { UndoableAction, UndoManager, VpcSerialization, VpcRuntimeOpts, VpcStateInterface, VpcApplication } from "../vpcui/vpcstate.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { VpcAppPropPanel } from "../vpcui/vpcapppanels.js";
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

export abstract class VpcAppUIToolResponseBase {
    isVpcAppUIToolResponseBase = true;
    appli: IVpcStateInterface;
    cbModelRender: () => VpcModelRender;
    cbScheduleScriptEventSend: (d: EventDetails, targetVelId: string) => void;
    constructor(protected bounds: number[], protected userBounds: number[], protected lang: UI512Lang) {}

    abstract respondMouseDown(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseDownEventDetails, isDocumentEl: boolean): void;
    abstract cancelCurrentDrag(): void;
    abstract whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors;
    respondMouseMove(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseMoveEventDetails, isDocumentEl: boolean): void {}
    respondMouseUp(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseUpEventDetails, isDocumentEl: boolean): void {}
    onOpenTool(root: Root) {}
    onLeaveTool(root: Root) {}
    onDeleteSelection(appl: VpcApplication) {}
}

export class VpcAppUIToolNyi extends VpcAppUIToolResponseBase {
    respondMouseDown(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseDownEventDetails, isDocumentEl: boolean): void {}

    respondMouseMove(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseMoveEventDetails, isDocumentEl: boolean): void {}

    respondMouseUp(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseUpEventDetails, isDocumentEl: boolean): void {}

    cancelCurrentDrag(): void {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.arrow;
    }
}

export abstract class VpcUIToolPainting extends VpcAppUIToolResponseBase {
    getCanvasLayer(n: number) {
        let painter = this.cbModelRender().paint;
    }
    clearCanvas(c: CanvasWrapper) {
        c.clear();
    }
    commitCanvasLayer() {}
}

export class VpcAppUIToolCurve extends VpcAppUIToolResponseBase {
    respondMouseDown(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseDownEventDetails, isDocumentEl: boolean): void {}

    respondMouseMove(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseMoveEventDetails, isDocumentEl: boolean): void {}

    respondMouseUp(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseUpEventDetails, isDocumentEl: boolean): void {}

    cancelCurrentDrag(): void {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.arrow;
    }
}

export class VpcAppUIToolRectSelect extends VpcAppUIToolResponseBase {
    respondMouseDown(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseDownEventDetails, isDocumentEl: boolean): void {}

    respondMouseMove(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseMoveEventDetails, isDocumentEl: boolean): void {}

    respondMouseUp(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseUpEventDetails, isDocumentEl: boolean): void {}

    cancelCurrentDrag(): void {}

    whichCursor(tl: VpcTool, el: O<UI512Element>) {
        //if (this.stage === RectSelectStage.DoneWithChooseSelection && el && el.id.startsWith("VpcAppUIToolRect")) {
        //    return UI512Cursors.arrow
        //}

        return UI512Cursors.crosshair;
    }

    blinkSelection() {
        if (this.appli.getTool() != VpcTool.select) {
            return;
        }
    }
}

export class VpcAppUIToolBucket extends VpcAppUIToolResponseBase {
    respondMouseDown(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseDownEventDetails, isDocumentEl: boolean): void {
        if (isDocumentEl) {
            let pattern = this.appli.getOption_s("currentPattern");
            if (pattern.startsWith("pattern")) {
                let npattern = parseInt(pattern.substr("pattern".length), 10);
                if (isFinite(npattern)) {
                    //this.cbModelRender().paint.commitBucketToolClick(d.mouseX, d.mouseY, npattern)
                }
            }
        }
    }

    cancelCurrentDrag(): void {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.crosshair;
    }
}

export class VpcAppUIToolSmear extends VpcAppUIToolResponseBase {
    respondMouseDown(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseDownEventDetails, isDocumentEl: boolean): void {}

    respondMouseMove(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseMoveEventDetails, isDocumentEl: boolean): void {}

    respondMouseUp(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseUpEventDetails, isDocumentEl: boolean): void {}

    cancelCurrentDrag(): void {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.crosshair;
    }
}

export class VpcAppUIToolShape extends VpcAppUIToolResponseBase {
    respondMouseDown(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseDownEventDetails, isDocumentEl: boolean): void {}

    respondMouseMove(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseMoveEventDetails, isDocumentEl: boolean): void {}

    respondMouseUp(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseUpEventDetails, isDocumentEl: boolean): void {}

    cancelCurrentDrag(): void {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.crosshair;
    }
}

class EditToolDragStatus {
    constructor(
        public whichHandle: number,
        public vel: VpcElBase,
        public el: UI512Element,
        public distanceFromHandleCenterX: number,
        public distanceFromHandleCenterY: number,
        public distanceFromFirstHandleCenterX: number,
        public distanceFromFirstHandleCenterY: number
    ) {}
}

export class VpcAppUIToolEdit extends VpcAppUIToolResponseBase {
    dragStatus: O<EditToolDragStatus>;
    propPanel: VpcAppPropPanel;

    respondMouseDown(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseDownEventDetails, isDocumentEl: boolean): void {
        if (d.el && d.el.id === "VpcModelRender$$renderbg") {
            // click on the screen but on no item: deselect all
            this.appli.setOption("selectedVelId", "");
        } else if (d.el && d.el.id.startsWith("VpcModelRender$$")) {
            // click on an item to select it
            let velid = this.cbModelRender().elIdToVelId(d.el.id) || "";
            if (velid.length && d.el.typeName === "UI512ElTextField") {
                this.appli.setTool(VpcTool.field);
                this.appli.setOption("selectedVelId", velid);
            } else if (velid.length && d.el.typeName === "UI512ElementButtonGeneral") {
                this.appli.setTool(VpcTool.button);
                this.appli.setOption("selectedVelId", velid);
            } else {
                this.appli.setOption("selectedVelId", "");
            }
        } else {
            // drag a handle to resize a vel
            let handle = this.propPanel.handles.whichHandle(d.el ? d.el.id : "");
            if (handle !== undefined && !this.dragStatus) {
                let vel = this.propPanel.getAndValidateSelectedVel("selectedVelId");
                if (vel && (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld)) {
                    let targetEl = this.appli.getUi512App().findElemById("VpcModelRender$$" + vel.id);
                    if (targetEl) {
                        // distance from initial click to center of handle
                        let distanceFromHandleCenterX =
                            d.mouseX - this.propPanel.handles.sizeHandles[handle].get_n("x") - this.propPanel.handles.sizeHandles[0].w / 2;
                        let distanceFromHandleCenterY =
                            d.mouseY - this.propPanel.handles.sizeHandles[handle].get_n("y") - this.propPanel.handles.sizeHandles[0].h / 2;
                        let distanceFromFirstHandleCenterX =
                            d.mouseX - this.propPanel.handles.sizeHandles[0].get_n("x") - this.propPanel.handles.sizeHandles[0].w / 2;
                        let distanceFromFirstHandleCenterY =
                            d.mouseY - this.propPanel.handles.sizeHandles[0].get_n("y") - this.propPanel.handles.sizeHandles[0].h / 2;
                        this.dragStatus = new EditToolDragStatus(
                            handle,
                            vel,
                            targetEl,
                            distanceFromHandleCenterX,
                            distanceFromHandleCenterY,
                            distanceFromFirstHandleCenterX,
                            distanceFromFirstHandleCenterY
                        );
                    }
                }
            }
        }
    }

    respondMouseMove(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseMoveEventDetails, isDocumentEl: boolean): void {
        if (this.dragStatus) {
            if (this.dragStatus.whichHandle === 3) {
                // for the bottom right handle, set the size+width.
                let centerX = d.mouseX - this.dragStatus.distanceFromHandleCenterX;
                let centerY = d.mouseY - this.dragStatus.distanceFromHandleCenterY;
                this.dragStatus.el.setDimensions(
                    this.dragStatus.el.x,
                    this.dragStatus.el.y,
                    Math.max(5, centerX - this.dragStatus.el.x),
                    Math.max(5, centerY - this.dragStatus.el.y)
                );
            } else {
                // for the other handles, set the location
                let newx = d.mouseX - this.dragStatus.distanceFromFirstHandleCenterX;
                let newy = d.mouseY - this.dragStatus.distanceFromFirstHandleCenterY;
                this.dragStatus.el.setDimensions(newx, newy, this.dragStatus.el.w, this.dragStatus.el.h);
            }

            this.propPanel.handles.refresh();
        }
    }

    respondMouseUp(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseUpEventDetails, isDocumentEl: boolean): void {
        this.propPanel.respondMouseUp(root, d);
        if (this.dragStatus) {
            // cancel the resize if we're on a different card now or if selected vel was changed
            let validatedVel = this.propPanel.getAndValidateSelectedVel("selectedVelId");
            if (
                validatedVel &&
                validatedVel.id === this.dragStatus.vel.id &&
                (validatedVel.getType() === VpcElType.Btn || validatedVel.getType() === VpcElType.Fld)
            ) {
                let targetVel = this.dragStatus.vel;
                targetVel.set("x", this.dragStatus.el.x - this.appli.userBounds()[0]);
                targetVel.set("y", this.dragStatus.el.y - this.appli.userBounds()[1]);
                targetVel.set("w", this.dragStatus.el.w);
                targetVel.set("h", this.dragStatus.el.h);
            }

            this.dragStatus = undefined;
        }
    }

    cancelCurrentDrag() {
        this.dragStatus = undefined;
    }

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.arrow;
    }

    onOpenTool(root: Root) {
        this.cancelCurrentDrag();
    }

    onLeaveTool(root: Root) {
        this.cancelCurrentDrag();
        this.propPanel.editor.saveChangesToModel(root, this.appli.getUi512App());
        if (this.propPanel.active) {
            this.propPanel.active.saveChangesToModel(root, this.appli.getUi512App());
        }
    }

    onDeleteSelection(appl: VpcApplication) {
        let seled = this.propPanel.getEditToolSelectedFldOrBtn();
        if (seled) {
            this.appli.setOption("selectedVelId", "");
            appl.removeElem(seled);
        }
    }
}

export class VpcAppUIToolBrowse extends VpcAppUIToolResponseBase {
    scheduleScriptMsg(appl: VpcApplication, d: EventDetails, mouseX = -1, mouseY = -1) {
        if (appl.appli.getTool() != VpcTool.browse) {
            return;
        }

        let target: O<string>;
        let msgname = getMsgNameFromType(d.type());
        if (d instanceof MouseUpEventDetails) {
            if (d.elClick) {
                target = d.elClick.id;
            }
        } else if (d instanceof MouseEventDetails) {
            let affected = d.getAffectedElements();
            if (affected.length) {
                target = affected[affected.length - 1].id;
            }
        } else if (d instanceof KeyEventDetails) {
            let focus = this.appli.getCurrentFocus();
            if (focus && focus.startsWith("VpcModelRender$$")) {
                target = focus;
            } else {
                target = "VpcModelRender$$renderbg";
            }
        } else if (d instanceof IdleEventDetails) {
            let el = this.appli.getUi512App().coordsToElement(mouseX, mouseY);
            if (el) {
                target = el.id;
            }
        }

        if (target) {
            let velId = this.cbModelRender().elIdToVelId(target) || this.appli.getOption_s("currentCardId");
            this.cbScheduleScriptEventSend(d, velId);
        }
    }

    respondMouseDown(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseDownEventDetails, isDocumentEl: boolean): void {
        if (isDocumentEl) {
            this.scheduleScriptMsg(appl, d);
        }
    }

    respondMouseUp(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseUpEventDetails, isDocumentEl: boolean): void {
        if (isDocumentEl) {
            this.scheduleScriptMsg(appl, d);
        }
    }

    respondMouseMove(root: Root, tl: VpcTool, appl: VpcApplication, d: MouseMoveEventDetails, isDocumentEl: boolean): void {}

    cancelCurrentDrag() {}

    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        if (el && el.typeName === "UI512ElTextField" && el.get_b("canselecttext")) {
            return UI512Cursors.arrow;
        } else {
            return UI512Cursors.hand;
        }
    }
}


