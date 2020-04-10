
/* auto */ import { CanvasWrapper } from './../../ui512/utils/utilsCanvasDraw';
/* auto */ import { getRoot } from './../../ui512/utils/util512Higher';
/* auto */ import { cast } from './../../ui512/utils/util512';
/* auto */ import { GridLayout } from './../../ui512/elements/ui512ElementApp';
/* auto */ import { clrBlack, clrWhite } from './../../ui512/draw/ui512DrawPatterns';
/* auto */ import { UI512PainterCvDataAndPatterns } from './../../ui512/draw/ui512DrawPainter';
/* auto */ import { UI512IconManager } from './../../ui512/draw/ui512DrawIconManager';
/* auto */ import { IconInfo } from './../../ui512/draw/ui512DrawIconClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * no test cases here, used by testUI512paint
 *
 * Test flood fill (paint bucket)
 *
 * We'll draw some 32x32 icons onto the screen,
 * run floodfill for solid black solid white and pattern,
 * and then compare the results with expected results.
 */

export class FloodFillTest {
    readonly columns = [true, true, true, true, true];
    readonly iconNumbers = [33, 85, 170];
    readonly layout = new GridLayout(0, 0, 32, 32, this.columns, this.iconNumbers, 5, 5);
    isDone = false;

    protected runFloodfill(painter: UI512PainterCvDataAndPatterns, spaceX: number) {
        /* floodfill black onto black */
        painter.floodFill(2, 18, clrBlack);
        painter.floodFill(16, 53, clrBlack);
        painter.floodFill(20, 96, clrBlack);

        /* floodfill white onto white */
        painter.floodFill(56, 9, clrWhite);
        painter.floodFill(52, 45, clrWhite);
        painter.floodFill(52, 90, clrWhite);

        /* floodfill black onto white */
        painter.floodFill(56 + spaceX, 9, clrBlack);
        painter.floodFill(52 + spaceX, 45, clrBlack);
        painter.floodFill(52 + spaceX, 90, clrBlack);

        /* floodfill white onto black */
        painter.floodFill(2 + 3 * spaceX, 18, clrWhite);
        painter.floodFill(16 + 3 * spaceX, 53, clrWhite);
        painter.floodFill(20 + 3 * spaceX, 96, clrWhite);

        /* floodfill with pattern */
        painter.floodFill(166, 14, 108);
        painter.floodFill(163, 53, 108);
        painter.floodFill(163, 91, 108);
    }

    start() {
        return CanvasWrapper.createMemoryCanvas(
            this.layout.getTotalWidth(),
            this.layout.getTotalHeight()
        );
    }

    floodFillTest(canvas: CanvasWrapper) {
        let iconManager = cast(UI512IconManager, getRoot().getDrawIcon());
        let readyToLoad = true;

        /* draw a grid of icons onto the canvas */
        this.layout.combinations((n, _, iconnumber, bnds) => {
            let info = new IconInfo('002', iconnumber);
            let icon = iconManager.findIcon(info.iconGroup, info.iconNumber);
            if (!icon) {
                readyToLoad = false;
                return;
            }

            icon.drawIntoBox(canvas, info, bnds[0], bnds[1], bnds[2], bnds[3]);
        });

        /* the icons haven't been loaded yet */
        if (!readyToLoad) {
            return;
        }

        let imData = canvas.context.getImageData(
            0,
            0,
            canvas.canvas.width,
            canvas.canvas.height
        );
        let painter = new UI512PainterCvDataAndPatterns(
            imData.data,
            canvas.canvas.width,
            canvas.canvas.height
        );
        const spaceX = this.layout.getColWidth();
        this.runFloodfill(painter, spaceX);

        canvas.context.putImageData(imData, 0, 0);
        this.isDone = true;
    }
}
