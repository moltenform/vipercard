
/* auto */ import { VpcIntermedValBase, VpcVal } from './vpcVal';
/* auto */ import { ReadableContainer, WritableContainer } from './vpcUtils';
/* auto */ import { OrdinalOrPosition, SortType, VpcChunkPreposition, VpcChunkType, getPositionFromOrdinalOrPosition } from './vpcEnums';
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, checkThrowEq, last, longstr, util512Sort } from './../../ui512/utils/util512';

/**
 * it turns out to be kind of complicated to evaluate something like
 * put item x to y of myList into z,
 * to match all of the corner cases with the original product's behavior
 * e.g. put "" into z; put "a" into item 40 of z
 * it will actually make a lot of commas and make it happen
 *
 * tested by brute-force comparing it with examples from the original product
 *
 * the input is given as 1-based but
 * internally in this class we use 0-based indexes
 */
export class ChunkResolution {
    /**
     * make a table of positions where items start
     * positions are 0-based
     * "a,bb,c" -> [0, 2, 5]
     */
    protected getPositionsTable(s: string, re: RegExp, isWords: boolean): number[] {
        let positions: number[] = [];
        if (!isWords || (!s.startsWith(' ') && !s.startsWith('\n'))) {
            positions.push(0);
        }

        while (true) {
            let match = re.exec(s);
            if (match) {
                let endOfMatch = match.index + match[0].length;
                if (!isWords || endOfMatch !== s.length) {
                    positions.push(endOfMatch);
                }
            } else {
                break;
            }
        }

        return positions;
    }

    /**
     * if the script has said something like
     * set the itemDel to "?"
     * make sure it is one-character and that the regex is escaped
     */
    protected regexpForDelim(delim: string) {
        checkThrowEq(1, delim.length, '8m|delim should be length 1 but got', delim);
        let escaped = Util512.escapeForRegex(delim);
        return new RegExp(escaped, 'g');
    }

    /**
     * get positions of the chunk, for chars.
     * return semi-inclusive bounds [start, end)
     */
    protected charsBoundsForGet(sInput: string, start: number, end: number): O<[number, number]> {
        if (start >= sInput.length) {
            return undefined;
        } else {
            end = Math.min(end, sInput.length);
            return [start, end];
        }
    }

    /**
     * get positions of the chunk, for items.
     * return semi-inclusive bounds [start, end)
     */
    protected itemsBoundsForGet(sInput: string, delim: string, start: number, end: number): O<[number, number]> {
        let table = this.getPositionsTable(sInput, this.regexpForDelim(delim), false);
        if (start >= table.length) {
            return undefined;
        } else {
            let firstchar = table[start];
            let lastchar = end >= table.length ? sInput.length : table[end] - 1;
            return [firstchar, lastchar];
        }
    }

    /**
     * get positions of the chunk, for words.
     * confirmed in emulator: only spaces and newlines separate words, not punctuation.
     * return semi-inclusive bounds [start, end)
     */
    protected wordsBoundsForGet(sInput: string, start: number, end: number): O<[number, number]> {
        let table = this.getPositionsTable(sInput, new RegExp('(\\n| )+', 'g'), true);
        if (start >= table.length) {
            return undefined;
        } else {
            let firstchar = table[start];
            let lastchar = end >= table.length ? sInput.length : table[end] - 1;
            while (lastchar > 0 && (sInput[lastchar - 1] === '\n' || sInput[lastchar - 1] === ' ')) {
                lastchar--;
            }

            return [firstchar, lastchar];
        }
    }

    /**
     * when you say put "abc" into char x to y of z, which positions should be replaced with "abc"?
     */
    protected charsBoundsForSet(sInput: string, start: number, end: number): any {
        if (start >= sInput.length) {
            return [sInput.length, sInput.length, ''];
        } else {
            end = Math.min(end, sInput.length);
            return [start, end, ''];
        }
    }

