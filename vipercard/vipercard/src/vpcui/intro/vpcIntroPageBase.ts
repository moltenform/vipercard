
/* auto */ import { RespondToErr, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, fitIntoInclusive } from './../../ui512/utils/util512';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { UI512PresenterInterface } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { IdleEventDetails, KeyDownEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElLabel } from './../../ui512/elements/ui512ElementLabel';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { UI512CompBase, WndBorderDecorationConsts } from './../../ui512/composites/ui512Composites';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * base class for intro pages
 * provides layout and 'drag/drop' implementation for the window
 */
export abstract class IntroPageBase extends UI512CompBase {
    protected canDrag = true;
    protected isDraggingWindow = false;
    protected fadedWindowDragging: UI512ElButton[] = [];
    protected dragOffsetX = 0;
    protected dragOffsetY = 0;
    protected screenBounds: number[];
    hasCloseBtn = false;
    cancelBtnId: O<string>;
    acceptBtnId: O<string>;

    constructor(compId: string, bounds: number[], x?: number, y?: number) {
        super(compId);

        /* set dimensions */
        this.logicalWidth = 512;
        this.logicalHeight = 342;
        this.screenBounds = bounds;

        if (x === undefined || y === undefined) {
            /* center in the window */
            this.x = bounds[0] + Math.trunc((bounds[2] - this.logicalWidth) / 2);
            this.y = bounds[1] + Math.trunc((bounds[3] - this.logicalHeight) / 2);
        } else {
            /* position where asked */
            this.x = x;
            this.y = y;
        }
    }

    /**
     * common layout, low in the z-order (background)
     */
    drawCommonFirst(app: UI512Application, grp: UI512ElGroup) {
        /* draw opaque bg for the page */
        let bg = this.genBtn(app, grp, 'windowLowestLayer');
        bg.set('style', UI512BtnStyle.Shadow);
        bg.set('autohighlight', false);
        bg.setDimensions(this.x, this.y, this.logicalWidth + 1, this.logicalHeight + 2);

        /* draw header */
        let headerHeight = this.drawWindowDecoration(app, new WndBorderDecorationConsts(), this.hasCloseBtn);
        let caption = grp.getEl(this.getElId('caption'));
        caption.set('labeltext', lng('lngWelcome to ViperCard'));

        /* draw footer; pages can omit by hiding this element */
        let footerText = this.genChild(app, grp, 'footerText', UI512ElLabel);
        footerText.set('labeltext', lng('lngby moltenform (Ben Fisher)'));
        footerText.setDimensions(this.x + 5, this.y + this.logicalHeight - 20, 300, 20);
        return headerHeight;
    }

    /**
     * common layout, high in the z-order (foreground)
     */
    drawCommonLast(app: UI512Application, grp: UI512ElGroup) {
        /* 1 on left side, 1 on right side, 2 on top, 2 on bottom */
        const howManyFadesNeeded = 6;
        for (let i of Util512.range(0, howManyFadesNeeded)) {
            /* outlines of a faded window */
            this.fadedWindowDragging[i] = this.genBtn(app, grp, `faded${i}`);
            this.fadedWindowDragging[i].set('style', UI512BtnStyle.Transparent);
            this.fadedWindowDragging[i].set('icongroupid', 'logo');
            this.fadedWindowDragging[i].set('iconnumber', 1);
        }

        this.setFadedDragPositions(this.x, this.y);
        this.setFadedDragPositionsVisible(false);
    }

    /**
     * set visibility of outlines of a faded window
     */
    setFadedDragPositionsVisible(v: boolean) {
        for (let el of this.fadedWindowDragging) {
            el.set('visible', v);
        }
    }

