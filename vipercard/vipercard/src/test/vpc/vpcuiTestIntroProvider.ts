
/* auto */ import { VpcDocumentLocation } from './../../vpcui/intro/vpcIntroProvider';
/* auto */ import { IntroPageFirst } from './../../vpcui/intro/vpcIntroPageFirst';
/* auto */ import { assertEq, longstr } from './../../ui512/utils/util512';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * tests related to the intro provider, for loading ViperCard documents
 */
let t = new SimpleUtil512TestCollection('testCollectionvpcuiIntroProvider');
export let testCollectionvpcuiIntroProvider = t;

t.test('CheckPageUrlParamsGetProvider.no params', () => {
    let got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2'
    );
    assertEq(undefined, got, 'G8|');
    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/'
    );
    assertEq(undefined, got, 'G7|');
    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/?'
    );
    assertEq(undefined, got, 'G6|');
});
t.test('CheckPageUrlParamsGetProvider.params, but not s', () => {
    let got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2?other=1'
    );
    assertEq(undefined, got, 'G5|');
    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/??'
    );
    assertEq(undefined, got, 'G4|');
    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/?s'
    );
    assertEq(undefined, got, 'G3|');
});
t.test('CheckPageUrlParamsGetProvider.provide demo stack', () => {
    let got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2?s=ZGVtb19nbGlkZXI'
    );
    assertEq(VpcDocumentLocation.FromStaticDemo, got!.loc, 'G2|');
    assertEq('demo_glider.json', got!.identifier, 'G1|');

    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/?s=ZGVtb19zcGFjZWdhbWU'
    );
    assertEq(VpcDocumentLocation.FromStaticDemo, got!.loc, 'G0|');
    assertEq('demo_spacegame.json', got!.identifier, 'F~|');
});
t.test('CheckPageUrlParamsGetProvider.works even if not the only parameter', () => {
    let got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2?abc=1&s=ZGVtb19nbGlkZXI'
    );
    assertEq(VpcDocumentLocation.FromStaticDemo, got!.loc, 'F}|');

    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2?s1=*&s=ZGVtb19nbGlkZXI'
    );
    assertEq(VpcDocumentLocation.FromStaticDemo, got!.loc, 'F||');

    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2?s=ZGVtb19nbGlkZXI&abc=1'
    );
    assertEq(VpcDocumentLocation.FromStaticDemo, got!.loc, 'F{|');
});
t.test('CheckPageUrlParams1', () => {
    t.say(
        longstr(`testCheckPageUrlParamsGetProvider.provide
        base64, but not a valid demo stack`)
    );
    /* starts with dem_ instead of demo_ */
    let got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2?s=ZGVtX2dsaWRlcg'
    );
    assertEq(undefined, got, 'F`|');
    /* is demo_*, containing invalid character * */
    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2?s=ZGVtb18q'
    );
    assertEq(undefined, got, 'F_|');
    /* is demo_a/a, containing invalid character a */
    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/?s=ZGVtb19hL2E'
    );
    assertEq(undefined, got, 'F^|');
    /* is demo_a.a, containing invalid character . */
    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/?s=ZGVtb19hLmE'
    );
    assertEq(undefined, got, 'F]|');
});
t.test('CheckPageUrlParamsGetProvider.provide reference to stack', () => {
    let got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2?s=abc|def'
    );
    assertEq(VpcDocumentLocation.FromStackIdOnline, got!.loc, 'F[|');
    assertEq('abc|def', got!.identifier, 'F@|');

    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/?s=ZXJpY28|U3ZcVJvvxadd8_iQplmeYB'
    );
    assertEq(VpcDocumentLocation.FromStackIdOnline, got!.loc, 'F?|');
    assertEq('ZXJpY28|U3ZcVJvvxadd8_iQplmeYB', got!.identifier, 'F>|');
});
t.test('CheckPageUrlParamsGetProvider.too many |', () => {
    let got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2?s=a|b|c'
    );
    assertEq(undefined, got, 'F=|');
    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2?s=a|b|c|d'
    );
    assertEq(undefined, got, 'F<|');
});
t.test('CheckPageUrlParamsGetProvider.| is escaped by percent', () => {
    let got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/?s=ZXJpY28%7cU3ZcVJvvxadd8_iQplmeYB'
    );
    assertEq(VpcDocumentLocation.FromStackIdOnline, got!.loc, 'F;|');
    assertEq('ZXJpY28|U3ZcVJvvxadd8_iQplmeYB', got!.identifier, 'F:|');

    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/?s=ZXJpY28%7CU3ZcVJvvxadd8_iQplmeYB'
    );
    assertEq(VpcDocumentLocation.FromStackIdOnline, got!.loc, 'F/|');
    assertEq('ZXJpY28|U3ZcVJvvxadd8_iQplmeYB', got!.identifier, 'F.|');

    got = IntroPageFirst.checkPageUrlParamsGetProvider(
        'https://www.productname.com/0.2/?s=currentlyjustleave|a%77%xx'
    );
    assertEq(VpcDocumentLocation.FromStackIdOnline, got!.loc, 'F-|');
    assertEq('currentlyjustleave|a%77%xx', got!.identifier, 'F,|');
});
