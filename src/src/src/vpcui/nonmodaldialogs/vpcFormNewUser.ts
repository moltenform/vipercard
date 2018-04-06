
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { NullaryFn, UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512ElementsBase.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementsApp.js';
/* auto */ import { vpcUsersCreate } from '../../vpc/request/vpcRequest.js';
/* auto */ import { IVpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcFormNonModalDialogFormBase } from '../../vpcui/nonmodaldialogs/vpcNonModalCommon.js';

export class VpcFormNonModalDialogNewUser extends VpcFormNonModalDialogFormBase {
    fnCbWhenSignedIn: NullaryFn = () => {};
    showHeader = true;
    captionText = 'lngNew User';
    hasCloseBtn = true;
    compositeType = 'VpcFormNonModalDialogNewUser';
    fields: [string, string, number][] = [
        ['username', 'lngUsername:', 1],
        ['pw', 'lngPassword:', 1],
        ['pwagain', 'lngPassword:\n(again)', 2],
        ['email', 'lngE-mail:', 1],
        [
            'descr_email',
            'lng(This e-mail address and all information\nprovided will not be shared with any\nthird party.)',
            2,
        ],
    ];
    btns: [string, string][] = [['ok', 'lngOK'], ['cancel', 'lngCancel']];
    fieldsThatAreLabels: { [key: string]: boolean } = { descr_email: true };

    constructor(protected appli: IVpcStateInterface, protected formLoginClass: VpcFormNonModalDialogLogInConstructor) {
        super('vpcAppNonModalDialogSendReport' + Math.random());
        VpcFormNonModalDialogFormBase.standardWindowBounds(this, appli);
    }

    createSpecific(app: UI512Application) {
        super.createSpecific(app);
        let grp = app.getGroup(this.grpid);
        let fldPw = grp.getEl(this.getElId('fldpw'));
        fldPw.set('asteriskonly', true);
        let fldPwAgain = grp.getEl(this.getElId('fldpwagain'));
        fldPwAgain.set('asteriskonly', true);
        fldPwAgain.set('h', fldPw.h);

        // nudge things up a few pixels
        for (let id of ['btnok', 'btncancel', 'lblStatusOfForm']) {
            let el = grp.getEl(this.getElId(id));
            el.set('y', el.y - 3);
        }
    }

    onClickBtn(short: string, el: UI512Element, appli: IVpcStateInterface): void {
        if (short === 'btnok') {
            this.setStatus('lngCreating user...');
            this.doCreateUser(appli);
        } else if (short === 'btncancel') {
            this.goBackToLogin();
        }
    }

    doCreateUser(appli: IVpcStateInterface) {
        let paramFields = this.readFields(appli.UI512App());
        if (paramFields['pw'] !== paramFields['pwagain']) {
            this.setStatus('lngPasswords do not match.');
            return;
        }

        UI512BeginAsync(
            () => vpcUsersCreate(paramFields['username'], paramFields['pw'], paramFields['email']),
            (result: Error | string) => {
                if (this.children.length === 0) {
                    // someone hit cancel
                    return;
                } else if (result === 'succeeded') {
                    // create user was successful!
                    // it sent an email to the place, now get recovery code
                    this.goBackToLogin(paramFields['username']);
                } else if (result instanceof Error) {
                    this.setStatus('lng ' + result.toString());
                } else {
                    this.setStatus('lngDid create user, unknown.');
                }
            }
        );
    }

    protected goBackToLogin(autoFillUsername?: string) {
        this.appli.setNonModalDialog(undefined);
        this.children = [];
        let newform = new this.formLoginClass(this.appli, true);
        VpcFormNonModalDialogFormBase.standardWindowBounds(newform as any, this.appli);
        newform.fnCbWhenSignedIn = this.fnCbWhenSignedIn;
        newform.autoFillUsername = autoFillUsername;
        newform.autoShowNeedEmailCode = !!autoFillUsername;
        this.appli.setNonModalDialog(newform as any);
    }
}

export interface VpcFormNonModalDialogLogInConstructor {
    new (appli: IVpcStateInterface, newUserOk: boolean): VpcFormNonModalDialogLogInInterface;
}

export interface VpcFormNonModalDialogLogInInterface {
    fnCbWhenSignedIn: () => void;
    showHeader: boolean;
    captionText: string;
    hasCloseBtn: boolean;
    compositeType: string;
    autoFillUsername: O<string>;
    autoShowNeedEmailCode: boolean;
}
