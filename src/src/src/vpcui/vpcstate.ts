
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { CodeExecTop, CodeExecFrameStack, CodeExecFrame, VpcParsingCache } from "../vpcscript/vpcscriptexec.js";
import { UI512ViewDraw, PaintOntoCanvasShapes, PaintOntoCanvas } from "../ui512/ui512elementsdefaultview.js";
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

import { vpcversion } from "../appsettings.js";

export interface UndoableAction {
    do(appl: VpcApplication): void;
    undo(appl: VpcApplication): void;
}

abstract class UndoableActionCreateOrDelVelement {
    isUndoableActionCreateOrDelVel = true;
    constructor(public velId: string, public parentid: string, public type: VpcElType, public insertindex: number) {}

    protected static getconstructor(type: VpcElType): { new (...args: any[]): any } {
        if (type === VpcElType.Btn) {
            return VpcElButton;
        } else if (type === VpcElType.Fld) {
            return VpcElField;
        } else if (type === VpcElType.Card) {
            return VpcElCard;
        } else if (type === VpcElType.Bg) {
            return VpcElBg;
        } else {
            throw makeVpcInternalErr(`6f|incorrect type/parent. type is a ${type}`);
        }
    }

    static getparentarray(parentId: string, appl: VpcApplication, type: VpcElType): VpcElBase[] {
        let parent = appl.model.getByIdUntyped(parentId);
        let parentasCard = parent as VpcElCard;
        let parentasBg = parent as VpcElBg;
        let parentasStack = parent as VpcElStack;

        if ((type === VpcElType.Btn || type === VpcElType.Fld) && parentasCard.isVpcElCard) {
            return parentasCard.parts;
        } else if ((type === VpcElType.Btn || type === VpcElType.Fld) && parentasBg.isVpcElBg) {
            return parentasBg.parts;
        } else if (type === VpcElType.Card && parentasBg.isVpcElBg) {
            return parentasBg.cards;
        } else if (type === VpcElType.Bg && parentasStack.isVpcElStack) {
            return parentasStack.bgs;
        } else {
            throw makeVpcInternalErr(`6e|incorrect type/parent. child is a ${type} and parent is a `);
        }
    }

    protected determineIndexInAr(vel: VpcElBase, appl: VpcApplication) {
        let ar = UndoableActionCreateOrDelVelement.getparentarray(this.parentid, appl, vel.getType());
        for (let i = 0; i < ar.length; i++) {
            if (ar[i].id === vel.id) {
                return i;
            }
        }

        throw makeVpcInternalErr(`6d|could not find place in parent array for ${vel.id}`);
    }

    static rawCreate<T extends VpcElBase>(appl: VpcApplication, velid: string, parentid: string, ctr: { new (...args: any[]): T }): T {
        appl.appli.causeRenderModelFullRefresh();
        let el = new ctr(velid, parentid);
        checkThrow(el && el.isVpcElBase, `8*|must be a VpcElBase`);
        el.observer = appl.runtime.useThisObserverForVpcEls;
        appl.model.addIdToMapOfElements(el);
        return el;
    }

    protected create(appl: VpcApplication) {
        let ctr = UndoableActionCreateOrDelVelement.getconstructor(this.type);
        let el = UndoableActionCreateOrDelVelement.rawCreate(appl, this.velId, this.parentid, ctr);
        let ar = UndoableActionCreateOrDelVelement.getparentarray(this.parentid, appl, el.getType());
        if (this.insertindex === -1) {
            // note, save this for undo posterity
            this.insertindex = ar.length;
        }

        // check bounds, note that it is ok to insert one past the end.
        assertTrueWarn(this.insertindex >= 0 && this.insertindex <= ar.length, "6c|incorrect insertion point");
        checkThrow(ar.length < CodeLimits.maxVelChildren, `8)|exceeded maximum number of child elements (${CodeLimits.maxVelChildren})`);
        ar.splice(this.insertindex, 0, el);
    }

