
/* auto */ import { Util512, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { getUI512WindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementsGroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { GridLayout, UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementsButton.js';
/* auto */ import { IdleEventDetails, KeyDownEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { addDefaultListeners } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { UI512CompStdDialog } from '../../ui512/composites/ui512ModalDialog.js';
/* auto */ import { OpenFromLocation, VpcDocLoader } from '../../vpcui/intro/vpcIntroProvider.js';
/* auto */ import { IntroOpenFromDiskPage } from '../../vpcui/intro/vpcIntroPickFile.js';
/* auto */ import { VpcIntroPresenterInterface } from '../../vpcui/intro/vpcIntroInterface.js';
/* auto */ import { IntroWaitWhileLoadingPage } from '../../vpcui/intro/vpcIntroLoading.js';
/* auto */ import { IntroOpenPage } from '../../vpcui/intro/vpcIntroOpen.js';
/* auto */ import { IntroFirstPage } from '../../vpcui/intro/vpcIntroFirst.js';

export class VpcUiIntro extends VpcIntroPresenterInterface {
    counter = 0;
    init() {
        super.init();
        addDefaultListeners(this.listeners);
        this.bounds = getUI512WindowBounds();
        this.app = new UI512Application(this.bounds, this);
        let grp = new UI512ElGroup('grpmain');
        this.app.addGroup(grp);

        // draw bg
        let fullBg = new UI512ElButton('bg');
        grp.addElement(this.app, fullBg);
        fullBg.set('style', UI512BtnStyle.Opaque);
        fullBg.setDimensions(this.bounds[0], this.bounds[1], this.bounds[2], this.bounds[3]);
        fullBg.set('autohighlight', false);

        // draw gray bg
        let offsetForBetterPattern = -1;
        let layoutPatternBg = new GridLayout(
            offsetForBetterPattern,
            0,
            220,
            512,
            Util512.range(5),
            Util512.range(2),
            -4,
            -4
        );
        layoutPatternBg.createElems(this.app, grp, 'bgpattern', UI512ElButton, (col, row, el) => {
            el.set('iconsetid', 'logo');
            el.set('iconnumber', 1);
            el.set('style', UI512BtnStyle.Transparent);
            el.set('autohighlight', false);
        });

        this.activePage = new IntroFirstPage('introFirstPage', this.bounds);
        this.activePage.create(this, this.app);
        this.rebuildFieldScrollbars();

        this.invalidateAll();
        this.listenEvent(UI512EventType.MouseDown, VpcUiIntro.respondMouseDown);
        this.listenEvent(UI512EventType.MouseUp, VpcUiIntro.respondMouseUp);
        this.listenEvent(UI512EventType.MouseMove, VpcUiIntro.respondMouseMove);
        this.listenEvent(UI512EventType.KeyDown, VpcUiIntro.respondKeyDown);
        this.listenEvent(UI512EventType.Idle, VpcUiIntro.respondIdle);
        this.rebuildFieldScrollbars();
        this.inited = true;
    }

    goBackToFirstScreen() {
        let [x, y] = [this.activePage.x, this.activePage.y];
        this.activePage.destroy(this, this.app);
        this.activePage = new IntroFirstPage('introFirstPage', this.bounds, x, y);
        this.activePage.create(this, this.app);
    }

    newDocument() {
        let loader = new VpcDocLoader(
            '',
            lng('lngnew stack'),
            OpenFromLocation.NewDoc
        );
        this.beginLoadDocument(loader);
    }

    getModal() {
        return new UI512CompStdDialog('mainModalDlg');
    }

    static respondKeyDown(c: VpcUiIntro, d: KeyDownEventDetails) {
        if (c.activePage) {
            c.activePage.respondKeyDown(c, d);
        }
    }

    static respondMouseUp(c: VpcUiIntro, d: MouseUpEventDetails) {
        if (c.activePage) {
            c.activePage.respondMouseUp(c, d);
        }

        if (d.elClick && c.activePage instanceof IntroFirstPage) {
            IntroFirstPage.respondBtnClick(c, c.activePage, d.elClick);
        } else if (d.elClick && c.activePage instanceof IntroOpenPage) {
            IntroOpenPage.respondBtnClick(c, c.activePage, d.elClick);
        } else if (d.elClick && c.activePage instanceof IntroWaitWhileLoadingPage) {
            IntroWaitWhileLoadingPage.respondBtnClick(c, c.activePage, d.elClick);
        } else if (d.elClick && c.activePage instanceof IntroOpenFromDiskPage) {
            IntroOpenFromDiskPage.respondBtnClick(c, c.activePage, d.elClick);
        }
    }

    beginLoadDocument(loader: VpcDocLoader) {
        this.provideExitCallbacks(loader);
        let translatedLoadMessage = lng('lngLoading %docname');
        translatedLoadMessage = translatedLoadMessage.replace(/%docname/g, loader.docname);
        let [x, y] = [this.activePage.x, this.activePage.y];
        this.activePage.destroy(this, this.app);
        this.activePage = new IntroWaitWhileLoadingPage(
            'introWaitWhileLoadingPage',
            this.bounds,
            x,
            y,
            loader,
            translatedLoadMessage,
        );
        this.activePage.create(this, this.app);
        this.rebuildFieldScrollbars();
        (this.activePage as IntroWaitWhileLoadingPage).go(this);
    }

    protected provideExitCallbacks(loader: VpcDocLoader) {
        let exitToMainMenu = () => {
            let ctrller = new VpcUiIntro();
            ctrller.init();
            getRoot().replaceCurrentController(ctrller);
            return ctrller;
        };

        loader.cbExitToMainMenu = () => {
            exitToMainMenu();
        };

        loader.cbExitToNewDocument = () => {
            let ctrller = exitToMainMenu();
            ctrller.newDocument();
        };

        loader.cbExitToOpen = mineOnly => {
            let ctrller = exitToMainMenu();
            if (mineOnly) {
                IntroFirstPage.showOpenPage(ctrller, OpenFromLocation.ShowLoginForm);
            } else {
                let fakebtn = new UI512ElButton('_choice_openStack');
                IntroFirstPage.respondBtnClick(ctrller, undefined, fakebtn);
            }
        };
    }

    static respondMouseDown(c: VpcUiIntro, d: MouseDownEventDetails) {
        if (c.activePage) {
            c.activePage.respondMouseDown(c, d);
        }
    }

    static respondMouseMove(c: VpcUiIntro, d: MouseMoveEventDetails) {
        if (c.activePage) {
            c.activePage.respondMouseMove(c, d);
        }
    }

    static respondIdle(c: VpcUiIntro, d: IdleEventDetails) {
        if (c.activePage) {
            c.activePage.respondIdle(c, d);
        }
    }
}
