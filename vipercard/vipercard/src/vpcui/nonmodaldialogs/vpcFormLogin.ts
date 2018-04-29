
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { getRoot } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512BeginAsync } from '../../ui512/utils/utilsTestCanvas.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';
/* auto */ import { UI512Element } from '../../ui512/elements/ui512Element.js';
/* auto */ import { UI512Application } from '../../ui512/elements/ui512ElementApp.js';
/* auto */ import { VpcSession, vpcUsersCheckLogin, vpcUsersEnterEmailVerifyCode } from '../../vpc/request/vpcRequest.js';
/* auto */ import { VpcStateInterface } from '../../vpcui/state/vpcInterface.js';
/* auto */ import { VpcNonModalFormLoginInterface, VpcNonModalFormNewUser } from '../../vpcui/nonmodaldialogs/vpcFormNewUser.js';

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
    btns: [string, string][] = [['ok', 'lngOK'], ['close', 'lngClose'], ['newAccount', 'lngNew User']];

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
        UI512BeginAsync(
            () => vpcUsersCheckLogin(paramFields['username'], paramFields['pw']),
            (result: Error | (string | ArrayBuffer)[] | VpcSession) => {
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
                } else if (result instanceof Error) {
                    /* login was not successful, no such user or wrong password */
                    this.setStatus('lngDid not log in, ' + result.toString());
                } else if (result[0] === 'needEmailVerify' && result.length === 3) {
                    /* login needs email verification */
                    this.setStatus('lngPlease enter the verification code sent via e-mail.');
                    let grp = vci.UI512App().getGroup(this.grpId);
                    let fldEmailVerify = grp.getEl(this.getElId('fldcodeEmailVerify'));
                    fldEmailVerify.set('visible', true);
                    let lblEmailVerify = grp.getEl(this.getElId('lblForcodeEmailVerify'));
                    lblEmailVerify.set('visible', true);
                    this.waitingForVerifyCode = result[2] as ArrayBuffer;
                } else {
                    this.setStatus('lngDid not log in, unknown.');
                }
            }
        );
    }

    /**
     * send login requset to server
     */
    doLoginVerifyCode(vci: VpcStateInterface, keybuffer: ArrayBuffer) {
        let paramFields = this.readFields(vci.UI512App());
        UI512BeginAsync(
            () => vpcUsersEnterEmailVerifyCode(paramFields['username'], keybuffer, paramFields['codeEmailVerify']),
            (result: Error | VpcSession) => {
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
                    /* login was not successful -- prob wrong password */
                    this.setStatus('lng ' + result.toString());
                }
            }
        );
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
