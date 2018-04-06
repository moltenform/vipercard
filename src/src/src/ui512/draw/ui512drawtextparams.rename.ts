
/* auto */ import { O } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { CharRectType } from '../../ui512/draw/ui512drawtextclasses.js';
/* auto */ import { TextRendererFontCache } from '../../ui512/draw/ui512drawtextloadjson.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512formattedtext.js';

export function renderTextArgsFromEl(el: any, subrect: number[], hasFocus: boolean): [RenderTextArgs, FormattedText] {
    let args = new RenderTextArgs(
        subrect[0],
        subrect[1],
        subrect[2],
        subrect[3],
        el.get_b('labelhalign'),
        el.get_b('labelvalign'),
        el.get_b('labelwrap')
    );

    // adjust positions
    args.boxx += el.get_n('nudgex');
    args.boxy += el.get_n('nudgey');
    args.boxw -= el.get_n('nudgex');
    args.boxh -= el.get_n('nudgey');

    // we currently don't support v-aligned text fields. can be used in a label.
    args.valign = false;
    args.addvspacing = el.get_n('addvspacing');
    args.hscrollamt = 0;
    args.vscrollamt = el.get_n('scrollamt');
    args.defaultFont = el.get_s('defaultFont');
    args.asteriskOnly = el.get_b('asteriskonly');

    if (el.get_b('selectbylines')) {
        // always show the highlight, even when text in another field is being edited.
        hasFocus = true;

        // shrink margins of the field.
        args.boxx -= 2;
        args.boxw += 4;
    }

    if (hasFocus && el.get_b('canselecttext')) {
        args.selcaret = el.get_n('selcaret');
        args.selend = el.get_n('selend');
        args.showCaret = el.get_b('showcaret');
    }

    if (el.get_b('selectbylines') && args.selcaret === args.selend) {
        // when selecting by lines, don't show the normal blinking caret
        args.showCaret = false;
    }

    let ret: FormattedText = el.get_ftxt();
    return [args, ret];
}

export class RenderTextArgs {
    constructor(
        public boxx: number,
        public boxy: number,
        public boxw: number,
        public boxh: number,
        public halign = false,
        public valign = false,
        public wrap = false
    ) {}

    addvspacing = 0;
    vscrollamt = 0;
    hscrollamt = 0;
    selcaret = -1;
    selend = -1;
    showCaret = false;
    defaultFont = TextRendererFontCache.defaultFont;
    drawBeyondVisible = true;
    asteriskOnly = false;
    callbackPerChar: O<(charindex: number, type: CharRectType, bounds: number[]) => boolean>;
}
