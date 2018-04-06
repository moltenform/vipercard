
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEq, getEnumToStrOrUnknown, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { PaintOntoCanvas } from '../../ui512/draw/ui512ImageSerialize.js';
/* auto */ import { ElementObserverVal } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { OrdinalOrPosition, PropAdjective, RequestedChunkTextPreposition, VpcBuiltinMsg, VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { ReadableContainer, WritableContainer } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcVal } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { RequestedChunk } from '../../vpc/vpcutils/vpcChunk.js';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from '../../vpc/vpcutils/vpcOutsideClasses.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';

export class VpcScriptMessage {
    clickLoc: O<number[]>;
    keymods: O<ModifierKeys>;
    keychar: O<string>;
    keyrepeated: O<boolean>;
    cmdKey: O<boolean>;
    optionKey: O<boolean>;
    shiftKey: O<boolean>;
    mouseLoc: number[] = [-1, -1];
    mouseIsDown = false;
    msg: VpcBuiltinMsg;
    msgName: string;
    cardWhenFired: O<string>;
    causedByUserAction = false;
    constructor(public targetId: string, handler: VpcBuiltinMsg, msgName?: string) {
        if (msgName) {
            assertEq(VpcBuiltinMsg.__custom, handler, '4j|');
            this.msg = handler;
            this.msgName = msgName;
        } else {
            this.msg = handler;
            this.msgName = getEnumToStrOrUnknown<VpcBuiltinMsg>(VpcBuiltinMsg, handler, '');
            assertTrue(slength(this.msgName), '4i|got', this.msgName);
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
