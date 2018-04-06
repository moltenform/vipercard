
/* auto */ import { slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { VpcTool, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcAppInterfaceLayer } from '../../vpcui/modelrender/vpcPaintRender.js';

export class VpcAppResizeHandles extends VpcAppInterfaceLayer {
    readonly resizeBoxSize = 8;
    sizeHandles: UI512Element[] = [];
    whichHandle(id: string) {
        if (id === 'grpAppHelperElemsHandle0') {
            return 0;
        } else if (id === 'grpAppHelperElemsHandle1') {
            return 1;
        }
        if (id === 'grpAppHelperElemsHandle2') {
            return 2;
        }
        if (id === 'grpAppHelperElemsHandle3') {
            return 3;
        } else {
            return undefined;
        }
    }

    static getGrpHelperElems(app: UI512Application) {
        let fnd = app.findGroup('grpAppHelperElems');
        if (fnd) {
            return fnd;
        } else {
            let grp = new UI512ElGroup('grpAppHelperElems');
            app.addGroup(grp);
            return grp;
        }
    }

    init() {
        // create resize handles
        let grpHelperElems = VpcAppResizeHandles.getGrpHelperElems(this.appli.UI512App());
        for (let i = 0; i < 4; i++) {
            let handle = new UI512ElButton(`grpAppHelperElemsHandle${i}`);
            grpHelperElems.addElement(this.appli.UI512App(), handle);
            handle.set('style', UI512BtnStyle.Rectangle);
            handle.set('visible', true);
            handle.set('autohighlight', false);
            handle.set('highlightactive', true);
            handle.setDimensions(0, 0, this.resizeBoxSize, this.resizeBoxSize);
            this.sizeHandles[i] = handle;
        }
    }

    getSelectedUiElForHandles(currentTool: VpcTool) {
        let selectedVelId = this.appli.getOption_s('selectedVelId');
        if (getToolCategory(currentTool) === VpcToolCtg.CtgEdit && slength(selectedVelId)) {
            // if the current card / stack is selected,
            // we won't find an element, that's ok.
            let uigrp = this.appli.UI512App().getGroup('VpcModelRender');
            return uigrp.findEl('VpcModelRender$$' + selectedVelId);
        } else {
            return undefined;
        }
    }

    updateUI512Els() {
        let currentTool = this.appli.getOption_n('currentTool');
        let uiel = this.getSelectedUiElForHandles(currentTool);
        if (uiel) {
            this.sizeHandles[0].setDimensions(
                uiel.x - this.sizeHandles[0].w / 2,
                uiel.y - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );
            this.sizeHandles[1].setDimensions(
                uiel.x + uiel.w - this.sizeHandles[0].w / 2,
                uiel.y - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );
            this.sizeHandles[2].setDimensions(
                uiel.x - this.sizeHandles[0].w / 2,
                uiel.y + uiel.h - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );
            this.sizeHandles[3].setDimensions(
                uiel.x + uiel.w - this.sizeHandles[0].w / 2,
                uiel.y + uiel.h - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );
        } else {
            for (let handle of this.sizeHandles) {
                handle.setDimensions(-400, -400, handle.w, handle.h);
            }
        }
    }
}