    /**
     * when you say put "abc" into item x to y of z, which positions should be replaced with "abc"?
     */
    protected itemsBoundsForSet(sInput: string, delim: string, start: number, end: number): any {
        let table = this.getPositionsTable(sInput, this.regexpForDelim(delim), false);
        if (start >= table.length) {
            /* you can set items beyond current content, add trailing commas! */
            let howmanytoadd = 1 + (start - table.length);
            let trailingCommas = Util512.repeat(howmanytoadd, delim).join('');
            return [sInput.length + howmanytoadd, sInput.length + howmanytoadd, trailingCommas];
        } else {
            let firstchar = table[start];
            let lastchar = end >= table.length ? sInput.length : table[end] - 1;
            return [firstchar, lastchar, ''];
        }
    }

    /**
     * when you say put "abc" into word x to y of z, which positions should be replaced with "abc"?
     */
    protected wordsBoundsForSet(sInput: string, start: number, end: number): any {
        let boundsGet = this.wordsBoundsForGet(sInput, start, end);
        if (boundsGet === undefined) {
            return [sInput.length, sInput.length, ''];
        } else {
            return [boundsGet[0], boundsGet[1], ''];
        }
    }

    /**
     * we've been asked to get item x to y of z.
     * return semi-inclusive bounds [start, end)
     */
    protected getBoundsForGet(s: string, itemDel: string, ch: RequestedChunk): O<[number, number]> {
        let first = ch.first;
        let last = ch.last;
        if (ch.ordinal !== undefined) {
            let count = ChunkResolution.applyCount(s, itemDel, ch.type, false);
            first = getPositionFromOrdinalOrPosition(ch.ordinal, 0, 1, count);
            last = first;
        }

        if (ch.type === VpcChunkType.Chars && last !== undefined && last < first) {
            /* checked in emulator, behavior for chars differs here for some reason. */
            return undefined;
        }

        assertTrue(first !== null && first !== undefined && last !== null, '5=|invalid first or last');
        last = last === undefined ? first : last;
        last = last < first ? first : last;
        if (first <= 0) {
            return undefined;
        } else if (s.length === 0) {
            return undefined;
        }

        /* convert from one-based to zero-based */
        let start = first - 1;
        last -= 1;
        let end = last;

        /* from inclusive to semiinclusive */
        end++;

        /* type-specific actions */
        if (ch.type === VpcChunkType.Chars) {
            return this.charsBoundsForGet(s, start, end);
        } else if (ch.type === VpcChunkType.Items) {
            return this.itemsBoundsForGet(s, itemDel, start, end);
        } else if (ch.type === VpcChunkType.Lines) {
            return this.itemsBoundsForGet(s, '\n', start, end);
        } else if (ch.type === VpcChunkType.Words) {
            return this.wordsBoundsForGet(s, start, end);
        } else {
            throw makeVpcScriptErr(`5<|unknown chunk type ${ch.type}`);
        }
    }

    /**
     * we've been asked to get item x to y of z.
     * return semi-inclusive bounds [start, end)
     */
    protected getBoundsForSet(sInput: string, itemDel: string, ch: RequestedChunk): [number, number, string] {
        let first = ch.first;
        let last = ch.last;
        if (ch.ordinal !== undefined) {
            let count = ChunkResolution.applyCount(sInput, itemDel, ch.type, false);
            first = getPositionFromOrdinalOrPosition(ch.ordinal, 0, 1, count);
            last = first;
        }

        assertTrue(first !== null && first !== undefined && last !== null, '5;|invalid first or last');
        if (ch.type === VpcChunkType.Chars && last !== undefined && last < first) {
            /* checked in emulator, behavior for chars differs here for some reason. */
            return [first - 1, first - 1, ''];
        }

        last = last === undefined ? first : last;
        last = last < first ? first : last;
        if (first <= 0) {
            return [0, 0, ''];
        }

        /* convert from one-based to zero-based */
        let start = first - 1;
        last -= 1;
        let end = last;

        /* from inclusive to semiinclusive */
        end++;

        /* type-specific actions */
        if (ch.type === VpcChunkType.Chars) {
            return this.charsBoundsForSet(sInput, start, end);
        } else if (ch.type === VpcChunkType.Items) {
            return this.itemsBoundsForSet(sInput, itemDel, start, end);
        } else if (ch.type === VpcChunkType.Lines) {
            return this.itemsBoundsForSet(sInput, '\n', start, end);
        } else if (ch.type === VpcChunkType.Words) {
            return this.wordsBoundsForSet(sInput, start, end);
        } else {
            throw makeVpcScriptErr(`5:|unknown chunk type ${ch.type}`);
        }
    }

