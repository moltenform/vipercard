
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root, Util512, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512Lang } from '../../ui512/lang/langbase.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512elementsbase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512elementsapp.js';
/* auto */ import { GridLayout, UI512BtnStyle, UI512ElButton } from '../../ui512/elements/ui512elementsbutton.js';
/* auto */ import { IdleEventDetails } from '../../ui512/menu/ui512events.js';
/* auto */ import { VpcAboutDialog } from '../../vpcui/menu/vpcaboutdialog.js';
/* auto */ import { OpenFromLocation, VpcDocLoader } from '../../vpcui/intro/vpcintroprovider.js';
/* auto */ import { IntroPageBase } from '../../vpcui/intro/vpcintrobase.js';
/* auto */ import { VpcIntroPresenterInterface } from '../../vpcui/intro/vpcintrointerface.js';
/* auto */ import { IntroOpenFromDiskPage } from '../../vpcui/intro/vpcintrojson.js';
/* auto */ import { IntroOpenPage } from '../../vpcui/intro/vpcintroopen.js';

export class IntroFirstPage extends IntroPageBase {
    compositeType = 'IntroFirstPage';

    createSpecific(app: UI512Application, lang: UI512Lang) {
        let grp = app.getGroup(this.grpid);
        let headerheight = this.drawCommonFirst(app, grp, lang);
        // draw weird hands
        let cbHands = (a: number, b: number, el: UI512ElButton) => {
            el.set('iconsetid', 'logo');
            el.set('iconnumber', 2);
            el.set('style', UI512BtnStyle.transparent);
            el.set('autohighlight', false);
            this.children.push(el);
        };
        const ptwidth = 66
        const ptheight = 110
        const iconw = 24
        const iconh = 24
        let layoutIconPattern = new GridLayout(
            this.x + 26,
            this.y + 39,
            iconw,
            iconh,
            Util512.range(7),
            Util512.range(3),
            ptwidth - iconw,
            ptheight - iconh
        );
        layoutIconPattern.createElems(app, grp, this.getElId('wallpaper1'), UI512ElButton, cbHands);
        layoutIconPattern = new GridLayout(
            this.x + 26 + ptwidth / 2,
            this.y + 39 + ptheight / 2,
            iconw,
            iconh,
            Util512.range(7),
            Util512.range(2),
            ptwidth - iconw,
            ptheight - iconh
        );
        layoutIconPattern.createElems(app, grp, this.getElId('wallpaper2'), UI512ElButton, cbHands);

        const footerheight = 45
        const numbtns = 4;
        const btnwidth = 200
        const btnheight = 24
        const btnmargin = 22;
        let yspacebtns = numbtns * btnheight + (numbtns - 1) * btnmargin;
        const yspace = this.logicalHeight - (headerheight + footerheight);
        const ycentered = this.y + headerheight + Math.trunc((yspace - yspacebtns) / 2);
        const btnx = this.x + Math.trunc((this.logicalWidth - btnwidth) / 2);

        let coverbgforbtns = this.genBtn(app, grp, 'coverbgforbtns');
        coverbgforbtns.set('style', UI512BtnStyle.opaque);
        coverbgforbtns.set('autohighlight', false);
        coverbgforbtns.setDimensions(btnx, ycentered, btnwidth, yspacebtns);

        const btnKeywords = ['openStack', 'showFeatured', 'newStack', 'showAbout'];
        const btnLabels = ['lngOpen stack...', 'lngShow featured stacks...', 'lngNew stack', 'lngAbout...', ''];
        let layoutgrid = new GridLayout(
            btnx,
            ycentered + 5,
            btnwidth,
            btnheight,
            [0],
            Util512.range(numbtns),
            btnmargin,
            btnmargin
        );
        layoutgrid.combinations((n, a, b, bnds) => {
            if (btnKeywords[b] !== 'unused') {
                let id = 'choice_' + btnKeywords[b];
                let el = this.genBtn(app, grp, id);
                el.setDimensions(bnds[0], bnds[1] - 4, bnds[2], bnds[3]);
                el.set('style', btnKeywords[b] === 'showFeatured' ? UI512BtnStyle.osdefault : UI512BtnStyle.osstandard);
                el.set('labeltext', lang.translate(btnLabels[b]));
                if (btnKeywords[b] === 'showFeatured') {
                    el.setDimensions(el.x, el.y - 6, el.w, el.h + 10);
                } else if (btnKeywords[b] === 'showAbout') {
                    el.setDimensions(el.x, el.y - 2, el.w, el.h);
                }
            }
        });

        this.drawCommonLast(app, grp, lang);
    }

