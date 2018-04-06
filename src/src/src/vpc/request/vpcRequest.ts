
/* auto */ import { O, checkThrow } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { IUI512Session, Util512, base10, checkThrowEq, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { getUnixTimeSeconds, makeNonce, pbkdf2, sendSignedRequestJson, sendWebRequestGetJson } from '../../vpc/request/vpcSigned.js';

export async function vpcUsersCreate(username: string, pw: string, email: string): Promise<string> {
    if (pw.length <= 3) {
        throw new Error('password is too short');
    }

    let [iterations, keyBuffer, saltB64, keyB64] = await pbkdf2(pw);
    let nonce = makeNonce();
    let now = getUnixTimeSeconds().toString();
    let params = {
        nonce: nonce,
        now: now,
        iterations: iterations.toString(),
        salt: saltB64,
        key: keyB64,
        username: username,
        email: email,
    };

    let url = '/vpusers/create';
    let response = await sendSignedRequestJson(url, 'POST', params, keyBuffer);
    if (response && response.retcode === 0) {
        return 'succeeded';
    } else {
        throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
    }
}

export async function vpcUsersCheckLogin(username: string, pw: string, fakeIp?: string): Promise<any | VpcSession> {
    if (pw.length <= 3) {
        throw new Error('password is too short');
    }

    let nonce = makeNonce();
    let now = getUnixTimeSeconds().toString();
    let paramsGetSalt: any = {
        nonce: nonce,
        now: now,
        username: username,
    };
    if (fakeIp) {
        paramsGetSalt.simulateRemoteIp = fakeIp;
    }
    let responseGetSalt = await sendWebRequestGetJson('/vpusers/get_public_info', 'POST', paramsGetSalt);
    checkThrowEq(0, responseGetSalt.retcode, '');
    if (!responseGetSalt.user_found) {
        throw Error('user not found');
    }

    let saltB64Input = responseGetSalt.salt;
    let iterationsInput = parseInt(responseGetSalt.iterations, base10);
    let [iterations, keyBuffer, saltB64, keyB64] = await pbkdf2(pw, iterationsInput, saltB64Input);
    nonce = makeNonce();
    now = getUnixTimeSeconds().toString();
    let params: any = {
        nonce: nonce,
        now: now,
        username: username,
    };
    if (fakeIp) {
        params.simulateRemoteIp = fakeIp;
    }

    let url = '/vpusers/check_login';
    let response = await sendSignedRequestJson(url, 'POST', params, keyBuffer);
    if (response && response.retcode === 0) {
        if (response.need_email_verify) {
            let result = ['need_email_verify', username, keyBuffer];
            if (username === 'test4') {
                result.push(response.test4_email_verify);
            }

            return result;
        } else {
            let sess = new VpcSession(username, keyBuffer);
            return sess;
        }
    } else {
        throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
    }
}

export async function vpcUsersEnterEmailVerifyCode(
    username: string,
    keyBuffer: ArrayBuffer,
    code_email_verify: string
): Promise<VpcSession> {
    let nonce = makeNonce();
    let now = getUnixTimeSeconds().toString();
    let params = {
        nonce: nonce,
        now: now,
        username: username,
        code_email_verify: code_email_verify,
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

export async function vpcStacksFlagContent(
    stackowner: string,
    stackid: string,
    currentusername: string,
    simulateRemoteIp?: string
) {
    let fullid = VpcSession.getFullStackId(stackowner, stackid);
    let params: any = {
        stackfullid: fullid,
        FlagContentcurrentusername: currentusername,
        simulateRemoteIp: simulateRemoteIp || '',
    };

    let url = '/vpstacks/flag_content';
    let response = await sendWebRequestGetJson(url, 'POST', params);
    if (response && response.retcode === 0) {
        return true;
    } else {
        throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
    }
}

export async function vpcStacksGetData(stackfullid: string): Promise<{ [key: string]: string }> {
    let params = {
        stackfullid: stackfullid,
    };

    let url = '/vpstacks/get_data';
    let response = await sendWebRequestGetJson(url, 'GET', params);
    if (response && response.retcode === 0) {
        return response;
    } else {
        throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
    }
}

export class VpcSession implements IUI512Session {
    static getUrlForOpeningStack(loc: string, stackowner: string, stackid: string, stackname: string): string {
        let shorterstackid = stackid;
        if (shorterstackid.startsWith('S')) {
            shorterstackid = shorterstackid.substr(1);
        }
        return loc + '?s=' + Util512.toBase64UrlSafe(stackowner) + '|' + shorterstackid;
    }

    readonly username: string;
    readonly keyBuffer: ArrayBuffer;
    constructor(username: string, keyBuffer: ArrayBuffer) {
        this.username = username;
        this.keyBuffer = keyBuffer;
    }

    static fromRoot(): O<VpcSession> {
        let got = getRoot().getSession();
        if (got && got instanceof VpcSession) {
            return got;
        } else {
            return undefined;
        }
    }

    async vpcUsersUpdateEmail(newEmail: string): Promise<boolean> {
        let nonce = makeNonce();
        let now = getUnixTimeSeconds().toString();
        let params = {
            nonce: nonce,
            now: now,
            username: this.username,
            new_email: newEmail,
        };

        let url = '/vpusers/update_email';
        let response = await sendSignedRequestJson(url, 'POST', params, this.keyBuffer);
        if (response && response.retcode === 0) {
            return true;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    async vpLogEntriesCreate(
        logentries_user_typed_desc: string,
        logentries_last_client_logs: string,
        logentries_stackserverguid: string,
        setfakeIp?: string,
        setServerAndClientTime?: string
    ): Promise<boolean> {
        checkThrow(logentries_user_typed_desc && logentries_user_typed_desc.length > 1, '');
        checkThrow(logentries_last_client_logs && logentries_last_client_logs.length > 1, '');
        checkThrow(logentries_stackserverguid && logentries_stackserverguid.length > 1, '');
        let nonce = makeNonce();
        let now = setServerAndClientTime || getUnixTimeSeconds().toString();
        let params: any = {
            nonce: nonce,
            now: now,
            username: this.username,
            logentries_user_typed_desc: logentries_user_typed_desc,
            logentries_last_client_logs: logentries_last_client_logs,
            logentries_stackserverguid: logentries_stackserverguid,
        };
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

    async vpcStacksSaveAs(
        stacknewpartialid: string,
        newname: string,
        newstackdata: string,
        setFakeMaxStacks = ''
    ): Promise<boolean> {
        let nonce = makeNonce();
        let now = getUnixTimeSeconds().toString();
        let params: any = {
            nonce: nonce,
            now: now,
            username: this.username,
            ownerusername: this.username,
            stacknewpartialid: stacknewpartialid,
            stackname: newname,
            stackdata: newstackdata,
            simulatemaxstacks: setFakeMaxStacks,
        };

        let url = '/vpstacks/save_as';
        let response = await sendSignedRequestJson(url, 'POST', params, this.keyBuffer);
        if (response && response.retcode === 0) {
            return true;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    async vpcStacksSave(stackpartialid: string, newstackdata: string): Promise<boolean> {
        let nonce = makeNonce();
        let now = getUnixTimeSeconds().toString();
        let params = {
            nonce: nonce,
            now: now,
            username: this.username,
            ownerusername: this.username,
            stackpartialid: stackpartialid,
            stackdata: newstackdata,
        };

        let url = '/vpstacks/save_data';
        let response = await sendSignedRequestJson(url, 'POST', params, this.keyBuffer);
        if (response && response.retcode === 0) {
            return true;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    async vpcListMyStacks(testOverrideUsername?: string): Promise<{ [key: string]: string }[]> {
        let nonce = makeNonce();
        let now = getUnixTimeSeconds().toString();
        let ownerusername = testOverrideUsername || this.username;
        let params = {
            nonce: nonce,
            now: now,
            username: this.username,
            ownerusername: ownerusername,
        };

        let url = '/vpstacks/my_stacks';
        let response = await sendSignedRequestJson(url, 'POST', params, this.keyBuffer);
        if (response && response.retcode === 0) {
            return response.stacks;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    static async vpcStacksCountJsonSaves(stackowner: string, stackid: string, currentusername: string) {
        let stackfullid = VpcSession.getFullStackId(stackowner, stackid);
        let params = {
            stackfullid: stackfullid,
        };

        let url = '/vpstacks/count_json_saves';
        let response = await sendWebRequestGetJson(url, 'POST', params);
        if (response && response.retcode === 0) {
            return response;
        } else {
            throw new Error(response ? 'response.retcode was not 0:' + response.retcode : 'response was null');
        }
    }

    static generateStackPartialId() {
        // S and then 15 random bytes, then b64encode it
        return 'S' + Util512.generateUniqueBase64UrlSafe(15, 'S');
    }

    static getFullStackId(ownerusername: string, partialStackid: string) {
        checkThrow(partialStackid.startsWith('S'), '');
        partialStackid = partialStackid.substr(1);
        let ownerusernameEncoded = Util512.toBase64UrlSafe(ownerusername);
        return ownerusernameEncoded + '|' + partialStackid;
    }
}
