
/* auto */ import { vpcUsersCreate } from './../../vpc/request/vpcRequest';
/* auto */ import { VpcNonModalFormBase } from './vpcLyrNonModalHolder';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { checkThrow } from './../../vpc/vpcutils/vpcEnums';
/* auto */ import { Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O, bool } from './../../ui512/utils/util512Base';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * form for creating a new user
 */
export class VpcNonModalFormNewUser extends VpcNonModalFormBase {
    fnCbWhenSignedIn = () => {};
    showHeader = true;
    captionText = 'lngNew User';
    hasCloseBtn = true;
    compositeType = 'VpcNonModalFormNewUser';
    btns: [string, string][] = [
        ['ok', 'lngOK'],
        ['cancel', 'lngCancel']
    ];
    fieldsThatAreLabels: { [key: string]: boolean } = { descrEmail: true };
    fields: [string, string, number][] = [
        ['username', 'lngUsername:', 1],
        ['pw', 'lngPassword:', 1],
        ['pwagain', 'lngPassword:\n(again)', 2],
        ['email', 'lngE-mail:', 1],
        [
            'descrEmail',
            longstr(`lng(This e-mail address and all information{{NEWLINE}}
                provided will not be shared with any{{NEWLINE}}third party.)`),
            2
        ]
    ];

    /**
     * construct and set dimensions
     */
    constructor(protected vci: VpcStateInterface, protected makeALoginClass: () => VpcNonModalFormLoginInterface) {
        super('VpcNonModalFormNewUser' + Math.random());
        VpcNonModalFormBase.standardWindowBounds(this, vci);
    }

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        const adjustYPos = -3;
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
            el.set('y', el.y + adjustYPos);
        }
    }

    /**
     * respond to button click
     */
    onClickBtn(short: string, el: UI512Element, vci: VpcStateInterface): void {
        if (short === 'btnok') {
            this.setStatus('lngCreating user...');
            this.doCreateUser(vci);
        } else if (short === 'btncancel') {
            this.goBackToLogin();
        }
    }

    /**
     * user clicked OK
     */
    doCreateUser(vci: VpcStateInterface) {
        let paramFields = this.readFields(vci.UI512App());
        if (paramFields['pw'] !== paramFields['pwagain']) {
            this.setStatus('lngPasswords do not match.');
            return;
        }

        let fn = async () => {
            let result: boolean;
            try {
                result = await vpcUsersCreate(paramFields['username'], paramFields['pw'], paramFields['email']);
            } catch (e) {
                this.setStatus('lng ' + e.toString());
                return;
            }

            if (this.children.length === 0) {
                /* user hit cancel */
                return;
            } else if (result === true) {
                /* create user was successful! */
                /* it sent an email to the place, now get recovery code */
                this.goBackToLogin(paramFields['username']);
            } else {
                this.setStatus('lngDid create user, unknown.');
            }
        };

        Util512Higher.syncToAsyncTransition(fn, 'vpcuserscreate');
    }

    /**
     * return to the 'login' screen and automatically fill in some of the boxes
     */
    protected goBackToLogin(autoFillUsername?: string) {
        this.vci.setNonModalDialog(undefined);
        this.children = [];

        let newForm = this.makeALoginClass();
        checkThrow(newForm instanceof VpcNonModalFormLoginInterface, 'KX|');
        VpcNonModalFormBase.standardWindowBounds(newForm, this.vci);
        newForm.fnCbWhenSignedIn = this.fnCbWhenSignedIn;
        newForm.autoFillUsername = autoFillUsername;
        newForm.autoShowNeedEmailCode = bool(autoFillUsername);
        this.vci.setNonModalDialog(newForm);
    }
}

/* use VpcFormNonModalDialogLogInCtor, even though it looks ugly,
to break the circular reference between login and new user,
they used to both call each other.  */
export abstract class VpcNonModalFormLoginInterface extends VpcNonModalFormBase {
    fnCbWhenSignedIn: () => void;
    showHeader: boolean;
    captionText: string;
    hasCloseBtn: boolean;
    compositeType: string;
    autoFillUsername: O<string>;
    autoShowNeedEmailCode: boolean;
}
