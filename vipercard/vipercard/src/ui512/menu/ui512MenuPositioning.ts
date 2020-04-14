
/* auto */ import { MenuConsts } from './../utils/utilsDrawConstants';
/* auto */ import { RenderComplete, getRoot } from './../utils/util512Higher';
/* auto */ import { O } from './../utils/util512Base';
/* auto */ import { assertWarn } from './../utils/util512AssertCustom';
/* auto */ import { Util512, assertEq, cast, slength } from './../utils/util512';
/* auto */ import { UI512PresenterWithMenuInterface } from './ui512PresenterWithMenu';
/* auto */ import { UI512MenuDropdown, UI512MenuItem, UI512MenuRoot } from './../elements/ui512ElementMenu';
/* auto */ import { UI512ElGroup } from './../elements/ui512ElementGroup';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../elements/ui512ElementApp';
/* auto */ import { UI512DrawText } from './../draw/ui512DrawText';
/* auto */ import { lng } from './../lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * you can build a menu in code,
 * but for convenience we have a way to build menu from an array
 * see example in uiDemoMenus
 */
export type UI512MenuDefn = [string, string[]] | [string, number, string[]];

/**
 * sets the position of the models
 * and creates a few helper elements
 */
export class MenuPositioning {
    /**
     * create menu helper elements. must be called when adding a menubar.
     */
    static createMenuHelperEls(
        app: UI512Application,
        grpItems: UI512ElGroup,
        menuRoot: UI512MenuRoot
    ) {
        let dropdownBgId = menuRoot.id + '##dropdownBg';
        if (!grpItems.findEl(dropdownBgId)) {
            let dropdownBg = new UI512ElButton(dropdownBgId, menuRoot.observer);
            dropdownBg.set('autohighlight', false);
            dropdownBg.set('style', UI512BtnStyle.Shadow);
            grpItems.addElement(app, dropdownBg);
        }
    }

    /**
     * remove helper elements. call when removing a menubar.
     */
    static removeMenuHelperObjects(
        app: UI512Application,
        grpItems: UI512ElGroup,
        menuRoot: UI512MenuRoot
    ) {
        let dropdownBgId = menuRoot.id + '##dropdownBg';
        grpItems.removeElement(dropdownBgId);
    }

    /**
     * remove a menu
     */
    static removeMenuRoot(
        app: UI512Application,
        grp: UI512ElGroup,
        menuRoot: UI512MenuRoot
    ) {
        let [grpBar, grpItems] = MenuPositioning.getMenuGroups(app, false);
        assertEq(grp.id, grpBar.id, '2]|');
        MenuPositioning.removeMenuHelperObjects(app, grpItems, menuRoot);
        let children = menuRoot.getchildren(app);
        for (let child of children) {
            for (let subchild of child.getChildren(app)) {
                grpItems.removeElement(subchild.id);
            }

            grpBar.removeElement(child.id);
        }

        grpBar.removeElement(menuRoot.id);
    }

    /**
     * set positions of menu items.
     */
    static setMenuItemPositions(
        app: UI512Application,
        menuRoot: UI512MenuRoot,
        header: UI512MenuDropdown,
        complete: RenderComplete
    ) {
        /* highlight the menu name */
        header.set('highlightactive', true);

        /* find the widest string, and set the width based on that */
        let items = header.getChildren(app);
        let widest = MenuPositioning.getWidestString(items);
        if (widest === undefined) {
            /* font has not loaded yet */
            complete.complete = false;
            return;
        }

        let totalHeight = MenuConsts.ItemHeight * items.length;
        let rect = [header.x, header.bottom, widest, totalHeight];
        let isRightSide = header.getN('fixedoffset') !== -1;
        if (isRightSide) {
            /* drawing a menu on the right side, it is right-justified */
            const farRight = app.bounds[0] + app.bounds[2];
            let shiftAmount = rect[0] + rect[2] - farRight;
            if (shiftAmount > 0) {
                rect[0] -= shiftAmount;
            }
        }

        /* draw shadowed bg */
        /* the top of this rect will goes under the main menu bar, so the top line won't be seen */
        let grpItems = MenuPositioning.getMenuGroups(app)[1];
        let dropdownBg = grpItems.getEl(menuRoot.id + '##dropdownBg');
        dropdownBg.setDimensions(
            rect[0],
            rect[1] - 1,
            rect[2],
            rect[3] + 1 + MenuConsts.ShadowSizeBottom /* for the shadow*/
        );

        /* draw items */
        for (let i = 0; i < items.length; i++) {
            items[i].setDimensions(
                rect[0] + MenuConsts.ShadowSizeLeft,
                rect[1] + MenuConsts.ItemHeight * i,
                rect[2] - (MenuConsts.ShadowSizeLeft + MenuConsts.ShadowSizeRight),
                MenuConsts.ItemHeight
            );

            items[i].set('visible', true);
        }
    }

