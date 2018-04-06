
/* auto */ import { O, msgNotification, scontains, throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { MapKeyToObject, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { KeyDownEventDetails, MouseDownEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { UI512ControllerBase } from '../../ui512/presentation/ui512presenterbase.js';
/* auto */ import { VpcElType, VpcTool, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcModel } from '../../vpc/vel/velmodel.js';
/* auto */ import { VpcAppInterfaceLayer } from '../../vpcui/modelrender/vpcpaintrender.js';
/* auto */ import { ToolboxDims } from '../../vpcui/panels/vpctoolboxpatterns.js';
/* auto */ import { IsPropPanel } from '../../vpcui/panels/vpcpanelsbase.js';
/* auto */ import { VpcPanelScriptEditor } from '../../vpcui/panels/vpceditscripteditor.js';
/* auto */ import { PropPanelCompositeBase } from '../../vpcui/panels/vpceditpanelsbase.js';
/* auto */ import { PropPanelCompositeBlank } from '../../vpcui/panels/vpceditpanelsempty.js';
/* auto */ import { PropPanelCompositeField } from '../../vpcui/panels/vpceditpanelsfld.js';
/* auto */ import { PropPanelCompositeBtn } from '../../vpcui/panels/vpceditpanelsbtn.js';
/* auto */ import { PropPanelCompositeCard } from '../../vpcui/panels/vpceditpanelscard.js';
/* auto */ import { PropPanelCompositeStack } from '../../vpcui/panels/vpceditpanelsstack.js';
/* auto */ import { VpcAppResizeHandles } from '../../vpcui/panels/vpclyrdraghandles.js';

export class VpcAppPropPanel extends VpcAppInterfaceLayer {
    blank = new PropPanelCompositeBlank('editPanelBlank');
    panels = new MapKeyToObject<IsPropPanel>();
    editor = new VpcPanelScriptEditor('editPanelScript');
    active: O<IsPropPanel> = this.blank;

    // set in initLayers
    model: VpcModel;
    handles: VpcAppResizeHandles;
    init(c: UI512ControllerBase) {
        this.editor.appli = this.appli;
        this.panels.add(VpcElType.Btn.toString(), new PropPanelCompositeBtn('editPanelBtn'));
        this.panels.add(VpcElType.Card.toString(), new PropPanelCompositeCard('editPanelCd'));
        this.panels.add(VpcElType.Fld.toString(), new PropPanelCompositeField('editPanelFld'));
        this.panels.add(VpcElType.Stack.toString(), new PropPanelCompositeStack('editPanelStack'));
        this.panels.add(VpcElType.Unknown.toString(), throwIfUndefined(this.blank, '6v|'));
        this.panels.add(VpcElType.Product.toString(), this.editor);
        for (let panel of this.panels.getVals()) {
            panel.appli = this.appli;
            panel.x = this.appli.bounds()[0] + ScreenConsts.xareawidth + 1;
            panel.y = this.appli.bounds()[1] + ScreenConsts.ymenubar + ToolboxDims.toolsIconH + 8;
            panel.logicalWidth = ScreenConsts.screenwidth - (ScreenConsts.xareawidth + 1);
            panel.logicalHeight = ScreenConsts.yareaheight - ToolboxDims.toolsIconH;
            panel.create(c, this.appli.UI512App(), this.appli.lang());
            panel.setVisible(this.appli.UI512App(), false);
            panel.cbGetAndValidateSelectedVel = b => this.getAndValidateSelectedVel(b);
        }
    }

    getEditToolSelectedFldOrBtn() {
        let vel = this.getAndValidateSelectedVel('selectedVelId');
        if (vel && (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld)) {
            return vel;
        } else {
            return undefined;
        }
    }

    getAndValidateSelectedVel(propname: string) {
        // the selectedVelId could be out of date.
        let selVel = this.appli.getOption_s(propname);
        let vel = this.appli.getModel().findByIdUntyped(selVel);
        let currentCard = this.appli.getModel().getCurrentCard().id;
        if (vel && getToolCategory(this.appli.getTool()) === VpcToolCtg.ctgEdit) {
            // make sure the parent makes sense
            if (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld) {
                if (vel.parentId === currentCard) {
                    return vel;
                }
            } else if (vel.getType() === VpcElType.Card) {
                if (vel.id === currentCard) {
                    return vel;
                }
            } else if (vel.getType() === VpcElType.Stack) {
                return vel;
            }
        }

        return undefined;
    }

    updateUI512Els() {
        let selected = this.getAndValidateSelectedVel('selectedVelId');
        let shouldBeActive: O<IsPropPanel>;
        if (getToolCategory(this.appli.getOption_n('currentTool')) !== VpcToolCtg.ctgEdit) {
            shouldBeActive = undefined;
        } else if (slength(this.appli.getOption_s('viewingScriptVelId'))) {
            shouldBeActive = this.editor;
        } else if (!selected) {
            shouldBeActive = this.blank;
        } else {
            shouldBeActive = this.panels.find(selected.getType().toString()) || this.blank;
        }

        for (let panel of this.panels.getVals()) {
            panel.setVisible(this.appli.UI512App(), false);
        }

        if (shouldBeActive) {
            shouldBeActive.setVisible(this.appli.UI512App(), true);
        }

        this.active = shouldBeActive;
        if (this.active) {
            this.active.refreshFromModel(this.appli.UI512App());
        }
    }

    saveChangesToModel(onlyCheckIfDirty: boolean) {
        if (this.active && getToolCategory(this.appli.getTool()) === VpcToolCtg.ctgEdit) {
            this.active.saveChangesToModel(this.appli.UI512App(), onlyCheckIfDirty);
            this.updateUI512Els();
        }
    }

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

    respondKeydown(d: KeyDownEventDetails) {
        if (this.active && this.active instanceof PropPanelCompositeBase && d.readableShortcut === 'Enter') {
            this.saveChangesToModel(false);
            d.setHandled();
        }
    }

    protected toggleIfClickedCheckbox(short: string, el: UI512Element) {
        if (short && short.startsWith('toggle##')) {
            let vel = this.getAndValidateSelectedVel('selectedVelId');
            if (vel) {
                el.set('checkmark', !el.get_b('checkmark'));
            }
        }
    }

    respondMouseDown(d: MouseDownEventDetails) {
        if (this.active) {
            // any click, no matter where, saves changes
            this.active.saveChangesToModel(this.appli.UI512App(), false);
        }
    }

    respondMouseUp(d: MouseUpEventDetails) {
        if (this.active && d.elClick) {
            let isOnPanel = this.active.fromFullId(d.elClick.id);
            if (isOnPanel) {
                this.toggleIfClickedCheckbox(isOnPanel, d.elClick);
                this.saveChangesToModel(false);

                if (d.elClick.id && d.elClick.id.endsWith('##btnScript')) {
                    this.editor.respondToClick(this.appli.UI512App(), d.elClick.id);
                } else if (d.elClick.id && this.active instanceof VpcPanelScriptEditor) {
                    this.editor.respondToClick(this.appli.UI512App(), d.elClick.id);
                } else if (d.elClick.id && d.elClick.id.endsWith('##btnGenPart')) {
                    let action =
                        this.appli.getOption_n('currentTool') === VpcTool.button
                            ? 'mnuObjectsNewBtn'
                            : 'mnuObjectsNewFld';
                    this.appli.performMenuAction(action);
                }
            }
        }
    }
}
