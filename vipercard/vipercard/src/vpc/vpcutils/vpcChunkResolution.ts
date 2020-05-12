
/* auto */ import { VpcIntermedValBase } from './vpcVal';
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
    _getPositionsTable(s: string, type:VpcGranularity, itemDel:string): number[] {
        let re = ChunkResolution.getRegex(type, itemDel)
        let isWords = type===VpcGranularity.Words
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
     * what is regex for this type
     */
    getRegex(type: VpcGranularity, delim: string):RegExp {
        if (type === VpcGranularity.Items) {
            /*
            if the script has said something like
            set the itemDel to "?"
            make sure it is one-character and that the regex is escaped
            */
            checkThrowEq(1, delim.length, '8m|delim should be length 1 but got', delim);
            let escaped = Util512.escapeForRegex(delim);
            return new RegExp(escaped, 'g');
        } else if (type === VpcGranularity.Lines) {
            return /\n/g
        } else if (type === VpcGranularity.Words) {
            return new RegExp('(\\n| )+', 'g')
        } else {
            checkThrowInternal(false, 'no regex for this granularity')
        }
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
        let table = this._getPositionsTable(sInput, VpcGranularity.Items, delim);
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
    _wordsBoundsForGet(sInput: string, start: number, end: number, itemDel:string): O<[number, number]> {
        let table = this._getPositionsTable(sInput, VpcGranularity.Words, itemDel);
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
        let table = this._getPositionsTable(sInput, VpcGranularity.Items, delim);
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
    _wordsBoundsForSet(sInput: string, start: number, end: number, itemDel:string): any {
        let boundsGet = this._wordsBoundsForGet(sInput, start, end, itemDel);
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
            return this._wordsBoundsForGet(s, start, end, itemDel);
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
            return this._wordsBoundsForSet(sInput, start, end, itemDel);
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
                //~ let result = fakeNewS + okToAppend ? bounds[2] : '';
                okToAppend = true
                let result = fakeNewS + okToAppend ? bounds[2] : '';
                let insertionPoint = parent.startPos + bounds[0]
                if (bounds[2]) {
                    insertionPoint = Math.min(parent.endPos, insertionPoint)
                }
                writeParentContainer.splice(insertionPoint, 0 /* delete nothing */, result);
                if (bounds[2]) {
                    retbounds = [-parent.startPos + insertionPoint + result.length, -parent.startPos + insertionPoint + result.length];
                } else {
                    retbounds = [-parent.startPos + insertionPoint, bounds[1]+ result.length];
                }
            } else if (prep === VpcChunkPreposition.Into || (bounds[2] && bounds[2].length)) {
                //~ if (!okToAppend) {
                    //~ /* ignore adding the newones */
                    //~ bounds[2] = ''
                //~ }
                /* it's a brand new item, adding 'before' or 'after' isn't applicable */
                let result = bounds[2] + news;
                let insertionPoint = parent.startPos + bounds[0]
                if (bounds[2] && !okToAppend) {
                    insertionPoint = Math.min(parent.endPos, insertionPoint)
                }
                writeParentContainer.splice(insertionPoint, bounds[1] - bounds[0], result);
                retbounds = [insertionPoint, insertionPoint + result.length];
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

/**
 * public interface for chunk resolution
 */
export const ChunkResolutionApplication = /* static class */ {
    /**
     * the original product has counter-intuitive behavior for put
     */
    applyPut(cont: WritableContainer, chunk: O<RequestedChunk>, itemDel: string, news: string, prep: VpcChunkPreposition, compatibility:boolean): void {
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

        chunk = this._rearrangeChunksToMatchOriginalProduct(chunk, compatibility)

        /* make parent objects */
        let resolved = new ResolvedChunk(cont, 0, cont.len());
        let current: O<RequestedChunk> = chunk;
        let isTop = true
        while (current) {
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
    applyModify(cont: WritableContainer, chunk: O<RequestedChunk>, itemDel: string, compatibility:boolean, fn: (s: string) => string) {
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
        this.applyPut(cont, chunk, itemDel, marker, VpcChunkPreposition.Into, compatibility)
        
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
        while (current && resolved) {
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
    applyDelete(cont: WritableContainer, chunk: RequestedChunk, itemDel: string, compatibility:boolean) {
        /* don't allow backwards bounds. only have to check the first one since
        there's a check in vpcVisitorMixin for recursive scopes. covered in tests. */
        checkThrow(!chunk || !chunk.hasBackwardsBounds(), "backwards bounds - don't allow delete item 3 to 2 of x.")

        if (chunk.granularity === VpcGranularity.Chars) {
            return this.applyPut(cont, chunk, itemDel, '', VpcChunkPreposition.Into, compatibility)
        }

        //~ this._rearrangeChunksToMatchOriginalProduct(chunk, compatibility)
        let resolved: O<ResolvedChunk> = new ResolvedChunk(cont, 0, cont.len());
        let current: O<RequestedChunk> = chunk;
        while (current && resolved) {
            if (!current.child) {
                break
            }
            resolved = ChunkResolution.doResolveOne(current, resolved, itemDel, '', VpcChunkPreposition.Into, false);
            current = current.child;
        }

        checkThrow(!current.last || current.first<=current.last, "we don't support backwards bounds")
        let allstart = Number.POSITIVE_INFINITY
        let allend = Number.NEGATIVE_INFINITY
        let isLastOfRange = true
        for (let i=current.last ?? current.first; i>=current.first; i--) {
            let tmp = current.getClone()
            tmp.first = i
            tmp.last = i
            let [start, end] = this._applyDeleteHelper(cont, itemDel, compatibility, tmp, isLastOfRange)
            cont.splice(start, end-start, '')
            isLastOfRange = false
            //~ allstart = Math.min(allstart, start)
            //~ allend = Math.max(allend, end)
        }
        
        


        {
            //~ let s = new WritableContainerSimpleFmtText()
            //~ s.setAll(cont.getRawString())
            //~ s.setAll(" a b c ")
            //~ s.setAll("a b c")
            //~ let table = ChunkResolution._getPositionsTable(s.getRawString(), ChunkResolution.getRegex(VpcGranularity.Words, ''), true);
            //~ let r = table.slice().reverse()
            //~ for (let index of r) {
                //~ s.splice(index, 0, '^')
            //~ }
            //~ console.log(s.getRawString())
            //~ console.log(s.getRawString())
        }
    },

    _applyDeleteHelper(cont: WritableContainer, delim: string, compatibility:boolean, current: RequestedChunk, isLastOfRange:boolean):[number, number] {
        let unf = cont.getRawString()
        if (!current.last) {
            current.last = current.first
        }
        current.first -= 1 /* to 0 based */
        current.last -= 1 /* to 0 based */

        let start:number
        let end:number
        let table = ChunkResolution._getPositionsTable(unf, current.granularity, delim);
        if (current.granularity === VpcGranularity.Words) {
            if (current.first === -1) {
                /* emulator confirms you can say word 0 of x */
                start = 0
                end = start
                while (end < table[0]) {
                    if (unf[end] === '\n') { break }
                    end++
                }
            } else if (current.first > table.length -1) {
                /* strip final whitespace */
                start = unf.length
                end = unf.length
                while(unf[start-1] === ' ') {
                    start--
                }
            } else if (current.first === table.length - 1) {
                /* this is a weird case-it deletes spaces both before and after */
                start = table[table.length - 1]
                end =table[table.length - 1]
                while (end < unf.length) {
                    if (unf[end] === '\n' && isLastOfRange) { break }
                    end++
                }
                if ((end >= unf.length -1)) {
                    while(unf[start-1] === ' ') {
                        start--
                    }
                }
                
            } else {
                start = table[current.first]
                end = start
                while (end < table[current.first + 1]) {
                    if (unf[end] === '\n') { break }
                    end++
                }
            }

        } else if (current.granularity === VpcGranularity.Items || current.granularity === VpcGranularity.Lines) {
            let activeChar = current.granularity === VpcGranularity.Items ? delim : '\n'
            if (current.first === -1) {
                /* emulator confirms you can say word 0 of x */
                if ((current.granularity === VpcGranularity.Items && unf.startsWith(activeChar)) || (current.granularity === VpcGranularity.Lines && unf.startsWith(activeChar))) {
                    start = 0
                    end = 1
                } else {
                    start = 0
                    end  =0
                }
            } else if (current.first === table.length) {
                start = 0
                end = 0
                //~ /* strip final whitespace */
                //~ start = unf.length
                //~ end = unf.length
                //~ while(unf[start-1] === activeChar) {
                    //~ start--
                //~ }
            } else if (current.first === table.length - 1) {
                /* this is a weird case-it deletes spaces both before and after */
                if (current.granularity === VpcGranularity.Items) {
                    start = table[table.length - 1]
                    end = unf.length
                    let a=0
                    while(unf[start-1] === activeChar) {
                        start--
                        a++
                        if (a>0) { break }
                    }
                } else {
                    start = table[table.length - 1]
                    end = unf.length
                }
            } else if (current.first > table.length -1) {
                start = 0
                end = 0
            } else {
                start = table[current.first]
                end = start
                while (end < table[current.first + 1]) {
                    //~ if (unf[end] === '\n') { break }
                    end++
                }
            }
        } else {
            checkThrowInternal(false, "unknown type")
        }

        return [start, end]
    },

    /**
     * count chunks, e.g.
     * 'put the number of words in x into y'
     */
    applyCount(sInput: string, itemDel: string, type: VpcGranularity, isPublicCall: boolean) {
        /* in the public interface, change behavior to match original product */
        let adjust = 0
        if (isPublicCall && sInput === '' && (type === VpcGranularity.Items || VpcGranularity.Lines)) {
            return 0;
        } else if (isPublicCall && type === VpcGranularity.Items && !sInput.includes(itemDel) && sInput.trim() === '') {
            return 0
        }  else if (isPublicCall && type === VpcGranularity.Lines && sInput.endsWith('\n')) {
            adjust = -1
        }   /* else if (isPublicCall && type === VpcGranularity.Items && sInput.startsWith(',')) {
            sInput = sInput.substr(1)
            if (!sInput) { return 1 }
        }  */ else if (isPublicCall && type === VpcGranularity.Items && sInput.trim().endsWith(',')) {
            adjust = -1
            if (!sInput) { return 1 }
        } 

        if (type === VpcGranularity.Chars) {
            return sInput.length + adjust;
        } else if (type === VpcGranularity.Items) {
            return ChunkResolution._getPositionsTable(sInput, type, itemDel).length + adjust;
        } else if (type === VpcGranularity.Lines) {
            return ChunkResolution._getPositionsTable(sInput, type, itemDel).length + adjust;
        } else if (type === VpcGranularity.Words) {
            return ChunkResolution._getPositionsTable(sInput, type, itemDel).length + adjust;
        } else {
            checkThrow(false, `5-|unknown chunk granularity ${type}`);
        }
    },



    

    /**
     * match the really weird behavior seen.
     * 1) first come, first serve, for each granularity
     * 2) regardless of order seen, sort in the order seen in enum VpcGranularity
     */
    _rearrangeChunksToMatchOriginalProduct(chunk:RequestedChunk, compat:boolean) {
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
        let lastKey = -1
        while (current) {
            let key = current.granularity
            if (current.sortFirst) {
                checkThrowInternal(current.granularity === VpcGranularity.Chars, '')
                key = max
            }

            /* unless we're in compat mode we'll only allow strict ordering */
            if (!compat) {
                checkThrow(key <= lastKey, longstr(`you can put something into char 1 of
                 word 1 of x, but you can't put something into word 1 of char 1 of x.
                The order must be char, word, item, line. To allow other orders, go to
                Object->Stack Info and turn on compatibility mode, but be aware that
                it will ignore your given order - line 2 of item 3 of x is confusingly
                interpreted to mean item 3 of line 2 of x. `))
                checkThrow(key < lastKey, longstr(`you can't put something into word 2 of
                word 1 of x. To allow this, go Object->Stack Info and turn on
                compatibility mode, be aware though that if you say something like
                put "" into word 2 of word 1 of x it will disregard the word 1 of x.`))
            }

            arr[key] = current
            current = current.child
            lastKey = key
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

    /** are bounds backwards? we sometimes support this */
    hasBackwardsBounds():boolean {
        return this.last !== undefined && this.last < this.first
    }
}

/**
 * a resolved chunk.
 */
export class ResolvedChunk {
    constructor(public container: ReadableContainer, public startPos: number, public endPos: number) {}
}
