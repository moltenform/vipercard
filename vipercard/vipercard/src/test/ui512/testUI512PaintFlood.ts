
/* auto */ import { cast, getRoot } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { CanvasWrapper } from '../../ui512/utils/utilsDraw.js';
/* auto */ import { clrBlack, clrWhite } from '../../ui512/draw/ui512DrawPattern.js';
/* auto */ import { UI512PainterCvDataAndPatterns } from '../../ui512/draw/ui512DrawPaint.js';
/* auto */ import { IconInfo } from '../../ui512/draw/ui512DrawIconClasses.js';
/* auto */ import { UI512IconManager } from '../../ui512/draw/ui512DrawIcon.js';
/* auto */ import { GridLayout } from '../../ui512/elements/ui512ElementsApp.js';

export class FloodFillTest {
    readonly columns = [true, true, true, true, true];
    readonly iconnumbers = [33, 85, 170];
    readonly layout = new GridLayout(0, 0, 32, 32, this.columns, this.iconnumbers, 5, 5);

    isdone = false;
    start() {
        return CanvasWrapper.createMemoryCanvas(this.layout.getTotalWidth(), this.layout.getTotalHeight());
    }

    floodFillTest(canvas: CanvasWrapper) {
        let iconManager = cast(getRoot().getDrawIcon(), UI512IconManager);
        let readyToLoad = true;
        this.layout.combinations((n, _, iconnumber, bnds) => {
            let info = new IconInfo('002', iconnumber);
            let icon = iconManager.findIcon(info.iconGroup, info.iconNumber);
            if (!icon) {
                readyToLoad = false;
                return;
            }

            icon.drawIntoBox(canvas, info, bnds[0], bnds[1], bnds[2], bnds[3]);
        });

        if (!readyToLoad) {
            return;
        }

        let imdata = canvas.context.getImageData(0, 0, canvas.canvas.width, canvas.canvas.height);
        let painter = new UI512PainterCvDataAndPatterns(imdata.data, canvas.canvas.width, canvas.canvas.height);
        const xspace = this.layout.getColWidth();

        /* floodfill black onto black */
        painter.floodFill(2, 18, clrBlack);
        painter.floodFill(16, 53, clrBlack);
        painter.floodFill(20, 96, clrBlack);

        /* floodfill white onto white */
        painter.floodFill(56, 9, clrWhite);
        painter.floodFill(52, 45, clrWhite);
        painter.floodFill(52, 90, clrWhite);

        /* floodfill black onto white */
        painter.floodFill(56 + xspace, 9, clrBlack);
        painter.floodFill(52 + xspace, 45, clrBlack);
        painter.floodFill(52 + xspace, 90, clrBlack);

        /* floodfill white onto black */
        painter.floodFill(2 + 3 * xspace, 18, clrWhite);
        painter.floodFill(16 + 3 * xspace, 53, clrWhite);
        painter.floodFill(20 + 3 * xspace, 96, clrWhite);

        /* floodfill with pattern */
        painter.floodFill(166, 14, 108);
        painter.floodFill(163, 53, 108);
        painter.floodFill(163, 91, 108);

        canvas.context.putImageData(imdata, 0, 0);
        this.isdone = true;
    }
}
