
/* auto */ import { O, UI512ErrorHandling, assertTrue, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Root, Util512, assertEq, sleep } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { Tests_BaseClass } from '../../ui512/utils/utilsTest.js';
/* auto */ import { sendSignedRequestJson, sendWebRequestGetJson } from '../../vpc/request/vpcsigned.js';
/* auto */ import { VpcSession, vpcStacksFlagContent, vpcStacksGetData, vpcUsersCheckLogin, vpcUsersCreate, vpcUsersEnterEmailVerifyCode } from '../../vpc/request/vpcrequest.js';

function nexttest(callback: Function) {
    if (callback) {
        callback();
    }
}

async function doBasicTest(callback: Function) {
    for (let method of ['GET', 'POST']) {
        let got:any
        try {
            got = await sendWebRequestGetJson(`/ping_valid${method.toLowerCase()}`, method, {})
        } catch (e) {
            assertTrue(false, "FAIL: got "+e.toString())
        }
        if (!(got && got[`gotSuccess${method.toLowerCase()}`] === 1)) {
            assertTrue(false, "FAIL: json object didn't have property")
        }
    }

    for (let method of ['GET', 'POST']) {
        let got:any
        let cb = async () => {
            got = await sendWebRequestGetJson(`/ping_notvalid${method.toLowerCase()}`, method, {})
        }
        await assertThrowsAsync("", "err details here", cb)
    }

    for (let method of ['GET', 'POST']) {
        let got:any
        let cb = async () => {
            got = await sendWebRequestGetJson(`/pagedoesnotexist${method.toLowerCase()}`, method, {})
        }
        await assertThrowsAsync("", "404", cb)
    }

    nexttest(callback)
}

export class Test_BasicServerTests extends Tests_BaseClass {
    tests = [
        "callback/basicServerTests",
        (root: Root, callback: Function) => {
            doBasicTest(callback)
        },
    ]
}

async function assertThrowsAsync<T>(tagmsg:string,expectederr:string, fn:()=>Promise<T>, ) {
    let msg: O<string>;
    try {
        UI512ErrorHandling.breakOnThrow = false;
        await fn();
    } catch (e) {
        msg = e.message ? e.message : "";
    } finally {
        UI512ErrorHandling.breakOnThrow = true;
    }

    assertTrue(msg !== undefined, `did not throw ${tagmsg}`);
    assertTrue(msg !== undefined && scontains(msg, expectederr), `message "${msg}" did not contain "${expectederr}" ${tagmsg}`);
}

function fakeIp() {
    return `100.100.${Util512.getRandIntInclusiveWeak(1,100)}.${Util512.getRandIntInclusiveWeak(1,100)}`  // don't get throttled
}

function strToArrBuffer(byteString:string){
    var ret = new ArrayBuffer(byteString.length)
    var byteArray = new Uint8Array(ret);
    for(var i=0; i < byteString.length; i++) {
        byteArray[i] = byteString.codePointAt(i) || 0;
    }
    return ret;
}

