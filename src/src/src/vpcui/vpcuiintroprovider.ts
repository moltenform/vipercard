
/* autoimport:start */
import { IVpcStateInterface, VpcAppInterfaceLayer, VpcOutsideWorld } from "../vpcui/vpcoutside.js";
import { VpcAppController, VpcAppControllerEvents, EditTextBehaviorSendToVel } from "../vpcui/vpcappcontroller.js";
import { UndoableAction, UndoManager, VpcSerialization, VpcRuntimeOpts, VpcStateInterface, VpcApplication } from "../vpcui/vpcstate.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { CodeExecTop, CodeExecFrameStack, CodeExecFrame, VpcParsingCache } from "../vpcscript/vpcscriptexec.js";
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

export enum OpenFromLocation {
    __isUI512Enum = 1,
    NewDoc,
    FromJsonFile,
    LocalStorage,
}

function filterIncomingName(s: string) {
    let ret = "";
    for (let i = 0; i < s.length; i++) {
        let ch = s.charCodeAt(i);
        if (ch >= " ".charCodeAt(0) && ch <= "~".charCodeAt(0)) {
            ret += s.charAt(i);
        }
    }

    ret = ret.trim();
    ret = ret.slice(0, CodeLimits.maxStackNameLen);
    return ret;
}

export function provideOpenFromLocal(showAll: boolean): [string, string][] {
    let keys = Object.keys(window.localStorage);
    let ret: [string, string][] = [];
    for (let key of keys) {
        if (showAll || key.startsWith(VpcDocLoader.docprefix)) {
            let shortname = showAll ? key : key.substr(VpcDocLoader.docprefix.length);
            ret.push([shortname, shortname]);
        }
    }

    return ret;
}

export class VpcDocLoader {
    static readonly docprefix = "vpcdoc:";

    timeStartedLoading = -1;
    isErrorState = false;
    currentmessage = "...";
    ctrller: O<VpcAppController>;
    appl: O<VpcApplication>;
    cbExitToMainMenu: () => void;
    cbExitToNewDocument: () => void;
    readonly worker: IterableIterator<boolean>;
    constructor(
        protected lang: UI512Lang,
        protected root: Root,
        public identifier: string,
        public readonly docname: string,
        public readonly loc: OpenFromLocation
    ) {
        this.worker = this.loadDocumentTop(root);
    }

    static saveDoc(identifier: O<string>, humanName: O<string>, serializedSavedData: string, loc: OpenFromLocation) {
        assertTrue(identifier !== undefined || humanName !== undefined, "both undefined");
        if (!identifier) {
            humanName = filterIncomingName(humanName as string);
            checkThrow(humanName.length > 0, "name is missing, or is all whitespace");
            checkThrow(window.localStorage[VpcDocLoader.docprefix + humanName] === undefined, "a doc already exists with this name");
            identifier = humanName;
        }

        if (loc === OpenFromLocation.LocalStorage) {
            let key = VpcDocLoader.docprefix + identifier;
            window.localStorage[key] = serializedSavedData;
        } else {
            checkThrow(false, "unsupported location", loc);
        }

        // returns the new identifier
        return identifier;
    }

    *loadDocumentTop(root: Root) {
        let serializedSavedData = "";
        if (this.loc === OpenFromLocation.LocalStorage) {
            let key = VpcDocLoader.docprefix + this.identifier;
            let data = window.localStorage[key];
            checkThrow(data != null && data != undefined && data.length > 0, "no data found", key);
            serializedSavedData = data;
        } else if (this.loc === OpenFromLocation.NewDoc) {
            assertEqWarn("", this.identifier, "");
            serializedSavedData = "";
        } else if (this.loc === OpenFromLocation.FromJsonFile) {
            serializedSavedData = this.identifier;
            this.identifier = "";
        } else if (this.loc !== undefined) {
            checkThrow(false, "cannot open from location", this.loc);
        }

        yield true;
        let appl = new VpcApplication();
        appl.countNumericId = new CountNumericId();
        yield true;
        appl.undoManager = new UndoManager(() => appl.model.productOpts.get_s("currentCardId"));
        yield true;
        appl.runtime.opts.observer = new ElementObserverNoOp();
        yield true;
        appl.runtime.outside = new VpcOutsideWorld(this.lang);
        yield true;
        appl.runtime.codeExec = new CodeExecTop(appl.countNumericId, appl.runtime.outside);
        yield true;
        appl.model = new VpcModel();
        yield true;
        this.ctrller = new VpcAppController(root, appl);
        yield true;
        this.ctrller.cbExitToMainMenu = this.cbExitToMainMenu;
        yield true;
        this.ctrller.cbExitToNewDocument = this.cbExitToNewDocument;
        yield true;
        this.ctrller.cbSave = (s: string, identifier: O<string>, humanName: O<string>) =>
            VpcDocLoader.saveDoc(identifier, humanName, s, OpenFromLocation.LocalStorage);
        yield true;
        this.ctrller.init();
        yield true;

        // load saved data
        if (serializedSavedData.length) {
            appl.ensureDocumentNotEmpty(this.root, false);
            yield true;
            let serVel = JSON.parse(serializedSavedData);
            yield true;
            let des = new VpcSerialization();
            yield true;
            des.deserializeAll(appl, serVel);
            yield true;
            this.ctrller.locIdForSave = this.identifier;
            yield true;
        } else {
            // only call this *after* the appcontroller has set up useThisObserverForVpcEls
            appl.model.modelUuid = Util512.weakUuid();
            yield true;
            appl.ensureDocumentNotEmpty(this.root, true);
            yield true;
        }

        this.ctrller.initUI();
        yield true;
        appl.runtime.outside.appli = this.ctrller.appli;
        yield true;

        // go to the first card
        appl.doWithoutAbilityToUndo(() => appl.model.productOpts.set("currentCardId", appl.model.stack.bgs[0].cards[0].id));
        yield true;

        // compile all existing scripts
        for (let vel of appl.model.stack.iterEntireStack()) {
            let scr = vel.get_s("script");
            if (scr && scr.length) {
                const silent = true;
                appl.runtime.codeExec.updateChangedCode(vel, scr, silent);
                yield true;
            }
        }

        this.appl = appl;
        yield true;
    }

    workOnLoad(root: Root, time: number): string {
        if (!this.isErrorState) {
            try {
                this.workOnLoadImpl(root, time);
            } catch (e) {
                this.isErrorState = true;
                this.currentmessage =
                    this.lang.translate("lngPlease refresh the browser window to return to the main menu.") + "\n" + e.message + "\n\n\n";
            }
        }

        return this.currentmessage;
    }

    workOnLoadImpl(root: Root, time: number) {
        const timeslice = 200;
        const mintime = 1500;
        let began = performance.now();
        if (this.timeStartedLoading === -1) {
            this.timeStartedLoading = began;
        }

        while (true) {
            let next = this.worker.next();
            if (next.done) {
                // if we finished really soon, just keep calling next(), it's ok
                if (began - this.timeStartedLoading >= mintime) {
                    assertTrue(!!this.ctrller, "6<|ctrller was not set");
                    root.replaceCurrentController(this.ctrller);
                }

                break;
            } else if (performance.now() - began > timeslice) {
                break;
            }
        }
    }
}
