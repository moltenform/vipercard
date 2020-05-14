
/* auto */ import { VpcVal } from './../vpcutils/vpcVal';
/* auto */ import { ReadableContainer, VpcScriptMessage, WritableContainer } from './../vpcutils/vpcUtils';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { PropAdjective, VpcElType, VpcTool } from './../vpcutils/vpcEnums';
/* auto */ import { RequestedChunk } from '../vpcutils/vpcChunkResolutionUtils';
/* auto */ import { VpcModelTop } from './velModelTop';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElBase } from './velBase';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { ValHolder } from './../../ui512/utils/util512';
/* auto */ import { ElementObserverVal } from './../../ui512/elements/ui512ElementGettable';
/* auto */ import { UI512PaintDispatch } from './../../ui512/draw/ui512DrawPaintDispatch';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * OutsideWorldRead:
 * provides scripts with a read-only view of the "world".
 * we've decided that when a script evaluates an expression, this should be pure,
 * with no side effects, and so when evaluating we only provide an interface with read-only ability.
 */
export interface OutsideWorldRead {
    /**
     * try resolving a RequestedVelRef, if succeeds return its long id
     * if resolution fails, return undefined
     */
    ElementExists(vel: RequestedVelRef): O<string>;

    /**
     * read variable contents
     */
    ReadVarContents(varName: string): VpcVal;

    /**
     * is a variable defined
     */
    IsVarDefined(varName: string): boolean;

    /**
     * resolve a reference to a container,
     * throws if the requested vel does not exist
     */
    ResolveContainerReadable(contRef: RequestedContainerRef): ReadableContainer;

    /**
     * read text from a container
     */
    ContainerRead(contRef: RequestedContainerRef): string;

    /**
     * high-level get property of a vel, returns VpcVal
     */
    GetProp(ref: RequestedVelRef, prop: string, adjective: PropAdjective, chunk: O<RequestedChunk>): VpcVal;

    /**
     * is this a runtime property on the 'product' object?
     */
    IsProductProp(propName: string): boolean;

    /**
     * get the focused vel
     */
    GetSelectedField(): O<VpcElField>;

    /**
     * get the selected text chunk
     */
    GetSelectedTextChunk(): O<RequestedContainerRef>;

    /**
     * get the current tool, specify the 'real' tool or the 'simulated' tool chosen by a script
     */
    GetCurrentTool(realOrMimic: boolean): VpcTool;

    /**
     * get code execution frame information
     */
    GetFrameInfo(): [VpcScriptMessage, VpcVal[]];

    /**
     * get the current "item delemiter" to know how to interpret 'get item 3 of "a,b,c"'
     */
    GetItemDelim(): string;

    /**
     * count the number of elements of a certain type
     */
    CountElements(type: VpcElType, parentRef: RequestedVelRef): number;

    /**
     * is this a built-in function
     */
    IsBuiltinFunction(s: string): boolean;

    /**
     * call a built-in function
     */
    CallBuiltinFunction(s: string, args: VpcVal[]): VpcVal;

    /**
     * get the current card
     */
    GetCurrentCardId(): string;

    /**
     * perform a "domenu" action
     */
    DoMenuAction(arg1: string, arg2: string): string;
}

/**
 * OutsideWorldReadWrite:
 * provides scripts with access to the outside "world".
 *
 * this interface helps with layering.
 */
export interface OutsideWorldReadWrite extends OutsideWorldRead {
    /**
     * create a vel and add it to the model
     */
    CreatePart(type: VpcElType, x: number, y: number, w: number, h: number): VpcElBase;

    /**
     * create a card and add it to the model
     */
    CreateCard(indexRelativeToBg: number): VpcElBase;

    /**
     * remove a vel from the model
     */
    RemovePart(vel: VpcElBase): void;

    /**
     * remove a card
     */
    RemoveCard(vel: VpcElBase): void;

    /**
     * resolve reference to a vel
     */
    ResolveVelRef(ref: RequestedVelRef): O<VpcElBase>;

    /**
     * declare a global
     */
    DeclareGlobal(varName: string): void;

    /**
     * set variable contents
     */
    SetVarContents(varName: string, v: VpcVal): void;

    /**
     * set variable contents (allows access to special vars like "it")
     */
    SetSpecialVar(varName: string, v: VpcVal): void;

    /**
     * resolve reference to writable container
     * throws if the requested vel does not exist
     */
    ResolveContainerWritable(contRef: RequestedContainerRef): WritableContainer;

    /**
     * modify a container
     */
    ContainerModify(contRef: RequestedContainerRef, fn: (s: string) => string): void;

    /**
     * high-level property set on a vel
     */
    SetProp(ref: RequestedVelRef, prop: string, v: VpcVal, chunk: O<RequestedChunk>): void;

    /**
     * access the model
     */
    Model(): VpcModelTop;

    /**
     * get a runtime (non-persisted) string value
     */
    GetOptionS(prop: string): string;

    /**
     * get a runtime (non-persisted) numeric value
     */
    GetOptionN(prop: string): number;

    /**
     * get a runtime (non-persisted) boolean value
     */
    GetOptionB(prop: string): boolean;

    /**
     * set a runtime (non-persisted) value
     */
    SetOption<T extends ElementObserverVal>(prop: string, newVal: T): void;

    /**
     * go straight to a card without calling closecard or opencard
     */
    SetCurCardNoOpenCardEvt(id: string): void;

    /**
     * draw paint on the screen by simulating a click
     */
    SimulateClick(argsGiven: number[], mods: ModifierKeys): void;

    /**
     * commit simulated clicks to the screen
     */
    CommitSimulatedClicks(queue: UI512PaintDispatch[]): void;

    /**
     * append text to the message box
     * ignored if the message box is not currently open
     */
    WriteToReplMessageBox(s: string, returnFocus: boolean): void;

    /**
     * get access to FieldsRecentlyEdited, used to determine
     * whether we should call openField or exitField
     */
    GetFieldsRecentlyEdited(): ValHolder<{ [id: string]: boolean }>;
}
