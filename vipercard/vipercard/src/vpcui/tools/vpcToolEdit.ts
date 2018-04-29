
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { UI512Cursors } from '../../ui512/utils/utilsCursors.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { VpcElType, VpcTool } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcElBase } from '../../vpc/vel/velBase.js';
/* auto */ import { VpcAppLyrPanels } from '../../vpcui/panels/vpcLyrPanels.js';
/* auto */ import { VpcAppUIToolBase } from '../../vpcui/tools/vpcToolBase.js';

/**
 * implementation for the button tool and field tool
 */
export class VpcAppUIToolEdit extends VpcAppUIToolBase {
    dragStatus: O<EditToolDragState>;
    lyrPanels: VpcAppLyrPanels;

    /**
     * respond to mouse down event
     */
    respondMouseDown(tl: VpcTool, d: MouseDownEventDetails, isVelOrBg: boolean): void {
        this.lyrPanels.respondMouseDown(d);
        if (d.el && d.el.id === 'VpcModelRender$$renderbg') {
            /* click on the screen but on no item: deselect all */
            this.vci.setOption('selectedVelId', '');
        } else if (d.el && d.el.id.startsWith('VpcModelRender$$')) {
            /* click on an item to select it */
            let velId = this.cbModelRender().elIdToVelId(d.el.id) || '';
            if (velId.length && d.el.typename === 'UI512ElTextField') {
                this.vci.setTool(VpcTool.Field);
                this.vci.setOption('selectedVelId', velId);
            } else if (velId.length && d.el.typename === 'UI512ElementButtonBase') {
                this.vci.setTool(VpcTool.Button);
                this.vci.setOption('selectedVelId', velId);
            } else {
                this.vci.setOption('selectedVelId', '');
            }
        } else {
            /* drag a handle to resize a vel */
            let handle = this.lyrPanels.handles.whichHandle(d.el ? d.el.id : '');
            if (handle !== undefined && !this.dragStatus) {
                let vel = this.lyrPanels.selectedVel('selectedVelId');
                if (vel && (vel.getType() === VpcElType.Btn || vel.getType() === VpcElType.Fld)) {
                    let targetEl = this.vci.UI512App().findEl('VpcModelRender$$' + vel.id);
                    if (targetEl) {
                        /* distance from initial click to center of handle */
                        let distanceFromHandleCenterX =
                            d.mouseX -
                            this.lyrPanels.handles.sizeHandles[handle].getN('x') -
                            this.lyrPanels.handles.sizeHandles[0].w / 2;

                        let distanceFromHandleCenterY =
                            d.mouseY -
                            this.lyrPanels.handles.sizeHandles[handle].getN('y') -
                            this.lyrPanels.handles.sizeHandles[0].h / 2;

                        let distanceFromFirstHandleCenterX =
                            d.mouseX -
                            this.lyrPanels.handles.sizeHandles[0].getN('x') -
                            this.lyrPanels.handles.sizeHandles[0].w / 2;

                        let distanceFromFirstHandleCenterY =
                            d.mouseY -
                            this.lyrPanels.handles.sizeHandles[0].getN('y') -
                            this.lyrPanels.handles.sizeHandles[0].h / 2;

                        this.dragStatus = new EditToolDragState(
                            vel,
                            targetEl,
                            handle,
                            distanceFromHandleCenterX,
                            distanceFromHandleCenterY,
                            distanceFromFirstHandleCenterX,
                            distanceFromFirstHandleCenterY
                        );
                    }
                }
            }
        }
    }

    /**
     * respond to mouse move event
     */
    respondMouseMove(tl: VpcTool, d: MouseMoveEventDetails, isVelOrBg: boolean) {
        const minVelW = 5;
        const minVelH = 5;
        if (this.dragStatus) {
            if (this.dragStatus.draggingWhichHandle === 3) {
                /* for the bottom right handle, set the size+width. */
                let centerX = d.mouseX - this.dragStatus.distanceFromHandleCenterX;
                let centerY = d.mouseY - this.dragStatus.distanceFromHandleCenterY;
                let newW = Math.max(minVelW, centerX - this.dragStatus.el.x);
                let newH = Math.max(minVelH, centerY - this.dragStatus.el.y);
                this.dragStatus.el.setDimensions(this.dragStatus.el.x, this.dragStatus.el.y, newW, newH);
            } else {
                /* for the other handles, set the location */
                let newX = d.mouseX - this.dragStatus.distanceFrom1stHandleCenterX;
                let newY = d.mouseY - this.dragStatus.distanceFrom1stHandleCenterY;
                this.dragStatus.el.setDimensions(newX, newY, this.dragStatus.el.w, this.dragStatus.el.h);
            }

            /* refresh ui */
            this.lyrPanels.handles.updateUI512Els();
        }
    }

    /**
     * respond to mouse up event
     */
    respondMouseUp(tl: VpcTool, d: MouseUpEventDetails, isVelOrBg: boolean): void {
        this.lyrPanels.respondMouseUp(d);
        if (this.dragStatus) {
            /* cancel the resize if we're on a different card now or if selected vel was changed */
            let validatedVel = this.lyrPanels.selectedVel('selectedVelId');
            if (
                validatedVel &&
                validatedVel.id === this.dragStatus.vel.id &&
                (validatedVel.getType() === VpcElType.Btn || validatedVel.getType() === VpcElType.Fld)
            ) {
                /* commit the change to the vel */
                let vel = this.dragStatus.vel;
                vel.set('x', this.dragStatus.el.x - this.vci.userBounds()[0]);
                vel.set('y', this.dragStatus.el.y - this.vci.userBounds()[1]);
                vel.set('w', this.dragStatus.el.w);
                vel.set('h', this.dragStatus.el.h);
            }

            this.dragStatus = undefined;
        }
    }

    /**
     * erase any uncommitted partial changes, called by Undo() etc
     */
    cancelCurrentToolAction() {
        this.dragStatus = undefined;
    }

    /**
     * which cursor should be shown if the mouse is over el.
     */
    whichCursor(tl: VpcTool, el: O<UI512Element>): UI512Cursors {
        return UI512Cursors.Arrow;
    }

    /**
     * reset state when opening tool
     */
    onOpenTool() {
        this.cancelCurrentToolAction();
    }

    /**
     * commit changes when leaving tool
     */
    onLeaveTool() {
        this.cancelCurrentToolAction();
        this.lyrPanels.editor.saveChangesToModel(this.vci.UI512App(), false);
        if (this.lyrPanels.active) {
            this.lyrPanels.active.saveChangesToModel(this.vci.UI512App(), false);
        }
    }

    /**
     * respond to backspace and edit->clear
     * delete the selected vel
     */
    onDeleteSelection() {
        let selected = this.lyrPanels.selectedFldOrBtn();
        if (selected) {
            this.vci.setOption('selectedVelId', '');
            this.vci.removeVel(selected);
        }
    }
}

/**
 * state of the edit tool
 */
class EditToolDragState {
    constructor(
        public vel: VpcElBase,
        public el: UI512Element,
        public draggingWhichHandle: number,
        public distanceFromHandleCenterX: number,
        public distanceFromHandleCenterY: number,
        public distanceFrom1stHandleCenterX: number,
        public distanceFrom1stHandleCenterY: number
    ) {}
}
