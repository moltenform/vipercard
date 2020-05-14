
/* auto */ import { ReadableContainer, WritableContainer } from './vpcUtils';
/* auto */ import { VpcChunkPreposition, VpcGranularity, checkThrow, checkThrowInternal } from './vpcEnums';
/* auto */ import { ChunkResolutionUtils, RequestedChunk, ResolvedChunk } from './vpcChunkResolutionUtils';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { ensureDefined } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, ValHolder, longstr } from './../../ui512/utils/util512';

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
 */

/**
 * public interface for chunk resolution
 */
export const ChunkResolution = /* static class */ {
    /**
     * the original product has counter-intuitive behavior for put
     */
    applyPut(
        cont: WritableContainer,
        chunk: O<RequestedChunk>,
        itemDel: string,
        news: string,
        prep: VpcChunkPreposition,
        compat: boolean
    ): void {
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

        checkThrow(itemDel !== '\n', "we haven't tested with an itemdel of newline");
        chunk = this._rearrangeChunksToMatchOriginalProduct(chunk, compat);

        /* make parent objects */
        let resolved = new ResolvedChunk(cont, 0, cont.len());
        let current: O<RequestedChunk> = chunk;
        let isTop = true;
        let isChildOfAddedLine = false;
        while (current) {
            if (current.child) {
                /* narrow it down */
                let addedExtra = new ValHolder<boolean>(false);
                resolved = ensureDefined(
                    ChunkResolutionUtils.doResolveOne(
                        current,
                        resolved,
                        itemDel,
                        undefined,
                        compat,
                        VpcChunkPreposition.Into,
                        true,
                        isChildOfAddedLine,
                        true,
                        addedExtra
                    ),
                    ''
                );
                if (addedExtra.val) {
                    isChildOfAddedLine = true;
                }
            } else {
                /* insert the real text */
                resolved = ensureDefined(
                    ChunkResolutionUtils.doResolveOne(
                        current,
                        resolved,
                        itemDel,
                        news,
                        compat,
                        prep,
                        true,
                        isChildOfAddedLine,
                        isTop
                    ),
                    ''
                );
            }

            isTop = false;
            current = current.child;
        }
    },

    /**
     * warning: follows the same funky logic as put.
     */
    applyModify(cont: WritableContainer, chunk: O<RequestedChunk>, itemDel: string, compat: boolean, fn: (s: string) => string) {
        if (!chunk) {
            /* handle separately for better perf */
            let s = cont.getRawString();
            let news = fn(s);
            cont.splice(0, cont.len(), news);
            return;
        }

        /* haven't tested this, note that newline is sometimes a special char even for items */
        checkThrow(itemDel !== '\n', "we haven't tested with an itemdel of newline");

        /* use a sentinel value to ensure we get the same results as a "put" */
        let marker = '\x01\x01~~internalvpcmarker~~\x01\x01';
        let unformatted = cont.getRawString();
        checkThrow(!unformatted.includes(marker), 'cannot contain the string ' + marker);
        this.applyPut(cont, chunk, itemDel, marker, VpcChunkPreposition.Into, compat);

        /* now we look at the results and see where it got put! */
        let results = cont.getRawString();
        let index = results.indexOf(marker);
        checkThrow(index >= 0, 'applyModify did not find marker');

        if (results.length - marker.length > unformatted.length) {
            /* the case where we had to insert commas and stuff afterwards */
            let newTxt = fn('');
            cont.splice(index, marker.length, newTxt);
        } else {
            /* go back to the original string and retrieve what was there */
            let targetLength = unformatted.length - (results.length - marker.length);
            let sourceText = unformatted.slice(index, index + targetLength) ?? '';
            let newTxt = fn(sourceText);
            cont.splice(index, marker.length, newTxt);
        }
    },

    /**
     * returns a ResolvedChunk, so you can use the bounds for things
     */
    applyRead(cont: ReadableContainer, chunk: O<RequestedChunk>, itemDel: string): O<ResolvedChunk> {
        /* make parent objects */
        let resolved: O<ResolvedChunk> = new ResolvedChunk(cont, 0, cont.len());
        if (!chunk) {
            return resolved;
        }

        let current: O<RequestedChunk> = chunk;
        let compat = true; /* doesn't matter for reads */
        let isChildOfAddedLine = false; /* doesn't matter for reads */
        let okToAppend = true;
        while (current && resolved) {
            resolved = ChunkResolutionUtils.doResolveOne(
                current,
                resolved,
                itemDel,
                '',
                compat,
                VpcChunkPreposition.Into,
                false,
                isChildOfAddedLine,
                okToAppend
            );
            current = current.child;
        }

        return resolved;
    },

    /**
     * helper that returns an unformatted string
     */
    applyReadToString(cont: ReadableContainer, chunk: O<RequestedChunk>, itemDel: string): string {
        let resolved = this.applyRead(cont, chunk, itemDel);
        return resolved ? resolved.container.getRawString().substring(resolved.startPos, resolved.endPos) : '';
    },

    /**
     * delete, which is a bit different from `put "" into`
     */
    applyDelete(cont: WritableContainer, chunk: RequestedChunk, itemDel: string, compat: boolean) {
        /* don't allow backwards bounds. only have to check the first one since
        there's a check in vpcVisitorMixin for recursive scopes. covered in tests. */
        checkThrow(!chunk.hasBackwardsBounds(), "backwards bounds - don't allow delete item 3 to 2 of x.");
        checkThrow(itemDel !== '\n', "we haven't tested with an itemdel of newline");

        if (chunk.granularity === VpcGranularity.Chars) {
            return this.applyPut(cont, chunk, itemDel, '', VpcChunkPreposition.Into, compat);
        }

        chunk = this._rearrangeChunksToMatchOriginalProduct(chunk, compat);
        let resolved: O<ResolvedChunk> = new ResolvedChunk(cont, 0, cont.len());
        let current: O<RequestedChunk> = chunk;
        let isChildOfAddedLine = false; /* doesn't matter for reads */
        let okToAppend = true;
        let isChild = false;
        while (current && resolved) {
            if (!current.child) {
                break;
            }

            resolved = ChunkResolutionUtils.doResolveOne(
                current,
                resolved,
                itemDel,
                '',
                compat,
                VpcChunkPreposition.Into,
                false,
                isChildOfAddedLine,
                okToAppend
            );
            current = current.child;
            isChild = true;
        }

        checkThrow(!current.last || current.first === current.last, "we don't yet support deleting ranges");
        checkThrow(!current.last || current.first <= current.last, "we don't support backwards bounds");
        if (!resolved) {
            /* delete something that isn't found is a no-op */
            return;
        }

        /*
        we don't yet support deleting ranges.
        we tried doing:
            delete word 1 to 3 === delete word 3; delete word 2; delete word 1
            and
            pretend to delete word 3, get bounds, pretend to delete word 2, get bounds, pretend to delete word 1,
            get bounds, then delete the min to max bounds
            and
            delete word 1 to 3
                pretend to delete word 3 and get the rightmost bound
                pretend to delete word 1 and get the leftmost bound
                then delete everything in-between
        */

        let isLastOfRange = true;
        let unfFull = cont.getRawString();
        let unf = unfFull.substring(resolved.startPos, resolved.endPos);
        let unfAndAfter = unfFull.substring(resolved.startPos);
        {
            isLastOfRange = true;
            let startAndEnd: [number, number];
            if (current.granularity === VpcGranularity.Items || current.granularity === VpcGranularity.Lines) {
                startAndEnd = this._applyDeleteHelperItemsLines(
                    unf,
                    itemDel,
                    compat,
                    current.first - 1 /* one-based to 0 based */,
                    current.granularity,
                    isLastOfRange,
                    unfAndAfter,
                    unfFull,
                    isChild ? resolved.startPos : -1
                );
            } else if (current.granularity === VpcGranularity.Words) {
                startAndEnd = this._applyDeleteHelperWords(
                    unf,
                    itemDel,
                    compat,
                    current.first - 1 /* one-based to 0 based */,
                    current.granularity,
                    isLastOfRange,
                    unfAndAfter,
                    unfFull,
                    isChild ? resolved.startPos : -1
                );
            } else {
                checkThrowInternal(false, 'unknown type');
            }

            let [start, end] = startAndEnd;
            cont.splice(resolved.startPos + start, end - start, '');
        }
    },

    _applyDeleteHelperWords(
        unf: string,
        delim: string,
        compat: boolean,
        currentPlace: number,
        granularity: VpcGranularity,
        isLastOfRange: boolean,
        unfAndAfter: string,
        unfFull: string,
        parentStartPos: number
    ): [number, number] {
        let table = ChunkResolutionUtils._getPositionsTable(unf, granularity, delim);
        let start = 0,
            end = 0;
        if (currentPlace === -1) {
            /* emulator confirms you can say word 0 of x */
            start = 0;
            end = start;
            while (end < table[0]) {
                if (unf[end] === '\n') {
                    break;
                }
                end++;
            }
        } else if (currentPlace > table.length - 1) {
            /* strip final whitespace */
            start = unf.length;
            end = unf.length;
            if (end === unfAndAfter.length) {
                /*
            this special case only applies to the true end of the string */
                while (unf[start - 1] === ' ') {
                    start--;
                }
            }
        } else if (currentPlace === table.length - 1) {
            /* this is a weird case-it deletes spaces both before and after */
            start = table[table.length - 1];
            end = table[table.length - 1];
            let sawReturn = false;
            while (end < unf.length) {
                if (unf[end] === '\n' && isLastOfRange) {
                    sawReturn = true;
                    break;
                }
                end++;
            }
            /* use unfAndAfter.length not unf.length here,
            this special case only applies to the true end of the string */
            if (end >= unfAndAfter.length - 1 && !sawReturn && unf.length === unfAndAfter.length) {
                while (unf[start - 1] === ' ') {
                    start--;
                }
            }
        } else {
            start = table[currentPlace];
            end = start;
            while (end < table[currentPlace + 1]) {
                if (unf[end] === '\n') {
                    break;
                }
                end++;
            }
        }

        return [start, end];
    },

    _applyDeleteHelperItemsLines(
        unf: string,
        delim: string,
        compat: boolean,
        currentPlace: number,
        granularity: VpcGranularity,
        isLastOfRange: boolean,
        unfAndAfter: string,
        unfFull: string,
        parentStartPos: number
    ): [number, number] {
        let table = ChunkResolutionUtils._getPositionsTable(unf, granularity, delim);
        let start = 0,
            end = 0;
        let activeChar = granularity === VpcGranularity.Items ? delim : '\n';
        if (
            granularity === VpcGranularity.Items &&
            currentPlace === 0 &&
            parentStartPos > 0 &&
            !unf.includes(delim) &&
            unfFull[parentStartPos - 1] === '\n' &&
            (unf.length ||
                /* is at end of string */
                parentStartPos + unf.length === unfFull.length)
        ) {
            /* weird corner case: delete more than normal - note it deletes backwards */
            start = -1;
            end = unf.length;
        } else if (currentPlace === -1) {
            /* emulator confirms you can say word 0 of x */
            if (
                (granularity === VpcGranularity.Items && unf.startsWith(activeChar)) ||
                (granularity === VpcGranularity.Lines && unf.startsWith(activeChar))
            ) {
                start = 0;
                end = 1;
            } else {
                start = 0;
                end = 0;
            }
        } else if (currentPlace === table.length) {
            start = 0;
            end = 0;
        } else if (currentPlace === table.length - 1) {
            /* this is a weird case-it deletes commas both before and after */
            if (
                granularity === VpcGranularity.Items &&
                (unf.length === unfAndAfter.length || (unfAndAfter[unf.length] === '\n' && !unf.endsWith(activeChar)))
            ) {
                start = table[table.length - 1];
                end = unf.length;
                let a = 0;
                while (unf[start - 1] === activeChar) {
                    start--;
                    a++;
                    if (a > 0) {
                        break;
                    }
                }
            } else {
                start = table[table.length - 1];
                end = unf.length;
            }
        } else if (currentPlace > table.length - 1) {
            start = 0;
            end = 0;
        } else {
            start = table[currentPlace];
            end = start;
            while (end < table[currentPlace + 1]) {
                end++;
            }
        }

        return [start, end];
    },

    /**
     * count chunks, e.g.
     * 'put the number of words in x into y'
     */
    applyCount(sInput: string, itemDel: string, type: VpcGranularity, isPublicCall: boolean) {
        return ChunkResolutionUtils.applyCount(sInput, itemDel, type, isPublicCall);
    },

    /**
     * match the really weird behavior seen.
     * 1) first come, first serve, for each granularity
     * 2) regardless of order seen, sort in the order seen in enum VpcGranularity
     */
    _rearrangeChunksToMatchOriginalProduct(chunk: RequestedChunk, compat: boolean) {
        /* simple case */
        if (!chunk.child) {
            return chunk;
        }

        /* flatten it! the given order does not matter!!!
        we'll helpfully use the fact that VpcGranularity #s are already in order,
        and index them into a list*/
        let max = VpcGranularity.__Max + 1;
        let arr = Util512.repeat(max, undefined as O<RequestedChunk>);
        /* remember that it's first come, first serve */
        let current: O<RequestedChunk> = chunk;
        let lastKey = -1;
        while (current) {
            let key = current.granularity;
            if (current.sortFirst) {
                checkThrowInternal(current.granularity === VpcGranularity.Chars, '');
                key = max;
            }

            /* unless we're in compat mode we'll only allow strict ordering */
            if (!compat) {
                checkThrow(
                    lastKey === -1 || key <= lastKey,
                    longstr(`you can put something into char 1 of
                 word 1 of x, but you can't put something into word 1 of char 1 of x.
                The order must be char, word, item, line. To allow other orders, go to
                Object->Stack Info and turn on compatibility mode, but be aware that
                it will ignore your given order - line 2 of item 3 of x is confusingly
                interpreted to mean item 3 of line 2 of x. `)
                );
                checkThrow(
                    lastKey === -1 || key < lastKey,
                    longstr(`you can't put something into word 2 of
                word 1 of x. To allow this, go Object->Stack Info and turn on
                compatibility mode, be aware though that if you say something like
                put "" into word 2 of word 1 of x it will disregard the word 1 of x.`)
                );
            }

            arr[key] = current;
            current = current.child;
            lastKey = key;
        }

        /* reverse it so that higher ones are first */
        arr.reverse();

        let ret: O<RequestedChunk>;
        let currentBuild: O<RequestedChunk>;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]) {
                if (!currentBuild) {
                    currentBuild = arr[i];
                    ret = arr[i];
                } else {
                    currentBuild.child = arr[i];
                    currentBuild = arr[i];
                }
            }
        }

        /* be sure to overwrite the child here in case it used to have a child */
        if (currentBuild) {
            currentBuild.child = undefined;
        }

        return ensureDefined(ret, 'chunk dissapeared');
    }
};
