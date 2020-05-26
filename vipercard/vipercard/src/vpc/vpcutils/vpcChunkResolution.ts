
/* auto */ import { ReadableContainer, WritableContainer } from './vpcUtils';
/* auto */ import { VpcChunkPreposition, VpcGranularity, checkThrow, checkThrowInternal } from './vpcEnums';
/* auto */ import { ChunkResolutionUtils, RequestedChunk, ResolvedChunk } from './vpcChunkResolutionUtils';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { ensureDefined } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, longstr } from './../../ui512/utils/util512';


/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/*
    we support:
    put char 3 to 5 of x into y (read)
    put x into char 3 to 5 of y (write)
    add 1 to char 3 to 5 of y (modify)
    delete char 3 to 5 of y (delete)
    set the textsize of char 3 to 5 of cd fld 1 to 12 (text)
    Note: chunks can also be applied to 'the selection'.
        it's a new container type, not a chunk.
            if it were a chunk, or if it were rewritten
            in rewrites to char selcharstart to selcharend of the selectedfield,
            it would be hard to support put "abc" into item 3 of the selection
        put char 3 to 5 of the selection into y (read)
        put x into char 3 to 5 of the selection (write)
        add 1 to char 3 to 5 of the selection, nyi
        delete char 3 to 5 of y (delete)
        set the textsize of the selectedchunk to 12 (done in visitor, RuleHUnaryPropertyGet looks ahead)
 */

/**
 * it turns out to be complicated to evaluate something like
 * put item x to y of myList into z,
 * to match all of the corner cases with the original product's behavior.
 * we use 500,000 tests in vpcTestScriptExtensiveChunk.ts to verify.
 * the original product is weird - e.g. order is ignored in puts/deletes,
 * items and lines behave subtly differently, and words have
 * tricky behavior around newlines.
 */

/**
 * public interface for chunk resolution
 */
