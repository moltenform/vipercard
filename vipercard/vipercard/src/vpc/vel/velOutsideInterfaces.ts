
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512PaintDispatch } from '../../ui512/draw/ui512DrawPaintDispatch.js';
/* auto */ import { ElementObserverVal } from '../../ui512/elements/ui512ElementGettable.js';
/* auto */ import { PropAdjective, VpcChunkPreposition, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { ReadableContainer, VpcScriptMessage, WritableContainer } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcVal } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { RequestedChunk } from '../../vpc/vpcutils/vpcChunkResolution.js';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from '../../vpc/vpcutils/vpcRequestedReference.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';

/**
 * OutsideWorldRead:
 * provides scripts with a read-only view of the "world".
 * we've decided that when a script evaluates an expression, this should be pure,
 * with no side effects, and so when evaluating we only provide an interface with read-only ability.
 *
 * this interface helps with testability; a test can provide make a mock implementation of this interface.
 */
export interface OutsideWorldRead {
    /**
     * try resolving a RequestedVelRef, and if resolution fails, return false
     */
    ElementExists(vel: RequestedVelRef): boolean;

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
    GetProp(ref: O<RequestedVelRef>, prop: string, adjective: PropAdjective, chunk: O<RequestedChunk>): VpcVal;

    /**
     * is this a runtime property on the 'product' object?
     */
    IsProductProp(propName: string): boolean;

    /**
     * get the focused vel
     */
    GetSelectedField(): O<VpcElField>;

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
}

/**
 * OutsideWorldReadWrite:
 * provides scripts with access to the outside "world".
 *
 * this interface helps with testability; a test can provide make a mock implementation of this interface.
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
     * write to a container
     */
    ContainerWrite(contRef: RequestedContainerRef, newContent: string, prep: VpcChunkPreposition): void;

    /**
     * modify a container
     */
    ContainerModify(contRef: RequestedContainerRef, fn: (s: string) => string): void;

    /**
     * high-level property set on a vel
     */
    SetProp(ref: O<RequestedVelRef>, prop: string, v: VpcVal, chunk: O<RequestedChunk>): void;

    /**
     * find element by id
     */
    FindVelById(id: O<string>): O<VpcElBase>;

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
    SetCurCardNoOpenCardEvt(id: string):void

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
    WriteToReplMessageBox(s:string):void;
}
