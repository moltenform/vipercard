
/* auto */ import { VpcVal, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { SubstringStyleComplex } from './../vpcutils/vpcStyleComplex';
/* auto */ import { VpcGranularity, checkThrow } from './../vpcutils/vpcEnums';
/* auto */ import { RequestedChunk } from './../vpcutils/vpcChunkResolutionUtils';
/* auto */ import { ChunkResolution } from './../vpcutils/vpcChunkResolution';
/* auto */ import { RWContainerField } from './velResolveContainer';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcHandleLinkedVels } from './velBase';
/* auto */ import { fitIntoInclusive, longstr } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * apply changes when the user chooses something from the Font or Style menu
 */
export class VpcFontSpecialChunk {
    constructor(public vel: VpcElField) {}
    /**
     * chunk set, e.g. 'set the textstyle of char 2 to 4 of cd fld...'
     */
    specialSetPropChunkImpl(h: VpcHandleLinkedVels, prop: string, s: string, charstart: number, charend: number): void {
        let newTxt = this.vel.getFmTxt().getUnlockedCopy();
        let len = charend - charstart;
        if (prop === 'textstyle') {
            let list = s.split(',').map(item => item.trim());
            SubstringStyleComplex.setChunkTextStyle(newTxt, this.vel.getDefaultFontAsUi512(), charstart, len, list);
        } else if (prop === 'textfont') {
            SubstringStyleComplex.setChunkTextFace(newTxt, this.vel.getDefaultFontAsUi512(), charstart, len, s);
        } else if (prop === 'textsize') {
            let n = VpcValS(s).readAsStrictInteger();
            SubstringStyleComplex.setChunkTextSize(newTxt, this.vel.getDefaultFontAsUi512(), charstart, len, n);
        } else {
            checkThrow(
                false,
                longstr(`4x|can only say 'set the (prop) of char 1 to 2'
                    for textstyle, textfont, or textsize`)
            );
        }

        this.vel.setFmTxt(newTxt, h);
    }

    /**
     * chunk get, e.g. 'get the textstyle of char 2 to 4 of cd fld...'
     */
    specialGetPropChunkImpl(prop: string, charstart: number, charend: number): string {
        let len = charend - charstart;
        if (prop === 'textstyle') {
            /* returns comma-delimited styles, or the string 'mixed' */
            let list = SubstringStyleComplex.getChunkTextStyle(
                this.vel.getFmTxt(),
                this.vel.getDefaultFontAsUi512(),
                charstart,
                len
            );

            return list.join(',');
        } else if (prop === 'textfont') {
            /* returns typeface name or the string 'mixed' */
            return SubstringStyleComplex.getChunkTextFace(
                this.vel.getFmTxt(),
                this.vel.getDefaultFontAsUi512(),
                charstart,
                len
            );
        } else if (prop === 'textsize') {
            /* as per spec this can return either an integer or the string 'mixed' */
            return SubstringStyleComplex.getChunkTextSize(
                this.vel.getFmTxt(),
                this.vel.getDefaultFontAsUi512(),
                charstart,
                len
            ).toString();
        } else {
            checkThrow(
                false,
                longstr(`4w|can only say 'get the (prop) of char 1 to 2'
                    for textstyle, textfont, or textsize`)
            );
        }
    }

    /**
     * when you say set the textstyle of char 999 to 1000...
     * how do we respond when outside content length
     */
    protected resolveChunkBounds(h: VpcHandleLinkedVels, chunk: RequestedChunk, itemDel: string) {
        let newChunk = chunk.getClone();
        if (
            newChunk.granularity === VpcGranularity.Chars &&
            !newChunk.ordinal &&
            newChunk.last !== undefined &&
            newChunk.last < newChunk.first
        ) {
            /* for consistency with emulator, interesting behavior for negative intervals */
            newChunk.first = newChunk.first - 1;
            newChunk.last = newChunk.first + 1;
        }

        let unformatted = this.vel.getFmTxt().toUnformatted();
        newChunk.first = fitIntoInclusive(newChunk.first, 1, unformatted.length);

        /* we've already handled the formattedText.len() === 0 case in getChunkTextAttribute */
        let cont = new RWContainerField(this.vel, h);
        let bounds = ChunkResolution.applyRead(cont, chunk, itemDel);
        return bounds ? [bounds.startPos, bounds.endPos] : [0, 0];
    }

    /**
     * chunk set, e.g. 'set the textstyle of char 2 to 4 of cd fld...'
     */
    specialSetPropChunk(h: VpcHandleLinkedVels, prop: string, chunk: RequestedChunk, val: VpcVal, itemDel: string) {
        let [start, end] = this.resolveChunkBounds(h, chunk, itemDel);
        return this.specialSetPropChunkImpl(h, prop, val.readAsString(), start, end);
    }

    /**
     * chunk get, e.g. 'get the textstyle of char 2 to 4 of cd fld...'
     */
    specialGetPropChunk(h: VpcHandleLinkedVels, prop: string, chunk: RequestedChunk, itemDel: string): VpcVal {
        let [start, end] = this.resolveChunkBounds(h, chunk, itemDel);
        return VpcValS(this.specialGetPropChunkImpl(prop, start, end));
    }
}