    static haveCheckedUrl = false;
    respondIdle(c: VpcIntroPresenterInterface, root: Root, d: IdleEventDetails) {
        if (!IntroFirstPage.haveCheckedUrl) {
            IntroFirstPage.haveCheckedUrl = true;
            this.checkIfGivenStackInUrl(c, root);
        }

        super.respondIdle(c, root, d);
    }

    async checkIfGivenStackInUrl(c: VpcIntroPresenterInterface, root: Root) {
        let id = this.parseStackIdFromParams(location.href);
        if (id && slength(id)) {
            id = id.replace(/%7C/g, '|').replace(/%7c/g, '|');
            let pts = id.split('|');
            if (pts.length === 1) {
                // why base64 encoded demo feature? saves server costs
                // check if it's a base64 encoded demo
                let demoname = Util512.fromBase64UrlSafe(pts[0]);
                if (demoname.startsWith('demo_') && demoname.match(/^[a-zA-Z0-9_-]{1,100}$/)) {
                    // open the document
                    let demoid = demoname + '.json';
                    let loader = new VpcDocLoader(
                        c.lang,
                        root,
                        demoid,
                        c.lang.translate('lngfeatured stack'),
                        OpenFromLocation.FromStaticDemo
                    );
                    c.beginLoadDocument(loader);
                    return;
                }
            } else if (pts.length === 2) {
                let loader = new VpcDocLoader(
                    c.lang,
                    root,
                    id,
                    c.lang.translate('lngstack'),
                    OpenFromLocation.FromStackIdOnline
                );
                c.beginLoadDocument(loader);
                return;
            }
        }
    }

    protected parseStackIdFromParams(s: string): O<string> {
        let spl = s.split('?');
        if (spl.length === 2) {
            let splparams = spl[1].split('&');
            for (let splparam of splparams) {
                let pair = splparam.split('=');
                if (pair.length === 2) {
                    if (pair[0] === 's') {
                        return pair[1];
                    }
                }
            }
        }
    }

    static showOpenPage(c: VpcIntroPresenterInterface, root: Root, openType: OpenFromLocation) {
        let [x, y] = [c.activePage.x, c.activePage.y];
        c.activePage.destroy(c, c.app);
        c.activePage = new IntroOpenPage('introOpenPage', c.bounds, x, y, c.root, openType);
        c.activePage.create(c, c.app, c.lang);

        if (openType === OpenFromLocation.FromJsonFile) {
            // user clicked 'open from json'
            let [x1, y1] = [c.activePage.x, c.activePage.y];
            c.activePage.destroy(c, c.app);
            c.activePage = new IntroOpenFromDiskPage('IntroOpenFromDiskPage', c.bounds, x1, y1, c, c.root);
            c.activePage.create(c, c.app, c.lang);
        } else if (openType === OpenFromLocation.ShowLoginForm) {
            if (!root.getSession()) {
                // we have to load the full ui, just to get the dialog to get then to log in
                let loader = new VpcDocLoader(c.lang, root, '', '', OpenFromLocation.ShowLoginForm);
                c.beginLoadDocument(loader);
            } else {
                c.activePage.destroy(c, c.app);
                c.activePage = new IntroOpenPage(
                    'introOpenPage',
                    c.bounds,
                    x,
                    y,
                    c.root,
                    OpenFromLocation.FromStackIdOnline
                );
                c.activePage.create(c, c.app, c.lang);
            }
        }
    }

    static respondBtnClick(c: VpcIntroPresenterInterface, root: Root, self: O<IntroFirstPage>, el: UI512Element) {
        if (el.id.endsWith('choice_newStack')) {
            c.newDocument();
        } else if (el.id.endsWith('choice_showAbout')) {
            VpcAboutDialog.show(root, c, c.getModal());
        } else if (el.id.endsWith('choice_showFeatured')) {
            IntroFirstPage.showOpenPage(c, root, OpenFromLocation.FromStaticDemo);
        } else if (el.id.endsWith('choice_openStack')) {
            c.getModal().standardAnswer(
                root,
                c,
                c.app,
                'From which location would you like to open?',
                n => {
                    if (n === 0) {
                        IntroFirstPage.showOpenPage(c, root, OpenFromLocation.ShowLoginForm);
                    } else if (n === 1) {
                        IntroFirstPage.showOpenPage(c, root, OpenFromLocation.FromJsonFile);
                    }
                },
                'Online',
                'Json file',
                'Cancel'
            );
        }
    }
}