    /**
     * sort a container by chunks.
     * text sorting (default), compares text, not case sensitive.
     * numeric sorting, interpret as numbers, e.g. 10 sorts after 2.
     * international sorting, compares text using current locale.
     */
    static applySort(cont: WritableContainer, itemDel: string, type: VpcChunkType, sortType: SortType, ascend: boolean) {
        let splitBy: string;
        if (type === VpcChunkType.Chars) {
            splitBy = '';
        } else if (type === VpcChunkType.Items) {
            splitBy = itemDel;
        } else if (type === VpcChunkType.Lines) {
            splitBy = '\n';
        } else {
            throw makeVpcScriptErr(`5/|we don't currently support sorting by ${type}`);
        }

        let split = cont.getRawString().split(splitBy);
        let sorter: (a: string, b: string) => number;
        if (sortType === SortType.Numeric) {
            sorter = (a, b) => {
                /* don't use a different comparison if both inputs are numbers */
                /* that would be an inconsistent comparison */
                /* if there are some strings/some numbers in the array */
                let na = parseFloat(a);
                let nb = parseFloat(b);
                na = isFinite(na) ? na : Infinity;
                nb = isFinite(nb) ? nb : Infinity;
                return util512Sort([na, a.toLowerCase()], [nb, b.toLowerCase()]);
            };
        } else if (sortType === SortType.Text) {
            sorter = (a, b) => {
                a = a.toLowerCase();
                b = b.toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            };
        } else if (sortType === SortType.International) {
            sorter = (a, b) => {
                return a.localeCompare(b);
            };
        } else {
            throw makeVpcScriptErr(`5.|Don't yet support sorting by style ${sortType}`);
        }

        split.sort(sorter);
        if (!ascend) {
            split.reverse();
        }

        let result = split.join(splitBy);
        cont.splice(0, cont.len(), result);
    }

    /**
     * count chunks, e.g.
     * 'put the number of words in x into y'
     */
    static applyCount(sInput: string, itemDel: string, type: VpcChunkType, isPublicCall: boolean) {
        let self = new ChunkResolution();

        /* in the public interface, change behavior to be
        closer(still not 100% match) to emulator */
        if (isPublicCall && sInput === '' && (type === VpcChunkType.Items || VpcChunkType.Lines)) {
            return 0;
        }

        if (type === VpcChunkType.Chars) {
            return sInput.length;
        } else if (type === VpcChunkType.Items) {
            return self.getPositionsTable(sInput, self.regexpForDelim(itemDel), false).length;
        } else if (type === VpcChunkType.Lines) {
            return self.getPositionsTable(sInput, /\n/g, false).length;
        } else if (type === VpcChunkType.Words) {
            return self.getPositionsTable(sInput, new RegExp('(\\n| )+', 'g'), true).length;
        } else {
            throw makeVpcScriptErr(`5-|unknown chunk type ${type}`);
        }
    }

    /**
     * calls getBoundsForGet
     */
    static resolveBoundsForGet(s: string, itemDel: string, chunk: RequestedChunk) {
        let me = new ChunkResolution();
        return me.getBoundsForGet(s, itemDel, chunk);
    }

