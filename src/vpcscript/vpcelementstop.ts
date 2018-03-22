
/* autoimport:start */
import { cProductName, cTkSyntaxMarker, makeVpcScriptErr, makeVpcInternalErr, checkThrow, checkThrowEq, FormattedSubstringUtil, CodeLimits, VpcIntermedValBase, IntermedMapOfIntermedVals, VpcVal, VpcValS, VpcValN, VpcValBool, VarCollection, VariableCollectionConstants, VpcEvalHelpers, ReadableContainer, WritableContainer, RequestedChunk, ChunkResolution, VpcUI512Serialization, CountNumericId } from "../vpcscript/vpcutil.js";
import { RequestedChunkType, PropAdjective, SortStyle, OrdinalOrPosition, RequestedChunkTextPreposition, VpcElType, VpcTool, toolToPaintOntoCanvasShapes, VpcToolCtg, getToolCategory, VpcBuiltinMsg, getMsgNameFromType, VpcOpCtg, getPositionFromOrdinalOrPosition } from "../vpcscript/vpcenums.js";
import { ChvLexer, ChvParser, ChvToken, ChvILexingResult, ChvILexingError, ChvIToken } from "../vpcscript/bridgechv.js";
import { PrpTyp, VpcElBase, VpcElSizable, VpcElButton, UI512FldStyleInclScrolling, VpcElField, VpcElCard, VpcElBg, VpcElStack } from "../vpcscript/vpcelements.js";
import { RectOverlapType, RectUtils, ModifierKeys, osTranslateModifiers, toShortcutString, DrawableImage, CanvasWrapper, UI512Cursors, UI512CursorAccess, getColorFromCanvasData, MenuConsts, ScrollConsts, ScreenConsts, getStandardWindowBounds, sleep, compareCanvas, CanvasTestParams, testUtilCompareCanvasWithExpected } from "../ui512/ui512renderutils.js";
import { ChangeContext, ElementObserverVal, ElementObserver, ElementObserverNoOp, ElementObserverDefault, elementObserverNoOp, elementObserverDefault, UI512Gettable, UI512Settable, UI512Element } from "../ui512/ui512elementsbase.js";
import { UI512ElementWithText, UI512ElementWithHighlight, UI512BtnStyle, UI512ElementButtonGeneral, UI512ElButton, UI512ElLabel, UI512FldStyle, UI512ElTextField, UI512ElCanvasPiece, GridLayout, UI512ElGroup, UI512Application, ElementObserverToTwo } from "../ui512/ui512elements.js";
import { specialCharOnePixelSpace, specialCharFontChange, specialCharZeroPixelChar, specialCharCmdSymbol, specialCharNumNewline, specialCharNumZeroPixelChar, largearea, RenderTextArgs, FormattedText, TextFontStyling, textFontStylingToString, stringToTextFontStyling, TextFontSpec, TextRendererGrid, TextRendererFont, TextRendererFontCache, CharRectType, TextRendererFontManager, renderTextArgsFromEl, Lines } from "../ui512/ui512rendertext.js";
import { clrBlack, clrWhite, clrTransp, makePainterCvDataDraw, makePainterCvDataWithPatternSupport, simplifyPattern, needsPatternSupport, makePainterCvCanvas, UI512Painter, DissolveImages, UI512ImageSerialization } from "../ui512/ui512paint.js";
import { UI512ViewDraw, PaintOntoCanvasShapes, PaintOntoCanvas } from "../ui512/ui512elementsdefaultview.js";
import { makeUI512ErrorGeneric, makeUI512Error, ui512RespondError, assertTrue, assertEq, assertTrueWarn, assertEqWarn, throwIfUndefined, ui512ErrorHandling, O, refparam, Util512, findStrToEnum, getStrToEnum, findEnumToStr, getEnumToStrOrUnknown, scontains, slength, setarr, cast, isString, fitIntoInclusive, RenderComplete, defaultSort, LockableArr, RepeatingTimer, IFontManager, IIconManager, Root, OrderedHash, BrowserOSInfo, Tests_BaseClass, CharClass, GetCharClass, MapKeyToObject, MapKeyToObjectCanSet } from "../ui512/ui512utils.js";
import { EventDetails, KeyEventDetails, MouseEventDetails, MouseMoveEventDetails, IdleEventDetails, MouseEnterDetails, MouseLeaveDetails, MenuItemClickedDetails, KeyUpEventDetails, KeyDownEventDetails, MouseUpEventDetails, MouseDownEventDetails, MouseDownDoubleEventDetails, PasteTextEventDetails, FocusChangedEventDetails, UI512EventType, UI512ControllerAbstract } from "../ui512/ui512elementslisteners.js";
import { UI512Lang, UI512LangNull } from  "../locale/lang-base.js";
/* autoimport:end */

