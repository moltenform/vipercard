
/* auto */ import { assertTrue, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { ElementObserver, ElementObserverDefault, ElementObserverNoOp, UI512Settable } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcElField } from '../../vpc/vel/velField.js';
/* auto */ import { VpcElButton } from '../../vpc/vel/velButton.js';
/* auto */ import { VpcElCard } from '../../vpc/vel/velCard.js';
/* auto */ import { VpcElBg } from '../../vpc/vel/velBg.js';
/* auto */ import { VpcModel } from '../../vpc/vel/velModel.js';
/* auto */ import { CodeExecTop } from '../../vpc/codeexec/vpcScriptExecTop.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { UndoManager, UndoableActionCreateVel, UndoableActionDeleteVel } from '../../vpcui/state/vpcUndo.js';
/* auto */ import { VpcOutsideWorld } from '../../vpcui/state/vpcFullOutside.js';

// for trivial settings that don't need to be in the undo stack
// (note that undo/redo can be annoying to use if redo doesn't work
// because trivial actions always zap the ability to redo)

export class VpcRuntimeOpts extends UI512Settable {
    protected _mimicCurrentTool = VpcTool.Browse;
    protected _screenLocked = false;
    protected _copiedVelId = '';
    protected _lastSavedStateId = '';
    isARuntimeOpt: { [key: string]: boolean } = {
        mimicCurrentTool: true,
        screenLocked: true,
        copiedVelId: true,
        lastSavedStateId: true,
    };

    constructor() {
        super('(VpcRuntimeOpts)');
    }

    destroy() {
        this.observer = new ElementObserverDefault();
    }
}

export class VpcRuntime {
    // set by _VpcDocLoader_, _VpcAppController_::init
    codeExec: CodeExecTop;
    outside: VpcOutsideWorld;
    useThisObserverForVpcEls: ElementObserver = new ElementObserverNoOp();
    opts = new VpcRuntimeOpts();

    destroy() {
        this.opts.destroy();
        this.opts = undefined as any;
        this.codeExec = undefined as any;
        this.useThisObserverForVpcEls = undefined as any;
        this.outside = undefined as any;
    }
}

export class VpcApplication {
    // nothing here is persisted or undoable
    // (started by _VpcDocLoader_)
    runtime = new VpcRuntime();
    // put any undoable state here. you can use model.productOpts if not persisted
    // (started by _VpcDocLoader_)
    model: VpcModel;
    // (started by _VpcDocLoader_)
    undoManager: UndoManager;
    // (started in _VpcAppController_ constructor)
    appli: VpcStateInterface;

    createElem(parent_id: string, type: VpcElType, insertIndex = -1, newid?: string) {
        if (!newid) {
            let nextid = this.model.stack.get_n('increasingnumberforid');
            this.model.stack.set('increasingnumberforid', nextid + 1);
            newid = nextid.toString();
        }

        checkThrow(newid.match(/^[0-9]+$/), 'id should be purely numeric', newid);
        let cr = new UndoableActionCreateVel(newid, parent_id, type, insertIndex);
        this.undoManager.changeSeenCreationDeletion(cr);
        cr.do(this.appli);
        return this.model.getByIdUntyped(newid);
    }

    removeElem(vel: VpcElBase) {
        UndoableActionDeleteVel.checkIfCanDelete(vel, this.appli);

        if (vel instanceof VpcElCard) {
            for (let part of vel.parts) {
                assertTrue(part instanceof VpcElButton || part instanceof VpcElField, '6M|bad type');
                this.removeElemImpl(part);
            }
        }

        this.removeElemImpl(vel);

        if (vel.getType() === VpcElType.Card) {
            let bg = this.model.getById(vel.parentId, VpcElBg);
            if (bg && bg.cards.length === 0) {
                this.removeElemImpl(bg);
            }
        }
    }

    protected removeElemImpl(vel: VpcElBase) {
        let rm = new UndoableActionDeleteVel(vel, this.appli);
        this.undoManager.changeSeenCreationDeletion(rm);
        rm.do(this.appli);
    }
}
