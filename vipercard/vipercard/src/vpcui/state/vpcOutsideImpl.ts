
/* auto */ import { VpcVal, VpcValN, VpcValS } from './../../vpc/vpcutils/vpcVal';
/* auto */ import { LogToReplMsgBox, ReadableContainer, VpcScriptMessage, WritableContainer } from './../../vpc/vpcutils/vpcUtils';
/* auto */ import { VpcExecFrameStack } from './../../vpc/codeexec/vpcScriptExecFrameStack';
/* auto */ import { VpcExecFrame } from './../../vpc/codeexec/vpcScriptExecFrame';
/* auto */ import { RequestedContainerRef, RequestedVelRef } from './../../vpc/vpcutils/vpcRequestedReference';
/* auto */ import { VpcStateInterface } from './vpcInterface';
/* auto */ import { PropAdjective, VpcElType, VpcTool, checkThrow, toolToDispatchShapes } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { RequestedChunk } from './../../vpc/vpcutils/vpcChunkResolutionUtils';
/* auto */ import { ChunkResolution } from './../../vpc/vpcutils/vpcChunkResolution';
/* auto */ import { CheckReservedWords } from './../../vpc/codepreparse/vpcCheckReserved';
/* auto */ import { VpcBuiltinFunctionsDateUtils } from './../../vpc/codepreparse/vpcBuiltinFunctionsUtils';
/* auto */ import { VpcBuiltinFunctions } from './../../vpc/codepreparse/vpcBuiltinFunctions';
/* auto */ import { VelResolveReference } from './../../vpc/vel/velResolveReference';
/* auto */ import { RWContainerField, RWContainerFldSelection, RWContainerVar } from './../../vpc/vel/velResolveContainer';
/* auto */ import { VelGetNumberProperty, VelRenderId, VelRenderName } from './../../vpc/vel/velRenderName';
/* auto */ import { VpcElProductOpts } from './../../vpc/vel/velProductOpts';
/* auto */ import { OutsideWorldRead, OutsideWorldReadWrite } from './../../vpc/vel/velOutsideInterfaces';
/* auto */ import { VpcModelTop } from './../../vpc/vel/velModelTop';
/* auto */ import { VpcFontSpecialChunk } from './../../vpc/vel/velFieldChangeFont';
/* auto */ import { VpcElField, VpcTextFieldAsGeneric } from './../../vpc/vel/velField';
/* auto */ import { VpcElBg } from './../../vpc/vel/velBg';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { O, bool } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, ensureDefined } from './../../ui512/utils/util512Assert';
/* auto */ import { ValHolder, assertEq, longstr, slength } from './../../ui512/utils/util512';
/* auto */ import { TextSelModify } from './../../ui512/textedit/ui512TextSelModify';
/* auto */ import { ElementObserverVal } from './../../ui512/elements/ui512ElementGettable';
/* auto */ import { UI512PaintDispatch } from './../../ui512/draw/ui512DrawPaintDispatch';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

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
     * resolve reference to a vel
     */
    ResolveVelRef(ref: RequestedVelRef): O<VpcElBase> {
        let frame = this.vci.findExecFrameStack()[1];
        let me: O<VpcElBase> = this.FindVelById(frame?.meId);
        let target = this.vci.getModel().findByIdUntyped(frame?.message?.targetId);
        let cardHistory = this.vci.getCodeExec().cardHistory;

        let resolver = new VelResolveReference(this.vci.getModel());
        let ret: O<VpcElBase>;
        try {
            /* for convenience, let's throw exceptions when
            the vel can't be found. means we get less specific messages, though */
            ret = resolver.go(ref, me, target, cardHistory);
        } catch (e) {
            let as = e?.typeName?.includes('Vpc') && e?.message?.includes('break, not found');
            if (as) {
                ret = undefined;
            } else {
                throw e;
            }
        }

        checkThrow(!ret || !ret.getS('name').includes('$$'), `Kt|names with $$ are reserved for internal ViperCard objects.`);

        return ret;
    }

    /**
     * try resolving a RequestedVelRef, if succeeds return its long id
     * if resolution fails, return undefined
     */
    ElementExists(vel: RequestedVelRef): O<string> {
        let found = this.ResolveVelRef(vel);
        if (found) {
            return new VelRenderId(this.vci.getModel()).go(
                found,
                PropAdjective.LongForParse,
                this.Model().stack.getB('compatibilitymode')
            );
        } else {
            return undefined;
        }
    }

    /**
     * count the number of elements of a certain type
     */
    CountElements(type: VpcElType, parentRef: RequestedVelRef): number {
        return new VelResolveReference(this.vci.getModel()).countElements(type, parentRef, this.vci.getCodeExec().cardHistory);
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
        assertTrue(slength(varName), '6q|bad varName', varName);
        let frame = this.getExecFrameStack()[1];
        frame.declaredGlobals[varName] = true;
    }

    /**
     * is a variable defined
     */
    IsVarDefined(varName: string) {
        let [frStack, frame] = this.getExecFrameStack();
        return (
            bool(frStack.constants.find(varName)) ||
            bool(frame.declaredGlobals[varName] && frStack.globals.find(varName)) ||
            bool(frame.locals.find(varName))
        );
    }

    /**
     * read variable contents
     */
    ReadVarContents(varName: string): VpcVal {
        assertTrue(slength(varName), '6p|bad varName', varName);

        let [frStack, frame] = this.getExecFrameStack();
        let found = frStack.constants.find(varName);
        if (found) {
            return found;
        }

        found = frStack.globals.find(varName);
        if (found && frame.declaredGlobals[varName] !== undefined) {
            return found;
        }

        found = frame.locals.find(varName);
        return ensureDefined(
            found,
            '6o|no variable found with this name. please put contents into before reading from it.',
            varName
        );
    }

    /**
     * set variable contents
     */
    SetVarContents(varName: string, v: VpcVal): void {
        assertTrue(slength(varName), '6n|bad varName', varName);

        if (varName === LogToReplMsgBox.redirectThisVariableToMsgBox) {
            this.WriteToReplMessageBox(v.readAsString(), false);
            return;
        }

        let [frStack, frame] = this.getExecFrameStack();
        let found = frStack.constants.find(varName);
        if (found) {
            checkThrow(false, `6m|name not allowed ${varName}, it is a constant`);
        }

        checkThrow(this.check.okLocalVar(varName), '8>|variable name not allowed', varName);
        if (frame.declaredGlobals[varName] !== undefined) {
            frStack.globals.set(varName, v);
        } else {
            frame.locals.set(varName, v);
        }
    }

    /**
     * set variable contents (allows access to special vars like "it")
     */
    SetSpecialVar(varName: string, v: VpcVal): void {
        checkThrow(varName === 'it', '8=|only supported for it');
        let frame = this.getExecFrameStack()[1];
        frame.locals.set(varName, v);
    }

    /**
     * resolve a reference to a container,
     * throws if the requested vel does not exist.
     * by casting to readablecontainer this provides read-only access
     */
    ResolveContainerReadable(container: RequestedContainerRef): ReadableContainer {
        return this.ResolveContainerWritable(container) as ReadableContainer
    }

    /**
     * resolve reference to writable container
     * throws if the requested vel does not exist
     */
    ResolveContainerWritable(container: RequestedContainerRef): WritableContainer {
        checkThrow(container instanceof RequestedContainerRef, '8<|not a valid container');
        if (container.isJustSelection) {
            let selPts = this.FindSelectedTextBounds()
            return new RWContainerFldSelection(selPts[0], this.Model(), selPts[1], selPts[2])
        } else if (container.vel) {
            let vel = this.ResolveVelRef(container.vel);
            checkThrow(vel, `8;|element not found`);
            checkThrow(
                vel instanceof VpcElField,
                longstr(`UJ|you can only read/write text to
                    a field. to read/write label of button, use 'the label of cd btn 1'`)
            );

            return new RWContainerField(vel, this.Model());
        } else if (container.variable) {
            return new RWContainerVar(this, container.variable);
        } else {
            checkThrow(false, `6k|invalid IntermedValContainer, nothing set`);
        }
    }

    /**
     * read text from a container
     */
    ContainerRead(contRef: RequestedContainerRef): string {
        let cont = this.ResolveContainerReadable(contRef);
        return ChunkResolution.applyReadToString(cont, contRef.chunk, this.GetItemDelim());
    }

    /**
     * modify a container
     */
    ContainerModify(contRef: RequestedContainerRef, fn: (s: string) => string) {
        let cont = this.ResolveContainerWritable(contRef);
        ChunkResolution.applyModify(cont, contRef.chunk, this.GetItemDelim(), this.Model().stack.getB('compatibilitymode'), fn);
    }

    /**
     * makes the bounds ordered min to max, and ensures that they are within range.
     * also checks for a field marked as can't-select.
     */
    protected fixSelectionBounds(fld:VpcElField) : O<[number, number]> {
        let generic = new VpcTextFieldAsGeneric(undefined, fld, this.Model());
        return TextSelModify.getSelectedTextBounds(generic);
    }

    /**
     * find the selected text chunk
     */
    FindSelectedTextBounds(): [O<VpcElField>, number, number] {
        let selFld = this.vci.getCurrentFocusVelField();
        if (selFld) {
            /* check if it's locktext/non selectable */
            let bounds = this.fixSelectionBounds(selFld)
            if (bounds) {
                return [selFld, bounds[0], bounds[1]]
            }
        }

        return [undefined, 0, 0]
    }

    /**
     * set a property
     */
    SetProp(ref: RequestedVelRef, prop: string, v: VpcVal, chunk: O<RequestedChunk>): void {
        let vel = this.ResolveVelRef(ref);
        checkThrow(vel, `8/|could not set ${prop}, could not find that object.`);

        if (chunk) {
            checkThrow(vel instanceof VpcElField, `8.|can only say 'set the (prop) of char 1 to 2' on fields.`);
            new VpcFontSpecialChunk(vel).specialSetPropChunk(this.Model(), prop, chunk, v, this.GetItemDelim());
        } else {
            vel.setProp(prop, v, this.Model());
        }
    }

    /**
     * high-level get property of a vel, returns VpcVal
     */
    GetProp(ref: RequestedVelRef, prop: string, adjective: PropAdjective, chunk: O<RequestedChunk>): VpcVal {
        let vel = this.ResolveVelRef(ref);
        checkThrow(vel, `8-|could not get ${prop}, could not find that object.`);

        /* handled here are the cases where "adjective" matters */
        if (chunk) {
            /* put the textstyle of char 2 to 4 of fld "myFld" into x */
            checkThrow(vel instanceof VpcElField, `8,|can only say 'get the (prop) of char 1 to 2' on fields.`);
            return new VpcFontSpecialChunk(vel).specialGetPropChunk(this.Model(), prop, chunk, this.GetItemDelim());
        } else if (prop === 'name') {
            /* put the long name of card "myCard" into x */
            let renderer = new VelRenderName(this.vci.getModel());
            adjective = adjective === PropAdjective.Empty ? PropAdjective.Abbrev : adjective;
            return VpcValS(renderer.go(vel, adjective));
        } else if (prop === 'id') {
            /* put the id of card "myCard" into x */
            let renderer = new VelRenderId(this.vci.getModel());
            adjective = adjective === PropAdjective.Empty ? PropAdjective.Abbrev : adjective;
            return VpcValS(renderer.go(vel, adjective, this.Model().stack.getB('compatibilitymode')));
        } else if (prop === 'internalid') {
            /* put the internalid of cd btn 1 into x 
            for bg elements, id !== internalid */
            return VpcValS(vel.idInternal);
        } else if (prop === 'number') {
            /* put the number of card "myCard" into x */
            let renderer = new VelGetNumberProperty(this.vci.getModel());
            return VpcValN(renderer.go(vel));
        } else if (prop === 'owner') {
            /* put the owner of cd btn 1 into x */
            checkThrow(ref, "UI|must say 'get the owner of cd btn 1' and not 'get the owner'");
            return VpcValS(this.getOwnerFullString(vel, adjective));
        } else if (prop === 'target') {
            /* put the long target into x */
            checkThrow(
                !ref || ref.type === VpcElType.Product,
                "UH|must say 'get the target' and not 'get the target of cd btn 1'"
            );
            return VpcValS(this.getTargetFullString(adjective));
        } else if (prop === 'date') {
            /* put the long date into x */
            checkThrow(!ref || ref.type === VpcElType.Product, "UG|must say 'get the date' and not 'get the date of cd btn 1'");
            return VpcBuiltinFunctionsDateUtils.go(adjective);
        } else if (prop === 'version') {
            /* get the long version */
            checkThrow(!ref || ref.type === VpcElType.Product, "8+|must say 'get the date' and not 'get the date of cd btn 1'");
            return VpcBuiltinFunctionsDateUtils.getVersion(adjective);
        } else {
            if (adjective !== PropAdjective.Empty) {
                checkThrow(
                    false,
                    longstr(`6j|this property does not take an
                        adjective like 'long' (the long name of cd btn 1)`)
                );
            }

            /* ask the vel for the property */
            return vel.getProp(prop);
        }
    }

    /**
     * get the model
     */
    Model(): VpcModelTop {
        return this.vci.getModel();
    }

    /**
     * is this a runtime property on the 'product' object, or a special pseudoproperty?
     */
    IsProductProp(propName: string): boolean {
        return (
            VpcElProductOpts.canGetProductProp(propName) || propName === 'target' || propName === 'date' || propName === 'version'
        );
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

    /**
     * get the current card id
     */
    GetCurrentCardId(): string {
        return this.vci.getOptionS('currentCardId');
    }

    /**
     * get code execution frame information
     */
    GetFrameInfo(): [VpcScriptMessage, VpcVal[]] {
        let frame = this.getExecFrameStack()[1];
        return [frame.message, frame.args];
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
        let mimcTool = this.GetCurrentTool(false);
        checkThrow(
            mimcTool !== VpcTool.Browse,
            longstr(
                `7R|please first run something like 'choose
        "pencil" tool' to specify which tool to draw with`,
                ''
            )
        );
        let args = this.MakeUI512PaintDispatchFromCurrentOptions(false, mods);
        checkThrow(argsGiven.length % 2 === 0, "expected even #")
        for (let i = 0; i < argsGiven.length; i += 2) {
            args.xPts.push(argsGiven[i]);
            args.yPts.push(argsGiven[i + 1]);
        }

        let frStack = this.getExecFrameStack()[0];
        frStack.paintQueue.push(args);
    }

    /**
     * commit simulated clicks to the screen
     */
    CommitSimulatedClicks(queue: UI512PaintDispatch[]): void {
        this.vci.commitSimulatedClicks(queue);
    }

    /**
     * get mouse and keyboard state
     */
    GetMouseAndKeyState(mouseCoords:[number, number],  trackClick:[number, number, number], buttons:ValHolder<boolean[]>, mods:ValHolder<ModifierKeys>) {
        let pr = this.vci.getPresenter()
        mouseCoords[0] = pr.trackMouse[0]
        mouseCoords[1] = pr.trackMouse[1]
        trackClick[0] = pr.trackLastClick[0]
        trackClick[1] = pr.trackLastClick[1]
        trackClick[2] = pr.trackLastClick[2]
        buttons.val = pr.trackPressedBtns.slice()
        mods.val = pr.trackMetaKeys
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
    WriteToReplMessageBox(s: string, returnFocus: boolean): void {
        return this.vci.writeToReplMessageBox(s, returnFocus);
    }

    /**
     * get access to FieldsRecentlyEdited, used to determine
     * whether we should call openField or exitField
     */
    GetFieldsRecentlyEdited() {
        return this.vci.getCodeExec().fieldsRecentlyEdited;
    }

    /**
     * put the target into x (the vel that was interacted with)
     * note that for bg elements this is ambiguous, but we follow
     * the behavior of the original product.
     */
    protected getTargetFullString(adjective: PropAdjective): string {
        /* get a longer form of the id unless specifically said "short" */
        let frame = this.vci.findExecFrameStack()[1];
        let target = this.vci.getModel().findByIdUntyped(frame?.message?.targetId);
        let compat = this.Model().stack.getB('compatibilitymode')
        checkThrow(target, 'UF|the target was not found');

        if (compat) {
            return new VelRenderName(this.vci.getModel()).go(
                target,
                adjective,
            );
        } else {
            /* we want as much info as possible, because although
                we return a string, it will likely be parsed back into an object */
                if (adjective !== PropAdjective.Short) {
                    adjective = PropAdjective.LongForParse
                }

            return new VelRenderId(this.vci.getModel()).go(
                target,
                adjective,
                compat
            );
        }
    }

    /**
     * put the owner of cd btn 1 into x, it returns a string, that can then be used as an object
     */
    protected getOwnerFullString(vel: O<VpcElBase>, adjective: PropAdjective) {
        checkThrow(vel, 'UE|the object was not found');
        if (vel.getType() === VpcElType.Stack || vel.getType() === VpcElType.Product) {
            checkThrow(false, 'UD|Cannot get owner of this type of object.');
        }

        let owner = this.vci.getModel().getByIdUntyped(vel.parentIdInternal);
        if (vel.getType() === VpcElType.Card && this.Model().stack.getB('compatibilitymode')) {
            /* compat with original product */
            return new VelRenderName(this.vci.getModel()).go(
                owner,
                adjective,
            );
        }
        else if (vel.ui512GettableHas('is_bg_velement_id') && vel.getS('is_bg_velement_id').length) {
            /* it's a bg object, indicate this by returning in the form "cd x of bg y".
            the parent of a bg object is still the card, though. */
            let card = this.vci.getModel().getCardById(vel.parentIdInternal);
            let bg = this.vci.getModel().getById(VpcElBg, card.parentIdInternal);
            adjective = PropAdjective.LongForParse /* don't use "short" */
            return new VelRenderId(this.vci.getModel()).go(
                card,
                adjective,
                this.Model().stack.getB('compatibilitymode')
            ) + ' of ' + new VelRenderId(this.vci.getModel()).go(
                bg,
                adjective,
                this.Model().stack.getB('compatibilitymode')
            );
        } else {
            /* we want as much info as possible, because although
            we return a string, it will likely be parsed back into an object */
            if (adjective !== PropAdjective.Short) {
                adjective = PropAdjective.LongForParse
            }

            return new VelRenderId(this.vci.getModel()).go(
                    owner,
                    adjective,
                    this.Model().stack.getB('compatibilitymode')
                );
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
        }
    }
}