import { vpcversion } from "../appsettings.js";

export class RequestedVelRef extends VpcIntermedValBase {
    isRequestedVelRef = true;
    type: VpcElType;
    lookById: O<number>;
    lookByName: O<string>;
    lookByRelative: O<OrdinalOrPosition>;
    lookByAbsolute: O<number>;
    parentCdInfo: O<RequestedVelRef>;
    parentBgInfo: O<RequestedVelRef>;
    parentStackInfo: O<RequestedVelRef>;
    partIsBg = false;
    partIsCd = false;
    isReferenceToTarget = false;
    isReferenceToMe = false;
    constructor(type: VpcElType) {
        super();
        this.type = type;
    }

    // no other information specified other than "this card" or "this stack"
    onlyThisSpecified() {
        return (
            this.lookById === undefined &&
            this.lookByName === undefined &&
            this.lookByAbsolute === undefined &&
            (!this.lookByRelative || this.lookByRelative === OrdinalOrPosition.this)
        );
    }
}

export class RequestedContainerRef extends VpcIntermedValBase {
    isRequestedContainerRef = true;
    vel: O<RequestedVelRef>;
    variable: O<string>;
    chunk: O<RequestedChunk>;
}

export class VpcModel {
    // set by VpcDocLoader which calls ensureDocumentNotEmpty()
    stack: VpcElStack;
    productOpts: VpcElProductOpts;
    modelUuid: string;
    protected elements = new MapKeyToObject<VpcElBase>();
    findByIdUntyped(id: O<string>) {
        return this.elements.find(id);
    }

    getByIdUntyped(id: string) {
        return this.elements.get(id);
    }

    findById<T extends VpcElBase>(id: O<string>, ctor: { new (...args: any[]): T }): O<T> {
        let vel = this.elements.find(id) as any;
        if (vel && !(vel instanceof ctor)) {
            checkThrow(false, "7B|wrong type", vel.id);
        }

        return vel;
    }

    getById<T extends VpcElBase>(id: string, ctor: { new (...args: any[]): T }): T {
        let vel = this.elements.get(id) as any;
        if (!(vel instanceof ctor)) {
            checkThrow(false, "7A|wrong type", vel.id);
        }

        return vel;
    }

    doesPartBelongToBg(part: VpcElSizable) {
        let parent = this.getByIdUntyped(part.parentId);
        return parent.getType() === VpcElType.Bg;
    }

    addIdToMapOfElements(vel: VpcElBase) {
        this.elements.add(vel.id, vel);
    }

    removeIdFromMapOfElements(id: string) {
        return this.elements.remove(id);
    }

    getOwner(vel: VpcElBase): VpcElBase {
        if (vel instanceof VpcElStack) {
            return this.productOpts;
        } else if (vel instanceof VpcElProductOpts) {
            throw makeVpcScriptErr(`4t|cannot get the owner of product`);
        } else {
            let found = this.findByIdUntyped(vel.parentId);
            if (found !== undefined) {
                return found;
            } else {
                throw makeVpcScriptErr(`4s|cannot get the owner of el ${vel.id}`);
            }
        }
    }

    getCurrentCard() {
        let cardid = this.productOpts.get_s("currentCardId");
        let found = this.getById(cardid, VpcElCard);
        checkThrow(found && found.isVpcElCard && found.getType() === VpcElType.Card, "79|getCurrentCard failed");
        return found;
    }

    goCardRelative(pos: OrdinalOrPosition) {
        let curcardid = pos === OrdinalOrPosition.first || pos === OrdinalOrPosition.last ? "" : this.getCurrentCard().id;
        let found = this.stack.getCardByOrdinal(curcardid, pos);
        this.productOpts.set("currentCardId", found.id);
    }

