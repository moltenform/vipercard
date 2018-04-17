
/* auto */ import { O, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { cast } from '../../ui512/utils/utils512.js';
/* auto */ import { NullaryFn, UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { UI512CompBase } from '../../ui512/composites/ui512Composites.js';
/* auto */ import { vpcUsersCreate } from '../../vpc/request/vpcRequest.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcFormNonModalDialogFormBase } from '../../vpcui/nonmodaldialogs/vpcLyrNonModalHolder.js';

export class VpcNonModalFormNewUser extends VpcFormNonModalDialogFormBase {
    fnCbWhenSignedIn: NullaryFn = () => {};
    showHeader = true;
    captionText = 'lngNew User';
    hasCloseBtn = true;
    compositeType = 'VpcNonModalFormNewUser';
    fields: [string, string, number][] = [
        ['username', 'lngUsername:', 1],
        ['pw', 'lngPassword:', 1],
        ['pwagain', 'lngPassword:\n(again)', 2],
        ['email', 'lngE-mail:', 1],
        [
            'descr_email',
            'lng(This e-mail address and all information\nprovided will not be shared with any\nthird party.)',
            2
        ]
    ];
    btns: [string, string][] = [['ok', 'lngOK'], ['cancel', 'lngCancel']];
    fieldsThatAreLabels: { [key: string]: boolean } = { descr_email: true };

    constructor(protected vci: VpcStateInterface, protected formLoginClass: VpcFormNonModalDialogLogInConstructor) {
        super('VpcNonModalFormNewUser' + Math.random());
        VpcFormNonModalDialogFormBase.standardWindowBounds(this, vci);
    }

    createSpecific(app: UI512Application) {
        super.createSpecific(app);
        let grp = app.getGroup(this.grpId);
        let fldPw = grp.getEl(this.getElId('fldpw'));
        fldPw.set('asteriskonly', true);
        let fldPwAgain = grp.getEl(this.getElId('fldpwagain'));
        fldPwAgain.set('asteriskonly', true);
        fldPwAgain.set('h', fldPw.h);

        /* nudge things up a few pixels */
        for (let id of ['btnok', 'btncancel', 'lblStatusOfForm']) {
            let el = grp.getEl(this.getElId(id));
            el.set('y', el.y - 3);
        }
    }

    onClickBtn(short: string, el: UI512Element, vci: VpcStateInterface): void {
        if (short === 'btnok') {
            this.setStatus('lngCreating user...');
            this.doCreateUser(vci);
        } else if (short === 'btncancel') {
            this.goBackToLogin();
        }
    }

    doCreateUser(vci: VpcStateInterface) {
        let paramFields = this.readFields(vci.UI512App());
        if (paramFields['pw'] !== paramFields['pwagain']) {
            this.setStatus('lngPasswords do not match.');
            return;
        }

        UI512BeginAsync(
            () => vpcUsersCreate(paramFields['username'], paramFields['pw'], paramFields['email']),
            (result: Error | boolean) => {
                if (this.children.length === 0) {
                    /* someone hit cancel */
                    return;
                } else if (result === true) {
                    /* create user was successful! */
                    /* it sent an email to the place, now get recovery code */
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
        this.vci.setNonModalDialog(undefined);
        this.children = [];
        let newForm = new this.formLoginClass(this.vci, true);
        let formAsComp = (newForm as any) as UI512CompBase; /* cast verified */
        checkThrow(formAsComp && formAsComp.isUI512CompBase, '');

        VpcFormNonModalDialogFormBase.standardWindowBounds(formAsComp, this.vci);
        newForm.fnCbWhenSignedIn = this.fnCbWhenSignedIn;
        newForm.autoFillUsername = autoFillUsername;
        newForm.autoShowNeedEmailCode = !!autoFillUsername;
        this.vci.setNonModalDialog(formAsComp);
    }
}

export interface VpcFormNonModalDialogLogInConstructor {
    new (vci: VpcStateInterface, newUserOk: boolean): VpcNonModalFormLoginInterface;
}

export interface VpcNonModalFormLoginInterface {
    fnCbWhenSignedIn: () => void;
    showHeader: boolean;
    captionText: string;
    hasCloseBtn: boolean;
    compositeType: string;
    autoFillUsername: O<string>;
    autoShowNeedEmailCode: boolean;
}
