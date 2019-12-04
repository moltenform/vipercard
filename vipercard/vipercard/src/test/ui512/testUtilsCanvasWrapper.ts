
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { RenderComplete } from './../../ui512/utils/util512Higher';
/* auto */ import { longstr } from './../../ui512/utils/util512';
/* auto */ import { CanvasTestParams, TestUtilsCanvas } from './../testUtils/testUtilsCanvas';
/* auto */ import { SimpleUtil512TestCollection } from './../testUtils/testUtils';

/**
 * testing fillRect, getColorFromCanvasData, and
 * TestUtilsCanvas.RenderAndCompareImages itself
 */
let t = new SimpleUtil512TestCollection('testCollectionUtilsCanvasWrapper', true);
export let testCollectionUtilsCanvasWrapper = t;

t.atest('async/testSimple Draw Rectangles', async () => {
    let draw = (canvas: CanvasWrapper, _unused_complete: RenderComplete) => {
        canvas.fillRect(3, 5, 30, 50, 0, 0, imWidth, imHeight, 'black');
        canvas.fillRect(22, 40, 40, 400, 0, 0, imWidth, imHeight, 'black');
        canvas.fillRect(280, 15, 1, 405, 0, 0, imWidth, imHeight, 'black');
    };

    let getParams = () => {
        return new CanvasTestParams(
            'simpledrawrect',
            '/resources/test/drawsimplerects.png',
            draw,
            imWidth,
            imHeight,
            false
        );
    };

    await TestUtilsCanvas.RenderAndCompareImages(false, getParams);
});
t.atest('async/testSimple Draw Rectangles including no-op drawing', async () => {
    let draw = (canvas: CanvasWrapper, _unused_complete: RenderComplete) => {
        canvas.fillRect(3, 5, 30, 50, 0, 0, imWidth, imHeight, 'black');
        canvas.fillRect(22, 40, 40, 400, 0, 0, imWidth, imHeight, 'black');
        canvas.fillRect(280, 15, 1, 405, 0, 0, imWidth, imHeight, 'black');
        /* draw with width zero, should have no effect */
        canvas.fillRect(250, 15, 0, 405, 0, 0, imWidth, imHeight, 'black');
        /* draw with height zero, should have no effect */
        canvas.fillRect(100, 5, 40, 0, 0, 0, imWidth, imHeight, 'black');
        /* draw black over black, should have no effect */
        canvas.fillRect(3 + 1, 5 + 1, 30 - 1, 50 - 1, 0, 0, imWidth, imHeight, 'black');
        /* draw white over transparent, should have no effect as far as our testing. */
        canvas.fillRect(245, 3, 0, 15, 0, 0, imWidth, imHeight, 'white');
    };

    let getParams = () => {
        return new CanvasTestParams(
            'simpledrawrect',
            '/resources/test/drawsimplerects.png',
            draw,
            imWidth,
            imHeight,
            false
        );
    };

    await TestUtilsCanvas.RenderAndCompareImages(false, getParams);
});
t.atest('async/testShould fail with 85 differences if shifted', async () => {
    let draw = (canvas: CanvasWrapper, _unused_complete: RenderComplete) => {
        canvas.fillRect(3 + 1, 5, 30, 50, 0, 0, imWidth, imHeight, 'black');
        canvas.fillRect(22, 40, 40, 400, 0, 0, imWidth, imHeight, 'black');
        canvas.fillRect(280, 15, 1, 405, 0, 0, imWidth, imHeight, 'black');
    };

    let getParams = () => {
        let expectedDifferences = 85;
        return new CanvasTestParams(
            'simpledrawrect',
            '/resources/test/drawsimplerects.png',
            draw,
            imWidth,
            imHeight,
            false,
            expectedDifferences
        );
    };

    await TestUtilsCanvas.RenderAndCompareImages(false, getParams);
});
t.atest(
    'async/testShould fail with 1 different pixel if black pixel turned white',
    async () => {
        let draw = (canvas: CanvasWrapper, _unused_complete: RenderComplete) => {
            canvas.fillRect(3, 5, 30, 50, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(22, 40, 40, 400, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(280, 15, 1, 405, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(3 + 2, 5 + 2, 1, 1, 0, 0, imWidth, imHeight, 'white');
        };

        let getParams = () => {
            let expectedDifferences = 1;
            return new CanvasTestParams(
                'simpledrawrect',
                '/resources/test/drawsimplerects.png',
                draw,
                imWidth,
                imHeight,
                false,
                expectedDifferences
            );
        };

        await TestUtilsCanvas.RenderAndCompareImages(false, getParams);
    }
);
t.atest(
    'async/testShould fail with 2 different pixels if white pixel turned black (NW)',
    async () => {
        let draw = (canvas: CanvasWrapper, _unused_complete: RenderComplete) => {
            canvas.fillRect(3, 5, 30, 50, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(22, 40, 40, 400, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(280, 15, 1, 405, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(0, 0, 1, 1, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(1, 1, 1, 1, 0, 0, imWidth, imHeight, 'black');
        };

        let getParams = () => {
            let expectedDifferences = 2;
            return new CanvasTestParams(
                'simpledrawrect',
                '/resources/test/drawsimplerects.png',
                draw,
                imWidth,
                imHeight,
                false,
                expectedDifferences
            );
        };

        await TestUtilsCanvas.RenderAndCompareImages(false, getParams);
    }
);
t.atest(
    'async/testShould fail with 2 different pixels if white pixel turned black (NE)',
    async () => {
        let draw = (canvas: CanvasWrapper, _unused_complete: RenderComplete) => {
            canvas.fillRect(3, 5, 30, 50, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(22, 40, 40, 400, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(280, 15, 1, 405, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(imWidth - 1, 0, 1, 1, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(imWidth - 1, 1, 1, 1, 0, 0, imWidth, imHeight, 'black');
        };

        let getParams = () => {
            let expectedDifferences = 2;
            return new CanvasTestParams(
                'simpledrawrect',
                '/resources/test/drawsimplerects.png',
                draw,
                imWidth,
                imHeight,
                false,
                expectedDifferences
            );
        };

        await TestUtilsCanvas.RenderAndCompareImages(false, getParams);
    }
);
t.atest(
    'async/testShould fail with 2 different pixels if white pixel turned black (SW)',
    async () => {
        let draw = (canvas: CanvasWrapper) => {
            canvas.fillRect(3, 5, 30, 50, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(22, 40, 40, 400, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(280, 15, 1, 405, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(0, imHeight - 1, 1, 1, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(1, imHeight - 1, 1, 1, 0, 0, imWidth, imHeight, 'black');
        };

        let getParams = () => {
            let expectedDifferences = 2;
            return new CanvasTestParams(
                'simpledrawrect',
                '/resources/test/drawsimplerects.png',
                draw,
                imWidth,
                imHeight,
                false,
                expectedDifferences
            );
        };

        await TestUtilsCanvas.RenderAndCompareImages(false, getParams);
    }
);
t.atest(
    'async/testShould fail with 2 different pixels if white pixel turned black (SE)',
    async () => {
        let draw = (canvas: CanvasWrapper, _unused_complete: RenderComplete) => {
            canvas.fillRect(3, 5, 30, 50, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(22, 40, 40, 400, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(280, 15, 1, 405, 0, 0, imWidth, imHeight, 'black');
            canvas.fillRect(
                imWidth - 1,
                imHeight - 1,
                1,
                1,
                0,
                0,
                imWidth,
                imHeight,
                'black'
            );
            canvas.fillRect(
                imWidth - 2,
                imHeight - 2,
                1,
                1,
                0,
                0,
                imWidth,
                imHeight,
                'black'
            );
        };

        let getParams = () => {
            let expectedDifferences = 2;
            return new CanvasTestParams(
                'simpledrawrect',
                '/resources/test/drawsimplerects.png',
                draw,
                imWidth,
                imHeight,
                false,
                expectedDifferences
            );
        };

        await TestUtilsCanvas.RenderAndCompareImages(false, getParams);
    }
);
t.atest(
    longstr(`async/testShould continue looping until renderComplete,
        even if the first renders are wrong`),
    async () => {
        let countRenderAttempt = 0;
        let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
            if (countRenderAttempt === 0) {
                canvas.fillRect(1, 1, 500, 500, 0, 0, imWidth, imHeight, 'black');
            } else if (countRenderAttempt === 1) {
                canvas.fillRect(1, 1, 100, 100, 0, 0, imWidth, imHeight, 'white');
            } else if (countRenderAttempt === 2) {
                canvas.fillRect(3, 5, 30, 50, 0, 0, imWidth, imHeight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, imWidth, imHeight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, imWidth, imHeight, 'black');
            }
            complete.complete = countRenderAttempt === 2;
            countRenderAttempt++;
        };

        let getParams = () => {
            return new CanvasTestParams(
                'simpledrawrect',
                '/resources/test/drawsimplerects.png',
                draw,
                imWidth,
                imHeight,
                false
            );
        };

        await TestUtilsCanvas.RenderAndCompareImages(false, getParams);
    }
);

const imWidth = 300;
const imHeight = 556;
