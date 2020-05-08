
/* auto */ import { VpcIntermedValBase, VpcVal } from './vpcVal';
/* auto */ import { ReadableContainer, WritableContainer } from './vpcUtils';
/* auto */ import { OrdinalOrPosition, VpcChunkPreposition, VpcGranularity, checkThrow, checkThrowEq, findPositionFromOrdinalOrPosition } from './vpcEnums';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertTrue, ensureDefined } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, longstr } from './../../ui512/utils/util512';
/* auto */ import { largeArea } from './../../ui512/drawtext/ui512DrawTextClasses';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
   Places where we need chunks:
    Note: we treat "the selection" as a chunk, since it is one.

   READING (any expression context)          put char 3 to 5 of x into y
   PUT                                       put x into char 3 to 5 of y
   MODIFY                                    add 1 to char 3 to 5 of y
   PROPERTY                                  set the textsize of char 3 to 5 of y to 12



 */

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
const ChunkResolution = /* static class */ {
    /**
     * make a table of positions where items start
     * positions are 0-based
     * "a,bb,c" -> [0, 2, 5]
     */
    _getPositionsTable(s: string, re: RegExp, isWords: boolean): number[] {
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
    },

    /**
     * if the script has said something like
     * set the itemDel to "?"
     * make sure it is one-character and that the regex is escaped
     */
    _regexpForDelim(delim: string) {
        checkThrowEq(1, delim.length, '8m|delim should be length 1 but got', delim);
        let escaped = Util512.escapeForRegex(delim);
        return new RegExp(escaped, 'g');
    },

    /**
     * get positions of the chunk, for chars.
     * return semi-inclusive bounds [start, end)
     */
    _charsBoundsForGet(sInput: string, start: number, end: number): O<[number, number]> {
        if (start >= sInput.length) {
            return undefined;
        } else {
            end = Math.min(end, sInput.length);
            return [start, end];
        }
    },

    /**
     * get positions of the chunk, for items.
     * return semi-inclusive bounds [start, end)
     */
    _itemsBoundsForGet(sInput: string, delim: string, start: number, end: number): O<[number, number]> {
        let table = this._getPositionsTable(sInput, this._regexpForDelim(delim), false);
        if (start >= table.length) {
            return undefined;
        } else {
            let firstchar = table[start];
            let lastchar = end >= table.length ? sInput.length : table[end] - 1;
            return [firstchar, lastchar];
        }
    },

    /**
     * get positions of the chunk, for words.
     * confirmed in emulator: only spaces and newlines separate words, not punctuation.
     * return semi-inclusive bounds [start, end)
     */
    _wordsBoundsForGet(sInput: string, start: number, end: number): O<[number, number]> {
        let table = this._getPositionsTable(sInput, new RegExp('(\\n| )+', 'g'), true);
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
    },

    /**
     * when you say put "abc" into char x to y of z, which positions should be replaced with "abc"?
     */
    _charsBoundsForSet(sInput: string, start: number, end: number): any {
        if (start >= sInput.length) {
            return [sInput.length, sInput.length, ''];
        } else {
            end = Math.min(end, sInput.length);
            return [start, end, ''];
        }
    },

    /**
     * when you say put "abc" into item x to y of z, which positions should be replaced with "abc"?
     */
    _itemsBoundsForSet(sInput: string, delim: string, start: number, end: number): any {
        let table = this._getPositionsTable(sInput, this._regexpForDelim(delim), false);
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
    },

    /**
     * when you say put "abc" into word x to y of z, which positions should be replaced with "abc"?
     */
    _wordsBoundsForSet(sInput: string, start: number, end: number): any {
        let boundsGet = this._wordsBoundsForGet(sInput, start, end);
        if (boundsGet === undefined) {
            return [sInput.length, sInput.length, ''];
        } else {
            return [boundsGet[0], boundsGet[1], ''];
        }
    },

    /**
     * we've been asked to get item x to y of z.
     * return semi-inclusive bounds [start, end)
     */
    _getBoundsForGet(s: string, itemDel: string, ch: RequestedChunk): O<[number, number]> {
        let first = ch.first555;
        let last = ch.last555;
        if (ch.ordinal555 !== undefined) {
            let count = ChunkResolutionApplication.applyCount(s, itemDel, ch.type555, false);
            let maybeFirst = findPositionFromOrdinalOrPosition(ch.ordinal555, 0, 1, count);
            if (maybeFirst === undefined) {
                return undefined;
            } else {
                first = maybeFirst;
            }

            last = first;
        }

        if (ch.type555 === VpcGranularity.Chars && last !== undefined && last < first) {
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
        if (ch.type555 === VpcGranularity.Chars) {
            return this._charsBoundsForGet(s, start, end);
        } else if (ch.type555 === VpcGranularity.Items) {
            return this._itemsBoundsForGet(s, itemDel, start, end);
        } else if (ch.type555 === VpcGranularity.Lines) {
            return this._itemsBoundsForGet(s, '\n', start, end);
        } else if (ch.type555 === VpcGranularity.Words) {
            return this._wordsBoundsForGet(s, start, end);
        } else {
            checkThrow(false, `5<|unknown chunk type ${ch.type555}`);
        }
    },

    /**
     * we've been asked to get item x to y of z.
     * return semi-inclusive bounds [start, end)
     */
    _getBoundsForSet(sInput: string, itemDel: string, ch: RequestedChunk): [number, number, string] {
        let first = ch.first555;
        let last = ch.last555;
        if (ch.ordinal555 !== undefined) {
            let count = ChunkResolutionApplication.applyCount(sInput, itemDel, ch.type555, false);
            first = ensureDefined(findPositionFromOrdinalOrPosition(ch.ordinal555, 0, 1, largeArea), 'too big an index');
            last = first;
        }

        assertTrue(first !== null && first !== undefined && last !== null, '5;|invalid first or last');
        if (ch.type555 === VpcGranularity.Chars && last !== undefined && last < first) {
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
        if (ch.type555 === VpcGranularity.Chars) {
            return this._charsBoundsForSet(sInput, start, end);
        } else if (ch.type555 === VpcGranularity.Items) {
            return this._itemsBoundsForSet(sInput, itemDel, start, end);
        } else if (ch.type555 === VpcGranularity.Lines) {
            return this._itemsBoundsForSet(sInput, '\n', start, end);
        } else if (ch.type555 === VpcGranularity.Words) {
            return this._wordsBoundsForSet(sInput, start, end);
        } else {
            checkThrow(false, `5:|unknown chunk type ${ch.type555}`);
        }
    },

    /**
     * resolve the chunk, getting start+end positions
     * remember to adjust the results based on parent.startPos!!!
     */
    doResolveOne(
        request: RequestedChunk,
        parent: ResolvedChunk,
        itemDel: string,
        news: O<string>,
        prep: O<VpcChunkPreposition>
    ): O<ResolvedChunk> {
        let unformatted = parent.container.getRawString();
        unformatted = unformatted.substring(parent.startPos, parent.endPos);
        let retbounds: O<[number, number]>;
        if (request.canModify) {
            let bounds = this._getBoundsForSet(unformatted, itemDel, request);
            news = news ?? '';
            let writeParentContainer = parent.container as WritableContainer;
            if (prep === VpcChunkPreposition.Into || (bounds[2] && bounds[2].length)) {
                /* it's a brand new item, adding 'before' or 'after' isn't applicable */
                let result = bounds[2] + news;
                writeParentContainer.splice(parent.startPos + bounds[0], bounds[1] - bounds[0], result);
                retbounds = [bounds[0], result.length];
            } else if (prep === VpcChunkPreposition.After) {
                writeParentContainer.splice(parent.startPos + bounds[1], 0, news);
                retbounds = [bounds[1], bounds[1] + news.length];
            } else if (prep === VpcChunkPreposition.Before) {
                writeParentContainer.splice(parent.startPos + bounds[0], 0, news);
                retbounds = [0, news.length];
            } else {
                checkThrow(false, `5,|unknown preposition ${prep}`);
            }
        } else {
            assertTrue(!news, '');
            assertTrue(!prep || prep === VpcChunkPreposition.Into, '');
            retbounds = this._getBoundsForGet(unformatted, itemDel, request);
        }

        if (retbounds) {
            return new ResolvedChunk(parent.container, parent.startPos + retbounds[0], parent.startPos + retbounds[1]);
        } else {
            return undefined;
        }
    }
};

/* don't let scopes go backwards.
    only char after char seen.
    only char or word after word seen.
    original product had weird behavior we don't want to replicate.*/
class DecreasingScopeChecker {
    seenWord = false;
    seenChar = false;
    onSeeScope(g: VpcGranularity) {
        if (g === VpcGranularity.Chars) {
            this.seenChar = true;
        } else if (g === VpcGranularity.Words) {
            checkThrow(
                !this.seenChar,
                longstr(`we don't yet support a word being the child
                of a char, please use an intermediate variable.`)
            );
            this.seenWord = true;
        } else {
            checkThrow(
                !this.seenChar && !this.seenWord,
                longstr(`we don't yet support 
                    a line or item being the child of a char or word.
                    please use an intermediate variable.`)
            );
        }
    }
}

export const ChunkResolutionApplication = /* static class */ {
    applyPut(cont: WritableContainer, chunk: O<RequestedChunk>, itemDel: string, news: string, prep: VpcChunkPreposition): void {
        if (!chunk) {
            /* needs to be handled separately,
            since we might be inserting into a never-before-seen variable */
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
                checkThrow(false, `5+|unknown preposition ${prep}`);
            }

            cont.setAll(result);
            return;
        }

        /* make parent objects */
        let resolved = new ResolvedChunk(cont, 0, cont.len());
        chunk.setCanModifyRecurse(true);
        let current: O<RequestedChunk> = chunk;
        let checker = new DecreasingScopeChecker();
        while (current) {
            checker.onSeeScope(current.type555);
            if (current.child) {
                /* narrow it down, add extra commas but not the real text */
                resolved = ensureDefined(
                    ChunkResolution.doResolveOne(current, resolved, itemDel, undefined, VpcChunkPreposition.Into),
                    ''
                );
            } else {
                /* insert the real text */
                resolved = ensureDefined(ChunkResolution.doResolveOne(current, resolved, itemDel, news, prep), '');
            }

            current = current.child;
        }
    },

    applyModify(cont: WritableContainer, chunk: O<RequestedChunk>, itemDel: string, fn: (s: string) => string) {
        if (!chunk) {
            /* needs to be handled separately,
            since we might be inserting into a never-before-seen variable */
            let s = cont.getRawString();
            let news = fn(s);
            cont.splice(0, cont.len(), news);
            return;
        }

        /* does it exist?
        if not, make it. (follow emulator) */
        let found = this.applyRead(cont, chunk, itemDel);
        if (!found) {
            this.applyPut(cont, chunk, itemDel, '', VpcChunkPreposition.Into);
            found = this.applyRead(cont, chunk, itemDel);
        }

        checkThrow(found, 'could not modify');
        let foundContent = cont.getRawString().substring(found.startPos, found.endPos);
        let newContent = fn(foundContent);
        cont.splice(found.startPos, found.endPos - found.startPos, newContent);
    },

    applyRead(cont: ReadableContainer, chunk: O<RequestedChunk>, itemDel: string): O<ResolvedChunk> {
        /* make parent objects */
        let resolved: O<ResolvedChunk> = new ResolvedChunk(cont, 0, cont.len());
        if (!chunk) {
            chunk = new RequestedChunk(1);
            chunk.type555 = VpcGranularity.Chars;
            chunk.last555 = cont.len();
        }

        chunk.setCanModifyRecurse(false);
        let current: O<RequestedChunk> = chunk;
        let checker = new DecreasingScopeChecker();
        while (current && resolved) {
            checker.onSeeScope(current.type555);
            resolved = ChunkResolution.doResolveOne(current, resolved, itemDel, undefined, VpcChunkPreposition.Into);
            current = current.child;
        }

        return resolved;
    },

    applyReadToString(cont: ReadableContainer, chunk: O<RequestedChunk>, itemDel: string) {
        let resolved = this.applyRead(cont, chunk, itemDel);
        return resolved ? resolved.container.getRawString().substring(resolved.startPos, resolved.endPos) : '';
    },

    /**
     * count chunks, e.g.
     * 'put the number of words in x into y'
     */
    applyCount(sInput: string, itemDel: string, type: VpcGranularity, isPublicCall: boolean) {
        /* in the public interface, change behavior to be
          closer (still not 100% match) to emulator */
        if (isPublicCall && sInput === '' && (type === VpcGranularity.Items || VpcGranularity.Lines)) {
            return 0;
        }

        if (type === VpcGranularity.Chars) {
            return sInput.length;
        } else if (type === VpcGranularity.Items) {
            return ChunkResolution._getPositionsTable(sInput, ChunkResolution._regexpForDelim(itemDel), false).length;
        } else if (type === VpcGranularity.Lines) {
            return ChunkResolution._getPositionsTable(sInput, /\n/g, false).length;
        } else if (type === VpcGranularity.Words) {
            return ChunkResolution._getPositionsTable(sInput, new RegExp('(\\n| )+', 'g'), true).length;
        } else {
            checkThrow(false, `5-|unknown chunk type ${type}`);
        }
    }
};

/**
 * a requested chunk from a script.
 */
export class RequestedChunk extends VpcIntermedValBase {
    type555 = VpcGranularity.Chars;
    first555: number;
    last555: O<number>;
    ordinal555: O<OrdinalOrPosition>;
    sortFirst = false;
    canModify = false;
    child: O<RequestedChunk>;
    constructor(first: number) {
        super();
        this.first555 = first;
    }

    /**
     * get a copy of this structure
     */
    getClone() {
        let other = new RequestedChunk(this.first555);
        other.type555 = this.type555;
        other.first555 = this.first555;
        other.last555 = this.last555;
        other.ordinal555 = this.ordinal555;
        other.canModify = this.canModify;
        other.child = this.child?.getClone();
        return other;
    }

    /**
     * recursive setcanmodify
     */
    setCanModifyRecurse(v: boolean) {
        this.canModify = v;
        let current = this.child;
        while (current) {
            current.canModify = v;
            current = current.child;
        }
    }

    /**
     * an index must be a valid integer
     */
    confirmValidIndex(v: VpcVal, granularity: string, tmpArr: [boolean, any]) {
        checkThrow(v instanceof VpcVal, `8p|internal error in RuleHChunk`);
        checkThrow(v.isItInteger(), `8o|when getting ${granularity}, need to provide an integer but got ${v.readAsString()}`);

        let asInt = v.readAsStrictInteger(tmpArr);
        checkThrow(
            asInt >= 0,
            longstr(`8n|when getting ${granularity}, need to provide
             a number >= 0 but got ${v.readAsString()}`)
        );

        return asInt;
    }
}

/**
 * a resolved chunk.
 */
export class ResolvedChunk {
    constructor(public container: ReadableContainer, public startPos: number, public endPos: number) {}
}
