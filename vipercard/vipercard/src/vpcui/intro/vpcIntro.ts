
/* auto */ import { Util512, getRoot } from '../../ui512/utils/utils512.js';
/* auto */ import { getUI512WindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512Interfaces.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512ElementGroup.js';
/* auto */ import { GridLayout, UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { IdleEventDetails, KeyDownEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { addDefaultListeners } from '../../ui512/textedit/ui512TextEvents.js';
/* auto */ import { UI512CompModalDialog } from '../../ui512/composites/ui512ModalDialog.js';
/* auto */ import { OpenFromLocation, VpcIntroProvider } from '../../vpcui/intro/vpcIntroProvider.js';
/* auto */ import { VpcIntroInterface } from '../../vpcui/intro/vpcIntroInterface.js';
/* auto */ import { IntroPagePickFile } from '../../vpcui/intro/vpcIntroPagePickFile.js';
/* auto */ import { IntroPageLoading } from '../../vpcui/intro/vpcIntroPageLoading.js';
/* auto */ import { IntroPageOpen } from '../../vpcui/intro/vpcIntroPageOpen.js';
/* auto */ import { IntroPageFirst } from '../../vpcui/intro/vpcIntroPageFirst.js';

export class VpcUiIntro extends VpcIntroInterface {
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
            el.set('icongroupid', 'logo');
            el.set('iconnumber', 1);
            el.set('style', UI512BtnStyle.Transparent);
            el.set('autohighlight', false);
        });

        this.activePage = new IntroPageFirst('introFirstPage', this.bounds);
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
        this.activePage = new IntroPageFirst('introFirstPage', this.bounds, x, y);
        this.activePage.create(this, this.app);
    }

    newDocument() {
        let loader = new VpcIntroProvider('', lng('lngnew stack'), OpenFromLocation.NewDoc);
        this.beginLoadDocument(loader);
    }

    getModal() {
        return new UI512CompModalDialog('mainModalDlg');
    }

    static respondKeyDown(pr: VpcUiIntro, d: KeyDownEventDetails) {
        if (pr.activePage) {
            pr.activePage.respondKeyDown(pr, d);
        }
    }

    static respondMouseUp(pr: VpcUiIntro, d: MouseUpEventDetails) {
        if (pr.activePage) {
            pr.activePage.respondMouseUp(pr, d);
        }

        if (d.elClick && pr.activePage instanceof IntroPageFirst) {
            IntroPageFirst.respondBtnClick(pr, pr.activePage, d.elClick);
        } else if (d.elClick && pr.activePage instanceof IntroPageOpen) {
            IntroPageOpen.respondBtnClick(pr, pr.activePage, d.elClick);
        } else if (d.elClick && pr.activePage instanceof IntroPageLoading) {
            IntroPageLoading.respondBtnClick(pr, pr.activePage, d.elClick);
        } else if (d.elClick && pr.activePage instanceof IntroPagePickFile) {
            IntroPagePickFile.respondBtnClick(pr, pr.activePage, d.elClick);
        }
    }

    beginLoadDocument(loader: VpcIntroProvider) {
        this.provideExitCallbacks(loader);
        let translatedLoadMessage = lng('lngLoading %docname');
        translatedLoadMessage = translatedLoadMessage.replace(/%docname/g, loader.docname);
        let [x, y] = [this.activePage.x, this.activePage.y];
        this.activePage.destroy(this, this.app);
        this.activePage = new IntroPageLoading(
            'introWaitWhileLoadingPage',
            this.bounds,
            x,
            y,
            loader,
            translatedLoadMessage
        );
        this.activePage.create(this, this.app);
        this.rebuildFieldScrollbars();
        (this.activePage as IntroPageLoading).go(this);
    }

    protected provideExitCallbacks(loader: VpcIntroProvider) {
        let exitToMainMenu = () => {
            let ctrller = new VpcUiIntro();
            ctrller.init();
            getRoot().replaceCurrentPresenter(ctrller);
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
                IntroPageFirst.showOpenPage(ctrller, OpenFromLocation.ShowLoginForm);
            } else {
                let fakebtn = new UI512ElButton('_choice_openStack');
                IntroPageFirst.respondBtnClick(ctrller, undefined, fakebtn);
            }
        };
    }

    static respondMouseDown(pr: VpcUiIntro, d: MouseDownEventDetails) {
        if (pr.activePage) {
            pr.activePage.respondMouseDown(pr, d);
        }
    }

    static respondMouseMove(pr: VpcUiIntro, d: MouseMoveEventDetails) {
        if (pr.activePage) {
            pr.activePage.respondMouseMove(pr, d);
        }
    }

    static respondIdle(pr: VpcUiIntro, d: IdleEventDetails) {
        if (pr.activePage) {
            pr.activePage.respondIdle(pr, d);
        }
    }
}
