
/* auto */ import { VpcVal, VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { ReadableContainer, RememberHistory, VpcScriptMessage, WritableContainer } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { VpcExecFrameStack } from './../../vpc/codeexec/vpcScriptExecFrameStack';
/* auto */ import { VpcExecFrame } from './../../vpc/codeexec/vpcScriptExecFrame';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from './../../vpc/vpcutils/vpcRequestedReference';
/* auto */ import { VpcStateInterface } from './vpcInterface';
/* auto */ import { PropAdjective, VpcChunkPreposition, VpcElType, VpcTool, toolToDispatchShapes } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { ChunkResolution, RequestedChunk } from './../../vpc/vpcutils/vpcChunkResolution';
/* auto */ import { CheckReservedWords } from './../../vpc/codepreparse/vpcCheckReserved';
/* auto */ import { VpcBuiltinFunctions } from './../../vpc/codepreparse/vpcBuiltinFunctions';
/* auto */ import { VpcElStack } from './../../vpc/vel/velStack';
/* auto */ import { VelResolveId, VelResolveName, VelResolveReference } from './../../vpc/vel/velResolveName';
/* auto */ import { ReadableContainerField, ReadableContainerVar, WritableContainerField, WritableContainerVar } from './../../vpc/vel/velResolveContainer';
/* auto */ import { VpcElProductOpts } from './../../vpc/vel/velProductOpts';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite } from './../../vpc/vel/velOutsideInterfaces';
/* auto */ import { VpcElField } from './../../vpc/vel/velField';
/* auto */ import { VpcElCard } from './../../vpc/vel/velCard';
/* auto */ import { VpcElBg } from './../../vpc/vel/velBg';
/* auto */ import { VpcElBase, VpcElSizable } from './../../vpc/vel/velBase';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr, throwIfUndefined } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, ValHolder, assertEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { ElementObserverVal } from './../../ui512/elements/ui512ElementGettable';
/* auto */ import { UI512PaintDispatch } from './../../ui512/draw/ui512DrawPaintDispatch';

/**
 * OutsideWorldReadWrite
 * provides scripts with access to the outside "world".
 */
export class VpcOutsideImpl implements OutsideWorldReadWrite {
    protected readonly check = new CheckReservedWords();
    readonly builtinFns: VpcBuiltinFunctions;
    vci: VpcStateInterface;
    constructor() {
        this.builtinFns = new VpcBuiltinFunctions(this as OutsideWorldRead);
    }

    /**
     * create a vel and add it to the model
     */
    CreatePart(type: VpcElType, x: number, y: number, w: number, h: number) {
        let currentCardId = this.GetOptionS('currentCardId');
        let currentCard = this.vci.getModel().getCardById(currentCardId);
        let el = this.vci.createVel(currentCardId, type, -1) as VpcElSizable;
        assertTrue((el instanceof VpcElSizable), '6u|not VpcElSizable');
        el.setDimensions(x, y, w, h);
        return el;
    }

    /**
     * create a card and add it to the model
     */
    CreateCard(indexRelativeToBg: number) {
        let currentCardId = this.GetOptionS('currentCardId');
        let currentCard = this.vci.getModel().getCardById(currentCardId);
        return this.vci.createVel(currentCard.parentId, VpcElType.Card, indexRelativeToBg);
    }

    /**
     * remove a vel from the model
     */
    RemovePart(vel: VpcElBase) {
        this.vci.removeVel(vel);
    }

    /**
     * remove a card
     */
    RemoveCard(vel: VpcElBase) {
        this.vci.removeVel(vel);
    }

    /**
     * resolve reference to a vel
     */
    ResolveVelRef(ref: RequestedVelRef): [O<VpcElBase>, VpcElCard] {
        let target: O<VpcElBase>;
        let NoteThisIsDisabledCode = 1;
        let [frStack, frame] = this.vci.findExecFrameStack();
        //~ if (frame) {
        //~ me = this.vci.getModel().findByIdUntyped(frame.codeSection.ownerId);
        //~ target = this.vci.getModel().findByIdUntyped(frame.message.targetId);
        //~ }
        let me: O<VpcElBase> = this.FindVelById(frame?.meId);

        let cardHistory: RememberHistory = (undefined as unknown) as RememberHistory;

        let resolver = new VelResolveReference(this.vci.getModel());
        let ret: [O<VpcElBase>, VpcElCard];
        try {
            ret = resolver.go(ref, me, target, cardHistory);
        } catch (e) {
            if (e.isVpcError) {
                ret = [undefined, this.vci.getModel().getCurrentCard()];
            } else {
                throw e;
            }
        }

        checkThrow(ret && ret.length === 2, 'VelResolveReference invalid return');
        let firstElem = ret[0];
        checkThrow(
            !firstElem || !firstElem.getS('name').includes('$$'),
            `Kt|names with $$ are reserved for internal ViperCard objects.`
        );
        return ret;
    }

