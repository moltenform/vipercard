
/* auto */ import { RenderComplete, RepeatingTimer } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { getUI512WindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512Lang, UI512LangNull } from '../../ui512/lang/langBase.js';
/* auto */ import { ChangeContext, MouseDragStatus } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementsTextField.js';
/* auto */ import { UI512MenuRoot } from '../../ui512/elements/ui512ElementsMenu.js';
/* auto */ import { MenuPositioning } from '../../ui512/menu/ui512MenuRender.js';
/* auto */ import { ClipManager } from '../../ui512/textedit/ui512Clipboard.js';
/* auto */ import { ScrollbarImpl } from '../../ui512/textedit/ui512Scrollbar.js';
/* auto */ import { UI512ControllerBase } from '../../ui512/presentation/ui512PresenterBase.js';

export abstract class UI512Controller extends UI512ControllerBase {
    readonly timerblinkperiod = 500;
    timerSlowIdle = new RepeatingTimer(this.timerblinkperiod);
    useOSClipboard = false;
    mouseDragStatus: number = MouseDragStatus.None;
    lang: UI512Lang = new UI512LangNull();

    init() {
        let clipManager = new ClipManager();
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
        return getUI512WindowBounds();
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

    protected setPositionsForRender(cmptotal: RenderComplete) {
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
                    new ScrollbarImpl().setScrollbarPositionsForRender(this.app, grp, el, cmpthis);
                } else if (el instanceof UI512MenuRoot) {
                    MenuPositioning.setMenubarPositionsForRender(this.app, el, cmpthis);
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
