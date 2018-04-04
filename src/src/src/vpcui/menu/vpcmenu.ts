
/* auto */ import { clrBlack, clrWhite } from '../../ui512/draw/ui512drawpattern.js';
/* auto */ import { MenuPositioning } from '../../ui512/menu/ui512menurender.js';
/* auto */ import { VpcElType, VpcTool, VpcToolCtg, getToolCategory } from '../../vpc/vpcutils/vpcenums.js';
/* auto */ import { VpcAppMenuStructure } from '../../vpcui/menu/vpcmenustructure.js';

export class VpcAppMenus extends VpcAppMenuStructure {
    init() {
        MenuPositioning.buildFromStruct(this.appli.getController(), this.getMenuStruct(), this.appli.lang());
        MenuPositioning.setItemStatus(this.appli.UI512App(), 'mnuSysAppsHideProduct', undefined, false);
        MenuPositioning.setItemStatus(this.appli.UI512App(), 'mnuSysAppsHideOthers', undefined, false);
        MenuPositioning.setItemStatus(this.appli.UI512App(), 'mnuSysAppsShowAll', undefined, false);
        MenuPositioning.setItemStatus(this.appli.UI512App(), 'mnuSysAppsCheckProduct', true, true);
    }

    updateUI512Els() {
        // called whenever selected vel changes
        MenuPositioning.setItemStatus(
            this.appli.UI512App(),
            'mnuPaintWideLines',
            this.appli.getOption_b('optWideLines'),
            true
        );
        MenuPositioning.setItemStatus(
            this.appli.UI512App(),
            'mnuPaintDrawMult',
            this.appli.getOption_b('optPaintDrawMult'),
            true
        );
        MenuPositioning.setItemStatus(
            this.appli.UI512App(),
            'mnuPaintBlackLines',
            this.appli.getOption_n('optPaintLineColor') === clrBlack,
            true
        );
        MenuPositioning.setItemStatus(
            this.appli.UI512App(),
            'mnuPaintWhiteLines',
            this.appli.getOption_n('optPaintLineColor') === clrWhite,
            true
        );
        MenuPositioning.setItemStatus(
            this.appli.UI512App(),
            'mnuPaintBlackFill',
            this.appli.getOption_n('optPaintFillColor') === clrBlack,
            true
        );
        MenuPositioning.setItemStatus(
            this.appli.UI512App(),
            'mnuPaintWhiteFill',
            this.appli.getOption_n('optPaintFillColor') === clrWhite,
            true
        );
        MenuPositioning.setItemStatus(
            this.appli.UI512App(),
            'mnuPaintNoFill',
            this.appli.getOption_n('optPaintFillColor') === -1,
            true
        );

        MenuPositioning.setItemStatus(
            this.appli.UI512App(),
            'mnuUseHostClipboard',
            this.appli.getOption_b('optUseHostClipboard'),
            true
        );
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(this.appli.UI512App());
        let topClock = grpbar.getEl('topClock');
        topClock.set('labeltext', this.getDayOfYear());

        let currentTool = this.appli.getOption_n('currentTool');
        let toolCtg = getToolCategory(currentTool);
        for (let i = VpcTool.__first; i <= VpcTool.__last; i++) {
            let check = i === currentTool;
            MenuPositioning.setItemStatus(this.appli.UI512App(), `mnuItemTool${i}`, check, true);
        }

        let selectedId = toolCtg === VpcToolCtg.ctgEdit ? this.appli.getOption_s('selectedVelId') : '';
        this.refreshCopyPasteMnuItem(selectedId, 'mnuCopyCardOrVel', 'lngCopy Card', 'lngCopy Button', 'lngCopy Field');
        let copiedId = this.appli.getOption_s('copiedVelId');
        this.refreshCopyPasteMnuItem(
            copiedId,
            'mnuPasteCardOrVel',
            'lngPaste Card',
            'lngPaste Button',
            'lngPaste Field'
        );
    }

    refreshCopyPasteMnuItem(id: string, menuId: string, fallback: string, txtBtn: string, txtFld: string) {
        let found = this.appli.getModel().findByIdUntyped(id);
        if (found && (found.getType() === VpcElType.Btn || found.getType() === VpcElType.Fld)) {
            let txt = found.getType() === VpcElType.Btn ? txtBtn : txtFld;
            MenuPositioning.setItemStatus(
                this.appli.UI512App(),
                menuId,
                undefined,
                undefined,
                this.appli.lang().translate(txt)
            );
        } else {
            MenuPositioning.setItemStatus(
                this.appli.UI512App(),
                menuId,
                undefined,
                undefined,
                this.appli.lang().translate(fallback)
            );
        }
    }

    protected getDayOfYear() {
        // uses a locale-appropriate format.
        let d = new Date();
        return d.toLocaleDateString();
    }
}
