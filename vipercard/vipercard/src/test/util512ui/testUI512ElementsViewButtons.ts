
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { RenderComplete } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512 } from './../../ui512/utils/util512';
/* auto */ import { UI512ViewDraw } from './../../ui512/elements/ui512ElementView';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { elementObserverNoOp } from './../../ui512/elements/ui512ElementGettable';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { GridLayout, UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { CanvasTestParams, TestUtilsCanvas } from './../testUtils/testUtilsCanvas';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * TestDrawUI512Buttons
 *
 * A "demo" project showing several buttons with different properties and
 * icons. There are vertical lines in the background to verify transparency.
 *
 * 1) tests use this project to compare against a known good screenshot,
 * to make sure rendering has not changed
 * 2) you can start this project in _rootUI512.ts_ (uncomment the line
 * referencing _UI512DemoButtons_) to confirm that manually
 * interacting with the buttons has the expected behavior
 */

let t = new SimpleUtil512TestCollection('testCollectionUI512ElementsViewButtons');
export let testCollectionUI512ElementsViewButtons = t;

t.atest('Test Drawing Buttons', () =>
    TestUtilsCanvas.RenderAndCompareImages(false, () =>
        new TestDrawUI512Buttons().testDrawButtons()
    )
);

/**
 * an example layout showing many buttons with different styles
 * and properties
 */
export class TestDrawUI512Buttons {
    uiContext = false;
    readonly stylesToTest: number[] = [
        UI512BtnStyle.Rectangle,
        UI512BtnStyle.Transparent,
        UI512BtnStyle.Opaque,
        UI512BtnStyle.Plain,
        UI512BtnStyle.Shadow,
        UI512BtnStyle.OSStandard,
        UI512BtnStyle.OSDefault,
        UI512BtnStyle.Radio,
        UI512BtnStyle.Checkbox
    ];

    setBtnStyle(btn: UI512ElButton, props: BtnPropsToTest, style: UI512BtnStyle) {
        btn.set('style', style);
        btn.set(
            'labelhalign',
            !(style === UI512BtnStyle.Radio || style === UI512BtnStyle.Checkbox)
        );
        btn.set('labelvalign', true);

        switch (props) {
            case BtnPropsToTest.IconAndNoLabel:
                btn.set('icongroupid', '001');
                btn.set('iconnumber', 11);
                break;
            case BtnPropsToTest.IconAndLabelAndChecked:
                btn.set('icongroupid', '002');
                btn.set('iconnumber', 71 + 21);
                btn.set('labeltext', 'label text');
                btn.set('checkmark', true);
                break;
            case BtnPropsToTest.IconAndLabelMultiline:
                /* intentionally show a truncated icon */
                btn.set('icongroupid', '001');
                btn.set('iconnumber', 12);
                btn.set('iconadjustx', 6);
                btn.set('iconadjusty', 2);
                btn.set('iconadjustwidth', 10);
                btn.set('iconadjustheight', -6);
                btn.set('labeltext', 'given \nnew line');
                break;
            case BtnPropsToTest.NoIconAndLabelNotCenteredDisabled:
                btn.set('labeltext', 'label not centered');
                btn.set('labelvalign', false);
                btn.set('labelhalign', false);
                break;
            case BtnPropsToTest.NoIconAndLabelCentered:
                btn.set(
                    'labeltext',
                    "label centered and it's a pretty long string to show"
                );
                btn.set('labelvalign', true);
                btn.set('labelhalign', true);
                break;
            case BtnPropsToTest.NoIconNoLabel:
                break;
            default:
                assertTrue(false, '1O|unknown button type');
        }

        return btn;
    }

    addBackgroundButtons(
        app: UI512Application,
        grp: UI512ElGroup,
        list: UI512ElButton[],
        clientX0: number,
        clientY0: number
    ) {
        const numberOfBgButtons = 60;
        for (let x = 0; x < numberOfBgButtons; x++) {
            let id = 'btnnumber,bg,' + x.toString();
            let button = new UI512ElButton(id);
            grp.addElement(app, button);
            button.setDimensions(clientX0 + x * 50, 0, 25, 4096);
            list.push(button);
        }
    }

