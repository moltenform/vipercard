
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr, scontains, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEq, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512PaintDispatch } from '../../ui512/draw/ui512DrawPaintDispatch.js';
/* auto */ import { ElementObserverVal } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { OrdinalOrPosition, PropAdjective, VpcChunkPreposition, VpcElType, VpcTool, toolToDispatchShapes } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { ReadableContainer, VpcScriptMessage, WritableContainer } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcVal, VpcValS } from '../../vpc/vpcutils/vpcVal.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcChunk.js';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from '../../vpc/vpcutils/vpcRequestedReference.js';
/* auto */ import { VpcElBase, VpcElSizable } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velStack.js';
/* auto */ import { VpcElProductOpts } from '../../vpc/vel/velProductOpts.js';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite } from '../../vpc/vel/velOutsideInterfaces.js';
/* auto */ import { ReadableContainerField, ReadableContainerVar, WritableContainerField, WritableContainerVar } from '../../vpc/vel/velResolveReference.js';
/* auto */ import { VelResolveId, VelResolveName, VelResolveReference } from '../../vpc/vel/velResolveName.js';
/* auto */ import { VpcBuiltinFunctions } from '../../vpc/codepreparse/vpcScriptFunctions.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpcCheckReserved.js';
/* auto */ import { CodeExecFrame } from '../../vpc/codeexec/vpcScriptExecFrame.js';
/* auto */ import { CodeExecFrameStack } from '../../vpc/codeexec/vpcScriptExecFrameStack.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';

// friendly interface exposed to ui and scripts
export class VpcOutsideWorld implements OutsideWorldReadWrite {
    readonly builtinFns: VpcBuiltinFunctions;
    protected readonly check = new CheckReservedWords();
    appli: VpcStateInterface;
    constructor() {
        this.builtinFns = new VpcBuiltinFunctions(this as OutsideWorldRead);
    }

    CreatePart(type: VpcElType, x: number, y: number, w: number, h: number) {
        let currentCardId = this.GetOption_s('currentCardId');
        let currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
        let el = this.appli.createElem(currentCardId, type, -1) as VpcElSizable;
        assertTrue(el && el.isVpcElSizable, '6u|not VpcElSizable');
        el.setDimensions(x, y, w, h);
        return el;
    }

    CreateCard(indexRelativeToBg: number) {
        let currentCardId = this.GetOption_s('currentCardId');
        let currentCard = this.appli.getModel().getById(currentCardId, VpcElCard);
        return this.appli.createElem(currentCard.parentId, VpcElType.Card, indexRelativeToBg);
    }

    RemovePart(vel: VpcElBase) {
        this.appli.removeElem(vel);
    }

    RemoveCard(vel: VpcElBase) {
        this.appli.removeElem(vel);
    }

    ResolveElRef(ref: RequestedVelRef): O<VpcElBase> {
        let target: O<VpcElBase>;
        let me: O<VpcElBase>;
        let [frstack, frame] = this.appli.findExecFrameStack();
        if (frame) {
            target = this.appli.getModel().findByIdUntyped(frame.message.targetId);
            me = this.appli.getModel().findByIdUntyped(frame.codeSection.ownerId);
        }

        let resolver = new VelResolveReference(this.appli.getModel());
        let ret = resolver.go(ref, me, target);
        checkThrow(
            !ret || !scontains(ret.getS('name'), '$$'),
            `names with $$ are reserved for internal ViperCard objects.`
        );
        return ret;
    }

    ElementExists(vel: RequestedVelRef): boolean {
        return this.ResolveElRef(vel) !== undefined;
    }

    CountElements(type: VpcElType, parentRef: RequestedVelRef): number {
        let parent = throwIfUndefined(this.ResolveElRef(parentRef), '6t|Cannot find this element');
        let parentAsCard = parent as VpcElCard;
        let parentAsBg = parent as VpcElBg;
        let parentAsStack = parent as VpcElStack;
        if (type === VpcElType.Product) {
            return 1;
        } else if (type === VpcElType.Stack) {
            return 1;
        } else if (type === VpcElType.Bg && parentAsStack.isVpcElStack) {
            return parentAsStack.bgs.length;
        } else if (type === VpcElType.Card && parentAsStack.isVpcElStack) {
            return parentAsStack.bgs.map(bg => bg.cards.length).reduce(Util512.add);
        } else if (type === VpcElType.Card && parentAsBg.isVpcElBg) {
            return parentAsBg.cards.length;
        } else if ((type === VpcElType.Btn || type === VpcElType.Fld) && parentAsBg.isVpcElBg) {
            return parentAsBg.parts.filter(ch => ch.getType() === type).length;
        } else if ((type === VpcElType.Btn || type === VpcElType.Fld) && parentAsCard.isVpcElCard) {
            return parentAsCard.parts.filter(ch => ch.getType() === type && !VpcElBase.isActuallyMsgRepl(ch)).length;
        } else {
            throw makeVpcScriptErr(`6s|cannot count types ${type} parent of type ${parent.getType()} ${parent.id}`);
        }
    }