    getUserFormattedId(vel: VpcElBase, adjective: PropAdjective): string {
        if (vel.getType() === VpcElType.Product) {
            return "WILD";
        } else if (vel.getType() === VpcElType.Stack) {
            return "this stack";
        } else if (vel.getType() === VpcElType.Bg || vel.getType() === VpcElType.Card) {
            if (adjective === PropAdjective.short) {
                return vel.id;
            } else {
                let ret = `${vpcElTypeAsSeenInName(vel.getType())} id ${vel.id}`;
                return adjective === PropAdjective.long ? ret + " of this stack" : ret;
            }
        } else if (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld) {
            // confirmed in emulator that adjective is ignored
            return vel.id;
        } else {
            throw makeVpcScriptErr(`4r|unknown type ${vel.getType()}`);
        }
    }

    getUserFormattedName(vel: VpcElBase, adjective: PropAdjective): string {
        let hasAName = slength(vel.get_s("name")) > 0;
        if (vel.getType() === VpcElType.Product) {
            return adjective === PropAdjective.long ? vel.get_s("longname") : vel.get_s("name");
        } else if (vel.getType() === VpcElType.Stack) {
            return adjective === PropAdjective.short && hasAName ? vel.get_s("name") : "this stack";
        } else if (vel.getType() === VpcElType.Bg || vel.getType() === VpcElType.Card) {
            if (adjective === PropAdjective.short) {
                return hasAName ? vel.get_s("name") : this.getUserFormattedId(vel, PropAdjective.empty);
            } else {
                let ret = `${vpcElTypeAsSeenInName(vel.getType())} `;
                ret += hasAName ? `"${vel.get_s("name")}"` : `id ${vel.id}`;
                return adjective === PropAdjective.long ? ret + " of this stack" : ret;
            }
        } else if (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld) {
            let elPart = vel as VpcElSizable;
            checkThrow(elPart.isVpcElSizable, "78|wrong type");
            let prefix = "";
            if (vel instanceof VpcElButton || vel instanceof VpcElField) {
                prefix = this.doesPartBelongToBg(elPart) ? "bkgnd" : "card";
            }

            if (adjective === PropAdjective.short) {
                return hasAName ? vel.get_s("name") : `${prefix} ${vpcElTypeAsSeenInName(vel.getType())} id ${vel.id}`;
            } else {
                let parent = this.elements.get(vel.parentId);
                let ret = `${prefix} ${vpcElTypeAsSeenInName(vel.getType())} `;
                ret += hasAName ? `"${vel.get_s("name")}"` : `id ${vel.id}`;
                return adjective === PropAdjective.long ? ret + " of " + this.getUserFormattedName(parent, PropAdjective.long) : ret;
            }
        } else {
            throw makeVpcScriptErr(`4q|unknown type ${vel.getType()}`);
        }
    }

    getOwnerName(vel: VpcElBase, adjective: PropAdjective): string {
        let card = vel as VpcElCard;
        checkThrow(card.isVpcElCard, `77|you can only get the owner of a card.`);
        let bg = this.getOwner(card);
        return this.getUserFormattedName(bg, adjective);
    }

