
/* auto */ import { getUI512WindowBounds } from './../utils/utilsDrawConstants';
/* auto */ import { RenderComplete, RepeatingTimer } from './../utils/util512Higher';
/* auto */ import { ScrollbarImpl } from './../textedit/ui512Scrollbar';
/* auto */ import { UI512PresenterBase } from './ui512PresenterBase';
/* auto */ import { MenuPositioning } from './../menu/ui512MenuPositioning';
/* auto */ import { ChangeContext, MouseDragStatus } from './../draw/ui512Interfaces';
/* auto */ import { UI512ElTextField } from './../elements/ui512ElementTextField';
/* auto */ import { UI512MenuRoot } from './../elements/ui512ElementMenu';
/* auto */ import { UI512Element } from './../elements/ui512Element';
/* auto */ import { ClipManager } from './../textedit/ui512ClipManager';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * a Presenter receives Events,
 * updates Models accordingly,
 * and sends Models to ElementsView to be drawn.
 */
export abstract class UI512Presenter extends UI512PresenterBase {
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
            for (let i = 0, len = els.length; i < len; i++) {
                let el = els[i];
                let cmp = new RenderComplete();
                if (el instanceof UI512ElTextField) {
                    new ScrollbarImpl().setPositions(this.app, grp, el, cmp);
                } else if (el instanceof UI512MenuRoot) {
                    MenuPositioning.setMenuPositions(this.app, el, cmp);
                }

                if (!cmp.complete) {
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
