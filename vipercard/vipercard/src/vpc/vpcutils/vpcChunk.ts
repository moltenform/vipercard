
/* auto */ import { O, assertTrue, checkThrow, makeVpcScriptErr } from '../../ui512/utils/utilsAssert.js';
/* auto */ import { Util512, checkThrowEq, defaultSort } from '../../ui512/utils/utilsUI512.js';
/* auto */ import { OrdinalOrPosition, RequestedChunkTextPreposition, RequestedChunkType, SortStyle, getPositionFromOrdinalOrPosition } from '../../vpc/vpcutils/vpcEnums.js';
/* auto */ import { ReadableContainer, WritableContainer } from '../../vpc/vpcutils/vpcUtils.js';
/* auto */ import { VpcIntermedValBase, VpcVal } from '../../vpc/vpcutils/vpcVal.js';

export class ChunkResolution {
    protected getPositionsTable(s: string, regex: RegExp, isWords: boolean): number[] {
        let positions: number[] = [];
        if (!isWords || (s[0] !== ' ' && s[0] !== '\n')) {
            positions.push(0);
        }

        while (true) {
            let match = regex.exec(s);
            if (match) {
                let endofmatch = match.index + match[0].length;
                if (!isWords || endofmatch !== s.length) {
                    positions.push(endofmatch);
                }
            } else {
                break;
            }
        }

        return positions;
    }

    // return semi-inclusive bounds [start, end)
    protected charsBoundsForGet(sInput: string, start: number, end: number): O<[number, number]> {
        if (start >= sInput.length) {
            return undefined;
        } else {
            end = Math.min(end, sInput.length);
            return [start, end];
        }
    }

    protected regexpForDelim(delim: string) {
        checkThrowEq(1, delim.length, '8m|delim should be length 1 but got', delim);
        let escaped = Util512.escapeForRegex(delim);
        return new RegExp(escaped, 'g');
    }

    // return semi-inclusive bounds [start, end)
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

    // return semi-inclusive bounds [start, end)
    // checked in emulator: only spaces and newlines separate words, not punctuation.
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

    protected charsBoundsForSet(sInput: string, start: number, end: number): any {
        if (start >= sInput.length) {
            return [sInput.length, sInput.length, ''];
        } else {
            end = Math.min(end, sInput.length);
            return [start, end, ''];
        }
    }

    protected itemsBoundsForSet(sInput: string, delim: string, start: number, end: number): any {
        let table = this.getPositionsTable(sInput, this.regexpForDelim(delim), false);
        if (start >= table.length) {
            // add trailing commas!
            let howmanytoadd = 1 + (start - table.length);
            let trailingCommas = Util512.repeat(howmanytoadd, delim).join('');
            return [sInput.length + howmanytoadd, sInput.length + howmanytoadd, trailingCommas];
        } else {
            let firstchar = table[start];
            let lastchar = end >= table.length ? sInput.length : table[end] - 1;
            return [firstchar, lastchar, ''];
        }
    }

    protected wordsBoundsForSet(sInput: string, start: number, end: number): any {
        let boundsGet = this.wordsBoundsForGet(sInput, start, end);
        if (boundsGet === undefined) {
            return [sInput.length, sInput.length, ''];
        } else {
            return [boundsGet[0], boundsGet[1], ''];
        }
    }

