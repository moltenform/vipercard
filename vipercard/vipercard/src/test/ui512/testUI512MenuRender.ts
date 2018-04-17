
/* auto */ import { RenderComplete, assertEq } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { ScreenConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, NullaryFn, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { MenuPositioning, UI512MenuDefn } from '../../ui512/menu/ui512MenuPositioning.js';
/* auto */ import { MenuListeners } from '../../ui512/menu/ui512MenuListeners.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';

export class UI512TestMenusPresenter extends UI512Presenter {}

export class TestDrawUI512Menus extends UI512TestBase {
    uicontext = false;
    tests = [
        'callback/Test Drawing Menus',
        (callback: NullaryFn) => {
            testUtilCompareCanvasWithExpected(false, () => this.testDrawMenus(), callback);
        }
    ];

    runtest(dldimage: boolean) {
        testUtilCompareCanvasWithExpected(dldimage, () => this.testDrawMenus());
    }

    getMenuStruct(): UI512MenuDefn[] {
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
        let [grpbar, grpitems] = MenuPositioning.getMenuGroups(pr.app);
        MenuPositioning.buildFromArray(pr, this.getMenuStruct());
        grpitems.getEl('mnuOptSecond').set('checkmark', true);
        let toDisable = ['mnuCut', 'mnuCopy', 'mnuClear', 'mnuTextStyle'];
        for (let shortId of toDisable) {
            for (let number of ['1', '2']) {
                grpitems.getEl(shortId + number).set('enabled', false);
                grpitems.getEl(shortId + number).set('enabledstyle', false);
            }
        }
    }

    drawTestCase(
        expanded: number[],
        tmpCanvas: CanvasWrapper,
        w: number,
        h: number,
        i: number,
        complete: RenderComplete
    ) {
        tmpCanvas.clear();
        let testc = new UI512TestMenusPresenter();
        testc.inited = true;
        testc.app = new UI512Application([0, 0, w, h], testc);
        this.addElements(testc, '(background)', testc.app.bounds);

        /* mimic the user clicking on a menu */
        if (expanded[0] !== -1) {
            let menuroot = MenuPositioning.getMenuRoot(testc.app);
            let dropdns = menuroot.getchildren(testc.app);
            MenuListeners.setActiveMenu(testc, dropdns[expanded[0]].id);
            menuroot.setDirty(true);

            if (expanded[1] !== -1) {
                let items = dropdns[expanded[0]].getChildren(testc.app);
                items[expanded[1]].set('highlightactive', true);
            }
        }

        /* test different clock times */
        if (i < 2) {
            let [grpbar, grpitems] = MenuPositioning.getMenuGroups(testc.app);
            grpbar.getEl('topClock').set('labeltext', i === 0 ? '1/1/17' : '1/18/18');
        }

        /* don't show any borders */
        testc.view.renderBorders = () => {};
        testc.render(tmpCanvas, 1, complete);
    }

    testDrawMenus() {
        const w = 928;
        const h = 300;
        assertEq(w, ScreenConsts.ScreenWidth, '1S|');
        let tmpCanvasDom = window.document.createElement('canvas');
        tmpCanvasDom.width = w;
        tmpCanvasDom.height = h;
        let tmpCanvas = new CanvasWrapper(tmpCanvasDom);

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

        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            complete.complete = true;
            for (let i = 0; i < drawMenuTestCases.length; i++) {
                this.drawTestCase(drawMenuTestCases[i], tmpCanvas, w, h, i, complete);
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

        const totalh = h * drawMenuTestCases.length;
        return new CanvasTestParams(
            'drawMenus',
            '/resources/test/drawmenusexpected.png',
            draw,
            w,
            totalh,
            this.uicontext
        );
    }
}
