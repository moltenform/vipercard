
/* auto */ import { VpcSession, vpcUsersCheckLogin, vpcUsersCheckLoginResponse, vpcUsersEnterEmailVerifyCode } from './../../vpc/request/vpcRequest';
/* auto */ import { VpcStateInterface } from './../state/vpcInterface';
/* auto */ import { VpcNonModalFormLoginInterface, VpcNonModalFormNewUser } from './vpcFormNewUser';
/* auto */ import { RespondToErr, Util512Higher, getRoot } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { FormattedText } from './../../ui512/draw/ui512FormattedText';
/* auto */ import { UI512Application } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { UI512Element } from './../../ui512/elements/ui512Element';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * form for logging in
 */
export class VpcNonModalFormLogin extends VpcNonModalFormLoginInterface {
    fnCbWhenSignedIn = () => {};
    showHeader = true;
    captionText = 'lngLog In';
    hasCloseBtn = true;
    compositeType = 'VpcNonModalFormLogin';
    autoFillUsername: O<string>;
    autoShowNeedEmailCode = false;
    waitingForVerifyCode: O<ArrayBuffer>;
    btns: [string, string][] = [
        ['ok', 'lngOK'],
        ['close', 'lngClose'],
        ['newAccount', 'lngNew User']
    ];

    fields: [string, string, number][] = [
        ['username', 'lngUsername:', 1],
        ['pw', 'lngPassword:', 1],
        ['codeEmailVerify', 'lngE-mail verif-\nication code:', 2]
    ];

    /**
     * construct. the caller is responsible for setting dimensions.
     */
    constructor(protected vci: VpcStateInterface, public newUserOk: boolean) {
        super('vpcFormNonModalDialogLogIn' + Math.random());
    }

    /**
     * start login, and respond to the result
     */
    doLogin(vci: VpcStateInterface) {
        let paramFields = this.readFields(vci.UI512App());

        let fn = async () => {
            let result: vpcUsersCheckLoginResponse | VpcSession;
            try {
                result = await vpcUsersCheckLogin(paramFields['username'], paramFields['pw']);
            } catch (e) {
                /* login was not successful, no such user or wrong password */
                this.setStatus(`Did not log in, ${e}`);
                return;
            }

            if (this.children.length === 0) {
                /* user hit cancel */
                return;
            } else if (result instanceof VpcSession) {
                /* login was successful! */
                getRoot().setSession(result);
                this.setStatus('lngLogged in.');
                this.vci.setNonModalDialog(undefined);
                this.children = [];
                this.fnCbWhenSignedIn();
            } else if (result.status === 'needEmailVerify') {
                /* login needs email verification */
                this.setStatus('lngPlease enter the verification code sent via e-mail.');
                let grp = vci.UI512App().getGroup(this.grpId);
                let fldEmailVerify = grp.getEl(this.getElId('fldcodeEmailVerify'));
                fldEmailVerify.set('visible', true);
                let lblEmailVerify = grp.getEl(this.getElId('lblForcodeEmailVerify'));
                lblEmailVerify.set('visible', true);
                this.waitingForVerifyCode = result.keyBuffer;
            } else {
                this.setStatus('lngDid not log in, unknown.');
            }
        };

        Util512Higher.syncToAsyncTransition(fn, 'doLogin', RespondToErr.Alert);
    }

    /**
     * send login requset to server
     */
    doLoginVerifyCode(vci: VpcStateInterface, keybuffer: ArrayBuffer) {
        let paramFields = this.readFields(vci.UI512App());
        let fn = async () => {
            let result: VpcSession;
            try {
                result = await vpcUsersEnterEmailVerifyCode(paramFields['username'], keybuffer, paramFields['codeEmailVerify']);
            } catch (e) {
                /* login was not successful -- prob wrong password */
                this.setStatus(`${e}`);
                return;
            }

            if (this.children.length === 0) {
                /* user hit cancel */
                return;
            } else if (result instanceof VpcSession) {
                /* login was successful! */
                getRoot().setSession(result);
                this.setStatus('lngLogged in.');
                this.vci.setNonModalDialog(undefined);
                this.children = [];
                this.fnCbWhenSignedIn();
            } else {
                /* got unexpected type back*/
                this.setStatus(`unexpected type ${result}`);
            }
        };

        Util512Higher.syncToAsyncTransition(fn, 'doLoginVerifyCode', RespondToErr.Alert);
    }

    /**
     * when user clicks a button
     */
    onClickBtn(short: string, el: UI512Element, vci: VpcStateInterface): void {
        if (short === 'btnok') {
            if (this.waitingForVerifyCode) {
                this.setStatus('lngInitial account verification...');
                this.doLoginVerifyCode(vci, this.waitingForVerifyCode);
            } else {
                this.setStatus('lngLogging in...');
                this.doLogin(vci);
            }
        } else if (short === 'btnclose') {
            this.vci.setNonModalDialog(undefined);
            this.children = [];
        } else if (short === 'btnnewAccount') {
            this.vci.setNonModalDialog(undefined);
            this.children = [];
            let makeALoginForm = () => new VpcNonModalFormLogin(this.vci, true);
            let newuserform = new VpcNonModalFormNewUser(this.vci, makeALoginForm);
            newuserform.fnCbWhenSignedIn = this.fnCbWhenSignedIn;
            this.vci.setNonModalDialog(newuserform);
        }
    }

    /**
     * initialize layout
     */
    createSpecific(app: UI512Application) {
        super.createSpecific(app);
        let grp = app.getGroup(this.grpId);

        /* following conventions, the password field shows asterisks only */
        let fldPw = grp.getEl(this.getElId('fldpw'));
        fldPw.set('asteriskonly', true);

        /* hide the 'verify email' boxes until they are needed */
        let fldEmailVerify = grp.getEl(this.getElId('fldcodeEmailVerify'));
        fldEmailVerify.set('h', fldPw.h);
        fldEmailVerify.set('visible', false);
        let lblEmailVerify = grp.getEl(this.getElId('lblForcodeEmailVerify'));
        lblEmailVerify.set('visible', false);

        /* this.autoShowNeedEmailCode */
        /* doesn't help since it wouldn't have the right state yet, needs keybuffer. */
        if (this.autoShowNeedEmailCode) {
            this.setStatus('lngAn e-mail has been sent to verify.');
        }

        let btnnewAccount = grp.getEl(this.getElId('btnnewAccount'));
        btnnewAccount.setDimensions(btnnewAccount.x - 10, btnnewAccount.y, btnnewAccount.w + 10, btnnewAccount.h);
        if (this.autoFillUsername) {
            grp.getEl(this.getElId('fldusername')).setFmTxt(FormattedText.newFromUnformatted(this.autoFillUsername));
        }

        /* sometimes it makes more sense not to allow creating new users,
        like when you've hit File->Open */
        if (!this.newUserOk) {
            grp.getEl(this.getElId('btnnewAccount')).set('visible', false);
        }
    }
}
