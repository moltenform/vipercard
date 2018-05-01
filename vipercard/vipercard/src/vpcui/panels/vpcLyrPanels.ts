
/* auto */ import { O, msgNotification, scontains, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObject, slength } from '../../ui512/utils/utils512.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { KeyDownEventDetails, MouseDownEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512PresenterBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { VpcElType, VpcTool, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcModelTop } from '../../vpc/vel/velModelTop.js';
/* auto */ import { VpcUILayer } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { ToolboxDims } from '../../vpcui/panels/vpcToolboxPatterns.js';
/* auto */ import { VpcEditPanels } from '../../vpcui/panels/vpcPanelsInterface.js';
/* auto */ import { VpcPanelScriptEditor } from '../../vpcui/panels/vpcScriptEditor.js';
/* auto */ import { VpcEditPanelsBase } from '../../vpcui/panels/vpcEditPanelsBase.js';
/* auto */ import { VpcEditPanelsEmpty } from '../../vpcui/panels/vpcEditPanelsEmpty.js';
/* auto */ import { VpcEditPanelsField } from '../../vpcui/panels/vpcEditPanelsFld.js';
/* auto */ import { VpcEditPanelsBtn } from '../../vpcui/panels/vpcEditPanelsBtn.js';
/* auto */ import { VpcEditPanelsCard } from '../../vpcui/panels/vpcEditPanelsCard.js';
/* auto */ import { VpcEditPanelsStack } from '../../vpcui/panels/vpcEditPanelsStack.js';
/* auto */ import { VpcAppLyrDragHandles } from '../../vpcui/panels/vpcLyrDragHandles.js';

/**
 * layer that holds the property panels
 */
export class VpcAppLyrPanels extends VpcUILayer {
    panelEmpty = new VpcEditPanelsEmpty('editPanelEmpty');
    panels = new MapKeyToObject<VpcEditPanels>();
    editor = new VpcPanelScriptEditor('editPanelScript');
    active: O<VpcEditPanels> = this.panelEmpty;
    handles: VpcAppLyrDragHandles;

    /* set in initLayers */
    model: VpcModelTop;

    /**
     * return the currently selected button or field, or undefined
     */
    selectedFldOrBtn() {
        let vel = this.selectedVel('selectedVelId');
        if (vel && (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld)) {
            return vel;
        } else {
            return undefined;
        }
    }

    /**
     * return the selected vel, or undefined
     * can be e.g. the stack if user did Object->Stack Info...
     */
    selectedVel(propName: string) {
        /* the selectedVelId could be out of date. */
        let selVel = this.vci.getOptionS(propName);
        let vel = this.vci.getModel().findByIdUntyped(selVel);
        let currentCardId = this.vci.getModel().getCurrentCard().id;
        if (vel && getToolCategory(this.vci.getTool()) === VpcToolCtg.CtgEdit) {
            /* make sure the parent makes sense */
            if (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld) {
                if (vel.parentId === currentCardId) {
                    return vel;
                }
            } else if (vel.getType() === VpcElType.Card) {
                /* make sure it's on the right card */
                if (vel.id === currentCardId) {
                    return vel;
                }
            } else if (vel.getType() === VpcElType.Stack) {
                return vel;
            }
        }

        return undefined;
    }

    /**
     * update UI
     */
    updateUI512Els() {
        let selected = this.selectedVel('selectedVelId');
        let shouldBeActive: O<VpcEditPanels>;
        if (getToolCategory(this.vci.getOptionN('currentTool')) !== VpcToolCtg.CtgEdit) {
            shouldBeActive = undefined;
        } else if (slength(this.vci.getOptionS('viewingScriptVelId'))) {
            shouldBeActive = this.editor;
        } else if (!selected) {
            shouldBeActive = this.panelEmpty;
        } else {
            shouldBeActive = this.panels.find(selected.getType().toString()) || this.panelEmpty;
        }

        let arPanels = this.panels.getVals();
        for (let i = 0, len = arPanels.length; i < len; i++) {
            let panel = arPanels[i];
            panel.setVisible(this.vci.UI512App(), false);
        }

        if (shouldBeActive) {
            shouldBeActive.setVisible(this.vci.UI512App(), true);
        }

        this.active = shouldBeActive;
        if (this.active) {
            this.active.refreshFromModel(this.vci.UI512App());
        }
    }

