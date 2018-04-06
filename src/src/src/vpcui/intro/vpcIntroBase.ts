
/* auto */ import { cProductName } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, fitIntoInclusive } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512elementsgroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512elementslabel.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512elementsbutton.js';
/* auto */ import { IdleEventDetails, KeyDownEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { UI512Controller } from '../../ui512/presentation/ui512presenter.js';
/* auto */ import { UI512CompBase, WndBorderDecorationConsts } from '../../ui512/composites/ui512composites.js';

export abstract class IntroPageBase extends UI512CompBase {
    protected canDrag = true;
    protected isDraggingWindow = false;
    protected fadedWindowDragging: UI512ElButton[] = [];
    protected dragOffsetX = 0;
    protected dragOffsetY = 0;
    protected appBounds: number[];
    hasclosebtn = false;
    btnIds: { [key: string]: string } = {};

    constructor(compid: string, bounds: number[], x?: number, y?: number) {
        super(compid);
        this.logicalWidth = 512;
        this.logicalHeight = 342;
        this.appBounds = bounds;

        if (x === undefined || y === undefined) {
            this.x = bounds[0] + Math.trunc((bounds[2] - this.logicalWidth) / 2);
            this.y = bounds[1] + Math.trunc((bounds[3] - this.logicalHeight) / 2);
        } else {
            this.x = x;
            this.y = y;
        }
    }

    drawCommonFirst(app: UI512Application, grp: UI512ElGroup, lang: UI512Lang) {
        let wndbg = this.genBtn(app, grp, 'wndbg');
        wndbg.set('style', UI512BtnStyle.shadow);
        wndbg.set('autohighlight', false);
        wndbg.setDimensions(this.x, this.y, this.logicalWidth + 1, this.logicalHeight + 2);
        let headerheight = this.drawWindowDecoration(app, new WndBorderDecorationConsts(), this.hasclosebtn);

        let caption = grp.getEl(this.getElId('caption'));
        caption.set('labeltext', lang.translate('lngWelcome to %cProductName'));

        let footerText = this.genChild(app, grp, 'footerText', UI512ElLabel);
        footerText.set('labeltext', lang.translate('lngby Ben Fisher'));
        footerText.setDimensions(this.x + 5, this.y + this.logicalHeight - 20, 300, 20);

        let footerTextRight = this.genChild(app, grp, 'footerTextRight', UI512ElLabel);
        footerTextRight.set('labelwrap', true);
        footerTextRight.setDimensions(this.x + 200, this.y + this.logicalHeight - 60, 300, 55);
        return headerheight;
    }

    drawCommonLast(app: UI512Application, grp: UI512ElGroup, lang: UI512Lang) {
        for (let i of Util512.range(6)) {
            this.fadedWindowDragging[i] = this.genBtn(app, grp, `faded${i}`);
            this.fadedWindowDragging[i].set('style', UI512BtnStyle.transparent);
            this.fadedWindowDragging[i].set('iconsetid', 'logo');
            this.fadedWindowDragging[i].set('iconnumber', 1);
        }

        this.setFadedDragPositions(this.x, this.y);
        this.setFadedDragPositionsVisible(false);
    }

    setFadedDragPositionsVisible(v: boolean) {
        for (let el of this.fadedWindowDragging) {
            el.set('visible', v);
        }
    }

    setFadedDragPositions(x: number, y: number) {
        // vertical ones
        this.fadedWindowDragging[0].setDimensions(x, y, 1, this.logicalHeight);
        this.fadedWindowDragging[1].setDimensions(x + this.logicalWidth, y, 1, this.logicalHeight);

        // horizontal ones
        const half = Math.floor(this.logicalWidth / 2);
        this.fadedWindowDragging[2].setDimensions(x, y, half, 1);
        this.fadedWindowDragging[3].setDimensions(x + half, y, half, 1);
        this.fadedWindowDragging[4].setDimensions(x, y + this.logicalHeight, half, 1);
        this.fadedWindowDragging[5].setDimensions(x + half, y + this.logicalHeight, half, 1);
    }

    respondMouseDown(c: UI512Controller, d: MouseDownEventDetails) {
        if (d.el && d.el.id === this.getElId('caption') && !this.isDraggingWindow && this.canDrag) {
            this.isDraggingWindow = true;

            this.setFadedDragPositions(this.x, this.y);
            this.setFadedDragPositionsVisible(true);
            this.dragOffsetX = d.mouseX - this.x;
            this.dragOffsetY = d.mouseY - this.y;
        }
    }

    respondMouseMove(c: UI512Controller, d: MouseMoveEventDetails) {
        this.setFadedDragPositions(d.mouseX - this.dragOffsetX, d.mouseY - this.dragOffsetY);
    }

    respondKeyDown(c: UI512Controller, d: KeyDownEventDetails) {}

    respondIdle(c: UI512Controller, d: IdleEventDetails) {}

    respondMouseUp(c: UI512Controller, d: MouseUpEventDetails) {
        if (this.isDraggingWindow) {
            this.isDraggingWindow = false;
            this.setFadedDragPositionsVisible(false);
            let nextx = this.fadedWindowDragging[0].x;
            let nexty = this.fadedWindowDragging[0].y;

            // we won't let you drag it all of the way off the screen
            nextx = fitIntoInclusive(
                nextx,
                this.appBounds[0],
                this.appBounds[0] + this.appBounds[2] - this.logicalWidth
            );
            nexty = fitIntoInclusive(nexty, this.appBounds[1], this.appBounds[1] + this.appBounds[3] - 100);
            this.moveAllTo(nextx, nexty, c.app);
        }
    }

    protected drawBtn(
        app: UI512Application,
        grp: UI512ElGroup,
        n: number,
        x: number,
        y: number,
        w: number,
        h: number,
        lang: UI512Lang
    ) {
        let btn = this.genBtn(app, grp, `choicebtn${n}`);
        let labeltext = n === 0 ? lang.translate('lngOK') : lang.translate('lngCancel');
        btn.set('style', n === 0 ? UI512BtnStyle.osdefault : UI512BtnStyle.osstandard);
        btn.set('autohighlight', true);
        btn.set('labeltext', labeltext);
        btn.setDimensions(x, y, w, h);
        return btn;
    }
}