    protected remove(appl: VpcApplication) {
        appl.appli.causeRenderModelFullRefresh();
        let el = appl.model.getByIdUntyped(this.velId);
        let ar = UndoableActionCreateOrDelVelement.getparentarray(el.parentId, appl, el.getType());
        assertEqWarn(el.id, ar[this.insertindex].id, "6b|");
        assertTrueWarn(this.insertindex >= 0 && this.insertindex < ar.length, "6a|incorrect insertion point");
        ar.splice(this.insertindex, 1);
        appl.model.removeIdFromMapOfElements(el.id);
        appl.runtime.codeExec.removeScript(this.velId);
        el.makeDormant();
    }
}

class UndoableActionCreateVel extends UndoableActionCreateOrDelVelement implements UndoableAction {
    isUndoableActionCreateVel = true;
    constructor(id: string, parent_id: string, type: VpcElType, insertIndex = -1 /* default to add-to-end */) {
        super(id, parent_id, type, insertIndex);
    }

    do(appl: VpcApplication) {
        checkThrow(!appl.runtime.codeExec.isCodeRunning(), "8(|currently can't add or remove an element while code is running");
        this.create(appl);
    }

    undo(appl: VpcApplication) {
        checkThrow(!appl.runtime.codeExec.isCodeRunning(), "8&|currently can't add or remove an element while code is running");
        this.remove(appl);
    }
}

class UndoableActionDeleteVel extends UndoableActionCreateOrDelVelement implements UndoableAction {
    isUndoableActionDeleteVel = true;
    data = "";
    childcount: number;
    constructor(vel: VpcElBase, appl: VpcApplication) {
        super(vel.id, vel.parentId, vel.getType(), -1);
        UndoableActionDeleteVel.checkIfCanDelete(vel, appl);
        let velAsCard = vel as VpcElCard;
        if (velAsCard && velAsCard.isVpcElCard && velAsCard.parts.length > 0) {
            throw makeVpcScriptErr("6U|To delete a card, first delete all of its parts.");
        }

        this.childcount = 0;
        for (let arr of VpcElBase.getChildrenArrays(vel)) {
            this.childcount += arr.length;
        }

        this.insertindex = this.determineIndexInAr(vel, appl);
        this.data = new VpcSerialization().serializeVelCompressed(appl, vel, this.insertindex);
    }

    static checkIfCanDelete(vel: VpcElBase, appl: VpcApplication) {
        let currentCard = appl.model.getByIdUntyped(appl.model.productOpts.get_s("currentCardId"));
        let velAsCard = vel as VpcElCard;
        let velAsBg = vel as VpcElBg;
        assertTrue(!!appl.model.findByIdUntyped(vel.id), "6Z|deleting element that doesn't exist?", vel.id);
        if (vel.getType() === VpcElType.Stack || vel.getType() === VpcElType.Product || vel.getType() === VpcElType.Unknown) {
            throw makeVpcScriptErr("6Y|Cannot delete this type of element");
        } else if (velAsCard && velAsCard.isVpcElCard) {
            let ar = UndoableActionCreateOrDelVelement.getparentarray(vel.parentId, appl, vel.getType());
            checkThrow(ar.length > 1, "8%|Cannot delete the only card of a stack");
        } else if (vel.id === currentCard.id) {
            throw makeVpcScriptErr("6X|Cannot delete the current card");
        } else if (vel.id === currentCard.parentId) {
            throw makeVpcScriptErr("6W|Cannot delete the current background");
        } else if (velAsBg && velAsBg.isVpcElBg && velAsBg.cards.length > 0) {
            throw makeVpcScriptErr("6V|The only way to delete a bg is to delete all of its cards.");
        }
    }

    do(appl: VpcApplication) {
        checkThrow(!appl.runtime.codeExec.isCodeRunning(), "8$|currently can't add or remove an element while code is running");
        // I used to automatically delete the children here in this loop.
        // more convienient because you can just say 'delete card' w/o deleting children first.
        // but if I did that, they wouldn't be registered by onesJustDeleted
        assertEqWarn(0, this.childcount, "6T|");
        this.remove(appl);
    }

