
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { CharRectType } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { UI512FontCache } from '../../ui512/draw/ui512DrawTextRequestData.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';

/**
 * fill out a RenderTextArgs object
 * based on the properties of a text field element
 */
export function renderTextArgsFromEl(
    el: CanGetValue,
    subRect: number[],
    hasFocus: boolean
): [RenderTextArgs, FormattedText] {
    let args = new RenderTextArgs(
        subRect[0],
        subRect[1],
        subRect[2],
        subRect[3],
        el.get_b('labelhalign'),
        el.get_b('labelvalign'),
        el.get_b('labelwrap')
    );

    /* adjust positions */
    args.boxX += el.get_n('nudgex');
    args.boxY += el.get_n('nudgey');
    args.boxW -= el.get_n('nudgex');
    args.boxH -= el.get_n('nudgey');

    /* we currently don't support v-aligned text fields. can be used in a label. */
    args.vAlign = false;
    args.addVSpacing = el.get_n('addvspacing');
    args.hScrollAmt = 0;
    args.vScrollAmt = el.get_n('scrollamt');
    args.defaultFont = el.get_s('defaultFont');
    args.asteriskOnly = el.get_b('asteriskonly');

    if (el.get_b('selectbylines')) {
        /* always show the highlight, even when text in another field is being edited. */
        hasFocus = true;

        /* shrink margins of the field. */
        args.boxX -= 2;
        args.boxW += 4;
    }

    if (hasFocus && el.get_b('canselecttext')) {
        args.selCaret = el.get_n('selcaret');
        args.selEnd = el.get_n('selend');
        args.showCaret = el.get_b('showcaret');
    }

    if (el.get_b('selectbylines') && args.selCaret === args.selEnd) {
        /* when selecting by lines, don't show the normal blinking caret */
        args.showCaret = false;
    }

    let ret: FormattedText = el.get_ftxt();
    return [args, ret];
}

/**
 * arguments that will be passed to RenderText
 */
export class RenderTextArgs {
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
    defaultFont = UI512FontCache.defaultFont;
    callbackPerChar: O<(charIndex: number, type: CharRectType, bounds: number[]) => boolean>;
}

/**
 * rough structure of a _UI512Gettable_
 */
interface CanGetValue {
    get_b(s: string): boolean;
    get_n(s: string): number;
    get_s(s: string): string;
    get_ftxt(): FormattedText;
}
