
/* auto */ import { VpcStateSerialize } from './vpcStateSerialize';
/* auto */ import { TypeOfUndoAction, VpcStateInterface } from './vpcInterface';
/* auto */ import { VpcElType, checkThrow, checkThrowEq, checkThrowInternal } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { UndoableActionCreateOrDelVel } from './vpcCreateOrDelVel';
/* auto */ import { VpcModelTop } from './../../vpc/vel/velModelTop';
/* auto */ import { VpcElCard } from './../../vpc/vel/velCard';
/* auto */ import { VpcElBase } from './../../vpc/vel/velBase';
/* auto */ import { O, UI512Compress, bool } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, assertWarn } from './../../ui512/utils/util512AssertCustom';
/* auto */ import { arLast } from './../../ui512/utils/util512';
/* auto */ import { ChangeContext } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { FormattedText } from './../../ui512/draw/ui512FormattedText';
/* auto */ import { ElementObserver, ElementObserverVal } from './../../ui512/elements/ui512ElementGettable';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * we put undoable options into _ProductOpts_, and non-undoable options into _VpcRuntimeOpts_
 *
 * trade-off between how much state is recorded for undo --
 * for example, when you choose a different tool, should this be undoable?
 *
 * 1) if many options are undoable:
 *      you have to be very careful after hitting Undo() a few times,
 *      because if you accidentally change the state, you'll lose the ability to Redo()
 *
 * 2) if few options are undoable:
 *      then it would resolve this, it would but safer to hit Undo() a few times
 *      and, we could 'associate' commonly-used state even if it couldn't be
 *      directly undone. for example, the current tool could be attached to the
 *      undo state, so you could see the context when Undo()ing through history
 *
 * we've decided to use approach 1) and make most options undoable.
 * testing using with both approaches, approach 2 was frustrating because
 * you could not see the context of what you were changing (which object was selected,
 * or which script you were editing, etc.)
 * you might need to hit undo() a few more times than you thought, but there is clarity.
 * if you need to go back between different versions, Save As can be used as a workaround
 */

/**
 * interface for undoable actions
 *
 * this is essentially the Command Pattern
 */
export interface UndoableAction {
    do(vci: VpcStateInterface): void;
    undo(vci: VpcStateInterface): void;
}

/**
 * an action creating a vel, thin wrapper around UndoableActionCreateOrDelVel
 */
export class UndoableActionCreateVel extends UndoableActionCreateOrDelVel implements UndoableAction {
    constructor(id: string, parentId: string, type: VpcElType, insertIndex = -1 /* default to add-to-end */) {
        super(id, parentId, type, insertIndex);
    }

    /**
     * create the vel
     */
    do(vci: VpcStateInterface) {
        this.create(vci);
    }

    /**
     * un-create the vel
     */
    undo(vci: VpcStateInterface) {
        this.remove(vci);
    }
}

/**
 * an action removing a vel
 * stores the removed vel in a string
 */
export class UndoableActionDeleteVel extends UndoableActionCreateOrDelVel implements UndoableAction {
    storedVelData = '';
    constructor(vel: VpcElBase, vci: VpcStateInterface) {
        super(vel.id, vel.parentId, vel.getType(), -1);
        UndoableActionDeleteVel.checkIfCanDelete(vel, vci);
        this.insertIndex = this.determineIndexInAr(vel, vci);
        this.storedVelData = new VpcStateSerialize().serializeVelCompressed(vci, vel, this.insertIndex);
    }

