
/* auto */ import { RectUtils } from './../utils/utilsCanvasDraw';
/* auto */ import { assertEq } from './../utils/util512';
/* auto */ import { UI512PresenterBase } from './../presentation/ui512PresenterBase';
/* auto */ import { UI512ElLabel } from './../elements/ui512ElementLabel';
/* auto */ import { UI512ElGroup } from './../elements/ui512ElementGroup';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../elements/ui512Element';

/**
 * base class for composites. a composite has a UI512group of elements that act in a connected way.
 * composites add a namespace (id prefix) to elements,
 * to make it easier for many composites to be shown on the screen at a time.
 */
export abstract class UI512CompBase {
    isUI512CompBase = true;
    idPrefix = '';
    readonly grpId: string;
    readonly compositeId: string;
    compositeType = '';
    children: UI512Element[] = [];

    /* the conceptual 'size' of the composite.
    it's fine if some child elements are outside these boundaries. */
    x = 0;
    y = 0;
    logicalWidth = 0;
    logicalHeight = 0;

    /**
     * the compositeId forms part of the namespace (id prefix)
     */
    constructor(compositeId: string) {
        this.compositeId = compositeId;
        this.grpId = this.getElId('composite');
    }

    /**
     * get full id of the element
     */
    getElId(suffix: string) {
        return this.compositeId + '##' + this.compositeType + '##' + suffix;
    }

    /**
     * get our internal id of the element, or return undefined if we don't own it
     */
    fromFullId(fullId: string) {
        let parts = fullId.split(this.compositeId + '##' + this.compositeType + '##');
        if (parts.length !== 2) {
            return undefined;
        } else {
            return parts[1];
        }
    }

    /**
     * move every child
     */
    moveAllTo(newX: number, newY: number, app: UI512Application) {
        let dx = newX - this.x;
        let dy = newY - this.y;
        if (dx !== 0 && dy !== 0) {
            this.x += dx;
            this.y += dy;
            for (let el of this.children) {
                el.setDimensions(el.x + dx, el.y + dy, el.w, el.h);
            }
        }
    }

    /**
     * one-line shortcut for creating a child button
     */
    protected genBtn(app: UI512Application, grp: UI512ElGroup, shortId: string) {
        return this.genChild(app, grp, shortId, UI512ElButton);
    }

    /**
     * one-line shortcut for creating any child element
     */
    protected genChild<T extends UI512Element>(
        app: UI512Application,
        grp: UI512ElGroup,
        shortId: string,
        ctor: { new (...args: any[]): T }
    ): T {
        let el = new ctor(this.getElId(shortId));
        grp.addElement(app, el);
        this.children.push(el);
        return el;
    }

    /**
     * subclass-specific logic for creating the UI of this composite
     */
    abstract createSpecific(app: UI512Application): void;

    /**
     * create the UI of this composite
     */
    create(pr: UI512PresenterBase, app: UI512Application) {
        assertEq(0, this.children.length, `2v|creating composite twice? ${this.compositeId}`);
        if (!app.findGroup(this.grpId)) {
            let grp = new UI512ElGroup(this.grpId, app.observer);
            app.addGroup(grp);
        }

        this.createSpecific(app);
        pr.rebuildFieldScrollbars();
    }

    /**
     * remove the UI of this composite.
     * if you want to use the composite again, you must call create() to revive and rebuild it.
     */
    destroy(pr: UI512PresenterBase, app: UI512Application) {
        this.children.length = 0;
        app.removeGroup(this.grpId);
        pr.rebuildFieldScrollbars();
    }