    /**
     * save changes
     */
    saveChangesToModel(onlyCheckIfDirty: boolean) {
        if (this.active && getToolCategory(this.vci.getTool()) === VpcToolCtg.CtgEdit) {
            this.active.saveChangesToModel(this.vci.UI512App(), onlyCheckIfDirty);
            this.updateUI512Els();
        }
    }

    /**
     * by calling saveChangesToModel with onlyCheckIfDirty flag, we can
     * compare what is typed in the ui with the current actual state
     */
    areThereUnsavedChanges() {
        try {
            this.saveChangesToModel(true);
        } catch (e) {
            if (
                e.isUi512Error &&
                scontains(e.toString(), msgNotification) &&
                scontains(e.toString(), VpcPanelScriptEditor.thereArePendingChanges)
            ) {
                return true;
            } else {
                throw e;
            }
        }

        return false;
    }

    /**
     * respond to keydown
     */
    respondKeydown(d: KeyDownEventDetails) {
        if (this.active && this.active instanceof VpcEditPanelsBase && d.readableShortcut === 'Enter') {
            this.saveChangesToModel(false);
            d.setHandled();
        }
    }

    /**
     * respond to clicking a checkbox
     */
    protected toggleIfClickedCheckbox(short: string, el: UI512Element) {
        if (short && short.startsWith('toggle##')) {
            let vel = this.selectedVel('selectedVelId');
            if (vel) {
                el.set('checkmark', !el.getB('checkmark'));
            }
        }
    }

    /**
     * respond to mouse down, we'll save changes
     */
    respondMouseDown(d: MouseDownEventDetails) {
        if (this.active) {
            /* any click, no matter where, saves changes */
            this.active.saveChangesToModel(this.vci.UI512App(), false);
        }
    }

    /**
     * respond to mouseup, and pass to the panel
     */
    respondMouseUp(d: MouseUpEventDetails) {
        if (this.active && d.elClick) {
            let isOnPanel = this.active.fromFullId(d.elClick.id);
            if (isOnPanel) {
                this.toggleIfClickedCheckbox(isOnPanel, d.elClick);
                this.saveChangesToModel(false);

                if (d.elClick.id && d.elClick.id.endsWith('##btnScript')) {
                    this.editor.respondToClick(this.vci.UI512App(), d.elClick.id);
                } else if (d.elClick.id && this.active instanceof VpcPanelScriptEditor) {
                    this.editor.respondToClick(this.vci.UI512App(), d.elClick.id);
                } else if (d.elClick.id && d.elClick.id.endsWith('##btnGenPart')) {
                    let action =
                        this.vci.getOptionN('currentTool') === VpcTool.Button ? 'mnuObjectsNewBtn' : 'mnuObjectsNewFld';
                    this.vci.performMenuAction(action);
                }
            }
        }
    }

    /**
     * initialize layout
     */
    init(pr: UI512PresenterBase) {
        this.editor.vci = this.vci;
        this.panels.add(VpcElType.Btn.toString(), new VpcEditPanelsBtn('editPanelBtn'));
        this.panels.add(VpcElType.Card.toString(), new VpcEditPanelsCard('editPanelCd'));
        this.panels.add(VpcElType.Fld.toString(), new VpcEditPanelsField('editPanelFld'));
        this.panels.add(VpcElType.Stack.toString(), new VpcEditPanelsStack('editPanelStack'));
        this.panels.add(VpcElType.Unknown.toString(), throwIfUndefined(this.panelEmpty, '6v|'));
        this.panels.add(VpcElType.Product.toString(), this.editor);
        for (let panel of this.panels.getVals()) {
            panel.vci = this.vci;
            panel.x = this.vci.bounds()[0] + ScreenConsts.xAreaWidth + 1;
            panel.y = this.vci.bounds()[1] + ScreenConsts.yMenuBar + ToolboxDims.IconH + 8;
            panel.logicalWidth = ScreenConsts.ScreenWidth - (ScreenConsts.xAreaWidth + 1);
            panel.logicalHeight = ScreenConsts.yAreaHeight - ToolboxDims.IconH;
            panel.create(pr, this.vci.UI512App());
            panel.setVisible(this.vci.UI512App(), false);
            panel.cbGetAndValidateSelectedVel = b => this.selectedVel(b);
        }
    }
}
