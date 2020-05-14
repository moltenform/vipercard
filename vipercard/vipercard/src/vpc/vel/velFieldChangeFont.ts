
/* auto */ import { VpcVal, VpcValS } from './../vpcutils/vpcVal';
/* auto */ import { SubstringStyleComplex } from './../vpcutils/vpcStyleComplex';
/* auto */ import { RequestedVelRef } from './../vpcutils/vpcRequestedReference';
/* auto */ import { PropAdjective, VpcElType, VpcGranularity, checkThrow, checkThrowNotifyMsg } from './../vpcutils/vpcEnums';
/* auto */ import { RequestedChunk } from './../vpcutils/vpcChunkResolutionInternal';
/* auto */ import { ChunkResolution } from './../vpcutils/vpcChunkResolution';
/* auto */ import { ReadableContainerField } from './velResolveContainer';
/* auto */ import { VpcElField } from './velField';
/* auto */ import { VpcElBase, VpcHandleLinkedVels } from './velBase';
/* auto */ import { O } from './../../ui512/utils/util512Base';
/* auto */ import { assertWarn } from './../../ui512/utils/util512Assert';
/* auto */ import { Util512, fitIntoInclusive, longstr } from './../../ui512/utils/util512';

/* (c) 2019 moltenform(Ben Fisher) */
/* Released under the GPLv3 license */

/**
 * apply changes when the user chooses something from the Font or Style menu
 */
export class VpcChangeSelectedFont {
    cbGetEditToolSelectedFldOrBtn: () => O<VpcElBase>;
    cbGetCurrentCardId: () => string;
    cbRunScript: (s: string) => void;

    //~ /**
    //~ * user is setting font from the Font or Style menu
    //~ * returns false if not handled
    //~ */
    //~ runFontMenuActionsIfApplicable(s: string) {
    //~ if (s.startsWith('mnuItemSetFontFace')) {
    //~ let v = s.substr('mnuItemSetFontFace'.length);
    //~ this.setFont(v, 'textfont');
    //~ return true;
    //~ } else if (s.startsWith('mnuItemSetFontSize')) {
    //~ let v = s.substr('mnuItemSetFontSize'.length);
    //~ this.setFont(v, 'textsize');
    //~ return true;
    //~ } else if (s.startsWith('mnuSetFontStyle')) {
    //~ let v = s.substr('mnuSetFontStyle'.length);
    //~ this.setFont(v, 'textstyle');
    //~ return true;
    //~ } else if (s.startsWith('mnuSetAlign')) {
    //~ let v = s.substr('mnuSetAlign'.length);
    //~ this.setAlign(v);
    //~ return true;
    //~ } else {
    //~ return false;
    //~ }
    //~ }

    //~ /**
    //~ * set alignment, throw if nothing to align
    //~ */
    //~ protected setAlign(v: string) {
    //~ let worked = this.setAlignImpl(v);
    //~ if (!worked) {
    //~ checkThrowNotifyMsg(false, 'U4|No selection found. Select a button or field.');
    //~ }
    //~ }

    //~ /**
    //~ * set alignment, return undefined if nothing to align
    //~ */
    //~ protected setAlignImpl(v: string) {
    //~ v = v.toLowerCase();
    //~ let vel = this.cbGetEditToolSelectedFldOrBtn();
    //~ let currentCardId = this.cbGetCurrentCardId()

    //~ if (vel) {
    //~ vel.setProp('textalign', VpcValS(v), currentCardId);
    //~ return true;
    //~ } else {
    //~ let chunksel = this.getActiveChunkSel();
    //~ if (chunksel) {
    //~ /* we don't yet support setting alignment on a per-paragraph basis */
    //~ chunksel[0].setProp('textalign', VpcValS(v), currentCardId);
    //~ return true;
    //~ }
    //~ }

    //~ return undefined;
    //~ }

    //~ /**
    //~ * set font, throw if nothing is selected
    //~ */
    //~ setFont(v: string, type: string) {
    //~ v = v.toLowerCase();
    //~ let vel = this.cbGetEditToolSelectedFldOrBtn();
    //~ if (vel) {
    //~ this.setFontBtnFld(vel, v, type);
    //~ } else if (this.getActiveChunkSel()) {
    //~ this.cbRunScript(`set the text${type} of the selection to "${v}"`)
    //~ } else {
    //~ checkThrowNotifyMsg(
    //~ false,
    //~ longstr(`U3|No selection found. Either select a
    //~ button or {{NEWLINE}}field, or use the browse tool to select a
    //~ few{{NEWLINE}} letters.`)
    //~ );
    //~ }
    //~ }

    //~ /**
    //~ * toggle style
    //~ * e.g. chose Bold, so go through and
    //~ * make everything that was bold to now be plain and vice versa.
    //~ */
    //~ protected toggleStyle(allStyle: string, v: string) {
    //~ if (v === 'plain') {
    //~ /* user is setting font to plain, so lose the other formatting */
    //~ return 'plain';
    //~ }

    //~ checkThrow(allStyle !== 'mixed', 'KP|did not expected to see "mixed".');
    //~ let styles = allStyle.split(',');
    //~ styles = styles.filter(s => s !== 'plain');
    //~ let foundIndex = styles.findIndex(s => s === v);
    //~ if (foundIndex === -1) {
    //~ /* desired style not there, add it */
    //~ styles.push(v);
    //~ } else {
    //~ /* desired style is there, remove it */
    //~ styles.splice(foundIndex, 1);
    //~ }

    //~ return styles.length ? styles.join(',') : 'plain';
    //~ }