    GetItemDelim() {
        let ret = this.GetOption_s('itemDel');
        assertEq(1, ret.length, '6r|invalid itemDel', ret);
        return ret;
    }

    DeclareGlobal(varName: string) {
        assertTrue(slength(varName), '6q|bad varName', varName);
        let [frstack, frame] = this.getExecFrameStack();
        frame.declaredGlobals[varName] = true;
    }

    IsVarDefined(varName: string) {
        let [frstack, frame] = this.getExecFrameStack();
        return !!(
            frstack.constants.find(varName) ||
            (frame.declaredGlobals[varName] && frstack.globals.find(varName)) ||
            frame.locals.find(varName)
        );
    }

    ReadVarContents(varName: string): VpcVal {
        assertTrue(slength(varName), '6p|bad varName', varName);
        let [frstack, frame] = this.getExecFrameStack();
        let found = frstack.constants.find(varName);
        if (found) {
            return found;
        }

        found = frstack.globals.find(varName);
        if (found && frame.declaredGlobals[varName] !== undefined) {
            return found;
        }

        found = frame.locals.find(varName);
        return throwIfUndefined(
            found,
            '6o|no variable found with this name. please put contents into before reading from it.',
            varName
        );
    }

    SetVarContents(varName: string, v: VpcVal): void {
        assertTrue(slength(varName), '6n|bad varName', varName);
        let [frstack, frame] = this.getExecFrameStack();
        let found = frstack.constants.find(varName);
        if (found) {
            throw makeVpcScriptErr(`6m|name not allowed ${varName}, it is a constant`);
        }

        checkThrow(this.check.okLocalVar(varName), '8>|variable name not allowed', varName);
        if (frame.declaredGlobals[varName] !== undefined) {
            frstack.globals.set(varName, v);
        } else {
            frame.locals.set(varName, v);
        }
    }

    SetSpecialVar(varName: string, v: VpcVal): void {
        checkThrow(varName === 'it', '8=|only supported for it');
        let [frstack, frame] = this.getExecFrameStack();
        frame.locals.set(varName, v);
    }

    ResolveContainerReadable(container: RequestedContainerRef): ReadableContainer {
        checkThrow(container.isRequestedContainerRef, '8<|not a valid container');
        if (container.vel) {
            let resolved = this.ResolveElRef(container.vel) as VpcElBase;
            checkThrow(resolved && resolved.isVpcElBase, `8;|element not found`);
            return new ReadableContainerField(resolved);
        } else if (container.variable) {
            return new ReadableContainerVar(this as OutsideWorldRead, container.variable);
        } else {
            throw makeVpcScriptErr(`6l|invalid IntermedValContainer, nothing set`);
        }
    }

    ResolveContainerWritable(container: RequestedContainerRef): WritableContainer {
        if (container.vel) {
            let resolved = this.ResolveElRef(container.vel) as VpcElBase;
            checkThrow(resolved && resolved.isVpcElBase, `8:|element not found`);
            return new WritableContainerField(resolved);
        } else if (container.variable) {
            return new WritableContainerVar(this, container.variable);
        } else {
            throw makeVpcScriptErr(`6k|invalid IntermedValContainer, nothing set`);
        }
    }

    ContainerRead(contRef: RequestedContainerRef): string {
        let cont = this.ResolveContainerReadable(contRef);
        return ChunkResolution.applyRead(cont, contRef.chunk, this.GetItemDelim());
    }

    ContainerWrite(contRef: RequestedContainerRef, newContent: string, prep: VpcChunkPreposition) {
        let cont = this.ResolveContainerWritable(contRef);
        return ChunkResolution.applyPut(cont, contRef.chunk, this.GetItemDelim(), newContent, prep);
    }

    ContainerModify(contRef: RequestedContainerRef, fn: (s: string) => string) {
        let cont = this.ResolveContainerWritable(contRef);
        return ChunkResolution.applyModify(cont, contRef.chunk, this.GetItemDelim(), fn);
    }

    GetSelectedField(): O<VpcElField> {
        return this.appli.getCurrentFocusVelField();
    }

    SetProp(ref: O<RequestedVelRef>, prop: string, v: VpcVal, chunk: O<RequestedChunk>): void {
        let vel = (ref ? this.ResolveElRef(ref) : this.appli.getModel().productOpts) as VpcElBase;
        checkThrow(vel && vel.isVpcElBase, `8/|could not set ${prop} because could not find the specified element.`);
        if (chunk) {
            let fld = vel as VpcElField;
            checkThrow(fld.isVpcElField, `8.|can only say 'set the (prop) of char 1 to 2' on fields.`);
            fld.specialSetPropChunk(prop, chunk, v, this.GetItemDelim());
        } else {
            vel.setProp(prop, v);
        }
    }