    undo(appl: VpcApplication) {
        checkThrow(!appl.runtime.codeExec.isCodeRunning(), "8#|currently can't add or remove an element while code is running");
        appl.appli.causeRenderModelFullRefresh();
        let readded = new VpcSerialization().deserializeVelCompressed(appl, this.data);
        readded.observer = appl.runtime.useThisObserverForVpcEls;
        appl.model.addIdToMapOfElements(readded);
        appl.runtime.codeExec.updateChangedCode(readded, readded.get_s("script"), true);
    }
}

class UndoableActionModifyVelement implements UndoableAction {
    velId: string;
    propname: string;
    prevVal: ElementObserverVal;
    newVal: ElementObserverVal;
    constructor(velId: string, propname: string, prevVal: ElementObserverVal, newVal: ElementObserverVal) {
        if (prevVal instanceof FormattedText) {
            prevVal.lock();
        }

        if (newVal instanceof FormattedText) {
            newVal.lock();
        }

        if (isString(prevVal)) {
            if (isString(newVal)) {
                prevVal = "$" + Util512.compressString(prevVal.toString(), false);
                newVal = "$" + Util512.compressString(newVal.toString(), false);
            } else {
                throw makeVpcInternalErr("both must be strings " + propname + " " + velId);
            }
        } else if (prevVal instanceof FormattedText) {
            if (newVal instanceof FormattedText) {
                prevVal = "@" + Util512.compressString(prevVal.toPersisted(), false);
                newVal = "@" + Util512.compressString(newVal.toPersisted(), false);
            } else {
                throw makeVpcInternalErr("both must be FormattedText " + propname + " " + velId);
            }
        }

        this.velId = velId;
        this.propname = propname;
        this.prevVal = prevVal;
        this.newVal = newVal;
    }

    do(appl: VpcApplication) {
        let el = appl.model.getByIdUntyped(this.velId);
        let newVal = this.newVal;
        if (typeof newVal === "string" && newVal.charAt(0) === "$") {
            newVal = Util512.decompressString(newVal.substr(1), false);
        } else if (typeof newVal === "string" && newVal.charAt(0) === "@") {
            let newValPs = Util512.decompressString(newVal.substr(1), false);
            newVal = FormattedText.newFromPersisted(newValPs);
        }

        el.set(this.propname, newVal);
    }

    undo(appl: VpcApplication) {
        let el = appl.model.getByIdUntyped(this.velId);
        let prevVal = this.prevVal;
        if (typeof prevVal === "string" && prevVal.charAt(0) === "$") {
            prevVal = Util512.decompressString(prevVal.substr(1), false);
        } else if (typeof prevVal === "string" && prevVal.charAt(0) === "@") {
            let prevValPs = Util512.decompressString(prevVal.substr(1), false);
            prevVal = FormattedText.newFromPersisted(prevValPs);
        }

        el.set(this.propname, prevVal);
    }
}

class UndoableChangeSet {
    static genChangeSetId = new CountNumericId(10000);
    revisionId: string;
    protected list: UndoableAction[] = [];

    constructor() {
        this.revisionId = UndoableChangeSet.genChangeSetId.nextAsStr();
    }

    notifyAction(action: UndoableAction) {
        this.list.push(action);
    }

    notifyPropChange(velId: string, propname: string, prevVal: ElementObserverVal, newVal: ElementObserverVal) {
        // ignore selection and scroll changes.
        if (propname === "selcaret" || propname === "selend" || propname === "scroll") {
            return;
        }

        this.list.push(new UndoableActionModifyVelement(velId, propname, prevVal, newVal));
    }

    hasContent() {
        return this.list.length > 0;
    }

    do(appl: VpcApplication) {
        for (let i = 0; i < this.list.length; i++) {
            this.list[i].do(appl);
        }
    }

    undo(appl: VpcApplication) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            this.list[i].undo(appl);
        }
    }
}

export class UndoManager implements ElementObserver {
    protected history: UndoableChangeSet[] = [];
    protected activeChangeSet: O<UndoableChangeSet>;
    protected pos = -1;
    protected doWithoutAbilityToUndoActive = false;
    constructor(protected cbGetCurrentCard: () => string) {}

