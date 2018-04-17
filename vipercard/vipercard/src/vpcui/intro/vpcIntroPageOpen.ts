
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { slength } from '../../ui512/utils/utils512.js';
/* auto */ import { RectUtils } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { lng } from '../../ui512/lang/langBase.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512ElLabel } from '../../ui512/elements/ui512ElementLabel.js';
/* auto */ import { UI512BtnStyle } from '../../ui512/elements/ui512ElementButton.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512ElementTextField.js';
/* auto */ import { KeyDownEventDetails } from '../../ui512/menu/ui512Events.js';
/* auto */ import { UI512ElTextFieldAsGeneric } from '../../ui512/textedit/ui512GenericField.js';
/* auto */ import { TextSelModify } from '../../ui512/textedit/ui512TextSelModify.js';
/* auto */ import { UI512PresenterBase } from '../../ui512/presentation/ui512PresenterBase.js';
/* auto */ import { UI512Presenter } from '../../ui512/presentation/ui512Presenter.js';
/* auto */ import { VpcSession } from '../../vpc/request/vpcRequest.js';
/* auto */ import { VpcNonModalFormBase } from '../../vpcui/nonmodaldialogs/vpcLyrNonModalHolder.js';
/* auto */ import { IntroPageBase } from '../../vpcui/intro/vpcIntroPageBase.js';
/* auto */ import { OpenFromLocation, VpcIntroProvider } from '../../vpcui/intro/vpcIntroProvider.js';
/* auto */ import { VpcIntroInterface } from '../../vpcui/intro/vpcIntroInterface.js';

export class IntroPageOpen extends IntroPageBase {
    compositeType = 'IntroPageOpen';
    chooser: O<UI512ElTextField>;
    signInForm: O<VpcNonModalFormBase>;
    newUserForm: O<VpcNonModalFormBase>;
    hardCodedFeatured: [string, string][] = [
        ['demo_graphics.json', 'Interactive art'],
        ['demo_game.json', 'Make a game'],
        ['demo_anim.json', 'Simple animation'],
        ['demo_glider.json', 'GLIDER 4.0'],
        ['demo_spacegame.json', 'Spaceman Gamma']
    ];
    loadedFromOnline: [string, string][] = [];

    constructor(compid: string, bounds: number[], x: number, y: number, protected openType: OpenFromLocation) {
        super(compid, bounds, x, y);
    }

    createSpecific(app: UI512Application) {
        let grp = app.getGroup(this.grpId);
        let headerheight = this.drawCommonFirst(app, grp);

        // draw the OK and cancel buttons
        let wndbg = grp.getEl(this.getElId('wndbg'));
        this.drawBtn(app, grp, 1, this.x + 180, this.y + 287, 68, 21);
        this.drawBtn(app, grp, 0, this.x + 180 - (252 - 174), this.y + 287 - 4, 69, 29);

        // draw the logo
        let half = Math.floor(this.logicalWidth / 2);
        let footerheight = 70;
        let yspace = this.logicalHeight - (footerheight + headerheight);
        let aroundLogo = [this.x + half, this.y + headerheight, half, yspace];
        const logomargin = 20;
        let logobounds = RectUtils.getSubRectRaw(
            aroundLogo[0],
            aroundLogo[1],
            aroundLogo[2],
            aroundLogo[3],
            logomargin,
            logomargin
        );
        logobounds = logobounds ? logobounds : [0, 0, 0, 0];
        let logo = this.genBtn(app, grp, 'logo');
        logo.set('style', UI512BtnStyle.Opaque);
        logo.set('autohighlight', false);
        logo.set('icongroupid', 'logo');
        logo.set('iconnumber', 0);
        logo.setDimensions(logobounds[0], logobounds[1], logobounds[2], logobounds[3]);

        // draw the prompt
        let prompt = this.genChild(app, grp, 'prompt', UI512ElLabel);
        let caption = lng('lngFeatured stacks...');
        prompt.set('labeltext', caption);
        prompt.setDimensions(this.x + 20, this.y + 50, 200, 50);

        // draw the list of choices
        let chooserWidth = 218;
        let chooserX = this.x + Math.floor(half - chooserWidth);
        this.chooser = this.genChild(app, grp, 'chooser', UI512ElTextField);
        this.chooser.set('scrollbar', true);
        this.chooser.set('selectbylines', true);
        this.chooser.set('multiline', true);
        this.chooser.set('canselecttext', true);
        this.chooser.set('canedit', false);
        this.chooser.set('labelwrap', false);
        this.chooser.setDimensions(this.x + 26, this.y + 84, 190, 140);
        grp.getEl(this.getElId('footerText')).set('visible', false);

        // let btnOpenFromAccount = this.drawBtn(app, grp, 3, this.x + 311, this.y + 240, 149, 31);
        // btnOpenFromAccount.set('labeltext', lng("lngMy stacks..."))
        // let btnDelete = this.drawBtn(app, grp, 4, btnOpenFromAccount.x, btnOpenFromAccount.bottom + 10, 149, 31);
        // btnDelete.set('labeltext', lng("lngDelete..."))

        if (this.openType === OpenFromLocation.FromStaticDemo) {
            let sDocs: string[] = [];
            sDocs = this.hardCodedFeatured.map(item => item[1]);
            UI512ElTextField.setListChoices(this.chooser, sDocs);

            if (sDocs.length) {
                TextSelModify.selectLineInField(new UI512ElTextFieldAsGeneric(this.chooser), 0);
            }
        } else {
            prompt.set('labeltext', 'Loading...');
            UI512BeginAsync(() => this.getListChoicesAsync(prompt), undefined, true);
        }

        this.drawCommonLast(app, grp);
    }

