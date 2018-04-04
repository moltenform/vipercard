
/* auto */ import { O, UI512Compress, assertTrue, assertTrueWarn, checkThrow, makeVpcInternalErr, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { assertEqWarn, isString } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ChangeContext } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { ElementObserver, ElementObserverVal } from '../../ui512/elements/ui512elementsgettable.js';
/* auto */ import { VpcElType } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velbase.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velcard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velbg.js';
/* auto */ import { VelResolveName } from '../../vpc/vel/velresolvename.js';
/* auto */ import { IVpcStateInterface, TypeOfUndoAction } from '../../vpcui/state/vpcappli.js';
/* auto */ import { UndoableActionCreateOrDelVelement } from '../../vpcui/state/vpcrawcreate.js';
/* auto */ import { VpcSerialization } from '../../vpcui/state/vpcstateserialize.js';

export interface UndoableAction {
    do(appli: IVpcStateInterface): void;
    undo(appli: IVpcStateInterface): void;
}

export class UndoableActionCreateVel extends UndoableActionCreateOrDelVelement implements UndoableAction {
    isUndoableActionCreateVel = true;
    constructor(id: string, parent_id: string, type: VpcElType, insertIndex = -1 /* default to add-to-end */) {
        super(id, parent_id, type, insertIndex);
    }

    do(appli: IVpcStateInterface) {
        checkThrow(
            !appli.getCodeExec().isCodeRunning(),
            "8(|currently can't add or remove an element while code is running"
        );
        this.create(appli);
    }

    undo(appli: IVpcStateInterface) {
        checkThrow(
            !appli.getCodeExec().isCodeRunning(),
            "8&|currently can't add or remove an element while code is running"
        );
        this.remove(appli);
    }
}

export class UndoableActionDeleteVel extends UndoableActionCreateOrDelVelement implements UndoableAction {
    isUndoableActionDeleteVel = true;
    data = '';
    childcount: number;
    constructor(vel: VpcElBase, appli: IVpcStateInterface) {
        super(vel.id, vel.parentId, vel.getType(), -1);
        UndoableActionDeleteVel.checkIfCanDelete(vel, appli);
        let velAsCard = vel as VpcElCard;
        if (velAsCard && velAsCard.isVpcElCard && velAsCard.parts.length > 0) {
            throw makeVpcScriptErr('6U|To delete a card, first delete all of its parts.');
        }

        this.childcount = 0;
        for (let arr of VelResolveName.getChildrenArrays(vel)) {
            this.childcount += arr.length;
        }

        this.insertindex = this.determineIndexInAr(vel, appli);
        this.data = new VpcSerialization().serializeVelCompressed(appli, vel, this.insertindex);
    }

    static checkIfCanDelete(vel: VpcElBase, appli: IVpcStateInterface) {
        let currentCard = appli.getModel().getByIdUntyped(appli.getModel().productOpts.get_s('currentCardId'));
        let velAsCard = vel as VpcElCard;
        let velAsBg = vel as VpcElBg;
        assertTrue(!!appli.getModel().findByIdUntyped(vel.id), "6Z|deleting element that doesn't exist?", vel.id);
        if (
            vel.getType() === VpcElType.Stack ||
            vel.getType() === VpcElType.Product ||
            vel.getType() === VpcElType.Unknown
        ) {
            throw makeVpcScriptErr('6Y|Cannot delete this type of element');
        } else if (velAsCard && velAsCard.isVpcElCard) {
            let ar = UndoableActionCreateOrDelVelement.getparentarray(vel.parentId, appli, vel.getType());
            checkThrow(ar.length > 1, '8%|Cannot delete the only card of a stack');
        } else if (vel.id === currentCard.id) {
            throw makeVpcScriptErr('6X|Cannot delete the current card');
        } else if (vel.id === currentCard.parentId) {
            throw makeVpcScriptErr('6W|Cannot delete the current background');
        } else if (velAsBg && velAsBg.isVpcElBg && velAsBg.cards.length > 0) {
            throw makeVpcScriptErr('6V|The only way to delete a bg is to delete all of its cards.');
        }
    }

    do(appli: IVpcStateInterface) {
        checkThrow(
            !appli.getCodeExec().isCodeRunning(),
            "8$|currently can't add or remove an element while code is running"
        );
        // I used to automatically delete the children here in this loop.
        // more convienient because you can just say 'delete card' w/o deleting children first.
        // but if I did that, they wouldn't be registered by onesJustDeleted
        assertEqWarn(0, this.childcount, '6T|');
        this.remove(appli);
    }

    undo(appli: IVpcStateInterface) {
        let readded = new VpcSerialization().deserializeVelCompressed(appli, this.data);
        appli.rawRevive(readded);
    }
}

