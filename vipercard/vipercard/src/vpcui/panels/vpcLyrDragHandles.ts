
/* auto */ import { slength } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { VpcTool, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcUILayer } from '../../vpcui/state/vpcInterface.js';

/**
 * resize handles, for moving and resizing a vel
 */
export class VpcAppLyrDragHandles extends VpcUILayer {
    readonly resizeBoxSize = 8;
    readonly sizeHandles: UI512Element[] = [];

    /**
     * get group containing the handles
     */
    static getGrpHelperElems(app: UI512Application) {
        let fnd = app.findGroup('grpAppResizeHandles');
        if (fnd) {
            return fnd;
        } else {
            let grp = new UI512ElGroup('grpAppResizeHandles');
            app.addGroup(grp);
            return grp;
        }
    }

    /**
     * initialize and create resize handles
     */
    init() {
        let grpHelperElems = VpcAppLyrDragHandles.getGrpHelperElems(this.vci.UI512App());
        for (let i = 0; i < 4; i++) {
            let handle = new UI512ElButton(`grpAppResizeHandlesHandle${i}`);
            grpHelperElems.addElement(this.vci.UI512App(), handle);
            handle.set('style', UI512BtnStyle.Rectangle);
            handle.set('visible', true);
            handle.set('autohighlight', false);
            handle.set('highlightactive', true);
            handle.setDimensions(0, 0, this.resizeBoxSize, this.resizeBoxSize);
            this.sizeHandles[i] = handle;
        }
    }

    /**
     * get the target UI512 element, or undefined if none ot present
     */
    getSelectedUIElForHandles(currentTool: VpcTool) {
        let selectedVelId = this.vci.getOptionS('selectedVelId');
        if (getToolCategory(currentTool) === VpcToolCtg.CtgEdit && slength(selectedVelId)) {
            /* if the current card / stack is selected, */
            /* we won't find an element, that's ok, it will return undefined. */
            let grp = this.vci.UI512App().getGroup('VpcModelRender');
            return grp.findEl('VpcModelRender$$' + selectedVelId);
        } else {
            return undefined;
        }
    }

    /**
     * set the handle positions
     * one box is centered on each corner of the element
     */
    updateUI512Els() {
        let currentTool = this.vci.getOptionN('currentTool');
        let el = this.getSelectedUIElForHandles(currentTool);
        if (el) {
            this.sizeHandles[0].setDimensions(
                el.x - this.sizeHandles[0].w / 2,
                el.y - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );

            this.sizeHandles[1].setDimensions(
                el.x + el.w - this.sizeHandles[0].w / 2,
                el.y - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );

            this.sizeHandles[2].setDimensions(
                el.x - this.sizeHandles[0].w / 2,
                el.y + el.h - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );

            this.sizeHandles[3].setDimensions(
                el.x + el.w - this.sizeHandles[0].w / 2,
                el.y + el.h - this.sizeHandles[0].h / 2,
                this.sizeHandles[0].w,
                this.sizeHandles[0].h
            );
        } else {
            for (let i = 0, len = this.sizeHandles.length; i < len; i++) {
                let handle = this.sizeHandles[i];
                handle.setDimensions(-400, -400, handle.w, handle.h);
            }
        }
    }

    /**
     * from handle id to number
     */
    whichHandle(id: string) {
        if (id === 'grpAppResizeHandlesHandle0') {
            return 0;
        } else if (id === 'grpAppResizeHandlesHandle1') {
            return 1;
        } else if (id === 'grpAppResizeHandlesHandle2') {
            return 2;
        } else if (id === 'grpAppResizeHandlesHandle3') {
            return 3;
        } else {
            return undefined;
        }
    }
}