async function createUserTests(root: Root, callback: Function) {
    let cb = async () => {
        await vpcUsersCreate("testuser4", "a", "testuser4@test.com" )
    }
    await assertThrowsAsync('', 'too short', cb)
    let keyBase64 = "uggs/wtV+0pSNyJ0lN+wNE/B8MdBafUqT/GJNoXu+Vw="
    let keyBinary = strToArrBuffer(atob(keyBase64))
    let normalParams = {
        "nonce": "Lo19d/D/Psw=",
        "now": "1520806647",
        "iterations": "1000000",
        "salt": "+ULRxR5fVv/Ay34/g4iKkQ==",
        "key": keyBase64,
        "username": "test4",
        "email": "test4@test.com",
        "simulateCurrentServerTime":"1520806647",
        "simulateRemoteIp":fakeIp()
    }

    // fails: iterations is wrong
    cb = async () => {
        let params = Util512.shallowClone(normalParams)
        params.simulateRemoteIp = fakeIp()
        params.iterations = '100000' // basically, it's a really old request
        let url = '/vpusers/create'
        let response = await sendSignedRequestJson(url, 'POST', params, keyBinary)
    }
    await assertThrowsAsync('', 'iterations', cb)

    // fails: username too short
    cb = async () => {
        let params = Util512.shallowClone(normalParams)
        params.simulateRemoteIp = fakeIp()
        params.username = 'a'
        let url = '/vpusers/create'
        let response = await sendSignedRequestJson(url, 'POST', params, keyBinary)
    }
    await assertThrowsAsync('', 'username is too short', cb)

    // fails: no email given
    cb = async () => {
        let params = Util512.shallowClone(normalParams)
        params.simulateRemoteIp = fakeIp()
        params.email = ''
        let url = '/vpusers/create'
        let response = await sendSignedRequestJson(url, 'POST', params, keyBinary)
    }
    await assertThrowsAsync('', 'look right', cb)

    // fails: time does not match server time
    cb = async () => {
        let params = Util512.shallowClone(normalParams)
        params.simulateRemoteIp = fakeIp()
        params.simulateCurrentServerTime = '9520806647' // basically, it's a really old request
        let url = '/vpusers/create'
        let response = await sendSignedRequestJson(url, 'POST', params, keyBinary)
    }
    await assertThrowsAsync('', 'incorrect time', cb)

    // fails: wrong hmac signature
    cb = async () => {
        let params = Util512.shallowClone(normalParams)
        params.simulateRemoteIp = fakeIp()
        let url = '/vpusers/create'
        let response = await sendSignedRequestJson(url, 'POST', params, keyBinary,
            'qqqqqqMi0/gOeXChKQ3uyVVvrCZ7xtFAXAHLOjsYhwM=')
    }
    await assertThrowsAsync('is1', 'incorrect signature', cb)

    // fails: same hmac signature but changed nonce
    cb = async () => {
        let params = Util512.shallowClone(normalParams)
        params.simulateRemoteIp = fakeIp()
        params.nonce = "Qo19d/D/Psw="
        let url = '/vpusers/create'
        let response = await sendSignedRequestJson(url, 'POST', params, keyBinary,
            'SVITvMi0/gOeXChKQ3uyVVvrCZ7xtFAXAHLOjsYhwM=')
    }
    await assertThrowsAsync('is2', 'incorrect signature', cb)

    // fails: same hmac signature but changed username
    cb = async () => {
        let params = Util512.shallowClone(normalParams)
        params.simulateRemoteIp = fakeIp()
        params.username = "qest4"
        let url = '/vpusers/create'
        let response = await sendSignedRequestJson(url, 'POST', params, keyBinary,
            'SVITvMi0/gOeXChKQ3uyVVvrCZ7xtFAXAHLOjsYhwM=')
    }
    await assertThrowsAsync('is3', 'incorrect signature', cb)

    // fails: user already exists
    cb = async () => {
        let params =  {
            "nonce": "eehm1pcZOqE=",
            "now": "1520809583",
            "iterations": "1000000",
            "salt": "55Dv1PbFCUxHMfFiB9nMbw==",
            "key": "374jOicDme1yOt97qSprtKgXO9ovfcnlT6eokHpdPtQ=",
            "username": "test1",
            "email": "newtest1@test.com",
            "simulateCurrentServerTime":"1520809583",
            "simulateRemoteIp":fakeIp()
        }
        let url = '/vpusers/create'
        let response = await sendSignedRequestJson(url, 'POST', params, strToArrBuffer(atob("374jOicDme1yOt97qSprtKgXO9ovfcnlT6eokHpdPtQ=")))
    }
    await assertThrowsAsync('is4', 'user already exists', cb)

    // fails: e-mail already exists
    cb = async () => {
        let params =  {
            "nonce": "DsLjR1x4pkk=",
            "now": "1520809677",
            "iterations": "1000000",
            "salt": "e77pdXSH6AJehzvoZRLq5A==",
            "key": "XHtQO/83jM6B2Ji4aFRhZuU9xd5GD6rjD81sb91JZvU=",
            "username": "test1sameemail",
            "email": "test1@test.com",
            "simulateCurrentServerTime":"1520809677",
            "simulateRemoteIp":fakeIp(),
        }
        let url = '/vpusers/create'
        let response = await sendSignedRequestJson(url, 'POST', params, strToArrBuffer(atob("XHtQO/83jM6B2Ji4aFRhZuU9xd5GD6rjD81sb91JZvU=")))
    }
    await assertThrowsAsync('', 'has this email', cb)

    // succeeds. and used later in subsequent tests.
    // 123abcdefg
    let params =  {
        "nonce": "KjbsLnzWxh0=",
        "now": "1520811408",
        "iterations": "1000000",
        "salt": "EiXT5XGZFpsvulvQqSOJXQ==",
        "key": "ekNRKPs1AbVUQLhQAdTe8ECLaFU/Fkzn9zK5b6+YbLk=",
        "username": "test4",
        "email": "test4@test.com",
        "simulateCurrentServerTime":"1520811408",
        "simulateRemoteIp":fakeIp(),
    }
    let url = '/vpusers/create'
    let response = await sendSignedRequestJson(url, 'POST', params, strToArrBuffer(atob("ekNRKPs1AbVUQLhQAdTe8ECLaFU/Fkzn9zK5b6+YbLk=")))
    assertEq(0, response.retcode, "")

    nexttest(callback)
}

