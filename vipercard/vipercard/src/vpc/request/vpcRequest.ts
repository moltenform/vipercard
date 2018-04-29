
/* auto */ import { O, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root, UI512IsSessionInterface, Util512, anyJson, base10, checkThrowEq, getRoot } from '../../ui512/utils/utils512.js';
/* auto */ import { getUnixTimeSeconds, makeNonce, pbkdf2, sendSignedRequestJson, vpcSendRequestForJson } from '../../vpc/request/vpcSigned.js';

/**
 * create a new user account
 * returns true upon success
 */
export async function vpcUsersCreate(username: string, pw: string, email: string): Promise<boolean> {
    if (pw.length <= RequestHelpers.minPwLength) {
        throw new Error('password is too short');
    }

    let [iterations, keyBuffer, keyB64, saltB64] = await pbkdf2(pw);
    let nonce = makeNonce();
    let now = getUnixTimeSeconds().toString();
    let params = {
        nonce: nonce,
        now: now,
        iterations: iterations.toString(),
        salt: saltB64,
        key: keyB64,
        username: username,
        email: email
    };

    let url = '/vpusers/create';
    let response = await sendSignedRequestJson(url, 'POST', params, keyBuffer);
    if (response && response.retcode === 0) {
        return true;
    } else {
        throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
    }
}

/**
 * check login credentials
 * - if incorrect creds, throws exception
 * - if correct creds but email has not been verified, returns a tuple
 * - if correct creds, returns a VpcSession
 */
export async function vpcUsersCheckLogin(
    username: string,
    pw: string,
    fakeIp?: string
): Promise<(string | ArrayBuffer)[] | VpcSession> {
    if (pw.length <= RequestHelpers.minPwLength) {
        throw new Error('password is too short');
    }

    let nonce = makeNonce();
    let now = getUnixTimeSeconds().toString();
    let paramsGetSalt: anyJson = {
        nonce: nonce,
        now: now,
        username: username
    };

    if (fakeIp) {
        paramsGetSalt.simulateRemoteIp = fakeIp;
    }

    let responseGetSalt = await vpcSendRequestForJson('/vpusers/get_public_info', 'POST', paramsGetSalt);
    checkThrowEq(0, responseGetSalt.retcode, '');
    if (!responseGetSalt.user_found) {
        throw Error('user not found');
    }

    let saltB64Input = responseGetSalt.salt;
    let iterationsInput = parseInt(responseGetSalt.iterations, base10);
    let [iterations, keyBuffer, keyB64, saltB64] = await pbkdf2(pw, iterationsInput, saltB64Input);
    nonce = makeNonce();
    now = getUnixTimeSeconds().toString();
    let params: anyJson = {
        nonce: nonce,
        now: now,
        username: username
    };

    if (fakeIp) {
        params.simulateRemoteIp = fakeIp;
    }

    let url = '/vpusers/check_login';
    let response = await sendSignedRequestJson(url, 'POST', params, keyBuffer);
    if (response && response.retcode === 0) {
        if (response.need_email_verify) {
            /* creds are right, but email not yet verified */
            let result = ['needEmailVerify', username, keyBuffer];
            RequestHelpers.loginTestHook(username, response, result);
            return result;
        } else {
            /* creds are right */
            let sess = new VpcSession(username, keyBuffer);
            return sess;
        }
    } else {
        /* creds are not right, or an error occurred */
        throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
    }
}

/**
 * enter the email verification code
 * returns a VpcSession upon success
 */
export async function vpcUsersEnterEmailVerifyCode(
    username: string,
    keyBuffer: ArrayBuffer,
    codeEmailVerify: string
): Promise<VpcSession> {
    let nonce = makeNonce();
    let now = getUnixTimeSeconds().toString();
    let params = {
        nonce: nonce,
        now: now,
        username: username,
        code_email_verify: codeEmailVerify
    };

    let url = '/vpusers/verify_email';
    let response = await sendSignedRequestJson(url, 'POST', params, keyBuffer);
    if (response && response.retcode === 0) {
        let sess = new VpcSession(username, keyBuffer);
        return sess;
    } else {
        throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
    }
}

/**
 * flag inappropriate content
 */
export async function vpcStacksFlagContent(
    stackOwner: string,
    stackId: string,
    currentUsername: string,
    simulateRemoteIp?: string
) {
    let fullId = VpcSession.getFullStackId(stackOwner, stackId);
    let params: anyJson = {
        stackfullid: fullId,
        flagcontentcurrentusername: currentUsername,
        simulateRemoteIp: simulateRemoteIp || ''
    };

    let url = '/vpstacks/flag_content';
    let response = await vpcSendRequestForJson(url, 'POST', params);
    if (response && response.retcode === 0) {
        return true;
    } else {
        throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
    }
}

/**
 * get stack content
 */
export async function vpcStacksGetData(stackFullId: string): Promise<{ [key: string]: string }> {
    let params = {
        stackfullid: stackFullId
    };

    let url = '/vpstacks/get_data';
    let response = await vpcSendRequestForJson(url, 'GET', params);
    if (response && response.retcode === 0) {
        return response;
    } else {
        throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
    }
}

/**
 * holds credentials,
 * currently just kept in memory without being serialized in any type of cookie or storage
 * request methods on this class are signed by hmac, and are protected against tampering and later replay.
 */
export class VpcSession implements UI512IsSessionInterface {
    readonly username: string;
    readonly keyBuffer: ArrayBuffer;
    constructor(username: string, keyBuffer: ArrayBuffer) {
        this.username = username;
        this.keyBuffer = keyBuffer;
    }

    /**
     * get a VpcSession from a Root object
     */
    static fromRoot(): O<VpcSession> {
        let got = getRoot().getSession();
        if (got && got instanceof VpcSession) {
            return got;
        } else {
            return undefined;
        }
    }