    resolveReference(ref: RequestedVelRef, me: O<VpcElBase>, target: O<VpcElBase>): O<VpcElBase> {
        const currentCard = this.getCurrentCard();
        checkThrow(ref.isRequestedVelRef, "76|invalid RequestedElRef");
        checkThrow(
            !ref.parentStackInfo || ref.parentStackInfo.onlyThisSpecified(),
            `75|we don't currently support referring to stacks other than "this stack"`
        );

        let parentCard: O<VpcElCard>;
        if (ref.parentCdInfo) {
            checkThrow(ref.type === VpcElType.Btn || ref.type === VpcElType.Fld, `74|you can only specify parent card for btn, fld`);
            checkThrowEq(VpcElType.Card, ref.parentCdInfo.type, `73|required type card but got ${ref.parentCdInfo.type}`);
            parentCard = this.resolveReference(ref.parentCdInfo, me, target) as VpcElCard;
            checkThrow(!parentCard || parentCard.isVpcElCard, `72|wrong type`);
        }

        let parentBg: O<VpcElBg>;
        if (ref.parentBgInfo) {
            checkThrow(
                ref.type === VpcElType.Btn || ref.type === VpcElType.Fld || ref.type === VpcElType.Card,
                `71|you can only specify parent card for btn, fld, cd`
            );
            checkThrowEq(VpcElType.Bg, ref.parentBgInfo.type, `70|required type bg but got ${ref.parentBgInfo.type}`);
            parentBg = this.resolveReference(ref.parentBgInfo, me, target) as VpcElBg;
            checkThrow(!parentBg || parentBg.isVpcElBg, `6~|wrong type`);
        }

        if ((ref.parentCdInfo && parentCard === undefined) || (ref.parentBgInfo && parentBg === undefined)) {
            return undefined;
        } else if (ref.lookById !== undefined) {
            let found = this.findByIdUntyped(ref.lookById.toString());
            return found && found.matchesType(ref.type) ? found : undefined;
        } else if (ref.isReferenceToMe) {
            checkThrowEq(VpcElType.Unknown, ref.type, "6}|");
            return me;
        } else if (ref.isReferenceToTarget) {
            checkThrowEq(VpcElType.Unknown, ref.type, "6||");
            return target;
        } else if (ref.type === VpcElType.Card && !parentBg) {
            if (ref.lookByAbsolute !== undefined) {
                return this.stack.findFromCardStackPosition(ref.lookByAbsolute - 1);
            } else if (ref.lookByName !== undefined) {
                return this.stack.findCardByName(ref.lookByName);
            } else if (ref.lookByRelative !== undefined) {
                return this.stack.getCardByOrdinal(currentCard.id, ref.lookByRelative);
            } else {
                throw makeVpcInternalErr(`4p|unknown el reference`);
            }
        } else if (ref.type === VpcElType.Bg || (ref.type === VpcElType.Card && parentBg)) {
            let arr: VpcElBase[] = [];
            let currentpos = 0;
            if (ref.type === VpcElType.Bg) {
                arr = this.stack.bgs;
                currentpos = VpcElBase.getIndexById(this.stack.bgs, currentCard.parentId);
            } else if (parentBg) {
                // "next card of bg 7" if we're in bg 7, use current position
                // "next card of bg 7" if we're not in bg 7, go to the 2nd card.
                arr = parentBg.cards;
                currentpos = currentCard.parentId === parentBg.id ? VpcElBase.getIndexById(parentBg.cards, currentCard.id) : 0;
            }

            if (ref.lookByAbsolute !== undefined) {
                return arr[ref.lookByAbsolute - 1];
            } else if (ref.lookByName !== undefined) {
                return VpcElBase.findByName(arr, ref.lookByName, ref.type);
            } else if (ref.lookByRelative !== undefined) {
                return VpcElBase.findByOrdinal(arr, currentpos, ref.lookByRelative);
            } else {
                throw makeVpcInternalErr(`4o|unknown el reference`);
            }
        } else if (ref.type === VpcElType.Btn || ref.type === VpcElType.Fld) {
            let arr: VpcElBase[];
            let spart = ref.type === VpcElType.Btn ? "btn" : "fld";
            if (ref.partIsBg) {
                checkThrow(
                    !ref.parentCdInfo,
                    `6{|It doesn't make sense to refer to 'bg ${spart} "a" of cd 2', need to say say 'bg ${spart} "a" of bg 3' or 'cd ${spart} "a" of cd 2'`
                );
                parentBg = parentBg ? parentBg : (this.getOwner(currentCard) as VpcElBg);
                checkThrow(parentBg && parentBg.isVpcElBg, `60|Current bg not found`);
                arr = parentBg.parts;
            } else {
                checkThrow(
                    !ref.parentBgInfo,
                    `6_|It doesn't make sense to refer to 'cd ${spart} "a" of bg 3', need to say say 'bg ${spart} "a" of bg 3' or 'cd ${spart} "a" of cd 2'`
                );
                parentCard = parentCard ? parentCard : currentCard;
                arr = parentCard.parts;
            }

            if (ref.lookByName !== undefined) {
                let ret = VpcElBase.findByName(arr, ref.lookByName, ref.type);
                checkThrow(
                    !ret || this.doesPartBelongToBg(ret as VpcElSizable) === ref.partIsBg,
                    `6^|wanted a cd ${spart} but somehow got a bg ${spart}`
                );
                return ret;
            } else if (ref.lookByAbsolute !== undefined || ref.lookByRelative !== undefined) {
                throw makeVpcScriptErr(
                    `4n|we no longer support referring to cd ${spart} 2. use cd ${spart} "name" or cd ${spart} id 1001 instead. (got ${
                        ref.lookByAbsolute
                    })`
                );
            } else {
                throw makeVpcInternalErr(`4m|unknown el reference`);
            }
        } else if (ref.type === VpcElType.Stack) {
            checkThrow(ref.onlyThisSpecified(), `6]|we don't currently support referring to other stacks`);
            return this.stack;
        } else if (ref.type === VpcElType.Product) {
            return this.productOpts;
        } else {
            throw makeVpcScriptErr(`4l|AttemptedElRef didn't know how to look up type ${ref.type}`);
        }
    }