    /**
     * can this vel be deleted?
     */
    static checkIfCanDelete(vel: VpcElBase, vci: VpcStateInterface) {
        let currentCard = vci.getModel().getByIdUntyped(vci.getModel().productOpts.getS('currentCardId'));
        assertTrue(bool(vci.getModel().findByIdUntyped(vel.id)), "6Z|deleting element that doesn't exist?", vel.id);
        if (vel.getType() === VpcElType.Stack || vel.getType() === VpcElType.Product || vel.getType() === VpcElType.Unknown) {
            checkThrow(false, '6Y|Cannot delete this type of element');
        } else if (vel instanceof VpcElCard) {
            let ar = UndoableActionCreateOrDelVel.getChildVelsArray(vel.parentId, vci, vel.getType());
            checkThrow(ar.length > 1, '8%|Cannot delete the only card of a stack');
        } else if (vel.id === currentCard.id) {
            checkThrow(false, '6X|Cannot delete the current card');
        } else if (vel.id === currentCard.parentId) {
            checkThrow(false, '6W|Cannot delete the current background');
        }

        let childCount = 0;
        let arrs = VpcModelTop.getChildArrays(vel);
        for (let i = 0, len = arrs.length; i < len; i++) {
            /* I used to automatically delete the children here in this loop,
            but it is better overall to enforce that all children
            must be separately deleted before deleting a parent,
            since it is easier to implement undo */
            childCount += arrs[i].length;
        }

        checkThrowEq(0, childCount, `K(|you must delete all children before deleting this object`);
    }

    /**
     * remove the vel
     */
    do(vci: VpcStateInterface) {
        this.remove(vci);
    }

    /**
     * revive and re-add the vel
     */
    undo(vci: VpcStateInterface) {
        checkThrow(!vci.getCodeExec().isCodeRunning(), "8$|currently can't do this while code is running");

        let vel = new VpcStateSerialize().deserializeVelCompressed(vci, this.storedVelData);
        vci.rawRevive(vel);
    }
}

/**
 * records all alterations made to vel properties
 */
class UndoableActionModifyVelement implements UndoableAction {
    velId: string;
    propName: string;
    prevVal: ElementObserverVal;
    newVal: ElementObserverVal;
    constructor(velId: string, propName: string, prevVal: ElementObserverVal, newVal: ElementObserverVal) {
        if (typeof prevVal === 'string' && propName !== 'paint') {
            if (typeof newVal === 'string') {
                prevVal = '$' + UI512Compress.compressString(prevVal.toString());
                newVal = '$' + UI512Compress.compressString(newVal.toString());
            } else {
                checkThrowInternal(false, 'K&|both must be strings ' + propName + ' ' + velId);
            }
        } else if (prevVal instanceof FormattedText) {
            if (newVal instanceof FormattedText) {
                prevVal.lock();
                newVal.lock();
                prevVal = '@' + UI512Compress.compressString(prevVal.toSerialized());
                newVal = '@' + UI512Compress.compressString(newVal.toSerialized());
            } else {
                checkThrowInternal(false, 'K%|both must be FormattedText ' + propName + ' ' + velId);
            }
        }

        this.velId = velId;
        this.propName = propName;
        this.prevVal = prevVal;
        this.newVal = newVal;
    }

    /**
     * set the vel property from prevVal to newVal
     */
    do(vci: VpcStateInterface) {
        let el = vci.getModel().getByIdUntyped(this.velId);
        let newVal = this.newVal;
        if (typeof newVal === 'string' && newVal.startsWith('$')) {
            newVal = UI512Compress.decompressString(newVal.substr(1));
        } else if (typeof newVal === 'string' && newVal.startsWith('@')) {
            let newValPs = UI512Compress.decompressString(newVal.substr(1));
            newVal = FormattedText.newFromSerialized(newValPs);
        }

        if (this.propName === 'currentTool' && typeof newVal === 'number') {
            vci.setTool(newVal);
        } else {
            el.set(this.propName, newVal);
        }
    }

    /**
     * set the vel property back to prevVal
     */
    undo(vci: VpcStateInterface) {
        let el = vci.getModel().getByIdUntyped(this.velId);
        let prevVal = this.prevVal;
        if (typeof prevVal === 'string' && prevVal.startsWith('$')) {
            prevVal = UI512Compress.decompressString(prevVal.substr(1));
        } else if (typeof prevVal === 'string' && prevVal.startsWith('@')) {
            let prevValPs = UI512Compress.decompressString(prevVal.substr(1));
            prevVal = FormattedText.newFromSerialized(prevValPs);
        }

        if (this.propName === 'currentTool' && typeof prevVal === 'number') {
            vci.setTool(prevVal);
        } else {
            el.set(this.propName, prevVal);
        }
    }
}

