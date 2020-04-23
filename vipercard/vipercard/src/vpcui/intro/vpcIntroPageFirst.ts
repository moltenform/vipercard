
/* auto */ import { getVpcSessionTools } from './../../vpc/request/vpcRequest';
/* auto */ import { VpcDocumentLocation, VpcIntroProvider } from './vpcIntroProvider';
/* auto */ import { IntroPagePickFile } from './vpcIntroPagePickFile';
/* auto */ import { IntroPageOpen } from './vpcIntroPageOpen';
/* auto */ import { IntroPageBase } from './vpcIntroPageBase';
/* auto */ import { VpcIntroInterface } from './vpcIntroInterface';
/* auto */ import { VpcAboutDialog } from './../menu/vpcAboutDialog';
/* auto */ import { RespondToErr, Util512Higher, getRoot } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { Util512, slength } from './../../ui512/utils/util512';
/* auto */ import { IdleEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElGroup } from './../../ui512/elements/ui512ElementGroup';
/* auto */ import { UI512BtnStyle, UI512ElButton } from './../../ui512/elements/ui512ElementButton';
/* auto */ import { GridLayout, UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';
/* auto */ import { lng } from './../../ui512/lang/langBase';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * first page shown when you open ViperCard
 */
export class IntroPageFirst extends IntroPageBase {
    compositeType = 'IntroPageFirst';
    static haveCheckedPageURLParams = false;

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        const cellWidth = 66;
        const cellHeight = 110;
        const iconW = 24;
        const iconH = 24;
        const footerHeight = 45;
        const numBtns = 4;
        const btnWidth = 200;
        const btnHeight = 24;
        const btnMargin = 22;
        const increaseHForLargerBtn = 10;

        /* set button positions manually, using an even grid doesn't */
        /* look right since the default button is slightly taller than the rest. */
        const btnY = [78, 118, 170, 214];

        /* draw group and window decoration */
        let grp = app.getGroup(this.grpId);
        let headerHeight = this.drawCommonFirst(app, grp);

        /* draw background decoration (lots of hands) */
        this.drawHandCursors(iconW, iconH, cellWidth, cellHeight, app, grp);

        /* compute dimensions for the initial buttons */
        let ySpacebtns = numBtns * btnHeight + (numBtns - 1) * btnMargin;
        const spaceY = this.logicalHeight - (headerHeight + footerHeight);
        const centeredY = this.y + headerHeight + Math.trunc((spaceY - ySpacebtns) / 2);
        const btnX = this.x + Math.trunc((this.logicalWidth - btnWidth) / 2);

        /* cover up the background and make it white beneath the initial buttons */
        let opaqueWhiteBehindBtns = this.genBtn(app, grp, 'opaqueWhiteBehindBtns');
        opaqueWhiteBehindBtns.set('style', UI512BtnStyle.Opaque);
        opaqueWhiteBehindBtns.set('autohighlight', false);
        opaqueWhiteBehindBtns.setDimensions(btnX, centeredY, btnWidth, ySpacebtns);

        const btnKeywords = ['openStack', 'showFeatured', 'newStack', 'showAbout'];
        const btnLabels = ['lngOpen stack...', 'lngFeatured stacks...', 'lngNew stack', 'lngAbout...', ''];
        let layout = new GridLayout(
            btnX,
            centeredY,
            btnWidth,
            btnHeight,
            Util512.range(0, 1) /* cols */,
            Util512.range(0, numBtns) /* rows */,
            btnMargin,
            btnMargin
        );

        /* create the initial buttons */
        layout.combinations((n, nCol, nRow, bnds) => {
            let id = 'choice' + Util512.capitalizeFirst(btnKeywords[nRow]);
            let el = this.genBtn(app, grp, id);
            el.setDimensions(bnds[0], this.y + btnY[nRow], bnds[2], bnds[3]);
            el.set('style', btnKeywords[nRow] === 'showFeatured' ? UI512BtnStyle.OSDefault : UI512BtnStyle.OSStandard);
            el.set('labeltext', lng(btnLabels[nRow]));
            if (btnKeywords[nRow] === 'showFeatured') {
                el.setDimensions(el.x, el.y, el.w, el.h + increaseHForLargerBtn);
            } else if (btnKeywords[nRow] === 'showAbout') {
                el.setDimensions(el.x, el.y, el.w, el.h);
            }
        });

        this.drawCommonLast(app, grp);
    }

    /**
     * draw the 'hands' background decoration
     * draw 2 grids, staggered, like a fleur de lis wallpaper
     */
    protected drawHandCursors(
        iconW: number,
        iconH: number,
        cellWidth: number,
        cellHeight: number,
        app: UI512Application,
        grp: UI512ElGroup
    ) {
        let cbHands = (a: number, b: number, el: UI512ElButton) => {
            el.set('icongroupid', 'logo');
            el.set('iconnumber', 2);
            el.set('style', UI512BtnStyle.Transparent);
            el.set('autohighlight', false);
            this.children.push(el);
        };

        let pattern = new GridLayout(
            this.x + 26,
            this.y + 39,
            iconW,
            iconH,
            Util512.range(0, 7),
            Util512.range(0, 3),
            cellWidth - iconW,
            cellHeight - iconH
        );
        pattern.createElems(app, grp, this.getElId('wallpaper1'), UI512ElButton, cbHands);
        pattern = new GridLayout(
            this.x + 26 + cellWidth / 2,
            this.y + 39 + cellHeight / 2,
            iconW,
            iconH,
            Util512.range(0, 7),
            Util512.range(0, 2),
            cellWidth - iconW,
            cellHeight - iconH
        );
        pattern.createElems(app, grp, this.getElId('wallpaper2'), UI512ElButton, cbHands);
    }

    /**
     * check url if we haven't already
     *
     * haveCheckedPageURLParams is a stack, since when you click "exit to main menu"
     * we don't want to run checkPageUrlParams again and accidentally get taken back into the stack.
     */
    respondIdle(pr: VpcIntroInterface, d: IdleEventDetails) {
        if (!IntroPageFirst.haveCheckedPageURLParams) {
            IntroPageFirst.haveCheckedPageURLParams = true;
            Util512Higher.syncToAsyncTransition(this.checkPageUrlParams(pr), 'respondIdle', RespondToErr.Alert);
        }

        super.respondIdle(pr, d);
    }

    /**
     * see if the url is taking to us to a stack, and load the stack if so
     */
    async checkPageUrlParams(pr: VpcIntroInterface) {
        let provider = IntroPageFirst.checkPageUrlParamsGetProvider(window.location.href);
        if (provider) {
            pr.beginLoadDocument(provider);
        }
    }

    /**
     * parse the page's url parameters and see if it refers to a stack
     */
    static checkPageUrlParamsGetProvider(fullLocation: string): O<VpcIntroProvider> {
        let id = IntroPageFirst.parseStackIdFromParams(fullLocation);
        if (id && slength(id)) {
            id = id.replace(/%7C/g, '|').replace(/%7c/g, '|');
            let pts = id.split('|');
            if (pts.length === 1) {
                /* sending reference to a demo stack is different */
                /* saves some $ since no server code or even db hits need to be run */
                let demoName = Util512.fromBase64UrlSafe(pts[0]);
                if (demoName.startsWith('demo_') && demoName.match(/^[a-zA-Z0-9_-]{1,100}$/)) {
                    /* open the document */
                    let demoId = demoName + '.json';
                    return new VpcIntroProvider(demoId, lng('lngfeatured stack'), VpcDocumentLocation.FromStaticDemo);
                }
            } else if (pts.length === 2) {
                /* we're opening someone's online stack */
                return new VpcIntroProvider(id, lng('lngstack'), VpcDocumentLocation.FromStackIdOnline);
            }
        }

        return undefined;
    }

    /**
     * if the url contains something like s=xxxxx, return the xxxxx
     */
    protected static parseStackIdFromParams(s: string): O<string> {
        let spl = s.split('?');
        if (spl.length === 2) {
            let splParams = spl[1].split('&');
            for (let splParam of splParams) {
                let pair = splParam.split('=');
                if (pair.length === 2) {
                    if (pair[0] === 's') {
                        return pair[1];
                    }
                }
            }
        }

        return undefined;
    }

    /**
     * respond to button click
     */
    static respondBtnClick(pr: VpcIntroInterface, self: O<IntroPageFirst>, el: UI512Element) {
        if (el.id.endsWith('choiceNewStack')) {
            pr.beginNewDocument();
        } else if (el.id.endsWith('choiceShowAbout')) {
            VpcAboutDialog.show(pr, pr.getModal());
        } else if (el.id.endsWith('choiceShowFeatured')) {
            IntroPageFirst.goPage(pr, VpcDocumentLocation.FromStaticDemo);
        } else if (el.id.endsWith('choiceOpenStack')) {
            if (getVpcSessionTools().enableServerCode) {
                pr.getModal().standardAnswer(
                    pr,
                    pr.app,
                    'From which location would you like to open?',
                    n => {
                        if (n === 0) {
                            IntroPageFirst.goPage(pr, VpcDocumentLocation.ShowLoginForm);
                        } else if (n === 1) {
                            IntroPageFirst.goPage(pr, VpcDocumentLocation.FromJsonFile);
                        }
                    },
                    'Online',
                    'Json file',
                    'Cancel'
                );
            } else {
                IntroPageFirst.goPage(pr, VpcDocumentLocation.FromJsonFile);
            }
        }
    }

    /**
     * destroy the active page, and go to another page
     */
    static goPage(pr: VpcIntroInterface, openType: VpcDocumentLocation) {
        let [x, y] = [pr.activePage.x, pr.activePage.y];
        pr.activePage.destroy(pr, pr.app);
        pr.activePage = new IntroPageOpen('introOpenPage', pr.bounds, x, y, openType);
        pr.activePage.create(pr, pr.app);

        if (openType === VpcDocumentLocation.FromJsonFile) {
            /* user clicked 'open from json' */
            let [x1, y1] = [pr.activePage.x, pr.activePage.y];
            pr.activePage.destroy(pr, pr.app);
            pr.activePage = new IntroPagePickFile('IntroPagePickFile', pr.bounds, x1, y1, pr);
            pr.activePage.create(pr, pr.app);
        } else if (openType === VpcDocumentLocation.ShowLoginForm) {
            if (!getRoot().getSession()) {
                /* we have to load the full ui, just to get the dialog to get then to log in */
                let loader = new VpcIntroProvider('', '', VpcDocumentLocation.ShowLoginForm);
                pr.beginLoadDocument(loader);
            } else {
                pr.activePage.destroy(pr, pr.app);
                pr.activePage = new IntroPageOpen('introOpenPage', pr.bounds, x, y, VpcDocumentLocation.FromStackIdOnline);
                pr.activePage.create(pr, pr.app);
            }
        }
    }
}