async function checkLoginAndEmailVerifyTests(root: Root, callback: Function) {
    // wait for any user accts to become active
    await sleep(8 * 1000)

    // password too short
    let cb = async () => {
        await vpcUsersCheckLogin("test4", "a", fakeIp())
    }
    await assertThrowsAsync('', 'too short', cb)

    // username is too short
    cb = async () => {
        await vpcUsersCheckLogin("a", "abc12345678", fakeIp())
    }
    await assertThrowsAsync('', 'username is too short', cb)

    // user does not exist
    cb = async () => {
        await vpcUsersCheckLogin("notexistingb5v4s4", "abc12345678", fakeIp())
    }
    await assertThrowsAsync('', 'user not found', cb)

    // pending user, wrong password
    cb = async () => {
        await vpcUsersCheckLogin("test4", "wrongpw", fakeIp())
    }
    await assertThrowsAsync('', 'wrong pass', cb)

    // complete user, wrong password
    cb = async () => {
        await vpcUsersCheckLogin("test1", "wrongpw", fakeIp())
    }
    await assertThrowsAsync('', 'wrong pass', cb)

    // pending user, right password, needs to be verified
    let got = await vpcUsersCheckLogin("test4", "123abcdefg", fakeIp())
    assertEq(4, got.length, "")
    assertEq('need_email_verify', got[0], "")
    let verifcode = got[3]

    // send in verify code, not a user
    cb = async () => {
        await vpcUsersEnterEmailVerifyCode('notexistingb5v4s4', got[2], 'wrongcode')
    }
    await assertThrowsAsync('', 'no user found', cb)

    // send in wrong verify code
    cb = async () => {
        await vpcUsersEnterEmailVerifyCode('test4', got[2], 'wrongcode')
    }
    await assertThrowsAsync('', 'incorrect code', cb)

    // try to do actions when still pending
    cb = async () => {
        let sess = new VpcSession('test4', got[2])
        await sess.vpcUsersUpdateEmail('test4_changed@test.com')
    }
    await assertThrowsAsync('', 'not yet verified', cb)

    // send in right verify code
    let gotRightVerify = await vpcUsersEnterEmailVerifyCode('test4', got[2], verifcode)
    assertTrue(gotRightVerify && gotRightVerify instanceof VpcSession, "")
    assertEq(gotRightVerify.username, "test4", "")

    // wait for the user acct to become active
    await sleep(8 * 1000)

    // complete user, wrong password
    cb = async () => {
        await vpcUsersCheckLogin("test4", "wrongpw", fakeIp())
    }
    await assertThrowsAsync('', 'wrong pass', cb)

    // complete user, got right password!
    let gotRightSession = await vpcUsersCheckLogin("test4", "123abcdefg", fakeIp())
    assertTrue(gotRightSession && gotRightVerify instanceof VpcSession, "")
    assertEq(gotRightSession.username, "test4", "")

    // changing should now work with this session.
    await gotRightSession.vpcUsersUpdateEmail('test4_changed@test.com')
    await gotRightSession.vpcUsersUpdateEmail('test4@test.com')

    nexttest(callback)
}