    //~ /**
    //~ * get a selected chunk in a field
    //~ */
    //~ protected getActiveChunkSel(): O<[VpcElBase, number, number]> {
    //~ let vel = this.vci.getCurrentFocusVelField();
    //~ if (vel) {
    //~ /* note: get from focused, not vel, since it's more up to date? */
    //~ /* no, since we're acting on the vel, get everything from one for consistency */
    //~ let currentCardId = this.cbGetCurrentCardId()
    //~ let selcaret = fitIntoInclusive(vel.getN('selcaret'), 0, vel.getCardFmTxt(currentCardId).len());
    //~ let selend = fitIntoInclusive(vel.getN('selend'), 0, vel.getCardFmTxt(currentCardId).len());
    //~ if (selcaret !== selend) {
    //~ return [vel, Math.min(selcaret, selend), Math.max(selcaret, selend)];
    //~ }
    //~ }

    //~ return undefined;
    //~ }

    //~ /**
    //~ * set the font of a chunk of text
    //~ */
    //~ protected setFontSelText(chunksel: [VpcElBase, number, number], v: string, typeOfChange: string) {
    //~ let [vel, b1, b2] = chunksel;
    //~ let chunk = new RequestedChunk(b1);
    //~ chunk.last = b2;

    //~ /* adjust the range because vpc is both 1-based and inclusive */
    //~ chunk.first += 1;
    //~ chunk.type = VpcGranularity.Chars;
    //~ let velRef = new RequestedVelRef(VpcElType.Fld);
    //~ let idn = Util512.parseInt(vel.id);
    //~ checkThrow(idn, 'KO|non numeric id?', vel.id);
    //~ velRef.lookById = idn;

    //~ if (typeOfChange !== 'textstyle') {
    //~ /* setting a typeface or pt size, just set it everywhere */
    //~ this.vci.getOutside().SetProp(velRef, typeOfChange, VpcValS(v), chunk);
    //~ return true;
    //~ } else {
    //~ /* setting a style
    //~ do this character by character, because styles can differ
    //~ 1) if one of the letters was bold, setting the selection
    //~ to italic shouldn't lose the bold of that one
    //~ 2) besides, if we looked up current style of all the selection,
    //~ it might return 'mixed' and we wouldn't know how to flip */
    //~ assertWarn(chunk.first <= chunk.last, 'KN|', chunk.first, chunk.last);
    //~ for (let i = chunk.first; i <= chunk.last; i++) {
    //~ let subChunk = new RequestedChunk(i);
    //~ subChunk.first = i;
    //~ subChunk.last = i;
    //~ subChunk.type = VpcGranularity.Chars;
    //~ let curStyle = this.vci.getOutside().GetProp(velRef, typeOfChange, PropAdjective.Empty, subChunk).readAsString();

    //~ curStyle = this.toggleStyle(curStyle, v);
    //~ this.vci.getOutside().SetProp(velRef, typeOfChange, VpcValS(curStyle), subChunk);
    //~ }

    //~ return true;
    //~ }
    //~ }

    //~ /**
    //~ * set font of a vel
    //~ */
    //~ protected setFontBtnFld(vel: VpcElBase, v: string, typeOfChange: string) {
    //~ let currentCardId = this.cbGetCurrentCardId()
    //~ if (typeOfChange !== 'textstyle') {
    //~ vel.setProp(typeOfChange, VpcValS(v), currentCardId);
    //~ return true;
    //~ } else {
    //~ let curStyle = vel.getProp('textstyle', currentCardId).readAsString().toLowerCase();
    //~ curStyle = this.toggleStyle(curStyle, v);
    //~ vel.setProp('textstyle', VpcValS(curStyle), currentCardId);
    //~ return true;
    //~ }
    //~ }
}

export class VpcFontSpecialChunk {
    constructor(public vel: VpcElField) {}
    /**
     * chunk set, e.g. 'set the textstyle of char 2 to 4 of cd fld...'
     */
    specialSetPropChunkImpl(h: VpcHandleLinkedVels, prop: string, s: string, charstart: number, charend: number): void {
        let newTxt = this.vel.getCardFmTxt().getUnlockedCopy();
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

        this.vel.setCardFmTxt(newTxt, h);
    }

    /**
     * chunk get, e.g. 'get the textstyle of char 2 to 4 of cd fld...'
     */
    specialGetPropChunkImpl(prop: string, charstart: number, charend: number): string {
        let len = charend - charstart;
        if (prop === 'textstyle') {
            /* returns comma-delimited styles, or the string 'mixed' */
            let list = SubstringStyleComplex.getChunkTextStyle(
                this.vel.getCardFmTxt(),
                this.vel.getDefaultFontAsUi512(),
                charstart,
                len
            );

            return list.join(',');
        } else if (prop === 'textfont') {
            /* returns typeface name or the string 'mixed' */
            return SubstringStyleComplex.getChunkTextFace(
                this.vel.getCardFmTxt(),
                this.vel.getDefaultFontAsUi512(),
                charstart,
                len
            );
        } else if (prop === 'textsize') {
            /* as per spec this can return either an integer or the string 'mixed' */
            return SubstringStyleComplex.getChunkTextSize(
                this.vel.getCardFmTxt(),
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

        let unformatted = this.vel.getCardFmTxt().toUnformatted();
        newChunk.first = fitIntoInclusive(newChunk.first, 1, unformatted.length);

        /* we've already handled the formattedText.len() === 0 case in getChunkTextAttribute */
        let cont = new ReadableContainerField(this.vel, h);
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