    GetProp(ref: O<RequestedVelRef>, prop: string, adjective: PropAdjective, chunk: O<RequestedChunk>): VpcVal {
        let vel = (ref ? this.ResolveElRef(ref) : this.appli.getModel().productOpts) as VpcElBase;
        checkThrow(vel && vel.isVpcElBase, `8-|could not get ${prop} because could not find the specified element.`);
        let resolver = new VelResolveName(this.appli.getModel());
        if (chunk) {
            let fld = vel as VpcElField;
            checkThrow(fld.isVpcElField, `8,|can only say 'get the (prop) of char 1 to 2' on fields.`);
            return fld.specialGetPropChunk(prop, chunk, this.GetItemDelim());
        } else if (prop === 'owner') {
            return VpcValS(resolver.getOwnerName(vel, adjective));
        } else if (prop === 'name') {
            return VpcValS(resolver.go(vel, adjective));
        } else if (prop === 'id') {
            let resId = new VelResolveId(this.appli.getModel());
            return VpcValS(resId.go(vel, adjective));
        } else if (prop === 'target') {
            // target should use prop not function since it takes an adjective
            checkThrow(!ref, "8+|must say 'get the target' and not 'get the target of cd btn 1");
            let newref = new RequestedVelRef(VpcElType.Unknown);
            newref.isReferenceToTarget = true;
            let velTarget = this.ResolveElRef(newref);
            if (velTarget) {
                return VpcValS(resolver.go(velTarget, adjective));
            } else {
                return VpcVal.Empty;
            }
        } else {
            if (prop === 'version' && adjective === PropAdjective.long) {
                prop = 'version/long';
            } else if (adjective !== PropAdjective.empty) {
                throw makeVpcScriptErr(
                    `6j|this property does not take an adjective like long (the long name of cd btn 1)`
                );
            }

            return vel.getProp(prop);
        }
    }

    IsProductProp(propName: string): boolean {
        return VpcElProductOpts.canGetProductProp(propName);
    }

    GetCurrentTool(realOrMimic: boolean): VpcTool {
        return this.GetOption_n(realOrMimic ? 'currentTool' : 'mimicCurrentTool');
    }

    IsBuiltinFunction(s: string): boolean {
        return VpcBuiltinFunctions.isFunction(s);
    }

    CallBuiltinFunction(s: string, args: VpcVal[]): VpcVal {
        return this.builtinFns.call(s, args);
    }

    GetFrameInfo(): [VpcScriptMessage, VpcVal[]] {
        let [frstack, frame] = this.getExecFrameStack();
        return [frame.message, frame.args];
    }

    GetOption_s(prop: string): string {
        return this.appli.getOption_s(prop);
    }

    GetOption_n(prop: string): number {
        return this.appli.getOption_n(prop);
    }

    GetOption_b(prop: string): boolean {
        return this.appli.getOption_b(prop);
    }

    SetOption<T extends ElementObserverVal>(prop: string, newval: T) {
        this.appli.setOption(prop, newval);
    }

    ElementById(id: O<string>): O<VpcElBase> {
        return this.appli.getModel().findByIdUntyped(id);
    }

    GoCardRelative(pos: OrdinalOrPosition, id?: string) {
        if (id) {
            assertEq(OrdinalOrPosition.this, pos, '6i|');
            this.appli.getModel().productOpts.set('currentCardId', id);
        } else {
            this.appli.getModel().goCardRelative(pos);
        }
    }

    paintOptionsFromCurrentOptions(realOrMimic: boolean, mods: ModifierKeys) {
        let tl = this.GetCurrentTool(realOrMimic);
        let fromOptsPattern = this.GetOption_s('currentPattern');
        let fromOptsFillcolor = this.GetOption_n('optPaintFillColor');
        let fromOptsLineColor = this.GetOption_n('optPaintLineColor');
        let fromOptsWide = this.GetOption_b('optWideLines');
        let ret = UI512PaintDispatch.fromMemoryOpts(
            toolToDispatchShapes(tl),
            tl === VpcTool.Eraser,
            fromOptsPattern,
            fromOptsFillcolor,
            fromOptsLineColor,
            fromOptsWide
        );
        ret.cardId = this.GetOption_s('currentCardId');
        ret.mods = mods;
        return ret;
    }

    SimulateClick(argsGiven: number[], mods: ModifierKeys): void {
        let mimcTool = this.GetCurrentTool(false);
        checkThrow(
            mimcTool !== VpcTool.Browse,
            '7R|please first run something like \'choose "pencil" tool\' to specify which tool to draw with'
        );
        let args = this.paintOptionsFromCurrentOptions(false, mods);
        for (let i = 0; i < argsGiven.length; i += 2) {
            args.xPts.push(argsGiven[i]);
            args.yPts.push(argsGiven[i + 1]);
        }

        let [frstack, frame] = this.getExecFrameStack();
        frstack.paintQueue.push(args);
    }

    CommitSimulatedClicks(queue: UI512PaintDispatch[]): void {
        this.appli.commitSimulatedClicks(queue);
    }

    protected getExecFrameStack(): [CodeExecFrameStack, CodeExecFrame] {
        let [frstack, frame] = this.appli.findExecFrameStack();
        if (frstack && frame) {
            return [frstack, frame];
        } else {
            assertTrue(false, '6h|could not find execution frame');
            throw makeVpcScriptErr('6g|could not find execution frame');
        }
    }
}