/**
 * a set of undoable changes,
 * when the user hits "Undo" all changes in this set will be undone at once
 */
class UndoableChangeSet {
    stateId: string;
    protected list: UndoableAction[] = [];
    constructor(public readonly type: TypeOfUndoAction) {
        this.stateId = 'stateId' + Math.random();
    }

    /**
     * add an action to the list
     */
    notifyAction(action: UndoableAction) {
        this.list.push(action);
    }

    /**
     * record an action and add it to the list
     */
    notifyPropChange(velId: string, propName: string, prevVal: ElementObserverVal, newVal: ElementObserverVal) {
        /* ignore selection and scroll changes. */
        if (
            propName === 'selcaret' ||
            propName === 'selend' ||
            propName === 'scroll' ||
            propName.startsWith('increasingnumber') ||
            propName === 'stacklineage'
        ) {
            return;
        }

        this.list.push(new UndoableActionModifyVelement(velId, propName, prevVal, newVal));
    }

    /**
     * does the list have content
     */
    hasContent() {
        return this.list.length > 0;
    }

    /**
     * do() every action in the list, user has said to "Redo"
     */
    do(vci: VpcStateInterface) {
        for (let i = 0; i < this.list.length; i++) {
            this.list[i].do(vci);
        }
    }

    /**
     * undo() every action in the list, user has said to "Undo"
     */
    undo(vci: VpcStateInterface) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            this.list[i].undo(vci);
        }
    }

    /**
     * join with another list
     */
    combineWithChangelist(other: UndoableChangeSet) {
        this.stateId += other.stateId;
        this.list = this.list.concat(other.list);
    }
}

/**
 * manage undo state
 * can also detect when a stack has unsaved changes
 */
export class UndoManager implements ElementObserver {
    protected history: UndoableChangeSet[] = [];
    protected activeChangeSet: O<UndoableChangeSet>;
    protected pos = -1;
    protected doWithoutAbilityToUndoActive = false;
    protected expectNoChanges = false;
    constructor(protected cbGetCurrentCard: () => string) {}

    /**
     * don't record changes made for undo
     */
    doWithoutAbilityToUndo(fn: () => void) {
        try {
            this.doWithoutAbilityToUndoActive = true;
            fn();
        } finally {
            this.doWithoutAbilityToUndoActive = false;
        }
    }

    /**
     * don't record changes made for undo, and assert that no changes were made
     */
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

    /**
     * record changes made for undo
     */
    undoableAction(fn: () => void, type = TypeOfUndoAction.StartNewAction) {
        /* note: use needToAddToList,
        be aware of re-entrancy into this method */
        assertWarn(!this.expectNoChanges, 'K$|expected no changes');
        let needToAddToList = false;
        if (!this.activeChangeSet) {
            this.activeChangeSet = new UndoableChangeSet(type);
            needToAddToList = true;
        }

        try {
            fn();
        } finally {
            if (needToAddToList) {
                this.pushUndoableChanges(this.activeChangeSet);
                this.activeChangeSet = undefined;
            }
        }
    }

    /**
     * are we 'back in time' looking at a previous state?
     */
    isCurrentlyUndoing() {
        return this.pos !== this.history.length - 1;
    }