    /**
     * set position of outlines of a faded window
     */
    setFadedDragPositions(x: number, y: number) {
        /* vertical ones */
        this.fadedWindowDragging[0].setDimensions(x, y, 1, this.logicalHeight);
        this.fadedWindowDragging[1].setDimensions(x + this.logicalWidth, y, 1, this.logicalHeight);

        /* horizontal ones */
        const half = Math.floor(this.logicalWidth / 2);
        this.fadedWindowDragging[2].setDimensions(x, y, half, 1);
        this.fadedWindowDragging[3].setDimensions(x + half, y, half, 1);
        this.fadedWindowDragging[4].setDimensions(x, y + this.logicalHeight, half, 1);
        this.fadedWindowDragging[5].setDimensions(x + half, y + this.logicalHeight, half, 1);
    }

    /**
     * begin dragging if you click on the top of the window
     */
    respondMouseDown(pr: UI512Presenter, d: MouseDownEventDetails) {
        if (d.el && d.el.id === this.getElId('caption') && !this.isDraggingWindow && this.canDrag) {
            this.isDraggingWindow = true;

            this.setFadedDragPositions(this.x, this.y);
            this.setFadedDragPositionsVisible(true);
            this.dragOffsetX = d.mouseX - this.x;
            this.dragOffsetY = d.mouseY - this.y;
        }
    }

    /**
     * if dragging, move faded window outline
     */
    respondMouseMove(pr: UI512Presenter, d: MouseMoveEventDetails) {
        this.setFadedDragPositions(d.mouseX - this.dragOffsetX, d.mouseY - this.dragOffsetY);
    }

    /**
     * if you dragged the window, move the window
     */
    respondMouseUp(pr: UI512Presenter, d: MouseUpEventDetails) {
        if (this.isDraggingWindow) {
            this.isDraggingWindow = false;
            this.setFadedDragPositionsVisible(false);
            let nextX = this.fadedWindowDragging[0].x;
            let nextY = this.fadedWindowDragging[0].y;

            /* we won't let you drag it all of the way off the screen */
            nextX = fitIntoInclusive(
                nextX,
                this.screenBounds[0],
                this.screenBounds[0] + this.screenBounds[2] - this.logicalWidth
            );

            nextY = fitIntoInclusive(nextY, this.screenBounds[1], this.screenBounds[1] + this.screenBounds[3] - 100);
            this.moveAllTo(nextX, nextY, pr.app);
        }
    }

    /**
     * draw an os-style rounded rectangle button
     */
    protected drawBtn(app: UI512Application, grp: UI512ElGroup, n: number, x: number, y: number, w: number, h: number) {
        let btn = this.genBtn(app, grp, `choicebtn${n}`);
        let labeltext = n === 0 ? lng('lngOK') : lng('lngCancel');
        btn.set('style', n === 0 ? UI512BtnStyle.OSDefault : UI512BtnStyle.OSStandard);
        btn.set('autohighlight', true);
        btn.set('labeltext', labeltext);
        btn.setDimensions(x, y, w, h);
        return btn;
    }

    /**
     * respond to key press, can be overridden in child class
     */
    respondKeyDown(pr: UI512Presenter, d: KeyDownEventDetails) {
        let elId: O<string>;
        if (d.readableShortcut.toLowerCase() === 'enter' || d.readableShortcut.toLowerCase() === 'return') {
            elId = this.acceptBtnId;
        } else if (d.readableShortcut.toLowerCase() === 'escape') {
            elId = this.cancelBtnId;
        }

        let fnd = pr?.app?.findEl(elId);
        if (fnd) {
            fnd.set('highlightactive', true);
            let fn = () => {
                if (fnd && this.children.length) {
                    this.respondToBtnClick(pr, this, fnd);
                }
            };
            Util512Higher.syncToAsyncAfterPause(fn, 200, 'Hit return to click a button', RespondToErr.ConsoleErrOnly);
        }
    }

    /**
     * event called continuously, can be overridden in child class
     */
    respondIdle(pr: UI512Presenter, d: IdleEventDetails) {}

    /**
     * a button was clicked
     */
    respondToBtnClick(pr: UI512PresenterInterface, self: O<IntroPageBase>, el: UI512Element) {}
}