async function createLogEntryTests(root: Root, callback: Function) {
    // cannot vpLogEntriesCreate if not logged in correctly
    let badSession = new VpcSession('test3',
        strToArrBuffer(atob("XXXXXXGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=")))

    let cb = async () => {
        await badSession.vpLogEntriesCreate('usertypeddesc', 'lastclientlogs', 'stackserverguid', fakeIp())
    }
    await assertThrowsAsync('createLogEntryTests not logged in correctly', 'wrong pass', cb)

    let fakeserverguid = Util512.weakUuid()
    let fakelastclientlogs = Util512.weakUuid() + "unicode\u2666chars\u0301"
    let fakeusertypeddesc = "usertypeddesc unicode\u00e9chars\u0065"
    let firstIp = fakeIp()
    let sess = new VpcSession('test3',
        strToArrBuffer(atob("G25GDNGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=")))

    // don't allow an ip address to send too many
    // first should go through
    let faketime = '1000'
    let got = await sess.vpLogEntriesCreate(fakeusertypeddesc + '1', fakelastclientlogs, fakeserverguid, firstIp, faketime)
    assertEq(true, got, "")

    await sleep(8000)

    // second should fail, since it is too soon
    cb = async () => {
        faketime = '1001'
        await sess.vpLogEntriesCreate(fakeusertypeddesc+ '2', fakelastclientlogs, fakeserverguid, firstIp, faketime)
    }
    await assertThrowsAsync('ip address to send too many', 'not create log entry', cb)

    // third should go through, since we have waited long enough
    faketime = '1500'
    got = await sess.vpLogEntriesCreate(fakeusertypeddesc+ '3', fakelastclientlogs, fakeserverguid, firstIp, faketime)
    assertEq(true, got, "")

    nexttest(callback)
}