    /**
     * set positions of a menu dropdown.
     */
    static setMenuDropdownPosition(
        app: UI512Application,
        menuRoot: UI512MenuRoot,
        header: UI512MenuDropdown,
        curX: number,
        isExpanded: boolean,
        complete: RenderComplete
    ) {
        /* measure width of the header to draw */
        let drawText = getRoot().getDrawText() as UI512DrawText;
        let curwidth = header.getN('fixedwidth');
        if (curwidth === -1) {
            let measured = drawText.measureString(header.getS('labeltext'));
            if (!measured) {
                complete.complete = false;
                return curX;
            }

            curwidth = measured.newLogicalX + MenuConsts.XSpacing;
        }

        /* x position is overridden, e.g. menus on the right. */
        if (header.getN('fixedoffset') !== -1) {
            curX = header.getN('fixedoffset');
        }

        /* the emulator has a 1 pixel margin between top of screen and menu, */
        /* but we'll not do that because it doesn't look good against black background */
        header.setDimensions(
            curX - 4,
            app.bounds[1],
            curwidth + 5,
            MenuConsts.BarHeight - 1
        );
        curX += curwidth;

        /* draw active one */
        header.set('highlightactive', false);
        if (isExpanded) {
            MenuPositioning.setMenuItemPositions(app, menuRoot, header, complete);

            let grpItems = MenuPositioning.getMenuGroups(app)[1];
            grpItems.setVisible(true);
        } else {
            let children = header.getChildren(app);
            for (let i = 0, len = children.length; i < len; i++) {
                children[i].set('visible', false);
            }
        }

        return curX;
    }

    /**
     * set all menu positions
     */
    static setMenuPositions(
        app: UI512Application,
        menuRoot: UI512MenuRoot,
        complete: RenderComplete
    ) {
        if (!menuRoot || !menuRoot.visible || !menuRoot.getS('childids')) {
            return;
        }

        /* top bar */
        let grpItems = MenuPositioning.getMenuGroups(app)[1];
        menuRoot.setDimensions(
            app.bounds[0],
            app.bounds[1],
            app.bounds[2],
            MenuConsts.BarHeight - 1
        );
        assertWarn(
            grpItems.findEl(menuRoot.id + '##dropdownBg'),
            'J0|forgot to call createMenuHelperEls?'
        );

        /* draw menu headers */
        /* interesting fact: the headers overlap each other. confirmed in emulator */
        let curX = app.bounds[0] + MenuConsts.TopHeaderMargin1;
        let dropDowns = menuRoot.getchildren(app);
        grpItems.setVisible(false);
        for (let i = 0; i < dropDowns.length; i++) {
            let header = dropDowns[i];
            let open = menuRoot.getN('whichIsExpanded') === i;
            curX = MenuPositioning.setMenuDropdownPosition(
                app,
                menuRoot,
                header,
                curX,
                open,
                complete
            );
        }
    }

    /**
     * measure the widest label
     */
    protected static getWidestString(items: UI512MenuItem[]): O<number> {
        let drawText = getRoot().getDrawText() as UI512DrawText;
        let widest = 0;
        for (let i = 0, len = items.length; i < len; i++) {
            let item = items[i];
            let width = drawText.measureString(item.getS('labeltext'));
            if (!width) {
                return undefined;
            }

            widest = Math.max(widest, width.newLogicalX + MenuConsts.AddToWidth);
        }

        return widest;
    }

    /**
     * you can build a menu in code,
     * but for convenience we have a way to build menu from an array
     * see example in uiDemoMenus
     */
    static buildFromArray(pr: UI512PresenterWithMenuInterface, st: UI512MenuDefn[]) {
        let menuRoot = MenuPositioning.getMenuRoot(pr.app);
        let [grpBar, grpItems] = MenuPositioning.getMenuGroups(pr.app);

        /* ensures background items are created first, because they should be behind foreground */
        MenuPositioning.createMenuHelperEls(pr.app, grpItems, menuRoot);

        let dropdowns: string[] = [];
        for (let mnuDef of st) {
            let childIds: string[] = [];
            let dropdown = MenuPositioning.buildDropdnFromArray(
                pr.app,
                grpBar,
                grpItems,
                menuRoot,
                dropdowns,
                childIds,
                mnuDef
            );

            dropdown.set('childids', childIds.join('|'));
        }

        menuRoot.set('childids', dropdowns.join('|'));
    }

