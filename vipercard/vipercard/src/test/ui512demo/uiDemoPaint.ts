
/* auto */ import { assertEq, cast } from './../../ui512/utils/util512';
/* auto */ import { addDefaultListeners } from './../../ui512/textedit/ui512TextEvents';
/* auto */ import { UI512EventType } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { IdleEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElCanvasPiece } from './../../ui512/elements/ui512ElementCanvasPiece';
/* auto */ import { UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { GridLayout, UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { FloodFillTest } from './../util512ui/testUI512PaintFlood';
/* auto */ import { TestDrawUI512Paint, UI512TestPaintPresenter } from './../util512ui/testUI512Paint';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */


/**
 * UI512DemoPaint
 *
 * A "demo" project showing several painted shapes.
 *
 * 1) tests use this project to compare against a known good screenshot,
 * to make sure rendering has not changed
 * 2) you can start this project in _rootUI512.ts_, and test drag/drop,
 * and click Download Image to update the test
 */
export class UI512DemoPaint extends UI512TestPaintPresenter {
    test = new TestDrawUI512Paint();
    fltest = new FloodFillTest();
    mouseDragDropOffset: [number, number] = [0, 0];

    init() {
        super.init();
        addDefaultListeners(this.listeners);

        let clientRect = this.getStandardWindowBounds();
        this.app = new UI512Application(clientRect, this);
        this.inited = true;
        this.test.addElements(this, clientRect);
        this.test.uiContext = true;

        let grp = this.app.getGroup('grp');

        let testBtns = ['RunTest', 'DldImage', 'RunTestFill', 'DldImageFill', 'TestDrag'];
        let layoutTestBtns = new GridLayout(clientRect[0] + 10, clientRect[1] + 330, 100, 15, testBtns, [1], 5, 5);
        layoutTestBtns.createElems(this.app, grp, 'btn', UI512ElButton, () => {}, true, true);

        let elfloodtest = new UI512ElCanvasPiece('elfloodtest');
        grp.addElement(this.app, elfloodtest);
        elfloodtest.setCanvas(this.fltest.start());
        elfloodtest.setDimensions(700, 50, elfloodtest.getCvWidth(), elfloodtest.getCvHeight());

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseDown, UI512DemoPaint.respondMouseDown);
        this.listenEvent(UI512EventType.MouseUp, UI512DemoPaint.respondMouseUp);
        this.listenEvent(UI512EventType.MouseMove, UI512DemoPaint.respondMouseMove);
        this.listenEvent(UI512EventType.Idle, UI512DemoPaint.respondOnIdle);
        this.rebuildFieldScrollbars();
    }

    protected static respondMouseDown(pr: UI512DemoPaint, d: MouseDownEventDetails) {
        if (d.el && d.button === 0) {
            if (d.el.id === 'btnTestDrag') {
                assertEq('btnTestDrag', pr.trackClickedIds[0], '1U|');
                pr.beginDragDrop(d.mouseX, d.mouseY, d.el);
            }
        }
    }

    protected static respondMouseUp(pr: UI512DemoPaint, d: MouseUpEventDetails) {
        pr.isDragging = false;
        if (d.elClick && d.button === 0) {
            if (d.elClick.id === 'btnDldImage') {
                pr.test.runtestShape(true);
            } else if (d.elClick.id === 'btnRunTest') {
                pr.test.runtestShape(false);
            } else if (d.elClick.id === 'btnDldImageFill') {
                pr.test.runtestFloodFill(true);
            } else if (d.elClick.id === 'btnRunTestFill') {
                pr.test.runtestFloodFill(false);
            }
        }

        pr.mouseDragDropOffset = [0, 0];
    }

    protected static respondOnIdle(pr: UI512DemoPaint, d: IdleEventDetails) {
        if (!pr.fltest.isDone) {
            let grp = pr.app.getGroup('grp');
            let elfloodtest = cast(UI512ElCanvasPiece, grp.getEl('elfloodtest'), );
            pr.fltest.floodFillTest(elfloodtest.getCanvasForWrite());
        }
    }

    isDragging = false;
    beginDragDrop(x: number, y: number, el: UI512Element) {
        this.mouseDragDropOffset = [x - el.x, y - el.y];
        this.isDragging = true;
    }

    static respondMouseMove(pr: UI512DemoPaint, d: MouseMoveEventDetails) {
        if (pr.isDragging && pr.trackPressedBtns[0]) {
            let el = pr.app.findEl(pr.trackClickedIds[0]);
            if (el) {
                let newX = d.mouseX - pr.mouseDragDropOffset[0];
                let newY = d.mouseY - pr.mouseDragDropOffset[1];
                el.setDimensions(newX, newY, el.w, el.h);
            }
        }
    }
}
