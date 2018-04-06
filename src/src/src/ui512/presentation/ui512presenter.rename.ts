
/* auto */ import { RenderComplete, RepeatingTimer, Root } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { getStandardWindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512Lang, UI512LangNull } from '../../ui512/lang/langbase.js';
/* auto */ import { ChangeContext, MouseDragStatus } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512elementstextfield.js';
/* auto */ import { UI512MenuRoot } from '../../ui512/elements/ui512elementsmenu.js';
/* auto */ import { MenuPositioning } from '../../ui512/menu/ui512menurender.js';
/* auto */ import { ClipManager } from '../../ui512/textedit/ui512clipboard.js';
/* auto */ import { ScrollbarImpl } from '../../ui512/textedit/ui512scrollbar.js';
/* auto */ import { UI512ControllerBase } from '../../ui512/presentation/ui512presenterbase.js';

export abstract class UI512Controller extends UI512ControllerBase {
    readonly timerblinkperiod = 500;
    timerSlowIdle = new RepeatingTimer(this.timerblinkperiod);
    useOSClipboard = false;
    mouseDragStatus: number = MouseDragStatus.None;
    lang: UI512Lang = new UI512LangNull();

    init(root: Root) {
        let clipManager = new ClipManager();
        clipManager.root = root;
        this.clipManager = clipManager;
    }

    removeEl(gpid: string, elid: string, context = ChangeContext.Default) {
        let grp = this.app.getGroup(gpid);
        let el = grp.findEl(elid);

        if (el && el instanceof UI512ElTextField) {
            new ScrollbarImpl().removeScrollbarField(this.app, grp, el);
        } else if (el && el instanceof UI512MenuRoot) {
            MenuPositioning.removeMenuRoot(this.app, grp, el);
        } else if (el) {
            grp.removeElement(elid, context);
        }
    }

    getStandardWindowBounds() {
        return getStandardWindowBounds();
    }

    rebuildFieldScrollbars() {
        for (let grp of this.app.iterGrps()) {
            // don't modify while iterating
            let els: UI512Element[] = [];
            for (let el of grp.iterEls()) {
                els.push(el);
            }

            // now we can modify safely
            let stilldirty: { [key: string]: boolean } = {};
            for (let el of els) {
                if (el instanceof UI512ElTextField) {
                    new ScrollbarImpl().rebuildFieldScrollbar(this.app, grp, el);
                }
            }
        }
    }

    protected setPositionsForRender(root: Root, cmptotal: RenderComplete) {
        for (let grp of this.app.iterGrps()) {
            // don't modify while iterating!
            let els: UI512Element[] = [];
            for (let el of grp.iterEls()) {
                els.push(el);
            }

            // now we can modify safely
            let stilldirty: { [key: string]: boolean } = {};
            for (let el of els) {
                let cmpthis = new RenderComplete();
                if (el instanceof UI512ElTextField) {
                    new ScrollbarImpl().setScrollbarPositionsForRender(root, this.app, grp, el, cmpthis);
                } else if (el instanceof UI512MenuRoot) {
                    MenuPositioning.setMenubarPositionsForRender(root, this.app, el, cmpthis);
                }

                if (!cmpthis.complete) {
                    stilldirty[el.id] = true;
                    cmptotal.complete = false;
                }
            }

            for (let el of grp.iterEls()) {
                el.setdirty(stilldirty[el.id] === true);
            }
        }
    }
}
