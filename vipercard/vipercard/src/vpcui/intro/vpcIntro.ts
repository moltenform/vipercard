
/* auto */ import { VpcDocumentLocation, VpcIntroProvider } from './vpcIntroProvider';
/* auto */ import { IntroPageLoading } from './vpcIntroPageLoading';
/* auto */ import { IntroPageFirst } from './vpcIntroPageFirst';
/* auto */ import { IntroPageBase } from './vpcIntroPageBase';
/* auto */ import { VpcIntroInterface } from './vpcIntroInterface';
/* auto */ import { getUI512WindowBounds } from './../../ui512/utils/utilsDrawConstants';
/* auto */ import { getRoot } from './../../ui512/utils/util512Higher';
/* auto */ import { Util512, cast } from './../../ui512/utils/util512';
/* auto */ import { addDefaultListeners } from './../../ui512/textedit/ui512TextEvents';
/* auto */ import { UI512CompModalDialog } from './../../ui512/composites/ui512ModalDialog';
/* auto */ import { UI512EventType } from './../../ui512/draw/ui512Interfaces';
/* auto */ import { IdleEventDetails, KeyDownEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { GridLayout, UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * presenter for the ViperCard intro screen
 */
export class VpcUiIntro extends VpcIntroInterface {
    /**
     * initialize UI
     */
    init() {
        super.init();
        this.bounds = getUI512WindowBounds();
        this.app = new UI512Application(this.bounds, this);
        let grp = new UI512ElGroup('grpmain');
        this.app.addGroup(grp);

        /* draw bg */
        let fullBg = new UI512ElButton('bg');
        grp.addElement(this.app, fullBg);
        fullBg.set('style', UI512BtnStyle.Opaque);
        fullBg.setDimensions(this.bounds[0], this.bounds[1], this.bounds[2], this.bounds[3]);
        fullBg.set('autohighlight', false);

        /* draw gray bg */
        let offsetForBetterPattern = -1;
        let layoutPatternBg = new GridLayout(
            offsetForBetterPattern,
            0,
            220,
            512,
            Util512.range(0, 5) /* cols */,
            Util512.range(0, 2) /* rows */,
            -4 /* negative margin so that the tiles overlap */,
            -4 /* negative margin so that the tiles overlap */
        );

        layoutPatternBg.createElems(this.app, grp, 'bgpattern', UI512ElButton, (col, row, el) => {
            el.set('icongroupid', 'logo');
            el.set('iconnumber', 1);
            el.set('style', UI512BtnStyle.Transparent);
            el.set('autohighlight', false);
        });

        /* start the first page (a ui512composite object) */
        this.activePage = new IntroPageFirst('introFirstPage', this.bounds);
        this.activePage.create(this, this.app);
        this.rebuildFieldScrollbars();

        /* register for events */
        addDefaultListeners(this.listeners);
        this.listenEvent(UI512EventType.MouseDown, VpcUiIntro.respondMouseDown);
        this.listenEvent(UI512EventType.MouseUp, VpcUiIntro.respondMouseUp);
        this.listenEvent(UI512EventType.MouseMove, VpcUiIntro.respondMouseMove);
        this.listenEvent(UI512EventType.KeyDown, VpcUiIntro.respondKeyDown);
        this.listenEvent(UI512EventType.Idle, VpcUiIntro.respondIdle);
        this.invalidateAll();
        this.rebuildFieldScrollbars();
        this.inited = true;
    }

    /**
     * back to the first screen
     */
    goBackToFirstScreen() {
        let [x, y] = [this.activePage.x, this.activePage.y];
        this.activePage.destroy(this, this.app);
        this.activePage = new IntroPageFirst('introFirstPage', this.bounds, x, y);
        this.activePage.create(this, this.app);
    }

    /**
     * get a modal dialog object
     */
    getModal() {
        return new UI512CompModalDialog('mainModalDlg');
    }

    /**
     * route keydown to the current page
     */
    static respondKeyDown(pr: VpcUiIntro, d: KeyDownEventDetails) {
        if (pr.activePage) {
            pr.activePage.respondKeyDown(pr, d);
        }
    }

    /**
     * route mouseup to the current page
     */
    static respondMouseUp(pr: VpcUiIntro, d: MouseUpEventDetails) {
        if (pr.activePage) {
            pr.activePage.respondMouseUp(pr, d);
        }

        if (d.elClick && pr.activePage instanceof IntroPageBase) {
            if (pr.activePage.children.length) {
                pr.activePage.respondToBtnClick(pr, pr.activePage, d.elClick);
            }
        }
    }

    /**
     * create a new project and begin it, leaving the intro
     */
    beginNewDocument() {
        let loader = new VpcIntroProvider('', lng('lngnew stack'), VpcDocumentLocation.NewDoc);
        this.beginLoadDocument(loader);
    }

    /**
     * load a project and begin it, leaving the intro
     */
    beginLoadDocument(loader: VpcIntroProvider) {
        this.provideExitCallbacks(loader);
        let translatedLoadMessage = lng('lngLoading %docname');
        translatedLoadMessage = translatedLoadMessage.replace(/%docname/g, loader.docName);
        let [x, y] = [this.activePage.x, this.activePage.y];
        this.activePage.destroy(this, this.app);
        this.activePage = new IntroPageLoading('introWaitWhileLoadingPage', this.bounds, x, y, loader, translatedLoadMessage);

        this.activePage.create(this, this.app);
        this.rebuildFieldScrollbars();
        cast(IntroPageLoading, this.activePage).go(this);
    }

    /**
     * provide callbacks to the ViperCard presenter, so that it can return here
     */
    protected provideExitCallbacks(loader: VpcIntroProvider) {
        let exitToMainMenu = () => {
            let pr = new VpcUiIntro();
            pr.init();
            getRoot().replaceCurrentPresenter(pr);
            return pr;
        };

        loader.cbExitToMainMenu = () => {
            exitToMainMenu();
        };

        loader.cbExitToNewDocument = () => {
            let pr = exitToMainMenu();
            pr.beginNewDocument();
        };

        loader.cbExitToOpen = mineOnly => {
            let pr = exitToMainMenu();
            if (mineOnly) {
                IntroPageFirst.goPage(pr, VpcDocumentLocation.ShowLoginForm);
            } else {
                IntroPageFirst.onDoOpenstack(pr);
            }
        };
    }

    /**
     * route mousedown events to the current page
     */
    static respondMouseDown(pr: VpcUiIntro, d: MouseDownEventDetails) {
        if (pr.activePage) {
            pr.activePage.respondMouseDown(pr, d);
        }
    }

    /**
     * route mousemove events to the current page
     */
    static respondMouseMove(pr: VpcUiIntro, d: MouseMoveEventDetails) {
        if (pr.activePage) {
            pr.activePage.respondMouseMove(pr, d);
        }
    }

    /**
     * route idle events to the current page
     */
    static respondIdle(pr: VpcUiIntro, d: IdleEventDetails) {
        if (pr.activePage) {
            pr.activePage.respondIdle(pr, d);
        }
    }
}
