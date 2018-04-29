
/* auto */ import { RenderComplete, assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, UI512RenderAndCompareImages, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { MenuPositioning, UI512MenuDefn } from '../../ui512/menu/ui512MenuPositioning.js';
/* auto */ import { MenuListeners } from '../../ui512/menu/ui512MenuListeners.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';

/**
 * TestDrawUI512Menus
 *
 * A "demo" project showing a menubar.
 *
 * 1) tests use this project to compare against a known good screenshot,
 * to make sure rendering has not changed
 * 2) you can start this project in _rootUI512.ts_ (uncomment the line referencing _UI512DemoMenus_) to confirm that manually
 * interacting with the menus has the expected behavior
 */
export class TestDrawUI512Menus extends UI512TestBase {
    uiContext = false;
    tests = [
        'async/Test Drawing Menus',
        async () => {
            await UI512RenderAndCompareImages(false, () => this.testDrawMenus());
        }
    ];

    getDefn(): UI512MenuDefn[] {
        return [
            ['mnuHeaderOS|icon:001:80:26', ['|lngPlaceholder|']],
            ['mnuHeaderFile|lngFile', ['|lngPlaceholder|']],
            [
                'mnuHeaderEdit|lngEdit',
                [
                    '|lngUndo|\xBD Z',
                    '|---|',
                    'mnuCut1|lngCut|\xBD X',
                    'mnuCopy1|lngCopy|\xBD C',
                    '|lngPaste Text|\xBD V',
                    'mnuClear1|lngClear|',
                    '|---|',
                    '|lngNew Card|\xBD N',
                    '|lngDelete Card|',
                    '|lngCut Card|',
                    '|lngCopy Card|',
                    '|---|',
                    'mnuTextStyle1|lngText Style...|\xBD T',
                    '|lngBackground|\xBD B',
                    '|lngIcon...|\xBD I'
                ]
            ],
            [
                'mnuHeaderGo|lngGo',
                [
                    '|lngUndo 2|\xBD Z',
                    '|---|',
                    'mnuCut2|lngCut 2|\xBD X',
                    'mnuCopy2|lngCopy 2|\xBD C',
                    '|lngPaste Longer Text 2|\xBD V',
                    'mnuClear2|lngClear 2|',
                    '|---|',
                    '|lngNew Card 2|\xBD N',
                    '|lngDelete Card 2|',
                    '|lngCut Card 2|',
                    '|lngCopy Card 2|',
                    '|---|',
                    'mnuTextStyle2|lngText Style 2...|\xBD T',
                    '|lngBackground 2|\xBD B',
                    '|lngIcon 2...|\xBD I'
                ]
            ],
            ['mnuHeaderTools|lngTools', ['|lngPlaceholder|']],
            ['mnuHeaderPaint|lngPaint', ['|lngPlaceholder|']],
            [
                'mnuHeaderOptions|lngOptions',
                ['mnuOptFirst|lngFirst|', 'mnuOptSecond|lngSecond|', 'mnuOptThird|lngThird|']
            ],
            ['mnuHeaderPatterns|lngPatterns', ['|lngPlaceholder|']],
            ['topClock|lng12/28/18', 790, ['|lngPlaceholder|']],
            ['mnuHeaderHelpIcon|icon:001:75:27', 864, ['|lngA longer text...|']],
            [
                'mnuHeaderAppIcon|icon:001:78:27',
                891,
                ['|lngHide This Program|', '|lngHide Others|', 'mnuShowAll|lngShow All|']
            ]
        ];
    }

    addElements(pr: UI512Presenter, bgtext: string, bounds: number[]) {
        let grp = new UI512ElGroup('grp');
        pr.app.addGroup(grp);

        /* add bg */
        let bg = new UI512ElButton('bg');
        grp.addElement(pr.app, bg);
        bg.set('labeltext', bgtext);
        bg.set('style', UI512BtnStyle.Opaque);
        bg.setDimensions(bounds[0], bounds[1], bounds[2], bounds[3]);
        bg.set('enabled', false);
        bg.set('enabledstyle', false);

        /* add a horizontal line, the dropdowns should cover it */
        let testTransparency = new UI512ElButton('testTransparency1');
        grp.addElement(pr.app, testTransparency);
        testTransparency.setDimensions(bounds[0] + 100, bounds[1] + 100, 5, 1);

        /* add the menu */
        let [grpBar, grpItems] = MenuPositioning.getMenuGroups(pr.app);
        MenuPositioning.buildFromArray(pr, this.getDefn());
        grpItems.getEl('mnuOptSecond').set('checkmark', true);
        let toDisable = ['mnuCut', 'mnuCopy', 'mnuClear', 'mnuTextStyle'];
        for (let shortId of toDisable) {
            for (let number of ['1', '2']) {
                grpItems.getEl(shortId + number).set('enabled', false);
                grpItems.getEl(shortId + number).set('enabledstyle', false);
            }
        }
    }

    drawTestCase(
        whichMnuExpanded: number,
        whichItemSeled: number,
        tmpCanvas: CanvasWrapper,
        w: number,
        h: number,
        i: number,
        complete: RenderComplete
    ) {
        tmpCanvas.clear();
        let testPr = new UI512TestMenusPresenter();
        testPr.inited = true;
        testPr.app = new UI512Application([0, 0, w, h], testPr);
        this.addElements(testPr, '(background)', testPr.app.bounds);

        /* mimic the user clicking on a menu */
        if (whichMnuExpanded !== -1) {
            let menuRoot = MenuPositioning.getMenuRoot(testPr.app);
            let dropDowns = menuRoot.getchildren(testPr.app);
            MenuListeners.setActiveMenu(testPr, dropDowns[whichMnuExpanded].id);
            menuRoot.setDirty(true);

            if (whichItemSeled !== -1) {
                let items = dropDowns[whichMnuExpanded].getChildren(testPr.app);
                items[whichItemSeled].set('highlightactive', true);
            }
        }

        /* test different clock times */
        if (i < 2) {
            let [grpBar, grpItems] = MenuPositioning.getMenuGroups(testPr.app);
            grpBar.getEl('topClock').set('labeltext', i === 0 ? '1/1/17' : '1/18/18');
        }

        /* don't show any borders */
        testPr.view.renderBorders = () => {};
        testPr.render(tmpCanvas, 1, complete);
    }

    testDrawMenus() {
        const w = 928;
        const h = 300;
        assertEq(w, ScreenConsts.ScreenWidth, '1S|');
        let tmpCanvasDom = window.document.createElement('canvas');
        tmpCanvasDom.width = w;
        tmpCanvasDom.height = h;
        let tmpCanvas = new CanvasWrapper(tmpCanvasDom);

        /* [which menu is open, which item is selected]  */
        const drawMenuTestCases = [
            [-1, -1],
            [0, -1],
            [2, -1],
            [3, -1],
            [6, -1],
            [9, -1],
            [10, -1],
            [2, 0],
            [2, 4],
            [6, 0],
            [6, 1]
        ];

        /* draw the menubar many times, each time with a different menu open
        or a different item selected */
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = true;
            for (let i = 0; i < drawMenuTestCases.length; i++) {
                let [whichMnuExpanded, whichItemSeled] = drawMenuTestCases[i];
                this.drawTestCase(whichMnuExpanded, whichItemSeled, tmpCanvas, w, h, i, complete);
                let dest = [0, i * h, w, h];
                canvas.drawFromImage(
                    tmpCanvas.canvas,
                    0,
                    0,
                    w,
                    h,
                    dest[0],
                    dest[1],
                    dest[0],
                    dest[1],
                    dest[2],
                    dest[3]
                );
            }
        };

        const totalH = h * drawMenuTestCases.length;
        return new CanvasTestParams(
            'drawMenus',
            '/resources/test/drawmenusexpected.png',
            draw,
            w,
            totalH,
            this.uiContext
        );
    }

    runTest(dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawMenus());
    }
}

/**
 * presenter, driven by tests to take a screenshot of rendered elements
 */
export class UI512TestMenusPresenter extends UI512Presenter {}
