
/* auto */ import { VpcAppMenuStructure } from './vpcMenuStructure';
/* auto */ import { VpcElType, VpcTool, VpcToolCtg, getToolCategory } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { MenuPositioning } from './../../ui512/menu/ui512MenuPositioning';
/* auto */ import { clrBlack, clrWhite } from './../../ui512/draw/ui512DrawPatterns';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * the Vpc menu
 */
export class VpcAppMenu extends VpcAppMenuStructure {
    /**
     * initialize the menu
     */
    init() {
        MenuPositioning.buildFromArray(this.vci.getPresenter(), this.getMenuStruct());
        MenuPositioning.setItemStatus(this.vci.UI512App(), 'mnuSysAppsHideProduct', undefined, false);
        MenuPositioning.setItemStatus(this.vci.UI512App(), 'mnuSysAppsHideOthers', undefined, false);
        MenuPositioning.setItemStatus(this.vci.UI512App(), 'mnuSysAppsShowAll', undefined, false);
        MenuPositioning.setItemStatus(this.vci.UI512App(), 'mnuSysAppsCheckProduct', true, true);
    }

    /**
     * update according to productopts options,
     * e.g. if you've set WideLines to true,
     * Wide Lines should be checked on in the Draw menu.
     * also called whenever selected vel changes,
     * so that Copy {Button/Field} shows the right text.
     */
    updateUI512Els() {
        MenuPositioning.setItemStatus(this.vci.UI512App(), 'mnuPaintWideLines', this.vci.getOptionB('optWideLines'), true);

        MenuPositioning.setItemStatus(this.vci.UI512App(), 'mnuPaintDrawMult', this.vci.getOptionB('optPaintDrawMult'), true);

        MenuPositioning.setItemStatus(
            this.vci.UI512App(),
            'mnuPaintBlackLines',
            this.vci.getOptionN('optPaintLineColor') === clrBlack,
            true
        );

        MenuPositioning.setItemStatus(
            this.vci.UI512App(),
            'mnuPaintWhiteLines',
            this.vci.getOptionN('optPaintLineColor') === clrWhite,
            true
        );

        MenuPositioning.setItemStatus(
            this.vci.UI512App(),
            'mnuPaintBlackFill',
            this.vci.getOptionN('optPaintFillColor') === clrBlack,
            true
        );

        MenuPositioning.setItemStatus(
            this.vci.UI512App(),
            'mnuPaintWhiteFill',
            this.vci.getOptionN('optPaintFillColor') === clrWhite,
            true
        );

        MenuPositioning.setItemStatus(
            this.vci.UI512App(),
            'mnuPaintNoFill',
            this.vci.getOptionN('optPaintFillColor') === -1,
            true
        );

        MenuPositioning.setItemStatus(
            this.vci.UI512App(),
            'mnuUseHostClipboard',
            this.vci.getOptionB('optUseHostClipboard'),
            true
        );

        let grpBar = MenuPositioning.getMenuGroups(this.vci.UI512App())[0];

        /* update day of year */
        let topClock = grpBar.getEl('topClock');
        topClock.set('labeltext', this.getDayOfYear());

        let currentTool = this.vci.getOptionN('currentTool');
        let toolCtg = getToolCategory(currentTool);
        for (let i = VpcTool.__first; i <= VpcTool.__last; i++) {
            let check = i === currentTool;
            MenuPositioning.setItemStatus(this.vci.UI512App(), `mnuItemTool${i}`, check, true);
        }

        let selectedId = toolCtg === VpcToolCtg.CtgEdit ? this.vci.getOptionS('selectedVelId') : '';
        this.refreshCopyPasteMnuItem(selectedId, 'mnuCopyCardOrVel', 'lngCopy Card', 'lngCopy Button', 'lngCopy Field');
        let copiedId = this.vci.getOptionS('copiedVelId');
        this.refreshCopyPasteMnuItem(copiedId, 'mnuPasteCardOrVel', 'lngPaste Card', 'lngPaste Button', 'lngPaste Field');
    }

    /**
     * should we show 'copy button' or 'copy field'?
     */
    refreshCopyPasteMnuItem(id: string, menuId: string, fallback: string, txtBtn: string, txtFld: string) {
        let found = this.vci.getModel().findByIdUntyped(id);
        if (found && (found.getType() === VpcElType.Btn || found.getType() === VpcElType.Fld)) {
            let txt = found.getType() === VpcElType.Btn ? txtBtn : txtFld;
            MenuPositioning.setItemStatus(this.vci.UI512App(), menuId, undefined, undefined, lng(txt));
        } else {
            MenuPositioning.setItemStatus(this.vci.UI512App(), menuId, undefined, undefined, lng(fallback));
        }
    }

    /**
     * gets day of year,
     * uses a locale-appropriate format.
     */
    protected getDayOfYear() {
        let d = new Date();
        return d.toLocaleDateString();
    }
}
