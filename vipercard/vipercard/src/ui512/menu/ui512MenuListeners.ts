
/* auto */ import { respondUI512Error } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { cast } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ChangeContext, MenuOpenState } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512MenuDropdown, UI512MenuItem, UI512MenuRoot } from '../../ui512/elements/ui512ElementsMenu.js';
/* auto */ import { MenuItemClickedDetails, MouseDownEventDetails, MouseEnterDetails, MouseLeaveDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512PresenterWithMenu.js';
/* auto */ import { MenuPositioning } from '../../ui512/menu/ui512MenuRender.js';
/* auto */ import { IgnoreEventsForMenuBlinkAnimation } from '../../ui512/menu/ui512MenuAnimation.js';

/**
 * menu behaviors, opening the menu when you click on it and so on.
 */
export class MenuBehavior {
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
        if (menuRoot.get_n('whichIsExpanded') !== which) {
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
                MenuBehavior.closeAllActiveMenus(pr);
                MenuBehavior.setwhichIsExpanded(pr, menuRoot, i);
                return;
            }
        }
    }

    /**
     * can this item be highlighted
     */
    static canHighlightMenuItem(el: UI512Element) {
        if (el instanceof UI512MenuItem) {
            return el.enabled && el.get_s('labeltext') !== '---';
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
        return menuRoot.get_n('whichIsExpanded') >= 0;
    }

    /**
     * when clicking a menu item,
     * queue the MenuItemClicked event and start the animation
     */
    static respondToMenuItemClick(pr: UI512PresenterWithMenuInterface, item: UI512MenuItem, d: MouseUpEventDetails) {
        let cbAfterAnim = () => {
            MenuBehavior.closeAllActiveMenus(pr);
            pr.openState = MenuOpenState.MenusClosed;

            try {
                pr.rawEvent(new MenuItemClickedDetails(item.id, d.mods));
                pr.queueRefreshCursor();
            } catch (e) {
                respondUI512Error(e, 'MenuItemClicked response');
            }
        };

        /* ignore all events during the animation */
        let playAnim = new IgnoreEventsForMenuBlinkAnimation(item, cbAfterAnim);
        pr.tmpIgnore = playAnim;
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
                    MenuBehavior.setActiveMenu(pr, d.el.id);
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

        /* for normal buttons, a full click needs mouseDown and mouseUp on the same element
           for menu items, it only matters where the mouseUp is, i.e. use elRaw instead of elFullClick */

        if (d.elRaw && MenuBehavior.canHighlightMenuItem(d.elRaw)) {
            MenuBehavior.respondToMenuItemClick(pr, cast(d.elRaw, UI512MenuItem), d);
        } else if (d.elRaw && d.elRaw instanceof UI512MenuDropdown) {
            if (pr.openState === MenuOpenState.MenusClosed) {
                /* do nothing, the menu is closed */
            } else if (pr.openState === MenuOpenState.MenusOpenInitialMouseDown) {
                /* in original os, you had to hold mouse down on the menus the entire time
                in ours, you can click once and the menu stays open*/
                pr.openState = MenuOpenState.MenusOpen;
            } else if (pr.openState === MenuOpenState.MenusOpen) {
                /* the menus were open, so clicking closes them */
                MenuBehavior.closeAllActiveMenus(pr);
                pr.openState = MenuOpenState.MenusClosed;
            }
        } else {
            /* clicking away from the menu closes all menus */
            MenuBehavior.closeAllActiveMenus(pr);
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

        if (d.el && d.el instanceof UI512MenuDropdown && pr.openState !== MenuOpenState.MenusClosed) {
            if (d.el.id === 'topClock') {
                MenuBehavior.closeAllActiveMenus(pr);
            } else {
                MenuBehavior.setActiveMenu(pr, d.el.id);
            }
        }

        if (d.el && d.el instanceof UI512MenuRoot) {
            MenuBehavior.closeAllActiveMenus(pr);
        }

        if (!d.el) {
            MenuBehavior.closeAllActiveMenus(pr);
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
