
/* auto */ import { O, assertTrueWarn, checkThrowUI512 } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, assertEq, base10, cast, getRoot, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { MenuConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512DrawText.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512MenuDropdown, UI512MenuItem, UI512MenuRoot } from '../../ui512/elements/ui512ElementsMenu.js';
/* auto */ import { UI512PresenterWithMenuInterface } from '../../ui512/menu/ui512PresenterWithMenu.js';

function isMenuDirty(app: UI512Application, menu: UI512MenuRoot) {
    if (menu.getdirty()) {
        return true;
    }

    let children = menu.getchildren(app);
    for (let child of children) {
        if (child.getdirty()) {
            return true;
        }
    }

    if (menu.get_n('whichIsExpanded') >= 0) {
        for (let child of children) {
            for (let subchild of child.getchildren(app)) {
                if (subchild.getdirty()) {
                    return true;
                }
            }
        }
    }

    return false;
}

export class MenuPositioning {
    static createMenuHelperObjects(app: UI512Application, grpitems: UI512ElGroup, menuroot: UI512MenuRoot) {
        let dropdownbgid = menuroot.id + '##dropdownbg';
        if (!grpitems.findEl(dropdownbgid)) {
            let dropdownbg = new UI512ElButton(dropdownbgid, menuroot.observer);
            dropdownbg.set('autohighlight', false);
            dropdownbg.set('style', UI512BtnStyle.shadow);
            grpitems.addElement(app, dropdownbg);
        }
    }

    static removeMenuHelperObjects(app: UI512Application, grpitems: UI512ElGroup, menuroot: UI512MenuRoot) {
        let dropdownbgid = menuroot.id + '##dropdownbg';
        grpitems.removeElement(dropdownbgid);
    }

    static removeMenuRoot(app: UI512Application, grp: UI512ElGroup, menuroot: UI512MenuRoot) {
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(app, false);
        assertEq(grp.id, grpbar.id, '2]|');
        MenuPositioning.removeMenuHelperObjects(app, grpitems, menuroot);
        let children = menuroot.getchildren(app);
        for (let child of children) {
            for (let subchild of child.getchildren(app)) {
                grpitems.removeElement(subchild.id);
            }

            grpbar.removeElement(child.id);
        }

        grpbar.removeElement(menuroot.id);
    }

    static setMenubarPositionsForRenderItems(

        app: UI512Application,
        grpbar: UI512ElGroup,
        grpitems: UI512ElGroup,
        menuroot: UI512MenuRoot,
        header: UI512MenuDropdown,
        complete: RenderComplete
    ) {
        let dropdownbg = grpitems.getEl(menuroot.id + '##dropdownbg');
        let fontmanager = getRoot().getFontManager() as TextRendererFontManager;
        header.set('highlightactive', true);

        // find the longest string
        let longest = 0;
        let items = header.getchildren(app);
        for (let item of items) {
            let measured = fontmanager.measureString(item.get_s('labeltext'));
            if (!measured) {
                complete.complete = false;
                return;
            }

            longest = Math.max(longest, measured.newlogicalx + MenuConsts.addtowidth);
        }

        let totalheight = MenuConsts.itemheight * items.length;
        let rect = [header.x, header.bottom, longest, totalheight];

        let rightside = header.get_n('fixedoffset') !== -1;
        if (rightside) {
            const farRight = app.bounds[0] + app.bounds[2];
            let shiftAmount = rect[0] + rect[2] - farRight;
            if (shiftAmount > 0) {
                rect[0] -= shiftAmount;
            }
        }

        // draw shadowed bg
        // the top of this rect will goes under the main menu bar, so the top line won't be seen
        dropdownbg.setDimensions(
            rect[0],
            rect[1] - 1,
            rect[2],
            rect[3] + 1 + MenuConsts.shadowsizebottom /* for the shadow*/
        );

        // draw items
        for (let i = 0; i < items.length; i++) {
            items[i].setDimensions(
                rect[0] + MenuConsts.shadowsizeleft,
                rect[1] + MenuConsts.itemheight * i,
                rect[2] - (MenuConsts.shadowsizeleft + MenuConsts.shadowsizeright),
                MenuConsts.itemheight
            );

            items[i].set('visible', true);
        }
    }

    static setMenubarPositionsForRender(

        app: UI512Application,
        menuroot: UI512MenuRoot,
        complete: RenderComplete
    ) {
        if (!menuroot || !menuroot.visible || !menuroot.get_s('childids') || !isMenuDirty(app, menuroot)) {
            return;
        }

        // top bar
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(app);
        menuroot.setDimensions(app.bounds[0], app.bounds[1], app.bounds[2], MenuConsts.barheight - 1);
        assertTrueWarn(grpitems.findEl(menuroot.id + '##dropdownbg'), 'forgot to call createMenuHelperObjects?');

        // draw menu headers
        // following emulator, they actually overlap.
        let curx = app.bounds[0] + MenuConsts.topheadermargin1;
        let curwidth = 0;
        let fontmanager = getRoot().getFontManager() as TextRendererFontManager;
        let counticonsdrawn = 0;
        let dropdns = menuroot.getchildren(app);
        grpitems.setVisible(false);
        for (let i = 0; i < dropdns.length; i++) {
            let header = dropdns[i];
            curwidth = header.get_n('fixedwidth');
            if (curwidth === -1) {
                let measured = fontmanager.measureString(header.get_s('labeltext'));
                if (!measured) {
                    complete.complete = false;
                    return;
                }

                curwidth = measured.newlogicalx + MenuConsts.xspacing;
            }

            if (header.get_n('fixedoffset') !== -1) {
                curx = header.get_n('fixedoffset');
            }

            // the emulator has a 1 pixel margin between top of screen and menu,
            // but we'll not do that because it doesn't look good against black background
            header.setDimensions(curx - 4, app.bounds[1], curwidth + 5, MenuConsts.barheight - 1);
            curx += curwidth;

            // draw active one
            header.set('highlightactive', false);
            if (menuroot.get_n('whichIsExpanded') === i) {
                MenuPositioning.setMenubarPositionsForRenderItems(
                    app,
                    grpbar,
                    grpitems,
                    menuroot,
                    header,
                    complete
                );
                grpitems.setVisible(true);
            } else {
                for (let item of header.getchildren(app)) {
                    item.set('visible', false);
                }
            }
        }
    }