    /**
     * record changes
     */
    protected pushUndoableChanges(list: UndoableChangeSet) {
        assertWarn(!this.expectNoChanges, 'K#|expected no changes');
        if (this.doWithoutAbilityToUndoActive) {
            /* we've been told not to record any changes */
            return;
        }

        if (!list.hasContent()) {
            /* do nothing if no undoable events were recorded.
            important because if user has been running undo()
            we would lose their ability to redo() */
            return;
        }

        if (this.history.length <= 0) {
            /* adding first entry to list */
            this.history.push(list);
            this.pos = this.history.length - 1;
        } else if (this.pos === this.history.length - 1) {
            if (
                list.type === TypeOfUndoAction.StartReusableAction &&
                this.history[this.pos].type === TypeOfUndoAction.StartReusableAction
            ) {
                /* if latest action is also StartReusableAction, glue it together

                it seems more intuitive if all modifications cause by a script are
                wrapped together into one undoable block, even though the script
                is run in separate timeslices. without this coalescing of undo events,
                user would have to hit Undo multiple times for no apparent reason */
                this.history[this.pos].combineWithChangelist(list);
            } else {
                this.history.push(list);
                this.pos = this.history.length - 1;
            }
        } else {
            /* user changed some state when they had gone back in time with Undo() */
            /* kill everything after this point! */
            this.history.splice(this.pos + 1, this.history.length, list);
            this.pos = this.history.length - 1;
        }
    }

    /**
     * perform undo
     */
    performUndo(vci: VpcStateInterface) {
        if (vci.getCodeExec().isCodeRunning()) {
            return false;
        }

        assertTrue(!this.doWithoutAbilityToUndoActive, "6S|can't call this during doWithoutAbilityToUndoActive");
        assertTrue(!this.activeChangeSet, "6R|can't call this during undoable action");
        if (this.pos < 0) {
            /* you've hit undo() so many times you're at the beginning */
            return false;
        } else {
            /* apply the undo */
            let cmd = this.history[this.pos];
            vci.doWithoutAbilityToUndo(() => cmd.undo(vci));
            this.pos--;
            return true;
        }
    }

    /**
     * perform redo
     */
    performRedo(vci: VpcStateInterface) {
        if (vci.getCodeExec().isCodeRunning()) {
            return false;
        }

        assertTrue(!this.doWithoutAbilityToUndoActive, "6Q|can't call this during doWithoutAbilityToUndoActive");
        assertTrue(!this.activeChangeSet, "6P|can't call this during undoable action");
        if (this.pos >= this.history.length - 1) {
            /* you can't redo() if you are already at the most recent state */
            return false;
        } else {
            /* apply the redo */
            let cmd = this.history[this.pos + 1];
            vci.doWithoutAbilityToUndo(() => cmd.do(vci));
            this.pos++;
            return true;
        }
    }

    /**
     * respond to an incoming change of state
     */
    changeSeen(context: ChangeContext, elId: string, propName: string, prevVal: ElementObserverVal, newVal: ElementObserverVal) {
        assertWarn(!this.expectNoChanges, 'K!|expected no changes');
        if (this.doWithoutAbilityToUndoActive) {
            return;
        } else if (
            propName === 'selcaret' ||
            propName === 'selend' ||
            propName === 'scroll' ||
            propName.startsWith('increasingnumber') ||
            propName === 'stacklineage'
        ) {
            return;
        }

        if (this.activeChangeSet) {
            this.activeChangeSet.notifyPropChange(elId, propName, prevVal, newVal);
        } else {
            assertWarn(false, '6O|must be done inside an undoable block ' + elId + ' ' + propName, prevVal, newVal);
        }
    }

    /**
     * respond to an incoming change of state, a new or deleted vel
     */
    changeSeenCreationDeletion(action: UndoableAction) {
        if (this.doWithoutAbilityToUndoActive) {
            return;
        }

        if (action instanceof UndoableActionCreateOrDelVel) {
            if (this.activeChangeSet) {
                this.activeChangeSet.notifyAction(action);
            } else {
                assertWarn(false, '6N|must be done inside an undoable block', action.velId, action.type);
            }
        } else {
            throw new Error('not a known type of UndoableAction');
        }
    }

    /**
     * get state id, can be used to see if project has unsaved changes
     */
    getCurrentStateId() {
        if (this.history.length === 0) {
            return '(justOpened)';
        } else if (this.pos !== this.history.length - 1) {
            /* if you're in the middle of undoing, */
            /* this is a transient state */
            return 'viewingHistory' + Math.random().toString();
        } else {
            return arLast(this.history).stateId;
        }
    }
}
