
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { IntroPageFirst } from '../../vpcui/intro/vpcIntroPageFirst.js';
import { assertEq } from '../../ui512/utils/utils512.js';
import { throwIfUndefined } from '../../ui512/utils/utilsAssert.js';
import { VpcDocumentLocation } from '../../vpcui/intro/vpcIntroProvider.js';

/**
 * tests related to the intro provider, for loading ViperCard documents
 */
let mTests: (string | Function)[] = [
    'testCheckPageUrlParamsGetProvider.no params',
    () => {
        let got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2');
        assertEq(undefined, got, '');
        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2/');
        assertEq(undefined, got, '');
        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2/?');
        assertEq(undefined, got, '');
    },
    'testCheckPageUrlParamsGetProvider.params, but not s',
    () => {
        let got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2?other=1');
        assertEq(undefined, got, '');
        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2/??');
        assertEq(undefined, got, '');
        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2/?s');
        assertEq(undefined, got, '');
    },
    'testCheckPageUrlParamsGetProvider.provide demo stack',
    () => {
        let got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2?s=ZGVtb19nbGlkZXI');
        assertEq(VpcDocumentLocation.FromStaticDemo, got!.loc, '');
        assertEq('demo_glider.json', got!.identifier, '');

        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2/?s=ZGVtb19zcGFjZWdhbWU');
        assertEq(VpcDocumentLocation.FromStaticDemo, got!.loc, '');
        assertEq('demo_spacegame.json', got!.identifier, '');
    },
    'testCheckPageUrlParamsGetProvider.works even if not the only parameter',
    () => {
        let got = IntroPageFirst.checkPageUrlParamsGetProvider(
            'https://www.productname.com/0.2?abc=1&s=ZGVtb19nbGlkZXI'
        );
        assertEq(VpcDocumentLocation.FromStaticDemo, got!.loc, '');

        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2?s1=*&s=ZGVtb19nbGlkZXI');
        assertEq(VpcDocumentLocation.FromStaticDemo, got!.loc, '');

        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2?s=ZGVtb19nbGlkZXI&abc=1');
        assertEq(VpcDocumentLocation.FromStaticDemo, got!.loc, '');
    },
    'testCheckPageUrlParamsGetProvider.provide base64, but not a valid demo stack',
    () => {
        /* starts with dem_ instead of demo_ */
        let got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2?s=ZGVtX2dsaWRlcg');
        assertEq(undefined, got, '');
        /* is demo_*, containing invalid character * */
        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2?s=ZGVtb18q');
        assertEq(undefined, got, '');
        /* is demo_a/a, containing invalid character a */
        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2/?s=ZGVtb19hL2E');
        assertEq(undefined, got, '');
        /* is demo_a.a, containing invalid character . */
        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2/?s=ZGVtb19hLmE');
        assertEq(undefined, got, '');
    },
    'testCheckPageUrlParamsGetProvider.provide reference to stack',
    () => {
        let got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2?s=abc|def');
        assertEq(VpcDocumentLocation.FromStackIdOnline, got!.loc, '');
        assertEq('abc|def', got!.identifier, '');

        got = IntroPageFirst.checkPageUrlParamsGetProvider(
            'https://www.productname.com/0.2/?s=ZXJpY28|U3ZcVJvvxadd8_iQplmeYB'
        );
        assertEq(VpcDocumentLocation.FromStackIdOnline, got!.loc, '');
        assertEq('ZXJpY28|U3ZcVJvvxadd8_iQplmeYB', got!.identifier, '');
    },
    'testCheckPageUrlParamsGetProvider.too many |',
    () => {
        let got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2?s=a|b|c');
        assertEq(undefined, got, '');
        got = IntroPageFirst.checkPageUrlParamsGetProvider('https://www.productname.com/0.2?s=a|b|c|d');
        assertEq(undefined, got, '');
    },
    'testCheckPageUrlParamsGetProvider.| is escaped by percent',
    () => {
        let got = IntroPageFirst.checkPageUrlParamsGetProvider(
            'https://www.productname.com/0.2/?s=ZXJpY28%7cU3ZcVJvvxadd8_iQplmeYB'
        );
        assertEq(VpcDocumentLocation.FromStackIdOnline, got!.loc, '');
        assertEq('ZXJpY28|U3ZcVJvvxadd8_iQplmeYB', got!.identifier, '');

        got = IntroPageFirst.checkPageUrlParamsGetProvider(
            'https://www.productname.com/0.2/?s=ZXJpY28%7CU3ZcVJvvxadd8_iQplmeYB'
        );
        assertEq(VpcDocumentLocation.FromStackIdOnline, got!.loc, '');
        assertEq('ZXJpY28|U3ZcVJvvxadd8_iQplmeYB', got!.identifier, '');

        got = IntroPageFirst.checkPageUrlParamsGetProvider(
            'https://www.productname.com/0.2/?s=currentlyjustleave|a%77%xx'
        );
        assertEq(VpcDocumentLocation.FromStackIdOnline, got!.loc, '');
        assertEq('currentlyjustleave|a%77%xx', got!.identifier, '');
    }
];

/**
 * exported test class for mTests
 */
export class TestVpcIntroProvider extends UI512TestBase {
    tests = mTests;
}