    destroy() {
        for (let vel of this.stack.iterEntireStack()) {
            vel.makeDormant();
        }

        this.productOpts.observer = new ElementObserverDefault();
        this.elements = undefined as any;
        this.productOpts = undefined as any;
        this.stack = undefined as any;
    }
}

export function vpcElTypeAsSeenInName(tp: VpcElType) {
    switch (tp) {
        case VpcElType.Btn:
            return "button";
        case VpcElType.Fld:
            return "field";
        case VpcElType.Card:
            return "card";
        case VpcElType.Bg:
            return "bkgnd";
        case VpcElType.Stack:
            return "stack";
        case VpcElType.Product:
            return "";
        default:
            throw makeVpcScriptErr(`4k|can't get name of el type ${tp}`);
    }
}

export class ReadableContainerStr implements ReadableContainer {
    constructor(protected s: string) {}
    isDefined() {
        return true;
    }

    getRawString() {
        return this.s;
    }

    len() {
        return this.s.length;
    }
}

export class ReadableContainerVar implements ReadableContainer {
    constructor(protected outside: OutsideWorldRead, public varname: string) {}
    isDefined() {
        return this.outside.IsVarDefined(this.varname);
    }

    getRawString() {
        return this.outside.ReadVarContents(this.varname).readAsString();
    }

    len() {
        return this.getRawString().length;
    }
}

export class WritableContainerVar extends ReadableContainerVar implements WritableContainer {
    constructor(protected outsideWritable: OutsideWorldReadWrite, varname: string) {
        super(outsideWritable, varname);
    }

    splice(insertion: number, lenToDelete: number, newtext: string) {
        let current = this.getRawString();
        let ret = "";
        ret += current.substring(0, insertion);
        ret += newtext;
        ret += current.substring(insertion + lenToDelete);
        this.outsideWritable.SetVarContents(this.varname, VpcValS(ret));
    }

    setAll(newtext: string) {
        this.outsideWritable.SetVarContents(this.varname, VpcValS(newtext));
    }
}

export class ReadableContainerField implements ReadableContainer {
    protected fld: VpcElField;
    constructor(vel: VpcElBase) {
        this.fld = vel as VpcElField;
        checkThrow(
            this.fld && this.fld.isVpcElField,
            `6[|currently we only support reading text from fld. to read label of button, use 'the label of cd btn 1'`
        );
    }

    isDefined() {
        return true;
    }

    len() {
        return this.fld.get_ftxt().len();
    }

    getRawString(): string {
        return this.fld.get_ftxt().toUnformatted();
    }
}

export class WritableContainerField extends ReadableContainerField implements WritableContainer {
    splice(insertion: number, lenToDelete: number, newstring: string) {
        let txt = this.fld.get_ftxt();
        if (insertion === 0 && lenToDelete >= txt.len()) {
            // follow emulator, different behavior (lose formatting) when replacing all text
            this.fld.setProp("alltext", VpcValS(newstring));
        } else {
            let font = insertion >= 0 && insertion < txt.len() ? txt.fontAt(insertion) : this.fld.getDefaultFontAsUi512();
            let newtxt = FormattedText.byInsertion(txt, insertion, lenToDelete, newstring, font);
            this.fld.setftxt(newtxt);
        }
    }

    setAll(newtext: string) {
        // follow emulator, different behavior (lose formatting) when replacing all text
        this.fld.setProp("alltext", VpcValS(newtext));
    }
}