    private static buildDropdnFromStruct(
        app: UI512Application,
        grpbar: UI512ElGroup,
        grpitems: UI512ElGroup,
        menuroot: UI512MenuRoot,
        dropdowns: string[],
        childids: string[],
        ar: any
    ) {
        let armenuheader = undefined;
        let armenu = undefined;
        let fixedoffset = -1;
        if (ar.length === 2) {
            [armenuheader, armenu] = ar;
        } else {
            [armenuheader, fixedoffset, armenu] = ar;
        }

        let [headerid, headerlabeluntranslated] = armenuheader.split('|');
        let dropdn = new UI512MenuDropdown(headerid);
        dropdowns.push(headerid);
        grpbar.addElementAfter(app, dropdn, menuroot.id);
        dropdn.set('fixedoffset', fixedoffset);
        if (headerlabeluntranslated.startsWith('icon:')) {
            let [_, iconsetid, iconnumber, fixwidth] = headerlabeluntranslated.split(':');
            dropdn.set('iconsetid', iconsetid);
            dropdn.set('iconnumber', parseInt(iconnumber, base10));
            dropdn.set('fixedwidth', parseInt(fixwidth, base10));
            dropdn.set('labeltext', '');
        } else {
            dropdn.set('labeltext', lng(headerlabeluntranslated));
        }

        assertTrueWarn(grpitems.findEl(menuroot.id + '##dropdownbg'), 'forgot to call createMenuHelperObjects?');
        for (let menustring of armenu) {
            let [itemid, itemuntranslated, hotkey] = menustring.split('|');
            itemid = slength(itemid) ? itemid : 'unnamedmenu' + Math.random();
            let item = new UI512MenuItem(itemid);

            grpitems.addElement(app, item);
            childids.push(itemid);
            item.set('labeltext', itemuntranslated === '---' ? itemuntranslated : lng(itemuntranslated));
            item.set('labelhotkey', hotkey.replace(/ /g, ''));
            item.set('visible', false);
        }

        return dropdn;
    }

    static buildFromStruct(c: UI512PresenterWithMenuInterface, st: any[]) {
        let menuroot = MenuPositioning.getMenuRoot(c.app);
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(c.app);

        // ensures background items are created first, because they should be behind foreground
        MenuPositioning.createMenuHelperObjects(c.app, grpitems, menuroot);

        let dropdowns: string[] = [];
        for (let ar of st) {
            let childids: string[] = [];
            let dropdn = MenuPositioning.buildDropdnFromStruct(
                c.app,
                grpbar,
                grpitems,
                menuroot,
                dropdowns,
                childids,
                ar
            );
            dropdn.set('childids', childids.join('|'));
        }

        menuroot.set('childids', dropdowns.join('|'));
    }

    static getMenuGroups(app: UI512Application, createIfNeeded = true): [UI512ElGroup, UI512ElGroup] {
        return [
            MenuPositioning.getMenuGroupImpl(app, '$$grpmenubar', createIfNeeded),
            MenuPositioning.getMenuGroupImpl(app, '$$grpmenuitems', createIfNeeded),
        ];
    }

    static getMenuGroupImpl(app: UI512Application, s: string, createIfNeeded: boolean): UI512ElGroup {
        let grp = app.findGroup(s);
        if (grp) {
            return grp;
        } else {
            checkThrowUI512(createIfNeeded, '2[|menubar group expected but not found');
            let addedgrp = new UI512ElGroup(s, app.observer);
            app.addGroup(addedgrp);
            return addedgrp;
        }
    }

    static getMenuRoot(app: UI512Application, createIfNeeded = true): UI512MenuRoot {
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(app, createIfNeeded);
        let elem = grpbar.findEl('$$menubarforapp');
        if (elem) {
            return cast(elem, UI512MenuRoot);
        } else {
            checkThrowUI512(createIfNeeded, '2[|menubar group expected but not found');
            let mb = new UI512MenuRoot('$$menubarforapp', app.observer);
            grpbar.addElement(app, mb);
            return mb;
        }
    }

    static setItemStatus(
        app: UI512Application,
        id: string,
        checked: O<boolean>,
        enabled: O<boolean>,
        translatedLabel?: string
    ) {
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(app, true);
        let elem = grpitems.findEl(id);
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
            assertTrueWarn(false, `2?|menuitem ${id} not found`);
        }
    }
}
