
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512PaintDispatch } from '../../ui512/draw/ui512DrawPaintDispatch.js';
/* auto */ import { ElementObserverVal } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { OrdinalOrPosition, PropAdjective, VpcChunkPreposition, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { ReadableContainer, VpcScriptMessage, WritableContainer } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcVal } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { RequestedChunk } from '../../vpc/vpcutils/vpcChunk.js';
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
    ElementExists(vel: RequestedVelRef): boolean;
    ReadVarContents(varName: string): VpcVal;
    IsVarDefined(varName: string): boolean;
    ResolveContainerReadable(contRef: RequestedContainerRef): ReadableContainer;
    ContainerRead(contRef: RequestedContainerRef): string;
    GetProp(ref: O<RequestedVelRef>, prop: string, adjective: PropAdjective, chunk: O<RequestedChunk>): VpcVal;
    IsProductProp(propName: string): boolean;
    GetSelectedField(): O<VpcElField>;
    GetCurrentTool(realOrMimic: boolean): VpcTool;
    GetFrameInfo(): [VpcScriptMessage, VpcVal[]];
    GetItemDelim(): string;
    CountElements(type: VpcElType, parentRef: RequestedVelRef): number;
    IsBuiltinFunction(s: string): boolean;
    CallBuiltinFunction(s: string, args: VpcVal[]): VpcVal;
}

/**
 * OutsideWorldReadWrite:
 * provides scripts with access to the outside "world".
 *
 * this interface helps with testability; a test can provide make a mock implementation of this interface.
 */
export interface OutsideWorldReadWrite extends OutsideWorldRead {
    CreatePart(type: VpcElType, x: number, y: number, w: number, h: number): VpcElBase;
    CreateCard(indexRelativeToBg: number): VpcElBase;
    RemovePart(vel: VpcElBase): void;
    RemoveCard(vel: VpcElBase): void;
    ResolveElRef(ref: RequestedVelRef): O<VpcElBase>;
    DeclareGlobal(varName: string): void;
    SetVarContents(varName: string, v: VpcVal): void;
    SetSpecialVar(varName: string, v: VpcVal): void;
    ResolveContainerWritable(contRef: RequestedContainerRef): WritableContainer;
    ContainerWrite(contRef: RequestedContainerRef, newContent: string, prep: VpcChunkPreposition): void;
    ContainerModify(contRef: RequestedContainerRef, fn: (s: string) => string): void;
    SetProp(ref: O<RequestedVelRef>, prop: string, v: VpcVal, chunk: O<RequestedChunk>): void;
    ElementById(id: O<string>): O<VpcElBase>;
    GetOption_s(prop: string): string;
    GetOption_n(prop: string): number;
    GetOption_b(prop: string): boolean;
    SetOption<T extends ElementObserverVal>(prop: string, newval: T): void;
    GoCardRelative(pos: OrdinalOrPosition, id?: string): void;
    SimulateClick(argsGiven: number[], mods: ModifierKeys): void;
    CommitSimulatedClicks(queue: UI512PaintDispatch[]): void;
}