async function createStacksTests(tst:Test_ServerTests, root: Root, callback: Function) {
    tst.stackId1 = VpcSession.generateStackPartialId()
    tst.stackId2 = VpcSession.generateStackPartialId()
    tst.stackId3 = VpcSession.generateStackPartialId()
    let fakeStackName = 'My stack acc\u00e9nt'
    let fakeStackStruct:any = {
        'anId': Util512.weakUuid(),
        'unicode': "\u2666chars\u0301\u27F0smiling\uD83D\uDE00",
    }
    let fakeStackData = JSON.stringify(fakeStackStruct)
    tst.fakeStackData1 = fakeStackData+'1'
    tst.fakeStackData2 = fakeStackData+'2'
    tst.fakeStackData3 = 'other non-unicode data'

    // cannot vpcStacksCreate if not logged in correctly
    let badSession = new VpcSession('test3',
        strToArrBuffer(atob("XXXXXXGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=")))
    let cb = async () => {
        await badSession.vpcStacksSaveAs(VpcSession.generateStackPartialId(), fakeStackName + '0', fakeStackData + '0')
    }
    await assertThrowsAsync('stacks-not logged in correctly', 'wrong pass', cb)

    // open session for test2
    let sess = new VpcSession('test2',
        strToArrBuffer(atob("E+9n4wx2OU8JJJwdnkrj56dyMzZZ97nXoGZ2B5Vrom4=")))

    // can vpcStacksCreate the first stack
    let gotFirst = await sess.vpcStacksSaveAs(tst.stackId1, fakeStackName + '1', tst.fakeStackData1)
    assertTrue(gotFirst, "")

    // cannot create a stack with dupe name
    cb = async () => {
        await sess.vpcStacksSaveAs(VpcSession.generateStackPartialId(), fakeStackName + '1', fakeStackData)
    }
    await assertThrowsAsync('stacks-dupe name', 'this name already exists', cb)

    // cannot create a stack with dupe id
    cb = async () => {
        await sess.vpcStacksSaveAs(tst.stackId1, fakeStackName + Math.random(), fakeStackData)
    }
    await assertThrowsAsync('stacks-dupe id', 'this id already exists', cb)

    // cannot create a stack with 2 spaces in name
    cb = async () => {
        await sess.vpcStacksSaveAs(VpcSession.generateStackPartialId(), fakeStackName + '  b', fakeStackData)
    }
    await assertThrowsAsync('stacks-spaces', '2 spaces', cb)

    // cannot create a stack with disallowed tab char
    cb = async () => {
        await sess.vpcStacksSaveAs(VpcSession.generateStackPartialId(), fakeStackName + '\tb', fakeStackData)
    }
    await assertThrowsAsync('', 'disallowed character', cb)

    // cannot create a stack with disallowed unicode char
    cb = async () => {
        await sess.vpcStacksSaveAs(VpcSession.generateStackPartialId(), fakeStackName + '\u0301b', fakeStackData)
    }
    await assertThrowsAsync('', 'disallowed character', cb)

    // can vpcStacksSaveAs another stack
    await sleep(2000) // docs say rate of ancestor insertion is limited to ~1 / second
    let gotSecond = await sess.vpcStacksSaveAs(tst.stackId2, fakeStackName + '2', tst.fakeStackData2)
    assertTrue(gotSecond, "")
    assertTrue(tst.stackId1 !== tst.stackId2, "")

    // cannot exceed max # of stacks
    cb = async () => {
        await sess.vpcStacksSaveAs(VpcSession.generateStackPartialId(), fakeStackName + Math.random(), fakeStackData, '1')
    }
    await sleep(2000)
    await assertThrowsAsync('max. #', 'max. #', cb)

    // open session for test3
    sess = new VpcSession('test3',
        strToArrBuffer(atob("G25GDNGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=")))
    let gotThird = await sess.vpcStacksSaveAs(tst.stackId3, fakeStackName + '3', tst.fakeStackData3)
    assertTrue(gotThird, "")
    assertTrue(tst.stackId2 !== tst.stackId3, "")
    nexttest(callback)
}