export const ChunkResolution = /* static class */ {
    /**
     * the original product has counter-intuitive behavior for put
     * where order is ignored, and only one part for each
     * granularity is kept. item 2 of item 3 of === item 2 of.
     * see _rearrangeChunksToMatchOriginalProduct.
     */
    applyPut(
        cont: WritableContainer,
        chunk: O<RequestedChunk>,
        itemDel: string,
        newString: string,
        prep: VpcChunkPreposition,
        compat: boolean
    ) {
        if (!chunk) {
            /* don't use parent scopes,
            we might be inserting into a never-before-seen variable */
            let result: string;
            if (prep === VpcChunkPreposition.After) {
                let prevs = cont.isDefined() ? cont.getRawString() : '';
                result = prevs + newString;
            } else if (prep === VpcChunkPreposition.Before) {
                let prevs = cont.isDefined() ? cont.getRawString() : '';
                result = newString + prevs;
            } else if (prep === VpcChunkPreposition.Into) {
                result = newString;
            } else {
                checkThrow(false, `5+|unknown preposition ${prep}`);
            }

            cont.setAll(result);
            return;
        }

        /* compatibility */
        chunk = this._rearrangeChunksToMatchOriginalProduct(chunk, compat);
        checkThrow(itemDel !== '\n', "we haven't tested with an itemdel of newline");

        /* make parent objects */
        let resolved = new ResolvedChunk(cont, 0, cont.len());
        let current: O<RequestedChunk> = chunk;
        let isChildOfAddedText = false;
        while (current) {
            if (!current.child) {
                break;
            }

            /* narrow down the scope.
            it still might write text here;
            item 99 of x will still add commas. */
            let got = ChunkResolutionUtils.doResolveOne(
                current,
                resolved,
                itemDel,
                undefined,
                compat,
                VpcChunkPreposition.Into,
                true,
                isChildOfAddedText
            );

            resolved = ensureDefined(got[0], '');
            isChildOfAddedText = isChildOfAddedText || /* bool */ got[1];
            current = current.child;
        }

        /* insert the real text */
        ensureDefined(
            ChunkResolutionUtils.doResolveOne(current, resolved, itemDel, newString, compat, prep, true, isChildOfAddedText)[0],
            ''
        );
    },

    /**
     * used for 'add 2 to item 1 of x'
     * follows the same funky logic as put.
     */
    applyModify(cont: WritableContainer, chunk: O<RequestedChunk>, itemDel: string, compat: boolean, fn: (s: string) => string) {
        if (!chunk) {
            /* no chunk logic needed */
            let s = cont.getRawString();
            let news = fn(s);
            cont.splice(0, cont.len(), news);
            return;
        }

        /* it gets thrown off because it won't see the inserted text */
        checkThrow(cont['start'] === undefined && cont['end'] === undefined, "we don't yet support 'add 3 to item 1 of the selection' _RWContainerFldSelection_")

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
     * returns a ResolvedChunk, so you can use the bounds
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
        while (current && resolved) {
            /* resolved will be undefined if we ask for
            something non-existent like line 99 of x */
            resolved = ChunkResolutionUtils.doResolveOne(
                current,
                resolved,
                itemDel,
                '',
                compat,
                VpcChunkPreposition.Into,
                false,
                isChildOfAddedLine
            )[0];
            current = current.child;
        }

        return resolved;
    },

    /**
     * for convenience, returns an unformatted string
     */
    applyReadToString(cont: ReadableContainer, chunk: O<RequestedChunk>, itemDel: string): string {
        let resolved = this.applyRead(cont, chunk, itemDel);
        return resolved ? resolved.container.getRawString().substring(resolved.startPos, resolved.endPos) : '';
    },

    /**
     * find the deepest child
     */
    _getFinalChild(chunk: RequestedChunk) {
        let current: O<RequestedChunk> = chunk;
        while (current.child) {
            current = current.child;
        }

        return current;
    },

    /**
     * delete, which is not the same as `put "" into`
     */
    applyDelete(cont: WritableContainer, chunk: RequestedChunk, itemDel: string, compat: boolean) {
        /* don't allow backwards bounds. only have to check the first one since
        there's a check in vpcVisitorMixin for recursive scopes. */
        checkThrow(!chunk.hasBackwardsBounds(), "backwards bounds - don't allow delete item 3 to 2 of x.");
        checkThrow(itemDel !== '\n', "we haven't tested with an itemdel of newline");

        /* use same funky logic as put */
        chunk = this._rearrangeChunksToMatchOriginalProduct(chunk, compat);

        /* if the final child is a char, it's the one case where it is the same as put "" into */
        let finalChild = this._getFinalChild(chunk);
        if (finalChild.granularity === VpcGranularity.Chars) {
            return this.applyPut(cont, chunk, itemDel, '', VpcChunkPreposition.Into, compat);
        }

        /* we don't yet support deleting ranges.
            we tried doing:
                delete word 1 to 3 ->
                delete word 3; delete word 2; delete word 1
            and
                pretend to delete word 3, get bounds,
                pretend to delete word 2, get bounds,
                pretend to delete word 1, get bounds,
                then delete the min to max bounds
            and
                pretend to delete word 3 and get the rightmost bound
                pretend to delete word 1 and get the leftmost bound
                then delete everything in-between
            none of them seemed to 100% match original product
         */
        checkThrow(
            finalChild.ordinal !== undefined || finalChild.last === undefined || finalChild.first === finalChild.last,
            "we don't yet support deleting ranges"
        );
        checkThrow(
            finalChild.ordinal !== undefined || finalChild.last === undefined || finalChild.first <= finalChild.last,
            "we don't support backwards bounds"
        );

        /* first, narrow the scope */
        let resolved: O<ResolvedChunk> = new ResolvedChunk(cont, 0, cont.len());
        let current: O<RequestedChunk> = chunk;
        let isChildOfAddedLine = false; /* not used here */
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
                false /* not a write context; don't insert extra commas */,
                isChildOfAddedLine
            )[0];
            current = current.child;
            isChild = true;
        }

        /* if you delete something that isn't found, it is a no-op */
        if (!resolved) {
            return;
        }

        let txtFull = cont.getRawString();
        let txtNarrowed = txtFull.substring(resolved.startPos, resolved.endPos);
        let narrowedAndAfter = txtFull.substring(resolved.startPos);
        ChunkResolutionUtils.resolveOrdinal(txtNarrowed, itemDel, current);

        let startAndEnd: [number, number];
        if (current.granularity === VpcGranularity.Items || current.granularity === VpcGranularity.Lines) {
            startAndEnd = this._applyDeleteHelperItemsLines(
                txtNarrowed,
                itemDel,
                current.first - 1 /* one-based to 0 based */,
                current.granularity,
                narrowedAndAfter,
                txtFull,
                compat,
                isChild ? resolved.startPos : -1
            );
        } else if (current.granularity === VpcGranularity.Words) {
            startAndEnd = this._applyDeleteHelperWords(
                txtNarrowed,
                itemDel,
                current.first - 1 /* one-based to 0 based */,
                current.granularity,
                narrowedAndAfter,
                txtFull,
                compat,
                isChild ? resolved.startPos : -1
            );
        } else {
            checkThrowInternal(false, 'unknown type');
        }

        let [start, end] = startAndEnd;
        cont.splice(resolved.startPos + start, end - start, '');
    },

    /**
     * delete a word
     */
    _applyDeleteHelperWords(
        txtNarrowed: string,
        delim: string,
        currentPlace: number,
        granularity: VpcGranularity,
        narrowedAndAfter: string,
        txtFull: string,
        compat: boolean,
        parentStartPos: number
    ): [number, number] {
        let table = ChunkResolutionUtils._getPositionsTable(txtNarrowed, granularity, delim);
        let start = 0;
        let end = 0;
        if (currentPlace === -1) {
            /* emulator confirms you can say meaningfully say word 0 of x */
            start = 0;
            end = start;
            while (end < table[0]) {
                if (txtNarrowed[end] === '\n') {
                    break;
                }
                end++;
            }
        } else if (currentPlace > table.length - 1) {
            /* strip final whitespace */
            start = txtNarrowed.length;
            end = txtNarrowed.length;
            if (end === narrowedAndAfter.length) {
                /* special case only applies to the true end of the string */
                while (txtNarrowed[start - 1] === ' ') {
                    start--;
                }
            }
        } else if (currentPlace === table.length - 1) {
            /* this is a weird case-it deletes spaces both before and after */
            start = table[table.length - 1];
            end = table[table.length - 1];
            let sawReturn = false;
            while (end < txtNarrowed.length) {
                if (txtNarrowed[end] === '\n') {
                    sawReturn = true;
                    break;
                }
                end++;
            }

            /* use narrowedAndAfter.length not txtNarrowed.length here,
            this special case only applies to the true end of the string */
            if (end >= narrowedAndAfter.length - 1 && !sawReturn && txtNarrowed.length === narrowedAndAfter.length) {
                while (txtNarrowed[start - 1] === ' ') {
                    start--;
                }
            }
        } else {
            /* normal case in middle of the string */
            start = table[currentPlace];
            end = start;
            while (end < table[currentPlace + 1]) {
                if (txtNarrowed[end] === '\n') {
                    break;
                }
                end++;
            }
        }

        return [start, end];
    },

    /**
     * delete an item or line
     */
    _applyDeleteHelperItemsLines(
        txtNarrowed: string,
        delim: string,
        currentPlace: number,
        granularity: VpcGranularity,
        narrowedAndAfter: string,
        txtFull: string,
        compat: boolean,
        parentStartPos: number
    ): [number, number] {
        let table = ChunkResolutionUtils._getPositionsTable(txtNarrowed, granularity, delim);
        let start = 0;
        let end = 0;
        let activeChar = granularity === VpcGranularity.Items ? delim : '\n';
        if (
            granularity === VpcGranularity.Items &&
            currentPlace === 0 &&
            parentStartPos > 0 &&
            compat &&
            !txtNarrowed.includes(delim) &&
            txtFull[parentStartPos - 1] === '\n' &&
            (txtNarrowed.length ||
                /* is at end of string */
                parentStartPos + txtNarrowed.length === txtFull.length)
        ) {
            /* weird corner case: if you say delete item 1 of line 2
            and there is text in line 2 but no commas, we need to
            delete the entire line - it even deletes backwards */
            start = -1;
            end = txtNarrowed.length;
        } else if (currentPlace === -1) {
            /* emulator confirms you can say item 0 of x */
            if (txtNarrowed.startsWith(activeChar)) {
                start = 0;
                end = 1;
            } else {
                start = 0;
                end = 0;
            }
        } else if (currentPlace >= table.length) {
            start = 0;
            end = 0;
        } else if (currentPlace === table.length - 1) {
            /* this is a weird case-it might delete commas both before and after */
            /* and newlines are significant, even for an 'item'. */
            if (
                granularity === VpcGranularity.Items &&
                (txtNarrowed.length === narrowedAndAfter.length ||
                    (narrowedAndAfter[txtNarrowed.length] === '\n' && !txtNarrowed.endsWith(activeChar)))
            ) {
                start = table[table.length - 1];
                end = txtNarrowed.length;
                if (txtNarrowed[start - 1] === activeChar) {
                    start--;
                }
            } else {
                start = table[table.length - 1];
                end = txtNarrowed.length;
            }
        } else {
            /* normal case in the middle of the string */
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
     * match the weird behavior seen in original product.
     * 1) first come, first serve, for each granularity
     * 2) regardless of order seen, sort in the order seen in enum VpcGranularity
     */
    _rearrangeChunksToMatchOriginalProduct(chunk: RequestedChunk, compat: boolean) {
        if (!chunk.child) {
            return chunk;
        }

        /* flatten it! the given order does not matter!
        we'll use the fact that VpcGranularity enum numbers are already in order,
        and index them into a list */
        let max = VpcGranularity.__Max + 1;
        let arr = Util512.repeat(max, undefined as O<RequestedChunk>);

        /* remember that it's first come, first serve,
        so placing into the array intentionally overwrites what we saw before */
        let current: O<RequestedChunk> = chunk;
        let lastKey = -1;
        while (current) {
            let key = current.granularity;

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

        /* from list back into a tree */
        let newRoot: O<RequestedChunk>;
        let rebuild: O<RequestedChunk>;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]) {
                if (!rebuild) {
                    rebuild = arr[i];
                    newRoot = arr[i];
                } else {
                    rebuild.child = arr[i];
                    rebuild = arr[i];
                }
            }
        }

        /* be sure to overwrite the child here in case it used to have a child */
        if (rebuild) {
            rebuild.child = undefined;
        }

        return ensureDefined(newRoot, 'newRoot');
    }
};
