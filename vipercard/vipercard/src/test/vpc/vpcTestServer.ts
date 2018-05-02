
/* auto */ import { assertTrue, makeVpcInternalErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, anyJson, assertEq, cast, sleep } from '../../ui512/utils/utils512.js';
/* auto */ import { UI512TestBase, assertThrowsAsync } from '../../ui512/utils/utilsTest.js';
/* auto */ import { sendSignedRequestJson, vpcSendRequestForJson } from '../../vpc/request/vpcSigned.js';
/* auto */ import { VpcSession, vpcStacksFlagContent, vpcStacksGetData, vpcUsersCheckLogin, vpcUsersCreate, vpcUsersEnterEmailVerifyCode } from '../../vpc/request/vpcRequest.js';

/**
 * tests on server
 */
let mTests: (string | Function)[] = [
    'async/testVpcServerBasic.Ping Valid Endpoint',
    async () => {
        for (let method of ['GET', 'POST']) {
            if (!checkIfTestEnabled('basic')) {
                return;
            }

            let got: anyJson = await vpcSendRequestForJson(`/ping_valid${method.toLowerCase()}`, method, {});

            if (!(got && got[`gotSuccess${method.toLowerCase()}`] === 1)) {
                assertTrue(false, "IZ|FAIL: json object didn't have property");
            }
        }
    },
    'async/testVpcServerBasic.Ping Invalid Endpoint',
    async () => {
        for (let method of ['GET', 'POST']) {
            if (!checkIfTestEnabled('basic')) {
                return;
            }

            let got: anyJson;
            let cb = async () => {
                got = await vpcSendRequestForJson(`/ping_notvalid${method.toLowerCase()}`, method, {});
            };

            await assertThrowsAsync('IY|', 'err details here', cb);
        }
    },
    'async/testVpcServerBasic.Ping 404',
    async () => {
        for (let method of ['GET', 'POST']) {
            if (!checkIfTestEnabled('basic')) {
                return;
            }

            let got: anyJson;
            let cb = async () => {
                got = await vpcSendRequestForJson(`/pagedoesnotexist${method.toLowerCase()}`, method, {});
            };

            await assertThrowsAsync('IX|', '404', cb);
        }
    },
    'async/testVpcServer.clearDataForTests',
    async () => {
        if (!checkIfTestEnabled('clearData')) {
            return;
        }

        let params = { from_tests: 'true' };
        await vpcSendRequestForJson('/config/vpcInsertInitialAccounts', 'POST', params);
        await vpcSendRequestForJson('/config/vpcClearDataForServerTests', 'POST', params);
    },
    'async/testVpcServer.createUser',
    async () => {
        if (!checkIfTestEnabled('createUser')) {
            return;
        }

        let cb = async () => {
            await vpcUsersCreate('testuser4', 'a', 'testuser4@test.com');
        };

        await assertThrowsAsync('IW|', 'too short', cb);
        let keyBase64 = 'uggs/wtV+0pSNyJ0lN+wNE/B8MdBafUqT/GJNoXu+Vw=';
        let keyBinary = strToArrBuffer(atob(keyBase64));
        let normalParams = {
            nonce: 'Lo19d/D/Psw=',
            now: '1520806647',
            iterations: '1000000',
            salt: '+ULRxR5fVv/Ay34/g4iKkQ==',
            key: keyBase64,
            username: 'test4',
            email: 'test4@test.com',
            simulateCurrentServerTime: '1520806647',
            simulateRemoteIp: fakeIp()
        };

        /* fails: iterations is wrong */
        cb = async () => {
            let params = Util512.shallowClone(normalParams);
            params.simulateRemoteIp = fakeIp();
            params.iterations = '100000'; /* basically, it's a really old request */
            let url = '/vpusers/create';
            let response = await sendSignedRequestJson(url, 'POST', params, keyBinary);
        };
        await assertThrowsAsync('IV|', 'iterations', cb);

        /* fails: username too short */
        cb = async () => {
            let params = Util512.shallowClone(normalParams);
            params.simulateRemoteIp = fakeIp();
            params.username = 'a';
            let url = '/vpusers/create';
            let response = await sendSignedRequestJson(url, 'POST', params, keyBinary);
        };
        await assertThrowsAsync('IU|', 'username is too short', cb);

        /* fails: no email given */
        cb = async () => {
            let params = Util512.shallowClone(normalParams);
            params.simulateRemoteIp = fakeIp();
            params.email = '';
            let url = '/vpusers/create';
            let response = await sendSignedRequestJson(url, 'POST', params, keyBinary);
        };
        await assertThrowsAsync('IT|', 'look right', cb);

        /* fails: time does not match server time */
        cb = async () => {
            let params = Util512.shallowClone(normalParams);
            params.simulateRemoteIp = fakeIp();
            params.simulateCurrentServerTime = '9520806647'; /* basically, it's a really old request */
            let url = '/vpusers/create';
            let response = await sendSignedRequestJson(url, 'POST', params, keyBinary);
        };
        await assertThrowsAsync('IS|', 'incorrect time', cb);

        /* fails: wrong hmac signature */
        cb = async () => {
            let params = Util512.shallowClone(normalParams);
            params.simulateRemoteIp = fakeIp();
            let url = '/vpusers/create';
            let response = await sendSignedRequestJson(
                url,
                'POST',
                params,
                keyBinary,
                'qqqqqqMi0/gOeXChKQ3uyVVvrCZ7xtFAXAHLOjsYhwM='
            );
        };
        await assertThrowsAsync('IR|is1', 'incorrect signature', cb);

        /* fails: same hmac signature but changed nonce */
        cb = async () => {
            let params = Util512.shallowClone(normalParams);
            params.simulateRemoteIp = fakeIp();
            params.nonce = 'Qo19d/D/Psw=';
            let url = '/vpusers/create';
            let response = await sendSignedRequestJson(
                url,
                'POST',
                params,
                keyBinary,
                'SVITvMi0/gOeXChKQ3uyVVvrCZ7xtFAXAHLOjsYhwM='
            );
        };
        await assertThrowsAsync('IQ|is2', 'incorrect signature', cb);

        /* fails: same hmac signature but changed username */
        cb = async () => {
            let params = Util512.shallowClone(normalParams);
            params.simulateRemoteIp = fakeIp();
            params.username = 'qest4';
            let url = '/vpusers/create';
            let response = await sendSignedRequestJson(
                url,
                'POST',
                params,
                keyBinary,
                'SVITvMi0/gOeXChKQ3uyVVvrCZ7xtFAXAHLOjsYhwM='
            );
        };
        await assertThrowsAsync('IP|is3', 'incorrect signature', cb);

        /* fails: user already exists */
        cb = async () => {
            let params = {
                nonce: 'eehm1pcZOqE=',
                now: '1520809583',
                iterations: '1000000',
                salt: '55Dv1PbFCUxHMfFiB9nMbw==',
                key: '374jOicDme1yOt97qSprtKgXO9ovfcnlT6eokHpdPtQ=',
                username: 'test1',
                email: 'newtest1@test.com',
                simulateCurrentServerTime: '1520809583',
                simulateRemoteIp: fakeIp()
            };
            let url = '/vpusers/create';
            let response = await sendSignedRequestJson(
                url,
                'POST',
                params,
                strToArrBuffer(atob('374jOicDme1yOt97qSprtKgXO9ovfcnlT6eokHpdPtQ='))
            );
        };
        await assertThrowsAsync('IO|is4', 'user already exists', cb);

        /* fails: e-mail already exists */
        cb = async () => {
            let params = {
                nonce: 'DsLjR1x4pkk=',
                now: '1520809677',
                iterations: '1000000',
                salt: 'e77pdXSH6AJehzvoZRLq5A==',
                key: 'XHtQO/83jM6B2Ji4aFRhZuU9xd5GD6rjD81sb91JZvU=',
                username: 'test1sameemail',
                email: 'test1@test.com',
                simulateCurrentServerTime: '1520809677',
                simulateRemoteIp: fakeIp()
            };
            let url = '/vpusers/create';
            let response = await sendSignedRequestJson(
                url,
                'POST',
                params,
                strToArrBuffer(atob('XHtQO/83jM6B2Ji4aFRhZuU9xd5GD6rjD81sb91JZvU='))
            );
        };
        await assertThrowsAsync('IN|', 'has this email', cb);

        /* succeeds. and used later in subsequent tests. */
        /* 123abcdefg */
        let paramsWorks = {
            nonce: 'KjbsLnzWxh0=',
            now: '1520811408',
            iterations: '1000000',
            salt: 'EiXT5XGZFpsvulvQqSOJXQ==',
            key: 'ekNRKPs1AbVUQLhQAdTe8ECLaFU/Fkzn9zK5b6+YbLk=',
            username: 'test4',
            email: 'test4@test.com',
            simulateCurrentServerTime: '1520811408',
            simulateRemoteIp: fakeIp()
        };
        let urlWorks = '/vpusers/create';
        let responseWorks = await sendSignedRequestJson(
            urlWorks,
            'POST',
            paramsWorks,
            strToArrBuffer(atob('ekNRKPs1AbVUQLhQAdTe8ECLaFU/Fkzn9zK5b6+YbLk='))
        );

        assertEq(0, responseWorks.retcode, 'IM|');
    },
    'async/testVpcServer.checkLoginAndEmailVerifyTests',
    async () => {
        if (!checkIfTestEnabled('checkLoginAndEmail')) {
            return;
        }

        /* wait for any user accts to become active */
        await sleep(8 * 1000);

        /* password too short */
        let cb = async () => {
            await vpcUsersCheckLogin('test4', 'a', fakeIp());
        };
        await assertThrowsAsync('IL|', 'too short', cb);

        /* username is too short */
        cb = async () => {
            await vpcUsersCheckLogin('a', 'abc12345678', fakeIp());
        };
        await assertThrowsAsync('IK|', 'username is too short', cb);

        /* user does not exist */
        cb = async () => {
            await vpcUsersCheckLogin('notexistingb5v4s4', 'abc12345678', fakeIp());
        };
        await assertThrowsAsync('IJ|', 'user not found', cb);

        /* pending user, wrong password */
        cb = async () => {
            await vpcUsersCheckLogin('test4', 'wrongpw', fakeIp());
        };
        await assertThrowsAsync('II|', 'wrong pass', cb);

        /* complete user, wrong password */
        cb = async () => {
            await vpcUsersCheckLogin('test1', 'wrongpw', fakeIp());
        };
        await assertThrowsAsync('IH|', 'wrong pass', cb);

        /* pending user, right password, needs to be verified */
        let gotRaw = await vpcUsersCheckLogin('test4', '123abcdefg', fakeIp());
        let got: (string | ArrayBuffer)[];
        if (gotRaw instanceof VpcSession) {
            assertTrue(false, 'IG|should not have gotten complete session');
            return;
        } else {
            got = gotRaw;
        }

        /* ensure that we got the 'you-need-verification' message */
        assertEq(4, got.length, 'IF|');
        assertEq('needEmailVerify', got[0], 'IE|');
        let verifcode = got[3].toString();
        let key = cast(got[2], ArrayBuffer);

        /* send in verify code, not a user */
        cb = async () => {
            await vpcUsersEnterEmailVerifyCode('notexistingb5v4s4', key, 'wrongcode');
        };
        await assertThrowsAsync('ID|', 'no user found', cb);

        /* send in wrong verify code */
        cb = async () => {
            await vpcUsersEnterEmailVerifyCode('test4', key, 'wrongcode');
        };
        await assertThrowsAsync('IC|', 'incorrect code', cb);

        /* try to do actions when still pending */
        cb = async () => {
            let sess = new VpcSession('test4', key);
            await sess.vpcUsersUpdateEmail('test4_changed@test.com');
        };
        await assertThrowsAsync('IB|', 'not yet verified', cb);

        /* send in right verify code */
        let gotRightVerify = await vpcUsersEnterEmailVerifyCode('test4', key, verifcode);
        assertTrue(gotRightVerify && gotRightVerify instanceof VpcSession, 'IA|');
        assertEq(gotRightVerify.username, 'test4', 'I9|');

        /* wait for the user acct to become active */
        await sleep(8 * 1000);

        /* complete user, wrong password */
        cb = async () => {
            await vpcUsersCheckLogin('test4', 'wrongpw', fakeIp());
        };
        await assertThrowsAsync('I8|', 'wrong pass', cb);

        /* complete user, got right password! */
        let gotRightSessionRaw = await vpcUsersCheckLogin('test4', '123abcdefg', fakeIp());
        let gotRightSession = cast(gotRightSessionRaw, VpcSession);
        assertEq(gotRightSession.username, 'test4', 'I7|');

        /* changing should now work with this session. */
        await gotRightSession.vpcUsersUpdateEmail('test4_changed@test.com');
        await gotRightSession.vpcUsersUpdateEmail('test4@test.com');
    },
    'async/testVpcServer.createLogEntry',
    async () => {
        if (!checkIfTestEnabled('createLogEntry')) {
            return;
        }

        /* cannot vpLogEntriesCreate if not logged in correctly */
        let badSession = new VpcSession('test3', strToArrBuffer(atob('XXXXXXGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=')));

        let cb = async () => {
            await badSession.vpcLogEntriesCreate('usertypeddesc', 'lastclientlogs', 'stackserverguid', fakeIp());
        };
        await assertThrowsAsync('I6|createLogEntryTests not logged in correctly', 'wrong pass', cb);

        let fakeserverguid = Util512.weakUuid();
        let fakelastclientlogs = Util512.weakUuid() + 'unicode\u2666chars\u0301';
        let fakeusertypeddesc = 'usertypeddesc unicode\u00e9chars\u0065';
        let firstIp = fakeIp();
        let sess = new VpcSession('test3', strToArrBuffer(atob('G25GDNGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=')));

        /* don't allow an ip address to send too many */
        /* first should go through */
        let faketime = '1000';
        let got = await sess.vpcLogEntriesCreate(
            fakeusertypeddesc + '1',
            fakelastclientlogs,
            fakeserverguid,
            firstIp,
            faketime
        );
        assertEq(true, got, 'I5|');

        await sleep(8000);

        /* second should fail, since it is too soon */
        cb = async () => {
            faketime = '1001';
            await sess.vpcLogEntriesCreate(
                fakeusertypeddesc + '2',
                fakelastclientlogs,
                fakeserverguid,
                firstIp,
                faketime
            );
        };
        await assertThrowsAsync('I4|ip address to send too many', 'not create log entry', cb);

        /* third should go through, since we have waited long enough */
        faketime = '1500';
        got = await sess.vpcLogEntriesCreate(
            fakeusertypeddesc + '3',
            fakelastclientlogs,
            fakeserverguid,
            firstIp,
            faketime
        );
        assertEq(true, got, 'I3|');
    },
    'async/testVpcServer.reset recorded stack ids',
    async () => {
        TestVpcServer.stackId1 = '';
        TestVpcServer.stackId2 = '';
        TestVpcServer.stackId3 = '';
        TestVpcServer.fakeStackData1 = '';
        TestVpcServer.fakeStackData2 = '';
        TestVpcServer.fakeStackData3 = '';
    },
    'async/testVpcServer.createStacks',
    async () => {
        if (!checkIfTestEnabled('createStacks')) {
            return;
        }

        TestVpcServer.stackId1 = VpcSession.generateStackPartialId();
        TestVpcServer.stackId2 = VpcSession.generateStackPartialId();
        TestVpcServer.stackId3 = VpcSession.generateStackPartialId();
        let fakeStackName = 'My stack acc\u00e9nt';
        let fakeStackStruct: any = {
            anId: Util512.weakUuid(),
            unicode: '\u2666chars\u0301\u27F0smiling\uD83D\uDE00'
        };
        let fakeStackData = JSON.stringify(fakeStackStruct);
        TestVpcServer.fakeStackData1 = fakeStackData + '1';
        TestVpcServer.fakeStackData2 = fakeStackData + '2';
        TestVpcServer.fakeStackData3 = 'other non-unicode data';

        /* cannot vpcStacksCreate if not logged in correctly */
        let badSession = new VpcSession('test3', strToArrBuffer(atob('XXXXXXGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=')));
        let cb = async () => {
            await badSession.vpcStacksSaveAs(
                VpcSession.generateStackPartialId(),
                fakeStackName + '0',
                fakeStackData + '0'
            );
        };
        await assertThrowsAsync('I2|stacks-not logged in correctly', 'wrong pass', cb);

        /* open session for test2 */
        let sess = new VpcSession('test2', strToArrBuffer(atob('E+9n4wx2OU8JJJwdnkrj56dyMzZZ97nXoGZ2B5Vrom4=')));

        /* can vpcStacksCreate the first stack */
        let gotFirst = await sess.vpcStacksSaveAs(
            TestVpcServer.stackId1,
            fakeStackName + '1',
            TestVpcServer.fakeStackData1
        );
        assertTrue(gotFirst, 'I1|');

        /* cannot create a stack with dupe name */
        cb = async () => {
            await sess.vpcStacksSaveAs(VpcSession.generateStackPartialId(), fakeStackName + '1', fakeStackData);
        };
        await assertThrowsAsync('I0|stacks-dupe name', 'this name already exists', cb);

        /* cannot create a stack with dupe id */
        cb = async () => {
            await sess.vpcStacksSaveAs(TestVpcServer.stackId1, fakeStackName + Math.random(), fakeStackData);
        };
        await assertThrowsAsync('H~|stacks-dupe id', 'this id already exists', cb);

        /* cannot create a stack with 2 spaces in name */
        cb = async () => {
            await sess.vpcStacksSaveAs(VpcSession.generateStackPartialId(), fakeStackName + '  b', fakeStackData);
        };
        await assertThrowsAsync('H}|stacks-spaces', '2 spaces', cb);

        /* cannot create a stack with disallowed tab char */
        cb = async () => {
            await sess.vpcStacksSaveAs(VpcSession.generateStackPartialId(), fakeStackName + '\tb', fakeStackData);
        };
        await assertThrowsAsync('H||', 'disallowed character', cb);

        /* cannot create a stack with disallowed unicode char */
        cb = async () => {
            await sess.vpcStacksSaveAs(VpcSession.generateStackPartialId(), fakeStackName + '\u0301b', fakeStackData);
        };
        await assertThrowsAsync('H{|', 'disallowed character', cb);

        /* can vpcStacksSaveAs another stack */
        await sleep(2000); /* docs say rate of ancestor insertion is limited to ~1 / second */
        let gotSecond = await sess.vpcStacksSaveAs(
            TestVpcServer.stackId2,
            fakeStackName + '2',
            TestVpcServer.fakeStackData2
        );
        assertTrue(gotSecond, 'H`|');
        assertTrue(TestVpcServer.stackId1 !== TestVpcServer.stackId2, 'H_|');

        /* cannot exceed max # of stacks */
        cb = async () => {
            await sess.vpcStacksSaveAs(
                VpcSession.generateStackPartialId(),
                fakeStackName + Math.random(),
                fakeStackData,
                '1'
            );
        };
        await sleep(2000);
        await assertThrowsAsync('H^|max. #', 'max. #', cb);

        /* open session for test3 */
        sess = new VpcSession('test3', strToArrBuffer(atob('G25GDNGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=')));
        let gotThird = await sess.vpcStacksSaveAs(
            TestVpcServer.stackId3,
            fakeStackName + '3',
            TestVpcServer.fakeStackData3
        );
        assertTrue(gotThird, 'H]|');
        assertTrue(TestVpcServer.stackId2 !== TestVpcServer.stackId3, 'H[|');
    },
    'async/testVpcServer.getStacks',
    async () => {
        if (!checkIfTestEnabled('getStacks')) {
            return;
        }

        await sleep(4000);

        /* cannot open nonexistent stack 1 */
        let cb = async () => {
            await vpcStacksGetData(VpcSession.getFullStackId('test2', TestVpcServer.stackId1 + '00'));
        };
        await assertThrowsAsync('H@|', 'stack not found', cb);

        /* cannot open nonexistent stack 2 */
        cb = async () => {
            await vpcStacksGetData(VpcSession.getFullStackId('test2', TestVpcServer.stackId1.slice(0, -1)));
        };
        await assertThrowsAsync('H?|', 'stack not found', cb);

        /* cannot open nonexistent stack 3 (no such user) */
        cb = async () => {
            await vpcStacksGetData(VpcSession.getFullStackId('test-no-such-user', TestVpcServer.stackId1));
        };
        await assertThrowsAsync('H>|', 'stack not found', cb);

        /* cannot open nonexistent stack 4 (wrong user) */
        cb = async () => {
            await vpcStacksGetData(VpcSession.getFullStackId('test1', TestVpcServer.stackId1));
        };
        await assertThrowsAsync('H=|', 'stack not found', cb);

        /* open stackid1 */
        let row = await vpcStacksGetData(VpcSession.getFullStackId('test2', TestVpcServer.stackId1));
        let fakeStackName = 'My stack acc\u00e9nt';
        assertEq('test2', row.ownerusername, 'H<|');
        assertEq(fakeStackName + '1', row.stackname, 'H;|');
        assertEq(TestVpcServer.fakeStackData1, row.stackdata, 'H:|');
        assertEq(null, row.flagged, 'H/|');

        /* open stackid2 */
        row = await vpcStacksGetData(VpcSession.getFullStackId('test2', TestVpcServer.stackId2));
        assertEq('test2', row.ownerusername, 'H.|');
        assertEq(fakeStackName + '2', row.stackname, 'H-|');
        assertEq(TestVpcServer.fakeStackData2, row.stackdata, 'H,|');
        assertEq(null, row.flagged, 'H+|');

        /* open stackid3 */
        row = await vpcStacksGetData(VpcSession.getFullStackId('test3', TestVpcServer.stackId3));
        assertEq('test3', row.ownerusername, 'H*|');
        assertEq(fakeStackName + '3', row.stackname, 'H)|');
        assertEq(TestVpcServer.fakeStackData3, row.stackdata, 'H(|');
        assertEq(null, row.flagged, 'H&|');

        /* can't list stacks if not logged in */
        let badSession = new VpcSession('test3', strToArrBuffer(atob('XXXXXXGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=')));
        cb = async () => {
            await badSession.vpcListMyStacks();
        };

        await assertThrowsAsync('H%|', 'wrong pass', cb);

        /* can't list stacks that belong to someone else */
        let sess = new VpcSession('test2', strToArrBuffer(atob('E+9n4wx2OU8JJJwdnkrj56dyMzZZ97nXoGZ2B5Vrom4=')));
        cb = async () => {
            await sess.vpcListMyStacks('test3');
        };
        await assertThrowsAsync('H$|', 'only list stacks you own', cb);

        /* list my stacks */
        let got = await sess.vpcListMyStacks('test2');
        let expectedfullid1 = VpcSession.getFullStackId('test2', TestVpcServer.stackId1);
        let expectedfullid2 = VpcSession.getFullStackId('test2', TestVpcServer.stackId2);
        assertEq(2, got.length, 'H#|');
        assertEq(expectedfullid1, got[0].fullstackid, 'H!|');
        assertEq(fakeStackName + '1', got[0].stackname, 'H |');
        assertEq(expectedfullid2, got[1].fullstackid, 'Hz|');
        assertEq(fakeStackName + '2', got[1].stackname, 'Hy|');

        /* open session for test3 */
        sess = new VpcSession('test3', strToArrBuffer(atob('G25GDNGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=')));

        /* can't list stacks that belong to someone else */
        cb = async () => {
            await sess.vpcListMyStacks('test2');
        };
        await assertThrowsAsync('Hx|', 'only list stacks you own', cb);

        /* list my stacks */
        got = await sess.vpcListMyStacks();
        expectedfullid1 = VpcSession.getFullStackId('test3', TestVpcServer.stackId3);
        assertEq(1, got.length, 'Hw|');
        assertEq(expectedfullid1, got[0].fullstackid, 'Hv|');
        assertEq(fakeStackName + '3', got[0].stackname, 'Hu|');
    },
    'async/testVpcServer.updateStacks',
    async () => {
        if (!checkIfTestEnabled('updateStacks')) {
            return;
        }

        /* can't update a stack if not logged in */
        let fakeStackData = TestVpcServer.fakeStackData1;
        let badSession = new VpcSession('test3', strToArrBuffer(atob('XXXXXXGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=')));
        let cb = async () => {
            await badSession.vpcStacksSave(TestVpcServer.stackId3, fakeStackData + '3changed');
        };
        await assertThrowsAsync('Ht|', 'wrong pass', cb);

        /* open session for test3 */
        let sess = new VpcSession('test3', strToArrBuffer(atob('G25GDNGhJ2vkC01E7u5tBicpKmLfeUqzwsnqusMzqV8=')));

        /* can't update a stack that doesn't belong to me */
        cb = async () => {
            await sess.vpcStacksSave(TestVpcServer.stackId1, fakeStackData + '1changed');
        };
        await assertThrowsAsync('Hs|', 'not found', cb);

        /* can't update a non existing stack */
        cb = async () => {
            await sess.vpcStacksSave(TestVpcServer.stackId3 + '00', fakeStackData + '3changed');
        };
        await assertThrowsAsync('Hr|', 'not found', cb);

        /* can't update stack to short */
        cb = async () => {
            await sess.vpcStacksSave(TestVpcServer.stackId3, 'x');
        };
        await assertThrowsAsync('Hq|', 'short', cb);

        /* can't update stack to nothing */
        cb = async () => {
            await sess.vpcStacksSave(TestVpcServer.stackId3, '');
        };
        await assertThrowsAsync('Hp|', 'short', cb);

        /* can't update stack to too long */
        let kb150 = Util512.repeat(1024 / 8 * 150, '12345678').join('');
        cb = async () => {
            await sess.vpcStacksSave(TestVpcServer.stackId3, kb150);
        };
        await assertThrowsAsync('Ho|', 'save as .json', cb);

        /* update the stack */
        await sess.vpcStacksSave(TestVpcServer.stackId3, fakeStackData + '3changed');

        /* see if change worked */
        await sleep(4000);
        let row = await vpcStacksGetData(VpcSession.getFullStackId('test3', TestVpcServer.stackId3));
        assertEq('test3', row.ownerusername, 'Hn|');
        assertEq('My stack acc\u00e9nt3', row.stackname, 'Hm|');
        assertEq(fakeStackData + '3changed', row.stackdata, 'Hl|');

        /* data from id2 should be unaffected */
        row = await vpcStacksGetData(VpcSession.getFullStackId('test2', TestVpcServer.stackId2));
        assertEq('test2', row.ownerusername, 'Hk|');
        assertEq('My stack acc\u00e9nt2', row.stackname, 'Hj|');
        assertEq(TestVpcServer.fakeStackData2, row.stackdata, 'Hi|');

        /* update the stack again */
        await sess.vpcStacksSave(TestVpcServer.stackId3, fakeStackData + '3changedmore');

        /* see if change worked */
        await sleep(4000);
        row = await vpcStacksGetData(VpcSession.getFullStackId('test3', TestVpcServer.stackId3));
        assertEq('test3', row.ownerusername, 'Hh|');
        assertEq('My stack acc\u00e9nt3', row.stackname, 'Hg|');
        assertEq(fakeStackData + '3changedmore', row.stackdata, 'Hf|');

        /* flag content, first time, unique ip */
        await vpcStacksFlagContent('test3', TestVpcServer.stackId3, '', '1.1.1.1');
        await sleep(2000);
        row = await vpcStacksGetData(VpcSession.getFullStackId('test3', TestVpcServer.stackId3));
        assertEq('|1.1.1.1|', row.flagged, 'He|');

        /* flag content, another unique ip */
        await vpcStacksFlagContent('test3', TestVpcServer.stackId3, '', '1.1.1.2');
        await sleep(2000);
        row = await vpcStacksGetData(VpcSession.getFullStackId('test3', TestVpcServer.stackId3));
        assertEq('|1.1.1.1||1.1.1.2|', row.flagged, 'Hd|');

        /* flag content, first time, redundant */
        await vpcStacksFlagContent('test3', TestVpcServer.stackId3, '', '1.1.1.1');
        await sleep(2000);
        row = await vpcStacksGetData(VpcSession.getFullStackId('test3', TestVpcServer.stackId3));
        assertEq('|1.1.1.1||1.1.1.2|', row.flagged, 'Hc|');

        /* data from id2 should be unaffected */
        row = await vpcStacksGetData(VpcSession.getFullStackId('test2', TestVpcServer.stackId2));
        assertEq(null, row.flagged, 'Hb|');
    }
];

