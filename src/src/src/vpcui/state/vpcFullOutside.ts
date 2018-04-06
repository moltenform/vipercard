
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr, scontains, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEq, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ModifierKeys } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { PaintOntoCanvas } from '../../ui512/draw/ui512imageserialize.js';
/* auto */ import { ElementObserverVal } from '../../ui512/elements/ui512elementsgettable.js';
/* auto */ import { OrdinalOrPosition, PropAdjective, RequestedChunkTextPreposition, VpcElType, VpcTool, toolToPaintOntoCanvasShapes } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { ReadableContainer, WritableContainer } from '../../vpc/vpcutils/vpcutils.js';
/* auto */ import { VpcVal, VpcValS } from '../../vpc/vpcutils/vpcval.js';
/* auto */ import { ChunkResolution, RequestedChunk } from '../../vpc/vpcutils/vpcchunk.js';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from '../../vpc/vpcutils/vpcoutsideclasses.js';
/* auto */ import { VpcElBase, VpcElSizable } from '../../vpc/vel/velbase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velfield.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velcard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velbg.js';
/* auto */ import { VpcElStack } from '../../vpc/vel/velstack.js';
/* auto */ import { VpcElProductOpts } from '../../vpc/vel/velproductopts.js';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite, VpcScriptMessage } from '../../vpc/vel/vpcoutsideinterfaces.js';
/* auto */ import { ReadableContainerField, ReadableContainerVar, WritableContainerField, WritableContainerVar } from '../../vpc/vel/velresolvereference.js';
/* auto */ import { VelResolveName } from '../../vpc/vel/velresolvename.js';
/* auto */ import { VpcBuiltinFunctions } from '../../vpc/codepreparse/vpcscriptfunctions.js';
/* auto */ import { CheckReservedWords } from '../../vpc/codepreparse/vpccheckreserved.js';
/* auto */ import { CodeExecFrame } from '../../vpc/codeexec/vpcscriptexecframe.js';
/* auto */ import { CodeExecFrameStack } from '../../vpc/codeexec/vpcscriptexecframestack.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcappli.js';

// friendly interface exposed to ui and scripts
export class VpcOutsideWorld implements OutsideWorldReadWrite {
    readonly builtinFns: VpcBuiltinFunctions;
    protected readonly check = new CheckReservedWords();
    appli: IVpcStateInterface;
    constructor(protected lang: UI512Lang) {
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

        let resolver = new VelResolveName(this.appli.getModel());
        let ret = resolver.resolveReference(ref, me, target);
        checkThrow(
            !ret || !scontains(ret.get_s('name'), '$$'),
            `names with $$ are reserved for internal ViperCard objects.`
        );
        return ret;
    }

    ElementExists(vel: RequestedVelRef): boolean {
        return this.ResolveElRef(vel) !== undefined;
    }

    CountElements(type: VpcElType, parentref: RequestedVelRef): number {
        let parent = throwIfUndefined(this.ResolveElRef(parentref), '6t|Cannot find this element');
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

    DeclareGlobal(varname: string) {
        assertTrue(slength(varname), '6q|bad varname', varname);
        let [frstack, frame] = this.getExecFrameStack();
        frame.declaredGlobals[varname] = true;
    }

    IsVarDefined(varname: string) {
        let [frstack, frame] = this.getExecFrameStack();
        return !!(
            frstack.constants.find(varname) ||
            (frame.declaredGlobals[varname] && frstack.globals.find(varname)) ||
            frame.locals.find(varname)
        );
    }

    ReadVarContents(varname: string): VpcVal {
        assertTrue(slength(varname), '6p|bad varname', varname);
        let [frstack, frame] = this.getExecFrameStack();
        let found = frstack.constants.find(varname);
        if (found) {
            return found;
        }

        found = frstack.globals.find(varname);
        if (found && frame.declaredGlobals[varname] !== undefined) {
            return found;
        }

        found = frame.locals.find(varname);
        return throwIfUndefined(
            found,
            '6o|no variable found with this name. please put contents into before reading from it.',
            varname
        );
    }

    SetVarContents(varname: string, v: VpcVal): void {
        assertTrue(slength(varname), '6n|bad varname', varname);
        let [frstack, frame] = this.getExecFrameStack();
        let found = frstack.constants.find(varname);
        if (found) {
            throw makeVpcScriptErr(`6m|name not allowed ${varname}, it is a constant`);
        }

        checkThrow(this.check.okLocalVar(varname), '8>|variable name not allowed', varname);
        if (frame.declaredGlobals[varname] !== undefined) {
            frstack.globals.set(varname, v);
        } else {
            frame.locals.set(varname, v);
        }
    }

    SetSpecialVar(varname: string, v: VpcVal): void {
        checkThrow(varname === 'it', '8=|only supported for it');
        let [frstack, frame] = this.getExecFrameStack();
        frame.locals.set(varname, v);
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

    ContainerRead(contref: RequestedContainerRef): string {
        let cont = this.ResolveContainerReadable(contref);
        return ChunkResolution.applyRead(cont, contref.chunk, this.GetItemDelim());
    }

    ContainerWrite(contref: RequestedContainerRef, newcontent: string, prep: RequestedChunkTextPreposition) {
        let cont = this.ResolveContainerWritable(contref);
        return ChunkResolution.applyPut(cont, contref.chunk, this.GetItemDelim(), newcontent, prep);
    }

    ContainerModify(contref: RequestedContainerRef, fn: (s: string) => string) {
        let cont = this.ResolveContainerWritable(contref);
        return ChunkResolution.applyModify(cont, contref.chunk, this.GetItemDelim(), fn);
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
            return VpcValS(resolver.getUserFormattedName(vel, adjective));
        } else if (prop === 'id') {
            return VpcValS(resolver.getUserFormattedId(vel, adjective));
        } else if (prop === 'target') {
            // target should use prop not function since it takes an adjective
            checkThrow(!ref, "8+|must say 'get the target' and not 'get the target of cd btn 1");
            let newref = new RequestedVelRef(VpcElType.Unknown);
            newref.isReferenceToTarget = true;
            let velTarget = this.ResolveElRef(newref);
            if (velTarget) {
                return VpcValS(resolver.getUserFormattedName(velTarget, adjective));
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

    Lang(): UI512Lang {
        return this.lang;
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
        let ret = PaintOntoCanvas.fromMemoryOpts(
            toolToPaintOntoCanvasShapes(tl),
            tl === VpcTool.eraser,
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
            mimcTool !== VpcTool.browse,
            '7R|please first run something like \'choose "pencil" tool\' to specify which tool to draw with'
        );
        let args = this.paintOptionsFromCurrentOptions(false, mods);
        for (let i = 0; i < argsGiven.length; i += 2) {
            args.xpts.push(argsGiven[i]);
            args.ypts.push(argsGiven[i + 1]);
        }

        let [frstack, frame] = this.getExecFrameStack();
        frstack.paintQueue.push(args);
    }

    CommitSimulatedClicks(queue: PaintOntoCanvas[]): void {
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