    protected getBoundsForGet(s: string, itemDel: string, ch: RequestedChunk): O<[number, number]> {
        let first = ch.first;
        let last = ch.last;
        if (ch.ordinal !== undefined) {
            let count = ChunkResolution.applyCount(s, itemDel, ch.type, false);
            first = getPositionFromOrdinalOrPosition(ch.ordinal, 0, 1, count);
            last = first;
        }

        if (ch.type === RequestedChunkType.Chars && last !== undefined && last < first) {
            // checked in emulator, behavior for chars differs here for some reason.
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

        // convert from one-based to zero-based
        let start = first - 1;
        let end = (last -= 1);

        // from inclusive to semiinclusive
        end++;

        // type-specific actions
        if (ch.type === RequestedChunkType.Chars) {
            return this.charsBoundsForGet(s, start, end);
        } else if (ch.type === RequestedChunkType.Items) {
            return this.itemsBoundsForGet(s, itemDel, start, end);
        } else if (ch.type === RequestedChunkType.Lines) {
            return this.itemsBoundsForGet(s, '\n', start, end);
        } else if (ch.type === RequestedChunkType.Words) {
            return this.wordsBoundsForGet(s, start, end);
        } else {
            throw makeVpcScriptErr(`5<|unknown chunk type ${ch.type}`);
        }
    }

    protected getBoundsForSet(sInput: string, itemDel: string, ch: RequestedChunk): [number, number, string] {
        let first = ch.first;
        let last = ch.last;
        if (ch.ordinal !== undefined) {
            let count = ChunkResolution.applyCount(sInput, itemDel, ch.type, false);
            first = getPositionFromOrdinalOrPosition(ch.ordinal, 0, 1, count);
            last = first;
        }

        assertTrue(first !== null && first !== undefined && last !== null, '5;|invalid first or last');
        if (ch.type === RequestedChunkType.Chars && last !== undefined && last < first) {
            // checked in emulator, behavior for chars differs here for some reason.
            return [first - 1, first - 1, ''];
        }

        last = last === undefined ? first : last;
        last = last < first ? first : last;
        if (first <= 0) {
            return [0, 0, ''];
        }

        // convert from one-based to zero-based
        let start = first - 1;
        let end = (last -= 1);

        // from inclusive to semiinclusive
        end++;

        // type-specific actions
        if (ch.type === RequestedChunkType.Chars) {
            return this.charsBoundsForSet(sInput, start, end);
        } else if (ch.type === RequestedChunkType.Items) {
            return this.itemsBoundsForSet(sInput, itemDel, start, end);
        } else if (ch.type === RequestedChunkType.Lines) {
            return this.itemsBoundsForSet(sInput, '\n', start, end);
        } else if (ch.type === RequestedChunkType.Words) {
            return this.wordsBoundsForSet(sInput, start, end);
        } else {
            throw makeVpcScriptErr(`5:|unknown chunk type ${ch.type}`);
        }
    }

    static applySort(
        cont: WritableContainer,
        itemDel: string,
        type: RequestedChunkType,
        sorttype: SortStyle,
        ascend: boolean
    ) {
        let splitBy: string;
        if (type === RequestedChunkType.Chars) {
            splitBy = '';
        } else if (type === RequestedChunkType.Items) {
            splitBy = itemDel;
        } else if (type === RequestedChunkType.Lines) {
            splitBy = '\n';
        } else {
            throw makeVpcScriptErr(`5/|we don't currently support sorting by ${type}`);
        }

        let split = cont.getRawString().split(splitBy);
        let sorter: (a: string, b: string) => number;
        if (sorttype === SortStyle.numeric) {
            sorter = (a, b) => {
                // don't use a different comparison if both inputs are numbers
                // that would be an inconsistent comparison
                // if there are some strings/some numbers in the array
                let na = parseFloat(a);
                let nb = parseFloat(b);
                na = isFinite(na) ? na : Infinity;
                nb = isFinite(nb) ? nb : Infinity;
                return defaultSort([na, a.toLowerCase()], [nb, b.toLowerCase()]);
            };
        } else if (sorttype === SortStyle.text) {
            sorter = (a, b) => {
                a = a.toLowerCase();
                b = b.toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            };
        } else if (sorttype === SortStyle.international) {
            sorter = (a, b) => {
                return a.localeCompare(b);
            };
        } else {
            throw makeVpcScriptErr(`5.|Don't yet support sorting by style ${sorttype}`);
        }

        split.sort(sorter);
        if (!ascend) {
            split.reverse();
        }

        let result = split.join(splitBy);
        cont.splice(0, cont.len(), result);
    }

    static applyCount(sInput: string, itemDel: string, type: RequestedChunkType, isPublicCall: boolean) {
        let self = new ChunkResolution();
        // in the public interface, change behavior to be closer(still not 100% match) to emulator
        if (isPublicCall && sInput === '' && (type === RequestedChunkType.Items || RequestedChunkType.Lines)) {
            return 0;
        }

        if (type === RequestedChunkType.Chars) {
            return sInput.length;
        } else if (type === RequestedChunkType.Items) {
            return self.getPositionsTable(sInput, self.regexpForDelim(itemDel), false).length;
        } else if (type === RequestedChunkType.Lines) {
            return self.getPositionsTable(sInput, new RegExp('\n', 'g'), false).length;
        } else if (type === RequestedChunkType.Words) {
            return self.getPositionsTable(sInput, new RegExp('(\\n| )+', 'g'), true).length;
        } else {
            throw makeVpcScriptErr(`5-|unknown chunk type ${type}`);
        }
    }

    static resolveBoundsForGet(s: string, itemDel: string, chunk: RequestedChunk) {
        let me = new ChunkResolution();
        return me.getBoundsForGet(s, itemDel, chunk);
    }

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

    static applyModify(cont: WritableContainer, chunk: O<RequestedChunk>, itemDel: string, fn: (s: string) => string) {
        if (chunk) {
            // confirmed in emulator that modify uses "set" bounds not "get" bounds
            // so "multiply line 300 of x" extends the contents of x if necessary
            let s = cont.getRawString();
            let me = new ChunkResolution();
            let bounds = me.getBoundsForSet(s, itemDel, chunk);
            let sinput = s.substring(bounds[0], bounds[1]);
            let result = bounds[2] + fn(sinput);
            cont.splice(bounds[0], bounds[1] - bounds[0], result);
        } else {
            let s = cont.getRawString();
            let news = fn(s);
            cont.splice(0, cont.len(), news);
        }
    }

    static applyPut(
        cont: WritableContainer,
        chunk: O<RequestedChunk>,
        itemDel: string,
        news: string,
        prep: RequestedChunkTextPreposition
    ): void {
        if (chunk) {
            let s = cont.getRawString();
            let me = new ChunkResolution();
            let bounds = me.getBoundsForSet(s, itemDel, chunk);
            if (prep === RequestedChunkTextPreposition.into || (bounds[2] && bounds[2].length)) {
                // it's a brand new item, adding 'before' or 'after' isn't applicable
                let result = bounds[2] + news;
                cont.splice(bounds[0], bounds[1] - bounds[0], result);
            } else if (prep === RequestedChunkTextPreposition.after) {
                cont.splice(bounds[1], 0, news);
            } else if (prep === RequestedChunkTextPreposition.before) {
                cont.splice(bounds[0], 0, news);
            } else {
                throw makeVpcScriptErr(`5,|unknown preposition ${prep}`);
            }
        } else {
            let result: string;
            if (prep === RequestedChunkTextPreposition.after) {
                let prevs = cont.isDefined() ? cont.getRawString() : '';
                result = prevs + news;
            } else if (prep === RequestedChunkTextPreposition.before) {
                let prevs = cont.isDefined() ? cont.getRawString() : '';
                result = news + prevs;
            } else if (prep === RequestedChunkTextPreposition.into) {
                result = news;
            } else {
                throw makeVpcScriptErr(`5+|unknown preposition ${prep}`);
            }

            cont.setAll(result);
        }
    }
}

export class RequestedChunk extends VpcIntermedValBase {
    isRequestedChunk = true;
    first: number;
    last: O<number>;
    type: RequestedChunkType = RequestedChunkType.Chars;
    ordinal: O<OrdinalOrPosition>;

    constructor(first: number) {
        super();
        this.first = first;
    }

    getClone() {
        let other = new RequestedChunk(this.first);
        other.first = this.first;
        other.last = this.last;
        other.type = this.type;
        other.ordinal = this.ordinal;
        return other;
    }

    confirmValidIndex(v: VpcVal, chunktype: string, tmpArr: [boolean, any]) {
        checkThrow(v && v.isVpcVal, `8p|internal error in RuleHChunk`);
        checkThrow(
            v.isItInteger(),
            `8o|when getting ${chunktype}, need to provide an integer but got ${v.readAsString()}`
        );
        let asInt = v.readAsStrictInteger(tmpArr);
        checkThrow(
            asInt >= 0,
            `8n|when getting ${chunktype}, need to provide a number >= 0 but got ${v.readAsString()}`
        );
        return asInt;
    }
}
