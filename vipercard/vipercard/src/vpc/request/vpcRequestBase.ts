
/* auto */ import { checkThrow, checkThrowNotifyMsg } from './../vpcutils/vpcEnums';
/* auto */ import { IsUtil512Serializable } from './../../ui512/utils/util512Serialize';
/* auto */ import { UI512IsSessionInterface, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { Util512 } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * a response with an integer return code
 */
export class ResponseWithRetcode extends IsUtil512Serializable {
    retcode = -1;
}

export interface VpcUsersCheckLoginResponseInterface {
    buffer: ArrayBuffer;
    status: string;
}

export abstract class VpcSessionInterface implements UI512IsSessionInterface {
    username: string;
    /**
     * update account email
     */
    abstract vpcUsersUpdateEmail(newEmail: string): Promise<boolean>;

    /**
     * user clicked "send error report"
     * returns true upon success
     */
    abstract vpcLogEntriesCreate(
        logentriesUserTypedDesc: string,
        logentriesLastClientLogs: string,
        logentriesStackServerGuid: string,
        setfakeIp?: string,
        setServerAndClientTime?: string
    ): Promise<boolean>;

    /**
     * save stack as
     */
    abstract vpcStacksSaveAs(
        stackNewPartialId: string,
        newName: string,
        newstackdata: string,
        setFakeMaxStacks?: string
    ): Promise<boolean>;

    /**
     * save stack
     */
    abstract vpcStacksSave(stackpartialid: string, newstackdata: string): Promise<boolean>;

    /**
     * list my stacks
     * returns map of stackid to stack information
     */
    abstract vpcListMyStacks(testOverrideUsername?: string): Promise<ResponseShapes.ListMyStacks[]>;
}

export interface VpcSessionToolsInterface {
    readonly minPwLength: number;
    enableServerCode: boolean;

    /**
     * get a VpcSessionInterface from a Root object
     */
    fromRoot(): O<VpcSessionInterface>;

    /**
     * stack id to url
     */
    getUrlForOpeningStack(loc: string, stackOwner: string, stackId: string, stackName: string): string;

    /**
     * count number of saves to json
     */
    vpcStacksCountJsonSaves(stackOwner: string, stackId: string, currentUsername: string): Promise<ResponseWithRetcode>;

    /**
     * generate a stack partial id
     * S and then 15 random bytes, then b64encode it
     * roughly as much entropy as guid, but looks shorter in a url
     */
    generateStackPartialId(): string;

    /**
     * get full stack id (username+stackid)
     */
    getFullStackId(ownerUsername: string, partialStackid: string): string;

    /**
     * create a new user account
     * returns true upon success
     */
    vpcUsersCreate(username: string, pw: string, email: string): Promise<boolean>;

    /**
     * check login credentials
     * - if incorrect creds, throws exception
     * - if correct creds but email has not been verified, returns a tuple
     * - if correct creds, returns a VpcSessionInterface
     */
    vpcUsersCheckLogin(
        username: string,
        pw: string,
        fakeIp?: string
    ): Promise<VpcUsersCheckLoginResponseInterface | VpcSessionInterface>;

    /**
     * enter the email verification code
     * returns a VpcSessionInterface upon success
     */
    vpcUsersEnterEmailVerifyCode(username: string, keyBuffer: ArrayBuffer, codeEmailVerify: string): Promise<VpcSessionInterface>;

    /**
     * flag inappropriate content
     */
    vpcStacksFlagContent(
        stackOwner: string,
        stackId: string,
        currentUsername: string,
        simulateRemoteIp?: string
    ): Promise<boolean>;

    vpcStacksGetData(stackFullId: string): Promise<any>;
}

/**
 * we'll use these classes to validate data from the server
 */
export namespace ResponseShapes {
    export class CheckLoginFinal extends ResponseWithRetcode {
        optional_need_email_verify = '';
    }

    export class ListMyStacks extends ResponseWithRetcode {
        fullstackid = '';
        stackname = '';
    }

    export class StacksGetData extends ResponseWithRetcode {
        stackname = '';
        stackdata = '';
        ownerusername = '';
        flagged = '';
    }
}

export class VpcSessionToolsEmpty implements VpcSessionToolsInterface {
    readonly minPwLength = 3;
    enableServerCode = false;

    /**
     * generate a stack partial id
     * S and then 15 random bytes, then b64encode it
     * roughly as much entropy as guid, but looks shorter in a url
     */
    generateStackPartialId(): string {
        return 'S' + Util512Higher.generateUniqueBase64UrlSafe(15, 'S');
    }

    /**
     * get full stack id (username+stackid)
     */
    getFullStackId(ownerUsername: string, partialStackid: string): string {
        checkThrow(partialStackid.startsWith('S'), 'Tk|');
        partialStackid = partialStackid.substr(1);
        let ownerUsernameEncoded = Util512.toBase64UrlSafe(ownerUsername);
        return ownerUsernameEncoded + '|' + partialStackid;
    }

    fromRoot(): O<VpcSessionInterface> {
        return undefined;
    }
    getUrlForOpeningStack(loc: string, stackOwner: string, stackId: string, stackName: string): string {
        checkThrowNotifyMsg(false, 'Tj|Server code is not enabled.');
    }
    vpcStacksCountJsonSaves(stackOwner: string, stackId: string, currentUsername: string): Promise<ResponseWithRetcode> {
        checkThrowNotifyMsg(false, 'Ti|Server code is not enabled.');
    }

    vpcUsersCreate(username: string, pw: string, email: string): Promise<boolean> {
        checkThrowNotifyMsg(false, 'Th|Server code is not enabled.');
    }
    vpcUsersCheckLogin(
        username: string,
        pw: string,
        fakeIp?: string
    ): Promise<VpcUsersCheckLoginResponseInterface | VpcSessionInterface> {
        checkThrowNotifyMsg(false, 'Tg|Server code is not enabled.');
    }
    vpcUsersEnterEmailVerifyCode(
        username: string,
        keyBuffer: ArrayBuffer,
        codeEmailVerify: string
    ): Promise<VpcSessionInterface> {
        checkThrowNotifyMsg(false, 'Tf|Server code is not enabled.');
    }
    vpcStacksFlagContent(
        stackOwner: string,
        stackId: string,
        currentUsername: string,
        simulateRemoteIp?: string
    ): Promise<boolean> {
        checkThrowNotifyMsg(false, 'Te|Server code is not enabled.');
    }
    vpcStacksGetData(stackFullId: string): Promise<any> {
        checkThrowNotifyMsg(false, 'Td|Server code is not enabled.');
    }
}

export class VpcSessionEmpty implements VpcSessionInterface {
    username = '';
    vpcUsersUpdateEmail(newEmail: string): Promise<boolean> {
        checkThrowNotifyMsg(false, 'Tc|Server code is not enabled.');
    }
    vpcLogEntriesCreate(
        logentriesUserTypedDesc: string,
        logentriesLastClientLogs: string,
        logentriesStackServerGuid: string,
        setfakeIp?: string,
        setServerAndClientTime?: string
    ): Promise<boolean> {
        checkThrowNotifyMsg(false, 'Tb|Server code is not enabled.');
    }
    vpcStacksSaveAs(
        stackNewPartialId: string,
        newName: string,
        newstackdata: string,
        setFakeMaxStacks?: string
    ): Promise<boolean> {
        checkThrowNotifyMsg(false, 'Ta|Server code is not enabled.');
    }
    vpcStacksSave(stackpartialid: string, newstackdata: string): Promise<boolean> {
        checkThrowNotifyMsg(false, 'TZ|Server code is not enabled.');
    }
    vpcListMyStacks(testOverrideUsername?: string): Promise<ResponseShapes.ListMyStacks[]> {
        checkThrowNotifyMsg(false, 'TY|Server code is not enabled.');
    }
}