    addButtons(
        app: UI512Application,
        grp: UI512ElGroup,
        list: UI512ElButton[],
        clientX0: number,
        clientY0: number,
        drawBlank: boolean,
        areHighlighted: boolean,
        idPrefix: string,
        dims = [90, 65],
        onlyFirst:O<number> = undefined
    ) {
        let nRows = drawBlank
            ? BtnPropsToTest.BtnPropsToTestMax
            : BtnPropsToTest.NoIconNoLabel;
        if (onlyFirst !== undefined) {
            nRows = Math.min(onlyFirst, nRows)
        }

        let rows = Util512.range(0, nRows);
        let layout = new GridLayout(
            clientX0 + 3,
            clientY0 + 3,
            dims[0],
            dims[1],
            this.stylesToTest,
            rows,
            3,
            3
        );
        layout.createElems(
            app,
            grp,
            'btntest' + idPrefix + '_',
            UI512ElButton,
            (a, b, el) => {
                this.setBtnStyle(el, b, a);
                el.set('highlightactive', areHighlighted);
                list.push(el);
            }
        );
    }

    /* these we have confirmed in an emulator as pixel-perfect */
    testDrawButtons() {
        const imWidth = 950;
        const imHeight = 2400;
        let list: UI512ElButton[] = [];
        let view = new UI512ViewDraw();
        let fakeApp = new UI512Application([0, 0, 1, 1], elementObserverNoOp);
        let fakeGrp = new UI512ElGroup('fakeGrp', elementObserverNoOp);

        /* draw background buttons */
        this.addBackgroundButtons(fakeApp, fakeGrp, list, 1, 1);

        /* draw not-highlighted buttons */
        this.addButtons(fakeApp, fakeGrp, list, 1, 1, true, false, '1');

        /* draw highlighted buttons */
        this.addButtons(fakeApp, fakeGrp, list, 1, 450, true, true, '2');

        /* drawing very small buttons might look a bit different, but shouldn't throw errors */
        this.addButtons(fakeApp, fakeGrp, list, 1, 900, true, false, '3', [2, 2]);

        /* drawing very small highlighted buttons */
        this.addButtons(fakeApp, fakeGrp, list, 128, 900, true, true, '4', [2, 2]);

        /* drawing small buttons */
        this.addButtons(fakeApp, fakeGrp, list, 1, 1000, true, false, '5', [5, 5]);

        /* drawing small highlighted buttons */
        this.addButtons(fakeApp, fakeGrp, list, 128, 1000, true, true, '6', [5, 5]);

        /* drawing short and wide buttons */
        this.addButtons(fakeApp, fakeGrp, list, 200, 860, true, false, '7', [100, 35], 3);

        /* drawing short and wide highlighted buttons */
        this.addButtons(fakeApp, fakeGrp, list, 200, 975, true, true, '8', [100, 35], 3);

        /* drawing tall buttons */
        this.addButtons(fakeApp, fakeGrp, list, 1, 1100, true, false, '9', [40, 200]);

        /* drawing tall highlighted buttons */
        this.addButtons(fakeApp, fakeGrp, list, 500, 1100, true, true, '10', [40, 200]);
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            for (let btn of list) {
                view.renderElement(canvas, btn, false, complete);
            }
        };

        return new CanvasTestParams(
            'drawButtons',
            '/resources03a/test/drawbuttonsexpected.png',
            draw,
            imWidth,
            imHeight,
            this.uiContext
        );
    }
}

enum BtnPropsToTest {
    /* note: must begin with 0. */
    IconAndNoLabel = 0,
    IconAndLabelAndChecked,
    IconAndLabelMultiline,
    NoIconAndLabelNotCenteredDisabled,
    NoIconAndLabelCentered,
    NoIconNoLabel,
    BtnPropsToTestMax
}
