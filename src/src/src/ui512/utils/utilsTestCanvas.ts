
/* auto */ import { UI512ErrorHandling, assertTrue } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { RenderComplete, Util512, assertEq, sleep } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper, DrawableImage } from '../../ui512/utils/utilsDraw.js';

/**
 * compare an image to a known-good expected image.
 * uses a temporary in-memory canvas to read pixels of the image
 * optionally highlight the different pixels in red.
 */
export function compareCanvas(
    imageExpected: DrawableImage,
    imageGot: CanvasWrapper,
    width: number,
    height: number,
    drawRed: boolean
) {
    let cvExpected = CanvasWrapper.createMemoryCanvas(width, height);
    cvExpected.drawFromImage(imageExpected, 0, 0, width, height, 0, 0, 0, 0, width, height);
    let dataExpected = cvExpected.context.getImageData(0, 0, width, height);
    let dataGot = imageGot.context.getImageData(0, 0, width, height);
    assertEq(dataExpected.data.length, dataGot.data.length, '3w|');
    assertEq(dataExpected.data.length, 4 * width * height, '3v|');
    let countDifferences = drawDifferencesInRed(dataExpected, dataGot, drawRed);
    if (drawRed) {
        imageGot.context.putImageData(dataGot, 0, 0);
    }

    return countDifferences;
}

/**
 * draw different pixels in red.
 */
function drawDifferencesInRed(dataExpected: ImageData, dataGot: ImageData, drawRed: boolean) {
    let countDifferences = 0;
    for (let i = 0; i < dataExpected.data.length; i += 4) {
        let expected = getColorFromCanvasData(dataExpected.data, i);
        let got = getColorFromCanvasData(dataGot.data, i);

        /* for these tests, white and transparent compare equal */
        expected = expected === 't' ? 'w' : expected;
        got = got === 't' ? 'w' : got;
        if (expected !== got) {
            if (drawRed) {
                dataGot.data[i] = 255;
                dataGot.data[i + 1] = 0;
                dataGot.data[i + 2] = 0;
                dataGot.data[i + 3] = 255;
            }

            countDifferences++;
        }
    }

    return countDifferences;
}

export class CanvasTestParams {
    constructor(
        public testName: string,
        public urlImgExpected: string,
        /* we'll run the callback repeatedly until complete flag returns true */
        public draw: (canvas: CanvasWrapper, complete: RenderComplete) => void,
        public width: number,
        public height: number,
        /* is this a unit test, or did user start the test explicitly by clicking on a button? */
        public uiContext: boolean,
        /* used for testing the test infrastructure */
        public expectDifferentPixels = 0
    ) {}

    readonly maxCalls = 500;
}

/**
 * from filesaver.js, lets user download a blob to disk
 */
declare var saveAs: any;

/**
 * run the callback repeatedly until both imExpected loads and imGot's RenderComplete is done.
 */
async function callDrawUntilRenderComplete(p: CanvasTestParams, imExpected: HTMLImageElement) {
    let imGot = CanvasWrapper.createMemoryCanvas(p.width, p.height);
    let finished = false;
    for (let i = 0; i < p.maxCalls; i++) {
        if (imExpected.complete) {
            let complete = new RenderComplete();
            let ret = p.draw(imGot, complete);
            assertTrue(ret === undefined || ret === null, "3u|please don't return anything from fnDraw");
            if (complete.complete) {
                finished = true;
                break;
            }
        }

        imGot.clear();
        await sleep(100);
    }

    if (!finished) {
        alert('timed out waiting for images to load...');
        assertTrue(false, '3t|test failed, timed out');
        throw new Error('test failed, timed out');
    }

    return imGot;
}

/**
 * render image an compare it with expected
 * if different, offer to download an image showing differences in red
 */
type GetDrawParams = () => CanvasTestParams;
async function UI512RenderAndCompareImage(download: boolean, fnGetDrawParams: GetDrawParams) {
    let p = fnGetDrawParams();
    let imExpected = new Image();
    Util512.beginLoadImage(p.urlImgExpected, imExpected, () => {});
    let imGot = await callDrawUntilRenderComplete(p, imExpected);

    if (download) {
        console.log('Image sent to download, test complete.');
        imGot.canvas.toBlob(blob => {
            saveAs(blob, 'test' + p.testName + '.png');
        });
    } else {
        let countDifferences = compareCanvas(imExpected, imGot, p.width, p.height, true);
        if (countDifferences === p.expectDifferentPixels) {
            console.log(`\t\ttest ${p.testName} passed`);
        } else {
            let ratioWrong = countDifferences / (p.width * p.height);
            console.log(`${p.testName} failed, ${countDifferences} pixels ${100 * ratioWrong}% do not match.`);

            console.log('Delta image sent to download, failures marked in red.');
            imGot.canvas.toBlob(blob => {
                saveAs(blob, `failed${p.testName}.png`);
            });

            assertTrue(false, '3r|test failed');
        }
    }
}

