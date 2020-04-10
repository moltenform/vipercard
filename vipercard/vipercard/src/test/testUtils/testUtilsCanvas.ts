
/* auto */ import { CanvasWrapper, DrawableImage } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { RenderComplete, Util512Higher } from './../../ui512/utils/util512Higher';
/* auto */ import { assertTrue } from './../../ui512/utils/util512Assert';
/* auto */ import { assertEq } from './../../ui512/utils/util512';
/* auto */ import { clrThreshold } from './../../ui512/draw/ui512DrawPainter';
/* auto */ import { bridgedSaveAs } from './../../bridge/bridgeFileSaver';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

export class TestUtilsCanvas {
    /**
     * compare an image to a known-good expected image.
     * uses a temporary in-memory canvas to read pixels of the image
     * optionally highlight the different pixels in red.
     */
    static compareCanvas(
        imageExpected: DrawableImage,
        imageGot: CanvasWrapper,
        width: number,
        height: number,
        drawRed: boolean
    ) {
        let cvExpected = CanvasWrapper.createMemoryCanvas(width, height);
        cvExpected.drawFromImage(
            imageExpected,
            0,
            0,
            width,
            height,
            0,
            0,
            0,
            0,
            width,
            height
        );
        let dataExpected = cvExpected.context.getImageData(0, 0, width, height);
        let dataGot = imageGot.context.getImageData(0, 0, width, height);
        assertEq(dataExpected.data.length, dataGot.data.length, '3w|');
        assertEq(dataExpected.data.length, 4 * width * height, '3v|');
        let countDifferences = TestUtilsCanvas.drawDifferencesInRed(
            dataExpected,
            dataGot,
            drawRed
        );
        if (drawRed) {
            imageGot.context.putImageData(dataGot, 0, 0);
        }

        return countDifferences;
    }

    /**
     * draw different pixels in red.
     */
    private static drawDifferencesInRed(
        dataExpected: ImageData,
        dataGot: ImageData,
        drawRed: boolean
    ) {
        let countDifferences = 0;
        for (let i = 0; i < dataExpected.data.length; i += 4) {
            let expected = TestUtilsCanvas.getColorFromCanvasData(dataExpected.data, i);
            let got = TestUtilsCanvas.getColorFromCanvasData(dataGot.data, i);

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

    /**
     * run the callback repeatedly until both imExpected loads and
     * imGot's RenderComplete is done.
     */
    private static async callDrawUntilRenderComplete(
        p: CanvasTestParams,
        imExpected: HTMLImageElement
    ) {
        let imGot = CanvasWrapper.createMemoryCanvas(p.width, p.height);
        let finished = false;
        for (let i = 0; i < p.maxCalls; i++) {
            if (imExpected.complete) {
                let complete = new RenderComplete();
                let ret = p.draw(imGot, complete);
                assertTrue(
                    ret === undefined || ret === null,
                    "3u|please don't return anything from fnDraw"
                );
                if (complete.complete) {
                    finished = true;
                    break;
                }
            }

            imGot.clear();
            await Util512Higher.sleep(100);
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
    private static async RenderAndCompareImage(
        download: boolean,
        fnGetDrawParams: GetDrawParams
    ) {
        let p = fnGetDrawParams();
        let imExpected = new Image();
        Util512Higher.beginLoadImage(p.urlImgExpected, imExpected, () => {});
        let imGot = await TestUtilsCanvas.callDrawUntilRenderComplete(p, imExpected);

        if (download) {
            console.log('Image sent to download, test complete.');
            imGot.canvas.toBlob((blob: any) => {
                bridgedSaveAs(blob, 'test' + p.testName + '.png');
            });
        } else {
            let countDifferences = TestUtilsCanvas.compareCanvas(
                imExpected,
                imGot,
                p.width,
                p.height,
                true
            );
            if (countDifferences === p.expectDifferentPixels) {
                console.log(`\t\ttest ${p.testName} passed`);
            } else {
                let ratioWrong = countDifferences / (p.width * p.height);
                console.log(
                    `${p.testName} failed, ${countDifferences} pixels ${
                        100 * ratioWrong
                    }% do not match.`
                );

                console.log('Delta image sent to download, failures marked in red.');
                imGot.canvas.toBlob((blob: any) => {
                    bridgedSaveAs(blob, `failed${p.testName}.png`);
                });

                assertTrue(false, '3r|test failed');
            }
        }
    }

    /**
     * run RenderAndCompareImage on an array
     */
    static async RenderAndCompareImages(
        download: boolean,
        fnGetDrawParams: GetDrawParams | GetDrawParams[]
    ) {
        if (fnGetDrawParams instanceof Array) {
            let promises = fnGetDrawParams.map(f =>
                TestUtilsCanvas.RenderAndCompareImage(download, f)
            );
            await Promise.all(promises);
        } else {
            await TestUtilsCanvas.RenderAndCompareImage(download, fnGetDrawParams);
        }
    }

    /**
     * get black, white, or transparent. other colors return rgba tuple.
     */
    private static getColorFromCanvasData(data: Uint8ClampedArray, i: number) {
        assertTrue(data[i] !== undefined, '3!|point not defined');
        const clrLarge = 256 - clrThreshold;
        if (data[i + 3] < clrThreshold) {
            return 't';
        } else if (
            data[i] > clrLarge &&
            data[i + 1] > clrLarge &&
            data[i + 2] > clrLarge
        ) {
            return 'w';
        } else if (
            data[i] < clrThreshold &&
            data[i + 1] < clrThreshold &&
            data[i + 2] < clrThreshold
        ) {
            return 'b';
        } else {
            return `other(${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]})`;
        }
    }
}

/**
 * a test that compares the results with a known-good png
 */
export class CanvasTestParams {
    constructor(
        public testName: string,
        public urlImgExpected: string,
        /* we'll run the callback repeatedly until complete flag returns true */
        public draw: (canvas: CanvasWrapper, complete: RenderComplete) => void,
        public width: number,
        public height: number,
        /* is this a unit test, or did user start the test explicitly
        by clicking on a button? */
        public uiContext: boolean,
        /* used for testing the test infrastructure */
        public expectDifferentPixels = 0
    ) {}

    readonly maxCalls = 500;
}

/**
 * a function that returns a CanvasTestParams
 */
type GetDrawParams = () => CanvasTestParams;