    doWithoutAbilityToUndo(fn: () => void) {
        try {
            this.doWithoutAbilityToUndoActive = true;
            fn();
        } finally {
            this.doWithoutAbilityToUndoActive = false;
        }
    }

    undoableAction(fn: () => void) {
        // allow re-entrancy by checking if this.activeList already exists
        let startedNewList = false;
        if (!this.activeChangeSet) {
            this.activeChangeSet = new UndoableChangeSet();
            startedNewList = true;
        }

        try {
            fn();
        } finally {
            if (startedNewList) {
                this.pushUndoableChangeList(this.activeChangeSet);
                this.activeChangeSet = undefined;
            }
        }
    }

    protected pushUndoableChangeList(list: UndoableChangeSet) {
        if (this.doWithoutAbilityToUndoActive) {
            return;
        }

        if (!list.hasContent()) {
            // do nothing if no undoable events were recorded.
            // important because if user has been running undo() we would lose their ability to redo()
            return;
        }

        this.history.push(list);
        this.pos = this.history.length - 1;
    }

    performUndo(appl: VpcApplication) {
        assertTrue(!this.doWithoutAbilityToUndoActive, "6S|can't call this during doWithoutAbilityToUndoActive");
        assertTrue(!this.activeChangeSet, "6R|can't call this during undoable action");
        if (this.pos < 0) {
            return false;
        } else {
            let cmd = this.history[this.pos];
            appl.doWithoutAbilityToUndo(() => cmd.undo(appl));
            this.pos--;
            appl.appli.refreshAfterUndoOrRedo();
            return true;
        }
    }

    performRedo(appl: VpcApplication) {
        assertTrue(!this.doWithoutAbilityToUndoActive, "6Q|can't call this during doWithoutAbilityToUndoActive");
        assertTrue(!this.activeChangeSet, "6P|can't call this during undoable action");
        if (this.pos >= this.history.length - 1) {
            return false;
        } else {
            let cmd = this.history[this.pos + 1];
            appl.doWithoutAbilityToUndo(() => cmd.do(appl));
            this.pos++;
            appl.appli.refreshAfterUndoOrRedo();
            return true;
        }
    }

    changeSeen(context: ChangeContext, elid: string, propname: string, prev: ElementObserverVal, newv: ElementObserverVal) {
        if (this.doWithoutAbilityToUndoActive) {
            return;
        }

        if (this.activeChangeSet) {
            this.activeChangeSet.notifyPropChange(elid, propname, prev, newv);
        } else {
            assertTrueWarn(false, "6O|must be done inside an undoable block", elid, propname, prev, newv);
        }
    }

    changeSeenCreationDeletion(action: UndoableAction) {
        if (this.doWithoutAbilityToUndoActive) {
            return;
        }

        if (action instanceof UndoableActionCreateOrDelVelement) {
            if (this.activeChangeSet) {
                this.activeChangeSet.notifyAction(action);
            } else {
                assertTrueWarn(false, "6N|must be done inside an undoable block", action.velId, action.type);
            }
        } else {
            throw "not a known type of UndoableAction";
        }
    }

    getStateSnapshot() {
        if (this.history.length === 0) {
            return "";
        } else if (this.pos != this.history.length - 1) {
            // user is currently back in time
            return "x" + Math.random().toString();
        } else {
            return this.history[this.history.length - 1].revisionId;
        }
    }
}

export class VpcSerialization {
    serializeAll(appl: VpcApplication) {
        let ret: any = {};
        ret.product = "vpc";
        ret.fileformatmajor = 2;
        ret.fileformatminor = 0;
        ret.buildnumber = vpcversion;
        ret.countNumericId = appl.countNumericId.next();
        ret.uuid = appl.model.modelUuid;
        ret.elements = [];
        let stack = appl.model.stack;
        for (let vel of stack.iterEntireStack()) {
            let serialized = this.serializeVel(vel);
            ret.elements.push(serialized);
        }

        return ret;
    }

