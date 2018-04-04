
/* auto */ import { Root, Util512 } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { getStandardWindowBounds } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { UI512EventType } from '../../ui512/draw/ui512interfaces.js';
/* auto */ import { UI512ElGroup } from '../../ui512/elements/ui512elementsgroup.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { GridLayout, UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512elementsbutton.js';
/* auto */ import { IdleEventDetails, KeyDownEventDetails, MouseDownEventDetails, MouseMoveEventDetails, MouseUpEventDetails, } from '../../ui512/menu/ui512events.js';
/* auto */ import { addDefaultListeners } from '../../ui512/textedit/ui512textevents.js';
/* auto */ import { UI512CompStdDialog } from '../../ui512/composites/ui512modaldialog.js';
/* auto */ import { OpenFromLocation, VpcDocLoader } from '../../vpcui/intro/vpcintroprovider.js';
/* auto */ import { VpcIntroPresenterInterface } from '../../vpcui/intro/vpcintrointerface.js';
/* auto */ import { IntroWaitWhileLoadingPage } from '../../vpcui/intro/vpcintroloading.js';
/* auto */ import { IntroOpenFromDiskPage } from '../../vpcui/intro/vpcintrojson.js';
/* auto */ import { IntroOpenPage } from '../../vpcui/intro/vpcintroopen.js';
/* auto */ import { IntroFirstPage } from '../../vpcui/intro/vpcintrofirst.js';

export class VpcUiIntro extends VpcIntroPresenterInterface {
    counter = 0;
    init(root: Root) {
        super.init(root);
        addDefaultListeners(this.listeners);
        this.root = root;
        this.bounds = getStandardWindowBounds();
        this.app = new UI512Application(this.bounds, this);
        let grp = new UI512ElGroup('grpmain');
        this.app.addGroup(grp);

        // draw bg
        let fullBg = new UI512ElButton('bg');
        grp.addElement(this.app, fullBg);
        fullBg.set('style', UI512BtnStyle.opaque);
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
            el.set('style', UI512BtnStyle.transparent);
            el.set('autohighlight', false);
        });

        this.activePage = new IntroFirstPage('introFirstPage', this.bounds);
        this.activePage.create(this, this.app, this.lang);
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
        this.activePage.create(this, this.app, this.lang);
    }

    newDocument() {
        let loader = new VpcDocLoader(
            this.lang,
            this.root,
            '',
            this.lang.translate('lngnew stack'),
            OpenFromLocation.NewDoc
        );
        this.beginLoadDocument(loader);
    }

    getModal() {
        return new UI512CompStdDialog('mainModalDlg', this.lang);
    }

    static respondKeyDown(c: VpcUiIntro, root: Root, d: KeyDownEventDetails) {
        if (c.activePage) {
            c.activePage.respondKeyDown(c, root, d);
        }
    }

    static respondMouseUp(c: VpcUiIntro, root: Root, d: MouseUpEventDetails) {
        if (c.activePage) {
            c.activePage.respondMouseUp(c, root, d);
        }

        if (d.elClick && c.activePage instanceof IntroFirstPage) {
            IntroFirstPage.respondBtnClick(c, root, c.activePage, d.elClick);
        } else if (d.elClick && c.activePage instanceof IntroOpenPage) {
            IntroOpenPage.respondBtnClick(c, root, c.activePage, d.elClick);
        } else if (d.elClick && c.activePage instanceof IntroWaitWhileLoadingPage) {
            IntroWaitWhileLoadingPage.respondBtnClick(c, root, c.activePage, d.elClick);
        } else if (d.elClick && c.activePage instanceof IntroOpenFromDiskPage) {
            IntroOpenFromDiskPage.respondBtnClick(c, root, c.activePage, d.elClick);
        }
    }

    beginLoadDocument(loader: VpcDocLoader) {
        this.provideExitCallbacks(loader);
        let translatedLoadMessage = this.lang.translate('lngLoading %docname');
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
            this.root
        );
        this.activePage.create(this, this.app, this.lang);
        this.rebuildFieldScrollbars();
        (this.activePage as IntroWaitWhileLoadingPage).go(this);
    }

    protected provideExitCallbacks(loader: VpcDocLoader) {
        let exitToMainMenu = () => {
            let ctrller = new VpcUiIntro();
            ctrller.init(this.root);
            this.root.replaceCurrentController(ctrller);
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
                IntroFirstPage.showOpenPage(ctrller, this.root, OpenFromLocation.ShowLoginForm);
            } else {
                let fakebtn = new UI512ElButton('_choice_openStack');
                IntroFirstPage.respondBtnClick(ctrller, this.root, undefined, fakebtn);
            }
        };
    }

    static respondMouseDown(c: VpcUiIntro, root: Root, d: MouseDownEventDetails) {
        if (c.activePage) {
            c.activePage.respondMouseDown(c, root, d);
        }
    }

    static respondMouseMove(c: VpcUiIntro, root: Root, d: MouseMoveEventDetails) {
        if (c.activePage) {
            c.activePage.respondMouseMove(c, root, d);
        }
    }

    static respondIdle(c: VpcUiIntro, root: Root, d: IdleEventDetails) {
        if (c.activePage) {
            c.activePage.respondIdle(c, root, d);
        }
    }
}
