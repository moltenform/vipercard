
/* auto */ import { UI512ErrorHandling, assertTrue, msgInternalErr, msgScriptErr, scontains, ui512InternalErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, Util512, assertEq, sleep } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';

export function compareCanvas(
    knownGoodImage: any,
    canvasGot: CanvasWrapper,
    imwidth: number,
    imheight: number,
    drawRed: boolean
) {
    let hiddenCanvasExpectedDom = document.createElement('canvas');
    hiddenCanvasExpectedDom.width = imwidth;
    hiddenCanvasExpectedDom.height = imheight;
    let hiddenCanvasExpected = new CanvasWrapper(hiddenCanvasExpectedDom);
    hiddenCanvasExpected.drawFromImage(knownGoodImage, 0, 0, imwidth, imheight, 0, 0, 0, 0, imwidth, imheight);
    let dataExpected = hiddenCanvasExpected.context.getImageData(0, 0, imwidth, imheight);
    let dataGot = canvasGot.context.getImageData(0, 0, imwidth, imheight);
    assertEq(dataExpected.data.length, dataGot.data.length, '3w|');
    assertEq(dataExpected.data.length, 4 * imwidth * imheight, '3v|');
    let countDifferences = 0;
    for (let i = 0; i < dataExpected.data.length; i += 4) {
        if (getColorFromCanvasData(dataExpected.data, i) !== getColorFromCanvasData(dataGot.data, i)) {
            if (drawRed) {
                dataGot.data[i] = 255;
                dataGot.data[i + 1] = 0;
                dataGot.data[i + 2] = 0;
                dataGot.data[i + 3] = 255;
            }
            countDifferences++;
        }
    }

    if (drawRed) {
        canvasGot.context.putImageData(dataGot, 0, 0);
    }

    return countDifferences;
}

declare var saveAs: any;
export class CanvasTestParams {
    constructor(
        public testname: string,
        public urlExpectedImg: string,
        public fnDraw: (canvas: CanvasWrapper, complete: RenderComplete) => void,
        public imwidth: number,
        public imheight: number,
        public uicontext: boolean,
        public expectCountDifferentPixels = 0
    ) {}
}

async function testUtilCompareCanvasWithExpectedAsyncOne(dldgot: boolean, fnGetParams: Function): Promise<void> {
    let params = fnGetParams();
    let { testname, urlExpectedImg, imwidth, imheight, fnDraw, dlddelta, uicontext } = params;
    let knownGoodImage = new Image();
    Util512.beginLoadImage(urlExpectedImg, knownGoodImage, () => {});

    let hiddenCanvasDom = document.createElement('canvas');
    hiddenCanvasDom.width = imwidth;
    hiddenCanvasDom.height = imheight;
    let hiddenCanvas = new CanvasWrapper(hiddenCanvasDom);
    let finished = false;
    for (let i = 0; i < 500; i++) {
        if (knownGoodImage.complete) {
            let complete = new RenderComplete();
            let ret = fnDraw(hiddenCanvas, complete);
            assertTrue(ret === undefined || ret === null, "3u|please don't return anything from fnDraw");
            if (complete.complete) {
                finished = true;
                break;
            }
        }

        hiddenCanvas.clear();
        await sleep(100);
    }

    if (!finished) {
        alert('timed out waiting for images to load...');
        assertTrue(false, '3t|test failed, timed out');
        throw new Error('test failed, timed out');
    }

    if (dldgot) {
        hiddenCanvasDom.toBlob(blob => {
            saveAs(blob, 'test' + testname + '.png');
        });
        console.log('Image sent to download, test complete.');
    } else {
        let countDifferences = compareCanvas(knownGoodImage, hiddenCanvas, imwidth, imheight, true);
        if (params.expectCountDifferentPixels !== 0) {
            assertEq(params.expectCountDifferentPixels, countDifferences, '3s|');
        }

        if (countDifferences === params.expectCountDifferentPixels) {
            console.log(`\t\ttest ${testname} passed`);
        } else {
            console.log(
                `test ${testname} failed -- ${countDifferences} pixels ${100 *
                    (countDifferences / (imwidth * imheight))}% do not match.`
            );
            hiddenCanvasDom.toBlob(blob => {
                saveAs(blob, 'failed' + testname + '.png');
            });
            console.log('Delta image sent to download, failures marked in red.');
            if (uicontext) {
                alert(`test ${testname} failed`);
            }
            assertTrue(false, '3r|test failed');
            throw new Error('test failed');
        }
    }
}

async function testUtilCompareCanvasWithExpectedAsync(
    dldgot: boolean,
    fnGetParams: Function | Function[],
    callbackWhenComplete?: Function
): Promise<void> {
    if (fnGetParams instanceof Array) {
        for (let fn of fnGetParams) {
            await testUtilCompareCanvasWithExpectedAsyncOne(dldgot, fn);
        }
    } else {
        await testUtilCompareCanvasWithExpectedAsyncOne(dldgot, fnGetParams);
    }

    if (callbackWhenComplete) {
        callbackWhenComplete();
    }
}

export function testUtilCompareCanvasWithExpected(
    dldgot: boolean,
    fnGetParams: Function | Function[],
    callbackWhenComplete?: Function
) {
    UI512BeginAsync(() => testUtilCompareCanvasWithExpectedAsync(dldgot, fnGetParams, callbackWhenComplete), undefined, true);
}

export function UI512BeginAsyncIgnoreFailures<T>(asyncFn: () => Promise<T>) {
    // tslint:disable-next-line
    asyncFn();
}

export function UI512BeginAsync<T>(asyncFn: () => Promise<T>, onComplete?: (r: T | Error) => void, alertOnError=false) {
    // tslint:disable-next-line
    UI512BeginAsyncImpl(asyncFn, onComplete, alertOnError);
}

let g_callVpAsyncFnBusy = false;
async function UI512BeginAsyncImpl<T>(asyncFn: () => Promise<T>, onComplete?: (r: T | Error) => void, alertOnError=false) {
    let alreadyWaiting = 'Already waiting...';
    try {
        if (g_callVpAsyncFnBusy) {
            let e = new Error('');
            e.toString = () => alreadyWaiting;
            throw e;
        }

        let v = await asyncFn();
        // don't use appli.placeCallbackInQueue. not needed, and won't be able to set g_callVpAsyncFnBusy
        if (onComplete) {
            onComplete(v);
        }
    } catch (e) {
        let eToString = e.toString();
        if (
            eToString !== alreadyWaiting &&
            !scontains(eToString, msgScriptErr) &&
            !scontains(eToString, msgInternalErr) &&
            !scontains(eToString, ui512InternalErr)
        ) {
            UI512ErrorHandling.appendErrMsgToLogs(false, 'unhandled in async ' + eToString);
        }

        if (alertOnError) {
            assertTrue(false, "unhandled in async " + eToString)
        }

        if (onComplete) {
            onComplete(e);
        }
    } finally {
        g_callVpAsyncFnBusy = false;
    }
}

export function UI512BeginAsyncIsBusy() {
    return g_callVpAsyncFnBusy;
}

export function getColorFromCanvasData(data: Uint8ClampedArray, i: number) {
    assertTrue(data[i] !== undefined, '3!|point not defined');
    if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0 && data[i + 3] < 5) {
        return 'white';
    } else if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) {
        return 'white';
    } else if (data[i] < 5 && data[i + 1] < 5 && data[i + 2] < 5 && data[i + 3] > 250) {
        return 'black';
    } else {
        return `other(${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]})`;
    }
}