export class VpcScriptMessage {
    clickLoc: O<number[]>;
    keymods: O<ModifierKeys>;
    keycode: O<string>;
    mouseLoc: number[] = [-1, -1];
    mouseIsDown = false;
    cmdKey = false;
    optionKey = false;
    shiftKey = false;
    msg: VpcBuiltinMsg;
    msgName: string;
    cardWhenFired: O<string>;
    causedByUserAction = false;
    constructor(public targetId: string, handler: VpcBuiltinMsg, msgName?: string) {
        if (msgName) {
            assertEq(VpcBuiltinMsg.__custom, handler, "4j|");
            this.msg = handler;
            this.msgName = msgName;
        } else {
            this.msg = handler;
            this.msgName = getEnumToStrOrUnknown<VpcBuiltinMsg>(VpcBuiltinMsg, handler, "");
            assertTrue(slength(this.msgName), "4i|got", this.msgName);
        }
    }
}

// evaluating an expression shouldn't have side effects, so
// give only this limited interface to the script visitor
export interface OutsideWorldRead {
    ElementExists(vel: RequestedVelRef): boolean;
    ReadVarContents(varname: string): VpcVal;
    IsVarDefined(varname: string): boolean;
    ResolveContainerReadable(container: RequestedContainerRef): ReadableContainer;
    ContainerRead(contref: RequestedContainerRef): string;
    GetProp(ref: O<RequestedVelRef>, prop: string, adjective: PropAdjective, chunk: O<RequestedChunk>): VpcVal;
    IsProductProp(propName: string): boolean;
    GetSelectedField(): O<VpcElField>;
    GetCurrentTool(realOrMimic: boolean): VpcTool;
    GetFrameInfo(): [VpcScriptMessage, VpcVal[]];
    GetItemDelim(): string;
    CountElements(type: VpcElType, parentref: RequestedVelRef): number;
    IsBuiltinFunction(s: string): boolean;
    CallBuiltinFunction(s: string, args: VpcVal[]): VpcVal;
}

export interface OutsideWorldReadWrite extends OutsideWorldRead {
    CreatePart(type: VpcElType, x: number, y: number, w: number, h: number): VpcElBase;
    CreateCard(indexRelativeToBg: number): VpcElBase;
    RemovePart(vel: VpcElBase): void;
    RemoveCard(vel: VpcElBase): void;
    ResolveElRef(ref: RequestedVelRef): O<VpcElBase>;

    DeclareGlobal(varname: string): void;

    SetVarContents(varname: string, v: VpcVal): void;
    SetSpecialVar(varname: string, v: VpcVal): void;
    ResolveContainerWritable(container: RequestedContainerRef): WritableContainer;

    ContainerWrite(contref: RequestedContainerRef, newcontent: string, prep: RequestedChunkTextPreposition): void;
    ContainerModify(contref: RequestedContainerRef, fn: (s: string) => string): void;
    SetProp(ref: O<RequestedVelRef>, prop: string, v: VpcVal, chunk: O<RequestedChunk>): void;
    ElementById(id: O<string>): O<VpcElBase>;

    GetOption_s(prop: string): string;
    GetOption_n(prop: string): number;
    GetOption_b(prop: string): boolean;
    SetOption<T extends ElementObserverVal>(prop: string, newval: T): void;

    GoCardRelative(pos: OrdinalOrPosition, id?: string): void;
    SimulateClick(argsGiven: number[], mods: ModifierKeys): void;
    CommitSimulatedClicks(queue: PaintOntoCanvas[]): void;
}

type PropGetter<T extends VpcElBase> = [PrpTyp, string | ((me: T) => string | number | boolean)];
type PropSetter<T extends VpcElBase> = [PrpTyp, string | ((me: T, v: string | number | boolean) => void)];

export class VpcElProductOpts extends VpcElBase {
    isVpcElProduct = true;
    protected _itemDel = ",";
    protected _script = "";
    protected _name = `${cProductName}`;
    protected _longname = `Applications:${cProductName} Folder:${cProductName}`;

    // not directly accessible by scripts,
    // but stored here to get an undoable setting
    protected _currentCardId = ""; // should always be valid, throw otherwise
    protected _currentTool = VpcTool.browse;
    protected _optWideLines = false;
    protected _currentPattern = UI512Painter.defaultPattern;
    protected _optPaintLineColor = UI512Painter.defaultLineColor;
    protected _optPaintFillColor = UI512Painter.defaultFillColor;
    protected _optUseHostClipboard = false;
    protected _viewingScript = false;
    protected _viewingScriptOfId = "";
    protected _selectedVelId = "";

