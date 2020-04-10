
/* auto */ import { respondUI512Error } from './../utils/util512Assert';
/* auto */ import { cast } from './../utils/util512';
/* auto */ import { UI512PresenterWithMenuInterface } from './ui512PresenterWithMenu';
/* auto */ import { MenuPositioning } from './ui512MenuPositioning';
/* auto */ import { SuspendEventsForMenuBlinkAnimation } from './ui512MenuAnimation';
/* auto */ import { ChangeContext, MenuOpenState } from './../draw/ui512Interfaces';
/* auto */ import { MenuItemClickedDetails, MouseDownEventDetails, MouseEnterDetails, MouseLeaveDetails, MouseUpEventDetails } from './ui512Events';
/* auto */ import { UI512MenuDropdown, UI512MenuItem, UI512MenuRoot } from './../elements/ui512ElementMenu';
/* auto */ import { UI512Element } from './../elements/ui512Element';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * menu listeners+behaviors, opening the menu when you click on it and so on.
 */
export class MenuListeners {
    /**
     * open this menu and make all items unhighlighted
     * it is wrong if you'd open a window and one of the items is still highlighted from earlier
     */
    static setwhichIsExpanded(
        pr: UI512PresenterWithMenuInterface,
        menuRoot: UI512MenuRoot,
        which: number,
        context = ChangeContext.Default
    ) {
        if (menuRoot.getN('whichIsExpanded') !== which) {
            menuRoot.set('whichIsExpanded', which);

            /* make all the items unhighlighted */
            for (let dropDn of menuRoot.getchildren(pr.app)) {
                dropDn.set('highlightactive', false);

                for (let item of dropDn.getChildren(pr.app)) {
                    item.set('highlightactive', false);
                }
            }
        }
    }

    /**
     * open this menu and close all others
     */
    static setActiveMenu(pr: UI512PresenterWithMenuInterface, chosenid: string) {
        let menuRoot = MenuPositioning.getMenuRoot(pr.app);
        let dropDns = menuRoot.getchildren(pr.app);
        for (let i = 0; i < dropDns.length; i++) {
            let menu = dropDns[i];
            if (chosenid === menu.id) {
                MenuListeners.closeAllActiveMenus(pr);
                MenuListeners.setwhichIsExpanded(pr, menuRoot, i);
                return;
            }
        }
    }

    /**
     * can this item be highlighted
     */
    static canHighlightMenuItem(el: UI512Element) {
        if (el instanceof UI512MenuItem) {
            return el.enabled && el.getS('labeltext') !== '---';
        }

        return false;
    }

    /**
     * close all the menus
     */
    static closeAllActiveMenus(pr: UI512PresenterWithMenuInterface) {
        let menuRoot = MenuPositioning.getMenuRoot(pr.app);
        menuRoot.set('whichIsExpanded', -1);
    }

    /**
     * is any menu active
     */
    static isAnyMenuActive(pr: UI512PresenterWithMenuInterface) {
        let menuRoot = MenuPositioning.getMenuRoot(pr.app);
        return menuRoot.getN('whichIsExpanded') >= 0;
    }

    /**
     * when clicking a menu item,
     * queue the MenuItemClicked event and start the animation
     */
    static respondToMenuItemClick(
        pr: UI512PresenterWithMenuInterface,
        item: UI512MenuItem,
        d: MouseUpEventDetails
    ) {
        let cbAfterAnim = () => {
            MenuListeners.closeAllActiveMenus(pr);
            pr.openState = MenuOpenState.MenusClosed;

            try {
                pr.rawEvent(new MenuItemClickedDetails(item.id, d.mods));
                pr.queueRefreshCursor();
            } catch (e) {
                respondUI512Error(e, 'MenuItemClicked response');
            }
        };

        /* ignore all events during the animation */
        let playAnim = new SuspendEventsForMenuBlinkAnimation(item, cbAfterAnim);
        pr.tmpSuspend = playAnim;
        playAnim.start(pr);

        /* don't send the mouse-up event. playAnim will send the MenuItemClicked after animation */
        d.setHandled();
    }

    /**
     * determine if you clicked on a menu dropdown
     */
    static onMouseDown(pr: UI512PresenterWithMenuInterface, d: MouseDownEventDetails) {
        if (d.button !== 0) {
            return;
        }

        if (d.el && d.el instanceof UI512MenuDropdown) {
            if (pr.openState === MenuOpenState.MenusClosed) {
                if (d.el.id !== 'topClock') {
                    MenuListeners.setActiveMenu(pr, d.el.id);
                    pr.openState = MenuOpenState.MenusOpenInitialMouseDown;
                }
            }
        }
    }

    /**
     * determine if you clicked on a dropdown or menu item
     */
    static onMouseUp(pr: UI512PresenterWithMenuInterface, d: MouseUpEventDetails) {
        if (d.button !== 0) {
            return;
        }

        /* for normal btns, a full click needs mouseDn and mouseUp on the same element
           for menu items, it only matters where the mouseUp is, i.e.
                use elRaw instead of elFullClick */

        if (d.elRaw && MenuListeners.canHighlightMenuItem(d.elRaw)) {
            MenuListeners.respondToMenuItemClick(pr, cast(UI512MenuItem, d.elRaw), d);
        } else if (d.elRaw && d.elRaw instanceof UI512MenuDropdown) {
            if (pr.openState === MenuOpenState.MenusClosed) {
                /* do nothing, the menu is closed */
            } else if (pr.openState === MenuOpenState.MenusOpenInitialMouseDown) {
                /* in original os, you had to hold mouse down on the menus the entire time
                in ours, you can click once and the menu stays open*/
                pr.openState = MenuOpenState.MenusOpen;
            } else if (pr.openState === MenuOpenState.MenusOpen) {
                /* the menus were open, so clicking closes them */
                MenuListeners.closeAllActiveMenus(pr);
                pr.openState = MenuOpenState.MenusClosed;
            }
        } else {
            /* clicking away from the menu closes all menus */
            MenuListeners.closeAllActiveMenus(pr);
            pr.openState = MenuOpenState.MenusClosed;
        }
    }

    /**
     * if one of the dropdowns is open, hovering the mouse on another menu should open that menu
     */
    static onMouseEnter(pr: UI512PresenterWithMenuInterface, d: MouseEnterDetails) {
        if (d.el && d.el instanceof UI512MenuItem) {
            d.el.set('highlightactive', true);
        }

        if (
            d.el &&
            d.el instanceof UI512MenuDropdown &&
            pr.openState !== MenuOpenState.MenusClosed
        ) {
            if (d.el.id === 'topClock') {
                MenuListeners.closeAllActiveMenus(pr);
            } else {
                MenuListeners.setActiveMenu(pr, d.el.id);
            }
        }

        if (d.el && d.el instanceof UI512MenuRoot) {
            MenuListeners.closeAllActiveMenus(pr);
        }

        if (!d.el) {
            MenuListeners.closeAllActiveMenus(pr);
        }
    }

    /**
     * un-highlight a menuitem after cursor leaves it
     */
    static onMouseLeave(pr: UI512PresenterWithMenuInterface, d: MouseLeaveDetails) {
        if (d.el && d.el instanceof UI512MenuItem) {
            d.el.set('highlightactive', false);
        }
    }
}
