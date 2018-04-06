
/* auto */ import { O, assertTrue, assertTrueWarn, scontains } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, assertEqWarn, slength } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { ScrollConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { TextFontStyling, specialCharNumNewline, textFontStylingToString } from '../../ui512/draw/ui512drawtextclasses.js';
/* auto */ import { FormattedText, Lines } from '../../ui512/draw/ui512formattedtext.js';
/* auto */ import { TextRendererFontManager } from '../../ui512/draw/ui512drawtext.js';
/* auto */ import { UI512ElTextField } from '../../ui512/elements/ui512elementstextfield.js';

class AutoIndentMatch {
    startPattern: RegExp;
    desiredEndPattern: RegExp;
    desiredEndText: string;
}

export class UI512AutoIndent {
    lineContinuation = ['\\'];
    linesCauseIndent: [RegExp, RegExp, string][] = [
        [/^start1\b/, /^end1\b/, 'end1'],
        [/^start\s+b2\b/, /^end\s+b2\b/, 'end'],
        [/^start\s+b2\b/, /^end\s+b2\b/, 'end'],
        [/^on\s+(\w+)\b/, /^end\s+%MATCH%\b/, 'end %MATCH%'],
    ];
    caseSensitive = true;
    useTabs = true;
    useAutoIndent = true;
    useAutoCreateBlock = true;
    readonly reNull = new RegExp('');
    constructor() {}

    protected lineIsContinuation(s: string) {
        for (let cont of this.lineContinuation) {
            if (s.endsWith(cont) || s.endsWith(cont + '\n')) {
                return true;
            }
        }

        return false;
    }

    getLevelChangeIsStartNewBlock(s: string, stack: AutoIndentMatch[], st: RegExp, end: RegExp, endText: string) {
        let matched = s.match(st);
        if (matched) {
            let nextword = '';
            if (scontains(endText, '%MATCH%')) {
                assertTrue(matched.length > 1, '2s|the regex should have a 2nd group to capture next word');
                if (matched[1].match(/^\w+$/)) {
                    nextword = matched[1];
                }
            }

            let store = new AutoIndentMatch();
            store.startPattern = st;
            store.desiredEndPattern = new RegExp(end.source.replace(/%MATCH%/g, nextword));
            store.desiredEndText = endText.replace(/%MATCH%/g, nextword);
            stack.push(store);
            return 1;
        }

        return 0;
    }

    getLevelChangeIsEndOfBlock(s: string, stack: AutoIndentMatch[]) {
        let desiredMatch = stack[stack.length - 1];
        let matched = s.match(desiredMatch.desiredEndPattern);
        if (matched) {
            stack.pop();
            return -1;
        } else {
            return 0;
        }
    }

    protected getLevelChange(sTrimmed: string, stack: AutoIndentMatch[]): [boolean, boolean] {
        let isBlockStart = false;
        let isBlockEnd = false;
        sTrimmed = sTrimmed.trim();
        if (!this.caseSensitive) {
            sTrimmed = sTrimmed.toLowerCase();
        }

        // are we starting a new block?
        for (let [st, end, endInsert] of this.linesCauseIndent) {
            let rt = this.getLevelChangeIsStartNewBlock(sTrimmed, stack, st, end, endInsert);
            if (rt !== 0) {
                isBlockStart = true;
                break;
            }
        }

        // are we finishing a block?
        if (stack.length > 0) {
            let rt = this.getLevelChangeIsEndOfBlock(sTrimmed, stack);
            if (rt !== 0) {
                isBlockEnd = true;
            }
        }

        return [isBlockStart, isBlockEnd];
    }

    runAutoIndentImpl(
        lns: Lines,
        selcaret: number,
        selend: number,
        len: number,
        attemptInsertText: boolean
    ): [Lines, number, number] {
        let wasEnd = selcaret >= len;
        let currentline = lns.indexToLineNumber(selcaret);

        let lnsout = new Lines(FormattedText.newFromPersisted(''));
        lnsout.lns = [];

        let overrideLevel: O<number> = undefined;
        let level = 0;
        let lastUnclosedDelta = 0;
        let lastUnclosedMatch: O<AutoIndentMatch>;
        let stack: AutoIndentMatch[] = [];
        for (let i = 0; i < lns.lns.length; i++) {
            let s = lns.getLineUnformatted(i);
            let isContinuation = this.lineIsContinuation(s);
            let [isBlockStart, isBlockEnd] = this.getLevelChange(s, stack);

            if (i === currentline - 1 && !isContinuation && isBlockStart) {
                lastUnclosedDelta = 1;
                lastUnclosedMatch = stack[stack.length - 1];
            }

            if (isBlockEnd) {
                level -= 1;
            }

            s = this.lineSetIndent(s, overrideLevel !== undefined ? overrideLevel : level);
            s = TextRendererFontManager.setInitialFont(s, UI512CompCodeEditorFont.font);
            lnsout.lns[i] = FormattedText.newFromPersisted(s);
            overrideLevel = isContinuation ? level + 1 : undefined;

            if (isBlockStart) {
                level += 1;
            }
        }

        if (level !== 0 && attemptInsertText) {
            // something didn't parse right, let's see if we can auto insert closing text
            if (this.createAutoBlock(lnsout, currentline, lastUnclosedMatch, lastUnclosedDelta)) {
                // do a second pass on indentation
                let newselcaret = lnsout.lineNumberToLineEndIndex(currentline);
                return this.runAutoIndentImpl(lnsout, newselcaret, newselcaret, lnsout.length(), false);
            }
        }

        assertEqWarn(lns.lns.length, lnsout.lns.length, '2r|');
        assertTrueWarn(currentline < lnsout.lns.length, '2q|invalid currentline');
        let index = lnsout.lineNumberToLineEndIndex(currentline);
        return [lnsout, index, index];
    }

    runAutoIndent(lns: Lines, el: UI512ElTextField): Lines {
        let len = el.get_ftxt().len();
        let [lnsout, newselcaret, newselend] = this.runAutoIndentImpl(
            lns,
            el.get_n('selcaret'),
            el.get_n('selend'),
            len,
            true
        );
        el.set('selcaret', newselcaret);
        el.set('selend', newselend);
        return lnsout;
    }

    lineSetIndent(s: string, n: number) {
        s = s.replace(/^[ \t]+/, '');
        let space = this.useTabs ? '\t' : Util512.repeat(ScrollConsts.tabSize, ' ').join('');
        for (let i = 0; i < n; i++) {
            s = space + s;
        }

        return s;
    }

    createAutoBlock(
        lnsout: Lines,
        currentline: number,
        lastEncounteredDesiredMatch: O<AutoIndentMatch>,
        delta: number
    ) {
        if (delta !== 1 || !lastEncounteredDesiredMatch || !this.useAutoCreateBlock) {
            return false;
        } else if (!slength(lastEncounteredDesiredMatch.desiredEndText)) {
            return false;
        }

        // we'll do a second pass later to correct the indentation
        let s = TextRendererFontManager.setInitialFont(
            lastEncounteredDesiredMatch.desiredEndText,
            UI512CompCodeEditorFont.font
        );

        // are we on the very last line? then don't add a newline character
        if (currentline >= lnsout.lns.length - 1) {
            lnsout.lns[currentline].push(specialCharNumNewline, UI512CompCodeEditorFont.font);
        } else {
            s += '\n';
        }

        let txt = FormattedText.newFromPersisted(s);
        lnsout.lns.splice(currentline + 1, 0, txt);
        return true;
    }

    runAutoIndentAll(el: UI512ElTextField) {
        if (!this.useAutoIndent) {
            return;
        }

        let lns = new Lines(el.get_ftxt());
        let lnsAfterIndent = this.runAutoIndent(lns, el);
        let next = lnsAfterIndent.flatten();
        let flattxtcurrent = el.get_ftxt().toUnformatted();
        if (flattxtcurrent !== next.toUnformatted()) {
            el.setftxt(next);
        }
    }
}

export class UI512CompCodeEditorFont {
    static face = 'monaco';
    static style = TextFontStyling.Default;
    static size = 9;
    static font = `${UI512CompCodeEditorFont.face}_${UI512CompCodeEditorFont.size}_${textFontStylingToString(
        UI512CompCodeEditorFont.style
    )}`;
}