async function getStacksTests(tst: Test_ServerTests, root: Root, callback: Function) {
    await sleep(4000)

    // cannot open nonexistent stack 1
    let cb = async () => {
        await vpcStacksGetData(VpcSession.getFullStackId("test2", tst.stackId1 + '00'))
    }
    await assertThrowsAsync('', 'stack not found', cb)

    // cannot open nonexistent stack 2
    cb = async () => {
        await vpcStacksGetData(VpcSession.getFullStackId("test2",tst.stackId1.slice(0, -1)))
    }
    await assertThrowsAsync('', 'stack not found', cb)

    // cannot open nonexistent stack 3 (no such user)
    cb = async () => {
        await vpcStacksGetData(VpcSession.getFullStackId("test-no-such-user", tst.stackId1))
    }
    await assertThrowsAsync('', 'stack not found', cb)

    // cannot open nonexistent stack 4 (wrong user)
    cb = async () => {
        await vpcStacksGetData(VpcSession.getFullStackId("test1", tst.stackId1))
    }
    await assertThrowsAsync('', 'stack not found', cb)

    // open stackid1
    let row = await vpcStacksGetData(VpcSession.getFullStackId("test2",tst.stackId1))
    let fakeStackName = 'My stack acc\u00e9nt'
    assertEq('test2', row.ownerusername, '')
    assertEq(fakeStackName + '1', row.stackname, '')
    assertEq(tst.fakeStackData1, row.stackdata, '')
    assertEq(null, row.flagged, '')

    // open stackid2
    row = await vpcStacksGetData(VpcSession.getFullStackId("test2",tst.stackId2))
    assertEq('test2', row.ownerusername, '')
    assertEq(fakeStackName + '2', row.stackname, '')
    assertEq(tst.fakeStackData2, row.stackdata, '')
    assertEq(null, row.flagged, '')

    // open stackid3
    row = await vpcStacksGetData(VpcSession.getFullStackId("test3",tst.stackId3))
    assertEq('test3', row.ownerusername, '')
    assertEq(fakeStackName + '3', row.stackname, '')
    assertEq(tst.fakeStackData3, row.stackdata, '')
    assertEq(null, row.flagged, '')

    // can't list stacks if not logged in
    let badSession = new VpcSession('test3',
        strToArrBuffer(atob("XXXXXXGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=")))
    cb = async () => {
        await badSession.vpcListMyStacks()
    }

    await assertThrowsAsync('', 'wrong pass', cb)

    // can't list stacks that belong to someone else
    let sess = new VpcSession('test2',
        strToArrBuffer(atob("E+9n4wx2OU8JJJwdnkrj56dyMzZZ97nXoGZ2B5Vrom4=")))
    cb = async () => {
        await sess.vpcListMyStacks("test3")
    }
    await assertThrowsAsync('', 'only list stacks you own', cb)

    // list my stacks
    let got = await sess.vpcListMyStacks("test2")
    let expectedfullid1 = VpcSession.getFullStackId('test2', tst.stackId1)
    let expectedfullid2 = VpcSession.getFullStackId('test2', tst.stackId2)
    assertEq(2, got.length, "")
    assertEq(expectedfullid1, got[0].fullstackid, "")
    assertEq(fakeStackName + '1', got[0].stackname, "")
    assertEq(expectedfullid2, got[1].fullstackid, "")
    assertEq(fakeStackName + '2', got[1].stackname, "")

    // open session for test3
    sess = new VpcSession('test3',
        strToArrBuffer(atob("G25GDNGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=")))

    // can't list stacks that belong to someone else
    cb = async () => {
        await sess.vpcListMyStacks("test2")
    }
    await assertThrowsAsync('', 'only list stacks you own', cb)

    // list my stacks
    got = await sess.vpcListMyStacks()
    expectedfullid1 = VpcSession.getFullStackId('test3', tst.stackId3)
    assertEq(1, got.length, "")
    assertEq(expectedfullid1, got[0].fullstackid, "")
    assertEq(fakeStackName + '3', got[0].stackname, "")

    nexttest(callback)
}

