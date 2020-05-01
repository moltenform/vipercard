
/* auto */ import { ModifierKeys } from './../../ui512/utils/utilsKeypressHelpers';
/* auto */ import { cast } from './../../ui512/utils/util512';
/* auto */ import { UI512Presenter } from './../../ui512/presentation/ui512Presenter';
/* auto */ import { FormattedText } from './../../ui512/drawtext/ui512FormattedText';
/* auto */ import { KeyDownEventDetails, MouseDownDoubleEventDetails, MouseDownEventDetails } from './../../ui512/menu/ui512Events';
/* auto */ import { UI512ElTextField } from './../../ui512/elements/ui512ElementTextField';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * no test cases need to be here, it's used by testUI512TextEdit
 *
 * send simulated events,
 * and we'll then compare a screenshot of the current state
 * with a known-good screenshot to see if we rendered what was expected
 */
export class TestTextEventInteractions {
    drawTestCaseScrolling(pr: UI512Presenter) {
        /* confirm that a scrollbar is enabled when text gets too long */
        /* click in the padding area after '12345' in fld 'halign+scr' and enter lots of text */
        this.simulateClick(pr, 539, 118, false, false);
        for (let i = 0; i < 16; i++) {
            this.simulateTypeLetter(pr, 'Q');
            this.simulateTypeLetter(pr, 'W');
            this.simulateTypeLetter(pr, 'E');
        }

        /* confirm that scrollbar disabled when text short enough */
        /* the scrollbar should now be disabled because the text is short, and scrolled to top */
        /* click on fld 7 and hit Ctrl+End */
        this.simulateClick(pr, 360, 296, false, false);
        this.simulateKey(pr, 'End', '', false, true);
        /* hit Ctrl+Backspace 120 times */
        for (let i = 0; i < 120; i++) {
            this.simulateKey(pr, 'Backspace', '', false, true);
        }

        /* try scrolling up/down with the arrows */
        /* insert some text at the beginning of fld 3 */
        this.simulateClick(pr, 340, 110, false, false);
        for (let i = 1; i <= 8; i++) {
            this.simulateTypeLetter(pr, i.toString());
            this.simulateKey(pr, 'Enter', '', false);
        }
        /* hit the scroll down arrow 5x */
        for (let i = 0; i < 5; i++) {
            this.simulateClick(pr, 390, 222, false, false);
        }
        /* hit the scroll up arrow 2x */
        for (let i = 0; i < 2; i++) {
            this.simulateClick(pr, 390, 111, false, false);
        }

        /* try scrolling up/down by clicking on the background */
        /* click the lower bg of fld 5, 5x */
        for (let i = 0; i < 2; i++) {
            this.simulateClick(pr, 180, 345, false, false);
        }
        /* hit the upper bg 2x */
        for (let i = 0; i < 2; i++) {
            this.simulateClick(pr, 178, 266, false, false);
        }

        /* clicking the arrows should have no effect if scrollbar is disabled */
        /* click on the up/down arrows of fld 1 */
        for (let i = 0; i < 2; i++) {
            this.simulateClick(pr, 177, 110, false, false);
        }
        for (let i = 0; i < 5; i++) {
            this.simulateClick(pr, 177, 224, false, false);
        }

        /* make it big enough to have a scrollbar */
        let smallFld = cast(UI512ElTextField, pr.app.getEl('testCases_9'));
        smallFld.setDimensions(smallFld.x, smallFld.y, smallFld.w, 120);
        smallFld.setFmTxt(FormattedText.newFromSerialized('now ok'));
    }

