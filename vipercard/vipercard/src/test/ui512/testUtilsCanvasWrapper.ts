
/* auto */ import { RenderComplete } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { UI512TestBase } from '../../ui512/utils/utilsTest.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { CanvasTestParams, NullaryFn, testUtilCompareCanvasWithExpected } from '../../ui512/utils/utilsTestCanvas.js';

export class TestUI512CanvasComparison extends UI512TestBase {
    uicontext = false;
    readonly margin = 1;
    readonly imwidth = 300;
    readonly imheight = 556;
    tests = [
        'callback/Simple Draw Rectangles',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Simple Draw Rectangles with no-op drawing',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                /* draw with width zero, should have no effect */
                canvas.fillRect(250, 15, 0, 405, 0, 0, this.imwidth, this.imheight, 'black');
                /* draw with height zero, should have no effect */
                canvas.fillRect(100, 5, 40, 0, 0, 0, this.imwidth, this.imheight, 'black');
                /* draw black over black, should have no effect */
                canvas.fillRect(3 + 1, 5 + 1, 30 - 1, 50 - 1, 0, 0, this.imwidth, this.imheight, 'black');
                /* draw white over transparent, should have no effect as far as our testing. */
                canvas.fillRect(245, 3, 0, 15, 0, 0, this.imwidth, this.imheight, 'white');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if shifted',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3 + 1, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                let expectedDifferences = 85;
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    expectedDifferences
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if black pixel turned white',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(3 + 2, 5 + 2, 1, 1, 0, 0, this.imwidth, this.imheight, 'white');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    1
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if white pixel turned black (NW)',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(0, 0, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(1, 1, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    2
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if white pixel turned black (NE)',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(this.imwidth - 1, 0, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(this.imwidth - 1, 1, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    2
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if white pixel turned black (SW)',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(0, this.imheight - 1, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(1, this.imheight - 1, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    2
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should fail if white pixel turned black (SE)',
        (callback: NullaryFn) => {
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(this.imwidth - 1, this.imheight - 1, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
                canvas.fillRect(this.imwidth - 2, this.imheight - 2, 1, 1, 0, 0, this.imwidth, this.imheight, 'black');
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false,
                    2
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        },

        'callback/Should succeed even if the first renders are wrong',
        (callback: NullaryFn) => {
            let countRenderAttempt = 0;
            let draw = (canvas: CanvasWrapper, complete: RenderComplete) => {
                if (countRenderAttempt === 0) {
                    canvas.fillRect(1, 1, 500, 500, 0, 0, this.imwidth, this.imheight, 'black');
                } else if (countRenderAttempt === 1) {
                    canvas.fillRect(1, 1, 100, 100, 0, 0, this.imwidth, this.imheight, 'white');
                } else if (countRenderAttempt === 2) {
                    canvas.fillRect(3, 5, 30, 50, 0, 0, this.imwidth, this.imheight, 'black');
                    canvas.fillRect(22, 40, 40, 400, 0, 0, this.imwidth, this.imheight, 'black');
                    canvas.fillRect(280, 15, 1, 405, 0, 0, this.imwidth, this.imheight, 'black');
                }
                complete.complete = countRenderAttempt === 2;
                countRenderAttempt++;
            };
            let getParams = () => {
                return new CanvasTestParams(
                    'simpledrawrect',
                    '/resources/test/drawsimplerects.png',
                    draw,
                    this.imwidth,
                    this.imheight,
                    false
                );
            };
            testUtilCompareCanvasWithExpected(false, getParams, callback);
        }
    ];
}