    serializeVel(vel: VpcElBase) {
        let ret: any = {};
        ret.type = vel.getType();
        ret.id = vel.id;
        ret.parent_id = vel.parentId;
        ret.attrs = VpcUI512Serialization.serializeUiGettable(vel, vel.getAttributesList());
        return ret;
    }

    deserializeAll(building: VpcApplication, incoming: any) {
        building.doWithoutAbilityToUndo(() => {
            checkThrowEq("vpc", incoming.product, "");
            checkThrowEq(2, incoming.fileformatmajor, "file comes from a future version, cannot open");
            console.log(`opening a document format ${incoming.fileformatmajor}.${incoming.fileformatminor}, my version is 2.0`);
            console.log(`opening a document made by buildnumber ${incoming.buildnumber}, my buildnumber is ${vpcversion}`);
            building.countNumericId.setCounter(incoming.countNumericId);
            building.model.modelUuid = incoming.uuid;
            checkThrow(incoming.elements && incoming.elements.length > 0, "elements missing or empty");
            for (let i = 0; i < incoming.elements.length; i++) {
                this.deserializeVel(building, incoming.elements[i]);
            }
        });
    }

    deserializeVel(building: VpcApplication, incoming: any) {
        if (incoming.type === VpcElType.Stack) {
            // we don't need to create a new element, just copy over the attrs
            VpcUI512Serialization.deserializeUiSettable(building.model.stack, building.model.stack.getAttributesList(), incoming.attrs);
        } else if (
            incoming.type === VpcElType.Bg ||
            incoming.type === VpcElType.Card ||
            incoming.type === VpcElType.Btn ||
            incoming.type === VpcElType.Fld
        ) {
            let created = building.createElem(incoming.parent_id, incoming.type, -1, incoming.id);
            VpcUI512Serialization.deserializeUiSettable(created, created.getAttributesList(), incoming.attrs);
        } else {
            assertTrueWarn(false, "unsupported type", incoming.type);
        }
    }

    serializeVelCompressed(building: VpcApplication, vel: VpcElBase, insertIndex: number): string {
        let s = "";
        building.doWithoutAbilityToUndo(() => {
            let obj = this.serializeVel(vel);
            obj.insertIndex = insertIndex;
            s = JSON.stringify(obj);
        });
        return Util512.compressString(s, false);
    }

    deserializeVelCompressed(building: VpcApplication, s: string): VpcElBase {
        let created: VpcElBase = undefined as any;
        building.doWithoutAbilityToUndo(() => {
            s = Util512.decompressString(s, false);
            let incoming = JSON.parse(s);
            assertTrue(
                incoming.type === VpcElType.Bg ||
                    incoming.type === VpcElType.Card ||
                    incoming.type === VpcElType.Btn ||
                    incoming.type === VpcElType.Fld,
                "bad type",
                incoming.type
            );
            created = building.createElem(incoming.parent_id, incoming.type, incoming.insertIndex, incoming.id);
            VpcUI512Serialization.deserializeUiSettable(created, created.getAttributesList(), incoming.attrs);
        });
        return created;
    }
}

// for trivial settings that don't need to be in the undo stack
// (note that undo/redo can be annoying to use if redo doesn't work
// because trivial actions always zap the ability to redo)
// currently being aggressive-- changing cur card or cur tool *does* hit undo stack
// will mitigate with save checkpoints
export class VpcRuntimeOpts extends UI512Settable {
    protected _optFullscreen = false;
    protected _mimicCurrentTool = VpcTool.browse;
    protected _screenLocked = false;
    protected _bumpToRefresh = 0;
    protected _copiedVelId = "";
    protected _viewingScriptLastRuntimeErr = "";
    isARuntimeOpt: { [key: string]: boolean } = {
        optFullscreen: true,
        mimicCurrentTool: true,
        screenLocked: true,
        bumpToRefresh: true,
        copiedVelId: true,
        viewingScriptLastRuntimeErr: true,
    };

    constructor() {
        super("(VpcRuntimeOpts)");
    }

