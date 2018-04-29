
/* auto */ import { RenderComplete, RepeatingTimer } from '../../ui512/utils/utils512.js';
/* auto */ import { getUI512WindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { ChangeContext, MouseDragStatus } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { UI512MenuRoot } from '../../ui512/elements/ui512ElementMenu.js';
/* auto */ import { MenuPositioning } from '../../ui512/menu/ui512MenuPositioning.js';
/* auto */ import { ClipManager } from '../../ui512/textedit/ui512ClipManager.js';
/* auto */ import { ScrollbarImpl } from '../../ui512/textedit/ui512Scrollbar.js';
/* auto */ import { UI512PresenterBase } from '../../ui512/presentation/ui512PresenterBase.js';

/**
 * a Presenter receives Events,
 * updates Models accordingly,
 * and sends Models to ElementsView to be drawn.
 */
export abstract class UI512Presenter extends UI512PresenterBase {
    isUI512Presenter = true;
    timerSlowIdlePeriod = 500;
    timerSlowIdle = new RepeatingTimer(this.timerSlowIdlePeriod);
    useOSClipboard = false;
    mouseDragStatus: number = MouseDragStatus.None;

    /**
     * init the presenter
     */
    init() {
        let clipManager = new ClipManager();
        this.clipManager = clipManager;
    }

    /**
     * remove an element
     */
    removeEl(gpid: string, elId: string, context = ChangeContext.Default) {
        let grp = this.app.getGroup(gpid);
        let el = grp.findEl(elId);

        if (el && el instanceof UI512ElTextField) {
            new ScrollbarImpl().removeScrollbarField(this.app, grp, el);
        } else if (el && el instanceof UI512MenuRoot) {
            MenuPositioning.removeMenuRoot(this.app, grp, el);
        } else if (el) {
            grp.removeElement(elId, context);
        }
    }

    /**
     * get bounds/dimensions of the window
     */
    getStandardWindowBounds() {
        return getUI512WindowBounds();
    }

    /**
     * create the elements to make a scrollbar for a field
     * must be called after adding a field with a scrollbar
     */
    rebuildFieldScrollbars() {
        for (let grp of this.app.iterGrps()) {
            /* don't modify while iterating */
            let els: UI512Element[] = [];
            for (let el of grp.iterEls()) {
                els.push(el);
            }

            /* now we can modify safely */
            let stilldirty: { [key: string]: boolean } = {};
            let builder = new ScrollbarImpl();
            for (let el of els) {
                if (el instanceof UI512ElTextField) {
                    if (el.getB('scrollbar')) {
                        builder.buildScrollbar(this.app, grp, el);
                    } else {
                        builder.removeScrollbar(this.app, grp, el);
                    }
                }
            }
        }
    }

    /**
     * every time we call render, ensure that scrollbars and menuitems have the right positions.
     */
    protected setPositionsForRender(cmpTotal: RenderComplete) {
        for (let grp of this.app.iterGrps()) {
            /* don't modify while iterating */
            let els: UI512Element[] = [];
            for (let el of grp.iterEls()) {
                els.push(el);
            }

            /* now we can modify safely */
            let stillDirty: { [key: string]: boolean } = {};
            for (let el of els) {
                let cmpthis = new RenderComplete();
                if (el instanceof UI512ElTextField) {
                    new ScrollbarImpl().setPositions(this.app, grp, el, cmpthis);
                } else if (el instanceof UI512MenuRoot) {
                    MenuPositioning.setMenuPositions(this.app, el, cmpthis);
                }

                if (!cmpthis.complete) {
                    stillDirty[el.id] = true;
                    cmpTotal.complete = false;
                }
            }

            for (let el of grp.iterEls()) {
                el.setDirty(stillDirty[el.id] === true);
            }
        }
    }
}