async function updateStacksTests(tst: Test_ServerTests, root: Root, callback: Function) {
    // can't update a stack if not logged in
    let fakeStackData = tst.fakeStackData1
    let badSession = new VpcSession('test3',
        strToArrBuffer(atob("XXXXXXGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=")))
    let cb = async () => {
        await badSession.vpcStacksSave(tst.stackId3, fakeStackData+"3changed")
    }
    await assertThrowsAsync('', 'wrong pass', cb)

    // open session for test3
    let sess = new VpcSession('test3',
        strToArrBuffer(atob("G25GDNGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=")))

    // can't update a stack that doesn't belong to me
    cb = async () => {
        await sess.vpcStacksSave(tst.stackId1, fakeStackData+"1changed")
    }
    await assertThrowsAsync('', "not found", cb)

    // can't update a non existing stack
    cb = async () => {
        await sess.vpcStacksSave(tst.stackId3+"00", fakeStackData+"3changed")
    }
    await assertThrowsAsync('', "not found", cb)

    // can't update stack to short
    cb = async () => {
        await sess.vpcStacksSave(tst.stackId3, 'x')
    }
    await assertThrowsAsync('', "short", cb)

    // can't update stack to nothing
    cb = async () => {
        await sess.vpcStacksSave(tst.stackId3, '')
    }
    await assertThrowsAsync('', "short", cb)

    // can't update stack to too long
    let kb150 = Util512.repeat((1024/8) * 150, '12345678').join('')
    cb = async () => {
        await sess.vpcStacksSave(tst.stackId3, kb150)
    }
    await assertThrowsAsync('', "save as .json", cb)

    // update the stack
    await sess.vpcStacksSave(tst.stackId3, fakeStackData+"3changed")

    // see if change worked
    await sleep(4000)
    let row = await vpcStacksGetData(VpcSession.getFullStackId('test3', tst.stackId3))
    assertEq('test3', row.ownerusername, '')
    assertEq('My stack acc\u00e9nt3', row.stackname, '')
    assertEq(fakeStackData + '3changed', row.stackdata, '')

    // data from id2 should be unaffected
    row = await vpcStacksGetData(VpcSession.getFullStackId('test2', tst.stackId2))
    assertEq('test2', row.ownerusername, '')
    assertEq('My stack acc\u00e9nt2', row.stackname, '')
    assertEq(tst.fakeStackData2, row.stackdata, '')

    // update the stack again
    await sess.vpcStacksSave(tst.stackId3, fakeStackData+"3changedmore")

    // see if change worked
    await sleep(4000)
    row = await vpcStacksGetData(VpcSession.getFullStackId('test3', tst.stackId3))
    assertEq('test3', row.ownerusername, '')
    assertEq('My stack acc\u00e9nt3', row.stackname, '')
    assertEq(fakeStackData + '3changedmore', row.stackdata, '')

    // flag content, first time, unique ip
    await vpcStacksFlagContent('test3', tst.stackId3, '', '1.1.1.1')
    await sleep(2000)
    row = await vpcStacksGetData(VpcSession.getFullStackId('test3', tst.stackId3))
    assertEq('|1.1.1.1|', row.flagged, '')

    // flag content, another unique ip
    await vpcStacksFlagContent('test3', tst.stackId3, '', '1.1.1.2')
    await sleep(2000)
    row = await vpcStacksGetData(VpcSession.getFullStackId('test3', tst.stackId3))
    assertEq('|1.1.1.1||1.1.1.2|', row.flagged, '')

    // flag content, first time, redundant
    await vpcStacksFlagContent('test3', tst.stackId3, '', '1.1.1.1')
    await sleep(2000)
    row = await vpcStacksGetData(VpcSession.getFullStackId('test3', tst.stackId3))
    assertEq('|1.1.1.1||1.1.1.2|', row.flagged, '')

    // data from id2 should be unaffected
    row = await vpcStacksGetData(VpcSession.getFullStackId('test2', tst.stackId2))
    assertEq(null, row.flagged, '')

    nexttest(callback)
}

async function clearDataForServerTests(root: Root, callback: Function) {
    let params = {'from_tests':'true'}
    await sendWebRequestGetJson('/config/vpcInsertInitialAccounts', 'POST', params)
    await sendWebRequestGetJson('/config/vpcClearDataForServerTests', 'POST', params)
    nexttest(callback)
}

export class Test_ServerTests extends Tests_BaseClass {
    stackId1 = ''
    stackId2 = ''
    stackId3 = ''
    fakeStackData1 = ''
    fakeStackData2 = ''
    fakeStackData3 = ''
    tests = [
        "callback/clearDataForServerTests",
        (root: Root, callback: Function) => {
            clearDataForServerTests(root, callback)
        },
        "callback/createUserTests",
        (root: Root, callback: Function) => {
            createUserTests(root, callback)
        },
        "callback/checkLoginAndEmailVerifyTests",
        (root: Root, callback: Function) => {
            checkLoginAndEmailVerifyTests(root, callback)
        },
        "callback/createLogEntryTests",
        (root: Root, callback: Function) => {
            createLogEntryTests(root, callback)
        },
        "callback/createStacksTests",
        (root: Root, callback: Function) => {
            createStacksTests(this, root, callback)
        },
        "callback/getStacksTests",
        (root: Root, callback: Function) => {
            getStacksTests(this, root, callback)
        },
        "callback/updateStacksTests",
        (root: Root, callback: Function) => {
            updateStacksTests(this, root, callback)
        },
    ]
}