/**
 * run UI512RenderAndCompareImage on an array
 */
async function UI512RenderAndCompareImages(
    download: boolean,
    fnGetDrawParams: GetDrawParams | GetDrawParams[],
    callbackWhenComplete?: NullaryFn
): Promise<void> {
    if (fnGetDrawParams instanceof Array) {
        for (let fn of fnGetDrawParams) {
            await UI512RenderAndCompareImage(download, fn);
        }
    } else {
        await UI512RenderAndCompareImage(download, fnGetDrawParams);
    }

    if (callbackWhenComplete) {
        callbackWhenComplete();
    }
}

/**
 * begin the async function
 */
export function testUtilCompareCanvasWithExpected(
    download: boolean,
    fnGetDrawParams: GetDrawParams | GetDrawParams[],
    callbackWhenComplete?: NullaryFn
) {
    UI512BeginAsync(
        () => UI512RenderAndCompareImages(download, fnGetDrawParams, callbackWhenComplete),
        undefined /* callback */,
        true /* alertOnError */
    );
}

/**
 * begin an async function and do not wait on it, ignoring failure
 * intentionally will not start if another async fn is already in progress.
 */
export function UI512BeginAsyncIgnoreFailures<T>(asyncFn: () => Promise<T>) {
    UI512BeginAsync(asyncFn, undefined, false);
}

/**
 * begin an async function and do not wait on it, firing callback when complete
 * intentionally will not start if another async fn is already in progress.
 * callback should check type of incoming argument to see if it is of type Error
 */
export function UI512BeginAsync<T>(
    asyncFn: () => Promise<T>,
    onComplete?: (r: T | Error) => void,
    alertOnError = false
) {
    // tslint:disable-next-line
    UI512BeginAsyncImpl(asyncFn, onComplete, alertOnError);
}

/**
 * begin an async function
 * intentionally will not start if another async fn is already in progress.
 * logs any failures encountered
 */
let g_callVpAsyncFnBusy = false;
async function UI512BeginAsyncImpl<T>(
    asyncFn: () => Promise<T>,
    onComplete?: (r: T | Error) => void,
    alertOnError = false
) {
    let alreadyWaiting = 'Already waiting...';
    try {
        if (g_callVpAsyncFnBusy) {
            let e = new Error('');
            e.toString = () => alreadyWaiting;
            throw e;
        }

        let v = await asyncFn();
        if (onComplete) {
            onComplete(v);
        }
    } catch (e) {
        if (!e.isUi512Error) {
            UI512ErrorHandling.appendErrMsgToLogs(false, 'unhandled in async ' + e);
        }

        if (alertOnError) {
            assertTrue(false, 'unhandled in async ' + e);
        }

        if (onComplete) {
            onComplete(e);
        }
    } finally {
        g_callVpAsyncFnBusy = false;
    }
}

/**
 * function taking no arguments
 */
export type NullaryFn = () => void;

/**
 * browsers can change the colors written, see https://en.wikipedia.org/wiki/Canvas_fingerprinting
 * so use clrThreshold instead of doing a strict comparison
 */
export const clrThreshold = 20;

/**
 * get black, white, or transparent. other colors return rgba tuple.
 */
function getColorFromCanvasData(data: Uint8ClampedArray, i: number) {
    assertTrue(data[i] !== undefined, '3!|point not defined');
    const clrLarge = 256 - clrThreshold;
    if (data[i + 3] < clrThreshold) {
        return 't';
    } else if (data[i] > clrLarge && data[i + 1] > clrLarge && data[i + 2] > clrLarge) {
        return 'w';
    } else if (data[i] < clrThreshold && data[i + 1] < clrThreshold && data[i + 2] < clrThreshold) {
        return 'b';
    } else {
        return `other(${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]})`;
    }
}
