
/* auto */ import { ui512RespondError } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root, cast } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ChangeContext, MenuOpenState } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512MenuDropdown, UI512MenuItem, UI512MenuRoot } from '../../ui512/elements/ui512elementsmenu.js';
/* auto */ import { MenuItemClickedDetails, MouseDownEventDetails, MouseEnterDetails, MouseLeaveDetails, MouseUpEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512presenterwithmenu.js';
/* auto */ import { MenuPositioning } from '../../ui512/menu/ui512menurender.js';
/* auto */ import { IgnoreDuringAnimation } from '../../ui512/menu/ui512menuanimation.js';

export class MenuBehavior {
    static setwhichIsExpanded(
        c: UI512PresenterWithMenuInterface,
        menubar: UI512MenuRoot,
        which: number,
        context = ChangeContext.Default
    ) {
        if (menubar.get_n('whichIsExpanded') !== which) {
            menubar.set('whichIsExpanded', which);

            // make all the items unhighlighted
            for (let dropdn of menubar.getchildren(c.app)) {
                dropdn.set('highlightactive', false);
                for (let item of dropdn.getchildren(c.app)) {
                    item.set('highlightactive', false);
                }
            }
        }
    }

    static setActiveMenuByHeaderId(c: UI512PresenterWithMenuInterface, chosenid: string) {
        let menubar = MenuPositioning.getMenuRoot(c.app);
        let dropdns = menubar.getchildren(c.app);
        for (let i = 0; i < dropdns.length; i++) {
            let menu = dropdns[i];
            if (chosenid === menu.id) {
                MenuBehavior.closeAllActiveMenus(c);
                MenuBehavior.setwhichIsExpanded(c, menubar, i);
                return true;
            }
        }

        return false;
    }

    static canHighlightMenuItem(el: UI512Element) {
        if (el instanceof UI512MenuItem) {
            return el.enabled && el.get_s('labeltext') !== '---';
        }

        return false;
    }

    static closeAllActiveMenus(c: UI512PresenterWithMenuInterface) {
        // close all the menus.
        let menubar = MenuPositioning.getMenuRoot(c.app);
        menubar.set('whichIsExpanded', -1);
    }

    static isAnyMenuActive(c: UI512PresenterWithMenuInterface) {
        let menubar = MenuPositioning.getMenuRoot(c.app);
        return menubar.get_n('whichIsExpanded') >= 0;
    }

    static respondToMenuItemClick(
        c: UI512PresenterWithMenuInterface,
        root: Root,
        item: UI512MenuItem,
        d: MouseUpEventDetails
    ) {
        let sendEvent = () => {
            MenuBehavior.closeAllActiveMenus(c);
            c.openState = MenuOpenState.MenusClosed;

            try {
                c.rawEvent(root, new MenuItemClickedDetails(item.id, d.mods));
                if ((c as any).cursorRefreshPending !== undefined) {
                    (c as any).cursorRefreshPending = true;
                }
            } catch (e) {
                ui512RespondError(e, 'MenuItemClicked response');
            }
        };

        // don't add any listeners; we'll ignore all events during the anim
        let ignore = new IgnoreDuringAnimation(item, sendEvent);
        c.tmpIgnore = ignore;
        ignore.capture(c);

        // don't send the normal mouse-up event
        d.setHandled();
    }

    static onMouseDown(c: UI512PresenterWithMenuInterface, root: Root, d: MouseDownEventDetails) {
        if (d.button !== 0) {
            return;
        }

        if (d.el && d.el instanceof UI512MenuDropdown) {
            if (c.openState === MenuOpenState.MenusClosed) {
                if (d.el.id !== 'topClock') {
                    MenuBehavior.setActiveMenuByHeaderId(c, d.el.id);
                    c.openState = MenuOpenState.MenusOpenInitialMouseDown;
                }
            }
        }
    }

    static onMouseUp(c: UI512PresenterWithMenuInterface, root: Root, d: MouseUpEventDetails) {
        if (d.button !== 0) {
            return;
        }

        // for normal buttons, a full click needs mousedown and mouseup on the same element
        // for menu items, it only matters where the mouseup is, ignore elFullClick and use elRaw
        if (d.elRaw && MenuBehavior.canHighlightMenuItem(d.elRaw)) {
            MenuBehavior.respondToMenuItemClick(c, root, cast(d.elRaw, UI512MenuItem), d);
        } else if (d.elRaw && d.elRaw instanceof UI512MenuDropdown) {
            if (c.openState === MenuOpenState.MenusClosed) {
                // pass
            } else if (c.openState === MenuOpenState.MenusOpenInitialMouseDown) {
                c.openState = MenuOpenState.MenusOpen;
            } else if (c.openState === MenuOpenState.MenusOpen) {
                MenuBehavior.closeAllActiveMenus(c);
                c.openState = MenuOpenState.MenusClosed;
            }
        } else {
            MenuBehavior.closeAllActiveMenus(c);
            c.openState = MenuOpenState.MenusClosed;
        }
    }

    static onMouseEnter(c: UI512PresenterWithMenuInterface, root: Root, d: MouseEnterDetails) {
        if (d.el && d.el instanceof UI512MenuItem) {
            d.el.set('highlightactive', true);
        }

        if (d.el && d.el instanceof UI512MenuDropdown && c.openState !== MenuOpenState.MenusClosed) {
            if (d.el.id === 'topClock') {
                MenuBehavior.closeAllActiveMenus(c);
            } else {
                MenuBehavior.setActiveMenuByHeaderId(c, d.el.id);
            }
        }

        if (d.el && d.el instanceof UI512MenuRoot) {
            MenuBehavior.closeAllActiveMenus(c);
        }

        if (!d.el) {
            MenuBehavior.closeAllActiveMenus(c);
        }
    }

    static onMouseLeave(c: UI512PresenterWithMenuInterface, root: Root, d: MouseLeaveDetails) {
        if (d.el && d.el instanceof UI512MenuItem) {
            d.el.set('highlightactive', false);
        }
    }
}
