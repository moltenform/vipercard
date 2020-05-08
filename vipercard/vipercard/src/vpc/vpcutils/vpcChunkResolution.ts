
/* auto */ import { VpcIntermedValBase, VpcVal } from './vpcVal';
/* auto */ import { ReadableContainer, WritableContainer, WritableContainerSimpleFmtText } from './vpcUtils';
/* auto */ import { OrdinalOrPosition, VpcChunkPreposition, VpcGranularity, checkThrow, checkThrowEq, checkThrowInternal, findPositionFromOrdinalOrPosition } from './vpcEnums';
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
        let first = ch.first;
        let last = ch.last;
        if (ch.ordinal !== undefined) {
            let count = ChunkResolutionApplication.applyCount(s, itemDel, ch.granularity, false);
            let maybeFirst = findPositionFromOrdinalOrPosition(ch.ordinal, 0, 1, count);
            if (maybeFirst === undefined) {
                return undefined;
            } else {
                first = maybeFirst;
            }

            last = first;
        }

        checkThrow(first >= 0 && (!last || last >= 0), "do not allow negative")
        if (ch.granularity === VpcGranularity.Chars && last !== undefined && last < first) {
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
        if (ch.granularity === VpcGranularity.Chars) {
            return this._charsBoundsForGet(s, start, end);
        } else if (ch.granularity === VpcGranularity.Items) {
            return this._itemsBoundsForGet(s, itemDel, start, end);
        } else if (ch.granularity === VpcGranularity.Lines) {
            return this._itemsBoundsForGet(s, '\n', start, end);
        } else if (ch.granularity === VpcGranularity.Words) {
            return this._wordsBoundsForGet(s, start, end);
        } else {
            checkThrow(false, `5<|unknown chunk granularity ${ch.granularity}`);
        }
    },

    /**
     * we've been asked to get item x to y of z.
     * return semi-inclusive bounds [start, end)
     */
    _getBoundsForSet(sInput: string, itemDel: string, ch: RequestedChunk): [number, number, string] {
        let first = ch.first;
        let last = ch.last;
        if (ch.ordinal !== undefined) {
            let upperBound = largeArea
            if (
            ch.ordinal===OrdinalOrPosition.Last||ch.ordinal===OrdinalOrPosition.Middle||ch.ordinal===OrdinalOrPosition.Any) {
                upperBound = ChunkResolutionApplication.applyCount(sInput, itemDel, ch.granularity, false);
            }
            
            first = ensureDefined(findPositionFromOrdinalOrPosition(ch.ordinal, 0, 1, upperBound), 'too big an index');
            last = first;
        }

        checkThrow(first >= 0 && (!last || last >= 0), "do not allow negative")
        assertTrue(first !== null && first !== undefined && last !== null, '5;|invalid first or last');
        if (ch.granularity === VpcGranularity.Chars && last !== undefined && last < first) {
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
        if (ch.granularity === VpcGranularity.Chars) {
            return this._charsBoundsForSet(sInput, start, end);
        } else if (ch.granularity === VpcGranularity.Items) {
            return this._itemsBoundsForSet(sInput, itemDel, start, end);
        } else if (ch.granularity === VpcGranularity.Lines) {
            return this._itemsBoundsForSet(sInput, '\n', start, end);
        } else if (ch.granularity === VpcGranularity.Words) {
            return this._wordsBoundsForSet(sInput, start, end);
        } else {
            checkThrow(false, `5:|unknown chunk type ${ch.granularity}`);
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
        prep: O<VpcChunkPreposition>,
        isWriteContext:boolean,
        okToAppend=true
    ): O<ResolvedChunk> {
        let unformatted = parent.container.getRawString();
        unformatted = unformatted.substring(parent.startPos, parent.endPos);
        let retbounds: O<[number, number]>;
        if (isWriteContext) {
            let bounds = this._getBoundsForSet(unformatted, itemDel, request);
            let writeParentContainer = parent.container as WritableContainer;
            if (news === undefined) {
                /* still add our commas to the end */
                let fakeNewS = ''
                let result = fakeNewS + okToAppend ? bounds[2] : '';
                writeParentContainer.splice(parent.startPos + bounds[0], 0 /* delete nothing */, result);
                retbounds = [bounds[0],  bounds[1]+ result.length];
            } else if (prep === VpcChunkPreposition.Into || (bounds[2] && bounds[2].length)) {
                if (!okToAppend) {
                    /* ignore adding the newones */
                    bounds[2] = ''
                }
                /* it's a brand new item, adding 'before' or 'after' isn't applicable */
                let result = bounds[2] + news;
                writeParentContainer.splice(parent.startPos + bounds[0], bounds[1] - bounds[0], result);
                retbounds = [bounds[0], bounds[0] + result.length];
            } else if (prep === VpcChunkPreposition.After) {
                writeParentContainer.splice(parent.startPos + bounds[1], 0, news);
                retbounds = [bounds[1], bounds[1] + news.length];
            } else if (prep === VpcChunkPreposition.Before) {
                writeParentContainer.splice(parent.startPos + bounds[0], 0, news);
                retbounds = [bounds[0], bounds[0] + news.length];
            } else {
                checkThrow(false, `5,|unknown preposition ${prep}`);
            }
        } else {
            assertTrue(!news, '');
            assertTrue(!prep || prep === VpcChunkPreposition.Into, '');
            retbounds = this._getBoundsForGet(unformatted, itemDel, request);
        }

        if (retbounds) {
            let ret = new ResolvedChunk(parent.container, parent.startPos + retbounds[0], parent.startPos + retbounds[1]);
            checkThrow(ret.startPos>=0 && ret.endPos>=0, "somehow got a negative")
            return ret
        } else {
            return undefined;
        }
    }
};

//~ /* don't let scopes go backwards.
    //~ only char after char seen.
    //~ only char or word after word seen.
    //~ original product had weird behavior we don't want to replicate.*/
//~ class DecreasingScopeChecker {
    //~ seenWord = false;
    //~ seenChar = false;
    //~ onSeeScope(g: VpcGranularity) {
        //~ if (g === VpcGranularity.Chars) {
            //~ this.seenChar = true;
        //~ } else if (g === VpcGranularity.Words) {
            //~ checkThrow(
                //~ !this.seenChar,
                //~ longstr(`we don't yet support a word being the child
                //~ of a char, please use an intermediate variable.`)
            //~ );
            //~ this.seenWord = true;
        //~ } else {
            //~ checkThrow(
                //~ !this.seenChar && !this.seenWord,
                //~ longstr(`we don't yet support 
                    //~ a line or item being the child of a char or word.
                    //~ please use an intermediate variable.`)
            //~ );
        //~ }
    //~ }
//~ }

/**
 * public interface for chunk resolution
 */
export const ChunkResolutionApplication = /* static class */ {
    /**
     * the original product has counter-intuitive behavior for put
     */
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

        chunk = this._rearrangeChunksToMatchOriginalProduct(chunk)

        /* make parent objects */
        let resolved = new ResolvedChunk(cont, 0, cont.len());
        let current: O<RequestedChunk> = chunk;
        let isTop = true
        //~ let checker = new DecreasingScopeChecker();
        while (current) {
            //~ checker.onSeeScope(current.type555);
            if (current.child) {
                /* narrow it down */
                resolved = ensureDefined(
                    ChunkResolution.doResolveOne(current, resolved, itemDel, undefined, VpcChunkPreposition.Into, true, true),
                    ''
                );
            } else {
                /* insert the real text */
                resolved = ensureDefined(ChunkResolution.doResolveOne(current, resolved, itemDel, news, prep, true, isTop), '');
            }

            isTop = false
            current = current.child;
        }
    },

    /**
     * warning: follows the same funky logic as put.
     */
    applyModify(cont: WritableContainer, chunk: O<RequestedChunk>, itemDel: string, fn: (s: string) => string) {
        if (!chunk) {
            /* needs to be handled separately,
            since we might be inserting into a never-before-seen variable */
            let s = cont.getRawString();
            let news = fn(s);
            cont.splice(0, cont.len(), news);
            return;
        }

        /* use a sentinel value to ensure we get the same results as a "put" */
        let marker = '\x01\x01~~internalvpcmarker~~\x01\x01'
        let unformatted = cont.getRawString()
        checkThrow(!unformatted.includes(marker), "cannot contain the string " + marker)
        this.applyPut(cont, chunk, itemDel, marker, VpcChunkPreposition.Into)
        
        /* now we look at the results and see where it got put! */
        let results = cont.getRawString()
        let index = results.indexOf(marker)
        checkThrow(index >= 0, "applyModify did not find marker")

        if (results.length - marker.length > unformatted.length) {
            /* the case where we had to insert commas and stuff afterwards */
            let newTxt = fn('')
            cont.splice(index, marker.length, newTxt)
        } else {
            /* go back to the original string and retrieve what was there */
            let targetLength = unformatted.length - (results.length - marker.length)
            let sourceText = unformatted.slice(index, index + targetLength) ?? ''
            let newTxt = fn(sourceText)
            cont.splice(index, marker.length, newTxt)
        }
    },

    /**
     * returns a ResolvedChunk, so you can use the bounds for things
     */
    applyRead(cont: ReadableContainer, chunk: O<RequestedChunk>, itemDel: string): O<ResolvedChunk> {
        /* make parent objects */
        let resolved: O<ResolvedChunk> = new ResolvedChunk(cont, 0, cont.len());
        if (!chunk) {
            return resolved
        }

        let current: O<RequestedChunk> = chunk;
        //~ let checker = new DecreasingScopeChecker();
        while (current && resolved) {
            //~ checker.onSeeScope(current.type555);
            resolved = ChunkResolution.doResolveOne(current, resolved, itemDel, '', VpcChunkPreposition.Into, false);
            current = current.child;
        }

        return resolved;
    },

    /**
     * helper that returns an unformatted string
     */
    applyReadToString(cont: ReadableContainer, chunk: O<RequestedChunk>, itemDel: string):string {
        let resolved = this.applyRead(cont, chunk, itemDel);
        return resolved ? resolved.container.getRawString().substring(resolved.startPos, resolved.endPos) : '';
    },

    /**
     * delete, which is a bit different from `put "" into`
     */
    applyDelete(cont: WritableContainer, chunk: RequestedChunk, itemDel: string) {
        if (chunk.granularity === VpcGranularity.Chars) {
            return this.applyPut(cont, chunk, itemDel, '', VpcChunkPreposition.Into)
        }

        /* use a sentinel value to get the same results as a "put" */
        let marker = '\x01\x01~~internalvpcmarker~~\x01\x01'
        let unformatted = cont.getRawString()
        checkThrow(!unformatted.includes(marker), "cannot contain the string " + marker)
        this.applyPut(cont, chunk, itemDel, marker, VpcChunkPreposition.Into)
        
        /* now we look at the results and see where it got put! */
        let results = cont.getRawString()
        let index = results.indexOf(marker)
        checkThrow(index >= 0, "applyModify did not find marker")

        if (results.length - marker.length > unformatted.length) {
            /* the case where we had to insert commas and stuff afterwards */
            return unformatted
        } else {
            /* go back to the original string and retrieve what was there */
            if (chunk.granularity === VpcGranularity.Words) {
                /* delete spaces - but not returns - after the marker */
                let i = index+marker.length
                while(i<results.length) {
                    if (results.charAt(i) !== ' ') {
                        break
                    }
                    i++
                }
                
                cont.splice(index, i - index, "")
            } else {
                checkThrow(false, "nyi")
            }
        }
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
            checkThrow(false, `5-|unknown chunk granularity ${type}`);
        }
    },

    /**
     * match the really weird behavior seen.
     * 1) first come, first serve, for each granularity
     * 2) regardless of order seen, sort in the order seen in enum VpcGranularity
     */
    _rearrangeChunksToMatchOriginalProduct(chunk:RequestedChunk) {
        /* simple case */
        if (!chunk.child) {
            return chunk
        }

        /* flatten it! the given order does not matter!!! 
        we'll helpfully use the fact that VpcGranularity #s are already in order,
        and index them into a list*/
        let max = VpcGranularity.__Max + 1
        let arr = Util512.repeat(max, undefined as O<RequestedChunk>)
        /* remember that it's first come, first serve */
        let current:O<RequestedChunk> = chunk
        while (current) {
            let key = current.granularity
            if (current.sortFirst) {
                checkThrowInternal(current.granularity === VpcGranularity.Chars, '')
                key = max
            }

            arr[key] = current
            current = current.child
        }

        /* reverse it so that higher ones are first */
        arr.reverse()

        let ret:O<RequestedChunk>
        let currentBuild:O<RequestedChunk>
        for (let i=0; i<arr.length; i++) {
            if (arr[i]){
                if (!currentBuild) {
                    currentBuild = arr[i]
                    ret = arr[i]
                } else {
                    currentBuild.child = arr[i]
                    currentBuild = arr[i]
                }
            }
        }
        /* be sure to overwrite the child here in case it used to have a child */
        if (currentBuild) {
            currentBuild.child = undefined
        }

        return ensureDefined(ret, "chunk dissapeared")
    }
};

/**
 * a requested chunk from a script.
 */
export class RequestedChunk extends VpcIntermedValBase {
    granularity = VpcGranularity.Chars;
    first: number;
    last: O<number>;
    ordinal: O<OrdinalOrPosition>;
    sortFirst = false;
    child: O<RequestedChunk>;
    constructor(first: number) {
        super();
        this.first = first;
    }

    /**
     * get a copy of this structure
     */
    getClone() {
        let other = new RequestedChunk(this.first);
        other.granularity = this.granularity;
        other.first = this.first;
        other.last = this.last;
        other.ordinal = this.ordinal;
        other.sortFirst = this.sortFirst;
        other.child = this.child?.getClone();
        return other;
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
