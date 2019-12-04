
/* auto */ import { O } from './../utils/util512Assert';
/* auto */ import { FormattedText } from './ui512FormattedText';
/* auto */ import { UI512FontRequest } from './ui512DrawTextFontRequest';
/* auto */ import { CharRectType } from './ui512DrawTextClasses';

/**
 * arguments that will be passed to DrawText
 */
export class DrawTextArgs {
    constructor(
        public boxX: number,
        public boxY: number,
        public boxW: number,
        public boxH: number,
        public hAlign = false,
        public vAlign = false,
        public wrap = false
    ) {}

    addVSpacing = 0;
    vScrollAmt = 0;
    hScrollAmt = 0;
    selCaret = -1;
    selEnd = -1;
    showCaret = false;
    drawBeyondVisible = true;
    asteriskOnly = false;
    defaultFont = UI512FontRequest.defaultFont;
    callbackPerChar: O<(charIndex: number, type: CharRectType, bounds: number[]) => boolean>;
}

/**
 * fill out a DrawTextArgs object
 * based on the properties of a text field element
 */
export function drawTextArgsFromEl(
    el: CanGetValue,
    subRect: number[],
    hasFocus: boolean
): [DrawTextArgs, FormattedText] {
    let args = new DrawTextArgs(
        subRect[0],
        subRect[1],
        subRect[2],
        subRect[3],
        el.getB('labelhalign'),
        el.getB('labelvalign'),
        el.getB('labelwrap')
    );

    /* adjust positions */
    args.boxX += el.getN('nudgex');
    args.boxY += el.getN('nudgey');
    args.boxW -= el.getN('nudgex');
    args.boxH -= el.getN('nudgey');

    /* we currently don't support v-aligned text fields. can be used in a label. */
    args.vAlign = false;
    args.addVSpacing = el.getN('addvspacing');
    args.hScrollAmt = 0;
    args.vScrollAmt = el.getN('scrollamt');
    args.defaultFont = el.getS('defaultFont');
    args.asteriskOnly = el.getB('asteriskonly');

    if (el.getB('selectbylines')) {
        /* always show the highlight, even when text in another field is being edited. */
        hasFocus = true;

        /* shrink margins of the field. */
        args.boxX -= 2;
        args.boxW += 4;
    }

    if (hasFocus && el.getB('canselecttext')) {
        args.selCaret = el.getN('selcaret');
        args.selEnd = el.getN('selend');
        args.showCaret = el.getB('showcaret');
    }

    if (el.getB('selectbylines') && args.selCaret === args.selEnd) {
        /* when selecting by lines, don't show the normal blinking caret */
        args.showCaret = false;
    }

    let ret: FormattedText = el.getFmTxt();
    return [args, ret];
}

/**
 * rough structure of a _UI512Gettable_
 */
interface CanGetValue {
    getB(s: string): boolean;
    getN(s: string): number;
    getS(s: string): string;
    getFmTxt(): FormattedText;
}
