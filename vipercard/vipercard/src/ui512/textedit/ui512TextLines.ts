
/* auto */ import { Util512 } from '../../ui512/utils/utils512.js';
/* auto */ import { ScrollConsts } from '../../ui512/utils/utilsDrawConstants.js';
/* auto */ import { specialCharNumNewline } from '../../ui512/draw/ui512DrawTextClasses.js';
/* auto */ import { FormattedText } from '../../ui512/draw/ui512FormattedText.js';

/* small perf opt to reduce calls to charCodeAt */
const space = ' '.charCodeAt(0);
const dash = '-'.charCodeAt(0);
const tab = '\t'.charCodeAt(0);

/**
 * splits text into lines, in order to answer questions like:
 * which character is the start of the 5th line?
 * which line contains the 60th character?
 * what is the indentation level of the 9th line?
 */
export class UI512Lines {
    lns: FormattedText[];
    constructor(txt: FormattedText) {
        this.lns = [new FormattedText()];

        /* include the '\n' characters at the end of the line like we do when rendering */
        /* if we strip the \n character we would lose the formatting of the \n character */
        for (let i = 0; i < txt.len(); i++) {
            this.lns[this.lns.length - 1].push(txt.charAt(i), txt.fontAt(i));
            if (txt.charAt(i) === specialCharNumNewline) {
                this.lns.push(new FormattedText());
            }
        }
    }

    /**
     * join lines back into one FormattedText object
     */
    flatten() {
        let ret = new FormattedText();
        for (let line of this.lns) {
            ret.append(line);
        }

        return ret;
    }

    /**
     * which line contains the 60th character?
     */
    indexToLineNumber(n: number) {
        let runningTotal = 0;
        for (let i = 0; i < this.lns.length; i++) {
            let nextTotal = runningTotal + this.lns[i].len();
            if (n >= runningTotal && n < nextTotal) {
                return i;
            }

            runningTotal = nextTotal;
        }

        /* if beyond every line, return the last line. */
        return this.lns.length - 1;
    }

    /**
     * which character is the start of the 5th line?
     */
    lineNumberToIndex(lineNum: number) {
        let runningTotal = 0;
        lineNum = Math.min(lineNum, this.lns.length - 1);
        for (let i = 0; i < lineNum; i++) {
            runningTotal += this.lns[i].len();
        }

        return runningTotal;
    }

    /**
     * which character is the end of the 5th line?
     * this != start(n+1) - 1, consider the last line.
     */
    lineNumberToLineEndIndex(lineNum: number) {
        let ln = this.lns[lineNum];
        let startLine = this.lineNumberToIndex(lineNum);
        if (ln.len() === 0) {
            return startLine;
        } else if (ln.charAt(ln.len() - 1) === specialCharNumNewline) {
            return startLine + ln.len() - 1;
        } else {
            return startLine + ln.len();
        }
    }

    /**
     * same as lineNumberToIndex, but skips overhead creating a UI512Lines object
     */
    static fastLineNumberToIndex(txt: FormattedText, lineNum: number) {
        let count = 0;
        for (let i = 0; i < txt.len(); i++) {
            if (count === lineNum) {
                return i;
            } else if (txt.charAt(i) === specialCharNumNewline) {
                count += 1;
            }
        }

        return txt.len();
    }

    /**
     * same as lineNumberAndEndToIndex, but skips overhead creating a UI512Lines object
     */
    static fastLineNumberAndEndToIndex(txt: FormattedText, lineNum: number) {
        let startIndex = UI512Lines.fastLineNumberToIndex(txt, lineNum);
        let i = startIndex;
        for (i = startIndex; i < txt.len(); i++) {
            if (txt.charAt(i) === specialCharNumNewline) {
                break;
            }
        }

        return [startIndex, i + 1];
    }

    /**
     * get total length
     */
    length() {
        let runningTotal = 0;
        for (let i = 0; i < this.lns.length; i++) {
            runningTotal += this.lns[i].len();
        }

        return runningTotal;
    }

    /**
     * get unformatted content of the line
     */
    getLineUnformatted(linenum: number) {
        return this.lns[linenum].toUnformatted();
    }

    /**
     * apply a function to a certain number of lines
     * returns start and end positions of the text that was affected.
     */
    static alterSelectedLines(
        txt: FormattedText,
        nCaret: number,
        nEnd: number,
        fnAlterLine: (t: FormattedText) => void
    ): [FormattedText, number, number] {
        let lines = new UI512Lines(txt);
        let firstLine = lines.indexToLineNumber(Math.min(nCaret, nEnd));
        let lastLine = lines.indexToLineNumber(Math.max(nCaret, nEnd));
        for (let i = firstLine; i <= lastLine; i++) {
            fnAlterLine(lines.lns[i]);
        }

        /* let's select both entire lines we altered */
        let nextCaret = lines.lineNumberToIndex(firstLine);
        let nextEnd = lines.lineNumberToLineEndIndex(lastLine);
        return [lines.flatten(), nextCaret, nextEnd];
    }

    /**
     * get start of line excluding whitespace
     */
    static getNonSpaceStartOfLine(txt: FormattedText, okToExceedLength: boolean) {
        let i = 0;
        if (!txt.len()) {
            return 0;
        }

        for (i = 0; i < txt.len(); i++) {
            if (txt.charAt(i) !== space && txt.charAt(i) !== tab) {
                return i;
            }
        }

        return okToExceedLength ? txt.len() : txt.len() - 1;
    }

    /**
     * count indentation level
     */
    static getIndentLevel(txt: FormattedText) {
        let spaces = Util512.repeat(ScrollConsts.TabSize, ' ').join('');
        let s = txt.toUnformatted();
        const maxIndents = 1024;
        let count = 0;
        for (let i = 0; i < maxIndents; i++) {
            if (s.startsWith('\t')) {
                count += 1;
                s = s.substr(1);
            } else if (s.startsWith(spaces)) {
                count += 1;
                s = s.substr(spaces.length);
            } else {
                break;
            }
        }

        return count;
    }
}