/**
 * the tests here can be selectively enabled and disabled
 */
function checkIfTestEnabled(s: string) {
    let en = enabledTests[s];
    if (en === true) {
        return true;
    } else if (en === false) {
        return false;
    } else {
        throw makeVpcInternalErr(`Ha|no entry in enabledTests for ${s}`);
    }
}

/**
 * the tests here can be selectively enabled and disabled
 */
let enabledTests: { [key: string]: boolean } = {
    basic: false,
    clearData: false,
    createUser: false,
    checkLoginAndEmail: false,
    createLogEntry: false,
    createStacks: false,
    getStacks: false,
    updateStacks: false
};

/**
 * record the stack UUID that is created
 */
export class TestVpcServer extends UI512TestBase {
    static stackId1 = '';
    static stackId2 = '';
    static stackId3 = '';
    static fakeStackData1 = '';
    static fakeStackData2 = '';
    static fakeStackData3 = '';
    tests = mTests;
}

/**
 * make a fake ip
 * use different addresses to avoid throttling logic
 */
function fakeIp() {
    return `100.100.${Util512.getRandIntInclusiveWeak(1, 100)}.${Util512.getRandIntInclusiveWeak(1, 100)}`;
}

/**
 * from a string of bytes to arraybuffer
 */
function strToArrBuffer(byteString: string) {
    let ret = new ArrayBuffer(byteString.length);
    let byteArray = new Uint8Array(ret);
    for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.codePointAt(i) || 0;
    }

    return ret;
}