class UndoableActionModifyVelement implements UndoableAction {
    velId: string;
    propname: string;
    prevVal: ElementObserverVal;
    newVal: ElementObserverVal;
    constructor(velId: string, propname: string, prevVal: ElementObserverVal, newVal: ElementObserverVal) {
        if (prevVal instanceof FormattedText) {
            prevVal.lock();
        }

        if (newVal instanceof FormattedText) {
            newVal.lock();
        }

        if (isString(prevVal) && propname !== 'paint') {
            if (isString(newVal)) {
                prevVal = '$' + UI512Compress.compressString(prevVal.toString(), false);
                newVal = '$' + UI512Compress.compressString(newVal.toString(), false);
            } else {
                throw makeVpcInternalErr('both must be strings ' + propname + ' ' + velId);
            }
        } else if (prevVal instanceof FormattedText) {
            if (newVal instanceof FormattedText) {
                prevVal = '@' + UI512Compress.compressString(prevVal.toPersisted(), false);
                newVal = '@' + UI512Compress.compressString(newVal.toPersisted(), false);
            } else {
                throw makeVpcInternalErr('both must be FormattedText ' + propname + ' ' + velId);
            }
        }

        this.velId = velId;
        this.propname = propname;
        this.prevVal = prevVal;
        this.newVal = newVal;
    }

    do(appli: IVpcStateInterface) {
        let el = appli.getModel().getByIdUntyped(this.velId);
        let newVal = this.newVal;
        if (typeof newVal === 'string' && newVal.charAt(0) === '$') {
            newVal = UI512Compress.decompressString(newVal.substr(1), false);
        } else if (typeof newVal === 'string' && newVal.charAt(0) === '@') {
            let newValPs = UI512Compress.decompressString(newVal.substr(1), false);
            newVal = FormattedText.newFromPersisted(newValPs);
        }

        if (this.propname === 'currentTool' && typeof newVal === 'number') {
            appli.setTool(newVal);
        } else {
            el.set(this.propname, newVal);
        }
    }

    undo(appli: IVpcStateInterface) {
        let el = appli.getModel().getByIdUntyped(this.velId);
        let prevVal = this.prevVal;
        if (typeof prevVal === 'string' && prevVal.charAt(0) === '$') {
            prevVal = UI512Compress.decompressString(prevVal.substr(1), false);
        } else if (typeof prevVal === 'string' && prevVal.charAt(0) === '@') {
            let prevValPs = UI512Compress.decompressString(prevVal.substr(1), false);
            prevVal = FormattedText.newFromPersisted(prevValPs);
        }

        if (this.propname === 'currentTool' && typeof prevVal === 'number') {
            appli.setTool(prevVal);
        } else {
            el.set(this.propname, prevVal);
        }
    }
}

class UndoableChangeSet {
    stateId: string;
    protected list: UndoableAction[] = [];

    constructor(public readonly type: TypeOfUndoAction) {
        this.stateId = 'stateId' + Math.random();
    }

    notifyAction(action: UndoableAction) {
        this.list.push(action);
    }

    notifyPropChange(velId: string, propname: string, prevVal: ElementObserverVal, newVal: ElementObserverVal) {
        // ignore selection and scroll changes.
        if (
            propname === 'selcaret' ||
            propname === 'selend' ||
            propname === 'scroll' ||
            propname.startsWith('increasingnumber') ||
            propname === 'stacklineage'
        ) {
            return;
        }

        this.list.push(new UndoableActionModifyVelement(velId, propname, prevVal, newVal));
    }

    hasContent() {
        return this.list.length > 0;
    }

    do(appli: IVpcStateInterface) {
        for (let i = 0; i < this.list.length; i++) {
            this.list[i].do(appli);
        }
    }

    undo(appli: IVpcStateInterface) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            this.list[i].undo(appli);
        }
    }

    combineWithChangelist(other: UndoableChangeSet) {
        this.stateId += other.stateId;
        this.list = this.list.concat(other.list);
    }
}

// best undo: revisions, simply rollback or roll forward, no historic state is ever dropped
// flattened branch undo: when you are looking at a historic state and make a change, new state added to top of stack.
// so, no historic state is ever dropped. however, can look confusing to the user.
// classical undo: when you are looking at a historic state and make a change, everything in front is lost.
// paradoxically, might be better add *more* things to persisted/undoable state so that when you hit undo you see exactly what you were working on.

export class UndoManager implements ElementObserver {
    protected history: UndoableChangeSet[] = [];
    protected activeChangeSet: O<UndoableChangeSet>;
    protected pos = -1;
    protected doWithoutAbilityToUndoActive = false;
    protected expectNoChanges = false;
    constructor(protected cbGetCurrentCard: () => string) {}

    doWithoutAbilityToUndo(fn: () => void) {
        try {
            this.doWithoutAbilityToUndoActive = true;
            fn();
        } finally {
            this.doWithoutAbilityToUndoActive = false;
        }
    }

