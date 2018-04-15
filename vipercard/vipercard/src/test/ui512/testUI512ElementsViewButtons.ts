
/* auto */ import { O, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { elementObserverNoOp } from '../../ui512/elements/ui512ElementsGettable.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { GridLayout, UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { UI512ViewDraw } from '../../ui512/elements/ui512ElementsView.js';

enum BtnPropsToTest {
    /* note: needs to begin with 0. */
    IconAndNoLabel = 0,
    IconAndLabelAndChecked,
    IconAndLabelMultiline,
    NoIconAndLabelNotCenteredDisabled,
    NoIconAndLabelCentered,
    NoIconNoLabel,
    BtnPropsToTestMax
}

export class TestDrawUI512Buttons extends UI512TestBase {
    readonly numberOfBgButtons = 60;
    uicontext = false;
    tests = [
        'callback/Test Drawing Buttons',
        (callback: () => void) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawButtons(), callback);
        }
    ];

    runtest(dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawButtons());
    }

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

    setBtnStyle(button: UI512ElButton, props: BtnPropsToTest, style: UI512BtnStyle): UI512ElButton {
        button.set('style', style);
        button.set('labelhalign', !(style === UI512BtnStyle.Radio || style === UI512BtnStyle.Checkbox));
        button.set('labelvalign', true);

        switch (props) {
            case BtnPropsToTest.IconAndNoLabel:
                button.set('icongroupid', '001');
                button.set('iconnumber', 11);
                break;
            case BtnPropsToTest.IconAndLabelAndChecked:
                button.set('icongroupid', '002');
                button.set('iconnumber', 71 + 21);
                button.set('labeltext', 'label text');
                button.set('checkmark', true);
                break;
            case BtnPropsToTest.IconAndLabelMultiline:
                /* intentionally show a truncated icon */
                button.set('icongroupid', '001');
                button.set('iconnumber', 12);
                button.set('iconadjustx', 6);
                button.set('iconadjusty', 2);
                button.set('iconadjustwidth', 10);
                button.set('iconadjustheight', -6);
                button.set('labeltext', 'given \nnew line');
                break;
            case BtnPropsToTest.NoIconAndLabelNotCenteredDisabled:
                button.set('labeltext', 'label not centered');
                button.set('labelvalign', false);
                button.set('labelhalign', false);
                break;
            case BtnPropsToTest.NoIconAndLabelCentered:
                button.set('labeltext', "label centered and it's a pretty long string to show");
                button.set('labelvalign', true);
                button.set('labelhalign', true);
                break;
            case BtnPropsToTest.NoIconNoLabel:
                break;
            default:
                assertTrue(false, '1O|unknown button type');
        }

        return button;
    }

    addBackgroundButtons(
        app: UI512Application,
        grp: UI512ElGroup,
        list: UI512ElButton[],
        clientx0: number,
        clienty0: number
    ) {
        for (let x = 0; x < this.numberOfBgButtons; x++) {
            let id = 'btnnumber_bg_' + x.toString();
            let button = new UI512ElButton(id);
            grp.addElement(app, button);
            button.setDimensions(clientx0 + x * 50, 0, 25, 4096);
            list.push(button);
        }
    }

    addButtons(
        app: UI512Application,
        grp: UI512ElGroup,
        list: UI512ElButton[],
        clientx0: number,
        clienty0: number,
        drawBlank: boolean,
        areHighlighted: boolean,
        idprefix: string,
        dims = [90, 65]
    ) {
        let nrows = drawBlank ? BtnPropsToTest.BtnPropsToTestMax : BtnPropsToTest.NoIconNoLabel;
        let rows = Util512.range(0, nrows);
        let layout = new GridLayout(clientx0 + 3, clienty0 + 3, dims[0], dims[1], this.stylesToTest, rows, 3, 3);
        layout.createElems(app, grp, 'btntest' + idprefix + '_', UI512ElButton, (a, b, el) => {
            this.setBtnStyle(el, b, a);
            el.set('highlightactive', areHighlighted);
            list.push(el);
        });
    }

    /* these we have confirmed in the emulator as pixel-perfect */
    testDrawButtons() {
        const imwidth = 950;
        const imheight = 2400;
        let list: UI512ElButton[] = [];
        let count = 0;
        let view = new UI512ViewDraw();
        let fakeapp = new UI512Application([0, 0, 1, 1], elementObserverNoOp);
        let fakegrp = new UI512ElGroup('fakegrp', elementObserverNoOp);

        /* draw background buttons */
        this.addBackgroundButtons(fakeapp, fakegrp, list, 1, 1);
        /* draw not-highlighted buttons */
        this.addButtons(fakeapp, fakegrp, list, 1, 1, true, false, '1');
        /* draw highlighted buttons */
        this.addButtons(fakeapp, fakegrp, list, 1, 450, true, true, '2');
        /* drawing very small buttons might look a bit different, but shouldn't throw errors */
        this.addButtons(fakeapp, fakegrp, list, 1, 900, true, false, '3', [2, 2]);
        /* drawing very small highlighted buttons */
        this.addButtons(fakeapp, fakegrp, list, 500, 900, true, true, '4', [2, 2]);
        /* drawing small buttons */
        this.addButtons(fakeapp, fakegrp, list, 1, 1000, true, false, '5', [5, 5]);
        /* drawing small highlighted buttons */
        this.addButtons(fakeapp, fakegrp, list, 500, 1000, true, true, '6', [5, 5]);
        /* drawing tall buttons */
        this.addButtons(fakeapp, fakegrp, list, 1, 1100, true, false, '7', [40, 200]);
        /* drawing tall highlighted buttons */
        this.addButtons(fakeapp, fakegrp, list, 500, 1100, true, true, '8', [40, 200]);
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            for (let btn of list) {
                view.renderElement(canvas, btn, false, complete);
            }
        };

        return new CanvasTestParams(
            'drawButtons',
            '/resources/test/drawbuttonsexpected.png',
            draw,
            imwidth,
            imheight,
            this.uicontext
        );
    }
}