    /**
     * stack id to url
     */
    static getUrlForOpeningStack(loc: string, stackOwner: string, stackId: string, stackName: string): string {
        let shorterstackid = stackId;
        if (shorterstackid.startsWith('S')) {
            shorterstackid = shorterstackid.substr(1);
        }

        return loc + '?s=' + Util512.toBase64UrlSafe(stackOwner) + '|' + shorterstackid;
    }

    /**
     * update account email
     */
    async vpcUsersUpdateEmail(newEmail: string): Promise<boolean> {
        let nonce = makeNonce();
        let now = getUnixTimeSeconds().toString();
        let params = {
            nonce: nonce,
            now: now,
            username: this.username,
            new_email: newEmail
        };

        let url = '/vpusers/update_email';
        let response = await sendSignedRequestJson(url, 'POST', params, this.keyBuffer);
        if (response && response.retcode === 0) {
            return true;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    /**
     * user clicked "send error report"
     * returns true upon success
     */
    async vpcLogEntriesCreate(
        logentriesUserTypedDesc: string,
        logentriesLastClientLogs: string,
        logentriesStackServerGuid: string,
        setfakeIp?: string,
        setServerAndClientTime?: string
    ): Promise<boolean> {
        checkThrow(logentriesUserTypedDesc && logentriesUserTypedDesc.length > 1, '');
        checkThrow(logentriesLastClientLogs && logentriesLastClientLogs.length > 1, '');
        checkThrow(logentriesStackServerGuid && logentriesStackServerGuid.length > 1, '');
        let nonce = makeNonce();
        let now = setServerAndClientTime || getUnixTimeSeconds().toString();
        let params: anyJson = {
            nonce: nonce,
            now: now,
            username: this.username,
            logentries_user_typed_desc: logentriesUserTypedDesc,
            logentries_last_client_logs: logentriesLastClientLogs,
            logentries_stackserverguid: logentriesStackServerGuid
        };

        /* test hooks */
        if (setfakeIp) {
            params.simulateRemoteIp = setfakeIp;
        }

        if (setServerAndClientTime) {
            params.simulateCurrentServerTime = setServerAndClientTime;
        }

        let url = '/vplogentries/create';
        let response = await sendSignedRequestJson(url, 'POST', params, this.keyBuffer);
        if (response && response.retcode === 0) {
            return true;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    /**
     * save stack as
     */
    async vpcStacksSaveAs(
        stackNewPartialId: string,
        newName: string,
        newstackdata: string,
        setFakeMaxStacks = ''
    ): Promise<boolean> {
        let nonce = makeNonce();
        let now = getUnixTimeSeconds().toString();
        let params: anyJson = {
            nonce: nonce,
            now: now,
            username: this.username,
            ownerusername: this.username,
            stacknewpartialid: stackNewPartialId,
            stackname: newName,
            stackdata: newstackdata,
            simulatemaxstacks: setFakeMaxStacks
        };

        let url = '/vpstacks/save_as';
        let response = await sendSignedRequestJson(url, 'POST', params, this.keyBuffer);
        if (response && response.retcode === 0) {
            return true;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    /**
     * save stack
     */
    async vpcStacksSave(stackpartialid: string, newstackdata: string): Promise<boolean> {
        let nonce = makeNonce();
        let now = getUnixTimeSeconds().toString();
        let params = {
            nonce: nonce,
            now: now,
            username: this.username,
            ownerusername: this.username,
            stackpartialid: stackpartialid,
            stackdata: newstackdata
        };

        let url = '/vpstacks/save_data';
        let response = await sendSignedRequestJson(url, 'POST', params, this.keyBuffer);
        if (response && response.retcode === 0) {
            return true;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    /**
     * list my stacks
     * returns map of stackid to stack information
     */
    async vpcListMyStacks(testOverrideUsername?: string): Promise<{ [key: string]: string }[]> {
        let nonce = makeNonce();
        let now = getUnixTimeSeconds().toString();
        let ownerusername = testOverrideUsername || this.username;
        let params = {
            nonce: nonce,
            now: now,
            username: this.username,
            ownerusername: ownerusername
        };

        let url = '/vpstacks/my_stacks';
        let response = await sendSignedRequestJson(url, 'POST', params, this.keyBuffer);
        if (response && response.retcode === 0) {
            return response.stacks;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    /**
     * count number of saves to json
     */
    static async vpcStacksCountJsonSaves(stackOwner: string, stackId: string, currentUsername: string) {
        let stackFullId = VpcSession.getFullStackId(stackOwner, stackId);
        let params = {
            stackfullid: stackFullId
        };

        let url = '/vpstacks/count_json_saves';
        let response = await vpcSendRequestForJson(url, 'POST', params);
        if (response && response.retcode === 0) {
            return response;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    /**
     * generate a stack partial id
     * S and then 15 random bytes, then b64encode it
     * roughly as much entropy as guid, but looks shorter in a url
     */
    static generateStackPartialId() {
        return 'S' + Util512.generateUniqueBase64UrlSafe(15, 'S');
    }

    /**
     * get full stack id (username+stackid)
     */
    static getFullStackId(ownerUsername: string, partialStackid: string) {
        checkThrow(partialStackid.startsWith('S'), '');
        partialStackid = partialStackid.substr(1);
        let ownerUsernameEncoded = Util512.toBase64UrlSafe(ownerUsername);
        return ownerUsernameEncoded + '|' + partialStackid;
    }
}

/**
 * request helpers
 */
class RequestHelpers {
    static readonly minPwLength = 3;
    static loginTestHook(username: string, response: any, result: (string | ArrayBuffer)[]) {
        if (username === 'test4') {
            result.push(response.test4_email_verify);
        }
    }
}