    doWithoutAbilityToUndoExpectingNoChanges(fn: () => void) {
        try {
            this.doWithoutAbilityToUndoActive = true;
            this.expectNoChanges = true;
            fn();
        } finally {
            this.doWithoutAbilityToUndoActive = false;
            this.expectNoChanges = false;
        }
    }

    undoableAction(fn: () => void, type = TypeOfUndoAction.StartNewAction) {
        // allow re-entrancy by checking if this.activeList already exists
        assertTrueWarn(!this.expectNoChanges, 'expected no changes');
        let needToAddToList = false;
        if (!this.activeChangeSet) {
            this.activeChangeSet = new UndoableChangeSet(type);
            needToAddToList = true;
        }

        try {
            fn();
        } finally {
            if (needToAddToList) {
                this.pushUndoableChangeList(this.activeChangeSet);
                this.activeChangeSet = undefined;
            }
        }
    }

    protected pushUndoableChangeList(list: UndoableChangeSet) {
        assertTrueWarn(!this.expectNoChanges, 'expected no changes');
        if (this.doWithoutAbilityToUndoActive) {
            return;
        }

        if (!list.hasContent()) {
            // do nothing if no undoable events were recorded.
            // important because if user has been running undo() we would lose their ability to redo()
            return;
        }

        if (this.history.length <= 0) {
            this.history.push(list);
            this.pos = this.history.length - 1;
        } else if (this.pos === this.history.length - 1) {
            if (
                list.type === TypeOfUndoAction.StartReusableAction &&
                this.history[this.pos].type === TypeOfUndoAction.StartReusableAction
            ) {
                // if latest action is also StartReusableAction, glue it together
                this.history[this.pos].combineWithChangelist(list);
            } else {
                this.history.push(list);
                this.pos = this.history.length - 1;
            }
        } else {
            // kill everything after this point!
            this.history.splice(this.pos + 1, this.history.length, list);
            this.pos = this.history.length - 1;
        }
    }

    performUndo(appli: IVpcStateInterface) {
        if (appli.getCodeExec().isCodeRunning()) {
            return false;
        }

        assertTrue(!this.doWithoutAbilityToUndoActive, "6S|can't call this during doWithoutAbilityToUndoActive");
        assertTrue(!this.activeChangeSet, "6R|can't call this during undoable action");
        if (this.pos < 0) {
            return false;
        } else {
            let cmd = this.history[this.pos];
            appli.doWithoutAbilityToUndo(() => cmd.undo(appli));
            this.pos--;
            return true;
        }
    }

    performRedo(appli: IVpcStateInterface) {
        if (appli.getCodeExec().isCodeRunning()) {
            return false;
        }

        assertTrue(!this.doWithoutAbilityToUndoActive, "6Q|can't call this during doWithoutAbilityToUndoActive");
        if (this.pos >= this.history.length - 1) {
            return false;
        } else {
            assertTrue(!this.activeChangeSet, "6P|can't call this during undoable action");
            let cmd = this.history[this.pos + 1];
            appli.doWithoutAbilityToUndo(() => cmd.do(appli));
            this.pos++;
            return true;
        }
    }

    changeSeen(
        context: ChangeContext,
        elid: string,
        propname: string,
        prev: ElementObserverVal,
        newv: ElementObserverVal
    ) {
        assertTrueWarn(!this.expectNoChanges, 'expected no changes');
        if (this.doWithoutAbilityToUndoActive) {
            return;
        } else if (
            propname === 'selcaret' ||
            propname === 'selend' ||
            propname === 'scroll' ||
            propname.startsWith('increasingnumber') ||
            propname === 'stacklineage'
        ) {
            return;
        }

        if (this.activeChangeSet) {
            this.activeChangeSet.notifyPropChange(elid, propname, prev, newv);
        } else {
            assertTrueWarn(false, '6O|must be done inside an undoable block', elid, propname, prev, newv);
        }
    }

    changeSeenCreationDeletion(action: UndoableAction) {
        if (this.doWithoutAbilityToUndoActive) {
            return;
        }

        if (action instanceof UndoableActionCreateOrDelVelement) {
            if (this.activeChangeSet) {
                this.activeChangeSet.notifyAction(action);
            } else {
                assertTrueWarn(false, '6N|must be done inside an undoable block', action.velId, action.type);
            }
        } else {
            throw new Error('not a known type of UndoableAction');
        }
    }

    getCurrentStateId() {
        if (this.history.length === 0) {
            return '(justopened)';
        } else if (this.pos !== this.history.length - 1) {
            // if you're in the middle of undoing,
            // intentionally say state needs to be saved before closing
            return 'viewinghistory' + Math.random().toString();
        } else {
            return this.history[this.history.length - 1].stateId;
        }
    }
}
