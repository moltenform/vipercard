
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { clrBlack, clrWhite } from '../../ui512/draw/ui512DrawPatterns.js';
/* auto */ import { MenuPositioning } from '../../ui512/menu/ui512MenuPositioning.js';
/* auto */ import { VpcElType, VpcTool, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { VpcAppMenuStructure } from '../../vpcui/menu/vpcMenuStructure.js';

export class VpcAppMenu extends VpcAppMenuStructure {
    init() {
        MenuPositioning.buildFromArray(this.vci.getPresenter(), this.getMenuStruct());
        MenuPositioning.setItemStatus(this.vci.UI512App(), 'mnuSysAppsHideProduct', undefined, false);
        MenuPositioning.setItemStatus(this.vci.UI512App(), 'mnuSysAppsHideOthers', undefined, false);
        MenuPositioning.setItemStatus(this.vci.UI512App(), 'mnuSysAppsShowAll', undefined, false);
        MenuPositioning.setItemStatus(this.vci.UI512App(), 'mnuSysAppsCheckProduct', true, true);
    }

    updateUI512Els() {
        // called whenever selected vel changes
        MenuPositioning.setItemStatus(
            this.vci.UI512App(),
            'mnuPaintWideLines',
            this.vci.getOptionB('optWideLines'),
            true
        );
        MenuPositioning.setItemStatus(
            this.vci.UI512App(),
            'mnuPaintDrawMult',
            this.vci.getOptionB('optPaintDrawMult'),
            true
        );
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
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(this.vci.UI512App());
        let topClock = grpbar.getEl('topClock');
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
        this.refreshCopyPasteMnuItem(
            copiedId,
            'mnuPasteCardOrVel',
            'lngPaste Card',
            'lngPaste Button',
            'lngPaste Field'
        );
    }

    refreshCopyPasteMnuItem(id: string, menuId: string, fallback: string, txtBtn: string, txtFld: string) {
        let found = this.vci.getModel().findByIdUntyped(id);
        if (found && (found.getType() === VpcElType.Btn || found.getType() === VpcElType.Fld)) {
            let txt = found.getType() === VpcElType.Btn ? txtBtn : txtFld;
            MenuPositioning.setItemStatus(this.vci.UI512App(), menuId, undefined, undefined, lng(txt));
        } else {
            MenuPositioning.setItemStatus(this.vci.UI512App(), menuId, undefined, undefined, lng(fallback));
        }
    }

    protected getDayOfYear() {
        // uses a locale-appropriate format.
        let d = new Date();
        return d.toLocaleDateString();
    }
}