    destroy() {
        this.observer = new ElementObserverDefault();
    }
}

class VpcRuntime {
    // set by VpcDocLoader, VpcAppController::init
    codeExec: CodeExecTop;
    outside: VpcOutsideWorld;
    useThisObserverForVpcEls: ElementObserver = new ElementObserverNoOp();
    opts = new VpcRuntimeOpts();

    causeRefresh() {
        this.opts.set("bumpToRefresh", this.opts.get_n("bumpToRefresh") + 1);
    }

    destroy() {
        this.opts.destroy();
        this.opts = undefined as any;
        this.codeExec = undefined as any;
        this.useThisObserverForVpcEls = undefined as any;
        this.outside = undefined as any;
    }
}

export class VpcStateInterface implements IVpcStateInterface {
    constructor(protected appl: VpcApplication) {}

    getOption_s(prop: string) {
        if (this.appl.runtime.opts.isARuntimeOpt[prop]) {
            return this.appl.runtime.opts.get_s(prop);
        } else {
            return this.appl.model.productOpts.get_s(prop);
        }
    }
    getOption_n(prop: string) {
        if (this.appl.runtime.opts.isARuntimeOpt[prop]) {
            return this.appl.runtime.opts.get_n(prop);
        } else {
            return this.appl.model.productOpts.get_n(prop);
        }
    }

    getOption_b(prop: string) {
        if (this.appl.runtime.opts.isARuntimeOpt[prop]) {
            return this.appl.runtime.opts.get_b(prop);
        } else {
            return this.appl.model.productOpts.get_b(prop);
        }
    }

    setOption<T extends ElementObserverVal>(prop: string, newval: T) {
        if (this.appl.runtime.opts.isARuntimeOpt[prop]) {
            return this.appl.runtime.opts.set(prop, newval);
        } else {
            return this.appl.model.productOpts.set(prop, newval);
        }
    }

    getNextStrId() {
        return this.appl.countNumericId.nextAsStr();
    }

    refreshAfterUndoOrRedo() {
        this.appl.runtime.causeRefresh();
        this.causeRenderModelFullRefresh();
    }

    performUndo(): boolean {
        return this.appl.runtime.codeExec.isCodeRunning() ? false : this.appl.undoManager.performUndo(this.appl);
    }

    performRedo(): boolean {
        return this.appl.runtime.codeExec.isCodeRunning() ? false : this.appl.undoManager.performRedo(this.appl);
    }

    getStateSnapshot(): string {
        return this.appl.undoManager.getStateSnapshot();
    }

    findExecFrameStack(): [O<CodeExecFrameStack>, O<CodeExecFrame>] {
        let frstack = this.appl.runtime.codeExec.workQueue[0];
        if (frstack) {
            return [frstack, frstack.stack[frstack.stack.length - 1]];
        } else {
            return [undefined, undefined];
        }
    }

    getModel(): VpcModel {
        return this.appl.model;
    }
    isCodeRunning(): boolean {
        return this.appl.runtime.codeExec.isCodeRunning();
    }

