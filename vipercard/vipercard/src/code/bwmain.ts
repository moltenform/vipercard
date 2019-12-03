
/* auto */ import { SimpleSensibleTests } from './../test/testTop';
/* auto */ import { sleep } from './../util/benBaseUtilsHigher';
/* auto */ import { checkIsRelease } from './../util/benBaseUtilsAssert';
/* auto */ import { Util512 } from './../util/benBaseUtils';

import type {Bowser} from '../../external/bowser-2.9/bowser';
declare const bowser: typeof Bowser;


function getTestString() {
    let s1 = Util512.repeat(4, 'a').join('_');
    let s2 = Util512.range(1, 5);
    let s3 = checkIsRelease() ? 'release' : 'debug';
    return [s1, s2, s3].join('<br/>');
}

export function setOutputToTestString() {
    let el = document.getElementById('output');
    if (el) {
        el.innerHTML = getTestString();
    }
}

async function onBtnGoAsync() {
    let el = document.getElementById('output');
    if (el) {
        el.innerHTML += '1... ';
        await sleep(1000);
        el.innerHTML += '2... ';
        await sleep(1000);
        el.innerHTML += '3';
    }
}

function doDetectBrowser() {
    let o = bowser.parse(window.navigator.userAgent);
    let s = '';
    s += `<br/>name: ${o.browser.name}`;
    s += `<br/>v: ${o.browser.version}`;
    s += `<br/>platform: ${o.platform.type}`;
    let el = document.getElementById('detectedBrowser');
    if (el) {
        el.innerHTML = s;
    }
}

export function runOnLoad() {
    let elBtn = document.getElementById('idBtnGo');
    if (elBtn) {
        elBtn.addEventListener('click', setOutputToTestString);
    }

    let elBtnGoAsync = document.getElementById('idBtnGoAsync');
    if (elBtnGoAsync) {
        elBtnGoAsync.addEventListener('click', onBtnGoAsync);
    }

    document.body.addEventListener('keydown', evt => {
        if (evt.code === 'KeyT' && evt.altKey) {
            SimpleSensibleTests.runTests(true);
        }
    });

    doDetectBrowser();
}

runOnLoad();