    drawTestCaseSelection(pr: UI512Presenter) {
        /* part 1: set selections ------------------------------------------ */
        /* in the 1st field double-click at 105, 105 to select "ipsum" */
        this.simulateClick(pr, 105, 105, true);

        /* in the 2nd field click at 216, 106 to click on lorem */
        /* shift click at 282, 109 to move the selection to middle of "dolor" */
        this.simulateClick(pr, 216, 106);
        this.simulateClick(pr, 282, 109, false, true);

        /* in the 3rd field click at 351,108 to select part of lorem */
        /* hit shift-page down to select down to "pla" */
        this.simulateClick(pr, 351, 108);
        this.simulateKey(pr, 'PageDown', '', true);

        /* in the 4th field click at 430, 133 to select part of amet */
        /* shift click at 460, 160 to select down to erat */
        this.simulateClick(pr, 430, 133);
        this.simulateClick(pr, 460, 160, false, true);

        /* in the 5th field click at 115, 246 to select part of ipsum */
        /* hit shift-page down to select down to "sea te" */
        this.simulateClick(pr, 115, 246);
        this.simulateKey(pr, 'PageDown', '', true);

        /* in the 6th field click at 263, 271 to select part of feugait */
        /* hit shift-up 5x (the rest are unneeded) to select up to "dolor" */
        this.simulateClick(pr, 263, 271);
        for (let i = 0; i < 5; i++) {
            this.simulateKey(pr, 'ArrowUp', '', true);
        }

        /* in 7th fld click at 360, 260 to select part of psum */
        /* hit shift-pagedown 5x to select down to apeirian */
        this.simulateClick(pr, 360, 260);
        for (let i = 0; i < 5; i++) {
            this.simulateKey(pr, 'PageDown', '', true);
        }

        /* in 8th fld click at 444,288 to select part of pericula */
        /* hit shift-down 6x to select down to "uam N". */
        /* if this were a scrolling field it would should shift
        scroll slightly down, */
        /* but we've decided that for perf, a field with no
        scrollbar doesn't need to scroll down. */
        this.simulateClick(pr, 444, 288);
        for (let i = 0; i < 6; i++) {
            this.simulateKey(pr, 'ArrowDown', '', true);
        }

        /* click to set focus left of the 12345 in fld 'halign+scr' */
        /* hit shift-left 4x */
        this.simulateClick(pr, 500, 118);
        for (let i = 0; i < 4; i++) {
            this.simulateKey(pr, 'ArrowLeft', '', true);
        }

        /* click to set focus left of the text in fld 'rdonly' */
        /* hit shift-left 5x */
        this.simulateClick(pr, 759, 135);
        for (let i = 0; i < 5; i++) {
            this.simulateKey(pr, 'ArrowLeft', '', true);
        }

        /* part 2: cases with few characters ------------------------------------------ */
        /* zero chars */
        this.simulateClick(pr, 78, 63);
        this.simulateKey(pr, 'A', 'a', false, true);
        this.simulateKey(pr, 'Delete', '', false, false);

        /* 1 char, caret after */
        this.simulateClick(pr, 143, 60);
        this.simulateKey(pr, 'A', 'a', false, true);
        this.simulateTypeLetter(pr, '1');

        /* 1 char, selected */
        this.simulateClick(pr, 218, 60);
        this.simulateKey(pr, 'A', 'a', false, true);
        this.simulateTypeLetter(pr, '1');
        this.simulateKey(pr, 'ArrowLeft', '', true, false);

        /* 1 char, caret before */
        this.simulateClick(pr, 291, 60);
        this.simulateKey(pr, 'A', 'a', false, true);
        this.simulateTypeLetter(pr, '1');
        this.simulateKey(pr, 'ArrowLeft', '', false, false);

        /* part 3: set selections & input text ------------------------------------------ */

        /* click at 598, 212 to set focus to the right of the ab font typeface tests */
        /* type z to insert a z */
        this.simulateClick(pr, 618, 218);
        this.simulateTypeLetter(pr, 'Z');
        this.simulateKey(pr, 'ArrowRight', '', true);

        /* click to set focus to the right of the 345 in fld 'halign' */
        /* type a to insert an a */
        this.simulateClick(pr, 638, 121);
        this.simulateTypeLetter(pr, 'A');
        this.simulateKey(pr, 'ArrowRight', '', true, true);

        /* test rendering with right font after all chars deleted */
        /* click, hit Backspace 13 times, hit Delete 4 times */
        /* type Y */
        this.simulateClick(pr, 697, 219);
        for (let i = 0; i < 13; i++) {
            this.simulateKey(pr, 'Backspace', '', false);
        }
        for (let i = 0; i < 4; i++) {
            this.simulateKey(pr, 'Delete', '', false);
        }

        this.simulateTypeLetter(pr, 'Y');
        this.simulateTypeLetter(pr, 'A');
        this.simulateTypeLetter(pr, 'B');

        /* test rendering \n\n */
        /* click, hit Backspace 13 times, hit Delete 4 times */
        /* type Enter */
        /* type Enter */
        /* type shift-left */
        /* type shift left */
        this.simulateClick(pr, 812, 231);
        for (let i = 0; i < 13; i++) {
            this.simulateKey(pr, 'Backspace', '', false);
        }

        for (let i = 0; i < 4; i++) {
            this.simulateKey(pr, 'Delete', '', false);
        }

        this.simulateKey(pr, 'Enter', '', false);
        this.simulateKey(pr, 'Enter', '', false);
        this.simulateKey(pr, 'ArrowLeft', '', true);
        this.simulateKey(pr, 'ArrowLeft', '', true);

        /* for fld "small" */
        /* type & to insert text before any text in the field */
        this.simulateClick(pr, 847, 205);
        this.simulateKey(pr, '', '&', false);
        this.simulateKey(pr, 'ArrowDown', '', true);
    }

    simulateClick(
        pr: UI512Presenter,
        x: number,
        y: number,
        doubleclick = false,
        isShift = false
    ) {
        let mods = isShift ? ModifierKeys.Shift : ModifierKeys.None;
        if (doubleclick) {
            pr.rawEventCanThrow(new MouseDownEventDetails(0, x, y, 0, mods));
            pr.rawEventCanThrow(new MouseDownEventDetails(1, x, y, 0, mods));
            pr.rawEventCanThrow(new MouseDownDoubleEventDetails(2, x, y, 0, mods));
        } else {
            pr.rawEventCanThrow(new MouseDownEventDetails(0, x, y, 0, mods));
        }
    }

    simulateTypeLetter(pr: UI512Presenter, letter: string) {
        let isShift = letter === letter.toUpperCase();
        this.simulateKey(pr, letter, letter.toLowerCase(), isShift);
    }

    simulateKey(
        pr: UI512Presenter,
        keyCode: string,
        keyChar: string,
        isShift: boolean,
        isCmd = false
    ) {
        let mods = isShift ? ModifierKeys.Shift : ModifierKeys.None;
        mods |= isCmd ? ModifierKeys.Cmd : ModifierKeys.None;
        let d = new KeyDownEventDetails(0, keyCode, keyChar, false, mods);
        pr.rawEventCanThrow(d);
    }
}