    /**
     * try resolving a RequestedVelRef, and if resolution fails, return false
     */
    ElementExists(vel: RequestedVelRef): boolean {
        return this.ResolveVelRef(vel)[0] !== undefined;
    }

    /**
     * count the number of elements of a certain type
     */
    CountElements(type: VpcElType, parentRef: RequestedVelRef): number {
        let countOnlyMarked = false;
        if (parentRef.type === VpcElType.Stack && parentRef.cardLookAtMarkedOnly) {
            countOnlyMarked = true;
            parentRef.cardLookAtMarkedOnly = false;
        }

        let parent = throwIfUndefined(this.ResolveVelRef(parentRef)[0], '6t|Cannot find this element');
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
            if (countOnlyMarked) {
                return parentAsStack.bgs.map(bg => bg.cards.filter(c => c.getB('marked')).length).reduce(Util512.add);
            } else {
                return parentAsStack.bgs.map(bg => bg.cards.length).reduce(Util512.add);
            }
        } else if (type === VpcElType.Card && parentAsBg.isVpcElBg) {
            return parentAsBg.cards.length;
        } else if ((type === VpcElType.Btn || type === VpcElType.Fld) && parentAsBg.isVpcElBg) {
            return parentAsBg.parts.filter(ch => ch.getType() === type).length;
        } else if ((type === VpcElType.Btn || type === VpcElType.Fld) && parentAsCard.isVpcElCard) {
            return parentAsCard.parts.filter(ch => ch.getType() === type).length;
        } else {
            throw makeVpcScriptErr(`6s|cannot count types ${type} parent of type ${parent.getType()} ${parent.id}`);
        }
    }

    /**
     * get the current "item delemiter" to know how to interpret 'get item 3 of "a,b,c"'
     */
    GetItemDelim() {
        let ret = this.GetOptionS('itemDel');
        assertEq(1, ret.length, '6r|invalid itemDel', ret);
        return ret;
    }

    /**
     * declare a global
     */
    DeclareGlobal(varName: string) {
        let NoteThisIsDisabledCode = 1;
        //~ assertTrue(slength(varName), '6q|bad varName', varName);
        //~ let [frStack, frame] = this.getExecFrameStack();
        //~ frame.declaredGlobals[varName] = true;
    }

    /**
     * is a variable defined
     */
    IsVarDefined(varName: string) {
        let NoteThisIsDisabledCode = 1;
        return false;
        //~ let [frStack, frame] = this.getExecFrameStack();
        //~ return bool(
        //~ frStack.constants.find(varName) ||
        //~ (frame.declaredGlobals[varName] && frStack.globals.find(varName)) ||
        //~ frame.locals.find(varName)
        //~ );
    }

    /**
     * read variable contents
     */
    ReadVarContents(varName: string): VpcVal {
        let NoteThisIsDisabledCode = 1;
        return VpcVal.False;
        //~ assertTrue(slength(varName), '6p|bad varName', varName);

        //~ if (varName === LogToReplMsgBox.redirectThisVariableToMsgBox) {
        //~ throw makeVpcScriptErr(
        //~ `in ${cProductName}, you can only write to the msg box, not read from it.`
        //~ );
        //~ }

        //~ let [frStack, frame] = this.getExecFrameStack();
        //~ let found = frStack.constants.find(varName);
        //~ if (found) {
        //~ return found;
        //~ }

        //~ found = frStack.globals.find(varName);
        //~ if (found && frame.declaredGlobals[varName] !== undefined) {
        //~ return found;
        //~ }

        //~ found = frame.locals.find(varName);
        //~ return throwIfUndefined(
        //~ found,
        //~ '6o|no variable found with this name. please put contents into before reading from it.',
        //~ varName
        //~ );
    }

    /**
     * set variable contents
     */
    SetVarContents(varName: string, v: VpcVal): void {
        let NoteThisIsDisabledCode = 1;
        //~ assertTrue(slength(varName), '6n|bad varName', varName);

        //~ if (varName === LogToReplMsgBox.redirectThisVariableToMsgBox) {
        //~ this.WriteToReplMessageBox(v.readAsString());
        //~ return;
        //~ }

        //~ let [frStack, frame] = this.getExecFrameStack();
        //~ let found = frStack.constants.find(varName);
        //~ if (found) {
        //~ throw makeVpcScriptErr(`6m|name not allowed ${varName}, it is a constant`);
        //~ }

        //~ checkThrow(
        //~ this.check.okLocalVar(varName),
        //~ '8>|variable name not allowed',
        //~ varName
        //~ );
        //~ if (frame.declaredGlobals[varName] !== undefined) {
        //~ frStack.globals.set(varName, v);
        //~ } else {
        //~ frame.locals.set(varName, v);
        //~ }
    }

    /**
     * set variable contents (allows access to special vars like "it")
     */
    SetSpecialVar(varName: string, v: VpcVal): void {
        let NoteThisIsDisabledCode = 1;
        //~ checkThrow(varName === 'it', '8=|only supported for it');
        //~ let [frStack, frame] = this.getExecFrameStack();
        //~ frame.locals.set(varName, v);
    }

    /**
     * resolve a reference to a container,
     * throws if the requested vel does not exist
     */
    ResolveContainerReadable(container: RequestedContainerRef): ReadableContainer {
        checkThrow(container.isRequestedContainerRef, '8<|not a valid container');
        if (container.vel) {
            let resolved = this.ResolveVelRef(container.vel);
            let vel = resolved[0];
            checkThrow((vel instanceof VpcElBase), `8;|element not found`);
            let asFld = vel as VpcElField;
            checkThrow(
                (asFld instanceof VpcElField),
                longstr(`6[|currently we only support reading text from a
                    fld. to read label of button, use 'the label of cd btn 1'`)
            );
            return new ReadableContainerField(asFld, resolved[1].id);
        } else if (container.variable) {
            return new ReadableContainerVar(this as OutsideWorldRead, container.variable);
        } else {
            throw makeVpcScriptErr(`6l|invalid IntermedValContainer, nothing set`);
        }
    }

    /**
     * resolve reference to writable container
     * throws if the requested vel does not exist
     */
    ResolveContainerWritable(container: RequestedContainerRef): WritableContainer {
        if (container.vel) {
            let resolved = this.ResolveVelRef(container.vel);
            let vel = resolved[0];
            checkThrow((vel instanceof VpcElBase), `8;|element not found`);
            let asFld = vel as VpcElField;
            checkThrow(
                (asFld instanceof VpcElField),
                longstr(`currently we only support writing text to
                    a fld. to write label of button, use 'the label of cd btn 1'`)
            );

            return new WritableContainerField(asFld, resolved[1].id);
        } else if (container.variable) {
            return new WritableContainerVar(this, container.variable);
        } else {
            throw makeVpcScriptErr(`6k|invalid IntermedValContainer, nothing set`);
        }
    }

    /**
     * read text from a container
     */
    ContainerRead(contRef: RequestedContainerRef): string {
        let cont = this.ResolveContainerReadable(contRef);
        return ChunkResolution.applyRead(cont, contRef.chunk, this.GetItemDelim());
    }

    /**
     * write to a container
     */
    ContainerWrite(contRef: RequestedContainerRef, newContent: string, prep: VpcChunkPreposition) {
        let cont = this.ResolveContainerWritable(contRef);
        return ChunkResolution.applyPut(cont, contRef.chunk, this.GetItemDelim(), newContent, prep);
    }

    /**
     * modify a container
     */
    ContainerModify(contRef: RequestedContainerRef, fn: (s: string) => string) {
        let cont = this.ResolveContainerWritable(contRef);
        return ChunkResolution.applyModify(cont, contRef.chunk, this.GetItemDelim(), fn);
    }

    /**
     * get the focused vel
     */
    GetSelectedField(): O<VpcElField> {
        return this.vci.getCurrentFocusVelField();
    }

    SetProp(ref: O<RequestedVelRef>, prop: string, v: VpcVal, chunk: O<RequestedChunk>): void {
        let resolved: [O<VpcElBase>, VpcElCard];
        if (ref) {
            resolved = this.ResolveVelRef(ref);
        } else {
            resolved = [this.vci.getModel().productOpts, this.vci.getModel().getCurrentCard()];
        }

        let vel = throwIfUndefined(resolved[0], `8/|could not get ${prop} because could not find the specified element.`);
        let cardId = resolved[1].id;
        if (chunk) {
            let fld = vel as VpcElField;
            checkThrow(fld.isVpcElField, `8.|can only say 'set the (prop) of char 1 to 2' on fields.`);
            fld.specialSetPropChunk(cardId, prop, chunk, v, this.GetItemDelim());
        } else {
            vel.setProp(prop, v, cardId);
        }
    }

    /**
     * high-level get property of a vel, returns VpcVal
     */
    GetProp(ref: O<RequestedVelRef>, prop: string, adjective: PropAdjective, chunk: O<RequestedChunk>): VpcVal {
        let resolved: [O<VpcElBase>, VpcElCard];
        if (ref) {
            resolved = this.ResolveVelRef(ref);
        } else {
            resolved = [this.vci.getModel().productOpts, this.vci.getModel().getCurrentCard()];
        }

        let vel = throwIfUndefined(resolved[0], `8-|could not get ${prop} because could not find the specified element.`);
        let cardId = resolved[1].id;
        let resolver = new VelResolveName(this.vci.getModel());
        if (chunk) {
            /* put the textstyle of char 2 to 4 of fld "myFld" into x */
            let fld = vel as VpcElField;
            checkThrow(fld.isVpcElField, `8,|can only say 'get the (prop) of char 1 to 2' on fields.`);
            return fld.specialGetPropChunk(cardId, prop, chunk, this.GetItemDelim());
        } else if (prop === 'owner') {
            /* put the owner of card "myCard" into x */
            return VpcValS(resolver.getOwnerName(vel, adjective));
        } else if (prop === 'name') {
            /* put the long name of card "myCard" into x */
            return VpcValS(resolver.go(vel, adjective));
        } else if (prop === 'id') {
            /* put the id of card "myCard" into x */
            let resolveId = new VelResolveId(this.vci.getModel());
            return VpcValS(resolveId.go(vel, adjective));
        } else if (prop === 'target') {
            /* put the long target into x */
            checkThrow(!ref, "8+|must say 'get the target' and not 'get the target of cd btn 1");
            return VpcValS(this.getTargetName(resolver, adjective));
        } else {
            if (prop === 'version' && adjective === PropAdjective.Long) {
                /* the only other prop that accepts an adjective is version. */
                prop = 'version/long';
            } else if (adjective !== PropAdjective.Empty) {
                throw makeVpcScriptErr(
                    longstr(`6j|this property does not take an
                        adjective like long (the long name of cd btn 1)`)
                );
            }

            /* ask the vel for the property */
            return vel.getProp(prop, cardId);
        }
    }

    /**
     * is this a runtime property on the 'product' object?
     */
    IsProductProp(propName: string): boolean {
        return VpcElProductOpts.canGetProductProp(propName);
    }

    /**
     * get the current tool, specify the 'real' tool or the 'simulated' tool chosen by a script
     */
    GetCurrentTool(realOrMimic: boolean): VpcTool {
        return this.GetOptionN(realOrMimic ? 'currentTool' : 'mimicCurrentTool');
    }

    /**
     * is this a built-in function
     */
    IsBuiltinFunction(s: string): boolean {
        return VpcBuiltinFunctions.isFunction(s);
    }

    /**
     * call a built-in function
     */
    CallBuiltinFunction(s: string, args: VpcVal[]): VpcVal {
        return this.builtinFns.call(s, args);
    }

    GetCurrentCardId(): string {
        return this.vci.getOptionS('currentCardId');
    }

    /**
     * get code execution frame information
     */
    GetFrameInfo(): [VpcScriptMessage, VpcVal[]] {
        let NoteThisIsDisabledCode = 1;
        throw new Error('disabled');
        //~ let [frStack, frame] = this.getExecFrameStack();
        //~ return [frame.message, frame.args];
    }

    /**
     * get a runtime (non-persisted) string value
     */
    GetOptionS(prop: string): string {
        return this.vci.getOptionS(prop);
    }

    /**
     * get a runtime (non-persisted) numeric value
     */
    GetOptionN(prop: string): number {
        return this.vci.getOptionN(prop);
    }

    /**
     * get a runtime (non-persisted) boolean value
     */
    GetOptionB(prop: string): boolean {
        return this.vci.getOptionB(prop);
    }

    /**
     * set a runtime (non-persisted) value
     */
    SetOption<T extends ElementObserverVal>(prop: string, newVal: T) {
        this.vci.setOption(prop, newVal);
    }

    /**
     * find element by id
     */
    FindVelById(id: O<string>): O<VpcElBase> {
        return this.vci.getModel().findByIdUntyped(id);
    }

    /**
     * go straight to a card without calling closecard or opencard
     */
    SetCurCardNoOpenCardEvt(id: string) {
        this.vci.setCurCardNoOpenCardEvt(id);
    }

    /**
     * draw paint on the screen by simulating a click
     */
    SimulateClick(argsGiven: number[], mods: ModifierKeys): void {
        let NoteThisIsDisabledCode = 1;
        //~ let mimcTool = this.GetCurrentTool(false);
        //~ checkThrow(
        //~ mimcTool !== VpcTool.Browse,
        //~ longstr(
        //~ `7R|please first run something like 'choose
        //~ "pencil" tool' to specify which tool to draw with`,
        //~ ''
        //~ )
        //~ );
        //~ let args = this.MakeUI512PaintDispatchFromCurrentOptions(false, mods);
        //~ for (let i = 0; i < argsGiven.length; i += 2) {
        //~ args.xPts.push(argsGiven[i]);
        //~ args.yPts.push(argsGiven[i + 1]);
        //~ }

        //~ let [frStack, frame] = this.getExecFrameStack();
        //~ frStack.paintQueue.push(args);
    }

    /**
     * commit simulated clicks to the screen
     */
    CommitSimulatedClicks(queue: UI512PaintDispatch[]): void {
        this.vci.commitSimulatedClicks(queue);
    }

    /**
     * make a UI512PaintDispatch object
     */
    MakeUI512PaintDispatchFromCurrentOptions(realOrMimic: boolean, mods: ModifierKeys) {
        let tool = this.GetCurrentTool(realOrMimic);
        let fromOptsPattern = this.GetOptionS('currentPattern');
        let fromOptsFillcolor = this.GetOptionN('optPaintFillColor');
        let fromOptsLineColor = this.GetOptionN('optPaintLineColor');
        let fromOptsWide = this.GetOptionB('optWideLines');
        let ret = UI512PaintDispatch.fromMemoryOpts(
            toolToDispatchShapes(tool),
            tool === VpcTool.Eraser,
            fromOptsPattern,
            fromOptsFillcolor,
            fromOptsLineColor,
            fromOptsWide
        );

        ret.cardId = this.GetOptionS('currentCardId');
        ret.mods = mods;
        return ret;
    }

    /**
     * append text to the message box
     * ignored if the message box is not currently open
     */
    WriteToReplMessageBox(s: string): void {
        return this.vci.writeToReplMessageBox(s);
    }

    /**
     * get access to FieldsRecentlyEdited, used to determine
     * whether we should call openField or exitField
     */
    GetFieldsRecentlyEdited() {
        let NoteThisIsDisabledCode = 1;
        let tmp: { [id: string]: boolean } = {};
        return new ValHolder(tmp);
        //~ return this.vci.getCodeExec().fieldsRecentlyEdited;
    }

    /**
     * get the name of the 'target' (the vel that was interacted with)
     */
    protected getTargetName(resolver: VelResolveName, adjective: PropAdjective) {
        let newRef = new RequestedVelRef(VpcElType.Unknown);
        newRef.isReferenceToTarget = true;
        let velTarget = this.ResolveVelRef(newRef)[0];
        if (velTarget) {
            return resolver.go(velTarget, adjective);
        } else {
            return '';
        }
    }

    /**
     * get the current code execution frame
     */
    protected getExecFrameStack(): [VpcExecFrameStack, VpcExecFrame] {
        let [frStack, frame] = this.vci.findExecFrameStack();
        if (frStack && frame) {
            return [frStack, frame];
        } else {
            assertTrue(false, '6h|could not find execution frame');
            throw makeVpcScriptErr('6g|could not find execution frame');
        }
    }
}