    async getListChoicesAsync(prompt: UI512Element) {
        let ses = VpcSession.fromRoot();
        if (!this.chooser) {
            return;
        }
        if (ses) {
            try {
                let stacks = await ses.vpcListMyStacks();
                this.loadedFromOnline = stacks.map(item => [item.fullstackid, item.stackName] as [string, string]);
                UI512ElTextField.setListChoices(this.chooser, this.loadedFromOnline.map(item => item[1]));
                if (this.loadedFromOnline.length) {
                    TextSelModify.selectLineInField(new UI512ElTextFieldAsGeneric(this.chooser), 0);
                }

                prompt.set('labeltext', 'Open from online stacks:');
            } catch (e) {
                prompt.set('labeltext', e.toString());
            }
        }
    }

    static getChosen(self: IntroPageOpen): O<string> {
        if (self.chooser) {
            let whichLine = TextSelModify.selectByLinesWhichLine(new UI512ElTextFieldAsGeneric(self.chooser));
            if (whichLine !== undefined) {
                if (self.openType === OpenFromLocation.FromStaticDemo) {
                    let entry = self.hardCodedFeatured[whichLine];
                    if (entry !== undefined) {
                        return entry[0];
                    }
                } else {
                    let entry = self.loadedFromOnline[whichLine];
                    if (entry !== undefined) {
                        return entry[0];
                    }
                }
            }
        }
    }

    static respondBtnClick(pr: VpcIntroInterface, self: IntroPageOpen, el: UI512Element) {
        if (el.id.endsWith('choicebtn0')) {
            let chosenId = IntroPageOpen.getChosen(self);
            if (chosenId && slength(chosenId)) {
                // open the document
                let loader = new VpcIntroProvider(chosenId, lng('lngstack'), self.openType);
                pr.beginLoadDocument(loader);
            }
        } else if (el.id.endsWith('choicebtn1')) {
            pr.goBackToFirstScreen();
        }
    }

    destroy(pr: UI512PresenterBase, app: UI512Application) {
        if (this.signInForm) {
            this.signInForm.destroy(pr, app);
        }

        super.destroy(pr, app);
    }

    deleteSelected(pr: VpcIntroInterface) {
        let whichData = IntroPageOpen.getChosen(this);
        if (true) {
            pr.getModal().standardAnswer(
                pr,
                pr.app,
                'Item removed',
                n => {
                    pr.goBackToFirstScreen();
                },
                lng('lngOK')
            );
        }
    }

    respondKeyDown(pr: UI512Presenter, d: KeyDownEventDetails) {
        /*
        if (d.readableShortcut === 'Delete' || d.readableShortcut === 'Backspace') {
            c.getModal().standardAnswer(c, c.app, 'Confirm deletion?', (n)=>{
                if (n===0) {
                    this.deleteSelected(c)
                }
            }, lng('lngOK'), lng('lngCancel'))
        }*/
    }
}