    createElem(parent_id: string, type: VpcElType, insertIndex: number): VpcElBase {
        return this.appl.createElem(parent_id, type, insertIndex);
    }
    removeElem(vel: VpcElBase) {
        this.appl.removeElem(vel);
    }
    doWithoutAbilityToUndo(fn: () => void) {
        this.appl.doWithoutAbilityToUndo(fn);
    }
    undoableAction(fn: () => void) {
        this.appl.undoManager.undoableAction(fn);
    }
    getUi512App(): UI512Application {
        throw makeVpcInternalErr("used before init getUi512App()");
    }
    getController(): UI512Controller {
        throw makeVpcInternalErr("used before init getController()");
    }
    bounds(): number[] {
        throw makeVpcInternalErr("used before init bounds()");
    }
    userBounds(): number[] {
        throw makeVpcInternalErr("used before init userBounds()");
    }
    lang(): UI512Lang {
        throw makeVpcInternalErr("used before init lang()");
    }
    getCurrentCardNum(): number {
        throw makeVpcInternalErr("used before init getCurrentCardNum()");
    }
    setCurrentCardNum(pos: OrdinalOrPosition): void {
        throw makeVpcInternalErr("used before init setCurrentCardNum()");
    }
    getTool(): number {
        throw makeVpcInternalErr("used before init getTool()");
    }
    setTool(n: VpcTool): void {
        throw makeVpcInternalErr("used before init setTool()");
    }
    getCurrentFocusVelField(): O<VpcElField> {
        throw makeVpcInternalErr("used before init getSelectedField()");
    }
    getCurrentFocus(): O<string> {
        throw makeVpcInternalErr("used before init getCurrentFocus()");
    }
    setCurrentFocus(s: O<string>) {
        throw makeVpcInternalErr("used before init setCurrentFocus()");
    }
    commitSimulatedClicks(queue: PaintOntoCanvas[]): void {
        throw makeVpcInternalErr("used before init setCurrentFocus()");
    }
    performMenuAction(s: string) {
        throw makeVpcInternalErr("used before init performMenuAction()");
    }
    causeRenderModelFullRefresh(): void {
        throw makeVpcInternalErr("used before init causeRenderModelFullRefresh()");
    }
}

export class VpcApplication {
    // nothing here is persisted or undoable
    // (started by VpcDocLoader)
    runtime = new VpcRuntime();
    // put any undoable state here. you can use model.productOpts if not persisted
    // (started by VpcDocLoader)
    model: VpcModel;
    // kept in high-level, it is global and should be persisted
    // (started by VpcDocLoader)
    countNumericId: CountNumericId;

    // (started by VpcDocLoader)
    undoManager: UndoManager;

    appli: IVpcStateInterface;

    createElem(parent_id: string, type: VpcElType, insertIndex = -1, newid?: string) {
        newid = newid || this.countNumericId.nextAsStr();
        checkThrow(newid.match(/^[0-9]+$/), "id should be purely numeric", newid);
        let cr = new UndoableActionCreateVel(newid, parent_id, type, insertIndex);
        this.undoManager.changeSeenCreationDeletion(cr);
        cr.do(this);
        return this.model.getByIdUntyped(newid);
    }

    removeElem(vel: VpcElBase) {
        UndoableActionDeleteVel.checkIfCanDelete(vel, this);

        if (vel instanceof VpcElCard) {
            for (let part of vel.parts) {
                assertTrue(part instanceof VpcElButton || part instanceof VpcElField, "6M|bad type");
                this.removeElemImpl(part);
            }
        }

        this.removeElemImpl(vel);

        if (vel.getType() === VpcElType.Card) {
            let bg = this.model.getById(vel.parentId, VpcElBg);
            if (bg && bg.cards.length === 0) {
                this.removeElemImpl(bg);
            }
        }
    }

    protected removeElemImpl(vel: VpcElBase) {
        let rm = new UndoableActionDeleteVel(vel, this);
        this.undoManager.changeSeenCreationDeletion(rm);
        rm.do(this);
    }

    doWithoutAbilityToUndo(fn: () => void) {
        this.undoManager.doWithoutAbilityToUndo(fn);
    }

    ensureDocumentNotEmpty(root: Root, createFirstCard: boolean) {
        if (!this.model.productOpts) {
            this.doWithoutAbilityToUndo(() => {
                this.model.productOpts = UndoableActionCreateOrDelVelement.rawCreate(
                    this,
                    this.appli.getNextStrId(),
                    "(VpcElProductOpts has no parent)",
                    VpcElProductOpts
                );
            });
        }

        if (!this.model.stack) {
            this.doWithoutAbilityToUndo(() => {
                // create a new stack
                this.model.stack = UndoableActionCreateOrDelVelement.rawCreate(
                    this,
                    this.appli.getNextStrId(),
                    this.model.productOpts.id,
                    VpcElStack
                );

                if (createFirstCard) {
                    let firstbg = this.createElem(this.model.stack.id, VpcElType.Bg);
                    let firstcard = this.createElem(firstbg.id, VpcElType.Card);
                }
            });
        }
    }
}