    /**
     * calls getBoundsForGet and retrieves the text from a container
     */
    static applyRead(readContainer: ReadableContainer, chunk: O<RequestedChunk>, itemDel: string): string {
        if (chunk) {
            let s = readContainer.getRawString();
            let me = new ChunkResolution();
            let bounds = me.getBoundsForGet(s, itemDel, chunk);
            if (bounds) {
                return s.substring(bounds[0], bounds[1]);
            } else {
                return '';
            }
        } else {
            return readContainer.getRawString();
        }
    }

    /**
     * apply a modification like 'add 1 to item 3 of x'
     */
    static applyModify(cont: WritableContainer, chunk: O<RequestedChunk>, itemDel: string, fn: (s: string) => string) {
        if (chunk) {
            /* confirmed in original product that modify uses "set" bounds not "get" bounds */
            /* so "multiply line 300 of x" extends the contents of x if necessary */
            let s = cont.getRawString();
            let me = new ChunkResolution();
            let bounds = me.getBoundsForSet(s, itemDel, chunk);
            let sInput = s.substring(bounds[0], bounds[1]);
            let result = bounds[2] + fn(sInput);
            cont.splice(bounds[0], bounds[1] - bounds[0], result);
        } else {
            let s = cont.getRawString();
            let news = fn(s);
            cont.splice(0, cont.len(), news);
        }
    }

    /**
     * apply a put like 'put "abc" into line x of y'
     */
    static applyPut(
        cont: WritableContainer,
        chunk: O<RequestedChunk>,
        itemDel: string,
        news: string,
        prep: VpcChunkPreposition
    ): void {
        if (chunk) {
            let s = cont.getRawString();
            let me = new ChunkResolution();
            let bounds = me.getBoundsForSet(s, itemDel, chunk);
            if (prep === VpcChunkPreposition.Into || (bounds[2] && bounds[2].length)) {
                /* it's a brand new item, adding 'before' or 'after' isn't applicable */
                let result = bounds[2] + news;
                cont.splice(bounds[0], bounds[1] - bounds[0], result);
            } else if (prep === VpcChunkPreposition.After) {
                cont.splice(bounds[1], 0, news);
            } else if (prep === VpcChunkPreposition.Before) {
                cont.splice(bounds[0], 0, news);
            } else {
                throw makeVpcScriptErr(`5,|unknown preposition ${prep}`);
            }
        } else {
            let result: string;
            if (prep === VpcChunkPreposition.After) {
                let prevs = cont.isDefined() ? cont.getRawString() : '';
                result = prevs + news;
            } else if (prep === VpcChunkPreposition.Before) {
                let prevs = cont.isDefined() ? cont.getRawString() : '';
                result = news + prevs;
            } else if (prep === VpcChunkPreposition.Into) {
                result = news;
            } else {
                throw makeVpcScriptErr(`5+|unknown preposition ${prep}`);
            }

            cont.setAll(result);
        }
    }
}

/**
 * a requested chunk from a script.
 */
export class RequestedChunk extends VpcIntermedValBase {
    type = VpcChunkType.Chars;
    first: number;
    last: O<number>;
    ordinal: O<OrdinalOrPosition>;
    constructor(first: number) {
        super();
        this.first = first;
    }

    /**
     * get a copy of this structure.
     */
    getClone() {
        let other = new RequestedChunk(this.first);
        other.type = this.type;
        other.first = this.first;
        other.last = this.last;
        other.ordinal = this.ordinal;
        return other;
    }

    /**
     * an index must be a valid integer
     */
    confirmValidIndex(v: VpcVal, chunktype: string, tmpArr: [boolean, any]) {
        checkThrow(v && v.isVpcVal, `8p|internal error in RuleHChunk`);
        checkThrow(v.isItInteger(), `8o|when getting ${chunktype}, need to provide an integer but got ${v.readAsString()}`);

        let asInt = v.readAsStrictInteger(tmpArr);
        checkThrow(
            asInt >= 0,
            longstr(`8n|when getting ${chunktype}, need to provide
             a number >= 0 but got ${v.readAsString()}`)
        );

        return asInt;
    }
}