    getAttributesList() {
        // none of these attributes are persisted
        return [];
    }

    getType() {
        return VpcElType.Product;
    }

    constructor(id: string, parentid: string) {
        super(id, parentid);
    }

    startGettersSetters() {
        VpcElProductOpts.prodInit();
        this.getters = VpcElProductOpts.cachedGetters;
        this.setters = VpcElProductOpts.cachedSetters;
    }

    static prodGetters(getters: { [key: string]: PropGetter<VpcElBase> }) {
        // hard-coded responses to properties
        getters["environment"] = [PrpTyp.str, () => "development"];
        getters["freesize"] = [PrpTyp.num, () => 0];
        getters["size"] = [PrpTyp.num, () => 0];
        getters["stacksinuse"] = [PrpTyp.str, () => ""];
        getters["suspended"] = [PrpTyp.bool, () => false];
        getters["version/long"] = [PrpTyp.str, () => vpcversion];
        getters["version"] = [PrpTyp.str, () => vpcversion[0] + "." + vpcversion[1]];

        getters["itemdelimiter"] = [PrpTyp.str, "itemDel"];
        getters["cursor"] = [
            PrpTyp.str,
            (me: VpcElProductOpts) => {
                let curs = UI512CursorAccess.getCursor();
                return getEnumToStrOrUnknown<UI512Cursors>(UI512Cursors, curs);
            },
        ];
    }

    static prodSetters(setters: { [key: string]: PropSetter<VpcElBase> }) {
        setters["itemdelimiter"] = [
            PrpTyp.str,
            (me: VpcElProductOpts, s: string) => {
                checkThrowEq(1, s.length, `7C|length of itemdel must be 1`);
                me.set("itemDel", s);
            },
        ];

        setters["cursor"] = [
            PrpTyp.str,
            (me: VpcElProductOpts, s: string) => {
                if (s === "1") {
                    s = "beam";
                } else if (s === "2") {
                    s = "cross";
                } else if (s === "3") {
                    s = "plus";
                } else if (s === "4") {
                    s = "watch";
                }

                let n = getStrToEnum<UI512Cursors>(UI512Cursors, `cursor ${s} not supported`, s);
                UI512CursorAccess.setCursor(n);
            },
        ];
    }

    static cachedGetters: { [key: string]: PropGetter<VpcElBase> };
    static cachedSetters: { [key: string]: PropSetter<VpcElBase> };
    static prodInit() {
        if (!VpcElProductOpts.cachedGetters || !VpcElProductOpts.cachedSetters) {
            VpcElProductOpts.cachedGetters = {};
            VpcElProductOpts.prodGetters(VpcElProductOpts.cachedGetters);
            VpcElProductOpts.cachedSetters = {};
            VpcElProductOpts.prodSetters(VpcElProductOpts.cachedSetters);
            Util512.freezeRecurse(VpcElProductOpts.cachedGetters);
            Util512.freezeRecurse(VpcElProductOpts.cachedSetters);
        }
    }

    static canGetProductProp(propName: string) {
        VpcElProductOpts.prodInit();
        return !!VpcElProductOpts.cachedGetters[propName] || !!VpcElProductOpts.cachedSetters[propName];
    }

    static isAnyProp(propName: string) {
        VpcElButton.btnInit();
        VpcElField.fldInit();
        VpcElCard.cdInit();
        VpcElBg.bgInit();
        VpcElStack.stackInit();
        VpcElProductOpts.prodInit();
        return (
            !!VpcElButton.cachedGetters[propName] ||
            !!VpcElButton.cachedSetters[propName] ||
            !!VpcElField.cachedGetters[propName] ||
            !!VpcElField.cachedSetters[propName] ||
            !!VpcElCard.cachedGetters[propName] ||
            !!VpcElCard.cachedSetters[propName] ||
            !!VpcElBg.cachedGetters[propName] ||
            !!VpcElBg.cachedSetters[propName] ||
            !!VpcElStack.cachedGetters[propName] ||
            !!VpcElStack.cachedSetters[propName] ||
            !!VpcElProductOpts.cachedGetters[propName] ||
            !!VpcElProductOpts.cachedSetters[propName]
        );
    }
}