    /**
     * you can build a menu in code,
     * but for convenience we have a way to build menu from an array
     */
    protected static buildDropdnFromArray(
        app: UI512Application,
        grpBar: UI512ElGroup,
        grpItems: UI512ElGroup,
        menuRoot: UI512MenuRoot,
        dropdowns: string[],
        childIds: string[],
        ar: UI512MenuDefn
    ) {
        let arMenuHeader = undefined;
        let arMenu = undefined;
        let fixedOffset = -1;
        if (ar.length === 2) {
            [arMenuHeader, arMenu] = ar;
        } else {
            [arMenuHeader, fixedOffset, arMenu] = ar;
        }

        let [headerId, headerLabelUntranslated] = arMenuHeader.split('|');
        let dropdn = new UI512MenuDropdown(headerId);
        dropdowns.push(headerId);
        grpBar.addElementAfter(app, dropdn, menuRoot.id);
        dropdn.set('fixedoffset', fixedOffset);
        if (headerLabelUntranslated.startsWith('icon:')) {
            let [iconGroupId, iconNumber, fixWidth] = headerLabelUntranslated
                .split(':')
                .slice(1);
            dropdn.set('icongroupid', iconGroupId);
            dropdn.set('iconnumber', Util512.parseInt(iconNumber) ?? 0);
            dropdn.set('fixedwidth', Util512.parseInt(fixWidth) ?? 0);
            dropdn.set('labeltext', '');
        } else {
            dropdn.set('labeltext', lng(headerLabelUntranslated));
        }

        assertWarn(
            grpItems.findEl(menuRoot.id + '##dropdownBg'),
            'I~|forgot to call createMenuHelperEls?'
        );
        for (let menuString of arMenu) {
            let [itemId, itemUntranslated, hotkey] = menuString.split('|');
            itemId = slength(itemId) ? itemId : 'unnamedmenu' + Math.random();
            let item = new UI512MenuItem(itemId);

            grpItems.addElement(app, item);
            childIds.push(itemId);
            item.set(
                'labeltext',
                itemUntranslated === '---' ? itemUntranslated : lng(itemUntranslated)
            );
            item.set('labelhotkey', hotkey.replace(/ /g, ''));
            item.set('visible', false);
        }

        return dropdn;
    }

    /**
     * get groups for menus
     */
    static getMenuGroups(
        app: UI512Application,
        createIfNeeded = true
    ): [UI512ElGroup, UI512ElGroup] {
        return [
            MenuPositioning.getOrCreateGrp(app, '$$grpmenubar', createIfNeeded),
            MenuPositioning.getOrCreateGrp(app, '$$grpmenuitems', createIfNeeded)
        ];
    }

    /**
     * get or create a group
     */
    static getOrCreateGrp(app: UI512Application, s: string, createIfNeeded: boolean) {
        let grp = app.findGroup(s);
        if (grp) {
            return grp;
        } else {
            assertWarn(createIfNeeded, 'K?|menubar group expected but not found');
            let addedGrp = new UI512ElGroup(s, app.observer);
            app.addGroup(addedGrp);
            return addedGrp;
        }
    }

    /**
     * by default we'll give the menuRoot a hard-coded id so it can always be found by id
     */
    static getMenuRoot(app: UI512Application, createIfNeeded = true): UI512MenuRoot {
        let grpBar = MenuPositioning.getMenuGroups(app, createIfNeeded)[0];
        let elem = grpBar.findEl('$$menubarforapp');
        if (elem) {
            return cast(UI512MenuRoot, elem);
        } else {
            assertWarn(createIfNeeded, '2[|menubar group expected but not found');
            let mb = new UI512MenuRoot('$$menubarforapp', app.observer);
            grpBar.addElement(app, mb);
            return mb;
        }
    }

    /**
     * dynamically change a property on the menu item.
     */
    static setItemStatus(
        app: UI512Application,
        id: string,
        checked: O<boolean>,
        enabled: O<boolean>,
        translatedLabel?: string
    ) {
        let grpItems = MenuPositioning.getMenuGroups(app, true)[1];
        let elem = grpItems.findEl(id);
        if (elem) {
            if (checked !== undefined) {
                elem.set('checkmark', checked);
            }

            if (enabled !== undefined) {
                elem.set('enabled', enabled);
                elem.set('enabledstyle', enabled);
            }

            if (translatedLabel !== undefined) {
                elem.set('labeltext', translatedLabel);
            }
        } else {
            assertWarn(false, `2?|menuitem ${id} not found`);
        }
    }
}