    /**
     * creates UI buttons+fields to draw window decoration
     */
    protected drawWindowDecoration(app: UI512Application, pr: BorderDecorationConsts, hasCloseBtn: boolean) {
        let grp = app.getGroup(this.grpId);

        /* draw background+shadow */
        let headerBox = this.genBtn(app, grp, 'headerbox');
        headerBox.set('autohighlight', false);
        headerBox.setDimensions(this.x, this.y, this.logicalWidth, pr.headHeight);

        /* get header fill rect */
        if (pr.fillShrinkX >= 0) {
            let fillRect = RectUtils.getSubRectRaw(
                this.x,
                this.y,
                this.logicalWidth,
                pr.headHeight,
                pr.fillShrinkX,
                pr.fillShrinkY
            );
            if (!fillRect) {
                return pr.headHeight;
            }

            /* draw header fill */
            let headerFill = this.genBtn(app, grp, 'headerFill');
            headerFill.set('style', UI512BtnStyle.Opaque);
            headerFill.set('autohighlight', false);
            headerFill.set('icongroupid', pr.fillIconGroup);
            headerFill.set('iconnumber', pr.fillIconNumber);
            headerFill.set('iconadjustx', pr.fillIconAdjustX);
            headerFill.set('iconadjusty', pr.fillIconAdjustY);
            headerFill.setDimensions(fillRect[0], fillRect[1], fillRect[2], fillRect[3]);
        } else {
            headerBox.set('icongroupid', pr.fillIconGroup);
            headerBox.set('iconnumber', pr.fillIconNumber);
            headerBox.set('iconadjustx', pr.fillIconAdjustX);
            headerBox.set('iconadjusty', pr.fillIconAdjustY);
        }

        if (hasCloseBtn) {
            /* draw background for close button */
            let closeBtnBg = this.genBtn(app, grp, 'closebtnbg');
            closeBtnBg.set('style', UI512BtnStyle.Opaque);
            closeBtnBg.set('autohighlight', false);
            let clX = pr.closeBtnX - Math.floor((pr.closeBtnBgWidth - pr.closeBtnWidth) / 2);
            closeBtnBg.setDimensions(this.x + clX, this.y + 1, pr.closeBtnBgWidth, pr.headHeight - 2);

            /* draw close button */
            let closeBtn = this.genBtn(app, grp, 'closebtn');
            closeBtn.set('autohighlight', true);
            closeBtn.setDimensions(this.x + pr.closeBtnX, this.y + pr.closeBtnY, pr.closeBtnWidth, pr.closeBtnHeight);
        }

        /* draw caption */
        if (pr instanceof WndBorderDecorationConsts) {
            let caption = this.genChild(app, grp, 'caption', UI512ElLabel);
            caption.set('transparentExceptChars', true);
            caption.set('labeltext', '');
            caption.set('labelwrap', false);
            caption.set('labelhalign', true);
            caption.set('labelvalign', true);
            caption.setDimensions(headerBox.x, headerBox.y, headerBox.w, headerBox.h);
        }

        return pr.headHeight;
    }

    /**
     * set visibility
     */
    setVisible(app: UI512Application, visible: boolean) {
        let grp = app.getGroup(this.grpId);
        grp.setVisible(visible);
    }
}

/**
 * base class for border decoration constants
 */
export class BorderDecorationConsts {
    headHeight = 0;
    fillShrinkX = 0;
    fillShrinkY = 0;
    closeBtnBgWidth = 0;
    closeBtnWidth = 0;
    closeBtnHeight = 0;
    closeBtnX = 0;
    closeBtnY = 0;
    fillIconGroup = '';
    fillIconNumber = 0;
    fillIconAdjustX = 0;
    fillIconAdjustY = 0;
    footer = 2;
}

/**
 * a "palette" style window border
 */
export class PalBorderDecorationConsts extends BorderDecorationConsts {
    readonly headHeight = 11;
    readonly fillShrinkX = -1;
    readonly fillShrinkY = -1;
    readonly fillIconGroup = '000';
    readonly fillIconNumber = 2;
    readonly fillIconAdjustY = 1;
    readonly closeBtnBgWidth = 11;
    readonly closeBtnWidth = 7;
    readonly closeBtnHeight = 7;
    readonly closeBtnX = 8;
    readonly closeBtnY = 2;
}

/**
 * a "window" style window border
 */
export class WndBorderDecorationConsts extends BorderDecorationConsts {
    readonly headHeight = 19;
    readonly fillShrinkX = 1;
    readonly fillShrinkY = 2;
    readonly fillIconGroup = '000';
    readonly fillIconNumber = 3;
    readonly fillIconAdjustY = 1;
    readonly closeBtnBgWidth = 13;
    readonly closeBtnWidth = 11;
    readonly closeBtnHeight = 11;
    readonly closeBtnX = 9;
    readonly closeBtnY = 4;
}
